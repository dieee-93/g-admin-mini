/**
 * AppointmentPOSView - Full POS view for appointment (service) sales
 *
 * Flow:
 * 1. Select service type (from available services)
 * 2. Pick date/time using DateTimePickerLite
 * 3. Optional: Add customer info
 * 4. Book appointment
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
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import type { CartItem } from '@/store/salesStore';

// ============================================
// TYPES
// ============================================

interface AppointmentPOSViewProps {
    /** Current cart items (services to book) */
    cart: CartItem[];
    /** Handler to add service to cart */
    onAddToCart: (item: CartItem) => void;
    /** Handler to remove service */
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
    /** Handler to confirm booking */
    onConfirmBooking?: (bookingData: BookingData) => void;
}

interface BookingData {
    serviceId: string;
    datetime: Date;
    customerId?: string;
    notes?: string;
}

// ============================================
// COMPONENT
// ============================================

export function AppointmentPOSView({
    cart,
    onAddToCart,
    onRemoveItem,
    onClearCart,
    totals,
    onConfirmBooking
}: AppointmentPOSViewProps) {
    const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
    const [bookingStep, setBookingStep] = useState<'service' | 'datetime' | 'confirm'>('service');

    const handleConfirmBooking = () => {
        if (onConfirmBooking && cart.length > 0 && selectedDateTime) {
            onConfirmBooking({
                serviceId: cart[0].product_id,
                datetime: selectedDateTime,
            });
        }
    };

    return (
        <Stack direction="column" gap="4" h="full">
            {/* Context Header */}
            <Card.Root variant="subtle" bg="purple.50" _dark={{ bg: 'purple.900' }}>
                <Card.Body p="3">
                    <Stack direction="row" justify="space-between" align="center">
                        <Stack direction="row" gap="3" align="center">
                            <CalendarIcon style={{ width: '24px', height: '24px', color: 'var(--chakra-colors-purple-600)' }} />
                            <Stack gap="0">
                                <Typography variant="heading" size="md">
                                    Reservar Cita
                                </Typography>
                                <Text fontSize="sm" color="fg.muted">
                                    Seleccioná un servicio y elegí fecha/hora
                                </Text>
                            </Stack>
                        </Stack>

                        <Badge colorPalette={cart.length > 0 ? 'purple' : 'gray'}>
                            {cart.length} servicio(s)
                        </Badge>
                    </Stack>
                </Card.Body>
            </Card.Root>

            {/* Booking Steps */}
            <Stack direction="row" gap="2" justify="center">
                <Badge colorPalette={bookingStep === 'service' ? 'purple' : 'gray'} variant={bookingStep === 'service' ? 'solid' : 'outline'}>
                    1. Servicio
                </Badge>
                <Text color="fg.muted">→</Text>
                <Badge colorPalette={bookingStep === 'datetime' ? 'purple' : 'gray'} variant={bookingStep === 'datetime' ? 'solid' : 'outline'}>
                    2. Fecha/Hora
                </Badge>
                <Text color="fg.muted">→</Text>
                <Badge colorPalette={bookingStep === 'confirm' ? 'purple' : 'gray'} variant={bookingStep === 'confirm' ? 'solid' : 'outline'}>
                    3. Confirmar
                </Badge>
            </Stack>

            {/* Main Content - Two columns */}
            <Stack direction="row" gap="4" flex="1" minH="0">
                {/* Left Column - Service Selection / DateTime */}
                <Stack direction="column" gap="3" flex="2" overflowY="auto">
                    {bookingStep === 'service' && (
                        <>
                            <Typography variant="heading" size="md">
                                Seleccionar Servicio
                            </Typography>

                            {/* 🎯 PLACEHOLDER: Service list would go here */}
                            <Alert.Root status="info" variant="subtle">
                                <Alert.Title>Servicios Disponibles</Alert.Title>
                                <Alert.Description>
                                    Aquí se mostrará la lista de servicios disponibles para reservar.
                                    Seleccioná uno para continuar con la fecha/hora.
                                </Alert.Description>
                            </Alert.Root>

                            {cart.length > 0 && (
                                <Button
                                    colorPalette="purple"
                                    onClick={() => setBookingStep('datetime')}
                                >
                                    Continuar a Fecha/Hora →
                                </Button>
                            )}
                        </>
                    )}

                    {bookingStep === 'datetime' && (
                        <>
                            <Stack direction="row" justify="space-between" align="center">
                                <Typography variant="heading" size="md">
                                    Seleccionar Fecha y Hora
                                </Typography>
                                <Button variant="ghost" size="sm" onClick={() => setBookingStep('service')}>
                                    ← Volver
                                </Button>
                            </Stack>

                            {/* 🎯 PLACEHOLDER: DateTimePickerLite would go here */}
                            <Alert.Root status="info" variant="subtle">
                                <Alert.Indicator>
                                    <ClockIcon style={{ width: '20px', height: '20px' }} />
                                </Alert.Indicator>
                                <Alert.Title>Horarios Disponibles</Alert.Title>
                                <Alert.Description>
                                    Aquí se mostrará el DateTimePickerLite para seleccionar
                                    un slot disponible para el servicio.
                                </Alert.Description>
                            </Alert.Root>

                            {/* Demo button to simulate datetime selection */}
                            <Button
                                colorPalette="purple"
                                variant="outline"
                                onClick={() => {
                                    setSelectedDateTime(new Date());
                                    setBookingStep('confirm');
                                }}
                            >
                                Simular Selección de Horario →
                            </Button>
                        </>
                    )}

                    {bookingStep === 'confirm' && (
                        <>
                            <Stack direction="row" justify="space-between" align="center">
                                <Typography variant="heading" size="md">
                                    Confirmar Reserva
                                </Typography>
                                <Button variant="ghost" size="sm" onClick={() => setBookingStep('datetime')}>
                                    ← Volver
                                </Button>
                            </Stack>

                            <Card.Root variant="outline">
                                <Card.Body p="4">
                                    <Stack gap="3">
                                        <Stack direction="row" gap="2" align="center">
                                            <CheckCircleIcon style={{ width: '20px', height: '20px', color: 'var(--chakra-colors-green-500)' }} />
                                            <Typography variant="heading" size="sm">Resumen de la Cita</Typography>
                                        </Stack>

                                        <Separator />

                                        {cart.length > 0 && (
                                            <Stack gap="1">
                                                <Text fontSize="sm" fontWeight="medium">Servicio:</Text>
                                                <Text fontSize="sm" color="fg.muted">{cart[0].product_name}</Text>
                                            </Stack>
                                        )}

                                        {selectedDateTime && (
                                            <Stack gap="1">
                                                <Text fontSize="sm" fontWeight="medium">Fecha/Hora:</Text>
                                                <Text fontSize="sm" color="fg.muted">
                                                    {selectedDateTime.toLocaleDateString()} - {selectedDateTime.toLocaleTimeString()}
                                                </Text>
                                            </Stack>
                                        )}

                                        <Separator />

                                        <Stack direction="row" justify="space-between">
                                            <Typography variant="heading" size="md">Total</Typography>
                                            <Typography variant="heading" size="md" colorPalette="purple">
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
                            <CalendarIcon style={{ width: '48px', height: '48px', color: 'var(--chakra-colors-gray-300)', margin: '0 auto 8px' }} />
                            <Text color="fg.muted">
                                Seleccioná un servicio para comenzar
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
                                            <Text fontSize="sm" fontWeight="semibold" colorPalette="purple">
                                                ${item.unit_price.toFixed(2)}
                                            </Text>
                                        </Stack>
                                    </Card.Body>
                                </Card.Root>
                            ))}

                            <Separator />

                            <Stack direction="row" justify="space-between">
                                <Typography variant="heading" size="md">Total</Typography>
                                <Typography variant="heading" size="md" colorPalette="purple">
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
                    colorPalette="purple"
                    onClick={handleConfirmBooking}
                    disabled={bookingStep !== 'confirm' || cart.length === 0}
                >
                    <CheckCircleIcon style={{ width: '18px', height: '18px' }} />
                    Confirmar Reserva
                </Button>
            </Stack>
        </Stack>
    );
}

export default AppointmentPOSView;
