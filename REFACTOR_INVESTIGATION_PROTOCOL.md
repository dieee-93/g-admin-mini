# Protocolo de Investigación para Refactor de Stores

**Fecha**: 4 de diciembre de 2025  
**Contexto**: Refactor de 5 stores con produce() → spread operator

---

## 🎯 Compromiso de Calidad

**Antes de implementar cualquier solución desconocida:**

1. ✅ **Investigar documentación oficial** (Zustand docs, React docs)
2. ✅ **Buscar patrones validados por expertos** (TkDodo, Kent C. Dodds, etc.)
3. ✅ **Verificar con fuentes de la comunidad** (GitHub discussions, Stack Overflow)
4. ✅ **Documentar la fuente** en comentarios del código
5. ✅ **Explicar el "por qué"** de la solución elegida

**NUNCA voy a:**
- ❌ Inventar patrones sin validación
- ❌ Usar el primer código que encuentre sin verificar
- ❌ Aplicar soluciones sin entender el "por qué"
- ❌ Ignorar warnings o anti-patterns documentados

---

## 🔍 Escenarios que Requieren Investigación

### 1. Patrones Desconocidos en el Código Actual

**Ejemplo**: Encontrar un patrón que no vimos en suppliersStore

```typescript
// ¿Qué es esto? ¿Cómo se refactora correctamente?
set(produce((state) => {
  state.deeply.nested.object.property = value;
}));
```

**Protocolo**:
1. Buscar en Zustand docs: "nested state updates"
2. Buscar artículos: "zustand deep nested state immutable update"
3. Consultar TkDodo blog (si tiene artículo relacionado)
4. Verificar en GitHub issues de Zustand
5. Documentar patrón encontrado antes de implementar

---

### 2. Estructuras de Datos Complejas

**Casos identificados**:

#### A. Set en achievementsStore

```typescript
// ❓ ¿Cómo actualizar Set inmutablemente?
completedAchievements: Set<string>

// Investigar:
// - "javascript set immutable update"
// - "zustand set data structure"
// - "react state management set"
```

**Fuentes a consultar**:
1. MDN Web Docs - Set methods
2. Zustand FAQ sobre collections
3. Immer docs sobre Set/Map (para entender qué evitar)
4. React Beta Docs - "Updating Objects in State"

#### B. Map en achievementsStore

```typescript
// ❓ ¿Cómo actualizar Map inmutablemente?
capabilityProgress: Map<BusinessCapabilityId, CapabilityProgress>

// Investigar:
// - "javascript map immutable update"
// - "zustand map data structure"
// - "react map state update pattern"
```

**Fuentes a consultar**:
1. MDN Web Docs - Map methods
2. React patterns para Map updates
3. TypeScript + Map best practices

#### C. Nested Arrays en materialsStore

```typescript
// ❓ ¿Cómo actualizar arrays anidados?
items: MaterialItem[] // cada item tiene nested objects
  → packaging: { package_size, package_unit, ... }
  → supplier: { supplier_id, new_supplier?: {...} }
```

**Fuentes a consultar**:
1. React docs - "Updating Arrays in State"
2. Redux Toolkit patterns (immutable updates)
3. Immer patterns (para entender qué NO hacer sin middleware)

---

### 3. Performance Considerations

**Casos potenciales**:

```typescript
// ❓ ¿Este patrón es performante con 1000+ items?
set((state) => ({
  items: state.items.map(item => 
    item.id === id ? { ...item, ...updates } : item
  )
}));
```

**Investigar**:
1. "zustand performance large arrays"
2. "react state update performance map vs for loop"
3. TkDodo: "React Query Performance"
4. React docs: "Performance Optimizations"

**Fuentes de verdad**:
- React Profiler data
- react-scan metrics
- Chrome DevTools Performance tab

---

### 4. Persist Middleware con Estructuras Complejas

**Caso específico**: achievementsStore con Set/Map

```typescript
// ❓ ¿Persist middleware serializa Set/Map correctamente?
export const useAchievementsStore = create<AchievementsState>()(
  devtools(
    persist(
      (set, get) => ({
        completedAchievements: new Set<string>(), // ⚠️ ¿Se persiste?
        capabilityProgress: new Map(), // ⚠️ ¿Se persiste?
      }),
      { name: 'achievements-store' }
    )
  )
);
```

**Investigar**:
1. Zustand persist docs - "Serialization"
2. GitHub issues: "zustand persist set map"
3. Custom serializer patterns

