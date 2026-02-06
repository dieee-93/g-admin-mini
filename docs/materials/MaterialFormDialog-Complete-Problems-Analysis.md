# Material Form Dialog - Complete Problems Analysis & Solutions

**Date:** 2026-02-05
**Status:** 🔴 CRITICAL - Multiple UX/Architecture Issues
**Total Issues:** 8 (2 fixed, 6 remaining)

---

## 📊 Executive Summary

### Issues Overview

| # | Issue | Status | Priority | Complexity | Est. Time |
|---|-------|--------|----------|------------|-----------|
| 1 | Stale Closures in Data Flow | ✅ **FIXED** | Critical | ⭐⭐⭐ | - |
| 2 | Artificial recipeId Restriction | ✅ **FIXED** | High | ⭐ | - |
| 3 | Labor/Staff System Duplication | 📋 **ANALYZED** | Critical | ⭐⭐⭐⭐⭐ | 5h |
| 4 | Missing `<form>` Element | 🔴 **PENDING** | High | ⭐⭐ | 1h |
| 5 | No Visual Validation Feedback | 🔴 **PENDING** | High | ⭐⭐⭐ | 2h |
| 6 | Confusing Dual Submit Buttons | 🔴 **PENDING** | High | ⭐⭐ | 1h |
| 7 | Conditional Sections UX | 🟡 **PENDING** | Medium | ⭐⭐ | 1h |
| 8 | Deep Component Nesting | 🟡 **INFO** | Low | ⭐⭐⭐⭐⭐ | Future |

**Total Estimated Implementation Time:** 10 hours

---

## 🚨 Issue #4: Missing `<form>` Element

### Problem Description

The MaterialFormDialog doesn't use a semantic `<form>` element. It's just a Dialog with Stack components.

**Current Structure:**
```tsx
<Dialog.Root>
  <Dialog.Body>
    <Stack gap="5">  {/* ❌ Should be <form> */}
      <SectionCard>...</SectionCard>
      <SectionCard>...</SectionCard>
      {/* ... */}
      <Flex>
        <Button onClick={handleSubmit}>Submit</Button>  {/* ❌ Manual handler */}
      </Flex>
    </Stack>
  </Dialog.Body>
</Dialog.Root>
```

### Impact

1. **No native form validation**
   - Can't use HTML5 validation attributes (`required`, `pattern`, `min`, `max`)
   - Must implement all validation manually

2. **Can't use Enter key to submit**
   - Users expect pressing Enter in input to submit form
   - Currently does nothing

3. **Accessibility issues**
   - Screen readers won't detect it as a form
   - No semantic structure for assistive technology
   - Missing ARIA form roles

4. **No automatic form reset**
   - Must manually reset all fields
   - Easy to miss fields when closing dialog

5. **No form-level events**
   - Can't use `onSubmit` event
   - Can't prevent default form submission
   - Can't use FormData API

### Evidence

**File:** `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/MaterialFormDialog.tsx`

**Lines 206-493:** Dialog.Body contains Stack, not form

```tsx
<Dialog.Body>
  <Stack gap="5">  {/* Line 206 - Should be <form> */}
    {/* All form content */}
  </Stack>
</Dialog.Body>
```

**Lines 458-474:** Submit button uses onClick instead of form submission

```tsx
<Button
  onClick={handleSubmit}  // ❌ Manual click handler
  disabled={...}
  data-testid="submit-material"
>
  {isSubmitting ? "Guardando..." : submitButtonContent}
</Button>
```

### Solution

#### Step 1: Wrap content in `<form>` element

```tsx
<Dialog.Body>
  <form
    onSubmit={(e) => {
      e.preventDefault();  // Prevent browser default
      handleSubmit();
    }}
    id="material-form"
  >
    <Stack gap="5">
      {/* All form content */}
    </Stack>
  </form>
</Dialog.Body>
```

#### Step 2: Update submit button to use form submission

```tsx
<Button
  type="submit"  // ✅ Form submit button
  form="material-form"
  disabled={...}
  data-testid="submit-material"
>
  {isSubmitting ? "Guardando..." : submitButtonContent}
</Button>
```

#### Step 3: Add Enter key support to inputs

With `<form>` element, pressing Enter in any input will automatically trigger form submission.

#### Step 4: Add HTML5 validation attributes (optional enhancement)

