# Finance Domain Reorganization - Architecture Decision

**Fecha**: 2026-01-23
**Status**: 🎯 Decision Pending
**Contexto**: [Finance Domain Review](../../plans/2026-01-23-finance-domain-review.md)

---

## 📋 Problema a Resolver

Actualmente tenemos **6 módulos finance** con:
- Duplicación entre `cash` y `cash-management`
- Permisos inconsistentes (`billing`, `fiscal`, `finance`)
- Exports con 3 patrones diferentes
- Estructura de carpetas confusa

**Objetivo**: Definir arquitectura definitiva para el dominio finance.

---

## 🎯 Opciones de Reorganización

### Opción A: Consolidación Máxima (1 módulo)

**Estructura Propuesta:**

```
src/modules/finance/
├── manifest.tsx                    # Módulo principal
├── domains/                        # Subdominios (no son módulos independientes)
│   ├── billing/
│   │   ├── components/
│   │   ├── services/
│   │   └── hooks/
│   ├── fiscal/
│   │   ├── components/
│   │   ├── services/
│   │   └── hooks/
│   ├── integrations/
│   │   ├── components/
│   │   ├── services/
│   │   └── hooks/
│   ├── corporate/
│   │   ├── components/
│   │   ├── services/
│   │   └── hooks/
│   └── accounting/                 # cash + cash-management consolidado
│       ├── components/
│       ├── services/
│       └── hooks/
└── shared/                         # Utilities compartidas
    ├── types/
    └── utils/

src/pages/admin/finance/
├── page.tsx                        # Dashboard principal finance
├── billing/page.tsx
├── fiscal/page.tsx
├── integrations/page.tsx
├── corporate/page.tsx
└── accounting/page.tsx
```

**Manifest Unificado:**

```tsx
export const financeManifest: ModuleManifest = {
  id: 'finance',
  name: 'Finance',
  version: '3.0.0',

  permissionModule: 'finance', // ✅ Un solo módulo de permisos
  minimumRole: 'CAJERO',       // Base mínimo, refinado por feature

  depends: ['customers', 'sales'],

  // Activar subdominios según features
  activatedBy: [
    'finance_billing',
    'finance_fiscal',
    'finance_integrations',
    'finance_corporate',
    'finance_accounting'
  ],

  hooks: {
    provide: [
      'finance.billing.*',
      'finance.fiscal.*',
      'finance.accounting.*',
      'dashboard.widgets',
    ],
    consume: [
      'sales.payment.completed',
      'customers.account_created',
    ],
  },

  exports: {
    // Patrón unificado: dynamic imports agrupados
    billing: {
      generateInvoice: () => import('./domains/billing/services/invoiceService'),
      processPayment: () => import('./domains/billing/services/paymentService'),
    },
    fiscal: {
      generateCAE: () => import('./domains/fiscal/services/afipService'),
      calculateTaxes: () => import('./domains/fiscal/services/taxService'),
    },
    accounting: {
      createJournalEntry: () => import('./domains/accounting/services/journalService'),
      getCashSession: () => import('./domains/accounting/services/sessionService'),
    },
  },
};
```

**✅ Ventajas:**
- Un solo módulo de permisos: `finance` (simplifica RBAC)
- Exports con patrón unificado (dynamic imports agrupados por dominio)
- Estructura clara: `finance/domains/{billing,fiscal,...}`
- Fácil de navegar para nuevos desarrolladores
- Setup/teardown centralizados

**❌ Desventajas:**
- Módulo grande (posible "God Module" antipattern)
- Viola Single Responsibility Principle
- Dificulta lazy loading granular (cargas todo finance o nada)
- Hard to test: tests del módulo completo vs tests unitarios
- Coupling alto entre subdominios

**📊 Impacto:**
- **Refactor**: Alto (merge 6 módulos en 1)
- **Breaking changes**: Sí (cambio de imports en toda la app)
- **Tiempo estimado**: 8-12 horas