**Posibles soluciones a validar**:
```typescript
// Opción 1: Custom serializer
{
  name: 'achievements-store',
  serialize: (state) => JSON.stringify({
    ...state,
    completedAchievements: Array.from(state.completedAchievements),
    capabilityProgress: Array.from(state.capabilityProgress.entries())
  }),
  deserialize: (str) => {
    const data = JSON.parse(str);
    return {
      ...data,
      completedAchievements: new Set(data.completedAchievements),
      capabilityProgress: new Map(data.capabilityProgress)
    };
  }
}

// Opción 2: Arrays en lugar de Set/Map (más simple)
// Investigar trade-offs
```

---

### 5. TypeScript Edge Cases

**Casos potenciales**:

```typescript
// ❓ ¿Cómo tipar correctamente el spread de tipos complejos?
updateItem: (id: string, updates: Partial<MaterialItem>) => {
  set((state) => ({
    items: state.items.map(item =>
      item.id === id 
        ? { ...item, ...updates } // ⚠️ Type narrowing issues?
        : item
    )
  }));
}
```

**Investigar**:
1. TypeScript Handbook - "Utility Types"
2. Zustand TypeScript guide
3. "typescript spread operator type inference"

---

## 📚 Fuentes Autorizadas (Orden de Prioridad)

