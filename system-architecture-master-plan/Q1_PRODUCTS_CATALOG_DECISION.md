# 📦 DECISIÓN Q1: Products/Catalog Architecture

**Fecha**: 2025-01-15
**Estado**: ✅ **DECISIÓN TOMADA**
**Principio aplicado**: Features por FUNCIÓN + Same entity pattern

---

## 🎯 PROBLEMA PLANTEADO

**Pregunta**: ¿Cómo manejar múltiples tipos de productos (gastronómicos, retail, services, events, digital, training)?

**Opciones**:
- **Opción A**: Un módulo "Catalog" con UI dinámica según tipos activos ⭐
- **Opción B**: Módulos separados (Menu, Retail, Services, Events, Digital, Training)

---

## 🔍 ANÁLISIS REALIZADO

### Estado Actual del Código

**Hallazgo crítico**: Products **YA está implementado correctamente** con pattern de discriminador

```typescript
// src/pages/admin/supply-chain/products/types/product.ts

export interface Product {
  id: string;
  name: string;
  unit?: string;
  type: ProductType;  // ✅ DISCRIMINADOR (igual que Sale.order_type)
  description?: string;
}

export type ProductType =
  | "ELABORATED"    // ✅ Gastronómicos (con recetas)
  | "SERVICE"       // ✅ Servicios
  | "DIGITAL"       // ✅ Productos digitales
  // ⚠️ Faltan: RETAIL, EVENT, TRAINING
```

**Pattern identificado**: Mismo que `Sale.order_type`
- Sale usa `order_type` para discriminar canales (DINE_IN, DELIVERY, APPOINTMENT)
- Product usa `type` para discriminar tipos de producto
- ✅ Pattern consistente en todo el sistema

---

### Análisis por Función

**Pregunta fundamental**: ¿Gestionar productos gastronómicos vs retail es FUNCIÓN diferente?

**Respuesta**: NO

| Aspecto | Gastronómicos | Retail | Services | Events | Digital | Training |
|---------|---------------|--------|----------|--------|---------|----------|
| **Función** | Gestión de catálogo | Gestión de catálogo | Gestión de catálogo | Gestión de catálogo | Gestión de catálogo | Gestión de catálogo |
| **CRUD** | ✅ Create, Read, Update, Delete | ✅ Same | ✅ Same | ✅ Same | ✅ Same | ✅ Same |
| **Tabla DB** | `products` | `products` | `products` | `products` | `products` | `products` |
| **Module** | Products | Products | Products | Products | Products | Products |

**Diferencia**: Solo en **campos adicionales** según tipo, NO en función principal

---

### Comparación con Decisiones Previas

**Consistencia con E-commerce/Appointments**:

| Caso | Pattern Aplicado | Decisión |
|------|------------------|----------|
| **Sales channels** | `Sale.order_type` discriminator | ✅ UN módulo Sales con types |
| **Products types** | `Product.type` discriminator | ✅ UN módulo Products con types |
| **Staff roles** | `Employee.role` discriminator | ✅ UN módulo Staff con roles |

**Anti-pattern que evitamos**:
```
❌ INCORRECTO (capabilities = módulos)
- /admin/menu (gastronómicos)
- /admin/retail (retail)
- /admin/services (services)
- /admin/events (events)
- /admin/digital-products (digital)
- /admin/training (training)

Problema: 6 módulos con CRUD idéntico, solo campos diferentes
```

**Pattern correcto**:
```
✅ CORRECTO (función única, tipos discriminados)
- /admin/supply-chain/products (UN módulo)
  - type: ELABORATED → Muestra campos de recetas
  - type: RETAIL → Muestra SKU, barcode, variants
  - type: SERVICE → Muestra duration, professionals
  - type: EVENT → Muestra dates, capacity, tickets
  - type: DIGITAL → Muestra download, license
  - type: TRAINING → Muestra curriculum, certification
```

---

## ✅ DECISIÓN FINAL

### UN MÓDULO: Products (Catalog)

**Ubicación**: `/admin/supply-chain/products` (ya existe)

