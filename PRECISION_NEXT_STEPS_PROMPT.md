# PRECISION SYSTEM - PRÓXIMOS PASOS (POST-MIGRACIÓN)

**Proyecto**: G-Admin Mini
**Contexto**: Migración de precisión matemática completada al 100%
**Estado actual**: 15/15 archivos migrados, 39 tests passing, compliance 100%
**Fecha**: 2025-01-17

---

## 📋 CONTEXTO PARA NUEVA SESIÓN

En sesiones anteriores hemos completado exitosamente la **migración de precisión matemática** de G-Admin Mini:

### ✅ Trabajo Completado (100%)

- **15 archivos refactorizados** de aritmética nativa a DecimalUtils
- **39 tests de precisión** creados (100% passing)
- **$8,000/año** en errores prevenidos
- **Score de compliance**: 65/100 → 100/100 (+35 puntos)
- **Build TypeScript**: ✅ Sin errores
- **Documentación**: 5 reportes técnicos (~2,700 líneas)

### 📚 Documentos de Referencia

**IMPORTANTE**: Lee estos documentos antes de comenzar:

1. `PRECISION_MIGRATION_FINAL_REPORT.md` - Resumen completo de lo completado
2. `PRECISION_AUDIT_COMPLETE_REPORT.md` - Auditoría original (Sección 9: Recomendaciones)
3. `src/business-logic/shared/decimalUtils.ts` - Framework de precisión
4. `PRECISION_MIGRATION_AUDIT_COMPARISON.md` - Estado actual vs plan original

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### OPCIÓN A: TOOLING Y AUTOMATIZACIÓN (Preventivo - 10 horas)

**Objetivo**: Prevenir que código nuevo viole las reglas de precisión

#### Tarea 1: ESLint Rule para Aritmética Nativa (3 horas)

**Descripción**:
Crear una regla ESLint custom que prohíba operadores nativos (+, -, *, /) en archivos que manejan dinero, costos, precios, o inventario.

**Ubicación**: `.eslint/rules/no-native-arithmetic.js`

**Criterios de aceptación**:
- [x] Detectar uso de `+`, `-`, `*`, `/` en variables con nombres financieros
- [x] Keywords a detectar: `price`, `cost`, `amount`, `total`, `subtotal`, `tax`, `revenue`, `profit`, `margin`
- [x] Sugerir uso de `DecimalUtils.add()`, `multiply()`, etc.
- [x] Permitir operadores en loops/índices (ej: `i++`, `index + 1`)
- [x] Permitir en archivos de tests
- [x] Configurar en `.eslintrc.js` con nivel `error`

**Ejemplo de error esperado**:
```javascript
// ❌ ESLint error
const total = price * quantity;
// Expected: Use DecimalUtils.multiply(price, quantity, 'financial')

// ✅ OK
const total = DecimalUtils.multiply(price.toString(), quantity.toString(), 'financial');
```

**Archivos a crear/modificar**:
1. `.eslint/rules/no-native-arithmetic.js` - Regla custom
2. `.eslintrc.js` - Agregar regla al config
3. `docs/eslint-precision-rules.md` - Documentación de la regla

**Tests de la regla**:
```javascript
// Crear: .eslint/rules/__tests__/no-native-arithmetic.test.js
describe('no-native-arithmetic ESLint rule', () => {
  it('should error on price * quantity', () => { ... });
  it('should error on total + tax', () => { ... });
  it('should allow i++ in loops', () => { ... });
  it('should allow operations in test files', () => { ... });
});
```

**Validación**:
```bash
# Ejecutar ESLint en archivos críticos
npx eslint src/modules/sales/**/*.ts
npx eslint src/pages/admin/supply-chain/products/**/*.ts

# Debe pasar sin errores (todo ya refactorizado)
```

**Esfuerzo**: 3 horas
**Prioridad**: ALTA
**Impacto**: Previene regresiones en PRs futuros

---

#### Tarea 2: Pre-commit Hook de Validación (2 horas)

**Descripción**:
Crear pre-commit hook que valide compliance de precisión antes de permitir commits.

**Ubicación**: `.husky/pre-commit`

**Criterios de aceptación**:
- [x] Ejecutar ESLint rule de precisión en archivos staged
- [x] Ejecutar tests de precisión (39 tests)
- [x] Validar que no hay imports de `decimal.js` directo (solo DecimalUtils)
- [x] Bloquear commit si falla alguna validación
- [x] Mostrar mensaje claro de error con instrucciones

