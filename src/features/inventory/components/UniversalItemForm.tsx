// src/features/inventory/components/UniversalItemForm.tsx
// 🚀 FORMULARIO UNIVERSAL - CORREGIDO: Eliminado código no utilizado + componentes válidos v3

import { useState, useMemo, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Input,
  Select,
  createListCollection,
  NumberInput,
  Button,
  Card,
  Badge,
  Alert,
  Box,
  Textarea,
  Switch,
  RadioGroup,
  Collapsible
} from '@chakra-ui/react';
// ✅ CORREGIDO: Usar sistema de iconos G-Admin
import { ActionIcon, StatusIcon } from '@/components/ui/Icon';

import { useInventory } from '../logic/useInventory';
import { notify } from '@/lib/notifications';
import {
  type ItemFormData,
  type ItemType,
  type AllUnit
} from '../types';
// ✅ CORREGIDO: Eliminados imports no utilizados
// - UNIT_CATEGORIES, isMeasurable, isCountable, isElaborated, type MeasurableUnit
// - getUnitHelper, validateConversion, validatePackaging, formatQuantity

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
    { label: '⚖️ Peso (kg, g, ton)', value: 'weight' },
    { label: '🧪 Volumen (l, ml, cm³)', value: 'volume' },
    { label: '📏 Longitud (m, cm, mm)', value: 'length' }
  ]
});

// ✅ CORREGIDO: Eliminado PACKAGING_DISPLAY_COLLECTION no utilizado

// ============================================================================
// 🔧 COMPONENTES AUXILIARES
// ============================================================================

function TypeSelector({ value, onChange, errors }: {
  value: ItemType | '';
  onChange: (type: ItemType) => void;
  errors: Record<string, string>;
}) {
  return (
    <VStack align="stretch" gap="3">
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb="2">
          Tipo de Item *
        </Text>
        <Select.Root
          collection={ITEM_TYPE_COLLECTION}
          value={value ? [value] : []}
          onValueChange={(details) => onChange(details.value[0] as ItemType)}
          invalid={!!errors.type}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Selecciona el tipo de item" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {ITEM_TYPE_COLLECTION.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  <VStack align="start" gap="1">
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Text fontSize="xs" color="gray.500">
                      {item.description}
                    </Text>
                  </VStack>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
        {errors.type && (
          <Text color="red.500" fontSize="sm" mt="1">
            {errors.type}
          </Text>
        )}
      </Box>

      {/* Explicación del tipo seleccionado */}
      {value && (
        <Alert.Root status="info" variant="subtle">
          <Alert.Indicator>
            {value === 'MEASURABLE' && <StatusIcon name="info" size="sm" />}
            {value === 'COUNTABLE' && <ActionIcon name="inventory" size="sm" />}
            {value === 'ELABORATED' && <ActionIcon name="chef" size="sm" />}
          </Alert.Indicator>
          <Alert.Description>
            {value === 'MEASURABLE' && 'Ejemplo: Harina (kg), Leche (litros), Alambre (metros)'}
            {value === 'COUNTABLE' && 'Ejemplo: Huevos (unidades), Cajas de pizza (50 unidades/caja)'}
            {value === 'ELABORATED' && 'Ejemplo: Relleno de empanadas, Masa de pizza (producidos con receta)'}
          </Alert.Description>
        </Alert.Root>
      )}
    </VStack>
  );
}