---

### Opción B: Separación por Dominio (6 módulos independientes)

**Estructura Propuesta:**

```
src/modules/
├── finance-billing/                # Mantener como está
│   ├── manifest.tsx
│   ├── components/
│   ├── services/
│   └── hooks/
├── finance-fiscal/                 # Mantener como está
│   ├── manifest.tsx
│   ├── components/
│   ├── services/
│   └── hooks/
├── finance-integrations/           # Mantener como está
│   ├── manifest.tsx
│   ├── components/
│   ├── services/
│   └── hooks/
├── finance-corporate/              # Mantener como está (corregir imports)
│   ├── manifest.tsx
│   ├── components/
│   ├── services/
│   └── hooks/
└── finance-accounting/             # ✅ NUEVO: cash + cash-management consolidado
    ├── manifest.tsx
    ├── components/
    │   ├── ChartOfAccountsTree.tsx
    │   ├── MoneyLocationsList.tsx
    │   └── CashSessionIndicator.tsx
    ├── services/
    │   ├── cashSessionService.ts
    │   ├── journalService.ts
    │   └── reportsService.ts
    └── hooks/
        └── useCashSession.ts
```

**Cambio principal: Consolidar cash + cash-management**

```tsx
export const financeAccountingManifest: ModuleManifest = {
  id: 'finance-accounting',
  name: 'Finance Accounting',
  version: '1.0.0',

  permissionModule: 'finance', // ✅ Unificado
  minimumRole: 'CAJERO',

  depends: [],

  hooks: {
    provide: [
      'finance.reports.*',          // Balance Sheet, P&L, Cash Flow
      'cash.session.*',             // Session events
      'cash.journal_entry.created',
      'dashboard.widgets',
      'shift-control.indicators',
    ],
    consume: [
      'sales.payment.completed',
      'sales.refund.completed',
      'materials.purchase.completed',
    ],
  },

  exports: {
    // Patrón unificado: dynamic imports
    services: {
      cashSession: () => import('./services/cashSessionService'),
      journal: () => import('./services/journalService'),
      reports: () => import('./services/reportsService'),
    },
    hooks: {
      useCashSession: () => import('./hooks/useCashSession'),
    },
  },
};
```

**✅ Ventajas:**
- Cambios mínimos (solo consolidar cash/cash-management)
- Granularidad alta: cada módulo con responsabilidad clara
- Lazy loading óptimo: solo cargas lo que necesitas
- Fácil de testear: cada módulo independiente
- Respeta Single Responsibility Principle
- Desacoplamiento máximo

**❌ Desventajas:**
- 5 módulos finance (complejidad de gestión)
- Permisos aún dispersos si no unificamos `permissionModule`
- Exports con 3 patrones (requiere estandarización)
- Estructura de carpetas duplicada (cada módulo con components/, services/, hooks/)

**📊 Impacto:**
- **Refactor**: Medio (solo consolidar cash/cash-management)
- **Breaking changes**: Mínimos (solo imports de cash/cash-management)
- **Tiempo estimado**: 4-6 horas

---

### Opción C: Agrupación Estratégica (3 módulos core)

**Estructura Propuesta:**

```
src/modules/
├── finance-operations/             # ✅ NUEVO: billing + integrations + corporate
│   ├── manifest.tsx
│   ├── billing/
│   │   ├── components/
│   │   ├── services/
│   │   └── hooks/
│   ├── integrations/
│   │   ├── components/
│   │   ├── services/
│   │   └── hooks/
│   └── corporate/
│       ├── components/
│       ├── services/
│       └── hooks/
├── finance-compliance/             # ✅ NUEVO: fiscal + AFIP
│   ├── manifest.tsx
│   ├── components/
│   ├── services/
│   └── hooks/
└── finance-accounting/             # ✅ NUEVO: cash + cash-management
    ├── manifest.tsx
    ├── components/
    ├── services/
    └── hooks/
```

