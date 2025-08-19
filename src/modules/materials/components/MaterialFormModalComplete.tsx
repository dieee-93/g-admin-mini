import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  HStack,
  Text,
  Input,
  Select,
  createListCollection,
  NumberInput,
  Switch,
  Button,
  Card,
  Badge,
  Alert,
  Dialog,
  Field,
  Container,
  Stack,
  Flex,
  Spinner,
  Progress
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Imports
import { useMaterials } from '@/store/materialsStore';
import { useMaterialValidation } from '@/hooks';
import { RecipeBuilderClean } from '@/shared/components/recipe/RecipeBuilderClean';
import { ValidatedField } from './ValidatedField';
import {
  type ItemFormData,
  type ItemType,
  type AllUnit,
  type MeasurableUnit,
  type MaterialItem,
  isMeasurable,
  isCountable,
  isElaborated
} from '../types';

// ============================================================================
// 📊 COLECCIONES PARA SELECTS
// ============================================================================

const ITEM_TYPE_COLLECTION = createListCollection({
  items: [
    { 
      label: '📏 Conmensurable (peso, volumen)', 
      value: 'MEASURABLE',
      description: 'Items que se miden por peso, volumen o longitud'
    },
    { 
      label: '🔢 Contable (unidades)', 
      value: 'COUNTABLE',
      description: 'Items que se cuentan por unidades, pueden tener packaging'
    },
    { 
      label: '🍳 Elaborado (tiene receta)', 
      value: 'ELABORATED',
      description: 'Items producidos con ingredientes, requieren receta'
    }
  ]
});

const CATEGORY_COLLECTION = createListCollection({
  items: [
    { label: 'Sin categoría', value: 'Sin categoría' },
    { label: '🥛 Lácteos', value: 'Lácteos' },
    { label: '🥩 Carnes', value: 'Carnes' },
    { label: '🥬 Verduras', value: 'Verduras' },
    { label: '🍎 Frutas', value: 'Frutas' },
    { label: '🧂 Condimentos', value: 'Condimentos' },
    { label: '🥤 Bebidas', value: 'Bebidas' },
    { label: '🍞 Panadería', value: 'Panadería' }
  ]
});


// ============================================================================
// 🎯 COMPONENTE SELECTOR DE TIPO
// ============================================================================

