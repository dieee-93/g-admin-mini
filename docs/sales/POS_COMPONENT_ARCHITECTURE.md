# 🧩 POS ADAPTATIVO - ARQUITECTURA DE COMPONENTES

**Date**: 2025-12-12 (Updated with investigation results)
**Version**: 2.0
**Focus**: Reutilización inteligente + Comunicación cross-module + Inventario real de componentes

---

## 🎯 OBJETIVO

Diseñar POS adaptativo donde:
1. ✅ Componentes se reutilizan inteligentemente (no duplicar código)
2. ✅ Módulos específicos exponen versiones lite de sus componentes
3. ✅ Comunicación clara entre Sales y Capability modules
4. ✅ Cada ProductType usa variantes apropiadas

---

## 📊 ANÁLISIS DE REUTILIZACIÓN

### Componentes Compartidos (Base)

```typescript
// Componentes que TODOS los ProductTypes usan

1. ProductSearch (base)
   ├─ Usado por: PHYSICAL, SERVICE, DIGITAL, RENTAL
   ├─ Variantes: filter por type, categoría
   └─ Location: src/shared/components/ProductSearch.tsx

2. CustomerSelector (base)
   ├─ Usado por: Todos
   ├─ Features: autocomplete, quick-add, history
   └─ Location: src/shared/components/CustomerSelector.tsx

3. PaymentProcessor (base)
   ├─ Usado por: Todos (con variantes)
   ├─ Variantes: immediate, prepay, deposit, subscription-setup
   └─ Location: src/shared/components/PaymentProcessor.tsx

4. CartSummary (base)
   ├─ Usado por: PHYSICAL, DIGITAL (con pattern CART)
   ├─ Variantes: cart-view, order-view, booking-view
   └─ Location: src/shared/components/CartSummary.tsx
```

### Componentes Específicos (Cross-Module)

```typescript
// Componentes que vienen de módulos específicos

1. TableSelector
   ├─ Full version: Onsite Module (FloorPlanView - interactive drag-drop)
   ├─ Lite version: Sales POS (TableSelectorLite - quick picker)
   ├─ Shared logic: useTableData() hook
   └─ Communication: Zustand store (tablesStore)

2. StaffSelector
   ├─ Full version: Staff Module (calendar, availability, shifts)
   ├─ Lite version: Sales POS (StaffSelectorLite - dropdown available)
   ├─ Shared logic: useStaffAvailability() hook
   └─ Communication: Scheduling service API

3. AddressForm
   ├─ Full version: Delivery Module (map, zones, validation)
   ├─ Lite version: Sales POS (AddressFormLite - basic fields)
   ├─ Shared logic: useAddressValidation() hook
   └─ Communication: Delivery service API

4. DateTimePicker
   ├─ Full version: Scheduling Module (recurring, bulk, conflicts)
   ├─ Lite version: Sales POS (DateTimePickerLite - single select)
   ├─ Shared logic: useCalendarAvailability() hook
   └─ Communication: Scheduling service API
```

---

## 🏗️ ARQUITECTURA PROPUESTA

### Pattern: Shared Logic + Variant UI

```
┌─────────────────────────────────────────────────────────┐
│ CAPABILITY MODULE (Onsite, Delivery, Scheduling, etc.)  │
│ ───────────────────────────────────────────────────────  │
│ Exports:                                                 │
│ ├─ Full Component (para su propia página)              │
│ ├─ Lite Component (para POS/otros módulos)             │
│ ├─ Shared Hook (lógica reutilizable)                   │
│ └─ Types & Interfaces                                   │
└─────────────────────────────────────────────────────────┘
                    ↓ imports
┌─────────────────────────────────────────────────────────┐
│ SALES MODULE (POS)                                       │
│ ───────────────────────────────────────────────────────  │
│ Uses:                                                    │
│ ├─ Lite Components (cuando capability activa)          │
│ ├─ Shared Hooks (lógica de negocio)                    │
│ └─ Fallback UI (cuando capability no activa)           │
└─────────────────────────────────────────────────────────┘
```

### Ejemplo Real: Table Selector

