# Rediseño del Formulario de Material Elaborado

**Fecha:** 2026-02-09
**Objetivo:** Mejorar UX, eliminar duplicaciones, implementar costeo correcto según teoría administrativa
**Status:** ✅ Diseño Completo - Listo para Implementación

---

## 📋 Índice

1. [Contexto y Problemas Identificados](#contexto)
2. [Decisiones de Diseño](#decisiones)
3. [Estructura del Formulario](#estructura)
4. [Componentes a Modificar](#componentes)
5. [Componentes a Crear](#crear)
6. [Componentes a Eliminar](#eliminar)
7. [Implementación por Fases](#fases)
8. [Casos de Uso](#casos-uso)

---

## 1. Contexto y Problemas Identificados {#contexto}

### Estado Actual:

**Archivo:** `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ElaboratedFields.tsx`

**Problemas Críticos:**

1. ❌ **RecipeProductionSection mal ubicado**: "Ejecución de Producción" dentro de RecipeBuilder no tiene sentido en creación de material
2. ❌ **OutputConfigSection aislado**: "Producción de la Receta" no conectado con costos
3. ❌ **Componentes duplicados**: Lógica de costeo dispersa
4. ❌ **Overhead impreciso**: Dos inputs manuales (% y fijo) sin base real
5. ❌ **Orden ilógico**: No sigue flujo mental del usuario
6. ❌ **Falta feedback progresivo**: Usuario no ve subtotales hasta el final

### Teoría Administrativa Aplicada:

**Manufacturing Cost Structure (GAAP Compliant):**

```
COSTO TOTAL DE MANUFACTURA
├── COSTOS DIRECTOS
│   ├── Direct Materials (ingredientes)
│   ├── Direct Labor (staff específico)
│   └── Direct Equipment (máquinas específicas)
│       ├── Electricidad DEL EQUIPO
│       ├── Gas DEL EQUIPO
│       ├── Depreciación DEL EQUIPO
│       └── Mantenimiento DEL EQUIPO
└── COSTOS INDIRECTOS (OVERHEAD)
    ├── Alquiler/hipoteca planta
    ├── Electricidad GENERAL (no de equipos)
    ├── Gas GENERAL (no de equipos)
    ├── Supervisión
    ├── Seguros planta
    ├── Mantenimiento edificio (no equipos)
    └── Administración producción
```

**Distinción Crítica - Evitar Duplicación:**
- **Equipment hourly_cost_rate** = Costos directos del equipo (electricidad, depreciación, mantenimiento)
- **Overhead** = Solo costos generales NO atribuibles a equipos específicos

---

## 2. Decisiones de Diseño {#decisiones}

### A. Flujo del Formulario

**Principio:** Progressive Disclosure con Feedback Inmediato

**Usuario ve:**
1. Configurar ingredientes → **Subtotal Materiales: $XXX**
2. Configurar personal → **Subtotal Labor: $XXX**
3. Configurar equipos → **Subtotal Equipment: $XXX**
4. Overhead automático → **Subtotal Overhead: $XXX**
5. **TOTAL PRODUCCIÓN: $XXX**
6. Estrategia de ejecución (producir ahora/programar)
7. Confirmación final

### B. Output Configuration

**❌ Eliminado:** "Output Config" como sección separada
**✅ Decisión:** Output quantity solo se pide en "Ejecución de Producción"

**Razones:**
- En producción real, NO sabes la cantidad exacta hasta producir
- Si produces ahora → usuario ingresa cantidad REAL obtenida
- Si programas → defines batch size objetivo
- "Cantidad esperada" que no se usa = campo inútil

### C. Overhead Calculation

**❌ Rechazado:** Overhead manual (% y fijo ingresados a mano)
**✅ Decisión:** Overhead automático calculado desde gastos reales

**Método (Industry Standard):**
```
Overhead Rate = Total Monthly Overhead / Total Labor Hours
Overhead por producto = Labor Hours del producto × Overhead Rate
```

**Razones (basado en investigación de SAP, Odoo, NetSuite):**
1. Ningún ERP líder permite overhead manual por producto
2. GAAP requiere consistencia en overhead allocation
3. Overhead manual permite manipulación de costos
4. Imposible hacer variance analysis con datos inventados
5. Pérdida de comparabilidad entre productos

**Allocation Base:** Direct Labor Hours (más común en manufactura)

### D. Recipe Production Section

**✅ Conservado:** RecipeProductionSection es correcto
**🔄 Reubicado:** Al FINAL del formulario (después de ver todos los costos)
**🔄 Modificado:** Calcular costo unitario REAL con yield

**Dos modos:**

**Modo 1: Producir Ahora**
```
1. Usuario define batch size (objetivo): 10 kg
2. Usuario produce físicamente
3. Usuario ingresa cantidad REAL obtenida: 9.2 kg
4. Sistema calcula:
   - Yield: 92%
   - Costo unitario REAL: $175 / 9.2kg = $19.02/kg
5. Acción:
   - Crear material con unit_cost = $19.02
   - Consumir ingredientes del stock
   - Agregar 9.2kg al stock del material
```

**Modo 2: Programar Producción**
```
1. Usuario define batch size por ejecución: 10 kg
2. Usuario configura fecha/hora/frecuencia
3. Acción inmediata:
   - Crear material con unit_cost estimado
   - Crear orden(es) programada(s)
   - NO consume ingredientes aún
   - NO agrega stock aún
4. Al ejecutarse (futuro):
   - Pedir cantidad real obtenida
   - Recalcular costo con yield real
   - Actualizar unit_cost
   - Consumir ingredientes
   - Agregar stock
```

### E. Equipment Costs

**✅ Decisión:** Equipment hourly_cost_rate DEBE incluir todos sus costos directos

**Componentes del rate:**
```typescript
interface EquipmentCostBreakdown {
  electricity_kwh: number;      // Consumo medible del equipo
  electricity_rate: number;      // $/kWh
  gas_m3?: number;               // Consumo medible (si aplica)
  gas_rate?: number;             // $/m³
  depreciation_per_hour: number; // Depreciación del equipo
  maintenance_per_hour: number;  // Mantenimiento específico
  supplies_per_hour?: number;    // Consumibles (lubricantes, etc)
}

// Ejemplo: Horno Industrial
hourly_cost_rate: 8.50 = {
  electricity: 10 kWh × $0.20 = $2.00
  gas: 5 m³ × $0.50 = $2.50
  depreciation: $2.00
  maintenance: $2.00
  // TOTAL: $8.50/h
}
```

**⚠️ Importante:** NO duplicar en overhead - overhead solo incluye costos GENERALES

---

## 3. Estructura del Formulario {#estructura}

### Layout Visual Completo

```
┌─────────────────────────────────────────────────────────┐
│ [HEADER] Material Elaborado                             │
│ Badge: "REQUIERE RECETA"                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PROGRESS INDICATOR                                      │
│ [✓ Receta] ─── [  Producción (Opcional)] ─── [ Guardar]│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [INFO ALERT] Industrial Warning Panel                   │
│ • Requiere receta con ingredientes                      │
│ • Se ejecuta al guardar (si "Producir ahora")           │
│ • Genera stock inicial del material elaborado           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 1️⃣ LISTA DE MATERIALES (BOM)                           │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ [InputsEditorSection - from RecipeBuilder]             │
│                                                         │
│ Tabla de ingredientes:                                  │
│ • Harina          1.0 kg    $2.50/kg    $2.50          │
│ • Agua            0.6 L     $0.10/L     $0.06          │
│ • Levadura        20 g      $0.30/g     $6.00          │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 💰 Subtotal Materiales: $8.56            [✓]   │    │
│ └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2️⃣ MANO DE OBRA                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ [TeamAssignmentSection - from RecipeBuilder]           │
│                                                         │
│ • Panadero        2.0h    $15.00/h    $30.00           │
│   (Loaded factor incluido)                              │
│ • Ayudante        2.0h    $10.00/h    $20.00           │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 👷 Subtotal Mano de Obra: $50.00         [✓]   │    │
│ └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 3️⃣ EQUIPAMIENTO                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ [+ Agregar Equipo]                                      │
│                                                         │
│ • Horno Industrial                                      │
│   2.0h × $8.50/h = $17.00                              │
│   [ℹ️] Incluye: electricidad, gas, depreciación        │
│                                                         │
│ • Mezcladora                                            │
│   0.5h × $3.00/h = $1.50                               │
│   [ℹ️] Incluye: electricidad, mantenimiento            │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 🏭 Subtotal Equipamiento: $18.50          [✓]   │    │
│ └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 4️⃣ OVERHEAD (Costos Indirectos)                        │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ ℹ️ Overhead incluye: alquiler, electricidad general,    │
│ supervisión, seguros, limpieza y otros costos NO        │
│ atribuibles directamente a equipos específicos          │
│                                                         │
│ Método: Automático                                      │
│ Base: Direct Labor Hours                                │
│                                                         │
│ Cálculo:                                                │
│ • Total Labor Hours este producto: 4.0h                │
│ • Overhead Rate (del sistema): $15.00/h                │
│   [⚙️ Configurado en Settings]                          │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 📊 Overhead Calculado: $60.00                   │    │
│ │                                                 │    │
│ │ Breakdown:                                      │    │
│ │ • 4.0h × $15.00/h (rate del mes actual)         │    │
│ │                                                 │    │
│ │ ℹ️ Rate basado en gastos reales:                │    │
│ │ ($14,250 overhead / 950h labor = $15/h)         │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ ❌ NO editable (Compliance GAAP)                        │
└─────────────────────────────────────────────────────────┘

┌═════════════════════════════════════════════════════════┐
║ 💵 RESUMEN DE COSTOS TOTALES                            ║
║ ═══════════════════════════════════════════════════════ ║
║                                                         ║
║ COSTOS DIRECTOS:                                        ║
║   Materiales ..................... $8.56                ║
║   Mano de Obra ................... $50.00               ║
║   Equipamiento ................... $18.50               ║
║ ─────────────────────────────────────────────────────── ║
║   Subtotal Directo ............... $77.06               ║
║                                                         ║
║ COSTOS INDIRECTOS:                                      ║
║   Overhead ....................... $60.00               ║
║ ─────────────────────────────────────────────────────── ║
║                                                         ║
║ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ║
║ COSTO TOTAL PRODUCCIÓN ........... $137.06              ║
║ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ║
║                                                         ║
║ ℹ️ Costo unitario se calculará con cantidad real       ║
║                                                         ║
║ [Gráfico de barras: Materiales | Labor | Equip | OH]   ║
╚═════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────┐
│ 5️⃣ EJECUCIÓN DE PRODUCCIÓN                             │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ ○ Producir ahora ⚡                                     │
│   ↓ [Se expande al seleccionar]                        │
│   ┌───────────────────────────────────────────────┐    │
│   │ CONFIGURACIÓN DEL BATCH                       │    │
│   │                                               │    │
│   │ Batch size (objetivo):                        │    │
│   │ [10] [kg] ← Cuánto intentarás producir       │    │
│   │                                               │    │
│   │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │    │
│   │                                               │    │
│   │ MEDICIÓN POST-PRODUCCIÓN *                    │    │
│   │ (Después de producir físicamente)             │    │
│   │                                               │    │
│   │ Cantidad obtenida:                            │    │
│   │ [____] kg  * ← REQUERIDO                      │    │
│   │                                               │    │
│   │ Merma/scrap:                                  │    │
│   │ [____] kg (opcional)                          │    │
│   │ Motivo: [▼ Merma normal]                      │    │
│   │                                               │    │
│   │ ┌─────────────────────────────────────────┐   │    │
│   │ │ ✅ Yield: 92%                           │   │    │
│   │ │                                         │   │    │
│   │ │ COSTO UNITARIO REAL:                    │   │    │
│   │ │ $137.06 / 9.2kg = $14.90/kg            │   │    │
│   │ │                                         │   │    │
│   │ │ ⚠️ Mayor que estimado por merma 8%      │   │    │
│   │ └─────────────────────────────────────────┘   │    │
│   │                                               │    │
│   │ Al guardar:                                   │    │
│   │ • Se consumirán ingredientes del stock        │    │
│   │ • Se agregará 9.2kg al stock del material     │    │
│   │ • Material creado con unit_cost = $14.90/kg   │    │
│   └───────────────────────────────────────────────┘    │
│                                                         │
│ ○ Programar producción 📅                               │
│   ↓ [Se expande al seleccionar]                        │
│   ┌───────────────────────────────────────────────┐    │
│   │ CONFIGURACIÓN DE PROGRAMACIÓN                 │    │
│   │                                               │    │
│   │ Batch size por ejecución:                     │    │
│   │ [10] [kg]                                     │    │
│   │                                               │    │
│   │ Fecha inicio: [____]                          │    │
│   │ Hora: [____]                                  │    │
│   │ Frecuencia: [▼ Semanal]                       │    │
│   │                                               │    │
│   │ ℹ️ Al ejecutarse en el futuro:                │    │
│   │ • Se consumirán ingredientes                  │    │
│   │ • Se pedirá cantidad real obtenida            │    │
│   │ • Se recalculará costo con yield real         │    │
│   │ • Se agregará al stock                        │    │
│   │                                               │    │
│   │ Costo estimado por batch: $137.06             │    │
│   │ (Se actualizará con datos reales al ejecutar) │    │
│   └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 6️⃣ CONFIRMACIÓN FINAL                                  │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ [EventSourcingConfirmation]                             │
│                                                         │
│ ✅ Estás por crear el material "Pan Artesanal"          │
│                                                         │
│ 📦 Ingredientes (3):                                    │
│   • Harina - 1.0kg                                      │
│   • Agua - 0.6L                                         │
│   • Levadura - 20g                                      │
│                                                         │
│ 👥 Personal (2):                                        │
│   • Panadero - 2h                                       │
│   • Ayudante - 2h                                       │
│                                                         │
│ 🏭 Equipamiento (2):                                    │
│   • Horno Industrial - 2h                               │
│   • Mezcladora - 0.5h                                   │
│                                                         │
│ 💰 Costos:                                              │
│   • Costo Total Producción: $137.06                    │
│   • Costo Unitario: $14.90/kg (9.2kg obtenidos)        │
│                                                         │
│ 📊 Acción:                                              │
│   • Producir ahora (consumirá ingredientes)            │
│   • Cantidad a producir: 9.2kg                          │
│                                                         │
│ [Cancelar] [← Volver a editar] [Crear Material ✓]      │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Componentes a Modificar {#componentes}

### 4.1 ElaboratedFields.tsx

**Ubicación:** `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ElaboratedFields.tsx`

**Cambios:**

```diff
export const ElaboratedFields = memo(function ElaboratedFields({
  formData,
  setFormData,
  isEditMode = false,
  onRequestEquipmentSelector
}: ElaboratedFieldsProps) {

+  // Calculate costs progressively
+  const materialsCost = useMemo(() =>
+    calculateMaterialsCost(formData.recipe?.inputs || []),
+    [formData.recipe?.inputs]
+  );
+
+  const laborCost = useMemo(() =>
+    calculateLaborCost(formData.recipe?.teamAssignments || []),
+    [formData.recipe?.teamAssignments]
+  );
+
+  const equipmentCost = useMemo(() =>
+    calculateEquipmentCost(formData.production_config?.equipment_usage || []),
+    [formData.production_config?.equipment_usage]
+  );
+
+  const overheadCost = useMemo(() =>
+    calculateOverheadCost(laborCost), // Based on labor hours
+    [laborCost]
+  );
+
+  const totalCost = useMemo(() =>
+    DecimalUtils.add(
+      DecimalUtils.add(materialsCost, laborCost, 'financial'),
+      DecimalUtils.add(equipmentCost, overheadCost, 'financial'),
+      'financial'
+    ).toNumber(),
+    [materialsCost, laborCost, equipmentCost, overheadCost]
+  );

  return (
    <Stack gap="6" w="full">
      {/* Progress Indicator */}
      <MaterialFormProgressIndicator ... />

      {/* Info Alert */}
      <IndustrialAlert ... />

      {/* 1. BOM Section */}
-     <RecipeBuilder hideActions={true} ... />
+     <InputsEditorSection ... />
+     <SubtotalCard label="Materiales" value={materialsCost} icon="💰" />

+     {/* 2. Team Section */}
+     <TeamAssignmentSection ... />
+     <SubtotalCard label="Mano de Obra" value={laborCost} icon="👷" />

+     {/* 3. Equipment Section */}
+     <EquipmentSection ... />
+     <SubtotalCard label="Equipamiento" value={equipmentCost} icon="🏭" />

+     {/* 4. Overhead Section (Automatic) */}
+     <OverheadSection
+       laborHours={calculateLaborHours(...)}
+       overheadRate={getSystemOverheadRate()}
+       overheadCost={overheadCost}
+     />

-     {/* OLD: ProductionConfigSection */}
-     <ProductionConfigSection ... />

+     {/* 5. Cost Summary */}
+     <CostSummaryCard
+       materialsCost={materialsCost}
+       laborCost={laborCost}
+       equipmentCost={equipmentCost}
+       overheadCost={overheadCost}
+       totalCost={totalCost}
+     />

+     {/* 6. Production Execution (Moved to end) */}
+     <RecipeProductionSection
+       totalCost={totalCost}
+       materialName={formData.name}
+       materialUnit={formData.unit}
+       onBatchDataChange={handleBatchDataChange}
+     />
+
+     {/* 7. Final Confirmation */}
+     <ProductionConfirmation ... />
    </Stack>
  );
});
```

---

### 4.2 RecipeBuilder.tsx

**Ubicación:** `src/modules/recipe/components/RecipeBuilder/RecipeBuilder.tsx`

**Cambios:**

```diff
export const RecipeBuilder = memo(function RecipeBuilder(props: RecipeBuilderProps) {
  // ... existing code ...

  const sections = useMemo(() => {
    const hasInputs = recipe.inputs && recipe.inputs.length > 0;
    const isMinimalMaterial = entityType === 'material' && complexity === 'minimal';

    return {
      basicInfo: !isMinimalMaterial,
      inputs: true,
      team: true,
-     output: true,
-     production: true,
+     output: false, // ❌ Removed - handled in parent form
+     production: false, // ❌ Removed - moved to end of parent form
      costs: mergedFeatures.showCostCalculation && hasInputs,
      instructions: mergedFeatures.showInstructions && !isMinimalMaterial
    };
  }, [complexity, mergedFeatures, recipe.inputs, entityType]);

  return (
    <Stack gap="6" w="full">
      {sections.basicInfo && <BasicInfoSection ... />}
      {sections.inputs && <InputsEditorSection ... />}
      {sections.team && <TeamAssignmentSection ... />}
-     {sections.output && <OutputConfigSection ... />}
      {sections.costs && <CostSummarySection ... />}
-     {sections.production && <RecipeProductionSection ... />}
      {sections.instructions && <InstructionsSection ... />}
    </Stack>
  );
});
```

---

### 4.3 RecipeProductionSection.tsx

**Ubicación:** `src/modules/recipe/components/RecipeProductionSection.tsx`

**Cambios:**

```diff
export function RecipeProductionSection({
  entityType,
  recipe,
- updateRecipe
+ totalCost, // NEW: Receive from parent
+ materialName, // NEW
+ materialUnit, // NEW
+ onBatchDataChange // NEW: Callback for batch data
}: RecipeProductionSectionProps) {

  // ... existing state ...

+ // Calculate unit cost based on actual quantity
+ const unitCost = useMemo(() => {
+   if (!config.actualQuantity || config.actualQuantity === 0) return null;
+   return DecimalUtils.divide(
+     totalCost.toString(),
+     config.actualQuantity.toString(),
+     'financial'
+   ).toNumber();
+ }, [totalCost, config.actualQuantity]);
+
+ // Calculate yield percentage
+ const yieldPercentage = useMemo(() => {
+   if (!config.expectedQuantity || !config.actualQuantity) return 100;
+   return (config.actualQuantity / config.expectedQuantity) * 100;
+ }, [config.expectedQuantity, config.actualQuantity]);

  // Case: Material (full production config)
  return (
    <FormSection title="Ejecución de la Producción">
      <Stack gap="6">
        {/* Mode Selection */}
        <RadioGroup value={mode} onValueChange={handleModeChange}>
-         <RadioItem value="none">Solo definir receta</RadioItem> // ❌ REMOVED
          <RadioItem value="immediate">Producir ahora</RadioItem>
          <RadioItem value="scheduled">Programar producción</RadioItem>
        </RadioGroup>

        {/* Immediate Mode */}
        {mode === 'immediate' && (
          <Box ...>
            <Stack gap="4">
+             {/* Batch Size Input */}
+             <InputField
+               label="Batch Size (Objetivo)"
+               type="number"
+               value={config.expectedQuantity}
+               onChange={...}
+               helperText="Cuánto intentarás producir"
+             />
+
              <Text fontSize="sm" fontWeight="medium">
                MEDICIÓN POST-PRODUCCIÓN
              </Text>

-             {/* Expected Quantity (read-only) */}
-             <InputField
-               label="Cantidad Esperada"
-               value={`${config.expectedQuantity} ${config.unit}`}
-               readOnly
-               disabled
-             />

              {/* Actual Quantity - REQUIRED */}
              <InputField
                label="Cantidad Obtenida *"
                type="number"
                value={config.actualQuantity}
                onChange={handleActualQuantityChange}
              />

+             {/* Show yield and unit cost */}
+             {config.actualQuantity && (
+               <Box p="4" bg="blue.50" borderRadius="md">
+                 <Stack gap="2">
+                   <Text fontWeight="bold">
+                     ✅ Yield: {yieldPercentage.toFixed(1)}%
+                   </Text>
+                   <Text fontWeight="bold" fontSize="lg">
+                     COSTO UNITARIO REAL: ${unitCost?.toFixed(2)}/{materialUnit}
+                   </Text>
+                   {yieldPercentage < 95 && (
+                     <Text color="orange.600" fontSize="sm">
+                       ⚠️ Mayor que estimado por merma {(100 - yieldPercentage).toFixed(1)}%
+                     </Text>
+                   )}
+                 </Stack>
+               </Box>
+             )}

              {/* Scrap fields ... */}
            </Stack>
          </Box>
        )}

        {/* Scheduled Mode */}
        {mode === 'scheduled' && (
          <ScheduledProductionForm ... />
        )}
      </Stack>
    </FormSection>
  );
}
```

---

### 4.4 ProductionConfigSection.tsx → DIVIDIR

**Ubicación:** `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ProductionConfigSection.tsx`

**Acción:** Dividir en componentes separados

**Nuevo:**
- `EquipmentSection.tsx` (solo equipamiento)
- `OverheadSection.tsx` (solo overhead automático)
- Eliminar packaging (fase futura)

---

## 5. Componentes a Crear {#crear}

### 5.1 SubtotalCard.tsx

**Ubicación:** `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/SubtotalCard.tsx`

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
          <CheckIcon style={{ width: '16px', height: '16px' }} color="green" />
        </Flex>
        <Typography fontSize="lg" fontWeight="800" color={`${colorPalette}.700`}>
          ${value.toFixed(2)}
        </Typography>
      </Flex>
    </Box>
  );
});
```

---

### 5.2 CostSummaryCard.tsx

**Ubicación:** `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/CostSummaryCard.tsx`

```typescript
/**
 * CostSummaryCard - Final cost breakdown with visualization
 *
 * Shows complete cost structure:
 * - Direct costs (materials, labor, equipment)
 * - Indirect costs (overhead)
 * - Total manufacturing cost
 * - Bar chart visualization
 */

import { Box, Stack, Typography, Flex } from '@/shared/ui';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { memo } from 'react';
import { BarChart } from '@/shared/components/Charts';

interface CostSummaryCardProps {
  materialsCost: number;
  laborCost: number;
  equipmentCost: number;
  overheadCost: number;
  totalCost: number;
}

export const CostSummaryCard = memo(function CostSummaryCard({
  materialsCost,
  laborCost,
  equipmentCost,
  overheadCost,
  totalCost
}: CostSummaryCardProps) {
  const directCost = materialsCost + laborCost + equipmentCost;

  const chartData = [
    { name: 'Materiales', value: materialsCost, color: '#48bb78' },
    { name: 'Labor', value: laborCost, color: '#4299e1' },
    { name: 'Equip', value: equipmentCost, color: '#9f7aea' },
    { name: 'Overhead', value: overheadCost, color: '#ed8936' }
  ];

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

        {/* Chart */}
        <Box mt="4">
          <BarChart data={chartData} height={120} />
        </Box>
      </Stack>
    </Box>
  );
});

// Helper component
interface CostRowProps {
  label: string;
  value: number;
  bold?: boolean;
}

const CostRow = memo(function CostRow({ label, value, bold }: CostRowProps) {
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
```

---

### 5.3 EquipmentSection.tsx

**Ubicación:** `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/EquipmentSection.tsx`

```typescript
/**
 * EquipmentSection - Equipment selection and cost calculation
 *
 * Allows user to add equipment with hours used.
 * Equipment hourly_cost_rate MUST include all direct costs:
 * - Electricity consumed by equipment
 * - Gas consumed by equipment (if applicable)
 * - Depreciation of equipment
 * - Maintenance of equipment
 * - Supplies/consumables
 */

import { Box, Stack, Typography, Button } from '@/shared/ui';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { memo, useCallback } from 'react';
import type { ProductionEquipmentUsage } from '../../../../types';

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
            Equipamiento Requerido
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

---

### 5.4 OverheadSection.tsx

**Ubicación:** `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/OverheadSection.tsx`

```typescript
/**
 * OverheadSection - Automatic overhead calculation
 *
 * Calculates overhead based on:
 * - Labor hours (from TeamAssignmentSection)
 * - System overhead rate (from Settings)
 *
 * NO permite edición manual (compliance GAAP)
 */

import { Box, Stack, Typography, Button, Flex } from '@/shared/ui';
import { CogIcon } from '@heroicons/react/24/outline';
import { memo } from 'react';
import { useOverheadConfig } from '@/modules/settings/hooks/useOverheadConfig';

interface OverheadSectionProps {
  laborHours: number;
}

export const OverheadSection = memo(function OverheadSection({
  laborHours
}: OverheadSectionProps) {

  // Get system overhead rate from settings
  const { config, isLoading } = useOverheadConfig();

  const overheadRate = config?.overhead_rate_per_hour || 0;
  const overheadCost = laborHours * overheadRate;

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
          Overhead (Costos Indirectos)
        </Typography>

        {/* Info */}
        <Box p="3" bg="orange.50" borderRadius="md" borderWidth="1px" borderColor="orange.200">
          <Typography fontSize="xs" color="orange.700">
            ℹ️ Overhead incluye: alquiler, electricidad general, supervisión, seguros,
            limpieza y otros costos NO atribuibles a equipos específicos
          </Typography>
        </Box>

        {/* Calculation Details */}
        <Box p="4" bg="bg.subtle" borderRadius="md">
          <Stack gap="3">
            <Typography fontSize="xs" fontWeight="700" color="fg.muted" textTransform="uppercase">
              Método: Automático
            </Typography>
            <Typography fontSize="xs" color="fg.muted">
              Base: Direct Labor Hours
            </Typography>

            <Box h="1px" bg="border.subtle" />

            <Stack gap="1">
              <Flex justify="space-between">
                <Typography fontSize="sm">Total Labor Hours:</Typography>
                <Typography fontSize="sm" fontWeight="600">
                  {laborHours.toFixed(1)}h
                </Typography>
              </Flex>

              <Flex justify="space-between">
                <Typography fontSize="sm">Overhead Rate (sistema):</Typography>
                <Typography fontSize="sm" fontWeight="600">
                  ${overheadRate.toFixed(2)}/h
                </Typography>
              </Flex>
            </Stack>

            <Box h="1px" bg="border.emphasized" />

            {/* Result */}
            <Box p="3" bg="orange.100" borderRadius="md">
              <Flex justify="space-between" align="center">
                <Typography fontSize="md" fontWeight="700">
                  📊 Overhead Calculado:
                </Typography>
                <Typography fontSize="xl" fontWeight="800" color="orange.700">
                  ${overheadCost.toFixed(2)}
                </Typography>
              </Flex>
              <Typography fontSize="2xs" color="fg.muted" mt="1">
                {laborHours.toFixed(1)}h × ${overheadRate.toFixed(2)}/h
              </Typography>
            </Box>

            {/* Rate info */}
            <Typography fontSize="xs" color="fg.muted" fontStyle="italic">
              ℹ️ Rate basado en gastos reales del mes actual
              {config?.total_monthly_overhead && config?.total_labor_hours && (
                <> (${config.total_monthly_overhead.toFixed(0)} / {config.total_labor_hours}h)</>
              )}
            </Typography>
          </Stack>
        </Box>

        {/* Link to settings */}
        <Button
          size="sm"
          variant="ghost"
          colorPalette="gray"
          onClick={() => window.location.href = '/settings/overhead'}
        >
          <CogIcon style={{ width: 16, height: 16 }} />
          Configurar en Settings
        </Button>

        {/* Compliance notice */}
        <Box p="2" bg="gray.100" borderRadius="md">
          <Typography fontSize="2xs" color="fg.muted" textAlign="center">
            ❌ NO editable por producto (Compliance GAAP requirement)
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
});
```

---

### 5.5 OverheadConfig.tsx (Settings)

**Ubicación:** `src/modules/settings/components/OverheadConfig.tsx`

```typescript
/**
 * OverheadConfig - Global overhead configuration in Settings
 *
 * Allows admin to configure:
 * - Monthly overhead expenses
 * - Allocation base (labor hours, machine hours, direct cost %)
 * - Automatic rate calculation
 * - Integration with other modules (Cash, Staff, Suppliers)
 */

import { Box, Stack, Typography, InputField, Button, SelectField } from '@/shared/ui';
import { useState, useEffect, useMemo } from 'react';
import { DecimalUtils } from '@/lib/decimal';

interface OverheadExpenses {
  rent: number;
  electricity_general: number;
  gas_general: number;
  water: number;
  internet: number;
  supervision_salaries: number;
  admin_salaries: number;
  insurance: number;
  cleaning: number;
  security: number;
  general_maintenance: number;
  other: number;
}

type AllocationBase = 'per_labor_hour' | 'per_machine_hour' | 'per_direct_cost';

export function OverheadConfig() {
  const [expenses, setExpenses] = useState<OverheadExpenses>({
    rent: 0,
    electricity_general: 0,
    gas_general: 0,
    water: 0,
    internet: 0,
    supervision_salaries: 0,
    admin_salaries: 0,
    insurance: 0,
    cleaning: 0,
    security: 0,
    general_maintenance: 0,
    other: 0
  });

  const [allocationBase, setAllocationBase] = useState<AllocationBase>('per_labor_hour');
  const [totalLaborHours, setTotalLaborHours] = useState(0);
  const [totalMachineHours, setTotalMachineHours] = useState(0);
  const [totalDirectCost, setTotalDirectCost] = useState(0);

  // Calculate total overhead
  const totalOverhead = useMemo(() => {
    return Object.values(expenses).reduce((sum, val) => sum + val, 0);
  }, [expenses]);

  // Calculate rate based on allocation base
  const overheadRate = useMemo(() => {
    if (allocationBase === 'per_labor_hour' && totalLaborHours > 0) {
      return totalOverhead / totalLaborHours;
    }
    if (allocationBase === 'per_machine_hour' && totalMachineHours > 0) {
      return totalOverhead / totalMachineHours;
    }
    if (allocationBase === 'per_direct_cost' && totalDirectCost > 0) {
      return (totalOverhead / totalDirectCost) * 100; // Percentage
    }
    return 0;
  }, [allocationBase, totalOverhead, totalLaborHours, totalMachineHours, totalDirectCost]);

  // Auto-populate from other modules
  useEffect(() => {
    // TODO: Fetch from Cash/Expenses module
    // TODO: Fetch from Staff module (supervision salaries)
    // TODO: Fetch from Suppliers module (utilities bills)
    // TODO: Calculate total labor hours from production records
  }, []);

  const handleExpenseChange = (field: keyof OverheadExpenses, value: number) => {
    setExpenses(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // TODO: Save to settings store
    console.log('Saving overhead config:', {
      expenses,
      allocationBase,
      totalOverhead,
      overheadRate
    });
  };

  return (
    <Box maxW="800px" mx="auto" p="6">
      <Stack gap="6">
        {/* Header */}
        <Typography fontSize="2xl" fontWeight="bold">
          Configuración de Overhead
        </Typography>

        {/* Warning about duplication */}
        <Box p="4" bg="orange.50" borderRadius="md" borderWidth="2px" borderColor="orange.300">
          <Typography fontSize="sm" fontWeight="700" color="orange.700" mb="2">
            ⚠️ IMPORTANTE: Evitar Duplicación de Costos
          </Typography>
          <Typography fontSize="xs" color="orange.700">
            NO incluir costos ya calculados en equipment hourly rates:
          </Typography>
          <Stack gap="1" mt="2" pl="4">
            <Typography fontSize="xs" color="orange.600">
              • ❌ Electricidad de equipos productivos (ya en hourly rate)
            </Typography>
            <Typography fontSize="xs" color="orange.600">
              • ❌ Gas de equipos productivos (ya en hourly rate)
            </Typography>
            <Typography fontSize="xs" color="orange.600">
              • ❌ Mantenimiento de equipos (ya en hourly rate)
            </Typography>
            <Typography fontSize="xs" color="orange.600">
              • ❌ Depreciación de equipos (ya en hourly rate)
            </Typography>
          </Stack>
          <Typography fontSize="xs" color="orange.700" mt="2">
            ✅ Solo incluir costos GENERALES no atribuibles a equipos específicos
          </Typography>
        </Box>

        {/* Overhead Expenses */}
        <Box p="5" bg="bg.panel" borderRadius="lg" borderWidth="2px">
          <Typography fontSize="lg" fontWeight="700" mb="4">
            Gastos de Overhead Mensual
          </Typography>

          <Stack gap="3">
            <InputField
              label="Alquiler/Hipoteca"
              type="number"
              value={expenses.rent}
              onChange={(e) => handleExpenseChange('rent', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Electricidad GENERAL (no equipos)"
              type="number"
              value={expenses.electricity_general}
              onChange={(e) => handleExpenseChange('electricity_general', parseFloat(e.target.value) || 0)}
              helperText="Luces, AC, oficinas - NO equipos de producción"
            />

            <InputField
              label="Gas GENERAL (no equipos)"
              type="number"
              value={expenses.gas_general}
              onChange={(e) => handleExpenseChange('gas_general', parseFloat(e.target.value) || 0)}
              helperText="Calefacción - NO equipos de producción"
            />

            <InputField
              label="Agua"
              type="number"
              value={expenses.water}
              onChange={(e) => handleExpenseChange('water', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Internet/Teléfono"
              type="number"
              value={expenses.internet}
              onChange={(e) => handleExpenseChange('internet', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Supervisión (salarios)"
              type="number"
              value={expenses.supervision_salaries}
              onChange={(e) => handleExpenseChange('supervision_salaries', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Administración producción"
              type="number"
              value={expenses.admin_salaries}
              onChange={(e) => handleExpenseChange('admin_salaries', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Seguros planta"
              type="number"
              value={expenses.insurance}
              onChange={(e) => handleExpenseChange('insurance', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Limpieza"
              type="number"
              value={expenses.cleaning}
              onChange={(e) => handleExpenseChange('cleaning', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Seguridad"
              type="number"
              value={expenses.security}
              onChange={(e) => handleExpenseChange('security', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Mantenimiento edificio (NO equipos)"
              type="number"
              value={expenses.general_maintenance}
              onChange={(e) => handleExpenseChange('general_maintenance', parseFloat(e.target.value) || 0)}
              helperText="Mantenimiento del edificio - NO de equipos de producción"
            />

            <InputField
              label="Otros"
              type="number"
              value={expenses.other}
              onChange={(e) => handleExpenseChange('other', parseFloat(e.target.value) || 0)}
            />
          </Stack>

          {/* Total */}
          <Box mt="4" p="4" bg="blue.100" borderRadius="md">
            <Typography fontSize="lg" fontWeight="800">
              TOTAL OVERHEAD MENSUAL: ${totalOverhead.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* Allocation Method */}
        <Box p="5" bg="bg.panel" borderRadius="lg" borderWidth="2px">
          <Typography fontSize="lg" fontWeight="700" mb="4">
            Método de Asignación
          </Typography>

          <SelectField
            label="Base de Cálculo"
            value={[allocationBase]}
            onValueChange={(val) => setAllocationBase(val[0] as AllocationBase)}
            options={[
              { value: 'per_labor_hour', label: 'Por Labor Hour (más común)' },
              { value: 'per_machine_hour', label: 'Por Machine Hour' },
              { value: 'per_direct_cost', label: 'Por Direct Cost Total (%)' }
            ]}
          />

          {allocationBase === 'per_labor_hour' && (
            <InputField
              label="Total Labor Hours (este mes)"
              type="number"
              value={totalLaborHours}
              onChange={(e) => setTotalLaborHours(parseFloat(e.target.value) || 0)}
              helperText="Horas totales de producción del mes"
            />
          )}

          {allocationBase === 'per_machine_hour' && (
            <InputField
              label="Total Machine Hours (este mes)"
              type="number"
              value={totalMachineHours}
              onChange={(e) => setTotalMachineHours(parseFloat(e.target.value) || 0)}
              helperText="Horas totales de uso de máquinas del mes"
            />
          )}

          {allocationBase === 'per_direct_cost' && (
            <InputField
              label="Total Direct Cost (este mes)"
              type="number"
              value={totalDirectCost}
              onChange={(e) => setTotalDirectCost(parseFloat(e.target.value) || 0)}
              helperText="Costo directo total del mes"
            />
          )}

          {/* Calculated Rate */}
          <Box mt="4" p="4" bg="green.100" borderRadius="md">
            <Typography fontSize="xl" fontWeight="800" color="green.700">
              OVERHEAD RATE CALCULADO:
            </Typography>
            <Typography fontSize="2xl" fontWeight="900" color="green.800">
              {allocationBase === 'per_direct_cost'
                ? `${overheadRate.toFixed(2)}%`
                : `$${overheadRate.toFixed(2)}/${allocationBase === 'per_labor_hour' ? 'labor hour' : 'machine hour'}`
              }
            </Typography>
            <Typography fontSize="xs" color="green.700" mt="2">
              Este rate se aplicará automáticamente a nuevos materiales elaborados
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Stack direction="row" gap="3" justify="flex-end">
          <Button variant="outline">Cancelar</Button>
          <Button colorPalette="blue" onClick={handleSave}>
            Guardar Configuración
          </Button>
        </Stack>

        {/* Auto-integration buttons */}
        <Box p="4" bg="gray.50" borderRadius="md">
          <Typography fontSize="sm" fontWeight="700" mb="3">
            Integración Automática (Futuro)
          </Typography>
          <Stack gap="2">
            <Button size="sm" variant="ghost" disabled>
              📊 Actualizar desde Módulo de Cash/Expenses
            </Button>
            <Button size="sm" variant="ghost" disabled>
              👥 Actualizar desde Módulo de Staff
            </Button>
            <Button size="sm" variant="ghost" disabled>
              📄 Actualizar desde Facturas de Servicios
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
```

---

## 6. Componentes a Eliminar {#eliminar}

### 6.1 OutputConfigSection.tsx

**❌ Eliminar:** `src/modules/recipe/components/RecipeBuilder/sections/OutputConfigSection.tsx`

**Razón:**
- "Cantidad esperada" no se usa si necesitamos cantidad REAL
- Output item ya se define en el nombre del material (campos básicos)
- Output quantity se pide en RecipeProductionSection (produce ahora/programar)

---

### 6.2 Packaging fields en ProductionConfigSection

**❌ Eliminar temporalmente:** Campos de packaging

**Razón:**
- Fase futura
- Simplificar formulario actual
- Se agregará cuando se implemente módulo de packaging completo

---

## 7. Equipment Module: Separación de Costos {#equipment}

### Estado Actual del Módulo

**Ubicación:** `src/modules/production-equipment/`

**Tabla DB:** `production_equipment` (ya existe desde 2026-02-05)

**Campos actuales:**
```sql
energy_cost_per_hour NUMERIC(10,4) DEFAULT 0  -- ❌ MANUAL (usuario ingresa)
```

**Problema:** No hay separación automática entre electricidad directa (equipo) vs general (overhead)

---

### Decisión: Agregar Cálculo Automático de Electricidad

**Método elegido:** Especificaciones Técnicas + Factor de Carga

#### Nuevos Campos Necesarios:

```typescript
interface ProductionEquipment {
  // ... existing fields ...

  // 🆕 NEW: Electricity calculation
  power_consumption_kw?: number;      // Del manual del fabricante
  load_factor: number;                // Default 0.7 (70% del tiempo a max)
  electricity_rate_per_kwh?: number;  // From settings or utilities module

  // EXISTING (ahora auto-calculated si power_consumption_kw presente)
  energy_cost_per_hour: number;       // Calculado o manual
}
```

#### Cálculo Automático:

```typescript
// Si tiene power_consumption_kw → calcular automáticamente
energy_cost_per_hour = power_consumption_kw × load_factor × electricity_rate_per_kwh

// Ejemplo:
// Horno: 10 kW nominal
// Load factor: 0.7 (funciona al 70% del tiempo)
// Rate: $0.20/kWh
// = 10 × 0.7 × 0.20 = $1.40/h
```

#### Breakdown Completo:

```typescript
interface EquipmentCostBreakdown {
  // Existing
  depreciation_per_hour: number;
  maintenance_per_hour: number;
  energy_per_hour: number;  // ← Ahora con breakdown
  consumables_per_hour: number;
  insurance_per_hour: number;
  overhead_per_hour: number;  // ⚠️ Para equipos, debería ser 0
  total_per_hour: number;

  // 🆕 NEW: Energy breakdown
  energy_breakdown?: {
    power_consumption_kw: number;
    load_factor: number;
    electricity_rate: number;
    calculated: boolean;  // true si auto, false si manual
  };
}
```

---

### Migration Necesaria

**Archivo:** `database/migrations/20260209_add_equipment_electricity_calculation.sql`

```sql
-- Add new fields for automatic electricity calculation
ALTER TABLE production_equipment
  ADD COLUMN power_consumption_kw NUMERIC(10,4),
  ADD COLUMN load_factor NUMERIC(5,4) DEFAULT 0.70,
  ADD COLUMN electricity_rate_per_kwh NUMERIC(10,4);

-- Add constraint
ALTER TABLE production_equipment
  ADD CONSTRAINT power_consumption_non_negative
    CHECK (power_consumption_kw IS NULL OR power_consumption_kw >= 0),
  ADD CONSTRAINT load_factor_valid
    CHECK (load_factor >= 0 AND load_factor <= 1.0);

-- Update trigger to calculate energy_cost_per_hour automatically
CREATE OR REPLACE FUNCTION calculate_equipment_energy_cost()
RETURNS TRIGGER AS $$
BEGIN
  -- If has power specs, calculate automatically
  IF NEW.power_consumption_kw IS NOT NULL
     AND NEW.load_factor IS NOT NULL
     AND NEW.electricity_rate_per_kwh IS NOT NULL THEN

    NEW.energy_cost_per_hour :=
      NEW.power_consumption_kw *
      NEW.load_factor *
      NEW.electricity_rate_per_kwh;
  END IF;

  -- Continue with existing hourly_cost_rate calculation...
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Actualización del Equipment Form

**Ubicación:** (A crear) `src/modules/production-equipment/components/EquipmentForm.tsx`

**Sección de Electricidad:**

```tsx
<FormSection title="Costos de Energía">
  <RadioGroup value={energyMode}>
    <RadioItem value="automatic">
      Calcular Automáticamente (Recomendado)
    </RadioItem>
    <RadioItem value="manual">
      Ingresar Manualmente
    </RadioItem>
  </RadioGroup>

  {energyMode === 'automatic' ? (
    <Stack gap="4">
      <InputField
        label="Consumo Nominal (kW)"
        helperText="Del manual del fabricante o placa del equipo"
        type="number"
        step="0.01"
      />

      <InputField
        label="Factor de Carga"
        defaultValue={0.7}
        helperText="0.7 = Funciona al 70% del tiempo a máxima potencia"
        type="number"
        step="0.01"
        min="0"
        max="1"
      />

      <Box p="4" bg="blue.50" borderRadius="md">
        <Stack gap="2">
          <Typography fontSize="sm" fontWeight="bold">
            Costo Calculado: ${energyCost.toFixed(4)}/h
          </Typography>
          <Typography fontSize="xs" color="fg.muted">
            {powerKw} kW × {loadFactor} × ${ratePerKwh}/kWh
          </Typography>
        </Stack>
      </Box>
    </Stack>
  ) : (
    <InputField
      label="Costo de Energía por Hora"
      type="number"
      helperText="Ingreso manual (sin cálculo automático)"
    />
  )}

  <Box p="3" bg="orange.50" borderRadius="md" borderWidth="1px" borderColor="orange.200">
    <Typography fontSize="xs" color="orange.700">
      ⚠️ Este costo es DIRECTO del equipo. NO incluir electricidad general
      (luces, AC, oficinas) - eso va en Overhead.
    </Typography>
  </Box>
</FormSection>
```

---

### Actualización del EquipmentSelector (UI)

**Ubicación:** `src/shared/components/EquipmentSelector.tsx`

**Mostrar Breakdown:**

```tsx
<Box
  key={eq.id}
  onClick={() => handleEquipmentClick(eq)}
>
  <Stack gap="1">
    <Typography fontSize="sm" fontWeight="600">
      {eq.name}
    </Typography>

    {/* Hourly Rate */}
    <Typography fontSize="xs" fontWeight="600" color="purple.500">
      ${(eq.hourly_cost_rate || 0).toFixed(2)}/h
    </Typography>

    {/* 🆕 Breakdown Expandable */}
    <Collapsible>
      <CollapsibleTrigger>
        <Button size="xs" variant="ghost">
          Ver Breakdown
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Stack gap="1" fontSize="2xs" color="fg.muted" pl="2">
          <Flex justify="space-between">
            <span>• Electricidad:</span>
            <span>${eq.energy_cost_per_hour?.toFixed(2)}</span>
          </Flex>
          {eq.power_consumption_kw && (
            <Typography fontSize="3xs" color="fg.muted" pl="3">
              ({eq.power_consumption_kw}kW × {eq.load_factor})
            </Typography>
          )}
          <Flex justify="space-between">
            <span>• Depreciación:</span>
            <span>${depreciationPerHour.toFixed(2)}</span>
          </Flex>
          <Flex justify="space-between">
            <span>• Mantenimiento:</span>
            <span>${maintenancePerHour.toFixed(2)}</span>
          </Flex>
          <Flex justify="space-between">
            <span>• Consumibles:</span>
            <span>${eq.consumables_cost_per_hour?.toFixed(2)}</span>
          </Flex>
        </Stack>
      </CollapsibleContent>
    </Collapsible>
  </Stack>
</Box>
```

---

### Settings > Overhead Config: Cálculo Residual

**Ubicación:** `src/modules/settings/components/OverheadConfig.tsx`

**Auto-cálculo de Electricidad General:**

```tsx
<FormSection title="Electricidad">
  {/* Factura Total */}
  <InputField
    label="Factura Total del Mes"
    value={totalElectricityBill}
    onChange={...}
    helperText="Monto total de la factura de electricidad"
  />

  {/* Suma de Equipos (Auto-calculado) */}
  <Box p="4" bg="blue.50" borderRadius="md">
    <Stack gap="2">
      <Typography fontSize="sm" fontWeight="bold">
        Electricidad Atribuida a Equipos
      </Typography>
      <Typography fontSize="xs" color="fg.muted">
        Calculado desde registros de producción del mes
      </Typography>
      <Typography fontSize="2xl" fontWeight="bold">
        ${equipmentElectricityTotal.toFixed(2)}
      </Typography>

      {/* Breakdown */}
      <Stack gap="1" fontSize="xs" pl="4">
        <Text>• Horno Industrial: ${150.00} (20h × 7.5kW)</Text>
        <Text>• Mezcladora: ${50.00} (10h × 5kW)</Text>
        <Text>• Cámara Fría: ${100.00} (50h × 2kW)</Text>
      </Stack>
    </Stack>
  </Box>

  {/* Residual = Overhead General */}
  <Box p="4" bg="green.50" borderRadius="md" borderWidth="2px" borderColor="green.300">
    <Stack gap="2">
      <Typography fontSize="sm" fontWeight="bold" color="green.700">
        Electricidad General (Overhead)
      </Typography>
      <Typography fontSize="xs" color="fg.muted">
        Residual = Total Factura - Equipos
      </Typography>
      <Typography fontSize="2xl" fontWeight="bold" color="green.700">
        ${generalElectricity.toFixed(2)}
      </Typography>
      <Typography fontSize="xs" color="green.600">
        (Luces, AC, oficinas, computadoras, etc.)
      </Typography>
    </Stack>
  </Box>

  <Box p="3" bg="orange.50" borderRadius="md">
    <Typography fontSize="xs" color="orange.700">
      ✅ Esta separación evita duplicación de costos
    </Typography>
  </Box>
</FormSection>
```

---

### Validación: NO Duplicación

**Checklist de Implementación:**

```typescript
// ✅ Equipment hourly_cost_rate incluye SOLO:
equipment_cost = {
  electricity_of_equipment: calculated,  // Medible/calculable
  depreciation: calculated,
  maintenance: calculated,
  consumables: user_input,
  insurance: calculated
  // ❌ NO overhead general
}

// ✅ Overhead incluye SOLO:
overhead = {
  electricity_general: total_bill - sum_equipment_electricity,
  rent: user_input,
  supervision: user_input,
  insurance_general: user_input,
  // ❌ NO electricidad de equipos
}

// Validation function
function validateNoDuplication() {
  const equipmentElectricity = calculateEquipmentElectricity();
  const overheadElectricity = overheadConfig.electricity_general;
  const totalBill = utilities.electricity_total;

  assert(
    Math.abs((equipmentElectricity + overheadElectricity) - totalBill) < 0.01,
    "Electricity total must equal bill (no double-counting)"
  );
}
```

---

## 8. Implementación por Fases {#fases}

### Phase 1: Restructuración del Formulario ✅

**Objetivo:** Orden lógico y subtotales progresivos

**Tareas:**
1. ✅ Modificar `ElaboratedFields.tsx`:
   - Sacar RecipeBuilder sections
   - Agregar InputsEditorSection directo
   - Agregar TeamAssignmentSection directo
   - Agregar SubtotalCard después de cada sección
2. ✅ Crear `SubtotalCard.tsx`
3. ✅ Dividir `ProductionConfigSection.tsx`:
   - Crear `EquipmentSection.tsx`
   - Crear `OverheadSection.tsx` (temporal con manual)
4. ✅ Crear `CostSummaryCard.tsx`
5. ✅ Mover `RecipeProductionSection` al final

**Resultado:** Usuario ve costos progresivamente

---

### Phase 2: Overhead Automático ✅

**Objetivo:** Cálculo preciso de overhead desde gastos reales

**Tareas:**
1. ✅ Crear `OverheadConfig.tsx` en Settings
2. ✅ Crear hook `useOverheadConfig()`
3. ✅ Modificar `OverheadSection.tsx` para usar overhead automático
4. ✅ Agregar documentación sobre Equipment vs Overhead

**Resultado:** Overhead preciso, sin duplicación, GAAP compliant

---

### Phase 3: RecipeProductionSection Mejorado ✅

**Objetivo:** Calcular costo unitario REAL con yield

**Tareas:**
1. ✅ Modificar `RecipeProductionSection.tsx`:
   - Agregar batch size input
   - Calcular yield real
   - Calcular unit cost con cantidad real
   - Mostrar comparación vs estimado
2. ✅ Eliminar "Solo definir receta" (no aplica a materials)

**Resultado:** Costo unitario preciso basado en producción real

---

### Phase 4: Validación y Testing ⏳

**Objetivo:** Asegurar que todo funciona correctamente

**Tareas:**
1. ⏳ Tests unitarios para cálculos de costos
2. ⏳ Tests de integración para flujo completo
3. ⏳ Validación con datos reales
4. ⏳ Verificar no duplicación de costos
5. ⏳ Testing con usuarios reales

---

### Phase 5: Equipment Module - Electricidad Automática 📋

**Objetivo:** Separación correcta equipment vs overhead, sin duplicación

**Tareas:**
1. 📋 **Migration DB:**
   - Agregar `power_consumption_kw`, `load_factor`, `electricity_rate_per_kwh`
   - Actualizar trigger para cálculo automático
   - Archivo: `database/migrations/20260209_add_equipment_electricity_calculation.sql`

2. 📋 **Actualizar Types:**
   - Agregar nuevos campos a `ProductionEquipment`
   - Agregar `energy_breakdown` a `EquipmentCostBreakdown`
   - Archivo: `src/modules/production-equipment/types/index.ts`

3. 📋 **Equipment Form:**
   - Crear/actualizar form con modo automático/manual
   - Inputs: power_consumption_kw, load_factor
   - Validación: advertencia sobre duplicación
   - Archivo: `src/modules/production-equipment/components/EquipmentForm.tsx`

4. 📋 **EquipmentSelector UI:**
   - Agregar breakdown expandible
   - Mostrar cálculo de electricidad
   - Transparencia para usuario
   - Archivo: `src/shared/components/EquipmentSelector.tsx`

5. 📋 **Settings > Overhead Config:**
   - Agregar sección de electricidad
   - Cálculo residual automático (total - equipos)
   - Display de breakdown por equipo
   - Validación: suma = factura total
   - Archivo: `src/modules/settings/components/OverheadConfig.tsx`

6. 📋 **Tests:**
   - Test cálculo automático de electricidad
   - Test validación no-duplicación
   - Test residual = overhead general

---

### Phase 6: Variance Analysis (Futuro) 📋

**Objetivo:** Comparar overhead aplicado vs real

**Tareas:**
1. 📋 Tracking de overhead aplicado mensual
2. 📋 Tracking de overhead real gastado
3. 📋 Dashboard de varianzas
4. 📋 Ajustes automáticos o manual a COGS

---

## 8. Casos de Uso {#casos-uso}

### Caso 1: Panadería - Pan Artesanal (Producir Ahora)

**Escenario:** Panadero crea material elaborado y produce inmediatamente

**Flujo:**
1. ✅ Campos básicos: Nombre "Pan Artesanal", Categoría "Panadería"
2. ✅ BOM: Agrega harina (1kg), agua (0.6L), levadura (20g)
   - **Subtotal Materiales: $8.56**
3. ✅ Mano de Obra: Panadero (2h), Ayudante (2h)
   - **Subtotal Labor: $50.00**
4. ✅ Equipamiento: Horno (2h), Mezcladora (0.5h)
   - **Subtotal Equipment: $18.50**
5. ✅ Overhead: Automático (4h × $15/h)
   - **Subtotal Overhead: $60.00**
6. ✅ **Resumen: Total $137.06**
7. ✅ Ejecución: "Producir ahora"
   - Batch size: 10kg
   - Produce físicamente
   - Cantidad obtenida: 9.2kg
   - Scrap: 0.8kg (merma normal)
   - **Yield: 92%**
   - **Costo Unitario REAL: $14.90/kg**
8. ✅ Confirmación: Ver resumen completo
9. ✅ Crear Material:
   - Material creado con `unit_cost = $14.90/kg`
   - Stock inicial: 9.2kg
   - Ingredientes consumidos del stock

**Resultado:** Material listo para vender con costo preciso

---

### Caso 2: Laboratorio - Aceite Esencial (Programado Semanal)

**Escenario:** Laboratorio programa producción recurrente

**Flujo:**
1. ✅ Campos básicos: Nombre "Aceite Esencial Lavanda", Categoría "Extractos"
2. ✅ BOM: Flores (5kg), Solvente (2L), Aditivos (100g)
   - **Subtotal Materiales: $125.00**
3. ✅ Mano de Obra: Químico (4h)
   - **Subtotal Labor: $120.00**
4. ✅ Equipamiento: Extractor (4h), Destilador (2h)
   - **Subtotal Equipment: $80.00**
5. ✅ Overhead: Automático (4h × $25/h)
   - **Subtotal Overhead: $100.00**
6. ✅ **Resumen: Total $425.00**
7. ✅ Ejecución: "Programar producción"
   - Batch size: 1L
   - Fecha: Lunes 12/02/2026
   - Hora: 08:00
   - Frecuencia: Semanal
8. ✅ Confirmación: Ver resumen
9. ✅ Crear Material:
   - Material creado con `unit_cost estimado = $425/L`
   - NO consume stock aún
   - Orden programada creada
   - Al ejecutarse:
     - Pedirá cantidad real
     - Actualizará unit_cost con yield real
     - Consumirá ingredientes
     - Agregará al stock

**Resultado:** Material configurado con producción automática semanal

---

### Caso 3: Fábrica - Producto Químico (Alto Yield, Sin Merma)

**Escenario:** Proceso industrial optimizado, yield consistente 99%

**Flujo:**
1. ✅ Setup similar a casos anteriores
2. ✅ **Total Producción: $1,850.00**
3. ✅ Producir ahora:
   - Batch size: 100L
   - Cantidad obtenida: 99L
   - Scrap: 1L (pérdida por evaporación)
   - **Yield: 99%** ✅ Excelente
   - **Costo Unitario: $18.69/L**
4. ✅ Sistema registra yield histórico
5. ✅ Dashboard muestra: "Yield promedio: 99% - Proceso optimizado"

**Resultado:** Tracking de eficiencia operativa

---

## 📊 Métricas de Éxito

### UX Metrics:
- ✅ Usuario ve costos progresivamente (no al final)
- ✅ Cada sección tiene feedback inmediato (subtotal)
- ✅ Formulario sigue orden lógico mental
- ✅ No hay campos "inútiles" (todo se usa)

### Technical Metrics:
- ✅ Sin duplicación de costos (equipment vs overhead)
- ✅ GAAP compliant (overhead consistente)
- ✅ Cálculos precisos con DecimalUtils
- ✅ Código reutilizable (SubtotalCard, etc.)

### Business Metrics:
- ✅ Costo unitario preciso (con yield real)
- ✅ Tracking de eficiencia (yield %)
- ✅ Trazabilidad de costos (breakdown completo)
- ✅ Base para pricing strategy

---

## 🔗 Referencias

**Teoría Administrativa:**
- [NetSuite - Manufacturing Overhead](https://www.netsuite.com/portal/resource/articles/erp/manufacturing-overhead.shtml)
- [Manufacturing Overhead Best Practices](https://ascsoftware.com/blog/manufacturing-overhead-costs/)
- [SAP Overhead Allocation Methods](https://learning.sap.com/learning-journeys/introducing-product-cost-planning-and-production-accounting-in-sap-s-hana/applying-overhead-costs)
- [Odoo Manufacturing Cost Analysis](https://novobi.com/financial-visibility-how-odoo-erp-systems-transform-manufacturing-accounting/)

**ERPs Investigados:**
- SAP S/4HANA (event-based overhead, costing sheets, ABC)
- Odoo MRP (work center rates, landed costs)
- NetSuite Manufacturing (allocation bases, standard costing)

**GAAP Compliance:**
- Overhead must be included in COGS
- Consistency in allocation method required
- Variance analysis mandatory

---

## ✅ Sign-off

**Diseño aprobado:** [Pendiente]
**Desarrollo iniciado:** [Pendiente]
**Testing completado:** [Pendiente]
**Deploy a producción:** [Pendiente]

---

**Próximos pasos:** Comenzar Phase 1 - Restructuración del Formulario
