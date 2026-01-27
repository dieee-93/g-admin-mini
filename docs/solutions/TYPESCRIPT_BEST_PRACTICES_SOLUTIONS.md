# Solución: TypeScript Best Practices & Anti-patterns

**Fecha:** 2025-12-17
**Categoría:** 🟡 PRIORIDAD ALTA
**Contexto:** Soluciones estandarizadas para problemas de tipado detectados en el codebase (Categoría 5 del Catálogo de Issues).

---

## 1. Uso de `any` en producción (8.1)

### Código de referencia: 8.1
Se refiere al uso explícito o implícito del tipo `any`, que desactiva efectivamente el chequeo de tipos de TypeScript para esa variable y sus propiedades.

### Categoría de impacto
**ALTO** - Elimina la seguridad de tipos, se propaga silenciosamente ("viralidad del `any`") y es la causa raíz de la mayoría de errores en tiempo de ejecución en aplicaciones TS.

### Descripción del anti-pattern

```typescript
// ❌ INCORRECTO: Uso de any para "salir del paso"
const handleResponse = (response: any) => {
  // TypeScript permite esto aunque no exista, causando crash en runtime
  console.log(response.data.payload.user.id.toUpperCase()); 
};

// ❌ INCORRECTO: Array de any
const users: any[] = [];
```

### Por qué es un problema

**Fuente 1: TypeScript Handbook**
> "The `any` type is a powerful way to work with existing JavaScript, allowing you to gradually opt-in and opt-out of type checking during migration. However, using `any` disables all type checking for that variable."
- Fuente: TypeScript Handbook - The `any` Type
- URL: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any

**Fuente 2: Matt Pocock (Total TypeScript)**
> "Using `any` is like turning off the lights in a room full of furniture. You might get across okay, but you're likely to stub your toe. Prefer `unknown` if you truly don't know the type, as it forces you to check before using."
- Autor: Matt Pocock

### Solución recomendada

La solución depende del contexto:
1. **Datos externos desconocidos:** Usar `unknown` + Zod/Type Guards.
2. **Funciones genéricas:** Usar Generics `<T>`.
3. **Librerías mal tipadas:** Usar `declare module` o tipos explícitos.

### Código correcto

#### Caso A: Datos desconocidos (API, JSON parse)
Usar `unknown` obliga a realizar una comprobación de tipo (Narrowing) antes de usar la variable.

```typescript
// ✅ CORRECTO: Uso de unknown y Type Guards
type User = { id: string; name: string };

const isUser = (input: unknown): input is User => {
  return typeof input === 'object' && input !== null && 'id' in input && 'name' in input;
};

const handleResponse = (response: unknown) => {
  if (isUser(response)) {
    // Aquí TypeScript sabe que response es User
    console.log(response.name.toUpperCase());
  } else {
    console.error("Invalid format");
  }
};
```

#### Caso B: Funciones reutilizables
En lugar de aceptar `any`, aceptar un Genérico.

```typescript
// ✅ CORRECTO: Generics
const wrapInArray = <T>(item: T): T[] => {
  return [item];
};
```

### Patrón de refactoring

1. **Localizar:** Buscar `: any` en el archivo.
2. **Analizar:** ¿Sé qué estructura tiene?
   - **SÍ:** Definir `interface`/`type` y reemplazar `any`.
   - **NO (pero lo descubriré en runtime):** Cambiar a `unknown` y agregar validación (Zod o `if`).
   - **NO (es dinámico):** Usar Generics.

---

## 2. Funciones sin tipo de retorno explícito (8.3)

### Código de referencia: 8.3
Funciones exportadas o complejas que confían puramente en la inferencia de TypeScript para su valor de retorno.

### Categoría de impacto
**MEDIO** - Riesgo de cambios accidentales en la API (API Contract Breakage) y lentitud en el compilador (TypeScript debe inferir cada vez).

### Descripción del anti-pattern

```typescript
// ❌ INCORRECTO: Retorno inferido
// Si mañana cambiamos user.id a number, rompemos a todos los consumidores
// sin que este archivo marque error.
export const useAuth = () => {
  return { 
    user: { id: "123", role: "admin" },
    login: () => {} 
  };
};
```

### Por qué es un problema

**Fuente 1: Total TypeScript (Best Practices)**
> "Implicit return types on exported functions are dangerous. They allow implementation details to leak into the API surface area. If you change the implementation, you might accidentally change the return type."

**Fuente 2: Google TypeScript Style Guide**
> "Explicit return types for functions and methods are required unless the function is an immediately-invoked function expression or a small lambda."

### Solución recomendada

Añadir anotaciones de tipo explícitas en todas las funciones exportadas y hooks personalizados. Esto actúa como un contrato: el código debe cumplir la firma, o fallará localmente.

### Código correcto