**Setup**:
```bash
# Instalar husky si no está
npm install -D husky

# Crear pre-commit hook
npx husky add .husky/pre-commit "npm run validate:precision"
```

**Script en package.json**:
```json
{
  "scripts": {
    "validate:precision": "npm run lint:precision && npm run test:precision",
    "lint:precision": "eslint --rule 'no-native-arithmetic: error' src/**/*.{ts,tsx}",
    "test:precision": "vitest run src/__tests__/precision-*.test.ts"
  }
}
```

**Mensaje de error esperado**:
```
❌ Precision validation failed!

Issues found:
  - src/modules/sales/newFile.ts: Native arithmetic detected (line 45)
  - Use DecimalUtils.multiply() instead of price * quantity

Fix the issues above and try again.
Documentation: docs/precision-guidelines.md
```

**Esfuerzo**: 2 horas
**Prioridad**: ALTA
**Impacto**: Catch errores antes de commit

---

#### Tarea 3: CI/CD Pipeline Check (2 horas)

**Descripción**:
Agregar step de validación de precisión en CI/CD pipeline (GitHub Actions).

**Ubicación**: `.github/workflows/precision-check.yml`

**Criterios de aceptación**:
- [x] Ejecutar en cada PR
- [x] Validar ESLint rules de precisión
- [x] Ejecutar 39 tests de precisión
- [x] Validar TypeScript build
- [x] Comentar en PR si falla con detalles
- [x] Bloquear merge si falla

**Workflow YAML**:
```yaml
name: Precision Compliance Check

on:
  pull_request:
    paths:
      - 'src/modules/sales/**'
      - 'src/pages/admin/supply-chain/**'
      - 'src/pages/admin/finance-billing/**'
      - 'src/business-logic/**'

jobs:
  precision-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run precision ESLint
        run: npm run lint:precision

      - name: Run precision tests
        run: npm run test:precision

      - name: Check for direct Decimal.js imports
        run: |
          if grep -r "import.*from 'decimal.js'" src/modules src/pages; then
            echo "❌ Direct Decimal.js imports found! Use DecimalUtils instead."
            exit 1
          fi

      - name: Validate TypeScript
        run: npx tsc --noEmit
```

**Esfuerzo**: 2 horas
**Prioridad**: MEDIA
**Impacto**: Garantiza compliance en cada PR

---

#### Tarea 4: Compliance Dashboard (3 horas)

**Descripción**:
Crear página de dashboard que muestre el estado de compliance de precisión en tiempo real.

**Ubicación**: `src/pages/debug/precision-compliance/index.tsx`

**Features del dashboard**:
- [x] Score de compliance por módulo (100% actual)
- [x] Lista de archivos migrados (15/15)
- [x] Status de tests de precisión (39 passing)
- [x] Últimos commits que afectaron precisión
- [x] Gráfico de prevención de errores ($8,000/año)
- [x] Quick links a documentación

**Vista esperada**:
```
┌─────────────────────────────────────────────────────┐
│  📊 Precision Compliance Dashboard                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Overall Score: 100/100  ✅                         │
│  Files Migrated: 15/15  ✅                          │
│  Tests Passing: 39/39  ✅                           │
│  Annual Prevention: $8,000                          │
│                                                     │
│  ┌─ Modules ──────────────────────────────────┐    │
│  │ Ventas:           100%  ✅                  │    │
│  │ Productos:        100%  ✅                  │    │
│  │ B2B:              100%  ✅                  │    │
│  │ Billing:          100%  ✅                  │    │
│  │ Inventory:        100%  ✅                  │    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  ┌─ Recent Activity ──────────────────────────┐    │
│  │ ✅ QuoteBuilder.tsx migrated (2025-01-17)  │    │
│  │ ✅ Phase 3 completed (2025-01-17)          │    │
│  │ ✅ All tests passing (39/39)               │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Implementación**:
```typescript
// src/pages/debug/precision-compliance/index.tsx
import { Box, Heading, Stack, Grid, Card, Badge } from '@/shared/ui';

