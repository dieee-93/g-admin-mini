# Contributing to G-Admin Mini

¡Gracias por tu interés en contribuir a G-Admin Mini! Este documento proporciona guías y estándares para contribuir al proyecto.

---

## Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [Precisión Matemática](#-precisión-matemática)
3. [Guía de Estilo](#guía-de-estilo)
4. [Proceso de Desarrollo](#proceso-de-desarrollo)
5. [Pull Requests](#pull-requests)
6. [Reporte de Bugs](#reporte-de-bugs)

---

## Código de Conducta

Este proyecto adhiere a un código de conducta profesional y respetuoso. Se espera que todos los contribuidores:

- Sean respetuosos con otros colaboradores
- Acepten críticas constructivas
- Se enfoquen en lo mejor para la comunidad
- Muestren empatía hacia otros miembros de la comunidad

---

## 🎯 Precisión Matemática

### ⚠️ Regla de Oro

**NUNCA uses operadores nativos de JavaScript (+, -, *, /) para cálculos financieros, costos, precios, inventario o impuestos.**

### ¿Por qué?

JavaScript tiene errores de precisión con números de punto flotante:

```javascript
0.1 + 0.2 = 0.30000000000000004  // ❌ Incorrecto
0.3 - 0.1 = 0.19999999999999998  // ❌ Incorrecto
123.45 * 100 = 12344.999999999998 // ❌ Incorrecto
```

En G-Admin Mini, estos errores pueden causar:
- ❌ Subtotales incorrectos en ventas
- ❌ Costos de productos mal calculados
- ❌ Métricas MRR/ARR erróneas
- ❌ Discrepancias en reportes financieros
- ❌ Fallos en auditorías fiscales
- ❌ **Pérdida estimada: $8,000/año**

### ✅ Cómo Hacerlo Correctamente

Siempre usa `DecimalUtils` para cálculos financieros:

```typescript
// ❌ MAL - Operadores nativos
const total = price * quantity;
const tax = subtotal * 0.21;
const margin = ((revenue - cost) / revenue) * 100;
const discount = price - (price * 0.15);

// ✅ BIEN - DecimalUtils
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

const total = DecimalUtils.multiply(
  price.toString(),
  quantity.toString(),
  'financial'
).toNumber();

const tax = DecimalUtils.applyPercentage(
  subtotal.toString(),
  21,
  'financial'
).toNumber();

const margin = DecimalUtils.calculateProfitMargin(revenue, cost).toNumber();

const discount = DecimalUtils.applyPercentage(
  price.toString(),
  -15, // Negativo para descuento
  'financial'
).toNumber();
```

### Dominios Disponibles

Usa el dominio apropiado según el contexto:

| Dominio | Precisión | Uso |
|---------|-----------|-----|
| `'financial'` | 2 decimales | Ventas, pricing, analytics, B2B quotes |
| `'recipe'` | 3 decimales | Producción, overhead, materiales de recetas |
| `'inventory'` | 4 decimales | Stock, conversiones de unidades |
| `'tax'` | 6 decimales | Impuestos (IVA, Ingresos Brutos) |

**Ejemplo de uso**:

```typescript
// Ventas → 'financial'
const orderTotal = DecimalUtils.multiply(price, quantity, 'financial');

// Producción → 'recipe'
const materialCost = DecimalUtils.multiply(unitCost, amount, 'recipe');

// Conversión → 'inventory'
const kilos = DecimalUtils.divide(grams, 1000, 'inventory');

// Impuestos → 'tax'
const iva = DecimalUtils.applyPercentage(subtotal, 21, 'tax');
```

### Checklist para Pull Requests

Antes de crear un PR con código que involucre cálculos, verifica:

- [ ] ✅ Usé `DecimalUtils` en lugar de operadores nativos (+, -, *, /)
- [ ] ✅ Elegí el dominio correcto (`financial`/`recipe`/`inventory`/`tax`)
- [ ] ✅ Convertí valores a string antes de pasar a DecimalUtils: `.toString()`
- [ ] ✅ Solo convertí a `number` al final: `.toNumber()`
- [ ] ✅ No hay hardcoded rates (0.21, 0.15, etc.) - usar config
- [ ] ✅ Si es UI component, delegué cálculos a service layer
- [ ] ✅ Agregué tests de precisión para el nuevo código
- [ ] ✅ Ejecuté `pnpm run lint:precision` sin errores
- [ ] ✅ Ejecuté `pnpm run test:precision` y todos los tests pasan

### Tests Requeridos

Todo código con cálculos financieros **DEBE** tener tests de precisión:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateOrderTotal } from './orderService';

describe('calculateOrderTotal', () => {
  it('should calculate without float errors', () => {
    const items = [
      { price: 0.1, quantity: 1 },
      { price: 0.2, quantity: 1 },
    ];

    const total = calculateOrderTotal(items);

    // ✅ DEBE SER EXACTAMENTE 0.3, NO 0.30000000000000004
    expect(total).toBe(0.3);
  });

  it('should handle large quantities accurately', () => {
    const items = [
      { price: 45.67, quantity: 123 },
    ];

    const total = calculateOrderTotal(items);

    // ✅ Precisión hasta 2 decimales
    expect(total).toBe(5617.41);
  });

  it('should use banker\'s rounding correctly', () => {
    const items = [
      { price: 10.125, quantity: 1 }, // .125 → rounds to .12
      { price: 10.135, quantity: 1 }, // .135 → rounds to .14
    ];

    const total = calculateOrderTotal(items);

    expect(total).toBe(20.26); // 10.12 + 10.14
  });
});
```

### Patrones Comunes

#### 1. Subtotal de Orden

```typescript
function calculateOrderSubtotal(items: OrderItem[]): number {
  const subtotalDec = items.reduce((sumDec, item) => {
    const itemTotalDec = DecimalUtils.multiply(
      item.price.toString(),
      item.quantity.toString(),
      'financial'
    );
    return DecimalUtils.add(sumDec, itemTotalDec, 'financial');
  }, DecimalUtils.fromValue(0, 'financial'));

  return subtotalDec.toNumber();
}
```

#### 2. Margin Calculation

```typescript
function calculateProfitMargin(revenue: number, cost: number): number {
  const marginDec = DecimalUtils.calculateProfitMargin(revenue, cost);
  return marginDec.toNumber();
}
```

#### 3. Apply Discount

```typescript
function applyDiscount(price: number, discountPercent: number): number {
  const discountedDec = DecimalUtils.applyPercentage(
    price.toString(),
    -discountPercent, // Negativo para descuento
    'financial'
  );
  return discountedDec.toNumber();
}
```

### Anti-patterns a Evitar

#### ❌ Cálculos en UI Components

```typescript
// ❌ MAL
function ProductCard({ product }: Props) {
  const total = product.price * product.quantity; // ❌ Cálculo en UI
  return <div>Total: ${total}</div>;
}

// ✅ BIEN
function ProductCard({ product }: Props) {
  const total = ProductService.calculateLineTotal(product); // ✅ Delegar a service
  return <div>Total: ${total}</div>;
}
```

#### ❌ Hardcoded Tax Rates

```typescript
// ❌ MAL
const tax = subtotal * 0.21; // ❌ Hardcoded

// ✅ BIEN
const taxRate = useBusinessConfig().taxRate;
const tax = DecimalUtils.applyPercentage(subtotal, taxRate, 'tax').toNumber();
```

#### ❌ Conversión Temprana a Number

```typescript
// ❌ MAL
const item1 = DecimalUtils.multiply('10', '2', 'financial').toNumber();
const item2 = DecimalUtils.multiply('5', '3', 'financial').toNumber();
const total = item1 + item2; // ❌ Suma nativa

// ✅ BIEN
const item1Dec = DecimalUtils.multiply('10', '2', 'financial');
const item2Dec = DecimalUtils.multiply('5', '3', 'financial');
const totalDec = DecimalUtils.add(item1Dec, item2Dec, 'financial');
const total = totalDec.toNumber(); // ✅ Convertir solo al final
```

### Recursos

- 📖 [Guía Completa de DecimalUtils](./docs/guides/decimal-utils-guide.md)
- 🔍 [Reglas ESLint de Precisión](./docs/eslint-precision-rules.md)
- ✅ [Tests de Precisión](./src/__tests__/precision-migration-phase1.test.ts)
- 📊 [Reporte de Migración](./PRECISION_MIGRATION_FINAL_REPORT.md)
- 💻 [DecimalUtils Source Code](./src/business-logic/shared/decimalUtils.ts)

### VS Code Snippets

Para mayor productividad, usa los snippets de DecimalUtils:

- `dmul` - Multiplicación
- `dadd` - Suma
- `dsub` - Resta
- `ddiv` - División
- `dreduce` - Reduce pattern
- `dmargin` - Profit margin
- `dapply` - Apply percentage

Ver todos los snippets en `.vscode/decimal-utils.code-snippets`

### Validación Automática

El sistema valida automáticamente el uso correcto de DecimalUtils:

```bash
# Validar localmente antes de commit
pnpm run lint:precision

# Pre-commit hook valida automáticamente
git commit -m "feat: new feature"
# → Ejecuta lint:precision automáticamente
```

### ¿Tienes Dudas?

Si no estás seguro de cómo usar DecimalUtils:

1. ✅ Consulta [docs/guides/decimal-utils-guide.md](./docs/guides/decimal-utils-guide.md)
2. ✅ Busca ejemplos en archivos ya migrados (15 archivos)
3. ✅ Ejecuta `pnpm run test:precision` para ver ejemplos de tests
4. ✅ Revisa los snippets de VS Code: `.vscode/decimal-utils.code-snippets`
5. ✅ Pregunta en el canal #dev del equipo

---

## Guía de Estilo

### TypeScript

- Usa TypeScript estricto (`strict: true`)
- Define tipos explícitos para funciones públicas
- Evita `any` - usa `unknown` si el tipo es realmente desconocido
- Usa interfaces para objetos, types para unions/intersections

### Naming Conventions

- **Variables/Funciones**: `camelCase`
- **Interfaces/Types**: `PascalCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Archivos**: `kebab-case.ts` o `PascalCase.tsx` (componentes)

### Imports

Usa import absolutos con alias `@/`:

```typescript
// ✅ BIEN
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { ProductService } from '@/modules/products/services';

// ❌ MAL
import { DecimalUtils } from '../../../business-logic/shared/decimalUtils';
```

---

## Proceso de Desarrollo

### 1. Fork y Clone

```bash
git clone https://github.com/tu-usuario/g-mini.git
cd g-mini
pnpm install
```

### 2. Crear Branch

```bash
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-del-bug
```

### 3. Desarrollo

- Escribe código siguiendo las guías de estilo
- Usa `DecimalUtils` para cálculos financieros
- Agrega tests para nuevo código
- Ejecuta linter: `pnpm run lint`

### 4. Testing

```bash
# Tests unitarios
pnpm test

# Tests de precisión (REQUERIDO para código financiero)
pnpm run test:precision

# Lint
pnpm run lint

# Type check
pnpm run build
```

### 5. Commit

Usa mensajes de commit descriptivos:

```bash
git commit -m "feat: add discount calculation to QuoteBuilder"
git commit -m "fix: correct tax calculation in order total"
git commit -m "refactor: migrate ProductService to DecimalUtils"
git commit -m "test: add precision tests for billing module"
```

**Prefijos comunes**:
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `refactor:` - Refactorización sin cambio de funcionalidad
- `test:` - Agregar o modificar tests
- `docs:` - Documentación
- `chore:` - Mantenimiento (deps, configs, etc.)

---

## Pull Requests

### Antes de Crear un PR

- [ ] ✅ Todos los tests pasan (`pnpm test`)
- [ ] ✅ Lint sin errores (`pnpm run lint`)
- [ ] ✅ Tests de precisión pasan (`pnpm run test:precision`)
- [ ] ✅ Build TypeScript exitoso (`pnpm run build`)
- [ ] ✅ Código sigue las guías de estilo
- [ ] ✅ Checklist de precisión matemática completo (si aplica)

### Formato del PR

**Título**: `[Tipo] Descripción breve`

Ejemplo: `[Feature] Add discount management to B2B quotes`

**Descripción**:

```markdown
## Qué cambió

- Descripción de los cambios realizados
- Por qué se hicieron estos cambios

## Cómo probar

1. Paso 1
2. Paso 2
3. Resultado esperado

## Checklist

- [ ] Tests agregados/actualizados
- [ ] Documentación actualizada (si aplica)
- [ ] Precisión matemática validada (si aplica)
- [ ] Lint y tests pasan

## Screenshots (si aplica)

[Agregar screenshots de UI si es relevante]
```

---

## Reporte de Bugs

### Información Requerida

Al reportar un bug, incluye:

1. **Descripción**: ¿Qué está fallando?
2. **Pasos para reproducir**:
   - Paso 1
   - Paso 2
   - Resultado actual vs. resultado esperado
3. **Versión**: Branch o commit donde ocurre el bug
4. **Entorno**: Browser, OS, versión de Node, etc.
5. **Screenshots/Logs**: Si es posible

### Ejemplo

```markdown
**Descripción**: El subtotal de la orden muestra valores incorrectos

**Pasos para reproducir**:
1. Ir a módulo de ventas
2. Agregar producto con precio $0.10
3. Agregar producto con precio $0.20
4. Subtotal muestra $0.30000000000000004 en lugar de $0.30

**Versión**: main branch, commit abc123

**Entorno**: Chrome 120, Windows 11, Node 20.11.0

**Screenshot**: [adjuntar captura]

**Solución sugerida**: Usar DecimalUtils.add() en lugar de operador +
```

---

## Preguntas Frecuentes

### ¿Cómo configuro mi entorno de desarrollo?

```bash
# Instalar dependencias
pnpm install

# Copiar .env de ejemplo
cp .env.example .env

# Configurar variables de entorno
# Editar .env con tus credenciales

# Ejecutar en desarrollo
pnpm dev
```

### ¿Cómo ejecuto tests?

```bash
# Todos los tests
pnpm test

# Tests específicos
pnpm test src/modules/sales

# Tests de precisión (REQUERIDO para código financiero)
pnpm run test:precision

# Tests con coverage
pnpm run test:coverage
```

### ¿Dónde encuentro documentación técnica?

- [Guía de DecimalUtils](./docs/guides/decimal-utils-guide.md)
- [Reglas ESLint](./docs/eslint-precision-rules.md)
- [Reporte de Migración](./PRECISION_MIGRATION_FINAL_REPORT.md)
- [Arquitectura](./docs/architecture/) (si existe)

---

## Agradecimientos

¡Gracias por contribuir a G-Admin Mini! Tu ayuda hace que este proyecto sea mejor para todos.

Si tienes preguntas, no dudes en:
- Abrir un issue en GitHub
- Preguntar en el canal #dev
- Contactar al equipo de desarrollo

---

**Última actualización**: 2025-01-17
**Versión**: 1.0
**Estado**: ✅ Active
