/**
 * MATERIALS SECTION - Redesigned v2.0
 *
 * Sección condicional para agregar materiales/ingredientes al producto.
 * Visible para: physical_product, service, rental (si feature 'inventory_stock_tracking' activa)
 *
 * ✅ Compact table layout
 * ✅ Quick add row
 * ✅ Real-time cost calculation
 * ✅ ModuleRegistry integration
 *
 * @design PRODUCTS_FORM_SECTIONS_SPEC.md - Section 3
 * @pattern Cross-Module Data Fetching via ModuleRegistry.getExports()
 */

import { useState } from 'react';
import { Stack, Switch, Button, IconButton, Text, Box, HStack, Alert, Icon, SelectField, NumberField, Table } from '@/shared/ui';
import type { FormSectionProps, MaterialsFields, ProductComponent, ProductType } from '../../types/productForm';
import { calculateMaterialsCost, calculateComponentCost } from '../../services/productCostCalculation';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ModuleRegistry } from '@/lib/modules';
import type { MaterialsAPI } from '@/modules/materials/manifest';

interface MaterialsSectionProps extends Omit<FormSectionProps, 'data' | 'onChange'> {
  data: MaterialsFields;
  productType: ProductType;
  onChange: (data: MaterialsFields) => void;
}

export function MaterialsSection({
  data,
  productType,
  onChange,
  errors = [],
  readOnly = false
}: MaterialsSectionProps) {
  // ✅ CROSS-MODULE DATA FETCHING via ModuleRegistry
  const registry = ModuleRegistry.getInstance();
  const materialsModule = registry.getExports<MaterialsAPI>('materials');
  const useMaterialsList = materialsModule?.hooks?.useMaterialsList;
  const materialsHook = useMaterialsList ? useMaterialsList() : null;
  const { items: materials = [], loading: materialsLoading } = materialsHook || { items: [], loading: false };

  // Quick add state
  const [quickAddMaterialId, setQuickAddMaterialId] = useState<string>('');
  const [quickAddQuantity, setQuickAddQuantity] = useState<number>(1);

  // Handle field changes
  const handleChange = <K extends keyof MaterialsFields>(
    field: K,
    value: MaterialsFields[K]
  ) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Handle component changes
  const updateComponent = (index: number, updated: ProductComponent) => {
    const components = [...(data.components || [])];
    components[index] = updated;
    handleChange('components', components);
  };

  const removeComponent = (index: number) => {
    const components = [...(data.components || [])];
    components.splice(index, 1);
    handleChange('components', components);
  };

  // ✅ Quick add handler
  const handleQuickAdd = () => {
    if (!quickAddMaterialId) return;

    const material = materials.find(m => m.id === quickAddMaterialId);
    if (!material) return;

    const components = [...(data.components || [])];
    components.push({
      material_id: quickAddMaterialId,
      material_name: material.name,
      quantity: quickAddQuantity,
      unit: material.unit,
      unit_cost: material.unit_cost,
      // ✅ PRECISION FIX: Use service layer calculation instead of UI calculation
      total_cost: calculateComponentCost(quickAddQuantity || 0, material.unit_cost || 0)
    });

    handleChange('components', components);

    // Reset quick add
    setQuickAddMaterialId('');
    setQuickAddQuantity(1);
  };

  // Calculate total cost
  const totalCost = data.components ? calculateMaterialsCost(data.components) : 0;

  // Prepare material options
  const materialOptions = materials
    .filter(m => m.is_active !== false)
    .map(m => ({
      value: m.id,
      label: `${m.name}${m.unit ? ` (${m.unit})` : ''}${m.unit_cost ? ` - $${m.unit_cost}` : ''}`
    }));

  // Get helper text based on product type
  const getHelperText = () => {
    switch (productType) {
      case 'physical_product':
        return 'Ingredientes para preparación o componentes del producto';
      case 'service':
        return 'Materiales utilizados durante el servicio (ej: tinte, shampoo)';
      case 'rental':
        return 'Consumibles incluidos en el alquiler (ej: combustible)';
      default:
        return 'Materiales o ingredientes que usa este producto';
    }
  };

  return (
    <Stack gap={4}>
      {/* Toggle principal */}
      <Stack gap={2}>
        <Switch
          checked={data.has_materials || false}
          onCheckedChange={(e) => handleChange('has_materials', e.checked)}
          disabled={readOnly}
        >
          Este producto usa materiales o ingredientes
        </Switch>
        <Text color="fg.muted" fontSize="sm">
          {getHelperText()}
        </Text>
      </Stack>

      {data.has_materials && (
        <Stack gap={4}>
          {/* ✅ Compact Table Layout */}
          {data.components && data.components.length > 0 ? (
            <Box borderWidth="1px" borderRadius="md" overflow="hidden">
              <Table.Root size="sm" variant="outline">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Material</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Cantidad</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Precio Unit.</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Subtotal</Table.ColumnHeader>
                    <Table.ColumnHeader width="50px"></Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.components.map((component, index) => (
                    <MaterialTableRow
                      key={index}
                      component={component}
                      materials={materials}
                      materialsLoading={materialsLoading}
                      onUpdate={(updated) => updateComponent(index, updated)}
                      onRemove={() => removeComponent(index)}
                      readOnly={readOnly}
                    />
                  ))}

                  {/* Total Row */}
                  <Table.Row bg="bg.muted">
                    <Table.Cell colSpan={3} textAlign="right" fontWeight="bold">
                      Total Materiales:
                    </Table.Cell>
                    <Table.Cell textAlign="right" fontWeight="bold" fontSize="lg">
                      ${totalCost.toFixed(2)}
                    </Table.Cell>
                    <Table.Cell></Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            </Box>
          ) : (
            <Alert.Root status="info" variant="subtle">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Sin materiales</Alert.Title>
                <Alert.Description>
                  Agrega los materiales que usa este producto usando el formulario de abajo
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* ✅ Quick Add Row */}
          {!readOnly && (
            <Box borderWidth="1px" borderRadius="md" p={3} bg="bg.subtle">
              <Stack gap={3}>
                <Text fontWeight="medium" fontSize="sm">
                  Agregar Material
                </Text>
                <HStack gap={2}>
                  <Box flex={2}>
                    <SelectField
                      placeholder={materialsLoading ? "Cargando..." : "Selecciona un material"}
                      value={quickAddMaterialId ? [quickAddMaterialId] : []}
                      onValueChange={(details) => setQuickAddMaterialId(details.value[0] || '')}
                      disabled={materialsLoading}
                      options={materialOptions}
                      size="sm"
                    />
                  </Box>
                  <Box flex={1}>
                    <NumberField
                      step={0.01}
                      min={0.01}
                      placeholder="Cantidad"
                      value={quickAddQuantity}
                      onChange={(val) => setQuickAddQuantity(val)}
                      size="sm"
                    />
                  </Box>
                  <Button
                    variant="solid"
                    colorPalette="blue"
                    size="sm"
                    onClick={handleQuickAdd}
                    disabled={!quickAddMaterialId || quickAddQuantity <= 0}
                  >
                    <Icon icon={PlusIcon} />
                    Agregar
                  </Button>
                </HStack>
              </Stack>
            </Box>
          )}

          {/* Cost calculation info */}
          {data.components && data.components.length > 0 && (
            <Text fontSize="xs" color="fg.muted">
              💡 Los costos se calculan automáticamente según los precios actuales en inventario
            </Text>
          )}
        </Stack>
      )}
    </Stack>
  );
}

