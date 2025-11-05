/**
 * FISCAL WIDGET - Dashboard Component
 *
 * Muestra métricas clave del módulo Fiscal:
 * - Facturas pendientes
 * - Revenue de hoy
 * - Pasivo fiscal estimado
 *
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Typography, Icon, Button } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { ReceiptPercentIcon } from '@heroicons/react/24/outline';
import { useShallow } from 'zustand/react/shallow';
import { useFiscalStore } from '@/store/fiscalStore';

interface FiscalStats {
  pendingInvoices: number;
  todayRevenue: number;
  taxLiability: number;
}

export default function FiscalWidget() {
  const navigate = useNavigate();

  // ✅ Usar useShallow de Zustand v5 para evitar loop infinito
  const { isLoading } = useFiscalStore(useShallow(state => ({
    isLoading: state.isLoading
  })));

  // ✅ Usar useMemo para cálculos - Mock data por ahora
  const stats: FiscalStats = useMemo(() => ({
    pendingInvoices: 0,
    todayRevenue: 0,
    taxLiability: 0
  }), []);

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="teal"
      h="fit-content"
      minH="120px"
      borderRadius="8px"
      shadow="sm"
      bg="white"
      border="1px"
      borderColor="gray.200"
    >
      <CardWrapper.Body p="4">
        <Stack gap="4">
          <Stack direction="row" align="center" gap="2">
            <Icon icon={ReceiptPercentIcon} size="md" color="teal.500" />
            <Typography variant="body" size="md" weight="medium">
              Fiscal Status
            </Typography>
          </Stack>

          {isLoading ? (
            <Typography variant="body" size="sm" color="text.secondary">
              Cargando datos fiscales...
            </Typography>
          ) : (
            <Stack gap="2">
              <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
                <Stack gap="1">
                  <Typography variant="body" size="xs" color="text.secondary">
                    Facturas Pendientes
                  </Typography>
                  <Typography variant="body" size="lg" weight="bold">
                    {stats.pendingInvoices}
                  </Typography>
                </Stack>
              </Box>

              <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
                <Stack gap="1">
                  <Typography variant="body" size="xs" color="text.secondary">
                    Revenue Hoy
                  </Typography>
                  <Typography variant="body" size="lg" weight="bold" color="green.600">
                    ${stats.todayRevenue.toLocaleString()}
                  </Typography>
                </Stack>
              </Box>

              <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
                <Stack gap="1">
                  <Typography variant="body" size="xs" color="text.secondary">
                    Pasivo Fiscal
                  </Typography>
                  <Typography variant="body" size="lg" weight="bold" color="orange.600">
                    ${stats.taxLiability.toLocaleString()}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          )}

          <Button
            size="sm"
            colorPalette="teal"
            variant="outline"
            onClick={() => navigate('/admin/finance/fiscal')}
          >
            Ver Fiscal
          </Button>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
