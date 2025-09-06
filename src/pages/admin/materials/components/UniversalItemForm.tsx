import { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Input,
  Select,
  createListCollection,
  NumberInput,
  Button,
  CardWrapper ,
  Badge,
  Alert,
  Box,
  Textarea,
  Switch,
  Collapsible
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// ✅ IMPORTS REALES
import { useInventory } from '../logic/useInventory';
import { useRecipes } from '@/tools/intelligence/logic/useRecipes';
import {
  type ItemFormData,
  type ItemType,
  type AllUnit,
  type MeasurableUnit
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
// 🔧 COMPONENTES AUXILIARES
// ============================================================================

function TypeSelector({ 
  value, 
  onChange, 
  errors 
}: {
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
          size="lg"
        >
          <Select.Trigger>
            <Select.ValueText placeholder="Selecciona el tipo de item" />
          </Select.Trigger>
          <Select.Content>
            {ITEM_TYPE_COLLECTION.items.map(item => (
              <Select.Item key={item.value} item={item}>
                <VStack align="start" gap="1">
                  <Text>{item.label}</Text>
                  <Text fontSize="xs" color="gray.500">{item.description}</Text>
                </VStack>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        {errors.type && (
          <Text color="red.500" fontSize="sm" mt="1">
            {errors.type}
          </Text>
        )}
      </Box>
    </VStack>
  );
}

function MeasurableFields({ 
  formData, 
  setFormData, 
  errors 
}: {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  errors: Record<string, string>;
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
    <VStack align="stretch" gap="4">
      {/* Business Category */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb="2">
          Categoría del Producto *
        </Text>
        <Select.Root
          collection={CATEGORY_COLLECTION}
          value={formData.category ? [formData.category] : []}
          onValueChange={(details) => 
            setFormData({ 
              ...formData, 
              category: details.value[0]
            })
          }
          invalid={!!errors.category}
        >
          <Select.Trigger w="full">
            <Select.ValueText placeholder="¿A qué categoría pertenece?" />
          </Select.Trigger>
          <Select.Content>
            {CATEGORY_COLLECTION.items.map(item => (
              <Select.Item key={item.value} item={item}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        {errors.category && (
          <Text color="red.500" fontSize="sm" mt="1">
            {errors.category}
          </Text>
        )}
      </Box>

      {/* Measurement Unit */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb="2">
          Unidad de Medición *
        </Text>
        <Select.Root
          collection={getMeasurableUnitsCollection()}
          value={formData.unit ? [formData.unit] : []}
          onValueChange={(details) => 
            setFormData({ ...formData, unit: details.value[0] as MeasurableUnit })
          }
          invalid={!!errors.unit}
        >
          <Select.Trigger w="full">
            <Select.ValueText placeholder="Selecciona la unidad de medición" />
          </Select.Trigger>
          <Select.Content>
            {getMeasurableUnitsCollection().items.map(item => (
              <Select.Item key={item.value} item={item}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        {errors.unit && (
          <Text color="red.500" fontSize="sm" mt="1">
            {errors.unit}
          </Text>
        )}
        <Text fontSize="xs" color="gray.500" mt="1">
          La unidad determina cómo se mide este producto (peso, volumen o longitud)
        </Text>
      </Box>
    </VStack>
  );
}

function CountableFields({ 
  formData, 
  setFormData, 
  errors 
}: {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  errors: Record<string, string>;
}) {
  const [usePackaging, setUsePackaging] = useState(!!formData.packaging);

  useEffect(() => {
    // Configurar unidad por defecto para contables
    if (formData.type === 'COUNTABLE' && !formData.unit) {
      setFormData({ ...formData, unit: 'unidad' });
    }
  }, [formData.type]);

  useEffect(() => {
    if (!usePackaging) {
      setFormData({ ...formData, packaging: undefined });
    }
  }, [usePackaging]);

  return (
    <VStack align="stretch" gap="4">
      {/* Business Category */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb="2">
          Categoría del Producto *
        </Text>
        <Select.Root
          collection={CATEGORY_COLLECTION}
          value={formData.category ? [formData.category] : []}
          onValueChange={(details) => 
            setFormData({ 
              ...formData, 
              category: details.value[0]
            })
          }
          invalid={!!errors.category}
        >
          <Select.Trigger w="full">
            <Select.ValueText placeholder="¿A qué categoría pertenece?" />
          </Select.Trigger>
          <Select.Content>
            {CATEGORY_COLLECTION.items.map(item => (
              <Select.Item key={item.value} item={item}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        {errors.category && (
          <Text color="red.500" fontSize="sm" mt="1">
            {errors.category}
          </Text>
        )}
      </Box>

      {/* Info sobre contables */}
      <Alert.Root status="info" variant="subtle">
        <Alert.Indicator>
          <InformationCircleIcon className="w-4 h-4" />
        </Alert.Indicator>
        <Alert.Description>
          Items contables siempre se miden en <strong>unidades</strong>. 
          Puedes configurar packaging opcional abajo.
        </Alert.Description>
      </Alert.Root>

      {/* Packaging opcional */}
      <CardWrapper .Root variant="outline">
        <CardWrapper .Body p="4">
          <VStack align="stretch" gap="3">
            <HStack justify="space-between">
              <VStack align="start" gap="1">
                <Text fontWeight="medium">Configurar Packaging</Text>
                <Text fontSize="sm" color="gray.600">
                  Para items que vienen empaquetados (cajas, docenas, etc.)
                </Text>
              </VStack>
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
                <VStack align="stretch" gap="3" pt="3" borderTop="1px solid" borderColor="border.default">
                  <HStack gap="3">
                    <Box flex="1">
                      <Text fontSize="sm" mb="2">Tamaño del paquete</Text>
                      <NumberInput.Root
                        value={formData.packaging?.package_size?.toString() || ''}
                        onValueChange={(details) => 
                          setFormData({ 
                            ...formData, 
                            packaging: {
                              ...formData.packaging,
                              package_size: parseInt(details.value) || 0,
                              package_unit: formData.packaging?.package_unit || ''
                            }
                          })
                        }
                        min={1}
                      >
                        <NumberInput.Control>
                          <NumberInput.Input placeholder="ej: 30" />
                          <NumberInput.IncrementTrigger />
                          <NumberInput.DecrementTrigger />
                        </NumberInput.Control>
                      </NumberInput.Root>
                    </Box>
                    
                    <Box flex="1">
                      <Text fontSize="sm" mb="2">Unidad del paquete</Text>
                      <Input
                        placeholder="ej: bandeja, caja, docena"
                        value={formData.packaging?.package_unit || ''}
                        onChange={(e) => 
                          setFormData({ 
                            ...formData, 
                            packaging: {
                              ...formData.packaging,
                              package_size: formData.packaging?.package_size || 0,
                              package_unit: e.target.value
                            }
                          })
                        }
                      />
                    </Box>
                  </HStack>
                  
                  <Text fontSize="xs" color="gray.500">
                    Ejemplo: 30 huevos por bandeja, 12 unidades por docena, etc.
                  </Text>

                  {formData.packaging?.package_size && formData.packaging?.package_unit && (
                    <Alert.Root status="success" variant="subtle">
                      <Alert.Description>
                        Ejemplo: "2 {formData.packaging.package_unit}s + 5 unidades" 
                        = {(2 * formData.packaging.package_size) + 5} unidades totales
                      </Alert.Description>
                    </Alert.Root>
                  )}
                </VStack>
              </Collapsible.Content>
            </Collapsible.Root>
          </VStack>
        </CardWrapper .Body>
      </CardWrapper .Root>
    </VStack>
  );
}

function ElaboratedFields({ 
  formData, 
  setFormData, 
  errors 
}: {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  errors: Record<string, string>;
}) {
  return (
    <VStack align="stretch" gap="4">
      {/* Business Category */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb="2">
          Categoría del Producto *
        </Text>
        <Select.Root
          collection={CATEGORY_COLLECTION}
          value={formData.category ? [formData.category] : []}
          onValueChange={(details) => 
            setFormData({ 
              ...formData, 
              category: details.value[0]
            })
          }
          invalid={!!errors.category}
        >
          <Select.Trigger w="full">
            <Select.ValueText placeholder="¿A qué categoría pertenece?" />
          </Select.Trigger>
          <Select.Content>
            {CATEGORY_COLLECTION.items.map(item => (
              <Select.Item key={item.value} item={item}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        {errors.category && (
          <Text color="red.500" fontSize="sm" mt="1">
            {errors.category}
          </Text>
        )}
      </Box>

      {/* Info sobre elaborados */}
      <Alert.Root status="warning" variant="subtle">
        <Alert.Indicator>
          <ExclamationTriangleIcon className="w-4 h-4" />
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

      {/* Descripción del proceso */}
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
      <CardWrapper .Root variant="outline">
        <CardWrapper .Body p="4">
          <VStack align="stretch" gap="3">
            <Text fontWeight="medium">Configuración de Producción</Text>
            
            <HStack justify="space-between">
              <VStack align="start" gap="1">
                <Text fontSize="sm">Requiere Producción</Text>
                <Text fontSize="xs" color="gray.600">
                  Debe producirse antes de usar en otros productos
                </Text>
              </VStack>
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
        </CardWrapper .Body>
      </CardWrapper .Root>

      {/* ✅ Selector de receta funcional */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb="2">
          Receta Asociada *
        </Text>
        
        {recipesLoading ? (
          <Alert.Root status="info" variant="subtle">
            <Alert.Description>
              Cargando recetas disponibles...
            </Alert.Description>
          </Alert.Root>
        ) : recipes && recipes.length > 0 ? (
          <VStack align="stretch" gap="3">
            <Select.Root
              collection={createListCollection({
                items: [
                  { label: 'Seleccionar receta...', value: '', description: 'Elige una receta para este item elaborado' },
                  ...recipes
                    .filter(recipe => recipe.is_active)
                    .map(recipe => ({
                      label: recipe.name,
                      value: recipe.id,
                      description: `${recipe.ingredients?.length || 0} ingredientes - ${recipe.yield_quantity} ${recipe.yield_unit}`
                    }))
                ]
              })}
              value={formData.recipe_id ? [formData.recipe_id] : []}
              onValueChange={(details) => 
                setFormData({ ...formData, recipe_id: details.value[0] || undefined })
              }
              invalid={!!errors.recipe_id}
            >
              <Select.Trigger>
                <Select.ValueText placeholder="Seleccionar receta..." />
              </Select.Trigger>
              <Select.Content>
                {[
                  { label: 'Seleccionar receta...', value: '', description: 'Elige una receta para este item elaborado' },
                  ...recipes
                    .filter(recipe => recipe.is_active)
                    .map(recipe => ({
                      label: recipe.name,
                      value: recipe.id,
                      description: `${recipe.ingredients?.length || 0} ingredientes - ${recipe.yield_quantity} ${recipe.yield_unit}`
                    }))
                ].map(item => (
                  <Select.Item key={item.value} item={item}>
                    <VStack align="start" gap="1">
                      <Text>{item.label}</Text>
                      {item.description && (
                        <Text fontSize="xs" color="gray.500">{item.description}</Text>
                      )}
                    </VStack>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            
            {errors.recipe_id && (
              <Text color="red.500" fontSize="sm">
                {errors.recipe_id}
              </Text>
            )}
            
            {/* Vista previa de receta seleccionada */}
            {formData.recipe_id && (
              <CardWrapper .Root variant="outline" size="sm">
                <CardWrapper .Body p="3">
                  {(() => {
                    const selectedRecipe = recipes.find(r => r.id === formData.recipe_id);
                    if (!selectedRecipe) return null;
                    
                    return (
                      <VStack align="start" gap="2">
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm" fontWeight="medium" color="purple.600">
                            📝 {selectedRecipe.name}
                          </Text>
                          <Badge colorPalette="purple" variant="subtle" size="xs">
                            {selectedRecipe.difficulty}
                          </Badge>
                        </HStack>
                        
                        <Text fontSize="xs" color="gray.600">
                          Rinde: {selectedRecipe.yield_quantity} {selectedRecipe.yield_unit}
                        </Text>
                        
                        <Text fontSize="xs" color="gray.600">
                          Tiempo: {selectedRecipe.prep_time_minutes}min prep + {selectedRecipe.cook_time_minutes}min cocción
                        </Text>
                        
                        {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                          <VStack align="start" gap="1" w="full">
                            <Text fontSize="xs" fontWeight="medium" color="gray.700">
                              Ingredientes principales:
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {selectedRecipe.ingredients.slice(0, 3).map(ing => ing.name).join(', ')}
                              {selectedRecipe.ingredients.length > 3 && ` +${selectedRecipe.ingredients.length - 3} más...`}
                            </Text>
                          </VStack>
                        )}
                      </VStack>
                    );
                  })()}
                </CardWrapper .Body>
              </CardWrapper .Root>
            )}
          </VStack>
        ) : (
          <Alert.Root status="warning" variant="subtle">
            <Alert.Indicator>
              <ExclamationTriangleIcon className="w-4 h-4" />
            </Alert.Indicator>
            <Alert.Title>No hay recetas disponibles</Alert.Title>
            <Alert.Description>
              Necesitas crear al menos una receta activa antes de poder asignarla a un item elaborado.
              Ve a la sección de Recetas para crear una nueva.
            </Alert.Description>
          </Alert.Root>
        )}
        
        <Text fontSize="xs" color="gray.500">
          La receta determina qué ingredientes se consumirán del inventario al producir este item
        </Text>
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
  // ✅ Hook real
  const { 
    addItem, 
    updateItem, 
    alerts, 
    hasAlerts, 
    hasCriticalAlerts 
  } = useInventory();
  
  const { recipes, loading: recipesLoading } = useRecipes();
  
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

  // ✅ Badge con estado del formulario
  const getFormStatusBadge = () => {
    if (!formData.name || !formData.type) {
      return <Badge colorPalette="gray" variant="subtle">Incompleto</Badge>;
    }
    
    if (formData.type === 'MEASURABLE' && (!formData.category || !formData.unit)) {
      return <Badge colorPalette="blue" variant="subtle">Configura medición</Badge>;
    }
    
    if (formData.type === 'ELABORATED') {
      if (!formData.unit) {
        return <Badge colorPalette="purple" variant="subtle">Define unidad final</Badge>;
      }
      if (!formData.recipe_id) {
        return <Badge colorPalette="purple" variant="subtle">Selecciona receta</Badge>;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      return <Badge colorPalette="red" variant="subtle">Con errores</Badge>;
    }
    
    return <Badge colorPalette="green" variant="subtle">✓ Listo para guardar</Badge>;
  };

  // ✅ Validación mejorada
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.type) {
      newErrors.type = 'Debes seleccionar un tipo de item';
    }

    // Category is required for all item types
    if (!formData.category) {
      newErrors.category = 'Debes seleccionar una categoría';
    }

    if (formData.type === 'MEASURABLE') {
      if (!formData.unit) {
        newErrors.unit = 'Debes seleccionar una unidad específica';
      }
    }

    if (formData.type === 'ELABORATED') {
      if (!formData.unit) {
        newErrors.unit = 'Debes especificar la unidad del producto final';
      }
      if (!formData.recipe_id) {
        newErrors.recipe_id = 'Debes seleccionar una receta para items elaborados';
      }
    }

    if (formData.initial_stock < 0) {
      newErrors.initial_stock = 'El stock inicial no puede ser negativo';
    }

    if (formData.unit_cost < 0) {
      newErrors.unit_cost = 'El costo unitario no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editItem) {
        await updateItem(editItem.id, formData);
        console.log('Item actualizado:', formData.name);
      } else {
        await addItem(formData);
        console.log('Item creado:', formData.name);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar:', error);
      // TODO: Mostrar notificación de error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VStack gap="6" align="stretch" maxW="600px" mx="auto">
      {/* ✅ Banner de alertas críticas */}
      {hasCriticalAlerts && (
        <Alert.Root status="error" variant="subtle">
          <Alert.Indicator>
            <ExclamationTriangleIcon className="w-5 h-5" />
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
          packaging: undefined,
          recipe_id: undefined
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
      <CardWrapper .Root variant="outline">
        <CardWrapper .Body p="4">
          <VStack align="stretch" gap="3">
            <HStack 
              justify="space-between" 
              cursor="pointer"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Text fontWeight="medium">Configuración Avanzada</Text>
              {showAdvanced ? 
                <ChevronUpIcon className="w-4 h-4" /> : 
                <ChevronDownIcon className="w-4 h-4" />
              }
            </HStack>

            <Collapsible.Root open={showAdvanced}>
              <Collapsible.Content>
                <VStack align="stretch" gap="4" pt="3" borderTop="1px solid" borderColor="border.default">
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
                        Costo Unitario ($)
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
                </VStack>
              </Collapsible.Content>
            </Collapsible.Root>
          </VStack>
        </CardWrapper .Body>
      </CardWrapper .Root>

      {/* Botones de acción */}
      <HStack gap="3" pt="4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          flex="1"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        
        <Button 
          colorPalette="blue" 
          onClick={handleSubmit}
          loading={isSubmitting}
          loadingText="Guardando..."
          flex="2"
          disabled={!formData.name || !formData.type}
        >
          <CheckCircleIcon className="w-4 h-4" />
          {editItem ? 'Actualizar Item' : 'Crear Item'}
        </Button>
      </HStack>
    </VStack>
  );
}

export default UniversalItemForm;