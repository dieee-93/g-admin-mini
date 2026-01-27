/**
 * DirectOrderView - Direct order view for onsite (table) sales
 *
 * Pattern: DIRECT_ORDER
 * - Items sent to kitchen immediately when added
 * - Running bill displayed (not a cart)
 * - Payment happens at the end (closing bill)
 *
 * Used when: saleContext.type === 'onsite' (table orders)
 *
 * TODO: Full implementation - currently a placeholder
 */

import { Stack, Typography, Icon, Text, Badge } from '@/shared/ui';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

// ============================================
// TYPES
// ============================================

interface OrderItem {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    sentToKitchen?: boolean;
    sentAt?: string;
}

interface DirectOrderViewProps {
    /** Order items (already sent or pending) */
    items: OrderItem[];
    /** Table info */
    tableInfo?: {
        number: string;
        customerName?: string;
        partySize?: number;
    };
    /** Running total */
    runningTotal: number;
    /** Whether orders can still be added */
    isActive: boolean;
}

// ============================================
// COMPONENT (PLACEHOLDER)
// ============================================

export function DirectOrderView({
    items,
    tableInfo,
    runningTotal,
    isActive
}: DirectOrderViewProps) {
    return (
        <Stack
            direction="column"
            gap="md"
            flex="1"
            borderWidth="1px"
            borderRadius="md"
            p="md"
            bg="blue.50"
            _dark={{ bg: 'blue.900' }}
        >
            {/* Header */}
            <Stack direction="row" justify="space-between" align="center">
                <Stack direction="row" gap="sm" align="center">
                    <Icon icon={ClipboardDocumentListIcon} size="md" color="blue.600" />
                    <Typography variant="heading" size="md">
                        Orden en Mesa
                    </Typography>
                </Stack>
                {tableInfo && (
                    <Badge colorPalette="blue" size="lg">
                        Mesa {tableInfo.number}
                    </Badge>
                )}
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
                <Icon icon={ClipboardDocumentListIcon} size="2xl" color="blue.400" />
                <Typography variant="heading" size="sm" color="blue.600">
                    Vista Orden Directa
                </Typography>
                <Text fontSize="sm" color="text.muted" textAlign="center" maxW="300px">
                    Esta vista mostrará los items enviados a cocina en tiempo real.
                    Los items se agregan directamente sin pasar por carrito.
                </Text>

                <Stack direction="column" gap="xs" w="full" mt="md">
                    <Text fontSize="xs" color="text.muted">Implementación pendiente:</Text>
                    <Text fontSize="xs" color="text.muted">• Lista de items enviados</Text>
                    <Text fontSize="xs" color="text.muted">• Botón "Enviar a cocina" por item</Text>
                    <Text fontSize="xs" color="text.muted">• Estado de preparación</Text>
                    <Text fontSize="xs" color="text.muted">• Cuenta corriente</Text>
                </Stack>
            </Stack>

            {/* Running Total */}
            <Stack
                direction="row"
                justify="space-between"
                p="sm"
                bg="blue.100"
                _dark={{ bg: 'blue.800' }}
                borderRadius="md"
            >
                <Typography variant="body" weight="bold">Cuenta actual:</Typography>
                <Typography variant="heading" size="md" colorPalette="blue">
                    ${runningTotal.toFixed(2)}
                </Typography>
            </Stack>
        </Stack>
    );
}

export default DirectOrderView;
