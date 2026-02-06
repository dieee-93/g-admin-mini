# Production Equipment & Recipe Costing - Design Document

**Date:** 2026-02-05  
**Status:** ✅ Database Migration Complete | 🚧 Code Implementation Pending  
**Version:** 1.0

---

## 📊 MIGRATION RESULTS

### ✅ Database Successfully Created

**Execution Date:** 2026-02-05  
**Database:** Administrador (Supabase)  
**Status:** All phases completed successfully

**Created:**
- ✅ Table `production_equipment` (35 columns)
- ✅ 7 indexes for performance
- ✅ 3 foreign keys (team_members, auth.users)
- ✅ 2 triggers (auto-calculation + timestamp)
- ✅ 4 utility functions (RPCs)
- ✅ 2 RLS policies
- ✅ Field `production_config` added to `materials` and `products`

**Test Results:**
```
Equipment: Horno Industrial Pizzero
Purchase: $50,000 | Life: 10 years | Hours/year: 2,000
Calculated Rate: $6.50/hour

Breakdown:
- Depreciation:  $2.25/hour
- Maintenance:   $1.25/hour
- Energy:        $2.00/hour
- Consumables:   $0.50/hour
- Insurance:     $0.50/hour
- Overhead:      $0.00/hour
─────────────────────────────
TOTAL:           $6.50/hour ✅
```

---

## 📋 Executive Summary

### The Problem
Legacy `assets` table mixed two incompatible concepts:
1. **Production Equipment** - Internal manufacturing tools (cost absorption)
2. **Rental Assets** - Revenue-generating products (rentals)

### The Solution
Complete architectural separation with professional ERP patterns:

```
┌─────────────────────────────────────┐
│     RENTAL ASSETS (Revenue)         │
│  rental_items + rental_reservations │
│  Module: rentals (unchanged)        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  PRODUCTION EQUIPMENT (Cost Center) │
│  production_equipment (NEW)         │
│  Module: production-equipment (NEW) │
│  Costing: Auto-calculated hourly    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      RECIPE (BOM - Generic)         │
│  What materials + quantities        │
│  NO equipment IDs                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ MATERIAL + ProductionConfig (How)   │
│  Equipment usage + Labor + Overhead │
│  JSONB field: production_config     │
└─────────────────────────────────────┘
```

### Key Benefits
1. ✅ Clean separation (production vs rental)
2. ✅ Multi-location flexibility (same recipe, different equipment)
3. ✅ Accurate cost accounting (manufacturing overhead theory)
4. ✅ Equipment depreciation tracking
5. ✅ Professional ERP pattern (BOM + Routing)

---

## 🏗️ Architecture Decision

### Option B: Separate BOM + Production Config (✅ SELECTED)

**Recipe = WHAT (Generic BOM)**
```typescript
Recipe "Pizza Margarita" {
  inputs: [
    { item: "masa", quantity: 0.3, unit: "kg" },
    { item: "salsa", quantity: 0.1, unit: "kg" },
    { item: "queso", quantity: 0.15, unit: "kg" }
  ],
  instructions: "Hornear 12min a 250°C"
  // NO equipment IDs here
}
```

**Material = HOW (Location-Specific)**
```typescript
Material "Pizza Local Centro" {
  recipe_id: "pizza-margarita",
  production_config: {
    equipment_usage: [{
      equipment_id: "horno-001",
      equipment_name: "Horno Industrial #1",
      hours_used: 0.2,
      hourly_cost_rate: 6.50,
      total_cost: 1.30
    }],
    labor_hours: 0.25,
    labor_cost_per_hour: 15.00,
    overhead_percentage: 10
  },
  unit_cost: 9.78  // Calculated
}
```

---

## 💾 Database Schema

### production_equipment Table

```sql
CREATE TABLE production_equipment (
  -- Identity
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) UNIQUE,
  equipment_type VARCHAR(50),  -- oven, mixer, press, etc.

  -- Financial
  purchase_price NUMERIC(12,2),
  useful_life_years INTEGER,
  salvage_value NUMERIC(12,2),

  -- Costing (Auto-calculated)
  hourly_cost_rate NUMERIC(10,4),
  auto_calculate_rate BOOLEAN DEFAULT true,
  
  -- Cost Components
  maintenance_cost_percentage NUMERIC(5,2) DEFAULT 5.00,
  energy_cost_per_hour NUMERIC(10,4),
  consumables_cost_per_hour NUMERIC(10,4),
  insurance_cost_annual NUMERIC(10,2),
  
  -- Status
  status VARCHAR(50),  -- available, in_use, maintenance, retired
  assigned_to UUID REFERENCES team_members(id)
);
```