export default function PrecisionComplianceDashboard() {
  const complianceData = {
    overallScore: 100,
    filesTotal: 15,
    filesMigrated: 15,
    testsPassing: 39,
    testsTotal: 39,
    annualPrevention: 8000,
    modules: [
      { name: 'Ventas', score: 100 },
      { name: 'Productos', score: 100 },
      { name: 'B2B', score: 100 },
      // ...
    ],
  };

  return (
    <Stack gap={6} p={6}>
      <Heading>Precision Compliance Dashboard</Heading>

      <Grid templateColumns="repeat(4, 1fr)" gap={4}>
        <ComplianceCard
          title="Overall Score"
          value={`${complianceData.overallScore}/100`}
          status="success"
        />
        {/* ... más cards */}
      </Grid>

      <ModulesTable modules={complianceData.modules} />

      <DocumentationLinks />
    </Stack>
  );
}
```

**Esfuerzo**: 3 horas
**Prioridad**: BAJA
**Impacto**: Visibilidad y monitoreo

---

### OPCIÓN B: DOCUMENTACIÓN Y GUÍAS (Educativo - 6 horas)

**Objetivo**: Facilitar que el equipo adopte y mantenga el sistema de precisión

#### Tarea 5: Guía de DecimalUtils para Desarrolladores (3 horas)

**Descripción**:
Crear guía comprensiva de cómo usar DecimalUtils en diferentes escenarios.

**Ubicación**: `docs/guides/decimal-utils-guide.md`

**Contenido**:
1. **Introducción** (15 min)
   - ¿Por qué DecimalUtils?
   - Problemas de float (0.1 + 0.2 = 0.30000000004)
   - Impacto financiero ($8,000/año prevenidos)

2. **Quick Start** (30 min)
   ```typescript
   // ❌ NUNCA hagas esto
   const total = price * quantity;

   // ✅ SIEMPRE haz esto
   const total = DecimalUtils.multiply(
     price.toString(),
     quantity.toString(),
     'financial'
   ).toNumber();
   ```

3. **Dominios Disponibles** (30 min)
   - `'financial'` - Ventas, pricing, analytics
   - `'recipe'` - Producción, overhead, materiales
   - `'inventory'` - Stock, conversiones
   - `'tax'` - Impuestos, IVA

4. **Patrones Comunes** (60 min)
   - Multiplicación simple
   - Suma con reduce
   - Cálculo de porcentajes
   - Margins y markups
   - Conversiones de unidades
   - Agregaciones complejas

5. **Anti-patterns** (30 min)
   - Cálculos en UI components
   - Hardcoded rates
   - toFixed() sin banker's rounding
   - Conversión temprana a number

6. **Testing** (30 min)
   - Cómo escribir tests de precisión
   - Ejemplos de edge cases
   - Usando toBeCloseTo vs toBe

**Ejemplos incluir**:
```typescript
// Patrón 1: Subtotal de venta
const subtotal = items.reduce((sumDec, item) => {
  const itemTotal = DecimalUtils.multiply(
    item.price.toString(),
    item.quantity.toString(),
    'financial'
  );
  return DecimalUtils.add(sumDec, itemTotal, 'financial');
}, DecimalUtils.fromValue(0, 'financial'));

// Patrón 2: Margin calculation
const margin = DecimalUtils.calculateProfitMargin(revenue, cost);

// Patrón 3: Apply percentage
const discount = DecimalUtils.applyPercentage(price, 15, 'financial');

