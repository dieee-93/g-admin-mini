import { useState, useEffect } from 'react';
import {
    Box,
    Stack,
    Alert,
    Text,
    RadioGroup,
    RadioItem,
    SimpleGrid
} from '@/shared/ui';
import { Flex, NumberInput, InputField } from '@/shared/ui';
import { DecimalUtils } from '@/lib/decimal';
import { FormCalculations } from '@/modules/materials/services';
import { type ItemFormData } from '@/pages/admin/supply-chain/materials/types';
import {
    InformationCircleIcon,
    CurrencyDollarIcon,
    CubeIcon
} from '@heroicons/react/24/outline';

interface CountableStockFieldsProps {
    formData: ItemFormData;
    setFormData: (data: ItemFormData) => void;
    errors: Record<string, string>;
    disabled?: boolean;
    usePackaging: boolean;
    packageQuantity: number;
    setPackageQuantity: (qty: number) => void;
}

type StockConfigType = 'none' | 'individual' | 'packages';

export const CountableStockFields = ({
    formData,
    setFormData,
    errors,
    disabled = false,
    packageQuantity,
    setPackageQuantity
}: CountableStockFieldsProps) => {
    const [stockConfigType, setStockConfigType] = useState<StockConfigType>('individual');

    return (
        <Stack gap="4">
            {/* RadioButtons para seleccionar tipo de stock */}
            <Box>
                <Text fontWeight="semibold" mb="3">Configuración de Stock</Text>
                <RadioGroup
                    value={stockConfigType}
                    onValueChange={(value) => setStockConfigType(value as StockConfigType)}
                    disabled={disabled}
                    colorPalette="blue"
                >
                    <Stack gap="3">
                        <RadioItem value="individual">
                            <Stack gap="1">
                                <Text fontWeight="medium">Agregar por unidades individuales</Text>
                                <Text fontSize="sm" color="text.muted">
                                    Ideal para items sueltos o cuando no vienen empaquetados
                                </Text>
                            </Stack>
                        </RadioItem>

                        <RadioItem value="packages">
                            <Stack gap="1">
                                <Text fontWeight="medium">Agregar por paquetes/cajas</Text>
                                <Text fontSize="sm" color="text.muted">
                                    Para items que vienen empaquetados (cajas, bandejas, docenas, etc.)
                                </Text>
                            </Stack>
                        </RadioItem>
                    </Stack>
                </RadioGroup>
            </Box>

            {/* Configuración de packaging - Solo cuando se selecciona packages */}
            {
                stockConfigType === 'packages' && (
                    <Stack gap="4" pt="4" borderTop="1px solid" borderColor="border">
                        <Text fontWeight="medium" color="blue.700">
                            📦 Configuración de Packaging
                        </Text>

                        <Flex gap="4" direction={{ base: "column", md: "row" }}>
                            <Box flex="1">
                                <Stack gap="2">
                                    <Text fontSize="sm" fontWeight="medium">Unidades por paquete</Text>
                                    <NumberInput.Root
                                        value={formData.packaging?.package_size?.toString() || ''}
                                        onValueChange={(details) =>
                                            !disabled && setFormData({
                                                ...formData,
                                                packaging: {
                                                    ...formData.packaging,
                                                    package_size: parseInt(details.value) || 0,
                                                    package_unit: formData.packaging?.package_unit || '',
                                                    display_mode: 'individual'
                                                }
                                            })
                                        }
                                        min={1}
                                        disabled={disabled}
                                    >
                                        <NumberInput.Control>
                                            <NumberInput.IncrementTrigger />
                                            <NumberInput.DecrementTrigger />
                                        </NumberInput.Control>
                                        <NumberInput.Input
                                            placeholder="ej: 30"
                                            height="44px"
                                            fontSize="md"
                                            px="3"
                                            borderRadius="md"
                                        />
                                    </NumberInput.Root>
                                </Stack>
                            </Box>

                            <Box flex="1">
                                <Stack gap="2">
                                    <Text fontSize="sm" fontWeight="medium">Tipo de paquete</Text>
                                    <InputField
                                        placeholder="ej: bandeja, caja, docena"
                                        value={formData.packaging?.package_unit || ''}
                                        onChange={(e) =>
                                            !disabled && setFormData({
                                                ...formData,
                                                packaging: {
                                                    ...formData.packaging,
                                                    package_size: formData.packaging?.package_size || 0,
                                                    package_unit: e.target.value,
                                                    display_mode: 'individual'
                                                }
                                            })
                                        }
                                        disabled={disabled}
                                        height="44px"
                                        fontSize="md"
                                        px="3"
                                        borderRadius="md"
                                    />
                                </Stack>
                            </Box>
                        </Flex>

                        {(formData.packaging?.package_size || 0) > 0 && formData.packaging?.package_unit && (
                            <Alert.Root status="success" variant="subtle">
                                <Alert.Indicator>
                                    <InformationCircleIcon style={{ width: '16px', height: '16px' }} />
                                </Alert.Indicator>
                                <Alert.Description>
                                    <Text fontSize="sm">
                                        <strong>Configuración:</strong> {formData.packaging.package_size} unidades por {formData.packaging.package_unit}
                                        <br />
                                        <strong>Ejemplo:</strong> Si tienes 3 {formData.packaging.package_unit}s = {DecimalUtils.multiply(
                                            DecimalUtils.fromValue(3, 'quantity'),
                                            DecimalUtils.fromValue(formData.packaging.package_size, 'quantity'),
                                            'quantity'
                                        ).toNumber()} unidades
                                    </Text>
                                </Alert.Description>
                            </Alert.Root>
                        )}
                    </Stack>
                )
            }

            {/* Campos de stock - Solo cuando se selecciona individual o packages */}
            {
                stockConfigType !== 'none' && (
                    <Stack gap="4" pt="4" borderTop="1px solid" borderColor="border">
                        {stockConfigType === 'packages' && formData.packaging?.package_size ? (
                            // Modo CON PACKAGING
                            <Stack gap="4">
                                <Alert.Root status="info" variant="subtle">
                                    <Alert.Description>
                                        <Text fontSize="sm">
                                            📦 <strong>Modo paquetes:</strong> Ingresa cuántos {formData.packaging.package_unit}s compraste y el precio total de tu compra.
                                        </Text>
                                    </Alert.Description>
                                </Alert.Root>

                                <Flex gap="4" direction={{ base: "column", md: "row" }}>
                                    <Box flex="1">
                                        <Stack gap="2">
                                            <Text fontSize="sm" fontWeight="medium">Cantidad de {formData.packaging.package_unit}s comprados</Text>
                                            <Flex>
                                                <NumberInput.Root
                                                    value={packageQuantity?.toString() || '1'}
                                                    onValueChange={(details) => {
                                                        const qty = parseInt(details.value) || 1;
                                                        setPackageQuantity(qty);
                                                        const totalUnits = DecimalUtils.multiply(
                                                            DecimalUtils.fromValue(qty, 'quantity'),
                                                            DecimalUtils.fromValue(formData.packaging?.package_size || 0, 'quantity'),
                                                            'quantity'
                                                        ).toNumber();
                                                        setFormData({ ...formData, initial_stock: totalUnits });
                                                    }}
                                                    min={1}
                                                    disabled={disabled}
                                                    width="full"
                                                >
                                                    <NumberInput.Control>
                                                        <NumberInput.IncrementTrigger />
                                                        <NumberInput.DecrementTrigger />
                                                    </NumberInput.Control>
                                                    <NumberInput.Input
                                                        height="44px"
                                                        fontSize="md"
                                                        px="3"
                                                        borderRadius="md"
                                                        borderRightRadius="0"
                                                    />
                                                </NumberInput.Root>
                                                <Box
                                                    height="44px"
                                                    px="3"
                                                    bg="bg.canvas"
                                                    border="1px solid"
                                                    borderColor="border"
                                                    borderLeft="0"
                                                    borderRightRadius="md"
                                                    display="flex"
                                                    alignItems="center"
                                                    fontSize="sm"
                                                    color="text.muted"
                                                    fontWeight="medium"
                                                >
                                                    {formData.packaging.package_unit}s
                                                </Box>
                                            </Flex>
                                            <Text fontSize="xs" color="text.muted" mt="1">
                                                = {DecimalUtils.multiply(
                                                    DecimalUtils.fromValue(packageQuantity, 'quantity'),
                                                    DecimalUtils.fromValue(formData.packaging?.package_size || 0, 'quantity'),
                                                    'quantity'
                                                ).toNumber().toLocaleString()} unidades totales
                                            </Text>
                                        </Stack>
                                    </Box>

                                    <Box flex="1">
                                        <Stack gap="2">
                                            <Text fontSize="sm" fontWeight="medium">Precio total de tu compra (ARS)</Text>
                                            <Flex>
                                                <Box
                                                    height="44px"
                                                    px="3"
                                                    bg="bg.canvas"
                                                    border="1px solid"
                                                    borderColor="border"
                                                    borderRight="0"
                                                    borderLeftRadius="md"
                                                    display="flex"
                                                    alignItems="center"
                                                    fontSize="sm"
                                                    color="text.muted"
                                                    fontWeight="medium"
                                                >
                                                    $
                                                </Box>
                                                <NumberInput.Root
                                                    value={formData.unit_cost?.toString() || '0'}
                                                    onValueChange={(details) => {
                                                        const totalCost = parseFloat(details.value) || 0;
                                                        setFormData({ ...formData, unit_cost: totalCost });
                                                    }}
                                                    min={0}
                                                    inputMode="decimal"
                                                    disabled={disabled}
                                                    width="full"
                                                >
                                                    <NumberInput.Control>
                                                        <NumberInput.IncrementTrigger />
                                                        <NumberInput.DecrementTrigger />
                                                    </NumberInput.Control>
                                                    <NumberInput.Input
                                                        height="44px"
                                                        fontSize="md"
                                                        px="3"
                                                        borderRadius="0"
                                                    />
                                                </NumberInput.Root>
                                                <Box
                                                    height="44px"
                                                    px="3"
                                                    bg="bg.canvas"
                                                    border="1px solid"
                                                    borderColor="border"
                                                    borderLeft="0"
                                                    borderRightRadius="md"
                                                    display="flex"
                                                    alignItems="center"
                                                    fontSize="sm"
                                                    color="text.muted"
                                                    fontWeight="medium"
                                                >
                                                    ARS
                                                </Box>
                                            </Flex>
                                            <Text fontSize="xs" color="text.muted" mt="1">
                                                ≈ ${FormCalculations.formatCurrency(
                                                    DecimalUtils.divide(
                                                        DecimalUtils.fromValue(formData.unit_cost || 0, 'currency'),
                                                        DecimalUtils.fromValue(packageQuantity, 'quantity'),
                                                        'currency'
                                                    ).toNumber()
                                                )} por {formData.packaging.package_unit}
                                            </Text>
                                            {errors.unit_cost && (
                                                <Text fontSize="sm" color="red.500">
                                                    {errors.unit_cost}
                                                </Text>
                                            )}
                                        </Stack>
                                    </Box>
                                </Flex>
                            </Stack>
                        ) : (
                            // Modo SIN PACKAGING
                            <Stack gap="4">
                                <Alert.Root status="info" variant="subtle">
                                    <Alert.Description>
                                        <Text fontSize="sm">
                                            🔢 <strong>Modo individual:</strong> Ingresa la cantidad de unidades que compraste y el precio total de tu compra.
                                        </Text>
                                    </Alert.Description>
                                </Alert.Root>

                                <Flex gap="4" direction={{ base: "column", md: "row" }}>
                                    <Box flex="1">
                                        <Stack gap="2">
                                            <Text fontSize="sm" fontWeight="medium">Cantidad de unidades compradas</Text>
                                            <Flex>
                                                <NumberInput.Root
                                                    value={formData.initial_stock?.toString() || '0'}
                                                    onValueChange={(details) => {
                                                        const units = parseInt(details.value) || 0;
                                                        setFormData({ ...formData, initial_stock: units });
                                                    }}
                                                    min={0}
                                                    disabled={disabled}
                                                    width="full"
                                                >
                                                    <NumberInput.Control>
                                                        <NumberInput.IncrementTrigger />
                                                        <NumberInput.DecrementTrigger />
                                                    </NumberInput.Control>
                                                    <NumberInput.Input
                                                        height="44px"
                                                        fontSize="md"
                                                        px="3"
                                                        borderRadius="md"
                                                        borderRightRadius="0"
                                                    />
                                                </NumberInput.Root>
                                                <Box
                                                    height="44px"
                                                    px="3"
                                                    bg="gray.100"
                                                    border="1px solid"
                                                    borderColor="border"
                                                    borderLeft="0"
                                                    borderRightRadius="md"
                                                    display="flex"
                                                    alignItems="center"
                                                    fontSize="sm"
                                                    color="text.muted"
                                                    fontWeight="medium"
                                                >
                                                    unidades
                                                </Box>
                                            </Flex>
                                            {errors.initial_stock && (
                                                <Text fontSize="sm" color="red.500">
                                                    {errors.initial_stock}
                                                </Text>
                                            )}
                                        </Stack>
                                    </Box>

                                    <Box flex="1">
                                        <Stack gap="2">
                                            <Text fontSize="sm" fontWeight="medium">Precio total de tu compra (ARS)</Text>
                                            <Flex>
                                                <Box
                                                    height="44px"
                                                    px="3"
                                                    bg="gray.100"
                                                    border="1px solid"
                                                    borderColor="border"
                                                    borderRight="0"
                                                    borderLeftRadius="md"
                                                    display="flex"
                                                    alignItems="center"
                                                    fontSize="sm"
                                                    color="text.muted"
                                                    fontWeight="medium"
                                                >
                                                    $
                                                </Box>
                                                <NumberInput.Root
                                                    value={formData.unit_cost?.toString() || '0'}
                                                    onValueChange={(details) => {
                                                        const totalCost = parseFloat(details.value) || 0;
                                                        setFormData({ ...formData, unit_cost: totalCost });
                                                    }}
                                                    min={0}
                                                    inputMode="decimal"
                                                    disabled={disabled}
                                                    width="full"
                                                >
                                                    <NumberInput.Control>
                                                        <NumberInput.IncrementTrigger />
                                                        <NumberInput.DecrementTrigger />
                                                    </NumberInput.Control>
                                                    <NumberInput.Input
                                                        height="44px"
                                                        fontSize="md"
                                                        px="3"
                                                        borderRadius="0"
                                                    />
                                                </NumberInput.Root>
                                                <Box
                                                    height="44px"
                                                    px="3"
                                                    bg="gray.100"
                                                    border="1px solid"
                                                    borderColor="border"
                                                    borderLeft="0"
                                                    borderRightRadius="md"
                                                    display="flex"
                                                    alignItems="center"
                                                    fontSize="sm"
                                                    color="text.muted"
                                                    fontWeight="medium"
                                                >
                                                    ARS
                                                </Box>
                                            </Flex>
                                            <Text fontSize="xs" color="text.muted" mt="1">
                                                ≈ ${FormCalculations.formatCurrency(
                                                    DecimalUtils.divide(
                                                        DecimalUtils.fromValue(formData.unit_cost || 0, 'currency'),
                                                        DecimalUtils.fromValue(formData.initial_stock || 1, 'quantity'),
                                                        'currency'
                                                    ).toNumber()
                                                )} por unidad
                                            </Text>
                                            {errors.unit_cost && (
                                                <Text fontSize="sm" color="red.500">
                                                    {errors.unit_cost}
                                                </Text>
                                            )}
                                        </Stack>
                                    </Box>
                                </Flex>
                            </Stack>
                        )}

                        {/* Resumen de costos */}
                        {FormCalculations.canCalculateCosts(formData) && (
                            <CostSummaryCard
                                formData={formData}
                                usePackaging={stockConfigType === 'packages' && !!formData.packaging?.package_size}
                            />
                        )}
                    </Stack>
                )
            }
        </Stack >
    );
};

