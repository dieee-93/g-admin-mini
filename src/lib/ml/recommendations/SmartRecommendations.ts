// SmartRecommendations.ts - AI-powered recommendation system for menu optimization
// Provides intelligent insights for sales, menu items, pricing, and customer preferences

import { mlEngine } from '../core/MLEngine';
import type { ForecastResult } from '../core/MLEngine';
import { EventBus } from '@/lib/events';
import { EventBus } from '@/lib/events';

import { logger } from '@/lib/logging';
// ===== INTERFACES =====

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  ingredients: Array<{
    itemId: string;
    quantity: number;
    unit: string;
  }>;
  preparationTime: number;
  isActive: boolean;
  tags: string[];
  nutritionInfo?: {
    calories: number;
    allergens: string[];
    dietary: string[]; // vegan, vegetarian, gluten-free, etc.
  };
  salesData?: {
    totalSold: number;
    averageRating: number;
    lastOrdered: number;
    popularTimes: number[]; // Hours of day
  };
}

export interface CustomerProfile {
  id: string;
  preferences: {
    categories: string[];
    priceRange: { min: number; max: number };
    dietary: string[];
    favoriteItems: string[];
    dislikes: string[];
  };
  orderHistory: Array<{
    orderId: string;
    items: string[];
    timestamp: number;
    totalAmount: number;
    rating?: number;
  }>;
  behaviorMetrics: {
    averageOrderValue: number;
    orderFrequency: number; // orders per month
    loyaltyScore: number; // 0-1
    seasonalPatterns: Record<string, number>;
  };
}

export interface MenuRecommendation {
  type: 'promote' | 'optimize_price' | 'remove' | 'modify' | 'add_ingredient' | 'bundle';
  itemId?: string;
  itemName?: string;
  confidence: number;
  expectedImpact: {
    revenueChange: number; // Percentage
    profitChange: number;
    popularityChange: number;
  };
  reasoning: string;
  actionRequired: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTimeframe: string;
  dependencies?: string[];
  alternatives?: Array<{
    action: string;
    expectedImpact: number;
    complexity: 'simple' | 'moderate' | 'complex';
  }>;
}

export interface PersonalizedRecommendation {
  customerId: string;
  recommendations: Array<{
    itemId: string;
    itemName: string;
    confidence: number;
    reason: string;
    discountSuggestion?: number;
    bundleSuggestions?: string[];
    upsellOpportunity?: {
      itemId: string;
      itemName: string;
      additionalRevenue: number;
    };
  }>;
  optimalOrderTime: {
    hour: number;
    dayOfWeek: number;
    confidence: number;
  };
  priceOptimization: {
    maxAcceptablePrice: number;
    priceElasticity: number;
  };
}

export interface SalesInsight {
  type: 'trend' | 'opportunity' | 'warning' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  data: {
    metric: string;
    currentValue: number;
    predictedValue?: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    timeframe: string;
  };
  recommendations: string[];
  relatedItems?: string[];
}

// ===== RECOMMENDATION ENGINE =====

export class SmartRecommendationEngine {
  private static instance: SmartRecommendationEngine;
  private menuItems = new Map<string, MenuItem>();
  private customerProfiles = new Map<string, CustomerProfile>();
  private salesHistory: Array<{
    timestamp: number;
    itemId: string;
    quantity: number;
    revenue: number;
    customerId?: string;
    hour: number;
    dayOfWeek: number;
  }> = [];
  private lastAnalysis = 0;
  private analysisCache = new Map<string, any>();

  private constructor() {
    this.initializeEventListeners();
    this.startAnalysisLoop();
  }

  public static getInstance(): SmartRecommendationEngine {
    if (!SmartRecommendationEngine.instance) {
      SmartRecommendationEngine.instance = new SmartRecommendationEngine();
    }
    return SmartRecommendationEngine.instance;
  }

  /**
   * Initialize event listeners for real-time data collection
   */
  private initializeEventListeners(): void {
    // Listen for completed orders
    EventBus.on('sales.order.placed', (event) => {
      this.processOrderForAnalysis(event.payload);
    });

    // Listen for menu changes
    EventBus.on('recipes.used', (event) => {
      this.updateMenuItemUsage(event.payload);
    });

    // Listen for sales completions
    EventBus.on('sales.completed', (event) => {
      this.processSaleForAnalysis(event.payload);
    });
  }