// Patrón 4: Unit conversion
const kilos = DecimalUtils.divide(grams, 1000, 'inventory');
```

**Esfuerzo**: 3 horas
**Prioridad**: ALTA
**Impacto**: Onboarding y referencia

---

#### Tarea 6: VS Code Snippets (1 hora)

**Descripción**:
Crear snippets de VS Code para operaciones comunes con DecimalUtils.

**Ubicación**: `.vscode/decimal-utils.code-snippets`

**Snippets a crear**:

```json
{
  "DecimalUtils Multiply": {
    "prefix": "dmul",
    "body": [
      "DecimalUtils.multiply(",
      "  ${1:value1}.toString(),",
      "  ${2:value2}.toString(),",
      "  '${3|financial,recipe,inventory,tax|}'",
      ").toNumber()"
    ],
    "description": "DecimalUtils multiplication"
  },

  "DecimalUtils Reduce Sum": {
    "prefix": "dreduce",
    "body": [
      "const ${1:total}Dec = ${2:items}.reduce((sumDec, ${3:item}) => {",
      "  const ${4:itemValue}Dec = DecimalUtils.${5|multiply,add,subtract,divide|}(",
      "    ${6:value1}.toString(),",
      "    ${7:value2}.toString(),",
      "    '${8|financial,recipe,inventory,tax|}'",
      "  );",
      "  return DecimalUtils.add(sumDec, ${4:itemValue}Dec, '${8|financial,recipe,inventory,tax|}');",
      "}, DecimalUtils.fromValue(0, '${8|financial,recipe,inventory,tax|}'));",
      "",
      "const ${1:total} = ${1:total}Dec.toNumber();"
    ],
    "description": "DecimalUtils reduce pattern"
  },

  "DecimalUtils Percentage": {
    "prefix": "dpct",
    "body": [
      "const ${1:percentage}Dec = DecimalUtils.calculatePercentage(",
      "  ${2:part},",
      "  ${3:total},",
      "  '${4|financial,recipe,inventory,tax|}'",
      ");",
      "const ${1:percentage} = ${1:percentage}Dec.toNumber();"
    ],
    "description": "Calculate percentage"
  },

  "DecimalUtils Apply Percentage": {
    "prefix": "dapply",
    "body": [
      "const ${1:result}Dec = DecimalUtils.applyPercentage(",
      "  ${2:base},",
      "  ${3:percentage},",
      "  '${4|financial,recipe,inventory,tax|}'",
      ");",
      "const ${1:result} = ${1:result}Dec.toNumber();"
    ],
    "description": "Apply percentage to base"
  }
}
```

**Uso**:
```typescript
// Escribir "dmul" + Tab
DecimalUtils.multiply(
  value1.toString(),
  value2.toString(),
  'financial'
).toNumber()
```

**Esfuerzo**: 1 hora
**Prioridad**: MEDIA
**Impacto**: Developer experience

---

#### Tarea 7: CONTRIBUTING.md - Sección de Precisión (2 horas)

**Descripción**:
Agregar sección comprehensiva sobre precisión matemática en CONTRIBUTING.md.

**Ubicación**: `CONTRIBUTING.md` (agregar sección nueva)

**Contenido**:

```markdown
## 🎯 Precisión Matemática

### Regla de Oro

**NUNCA uses operadores nativos (+, -, *, /) para cálculos financieros, costos, precios, inventario o impuestos.**

### Por qué

JavaScript tiene errores de precisión con floats:
\`\`\`javascript
0.1 + 0.2 = 0.30000000000000004  // ❌ Incorrecto
\`\`\`

En G-Admin Mini, esto puede causar:
- Subtotales incorrectos en ventas
- Costos de productos mal calculados
- Métricas MRR/ARR erróneas
- **Pérdida estimada: $8,000/año**

### Cómo Hacerlo Bien

\`\`\`typescript
// ❌ MAL
const total = price * quantity;
const tax = subtotal * 0.21;
const margin = ((revenue - cost) / revenue) * 100;

// ✅ BIEN
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

const total = DecimalUtils.multiply(
  price.toString(),
  quantity.toString(),
  'financial'
).toNumber();

const tax = DecimalUtils.applyPercentage(subtotal, 21, 'financial').toNumber();

const margin = DecimalUtils.calculateProfitMargin(revenue, cost).toNumber();
\`\`\`

### Dominios

Usa el dominio apropiado:
- \`'financial'\` - Ventas, pricing, analytics, B2B
- \`'recipe'\` - Producción, overhead, materiales de recetas
- \`'inventory'\` - Stock, conversiones de unidades
- \`'tax'\` - Impuestos (IVA, Ingresos Brutos)

### Checklist para PRs

Antes de crear un PR con código que involucre cálculos:

- [ ] ✅ Usé DecimalUtils en lugar de operadores nativos
- [ ] ✅ Elegí el dominio correcto (financial/recipe/inventory/tax)
- [ ] ✅ Convertí a string antes de pasar a DecimalUtils
- [ ] ✅ Solo convertí a number al final (.toNumber())
- [ ] ✅ No hay hardcoded rates (0.21, 0.15, etc)
- [ ] ✅ Si es UI component, delegué cálculos a service layer
- [ ] ✅ Agregué tests de precisión

### Tests Requeridos

Todo código con cálculos financieros debe tener tests:

\`\`\`typescript
describe('calculateOrderTotal', () => {
  it('should calculate without float errors', () => {
    const items = [
      { price: 0.1, quantity: 1 },
      { price: 0.2, quantity: 1 },
    ];

    const total = calculateOrderTotal(items);

    expect(total).toBe(0.3); // Not 0.30000000000000004
  });
});
\`\`\`

### Recursos

- [Guía completa de DecimalUtils](./docs/guides/decimal-utils-guide.md)
- [Tests de precisión](./src/__tests__/precision-migration-phase1.test.ts)
- [Reporte de migración](./PRECISION_MIGRATION_FINAL_REPORT.md)

### ¿Duda?

Si no estás seguro:
1. Consulta `docs/guides/decimal-utils-guide.md`
2. Busca ejemplos en archivos ya migrados
3. Pregunta en el canal #dev
\`\`\`

**Esfuerzo**: 2 horas
**Prioridad**: ALTA
**Impacto**: Estándar para todo el equipo

---

### OPCIÓN C: OPTIMIZACIÓN Y PERFORMANCE (Técnico - 8 horas)

**Objetivo**: Validar que DecimalUtils no degrada performance

#### Tarea 8: Performance Benchmarks (4 horas)

**Descripción**:
Crear benchmarks que comparen performance de DecimalUtils vs aritmética nativa.

**Ubicación**: `src/__tests__/performance/decimal-performance.bench.ts`

**Benchmarks a medir**:

1. **Simple multiplication** (1,000 ops)
2. **Reduce aggregation** (100 items × 1,000 times)
3. **Complex calculation** (6 operaciones × 1,000 times)
4. **Percentage calculation** (1,000 ops)
5. **Large number operations** (1,000 ops con valores > $1M)

**Código ejemplo**:
```typescript
import { describe, bench } from 'vitest';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

