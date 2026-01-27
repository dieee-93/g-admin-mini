/**
 * ProductTypeSelector - Select product type (Physical, Service, Digital, Rental)
 *
 * This is the FIRST step in the adaptive POS flow.
 * Once a type is selected:
 * - PHYSICAL → Show FulfillmentSelector (Mesa, TakeAway, Delivery)
 * - SERVICE → Show AppointmentPOSView (booking flow)
 * - DIGITAL → Show DigitalCheckoutView (direct checkout)
 * - RENTAL → Show RentalPOSView (period selection)
 *
 * @see POS_COMPONENT_ARCHITECTURE.md
 */

import { Stack, Typography, Text, SimpleGrid, Card, Box } from '@/shared/ui';
import {
    CubeIcon,           // Physical
    CalendarDaysIcon,   // Service
    ComputerDesktopIcon, // Digital
    KeyIcon             // Rental
} from '@heroicons/react/24/outline';

// ============================================
// TYPES
// ============================================

export type ProductType =
    | 'PHYSICAL'    // Physical goods (food, merchandise, etc.)
    | 'SERVICE'     // Services/appointments
    | 'DIGITAL'     // Digital products (codes, downloads, etc.)
    | 'RENTAL';     // Rental items

interface ProductTypeSelectorProps {
    /** Available product types based on active capabilities */
    availableTypes: ProductType[];
    /** Currently selected type */
    selectedType: ProductType | null;
    /** Handler when user selects a type */
    onSelect: (type: ProductType) => void;
}

// ============================================
// CONFIG
// ============================================

const PRODUCT_TYPE_CONFIG: Record<ProductType, {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color: string;
    emoji: string;
}> = {
    PHYSICAL: {
        label: 'Productos',
        description: 'Productos físicos, comida, mercadería',
        icon: CubeIcon,
        color: 'blue',
        emoji: '📦'
    },
    SERVICE: {
        label: 'Servicios',
        description: 'Reservar cita o servicio',
        icon: CalendarDaysIcon,
        color: 'purple',
        emoji: '📅'
    },
    DIGITAL: {
        label: 'Digital',
        description: 'Códigos, descargas, licencias',
        icon: ComputerDesktopIcon,
        color: 'green',
        emoji: '💻'
    },
    RENTAL: {
        label: 'Alquiler',
        description: 'Alquilar equipo o espacio',
        icon: KeyIcon,
        color: 'cyan',
        emoji: '🔑'
    }
};

// ============================================
// COMPONENT
// ============================================

export function ProductTypeSelector({
    availableTypes,
    selectedType,
    onSelect
}: ProductTypeSelectorProps) {
    return (
        <Stack direction="column" gap="6" align="center" py="8">
            <Stack direction="column" align="center" gap="2">
                <Typography variant="heading" size="lg">
                    ¿Qué querés vender?
                </Typography>
                <Text fontSize="sm" color="fg.muted" textAlign="center">
                    Seleccioná el tipo de producto para esta venta
                </Text>
            </Stack>

            <Box maxW="700px" w="full">
                <SimpleGrid columns={{ base: 1, sm: 2, md: 2 }} gap="4">
                    {availableTypes.map((productType) => {
                        const config = PRODUCT_TYPE_CONFIG[productType];
                        const isSelected = selectedType === productType;

                        return (
                            <Card.Root
                                key={productType}
                                variant={isSelected ? 'elevated' : 'outline'}
                                cursor="pointer"
                                onClick={() => onSelect(productType)}
                                borderWidth={isSelected ? '2px' : '1px'}
                                borderColor={isSelected ? `${config.color}.500` : 'border.muted'}
                                bg={isSelected ? `${config.color}.50` : 'bg.panel'}
                                _dark={{
                                    bg: isSelected ? `${config.color}.900` : 'bg.panel',
                                }}
                                _hover={{
                                    borderColor: `${config.color}.400`,
                                    transform: 'translateY(-2px)',
                                    shadow: 'md'
                                }}
                                transition="all 0.2s"
                            >
                                <Card.Body p="5">
                                    <Stack direction="row" align="center" gap="4">
                                        <Box
                                            p="3"
                                            borderRadius="lg"
                                            bg={`${config.color}.100`}
                                            _dark={{ bg: `${config.color}.800` }}
                                        >
                                            <Text fontSize="2xl">{config.emoji}</Text>
                                        </Box>
                                        <Stack direction="column" gap="1">
                                            <Typography variant="heading" size="md">
                                                {config.label}
                                            </Typography>
                                            <Text fontSize="sm" color="fg.muted">
                                                {config.description}
                                            </Text>
                                        </Stack>
                                    </Stack>
                                </Card.Body>
                            </Card.Root>
                        );
                    })}
                </SimpleGrid>
            </Box>
        </Stack>
    );
}

export default ProductTypeSelector;
