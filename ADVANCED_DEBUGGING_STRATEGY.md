# 🔬 ESTRATEGIA AVANZADA DE DEBUGGING - LOOP INFINITO EN SALES

**Fecha**: 2025-01-28
**Contexto**: Después de 6+ horas documentadas + 2 sesiones previas sin éxito
**Basado en**: Investigación exhaustiva de técnicas avanzadas de debugging en React

---

## 🎯 FILOSOFÍA: CAMBIO DE ENFOQUE

### ❌ Lo que NO ha funcionado:
- Análisis manual "a simple vista"
- Fixes basados en hipótesis sin confirmación
- Herramientas individuales sin metodología sistemática

### ✅ Nuevo enfoque:
- **VERIFICACIÓN EMPÍRICA** antes de cualquier fix
- **BINARY SEARCH DEBUGGING** para aislar la causa exacta
- **MÚLTIPLES HERRAMIENTAS** en paralelo para triangular el problema
- **METODOLOGÍA CIENTÍFICA**: Hipótesis → Test → Medir → Confirmar

---

## 📊 PLAN MULTI-CAPA DE DEBUGGING

### CAPA 1: PREPARACIÓN DEL ENTORNO (15 min)

#### 1.1 Instalar why-did-you-render (SI NO ESTÁ)
```bash
pnpm add -D @welldone-software/why-did-you-render
```

**Setup en `src/wdyr.ts`**:
```typescript
import React from 'react';

if (import.meta.env.DEV) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: false, // Solo trackear componentes específicos
    trackHooks: true,
    trackExtraHooks: [[require('react'), 'useCallback'], [require('react'), 'useMemo']],
    logOnDifferentValues: true,
    collapseGroups: false // Ver detalles completos
  });
}
```

**Import en `main.tsx` ANTES de App**:
```typescript
import './wdyr'; // ANTES de todo
import App from './App';
```

#### 1.2 Marcar componentes sospechosos
En `SalesPage.tsx`, `NavigationContext.tsx`, `useSalesPage.ts`:
```typescript
// Al final del archivo
SalesPage.whyDidYouRender = true;
NavigationProvider.whyDidYouRender = true;
```

#### 1.3 Habilitar React DevTools Profiler correctamente
1. Abrir React DevTools
2. Click en ⚙️ Settings
3. Tab "Profiler"
4. ✅ **"Record why each component rendered while profiling"**
5. ✅ "Hide commits below X ms" → Desmarcar (queremos verlo TODO)

---

### CAPA 2: CAPTURA DE DATOS EMPÍRICOS (20 min)

#### 2.1 Test con React DevTools Profiler
```
1. Abrir página Sales en el navegador
2. Abrir React DevTools → Profiler tab
3. Click 🔴 Record
4. INMEDIATAMENTE después click ⏹️ Stop (después de 2-3 segundos)
5. Analizar Flamegraph:
   - ¿Qué componente tiene MÁS renders?
   - Click en ese componente
   - Ver panel derecho "Why did this render?"
   - Si dice "Hook(s) 5 changed" → Ir a Components tab
   - Buscar el componente → Ver hooks en panel derecho
   - Hook #5 es el culpable
```

**OBJETIVO**: Identificar EXACTAMENTE qué hook/state causa el re-render

#### 2.2 Test con why-did-you-render
```
1. Con wdyr.ts configurado
2. Recargar Sales page
3. Abrir consola
4. Buscar mensajes de why-did-you-render:
   [WDYR] SalesPage re-rendered because:
     - different objects that are equal by value: { ... }
     - hook 5: useCallback changed
```

**OBJETIVO**: Ver qué props/hooks cambian entre renders

#### 2.3 Test con Binary Search - Fase 1: Aislar el componente
**HIPÓTESIS**: El problema puede estar en NavigationContext O en useSalesPage

**Test A: Desconectar NavigationContext**
En `SalesPage.tsx`:
```typescript
// COMENTAR temporalmente:
// const { setQuickActions } = useNavigation();

// Y comentar el useEffect que usa setQuickActions:
/*
useEffect(() => {
  setQuickActions([...]);
}, [deps]);
*/
```

**Resultado esperado**:
- ✅ Si el loop DESAPARECE: El problema ES la interacción con NavigationContext
- ❌ Si el loop PERSISTE: El problema está DENTRO de useSalesPage

**Test B: Si el loop persiste, aislar hooks en useSalesPage**
Comentar progresivamente los useEffect (EXCEPTO el debug que ya eliminamos):
```typescript
// 1. Comentar TODOS los useEffect menos el primero
// 2. Ver si el loop desaparece
// 3. Descomentar de a UNO
// 4. Identificar cuál causa el loop
```