  /**
   * Start the analysis loop for continuous learning
   */
  private startAnalysisLoop(): void {
    // Run analysis every 6 hours
    setInterval(() => {
      this.runComprehensiveAnalysis();
    }, 6 * 60 * 60 * 1000);

    // Initial analysis after 1 minute
    setTimeout(() => {
      this.runComprehensiveAnalysis();
    }, 60000);
  }

  /**
   * Add or update a menu item
   */
  public addMenuItem(item: MenuItem): void {
    this.menuItems.set(item.id, item);
    this.invalidateCache();
  }

  /**
   * Add or update a customer profile
   */
  public addCustomerProfile(profile: CustomerProfile): void {
    this.customerProfiles.set(profile.id, profile);
    this.invalidateCache();
  }

  /**
   * Process order for analysis
   */
  private processOrderForAnalysis(orderData: unknown): void {
    if (!orderData.items) return;

    const timestamp = Date.now();
    const date = new Date(timestamp);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    for (const item of orderData.items) {
      const menuItem = this.menuItems.get(item.productId);
      if (menuItem) {
        this.salesHistory.push({
          timestamp,
          itemId: item.productId,
          quantity: item.quantity,
          revenue: item.quantity * menuItem.price,
          customerId: orderData.customerId,
          hour,
          dayOfWeek
        });

        // Update menu item sales data
        if (!menuItem.salesData) {
          menuItem.salesData = {
            totalSold: 0,
            averageRating: 0,
            lastOrdered: timestamp,
            popularTimes: new Array(24).fill(0)
          };
        }

        menuItem.salesData.totalSold += item.quantity;
        menuItem.salesData.lastOrdered = timestamp;
        menuItem.salesData.popularTimes[hour] += item.quantity;
      }
    }

    // Update customer profile if available
    if (orderData.customerId) {
      this.updateCustomerProfile(orderData);
    }

    // Keep only last 10000 sales records for performance
    if (this.salesHistory.length > 10000) {
      this.salesHistory = this.salesHistory.slice(-10000);
    }
  }

  /**
   * Process sale completion for analysis
   */
  private processSaleForAnalysis(saleData: unknown): void {
    // This adds additional context to sales data
    const lastSales = this.salesHistory.slice(-10);
    lastSales.forEach(sale => {
      if (sale.timestamp > Date.now() - 60000) { // Last minute
        // Add any additional sale-specific metrics
        const menuItem = this.menuItems.get(sale.itemId);
        if (menuItem && saleData.rating) {
          if (!menuItem.salesData) {
            menuItem.salesData = {
              totalSold: 0,
              averageRating: saleData.rating,
              lastOrdered: sale.timestamp,
              popularTimes: new Array(24).fill(0)
            };
          } else {
            menuItem.salesData.averageRating = 
              (menuItem.salesData.averageRating + saleData.rating) / 2;
          }
        }
      }
    });
  }

  /**
   * Update menu item usage from recipe events
   */
  private updateMenuItemUsage(recipeData: unknown): void {
    const menuItem = this.menuItems.get(recipeData.recipeId);
    if (menuItem && recipeData.ingredients) {
      // Update ingredient usage patterns
      recipeData.ingredients.forEach((ingredient: unknown) => {
        const existing = menuItem.ingredients.find(i => i.itemId === ingredient.itemId);
        if (existing && recipeData.actualYield && recipeData.expectedYield) {
          // Adjust quantities based on actual vs expected yield
          const yieldRatio = recipeData.actualYield / recipeData.expectedYield;
          existing.quantity *= yieldRatio;
        }
      });
    }
  }

  /**
   * Update customer profile based on order
   */
  private updateCustomerProfile(orderData: unknown): void {
    let profile = this.customerProfiles.get(orderData.customerId);
    
    if (!profile) {
      profile = {
        id: orderData.customerId,
        preferences: {
          categories: [],
          priceRange: { min: 0, max: 1000 },
          dietary: [],
          favoriteItems: [],
          dislikes: []
        },
        orderHistory: [],
        behaviorMetrics: {
          averageOrderValue: 0,
          orderFrequency: 0,
          loyaltyScore: 0,
          seasonalPatterns: {}
        }
      };
    }

    // Add to order history
    profile.orderHistory.push({
      orderId: orderData.orderId,
      items: orderData.items.map((item: unknown) => item.productId),
      timestamp: Date.now(),
      totalAmount: orderData.totalAmount
    });

    // Update preferences based on order patterns
    this.updateCustomerPreferences(profile, orderData);
    
    // Update behavior metrics
    this.updateCustomerBehaviorMetrics(profile);

    this.customerProfiles.set(profile.id, profile);
  }

