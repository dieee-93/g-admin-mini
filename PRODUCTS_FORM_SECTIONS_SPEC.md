# Products Form - Sections Specification

**Date**: 2025-01-08
**Purpose**: Especificación detallada de cada sección del formulario de productos

---

## 📐 ORDEN DE SECCIONES - DINÁMICO POR TIPO DE PRODUCTO

**Rationale**: El orden NO es fijo. Depende del tipo de producto y sus características.

**Principio**:
1. Primero configurar CARACTERÍSTICAS del producto
2. Luego calcular COSTOS (si aplica)
3. Finalmente definir PRECIO

---

### Orden para `physical_product`:
```
1. Basic Info
2. Materials (configura) → contribuye a costo
3. Staff (configura, si aplica) → contribuye a costo
4. Production (configura, si aplica) → contribuye a costo
5. Booking (configura, si aplica) → NO afecta costo
6. PRICING → calcula: materials + labor + overhead
```

**Costo = materials_cost + labor_cost + production_overhead**

---

### Orden para `service`:
```
1. Basic Info
2. Staff (configura) → contribuye a costo (PRINCIPAL)
3. Materials (configura, si aplica) → contribuye a costo (OPCIONAL)
4. Booking (configura) → NO afecta costo
5. PRICING → calcula: labor + materials (si hay)
```

**Costo = labor_cost + materials_cost (opcional)**

---

### Orden para `rental`:
```
1. Basic Info
2. Asset Config (configura) → define depreciación
3. Booking (configura - SIEMPRE)
4. Rental Terms (configura)
5. Staff (configura, si aplica) → contribuye a costo
6. Materials (configura, si aplica) → consumibles
7. PRICING → modelo temporal (hourly/daily/weekly)
```

**Costo = depreciación + labor (si hay) + consumibles (si hay)**
**Pricing = NO es costo + margen, es pricing temporal**

---

### Orden para `digital`:
```
1. Basic Info
2. Digital Delivery (configura)
3. PRICING → NO hay cálculo de costo (o costo fijo de hosting)
```

**Costo = costo fijo de plataforma/hosting (opcional)**
**NO hay materials, NO hay staff (en MVP)**

---

### Orden para `membership`:
```
1. Basic Info
2. Recurring Config (configura)
3. Booking (configura, si permite reservar clases)
4. PRICING → pricing recurrente (weekly/monthly/etc)
```

**Costo = NO aplica (es acceso)**
**Pricing = valor percibido, no basado en costos**

---

## 🎯 CORRECCIÓN: Pricing NO es igual para todos

### Tipos de Pricing según producto:

| Tipo | Cálculo de Costo | Estrategia de Pricing |
|------|------------------|----------------------|
| **physical_product** | materials + labor + overhead | ✅ Cost + Margin viable |
| **service** | labor + materials (opcional) | ✅ Cost + Margin viable |
| **rental** | depreciación + consumibles | ⚠️ Temporal, no cost+margin |
| **digital** | hosting/plataforma (fijo) | ❌ Valor percibido, no costo |
| **membership** | N/A | ❌ Valor percibido, no costo |

**Implicación**:
- `physical_product` y `service` → Intelligent Pricing con cost+margin
- `rental` → Pricing temporal (hourly/daily/weekly)
- `digital` y `membership` → Pricing basado en valor, NO en costos

---

## ✅ VENTAJAS DEL ORDEN DINÁMICO

- ✅ Cada tipo tiene su flujo lógico
- ✅ Solo muestra secciones relevantes
- ✅ Cálculo de costos correcto por tipo
- ✅ Pricing apropiado al modelo de negocio
- ✅ No confunde con secciones irrelevantes

---

## 📋 SECCIONES UNIVERSALES (Todos los tipos)

### 1. Basic Info Section

**Visibilidad**: Siempre visible para todos los tipos
**Orden**: PRIMERO

**Campos**:

```typescript
interface BasicInfoFields {
  name: string                    // REQUIRED
  description?: string            // OPTIONAL
  sku?: string                    // OPTIONAL (auto-generado si vacío)
  image_url?: string              // OPTIONAL
  active: boolean                 // DEFAULT: true
  category?: string               // OPTIONAL (para filtros/organización)
}
```

