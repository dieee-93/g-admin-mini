# Material Elaborado Form Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the elaborated material form with progressive disclosure, automatic overhead calculation, and real-time cost feedback following manufacturing best practices (GAAP-compliant).

**Architecture:** Modular component approach with separated concerns - split ProductionConfigSection into EquipmentSection and OverheadSection, create reusable SubtotalCard and CostSummaryCard components, integrate automatic overhead calculation from Settings, and move RecipeProductionSection to the end with enhanced yield tracking.

**Tech Stack:** React, TypeScript, Chakra UI v3, Zustand, DecimalUtils, TanStack Query, Supabase

---

## Phase 1: Create Reusable Components (Foundation)

### Task 1.1: Create SubtotalCard Component

**Files:**
- Create: `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/SubtotalCard.tsx`

**Step 1: Write the component structure**

Create the SubtotalCard component that will display cost subtotals with icons and check marks:

```typescript
/**
 * SubtotalCard - Reusable component for cost subtotals
 *
 * Shows a highlighted card with an icon, label, and monetary value
 */

import { Box, Stack, Typography, Flex } from '@/shared/ui';
import { CheckIcon } from '@heroicons/react/24/solid';
import { memo } from 'react';

interface SubtotalCardProps {
  label: string;
  value: number;
  icon?: string;
  colorPalette?: 'green' | 'blue' | 'purple' | 'orange';
}

export const SubtotalCard = memo(function SubtotalCard({
  label,
  value,
  icon = '💰',
  colorPalette = 'green'
}: SubtotalCardProps) {
  return (
    <Box
      p="3"
      bg={`${colorPalette}.50`}
      borderLeftWidth="4px"
      borderLeftColor={`${colorPalette}.500`}
      borderRadius="md"
      boxShadow="sm"
    >
      <Flex justify="space-between" align="center">
        <Flex align="center" gap="2">
          <Typography fontSize="md">{icon}</Typography>
          <Typography fontSize="sm" fontWeight="600" color="fg.default">
            Subtotal {label}
          </Typography>
          <CheckIcon style={{ width: '16px', height: '16px', color: 'green' }} />
        </Flex>
        <Typography fontSize="lg" fontWeight="800" color={`${colorPalette}.700`}>
          ${value.toFixed(2)}
        </Typography>
      </Flex>
    </Box>
  );
});
```

**Step 2: Export the component**

Add export to index file (if exists) or use direct imports.

**Step 3: Verify the component renders**

No test needed yet - visual verification will happen when integrated.

**Step 4: Commit**

```bash
git add src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/SubtotalCard.tsx
git commit -m "feat(materials): add SubtotalCard component for progressive cost display

- Reusable card component for showing cost subtotals
- Supports customizable color palettes and icons
- Industrial design with check mark indicator

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.2: Create CostSummaryCard Component

**Files:**
- Create: `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/CostSummaryCard.tsx`

**Step 1: Write the component structure**

Create the comprehensive cost summary card:

```typescript
/**
 * CostSummaryCard - Final cost breakdown with visualization
 *
 * Shows complete cost structure:
 * - Direct costs (materials, labor, equipment)
 * - Indirect costs (overhead)
 * - Total manufacturing cost
 */

import { Box, Stack, Typography, Flex } from '@/shared/ui';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { memo } from 'react';

interface CostSummaryCardProps {
  materialsCost: number;
  laborCost: number;
  equipmentCost: number;
  overheadCost: number;
  totalCost: number;
}

const CostRow = memo(function CostRow({
  label,
  value,
  bold
}: {
  label: string;
  value: number;
  bold?: boolean
}) {
  return (
    <Flex justify="space-between">
      <Typography fontSize="sm" fontWeight={bold ? '700' : '400'}>
        {label}
      </Typography>
      <Typography fontSize="sm" fontWeight={bold ? '700' : '600'}>
        ${value.toFixed(2)}
      </Typography>
    </Flex>
  );
});

