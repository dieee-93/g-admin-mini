# 🧪 PROMPT: Suite de Tests para Floor y Kitchen Modules

**Fecha**: 2025-01-14
**Objetivo**: Crear suite completa de tests para validar Floor Management y Kitchen Display modules
**Framework**: Vitest v3.2.4 con JSdom
**Coverage target**: 70%+ (estándar del proyecto)

---

## 📋 CONTEXTO DEL PROYECTO

### Stack de Testing
- **Framework**: Vitest v3.2.4
- **Environment**: JSdom (DOM testing)
- **Utilities**: EventBusTestingHarness, MockEventStore
- **Coverage**: Text, JSON, HTML outputs
- **Commands**:
  - `pnpm test` - Run core test suite (excludes performance/stress)
  - `pnpm test:run` - Single run without watch
  - `pnpm test:coverage` - Coverage report

### Categorías de Tests
Según `CLAUDE.md`, el proyecto organiza tests en:
- `unit/` - Component/function isolation
- `integration/` - Module-to-module workflows
- `performance/` - Throughput/latency benchmarks
- `stress/` - High-load edge cases
- `business/` - Domain logic validation

### Módulos a Testear

#### 1. Floor Management Module
**Ubicación**: `src/pages/admin/operations/floor/`

**Componentes**:
- `page.tsx` (80 lines) - Main page, orchestration
- `components/FloorStats.tsx` (150 lines) - Stats con Supabase queries
- `components/FloorPlanView.tsx` (220 lines) - Grid de mesas con real-time
- `components/FloorPlanQuickView.tsx` (70 lines) - Vista simplificada para Sales
- `components/ReservationsList.tsx` (15 lines) - Placeholder

**Dependencias externas**:
- Supabase: `tables`, `parties` tables
- RPC: `pos_estimate_next_table_available`
- Real-time: Supabase subscriptions
- DecimalUtils: Financial precision
- EventBus: Cross-module events (planned)

**Business Logic**:
- Table status workflow: available → occupied → ready_for_bill → cleaning → available
- Party tracking: size, customer, seated_at, duration, total_spent
- Revenue calculation: daily_revenue per table, total revenue
- Wait time estimation: RPC-based confidence levels
- Occupancy rate: occupied/total * 100
- Turn count: # of parties served per table

#### 2. Kitchen Display Module
**Ubicación**: `src/pages/admin/operations/kitchen/`

**Componentes**:
- `page.tsx` (50 lines) - Placeholder con alert
- `components/KitchenDisplay.tsx` (526 lines) - KDS completo

**Dependencias externas**:
- EventBus: `sales.order_placed` → `kitchen.display.orders`
- EventBus: `materials.stock_updated` → `kitchen.ingredient.check`
- Supabase: Kitchen config persistence
- Link module: Auto-activate when sales + materials active

**Business Logic**:
- Order priority: VIP (3) > RUSH (2) > NORMAL (1)
- Item status workflow: PENDING → IN_PROGRESS → READY → SERVED
- Station routing: grill, fryer, salad, dessert, drinks, expedite
- Timing tracking: order_time, prep_time, completion_time
- Special instructions: allergies, modifications

---

## 🎯 REQUERIMIENTOS DE LA SUITE DE TESTS

### Objetivo Principal
Crear una suite de tests completa que valide:
1. ✅ Lógica de negocio correcta (cálculos, workflows)
2. ✅ Integración con Supabase (queries, subscriptions)
3. ✅ Real-time updates funcionan
4. ✅ EventBus communication (cross-module)
5. ✅ UI rendering sin errores
6. ✅ Edge cases y error handling

### Coverage Targets
- **Overall**: 70%+ (mínimo del proyecto)
- **Business logic**: 90%+ (cálculos críticos)
- **UI components**: 60%+ (rendering + interactions)
- **Integration**: 50%+ (external dependencies)

### Estructura de Tests

```
src/pages/admin/operations/floor/
├── __tests__/
│   ├── unit/
│   │   ├── FloorStats.test.tsx
│   │   ├── FloorPlanView.test.tsx
│   │   ├── FloorPlanQuickView.test.tsx
│   │   └── business-logic.test.ts
│   ├── integration/
│   │   ├── floor-supabase.test.ts
│   │   ├── floor-realtime.test.ts
│   │   └── floor-sales-integration.test.tsx
│   └── workflow/
│       ├── table-party-workflow.test.ts
│       └── revenue-calculation.test.ts

src/pages/admin/operations/kitchen/
├── __tests__/
│   ├── unit/
│   │   ├── KitchenDisplay.test.tsx
│   │   ├── order-sorting.test.ts
│   │   └── station-filtering.test.ts
│   ├── integration/
│   │   ├── kitchen-eventbus.test.ts
│   │   ├── kitchen-sales-integration.test.ts
│   │   └── kitchen-materials-integration.test.ts
│   └── workflow/
│       ├── order-lifecycle.test.ts
│       └── priority-handling.test.ts
```

---

## 📝 ESPECIFICACIONES DETALLADAS

### FLOOR MODULE - Unit Tests

#### Test 1: FloorStats.test.tsx
**Objetivo**: Validar cálculos de estadísticas y queries Supabase

**Casos de prueba**:
1. ✅ **Stats calculation - empty state**
   - Given: No tables in DB
   - When: Component loads
   - Then: Stats show 0/0 tables, 0% occupancy, $0 revenue

2. ✅ **Stats calculation - mixed states**
   - Given: 10 tables (5 available, 3 occupied, 2 reserved)
   - When: loadTableStats() executes
   - Then: available=5, occupied=3, occupancy=30%, correct totals

3. ✅ **Revenue calculation with DecimalUtils**
   - Given: Tables with daily_revenue [100.50, 250.75, 0, 50.25]
   - When: calculateTotalRevenue()
   - Then: Returns exactly 401.50 (no float errors)

4. ✅ **Wait time estimation - RPC call**
   - Given: Supabase RPC returns { estimated_wait_minutes: 45, confidence_level: 'high' }
   - When: loadWaitTimeEstimate() executes
   - Then: State updated correctly, alert shown if > 30 min

5. ✅ **Auto-refresh interval**
   - Given: Component mounted
   - When: 30 seconds pass
   - Then: loadTableStats() called automatically