**Layout**:
```tsx
<FormSection title="Información Básica">
  <Stack gap={4}>
    {/* Nombre - REQUIRED */}
    <Field label="Nombre del producto" required>
      <Input
        placeholder="ej: Hamburguesa Clásica"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
      />
      <HelperText>
        Nombre que verán tus clientes
      </HelperText>
    </Field>

    {/* Descripción - OPTIONAL */}
    <Field label="Descripción">
      <Textarea
        placeholder="Describe el producto..."
        rows={3}
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
      />
      <HelperText>
        Información adicional para tus clientes
      </HelperText>
    </Field>

    {/* SKU - OPTIONAL */}
    <Field label="SKU / Código">
      <Input
        placeholder="Auto-generado si se deja vacío"
        value={formData.sku}
        onChange={(e) => handleChange('sku', e.target.value)}
      />
      <HelperText>
        Código único para identificar el producto
      </HelperText>
    </Field>

    {/* Imagen - OPTIONAL */}
    <Field label="Imagen">
      <Input
        type="url"
        placeholder="https://..."
        value={formData.image_url}
        onChange={(e) => handleChange('image_url', e.target.value)}
      />
      <HelperText>
        URL de la imagen del producto
      </HelperText>
    </Field>

    {/* Categoría - OPTIONAL */}
    <Field label="Categoría">
      <SelectField
        placeholder="Selecciona una categoría"
        options={PRODUCT_CATEGORIES}
        value={formData.category}
        onValueChange={(details) => handleChange('category', details.value[0])}
      />
      <HelperText>
        Para organizar tus productos
      </HelperText>
    </Field>

    {/* Estado activo */}
    <Field>
      <Switch
        checked={formData.active}
        onCheckedChange={(e) => handleChange('active', e.checked)}
      >
        Producto activo
      </Switch>
      <HelperText>
        Los productos inactivos no se muestran en ventas
      </HelperText>
    </Field>
  </Stack>
</FormSection>
```

**Validaciones**:
```typescript
function validateBasicInfo(data: BasicInfoFields): ValidationError[] {
  const errors: ValidationError[] = []

  // Nombre requerido
  if (!data.name || data.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'El nombre del producto es requerido',
      severity: 'error'
    })
  }

  // Nombre no debe ser muy largo
  if (data.name && data.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'El nombre no puede exceder 100 caracteres',
      severity: 'error'
    })
  }

  // SKU debe ser único (validar contra DB)
  if (data.sku) {
    // TODO: Validar con backend
  }

  // URL de imagen válida
  if (data.image_url && !isValidUrl(data.image_url)) {
    errors.push({
      field: 'image_url',
      message: 'Ingresa una URL válida',
      severity: 'error'
    })
  }

  return errors
}
```

---

### 2. Pricing Section (OBSOLETO - Ver Section 6)

**⚠️ ESTA SECCIÓN HA SIDO REMOVIDA**

La sección de Pricing ahora aparece AL FINAL del formulario (Section 6: Intelligent Pricing Section) después de calcular todos los costos.

**Razón del cambio**: Para calcular costos primero (materials, staff, production) y luego sugerir precio inteligentemente.

---

## 📦 SECCIONES CONDICIONALES

### 3. Materials Section

**Visibilidad**:
- ✅ `physical_product` (si capability `materials` activa)
- ✅ `service` (si capability `materials` activa)
- ✅ `rental` (si capability `materials` activa - para consumibles)
- ❌ `digital` (no en MVP)
- ❌ `membership` (no en MVP)

**Campos**:
```typescript
interface MaterialsFields {
  has_materials: boolean           // Toggle principal
  materials_required: boolean      // ¿Son obligatorios?
  allow_dynamic_materials: boolean // ¿Agregar durante servicio? (solo service/rental)
  components: ProductComponent[]   // Lista de materiales
}

interface ProductComponent {
  material_id: string              // ID del material
  quantity: number                 // Cantidad requerida
  unit: string                     // Unidad de medida (inherited from material)
  cost_per_unit?: number          // Costo unitario (inherited from material)
}
```

**Layout**:
```tsx
<FormSection title="Materiales e Ingredientes">
  <Stack gap={4}>
    {/* Toggle principal */}
    <Field>
      <Switch
        checked={formData.has_materials}
        onCheckedChange={(e) => handleChange('has_materials', e.checked)}
      >
        Este producto usa materiales o ingredientes
      </Switch>
      <HelperText>
        {productType === 'physical_product' && 'Ingredientes para preparación o componentes del producto'}
        {productType === 'service' && 'Materiales utilizados durante el servicio (ej: tinte, shampoo)'}
        {productType === 'rental' && 'Consumibles incluidos en el alquiler (ej: combustible)'}
      </HelperText>
    </Field>

    {formData.has_materials && (
      <>
        {/* Materiales requeridos */}
        <Field>
          <Switch
            checked={formData.materials_required}
            onCheckedChange={(e) => handleChange('materials_required', e.checked)}
          >
            Los materiales son obligatorios
          </Switch>
          <HelperText>
            Si están activados, el producto no podrá venderse sin stock suficiente
          </HelperText>
        </Field>

        {/* Materiales dinámicos (solo service/rental) */}
        {['service', 'rental'].includes(productType) && (
          <Field>
            <Switch
              checked={formData.allow_dynamic_materials}
              onCheckedChange={(e) => handleChange('allow_dynamic_materials', e.checked)}
            >
              Permitir agregar materiales durante el servicio
            </Switch>
            <HelperText>
              Útil para servicios donde los materiales varían según el caso (ej: reparaciones)
            </HelperText>
          </Field>
        )}

        {/* Lista de componentes */}
        <Divider />

        <Stack gap={3}>
          <Text fontWeight="bold">Componentes</Text>

          {formData.components.length === 0 && (
            <EmptyState
              title="Sin componentes"
              description="Agrega los materiales que usa este producto"
              icon={<BoxIcon />}
            />
          )}

          {formData.components.map((component, index) => (
            <ComponentRow
              key={index}
              component={component}
              onUpdate={(updated) => updateComponent(index, updated)}
              onRemove={() => removeComponent(index)}
            />
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddComponent}
          >
            <PlusIcon />
            Agregar Material
          </Button>
        </Stack>

        {/* Costo total calculado */}
        {formData.components.length > 0 && (
          <Alert status="info" variant="subtle">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">
                Costo de materiales: ${calculateMaterialsCost(formData.components)}
              </Text>
              <Text fontSize="sm">
                Se calculará automáticamente según los precios actuales en inventario
              </Text>
            </Box>
          </Alert>
        )}
      </>
    )}
  </Stack>
</FormSection>

{/* Modal para agregar material */}
<MaterialSelectorModal
  open={isAddingMaterial}
  onClose={() => setIsAddingMaterial(false)}
  onSelect={(material) => {
    addComponent({
      material_id: material.id,
      quantity: 1,
      unit: material.unit,
      cost_per_unit: material.current_cost
    })
  }}
/>
```

