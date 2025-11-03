# 🚀 Performance Optimization Plan - G-Mini

**Fecha**: 2025-01-28
**Basado en**: React DevTools Profiler Data
**Objetivo**: Reducir re-renders innecesarios y mejorar performance general

---

## 📊 ANÁLISIS DE PROFILING

### Componentes con Mayor Tiempo de Render

| Componente | Renders | Tiempo Total | Causa Principal |
|------------|---------|--------------|-----------------|
| `chakra(p)` | 78 | 32ms | CSS prop cambia 78 veces |
| `chakra(button)` | 44 | 30ms | CSS prop cambia 44 veces |
| `chakra(svg)` | 68 | 27ms | CSS prop cambia (ref, aria) |
| `Sidebar` | 1 | 17ms | UnnamedContext change |
| `Stack2` | 139 | 15ms | Props changes (align, gap, etc) |
| `AppointmentsCalendarView` | 1 | 13ms | Context changes |
| `Button2` | 44 | 12ms | onClick handlers |
| `Stack` | 107 | 11ms | Props changes |
| `Icon2` | 64 | 9ms | Props changes |
| `Typography` | 63 | 7ms | Props changes |

### Problemas Identificados

#### 🔴 **Problema #1: CSS Props Dinámicos en Chakra UI**
- **Componentes afectados**: `chakra(p)`, `chakra(button)`, `chakra(svg)`, `chakra(span)`
- **Causa**: Objetos CSS recreados en cada render
- **Impacto**: 78 renders solo para `chakra(p)`

```typescript
// ❌ MAL - Crea nuevo objeto CSS en cada render
<Text css={{ fontSize: '14px', color: 'gray.600' }}>

// ✅ BIEN - CSS estático o memoizado
const textStyles = useMemo(() => ({ fontSize: '14px', color: 'gray.600' }), []);
<Text css={textStyles}>
```

#### 🔴 **Problema #2: Callbacks No Memoizados**
- **Componentes afectados**: `chakra(button)`, `Button2`
- **Causa**: Handlers `onClick` recreados en cada render
- **Impacto**: 7 cambios de onClick → 44 renders de botones

```typescript
// ❌ MAL
<Button onClick={() => handleClick(id)}>

// ✅ BIEN
const handleClickMemo = useCallback(() => handleClick(id), [id]);
<Button onClick={handleClickMemo}>
```

#### 🔴 **Problema #3: UnnamedContext Excesivo**
- **Componentes afectados**: Múltiples (106 cambios)
- **Causa**: Context sin nombre cambiando frecuentemente
- **Impacto**: Cascada de re-renders en toda la app

**Acción requerida**: Identificar qué context es "UnnamedContext" y optimizarlo

#### 🔴 **Problema #4: Stack Components Excesivos**
- **Renders**: Stack2 (139), Stack (107)
- **Causa**: Props cambiando constantemente (align, gap, direction)
- **Impacto**: Componentes que podrían ser memoizados

#### 🔴 **Problema #5: Falta de Memoización**
- **Observación**: Muchos renders pero pocos cambios reales de props
- **Ejemplo**: `Typography` renderiza 63 veces con solo 3 cambios de variant/size
- **Solución**: React.memo() en componentes presentacionales

---

## 🎯 PLAN DE OPTIMIZACIÓN

### **Fase 1: Quick Wins (Alto Impacto, Bajo Esfuerzo)**

#### 1.1 Memoizar Callbacks en Componentes Críticos
**Archivos a revisar**:
- `src/pages/admin/operations/sales/page.tsx`
- Cualquier componente con botones que renderizan múltiples veces

**Patrón a aplicar**:
```typescript
// Antes
const handleSave = () => { /* ... */ };

// Después
const handleSave = useCallback(() => { /* ... */ }, [dependencies]);
```

**Impacto estimado**: -30% renders en botones

---

#### 1.2 Memoizar Objetos de Estilo CSS
**Archivos a revisar**:
- Buscar `css={{` en toda la app
- Especialmente en componentes de Chakra UI

