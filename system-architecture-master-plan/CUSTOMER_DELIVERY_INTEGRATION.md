# 🏠📍 CUSTOMER ↔ DELIVERY INTEGRATION

**Created**: 2025-01-15
**Status**: ✅ IMPLEMENTED
**Integration Type**: Customer Addresses → Delivery Geocoding

---

## 📋 OVERVIEW

Integration between **Customers module** and **Delivery module** to enable:
- Multiple delivery addresses per customer
- Geocoded coordinates (lat/lng) for routing
- Address reuse across orders
- Delivery-specific instructions per address

---

## 🗄️ DATABASE SCHEMA

### **New Table: `customer_addresses`**

```sql
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Address Info
  label VARCHAR(100) NOT NULL DEFAULT 'Casa',  -- "Casa", "Trabajo", "Oficina"
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city VARCHAR(100) DEFAULT 'Buenos Aires',
  state VARCHAR(100) DEFAULT 'CABA',
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Argentina',

  -- Geocoded Coordinates (from Google Maps API - Phase 4)
  latitude DECIMAL(10, 8),      -- e.g., -34.6037232
  longitude DECIMAL(11, 8),     -- e.g., -58.3815932
  formatted_address TEXT,        -- Normalized by Google Geocoding API

  -- Delivery-Specific
  delivery_instructions TEXT,    -- "Timbre roto, llamar al celular"
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,  -- Verified by successful delivery

  -- Usage Tracking
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Updated Table: `delivery_orders`**

Added columns:
```sql
ALTER TABLE delivery_orders
  ADD COLUMN customer_address_id UUID REFERENCES customer_addresses(id),
  ADD COLUMN delivery_latitude DECIMAL(10, 8),
  ADD COLUMN delivery_longitude DECIMAL(11, 8),
  ADD COLUMN delivery_instructions TEXT;
```

---

## 📁 FILE STRUCTURE

```
src/
├── pages/admin/core/crm/customers/
│   ├── types/
│   │   ├── customer.ts                          # ✅ Existing
│   │   ├── customerAddress.ts                   # 🆕 NEW - Address types
│   │   └── index.ts                             # ✅ Updated - exports
│   └── services/
│       └── customerAddressesApi.ts              # 🆕 NEW - CRUD operations
│
└── pages/admin/operations/delivery/
    └── utils/
        └── deliveryTransformer.ts               # 🔄 REFACTORED - async, uses addresses
```

---

## 🔌 INTEGRATION POINTS

### **1. Delivery Transformer (deliveryTransformer.ts)**

**BEFORE** (Phase 3):
```typescript
export function transformSaleToDeliveryOrder(sale: Sale): DeliveryOrder | null {
  return {
    // ...
    delivery_address: sale.customer?.address || 'N/A',
    delivery_coordinates: { lat: -34.6037, lng: -58.3816 }, // Hardcoded!
    delivery_instructions: undefined
  };
}
```

**AFTER** (Current):
```typescript
export async function transformSaleToDeliveryOrder(sale: Sale): Promise<DeliveryOrder | null> {
  // Fetch customer's default address
  let customerAddress = null;
  if (sale.customer_id) {
    customerAddress = await getCustomerDefaultAddress(sale.customer_id);
  }

  return {
    // ...
    customer_address_id: customerAddress?.id,
    delivery_address: customerAddress?.formatted_address ||
                      customerAddress?.address_line_1 ||
                      sale.customer?.address,
    delivery_coordinates: customerAddress?.latitude && customerAddress?.longitude
      ? { lat: customerAddress.latitude, lng: customerAddress.longitude }
      : { lat: -34.6037, lng: -58.3816 }, // Fallback
    delivery_instructions: customerAddress?.delivery_instructions
  };
}
```

### **2. Customer Addresses API (customerAddressesApi.ts)**

**Main Functions**:
- `getCustomerAddresses(customerId)` - Get all addresses for customer
- `getCustomerDefaultAddress(customerId)` - Get default address
- `createCustomerAddress(data)` - Create new address
- `updateCustomerAddress(data)` - Update existing address
- `deleteCustomerAddress(addressId)` - Delete address
- `updateAddressCoordinates(addressId, lat, lng)` - Update geocoded coords
- `incrementAddressUsage(addressId)` - Track usage (called on delivery)

---

## 🔄 DATA FLOW

```
┌─────────────┐
│   Customer  │
│   Module    │
└──────┬──────┘
       │
       │ Manages addresses
       ↓
┌──────────────────┐
│ customer_        │
│ addresses        │◄───────┐
│ (multiple per    │        │
│  customer)       │        │
└──────┬───────────┘        │
       │                    │
       │ Default address    │ Geocoding
       │ selected           │ (Phase 4)
       ↓                    │
┌──────────────────┐        │
│  Sales Module    │        │
│  (POS/Orders)    │        │
└──────┬───────────┘        │
       │                    │
       │ Sale created       │
       │ with delivery      │
       ↓                    │
┌──────────────────┐        │
│ deliveryTransformer      │
│ .transformSaleToDelivery │
└──────┬───────────┘        │
       │                    │
       │ Enriched with      │
       │ address + coords   │
       ↓                    │
┌──────────────────┐        │
│ delivery_orders  │        │
│ (includes lat/lng│        │
│  + address_id)   │        │
└──────┬───────────┘        │
       │                    │
       │ Used for routing   │
       ↓                    │
┌──────────────────┐        │
│  Delivery Module │        │
│  (Phase 4: Maps) ├────────┘
└──────────────────┘
   Google Maps API
