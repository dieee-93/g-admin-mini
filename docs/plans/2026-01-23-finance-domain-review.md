# Finance Domain Architecture Review

**Fecha**: 2026-01-23
**Objetivo**: Analizar y reorganizar el dominio finance (módulos, páginas, interfaces)
**Status**: 🔍 Analysis Complete - Awaiting Decision

---

## 📊 Situación Actual

### Módulos Finance (6 módulos)

| Módulo | Route | Permisos | Depend | Status |
|--------|-------|----------|---------|--------|
| `finance-billing` | `/admin/finance/billing` | `billing` | `customers` | ✅ Completo |
| `finance-fiscal` | `/admin/finance/fiscal` | `fiscal` | `sales` | ⚠️ Mock data |
| `finance-integrations` | `/admin/finance/integrations` | `billing` | `finance-fiscal`, `finance-billing` | ✅ Completo |
| `finance-corporate` | `/admin/finance/corporate` | `fiscal` | `customers`, `finance-fiscal`, `finance-billing` | ⚠️ Imports incorrectos |
| `cash` | No route | `finance` | None | ✅ Sistema contable |
| `cash-management` | `/admin/finance/cash` | `fiscal` | None | ⚠️ Widget disabled |

### Páginas Finance (5 páginas)

```
src/pages/admin/finance/
├── billing/page.tsx       ✅ Completa (Tabs: dashboard, create, manage, analytics)
├── cash/page.tsx          ✅ Completa (Balance Sheet, P&L, Cash Flow)
├── corporate/page.tsx     ❌ Import error: @/modules/finance/components/* (should be finance-corporate)
├── fiscal/page.tsx        ✅ Completa (AFIP, Invoices, Tax compliance)
└── integrations/page.tsx  ✅ Completa (Payment methods, Gateways, Webhooks)
```

---

## 🔴 Problemas Detectados

### 1. **Duplicación: cash vs cash-management**

**Conflicto de responsabilidades:**

| Aspecto | `cash` (Module) | `cash-management` (Module) |
|---------|-----------------|---------------------------|
| **Propósito** | Sistema de contabilidad doble entrada | Gestión de sesiones de caja |
| **Exports** | Services: `cashSession`, `journal`, `chartOfAccounts`, `moneyLocations`, `reports` | Services: `getActiveCashSession`, `openCashSession`, `closeCashSession`, `createJournalEntry` (mock) |
| **Hook Points** | Provee: `finance.reports.*`, `cash.journal_entry.created`, `cash.session.*` | Provee: `cash.session.*`, `cash.journal_entry.*`, `dashboard.widgets` (disabled), `shift-control.indicators` |
| **Page** | No tiene página dedicada | Tiene `/admin/finance/cash` |

**Análisis:**
- `cash-management` exporta `createJournalEntry` que retorna **mock data** (línea 180): `{ entryId: 'mock-entry-id', created: true }`
- `cash` tiene implementación completa de journal entries en `journalService.ts`
- **Overlap**: Ambos manejan sesiones de caja y journal entries
- **Widget disabled**: `cash-management` tiene un dashboard widget comentado (líneas 59-72) porque retorna objeto en vez de JSX

### 2. **UI Incompleta / Mock Data**

| Componente | Ubicación | Issue |
|------------|-----------|-------|
| `BillingWidget` | `finance-billing/components/` | Mock data hardcoded (línea 27-32): `pendingInvoices: 0, overdueAmount: 0, monthlyRecurring: 0` |
| `FiscalWidget` | `finance-fiscal/components/` | Mock data hardcoded (línea 35-39): stats siempre en 0 |
| `CashBalanceWidget` | `cash-management/` | **No existe** - Widget disabled en manifest (línea 59-72) |
| `SubscriptionManager` | `billing/page.tsx` | Placeholder con bullet list (línea 152-169) - sin lógica |

### 3. **Imports Incorrectos**

**finance-corporate/page.tsx** (línea 12-15):

```tsx
import { CorporateAccountsManager } from '@/modules/finance/components/CorporateAccountsManager';
import { CreditLimitTracker } from '@/modules/finance/components/CreditLimitTracker';
import { ARAgingReport } from '@/modules/finance/components/ARAgingReport';
import { CreditUtilizationWidget } from '@/modules/finance/components/CreditUtilizationWidget';
```

**Error**: Path `@/modules/finance/` no existe. Debería ser `@/modules/finance-corporate/`

### 4. **Inconsistencia de Permisos**