**Razones**:
1. ✅ **Función única**: Gestión de catálogo (CRUD de productos)
2. ✅ **Pattern existente**: Ya usa discriminador `type`
3. ✅ **DRY principle**: NO duplicar lógica CRUD 6 veces
4. ✅ **Escalabilidad**: Agregar nuevo tipo = agregar enum value, no nuevo módulo
5. ✅ **Consistencia**: Mismo pattern que Sale, Employee, etc.
6. ✅ **Mantenibilidad**: Un solo lugar para cambios en lógica de productos

**NO crear**:
- ❌ `/admin/menu`
- ❌ `/admin/retail`
- ❌ `/admin/services`
- ❌ `/admin/events`
- ❌ `/admin/digital-products`
- ❌ `/admin/training`

---

## 🔧 IMPLEMENTACIÓN

### 1. Expandir ProductType Enum

```typescript
// src/pages/admin/supply-chain/products/types/product.ts

export type ProductType =
  | "ELABORATED"    // Gastronómicos (con recetas, BOM, cost calculator)
  | "RETAIL"        // 🆕 Retail (SKU, variants, barcode)
  | "SERVICE"       // Servicios (duration, professionals)
  | "EVENT"         // 🆕 Eventos (dates, capacity, tickets)
  | "DIGITAL"       // Productos digitales (download, license)
  | "TRAINING"      // 🆕 Capacitaciones (curriculum, certification)

export const PRODUCT_TYPES: { label: string; value: ProductType }[] = [
  { label: "Producto Elaborado", value: "ELABORATED" },
  { label: "Producto Retail", value: "RETAIL" },           // 🆕
  { label: "Servicio", value: "SERVICE" },
  { label: "Evento", value: "EVENT" },                      // 🆕
  { label: "Producto Digital", value: "DIGITAL" },
  { label: "Capacitación", value: "TRAINING" },            // 🆕
];
```

---

### 2. Product Interface con Campos Condicionales

```typescript
// src/pages/admin/supply-chain/products/types/product.ts

export interface Product {
  // === COMMON FIELDS (all types) ===
  id: string;
  name: string;
  description?: string;
  type: ProductType;
  price: number;
  tax_rate: number;
  active: boolean;
  created_at: string;
  updated_at: string;

  // === TYPE-SPECIFIC FIELDS ===

  // ELABORATED (gastronómicos)
  unit?: string;                        // 'unit', 'kg', 'lt'
  recipe?: Recipe;                      // BOM + cost calculation
  components?: ProductComponent[];
  cost?: number;                        // Calculated from recipe

  // RETAIL
  sku?: string;                         // Stock Keeping Unit
  barcode?: string;                     // Barcode/QR
  variants?: ProductVariant[];          // Size, color, etc.
  supplier_id?: string;
  reorder_point?: number;
  reorder_quantity?: number;

  // SERVICE
  duration_minutes?: number;            // Service duration
  requires_booking?: boolean;
  available_professionals?: string[];   // Staff IDs
  cancellation_policy?: string;

  // EVENT
  event_date?: string;                  // Event date/time
  event_duration_hours?: number;
  capacity?: number;                    // Max attendees
  tickets_sold?: number;
  venue?: string;
  event_type?: string;                  // 'workshop', 'concert', 'conference'

  // DIGITAL
  download_url?: string;                // Download link
  file_size?: number;                   // MB
  license_type?: string;                // 'single', 'multi', 'subscription'
  activation_key?: string;
  expiration_days?: number;

  // TRAINING
  curriculum?: TrainingCurriculum[];    // Course content
  certification?: boolean;              // Issues certificate?
  duration_hours?: number;              // Course length
  instructor_id?: string;
  max_students?: number;
  prerequisites?: string[];             // Required courses
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;                         // "Large", "Red", etc.
  sku: string;
  price_modifier: number;               // +5, -2
  stock: number;
}

export interface TrainingCurriculum {
  module_number: number;
  title: string;
  description: string;
  duration_hours: number;
  topics: string[];
}
```

---

### 3. Dynamic Product Form

