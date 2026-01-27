/**
 * PaymentConfirmationModal - Payment Processing Component
 *
 * Features:
 * - Simple payment (single method)
 * - Mixed payment (multiple methods)
 * - Cash change calculation
 * - Amount validation
 * - Payment method selection
 */

import { useState } from 'react';
import {
  Dialog,
  Button,
  Stack,
  Typography,
  Alert,
  Icon,
  InputField,
  Input,
  Separator,
  Box
} from '@/shared/ui';
import {
  XMarkIcon,
  CheckCircleIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

import { notify } from '@/lib/notifications';
import { safeDecimal } from '@/lib/decimal';

interface PaymentMethod {
  id: string;
  type: 'cash' | 'card' | 'transfer';
  amount: number;
}

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (paymentData: {
    payment_method: 'cash' | 'card' | 'transfer' | 'mixed';
    payments?: PaymentMethod[];
    cashReceived?: number;
    cashChange?: number;
  }) => void;
}

const PAYMENT_OPTIONS = [
  { value: 'cash', label: '💵 Efectivo', icon: BanknotesIcon },
  { value: 'card', label: '💳 Tarjeta', icon: CreditCardIcon },
  { value: 'transfer', label: '🏦 Transferencia', icon: BuildingLibraryIcon }
] as const;

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  total,
  onConfirm
}: PaymentConfirmationModalProps) {
  const [paymentMode, setPaymentMode] = useState<'simple' | 'mixed'>('simple');
  const [simpleMethod, setSimpleMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [mixedPayments, setMixedPayments] = useState<PaymentMethod[]>([
    { id: '1', type: 'cash', amount: 0 }
  ]);

  // ✅ CÁLCULOS CON DECIMAL.JS - Usando constructor seguro
  const totalDecimal = safeDecimal(total, 'financial', 0);
  const cashReceivedDecimal = safeDecimal(cashReceived || 0, 'financial', 0);
  const cashChange = cashReceivedDecimal.greaterThan(totalDecimal)
    ? cashReceivedDecimal.minus(totalDecimal).toNumber()
    : 0;

  const mixedTotal = mixedPayments.reduce(
    (sum, p) => sum.plus(safeDecimal(p.amount, 'financial', 0)),
    safeDecimal(0, 'financial')
  );
  const mixedRemaining = totalDecimal.minus(mixedTotal);

  // ✅ VALIDACIONES
  const isSimpleValid = () => {
    if (simpleMethod === 'cash') {
      return cashReceivedDecimal.greaterThanOrEqualTo(totalDecimal);
    }
    return true; // Card y transfer no necesitan monto recibido
  };

  const isMixedValid = () => {
    return mixedTotal.equals(totalDecimal);
  };

  const canConfirm =
    paymentMode === 'simple' ? isSimpleValid() : isMixedValid();

  // ✅ HANDLERS
  const handleAddPaymentMethod = () => {
    setMixedPayments([
      ...mixedPayments,
      {
        id: crypto.randomUUID(),
        type: 'cash',
        amount: 0
      }
    ]);
  };

  const handleRemovePaymentMethod = (id: string) => {
    if (mixedPayments.length === 1) {
      notify.warning({
        title: 'Mínimo un método',
        description: 'Debe haber al menos un método de pago'
      });
      return;
    }
    setMixedPayments(mixedPayments.filter(p => p.id !== id));
  };

  const handleUpdatePaymentMethod = (
    id: string,
    field: 'type' | 'amount',
    value: string | number
  ) => {
    setMixedPayments(
      mixedPayments.map(p =>
        p.id === id
          ? { ...p, [field]: field === 'amount' ? parseFloat(String(value)) || 0 : value }
          : p
      )
    );
  };

  const handleConfirm = () => {
    if (!canConfirm) {
      notify.error({
        title: 'Validación fallida',
        description: 'Verifica los montos ingresados'
      });
      return;
    }

    if (paymentMode === 'simple') {
      onConfirm({
        payment_method: simpleMethod,
        ...(simpleMethod === 'cash' && {
          cashReceived: cashReceivedDecimal.toNumber(),
          cashChange
        })
      });
    } else {
      onConfirm({
        payment_method: 'mixed',
        payments: mixedPayments
      });
    }
  };

  // TODO: Use when implementing payment method icons
  // const getPaymentIcon = (type: 'cash' | 'card' | 'transfer') => {
  //   return PAYMENT_OPTIONS.find(opt => opt.value === type)?.icon || BanknotesIcon;
  // };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose} size="lg">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          {/* ✅ HEADER */}
          <Dialog.Header>
            <Stack direction="row" justify="space-between" align="center" width="full">
              <Stack direction="row" gap="md" align="center">
                <Icon icon={CheckCircleIcon} size="lg" colorPalette="green" />
                <Typography variant="heading" size="lg">
                  Confirmar Pago
                </Typography>
              </Stack>
              <Dialog.CloseTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Icon icon={XMarkIcon} />
                </Button>
              </Dialog.CloseTrigger>
            </Stack>
          </Dialog.Header>

          {/* ✅ BODY */}
          <Dialog.Body>
            <Stack direction="column" gap="lg">
              {/* Total a pagar */}
              <Stack
                direction="column"
                gap="1"
                p="6"
                borderWidth="2px"
                borderRadius="xl"
                borderColor="blue.500"
                bg="blue.50"
                _dark={{ bg: 'blue.950' }}
              >
                <Typography variant="body" size="sm" color="text.muted">
                  Total a Pagar
                </Typography>
                <Typography variant="heading" size="2xl" fontWeight="bold" colorPalette="blue">
                  ${total.toFixed(2)}
                </Typography>
              </Stack>

              {/* Selector de modo */}
              <Stack direction="row" gap="4">
                <Box flex="1">
                  <Button
                    variant={paymentMode === 'simple' ? 'solid' : 'outline'}
                    onClick={() => setPaymentMode('simple')}
                    width="full"
                    size="lg"
                  >
                    Pago Simple
                  </Button>
                </Box>
                <Box flex="1">
                  <Button
                    variant={paymentMode === 'mixed' ? 'solid' : 'outline'}
                    onClick={() => setPaymentMode('mixed')}
                    width="full"
                    size="lg"
                  >
                    Pago Mixto
                  </Button>
                </Box>
              </Stack>

              <Separator />

              {/* PAGO SIMPLE */}
              {paymentMode === 'simple' && (
                <Stack direction="column" gap="4">
                  <Stack direction="column" gap="2">
                    <Typography variant="body" size="sm" fontWeight="medium">Método de Pago</Typography>
                    <select
                      value={simpleMethod}
                      onChange={(e) => setSimpleMethod(e.target.value as 'cash' | 'card' | 'transfer')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--chakra-colors-border-default)',
                        background: 'var(--chakra-colors-bg-surface)',
                        fontSize: '14px'
                      }}
                    >
                      {PAYMENT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Stack>

                  {simpleMethod === 'cash' && (
                    <>
                      <Stack direction="column" gap="2">
                        <Typography variant="body" size="sm" fontWeight="medium">Efectivo Recibido</Typography>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--chakra-colors-border-default)',
                            background: 'var(--chakra-colors-bg-surface)',
                            fontSize: '14px'
                          }}
                        />
                        <Typography variant="body" size="xs" color="text.muted">
                          Ingresa el monto que recibiste del cliente
                        </Typography>
                      </Stack>

                      {cashChange > 0 && (
                        <Alert.Root status="success">
                          <Alert.Title>Cambio a Entregar</Alert.Title>
                          <Alert.Description>
                            <Typography variant="heading" size="lg" fontWeight="bold">
                              ${cashChange.toFixed(2)}
                            </Typography>
                          </Alert.Description>
                        </Alert.Root>
                      )}

                      {cashReceived && cashReceivedDecimal.lessThan(totalDecimal) && (
                        <Alert.Root status="error">
                          <Alert.Title>Monto Insuficiente</Alert.Title>
                          <Alert.Description>
                            Falta ${totalDecimal.minus(cashReceivedDecimal).toFixed(2)}
                          </Alert.Description>
                        </Alert.Root>
                      )}
                    </>
                  )}
                </Stack>
              )}

              {/* PAGO MIXTO */}
              {paymentMode === 'mixed' && (
                <Stack direction="column" gap="4">
                  <Typography variant="body" size="sm" color="text.muted">
                    Distribuye el total entre diferentes métodos de pago
                  </Typography>

                  {mixedPayments.map((payment, index) => {
                    return (
                      <Stack
                        key={payment.id}
                        direction="row"
                        gap="4"
                        align="end"
                        p="4"
                        borderWidth="1px"
                        borderRadius="lg"
                        borderColor="border.default"
                      >
                        <Stack direction="column" gap="2" flex="1">
                          <Typography variant="body" size="sm" fontWeight="medium">Método {index + 1}</Typography>
                          <select
                            value={payment.type}
                            onChange={(e) =>
                              handleUpdatePaymentMethod(payment.id, 'type', e.target.value)
                            }
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--chakra-colors-border-default)',
                              background: 'var(--chakra-colors-bg-surface)',
                              fontSize: '14px'
                            }}
                          >
                            {PAYMENT_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </Stack>

                        <Stack direction="column" gap="2" flex="1">
                          <Typography variant="body" size="sm" fontWeight="medium">Monto</Typography>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={payment.amount || ''}
                            onChange={(e) =>
                              handleUpdatePaymentMethod(payment.id, 'amount', e.target.value)
                            }
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--chakra-colors-border-default)',
                              background: 'var(--chakra-colors-bg-surface)',
                              fontSize: '14px'
                            }}
                          />
                        </Stack>

                        {mixedPayments.length > 1 && (
                          <Button
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => handleRemovePaymentMethod(payment.id)}
                          >
                            <Icon icon={TrashIcon} />
                          </Button>
                        )}
                      </Stack>
                    );
                  })}

                  <Button
                    variant="outline"
                    onClick={handleAddPaymentMethod}
                    disabled={mixedPayments.length >= 4}
                  >
                    <Icon icon={PlusIcon} />
                    Agregar Método
                  </Button>

                  {/* Resumen mixto */}
                  <Stack
                    direction="column"
                    gap="2"
                    p="6"
                    borderWidth="1px"
                    borderRadius="xl"
                    borderColor="border.default"
                    bg="bg.muted"
                  >
                    <Stack direction="row" justify="space-between">
                      <Typography variant="body" size="sm">Total pagos:</Typography>
                      <Typography variant="body" size="sm" fontWeight="bold">
                        ${mixedTotal.toFixed(2)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justify="space-between">
                      <Typography variant="body" size="sm">Restante:</Typography>
                      <Typography
                        variant="body"
                        size="sm"
                        fontWeight="bold"
                        colorPalette={mixedRemaining.equals(0) ? 'green' : 'red'}
                      >
                        ${mixedRemaining.toFixed(2)}
                      </Typography>
                    </Stack>
                  </Stack>

                  {mixedRemaining.greaterThan(0) && (
                    <Alert.Root status="warning">
                      <Alert.Title>Pago Incompleto</Alert.Title>
                      <Alert.Description>
                        Falta completar ${mixedRemaining.toFixed(2)}
                      </Alert.Description>
                    </Alert.Root>
                  )}

                  {mixedRemaining.lessThan(0) && (
                    <Alert.Root status="error">
                      <Alert.Title>Monto Excedido</Alert.Title>
                      <Alert.Description>
                        Sobran ${mixedRemaining.abs().toFixed(2)}
                      </Alert.Description>
                    </Alert.Root>
                  )}
                </Stack>
              )}
            </Stack>
          </Dialog.Body>

          {/* ✅ FOOTER */}
          <Dialog.Footer>
            <Stack direction="row" justify="space-between" width="full">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>

              <Button
                variant="solid"
                colorPalette="green"
                onClick={handleConfirm}
                disabled={!canConfirm}
              >
                <Icon icon={CheckCircleIcon} />
                Confirmar Pago (${total.toFixed(2)})
              </Button>
            </Stack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