6. ✅ **Error handling - Supabase failure**
   - Given: Supabase query throws error
   - When: loadTableStats() executes
   - Then: notify.error() called, component doesn't crash

**Mocks necesarios**:
```tsx
// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: mockTablesData,
          error: null
        }))
      }))
    })),
    rpc: vi.fn(() => ({
      data: { estimated_wait_minutes: 15, confidence_level: 'medium' },
      error: null
    }))
  }
}));

// Mock DecimalUtils
vi.mock('@/business-logic/shared/decimalUtils', () => ({
  DecimalUtils: {
    add: vi.fn((a, b) => ({ toNumber: () => parseFloat(a) + parseFloat(b) })),
    divide: vi.fn((a, b) => ({ toNumber: () => parseFloat(a) / parseFloat(b) })),
    multiply: vi.fn((a, b) => ({ toNumber: () => parseFloat(a) * parseFloat(b) })),
    formatCurrency: vi.fn((n) => `$${n.toFixed(2)}`)
  }
}));

// Mock notify
vi.mock('@/lib/notifications', () => ({
  notify: {
    error: vi.fn(),
    success: vi.fn()
  }
}));
```

**Ejemplo de test**:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FloorStats } from '../components/FloorStats';

describe('FloorStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate occupancy rate correctly', async () => {
    // Arrange
    const mockData = [
      { status: 'available', daily_revenue: 0, turn_count: 0 },
      { status: 'available', daily_revenue: 0, turn_count: 0 },
      { status: 'occupied', daily_revenue: 100, turn_count: 2 },
      { status: 'occupied', daily_revenue: 150, turn_count: 3 },
      { status: 'occupied', daily_revenue: 200, turn_count: 1 },
    ];

    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({ data: mockData, error: null })
      })
    });

    // Act
    render(<FloorStats />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/60%/i)).toBeInTheDocument(); // 3/5 * 100
      expect(screen.getByText(/3 Occupied/i)).toBeInTheDocument();
    });
  });

  it('should handle Supabase errors gracefully', async () => {
    // Arrange
    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({ data: null, error: new Error('Connection failed') })
      })
    });

    // Act
    render(<FloorStats />);

    // Assert
    await waitFor(() => {
      expect(mockNotify.error).toHaveBeenCalledWith({ title: 'Error loading stats' });
    });
  });
});
```

---

#### Test 2: FloorPlanView.test.tsx
**Objetivo**: Validar rendering de mesas y real-time updates

**Casos de prueba**:
1. ✅ **Render grid of tables**
   - Given: 12 tables en DB
   - When: Component renders
   - Then: 12 CardWrapper elements displayed

2. ✅ **Table status colors**
   - Given: Table with status='occupied'
   - When: Rendered
   - Then: Badge with colorPalette='warning'

3. ✅ **Priority icons**
   - Given: Table with priority='vip'
   - When: Rendered
   - Then: Shows '👑' icon

4. ✅ **Current party info**
   - Given: Table with current_party={ size: 4, total_spent: 125.50 }
   - When: Rendered
   - Then: Shows "Party of 4", "$125.50"

5. ✅ **Duration calculation**
   - Given: Party seated_at = 90 minutes ago
   - When: Rendered
   - Then: Shows "1h 30m"

6. ✅ **Real-time subscription**
   - Given: Component mounted
   - When: Supabase broadcasts table update
   - Then: loadTableData() called, UI updates

7. ✅ **Action buttons visibility**
   - Given: Table status='available'
   - When: Rendered
   - Then: Shows "Seat Party" button
   - And: Hides "Check Status" button

8. ✅ **Loading state**
   - Given: tables=[], loading=true
   - When: Rendered
   - Then: Shows "Loading table data..."

**Mocks necesarios**:
```tsx
// Mock Supabase with subscription
const mockSubscription = {
  unsubscribe: vi.fn()
};

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockTablesData,
            error: null
          }))
        }))
      }))
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(() => mockSubscription)
    }))
  }
}));
```

**Ejemplo de test**:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FloorPlanView } from '../components/FloorPlanView';

describe('FloorPlanView - Real-time Updates', () => {
  it('should subscribe to table changes on mount', () => {
    // Act
    render(<FloorPlanView />);

    // Assert
    expect(mockSupabase.channel).toHaveBeenCalledWith('tables-changes');
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({ table: 'tables' }),
      expect.any(Function)
    );
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should unsubscribe on unmount', () => {
    // Arrange
    const { unmount } = render(<FloorPlanView />);

    // Act
    unmount();

    // Assert
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should reload data when subscription triggers', async () => {
    // Arrange
    let subscriptionCallback;
    mockChannel.on.mockImplementation((event, config, callback) => {
      subscriptionCallback = callback;
      return mockChannel;
    });

    render(<FloorPlanView />);

    // Act - Simulate Supabase real-time event
    subscriptionCallback({ type: 'UPDATE', table: 'tables' });

    // Assert
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledTimes(2); // Initial + subscription
    });
  });
});
```

---

#### Test 3: FloorPlanQuickView.test.tsx
**Objetivo**: Validar vista simplificada para Sales POS

**Casos de prueba**:
1. ✅ **Simplified rendering**
   - Given: 10 tables
   - When: Component renders
   - Then: Shows compact grid with table numbers only

2. ✅ **Status filtering**
   - Given: Tables with various statuses
   - When: Rendered
   - Then: Shows only "Free" or "Busy" (simplified)

3. ✅ **Table selection callback**
   - Given: onTableSelect prop provided
   - When: User clicks table button
   - Then: onTableSelect(tableId) called with correct ID

4. ✅ **Disabled state for occupied tables**
   - Given: Table status='occupied'
   - When: Rendered
   - Then: Button disabled=true

5. ✅ **Real-time updates in quick view**
   - Given: Component mounted
   - When: Table status changes in DB
   - Then: Quick view updates immediately

**Ejemplo de test**:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloorPlanQuickView } from '../components/FloorPlanQuickView';

