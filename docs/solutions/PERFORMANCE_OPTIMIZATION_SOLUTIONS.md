# Solución: Performance - Re-renders

Este documento detalla las soluciones para problemas de rendimiento relacionados con re-renders innecesarios detectados en el codebase (`9.1`, `9.2`, `9.3`, `7.1`).

---

## 1. Re-renders por Modal State en Global Store

### Código de referencia: 9.1

### Categoría de impacto
**ALTO** - Afecta la interactividad percibida y puede causar "lag" en la UI cuando se abren/cierran diálogos si el store es grande.

### Descripción del anti-pattern

Almacenar el estado de visibilidad (`isOpen`) de modales puramente de UI en un store global de Zustand junto con datos de negocio.

```typescript
// ❌ INCORRECTO: Store global mezclando datos y UI state
interface GlobalStore {
  products: Product[]; // Datos pesados
  isDeleteModalOpen: boolean; // UI state efímero
  toggleDeleteModal: () => void;
}

// Componente que solo muestra lista pero se suscribe al store
const ProductList = () => {
  const products = useStore(state => state.products);
  // Si isDeleteModalOpen cambia, este componente podría re-renderizarse 
  // si no usa selectores atómicos estrictos o si el selector retorna nuevo objeto.
  return ...
}
```

### Por qué es un problema

**Fuente 1: React Documentation - State placement**
> "If two components need to change their state together, move it up to their closest common parent. [...] Don't reach for a global store immediately."
- Fuente: React.dev
- URL: https://react.dev/learn/sharing-state-between-components

**Fuente 2: TkDodo (TanStack Maintainer) on State Management**
> "Server state (data) and Client state (UI ephemeral state like modals) have different lifecycles and should be separated. Mixing them causes unnecessary complexity and re-renders."
- Autor: Dominik Dorfmeister (TkDodo)
- URL: https://tkdodo.eu/blog/practical-react-query

### Solución recomendada

Mover el estado de visibilidad del modal al **estado local** del componente padre que orquesta la vista, o usar un store atómico dedicado *solo* para UI si el modal es realmente global (ej. un Global Error Dialog).

### Código correcto

```typescript
// ✅ CORRECTO: Estado local para UI efímera
import { useState } from 'react';

export const ProductPage = () => {
  // Estado local para controlar el modal
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  
  return (
    <>
      <ProductList onDeleteClick={() => setDeleteModalOpen(true)} />
      
      <DeleteProductModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
      />
    </>
  );
};
```

### Patrón de refactoring

#### Paso 1: Identificar estado efímero en Store
Buscar en stores de Zustand variables como `isModalOpen`, `showDialog`, `activeDrawer`.

#### Paso 2: Extraer a componente local
Eliminar esas propiedades del store y moverlas a `useState` en el componente contenedor.

#### Paso 3: Pasar handlers por props
En lugar de llamar a `store.openModal()` desde un hijo profundo, pasar `onOpen` como prop o usar composición.

---

## 2. Selectores que retornan nuevos objetos

### Código de referencia: 9.3

### Categoría de impacto
**CRÍTICO** - Anula completamente el beneficio de usar un gestor de estado externo, forzando re-renders en cada actualización del store, sin importar qué cambió.

### Descripción del anti-pattern

Usar selectores en Zustand (o Redux) que construyen y retornan un nuevo objeto o array en cada ejecución.

```typescript
// ❌ INCORRECTO
const { user, settings } = useStore(state => ({
  user: state.user,
  settings: state.settings
}));
// La función selector retorna un objeto literal nuevo { ... } cada vez.
// Zustand compara (oldState === newState) -> false -> RE-RENDER.
```

### Por qué es un problema

**Fuente 1: Zustand Documentation - Auto Generating Selectors**
> "If you want to pick multiple state-slices, [...] the selector will return a new object on every render. Strict equality checks will fail, causing re-renders."
- Fuente: Zustand Docs
- URL: https://zustand-demo.pmnd.rs/docs/guides/auto-generating-selectors

**Fuente 2: React.dev - Optimizing Performance**
> "React compares objects by reference, not by structure. { a: 1 } !== { a: 1 }."
- Fuente: React Documentation

### Solución recomendada

Usar `useShallow` (disponible en Zustand v4/v5) para comparación superficial de objetos, o seleccionar propiedades individualmente.

### Código correcto

#### Opción A: useShallow (Recomendada)
```typescript
// ✅ CORRECTO: Comparación superficial
import { useShallow } from 'zustand/react/shallow';

const { user, settings } = useStore(
  useShallow(state => ({
    user: state.user,
    settings: state.settings
  }))
);
```

