# Remaining Hooks Analysis - src/hooks/

**Date**: 2026-01-12
**Status**: Post-Migration Analysis (Staff, Customers, Suppliers completed)

---

## 📊 Summary

**Total hooks remaining**: [TO BE FILLED]
**Breakdown**:
- ✅ Should STAY (generic/core): [COUNT]
- ⚠️ Should MOVE to modules: [COUNT]
- 🔍 Need analysis: [COUNT]

---

## ✅ HOOKS THAT SHOULD STAY (Generic/Core)

These are truly generic hooks without domain-specific logic:

### Infrastructure/Framework Hooks
- `useDebounce.ts` - Generic debounce utility
- `usePagination.ts` - Generic pagination utility
- `useErrorHandler.ts` - Generic error handling
- `usePermissions.ts` - Cross-cutting RBAC concern
- `useValidationContext.ts` - Framework-level validation context

### Navigation/Routing
- `useNavigationDebugger.ts` - Dev tooling
- `useRouteBasedPreloading.ts` - Performance optimization
- `useSmartRedirect.ts` - Navigation utility
- `useNavigationBadges.ts` - Navigation UI state

### System/App-level
- `useSystemSetup.ts` - App initialization
- `useSystemEnums.ts` - System-wide enums
- `useZustandStores.ts` - Store aggregator

---

## ⚠️ HOOKS THAT SHOULD MOVE TO MODULES

### Assets Module
- `useAssets.ts` → `src/modules/assets/hooks/`
- `useAssetValidation.ts` → `src/modules/assets/hooks/`

### Materials Module
- `useMaterialValidation.ts` → `src/modules/materials/hooks/`
- `useInventoryAlerts.ts` → `src/modules/materials/hooks/`
- `useInventoryTransferValidation.ts` → `src/modules/materials/hooks/`
- `useSmartInventoryAlerts.ts` → `src/modules/materials/hooks/`

### Products Module
- `useProductValidation.ts` → `src/modules/products/hooks/`
- `useProductCatalog.ts` → `src/modules/products/hooks/`
- `useSmartProductsAlerts.ts` → `src/modules/products/hooks/`

### Sales Module
- `useSaleValidation.ts` → `src/modules/sales/hooks/`

### Finance Modules
- `useFiscalDocumentValidation.ts` → `src/modules/finance-fiscal/hooks/`
- `usePaymentIntegrationValidation.ts` → `src/modules/finance-integrations/hooks/`

### Fulfillment Module
- `useFulfillmentPolicies.ts` → `src/modules/fulfillment/hooks/`

### Gamification Module
- `useMembershipValidation.ts` → `src/modules/gamification/hooks/`

### Rental Module (create if needed)
- `useRentalValidation.ts` → `src/modules/rental/hooks/`

### Recurring Billing Module (create if needed)
- `useRecurringBillingValidation.ts` → `src/modules/recurring-billing/hooks/`

---

## 🔍 HOOKS NEEDING ANALYSIS

### Alerts/Notifications System
**Location decision needed**: Module vs `src/lib/`?

- `useAlertsWorker.ts` - Alert worker management
- `useGlobalAlertsInit.ts` - Alert initialization
- `useNotifications.ts` - Notifications system
- `useNotificationRules.ts` - Notification rules

**Recommendation**: Move to `src/lib/alerts/hooks/` or `src/lib/notifications/hooks/`

### Module Integration
- `useModuleBadgeSync.ts` - Module badge synchronization

**Recommendation**: Move to `src/lib/modules/hooks/`

### Operational
- `useOperationalLockWatcher.ts` - Operations locking

**Recommendation**: Move to `src/lib/operations/hooks/` or relevant operations module

### Validation
- `usePasswordValidation.ts` - Generic validation utility

**Recommendation**: STAY (truly generic)

---

## 📋 MIGRATION PRIORITY

### Phase 1: High-Value Modules (Existing modules)
1. **Materials** (4 hooks)
2. **Products** (3 hooks)
3. **Assets** (2 hooks)
4. **Sales** (1 hook)

### Phase 2: Finance Modules (Existing modules)
1. **Finance-Fiscal** (1 hook)
2. **Finance-Integrations** (1 hook)

### Phase 3: Other Modules (Existing modules)
1. **Fulfillment** (1 hook)
2. **Gamification** (1 hook)

### Phase 4: Infrastructure Refactor
1. Move alerts/notifications to `src/lib/`
2. Move module-specific to `src/lib/modules/`
3. Clean up `src/hooks/` to only generic hooks

---

## 📊 EXPECTED FINAL STATE

### src/hooks/ (Only Generic)
```
src/hooks/
├── core/
│   ├── useDebounce.ts
│   ├── usePagination.ts
│   ├── useErrorHandler.ts
│   ├── usePasswordValidation.ts
│   └── index.ts
├── navigation/
│   ├── useNavigationDebugger.ts
│   ├── useRouteBasedPreloading.ts
│   ├── useSmartRedirect.ts
│   └── index.ts
└── index.ts
```

### src/lib/ (Infrastructure)
```
src/lib/
├── alerts/hooks/
│   ├── useAlertsWorker.ts
│   ├── useGlobalAlertsInit.ts
│   └── index.ts
├── notifications/hooks/
│   ├── useNotifications.ts
│   ├── useNotificationRules.ts
│   └── index.ts
└── modules/hooks/
    ├── useModuleBadgeSync.ts
    └── index.ts
```

---

## ✅ NEXT STEPS

1. Execute Phase 1 (Materials, Products, Assets, Sales)
2. Execute Phase 2 (Finance modules)
3. Execute Phase 3 (Other modules)
4. Refactor infrastructure hooks to `src/lib/`
5. Reorganize `src/hooks/` into subdirectories
6. Update documentation

---

**Status**: Ready for Phase 1 execution
**Estimated time**: 2-3 hours for all phases
