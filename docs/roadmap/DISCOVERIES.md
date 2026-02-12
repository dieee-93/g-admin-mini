# Project Discoveries Index

> Collateral findings captured during work sessions.
> Brief summaries here. Detailed docs in `modules/{module}/`.
> Updated via the `roadmap-aware-work` skill.

Last updated: 2026-02-12

---

## Products

- **Form handles 5 variant types** (memberships, rentals, physical, produced, services) — each needs different validation, pricing, and inventory logic. Complex configs (asset_config, rental_terms, digital_delivery, recurring_config) not persisted in productFormApi.ts
- **Import anti-pattern** — Uses `import from '@chakra-ui/react'` directly (page.tsx:20-25) instead of `@/shared/ui` → violates CLAUDE.md convention
- **Analytics with mock data** — price: 0, popularity_score: 50, sales_volume: 0, total_revenue: 0 all hardcoded → Menu Engineering Matrix non-functional
- **ProductFormModal version chaos** — Multiple versions found: ProductFormModal, ProductFormModalEnhanced, ProductFormModalNew → symptom of incomplete refactoring

## Sales

- **8+ TODOs in core flows** — OrdersTable component missing, Edge Functions for refund/audit not implemented, QR generation stubbed
- **Edge Functions critical gap** — Refund processing, audit logging currently don't work (references to EDGE_FUNCTIONS_TODO.md)

## Recipe

- **Module not integrated** — manifest.tsx setup() has "TODO: Register dashboard widgets" and "TODO: Register hooks" → Recipe exists but doesn't participate in EventBus/module ecosystem
- **RecipeBuilder incomplete** — InstructionsSection, AdvancedOptionsSection, Substitutions, AI Suggestions marked as TODO

## Suppliers

- **Auth hardcoded** — user_id: 'current-user' in 8 locations in supplierOrdersApi.ts → no audit trail of who creates/receives orders
- **Quality tracking missing** — Defect tracking commented (TODO: quality_score column, defect_reports table) → no supplier performance metrics

## Production (Kitchen)

- **EventBus disconnected** — 3 critical handlers commented in page.tsx: updateItemStatus, completeOrder, priorityChange → Kitchen Display can't update order status
- **Production manifest** — Has TODOs: create production order, update order status, open production order modal

## Customers

- **CRUD incomplete** — CustomerForm exists but not integrated (line 35 commented), edit/delete/reports all TODO placeholders
- **Sales integration missing** — CustomerOrdersHistory needs connection with Sales module
- **Metrics hardcoded** — CLV and RFM analysis using placeholder values

## Shift Control

- **Auth/data mocked** — name: 'User', role: 'staff' hardcoded, transactions_count: 0, scheduledStaffCount: 0 → no real auth or sales data integration

## Materials

- *No critical issues found during this exploration*

---

## Cross-Module Patterns

### Integration Layer Incomplete
- **EventBus commented out** — Multiple modules (Production, Recipe) have EventBus integrations commented or stubbed
- **Auth context missing** — Hardcoded user IDs in Suppliers, Shift Control instead of real auth context
- **Mock data pervasive** — Analytics, metrics, user data frequently hardcoded with placeholders

### Architectural Gaps
- **UI-first development** — All pages have complete UI (Magic Patterns v6.0) but integration layer incomplete
- **Module setup() gaps** — Recipe manifest doesn't register hooks/widgets, breaks module ecosystem pattern
- **Convention violations** — Direct Chakra imports in Products page violates CLAUDE.md rules

---

## Recommended Investigation Areas

*These did not block the 10 roadmap tasks but may need attention later:*

1. **MercadoPago/Alertas** — Reconnection automática, status down-up, Supabase health (mentioned by user at session start)
2. **EventBus singleton pattern** — Validate best practices, check for anti-patterns (mentioned by user at session start)
3. **Scheduling coverage** — 7+ use cases (citas, retiros, staff shifts, producción, business hours, reminders) need review (mentioned by user at session start)
4. **ProductFormModal versions** — Investigate which version is canonical before consolidating