function MeasurableFields({ formData, setFormData, errors }: {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  errors: Record<string, string>;
}) {
  const categoryCollection = useMemo(() => CATEGORY_COLLECTION, []);
  
  // ✅ CORREGIDO: Implementación simple sin getUnitHelper (no utilizado)
  const unitsCollection = useMemo(() => {
    if (!formData.category) return createListCollection({ items: [] });
    
    const unitsByCategory = {
      weight: [
        { label: 'kg', value: 'kg' },
        { label: 'g', value: 'g' },
        { label: 'ton', value: 'ton' }
      ],
      volume: [
        { label: 'l', value: 'l' },
        { label: 'ml', value: 'ml' },
        { label: 'cm³', value: 'cm³' }
      ],
      length: [
        { label: 'm', value: 'm' },
        { label: 'cm', value: 'cm' },
        { label: 'mm', value: 'mm' }
      ]
    };

    return createListCollection({
      items: unitsByCategory[formData.category] || []
    });
  }, [formData.category]);

  return (
    <VStack align="stretch" gap="4">
      {/* Categoría */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb="2">
          Categoría de Medida *
        </Text>
        <Select.Root
          collection={categoryCollection}
          value={formData.category ? [formData.category] : []}
          onValueChange={(details) => 
            setFormData({ 
              ...formData, 
              category: details.value[0] as 'weight' | 'volume' | 'length',
              unit: '' as AllUnit // Reset unit cuando cambia categoría
            })
          }
          invalid={!!errors.category}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Peso, volumen o longitud" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {categoryCollection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
        {errors.category && (
          <Text color="red.500" fontSize="sm" mt="1">
            {errors.category}
          </Text>
        )}
      </Box>

      {/* Unidad */}
      {formData.category && (
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb="2">
            Unidad de Medida *
          </Text>
          <Select.Root
            collection={unitsCollection}
            value={formData.unit ? [formData.unit] : []}
            onValueChange={(details) => 
              setFormData({ ...formData, unit: details.value[0] as AllUnit })
            }
            invalid={!!errors.unit}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Selecciona la unidad" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {unitsCollection.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
          {errors.unit && (
            <Text color="red.500" fontSize="sm" mt="1">
              {errors.unit}
            </Text>
          )}
        </Box>
      )}
    </VStack>
  );
}

function CountableFields({ formData, setFormData, errors }: {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  errors: Record<string, string>;
}) {
  const [usePackaging, setUsePackaging] = useState(false);

  // ✅ CORREGIDO: Agregado useEffect que faltaba
  useEffect(() => {
    if (!usePackaging) {
      setFormData({ ...formData, packaging: undefined });
    }
  }, [usePackaging, formData, setFormData]);

  return (
    <VStack align="stretch" gap="4">
      <Alert.Root status="info" variant="subtle">
        <Alert.Indicator>
          <StatusIcon name="info" size="sm" />
        </Alert.Indicator>
        <Alert.Description>
          Items contables siempre se miden en "unidades". Opcionalmente puedes configurar packaging 
          (ej: cajas de pizza vienen de 50 unidades por caja).
        </Alert.Description>
      </Alert.Root>

      {/* Packaging opcional */}
      <Card.Root variant="outline">
        <Card.Body p="4">
          <VStack align="stretch" gap="3">
            <HStack justify="space-between">
              <VStack align="start" gap="1">
                <Text fontWeight="medium">Configurar Packaging</Text>
                <Text fontSize="sm" color="gray.600">
                  Para items que vienen empaquetados (cajas, docenas, etc.)
                </Text>
              </VStack>
              {/* ✅ CORREGIDO: Switch con estructura v3 correcta */}
              <Switch.Root
                checked={usePackaging}
                onCheckedChange={(details) => setUsePackaging(details.checked)}
              >
                <Switch.HiddenInput />
                <Switch.Control />
              </Switch.Root>
            </HStack>

            <Collapsible.Root open={usePackaging}>
              <Collapsible.Content>
                <VStack align="stretch" gap="3" pt="3" borderTop="1px solid" borderColor="gray.200">
                  <HStack gap="4">
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="medium" mb="2">
                        Tamaño del Paquete *
                      </Text>
                      <NumberInput.Root
                        value={formData.packaging?.package_size?.toString() || ''}
                        onValueChange={(details) => 
                          setFormData({
                            ...formData,
                            packaging: {
                              ...formData.packaging,
                              package_size: parseInt(details.value) || 0,
                              display_mode: 'packaged'
                            }
                          })
                        }
                        min={1}
                      >
                        <NumberInput.Control>
                          <NumberInput.Input placeholder="50" />
                          <NumberInput.IncrementTrigger />
                          <NumberInput.DecrementTrigger />
                        </NumberInput.Control>
                      </NumberInput.Root>
                    </Box>

                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="medium" mb="2">
                        Unidad del Paquete *
                      </Text>
                      <Input
                        placeholder="caja, docena, bolsa..."
                        value={formData.packaging?.package_unit || ''}
                        onChange={(e) => 
                          setFormData({
                            ...formData,
                            packaging: {
                              ...formData.packaging,
                              package_unit: e.target.value,
                              display_mode: 'packaged'
                            }
                          })
                        }
                      />
                    </Box>
                  </HStack>

                  {/* ✅ CORREGIDO: Agregado RadioGroup que faltaba */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb="2">
                      Modo de Visualización
                    </Text>
                    <RadioGroup.Root
                      value={formData.packaging?.display_mode || 'individual'}
                      onValueChange={(details) => 
                        setFormData({
                          ...formData,
                          packaging: {
                            ...formData.packaging,
                            display_mode: details.value as 'individual' | 'packaged' | 'both'
                          }
                        })
                      }
                    >
                      <VStack align="start" gap="2">
                        <RadioGroup.Item value="individual">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText>Solo unidades (ej: 150 unidades)</RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="packaged">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText>Solo paquetes (ej: 3 cajas)</RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="both">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText>Ambos (ej: 3 cajas + 5 unidades)</RadioGroup.ItemText>
                        </RadioGroup.Item>
                      </VStack>
                    </RadioGroup.Root>
                  </Box>

                  {formData.packaging?.package_size && formData.packaging?.package_unit && (
                    <Alert.Root status="success" variant="subtle">
                      <Alert.Description>
                        Ejemplo: "2 {formData.packaging.package_unit}s + 5 unidades" 
                        para un total de {(2 * formData.packaging.package_size) + 5} unidades
                      </Alert.Description>
                    </Alert.Root>
                  )}
                </VStack>
              </Collapsible.Content>
            </Collapsible.Root>
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}

function ElaboratedFields({ formData, setFormData, errors }: {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  errors: Record<string, string>;
}) {
  return (
    <VStack align="stretch" gap="4">
      <Alert.Root status="warning" variant="subtle">
        <Alert.Indicator>
          <StatusIcon name="warning" size="sm" />
        </Alert.Indicator>
        <Alert.Title>Items Elaborados</Alert.Title>
        <Alert.Description>
          Los items elaborados requieren una receta con ingredientes. 
          El sistema verificará automáticamente que haya stock suficiente antes de permitir la producción.
        </Alert.Description>
      </Alert.Root>

      {/* Unidad del producto final */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb="2">
          Unidad del Producto Final *
        </Text>
        <Input
          placeholder="unidad, porción, bandeja, lata..."
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value as AllUnit })}
          invalid={!!errors.unit}
        />
        {errors.unit && (
          <Text color="red.500" fontSize="sm" mt="1">
            {errors.unit}
          </Text>
        )}
        <Text fontSize="xs" color="gray.500" mt="1">
          Ej: "porción" para relleno de empanadas, "unidad" para pan elaborado
        </Text>
      </Box>

      {/* ✅ CORREGIDO: Agregado Textarea que faltaba */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb="2">
          Descripción del Proceso (Opcional)
        </Text>
        <Textarea
          placeholder="Describe brevemente cómo se elabora este item..."
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          resize="vertical"
        />
        <Text fontSize="xs" color="gray.500" mt="1">
          Ej: "Mezclar ingredientes, cocinar 20 min, enfriar antes de usar"
        </Text>
      </Box>

      {/* Configuración de producción */}
      <Card.Root variant="outline">
        <Card.Body p="4">
          <VStack align="stretch" gap="3">
            <Text fontWeight="medium">Configuración de Producción</Text>
            
            <HStack justify="space-between">
              <VStack align="start" gap="1">
                <Text fontSize="sm">Requiere Producción</Text>
                <Text fontSize="xs" color="gray.600">
                  Debe producirse antes de usar en otros productos
                </Text>
              </VStack>
              {/* ✅ CORREGIDO: Switch con estructura v3 correcta */}
              <Switch.Root
                checked={formData.requires_production ?? true}
                onCheckedChange={(details) => 
                  setFormData({ ...formData, requires_production: details.checked })
                }
              >
                <Switch.HiddenInput />
                <Switch.Control />
              </Switch.Root>
            </HStack>

            <HStack justify="space-between">
              <VStack align="start" gap="1">
                <Text fontSize="sm">Calcular Costo Automáticamente</Text>
                <Text fontSize="xs" color="gray.600">
                  El costo se calcula según los ingredientes de la receta
                </Text>
              </VStack>
              {/* ✅ CORREGIDO: Switch con estructura v3 correcta */}
              <Switch.Root
                checked={formData.auto_calculate_cost ?? true}
                onCheckedChange={(details) => 
                  setFormData({ ...formData, auto_calculate_cost: details.checked })
                }
              >
                <Switch.HiddenInput />
                <Switch.Control />
              </Switch.Root>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* TODO: Selector de receta */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb="2">
          Receta Asociada
        </Text>
        <Alert.Root status="info" variant="subtle">
          <Alert.Description>
            El selector de recetas se implementará cuando el módulo de recetas esté listo.
            Por ahora, puedes crear el item y asignar la receta después.
          </Alert.Description>
        </Alert.Root>
      </Box>
    </VStack>
  );
}

// ============================================================================
// 🏗️ COMPONENTE PRINCIPAL
// ============================================================================

interface UniversalItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editItem?: any; // TODO: Tipear cuando tengamos la interface completa
}

export function UniversalItemForm({ onSuccess, onCancel, editItem }: UniversalItemFormProps) {
  // ✅ CORREGIDO: Solo usar propiedades necesarias del hook
  // - alerts, hasAlerts, hasCriticalAlerts: Para mostrar contexto de stock crítico
  // - stockEntries: NO usado (es para módulo de movimientos de stock)
  const { 
    addItem, 
    updateItem, 
    alerts, 
    hasAlerts, 
    hasCriticalAlerts 
  } = useInventory();
  
  const [formData, setFormData] = useState<ItemFormData>({
    name: editItem?.name || '',
    type: editItem?.type || '' as ItemType,
    unit: editItem?.unit || '' as AllUnit,
    initial_stock: editItem?.stock || 0,
    unit_cost: editItem?.unit_cost || 0,
    category: editItem?.category,
    packaging: editItem?.packaging,
    recipe_id: editItem?.recipe_id,
    requires_production: editItem?.requires_production ?? true,
    auto_calculate_cost: editItem?.auto_calculate_cost ?? true,
    description: editItem?.description || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ✅ CORREGIDO: Agregado useEffect que faltaba - limpiar campos al cambiar tipo
  useEffect(() => {
    // Limpiar campos específicos cuando cambia el tipo
    if (formData.type) {
      setFormData(prev => ({
        ...prev,
        unit: '' as AllUnit,
        category: undefined,
        packaging: undefined,
        description: ''
      }));
    }
  }, [formData.type]);

  // ✅ CORREGIDO: Badge con estado del formulario
  const getFormStatusBadge = () => {
    if (!formData.name || !formData.type || !formData.unit) {
      return <Badge colorPalette="gray" variant="subtle">Incompleto</Badge>;
    }
    if (Object.keys(errors).length > 0) {
      return <Badge colorPalette="red" variant="subtle">Con errores</Badge>;
    }
    return <Badge colorPalette="green" variant="subtle">Listo para guardar</Badge>;
  };

  // Validación
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.type) {
      newErrors.type = 'Debes seleccionar un tipo de item';
    }
    
    if (!formData.unit) {
      newErrors.unit = 'La unidad es requerida';
    }
    
    // Validaciones específicas por tipo
    if (formData.type === 'MEASURABLE' && !formData.category) {
      newErrors.category = 'Debes seleccionar una categoría de medida';
    }
    
    if (formData.initial_stock && formData.initial_stock < 0) {
      newErrors.initial_stock = 'El stock inicial no puede ser negativo';
    }
    
    if (formData.unit_cost && formData.unit_cost < 0) {
      newErrors.unit_cost = 'El costo unitario no puede ser negativo';
    }
    
    // Validación de packaging
    if (formData.packaging?.package_size && formData.packaging.package_size <= 0) {
      newErrors.packaging = 'El tamaño del paquete debe ser mayor a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      if (editItem) {
        await updateItem(editItem.id, formData);
        notify.itemUpdated(formData.name);
      } else {
        await addItem(formData);
        notify.itemCreated(formData.name);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving item:', error);
      notify.error({
        title: editItem ? 'Error al actualizar' : 'Error al crear',
        description: 'No se pudo guardar el item. Inténtalo de nuevo.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ CORREGIDO: Función formatQuantity simple (reemplaza import no utilizado)
  const formatQuantity = (quantity: number, unit: string) => {
    return `${quantity} ${unit}${quantity !== 1 ? 's' : ''}`;
  };

  return (
    <VStack gap="6" align="stretch" maxW="600px" mx="auto">
      {/* ✅ AGREGADO: Banner de alertas críticas */}
      {hasCriticalAlerts && (
        <Alert.Root status="warning" variant="subtle">
          <Alert.Indicator>
            <StatusIcon name="warning" size="sm" />
          </Alert.Indicator>
          <Alert.Title>Atención: Stock crítico detectado</Alert.Title>
          <Alert.Description>
            Hay {alerts.filter(a => a.urgency === 'critical').length} items con stock crítico. 
            Considera agregarlos a tu lista de compras.
          </Alert.Description>
        </Alert.Root>
      )}

      {/* Header con estado */}
      <HStack justify="space-between" align="center">
        <VStack align="start" gap="1">
          <Text fontSize="lg" fontWeight="bold">
            {editItem ? 'Editar Item' : 'Crear Nuevo Item'}
          </Text>
          {/* ✅ AGREGADO: Indicador de contexto de alertas */}
          {hasAlerts && !hasCriticalAlerts && (
            <Text fontSize="sm" color="yellow.600">
              💡 {alerts.length} items necesitan reposición
            </Text>
          )}
        </VStack>
        {getFormStatusBadge()}
      </HStack>

      {/* Nombre del item */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb="2">
          Nombre del Item *
        </Text>
        <Input
          placeholder="Ej: Harina 0000, Huevos, Relleno de carne..."
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          invalid={!!errors.name}
          size="lg"
        />
        {errors.name && (
          <Text color="red.500" fontSize="sm" mt="1">
            {errors.name}
          </Text>
        )}
      </Box>

      {/* Selector de tipo */}
      <TypeSelector
        value={formData.type}
        onChange={(type) => setFormData({ 
          ...formData, 
          type, 
          unit: '' as AllUnit, 
          category: undefined,
          packaging: undefined 
        })}
        errors={errors}
      />

      {/* Campos específicos por tipo */}
      {formData.type === 'MEASURABLE' && (
        <MeasurableFields 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors} 
        />
      )}
      
      {formData.type === 'COUNTABLE' && (
        <CountableFields 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors} 
        />
      )}
      
      {formData.type === 'ELABORATED' && (
        <ElaboratedFields 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors} 
        />
      )}

      {/* Configuración avanzada */}
      <Card.Root variant="outline">
        <Card.Body p="4">
          <VStack align="stretch" gap="3">
            <HStack 
              justify="space-between" 
              cursor="pointer"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Text fontWeight="medium">Configuración Avanzada</Text>
              {showAdvanced ? 
                <ActionIcon name="chevron-up" size="sm" /> : 
                <ActionIcon name="chevron-down" size="sm" />
              }
            </HStack>

            <Collapsible.Root open={showAdvanced}>
              <Collapsible.Content>
                <VStack align="stretch" gap="4" pt="3" borderTop="1px solid" borderColor="gray.200">
                  <HStack gap="4">
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="medium" mb="2">
                        Stock Inicial
                      </Text>
                      <NumberInput.Root
                        value={formData.initial_stock?.toString() || '0'}
                        onValueChange={(details) => 
                          setFormData({ ...formData, initial_stock: parseInt(details.value) || 0 })
                        }
                        min={0}
                      >
                        <NumberInput.Control>
                          <NumberInput.Input />
                          <NumberInput.IncrementTrigger />
                          <NumberInput.DecrementTrigger />
                        </NumberInput.Control>
                      </NumberInput.Root>
                      {errors.initial_stock && (
                        <Text color="red.500" fontSize="sm" mt="1">
                          {errors.initial_stock}
                        </Text>
                      )}
                    </Box>

                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="medium" mb="2">
                        Costo Unitario
                      </Text>
                      <NumberInput.Root
                        value={formData.unit_cost?.toString() || '0'}
                        onValueChange={(details) => 
                          setFormData({ ...formData, unit_cost: parseFloat(details.value) || 0 })
                        }
                        min={0}
                        formatOptions={{
                          style: 'currency',
                          currency: 'ARS'
                        }}
                      >
                        <NumberInput.Control>
                          <NumberInput.Input />
                          <NumberInput.IncrementTrigger />
                          <NumberInput.DecrementTrigger />
                        </NumberInput.Control>
                      </NumberInput.Root>
                      {errors.unit_cost && (
                        <Text color="red.500" fontSize="sm" mt="1">
                          {errors.unit_cost}
                        </Text>
                      )}
                    </Box>
                  </HStack>

                  {formData.unit && (
                    <Alert.Root status="info" variant="subtle">
                      <Alert.Description>
                        {formData.initial_stock > 0 && formData.unit_cost > 0 && (
                          <>
                            Stock inicial: {formatQuantity(formData.initial_stock, formData.unit)} 
                            • Valor total: ${(formData.initial_stock * formData.unit_cost).toLocaleString()}
                          </>
                        )}
                      </Alert.Description>
                    </Alert.Root>
                  )}
                </VStack>
              </Collapsible.Content>
            </Collapsible.Root>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Botones de acción */}
      <HStack gap="3" justify="end" pt="4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          colorPalette="blue"
          onClick={handleSubmit}
          loading={isSubmitting}
          loadingText={editItem ? "Actualizando..." : "Creando..."}
          disabled={!formData.name || !formData.type || !formData.unit}
        >
          <ActionIcon name="save" size="sm" />
          {editItem ? "Actualizar Item" : "Crear Item"}
        </Button>
      </HStack>
    </VStack>
  );
}