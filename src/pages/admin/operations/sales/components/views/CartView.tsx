/**
 * CartView - Traditional cart view for PHYSICAL and DIGITAL products
 *
 * Pattern: CART
 * - Multiple items can be added
 * - Items stay in cart until checkout
 * - Single checkout process at the end
 *
 * Extracted from SaleFormModal for modular sale pattern support.
 */

import { Stack, Typography, Button, Icon, Separator } from '@/shared/ui';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

// ============================================
// TYPES
// ============================================

interface CartItem {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    available_stock?: number;
}

interface CartViewProps {
    /** Cart items */
    cart: CartItem[];
    /** Handler to remove item from cart */
    onRemoveItem: (productId: string) => void;
    /** Handler to update item quantity */
    onUpdateQuantity: (productId: string, quantity: number) => void;
    /** Handler to clear entire cart */
    onClearCart: () => void;
    /** Calculated totals */
    totals: {
        subtotal: number;
        taxAmount: number;
        total: number;
        itemCount: number;
    };
}

// ============================================
// COMPONENT
// ============================================

export function CartView({
    cart,
    onRemoveItem,
    onUpdateQuantity,
    onClearCart,
    totals
}: CartViewProps) {
    return (
        <Stack
            direction="column"
            gap="md"
            flex="1"
            borderWidth="1px"
            borderRadius="md"
            p="md"
            bg="gray.50"
            _dark={{ bg: 'gray.900' }}
            maxH="600px"
        >
            {/* Header */}
            <Stack direction="row" justify="space-between" align="center">
                <Typography variant="heading" size="md">
                    Carrito
                </Typography>
                {cart.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        colorPalette="red"
                        onClick={onClearCart}
                    >
                        Vaciar
                    </Button>
                )}
            </Stack>

            <Separator />

            {/* Empty State */}
            {cart.length === 0 ? (
                <Stack direction="column" align="center" justify="center" py="xl">
                    <Icon icon={ShoppingCartIcon} size="xl" color="gray.400" />
                    <Typography variant="body" size="sm" color="text.muted" textAlign="center">
                        El carrito está vacío
                        <br />
                        Agrega productos desde la lista
                    </Typography>
                </Stack>
            ) : (
                <>
                    {/* Items */}
                    <Stack direction="column" gap="sm" flex="1" overflowY="auto">
                        {cart.map((item) => (
                            <Stack
                                key={item.product_id}
                                direction="column"
                                gap="xs"
                                p="sm"
                                borderWidth="1px"
                                borderRadius="sm"
                                bg="white"
                                _dark={{ bg: 'gray.800' }}
                            >
                                <Stack direction="row" justify="space-between" align="start">
                                    <Typography variant="body" size="sm" weight="bold" flex="1">
                                        {item.product_name}
                                    </Typography>
                                    <Button
                                        variant="ghost"
                                        size="xs"
                                        colorPalette="red"
                                        onClick={() => onRemoveItem(item.product_id)}
                                    >
                                        <Icon icon={XMarkIcon} size="xs" />
                                    </Button>
                                </Stack>

                                <Stack direction="row" justify="space-between" align="center">
                                    <Stack direction="row" gap="xs" align="center">
                                        <Button
                                            variant="outline"
                                            size="xs"
                                            onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                                        >
                                            -
                                        </Button>
                                        <Typography variant="body" size="sm" minW="30px" textAlign="center">
                                            {item.quantity}
                                        </Typography>
                                        <Button
                                            variant="outline"
                                            size="xs"
                                            onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                                        >
                                            +
                                        </Button>
                                    </Stack>

                                    <Typography variant="body" size="sm">
                                        ${(item.quantity * item.unit_price).toFixed(2)}
                                    </Typography>
                                </Stack>

                                <Typography variant="body" size="xs" color="text.muted">
                                    ${item.unit_price.toFixed(2)} c/u
                                    {item.available_stock && (
                                        <> • Stock: {item.available_stock}</>
                                    )}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>

                    {/* Totals */}
                    <Separator />
                    <Stack direction="column" gap="xs">
                        <Stack direction="row" justify="space-between">
                            <Typography variant="body" size="sm">Subtotal</Typography>
                            <Typography variant="body" size="sm">${totals.subtotal.toFixed(2)}</Typography>
                        </Stack>

                        <Stack direction="row" justify="space-between">
                            <Typography variant="body" size="sm">IVA (21%)</Typography>
                            <Typography variant="body" size="sm">${totals.taxAmount.toFixed(2)}</Typography>
                        </Stack>

                        <Separator />

                        <Stack direction="row" justify="space-between">
                            <Typography variant="heading" size="md" weight="bold">Total</Typography>
                            <Typography variant="heading" size="md" weight="bold" colorPalette="blue">
                                ${totals.total.toFixed(2)}
                            </Typography>
                        </Stack>
                    </Stack>
                </>
            )}
        </Stack>
    );
}

export default CartView;
