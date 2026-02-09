/**
 * CostSummaryCard - Final cost breakdown with visualization
 *
 * Shows complete cost structure:
 * - Direct costs (materials, labor, equipment)
 * - Indirect costs (overhead)
 * - Total manufacturing cost
 */

import { Box, Stack, Typography, Flex } from '@/shared/ui';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { memo } from 'react';

interface CostSummaryCardProps {
  materialsCost: number;
  laborCost: number;
  equipmentCost: number;
  overheadCost: number;
  totalCost: number;
}

const CostRow = memo(function CostRow({
  label,
  value,
  bold
}: {
  label: string;
  value: number;
  bold?: boolean
}) {
  return (
    <Flex justify="space-between">
      <Typography fontSize="sm" fontWeight={bold ? '700' : '400'}>
        {label}
      </Typography>
      <Typography fontSize="sm" fontWeight={bold ? '700' : '600'}>
        ${value.toFixed(2)}
      </Typography>
    </Flex>
  );
});

export const CostSummaryCard = memo(function CostSummaryCard({
  materialsCost,
  laborCost,
  equipmentCost,
  overheadCost,
  totalCost
}: CostSummaryCardProps) {
  const directCost = materialsCost + laborCost + equipmentCost;

  return (
    <Box
      p="6"
      bg="blue.50"
      borderWidth="3px"
      borderColor="blue.200"
      borderRadius="xl"
      boxShadow="xl"
    >
      <Stack gap="4">
        {/* Header */}
        <Flex align="center" gap="2">
          <CalculatorIcon style={{ width: '24px', height: '24px' }} />
          <Typography fontSize="sm" fontWeight="800" textTransform="uppercase">
            Resumen de Costos Totales
          </Typography>
        </Flex>

        <Box h="1px" bg="blue.300" />

        {/* Cost Breakdown */}
        <Stack gap="2">
          <Typography fontSize="sm" fontWeight="700" color="fg.muted">
            COSTOS DIRECTOS:
          </Typography>

          <CostRow label="Materiales" value={materialsCost} />
          <CostRow label="Mano de Obra" value={laborCost} />
          <CostRow label="Equipamiento" value={equipmentCost} />

          <Box pl="4" pt="1" pb="1">
            <CostRow
              label="Subtotal Directo"
              value={directCost}
              bold
            />
          </Box>

          <Box h="1px" bg="blue.200" mt="2" mb="2" />

          <Typography fontSize="sm" fontWeight="700" color="fg.muted">
            COSTOS INDIRECTOS:
          </Typography>

          <CostRow label="Overhead" value={overheadCost} />

          <Box h="2px" bg="blue.400" mt="3" mb="3" />

          {/* Total */}
          <Flex justify="space-between" align="center">
            <Typography fontSize="lg" fontWeight="900" textTransform="uppercase">
              COSTO TOTAL PRODUCCIÓN
            </Typography>
            <Typography fontSize="2xl" fontWeight="900" color="blue.700">
              ${totalCost.toFixed(2)}
            </Typography>
          </Flex>

          <Box h="2px" bg="blue.400" />

          {/* Info */}
          <Typography fontSize="xs" color="fg.muted" fontStyle="italic" textAlign="center">
            ℹ️ Costo unitario se calculará con cantidad real producida
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
});
