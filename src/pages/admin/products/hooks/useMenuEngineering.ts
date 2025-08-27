import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MenuCategory,
  type MenuEngineeringMatrix,
  type MenuEngineeringData,
  type StrategyRecommendation,
  type MatrixConfiguration
} from '../types/menuEngineering';
import {
  calculateMenuEngineeringMatrix,
  DEFAULT_MATRIX_CONFIG,
  type ProductSalesData
} from '../logic/menuEngineeringCalculations';
import { notify } from '@/lib/notifications';
import { supabase } from '@/lib/supabase/client';

interface UseMenuEngineeringOptions {
  configuration?: MatrixConfiguration;
  autoRefresh?: boolean;
  refreshInterval?: number; // minutes
}

interface UseMenuEngineeringReturn {
  // Data
  matrix: MenuEngineeringMatrix | null;
  loading: boolean;
  error: string | null;
  
  // Configuration
  configuration: MatrixConfiguration;
  setConfiguration: (config: MatrixConfiguration) => void;
  
  // Actions
  refreshData: () => Promise<void>;
  
  // Filtered data
  getProductsByCategory: (category: MenuCategory) => MenuEngineeringData[];
  getTopRecommendations: (limit?: number) => StrategyRecommendation[];
  
  // Analytics
  getCategorySummary: () => {
    stars: number;
    plowhorses: number;
    puzzles: number;
    dogs: number;
  };
  
  getPerformanceMetrics: () => {
    totalRevenue: number;
    totalProfit: number;
    averageMargin: number;
    menuHealthScore: number;
  };
}

