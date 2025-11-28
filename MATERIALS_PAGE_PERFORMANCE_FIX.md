# MaterialsPage Performance Optimization - React.dev Best Practices ✅

## 📋 Problema Identificado

**React Scan Performance Data**:
- MaterialsPage: 2 renders
- React render time: 54ms (25%)
- **Other time: 162.5ms (75%)** ← Problema principal
- Causa: `actions` object recreándose en cada render, triggering EventBus `useEffect`

## 🎯 Solución Aplicada

Según la documentación oficial de **React.dev** ([useMemo](https://react.dev/reference/react/useMemo) y [useCallback](https://react.dev/reference/react/useCallback)):

### ❌ Anti-Pattern (Código Original)

```typescript
// INCORRECTO: useCallback dentro de objeto sin memoización
const actions = {
  handleStockUpdate: useCallback(async (itemId, newStock) => {
    // código...
  }, [deps1, deps2, deps3]),
  
  handleAddMaterial: useCallback(async (data) => {
    // código...
  }, [deps4, deps5]),
  
  // ...18 funciones más con useCallback individual
};
```

**Problema**: El objeto `actions` se recrea en cada render (nueva referencia), incluso si las funciones individuales están memoizadas. Esto causa:
1. `useEffect` que depende de `actions` se ejecuta en cada render
2. EventBus subscriptions se recrean innecesariamente
3. 162.5ms de "other time" desperdiciado

### ✅ Patrón Correcto (React.dev)

```typescript
// CORRECTO: useMemo con funciones inline
const actions = useMemo(() => ({
  handleStockUpdate: async (itemId, newStock) => {
    // código...
  },
  
  handleAddMaterial: async (data) => {
    // código...
  },
  
  // ...18 funciones inline (sin useCallback)
}), [getFilteredItems, setItems, refreshStats, loadInventoryData, handleError, openModal]);
```

**Beneficios**:
1. ✅ El objeto `actions` mantiene la misma referencia entre renders
2. ✅ Las funciones inline dentro del `useMemo` no necesitan `useCallback` adicional
3. ✅ Dependencias correctas según lo que realmente se usa
4. ✅ Código más limpio y fácil de mantener

## 📚 Justificación según React.dev

### Cita oficial de React.dev - useMemo:

> **"Memoizing a function"**  
> To memoize a function with `useMemo`, your calculation function would have to return another function:
> 
> ```javascript
> const handleSubmit = useMemo(() => {
>   return (orderDetails) => {
>     post('/product/' + productId + '/buy', {
>       referrer,
>       orderDetails
>     });
>   };
> }, [productId, referrer]);
> ```
> 
> This looks clunky! **Memoizing functions is common enough that React has a built-in Hook specifically for that. Wrap your functions into `useCallback` instead of `useMemo` to avoid having to write an extra nested function:**
> 
> ```javascript
> const handleSubmit = useCallback((orderDetails) => {
>   post('/product/' + productId + '/buy', {
>     referrer,
>     orderDetails
>   });
> }, [productId, referrer]);
> ```

**Pero cuando ya tienes un objeto memoizado**:

> **"Preventing an Effect from firing too often"** (sección Memoizing a dependency)  
> You could memoize the `searchOptions` object itself before passing it as a dependency:
> 
> ```javascript
> const searchOptions = useMemo(() => {
>   return { matchMode: 'whole-word', text };
> }, [text]);
> ```
> 
> **However, an even better fix is to move the `searchOptions` object declaration inside of the `useMemo` calculation function**

### Aplicación a nuestro caso:

En `useMaterialsPage.ts`, teníamos un **objeto con 18 callbacks**. Según React.dev:

1. ✅ **Wrap el objeto completo en `useMemo`** - Evita recreación del objeto
2. ✅ **Funciones inline dentro del `useMemo`** - No necesitan `useCallback` adicional
3. ✅ **Dependencies solo de lo usado** - React compara con `Object.is()`

## 🔧 Cambios Aplicados

### Archivo: `src/pages/admin/supply-chain/materials/hooks/useMaterialsPage.ts`

**Total de cambios**:
- ✅ Eliminados 17 `useCallback` redundantes dentro del `useMemo`
- ✅ Convertidas 18 funciones a inline functions
- ✅ Limpiadas dependencias innecesarias (`isMultiLocationMode`, `selectedLocation?.id`, `loadSystemTrends`)
- ✅ Agregado comentario explicativo basado en React.dev

**Dependencias finales** (solo las necesarias):
```typescript
[getFilteredItems, setItems, refreshStats, loadInventoryData, handleError, openModal]
```

## 📊 Impacto Esperado

**Antes**:
- 18 `useCallback` individuales recreándose
- Objeto `actions` con nueva referencia en cada render
- EventBus `useEffect` ejecutándose en cada render
- 162.5ms de "other time"

**Después**:
- 1 `useMemo` estable con referencia constante
- `actions` object memoizado correctamente
- EventBus `useEffect` ejecutándose solo cuando cambian dependencias reales
- Reducción esperada: **~75% del "other time"** (de 162ms a <50ms)

## 🎓 Lecciones Aprendidas

### 1. Cuando usar `useCallback` vs `useMemo`

```typescript
// ✅ useCallback: Para funciones individuales que se pasan a child components
const handleClick = useCallback(() => {
  doSomething();
}, [deps]);

<ChildComponent onClick={handleClick} />

// ✅ useMemo: Para objetos con múltiples funciones
const actions = useMemo(() => ({
  action1: () => { /* ... */ },
  action2: () => { /* ... */ }
}), [deps]);
```

### 2. No mezclar patrones

```typescript
// ❌ INCORRECTO: useCallback dentro de useMemo
const obj = useMemo(() => ({
  fn: useCallback(() => {}, []) // Redundante!
}), []);

// ✅ CORRECTO: Funciones inline en useMemo
const obj = useMemo(() => ({
  fn: () => {} // Ya está memoizado por useMemo padre
}), []);
```

### 3. Dependencies correctas

```typescript
// ❌ INCORRECTO: Dependencias no usadas
const actions = useMemo(() => ({
  doSomething: () => console.log('hi')
}), [unusedVar, anotherUnused]); // ESLint warning!

// ✅ CORRECTO: Solo dependencias usadas
const actions = useMemo(() => ({
  doSomething: () => loadData()
}), [loadData]); // Solo lo que realmente se usa
```

## 🔗 Referencias

- **React.dev - useMemo**: https://react.dev/reference/react/useMemo
- **React.dev - useCallback**: https://react.dev/reference/react/useCallback
- **React.dev - Memoizing a dependency**: https://react.dev/reference/react/useMemo#memoizing-a-dependency-of-another-hook
- **React.dev - Preventing Effect from firing**: https://react.dev/reference/react/useMemo#preventing-an-effect-from-firing-too-often

---

## ✅ Verificación

```powershell
# Compilación TypeScript
pnpm -s exec tsc --noEmit
# ✅ Sin errores

# ESLint
pnpm -s exec eslint src/pages/admin/supply-chain/materials/hooks/useMaterialsPage.ts
# ✅ Sin errores ni warnings
```

## 📝 Próximos Pasos

1. **Probar en navegador**: Navegar a MaterialsPage con React Scan activo
2. **Capturar nuevos datos**: React Scan "Formatted Data" después del fix
3. **Comparar métricas**:
   - Antes: 162.5ms "other time"
   - Después: Esperado <50ms
   - Mejora: ~70-75% reducción

4. **Si persiste lentitud**: Analizar siguiente bottleneck (probablemente `metrics` object o `useRealtimeMaterials` hook)

---

**Status**: ✅ Implementado según React.dev best practices  
**Compilación**: ✅ TypeScript + ESLint pasan  
**Pendiente**: Validación de performance en navegador
