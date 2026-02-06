/**
 * InputsEditorSection v3.2 - Industrial Production Order Table
 *
 * CHANGES v3.2:
 * - ✅ FIX: Resolve item from `materials` list if `input.item` is a string ID.
 * - ✅ DEBUG: Added console logs with [DEBUG_UI] tag.
 */

import { useCallback, memo, useState, useMemo, useEffect } from 'react';
import {
  Stack,
  Button,
  Alert,
  Table,
  IconButton,
  Input,
  Box,
  Flex,
  HStack,
  Text,
  Badge,
  Portal
} from '@/shared/ui';
import type { Recipe, RecipeInput } from '../../../types/recipe';
import type { RecipeBuilderFeatures } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { MaterialSelector } from '@/shared/components/MaterialSelector';
import { ProductSelector } from '@/shared/components/ProductSelector';
import type { MaterialItem } from '@/modules/materials/types';
import { DecimalUtils } from '@/lib/decimal';

// ============================================
// PROPS
// ============================================

interface InputsEditorSectionProps {
  recipe: Partial<Recipe>;
  updateRecipe: (updates: Partial<Recipe>) => void;
  entityType: 'material' | 'product' | 'kit' | 'service';
  features: Required<RecipeBuilderFeatures>;
  materials: MaterialItem[];
  materialsLoading?: boolean;
}

// ============================================
// HELPER COMPONENTS
// ============================================

const StockLED = memo(function StockLED({
  stock,
  required
}: {
  stock?: number;
  required: number;
}) {
  const status =
    stock === undefined || stock === null
      ? 'unknown'
      : stock >= required
        ? 'ok'
        : stock > 0
          ? 'low'
          : 'critical';

  const colorPalette = status === 'ok' ? 'green' : status === 'low' ? 'orange' : 'red';

  return (
    <Box
      w="8px"
      h="8px"
      borderRadius="full"
      bg={`var(--chakra-colors-${colorPalette}-500)`}
      boxShadow={`0 0 8px var(--chakra-colors-${colorPalette}-500)`}
      css={{
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 }
        },
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
    />
  );
});

const ProgressBar = memo(function ProgressBar({ percentage }: { percentage: number }) {
  const filled = Math.round((percentage / 100) * 5);
  const empty = 5 - filled;
  const blocks = '▓'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty));

  return (
    <Text
      fontFamily="mono"
      fontSize="xs"
      color="fg.muted"
      letterSpacing="tighter"
    >
      {blocks} {percentage.toFixed(1)}%
    </Text>
  );
});

// ============================================
// COMPONENT
// ============================================

