-- Migration: Add Multi-Location Support to Delivery Zones
-- Date: 2025-01-22
-- Description: Adds location_id column to delivery_zones table to support
--              multi-location deployments. NULL location_id means global zone.

-- Step 1: Add location_id column (nullable for global zones)
ALTER TABLE delivery_zones 
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;

-- Step 2: Add index for performance on location-based queries
CREATE INDEX IF NOT EXISTS idx_delivery_zones_location_id 
  ON delivery_zones(location_id);

-- Step 3: Add composite index for active zones by location (most common query)
CREATE INDEX IF NOT EXISTS idx_delivery_zones_location_active 
  ON delivery_zones(location_id, is_active) 
  WHERE is_active = true;

-- Step 4: Add comment explaining the design
COMMENT ON COLUMN delivery_zones.location_id IS 
  'Sucursal específica para la zona. NULL = zona global (aplica a todas las sucursales). 
   Al validar direcciones, se buscan zonas de la sucursal primero, luego zonas globales.';

-- Step 5: Add priority column for zone precedence (optional but recommended)
ALTER TABLE delivery_zones 
  ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

COMMENT ON COLUMN delivery_zones.priority IS 
  'Prioridad de la zona cuando múltiples zonas contienen el mismo punto. 
   Mayor número = mayor prioridad. Default: 0';

-- Step 6: Create index on priority for ordering
CREATE INDEX IF NOT EXISTS idx_delivery_zones_priority 
  ON delivery_zones(priority DESC);

-- Migration complete
