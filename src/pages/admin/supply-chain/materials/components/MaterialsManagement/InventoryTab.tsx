import { useState, useMemo } from 'react';
import { Stack, Typography, Button, Icon, Badge, Card, Box } from '@/shared/ui';
import { CubeIcon, PlusIcon, ExclamationTriangleIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Collapsible } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useMaterials } from '@/store/materialsStore';
import { formatCurrency, formatQuantity } from '@/business-logic/shared/decimalUtils';
import { notify } from '@/lib/notifications';

import { logger } from '@/lib/logging';

// ============================================================================
// PURE UTILITY FUNCTIONS (Outside component for performance)
// ============================================================================

type MaterialWithStock = {
  id: string;
  stock: number;
  minStock?: number;
  [key: string]: unknown;
};

/**
 * Determines stock status based on current stock vs minimum threshold
 * Pure function - no dependencies on component state
 */
const getStockStatus = (item: MaterialWithStock): 'critical' | 'low' | 'healthy' => {
  if (!item.minStock) return 'healthy';
  if (item.stock < item.minStock * 0.5) return 'critical';
  if (item.stock <= item.minStock) return 'low';
  return 'healthy';
};

/**
 * Maps stock status to color palette
 */
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'critical': return 'red';
    case 'low': return 'yellow';
    default: return 'green';
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

interface InventoryTabProps {
  onStockUpdate: (itemId: string, newStock: number) => Promise<void>;
  onBulkAction: (action: string, itemIds: string[]) => Promise<void>;
  onAddMaterial?: () => void;
  performanceMode?: boolean;
}

