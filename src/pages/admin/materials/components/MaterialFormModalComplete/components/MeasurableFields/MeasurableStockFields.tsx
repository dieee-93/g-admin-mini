import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Text,
  Switch,
  Card as ChakraCard,
  Field,
  NumberInput,
  Flex
} from '@chakra-ui/react';
import { Card } from '@/shared/ui';
import { FormCalculations } from '../../../../utils';
import { type ItemFormData } from '../../../../types';

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

  // Sincronizar precio total inicial solo una vez
  useEffect(() => {
    if (formData.unit_cost && formData.initial_stock) {
      setTotalPurchasePrice(formData.unit_cost * formData.initial_stock);
    }
  }, []);

  // Función para actualizar unit_cost basado en el precio total
  const updateUnitCostFromTotal = (newTotalPrice: number) => {
    if (formData.initial_stock && formData.initial_stock > 0) {
      const newUnitCost = newTotalPrice / formData.initial_stock;
      updateFormData({ unit_cost: newUnitCost });
    }
  };
  return (
    <ChakraCard.Root variant="outline" w="full">
      <ChakraCard.Body>
        <Stack gap="4">
          <Flex justify="space-between" align="center">
            <Stack gap="1">
              <Text fontWeight="semibold">Agregar al inventario ahora</Text>
              <Text fontSize="sm" color="fg.muted">
                Si está marcado, se agregará stock inmediatamente al crear el item
              </Text>
            </Stack>
            <Switch.Root
              checked={addToStockNow}
              onCheckedChange={(details) => !disabled && setAddToStockNow(details.checked)}
              disabled={disabled}
            >
              <Switch.HiddenInput />
              <Switch.Control />
            </Switch.Root>
          </Flex>

          {addToStockNow && (
            <Stack gap="4" pt="4" borderTop="1px solid" borderColor="border">
              <Flex gap="6" direction={{ base: "column", md: "row" }}>
                <Box flex="1">
                  <Field.Root invalid={!!fieldErrors.initial_stock}>
                    <Field.Label fontSize="sm" fontWeight="medium" mb="2">
                      Cantidad Inicial {formData.unit && `(${formData.unit})`}
                    </Field.Label>
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
                          bg="gray.50"
                          border="1px solid"
                          borderColor="border"
                          borderLeft="0"
                          borderRightRadius="md"
                          display="flex"
                          alignItems="center"
                          fontSize="sm"
                          color="fg.muted"
                          fontWeight="medium"
                        >
                          {formData.unit}
                        </Box>
                      )}
                    </Flex>
                    <Field.ErrorText>{fieldErrors.initial_stock}</Field.ErrorText>
                  </Field.Root>
                </Box>

                <Box flex="1">
                  <Field.Root invalid={!!fieldErrors.unit_cost}>
                    <Field.Label fontSize="sm" fontWeight="medium" mb="2">
                      Costo Total del Lote (ARS$)
                    </Field.Label>
                    <Flex>
                      <Box 
                        height="44px"
                        px="3"
                        bg="gray.50"
                        border="1px solid"
                        borderColor="border"
                        borderRight="0"
                        borderLeftRadius="md"
                        display="flex"
                        alignItems="center"
                        fontSize="sm"
                        color="fg.muted"
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
                        bg="gray.50"
                        border="1px solid"
                        borderColor="border"
                        borderLeft="0"
                        borderRightRadius="md"
                        display="flex"
                        alignItems="center"
                        fontSize="sm"
                        color="fg.muted"
                        fontWeight="medium"
                      >
                        ARS
                      </Box>
                    </Flex>
                    <Field.ErrorText>{fieldErrors.unit_cost}</Field.ErrorText>
                  </Field.Root>
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
      </ChakraCard.Body>
    </ChakraCard.Root>
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
    <Card variant="elevated" padding="md">
      <Card.Body>
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
            <Card variant="outline" padding="sm">
              <Card.Body>
                <Text fontSize="xs" color="green.600" fontWeight="medium">
                  COSTO UNITARIO
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="green.800">
                  ${FormCalculations.formatCurrency(unitCost)}
                </Text>
                <Text fontSize="xs" color="green.600">
                  por {formData.unit}
                </Text>
              </Card.Body>
            </CardWrapper>
            
            <Card variant="outline" padding="sm">
              <Card.Body>
                <Text fontSize="xs" color="green.600" fontWeight="medium">
                  STOCK INICIAL
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="green.800">
                  {FormCalculations.formatQuantity(stockQuantity)}
                </Text>
                <Text fontSize="xs" color="green.600">
                  {formData.unit}
                </Text>
              </Card.Body>
            </CardWrapper>
            
            <Card variant="outline" padding="sm">
              <Card.Body>
                <Text fontSize="xs" color="green.600" fontWeight="medium">
                  INVERSIÓN TOTAL
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="green.800">
                  ${FormCalculations.formatCurrencyDisplay(totalPurchasePrice)}
                </Text>
                <Text fontSize="xs" color="green.600">
                  ARS
                </Text>
              </Card.Body>
            </CardWrapper>
          </Flex>
        </Stack>
      </Card.Body>
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
    <Card variant="outline" padding="md">
      <Card.Body>
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
            <Card variant="subtle" padding="sm">
              <Card.Body>
                <Text fontSize="xs" color="blue.600" fontWeight="medium" textAlign="center">
                  COSTO POR 100g
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer100g)}
                </Text>
              </Card.Body>
            </CardWrapper>
            
            <Card variant="subtle" padding="sm">
              <Card.Body>
                <Text fontSize="xs" color="blue.600" fontWeight="medium" textAlign="center">
                  COSTO POR 500g
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer500g)}
                </Text>
              </Card.Body>
            </CardWrapper>
            
            <Card variant="subtle" padding="sm">
              <Card.Body>
                <Text fontSize="xs" color="blue.600" fontWeight="medium" textAlign="center">
                  COSTO POR 1kg
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer1kg)}
                </Text>
              </Card.Body>
            </CardWrapper>
          </Flex>
        </Stack>
      </Card.Body>
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
    <Card variant="outline" padding="md">
      <Card.Body>
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
            <Card variant="subtle" padding="sm">
              <Card.Body>
                <Text fontSize="xs" color="purple.600" fontWeight="medium" textAlign="center">
                  COSTO POR 100ml
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="purple.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer100ml)}
                </Text>
              </Card.Body>
            </CardWrapper>
            
            <Card variant="subtle" padding="sm">
              <Card.Body>
                <Text fontSize="xs" color="purple.600" fontWeight="medium" textAlign="center">
                  COSTO POR 250ml
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="purple.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer250ml)}
                </Text>
              </Card.Body>
            </CardWrapper>
            
            <Card variant="subtle" padding="sm">
              <Card.Body>
                <Text fontSize="xs" color="purple.600" fontWeight="medium" textAlign="center">
                  COSTO POR 500ml
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="purple.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer500ml)}
                </Text>
              </Card.Body>
            </CardWrapper>
            
            <Card variant="subtle" padding="sm">
              <Card.Body>
                <Text fontSize="xs" color="purple.600" fontWeight="medium" textAlign="center">
                  COSTO POR 1L
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="purple.800" textAlign="center">
                  ${FormCalculations.formatCurrency(costPer1l)}
                </Text>
              </Card.Body>
            </CardWrapper>
          </Flex>
        </Stack>
      </Card.Body>
    </CardWrapper>
  );
};