```typescript
// ════════════════════════════════════════════════════════
// ONSITE MODULE - Exports Full + Lite
// src/modules/fulfillment/onsite/components/index.ts
// ════════════════════════════════════════════════════════

// Full version (para Onsite page)
export { FloorPlanView } from './FloorPlanView';

// Lite version (para POS)
export { TableSelectorLite } from './TableSelectorLite';

// Shared hook
export { useTableData } from '../hooks/useTableData';

// Types
export type { Table, TableStatus } from '../types';


// ════════════════════════════════════════════════════════
// FULL VERSION - Interactive Floor Plan
// src/modules/fulfillment/onsite/components/FloorPlanView.tsx
// ════════════════════════════════════════════════════════

export function FloorPlanView() {
  const { tables, updateTableStatus } = useTableData();

  return (
    <DndContext>
      <Canvas>
        {tables.map(table => (
          <DraggableTableCard
            key={table.id}
            table={table}
            onMove={handleTableMove}
            onClick={handleTableClick}
            onStatusChange={updateTableStatus}
          >
            {/* Rich interactions: */}
            <TableDetails />
            <CurrentParty />
            <ServiceTimer />
            <ActionMenu />
          </DraggableTableCard>
        ))}
      </Canvas>
    </DndContext>
  );
}


// ════════════════════════════════════════════════════════
// LITE VERSION - Quick Picker for POS
// src/modules/fulfillment/onsite/components/TableSelectorLite.tsx
// ════════════════════════════════════════════════════════

interface TableSelectorLiteProps {
  value?: string; // selected table_id
  onChange: (tableId: string) => void;
  filter?: 'available' | 'occupied' | 'all';
  showOccupancyInfo?: boolean;
}

export function TableSelectorLite({
  value,
  onChange,
  filter = 'available',
  showOccupancyInfo = true
}: TableSelectorLiteProps) {
  // ✅ Reuses same data hook as full version
  const { tables, isLoading } = useTableData();

  // Filter logic
  const filteredTables = useMemo(() => {
    if (filter === 'all') return tables;
    return tables.filter(t =>
      filter === 'available' ? t.status === 'AVAILABLE' : t.status === 'OCCUPIED'
    );
  }, [tables, filter]);

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Label>Mesa</Select.Label>
      <Select.Trigger>
        <Select.ValueText placeholder="Seleccionar mesa" />
      </Select.Trigger>

      <Select.Content>
        {filteredTables.map(table => (
          <Select.Item key={table.id} value={table.id}>
            <HStack gap="2">
              {/* Visual indicator */}
              <Badge colorPalette={getTableColor(table.status)}>
                Mesa {table.number}
              </Badge>

              {/* Capacity */}
              <Text fontSize="sm" color="gray.600">
                ({table.capacity} personas)
              </Text>

              {/* Occupancy info (optional) */}
              {showOccupancyInfo && table.status === 'OCCUPIED' && (
                <Text fontSize="xs" color="orange.600">
                  ${table.currentBill} · {table.partySize} personas
                </Text>
              )}
            </HStack>
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}


// ════════════════════════════════════════════════════════
// SHARED HOOK - Business Logic
// src/modules/fulfillment/onsite/hooks/useTableData.ts
// ════════════════════════════════════════════════════════

export function useTableData() {
  const tables = useTablesStore(state => state.tables);
  const isLoading = useTablesStore(state => state.isLoading);
  const updateTableStatus = useTablesStore(state => state.updateStatus);

  // Real-time updates (Supabase subscription)
  useEffect(() => {
    const subscription = supabase
      .channel('tables-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tables'
      }, (payload) => {
        // Update store
        useTablesStore.getState().syncTable(payload.new);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  return {
    tables,
    isLoading,
    updateTableStatus,
    // ... other table operations
  };
}


// ════════════════════════════════════════════════════════
// SALES POS - Uses Lite Version
// src/pages/admin/operations/sales/components/POS/PhysicalOnsitePOS.tsx
// ════════════════════════════════════════════════════════

import { TableSelectorLite } from '@/modules/fulfillment/onsite/components';

export function PhysicalOnsitePOS() {
  const [selectedTable, setSelectedTable] = useState<string>();

  return (
    <Stack gap="4">
      {/* 1. Context Selection */}
      <FormSection title="Contexto de Venta">
        <TableSelectorLite
          value={selectedTable}
          onChange={setSelectedTable}
          filter="available"
          showOccupancyInfo={false} // POS no necesita ver $ actual
        />
      </FormSection>

      {/* 2. Products */}
      <FormSection title="Productos">
        <ProductSearch filter={{ type: 'PHYSICAL' }} />
      </FormSection>

      {/* 3. Order Items (not cart, direct order) */}
      <OrderItemsList items={orderItems} />

      {/* 4. Payment */}
      <PaymentProcessor mode="immediate" />
    </Stack>
  );
}
```

---

## 🔄 COMUNICACIÓN CROSS-MODULE

### Strategy 1: Shared Stores (Zustand)

```typescript
// Para datos que se actualizan en tiempo real y se usan en múltiples módulos

// src/store/tablesStore.ts
export const useTablesStore = create<TablesState>((set, get) => ({
  tables: [],
  isLoading: false,

  // Actions
  fetchTables: async () => {
    set({ isLoading: true });
    const tables = await onsiteService.getTables();
    set({ tables, isLoading: false });
  },

  updateStatus: async (tableId, status) => {
    // Optimistic update
    set(state => ({
      tables: state.tables.map(t =>
        t.id === tableId ? { ...t, status } : t
      )
    }));

    // Persist
    await onsiteService.updateTableStatus(tableId, status);
  },

  syncTable: (updatedTable) => {
    // Called by real-time subscription
    set(state => ({
      tables: state.tables.map(t =>
        t.id === updatedTable.id ? updatedTable : t
      )
    }));
  }
}));

// ✅ Used by both Onsite Module AND Sales POS
```

