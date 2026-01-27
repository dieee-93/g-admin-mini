# Auditoría de UI/UX - Sistema de Recetas
**Fecha**: 2025-01-01
**Estado**: 🔴 Problemas Críticos Identificados
**Prioridad**: Alta

---

## 📋 RESUMEN EJECUTIVO

Se ha realizado una auditoría completa del sistema de recetas implementado, comparando la implementación actual con la documentación técnica y las especificaciones de diseño. Se identificaron **problemas críticos de UX** que impiden el uso adecuado del sistema.

### Hallazgos Principales:
- ❌ **Selector de materiales no implementado** en InputsEditorSection
- ❌ **Selector de unidades faltante** en OutputConfigSection
- ❌ **Validación inconsistente** entre output.item y la UI
- ⚠️ **Features documentadas no visibles** (templates, substitutions, AI suggestions)
- ⚠️ **UX confusa** con placeholders genéricos y campos de texto libre

---

## 🔍 ANÁLISIS DETALLADO

### 1. PROBLEMA CRÍTICO: InputsEditorSection - Selector de Ingredientes

**Ubicación**: `src/modules/recipe/components/RecipeBuilder/sections/InputsEditorSection.tsx`

**Problema Identificado** (líneas 126-136):
```tsx
<Table.Cell>
  <Input
    size="sm"
    placeholder="Nombre del item"  // ❌ Placeholder genérico
    value={typeof input.item === 'string' ? input.item : input.item.name}
    onChange={(e) =>
      handleUpdateInput(index, {
        item: e.target.value,  // ❌ Solo acepta strings
      })
    }
  />
</Table.Cell>
```

**Problemas**:
1. ❌ Usa `<Input>` de texto libre en lugar de un selector estructurado
2. ❌ No valida que el material existe en la base de datos
3. ❌ No muestra información de stock disponible
4. ❌ No permite buscar/filtrar materiales de la lista
5. ❌ El placeholder "Nombre del item" es confuso y genérico
6. ❌ Acepta cualquier string, creando datos inconsistentes

**Componente Disponible (No Utilizado)**:
- ✅ `MaterialSelector` existe en `src/shared/components/MaterialSelector.tsx`
- ✅ Tiene búsqueda con debounce
- ✅ Muestra stock disponible con badges de estado
- ✅ Filtra por tipo de material
- ✅ Previene selección de items sin stock

**Impacto**: 🔴 **CRÍTICO**
- Los usuarios no pueden seleccionar materiales de forma eficiente
- Se crean datos inválidos (strings en lugar de IDs)
- No hay validación de stock antes de agregar a la receta

---

### 2. PROBLEMA CRÍTICO: OutputConfigSection - Selector de Unidades

**Ubicación**: `src/modules/recipe/components/RecipeBuilder/sections/OutputConfigSection.tsx`

**Problema Identificado** (líneas 83-91):
```tsx
<Field.Root required>
  <Field.Label>Unidad</Field.Label>
  <Input
    placeholder="Ej: unidad, kg, litros"  // ❌ Input libre
    value={output.unit ?? ''}
    onChange={(e) => updateOutput({ unit: e.target.value })}
  />
  <Field.HelperText>Unidad de medida del output</Field.HelperText>
</Field.Root>
```

**Problemas**:
1. ❌ Input de texto libre sin validación de unidades estándar
2. ❌ Permite inconsistencias (kg, Kg, KG, kilogramos, kilo, etc.)
3. ❌ No hay lista predefinida de unidades comunes
4. ❌ El valor por defecto "unit" es confuso (¿qué es "unit"?)
5. ❌ No hay conversión automática entre unidades

**Solución Recomendada**:
```tsx
// Definir unidades estándar
const STANDARD_UNITS = [
  { value: 'unit', label: 'Unidad' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'l', label: 'Litros (l)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'portion', label: 'Porción' },
  // ... más unidades
];

// Usar SelectField en lugar de Input
<SelectField
  label="Unidad de Medida"
  placeholder="Selecciona una unidad"
  options={STANDARD_UNITS}
  value={output.unit ? [output.unit] : []}
  onValueChange={(details) => updateOutput({ unit: details.value[0] })}
  required
/>
```

**Impacto**: 🔴 **CRÍTICO**
- Datos inconsistentes en la base de datos
- Imposibilidad de realizar conversiones automáticas
- Cálculos de costos incorrectos

---

### 3. PROBLEMA CRÍTICO: Validación de output.item Inconsistente

