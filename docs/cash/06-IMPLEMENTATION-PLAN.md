# 🚀 IMPLEMENTATION PLAN - Cash Management System

**Versión**: 1.0.0
**Duración Estimada**: 8-10 semanas
**Contexto**: Argentina - Implementación Incremental

---

## 📋 ÍNDICE

1. [Estrategia de Implementación](#estrategia-de-implementación)
2. [Fase 1: Fundamentos](#fase-1-fundamentos)
3. [Fase 2: Cash Sessions](#fase-2-cash-sessions)
4. [Fase 3: Double-Entry Core](#fase-3-double-entry-core)
5. [Fase 4: Module Integration](#fase-4-module-integration)
6. [Fase 5: Advanced Features](#fase-5-advanced-features)
7. [Testing Strategy](#testing-strategy)
8. [Rollback Plan](#rollback-plan)
9. [Success Metrics](#success-metrics)

---

## 🎯 ESTRATEGIA DE IMPLEMENTACIÓN

### Principios

1. ✅ **Incremental**: Implementar por fases, no todo de golpe
2. ✅ **Backward Compatible**: No romper funcionalidad existente
3. ✅ **Parallel Tables**: Nuevas tablas coexisten con existentes
4. ✅ **Feature Flags**: Habilitar features gradualmente
5. ✅ **Data Migration**: Migración de datos opcional, no forzada
6. ✅ **Rollback Ready**: Cada fase puede revertirse

### Feature Flags

```typescript
// src/config/featureFlags.ts
export const CashManagementFlags = {
  CHART_OF_ACCOUNTS: false,        // Fase 1
  MONEY_LOCATIONS: false,           // Fase 1
  CASH_SESSIONS: false,             // Fase 2
  JOURNAL_ENTRIES: false,           // Fase 3
  SALES_INTEGRATION: false,         // Fase 4
  STAFF_INTEGRATION: false,         // Fase 4
  ADVANCED_REPORTS: false           // Fase 5
};
```

---

## 🏗️ FASE 1: FUNDAMENTOS

**Duración**: 2-3 semanas
**Objetivo**: Crear estructura base sin afectar operaciones actuales

### Tareas

#### 1.1 Database Schema

**Archivos a crear:**
- `database/migrations/20250201_cash_chart_of_accounts.sql`
- `database/migrations/20250201_cash_money_locations.sql`

```bash
# Aplicar migración
npx supabase db push

# Verificar
npx supabase db diff
```

**SQL:**
```sql
-- Ver detalles en 01-DATABASE-SCHEMA.md
CREATE TABLE public.chart_of_accounts (...);
CREATE TABLE public.money_locations (...);

-- Índices
CREATE INDEX idx_coa_parent ON public.chart_of_accounts(parent_id);
CREATE INDEX idx_money_locations_account ON public.money_locations(account_id);

-- Datos iniciales (Argentina)
INSERT INTO public.chart_of_accounts (code, name, ...) VALUES
('1', 'Activos', ...),
('1.1.01.001', 'Caja Registradora - Principal', ...);
```

#### 1.2 TypeScript Types

**Archivos a crear:**
- `src/modules/cash/types/index.ts`
- `src/modules/cash/types/chartOfAccounts.ts`
- `src/modules/cash/types/moneyLocations.ts`

```typescript
// src/modules/cash/types/chartOfAccounts.ts
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
export type NormalBalance = 'DEBIT' | 'CREDIT';

export interface ChartOfAccountsRow {
  id: string;
  parent_id?: string | null;
  code: string;
  name: string;
  account_type: AccountType;
  sub_type?: string | null;
  is_group: boolean;
  is_active: boolean;
  normal_balance: NormalBalance;
  allow_transactions: boolean;
  description?: string | null;
  currency: string;
  location_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MoneyLocationRow {
  id: string;
  account_id: string;
  name: string;
  code?: string | null;
  location_type: 'CASH_DRAWER' | 'SAFE' | 'BANK_ACCOUNT' | 'DIGITAL_WALLET' | 'PETTY_CASH';
  requires_session: boolean;
  default_float?: number | null;
  max_cash_limit?: number | null;
  responsible_user_id?: string | null;
  location_id?: string | null;
  current_balance: number;
  is_active: boolean;
  description?: string | null;
  external_account_number?: string | null;
  created_at: string;
  updated_at: string;
}
```

#### 1.3 API Services

**Archivos a crear:**
- `src/modules/cash/services/chartOfAccountsService.ts`
- `src/modules/cash/services/moneyLocationsService.ts`

```typescript
// src/modules/cash/services/chartOfAccountsService.ts
import { supabase } from '@/lib/supabase/client';
import { ChartOfAccountsRow } from '../types';

export async function fetchChartOfAccounts(): Promise<ChartOfAccountsRow[]> {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('is_active', true)
    .order('code', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getAccountByCode(code: string): Promise<ChartOfAccountsRow | null> {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('code', code)
    .single();

  if (error) throw error;
  return data;
}

// Árbol jerárquico
export function buildAccountTree(accounts: ChartOfAccountsRow[]) {
  const accountMap = new Map(accounts.map(a => [a.id, { ...a, children: [] }]));
  const rootAccounts: any[] = [];

  accounts.forEach(account => {
    const node = accountMap.get(account.id);
    if (!node) return;

    if (account.parent_id) {
      const parent = accountMap.get(account.parent_id);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      rootAccounts.push(node);
    }
  });

  return rootAccounts;
}
```

#### 1.4 UI Components (Read-Only)

**Archivos a crear:**
- `src/modules/cash/components/ChartOfAccountsTree.tsx`
- `src/modules/cash/components/MoneyLocationsList.tsx`

**IMPORTANTE**: En Fase 1, solo lectura. No permitir crear/editar aún.

```typescript
// src/modules/cash/components/ChartOfAccountsTree.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchChartOfAccounts, buildAccountTree } from '../services/chartOfAccountsService';

export function ChartOfAccountsTree() {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['chart-of-accounts'],
    queryFn: fetchChartOfAccounts
  });

  if (isLoading) return <Spinner />;

  const tree = buildAccountTree(accounts || []);

  return (
    <Box>
      <Heading size="lg">Plan de Cuentas</Heading>
      {tree.map(account => (
        <AccountNode key={account.id} account={account} />
      ))}
    </Box>
  );
}

function AccountNode({ account, level = 0 }) {
  return (
    <Box ml={level * 4}>
      <Text fontWeight={account.is_group ? 'bold' : 'normal'}>
        {account.code} - {account.name}
      </Text>
      {account.children?.map(child => (
        <AccountNode key={child.id} account={child} level={level + 1} />
      ))}
    </Box>
  );
}
```

#### 1.5 Testing

```typescript
// src/modules/cash/__tests__/chartOfAccountsService.test.ts
import { describe, it, expect } from 'vitest';
import { fetchChartOfAccounts, buildAccountTree } from '../services/chartOfAccountsService';

describe('Chart of Accounts Service', () => {
  it('should fetch all accounts', async () => {
    const accounts = await fetchChartOfAccounts();
    expect(accounts.length).toBeGreaterThan(0);
  });

  it('should build hierarchical tree', () => {
    const accounts = [
      { id: '1', code: '1', name: 'Activos', parent_id: null, is_group: true },
      { id: '2', code: '1.1', name: 'Activos Corrientes', parent_id: '1', is_group: true }
    ];
    const tree = buildAccountTree(accounts);
    expect(tree[0].children.length).toBe(1);
  });
});
```

### Entregables Fase 1

- ✅ Tablas `chart_of_accounts` y `money_locations` creadas
- ✅ Datos iniciales insertados (plan de cuentas Argentina)
- ✅ Servicios de lectura funcionando
- ✅ UI básica para visualizar (solo lectura)
- ✅ Tests unitarios pasando
- ✅ Documentación actualizada

### Validación Fase 1

```bash
# 1. Verificar tablas
psql -c "SELECT COUNT(*) FROM chart_of_accounts;"
psql -c "SELECT COUNT(*) FROM money_locations;"

# 2. Run tests
npm run test src/modules/cash

# 3. Build sin errores
npm run build
```

---

## 💰 FASE 2: CASH SESSIONS

**Duración**: 2 semanas
**Objetivo**: Implementar sesiones de caja y arqueos

### Tareas

#### 2.1 Database Schema

```sql
-- database/migrations/20250210_cash_sessions.sql
CREATE TABLE public.cash_sessions (...);

-- Ver detalles en 01-DATABASE-SCHEMA.md
```

#### 2.2 Services

**Archivos a crear:**
- `src/modules/cash/services/cashSessionService.ts`

```typescript
// src/modules/cash/services/cashSessionService.ts
import { supabase } from '@/lib/supabase/client';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { logger } from '@/lib/logging';

export async function openCashSession(data: OpenSessionData) {
  logger.info('CashModule', 'Opening cash session', data);

  // Validar que no haya sesión abierta
  const existingOpen = await supabase
    .from('cash_sessions')
    .select('id')
    .eq('money_location_id', data.moneyLocationId)
    .eq('status', 'OPEN')
    .maybeSingle();

  if (existingOpen) {
    throw new Error('Ya existe una sesión de caja abierta para esta ubicación');
  }

  // Crear sesión
  const { data: session, error } = await supabase
    .from('cash_sessions')
    .insert({
      money_location_id: data.moneyLocationId,
      location_id: data.locationId,
      opened_by: data.userId,
      starting_cash: data.startingCash,
      opening_notes: data.notes,
      status: 'OPEN'
    })
    .select()
    .single();

  if (error) throw error;

  // Emitir evento
  await EventBus.emit('cash.session.opened', {
    sessionId: session.id,
    moneyLocationId: data.moneyLocationId,
    openedBy: data.userId,
    startingCash: data.startingCash,
    timestamp: new Date().toISOString()
  }, 'CashModule');

  return session;
}

export async function closeCashSession(sessionId: string, data: CloseSessionData) {
  logger.info('CashModule', 'Closing cash session', { sessionId, ...data });

  // Obtener sesión actual
  const { data: session, error: fetchError } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (fetchError) throw fetchError;
  if (session.status !== 'OPEN') {
    throw new Error('La sesión de caja no está abierta');
  }

  // Calcular esperado
  const expected = DecimalUtils.add(
    session.starting_cash,
    DecimalUtils.subtract(
      DecimalUtils.add(session.cash_sales, session.cash_in, 'financial'),
      DecimalUtils.add(
        DecimalUtils.add(session.cash_refunds, session.cash_out, 'financial'),
        session.cash_drops,
        'financial'
      ),
      'financial'
    ),
    'financial'
  );

  const variance = DecimalUtils.subtract(
    data.actualCash,
    expected,
    'financial'
  );

  // Actualizar sesión
  const { data: closedSession, error: updateError } = await supabase
    .from('cash_sessions')
    .update({
      closed_by: data.userId,
      closed_at: new Date().toISOString(),
      expected_cash: DecimalUtils.toNumber(expected),
      actual_cash: data.actualCash,
      variance: DecimalUtils.toNumber(variance),
      closing_notes: data.notes,
      status: DecimalUtils.abs(variance).toNumber() > 50 ? 'DISCREPANCY' : 'CLOSED'
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Emitir evento
  await EventBus.emit('cash.session.closed', {
    sessionId: closedSession.id,
    moneyLocationId: closedSession.money_location_id,
    closedBy: data.userId,
    expectedCash: DecimalUtils.toNumber(expected),
    actualCash: data.actualCash,
    variance: DecimalUtils.toNumber(variance),
    timestamp: new Date().toISOString()
  }, 'CashModule');

  return closedSession;
}
```

#### 2.3 UI Components

**Archivos a crear:**
- `src/modules/cash/components/OpenCashSessionModal.tsx`
- `src/modules/cash/components/CloseCashSessionModal.tsx`
- `src/modules/cash/components/CashSessionsList.tsx`

```typescript
// src/modules/cash/components/OpenCashSessionModal.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { openCashSession } from '../services/cashSessionService';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

export function OpenCashSessionModal({ moneyLocation, isOpen, onClose }) {
  const [startingCash, setStartingCash] = useState(
    moneyLocation.default_float?.toString() || ''
  );
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const openMutation = useMutation({
    mutationFn: openCashSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-sessions'] });
      toast.success('Sesión de caja abierta correctamente');
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = () => {
    // Validar
    if (!DecimalUtils.isPositiveFinite(startingCash)) {
      toast.error('El fondo inicial debe ser un monto válido');
      return;
    }

    openMutation.mutate({
      moneyLocationId: moneyLocation.id,
      locationId: moneyLocation.location_id,
      userId: currentUser.id,
      startingCash: parseFloat(startingCash),
      notes
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Abrir Sesión de Caja</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <VStack gap={4}>
            <Field label="Ubicación">
              <Text fontWeight="bold">{moneyLocation.name}</Text>
            </Field>

            <Field label="Fondo Inicial (ARS)" required>
              <InputField
                type="number"
                value={startingCash}
                onChange={(e) => setStartingCash(e.target.value)}
                min="0"
                step="0.01"
              />
            </Field>

            <Field label="Notas de Apertura">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones iniciales..."
              />
            </Field>
          </VStack>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorPalette="green"
            onClick={handleSubmit}
            loading={openMutation.isPending}
          >
            Abrir Caja
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

#### 2.4 Testing

```typescript
// src/modules/cash/__tests__/cashSessionService.test.ts
describe('Cash Session Service', () => {
  it('should open cash session', async () => {
    const session = await openCashSession({
      moneyLocationId: 'drawer-1',
      locationId: 'loc-1',
      userId: 'user-1',
      startingCash: 5000,
      notes: 'Test'
    });

    expect(session.status).toBe('OPEN');
    expect(session.starting_cash).toBe(5000);
  });

  it('should prevent opening multiple sessions', async () => {
    await openCashSession({ moneyLocationId: 'drawer-1', ...data });

    await expect(
      openCashSession({ moneyLocationId: 'drawer-1', ...data })
    ).rejects.toThrow('Ya existe una sesión de caja abierta');
  });

  it('should close session with correct variance', async () => {
    const session = await openCashSession({ startingCash: 5000 });

    // Simular ventas
    await supabase
      .from('cash_sessions')
      .update({ cash_sales: 10000 })
      .eq('id', session.id);

    const closed = await closeCashSession(session.id, {
      actualCash: 15000,
      userId: 'user-1'
    });

    expect(closed.expected_cash).toBe(15000);
    expect(closed.actual_cash).toBe(15000);
    expect(closed.variance).toBe(0);
  });
});
```

### Entregables Fase 2

- ✅ Tabla `cash_sessions` creada
- ✅ Servicios de apertura/cierre funcionando
- ✅ UI completa para gestión de sesiones
- ✅ Eventos emitidos correctamente
- ✅ Tests de integración pasando
- ✅ Manual de usuario (arqueo ciego)

---

## 📖 FASE 3: DOUBLE-ENTRY CORE

**Duración**: 2-3 semanas
**Objetivo**: Implementar sistema de doble entrada contable

### Tareas

#### 3.1 Database Schema

```sql
-- database/migrations/20250220_journal_entries.sql
CREATE TABLE public.journal_entries (...);
CREATE TABLE public.journal_lines (...);
CREATE TABLE public.money_movements (...);

-- Trigger de validación
CREATE TRIGGER trigger_validate_journal_balance ...
```

#### 3.2 Services

**Archivos a crear:**
- `src/modules/cash/services/journalService.ts`

```typescript
// src/modules/cash/services/journalService.ts
import { supabase } from '@/lib/supabase/client';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { logger } from '@/lib/logging';

export async function createJournalEntry(data: CreateJournalEntryData) {
  logger.info('CashModule', 'Creating journal entry', data);

  // Validar que lines balancee a 0
  const balance = data.lines.reduce((sum, line) => {
    return DecimalUtils.add(sum, line.amount, 'financial');
  }, DecimalUtils.fromValue(0, 'financial'));

  if (!DecimalUtils.isZero(balance)) {
    throw new Error(`Journal entry does not balance. Sum: ${DecimalUtils.toString(balance)}`);
  }

  // Generar entry_number
  const entryNumber = await generateEntryNumber(data.entryType);

  // Crear journal entry (header)
  const { data: entry, error: entryError } = await supabase
    .from('journal_entries')
    .insert({
      entry_number: entryNumber,
      entry_type: data.entryType,
      transaction_date: data.transactionDate || new Date(),
      reference_id: data.referenceId,
      reference_type: data.referenceType,
      description: data.description,
      location_id: data.locationId,
      cash_session_id: data.cashSessionId,
      created_by: data.userId,
      is_posted: false
    })
    .select()
    .single();

  if (entryError) throw entryError;

  // Crear journal lines
  const linesData = await Promise.all(
    data.lines.map(async (line) => {
      // Obtener account_id por code
      const account = await getAccountByCode(line.accountCode);
      if (!account) {
        throw new Error(`Account not found: ${line.accountCode}`);
      }

      return {
        journal_entry_id: entry.id,
        account_id: account.id,
        money_location_id: line.moneyLocationId,
        amount: parseFloat(line.amount),
        description: line.description
      };
    })
  );

  const { error: linesError } = await supabase
    .from('journal_lines')
    .insert(linesData);

  if (linesError) throw linesError;

  // Marcar como posted (dispara trigger de validación)
  const { error: postError } = await supabase
    .from('journal_entries')
    .update({
      is_posted: true,
      posted_at: new Date().toISOString()
    })
    .eq('id', entry.id);

  if (postError) {
    // Si falla la validación, eliminar entry
    await supabase.from('journal_entries').delete().eq('id', entry.id);
    throw postError;
  }

  // Actualizar money_movements
  await createMoneyMovements(entry.id, linesData);

  logger.info('CashModule', 'Journal entry created successfully', {
    entryId: entry.id,
    entryNumber
  });

  return entry;
}

async function generateEntryNumber(type: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `JE-${year}-`;

  const { count } = await supabase
    .from('journal_entries')
    .select('id', { count: 'exact', head: true })
    .like('entry_number', `${prefix}%`);

  return `${prefix}${String((count || 0) + 1).padStart(6, '0')}`;
}
```

#### 3.3 Testing

```typescript
// src/modules/cash/__tests__/journalService.test.ts
describe('Journal Service', () => {
  it('should create balanced journal entry', async () => {
    const entry = await createJournalEntry({
      entryType: 'SALE',
      lines: [
        { accountCode: '1.1.01.001', amount: '-1000.00' }, // Débito
        { accountCode: '4.1', amount: '+826.45' },          // Crédito
        { accountCode: '2.1.02', amount: '+173.55' }        // Crédito
      ]
    });

    expect(entry.is_posted).toBe(true);
  });

  it('should reject unbalanced entry', async () => {
    await expect(
      createJournalEntry({
        entryType: 'SALE',
        lines: [
          { accountCode: '1.1.01.001', amount: '-1000.00' },
          { accountCode: '4.1', amount: '+500.00' } // ¡No balancea!
        ]
      })
    ).rejects.toThrow('does not balance');
  });

  it('should update account balances', async () => {
    const initialBalance = await getAccountBalance('1.1.01.001');

    await createJournalEntry({
      entryType: 'SALE',
      lines: [
        { accountCode: '1.1.01.001', amount: '-1000.00' },
        { accountCode: '4.1', amount: '+1000.00' }
      ]
    });

    const newBalance = await getAccountBalance('1.1.01.001');
    expect(newBalance).toBe(initialBalance - 1000);
  });
});
```

### Entregables Fase 3

- ✅ Tablas journal_entries, journal_lines, money_movements creadas
- ✅ Servicio de journal entries funcionando
- ✅ Trigger de validación activo
- ✅ Tests exhaustivos de balance
- ✅ Documentación de doble entrada

---

## 🔌 FASE 4: MODULE INTEGRATION

**Duración**: 2 semanas
**Objetivo**: Integrar con Sales, Staff, Fiscal

### Tareas

#### 4.1 Sales Integration

```typescript
// src/modules/cash/handlers/salesPaymentHandler.ts
// Ver código completo en 05-MODULE-INTEGRATION.md

export function setupSalesIntegration() {
  EventBus.on('sales.payment.completed', async (event) => {
    // Procesar pago y crear journal entry
    // ...
  });
}
```

**Feature Flag:**
```typescript
if (CashManagementFlags.SALES_INTEGRATION) {
  setupSalesIntegration();
}
```

#### 4.2 Staff Integration

```typescript
// src/modules/cash/handlers/payrollHandler.ts
export function setupPayrollIntegration() {
  EventBus.on('staff.payroll.processed', async (event) => {
    // Registrar pago de sueldos
    // ...
  });
}
```

#### 4.3 Fiscal Integration

```typescript
// src/modules/cash/handlers/fiscalHandler.ts
export function setupFiscalIntegration() {
  EventBus.on('fiscal.invoice.generated', async (event) => {
    // Registrar cuenta por cobrar
    // ...
  });
}
```

#### 4.4 Testing

```bash
# Integration tests
npm run test src/modules/cash/__tests__/integration

# E2E flow test
npm run test:e2e cash-sales-flow.spec.ts
```

### Entregables Fase 4

- ✅ Handlers de eventos registrados
- ✅ Sales → Cash integration funcionando
- ✅ Staff → Cash integration funcionando
- ✅ Fiscal → Cash integration funcionando
- ✅ Tests de integración pasando
- ✅ Feature flags habilitados

---

## 📊 FASE 5: ADVANCED FEATURES

**Duración**: 1-2 semanas
**Objetivo**: Reportes y features avanzadas

### Tareas

#### 5.1 Reportes

**Archivos a crear:**
- `src/modules/cash/services/reportsService.ts`
- `src/modules/cash/components/BalanceSheet.tsx`
- `src/modules/cash/components/CashFlowStatement.tsx`

```typescript
// src/modules/cash/services/reportsService.ts
export async function generateBalanceSheet(asOfDate: Date) {
  // Obtener saldos de todas las cuentas
  const accounts = await fetchChartOfAccounts();
  const balances = await Promise.all(
    accounts.map(async (account) => ({
      ...account,
      balance: await getAccountBalance(account.id, asOfDate)
    }))
  );

  // Agrupar por tipo
  const assets = balances.filter(a => a.account_type === 'ASSET');
  const liabilities = balances.filter(a => a.account_type === 'LIABILITY');
  const equity = balances.filter(a => a.account_type === 'EQUITY');

  return {
    asOfDate,
    assets: {
      total: sumBalances(assets),
      accounts: assets
    },
    liabilities: {
      total: sumBalances(liabilities),
      accounts: liabilities
    },
    equity: {
      total: sumBalances(equity),
      accounts: equity
    }
  };
}
```

#### 5.2 Reconciliación Bancaria (Futuro)

**Archivos a crear:**
- `src/modules/cash/services/bankReconciliationService.ts`

#### 5.3 UI Avanzada

- Dashboard de Cash Management
- Gráficos de flujo de dinero
- Alertas de saldo bajo

### Entregables Fase 5

- ✅ Balance Sheet funcionando
- ✅ Cash Flow Statement
- ✅ Dashboard completo
- ✅ Alertas configuradas

---

## 🧪 TESTING STRATEGY

### Unit Tests

```bash
# Run all unit tests
npm run test src/modules/cash

# Coverage
npm run test:coverage
```

### Integration Tests

```typescript
// src/modules/cash/__tests__/integration/sales-cash.test.ts
describe('Sales → Cash Integration', () => {
  it('should record cash payment in journal', async () => {
    // 1. Crear venta
    const sale = await createSale({ amount: 1000, payment_method: 'CASH' });

    // 2. Verificar journal entry creado
    const entry = await supabase
      .from('journal_entries')
      .select('*')
      .eq('reference_id', sale.id)
      .single();

    expect(entry.is_posted).toBe(true);

    // 3. Verificar saldo actualizado
    const balance = await getAccountBalance('1.1.01.001');
    expect(balance).toBeGreaterThan(0);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/cash/cash-session.spec.ts
import { test, expect } from '@playwright/test';

test('complete cash session flow', async ({ page }) => {
  await page.goto('/admin/finance/cash');

  // Abrir sesión
  await page.click('button:has-text("Abrir Caja")');
  await page.fill('input[name="starting_cash"]', '5000');
  await page.click('button:has-text("Confirmar")');

  // Verificar sesión abierta
  await expect(page.locator('text=Sesión Abierta')).toBeVisible();

  // Procesar venta (simular)
  // ...

  // Cerrar sesión
  await page.click('button:has-text("Cerrar Caja")');
  await page.fill('input[name="actual_cash"]', '15000');
  await page.click('button:has-text("Cerrar")');

  // Verificar arqueo
  await expect(page.locator('text=Diferencia: $0.00')).toBeVisible();
});
```

---

## 🔄 ROLLBACK PLAN

### Estrategia de Rollback

#### Si falla Fase 1
```sql
-- Eliminar tablas
DROP TABLE IF EXISTS public.money_locations CASCADE;
DROP TABLE IF EXISTS public.chart_of_accounts CASCADE;
```

#### Si falla Fase 2
```sql
-- Eliminar tabla cash_sessions
DROP TABLE IF EXISTS public.cash_sessions CASCADE;

-- Deshabilitar feature flag
UPDATE public.feature_flags SET enabled = false WHERE key = 'CASH_SESSIONS';
```

#### Si falla Fase 3
```sql
-- Eliminar journal tables
DROP TABLE IF EXISTS public.money_movements CASCADE;
DROP TABLE IF EXISTS public.journal_lines CASCADE;
DROP TABLE IF EXISTS public.journal_entries CASCADE;
```

#### Si falla Fase 4
```typescript
// Deshabilitar integraciones
CashManagementFlags.SALES_INTEGRATION = false;
CashManagementFlags.STAFF_INTEGRATION = false;

// Los módulos seguirán usando tablas antiguas
```

### Backup Strategy

```bash
# Antes de cada fase
pg_dump -h host -U user -d database -t chart_of_accounts -t money_locations > backup_fase1.sql
pg_dump -h host -U user -d database -t cash_sessions > backup_fase2.sql
pg_dump -h host -U user -d database -t journal_entries -t journal_lines > backup_fase3.sql

# Restore si es necesario
psql -h host -U user -d database < backup_fase1.sql
```

---

## 📈 SUCCESS METRICS

### KPIs por Fase

#### Fase 1: Fundamentos
- ✅ Tablas creadas sin errores
- ✅ 100% de tests unitarios pasando
- ✅ Build sin errores de TypeScript
- ✅ Plan de cuentas con ≥20 cuentas configuradas

#### Fase 2: Cash Sessions
- ✅ 10 sesiones de prueba abiertas/cerradas sin errores
- ✅ Varianza promedio < $50 en pruebas
- ✅ Tiempo de cierre < 2 minutos
- ✅ 100% de eventos emitidos correctamente

#### Fase 3: Double-Entry
- ✅ 100 journal entries creados sin errores
- ✅ 0 journal entries con balance != 0
- ✅ Todas las cuentas con saldo correcto
- ✅ Performance: < 500ms para crear entry

#### Fase 4: Integration
- ✅ 50 ventas procesadas → journal entries creados
- ✅ 5 pagos de nómina → registrados en journal
- ✅ 10 facturas → cuentas por cobrar creadas
- ✅ 0 errores en eventos de integración

#### Fase 5: Advanced
- ✅ Balance Sheet generado < 2s
- ✅ Cash Flow generado < 3s
- ✅ Dashboard carga < 1s
- ✅ 10 usuarios capacitados

### Criterios de Éxito General

1. ✅ **Accuracy**: 100% de transacciones balanceadas
2. ✅ **Performance**: < 500ms promedio para operaciones
3. ✅ **Reliability**: 99.9% uptime
4. ✅ **Adoption**: 80% de usuarios usando nuevo sistema en 3 meses
5. ✅ **Satisfaction**: NPS ≥ 8 de usuarios

---

## 📅 CRONOGRAMA COMPLETO

```
SEMANA 1-2:   Fase 1.1-1.3 (DB Schema, Types, Services)
SEMANA 3:     Fase 1.4-1.5 (UI, Testing)
SEMANA 4-5:   Fase 2.1-2.3 (Cash Sessions)
SEMANA 6:     Fase 3.1-3.2 (Journal Entries)
SEMANA 7:     Fase 3.3 (Testing Double-Entry)
SEMANA 8:     Fase 4 (Module Integration)
SEMANA 9-10:  Fase 5 (Advanced Features)
SEMANA 11:    Testing & Documentation
SEMANA 12:    Production Rollout
```

---

## ✅ CHECKLIST FINAL

### Pre-Implementation
- [ ] Feature flags configurados
- [ ] Backup de base de datos
- [ ] Equipo capacitado en doble entrada
- [ ] Documentación revisada
- [ ] Plan de comunicación a usuarios

### Durante Implementation
- [ ] Tests pasando en cada fase
- [ ] Code review completado
- [ ] Performance monitoreado
- [ ] Errores documentados
- [ ] Rollback plan probado

### Post-Implementation
- [ ] Usuarios capacitados
- [ ] Documentación de usuario
- [ ] Monitoreo activo 24/7
- [ ] Feedback loop configurado
- [ ] Plan de mejora continua

---

**Última actualización**: 2025-01-24
**Status**: ✅ Plan Completo - Listo para Implementar
