// src/features/sales/components/StockSummaryWidget.tsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  HStack,
  Text, 
  Card,
  Badge,
  Button,
  Skeleton,
  Alert
} from '@chakra-ui/react';
import { 
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import { fetchProductsWithAvailability } from '../data/saleApi';
import { toaster } from '@/components/ui/toaster';

interface ProductSummary {
  id: string;
  name: string;
  availability: number;
  unit: string;
  cost: number;
}

interface StockStats {
  totalProducts: number;
  availableProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
}

interface StockSummaryWidgetProps {
  onProductSelect?: (productId: string) => void;
  showActions?: boolean;
  maxItems?: number;
}

export function StockSummaryWidget({ 
  onProductSelect,
  showActions = true,
  maxItems = 5 
}: StockSummaryWidgetProps) {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StockStats>({
    totalProducts: 0,
    availableProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalValue: 0
  });

  useEffect(() => {
    loadStockSummary();
  }, []);

  const loadStockSummary = async () => {
    try {
      setLoading(true);
      const data = await fetchProductsWithAvailability();
      setProducts(data);
      
      // Calcular estadísticas
      const stats: StockStats = data.reduce((acc, product) => {
        acc.totalProducts++;
        acc.totalValue += product.cost * product.availability;
        
        if (product.availability > 0) {
          acc.availableProducts++;
          
          if (product.availability <= 5) {
            acc.lowStockProducts++;
          }
        } else {
          acc.outOfStockProducts++;
        }
        
        return acc;
      }, {
        totalProducts: 0,
        availableProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalValue: 0
      });
      
      setStats(stats);
      
    } catch (error) {
      console.error('Error loading stock summary:', error);
      toaster.create({
        title: "Error al cargar resumen",
        description: "No se pudo cargar el resumen de stock",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusColor = (availability: number) => {
    if (availability === 0) return 'red';
    if (availability <= 5) return 'orange';
    return 'green';
  };

  const getStockStatusIcon = (availability: number) => {
    if (availability === 0) return XCircleIcon;
    if (availability <= 5) return ExclamationTriangleIcon;
    return CheckCircleIcon;
  };

  if (loading) {
    return (
      <Card.Root>
        <Card.Header>
          <Card.Title>
            <CubeIcon className="w-5 h-5 inline mr-2" />
            Resumen de Stock
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <VStack gap="3">
            <Skeleton height="60px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <HStack justify="space-between" align="center">
          <Card.Title>
            <CubeIcon className="w-5 h-5 inline mr-2" />
            Resumen de Stock
          </Card.Title>
          {showActions && (
            <Button
              size="sm"
              variant="ghost"
              onClick={loadStockSummary}
              disabled={loading}
            >
              <ArrowPathIcon className="w-4 h-4" />
            </Button>
          )}
        </HStack>
      </Card.Header>
      
      <Card.Body>
        <VStack gap="4" align="stretch">
          {/* Estadísticas generales */}
          <VStack gap="3" align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">Total Productos:</Text>
              <Badge size="sm">{stats.totalProducts}</Badge>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">Disponibles:</Text>
              <Badge colorPalette="green" size="sm">{stats.availableProducts}</Badge>
            </HStack>
            
            {stats.lowStockProducts > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Stock Bajo:</Text>
                <Badge colorPalette="orange" size="sm">{stats.lowStockProducts}</Badge>
              </HStack>
            )}
            
            {stats.outOfStockProducts > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Sin Stock:</Text>
                <Badge colorPalette="red" size="sm">{stats.outOfStockProducts}</Badge>
              </HStack>
            )}
            
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">Valor Total:</Text>
              <Text fontSize="sm" fontWeight="bold" color="blue.600">
                ${stats.totalValue.toFixed(2)}
              </Text>
            </HStack>
          </VStack>

          {/* Alertas críticas */}
          {stats.outOfStockProducts > 0 && (
            <Alert.Root status="error" size="sm">
              <Alert.Indicator>
                <XCircleIcon className="w-4 h-4" />
              </Alert.Indicator>
              <Alert.Description>
                {stats.outOfStockProducts} producto{stats.outOfStockProducts > 1 ? 's' : ''} sin stock
              </Alert.Description>
            </Alert.Root>
          )}
          
          {stats.lowStockProducts > 0 && (
            <Alert.Root status="warning" size="sm">
              <Alert.Indicator>
                <ExclamationTriangleIcon className="w-4 h-4" />
              </Alert.Indicator>
              <Alert.Description>
                {stats.lowStockProducts} producto{stats.lowStockProducts > 1 ? 's' : ''} con stock bajo
              </Alert.Description>
            </Alert.Root>
          )}

          {/* Lista de productos (limitada) */}
          {products.length > 0 && (
            <VStack gap="2" align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Productos Recientes:
              </Text>
              
              {products.slice(0, maxItems).map((product) => {
                const StatusIcon = getStockStatusIcon(product.availability);
                const colorPalette = getStockStatusColor(product.availability);
                
                return (
                  <HStack
                    key={product.id} 
                    justify="space-between" 
                    p="2" 
                    borderRadius="md"
                    bg="gray.50"
                    _hover={onProductSelect ? { bg: "gray.100", cursor: "pointer" } : {}}
                    onClick={() => onProductSelect?.(product.id)}
                  >
                    <VStack gap="0" align="start">
                      <Text fontSize="sm" fontWeight="medium">
                        {product.name}
                      </Text>
                      <HStack gap="2">
                        <Badge colorPalette={colorPalette} size="xs">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {product.availability} {product.unit}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                          ${product.cost.toFixed(2)}/u
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                );
              })}
              
              {products.length > maxItems && (
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  y {products.length - maxItems} productos más...
                </Text>
              )}
            </VStack>
          )}

          {products.length === 0 && (
            <Alert.Root status="info" size="sm">
              <Alert.Indicator>
                <CubeIcon className="w-4 h-4" />
              </Alert.Indicator>
              <Alert.Description>
                No hay productos disponibles
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}