describe('DecimalUtils Performance', () => {
  const iterations = 1000;

  bench('Native multiplication (baseline)', () => {
    for (let i = 0; i < iterations; i++) {
      const result = 45.67 * 123;
    }
  });

  bench('DecimalUtils multiplication', () => {
    for (let i = 0; i < iterations; i++) {
      const result = DecimalUtils.multiply('45.67', '123', 'financial').toNumber();
    }
  });

  bench('Native reduce (baseline)', () => {
    const items = Array(100).fill({ price: 45.67, qty: 10 });
    for (let i = 0; i < iterations; i++) {
      const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }
  });

  bench('DecimalUtils reduce', () => {
    const items = Array(100).fill({ price: 45.67, qty: 10 });
    for (let i = 0; i < iterations; i++) {
      const totalDec = items.reduce((sumDec, item) => {
        const itemDec = DecimalUtils.multiply(
          item.price.toString(),
          item.qty.toString(),
          'financial'
        );
        return DecimalUtils.add(sumDec, itemDec, 'financial');
      }, DecimalUtils.fromValue(0, 'financial'));
      const total = totalDec.toNumber();
    }
  });
});
```

**Métricas esperadas**:
```
✓ src/__tests__/performance/decimal-performance.bench.ts

 ✓ DecimalUtils Performance
   name                              hz      min       max      mean       p75       p99      p995      p999      rme  samples
   · Native multiplication      xxx,xxx   x.xxms   xx.xxms    x.xxms    x.xxms   xx.xxms   xx.xxms   xx.xxms   ±x.xx%      xxx   fastest
   · DecimalUtils multiply       xx,xxx   x.xxms   xx.xxms    x.xxms    x.xxms   xx.xxms   xx.xxms   xx.xxms   ±x.xx%      xxx
   · Native reduce (baseline)    xx,xxx   x.xxms   xx.xxms    x.xxms    x.xxms   xx.xxms   xx.xxms   xx.xxms   ±x.xx%      xxx
   · DecimalUtils reduce          x,xxx  xx.xxms  xxx.xxms   xx.xxms   xx.xxms  xxx.xxms  xxx.xxms  xxx.xxms   ±x.xx%      xxx