---

### CAPA 3: DEBUGGING ATÓMICO CON CHROME DEVTOOLS (30 min)

#### 3.1 Breakpoint Condicional en Render
En `useSalesPage.ts`, PRIMERA línea de la función:
```typescript
export const useSalesPage = () => {
  // AGREGAR AL INICIO:
  const renderCount = React.useRef(0);
  renderCount.current++;

  // ⚠️ BREAKPOINT CONDICIONAL AQUÍ ⚠️
  // Click derecho en línea → Add conditional breakpoint
  // Condición: renderCount.current > 10
  if (renderCount.current > 10) {
    debugger; // Se detendrá al 11° render
  }
```

**Cuando se detenga**:
1. Ver Call Stack en DevTools
2. Identificar QUÉ función llamó a este render
3. Ver Variables en Scope
4. ¿Qué cambió desde el último render?

#### 3.2 Logging Estratégico de Dependencias
En CADA `useCallback` y `useMemo` de `useSalesPage.ts`:
```typescript
const refreshSalesData = useCallback(async () => {
  // ... código
}, [dep1, dep2, dep3]);

// AGREGAR DESPUÉS:
React.useEffect(() => {
  console.log('🔥 refreshSalesData recreated because deps changed:', {
    dep1,
    dep2,
    dep3
  });
}, [refreshSalesData]);
```

Hacer esto para TODOS los useCallback que estén en las deps del useEffect de setQuickActions.

**OBJETIVO**: Ver EXACTAMENTE qué dep cambia y causa la recreación

#### 3.3 Verificar Estabilidad de setQuickActions
En `NavigationContext.tsx`, después del useState:
```typescript
const [quickActions, setQuickActions] = useState<QuickAction[]>([]);

// AGREGAR:
const setQuickActionsRef = React.useRef(setQuickActions);
React.useEffect(() => {
  if (setQuickActionsRef.current !== setQuickActions) {
    console.error('🚨 CRITICAL: setQuickActions reference CHANGED!', {
      old: setQuickActionsRef.current,
      new: setQuickActions,
      renderCount: document.body.dataset.renderCount
    });
    setQuickActionsRef.current = setQuickActions;
  }
});
```

**Si este log aparece**: Tenemos un bug RARO de React donde useState setter no es estable

---

### CAPA 4: TÉCNICAS NUCLEARES (SI TODO LO ANTERIOR FALLA)

#### 4.1 Crear un SalesPage Minimal Reproducible Example
Crear `SalesPage.minimal.tsx`:
```typescript
import { useNavigation } from '@/contexts/NavigationContext';

export const SalesPageMinimal = () => {
  const { setQuickActions } = useNavigation();

  React.useEffect(() => {
    console.log('Setting quick actions');
    setQuickActions([
      { id: '1', label: 'Test', icon: 'plus', action: () => {} }
    ]);
  }, [setQuickActions]);

  return <div>Minimal Sales Page</div>;
};
```

**Si este minimal page NO tiene loop**: El problema está en la complejidad de useSalesPage
**Si TIENE loop**: El problema está en NavigationContext

#### 4.2 Deep Comparison para deps complejas
Si las deps tienen objetos/arrays anidados:
```bash
pnpm add use-deep-compare-effect
```

```typescript
import { useDeepCompareEffect } from 'use-deep-compare-effect';

// Reemplazar useEffect por:
useDeepCompareEffect(() => {
  setQuickActions([...]);
}, [deps]); // Ahora usa deep comparison
```

#### 4.3 Análisis del Virtual DOM con React DevTools
1. Abrir React DevTools → Components
2. Click en ⚙️ → Settings → "Highlight updates when components render"
3. Volver a Sales page
4. Observar QUÉ partes de la UI flashean constantemente
5. Eso te dice qué componentes re-renderizan

---

## 🔍 CHECKLIST DE DEBUGGING SISTEMÁTICO

### Fase 1: Preparación
- [ ] why-did-you-render instalado y configurado
- [ ] React DevTools Profiler configurado correctamente
- [ ] Breakpoints condicionales listos
- [ ] Logging estratégico agregado

### Fase 2: Captura de Datos
- [ ] Profile de 3 segundos capturado
- [ ] Identificado componente con más renders
- [ ] Identificado hook específico que cambia (ej: "Hook 5")
- [ ] why-did-you-render muestra qué props/hooks cambian

### Fase 3: Binary Search
- [ ] Test A: NavigationContext desconectado → ¿Loop desaparece?
- [ ] Test B: useEffects comentados progresivamente
- [ ] Identificado el useEffect culpable

