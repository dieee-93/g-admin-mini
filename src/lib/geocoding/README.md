# Servicio de Geocoding para Argentina

Sistema de geocodificación en cascada optimizado para direcciones argentinas, con soporte completo para Leaflet.js.

## 🎯 Características

- ✅ **Geocodificación en cascada**: Georef AR → USIG → Nominatim
- ✅ **Compatible con Leaflet**: Coordenadas en formato `[lat, lng]`
- ✅ **Optimizado para Argentina**: APIs oficiales del gobierno
- ✅ **Alta precisión en CABA**: Integración con USIG Buenos Aires
- ✅ **Rate limiting automático**: Respeta límites de APIs gratuitas
- ✅ **Background processing**: Geocodificación asíncrona sin bloquear UI
- ✅ **Batch geocoding**: Procesa múltiples direcciones

## 📚 APIs Utilizadas

### 1. Georef AR (Prioridad 1)
- **Proveedor**: Gobierno de Argentina
- **Cobertura**: Todo Argentina
- **Precisión**: Alta para direcciones argentinas
- **Costo**: Gratis
- **Rate Limit**: Sin límite documentado
- **Docs**: https://apis.datos.gob.ar/georef/

### 2. USIG (Prioridad 2, solo CABA)
- **Proveedor**: Gobierno de Buenos Aires
- **Cobertura**: Ciudad Autónoma de Buenos Aires
- **Precisión**: Muy alta en CABA
- **Costo**: Gratis
- **Rate Limit**: Sin límite documentado
- **Docs**: https://usig.buenosaires.gob.ar/

### 3. Nominatim (Fallback)
- **Proveedor**: OpenStreetMap
- **Cobertura**: Global
- **Precisión**: Media en Argentina
- **Costo**: Gratis
- **Rate Limit**: 1 request/segundo
- **Docs**: https://nominatim.org/

## 🚀 Uso Básico

### Geocodificar una dirección

```typescript
import { GeocodingService } from '@/services/geocoding';

const result = await GeocodingService.geocodeAddress({
  address_line_1: 'Av. Corrientes 1234',
  city: 'Buenos Aires',
  state: 'CABA'
});

console.log(result);
// {
//   latitude: -34.6037,
//   longitude: -58.3816,
//   formatted_address: "Av. Corrientes 1234, CABA, Argentina",
//   confidence: 'high',
//   provider: 'georef'
// }
```

### Geocodificar y guardar en DB

```typescript
import { GeocodingService } from '@/services/geocoding';

// Después de crear un customer_address
const addressId = 'uuid-here';

await GeocodingService.geocodeAndUpdate(addressId, {
  address_line_1: 'Av. Corrientes 1234',
  city: 'Buenos Aires',
  state: 'CABA'
});

// La dirección ahora tiene latitude, longitude, formatted_address y is_verified=true
```

### Batch geocoding (migración de datos)

```typescript
import { GeocodingService } from '@/services/geocoding';

const addresses = [
  { id: 'uuid-1', data: { address_line_1: 'Calle 1', city: 'Buenos Aires' } },
  { id: 'uuid-2', data: { address_line_1: 'Calle 2', city: 'Córdoba' } },
];

await GeocodingService.batchGeocode(addresses);
```

## 🗺️ Integración con Leaflet

### Mostrar dirección en mapa

```tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getDefaultAddress, getAddressCoordinates } from '@/pages/admin/core/crm/customers/utils';

function CustomerAddressMap({ customer }: { customer: Customer }) {
  const address = getDefaultAddress(customer);
  const coords = getAddressCoordinates(address);

  if (!coords) {
    return <div>Dirección no geocodificada</div>;
  }

  return (
    <MapContainer
      center={coords}
      zoom={15}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <Marker position={coords}>
        <Popup>{address.formatted_address}</Popup>
      </Marker>
    </MapContainer>
  );
}
```

## 🔧 Utilidades

### Validar coordenadas

```typescript
import { GeocodingService } from '@/services/geocoding';

const isValid = GeocodingService.isValidArgentinaCoordinates(-34.6037, -58.3816);
// true - coordenadas dentro de Argentina
```

### Calcular distancia