### Strategy 2: Service Layer (API)

```typescript
// Para operaciones que necesitan lógica de negocio o validación

// src/modules/fulfillment/onsite/services/onsiteService.ts
export const onsiteService = {
  // Get tables with business logic applied
  async getAvailableTables(options?: {
    minCapacity?: number;
    section?: string;
  }): Promise<Table[]> {
    const { data } = await supabase
      .from('tables')
      .select('*')
      .eq('status', 'AVAILABLE')
      .gte('capacity', options?.minCapacity || 1)
      .order('number');

    return data || [];
  },

  // Create sale for table
  async createSaleForTable(tableId: string, saleData: CreateSaleData) {
    // 1. Validate table is available
    const table = await this.getTable(tableId);
    if (table.status !== 'AVAILABLE') {
      throw new Error('Mesa no disponible');
    }

    // 2. Create sale
    const sale = await saleApi.createSale({
      ...saleData,
      fulfillment_type: 'onsite',
      table_id: tableId
    });

    // 3. Update table status
    await this.updateTableStatus(tableId, 'OCCUPIED');

    // 4. Emit event
    await EventBus.emit('onsite.table.occupied', {
      tableId,
      saleId: sale.id
    }, 'OnsiteModule');

    return sale;
  }
};

// ✅ Used by Sales POS to create sales with table
```

### Strategy 3: Custom Hooks (Abstraction)

```typescript
// Para lógica reutilizable con estado local

// src/modules/scheduling/hooks/useStaffAvailability.ts
export function useStaffAvailability(date: Date, serviceId?: string) {
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAvailability = async () => {
      setIsLoading(true);

      // 1. Get staff assigned to service (if specified)
      let staff = serviceId
        ? await schedulingService.getStaffForService(serviceId)
        : await schedulingService.getAllStaff();

      // 2. Filter by availability on date
      const available = await Promise.all(
        staff.map(async (s) => {
          const isAvailable = await schedulingService.checkAvailability(
            s.id,
            date
          );
          return isAvailable ? s : null;
        })
      );

      setAvailableStaff(available.filter(Boolean));
      setIsLoading(false);
    };

    loadAvailability();
  }, [date, serviceId]);

  return { availableStaff, isLoading };
}

// ✅ Used by both Scheduling Module AND Sales POS (SERVICE type)
```

---

## 🧩 MOCKUPS CON COMPONENTES REALES

### PHYSICAL - Onsite (Mesa)

```typescript
// ════════════════════════════════════════════════════════
// COMPONENT TREE
// ════════════════════════════════════════════════════════

<PhysicalOnsitePOS>
  ├─ <ContextSection>
  │  └─ <TableSelectorLite>                    ← From Onsite Module
  │     ├─ Uses: useTableData()                ← Shared hook
  │     └─ Shows: Available tables only
  │
  ├─ <ProductsSection>
  │  └─ <ProductSearch>                        ← Shared component
  │     ├─ Filter: type='PHYSICAL'
  │     └─ onSelect → addToOrder()
  │
  ├─ <OrderItemsSection>
  │  └─ <DirectOrderList>                      ← Specific variant
  │     ├─ Shows: Items + "Enviar a Cocina"
  │     └─ NOT a cart (immediate dispatch)
  │
  └─ <PaymentSection>
     └─ <PaymentProcessor>                     ← Shared component
        ├─ Mode: 'immediate'
        └─ onComplete → createSaleForTable()


// ════════════════════════════════════════════════════════
// UI MOCKUP
// ════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│ POS - Venta Onsite                                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ 1. CONTEXTO                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Mesa: [Mesa 5 (4 personas) ▼]                       │ │
│ │       ↑ TableSelectorLite                           │ │
│ │       Uses: useTableData() from Onsite Module       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 2. PRODUCTOS                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Buscar: [Hamburguesa.....................]  [🔍]   │ │
│ │         ↑ ProductSearch (shared)                    │ │
│ │                                                      │ │
│ │ Resultados:                                         │ │
│ │ ┌──────────────────────┐ ┌──────────────────────┐ │ │
│ │ │ Hamburguesa Clásica  │ │ Hamburguesa Bacon    │ │ │
│ │ │ $850                 │ │ $950                 │ │ │
│ │ │ [+ Agregar]          │ │ [+ Agregar]          │ │ │
│ │ └──────────────────────┘ └──────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 3. ORDEN (Mesa 5)                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ • Hamburguesa Clásica × 2    $1,700                 │ │
│ │   [Enviar a Cocina 🍳]  [✕ Quitar]                 │ │
│ │                                                      │ │
│ │ • Papas Fritas × 1           $400                   │ │
│ │   [Enviar a Cocina 🍳]  [✕ Quitar]                 │ │
│ │                                                      │ │
│ │ ─────────────────────────────────────                │ │
│ │ Cuenta Mesa 5:              $2,100                  │ │
│ │ (Items enviados + nuevos)                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 4. ACCIONES                                              │
│ [Cerrar Cuenta y Cobrar] [Seguir Agregando Items]       │
│                                                           │
└─────────────────────────────────────────────────────────┘

// Pattern: DIRECT_ORDER
// Items se envían a cocina INMEDIATAMENTE, no esperan checkout
```

