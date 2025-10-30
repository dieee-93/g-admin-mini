// ============================================
// SUPPLIER PERFORMANCE GRID
// ============================================
// Grid layout for supplier performance cards

import { VStack, Text, SimpleGrid, Separator } from '@/shared/ui';
import { SupplierPerformanceCard } from './SupplierPerformanceCard';
import type { SupplierAnalysis } from '@/pages/admin/supply-chain/materials/services/supplierAnalysisEngine';
import { supplierAnalyticsService } from '../../services/supplierAnalyticsService';
import { useMemo } from 'react';

interface SupplierPerformanceGridProps {
  suppliers: SupplierAnalysis[];
  showTopPerformers?: boolean;
  onViewDetails?: (supplier: SupplierAnalysis) => void;
  onCreateOrder?: (supplier: SupplierAnalysis) => void;
}

/**
 * Supplier Performance Grid Component
 * Displays supplier performance cards in a grid layout
 * Can optionally show only top/bottom performers
 */
export function SupplierPerformanceGrid({
  suppliers,
  showTopPerformers = false,
  onViewDetails,
  onCreateOrder
}: SupplierPerformanceGridProps) {
  // Get top and bottom performers if needed
  const { topPerformers, bottomPerformers } = useMemo(() => {
    if (!showTopPerformers) {
      return { topPerformers: [], bottomPerformers: [] };
    }

    // Create a fake analysis result to use the service helper
    const fakeResult = {
      supplierAnalyses: suppliers
    } as any;

    return {
      topPerformers: supplierAnalyticsService.getTopPerformers(fakeResult, 5),
      bottomPerformers: supplierAnalyticsService.getBottomPerformers(fakeResult, 5)
    };
  }, [suppliers, showTopPerformers]);

  // Display all suppliers if not showing top performers
  const displaySuppliers = showTopPerformers ? [] : suppliers;

  if (!showTopPerformers && suppliers.length === 0) {
    return (
      <Text color="fg.muted" textAlign="center" py={8}>
        No hay proveedores para mostrar
      </Text>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      {/* Top Performers Section */}
      {showTopPerformers && topPerformers.length > 0 && (
        <VStack align="stretch" gap={4}>
          <Text fontSize="xl" fontWeight="bold">
            🏆 Top Performers
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {topPerformers.map(supplier => (
              <SupplierPerformanceCard
                key={supplier.id}
                supplier={supplier}
                onViewDetails={onViewDetails}
                onCreateOrder={onCreateOrder}
              />
            ))}
          </SimpleGrid>
        </VStack>
      )}

      {/* Separator if showing both sections */}
      {showTopPerformers && topPerformers.length > 0 && bottomPerformers.length > 0 && (
        <Separator />
      )}

      {/* Bottom Performers Section */}
      {showTopPerformers && bottomPerformers.length > 0 && (
        <VStack align="stretch" gap={4}>
          <Text fontSize="xl" fontWeight="bold">
            ⚠️ Necesitan Atención
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {bottomPerformers.map(supplier => (
              <SupplierPerformanceCard
                key={supplier.id}
                supplier={supplier}
                onViewDetails={onViewDetails}
                onCreateOrder={onCreateOrder}
              />
            ))}
          </SimpleGrid>
        </VStack>
      )}

      {/* All Suppliers Grid */}
      {!showTopPerformers && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {displaySuppliers.map(supplier => (
            <SupplierPerformanceCard
              key={supplier.id}
              supplier={supplier}
              onViewDetails={onViewDetails}
              onCreateOrder={onCreateOrder}
            />
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
}
