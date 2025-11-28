# Análisis: ¿El Modal de Materials Necesita Estado Global?

## Tu Pregunta

> "¿Si el modal debería ser abierto o accesible de otro módulo lo mejor sería que esté en Zustand? ¿Ocurre esto en el proyecto?"

## Respuesta Corta

**NO**, el modal de materials **NO se usa desde otros módulos**. Solo se usa dentro de la página de materials misma.

---

## Evidencia del Código

### 1. Hook Global Existente (`useZustandStores.ts`)

Encontré que existe un hook `useMaterials()` que expone `openModal` globalmente:

```typescript
// src/hooks/useZustandStores.ts líneas 54-123
export const useMaterials = () => {
  // ... estados
  const openModal = useMaterialsStore(state => state.openModal);
  
  return {
    // ... otros
    openModal,  // ← Expuesto globalmente
    closeModal
  };
};
```

### 2. ¿Quién Usa Este Hook?

Busque todas las importaciones de `useMaterials` en el proyecto:

#### ✅ **Uso Real:**

1. **`MaterialSelector.tsx`** (componente compartido):
   ```typescript
   const { items, loading } = useMaterials();
   // ❌ NO usa openModal, solo lee items
   ```

2. **`useCostAnalysis.ts`** (módulo de products):
   ```typescript
   const { items: materialItems } = useMaterialsStore();
   // ❌ NO usa openModal, solo lee datos
   ```

**Resultado**: **NADIE usa `openModal` desde fuera del módulo de materials**.

### 3. ¿Quién SÍ Abre el Modal?

Todos los usos de `openModal` están **dentro de materials**:

```
src/pages/admin/supply-chain/materials/
  ├─ page.tsx                    ← NO (comentario dice "Don't use useMaterials()")
  ├─ hooks/useMaterialsPage.ts   ← SÍ (openModal('add'))
  └─ components/
      └─ InventoryTabEnhanced.tsx ← SÍ (openModal('edit', material))
```

### 4. Comentario Revelador en `page.tsx`

Línea 149:
```typescript
// ✅ FIX: Don't use useMaterials() here - it subscribes to ENTIRE store again!
const isModalOpen = useMaterialsStore((state) => state.isModalOpen);
```

**Interpretación**: Ya sabías que `useMaterials()` causa re-renders innecesarios!

---

## Conclusión

### El Modal NO Necesita Estado Global

| Criterio | Evaluación |
|----------|------------|
| **¿Se abre desde otros módulos?** | ❌ NO |
| **¿Se abre desde navbar/sidebar?** | ❌ NO |
| **¿Se abre via EventBus?** | ❌ NO (revisé eventos, ninguno abre modal) |
| **¿Se abre via Module Registry?** | ❌ NO |
| **¿Componentes compartidos lo usan?** | ❌ NO (MaterialSelector solo lee items) |

### Patrón Recomendado

Basado en la evidencia:

```typescript
// ✅ CORRECTO: Estado local en MaterialsPage
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
const [currentItem, setCurrentItem] = useState<MaterialItem | null>(null);

// Callbacks para hijos
const openModal = useCallback((mode, item) => {
  setModalMode(mode);
  setCurrentItem(item || null);
  setIsModalOpen(true);
}, []);
```

**Razón**: El alcance del modal es **SOLO la página de materials**, no necesita estado global.

---

## ¿Y el Hook `useMaterials()`?

### Mantenerlo, Pero Mejorar

El hook `useMaterials()` es útil para otros módulos que necesitan **leer datos**:

```typescript
// ✅ BUENO: Products module lee materiales
const { items: materialItems } = useMaterials(); // Solo datos
```

Pero **NO necesita exponer `openModal`** porque nadie lo usa desde fuera.

### Propuesta de Mejora

```typescript
// src/hooks/useZustandStores.ts
export const useMaterials = () => {
  const items = useMaterialsStore(useShallow(state => state.items));
  const categories = useMaterialsStore(state => state.categories);
  const loading = useMaterialsStore(state => state.loading);
  // ... otros DATOS
  
  // ❌ REMOVER: openModal, closeModal
  // Ya no son necesarios globalmente
  
  return {
    items,
    categories,
    loading,
    // ... solo datos, sin acciones de UI
  };
};
```

---

## Solución Final Recomendada

### Fase 1: Localizar Estado UI (TODO LO DEL PLAN ORIGINAL)

**Mover a local state**:
- ✅ `isModalOpen`
- ✅ `modalMode`
- ✅ `currentItem`

### Fase 2: Limpiar Zustand Store

**Remover del store**:
- ✅ `isModalOpen`
- ✅ `modalMode`
- ✅ `currentItem`
- ✅ `openModal` action
- ✅ `closeModal` action

### Fase 3: Actualizar `useMaterials()` Hook

**Remover de export**:
- ✅ `openModal`
- ✅ `closeModal`

**Mantener**:
- ✅ `items` (usado por MaterialSelector, Products)
- ✅ `categories`, `loading`, etc. (datos compartidos)

---

## Respuesta a Tu Pregunta Original

> "Si el modal debería ser abierto de otro módulo, ¿lo mejor sería Zustand?"

**SÍ, PERO** en este caso:

1. **El modal NO se abre desde otros módulos** → NO necesitas Zustand
2. **Solo MaterialSelector usa materials** → Solo lee items, no modal
3. **Products module usa materials** → Solo datos, no acciones UI

**Por lo tanto**: La solución de **LOCAL STATE es correcta**.

---

## Bonus: ¿Cuándo SÍ Usar Zustand para Modals?

Solo si:

```typescript
// ❌ Desde navbar (cross-module):
<Button onClick={() => openMaterialsModal('add')}>
  Agregar Material
</Button>

// ❌ Desde productos page (cross-module):
function ProductsPage() {
  const { openMaterialsModal } = useMaterials();
  return <Button onClick={() => openMaterialsModal('add')} />
}

// ❌ Via EventBus (cross-module):
EventBus.on('materials.open_modal', () => openModal('add'));
```

**Pero NADA de esto ocurre en tu proyecto.**

---

## Conclusión Final

✅ **La solución de local state es 100% correcta para este caso**  
✅ **NO violas ninguna convención**  
✅ **NO necesitas modal en Zustand**  
✅ **El hook `useMaterials()` puede mantenerse para lecturas de datos**
