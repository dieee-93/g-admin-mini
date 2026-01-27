# Customer Address Manager

Sistema completo de gestión de direcciones para clientes con geocoding automático y visualización en mapas.

## 📦 Componentes

### 1. CustomerAddressManager
Componente principal que gestiona todas las direcciones de un cliente.

**Características:**
- ✅ Lista de direcciones ordenadas (default first)
- ✅ CRUD completo (Crear, Editar, Eliminar)
- ✅ Marcar dirección como predeterminada
- ✅ Vista de mapa integrada
- ✅ Indicadores de estado (verificada, por defecto)
- ✅ Estadísticas de uso

**Props:**
```typescript
interface CustomerAddressManagerProps {
  customerId: string;  // ID del cliente (requerido)
  readOnly?: boolean;  // Modo solo lectura (default: false)
}
```

**Uso:**
```tsx
import { CustomerAddressManager } from '@/pages/admin/core/crm/customers/components';

<CustomerAddressManager customerId={customer.id} />
```

### 2. AddressFormModal
Modal para agregar/editar direcciones con geocoding automático.

**Características:**
- ✅ Geocoding automático con debounce (1.5s)
- ✅ Soporte para Georef AR, USIG y Nominatim
- ✅ Validación de campos
- ✅ Selector de provincias argentinas
- ✅ Instrucciones de delivery
- ✅ Marca como dirección predeterminada

**Geocoding Providers:**
1. **Georef AR** (Prioridad 1) - Gobierno de Argentina
2. **USIG** (Prioridad 2) - Solo CABA
3. **Nominatim** (Fallback) - OpenStreetMap

**Props:**
```typescript
interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  address?: CustomerAddress | null;  // Para modo edición
  onSuccess: () => void;
}
```

**Campos del formulario:**
- `label` - Etiqueta (Ej: Casa, Trabajo) *requerido
- `address_line_1` - Dirección principal *requerido
- `address_line_2` - Piso/Depto (opcional)
- `city` - Ciudad
- `state` - Provincia
- `postal_code` - Código postal
- `delivery_instructions` - Instrucciones de entrega
- `is_default` - Marcar como predeterminada

### 3. AddressMapPreview
Vista de mapa con Leaflet para visualizar direcciones.

**Características:**
- ✅ Múltiples marcadores
- ✅ Auto-fit bounds
- ✅ Marcador verde para dirección seleccionada
- ✅ Popups informativos
- ✅ OpenStreetMap tiles
- ✅ Coordenadas en formato [lat, lng]

**Props:**
```typescript
interface AddressMapPreviewProps {
  addresses: CustomerAddress[];
  selectedAddress: CustomerAddress | null;
  height?: string;  // Default: '300px'
}
```

## 🗺️ Integración con Leaflet

El sistema usa **react-leaflet** y es 100% compatible con el módulo de delivery existente.

**Coordenadas:**
- Formato: `[latitude, longitude]`
- SRID: 4326 (WGS84)
- Georef AR: `{ lat, lon }`
- USIG: `{ x: lng, y: lat }` (invertido, ya manejado)
- Nominatim: `{ lat, lon }`

## 🔄 Flujo de Trabajo

### Crear Cliente
```
1. Usuario crea cliente nuevo
2. Modal muestra alerta: "Podrás agregar direcciones después"
3. Se crea cliente → onSuccess → Modal se cierra
4. Usuario puede editar cliente para agregar direcciones
```

### Editar Cliente (Agregar Direcciones)
```
1. Usuario edita cliente
2. Modal muestra tabs: "Información Básica" | "📍 Direcciones"
3. Usuario va a tab "Direcciones"
4. Click en "Agregar" → AddressFormModal
5. Usuario ingresa dirección
6. Geocoding automático (debounce 1.5s)
7. Sistema muestra coordenadas + proveedor
8. Usuario guarda → Dirección en DB con lat/lng
9. Mapa se actualiza automáticamente
```