describe('FloorPlanQuickView - Sales POS Integration', () => {
  it('should call onTableSelect when table clicked', () => {
    // Arrange
    const mockOnSelect = vi.fn();
    const mockTables = [
      { id: 'table-1', number: 1, status: 'available', capacity: 4 }
    ];
    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => ({ data: mockTables, error: null })
        })
      })
    });

    render(<FloorPlanQuickView onTableSelect={mockOnSelect} />);

    // Act
    fireEvent.click(screen.getByText(/T1/i));

    // Assert
    expect(mockOnSelect).toHaveBeenCalledWith('table-1');
  });

  it('should disable occupied tables', () => {
    // Arrange
    const mockTables = [
      { id: 'table-1', number: 1, status: 'occupied', capacity: 4 }
    ];
    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => ({ data: mockTables, error: null })
        })
      })
    });

    render(<FloorPlanQuickView />);

    // Assert
    const button = screen.getByRole('button', { name: /T1/i });
    expect(button).toBeDisabled();
  });
});
```

---

#### Test 4: business-logic.test.ts
**Objetivo**: Validar lógica de negocio pura (sin UI)

**Casos de prueba**:
1. ✅ **getStatusColor mapping**
   - Given: All possible statuses
   - When: getStatusColor(status) called
   - Then: Returns correct colorPalette

2. ✅ **getPriorityIcon mapping**
   - Given: Priorities (vip, urgent, attention_needed, normal)
   - When: getPriorityIcon(priority) called
   - Then: Returns correct emoji or empty string

3. ✅ **formatDuration - minutes only**
   - Given: duration = 45 minutes
   - When: formatDuration(45)
   - Then: Returns "45m"

4. ✅ **formatDuration - hours + minutes**
   - Given: duration = 125 minutes
   - When: formatDuration(125)
   - Then: Returns "2h 5m"

5. ✅ **calculateOccupancyRate**
   - Given: 7 occupied out of 20 total
   - When: calculate()
   - Then: Returns 35.0 (exact decimal)

6. ✅ **calculateTotalRevenue with DecimalUtils**
   - Given: revenues = [100.50, 250.75, 50.25, 0]
   - When: calculateTotal()
   - Then: Returns 401.50 (no float errors)

**Ejemplo de test**:
```tsx
import { describe, it, expect } from 'vitest';
import {
  getStatusColor,
  getPriorityIcon,
  formatDuration,
  calculateOccupancyRate
} from '../utils/business-logic';

describe('Floor Business Logic', () => {
  describe('getStatusColor', () => {
    it('should return correct color for each status', () => {
      expect(getStatusColor('available')).toBe('success');
      expect(getStatusColor('occupied')).toBe('warning');
      expect(getStatusColor('reserved')).toBe('info');
      expect(getStatusColor('cleaning')).toBe('gray');
      expect(getStatusColor('ready_for_bill')).toBe('accent');
      expect(getStatusColor('maintenance')).toBe('error');
    });

    it('should return gray for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('gray');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(formatDuration(45)).toBe('45m');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(125)).toBe('2h 5m');
    });

    it('should handle exact hours', () => {
      expect(formatDuration(120)).toBe('2h 0m');
    });
  });

  describe('calculateOccupancyRate', () => {
    it('should calculate percentage correctly', () => {
      const result = calculateOccupancyRate(7, 20);
      expect(result).toBe(35.0);
    });

    it('should handle 0 total tables', () => {
      const result = calculateOccupancyRate(0, 0);
      expect(result).toBe(0);
    });

    it('should handle 100% occupancy', () => {
      const result = calculateOccupancyRate(10, 10);
      expect(result).toBe(100.0);
    });
  });
});
```

---

### FLOOR MODULE - Integration Tests

#### Test 5: floor-supabase.test.ts
**Objetivo**: Validar integración completa con Supabase

**Casos de prueba**:
1. ✅ **Query tables with parties relation**
   - Given: Supabase DB with tables + parties
   - When: loadTableData() executes
   - Then: Query includes parties relation, data formatted correctly

2. ✅ **Filter active tables only**
   - Given: DB has tables with is_active=true and false
   - When: Query executes
   - Then: Only is_active=true returned

3. ✅ **Order by table number**
   - Given: Tables in random order
   - When: Query executes
   - Then: Results ordered by number ascending

4. ✅ **RPC call for wait time**
   - Given: pos_estimate_next_table_available RPC exists
   - When: loadWaitTimeEstimate() executes
   - Then: RPC called correctly, data returned

5. ✅ **Handle missing RPC gracefully**
   - Given: RPC doesn't exist (new DB setup)
   - When: loadWaitTimeEstimate() executes
   - Then: Error logged, component doesn't crash

**Ejemplo de test**:
```tsx
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { loadTableData, loadWaitTimeEstimate } from '../services/floorApi';

describe('Floor Supabase Integration', () => {
  let supabase;

  beforeAll(() => {
    supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
  });

  it('should query tables with parties relation', async () => {
    // Act
    const result = await loadTableData(supabase);

    // Assert
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);

    if (result.data.length > 0) {
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('number');
      expect(result.data[0]).toHaveProperty('status');
      expect(result.data[0]).toHaveProperty('parties');
    }
  });

  it('should filter only active tables', async () => {
    // Act
    const result = await loadTableData(supabase);

    // Assert
    result.data?.forEach(table => {
      expect(table.is_active).toBe(true);
    });
  });

  it('should handle RPC call for wait time', async () => {
    // Act
    const result = await loadWaitTimeEstimate(supabase);

    // Assert
    if (result.data) {
      expect(result.data).toHaveProperty('estimated_wait_minutes');
      expect(result.data).toHaveProperty('confidence_level');
    }
  });
});
```

---

#### Test 6: floor-realtime.test.ts
**Objetivo**: Validar subscriptions en tiempo real

**Casos de prueba**:
1. ✅ **Subscribe to tables changes**
   - Given: Component mounted
   - When: Subscription created
   - Then: Channel 'tables-changes' created, listening to postgres_changes

2. ✅ **Handle INSERT event**
   - Given: Subscription active
   - When: New table inserted in DB
   - Then: Component reloads data, new table displayed

3. ✅ **Handle UPDATE event**
   - Given: Subscription active
   - When: Table status updated
   - Then: Component reloads data, status reflected

4. ✅ **Handle DELETE event**
   - Given: Subscription active
   - When: Table marked inactive
   - Then: Component reloads data, table removed from grid

5. ✅ **Cleanup subscription on unmount**
   - Given: Component unmounted
   - When: Cleanup runs
   - Then: subscription.unsubscribe() called

**Ejemplo de test**:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FloorPlanView } from '../components/FloorPlanView';

describe('Floor Real-time Subscriptions', () => {
  it('should create channel with correct name', () => {
    // Act
    render(<FloorPlanView />);

    // Assert
    expect(mockSupabase.channel).toHaveBeenCalledWith('tables-changes');
  });

  it('should listen to all postgres_changes events', () => {
    // Act
    render(<FloorPlanView />);

    // Assert
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: '*',
        schema: 'public',
        table: 'tables'
      }),
      expect.any(Function)
    );
  });

  it('should handle INSERT event by reloading data', async () => {
    // Arrange
    let callback;
    mockChannel.on.mockImplementation((event, config, cb) => {
      callback = cb;
      return mockChannel;
    });

    render(<FloorPlanView />);
    const initialCallCount = mockSupabase.from.mock.calls.length;

    // Act - Simulate INSERT
    callback({ eventType: 'INSERT', new: { id: 'new-table' } });

    // Assert
    await waitFor(() => {
      expect(mockSupabase.from.mock.calls.length).toBe(initialCallCount + 1);
    });
  });
});
```