```typescript
// ✅ CORRECTO: Contrato explícito
interface AuthState {
  user: { id: string; role: string } | null;
  login: () => void;
}

export const useAuth = (): AuthState => {
  return { 
    user: { id: "123", role: "admin" }, // Si cambio id a number, aquí falla (bien).
    login: () => {} 
  };
};
```

### Patrón de refactoring

1. **Hover:** Poner el mouse sobre la función para ver qué tipo infiere TS.
2. **Extraer:** Copiar ese tipo y crear una `interface` o `type` nombrado (si es complejo) o usarlo inline (si es simple).
3. **Anotar:** Agregar `: Tipo` después de los paréntesis de argumentos.

---

## 3. Uso del tipo `Function` (8.5)

### Código de referencia: 8.5
Uso del tipo global `Function` (con F mayúscula) para tipar callbacks o referencias a funciones.

### Categoría de impacto
**MEDIO/ALTO** - `Function` es esencialmente un `any` para funciones. Acepta cualquier número de argumentos de cualquier tipo y retorna `any`.

### Descripción del anti-pattern

```typescript
// ❌ INCORRECTO
interface Props {
  onSuccess: Function; // Acepta onSucess(1, 2, 3) o onSuccess("hola")
}

const Component = ({ onSuccess }: Props) => {
  onSuccess(123, "random"); // No hay error, pero podría explotar
};
```

### Por qué es un problema

**Fuente 1: TypeScript ESLint (ban-types)**
> "The `Function` type accepts any function-like value. It provides no type safety when calling the function, which can lead to runtime errors."
- URL: https://typescript-eslint.io/rules/ban-types/

### Solución recomendada

Usar la sintaxis de función de flecha para definir explícitamente los argumentos y el retorno.

### Código correcto

```typescript
// ✅ CORRECTO
interface Props {
  // Callback sin argumentos
  onClose: () => void; 
  
  // Callback con argumentos tipados
  onData: (data: string) => boolean;
}
```

### Patrón de refactoring

1. **Identificar:** Buscar usos de `Function`.
2. **Contextualizar:** Ver cómo se llama a esa función en el código.
3. **Especificar:** 
   - Si no retorna nada útil: `() => void`
   - Si recibe parámetros: `(id: string) => void`
   - Si es un constructor genérico (raro): `new (...args: any[]) => any`

---

## 4. Interfaces vacías (8.4)

### Código de referencia: 8.4
Uso de `interface Name {}` que no tiene propiedades.

### Categoría de impacto
**BAJO/MEDIO** - Crea una falsa sensación de seguridad. En TypeScript (sistema de tipos estructural), una interfaz vacía `{}` coincide con **cualquier cosa** que no sea `null` o `undefined`.

### Descripción del anti-pattern

```typescript
// ❌ INCORRECTO
interface ComponentProps {}

const MyComponent = (props: ComponentProps) => { ... }

// Esto compila válidamente:
MyComponent({ cualquier: "cosa", extra: 123 }); 
// TypeScript permite exceso de propiedades si no es un literal directo en algunos contextos,
// o simplemente confunde al desarrollador pensando que "no acepta props".
```

### Por qué es un problema

**Fuente 1: TypeScript FAQ**
> "The empty type `{}` refers to an object that has no property constraints. It does NOT mean 'an empty object'."

### Solución recomendada

Si la intención es "objeto vacío" (sin propiedades), usar `Record<string, never>`. Si la intención es un placeholder, usar `type` o añadir comentario explícito si es temporal.

### Código correcto

```typescript
// ✅ CORRECTO: Objeto estrictamente vacío
type EmptyProps = Record<string, never>;

const MyComponent = (props: EmptyProps) => { ... }

// Error: Type '{ id: number }' is not assignable to type 'Record<string, never>'.
MyComponent({ id: 1 }); 
```

O simplemente no definir props si no se usan:

```typescript
// ✅ CORRECTO: Sin props
const MyComponent = () => { ... }
```

### Patrón de refactoring

1. **Revisar:** ¿La interfaz está vacía porque falta implementar o porque no debe tener datos?
2. **Acción:**
   - Si no debe recibir nada: Eliminar la interfaz y tipar componente como `FC` o sin argumentos.
   - Si debe ser un objeto vacío estricto: `type Name = Record<string, never>;`.

---

## Validación General

- [ ] `tsc --noEmit` no arroja errores nuevos.
- [ ] No quedan `any` explícitos en el módulo refactorizado (revisar con `grep "any"` o ESLint).
- [ ] Las funciones exportadas tienen `: ReturnType`.
- [ ] No hay uso de `Function` global.
- [ ] Los componentes no aceptan props extrañas silenciosamente.

## Esfuerzo estimado

**ALTO** (en volumen), **BAJO** (en complejidad por caso).
El reto es la cantidad de archivos a tocar, pero la lógica de corrección es mecánica y bien definida.

- **Por archivo:** 2-5 minutos.
- **Prioridad:** Atacar primero `any` en la capa de datos (servicios/API) ya que esos tipos fluyen hacia toda la UI.
