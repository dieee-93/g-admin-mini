// PredictiveInventory.ts - Intelligent inventory management with ML-powered predictions
// Automates reordering, optimizes stock levels, and prevents stockouts

import { mlEngine } from '../core/MLEngine';
import type { ForecastResult } from '../core/MLEngine';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';
import { offlineSync } from '@/lib/offline';

// ===== INTERFACES =====

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  costPerUnit: number;
  supplierId?: string;
  supplierName?: string;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  safetyStock: number;
  leadTimeDays: number;
  shelfLifeDays?: number;
  isActive: boolean;
  lastUpdated: number;
}

export interface PredictiveMetrics {
  predictedDemand: number;
  optimizedReorderPoint: number;
  optimizedReorderQuantity: number;
  stockoutRisk: number;
  overstockRisk: number;
  recommendedAction: 'order_now' | 'order_soon' | 'monitor' | 'reduce_orders';
  daysUntilStockout?: number;
  confidenceScore: number;
  seasonalFactor: number;
  trendFactor: number;
}

export interface ReorderRecommendation {
  itemId: string;
  itemName: string;
  currentStock: number;
  predictedDemand: number;
  recommendedOrderQuantity: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  estimatedCost: number;
  supplierId?: string;
  expectedDelivery?: number;
  riskFactors: string[];
  alternatives?: Array<{
    itemId: string;
    name: string;
    substitutionRatio: number;
  }>;
}

export interface InventoryOptimization {
  totalItems: number;
  itemsNeedingAttention: number;
  potentialSavings: number;
  stockoutRisk: number;
  overstockValue: number;
  recommendations: ReorderRecommendation[];
  optimizationScore: number;
  lastUpdated: number;
}

// ===== PREDICTIVE INVENTORY MANAGER =====

