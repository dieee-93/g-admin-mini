/**
 * OutputConfigSection v2.0 - Industrial Production Output Configuration
 *
 * REDESIGNED with industrial aesthetics and enhanced features:
 * - Output Type Selector (Measurable/Countable) - RadioGroup
 * - Dynamic Unit Selector based on type selected
 * - Live Cost Preview calculation
 * - Placeholder when costs not available
 * - Heavy borders and professional manufacturing feel
 *
 * Architecture:
 * - Receives props (no context) following project pattern
 * - Uses semantic tokens exclusively
 * - DecimalUtils for calculations
 */

import { Stack, Input, Field, Badge, Button, Flex, Box, Text, RadioGroupRoot, RadioItem, RadioItemControl, RadioItemText, HStack, Typography, SelectField } from '@/shared/ui';
import type { Recipe, RecipeItem } from '../../../types/recipe';
import type { RecipeBuilderFeatures } from '../types';
import { RecipeTooltips } from '../components/HelpTooltip';
import { memo, useMemo, useCallback } from 'react';
import { DecimalUtils } from '@/lib/decimal';

// ============================================
// PROPS
// ============================================

interface OutputConfigSectionProps {
  recipe: Partial<Recipe>;
  updateRecipe: (updates: Partial<Recipe>) => void;
  features: Required<RecipeBuilderFeatures>;
  preselectedItem?: RecipeItem;

  // NEW: Cost preview props
  materialsCost?: number;
  laborCost?: number;
  overhead?: number;
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Unit types for different output categories
 */
const MEASURABLE_UNITS = [
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'm', label: 'Metros (m)' },
  { value: 'cm', label: 'Centímetros (cm)' },
];

const COUNTABLE_UNITS = [
  { value: 'unit', label: 'Unidades (u)' },
  { value: 'pcs', label: 'Piezas (pcs)' },
  { value: 'box', label: 'Cajas (box)' },
  { value: 'pack', label: 'Paquetes (pack)' },
  { value: 'dozen', label: 'Docenas (dz)' },
];

// ============================================
// COMPONENT
// ============================================

/**
 * OutputConfigSection v2.0 - Industrial output configuration
 *
 * @component
 * @description
 * Industrial production order section for configuring recipe output.
 * Features type selector, dynamic units, and live cost preview.
 *
 * Design:
 * - Blue gradient top bar (4px)
 * - Heavy 3px borders
 * - Monospace cost preview
 * - Type selector with radio buttons
 * - Dynamic unit dropdown
 *
 * @param {OutputConfigSectionProps} props - Component props
 * @returns {React.ReactElement} Rendered section
 */
