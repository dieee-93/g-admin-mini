# 🎯 PROMPT DE MIGRACIÓN: SISTEMA DE PRECISIÓN DECIMAL

## CONTEXTO INICIAL

Estamos ejecutando la **FASE 1 CRÍTICA** de la migración del sistema de precisión matemática en G-Admin Mini. Se identificaron 12 archivos críticos con aritmética nativa (float) que deben migrar a DecimalUtils para garantizar precisión financiera absoluta.

---

## 📋 PROMPT PARA NUEVA SESIÓN

```
Hola Claude,

Necesito que ejecutes la FASE 1 CRÍTICA de migración de precisión matemática en G-Admin Mini.

CONTEXTO:
- Proyecto: Sistema de gestión integral (restaurant, inventory, sales)
- Framework de precisión: DecimalUtils con 4 clones especializados (TaxDecimal, InventoryDecimal, FinancialDecimal, RecipeDecimal)
- Problema: 42% de archivos con cálculos usan aritmética nativa (float) en lugar de Decimal.js
- Riesgo: Pérdida de precisión en transacciones financieras (~$5,000/año en errores)

DOCUMENTACIÓN DISPONIBLE:
1. Auditoría completa: `PRECISION_AUDIT_COMPLETE_REPORT.md` (léelo primero)
2. Framework: `src/business-logic/shared/decimalUtils.ts`
3. Config: `src/config/decimal-config.ts`
4. Tests de referencia: `src/__tests__/stocklab-precision-tests.test.ts`

ARCHIVOS A REFACTORIZAR (PRIORIDAD CRÍTICA):

1. src/modules/sales/ecommerce/services/orderService.ts
   - Línea 78: subtotal: item.price * item.quantity
   - Cambio: Usar DecimalUtils.multiply() con dominio 'financial'

2. src/pages/admin/operations/sales/services/saleApi.ts
   - Línea 332: reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
   - Cambio: Usar DecimalUtils.add() y multiply() en reduce
   - CRÍTICO: Punto de entrada de TODO el flujo de ventas

3. src/pages/admin/supply-chain/products/services/productCostCalculation.ts
   - REFACTORIZAR COMPLETO (6 funciones)
   - Funciones: calculateMaterialsCost, calculateLaborCost, calculateProductionOverhead, calculateProfitMargin, calculateMarkup, suggestPrice
   - Cambio: Migrar a RecipeDecimal para producción, FinancialDecimal para pricing

4. src/pages/admin/supply-chain/products/components/sections/MaterialsSection.tsx
   - Líneas 86, 276: Cálculos en UI component
   - Cambio: Crear función en service layer, mover lógica

5. src/pages/admin/finance-billing/services/billingApi.ts
   - Líneas 467-477: Función getMRR() usa división nativa (amount / 3, amount / 12)
   - Cambio: Usar DecimalUtils.divide() con dominio 'financial'

PATRÓN DE REFACTORIZACIÓN:

✅ ANTES (Incorrecto):
```typescript
const subtotal = item.price * item.quantity;
const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
```

✅ DESPUÉS (Correcto):
```typescript
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

const subtotal = DecimalUtils.multiply(
  item.price.toString(),
  item.quantity.toString(),
  'financial'
).toNumber();

const totalDec = items.reduce((sumDec, item) => {
  const itemTotalDec = DecimalUtils.multiply(
    item.price.toString(),
    item.quantity.toString(),
    'financial'
  );
  return DecimalUtils.add(sumDec, itemTotalDec, 'financial');
}, DecimalUtils.fromValue(0, 'financial'));

const total = totalDec.toNumber();
```

REGLAS DE MIGRACIÓN:

1. SIEMPRE importar DecimalUtils y el dominio correspondiente
2. USAR el dominio correcto:
   - 'financial' para ventas, precios, márgenes
   - 'tax' para IVA, impuestos
   - 'inventory' para stock, cantidades de materiales
   - 'recipe' para recetas, costos de producción
3. CONVERTIR inputs con .toString() o fromValue()
4. NUNCA redondear en pasos intermedios (solo al final)
5. USAR banker's rounding: .toDecimalPlaces(2) o bankerRound()
6. VALIDAR con fromValueSafe() para datos de APIs
7. CONVERTIR a number solo al final con .toNumber()

CREAR TESTS:

Para cada archivo refactorizado, crear test de precision:
- Edge case: 0.1 + 0.2 = 0.3 (no 0.30000000000000004)
- Valores decimales: 2.5 × $45.67 = $114.18 (banker's round)
- Agregaciones: sum de múltiples items sin float errors
- División: $1299.99 / 12 = $108.33 (no $108.33249999...)

VALIDACIÓN:

Después de cada refactorización:
1. ✅ No quedan operadores nativos (+, -, *, /)
2. ✅ Imports de DecimalUtils presentes
3. ✅ Dominio correcto usado
4. ✅ Tests de precision pasan
5. ✅ Build exitoso sin errores de tipos

ORDEN DE EJECUCIÓN:

1. Lee PRECISION_AUDIT_COMPLETE_REPORT.md (sección 2 y 5)
2. Refactoriza orderService.ts (4 horas)
3. Refactoriza saleApi.ts (4 horas)
4. Refactoriza productCostCalculation.ts (12 horas)
5. Refactoriza MaterialsSection.tsx (6 horas)
6. Refactoriza billingApi.ts (3 horas)
7. Crea tests de precision (8 horas)
8. Valida build y tests

ARCHIVOS DE REFERENCIA (Implementación correcta):

✅ Modelo Finance: src/pages/admin/finance-fiscal/services/taxCalculationService.ts
✅ Modelo Inventario: src/business-logic/inventory/stockCalculation.ts
✅ Tests modelo: src/__tests__/stocklab-precision-tests.test.ts

PREGUNTAS PARA CLARIFICAR:

Si encuentras dudas:
- ¿Qué dominio usar? → Ver tabla en sección 1.2 del reporte
- ¿Cómo manejar null/undefined? → Usar fromValueSafe()
- ¿Cuándo redondear? → Solo al final con banker's rounding
- ¿Tests necesarios? → Sí, para cada función refactorizada

ENTREGABLES:

1. 5 archivos refactorizados con DecimalUtils
2. Suite de tests de precision para cada módulo
3. Build exitoso sin errores
4. Resumen de cambios con before/after code snippets

Comienza leyendo el reporte de auditoría y luego procede con orderService.ts.
Usa el patrón de los archivos de referencia y valida cada cambio con tests.

¿Listo para comenzar?
```

