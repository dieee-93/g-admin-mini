/**
 * InputsEditorSection v3.0 - Industrial Production Order Table
 *
 * REDESIGNED with "Industrial Manufacturing" aesthetics:
 * - Heavy 3px borders and professional spreadsheet layout
 * - Inline MaterialSelector integration (no modals)
 * - LED stock indicators with pulsing animations
 * - Progress bars for cost % distribution
 * - Monospace typography for numbers
 * - Uppercase headers with wide letter-spacing
 * - Invoice-style subtotal at bottom
 *
 * Architecture:
 * - Receives props (no context) following project pattern
 * - Uses @/shared/ui imports exclusively
 * - Semantic tokens for theming
 * - DecimalUtils for calculations
 */

import { useCallback, memo, useState, useMemo } from 'react';
import {
  Stack,
  Button,
  Alert,
  Table,
  IconButton,
  Input,
  Badge,
  Typography,
  Box,
  Flex,
  HStack
} from '@/shared/ui';
import type { Recipe, RecipeInput } from '../../../types/recipe';
import type { RecipeBuilderFeatures } from '../types';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
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

/**
 * Industrial LED Status Indicator
 */
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
      bg="colorPalette.solid"
      colorPalette={colorPalette}
      boxShadow={`0 0 8px var(--chakra-colors-${colorPalette}-emphasized)`}
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

/**
 * Progress Bar using block characters
 */
const ProgressBar = memo(function ProgressBar({ percentage }: { percentage: number }) {
  const filled = Math.round((percentage / 100) * 5); // 0-5 blocks
  const empty = 5 - filled;
  const blocks = '▓'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty));

  return (
    <Typography
      fontFamily="mono"
      fontSize="xs"
      color="fg.muted"
      letterSpacing="tighter"
    >
      {blocks} {percentage.toFixed(1)}%
    </Typography>
  );
});

// ============================================
// COMPONENT
// ============================================

/**
 * InputsEditorSection v3.0 - Industrial production order table
 *
 * @component
 * @description
 * Industrial-styled table editor for recipe inputs (materials/products).
 * Features heavy borders, LED stock indicators, progress bars, and
 * monospace typography for a professional manufacturing aesthetic.
 *
 * Design:
 * - Columns: # | Material | Qty | Unit | P.Unit | Total | %
 * - Stock LEDs with pulsing animation
 * - Progress bars for cost distribution
 * - Uppercase headers with wide letter-spacing
 * - Monospace numbers
 * - Invoice-style subtotal
 *
 * @param {InputsEditorSectionProps} props - Component props
 * @returns {React.ReactElement} Rendered section
 */