---

#### Test 7: floor-sales-integration.test.tsx
**Objetivo**: Validar integración con Sales POS

**Casos de prueba**:
1. ✅ **FloorPlanQuickView embeddable in Sales**
   - Given: Sales POS component
   - When: FloorPlanQuickView imported and rendered
   - Then: Renders without errors, compact layout

2. ✅ **Table selection updates sales state**
   - Given: onTableSelect callback provided
   - When: User selects table
   - Then: salesStore.setSelectedTableId() called

3. ✅ **Real-time updates in both views**
   - Given: FloorPlanView and FloorPlanQuickView both mounted
   - When: Table status changes
   - Then: Both components update simultaneously

4. ✅ **Module exports work correctly**
   - Given: floor manifest with exports
   - When: Sales imports via manifest.exports.FloorPlanQuickView()
   - Then: Component loaded successfully

**Ejemplo de test**:
```tsx
import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { FloorPlanQuickView } from '@/pages/admin/operations/floor/components/FloorPlanQuickView';
import { useSalesStore } from '@/store/salesStore';

describe('Floor-Sales Integration', () => {
  it('should update sales store when table selected', () => {
    // Arrange
    const mockTables = [
      { id: 'table-5', number: 5, status: 'available', capacity: 4 }
    ];
    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => ({ data: mockTables, error: null })
        })
      })
    });

    const setSelectedTableId = vi.fn();
    vi.spyOn(useSalesStore, 'getState').mockReturnValue({
      setSelectedTableId
    });

    // Act
    render(
      <FloorPlanQuickView
        onTableSelect={(id) => setSelectedTableId(id)}
      />
    );

    fireEvent.click(screen.getByText(/T5/i));

    // Assert
    expect(setSelectedTableId).toHaveBeenCalledWith('table-5');
  });
});
```

---

### FLOOR MODULE - Workflow Tests

#### Test 8: table-party-workflow.test.ts
**Objetivo**: Validar flujo completo de lifecycle de mesa

**Casos de prueba**:
1. ✅ **Complete table lifecycle**
   - Given: Table available
   - When: Seat party → serve → ready for bill → pay → clean
   - Then: Status transitions correctly at each step

2. ✅ **Party assignment workflow**
   - Given: Table available, party size=4
   - When: assignParty(tableId, partyData)
   - Then: Table status='occupied', current_party populated

3. ✅ **Revenue tracking workflow**
   - Given: Party seated, total_spent increases
   - When: Payment processed
   - Then: daily_revenue updated, turn_count incremented

4. ✅ **Turn count increment**
   - Given: Table completes party cycle
   - When: Table marked available again
   - Then: turn_count += 1

5. ✅ **Multi-party turnover**
   - Given: Table serves 3 parties in sequence
   - When: All complete
   - Then: turn_count=3, daily_revenue=sum of all parties

**Ejemplo de test**:
```tsx
import { describe, it, expect } from 'vitest';
import {
  seatParty,
  completeParty,
  cleanTable
} from '../services/tableWorkflow';

describe('Table Party Workflow', () => {
  it('should complete full table lifecycle', async () => {
    // Arrange
    const tableId = 'table-1';
    const partyData = {
      size: 4,
      primary_customer_name: 'John Doe',
      estimated_duration: 90
    };

    // Act & Assert

    // Step 1: Seat party
    const seatResult = await seatParty(tableId, partyData);
    expect(seatResult.status).toBe('occupied');
    expect(seatResult.current_party.size).toBe(4);

    // Step 2: Process order (total_spent increases)
    // ... (order processing logic)

    // Step 3: Ready for bill
    const billResult = await markReadyForBill(tableId);
    expect(billResult.status).toBe('ready_for_bill');

    // Step 4: Complete party (payment processed)
    const completeResult = await completeParty(tableId, { total_spent: 125.50 });
    expect(completeResult.daily_revenue).toBeGreaterThan(0);
    expect(completeResult.turn_count).toBeGreaterThan(0);

    // Step 5: Clean table
    const cleanResult = await cleanTable(tableId);
    expect(cleanResult.status).toBe('cleaning');

    // Step 6: Mark available
    const availableResult = await markAvailable(tableId);
    expect(availableResult.status).toBe('available');
    expect(availableResult.current_party).toBeNull();
  });
});
```

---

#### Test 9: revenue-calculation.test.ts
**Objetivo**: Validar cálculos financieros precisos

**Casos de prueba**:
1. ✅ **Daily revenue aggregation**
   - Given: 5 tables with revenues [100, 250.50, 0, 75.25, 300]
   - When: calculateTotalDailyRevenue()
   - Then: Returns 725.75 (exact, no float errors)

2. ✅ **Revenue per table accuracy**
   - Given: Table with 3 completed parties [50.25, 75.00, 100.50]
   - When: updateDailyRevenue()
   - Then: daily_revenue = 225.75 (exact)

3. ✅ **Decimal precision with DecimalUtils**
   - Given: Complex calculation (revenue * tax / occupancy)
   - When: Using DecimalUtils for all operations
   - Then: Result accurate to 20 decimal places

4. ✅ **Average revenue per turn**
   - Given: daily_revenue=500, turn_count=4
   - When: calculateAvgRevenuePerTurn()
   - Then: Returns 125.00 (exact)