```typescript
// products/components/ProductFormModal/ProductFormModal.tsx

export function ProductFormModal({ product, isOpen, onClose }: Props) {
  const { register, watch, handleSubmit } = useForm<Product>({
    defaultValues: product,
  });

  const selectedType = watch('type');

  return (
    <Dialog open={isOpen} onClose={onClose} size="xl">
      <DialogHeader>
        {product ? 'Edit Product' : 'Create Product'}
      </DialogHeader>

      <DialogBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" gap="4">
            {/* === COMMON FIELDS (always visible) === */}
            <Section title="Basic Information">
              <Field label="Product Name" required>
                <Input {...register('name')} />
              </Field>

              <Field label="Product Type" required>
                <Select {...register('type')}>
                  {PRODUCT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Description">
                <Textarea {...register('description')} />
              </Field>

              <Field label="Price" required>
                <Input {...register('price')} type="number" step="0.01" />
              </Field>
            </Section>

            {/* === TYPE-SPECIFIC SECTIONS (conditional) === */}

            {selectedType === 'ELABORATED' && (
              <ElaboratedProductFields register={register} watch={watch} />
            )}

            {selectedType === 'RETAIL' && (
              <RetailProductFields register={register} watch={watch} />
            )}

            {selectedType === 'SERVICE' && (
              <ServiceProductFields register={register} watch={watch} />
            )}

            {selectedType === 'EVENT' && (
              <EventProductFields register={register} watch={watch} />
            )}

            {selectedType === 'DIGITAL' && (
              <DigitalProductFields register={register} watch={watch} />
            )}

            {selectedType === 'TRAINING' && (
              <TrainingProductFields register={register} watch={watch} />
            )}
          </Stack>
        </form>
      </DialogBody>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="solid" colorPalette="blue">
          {product ? 'Update' : 'Create'} Product
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
```

---

### 4. Type-Specific Field Components

```typescript
// products/components/ProductFormModal/fields/ElaboratedProductFields.tsx

export function ElaboratedProductFields({ register, watch }: FieldProps) {
  return (
    <Section title="Recipe & Components" icon={<BeakerIcon />}>
      <Field label="Unit of Measure" required>
        <Select {...register('unit')}>
          <option value="unit">Unit</option>
          <option value="kg">Kilogram</option>
          <option value="lt">Liter</option>
          <option value="portion">Portion</option>
        </Select>
      </Field>

      <Field label="Recipe Components">
        <RecipeBuilder
          productId={watch('id')}
          components={watch('components')}
        />
      </Field>

      <Field label="Calculated Cost" readOnly>
        <Input
          value={watch('cost')}
          readOnly
          prefix="$"
        />
        <FieldHelp>
          Automatically calculated from recipe components
        </FieldHelp>
      </Field>
    </Section>
  );
}
```

```typescript
// products/components/ProductFormModal/fields/RetailProductFields.tsx

export function RetailProductFields({ register, watch }: FieldProps) {
  return (
    <Section title="Retail Configuration" icon={<ShoppingBagIcon />}>
      <Stack direction="row" gap="4">
        <Field label="SKU">
          <Input {...register('sku')} placeholder="PROD-001" />
        </Field>

        <Field label="Barcode">
          <Input {...register('barcode')} placeholder="1234567890123" />
        </Field>
      </Stack>

      <Field label="Supplier">
        <SupplierSelect {...register('supplier_id')} />
      </Field>

      <Stack direction="row" gap="4">
        <Field label="Reorder Point">
          <Input
            {...register('reorder_point')}
            type="number"
            placeholder="10"
          />
          <FieldHelp>Alert when stock falls below this</FieldHelp>
        </Field>

        <Field label="Reorder Quantity">
          <Input
            {...register('reorder_quantity')}
            type="number"
            placeholder="50"
          />
        </Field>
      </Stack>

      <Field label="Variants">
        <VariantsManager
          productId={watch('id')}
          variants={watch('variants')}
        />
      </Field>
    </Section>
  );
}
```

```typescript
// products/components/ProductFormModal/fields/ServiceProductFields.tsx

export function ServiceProductFields({ register, watch }: FieldProps) {
  return (
    <Section title="Service Configuration" icon={<CalendarIcon />}>
      <Field label="Service Duration" required>
        <Input
          {...register('duration_minutes')}
          type="number"
          suffix="minutes"
        />
      </Field>

      <Checkbox
        {...register('requires_booking')}
        label="Requires appointment booking"
      />

      {watch('requires_booking') && (
        <>
          <Field label="Available Professionals">
            <MultiSelect
              {...register('available_professionals')}
              options={professionalsOptions}
            />
          </Field>

          <Field label="Cancellation Policy">
            <Select {...register('cancellation_policy')}>
              <option value="flexible">Flexible</option>
              <option value="24h">24 hours notice</option>
              <option value="48h">48 hours notice</option>
              <option value="strict">No cancellations</option>
            </Select>
          </Field>
        </>
      )}
    </Section>
  );
}
```

