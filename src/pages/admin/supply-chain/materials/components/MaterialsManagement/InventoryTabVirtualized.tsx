/**
 * InventoryTabVirtualized - High-performance inventory view with virtual scrolling
 * 
 * Automatically switches to virtual scrolling when material count exceeds threshold (50 items).
 * Uses @tanstack/react-virtual for efficient rendering of large lists.
 * 
 * Performance improvements over InventoryTab:
 * - Virtual scrolling for 50+ materials
 * - Reduced DOM nodes (~95% for large lists)
 * - Smooth scroll performance (60fps target)
 * - Memoized cards to prevent unnecessary re-renders
 */

import { useState, useMemo, memo, useCallback } from 'react';
import { Stack, Typography, Button, Icon, Badge, Card, Box, VirtualGrid } from '@/shared/ui';
import { CubeIcon, PlusIcon, ExclamationTriangleIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Collapsible } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useMaterialsComputed } from '../../hooks/useMaterialsComputed';
import { formatCurrency, formatQuantity } from '@/business-logic/shared/decimalUtils';
import { notify } from '@/lib/notifications';
import { logger } from '@/lib/logging';

// ============================================================================
// CONSTANTS
// ============================================================================

const VIRTUALIZATION_THRESHOLD = 50;

// ============================================================================
// PURE UTILITY FUNCTIONS
// ============================================================================

type MaterialWithStock = {
  id: string;
  name: string;
  stock: number;
  minStock?: number;
  unit?: string;
  unitCost?: number;
  [key: string]: unknown;
};

const getStockStatus = (item: MaterialWithStock): 'critical' | 'low' | 'healthy' => {
  if (!item.minStock) return 'healthy';
  if (item.stock < item.minStock * 0.5) return 'critical';
  if (item.stock <= item.minStock) return 'low';
  return 'healthy';
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'critical': return 'red';
    case 'low': return 'yellow';
    default: return 'green';
  }
};

// ============================================================================
// MEMOIZED MATERIAL CARD
// ============================================================================

interface MaterialCardProps {
  material: MaterialWithStock;
  onQuickUpdate: (itemId: string, newStock: number, itemName: string) => Promise<void>;
  isLoading: boolean;
}