function OutputConfigSectionComponent(props: OutputConfigSectionProps) {
  const {
    recipe,
    updateRecipe,
    features,
    preselectedItem,
    materialsCost = 0,
    laborCost = 0,
    overhead = 0
  } = props;

  // If there's a preselectedItem, use it as default
  const defaultItem = preselectedItem || {
    id: 'temp',
    name: 'Sin especificar',
    type: 'material' as const,
    unit: 'unit'
  };

  const output = recipe.output ?? {
    item: defaultItem,
    quantity: 1,
    unit: defaultItem.unit
  };

  // Determine output type from unit
  const outputType = useMemo(() => {
    const measurableUnits = MEASURABLE_UNITS.map(u => u.value);
    return measurableUnits.includes(output.unit || '') ? 'measurable' : 'countable';
  }, [output.unit]);

  // ============================================
  // HANDLERS
  // ============================================

  const updateOutput = useCallback((updates: Partial<typeof output>) => {
    updateRecipe({
      output: { ...output, ...updates }
    });
  }, [output, updateRecipe]);

  const handleTypeChange = useCallback((value: string[]) => {
    const newType = value[0] as 'measurable' | 'countable';
    const defaultUnit = newType === 'measurable' ? 'kg' : 'unit';
    updateOutput({ unit: defaultUnit });
  }, [updateOutput]);

  const handleUnitChange = useCallback((value: string[]) => {
    updateOutput({ unit: value[0] });
  }, [updateOutput]);

  // ============================================
  // CALCULATIONS
  // ============================================

  /**
   * Calculate cost per unit (live)
   * Returns null if no materials/labor costs are available
   */
  const costPerUnit = useMemo(() => {
    // Check if we have any costs
    if (materialsCost === 0 && laborCost === 0) {
      return null; // Placeholder state
    }

    const quantity = output.quantity || 1;

    // Calculate total cost: materials + labor + overhead
    const totalCost = DecimalUtils.add(
      DecimalUtils.add(
        materialsCost.toString(),
        laborCost.toString(),
        'financial'
      ).toString(),
      overhead.toString(),
      'financial'
    ).toNumber();

    // Calculate cost per unit: totalCost / quantity
    if (quantity > 0) {
      return DecimalUtils.divide(
        totalCost.toString(),
        quantity.toString(),
        'financial'
      ).toNumber();
    }

    return 0;
  }, [materialsCost, laborCost, overhead, output.quantity]);

  // ============================================
  // DISPLAY VALUES
  // ============================================

  const outputItem = typeof output.item === 'string' ? null : output.item;
  const itemName = preselectedItem?.name || outputItem?.name || 'Sin especificar';
  const currentUnit = output.unit || 'unit';
  const unitOptions = outputType === 'measurable' ? MEASURABLE_UNITS : COUNTABLE_UNITS;

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
          background: 'linear-gradient(90deg, var(--chakra-colors-green-emphasized), var(--chakra-colors-green-fg))',
          borderTopLeftRadius: 'var(--chakra-radii-xl)',
          borderTopRightRadius: 'var(--chakra-radii-xl)'
        }
      }}
    >
      <Stack gap="4">
        {/* Header */}
        <Typography
          fontSize="xs"
          fontWeight="800"
          color="fg.muted"
          letterSpacing="widest"
          textTransform="uppercase"
        >
          Producción de la Receta
        </Typography>

        {/* Item de Salida - Read-only (heredado del padre) */}
        <Field.Root>
          <Field.Label>
            <Typography
              fontSize="xs"
              fontWeight="700"
              letterSpacing="wider"
              textTransform="uppercase"
              color="fg.muted"
            >
              Item de Salida
            </Typography>
          </Field.Label>
          <Badge colorPalette="green" size="lg" variant="subtle">
            {itemName}
          </Badge>
          <Field.HelperText>
            Heredado del formulario de {preselectedItem ? 'material/producto' : 'item'} padre
          </Field.HelperText>
        </Field.Root>

        {/* Output Type Selector - NEW */}
        <Field.Root>
          <Field.Label>
            <Typography
              fontSize="xs"
              fontWeight="700"
              letterSpacing="wider"
              textTransform="uppercase"
              color="fg.muted"
            >
              Tipo de Salida
            </Typography>
          </Field.Label>
          <RadioGroupRoot
            value={[outputType]}
            onValueChange={handleTypeChange}
            orientation="horizontal"
          >
            <HStack gap="4">
              <RadioItem value="measurable">
                <RadioItemControl />
                <RadioItemText>
                  <Typography fontSize="sm" fontWeight="600">
                    Medible (kg, L, m)
                  </Typography>
                </RadioItemText>
              </RadioItem>
              <RadioItem value="countable">
                <RadioItemControl />
                <RadioItemText>
                  <Typography fontSize="sm" fontWeight="600">
                    Unitario (piezas, cajas)
                  </Typography>
                </RadioItemText>
              </RadioItem>
            </HStack>
          </RadioGroupRoot>
        </Field.Root>

        {/* Cantidad de Producción */}
        <Field.Root required>
          <Field.Label>
            <Flex align="center" gap="2">
              <Typography
                fontSize="xs"
                fontWeight="700"
                letterSpacing="wider"
                textTransform="uppercase"
                color="fg.muted"
              >
                Cantidad de Producción
              </Typography>
              {RecipeTooltips.outputQuantity}
            </Flex>
          </Field.Label>
          <HStack gap="2">
            <Input
              type="number"
              min="0"
              step="0.001"
              placeholder="Ej: 1.0"
              value={output.quantity ?? ''}
              onChange={(e) => updateOutput({ quantity: parseFloat(e.target.value) || 0 })}
              flex="1"
              data-testid="recipe-output-quantity"
              css={{
                fontFamily: 'var(--chakra-fonts-mono)',
                fontSize: 'var(--chakra-fontSizes-md)',
                fontWeight: '600'
              }}
            />

            {/* Dynamic Unit Selector - NEW */}
            <Box minW="150px">
              <SelectField
                value={[currentUnit]}
                onValueChange={handleUnitChange}
                options={unitOptions}
                size="md"
              />
            </Box>
          </HStack>
          <Field.HelperText>
            Cantidad que produce esta receta
          </Field.HelperText>
        </Field.Root>

        {/* COST PREVIEW - NEW */}
        <Box
          p="4"
          bg="bg.subtle"
          borderRadius="md"
          borderWidth="2px"
          borderColor="border.default"
        >
          <Stack gap="2">
            <Typography
              fontSize="xs"
              fontWeight="700"
              letterSpacing="wider"
              textTransform="uppercase"
              color="fg.muted"
            >
              Costo por Unidad (Preview)
            </Typography>

            {costPerUnit !== null ? (
              <>
                <Typography
                  fontFamily="mono"
                  fontSize="2xl"
                  fontWeight="800"
                  color="fg.emphasized"
                >
                  ${costPerUnit.toFixed(4)} / {currentUnit}
                </Typography>
                <Typography fontSize="xs" color="fg.muted">
                  Materiales (${materialsCost.toFixed(2)}) + Labor (${laborCost.toFixed(2)}) + Overhead (${overhead.toFixed(2)})
                </Typography>
              </>
            ) : (
              <Typography fontSize="sm" color="fg.muted" fontStyle="italic">
                (Agregá materiales y personal primero para ver el costo)
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

// Export memoized version
export const OutputConfigSection = memo(OutputConfigSectionComponent);
