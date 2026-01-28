# Alert System Architecture V2 - Multi-Module Enterprise Design

> ## ⚠️ NOTA IMPORTANTE - Enero 2026
> 
> **Este documento contiene el diseño original de la arquitectura V2, pero algunas partes NO están implementadas.**
> 
> **Para uso diario y código actual, usa:** [ALERTS_COMPLETE_GUIDE.md](./ALERTS_COMPLETE_GUIDE.md)
> 
> **Diferencias principales:**
> - ❌ `SmartAlertsEngine` NO está implementado (solo existe en tests como mock)
> - ❌ Motor automatizado de reglas NO existe (se usa patrón manual)
> - ✅ Database schema SÍ está implementado
> - ✅ Tipos TypeScript SÍ están implementados
> - ✅ Sistema de 3 capas SÍ está implementado (conceptualmente)
>
> Este doc es útil para entender el diseño original y planes futuros.

**Date:** November 18, 2025  
**Version:** 2.0.0  
**Status:** 🟡 Parcialmente Implementado  
**Scope:** 31 modules + future expansion

---

## 📋 Executive Summary

### Design Principles

1. **3-Layer Alert System**:
   - **Layer 1**: Simple Alerts (user actions, system events)
   - **Layer 2**: Smart Alerts (business intelligence, context-aware)
   - **Layer 3**: Predictive Alerts (ML-based, future capability)

2. **Universal Storage**: Supabase `alerts` table for all alert types
3. **Module-Specific Intelligence**: Each module defines its own smart alert rules
4. **Efficient Loading**: Hybrid approach (persist critical + metadata service)
5. **Clear Distinction**: `type` + `intelligence_level` fields prevent confusion

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        UNIFIED ALERT SYSTEM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────┐  │
│  │  Layer 1    │     │  Layer 2    │     │  Layer 3 (Future)           │  │
│  │  SIMPLE     │ ──➤ │  SMART      │ ──➤ │  PREDICTIVE                 │  │
│  │  ALERTS     │     │  ALERTS     │     │  ALERTS                     │  │
│  └─────────────┘     └─────────────┘     └─────────────────────────────┘  │
│       │                   │                       │                        │
│       │                   │                       │                        │
│       ├─ User actions     ├─ Business rules       ├─ ML predictions       │
│       ├─ System events    ├─ Threshold checks     ├─ Anomaly detection    │
│       ├─ CRUD operations  ├─ Context analysis     ├─ Trend forecasting    │
│       └─ Notifications    └─ Intelligent triggers └─ Proactive warnings   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                        STORAGE LAYER (Supabase)                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  alerts TABLE                                                         │ │
│  │  - id, type, severity, context, title, description                   │ │
│  │  - intelligence_level (simple|smart|predictive)                      │ │
│  │  - metadata JSONB (module-specific data)                             │ │
│  │  - created_at, updated_at, resolved_at                               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 3-Layer Alert System Explained

### **Layer 1: Simple Alerts** ⚡

**Purpose**: Immediate feedback for user actions and system events  
**Intelligence Level**: `simple`  
**Generation**: Synchronous, on-demand  
**Lifespan**: Short (auto-expire in 5-15 minutes)

