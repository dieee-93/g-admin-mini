# SESSION 5: PRODUCTS MODULE - COMPLETE UI/UX IMPLEMENTATION

**Context**: Sessions 1-4 completadas (backend architecture, EventBus, flexible ProductConfig, features, database). Ahora falta la UI/UX que aproveche toda esta flexibilidad.

**Previous Work**:
- ✅ Session 1-3: EventBus, ProductConfig, Alerts, Cross-module injections
- ✅ Session 4: Feature naming, Database tables, Documentation, Bug fixes
- ✅ Backend: 100% completado, Architecture Score: 15/15

**Current Problem**:
- Página de Products solo muestra lista vacía con botón "New Product"
- No hay formularios para los 11 tipos de productos diferentes
- No hay interfaz para ProductConfig flexible
- No hay gestión visual de recetas/componentes/booking/staff/digital delivery

---

## 🎯 OBJETIVO: UI/UX COMPLETA PARA PRODUCTS MODULE

Implementar interfaz completa que soporte los **11 tipos de productos** con configuración flexible.

---

## 📋 CONVENCIONES OBLIGATORIAS

### 1. **Sistema de Componentes Semánticos**

**SIEMPRE importar de `@/shared/ui`, NUNCA de `@chakra-ui/react`**

```typescript
// ✅ CORRECTO
import {
  ContentLayout,
  PageHeader,
  Section,
  FormSection,
  StatsSection,
  CardGrid,
  Button,
  Field,
  Input,
  SelectField,
  Switch
} from '@/shared/ui';

// ❌ INCORRECTO
import { Box, Stack, Button } from '@chakra-ui/react';
```

### 2. **Estructura de Página (Patrón Orquestador)**

```typescript
// page.tsx - SIEMPRE seguir este patrón
export function ProductsPage() {
  // 🎭 Toda la lógica delegada al hook orquestador
  const logic = useProductsPage();

  return (
    <ContentLayout spacing="normal">
      {/* 📋 Header semántico */}
      <PageHeader
        title="Products"
        subtitle="Catalog, recipes & pricing"
        actions={<Actions {...logic} />}
      />

      {/* 🧩 Secciones semánticas */}
      <Section variant="elevated" title="Product Management">
        <ProductList {...logic} />
      </Section>
    </ContentLayout>
  );
}
```

### 3. **Estructura de Carpetas (Patrón Estándar)**

```
src/pages/admin/supply-chain/products/
├── page.tsx                    # Orquestador limpio
├── components/                 # Componentes UI
│   ├── index.ts               # Barrel exports
│   ├── ProductList/
│   │   ├── index.tsx
│   │   ├── ProductFilters.tsx
│   │   └── ProductCard.tsx
│   ├── ProductFormModal/
│   │   ├── index.tsx
│   │   ├── BasicInfoSection.tsx
│   │   ├── RecipeSection.tsx      # Solo si has_components
│   │   ├── BookingSection.tsx     # Solo si requires_booking
│   │   ├── StaffSection.tsx       # Solo si requires_staff
│   │   └── DigitalSection.tsx     # Solo si is_digital
│   └── ProductDetailView/
│       ├── index.tsx
│       └── DynamicTabs.tsx
├── hooks/
│   ├── index.ts
│   ├── useProductsPage.ts     # Hook orquestador
│   ├── useProductForm.ts
│   └── useProductFilters.ts
├── services/
│   ├── index.ts
│   ├── productApi.ts          # Ya existe
│   └── productValidation.ts   # NUEVO
└── types/
    └── index.ts               # ProductConfig ya existe
```

### 4. **Hooks - Lógica de Negocio**

```typescript
// hooks/useProductsPage.ts - Hook orquestador
export function useProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  return {
    selectedProduct,
    isFormOpen,
    formMode,
    handleNewProduct,
    handleEditProduct,
    // ... más handlers
  };
}
```

### 5. **Formularios Dinámicos (Basados en ProductConfig)**

```typescript
// ProductFormModal/index.tsx
export function ProductFormModal({ product, mode, onClose }: Props) {
  const { formData, handleChange } = useProductForm(product, mode);

  return (
    <Dialog.Root open onClose={onClose} size="xl">
      <Dialog.Content>
        <Dialog.Header>
          {mode === 'create' ? 'New Product' : 'Edit Product'}
        </Dialog.Header>

        <Dialog.Body>
          <Stack gap="6">
            {/* Siempre visible */}
            <BasicInfoSection data={formData} onChange={handleChange} />

            {/* Condicional basado en category */}
            {formData.config.has_components && (
              <RecipeSection data={formData} onChange={handleChange} />
            )}

            {formData.config.requires_booking && (
              <BookingSection data={formData} onChange={handleChange} />
            )}

            {formData.config.requires_staff && (
              <StaffSection data={formData} onChange={handleChange} />
            )}

            {formData.config.is_digital && (
              <DigitalSection data={formData} onChange={handleChange} />
            )}
          </Stack>
        </Dialog.Body>

        <Dialog.Footer>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button colorPalette="purple" onClick={handleSubmit}>
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

### 6. **SelectField - Uso Correcto**

```typescript
// ✅ CORRECTO - Usar options prop
<SelectField
  label="Category"
  required
  options={PRODUCT_CATEGORIES.map(cat => ({
    value: cat.value,
    label: cat.label
  }))}
  value={formData.category ? [formData.category] : []}
  onValueChange={(details) => handleChange('category', details.value[0])}
  placeholder="Select category"
  helperText="Product category"
