# Multi-Location Pattern Guide

**Status**: ✅ Standard Pattern (Mandatory for all modules)

---

## Core Architecture

G-Admin Mini uses a **global context-based** multi-location architecture.

### LocationContext

**File**: `src/contexts/LocationContext.tsx`

**Single Source of Truth** for location selection:

```typescript
const {
  selectedLocation,      // Current selected location
  isMultiLocationMode,   // true if user has capability AND multiple locations
  locations,             // All available locations
  selectLocation,        // Function to change location
} = useLocation();
```

**Features**:
- ✅ Persists in `localStorage`
- ✅ Emits `location.changed` events via EventBus
- ✅ Auto-activates when user has `multi_location` capability
- ✅ Global UI selector in Sidebar

---

## Standard Patterns

### Pattern 1: List/Display Components (No Selector)

**Use case**: Listados, tablas, dashboards

```typescript
// Page Hook
export function useMaterialsPage() {
  const { selectedLocation, isMultiLocationMode } = useLocation();

  // Convert to optional parameter
  const locationId = isMultiLocationMode && selectedLocation?.id
    ? selectedLocation.id
    : undefined;

  // Pass to data hooks (auto-refreshes when location changes)
  const { items } = useMaterialsData(locationId);

  return { items };
}

// API Service
export const materialsApi = {
  async getItems(locationId?: string) {
    let query = supabase.from('materials').select('*');

    if (locationId) {
      // Option A: Location-specific only
      query = query.eq('location_id', locationId);

      // Option B: Location-specific + Global (location_id = NULL)
      query = query.or(`location_id.eq.${locationId},location_id.is.null`);
    }

    return query;
  }
}
```

**Key Points**:
- ❌ **Never** add location selector to list components
- ✅ Data filters automatically by global `selectedLocation`
- ✅ Add `locationId` as dependency in `useEffect` for auto-refresh

---

### Pattern 2: Create/Edit Forms (With Selector)

**Use case**: Modales de creación/edición

```typescript
export function MaterialFormModal({ material, onSave }: Props) {
  const { selectedLocation, isMultiLocationMode, locations } = useLocation();

  // Initialize from global context
  const [locationId, setLocationId] = useState<string | null>(
    selectedLocation?.id || null
  );

  // Sync with global when creating new (not when editing)
  useEffect(() => {
    if (!material) {
      setLocationId(selectedLocation?.id || null);
    }
  }, [material, selectedLocation]);

  return (
    <form>
      {isMultiLocationMode && (
        <Stack gap="xs">
          <Select
            value={locationId || 'global'}
            onChange={(e) => setLocationId(e.target.value === 'global' ? null : e.target.value)}
          >
            <option value="global">🌍 Global (Todas las sucursales)</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                📍 {loc.name} - PDV {loc.punto_venta_afip}
              </option>
            ))}
          </Select>

          {/* Warning when diverging from global */}
          {locationId !== selectedLocation?.id && locationId !== null && (
            <Alert status="info">
              Este item se {material ? 'actualizará' : 'creará'} para una ubicación
              diferente a la seleccionada globalmente ({selectedLocation?.name})
            </Alert>
          )}
        </Stack>
      )}

      {/* Rest of form */}
    </form>
  );
}
```

**Key Points**:
- ✅ Show selector **only** if `isMultiLocationMode === true`
- ✅ Initialize from `selectedLocation` by default
- ✅ Allow manual override (flexibility)
- ✅ Show warning when diverging

---

## Global Items Pattern

Items with `location_id = NULL` apply to **all locations**.

**Example**: Global delivery zone visible in all branches

```typescript
// API Query
if (locationId) {
  // Return: location-specific + global items
  query = query.or(`location_id.eq.${locationId},location_id.is.null`);
}
```

**UI**:
```typescript
<option value="global">🌍 Global (Todas las sucursales)</option>
```

---

## Database Schema

Tables requiring `location_id`:

