/**
 * CostSummarySection v2.0 - Industrial Invoice-Style Cost Summary
 *
 * REDESIGNED with industrial invoice aesthetics:
 * - Purple gradient top bar (totals/aggregations theme)
 * - Right-aligned totals like commercial invoices
 * - Monospace typography for all numbers
 * - Industrial separators (─ and ═)
 * - Progress bars in breakdown table
 * - Heavy borders and professional feel
 *
 * Features (maintained from v1):
 * - useRecipeCosts hook for automatic calculation
 * - Breakdown by ingredient with percentages
 * - Yield analysis
 * - Profitability (if available)
 *
 * Architecture:
 * - Receives props (no context) following project pattern
 * - Uses semantic tokens exclusively
 * - Maintains all existing calculation logic
 */

import { useEffect, useState, useMemo, memo } from 'react';
import { Stack, Box, Typography, Badge, Progress, Alert, HStack, Flex } from '@/shared/ui';
import { useRecipeCosts } from '../../../hooks/useRecipeCosts';
import type { Recipe } from '../../../types/recipe';
import type { RecipeBuilderFeatures } from '../types';
import type { RecipeCostResult, CalculateCostInput } from '../../../types/costing';

// ============================================
// PROPS
// ============================================

interface CostSummarySectionProps {
  recipe: Partial<Recipe>;
  features: Required<RecipeBuilderFeatures>;
}

// ============================================
// HELPER COMPONENTS
// ============================================

/**
 * Progress Bar using block characters (reused from InputsEditor)
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
 * CostSummarySection v2.0 - Industrial invoice-style cost summary
 *
 * @component
 * @description
 * Industrial invoice-styled cost summary with right-aligned totals,
 * monospace typography, and progress bars. Maintains all calculation
 * logic from original version.
 *
 * Design:
 * - Purple gradient top bar (aggregations theme)
 * - Right-aligned totals
 * - Monospace numbers
 * - Industrial separators
 * - Progress bars in breakdown
 *
 * @param {CostSummarySectionProps} props - Component props
 * @returns {React.ReactElement} Rendered section
 */