/**
 * Material Table Row - Inline editable row
 */
interface MaterialTableRowProps {
  component: ProductComponent;
  materials: any[];
  materialsLoading: boolean;
  onUpdate: (component: ProductComponent) => void;
  onRemove: () => void;
  readOnly?: boolean;
}

function MaterialTableRow({
  component,
  materials,
  materialsLoading,
  onUpdate,
  onRemove,
  readOnly = false
}: MaterialTableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const selectedMaterial = materials.find(m => m.id === component.material_id);

  // Prepare options for editing
  const materialOptions = materials
    .filter(m => m.is_active !== false)
    .map(m => ({
      value: m.id,
      label: `${m.name}${m.unit ? ` (${m.unit})` : ''}${m.unit_cost ? ` - $${m.unit_cost}` : ''}`
    }));

  // ✅ PRECISION FIX: Use service layer calculation instead of UI calculation
  const subtotal = calculateComponentCost(component.quantity || 0, component.unit_cost || 0);

  if (isEditing && !readOnly) {
    return (
      <Table.Row>
        <Table.Cell>
          <SelectField
            value={component.material_id ? [component.material_id] : []}
            onValueChange={(details) => {
              const newMaterialId = details.value[0];
              const material = materials.find(m => m.id === newMaterialId);
              onUpdate({
                ...component,
                material_id: newMaterialId,
                material_name: material?.name,
                unit: material?.unit,
                unit_cost: material?.unit_cost
              });
            }}
            disabled={materialsLoading}
            options={materialOptions}
            size="sm"
          />
        </Table.Cell>
        <Table.Cell>
          <NumberField
            step={0.01}
            min={0}
            value={component.quantity || 0}
            onChange={(val) => onUpdate({ ...component, quantity: val })}
            size="sm"
          />
        </Table.Cell>
        <Table.Cell textAlign="right">
          <Text fontSize="sm">${(component.unit_cost || 0).toFixed(2)}</Text>
        </Table.Cell>
        <Table.Cell textAlign="right">
          <Text fontWeight="medium">${subtotal.toFixed(2)}</Text>
        </Table.Cell>
        <Table.Cell>
          <HStack gap={1}>
            <Button size="xs" variant="ghost" onClick={() => setIsEditing(false)}>
              ✓
            </Button>
            <IconButton
              variant="ghost"
              colorPalette="red"
              size="xs"
              onClick={onRemove}
              aria-label="Eliminar"
            >
              <Icon icon={TrashIcon} />
            </IconButton>
          </HStack>
        </Table.Cell>
      </Table.Row>
    );
  }

  return (
    <Table.Row
      cursor={readOnly ? 'default' : 'pointer'}
      onClick={() => !readOnly && setIsEditing(true)}
      _hover={readOnly ? {} : { bg: 'bg.subtle' }}
    >
      <Table.Cell>
        <Stack gap={0}>
          <Text fontWeight="medium" fontSize="sm">
            {selectedMaterial?.name || component.material_name || 'Material desconocido'}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            {component.unit || 'unidad'}
          </Text>
        </Stack>
      </Table.Cell>
      <Table.Cell textAlign="right">
        <Text fontSize="sm">{component.quantity || 0}</Text>
      </Table.Cell>
      <Table.Cell textAlign="right">
        <Text fontSize="sm">${(component.unit_cost || 0).toFixed(2)}</Text>
      </Table.Cell>
      <Table.Cell textAlign="right">
        <Text fontWeight="medium">${subtotal.toFixed(2)}</Text>
      </Table.Cell>
      <Table.Cell>
        {!readOnly && (
          <IconButton
            variant="ghost"
            colorPalette="red"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Eliminar"
          >
            <Icon icon={TrashIcon} />
          </IconButton>
        )}
      </Table.Cell>
    </Table.Row>
  );
}
