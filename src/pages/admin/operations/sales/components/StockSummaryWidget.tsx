// src/features/sales/components/StockSummaryWidget.tsx
import { useState, useEffect } from 'react';
import { 
  Stack, 
  Typography, 
  CardWrapper ,
  Badge,
  Button,
  Alert,
  Icon
} from '@/shared/ui';
import { 
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import { fetchProductsWithAvailability } from '../services/saleApi';
import { toaster } from '@/shared/ui/toaster';

import { logger } from '@/lib/logging';
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
      
      // Transform data to match our interface
      const transformedData: ProductSummary[] = data.map((product: unknown) => ({
        id: product.id,
        name: product.name,
        availability: product.availability || 0,
        unit: product.unit || 'unidad',
        cost: product.cost || 0
      }));
      
      setProducts(transformedData);
      
      // Calcular estadísticas
      const stats: StockStats = transformedData.reduce((acc: StockStats, product: ProductSummary) => {
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
      logger.error('SalesStore', 'Error loading stock summary:', error);
      toaster.create({
        title: "Error al cargar resumen",
        description: "No se pudo cargar el resumen de stock",
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
      <CardWrapper>
        <Stack gap="md">
          <Stack direction="row" align="center" gap="sm">
            <Icon icon={CubeIcon} size="sm" />
            <Typography variant="heading" size="md" weight="semibold">
              Resumen de Stock
            </Typography>
          </Stack>
          <Stack gap="sm">
            <div style={{height: '60px', backgroundColor: 'var(--colors-bg-muted)', borderRadius: '0.375rem'}} />
            <div style={{height: '40px', backgroundColor: 'var(--colors-bg-muted)', borderRadius: '0.375rem'}} />
            <div style={{height: '40px', backgroundColor: 'var(--colors-bg-muted)', borderRadius: '0.375rem'}} />
          </Stack>
        </Stack>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper>
      <Stack gap="md">
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="row" align="center" gap="sm">
            <Icon icon={CubeIcon} size="sm" />
            <Typography variant="heading" size="md" weight="semibold">
              Resumen de Stock
            </Typography>
          </Stack>
          {showActions && (
            <Button
              size="sm"
              variant="ghost"
              onClick={loadStockSummary}
            >
              <Icon icon={ArrowPathIcon} size="xs" />
            </Button>
          )}
        </Stack>
        
        <Stack gap="lg">
          {/* Estadísticas generales */}
          <Stack gap="sm">
            <Stack direction="row" justify="space-between" align="center">
              <Typography variant="body" size="sm" color="text.secondary">Total Productos:</Typography>
              <Badge size="sm">{stats.totalProducts}</Badge>
            </Stack>
            
            <Stack direction="row" justify="space-between" align="center">
              <Typography variant="body" size="sm" color="text.secondary">Disponibles:</Typography>
              <Badge colorPalette="green" size="sm">{stats.availableProducts}</Badge>
            </Stack>
            
            {stats.lowStockProducts > 0 && (
              <Stack direction="row" justify="space-between" align="center">
                <Typography variant="body" size="sm" color="text.secondary">Stock Bajo:</Typography>
                <Badge colorPalette="orange" size="sm">{stats.lowStockProducts}</Badge>
              </Stack>
            )}
            
            {stats.outOfStockProducts > 0 && (
              <Stack direction="row" justify="space-between" align="center">
                <Typography variant="body" size="sm" color="text.secondary">Sin Stock:</Typography>
                <Badge colorPalette="red" size="sm">{stats.outOfStockProducts}</Badge>
              </Stack>
            )}
            
            <Stack direction="row" justify="space-between" align="center">
              <Typography variant="body" size="sm" color="text.secondary">Valor Total:</Typography>
              <Typography variant="body" size="sm" weight="bold" >
                ${stats.totalValue.toFixed(2)}
              </Typography>
            </Stack>
          </Stack>

          {/* Alertas críticas */}
          {stats.outOfStockProducts > 0 && (
            <Alert status="error">
              <Stack direction="row" align="center" gap="sm">
                <Icon icon={XCircleIcon} size="xs" />
                <Typography variant="body" size="sm">
                  {stats.outOfStockProducts} producto{stats.outOfStockProducts > 1 ? 's' : ''} sin stock
                </Typography>
              </Stack>
            </Alert>
          )}
          
          {stats.lowStockProducts > 0 && (
            <Alert status="warning">
              <Stack direction="row" align="center" gap="sm">
                <Icon icon={ExclamationTriangleIcon} size="xs" />
                <Typography variant="body" size="sm">
                  {stats.lowStockProducts} producto{stats.lowStockProducts > 1 ? 's' : ''} con stock bajo
                </Typography>
              </Stack>
            </Alert>
          )}

          {/* Lista de productos (limitada) */}
          {products.length > 0 && (
            <Stack gap="sm">
              <Typography variant="body" size="sm" weight="medium" color="text.primary">
                Productos Recientes:
              </Typography>
              
              {products.slice(0, maxItems).map((product) => {
                const StatusIcon = getStockStatusIcon(product.availability);
                const colorPalette = getStockStatusColor(product.availability);
                
                return (
                  <div
                    key={product.id} 
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      backgroundColor: 'var(--colors-bg-subtle)',
                      cursor: onProductSelect ? 'pointer' : 'default'
                    }}
                    onClick={() => onProductSelect?.(product.id)}
                  >
                    <Stack direction="row" justify="space-between" align="center">
                      <Stack gap="xs" align="start">
                        <Typography variant="body" size="sm" weight="medium">
                          {product.name}
                        </Typography>
                        <Stack direction="row" gap="sm" align="center">
                          <Badge colorPalette={colorPalette === 'green' ? 'success' : colorPalette === 'orange' ? 'warning' : 'error'} size="xs">
                            <Stack direction="row" align="center" gap="xs">
                              <Icon icon={StatusIcon} size="xs" />
                              <Typography variant="body" size="xs">
                                {product.availability} {product.unit}
                              </Typography>
                            </Stack>
                          </Badge>
                          <Typography variant="body" size="xs" color="text.secondary">
                            ${product.cost.toFixed(2)}/u
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </div>
                );
              })}
              
              {products.length > maxItems && (
                <Typography variant="body" size="xs" color="text.secondary" style={{textAlign: 'center'}}>
                  y {products.length - maxItems} productos más...
                </Typography>
              )}
            </Stack>
          )}

          {products.length === 0 && (
            <Alert status="info">
              <Stack direction="row" align="center" gap="sm">
                <Icon icon={CubeIcon} size="xs" />
                <Typography variant="body" size="sm">
                  No hay productos disponibles
                </Typography>
              </Stack>
            </Alert>
          )}
        </Stack>
      </Stack>
    </CardWrapper>
  );
}