### SERVICE - Appointment

```typescript
// ════════════════════════════════════════════════════════
// COMPONENT TREE
// ════════════════════════════════════════════════════════

<ServiceAppointmentPOS>
  ├─ <ServiceSelection>
  │  └─ <ProductSearch>                        ← Shared component
  │     ├─ Filter: type='SERVICE'
  │     └─ onSelect → setSelectedService()
  │
  ├─ <SchedulingSection>
  │  ├─ <DateTimePickerLite>                   ← From Scheduling Module
  │  │  ├─ Uses: useCalendarAvailability()     ← Shared hook
  │  │  └─ Shows: Available slots only
  │  │
  │  └─ <StaffSelectorLite>                    ← From Staff Module
  │     ├─ Uses: useStaffAvailability()        ← Shared hook
  │     └─ Filters: Staff assigned to service
  │
  ├─ <CustomerSection>
  │  └─ <CustomerSelector>                     ← Shared component
  │
  └─ <PaymentSection>
     └─ <PaymentProcessor>                     ← Shared component
        ├─ Mode: 'prepay' or 'on-service'
        └─ onComplete → createAppointment()


// ════════════════════════════════════════════════════════
// UI MOCKUP
// ════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│ POS - Reserva de Servicio                                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ 1. SERVICIO                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Servicio: [Corte de Pelo Clásico ▼]                 │ │
│ │           ↑ ProductSearch (filter: SERVICE)         │ │
│ │ Duración: 30 min                                     │ │
│ │ Precio: $500                                         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 2. FECHA Y HORA                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Fecha: [2025-12-15 📅]                               │ │
│ │                                                      │ │
│ │ Horarios disponibles:                                │ │
│ │ [09:00] [09:30] [10:00] [10:30] [11:00] ...        │ │
│ │                   ↑ Selected                        │ │
│ │         ↑ DateTimePickerLite                        │ │
│ │         Uses: useCalendarAvailability()             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 3. PROFESIONAL                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Peluquero: [Juan Pérez ▼]                           │ │
│ │            ↑ StaffSelectorLite                      │ │
│ │            Uses: useStaffAvailability()             │ │
│ │            Shows: Solo disponibles 10:00 del 15/12  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 4. CLIENTE                                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Cliente: [María González]                           │ │
│ │ Teléfono: +54 9 11 1234-5678                        │ │
│ │ [Enviar recordatorio por SMS]                       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 5. RESUMEN                                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Corte de Pelo - Juan Pérez                          │ │
│ │ 15/12/2025 a las 10:00 (30 min)                     │ │
│ │ Total: $500                                          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ [⚡ Reservar y Pagar Ahora] [📅 Reservar sin Prepago]   │
│                                                           │
└─────────────────────────────────────────────────────────┘

// Pattern: BOOKING
// Crea appointment + sale (prepago opcional)
```

### RENTAL - Equipment

```typescript
// ════════════════════════════════════════════════════════
// COMPONENT TREE
// ════════════════════════════════════════════════════════

<RentalPOS>
  ├─ <ItemSelection>
  │  └─ <ProductSearch>                        ← Shared component
  │     ├─ Filter: type='RENTAL'
  │     └─ onSelect → setSelectedItem()
  │
  ├─ <PeriodSection>
  │  └─ <RentalPeriodPicker>                   ← From Rental Module
  │     ├─ Uses: useRentalAvailability()       ← Shared hook
  │     ├─ From: Date + Time
  │     ├─ To: Date + Time
  │     └─ Shows: Availability calendar
  │
  ├─ <DepositSection>
  │  └─ <DepositCalculator>                    ← From Rental Module
  │     └─ Auto-calculates based on item value
  │
  ├─ <CustomerSection>
  │  └─ <CustomerSelector>                     ← Shared component
  │
  └─ <PaymentSection>
     └─ <PaymentProcessor>                     ← Shared component
        ├─ Mode: 'deposit'
        └─ Shows: Rental fee + Deposit
        └─ onComplete → createRental()


// ════════════════════════════════════════════════════════
// UI MOCKUP
// ════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│ POS - Alquiler de Equipo                                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ 1. EQUIPO                                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Item: [Esquís Rossignol - Avanzado ▼]               │ │
│ │ Tarifa: $200/día                                     │ │
│ │ Depósito: $500 (reembolsable)                       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 2. PERÍODO                                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Retiro:    [15/12/2025  09:00] 📅                   │ │
│ │ Devolución: [18/12/2025  18:00] 📅                  │ │
│ │                                                      │ │
│ │ Duración: 3 días 9 horas = 3.375 días               │ │
│ │           ↑ RentalPeriodPicker                      │ │
│ │           Uses: useRentalAvailability()             │ │
│ │                                                      │ │
│ │ Disponibilidad: ✅ Libre en este período            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 3. LUGAR DE RETIRO/DEVOLUCIÓN                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Retiro:    [⚪ En tienda  ⚪ Delivery]               │ │
│ │ Devolución: [⚪ En tienda  ⚪ Pickup]                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 4. CLIENTE                                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Cliente: [Pedro Martínez]                           │ │
│ │ DNI: 12.345.678 (requerido para depósito)           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 5. CÁLCULO                                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Tarifa: $200/día × 3.375 días    =  $675.00        │ │
│ │ Depósito (reembolsable)          =  $500.00        │ │
│ │ ─────────────────────────────────────────────        │ │
│ │ TOTAL A PAGAR:                      $1,175.00       │ │
│ │ (Se reembolsan $500 al devolver en buen estado)    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ [Confirmar Alquiler y Pagar]                             │
│                                                           │
└─────────────────────────────────────────────────────────┘

// Pattern: BOOKING + Deposit
// Crea rental booking + sale con deposit
```

