/**
 * Product Analytics Enhanced using AnalyticsEngine
 * Specialized for menu engineering, profitability analysis, and product performance
 */
import React, { useEffect, useState } from 'react';
import {
  ContentLayout,
  Section,
  StatsSection,
  CardGrid,
  MetricCard,
  Typography,
  Button,
  Badge,
  Alert
} from '@/shared/ui';
import {
  CubeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  StarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { AnalyticsEngine, RFMAnalytics, TrendAnalytics } from '@/shared/services/AnalyticsEngine';
import { FinancialCalculations, QuickCalculations } from '@/business-logic/shared/FinancialCalculations';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

import { logger } from '@/lib/logging';
interface ProductData {
  id: string;
  name: string;
  category: string;
  price: number;
  estimated_cost: number;
  popularity_score?: number;
  profit_margin?: number;
  sales_volume?: number;
  total_revenue?: number;
  preparation_time?: number;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_activity?: string;
  total_value: number;
}

interface MenuEngineeringQuadrant {
  name: string;
  products: ProductData[];
  characteristics: string;
  recommendation: string;
  color: string;
}

interface ProductAnalytics {
  totalProducts: number;
  averagePrice: number;
  averageCost: number;
  averageProfitMargin: number;
  totalRevenue: number;
  categoryBreakdown: Record<string, number>;
  menuEngineeringMatrix: MenuEngineeringQuadrant[];
  topPerformers: ProductData[];
  underperformers: ProductData[];
  profitabilityDistribution: { high: number; medium: number; low: number };
}

export function ProductAnalyticsEnhanced() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock product data (would come from API)
  const mockProducts: ProductData[] = [
    {
      id: '1', name: 'Pizza Margherita', category: 'Pizzas',
      price: 25.00, estimated_cost: 8.00, popularity_score: 85,
      sales_volume: 120, total_revenue: 3000, preparation_time: 15,
      difficulty_level: 'easy', is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      total_value: 3000, profit_margin: 68, last_activity: '2024-01-15T12:00:00Z'
    },
    {
      id: '2', name: 'Hamburguesa Premium', category: 'Hamburguesas',
      price: 32.00, estimated_cost: 15.00, popularity_score: 92,
      sales_volume: 80, total_revenue: 2560, preparation_time: 12,
      difficulty_level: 'medium', is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      total_value: 2560, profit_margin: 53, last_activity: '2024-01-14T18:30:00Z'
    },
    {
      id: '3', name: 'Ensalada César', category: 'Ensaladas',
      price: 18.00, estimated_cost: 6.00, popularity_score: 45,
      sales_volume: 30, total_revenue: 540, preparation_time: 8,
      difficulty_level: 'easy', is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      total_value: 540, profit_margin: 67, last_activity: '2024-01-12T14:20:00Z'
    },
    {
      id: '4', name: 'Risotto Trufa', category: 'Pasta',
      price: 45.00, estimated_cost: 18.00, popularity_score: 25,
      sales_volume: 15, total_revenue: 675, preparation_time: 25,
      difficulty_level: 'hard', is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      total_value: 675, profit_margin: 60, last_activity: '2024-01-10T20:00:00Z'
    }
  ];

  useEffect(() => {
    setProducts(mockProducts);
    generateProductAnalytics(mockProducts);
  }, []);

  const generateProductAnalytics = async (productData: ProductData[]) => {
    setLoading(true);

    try {
      // Generate base analytics using AnalyticsEngine
      const result = await AnalyticsEngine.generateAnalytics(productData, {
        module: 'Products',
        timeRange: '30d',
        includeForecasting: true,
        includeTrends: true
      });

      // Product-specific analytics
      const menuEngineeringMatrix = generateMenuEngineeringMatrix(productData);
      const categoryBreakdown = generateCategoryBreakdown(productData);
      const profitabilityAnalysis = generateProfitabilityAnalysis(productData);

      // Top and bottom performers
      const sortedByRevenue = [...productData].sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0));
      const topPerformers = sortedByRevenue.slice(0, 3);
      const underperformers = sortedByRevenue.slice(-2);

      setAnalyticsData({
        ...result,
        menuEngineeringMatrix,
        categoryBreakdown,
        profitabilityAnalysis,
        topPerformers,
        underperformers,
        customInsights: generateProductInsights(productData)
      });

    } catch (error) {
      logger.error('App', 'Error generating product analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Menu Engineering Matrix (Boston Consulting Group style)
  const generateMenuEngineeringMatrix = (products: ProductData[]): MenuEngineeringQuadrant[] => {
    const avgPopularity = products.reduce((sum, p) => sum + (p.popularity_score || 0), 0) / products.length;
    const avgProfitMargin = products.reduce((sum, p) => sum + (p.profit_margin || 0), 0) / products.length;

    const stars = products.filter(p =>
      (p.popularity_score || 0) >= avgPopularity && (p.profit_margin || 0) >= avgProfitMargin
    );

    const plowhorses = products.filter(p =>
      (p.popularity_score || 0) >= avgPopularity && (p.profit_margin || 0) < avgProfitMargin
    );

    const puzzles = products.filter(p =>
      (p.popularity_score || 0) < avgPopularity && (p.profit_margin || 0) >= avgProfitMargin
    );

    const dogs = products.filter(p =>
      (p.popularity_score || 0) < avgPopularity && (p.profit_margin || 0) < avgProfitMargin
    );

    return [
      {
        name: 'Stars ⭐',
        products: stars,
        characteristics: 'Alta popularidad, Alto margen',
        recommendation: 'Promover y mantener',
        color: 'green'
      },
      {
        name: 'Plowhorses 🐎',
        products: plowhorses,
        characteristics: 'Alta popularidad, Bajo margen',
        recommendation: 'Reducir costos o aumentar precio',
        color: 'blue'
      },
      {
        name: 'Puzzles 🧩',
        products: puzzles,
        characteristics: 'Baja popularidad, Alto margen',
        recommendation: 'Marketing y promoción',
        color: 'yellow'
      },
      {
        name: 'Dogs 🐕',
        products: dogs,
        characteristics: 'Baja popularidad, Bajo margen',
        recommendation: 'Considerar eliminar o rediseñar',
        color: 'red'
      }
    ];
  };

  const generateCategoryBreakdown = (products: ProductData[]) => {
    return products.reduce((acc, product) => {
      const category = product.category || 'Sin categoría';
      acc[category] = {
        count: (acc[category]?.count || 0) + 1,
        revenue: (acc[category]?.revenue || 0) + (product.total_revenue || 0),
        avgMargin: (acc[category]?.avgMargin || 0) + (product.profit_margin || 0)
      };
      return acc;
    }, {} as Record<string, { count: number; revenue: number; avgMargin: number }>);
  };

  const generateProfitabilityAnalysis = (products: ProductData[]) => {
    const profitMargins = products.map(p => p.profit_margin || 0);
    const high = profitMargins.filter(m => m >= 60).length;
    const medium = profitMargins.filter(m => m >= 30 && m < 60).length;
    const low = profitMargins.filter(m => m < 30).length;

    return { high, medium, low };
  };

  const generateProductInsights = (products: ProductData[]): string[] => {
    const insights: string[] = [];

    // High profit margin products
    const highMarginProducts = products.filter(p => (p.profit_margin || 0) > 70);
    if (highMarginProducts.length > 0) {
      insights.push(`🏆 ${highMarginProducts.length} productos con excelente margen (>70%)`);
    }

    // Low popularity high margin (puzzles)
    const puzzleProducts = products.filter(p =>
      (p.profit_margin || 0) > 50 && (p.popularity_score || 0) < 50
    );
    if (puzzleProducts.length > 0) {
      insights.push(`🧩 ${puzzleProducts.length} productos rentables necesitan más promoción`);
    }

    // Complex high-volume products
    const complexPopular = products.filter(p =>
      p.difficulty_level === 'hard' && (p.sales_volume || 0) > 50
    );
    if (complexPopular.length > 0) {
      insights.push(`⚠️ Productos complejos con alta demanda - revisar proceso de cocina`);
    }

    // Category performance
    const categoryRevenue = generateCategoryBreakdown(products);
    const topCategory = Object.entries(categoryRevenue)
      .sort(([,a], [,b]) => b.revenue - a.revenue)[0];

    if (topCategory) {
      insights.push(`📊 ${topCategory[0]} es la categoría más rentable (${DecimalUtils.formatCurrency(topCategory[1].revenue)})`);
    }

    return insights;
  };

  const calculateCustomMetrics = () => {
    if (!products.length) return null;

    const totalRevenue = products.reduce((sum, p) => sum + (p.total_revenue || 0), 0);
    const totalCosts = products.reduce((sum, p) => sum + (p.estimated_cost * (p.sales_volume || 0)), 0);
    const avgMargin = products.reduce((sum, p) => sum + (p.profit_margin || 0), 0) / products.length;
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;

    return {
      totalRevenue,
      totalCosts,
      avgMargin,
      avgPrice,
      totalProfit: totalRevenue - totalCosts
    };
  };

  const customMetrics = calculateCustomMetrics();

  if (loading) {
    return (
      <ContentLayout>
        <Alert status="info" title="Generando análisis de productos">
          Procesando datos de menu engineering...
        </Alert>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      {/* Analytics Header */}
      <Section variant="flat" title="📊 Product Analytics & Menu Engineering">
        <Typography size="sm" color="text.muted">
          Análisis avanzado de {products.length} productos con matriz de menu engineering
        </Typography>

        <Button
          size="sm"
          variant="outline"
          onClick={() => generateProductAnalytics(products)}
          loading={loading}
        >
          <ArrowPathIcon className="w-4 h-4" />
          Actualizar Analytics
        </Button>
      </Section>

      {/* Key Business Metrics */}
      <StatsSection>
        <CardGrid columns={{ base: 1, md: 4 }}>
          <MetricCard
            title="Revenue Total"
            value={customMetrics ? DecimalUtils.formatCurrency(customMetrics.totalRevenue) : '$0'}
            subtitle="ventas de productos"
            icon={CurrencyDollarIcon}
            colorPalette="green"
          />
          <MetricCard
            title="Margen Promedio"
            value={customMetrics ? `${customMetrics.avgMargin.toFixed(1)}%` : '0%'}
            subtitle="rentabilidad general"
            icon={ChartBarIcon}
            colorPalette={customMetrics && customMetrics.avgMargin > 50 ? "green" : "yellow"}
          />
          <MetricCard
            title="Precio Promedio"
            value={customMetrics ? DecimalUtils.formatCurrency(customMetrics.avgPrice) : '$0'}
            subtitle="ticket promedio"
            icon={TrendingUpIcon}
          />
          <MetricCard
            title="Productos Activos"
            value={products.filter(p => p.is_active).length}
            subtitle="en el menú"
            icon={CubeIcon}
          />
        </CardGrid>
      </StatsSection>

      {/* Insights Section */}
      {analyticsData?.customInsights && analyticsData.customInsights.length > 0 && (
        <Section variant="elevated" title="💡 Business Insights">
          {analyticsData.customInsights.map((insight: string, index: number) => (
            <Typography key={index} size="sm" mb="xs">
              {insight}
            </Typography>
          ))}
        </Section>
      )}

      {/* Menu Engineering Matrix */}
      {analyticsData?.menuEngineeringMatrix && (
        <Section variant="elevated" title="🎯 Menu Engineering Matrix">
          <Typography size="sm" color="text.muted" mb="md">
            Clasificación de productos por popularidad vs rentabilidad
          </Typography>

          <CardGrid columns={{ base: 1, md: 2 }}>
            {analyticsData.menuEngineeringMatrix.map((quadrant: MenuEngineeringQuadrant) => (
              <div
                key={quadrant.name}
                style={{
                  padding: '16px',
                  border: '2px solid var(--border-subtle)',
                  borderRadius: '8px',
                  borderColor: `var(--colors-${quadrant.color}-300)`
                }}
              >
                <Typography size="sm" fontWeight="bold" mb="xs" color={`${quadrant.color}.600`}>
                  {quadrant.name} ({quadrant.products.length} productos)
                </Typography>
                <Typography size="xs" color="text.muted" mb="xs">
                  {quadrant.characteristics}
                </Typography>
                <Typography size="xs" color={`${quadrant.color}.600`} mb="sm" fontWeight="medium">
                  📋 {quadrant.recommendation}
                </Typography>

                {quadrant.products.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {quadrant.products.slice(0, 3).map((product) => (
                      <div key={product.id} style={{
                        padding: '8px',
                        backgroundColor: 'var(--colors-gray-50)',
                        borderRadius: '4px'
                      }}>
                        <Typography size="xs" fontWeight="medium">{product.name}</Typography>
                        <Typography size="xs" color="text.muted">
                          Margen: {product.profit_margin?.toFixed(1)}% |
                          Pop: {product.popularity_score} |
                          Rev: {DecimalUtils.formatCurrency(product.total_revenue || 0)}
                        </Typography>
                      </div>
                    ))}
                    {quadrant.products.length > 3 && (
                      <Typography size="xs" color="text.muted">
                        +{quadrant.products.length - 3} más...
                      </Typography>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardGrid>
        </Section>
      )}

      {/* Category Performance */}
      {analyticsData?.categoryBreakdown && (
        <Section variant="elevated" title="📈 Performance por Categoría">
          <CardGrid columns={{ base: 1, md: 3 }}>
            {Object.entries(analyticsData.categoryBreakdown).map(([category, data]: [string, any]) => (
              <div key={category} style={{
                padding: '16px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px'
              }}>
                <Typography size="sm" fontWeight="medium" mb="xs">{category}</Typography>
                <Typography size="lg" fontWeight="bold" color="blue.600" mb="xs">
                  {DecimalUtils.formatCurrency(data.revenue)}
                </Typography>
                <Typography size="xs" color="text.muted">
                  {data.count} productos | Margen avg: {(data.avgMargin / data.count).toFixed(1)}%
                </Typography>
              </div>
            ))}
          </CardGrid>
        </Section>
      )}

      {/* Top & Bottom Performers */}
      <CardGrid columns={{ base: 1, md: 2 }}>
        {/* Top Performers */}
        {analyticsData?.topPerformers && (
          <Section variant="elevated" title="🏆 Top Performers">
            {analyticsData.topPerformers.map((product: ProductData, index: number) => (
              <div key={product.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: index === 0 ? 'var(--colors-green-50)' : 'var(--colors-gray-50)',
                borderRadius: '6px',
                marginBottom: '8px'
              }}>
                <div>
                  <Typography size="sm" fontWeight="medium">{product.name}</Typography>
                  <Typography size="xs" color="text.muted">{product.category}</Typography>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Typography size="sm" fontWeight="bold" color="green.600">
                    {DecimalUtils.formatCurrency(product.total_revenue || 0)}
                  </Typography>
                  <Typography size="xs" color="text.muted">
                    {product.profit_margin?.toFixed(1)}% margen
                  </Typography>
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Underperformers */}
        {analyticsData?.underperformers && (
          <Section variant="elevated" title="⚠️ Necesitan Atención">
            {analyticsData.underperformers.map((product: ProductData) => (
              <div key={product.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: 'var(--colors-yellow-50)',
                borderRadius: '6px',
                marginBottom: '8px'
              }}>
                <div>
                  <Typography size="sm" fontWeight="medium">{product.name}</Typography>
                  <Typography size="xs" color="text.muted">{product.category}</Typography>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Typography size="sm" color="orange.600">
                    {DecimalUtils.formatCurrency(product.total_revenue || 0)}
                  </Typography>
                  <Typography size="xs" color="text.muted">
                    Pop: {product.popularity_score}
                  </Typography>
                </div>
              </div>
            ))}
          </Section>
        )}
      </CardGrid>

      {/* Profitability Distribution */}
      {analyticsData?.profitabilityAnalysis && (
        <Section variant="elevated" title="💰 Distribución de Rentabilidad">
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>
                {analyticsData.profitabilityAnalysis.high}
              </div>
              <Typography size="xs" color="text.muted">Alta (≥60%)</Typography>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'orange' }}>
                {analyticsData.profitabilityAnalysis.medium}
              </div>
              <Typography size="xs" color="text.muted">Media (30-60%)</Typography>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'red' }}>
                {analyticsData.profitabilityAnalysis.low}
              </div>
              <Typography size="xs" color="text.muted">Baja (&lt;30%)</Typography>
            </div>
          </div>
        </Section>
      )}
    </ContentLayout>
  );
}