# FIELD COMPONENT CLEANUP - CONTINUATION PROMPT

## 🎯 OBJECTIVE
Replace all incorrect uses of `<Field>` component with proper wrapper components from the design system.

## ✅ COMPLETED FILES
1. `BasicInfoSection.tsx` - ✅ DONE
2. `ProductListNew.tsx` - ✅ DONE
3. `ProductFormModalNew.tsx` - ✅ DONE (partially, ~22 Field uses remain)
4. `AssetConfigSection.tsx` - ✅ DONE (100% complete, 0 Field tags remaining)

## 🔄 CURRENT FILE IN PROGRESS
**File:** `src/pages/admin/supply-chain/products/components/sections/RentalTermsSection.tsx`
**Status:** Import fixed, but 27 `<Field>` tags remain to be replaced
**Line count:** 664 lines

## 📋 REPLACEMENT PATTERN

### ❌ INCORRECT (Current pattern in files):
```tsx
<Field label="Label text" required>
  <Input
    type="number"
    value={value?.toString() || ''}
    onChange={(e) => {
      const val = e.target.value ? parseFloat(e.target.value) : undefined;
      handleChange('field', val);
    }}
  />
  <Field.HelperText>Helper text here</Field.HelperText>
</Field>
```

### ✅ CORRECT (Use wrappers):
```tsx
<NumberField
  label="Label text"
  required
  value={value || 0}
  onChange={(val) => handleChange('field', val)}
  helperText="Helper text here"
/>
```

## 🛠️ AVAILABLE WRAPPERS
- `InputField` - For text inputs
- `NumberField` - For number inputs
- `TextareaField` - For textareas
- `SelectField` - For selects (already has label support)

## 📝 WHAT'S BEEN DONE

### Import Changes Made:
```tsx
// ✅ Updated imports in all files:
import {
  InputField,    // Added
  NumberField,   // Added
  TextareaField, // Added
  SelectField,   // Already correct
  // Removed: Field
} from '@/shared/ui';
```

### Files with Field imports from Chakra (for Field.Root advanced usage):
- BookingSection.tsx
- DigitalDeliverySection.tsx
- MaterialsSection.tsx
- ProductionSection.tsx
- RecurringConfigSection.tsx
- StaffSection.tsx
- PricingSection.tsx
- BookingRulesConfig.tsx
- BusinessHoursConfig.tsx
- RentalFieldsGroup.tsx
- CountableStockFields.tsx

These import `Field` from `@chakra-ui/react` for advanced Field.Root usage.

## 🚀 CONTINUATION PROMPT

```
Hola Claude! Necesito continuar con la limpieza de componentes Field.

CONTEXTO: Estamos reemplazando todos los usos incorrectos del componente `<Field>` por los wrappers correctos del design system (InputField, NumberField, TextareaField, SelectField).

ARCHIVO ACTUAL: `src/pages/admin/supply-chain/products/components/sections/RentalTermsSection.tsx`
- Import ya está corregido
- Quedan ~27 usos de `<Field>` por reemplazar
- Todos siguen el mismo patrón

PATRÓN DE REEMPLAZO:
- `<Field label="X"><Input type="number".../>` → `<NumberField label="X"...`
- `<Field label="X"><Input.../>` → `<InputField label="X"...`
- `<Field label="X"><Textarea.../>` → `<TextareaField label="X"...`
- `<Field.HelperText>Text</Field.HelperText>` → `helperText="Text"`
- Eliminar tags `</Field>` de cierre

IMPORTANTE:
- NO uses scripts, solo Edit tool con reemplazos manuales
- Haz múltiples edits en paralelo para acelerar
- Después de RentalTermsSection.tsx, espera el siguiente error del navegador para continuar con el próximo archivo

Por favor continúa reemplazando todos los Field en RentalTermsSection.tsx de la manera más rápida posible usando múltiples Edit calls en paralelo.
```

## 📊 PROGRESS SUMMARY
- Total files identified with Field issues: ~50+
- Files completed: 4
- Files in progress: 1 (RentalTermsSection.tsx)
- Files pending: Will appear as browser errors

## 🔍 HOW TO FIND REMAINING FIELD USAGE
```bash
# Count Field tags in a file
grep -c "<Field" path/to/file.tsx

# List all Field. usage
grep -n "Field\." path/to/file.tsx

# Find all files with Field imports from @/shared/ui
grep -r "Field.*from.*@/shared/ui" src --include="*.tsx"
```

## ⚠️ NOTES
- Field namespace (`Field.Root`, `Field.Label`) is CORRECT when imported from `@chakra-ui/react` for advanced cases
- Only Field imported from `@/shared/ui` is wrong (doesn't exist)
- Wrappers already include Field.Root internally, so they're simpler to use
