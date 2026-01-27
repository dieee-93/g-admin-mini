/**
 * RecipeBuilder v3.0 - Industrial Production Order Form
 *
 * REDESIGNED with "Industrial Production Order" aesthetics:
 * - Reorganized section order for manufacturing flow
 * - Integrated staff assignment with labor cost tracking
 * - Live cost calculations flowing between sections
 * - Removed AdvancedOptions and Substitutions from render
 *
 * NEW SECTION ORDER (Industrial Flow):
 * 1. BasicInfoSection - Recipe identification
 * 2. InputsEditorSection - Materials table (industrial)
 * 3. StaffAssignmentSection - Labor assignment (NEW)
 * 4. OutputConfigSection - Production config with cost preview
 * 5. CostSummarySection - Invoice-style totals
 * 6. RecipeProductionSection - Execution mode
 *
 * Architecture:
 * - Uses custom hook (useRecipeBuilder) following project pattern
 * - Memoized to prevent unnecessary re-renders in modals
 * - Cost calculations flow between sections
 */

import { useMemo, lazy, Suspense, useState, memo, useCallback } from 'react';
import { Stack, Alert, Progress, Flex, Button, Spinner, Box, Typography } from '@/shared/ui';
import { TemplateSelector } from './components/TemplateSelector';
import { useRecipeBuilder } from '../../hooks/useRecipeBuilder';
import { useMaterials } from '@/pages/admin/supply-chain/materials/hooks/useMaterials';
import type { RecipeBuilderProps } from './types';
import type { Recipe } from '../../types/recipe';
import type { StaffAssignment } from '@/shared/components/StaffSelector/types';
import { DecimalUtils } from '@/lib/decimal';

// ============================================
// CORE SECTIONS (Immediately Loaded)
// ============================================

import { BasicInfoSection, InputsEditorSection, StaffAssignmentSection } from './sections';
import { RecipeProductionSection } from '../RecipeProductionSection';

// NEW: Import OutputConfigSection and CostSummarySection (no longer lazy loaded)
import { OutputConfigSection } from './sections/OutputConfigSection';
import { CostSummarySection } from './sections/CostSummarySection';

// ============================================
// LAZY LOADED SECTIONS (Optional)
// ============================================

const InstructionsSection = lazy(() =>
  import('./sections/InstructionsSection').then((m) => ({ default: m.InstructionsSection }))
);

// ❌ NO LONGER RENDERED: AdvancedOptionsSection, SubstitutionsSection

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

/**
 * RecipeBuilder v3.0 - Industrial production order form
 *
 * @component
 * @description
 * Redesigned recipe builder with industrial manufacturing aesthetics.
 * Features reorganized section flow, integrated staff costs, and
 * live cost preview calculations between sections.
 *
 * SECTION FLOW:
 * 1. Basic Info → Recipe identification
 * 2. Materials → Industrial table with LEDs and progress bars
 * 3. Staff → Labor assignment with cost tracking (NEW)
 * 4. Output → Type selector + quantity + live cost preview
 * 5. Cost Summary → Invoice-style totals and breakdown
 * 6. Production → Execution mode selection
 *
 * @example
 * ```tsx
 * <RecipeBuilder
 *   mode="create"
 *   entityType="material"
 *   complexity="standard"
 *   features={{ showCostCalculation: true }}
 *   onSave={(recipe) => console.log('Saved:', recipe)}
 *   onCancel={() => closeModal()}
 * />
 * ```
 *
 * @param {RecipeBuilderProps} props - Component props
 * @returns {React.ReactElement} Rendered builder
 */