#### Opción B: Selectores Atómicos
```typescript
// ✅ CORRECTO: Selectores individuales (primitivos o ref estables)
const user = useStore(state => state.user);
const settings = useStore(state => state.settings);
```

### Patrón de refactoring

#### Paso 1: Detectar selectores compuestos
Buscar usos de `useStore(state => ({ ... }))` o `useStore(state => [ ... ])`.

#### Paso 2: Aplicar useShallow
Envolver el selector con `useShallow`.
*Nota: En Zustand v5, `useShallow` se importa de `zustand/react/shallow`.*

---

## 3. Context Value sin Memoización

### Código de referencia: 7.1

### Categoría de impacto
**ALTO** - Provoca re-renders en cascada de todo el árbol de componentes bajo el Provider cada vez que el componente padre se renderiza.

### Descripción del anti-pattern

Pasar un objeto literal directamente a la prop `value` de un Context Provider.

```typescript
// ❌ INCORRECTO
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  // El objeto { theme, setTheme } se recrea en cada render de ThemeProvider
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Por qué es un problema

**Fuente 1: React.dev - Context Caveats**
> "Because context uses reference identity to determine when to re-render, there are some gotchas [...] providing a new object every time creates a new reference, causing all consumers to re-render."
- Fuente: React Documentation
- URL: https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions

### Solución recomendada

Envolver el objeto `value` en `useMemo` (o `useCallback` para funciones) para mantener la referencia estable a menos que las dependencias cambien.

### Código correcto

```typescript
// ✅ CORRECTO
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  const value = useMemo(() => ({
    theme, 
    setTheme
  }), [theme]); // Solo cambia si 'theme' cambia
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Patrón de refactoring

#### Paso 1: Localizar Providers
Buscar `<Context.Provider value={{` en el codebase.

#### Paso 2: Extraer value
Crear una constante `contextValue` usando `useMemo`.

#### Paso 3: Verificar dependencias
Asegurar que el array de dependencias de `useMemo` sea correcto (exhaustive-deps).

---

## 4. Inline Objects/Arrays en Props

### Código de referencia: 9.2

### Categoría de impacto
**MEDIO** - Rompe la optimización de `React.memo` en componentes hijos y causa Garbage Collection excesivo.

### Descripción del anti-pattern

Pasar arrays u objetos definidos "inline" en el JSX a componentes hijos.

```typescript
// ❌ INCORRECTO
const MyPage = () => {
  // Se crea un nuevo array [...] en CADA render
  return <DataTable columns={['Name', 'Age', 'Role']} data={...} />;
};
```

Si `DataTable` está envuelto en `React.memo`, este fallará porque `oldProps.columns !== newProps.columns` (referencias distintas).

### Solución recomendada

Extraer constantes fuera del componente o usar `useMemo` si los datos son derivados dinámicamente.

### Código correcto

```typescript
// ✅ CORRECTO: Constante estática fuera del componente
const COLUMNS = ['Name', 'Age', 'Role'];

const MyPage = () => {
  return <DataTable columns={COLUMNS} data={...} />;
};

// O si depende de props/estado:
const MyPage = ({ isAdmin }) => {
  const columns = useMemo(() => 
    isAdmin ? ['Name', 'Actions'] : ['Name'], 
  [isAdmin]);

  return <DataTable columns={columns} />
};
```

### Patrón de refactoring

#### Paso 1: Identificar objetos estáticos
Buscar props que reciben `{...}` o `[...]` literales.

#### Paso 2: Extraer
Si no dependen de props/estado -> Mover fuera del componente (`const X = ...`).
Si dependen de props/estado -> Envolver en `useMemo`.

---

## Validación General

Para validar estas optimizaciones:

- [ ] **React DevTools Profiler:** Grabar una sesión y verificar "Why did this render?". No debería decir "Parent props changed" para props que no han cambiado visualmente.
- [ ] **Highlight Updates:** Activar "Highlight updates when components render" en React DevTools y verificar que al abrir un modal, no parpadee toda la pantalla de fondo.
- [ ] **Wasted Renders:** Verificar que componentes caros (Tablas, Gráficos) no se rendericen si sus datos no cambiaron.

## Esfuerzo estimado

**MEDIO**
- Identificar los problemas es rápido (search regex).
- La corrección es mecánica y segura.
- Impacto en performance es inmediato y alto.

## Referencias adicionales

1. React Documentation: Optimizing Performance
   https://react.dev/learn/render-and-commit
2. Zustand: Performance Guide
   https://github.com/pmndrs/zustand/blob/main/docs/guides/prevent-rerenders-with-useshallow.md
3. Overreacted (Dan Abramov): Before You Memo
   https://overreacted.io/before-you-memo/
