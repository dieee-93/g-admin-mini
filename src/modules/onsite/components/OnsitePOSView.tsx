/**
 * OnsitePOSView - Full POS view for onsite (table) sales
 *
 * Flow:
 * 1. Select table (TableSelectorLite or existing context)
 * 2. Search and add products (PHYSICAL type)
 * 3. Items sent to kitchen immediately (DIRECT_ORDER pattern)
 * 4. Close table when done
 *
 * @see POS_COMPONENT_ARCHITECTURE.md for full architecture
 */

import { useState, useEffect } from 'react';
import {
    Stack,
    Typography,
    Text,
    Button,
    Badge,
    Alert,
    Box,
    Separator,
    Card
} from '@/shared/ui';
import {
    BuildingStorefrontIcon,
    PaperAirplaneIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import type { CartItem } from '@/store/salesStore';

// ============================================
// TYPES
// ============================================

interface OnsitePOSViewProps {
    /** Current cart items */
    cart: CartItem[];
    /** Handler to add item to cart/order */
    onAddToCart: (item: CartItem) => void;
    /** Handler to remove item */
    onRemoveItem: (materialId: string) => void;
    /** Handler to update quantity */
    onUpdateQuantity: (materialId: string, quantity: number) => void;
    /** Handler to clear all items */
    onClearCart: () => void;
    /** Selected table context */
    tableContext?: {
        tableId: string;
        tableName: string;
        partySize?: number;
    };
    /** Handler when table is selected */
    onTableSelect?: (tableId: string) => void;
    /** Totals for display */
    totals: {
        subtotal: number;
        tax: number;
        total: number;
        itemCount: number;
    };
    /** Handler to send items to kitchen */
    onSendToKitchen?: (items: CartItem[]) => void;
    /** Handler to close table and process payment */
    onCloseTable?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function OnsitePOSView({
    cart,
    onAddToCart,
    onRemoveItem,
    onUpdateQuantity,
    onClearCart,
    tableContext,
    onTableSelect,
    totals,
    onSendToKitchen,
    onCloseTable
}: OnsitePOSViewProps) {
    const [pendingItems, setPendingItems] = useState<CartItem[]>([]);

    // Track which items are pending (not yet sent to kitchen)
    useEffect(() => {
        // For now, all cart items are considered pending
        // In future, we'd track sent vs pending status
        setPendingItems(cart);
    }, [cart]);

    const handleSendToKitchen = () => {
        if (onSendToKitchen && pendingItems.length > 0) {
            onSendToKitchen(pendingItems);
            // Clear pending items after sending
            setPendingItems([]);
        }
    };

    return (
        <Stack direction="column" gap="4" h="full">
            {/* Context Header - Shows selected table */}
            <Card.Root variant="subtle" bg="teal.50" _dark={{ bg: 'teal.900' }}>
                <Card.Body p="3">
                    <Stack direction="row" justify="space-between" align="center">
                        <Stack direction="row" gap="3" align="center">
                            <BuildingStorefrontIcon style={{ width: '24px', height: '24px', color: 'var(--chakra-colors-teal-600)' }} />
                            <Stack gap="0">
                                <Typography variant="heading" size="md">
                                    {tableContext ? `Mesa ${tableContext.tableName}` : 'Mesa no seleccionada'}
                                </Typography>
                                {tableContext?.partySize && (
                                    <Text fontSize="sm" color="fg.muted">
                                        {tableContext.partySize} personas
                                    </Text>
                                )}
                            </Stack>
                        </Stack>

                        <Stack direction="row" gap="2">
                            <Badge colorPalette={cart.length > 0 ? 'blue' : 'gray'}>
                                {totals.itemCount} items · ${totals.total.toFixed(2)}
                            </Badge>
                        </Stack>
                    </Stack>
                </Card.Body>
            </Card.Root>

            {/* Main Content - Two columns */}
            <Stack direction="row" gap="4" flex="1" minH="0">
                {/* Left Column - Products */}
                <Stack direction="column" gap="3" flex="2" overflowY="auto">
                    <Typography variant="heading" size="md">
                        Agregar Productos
                    </Typography>

                    {/* 🎯 PLACEHOLDER: ProductSearch component would go here */}
                    <Alert.Root status="info" variant="subtle">
                        <Alert.Title>Productos</Alert.Title>
                        <Alert.Description>
                            Aquí se mostrará el buscador de productos (ProductSearch).
                            Los productos agregados aparecerán en el panel de la derecha.
                        </Alert.Description>
                    </Alert.Root>
                </Stack>

                {/* Right Column - Order Items */}
                <Stack direction="column" gap="3" flex="1" overflowY="auto" minW="300px">
                    <Stack direction="row" justify="space-between" align="center">
                        <Typography variant="heading" size="md">
                            Orden
                        </Typography>
                        {cart.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                colorPalette="red"
                                onClick={onClearCart}
                            >
                                <XMarkIcon style={{ width: '16px', height: '16px' }} />
                                Limpiar
                            </Button>
                        )}
                    </Stack>

                    {cart.length === 0 ? (
                        <Box p="8" textAlign="center">
                            <Text color="fg.muted">
                                Agrega productos desde la lista
                            </Text>
                        </Box>
                    ) : (
                        <Stack direction="column" gap="2">
                            {cart.map((item) => (
                                <Card.Root key={item.product_id} variant="outline" size="sm">
                                    <Card.Body p="2">
                                        <Stack direction="row" justify="space-between" align="center">
                                            <Stack gap="0">
                                                <Text fontSize="sm" fontWeight="medium">
                                                    {item.product_name}
                                                </Text>
                                                <Text fontSize="xs" color="fg.muted">
                                                    ${item.unit_price.toFixed(2)} × {item.quantity}
                                                </Text>
                                            </Stack>
                                            <Text fontSize="sm" fontWeight="semibold">
                                                ${(item.unit_price * item.quantity).toFixed(2)}
                                            </Text>
                                        </Stack>
                                    </Card.Body>
                                </Card.Root>
                            ))}

                            <Separator />

                            {/* Totals */}
                            <Stack gap="1" p="2">
                                <Stack direction="row" justify="space-between">
                                    <Text fontSize="sm" color="fg.muted">Subtotal</Text>
                                    <Text fontSize="sm">${totals.subtotal.toFixed(2)}</Text>
                                </Stack>
                                <Stack direction="row" justify="space-between">
                                    <Text fontSize="sm" color="fg.muted">Impuestos</Text>
                                    <Text fontSize="sm">${totals.tax.toFixed(2)}</Text>
                                </Stack>
                                <Stack direction="row" justify="space-between">
                                    <Typography variant="heading" size="md">Total</Typography>
                                    <Typography variant="heading" size="md" colorPalette="blue">
                                        ${totals.total.toFixed(2)}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            </Stack>

            {/* Footer Actions */}
            <Stack direction="row" justify="space-between" pt="4" borderTop="1px solid" borderColor="border.muted">
                <Button
                    variant="outline"
                    onClick={onCloseTable}
                    disabled={cart.length === 0}
                >
                    Cerrar Mesa
                </Button>

                <Button
                    variant="solid"
                    colorPalette="teal"
                    onClick={handleSendToKitchen}
                    disabled={pendingItems.length === 0}
                >
                    <PaperAirplaneIcon style={{ width: '18px', height: '18px' }} />
                    Enviar a Cocina ({pendingItems.length})
                </Button>
            </Stack>
        </Stack>
    );
}

export default OnsitePOSView;