| Módulo | `permissionModule` | `minimumRole` | Inconsistencia |
|--------|-------------------|---------------|----------------|
| `finance-billing` | `billing` | `SUPERVISOR` | ✅ OK |
| `finance-fiscal` | `fiscal` | `SUPERVISOR` | ✅ OK |
| `finance-integrations` | `billing` | `ADMINISTRADOR` | ⚠️ Usa permisos de billing pero requiere admin |
| `finance-corporate` | `fiscal` | `ADMINISTRADOR` | ⚠️ Usa permisos de fiscal pero es B2B finance |
| `cash` | `finance` | `GERENTE` | ✅ OK |
| `cash-management` | `fiscal` | `CAJERO` | ⚠️ Usa permisos de fiscal pero maneja caja |

**Problema**: No hay un módulo de permisos unificado para "finanzas". Cada submódulo usa permisos diferentes (`billing`, `fiscal`, `finance`).

### 5. **Estructura de Carpetas Confusa**

**Módulos dispersos:**
```
src/modules/
├── finance-billing/         # Billing & subscriptions
├── finance-fiscal/          # Tax & AFIP
├── finance-integrations/    # Payment gateways
├── finance-corporate/       # B2B accounts
├── cash/                    # Double-entry accounting
└── cash-management/         # Cash sessions

src/pages/admin/finance/
├── billing/
├── cash/
├── corporate/
├── fiscal/
└── integrations/
```

**Problema**: No está claro cuándo usar `/modules/finance-*` vs `/pages/admin/finance/*` o si deberían consolidarse.

### 6. **Exports No Consistentes**

**Patrón 1: Dynamic Imports (finance-corporate)**
```tsx
exports: {
  components: {
    CreditUtilizationWidget: () => import('./components/CreditUtilizationWidget'),
  },
  services: {
    corporateAccountsService: () => import('./services/corporateAccountsService'),
  },
}
```

**Patrón 2: Async Functions (cash-management)**
```tsx
exports: {
  hooks: {
    useCashSession: () => import('./hooks/useCashSession'),
  },
  services: {
    getActiveCashSession: async () => { ... },
    openCashSession: async (input, userId) => { ... },
  },
}
```

**Patrón 3: Inline Functions (finance-billing)**
```tsx
exports: {
  generateInvoice: async (customerId, items) => {
    const { calculateInvoiceTotal } = await import('@/pages/admin/finance/billing/services');
    // ...
  },
}
```

**Problema**: Tres patrones diferentes de exports. No hay consistencia.

---

## 📈 Métricas del Código

| Métrica | Valor |
|---------|-------|
| Total módulos finance | 6 |
| Total páginas finance | 5 |
| Líneas en widgets | 742 |
| Mock/Placeholder components | 4 |
| Imports incorrectos | 4 (corporate page) |
| Widgets disabled | 1 (CashBalanceWidget) |
| TODOs en cash handlers | 3 |

---

## 🎯 Opciones de Reorganización

Ahora que conocemos los problemas, podemos explorar 3 enfoques:

### Opción A: Consolidación Máxima (1 módulo finance)
- Merge `finance-*` + `cash-*` en un solo módulo `finance`
- Subdominios como submódulos: `finance/billing`, `finance/fiscal`, etc.
- **Pros**: Estructura simple, un solo permissionModule
- **Contras**: Módulo muy grande, viola Single Responsibility

### Opción B: Separación por Dominio (manteniendo estructura actual, corrigiendo issues)
- Mantener 6 módulos independientes
- Consolidar `cash` + `cash-management` en uno solo
- Corregir imports, permisos, exports
- **Pros**: Cambios mínimos, granularidad alta
- **Contras**: Complejidad de gestión, permisos dispersos

### Opción C: Agrupación Estratégica (3 módulos core)
- `finance-operations` (billing, integrations, corporate)
- `finance-compliance` (fiscal, AFIP)
- `finance-accounting` (cash + cash-management consolidado)
- **Pros**: Balance entre granularidad y simplicidad
- **Contras**: Requiere refactor significativo

---

## ❓ Siguiente Paso

**¿Cuál es tu prioridad inmediata?**

1. **Corregir errores críticos** (imports rotos, mock data, widget disabled)
2. **Consolidar cash/cash-management** (eliminar duplicación)
3. **Unificar permisos** (crear permissionModule consistente)
4. **Reorganizar estructura completa** (elegir Opción A/B/C)