export const CostSummaryCard = memo(function CostSummaryCard({
  materialsCost,
  laborCost,
  equipmentCost,
  overheadCost,
  totalCost
}: CostSummaryCardProps) {
  const directCost = materialsCost + laborCost + equipmentCost;

  return (
    <Box
      p="6"
      bg="blue.50"
      borderWidth="3px"
      borderColor="blue.200"
      borderRadius="xl"
      boxShadow="xl"
    >
      <Stack gap="4">
        {/* Header */}
        <Flex align="center" gap="2">
          <CalculatorIcon style={{ width: '24px', height: '24px' }} />
          <Typography fontSize="sm" fontWeight="800" textTransform="uppercase">
            Resumen de Costos Totales
          </Typography>
        </Flex>

        <Box h="1px" bg="blue.300" />

        {/* Cost Breakdown */}
        <Stack gap="2">
          <Typography fontSize="sm" fontWeight="700" color="fg.muted">
            COSTOS DIRECTOS:
          </Typography>

          <CostRow label="Materiales" value={materialsCost} />
          <CostRow label="Mano de Obra" value={laborCost} />
          <CostRow label="Equipamiento" value={equipmentCost} />

          <Box pl="4" pt="1" pb="1">
            <CostRow
              label="Subtotal Directo"
              value={directCost}
              bold
            />
          </Box>

          <Box h="1px" bg="blue.200" mt="2" mb="2" />

          <Typography fontSize="sm" fontWeight="700" color="fg.muted">
            COSTOS INDIRECTOS:
          </Typography>

          <CostRow label="Overhead" value={overheadCost} />

          <Box h="2px" bg="blue.400" mt="3" mb="3" />

          {/* Total */}
          <Flex justify="space-between" align="center">
            <Typography fontSize="lg" fontWeight="900" textTransform="uppercase">
              COSTO TOTAL PRODUCCIÓN
            </Typography>
            <Typography fontSize="2xl" fontWeight="900" color="blue.700">
              ${totalCost.toFixed(2)}
            </Typography>
          </Flex>

          <Box h="2px" bg="blue.400" />

          {/* Info */}
          <Typography fontSize="xs" color="fg.muted" fontStyle="italic" textAlign="center">
            ℹ️ Costo unitario se calculará con cantidad real producida
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
});
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build` or `tsc --noEmit`
Expected: No errors related to this component

**Step 3: Commit**

```bash
git add src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/CostSummaryCard.tsx
git commit -m "feat(materials): add CostSummaryCard for complete cost breakdown

- Shows direct costs (materials, labor, equipment)
- Shows indirect costs (overhead)
- Displays total manufacturing cost
- Industrial design with visual hierarchy

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Split ProductionConfigSection

### Task 2.1: Create EquipmentSection Component

**Files:**
- Create: `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/EquipmentSection.tsx`

**Step 1: Extract equipment logic from ProductionConfigSection**

Read the current ProductionConfigSection to understand the equipment handling:

```typescript
/**
 * EquipmentSection - Equipment selection and cost calculation
 *
 * Allows user to add equipment with hours used.
 * Equipment hourly_cost_rate includes all direct costs.
 */

import { Box, Stack, Typography, Button } from '@/shared/ui';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { memo, useCallback } from 'react';
import type { ProductionEquipmentUsage } from '@/shared/components/EquipmentSelector';

interface EquipmentSectionProps {
  equipment: ProductionEquipmentUsage[];
  onChange: (equipment: ProductionEquipmentUsage[]) => void;
  onRequestEquipmentSelector?: () => void;
}

export const EquipmentSection = memo(function EquipmentSection({
  equipment,
  onChange,
  onRequestEquipmentSelector
}: EquipmentSectionProps) {

  const handleRemove = useCallback((id: string) => {
    onChange(equipment.filter(eq => eq.id !== id));
  }, [equipment, onChange]);

  const totalCost = equipment.reduce((sum, eq) => sum + eq.total_cost, 0);

  return (
    <Box
      p="5"
      bg="bg.panel"
      borderWidth="3px"
      borderColor="border.emphasized"
      borderRadius="xl"
      boxShadow="lg"
      borderLeftWidth="4px"
      borderLeftColor="purple.500"
    >
      <Stack gap="4">
        {/* Header */}
        <Stack direction="row" align="center" justify="space-between">
          <Typography fontSize="sm" fontWeight="700">
            3️⃣ EQUIPAMIENTO
          </Typography>
          <Button
            size="sm"
            colorPalette="purple"
            onClick={onRequestEquipmentSelector}
            disabled={!onRequestEquipmentSelector}
          >
            <PlusIcon style={{ width: 16, height: 16 }} />
            Agregar Equipo
          </Button>
        </Stack>

        {/* Info about hourly rate */}
        <Box p="2" bg="purple.50" borderRadius="md" borderWidth="1px" borderColor="purple.200">
          <Typography fontSize="xs" color="purple.700">
            ℹ️ El hourly rate incluye: electricidad del equipo, gas, depreciación y mantenimiento
          </Typography>
        </Box>

        {/* Equipment List */}
        {equipment.length === 0 ? (
          <Box p="4" bg="bg.subtle" borderRadius="md" textAlign="center">
            <Typography color="fg.muted" fontSize="sm">
              No hay equipamiento configurado
            </Typography>
          </Box>
        ) : (
          <Stack gap="2">
            {equipment.map((eq) => (
              <Box
                key={eq.id}
                p="3"
                bg="bg.subtle"
                borderRadius="md"
                borderWidth="1px"
                borderColor="border.default"
              >
                <Stack direction="row" align="center" justify="space-between">
                  <Stack gap="1">
                    <Typography fontSize="sm" fontWeight="600">
                      {eq.equipment_name}
                    </Typography>
                    <Typography fontSize="xs" color="fg.muted">
                      {eq.hours_used}h × ${eq.hourly_cost_rate.toFixed(2)}/h = $
                      {eq.total_cost.toFixed(2)}
                    </Typography>
                    {eq.notes && (
                      <Typography fontSize="xs" color="fg.muted" fontStyle="italic">
                        {eq.notes}
                      </Typography>
                    )}
                  </Stack>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => handleRemove(eq.id)}
                  >
                    <TrashIcon style={{ width: 14, height: 14 }} />
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
});
```

**Step 2: Verify TypeScript compiles**

Run: `tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/EquipmentSection.tsx
git commit -m "feat(materials): extract EquipmentSection from ProductionConfigSection

- Separated equipment management into dedicated component
- Clear display of hourly rates and total costs
- Supports equipment removal with functional updates

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.2: Create OverheadSection Component (Manual for now)

**Files:**
- Create: `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/OverheadSection.tsx`

**Step 1: Create basic overhead section with manual inputs**

This will be a temporary implementation until we have the Settings integration:

```typescript
/**
 * OverheadSection - Overhead calculation (Manual for Phase 2, Automatic in Phase 3)
 *
 * Currently allows manual percentage and fixed overhead entry.
 * Will be replaced with automatic calculation from Settings in Phase 3.
 */

import { Box, Stack, Typography, InputField, Flex } from '@/shared/ui';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { memo, useCallback } from 'react';

interface OverheadSectionProps {
  overheadPercentage?: number;
  overheadFixed?: number;
  directCost: number;
  onChange: (field: 'overhead_percentage' | 'overhead_fixed', value: number) => void;
}

export const OverheadSection = memo(function OverheadSection({
  overheadPercentage = 0,
  overheadFixed = 0,
  directCost,
  onChange
}: OverheadSectionProps) {

  const handlePercentageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0;
      onChange('overhead_percentage', value);
    },
    [onChange]
  );

  const handleFixedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0;
      onChange('overhead_fixed', value);
    },
    [onChange]
  );

  const calculatedOverhead = (directCost * overheadPercentage / 100) + overheadFixed;

  return (
    <Box
      p="5"
      bg="bg.panel"
      borderWidth="3px"
      borderColor="border.emphasized"
      borderRadius="xl"
      boxShadow="lg"
    >
      <Stack gap="4">
        {/* Header */}
        <Typography fontSize="sm" fontWeight="700">
          4️⃣ OVERHEAD (Costos Indirectos)
        </Typography>

        {/* Temporary notice */}
        <Box p="3" bg="orange.50" borderRadius="md" borderWidth="1px" borderColor="orange.200">
          <Stack direction="row" align="flex-start" gap="2">
            <InformationCircleIcon style={{ width: 20, height: 20, color: 'orange' }} />
            <Typography fontSize="xs" color="orange.700">
              Modo manual temporal. En la siguiente fase, el overhead se calculará automáticamente desde Settings.
            </Typography>
          </Stack>
        </Box>

        {/* Manual inputs */}
        <Stack gap="3">
          <InputField
            label="Overhead Porcentual (%)"
            type="number"
            step="0.1"
            value={overheadPercentage}
            onChange={handlePercentageChange}
            helperText="Porcentaje sobre costos directos"
          />

          <InputField
            label="Overhead Fijo ($)"
            type="number"
            step="0.01"
            value={overheadFixed}
            onChange={handleFixedChange}
            helperText="Monto fijo adicional"
          />

          {/* Calculated result */}
          <Box p="4" bg="orange.100" borderRadius="md">
            <Flex justify="space-between" align="center">
              <Typography fontSize="md" fontWeight="700">
                📊 Overhead Calculado:
              </Typography>
              <Typography fontSize="xl" fontWeight="800" color="orange.700">
                ${calculatedOverhead.toFixed(2)}
              </Typography>
            </Flex>
            <Typography fontSize="xs" color="fg.muted" mt="1">
              (${directCost.toFixed(2)} × {overheadPercentage}%) + ${overheadFixed.toFixed(2)}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
});
```

**Step 2: Commit**

```bash
git add src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/OverheadSection.tsx
git commit -m "feat(materials): add OverheadSection with manual calculation