**Ubicación**: `src/modules/recipe/services/recipeValidation.ts`

**Código de Validación** (líneas 42-55):
```typescript
// Validar output
if (!recipe.output) {
  errors.push('El output de la receta es requerido')
} else {
  if (!recipe.output.item) {  // ❌ Requiere output.item
    errors.push('El item de output es requerido')
  }
  // ...
}
```

**Problema en OutputConfigSection**:
```tsx
{/* Item (pre-filled) */}
{preselectedItem && (  // ⚠️ Solo visible si hay preselectedItem
  <Field.Root>
    <Field.Label>Item de Salida</Field.Label>
    <Text fontWeight="medium" color="fg.emphasized">
      {preselectedItem.name}
    </Text>
  </Field.Root>
)}
```

**Problemas**:
1. ❌ La validación **requiere** `output.item`
2. ❌ Pero la UI solo muestra el item si `preselectedItem` está definido
3. ❌ Si no hay `preselectedItem`, no hay forma de seleccionar un item de output
4. ❌ La validación falla con el error: "El item de output es requerido"

**Caso de Uso Afectado**:
En el modal de materiales elaborados:
```tsx
<RecipeBuilder
  entityType="material"
  mode="create"
  onSave={(recipe) => {
    setFormData({
      ...formData,
      recipe_id: recipe.id,
      initial_stock: recipe.output.quantity || 1,
      unit_cost: 0
    });
  }}
/>
```

- ❌ **NO se pasa `outputItem` como prop**
- ❌ Por lo tanto `preselectedItem` es `undefined`
- ❌ No hay campo visible para seleccionar el output item
- ❌ La validación falla y muestra el error

**Impacto**: 🔴 **BLOQUEANTE**
- **Imposible crear recetas** sin `preselectedItem`
- Error de validación permanente en el modal de materiales

---

### 4. PROBLEMA IMPORTANTE: Features Documentadas No Visibles

**Documentación vs Implementación**:

| Feature | Documentado | Implementado | Visible en UI |
|---------|-------------|--------------|---------------|
| Templates System | ✅ 100% | ✅ Sí | ⚠️ Parcial (solo botón) |
| Substitutions Editor | ✅ 100% | ✅ Sí | ❌ No integrado |
| AI Suggestions | ✅ Mencionado | ❌ No | ❌ No |
| Cost Summary | ✅ Sí | ✅ Sí | ✅ Sí (condicional) |
| Instructions | ✅ Sí | ✅ Sí | ✅ Sí (lazy) |
| Advanced Options | ✅ Sí | ✅ Sí | ⚠️ Solo en complexity='advanced' |

**Problema con Templates**:
```tsx
{/* Template Button (solo en modo create y si no hay nombre aún) */}
{mode === 'create' && !recipe.name && (  // ❌ Oculto si hay nombre
  <Box>
    <Button
      variant="outline"
      colorPalette="blue"
      onClick={() => setIsTemplateSelectorOpen(true)}
      w="full"
    >
      📋 Usar Template
    </Button>
  </Box>
)}
```

**Problemas**:
1. ❌ El botón de templates **desaparece** si el usuario ingresa un nombre
2. ❌ No hay forma de volver a acceder a templates después
3. ❌ Podría estar en un lugar más prominente (ej: como tab o sección)

**Problema con Substitutions**:
- ✅ Componente `SubstitutionsEditor.tsx` existe
- ❌ **NO se renderiza** en ninguna sección de RecipeBuilder
- ❌ Feature flag `allowSubstitutions` no hace nada visible

**Impacto**: 🟡 **MODERADO**
- Features prometidas no están accesibles
- Confusión entre documentación e implementación

---

### 5. PROBLEMA DE UX: Placeholders y Ayuda Contextual

**Placeholders Problemáticos**:

| Campo | Placeholder Actual | Problema | Sugerencia |
|-------|-------------------|----------|------------|
| Item (Input) | "Nombre del item" | Muy genérico | "Buscar material..." |
| Unidad (Output) | "Ej: unidad, kg, litros" | Da ejemplos pero acepta cualquier cosa | Usar SelectField |
| Cantidad | "Ej: 1" | Poco descriptivo | "Cantidad (número positivo)" |
| Yield % | "Ej: 90" | No explica qué es yield | "% de rendimiento (ej: 90% = 10% pérdida)" |