### production_config (JSONB in materials/products)

```json
{
  "equipment_usage": [{
    "equipment_id": "uuid",
    "equipment_name": "string",
    "hours_used": 0.2,
    "hourly_cost_rate": 6.50,
    "total_cost": 1.30
  }],
  "labor_hours": 0.25,
  "labor_cost_per_hour": 15.00,
  "overhead_percentage": 10,
  "total_cost": 9.78
}
```

---

## 💰 Cost Calculation Theory

### Hourly Equipment Rate Formula

```
Rate = Depreciation + Maintenance + Energy + Consumables + Insurance + Overhead
```

**Components:**

1. **Depreciation** (Straight-line)
   ```
   (Purchase Price - Salvage Value) / (Useful Life × Annual Hours)
   ```

2. **Maintenance** (% of purchase price)
   ```
   (Purchase Price × Maintenance %) / Annual Hours
   ```

3. **Energy, Consumables, Overhead**
   ```
   Fixed rate per hour
   ```

4. **Insurance**
   ```
   Annual Premium / Annual Hours
   ```

### Example: Pizza Margherita Cost

**Materials (BOM):**
- Masa: 0.3kg × $5/kg = $1.50
- Salsa: 0.1kg × $8/kg = $0.80
- Queso: 0.15kg × $12/kg = $1.80
- **Subtotal: $4.10**

**Production Config:**
- Equipment: 0.2h × $6.50/h = $1.30
- Labor: 0.25h × $15/h = $3.75
- **Direct Costs: $9.15**

**Overhead:**
- 10% materials = $0.41
- Packaging = $0.50
- **Indirect: $0.91**

**FINAL COST: $10.06/unit**

---

## 📝 Implementation Checklist

### ✅ Phase 1: Database (COMPLETE)
- [x] Migration executed
- [x] Table created
- [x] Triggers working
- [x] Functions tested
- [x] Test equipment inserted

### 🚧 Phase 2: Backend Services (PENDING)
- [ ] Create `equipmentApi.ts` (CRUD operations)
- [ ] Create `costCalculation.ts` (BOM + ProductionConfig)
- [ ] Update `materialApi.ts` (save production_config)
- [ ] Clean `rentals/manifest.tsx` (remove assets hooks)

### 🚧 Phase 3: Frontend Components (PENDING)
- [ ] `ProductionConfigSection.tsx` - Main UI
- [ ] `EquipmentSelector.tsx` - Modal selector
- [ ] Integration in `ElaboratedFields.tsx`
- [ ] Cost breakdown display

### 🚧 Phase 4: Testing (PENDING)
- [ ] Create test equipment records
- [ ] Test auto-calculation
- [ ] Create elaborated material with config
- [ ] Verify cost accuracy
- [ ] E2E test flow

---

## 🔧 Next Implementation Steps

### Step 1: Service Layer (1 hour)

Create `src/pages/admin/operations/production-equipment/services/equipmentApi.ts`:

```typescript
export async function getEquipment(): Promise<ProductionEquipment[]>
export async function createEquipment(input: CreateEquipmentInput)
export async function getEquipmentCostBreakdown(id: string)
export async function recordEquipmentUsage(id: string, hours: number)
```

### Step 2: UI Components (2-3 hours)

**ProductionConfigSection** - Main configuration UI
- Equipment usage list (add/remove)
- Labor configuration
- Overhead settings
- Real-time cost summary

**EquipmentSelector** - Modal for selecting equipment
- Equipment list with rates
- Hours input
- Cost preview

### Step 3: Integration (30 min)

Update `ElaboratedFields.tsx`:
- Add ProductionConfigSection after RecipeBuilder
- Wire up form state

### Step 4: Cost Calculation (30 min)

Create cost calculation function:
```typescript
calculateElaboratedMaterialCost(material, bomCost) → ProductionConfig
```

---

## 📚 References

### Manufacturing Theory
- [NetSuite: Manufacturing Overhead](https://www.netsuite.com/portal/resource/articles/erp/manufacturing-overhead.shtml)
- [AccountingCoach: MOH](https://www.accountingcoach.com/manufacturing-overhead/explanation)

### ERP Patterns
- SAP: BOM + Routing
- Odoo: Manufacturing Orders + Work Centers

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-05  
**Status:** Database Complete | Code Implementation Ready
