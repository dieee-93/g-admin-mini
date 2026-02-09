/**
 * RecipeBuilder v3.1 - Refactored for Testability
 *
 * CHANGES v3.1:
 * - 🧪 REFACTOR: Extracted cost logic to `costCalculations.ts`
 * - ✅ CLEANUP: Removed inline excessive logic
 */

import { useMemo, lazy, Suspense, useState, memo, useCallback } from 'react';
import { Stack, Alert, Progress, Flex, Button, Spinner, Box, Typography } from '@/shared/ui';
import { TemplateSelector } from './components/TemplateSelector';
import { useRecipeBuilder } from '../../hooks/useRecipeBuilder';
import { useMaterials } from '@/modules/materials/hooks/useMaterials';
import type { RecipeBuilderProps } from './types';
import type { Recipe } from '../../types/recipe';
import type { TeamAssignment } from '@/shared/components/TeamSelector/types';
import { DecimalUtils } from '@/lib/decimal';

// NEW: Import Cost Utilities
import {
  calculateMaterialsCost,
  calculateLaborCost,
  calculateOverheadCost
} from '../../utils/costCalculations';

// ============================================
// CORE SECTIONS (Immediately Loaded)
// ============================================

import { BasicInfoSection, InputsEditorSection, TeamAssignmentSection } from './sections';
import { RecipeProductionSection } from '../RecipeProductionSection';
import { OutputConfigSection } from './sections/OutputConfigSection';
import { CostSummarySection } from './sections/CostSummarySection';

// ============================================
// LAZY LOADED SECTIONS (Optional)
// ============================================

const InstructionsSection = lazy(() =>
  import('./sections/InstructionsSection').then((m) => ({ default: m.InstructionsSection }))
);

// ============================================
// LOADING FALLBACK
// ============================================

const SectionLoader = () => (
  <Box p="6" textAlign="center">
    <Spinner size="lg" colorPalette="blue" />
  </Box>
);

// ============================================
// MAIN COMPONENT
// ============================================

