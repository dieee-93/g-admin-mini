import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Spinner,
  AspectRatio,
  Portal,
  Separator
} from '@chakra-ui/react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { notify } from '@/lib/notifications';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import {
  MenuCategory,
  type MenuEngineeringMatrix as MatrixData,
  type MenuEngineeringData,
  type MatrixConfiguration,
  type StrategyRecommendation
} from '../types/menuEngineering';
import {
  calculateMenuEngineeringMatrix,
  getCategoryColor,
  getCategoryIcon,
  getCategoryDisplayName,
  DEFAULT_MATRIX_CONFIG
} from '../logic/menuEngineeringCalculations';
import { StrategyRecommendations } from './StrategyRecommendations';

interface MenuEngineeringMatrixProps {
  onProductSelect?: (product: MenuEngineeringData) => void;
  onStrategySelect?: (recommendation: StrategyRecommendation) => void;
  refreshInterval?: number;
}

interface ProductBubbleProps {
  product: MenuEngineeringData;
  x: number;
  y: number;
  size: number;
  color: string;
  onClick: (product: MenuEngineeringData) => void;
  onMouseEnter: (product: MenuEngineeringData, x: number, y: number) => void;
  onMouseLeave: () => void;
}

const ProductBubble: React.FC<ProductBubbleProps> = ({
  product,
  x,
  y,
  size,
  color,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => (
  <circle
    cx={x}
    cy={y}
    r={size}
    fill={color}
    opacity={0.8}
    stroke="white"
    strokeWidth={2}
    cursor="pointer"
    onClick={() => onClick(product)}
    onMouseEnter={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      onMouseEnter(product, rect.left + rect.width / 2, rect.top);
    }}
    onMouseLeave={onMouseLeave}
    style={{
      transition: 'all 0.2s ease',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
    }}
  />
);

interface TooltipProps {
  product: MenuEngineeringData | null;
  x: number;
  y: number;
  show: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ product, x, y, show }) => {
  if (!show || !product) return null;

  return (
    <Portal>
      <Box
        position="fixed"
        bg="gray.900"
        color="white"
        p={3}
        borderRadius="md"
        fontSize="sm"
        zIndex={1000}
        transform="translate(-50%, -100%)"
        left={x}
        top={y - 10}
        pointerEvents="none"
        minW="200px"
      >
        <VStack gap={1} align="start">
          <HStack>
            <Text fontSize="lg">{getCategoryIcon(product.menuCategory)}</Text>
            <Text fontWeight="bold">{product.productName}</Text>
          </HStack>
          <Separator />
          <Text>Popularidad: {product.popularityIndex.toFixed(1)}%</Text>
          <Text>Rentabilidad: {product.profitabilityIndex.toFixed(1)}%</Text>
          <Text>Ingresos: ${product.totalRevenue.toLocaleString()}</Text>
          <Text>Margen: ${product.contributionMargin.toLocaleString()}</Text>
          <Text fontSize="xs" color="gray.300">
            Categoría: {getCategoryDisplayName(product.menuCategory)}
          </Text>
        </VStack>
      </Box>
    </Portal>
  );
};

