# Finance Domain - Final Structure (Opción B Aprobada)

**Fecha**: 2026-01-23
**Status**: ✅ Approved - Ready for Implementation
**Parent**: [Finance Domain Reorganization](./2026-01-23-finance-domain-reorganization.md)

---

## 🎯 Decisión Final: Opción B

**Estructura elegida**: 3 módulos con todos los pagos centralizados en operations

**Nombres de Módulos:**
- `finance-operations` → "Operaciones Financieras" (UI)
- `finance-fiscal` → "Gestión Fiscal" (UI)
- `finance-accounting` → "Contabilidad y Reportes" (UI)

**Decisión clave**: Cash sessions van en `finance-operations` junto con otros medios de pago, no en accounting

---

## 📁 Estructura Final Propuesta

### Convenciones de Scaffolding

**src/modules/**: Módulos FLAT (todos al mismo nivel)
```
src/modules/
├── sales/
├── materials/
├── finance-operations/      ✅ Mantener prefijo "finance-"
├── finance-fiscal/          ✅ Mantener prefijo "finance-"
└── finance-accounting/      ✅ Mantener prefijo "finance-"
```

**src/pages/admin/**: Páginas organizadas por DOMINIO
```
src/pages/admin/finance/
├── billing/
├── integrations/
├── cash/
├── corporate/
└── fiscal/
```

**Razón**: Seguimos la convención del proyecto donde modules están flat y pages están agrupadas por dominio.

---

## 📦 Estructura Completa de los 3 Módulos

### 1. finance-operations (Operaciones Financieras)

**Responsabilidad**: TODOS los medios de pago + billing + corporate

```
src/modules/finance-operations/
├── manifest.tsx
│
├── billing/                        # Invoicing & subscriptions
│   ├── components/
│   │   ├── BillingWidget.tsx
│   │   ├── RecurringBillingForm.tsx
│   │   └── RecurringBillingAnalytics.tsx
│   ├── services/
│   │   ├── billingApi.ts
│   │   ├── billingCalculations.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useBilling.ts
│   │   └── useRecurringBilling.ts
│   └── types/
│       └── index.ts
│
├── integrations/                   # Payment gateways (digital)
│   ├── components/
│   │   ├── PaymentMethodsManager.tsx
│   │   ├── PaymentGatewaysConfig.tsx
│   │   ├── PaymentWebhooks.tsx
│   │   └── IntegrationsAnalytics.tsx
│   ├── services/
│   │   ├── paymentsApi.ts
│   │   ├── modoService.ts
│   │   └── mercadoPagoService.ts
│   ├── hooks/
│   │   ├── usePaymentMethods.ts
│   │   └── usePaymentGateways.ts
│   └── types/
│       └── index.ts
│
├── cash/                           # ✅ Cash sessions (efectivo físico)
│   ├── components/
│   │   ├── CashSessionManager.tsx
│   │   ├── CashSessionIndicator.tsx
│   │   ├── OpenSessionModal.tsx
│   │   └── CloseSessionModal.tsx
│   ├── services/
│   │   ├── cashSessionService.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useCashSession.ts
│   │   ├── useCashData.ts
│   │   └── useCashPage.ts
│   └── handlers/                   # EventBus handlers
│       ├── salesPaymentHandler.ts
│       └── index.ts
│
├── corporate/                      # B2B accounts & credit
│   ├── components/
│   │   ├── CorporateAccountsManager.tsx
│   │   ├── CreditLimitTracker.tsx
│   │   ├── ARAgingReport.tsx
│   │   └── CreditUtilizationWidget.tsx
│   ├── services/
│   │   ├── corporateAccountsService.ts
│   │   ├── creditManagementService.ts
│   │   └── paymentTermsService.ts
│   ├── hooks/
│   │   ├── useCorporateAccounts.ts
│   │   └── useCreditManagement.ts
│   └── types/
│       └── index.ts
│
└── shared/
    ├── types/
    └── utils/
```

### 2. finance-fiscal (Gestión Fiscal)

**Responsabilidad**: Tax compliance, AFIP, invoicing fiscal

```
src/modules/finance-fiscal/
├── manifest.tsx
├── components/
│   ├── FiscalWidget.tsx
│   ├── AFIPIntegration/
│   ├── InvoiceGeneration/
│   ├── TaxCompliance/
│   └── FinancialReporting/
├── services/
│   ├── fiscalApi.ts
│   ├── afipService.ts
│   ├── taxCalculationService.ts
│   └── financialPlanningEngine.ts
├── hooks/
│   ├── useFiscal.ts
│   ├── useTaxConfig.ts
│   └── useFiscalPage.ts
└── types/
    └── fiscalTypes.ts
```

### 3. finance-accounting (Contabilidad y Reportes)

**Responsabilidad**: Journal entries, chart of accounts, financial reports

```
src/modules/finance-accounting/
├── manifest.tsx
├── components/
│   ├── ChartOfAccountsTree.tsx
│   ├── MoneyLocationsList.tsx
│   ├── JournalEntriesViewer.tsx
│   ├── BalanceSheetReport.tsx
│   ├── CashFlowReport.tsx
│   └── ProfitAndLossReport.tsx
├── services/
│   ├── journalService.ts
│   ├── chartOfAccountsService.ts
│   ├── moneyLocationsService.ts
│   └── reportsService.ts
├── hooks/
│   ├── useChartOfAccounts.ts
│   └── useFinancialReports.ts
├── handlers/                       # EventBus handlers for accounting
│   ├── payrollHandler.ts
│   ├── materialsHandler.ts
│   └── index.ts
└── types/
    └── index.ts
```

---

## 📋 Páginas (mantener estructura actual)

```
src/pages/admin/finance/
├── page.tsx                        # Dashboard principal finance (overview)
├── billing/
│   └── page.tsx
├── integrations/
│   ├── page.tsx
│   └── tabs/
│       ├── payment-methods/
│       └── gateways/
├── corporate/
│   └── page.tsx
├── fiscal/
│   ├── page.tsx
│   ├── components/
│   ├── hooks/
│   └── services/
└── cash/                           # ✅ Accounting page
    ├── page.tsx
    ├── components/
    ├── hooks/
    └── services/
```

---

## 🔄 Componentes Dispersos Encontrados

### ✅ Mantener Donde Están (no mover)

| Archivo | Ubicación Actual | Razón |
|---------|-----------------|-------|
| `sales/b2b/services/financeIntegration.ts` | `src/modules/sales/` | ✅ Cliente de finance-corporate. Integración correcta. |
| `suppliers/payment_terms` | `src/pages/admin/supply-chain/suppliers/types/` | ✅ Metadata de supplier, no lógica de finance. |
| `paymentsStore.ts` | `src/store/` | ⚠️ Deprecated para server data, solo UI state. Podría moverse a `finance/operations/` pero no urgente. |
| `cash/handlers/*` | `src/modules/cash/handlers/` | ✅ Moverán a `finance/accounting/handlers/` en la consolidación. |

### 🔀 Mover a Finance Domain

| Archivo | Desde | Hacia | Razón |
|---------|-------|-------|-------|
| `settings/pages/payment-methods/page.tsx` | `src/pages/admin/core/settings/` | `src/pages/admin/finance/integrations/` | Settings de payment methods es parte de integrations |
| `lib/events/__tests__/business/payment-processing.test.ts` | `src/lib/events/__tests__/` | `src/modules/finance/operations/__tests__/` | Test de procesamiento de pagos es parte de operations |

### ❌ Eliminar (Duplicados/Obsoletos)

| Archivo | Razón |
|---------|-------|
| `cash-payment-system.test.ts.skip` | Test skipped, probablemente obsoleto |
| `modules/cash-management/manifest.tsx` (widget disabled) | Widget CashBalanceWidget nunca implementado, eliminar código muerto |

---

## 📜 Manifests de los 3 Módulos

### 1. Operations Manifest

```tsx
// src/modules/finance-operations/manifest.tsx

import type { ModuleManifest } from '@/lib/modules/types';

export const financeOperationsManifest: ModuleManifest = {
  id: 'finance-operations',
  name: 'Operaciones Financieras',  // ✅ Nombre en español para UI
  version: '1.0.0',

  permissionModule: 'finance',
  minimumRole: 'CAJERO',

  depends: ['customers'],

  activatedBy: [
    'finance_billing',
    'finance_payment_integrations',
    'finance_corporate_accounts',
    'finance_cash_sessions',  // ✅ Incluye cash
  ],

  hooks: {
    provide: [
      // Billing
      'finance.billing.invoice_generated',
      'finance.billing.payment_received',

      // Integrations (gateways)
      'finance.integrations.payment_processed',

      // Cash
      'cash.session.opened',
      'cash.session.closed',

      // Corporate
      'finance.corporate.credit_check',

      // UI
      'dashboard.widgets',
      'shift-control.indicators',
      'settings.specialized.cards',
    ],
    consume: [
      'sales.payment.completed',
      'sales.order_completed',
      'customers.account_created',
    ],
  },

  exports: {
    billing: {
      generateInvoice: () => import('./billing/services/billingApi'),
      processPayment: () => import('./billing/services/billingApi'),
      calculateInvoiceTotal: () => import('./billing/services/billingCalculations'),
    },
    integrations: {
      processGatewayPayment: () => import('./integrations/services/paymentsApi'),
      configureMODO: () => import('./integrations/services/modoService'),
    },
    cash: {
      getActiveCashSession: () => import('./cash/services/cashSessionService'),
      openCashSession: () => import('./cash/services/cashSessionService'),
      closeCashSession: () => import('./cash/services/cashSessionService'),
    },
    corporate: {
      getCorporateAccount: () => import('./corporate/services/corporateAccountsService'),
      validateCredit: () => import('./corporate/services/creditManagementService'),
      getPaymentTerms: () => import('./corporate/services/paymentTermsService'),
    },
  },

  metadata: {
    category: 'finance',
    description: 'Gestión de pagos (efectivo, digital, B2B), facturación y cobranzas',
    tags: ['billing', 'payments', 'cash', 'corporate', 'integrations'],
    navigation: {
      domain: 'finance',
      routes: [
        { path: '/admin/finance/billing', label: 'Facturación' },
        { path: '/admin/finance/integrations', label: 'Integraciones' },
        { path: '/admin/finance/cash', label: 'Caja' },
        { path: '/admin/finance/corporate', label: 'Corporativo' },
      ],
    },
  },
};
```

### 2. Fiscal Manifest

```tsx
// src/modules/finance-fiscal/manifest.tsx

import type { ModuleManifest } from '@/lib/modules/types';

export const financeFiscalManifest: ModuleManifest = {
  id: 'finance-fiscal',
  name: 'Gestión Fiscal',  // ✅ Nombre en español para UI
  version: '1.0.0',

  permissionModule: 'finance',
  minimumRole: 'SUPERVISOR',

  depends: ['sales'],

  activatedBy: ['finance_fiscal', 'finance_afip_integration'],

  hooks: {
    provide: [
      'finance.fiscal.invoice_generated',
      'finance.fiscal.cae_generated',
      'dashboard.widgets',
      'sales.payment_actions',
    ],
    consume: [
      'sales.order_completed',
    ],
  },

  exports: {
    generateInvoice: () => import('./services/fiscalApi'),
    generateCAE: () => import('./services/afipService'),
    calculateTaxes: () => import('./services/taxCalculationService'),
    getAfipStatus: () => import('./services/afipService'),
  },

  metadata: {
    category: 'compliance',
    description: 'Cumplimiento fiscal, integración AFIP, y reportes impositivos',
    tags: ['fiscal', 'tax', 'afip', 'compliance'],
    navigation: {
      domain: 'finance',
      routes: [
        { path: '/admin/finance/fiscal', label: 'Fiscal e Impuestos' },
      ],
    },
  },
};
```

### 3. Accounting Manifest

```tsx
// src/modules/finance-accounting/manifest.tsx

import type { ModuleManifest } from '@/lib/modules/types';

export const financeAccountingManifest: ModuleManifest = {
  id: 'finance-accounting',
  name: 'Contabilidad y Reportes',  // ✅ Nombre en español para UI
  version: '1.0.0',

  permissionModule: 'finance',
  minimumRole: 'GERENTE',  // Contabilidad requiere rol más alto

  depends: [],

  activatedBy: ['finance_accounting', 'finance_reports'],

  hooks: {
    provide: [
      'finance.reports.balance_sheet',
      'finance.reports.profit_loss',
      'finance.reports.cash_flow',
      'finance.journal_entry.created',
      'dashboard.widgets',
    ],
    consume: [
      'sales.payment.completed',      // Create journal entries
      'sales.refund.completed',
      'materials.purchase.completed',
      'payroll.payment.completed',
    ],
  },

  exports: {
    journal: {
      createJournalEntry: () => import('./services/journalService'),
      getJournalEntries: () => import('./services/journalService'),
    },
    reports: {
      getBalanceSheet: () => import('./services/reportsService'),
      getProfitAndLoss: () => import('./services/reportsService'),
      getCashFlowStatement: () => import('./services/reportsService'),
    },
    chartOfAccounts: {
      fetchChartOfAccounts: () => import('./services/chartOfAccountsService'),
      createAccount: () => import('./services/chartOfAccountsService'),
    },
    moneyLocations: {
      fetchMoneyLocations: () => import('./services/moneyLocationsService'),
    },
  },

  metadata: {
    category: 'accounting',
    description: 'Contabilidad de doble entrada, libro mayor, y reportes financieros',
    tags: ['accounting', 'journal', 'reports', 'ledger'],
    navigation: {
      domain: 'finance',
      routes: [
        { path: '/admin/finance/accounting', label: 'Contabilidad' },
      ],
    },
  },
};
```

---

## 🔑 Permisos Unificados

**Antes (6 módulos con 3 permissions diferentes):**
```
finance-billing → permissionModule: 'billing'
finance-fiscal → permissionModule: 'fiscal'
finance-integrations → permissionModule: 'billing'
finance-corporate → permissionModule: 'fiscal'
cash → permissionModule: 'finance'
cash-management → permissionModule: 'fiscal'
```

**Después (3 módulos con 1 permission unificado):**
```
finance/operations → permissionModule: 'finance'
finance/compliance → permissionModule: 'finance'
finance/accounting → permissionModule: 'finance'
```

**Refinamiento por `minimumRole`:**
- `operations`: CAJERO (billing, payments)
- `compliance`: SUPERVISOR (fiscal, tax)
- `accounting`: CAJERO (cash sessions, journal)

---

## 📊 Exports Pattern Unificado

**Patrón único**: Dynamic imports agrupados por dominio

```tsx
// ✅ CORRECTO (patrón unificado)
exports: {
  billing: {
    generateInvoice: () => import('./billing/services/billingApi'),
    processPayment: () => import('./billing/services/billingApi'),
  },
  corporate: {
    validateCredit: () => import('./corporate/services/creditManagementService'),
  },
}

// ❌ INCORRECTO (patrón inline)
exports: {
  generateInvoice: async (customerId, items) => {
    const { calculateInvoiceTotal } = await import('./services');
    return calculateInvoiceTotal(items);
  },
}
```

---

## 🚀 Plan de Migración

### Fase 1: Consolidar cash + cash-management (2-3 horas)
1. Crear `src/modules/finance/accounting/`
2. Mover todos los archivos de `cash/` y `cash-management/`
3. Consolidar servicios duplicados
4. Actualizar imports en toda la app
5. Eliminar `cash/` y `cash-management/` originales

### Fase 2: Reorganizar billing, integrations, corporate (2-3 horas)
1. Crear `src/modules/finance/operations/`
2. Mover `finance-billing/` → `operations/billing/`
3. Mover `finance-integrations/` → `operations/integrations/`
4. Mover `finance-corporate/` → `operations/corporate/`
5. Actualizar manifest `operations/manifest.tsx`
6. Actualizar imports

### Fase 3: Reorganizar fiscal (1-2 horas)
1. Crear `src/modules/finance/compliance/`
2. Mover `finance-fiscal/` → `compliance/`
3. Actualizar manifest `compliance/manifest.tsx`
4. Actualizar imports

### Fase 4: Limpiar y documentar (1 hora)
1. Eliminar módulos antiguos `finance-*/`
2. Mover `settings/payment-methods/` a `finance/integrations/`
3. Actualizar `src/modules/index.ts`
4. Crear `finance/README.md`
5. Ejecutar tests

**Tiempo total estimado**: 6-9 horas

---

## ✅ Checklist de Implementación

- [ ] Fase 1: Consolidar accounting
- [ ] Fase 2: Reorganizar operations
- [ ] Fase 3: Reorganizar compliance
- [ ] Fase 4: Limpieza y docs
- [ ] Actualizar imports en toda la app
- [ ] Ejecutar `tsc --noEmit`
- [ ] Ejecutar tests: `npm test`
- [ ] Actualizar documentación

---

## 🎯 Resultado Final

**De esto (6 módulos):**
```
modules/
├── finance-billing/
├── finance-fiscal/
├── finance-integrations/
├── finance-corporate/
├── cash/
└── cash-management/
```

**A esto (3 módulos):**
```
modules/
├── finance-operations/        # Todos los pagos + billing + corporate
│   ├── billing/
│   ├── integrations/
│   ├── cash/                 # ✅ Cash sessions aquí
│   └── corporate/
├── finance-fiscal/            # Tax & compliance
└── finance-accounting/        # Journal + reports
```

**Beneficios:**
- ✅ 3 módulos estratégicos en vez de 6 (50% menos complejidad)
- ✅ Todos los medios de pago centralizados en `operations`
- ✅ Permisos unificados: `permissionModule: 'finance'`
- ✅ Exports con patrón consistente (dynamic imports)
- ✅ Sin duplicación cash/cash-management
- ✅ Nombres en español para UI/UX
- ✅ Estructura clara y lógica por responsabilidad