**Criterio de Agrupación:**

| Módulo | Contiene | Razón |
|--------|----------|-------|
| `finance-operations` | Billing, Integrations, Corporate | Operaciones de ingresos/pagos B2B y B2C |
| `finance-compliance` | Fiscal, AFIP, Tax | Cumplimiento normativo y regulatorio |
| `finance-accounting` | Cash, Journal, Reports | Contabilidad y reportes financieros |

**Manifest ejemplo (finance-operations):**

```tsx
export const financeOperationsManifest: ModuleManifest = {
  id: 'finance-operations',
  name: 'Finance Operations',
  version: '1.0.0',

  permissionModule: 'finance', // ✅ Unificado
  minimumRole: 'CAJERO',

  depends: ['customers'],

  hooks: {
    provide: [
      'finance.billing.*',
      'finance.integrations.*',
      'finance.corporate.*',
      'dashboard.widgets',
    ],
    consume: [
      'sales.order_completed',
      'customers.account_created',
    ],
  },

  exports: {
    billing: {
      generateInvoice: () => import('./billing/services/invoiceService'),
      processPayment: () => import('./billing/services/paymentService'),
    },
    integrations: {
      processGatewayPayment: () => import('./integrations/services/gatewayService'),
    },
    corporate: {
      getCorporateAccount: () => import('./corporate/services/accountsService'),
      validateCredit: () => import('./corporate/services/creditService'),
    },
  },
};
```

**✅ Ventajas:**
- Balance entre granularidad y simplicidad (3 módulos vs 6 o 1)
- Agrupación lógica por responsabilidad de negocio
- Un solo `permissionModule: 'finance'` (simplifica RBAC)
- Exports agrupados por dominio (más fácil de descubrir)
- Lazy loading estratégico (cargas operations, compliance, o accounting según necesites)

**❌ Desventajas:**
- Refactor significativo (merge múltiples módulos)
- Requiere decisiones de agrupación (¿integrations va con operations o compliance?)
- Módulos más grandes que en Opción B
- Posible coupling entre subdominios dentro del mismo módulo

**📊 Impacto:**
- **Refactor**: Alto (merge 6 módulos en 3)
- **Breaking changes**: Moderados (cambio de imports pero nombres lógicos)
- **Tiempo estimado**: 6-10 horas

---

## 🔀 Comparación Side-by-Side

| Criterio | Opción A (1 módulo) | Opción B (6 módulos) | Opción C (3 módulos) |
|----------|-------------------|---------------------|---------------------|
| **Simplicidad** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Granularidad** | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Testabilidad** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Lazy Loading** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Mantenibilidad** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Permisos RBAC** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Coupling** | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Tiempo refactor** | 8-12h | 4-6h | 6-10h |

---

## 🎯 Recomendación

**Opción C (Agrupación Estratégica)** es la mejor opción porque:

1. **Balance arquitectónico**: Evita el extremo de "God Module" (Opción A) y la complejidad de gestión (Opción B)
2. **RBAC simplificado**: Un solo `permissionModule: 'finance'` con 3 subdominios lógicos
3. **Agrupación por dominio de negocio**:
   - Operations = dinero entrando/saliendo
   - Compliance = normativa/regulación
   - Accounting = contabilidad/reportes
4. **Exports descubribles**: `financeOperations.billing.generateInvoice()` es más claro que `finance.generateInvoice()`
5. **Lazy loading estratégico**: Puedes cargar solo operations si no necesitas compliance

---

## ❓ Decisión Necesaria

¿Qué opción prefieres?

- **Opción A**: Máxima simplicidad (1 módulo finance)
- **Opción B**: Máxima granularidad (5-6 módulos independientes)
- **Opción C**: Balance estratégico (3 módulos agrupados) ⭐ **Recomendado**
- **Opción D**: Híbrido personalizado (dime qué combinar)

