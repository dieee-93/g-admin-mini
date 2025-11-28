# 🧠 Smart Alerts Developer Guide

**Version:** 2.0.0  
**Last Updated:** November 18, 2025  
**Audience:** Developers implementing smart alert systems

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Smart Alerts vs Simple Alerts](#smart-alerts-vs-simple-alerts)
3. [Creating Smart Alert Rules](#creating-smart-alert-rules)
4. [SmartAlertsEngine Usage](#smartalertsengine-usage)
5. [Integration with Modules](#integration-with-modules)
6. [Testing Smart Alerts](#testing-smart-alerts)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

**Smart Alerts (Layer 2)** are business intelligence-driven notifications that analyze data against configurable rules and generate contextual alerts when conditions are met.

Unlike simple alerts (Layer 1) which are just user action feedback, smart alerts provide:
- 🧠 **Business Intelligence**: Analyze thresholds, patterns, relationships
- 🎯 **Context-Aware**: Include relevant data (item IDs, amounts, dates)
- 📊 **Actionable**: Guide users to specific problems
- 🔄 **Persistent**: Remain until resolved or conditions change
- ⚡ **Automated**: Generated in background, not tied to user actions

---

## Smart Alerts vs Simple Alerts

### Comparison Table

| Feature | Simple Alerts (Layer 1) | Smart Alerts (Layer 2) |
|---------|------------------------|----------------------|
| **Purpose** | User action feedback | Business intelligence |
| **Trigger** | User performs action | Data meets condition |
| **Generation** | Synchronous, immediate | Async, scheduled (60s) |
| **Duration** | Short (5-15 min auto-expire) | Long (until resolved) |
| **Persistence** | Not persisted | Persisted in DB |
| **Intelligence** | None | Business rules analysis |
| **Examples** | "Item created", "Order saved" | "5 items low stock", "Order overdue" |
| **Code Location** | In event handlers | In rules + engine |

### When to Use Each

**Use Simple Alerts when:**
- ✅ Confirming user action completed
- ✅ Showing validation errors
- ✅ System status notifications
- ✅ Achievement unlocked messages

**Use Smart Alerts when:**
- 🧠 Analyzing business metrics (stock levels, margins, etc.)
- 🧠 Detecting problematic conditions (overdue orders, conflicts)
- 🧠 Identifying opportunities (high performers, trends)
- 🧠 Monitoring thresholds (min/max values, deadlines)

---

## Creating Smart Alert Rules

### Step 1: Define Your Rules

Create a rules file for your module:

```typescript
// src/modules/[module-name]/alerts/rules.ts
import { SmartAlertRule } from '@/lib/alerts/types/smartRules';
import { MaterialItem } from '../types'; // Your module's type

export const MATERIALS_SMART_RULES: SmartAlertRule<MaterialItem>[] = [
  {
    id: 'stock-critical',
    name: 'Critical Stock Level',
    description: 'Material is completely out of stock',
    
    // Condition: When to trigger this alert
    condition: (item) => item.stock === 0,
    
    // Alert configuration
    severity: 'critical',
    title: (item) => `${item.name}: Sin stock`,
    description: (item) => `Material sin existencias. Impacto operacional inmediato.`,
    
    // Metadata with relevant context
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      currentStock: 0,
      minThreshold: item.min_stock,
      unit: item.unit
    }),
    
    // Optional: Priority (higher = evaluated first)
    priority: 100,
    
    // Optional: Should persist until resolved
    persistent: true
  },
  
  {
    id: 'stock-low',
    name: 'Low Stock Warning',
    condition: (item) => item.stock > 0 && item.stock <= item.min_stock,
    severity: 'high',
    title: (item) => `${item.name}: Stock bajo (${item.stock} ${item.unit})`,
    description: (item) => `Nivel por debajo del mínimo (${item.min_stock} ${item.unit}). Considere realizar pedido.`,
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      currentStock: item.stock,
      minThreshold: item.min_stock,
      unit: item.unit,
      recommendedOrder: Math.ceil(item.min_stock * 1.5) // Business logic
    }),
    priority: 90
  },
  
  {
    id: 'stock-overstock',
    name: 'Overstock Alert',
    condition: (item) => item.stock > item.min_stock * 3,
    severity: 'medium',
    title: (item) => `${item.name}: Sobrestock`,
    description: (item) => {
      const ratio = (item.stock / item.min_stock).toFixed(1);
      return `Stock ${ratio}x superior al mínimo. Riesgo de capital inmovilizado.`;
    },
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      currentStock: item.stock,
      minThreshold: item.min_stock,
      overstockRatio: Number((item.stock / item.min_stock).toFixed(1)),
      estimatedCapitalTied: item.stock * item.unit_cost
    }),
    priority: 50
  }
];
```

### Step 2: Rule Anatomy

```typescript
interface SmartAlertRule<T> {
  // Identification
  id: string;                    // Unique identifier
  name: string;                  // Human-readable name
  description?: string;          // What this rule detects
  
  // Core logic
  condition: (data: T, context?: any) => boolean;  // When to trigger
  
  // Alert generation
  severity: AlertSeverity;                 // 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: (data: T) => string;             // Alert title
  description: (data: T) => string;       // Alert description (can be markdown)
  metadata: (data: T) => AlertMetadata;   // Contextual data
  
  // Optional configuration
  priority?: number;             // Evaluation order (higher first)
  autoExpire?: number;           // Milliseconds to auto-expire
  persistent?: boolean;          // Should persist (default: true)
  actions?: (data: T) => AlertAction[];  // User actions
  tags?: string[];               // For categorization
}
```

---

## SmartAlertsEngine Usage

### Step 3: Create Engine Instance

```typescript
// src/modules/[module-name]/alerts/engine.ts
import { SmartAlertsEngine } from '@/lib/alerts/SmartAlertsEngine';
import { MATERIALS_SMART_RULES } from './rules';

export const materialsAlertsEngine = new SmartAlertsEngine({
  rules: MATERIALS_SMART_RULES,
  context: 'materials',
  circuitBreakerInterval: 3000, // Min 3s between evaluations
  maxAlertsPerEvaluation: 100,  // Safety limit
  debug: false // Set true for detailed logs
});
```

### Step 4: Create Hook

```typescript
// src/hooks/useSmartMaterialsAlerts.ts
import { useEffect, useRef } from 'react';
import { useMaterialsStore } from '@/store/materialsStore';
import { useAlertsActions } from '@/shared/alerts';
import { materialsAlertsEngine } from '@/modules/materials/alerts/engine';
import { logger } from '@/lib/logging';

/**
 * Hook for generating and managing smart materials alerts
 * 
 * Evaluates materials data against business rules and generates
 * contextual alerts for stock issues, expiry warnings, etc.
 */
export function useSmartMaterialsAlerts() {
  const materials = useMaterialsStore(state => state.items);
  const actions = useAlertsActions();
  
  // Track last generation to prevent excessive evaluations
  const lastGenerationRef = useRef<number>(0);
  const MIN_GENERATION_INTERVAL = 3000; // 3 seconds

  useEffect(() => {
    // Skip if no data
    if (materials.length === 0) {
      logger.debug('SmartMaterialsAlerts', 'No materials to evaluate');
      return;
    }

    // Circuit breaker: Rate limit evaluations
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationRef.current;

    if (timeSinceLastGeneration < MIN_GENERATION_INTERVAL) {
      logger.debug('SmartMaterialsAlerts', 'Evaluation throttled', {
        timeSinceLastGeneration,
        threshold: MIN_GENERATION_INTERVAL
      });
      return;
    }

    lastGenerationRef.current = now;

    // Generate smart alerts
    generateAndUpdateAlerts();
  }, [materials]); // Re-evaluate when materials change

  async function generateAndUpdateAlerts() {
    try {
      logger.info('SmartMaterialsAlerts', 'Generating smart alerts', {
        materialsCount: materials.length
      });

      // 1. Clear previous smart alerts for this context
      await actions.clearAll({ 
        context: 'materials', 
        intelligence_level: 'smart' 
      });

      // 2. Evaluate rules and generate alerts
      const alertInputs = materialsAlertsEngine.evaluate(materials);

      if (alertInputs.length === 0) {
        logger.info('SmartMaterialsAlerts', 'No alerts generated');
        return;
      }

      // 3. Bulk create alerts (much faster than individual creates)
      const alertIds = await actions.bulkCreate(alertInputs);

      logger.info('SmartMaterialsAlerts', `Generated ${alertIds.length} smart alerts`, {
        alertCount: alertIds.length,
        severities: alertInputs.reduce((acc, alert) => {
          acc[alert.severity] = (acc[alert.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

    } catch (error) {
      logger.error('SmartMaterialsAlerts', 'Error generating smart alerts', error);
    }
  }
}
```

### Step 5: Register in Global Initialization

```typescript
// src/hooks/useGlobalAlertsInit.ts
import { useSmartMaterialsAlerts } from './useSmartMaterialsAlerts';
// ... other imports

export function useGlobalAlertsInit() {
  // Critical modules with smart alerts
  useSmartMaterialsAlerts();    // ✅ Materials smart alerts
  useSmartProductsAlerts();      // ✅ Products smart alerts
  useSmartSalesAlerts();         // ✅ Sales smart alerts
  // ... etc
}
```

---

## Integration with Modules

### Complete Example: Rentals Module

```typescript
// ============================================
// 1. Define types
// ============================================
// src/modules/rentals/types.ts
export interface Booking {
  id: string;
  asset_id: string;
  asset_name: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

// ============================================
// 2. Define smart alert rules
// ============================================
// src/modules/rentals/alerts/rules.ts
import { SmartAlertRule } from '@/lib/alerts/types/smartRules';
import { Booking } from '../types';

export const RENTALS_SMART_RULES: SmartAlertRule<Booking>[] = [
  {
    id: 'rental-overdue-return',
    name: 'Overdue Return',
    condition: (booking) => {
      return booking.status === 'active' && 
             new Date(booking.end_date) < new Date();
    },
    severity: 'high',
    title: (booking) => `${booking.asset_name}: Return overdue`,
    description: (booking) => {
      const daysOverdue = Math.floor(
        (Date.now() - new Date(booking.end_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      return `Asset return overdue by ${daysOverdue} days. Customer: ${booking.customer_name}`;
    },
    metadata: (booking) => ({
      bookingId: booking.id,
      assetId: booking.asset_id,
      customerName: booking.customer_name,
      daysOverdue: Math.floor(
        (Date.now() - new Date(booking.end_date).getTime()) / (1000 * 60 * 60 * 24)
      ),
      relatedUrl: `/admin/rentals/${booking.id}`
    }),
    actions: (booking) => ([
      {
        label: 'Contact Customer',
        variant: 'primary',
        action: async () => {
          // Open contact modal or send notification
          window.location.href = `/admin/customers/${booking.customer_name}`;
        }
      },
      {
        label: 'Mark as Returned',
        variant: 'secondary',
        action: async () => {
          // Update booking status
        },
        autoResolve: true
      }
    ]),
    priority: 90
  },
  
  {
    id: 'rental-due-soon',
    name: 'Return Due Soon',
    condition: (booking) => {
      if (booking.status !== 'active') return false;
      const daysUntilDue = Math.ceil(
        (new Date(booking.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDue <= 2 && daysUntilDue > 0;
    },
    severity: 'medium',
    title: (booking) => `${booking.asset_name}: Return due in ${Math.ceil(
      (new Date(booking.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )} days`,
    description: (booking) => `Booking ending soon. Customer: ${booking.customer_name}`,
    metadata: (booking) => ({
      bookingId: booking.id,
      assetId: booking.asset_id,
      customerName: booking.customer_name,
      daysRemaining: Math.ceil(
        (new Date(booking.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    }),
    priority: 50
  }
];

// ============================================
// 3. Create engine
// ============================================
// src/modules/rentals/alerts/engine.ts
import { SmartAlertsEngine } from '@/lib/alerts/SmartAlertsEngine';
import { RENTALS_SMART_RULES } from './rules';

export const rentalsAlertsEngine = new SmartAlertsEngine({
  rules: RENTALS_SMART_RULES,
  context: 'rentals',
  circuitBreakerInterval: 3000
});

// ============================================
// 4. Create hook
// ============================================
// src/hooks/useSmartRentalsAlerts.ts
import { useEffect, useRef } from 'react';
import { useRentalsStore } from '@/store/rentalsStore';
import { useAlertsActions } from '@/shared/alerts';
import { rentalsAlertsEngine } from '@/modules/rentals/alerts/engine';
import { logger } from '@/lib/logging';

export function useSmartRentalsAlerts() {
  const bookings = useRentalsStore(state => state.bookings);
  const actions = useAlertsActions();
  const lastGenerationRef = useRef<number>(0);

  useEffect(() => {
    if (bookings.length === 0) return;

    const now = Date.now();
    if ((now - lastGenerationRef.current) < 3000) return;
    lastGenerationRef.current = now;

    (async () => {
      try {
        await actions.clearAll({ 
          context: 'rentals', 
          intelligence_level: 'smart' 
        });

        const alertInputs = rentalsAlertsEngine.evaluate(bookings);
        if (alertInputs.length > 0) {
          await actions.bulkCreate(alertInputs);
          logger.info('SmartRentalsAlerts', `Generated ${alertInputs.length} alerts`);
        }
      } catch (error) {
        logger.error('SmartRentalsAlerts', 'Error generating alerts', error);
      }
    })();
  }, [bookings]);
}
```

---

## Testing Smart Alerts

### Unit Test Example

```typescript
// src/modules/materials/alerts/__tests__/rules.test.ts
import { describe, test, expect } from 'vitest';
import { MATERIALS_SMART_RULES } from '../rules';
import { MaterialItem } from '../../types';

describe('Materials Smart Alert Rules', () => {
  test('stock-critical: triggers when stock is 0', () => {
    const rule = MATERIALS_SMART_RULES.find(r => r.id === 'stock-critical')!;
    
    const outOfStockItem: MaterialItem = {
      id: '1',
      name: 'Leche',
      stock: 0,
      min_stock: 10,
      unit: 'L'
    };

    expect(rule.condition(outOfStockItem)).toBe(true);
  });

  test('stock-low: triggers when stock <= min_stock', () => {
    const rule = MATERIALS_SMART_RULES.find(r => r.id === 'stock-low')!;
    
    const lowStockItem: MaterialItem = {
      id: '2',
      name: 'Harina',
      stock: 5,
      min_stock: 10,
      unit: 'kg'
    };

    expect(rule.condition(lowStockItem)).toBe(true);
  });

  test('generates correct alert metadata', () => {
    const rule = MATERIALS_SMART_RULES.find(r => r.id === 'stock-low')!;
    
    const item: MaterialItem = {
      id: '3',
      name: 'Azúcar',
      stock: 8,
      min_stock: 10,
      unit: 'kg'
    };

    const metadata = rule.metadata(item);
    
    expect(metadata.itemId).toBe('3');
    expect(metadata.currentStock).toBe(8);
    expect(metadata.minThreshold).toBe(10);
  });
});
```

### Integration Test Example

```typescript
// src/modules/materials/alerts/__tests__/engine.test.ts
import { describe, test, expect } from 'vitest';
import { materialsAlertsEngine } from '../engine';
import { MaterialItem } from '../../types';

describe('Materials Alerts Engine', () => {
  test('generates alerts for multiple items', () => {
    const materials: MaterialItem[] = [
      { id: '1', name: 'Leche', stock: 0, min_stock: 10, unit: 'L' },
      { id: '2', name: 'Harina', stock: 5, min_stock: 10, unit: 'kg' },
      { id: '3', name: 'Azúcar', stock: 50, min_stock: 10, unit: 'kg' } // Normal
    ];

    const alerts = materialsAlertsEngine.evaluate(materials);

    expect(alerts).toHaveLength(2); // Leche (critical) + Harina (low)
    expect(alerts[0].severity).toBe('critical'); // Leche first (higher priority)
    expect(alerts[1].severity).toBe('high');
  });

  test('respects circuit breaker', () => {
    const materials: MaterialItem[] = [
      { id: '1', name: 'Leche', stock: 0, min_stock: 10, unit: 'L' }
    ];

    // First evaluation
    const alerts1 = materialsAlertsEngine.evaluate(materials);
    expect(alerts1).toHaveLength(1);

    // Immediate second evaluation (blocked by circuit breaker)
    const alerts2 = materialsAlertsEngine.evaluate(materials);
    expect(alerts2).toHaveLength(0);
  });
});
```

---

## Best Practices

### 1. Rule Organization
```typescript
// ✅ GOOD: Group rules by category
export const MATERIALS_STOCK_RULES: SmartAlertRule<MaterialItem>[] = [/* stock rules */];
export const MATERIALS_EXPIRY_RULES: SmartAlertRule<MaterialItem>[] = [/* expiry rules */];
export const MATERIALS_SMART_RULES = [...MATERIALS_STOCK_RULES, ...MATERIALS_EXPIRY_RULES];

// ❌ BAD: All rules in one flat array with no organization
```

### 2. Clear Naming
```typescript
// ✅ GOOD: Descriptive IDs and names
{
  id: 'stock-critical-zero',
  name: 'Critical Stock: Item Out of Stock'
}

// ❌ BAD: Cryptic names
{
  id: 'rule-1',
  name: 'Check stock'
}
```

### 3. Severity Mapping
```typescript
// ✅ GOOD: Consistent severity mapping
stock === 0          → 'critical'  // Immediate action required
stock <= min_stock   → 'high'      // Urgent attention
stock > max_stock    → 'medium'    // Should address soon
about to expire      → 'low'       // Plan action

// ❌ BAD: Inconsistent or arbitrary severities
```

### 4. Performance Considerations
```typescript
// ✅ GOOD: Efficient conditions
condition: (item) => item.stock === 0  // O(1)

// ❌ BAD: Expensive operations in conditions
condition: (item) => {
  const relatedItems = fetchRelatedItemsFromAPI(item.id);  // Network call!
  return relatedItems.length > 10;
}
```

### 5. Metadata Completeness
```typescript
// ✅ GOOD: Complete, structured metadata
metadata: (item) => ({
  itemId: item.id,
  itemName: item.name,
  currentStock: item.stock,
  minThreshold: item.min_stock,
  unit: item.unit,
  relatedUrl: `/admin/materials/${item.id}`
})

// ❌ BAD: Minimal or unstructured metadata
metadata: (item) => ({ id: item.id })
```

### 6. Circuit Breaker Configuration
```typescript
// ✅ GOOD: Appropriate intervals
const engine = new SmartAlertsEngine({
  circuitBreakerInterval: 3000  // 3s for real-time modules
});

// ❌ BAD: Too aggressive
const engine = new SmartAlertsEngine({
  circuitBreakerInterval: 100  // 100ms - will spam evaluations
});
```

---

## Common Patterns

### Pattern 1: Threshold Alerts

```typescript
{
  id: 'metric-threshold-exceeded',
  condition: (item) => item.value > item.threshold,
  severity: 'high',
  title: (item) => `${item.name}: Threshold exceeded`,
  description: (item) => `Value ${item.value} exceeds threshold ${item.threshold}`,
  metadata: (item) => ({
    value: item.value,
    threshold: item.threshold,
    excessPercentage: ((item.value - item.threshold) / item.threshold * 100).toFixed(1)
  })
}
```

### Pattern 2: Date-Based Alerts

```typescript
{
  id: 'deadline-approaching',
  condition: (task) => {
    const daysUntilDeadline = Math.ceil(
      (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDeadline <= 3 && daysUntilDeadline > 0;
  },
  severity: 'medium',
  title: (task) => `${task.name}: Deadline in ${Math.ceil(
    (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )} days`,
  metadata: (task) => ({
    taskId: task.id,
    deadline: task.deadline,
    daysRemaining: Math.ceil(
      (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  })
}
```

### Pattern 3: Relational Alerts (with context)

```typescript
{
  id: 'product-missing-ingredients',
  condition: (product, context) => {
    // Context can include related data
    const { availableMaterials } = context;
    return product.recipe.some(ingredient => 
      !availableMaterials.find(m => m.id === ingredient.materialId)
    );
  },
  severity: 'high',
  title: (product) => `${product.name}: Missing ingredients`,
  description: (product, context) => {
    const missing = product.recipe.filter(ing => 
      !context.availableMaterials.find(m => m.id === ing.materialId)
    );
    return `${missing.length} ingredients not available: ${missing.map(m => m.name).join(', ')}`;
  },
  metadata: (product, context) => ({
    productId: product.id,
    missingIngredients: product.recipe.filter(ing => 
      !context.availableMaterials.find(m => m.id === ing.materialId)
    ).map(ing => ing.name)
  })
}
```

---

## Troubleshooting

### Problem: Alerts not generating

**Symptoms:** `useSmartXXXAlerts` hook runs but no alerts appear

**Solutions:**
1. Check circuit breaker: Ensure enough time passed since last evaluation
2. Check data: Verify store has data (`materials.length > 0`)
3. Check conditions: Add logs inside rule conditions
4. Check clearAll: Verify alerts aren't being immediately cleared

```typescript
// Debug version
useEffect(() => {
  console.log('Data:', materials);
  console.log('Length:', materials.length);
  
  const alerts = engine.evaluate(materials);
  console.log('Generated alerts:', alerts);
  
  // ... rest of code
}, [materials]);
```

### Problem: Too many alerts generated

**Symptoms:** Alert flooding, performance issues

**Solutions:**
1. Increase circuit breaker interval
2. Add maxAlertsPerEvaluation limit
3. Review rule conditions (too broad?)
4. Use priority to limit matching rules

```typescript
const engine = new SmartAlertsEngine({
  rules: YOUR_RULES,
  context: 'your-module',
  circuitBreakerInterval: 5000,     // Increase to 5s
  maxAlertsPerEvaluation: 50,       // Limit to 50 alerts
  debug: true                        // Enable logging
});
```

### Problem: Alerts persist after issue resolved

**Symptoms:** Alert remains even after fixing the problem

**Solutions:**
1. Ensure `clearAll` is called before bulk create
2. Use `persistent: true` with manual resolution
3. Consider `autoExpire` for time-based resolution

```typescript
// Ensure proper cleanup
await actions.clearAll({ 
  context: 'materials', 
  intelligence_level: 'smart' 
});

const alertInputs = engine.evaluate(materials);
await actions.bulkCreate(alertInputs);
```

---

## Summary

Smart Alerts provide powerful business intelligence capabilities:

1. **Define rules** with clear conditions, titles, descriptions
2. **Create engine** with appropriate configuration
3. **Build hook** that evaluates data and manages alerts
4. **Register hook** in global initialization
5. **Test thoroughly** with unit and integration tests
6. **Monitor performance** with circuit breakers and limits

For complete examples, see:
- Materials Module: Full implementation reference
- Rentals Module: This guide's complete example
- [ALERT_ARCHITECTURE_V2.md](./ALERT_ARCHITECTURE_V2.md): Architecture details

---

**Need help?** Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for API details or [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for more examples.