// Componente auxiliar para el resumen de costos
const CostSummaryCard = ({
    formData,
    usePackaging
}: {
    formData: ItemFormData;
    usePackaging: boolean;
}) => {
    const unitCost = FormCalculations.getDisplayUnitCost(formData);
    const totalInvestment = FormCalculations.getTotalInvestment(formData);
    const stockQuantity = formData.initial_stock || 0;

    return (
        <Box mt="4" p="4" bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.300">
            <Stack gap="4">
                <Flex align="center" gap="2">
                    <Box
                        w="8" h="8"
                        rounded="full"
                        bg="green.100"
                        color="green.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <CurrencyDollarIcon style={{ width: '20px', height: '20px' }} />
                    </Box>
                    <Text fontSize="md" fontWeight="semibold" color="gray.900">
                        Resumen de Costos
                    </Text>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
                    <Box p="3" bg="white" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                        <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                            Costo Unitario
                        </Text>
                        <Text fontSize="xl" fontWeight="700" color="gray.900" mt="1">
                            ${FormCalculations.formatCurrency(unitCost)}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt="0.5">
                            por unidad
                        </Text>
                    </Box>

                    <Box p="3" bg="white" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                        <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                            Stock Inicial
                        </Text>
                        <Text fontSize="xl" fontWeight="700" color="gray.900" mt="1">
                            {FormCalculations.formatQuantity(stockQuantity)}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt="0.5">
                            unidades
                        </Text>
                    </Box>

                    <Box p="3" bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
                        <Text fontSize="xs" color="green.700" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                            Inversión Total
                        </Text>
                        <Text fontSize="xl" fontWeight="700" color="green.700" mt="1">
                            ${FormCalculations.formatCurrencyDisplay(totalInvestment)}
                        </Text>
                        <Text fontSize="xs" color="green.600" mt="0.5">
                            ARS
                        </Text>
                    </Box>
                </SimpleGrid>
            </Stack>

            {/* Estadísticas de packaging */}
            {usePackaging && (formData.packaging?.package_size || 0) > 0 && (
                <PackagingStatisticsCard formData={formData} />
            )}
        </Box>
    );
};