---

## 🚀 PROMPT ALTERNATIVO (MODO RÁPIDO)

Si quieres ir directo al código sin leer el reporte completo:

```
Claude, ejecuta migración de precisión FASE 1:

ARCHIVOS:
1. src/modules/sales/ecommerce/services/orderService.ts:78
2. src/pages/admin/operations/sales/services/saleApi.ts:332
3. src/pages/admin/supply-chain/products/services/productCostCalculation.ts (COMPLETO)
4. src/pages/admin/supply-chain/products/components/sections/MaterialsSection.tsx:86,276
5. src/pages/admin/finance-billing/services/billingApi.ts:467-477

PATRÓN:
- Reemplazar operadores nativos (* / + -) por DecimalUtils.multiply/divide/add/subtract
- Usar dominio 'financial' para ventas/pricing
- Usar dominio 'recipe' para costos de producción
- Crear tests de precision (0.1 + 0.2 = 0.3)
- Validar build

REFERENCIA:
- Ver: src/business-logic/shared/decimalUtils.ts (métodos)
- Modelo: src/pages/admin/finance-fiscal/services/taxCalculationService.ts (líneas 119-155)

Comienza con orderService.ts y muéstrame el código refactorizado.
```

---

## 📚 ARCHIVOS CLAVE PARA COPIAR EN NUEVA SESIÓN

Si Claude necesita contexto, pásale estos archivos:

### 1. Reporte de Auditoría
```
PRECISION_AUDIT_COMPLETE_REPORT.md
```

### 2. Framework de Precisión
```
src/business-logic/shared/decimalUtils.ts
src/config/decimal-config.ts
```

### 3. Ejemplos de Implementación Correcta
```
src/pages/admin/finance-fiscal/services/taxCalculationService.ts (líneas 119-155)
src/business-logic/inventory/stockCalculation.ts (líneas 89-102)
```

### 4. Tests de Referencia
```
src/__tests__/stocklab-precision-tests.test.ts
src/business-logic/shared/__test__/decimalUtils.test.ts
```

---

## 🎯 CHECKLIST DE INICIO DE SESIÓN

Cuando empieces la nueva sesión:

- [ ] Claude tiene acceso al workspace de G-Admin Mini
- [ ] Claude ha leído PRECISION_AUDIT_COMPLETE_REPORT.md
- [ ] Claude entiende el patrón de DecimalUtils
- [ ] Claude conoce los 4 dominios (tax, inventory, financial, recipe)
- [ ] Claude tiene la lista de 5 archivos a refactorizar
- [ ] Claude sabe que debe crear tests de precision
- [ ] Claude validará build después de cada cambio

---

## 💡 TIPS PARA CLAUDE

**Si Claude pregunta:**

❓ "¿Qué dominio uso para X?"
→ Financial = ventas/precios, Tax = impuestos, Inventory = stock, Recipe = producción

❓ "¿Debo redondear aquí?"
→ NO. Solo redondea al final con banker's rounding (.toDecimalPlaces(2))

❓ "¿Cómo manejo valores null?"
→ Usa DecimalUtils.fromValueSafe(value, domain, defaultValue)

❓ "¿Necesito tests?"
→ SÍ. Tests de edge cases (0.1+0.2=0.3) y valores decimales

❓ "¿Puedo usar Decimal.js directamente?"
→ NO. Siempre usa DecimalUtils para tener dominio y validación

---

## 🔄 PROMPT DE CONTINUACIÓN

Si la sesión se interrumpe, usa este prompt para reanudar:

```
Claude, continúa la migración de precisión FASE 1.

COMPLETADO:
- [Lista lo que ya terminaste]

PENDIENTE:
- [Lista lo que falta]

SIGUIENTE ARCHIVO:
- [Nombre del archivo]

Revisa el código anterior, valida que sigue el patrón de DecimalUtils,
y continúa con el siguiente archivo.
```

---

## 📊 MÉTRICA DE ÉXITO

Al finalizar FASE 1, debes tener:

✅ 5 archivos refactorizados
✅ 0 operadores nativos en esos archivos
✅ Tests de precision creados (>80% coverage)
✅ Build exitoso
✅ Reporte de cambios generado

**Tiempo estimado:** 37-40 horas
**Archivos impactados:** ~15 archivos (5 refactorizados + imports + tests)

---

## 🚨 ADVERTENCIAS

⚠️ **NO HACER:**
- NO usar operadores nativos (+, -, *, /)
- NO redondear en pasos intermedios
- NO usar Decimal.js sin DecimalUtils
- NO hacer cálculos en componentes UI
- NO hardcodear tax rates

✅ **SIEMPRE HACER:**
- Importar DecimalUtils
- Usar dominio correcto
- Validar inputs con fromValueSafe
- Crear tests de precision
- Aplicar banker's rounding al final

---

**¿Todo listo para empezar? ¡Copia el prompt principal y comienza! 🚀**