export function InventoryTab({
  onStockUpdate,
  onAddMaterial,
  performanceMode = false
}: InventoryTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLowStockOpen, setIsLowStockOpen] = useState(true);
  const [isHealthyOpen, setIsHealthyOpen] = useState(false);
  const [criticalPage, setCriticalPage] = useState(1);
  const [lowPage, setLowPage] = useState(1);
  const [healthyPage, setHealthyPage] = useState(1);

  const { getFilteredItems } = useMaterials();
  const materials = getFilteredItems();

  // ✅ Virtualization config
  const ITEMS_PER_PAGE = 20;

  const handleQuickUpdate = async (itemId: string, newStock: number, itemName: string) => {
    setIsLoading(true);
    try {
      await onStockUpdate(itemId, newStock);
      const material = materials.find(m => m.id === itemId);
      notify.success({
        title: 'Stock actualizado',
        description: `${itemName}: ${formatQuantity(newStock, material?.unit || '', 1)}`
      });
    } catch (error) {
      logger.error('MaterialsStore', 'Error updating stock:', error);
      notify.error({
        title: 'Error al actualizar stock',
        description: 'No se pudo actualizar el stock. Intenta nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Group materials by criticality with pagination support
  const groupedMaterials = useMemo(() => {
    const critical: MaterialWithStock[] = [];
    const low: MaterialWithStock[] = [];
    const healthy: MaterialWithStock[] = [];

    materials.forEach((item) => {
      const status = getStockStatus(item);
      if (status === 'critical') critical.push(item);
      else if (status === 'low') low.push(item);
      else healthy.push(item);
    });

    return {
      critical: {
        all: critical,
        paged: critical.slice(0, criticalPage * ITEMS_PER_PAGE),
        hasMore: critical.length > criticalPage * ITEMS_PER_PAGE,
        total: critical.length
      },
      low: {
        all: low,
        paged: low.slice(0, lowPage * ITEMS_PER_PAGE),
        hasMore: low.length > lowPage * ITEMS_PER_PAGE,
        total: low.length
      },
      healthy: {
        all: healthy,
        paged: healthy.slice(0, healthyPage * ITEMS_PER_PAGE),
        hasMore: healthy.length > healthyPage * ITEMS_PER_PAGE,
        total: healthy.length
      }
    };
  }, [materials, criticalPage, lowPage, healthyPage, ITEMS_PER_PAGE]);

  // Render material card (reusable component)
  const renderMaterialCard = (item: MaterialWithStock) => {
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
                  Stock: {formatQuantity(item.stock, item.unit, 1)}
                </Typography>
                <Typography variant="caption" color="gray.500">
                  Min: {formatQuantity(item.minStock, item.unit, 1)}
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
                disabled={isLoading || item.stock <= 0}
                onClick={() => {
                  if (item.stock > 0) {
                    handleQuickUpdate(item.id, item.stock - 1, item.name);
                  } else {
                    notify.warning({
                      title: 'Stock mínimo alcanzado',
                      description: 'No puedes reducir el stock por debajo de 0'
                    });
                  }
                }}
              >
                -1
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleQuickUpdate(item.id, item.stock + 1, item.name)}
              >
                +1
              </Button>
              <Button
                size="sm"
                variant="solid"
                disabled={isLoading}
                onClick={() => handleQuickUpdate(item.id, item.minStock, item.name)}
              >
                Min
              </Button>
            </Stack>
          </Stack>
        </Card.Body>
      </Card.Root>
    );
  };

  return (
    <Stack direction="column" gap="xl">
      <Stack direction="row" justify="space-between" align="center" mb="md">
        <Typography variant="heading" size="lg">
          Gestión de Inventario ({materials.length} items)
        </Typography>
        <Button
          variant="solid"
          colorPalette="blue"
          size="lg"
          onClick={onAddMaterial}
          disabled={isLoading || !onAddMaterial}
        >
          <Icon icon={PlusIcon} size="md" />
          Agregar Item
        </Button>
      </Stack>

      {materials.length === 0 ? (
        <Stack
          direction="column"
          gap="lg"
          align="center"
          justify="center"
          minH="240px"
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
        <Stack direction="column" gap="xl">
          {/* 🔴 CRITICAL SECTION - Always visible */}
          {groupedMaterials.critical.total > 0 && (
            <Box>
              <Stack
                direction="row"
                justify="space-between"
                align="center"
                p="md"
                bg="red.50"
                borderRadius="md"
                borderLeft="4px solid"
                borderColor="red.500"
                mb="md"
              >
                <Stack direction="row" align="center" gap="sm">
                  <Icon icon={ExclamationTriangleIcon} size="md" color="red.600" />
                  <Typography variant="heading" size="md" color="red.700">
                    Stock Crítico
                  </Typography>
                  <Badge colorPalette="red" size="sm">
                    {groupedMaterials.critical.total} items
                  </Badge>
                </Stack>
              </Stack>
              <Stack direction="column" gap="md">
                {groupedMaterials.critical.paged.map(renderMaterialCard)}
                {groupedMaterials.critical.hasMore && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCriticalPage(p => p + 1)}
                  >
                    Cargar más ({groupedMaterials.critical.total - groupedMaterials.critical.paged.length} restantes)
                  </Button>
                )}
              </Stack>
            </Box>
          )}

          {/* 🟡 LOW STOCK SECTION - Collapsible */}
          {groupedMaterials.low.total > 0 && (
            <Box>
              <Stack
                direction="row"
                justify="space-between"
                align="center"
                p="md"
                bg="yellow.50"
                borderRadius="md"
                borderLeft="4px solid"
                borderColor="yellow.500"
                mb="md"
                cursor="pointer"
                onClick={() => setIsLowStockOpen(!isLowStockOpen)}
                _hover={{ bg: 'yellow.100' }}
              >
                <Stack direction="row" align="center" gap="sm">
                  <Icon icon={ExclamationCircleIcon} size="md" color="yellow.600" />
                  <Typography variant="heading" size="md" color="yellow.700">
                    Stock Bajo
                  </Typography>
                  <Badge colorPalette="yellow" size="sm">
                    {groupedMaterials.low.total} items
                  </Badge>
                </Stack>
                <Icon icon={isLowStockOpen ? ChevronUpIcon : ChevronDownIcon} size="sm" color="yellow.600" />
              </Stack>
              <Collapsible.Root open={isLowStockOpen}>
                <Collapsible.Content>
                  <Stack direction="column" gap="md" mt="sm">
                    {/* ✅ Virtualization: Only render when open to improve performance */}
                    {isLowStockOpen && (
                      <>
                        {groupedMaterials.low.paged.map(renderMaterialCard)}
                        {groupedMaterials.low.hasMore && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLowPage(p => p + 1)}
                          >
                            Cargar más ({groupedMaterials.low.total - groupedMaterials.low.paged.length} restantes)
                          </Button>
                        )}
                      </>
                    )}
                  </Stack>
                </Collapsible.Content>
              </Collapsible.Root>
            </Box>
          )}

          {/* 🟢 HEALTHY SECTION - Collapsible */}
          {groupedMaterials.healthy.total > 0 && (
            <Box>
              <Stack
                direction="row"
                justify="space-between"
                align="center"
                p="md"
                bg="green.50"
                borderRadius="md"
                borderLeft="4px solid"
                borderColor="green.500"
                mb="md"
                cursor="pointer"
                onClick={() => setIsHealthyOpen(!isHealthyOpen)}
                _hover={{ bg: 'green.100' }}
              >
                <Stack direction="row" align="center" gap="sm">
                  <Icon icon={CheckCircleIcon} size="md" color="green.600" />
                  <Typography variant="heading" size="md" color="green.700">
                    Stock Saludable
                  </Typography>
                  <Badge colorPalette="green" size="sm">
                    {groupedMaterials.healthy.total} items
                  </Badge>
                </Stack>
                <Icon icon={isHealthyOpen ? ChevronUpIcon : ChevronDownIcon} size="sm" color="green.600" />
              </Stack>
              <Collapsible.Root open={isHealthyOpen}>
                <Collapsible.Content>
                  <Stack direction="column" gap="md" mt="sm">
                    {/* ✅ Virtualization: Only render when open to improve performance */}
                    {isHealthyOpen && (
                      <>
                        {groupedMaterials.healthy.paged.map(renderMaterialCard)}
                        {groupedMaterials.healthy.hasMore && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setHealthyPage(p => p + 1)}
                          >
                            Cargar más ({groupedMaterials.healthy.total - groupedMaterials.healthy.paged.length} restantes)
                          </Button>
                        )}
                      </>
                    )}
                  </Stack>
                </Collapsible.Content>
              </Collapsible.Root>
            </Box>
          )}
        </Stack>
      )}

      {performanceMode && (
        <Typography variant="caption" color="orange.500">
          Modo de rendimiento activado - Animaciones reducidas
        </Typography>
      )}
    </Stack>
  );
}