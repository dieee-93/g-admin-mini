# Products Form - Continuation Prompt: Testing Phase

**Fecha de creación**: 2025-01-11
**Status actual**: ✅ Integration completada | ⏳ Testing pendiente
**Progreso**: **90%** (18/20 tareas completadas)

---

## 🎯 INICIO RÁPIDO PARA NUEVA SESIÓN

### Prompt sugerido:
```
Continuar con la implementación del formulario de productos v3.0 - FASE DE TESTING.

Estado actual:
✅ Fases 1-4 completadas (Foundation, Sections)
✅ Fase 5 - Integration completada (Wizard, Page, API)
⏳ Fase 5 - Testing PENDIENTE

Archivos ya implementados:
- 10 secciones funcionales (BasicInfo, Materials, Staff, etc.)
- ProductFormWizard (navegación wizard completa)
- ProductFormPage (routing y estados)
- productFormApi (integración con Supabase)
- 0 errores TypeScript, 100% type-safe

LO QUE FALTA - TESTING:
1. Unit tests para helper functions (validations, calculations)
2. Unit tests para conversiones de unidades
3. Integration tests básicos (opcional)
4. Actualizar documentación final

Ver: PRODUCTS_FORM_TESTING_CONTINUATION.md (este archivo)
```

---

## 📋 LO QUE YA ESTÁ HECHO (90%)

### ✅ Fase 1: Foundation
- types/productForm.ts (556 líneas)
- config/formSectionsRegistry.tsx (262 líneas)
- hooks/useAvailableProductTypes.ts (162 líneas)
- services/productCostCalculation.ts (343 líneas)
- services/productFormValidation.ts (544 líneas)

### ✅ Fase 2: Core Sections
- BasicInfoSection.tsx (186 líneas)
- MaterialsSection.tsx (246 líneas)
- StaffSection.tsx (286 líneas)
- PricingSection.tsx (289 líneas)

### ✅ Fase 3: Conditional Sections
- BookingSection.tsx (265 líneas)
- ProductionSection.tsx (405 líneas)
- DigitalDeliverySection.tsx (559 líneas)
- RecurringConfigSection.tsx (406 líneas)

### ✅ Fase 4: Complex Sections
- AssetConfigSection.tsx (1,039 líneas)
- RentalTermsSection.tsx (664 líneas)

### ✅ Fase 5 - Integration (COMPLETADA)
- ProductFormWizard.tsx (416 líneas)
- ProductFormPage.tsx (157 líneas)
- productFormApi.ts (332 líneas)

**Total implementado**: ~7,000 líneas de código

---

## ⏳ LO QUE FALTA - TESTING (10%)

### 1. Unit Tests para Helper Functions (PRIORITARIO)

**Ubicación**: `src/pages/admin/supply-chain/products/__tests__/`

#### A. Tests para productCostCalculation.ts
**Archivo a crear**: `services/__tests__/productCostCalculation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  calculateMaterialsCost,
  calculateLaborCost,
  calculateProductionOverhead,
  calculateProfitMargin,
  suggestPrice,
  calculateDepreciationCost
} from '../productCostCalculation';

describe('productCostCalculation', () => {
  describe('calculateMaterialsCost', () => {
    it('should calculate total materials cost correctly', () => {
      const components = [
        { material_id: '1', quantity: 2, unit_cost: 5 },
        { material_id: '2', quantity: 3, unit_cost: 10 }
      ];

      expect(calculateMaterialsCost(components)).toBe(40);
    });

    it('should return 0 for empty components', () => {
      expect(calculateMaterialsCost([])).toBe(0);
    });

    it('should handle undefined unit_cost', () => {
      const components = [
        { material_id: '1', quantity: 2 }
      ];

      expect(calculateMaterialsCost(components)).toBe(0);
    });
  });

  describe('calculateLaborCost', () => {
    it('should calculate labor cost correctly', () => {
      const allocations = [
        { role_id: '1', count: 2, duration_minutes: 60, hourly_rate: 15 }
      ];

      expect(calculateLaborCost(allocations)).toBe(30);
    });
  });

  describe('calculateProductionOverhead', () => {
    it('should calculate overhead with fixed method', () => {
      const config = { method: 'fixed', fixed_overhead: 10 };
      expect(calculateProductionOverhead(config, 100)).toBe(10);
    });

    it('should calculate overhead with per_unit method', () => {
      const config = { method: 'per_unit', per_unit_overhead: 2 };
      expect(calculateProductionOverhead(config, 100, 5)).toBe(10);
    });

    it('should calculate overhead with time_based method', () => {
      const config = { method: 'time_based', overhead_per_minute: 0.5 };
      expect(calculateProductionOverhead(config, 30)).toBe(15);
    });
  });

  describe('calculateProfitMargin', () => {
    it('should calculate profit margin percentage correctly', () => {
      expect(calculateProfitMargin(100, 150)).toBe(50);
    });

    it('should return 0 when price equals cost', () => {
      expect(calculateProfitMargin(100, 100)).toBe(0);
    });
  });

  describe('suggestPrice', () => {
    it('should suggest price based on cost and margin', () => {
      expect(suggestPrice(100, 25)).toBe(125);
    });

    it('should round to 2 decimals', () => {
      expect(suggestPrice(100, 33.333)).toBe(133.33);
    });
  });

  describe('calculateDepreciationCost', () => {
    it('should calculate straight line depreciation', () => {
      const config = {
        method: 'straight_line',
        acquisition_cost: 12000,
        salvage_value: 2000,
        useful_life_months: 60
      };

      const result = calculateDepreciationCost(config);
      expect(result).toBeCloseTo(166.67, 2);
    });

    it('should return 0 for invalid config', () => {
      expect(calculateDepreciationCost(undefined)).toBe(0);
    });
  });
});
```