- Temporary manual overhead calculation (percentage + fixed)
- Clear display of calculated overhead
- To be replaced with automatic calculation in Phase 3

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Refactor ElaboratedFields

### Task 3.1: Update ElaboratedFields to use new components

**Files:**
- Modify: `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ElaboratedFields.tsx`

**Step 1: Add imports for new components**

At the top of ElaboratedFields.tsx, add:

```typescript
import { SubtotalCard } from './SubtotalCard';
import { CostSummaryCard } from './CostSummaryCard';
import { EquipmentSection } from './EquipmentSection';
import { OverheadSection } from './OverheadSection';
import { InputsEditorSection } from '@/modules/recipe/components/RecipeBuilder/sections/InputsEditorSection';
import { TeamAssignmentSection } from '@/modules/recipe/components/RecipeBuilder/sections/TeamAssignmentSection';
import { calculateMaterialsCost, calculateLaborCost } from '@/modules/recipe/utils/costCalculations';
import { DecimalUtils } from '@/lib/decimal';
```

**Step 2: Add cost calculation hooks**

Inside the ElaboratedFields component, before the return statement, add:

```typescript
  // Calculate costs progressively
  const materialsCost = useMemo(() =>
    calculateMaterialsCost(formData.recipe?.inputs || []),
    [formData.recipe?.inputs]
  );

  const laborCost = useMemo(() =>
    calculateLaborCost(formData.recipe?.teamAssignments || []),
    [formData.recipe?.teamAssignments]
  );

  const equipmentCost = useMemo(() => {
    const equipment = formData.production_config?.equipment_usage || [];
    return equipment.reduce((sum, eq) => sum + eq.total_cost, 0);
  }, [formData.production_config?.equipment_usage]);

  const overheadPercentage = formData.production_config?.overhead_percentage || 0;
  const overheadFixed = formData.production_config?.overhead_fixed || 0;
  const directCost = materialsCost + laborCost + equipmentCost;
  const overheadCost = (directCost * overheadPercentage / 100) + overheadFixed;

  const totalCost = useMemo(() =>
    DecimalUtils.add(
      DecimalUtils.add(materialsCost, laborCost, 'financial'),
      DecimalUtils.add(equipmentCost, overheadCost, 'financial'),
      'financial'
    ).toNumber(),
    [materialsCost, laborCost, equipmentCost, overheadCost]
  );
```

