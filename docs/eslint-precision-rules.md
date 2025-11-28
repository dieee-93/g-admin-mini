# ESLint Precision Rules

## `precision/no-native-arithmetic`

### Descripción

Esta regla prohíbe el uso de operadores aritméticos nativos de JavaScript (`+`, `-`, `*`, `/`) en variables que manejan valores financieros, monetarios o de inventario.

### Razón

JavaScript tiene problemas de precisión con números de punto flotante:

```javascript
0.1 + 0.2 = 0.30000000000000004  // ❌ Incorrecto
```

Estos errores se acumulan en cálculos financieros y pueden causar:
- Subtotales incorrectos en ventas
- Costos de productos mal calculados
- Métricas MRR/ARR erróneas
- Fallos en auditorías fiscales
- **Pérdida estimada: $8,000/año**

### Configuración

La regla está configurada como `error` en `eslint.config.js`:

```javascript
rules: {
  'precision/no-native-arithmetic': 'error',
}
```

### Ejemplos

#### ❌ Incorrecto

```typescript
// Error: Multiplicación nativa con precio
const total = price * quantity;

// Error: Suma nativa con total
const grandTotal = total + tax;

// Error: Resta nativa con descuento
const finalPrice = price - discount;

// Error: División nativa con revenue
const margin = (revenue - cost) / revenue;

// Error: Compound assignment
totalCost += itemCost;

// Error: Con member expressions
const total = item.price * item.quantity;

// Error: En reduce
const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
```

#### ✅ Correcto

```typescript
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// ✅ Multiplicación con DecimalUtils
const total = DecimalUtils.multiply(
  price.toString(),
  quantity.toString(),
  'financial'
).toNumber();

// ✅ Suma con DecimalUtils
const grandTotal = DecimalUtils.add(
  total.toString(),
  tax.toString(),
  'financial'
).toNumber();

// ✅ Resta con DecimalUtils
const finalPrice = DecimalUtils.subtract(
  price.toString(),
  discount.toString(),
  'financial'
).toNumber();

// ✅ División con DecimalUtils
const margin = DecimalUtils.calculateProfitMargin(revenue, cost).toNumber();

// ✅ Reduce con DecimalUtils
const subtotalDec = items.reduce((sumDec, item) => {
  const itemDec = DecimalUtils.multiply(
    item.price.toString(),
    item.quantity.toString(),
    'financial'
  );
  return DecimalUtils.add(sumDec, itemDec, 'financial');
}, DecimalUtils.fromValue(0, 'financial'));

const subtotal = subtotalDec.toNumber();
```

### Excepciones

La regla **NO aplica** en los siguientes casos:

#### 1. Loop counters

```typescript
// ✅ Permitido
for (let i = 0; i < 10; i++) {}
const nextIndex = index + 1;
const prevIndex = idx - 1;
```

#### 2. Archivos de tests

```typescript
// ✅ Permitido en *.test.ts, *.spec.ts, __tests__/*
const total = price * quantity;  // OK en tests
```

#### 3. String concatenation

```typescript
// ✅ Permitido
const message = 'Total: ' + price;
```

### Keywords Financieros Detectados

La regla detecta las siguientes keywords (case-insensitive):

- **Precios**: `price`, `cost`, `amount`, `value`, `rate`
- **Totales**: `total`, `subtotal`, `gross`, `net`
- **Impuestos**: `tax`, `fee`, `charge`
- **Finanzas**: `revenue`, `profit`, `margin`, `discount`
- **Balances**: `balance`, `payment`, `refund`, `credit`, `debit`
- **Salarios**: `salary`, `wage`, `commission`, `bonus`, `tip`
- **Métricas**: `mrr`, `arr`, `ltv`, `arpu`, `earning`
- **Producción**: `overhead`, `markup`

### Dominios de DecimalUtils

Use el dominio apropiado según el contexto:

| Dominio | Precisión | Uso |
|---------|-----------|-----|
| `'financial'` | 2 decimales | Ventas, pricing, analytics, B2B |
| `'recipe'` | 3 decimales | Producción, overhead, materiales |
| `'inventory'` | 4 decimales | Stock, conversiones de unidades |
| `'tax'` | 6 decimales | Impuestos (IVA, Ingresos Brutos) |

### Mensajes de Error

#### Error con variable específica

```
Avoid using native arithmetic operator "*" with financial variable "price".
Use DecimalUtils.multiply() instead.
```

#### Error genérico

```
Avoid using native arithmetic operator "+" for potential financial calculation.
Use DecimalUtils instead.
```

### Testing de la Regla

Para ejecutar los tests de la regla:

```bash
# Ejecutar tests de la regla
node .eslint/rules/__tests__/no-native-arithmetic.test.js

# Ejecutar ESLint en archivos específicos
npx eslint src/modules/sales/**/*.ts
npx eslint src/pages/admin/supply-chain/products/**/*.ts
```

### Validación

Todos los archivos migrados deben pasar sin errores:

```bash
# Validar compliance
npm run lint:precision

# Resultado esperado:
# ✅ 0 errors
# ✅ All financial calculations use DecimalUtils
```

### Recursos

- [Guía completa de DecimalUtils](./guides/decimal-utils-guide.md)
- [Tests de precisión](../src/__tests__/precision-migration-phase1.test.ts)
- [Reporte de migración](../PRECISION_MIGRATION_FINAL_REPORT.md)

### Soporte

Si tienes dudas sobre cómo aplicar esta regla:

1. Consulta `docs/guides/decimal-utils-guide.md`
2. Busca ejemplos en archivos ya migrados
3. Revisa los tests en `src/__tests__/precision-*.test.ts`

---

**Última actualización**: 2025-01-17
**Estado**: Activa en producción
**Compliance**: 100% (15/15 archivos)