#### B. Tests para productFormValidation.ts
**Archivo a crear**: `services/__tests__/productFormValidation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { validateProduct, createValidationError } from '../productFormValidation';

describe('productFormValidation', () => {
  describe('validateProduct', () => {
    it('should validate basic info name is required', () => {
      const formData = {
        product_type: 'physical_product',
        basic_info: { name: '', active: true },
        pricing: { price: 10 }
      };

      const result = validateProduct(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('basic_info.name');
    });

    it('should validate pricing is positive', () => {
      const formData = {
        product_type: 'physical_product',
        basic_info: { name: 'Test', active: true },
        pricing: { price: -10 }
      };

      const result = validateProduct(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'pricing.price')).toBe(true);
    });

    it('should validate booking window days', () => {
      const formData = {
        product_type: 'service',
        basic_info: { name: 'Test', active: true },
        pricing: { price: 10 },
        booking: {
          requires_booking: true,
          booking_window_days: 10,
          max_advance_days: 5 // ERROR: menor que booking_window_days
        }
      };

      const result = validateProduct(formData);

      expect(result.isValid).toBe(false);
    });

    it('should pass validation for valid product', () => {
      const formData = {
        product_type: 'physical_product',
        basic_info: { name: 'Valid Product', active: true },
        pricing: { price: 19.99 }
      };

      const result = validateProduct(formData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('createValidationError', () => {
    it('should create error with correct structure', () => {
      const error = createValidationError(
        'basic_info.name',
        'Name is required',
        'error',
        'basic_info'
      );

      expect(error.field).toBe('basic_info.name');
      expect(error.message).toBe('Name is required');
      expect(error.severity).toBe('error');
      expect(error.section).toBe('basic_info');
    });
  });
});
```

#### C. Tests para conversiones de unidades
**Archivo a crear**: `components/sections/__tests__/unitConversions.test.ts`

```typescript
import { describe, it, expect } from 'vitest';

// Copiar las funciones de conversión de BookingSection
const minutesToHours = (minutes?: number): string => {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return hours.toString();
  return `${hours}.${(mins / 60).toFixed(2).substring(2)}`;
};

const hoursToMinutes = (hours: string): number | undefined => {
  const num = parseFloat(hours);
  if (isNaN(num)) return undefined;
  return Math.round(num * 60);
};

const minutesToDays = (minutes?: number): string => {
  if (!minutes) return '';
  return (minutes / (60 * 24)).toFixed(0);
};

const daysToMinutes = (days: string): number | undefined => {
  const num = parseFloat(days);
  if (isNaN(num)) return undefined;
  return Math.round(num * 60 * 24);
};

describe('Unit Conversions', () => {
  describe('minutesToHours', () => {
    it('should convert 60 minutes to 1 hour', () => {
      expect(minutesToHours(60)).toBe('1');
    });

    it('should convert 90 minutes to 1.5 hours', () => {
      expect(minutesToHours(90)).toBe('1.50');
    });

    it('should return empty string for undefined', () => {
      expect(minutesToHours(undefined)).toBe('');
    });
  });

  describe('hoursToMinutes', () => {
    it('should convert 1 hour to 60 minutes', () => {
      expect(hoursToMinutes('1')).toBe(60);
    });

    it('should convert 1.5 hours to 90 minutes', () => {
      expect(hoursToMinutes('1.5')).toBe(90);
    });

    it('should return undefined for invalid input', () => {
      expect(hoursToMinutes('invalid')).toBeUndefined();
    });
  });

  describe('minutesToDays', () => {
    it('should convert 1440 minutes to 1 day', () => {
      expect(minutesToDays(1440)).toBe('1');
    });

    it('should convert 2880 minutes to 2 days', () => {
      expect(minutesToDays(2880)).toBe('2');
    });
  });

  describe('daysToMinutes', () => {
    it('should convert 1 day to 1440 minutes', () => {
      expect(daysToMinutes('1')).toBe(1440);
    });

    it('should convert 7 days to 10080 minutes', () => {
      expect(daysToMinutes('7')).toBe(10080);
    });
  });
});
```

---

### 2. Integration Tests (OPCIONAL - Si hay tiempo)