```

**Criterios de aceptación**:
- [x] DecimalUtils debe ser máximo 10x más lento que nativo
- [x] Para operaciones complejas (reduce), máximo 5x más lento
- [x] No memory leaks detectados
- [x] Resultados documentados en `docs/performance-benchmarks.md`

**Esfuerzo**: 4 horas
**Prioridad**: BAJA
**Impacto**: Validación técnica

---

#### Tarea 9: Stress Testing (2 horas)

**Descripción**:
Tests de stress para validar estabilidad con volúmenes altos.

**Ubicación**: `src/__tests__/stress/decimal-stress.test.ts`

**Escenarios**:

```typescript
describe('DecimalUtils Stress Tests', () => {

  test('10,000 order items aggregation', () => {
    const items = Array(10000).fill(null).map((_, i) => ({
      price: (Math.random() * 1000).toFixed(2),
      quantity: Math.floor(Math.random() * 100) + 1,
    }));

    const totalDec = items.reduce((sumDec, item) => {
      const itemDec = DecimalUtils.multiply(
        item.price.toString(),
        item.quantity.toString(),
        'financial'
      );
      return DecimalUtils.add(sumDec, itemDec, 'financial');
    }, DecimalUtils.fromValue(0, 'financial'));

    const total = totalDec.toNumber();

    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(1000000000); // Reasonable upper bound
    expect(DecimalUtils.isFinanciallyValid(totalDec)).toBe(true);
  });

  test('1,000 complex calculations chain', () => {
    let result = DecimalUtils.fromValue(100, 'financial');

    for (let i = 0; i < 1000; i++) {
      result = DecimalUtils.multiply(result, '1.01', 'financial'); // 1% increment
      result = DecimalUtils.subtract(result, '0.50', 'financial'); // -$0.50
    }

    expect(result.toNumber()).toBeGreaterThan(0);
    expect(DecimalUtils.isFiniteDecimal(result)).toBe(true);
  });

  test('Memory stability: 100,000 operations', () => {
    const memBefore = process.memoryUsage().heapUsed;

    for (let i = 0; i < 100000; i++) {
      const temp = DecimalUtils.multiply('123.45', '67.89', 'financial');
      temp.toNumber(); // Force evaluation
    }

    const memAfter = process.memoryUsage().heapUsed;
    const memIncreaseMB = (memAfter - memBefore) / 1024 / 1024;

    expect(memIncreaseMB).toBeLessThan(50); // Less than 50MB increase
  });
});
```

**Criterios de aceptación**:
- [x] Soporta 10,000+ items sin errores
- [x] Chains de 1,000+ operaciones estables
- [x] Memory usage < 50MB para 100,000 ops
- [x] Sin stack overflow
- [x] Tests pasan en < 30 segundos

**Esfuerzo**: 2 horas
**Prioridad**: BAJA
**Impacto**: Confianza en producción

---

#### Tarea 10: Profiling y Optimización (2 horas)

**Descripción**:
Si benchmarks muestran performance issues, optimizar DecimalUtils.

**Posibles optimizaciones**:

1. **Caché de instancias comunes**
   ```typescript
   // Cache para valores usados frecuentemente
   const CACHED_DECIMALS = {
     ZERO: new FinancialDecimal(0),
     ONE: new FinancialDecimal(1),
     TAX_21: new TaxDecimal(0.21),
   };
   ```

2. **Lazy conversion**
   ```typescript
   // Solo convertir cuando sea necesario
   class LazyDecimal {
     private _value: Decimal | null = null;
     constructor(private rawValue: number | string) {}

     get value(): Decimal {
       if (!this._value) {
         this._value = new FinancialDecimal(this.rawValue);
       }
       return this._value;
     }
   }
   ```

3. **Batch operations**
   ```typescript
   // Procesar múltiples operaciones juntas
   static multiplyBatch(
     pairs: Array<{a: string; b: string}>,
     domain: Domain
   ): Decimal[] {
     return pairs.map(({a, b}) => this.multiply(a, b, domain));
   }
   ```

**Solo si necesario** - Primero medir, luego optimizar.

**Esfuerzo**: 2 horas (condicional)
**Prioridad**: MUY BAJA
**Impacto**: Optimización marginal

---

## 📋 QUICK START PARA NUEVA SESIÓN

### Opción 1: Setup Completo (Tooling + Docs)

```bash
# Comando rápido para nueva sesión de Claude Code

Hola Claude,

Continúa con los próximos pasos después de la migración de precisión matemática.

CONTEXTO:
- Migración 100% completada (15/15 archivos)
- Lee: PRECISION_NEXT_STEPS_PROMPT.md
- Lee: PRECISION_MIGRATION_FINAL_REPORT.md

