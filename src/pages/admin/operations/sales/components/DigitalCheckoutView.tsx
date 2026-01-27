/**
 * DigitalCheckoutView - Simplified checkout flow for DIGITAL products
 *
 * Digital products (codes, downloads, licenses) have the simplest flow:
 * 1. Select digital product
 * 2. Add to cart
 * 3. Checkout (no fulfillment needed - instant delivery)
 *
 * @see POS_COMPONENT_ARCHITECTURE.md
 */

import {
    Stack,
    Typography,
    Text,
    Card,
    Box,
    Button,
    Badge,
    SimpleGrid,
    Input
} from '@/shared/ui';
import {
    ComputerDesktopIcon,
    MagnifyingGlassIcon,
    ShoppingCartIcon,
    TrashIcon,
    ArrowLeftIcon,
    DocumentArrowDownIcon,
    KeyIcon,
    CreditCardIcon
} from '@heroicons/react/24/outline';
import { useState, useMemo } from 'react';

// ============================================
// TYPES
// ============================================

interface DigitalProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    type: 'license' | 'download' | 'code' | 'subscription';
    icon: 'key' | 'download' | 'code' | 'card';
}

interface CartItem {
    product: DigitalProduct;
    quantity: number;
}

interface DigitalCheckoutViewProps {
    cart: CartItem[];
    onAddToCart: (product: DigitalProduct, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
    onClearCart: () => void;
    totals: {
        subtotal: number;
        tax: number;
        total: number;
    };
    onBack?: () => void;
    onCheckout?: () => void;
}

// ============================================
// MOCK DATA (Replace with real data fetch)
// ============================================

const MOCK_DIGITAL_PRODUCTS: DigitalProduct[] = [
    {
        id: 'dig-1',
        name: 'Licencia Software Pro',
        description: 'Licencia anual para software profesional',
        price: 9999,
        type: 'license',
        icon: 'key'
    },
    {
        id: 'dig-2',
        name: 'Curso Online Premium',
        description: 'Acceso completo al curso en video',
        price: 4999,
        type: 'download',
        icon: 'download'
    },
    {
        id: 'dig-3',
        name: 'Gift Card $5000',
        description: 'Tarjeta de regalo recargable',
        price: 5000,
        type: 'code',
        icon: 'code'
    },
    {
        id: 'dig-4',
        name: 'Suscripción Mensual',
        description: 'Acceso mensual a todos los servicios',
        price: 1999,
        type: 'subscription',
        icon: 'card'
    }
];

// ============================================
// HELPER COMPONENTS
// ============================================

const ProductIcon = ({ type }: { type: DigitalProduct['icon'] }) => {
    const iconProps = { style: { width: '24px', height: '24px' } };
    switch (type) {
        case 'key': return <KeyIcon {...iconProps} />;
        case 'download': return <DocumentArrowDownIcon {...iconProps} />;
        case 'code': return <ComputerDesktopIcon {...iconProps} />;
        case 'card': return <CreditCardIcon {...iconProps} />;
        default: return <ComputerDesktopIcon {...iconProps} />;
    }
};

// ============================================
// COMPONENT
// ============================================

export function DigitalCheckoutView({
    cart,
    onAddToCart,
    onRemoveItem,
    onClearCart,
    totals,
    onBack,
    onCheckout
}: DigitalCheckoutViewProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter products by search
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return MOCK_DIGITAL_PRODUCTS;
        const query = searchQuery.toLowerCase();
        return MOCK_DIGITAL_PRODUCTS.filter(
            p => p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);

    return (
        <Stack direction="column" gap="4" h="full">
            {/* Header */}
            <Stack direction="row" justify="space-between" align="center">
                <Stack direction="row" gap="3" align="center">
                    {onBack && (
                        <Button variant="ghost" size="sm" onClick={onBack}>
                            <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
                        </Button>
                    )}
                    <Box p="2" bg="green.100" borderRadius="lg" _dark={{ bg: 'green.900' }}>
                        <ComputerDesktopIcon style={{ width: '24px', height: '24px', color: 'var(--chakra-colors-green-600)' }} />
                    </Box>
                    <Stack direction="column" gap="0">
                        <Typography variant="heading" size="md">Productos Digitales</Typography>
                        <Text fontSize="sm" color="fg.muted">Entrega instantánea</Text>
                    </Stack>
                </Stack>

                {cart.length > 0 && (
                    <Badge colorPalette="green" size="lg">
                        <ShoppingCartIcon style={{ width: '14px', height: '14px' }} />
                        {cart.length} producto(s)
                    </Badge>
                )}
            </Stack>

            {/* Main Content */}
            <Stack direction={{ base: 'column', md: 'row' }} gap="4" flex="1">
                {/* Left: Product Grid */}
                <Box flex="2">
                    <Stack direction="column" gap="3">
                        {/* Search */}
                        <Input
                            placeholder="Buscar productos digitales..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            startElement={<MagnifyingGlassIcon style={{ width: '16px', height: '16px' }} />}
                        />

                        {/* Products Grid */}
                        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
                            {filteredProducts.map((product) => (
                                <Card.Root
                                    key={product.id}
                                    variant="outline"
                                    cursor="pointer"
                                    onClick={() => onAddToCart(product as any, 1)}
                                    _hover={{
                                        borderColor: 'green.400',
                                        transform: 'translateY(-2px)',
                                        shadow: 'md'
                                    }}
                                    transition="all 0.2s"
                                >
                                    <Card.Body p="3">
                                        <Stack direction="row" gap="3" align="start">
                                            <Box
                                                p="2"
                                                bg="green.50"
                                                borderRadius="md"
                                                _dark={{ bg: 'green.900' }}
                                            >
                                                <ProductIcon type={product.icon} />
                                            </Box>
                                            <Stack direction="column" gap="1" flex="1">
                                                <Typography variant="heading" size="sm">
                                                    {product.name}
                                                </Typography>
                                                <Text fontSize="xs" color="fg.muted" lineClamp={2}>
                                                    {product.description}
                                                </Text>
                                                <Text fontWeight="bold" color="green.600">
                                                    {formatPrice(product.price)}
                                                </Text>
                                            </Stack>
                                        </Stack>
                                    </Card.Body>
                                </Card.Root>
                            ))}
                        </SimpleGrid>

                        {filteredProducts.length === 0 && (
                            <Box textAlign="center" py="8">
                                <Text color="fg.muted">No se encontraron productos</Text>
                            </Box>
                        )}
                    </Stack>
                </Box>

                {/* Right: Cart Summary */}
                <Box flex="1">
                    <Card.Root variant="elevated" h="full">
                        <Card.Header>
                            <Typography variant="heading" size="sm">Resumen</Typography>
                        </Card.Header>
                        <Card.Body>
                            {cart.length === 0 ? (
                                <Stack align="center" py="8" gap="3">
                                    <ShoppingCartIcon style={{ width: '48px', height: '48px', opacity: 0.3 }} />
                                    <Text color="fg.muted" textAlign="center">
                                        Seleccioná productos digitales para agregar
                                    </Text>
                                </Stack>
                            ) : (
                                <Stack direction="column" gap="3">
                                    {cart.map((item) => (
                                        <Stack key={item.product.id} direction="row" justify="space-between" align="center">
                                            <Stack direction="column" gap="0">
                                                <Text fontWeight="medium" fontSize="sm">{item.product.name}</Text>
                                                <Text fontSize="xs" color="fg.muted">x{item.quantity}</Text>
                                            </Stack>
                                            <Stack direction="row" gap="2" align="center">
                                                <Text fontWeight="bold" fontSize="sm">
                                                    {formatPrice(item.product.price * item.quantity)}
                                                </Text>
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    colorPalette="red"
                                                    onClick={() => onRemoveItem(item.product.id)}
                                                >
                                                    <TrashIcon style={{ width: '14px', height: '14px' }} />
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    ))}

                                    <Box borderTopWidth="1px" pt="3" mt="2">
                                        <Stack direction="row" justify="space-between">
                                            <Text>Subtotal</Text>
                                            <Text>{formatPrice(totals.subtotal)}</Text>
                                        </Stack>
                                        <Stack direction="row" justify="space-between">
                                            <Text>IVA</Text>
                                            <Text>{formatPrice(totals.tax)}</Text>
                                        </Stack>
                                        <Stack direction="row" justify="space-between" fontWeight="bold" fontSize="lg" mt="2">
                                            <Text>Total</Text>
                                            <Text color="green.600">{formatPrice(totals.total)}</Text>
                                        </Stack>
                                    </Box>

                                    <Stack direction="column" gap="2" mt="3">
                                        <Button
                                            colorPalette="green"
                                            size="lg"
                                            onClick={onCheckout}
                                            disabled={cart.length === 0}
                                        >
                                            Procesar Compra
                                        </Button>
                                        <Button
                                            variant="outline"
                                            colorPalette="red"
                                            size="sm"
                                            onClick={onClearCart}
                                        >
                                            <TrashIcon style={{ width: '14px', height: '14px' }} />
                                            Limpiar
                                        </Button>
                                    </Stack>
                                </Stack>
                            )}
                        </Card.Body>
                    </Card.Root>
                </Box>
            </Stack>
        </Stack>
    );
}

export default DigitalCheckoutView;