5. ✅ **Edge case: zero revenue**
   - Given: New table, no parties served
   - When: calculateDailyRevenue()
   - Then: Returns 0.00 (not null, not undefined)

**Ejemplo de test**:
```tsx
import { describe, it, expect } from 'vitest';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { calculateTotalRevenue, calculateAvgRevenuePerTurn } from '../utils/revenue';

describe('Revenue Calculation - Financial Precision', () => {
  it('should aggregate revenues without float errors', () => {
    // Arrange
    const revenues = ['100.50', '250.75', '50.25', '0', '300.00'];

    // Act
    const total = revenues.reduce((sum, rev) =>
      DecimalUtils.add(sum, rev, 'financial'),
      DecimalUtils.fromValue(0, 'financial')
    );

    // Assert
    expect(total.toString()).toBe('701.50');
    expect(total.toNumber()).toBe(701.50);
  });

  it('should calculate average revenue per turn precisely', () => {
    // Arrange
    const dailyRevenue = '500.00';
    const turnCount = '4';

    // Act
    const avg = DecimalUtils.divide(dailyRevenue, turnCount, 'financial');

    // Assert
    expect(avg.toString()).toBe('125.00');
  });

  it('should handle zero revenue case', () => {
    // Arrange
    const revenues = ['0', '0', '0'];

    // Act
    const total = calculateTotalRevenue(revenues);

    // Assert
    expect(total).toBe('0.00');
    expect(total).not.toBeNull();
  });
});
```

---

### KITCHEN MODULE - Unit Tests

#### Test 10: KitchenDisplay.test.tsx
**Objetivo**: Validar rendering y lógica de KDS

**Casos de prueba**:
1. ✅ **Render orders by priority**
   - Given: Orders with VIP, RUSH, NORMAL
   - When: Component renders with sortBy='priority'
   - Then: VIP first, RUSH second, NORMAL last

2. ✅ **Filter by station**
   - Given: Orders for multiple stations
   - When: selectedStation='grill'
   - Then: Shows only orders with grill items

3. ✅ **Item status colors**
   - Given: Items with PENDING, IN_PROGRESS, READY, SERVED
   - When: Rendered
   - Then: Correct color coding for each status

4. ✅ **Update item status**
   - Given: Item with status=PENDING
   - When: onUpdateItemStatus(orderId, itemId, 'IN_PROGRESS')
   - Then: Callback executed, item status updated

5. ✅ **Complete order flow**
   - Given: Order with all items READY
   - When: onCompleteOrder(orderId)
   - Then: Order marked complete, removed from active view

6. ✅ **Show/hide completed orders**
   - Given: showCompleted=false
   - When: Order completed
   - Then: Order hidden from view

7. ✅ **Station statistics calculation**
   - Given: 5 orders across 3 stations
   - When: calculateStationStats()
   - Then: Correct activeOrders, pendingItems per station

**Mocks necesarios**:
```tsx
vi.mock('@chakra-ui/react', () => ({
  // Mock all ChakraUI components used
  Box: ({ children, ...props }) => <div {...props}>{children}</div>,
  Text: ({ children }) => <span>{children}</span>,
  // ... etc
}));
```

**Ejemplo de test**:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KitchenDisplaySystem } from '../components/KitchenDisplay';
import { PriorityLevel, KitchenItemStatus } from '../../types';

describe('KitchenDisplaySystem', () => {
  it('should sort orders by priority correctly', () => {
    // Arrange
    const mockOrders = [
      { id: '1', priority: PriorityLevel.NORMAL, items: [], order_time: '10:00' },
      { id: '2', priority: PriorityLevel.VIP, items: [], order_time: '10:01' },
      { id: '3', priority: PriorityLevel.RUSH, items: [], order_time: '10:02' },
    ];

    // Act
    render(
      <KitchenDisplaySystem
        orders={mockOrders}
        onUpdateItemStatus={vi.fn()}
        onCompleteOrder={vi.fn()}
        onPriorityChange={vi.fn()}
      />
    );

    // Assert
    const orderCards = screen.getAllByTestId(/order-card/i);
    expect(orderCards[0]).toHaveTextContent('VIP');
    expect(orderCards[1]).toHaveTextContent('RUSH');
    expect(orderCards[2]).toHaveTextContent('NORMAL');
  });

  it('should filter orders by station', () => {
    // Arrange
    const mockOrders = [
      {
        id: '1',
        priority: PriorityLevel.NORMAL,
        items: [{ station: 'grill', status: KitchenItemStatus.PENDING }],
        order_time: '10:00'
      },
      {
        id: '2',
        priority: PriorityLevel.NORMAL,
        items: [{ station: 'fryer', status: KitchenItemStatus.PENDING }],
        order_time: '10:01'
      },
    ];

    // Act
    render(
      <KitchenDisplaySystem
        orders={mockOrders}
        onUpdateItemStatus={vi.fn()}
        onCompleteOrder={vi.fn()}
        onPriorityChange={vi.fn()}
        currentStation="grill"
        showAllStations={false}
      />
    );

    // Assert
    expect(screen.getByTestId('order-1')).toBeInTheDocument();
    expect(screen.queryByTestId('order-2')).not.toBeInTheDocument();
  });
});
```

---

#### Test 11: order-sorting.test.ts
**Objetivo**: Validar algoritmos de sorting

**Casos de prueba**:
1. ✅ **Sort by priority - VIP > RUSH > NORMAL**
   - Given: Mixed priority orders
   - When: sortOrders(orders, 'priority')
   - Then: Correct priority order

2. ✅ **Sort by time - oldest first**
   - Given: Orders at different times
   - When: sortOrders(orders, 'time')
   - Then: Oldest first (FIFO)

3. ✅ **Sort by table number - alphanumeric**
   - Given: Tables 1, 10, 2, 20, 3
   - When: sortOrders(orders, 'table')
   - Then: 1, 2, 3, 10, 20 (not alphabetical 1, 10, 2)

4. ✅ **Stable sort - preserve order for equal priority**
   - Given: 3 NORMAL priority orders
   - When: sortOrders(orders, 'priority')
   - Then: Original order preserved for same priority

**Ejemplo de test**:
```tsx
import { describe, it, expect } from 'vitest';
import { sortOrders } from '../utils/sorting';
import { PriorityLevel } from '../../types';