```tsx
<Input
  name="name"
  required
  minLength={3}
  maxLength={100}
  pattern="[A-Za-z0-9\s]+"  // Optional: alphanumeric only
  aria-required="true"
  aria-invalid={!!fieldErrors.name}
/>
```

### Benefits

- ✅ Native browser validation
- ✅ Enter key submits form
- ✅ Better accessibility (screen readers)
- ✅ Semantic HTML structure
- ✅ Can use FormData API for easier data extraction
- ✅ Automatic form reset on close

### Risks

- ⚠️ May need to adjust CSS styling (form is block-level)
- ⚠️ Need to ensure nested buttons don't trigger form submission
- ⚠️ RecipeBuilder's buttons must have `type="button"` to prevent form submit

### Implementation Checklist

- [ ] Add `<form>` wrapper in Dialog.Body
- [ ] Add `onSubmit` handler with `preventDefault()`
- [ ] Change submit button `type="submit"`
- [ ] Add `form="material-form"` to buttons outside form
- [ ] Add `type="button"` to all non-submit buttons
- [ ] Test Enter key submission
- [ ] Test with screen reader
- [ ] Update unit tests

---

## 🚨 Issue #5: No Visual Validation Feedback

### Problem Description

When the submit button is disabled due to validation errors, the user has no indication of WHY it's disabled or WHICH fields need attention.

**Current Behavior:**
```tsx
<Button
  disabled={
    !formData.name ||
    !formData.type ||
    isSubmitting ||
    validationState.hasErrors  // ⚠️ User doesn't know WHY
  }
>
  Submit
</Button>
```

User sees: 🔘 **Gray button** (no explanation)

### Impact

1. **User frustration**
   - Button is disabled but no explanation why
   - Must guess which field is missing/invalid
   - May think app is broken

2. **Increased support tickets**
   - Users report "can't save material"
   - Support must guide users through validation errors

3. **Poor UX perception**
   - Feels unpolished
   - Users may abandon form

4. **Hidden validation errors**
   - From logs: `Expected number, received undefined`
   - User never sees this error
   - Can't fix what they can't see

### Evidence

**File:** `MaterialFormDialog.tsx` lines 462-467

```tsx
disabled={
  !formData.name ||        // No visual indicator
  !formData.type ||        // No visual indicator
  isSubmitting ||
  validationState.hasErrors  // Errors hidden in console
}
```

**From MaterialFormDialog-Architecture.md:**
> "User sees disabled button but no explanation"
> "No indication which field is missing or invalid"

### Solution

#### Option A: Validation Summary Alert (Recommended ⭐)

Add prominent alert above submit button showing all errors:

```tsx
{/* Before submit button */}
{validationState.hasErrors && (
  <Alert.Root status="error" variant="subtle">
    <Alert.Indicator>
      <ExclamationTriangleIcon />
    </Alert.Indicator>
    <Alert.Content>
      <Alert.Title>No se puede guardar</Alert.Title>
      <Alert.Description>
        <Stack gap="2">
          <Text fontWeight="semibold">Corrige los siguientes problemas:</Text>
          <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
            {!formData.name && <li>Nombre del material es requerido</li>}
            {!formData.type && <li>Tipo de material es requerido</li>}
            {validationState.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </Stack>
      </Alert.Description>
    </Alert.Content>
  </Alert.Root>
)}
```

#### Option B: Tooltip on Disabled Button

Show tooltip when hovering over disabled button:

```tsx
<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <Button disabled={...}>Submit</Button>
  </Tooltip.Trigger>
  <Tooltip.Positioner>
    <Tooltip.Content>
      {getDisabledReason()}
    </Tooltip.Content>
  </Tooltip.Positioner>
</Tooltip.Root>

function getDisabledReason() {
  if (!formData.name) return "Falta nombre del material";
  if (!formData.type) return "Falta tipo de material";
  if (validationState.hasErrors) {
    return `${validationState.errors.length} errores de validación`;
  }
  return "Completando...";
}
```

#### Option C: Inline Field Validation (Complementary)

Highlight invalid fields with red border and error message:

```tsx
<ValidatedField
  label="Nombre"
  value={formData.name}
  error={!formData.name ? "Este campo es requerido" : fieldErrors.name}
  // Red border if error
  borderColor={!formData.name || fieldErrors.name ? "red.500" : undefined}
/>
```

