/**
 * ScalingTool - Herramienta para escalar recetas
 *
 * Permite ajustar cantidades de una receta existente multiplicando por un factor.
 * Útil para producción en batch o ajustar porciones.
 *
 * FEATURES:
 * - Escalar por factor o cantidad objetivo
 * - Preview de ingredientes escalados
 * - Cálculo automático de costos
 * - Opción para guardar como nueva receta
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Stack,
  Flex,
  Typography,
  Button,
  Input,
  Alert,
  Badge,
  Field
} from '@/shared/ui';
import {
  ArrowPathIcon,
  ScaleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import type { Recipe, RecipeInput } from '../../types';
import Decimal from 'decimal.js';

// ============================================
// TYPES
// ============================================

interface ScalingToolProps {
  /** Receta a escalar (opcional - si no se pasa, mostrar selector) */
  recipe?: Recipe;
  /** Callback cuando se completa el escalado */
  onScaled?: (scaledRecipe: Recipe) => void;
  /** Callback para cancelar */
  onCancel?: () => void;
}

interface ScaledInput extends RecipeInput {
  originalQuantity: number;
  scaledQuantity: number;
}

// ============================================
// COMPONENT
// ============================================

export function ScalingTool({
  recipe,
  onScaled,
  onCancel
}: ScalingToolProps) {
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [targetQuantity, setTargetQuantity] = useState<number | undefined>();

  // ============================================
  // SCALED DATA CALCULATION
  // ============================================

  const scaledInputs = useMemo<ScaledInput[]>(() => {
    if (!recipe) return [];

    return recipe.inputs.map(input => ({
      ...input,
      originalQuantity: input.quantity,
      scaledQuantity: new Decimal(input.quantity)
        .times(scaleFactor)
        .toDecimalPlaces(3)
        .toNumber()
    }));
  }, [recipe, scaleFactor]);

  const scaledOutput = useMemo(() => {
    if (!recipe?.output) return null;

    return {
      ...recipe.output,
      originalQuantity: recipe.output.quantity,
      scaledQuantity: new Decimal(recipe.output.quantity)
        .times(scaleFactor)
        .toDecimalPlaces(3)
        .toNumber()
    };
  }, [recipe, scaleFactor]);

  // ============================================
  // COST CALCULATION (Estimated)
  // ============================================

  const estimatedCosts = useMemo(() => {
    if (!recipe) return null;

    // Simplified cost calculation
    // In production, this would use the RecipeCostEngine
    const baseCost = 100; // Mock base cost
    const scaledCost = new Decimal(baseCost).times(scaleFactor).toNumber();
    const costPerUnit = scaledOutput
      ? new Decimal(scaledCost).dividedBy(scaledOutput.scaledQuantity).toNumber()
      : 0;

    return {
      baseCost,
      scaledCost,
      costPerUnit,
      factor: scaleFactor
    };
  }, [recipe, scaleFactor, scaledOutput]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleScaleFactorChange = useCallback((value: string) => {
    const factor = parseFloat(value);
    if (!isNaN(factor) && factor > 0) {
      setScaleFactor(factor);
      setTargetQuantity(undefined); // Clear target when using factor
    }
  }, []);

  const handleTargetQuantityChange = useCallback((value: string) => {
    const target = parseFloat(value);
    if (!isNaN(target) && target > 0 && recipe?.output) {
      setTargetQuantity(target);
      // Calculate factor based on target
      const factor = new Decimal(target)
        .dividedBy(recipe.output.quantity)
        .toDecimalPlaces(3)
        .toNumber();
      setScaleFactor(factor);
    }
  }, [recipe]);

  const handleApply = useCallback(() => {
    if (!recipe) return;

    const scaledRecipe: Recipe = {
      ...recipe,
      name: `${recipe.name} (x${scaleFactor})`,
      inputs: scaledInputs.map(input => ({
        ...input,
        quantity: input.scaledQuantity
      })),
      output: scaledOutput
        ? { ...scaledOutput, quantity: scaledOutput.scaledQuantity }
        : recipe.output
    };

    onScaled?.(scaledRecipe);
  }, [recipe, scaleFactor, scaledInputs, scaledOutput, onScaled]);

  const handleReset = useCallback(() => {
    setScaleFactor(1);
    setTargetQuantity(undefined);
  }, []);

  // ============================================
  // RENDER: No Recipe Selected
  // ============================================

  if (!recipe) {
    return (
      <Box
        p="8"
        textAlign="center"
        bg="bg.muted"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="border.default"
      >
        <Stack gap="4" align="center">
          <ScaleIcon style={{ width: '48px', height: '48px', opacity: 0.3 }} />
          <Typography variant="body" color="fg.muted">
            Selecciona una receta para escalar
          </Typography>
          <Typography variant="caption" color="fg.muted">
            El selector de recetas se implementará próximamente
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ============================================
  // RENDER: Scaling Interface
  // ============================================

  return (
    <Stack gap="6">
      {/* Header */}
      <Box>
        <Flex align="center" gap="3" mb="2">
          <ScaleIcon style={{ width: '24px', height: '24px' }} />
          <Typography variant="heading" fontSize="xl">
            Escalar Receta
          </Typography>
          <Badge colorPalette="purple">{recipe.name}</Badge>
        </Flex>
        <Typography variant="body" color="fg.muted" fontSize="sm">
          Ajusta las cantidades de la receta multiplicando por un factor o definiendo una cantidad objetivo
        </Typography>
      </Box>

      {/* Scaling Controls */}
      <Flex gap="4" wrap="wrap">
        {/* Scale by Factor */}
        <Box flex="1" minW="200px">
          <Field.Root>
            <Field.Label>Factor de Escalado</Field.Label>
            <Input
              type="number"
              value={scaleFactor}
              onChange={(e) => handleScaleFactorChange(e.target.value)}
              min="0.1"
              step="0.1"
              placeholder="1.0"
            />
            <Field.HelperText>
              Multiplica todas las cantidades por este factor
            </Field.HelperText>
          </Field.Root>
        </Box>

        {/* OR */}
        <Flex align="center" pt="8">
          <Typography variant="body" color="fg.muted" fontWeight="medium">
            ó
          </Typography>
        </Flex>

        {/* Scale by Target */}
        <Box flex="1" minW="200px">
          <Field.Root>
            <Field.Label>Cantidad Objetivo</Field.Label>
            <Input
              type="number"
              value={targetQuantity ?? ''}
              onChange={(e) => handleTargetQuantityChange(e.target.value)}
              min="0.1"
              step="0.1"
              placeholder={`Original: ${recipe.output.quantity} ${recipe.output.unit}`}
            />
            <Field.HelperText>
              Define cuánto quieres producir (calcula el factor automáticamente)
            </Field.HelperText>
          </Field.Root>
        </Box>

        {/* Reset Button */}
        <Flex align="flex-end" pb="2">
          <Button
            variant="ghost"
            onClick={handleReset}
            leftIcon={<ArrowPathIcon style={{ width: '16px', height: '16px' }} />}
          >
            Resetear
          </Button>
        </Flex>
      </Flex>

      {/* Preview: Output */}
      {scaledOutput && (
        <Box
          p="4"
          bg="blue.50"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="blue.200"
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Typography variant="label" color="blue.900">
                Producción
              </Typography>
              <Typography variant="body" fontSize="lg" fontWeight="bold" color="blue.900">
                {scaledOutput.scaledQuantity} {scaledOutput.unit}
              </Typography>
              <Typography variant="caption" color="blue.700">
                Original: {scaledOutput.originalQuantity} {scaledOutput.unit}
              </Typography>
            </Box>
            {estimatedCosts && (
              <Box textAlign="right">
                <Typography variant="label" color="blue.900">
                  Costo Estimado
                </Typography>
                <Typography variant="body" fontSize="lg" fontWeight="bold" color="blue.900">
                  ${estimatedCosts.scaledCost.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="blue.700">
                  ${estimatedCosts.costPerUnit.toFixed(2)}/{scaledOutput.unit}
                </Typography>
              </Box>
            )}
          </Flex>
        </Box>
      )}

      {/* Preview: Inputs Table */}
      <Box>
        <Typography variant="label" mb="3">
          Ingredientes Escalados
        </Typography>
        <Box
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          overflow="hidden"
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--chakra-colors-bg-muted)' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--chakra-colors-border-default)' }}>
                  Ingrediente
                </th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid var(--chakra-colors-border-default)' }}>
                  Original
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid var(--chakra-colors-border-default)' }}>
                  →
                </th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid var(--chakra-colors-border-default)' }}>
                  Escalado
                </th>
              </tr>
            </thead>
            <tbody>
              {scaledInputs.map((input, index) => (
                <tr key={input.id || index} style={{ backgroundColor: index % 2 === 0 ? 'white' : 'var(--chakra-colors-bg-subtle)' }}>
                  <td style={{ padding: '12px' }}>
                    <Typography variant="body">
                      {typeof input.item === 'string' ? input.item : input.item.name}
                    </Typography>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <Typography variant="body" color="fg.muted">
                      {input.originalQuantity} {input.unit}
                    </Typography>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <Typography variant="body" color="fg.muted">
                      x{scaleFactor}
                    </Typography>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <Typography variant="body" fontWeight="semibold" color="blue.700">
                      {input.scaledQuantity} {input.unit}
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* Info Alert */}
      {scaleFactor !== 1 && (
        <Alert.Root status="info">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Escalado Aplicado</Alert.Title>
            <Alert.Description>
              Todas las cantidades se han multiplicado por {scaleFactor.toFixed(2)}x.
              Puedes guardar esto como una nueva receta o usar temporalmente.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Actions */}
      <Flex gap="3" justify="flex-end">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button
          colorPalette="purple"
          onClick={handleApply}
          disabled={scaleFactor === 1}
          leftIcon={<CheckCircleIcon style={{ width: '20px', height: '20px' }} />}
        >
          Aplicar Escalado
        </Button>
      </Flex>
    </Stack>
  );
}