describe('Order Sorting Algorithms', () => {
  it('should sort by priority correctly', () => {
    // Arrange
    const orders = [
      { id: '1', priority: PriorityLevel.NORMAL },
      { id: '2', priority: PriorityLevel.VIP },
      { id: '3', priority: PriorityLevel.RUSH },
      { id: '4', priority: PriorityLevel.NORMAL },
    ];

    // Act
    const sorted = sortOrders(orders, 'priority');

    // Assert
    expect(sorted[0].priority).toBe(PriorityLevel.VIP);
    expect(sorted[1].priority).toBe(PriorityLevel.RUSH);
    expect(sorted[2].priority).toBe(PriorityLevel.NORMAL);
    expect(sorted[3].priority).toBe(PriorityLevel.NORMAL);
  });

  it('should sort by time with oldest first', () => {
    // Arrange
    const orders = [
      { id: '1', order_time: '2025-01-14T10:30:00' },
      { id: '2', order_time: '2025-01-14T10:15:00' },
      { id: '3', order_time: '2025-01-14T10:45:00' },
    ];

    // Act
    const sorted = sortOrders(orders, 'time');

    // Assert
    expect(sorted[0].id).toBe('2'); // 10:15
    expect(sorted[1].id).toBe('1'); // 10:30
    expect(sorted[2].id).toBe('3'); // 10:45
  });
});
```

---

#### Test 12: station-filtering.test.ts
**Objetivo**: Validar filtrado por estación

**Casos de prueba**:
1. ✅ **Filter by single station**
   - Given: Orders with items for grill, fryer, salad
   - When: filterByStation('grill')
   - Then: Returns only orders with grill items

2. ✅ **Show all stations**
   - Given: Any orders
   - When: filterByStation('all')
   - Then: Returns all orders

3. ✅ **Multi-station orders**
   - Given: Order with items for grill AND fryer
   - When: filterByStation('grill')
   - Then: Order included (has grill items)

4. ✅ **Empty station**
   - Given: No orders for dessert station
   - When: filterByStation('dessert')
   - Then: Returns empty array

**Ejemplo de test**:
```tsx
import { describe, it, expect } from 'vitest';
import { filterOrdersByStation } from '../utils/filtering';

describe('Station Filtering', () => {
  it('should filter orders by single station', () => {
    // Arrange
    const orders = [
      { id: '1', items: [{ station: 'grill' }, { station: 'salad' }] },
      { id: '2', items: [{ station: 'fryer' }] },
      { id: '3', items: [{ station: 'grill' }] },
    ];

    // Act
    const filtered = filterOrdersByStation(orders, 'grill');

    // Assert
    expect(filtered).toHaveLength(2);
    expect(filtered[0].id).toBe('1');
    expect(filtered[1].id).toBe('3');
  });

  it('should return all orders when station is "all"', () => {
    // Arrange
    const orders = [
      { id: '1', items: [{ station: 'grill' }] },
      { id: '2', items: [{ station: 'fryer' }] },
    ];

    // Act
    const filtered = filterOrdersByStation(orders, 'all');

    // Assert
    expect(filtered).toHaveLength(2);
  });
});
```

---

### KITCHEN MODULE - Integration Tests

#### Test 13: kitchen-eventbus.test.ts
**Objetivo**: Validar integración con EventBus

**Casos de prueba**:
1. ✅ **Listen to sales.order_placed**
   - Given: EventBus subscription active
   - When: sales.order_placed event emitted
   - Then: Kitchen receives event, order added to display

2. ✅ **Emit kitchen.order_ready**
   - Given: Order completed in kitchen
   - When: onCompleteOrder() called
   - Then: kitchen.order_ready event emitted

3. ✅ **Listen to materials.stock_updated**
   - Given: Material stock goes to 0
   - When: materials.stock_updated event emitted
   - Then: Kitchen shows "Out of Stock" warning

4. ✅ **EventBus hooks from manifest**
   - Given: Kitchen manifest setup() executed
   - When: Registry initialized
   - Then: Hooks registered correctly

5. ✅ **Link module auto-activation**
   - Given: Sales + Materials modules active
   - When: Module Registry checks dependencies
   - Then: Kitchen link module auto-installs

**Ejemplo de test**:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEventBus } from '@/lib/events';
import { kitchenManifest } from '@/modules/kitchen/manifest';
import { getModuleRegistry } from '@/lib/modules';

describe('Kitchen EventBus Integration', () => {
  let eventBus;
  let registry;

  beforeEach(() => {
    eventBus = getEventBus();
    registry = getModuleRegistry();
    registry.register(kitchenManifest);
  });

  it('should listen to sales.order_placed events', async () => {
    // Arrange
    const mockOrder = {
      id: 'order-123',
      items: [
        { name: 'Burger', station: 'grill', quantity: 1 }
      ],
      priority: 'NORMAL'
    };

    const handler = vi.fn();
    eventBus.on('kitchen.display.orders', handler);

    // Act
    await eventBus.emit('sales.order_placed', mockOrder);

    // Assert
    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-123',
          items: expect.any(Array),
          station: 'grill'
        })
      );
    });
  });

  it('should emit kitchen.order_ready when order completed', async () => {
    // Arrange
    const handler = vi.fn();
    eventBus.on('operations.order_ready', handler);

    // Act
    await eventBus.emit('kitchen.order_ready', {
      orderId: 'order-123',
      completedAt: new Date().toISOString()
    });

    // Assert
    await waitFor(() => {
      expect(handler).toHaveBeenCalled();
    });
  });

  it('should auto-activate when dependencies available', () => {
    // Arrange
    const salesManifest = { id: 'sales', /* ... */ };
    const materialsManifest = { id: 'materials', /* ... */ };

    // Act
    registry.register(salesManifest);
    registry.register(materialsManifest);

    const activeModules = registry.getActiveModules();

    // Assert
    expect(activeModules).toContainEqual(
      expect.objectContaining({ id: 'kitchen' })
    );
  });
});
```

---

#### Test 14: kitchen-sales-integration.test.ts
**Objetivo**: Validar workflow Sales → Kitchen

**Casos de prueba**:
1. ✅ **Order flow: POS → Kitchen Display**
   - Given: Order created in Sales POS
   - When: Order submitted
   - Then: Order appears in Kitchen Display immediately

2. ✅ **Priority propagation**
   - Given: VIP customer order in Sales
   - When: Order sent to Kitchen
   - Then: Kitchen shows VIP priority