---

## 📦 COMPONENTES COMPARTIDOS - DETALLE

### 1. ProductSearch (Base Component)

```typescript
// Location: src/shared/components/ProductSearch/ProductSearch.tsx

interface ProductSearchProps {
  filter?: {
    type?: ProductType;
    category?: string;
    tags?: string[];
  };
  onSelect: (product: Product) => void;
  variant?: 'grid' | 'list' | 'compact';
  placeholder?: string;
}

export function ProductSearch({
  filter,
  onSelect,
  variant = 'grid',
  placeholder = 'Buscar productos...'
}: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const { products, isLoading } = useProductSearch(query, filter);

  return (
    <Stack gap="4">
      <InputField
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        leftIcon={<SearchIcon />}
      />

      {variant === 'grid' && (
        <ProductGrid products={products} onSelect={onSelect} />
      )}

      {variant === 'list' && (
        <ProductList products={products} onSelect={onSelect} />
      )}

      {variant === 'compact' && (
        <ProductDropdown products={products} onSelect={onSelect} />
      )}
    </Stack>
  );
}

// ✅ Reutilizable para todos los ProductTypes
```

### 2. PaymentProcessor (Base + Variants)

```typescript
// Location: src/shared/components/PaymentProcessor/PaymentProcessor.tsx

type PaymentMode =
  | 'immediate'      // Pago completo ahora
  | 'prepay'         // Pago adelantado (appointments)
  | 'deposit'        // Pago + depósito (rentals)
  | 'subscription';  // Setup recurring payment (memberships)

interface PaymentProcessorProps {
  amount: number;
  mode: PaymentMode;
  depositAmount?: number; // Para mode='deposit'
  onComplete: (paymentData: PaymentData) => Promise<void>;
}

export function PaymentProcessor({
  amount,
  mode,
  depositAmount,
  onComplete
}: PaymentProcessorProps) {
  // Mode-specific rendering
  const renderPaymentDetails = () => {
    switch (mode) {
      case 'immediate':
        return <ImmediatePayment amount={amount} />;

      case 'prepay':
        return <PrepaymentOptions amount={amount} />;

      case 'deposit':
        return (
          <DepositPayment
            rentalAmount={amount}
            depositAmount={depositAmount!}
          />
        );

      case 'subscription':
        return <SubscriptionSetup amount={amount} />;
    }
  };

  return (
    <Card>
      <CardHeader>Pago</CardHeader>
      <CardBody>
        {renderPaymentDetails()}

        {/* Common payment methods */}
        <PaymentMethodSelector />

        <Button onClick={handlePayment}>
          {getPaymentButtonText(mode)}
        </Button>
      </CardBody>
    </Card>
  );
}

// ✅ Un componente, múltiples modos de pago
```

---

## 🔄 EJEMPLO COMPLETO: Physical Delivery

