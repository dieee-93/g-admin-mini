import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Alert,
  Section
} from '@/shared/ui';
import { Field, Flex, NumberInput, Text } from '@chakra-ui/react';
import { FormCalculations } from '@/pages/admin/supply-chain/materials/services';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { type ItemFormData } from '@/pages/admin/supply-chain/materials/types';
interface CountableStockFieldsProps {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  errors: Record<string, string>;
  disabled?: boolean;
  addToStockNow: boolean;
  setAddToStockNow: (value: boolean) => void;
  usePackaging: boolean;
  packageQuantity: number;
  setPackageQuantity: (qty: number) => void;
  unitPrice: number;
  setUnitPrice: (price: number) => void;
}

export const CountableStockFields = ({
  formData,
  setFormData,
  errors,
  disabled = false,
  addToStockNow,
  setAddToStockNow,
  usePackaging,
  packageQuantity,
  setPackageQuantity,
  unitPrice,
  setUnitPrice
}: CountableStockFieldsProps) => {
  return (
    <Section variant="elevated" title="💰 Configuración de Stock y Precios" w="full">
        <Stack gap="4">
          <Text fontSize="sm" color="text.muted">
            {usePackaging ?
              'Ingresa la cantidad de paquetes y el precio total de tu compra' :
              'Ingresa la cantidad de unidades y el precio total de tu compra'
            }
          </Text>
          <Stack gap="4" pt="4" borderTop="1px solid" borderColor="border">
            {usePackaging && formData.packaging?.package_size ? (
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
                    <Field.Root>
                      <Field.Label>Cantidad de {formData.packaging.package_unit}s comprados</Field.Label>
                      <Flex>
                        <NumberInput.Root
                          value={packageQuantity?.toString() || '1'}
                          onValueChange={(details) => {
                            const qty = parseInt(details.value) || 1;
                            setPackageQuantity(qty);
                            const totalUnits = qty * (formData.packaging?.package_size || 0);
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
                        = {(packageQuantity * (formData.packaging?.package_size || 0)).toLocaleString()} unidades totales
                      </Text>
                    </Field.Root>
                  </Box>

                  <Box flex="1">
                    <Field.Root invalid={!!errors.unit_cost}>
                      <Field.Label>Precio total de tu compra (ARS)</Field.Label>
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
                        ≈ ${FormCalculations.formatCurrency((formData.unit_cost || 0) / packageQuantity)} por {formData.packaging.package_unit}
                      </Text>
                      <Field.ErrorText>{errors.unit_cost}</Field.ErrorText>
                    </Field.Root>
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
                    <Field.Root invalid={!!errors.initial_stock}>
                      <Field.Label>Cantidad de unidades compradas</Field.Label>
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
                          unidades
                        </Box>
                      </Flex>
                      <Field.ErrorText>{errors.initial_stock}</Field.ErrorText>
                    </Field.Root>
                  </Box>

                  <Box flex="1">
                    <Field.Root invalid={!!errors.unit_cost}>
                      <Field.Label>Precio total de tu compra (ARS)</Field.Label>
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
                        ≈ ${FormCalculations.formatCurrency((formData.unit_cost || 0) / (formData.initial_stock || 1))} por unidad
                      </Text>
                      <Field.ErrorText>{errors.unit_cost}</Field.ErrorText>
                    </Field.Root>
                  </Box>
                </Flex>
              </Stack>
            )}

            {/* Resumen de costos */}
            {FormCalculations.canCalculateCosts(formData) && (
              <CostSummaryCard formData={formData} usePackaging={usePackaging} />
            )}
          </Stack>
        </Stack>
    </Section>
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
    <Box mt="6">
      <Stack gap="4">
        {/* Resumen principal */}
        <Section variant="elevated">
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
                  Resumen de Costos - Unidades
                </Text>
              </Flex>
              
              <Flex 
                direction={{ base: "column", md: "row" }} 
                gap="4" 
                justify="space-between"
              >
                <Section variant="outline">
                    <Text fontSize="xs" color="green.600" fontWeight="medium">
                      COSTO POR UNIDAD
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.800">
                      ${FormCalculations.formatCurrency(unitCost)}
                    </Text>
                    <Text fontSize="xs" color="green.600">
                      ARS por unidad
                    </Text>
                </Section>
                
                <Section variant="outline">
                    <Text fontSize="xs" color="green.600" fontWeight="medium">
                      STOCK INICIAL
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.800">
                      {FormCalculations.formatQuantity(stockQuantity)}
                    </Text>
                    <Text fontSize="xs" color="green.600">
                      unidades
                    </Text>
                </Section>
                
                <Section variant="outline">
                    <Text fontSize="xs" color="green.600" fontWeight="medium">
                      INVERSIÓN TOTAL
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.800">
                      ${FormCalculations.formatCurrencyDisplay(totalInvestment)}
                    </Text>
                    <Text fontSize="xs" color="green.600">
                      ARS
                    </Text>
                </Section>
              </Flex>
            </Stack>
        </Section>

        {/* Estadísticas de packaging */}
        {usePackaging && formData.packaging?.package_size && (
          <PackagingStatisticsCard 
            formData={formData}
            usePackaging={usePackaging}
          />
        )}
      </Stack>
    </Box>
  );
};

// Componente de estadísticas de packaging
const PackagingStatisticsCard = ({ 
  formData,
  usePackaging 
}: { 
  formData: ItemFormData;
  usePackaging: boolean;
}) => {
  const stockQuantity = formData.initial_stock || 0;
  const totalCost = formData.unit_cost || 0;
  const packageSize = formData.packaging?.package_size || 0;
  const packageUnit = formData.packaging?.package_unit || 'paquete';
  
  // Calcular estadísticas útiles
  const costPerUnit = stockQuantity > 0 ? totalCost / stockQuantity : 0;
  const costPerPackage = costPerUnit * packageSize;
  const completePackages = Math.floor(stockQuantity / packageSize);
  const looseUnits = stockQuantity % packageSize;
  
  // Estadísticas de eficiencia
  const costPer5Units = costPerUnit * 5;
  const costPer10Units = costPerUnit * 10;
  const costPer25Units = costPerUnit * 25;
  
  return (
    <Section variant="outline">
        <Stack gap="4">
          <Flex align="center" gap="2">
            <Box 
              w="8" h="8" 
              bg="cyan.100" 
              rounded="full" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              📊
            </Box>
            <Text fontSize="md" fontWeight="semibold" color="cyan.800">
              Estadísticas de Packaging
            </Text>
          </Flex>
          
          {/* Resumen del packaging */}
          <Section variant="subtle">
              <Text fontSize="sm" color="cyan.700" fontWeight="medium" textAlign="center">
                <strong>{FormCalculations.formatQuantity(stockQuantity)} unidades</strong> =
                {completePackages > 0 && (
                  <> {completePackages} {packageUnit}{completePackages > 1 ? 's' : ''}</>
                )}
                {looseUnits > 0 && (
                  <> + {looseUnits} unidad{looseUnits > 1 ? 'es' : ''} suelta{looseUnits > 1 ? 's' : ''}</>
                )}
              </Text>
          </Section>
          
          {/* Estadísticas de costos por cantidad */}
          <Stack gap="2">
            <Text fontSize="sm" fontWeight="medium" color="cyan.700">
              💰 Costos por Cantidad
            </Text>
            <Flex 
              direction={{ base: "column", md: "row" }} 
              gap="3" 
              justify="space-between"
            >
              <Section variant="subtle">
                  <Text fontSize="xs" color="cyan.600" fontWeight="medium" textAlign="center">
                    COSTO POR UNIDAD
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="cyan.800" textAlign="center">
                    ${FormCalculations.formatCurrency(costPerUnit)}
                  </Text>
              </Section>
              
              <Section variant="subtle">
                  <Text fontSize="xs" color="cyan.600" fontWeight="medium" textAlign="center">
                    COSTO POR 5 UNIDADES
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="cyan.800" textAlign="center">
                    ${FormCalculations.formatCurrency(costPer5Units)}
                  </Text>
              </Section>
              
              <Section variant="subtle">
                  <Text fontSize="xs" color="cyan.600" fontWeight="medium" textAlign="center">
                    COSTO POR 10 UNIDADES
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="cyan.800" textAlign="center">
                    ${FormCalculations.formatCurrency(costPer10Units)}
                  </Text>
              </Section>
              
              <Section variant="subtle">
                  <Text fontSize="xs" color="cyan.600" fontWeight="medium" textAlign="center">
                    COSTO POR {packageUnit.toUpperCase()}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="cyan.800" textAlign="center">
                    ${FormCalculations.formatCurrency(costPerPackage)}
                  </Text>
                  <Text fontSize="xs" color="cyan.600" textAlign="center">
                    ({packageSize} unidades)
                  </Text>
              </Section>
            </Flex>
          </Stack>
        </Stack>
    </Section>
  );
};