**Patrón a aplicar**:
```typescript
// Antes
<Box css={{ p: 4, bg: 'white' }}>

// Después
const boxStyles = useMemo(() => ({ p: 4, bg: 'white' }), []);
<Box css={boxStyles}>
```

**Comando para encontrar ocurrencias**:
```bash
grep -r "css={{" src/
```

**Impacto estimado**: -50% renders en componentes Chakra

---

#### 1.3 Identificar y Optimizar "UnnamedContext"
**Investigación requerida**:
1. Revisar todos los Context.Provider en la app
2. Asegurar que todos tienen `displayName`
3. Verificar que el `value` está memoizado

**Archivos sospechosos**:
- `src/contexts/NavigationContext.tsx`
- `src/contexts/AuthContext.tsx`
- Cualquier otro context sin nombre

**Patrón a aplicar**:
```typescript
// Agregar displayName
const MyContext = createContext(null);
MyContext.displayName = 'MyContext';

// Memoizar value
const value = useMemo(() => ({
  // ...valores
}), [dependencies]);

<MyContext.Provider value={value}>
```

**Impacto estimado**: -70% cascadas de re-renders

---

### **Fase 2: Optimizaciones de Componentes (Impacto Medio)**

#### 2.1 Memoizar Componentes Presentacionales
**Candidatos prioritarios**:
- `Typography` (63 renders, pocos cambios)
- `Icon` / `Icon2` (64 renders)
- Componentes de UI wrapper (`@/shared/ui`)

**Patrón a aplicar**:
```typescript
// Antes
export const Typography = ({ variant, children, ...props }) => {
  return <Text {...props}>{children}</Text>;
};

// Después
export const Typography = React.memo(({ variant, children, ...props }) => {
  return <Text {...props}>{children}</Text>;
});
```

**Impacto estimado**: -40% renders en componentes UI

---

#### 2.2 Optimizar Stack Components
**Problema**: Stack2 (139 renders), Stack (107 renders)
**Causa**: Props como `align`, `gap`, `direction` cambiando

**Estrategias**:
1. Usar props estáticos cuando sea posible
2. Extraer configuraciones comunes a constantes
3. Aplicar React.memo() con custom compare function

```typescript
// Constantes para layouts comunes
const VERTICAL_STACK_PROPS = { direction: 'column', gap: 4, align: 'stretch' };
const HORIZONTAL_STACK_PROPS = { direction: 'row', gap: 2, align: 'center' };

// Uso
<Stack {...VERTICAL_STACK_PROPS}>
```

**Impacto estimado**: -50% renders en Stacks

---

#### 2.3 Revisar Tabs Context
**Componentes afectados**: `AppointmentsCalendarView`, `chakra(span)`
**Contextos**: TabsContext, TabsStylesContext, RenderStrategyContext

**Investigación**:
1. ¿Está el Tabs de Chakra UI optimizado?
2. ¿Podemos reducir re-renders con memoización?
3. ¿Hay alternativa más performante?

**Impacto estimado**: -30% renders en componentes de tabs

---

### **Fase 3: Optimizaciones Avanzadas (Alto Impacto, Alto Esfuerzo)**

#### 3.1 Code Splitting por Ruta
**Objetivo**: Reducir bundle inicial
**Implementación**: Ya existe en `src/lib/routing/createLazyComponents.ts`

**Verificar**:
- Todos los módulos usan lazy loading
- No hay imports directos de páginas pesadas

---

#### 3.2 Virtualización de Listas
**Candidatos**:
- Listado de productos en SalesPage
- Listado de materiales
- Cualquier lista con >50 items

**Biblioteca**: `@tanstack/react-virtual` o Chakra's VirtualizedList

**Impacto estimado**: -80% renders en listas largas

---

#### 3.3 Implementar Debouncing en Búsquedas
**Archivos a revisar**:
- Componentes con inputs de búsqueda
- Filtros en tiempo real

**Patrón**:
```typescript
const debouncedSearch = useDebouncedCallback(
  (value) => setSearchTerm(value),
  300
);
```

---

#### 3.4 Optimizar useEffect Hooks
**Problema**: El profiler menciona que hooks pueden estar ejecutándose frecuentemente