const MaterialCard = memo(function MaterialCard({ material, onQuickUpdate, isLoading }: MaterialCardProps) {
  const status = getStockStatus(material);
  const statusColor = getStatusColor(status);

  return (
    <Card.Root>
      <Card.Body>
        <Stack gap="3">
          <Stack direction="row" justify="space-between" align="start">
            <Box flex="1">
              <Typography variant="body" weight="semibold" size="md">
                {material.name}
              </Typography>
              <Typography variant="body" size="sm" color="fg.muted">
                Stock actual: {formatQuantity(material.stock, material.unit || '', 1)}
              </Typography>
              {material.minStock && (
                <Typography variant="body" size="xs" color="fg.muted">
                  Mínimo: {formatQuantity(material.minStock, material.unit || '', 1)}
                </Typography>
              )}
            </Box>
            <Badge colorPalette={statusColor} size="sm">
              {status === 'critical' ? 'Crítico' : status === 'low' ? 'Bajo' : 'OK'}
            </Badge>
          </Stack>

          {material.unitCost && (
            <Typography variant="body" size="sm" color="fg.muted">
              Valor: {formatCurrency(material.stock * material.unitCost)}
            </Typography>
          )}

          <Stack direction="row" gap="2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onQuickUpdate(material.id, material.stock + 10, material.name)}
              disabled={isLoading}
            >
              +10
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onQuickUpdate(material.id, Math.max(0, material.stock - 10), material.name)}
              disabled={isLoading}
            >
              -10
            </Button>
          </Stack>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface InventoryTabVirtualizedProps {
  onStockUpdate: (itemId: string, newStock: number) => Promise<void>;
  onBulkAction: (action: string, itemIds: string[]) => Promise<void>;
  onAddMaterial?: () => void;
}

export const InventoryTabVirtualized = memo(function InventoryTabVirtualized({
  onStockUpdate,
  onAddMaterial,
}: InventoryTabVirtualizedProps) {
  const [isLoading, setIsLoading] = useState(false);
InventoryTabVirtualized.displayName = 'InventoryTabVirtualized';
  const [isLowStockOpen, setIsLowStockOpen] = useState(true);
  const [isHealthyOpen, setIsHealthyOpen] = useState(false);

  const { getFilteredItems } = useMaterialsComputed();
  const materials = getFilteredItems();

  const handleQuickUpdate = useCallback(async (itemId: string, newStock: number, itemName: string) => {
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
  }, [materials, onStockUpdate]);

  // Group materials by criticality
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

    return { critical, low, healthy };
  }, [materials]);

  // Determine if we should use virtualization for each group
  const useCriticalVirtualization = groupedMaterials.critical.length >= VIRTUALIZATION_THRESHOLD;
  const useLowVirtualization = groupedMaterials.low.length >= VIRTUALIZATION_THRESHOLD;
  const useHealthyVirtualization = groupedMaterials.healthy.length >= VIRTUALIZATION_THRESHOLD;

  const renderMaterialCard = useCallback((material: MaterialWithStock) => (
    <MaterialCard
      key={material.id}
      material={material}
      onQuickUpdate={handleQuickUpdate}
      isLoading={isLoading}
    />
  ), [handleQuickUpdate, isLoading]);

  return (
    <Stack gap="4">
      {/* Header Actions */}
      <Stack direction="row" justify="space-between" align="center">
        <Typography variant="heading" size="lg">
          Gestión de Inventario
        </Typography>
        {onAddMaterial && (
          <Button onClick={onAddMaterial} size="sm">
            <Icon icon={PlusIcon} size="sm" />
            Nuevo Material
          </Button>
        )}
      </Stack>

      {/* 🔴 CRITICAL STOCK SECTION */}
      {groupedMaterials.critical.length > 0 && (
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
                {groupedMaterials.critical.length} items
              </Badge>
            </Stack>
          </Stack>

          {useCriticalVirtualization ? (
            <>
              <Typography variant="body" size="sm" color="fg.muted" mb="2">
                ⚡ Modo de alto rendimiento activado ({groupedMaterials.critical.length} materiales)
              </Typography>
              <VirtualGrid
                items={groupedMaterials.critical}
                height={600}
                columns={3}
                estimateSize={200}
                gap={16}
                renderItem={renderMaterialCard}
                getItemKey={(material) => material.id}
                overscan={3}
              />
            </>
          ) : (
            <Stack direction="column" gap="md">
              {groupedMaterials.critical.map(renderMaterialCard)}
            </Stack>
          )}
        </Box>
      )}

      {/* 🟡 LOW STOCK SECTION */}
      {groupedMaterials.low.length > 0 && (
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
                {groupedMaterials.low.length} items
              </Badge>
            </Stack>
            <Icon icon={isLowStockOpen ? ChevronUpIcon : ChevronDownIcon} size="sm" />
          </Stack>

          <Collapsible.Root open={isLowStockOpen}>
            <Collapsible.Content>
              {useLowVirtualization ? (
                <>
                  <Typography variant="body" size="sm" color="fg.muted" mb="2">
                    ⚡ Modo de alto rendimiento activado ({groupedMaterials.low.length} materiales)
                  </Typography>
                  <VirtualGrid
                    items={groupedMaterials.low}
                    height={600}
                    columns={3}
                    estimateSize={200}
                    gap={16}
                    renderItem={renderMaterialCard}
                    getItemKey={(material) => material.id}
                    overscan={3}
                  />
                </>
              ) : (
                <Stack direction="column" gap="md">
                  {groupedMaterials.low.map(renderMaterialCard)}
                </Stack>
              )}
            </Collapsible.Content>
          </Collapsible.Root>
        </Box>
      )}

      {/* 🟢 HEALTHY STOCK SECTION */}
      {groupedMaterials.healthy.length > 0 && (
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
                {groupedMaterials.healthy.length} items
              </Badge>
            </Stack>
            <Icon icon={isHealthyOpen ? ChevronUpIcon : ChevronDownIcon} size="sm" />
          </Stack>

          <Collapsible.Root open={isHealthyOpen}>
            <Collapsible.Content>
              {useHealthyVirtualization ? (
                <>
                  <Typography variant="body" size="sm" color="fg.muted" mb="2">
                    ⚡ Modo de alto rendimiento activado ({groupedMaterials.healthy.length} materiales)
                  </Typography>
                  <VirtualGrid
                    items={groupedMaterials.healthy}
                    height={600}
                    columns={3}
                    estimateSize={200}
                    gap={16}
                    renderItem={renderMaterialCard}
                    getItemKey={(material) => material.id}
                    overscan={3}
                  />
                </>
              ) : (
                <Stack direction="column" gap="md">
                  {groupedMaterials.healthy.map(renderMaterialCard)}
                </Stack>
              )}
            </Collapsible.Content>
          </Collapsible.Root>
        </Box>
      )}

      {/* Empty State */}
      {materials.length === 0 && (
        <Stack align="center" gap="4" py="8">
          <Icon icon={CubeIcon} size="xl" color="fg.muted" />
          <Typography variant="body" color="fg.muted">
            No hay materiales registrados
          </Typography>
          {onAddMaterial && (
            <Button onClick={onAddMaterial} size="sm">
              Agregar primer material
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
});