**Componente: ComponentRow**:
```tsx
interface ComponentRowProps {
  component: ProductComponent
  onUpdate: (component: ProductComponent) => void
  onRemove: () => void
}

function ComponentRow({ component, onUpdate, onRemove }: ComponentRowProps) {
  const material = useMaterial(component.material_id)

  return (
    <HStack gap={2} align="flex-start">
      {/* Nombre del material */}
      <Field flex={2}>
        <Text fontWeight="medium">{material?.name}</Text>
        <Text fontSize="sm" color="gray.600">
          ${material?.current_cost}/{material?.unit}
        </Text>
      </Field>

      {/* Cantidad */}
      <Field flex={1}>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={component.quantity}
          onChange={(e) => onUpdate({
            ...component,
            quantity: parseFloat(e.target.value)
          })}
        />
        <HelperText>{material?.unit}</HelperText>
      </Field>

      {/* Costo calculado */}
      <Field flex={1}>
        <Text fontWeight="medium">
          ${(component.quantity * (component.cost_per_unit || 0)).toFixed(2)}
        </Text>
      </Field>

      {/* Eliminar */}
      <IconButton
        variant="ghost"
        colorScheme="red"
        size="sm"
        onClick={onRemove}
      >
        <TrashIcon />
      </IconButton>
    </HStack>
  )
}
```

**Validaciones**:
```typescript
function validateMaterials(data: MaterialsFields): ValidationError[] {
  const errors: ValidationError[] = []

  if (data.has_materials) {
    // Si materials_required = true, debe haber al menos 1 componente
    if (data.materials_required && data.components.length === 0) {
      errors.push({
        field: 'components',
        message: 'Debes agregar al menos un material si son obligatorios',
        severity: 'error'
      })
    }

    // Validar cada componente
    data.components.forEach((component, index) => {
      if (!component.material_id) {
        errors.push({
          field: `components[${index}].material_id`,
          message: 'Selecciona un material',
          severity: 'error'
        })
      }

      if (!component.quantity || component.quantity <= 0) {
        errors.push({
          field: `components[${index}].quantity`,
          message: 'La cantidad debe ser mayor a 0',
          severity: 'error'
        })
      }
    })
  }

  return errors
}
```

---

### 4. Staff Section

**Visibilidad**:
- ✅ `physical_product` (si capability `staff` activa)
- ✅ `service` (si capability `staff` activa) - **MUY COMÚN**
- ✅ `rental` (si capability `staff` activa) - ej: chofer
- ❌ `digital` (no en MVP)
- ❌ `membership` (no en MVP)

**Campos**:
```typescript
interface StaffFields {
  has_staff_requirements: boolean  // Toggle principal
  staff_allocation: StaffAllocation[]
}

interface StaffAllocation {
  role: string                     // Rol del personal (ej: "chef", "masseuse")
  count: number                    // Cantidad de personas
  duration_minutes: number         // Duración del trabajo (REQUIRED si booking activo)
  hourly_rate?: number            // Tarifa por hora (opcional, para calcular costo)
}
```

**Layout**:
```tsx
<FormSection title="Personal Requerido">
  <Stack gap={4}>
    {/* Toggle principal */}
    <Field>
      <Switch
        checked={formData.has_staff_requirements}
        onCheckedChange={(e) => handleChange('has_staff_requirements', e.checked)}
      >
        Este producto requiere personal
      </Switch>
      <HelperText>
        {productType === 'physical_product' && 'Personal necesario para preparación (ej: chef, cocinero)'}
        {productType === 'service' && 'Personal que realizará el servicio (ej: masajista, estilista)'}
        {productType === 'rental' && 'Personal incluido con el alquiler (ej: chofer, operador)'}
      </HelperText>
    </Field>

    {formData.has_staff_requirements && (
      <Stack gap={3}>
        <Text fontWeight="bold">Asignación de Personal</Text>

        {formData.staff_allocation.length === 0 && (
          <EmptyState
            title="Sin personal asignado"
            description="Define qué roles se necesitan para este producto"
            icon={<UserGroupIcon />}
          />
        )}

        {formData.staff_allocation.map((allocation, index) => (
          <StaffAllocationRow
            key={index}
            allocation={allocation}
            hasBooking={formData.requires_booking}
            onUpdate={(updated) => updateStaffAllocation(index, updated)}
            onRemove={() => removeStaffAllocation(index)}
          />
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddStaffAllocation}
        >
          <PlusIcon />
          Agregar Rol
        </Button>

        {/* Costo de labor calculado */}
        {formData.staff_allocation.length > 0 && (
          <Alert status="info" variant="subtle">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">
                Costo de labor: ${calculateLaborCost(formData.staff_allocation)}
              </Text>
              <Text fontSize="sm">
                Basado en duración y tarifas por hora
              </Text>
            </Box>
          </Alert>
        )}
      </Stack>
    )}
  </Stack>
</FormSection>
```