**Falta de Mensajes de Ayuda**:
- ❌ No hay tooltips explicando qué es "yield percentage"
- ❌ No hay ejemplos visuales de cómo funciona el waste %
- ❌ No hay guía de "qué tipo de material usar" por entityType

**Impacto**: 🟡 **MODERADO**
- Curva de aprendizaje innecesariamente alta
- Usuarios cometen errores por falta de guía

---

## 🎯 PRIORIDADES DE CORRECCIÓN

### 🔴 CRÍTICAS (Bloquean funcionalidad básica)

1. **InputsEditorSection: Reemplazar Input por MaterialSelector**
   - **Impacto**: Alto - bloquea selección eficiente de materiales
   - **Esfuerzo**: Medio (2-3 horas)
   - **Archivos**: `InputsEditorSection.tsx`

2. **OutputConfigSection: Agregar selector de output item**
   - **Impacto**: Crítico - bloquea creación de recetas sin preselectedItem
   - **Esfuerzo**: Medio (2-3 horas)
   - **Archivos**: `OutputConfigSection.tsx`

3. **OutputConfigSection: Selector de unidades estándar**
   - **Impacto**: Alto - previene inconsistencias de datos
   - **Esfuerzo**: Bajo (1 hora)
   - **Archivos**: `OutputConfigSection.tsx`

### 🟡 IMPORTANTES (Mejoran UX significativamente)

4. **Integrar SubstitutionsEditor en RecipeBuilder**
   - **Impacto**: Medio - feature documentada no visible
   - **Esfuerzo**: Medio (2-3 horas)
   - **Archivos**: `RecipeBuilder.tsx`, nueva sección

5. **Mejorar visibilidad de Templates**
   - **Impacto**: Medio - feature útil oculta
   - **Esfuerzo**: Bajo (1 hora)
   - **Archivos**: `RecipeBuilder.tsx`

6. **Agregar tooltips y ayuda contextual**
   - **Impacto**: Medio - reduce errores de usuario
   - **Esfuerzo**: Bajo (1-2 horas)
   - **Archivos**: Todas las secciones

### 🟢 DESEABLES (Refinamiento)

7. **Crear ProductSelector para kits**
   - **Impacto**: Bajo - solo para entityType='kit'
   - **Esfuerzo**: Medio (3-4 horas)
   - **Archivos**: Nuevo componente, InputsEditorSection

8. **Agregar preview de costo en tiempo real**
   - **Impacto**: Bajo - mejora experiencia
   - **Esfuerzo**: Medio (2-3 horas)
   - **Archivos**: `InputsEditorSection.tsx`, `CostSummarySection.tsx`

---

## 💡 SOLUCIONES PROPUESTAS

### Solución 1: InputsEditorSection con MaterialSelector

**Antes**:
```tsx
<Input
  size="sm"
  placeholder="Nombre del item"
  value={typeof input.item === 'string' ? input.item : input.item.name}
  onChange={(e) => handleUpdateInput(index, { item: e.target.value })}
/>
```

**Después**:
```tsx
import { MaterialSelector } from '@/shared/components/MaterialSelector';

// En el render:
<MaterialSelector
  onMaterialSelected={(material) =>
    handleUpdateInput(index, {
      item: {
        id: material.id,
        name: material.name,
        type: 'material',
        unit: material.unit,
        currentStock: material.stock
      }
    })
  }
  placeholder="Buscar materia prima..."
  excludeIds={inputs.map(i => typeof i.item === 'object' ? i.item.id : '')}
  filterByStock={true}
/>

{/* Mostrar material seleccionado */}
{typeof input.item === 'object' && input.item.name && (
  <Flex align="center" gap="2" mt="1">
    <Badge colorPalette="blue">{input.item.name}</Badge>
    <Text fontSize="xs" color="gray.600">
      Stock: {input.item.currentStock} {input.item.unit}
    </Text>
  </Flex>
)}
```

**Beneficios**:
- ✅ Búsqueda con autocompletado
- ✅ Validación automática de existencia
- ✅ Información de stock visible
- ✅ Previene duplicados
- ✅ Mejor UX

---

### Solución 2: OutputConfigSection con Selector de Item