**Use Cases:**
- ✅ "Material created successfully"
- ✅ "Product deleted"
- ✅ "Order saved"
- ✅ "Settings updated"
- ✅ "Export completed"
- ❌ ~~Stock level analysis~~ (that's Layer 2)

**Characteristics:**
```typescript
{
  intelligence_level: 'simple',
  severity: 'info' | 'low',
  autoExpire: 300000, // 5 minutes
  persistent: false,
  type: 'system' | 'operational'
}
```

**Example:**
```typescript
// When user creates a material
await actions.create({
  type: 'operational',
  severity: 'info',
  context: 'materials',
  title: 'Material "Leche" created successfully',
  intelligence_level: 'simple',
  autoExpire: 300000, // 5 min
  metadata: {
    itemId: '123',
    itemName: 'Leche'
  }
});
```

---

### **Layer 2: Smart Alerts** 🧠

**Purpose**: Business intelligence, context-aware recommendations  
**Intelligence Level**: `smart`  
**Generation**: Asynchronous, scheduled (every 60s) or event-driven  
**Lifespan**: Long (until resolved or conditions change)

**Use Cases:**
- 🧠 "5 materials below minimum stock"
- 🧠 "Product 'Hamburguesa' has incomplete recipe"
- 🧠 "Order #123 overdue by 2 hours"
- 🧠 "Staff member has 3 consecutive shifts (burnout risk)"
- 🧠 "Asset 'Oven-A' due for maintenance in 3 days"
- 🧠 "Rental booking conflict detected"

**Characteristics:**
```typescript
{
  intelligence_level: 'smart',
  severity: 'critical' | 'high' | 'medium',
  autoExpire: null, // Don't expire until resolved
  persistent: true,
  type: 'stock' | 'business' | 'validation' | 'operational'
}
```

**Example:**
```typescript
// Generated by SmartAlertsEngine
const smartAlerts = SmartAlertsEngine.analyze({
  materials: materialsData,
  rules: MATERIALS_SMART_RULES
});

await actions.bulkCreate(smartAlerts.map(alert => ({
  type: 'stock',
  severity: alert.severity,
  context: 'materials',
  title: alert.title,
  description: alert.recommendation,
  intelligence_level: 'smart',
  persistent: true,
  metadata: alert.metadata
})));
```

---

### **Layer 3: Predictive Alerts** 🔮 (Future)

**Purpose**: Machine learning predictions, anomaly detection  
**Intelligence Level**: `predictive`  
**Generation**: ML model inference (background jobs)  
**Lifespan**: Variable (depends on prediction confidence)

**Use Cases (Future Implementation):**
- 🔮 "Material 'Leche' likely to run out in 3 days based on consumption trends"
- 🔮 "Sales spike predicted for next Friday (historical pattern)"
- 🔮 "Unusual expense detected: 300% above average"
- 🔮 "Customer 'ABC Corp' at risk of churn (engagement dropped 60%)"
- 🔮 "Equipment failure predicted in next 7 days (sensor anomaly)"

**Characteristics:**
```typescript
{
  intelligence_level: 'predictive',
  severity: 'high' | 'medium',
  confidence: 0.85, // ML confidence score
  persistent: true,
  type: 'business',
  metadata: {
    model: 'stock-forecasting-v1',
    confidence: 0.85,
    predictedDate: '2025-11-25',
    basedOnData: 'Last 90 days consumption'
  }
}
```

**Implementation Note:** Layer 3 requires ML infrastructure (not included in Phase 1)

---

## 🗂️ Module Alert Configuration (31 Modules)

### Module Classification

**Tier 1: Critical Modules (Smart Alerts Priority)**
- Require immediate, detailed alerts
- Full data persistence
- Real-time smart analysis

**Tier 2: Standard Modules (Hybrid Approach)**
- Mix of simple + smart alerts
- Metadata service for smart alerts
- Selective persistence

**Tier 3: Low-Alert Modules**
- Mostly simple alerts (CRUD operations)
- No smart alerts needed
- Minimal persistence

---

### Complete Module Alert Matrix

| Module | Tier | Simple Alerts | Smart Alerts | Intelligence Rules | Persistence Strategy |
|--------|------|---------------|--------------|-------------------|---------------------|
| **SUPPLY CHAIN** |||||
| Materials | 🔴 1 | ✅ CRUD | ✅ Stock levels, expiry, valuation | Stock thresholds, ABC analysis, turnover rate | Full persist |
| Suppliers | 🟡 2 | ✅ CRUD | ✅ Performance metrics, payment delays | Delivery reliability, quality scores | Metadata |
| Products | 🟡 2 | ✅ CRUD | ✅ Recipe completeness, margin analysis | Missing ingredients, low margin, unpublished | Metadata |
| Production | 🔴 1 | ✅ CRUD | ✅ Batch status, ingredient availability | Production delays, quality issues | Full persist |
| Assets | 🟢 3 | ✅ CRUD | ✅ Maintenance schedule, depreciation | Maintenance overdue, high repair costs | Metadata |
| Materials Procurement | 🟡 2 | ✅ CRUD | ✅ Order status, supplier delays | PO overdue, price variance | Metadata |
| **OPERATIONS** |||||
| Sales | 🔴 1 | ✅ CRUD | ✅ Order status, payment pending | Overdue orders, refund requests, high-value orders | Full persist |
| Fulfillment | 🔴 1 | ✅ CRUD | ✅ Delivery delays, capacity warnings | Late deliveries, driver availability | Full persist |
| Fulfillment Onsite | 🟡 2 | ✅ CRUD | ✅ Table status, wait times | Long wait times, table turnover | Metadata |
| Fulfillment Pickup | 🟡 2 | ✅ CRUD | ✅ Order ready status, wait times | Pickup delays, customer waiting | Metadata |
| Fulfillment Delivery | 🔴 1 | ✅ CRUD | ✅ Route optimization, ETA accuracy | Driver delays, failed deliveries | Full persist |
| Mobile | 🟡 2 | ✅ CRUD | ✅ GPS accuracy, connectivity issues | Offline mode active, sync failures | Metadata |
| Memberships | 🟡 2 | ✅ CRUD | ✅ Expiration warnings, renewal reminders | Expiring soon, unpaid renewals | Metadata |
| Rentals | 🟡 2 | ✅ CRUD | ✅ Booking conflicts, overdue returns | Double booking, late returns, damage reports | Metadata |
| **FINANCE** |||||
| Finance Fiscal | 🔴 1 | ✅ CRUD | ✅ Tax compliance, filing deadlines | Overdue filings, calculation errors | Full persist |
| Finance Billing | 🔴 1 | ✅ CRUD | ✅ Invoice status, payment reminders | Overdue invoices, payment failures | Full persist |
| Finance Corporate | 🟡 2 | ✅ CRUD | ✅ Budget variance, cashflow warnings | Burn rate, runway alerts | Metadata |
| Finance Integrations | 🟡 2 | ✅ CRUD | ✅ Sync errors, API failures | Integration down, data mismatch | Metadata |
| **RESOURCES** |||||
| Staff | 🟡 2 | ✅ CRUD | ✅ Attendance issues, overtime alerts | Consecutive shifts, missing clock-in | Metadata |
| Scheduling | 🟡 2 | ✅ CRUD | ✅ Shift conflicts, understaffing | Shift gaps, coverage warnings | Metadata |
| **CUSTOMERS** |||||
| Customers | 🟡 2 | ✅ CRUD | ✅ Engagement drops, churn risk | Inactive customers, high-value at risk | Metadata |
| **CORE** |||||
| Dashboard | 🟢 3 | ✅ System | ❌ No | N/A | None |
| Settings | 🟢 3 | ✅ System | ❌ No | N/A | None |
| Debug | 🟢 3 | ✅ System | ✅ Error tracking, performance issues | High error rate, slow queries | Metadata |
| **ANALYTICS** |||||
| Reporting | 🟢 3 | ✅ System | ✅ Report failures, data quality | Failed exports, missing data | Metadata |
| Intelligence | 🟡 2 | ✅ System | ✅ Market insights, competitor alerts | Price changes, market shifts | Metadata |
| Executive | 🟡 2 | ✅ System | ✅ KPI anomalies, trend alerts | Revenue drops, metric anomalies | Metadata |
| Products Analytics | 🟡 2 | ✅ System | ✅ Menu engineering insights | Dead items, star performers | Metadata |
| **SYSTEM** |||||
| Achievements | 🟢 3 | ✅ Achievement unlocked | ❌ No | N/A | None |
| Gamification | 🟢 3 | ✅ Level up, rewards | ❌ No | N/A | None |

**Summary:**
- **Tier 1 (Full Persist)**: 7 modules - Materials, Production, Sales, Fulfillment, Fulfillment Delivery, Finance Fiscal, Finance Billing
- **Tier 2 (Metadata)**: 18 modules - Most operational + analytics modules
- **Tier 3 (Simple Only)**: 6 modules - Core, Achievements, Dashboard, Settings

---

## 🎯 Smart Alert Rules by Module

> **💡 Tutorial:** For step-by-step guide on creating rules, see [SMART_ALERTS_GUIDE.md Section 3](./SMART_ALERTS_GUIDE.md#creating-smart-alert-rules)

### Materials Module (StockLab)

```typescript
// src/modules/materials/alerts/rules.ts
export const MATERIALS_SMART_RULES: SmartAlertRule[] = [
  {
    id: 'stock-critical',
    name: 'Critical Stock Level',
    condition: (item: MaterialItem) => item.stock === 0,
    severity: 'critical',
    title: (item) => `${item.name}: Sin stock`,
    description: (item) => `Material sin existencias. Impacto operacional inmediato.`,
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      currentStock: 0,
      minThreshold: item.min_stock,
      unit: item.unit
    })
  },
  {
    id: 'stock-low',
    name: 'Low Stock Warning',
    condition: (item: MaterialItem) => item.stock > 0 && item.stock <= item.min_stock,
    severity: 'high',
    title: (item) => `${item.name}: Stock bajo (${item.stock} ${item.unit})`,
    description: (item) => `Nivel por debajo del mínimo (${item.min_stock} ${item.unit}).`,
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      currentStock: item.stock,
      minThreshold: item.min_stock,
      unit: item.unit
    })
  },
  {
    id: 'stock-overstock',
    name: 'Overstock Alert',
    condition: (item: MaterialItem) => item.stock > item.min_stock * 3,
    severity: 'medium',
    title: (item) => `${item.name}: Sobrestock (${item.stock} ${item.unit})`,
    description: (item) => `Stock 3x superior al mínimo. Riesgo de capital inmovilizado.`,
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      currentStock: item.stock,
      minThreshold: item.min_stock,
      unit: item.unit,
      overstockRatio: (item.stock / item.min_stock).toFixed(1)
    })
  },
  {
    id: 'stock-expiry-near',
    name: 'Expiration Warning',
    condition: (item: MaterialItem) => {
      if (!item.expiry_date) return false;
      const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    },
    severity: 'high',
    title: (item) => `${item.name}: Vence pronto`,
    description: (item) => {
      const daysUntilExpiry = Math.ceil((new Date(item.expiry_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return `Vence en ${daysUntilExpiry} días. Stock actual: ${item.stock} ${item.unit}`;
    },
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      expiryDate: item.expiry_date,
      daysRemaining: Math.ceil((new Date(item.expiry_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    })
  }
];
```

### Products Module

```typescript
// src/modules/products/alerts/rules.ts
export const PRODUCTS_SMART_RULES: SmartAlertRule[] = [
  {
    id: 'product-incomplete-recipe',
    name: 'Incomplete Recipe',
    condition: (product: Product) => !product.components || product.components.length === 0,
    severity: 'medium',
    title: (product) => `${product.name}: Receta incompleta`,
    description: (product) => `Producto sin ingredientes definidos. No se puede calcular costo.`,
    metadata: (product) => ({
      productId: product.id,
      productName: product.name,
      missingComponents: true
    })
  },
  {
    id: 'product-low-margin',
    name: 'Low Profit Margin',
    condition: (product: Product) => {
      const margin = ((product.price - product.cost) / product.price) * 100;
      return margin < 20; // Less than 20% margin
    },
    severity: 'high',
    title: (product) => `${product.name}: Margen bajo`,
    description: (product) => {
      const margin = ((product.price - product.cost) / product.price) * 100;
      return `Margen de ${margin.toFixed(1)}% (recomendado: >20%)`;
    },
    metadata: (product) => ({
      productId: product.id,
      productName: product.name,
      currentMargin: ((product.price - product.cost) / product.price) * 100,
      recommendedMargin: 20
    })
  },
  {
    id: 'product-unpublished',
    name: 'Unpublished Product',
    condition: (product: Product) => !product.is_published,
    severity: 'low',
    title: (product) => `${product.name}: No publicado`,
    description: (product) => `Producto configurado pero no visible para ventas.`,
    metadata: (product) => ({
      productId: product.id,
      productName: product.name,
      isPublished: false
    })
  }
];
```

### Sales Module

```typescript
// src/modules/sales/alerts/rules.ts
export const SALES_SMART_RULES: SmartAlertRule[] = [
  {
    id: 'order-overdue',
    name: 'Overdue Order',
    condition: (order: Order) => {
      if (order.status === 'completed') return false;
      const hoursOverdue = (Date.now() - new Date(order.expected_delivery).getTime()) / (1000 * 60 * 60);
      return hoursOverdue > 1; // More than 1 hour late
    },
    severity: 'critical',
    title: (order) => `Order #${order.order_number}: Overdue`,
    description: (order) => {
      const hoursOverdue = Math.floor((Date.now() - new Date(order.expected_delivery).getTime()) / (1000 * 60 * 60));
      return `Order delayed by ${hoursOverdue} hours. Customer: ${order.customer_name}`;
    },
    metadata: (order) => ({
      orderId: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      hoursOverdue: Math.floor((Date.now() - new Date(order.expected_delivery).getTime()) / (1000 * 60 * 60))
    })
  },
  {
    id: 'payment-pending',
    name: 'Payment Pending',
    condition: (order: Order) => order.payment_status === 'pending' && order.status === 'completed',
    severity: 'high',
    title: (order) => `Order #${order.order_number}: Payment pending`,
    description: (order) => `Order completed but payment not received. Amount: $${order.total}`,
    metadata: (order) => ({
      orderId: order.id,
      orderNumber: order.order_number,
      amount: order.total,
      customerName: order.customer_name
    })
  }
];
```

### Rentals Module

```typescript
// src/modules/rentals/alerts/rules.ts
export const RENTALS_SMART_RULES: SmartAlertRule[] = [
  {
    id: 'rental-booking-conflict',
    name: 'Booking Conflict',
    condition: (bookings: Booking[]) => {
      // Check for overlapping bookings
      return bookings.some((b1, i) =>
        bookings.slice(i + 1).some(b2 =>
          b1.asset_id === b2.asset_id &&
          new Date(b1.start_date) < new Date(b2.end_date) &&
          new Date(b1.end_date) > new Date(b2.start_date)
        )
      );
    },
    severity: 'critical',
    title: (bookings) => `Asset booking conflict detected`,
    description: (bookings) => `Multiple bookings overlap for the same asset.`,
    metadata: (bookings) => ({
      conflictingBookings: bookings.map(b => b.id)
    })
  },
  {
    id: 'rental-overdue-return',
    name: 'Overdue Return',
    condition: (booking: Booking) => {
      return booking.status === 'active' && new Date(booking.end_date) < new Date();
    },
    severity: 'high',
    title: (booking) => `Asset #${booking.asset_id}: Overdue return`,
    description: (booking) => {
      const daysOverdue = Math.floor((Date.now() - new Date(booking.end_date).getTime()) / (1000 * 60 * 60 * 24));
      return `Return overdue by ${daysOverdue} days. Customer: ${booking.customer_name}`;
    },
    metadata: (booking) => ({
      bookingId: booking.id,
      assetId: booking.asset_id,
      customerName: booking.customer_name,
      daysOverdue: Math.floor((Date.now() - new Date(booking.end_date).getTime()) / (1000 * 60 * 60 * 24))
    })
  }
];
```

### Staff Module

```typescript
// src/modules/staff/alerts/rules.ts
export const STAFF_SMART_RULES: SmartAlertRule[] = [
  {
    id: 'staff-consecutive-shifts',
    name: 'Burnout Risk',
    condition: (employee: Employee, shifts: Shift[]) => {
      const employeeShifts = shifts.filter(s => s.employee_id === employee.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      let consecutiveDays = 1;
      for (let i = 1; i < employeeShifts.length; i++) {
        const prevDate = new Date(employeeShifts[i - 1].date);
        const currDate = new Date(employeeShifts[i].date);
        const daysDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff === 1) consecutiveDays++;
        else consecutiveDays = 1;
        
        if (consecutiveDays >= 7) return true;
      }
      return false;
    },
    severity: 'high',
    title: (employee) => `${employee.name}: Burnout risk`,
    description: (employee) => `Employee has 7+ consecutive shifts. Consider rest day.`,
    metadata: (employee) => ({
      employeeId: employee.id,
      employeeName: employee.name,
      consecutiveShifts: 7
    })
  },
  {
    id: 'staff-overtime-high',
    name: 'High Overtime',
    condition: (employee: Employee) => employee.overtime_hours > 10,
    severity: 'medium',
    title: (employee) => `${employee.name}: High overtime`,
    description: (employee) => `${employee.overtime_hours} hours of overtime this week.`,
    metadata: (employee) => ({
      employeeId: employee.id,
      employeeName: employee.name,
      overtimeHours: employee.overtime_hours
    })
  }
];
```

---

## 🗄️ Database Schema

### Supabase `alerts` Table

```sql
-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Classification
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'stock', 'system', 'validation', 'business', 
    'security', 'operational', 'achievement'
  )),
  severity VARCHAR(20) NOT NULL CHECK (severity IN (
    'critical', 'high', 'medium', 'low', 'info'
  )),
  context VARCHAR(50) NOT NULL CHECK (context IN (
    'dashboard', 'global', 'settings', 'debug',
    'materials', 'suppliers', 'products', 'production', 'assets',
    'sales', 'fulfillment', 'mobile',
    'customers', 'memberships', 'rentals',
    'fiscal', 'billing', 'corporate', 'integrations',
    'staff', 'scheduling',
    'reporting', 'intelligence', 'executive',
    'gamification', 'achievements'
  )),
  
  -- NEW: Intelligence classification
  intelligence_level VARCHAR(20) NOT NULL DEFAULT 'simple' CHECK (intelligence_level IN (
    'simple',      -- Layer 1: User actions, system events
    'smart',       -- Layer 2: Business intelligence
    'predictive'   -- Layer 3: ML predictions (future)
  )),
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'acknowledged', 'resolved', 'dismissed'
  )),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  -- Configuration
  persistent BOOLEAN DEFAULT false,
  auto_expire_ms INTEGER, -- Milliseconds until auto-expire (NULL = never)
  escalation_level INTEGER DEFAULT 0,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  occurrence_count INTEGER DEFAULT 0,
  last_occurrence TIMESTAMPTZ,
  
  -- ML/Prediction fields (Layer 3)
  confidence DECIMAL(3,2), -- 0.00 to 1.00
  predicted_date TIMESTAMPTZ,
  model_version VARCHAR(50)
);