**Componente: StaffAllocationRow**:
```tsx
interface StaffAllocationRowProps {
  allocation: StaffAllocation
  hasBooking: boolean  // Si booking está activo, duration es REQUIRED
  onUpdate: (allocation: StaffAllocation) => void
  onRemove: () => void
}

function StaffAllocationRow({
  allocation,
  hasBooking,
  onUpdate,
  onRemove
}: StaffAllocationRowProps) {
  return (
    <Grid columns={hasBooking ? 4 : 3} gap={2}>
      {/* Rol */}
      <Field>
        <Input
          placeholder="ej: Chef"
          value={allocation.role}
          onChange={(e) => onUpdate({
            ...allocation,
            role: e.target.value
          })}
        />
        <HelperText>Rol o puesto</HelperText>
      </Field>

      {/* Cantidad */}
      <Field>
        <Input
          type="number"
          min="1"
          placeholder="1"
          value={allocation.count}
          onChange={(e) => onUpdate({
            ...allocation,
            count: parseInt(e.target.value)
          })}
        />
        <HelperText>Cantidad</HelperText>
      </Field>

      {/* Duración (REQUIRED si hasBooking) */}
      <Field>
        <Input
          type="number"
          min="1"
          placeholder={hasBooking ? "Requerido" : "Opcional"}
          value={allocation.duration_minutes}
          onChange={(e) => onUpdate({
            ...allocation,
            duration_minutes: parseInt(e.target.value)
          })}
          required={hasBooking}
        />
        <HelperText>Minutos</HelperText>
        {hasBooking && !allocation.duration_minutes && (
          <Text color="red.500" fontSize="xs">
            Requerido para calcular disponibilidad
          </Text>
        )}
      </Field>

      {/* Tarifa (opcional) */}
      <Field>
        <InputGroup>
          <InputLeftAddon>$</InputLeftAddon>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={allocation.hourly_rate}
            onChange={(e) => onUpdate({
              ...allocation,
              hourly_rate: parseFloat(e.target.value)
            })}
          />
        </InputGroup>
        <HelperText>$/hora</HelperText>
      </Field>

      {/* Eliminar */}
      <IconButton
        variant="ghost"
        colorScheme="red"
        size="sm"
        onClick={onRemove}
      >
        <TrashIcon />
      </IconButton>
    </Grid>
  )
}
```

**Validaciones**:
```typescript
function validateStaff(
  data: StaffFields,
  hasBooking: boolean
): ValidationError[] {
  const errors: ValidationError[] = []

  if (data.has_staff_requirements) {
    // Debe haber al menos 1 asignación
    if (data.staff_allocation.length === 0) {
      errors.push({
        field: 'staff_allocation',
        message: 'Debes agregar al menos un rol de personal',
        severity: 'error'
      })
    }

    // Validar cada asignación
    data.staff_allocation.forEach((allocation, index) => {
      // Rol requerido
      if (!allocation.role || allocation.role.trim().length === 0) {
        errors.push({
          field: `staff_allocation[${index}].role`,
          message: 'Ingresa el nombre del rol',
          severity: 'error'
        })
      }

      // Count >= 1
      if (!allocation.count || allocation.count < 1) {
        errors.push({
          field: `staff_allocation[${index}].count`,
          message: 'La cantidad debe ser al menos 1',
          severity: 'error'
        })
      }

      // Duration REQUIRED si booking activo
      if (hasBooking && !allocation.duration_minutes) {
        errors.push({
          field: `staff_allocation[${index}].duration_minutes`,
          message: 'La duración es requerida cuando el producto requiere reserva',
          severity: 'error'
        })
      }

      // Duration debe ser positivo si se provee
      if (allocation.duration_minutes && allocation.duration_minutes <= 0) {
        errors.push({
          field: `staff_allocation[${index}].duration_minutes`,
          message: 'La duración debe ser mayor a 0',
          severity: 'error'
        })
      }
    })
  }

  return errors
}
```

---

### 5. Booking Section

**Visibilidad**:
- ⚠️ `physical_product` (si capability `scheduling` activa) - RARO
- ✅ `service` (si capability `scheduling` activa) - MUY COMÚN
- ❌ `rental` - **NO APARECE** (maneja reservas en Asset Config > Availability)
- ❌ `digital` (no en MVP)
- ⚠️ `membership` (si capability `scheduling` activa) - para clases

**⚠️ IMPORTANTE - RENTAL**:
Para `rental` type, esta sección NO se renderiza. La funcionalidad de reservas está manejada completamente en **Asset Config Section > Availability**.