function InputsEditorSectionComponent(props: InputsEditorSectionProps) {
  const { recipe, updateRecipe, entityType, features, materials, materialsLoading } = props;

  // Wrap inputs in useMemo to prevent useCallback dependencies changing
  const inputs = useMemo(() => recipe.inputs ?? [], [recipe.inputs]);

  // Input mode state (material vs product)
  const [inputMode, setInputMode] = useState<'material' | 'product'>('material');

  // ============================================
  // CALCULATIONS
  // ============================================

  // Calculate total materials cost and percentages
  const costSummary = useMemo(() => {
    const inputsWithCosts = inputs.map((input) => {
      const quantity = input.quantity || 0;
      const unitCost =
        typeof input.item === 'object' && input.item?.unitCost !== undefined
          ? input.item.unitCost
          : 0;

      const totalCost = DecimalUtils.multiply(
        quantity.toString(),
        unitCost.toString(),
        'financial'
      ).toNumber();

      return {
        ...input,
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
  }, [inputs]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleAddInput = useCallback(() => {
    const newInput: RecipeInput = {
      id: `input_${Date.now()}`,
      item: '',
      quantity: 1,
      unit: 'unit'
    };

    updateRecipe({
      inputs: [...inputs, newInput]
    });
  }, [inputs, updateRecipe]);

  const handleUpdateInput = useCallback(
    (index: number, updates: Partial<RecipeInput>) => {
      const updated = [...inputs];
      updated[index] = { ...updated[index], ...updates };
      updateRecipe({ inputs: updated });
    },
    [inputs, updateRecipe]
  );

  const handleRemoveInput = useCallback(
    (index: number) => {
      const updated = inputs.filter((_, i) => i !== index);
      updateRecipe({ inputs: updated });
    },
    [inputs, updateRecipe]
  );

  const handleMaterialSelect = useCallback(
    (index: number, material: MaterialItem, quantity: number, unit: string) => {
      handleUpdateInput(index, {
        item: {
          id: material.id,
          name: material.name,
          type: 'material',
          unit: material.unit,
          currentStock: material.stock,
          unitCost: material.unit_cost
        },
        quantity,
        unit
      });
    },
    [handleUpdateInput]
  );

  const handleProductSelect = useCallback(
    (
      index: number,
      product: {
        id: string;
        name: string;
        unit?: string;
        final_cost?: number;
        unit_cost?: number;
      }
    ) => {
      handleUpdateInput(index, {
        item: {
          id: product.id,
          name: product.name,
          type: 'product',
          unit: product.unit || 'unit',
          unitCost: product.final_cost || product.unit_cost
        }
      });
    },
    [handleUpdateInput]
  );

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
          background:
            'linear-gradient(90deg, var(--chakra-colors-blue-emphasized), var(--chakra-colors-blue-fg))',
          borderTopLeftRadius: 'var(--chakra-radii-xl)',
          borderTopRightRadius: 'var(--chakra-radii-xl)'
        }
      }}
    >
      <Stack gap="4">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Typography
            fontSize="xs"
            fontWeight="800"
            color="fg.muted"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            Materiales / Componentes
          </Typography>

          {/* Input Mode Toggle */}
          {(entityType === 'product' || entityType === 'kit') && (
            <HStack gap="2">
              <Button
                size="xs"
                variant={inputMode === 'material' ? 'solid' : 'outline'}
                onClick={() => setInputMode('material')}
                colorPalette="blue"
              >
                MATERIALES
              </Button>
              <Button
                size="xs"
                variant={inputMode === 'product' ? 'solid' : 'outline'}
                onClick={() => setInputMode('product')}
                colorPalette="blue"
              >
                PRODUCTOS
              </Button>
            </HStack>
          )}
        </Flex>

        {/* Industrial Table */}
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
          <Box
            borderWidth="2px"
            borderColor="border.default"
            borderRadius="md"
            overflow="hidden"
          >
            <Table.Root variant="outline" size="sm">
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader>
                    <Typography
                      fontSize="2xs"
                      fontWeight="700"
                      letterSpacing="wider"
                      textTransform="uppercase"
                      color="fg.muted"
                    >
                      #
                    </Typography>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    <Typography
                      fontSize="2xs"
                      fontWeight="700"
                      letterSpacing="wider"
                      textTransform="uppercase"
                      color="fg.muted"
                    >
                      Material
                    </Typography>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    <Typography
                      fontSize="2xs"
                      fontWeight="700"
                      letterSpacing="wider"
                      textTransform="uppercase"
                      color="fg.muted"
                    >
                      Cant.
                    </Typography>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    <Typography
                      fontSize="2xs"
                      fontWeight="700"
                      letterSpacing="wider"
                      textTransform="uppercase"
                      color="fg.muted"
                    >
                      Unid
                    </Typography>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    <Typography
                      fontSize="2xs"
                      fontWeight="700"
                      letterSpacing="wider"
                      textTransform="uppercase"
                      color="fg.muted"
                    >
                      P.Unit
                    </Typography>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    <Typography
                      fontSize="2xs"
                      fontWeight="700"
                      letterSpacing="wider"
                      textTransform="uppercase"
                      color="fg.muted"
                    >
                      Total
                    </Typography>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    <Typography
                      fontSize="2xs"
                      fontWeight="700"
                      letterSpacing="wider"
                      textTransform="uppercase"
                      color="fg.muted"
                    >
                      %
                    </Typography>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    <Typography
                      fontSize="2xs"
                      fontWeight="700"
                      letterSpacing="wider"
                      textTransform="uppercase"
                      color="fg.muted"
                    >
                      Acciones
                    </Typography>
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {costSummary.inputs.map((input, index) => (
                  <Table.Row key={input.id}>
                    {/* Line Number */}
                    <Table.Cell>
                      <Typography
                        fontFamily="mono"
                        fontSize="sm"
                        fontWeight="600"
                        color="fg.muted"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </Typography>
                    </Table.Cell>

                    {/* Material - Inline Selector */}
                    <Table.Cell>
                      <Box minW="200px">
                        {typeof input.item === 'object' && input.item?.name ? (
                          // Material selected - show info with LED and change option
                          <Stack gap="1">
                            <Flex align="center" gap="2" justify="space-between">
                              <HStack gap="2" flex="1" minW="0">
                                <StockLED
                                  stock={input.item.currentStock}
                                  required={input.quantity || 0}
                                />
                                <Typography
                                  fontSize="sm"
                                  fontWeight="600"
                                  color="fg.default"
                                  lineClamp={1}
                                >
                                  {input.item.name}
                                </Typography>
                              </HStack>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => handleUpdateInput(index, { item: '' })}
                              >
                                Cambiar
                              </Button>
                            </Flex>
                            {input.item.currentStock !== undefined && (
                              <Typography
                                fontSize="xs"
                                color="fg.muted"
                                fontFamily="mono"
                              >
                                Stock: {input.item.currentStock} {input.item.unit || 'units'}
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          // Not selected - show dynamic selector
                          <>
                            {inputMode === 'material' ? (
                              <MaterialSelector
                                items={materials}
                                loading={materialsLoading}
                                onSelect={(material, quantity, unit) =>
                                  handleMaterialSelect(index, material, quantity, unit)
                                }
                                selectedMaterialIds={
                                  inputs
                                    .map((i) => (typeof i.item === 'object' ? i.item?.id : ''))
                                    .filter(Boolean) as string[]
                                }
                                filterByStock={false}
                              />
                            ) : (
                              <ProductSelector
                                onProductSelected={(product) =>
                                  handleProductSelect(index, product)
                                }
                                placeholder="Buscar producto..."
                                excludeIds={
                                  inputs
                                    .map((i) => (typeof i.item === 'object' ? i.item?.id : ''))
                                    .filter(Boolean) as string[]
                                }
                                showCost={true}
                                showStock={false}
                              />
                            )}
                          </>
                        )}
                      </Box>
                    </Table.Cell>

                    {/* Quantity */}
                    <Table.Cell>
                      {typeof input.item === 'object' && input.item?.name ? (
                        <Input
                          size="sm"
                          type="number"
                          min="0"
                          step="0.01"
                          value={input.quantity}
                          onChange={(e) =>
                            handleUpdateInput(index, {
                              quantity: parseFloat(e.target.value) || 0
                            })
                          }
                          data-testid={`recipe-input-quantity-${index}`}
                          css={{
                            fontFamily: 'var(--chakra-fonts-mono)',
                            fontSize: 'var(--chakra-fontSizes-sm)',
                            fontWeight: '600'
                          }}
                        />
                      ) : (
                        <Typography fontSize="sm" color="fg.muted" fontFamily="mono">
                          -
                        </Typography>
                      )}
                    </Table.Cell>

                    {/* Unit */}
                    <Table.Cell>
                      {typeof input.item === 'object' && input.item?.name ? (
                        <Input
                          size="sm"
                          placeholder="ej: kg"
                          value={input.unit}
                          onChange={(e) =>
                            handleUpdateInput(index, {
                              unit: e.target.value
                            })
                          }
                          css={{
                            fontFamily: 'var(--chakra-fonts-mono)',
                            fontSize: 'var(--chakra-fontSizes-sm)'
                          }}
                        />
                      ) : (
                        <Typography fontSize="sm" color="fg.muted" fontFamily="mono">
                          -
                        </Typography>
                      )}
                    </Table.Cell>

                    {/* Unit Price */}
                    <Table.Cell>
                      {typeof input.item === 'object' && input.item?.unitCost !== undefined ? (
                        <Typography
                          fontFamily="mono"
                          fontSize="sm"
                          fontWeight="600"
                          color="fg.default"
                        >
                          ${input.unitCost.toFixed(2)}
                        </Typography>
                      ) : (
                        <Typography fontSize="sm" color="fg.muted" fontFamily="mono">
                          -
                        </Typography>
                      )}
                    </Table.Cell>

                    {/* Total */}
                    <Table.Cell>
                      <Typography
                        fontFamily="mono"
                        fontSize="sm"
                        fontWeight="600"
                        color="fg.emphasized"
                      >
                        ${input.totalCost.toFixed(2)}
                      </Typography>
                    </Table.Cell>

                    {/* Percentage with Progress Bar */}
                    <Table.Cell>
                      <ProgressBar percentage={input.percentage} />
                    </Table.Cell>

                    {/* Actions */}
                    <Table.Cell>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => handleRemoveInput(index)}
                        aria-label="Eliminar ingrediente"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        {/* Add Line Button */}
        <Button 
          variant="outline" 
          onClick={handleAddInput} 
          colorPalette="blue"
          data-testid="recipe-add-input-button"
        >
          <PlusIcon className="w-4 h-4" />
          AGREGAR LÍNEA
        </Button>

        {/* Subtotal - Industrial Invoice Style */}
        {inputs.length > 0 && (
          <Box
            textAlign="right"
            pt="3"
            borderTopWidth="2px"
            borderTopColor="border.subtle"
          >
            <Typography
              fontSize="sm"
              fontWeight="800"
              fontFamily="mono"
              color="fg.emphasized"
              letterSpacing="wider"
            >
              SUBTOTAL MATERIALES: ${costSummary.totalMaterialsCost.toFixed(2)}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

// Export memoized version
export const InputsEditorSection = memo(InputsEditorSectionComponent);