#### Recommended Approach: **All Three Combined**

1. **Alert summary** - Shows all errors at once (quick scan)
2. **Inline errors** - Shows errors on specific fields (precise feedback)
3. **Tooltip** - Shows reason when hovering disabled button (contextual help)

### Example Implementation

```tsx
// Helper function
function getValidationSummary() {
  const errors = [];

  if (!formData.name) errors.push("Nombre del material es requerido");
  if (!formData.type) errors.push("Tipo de material es requerido");

  if (formData.type === 'ELABORATED') {
    if (!formData.recipe_id) errors.push("Receta es requerida para materiales elaborados");
  }

  // Add field-level errors
  if (fieldErrors.name) errors.push(`Nombre: ${fieldErrors.name}`);
  if (fieldErrors.category) errors.push(`Categoría: ${fieldErrors.category}`);

  // Add validation errors from hook
  errors.push(...validationState.errors);

  return errors;
}

// In JSX (before submit button)
{(() => {
  const errors = getValidationSummary();
  const canSubmit = errors.length === 0;

  return (
    <>
      {!canSubmit && (
        <Alert.Root status="error">
          <Alert.Indicator><ExclamationTriangleIcon /></Alert.Indicator>
          <Alert.Content>
            <Alert.Title>
              {errors.length} problema{errors.length > 1 ? 's' : ''} encontrado{errors.length > 1 ? 's' : ''}
            </Alert.Title>
            <Alert.Description>
              <ul>
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Button disabled={!canSubmit || isSubmitting}>
        {submitButtonContent}
      </Button>
    </>
  );
})()}
```

### Benefits

- ✅ Clear feedback on what's wrong
- ✅ Users can fix issues quickly
- ✅ Reduces support tickets
- ✅ Professional UX
- ✅ Better accessibility

### Implementation Checklist

- [ ] Create `getValidationSummary()` helper function
- [ ] Add Alert.Root component before submit button
- [ ] List all validation errors with clear messages
- [ ] Highlight invalid fields with red border
- [ ] Add Tooltip to disabled button (optional)
- [ ] Test with various validation scenarios
- [ ] Test accessibility with screen reader

---

## 🚨 Issue #6: Confusing Dual Submit Buttons

### Problem Description

Two submit buttons confuse users:
1. **RecipeBuilder** has "Crear Receta" button
2. **MaterialFormDialog** has "Crear Material" button

Users don't know:
- Which button to press first?
- Do I need to press both?
- Does "Crear Receta" save the material?
- What happens if I only press one?

### Impact

1. **User confusion**
   - Unclear workflow
   - Trial and error approach
   - May lose work if they don't understand flow

2. **Incomplete data**
   - User might create material without recipe
   - User might create recipe but not material
   - Orphaned recipes in database

3. **Poor UX**
   - Looks unpolished
   - Feels like two separate forms glued together
   - No clear progression

### Current Flow

```
1. User fills material name/type
2. User sees RecipeBuilder with "Crear Receta" button
3. User clicks "Crear Receta" → Recipe saves to DB
4. ProductionConfigSection becomes enabled
5. User fills equipment/labor
6. User scrolls down
7. User sees "Crear Material" button
8. User clicks "Crear Material" → Material saves to DB
```

**Problems:**
- Two separate save actions
- Recipe can exist without material
- No indication of progress
- Confusing if errors occur

### Evidence

**File:** `src/modules/recipe/components/RecipeBuilder/RecipeBuilder.tsx` line 320

```tsx
<Button onClick={handleSave}>
  {mode === 'create' ? 'Crear Receta' : 'Guardar Cambios'}
</Button>
```

**File:** `MaterialFormDialog.tsx` line 458

```tsx
<Button onClick={handleSubmit}>
  {isSubmitting ? "Guardando..." : submitButtonContent}
</Button>
```

**From user complaint:**
> "hay un boton de crear receta y luego abajo otro submit"

### Solution Options

#### Option A: Hide RecipeBuilder Buttons (Current Implementation ✅)

**Already implemented but needs UX enhancement:**

```tsx
// ElaboratedFields.tsx
<RecipeBuilder
  hideActions={true}  // ✅ Hides buttons
  onSave={handleRecipeSaved}
  {...props}
/>
```

