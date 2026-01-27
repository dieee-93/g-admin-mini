/**
 * RentalPOSView - Full POS view for rental sales
 *
 * Flow:
 * 1. Select rental item (equipment, space, etc.)
 * 2. Pick rental period using PeriodPicker
 * 3. Calculate pricing based on duration
 * 4. Book rental
 *
 * Pattern: BOOKING
 *
 * @see POS_COMPONENT_ARCHITECTURE.md
 */

import { useState } from 'react';
import {
    Stack,
    Typography,
    Text,
    Button,
    Badge,
    Alert,
    Box,
    Card,
    Separator
} from '@/shared/ui';
import {
    KeyIcon,
    CalendarDaysIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import type { CartItem } from '@/store/salesStore';

// ============================================
// TYPES
// ============================================

interface RentalPOSViewProps {
    /** Current cart items (rentals to book) */
    cart: CartItem[];
    /** Handler to add rental item to cart */
    onAddToCart: (item: CartItem) => void;
    /** Handler to remove item */
    onRemoveItem: (productId: string) => void;
    /** Handler to clear all items */
    onClearCart: () => void;
    /** Totals for display */
    totals: {
        subtotal: number;
        tax: number;
        total: number;
        itemCount: number;
    };
    /** Handler to confirm rental booking */
    onConfirmRental?: (rentalData: RentalData) => void;
}

interface RentalData {
    itemId: string;
    startDate: Date;
    endDate: Date;
    customerId?: string;
    depositAmount?: number;
}

// ============================================
// COMPONENT
// ============================================

export function RentalPOSView({
    cart,
    onAddToCart,
    onRemoveItem,
    onClearCart,
    totals,
    onConfirmRental
}: RentalPOSViewProps) {
    const [rentalPeriod, setRentalPeriod] = useState<{ start: Date; end: Date } | null>(null);
    const [bookingStep, setBookingStep] = useState<'item' | 'period' | 'confirm'>('item');

    // Calculate rental duration
    const getDurationText = () => {
        if (!rentalPeriod) return '';
        const diffTime = Math.abs(rentalPeriod.end.getTime() - rentalPeriod.start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    };

    const handleConfirmRental = () => {
        if (onConfirmRental && cart.length > 0 && rentalPeriod) {
            onConfirmRental({
                itemId: cart[0].product_id,
                startDate: rentalPeriod.start,
                endDate: rentalPeriod.end,
            });
        }
    };

    return (
        <Stack direction="column" gap="4" h="full">
            {/* Context Header */}
            <Card.Root variant="subtle" bg="cyan.50" _dark={{ bg: 'cyan.900' }}>
                <Card.Body p="3">
                    <Stack direction="row" justify="space-between" align="center">
                        <Stack direction="row" gap="3" align="center">
                            <KeyIcon style={{ width: '24px', height: '24px', color: 'var(--chakra-colors-cyan-600)' }} />
                            <Stack gap="0">
                                <Typography variant="heading" size="md">
                                    Alquilar Equipo
                                </Typography>
                                <Text fontSize="sm" color="fg.muted">
                                    Seleccioná un ítem y definí el período de alquiler
                                </Text>
                            </Stack>
                        </Stack>

                        <Badge colorPalette={cart.length > 0 ? 'cyan' : 'gray'}>
                            {cart.length} ítem(s)
                        </Badge>
                    </Stack>
                </Card.Body>
            </Card.Root>

            {/* Booking Steps */}
            <Stack direction="row" gap="2" justify="center">
                <Badge colorPalette={bookingStep === 'item' ? 'cyan' : 'gray'} variant={bookingStep === 'item' ? 'solid' : 'outline'}>
                    1. Ítem
                </Badge>
                <Text color="fg.muted">→</Text>
                <Badge colorPalette={bookingStep === 'period' ? 'cyan' : 'gray'} variant={bookingStep === 'period' ? 'solid' : 'outline'}>
                    2. Período
                </Badge>
                <Text color="fg.muted">→</Text>
                <Badge colorPalette={bookingStep === 'confirm' ? 'cyan' : 'gray'} variant={bookingStep === 'confirm' ? 'solid' : 'outline'}>
                    3. Confirmar
                </Badge>
            </Stack>

            {/* Main Content - Two columns */}
            <Stack direction="row" gap="4" flex="1" minH="0">
                {/* Left Column - Item Selection / Period */}
                <Stack direction="column" gap="3" flex="2" overflowY="auto">
                    {bookingStep === 'item' && (
                        <>
                            <Typography variant="heading" size="md">
                                Seleccionar Ítem para Alquilar
                            </Typography>

                            {/* 🎯 PLACEHOLDER: Rental items list would go here */}
                            <Alert.Root status="info" variant="subtle">
                                <Alert.Title>Ítems Disponibles</Alert.Title>
                                <Alert.Description>
                                    Aquí se mostrará la lista de equipos/espacios disponibles para alquilar.
                                    Seleccioná uno para definir el período de alquiler.
                                </Alert.Description>
                            </Alert.Root>

                            {cart.length > 0 && (
                                <Button
                                    colorPalette="cyan"
                                    onClick={() => setBookingStep('period')}
                                >
                                    Continuar a Período →
                                </Button>
                            )}
                        </>
                    )}

                    {bookingStep === 'period' && (
                        <>
                            <Stack direction="row" justify="space-between" align="center">
                                <Typography variant="heading" size="md">
                                    Definir Período de Alquiler
                                </Typography>
                                <Button variant="ghost" size="sm" onClick={() => setBookingStep('item')}>
                                    ← Volver
                                </Button>
                            </Stack>

                            {/* 🎯 PLACEHOLDER: PeriodPicker would go here */}
                            <Alert.Root status="info" variant="subtle">
                                <Alert.Indicator>
                                    <CalendarDaysIcon style={{ width: '20px', height: '20px' }} />
                                </Alert.Indicator>
                                <Alert.Title>Seleccionar Fechas</Alert.Title>
                                <Alert.Description>
                                    Aquí se mostrará el PeriodPicker para seleccionar
                                    fecha de inicio y fin del alquiler.
                                </Alert.Description>
                            </Alert.Root>

                            {/* Demo button to simulate period selection */}
                            <Button
                                colorPalette="cyan"
                                variant="outline"
                                onClick={() => {
                                    const start = new Date();
                                    const end = new Date();
                                    end.setDate(end.getDate() + 3); // 3 days rental
                                    setRentalPeriod({ start, end });
                                    setBookingStep('confirm');
                                }}
                            >
                                Simular Selección de Período (3 días) →
                            </Button>
                        </>
                    )}

                    {bookingStep === 'confirm' && (
                        <>
                            <Stack direction="row" justify="space-between" align="center">
                                <Typography variant="heading" size="md">
                                    Confirmar Alquiler
                                </Typography>
                                <Button variant="ghost" size="sm" onClick={() => setBookingStep('period')}>
                                    ← Volver
                                </Button>
                            </Stack>

                            <Card.Root variant="outline">
                                <Card.Body p="4">
                                    <Stack gap="3">
                                        <Stack direction="row" gap="2" align="center">
                                            <CheckCircleIcon style={{ width: '20px', height: '20px', color: 'var(--chakra-colors-green-500)' }} />
                                            <Typography variant="heading" size="sm">Resumen del Alquiler</Typography>
                                        </Stack>

                                        <Separator />

                                        {cart.length > 0 && (
                                            <Stack gap="1">
                                                <Text fontSize="sm" fontWeight="medium">Ítem:</Text>
                                                <Text fontSize="sm" color="fg.muted">{cart[0].product_name}</Text>
                                            </Stack>
                                        )}

                                        {rentalPeriod && (
                                            <>
                                                <Stack gap="1">
                                                    <Text fontSize="sm" fontWeight="medium">Período:</Text>
                                                    <Text fontSize="sm" color="fg.muted">
                                                        {rentalPeriod.start.toLocaleDateString()} - {rentalPeriod.end.toLocaleDateString()}
                                                    </Text>
                                                </Stack>
                                                <Stack gap="1">
                                                    <Text fontSize="sm" fontWeight="medium">Duración:</Text>
                                                    <Badge colorPalette="cyan">{getDurationText()}</Badge>
                                                </Stack>
                                            </>
                                        )}

                                        <Separator />

                                        <Stack direction="row" justify="space-between">
                                            <Typography variant="heading" size="md">Total</Typography>
                                            <Typography variant="heading" size="md" colorPalette="cyan">
                                                ${totals.total.toFixed(2)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Card.Body>
                            </Card.Root>
                        </>
                    )}
                </Stack>

                {/* Right Column - Cart Summary */}
                <Stack direction="column" gap="3" flex="1" minW="280px">
                    <Typography variant="heading" size="md">
                        Resumen
                    </Typography>

                    {cart.length === 0 ? (
                        <Box p="6" textAlign="center">
                            <KeyIcon style={{ width: '48px', height: '48px', color: 'var(--chakra-colors-gray-300)', margin: '0 auto 8px' }} />
                            <Text color="fg.muted">
                                Seleccioná un ítem para alquilar
                            </Text>
                        </Box>
                    ) : (
                        <Stack direction="column" gap="2">
                            {cart.map((item) => (
                                <Card.Root key={item.product_id} variant="outline" size="sm">
                                    <Card.Body p="2">
                                        <Stack direction="row" justify="space-between" align="center">
                                            <Text fontSize="sm" fontWeight="medium">
                                                {item.product_name}
                                            </Text>
                                            <Text fontSize="sm" fontWeight="semibold" colorPalette="cyan">
                                                ${item.unit_price.toFixed(2)}/día
                                            </Text>
                                        </Stack>
                                    </Card.Body>
                                </Card.Root>
                            ))}

                            {rentalPeriod && (
                                <Badge colorPalette="cyan" variant="outline">
                                    {getDurationText()}
                                </Badge>
                            )}

                            <Separator />

                            <Stack direction="row" justify="space-between">
                                <Typography variant="heading" size="md">Total</Typography>
                                <Typography variant="heading" size="md" colorPalette="cyan">
                                    ${totals.total.toFixed(2)}
                                </Typography>
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            </Stack>

            {/* Footer Actions */}
            <Stack direction="row" justify="space-between" pt="4" borderTop="1px solid" borderColor="border.muted">
                <Button
                    variant="outline"
                    onClick={onClearCart}
                    disabled={cart.length === 0}
                >
                    Cancelar
                </Button>

                <Button
                    variant="solid"
                    colorPalette="cyan"
                    onClick={handleConfirmRental}
                    disabled={bookingStep !== 'confirm' || cart.length === 0}
                >
                    <CheckCircleIcon style={{ width: '18px', height: '18px' }} />
                    Confirmar Alquiler
                </Button>
            </Stack>
        </Stack>
    );
}

export default RentalPOSView;