export const RecipeBuilder = memo(function RecipeBuilder(props: RecipeBuilderProps) {
  const {
    mode,
    entityType,
    complexity = 'standard',
    features = {},
    initialData,
    onSave,
    onCancel,
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

  const { items: materials, loading: materialsLoading } = useMaterials();

  // ============================================
  // STAFF ASSIGNMENT STATE (NEW)
  // ============================================

  // Initialize staff assignments from recipe or empty array
  const staffAssignments = useMemo(() => {
    // @ts-expect-error - staffAssignments is a custom field, not in Recipe type yet
    return (recipe.staffAssignments as StaffAssignment[]) || [];
  }, [recipe]);

  const handleStaffChange = useCallback(
    (assignments: StaffAssignment[]) => {
      updateRecipe({
        // @ts-expect-error - staffAssignments is a custom field
        staffAssignments: assignments
      });
    },
    [updateRecipe]
  );

  // ============================================
  // COST CALCULATIONS (NEW - for cost preview)
  // ============================================

  /**
   * Calculate materials cost from inputs
   */
  const materialsCost = useMemo(() => {
    if (!recipe.inputs || recipe.inputs.length === 0) return 0;

    return recipe.inputs.reduce((sum, input) => {
      const quantity = input.quantity || 0;
      const unitCost =
        typeof input.item === 'object' && input.item?.unitCost !== undefined
          ? input.item.unitCost
          : 0;

      const inputCost = DecimalUtils.multiply(
        quantity.toString(),
        unitCost.toString(),
        'financial'
      ).toNumber();

      return DecimalUtils.add(sum.toString(), inputCost.toString(), 'financial').toNumber();
    }, 0);
  }, [recipe.inputs]);

  /**
   * Calculate labor cost from staff assignments
   */
  const laborCost = useMemo(() => {
    return staffAssignments.reduce((sum, assignment) => {
      return DecimalUtils.add(
        sum.toString(),
        (assignment.total_cost || 0).toString(),
        'financial'
      ).toNumber();
    }, 0);
  }, [staffAssignments]);

  /**
   * Calculate overhead (if configured)
   */
  const overhead = useMemo(() => {
    const overheadPercentage = recipe.costConfig?.overheadPercentage || 0;
    const overheadFixed = recipe.costConfig?.overheadFixed || 0;

    // Percentage overhead on materials
    const percentageOverhead = DecimalUtils.multiply(
      materialsCost.toString(),
      (overheadPercentage / 100).toString(),
      'financial'
    ).toNumber();

    // Total overhead
    return DecimalUtils.add(
      percentageOverhead.toString(),
      overheadFixed.toString(),
      'financial'
    ).toNumber();
  }, [materialsCost, recipe.costConfig]);

  // ============================================
  // SECTION VISIBILITY
  // ============================================

  const sections = useMemo(() => {
    const hasInputs = recipe.inputs && recipe.inputs.length > 0;
    const isMinimalMaterial = entityType === 'material' && complexity === 'minimal';

    return {
      // BasicInfo: NO mostrar en Material Elaborado (minimal complexity)
      basicInfo: !isMinimalMaterial,
      inputs: true, // Siempre visible
      staff: true, // NEW: Always visible
      output: true, // Siempre visible
      production: true, // Siempre visible (maneja casos internamente)
      costs: mergedFeatures.showCostCalculation && hasInputs,
      instructions: mergedFeatures.showInstructions && !isMinimalMaterial
      // ❌ NO LONGER VISIBLE: advanced, substitutions
    };
  }, [complexity, mergedFeatures, recipe.inputs, entityType]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSave = async () => {
    const savedRecipe = await saveRecipe();
    if (!savedRecipe) {
      // Error ya mostrado por el mutation hook
      return;
    }
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
              flexShrink={0}
            >
              📋 Ver Templates
            </Button>
          </Flex>
        </Box>
      )}

      {/* Progress bar (si está guardando) */}
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

      {/* ========================================== */}
      {/* NEW INDUSTRIAL SECTION ORDER              */}
      {/* ========================================== */}

      {/* SECCIÓN 1: Basic Info (solo si aplica) */}
      {sections.basicInfo && (
        <BasicInfoSection recipe={recipe} updateRecipe={updateRecipe} entityType={entityType} />
      )}

      {/* SECCIÓN 2: Materials / Components (REDESIGNED - Industrial Table) */}
      {sections.inputs && (
        <InputsEditorSection
          recipe={recipe}
          updateRecipe={updateRecipe}
          entityType={entityType}
          features={mergedFeatures}
          materials={materials}
          materialsLoading={materialsLoading}
        />
      )}

      {/* SECCIÓN 3: Staff Assignment (NEW - Industrial Wrapper) */}
      {sections.staff && (
        <StaffAssignmentSection
          staffAssignments={staffAssignments}
          onStaffChange={handleStaffChange}
        />
      )}

      {/* SECCIÓN 4: Output Configuration (REFORMED - Type selector + Cost Preview) */}
      {sections.output && (
        <OutputConfigSection
          recipe={recipe}
          updateRecipe={updateRecipe}
          features={mergedFeatures}
          materialsCost={materialsCost}
          laborCost={laborCost}
          overhead={overhead}
        />
      )}

      {/* SECCIÓN 5: Cost Summary (REDESIGNED - Invoice Style) */}
      {sections.costs && <CostSummarySection recipe={recipe} features={mergedFeatures} />}

      {/* SECCIÓN 6: Production Config (Producir ahora / Programar) */}
      {sections.production && (
        <RecipeProductionSection
          entityType={entityType}
          recipe={recipe}
          updateRecipe={updateRecipe}
        />
      )}

      {/* SECCIÓN 7: Instructions (condicional - lazy loaded) */}
      {sections.instructions && (
        <Suspense fallback={<SectionLoader />}>
          <InstructionsSection recipe={recipe} updateRecipe={updateRecipe} />
        </Suspense>
      )}

      {/* ❌ NO LONGER RENDERED: */}
      {/* - AdvancedOptionsSection (Yield/Waste moved to InputsEditor collapsible) */}
      {/* - SubstitutionsSection (Not part of industrial flow) */}

      {/* Actions */}
      <Flex gap="3" justify="flex-end">
        <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          colorPalette="blue"
          onClick={handleSave}
          loading={isSubmitting}
          disabled={!validation.isValid}
        >
          {mode === 'create' ? 'Crear Receta' : 'Guardar Cambios'}
        </Button>
      </Flex>
    </Stack>
  );
});