**Problem:** No visual feedback that recipe was created/validated.

**Enhancement:** Add progress indicator:

```tsx
<Stack gap="4">
  {/* Progress Steps */}
  <Flex gap="2" align="center">
    <Badge colorPalette={formData.recipe_id ? "green" : "gray"}>
      {formData.recipe_id ? "✓" : "1"} Receta
    </Badge>
    <Box h="2px" flex="1" bg="gray.300" />
    <Badge colorPalette={formData.production_config ? "green" : "gray"}>
      {formData.production_config ? "✓" : "2"} Producción
    </Badge>
    <Box h="2px" flex="1" bg="gray.300" />
    <Badge colorPalette="gray">3 Material</Badge>
  </Flex>

  {/* RecipeBuilder without buttons */}
  <RecipeBuilder hideActions={true} />

  {/* ProductionConfigSection */}
  <ProductionConfigSection />

  {/* Single submit button at bottom */}
  <Button onClick={handleSubmit}>Crear Material Completo</Button>
</Stack>
```

#### Option B: Wizard/Stepper UI

Multi-step form with explicit navigation:

```tsx
<Stepper.Root value={step} count={3}>
  <Stepper.List>
    <Stepper.Item index={0}>
      <Stepper.Trigger>Receta</Stepper.Trigger>
    </Stepper.Item>
    <Stepper.Item index={1}>
      <Stepper.Trigger>Producción</Stepper.Trigger>
    </Stepper.Item>
    <Stepper.Item index={2}>
      <Stepper.Trigger>Guardar</Stepper.Trigger>
    </Stepper.Item>
  </Stepper.List>

  <Stepper.Content index={0}>
    <RecipeBuilder hideActions={true} />
    <Button onClick={() => setStep(1)}>Siguiente</Button>
  </Stepper.Content>

  <Stepper.Content index={1}>
    <ProductionConfigSection />
    <Button onClick={() => setStep(2)}>Siguiente</Button>
  </Stepper.Content>

  <Stepper.Content index={2}>
    <ReviewSummary />
    <Button onClick={handleSubmit}>Crear Material</Button>
  </Stepper.Content>
</Stepper.Root>
```

**Pros:** Clear progression, can't skip steps
**Cons:** More complex, may feel slow

#### Option C: Auto-save Recipe (Recommended ⭐)

Recipe auto-saves when valid, no button needed:

```tsx
// In ElaboratedFields
useEffect(() => {
  if (recipeValidation.isValid) {
    // Auto-save recipe when valid
    saveRecipe().then(savedRecipe => {
      setFormData(prev => ({
        ...prev,
        recipe_id: savedRecipe.id
      }));
    });
  }
}, [recipeValidation.isValid, recipe]);

// Show auto-save indicator
{recipeValidation.isValid && (
  <Badge colorPalette="green">
    ✓ Receta guardada automáticamente
  </Badge>
)}
```

**Pros:** Seamless, no extra clicks, can't lose work
**Cons:** May save incomplete recipes, need undo

### Recommended Solution: **Option A with Progress Indicators**

Why:
- ✅ Least disruptive (already partially implemented)
- ✅ Clear visual feedback
- ✅ Single submit button (clear intent)
- ✅ Works with existing validation
- ✅ Can add wizard later if needed

### Implementation

