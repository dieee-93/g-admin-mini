# 🔌 MODULE INTEGRATION - Cash Management System

**Versión**: 1.0.0
**Compatible con**: G-Admin Mini v3.0
**Arquitectura**: ModuleRegistry + EventBus + DecimalUtils

---

## 📋 ÍNDICE

1. [Arquitectura General](#arquitectura-general)
2. [Integración con Sales](#integración-con-sales)
3. [Integración con Staff](#integración-con-staff)
4. [Integración con Scheduling](#integración-con-scheduling)
5. [Integración con Fiscal](#integración-con-fiscal)
6. [Integración con Materials](#integración-con-materials)
7. [Integración con Finance Modules](#integración-con-finance-modules)
8. [EventBus Integration](#eventbus-integration)
9. [DecimalUtils Usage](#decimalutils-usage)
10. [ModuleRegistry Setup](#moduleregistry-setup)

---

## 🏗️ ARQUITECTURA GENERAL

### Principios de Integración

1. ✅ **EventBus First**: Comunicación asíncrona entre módulos
2. ✅ **No Direct Imports**: Evitar dependencias circulares
3. ✅ **Shared Services**: Usar servicios compartidos (DecimalUtils, Logger)
4. ✅ **Offline-First**: Compatible con sincronización offline
5. ✅ **Type Safety**: TypeScript estricto en eventos

### Diagrama de Integración

```
┌─────────────────────────────────────────────────────────────┐
│                      CASH MODULE                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Chart of     │  │ Money        │  │ Cash         │      │
│  │ Accounts     │  │ Locations    │  │ Sessions     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                           │                                  │
│                  ┌────────▼────────┐                         │
│                  │ Journal Entries │                         │
│                  │ (Double Entry)  │                         │
│                  └────────┬────────┘                         │
└───────────────────────────┼──────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    ┌───────▼───────┐ ┌────▼────┐ ┌───────▼────────┐
    │ Sales Module  │ │  Staff  │ │ Fiscal Module  │
    │ (Payments)    │ │ (Payro  │ │ (Invoices/Tax) │
    └───────────────┘ └─────────┘ └────────────────┘
            │               │               │
            │        ┌──────▼───────┐       │
            └────────►   EventBus   ◄───────┘
                     │  (Pub/Sub)   │
                     └──────────────┘
```

---

## 💵 INTEGRACIÓN CON SALES

### Relación
**Principal integración**: Las ventas generan movimientos de dinero.

### Tablas Involucradas
- `sales` (existente) - Registro de ventas
- `payment_methods` (existente) - **SE MANTIENE** para compatibilidad
- `journal_entries` (nuevo) - Registro contable
- `journal_lines` (nuevo) - Líneas débito/crédito
- `cash_sessions` (nuevo) - Sesión de caja activa

### Flujo de Integración

#### 1. Venta Procesada (Sales Module)

**Sales Module emite evento:**
```typescript
// src/pages/admin/operations/sales/services/saleApi.ts
import { EventBus } from '@/lib/events';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

async function processSale(saleData: CreateSaleData) {
  // ... (lógica existente de procesamiento de venta)

  // Emitir evento para Cash Module
  await EventBus.emit('sales.payment.completed', {
    paymentId: paymentMethod.id,
    saleId: processedSale.id,
    orderId: undefined,
    customerId: saleData.customer_id,
    amount: DecimalUtils.toNumber(taxResult.total),
    paymentMethod: saleData.payment_method, // 'CASH', 'CREDIT_CARD', etc.
    timestamp: new Date().toISOString(),
    reference: paymentMethod.id
  }, 'SalesModule');
}
```

#### 2. Cash Module Escucha (Cash Module)

**Cash Module handler:**
```typescript
// src/modules/cash/handlers/salesPaymentHandler.ts
import { EventBus } from '@/lib/events';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { createJournalEntry } from '../services/journalService';
import { updateCashSession } from '../services/cashSessionService';
import { logger } from '@/lib/logging';

export function setupSalesIntegration() {
  EventBus.on('sales.payment.completed', async (event) => {
    const { paymentId, saleId, amount, paymentMethod, customerId } = event.payload;

    logger.info('CashModule', 'Processing sales payment', { saleId, amount, paymentMethod });

    // Solo procesar si es efectivo
    if (paymentMethod !== 'CASH') {
      logger.debug('CashModule', 'Non-cash payment, skipping cash session update', { paymentMethod });
      return;
    }

    try {
      // 1. Obtener sesión de caja activa
      const activeSession = await getActiveCashSession();
      if (!activeSession) {
        logger.warn('CashModule', 'No active cash session, payment not recorded in cash', { saleId });
        return;
      }

      // 2. Calcular impuestos (usar fiscal service)
      const taxRate = 0.21; // IVA Argentina (obtener de configuración)
      const subtotal = DecimalUtils.divide(amount, 1.21, 'financial');
      const tax = DecimalUtils.subtract(amount, subtotal, 'financial');

      // 3. Crear journal entry (doble entrada)
      const journalEntry = await createJournalEntry({
        entryType: 'SALE',
        referenceId: saleId,
        referenceType: 'SALE',
        transactionDate: new Date(),
        cashSessionId: activeSession.id,
        lines: [
          {
            // Débito: Caja aumenta
            accountCode: '1.1.01.001', // Cash Drawer account
            moneyLocationId: activeSession.money_location_id,
            amount: DecimalUtils.toFixed(-amount, 4) // Negativo = Débito
          },
          {
            // Crédito: Ingresos por ventas
            accountCode: '4.1', // Sales Revenue
            amount: DecimalUtils.toFixed(subtotal, 4) // Positivo = Crédito
          },
          {
            // Crédito: IVA a pagar
            accountCode: '2.1.02', // Tax Payable
            amount: DecimalUtils.toFixed(tax, 4)
          }
        ]
      });

      // 4. Actualizar cash_session
      await updateCashSession(activeSession.id, {
        cash_sales: DecimalUtils.add(activeSession.cash_sales, amount, 'financial').toNumber()
      });

      // 5. Emitir evento de confirmación
      await EventBus.emit('cash.transaction.recorded', {
        journalEntryId: journalEntry.id,
        saleId,
        amount,
        cashSessionId: activeSession.id
      }, 'CashModule');

      logger.info('CashModule', 'Sales payment recorded successfully', {
        journalEntryId: journalEntry.id,
        saleId,
        amount
      });

    } catch (error) {
      logger.error('CashModule', 'Failed to record sales payment', error, { saleId, amount });
      // No throw - let the sale complete, manual adjustment may be needed
    }
  }, { priority: 'HIGH' });
}
```

### Refactorización de Payment Methods

**BREAKING CHANGE: payment_methods tabla será REEMPLAZADA**

La tabla `payment_methods` actual tiene campos específicos de POS (terminal_id, card_brand, etc.) que no encajan en el nuevo modelo de doble entrada.

**Nueva Estrategia:**
1. ✅ **Eliminar** tabla `payment_methods` antigua
2. ✅ **Migrar** datos históricos a `journal_entries` (script de migración)
3. ✅ **Crear** nueva tabla `sale_payments` limpia (solo link sale → journal_entry)

```typescript
// Nueva estructura limpia
CREATE TABLE public.sale_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id),
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id),
  amount NUMERIC(15,4) NOT NULL,
  payment_type TEXT NOT NULL, -- 'CASH', 'CARD', 'TRANSFER', 'QR'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

// Toda la lógica contable en journal_entries
// Metadatos de pago (terminal, tarjeta) en JSONB si es necesario
```

**Script de Migración (una sola vez):**
```sql
-- Migrar pagos históricos a journal_entries
INSERT INTO journal_entries (entry_type, reference_id, reference_type, transaction_date, created_at)
SELECT
  'SALE',
  sale_id,
  'SALE',
  created_at::date,
  created_at
FROM payment_methods;

-- Crear journal_lines para cada pago
INSERT INTO journal_lines (journal_entry_id, account_id, amount)
SELECT
  je.id,
  coa.id,
  -pm.amount  -- Débito: Cash aumenta
FROM payment_methods pm
JOIN journal_entries je ON je.reference_id = pm.sale_id
JOIN chart_of_accounts coa ON coa.code = '1.1.01.001';

-- Después de verificar: DROP old table
-- DROP TABLE payment_methods CASCADE;
```

---

## 👥 INTEGRACIÓN CON STAFF

### Relación
Liquidación de sueldos consume dinero del banco.

### Flujo: Pago de Nómina

**Staff Module emite evento:**
```typescript
// src/pages/admin/resources/staff/services/staffApi.ts
await EventBus.emit('staff.payroll.processed', {
  payrollPeriodId: period.id,
  employeePayments: [
    { employeeId: 'emp-1', grossAmount: 150000, netAmount: 120000, deductions: 30000 },
    { employeeId: 'emp-2', grossAmount: 180000, netAmount: 144000, deductions: 36000 }
  ],
  totalGross: 330000,
  totalNet: 264000,
  totalDeductions: 66000,
  paymentDate: '2025-01-31'
}, 'StaffModule');
```

**Cash Module procesa:**
```typescript
// src/modules/cash/handlers/payrollHandler.ts
EventBus.on('staff.payroll.processed', async (event) => {
  const { payrollPeriodId, totalNet, paymentDate } = event.payload;

  // Obtener banco configurado para nómina (desde settings)
  const payrollBank = await getPayrollBankAccount();

  // Crear journal entry
  await createJournalEntry({
    entryType: 'PAYROLL',
    referenceId: payrollPeriodId,
    referenceType: 'PAYROLL_PERIOD',
    transactionDate: new Date(paymentDate),
    lines: [
      {
        // Débito: Gasto de personal
        accountCode: '5.2', // Payroll Expense
        amount: DecimalUtils.toFixed(-totalNet, 4)
      },
      {
        // Crédito: Banco disminuye
        accountCode: payrollBank.accountCode,
        moneyLocationId: payrollBank.id,
        amount: DecimalUtils.toFixed(totalNet, 4)
      }
    ]
  });

  await EventBus.emit('cash.payroll.recorded', {
    payrollPeriodId,
    amount: totalNet
  }, 'CashModule');
});
```

---

## 📅 INTEGRACIÓN CON SCHEDULING

### Relación
**IMPORTANTE**: Los `shifts` de Scheduling son turnos de EMPLEADOS, NO sesiones de caja.

### Diferencia Clara

| Concepto | Tabla | Propósito |
|----------|-------|-----------|
| **Employee Shift** | `shifts` | Turno laboral del empleado (scheduling) |
| **Cash Session** | `cash_sessions` | Sesión de caja con apertura/cierre y arqueo |

**Relación:**
- Un empleado puede tener un `shift` (turno laboral) activo
- Durante su turno, puede abrir/cerrar múltiples `cash_sessions`
- `cash_sessions.opened_by` referencia al empleado
- NO hay relación directa entre tablas `shifts` y `cash_sessions`

### Flujo: Turno Iniciado

```typescript
// Scheduling Module
EventBus.on('scheduling.shift.started', async (event) => {
  const { employeeId, shiftId, role } = event.payload;

  // Si el empleado es cajero, recordar que debe abrir caja
  if (role === 'CASHIER') {
    await EventBus.emit('cash.reminder.open_session', {
      employeeId,
      shiftId,
      message: 'Por favor abrir caja al iniciar turno'
    }, 'CashModule');
  }
});
```

---

## 🧾 INTEGRACIÓN CON FISCAL

### Relación
Impuestos calculados por Fiscal, registrados en Cash.

### Flujo: Factura Generada

**Fiscal Module emite:**
```typescript
// src/pages/admin/finance-fiscal/services/fiscalApi.ts
await EventBus.emit('fiscal.invoice.generated', {
  invoiceId: invoice.id,
  customerId: customer.id,
  subtotal: 826.45,
  tax: 173.55,
  total: 1000,
  dueDate: '2025-02-15'
}, 'FiscalModule');
```

**Cash Module registra cuenta por cobrar:**
```typescript
EventBus.on('fiscal.invoice.generated', async (event) => {
  const { invoiceId, customerId, subtotal, tax, total } = event.payload;

  await createJournalEntry({
    entryType: 'RECEIPT',
    referenceId: invoiceId,
    referenceType: 'INVOICE',
    lines: [
      {
        // Débito: Cuenta por cobrar aumenta
        accountCode: '1.1.02', // Accounts Receivable
        amount: DecimalUtils.toFixed(-total, 4)
      },
      {
        // Crédito: Ingresos
        accountCode: '4.1',
        amount: DecimalUtils.toFixed(subtotal, 4)
      },
      {
        // Crédito: IVA a pagar
        accountCode: '2.1.02',
        amount: DecimalUtils.toFixed(tax, 4)
      }
    ]
  });
});
```

---

## 📦 INTEGRACIÓN CON MATERIALS

### Relación
Compras a proveedores consumen dinero.

### Flujo: Orden de Compra Aprobada

**Materials Module emite:**
```typescript
await EventBus.emit('materials.purchase.approved', {
  supplierOrderId: order.id,
  supplierId: supplier.id,
  total: 50000,
  paymentTerms: 'NET30',
  dueDate: '2025-02-24'
}, 'MaterialsModule');
```

**Cash Module registra cuenta por pagar:**
```typescript
EventBus.on('materials.purchase.approved', async (event) => {
  const { supplierOrderId, supplierId, total } = event.payload;

  await createJournalEntry({
    entryType: 'PURCHASE',
    referenceId: supplierOrderId,
    referenceType: 'SUPPLIER_ORDER',
    lines: [
      {
        // Débito: Inventario o COGS
        accountCode: '5.1', // COGS
        amount: DecimalUtils.toFixed(-total, 4)
      },
      {
        // Crédito: Cuenta por pagar aumenta
        accountCode: '2.1.01', // Accounts Payable
        amount: DecimalUtils.toFixed(total, 4)
      }
    ]
  });
});
```

### Flujo: Pago a Proveedor

**UI dispara pago:**
```typescript
// src/modules/cash/services/supplierPaymentService.ts
async function paySupplier(supplierId: string, amount: number, fromBankId: string) {
  await createJournalEntry({
    entryType: 'PAYMENT',
    referenceId: supplierId,
    referenceType: 'SUPPLIER',
    lines: [
      {
        // Débito: Cuenta por pagar disminuye
        accountCode: '2.1.01',
        amount: DecimalUtils.toFixed(-amount, 4)
      },
      {
        // Crédito: Banco disminuye
        accountCode: bankAccount.accountCode,
        moneyLocationId: fromBankId,
        amount: DecimalUtils.toFixed(amount, 4)
      }
    ]
  });

  await EventBus.emit('cash.supplier.paid', {
    supplierId,
    amount,
    bankId: fromBankId
  }, 'CashModule');
}
```

---

## 🏦 INTEGRACIÓN CON FINANCE MODULES

### Finance-Billing (Facturación Recurrente)

**Tabla `invoices` existente SE VINCULA:**
```sql
-- Agregar columna a invoices tabla existente
ALTER TABLE public.invoices
ADD COLUMN journal_entry_id UUID REFERENCES public.journal_entries(id);
```

**Flujo:**
```typescript
// Al generar factura
const invoice = await createInvoice(subscriptionData);

// Crear journal entry
const journalEntry = await createJournalEntry({
  entryType: 'RECEIPT',
  referenceId: invoice.id,
  referenceType: 'INVOICE',
  lines: [...]
});

// Vincular
await supabase
  .from('invoices')
  .update({ journal_entry_id: journalEntry.id })
  .eq('id', invoice.id);
```

### Finance-Corporate (Cuentas Corporativas)

**Tabla `corporate_accounts` usa journal entries:**
```typescript
// Al otorgar crédito
async function grantCredit(customerId: string, amount: number) {
  await createJournalEntry({
    entryType: 'ADJUSTMENT',
    referenceId: customerId,
    referenceType: 'CORPORATE_ACCOUNT',
    lines: [
      {
        // Débito: Cuenta por cobrar corporativa
        accountCode: '1.1.02.001', // AR - Corporate
        amount: DecimalUtils.toFixed(-amount, 4)
      },
      {
        // Crédito: Ingresos diferidos (o equity)
        accountCode: '3.1',
        amount: DecimalUtils.toFixed(amount, 4)
      }
    ]
  });
}
```

---

## 📡 EVENTBUS INTEGRATION

### Eventos Emitidos por Cash Module

```typescript
// src/modules/cash/events/cashEvents.ts
export const CashEvents = {
  // Sesiones de caja
  SESSION_OPENED: 'cash.session.opened',
  SESSION_CLOSED: 'cash.session.closed',
  SESSION_DISCREPANCY: 'cash.session.discrepancy',

  // Transacciones
  TRANSACTION_RECORDED: 'cash.transaction.recorded',
  TRANSFER_COMPLETED: 'cash.transfer.completed',
  DEPOSIT_RECORDED: 'cash.deposit.recorded',

  // Alertas
  BALANCE_LOW: 'cash.balance.low',
  BALANCE_EXCEEDED: 'cash.balance.exceeded',

  // Pagos
  SUPPLIER_PAID: 'cash.supplier.paid',
  PAYROLL_RECORDED: 'cash.payroll.recorded'
} as const;

// Tipos
export interface CashSessionOpenedEvent {
  sessionId: string;
  moneyLocationId: string;
  openedBy: string;
  startingCash: number;
  timestamp: string;
}

export interface CashSessionClosedEvent {
  sessionId: string;
  moneyLocationId: string;
  closedBy: string;
  expectedCash: number;
  actualCash: number;
  variance: number;
  timestamp: string;
}

export interface CashTransactionRecordedEvent {
  journalEntryId: string;
  referenceId: string;
  referenceType: string;
  amount: number;
  cashSessionId?: string;
  timestamp: string;
}
```

### Registro de Handlers

```typescript
// src/modules/cash/manifest.tsx
import { setupSalesIntegration } from './handlers/salesPaymentHandler';
import { setupPayrollIntegration } from './handlers/payrollHandler';
import { setupFiscalIntegration } from './handlers/fiscalHandler';

export const cashModuleManifest: ModuleManifest = {
  id: 'cash',
  name: 'Cash Management',
  version: '1.0.0',
  depends: [],
  requiredFeatures: [], // Disponible para todos
  hooks: {
    provide: [
      'cash.session.opened',
      'cash.session.closed',
      'cash.transaction.recorded'
    ],
    consume: [
      'sales.payment.completed',
      'staff.payroll.processed',
      'fiscal.invoice.generated',
      'materials.purchase.approved'
    ]
  },
  setup: async (registry) => {
    // Registrar handlers
    setupSalesIntegration();
    setupPayrollIntegration();
    setupFiscalIntegration();
  }
};
```

---

## 🔢 DECIMALUTILS USAGE

### Reglas de Uso

**SIEMPRE usar DecimalUtils para:**
1. ✅ Operaciones monetarias
2. ✅ Cálculos de impuestos
3. ✅ Sumas de transacciones
4. ✅ Comparaciones de montos

**Dominio correcto: `'financial'`**

### Ejemplos

#### ✅ CORRECTO

```typescript
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// Crear valores
const subtotal = DecimalUtils.fromValue(826.45, 'financial');
const taxRate = DecimalUtils.fromValue(0.21, 'financial');

// Calcular impuesto
const tax = DecimalUtils.multiply(subtotal, taxRate, 'financial');

// Sumar
const total = DecimalUtils.add(subtotal, tax, 'financial');

// Formatear para display
const formatted = DecimalUtils.formatCurrency(total); // "$1,000.00"

// Guardar en BD (convertir a string para NUMERIC)
const amountForDB = DecimalUtils.toFixed(total, 4); // "1000.0000"
```

#### ❌ INCORRECTO

```typescript
// ❌ NO usar operadores nativos
const tax = subtotal * 0.21;  // ¡Pérdida de precisión!

// ❌ NO usar Number() directamente
const total = Number(subtotal) + Number(tax);

// ❌ NO usar toFixed() directamente
const formatted = `$${subtotal.toFixed(2)}`; // Rounding incorrecto
```

### Validación Segura

```typescript
// Validar antes de usar
if (!DecimalUtils.isFinanciallyValid(amount)) {
  throw new Error('Invalid amount');
}

// Usar versión segura con fallback
const safeAmount = DecimalUtils.fromValueSafe(
  userInput,
  'financial',
  0 // default si inválido
);
```

---

## 📝 MODULEREGISTRY SETUP

### Manifest Completo

```typescript
// src/modules/cash/manifest.tsx
import { ModuleManifest } from '@/lib/modules/types';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

export const cashModuleManifest: ModuleManifest = {
  id: 'cash',
  name: 'Cash Management',
  version: '1.0.0',

  // Dependencies
  depends: [],                           // No depende de otros módulos
  requiredFeatures: [],                  // Disponible siempre

  // Hooks
  hooks: {
    provide: [
      'cash.session.opened',
      'cash.session.closed',
      'cash.transaction.recorded',
      'cash.transfer.completed',
      'cash.balance.low'
    ],
    consume: [
      {
        name: 'sales.payment.completed',
        requiredPermission: {
          module: 'sales',
          action: 'read'
        }
      },
      'staff.payroll.processed',
      'fiscal.invoice.generated',
      'materials.purchase.approved'
    ]
  },

  // Setup
  setup: async (registry) => {
    // Registrar event handlers
    const { setupAllHandlers } = await import('./handlers');
    setupAllHandlers();

    // Registrar servicios
    const { CashService } = await import('./services/cashService');
    registry.registerService('cash', new CashService());
  },

  // Teardown
  teardown: async () => {
    // Cleanup si es necesario
  },

  // Exports (APIs públicas)
  exports: {
    // Otros módulos pueden usar estos servicios
    createJournalEntry: () => import('./services/journalService').then(m => m.createJournalEntry),
    getAccountBalance: () => import('./services/accountService').then(m => m.getAccountBalance),
    openCashSession: () => import('./services/cashSessionService').then(m => m.openCashSession)
  },

  // Metadata
  metadata: {
    category: 'core',
    description: 'Cash management, journal entries, and financial accounting',
    author: 'G-Admin Team',
    tags: ['finance', 'accounting', 'cash', 'double-entry'],
    navigation: {
      route: '/admin/finance/cash',
      icon: CurrencyDollarIcon,
      color: 'green',
      domain: 'finance'
    }
  }
};
```

---

## 🔐 SECURITY & PERMISSIONS

### Permisos Requeridos

```typescript
// src/modules/cash/permissions.ts
export const CashPermissions = {
  // Sesiones de caja
  OPEN_SESSION: { module: 'cash', action: 'create' },
  CLOSE_SESSION: { module: 'cash', action: 'update' },
  VIEW_SESSION: { module: 'cash', action: 'read' },

  // Journal Entries
  CREATE_ENTRY: { module: 'cash', action: 'create' },
  VIEW_ENTRY: { module: 'cash', action: 'read' },
  POST_ENTRY: { module: 'cash', action: 'update' }, // Marcar como posted

  // Reportes
  VIEW_REPORTS: { module: 'cash', action: 'read' },
  AUDIT_SESSIONS: { module: 'cash', action: 'admin' }
};

// Validar permisos antes de operaciones
async function openCashSession(userId: string, data: OpenSessionData) {
  const user = await getUserContext(userId);

  requirePermission(user, CashPermissions.OPEN_SESSION);

  // ... proceder con apertura
}
```

---

## 📚 RESUMEN DE INTEGRACIONES

| Módulo | Eventos Consumidos | Eventos Emitidos | Tabla Vinculada |
|--------|-------------------|------------------|-----------------|
| **Sales** | - | `sales.payment.completed` | `sales`, `payment_methods` |
| **Staff** | `cash.payroll.recorded` | `staff.payroll.processed` | `shifts`, `payroll_periods` |
| **Scheduling** | `cash.reminder.open_session` | `scheduling.shift.started` | `shifts` |
| **Fiscal** | `cash.transaction.recorded` | `fiscal.invoice.generated` | `invoices` |
| **Materials** | `cash.supplier.paid` | `materials.purchase.approved` | `supplier_orders` |
| **Finance-Billing** | `cash.transaction.recorded` | `billing.invoice.generated` | `invoices`, `subscriptions` |
| **Finance-Corporate** | `cash.transaction.recorded` | - | `corporate_accounts` |

---

**Última actualización**: 2025-01-24
**Próximo**: [06-IMPLEMENTATION-PLAN.md](./06-IMPLEMENTATION-PLAN.md)