| Table | Column | Notes |
|-------|--------|-------|
| `sales` | `location_id` | Sales per location |
| `invoices` | `location_id` | Also has `punto_venta` (AFIP) |
| `stock_entries` | `location_id` | Inventory per location |
| `delivery_zones` | `location_id` | NULL = global zone |
| `cash_sessions` | `money_location_id` | Cash per location |
| `operational_shifts` | `location_id` | Shifts per location |
| `materials` | `location_id` | Materials inventory |
| `products` | `location_id` | Products catalog |

---

## Migration Checklist

When adding multi-location to a module:

```typescript
// ✅ 1. Import LocationContext
import { useLocation } from '@/contexts/LocationContext';

// ✅ 2. Get location in page hook
const { selectedLocation, isMultiLocationMode } = useLocation();
const locationId = isMultiLocationMode && selectedLocation?.id
  ? selectedLocation.id
  : undefined;

// ✅ 3. Pass to data hooks
const { data } = useMyData(locationId);

// ✅ 4. Add location filter to API
async getData(locationId?: string) {
  let query = supabase.from('table').select('*');
  if (locationId) query = query.eq('location_id', locationId);
  return query;
}

// ✅ 5. Add locationId as useEffect dependency
useEffect(() => {
  fetchData();
}, [locationId]); // Re-fetch when location changes

// ✅ 6. (Forms only) Add selector with warning
{isMultiLocationMode && <LocationSelect />}
```

---

## Anti-Patterns (Avoid)

### ❌ Don't: Duplicate location state in Zustand stores

```typescript
// ❌ BAD
export interface MyStore {
  selectedLocationId: string | null;  // Duplicates LocationContext
  selectLocation: (id: string) => void;
}
```

**Fix**: Use global `LocationContext` instead

### ❌ Don't: Add location selector to list components

```typescript
// ❌ BAD
function MaterialsList() {
  const [localLocation, setLocalLocation] = useState(null);  // NO!

  return (
    <>
      <Select onChange={setLocalLocation} /> {/* NO! */}
      <Table />
    </>
  );
}
```

**Fix**: Use global `LocationContext`, no local selector

### ❌ Don't: Ignore locationId in useEffect

```typescript
// ❌ BAD
useEffect(() => {
  fetchData();
}, []); // Missing locationId dependency
```

**Fix**: Add `locationId` to dependencies

---

## Examples

### ✅ Complete: Delivery Zones
- `src/modules/fulfillment/delivery/components/ZoneEditorEnhanced.tsx`
- `src/modules/fulfillment/delivery/hooks/useDeliveryZones.ts`
- `src/modules/fulfillment/delivery/services/deliveryService.ts`

### ✅ Complete: Materials
- `src/pages/admin/supply-chain/materials/hooks/useMaterialsPage.ts`
- `src/pages/admin/supply-chain/materials/services/materialsApi.ts`

### ✅ Complete: Shift Control
- `src/modules/shift-control/hooks/useShiftControl.ts`
- `src/modules/shift-control/services/shiftService.ts`

---

## AFIP Compliance (Argentina)

Each location has unique `punto_venta_afip` (Point of Sale number):

```typescript
interface Location {
  punto_venta_afip: number;  // Required for invoicing
  domicilio_afip: string;    // Registered address
}
```

**Fiscal module** (`src/pages/admin/finance-fiscal/`) uses location-specific PDV for invoice generation.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/contexts/LocationContext.tsx` | Global state management |
| `src/shared/ui/LocationSelector.tsx` | UI component |
| `src/types/location.ts` | TypeScript definitions |
| `src/services/locationsApi.ts` | API service |

---

## Summary

**DO**:
- ✅ Use global `LocationContext` everywhere
- ✅ Add location selector **only** in create/edit forms
- ✅ Initialize from `selectedLocation` by default
- ✅ Filter API queries by optional `locationId` parameter
- ✅ Add `locationId` to `useEffect` dependencies

**DON'T**:
- ❌ Create local location state in components
- ❌ Duplicate location state in Zustand stores
- ❌ Add location selectors to list/display components
- ❌ Forget to filter queries by location
- ❌ Forget `locationId` in useEffect dependencies

---

**Pattern Status**: ✅ Mandatory for all modules

**Coverage**: ~70% complete (Materials, Cash, Delivery, Shift Control, Fiscal implemented)
