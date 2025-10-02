import { useState } from 'react';
import { Stack, Typography, Button, Icon, Badge, Card } from '@/shared/ui';
import { CubeIcon, PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useMaterials } from '@/store/materialsStore';
import { formatCurrency } from '@/business-logic/shared/decimalUtils';

import { logger } from '@/lib/logging';
interface InventoryTabProps {
  onStockUpdate: (itemId: string, newStock: number) => Promise<void>;
  onBulkAction: (action: string, itemIds: string[]) => Promise<void>;
  onAddMaterial?: () => void;
  performanceMode?: boolean;
}

export function InventoryTab({
  onStockUpdate,
  onBulkAction,
  onAddMaterial,
  performanceMode = false
}: InventoryTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { getFilteredItems } = useMaterials();
  const materials = getFilteredItems();

  const handleQuickUpdate = async (itemId: string, newStock: number) => {
    setIsLoading(true);
    try {
      await onStockUpdate(itemId, newStock);
    } catch (error) {
      logger.error('MaterialsStore', 'Error updating stock:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStockStatus = (item: any) => {
    if (item.stock < item.minStock * 0.5) return 'critical';
    if (item.stock <= item.minStock) return 'low';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'red';
      case 'low': return 'yellow';
      default: return 'green';
    }
  };

  return (
    <Stack direction="column" gap="lg">
      <Stack direction="row" justify="space-between" align="center">
        <Typography variant="heading" size="lg">
          Gestión de Inventario ({materials.length} items)
        </Typography>
        <Button
          variant="solid"
          size="sm"
          onClick={onAddMaterial}
          disabled={isLoading || !onAddMaterial}
        >
          <Icon icon={PlusIcon} size="sm" />
          Agregar Item
        </Button>
      </Stack>

      {/* Real Materials List */}
      <Stack direction="column" gap="sm">
        {materials.length === 0 ? (
          <Stack
            direction="column"
            gap="md"
            align="center"
            justify="center"
            minH="200px"
            bg="gray.50"
            borderRadius="md"
            p="xl"
          >
            <Icon icon={CubeIcon} size="xl" color="gray.400" />
            <Typography variant="heading" size="md" color="gray.600">
              No hay materiales disponibles
            </Typography>
            <Typography variant="body" color="gray.500" textAlign="center">
              Los datos están cargando o no hay materiales en el inventario
            </Typography>
          </Stack>
        ) : (
          materials.map((item) => {
            const status = getStockStatus(item);
            const statusColor = getStatusColor(status);

            return (
              <Card.Root key={item.id} variant="outline" size="sm">
                <Card.Body>
                  <Stack direction="row" justify="space-between" align="center">
                    <Stack direction="column" gap="xs" flex="1">
                      <Stack direction="row" align="center" gap="sm">
                        <Typography variant="heading" size="sm">
                          {item.name}
                        </Typography>
                        <Badge colorPalette={statusColor} size="sm">
                          {item.abcClass || 'N/A'}
                        </Badge>
                        {status === 'critical' && (
                          <Icon icon={ExclamationTriangleIcon} size="sm" color="red.500" />
                        )}
                      </Stack>
                      <Typography variant="body" size="sm" color="gray.600">
                        {item.description || 'Sin descripción'}
                      </Typography>
                      <Stack direction="row" gap="md">
                        <Typography variant="caption" color="gray.500">
                          Stock: {item.stock} {item.unit}
                        </Typography>
                        <Typography variant="caption" color="gray.500">
                          Min: {item.minStock} {item.unit}
                        </Typography>
                        <Typography variant="caption" color="gray.500">
                          Costo: {formatCurrency(item.unit_cost || 0)}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack direction="row" gap="sm">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => handleQuickUpdate(item.id, Math.max(0, item.stock - 1))}
                      >
                        -1
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => handleQuickUpdate(item.id, item.stock + 1)}
                      >
                        +1
                      </Button>
                      <Button
                        size="sm"
                        variant="solid"
                        disabled={isLoading}
                        onClick={() => handleQuickUpdate(item.id, item.minStock)}
                      >
                        Min
                      </Button>
                    </Stack>
                  </Stack>
                </Card.Body>
              </Card.Root>
            );
          })
        )}
      </Stack>

      {performanceMode && (
        <Typography variant="caption" color="orange.500">
          Modo de rendimiento activado - Animaciones reducidas
        </Typography>
      )}
    </Stack>
  );
}