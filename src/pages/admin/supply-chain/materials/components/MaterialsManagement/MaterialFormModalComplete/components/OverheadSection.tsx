/**
 * OverheadSection - Automatic overhead calculation
 *
 * Calculates overhead based on:
 * - Labor hours (from TeamAssignmentSection)
 * - System overhead rate (from Settings)
 *
 * NO permite edición manual (compliance GAAP)
 *
 * Industry standard approach (SAP, Odoo, NetSuite):
 * - Overhead Rate = Total Monthly Overhead / Total Labor Hours
 * - Overhead per product = Labor Hours × Overhead Rate
 */

import { Box, Stack, Typography, Button, Flex } from '@/shared/ui';
import { CogIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { memo } from 'react';
import { useOverheadRate } from '@/pages/admin/core/settings/hooks';

interface OverheadSectionProps {
  laborHours: number;
}

export const OverheadSection = memo(function OverheadSection({
  laborHours
}: OverheadSectionProps) {

  // Get overhead rate from Settings
  const overheadRate = useOverheadRate();
  const overheadCost = laborHours * overheadRate;

  return (
    <Box
      p="5"
      bg="bg.panel"
      borderWidth="3px"
      borderColor="border.emphasized"
      borderRadius="xl"
      boxShadow="lg"
    >
      <Stack gap="4">
        {/* Header */}
        <Typography fontSize="sm" fontWeight="700">
          4️⃣ OVERHEAD (Costos Indirectos)
        </Typography>

        {/* Info about what overhead includes */}
        <Box p="3" bg="orange.50" borderRadius="md" borderWidth="1px" borderColor="orange.200">
          <Stack direction="row" align="flex-start" gap="2">
            <InformationCircleIcon style={{ width: 20, height: 20, color: 'orange' }} />
            <Typography fontSize="xs" color="orange.700">
              ℹ️ Overhead incluye: alquiler, electricidad general, supervisión, seguros,
              limpieza y otros costos NO atribuibles a equipos específicos
            </Typography>
          </Stack>
        </Box>

        {/* Calculation Details */}
        <Box p="4" bg="bg.subtle" borderRadius="md">
          <Stack gap="3">
            <Typography fontSize="xs" fontWeight="700" color="fg.muted" textTransform="uppercase">
              Método: Automático
            </Typography>
            <Typography fontSize="xs" color="fg.muted">
              Base: Direct Labor Hours (Industry Standard)
            </Typography>

            <Box h="1px" bg="border.subtle" />

            <Stack gap="1">
              <Flex justify="space-between">
                <Typography fontSize="sm">Total Labor Hours:</Typography>
                <Typography fontSize="sm" fontWeight="600">
                  {laborHours.toFixed(1)}h
                </Typography>
              </Flex>

              <Flex justify="space-between">
                <Typography fontSize="sm">Overhead Rate (sistema):</Typography>
                <Typography fontSize="sm" fontWeight="600">
                  ${overheadRate.toFixed(2)}/h
                </Typography>
              </Flex>
            </Stack>

            <Box h="1px" bg="border.emphasized" />

            {/* Result */}
            <Box p="3" bg="orange.100" borderRadius="md">
              <Flex justify="space-between" align="center">
                <Typography fontSize="md" fontWeight="700">
                  📊 Overhead Calculado:
                </Typography>
                <Typography fontSize="xl" fontWeight="800" color="orange.700">
                  ${overheadCost.toFixed(2)}
                </Typography>
              </Flex>
              <Typography fontSize="2xs" color="fg.muted" mt="1">
                {laborHours.toFixed(1)}h × ${overheadRate.toFixed(2)}/h
              </Typography>
            </Box>

            {/* Rate info */}
            <Typography fontSize="xs" color="fg.muted" fontStyle="italic">
              ℹ️ Rate basado en gastos reales del mes actual
            </Typography>
          </Stack>
        </Box>

        {/* Link to settings (for future implementation) */}
        <Button
          size="sm"
          variant="ghost"
          colorPalette="gray"
          disabled
        >
          <CogIcon style={{ width: 16, height: 16 }} />
          Configurar en Settings
        </Button>

        {/* Compliance notice */}
        <Box p="2" bg="gray.100" borderRadius="md">
          <Typography fontSize="2xs" color="fg.muted" textAlign="center">
            ❌ NO editable por producto (Compliance GAAP requirement)
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
});