**Step 3: Add handlers for new sections**

```typescript
  const handleRecipeUpdate = useCallback((recipe: Partial<Recipe>) => {
    setFormData(prev => ({
      ...prev,
      recipe: { ...prev.recipe, ...recipe } as Recipe
    }));
  }, [setFormData]);

  const handleEquipmentChange = useCallback((equipment: ProductionEquipmentUsage[]) => {
    handleProductionConfigChange(prev => ({
      ...prev,
      equipment_usage: equipment,
      equipment_cost: equipment.reduce((sum, eq) => sum + eq.total_cost, 0)
    }));
  }, [handleProductionConfigChange]);

  const handleOverheadChange = useCallback((
    field: 'overhead_percentage' | 'overhead_fixed',
    value: number
  ) => {
    handleProductionConfigChange(prev => ({
      ...prev,
      [field]: value
    }));
  }, [handleProductionConfigChange]);
```

**Step 4: Replace RecipeBuilder section with individual sections**

Find the RecipeBuilder section in the return statement and replace it with:

```typescript
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
              inputs={formData.recipe?.inputs || []}
              onChange={(inputs) => handleRecipeUpdate({ inputs })}
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
              teamAssignments={formData.recipe?.teamAssignments || []}
              onChange={(assignments) => handleRecipeUpdate({ teamAssignments: assignments })}
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
            overheadPercentage={overheadPercentage}
            overheadFixed={overheadFixed}
            directCost={directCost}
            onChange={handleOverheadChange}
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
```