-- Indexes for performance
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_context ON public.alerts(context);
CREATE INDEX idx_alerts_severity ON public.alerts(severity);
CREATE INDEX idx_alerts_intelligence_level ON public.alerts(intelligence_level);
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX idx_alerts_context_status ON public.alerts(context, status);
CREATE INDEX idx_alerts_metadata ON public.alerts USING GIN(metadata);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alerts_updated_at_trigger
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_alerts_updated_at();

-- RLS Policies
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alerts viewable by authenticated users"
  ON public.alerts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Alerts manageable by authenticated users"
  ON public.alerts FOR ALL
  USING (auth.role() = 'authenticated');

-- Auto-expire alerts (run via cron job or edge function)
CREATE OR REPLACE FUNCTION expire_old_alerts()
RETURNS void AS $$
BEGIN
  UPDATE public.alerts
  SET status = 'dismissed',
      updated_at = NOW()
  WHERE status = 'active'
    AND auto_expire_ms IS NOT NULL
    AND (EXTRACT(EPOCH FROM (NOW() - created_at)) * 1000) > auto_expire_ms;
END;
$$ LANGUAGE plpgsql;
```

### Alert Metadata Summary Functions

```sql
-- Get alerts summary by module (for metadata service)
CREATE OR REPLACE FUNCTION get_alerts_summary(module_context VARCHAR)
RETURNS JSON AS $$
  SELECT json_build_object(
    'context', module_context,
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE status = 'active'),
    'critical', COUNT(*) FILTER (WHERE severity = 'critical' AND status = 'active'),
    'high', COUNT(*) FILTER (WHERE severity = 'high' AND status = 'active'),
    'smart', COUNT(*) FILTER (WHERE intelligence_level = 'smart' AND status = 'active'),
    'lastUpdated', MAX(updated_at)
  )
  FROM public.alerts
  WHERE context = module_context;