```typescript
import { GeocodingService } from '@/services/geocoding';

const distance = GeocodingService.calculateDistance(
  -34.6037, -58.3816,  // Punto A
  -34.5872, -58.4036   // Punto B
);

console.log(`${distance.toFixed(2)} km`); // "2.45 km"
```

## 📋 Esquema de Base de Datos

La tabla `customer_addresses` ya está configurada con:

```sql
CREATE TABLE customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  label varchar NOT NULL DEFAULT 'Casa',
  address_line_1 text NOT NULL,
  address_line_2 text,
  city varchar DEFAULT 'Buenos Aires',
  state varchar DEFAULT 'CABA',
  postal_code varchar,
  country varchar DEFAULT 'Argentina',

  -- Campos de geocoding
  latitude numeric,
  longitude numeric,
  formatted_address text,
  is_verified boolean DEFAULT false,

  -- Metadatos
  delivery_instructions text,
  is_default boolean DEFAULT false,
  last_used_at timestamptz,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para rendimiento
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_customer_addresses_is_default ON customer_addresses(customer_id, is_default) WHERE is_default = true;
CREATE INDEX idx_customer_addresses_coordinates ON customer_addresses(latitude, longitude) WHERE latitude IS NOT NULL;
```

## 🎨 Helpers de Dirección

```typescript
import {
  getDefaultAddress,
  getAddressDisplay,
  getShortAddressDisplay,
  getAddressCoordinates,
  isAddressGeocoded
} from '@/pages/admin/core/crm/customers/utils';

const customer: Customer = { /* ... */ };

// Obtener dirección por defecto
const address = getDefaultAddress(customer);

// Mostrar en UI
getAddressDisplay(address);
// "Av. Corrientes 1234, Piso 5, C1043 CABA, Argentina"

getShortAddressDisplay(address);
// "Av. Corrientes 1234, CABA"

// Para Leaflet
const coords = getAddressCoordinates(address);
// [lat, lng] o null

// Verificar si tiene coordenadas
if (isAddressGeocoded(address)) {
  // Mostrar mapa
}
```

## ⚠️ Consideraciones

### Rate Limits

- **Georef AR**: Sin límite documentado
- **USIG**: Sin límite documentado
- **Nominatim**: 1 request/segundo (automáticamente respetado)

### Precisión por Provider

| Provider | Argentina | CABA | Internacional |
|----------|-----------|------|---------------|
| Georef   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ |
| USIG     | ❌ | ⭐⭐⭐⭐⭐ | ❌ |
| Nominatim| ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

### Errores Comunes

**USIG devuelve coordenadas invertidas**
```typescript
// ✅ CORRECTO (ya manejado internamente)
latitude: parseFloat(data.coordenadas.y)
longitude: parseFloat(data.coordenadas.x)

// ❌ INCORRECTO
latitude: parseFloat(data.coordenadas.x)  // NO!
```

**Nominatim requiere User-Agent**
```typescript
// Ya configurado en el servicio
headers: {
  'User-Agent': 'G-Admin-Mini/1.0'
}
```

## 🔄 Flujo de Trabajo Recomendado

1. **Usuario crea dirección** → Se guarda sin coordenadas
2. **Background job geocodifica** → Actualiza lat/lng + formatted_address
3. **Frontend muestra** → Usa formatted_address si existe, sino address_line_1
4. **Delivery/Maps** → Usa coordenadas si is_verified=true

## 📊 Monitoreo

```typescript
// El servicio registra logs automáticamente
logger.info('Geocoding address', { address });
logger.info('Geocoding successful with Georef', { result });
logger.warn('Georef geocoding failed', { error });
```

## 🚀 Próximos Pasos

- [ ] Integrar con módulo de delivery para cálculo de rutas
- [ ] Agregar geocoding reverso (coordenadas → dirección)
- [ ] Crear UI para editar/verificar coordenadas manualmente
- [ ] Implementar caché de resultados de geocoding
- [ ] Agregar soporte para zonas de delivery

## 📝 Ejemplos Completos

Ver:
- `/src/pages/admin/operations/fulfillment/delivery/` - Implementación con Leaflet
- `/src/pages/admin/core/crm/customers/` - Gestión de direcciones de clientes