**Step 5: Verify the component renders without errors**

Run: `npm run dev`
Check: The form should display without errors, showing all new sections

**Step 6: Verify TypeScript compiles**

Run: `tsc --noEmit`
Expected: No type errors

**Step 7: Commit**

```bash
git add src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ElaboratedFields.tsx
git commit -m "feat(materials): refactor ElaboratedFields with progressive cost display

- Split RecipeBuilder into individual sections (BOM, Labor, Equipment)
- Add SubtotalCard after each section for immediate feedback
- Add comprehensive CostSummaryCard showing complete breakdown
- Implement OverheadSection with manual calculation
- Maintain all existing functionality with improved UX

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Remove ProductionConfigSection (if no longer needed)

### Task 4.1: Verify ProductionConfigSection is not used elsewhere

**Files:**
- Check: Search for imports of ProductionConfigSection across codebase

**Step 1: Search for usages**

Run: `grep -r "ProductionConfigSection" src/`
Expected: Should only appear in ElaboratedFields.tsx (which we just removed)

**Step 2: If not used elsewhere, remove the file**

```bash
git rm src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ProductionConfigSection.tsx
```

**Step 3: Commit**

```bash
git commit -m "refactor(materials): remove ProductionConfigSection

- Replaced by EquipmentSection and OverheadSection
- Logic split into specialized components for better maintainability

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 5: Enhance RecipeProductionSection

### Task 5.1: Add totalCost and yield calculation to RecipeProductionSection

**Files:**
- Modify: `src/modules/recipe/components/RecipeProductionSection.tsx`

**Step 1: Update component props to accept totalCost**

Modify the RecipeProductionSectionProps interface:

```typescript
export interface RecipeProductionSectionProps {
  entityType: 'material' | 'product' | 'service' | 'kit'
  recipe: Partial<Recipe>
  updateRecipe?: (updates: Partial<Recipe>) => void
  totalCost?: number  // NEW: Total manufacturing cost from parent
  materialName?: string  // NEW: For display
  materialUnit?: string  // NEW: For unit cost calculation
}
```

**Step 2: Add unit cost calculation**

Inside the component, after the existing useMemo hooks, add:

```typescript
  // Calculate unit cost based on actual quantity
  const unitCost = useMemo(() => {
    if (!totalCost || !config.actualQuantity || config.actualQuantity === 0) return null;
    return DecimalUtils.divide(
      totalCost.toString(),
      config.actualQuantity.toString(),
      'financial'
    ).toNumber();
  }, [totalCost, config.actualQuantity]);

  // Calculate yield percentage
  const yieldPercentage = useMemo(() => {
    if (!config.expectedQuantity || !config.actualQuantity) return 100;
    return (config.actualQuantity / config.expectedQuantity) * 100;
  }, [config.expectedQuantity, config.actualQuantity]);

  // Determine if yield is below threshold
  const lowYield = yieldPercentage < 95;
```

**Step 3: Update the immediate mode UI to show yield and unit cost**

Find the immediate mode section and add after the actualQuantity input:

