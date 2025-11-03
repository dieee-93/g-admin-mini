# 📚 PHASE 3 PROMPTS INDEX

**Created**: 2025-02-01
**Total Prompts**: 22 modules
**Estimated Total Time**: 86-103 hours

---

## 🎯 OVERVIEW

Individual prompts for each module in Phase 3 (Expand to Remaining Modules). Each prompt is **self-contained** and can be run in parallel.

---

## 📦 PHASE 3 P0 - CORE OPERATIONS (5 modules)

**Estimated Time**: 18-23 hours

1. 🆕 **Debug** - `phase3-p0/00-DEBUG-MODULE.md` (2-3h)
   - Development & debugging tools
   - Dependencies: None (observer)
   - minimumRole: SUPER_ADMIN
   - Note: Dev-only, hidden in production

2. ✅ **Dashboard** - `phase3-p0/01-DASHBOARD-MODULE.md` (4h)
   - Central dashboard, widget system
   - Dependencies: None (aggregator)
   - minimumRole: OPERADOR

3. ✅ **Customers** - `phase3-p0/02-CUSTOMERS-MODULE.md` (4-5h)
   - CRM foundation, RFM analysis
   - Dependencies: None (foundation)
   - minimumRole: OPERADOR

4. ✅ **Fulfillment** - `phase3-p0/03-FULFILLMENT-MODULE.md` (5-6h) 🔴 COMPLEX
   - Onsite/Pickup/Delivery modes
   - Dependencies: Sales, Staff, Materials
   - minimumRole: OPERADOR

5. 🆕 **Settings** - `phase3-p0/04-SETTINGS-MODULE.md` (4-5h)
   - System configuration, business profile, tax settings
   - Dependencies: None (foundation)
   - minimumRole: ADMINISTRADOR

---

## 📦 PHASE 3 P1 - SUPPLY CHAIN (4 modules)

**Estimated Time**: 15-18 hours

1. ✅ **Products** - `phase3-p1/01-PRODUCTS-MODULE.md` (4h)
   - Product catalog, recipes/BOM
   - Dependencies: Materials
   - minimumRole: OPERADOR

2. ✅ **Suppliers** - `phase3-p1/02-SUPPLIERS-MODULE.md` (4h)
   - Supplier management, ratings
   - Dependencies: None (foundation)
   - minimumRole: SUPERVISOR

3. ✅ **Supplier-Orders** - `phase3-p1/03-SUPPLIER-ORDERS-MODULE.md` (4-5h)
   - Purchase orders, receiving
   - Dependencies: Suppliers, Materials
   - minimumRole: SUPERVISOR

4. ⚠️ **Production** - ALREADY PRODUCTION-READY ✅
   - No prompt needed (completed in Phase 1)

---

## 📦 PHASE 3 P2 - FINANCE (3 modules)

**Estimated Time**: 12-15 hours

1. 🆕 **Fiscal** - `phase3-p2/01-FISCAL-MODULE.md` (4-5h)
   - Tax compliance (AFIP), invoicing
   - Dependencies: Sales
   - minimumRole: SUPERVISOR

2. 🆕 **Billing** - `phase3-p2/02-BILLING-MODULE.md` (4-5h)
   - Recurring billing, subscriptions
   - Dependencies: Customers
   - minimumRole: SUPERVISOR

3. 🆕 **Finance-Integrations** - `phase3-p2/03-FINANCE-INTEGRATIONS-MODULE.md` (4-5h)
   - MercadoPago, MODO, AFIP WebService
   - Dependencies: Fiscal, Billing
   - minimumRole: ADMINISTRADOR

---

## 📦 PHASE 3 P3 - RESOURCES (2 modules)

**Estimated Time**: 9-11 hours

1. 🆕 **Staff** - `phase3-p3/01-STAFF-MODULE.md` (4-5h)
   - HR, employee management, attendance
   - Dependencies: None (foundation)
   - minimumRole: SUPERVISOR

2. 🆕 **Scheduling** - `phase3-p3/02-SCHEDULING-MODULE.md` (5-6h) 🔴 COMPLEX
   - Shift management, calendar, overlap detection
   - Dependencies: Staff
   - minimumRole: SUPERVISOR
   - Note: ShiftEditorModal already production-ready

---

## 📦 PHASE 3 P4 - ADVANCED FEATURES (5 modules)

**Estimated Time**: 22-25 hours

1. 🆕 **Delivery** - `phase3-p4/01-DELIVERY-MODULE.md` (5-6h) 🔴 COMPLEX
   - GPS tracking, driver assignment, zones
   - Dependencies: Sales, Staff
   - minimumRole: OPERADOR

2. 🆕 **Memberships** - `phase3-p4/02-MEMBERSHIPS-MODULE.md` (4h)
   - Subscription tiers, benefits
   - Dependencies: Customers, Billing
   - minimumRole: SUPERVISOR

3. 🆕 **Rentals** - `phase3-p4/03-RENTALS-MODULE.md` (4h)
   - Asset/equipment rental
   - Dependencies: Customers, Scheduling
   - minimumRole: SUPERVISOR

4. 🆕 **Assets** - `phase3-p4/04-ASSETS-MODULE.md` (4h)
   - Equipment management, maintenance
   - Dependencies: None (Rentals optional)
   - minimumRole: SUPERVISOR