**Razón**: Rental inherentemente requiere reservas, por lo que la configuración está integrada en Asset Config con:
- `min_rental_duration_minutes` / `max_rental_duration_minutes`
- `buffer_time_minutes` (limpieza/inspección entre alquileres)
- `blackout_dates`
- `concurrent_capacity` (si múltiples unidades del mismo asset)

**Integración con Scheduling Module**:
```typescript
// TODO: Articular con módulo Scheduling
// Reutilizar interfaces, componentes UI (calendarios), y lógica de validación
// Ver: src/modules/scheduling/types/booking.ts
// Ver: src/modules/scheduling/components/BlackoutDatesPicker.tsx
```

**Campos**:
```typescript
interface BookingFields {
  requires_booking: boolean        // Toggle (solo para service/membership)
  booking_window_days: number      // Cuántos días de anticipación
  concurrent_capacity: number      // Cuántos pueden reservar al mismo tiempo
  min_advance_hours: number        // Mínimo de horas de anticipación
  max_advance_days: number         // Máximo de días de anticipación
  cancellation_policy?: string     // Política de cancelación
  buffer_time_minutes: number      // Tiempo de limpieza/preparación entre reservas (estandarizado a minutos)
}
```

**Layout**:
```tsx
<FormSection title="Configuración de Reservas">
  <Stack gap={4}>
    {/* Toggle (solo si NO es rental) */}
    {productType !== 'rental' && (
      <Field>
        <Switch
          checked={formData.requires_booking}
          onCheckedChange={(e) => handleChange('requires_booking', e.checked)}
        >
          Este producto requiere reserva previa
        </Switch>
        <HelperText>
          Los clientes deberán agendar una cita antes de adquirir el producto
        </HelperText>
      </Field>
    )}

    {(formData.requires_booking || productType === 'rental') && (
      <>
        {/* Ventana de reserva */}
        <Field label="Ventana de reserva" required>
          <InputGroup>
            <Input
              type="number"
              min="0"
              value={formData.booking_window_days}
              onChange={(e) => handleChange('booking_window_days', parseInt(e.target.value))}
            />
            <InputRightAddon>días</InputRightAddon>
          </InputGroup>
          <HelperText>
            Cuántos días hacia el futuro pueden reservar los clientes
          </HelperText>
        </Field>

        {/* Capacidad concurrente */}
        <Field label="Capacidad concurrente" required>
          <Input
            type="number"
            min="1"
            value={formData.concurrent_capacity}
            onChange={(e) => handleChange('concurrent_capacity', parseInt(e.target.value))}
          />
          <HelperText>
            Cuántos clientes pueden tener el mismo horario simultáneamente
          </HelperText>
        </Field>

        {/* Anticipación mínima */}
        <Field label="Anticipación mínima">
          <InputGroup>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={formData.min_advance_hours}
              onChange={(e) => handleChange('min_advance_hours', parseInt(e.target.value))}
            />
            <InputRightAddon>horas</InputRightAddon>
          </InputGroup>
          <HelperText>
            Mínimo de tiempo de anticipación para reservar
          </HelperText>
        </Field>

        {/* Anticipación máxima */}
        <Field label="Anticipación máxima">
          <InputGroup>
            <Input
              type="number"
              min="1"
              placeholder="30"
              value={formData.max_advance_days}
              onChange={(e) => handleChange('max_advance_days', parseInt(e.target.value))}
            />
            <InputRightAddon>días</InputRightAddon>
          </InputGroup>
          <HelperText>
            Máximo de tiempo de anticipación para reservar
          </HelperText>
        </Field>

        {/* Buffer time */}
        <Field label="Tiempo de buffer">
          <InputGroup>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={formData.buffer_time_minutes}
              onChange={(e) => handleChange('buffer_time_minutes', parseInt(e.target.value))}
            />
            <InputRightAddon>minutos</InputRightAddon>
          </InputGroup>
          <HelperText>
            Tiempo de limpieza/preparación entre reservas consecutivas
          </HelperText>
        </Field>

        {/* Política de cancelación */}
        <Field label="Política de cancelación">
          <SelectField
            placeholder="Selecciona una política"
            options={[
              { value: 'flexible', label: 'Flexible - Cancelación hasta 24h antes' },
              { value: 'moderate', label: 'Moderada - Cancelación hasta 48h antes' },
              { value: 'strict', label: 'Estricta - Cancelación hasta 7 días antes' },
              { value: 'no_refund', label: 'Sin reembolso' }
            ]}
            value={formData.cancellation_policy}
            onValueChange={(details) => handleChange('cancellation_policy', details.value[0])}
          />
        </Field>
      </>
    )}
  </Stack>
</FormSection>
```