```typescript
            {/* Show yield and unit cost */}
            {config.actualQuantity && unitCost && (
              <Box p="4" bg="blue.50" borderRadius="md" borderWidth="2px" borderColor="blue.200">
                <Stack gap="2">
                  <Typography fontWeight="bold" fontSize="md" color="blue.700">
                    ✅ Yield: {yieldPercentage.toFixed(1)}%
                  </Typography>
                  <Typography fontWeight="bold" fontSize="lg" color="blue.800">
                    COSTO UNITARIO REAL: ${unitCost.toFixed(2)}/{materialUnit || recipe.output?.unit || 'unit'}
                  </Typography>
                  {lowYield && (
                    <Typography color="orange.600" fontSize="sm">
                      ⚠️ Mayor que estimado por merma {(100 - yieldPercentage).toFixed(1)}%
                    </Typography>
                  )}
                  <Typography fontSize="xs" color="fg.muted" mt="2">
                    Cálculo: ${totalCost?.toFixed(2)} ÷ {config.actualQuantity} {materialUnit}
                  </Typography>
                </Stack>
              </Box>
            )}
```

**Step 4: Update batch size display**

Replace the "Expected Quantity" read-only field with an editable batch size input:

```typescript
            {/* Batch Size Input */}
            <InputField
              label="Batch Size (Objetivo)"
              type="number"
              value={config.expectedQuantity}
              onChange={(e) => handleProduceNowChange('expectedQuantity', parseFloat(e.target.value) || 0)}
              helperText="Cuánto intentarás producir"
            />
```

**Step 5: Remove "none" mode option**

Find the RadioGroup for mode selection and remove the "Solo definir receta" option:

```typescript
        <RadioGroup value={mode} onValueChange={handleModeChange}>
          <RadioItem value="immediate">Producir ahora ⚡</RadioItem>
          <RadioItem value="scheduled">Programar producción 📅</RadioItem>
        </RadioGroup>
```

**Step 6: Verify TypeScript compiles**

Run: `tsc --noEmit`
Expected: No type errors

**Step 7: Commit**

```bash
git add src/modules/recipe/components/RecipeProductionSection.tsx
git commit -m "feat(recipe): enhance RecipeProductionSection with yield tracking

- Accept totalCost prop from parent for accurate unit cost calculation
- Calculate real unit cost based on actual quantity produced
- Display yield percentage with visual feedback
- Add editable batch size input
- Remove 'none' mode (materials always need production config)
- Show cost variance warning when yield < 95%

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 5.2: Update ElaboratedFields to pass totalCost to RecipeProductionSection

**Files:**
- Modify: `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ElaboratedFields.tsx`

**Step 1: Import RecipeProductionSection**

At the top of the file, add:

```typescript
import { RecipeProductionSection } from '@/modules/recipe/components/RecipeProductionSection';
```

**Step 2: Add RecipeProductionSection to the end of the form**

After the CostSummaryCard section, add:

```typescript
      {/* ========================================
          SECTION 9: EJECUCIÓN DE PRODUCCIÓN
          ======================================== */}
      <Box data-testid="production-execution-section">
        <SectionDivider label="5️⃣ EJECUCIÓN DE PRODUCCIÓN" />

        <Box mt="5">
          <RecipeProductionSection
            entityType="material"
            recipe={formData.recipe || {}}
            updateRecipe={handleRecipeUpdate}
            totalCost={totalCost}
            materialName={formData.name}
            materialUnit={formData.unit}
          />
        </Box>
      </Box>
```

**Step 3: Verify the form displays production section with cost info**

Run: `npm run dev`
Check: Production section should show at the end with unit cost calculations

**Step 4: Commit**

```bash
git add src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ElaboratedFields.tsx
git commit -m "feat(materials): integrate enhanced RecipeProductionSection

- Pass totalCost to RecipeProductionSection for unit cost calculation
- Position production section at end after cost summary
- User sees complete costs before configuring production

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 6: Testing and Validation

### Task 6.1: Manual testing of the complete flow

**Step 1: Test creating a new elaborated material**