```typescript
// ════════════════════════════════════════════════════════
// COMPONENT TREE
// ════════════════════════════════════════════════════════

<PhysicalDeliveryPOS>
  ├─ <DeliveryAddressSection>
  │  └─ <AddressFormLite>                      ← From Delivery Module
  │     ├─ Uses: useDeliveryZones()            ← Shared hook
  │     └─ Validates: Zone coverage
  │
  ├─ <ProductsSection>
  │  └─ <ProductSearch>                        ← Shared component
  │     ├─ Filter: type='PHYSICAL'
  │     └─ onSelect → addToCart()
  │
  ├─ <CartSection>
  │  └─ <CartSummary>                          ← Shared component
  │     ├─ Variant: 'cart'
  │     └─ Shows: Items + quantities
  │
  ├─ <DeliveryOptionsSection>
  │  └─ <DeliveryTimePicker>                   ← From Delivery Module
  │     └─ Shows: ASAP or Scheduled
  │
  └─ <PaymentSection>
     └─ <PaymentProcessor>                     ← Shared component
        ├─ Mode: 'immediate'
        └─ Includes: Delivery fee


// ════════════════════════════════════════════════════════
// UI MOCKUP
// ════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│ POS - Pedido Delivery                                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ 1. DIRECCIÓN DE ENTREGA                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Calle: [Av. Corrientes 1234...................]      │ │
│ │ Piso/Depto: [5° B]  Entre calles: [.............]   │ │
│ │ Barrio: [Almagro]  CP: [1414]                       │ │
│ │ Teléfono: [11 1234-5678]                            │ │
│ │                                                      │ │
│ │ ✅ Zona: Almagro - Costo envío: $300                │ │
│ │    ↑ AddressFormLite + useDeliveryZones()          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 2. PRODUCTOS                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Search products...........................]  [🔍]  │ │
│ │                                                      │ │
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │ │
│ │ │ Pizza Muzza  │ │ Empanadas    │ │ Coca Cola    │ │ │
│ │ │ $1,200       │ │ $150 c/u     │ │ $400         │ │ │
│ │ │ [+ Agregar]  │ │ [+ Agregar]  │ │ [+ Agregar]  │ │ │
│ │ └──────────────┘ └──────────────┘ └──────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 3. CARRITO                                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ • Pizza Muzza × 1          $1,200                   │ │
│ │   [- 1 +] [✕]                                       │ │
│ │                                                      │ │
│ │ • Empanadas × 12           $1,800                   │ │
│ │   [- 12 +] [✕]                                      │ │
│ │                                                      │ │
│ │ • Coca Cola 2L × 2         $800                     │ │
│ │   [- 2 +] [✕]                                       │ │
│ │                                                      │ │
│ │ ─────────────────────────────────────                │ │
│ │ Subtotal:                  $3,800                   │ │
│ │ Envío (Almagro):           $300                     │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  │ │
│ │ TOTAL:                     $4,100                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ 4. TIEMPO DE ENTREGA                                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚪ Lo antes posible (45-60 min)                      │ │
│ │ ⚪ Programado: [Hoy 20:00 ▼]                         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ [Proceder al Pago]                                       │
│                                                           │
└─────────────────────────────────────────────────────────┘

// Pattern: CART
// Acumula items → Checkout → Pago → Dispatch
```

---

## ✅ DECISIONES DE REUTILIZACIÓN

### Full vs Lite - Criterios

```
CREATE LITE VERSION si:
✅ El componente full tiene demasiadas features para POS
✅ El componente full tiene interacciones complejas no necesarias
✅ El POS necesita solo selección rápida, no gestión

REUSE FULL si:
✅ El componente ya es simple/focused
✅ No hay features "extra" que distraigan
✅ El comportamiento es idéntico

SHARED HOOK siempre:
✅ Business logic debe estar en hooks compartidos
✅ Full y Lite usan mismos hooks
✅ Un solo source of truth para data
```

### Ejemplos Aplicados

```
Table Selector:
├─ LITE VERSION ✅ (Full tiene drag-drop, floor plan visual)
├─ Shared hook: useTableData()
└─ Communication: tablesStore (Zustand)

Product Search:
├─ REUSE FULL ✅ (componente ya es focused, solo buscar)
├─ Props: filter por type
└─ Communication: productsStore

Payment Processor:
├─ REUSE FULL con modes ✅ (diferentes modos, mismo componente)
├─ Props: mode determina variant
└─ Communication: paymentService

Staff Selector:
├─ LITE VERSION ✅ (Full tiene calendar view, shift management)
├─ Shared hook: useStaffAvailability()
└─ Communication: staffService API
```

---

## 📊 RESUMEN DE COMPONENTES POR PRODUCTTYPE

```
PHYSICAL Onsite:
✓ TableSelectorLite (from Onsite)
✓ ProductSearch (shared)
✓ DirectOrderList (specific)
✓ PaymentProcessor (shared, mode='immediate')

PHYSICAL Delivery:
✓ AddressFormLite (from Delivery)
✓ ProductSearch (shared)
✓ CartSummary (shared, variant='cart')
✓ DeliveryTimePicker (from Delivery)
✓ PaymentProcessor (shared, mode='immediate')

SERVICE:
✓ ProductSearch (shared, filter=SERVICE)
✓ DateTimePickerLite (from Scheduling)
✓ StaffSelectorLite (from Staff)
✓ CustomerSelector (shared)
✓ PaymentProcessor (shared, mode='prepay')

DIGITAL:
✓ ProductSearch (shared, filter=DIGITAL)
✓ EmailForm (specific, simple)
✓ CartSummary (shared, variant='cart')
✓ PaymentProcessor (shared, mode='immediate')

RENTAL:
✓ ProductSearch (shared, filter=RENTAL)
✓ RentalPeriodPicker (from Rental)
✓ DepositCalculator (from Rental)
✓ CustomerSelector (shared)
✓ PaymentProcessor (shared, mode='deposit')

MEMBERSHIP:
✓ PlanSelector (from Membership, specific)
✓ BillingFrequencyPicker (from Membership)
✓ CustomerSelector (shared)
✓ PaymentProcessor (shared, mode='subscription')
```