```typescript
// products/components/ProductFormModal/fields/EventProductFields.tsx

export function EventProductFields({ register, watch }: FieldProps) {
  return (
    <Section title="Event Details" icon={<CalendarDaysIcon />}>
      <Stack direction="row" gap="4">
        <Field label="Event Date & Time" required>
          <DateTimePicker {...register('event_date')} />
        </Field>

        <Field label="Duration">
          <Input
            {...register('event_duration_hours')}
            type="number"
            suffix="hours"
          />
        </Field>
      </Stack>

      <Field label="Venue">
        <Input {...register('venue')} placeholder="Conference Hall A" />
      </Field>

      <Stack direction="row" gap="4">
        <Field label="Capacity">
          <Input
            {...register('capacity')}
            type="number"
            placeholder="100"
          />
          <FieldHelp>Maximum attendees</FieldHelp>
        </Field>

        <Field label="Tickets Sold" readOnly>
          <Input
            value={watch('tickets_sold')}
            readOnly
          />
        </Field>
      </Stack>

      <Field label="Event Type">
        <Select {...register('event_type')}>
          <option value="workshop">Workshop</option>
          <option value="concert">Concert</option>
          <option value="conference">Conference</option>
          <option value="webinar">Webinar</option>
          <option value="meetup">Meetup</option>
        </Select>
      </Field>
    </Section>
  );
}
```

---

### 5. Database Schema Updates

```sql
-- Expand products table with new fields
ALTER TABLE products
  -- RETAIL fields
  ADD COLUMN sku VARCHAR(100),
  ADD COLUMN barcode VARCHAR(100),
  ADD COLUMN supplier_id UUID REFERENCES suppliers(id),
  ADD COLUMN reorder_point INTEGER,
  ADD COLUMN reorder_quantity INTEGER,

  -- SERVICE fields (some already exist from appointments)
  ADD COLUMN duration_minutes INTEGER,
  ADD COLUMN requires_booking BOOLEAN DEFAULT false,
  ADD COLUMN available_professionals UUID[],
  ADD COLUMN cancellation_policy VARCHAR(50),

  -- EVENT fields
  ADD COLUMN event_date TIMESTAMPTZ,
  ADD COLUMN event_duration_hours DECIMAL(5, 2),
  ADD COLUMN capacity INTEGER,
  ADD COLUMN tickets_sold INTEGER DEFAULT 0,
  ADD COLUMN venue TEXT,
  ADD COLUMN event_type VARCHAR(50),

  -- DIGITAL fields
  ADD COLUMN download_url TEXT,
  ADD COLUMN file_size INTEGER, -- MB
  ADD COLUMN license_type VARCHAR(50),
  ADD COLUMN activation_key VARCHAR(200),
  ADD COLUMN expiration_days INTEGER,

  -- TRAINING fields
  ADD COLUMN curriculum JSONB,
  ADD COLUMN certification BOOLEAN DEFAULT false,
  ADD COLUMN duration_hours INTEGER,
  ADD COLUMN instructor_id UUID REFERENCES employees(id),
  ADD COLUMN max_students INTEGER,
  ADD COLUMN prerequisites TEXT[];

-- Product variants (for RETAIL)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  price_modifier NUMERIC(12, 2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);

-- Indexes for new fields
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_event_date ON products(event_date);
CREATE INDEX idx_products_instructor ON products(instructor_id);
```

---

### 6. Capability-Based Filtering

```typescript
// products/hooks/useProductTypes.ts

export function useProductTypes() {
  const capabilities = useCapabilityStore((state) => state.capabilities);

  return useMemo(() => {
    const availableTypes: ProductType[] = ['ELABORATED']; // Always available

    // RETAIL - Always available for any business
    availableTypes.push('RETAIL');

    // SERVICE - If appointment_based OR walkin_service
    if (
      capabilities.has('appointment_based') ||
      capabilities.has('walkin_service')
    ) {
      availableTypes.push('SERVICE');
    }

    // EVENT - If has events capability (future)
    if (capabilities.has('events_management')) {
      availableTypes.push('EVENT');
    }

    // DIGITAL - If has digital products capability (future)
    if (capabilities.has('digital_products')) {
      availableTypes.push('DIGITAL');
    }

    // TRAINING - If has training capability (future)
    if (capabilities.has('training_programs')) {
      availableTypes.push('TRAINING');
    }

    return availableTypes;
  }, [capabilities]);
}
```

