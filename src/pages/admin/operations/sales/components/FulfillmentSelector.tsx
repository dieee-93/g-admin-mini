/**
 * FulfillmentSelector - Select fulfillment method for PHYSICAL products
 *
 * This is the SECOND step when ProductType = PHYSICAL.
 * Options: Mesa (onsite), TakeAway (pickup), Delivery
 *
 * After selection, the appropriate view is shown:
 * - onsite → OnsitePOSView
 * - pickup → Default cart (for now)
 * - delivery → DeliveryPOSView (pending)
 *
 * @see POS_COMPONENT_ARCHITECTURE.md
 */

import { Stack, Typography, Text, SimpleGrid, Card, Box, Button } from '@/shared/ui';
import {
    BuildingStorefrontIcon,
    ShoppingBagIcon,
    TruckIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

// ============================================
// TYPES
// ============================================

export type FulfillmentType =
    | 'onsite'    // Mesa/Dine-in
    | 'pickup'    // TakeAway
    | 'delivery'; // Delivery

interface FulfillmentSelectorProps {
    /** Available fulfillment types based on active capabilities */
    availableTypes: FulfillmentType[];
    /** Currently selected fulfillment */
    selectedFulfillment: FulfillmentType | null;
    /** Handler when user selects a fulfillment */
    onSelect: (type: FulfillmentType) => void;
    /** Handler to go back to product type selection */
    onBack: () => void;
}

// ============================================
// CONFIG
// ============================================

const FULFILLMENT_CONFIG: Record<FulfillmentType, {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color: string;
    emoji: string;
}> = {
    onsite: {
        label: 'Mesa',
        description: 'Consumo en local',
        icon: BuildingStorefrontIcon,
        color: 'teal',
        emoji: '🍽️'
    },
    pickup: {
        label: 'TakeAway',
        description: 'Retiro en local',
        icon: ShoppingBagIcon,
        color: 'purple',
        emoji: '🥡'
    },
    delivery: {
        label: 'Delivery',
        description: 'Envío a domicilio',
        icon: TruckIcon,
        color: 'orange',
        emoji: '🚚'
    }
};

// ============================================
// COMPONENT
// ============================================

export function FulfillmentSelector({
    availableTypes,
    selectedFulfillment,
    onSelect,
    onBack
}: FulfillmentSelectorProps) {
    return (
        <Stack direction="column" gap="6" align="center" py="8">
            {/* Back button */}
            <Box alignSelf="flex-start">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
                    Volver
                </Button>
            </Box>

            <Stack direction="column" align="center" gap="2">
                <Typography variant="heading" size="lg">
                    ¿Cómo se entrega?
                </Typography>
                <Text fontSize="sm" color="fg.muted" textAlign="center">
                    Seleccioná el método de entrega para productos físicos
                </Text>
            </Stack>

            <Box maxW="600px" w="full">
                <SimpleGrid columns={{ base: 1, sm: 3 }} gap="4">
                    {availableTypes.map((fulfillmentType) => {
                        const config = FULFILLMENT_CONFIG[fulfillmentType];
                        const isSelected = selectedFulfillment === fulfillmentType;

                        return (
                            <Card.Root
                                key={fulfillmentType}
                                variant={isSelected ? 'elevated' : 'outline'}
                                cursor="pointer"
                                onClick={() => onSelect(fulfillmentType)}
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
                                <Card.Body p="4">
                                    <Stack direction="column" align="center" gap="3">
                                        <Text fontSize="3xl">{config.emoji}</Text>
                                        <Stack direction="column" align="center" gap="1">
                                            <Typography variant="heading" size="md">
                                                {config.label}
                                            </Typography>
                                            <Text fontSize="sm" color="fg.muted" textAlign="center">
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

export default FulfillmentSelector;