**Código Nuevo**:
```tsx
// Agregar al principio del archivo
import { MaterialSelector } from '@/shared/components/MaterialSelector';

// En el component:
{!preselectedItem && (
  <Field.Root required>
    <Field.Label>Item de Salida</Field.Label>
    <MaterialSelector
      onMaterialSelected={(material) =>
        updateOutput({
          item: {
            id: material.id,
            name: material.name,
            type: 'material'
          }
        })
      }
      placeholder="Selecciona el material de salida..."
      filterByStock={false}  // No requerimos stock para output
    />
    <Field.HelperText>
      Selecciona qué material produce esta receta
    </Field.HelperText>
  </Field.Root>
)}

{/* Mostrar item seleccionado (pre-filled o seleccionado) */}
{(preselectedItem || output.item) && (
  <Field.Root>
    <Field.Label>Item de Salida</Field.Label>
    <Badge colorPalette="green" size="lg">
      {preselectedItem?.name || output.item?.name}
    </Badge>
    {preselectedItem && (
      <Field.HelperText>
        Este item está preseleccionado y no se puede cambiar
      </Field.HelperText>
    )}
  </Field.Root>
)}
```

**Beneficios**:
- ✅ Permite seleccionar output item cuando no hay preselectedItem
- ✅ Soluciona el error de validación bloqueante
- ✅ Mantiene compatibilidad con preselectedItem

---

### Solución 3: Selector de Unidades Estándar

**Código Nuevo**:
```tsx
// Definir al inicio del archivo
const STANDARD_UNITS = [
  // Unidades de masa
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'mg', label: 'Miligramos (mg)' },

  // Unidades de volumen
  { value: 'l', label: 'Litros (l)' },
  { value: 'ml', label: 'Mililitros (ml)' },

  // Unidades discretas
  { value: 'unit', label: 'Unidad' },
  { value: 'portion', label: 'Porción' },
  { value: 'piece', label: 'Pieza' },

  // Otras
  { value: 'dozen', label: 'Docena' },
  { value: 'pack', label: 'Paquete' },
];

// Reemplazar Input por SelectField:
<SelectField
  label="Unidad de Medida"
  placeholder="Selecciona una unidad"
  options={STANDARD_UNITS}
  value={output.unit ? [output.unit] : []}
  onValueChange={(details) => updateOutput({ unit: details.value[0] })}
  required
  helperText="Unidad de medida del output"
/>
```

**Beneficios**:
- ✅ Unidades consistentes en toda la aplicación
- ✅ Fácil de extender
- ✅ Previene errores tipográficos
- ✅ Permite conversiones automáticas futuras

---

### Solución 4: Integrar SubstitutionsEditor

**Ubicación**: Agregar como nueva sección en RecipeBuilder.tsx

**Código**:
```tsx
import { SubstitutionsEditor } from './components/SubstitutionsEditor'

// En la función de sections:
const sections = useMemo(() => {
  return {
    // ... secciones existentes
    substitutions:
      mergedFeatures.allowSubstitutions &&
      recipe.inputs &&
      recipe.inputs.length > 0,
  }
}, [complexity, mergedFeatures, recipe.inputs])

// En el render (después de InputsEditorSection):
{sections.substitutions && (
  <Suspense fallback={<SectionLoader />}>
    <SubstitutionsEditor
      recipe={recipe}
      updateRecipe={updateRecipe}
    />
  </Suspense>
)}
```

**Habilitar por defecto**:
```tsx
// En useRecipeBuilder.ts
const DEFAULT_FEATURES: Required<RecipeBuilderFeatures> = {
  // ...
  allowSubstitutions: true,  // ✅ Cambiar a true por defecto
  // ...
}
```

---

## 📊 COMPARACIÓN: Antes vs Después

### Flujo de Creación de Receta - ANTES

```
1. Usuario abre modal "Crear Material Elaborado"
2. Selecciona categoría "Material Elaborado"
3. ⚠️ Alert amarillo: "Los materiales elaborados requieren una receta..."
4. Usuario hace scroll al RecipeBuilder
5. ❌ ERROR: "El item de output es requerido" (no hay campo para seleccionarlo)
6. Usuario confundido, no puede continuar
7. ❌ BLOQUEADO
```

### Flujo de Creación de Receta - DESPUÉS