$$ LANGUAGE SQL STABLE;

-- Get all alerts summary (for dashboard)
CREATE OR REPLACE FUNCTION get_all_alerts_summary()
RETURNS JSON AS $$
  SELECT json_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE status = 'active'),
    'byContext', json_object_agg(
      context,
      json_build_object(
        'total', COUNT(*),
        'critical', COUNT(*) FILTER (WHERE severity = 'critical' AND status = 'active')
      )
    ),
    'lastUpdated', NOW()
  )
  FROM public.alerts
  GROUP BY context;
$$ LANGUAGE SQL STABLE;
```

---

## 🔧 TypeScript Types

### Updated Alert Types

```typescript
// src/shared/alerts/types.ts

export type IntelligenceLevel = 'simple' | 'smart' | 'predictive';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  context: AlertContext;
  
  // NEW: Intelligence classification
  intelligence_level: IntelligenceLevel;
  
  // Content
  title: string;
  description?: string;
  metadata?: AlertMetadata;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  
  // Configuration
  persistent?: boolean;
  autoExpire?: number; // milliseconds
  escalationLevel?: number;
  
  // Recurrence
  isRecurring?: boolean;
  recurrencePattern?: string;
  occurrenceCount?: number;
  lastOccurrence?: Date;
  
  // ML/Prediction (Layer 3)
  confidence?: number; // 0.0 to 1.0
  predictedDate?: Date;
  modelVersion?: string;
  
  // Actions
  actions?: AlertAction[];
}