**Estrategia**:
1. Auditar todos los `useEffect` en componentes de alto render
2. Minimizar dependencias
3. Agregar cleanup functions donde sea necesario

**Comando para encontrar**:
```bash
grep -r "useEffect" src/ | wc -l
```

---

## 🔍 HERRAMIENTAS DE DIAGNÓSTICO

### Comando para Identificar "UnnamedContext"
```typescript
// Agregar en App.tsx temporalmente
React.Children.forEach(children, child => {
  if (child?.type?.Provider) {
    console.log('Context found:', child.type.displayName || 'UNNAMED');
  }
});
```

### Script para Encontrar CSS Props Dinámicos
```bash
# Encuentra todos los css={{ en el código
rg "css=\{\{" --type tsx --type ts -g '!node_modules'
```

### React DevTools Profiler Settings
- ✅ "Record why each component rendered"
- ✅ "Hide commits below X ms" → 0ms (ver todo)
- ✅ "Highlight updates"

---

## 📈 MÉTRICAS DE ÉXITO

### Antes de Optimizar
- **Total Render Time**: ~200ms (estimado de la suma)
- **Renders promedio por componente**: 50-100
- **Context changes (UnnamedContext)**: 106

### Después de Fase 1 (Objetivo)
- **Total Render Time**: <100ms (↓50%)
- **Renders promedio por componente**: 20-30 (↓60%)
- **Context changes (UnnamedContext)**: <10 (↓90%)

### Después de Fase 2 (Objetivo)
- **Total Render Time**: <50ms (↓75%)
- **Renders promedio por componente**: 10-15 (↓80%)

### Después de Fase 3 (Objetivo)
- **Total Render Time**: <30ms (↓85%)
- **First Contentful Paint**: <1s
- **Time to Interactive**: <2s

---

## 🚨 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Quick Wins
- [ ] Buscar todos los `onClick` sin `useCallback`
- [ ] Buscar todos los `css={{` y memoizarlos
- [ ] Agregar `displayName` a todos los contexts
- [ ] Verificar que context values estén memoizados
- [ ] Ejecutar profiler y comparar resultados

### Fase 2: Componentes
- [ ] Aplicar `React.memo()` a Typography, Icon, Icon2
- [ ] Extraer props comunes de Stack a constantes
- [ ] Revisar y optimizar Tabs Context
- [ ] Ejecutar profiler y comparar resultados

### Fase 3: Avanzadas
- [ ] Verificar code splitting en todas las rutas
- [ ] Implementar virtualización en listas largas
- [ ] Agregar debouncing en búsquedas
- [ ] Auditar y optimizar useEffect hooks
- [ ] Ejecutar profiler final y documentar mejoras

---

## 📝 NOTAS IMPORTANTES

### ⚠️ Precauciones
1. **No optimizar prematuramente**: Perfilar ANTES y DESPUÉS de cada cambio
2. **Testing exhaustivo**: Asegurar que la funcionalidad no se rompe
3. **Documentar cambios**: Cada optimización debe estar documentada
4. **Commits pequeños**: Un tipo de optimización por commit

### 🎓 Lecciones Aprendidas
1. **CSS props dinámicos** son costosos en Chakra UI
2. **Callbacks sin memoizar** causan re-renders en cadena
3. **Context sin nombre** es difícil de debuggear
4. **High render count ≠ problema** si props no cambian (hasta memoizar)

### 🔗 Referencias
- [React Profiler Docs](https://react.dev/reference/react/Profiler)
- [Kent C. Dodds - When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)
- [Chakra UI Performance](https://chakra-ui.com/docs/styled-system/performance)

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Identificar UnnamedContext** (más crítico)
2. **Memoizar callbacks en SalesPage** (quick win)
3. **Buscar y memoizar CSS props** (quick win)
4. **Re-perfilar y medir mejoras**
5. **Continuar con Fase 2 si es necesario**

---

**Última actualización**: 2025-01-28
**Responsable**: Claude Code
**Estado**: 📋 Plan Completo - Listo para Implementación