**Validaciones**:
```typescript
function validateBooking(data: BookingFields): ValidationError[] {
  const errors: ValidationError[] = []

  if (data.requires_booking) {
    // Booking window requerido
    if (!data.booking_window_days || data.booking_window_days < 0) {
      errors.push({
        field: 'booking_window_days',
        message: 'Ingresa la ventana de reserva',
        severity: 'error'
      })
    }

    // Concurrent capacity >= 1
    if (!data.concurrent_capacity || data.concurrent_capacity < 1) {
      errors.push({
        field: 'concurrent_capacity',
        message: 'La capacidad debe ser al menos 1',
        severity: 'error'
      })
    }

    // Max advance debe ser >= min advance
    if (data.min_advance_hours && data.max_advance_days) {
      const minHours = data.min_advance_hours
      const maxHours = data.max_advance_days * 24
      if (minHours > maxHours) {
        errors.push({
          field: 'max_advance_days',
          message: 'La anticipación máxima debe ser mayor a la mínima',
          severity: 'error'
        })
      }
    }
  }

  return errors
}
```

---

## 💰 SECCIÓN FINAL: INTELLIGENT PRICING

### 6. Intelligent Pricing Section

**Visibilidad**: Siempre visible para todos los tipos
**Orden**: **ÚLTIMO** (después de todas las secciones de configuración)

**Propósito**:
- Calcular costo total automáticamente basado en materials + staff + overhead
- Sugerir precio basado en margen deseado
- Permitir override manual
- Prevenir pricing por debajo del costo

**Campos**:
```typescript
interface IntelligentPricingFields {
  // Costos calculados automáticamente (read-only)
  calculated_cost: {
    materials: number      // De Materials Section
    labor: number          // De Staff Section
    overhead: number       // De Production Section (si aplica)
    total: number          // Sum of above
  }

  // Configuración de margen (usuario elige)
  pricing_strategy: 'cost_plus' | 'market_based' | 'manual'
  target_margin_percentage?: number  // Para cost_plus

  // Precio final (puede ser sugerido o manual)
  price: number                      // REQUIRED
  is_manual_override: boolean        // Si usuario sobrescribió sugerencia

  // Opcionales
  compare_at_price?: number
  tax_included?: boolean

  // Para rentals
  pricing_model?: 'hourly' | 'daily' | 'weekly' | 'monthly'
  rental_rates?: {
    hourly?: number
    daily?: number
    weekly?: number
    monthly?: number
  }

  // Para memberships
  billing_cycle?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  recurring_price?: number
  trial_period_days?: number
}
```