export interface CreateAlertInput {
  type: AlertType;
  severity: AlertSeverity;
  context: AlertContext;
  intelligence_level: IntelligenceLevel;
  title: string;
  description?: string;
  metadata?: AlertMetadata;
  persistent?: boolean;
  autoExpire?: number;
  actions?: Omit<AlertAction, 'id'>[];
  isRecurring?: boolean;
  recurrencePattern?: string;
  
  // ML/Prediction (Layer 3)
  confidence?: number;
  predictedDate?: Date;
  modelVersion?: string;
}
```

### Smart Alert Rule Interface

```typescript
// src/lib/alerts/types/smartRules.ts

export interface SmartAlertRule<T = any> {
  id: string;
  name: string;
  description?: string;
  
  // Condition function: returns true if alert should be generated
  condition: (data: T, context?: any) => boolean;
  
  // Alert configuration
  severity: AlertSeverity;
  title: (data: T) => string;
  description: (data: T) => string;
  metadata: (data: T) => AlertMetadata;
  
  // Optional configurations
  priority?: number; // Higher = evaluated first
  autoExpire?: number; // milliseconds
  persistent?: boolean;
  actions?: (data: T) => Omit<AlertAction, 'id'>[];
}

export interface SmartAlertsEngineConfig<T = any> {
  rules: SmartAlertRule<T>[];
  context: AlertContext;
  circuitBreakerInterval?: number; // milliseconds between evaluations
}
```

---

## 🚀 Implementation Guide

### Step 1: Database Migration

```bash
# Apply schema changes via Supabase MCP
# File: database/migrations/20251118_alert_system_v2.sql
```

### Step 2: Update Types

```typescript
// src/shared/alerts/types.ts
// Add intelligence_level field to all alert interfaces
```

### Step 3: Create Smart Alert Engine Base Class

```typescript
// src/lib/alerts/SmartAlertsEngine.ts