---

---

## 🔍 INVESTIGACIÓN REALIZADA - COMPONENTES EXISTENTES

**Date**: 2025-12-12
**Status**: ✅ Investigation Complete

### ✅ COMPONENTES QUE YA EXISTEN (Reutilizables)

#### 1. **TimeSlotPicker** (EXCELENTE - Priority Reuse)
**Location**: `src/shared/ui/components/business/TimeSlotPicker.tsx` (14KB, 481 lines)

**Why it's excellent**:
- ✅ Generic, configurable, production-ready
- ✅ **Compact mode** perfect for POS
- ✅ Validation + conflict detection
- ✅ Capacity tracking (assigned/total)
- ✅ Single/Multiple/Range selection modes
- ✅ Quick Time Generator (presets: mañana, tarde, noche, jornada)
- ✅ Custom validators
- ✅ Loading + Empty states

**Use for**:
- ✅ SERVICE POS → Combine with date picker = DateTimePickerLite
- ✅ PICKUP POS → Perfect as-is
- ✅ DELIVERY POS (scheduled) → Works

**Decision**: ✅✅✅ REUSE THIS - DO NOT create new TimeSlotPicker

---

#### 2. **Unified Calendar System** (EXISTS in shared/)
**Location**: `src/shared/calendar/`

**Structure**:
```
src/shared/calendar/
├─ components/UnifiedCalendar.tsx
├─ engine/UnifiedCalendarEngine.ts
├─ types/DateTimeTypes.ts ← BookingType, ResourceType confirmed!
├─ adapters/BaseCalendarAdapter.ts
└─ hooks/useCalendarEngine.ts
```

**Key Types** (`DateTimeTypes.ts`):
```typescript
export type BookingType =
  | 'appointment' | 'class' | 'space' | 'rental'
  | 'shift' | 'event' | 'maintenance' | 'blocked';

export type ResourceType =
  | 'staff' | 'room' | 'equipment' | 'vehicle' | 'table' | 'asset';
```

**Decision**: ✅ Confirmed - Generic booking system exists and works

---

#### 3. **OnsiteTableSelector** (EXISTS)
**Location**: `src/modules/fulfillment/onsite/components/OnsiteTableSelector.tsx` (15KB)

**HookPoint**: Already registered as `sales.pos.context_selector`

**Decision**: ✅ REUSE for PHYSICAL (Onsite) POS

---

#### 4. **ModernPaymentProcessor** (EXISTS - Excellent)
**Location**: `src/pages/admin/operations/sales/components/Payment/ModernPaymentProcessor.tsx` (20KB)

**Features**:
- Multi-method support (cash, card, QR, transfer)
- Cash module integration
- Sophisticated implementation

**Decision**: ✅ REUSE as-is

---

#### 5. **Rentals API** (Complete - Already Implemented)
**Location**: `src/pages/admin/operations/rentals/services/`

**Available APIs**:
```typescript
✅ checkAvailability(itemId, startDatetime, endDatetime)
✅ createReservation(input)
✅ getRentalItems()
✅ getRentalItemsByType(type)
✅ startRental(id, checkoutCondition)
✅ completeRental(id, returnCondition)
```

**Decision**: ✅ API complete - no need to create

---

### ❌ COMPONENTES QUE NO EXISTEN (Necesitan creación)

#### 1. **DateTimePickerLite** (for SERVICE POS)
**Status**: ✅ ALREADY EXISTS - PRODUCTION READY

**Location**: `src/shared/ui/components/business/DateTimePickerLite.tsx` (204 lines)

**Features**:
- ✅ Combines native date input + TimeSlotPicker
- ✅ Compact mode perfect for POS
- ✅ Clean API for SERVICE appointments
- ✅ Loading states
- ✅ Mock slots for development
- ⚠️ Needs real API hook for production (uses `generateMockSlots()`)

**API**:
```typescript
<DateTimePickerLite
  serviceId={serviceId}
  onSelect={(selection) => { date, slotId, startTime, endTime }}
  compactMode={true}
  availableSlots={slots} // Can provide real data via prop
/>
```

**Decision**: ✅ USE AS-IS - Component is complete
**See**: `datetimepickerlite_status.md` for details

---

#### 2. **PeriodPicker** (for RENTAL POS)
**Status**: ✅ ALREADY EXISTS - PRODUCTION READY