**Archivo a crear**: `components/__tests__/ProductFormWizard.integration.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductFormWizard } from '../ProductFormWizard';

describe('ProductFormWizard Integration', () => {
  it('should navigate between sections', async () => {
    const onSubmit = vi.fn();

    render(<ProductFormWizard onSubmit={onSubmit} />);

    // Start at Basic Info
    expect(screen.getByText('Información Básica')).toBeInTheDocument();

    // Click Next
    const nextButton = screen.getByText('Siguiente →');
    fireEvent.click(nextButton);

    // Should move to next section
    await waitFor(() => {
      expect(screen.getByText('Precio')).toBeInTheDocument();
    });
  });

  it('should validate before advancing to next section', async () => {
    const onSubmit = vi.fn();

    render(<ProductFormWizard onSubmit={onSubmit} />);

    // Try to advance without filling required fields
    const nextButton = screen.getByText('Siguiente →');
    fireEvent.click(nextButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/errores de validación/i)).toBeInTheDocument();
    });

    // Should not advance
    expect(screen.getByText('Información Básica')).toBeInTheDocument();
  });
});
```

---

### 3. Configuración de Testing (SI NO EXISTE)

**Verificar si existe**: `vitest.config.ts` o `vite.config.ts` con configuración de tests

Si no existe, crear `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Y `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

---

## 📝 CHECKLIST DE TESTING

### Must Have (Mínimo para completar Fase 5):
- [ ] Unit tests para `calculateMaterialsCost`
- [ ] Unit tests para `calculateLaborCost`
- [ ] Unit tests para `calculateProductionOverhead`
- [ ] Unit tests para `calculateProfitMargin`
- [ ] Unit tests para `suggestPrice`
- [ ] Unit tests para `validateProduct` (básico)
- [ ] Unit tests para conversiones de unidades
- [ ] Ejecutar tests: `npm run test` (0 errores)

### Should Have (Deseable):
- [ ] Tests para `calculateDepreciationCost`
- [ ] Tests para todas las validaciones específicas
- [ ] Tests para helper functions de secciones individuales
- [ ] Integration test básico de ProductFormWizard

### Nice to Have (Opcional):
- [ ] E2E test con Playwright/Cypress
- [ ] Coverage report (>80%)
- [ ] Tests para productFormApi transformations

---

## 🔧 COMANDOS ÚTILES

### Ejecutar tests:
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test productCostCalculation.test.ts
```

### Verificar TypeScript:
```bash
npx tsc --noEmit
```

### Ver estructura de tests:
```bash
find src/pages/admin/supply-chain/products -name "*.test.*"
```

---

## 📊 PROGRESO ACTUAL

```
FASE 1: Foundation                    ✅ COMPLETADA (7 archivos)
FASE 2: Core Sections                 ✅ COMPLETADA (4 componentes)
FASE 3: Conditional Sections          ✅ COMPLETADA (4 componentes)
FASE 4: Complex Sections              ✅ COMPLETADA (2 componentes)
FASE 5: Integration                   ✅ COMPLETADA (3 archivos)
FASE 5: Testing                       ⏳ PENDIENTE (2-4 horas)
  ├─ Unit tests (calculations)        ⏳ PENDIENTE
  ├─ Unit tests (validations)         ⏳ PENDIENTE
  ├─ Unit tests (conversions)         ⏳ PENDIENTE
  └─ Integration tests                ⏳ OPCIONAL
```

**Progreso total**: **90%** (18/20 tareas)
**Estimado restante**: **2-4 horas** (solo unit tests esenciales)

---

## 🎯 OBJETIVO FINAL

Al completar los tests, el proyecto alcanzará el **100%** con:

- ✅ ~7,000 líneas de código funcional
- ✅ 10 secciones completas
- ✅ Wizard navigation completo
- ✅ API integration funcional
- ✅ **Unit tests** para funciones críticas ← FALTA ESTO
- ✅ 0 errores TypeScript
- ✅ 100% type-safe
- ✅ Ready for production

---

## 📚 DOCUMENTOS DE REFERENCIA

Para entender el código antes de escribir tests:

1. **PRODUCTS_FORM_IMPLEMENTATION_SUMMARY.md** - Overview completo
2. **PRODUCTS_FORM_PHASE5_COMPLETE.md** - Detalles de Integration
3. **services/productCostCalculation.ts** - Funciones a testear
4. **services/productFormValidation.ts** - Validaciones a testear

---

## ⚠️ NOTAS IMPORTANTES

1. **Prioridad**: Los unit tests son **esenciales** para completar el proyecto
2. **Scope mínimo**: Solo tests para funciones críticas (calculations, validations)
3. **Framework**: Usar Vitest (ya configurado en el proyecto)
4. **Coverage**: Apuntar a >70% para funciones críticas
5. **Time estimate**: 2-4 horas para tests esenciales

---

**Última actualización**: 2025-01-11
**Versión**: 1.0
**Status**: ⏳ **TESTING PENDIENTE** (90% completado)