/>

// ❌ INCORRECTO - No usar createListCollection manualmente
```

---

## 📚 REFERENCIA: MATERIALS MODULE (Gold Standard)

**Revisar estos archivos como ejemplo:**

1. **Estructura de página**: `src/pages/admin/supply-chain/materials/page.tsx`
2. **Hook orquestador**: `src/pages/admin/supply-chain/materials/hooks/useMaterialsPage.ts`
3. **Formulario modal**: `src/pages/admin/supply-chain/materials/components/MaterialFormModal.tsx`
4. **Lista con filtros**: `src/pages/admin/supply-chain/materials/components/MaterialsList/`
5. **Services**: `src/pages/admin/supply-chain/materials/services/materialsApi.ts`

**Comandos para revisar**:
```bash
# Ver estructura
Read src/pages/admin/supply-chain/materials/page.tsx

# Ver hook orquestador
Read src/pages/admin/supply-chain/materials/hooks/useMaterialsPage.ts

# Ver formulario
Read src/pages/admin/supply-chain/materials/components/MaterialFormModal.tsx
```

---

## 🎨 IMPLEMENTACIÓN REQUERIDA

### Task 1: ProductFormModal Completo (3h)

**Archivo**: `src/pages/admin/supply-chain/products/components/ProductFormModal/index.tsx`

**Secciones**:

1. **BasicInfoSection** (siempre visible):
   - Name (Input required)
   - Category (SelectField - 11 opciones: FOOD, SERVICE, DIGITAL, etc.)
   - Description (Textarea)
   - Price (Input number con DecimalUtils)
   - Image URL (Input)

2. **RecipeSection** (si `has_components === true`):
   - Switch: "Uses components"
   - Switch: "Components required"
   - Switch: "Allow dynamic materials" (para REPAIR_SERVICE)
   - Lista de componentes con MaterialSelector + quantity

3. **ProductionSection** (si `requires_production === true`):
   - Switch: "Requires production"
   - SelectField: Production type (kitchen, assembly, preparation)
   - Input: Duration minutes

4. **BookingSection** (si `requires_booking === true`):
   - Switch: "Requires booking"
   - Input: Booking window days
   - Input: Concurrent capacity
   - SelectField: Cancellation policy

5. **StaffSection** (si `requires_staff === true`):
   - Switch: "Requires staff"
   - Dynamic list: Role + Count + Duration
   - Button: "Add staff requirement"

6. **DigitalSection** (si `is_digital === true`):
   - Switch: "Is digital"
   - SelectField: Delivery type (download, event, course, streaming)
   - Input: Access URL
   - Input: Max participants (para eventos)
   - Input: Platform name

**Validaciones**:
- Crear `services/productValidation.ts` con reglas:
  - Si `requires_staff === true` → `staff_allocation` no puede estar vacío
  - Si `has_duration === true` → `duration_minutes` requerido
  - Si `requires_booking === true` → `booking_window_days` requerido
  - Si `is_digital === true` → `digital_delivery` requerido

### Task 2: ProductList Mejorado (2h)

**Archivo**: `src/pages/admin/supply-chain/products/components/ProductList/index.tsx`

**Características**:
- **Filtros**:
  - Category (SelectField con todas las categorías)
  - Has Recipe (Switch)
  - Requires Booking (Switch)
  - Search by name (Input)

- **Vista de Tarjetas** (CardGrid):
  - Badge visual para categoría (color coding)
  - Indicadores: 🍽️ (has recipe), 📅 (requires booking), 👥 (requires staff), 💻 (is digital)
  - Precio con formato
  - Botones: Edit, Delete, View Details

- **Empty State**:
  - Si no hay productos: Ilustración + "Create your first product"
  - Si hay filtros pero no resultados: "No products match filters"

### Task 3: ProductDetailView con Tabs Dinámicos (2h)

**Archivo**: `src/pages/admin/supply-chain/products/components/ProductDetailView/index.tsx`

**Tabs dinámicos basados en config**:
- **Overview** (siempre visible): Info básica, pricing, availability
- **Recipe** (si `has_components`): Lista de componentes, cost breakdown
- **Booking Rules** (si `requires_booking`): Políticas, horarios
- **Staff Requirements** (si `requires_staff`): Roles, allocation
- **Digital Delivery** (si `is_digital`): Configuración de entrega
- **Production** (si `requires_production`): Injection de Production module (ya implementado)
- **Sales History** (siempre): Injection de Sales module (ya implementado)

**Usar Tabs de Chakra**:
```typescript
<Tabs.Root defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    {product.config.has_components && (
      <Tabs.Trigger value="recipe">Recipe</Tabs.Trigger>
    )}
    {/* más tabs condicionales */}
  </Tabs.List>

  <Tabs.Content value="overview">
    <OverviewTab product={product} />
  </Tabs.Content>

  {/* más contenido */}