export class SmartAlertsEngine<T = any> {
  private config: SmartAlertsEngineConfig<T>;
  private lastEvaluation: number = 0;

  constructor(config: SmartAlertsEngineConfig<T>) {
    this.config = config;
  }

  /**
   * Evaluate all rules and generate alerts
   */
  evaluate(data: T | T[], globalContext?: any): CreateAlertInput[] {
    // Circuit breaker
    const now = Date.now();
    if (this.config.circuitBreakerInterval && 
        (now - this.lastEvaluation) < this.config.circuitBreakerInterval) {
      return [];
    }
    this.lastEvaluation = now;

    const alerts: CreateAlertInput[] = [];
    const dataArray = Array.isArray(data) ? data : [data];

    // Sort rules by priority
    const sortedRules = [...this.config.rules].sort((a, b) => 
      (b.priority || 0) - (a.priority || 0)
    );

    // Evaluate each rule
    for (const rule of sortedRules) {
      for (const item of dataArray) {
        try {
          if (rule.condition(item, globalContext)) {
            alerts.push({
              type: this.inferType(rule),
              severity: rule.severity,
              context: this.config.context,
              intelligence_level: 'smart',
              title: rule.title(item),
              description: rule.description(item),
              metadata: rule.metadata(item),
              persistent: rule.persistent ?? true,
              autoExpire: rule.autoExpire,
              actions: rule.actions?.(item)
            });
          }
        } catch (error) {
          logger.error('SmartAlertsEngine', `Rule ${rule.id} evaluation failed`, error);
        }
      }
    }

    return alerts;
  }

