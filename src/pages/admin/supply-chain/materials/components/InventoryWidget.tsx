/**
 * INVENTORY WIDGET
 *
 * 🎯 ARCHITECTURAL PATTERN: Dashboard Widget Component
 * - Demonstrates proper widget structure for dashboard.widgets hook
 * - Returns JSX (React component), not metadata
 * - Uses Materials store for real-time data
 *
 * Usage: Registered in materials/manifest.tsx via dashboard.widgets hook
 */

import React from 'react';
import { Stack, Badge, Typography, Icon } from '@/shared/ui';
import { CubeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useMaterials } from '@/modules/materials/hooks';
import { DecimalUtils, DECIMAL_CONSTANTS } from '@/lib/decimal';
import { useNavigationActions } from '@/contexts/NavigationContext';

export const InventoryWidget: React.FC = () => {
  const { data: items = [], isLoading: loading } = useMaterials();
  const { navigate } = useNavigationActions();

  const handleClick = () => {
    navigate('materials');
  };

  // 🎯 OPTIMIZED: Memoize calculations to avoid re-computation on every render
  // Must be called before early returns (React Hooks rules)
  const stats = React.useMemo(() => {
    if (loading) {
      return { totalItems: 0, lowStockItems: 0, outOfStockItems: 0, totalValue: 0 };
    }

    const totalItems = items.length;
    const lowStockItems = items.filter(item => item.stock < item.min_stock).length;
    const outOfStockItems = items.filter(item => item.stock === 0).length;

    // 🎯 DECIMAL.JS: Use precise decimal arithmetic for monetary calculations
    const totalValue = items.reduce((acc, item) => {
      const itemValue = DecimalUtils.multiply(item.stock, item.unit_cost, 'inventory');
      return DecimalUtils.add(acc, itemValue, 'inventory');
    }, DECIMAL_CONSTANTS.ZERO).toNumber();

    return { totalItems, lowStockItems, outOfStockItems, totalValue };
  }, [items, loading]);

  const { totalItems, lowStockItems, outOfStockItems, totalValue } = stats;

  if (loading) {
    return (
      <Stack gap="2" p="4" bg="green.50" borderRadius="md">
        <div style={{ height: '60px', animation: 'pulse 1.5s infinite' }}>
          Cargando inventario...
        </div>
      </Stack>
    );
  }

  return (
    <Stack
      gap="3"
      p="4"
      bg="green.50"
      borderRadius="md"
      borderWidth="1px"
      borderColor="green.200"
      cursor="pointer"
      onClick={handleClick}
      transition="all 0.2s"
      _hover={{
        shadow: 'md',
        borderColor: 'green.300',
        transform: 'translateY(-2px)'
      }}
      role="button"
      tabIndex={0}
      aria-label="Ver inventario completo"
    >
      <Stack direction="row" align="center" justify="space-between">
        <Stack direction="row" align="center" gap="2">
          <Icon icon={CubeIcon} size="md" color="green.700" />
          <Typography variant="body" size="sm" weight="semibold" colorPalette="green">
            Inventario
          </Typography>
        </Stack>
        <Badge size="sm" colorPalette="green">
          {totalItems} items
        </Badge>
      </Stack>

      <Stack gap="1">
        <Stack direction="row" justify="space-between">
          <Typography variant="body" size="xs" colorPalette="green">Valor Total:</Typography>
          <Typography variant="body" size="sm" weight="bold" colorPalette="green">
            ${totalValue.toFixed(2)}
          </Typography>
        </Stack>

        {lowStockItems > 0 && (
          <Stack direction="row" align="center" gap="1">
            <Icon icon={ExclamationTriangleIcon} size="xs" color="orange.500" />
            <Typography variant="body" size="xs" colorPalette="orange">
              {lowStockItems} items con stock bajo
            </Typography>
          </Stack>
        )}

        {outOfStockItems > 0 && (
          <Stack direction="row" align="center" gap="1">
            <Icon icon={ExclamationTriangleIcon} size="xs" color="red.500" />
            <Typography variant="body" size="xs" colorPalette="red">
              {outOfStockItems} items sin stock
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default InventoryWidget;