</Tabs.Root>
```

### Task 4: Hook Points para Injecciones (30min)

**Agregar en ProductDetailView**:
```typescript
// Después de tabs nativos, permitir inyecciones
<HookPoint
  name="products.detail.tabs"
  data={{ product }}
/>

<HookPoint
  name="products.detail.sections"
  data={{ product }}
/>
```

**Agregar en ProductList**:
```typescript
// En cada fila/card
<HookPoint
  name="products.row.actions"
  data={{ product }}
/>
```

---

## 🎯 TIPOS DE PRODUCTOS - Ejemplos de Configuración

### 1. FOOD (Hamburguesa)
```typescript
{
  category: "FOOD",
  config: {
    has_components: true,
    components_required: true,
    requires_production: true,
    production_type: "kitchen",
    requires_staff: true,
    staff_allocation: [{ role: "chef", count: 1, duration_minutes: 10 }]
  }
}
```

### 2. PROFESSIONAL_SERVICE (Masaje)
```typescript
{
  category: "PROFESSIONAL_SERVICE",
  config: {
    has_components: false,    // ← NO materiales
    requires_booking: true,
    booking_window_days: 1,
    concurrent_capacity: 3,
    requires_staff: true,
    staff_allocation: [{ role: "masseuse", count: 1, duration_minutes: 60 }]
  }
}
```

### 3. EVENT (Webinar)
```typescript
{
  category: "EVENT",
  config: {
    has_components: false,
    is_digital: true,
    digital_delivery: {
      delivery_type: "event",
      access_url: "zoom.us/xxx",
      max_participants: 100,
      platform: "Zoom"
    },
    requires_staff: true
  }
}
```

### 4. REPAIR_SERVICE (Mecánica)
```typescript
{
  category: "REPAIR_SERVICE",
  config: {
    has_components: true,
    components_required: false,           // ← Componentes opcionales
    allow_dynamic_materials: true,        // ← Se agregan durante servicio
    requires_staff: true,
    requires_booking: true
  }
}
```

---

## 📊 VALIDACIÓN FINAL

### Checklist de Completitud:

- [ ] ProductFormModal muestra secciones condicionales según category
- [ ] Formulario valida campos requeridos según ProductConfig
- [ ] ProductList muestra indicadores visuales (badges, iconos)
- [ ] Filtros funcionan correctamente
- [ ] ProductDetailView muestra tabs dinámicos
- [ ] Hook Points permiten inyecciones de Production y Sales
- [ ] Empty states implementados
- [ ] TypeScript compila sin errores
- [ ] Componentes usan sistema semántico (@/shared/ui)
- [ ] Hooks siguen patrón orquestador
- [ ] Services manejan lógica de negocio

### Testing Manual:

1. Crear producto FOOD → Debe mostrar RecipeSection y ProductionSection
2. Crear producto SERVICE → Debe mostrar BookingSection y StaffSection
3. Crear producto DIGITAL → Debe mostrar DigitalSection
4. Editar producto → Debe pre-cargar datos correctamente
5. Filtrar por categoría → Lista debe actualizarse
6. Ver detalles → Tabs dinámicos deben aparecer según config

---

## 🎁 RESULTADO ESPERADO

Al completar Session 5:
- ✅ UI completa que aprovecha ProductConfig flexible
- ✅ Formularios inteligentes que se adaptan al tipo de producto
- ✅ Lista mejorada con filtros y visualización rica
- ✅ Detail view con tabs dinámicos
- ✅ Hook points para extensibilidad
- ✅ 11 tipos de productos soportados visualmente
- ✅ UX consistente con Materials module
- ✅ 100% usando componentes semánticos

**Tiempo estimado**: 7.5 horas
**Architecture Score**: Mantiene 15/15

---

## 📝 NOTAS IMPORTANTES

1. **NO crear componentes de prueba** - Solo los requeridos
2. **Seguir EXACTAMENTE la estructura de Materials** - Es el Gold Standard
3. **Usar DecimalUtils para precios** - `DecimalUtils.fromValue(price ?? 0, 'products')`
4. **Emitir eventos EventBus** - `eventBus.emit('products.product_created', { productId })`
5. **Logging consistente** - `logger.info('Products', 'Creating product', { name })`
6. **No modificar backend** - Solo UI/UX, el backend está completo

---

**Ready to implement Session 5!** 🚀

Usa este prompt en una nueva conversación para implementar la UI completa del módulo de Products.