Manual test steps:
1. Navigate to Materials page
2. Click "New Material"
3. Select "Elaborated" type
4. Fill in basic info (name, category, unit)
5. Add ingredients to BOM - verify subtotal updates
6. Add team assignments - verify subtotal updates
7. Add equipment - verify subtotal updates
8. Verify overhead calculation shows correct value
9. Verify cost summary shows all breakdowns correctly
10. Configure production (produce now)
11. Enter batch size and actual quantity
12. Verify yield percentage and unit cost display
13. Save material

Expected: All sections display correctly, costs calculate accurately, no errors

**Step 2: Test editing an existing elaborated material**

Manual test steps:
1. Open an existing elaborated material
2. Verify all sections load with existing data
3. Modify ingredients - verify costs recalculate
4. Modify team - verify costs recalculate
5. Modify equipment - verify costs recalculate
6. Save changes

Expected: Edit mode works correctly, calculations remain accurate

**Step 3: Document any issues found**

Create notes of any bugs or UX issues to address.

**Step 4: Commit test results**

```bash
git add docs/plans/2026-02-09-elaborated-material-form-redesign-IMPLEMENTATION.md
git commit -m "docs(materials): document manual testing results for form redesign

- Tested create flow with all new sections
- Tested edit flow with existing materials
- Verified progressive cost display functionality
- Verified yield calculation and unit cost display

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 7: Automatic Overhead (Future Enhancement)

> **Note:** This phase is documented for future implementation. It requires Settings module integration and is NOT part of the current scope.

### Task 7.1: Create Overhead Configuration in Settings

**Files:**
- Create: `src/modules/settings/components/OverheadConfig.tsx`
- Create: `src/modules/settings/hooks/useOverheadConfig.ts`
- Create: Database migration for overhead settings

**Overview:**
- Settings page for configuring overhead expenses (rent, utilities, supervision, etc.)
- Calculation method selection (per labor hour, per machine hour, per direct cost %)
- Automatic rate calculation based on monthly totals
- Integration with Cash/Expenses module for auto-population

**Implementation Details:**
See design document section 5.5 for complete component code.

---

### Task 7.2: Update OverheadSection to use automatic calculation

**Files:**
- Modify: `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/OverheadSection.tsx`

**Overview:**
- Replace manual inputs with automatic calculation
- Fetch overhead rate from Settings
- Display calculation breakdown (labor hours × rate)
- Make non-editable with link to Settings for configuration

**Implementation Details:**
See design document section 5.4 for complete component code.

---

## Phase 8: Equipment Module Enhancement (Future)

> **Note:** This phase is documented for future implementation. It requires Equipment module updates and database migrations.

### Task 8.1: Add electricity calculation to Equipment module

**Files:**
- Create: Database migration for equipment electricity fields
- Modify: Equipment form to add power consumption inputs
- Modify: Equipment cost calculation logic

**Overview:**
- Add fields: power_consumption_kw, load_factor, electricity_rate_per_kwh
- Automatic calculation: energy_cost = power_kw × load_factor × rate
- Display breakdown in equipment selector
- Validation to prevent duplication (equipment electricity vs general overhead)

**Implementation Details:**
See design document section 7 for complete implementation guide.

---

## Summary and Next Steps

**Completed (Phase 1-6):**
- ✅ Created SubtotalCard component for progressive cost feedback
- ✅ Created CostSummaryCard component for comprehensive breakdown
- ✅ Split ProductionConfigSection into EquipmentSection and OverheadSection
- ✅ Refactored ElaboratedFields with new component structure
- ✅ Enhanced RecipeProductionSection with yield tracking and unit cost
- ✅ Integrated all components for complete flow
- ✅ Manual testing validation

**Pending (Future Phases):**
- 📋 Phase 7: Automatic overhead from Settings (requires Settings module)
- 📋 Phase 8: Equipment electricity calculation (requires Equipment module updates)

**Current State:**
The form now provides:
1. Progressive disclosure with immediate cost feedback after each section
2. Clear visual hierarchy with industrial design
3. Separated concerns (Equipment, Overhead as distinct components)
4. Enhanced production section with yield tracking
5. Comprehensive cost summary before production configuration
6. Manual overhead calculation (to be automated in Phase 7)

**To Continue Implementation:**
Use the `superpowers:subagent-driven-development` skill to execute this plan task-by-task, or use `superpowers:executing-plans` in a separate session for batch execution with checkpoints.