  private inferType(rule: SmartAlertRule<T>): AlertType {
    // Infer alert type from rule characteristics
    if (rule.id.includes('stock')) return 'stock';
    if (rule.id.includes('validation')) return 'validation';
    if (rule.id.includes('security')) return 'security';
    return 'business';
  }
}
```

### Step 4: Create Module-Specific Engines

```typescript
// src/modules/materials/alerts/engine.ts

import { SmartAlertsEngine } from '@/lib/alerts/SmartAlertsEngine';
import { MATERIALS_SMART_RULES } from './rules';

export const materialsAlertsEngine = new SmartAlertsEngine({
  rules: MATERIALS_SMART_RULES,
  context: 'materials',
  circuitBreakerInterval: 3000 // 3 seconds
});

// Usage in hook
export function useSmartMaterialsAlerts() {
  const materials = useMaterialsStore(state => state.items);
  const actions = useAlertsActions();

  useEffect(() => {
    if (materials.length === 0) return;

    // Generate smart alerts
    const alertInputs = materialsAlertsEngine.evaluate(materials);
    
    // Clear previous smart alerts for this context
    await actions.clearAll({ 
      context: 'materials', 
      intelligence_level: 'smart' 
    });

    // Bulk create new alerts
    await actions.bulkCreate(alertInputs);
  }, [materials]);
}
```

### Step 5: Update Global Alerts Initialization

```typescript
// src/hooks/useGlobalAlertsInit.ts

export function useGlobalAlertsInit() {
  // ============================================
  // TIER 1: Critical modules (full persistence)
  // ============================================
  useSmartMaterialsAlerts();    // ✅ Smart alerts
  useSmartProductionAlerts();   // ✅ Smart alerts
  useSmartSalesAlerts();        // ✅ Smart alerts
  useSmartFulfillmentAlerts();  // ✅ Smart alerts
  useSmartFinanceFiscalAlerts(); // ✅ Smart alerts
  useSmartFinanceBillingAlerts(); // ✅ Smart alerts

  // ============================================
  // TIER 2: Standard modules (metadata service)
  // ============================================
  useAlertMetadataLoader({
    modules: [
      'products',
      'suppliers',
      'assets',
      'rentals',
      'memberships',
      'staff',
      'scheduling',
      'customers'
    ],
    refreshInterval: 60_000 // 60 seconds
  });

  // ============================================
  // TIER 3: Simple alerts only (no smart alerts)
  // ============================================
  // These modules only generate simple alerts on user actions
  // No background processing needed
}
```

---

## 📖 Developer Documentation Updates

### docs/alert/README.md (Update)

Add new sections:
- **3-Layer Alert System** explanation
- **Smart vs Simple Alerts** distinction
- **Module Alert Configuration** table

### docs/alert/SMART_ALERTS_GUIDE.md (New)

```markdown
# Smart Alerts Developer Guide

## Creating Smart Alert Rules

### Step 1: Define Rules

Create a new file: `src/modules/[module-name]/alerts/rules.ts`

\```typescript
import { SmartAlertRule } from '@/lib/alerts/types/smartRules';
import { YourModuleType } from '../types';

export const YOUR_MODULE_SMART_RULES: SmartAlertRule<YourModuleType>[] = [
  {
    id: 'your-rule-id',
    name: 'Rule Display Name',
    condition: (item) => /* your condition */,
    severity: 'high',
    title: (item) => \`Title with \${item.property}\`,
    description: (item) => \`Description\`,
    metadata: (item) => ({
      itemId: item.id,
      // ... relevant data
    })
  }
];
\```

### Step 2: Create Engine Instance

\```typescript
// src/modules/[module-name]/alerts/engine.ts
import { SmartAlertsEngine } from '@/lib/alerts/SmartAlertsEngine';
import { YOUR_MODULE_SMART_RULES } from './rules';

export const yourModuleAlertsEngine = new SmartAlertsEngine({
  rules: YOUR_MODULE_SMART_RULES,
  context: 'your-module',
  circuitBreakerInterval: 3000
});
\```

### Step 3: Create Hook

\```typescript
// src/hooks/useSmartYourModuleAlerts.ts
export function useSmartYourModuleAlerts() {
  const data = useYourModuleStore(state => state.data);
  const actions = useAlertsActions();

  useEffect(() => {
    if (data.length === 0) return;

    const alertInputs = yourModuleAlertsEngine.evaluate(data);
    
    await actions.clearAll({ 
      context: 'your-module', 
      intelligence_level: 'smart' 
    });
    
    await actions.bulkCreate(alertInputs);
  }, [data]);
}
\```
```