export const useMenuEngineering = (
  options: UseMenuEngineeringOptions = {}
): UseMenuEngineeringReturn => {
  const {
    configuration = DEFAULT_MATRIX_CONFIG,
    autoRefresh = true,
    refreshInterval = 30
  } = options;

  const [matrix, setMatrix] = useState<MenuEngineeringMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<MatrixConfiguration>(configuration);

  // Fetch sales data from database
  const fetchSalesData = useCallback(async (): Promise<ProductSalesData[]> => {
    try {
      // Calculate date range based on configuration
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - config.analysisPeriodDays * 24 * 60 * 60 * 1000);

      // Fetch products with their components and costs
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          type,
          unit
        `);

      if (productsError) throw productsError;

      // Fetch sales data for the analysis period
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          id,
          total,
          created_at,
          sale_items (
            id,
            product_id,
            quantity,
            unit_price,
            line_total
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (salesError) throw salesError;

      // Process sales data to calculate product performance
      const productSalesMap = new Map<string, {
        unitsSold: number;
        totalRevenue: number;
        salesDates: Date[];
      }>();

      // Initialize all products with zero sales
      products?.forEach(product => {
        productSalesMap.set(product.id, {
          unitsSold: 0,
          totalRevenue: 0,
          salesDates: []
        });
      });

      // Aggregate sales data by product
      sales?.forEach(sale => {
        sale.sale_items?.forEach((item: any) => {
          const productData = productSalesMap.get(item.product_id);
          if (productData) {
            productData.unitsSold += item.quantity;
            // Use line_total if available, otherwise calculate from quantity * unit_price
            productData.totalRevenue += item.line_total || (item.quantity * item.unit_price);
            productData.salesDates.push(new Date(sale.created_at));
          }
        });
      });

      // Get product costs using the existing function
      const salesData: ProductSalesData[] = [];
      
      for (const product of products || []) {
        const salesInfo = productSalesMap.get(product.id);
        if (!salesInfo || salesInfo.unitsSold < config.minimumSalesForAnalysis) {
          continue; // Skip products with insufficient sales data
        }

        try {
          // Get product cost using the database function
          const { data: costData, error: costError } = await supabase
            .rpc('get_product_cost', { p_product_id: product.id });

          if (costError) {
            console.warn(`Error getting cost for product ${product.name}:`, costError);
          }

          const productCost = costData || 0;
          const totalCost = salesInfo.unitsSold * productCost;
          const averagePrice = salesInfo.totalRevenue / salesInfo.unitsSold;

          salesData.push({
            productId: product.id,
            productName: product.name,
            unitsSold: salesInfo.unitsSold,
            totalRevenue: salesInfo.totalRevenue,
            totalCost: totalCost,
            averagePrice: averagePrice,
            salesDates: salesInfo.salesDates
          });
        } catch (err) {
          console.warn(`Error processing product ${product.name}:`, err);
          // Continue with estimated cost if database function fails
          const estimatedCost = salesInfo.totalRevenue * 0.3; // Assume 30% cost ratio
          const averagePrice = salesInfo.totalRevenue / salesInfo.unitsSold;

          salesData.push({
            productId: product.id,
            productName: product.name,
            unitsSold: salesInfo.unitsSold,
            totalRevenue: salesInfo.totalRevenue,
            totalCost: estimatedCost,
            averagePrice: averagePrice,
            salesDates: salesInfo.salesDates
          });
        }
      }

      return salesData;
    } catch (err) {
      console.error('Error fetching sales data:', err);
      throw err;
    }
  }, [config.analysisPeriodDays, config.minimumSalesForAnalysis]);

  // Calculate matrix from sales data
  const calculateMatrix = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const salesData = await fetchSalesData();
      
      if (salesData.length === 0) {
        // Clear matrix and show proper empty state - NO MOCK DATA
        setMatrix(null);
        
        notify.info({
          title: "Sin datos de ventas",
          description: `No se encontraron ventas en los últimos ${config.analysisPeriodDays} días. Realice algunas ventas para activar el análisis.`
        });
      } else {
        const calculatedMatrix = calculateMenuEngineeringMatrix(salesData, config);
        setMatrix(calculatedMatrix);
        
        notify.success({
          title: "Matrix actualizada",
          description: `Analizados ${salesData.length} productos con datos reales`
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      
      notify.error({
        title: "Error al calcular matrix",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [fetchSalesData, config]);

  // Initial load
  useEffect(() => {
    calculateMatrix();
    return undefined;
  }, [calculateMatrix]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(calculateMatrix, refreshInterval * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, calculateMatrix]);

  // Configuration update handler
  const setConfiguration = useCallback((newConfig: MatrixConfiguration) => {
    setConfig(newConfig);
  }, []);

  // Refresh data manually
  const refreshData = useCallback(async () => {
    await calculateMatrix();
  }, [calculateMatrix]);

  // Get products by category
  const getProductsByCategory = useCallback((category: MenuCategory): MenuEngineeringData[] => {
    if (!matrix) return [];
    
    switch (category) {
      case MenuCategory.STARS: return matrix.stars;
      case MenuCategory.PLOWHORSES: return matrix.plowhorses;
      case MenuCategory.PUZZLES: return matrix.puzzles;
      case MenuCategory.DOGS: return matrix.dogs;
      default: return [];
    }
  }, [matrix]);

  // Get top recommendations
  const getTopRecommendations = useCallback((limit: number = 5): StrategyRecommendation[] => {
    if (!matrix) return [];
    
    return matrix.strategicActions
      .sort((a, b) => {
        // Sort by priority first, then by expected impact
        const priorityOrder = { immediate: 0, short_term: 1, long_term: 2 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        // If same priority, prefer higher impact strategies
        return b.expectedImpact.length - a.expectedImpact.length;
      })
      .slice(0, limit);
  }, [matrix]);

  // Get category summary
  const getCategorySummary = useCallback(() => {
    if (!matrix) {
      return { stars: 0, plowhorses: 0, puzzles: 0, dogs: 0 };
    }
    
    return {
      stars: matrix.stars.length,
      plowhorses: matrix.plowhorses.length,
      puzzles: matrix.puzzles.length,
      dogs: matrix.dogs.length
    };
  }, [matrix]);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    if (!matrix) {
      return {
        totalRevenue: 0,
        totalProfit: 0,
        averageMargin: 0,
        menuHealthScore: 0
      };
    }
    
    const { performanceMetrics } = matrix;
    const totalRevenue = matrix.totalRevenue;
    const totalProfit = Object.values(performanceMetrics.profitByCategory).reduce((sum, profit) => sum + profit, 0);
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    return {
      totalRevenue,
      totalProfit,
      averageMargin,
      menuHealthScore: performanceMetrics.menuHealthScore
    };
  }, [matrix]);

  // Memoized return value
  return useMemo(() => ({
    matrix,
    loading,
    error,
    configuration: config,
    setConfiguration,
    refreshData,
    getProductsByCategory,
    getTopRecommendations,
    getCategorySummary,
    getPerformanceMetrics
  }), [
    matrix,
    loading,
    error,
    config,
    setConfiguration,
    refreshData,
    getProductsByCategory,
    getTopRecommendations,
    getCategorySummary,
    getPerformanceMetrics
  ]);
};