### Nivel 1: Documentación Oficial
1. **Zustand Official Docs** (https://zustand.docs.pmnd.rs/)
   - Getting Started
   - Updating State
   - TypeScript Guide
   - Persisting Store Data
   
2. **React Official Docs** (https://react.dev/)
   - Managing State
   - Updating Objects/Arrays in State
   - Performance Optimizations
   
3. **TypeScript Handbook** (https://www.typescriptlang.org/docs/)
   - Everyday Types
   - Generics
   - Utility Types

### Nivel 2: Expertos Reconocidos
1. **TkDodo's Blog** (https://tkdodo.eu/blog/)
   - "Working with Zustand"
   - React Query patterns
   - State management best practices
   
2. **Kent C. Dodds** (https://kentcdodds.com/blog/)
   - React patterns
   - Testing strategies
   
3. **Dan Abramov** (https://overreacted.io/)
   - Redux patterns (aplicables a immutability)
   - React internals

### Nivel 3: Comunidad Validada
1. **GitHub Discussions** (Zustand repo)
   - Issues resueltos
   - Feature requests con soluciones
   
2. **Stack Overflow**
   - Solo respuestas con +50 upvotes
   - Verificar fecha (últimos 2 años)
   - Validar con docs oficiales
   
3. **Dev.to / Medium**
   - Solo autores con track record
   - Verificar técnicas con docs oficiales

### Nivel 4: Código de Referencia
1. **Zustand Examples** (GitHub repo oficial)
2. **Open Source Projects** usando Zustand
   - React Query DevTools (usa Zustand)
   - Jotai internals (similares)

---

## 🚨 Red Flags - Cuándo Investigar Más

### Señales de Alerta

1. **Patrón nunca visto en docs oficiales**
   - ❌ "Encontré este hack en un blog de 2020..."
   - ✅ Buscar solución oficial primero

2. **Solución muy compleja para problema simple**
   - ❌ "Necesito 50 líneas de código para actualizar un array..."
   - ✅ Probablemente hay forma más simple

3. **Performance sospechosa**
   - ❌ "Tarda 500ms en actualizar estado..."
   - ✅ Investigar patterns de performance

4. **TypeScript errors que no entiendo**
   - ❌ "Agregué @ts-ignore para que compile..."
   - ✅ Investigar el error específico

5. **Warnings en consola**
   - ❌ "Aparece warning pero funciona..."
   - ✅ Investigar causa del warning

---

## 📝 Plantilla de Investigación

Cuando encuentre algo desconocido, voy a:

### 1. Documentar el Problema
```markdown
## Patrón Desconocido: [Título]

**Ubicación**: `src/store/[store].ts` línea X
**Código actual**:
```typescript
// Código problemático
```

**Pregunta**: ¿Cómo refactorizar esto correctamente?
```

### 2. Investigación Estructurada
```markdown
### Fuentes Consultadas:

1. **Zustand Docs**: [URL] - [Hallazgo]
2. **React Docs**: [URL] - [Hallazgo]
3. **TkDodo Blog**: [URL] - [Hallazgo]
4. **GitHub Issue**: [URL] - [Solución validada]

### Patrones Encontrados:

#### Opción 1: [Nombre]
- **Fuente**: [Link]
- **Pros**: ...
- **Contras**: ...
- **Código**:
```typescript
// Ejemplo
```

#### Opción 2: [Nombre]
- **Fuente**: [Link]
- **Pros**: ...
- **Contras**: ...
```

### 3. Decisión y Justificación
```markdown
### Solución Elegida: Opción X

**Razón**: 
- Recomendada por Zustand docs ([link])
- Usada en proyectos oficiales ([link])
- Performance validada ([benchmark])
- TypeScript type-safe sin hacks

**Implementación**:
```typescript
// Código con comentarios explicativos
// ✅ Pattern from: [URL]
// Why: [Explicación breve]
```

---

## 🎯 Ejemplos de Investigación Previa

### Caso Real: produce() Bug

**Problema descubierto**:
```typescript
// ❌ SelectField no se actualiza
set(produce((state) => {
  state.suppliers.push(newSupplier);
}));
```

**Investigación realizada**:
1. ✅ Zustand Immer Middleware docs
2. ✅ Fetch webpage: Zustand middleware patterns
3. ✅ Análisis: produce() sin middleware rompe subscriptions

**Solución validada**:
```typescript
// ✅ Spread operator (official pattern)
set((state) => ({
  suppliers: [...state.suppliers, newSupplier]
}));
```

**Fuente**: Zustand Official Docs - "Updating State" section

---

## 📋 Checklist Pre-Implementación

Antes de escribir código para patrón desconocido:

- [ ] Busqué en Zustand official docs
- [ ] Busqué en React docs (si aplica)
- [ ] Consulté blog de TkDodo (si tiene artículo relacionado)
- [ ] Revisé GitHub issues/discussions
- [ ] Verifiqué en código de ejemplos oficiales
- [ ] Entiendo el "por qué" de la solución
- [ ] Puedo explicar trade-offs al usuario
- [ ] Documenté fuente en comentario del código
- [ ] Agregué test case si es patrón crítico

---

## 🔄 Proceso Durante el Refactor

### Por Cada Store:

1. **Leer código completo** (entender contexto)
2. **Identificar patrones conocidos** vs desconocidos
3. **Si encuentro algo nuevo**:
   ```
   → PAUSAR
   → INVESTIGAR según protocolo
   → DOCUMENTAR hallazgos
   → PREGUNTAR al usuario si tengo dudas
   → IMPLEMENTAR solo después de validar
   ```
4. **Documentar decisión** en código con comentario
5. **Testear exhaustivamente**

---

## 💬 Comunicación con el Usuario

### Cuando encuentre algo desconocido, voy a:

1. **Notificar inmediatamente**:
   ```
   "🔍 Encontré un patrón nuevo en [store]:
   [Código del patrón]
   
   Voy a investigar en:
   - Zustand docs
   - React patterns
   - TkDodo blog
   
   Te comparto los hallazgos antes de implementar."
   ```

2. **Presentar opciones**:
   ```
   "Encontré 3 soluciones validadas:
   
   Opción 1: [Patrón] - Recomendado por [Fuente]
   Pros: ...
   Contras: ...
   
   Opción 2: ...
   
   ¿Cuál prefieres? o ¿procedo con la opción 1?"
   ```

3. **Documentar aprendizaje**:
   ```
   "✅ Implementé [Solución]
   Fuente: [Link]
   Agregué comentario en código para futuras referencias."
   ```

---

## 🎓 Aprendizajes Continuos

### Registro de Patrones Nuevos Aprendidos

Voy a mantener este documento actualizado con:

1. **Patrones descubiertos** durante el refactor
2. **Fuentes consultadas** para cada caso
3. **Decisiones tomadas** y justificación
4. **Lecciones aprendidas** para futuros refactors

---

## ✅ Compromiso de Calidad

**Garantizo que**:

1. ✅ **Nunca inventaré patrones** sin validación
2. ✅ **Siempre citaré fuentes** en comentarios
3. ✅ **Preguntaré antes de implementar** soluciones dudosas
4. ✅ **Documentaré decisiones** para el equipo
5. ✅ **Priorizaré soluciones oficiales** sobre hacks

**Si encuentro algo que no entiendo completamente**:
- 🚫 NO voy a implementar sin investigar
- ✅ VOY a pausar y consultar fuentes autorizadas
- ✅ VOY a presentar opciones al usuario
- ✅ VOY a documentar el proceso de investigación

---

**Firma del protocolo**: GitHub Copilot (Claude Sonnet 4.5)  
**Fecha**: 4 de diciembre de 2025  
**Proyecto**: G-Mini v3.1 EventBus Enterprise Edition

---

Este protocolo se aplicará durante todo el refactor de los 5 stores:
- cashStore.ts
- assetsStore.ts
- paymentsStore.ts
- achievementsStore.ts
- materialsStore.ts
