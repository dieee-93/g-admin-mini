/**
 * 🏭 ElaboratedFields Component - Industrial Precision Design
 *
 * Manufacturing control aesthetic for elaborated materials
 * Features: Progressive cost display, LED indicators, industrial typography
 *
 * Design Inspiration: Factory automation, precision manufacturing interfaces
 * Aesthetic: Brutalist refinement with strong visual hierarchy
 *
 * ARCHITECTURE:
 * - Progressive disclosure: User sees costs build up step by step
 * - Immediate feedback: SubtotalCard after each cost section
 * - Comprehensive summary: CostSummaryCard at the end
 * - Production execution: RecipeProductionSection moved to end (Task #8)
 */

import { Box, Stack, Typography, Badge } from '@/shared/ui';
import { type ItemFormData } from '../../../../types';
import { MaterialFormProgressIndicator } from './MaterialFormProgressIndicator';
import { memo, useCallback, useMemo } from 'react';
import type { Recipe } from '@/modules/recipe/types';
import type { ProductionConfig } from '../../../../types/materialTypes';

// Recipe sections (extracted from RecipeBuilder)
import { InputsEditorSection, TeamAssignmentSection } from '@/modules/recipe/components/RecipeBuilder/sections';
import { RecipeProductionSection } from '@/modules/recipe/components/RecipeProductionSection';

// New components (Phase 1)
import { SubtotalCard } from './SubtotalCard';
import { CostSummaryCard } from './CostSummaryCard';
import { EquipmentSection } from './EquipmentSection';
import { OverheadSection } from './OverheadSection';

// Cost calculations
import { calculateMaterialsCost, calculateLaborCost } from '@/modules/recipe/utils/costCalculations';
import { DecimalUtils } from '@/lib/decimal';
import type { TeamAssignment } from '@/shared/components/TeamSelector/types';
import type { ProductionEquipmentUsage } from '@/shared/components/EquipmentSelector';
import { useOverheadRate } from '@/pages/admin/core/settings/hooks';

interface ElaboratedFieldsProps {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  isEditMode?: boolean;
  onRequestEquipmentSelector?: () => void;
}

/**
 * 💡 StatusIndicator - Industrial LED with pulse animation
 * Simulates physical status LEDs found on manufacturing equipment
 */
interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