function TypeSelector({ 
  value, 
  onChange, 
  errors,
  disabled = false
}: {
  value: ItemType | '';
  onChange: (type: ItemType) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}) {
  return (
    <Box w="full">
      <Field.Root invalid={!!errors.type}>
        <Field.Label>Tipo de Item *</Field.Label>
        <Select.Root
          collection={ITEM_TYPE_COLLECTION}
          value={value ? [value] : []}
          onValueChange={(details) => onChange(details.value[0] as ItemType)}
          disabled={disabled}
        >
          <Select.Trigger
            height="44px"
            fontSize="md"
            px="3"
            borderRadius="md"
          >
            <Select.ValueText placeholder="Selecciona el tipo de item" />
          </Select.Trigger>
          <Select.Content positioning={{ placement: "bottom-start", gutter: 4 }} portalled={true} zIndex={9999}>
            {ITEM_TYPE_COLLECTION.items.map(item => (
              <Select.Item key={item.value} item={item}>
                <Stack gap="1">
                  <Text>{item.label}</Text>
                  <Text fontSize="xs" color="fg.muted">{item.description}</Text>
                </Stack>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Field.ErrorText>{errors.type}</Field.ErrorText>
      </Field.Root>
    </Box>
  );
}

// ============================================================================
// 📏 COMPONENTE MEASURABLE FIELDS
// ============================================================================

function MeasurableFields({ 
  formData, 
  updateFormData, 
  fieldErrors,
  disabled = false,
  addToStockNow,
  setAddToStockNow
}: {
  formData: ItemFormData;
  updateFormData: (updates: Partial<ItemFormData>) => void;
  fieldErrors: Record<string, string>;
  disabled?: boolean;
  addToStockNow: boolean;
  setAddToStockNow: (value: boolean) => void;
}) {
  const getMeasurableUnitsCollection = () => {
    return createListCollection({
      items: [
        // Weight units
        { label: 'Kilogramos (kg)', value: 'kg' },
        { label: 'Gramos (g)', value: 'g' },
        // Volume units  
        { label: 'Litros (L)', value: 'l' },
        { label: 'Mililitros (ml)', value: 'ml' },
        // Length units
        { label: 'Metros (m)', value: 'm' },
        { label: 'Centímetros (cm)', value: 'cm' }
      ]
    });
  };

  return (
    <Stack gap="6" w="full">
      {/* Business Category */}
      <Box w="full">
          <Field.Root invalid={!!fieldErrors.category}>
          <Field.Label>Categoría del Producto *</Field.Label>
          <Select.Root
            collection={CATEGORY_COLLECTION}
            value={formData.category ? [formData.category] : []}
            onValueChange={(details) => 
              updateFormData({ 
                category: details.value[0]
              })
            }
            disabled={disabled}
          >
            <Select.Trigger
              w="full"
              height="44px"
              fontSize="md"
              px="3"
              borderRadius="md"
            >
              <Select.ValueText placeholder="¿A qué categoría pertenece?" />
            </Select.Trigger>
            <Select.Content positioning={{ placement: "bottom-start", gutter: 4 }} portalled={true} zIndex={9999}>
              {CATEGORY_COLLECTION.items.map(item => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Field.ErrorText>{fieldErrors.category}</Field.ErrorText>
        </Field.Root>
      </Box>

      {/* Measurement Unit */}
      <Box w="full">
        <Field.Root invalid={!!fieldErrors.unit}>
          <Field.Label>Unidad de Medición *</Field.Label>
          <Select.Root
            collection={getMeasurableUnitsCollection()}
            value={formData.unit ? [formData.unit] : []}
            onValueChange={(details) => 
              updateFormData({ unit: details.value[0] as MeasurableUnit })
            }
            disabled={disabled}
          >
            <Select.Trigger
              height="44px"
              fontSize="md"
              px="3"
              borderRadius="md"
            >
              <Select.ValueText placeholder="Selecciona la unidad de medición" />
            </Select.Trigger>
            <Select.Content positioning={{ placement: "bottom-start", gutter: 4 }} portalled={true} zIndex={9999}>
              {getMeasurableUnitsCollection().items.map(item => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Field.ErrorText>{fieldErrors.unit}</Field.ErrorText>
          <Text fontSize="xs" color="fg.muted" mt="1">
            La unidad determina cómo se mide este producto (peso, volumen o longitud)
          </Text>
        </Field.Root>
      </Box>

      {/* Stock Section */}
      <Card.Root variant="outline" w="full">
        <Card.Body>
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
                  onCheckedChange={(details: { checked: boolean }) => !disabled && setAddToStockNow(details.checked)}
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
                        {/* allowDecimal is a custom prop from our UI primitives; suppress TS here */}
                        // @ts-ignore: allowDecimal exists on our NumberInput wrapper
                        <NumberInput.Root
                          value={formData.initial_stock?.toString() || '0'}
                          onValueChange={(details) => 
                            updateFormData({ initial_stock: parseFloat(details.value) || 0 })
                          }
                          min={0}
                          allowDecimal={true}
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
                        // @ts-ignore: allowDecimal exists on our NumberInput wrapper
                        <NumberInput.Root
                          value={(formData.unit_cost && formData.initial_stock ? (formData.unit_cost * formData.initial_stock) : 0)?.toString() || '0'}
                          onValueChange={(details) => {
                            const totalCost = parseFloat(details.value) || 0;
                            const unitCost = formData.initial_stock ? totalCost / formData.initial_stock : 0;
                            updateFormData({ unit_cost: unitCost });
                          }}
                          min={0}
                          allowDecimal={true}
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

                {/* Cálculos automáticos - Vista mejorada */}
                {formData.initial_stock && formData.unit_cost && formData.unit && formData.initial_stock > 0 && formData.unit_cost > 0 && (
                  <Box mt="6">
                    <Stack gap="4">
                      {/* Resumen principal con diseño de tarjeta */}
                      <Card.Root variant="elevated" bg="green.50" borderColor="green.200">
                        <Card.Body p="4">
                          <Stack gap="3">
                            <Flex align="center" gap="2">
                              <Box 
                                w="8" h="8" 
                                bg="green.100" 
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
                              <Box 
                                bg="white" 
                                p="3" 
                                rounded="lg" 
                                border="1px solid" 
                                borderColor="green.200"
                                flex="1"
                              >
                                <Text fontSize="xs" color="green.600" fontWeight="medium">
                                  COSTO UNITARIO
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color="green.800">
                                  ${(formData.unit_cost / formData.initial_stock).toFixed(2)}
                                </Text>
                                <Text fontSize="xs" color="green.600">
                                  por {formData.unit}
                                </Text>
                              </Box>
                              
                              <Box 
                                bg="white" 
                                p="3" 
                                rounded="lg" 
                                border="1px solid" 
                                borderColor="green.200"
                                flex="1"
                              >
                                <Text fontSize="xs" color="green.600" fontWeight="medium">
                                  STOCK INICIAL
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color="green.800">
                                  {formData.initial_stock.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" color="green.600">
                                  {formData.unit}
                                </Text>
                              </Box>
                              
                              <Box 
                                bg="white" 
                                p="3" 
                                rounded="lg" 
                                border="1px solid" 
                                borderColor="green.200"
                                flex="1"
                              >
                                <Text fontSize="xs" color="green.600" fontWeight="medium">
                                  INVERSIÓN TOTAL
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color="green.800">
                                  ${formData.unit_cost.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" color="green.600">
                                  ARS
                                </Text>
                              </Box>
                            </Flex>
                          </Stack>
                        </Card.Body>
                      </Card.Root>

                      {/* Conversiones automáticas para peso - Diseño mejorado */}
                      {formData.unit && ['kg', 'g'].includes(formData.unit) && (
                        <Card.Root variant="outline" bg="blue.50" borderColor="blue.200">
                          <Card.Body p="4">
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
                                  ⚖️
                                </Box>
                                <Text fontSize="md" fontWeight="semibold" color="blue.800">
                                  Conversión Automática - Peso
                                </Text>
                              </Flex>
                              
                              <Flex 
                                direction={{ base: "column", md: "row" }} 
                                gap="3" 
                                align="center"
                              >
                                <Box 
                                  bg="white" 
                                  p="3" 
                                  rounded="lg" 
                                  border="1px solid" 
                                  borderColor="blue.200"
                                  textAlign="center"
                                  flex="1"
                                >
                                  <Text fontSize="sm" color="blue.700" fontWeight="medium">
                                    {formData.unit === 'kg' ? (
                                      <>
                                        {formData.initial_stock} kg = <strong>{(formData.initial_stock * 1000).toLocaleString()} g</strong>
                                      </>
                                    ) : (
                                      <>
                                        {formData.initial_stock} g = <strong>{(formData.initial_stock / 1000).toFixed(3)} kg</strong>
                                      </>
                                    )}
                                  </Text>
                                </Box>
                                
                                <Text color="blue.400" fontSize="lg">→</Text>
                                
                                <Box 
                                  bg="white" 
                                  p="3" 
                                  rounded="lg" 
                                  border="1px solid" 
                                  borderColor="blue.200"
                                  textAlign="center"
                                  flex="1"
                                >
                                  <Text fontSize="sm" color="blue.700" fontWeight="medium">
                                    {formData.unit === 'kg' ? (
                                      <>
                                        Costo por gramo: <strong>${((formData.unit_cost / formData.initial_stock) / 1000).toFixed(4)}</strong>
                                      </>
                                    ) : (
                                      <>
                                        Costo por kg: <strong>${((formData.unit_cost / formData.initial_stock) * 1000).toFixed(2)}</strong>
                                      </>
                                    )}
                                  </Text>
                                </Box>
                              </Flex>
                            </Stack>
                          </Card.Body>
                        </Card.Root>
                      )}

                      {/* Conversiones automáticas para volumen - Diseño mejorado */}
                      {formData.unit && ['l', 'ml'].includes(formData.unit) && (
                        <Card.Root variant="outline" bg="purple.50" borderColor="purple.200">
                          <Card.Body p="4">
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
                                  🧪
                                </Box>
                                <Text fontSize="md" fontWeight="semibold" color="purple.800">
                                  Conversión Automática - Volumen
                                </Text>
                              </Flex>
                              
                              <Flex 
                                direction={{ base: "column", md: "row" }} 
                                gap="3" 
                                align="center"
                              >
                                <Box 
                                  bg="white" 
                                  p="3" 
                                  rounded="lg" 
                                  border="1px solid" 
                                  borderColor="purple.200"
                                  textAlign="center"
                                  flex="1"
                                >
                                  <Text fontSize="sm" color="purple.700" fontWeight="medium">
                                    {formData.unit === 'l' ? (
                                      <>
                                        {formData.initial_stock} L = <strong>{(formData.initial_stock * 1000).toLocaleString()} ml</strong>
                                      </>
                                    ) : (
                                      <>
                                        {formData.initial_stock} ml = <strong>{(formData.initial_stock / 1000).toFixed(3)} L</strong>
                                      </>
                                    )}
                                  </Text>
                                </Box>
                                
                                <Text color="purple.400" fontSize="lg">→</Text>
                                
                                <Box 
                                  bg="white" 
                                  p="3" 
                                  rounded="lg" 
                                  border="1px solid" 
                                  borderColor="purple.200"
                                  textAlign="center"
                                  flex="1"
                                >
                                  <Text fontSize="sm" color="purple.700" fontWeight="medium">
                                    {formData.unit === 'l' ? (
                                      <>
                                        Costo por ml: <strong>${((formData.unit_cost / formData.initial_stock) / 1000).toFixed(4)}</strong>
                                      </>
                                    ) : (
                                      <>
                                        Costo por litro: <strong>${((formData.unit_cost / formData.initial_stock) * 1000).toFixed(2)}</strong>
                                      </>
                                    )}
                                  </Text>
                                </Box>
                              </Flex>
                            </Stack>
                          </Card.Body>
                        </Card.Root>
                      )}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}

// ============================================================================
// 🔢 COMPONENTE COUNTABLE FIELDS  
// ============================================================================

function CountableFields({ 
  formData, 
  setFormData, 
  errors,
  disabled = false,
  addToStockNow,
  setAddToStockNow
}: {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  errors: Record<string, string>;
  disabled?: boolean;
  addToStockNow: boolean;
  setAddToStockNow: (value: boolean) => void;
}) {
  const [usePackaging, setUsePackaging] = useState(!!formData.packaging);
  const [packageQuantity, setPackageQuantity] = useState(1); // Cantidad de paquetes
  const [unitPrice, setUnitPrice] = useState(0); // Precio por unidad (sin packaging)

  useEffect(() => {
    // Configurar unidad por defecto para contables
    if (formData.type === 'COUNTABLE' && !formData.unit) {
      setFormData({ ...formData, unit: 'unidad' });
    }
  // Intentionally only run when type changes; formData/setFormData are stable in this context
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.type]);

  useEffect(() => {
    if (!usePackaging) {
      setFormData({ ...formData, packaging: undefined });
      // Reset package quantity when disabling packaging
      setPackageQuantity(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usePackaging]);

  // Inicializar packageQuantity si ya hay datos de packaging
  useEffect(() => {
    if (formData.packaging?.package_size && formData.initial_stock) {
      const calculatedPackages = Math.floor(formData.initial_stock / formData.packaging.package_size);
      if (calculatedPackages > 0) {
        setPackageQuantity(calculatedPackages);
      }
    }
  }, [formData.packaging, formData.initial_stock]);

  // Inicializar unitPrice si no hay packaging
  useEffect(() => {
    if (!usePackaging && formData.initial_stock && formData.unit_cost && formData.initial_stock > 0) {
      setUnitPrice(formData.unit_cost / formData.initial_stock);
    }
  }, [usePackaging, formData.initial_stock, formData.unit_cost]);

  return (
    <Stack gap="6" w="full">
      {/* Business Category */}
      <Box w="full">
        <Field.Root invalid={!!errors.category}>
          <Field.Label>Categoría del Producto *</Field.Label>
          <Select.Root
            collection={CATEGORY_COLLECTION}
            value={formData.category ? [formData.category] : []}
            onValueChange={(details) => 
              setFormData({ 
                ...formData, 
                category: details.value[0]
              })
            }
            disabled={disabled}
          >
            <Select.Trigger
              w="full"
              height="44px"
              fontSize="md"
              px="3"
              borderRadius="md"
            >
              <Select.ValueText placeholder="¿A qué categoría pertenece?" />
            </Select.Trigger>
            <Select.Content positioning={{ placement: "bottom-start", gutter: 4 }} portalled={true} zIndex={9999}>
              {CATEGORY_COLLECTION.items.map(item => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Field.ErrorText>{errors.category}</Field.ErrorText>
        </Field.Root>
      </Box>

      {/* Info sobre contables */}
      <Alert.Root status="info" variant="subtle">
        <Alert.Indicator>
          <InformationCircleIcon style={{ width: '16px', height: '16px' }} />
        </Alert.Indicator>
        <Alert.Description>
          Items contables se miden en <strong>unidades individuales</strong>. 
          Si vienen empaquetados, configura el packaging abajo para facilitar el conteo.
        </Alert.Description>
      </Alert.Root>

      {/* Packaging */}
      <Card.Root variant="outline" w="full">
        <Card.Body>
          <Stack gap="4">
            <Flex justify="space-between" align="center">
              <Stack gap="1">
                <Text fontWeight="semibold">¿Viene empaquetado?</Text>
                <Text fontSize="sm" color="fg.muted">
                  Activa si el item viene en cajas, bandejas, docenas, etc.
                </Text>
              </Stack>
              <Switch.Root
                checked={usePackaging}
                onCheckedChange={(details) => !disabled && setUsePackaging(details.checked)}
                disabled={disabled}
              >
                <Switch.HiddenInput />
                <Switch.Control />
              </Switch.Root>
            </Flex>

            {usePackaging && (
              <Stack gap="4" pt="4" borderTop="1px solid" borderColor="border">
                <Flex gap="4" direction={{ base: "column", md: "row" }}>
                  <Box flex="1">
                    <Field.Root>
                      <Field.Label>Unidades por paquete</Field.Label>
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
                    </Field.Root>
                  </Box>
                  
                  <Box flex="1">
                    <Field.Root>
                      <Field.Label>Tipo de paquete</Field.Label>
                      <Input
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
                    </Field.Root>
                  </Box>
                </Flex>
                
                {formData.packaging?.package_size && formData.packaging?.package_unit && (
                  <Alert.Root status="success" variant="subtle">
                    <Alert.Indicator>
                      <InformationCircleIcon style={{ width: '16px', height: '16px' }} />
                    </Alert.Indicator>
                    <Alert.Description>
                      <Text>
                        <strong>Configuración:</strong> {formData.packaging.package_size} unidades por {formData.packaging.package_unit}
                        <br />
                        <strong>Ejemplo:</strong> Si tienes 3 {formData.packaging.package_unit}s = {3 * formData.packaging.package_size} unidades
                      </Text>
                    </Alert.Description>
                  </Alert.Root>
                )}
              </Stack>
            )}
          </Stack>
        </Card.Body>
      </Card.Root>

      {/* Stock Section */}
      <Card.Root variant="outline" w="full">
        <Card.Body>
          <Stack gap="4">
            <Flex justify="space-between" align="center">
              <Stack gap="1">
                <Text fontWeight="semibold">Agregar al inventario ahora</Text>
                <Text fontSize="sm" color="fg.muted">
                  Agrega stock inicial al crear el item
                </Text>
              </Stack>
                <Switch.Root
                  checked={addToStockNow}
                  onCheckedChange={(details: { checked: boolean }) => !disabled && setAddToStockNow(details.checked)}
                  disabled={disabled}
                >
                <Switch.HiddenInput />
                <Switch.Control />
              </Switch.Root>
            </Flex>

            {addToStockNow && (
              <Stack gap="4" pt="4" borderTop="1px solid" borderColor="border">
                {usePackaging && formData.packaging?.package_size ? (
                  // Modo CON PACKAGING
                  <>
                    <Alert.Root status="info" variant="subtle">
                      <Alert.Description>
                        <Text fontSize="sm">
                          💡 <strong>Modo packaging:</strong> Ingresa la cantidad de {formData.packaging.package_unit}s y el precio por cada {formData.packaging.package_unit}.
                        </Text>
                      </Alert.Description>
                    </Alert.Root>
                    
                    <Flex gap="4" direction={{ base: "column", md: "row" }}>
                      <Box flex="1">
                        <Field.Root>
                          <Field.Label>Cantidad de {formData.packaging.package_unit}s</Field.Label>
                          <Flex>
                            <NumberInput.Root
                              value={packageQuantity?.toString() || '1'}
                              onValueChange={(details) => {
                                const qty = parseInt(details.value) || 1;
                                setPackageQuantity(qty);
                                // Calcular unidades totales automáticamente
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
                              {formData.packaging.package_unit}s
                            </Box>
                          </Flex>
                          <Text fontSize="xs" color="fg.muted" mt="1">
                            = {(packageQuantity * (formData.packaging?.package_size || 0)).toLocaleString()} unidades totales
                          </Text>
                        </Field.Root>
                      </Box>

                      <Box flex="1">
                        <Field.Root invalid={!!errors.unit_cost}>
                          <Field.Label>Precio por {formData.packaging.package_unit}</Field.Label>
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
                            // @ts-ignore: allowDecimal exists on our NumberInput wrapper
                            // @ts-ignore: allowDecimal exists on our NumberInput wrapper
                            <NumberInput.Root
                              value={(formData.unit_cost && packageQuantity > 0 ? (formData.unit_cost / packageQuantity) : 0)?.toString() || '0'}
                              onValueChange={(details) => {
                                const pricePerPackage = parseFloat(details.value) || 0;
                                // Calcular costo total automáticamente
                                const totalCost = pricePerPackage * packageQuantity;
                                setFormData({ ...formData, unit_cost: totalCost });
                              }}
                              min={0}
                              allowDecimal={true}
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
                          <Text fontSize="xs" color="fg.muted" mt="1">
                            Total: ${formData.unit_cost?.toLocaleString()} ARS
                          </Text>
                          <Field.ErrorText>{errors.unit_cost}</Field.ErrorText>
                        </Field.Root>
                      </Box>
                    </Flex>
                  </>
                ) : (
                  // Modo SIN PACKAGING  
                  <>
                    <Alert.Root status="info" variant="subtle">
                      <Alert.Description>
                        <Text fontSize="sm">
                          💡 <strong>Modo individual:</strong> Ingresa el precio por unidad y la cantidad de unidades a agregar.
                        </Text>
                      </Alert.Description>
                    </Alert.Root>
                    
                    <Flex gap="4" direction={{ base: "column", md: "row" }}>
                      <Box flex="1">
                        <Field.Root invalid={!!errors.initial_stock}>
                          <Field.Label>Cantidad de unidades</Field.Label>
                          <Flex>
                            <NumberInput.Root
                              value={formData.initial_stock?.toString() || '0'}
                              onValueChange={(details) => {
                                const units = parseInt(details.value) || 0;
                                setFormData({ 
                                  ...formData, 
                                  initial_stock: units,
                                  unit_cost: unitPrice * units // Recalcular costo total
                                });
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
                              unidades
                            </Box>
                          </Flex>
                          <Field.ErrorText>{errors.initial_stock}</Field.ErrorText>
                        </Field.Root>
                      </Box>

                      <Box flex="1">
                        <Field.Root>
                          <Field.Label>Precio por unidad</Field.Label>
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
                            // @ts-ignore: allowDecimal exists on our NumberInput wrapper
                            // @ts-ignore: allowDecimal exists on our NumberInput wrapper
                            <NumberInput.Root
                              value={unitPrice?.toString() || '0'}
                              onValueChange={(details) => {
                                const price = parseFloat(details.value) || 0;
                                setUnitPrice(price);
                                // Recalcular costo total automáticamente
                                const totalCost = price * (formData.initial_stock || 0);
                                setFormData({ ...formData, unit_cost: totalCost });
                              }}
                              min={0}
                              allowDecimal={true}
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
                          <Text fontSize="xs" color="fg.muted" mt="1">
                            Total: ${formData.unit_cost?.toLocaleString()} ARS
                          </Text>
                        </Field.Root>
                      </Box>
                    </Flex>
                  </>
                )}

                {/* Cálculos automáticos para contables - Vista mejorada */}
                {formData.initial_stock && formData.unit_cost && formData.initial_stock > 0 && formData.unit_cost > 0 && (
                  <Box mt="6">
                    <Stack gap="4">
                      {/* Resumen principal con diseño de tarjeta */}
                      <Card.Root variant="elevated" bg="green.50" borderColor="green.200">
                        <Card.Body p="4">
                          <Stack gap="3">
                            <Flex align="center" gap="2">
                              <Box 
                                w="8" h="8" 
                                bg="green.100" 
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
                              <Box 
                                bg="white" 
                                p="3" 
                                rounded="lg" 
                                border="1px solid" 
                                borderColor="green.200"
                                flex="1"
                              >
                                <Text fontSize="xs" color="green.600" fontWeight="medium">
                                  COSTO POR UNIDAD
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color="green.800">
                                  ${(formData.unit_cost / formData.initial_stock).toFixed(2)}
                                </Text>
                                <Text fontSize="xs" color="green.600">
                                  ARS por unidad
                                </Text>
                              </Box>
                              
                              <Box 
                                bg="white" 
                                p="3" 
                                rounded="lg" 
                                border="1px solid" 
                                borderColor="green.200"
                                flex="1"
                              >
                                <Text fontSize="xs" color="green.600" fontWeight="medium">
                                  STOCK INICIAL
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color="green.800">
                                  {formData.initial_stock.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" color="green.600">
                                  unidades
                                </Text>
                              </Box>
                              
                              <Box 
                                bg="white" 
                                p="3" 
                                rounded="lg" 
                                border="1px solid" 
                                borderColor="green.200"
                                flex="1"
                              >
                                <Text fontSize="xs" color="green.600" fontWeight="medium">
                                  INVERSIÓN TOTAL
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color="green.800">
                                  ${formData.unit_cost.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" color="green.600">
                                  ARS
                                </Text>
                              </Box>
                            </Flex>
                          </Stack>
                        </Card.Body>
                      </Card.Root>

                      {/* Información de packaging si está configurado - Diseño mejorado */}
                      {usePackaging && formData.packaging?.package_size && formData.packaging?.package_unit && (
                        <Card.Root variant="outline" bg="cyan.50" borderColor="cyan.200">
                          <Card.Body p="4">
                            <Stack gap="3">
                              <Flex align="center" gap="2">
                                <Box 
                                  w="8" h="8" 
                                  bg="cyan.100" 
                                  rounded="full" 
                                  display="flex" 
                                  alignItems="center" 
                                  justifyContent="center"
                                >
                                  📦
                                </Box>
                                <Text fontSize="md" fontWeight="semibold" color="cyan.800">
                                  Análisis de Packaging
                                </Text>
                              </Flex>
                              
                              <Flex 
                                direction={{ base: "column", md: "row" }} 
                                gap="3" 
                                align="center"
                              >
                                <Box 
                                  bg="white" 
                                  p="3" 
                                  rounded="lg" 
                                  border="1px solid" 
                                  borderColor="cyan.200"
                                  textAlign="center"
                                  flex="1"
                                >
                                  <Text fontSize="sm" color="cyan.700" fontWeight="medium">
                                    <strong>{formData.initial_stock} unidades</strong> =
                                  </Text>
                                  <Text fontSize="sm" color="cyan.700">
                                    {Math.floor(formData.initial_stock / formData.packaging.package_size)} {formData.packaging.package_unit}s completos
                                  </Text>
                                  {formData.initial_stock % formData.packaging.package_size > 0 && (
                                    <Text fontSize="xs" color="cyan.600">
                                      + {formData.initial_stock % formData.packaging.package_size} sueltas
                                    </Text>
                                  )}
                                </Box>
                                
                                <Text color="cyan.400" fontSize="lg">→</Text>
                                
                                <Box 
                                  bg="white" 
                                  p="3" 
                                  rounded="lg" 
                                  border="1px solid" 
                                  borderColor="cyan.200"
                                  textAlign="center"
                                  flex="1"
                                >
                                  <Text fontSize="sm" color="cyan.700" fontWeight="medium">
                                    Costo por {formData.packaging.package_unit}:
                                  </Text>
                                  <Text fontSize="lg" fontWeight="bold" color="cyan.800">
                                    ${((formData.unit_cost / formData.initial_stock) * formData.packaging.package_size).toFixed(2)}
                                  </Text>
                                  <Text fontSize="xs" color="cyan.600">
                                    ARS
                                  </Text>
                                </Box>
                              </Flex>
                            </Stack>
                          </Card.Body>
                        </Card.Root>
                      )}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}

// ============================================================================
// 🍳 COMPONENTE ELABORATED FIELDS
// ============================================================================

function ElaboratedFields({ 
  formData, 
  setFormData
}: {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
}) {

  return (
    <Stack gap="6" w="full">
      {/* Business Category */}
      <Box w="full">
        <Field.Root>
          <Field.Label>Categoría del Producto *</Field.Label>
          <Select.Root
            collection={CATEGORY_COLLECTION}
            value={formData.category ? [formData.category] : []}
            onValueChange={(details) => 
              setFormData({ 
                ...formData, 
                category: details.value[0]
              })
            }
          >
            <Select.Trigger
              w="full"
              height="44px"
              fontSize="md"
              px="3"
              borderRadius="md"
            >
              <Select.ValueText placeholder="¿A qué categoría pertenece?" />
            </Select.Trigger>
            <Select.Content positioning={{ placement: "bottom-start", gutter: 4 }} portalled={true} zIndex={9999}>
              {CATEGORY_COLLECTION.items.map(item => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Field.Root>
      </Box>

      {/* Info sobre elaborados */}
      <Alert.Root status="warning" variant="subtle">
        <Alert.Indicator>
          <ExclamationTriangleIcon style={{ width: '16px', height: '16px' }} />
        </Alert.Indicator>
        <Alert.Title>Items Elaborados</Alert.Title>
        <Alert.Description>
          Los items elaborados requieren una receta con ingredientes. 
          El sistema verificará automáticamente que haya stock suficiente antes de permitir la producción.
        </Alert.Description>
      </Alert.Root>

      {/* Constructor de Receta */}
      <Box w="full">
        <RecipeBuilderClean
          mode="material"
          context={`Material: ${formData.name || 'Nuevo Item'}`}
          showList={false}
          onRecipeCreated={(recipe) => {
            console.log('Receta creada:', recipe);
            // Actualizar formData con la receta creada
            // recipe shape comes from external module; suppress strict any errors
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const r = recipe as any;
            setFormData({ 
              ...formData, 
              recipe_id: r.id,
              initial_stock: r.output_quantity || 1,
              unit_cost: r.total_cost || 0
            });
          }}
        />
      </Box>

    </Stack>
  );
}

// ============================================================================
// 🏗️ COMPONENTE PRINCIPAL
// ============================================================================

export function MaterialFormModalComplete() {
  const { 
    isModalOpen, 
    modalMode, 
    currentItem, 
    closeModal,
    addItem,
    updateItem,
    alerts,
    alertSummary,
    items
  } = useMaterials();
  
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    type: '' as ItemType,
    unit: '' as AllUnit,
    initial_stock: 0,
    unit_cost: 0
  });

  // Optimized validation hook with real-time feedback
  const {
    fieldErrors,
    fieldWarnings,
    validationState,
    validateField,
    validateForm: optimizedValidateForm,
    clearValidation
  } = useMaterialValidation(formData, items, {
    enableRealTime: true,
    debounceMs: 300
  });

  // Memoized form data update function to prevent cascading re-renders
  const updateFormData = useCallback((updates: Partial<ItemFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, [setFormData]);

  // Optimized field update handlers with validation
  const handleFieldChange = useCallback((field: keyof ItemFormData) => 
    (value: unknown) => {
  // value may come from UI primitives; validate with unknown then cast
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFormData(prev => ({ ...prev, [field]: value as any }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validateField(field as string, value as any);
    }, [validateField, setFormData]
  );

  // Memoized handlers for form updates
  const handleNameChange = useCallback((name: string) => {
    handleFieldChange('name')(name);
  }, [handleFieldChange]);

  const handleTypeChange = useCallback((type: ItemType) => {
    updateFormData({ 
      type, 
      unit: '' as AllUnit, 
      category: undefined,
      packaging: undefined,
      recipe_id: undefined
    });
    validateField('type', type);
  }, [updateFormData, validateField]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addToStockNow, setAddToStockNow] = useState(false);

  // Enhanced loading states for better UX feedback
  const [loadingStates, setLoadingStates] = useState({
    initializing: false,
    validating: false,
    calculating: false,
    savingToStock: false
  });

  // Success states for visual confirmation
  const [successStates, setSuccessStates] = useState({
    itemCreated: false,
    stockAdded: false,
    validationPassed: false
  });

  const isEditMode = modalMode === 'edit';
  const isViewMode = modalMode === 'view';

  // Para ELABORATED siempre se agrega a stock
  useEffect(() => {
    if (formData.type === 'ELABORATED') {
      setAddToStockNow(true);
    } else if (formData.type === 'MEASURABLE' || formData.type === 'COUNTABLE') {
      setAddToStockNow(false);
    }
  }, [formData.type]);

  // Initialize form when modal opens
  useEffect(() => {
    if (isModalOpen && currentItem) {
      // Pre-fill form with current item data
      const itemFormData: ItemFormData = {
        name: currentItem.name,
        type: currentItem.type,
        unit: getItemUnit(currentItem),
        initial_stock: currentItem.stock,
        unit_cost: currentItem.unit_cost || 0
      };

      // Add type-specific data
      if (isMeasurable(currentItem)) {
        itemFormData.category = currentItem.category;
      } else if (isCountable(currentItem)) {
        itemFormData.packaging = currentItem.packaging;
      } else if (isElaborated(currentItem)) {
        itemFormData.recipe_id = currentItem.recipe_id;
      }

      setFormData(itemFormData);
    } else if (isModalOpen) {
      // Reset form for new item
      setFormData({
        name: '',
        type: '' as ItemType,
        unit: '' as AllUnit,
        initial_stock: 0,
        unit_cost: 0
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, currentItem]);

  // Clear validation when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      clearValidation();
    }
  }, [isModalOpen, clearValidation]);

  // Memoized helper function to get item unit
  const getItemUnit = useCallback((item: MaterialItem): AllUnit => {
    if (isMeasurable(item)) return item.unit;
    if (isCountable(item)) return 'unidad';
    if (isElaborated(item)) return item.unit;
    return 'unidad' as AllUnit;
  }, []);

  // Enhanced form status badge with real-time validation
  const formStatusBadge = useMemo(() => {
    
    if (!formData.name || !formData.type) {
      return <Badge colorPalette="gray" variant="subtle">Incompleto</Badge>;
    }
    
    if (formData.type === 'MEASURABLE' && (!formData.category || !formData.unit)) {
      return <Badge colorPalette="blue" variant="subtle">Configura medición</Badge>;
    }
    
    if (formData.type === 'ELABORATED') {
      if (!formData.recipe_id) {
        return <Badge colorPalette="purple" variant="subtle">Crea una receta</Badge>;
      }
    }
    
    if (validationState.hasErrors) {
      return <Badge colorPalette="red" variant="subtle">Con errores ({validationState.errorCount})</Badge>;
    }
    
    if (validationState.hasWarnings) {
      return <Badge colorPalette="orange" variant="subtle">Con advertencias</Badge>;
    }
    
    return <Badge colorPalette="green" variant="subtle">✓ Listo para guardar</Badge>;
  }, [formData.name, formData.type, formData.category, formData.unit, formData.recipe_id, validationState]);

  // Use optimized validation function
  const validateForm = useCallback(async () => {
    return await optimizedValidateForm();
  }, [optimizedValidateForm]);

  // Enhanced submit handler with progressive feedback
  const handleSubmit = useCallback(async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    
    // Step 1: Validation feedback
    setLoadingStates(prev => ({ ...prev, validating: true }));
    
    // Simulate validation time for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    setLoadingStates(prev => ({ ...prev, validating: false }));
    setSuccessStates(prev => ({ ...prev, validationPassed: true }));

    try {
      if (isEditMode && currentItem) {
        // Step 2: Updating item
        await updateItem(currentItem.id, formData as Partial<MaterialItem>);
        setSuccessStates(prev => ({ ...prev, itemCreated: true }));
      } else {
        // Step 2: Creating item
        if (addToStockNow) {
          // Step 3: Adding to stock
          setLoadingStates(prev => ({ ...prev, savingToStock: true }));
          
          await addItem(formData);
          
          setLoadingStates(prev => ({ ...prev, savingToStock: false }));
          setSuccessStates(prev => ({ 
            ...prev, 
            itemCreated: true, 
            stockAdded: true 
          }));
        } else {
          const itemDataWithoutStock = {
            ...formData,
            initial_stock: 0,
            unit_cost: 0
          };
          await addItem(itemDataWithoutStock);
          setSuccessStates(prev => ({ ...prev, itemCreated: true }));
        }
      }
      
      // Success delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      closeModal();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
      setLoadingStates({
        initializing: false,
        validating: false,
        calculating: false,
        savingToStock: false
      });
      setSuccessStates({
        itemCreated: false,
        stockAdded: false,
        validationPassed: false
      });
    }
  }, [validateForm, isEditMode, currentItem, updateItem, formData, addToStockNow, addItem, closeModal]);

  // Memoized title
  const modalTitle = useMemo(() => {
    switch (modalMode) {
      case 'add': return 'Crear Nuevo Material';
      case 'edit': return 'Editar Material';
      case 'view': return 'Ver Material';
      default: return 'Material';
    }
  }, [modalMode]);

  // Progressive loading indicator for submit button
  const submitButtonContent = useMemo(() => {
    if (loadingStates.validating) {
      return (
        <HStack gap="2">
          <Spinner size="sm" />
          <Text>Validando...</Text>
        </HStack>
      );
    }
    
    if (loadingStates.savingToStock) {
      return (
        <HStack gap="2">
          <Spinner size="sm" />
          <Text>Agregando a stock...</Text>
        </HStack>
      );
    }
    
    if (isSubmitting) {
      return (
        <HStack gap="2">
          <Spinner size="sm" />
          <Text>{isEditMode ? 'Actualizando...' : 'Creando...'}</Text>
        </HStack>
      );
    }

    if (successStates.itemCreated && successStates.stockAdded) {
      return (
        <HStack gap="2">
          <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
          <Text>¡Completado!</Text>
        </HStack>
      );
    }

    return (
      <>
        <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
        {isEditMode ? 'Actualizar Item' : 
          addToStockNow ? 'Crear y Agregar a Stock' : 'Crear Item'
        }
      </>
    );
  }, [loadingStates, isSubmitting, successStates, isEditMode, addToStockNow]);

  // Operation progress indicator
  const operationProgress = useMemo(() => {
    if (!isSubmitting) return null;

    let progress = 0;
    let currentStep = "";

    if (loadingStates.validating) {
      progress = 25;
      currentStep = "Validando formulario";
    } else if (successStates.validationPassed && !successStates.itemCreated) {
      progress = 50;
      currentStep = isEditMode ? "Actualizando material" : "Creando material";
    } else if (loadingStates.savingToStock) {
      progress = 75;
      currentStep = "Agregando al inventario";
    } else if (successStates.itemCreated) {
      progress = 100;
      currentStep = "¡Operación completada!";
    }

    return (
      <Box w="full" mt="4">
        <Stack gap="2">
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color="fg.muted">{currentStep}</Text>
            <Text fontSize="sm" color="fg.muted">{progress}%</Text>
          </Flex>
          <Progress.Root value={progress} size="sm" colorPalette="blue">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Stack>
      </Box>
    );
  }, [isSubmitting, loadingStates, successStates, isEditMode]);

  return (
    <Dialog.Root 
      open={isModalOpen} 
  onOpenChange={(details: { open: boolean }) => !details.open && !isSubmitting && closeModal()}
      size={{ base: "full", md: "xl" }}
  closeOnEscape={!isSubmitting}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW={{ base: "100%", md: "800px" }}
          maxH={{ base: "100vh", md: "90vh" }}
          w="full"
          overflowY="auto"
          borderRadius={{ base: "0", md: "lg" }}
          m={{ base: "0", md: "4" }}
        >
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>{modalTitle}</Dialog.Title>
          </Dialog.Header>
          
          <Dialog.Body p={{ base: "4", md: "6" }}>
            <Container maxW="full" p="0">
              <Stack gap={{ base: "4", md: "6" }} w="full">
                {/* Banner de alertas críticas */}
                {alertSummary.hasCritical && (
                  <Alert.Root status="error" variant="subtle">
                    <Alert.Indicator>
                      <ExclamationTriangleIcon style={{ width: '20px', height: '20px' }} />
                    </Alert.Indicator>
                    <Alert.Title>Atención: Stock crítico detectado</Alert.Title>
                    <Alert.Description>
                      Hay {alertSummary.critical} items con stock crítico. 
                      Considera agregarlos a tu lista de compras.
                    </Alert.Description>
                  </Alert.Root>
                )}

                {/* Header con estado */}
                <Flex 
                  justify="space-between" 
                  align={{ base: "flex-start", md: "center" }}
                  direction={{ base: "column", md: "row" }}
                  gap={{ base: "3", md: "0" }}
                >
                  <Stack gap="1">
                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                      {isEditMode ? 'Editar Item' : 'Crear Nuevo Item'}
                    </Text>
                    {alertSummary.hasWarning && !alertSummary.hasCritical && (
                      <Text fontSize="sm" color="fg.warning">
                        💡 {alerts.length} items necesitan reposición
                      </Text>
                    )}
                  </Stack>
                  {formStatusBadge}
                </Flex>

                {/* Nombre del item */}
                <Box w="full">
                  <ValidatedField
                    label="Nombre del Item"
                    value={formData.name}
                    onChange={handleNameChange}
                    onValidate={validateField}
                    field="name"
                    error={fieldErrors.name}
                    warning={fieldWarnings.name}
                    isValidating={false}
                    placeholder="Ej: Harina 0000, Huevos, Relleno de carne..."
                    required={true}
                    disabled={isViewMode}
                  />
                </Box>

                {/* Selector de tipo */}
                {!isViewMode && (
                  <TypeSelector
                    value={formData.type}
                    onChange={handleTypeChange}
                    errors={fieldErrors}
                    disabled={isViewMode}
                  />
                )}

                {/* Campos específicos por tipo */}
                {formData.type === 'MEASURABLE' && (
                  <MeasurableFields 
                    formData={formData} 
                    updateFormData={updateFormData} 
                    fieldErrors={fieldErrors}
                    disabled={isViewMode}
                    addToStockNow={addToStockNow}
                    setAddToStockNow={setAddToStockNow} 
                  />
                )}
                
                {formData.type === 'COUNTABLE' && (
                  <CountableFields 
                    formData={formData} 
                    setFormData={setFormData} 
                    errors={fieldErrors}
                    disabled={isViewMode}
                    addToStockNow={addToStockNow}
                    setAddToStockNow={setAddToStockNow}
                  />
                )}
                
                {formData.type === 'ELABORATED' && (
                  <ElaboratedFields 
                    formData={formData} 
                    setFormData={setFormData} 
                  />
                )}

                {/* Operation progress indicator */}
                {operationProgress}

                {/* Botones de acción */}
                {!isViewMode && (
                  <Flex 
                    gap="3" 
                    pt="4" 
                    justify={{ base: "stretch", md: "flex-end" }}
                    direction={{ base: "column-reverse", md: "row" }}
                    borderTop="1px solid" 
                    borderColor="border"
                  >
                    <Button 
                      variant="outline" 
                      onClick={closeModal}
                      disabled={isSubmitting}
                      height="44px"
                      fontSize="md"
                      px="6"
                      w={{ base: "full", md: "auto" }}
                    >
                      Cancelar
                    </Button>
                    
                    <Button 
                      colorPalette={successStates.itemCreated ? "green" : "blue"}
                      onClick={handleSubmit}
                      disabled={
                        !formData.name || 
                        !formData.type || 
                        isSubmitting || 
                        validationState.hasErrors
                      }
                      height="44px"
                      fontSize="md"
                      px="6"
                      w={{ base: "full", md: "auto" }}
                    >
                      {submitButtonContent}
                    </Button>
                  </Flex>
                )}

                {isViewMode && (
                  <Flex gap="3" pt="4" justify={{ base: "stretch", md: "flex-end" }} borderTop="1px solid" borderColor="border">
                    <Button
                      variant="outline"
                      onClick={closeModal}
                      height="44px"
                      fontSize="md"
                      px="6"
                      w={{ base: "full", md: "auto" }}
                    >
                      Cerrar
                    </Button>
                  </Flex>
                )}
              </Stack>
            </Container>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}