---

## 🎯 Migration Checklist

- [ ] **Database**
  - [ ] Run migration: `20251118_alert_system_v2.sql`
  - [ ] Verify `intelligence_level` column exists
  - [ ] Test RLS policies
  - [ ] Create metadata summary functions

- [ ] **Types**
  - [ ] Update `Alert` interface with `intelligence_level`
  - [ ] Update `CreateAlertInput` interface
  - [ ] Create `SmartAlertRule` interface
  - [ ] Create `SmartAlertsEngineConfig` interface

- [ ] **Core Library**
  - [ ] Create `SmartAlertsEngine` base class
  - [ ] Update `AlertsProvider` to handle intelligence levels
  - [ ] Update `useAlerts` hook filters
  - [ ] Add `clearAll` support for `intelligence_level` filter

- [ ] **Module Implementation** (Tier 1 - Critical)
  - [ ] Materials: Create rules + engine + hook
  - [ ] Production: Create rules + engine + hook
  - [ ] Sales: Create rules + engine + hook
  - [ ] Fulfillment: Create rules + engine + hook
  - [ ] Finance Fiscal: Create rules + engine + hook
  - [ ] Finance Billing: Create rules + engine + hook

- [ ] **Module Implementation** (Tier 2 - Standard)
  - [ ] Create metadata service
  - [ ] Implement for 18 standard modules
  - [ ] Test background refresh

- [ ] **Documentation**
  - [ ] Update `docs/alert/README.md`
  - [ ] Create `docs/alert/SMART_ALERTS_GUIDE.md`
  - [ ] Update `docs/alert/QUICK_REFERENCE.md`
  - [ ] Add examples to `docs/alert/USAGE_EXAMPLES.md`

- [ ] **Testing**
  - [ ] Unit tests for `SmartAlertsEngine`
  - [ ] Integration tests for each module
  - [ ] Performance tests (1000+ items)
  - [ ] E2E tests for alert lifecycle

---

## 📊 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Alert generation (100 items) | < 50ms | Per module, using SmartAlertsEngine |
| Alert generation (1000 items) | < 200ms | Bulk processing |
| Metadata service API call | < 100ms | All modules summary |
| Database query (active alerts) | < 30ms | Indexed queries |
| localStorage read (persisted stores) | < 80ms | Tier 1 modules |
| Total app startup (with alerts) | < 3s | Including all Tier 1 alerts |

---

## 🔮 Future Enhancements (Layer 3 - Predictive)

### Phase 1 (Current): Simple + Smart Alerts
- ✅ User action notifications
- ✅ Business rule violations
- ✅ Threshold-based alerts

### Phase 2 (Q1 2026): ML Integration
- 🔮 Time series forecasting (stock depletion predictions)
- 🔮 Anomaly detection (unusual expenses, sales patterns)
- 🔮 Churn prediction (customer engagement drops)
- 🔮 Equipment failure prediction (sensor data analysis)

### Phase 3 (Q2 2026): Advanced AI
- 🔮 Natural language alert descriptions
- 🔮 Automated resolution recommendations
- 🔮 Cross-module correlation analysis
- 🔮 Predictive resource allocation

---

## 📝 Summary

### Key Decisions

1. **3-Layer System**: Simple → Smart → Predictive (future)
2. **Universal Storage**: Single `alerts` table with `intelligence_level` field
3. **Hybrid Loading**: Persist critical (7 modules) + metadata for rest (18 modules)
4. **Module-Specific Rules**: Each module defines its own smart alert logic
5. **Clear Separation**: `type` + `intelligence_level` prevent confusion

### Benefits

- ✅ **Scalable**: Handles 31+ modules without performance issues
- ✅ **Clear**: No confusion between simple and smart alerts
- ✅ **Flexible**: Easy to add new modules or rules
- ✅ **Performant**: Hybrid approach balances speed and completeness
- ✅ **Future-proof**: Layer 3 ready for ML integration

### Next Steps

1. Review and approve architecture
2. Run database migration
3. Implement Tier 1 modules (7 critical)
4. Test and validate
5. Implement Tier 2 modules (18 standard)
6. Update documentation
7. Deploy to production

---

**Document Version:** 2.0.0  
**Last Updated:** November 18, 2025  
**Author:** GitHub Copilot + Development Team  
**Status:** Ready for Implementation
