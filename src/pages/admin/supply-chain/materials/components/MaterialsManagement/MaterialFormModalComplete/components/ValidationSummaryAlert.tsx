/**
 * Validation Summary Alert Component
 *
 * Displays validation errors and warnings in a prominent alert box
 * Helps users understand why the submit button is disabled
 *
 * Design:
 * - Red alert for critical errors (blocks submission)
 * - Orange alert for warnings (non-blocking suggestions)
 * - Grouped by section for easier navigation
 * - Clear call-to-action messages
 *
 * @see useMaterialFormValidation hook
 */

import React, { memo } from 'react';
import { Alert, Stack, Text, Box } from '@/shared/ui';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationSummaryAlertProps {
  /** Validation errors by section */
  errors?: {
    basicInfo: string[];
    typeConfig: string[];
    stock: string[];
    supplier: string[];
    recipe: string[];
    production: string[];
  };

  /** Validation warnings (non-blocking) */
  warnings?: string[];

  /** Show compact version (less verbose) */
  compact?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Validation Summary Alert
 *
 * Shows all validation errors grouped by section with clear labels
 *
 * @example
 * ```tsx
 * const { getValidationSummary } = useMaterialFormValidation(formData);
 *
 * <ValidationSummaryAlert
 *   errors={getValidationSummary()}
 *   warnings={validation.warnings}
 * />
 * ```
 */
export const ValidationSummaryAlert = memo(function ValidationSummaryAlert({
  errors,
  warnings,
  compact = false,
}: ValidationSummaryAlertProps) {
  // Count total errors
  const totalErrors = errors
    ? Object.values(errors).flat().length
    : 0;

  const hasErrors = totalErrors > 0;
  const hasWarnings = warnings && warnings.length > 0;

  // Don't render if no errors or warnings
  if (!hasErrors && !hasWarnings) {
    return null;
  }

  return (
    <Stack gap="3">
      {/* Critical Errors Alert */}
      {hasErrors && errors && (
        <Alert.Root status="error" variant="subtle">
          <Alert.Indicator>
            <ExclamationTriangleIcon style={{ width: '20px', height: '20px' }} />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>
              {totalErrors} {totalErrors === 1 ? 'problema encontrado' : 'problemas encontrados'}
            </Alert.Title>
            <Alert.Description>
              <Stack gap="3" mt="2">
                {!compact && (
                  <Text fontSize="sm" color="fg.muted">
                    Corrige los siguientes problemas para poder guardar el material:
                  </Text>
                )}

                {/* Errors by Section */}
                <Stack gap="4">
                  {errors.basicInfo.length > 0 && (
                    <ErrorSection
                      title="Información Básica"
                      errors={errors.basicInfo}
                      compact={compact}
                    />
                  )}

                  {errors.typeConfig.length > 0 && (
                    <ErrorSection
                      title="Configuración de Tipo"
                      errors={errors.typeConfig}
                      compact={compact}
                    />
                  )}

                  {errors.recipe.length > 0 && (
                    <ErrorSection
                      title="Receta"
                      errors={errors.recipe}
                      compact={compact}
                    />
                  )}

                  {errors.production.length > 0 && (
                    <ErrorSection
                      title="Configuración de Producción"
                      errors={errors.production}
                      compact={compact}
                    />
                  )}

                  {errors.stock.length > 0 && (
                    <ErrorSection
                      title="Stock Inicial"
                      errors={errors.stock}
                      compact={compact}
                    />
                  )}

                  {errors.supplier.length > 0 && (
                    <ErrorSection
                      title="Proveedor"
                      errors={errors.supplier}
                      compact={compact}
                    />
                  )}
                </Stack>
              </Stack>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Warnings Alert */}
      {hasWarnings && warnings && (
        <Alert.Root status="warning" variant="subtle">
          <Alert.Indicator>
            <InformationCircleIcon style={{ width: '20px', height: '20px' }} />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>
              {warnings.length} {warnings.length === 1 ? 'sugerencia' : 'sugerencias'}
            </Alert.Title>
            <Alert.Description>
              <Stack gap="2" mt="2">
                {!compact && (
                  <Text fontSize="sm" color="fg.muted">
                    Estas sugerencias pueden mejorar la calidad de los datos:
                  </Text>
                )}

                <Box as="ul" pl="4" fontSize="sm">
                  {warnings.map((warning, index) => (
                    <Box as="li" key={index} mb="1">
                      {warning}
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </Stack>
  );
});

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Error Section Component
 * Groups errors for a specific form section
 */
interface ErrorSectionProps {
  title: string;
  errors: string[];
  compact?: boolean;
}

const ErrorSection = memo(function ErrorSection({
  title,
  errors,
  compact,
}: ErrorSectionProps) {
  return (
    <Box>
      {!compact && (
        <Text fontSize="sm" fontWeight="bold" color="fg.emphasized" mb="1">
          {title}
        </Text>
      )}
      <Box as="ul" pl="4" fontSize="sm">
        {errors.map((error, index) => (
          <Box as="li" key={index} mb="1">
            {error}
          </Box>
        ))}
      </Box>
    </Box>
  );
});