**Layout - Standard/Service/Digital**:
```tsx
<FormSection title="Precio y Margen">
  <Stack gap={4}>
    {/* Resumen de costos calculados */}
    <Card variant="outline" bg="gray.50">
      <CardBody>
        <Stack gap={2}>
          <Text fontWeight="bold" fontSize="lg">Costos Calculados</Text>

          <HStack justify="space-between">
            <Text fontSize="sm">Materiales:</Text>
            <Text fontWeight="medium">
              ${formData.calculated_cost.materials.toFixed(2)}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="sm">Mano de obra:</Text>
            <Text fontWeight="medium">
              ${formData.calculated_cost.labor.toFixed(2)}
            </Text>
          </HStack>

          {formData.calculated_cost.overhead > 0 && (
            <HStack justify="space-between">
              <Text fontSize="sm">Overhead (producción):</Text>
              <Text fontWeight="medium">
                ${formData.calculated_cost.overhead.toFixed(2)}
              </Text>
            </HStack>
          )}

          <Divider />

          <HStack justify="space-between">
            <Text fontWeight="bold">Costo Total:</Text>
            <Text fontWeight="bold" fontSize="lg" color="blue.600">
              ${formData.calculated_cost.total.toFixed(2)}
            </Text>
          </HStack>
        </Stack>
      </CardBody>
    </Card>

    {/* Estrategia de pricing */}
    <Field label="Estrategia de pricing" required>
      <RadioGroup
        value={formData.pricing_strategy}
        onValueChange={(details) => handlePricingStrategyChange(details.value)}
      >
        <Stack gap={3}>
          {/* Cost Plus (recomendado) */}
          <Card
            variant="outline"
            borderColor={formData.pricing_strategy === 'cost_plus' ? 'purple.500' : 'gray.200'}
            cursor="pointer"
          >
            <CardBody>
              <Radio value="cost_plus">
                <Stack gap={1}>
                  <HStack>
                    <Text fontWeight="bold">Costo + Margen</Text>
                    <Badge colorScheme="purple">Recomendado</Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Define tu margen deseado y el sistema calcula el precio
                  </Text>
                </Stack>
              </Radio>

              {formData.pricing_strategy === 'cost_plus' && (
                <Stack gap={2} mt={3}>
                  <Field label="Margen objetivo">
                    <HStack>
                      <Input
                        type="number"
                        min="0"
                        max="1000"
                        step="5"
                        value={formData.target_margin_percentage}
                        onChange={(e) => handleChange('target_margin_percentage', parseFloat(e.target.value))}
                      />
                      <InputRightAddon>%</InputRightAddon>
                    </HStack>
                  </Field>

                  {/* Sugerencias de margen */}
                  <HStack gap={2}>
                    <Text fontSize="xs" color="gray.600">Sugerencias:</Text>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleChange('target_margin_percentage', 30)}
                    >
                      30% (Bajo)
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleChange('target_margin_percentage', 50)}
                    >
                      50% (Normal)
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleChange('target_margin_percentage', 100)}
                    >
                      100% (Premium)
                    </Button>
                  </HStack>

                  {/* Precio calculado */}
                  {formData.target_margin_percentage && (
                    <Alert status="success" variant="subtle">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="bold">
                          Precio sugerido: ${calculateSuggestedPrice(
                            formData.calculated_cost.total,
                            formData.target_margin_percentage
                          )}
                        </Text>
                        <Text fontSize="sm">
                          Ganancia: ${(
                            calculateSuggestedPrice(formData.calculated_cost.total, formData.target_margin_percentage) -
                            formData.calculated_cost.total
                          ).toFixed(2)}
                        </Text>
                      </Box>
                    </Alert>
                  )}
                </Stack>
              )}
            </CardBody>
          </Card>

          {/* Market Based */}
          <Card
            variant="outline"
            borderColor={formData.pricing_strategy === 'market_based' ? 'purple.500' : 'gray.200'}
            cursor="pointer"
          >
            <CardBody>
              <Radio value="market_based">
                <Stack gap={1}>
                  <Text fontWeight="bold">Basado en Mercado</Text>
                  <Text fontSize="sm" color="gray.600">
                    Define precio según competencia (ignora costos)
                  </Text>
                </Stack>
              </Radio>

              {formData.pricing_strategy === 'market_based' && (
                <Alert status="warning" variant="subtle" mt={3}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    ⚠️ Asegúrate de que tu precio cubra los costos (${formData.calculated_cost.total.toFixed(2)})
                  </Text>
                </Alert>
              )}
            </CardBody>
          </Card>

          {/* Manual */}
          <Card
            variant="outline"
            borderColor={formData.pricing_strategy === 'manual' ? 'purple.500' : 'gray.200'}
            cursor="pointer"
          >
            <CardBody>
              <Radio value="manual">
                <Stack gap={1}>
                  <Text fontWeight="bold">Manual</Text>
                  <Text fontSize="sm" color="gray.600">
                    Ingresar precio directamente sin cálculos
                  </Text>
                </Stack>
              </Radio>
            </CardBody>
          </Card>
        </Stack>
      </RadioGroup>
    </Field>

    {/* Campo de precio final */}
    <Field label="Precio de venta" required>
      <InputGroup>
        <InputLeftAddon>$</InputLeftAddon>
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={formData.price}
          onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
          fontSize="lg"
          fontWeight="bold"
        />
      </InputGroup>

      {/* Warnings si precio < costo */}
      {formData.price && formData.price < formData.calculated_cost.total && (
        <Alert status="error" variant="left-accent" mt={2}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">¡Precio por debajo del costo!</Text>
            <Text fontSize="sm">
              Estarías perdiendo ${(formData.calculated_cost.total - formData.price).toFixed(2)} por unidad
            </Text>
          </Box>
        </Alert>
      )}

      {/* Info si precio está ok */}
      {formData.price && formData.price >= formData.calculated_cost.total && (
        <Alert status="success" variant="subtle" mt={2}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">
              Margen: {calculateMarginPercentage(formData.price, formData.calculated_cost.total)}%
            </Text>
            <Text fontSize="sm">
              Ganancia neta: ${(formData.price - formData.calculated_cost.total).toFixed(2)} por unidad
            </Text>
          </Box>
        </Alert>
      )}
    </Field>

    {/* Precio de comparación (opcional) */}
    <Field label="Precio de comparación (opcional)">
      <InputGroup>
        <InputLeftAddon>$</InputLeftAddon>
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Ej: precio antes de descuento"
          value={formData.compare_at_price}
          onChange={(e) => handleChange('compare_at_price', parseFloat(e.target.value))}
        />
      </InputGroup>
      <HelperText>
        Se mostrará tachado para resaltar el descuento
      </HelperText>
    </Field>

    {/* Impuestos incluidos */}
    <Field>
      <Switch
        checked={formData.tax_included}
        onCheckedChange={(e) => handleChange('tax_included', e.checked)}
      >
        El precio incluye impuestos
      </Switch>
    </Field>

    {/* Botón para aplicar sugerencia automática */}
    {formData.pricing_strategy === 'cost_plus' &&
     formData.target_margin_percentage &&
     !formData.is_manual_override && (
      <Button
        colorScheme="purple"
        variant="outline"
        onClick={handleApplySuggestedPrice}
      >
        Aplicar Precio Sugerido (${calculateSuggestedPrice(
          formData.calculated_cost.total,
          formData.target_margin_percentage
        )})
      </Button>
    )}
  </Stack>
</FormSection>
```