  /**
   * Update customer preferences based on orders
   */
  private updateCustomerPreferences(profile: CustomerProfile, orderData: any): void {
    if (!orderData.items) return;

    for (const item of orderData.items) {
      const menuItem = this.menuItems.get(item.productId);
      if (!menuItem) continue;

      // Update category preferences
      if (!profile.preferences.categories.includes(menuItem.category)) {
        profile.preferences.categories.push(menuItem.category);
      }

      // Update favorite items (items ordered more than 3 times)
      const orderCount = profile.orderHistory.reduce((count, order) => 
        count + (order.items.includes(item.productId) ? 1 : 0), 0
      );
      
      if (orderCount >= 3 && !profile.preferences.favoriteItems.includes(item.productId)) {
        profile.preferences.favoriteItems.push(item.productId);
      }

      // Update price range
      profile.preferences.priceRange.min = Math.min(
        profile.preferences.priceRange.min || menuItem.price, 
        menuItem.price
      );
      profile.preferences.priceRange.max = Math.max(
        profile.preferences.priceRange.max || menuItem.price, 
        menuItem.price
      );

      // Update dietary preferences based on item tags
      if (menuItem.nutritionInfo?.dietary) {
        menuItem.nutritionInfo.dietary.forEach(diet => {
          if (!profile.preferences.dietary.includes(diet)) {
            profile.preferences.dietary.push(diet);
          }
        });
      }
    }
  }

  /**
   * Update customer behavior metrics
   */
  private updateCustomerBehaviorMetrics(profile: CustomerProfile): void {
    const orders = profile.orderHistory;
    if (orders.length === 0) return;

    // Calculate average order value
    profile.behaviorMetrics.averageOrderValue = 
      orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length;

    // Calculate order frequency (orders per month)
    const firstOrder = Math.min(...orders.map(o => o.timestamp));
    const monthsSinceFirst = (Date.now() - firstOrder) / (30 * 24 * 60 * 60 * 1000);
    profile.behaviorMetrics.orderFrequency = orders.length / Math.max(1, monthsSinceFirst);

    // Calculate loyalty score (0-1 based on frequency and recency)
    const daysSinceLastOrder = (Date.now() - Math.max(...orders.map(o => o.timestamp))) / (24 * 60 * 60 * 1000);
    const recencyScore = Math.max(0, 1 - (daysSinceLastOrder / 30)); // 30 days max
    const frequencyScore = Math.min(1, profile.behaviorMetrics.orderFrequency / 4); // 4 orders/month = max
    profile.behaviorMetrics.loyaltyScore = (recencyScore + frequencyScore) / 2;

    // Calculate seasonal patterns
    const seasonalCounts = { spring: 0, summer: 0, fall: 0, winter: 0 };
    orders.forEach(order => {
      const date = new Date(order.timestamp);
      const month = date.getMonth();
      if (month >= 2 && month <= 4) seasonalCounts.spring++;
      else if (month >= 5 && month <= 7) seasonalCounts.summer++;
      else if (month >= 8 && month <= 10) seasonalCounts.fall++;
      else seasonalCounts.winter++;
    });

    profile.behaviorMetrics.seasonalPatterns = seasonalCounts;
  }

  /**
   * Generate menu optimization recommendations
   */
  public async generateMenuRecommendations(): Promise<MenuRecommendation[]> {
    const cacheKey = 'menu_recommendations';
    const cached = this.getCachedResult(cacheKey, 2 * 60 * 60 * 1000); // 2 hours cache
    if (cached) return cached;

    const recommendations: MenuRecommendation[] = [];
    
    try {
      // Analyze each menu item
      for (const [itemId, item] of this.menuItems.entries()) {
        const itemRecommendations = await this.analyzeMenuItem(itemId, item);
        recommendations.push(...itemRecommendations);
      }

      // Sort by priority and confidence
      recommendations.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      });

