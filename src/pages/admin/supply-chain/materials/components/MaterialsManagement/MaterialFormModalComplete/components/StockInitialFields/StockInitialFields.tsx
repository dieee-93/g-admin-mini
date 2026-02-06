import { useState, useEffect } from 'react';
import {
    Box,
    Stack,
    Text,
    NumberInput,
    Flex,
    SimpleGrid,
    CardWrapper
} from '@/shared/ui';
import { DecimalUtils } from '@/lib/decimal';
import { FormCalculations } from '@/modules/materials/services';
import { type ItemFormData } from '@/pages/admin/supply-chain/materials/types';
import {
    CurrencyDollarIcon,
    ScaleIcon,
    BeakerIcon,
    CalculatorIcon
} from '@heroicons/react/24/outline';

interface StockInitialFieldsProps {
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    fieldErrors: Record<string, string>;
    disabled?: boolean;
}

export const StockInitialFields = ({
    formData,
    updateFormData,
    fieldErrors,
    disabled = false,
}: StockInitialFieldsProps) => {
    // Estado local para el precio total (independiente de unit_cost)
    const [totalPurchasePrice, setTotalPurchasePrice] = useState(0);

    // Sincronizar precio total inicial
    useEffect(() => {
        if (formData.unit_cost && formData.initial_stock) {
            const total = DecimalUtils.multiply(
                DecimalUtils.fromValue(formData.unit_cost, 'currency'),
                DecimalUtils.fromValue(formData.initial_stock, 'quantity'),
                'currency'
            );
            setTotalPurchasePrice(total.toNumber());
        }
    }, [formData.unit_cost, formData.initial_stock]);

    // Función para actualizar unit_cost basado en el precio total
    const updateUnitCostFromTotal = (newTotalPrice: number) => {
        if (formData.initial_stock && formData.initial_stock > 0) {
            const newUnitCost = DecimalUtils.divide(
                DecimalUtils.fromValue(newTotalPrice, 'currency'),
                DecimalUtils.fromValue(formData.initial_stock, 'quantity'),
                'currency'
            );
            updateFormData({ unit_cost: newUnitCost.toNumber() });
        }
    };

    const hasCalculations = (formData.initial_stock || 0) > 0 && totalPurchasePrice > 0;

    return (
        <Stack gap="6">
            {/* Inputs Section - Clean & Modern */}
            <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
                    {/* Cantidad Inicial */}
                    <Box>
                        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb="2">
                            Cantidad Inicial {formData.unit && <Text as="span" color="gray.500" fontWeight="normal">({formData.unit})</Text>}
                        </Text>
                        <Flex>
                            <NumberInput.Root
                                value={formData.initial_stock?.toString() || ''}
                                onValueChange={(details) => {
                                    const newQuantity = parseFloat(details.value) || 0;
                                    updateFormData({ initial_stock: newQuantity });
                                    // Total price updates via useEffect
                                }}
                                min={0}
                                inputMode='decimal'
                                disabled={disabled}
                                width="full"
                            >
                                <NumberInput.Control>
                                    <NumberInput.IncrementTrigger />
                                    <NumberInput.DecrementTrigger />
                                </NumberInput.Control>
                                <NumberInput.Input
                                    height="48px"
                                    fontSize="lg"
                                    px="4"
                                    borderRadius="lg"
                                    borderRightRadius="0"
                                    placeholder="0"
                                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                                    data-testid="measurable-quantity-input"
                                />
                            </NumberInput.Root>
                            {formData.unit && (
                                <Box
                                    height="48px"
                                    px="4"
                                    bg="gray.50"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderLeft="0"
                                    borderRightRadius="lg"
                                    display="flex"
                                    alignItems="center"
                                    fontSize="md"
                                    color="gray.500"
                                    fontWeight="medium"
                                >
                                    {formData.unit}
                                </Box>
                            )}
                        </Flex>
                        {fieldErrors.initial_stock && (
                            <Text fontSize="sm" color="red.500" mt="1.5">
                                {fieldErrors.initial_stock}
                            </Text>
                        )}
                    </Box>

                    {/* Costo Total del Lote */}
                    <Box>
                        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb="2">
                            Costo Total del Lote
                        </Text>
                        <Flex>
                            <Box
                                height="48px"
                                px="4"
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRight="0"
                                borderLeftRadius="lg"
                                display="flex"
                                alignItems="center"
                                fontSize="md"
                                color="gray.500"
                                fontWeight="medium"
                            >
                                $
                            </Box>
                            <NumberInput.Root
                                value={totalPurchasePrice > 0 ? totalPurchasePrice.toString() : ''}
                                onValueChange={(details) => {
                                    const newTotalPrice = parseFloat(details.value) || 0;
                                    setTotalPurchasePrice(newTotalPrice);
                                    updateUnitCostFromTotal(newTotalPrice);
                                }}
                                min={0}
                                inputMode='decimal'
                                disabled={disabled}
                                width="full"
                            >
                                <NumberInput.Control>
                                    <NumberInput.IncrementTrigger />
                                    <NumberInput.DecrementTrigger />
                                </NumberInput.Control>
                                <NumberInput.Input
                                    height="48px"
                                    fontSize="lg"
                                    px="4"
                                    borderRadius="0"
                                    placeholder="0.00"
                                    _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px var(--chakra-colors-green-500)" }}
                                    data-testid="measurable-cost-input"
                                />
                            </NumberInput.Root>
                            <Box
                                height="48px"
                                px="4"
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                borderLeft="0"
                                borderRightRadius="lg"
                                display="flex"
                                alignItems="center"
                                fontSize="md"
                                color="gray.500"
                                fontWeight="medium"
                            >
                                ARS
                            </Box>
                        </Flex>
                        {fieldErrors.unit_cost && (
                            <Text fontSize="sm" color="red.500" mt="1.5">
                                {fieldErrors.unit_cost}
                            </Text>
                        )}
                    </Box>
                </SimpleGrid>
            </Box>

            {/* Unified Dashboard Card */}
            {hasCalculations && (
                <Box
                    bg="white"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.200"
                    overflow="hidden"
                    boxShadow="sm"
                >
                    {/* Header */}
                    <Box bg="gray.50" px="5" py="3" borderBottom="1px solid" borderColor="gray.200">
                        <Flex align="center" gap="2">
                            <CalculatorIcon style={{ width: '18px', height: '18px', color: 'var(--chakra-colors-gray-500)' }} />
                            <Text fontSize="sm" fontWeight="600" color="gray.700" textTransform="uppercase" letterSpacing="wide">
                                Análisis de Costos
                            </Text>
                        </Flex>
                    </Box>

                    <Box p="5">
                        <Stack gap="6">
                            {/* Primary Stats Row */}
                            <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
                                {/* Unit Cost - Hero Metric */}
                                <Box>
                                    <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="wider" mb="1">
                                        Costo Unitario
                                    </Text>
                                    <Flex align="baseline" gap="1">
                                        <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                                            ${FormCalculations.formatCurrency(formData.unit_cost || 0)}
                                        </Text>
                                        <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                            / {formData.unit}
                                        </Text>
                                    </Flex>
                                </Box>

                                {/* Total Investment - Highlighted */}
                                <Box>
                                    <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase" letterSpacing="wider" mb="1">
                                        Inversión Total
                                    </Text>
                                    <Flex align="baseline" gap="1">
                                        <Text fontSize="2xl" fontWeight="bold" color="green.700">
                                            ${FormCalculations.formatCurrencyDisplay(totalPurchasePrice)}
                                        </Text>
                                        <Text fontSize="sm" color="green.600" fontWeight="medium">
                                            ARS
                                        </Text>
                                    </Flex>
                                </Box>

                                {/* Stock Level */}
                                <Box>
                                    <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase" letterSpacing="wider" mb="1">
                                        Stock Resultante
                                    </Text>
                                    <Flex align="baseline" gap="1">
                                        <Text fontSize="2xl" fontWeight="bold" color="blue.700">
                                            {FormCalculations.formatQuantity(formData.initial_stock || 0)}
                                        </Text>
                                        <Text fontSize="sm" color="blue.600" fontWeight="medium">
                                            {formData.unit}
                                        </Text>
                                    </Flex>
                                </Box>
                            </SimpleGrid>

                            {/* Divider */}
                            <Box height="1px" bg="gray.100" />

                            {/* Secondary Stats (Breakdown) */}
                            {formData.unit && (['kg', 'g', 'l', 'ml'].includes(formData.unit)) && (
                                <Box>
                                    <Flex align="center" gap="2" mb="4">
                                        {['kg', 'g'].includes(formData.unit) ? (
                                            <ScaleIcon style={{ width: '16px', height: '16px', color: 'var(--chakra-colors-gray-400)' }} />
                                        ) : (
                                            <BeakerIcon style={{ width: '16px', height: '16px', color: 'var(--chakra-colors-gray-400)' }} />
                                        )}
                                        <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                                            Desglose por {['kg', 'g'].includes(formData.unit) ? 'Peso' : 'Volumen'}
                                        </Text>
                                    </Flex>

                                    <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
                                        <BreakdownStat
                                            label={['kg', 'g'].includes(formData.unit) ? '100g' : '100ml'}
                                            value={calculateBreakdownCost(formData.unit_cost || 0, formData.unit, 100)}
                                        />
                                        <BreakdownStat
                                            label={['kg', 'g'].includes(formData.unit) ? '250g' : '250ml'}
                                            value={calculateBreakdownCost(formData.unit_cost || 0, formData.unit, 250)}
                                        />
                                        <BreakdownStat
                                            label={['kg', 'g'].includes(formData.unit) ? '500g' : '500ml'}
                                            value={calculateBreakdownCost(formData.unit_cost || 0, formData.unit, 500)}
                                        />
                                        <BreakdownStat
                                            label={['kg', 'g'].includes(formData.unit) ? '1kg' : '1L'}
                                            value={calculateBreakdownCost(formData.unit_cost || 0, formData.unit, 1000)}
                                            isHighlight
                                        />
                                    </SimpleGrid>
                                </Box>
                            )}
                        </Stack>
                    </Box>
                </Box>
            )}
        </Stack>
    );
};