export const MenuEngineeringMatrix: React.FC<MenuEngineeringMatrixProps> = ({
  onProductSelect,
  onStrategySelect,
  refreshInterval = 30
}) => {
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<MatrixConfiguration>(DEFAULT_MATRIX_CONFIG);
  const [selectedCategories, setSelectedCategories] = useState<Set<MenuCategory>>(
    new Set([MenuCategory.STARS, MenuCategory.PLOWHORSES, MenuCategory.PUZZLES, MenuCategory.DOGS])
  );
  const [hoveredProduct, setHoveredProduct] = useState<MenuEngineeringData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Mock data loading - replace with real API call
  const loadMatrixData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock sales data - replace with real data from productApi
      const mockSalesData = [
        { productId: '1', productName: 'Hamburguesa Clásica', unitsSold: 150, totalRevenue: 2250, totalCost: 900, averagePrice: 15, salesDates: [] },
        { productId: '2', productName: 'Pizza Margherita', unitsSold: 120, totalRevenue: 2400, totalCost: 1000, averagePrice: 20, salesDates: [] },
        { productId: '3', productName: 'Ensalada César', unitsSold: 80, totalRevenue: 1200, totalCost: 400, averagePrice: 15, salesDates: [] },
        { productId: '4', productName: 'Pasta Carbonara', unitsSold: 60, totalRevenue: 1080, totalCost: 600, averagePrice: 18, salesDates: [] },
        { productId: '5', productName: 'Sopa del Día', unitsSold: 30, totalRevenue: 300, totalCost: 180, averagePrice: 10, salesDates: [] },
        { productId: '6', productName: 'Filete Premium', unitsSold: 25, totalRevenue: 875, totalCost: 500, averagePrice: 35, salesDates: [] }
      ];

      // Calculate matrix with current configuration
      const matrix = calculateMenuEngineeringMatrix(mockSalesData, config);
      setMatrixData(matrix);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      notify.error({
        title: "Error al cargar análisis",
        description: "No se pudieron cargar los datos del Menu Engineering Matrix"
      });
    } finally {
      setLoading(false);
    }
  }, [config]);

  // Load data on mount and when config changes
  useEffect(() => {
    loadMatrixData();
  }, [loadMatrixData]);

  // Auto-refresh data
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(loadMatrixData, refreshInterval * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [loadMatrixData, refreshInterval]);

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    setConfig(prev => ({ ...prev, analysisPeriodDays: days }));
  };

  // Toggle category filter
  const toggleCategory = (category: MenuCategory) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Get filtered products for visualization
  const filteredProducts = useMemo(() => {
    if (!matrixData) return [];
    
    const allProducts = [
      ...matrixData.stars,
      ...matrixData.plowhorses,
      ...matrixData.puzzles,
      ...matrixData.dogs
    ];
    
    return allProducts.filter(product => selectedCategories.has(product.menuCategory));
  }, [matrixData, selectedCategories]);

  // Handle product hover
  const handleProductHover = (product: MenuEngineeringData, x: number, y: number) => {
    setHoveredProduct(product);
    setTooltipPosition({ x, y });
  };

  const handleProductLeave = () => {
    setHoveredProduct(null);
  };

  // Handle product click
  const handleProductClick = (product: MenuEngineeringData) => {
    onProductSelect?.(product);
    notify.info({
      title: product.productName,
      description: `Categoría: ${getCategoryDisplayName(product.menuCategory)}`
    });
  };

  // Render matrix SVG
  const renderMatrix = () => {
    if (!matrixData || filteredProducts.length === 0) return null;

    const width = 600;
    const height = 600;
    const padding = 60;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;

    // Calculate scales
    const maxPopularity = Math.max(200, Math.max(...filteredProducts.map(p => p.popularityIndex)));
    const maxProfitability = Math.max(200, Math.max(...filteredProducts.map(p => p.profitabilityIndex)));
    const maxRevenue = Math.max(...filteredProducts.map(p => p.totalRevenue));

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        {/* Background quadrants */}
        <defs>
          <pattern id="quadrantGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
          </pattern>
        </defs>
        
        <rect x={padding} y={padding} width={plotWidth} height={plotHeight} fill="url(#quadrantGrid)" />
        
        {/* Quadrant lines */}
        <line 
          x1={padding + plotWidth/2} y1={padding} 
          x2={padding + plotWidth/2} y2={padding + plotHeight} 
          stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeDasharray="5,5"
        />
        <line 
          x1={padding} y1={padding + plotHeight/2} 
          x2={padding + plotWidth} y2={padding + plotHeight/2} 
          stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeDasharray="5,5"
        />

        {/* Quadrant labels */}
        <text x={padding + plotWidth * 0.75} y={padding + 20} textAnchor="middle" fontSize="14" fontWeight="bold" fill="gold">
          ⭐ ESTRELLAS
        </text>
        <text x={padding + plotWidth * 0.25} y={padding + 20} textAnchor="middle" fontSize="14" fontWeight="bold" fill="orange">
          🧩 ROMPECABEZAS  
        </text>
        <text x={padding + plotWidth * 0.75} y={padding + plotHeight - 10} textAnchor="middle" fontSize="14" fontWeight="bold" fill="blue">
          🐎 CABALLOS
        </text>
        <text x={padding + plotWidth * 0.25} y={padding + plotHeight - 10} textAnchor="middle" fontSize="14" fontWeight="bold" fill="red">
          🐕 PERROS
        </text>

        {/* Axes */}
        <line x1={padding} y1={padding + plotHeight} x2={padding + plotWidth} y2={padding + plotHeight} stroke="black" strokeWidth="2"/>
        <line x1={padding} y1={padding} x2={padding} y2={padding + plotHeight} stroke="black" strokeWidth="2"/>

        {/* Axis labels */}
        <text x={padding + plotWidth/2} y={height - 10} textAnchor="middle" fontSize="16" fontWeight="bold">
          Popularidad (% de ventas totales)
        </text>
        <text x={20} y={padding + plotHeight/2} textAnchor="middle" fontSize="16" fontWeight="bold" transform={`rotate(-90, 20, ${padding + plotHeight/2})`}>
          Rentabilidad (% vs promedio)
        </text>

        {/* Scale markers */}
        {[0, 50, 100, 150, 200].map(value => (
          <g key={`x-${value}`}>
            <line 
              x1={padding + (value / maxPopularity) * plotWidth} 
              y1={padding + plotHeight} 
              x2={padding + (value / maxPopularity) * plotWidth} 
              y2={padding + plotHeight + 5} 
              stroke="black" 
            />
            <text 
              x={padding + (value / maxPopularity) * plotWidth} 
              y={padding + plotHeight + 20} 
              textAnchor="middle" 
              fontSize="12"
            >
              {value}%
            </text>
          </g>
        ))}

        {[0, 50, 100, 150, 200].map(value => (
          <g key={`y-${value}`}>
            <line 
              x1={padding - 5} 
              y1={padding + plotHeight - (value / maxProfitability) * plotHeight} 
              x2={padding} 
              y2={padding + plotHeight - (value / maxProfitability) * plotHeight} 
              stroke="black" 
            />
            <text 
              x={padding - 10} 
              y={padding + plotHeight - (value / maxProfitability) * plotHeight + 4} 
              textAnchor="end" 
              fontSize="12"
            >
              {value}%
            </text>
          </g>
        ))}

        {/* Products */}
        {filteredProducts.map(product => {
          const x = padding + (product.popularityIndex / maxPopularity) * plotWidth;
          const y = padding + plotHeight - (product.profitabilityIndex / maxProfitability) * plotHeight;
          const size = Math.max(5, Math.min(20, (product.totalRevenue / maxRevenue) * 20));
          const color = getCategoryColor(product.menuCategory);

          return (
            <ProductBubble
              key={product.productId}
              product={product}
              x={x}
              y={y}
              size={size}
              color={color}
              onClick={handleProductClick}
              onMouseEnter={handleProductHover}
              onMouseLeave={handleProductLeave}
            />
          );
        })}
      </svg>
    );
  };

  if (loading) {
    return (
      <VStack justify="center" h="400px" gap={4}>
        <Spinner size="xl" color="brand.500" />
        <Text>Cargando análisis Menu Engineering...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Box p={4} borderWidth="1px" borderColor="red.500" borderRadius="md" bg="red.50">
        <Text color="red.700" fontWeight="bold">Error al cargar</Text>
        <Text color="red.600">{error}</Text>
      </Box>
    );
  }

  if (!matrixData) return null;

  return (
    <Container maxW="full" p={0}>
      <VStack gap={6} align="stretch">
        <ModuleHeader
          title="Menu Engineering Matrix"
          color="purple"
          rightActions={
            <HStack gap={2}>
              <Box>
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                >
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                  <option value="90d">Últimos 90 días</option>
                </select>
              </Box>
              <Button
                variant="outline"
                size="sm"
                onClick={loadMatrixData}
                disabled={loading}
              >
                {loading ? "..." : "Actualizar"}
              </Button>
            </HStack>
          }
        />

        <Grid templateColumns={{ base: "1fr", lg: "300px 1fr 350px" }} gap={6}>
          {/* Controls Panel */}
          <GridItem>
            <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
              <VStack align="stretch" gap={4}>
                <Text fontWeight="semibold" fontSize="lg">
                  <ChartBarIcon className="w-5 h-5 inline mr-2" />
                  Filtros
                </Text>
                
                <VStack align="stretch" gap={3}>
                  <Text fontWeight="medium" fontSize="sm">Categorías</Text>
                  <VStack align="stretch" gap={2}>
                    {Object.values(MenuCategory).map(category => (
                      <Badge
                        key={category}
                        colorScheme={selectedCategories.has(category) ? "brand" : "gray"}
                        variant={selectedCategories.has(category) ? "solid" : "outline"}
                        cursor="pointer"
                        onClick={() => toggleCategory(category)}
                        p={2}
                        borderRadius="md"
                        fontSize="xs"
                      >
                        <HStack>
                          <Text>{getCategoryIcon(category)}</Text>
                          <Text>{getCategoryDisplayName(category)}</Text>
                        </HStack>
                      </Badge>
                    ))}
                  </VStack>
                </VStack>

                <Separator />

                <VStack align="stretch" gap={2}>
                  <Text fontWeight="medium" fontSize="sm">Resumen</Text>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="gray.600">Productos analizados:</Text>
                    <Text fontSize="xs" fontWeight="bold">{matrixData.totalProducts}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="gray.600">Ingresos totales:</Text>
                    <Text fontSize="xs" fontWeight="bold">${matrixData.totalRevenue.toLocaleString()}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="gray.600">Salud del menú:</Text>
                    <Badge colorScheme={matrixData.performanceMetrics.menuHealthScore > 70 ? "green" : "orange"}>
                      {matrixData.performanceMetrics.menuHealthScore.toFixed(0)}/100
                    </Badge>
                  </HStack>
                </VStack>
              </VStack>
            </Box>
          </GridItem>

          {/* Matrix Visualization */}
          <GridItem>
            <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
              <AspectRatio ratio={1} w="full">
                <Box
                  position="relative"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  bg="white"
                  overflow="hidden"
                >
                  {renderMatrix()}
                </Box>
              </AspectRatio>
            </Box>
          </GridItem>

          {/* Strategy Recommendations */}
          <GridItem>
            <StrategyRecommendations 
              recommendations={matrixData.strategicActions}
              onImplementStrategy={onStrategySelect}
            />
          </GridItem>
        </Grid>
      </VStack>

      <Tooltip
        product={hoveredProduct}
        x={tooltipPosition.x}
        y={tooltipPosition.y}
        show={!!hoveredProduct}
      />
    </Container>
  );
};