```

---

## 🎯 USE CASES

### **Use Case 1: New Customer with Address**
1. Customer registers in POS
2. Staff adds address: "Av. Corrientes 1234, Buenos Aires"
3. Address stored in `customer_addresses` (lat/lng = null for now)
4. Customer makes delivery order
5. Transformer fetches default address
6. Order created with `customer_address_id`

### **Use Case 2: Repeat Customer**
1. Customer calls for delivery
2. Staff selects customer in POS
3. System loads addresses (Casa, Trabajo, Oficina)
4. Staff selects "Casa"
5. Transformer uses geocoded coords (if Phase 4 geocoding done)
6. Order assigned to driver with accurate location

### **Use Case 3: Address Geocoding (Phase 4)**
1. Customer address created: "Av. Rivadavia 5678"
2. Google Geocoding API called
3. Returns: lat=-34.6097, lng=-58.4300, formatted="Av. Rivadavia 5678, Buenos Aires"
4. Address updated with coordinates
5. Future deliveries use accurate coords for routing

### **Use Case 4: Multiple Addresses**
1. Customer has 3 addresses:
   - Casa (default)
   - Trabajo
   - Casa de fin de semana
2. When placing order, customer can specify which address
3. Each address has separate delivery instructions
4. Usage tracking shows most-used address

---

## 📊 MIGRATION STATUS

### **Completed** ✅
- [x] `customer_addresses` table created
- [x] Indexes and constraints applied
- [x] Trigger for `updated_at`
- [x] Trigger for single default per customer
- [x] TypeScript types (`CustomerAddress`, `CreateCustomerAddressData`, etc.)
- [x] API service (`customerAddressesApi.ts`)
- [x] Delivery transformer updated (async, uses addresses)
- [x] `delivery_orders` schema updated (customer_address_id, lat/lng)
- [x] 3 existing customer addresses migrated

### **Pending** (Phase 4) ⏳
- [ ] Google Geocoding API integration
- [ ] Customer Address Manager UI component
- [ ] Address selector in Sales module
- [ ] Geocode button in Customer form
- [ ] Address verification on successful delivery
- [ ] Proximity search (addresses nearby)

---

## 🚀 PHASE 4 INTEGRATION

In Phase 4 (Google Maps Integration), the system will:

1. **Geocode Addresses Automatically**
   ```typescript
   const result = await geocodingService.geocodeAddress(
     "Av. Corrientes 1234, Buenos Aires"
   );
   // Returns: { lat: -34.6037, lng: -58.3816, formatted_address: "..." }
   ```

2. **Update Delivery Transformer**
   - Remove hardcoded fallback coordinates
   - Show warning if address not geocoded
   - Suggest geocoding to user

3. **Map Markers**
   - Show delivery pins on Google Maps
   - Color-coded by status
   - Click to view details

4. **Route Optimization**
   - Calculate distance from driver to delivery
   - Suggest best driver based on proximity
   - Calculate realistic ETA using Google Directions API

5. **Address Verification**
   - When delivery marked as "delivered"
   - Set `is_verified = true` on customer_address
   - Increase `usage_count`

---

## 🔧 DEVELOPER NOTES

### **Import Paths**
```typescript
// Customer types
import type { CustomerAddress, CreateCustomerAddressData } from '@/pages/admin/core/crm/customers/types';

// Customer API
import { getCustomerDefaultAddress, createCustomerAddress } from '@/pages/admin/core/crm/customers/services/customerAddressesApi';
```

### **Usage Example**
```typescript
// In Sales module - when creating delivery order
const defaultAddress = await getCustomerDefaultAddress(customerId);

if (defaultAddress) {
  console.log('Delivering to:', defaultAddress.label);
  console.log('Address:', defaultAddress.address_line_1);
  console.log('Coords:', defaultAddress.latitude, defaultAddress.longitude);
  console.log('Instructions:', defaultAddress.delivery_instructions);
}
```

### **Database Query Example**
```sql
-- Get customer with all addresses
SELECT
  c.*,
  json_agg(
    json_build_object(
      'id', ca.id,
      'label', ca.label,
      'address', ca.address_line_1,
      'latitude', ca.latitude,
      'longitude', ca.longitude,
      'is_default', ca.is_default
    )
  ) AS addresses
FROM customers c
LEFT JOIN customer_addresses ca ON c.id = ca.customer_id
WHERE c.id = $1
GROUP BY c.id;
```

---

## ✅ VERIFICATION CHECKLIST

- [x] `customer_addresses` table exists in Supabase
- [x] 3 addresses migrated from `customers.address`
- [x] TypeScript types compile without errors
- [x] API service functions work (CRUD operations)
- [x] Delivery transformer is async
- [x] Transformer fetches addresses
- [x] `delivery_orders` has `customer_address_id` column
- [ ] UI component for address management (pending)
- [ ] Sales module address selector (pending)
- [ ] Geocoding integration (Phase 4)

---

## 📝 NEXT STEPS

### **Immediate (Before Phase 4)**
1. Create `CustomerAddressManager` component
   - List all customer addresses
   - Add/Edit/Delete operations
   - Set default address
   - Show on Customer profile page

2. Add address selector to Sales module
   - Dropdown to select customer address
   - Show delivery instructions preview
   - Allow creating new address inline

### **Phase 4 (Google Maps)**
3. Implement geocoding service
4. Add "Geocode Address" button in forms
5. Integrate with delivery map view
6. Enable route optimization using coords

---

**Status**: ✅ **FOUNDATION COMPLETE** - Ready for Phase 4 Google Maps integration

**Impact**: Enables accurate delivery routing, better customer experience, and real-time tracking foundation.
