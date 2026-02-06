/**
 * Material Form Progress Indicator Component
 *
 * Visual progress tracker for elaborated material creation flow:
 * Step 1: Recipe Configuration (required)
 * Step 2: Production Config (optional)
 * Step 3: Save Material (final)
 *
 * Design:
 * - Clean horizontal stepper with badges
 * - Green checkmarks for completed steps
 * - Blue highlight for current step
 * - Gray for pending steps
 * - Helpful contextual messages
 *
 * Only shown for ELABORATED materials
 */

import React, { memo } from 'react';
import { Box, Stack, Typography, Badge, Flex } from '@/shared/ui';
import { CheckIcon } from '@heroicons/react/24/solid';

// ============================================================================
// TYPES
// ============================================================================

export interface MaterialFormProgressIndicatorProps {
  /** Has recipe been created/configured? */
  hasRecipe: boolean;

  /** Has production config been filled? */
  hasProductionConfig: boolean;

  /** Show compact version (less verbose) */
  compact?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Material Form Progress Indicator
 *
 * Shows visual progress through elaborated material creation flow
 *
 * @example
 * ```tsx
 * <MaterialFormProgressIndicator
 *   hasRecipe={!!formData.recipe_id}
 *   hasProductionConfig={!!formData.production_config}
 * />
 * ```
 */
export const MaterialFormProgressIndicator = memo(function MaterialFormProgressIndicator({
  hasRecipe,
  hasProductionConfig,
  compact = false,
}: MaterialFormProgressIndicatorProps) {
  // Determine current step
  const currentStep = !hasRecipe ? 1 : !hasProductionConfig ? 2 : 3;

  return (
    <Box
      p="5"
      bg="bg.subtle"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border.subtle"
      data-testid="material-progress-indicator"
    >
      <Stack gap="4">
        {/* Header */}
        {!compact && (
          <Typography
            fontSize="sm"
            fontWeight="bold"
            color="fg.muted"
            letterSpacing="wider"
            textTransform="uppercase"
          >
            Progreso de Configuración
          </Typography>
        )}

        {/* Progress Steps */}
        <Flex gap="2" align="center">
          {/* Step 1: Recipe */}
          <StepBadge
            number={1}
            label="Receta"
            isCompleted={hasRecipe}
            isCurrent={currentStep === 1}
          />

          <ProgressBar isCompleted={hasRecipe} />

          {/* Step 2: Production */}
          <StepBadge
            number={2}
            label="Producción"
            isCompleted={hasProductionConfig}
            isCurrent={currentStep === 2}
            isOptional
          />

          <ProgressBar isCompleted={hasProductionConfig} />

          {/* Step 3: Save */}
          <StepBadge
            number={3}
            label="Guardar"
            isCompleted={false}
            isCurrent={currentStep === 3}
          />
        </Flex>

        {/* Contextual Help Message */}
        {!compact && (
          <Box>
            {currentStep === 1 && (
              <HelpMessage
                text="Configura la receta con ingredientes y cantidades para este material elaborado"
                type="info"
              />
            )}

            {currentStep === 2 && (
              <HelpMessage
                text="(Opcional) Agrega equipamiento, mano de obra y overhead para cálculo preciso de costos"
                type="success"
              />
            )}

            {currentStep === 3 && (
              <HelpMessage
                text="Todo listo! Haz clic en 'Crear Material' para guardar"
                type="success"
              />
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
});

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Step Badge Component
 * Visual indicator for each step in the progress
 */
interface StepBadgeProps {
  number: number;
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isOptional?: boolean;
}

const StepBadge = memo(function StepBadge({
  number,
  label,
  isCompleted,
  isCurrent,
  isOptional,
}: StepBadgeProps) {
  // Determine color palette
  const colorPalette = isCompleted
    ? 'green'
    : isCurrent
    ? 'blue'
    : 'gray';

  return (
    <Badge
      colorPalette={colorPalette}
      size="lg"
      px="3"
      py="2"
      fontWeight="bold"
      fontSize="sm"
      display="flex"
      alignItems="center"
      gap="2"
      minW="fit-content"
      data-testid={`step-badge-${number}`}
    >
      {/* Step indicator (checkmark or number) */}
      {isCompleted ? (
        <CheckIcon style={{ width: '14px', height: '14px' }} />
      ) : (
        <span>{number}</span>
      )}

      {/* Label */}
      <span>{label}</span>

      {/* Optional tag */}
      {isOptional && !isCompleted && (
        <Typography
          as="span"
          fontSize="2xs"
          color="fg.muted"
          ml="1"
        >
          (Opcional)
        </Typography>
      )}
    </Badge>
  );
});

/**
 * Progress Bar Component
 * Connecting line between steps
 */
interface ProgressBarProps {
  isCompleted: boolean;
}

const ProgressBar = memo(function ProgressBar({
  isCompleted,
}: ProgressBarProps) {
  return (
    <Box
      h="2px"
      flex="1"
      minW="20px"
      maxW="60px"
      bg={isCompleted ? 'green.500' : 'gray.300'}
      transition="background-color 0.3s"
    />
  );
});

/**
 * Help Message Component
 * Contextual guidance for current step
 */
interface HelpMessageProps {
  text: string;
  type: 'info' | 'success';
}

const HelpMessage = memo(function HelpMessage({
  text,
  type,
}: HelpMessageProps) {
  const color = type === 'success' ? 'green.600' : 'blue.600';

  return (
    <Typography
      fontSize="xs"
      color={color}
      lineHeight="relaxed"
      data-testid="progress-help-message"
    >
      {text}
    </Typography>
  );
});