```typescript
// products/components/ProductFormModal/ProductFormModal.tsx

export function ProductFormModal() {
  const availableTypes = useProductTypes();

  return (
    <Select {...register('type')}>
      {PRODUCT_TYPES.filter(t => availableTypes.includes(t.value)).map(type => (
        <option key={type.value} value={type.value}>
          {type.label}
        </option>
      ))}
    </Select>
  );
}
```

---

### 7. Products Table with Type Badges

```typescript
// products/components/ProductsTable.tsx

export function ProductsTable({ products }: Props) {
  const getTypeBadge = (type: ProductType) => {
    const badges = {
      ELABORATED: { label: 'Recipe', color: 'purple' },
      RETAIL: { label: 'Retail', color: 'blue' },
      SERVICE: { label: 'Service', color: 'green' },
      EVENT: { label: 'Event', color: 'orange' },
      DIGITAL: { label: 'Digital', color: 'cyan' },
      TRAINING: { label: 'Training', color: 'pink' },
    };

    return badges[type];
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map(product => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>
              <Badge
                variant="subtle"
                colorPalette={getTypeBadge(product.type).color}
              >
                {getTypeBadge(product.type).label}
              </Badge>
            </TableCell>
            <TableCell>${product.price}</TableCell>
            <TableCell>
              <Button size="sm" onClick={() => onEdit(product)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## 📊 RESUMEN DE DECISIÓN

### ✅ Decisión: UN MÓDULO con UI Dinámica

**Ubicación**: `/admin/supply-chain/products` (mantener)

**Ventajas**:
1. ✅ **DRY**: No duplicar CRUD 6 veces
2. ✅ **Mantenible**: Cambios en un solo lugar
3. ✅ **Escalable**: Agregar tipo = enum value, no módulo nuevo
4. ✅ **Consistente**: Pattern usado en Sale, Employee
5. ✅ **Flexible**: Capability-based filtering
6. ✅ **UX coherente**: Un lugar para gestionar todo el catálogo

**Desventajas**: Ninguna significativa

---

### Implementación Requerida

| Tarea | Estimado | Prioridad |
|-------|----------|-----------|
| Expandir ProductType enum | 1 hora | 🔴 ALTA |
| Crear type-specific field components | 8 horas | 🔴 ALTA |
| Database schema updates | 2 horas | 🔴 ALTA |
| Capability filtering | 2 horas | 🟡 MEDIA |
| Update ProductsTable badges | 1 hora | 🟡 MEDIA |
| Testing | 4 horas | 🟡 MEDIA |
| **TOTAL** | **18 horas** | **~2.5 días** |

---

## 🎓 LECCIONES APRENDIDAS

### Pattern Confirmado: Discriminator > Modules

**Casos validados**:
- ✅ `Sale.order_type` → UN módulo Sales
- ✅ `Product.type` → UN módulo Products
- ✅ `Employee.role` → UN módulo Staff

**Anti-pattern evitado**:
- ❌ 1 capability = 1 módulo
- ❌ 1 tipo de entidad = 1 módulo

**Regla**: Si la **FUNCIÓN es la misma**, usar discriminador, NO módulos separados.

---

## 📚 REFERENCIAS

- `ARCHITECTURAL_DECISIONS_CORRECTED.md` - Principio de distribución
- `src/pages/admin/supply-chain/products/types/product.ts` - Types actuales
- `src/pages/admin/operations/sales/types.ts` - Sale discriminator pattern
- `CLAUDE.md` - Design system guidelines

---

**FIN DE LA DECISIÓN Q1**

Esta decisión confirma:
- ✅ Q1 (Products/Catalog) → **Opción A: UN módulo con UI dinámica**
- ✅ Pattern consistente con decisiones previas
- ✅ Implementación: ~18 horas de work

**Próximos pasos**:
- Actualizar FEATURE_TO_MODULE_MAPPING.md
- Implementar expansión de ProductType (opcional)
