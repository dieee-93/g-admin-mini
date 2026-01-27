# Soluciones: Precisión Matemática (DecimalUtils)

Este documento detalla las soluciones, patrones y estándares para resolver problemas de precisión matemática en el codebase, específicamente enfocándose en la categoría de **DecimalUtils**.

---

# Solución: Operadores nativos en cálculos financieros

## Código de referencia: 2.1

## Categoría de impacto
**CRÍTICO** - Causa errores de precisión en dinero, puede tener implicaciones legales y contables.

## Descripción del anti-pattern

El uso de operadores JavaScript nativos (`*`, `/`, `+`, `-`) para cálculos financieros causa errores de precisión debido a la representación binaria de números flotantes (IEEE 754).

```typescript
// ❌ INCORRECTO
const price = 19.99;
const quantity = 3;
const total = price * quantity; // 59.97000000000001
const withTax = total * 1.21;   // 72.5637 (debería ser 72.56)
```

## Por qué es un problema

**Fuente 1: IEEE 754 Floating Point Standard**
> "Binary floating-point arithmetic cannot accurately represent all decimal values. For financial calculations where exact decimal representation is required, fixed-point or decimal arithmetic should be used."
- Fuente: IEEE Standard for Floating-Point Arithmetic (IEEE 754-2008)
- URL: https://ieeexplore.ieee.org/document/4610935

**Fuente 2: Martin Fowler - Money Pattern**
> "Floating point numbers are not appropriate for monetary calculations due to rounding errors. Use either integer cents or a decimal type with fixed precision."
- Autor: Martin Fowler
- Fuente: Patterns of Enterprise Application Architecture
- URL: https://martinfowler.com/eaaCatalog/money.html

**Fuente 3: Stripe Engineering Blog**
> "At Stripe, we represent all monetary amounts as integers in the smallest currency unit (cents for USD). This eliminates floating point errors entirely."
- Autor: Stripe Engineering Team
- URL: https://stripe.com/docs/currencies#zero-decimal

**Fuente 4: Decimal.js Documentation**
> "JavaScript numbers are IEEE 754 floating point and therefore suffer from rounding errors. This makes them unsuitable for financial calculations."
- Fuente: Decimal.js Official Documentation
- URL: https://mikemcl.github.io/decimal.js/

## Solución recomendada

Usar la librería `DecimalUtils` existente en el proyecto, la cual envuelve `decimal.js` y provee métodos seguros y tipados para operaciones matemáticas. Para cálculos monetarios generales, usar el dominio `'financial'` (2 decimales).

### Código correcto

```typescript
// ✅ CORRECTO
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

const price = '19.99'; // Preferir strings para inicializar
const quantity = 3;

// Multiplicación segura
const total = DecimalUtils.multiply(price, quantity, 'financial'); // Decimal interno

// Obtener valor numérico final (redondeado correctamente)
const finalAmount = total.toNumber(); // 59.97
```

### Explicación