3. ✅ **Special instructions transfer**
   - Given: Order with "No onions, extra cheese"
   - When: Sent to Kitchen
   - Then: Instructions visible in KDS

4. ✅ **Table assignment**
   - Given: Order for Table 5
   - When: Displayed in Kitchen
   - Then: Shows "Table 5" prominently

**Ejemplo de test**:
```tsx
import { describe, it, expect } from 'vitest';
import { createOrder } from '@/pages/admin/operations/sales/services/orderService';
import { getEventBus } from '@/lib/events';

describe('Kitchen-Sales Integration', () => {
  it('should receive order from POS immediately', async () => {
    // Arrange
    const eventBus = getEventBus();
    const kitchenHandler = vi.fn();
    eventBus.on('kitchen.display.orders', kitchenHandler);

    const orderData = {
      table_number: '5',
      items: [
        { name: 'Burger', quantity: 1, station: 'grill' }
      ],
      priority: 'NORMAL',
      special_instructions: 'No onions'
    };

    // Act
    await createOrder(orderData);

    // Assert
    await waitFor(() => {
      expect(kitchenHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({ name: 'Burger' })
          ]),
          station: 'grill'
        })
      );
    });
  });
});
```

---

#### Test 15: kitchen-materials-integration.test.ts
**Objetivo**: Validar integración con Materials

**Casos de prueba**:
1. ✅ **Stock depletion notification**
   - Given: Material stock goes to 0
   - When: materials.stock_updated emitted
   - Then: Kitchen shows warning for affected items

2. ✅ **Low stock warnings**
   - Given: Material below minimum threshold
   - When: Order requires that material
   - Then: Kitchen shows "Low Stock" badge

3. ✅ **Ingredient availability check**
   - Given: Recipe requires unavailable ingredient
   - When: Order placed
   - Then: Kitchen marks item as "Cannot Prepare"

**Ejemplo de test**:
```tsx
import { describe, it, expect } from 'vitest';
import { getEventBus } from '@/lib/events';

describe('Kitchen-Materials Integration', () => {
  it('should show warning when ingredient out of stock', async () => {
    // Arrange
    const eventBus = getEventBus();
    const kitchenHandler = vi.fn();
    eventBus.on('kitchen.ingredient.check', kitchenHandler);

    // Act
    await eventBus.emit('materials.stock_updated', {
      materialId: 'tomatoes',
      quantity: 0,
      available: false
    });

    // Assert
    await waitFor(() => {
      expect(kitchenHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          materialId: 'tomatoes',
          available: false
        })
      );
    });
  });
});
```

---

### KITCHEN MODULE - Workflow Tests

#### Test 16: order-lifecycle.test.ts
**Objetivo**: Validar ciclo completo de orden

**Casos de prueba**:
1. ✅ **Complete order lifecycle**
   - Given: New order arrives
   - When: PENDING → IN_PROGRESS → READY → SERVED
   - Then: Status transitions correctly, timing tracked

2. ✅ **Multi-item order coordination**
   - Given: Order with 3 items (grill, fryer, salad)
   - When: Each station marks items ready
   - Then: Order completes only when ALL items READY

3. ✅ **Timing accuracy**
   - Given: Order started at 10:00
   - When: Completed at 10:15
   - Then: prepTime = 15 minutes (exact)

4. ✅ **Priority override during workflow**
   - Given: NORMAL order in progress
   - When: Changed to RUSH mid-prep
   - Then: Order re-sorted to top of queue

**Ejemplo de test**:
```tsx
import { describe, it, expect } from 'vitest';
import { processOrderLifecycle } from '../services/orderWorkflow';
import { KitchenItemStatus } from '../../types';

describe('Order Lifecycle Workflow', () => {
  it('should complete full order lifecycle with timing', async () => {
    // Arrange
    const order = {
      id: 'order-1',
      items: [
        { id: 'item-1', name: 'Burger', status: KitchenItemStatus.PENDING, station: 'grill' }
      ],
      order_time: '2025-01-14T10:00:00'
    };

    // Act & Assert

    // Step 1: Mark in progress
    const inProgress = await updateItemStatus(order.id, 'item-1', KitchenItemStatus.IN_PROGRESS);
    expect(inProgress.status).toBe(KitchenItemStatus.IN_PROGRESS);
    expect(inProgress.started_at).toBeDefined();

    // Step 2: Mark ready
    const ready = await updateItemStatus(order.id, 'item-1', KitchenItemStatus.READY);
    expect(ready.status).toBe(KitchenItemStatus.READY);
    expect(ready.completed_at).toBeDefined();

    // Step 3: Serve
    const served = await updateItemStatus(order.id, 'item-1', KitchenItemStatus.SERVED);
    expect(served.status).toBe(KitchenItemStatus.SERVED);

    // Calculate prep time
    const prepTime = calculatePrepTime(inProgress.started_at, ready.completed_at);
    expect(prepTime).toBeGreaterThan(0);
  });

  it('should wait for all items before completing order', async () => {
    // Arrange
    const order = {
      id: 'order-1',
      items: [
        { id: 'item-1', status: KitchenItemStatus.READY },
        { id: 'item-2', status: KitchenItemStatus.IN_PROGRESS }, // Not ready yet
        { id: 'item-3', status: KitchenItemStatus.READY }
      ]
    };

    // Act
    const canComplete = canCompleteOrder(order);

    // Assert
    expect(canComplete).toBe(false);

    // Complete the pending item
    order.items[1].status = KitchenItemStatus.READY;
    expect(canCompleteOrder(order)).toBe(true);
  });
});
```

---

#### Test 17: priority-handling.test.ts
**Objetivo**: Validar manejo de prioridades

**Casos de prueba**:
1. ✅ **VIP orders jump queue**
   - Given: 5 NORMAL orders in queue
   - When: VIP order arrives
   - Then: VIP displayed first, NORMAL orders re-ordered

2. ✅ **RUSH tag during peak hours**
   - Given: Wait time > 30 minutes
   - When: New order arrives
   - Then: Auto-tagged as RUSH

3. ✅ **Priority change notification**
   - Given: Order priority changed
   - When: onPriorityChange(orderId, 'VIP')
   - Then: EventBus emits priority change event