export const RecipeBuilder = memo(function RecipeBuilder(props: RecipeBuilderProps) {
  const {
    mode,
    entityType,
    complexity = 'standard',
    features = {},
    initialData,
    onSave,
    onCancel,
    hideActions = false,
    customValidation
  } = props;

  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);

  // ============================================
  // CUSTOM HOOK (replaces Provider pattern)
  // ============================================

  const {
    recipe,
    updateRecipe,
    validation,
    isSubmitting,
    saveRecipe,
    features: mergedFeatures
  } = useRecipeBuilder({
    initialData,
    recipeId: props.recipeId, // ✅ Pass recipeId from props
    mode,
    entityType,
    complexity,
    features,
    onSave,
    customValidation
  });

  // ============================================
  // MATERIALS DATA (for MaterialSelector)
  // ============================================

  const queryResult = useMaterials();
  const materials = queryResult.data || [];
  const materialsLoading = queryResult.isLoading;

  // ============================================
  // TEAM ASSIGNMENT STATE
  // ============================================

  // Initialize team assignments from recipe or empty array
  const teamAssignments = useMemo(() => {
    // @ts-expect-error - teamAssignments is a custom field, not in Recipe type yet
    return (recipe.teamAssignments as TeamAssignment[]) || [];
  }, [recipe]);

  const handleTeamChange = useCallback(
    (assignments: TeamAssignment[]) => {
      updateRecipe({
        // @ts-expect-error - teamAssignments is a custom field
        teamAssignments: assignments
      });
    },
    [updateRecipe]
  );

  // ============================================
  // COST CALCULATIONS (Refactored to Utility)
  // ============================================

  const materialsCost = useMemo(() =>
    calculateMaterialsCost(recipe.inputs),
    [recipe.inputs]);

  const laborCost = useMemo(() =>
    calculateLaborCost(teamAssignments),
    [teamAssignments]);

  const overhead = useMemo(() =>
    calculateOverheadCost(materialsCost, recipe.costConfig),
    [materialsCost, recipe.costConfig]);

  // ============================================
  // SECTION VISIBILITY
  // ============================================

  const sections = useMemo(() => {
    const hasInputs = recipe.inputs && recipe.inputs.length > 0;
    const isMinimalMaterial = entityType === 'material' && complexity === 'minimal';

    return {
      basicInfo: !isMinimalMaterial,
      inputs: true,
      team: true,
      output: true,
      production: true,
      costs: mergedFeatures.showCostCalculation && hasInputs,
      instructions: mergedFeatures.showInstructions && !isMinimalMaterial
    };
  }, [complexity, mergedFeatures, recipe.inputs, entityType]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSave = async () => {
    const savedRecipe = await saveRecipe();
    if (!savedRecipe) return;
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handleApplyTemplate = (templateData: Partial<Recipe>) => {
    updateRecipe(templateData);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <Stack gap="6" w="full">
      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        onSelect={handleApplyTemplate}
        entityType={entityType}
      />

      {/* Template Button - Siempre visible en modo create */}
      {mode === 'create' && (
        <Box p="4" bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
          <Flex align="center" gap="4" justify="space-between">
            <Box flex="1">
              <Typography variant="label" color="blue.900">
                ⚡ Inicio Rápido con Templates
              </Typography>
              <Typography variant="caption" color="blue.700">
                Usa una plantilla predefinida para comenzar más rápido (Hamburguesa, Pizza,
                Smoothie, etc.)
              </Typography>
            </Box>
            <Button
              variant="solid"
              colorPalette="blue"
              onClick={() => setIsTemplateSelectorOpen(true)}
            >
              📋 Ver Templates
            </Button>
          </Flex>
        </Box>
      )}

      {/* Progress bar */}
      {isSubmitting && (
        <Progress.Root value={null} colorPalette="blue">
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      )}

      {/* Validation errors */}
      {validation.errors.length > 0 && (
        <Alert.Root status="error" variant="subtle">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Errores de validación</Alert.Title>
            <Alert.Description>
              <Stack gap="1">
                {validation.errors.map((error, i) => (
                  <div key={i}>{error}</div>
                ))}
              </Stack>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Validation warnings */}
      {validation.warnings.length > 0 && (
        <Alert.Root status="warning" variant="subtle">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Advertencias</Alert.Title>
            <Alert.Description>
              <Stack gap="1">
                {validation.warnings.map((warning, i) => (
                  <div key={i}>{warning}</div>
                ))}
              </Stack>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* SECTIONS */}
      {sections.basicInfo && (
        <BasicInfoSection recipe={recipe} updateRecipe={updateRecipe} entityType={entityType} />
      )}

      {sections.inputs && (
        <Box data-testid="recipe-inputs-section">
          <InputsEditorSection
            recipe={recipe}
            updateRecipe={updateRecipe}
            entityType={entityType}
            features={mergedFeatures}
            materials={materials}
            materialsLoading={materialsLoading}
          />
        </Box>
      )}

      {sections.team && (
        <TeamAssignmentSection
          teamAssignments={teamAssignments}
          onTeamChange={handleTeamChange}
        />
      )}

      {sections.output && (
        <Box data-testid="recipe-output-section">
          <OutputConfigSection
            recipe={recipe}
            updateRecipe={updateRecipe}
            features={mergedFeatures}
            materialsCost={materialsCost}
            laborCost={laborCost}
            overhead={overhead}
          />
        </Box>
      )}

      {sections.costs && <CostSummarySection recipe={recipe} features={mergedFeatures} />}

      {sections.production && (
        <RecipeProductionSection
          entityType={entityType}
          recipe={recipe}
          updateRecipe={updateRecipe}
        />
      )}

      {sections.instructions && (
        <Suspense fallback={<SectionLoader />}>
          <InstructionsSection recipe={recipe} updateRecipe={updateRecipe} />
        </Suspense>
      )}

      {/* Action buttons - Hidden when embedded in parent form */}
      {!hideActions && (
        <Flex gap="3" justify="flex-end">
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            colorPalette="blue"
            onClick={handleSave}
            loading={isSubmitting}
            disabled={!validation.isValid}
            data-testid="recipe-save-button"
          >
            {mode === 'create' ? 'Crear Receta' : 'Guardar Cambios'}
          </Button>
        </Flex>
      )}
    </Stack>
  );
});
