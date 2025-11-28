import { memo, useCallback } from 'react';
import { Card, Stack, Typography, Button, Icon, Badge } from '@/shared/ui';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatQuantity } from '@/business-logic/shared/decimalUtils';
import { notify } from '@/lib/notifications';

// ============================================================================
// TYPES
// ============================================================================

export interface MaterialCardItem {
    id: string;
    name: string;
    description?: string;
    stock: number;
    minStock?: number;
    unit?: string;
    unit_cost?: number;
    abcClass?: string;
    [key: string]: unknown;
}

interface MaterialCardProps {
    item: MaterialCardItem;
    onStockUpdate: (itemId: string, newStock: number, itemName: string) => Promise<void>;
    isLoading?: boolean;
}

// ============================================================================
// PURE UTILITY FUNCTIONS (Outside component for performance)
// ============================================================================

/**
 * Determines stock status based on current stock vs minimum threshold
 * Pure function - no dependencies on component state
 */
const getStockStatus = (item: MaterialCardItem): 'critical' | 'low' | 'healthy' => {
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

/**
 * MaterialCard - Memoized material card component for inventory list
 * 
 * ✅ PERFORMANCE OPTIMIZATION:
 * - Memoized with React.memo() to prevent unnecessary re-renders
 * - Only re-renders when item data or isLoading changes
 * - Handlers are memoized with useCallback
 * 
 * Pattern: Follows project conventions from MaterialsMetrics.tsx
 * - memo() for component optimization
 * - useCallback() for stable function references
 * - Pure utility functions outside component
 */
export const MaterialCard = memo(function MaterialCard({
    item,
    onStockUpdate,
    isLoading = false
}: MaterialCardProps) {
    const status = getStockStatus(item);
    const statusColor = getStatusColor(status);

    // ✅ PERFORMANCE: useCallback prevents inline functions that break memo()
    // Pattern: One useCallback per handler to maintain stable references
    const handleDecrement = useCallback(() => {
        if (item.stock > 0) {
            onStockUpdate(item.id, item.stock - 1, item.name);
        } else {
            notify.warning({
                title: 'Stock mínimo alcanzado',
                description: 'No puedes reducir el stock por debajo de 0'
            });
        }
    }, [item.id, item.stock, item.name, onStockUpdate]);

    const handleIncrement = useCallback(() => {
        onStockUpdate(item.id, item.stock + 1, item.name);
    }, [item.id, item.stock, item.name, onStockUpdate]);

    const handleSetMin = useCallback(() => {
        if (item.minStock !== undefined) {
            onStockUpdate(item.id, item.minStock, item.name);
        }
    }, [item.id, item.minStock, item.name, onStockUpdate]);

    return (
        <Card.Root variant="outline" size="sm">
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
                                Stock: {formatQuantity(item.stock, item.unit || '', 1)}
                            </Typography>
                            <Typography variant="caption" color="gray.500">
                                Min: {formatQuantity(item.minStock || 0, item.unit || '', 1)}
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
                            onClick={handleDecrement}
                        >
                            -1
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={isLoading}
                            onClick={handleIncrement}
                        >
                            +1
                        </Button>
                        <Button
                            size="sm"
                            variant="solid"
                            disabled={isLoading || item.minStock === undefined}
                            onClick={handleSetMin}
                        >
                            Min
                        </Button>
                    </Stack>
                </Stack>
            </Card.Body>
        </Card.Root>
    );
}, (prevProps, nextProps) => {
    // ✅ CUSTOM COMPARISON: Only re-render if these specific props change
    // This prevents re-renders when parent re-renders but props haven't changed
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.name === nextProps.item.name &&
        prevProps.item.stock === nextProps.item.stock &&
        prevProps.item.minStock === nextProps.item.minStock &&
        prevProps.item.unit_cost === nextProps.item.unit_cost &&
        prevProps.item.abcClass === nextProps.item.abcClass &&
        prevProps.item.description === nextProps.item.description &&
        prevProps.isLoading === nextProps.isLoading &&
        prevProps.onStockUpdate === nextProps.onStockUpdate
    );
});

MaterialCard.displayName = 'MaterialCard';
