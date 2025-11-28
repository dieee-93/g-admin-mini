# 🏗️ DECISIÓN DE ARQUITECTURA: VALIDACIÓN DE REQUIREMENTS

**Fecha:** 2025-01-16
**Decisión:** Estrategia para validar requirements con datos de API sin store

---

## 📊 INVESTIGACIÓN REALIZADA

### Fuentes consultadas (2025):
1. "State Management in 2025: When to Use Context, Redux, Zustand, or Jotai" - DEV Community
2. "Redux vs TanStack Query & Zustand: The 2025 Verdict" - Bugra Gulculer
3. "Zustand fetch with API call useEffect best practice" - Stack Overflow
4. "Lazy loading vs. Eager loading - LogRocket Blog"

---

## 🎯 HALLAZGOS CLAVE

### Separación de Concerns (Consenso 2025)

**El 80% de state management se elimina eligiendo la herramienta correcta:**

| Tipo de State | Herramienta Recomendada | Razón |
|---------------|------------------------|-------|
| **Server State** (API data) | TanStack Query / SWR | Caching, revalidation, background sync |
| **Client State** (UI state) | Zustand | Performance, persistence, scalabilidad |
| **Global Config** | Context API | Simple, pocas actualizaciones |

### Zustand + TanStack Query Pattern (2025)

```typescript
// ✅ RECOMENDADO 2025
// TanStack Query owns server state
const { data: suppliers } = useQuery(['suppliers'], suppliersApi.getAll);

// Zustand owns client state
const uiState = useStore(state => state.modal.isOpen);
```

### Validación con Dependencias Externas

**Best Practice:** Lazy load validation dependencies
- ⚡ No cargar datos innecesarios en el render inicial
- ✅ Fetch solo cuando el usuario intenta la acción que requiere validación
- 🎯 Mantener ValidationContext liviano

---

## 🔀 OPCIONES EVALUADAS

### **Opción A: Solo Stores Existentes** ⭐ ELEGIDA
```typescript
// Validar solo datos que YA están en Zustand stores
validator: (ctx) => (ctx.materials?.length || 0) >= 1
// TODO: Agregar suppliers cuando exista suppliersStore
```

**Pros:**
- ✅ Simple, sin overhead
- ✅ No hay fetches innecesarios
- ✅ Datos ya están cacheados en stores
- ✅ Performance óptima

**Contras:**
- ⚠️ Requirements incompletos hasta que existan los stores
- ⚠️ Necesita implementar stores faltantes

---

### **Opción B: Fetch en ValidationContext** ❌ RECHAZADA
```typescript
// Hacer fetch de suppliers en useValidationContext
const [suppliers, setSuppliers] = useState([]);
useEffect(() => {
  suppliersApi.getActiveSuppliers().then(setSuppliers);
}, []);
```

**Pros:**
- ✅ Requirements completos desde el inicio

**Contras:**
- ❌ **Anti-pattern 2025**: Mezcla server state (API) con client state (Zustand)
- ❌ Performance: Fetch innecesario en cada render del hook
- ❌ No usa TanStack Query (no caching, no revalidation)
- ❌ Violates separation of concerns

---

### **Opción C: TanStack Query en ValidationContext** 🤔 VIABLE PERO COMPLEJA
```typescript
// Usar TanStack Query para server data
const { data: suppliers } = useQuery(['suppliers'], suppliersApi.getAll, {
  enabled: false // Solo fetch cuando se necesita
});
```

**Pros:**
- ✅ Sigue best practices 2025
- ✅ Caching automático
- ✅ Background revalidation

**Contras:**
- ⚠️ Requiere instalar TanStack Query (nueva dependencia)
- ⚠️ Complejidad adicional para caso simple
- ⚠️ Todos los validators necesitarían ser async

---

### **Opción D: Lazy Validation** 🎯 IDEAL A FUTURO
```typescript
// Fetch solo cuando se intenta la acción
async function validatePhysicalProducts() {
  const suppliers = await suppliersApi.getActiveSuppliers();
  return suppliers.length >= 1;
}

// En TakeAwayToggle:
onClick={async () => {
  const isValid = await validatePhysicalProducts();
  if (!isValid) showModal();
}}
```

**Pros:**
- ✅ Zero overhead hasta que se necesita
- ✅ Fetch solo cuando el usuario intenta la acción
- ✅ Flexible: puede usar TanStack Query o fetch directo

**Contras:**
- ⚠️ Requiere refactor de validators a async
- ⚠️ UX: delay en mostrar modal (mientras fetch)

---

## ✅ DECISIÓN FINAL

### **Estrategia Híbrida en 3 Fases:**

#### **FASE 1 (AHORA): Opción A - Solo Stores** ⭐
- Implementar requirements usando **solo datos de stores existentes**
- Marcar con `// TODO` los campos que requieren stores faltantes
- Crear documento `FUTURE_REQUIREMENTS.md` con requirements pendientes

#### **FASE 2 (CORTO PLAZO): Crear Stores Faltantes**
- Implementar `suppliersStore`, `paymentsStore`, `deliveryStore`
- Activar requirements comentados
- Mantener pattern Zustand para client state

#### **FASE 3 (MEDIANO PLAZO): TanStack Query (Opcional)**
- Si el app crece, migrar a TanStack Query para server state
- Usar Opción D (Lazy Validation) para datos que no necesitan estar siempre cargados

---

## 📝 REQUIREMENTS DEFINIDOS CON OPCIÓN A

### Physical Products
```typescript
PHYSICAL_PRODUCTS_MANDATORY: [
  {
    id: 'physical_min_materials',
    validator: (ctx) => (ctx.materials?.length || 0) >= 1,
    name: 'Registrar al menos 1 material/insumo',
    blocksAction: 'catalog:publish'
  },
  {
    id: 'physical_min_suppliers',
    validator: (ctx) => (ctx.suppliers?.length || 0) >= 1,
    name: 'Registrar al menos 1 proveedor activo',
    blocksAction: 'catalog:publish'
  },
  {
    id: 'physical_min_products',
    validator: (ctx) => (ctx.products?.length || 0) >= 1,
    name: 'Crear al menos 1 producto',
    blocksAction: 'catalog:publish'
  }
]
```

---

## 🔗 REFERENCIAS

- [Zustand Best Practices](https://github.com/pmndrs/zustand)
- [TanStack Query vs Zustand 2025](https://www.bugragulculer.com/blog/good-bye-redux-how-react-query-and-zustand-re-wired-state-management-in-25)
- [Lazy Loading Best Practices](https://blog.logrocket.com/lazy-loading-vs-eager-loading/)
- [State Management 2025 Guide](https://www.developerway.com/posts/react-state-management-2025)

---

## 🎯 CONCLUSIÓN

**Opción A es la correcta para tu caso** porque:
1. ✅ Ya usás Zustand en el proyecto
2. ✅ No necesitás complejidad adicional de TanStack Query (por ahora)
3. ✅ Los stores eventualmente existirán (están planificados)
4. ✅ Performance óptima
5. ✅ Sigue best practices 2025 (separation of concerns)

Cuando crezcas y necesites más server state management, migrar a TanStack Query será fácil (Fase 3).