**Funciones de cálculo**:
```typescript
/**
 * Calcula el costo total del producto
 */
function calculateTotalCost(formData: ProductFormData): number {
  let total = 0

  // Costo de materiales
  if (formData.has_materials && formData.components) {
    total += formData.components.reduce((sum, comp) => {
      return sum + (comp.quantity * (comp.cost_per_unit || 0))
    }, 0)
  }

  // Costo de labor
  if (formData.has_staff_requirements && formData.staff_allocation) {
    total += formData.staff_allocation.reduce((sum, staff) => {
      const hours = staff.duration_minutes / 60
      const cost = (staff.hourly_rate || 0) * hours * staff.count
      return sum + cost
    }, 0)
  }

  // Overhead de producción (si aplica)
  if (formData.requires_production && formData.production_overhead_rate) {
    total += formData.production_overhead_rate
  }

  return total
}

/**
 * Calcula precio sugerido basado en costo + margen
 */
function calculateSuggestedPrice(cost: number, marginPercentage: number): string {
  // Fórmula: Precio = Costo / (1 - Margen/100)
  const price = cost / (1 - marginPercentage / 100)
  return price.toFixed(2)
}

/**
 * Calcula margen porcentual dado precio y costo
 */
function calculateMarginPercentage(price: number, cost: number): string {
  if (price === 0) return '0'
  const margin = ((price - cost) / price) * 100
  return margin.toFixed(1)
}

/**
 * Handler cuando usuario cambia estrategia de pricing
 */
function handlePricingStrategyChange(strategy: string) {
  setFormData(prev => ({
    ...prev,
    pricing_strategy: strategy,
    is_manual_override: false
  }))

  // Si cambia a cost_plus, aplicar sugerencia automática
  if (strategy === 'cost_plus' && prev.target_margin_percentage) {
    const suggested = calculateSuggestedPrice(
      prev.calculated_cost.total,
      prev.target_margin_percentage
    )
    setFormData(prev => ({
      ...prev,
      price: parseFloat(suggested)
    }))
  }
}

/**
 * Handler cuando usuario cambia precio manualmente
 */
function handlePriceChange(price: number) {
  setFormData(prev => ({
    ...prev,
    price,
    is_manual_override: true  // Marca que fue override manual
  }))
}

/**
 * Aplicar precio sugerido
 */
function handleApplySuggestedPrice() {
  const suggested = calculateSuggestedPrice(
    formData.calculated_cost.total,
    formData.target_margin_percentage!
  )
  setFormData(prev => ({
    ...prev,
    price: parseFloat(suggested),
    is_manual_override: false
  }))
}
```

**React Effect para recalcular costos automáticamente**:
```typescript
// Hook para recalcular costos cada vez que cambian materials o staff
useEffect(() => {
  const totalCost = calculateTotalCost(formData)

  setFormData(prev => ({
    ...prev,
    calculated_cost: {
      materials: calculateMaterialsCost(prev.components),
      labor: calculateLaborCost(prev.staff_allocation),
      overhead: prev.production_overhead_rate || 0,
      total: totalCost
    }
  }))

  // Si está en modo cost_plus, recalcular precio sugerido
  if (formData.pricing_strategy === 'cost_plus' &&
      formData.target_margin_percentage &&
      !formData.is_manual_override) {
    const suggested = calculateSuggestedPrice(
      totalCost,
      formData.target_margin_percentage
    )
    setFormData(prev => ({
      ...prev,
      price: parseFloat(suggested)
    }))
  }
}, [
  formData.components,
  formData.staff_allocation,
  formData.production_overhead_rate,
  formData.target_margin_percentage
])
```

**Validaciones**:
```typescript
function validateIntelligentPricing(
  data: IntelligentPricingFields
): ValidationError[] {
  const errors: ValidationError[] = []

  // Precio requerido
  if (!data.price || data.price <= 0) {
    errors.push({
      field: 'price',
      message: 'El precio debe ser mayor a 0',
      severity: 'error'
    })
  }

  // WARNING si precio < costo (no bloqueante, solo warning)
  if (data.price && data.calculated_cost.total > 0 &&
      data.price < data.calculated_cost.total) {
    errors.push({
      field: 'price',
      message: `Precio por debajo del costo. Pérdida: $${(data.calculated_cost.total - data.price).toFixed(2)} por unidad`,
      severity: 'warning',
      allowOverride: true
    })
  }

  // Si cost_plus, margen requerido
  if (data.pricing_strategy === 'cost_plus' && !data.target_margin_percentage) {
    errors.push({
      field: 'target_margin_percentage',
      message: 'Ingresa el margen deseado',
      severity: 'error'
    })
  }

  return errors
}
```

---

## 🎯 BENEFICIOS DE INTELLIGENT PRICING

### 1. **Asistencia Inteligente**
- Sistema calcula costo total automáticamente
- Sugiere precio basado en margen deseado
- Usuario no necesita hacer cálculos manuales

### 2. **Prevención de Errores**
- Alerts si precio está por debajo del costo
- Muestra ganancia neta en tiempo real
- Calcula margen automáticamente

### 3. **Flexibilidad**
- Usuario puede elegir estrategia (cost_plus, market, manual)
- Puede override sugerencias
- Sistema recalcula automáticamente si cambian componentes

### 4. **Transparencia**
- Desglose claro de costos (materials, labor, overhead)
- Muestra cómo se llegó al precio sugerido
- Usuario entiende de dónde vienen los números

### 5. **Progressive Disclosure**
- Primero define QUÉ lleva el producto (materials, staff)
- Sistema calcula CUÁNTO cuesta
- Finalmente define CUÁNTO cobrar
- Orden lógico y natural

---

**CONTINUARÁ EN PARTE 2...**

Próximo: Secciones especializadas (Production, Digital Delivery, Asset Config, Rental Terms, Recurring Config)