export class PredictiveInventoryManager {
  private static instance: PredictiveInventoryManager;
  private items = new Map<string, InventoryItem>();
  private metrics = new Map<string, PredictiveMetrics>();
  private recommendations: ReorderRecommendation[] = [];
  private isProcessing = false;
  private lastOptimization = 0;
  private optimizationInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeEventListeners();
    this.startOptimizationLoop();
  }

  public static getInstance(): PredictiveInventoryManager {
    if (!PredictiveInventoryManager.instance) {
      PredictiveInventoryManager.instance = new PredictiveInventoryManager();
    }
    return PredictiveInventoryManager.instance;
  }

  /**
   * Initialize event listeners for inventory updates
   */
  private initializeEventListeners(): void {
    // Listen for inventory changes
    EventBus.on(RestaurantEvents.STOCK_ADJUSTED, async (event) => {
      await this.updateItemStock(event.payload);
    });

    // Listen for stock low events
    EventBus.on(RestaurantEvents.STOCK_LOW, async (event) => {
      await this.handleStockLowEvent(event.payload);
    });

    // Listen for new orders to update demand patterns
    EventBus.on(RestaurantEvents.ORDER_PLACED, async (event) => {
      await this.updateDemandFromOrder(event.payload);
    });
  }

  /**
   * Start the optimization loop
   */
  private startOptimizationLoop(): void {
    // Run optimization every 4 hours
    this.optimizationInterval = setInterval(() => {
      this.runOptimization();
    }, 4 * 60 * 60 * 1000);

    // Initial optimization after 30 seconds
    setTimeout(() => {
      this.runOptimization();
    }, 30000);
  }

  /**
   * Add or update an inventory item
   */
  public addItem(item: InventoryItem): void {
    this.items.set(item.id, { ...item, lastUpdated: Date.now() });
    
    // Trigger optimization for this item
    this.optimizeItem(item.id);
  }

  /**
   * Update item stock level
   */
  private async updateItemStock(stockData: unknown): Promise<void> {
    const item = this.items.get(stockData.itemId);
    if (!item) return;

    const previousStock = item.currentStock;
    item.currentStock = stockData.currentStock;
    item.lastUpdated = Date.now();

    // Check if we need to trigger reorder recommendations
    if (previousStock > item.reorderPoint && item.currentStock <= item.reorderPoint) {
      await this.generateReorderRecommendation(item.id);
    }

    // Update predictive metrics
    await this.updatePredictiveMetrics(item.id);
  }

  /**
   * Handle stock low events
   */
  private async handleStockLowEvent(stockData: unknown): Promise<void> {
    await this.generateReorderRecommendation(stockData.itemId);
  }

  /**
   * Update demand patterns from orders
   */
  private async updateDemandFromOrder(orderData: unknown): Promise<void> {
    if (!orderData.items) return;

    for (const orderItem of orderData.items) {
      const item = this.items.get(orderItem.productId);
      if (item) {
        // Update stock (assuming ingredients/materials are deducted)
        const usageRate = this.calculateUsageRate(orderItem.productId);
        const materialUsage = orderItem.quantity * usageRate;
        
        if (materialUsage > 0) {
          item.currentStock = Math.max(0, item.currentStock - materialUsage);
          item.lastUpdated = Date.now();
          
          await this.updatePredictiveMetrics(item.id);
        }
      }
    }
  }

  /**
   * Calculate usage rate for a product (simplified)
   */
  private calculateUsageRate(productId: string): number {
    // This would typically come from recipe data
    // For now, return a simple estimate
    const baseUsage = new Map([
      ['flour', 0.2],
      ['meat', 0.15],
      ['vegetables', 0.1],
      ['dairy', 0.05]
    ]);

    // Simple heuristic based on product name/category
    for (const [category, rate] of baseUsage.entries()) {
      if (productId.toLowerCase().includes(category)) {
        return rate;
      }
    }

    return 0.05; // Default 5% usage rate
  }

  /**
   * Update predictive metrics for an item using ML forecasting
   */
  private async updatePredictiveMetrics(itemId: string): Promise<void> {
    const item = this.items.get(itemId);
    if (!item) return;

    try {
      // Get demand forecast from ML engine
      const demandForecast = await mlEngine.getInventoryForecast(itemId, 14);
      const currentInventoryForecast = await mlEngine.getInventoryForecast(`inventory_${itemId}`, 7);

      // Calculate predictive metrics
      const metrics = this.calculatePredictiveMetrics(item, demandForecast, currentInventoryForecast);
      this.metrics.set(itemId, metrics);

      // Check if immediate action is needed
      if (metrics.recommendedAction === 'order_now') {
        await this.generateReorderRecommendation(itemId);
      }

    } catch (error) {
      console.warn(`Failed to update predictive metrics for ${itemId}:`, error);
      
      // Fallback to basic metrics
      const basicMetrics = this.calculateBasicMetrics(item);
      this.metrics.set(itemId, basicMetrics);
    }
  }

  /**
   * Calculate predictive metrics using ML forecasts
   */
  private calculatePredictiveMetrics(
    item: InventoryItem,
    demandForecast: ForecastResult,
    inventoryForecast: ForecastResult
  ): PredictiveMetrics {
    // Average predicted demand over next 7 days
    const predictedDemand = demandForecast.predictions
      .slice(0, 7)
      .reduce((sum, pred) => sum + pred.value, 0);

    // Calculate seasonal and trend factors
    const seasonalFactor = demandForecast.metadata.seasonality ? 1.2 : 1.0;
    const trendFactor = demandForecast.metadata.trend === 'increasing' ? 1.1 : 
                       demandForecast.metadata.trend === 'decreasing' ? 0.9 : 1.0;

    // Calculate optimal reorder point considering lead time and variability
    const leadTimeDemand = predictedDemand * (item.leadTimeDays / 7);
    const demandVariability = demandForecast.metadata.volatility || 0.2;
    const optimizedReorderPoint = Math.ceil(
      leadTimeDemand + (item.safetyStock * (1 + demandVariability))
    );

    // Calculate optimal reorder quantity (Economic Order Quantity approximation)
    const holdingCost = item.costPerUnit * 0.2; // Assume 20% holding cost
    const orderCost = 50; // Estimated order cost
    const annualDemand = predictedDemand * 52; // Extrapolate to annual
    const eoq = Math.ceil(Math.sqrt((2 * annualDemand * orderCost) / holdingCost));
    
    // Adjust for constraints
    const optimizedReorderQuantity = Math.min(
      eoq,
      item.maxStockLevel - item.currentStock,
      Math.max(item.minStockLevel, predictedDemand * 2) // At least 2 weeks of demand
    );

    // Calculate risk scores
    const daysUntilStockout = item.currentStock > 0 ? 
      Math.floor(item.currentStock / (predictedDemand / 7)) : 0;
    
    const stockoutRisk = Math.min(1, Math.max(0, 
      (optimizedReorderPoint - item.currentStock) / optimizedReorderPoint
    ));
    
    const overstockRisk = Math.min(1, Math.max(0,
      (item.currentStock - item.maxStockLevel) / item.maxStockLevel
    ));

    // Determine recommended action
    let recommendedAction: PredictiveMetrics['recommendedAction'] = 'monitor';
    
    if (item.currentStock <= optimizedReorderPoint) {
      recommendedAction = daysUntilStockout <= 2 ? 'order_now' : 'order_soon';
    } else if (overstockRisk > 0.2) {
      recommendedAction = 'reduce_orders';
    }

    return {
      predictedDemand,
      optimizedReorderPoint,
      optimizedReorderQuantity,
      stockoutRisk,
      overstockRisk,
      recommendedAction,
      daysUntilStockout: daysUntilStockout > 0 ? daysUntilStockout : undefined,
      confidenceScore: demandForecast.accuracy,
      seasonalFactor,
      trendFactor
    };
  }

  /**
   * Calculate basic metrics when ML forecasting is not available
   */
  private calculateBasicMetrics(item: InventoryItem): PredictiveMetrics {
    // Simple heuristics based on current data
    const estimatedDemand = Math.max(1, (item.maxStockLevel - item.minStockLevel) / 7);
    const daysUntilStockout = Math.floor(item.currentStock / estimatedDemand);
    
    return {
      predictedDemand: estimatedDemand * 7,
      optimizedReorderPoint: item.reorderPoint,
      optimizedReorderQuantity: item.maxStockLevel - item.currentStock,
      stockoutRisk: item.currentStock <= item.reorderPoint ? 0.8 : 0.2,
      overstockRisk: item.currentStock > item.maxStockLevel ? 0.6 : 0.1,
      recommendedAction: item.currentStock <= item.reorderPoint ? 'order_soon' : 'monitor',
      daysUntilStockout: daysUntilStockout > 0 ? daysUntilStockout : undefined,
      confidenceScore: 0.6, // Lower confidence for basic metrics
      seasonalFactor: 1.0,
      trendFactor: 1.0
    };
  }

  /**
   * Generate reorder recommendation for an item
   */
  private async generateReorderRecommendation(itemId: string): Promise<void> {
    const item = this.items.get(itemId);
    const metrics = this.metrics.get(itemId);
    
    if (!item) return;
    
    const itemMetrics = metrics || this.calculateBasicMetrics(item);
    
    // Determine urgency
    let urgency: ReorderRecommendation['urgency'] = 'low';
    const daysUntilStockout = itemMetrics.daysUntilStockout || 999;
    
    if (daysUntilStockout <= 1 || item.currentStock <= 0) {
      urgency = 'critical';
    } else if (daysUntilStockout <= 3 || itemMetrics.stockoutRisk > 0.7) {
      urgency = 'high';
    } else if (daysUntilStockout <= 7 || itemMetrics.stockoutRisk > 0.4) {
      urgency = 'medium';
    }

    // Calculate risk factors
    const riskFactors: string[] = [];
    if (itemMetrics.stockoutRisk > 0.5) riskFactors.push('High stockout risk');
    if (item.shelfLifeDays && item.shelfLifeDays < 7) riskFactors.push('Short shelf life');
    if (item.leadTimeDays > 7) riskFactors.push('Long lead time');
    if (itemMetrics.trendFactor > 1.05) riskFactors.push('Increasing demand trend');
    if (itemMetrics.seasonalFactor > 1.1) riskFactors.push('Seasonal demand spike');

    // Generate reason
    let reason = `Current stock (${item.currentStock} ${item.unit}) is `;
    if (urgency === 'critical') {
      reason += `critically low. Immediate ordering required to avoid stockout.`;
    } else {
      reason += `below optimal levels. Predicted demand: ${Math.round(itemMetrics.predictedDemand)} ${item.unit} over next 7 days.`;
    }

    const recommendation: ReorderRecommendation = {
      itemId: item.id,
      itemName: item.name,
      currentStock: item.currentStock,
      predictedDemand: itemMetrics.predictedDemand,
      recommendedOrderQuantity: itemMetrics.optimizedReorderQuantity,
      urgency,
      reason,
      estimatedCost: itemMetrics.optimizedReorderQuantity * item.costPerUnit,
      supplierId: item.supplierId,
      expectedDelivery: Date.now() + (item.leadTimeDays * 24 * 60 * 60 * 1000),
      riskFactors,
      alternatives: this.findAlternatives(item.id)
    };

    // Add or update recommendation
    const existingIndex = this.recommendations.findIndex(r => r.itemId === itemId);
    if (existingIndex >= 0) {
      this.recommendations[existingIndex] = recommendation;
    } else {
      this.recommendations.push(recommendation);
    }

    // Emit event for critical items
    if (urgency === 'critical') {
      await EventBus.emit(RestaurantEvents.REORDER_POINT_TRIGGERED, {
        materialId: item.id,
        materialName: item.name,
        currentStock: item.currentStock,
        reorderPoint: itemMetrics.optimizedReorderPoint,
        suggestedOrderQuantity: itemMetrics.optimizedReorderQuantity,
        supplierId: item.supplierId,
        urgency: 'critical',
        estimatedStockoutDate: new Date(Date.now() + (daysUntilStockout * 24 * 60 * 60 * 1000)).toISOString(),
        timestamp: new Date().toISOString()
      }, 'PredictiveInventory');
    }
  }

  /**
   * Find alternative items for substitution
   */
  private findAlternatives(itemId: string): Array<{ itemId: string; name: string; substitutionRatio: number }> {
    const item = this.items.get(itemId);
    if (!item) return [];

    const alternatives: Array<{ itemId: string; name: string; substitutionRatio: number }> = [];
    
    // Find items in the same category
    for (const [id, otherItem] of this.items.entries()) {
      if (id !== itemId && 
          otherItem.category === item.category && 
          otherItem.isActive &&
          otherItem.currentStock > otherItem.reorderPoint) {
        
        // Simple substitution ratio based on cost similarity
        const costRatio = item.costPerUnit / otherItem.costPerUnit;
        const substitutionRatio = Math.min(2, Math.max(0.5, costRatio));
        
        alternatives.push({
          itemId: id,
          name: otherItem.name,
          substitutionRatio
        });
      }
    }

    return alternatives.slice(0, 3); // Return top 3 alternatives
  }

  /**
   * Run comprehensive optimization
   */
  public async runOptimization(): Promise<InventoryOptimization> {
    if (this.isProcessing) {
      return this.getLastOptimization();
    }

    this.isProcessing = true;
    
    try {
      console.log('🔄 Running inventory optimization...');
      
      // Update metrics for all items
      const updatePromises = Array.from(this.items.keys()).map(itemId => 
        this.updatePredictiveMetrics(itemId)
      );
      
      await Promise.allSettled(updatePromises);
      
      // Generate recommendations for items needing attention
      const reorderPromises = Array.from(this.items.values())
        .filter(item => {
          const metrics = this.metrics.get(item.id);
          return metrics && (
            item.currentStock <= metrics.optimizedReorderPoint ||
            metrics.recommendedAction !== 'monitor'
          );
        })
        .map(item => this.generateReorderRecommendation(item.id));
        
      await Promise.allSettled(reorderPromises);
      
      // Calculate optimization metrics
      const optimization = this.calculateOptimizationMetrics();
      this.lastOptimization = Date.now();
      
      console.log('✅ Inventory optimization completed');
      return optimization;
      
    } catch (error) {
      console.error('❌ Inventory optimization failed:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Calculate overall optimization metrics
   */
  private calculateOptimizationMetrics(): InventoryOptimization {
    const totalItems = this.items.size;
    let itemsNeedingAttention = 0;
    let potentialSavings = 0;
    let totalStockoutRisk = 0;
    let overstockValue = 0;
    let totalOptimizationScore = 0;

    for (const [itemId, item] of this.items.entries()) {
      const metrics = this.metrics.get(itemId);
      if (!metrics) continue;

      // Items needing attention
      if (metrics.recommendedAction !== 'monitor') {
        itemsNeedingAttention++;
      }

      // Potential savings from optimization
      const currentOrderQuantity = item.maxStockLevel - item.currentStock;
      const savingsPerOrder = Math.abs(currentOrderQuantity - metrics.optimizedReorderQuantity) * item.costPerUnit * 0.1;
      potentialSavings += savingsPerOrder;

      // Risk accumulation
      totalStockoutRisk += metrics.stockoutRisk;
      
      // Overstock value
      if (item.currentStock > item.maxStockLevel) {
        overstockValue += (item.currentStock - item.maxStockLevel) * item.costPerUnit;
      }

      // Optimization score (0-100)
      let itemScore = 100;
      itemScore -= metrics.stockoutRisk * 30;
      itemScore -= metrics.overstockRisk * 20;
      itemScore += metrics.confidenceScore * 10;
      
      totalOptimizationScore += Math.max(0, itemScore);
    }

    return {
      totalItems,
      itemsNeedingAttention,
      potentialSavings: Math.round(potentialSavings),
      stockoutRisk: totalItems > 0 ? totalStockoutRisk / totalItems : 0,
      overstockValue: Math.round(overstockValue),
      recommendations: [...this.recommendations].sort((a, b) => {
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }),
      optimizationScore: totalItems > 0 ? Math.round(totalOptimizationScore / totalItems) : 0,
      lastUpdated: Date.now()
    };
  }

  /**
   * Get the last optimization result
   */
  public getLastOptimization(): InventoryOptimization {
    return this.calculateOptimizationMetrics();
  }

  /**
   * Optimize a specific item
   */
  public async optimizeItem(itemId: string): Promise<PredictiveMetrics | null> {
    await this.updatePredictiveMetrics(itemId);
    return this.metrics.get(itemId) || null;
  }

  /**
   * Get predictive metrics for an item
   */
  public getPredictiveMetrics(itemId: string): PredictiveMetrics | null {
    return this.metrics.get(itemId) || null;
  }

  /**
   * Get reorder recommendations
   */
  public getReorderRecommendations(urgencyFilter?: ReorderRecommendation['urgency']): ReorderRecommendation[] {
    if (!urgencyFilter) return [...this.recommendations];
    return this.recommendations.filter(r => r.urgency === urgencyFilter);
  }

  /**
   * Get all inventory items
   */
  public getItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Process automatic reorder if configured
   */
  public async processAutomaticReorder(itemId: string, approvedQuantity?: number): Promise<boolean> {
    const recommendation = this.recommendations.find(r => r.itemId === itemId);
    const item = this.items.get(itemId);
    
    if (!recommendation || !item) return false;

    try {
      const orderQuantity = approvedQuantity || recommendation.recommendedOrderQuantity;
      
      // Queue the procurement order for offline sync
      const procurementOrder = {
        id: `auto_order_${Date.now()}_${itemId}`,
        itemId: item.id,
        itemName: item.name,
        quantity: orderQuantity,
        estimatedCost: orderQuantity * item.costPerUnit,
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        urgency: recommendation.urgency,
        generatedBy: 'predictive_system',
        timestamp: Date.now()
      };

      // Queue for sync when online
      await offlineSync.queueOperation({
        type: 'CREATE',
        entity: 'procurement_orders',
        data: procurementOrder,
        priority: recommendation.urgency === 'critical' ? 1 : 2
      });

      // Emit procurement event
      await EventBus.emit(RestaurantEvents.PROCUREMENT_ORDER_GENERATED, {
        orderId: procurementOrder.id,
        supplierId: item.supplierId || 'unknown',
        supplierName: item.supplierName || 'Unknown Supplier',
        totalAmount: procurementOrder.estimatedCost,
        itemCount: 1,
        priority: recommendation.urgency === 'critical' ? 'urgent' : 
                 recommendation.urgency === 'high' ? 'high' : 'medium',
        estimatedDelivery: new Date(recommendation.expectedDelivery || Date.now()).toISOString(),
        optimizationScore: 0.8,
        timestamp: new Date().toISOString()
      }, 'PredictiveInventory');

      // Remove the recommendation as it's been processed
      this.recommendations = this.recommendations.filter(r => r.itemId !== itemId);
      
      return true;
      
    } catch (error) {
      console.error('Failed to process automatic reorder:', error);
      return false;
    }
  }

  /**
   * Cleanup and shutdown
   */
  public shutdown(): void {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }
  }
}

// Global instance
export const predictiveInventory = PredictiveInventoryManager.getInstance();

// Utility functions
export const initializePredictiveInventory = () => predictiveInventory.runOptimization();
export const getReorderRecommendations = (urgency?: ReorderRecommendation['urgency']) =>
  predictiveInventory.getReorderRecommendations(urgency);
export const optimizeInventoryItem = (itemId: string) => predictiveInventory.optimizeItem(itemId);
export const processAutoReorder = (itemId: string, quantity?: number) =>
  predictiveInventory.processAutomaticReorder(itemId, quantity);

export default predictiveInventory;