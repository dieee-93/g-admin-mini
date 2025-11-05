# 📍 Sistema de Direcciones Múltiples - Customer Module

**Created**: 2025-01-15
**Status**: ✅ IMPLEMENTED (Foundation)
**Integration**: Delivery Module

---

## 📋 Descripción General

El módulo Customers ahora soporta **múltiples direcciones de entrega por cliente** con capacidades de geocoding para integración con el módulo Delivery. Cada cliente puede tener varias direcciones (Casa, Trabajo, Oficina, etc.) con coordenadas GPS y metadatos específicos para entregas.

---

## 🗄️ Base de Datos

### Nueva Tabla: `customer_addresses`

```sql
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,

  -- Address Information
  label VARCHAR(100) DEFAULT 'Casa',
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city VARCHAR(100) DEFAULT 'Buenos Aires',
  state VARCHAR(100) DEFAULT 'CABA',
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Argentina',

  -- Geocoded Coordinates
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  formatted_address TEXT,

  -- Delivery Metadata
  delivery_instructions TEXT,
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,

  -- Usage Tracking
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 TypeScript Types

```typescript
export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  address_line_1: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  formatted_address?: string;
  delivery_instructions?: string;
  is_default: boolean;
  is_verified: boolean;
  last_used_at?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}
```

---

## ⚙️ API Service Functions

```typescript
// Fetch
getCustomerAddresses(customerId)
getCustomerDefaultAddress(customerId)
getAddressById(addressId)

// CRUD
createCustomerAddress(data)
updateCustomerAddress(data)
deleteCustomerAddress(addressId)

// Geocoding
updateAddressCoordinates(addressId, lat, lng, formatted)

// Tracking
incrementAddressUsage(addressId)

// Batch
getAddressesByIds(addressIds)
getAddressesNearby(lat, lng, radiusKm)
```

---

## 🔌 Integración con Delivery

```typescript
// Delivery transformer usa direcciones del customer
const customerAddress = await getCustomerDefaultAddress(sale.customer_id);

return {
  customer_address_id: customerAddress?.id,
  delivery_latitude: customerAddress?.latitude,
  delivery_longitude: customerAddress?.longitude,
  delivery_instructions: customerAddress?.delivery_instructions
};
```

---

## 📊 Casos de Uso

### 1. Múltiples direcciones
```typescript
const addresses = await getCustomerAddresses(customerId);
// [Casa (default), Trabajo, Casa fin de semana]
```

### 2. Crear dirección
```typescript
await createCustomerAddress({
  customer_id: 'uuid',
  label: 'Oficina',
  address_line_1: 'Av. Santa Fe 3000',
  city: 'Buenos Aires'
});
```

### 3. Geocodificar (Phase 4)
```typescript
const geocoded = await geocodingService.geocodeAddress(address);
await updateAddressCoordinates(id, geocoded.lat, geocoded.lng);
```

---

## ✅ Estado Actual

- [x] Tabla en Supabase
- [x] TypeScript types
- [x] API service completo
- [x] Integración con Delivery
- [x] 3 direcciones migradas
- [x] UI Components (`CustomerAddressManager`, `CustomerAddressFormModal`)
- [ ] Google Maps integration (Phase 4)

---

## 🎨 UI Components

### CustomerAddressManager
Componente principal para gestionar direcciones de un cliente.

**Uso**:
```tsx
import { CustomerAddressManager } from '@/pages/admin/core/crm/customers/components';

<CustomerAddressManager customerId={customer.id} />
```

**Características**:
- Lista todas las direcciones del cliente
- Badge "Predeterminada" para la dirección por defecto
- Botones de editar/eliminar para cada dirección
- Botón "Agregar Dirección" en el header
- Estado vacío cuando no hay direcciones
- Muestra coordenadas GPS si están disponibles
- Muestra estadísticas de uso (cantidad de veces usada)

### CustomerAddressFormModal
Modal para crear/editar direcciones.

**Uso**:
```tsx
import { CustomerAddressFormModal } from '@/pages/admin/core/crm/customers/components';

<CustomerAddressFormModal
  isOpen={isOpen}
  onClose={handleClose}
  customerId={customer.id}
  address={editingAddress} // undefined para crear nueva
  onSaved={handleSaved}
/>
```

**Campos**:
- Etiqueta (requerido): Casa, Trabajo, etc.
- Dirección (requerido): Calle, número, piso
- Complemento: Referencias adicionales
- Ciudad: Opcional
- Instrucciones de entrega: Textarea para detalles
- Checkbox: Establecer como predeterminada

**Validación**:
- Etiqueta y dirección son obligatorios
- Notificaciones de éxito/error
- Estados de carga durante guardado
- Auto-unset de otras direcciones predeterminadas

---

Ver documentación completa en: `system-architecture-master-plan/CUSTOMER_DELIVERY_INTEGRATION.md`