```
1. Usuario abre modal "Crear Material Elaborado"
2. Selecciona categoría "Material Elaborado"
3. ✅ Info: "Los materiales elaborados requieren una receta..."
4. Usuario ve RecipeBuilder con campos claros:

   📋 Información Básica
   ├─ Nombre: [Input: "Hamburguesa Clásica"]
   └─ Descripción: [Textarea: "Hamburguesa con queso..."]

   🎯 Configuración de Salida
   ├─ Item de Salida: [MaterialSelector ▼]
   │   └─ [Selecciona: "Hamburguesa Lista (elaborado)"]
   ├─ Cantidad: [1]
   └─ Unidad: [SelectField: "Unidad" ▼]

   🧩 Ingredientes
   ├─ [MaterialSelector: "Carne molida"] → 200g → Yield 95%
   ├─ [MaterialSelector: "Pan de hamburguesa"] → 1 unit
   ├─ [MaterialSelector: "Queso cheddar"] → 2 slices
   └─ [+ Agregar Ingrediente]

   💰 Resumen de Costos
   └─ Costo Total: $450.00 | Costo/Unidad: $450.00

5. ✅ Usuario completa todos los campos
6. ✅ Click "Crear Receta"
7. ✅ Validación exitosa
8. ✅ Material creado con receta asociada
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Correcciones Críticas (1-2 días)
- [ ] Solución 1: InputsEditorSection con MaterialSelector
- [ ] Solución 2: OutputConfigSection con selector de item
- [ ] Solución 3: Selector de unidades estándar
- [ ] Testing: Validar flujo completo de creación de material elaborado

### Fase 2: Mejoras de UX (1 día)
- [ ] Solución 4: Integrar SubstitutionsEditor
- [ ] Mejorar visibilidad de Templates (siempre visible como tab)
- [ ] Agregar tooltips y ayuda contextual
- [ ] Testing: Validar todas las features documentadas son accesibles

### Fase 3: Refinamiento (Opcional, 1-2 días)
- [ ] Crear ProductSelector para entityType='kit'
- [ ] Agregar preview de costo en tiempo real
- [ ] Optimización de performance
- [ ] Testing E2E completo

---

## 📝 CHECKLIST DE VALIDACIÓN

Después de implementar las correcciones, validar:

### Funcionalidad Básica
- [ ] Puedo crear un material elaborado desde el modal de materiales
- [ ] Puedo seleccionar ingredientes usando MaterialSelector
- [ ] Puedo seleccionar un item de output (si no hay preselectedItem)
- [ ] Puedo seleccionar unidades de medida de una lista estándar
- [ ] La validación pasa sin errores
- [ ] La receta se guarda correctamente en la BD

### Features Avanzadas
- [ ] Puedo usar templates para iniciar recetas
- [ ] Puedo configurar substituciones de ingredientes
- [ ] Veo el resumen de costos calculado automáticamente
- [ ] Puedo agregar instrucciones de preparación
- [ ] Puedo configurar yield/waste percentages

### UX/UI
- [ ] Los placeholders son claros y específicos
- [ ] Hay tooltips explicando conceptos complejos
- [ ] Los errores de validación son claros
- [ ] No hay campos confusos o ambiguos
- [ ] La información de stock es visible
- [ ] Los badges de estado son informativos

### Integración
- [ ] Material elaborado se crea con recipe_id correcto
- [ ] El stock inicial refleja el output.quantity
- [ ] Los costos se calculan correctamente
- [ ] Los materiales consumidos se validan contra stock
- [ ] La relación material ↔ receta es bidireccional

---

## 🎓 LECCIONES APRENDIDAS

1. **Documentación vs Implementación**: La documentación promete features que no son visibles en la UI
2. **Validación Desconectada**: La validación requiere campos que no existen en la UI
3. **Componentes Reutilizables No Usados**: MaterialSelector existe pero no se usa donde debería
4. **Campos de Texto Libre**: Generan inconsistencias de datos
5. **Feature Flags Sin Efecto**: allowSubstitutions no hace nada visible

---

## 📚 REFERENCIAS

- **Documentación Técnica**: `docs/recipe/ARCHITECTURE_DEFINITIVE.md`
- **Guía de Implementación**: `docs/recipe/IMPLEMENTATION_GUIDE.md`
- **Integración con Materiales**: `docs/recipe/MATERIALS_INTEGRATION.md`
- **Testing**: `docs/recipe/PRODUCTS_INTEGRATION_TESTING.md`

---

## ✅ PRÓXIMOS PASOS

1. **Revisión con el equipo**: Validar prioridades y soluciones propuestas
2. **Crear Issues/Tasks**: Dividir en tareas implementables
3. **Implementación Fase 1**: Correcciones críticas primero
4. **Testing Exhaustivo**: Validar cada corrección
5. **Documentación Actualizada**: Reflejar cambios en la documentación

---

**Fin del Reporte de Auditoría** 🎯