### Geocoding Flow
```
Usuario escribe dirección
    ↓
Debounce 1.5s
    ↓
1. Intento con Georef AR
    ├─ ✅ Éxito → Guardar con provider: 'georef', confidence: 'high'
    └─ ❌ Fallo → Continuar
           ↓
2. Si estado === 'CABA' → Intento con USIG
    ├─ ✅ Éxito → Guardar con provider: 'usig', confidence: 'high'
    └─ ❌ Fallo → Continuar
           ↓
3. Fallback a Nominatim (rate limit 1/s)
    ├─ ✅ Éxito → Guardar con provider: 'nominatim', confidence: 'medium'
    └─ ❌ Fallo → Guardar sin coordenadas (is_verified: false)
```

## 📊 Estructura de Datos

### customer_addresses table
```sql
id                     uuid PRIMARY KEY
customer_id            uuid NOT NULL (FK → customers.id)
label                  varchar NOT NULL DEFAULT 'Casa'
address_line_1         text NOT NULL
address_line_2         text
city                   varchar DEFAULT 'Buenos Aires'
state                  varchar DEFAULT 'CABA'
postal_code            varchar
country                varchar DEFAULT 'Argentina'

-- Geocoding
latitude               numeric
longitude              numeric
formatted_address      text
is_verified            boolean DEFAULT false

-- Metadata
delivery_instructions  text
is_default             boolean DEFAULT false
last_used_at           timestamptz
usage_count            integer DEFAULT 0
created_at             timestamptz DEFAULT now()
updated_at             timestamptz DEFAULT now()
```

## 🎨 UX Features

### Indicadores Visuales
- 🟢 **Verde "Por defecto"** - Dirección predeterminada
- ✓ **Azul "Verificada"** - Geocodificada exitosamente
- 📍 **Coordenadas** - Lat/Lng mostradas en formato legible
- 📋 **Instrucciones** - Visibles en lista y mapa

### Interacciones
- Click en tarjeta → Selecciona dirección en mapa
- Marcador verde → Dirección seleccionada
- Auto-zoom → Fit bounds al cambiar selección
- Popups informativos → Toda la info en el mapa

## 🔌 Integración en CustomerForm

### Modo Creación
```tsx
<CustomerForm onSuccess={handleSuccess} />
```
- Muestra alerta informativa sobre direcciones
- No muestra tab de direcciones (no hay customer_id aún)

### Modo Edición
```tsx
<CustomerForm customer={customer} onSuccess={handleSuccess} />
```
- Muestra tabs: "Información Básica" | "📍 Direcciones"
- CustomerAddressManager en tab "Direcciones"
- Gestión completa de direcciones

## 🚀 Próximos Pasos Sugeridos

1. **Integración con Delivery**
   - Usar `getAddressCoordinates()` helper
   - Auto-seleccionar dirección en pedidos
   - Calcular zonas de delivery

2. **Validación de Zonas**
   - Verificar si dirección está en zona de delivery
   - Calcular costo de envío por zona
   - Alertar si está fuera de cobertura

3. **Historial de Direcciones**
   - Registrar `last_used_at` en cada pedido
   - Incrementar `usage_count`
   - Sugerir direcciones frecuentes

4. **Geocoding Reverso**
   - Click en mapa → Obtener dirección
   - Útil para correcciones manuales

## 📝 Ejemplo Completo

```tsx
import { useState } from 'react';
import { CustomerAddressManager } from '@/pages/admin/core/crm/customers/components';
import { getAddressCoordinates } from '@/pages/admin/core/crm/customers/utils';

function MyComponent({ customer }) {
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Obtener coordenadas para delivery
  const coords = getAddressCoordinates(selectedAddress);

  return (
    <div>
      <CustomerAddressManager customerId={customer.id} />

      {coords && (
        <p>Coordenadas: {coords[0]}, {coords[1]}</p>
      )}
    </div>
  );
}
```

## 🐛 Troubleshooting

### Geocoding no funciona
- Verificar conexión a internet
- Revisar console para errores de API
- Nominatim tiene rate limit de 1 req/segundo

### Mapa no se muestra
- Verificar que hay direcciones con lat/lng
- Revisar importación de `leaflet/dist/leaflet.css`
- Comprobar que Leaflet está instalado

### Dirección no se guarda
- Verificar que `customer_id` existe
- Revisar console para errores de Supabase
- Validar que `address_line_1` no esté vacío