      this.setCachedResult(cacheKey, recommendations);
      return recommendations;

    } catch (error) {
      logger.error('Performance', 'Failed to generate menu recommendations:', error);
      return [];
    }
  }

  /**
   * Analyze a specific menu item
   */
  private async analyzeMenuItem(itemId: string, item: MenuItem): Promise<MenuRecommendation[]> {
    const recommendations: MenuRecommendation[] = [];
    const sales = this.getSalesForItem(itemId);
    
    if (sales.length === 0) {
      // New item or no sales data
      if (item.isActive) {
        recommendations.push({
          type: 'promote',
          itemId,
          itemName: item.name,
          confidence: 0.7,
          expectedImpact: {
            revenueChange: 15,
            profitChange: 10,
            popularityChange: 20
          },
          reasoning: 'New menu item needs promotion to build awareness',
          actionRequired: 'Create promotional campaign or featured placement',
          priority: 'medium',
          estimatedTimeframe: '2-4 weeks'
        });
      }
      return recommendations;
    }

    // Calculate performance metrics
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.revenue, 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const averagePrice = totalRevenue / totalQuantity;
    const profitMargin = (item.price - item.cost) / item.price;
    
    // Get demand forecast
    try {
      const forecast = await mlEngine.getDemandForecast(itemId, 14);
      const predictedDemand = forecast.predictions.reduce((sum, pred) => sum + pred.value, 0);
      const currentDemand = sales.slice(-7).reduce((sum, sale) => sum + sale.quantity, 0);

      // Demand trend analysis
      if (forecast.metadata.trend === 'decreasing' && currentDemand > 5) {
        recommendations.push({
          type: 'optimize_price',
          itemId,
          itemName: item.name,
          confidence: forecast.accuracy,
          expectedImpact: {
            revenueChange: -5,
            profitChange: 10,
            popularityChange: 15
          },
          reasoning: 'Declining demand trend detected. Price reduction could boost sales.',
          actionRequired: 'Consider 10-15% price reduction or promotional pricing',
          priority: 'medium',
          estimatedTimeframe: '1-2 weeks',
          alternatives: [
            { action: 'Bundle with popular item', expectedImpact: 12, complexity: 'moderate' },
            { action: 'Modify recipe to reduce costs', expectedImpact: 8, complexity: 'complex' }
          ]
        });
      }

      // High demand, low profit margin
      if (predictedDemand > currentDemand * 1.2 && profitMargin < 0.3) {
        recommendations.push({
          type: 'optimize_price',
          itemId,
          itemName: item.name,
          confidence: 0.8,
          expectedImpact: {
            revenueChange: 20,
            profitChange: 35,
            popularityChange: -5
          },
          reasoning: 'High demand with low profit margin. Price increase opportunity.',
          actionRequired: 'Increase price by 10-20% and monitor demand response',
          priority: 'high',
          estimatedTimeframe: '1 week'
        });
      }

    } catch (error) {
      logger.error('Performance', `Failed to get forecast for ${itemId}:`, error);
    }

    // Low performance items
    const avgSalesPerDay = totalQuantity / Math.max(1, sales.length / 7);
    if (avgSalesPerDay < 1 && item.isActive && sales.length > 14) {
      recommendations.push({
        type: 'remove',
        itemId,
        itemName: item.name,
        confidence: 0.9,
        expectedImpact: {
          revenueChange: -2,
          profitChange: 5, // Reduced menu complexity
          popularityChange: 0
        },
        reasoning: 'Consistently low sales performance over extended period',
        actionRequired: 'Consider removing from menu or replacing with popular alternative',
        priority: 'medium',
        estimatedTimeframe: '1 week',
        alternatives: [
          { action: 'Final promotion before removal', expectedImpact: 3, complexity: 'simple' },
          { action: 'Modify recipe significantly', expectedImpact: 6, complexity: 'complex' }
        ]
      });
    }

    // High-margin opportunity
    if (profitMargin > 0.6 && totalQuantity > 10) {
      recommendations.push({
        type: 'promote',
        itemId,
        itemName: item.name,
        confidence: 0.8,
        expectedImpact: {
          revenueChange: 25,
          profitChange: 30,
          popularityChange: 15
        },
        reasoning: 'High-profit item with good sales potential',
        actionRequired: 'Feature prominently and create upselling opportunities',
        priority: 'high',
        estimatedTimeframe: '1-2 weeks'
      });
    }

    return recommendations;
  }

  /**
   * Generate personalized recommendations for a customer
   */
  public generatePersonalizedRecommendations(customerId: string): PersonalizedRecommendation | null {
    const cacheKey = `customer_recommendations_${customerId}`;
    const cached = this.getCachedResult(cacheKey, 30 * 60 * 1000); // 30 minutes cache
    if (cached) return cached;

    const profile = this.customerProfiles.get(customerId);
    if (!profile || profile.orderHistory.length < 2) return null;

    const recommendations: PersonalizedRecommendation['recommendations'] = [];
    
    // Collaborative filtering: find similar customers
    const similarCustomers = this.findSimilarCustomers(profile);
    const recommendedItems = this.getRecommendationsFromSimilarCustomers(profile, similarCustomers);

    // Content-based filtering: recommend based on preferences
    const preferenceBasedItems = this.getPreferenceBasedRecommendations(profile);

    // Combine and rank recommendations
    const allRecommendations = [...recommendedItems, ...preferenceBasedItems];
    const rankedRecommendations = this.rankPersonalizedRecommendations(profile, allRecommendations);

    const result: PersonalizedRecommendation = {
      customerId,
      recommendations: rankedRecommendations.slice(0, 5), // Top 5 recommendations
      optimalOrderTime: this.calculateOptimalOrderTime(profile),
      priceOptimization: this.calculatePriceOptimization(profile)
    };

    this.setCachedResult(cacheKey, result);
    return result;
  }

  /**
   * Find customers with similar preferences
   */
  private findSimilarCustomers(profile: CustomerProfile): CustomerProfile[] {
    const similarities: Array<{ profile: CustomerProfile; score: number }> = [];

    for (const [id, otherProfile] of this.customerProfiles.entries()) {
      if (id === profile.id || otherProfile.orderHistory.length < 2) continue;

      const similarity = this.calculateCustomerSimilarity(profile, otherProfile);
      if (similarity > 0.3) {
        similarities.push({ profile: otherProfile, score: similarity });
      }
    }

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Top 10 similar customers
      .map(s => s.profile);
  }

  /**
   * Calculate similarity between two customer profiles
   */
  private calculateCustomerSimilarity(profile1: CustomerProfile, profile2: CustomerProfile): number {
    let score = 0;
    let factors = 0;

    // Category preferences similarity
    const commonCategories = profile1.preferences.categories.filter(cat =>
      profile2.preferences.categories.includes(cat)
    );
    const categoryScore = commonCategories.length / 
      Math.max(profile1.preferences.categories.length, profile2.preferences.categories.length, 1);
    score += categoryScore * 0.3;
    factors += 0.3;

    // Price range similarity
    const priceOverlap = Math.min(profile1.preferences.priceRange.max, profile2.preferences.priceRange.max) -
                        Math.max(profile1.preferences.priceRange.min, profile2.preferences.priceRange.min);
    const priceRange1 = profile1.preferences.priceRange.max - profile1.preferences.priceRange.min;
    const priceRange2 = profile2.preferences.priceRange.max - profile2.preferences.priceRange.min;
    const priceScore = Math.max(0, priceOverlap) / Math.max(priceRange1, priceRange2, 1);
    score += priceScore * 0.2;
    factors += 0.2;

    // Order behavior similarity
    const avgDiff = Math.abs(profile1.behaviorMetrics.averageOrderValue - profile2.behaviorMetrics.averageOrderValue);
    const maxAvg = Math.max(profile1.behaviorMetrics.averageOrderValue, profile2.behaviorMetrics.averageOrderValue, 1);
    const behaviorScore = 1 - (avgDiff / maxAvg);
    score += behaviorScore * 0.25;
    factors += 0.25;

    // Dietary preferences similarity
    const commonDietary = profile1.preferences.dietary.filter(diet =>
      profile2.preferences.dietary.includes(diet)
    );
    const dietaryScore = commonDietary.length / 
      Math.max(profile1.preferences.dietary.length, profile2.preferences.dietary.length, 1);
    score += dietaryScore * 0.25;
    factors += 0.25;

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Get recommendations from similar customers
   */
  private getRecommendationsFromSimilarCustomers(
    profile: CustomerProfile, 
    similarCustomers: CustomerProfile[]
  ): Array<{ itemId: string; confidence: number; reason: string }> {
    const itemScores = new Map<string, { score: number; count: number }>();
    const customerItems = new Set(
      profile.orderHistory.flatMap(order => order.items)
    );

    for (const similarCustomer of similarCustomers) {
      const similarity = this.calculateCustomerSimilarity(profile, similarCustomer);
      
      for (const order of similarCustomer.orderHistory) {
        for (const itemId of order.items) {
          if (!customerItems.has(itemId)) {
            const existing = itemScores.get(itemId) || { score: 0, count: 0 };
            existing.score += similarity;
            existing.count += 1;
            itemScores.set(itemId, existing);
          }
        }
      }
    }

    return Array.from(itemScores.entries())
      .map(([itemId, { score, count }]) => {
        const item = this.menuItems.get(itemId);
        return {
          itemId,
          confidence: (score / count) * 0.8, // Max 80% confidence for collaborative
          reason: `${count} similar customers enjoyed this item`
        };
      })
      .filter(rec => rec.confidence > 0.3)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get preference-based recommendations
   */
  private getPreferenceBasedRecommendations(
    profile: CustomerProfile
  ): Array<{ itemId: string; confidence: number; reason: string }> {
    const recommendations: Array<{ itemId: string; confidence: number; reason: string }> = [];
    const customerItems = new Set(profile.orderHistory.flatMap(order => order.items));

    for (const [itemId, item] of this.menuItems.entries()) {
      if (customerItems.has(itemId) || !item.isActive) continue;

      let score = 0;
      const reasons: string[] = [];

      // Category preference
      if (profile.preferences.categories.includes(item.category)) {
        score += 0.4;
        reasons.push('matches your preferred category');
      }

      // Price range
      if (item.price >= profile.preferences.priceRange.min && 
          item.price <= profile.preferences.priceRange.max) {
        score += 0.3;
        reasons.push('within your typical price range');
      }

      // Dietary preferences
      if (item.nutritionInfo?.dietary) {
        const matchingDietary = item.nutritionInfo.dietary.filter(diet =>
          profile.preferences.dietary.includes(diet)
        );
        if (matchingDietary.length > 0) {
          score += 0.3 * (matchingDietary.length / profile.preferences.dietary.length);
          reasons.push(`matches your ${matchingDietary.join(', ')} preferences`);
        }
      }

      if (score > 0.4) {
        recommendations.push({
          itemId,
          confidence: Math.min(0.9, score),
          reason: reasons.join(' and ')
        });
      }
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Rank personalized recommendations
   */
  private rankPersonalizedRecommendations(
    profile: CustomerProfile,
    recommendations: Array<{ itemId: string; confidence: number; reason: string }>
  ): PersonalizedRecommendation['recommendations'] {
    return recommendations
      .map(rec => {
        const item = this.menuItems.get(rec.itemId);
        if (!item) return null;

        // Calculate upsell opportunity
        let upsellOpportunity;
        const relatedItems = this.findRelatedItems(rec.itemId);
        if (relatedItems.length > 0) {
          const bestUpsell = relatedItems[0];
          if (bestUpsell.price > item.price) {
            upsellOpportunity = {
              itemId: bestUpsell.id,
              itemName: bestUpsell.name,
              additionalRevenue: bestUpsell.price - item.price
            };
          }
        }

        // Calculate discount suggestion
        let discountSuggestion;
        if (rec.confidence < 0.6 && profile.behaviorMetrics.loyaltyScore > 0.7) {
          discountSuggestion = Math.round((0.7 - rec.confidence) * 20); // Up to 20% discount
        }

        return {
          itemId: rec.itemId,
          itemName: item.name,
          confidence: rec.confidence,
          reason: rec.reason,
          discountSuggestion,
          bundleSuggestions: this.findBundleOpportunities(rec.itemId, profile),
          upsellOpportunity
        };
      })
      .filter(rec => rec !== null)
      .slice(0, 5);
  }

  /**
   * Find related items for upselling
   */
  private findRelatedItems(itemId: string): MenuItem[] {
    const item = this.menuItems.get(itemId);
    if (!item) return [];

    // Find items in same category with higher prices
    return Array.from(this.menuItems.values())
      .filter(other => 
        other.id !== itemId && 
        other.category === item.category && 
        other.price > item.price &&
        other.isActive
      )
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
  }

  /**
   * Find bundle opportunities
   */
  private findBundleOpportunities(itemId: string, profile: CustomerProfile): string[] {
    const item = this.menuItems.get(itemId);
    if (!item) return [];

    // Simple bundling based on complementary categories
    const complementaryCategories = new Map([
      ['main', ['sides', 'drinks']],
      ['sides', ['main', 'drinks']],
      ['drinks', ['main', 'dessert']],
      ['dessert', ['drinks']]
    ]);

    const compatible = complementaryCategories.get(item.category) || [];
    
    return Array.from(this.menuItems.values())
      .filter(other => 
        other.id !== itemId &&
        compatible.includes(other.category) &&
        other.isActive &&
        other.price <= profile.behaviorMetrics.averageOrderValue * 0.3 // Max 30% of typical order
      )
      .sort((a, b) => (b.salesData?.totalSold || 0) - (a.salesData?.totalSold || 0))
      .slice(0, 2)
      .map(bundleItem => bundleItem.id);
  }

  /**
   * Calculate optimal order time for customer
   */
  private calculateOptimalOrderTime(profile: CustomerProfile): PersonalizedRecommendation['optimalOrderTime'] {
    const orderTimes = profile.orderHistory.map(order => {
      const date = new Date(order.timestamp);
      return {
        hour: date.getHours(),
        dayOfWeek: date.getDay()
      };
    });

    if (orderTimes.length === 0) {
      return { hour: 12, dayOfWeek: 6, confidence: 0.3 }; // Default: Saturday noon
    }

    // Find most common hour
    const hourCounts = new Map<number, number>();
    const dayOfWeekCounts = new Map<number, number>();

    orderTimes.forEach(({ hour, dayOfWeek }) => {
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) || 0) + 1);
    });

    const mostCommonHour = Array.from(hourCounts.entries())
      .reduce((max, [hour, count]) => count > max.count ? { hour, count } : max, { hour: 12, count: 0 });
    
    const mostCommonDay = Array.from(dayOfWeekCounts.entries())
      .reduce((max, [day, count]) => count > max.count ? { day, count } : max, { day: 6, count: 0 });

    const confidence = Math.min(0.9, 
      (mostCommonHour.count + mostCommonDay.count) / (orderTimes.length * 2)
    );

    return {
      hour: mostCommonHour.hour,
      dayOfWeek: mostCommonDay.day,
      confidence
    };
  }

  /**
   * Calculate price optimization for customer
   */
  private calculatePriceOptimization(profile: CustomerProfile): PersonalizedRecommendation['priceOptimization'] {
    const orderValues = profile.orderHistory.map(order => order.totalAmount);
    const maxOrderValue = Math.max(...orderValues);
    const avgOrderValue = profile.behaviorMetrics.averageOrderValue;

    // Simple price elasticity estimation
    const priceVariation = maxOrderValue - Math.min(...orderValues);
    const elasticity = priceVariation > 0 ? 0.5 : 0.8; // Lower elasticity for consistent spenders

    return {
      maxAcceptablePrice: maxOrderValue * 1.2, // 20% above highest previous order
      priceElasticity: elasticity
    };
  }

  /**
   * Generate sales insights
   */
  public async generateSalesInsights(): Promise<SalesInsight[]> {
    const cacheKey = 'sales_insights';
    const cached = this.getCachedResult(cacheKey, 60 * 60 * 1000); // 1 hour cache
    if (cached) return cached;

    const insights: SalesInsight[] = [];

    try {
      // Revenue trend analysis
      const revenueTrend = await this.analyzeRevenueTrend();
      if (revenueTrend) insights.push(revenueTrend);

      // Top performing items
      const topPerformers = this.analyzeTopPerformingItems();
      insights.push(...topPerformers);

      // Underperforming items
      const underperformers = this.analyzeUnderperformingItems();
      insights.push(...underperformers);

      // Peak hours analysis
      const peakHours = this.analyzePeakHours();
      if (peakHours) insights.push(peakHours);

      // Customer behavior insights
      const customerInsights = this.analyzeCustomerBehavior();
      insights.push(...customerInsights);

      this.setCachedResult(cacheKey, insights);
      return insights.slice(0, 10); // Top 10 insights

    } catch (error) {
      logger.error('Performance', 'Failed to generate sales insights:', error);
      return [];
    }
  }

  /**
   * Analyze revenue trend using ML forecasting
   */
  private async analyzeRevenueTrend(): Promise<SalesInsight | null> {
    try {
      const forecast = await mlEngine.getSalesForecast(7);
      const currentRevenue = this.salesHistory
        .filter(sale => sale.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000)
        .reduce((sum, sale) => sum + sale.revenue, 0);
      
      const predictedRevenue = forecast.predictions.reduce((sum, pred) => sum + pred.value, 0);
      const trendChange = ((predictedRevenue - currentRevenue) / currentRevenue) * 100;

      return {
        type: 'trend',
        title: `Revenue ${forecast.metadata.trend === 'increasing' ? 'Growth' : forecast.metadata.trend === 'decreasing' ? 'Decline' : 'Stability'} Forecast`,
        description: `Revenue is predicted to ${forecast.metadata.trend} by ${Math.abs(trendChange).toFixed(1)}% over the next week`,
        confidence: forecast.accuracy,
        impact: Math.abs(trendChange) > 10 ? 'high' : Math.abs(trendChange) > 5 ? 'medium' : 'low',
        data: {
          metric: 'Revenue',
          currentValue: currentRevenue,
          predictedValue: predictedRevenue,
          trend: forecast.metadata.trend,
          timeframe: 'Next 7 days'
        },
        recommendations: this.getRevenueRecommendations(forecast.metadata.trend, trendChange)
      };
    } catch (error) {
      logger.error('Performance', 'Failed to analyze revenue trend:', error);
      return null;
    }
  }

  /**
   * Get revenue-specific recommendations
   */
  private getRevenueRecommendations(trend: string, change: number): string[] {
    const recommendations: string[] = [];

    if (trend === 'decreasing') {
      recommendations.push('Consider promotional campaigns for underperforming items');
      recommendations.push('Review menu pricing strategy');
      recommendations.push('Analyze customer feedback for quality issues');
    } else if (trend === 'increasing') {
      recommendations.push('Prepare for increased demand by optimizing inventory');
      recommendations.push('Consider expanding popular menu categories');
      recommendations.push('Evaluate staffing needs for peak periods');
    } else {
      recommendations.push('Focus on customer retention strategies');
      recommendations.push('Introduce new menu items to drive growth');
      recommendations.push('Optimize operational efficiency');
    }

    return recommendations;
  }

  /**
   * Analyze top performing items
   */
  private analyzeTopPerformingItems(): SalesInsight[] {
    const itemPerformance = new Map<string, { revenue: number; quantity: number }>();
    
    this.salesHistory
      .filter(sale => sale.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      .forEach(sale => {
        const existing = itemPerformance.get(sale.itemId) || { revenue: 0, quantity: 0 };
        existing.revenue += sale.revenue;
        existing.quantity += sale.quantity;
        itemPerformance.set(sale.itemId, existing);
      });

    const topItems = Array.from(itemPerformance.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 3);

    return topItems.map(([itemId, performance], index) => {
      const item = this.menuItems.get(itemId);
      if (!item) return null;

      return {
        type: 'opportunity',
        title: `${item.name} - Top Performer #${index + 1}`,
        description: `Generated $${performance.revenue.toFixed(2)} revenue with ${performance.quantity} units sold in the last 30 days`,
        confidence: 0.9,
        impact: 'high',
        data: {
          metric: 'Revenue',
          currentValue: performance.revenue,
          trend: 'increasing',
          timeframe: 'Last 30 days'
        },
        recommendations: [
          'Consider featuring this item prominently in marketing',
          'Ensure consistent ingredient availability',
          'Train staff on upselling opportunities'
        ],
        relatedItems: [itemId]
      } as SalesInsight;
    }).filter(insight => insight !== null);
  }

  /**
   * Other analysis methods would continue here...
   */

  // Utility methods for caching and data retrieval
  private getSalesForItem(itemId: string): Array<typeof this.salesHistory[0]> {
    return this.salesHistory.filter(sale => sale.itemId === itemId);
  }

  private getCachedResult(key: string, maxAge: number): any {
    const cached = this.analysisCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < maxAge) {
      return cached.data;
    }
    return null;
  }

  private setCachedResult(key: string, data: any): void {
    this.analysisCache.set(key, { data, timestamp: Date.now() });
  }

  private invalidateCache(): void {
    this.analysisCache.clear();
  }

  /**
   * Run comprehensive analysis
   */
  private async runComprehensiveAnalysis(): Promise<void> {
    logger.info('Performance', '🔄 Running comprehensive recommendation analysis...');
    
    try {
      // Clear old cache
      this.invalidateCache();
      
      // Generate fresh recommendations and insights
      await this.generateMenuRecommendations();
      await this.generateSalesInsights();
      
      this.lastAnalysis = Date.now();
      logger.info('Performance', '✅ Recommendation analysis completed');
      
    } catch (error) {
      logger.error('Performance', '❌ Recommendation analysis failed:', error);
    }
  }

  /**
   * Placeholder methods for remaining analysis functions
   */
  private analyzeUnderperformingItems(): SalesInsight[] {
    // Implementation would analyze items with poor performance
    return [];
  }

  private analyzePeakHours(): SalesInsight | null {
    // Implementation would analyze busy hours and suggest optimizations
    return null;
  }

  private analyzeCustomerBehavior(): SalesInsight[] {
    // Implementation would analyze customer patterns and suggest improvements
    return [];
  }
}

// Global instance
export const smartRecommendations = SmartRecommendationEngine.getInstance();

// Utility functions
export const generateMenuRecommendations = () => smartRecommendations.generateMenuRecommendations();
export const generatePersonalizedRecommendations = (customerId: string) => 
  smartRecommendations.generatePersonalizedRecommendations(customerId);
export const generateSalesInsights = () => smartRecommendations.generateSalesInsights();

export default smartRecommendations;