5. 🆕 **Mobile** - `phase3-p4/05-MOBILE-MODULE.md` (5h) 🔴 COMPLEX
   - GPS tracking, route optimization
   - Dependencies: Staff, Fulfillment, Materials
   - minimumRole: OPERADOR

---

## 📦 PHASE 3 P5 - ANALYTICS & SPECIAL (4 modules)

**Estimated Time**: 17-19 hours

1. 🆕 **Reporting** - `phase3-p5/01-REPORTING-MODULE.md` (4-5h)
   - Custom reports, templates, automation
   - Dependencies: None (aggregator)
   - minimumRole: SUPERVISOR

2. 🆕 **Intelligence** - `phase3-p5/02-INTELLIGENCE-MODULE.md` (4h)
   - Market intelligence, competitor tracking
   - Dependencies: None (independent)
   - minimumRole: ADMINISTRADOR

3. 🆕 **Executive** - `phase3-p5/03-EXECUTIVE-MODULE.md` (4-5h)
   - BI dashboards, KPIs for C-level
   - Dependencies: None (aggregator)
   - minimumRole: ADMINISTRADOR

4. 🆕 **Gamification** - `phase3-p5/04-GAMIFICATION-MODULE.md` (5h) 🔴 COMPLEX
   - Achievements, progress tracking (40+ EventBus patterns)
   - Dependencies: None (listens to all)
   - minimumRole: OPERADOR
   - autoInstall: true

---

## 📊 SUMMARY

### By Priority
- **P0 (Core)**: 5 modules - 18-23h
- **P1 (Supply Chain)**: 3 modules - 11-13h (Production already done)
- **P2 (Finance)**: 3 modules - 12-15h
- **P3 (Resources)**: 2 modules - 9-11h
- **P4 (Advanced)**: 5 modules - 22-25h
- **P5 (Analytics)**: 4 modules - 17-19h

### By Complexity
- 🟢 **Simple** (4h): Products, Suppliers, Billing, Staff, Memberships, Rentals, Assets, Intelligence
- 🟡 **Medium** (4-5h): Dashboard, Customers, Fiscal, Finance-Integrations, Reporting, Executive
- 🔴 **Complex** (5-6h): Fulfillment, Supplier-Orders, Scheduling, Delivery, Mobile, Gamification

### Total Statistics
- **Total Modules in Codebase**: 27 modules
- **Total Prompts Created**: 22 modules
- **Already Production-Ready**: 3 modules (Materials, Sales, Production) ✅
- **New Prompts**: 22 modules
- **Total Estimated Time**: 86-103 hours
- **Remaining Work**: 22 modules

---

## 🚀 EXECUTION STRATEGY

### Recommended Parallel Execution

**Week 1 - P0 & P1 (Foundations)**:
```
Session 1: Dashboard (4h)
Session 2: Customers (4-5h)
Session 3: Fulfillment (5-6h)
Session 4: Products (4h)
Session 5: Suppliers (4h)
Session 6: Supplier-Orders (4-5h)
```

**Week 2 - P2 & P3 (Finance & Resources)**:
```
Session 7: Fiscal (4-5h)
Session 8: Billing (4-5h)
Session 9: Finance-Integrations (4-5h)
Session 10: Staff (4-5h)
Session 11: Scheduling (5-6h)
```

**Week 3 - P4 (Advanced)**:
```
Session 12: Delivery (5-6h)
Session 13: Memberships (4h)
Session 14: Rentals (4h)
Session 15: Assets (4h)
Session 16: Mobile (5h)
```

**Week 4 - P5 (Analytics)**:
```
Session 17: Reporting (4-5h)
Session 18: Intelligence (4h)
Session 19: Executive (4-5h)
Session 20: Gamification (5h)
```

### Parallel Execution Groups

Can be run in parallel (no dependencies):

**Group 1 (Independent)**:
- Dashboard
- Suppliers
- Staff
- Intelligence

**Group 2 (After Group 1)**:
- Customers (needs Dashboard for widgets)
- Products (needs Materials)
- Scheduling (needs Staff)

**Group 3 (After Sales/Customers)**:
- Fiscal (needs Sales)
- Fulfillment (needs Sales, Staff, Materials)

**Group 4 (After Finance)**:
- Billing (needs Customers)
- Finance-Integrations (needs Fiscal, Billing)

**Group 5 (After Customers/Staff)**:
- Delivery (needs Sales, Staff)
- Memberships (needs Customers, Billing)
- Rentals (needs Customers, Scheduling)

**Group 6 (Aggregators - Run last)**:
- Reporting
- Executive
- Gamification

---

## 📖 HOW TO USE

1. **Choose a module** from the list above
2. **Open the corresponding prompt** file
3. **Run in a new Claude Code window** (allows parallel execution)
4. **Follow the 5-step workflow** in each prompt
5. **Mark as complete** when all 10 criteria met

Each prompt is **self-contained** with:
- ✅ 10 production-ready criteria
- ✅ Module details (manifest, dependencies, hooks)
- ✅ 5-step workflow (Audit → Fix → Database → Integration → Validation)
- ✅ Success criteria
- ✅ Estimated time

---

**Last Updated**: 2025-02-01
**Status**: 🟢 Ready for Phase 3 Execution
