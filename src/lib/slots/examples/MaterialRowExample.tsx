/**
 * EJEMPLO: Cómo usar el sistema de slots en un componente
 * MaterialRow con slots para extensibilidad modular
 */

import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { Slot } from '../Slot';

interface Material {
  id: string;
  name: string;
  stock: number;
  price: number;
  supplier?: {
    id: string;
    name: string;
  };
}

interface MaterialRowProps {
  material: Material;
}

/**
 * ANTES (con condicionales hardcodeados):
 *
 * {hasSuppliers && <SupplierInfo supplier={material.supplier} />}
 * {hasAnalytics && <StockAnalytics stock={material.stock} />}
 * {hasOrders && <QuickOrderButton material={material} />}
 */

/**
 * DESPUÉS (con sistema de slots):
 */
export const MaterialRowExample: React.FC<MaterialRowProps> = ({ material }) => {
  return (
    <HStack
      p={4}
      borderWidth={1}
      borderColor="gray.200"
      borderRadius="md"
      spacing={4}
      align="center"
    >
      {/* Contenido fijo */}
      <Box flex={1}>
        <Text fontWeight="medium">{material.name}</Text>
        <Text fontSize="sm" color="gray.600">
          Stock: {material.stock}
        </Text>
      </Box>

      {/* SLOTS DINÁMICOS - Los módulos se registran automáticamente */}
      <Slot
        name="material-supplier"
        data={{ material }}
        single
      />

      <Slot
        name="material-analytics"
        data={{ material }}
        single
      />

      <Slot
        name="material-actions"
        data={{ material }}
        gap={2}
      />
    </HStack>
  );
};

/**
 * REGISTRO DE COMPONENTES (en cada módulo):
 *
 * // En el módulo de suppliers:
 * registerModuleSlots('suppliers', [
 *   {
 *     slotName: 'material-supplier',
 *     component: SupplierInfoComponent,
 *     requirements: ['has_suppliers']
 *   }
 * ]);
 *
 * // En el módulo de analytics:
 * registerModuleSlots('analytics', [
 *   {
 *     slotName: 'material-analytics',
 *     component: StockAnalyticsComponent,
 *     requirements: ['has_analytics']
 *   }
 * ]);
 *
 * // En el módulo de orders:
 * registerModuleSlots('orders', [
 *   {
 *     slotName: 'material-actions',
 *     component: QuickOrderButton,
 *     requirements: ['has_orders'],
 *     priority: 10
 *   }
 * ]);
 */

/**
 * RESULTADO:
 * - Sin condicionales hardcodeados en el componente
 * - Los módulos se "enchufan" automáticamente
 * - Escalable para 20+ módulos
 * - Mantiene performance (solo renderiza lo que debe)
 */