/**
 * BillModal - Table checkout modal with payment processing
 * 
 * Integrates with ModernPaymentProcessor for multi-payment support
 * Follows project Dialog pattern (see SupplierFormModal)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    Dialog,
    Box,
    Stack,
    Grid,
    Typography,
    Button,
    Badge,
    Separator
} from '@/shared/ui';
import {
    BanknotesIcon,
    UserGroupIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';

// Import payment processor
import { ModernPaymentProcessor } from '@/pages/admin/operations/sales/components/Payment/ModernPaymentProcessor';
import type { PaymentMethod } from '@/pages/admin/operations/sales/types';
import { useSalesStore } from '@/store/salesStore';

// Module types
import type { Table, Party } from '@/modules/onsite/types';

// Utils
import { DecimalUtils } from '@/lib/decimal';
import { formatDuration } from '../utils';

// ============================================
// TYPES
// ============================================

export interface BillModalProps {
    isOpen: boolean;
    onClose: () => void;
    table: Table;
    party: Party;
    onPaymentComplete: (payments: PaymentMethod[]) => void;
    onPaymentError: (error: string) => void;
}

// ============================================
// COMPONENT
// ============================================

export function BillModal({
    isOpen,
    onClose,
    table,
    party,
    onPaymentComplete,
    onPaymentError
}: BillModalProps) {
    const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);

    // Calculate duration
    const seatedAt = new Date(party.seated_at);
    const now = new Date();
    const durationMinutes = Math.floor((now.getTime() - seatedAt.getTime()) / 60000);

    // Dialog size based on payment processor view
    const dialogSize = useMemo(() => ({ base: 'full', md: 'xl' } as const), []);

    // Handle open change - CORRECT PATTERN from SupplierFormModal
    const handleOpenChange = useCallback((details: { open: boolean }) => {
        if (!details.open) {
            setShowPaymentProcessor(false);
            onClose();
        }
    }, [onClose]);

    // Handle payment completion
    const handlePaymentComplete = useCallback((payments: PaymentMethod[]) => {
        setShowPaymentProcessor(false);
        onPaymentComplete(payments);
    }, [onPaymentComplete]);

    // Handle payment error
    const handlePaymentError = useCallback((error: string) => {
        onPaymentError(error);
    }, [onPaymentError]);

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={handleOpenChange}
            size={dialogSize}
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    maxW={{ base: '100%', md: showPaymentProcessor ? '900px' : '500px' }}
                    maxH={{ base: '100vh', md: '90vh' }}
                    w="full"
                    overflowY="auto"
                    borderRadius={{ base: '0', md: 'lg' }}
                    m={{ base: '0', md: '4' }}
                >
                    <Dialog.CloseTrigger />
                    <Dialog.Header>
                        <Dialog.Title>📋 Cuenta - Mesa {table.number}</Dialog.Title>
                    </Dialog.Header>

                    <Dialog.Body p={{ base: '4', md: '6' }}>
                        {!showPaymentProcessor ? (
                            // Bill Summary View
                            <Stack gap="4">
                                {/* Party Info */}
                                <Box
                                    p="4"
                                    borderRadius="lg"
                                    bg="gray.50"
                                    _dark={{ bg: 'gray.800' }}
                                >
                                    <Stack gap="3">
                                        {/* Customer Name */}
                                        {party.customer_name && (
                                            <Stack direction="row" align="center" gap="2">
                                                <Icon icon={UserGroupIcon} size="sm" color="gray.500" />
                                                <Typography fontWeight="medium">
                                                    {party.customer_name}
                                                </Typography>
                                            </Stack>
                                        )}

                                        {/* Party Size */}
                                        <Stack direction="row" align="center" justify="space-between">
                                            <Typography color="text.muted">Personas:</Typography>
                                            <Badge colorPalette="blue">{party.size}</Badge>
                                        </Stack>

                                        {/* Duration */}
                                        <Stack direction="row" align="center" justify="space-between">
                                            <Stack direction="row" align="center" gap="1">
                                                <Icon icon={ClockIcon} size="xs" color="gray.500" />
                                                <Typography color="text.muted">Tiempo:</Typography>
                                            </Stack>
                                            <Typography>{formatDuration(durationMinutes)}</Typography>
                                        </Stack>

                                        {/* Seated At */}
                                        <Stack direction="row" align="center" justify="space-between">
                                            <Typography color="text.muted">Ingreso:</Typography>
                                            <Typography>
                                                {seatedAt.toLocaleTimeString('es-AR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Box>

                                <Separator />

                                <Box>
                                    <Typography fontWeight="bold" mb={2} fontSize="sm" color="gray.600">Detalle de Consumo</Typography>
                                    <OrdersList partyId={party.id} />
                                </Box>

                                <Separator />

                                {/* Total */}
                                <Stack direction="row" align="center" justify="space-between" px="2">
                                    <Stack direction="row" align="center" gap="2">
                                        <Icon icon={BanknotesIcon} size="md" color="green.500" />
                                        <Typography fontSize="lg" fontWeight="bold">
                                            Total a Pagar:
                                        </Typography>
                                    </Stack>
                                    <Typography fontSize="2xl" fontWeight="bold" color="green.500">
                                        {DecimalUtils.formatCurrency(party.total_spent)}
                                    </Typography>
                                </Stack>

                                {party.total_spent === 0 && (
                                    <Box
                                        p="3"
                                        borderRadius="md"
                                        bg="yellow.50"
                                        borderWidth="1px"
                                        borderColor="yellow.200"
                                        _dark={{ bg: 'yellow.900/20', borderColor: 'yellow.700' }}
                                    >
                                        <Typography fontSize="sm" color="yellow.700" _dark={{ color: 'yellow.300' }}>
                                            ⚠️ No hay consumo registrado para esta mesa.
                                        </Typography>
                                    </Box>
                                )}

                                {/* Action Buttons */}
                                <Grid templateColumns="repeat(2, 1fr)" gap="3">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                    >
                                        Cancelar
                                    </Button>
                                    {party.total_spent === 0 ? (
                                        <Button
                                            colorPalette="red"
                                            onClick={() => handlePaymentComplete([])}
                                        >
                                            ❌ Liberar Mesa
                                        </Button>
                                    ) : (
                                        <Button
                                            colorPalette="green"
                                            onClick={() => setShowPaymentProcessor(true)}
                                        >
                                            💳 Procesar Pago
                                        </Button>
                                    )}
                                </Grid>
                            </Stack>
                        ) : (
                            // Payment Processor View
                            <Stack gap="4">
                                <ModernPaymentProcessor
                                    saleId={`table-${table.id}-party-${party.id}`}
                                    totalAmount={party.total_spent}
                                    subtotal={DecimalUtils.divide(party.total_spent, 1.21).toNumber()}
                                    taxes={DecimalUtils.subtract(party.total_spent, DecimalUtils.divide(party.total_spent, 1.21)).toNumber()}
                                    onPaymentComplete={handlePaymentComplete}
                                    onPaymentError={handlePaymentError}
                                    allowSplitBill={party.size > 1}
                                    customerCount={party.size}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPaymentProcessor(false)}
                                >
                                    ← Volver al Resumen
                                </Button>
                            </Stack>
                        )}
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}

// Helper component to list orders
function OrdersList({ partyId }: { partyId: string }) {
    const sales = useSalesStore(state => state.sales);

    // Filter sales that belong to this party
    const partySales = useMemo(() => {
        return sales.filter(sale =>
            sale.metadata?.context?.type === 'onsite' &&
            sale.metadata?.context?.partyId === partyId
        );
    }, [sales, partyId]);

    if (partySales.length === 0) {
        return <Typography color="gray.500" fontSize="sm" fontStyle="italic">No hay órdenes registradas</Typography>;
    }

    return (
        <Stack gap={2}>
            {partySales.map(sale => (
                <React.Fragment key={sale.id}>
                    <HStack justify="space-between" fontSize="sm" align="start">
                        <Stack gap={0} flex={1}>
                            {sale.items.map((item, idx) => (
                                <Typography key={idx} color="gray.700">
                                    {item.quantity}x {item.product_name}
                                </Typography>
                            ))}
                        </Stack>
                        <Typography fontWeight="medium">${sale.total.toFixed(2)}</Typography>
                    </HStack>
                    <Separator opacity={0.5} />
                </React.Fragment>
            ))}
        </Stack>
    );
}