**Location**: `src/shared/ui/components/business/PeriodPicker.tsx` (446 lines)

**Features**:
- ✅ Start + End date/time selection (native inputs)
- ✅ Automatic duration calculation
- ✅ Availability checking with conflict detection
- ✅ Visual indicators (available/unavailable/loading)
- ✅ Compact mode perfect for POS
- ✅ Validation (end must be after start)
- ⚠️ Needs real API hook for production (uses `checkAvailability()` mock)

**API**:
```typescript
<PeriodPicker
  itemId={rentalItemId}
  onPeriodSelect={(selection) => {
    // selection = { start, end, available, durationHours, conflicts }
  }}
  compactMode={true}
  conflicts={conflicts} // Can provide via prop or mock
/>
```

**Decision**: ✅ USE AS-IS - Component is complete
**See**: `periodpicker_status.md` for details

---

#### 3. **AddressSelector** (for DELIVERY POS)
**Status**: ❌ Does not exist - NEEDS CREATION

**Investigation Results** (2025-12-12):
- ❌ Delivery module has NO address form components
- ✅ CRM module has complete address system:
  - `CustomerAddressFormModal` (create/edit modal)
  - `CustomerAddressManager` (full CRUD UI)
  - `customerAddressesApi` (complete API service)

**Recommendation**: Create `AddressSelector` component
- Location: `src/shared/ui/components/business/AddressSelector.tsx`
- Pattern: Dropdown selector + Quick add button
- Reuses: `CustomerAddressFormModal` for quick creation
- Integration: Validates with delivery zones
- See: `address_form_investigation.md` for details

---

### ⚠️ COMPONENTES QUE NECESITAN REFACTOR

#### 1. **SaleFormModal.tsx**
**Location**: `src/pages/admin/operations/sales/components/SaleFormModal.tsx` (392 lines)

**Problems**:
- ❌ Does NOT differentiate ProductTypes
- ❌ Assumes always CART pattern
- ❌ NOT capability-aware

**Solution**: Refactor using HookPoints for capability-based injection

**Decision**: Use `sales.pos.product_flow` HookPoint for ProductType-specific flows

---

#### 2. **SalesMetrics.tsx**
**Location**: `src/pages/admin/operations/sales/components/SalesMetrics.tsx` (149 lines)

**Problems**:
- ❌ 8 metrics hardcoded
- ❌ NOT capability-aware
- ❌ Shows "Mesas Activas" even if onsite not active

**Solution**: Separate Core (3) + HookPoint for capability metrics

**Decision**: Core metrics (Revenue, Transactions, Avg Order) + `sales.metrics` HookPoint

---

### 🗑️ COMPONENTES A DEPRECAR

| Component | Reason |
|-----------|--------|
| **PickupTimeSlotPicker** | Redundant - use shared TimeSlotPicker |
| **Analytics/** lazy components | Stubs or migrate to Intelligence module |

---

## 🎯 DECISIONES FINALES

### 1. Capability-Aware Architecture ✅

**Decision**: Use HookPoints for dynamic capability-based UI

**Example**:
```typescript
// Modules register their ProductType flows:
ModuleRegistry.registerHook('sales.pos.product_flow', {
  component: ({ selectedProduct }) => (
    <DateTimePickerLite
      serviceId={selectedProduct.id}
      onSelect={(datetime) => onFlowComplete({ datetime })}
    />
  ),
  when: (data) => data.productType === 'SERVICE',
  requires: ['capability.scheduling.appointments']
});
```

**When capability is OFF → Hook does NOT render**

---

### 2. Metrics Strategy ✅

**Decision**: Keep metrics in Sales module with TODOs

**Architecture**:
- Core Metrics (3): Revenue, Transactions, Avg Order
- Capability Metrics: Injected via `sales.metrics` HookPoint
- TODO: Implement real metric logic (currently mock)

---

### 3. Analytics Tabs

**Decision**: Defer to Intelligence module (technical debt)

**Action**: Remove stubs or delegate via HookPoint

---

## 📋 NEXT STEPS (Updated)

### Immediate Actions:
1. ✅ Investigation complete
2. ✅ AddressSelector investigation complete (see `address_form_investigation.md`)
3. ⏳ Update CROSS_MODULE_DEPENDENCIES.md with findings
4. ⏳ Update SCHEDULING_AUDIT_AND_POS_PLAN.md with final decisions

### Implementation Priority:
1. ✅ **DateTimePickerLite** (ALREADY EXISTS - see datetimepickerlite_status.md)
2. ✅ **PeriodPicker** (ALREADY EXISTS - see periodpicker_status.md)  
3. **Create AddressSelector** (for DELIVERY - see address_form_investigation.md)
4. **Refactor SaleFormModal** (capability-aware + HookPoints)
5. **Refactor SalesMetrics** (core + HookPoint)
6. **Test capability on/off switching**

---

**Status**: ✅ Architecture validated with real components
**Last Updated**: 2025-12-12
