/**
 * Suppliers Dashboard Widget
 *
 * Displays supplier summary metrics in the main dashboard
 * Integrates with Module Registry via dashboard.widgets hook
 *
 * @module suppliers
 * @version 1.0.0
 */

import React from 'react';
import { Card, Stack, Text, HStack, Badge, Icon, VStack, Skeleton } from '@/shared/ui';
import { BuildingStorefrontIcon, StarIcon } from '@heroicons/react/24/outline';
import { useSuppliers } from '@/modules/suppliers/hooks';
import { suppliersService } from '@/pages/admin/supply-chain/suppliers/services/suppliersService';

interface SuppliersWidgetProps {
  /**
   * Optional onClick handler to navigate to suppliers page
   */
  onClick?: () => void;
}

/**
 * Suppliers Summary Widget
 *
 * Shows key supplier metrics:
 * - Total suppliers count
 * - Active suppliers count
 * - Average rating
 *
 * Used in dashboard.widgets hook point
 */
export function SuppliersWidget({ onClick }: SuppliersWidgetProps) {
  // ✅ TanStack Query hook - returns { data, isLoading, error }
  const { data: suppliers = [], isLoading: loading } = useSuppliers();

  // Calculate metrics
  const metrics = React.useMemo(() => {
    if (!suppliers || suppliers.length === 0) {
      return {
        totalSuppliers: 0,
        activeSuppliers: 0,
        averageRating: 0
      };
    }

    return suppliersService.calculateMetrics(suppliers);
  }, [suppliers]);

  // Determine rating color
  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return 'green';
    if (rating >= 4.0) return 'blue';
    if (rating >= 3.5) return 'yellow';
    if (rating >= 3.0) return 'orange';
    return 'red';
  };

  return (
    <Card.Root
      onClick={onClick}
      cursor={onClick ? 'pointer' : 'default'}
      _hover={onClick ? { boxShadow: 'md', transform: 'translateY(-2px)' } : undefined}
      transition="all 0.2s"
    >
      <Card.Body>
        <VStack align="stretch" gap="4">
          {/* Header */}
          <HStack justify="space-between">
            <HStack gap="2">
              <Icon icon={BuildingStorefrontIcon} size="lg" color="blue.500" />
              <Text fontSize="lg" fontWeight="bold">
                Proveedores
              </Text>
            </HStack>
            {!loading && metrics.totalSuppliers > 0 && (
              <Badge colorPalette="blue" size="sm">
                {metrics.totalSuppliers}
              </Badge>
            )}
          </HStack>

          {/* Metrics */}
          {loading ? (
            <Stack gap="2">
              <Skeleton height="20px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </Stack>
          ) : metrics.totalSuppliers === 0 ? (
            <Text color="fg.muted" fontSize="sm">
              No hay proveedores registrados
            </Text>
          ) : (
            <VStack align="stretch" gap="3">
              {/* Active Suppliers */}
              <HStack justify="space-between">
                <Text fontSize="sm" color="fg.muted">
                  Activos
                </Text>
                <HStack gap="1">
                  <Text fontSize="sm" fontWeight="semibold">
                    {metrics.activeSuppliers}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    / {metrics.totalSuppliers}
                  </Text>
                </HStack>
              </HStack>

              {/* Average Rating */}
              <HStack justify="space-between">
                <Text fontSize="sm" color="fg.muted">
                  Rating Promedio
                </Text>
                <HStack gap="2">
                  <Icon icon={StarIcon} size="sm" color="yellow.500" />
                  <Badge
                    colorPalette={getRatingColor(metrics.averageRating)}
                    size="sm"
                  >
                    {metrics.averageRating.toFixed(1)}
                  </Badge>
                </HStack>
              </HStack>

              {/* Without Rating Count */}
              {metrics.suppliersWithoutRating > 0 && (
                <HStack justify="space-between">
                  <Text fontSize="sm" color="fg.muted">
                    Sin Rating
                  </Text>
                  <Badge colorPalette="gray" size="sm">
                    {metrics.suppliersWithoutRating}
                  </Badge>
                </HStack>
              )}
            </VStack>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