// Componente de estadísticas de packaging
const PackagingStatisticsCard = ({
    formData
}: {
    formData: ItemFormData;
}) => {
    const stockQuantity = formData.initial_stock || 0;
    const totalCost = formData.unit_cost || 0;
    const packageSize = formData.packaging?.package_size || 0;
    const packageUnit = formData.packaging?.package_unit || 'paquete';

    // Calcular estadísticas útiles con DecimalUtils para precisión financiera
    const costPerUnit = stockQuantity > 0 
        ? DecimalUtils.divide(
            DecimalUtils.fromValue(totalCost, 'currency'),
            DecimalUtils.fromValue(stockQuantity, 'quantity'),
            'currency'
          ).toNumber()
        : 0;
    
    const costPerPackage = DecimalUtils.multiply(
        DecimalUtils.fromValue(costPerUnit, 'currency'),
        DecimalUtils.fromValue(packageSize, 'quantity'),
        'currency'
    ).toNumber();
    
    const completePackages = DecimalUtils.divide(
        DecimalUtils.fromValue(stockQuantity, 'quantity'),
        DecimalUtils.fromValue(packageSize, 'quantity'),
        'quantity'
    ).floor().toNumber();
    
    const looseUnits = DecimalUtils.fromValue(stockQuantity, 'quantity')
        .modulo(DecimalUtils.fromValue(packageSize, 'quantity'))
        .toNumber();

    // Estadísticas de eficiencia
    const costPer5Units = DecimalUtils.multiply(
        DecimalUtils.fromValue(costPerUnit, 'currency'),
        DecimalUtils.fromValue(5, 'quantity'),
        'currency'
    ).toNumber();
    
    const costPer10Units = DecimalUtils.multiply(
        DecimalUtils.fromValue(costPerUnit, 'currency'),
        DecimalUtils.fromValue(10, 'quantity'),
        'currency'
    ).toNumber();

    return (
        <Box mt="4" p="4" bg="cyan.50" borderRadius="md" borderWidth="1px" borderColor="cyan.200">
            <Stack gap="4">
                <Flex align="center" gap="2">
                    <Box
                        w="8" h="8"
                        bg="cyan.100"
                        color="cyan.700"
                        rounded="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <CubeIcon style={{ width: '20px', height: '20px' }} />
                    </Box>
                    <Text fontSize="md" fontWeight="semibold" color="cyan.900">
                        Estadísticas de Packaging
                    </Text>
                </Flex>

                {/* Resumen del packaging */}
                <Box p="3" bg="white" borderRadius="md" borderWidth="1px" borderColor="cyan.100">
                    <Text fontSize="sm" color="cyan.800" fontWeight="medium" textAlign="center">
                        <strong>{FormCalculations.formatQuantity(stockQuantity)} unidades</strong> =
                        {completePackages > 0 && (
                            <> {completePackages} {packageUnit}{completePackages > 1 ? 's' : ''}</>
                        )}
                        {looseUnits > 0 && (
                            <> + {looseUnits} unidad{looseUnits > 1 ? 'es' : ''} suelta{looseUnits > 1 ? 's' : ''}</>
                        )}
                    </Text>
                </Box>

                {/* Estadísticas de costos por cantidad */}
                <Stack gap="3">
                    <Text fontSize="sm" fontWeight="600" color="cyan.800" textTransform="uppercase" letterSpacing="wide">
                        Costos por Cantidad
                    </Text>
                    <SimpleGrid columns={{ base: 2, md: 4 }} gap="3">
                        <Box p="2" bg="white" borderRadius="md" flex="1" borderWidth="1px" borderColor="cyan.100">
                            <Text fontSize="xs" color="cyan.600" fontWeight="600" textAlign="center" textTransform="uppercase">
                                Por Unidad
                            </Text>
                            <Text fontSize="lg" fontWeight="bold" color="cyan.800" textAlign="center" mt="1">
                                ${FormCalculations.formatCurrency(costPerUnit)}
                            </Text>
                        </Box>

                        <Box p="2" bg="white" borderRadius="md" flex="1" borderWidth="1px" borderColor="cyan.100">
                            <Text fontSize="xs" color="cyan.600" fontWeight="600" textAlign="center" textTransform="uppercase">
                                Por 5 Unid.
                            </Text>
                            <Text fontSize="lg" fontWeight="bold" color="cyan.800" textAlign="center" mt="1">
                                ${FormCalculations.formatCurrency(costPer5Units)}
                            </Text>
                        </Box>

                        <Box p="2" bg="white" borderRadius="md" flex="1" borderWidth="1px" borderColor="cyan.100">
                            <Text fontSize="xs" color="cyan.600" fontWeight="600" textAlign="center" textTransform="uppercase">
                                Por 10 Unid.
                            </Text>
                            <Text fontSize="lg" fontWeight="bold" color="cyan.800" textAlign="center" mt="1">
                                ${FormCalculations.formatCurrency(costPer10Units)}
                            </Text>
                        </Box>

                        <Box p="2" bg="cyan.100" borderRadius="md" flex="1" borderWidth="1px" borderColor="cyan.300">
                            <Text fontSize="xs" color="cyan.800" fontWeight="600" textAlign="center" textTransform="uppercase">
                                Por {packageUnit}
                            </Text>
                            <Text fontSize="lg" fontWeight="bold" color="cyan.900" textAlign="center" mt="1">
                                ${FormCalculations.formatCurrency(costPerPackage)}
                            </Text>
                            <Text fontSize="xs" color="cyan.700" textAlign="center">
                                ({packageSize} u.)
                            </Text>
                        </Box>
                    </SimpleGrid>
                </Stack>
            </Stack>
        </Box>
    );
};
