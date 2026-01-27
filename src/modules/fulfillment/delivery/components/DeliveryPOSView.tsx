/**
 * DeliveryPOSView - POS view for delivery orders
 *
 * This view handles the complete delivery flow:
 * 1. Customer selection (or anonymous entry)
 * 2. Address selection with map preview
 * 3. Product selection
 * 4. Order confirmation
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
    Input,
    Textarea,
    Switch
} from '@/shared/ui';
import {
    TruckIcon,
    UserIcon,
    MapPinIcon,
    ShoppingCartIcon,
    TrashIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';
import { useState, useMemo, useEffect } from 'react';
import { CustomerSelector } from '@/shared/components';
import { AddressMapPreview } from '@/pages/admin/core/crm/customers/components/AddressManager/AddressMapPreview';
import type { Customer } from '@/pages/admin/core/crm/customers/types/customer';
import type { CustomerAddress } from '@/pages/admin/core/crm/customers/types/customerAddress';

// ============================================
// TYPES
// ============================================

interface DeliveryInfo {
    // Customer data
    customer: Customer | null;
    customerName: string;
    phone: string;
    // Address data
    selectedAddress: CustomerAddress | null;
    manualAddress: string;
    // Common
    notes: string;
}

interface CartItem {
    product_id: string;
    name: string;
    quantity: number;
    unit_price: number;
}

interface DeliveryPOSViewProps {
    cart: CartItem[];
    onAddToCart: (product: any, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
    onClearCart: () => void;
    totals: {
        subtotal: number;
        tax: number;
        total: number;
    };
    onBack?: () => void;
    onConfirmDelivery?: (deliveryInfo: DeliveryInfo) => void;
}

// ============================================
// MOCK PRODUCTS (Replace with real data)
// ============================================

const MOCK_PRODUCTS = [
    { id: 'prod-1', name: 'Hamburguesa Clásica', price: 2500, category: 'Comida' },
    { id: 'prod-2', name: 'Pizza Grande', price: 4500, category: 'Comida' },
    { id: 'prod-3', name: 'Empanadas x6', price: 3000, category: 'Comida' },
    { id: 'prod-4', name: 'Coca-Cola 1.5L', price: 1200, category: 'Bebida' },
    { id: 'prod-5', name: 'Agua Mineral', price: 800, category: 'Bebida' },
    { id: 'prod-6', name: 'Postre del Día', price: 1800, category: 'Postre' },
];

// ============================================
// MOCK ADDRESSES (For testing - would come from customer)
// ============================================

const MOCK_ADDRESSES: CustomerAddress[] = [
    {
        id: 'addr-1',
        customer_id: 'cust-1',
        label: 'Casa',
        address_line_1: 'Av. Corrientes 1234',
        city: 'CABA',
        is_default: true,
        is_verified: true,
        usage_count: 5,
        latitude: -34.6037,
        longitude: -58.3816,
        formatted_address: 'Av. Corrientes 1234, CABA, Argentina',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'addr-2',
        customer_id: 'cust-1',
        label: 'Trabajo',
        address_line_1: 'Av. Santa Fe 5678',
        city: 'CABA',
        is_default: false,
        is_verified: true,
        usage_count: 2,
        latitude: -34.5908,
        longitude: -58.4176,
        formatted_address: 'Av. Santa Fe 5678, CABA, Argentina',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

// ============================================
// STEP INDICATOR
// ============================================

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
    const steps = [
        { num: 1, label: 'Cliente', icon: UserIcon },
        { num: 2, label: 'Dirección', icon: MapPinIcon },
        { num: 3, label: 'Productos', icon: ShoppingCartIcon },
        { num: 4, label: 'Confirmar', icon: CheckCircleIcon }
    ];

    return (
        <Stack direction="row" justify="center" gap="2" py="2">
            {steps.map((step, idx) => (
                <Stack key={step.num} direction="row" align="center" gap="2">
                    <Box
                        w="8"
                        h="8"
                        borderRadius="full"
                        bg={currentStep >= step.num ? 'orange.500' : 'gray.200'}
                        color={currentStep >= step.num ? 'white' : 'gray.500'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="bold"
                        fontSize="sm"
                    >
                        {step.num}
                    </Box>
                    <Text
                        fontSize="sm"
                        fontWeight={currentStep === step.num ? 'bold' : 'normal'}
                        color={currentStep === step.num ? 'orange.600' : 'fg.muted'}
                        display={{ base: 'none', sm: 'block' }}
                    >
                        {step.label}
                    </Text>
                    {idx < steps.length - 1 && (
                        <Box w="8" h="1px" bg="gray.300" display={{ base: 'none', md: 'block' }} />
                    )}
                </Stack>
            ))}
        </Stack>
    );
};

// ============================================
// COMPONENT
// ============================================

export function DeliveryPOSView({
    cart,
    onAddToCart,
    onRemoveItem,
    onClearCart,
    totals,
    onBack,
    onConfirmDelivery
}: DeliveryPOSViewProps) {
    const [step, setStep] = useState(1);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
        customer: null,
        customerName: '',
        phone: '',
        selectedAddress: null,
        manualAddress: '',
        notes: ''
    });

    // Mock: When customer is selected, load their addresses
    const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);

    useEffect(() => {
        if (deliveryInfo.customer) {
            // TODO: Replace with real API call to fetch customer addresses
            // customerAddressesApi.getByCustomerId(deliveryInfo.customer.id)
            setCustomerAddresses(MOCK_ADDRESSES);

            // Auto-select default address
            const defaultAddr = MOCK_ADDRESSES.find(a => a.is_default) || MOCK_ADDRESSES[0];
            if (defaultAddr) {
                setDeliveryInfo(prev => ({ ...prev, selectedAddress: defaultAddr }));
            }
        } else {
            setCustomerAddresses([]);
            setDeliveryInfo(prev => ({ ...prev, selectedAddress: null }));
        }
    }, [deliveryInfo.customer]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);

    const canProceed = useMemo(() => {
        switch (step) {
            case 1:
                if (isAnonymous) {
                    return deliveryInfo.customerName.trim() && deliveryInfo.phone.trim();
                }
                return deliveryInfo.customer !== null;
            case 2:
                if (isAnonymous) {
                    return deliveryInfo.manualAddress.trim();
                }
                return deliveryInfo.selectedAddress !== null;
            case 3:
                return cart.length > 0;
            default:
                return true;
        }
    }, [step, deliveryInfo, cart, isAnonymous]);

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else if (onConfirmDelivery) onConfirmDelivery(deliveryInfo);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else if (onBack) onBack();
    };

    const handleCustomerSelect = (customer: Customer | null) => {
        setDeliveryInfo(prev => ({
            ...prev,
            customer,
            customerName: customer?.name || '',
            phone: customer?.phone || ''
        }));
    };

    const handleAddressSelect = (address: CustomerAddress) => {
        setDeliveryInfo(prev => ({ ...prev, selectedAddress: address }));
    };

    const getDisplayAddress = () => {
        if (isAnonymous) return deliveryInfo.manualAddress;
        return deliveryInfo.selectedAddress?.formatted_address || deliveryInfo.selectedAddress?.address_line_1 || '';
    };

    return (
        <Stack direction="column" gap="4" h="full">
            {/* Header */}
            <Stack
                direction="row"
                justify="space-between"
                align="center"
                p="3"
                bg="orange.50"
                borderRadius="lg"
                _dark={{ bg: 'orange.900' }}
            >
                <Stack direction="row" gap="3" align="center">
                    <Box p="2" bg="orange.100" borderRadius="lg" _dark={{ bg: 'orange.800' }}>
                        <TruckIcon style={{ width: '24px', height: '24px', color: 'var(--chakra-colors-orange-600)' }} />
                    </Box>
                    <Stack direction="column" gap="0">
                        <Typography variant="heading" size="md">Delivery</Typography>
                        <Text fontSize="sm" color="fg.muted">Envío a domicilio</Text>
                    </Stack>
                </Stack>

                {cart.length > 0 && (
                    <Badge colorPalette="orange" size="lg">
                        {formatPrice(totals.total)}
                    </Badge>
                )}
            </Stack>

            {/* Step Indicator */}
            <StepIndicator currentStep={step} />

            {/* Step Content */}
            <Box flex="1" overflowY="auto">
                {/* STEP 1: Customer Selection */}
                {step === 1 && (
                    <Card.Root variant="outline">
                        <Card.Header>
                            <Stack direction="row" justify="space-between" align="center">
                                <Stack direction="row" gap="2" align="center">
                                    <UserIcon style={{ width: '20px', height: '20px' }} />
                                    <Typography variant="heading" size="sm">Cliente</Typography>
                                </Stack>

                                {/* Anonymous Toggle */}
                                <Switch
                                    checked={isAnonymous}
                                    onChange={(checked) => setIsAnonymous(checked)}
                                    colorPalette="orange"
                                    labelPlacement="start"
                                >
                                    Venta anónima
                                </Switch>
                            </Stack>
                        </Card.Header>
                        <Card.Body>
                            {isAnonymous ? (
                                // Anonymous Mode: Manual fields
                                <Stack direction="column" gap="4">
                                    <Stack direction="column" gap="1">
                                        <Text fontWeight="medium" fontSize="sm">Nombre</Text>
                                        <Input
                                            placeholder="Nombre del cliente"
                                            value={deliveryInfo.customerName}
                                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, customerName: e.target.value })}
                                        />
                                    </Stack>
                                    <Stack direction="column" gap="1">
                                        <Text fontWeight="medium" fontSize="sm">Teléfono</Text>
                                        <Input
                                            placeholder="Número de contacto"
                                            value={deliveryInfo.phone}
                                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                                        />
                                    </Stack>
                                </Stack>
                            ) : (
                                // Customer Mode: Selector
                                <Stack direction="column" gap="4">
                                    <CustomerSelector
                                        selectedCustomer={deliveryInfo.customer}
                                        onSelect={handleCustomerSelect}
                                        onCreateNew={() => {
                                            // TODO: Open customer creation modal
                                            console.log('Open customer creation modal');
                                        }}
                                        placeholder="Buscar cliente por nombre, teléfono..."
                                    />
                                </Stack>
                            )}
                        </Card.Body>
                    </Card.Root>
                )}

                {/* STEP 2: Address Selection */}
                {step === 2 && (
                    <Card.Root variant="outline">
                        <Card.Header>
                            <Stack direction="row" gap="2" align="center">
                                <MapPinIcon style={{ width: '20px', height: '20px' }} />
                                <Typography variant="heading" size="sm">Dirección de Entrega</Typography>
                            </Stack>
                        </Card.Header>
                        <Card.Body>
                            <Stack direction="column" gap="4">
                                {isAnonymous ? (
                                    // Anonymous: Manual address entry
                                    <>
                                        <Stack direction="column" gap="1">
                                            <Text fontWeight="medium" fontSize="sm">Dirección</Text>
                                            <Textarea
                                                placeholder="Calle, número, piso, departamento..."
                                                value={deliveryInfo.manualAddress}
                                                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, manualAddress: e.target.value })}
                                                rows={3}
                                            />
                                        </Stack>
                                    </>
                                ) : (
                                    // Customer: Address selector + Map
                                    <>
                                        {customerAddresses.length > 0 ? (
                                            <>
                                                {/* Address Selection */}
                                                <Stack direction="column" gap="2">
                                                    <Text fontWeight="medium" fontSize="sm">Seleccionar dirección</Text>
                                                    <Stack direction="column" gap="2">
                                                        {customerAddresses.map((addr) => (
                                                            <Card.Root
                                                                key={addr.id}
                                                                variant="outline"
                                                                cursor="pointer"
                                                                onClick={() => handleAddressSelect(addr)}
                                                                borderColor={deliveryInfo.selectedAddress?.id === addr.id ? 'orange.500' : undefined}
                                                                bg={deliveryInfo.selectedAddress?.id === addr.id ? 'orange.50' : undefined}
                                                                _dark={{
                                                                    bg: deliveryInfo.selectedAddress?.id === addr.id ? 'orange.950' : undefined
                                                                }}
                                                            >
                                                                <Card.Body p="3">
                                                                    <Stack direction="row" justify="space-between" align="center">
                                                                        <Stack direction="column" gap="0">
                                                                            <Stack direction="row" gap="2" align="center">
                                                                                <Text fontWeight="semibold">{addr.label}</Text>
                                                                                {addr.is_default && (
                                                                                    <Badge size="sm" colorPalette="green">Por defecto</Badge>
                                                                                )}
                                                                            </Stack>
                                                                            <Text fontSize="sm" color="fg.muted">
                                                                                {addr.formatted_address || addr.address_line_1}
                                                                            </Text>
                                                                        </Stack>
                                                                        {deliveryInfo.selectedAddress?.id === addr.id && (
                                                                            <CheckCircleIcon style={{ width: '20px', height: '20px', color: 'var(--chakra-colors-orange-500)' }} />
                                                                        )}
                                                                    </Stack>
                                                                </Card.Body>
                                                            </Card.Root>
                                                        ))}
                                                    </Stack>
                                                </Stack>

                                                {/* Map Preview */}
                                                {deliveryInfo.selectedAddress && (
                                                    <Box mt="3">
                                                        <Text fontWeight="medium" fontSize="sm" mb="2">Vista previa</Text>
                                                        <AddressMapPreview
                                                            addresses={customerAddresses}
                                                            selectedAddress={deliveryInfo.selectedAddress}
                                                            height="200px"
                                                        />
                                                    </Box>
                                                )}
                                            </>
                                        ) : (
                                            <Box py="4" textAlign="center">
                                                <Text color="fg.muted">
                                                    El cliente no tiene direcciones registradas
                                                </Text>
                                                <Box marginTop="2">
                                                    <Button variant="outline" colorPalette="orange" size="sm">
                                                        Agregar dirección
                                                    </Button>
                                                </Box>
                                            </Box>
                                        )}
                                    </>
                                )}

                                {/* Notes field - always visible */}
                                <Stack direction="column" gap="1">
                                    <Text fontWeight="medium" fontSize="sm">Notas de entrega (opcional)</Text>
                                    <Input
                                        placeholder="Indicaciones adicionales..."
                                        value={deliveryInfo.notes}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, notes: e.target.value })}
                                    />
                                </Stack>
                            </Stack>
                        </Card.Body>
                    </Card.Root>
                )}

                {/* STEP 3: Products */}
                {step === 3 && (
                    <Stack direction="column" gap="3">
                        <Typography variant="heading" size="sm">Seleccionar Productos</Typography>
                        <SimpleGrid columns={{ base: 2, sm: 3 }} gap="2">
                            {MOCK_PRODUCTS.map((product) => (
                                <Card.Root
                                    key={product.id}
                                    variant="outline"
                                    cursor="pointer"
                                    onClick={() => onAddToCart(product as any, 1)}
                                    _hover={{ borderColor: 'orange.400', shadow: 'sm' }}
                                    transition="all 0.2s"
                                >
                                    <Card.Body p="2">
                                        <Stack direction="column" gap="1">
                                            <Text fontWeight="medium" fontSize="sm" lineClamp={1}>{product.name}</Text>
                                            <Text fontSize="xs" color="orange.600" fontWeight="bold">
                                                {formatPrice(product.price)}
                                            </Text>
                                        </Stack>
                                    </Card.Body>
                                </Card.Root>
                            ))}
                        </SimpleGrid>

                        {/* Cart Summary */}
                        {cart.length > 0 && (
                            <Card.Root variant="elevated" mt="3">
                                <Card.Body p="3">
                                    <Stack direction="column" gap="2">
                                        <Stack direction="row" justify="space-between" align="center">
                                            <Typography variant="heading" size="xs">Carrito ({cart.length})</Typography>
                                            <Button variant="ghost" size="xs" colorPalette="red" onClick={onClearCart}>
                                                <TrashIcon style={{ width: '14px', height: '14px' }} />
                                            </Button>
                                        </Stack>
                                        {cart.slice(0, 3).map((item) => (
                                            <Stack key={item.product_id} direction="row" justify="space-between" fontSize="sm">
                                                <Text>{item.quantity}x {item.name}</Text>
                                                <Text fontWeight="bold">{formatPrice(item.unit_price * item.quantity)}</Text>
                                            </Stack>
                                        ))}
                                        {cart.length > 3 && (
                                            <Text fontSize="xs" color="fg.muted">+{cart.length - 3} más...</Text>
                                        )}
                                    </Stack>
                                </Card.Body>
                            </Card.Root>
                        )}
                    </Stack>
                )}

                {/* STEP 4: Confirmation */}
                {step === 4 && (
                    <Card.Root variant="elevated">
                        <Card.Header bg="orange.50" _dark={{ bg: 'orange.900' }}>
                            <Stack direction="row" gap="2" align="center">
                                <CheckCircleIcon style={{ width: '20px', height: '20px', color: 'var(--chakra-colors-orange-600)' }} />
                                <Typography variant="heading" size="sm">Confirmar Pedido</Typography>
                            </Stack>
                        </Card.Header>
                        <Card.Body>
                            <Stack direction="column" gap="4">
                                {/* Customer */}
                                <Stack direction="column" gap="1">
                                    <Text fontWeight="bold" fontSize="sm">Cliente</Text>
                                    <Text fontSize="sm">
                                        {deliveryInfo.customer?.name || deliveryInfo.customerName}
                                        {isAnonymous && <span style={{ marginLeft: '8px' }}><Badge size="sm">Anónimo</Badge></span>}
                                    </Text>
                                    <Stack direction="row" gap="1" align="center">
                                        <PhoneIcon style={{ width: '14px', height: '14px' }} />
                                        <Text fontSize="sm">{deliveryInfo.customer?.phone || deliveryInfo.phone}</Text>
                                    </Stack>
                                </Stack>

                                {/* Address */}
                                <Stack direction="column" gap="1">
                                    <Text fontWeight="bold" fontSize="sm">Dirección</Text>
                                    <Text fontSize="sm">{getDisplayAddress()}</Text>
                                    {deliveryInfo.notes && (
                                        <Text fontSize="xs" color="fg.muted">Nota: {deliveryInfo.notes}</Text>
                                    )}
                                </Stack>

                                {/* Order */}
                                <Stack direction="column" gap="1">
                                    <Text fontWeight="bold" fontSize="sm">Pedido</Text>
                                    {cart.map((item) => (
                                        <Stack key={item.product_id} direction="row" justify="space-between" fontSize="sm">
                                            <Text>{item.quantity}x {item.name}</Text>
                                            <Text>{formatPrice(item.unit_price * item.quantity)}</Text>
                                        </Stack>
                                    ))}
                                </Stack>

                                {/* Total */}
                                <Box borderTopWidth="1px" pt="3">
                                    <Stack direction="row" justify="space-between" fontWeight="bold" fontSize="lg">
                                        <Text>Total</Text>
                                        <Text color="orange.600">{formatPrice(totals.total)}</Text>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Card.Body>
                    </Card.Root>
                )}
            </Box>

            {/* Footer Navigation */}
            <Stack direction="row" justify="space-between" pt="3" borderTopWidth="1px">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
                    {step === 1 ? 'Volver' : 'Anterior'}
                </Button>
                <Button
                    colorPalette="orange"
                    onClick={handleNext}
                    disabled={!canProceed}
                >
                    {step === 4 ? 'Confirmar Pedido' : 'Siguiente'}
                    {step < 4 && <ArrowRightIcon style={{ width: '16px', height: '16px' }} />}
                </Button>
            </Stack>
        </Stack>
    );
}

export default DeliveryPOSView;