### Fase 4: Root Cause Analysis
- [ ] Breakpoint condicional alcanzado
- [ ] Call stack analizado
- [ ] Deps logging muestra qué cambió
- [ ] setQuickActions stability verificada

### Fase 5: Fix Verificado
- [ ] Fix aplicado basado en datos empíricos
- [ ] Profile de nuevo → ¿Renders normales?
- [ ] Console limpia sin logs infinitos
- [ ] Widgets cargan correctamente

---

## 📋 POSIBLES CAUSAS BASADAS EN INVESTIGACIÓN

### Causa 1: Shallow Comparison con Objetos (PROBABILIDAD: 40%)
```typescript
// PROBLEMA:
const config = { foo: 'bar' }; // Nuevo objeto en cada render
useEffect(() => {
  // ...
}, [config]); // Nueva referencia → Loop
```

**FIX**: Usar useMemo para el objeto
```typescript
const config = useMemo(() => ({ foo: 'bar' }), []);
```

### Causa 2: useCallback con Deps Inestables (PROBABILIDAD: 35%)
```typescript
// PROBLEMA:
const handleFoo = useCallback(() => {
  // usa `data`
}, [data]); // Si `data` cambia constantemente → Loop

// `data` viene de:
const data = someFunction(); // Nuevo objeto en cada render
```

**FIX**: Memoizar `data` o usar functional updates

### Causa 3: useState Setter NO Estable (PROBABILIDAD: 15%)
**Bug raro de React** donde setter cambia de referencia (ya vimos en GitHub Issues)

**FIX**: Wrap en useCallback
```typescript
const [state, setState] = useState();
const stableSetState = useCallback((value) => setState(value), []);
```

### Causa 4: Deep Object en Deps (PROBABILIDAD: 10%)
```typescript
// PROBLEMA:
useEffect(() => {
  // ...
}, [user]); // user es { name: 'foo', settings: { theme: 'dark' } }
// Shallow comparison falla si nested property cambió
```

**FIX**: Usar `use-deep-compare-effect`

---

## 🎯 ORDEN RECOMENDADO DE EJECUCIÓN

1. **[15 min]** CAPA 1: Setup de herramientas
2. **[10 min]** CAPA 2.1: React DevTools Profiler → Identificar componente
3. **[5 min]** CAPA 2.2: why-did-you-render → Ver qué cambió
4. **[10 min]** CAPA 2.3: Binary Search Test A → Aislar NavigationContext vs useSalesPage
5. **[15 min]** CAPA 3.2: Logging de deps → Ver exactamente qué dep cambia
6. **[10 min]** CAPA 3.3: Verificar estabilidad de setQuickActions
7. **[20 min]** CAPA 3.1: Breakpoint condicional → Call stack analysis
8. **SI TODO FALLA**: CAPA 4 (Técnicas nucleares)

---

## 💡 INSIGHTS DE LA INVESTIGACIÓN

### useState Setters DEBERÍAN Ser Estables
Según la documentación oficial de React:
> "The setState function is guaranteed to be stable and won't change on re-renders"

**PERO** hay GitHub issues documentando casos donde esto NO se cumple:
- Issue #28109: Infinite loop con useState y useEffect
- Issue #17688: useEffect y useState infinite loop inconsistencies

### Shallow Comparison Es El Villano Común
React usa `Object.is()` para comparar deps. Esto significa:
- Objetos/arrays nuevos → Siempre diferentes
- Funciones redefinidas → Siempre diferentes
- Nested objects → No detecta cambios internos

### Deep Comparison Es Una Solución Real
Para casos complejos, libraries como `use-deep-compare-effect` hacen deep equality check.

---

## 🔗 RECURSOS CONSULTADOS

1. **React DevTools Documentation** - "Record why each component rendered"
2. **@welldone-software/why-did-you-render** - GitHub repo y tutorial
3. **LogRocket Blog** - "Solve React useEffect Hook's infinite loop patterns"
4. **Stack Overflow** - Multiple threads sobre infinite loops difíciles
5. **GitHub Issues** - facebook/react issues sobre useState setters
6. **Binary Search Debugging** - nicole@web blog post
7. **Chrome DevTools Breakpoints** - developer.chrome.com

---

## 📝 NOTAS FINALES

- **NO hacer fixes basados en hipótesis** - Primero CAPTURAR DATOS
- **Usar múltiples herramientas** - Si una no muestra nada, otra sí
- **Binary search es tu amigo** - Comentar progresivamente hasta aislar
- **Los datos empíricos no mienten** - Confiar en el Profiler y logs, no en intuición

**Esta metodología debería revelar el problema en 1-2 horas máximo.**