// Helper for breakdown stats
const BreakdownStat = ({ label, value, isHighlight = false }: { label: string, value: number, isHighlight?: boolean }) => (
    <Box
        bg={isHighlight ? 'blue.50' : 'gray.50'}
        p="3"
        borderRadius="lg"
        border="1px solid"
        borderColor={isHighlight ? 'blue.100' : 'transparent'}
    >
        <Text fontSize="xs" color={isHighlight ? 'blue.600' : 'gray.500'} fontWeight="600" mb="1">
            {label}
        </Text>
        <Text fontSize="md" fontWeight="bold" color={isHighlight ? 'blue.700' : 'gray.700'}>
            ${FormCalculations.formatCurrency(value)}
        </Text>
    </Box>
);

// Helper calculation function with DecimalUtils for financial precision
const calculateBreakdownCost = (unitCost: number, unit: string, targetAmount: number): number => {
    // Base unit normalization to "per 1 unit" (1kg or 1L)
    let costPerBaseUnit = DecimalUtils.fromValue(unitCost, 'currency');

    if (unit === 'g' || unit === 'ml') {
        // Cost per 1000g/ml (1kg/1L)
        costPerBaseUnit = DecimalUtils.multiply(
            costPerBaseUnit,
            DecimalUtils.fromValue(1000, 'quantity'),
            'currency'
        );
    }

    // Target amount is in g/ml (100, 250, 500, 1000)
    // So we need cost per 1g/ml first
    const costPerGramOrMl = DecimalUtils.divide(
        costPerBaseUnit,
        DecimalUtils.fromValue(1000, 'quantity'),
        'currency'
    );

    const finalCost = DecimalUtils.multiply(
        costPerGramOrMl,
        DecimalUtils.fromValue(targetAmount, 'quantity'),
        'currency'
    );

    return finalCost.toNumber();
};