const StatusIndicator = memo(function StatusIndicator({
  status,
  size = 'md'
}: StatusIndicatorProps) {
  const getStatusColor = (s: typeof status) => {
    switch (s) {
      case 'active': return 'green';
      case 'warning': return 'orange';
      default: return 'gray';
    }
  };

  const getSizeValue = (sz: typeof size) => {
    switch (sz) {
      case 'sm': return '6px';
      case 'lg': return '10px';
      default: return '8px';
    }
  };

  const colorPalette = getStatusColor(status);
  const dimension = getSizeValue(size);

  return (
    <Box
      w={dimension}
      h={dimension}
      borderRadius="full"
      bg="colorPalette.solid"
      colorPalette={colorPalette}
      boxShadow={status === 'active'
        ? `0 0 8px var(--chakra-colors-${colorPalette}-emphasized), 0 0 16px var(--chakra-colors-${colorPalette}-subtle)`
        : 'sm'
      }
      animation={status === 'active' ? 'pulse-led 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined}
      css={{
        '@keyframes pulse-led': {
          '0%, 100%': {
            opacity: 1,
            transform: 'scale(1)'
          },
          '50%': {
            opacity: 0.7,
            transform: 'scale(0.95)'
          }
        }
      }}
    />
  );
});

/**
 * 🏗️ IndustrialContainer - Wrapper with factory aesthetic
 * Features: Thick borders, accent bar, gradient header, shadows
 */
interface IndustrialContainerProps {
  children: React.ReactNode;
  title?: string;
  status?: 'active' | 'inactive' | 'warning';
  colorPalette?: 'blue' | 'green' | 'orange' | 'purple' | 'gray';
  hasGradientTop?: boolean;
}

const IndustrialContainer = memo(function IndustrialContainer({
  children,
  title,
  status = 'inactive',
  colorPalette = 'gray',
  hasGradientTop = false
}: IndustrialContainerProps) {
  return (
    <Box
      p="5"
      bg="bg.panel"
      borderWidth="3px"
      borderColor="border.emphasized"
      borderRadius="xl"
      boxShadow="lg"
      position="relative"
      borderLeftWidth="4px"
      borderLeftColor={status !== 'inactive' ? 'colorPalette.solid' : 'border.muted'}
      colorPalette={colorPalette}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: 'translateY(-1px)',
        boxShadow: 'xl',
        borderColor: 'border.default'
      }}
      css={{
        ...(hasGradientTop && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, var(--chakra-colors-${colorPalette}-emphasized), var(--chakra-colors-${colorPalette}-fg))`,
            borderTopLeftRadius: 'var(--chakra-radii-xl)',
            borderTopRightRadius: 'var(--chakra-radii-xl)'
          }
        })
      }}
    >
      <Stack gap="4">
        {title && (
          <Stack direction="row" align="center" justify="space-between">
            <Typography
              fontSize="2xs"
              fontWeight="700"
              color="fg.muted"
              letterSpacing="wider"
              textTransform="uppercase"
            >
              {title}
            </Typography>
            <StatusIndicator status={status} size="sm" />
          </Stack>
        )}
        {children}
      </Stack>
    </Box>
  );
});

/**
 * 📊 SectionDivider - Visual separator with label
 * Creates strong hierarchy between major sections
 */
interface SectionDividerProps {
  label: string;
}

const SectionDivider = memo(function SectionDivider({ label }: SectionDividerProps) {
  return (
    <Stack direction="row" align="center" gap="3" my="2">
      <Box h="2px" flex="1" bg="border.emphasized" />
      <Typography
        fontSize="xs"
        fontWeight="800"
        color="fg.default"
        letterSpacing="widest"
        textTransform="uppercase"
      >
        {label}
      </Typography>
      <Box h="2px" flex="1" bg="border.emphasized" />
    </Stack>
  );
});

/**
 * 🏭 ElaboratedFields - Main Component
 * Industrial precision form with progressive cost display
 */
export const ElaboratedFields = memo(function ElaboratedFields({
  formData,
  setFormData,
  isEditMode = false,
  onRequestEquipmentSelector
}: ElaboratedFieldsProps) {

  // ============================================
  // COST CALCULATIONS (Progressive)
  // ============================================

  const materialsCost = useMemo(() => {
    const inputs = formData.recipe?.inputs || [];
    return calculateMaterialsCost(inputs);
  }, [formData.recipe?.inputs]);

  const laborCost = useMemo(() => {
    const teamAssignments = (formData.recipe?.teamAssignments as TeamAssignment[]) || [];
    return calculateLaborCost(teamAssignments);
  }, [formData.recipe?.teamAssignments]);

  const equipmentCost = useMemo(() => {
    const equipment = formData.production_config?.equipment_usage || [];
    return equipment.reduce((sum, eq) => sum + eq.total_cost, 0);
  }, [formData.production_config?.equipment_usage]);

  // Calculate labor hours for overhead
  const laborHours = useMemo(() => {
    const teamAssignments = (formData.recipe?.teamAssignments as TeamAssignment[]) || [];
    return teamAssignments.reduce((sum, assignment) => {
      const hours = assignment.durationMinutes / 60;
      return sum + hours;
    }, 0);
  }, [formData.recipe?.teamAssignments]);

  // Overhead calculation (automatic from Settings)
  const overheadRate = useOverheadRate();
  const overheadCost = laborHours * overheadRate;

  const totalCost = useMemo(() =>
    DecimalUtils.add(
      DecimalUtils.add(materialsCost, laborCost, 'financial'),
      DecimalUtils.add(equipmentCost, overheadCost, 'financial'),
      'financial'
    ).toNumber(),
    [materialsCost, laborCost, equipmentCost, overheadCost]
  );

  // ============================================
  // HANDLERS
  // ============================================

  const handleRecipeUpdate = useCallback((updates: Partial<Recipe>) => {
    setFormData(prev => ({
      ...prev,
      recipe: { ...prev.recipe, ...updates } as Recipe
    }));
  }, [setFormData]);

  const handleEquipmentChange = useCallback((equipment: ProductionEquipmentUsage[]) => {
    setFormData(prev => ({
      ...prev,
      production_config: {
        ...prev.production_config,
        equipment_usage: equipment,
        equipment_cost: equipment.reduce((sum, eq) => sum + eq.total_cost, 0)
      }
    }));
  }, [setFormData]);

  return (
    <Stack gap="6" w="full">

      {/* ========================================
          SECTION 1: Header with Status Badge
          ======================================== */}
      <Stack direction="row" align="center" justify="space-between">
        <Stack direction="row" align="center" gap="3">
          <StatusIndicator status="active" size="md" />
          <Typography
            fontSize="xs"
            fontWeight="800"
            color="fg.muted"
            letterSpacing="widest"
            textTransform="uppercase"
            data-testid="elaborated-header"
          >
            Material Elaborado
          </Typography>
        </Stack>

        <Badge
          colorPalette="blue"
          variant="solid"
          px="3"
          py="1"
          fontSize="2xs"
          fontWeight="800"
          letterSpacing="wide"
        >
          REQUIERE RECETA
        </Badge>
      </Stack>

      {/* ========================================
          SECTION 2: Progress Indicator
          ======================================== */}
      <MaterialFormProgressIndicator
        hasRecipe={!!formData.recipe_id}
        hasProductionConfig={!!formData.production_config}
      />

      {/* ========================================
          SECTION 3: Information Alert
          ======================================== */}
      <Box
        p="5"
        bg="bg.panel"
        borderWidth="2px"
        borderColor="colorPalette.emphasized"
        colorPalette="orange"
        borderRadius="lg"
        borderLeftWidth="4px"
        borderLeftColor="colorPalette.solid"
        boxShadow="md"
        position="relative"
        data-testid="elaborated-info-alert"
        _before={{
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          w: '4px',
          h: 'full',
          bg: 'linear-gradient(180deg, var(--chakra-colors-orange-solid), var(--chakra-colors-orange-emphasized))',
          borderTopLeftRadius: 'lg',
          borderBottomLeftRadius: 'lg'
        }}
      >
        <Stack gap="3">
          {/* Alert Header */}
          <Stack direction="row" align="center" gap="2">
            <Box
              w="6px"
              h="6px"
              borderRadius="full"
              bg="colorPalette.fg"
              colorPalette="orange"
              animation="pulse-warning 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              css={{
                '@keyframes pulse-warning': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 }
                }
              }}
            />
            <Typography
              fontSize="xs"
              fontWeight="800"
              color="colorPalette.fg"
              colorPalette="orange"
              letterSpacing="wider"
              textTransform="uppercase"
            >
              Información Importante
            </Typography>
          </Stack>

          {/* Alert Content */}
          <Stack gap="1" pl="2">
            <Stack direction="row" align="flex-start" gap="2">
              <Box
                as="span"
                color="colorPalette.fg"
                colorPalette="orange"
                fontWeight="700"
                fontSize="xs"
                mt="0.5"
              >
                ▸
              </Box>
              <Typography fontSize="2xs" color="fg.muted" lineHeight="relaxed">
                Requiere receta con ingredientes y cantidades
              </Typography>
            </Stack>

            <Stack direction="row" align="flex-start" gap="2">
              <Box
                as="span"
                color="colorPalette.fg"
                colorPalette="orange"
                fontWeight="700"
                fontSize="xs"
                mt="0.5"
              >
                ▸
              </Box>
              <Typography fontSize="2xs" color="fg.muted" lineHeight="relaxed">
                Costos se calculan automáticamente desde Settings
              </Typography>
            </Stack>

            <Stack direction="row" align="flex-start" gap="2">
              <Box
                as="span"
                color="colorPalette.fg"
                colorPalette="orange"
                fontWeight="700"
                fontSize="xs"
                mt="0.5"
              >
                ▸
              </Box>
              <Typography fontSize="2xs" color="fg.muted" lineHeight="relaxed">
                Verás subtotales progresivos mientras configuras
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      {/* ========================================
          SECTION 4: BOM (Bill of Materials)
          ======================================== */}
      <Box data-testid="bom-section">
        <SectionDivider label="1️⃣ LISTA DE MATERIALES (BOM)" />

        <Box mt="5">
          <IndustrialContainer
            title="Ingredientes"
            status="active"
            colorPalette="green"
            hasGradientTop
          >
            <InputsEditorSection
              recipe={formData.recipe || { inputs: [] } as Recipe}
              updateRecipe={handleRecipeUpdate}
              entityType="material"
              features={{
                showCostCalculation: true,
                showScalingLite: true,
                showInstructions: false,
                allowProductInputs: false
              }}
              materials={[]}
              materialsLoading={false}
            />
          </IndustrialContainer>

          <Box mt="4">
            <SubtotalCard
              label="Materiales"
              value={materialsCost}
              icon="💰"
              colorPalette="green"
            />
          </Box>
        </Box>
      </Box>

      {/* ========================================
          SECTION 5: MANO DE OBRA
          ======================================== */}
      <Box data-testid="labor-section">
        <SectionDivider label="2️⃣ MANO DE OBRA" />

        <Box mt="5">
          <IndustrialContainer
            title="Personal"
            status="active"
            colorPalette="blue"
            hasGradientTop
          >
            <TeamAssignmentSection
              teamAssignments={(formData.recipe?.teamAssignments as TeamAssignment[]) || []}
              onTeamChange={(assignments) => handleRecipeUpdate({ teamAssignments: assignments as any })}
            />
          </IndustrialContainer>

          <Box mt="4">
            <SubtotalCard
              label="Mano de Obra"
              value={laborCost}
              icon="👷"
              colorPalette="blue"
            />
          </Box>
        </Box>
      </Box>

      {/* ========================================
          SECTION 6: EQUIPAMIENTO
          ======================================== */}
      <Box data-testid="equipment-section">
        <SectionDivider label="3️⃣ EQUIPAMIENTO" />

        <Box mt="5">
          <EquipmentSection
            equipment={formData.production_config?.equipment_usage || []}
            onChange={handleEquipmentChange}
            onRequestEquipmentSelector={onRequestEquipmentSelector}
          />

          <Box mt="4">
            <SubtotalCard
              label="Equipamiento"
              value={equipmentCost}
              icon="🏭"
              colorPalette="purple"
            />
          </Box>
        </Box>
      </Box>

      {/* ========================================
          SECTION 7: OVERHEAD
          ======================================== */}
      <Box data-testid="overhead-section">
        <SectionDivider label="4️⃣ OVERHEAD (Costos Indirectos)" />

        <Box mt="5">
          <OverheadSection
            laborHours={laborHours}
          />
        </Box>
      </Box>

      {/* ========================================
          SECTION 8: RESUMEN DE COSTOS
          ======================================== */}
      <Box data-testid="cost-summary-section">
        <Box mt="6" mb="6">
          <CostSummaryCard
            materialsCost={materialsCost}
            laborCost={laborCost}
            equipmentCost={equipmentCost}
            overheadCost={overheadCost}
            totalCost={totalCost}
          />
        </Box>
      </Box>

      {/* ========================================
          SECTION 9: EJECUCIÓN DE PRODUCCIÓN
          ======================================== */}
      <Box data-testid="production-execution-section">
        <SectionDivider label="5️⃣ EJECUCIÓN DE PRODUCCIÓN" />

        <Box mt="5">
          <RecipeProductionSection
            entityType="material"
            recipe={formData.recipe || {} as Recipe}
            updateRecipe={handleRecipeUpdate}
          />
        </Box>
      </Box>

    </Stack>
  );
});