function InputsEditorSectionComponent(props: InputsEditorSectionProps) {
  const { recipe, updateRecipe, entityType, materials, materialsLoading } = props;
  const inputs = useMemo(() => recipe.inputs ?? [], [recipe.inputs]);
  const [inputMode, setInputMode] = useState<'material' | 'product'>('material');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // DEBUG LOGS
  useEffect(() => {
    console.log('[DEBUG_UI] Inputs updated:', inputs);
    console.log('[DEBUG_UI] Materials available:', materials.length);
  }, [inputs, materials]);

  // ============================================
  // CALCULATIONS / RESOLUTION
  // ============================================

  // Helper to resolve item object even if it's just an ID
  const resolveItem = useCallback((inputItem: any) => {
    if (!inputItem) return null;
    if (typeof inputItem === 'object') return inputItem;
    // It's a string ID
    const foundMaterial = materials.find(m => m.id === inputItem);
    if (foundMaterial) {
      return {
        id: foundMaterial.id,
        name: foundMaterial.name,
        type: foundMaterial.type, // 'MEASURABLE' | 'COUNTABLE' | ...
        unit: foundMaterial.unit,
        currentStock: foundMaterial.stock,
        unitCost: foundMaterial.unit_cost
      };
    }
    return null;
  }, [materials]);

  const costSummary = useMemo(() => {
    const inputsWithCosts = inputs.map((input) => {
      const item = resolveItem(input.item);
      const quantity = input.quantity || 0;
      const unitCost = item?.unitCost || 0;

      const totalCost = DecimalUtils.multiply(
        quantity.toString(),
        unitCost.toString(),
        'financial'
      ).toNumber();

      return {
        ...input,
        _resolvedItem: item, // Attach resolved item for rendering
        unitCost,
        totalCost
      };
    });

    const totalMaterialsCost = inputsWithCosts.reduce((sum, input) => {
      return DecimalUtils.add(sum.toString(), input.totalCost.toString(), 'financial').toNumber();
    }, 0);

    const inputsWithPercentages = inputsWithCosts.map((input) => ({
      ...input,
      percentage:
        totalMaterialsCost > 0
          ? DecimalUtils.multiply(
            DecimalUtils.divide(
              input.totalCost.toString(),
              totalMaterialsCost.toString(),
              'financial'
            ).toString(),
            '100',
            'financial'
          ).toNumber()
          : 0
    }));

    return {
      inputs: inputsWithPercentages,
      totalMaterialsCost
    };
  }, [inputs, resolveItem]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleAddInput = useCallback(() => {
    const newId = `input_${Date.now()}`;
    const newInput: RecipeInput = {
      id: newId,
      item: '',
      quantity: 1,
      unit: 'unit'
    };
    updateRecipe({ inputs: [...inputs, newInput] });
    setEditingRowId(newId);
  }, [inputs, updateRecipe]);

  const handleUpdateInput = useCallback(
    (index: number, updates: Partial<RecipeInput>) => {
      const updated = [...inputs];
      updated[index] = { ...updated[index], ...updates };
      console.log('[DEBUG_UI] Updating input at index', index, updates);
      updateRecipe({ inputs: updated });
    },
    [inputs, updateRecipe]
  );

  const handleRemoveInput = useCallback(
    (index: number) => {
      const updated = inputs.filter((_, i) => i !== index);
      updateRecipe({ inputs: updated });
      if (editingRowId && inputs[index].id === editingRowId) {
        setEditingRowId(null);
      }
    },
    [inputs, updateRecipe, editingRowId]
  );

  const handleMaterialSelect = useCallback(
    (index: number, material: MaterialItem) => {
      console.log('[DEBUG_UI] Selected Material:', material.name, material.type);

      let defaultUnit = 'unit';
      if (material.type === 'MEASURABLE') defaultUnit = material.unit;
      if (material.type === 'ELABORATED') defaultUnit = 'porción';

      handleUpdateInput(index, {
        item: {
          id: material.id,
          name: material.name,
          type: material.type, // Persist type!
          unit: material.unit,
          currentStock: material.stock,
          unitCost: material.unit_cost
        },
        unit: defaultUnit,
        quantity: 1
      });
    },
    [handleUpdateInput]
  );

  const handleProductSelect = useCallback(
    (index: number, product: any) => {
      handleUpdateInput(index, {
        item: {
          id: product.id,
          name: product.name,
          type: 'product',
          unit: product.unit || 'unit',
          unitCost: product.final_cost || product.unit_cost
        },
        unit: product.unit || 'unit',
        quantity: 1
      });
    },
    [handleUpdateInput]
  );

  const toggleEditRow = (id: string) => {
    setEditingRowId(prev => prev === id ? null : id);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <Box
      position="relative"
      p="6"
      bg="bg.panel"
      borderWidth="3px"
      borderColor="border.emphasized"
      borderRadius="xl"
      boxShadow="lg"
      css={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '4px',
          background: 'linear-gradient(90deg, var(--chakra-colors-blue-emphasized), var(--chakra-colors-blue-fg))',
          borderTopLeftRadius: 'var(--chakra-radii-xl)',
          borderTopRightRadius: 'var(--chakra-radii-xl)'
        }
      }}
    >
      <Stack gap="4">
        <Flex justify="space-between" align="center">
          <Text fontSize="xs" fontWeight="800" color="fg.muted" letterSpacing="widest" textTransform="uppercase">
            Materiales / Componentes
          </Text>
          {(entityType === 'product' || entityType === 'kit') && (
            <HStack gap="2">
              <Button size="xs" variant={inputMode === 'material' ? 'solid' : 'outline'} onClick={() => setInputMode('material')} colorPalette="blue">
                MATERIALES
              </Button>
              <Button size="xs" variant={inputMode === 'product' ? 'solid' : 'outline'} onClick={() => setInputMode('product')} colorPalette="blue">
                PRODUCTOS
              </Button>
            </HStack>
          )}
        </Flex>

        {inputs.length === 0 ? (
          <Alert.Root status="info" variant="subtle">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                No hay materiales agregados. Haz clic en "AGREGAR LÍNEA" para comenzar.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        ) : (
          <Box borderWidth="2px" borderColor="border.default" borderRadius="md">
            <Table.Root variant="outline" size="sm">
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader width="40px"><Text fontSize="2xs" fontWeight="700" letterSpacing="wider" textTransform="uppercase" color="fg.muted">#</Text></Table.ColumnHeader>
                  <Table.ColumnHeader width="40%"><Text fontSize="2xs" fontWeight="700" letterSpacing="wider" textTransform="uppercase" color="fg.muted">Material</Text></Table.ColumnHeader>
                  <Table.ColumnHeader width="15%"><Text fontSize="2xs" fontWeight="700" letterSpacing="wider" textTransform="uppercase" color="fg.muted">Cant.</Text></Table.ColumnHeader>
                  <Table.ColumnHeader width="15%"><Text fontSize="2xs" fontWeight="700" letterSpacing="wider" textTransform="uppercase" color="fg.muted">Unid</Text></Table.ColumnHeader>
                  <Table.ColumnHeader><Text fontSize="2xs" fontWeight="700" letterSpacing="wider" textTransform="uppercase" color="fg.muted">Total</Text></Table.ColumnHeader>
                  <Table.ColumnHeader><Text fontSize="2xs" fontWeight="700" letterSpacing="wider" textTransform="uppercase" color="fg.muted">%</Text></Table.ColumnHeader>
                  <Table.ColumnHeader width="80px"><Text fontSize="2xs" fontWeight="700" letterSpacing="wider" textTransform="uppercase" color="fg.muted">Acciones</Text></Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {costSummary.inputs.map((input, index) => {
                  const isEditing = editingRowId === input.id;
                  const item = input._resolvedItem; // USE RESOLVED ITEM
                  const itemName = item?.name;

                  // Debug row data
                  if (isEditing) {
                    console.log(`[DEBUG_UI] Row ${index} Edit Mode. Item:`, itemName, 'Type:', item?.type, 'Unit:', input.unit);
                  }

                  return (
                    <Table.Row key={input.id} bg={isEditing ? 'blue.50' : undefined}>
                      <Table.Cell>
                        <Text fontFamily="mono" fontSize="sm" fontWeight="600" color="fg.muted">
                          {String(index + 1).padStart(2, '0')}
                        </Text>
                      </Table.Cell>

                      {/* Material Selector */}
                      <Table.Cell>
                        {isEditing ? (
                          <Box minW="200px">
                            {inputMode === 'material' ? (
                              <MaterialSelector
                                items={materials}
                                loading={materialsLoading}
                                onSelect={(material) => handleMaterialSelect(index, material)}
                                selectedMaterialIds={
                                  inputs
                                    .map((i) => (typeof i.item === 'object' ? i.item?.id : String(i.item)))
                                    .filter(Boolean) as string[]
                                }
                                autoFocus={!item}
                                placeholder="Buscar materia prima..."
                                aria-label="Buscar materia prima"
                                initialValue={itemName || ''}
                              />
                            ) : (
                              <ProductSelector
                                onProductSelected={(product) => handleProductSelect(index, product)}
                                placeholder="Buscar producto..."
                                excludeIds={
                                  inputs
                                    .map((i) => (typeof i.item === 'object' ? i.item?.id : String(i.item)))
                                    .filter(Boolean) as string[]
                                }
                                showCost={true}
                              />
                            )}
                          </Box>
                        ) : (
                          <Flex align="center" gap="2">
                            {item && itemName ? (
                              <>
                                <StockLED stock={item.currentStock} required={input.quantity || 0} />
                                <Stack gap="0">
                                  <Text fontSize="sm" fontWeight="600" color="fg.default">{itemName}</Text>
                                  <Text fontSize="2xs" color="fg.muted">{item.unitCost ? `$${item.unitCost.toFixed(2)}/u` : '-'}</Text>
                                </Stack>
                              </>
                            ) : (
                              <Text fontSize="sm" color="fg.muted" fontStyle="italic">Seleccionar...</Text>
                            )}
                          </Flex>
                        )}
                      </Table.Cell>

                      {/* Quantity */}
                      <Table.Cell>
                        {isEditing ? (
                          <Input
                            size="xs"
                            type="number"
                            min="0"
                            step="0.01"
                            value={input.quantity}
                            onChange={(e) => handleUpdateInput(index, { quantity: parseFloat(e.target.value) || 0 })}
                            aria-label="Cantidad"
                            css={{ fontFamily: 'var(--chakra-fonts-mono)', fontWeight: '600' }}
                          />
                        ) : (
                          <Text fontFamily="mono" fontSize="sm" fontWeight="600">{input.quantity}</Text>
                        )}
                      </Table.Cell>

                      {/* Unit */}
                      <Table.Cell>
                        {isEditing ? (
                          (() => {
                            const isMeasurable = item?.type === 'MEASURABLE';
                            if (isMeasurable && item?.unit) {
                              let options: string[] = [item.unit];
                              if (item.unit === 'kg') options = ['kg', 'g'];
                              else if (item.unit === 'g') options = ['g', 'kg'];
                              else if (item.unit === 'l') options = ['l', 'ml'];
                              else if (item.unit === 'ml') options = ['ml', 'l'];

                              return (
                                <Box position="relative" w="full">
                                  <select
                                    value={input.unit}
                                    onChange={(e) => handleUpdateInput(index, { unit: e.target.value })}
                                    aria-label="Unidad"
                                    style={{
                                      width: '100%',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      border: '1px solid var(--chakra-colors-border-default)',
                                      backgroundColor: 'var(--chakra-colors-bg-panel)',
                                      fontSize: 'var(--chakra-fontSizes-xs)',
                                      fontFamily: 'var(--chakra-fonts-mono)',
                                      appearance: 'none',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                                </Box>
                              );
                            } else {
                              const displayUnit = (input.quantity === 1 || !input.quantity) ? 'unidad' : 'unidades';
                              return (
                                <Text fontFamily="mono" fontSize="xs" color="fg.muted" py="1" textAlign="center" cursor="not-allowed">
                                  {displayUnit}
                                </Text>
                              );
                            }
                          })()
                        ) : (
                          <Text fontFamily="mono" fontSize="sm" color="fg.muted">
                            {item?.type === 'COUNTABLE'
                              ? ((input.quantity === 1 || !input.quantity) ? 'unidad' : 'unidades')
                              : input.unit}
                          </Text>
                        )}
                      </Table.Cell>

                      <Table.Cell>
                        <Text fontFamily="mono" fontSize="sm" fontWeight="600" color="fg.emphasized">${input.totalCost.toFixed(2)}</Text>
                      </Table.Cell>
                      <Table.Cell><ProgressBar percentage={input.percentage} /></Table.Cell>
                      <Table.Cell>
                        <HStack gap="1">
                          {isEditing ? (
                            <IconButton size="xs" colorPalette="green" onClick={() => toggleEditRow(input.id)} aria-label="Confirmar">
                              <CheckIcon className="w-4 h-4" />
                            </IconButton>
                          ) : (
                            <IconButton size="xs" variant="ghost" colorPalette="blue" onClick={() => toggleEditRow(input.id)} aria-label="Editar">
                              <PencilIcon className="w-4 h-4" />
                            </IconButton>
                          )}
                          <IconButton size="xs" variant="ghost" colorPalette="red" onClick={() => handleRemoveInput(index)} aria-label="Eliminar">
                            <TrashIcon className="w-4 h-4" />
                          </IconButton>
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        <Button variant="outline" onClick={handleAddInput} colorPalette="blue" data-testid="recipe-add-input-button">
          <PlusIcon className="w-4 h-4" />
          AGREGAR LÍNEA
        </Button>

        {inputs.length > 0 && (
          <Box textAlign="right" pt="3" borderTopWidth="2px" borderTopColor="border.subtle">
            <Text fontSize="sm" fontWeight="800" fontFamily="mono" color="fg.emphasized" letterSpacing="wider">
              SUBTOTAL MATERIALES: ${costSummary.totalMaterialsCost.toFixed(2)}
            </Text>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export const InputsEditorSection = memo(InputsEditorSectionComponent);