`DecimalUtils` maneja internamente instancias de `Decimal` y aplica reglas de redondeo consistentes (Banker's Rounding) según el dominio especificado. El dominio `'financial'` asegura 2 decimales de precisión, estándar para la mayoría de las monedas.

## Patrón de refactoring

### Paso 1: Identificar cálculos
Buscar usos de `*`, `/`, `+`, `-` donde las variables involucren precios, costos, o montos monetarios.

### Paso 2: Reemplazar con DecimalUtils
Sustituir el operador nativo por el método estático correspondiente de `DecimalUtils`.

```typescript
// ❌ ANTES
const margin = (revenue - cost) / revenue;

// ✅ DESPUÉS
const profit = DecimalUtils.subtract(revenue, cost, 'financial');
const margin = DecimalUtils.divide(profit, revenue, 'financial');
```

### Paso 3: Tipado
Asegurarse de que los inputs sean `string`, `number` o `Decimal` (el tipo `DecimalInput`). Preferir `string` para valores literales para evitar imprecisiones iniciales (ej: usar `'0.1'` en lugar de `0.1`).

## Casos edge a considerar

1. **División por cero**: `DecimalUtils.divide` lanzará un error si el divisor es cero. Usar `safeDivide` si se requiere manejo de errores silencioso o validación previa.
2. **Comparaciones**: No usar `===` o `==` con objetos Decimal. Usar `DecimalUtils.equals(a, b)` o convertir a number con `toNumber()` para la comparación final.

## Validación

- [ ] Tests unitarios pasando con casos de borde (decimales periódicos).
- [ ] No existen operadores nativos en el bloque de código refactorizado.
- [ ] `pnpm run lint` no reporta errores de precisión (si las reglas están configuradas).

## Esfuerzo estimado
**MEDIO** - Requiere revisión cuidadosa de la lógica de negocio, pero el reemplazo es mecánico.

## Referencias
1. IEEE 754 Standard
2. Martin Fowler's Money Pattern
3. Decimal.js Documentation

---

# Solución: Cálculo de impuestos con operadores nativos

## Código de referencia: 2.2

## Categoría de impacto
**CRÍTICO** - Errores en impuestos pueden llevar a sanciones fiscales y discrepancias en auditorías.

## Descripción del anti-pattern

Calcular impuestos usando porcentajes simples y operadores nativos, a menudo redondeando prematuramente o usando precisión incorrecta.

```typescript
// ❌ INCORRECTO
const subtotal = 100;
const taxRate = 0.21;
const tax = Number((subtotal * taxRate).toFixed(2)); // Puede tener errores de redondeo "half-up" vs "half-even"
```

## Por qué es un problema

Los cálculos de impuestos a menudo requieren más decimales de precisión intermedia (generalmente 4 o 6) antes del redondeo final a 2 decimales para el pago. Usar aritmética flotante estándar pierde esta precisión.

**Fuente 1: Oracle Financials Cloud Documentation**
> "Tax calculations often require greater precision than the currency precision... Intermediate calculations should be performed with at least 4 decimal places."
- Fuente: Oracle Financials
- URL: https://docs.oracle.com/en/cloud/saas/financials/index.html

## Solución recomendada

Usar `DecimalUtils` con el dominio `'tax'`. Este dominio está configurado para manejar 6 decimales de precisión, lo cual es ideal para cálculos intermedios de tasas impositivas complejas o prorrateos.

### Código correcto

```typescript
// ✅ CORRECTO
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

const subtotal = '100.00';
const taxRate = 21; // 21%

// Usar applyPercentage o multiply con dominio 'tax'
const taxAmount = DecimalUtils.applyPercentage(subtotal, taxRate, 'tax');

// El resultado mantiene alta precisión (6 decimales) hasta que se necesite mostrar o cobrar
console.log(taxAmount.toString()); // "21.000000"
console.log(taxAmount.toNumber()); // 21
```

### Explicación

El dominio `'tax'` en `DecimalUtils` utiliza una precisión de 6 decimales (`TaxDecimal`). Esto minimiza el error acumulativo cuando se suman múltiples líneas de impuestos o se realizan cálculos complejos de retenciones antes del redondeo final.

## Patrón de refactoring

### Paso 1: Identificar lógica de impuestos
Buscar palabras clave como `tax`, `vat`, `iva`, `rate` en cálculos.

### Paso 2: Aplicar dominio 'tax'
Usar `DecimalUtils` especificando `'tax'` como tercer argumento o usando métodos específicos como `applyPercentage`.

```typescript
// ❌ ANTES
const tax = amount * (taxRate / 100);

// ✅ DESPUÉS
const tax = DecimalUtils.applyPercentage(amount, taxRate, 'tax');
```

## Casos edge a considerar

1. **Tasas fraccionarias**: Impuestos como 10.5% o 2.5% se manejan correctamente sin errores de flotante.
2. **Redondeo final**: Recordar que aunque el cálculo interno es de 6 decimales, el valor a cobrar suele ser de 2. Usar `.toNumber()` o `.toFixed(2)` solo al final del proceso.

## Validación
- [ ] Verificar que los cálculos intermedios no se redondean a 2 decimales prematuramente.
- [ ] Comparar resultados con tablas de impuestos oficiales o ejemplos conocidos.

## Esfuerzo estimado
**BAJO** - Generalmente aislado en servicios de facturación o precios.

## Referencias
1. DecimalUtils Implementation (`src/business-logic/shared/decimalUtils.ts`)
2. Oracle Financials Standards

---

# Solución: Conversión temprana a Number

## Código de referencia: 2.5

## Categoría de impacto
**ALTO** - Anula los beneficios de usar una librería decimal si se convierte a número nativo antes de terminar todos los cálculos.

## Descripción del anti-pattern

Realizar una operación segura con `DecimalUtils` pero convertir inmediatamente el resultado a `number` para seguir operando con operadores nativos.

```typescript
// ❌ INCORRECTO
const price = DecimalUtils.fromValue('19.99').toNumber(); // Conversión temprana
const quantity = 3;
const total = price * quantity; // ❌ Vuelve a usar aritmética flotante insegura
```

## Por qué es un problema

La cadena es tan fuerte como su eslabón más débil. Al convertir a `number` en medio de una serie de cálculos, se reintroducen los errores de precisión de IEEE 754, haciendo inútil el uso previo de `DecimalUtils`.

**Fuente 1: Decimal.js Best Practices**
> "Ideally, you should keep your values as Decimals for as long as possible, only converting to a JavaScript number or string for input/output."
- Fuente: Decimal.js (implícito en su diseño de API encadenable)

## Solución recomendada

Mantener los valores encapsulados en objetos `Decimal` (a través de `DecimalUtils`) durante toda la cadena de cálculo. Solo convertir a `number` (para persistencia o UI) o `string` (para UI o APIs) en el último paso posible.

### Código correcto

```typescript
// ✅ CORRECTO
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// Paso 1: Obtener instancias Decimal
const priceDec = DecimalUtils.fromValue('19.99', 'financial');
const quantityDec = DecimalUtils.fromValue(3, 'inventory');

// Paso 2: Operar manteniendo el tipo Decimal
const totalDec = priceDec.times(quantityDec); // O DecimalUtils.multiply(...)

// Paso 3: Operaciones subsiguientes siguen en Decimal
const totalWithTaxDec = DecimalUtils.applyMarkup(totalDec, '21');

// Paso 4: Conversión SOLO al final
const finalValue = totalWithTaxDec.toNumber();
```

### Explicación
`DecimalUtils` devuelve instancias de `Decimal` (o sus subclases `FinancialDecimal`, etc.). Estas instancias tienen métodos como `.plus()`, `.times()`, etc., que permiten encadenar operaciones sin salir del contexto de alta precisión.

## Patrón de refactoring

### Paso 1: Trazar flujo de datos
Identificar dónde empieza y termina una operación financiera completa (ej: desde `item price` hasta `invoice total`).

### Paso 2: Extender uso de Decimal
Refactorizar funciones intermedias para que acepten `DecimalInput` y retornen `Decimal` en lugar de `number`.

```typescript
// ❌ ANTES
function calculateLineTotal(item: Item): number {
  return item.price * item.qty;
}

// ✅ DESPUÉS
function calculateLineTotal(item: Item): Decimal {
  return DecimalUtils.multiply(item.price, item.qty, 'financial');
}
```

### Paso 3: Conversión en bordes
Mover las llamadas a `.toNumber()` a la capa de presentación (React components) o a la capa de persistencia (llamadas a DB), dejando la capa de lógica de negocio (Services) operando puramente con Decimals.

## Casos edge a considerar

1. **Compatibilidad de librerías de terceros**: Si una librería de gráficas o UI requiere `number`, convertir justo antes de pasar el prop.
2. **Persistencia**: Si la DB espera `numeric` o `decimal`, pasar el valor como string o number según el driver lo requiera, pero asegurar que el driver maneje la precisión correctamente.

## Validación
- [ ] Revisar que no haya `.toNumber()` dentro de bucles de cálculo (reduce, map).
- [ ] Verificar que las funciones de servicio retornen tipos compatibles con `Decimal` o primitivos solo si es el resultado final.

## Esfuerzo estimado
**ALTO** - Puede requerir cambiar firmas de funciones y tipos en varias capas de la aplicación.

## Referencias
1. Refactoring to Patterns
2. Domain Driven Design (Value Objects)
