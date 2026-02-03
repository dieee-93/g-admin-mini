# Migration Guide: Adding Offline Support to Modules

> **Audience:** Developers adding offline support to new modules
> **Difficulty:** Intermediate
> **Time:** 30-60 minutes per module

Step-by-step guide to migrate any G-Admin Mini module to use the offline-first sync system.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Migration Checklist](#migration-checklist)
3. [Step-by-Step Guide](#step-by-step-guide)
4. [Code Examples](#code-examples)
5. [Testing Your Migration](#testing-your-migration)
6. [Common Pitfalls](#common-pitfalls)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You Need

✅ Basic understanding of:
- TypeScript
- Supabase client
- Async/await
- React hooks (optional, for UI)

✅ Your module should have:
- Service layer with API methods
- Supabase operations (INSERT, UPDATE, DELETE)
- TypeScript types defined

✅ Recommended reading:
- [01-DESIGN.md](./01-DESIGN.md) - Architecture overview
- [05-IMPLEMENTATION_SUMMARY.md](./05-IMPLEMENTATION_SUMMARY.md) - What's already built

---

## Migration Checklist

Use this checklist for each module you migrate:

### Planning Phase
- [ ] Identify all CREATE operations in your API
- [ ] Identify all UPDATE operations in your API
- [ ] Identify all DELETE operations in your API
- [ ] Check for complex transactions (e.g., RPC calls)
- [ ] Verify entity is in Supabase database

### Implementation Phase
- [ ] Import `executeWithOfflineSupport` helper
- [ ] Wrap CREATE operations
- [ ] Wrap UPDATE operations
- [ ] Wrap DELETE operations
- [ ] Handle complex transactions (if any)
- [ ] Ensure UUIDs are generated client-side

### Testing Phase
- [ ] Write unit tests for wrapped operations
- [ ] Test offline → online flow manually
- [ ] Test CREATE operation offline
- [ ] Test UPDATE operation offline
- [ ] Test DELETE operation offline
- [ ] Verify no duplicates created
- [ ] Check IndexedDB queue works

### Documentation Phase
- [ ] Update module README (if exists)
- [ ] Add inline code comments
- [ ] Document any special cases

---

## Step-by-Step Guide

### Step 1: Locate Your Service API

Find your module's service layer. Common locations:
- `src/modules/[module]/services/`
- `src/pages/[area]/[module]/services/`

**Example:**
```
src/modules/customers/services/customerApi.ts
src/pages/admin/core/crm/customers/services/customerApi.ts
```

---

### Step 2: Import the Helper

Add the import at the top of your service file:

```typescript
import { executeWithOfflineSupport } from '@/lib/offline/executeWithOfflineSupport';
```

---

### Step 3: Identify Operations to Wrap

Look for Supabase operations:

```typescript
// CREATE operations
await supabase.from('table').insert(data)

// UPDATE operations
await supabase.from('table').update(data).eq('id', id)

// DELETE operations
await supabase.from('table').delete().eq('id', id)

// Complex operations (RPCs)
await supabase.rpc('function_name', params)
```

---

### Step 4: Wrap CREATE Operations

#### Before:
```typescript
async function createCustomer(customer: Customer): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

#### After:
```typescript
async function createCustomer(customer: Customer): Promise<Customer> {
  const data = await executeWithOfflineSupport({
    entityType: 'customers',  // ← Table name
    operation: 'CREATE',      // ← Operation type
    execute: async () => {    // ← Your original logic
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    data: customer            // ← Data to queue offline
  });

  return data;
}
```

**Key points:**
- `entityType` must match Supabase table name
- `operation` is 'CREATE'
- `execute` contains your original Supabase logic
- `data` is the object to store in queue
- UUIDv7 is generated automatically if `data.id` is missing

---

### Step 5: Wrap UPDATE Operations

#### Before:
```typescript
async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

#### After:
```typescript
async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
  const data = await executeWithOfflineSupport({
    entityType: 'customers',
    entityId: id,            // ← Required for UPDATE
    operation: 'UPDATE',
    execute: async () => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    data: { id, ...updates }  // ← Must include id
  });

  return data;
}
```

**Key points:**
- `entityId` is **required** for UPDATE
- `data` must include the `id` field

---

### Step 6: Wrap DELETE Operations

#### Before:
```typescript
async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
```

#### After:
```typescript
async function deleteCustomer(id: string): Promise<void> {
  await executeWithOfflineSupport({
    entityType: 'customers',
    entityId: id,           // ← Required for DELETE
    operation: 'DELETE',
    execute: async () => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id };        // ← Return something for optimistic UI
    },
    data: { id }            // ← Minimal data for queue
  });
}
```

**Key points:**
- `entityId` is **required** for DELETE
- `execute` should return `{ id }` for consistency
- `data` only needs the `id`

---

### Step 7: Handle Complex Transactions

If your module uses RPC or multi-step transactions:

#### Example: Order with Items

```typescript
async function createOrderWithItems(order: Order, items: OrderItem[]): Promise<Order> {
  const data = await executeWithOfflineSupport({
    entityType: 'orders',
    operation: 'CREATE',
    execute: async () => {
      // Complex RPC transaction
      const { data, error } = await supabase
        .rpc('create_order_with_items', {
          order_data: JSON.stringify(order),
          items_data: JSON.stringify(items)
        });

      if (error) throw error;
      return data;
    },
    data: {
      order: order,
      items: items
    }
  });

  return data;
}
```

**Key points:**
- Store all related data in `data` field
- The helper will queue everything as one command
- When syncing, the entire transaction executes

---

### Step 8: Update Priority (Optional)

By default, priority is based on entity type. To customize:

**File:** `src/lib/offline/OfflineCommandQueue.ts`

```typescript
this.config = {
  priorityOrder: [
    'customers',    // Priority 0 (highest)
    'materials',    // Priority 1
    'products',     // Priority 2
    'sales',        // Priority 3
    'sale_items',   // Priority 4
    'YOUR_TABLE'    // ← Add here
  ]
};
```

Lower number = higher priority = syncs first.

---

## Code Examples

### Example 1: Simple CRUD Module

**Module:** Products

```typescript
// src/modules/products/services/productApi.ts

import { supabase } from '@/lib/supabase/client';
import { executeWithOfflineSupport } from '@/lib/offline/executeWithOfflineSupport';
import type { Product } from '../types';

export const productApi = {
  // CREATE
  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const data = await executeWithOfflineSupport({
      entityType: 'products',
      operation: 'CREATE',
      execute: async () => {
        const { data, error } = await supabase
          .from('products')
          .insert(product)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      data: product
    });

    return data;
  },

  // READ (no changes needed - reads don't go offline)
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // UPDATE
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const data = await executeWithOfflineSupport({
      entityType: 'products',
      entityId: id,
      operation: 'UPDATE',
      execute: async () => {
        const { data, error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      data: { id, ...updates }
    });

    return data;
  },

  // DELETE
  async deleteProduct(id: string): Promise<void> {
    await executeWithOfflineSupport({
      entityType: 'products',
      entityId: id,
      operation: 'DELETE',
      execute: async () => {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return { id };
      },
      data: { id }
    });
  }
};
```

---

### Example 2: Module with Nested Resources

**Module:** Suppliers with Contacts

```typescript
// src/modules/suppliers/services/supplierApi.ts

export const supplierApi = {
  // Create supplier with contacts
  async createSupplierWithContacts(
    supplier: Supplier,
    contacts: Contact[]
  ): Promise<Supplier> {
    const data = await executeWithOfflineSupport({
      entityType: 'suppliers',
      operation: 'CREATE',
      execute: async () => {
        // 1. Create supplier
        const { data: supplierData, error: supplierError } = await supabase
          .from('suppliers')
          .insert(supplier)
          .select()
          .single();

        if (supplierError) throw supplierError;

        // 2. Create contacts
        const contactsWithSupplierId = contacts.map(c => ({
          ...c,
          supplier_id: supplierData.id
        }));

        const { error: contactsError } = await supabase
          .from('supplier_contacts')
          .insert(contactsWithSupplierId);

        if (contactsError) throw contactsError;

        return supplierData;
      },
      data: {
        supplier,
        contacts
      }
    });

    return data;
  }
};
```

---

### Example 3: Module with Validation

**Module:** Inventory Transfers

```typescript
export const transferApi = {
  async createTransfer(transfer: Transfer): Promise<Transfer> {
    // Validation before offline queue
    if (transfer.quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    if (transfer.from_location === transfer.to_location) {
      throw new Error('Cannot transfer to same location');
    }

    const data = await executeWithOfflineSupport({
      entityType: 'inventory_transfers',
      operation: 'CREATE',
      execute: async () => {
        const { data, error } = await supabase
          .from('inventory_transfers')
          .insert(transfer)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      data: transfer
    });

    return data;
  }
};
```

**Key point:** Client-side validation runs before queuing. Server validation happens during sync.

---

## Testing Your Migration

### 1. Unit Tests

Create a test file: `src/modules/[module]/__tests__/[api].test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { productApi } from '../services/productApi';

// Mock executeWithOfflineSupport
vi.mock('@/lib/offline/executeWithOfflineSupport', () => ({
  executeWithOfflineSupport: vi.fn(async ({ execute }) => {
    // In tests, just execute directly
    return await execute();
  })
}));

describe('productApi', () => {
  it('should create product', async () => {
    const product = {
      name: 'Test Product',
      price: 100,
      category: 'test'
    };

    const result = await productApi.createProduct(product);

    expect(result).toBeDefined();
    expect(result.name).toBe('Test Product');
  });
});
```

---

### 2. Manual Testing

Follow these steps for each operation:

#### Test CREATE Offline

1. Open your module page
2. Open DevTools → Network tab → Check "Offline"
3. Create a new record
4. Verify it appears in UI (optimistic)
5. Open DevTools → Application → IndexedDB → `g_admin_offline` → `sync_queue`
6. Verify command is in queue with `status: 'pending'`
7. Uncheck "Offline"
8. Wait 2-3 seconds
9. Verify queue is empty
10. Reload page → verify record persists

#### Test UPDATE Offline

1. Go offline
2. Edit existing record
3. Verify UI updates immediately
4. Check IndexedDB for UPDATE command
5. Go online
6. Verify sync completes
7. Reload → verify changes persist

#### Test DELETE Offline

1. Go offline
2. Delete record
3. Verify disappears from UI
4. Check IndexedDB for DELETE command
5. Go online
6. Verify sync completes
7. Reload → verify record is gone

---

### 3. Integration Test

Add to your module's test suite:

```typescript
import { describe, it, expect } from 'vitest';
import { getOfflineQueue } from '@/lib/offline';

describe('Products Offline Integration', () => {
  it('should queue product creation when offline', async () => {
    const queue = await getOfflineQueue();

    // Mock offline
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    const product = {
      name: 'Offline Product',
      price: 200
    };

    await productApi.createProduct(product);

    // Verify command in queue
    const stats = await queue.getStats();
    expect(stats.pending).toBeGreaterThan(0);
  });
});
```

---

## Common Pitfalls

### ❌ Pitfall 1: Forgetting `entityId` for UPDATE/DELETE

```typescript
// WRONG - Missing entityId
await executeWithOfflineSupport({
  entityType: 'products',
  operation: 'UPDATE',  // ← UPDATE needs entityId!
  execute: async () => { /* ... */ },
  data: updates
});

// CORRECT
await executeWithOfflineSupport({
  entityType: 'products',
  entityId: id,  // ← Always include for UPDATE/DELETE
  operation: 'UPDATE',
  execute: async () => { /* ... */ },
  data: { id, ...updates }
});
```

---

### ❌ Pitfall 2: Not Including `id` in Data

```typescript
// WRONG - Data missing id
await executeWithOfflineSupport({
  entityType: 'products',
  entityId: id,
  operation: 'UPDATE',
  execute: async () => { /* ... */ },
  data: updates  // ← Missing id!
});

// CORRECT
await executeWithOfflineSupport({
  entityType: 'products',
  entityId: id,
  operation: 'UPDATE',
  execute: async () => { /* ... */ },
  data: { id, ...updates }  // ← Include id
});
```

---

### ❌ Pitfall 3: Wrong Entity Type

```typescript
// WRONG - Typo in entity type
await executeWithOfflineSupport({
  entityType: 'product',  // ← Should be 'products' (plural)
  operation: 'CREATE',
  // ...
});

// CORRECT - Must match Supabase table name exactly
await executeWithOfflineSupport({
  entityType: 'products',  // ← Matches 'products' table
  operation: 'CREATE',
  // ...
});
```

---

### ❌ Pitfall 4: Not Handling Errors in Execute

```typescript
// WRONG - Silent failure
await executeWithOfflineSupport({
  entityType: 'products',
  operation: 'CREATE',
  execute: async () => {
    const { data, error } = await supabase.from('products').insert(product);
    return data;  // ← Doesn't throw on error!
  },
  data: product
});

// CORRECT - Throw errors
await executeWithOfflineSupport({
  entityType: 'products',
  operation: 'CREATE',
  execute: async () => {
    const { data, error } = await supabase.from('products').insert(product);
    if (error) throw error;  // ← Always throw errors
    return data;
  },
  data: product
});
```

---

### ❌ Pitfall 5: Wrapping Read Operations

```typescript
// WRONG - Don't wrap reads!
await executeWithOfflineSupport({
  entityType: 'products',
  operation: 'READ',  // ← There's no 'READ' operation
  // ...
});

// CORRECT - Only wrap mutations
async function getProducts(): Promise<Product[]> {
  // No offline support needed for reads
  const { data, error } = await supabase
    .from('products')
    .select('*');

  if (error) throw error;
  return data || [];
}
```

**Why?** Reads don't modify data, so they don't need offline queueing. Use caching instead (TanStack Query).

---

## Best Practices

### ✅ 1. Keep Execute Function Pure

The `execute` function should only contain Supabase logic:

```typescript
// GOOD
execute: async () => {
  const { data, error } = await supabase.from('products').insert(product);
  if (error) throw error;
  return data;
}

// BAD - Side effects in execute
execute: async () => {
  updateUI();  // ← Don't do this
  const { data } = await supabase.from('products').insert(product);
  showToast('Saved!');  // ← Don't do this
  return data;
}
```

---

### ✅ 2. Validate Before Queuing

Run client-side validation before calling `executeWithOfflineSupport`:

```typescript
async function createProduct(product: Product): Promise<Product> {
  // Validate first
  if (!product.name) {
    throw new Error('Name is required');
  }

  if (product.price < 0) {
    throw new Error('Price cannot be negative');
  }

  // Then queue
  return await executeWithOfflineSupport({
    // ...
  });
}
```

---

### ✅ 3. Use Descriptive Entity Types

Match your Supabase table names exactly:

```typescript
// Table: inventory_transfers
entityType: 'inventory_transfers'  // ✅ Exact match

// Table: products
entityType: 'products'  // ✅ Exact match

// Don't use:
entityType: 'transfer'   // ❌ Doesn't match table
entityType: 'product'    // ❌ Singular doesn't match
```

---

### ✅ 4. Generate UUIDs Client-Side

If your table uses UUIDs, let the helper generate them:

```typescript
// GOOD - Let helper generate UUID
const data = await executeWithOfflineSupport({
  entityType: 'products',
  operation: 'CREATE',
  execute: async () => { /* ... */ },
  data: { name: 'Product' }  // ← No id
  // Helper will add UUIDv7 automatically
});

// ALSO GOOD - Provide your own UUID
import { v7 as uuidv7 } from 'uuid';
const id = uuidv7();

const data = await executeWithOfflineSupport({
  entityType: 'products',
  operation: 'CREATE',
  execute: async () => { /* ... */ },
  data: { id, name: 'Product' }  // ← Custom id
});
```

---

### ✅ 5. Keep Data Minimal

Only store necessary data in the queue:

```typescript
// GOOD - Minimal data
data: {
  id: product.id,
  name: product.name,
  price: product.price
}

// BAD - Unnecessary data
data: {
  id: product.id,
  name: product.name,
  price: product.price,
  _metadata: { /* ... */ },    // ← Not needed
  _cached: true,                // ← Not needed
  __typename: 'Product'         // ← Not needed
}
```

---

### ✅ 6. Add Comments for Complex Logic

```typescript
// GOOD - Documented complex transaction
await executeWithOfflineSupport({
  entityType: 'orders',
  operation: 'CREATE',
  execute: async () => {
    // 1. Create order record
    const { data: order } = await supabase
      .from('orders')
      .insert(orderData);

    // 2. Create order items (many-to-many)
    await supabase
      .from('order_items')
      .insert(items.map(item => ({
        ...item,
        order_id: order.id
      })));

    // 3. Update inventory (decrement stock)
    await supabase.rpc('decrement_stock', { items });

    return order;
  },
  data: { order: orderData, items }
});
```

---

## Troubleshooting

### Problem: Commands not syncing

**Symptoms:**
- Commands stay in queue forever
- Status remains 'pending'

**Solutions:**
1. Check IndexedDB → `sync_queue` → `lastError` field
2. Verify `entityType` matches Supabase table exactly
3. Check Supabase credentials in Service Worker (for PWA)
4. Look for foreign key errors (sync order matters)
5. Check network tab for failed requests

---

### Problem: Duplicate records created

**Symptoms:**
- Same record appears multiple times
- Queue shows duplicate commands

**Solutions:**
1. Check if you're calling the API multiple times
2. Verify unique compound index in IndexedDB (should prevent this)
3. Check if `entityId` is consistent for UPDATE operations
4. Review your UI code for double-clicks or rapid submissions

---

### Problem: "entityId is required" error

**Symptoms:**
- Error thrown when calling UPDATE or DELETE

**Solutions:**
```typescript
// WRONG
await executeWithOfflineSupport({
  entityType: 'products',
  operation: 'UPDATE',  // ← Missing entityId!
  // ...
});

// CORRECT
await executeWithOfflineSupport({
  entityType: 'products',
  entityId: id,  // ← Add this
  operation: 'UPDATE',
  // ...
});
```

---

### Problem: UUIDs not generated

**Symptoms:**
- Record has no ID when created offline
- Error: "null value in column 'id'"

**Solutions:**
1. Verify your Supabase table accepts UUID for `id`
2. Check if you're overwriting the generated ID
3. Ensure `data` object doesn't have `id: null`

```typescript
// If table requires UUID
data: { name: 'Product' }  // ← Helper adds UUIDv7

// If table uses auto-increment
// Don't use offline support for auto-increment IDs
// (Client can't generate server IDs)
```

---

### Problem: TypeScript errors

**Symptoms:**
- `entityType` doesn't accept your table name
- Type errors on `data` parameter

**Solutions:**
```typescript
// If your table isn't in the type union, use type assertion
await executeWithOfflineSupport({
  entityType: 'your_new_table' as any,  // ← Temporary fix
  // ...
});

// Better: Update src/lib/supabase/database.types.ts
// Run: npm run generate:types
```

---

## Migration Time Estimates

| Module Complexity | Estimated Time | Notes |
|-------------------|----------------|-------|
| **Simple CRUD** | 15-30 minutes | 3 methods (create, update, delete) |
| **Medium** | 30-60 minutes | 5-7 methods, some validation |
| **Complex** | 1-2 hours | Nested resources, transactions, RPCs |
| **Testing** | +30 minutes | Unit + manual testing per module |

---

## Module Priority Recommendations

Migrate in this order for maximum impact:

### High Priority (Offline Critical)
1. ✅ **Materials** - Already done
2. ✅ **Sales** - Already done
3. 🔄 **Customers** - Frequently used offline
4. 🔄 **Products** - Menu changes offline
5. 🔄 **Inventory Transfers** - Stock movements

### Medium Priority (Nice to Have)
6. 🔄 **Suppliers** - Occasional offline use
7. 🔄 **Staff** - Schedule updates
8. 🔄 **Expenses** - Receipt logging
9. 🔄 **Payments** - Transaction recording

### Low Priority (Mostly Online)
10. 🔄 **Reports** - Analytics (read-only)
11. 🔄 **Settings** - Configuration (rare changes)
12. 🔄 **Integrations** - External services (online only)

---

## Success Checklist

After migrating a module, verify:

- [ ] All CREATE operations wrapped
- [ ] All UPDATE operations wrapped
- [ ] All DELETE operations wrapped
- [ ] `entityId` provided for UPDATE/DELETE
- [ ] `data.id` included in UPDATE operations
- [ ] Errors thrown in `execute` function
- [ ] Unit tests pass
- [ ] Manual testing complete (create/update/delete offline)
- [ ] IndexedDB queue verified
- [ ] Sync works when going online
- [ ] No duplicates created
- [ ] Code committed with descriptive message

---

## Getting Help

If you're stuck:

1. Review [05-IMPLEMENTATION_SUMMARY.md](./05-IMPLEMENTATION_SUMMARY.md) for examples
2. Check [04-QUICK_TESTING.md](./04-QUICK_TESTING.md) for debugging
3. Look at Materials/Sales API for reference implementation
4. Search for similar patterns in codebase
5. Ask in team chat

---

## Summary

**Key Takeaways:**

1. Import `executeWithOfflineSupport`
2. Wrap CREATE, UPDATE, DELETE (not reads)
3. Always provide `entityId` for UPDATE/DELETE
4. Include `id` in data for UPDATE operations
5. Throw errors in `execute` function
6. Test offline → online flow
7. Verify IndexedDB queue works

**That's it!** Your module now has offline support. 🎉

---

**Made with ❤️ by the G-Admin Mini Team**
