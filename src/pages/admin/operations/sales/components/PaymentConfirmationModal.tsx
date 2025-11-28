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
  NumberField,
  SelectField,
  createListCollection,
  NativeSelect,
  Separator
} from '@/shared/ui';
import { Field } from '@chakra-ui/react'; // Solo para casos especiales con Field.Root
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
import { safeDecimal } from '@/business-logic/shared/decimalUtils';

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
                gap="xs"
                p="md"
                borderWidth="2px"
                borderRadius="md"
                borderColor="blue.500"
                bg="blue.50"
                _dark={{ bg: 'blue.950' }}
              >
                <Typography variant="body" size="sm" color="text.muted">
                  Total a Pagar
                </Typography>
                <Typography variant="heading" size="2xl" weight="bold" colorPalette="blue">
                  ${total.toFixed(2)}
                </Typography>
              </Stack>

              {/* Selector de modo */}
              <Stack direction="row" gap="md">
                <Button
                  variant={paymentMode === 'simple' ? 'solid' : 'outline'}
                  onClick={() => setPaymentMode('simple')}
                  flex="1"
                >
                  Pago Simple
                </Button>
                <Button
                  variant={paymentMode === 'mixed' ? 'solid' : 'outline'}
                  onClick={() => setPaymentMode('mixed')}
                  flex="1"
                >
                  Pago Mixto
                </Button>
              </Stack>

              <Separator />

              {/* PAGO SIMPLE */}
              {paymentMode === 'simple' && (
                <Stack direction="column" gap="md">
                  <SelectField
                    label="Método de Pago"
                    value={simpleMethod}
                    onChange={(e) => setSimpleMethod(e.target.value as 'cash' | 'card' | 'transfer')}
                  >
                    {PAYMENT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </SelectField>

                  {simpleMethod === 'cash' && (
                    <>
                      <NumberField
                        label="Efectivo Recibido"
                        placeholder="0.00"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        helperText="Ingresa el monto que recibiste del cliente"
                        step={0.01}
                      />

                      {cashChange > 0 && (
                        <Alert status="success" title="Cambio a Entregar">
                          <Typography variant="heading" size="lg" weight="bold">
                            ${cashChange.toFixed(2)}
                          </Typography>
                        </Alert>
                      )}

                      {cashReceived && cashReceivedDecimal.lessThan(totalDecimal) && (
                        <Alert status="error" title="Monto Insuficiente">
                          Falta ${totalDecimal.minus(cashReceivedDecimal).toFixed(2)}
                        </Alert>
                      )}
                    </>
                  )}
                </Stack>
              )}

              {/* PAGO MIXTO */}
              {paymentMode === 'mixed' && (
                <Stack direction="column" gap="md">
                  <Typography variant="body" size="sm" color="text.muted">
                    Distribuye el total entre diferentes métodos de pago
                  </Typography>

                  {mixedPayments.map((payment, index) => {
                    // const PaymentIcon = getPaymentIcon(payment.type); // TODO: Use when implementing icon display
                    return (
                      <Stack
                        key={payment.id}
                        direction="row"
                        gap="md"
                        align="end"
                        p="sm"
                        borderWidth="1px"
                        borderRadius="sm"
                      >
                        <SelectField
                          label={`Método ${index + 1}`}
                          value={payment.type}
                          onChange={(e) =>
                            handleUpdatePaymentMethod(payment.id, 'type', e.target.value)
                          }
                          flex="1"
                        >
                          {PAYMENT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </SelectField>

                        <NumberField
                          label="Monto"
                          placeholder="0.00"
                          value={payment.amount || ''}
                          onChange={(e) =>
                            handleUpdatePaymentMethod(payment.id, 'amount', e.target.value)
                          }
                          flex="1"
                          step={0.01}
                        />

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
                    gap="xs"
                    p="md"
                    borderWidth="1px"
                    borderRadius="sm"
                    bg="gray.50"
                    _dark={{ bg: 'gray.900' }}
                  >
                    <Stack direction="row" justify="space-between">
                      <Typography variant="body" size="sm">Total pagos:</Typography>
                      <Typography variant="body" size="sm" weight="bold">
                        ${mixedTotal.toFixed(2)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justify="space-between">
                      <Typography variant="body" size="sm">Restante:</Typography>
                      <Typography
                        variant="body"
                        size="sm"
                        weight="bold"
                        colorPalette={mixedRemaining.equals(0) ? 'green' : 'red'}
                      >
                        ${mixedRemaining.toFixed(2)}
                      </Typography>
                    </Stack>
                  </Stack>

                  {mixedRemaining.greaterThan(0) && (
                    <Alert status="warning" title="Pago Incompleto">
                      Falta completar ${mixedRemaining.toFixed(2)}
                    </Alert>
                  )}

                  {mixedRemaining.lessThan(0) && (
                    <Alert status="error" title="Monto Excedido">
                      Sobran ${mixedRemaining.abs().toFixed(2)}
                    </Alert>
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