```tsx
// ElaboratedFields.tsx

<Stack gap="6">
  {/* Progress Indicator */}
  <Box
    p="4"
    bg="bg.subtle"
    borderRadius="lg"
    borderWidth="1px"
    borderColor="border.subtle"
  >
    <Stack gap="3">
      <Typography fontSize="sm" fontWeight="bold" color="fg.muted">
        Progreso de Configuración
      </Typography>

      <Flex gap="2" align="center">
        {/* Step 1: Recipe */}
        <Badge
          colorPalette={formData.recipe_id ? "green" : "blue"}
          size="lg"
        >
          {formData.recipe_id ? "✓" : "1"} Receta
        </Badge>
        <Box h="2px" flex="1" bg={formData.recipe_id ? "green.500" : "gray.300"} />

        {/* Step 2: Production */}
        <Badge
          colorPalette={formData.production_config ? "green" : formData.recipe_id ? "blue" : "gray"}
          size="lg"
        >
          {formData.production_config ? "✓" : "2"} Producción
        </Badge>
        <Box h="2px" flex="1" bg={formData.production_config ? "green.500" : "gray.300"} />

        {/* Step 3: Material */}
        <Badge
          colorPalette="gray"
          size="lg"
        >
          3 Completar
        </Badge>
      </Flex>

      {/* Helpful text */}
      {!formData.recipe_id && (
        <Text fontSize="xs" color="fg.muted">
          Paso 1: Configura la receta con ingredientes y cantidades
        </Text>
      )}
      {formData.recipe_id && !formData.production_config && (
        <Text fontSize="xs" color="fg.muted">
          Paso 2: (Opcional) Agrega equipamiento y mano de obra
        </Text>
      )}
      {formData.recipe_id && formData.production_config && (
        <Text fontSize="xs" color="fg.success">
          ✓ Todo listo! Haz clic en "Crear Material" abajo
        </Text>
      )}
    </Stack>
  </Box>

  {/* RecipeBuilder (no buttons) */}
  <RecipeBuilder hideActions={true} {...props} />

  {/* ProductionConfigSection */}
  <ProductionConfigSection {...props} />

  {/* Note: Single submit button in main dialog */}
</Stack>
```

### Benefits

- ✅ Clear visual progression
- ✅ User knows where they are
- ✅ Helpful contextual messages
- ✅ Single submit button (no confusion)
- ✅ Optional production config (visible in progress)

### Implementation Checklist

- [ ] Add progress indicator component
- [ ] Update ElaboratedFields to hide RecipeBuilder buttons
- [ ] Add step completion logic
- [ ] Add contextual help text
- [ ] Update main dialog submit button text
- [ ] Test full flow with users
- [ ] Update documentation

---

## 🟡 Issue #7: Conditional Sections Confusing UX

### Problem Description

Stock and Supplier sections only appear when `addToStockNow` switch is ON AND material type is NOT ELABORATED.

**Conditional Logic:**
```tsx
{addToStockNow && formData.type !== 'ELABORATED' && (
  <SectionCard title="Stock Inicial">...</SectionCard>
)}

{addToStockNow && formData.type !== 'ELABORATED' && (
  <SectionCard title="Información del Proveedor">...</SectionCard>
)}
```

**UX Issues:**
- Sections appear/disappear when toggling switch
- For ELABORATED materials, sections NEVER show (even with switch ON)
- Inconsistent: ProductionConfig always visible, Stock conditional

### Impact

1. **User confusion**
   - "Where did my stock section go?"
   - "Why can't I add initial stock to elaborated materials?"

2. **Inconsistent behavior**
   - Some sections always visible
   - Some sections conditional
   - Rules not obvious

3. **Lost work**
   - User fills stock fields
   - Changes type to ELABORATED
   - Stock fields disappear
   - Data lost

### Evidence

**File:** `MaterialFormDialog.tsx`

**Line 373:** Stock section conditional
```tsx
{addToStockNow && formData.type && formData.type !== 'ELABORATED' && (
  <SectionCard title="Stock Inicial">...</SectionCard>
)}
```

**Line 404:** Supplier section conditional
```tsx
{addToStockNow && formData.type && formData.type !== 'ELABORATED' && (
  <SectionCard title="Información del Proveedor">...</SectionCard>
)}
```

### Why ELABORATED Excluded?

