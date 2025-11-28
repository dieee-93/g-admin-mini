import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Text,
  Switch,
  NumberInput,
  Flex
} from '@/shared/ui';
import { CardWrapper } from '@/shared/ui';
import { FormCalculations } from '@/pages/admin/supply-chain/materials/services';
import { type ItemFormData } from '@/pages/admin/supply-chain/materials/types';
interface MeasurableStockFieldsProps {
  formData: ItemFormData;
  updateFormData: (updates: Partial<ItemFormData>) => void;
  fieldErrors: Record<string, string>;
  disabled?: boolean;
  addToStockNow: boolean;
  setAddToStockNow: (value: boolean) => void;
}

export const MeasurableStockFields = ({
  formData,
  updateFormData,
  fieldErrors,
  disabled = false,
  addToStockNow,
  setAddToStockNow
}: MeasurableStockFieldsProps) => {
  // Estado local para el precio total (independiente de unit_cost)
  const [totalPurchasePrice, setTotalPurchasePrice] = useState(0);

  // Sincronizar precio total inicial
  useEffect(() => {
    if (formData.unit_cost && formData.initial_stock) {
      setTotalPurchasePrice(formData.unit_cost * formData.initial_stock);
    }
  }, [formData.unit_cost, formData.initial_stock]);

  // Función para actualizar unit_cost basado en el precio total
  const updateUnitCostFromTotal = (newTotalPrice: number) => {
    if (formData.initial_stock && formData.initial_stock > 0) {
      const newUnitCost = newTotalPrice / formData.initial_stock;
      updateFormData({ unit_cost: newUnitCost });
    }
  };
  return (
    <CardWrapper variant="outline" w="full">
      <CardWrapper.Body>
        <Stack gap="4">
          <Flex justify="space-between" align="center">
            <Stack gap="1">
              <Text fontWeight="semibold">Agregar al inventario ahora</Text>
              <Text fontSize="sm" color="text.muted">
                Si está marcado, se agregará stock inmediatamente al crear el item
              </Text>
            </Stack>
            <Switch
              checked={addToStockNow}
              onChange={(checked) => !disabled && setAddToStockNow(checked)}
              disabled={disabled}
            />
          </Flex>

          {addToStockNow && (
            <Stack gap="4" pt="4" borderTop="1px solid" borderColor="border">
              <Flex gap="6" direction={{ base: "column", md: "row" }}>
                <Box flex="1">
                  <Stack gap="2">
                    <Text fontSize="sm" fontWeight="medium">
                      Cantidad Inicial {formData.unit && `(${formData.unit})`}
                    </Text>
                    <Flex>
                      <NumberInput.Root
                        value={formData.initial_stock?.toString() || '0'}
                        onValueChange={(details) => {
                          const newQuantity = parseFloat(details.value) || 0;
                          updateFormData({ initial_stock: newQuantity });
                          // Solo recalcular unit_cost si hay un precio total establecido
                          if (totalPurchasePrice > 0) {
                            updateUnitCostFromTotal(totalPurchasePrice);
                          }
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
                          height="44px"
                          fontSize="md"
                          px="3"
                          borderRadius="md"
                          borderRightRadius="0"
                        />
                      </NumberInput.Root>
                      {formData.unit && (
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
                          {formData.unit}
                        </Box>
                      )}
                    </Flex>
                    {fieldErrors.initial_stock && (
                      <Text fontSize="sm" color="red.500">
                        {fieldErrors.initial_stock}
                      </Text>
                    )}
                  </Stack>
                </Box>

                <Box flex="1">
                  <Stack gap="2">
                    <Text fontSize="sm" fontWeight="medium">
                      Costo Total del Lote (ARS$)
                    </Text>
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
                        value={totalPurchasePrice.toString()}
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
                    {fieldErrors.unit_cost && (
                      <Text fontSize="sm" color="red.500">
                        {fieldErrors.unit_cost}
                      </Text>
                    )}
                  </Stack>
                </Box>
              </Flex>

              {/* Cálculos y Conversiones */}
              {formData.initial_stock && totalPurchasePrice > 0 && (
                <Box mt="6">
                  <Stack gap="4">
                    {/* Resumen principal */}
                    <StockSummaryCard
                      formData={formData}
                      totalPurchasePrice={totalPurchasePrice}
                    />

                    {/* Estadísticas útiles para peso */}
                    {formData.unit && ['kg', 'g'].includes(formData.unit) && (
                      <WeightStatisticsCard
                        formData={formData}
                        totalPurchasePrice={totalPurchasePrice}
                      />
                    )}

                    {/* Estadísticas útiles para volumen */}
                    {formData.unit && ['l', 'ml'].includes(formData.unit) && (
                      <VolumeStatisticsCard
                        formData={formData}
                        totalPurchasePrice={totalPurchasePrice}
                      />
                    )}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
};

// Componentes auxiliares para las tarjetas de resumen y conversiones
const StockSummaryCard = ({
  formData,
  totalPurchasePrice
}: {
  formData: ItemFormData;
  totalPurchasePrice: number;
}) => {
  const stockQuantity = formData.initial_stock || 0;
  const unitCost = stockQuantity > 0 ? totalPurchasePrice / stockQuantity : 0;

  return (
    <CardWrapper variant="elevated" padding="md">
      <CardWrapper.Body>
        <Stack gap="3">
          <Flex align="center" gap="2">
            <Box
              w="8" h="8"

              rounded="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              💰
            </Box>
            <Text fontSize="md" fontWeight="semibold" color="green.800">
              Resumen de Costos
            </Text>
          </Flex>

          <Flex
            direction={{ base: "column", md: "row" }}
            gap="4"
            justify="space-between"
          >
            <CardWrapper variant="outline" padding="sm">
              <CardWrapper.Body>
                <Text fontSize="xs" color="green.600" fontWeight="medium">
                  COSTO UNITARIO
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="green.800">
                  ${FormCalculations.formatCurrency(unitCost)}
                </Text>
                <Text fontSize="xs" color="green.600">
                  por {formData.unit}
                </Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="outline" padding="sm">
              <CardWrapper.Body>
                <Text fontSize="xs" color="green.600" fontWeight="medium">
                  STOCK INICIAL
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="green.800">
                  {FormCalculations.formatQuantity(stockQuantity)}
                </Text>
                <Text fontSize="xs" color="green.600">
                  {formData.unit}
                </Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="outline" padding="sm">
              <CardWrapper.Body>
                <Text fontSize="xs" color="green.600" fontWeight="medium">
                  INVERSIÓN TOTAL
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="green.800">
                  ${FormCalculations.formatCurrencyDisplay(totalPurchasePrice)}
                </Text>
                <Text fontSize="xs" color="green.600">
                  ARS
                </Text>
              </CardWrapper.Body>
            </CardWrapper>
          </Flex>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
};

const WeightStatisticsCard = ({
  formData,
  totalPurchasePrice
}: {
  formData: ItemFormData;
  totalPurchasePrice: number;
}) => {
  const stockAmount = formData.initial_stock || 0;
  const unit = formData.unit as 'kg' | 'g';
  const unitCost = stockAmount > 0 ? totalPurchasePrice / stockAmount : 0;

  // Calcular estadísticas útiles
  const costPer100g = unit === 'kg' ? unitCost / 10 : unitCost * 10;        // 1kg = 10 × 100g
  const costPer500g = unit === 'kg' ? unitCost / 2 : unitCost * 500;        // 1kg = 2 × 500g  
  const costPer1kg = unit === 'kg' ? unitCost : unitCost * 1000;            // 1kg = 1000g

  return (
    <CardWrapper variant="outline" padding="md">
      <CardWrapper.Body>
        <Stack gap="3">
          <Flex align="center" gap="2">
            <Box
              w="8" h="8"
              bg="blue.100"
              rounded="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              📊
            </Box>
            <Text fontSize="md" fontWeight="semibold" color="blue.800">
              Estadísticas de Precio por Peso
            </Text>
          </Flex>

          <Flex
            direction={{ base: "column", md: "row" }}
            gap="3"
            justify="space-between"
          >
            <CardWrapper variant="subtle" padding="sm">
              <CardWrapper.Body>
                <Text fontSize="xs" color="blue.600" fontWeight="medium" textAlign="center">
                  COSTO POR 100g
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer100g)}
                </Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="subtle" padding="sm">
              <CardWrapper.Body>
                <Text fontSize="xs" color="blue.600" fontWeight="medium" textAlign="center">
                  COSTO POR 500g
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer500g)}
                </Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="subtle" padding="sm">
              <CardWrapper.Body>
                <Text fontSize="xs" color="blue.600" fontWeight="medium" textAlign="center">
                  COSTO POR 1kg
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer1kg)}
                </Text>
              </CardWrapper.Body>
            </CardWrapper>
          </Flex>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
};

const VolumeStatisticsCard = ({
  formData,
  totalPurchasePrice
}: {
  formData: ItemFormData;
  totalPurchasePrice: number;
}) => {
  const stockAmount = formData.initial_stock || 0;
  const unit = formData.unit as 'l' | 'ml';
  const unitCost = stockAmount > 0 ? totalPurchasePrice / stockAmount : 0;

  // Calcular estadísticas útiles
  const costPer100ml = unit === 'l' ? unitCost / 10 : unitCost * 10;        // 1L = 10 × 100ml
  const costPer250ml = unit === 'l' ? unitCost / 4 : unitCost * 250;        // 1L = 4 × 250ml
  const costPer500ml = unit === 'l' ? unitCost / 2 : unitCost * 500;        // 1L = 2 × 500ml
  const costPer1l = unit === 'l' ? unitCost : unitCost * 1000;              // 1L = 1000ml

  return (
    <CardWrapper variant="outline" padding="md">
      <CardWrapper.Body>
        <Stack gap="3">
          <Flex align="center" gap="2">
            <Box
              w="8" h="8"
              bg="purple.100"
              rounded="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              📊
            </Box>
            <Text fontSize="md" fontWeight="semibold" color="purple.800">
              Estadísticas de Precio por Volumen
            </Text>
          </Flex>

          <Flex
            direction={{ base: "column", md: "row" }}
            gap="3"
            justify="space-between"
          >
            <CardWrapper variant="subtle" padding="sm">
              <CardWrapper.Body>
                <Text fontSize="xs" color="purple.600" fontWeight="medium" textAlign="center">
                  COSTO POR 100ml
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="purple.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer100ml)}
                </Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="subtle" padding="sm">
              <CardWrapper.Body>
                <Text fontSize="xs" color="purple.600" fontWeight="medium" textAlign="center">
                  COSTO POR 250ml
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="purple.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer250ml)}
                </Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="subtle" padding="sm">
              <CardWrapper.Body>
                <Text fontSize="xs" color="purple.600" fontWeight="medium" textAlign="center">
                  COSTO POR 500ml
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="purple.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer500ml)}
                </Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="subtle" padding="sm">
              <CardWrapper.Body>
                <Text fontSize="xs" color="purple.600" fontWeight="medium" textAlign="center">
                  COSTO POR 1L
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="purple.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer1l)}
                </Text>
              </CardWrapper.Body>
            </CardWrapper>
          </Flex>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