4. ✅ **Fair queue for same priority**
   - Given: 3 NORMAL orders (10:00, 10:05, 10:10)
   - When: Displayed
   - Then: Ordered by time (FIFO within priority)

**Ejemplo de test**:
```tsx
import { describe, it, expect } from 'vitest';
import { prioritizeOrders, shouldAutoRush } from '../utils/priority';
import { PriorityLevel } from '../../types';

describe('Priority Handling', () => {
  it('should place VIP orders at front of queue', () => {
    // Arrange
    const orders = [
      { id: '1', priority: PriorityLevel.NORMAL, order_time: '10:00' },
      { id: '2', priority: PriorityLevel.NORMAL, order_time: '10:05' },
      { id: '3', priority: PriorityLevel.VIP, order_time: '10:10' },
    ];

    // Act
    const prioritized = prioritizeOrders(orders);

    // Assert
    expect(prioritized[0].id).toBe('3'); // VIP first
    expect(prioritized[1].id).toBe('1'); // NORMAL by time
    expect(prioritized[2].id).toBe('2');
  });

  it('should auto-tag RUSH when wait time high', () => {
    // Arrange
    const waitTime = 35; // minutes
    const newOrder = { priority: PriorityLevel.NORMAL };

    // Act
    const shouldRush = shouldAutoRush(waitTime);

    // Assert
    expect(shouldRush).toBe(true);
  });

  it('should maintain FIFO for same priority', () => {
    // Arrange
    const orders = [
      { id: '1', priority: PriorityLevel.NORMAL, order_time: '10:10' },
      { id: '2', priority: PriorityLevel.NORMAL, order_time: '10:00' },
      { id: '3', priority: PriorityLevel.NORMAL, order_time: '10:05' },
    ];

    // Act
    const sorted = prioritizeOrders(orders);

    // Assert
    expect(sorted[0].id).toBe('2'); // 10:00
    expect(sorted[1].id).toBe('3'); // 10:05
    expect(sorted[2].id).toBe('1'); // 10:10
  });
});
```

---

## 🚀 IMPLEMENTACIÓN DEL PROMPT

### Pasos para crear la suite

**1. Crear estructura de carpetas**:
```bash
mkdir -p src/pages/admin/operations/floor/__tests__/{unit,integration,workflow}
mkdir -p src/pages/admin/operations/kitchen/__tests__/{unit,integration,workflow}
```

**2. Configurar Vitest** (si no existe):
```bash
# vitest.config.ts ya existe en el proyecto
# Verificar que incluye:
# - environment: 'jsdom'
# - setupFiles: '@testing-library/jest-dom'
# - coverage providers
```

**3. Instalar testing utilities** (si faltan):
```bash
pnpm add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

**4. Crear tests en orden**:
```bash
# Empezar con unit tests (más fáciles)
# Luego integration tests (requieren mocks complejos)
# Finalmente workflow tests (end-to-end logic)
```

**5. Ejecutar y validar**:
```bash
pnpm test -- floor  # Solo tests de floor
pnpm test -- kitchen  # Solo tests de kitchen
pnpm test:coverage  # Coverage completo
```

---

## 📊 CRITERIOS DE ÉXITO

### Coverage Targets
- ✅ **Floor Module**: 70%+ total, 90%+ business logic
- ✅ **Kitchen Module**: 60%+ total (KDS usa ChakraUI directo, más difícil)
- ✅ **Integration**: 50%+ (external dependencies)

### Quality Metrics
- ✅ All tests pass (`pnpm test`)
- ✅ No console errors during test runs
- ✅ All edge cases covered
- ✅ Mocks realistic and maintainable
- ✅ Test execution time < 30 seconds

### Documentation
- ✅ Each test file has descriptive comments
- ✅ Complex mocks documented
- ✅ Test categories clearly separated (unit/integration/workflow)
- ✅ README with testing instructions

---

## 🎓 PATRONES Y MEJORES PRÁCTICAS

### AAA Pattern (Arrange-Act-Assert)
```tsx
it('should do something', () => {
  // Arrange - Setup
  const input = ...;
  const expected = ...;

  // Act - Execute
  const result = functionUnderTest(input);

  // Assert - Verify
  expect(result).toBe(expected);
});
```

### Mock Best Practices
- Mock external dependencies (Supabase, EventBus, DecimalUtils)
- Don't mock internal logic (business rules)
- Use `vi.fn()` for callbacks to verify calls
- Reset mocks with `beforeEach(() => vi.clearAllMocks())`

### Test Naming
```tsx
// ✅ Good - Descriptive, follows pattern
it('should calculate occupancy rate correctly when 3 of 10 tables occupied', () => {})

// ❌ Bad - Vague
it('test occupancy', () => {})
```

### Async Testing
```tsx
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText(/data loaded/i)).toBeInTheDocument();
});

// Use async/await for promises
const result = await loadTableData();
expect(result.data).toBeDefined();
```

---

## 📝 NOTAS FINALES

### Prioridad de Implementación
1. **High Priority** (hacer primero):
   - FloorStats.test.tsx - Business logic crítica
   - business-logic.test.ts - Cálculos financieros
   - revenue-calculation.test.ts - Precisión decimal

2. **Medium Priority** (hacer segundo):
   - FloorPlanView.test.tsx - UI rendering
   - floor-supabase.test.ts - DB integration
   - order-sorting.test.ts - Algoritmos

3. **Low Priority** (hacer después):
   - floor-realtime.test.ts - Real-time (complejo)
   - kitchen-eventbus.test.ts - EventBus (requiere setup)
   - E2E workflows (requieren todos los anteriores)

### Testing Anti-Patterns a Evitar
- ❌ No testear implementation details (internal state)
- ❌ No hacer tests demasiado específicos (frágiles)
- ❌ No copiar/pegar tests sin adaptar (duplicación)
- ❌ No ignorar warnings de console
- ❌ No testear solo happy path (cubrir edge cases)

### Recursos del Proyecto
- Ejemplo de tests: `src/lib/events/__tests__/` (EventBus tests como referencia)
- Testing utilities: `src/lib/events/testing/` (EventBusTestingHarness)
- Vitest config: `vitest.config.ts` (configuración completa)
- CLAUDE.md: Testing strategy section

---

**FIN DEL PROMPT**

Este prompt puede ser usado para crear la suite completa de tests en múltiples sesiones.
Cada sección es independiente y puede implementarse incrementalmente.