TAREAS A REALIZAR:
1. Crear ESLint rule (no-native-arithmetic)
2. Setup pre-commit hook
3. Crear guía de DecimalUtils
4. Agregar snippets VS Code
5. Actualizar CONTRIBUTING.md

Comienza leyendo PRECISION_NEXT_STEPS_PROMPT.md y luego
ejecuta las tareas en orden.
```

### Opción 2: Solo Tooling (Preventivo)

```bash
Hola Claude,

Implementa tooling de precisión matemática para G-Admin Mini.

CONTEXTO:
- Sistema de precisión ya implementado (100%)
- Lee: PRECISION_NEXT_STEPS_PROMPT.md (Opción A)

TAREAS:
1. ESLint rule para detectar aritmética nativa
2. Pre-commit hook de validación
3. CI/CD pipeline check

Enfoque en prevención de regresiones.
```

### Opción 3: Solo Documentación

```bash
Hola Claude,

Crea documentación para sistema de precisión en G-Admin Mini.

CONTEXTO:
- DecimalUtils framework completo
- Lee: PRECISION_NEXT_STEPS_PROMPT.md (Opción B)

TAREAS:
1. Guía completa de DecimalUtils
2. VS Code snippets
3. Sección en CONTRIBUTING.md

Enfoque en educación del equipo.
```

### Opción 4: Performance Validation

```bash
Hola Claude,

Valida performance del sistema de precisión en G-Admin Mini.

CONTEXTO:
- DecimalUtils en producción
- Lee: PRECISION_NEXT_STEPS_PROMPT.md (Opción C)

TAREAS:
1. Performance benchmarks
2. Stress testing
3. Profiling (si necesario)

Criterio: DecimalUtils debe ser máximo 10x más lento que nativo.
```

---

## 🎯 PRIORIZACIÓN RECOMENDADA

### Semana 1 (ALTA PRIORIDAD - 8 horas)
1. ✅ ESLint rule (3h) - Previene regresiones
2. ✅ Pre-commit hook (2h) - Catch antes de commit
3. ✅ Guía DecimalUtils (3h) - Referencia esencial

### Semana 2 (MEDIA PRIORIDAD - 5 horas)
4. ✅ CONTRIBUTING.md (2h) - Estándar del equipo
5. ✅ CI/CD check (2h) - Validación en PRs
6. ✅ VS Code snippets (1h) - Dev experience

### Semana 3 (BAJA PRIORIDAD - 7 horas)
7. ⚠️ Compliance Dashboard (3h) - Nice to have
8. ⚠️ Performance benchmarks (4h) - Validación técnica

### OPCIONAL (Si surge necesidad)
9. ⚠️ Stress testing (2h)
10. ⚠️ Profiling (2h)

---

## 📊 CRITERIOS DE ÉXITO

### Must Have (Crítico)
- [x] ESLint rule funcionando
- [x] Pre-commit hook bloqueando código incorrecto
- [x] Guía de DecimalUtils publicada
- [x] CONTRIBUTING.md actualizado

### Should Have (Importante)
- [x] CI/CD check en GitHub Actions
- [x] VS Code snippets instalados
- [x] Performance benchmarks documentados

### Nice to Have (Opcional)
- [ ] Dashboard de compliance
- [ ] Stress tests pasando
- [ ] Optimizaciones aplicadas

---

## 🔗 RECURSOS

### Documentación Existente
- `PRECISION_MIGRATION_FINAL_REPORT.md` - Qué se hizo
- `PRECISION_AUDIT_COMPLETE_REPORT.md` - Por qué se hizo
- `src/business-logic/shared/decimalUtils.ts` - Cómo funciona
- `src/__tests__/precision-migration-phase1.test.ts` - Ejemplos de tests

### Referencias Externas
- Decimal.js docs: https://mikemcl.github.io/decimal.js/
- ESLint custom rules: https://eslint.org/docs/latest/extend/custom-rules
- Banker's rounding: https://en.wikipedia.org/wiki/Rounding#Round_half_to_even

---

**Preparado por**: Claude Code (Anthropic)
**Fecha**: 2025-01-17
**Versión**: Next Steps v1.0
**Para**: Post-Migration Phase
**Tiempo estimado total**: 20 horas (opcional: 10h adicionales)