**Reason:** Elaborated materials are produced, not purchased.
- Initial stock comes from production (executing recipe)
- No supplier (it's made in-house)

**But:** User doesn't see explanation, just sees sections vanish.

### Solution Options

#### Option A: Always Show, Disable Instead

Show sections always, but disable fields with explanation:

```tsx
<SectionCard title="Stock Inicial">
  {formData.type === 'ELABORATED' ? (
    <Alert.Root status="info">
      <Alert.Indicator><InformationCircleIcon /></Alert.Indicator>
      <Alert.Content>
        <Alert.Title>Stock generado por producción</Alert.Title>
        <Alert.Description>
          Los materiales elaborados generan stock automáticamente al ejecutar la receta.
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  ) : (
    <StockInitialFields {...props} />
  )}
</SectionCard>
```

**Pros:** Consistent UI, clear explanation
**Cons:** More visual clutter

#### Option B: Tab/Accordion UI

Organize sections in tabs or accordion:

```tsx
<Tabs.Root defaultValue="basic">
  <Tabs.List>
    <Tabs.Trigger value="basic">Información Básica</Tabs.Trigger>
    <Tabs.Trigger value="config">Configuración</Tabs.Trigger>
    <Tabs.Trigger
      value="stock"
      disabled={formData.type === 'ELABORATED'}
    >
      Stock Inicial
    </Tabs.Trigger>
  </Tabs.List>

  <Tabs.Content value="basic">...</Tabs.Content>
  <Tabs.Content value="config">...</Tabs.Content>
  <Tabs.Content value="stock">
    {formData.type === 'ELABORATED' ? (
      <Alert>No aplicable para materiales elaborados</Alert>
    ) : (
      <StockInitialFields />
    )}
  </Tabs.Content>
</Tabs.Root>
```

**Pros:** Organized, scalable
**Cons:** More navigation required

#### Option C: Keep Conditional, Add Switch Tooltip (Minimal ⭐)

Add tooltip explaining why switch is disabled:

```tsx
<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <Box>
      <Switch
        checked={addToStockNow}
        onCheckedChange={setAddToStockNow}
        disabled={formData.type === 'ELABORATED'}
      >
        Agregar stock inicial
      </Switch>
    </Box>
  </Tooltip.Trigger>
  {formData.type === 'ELABORATED' && (
    <Tooltip.Positioner>
      <Tooltip.Content>
        Los materiales elaborados generan stock mediante producción, no compra inicial
      </Tooltip.Content>
    </Tooltip.Positioner>
  )}
</Tooltip.Root>
```

**Pros:** Minimal change, clear explanation
**Cons:** Still hides sections

### Recommended Solution: **Option A**

Show all sections always, disable with explanation. Most transparent.

### Implementation Checklist

- [ ] Remove conditional rendering of sections
- [ ] Add disabled state to Stock section for ELABORATED
- [ ] Add info alert explaining why disabled
- [ ] Add disabled state to Supplier section for ELABORATED
- [ ] Test UX with users
- [ ] Update documentation

---

## 🟡 Issue #8: Deep Component Nesting (INFO)

### Problem Description

4 levels of component nesting with props drilling:

```
MaterialFormDialog (508 lines)
  ├─ useMaterialForm hook (456 lines)
  └─ ElaboratedFields (472 lines)
      ├─ RecipeBuilder (326 lines)
      │   └─ InputsEditorSection
      │       └─ MaterialSelector
      └─ ProductionConfigSection (449 lines)
          └─ EquipmentSelector (287 lines)
```

**Total:** ~2,586 lines across 8 major components

### Impact

1. **Complex debugging**
   - Hard to trace data flow
   - State updates cross multiple boundaries
   - Error stack traces are deep

2. **Props drilling**
   - `formData` passed through multiple levels
   - `setFormData` callbacks passed down
   - Hard to refactor

3. **Performance concerns**
   - Deep re-renders
   - Memoization required everywhere
   - Easy to create performance bugs

4. **Testing difficulty**
   - Hard to test in isolation
   - Many dependencies
   - Slow test execution

### Evidence

**From MaterialFormDialog-Architecture.md:**

| Component | Lines | Complexity |
|-----------|-------|------------|
| useMaterialForm | 456 | ⭐⭐⭐⭐⭐ |
| MaterialFormDialog | 508 | ⭐⭐⭐⭐ |
| ElaboratedFields | 472 | ⭐⭐⭐⭐⭐ |
| ProductionConfigSection | 449 | ⭐⭐⭐⭐ |
| RecipeBuilder | 326 | ⭐⭐⭐⭐ |

### Solution (Future Refactor)

#### Option A: Context API

Create MaterialFormContext to avoid props drilling:

```tsx
// MaterialFormContext.tsx
const MaterialFormContext = createContext<MaterialFormContextValue | null>(null);

export function MaterialFormProvider({ children }) {
  const formState = useMaterialForm(...);

  return (
    <MaterialFormContext.Provider value={formState}>
      {children}
    </MaterialFormContext.Provider>
  );
}

export function useMaterialFormContext() {
  const context = useContext(MaterialFormContext);
  if (!context) throw new Error('Must be used within MaterialFormProvider');
  return context;
}

// In components
function ElaboratedFields() {
  const { formData, updateFormData } = useMaterialFormContext();
  // No props drilling needed!
}
```

#### Option B: Compound Components

Break into smaller, focused components:

```tsx
// MaterialForm.Root - Main wrapper
// MaterialForm.BasicInfo - Section 1
// MaterialForm.TypeConfig - Section 2
// MaterialForm.StockSection - Section 3
// MaterialForm.Actions - Submit buttons

<MaterialForm.Root value={formData} onChange={updateFormData}>
  <MaterialForm.BasicInfo />
  <MaterialForm.TypeConfig />
  {formData.type === 'ELABORATED' && (
    <>
      <MaterialForm.Recipe />
      <MaterialForm.ProductionConfig />
    </>
  )}
  <MaterialForm.Actions />
</MaterialForm.Root>
```

#### Option C: Zustand Store

Use external state management:

```tsx
// materialFormStore.ts
export const useMaterialFormStore = create((set) => ({
  formData: {},
  setFormData: (data) => set({ formData: data }),
  isSubmitting: false,
  // ...
}));

// In any component
function ElaboratedFields() {
  const { formData, setFormData } = useMaterialFormStore();
  // No props needed!
}
```

### Recommendation

**NOT URGENT** - Current structure works, just complex.

**Future refactor (Phase 3):**
1. Introduce Context API first (least disruptive)
2. Gradually extract sections into compound components
3. Consider Zustand only if Context becomes too complex

### Benefits of Refactor

- ✅ Easier to understand
- ✅ Less props drilling
- ✅ Easier to test
- ✅ Better performance
- ✅ More maintainable

### Estimated Effort

- Context API: 4-6 hours
- Compound Components: 8-12 hours
- Zustand: 6-8 hours

**Not included in current implementation plan.**

---

## 📋 Master Implementation Plan

### Phase 1: Critical Fixes (4 hours)
**Priority:** CRITICAL | **Deadline:** This week

1. ✅ Fix stale closures (DONE)
2. ✅ Remove recipeId restriction (DONE)
3. 🔧 Add `<form>` element (1h)
4. 🔧 Add validation feedback UI (2h)
5. 🔧 Add progress indicators for recipe flow (1h)

### Phase 2: Labor/Staff Unification (5 hours)
**Priority:** HIGH | **Deadline:** Next sprint

See `Labor-Staff-Unification-Analysis.md` for detailed plan.

1. Update ProductionConfig types
2. Replace labor fields with StaffSelector
3. Update calculation logic
4. Migration script
5. Testing

### Phase 3: UX Improvements (2 hours)
**Priority:** MEDIUM | **Deadline:** Future sprint

1. Fix conditional sections (1h)
2. Polish validation messages (1h)

### Phase 4: Architecture Refactor (Optional)
**Priority:** LOW | **Deadline:** TBD

1. Introduce Context API
2. Extract compound components
3. Reduce nesting

---

## 🎯 Success Criteria

### For Phase 1 (Critical Fixes)

- [ ] Form uses semantic `<form>` element
- [ ] Enter key submits form
- [ ] Screen reader announces form correctly
- [ ] Validation errors shown in alert above submit
- [ ] Invalid fields highlighted with red border
- [ ] Progress indicator shows recipe → production → material flow
- [ ] Only ONE submit button visible ("Crear Material")
- [ ] All E2E tests pass

### For Phase 2 (Labor/Staff)

- [ ] StaffSelector replaces simple labor inputs
- [ ] Loaded factor applied to all labor costs
- [ ] Can assign roles AND specific employees
- [ ] Labor costs match team module calculations
- [ ] Migration script runs successfully
- [ ] No data loss from old format

### For Phase 3 (UX)

- [ ] Stock section shows explanation when disabled
- [ ] No sections unexpectedly appear/disappear
- [ ] Tooltips explain disabled states
- [ ] User testing shows improved satisfaction

---

## 📚 Related Documentation

- `MaterialFormDialog-Architecture.md` - Complete architectural map
- `Labor-Staff-Unification-Analysis.md` - Labor system unification plan
- `src/pages/admin/supply-chain/materials/README.md` - Module overview
- `docs/materials/` - All materials documentation

---

**Status:** Ready for Phase 1 implementation
**Total Estimated Time:** 11 hours (4h Phase 1 + 5h Phase 2 + 2h Phase 3)
**Risk Level:** Medium (well-scoped, clear solutions)
