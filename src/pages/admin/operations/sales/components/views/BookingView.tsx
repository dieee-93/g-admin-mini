/**
 * BookingView - Booking view for SERVICE and RENTAL flows
 *
 * Pattern: BOOKING
 * - Single item selection (service or rental)
 * - Datetime/Period selection via HookPoint
 * - Customer info
 * - Simplified checkout (single item, not cart)
 *
 * Used when: productType === 'SERVICE' or productType === 'RENTAL'
 *
 * TODO: Full implementation - currently a placeholder
 */

import { Stack, Typography, Icon, Text, Badge, Button } from '@/shared/ui';
import { CalendarDaysIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import type { ProductType } from '../../hooks/useSaleForm';

// ============================================
// TYPES
// ============================================

interface BookingViewProps {
    /** Selected product/service for booking */
    selectedItem?: {
        id: string;
        name: string;
        price: number;
        duration?: number;
    };
    /** ProductType determines flow type (SERVICE vs RENTAL) */
    productType: ProductType;
    /** Flow data from HookPoint (datetime for SERVICE, period for RENTAL) */
    flowData?: {
        date?: string;
        slotId?: string;
        startTime?: string;
        endTime?: string;
        period?: {
            start: { date: string; time: string };
            end: { date: string; time: string };
            durationHours?: number;
        };
    };
    /** Customer info */
    customer?: {
        id: string;
        name: string;
        email?: string;
    };
    /** Handler to proceed to payment */
    onProceedToPayment?: () => void;
    /** Whether booking is complete and ready for payment */
    isComplete: boolean;
}

// ============================================
// COMPONENT (PLACEHOLDER)
// ============================================

export function BookingView({
    selectedItem,
    productType,
    flowData,
    customer,
    onProceedToPayment,
    isComplete
}: BookingViewProps) {
    const isService = productType === 'SERVICE';

    return (
        <Stack
            direction="column"
            gap="md"
            flex="1"
            borderWidth="1px"
            borderRadius="md"
            p="md"
            bg={isService ? 'green.50' : 'orange.50'}
            _dark={{ bg: isService ? 'green.900' : 'orange.900' }}
        >
            {/* Header */}
            <Stack direction="row" justify="space-between" align="center">
                <Stack direction="row" gap="sm" align="center">
                    <Icon
                        icon={CalendarDaysIcon}
                        size="md"
                        color={isService ? 'green.600' : 'orange.600'}
                    />
                    <Typography variant="heading" size="md">
                        {isService ? 'Reservar Servicio' : 'Reservar Alquiler'}
                    </Typography>
                </Stack>
                <Badge colorPalette={isService ? 'green' : 'orange'}>
                    {productType}
                </Badge>
            </Stack>

            {/* Placeholder Content */}
            <Stack
                direction="column"
                align="center"
                justify="center"
                flex="1"
                gap="md"
                p="xl"
                bg="white"
                _dark={{ bg: 'gray.800' }}
                borderRadius="md"
            >
                <Icon
                    icon={CalendarDaysIcon}
                    size="2xl"
                    color={isService ? 'green.400' : 'orange.400'}
                />
                <Typography variant="heading" size="sm" color={isService ? 'green.600' : 'orange.600'}>
                    Vista de Reserva - {isService ? 'Servicio' : 'Alquiler'}
                </Typography>
                <Text fontSize="sm" color="text.muted" textAlign="center" maxW="300px">
                    Esta vista muestra el flujo de reserva simplificado.
                    {isService
                        ? ' Incluye selección de fecha/hora vía DateTimePickerLite.'
                        : ' Incluye selección de período vía PeriodPicker.'}
                </Text>

                {/* Step indicators */}
                <Stack direction="row" gap="lg" mt="md">
                    <Stack direction="column" align="center" gap="xs">
                        <Badge colorPalette={selectedItem ? 'green' : 'gray'} size="lg">1</Badge>
                        <Text fontSize="xs" color="text.muted">{isService ? 'Servicio' : 'Item'}</Text>
                    </Stack>

                    <Stack direction="column" align="center" gap="xs">
                        <Badge colorPalette={flowData ? 'green' : 'gray'} size="lg">2</Badge>
                        <Text fontSize="xs" color="text.muted">{isService ? 'Fecha/Hora' : 'Período'}</Text>
                    </Stack>

                    <Stack direction="column" align="center" gap="xs">
                        <Badge colorPalette={customer ? 'green' : 'gray'} size="lg">3</Badge>
                        <Text fontSize="xs" color="text.muted">Cliente</Text>
                    </Stack>

                    <Stack direction="column" align="center" gap="xs">
                        <Badge colorPalette={isComplete ? 'green' : 'gray'} size="lg">4</Badge>
                        <Text fontSize="xs" color="text.muted">Pago</Text>
                    </Stack>
                </Stack>

                {/* Selected Item (if any) */}
                {selectedItem && (
                    <Stack
                        direction="row"
                        width="full"
                        p="sm"
                        bg="gray.100"
                        _dark={{ bg: 'gray.700' }}
                        borderRadius="md"
                        justify="space-between"
                        align="center"
                    >
                        <Text fontSize="sm" fontWeight="medium">{selectedItem.name}</Text>
                        <Text fontSize="sm" fontWeight="bold">${selectedItem.price.toFixed(2)}</Text>
                    </Stack>
                )}
            </Stack>

            {/* Action Button */}
            <Button
                colorPalette={isService ? 'green' : 'orange'}
                size="lg"
                width="full"
                disabled={!isComplete}
                onClick={onProceedToPayment}
            >
                <Icon icon={CreditCardIcon} />
                {isComplete ? 'Confirmar Reserva' : 'Complete todos los pasos'}
            </Button>
        </Stack>
    );
}

export default BookingView;
