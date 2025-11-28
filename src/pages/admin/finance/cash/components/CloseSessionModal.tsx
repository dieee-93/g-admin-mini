/**
 * Close Session Modal
 * Modal para cerrar sesión con arqueo ciego
 */

import { useState, useMemo } from 'react';
import { Dialog, Alert } from '@/shared/ui';
import { Button, Stack, Input, Textarea, Text, Box } from '@chakra-ui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { CashSessionRow, CloseCashSessionInput } from '@/modules/cash/types';
import { DecimalUtils, formatCurrency } from '@/business-logic/shared/decimalUtils';

interface CloseSessionModalProps {
  isOpen: boolean;
  session: CashSessionRow | null;
  onClose: () => void;
  onConfirm: (input: CloseCashSessionInput) => Promise<void>;
  isLoading?: boolean;
}

export function CloseSessionModal({
  isOpen,
  session,
  onClose,
  onConfirm,
  isLoading = false,
}: CloseSessionModalProps) {
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');

  // Calcular efectivo esperado
  const expectedCash = useMemo(() => {
    if (!session) return 0;

    const starting = DecimalUtils.fromValue(session.starting_cash, 'financial');
    const sales = DecimalUtils.fromValue(session.cash_sales, 'financial');
    const refunds = DecimalUtils.fromValue(session.cash_refunds, 'financial');
    const cashIn = DecimalUtils.fromValue(session.cash_in, 'financial');
    const cashOut = DecimalUtils.fromValue(session.cash_out, 'financial');
    const drops = DecimalUtils.fromValue(session.cash_drops, 'financial');

    const expected = DecimalUtils.add(
      starting,
      DecimalUtils.subtract(
        DecimalUtils.add(
          DecimalUtils.add(sales, cashIn, 'financial'),
          DecimalUtils.fromValue(0, 'financial'),
          'financial'
        ),
        DecimalUtils.add(
          DecimalUtils.add(refunds, cashOut, 'financial'),
          drops,
          'financial'
        ),
        'financial'
      ),
      'financial'
    );

    return DecimalUtils.toNumber(expected);
  }, [session]);

  // Calcular diferencia al ingresar efectivo contado
  const variance = useMemo(() => {
    if (!actualCash || isNaN(parseFloat(actualCash))) return null;
    const actual = parseFloat(actualCash);
    return actual - expectedCash;
  }, [actualCash, expectedCash]);

  const handleConfirm = async () => {
    if (!session) return;

    const amount = parseFloat(actualCash);
    if (isNaN(amount) || amount < 0) {
      alert('Por favor ingrese el efectivo contado');
      return;
    }

    await onConfirm({
      actual_cash: amount,
      closing_notes: notes || undefined,
    });

    // Reset form
    setActualCash('');
    setNotes('');
  };

  const handleClose = () => {
    setActualCash('');
    setNotes('');
    onClose();
  };

  if (!session) return null;

  const hasDiscrepancy = variance !== null && Math.abs(variance) > 50;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose} size="lg">
      <Dialog.Backdrop />
      <Dialog.Positioner>
      <Dialog.Content >
        <Dialog.Header>
          <Dialog.Title>Cerrar Sesión de Caja - Arqueo Ciego</Dialog.Title>
          <Dialog.CloseTrigger onClick={handleClose}>
              <XMarkIcon className="w-5 h-5" />
            </Dialog.CloseTrigger>
        </Dialog.Header>

        <Dialog.Body>
          <Stack gap={4}>
            {/* Resumen de movimientos */}
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold" mb={2}>
                Resumen de Movimientos
              </Text>
              <Stack gap={1} fontSize="sm">
                <Stack direction="row" justify="space-between">
                  <Text>Fondo Inicial:</Text>
                  <Text fontWeight="medium">
                    {formatCurrency(session.starting_cash)}
                  </Text>
                </Stack>
                <Stack direction="row" justify="space-between">
                  <Text>Ventas en Efectivo:</Text>
                  <Text fontWeight="medium" color="green.600">
                    + {formatCurrency(session.cash_sales)}
                  </Text>
                </Stack>
                {session.cash_refunds > 0 && (
                  <Stack direction="row" justify="space-between">
                    <Text>Devoluciones:</Text>
                    <Text fontWeight="medium" color="red.600">
                      - {formatCurrency(session.cash_refunds)}
                    </Text>
                  </Stack>
                )}
                {session.cash_in > 0 && (
                  <Stack direction="row" justify="space-between">
                    <Text>Entradas:</Text>
                    <Text fontWeight="medium" color="green.600">
                      + {formatCurrency(session.cash_in)}
                    </Text>
                  </Stack>
                )}
                {session.cash_out > 0 && (
                  <Stack direction="row" justify="space-between">
                    <Text>Salidas:</Text>
                    <Text fontWeight="medium" color="red.600">
                      - {formatCurrency(session.cash_out)}
                    </Text>
                  </Stack>
                )}
                {session.cash_drops > 0 && (
                  <Stack direction="row" justify="space-between">
                    <Text>Retiros Parciales:</Text>
                    <Text fontWeight="medium" color="red.600">
                      - {formatCurrency(session.cash_drops)}
                    </Text>
                  </Stack>
                )}
              </Stack>
            </Box>

            {/* Campo para efectivo contado (ciego) */}
            <Stack gap="2">
              <Text fontWeight="600">Efectivo Contado (ARS) *</Text>
              <Input
                type="number"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                min="0"
                step="0.01"
                placeholder="Contar el efectivo en caja..."
                autoFocus
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Cuente el efectivo físico y registre el total
              </Text>
            </Stack>

            {/* Mostrar diferencia después de ingresar */}
            {variance !== null && (
              <Box
                p={4}
                bg={hasDiscrepancy ? 'red.50' : 'green.50'}
                borderRadius="md"
                borderWidth={2}
                borderColor={hasDiscrepancy ? 'red.200' : 'green.200'}
              >
                <Stack gap={2}>
                  <Stack direction="row" justify="space-between" fontWeight="bold">
                    <Text>Esperado:</Text>
                    <Text>{formatCurrency(expectedCash)}</Text>
                  </Stack>
                  <Stack direction="row" justify="space-between" fontWeight="bold">
                    <Text>Contado:</Text>
                    <Text>{formatCurrency(parseFloat(actualCash))}</Text>
                  </Stack>
                  <Stack
                    direction="row"
                    justify="space-between"
                    fontSize="lg"
                    fontWeight="bold"
                    pt={2}
                    borderTopWidth={1}
                    borderColor={hasDiscrepancy ? 'red.300' : 'green.300'}
                  >
                    <Text>Diferencia:</Text>
                    <Text color={variance > 0 ? 'green.600' : variance < 0 ? 'red.600' : 'gray.600'}>
                      {variance > 0 && '+'}
                      {formatCurrency(Math.abs(variance))}
                      {variance > 0 ? ' (Sobrante)' : variance < 0 ? ' (Faltante)' : ' (Exacto)'}
                    </Text>
                  </Stack>
                </Stack>

                {hasDiscrepancy && (
                  <Alert
                    status="warning"
                    title="Diferencia significativa detectada"
                    mt={3}
                  >
                    La diferencia supera el umbral de $50. Se marcará para auditoría.
                  </Alert>
                )}
              </Box>
            )}

            <Stack gap="2">
              <Text fontWeight="600">Notas de Cierre</Text>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones sobre el arqueo (opcional)..."
                rows={3}
              />
            </Stack>
          </Stack>
        </Dialog.Body>

        <Dialog.Footer>
            <Stack direction="row" gap="3" justify="end">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            colorPalette={hasDiscrepancy ? 'orange' : 'green'}
            onClick={handleConfirm}
            loading={isLoading}
            disabled={!actualCash}
          >
            {hasDiscrepancy ? 'Cerrar con Diferencia' : 'Cerrar Caja'}
          </Button>
        </Stack>
          </Dialog.Footer>
      </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