function CostSummarySectionComponent({ recipe }: CostSummarySectionProps) {
  const { calculateCostAsync, isCalculating } = useRecipeCosts();

  const [costs, setCosts] = useState<RecipeCostResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // CALCULATE COSTS
  // ============================================

  useEffect(() => {
    // Solo calcular si hay inputs
    if (!recipe.inputs || recipe.inputs.length === 0) {
      setCosts(null);
      return;
    }

    // Solo calcular si tenemos output configurado
    if (!recipe.output || !recipe.output.quantity) {
      setCosts(null);
      return;
    }

    // Construir input para cálculo
    const input: CalculateCostInput = {
      recipeId: recipe.id ?? 'preview',
      inputs: recipe.inputs,
      output: recipe.output,
      costConfig: recipe.costConfig ?? {}
    };

    // Calcular
    calculateCostAsync({ input })
      .then((result) => {
        setCosts(result);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setCosts(null);
      });
  }, [recipe.inputs, recipe.output, recipe.costConfig, calculateCostAsync]);

  // ============================================
  // LOADING STATE
  // ============================================

  if (isCalculating) {
    return (
      <Box
        position="relative"
        p="6"
        bg="bg.panel"
        borderWidth="3px"
        borderColor="border.emphasized"
        borderRadius="xl"
        boxShadow="lg"
      >
        <Stack gap="4">
          <Typography
            fontSize="xs"
            fontWeight="800"
            color="fg.muted"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            Resumen de Costos
          </Typography>
          <Progress.Root value={null} colorPalette="purple">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Typography fontSize="sm" color="fg.muted">
            Calculando costos...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error) {
    return (
      <Box
        position="relative"
        p="6"
        bg="bg.panel"
        borderWidth="3px"
        borderColor="border.emphasized"
        borderRadius="xl"
        boxShadow="lg"
      >
        <Stack gap="4">
          <Typography
            fontSize="xs"
            fontWeight="800"
            color="fg.muted"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            Resumen de Costos
          </Typography>
          <Alert.Root status="error" variant="subtle">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Error al calcular costos</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </Stack>
      </Box>
    );
  }

  // ============================================
  // NO COSTS STATE
  // ============================================

  if (!costs) {
    return (
      <Box
        position="relative"
        p="6"
        bg="bg.panel"
        borderWidth="3px"
        borderColor="border.emphasized"
        borderRadius="xl"
        boxShadow="lg"
      >
        <Stack gap="4">
          <Typography
            fontSize="xs"
            fontWeight="800"
            color="fg.muted"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            Resumen de Costos
          </Typography>
          <Alert.Root status="info" variant="subtle">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                Agrega ingredientes y configura la salida para ver el cálculo de costos
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </Stack>
      </Box>
    );
  }

  // ============================================
  // RENDER COSTS - INVOICE STYLE
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
            'linear-gradient(90deg, var(--chakra-colors-purple-emphasized), var(--chakra-colors-purple-fg))',
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
          Resumen de Costos
        </Typography>

        {/* INVOICE TOTALS - Right-aligned */}
        <Box>
          <Stack gap="2">
            {/* Materials Cost */}
            <Flex justify="space-between" align="center">
              <Typography fontSize="sm" color="fg.default">
                Materiales:
              </Typography>
              <Typography fontFamily="mono" fontSize="md" fontWeight="600" color="fg.default">
                ${costs.materialsCost.toFixed(2)}
              </Typography>
            </Flex>

            {/* Labor Cost (if applicable) */}
            {costs.laborCost > 0 && (
              <Flex justify="space-between" align="center">
                <Typography fontSize="sm" color="fg.default">
                  Mano de Obra:
                </Typography>
                <Typography fontFamily="mono" fontSize="md" fontWeight="600" color="fg.default">
                  ${costs.laborCost.toFixed(2)}
                </Typography>
              </Flex>
            )}

            {/* Overhead (if applicable) */}
            {costs.overheadCost > 0 && (
              <Flex justify="space-between" align="center">
                <Typography fontSize="sm" color="fg.default">
                  Overhead:
                </Typography>
                <Typography fontFamily="mono" fontSize="md" fontWeight="600" color="fg.default">
                  ${costs.overheadCost.toFixed(2)}
                </Typography>
              </Flex>
            )}

            {/* Packaging (if applicable) */}
            {costs.packagingCost > 0 && (
              <Flex justify="space-between" align="center">
                <Typography fontSize="sm" color="fg.default">
                  Empaquetado:
                </Typography>
                <Typography fontFamily="mono" fontSize="md" fontWeight="600" color="fg.default">
                  ${costs.packagingCost.toFixed(2)}
                </Typography>
              </Flex>
            )}

            {/* Separator - Industrial */}
            <Box
              borderTopWidth="1px"
              borderTopStyle="dashed"
              borderTopColor="border.subtle"
              my="1"
            />

            {/* Total Cost */}
            <Flex justify="space-between" align="center">
              <Typography fontSize="md" fontWeight="700" color="fg.emphasized">
                TOTAL:
              </Typography>
              <Typography
                fontFamily="mono"
                fontSize="xl"
                fontWeight="800"
                color="fg.emphasized"
              >
                ${costs.totalCost.toFixed(2)}
              </Typography>
            </Flex>

            {/* Heavy Separator */}
            <Box
              borderTopWidth="3px"
              borderTopStyle="double"
              borderTopColor="border.emphasized"
              my="1"
            />

            {/* Production & Cost per Unit */}
            <Flex justify="space-between" align="center">
              <Typography fontSize="sm" color="fg.muted">
                Producción:
              </Typography>
              <Typography fontFamily="mono" fontSize="sm" fontWeight="600" color="fg.muted">
                {recipe.output?.quantity} {recipe.output?.unit}
              </Typography>
            </Flex>

            <Flex justify="space-between" align="center">
              <Typography fontSize="sm" fontWeight="700" color="fg.emphasized">
                Costo/Unidad:
              </Typography>
              <Typography
                fontFamily="mono"
                fontSize="lg"
                fontWeight="800"
                color="fg.emphasized"
                colorPalette="green"
                css={{ color: 'var(--chakra-colors-green-emphasized)' }}
              >
                ${costs.costPerUnit.toFixed(4)} / {recipe.output?.unit}
              </Typography>
            </Flex>
          </Stack>
        </Box>

        {/* Breakdown por Ingrediente - Industrial Table */}
        <Box>
          <Typography
            fontSize="xs"
            fontWeight="700"
            letterSpacing="wider"
            textTransform="uppercase"
            color="fg.muted"
            mb="2"
          >
            Desglose por Ingrediente
          </Typography>

          <Box
            borderWidth="2px"
            borderColor="border.default"
            borderRadius="md"
            overflow="hidden"
          >
            <Stack gap="0">
              {costs.inputsBreakdown.map((input, index) => (
                <Box
                  key={input.inputId}
                  p="3"
                  bg={index % 2 === 0 ? 'bg.panel' : 'bg.subtle'}
                  borderBottomWidth={
                    index < costs.inputsBreakdown.length - 1 ? '1px' : '0'
                  }
                  borderBottomColor="border.subtle"
                >
                  <Flex justify="space-between" align="start" gap="4">
                    {/* Item Info */}
                    <Box flex="1" minW="0">
                      <Typography fontSize="sm" fontWeight="600" color="fg.default">
                        {input.itemName}
                      </Typography>
                      <Typography fontSize="xs" color="fg.muted" fontFamily="mono">
                        {input.quantity} {input.unit}
                      </Typography>
                    </Box>

                    {/* Cost & Percentage */}
                    <Stack gap="1" align="end" minW="120px">
                      <Typography
                        fontFamily="mono"
                        fontSize="sm"
                        fontWeight="600"
                        color="fg.emphasized"
                      >
                        ${input.totalCost.toFixed(2)}
                      </Typography>
                      <ProgressBar percentage={input.percentageOfTotal} />
                    </Stack>
                  </Flex>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Yield Analysis */}
        {costs.yieldAnalysis && (
          <Box
            p="4"
            bg="bg.subtle"
            borderRadius="md"
            borderWidth="2px"
            borderColor="border.default"
          >
            <HStack gap="4" justify="space-around">
              <Box textAlign="center">
                <Typography fontSize="xs" color="fg.muted" mb="1">
                  RENDIMIENTO
                </Typography>
                <Typography fontFamily="mono" fontSize="lg" fontWeight="700" color="fg.emphasized">
                  {costs.yieldAnalysis.yieldPercentage.toFixed(1)}%
                </Typography>
              </Box>

              <Box textAlign="center">
                <Typography fontSize="xs" color="fg.muted" mb="1">
                  DESPERDICIO
                </Typography>
                <Typography fontFamily="mono" fontSize="lg" fontWeight="700" color="fg.emphasized">
                  {costs.yieldAnalysis.wasteFactor.toFixed(1)}%
                </Typography>
              </Box>

              <Box textAlign="center">
                <Typography fontSize="xs" color="fg.muted" mb="1">
                  EFICIENCIA
                </Typography>
                <Typography fontFamily="mono" fontSize="lg" fontWeight="700" color="fg.emphasized">
                  {costs.yieldAnalysis.efficiencyScore.toFixed(0)}/100
                </Typography>
              </Box>
            </HStack>
          </Box>
        )}

        {/* Profitability (if available) */}
        {costs.profitability && (
          <Box
            p="4"
            bg="bg.subtle"
            borderRadius="md"
            borderWidth="2px"
            borderColor="border.default"
          >
            <Typography
              fontSize="xs"
              fontWeight="700"
              letterSpacing="wider"
              textTransform="uppercase"
              color="fg.muted"
              mb="2"
            >
              Rentabilidad
            </Typography>
            <Stack gap="2">
              {costs.profitability.sellingPrice && (
                <Flex justify="space-between">
                  <Typography fontSize="sm" color="fg.default">
                    Precio de Venta:
                  </Typography>
                  <Typography fontFamily="mono" fontSize="sm" fontWeight="600" color="fg.default">
                    ${costs.profitability.sellingPrice.toFixed(2)}
                  </Typography>
                </Flex>
              )}
              <Flex justify="space-between">
                <Typography fontSize="sm" color="fg.default">
                  Break-Even:
                </Typography>
                <Typography fontFamily="mono" fontSize="sm" fontWeight="600" color="fg.default">
                  ${costs.profitability.breakEvenPrice.toFixed(2)}
                </Typography>
              </Flex>
              {costs.profitability.profitPercentage !== undefined && (
                <Flex justify="space-between">
                  <Typography fontSize="sm" fontWeight="700" color="fg.emphasized">
                    Margen de Ganancia:
                  </Typography>
                  <Typography
                    fontFamily="mono"
                    fontSize="sm"
                    fontWeight="700"
                    color="fg.emphasized"
                    colorPalette="green"
                    css={{ color: 'var(--chakra-colors-green-emphasized)' }}
                  >
                    {costs.profitability.profitPercentage.toFixed(1)}%
                  </Typography>
                </Flex>
              )}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

// Export memoized version
export const CostSummarySection = memo(CostSummarySectionComponent);
