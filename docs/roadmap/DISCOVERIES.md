# Project Discoveries Index

> Collateral findings captured during work sessions.
> Brief summaries here. Detailed docs in `modules/{module}/`.
> Updated via the `roadmap-aware-work` skill.

Last updated: 2026-02-12

---

## Auth & User Management

- **Direct Chakra imports (multiple files)** — Not just Products: ProtectedRoute.tsx:2, RegisterForm.tsx:9, TeamMemberForm.tsx:16 (`Field`) all import `from '@chakra-ui/react'` → violates CLAUDE.md convention
- **User metadata inconsistency** — CreateAdminUserForm used `fullName` (camelCase), AuthContext uses `full_name` (snake_case, OAuth2 standard) → users registered via different flows have different `user_metadata` schemas
  → [analysis](modules/auth/user-metadata-naming-fix.md)
  - ✅ **FIXED:** Edge Function and Form now use `full_name` (snake_case)
  - ⚠️ **PENDING:** Migration SQL script needed for existing users with `fullName`
  → [migration script](modules/auth/migrate-user-metadata.sql)
- **CreateAdminUserForm not integrated in any UI** — ✅ Logic extracted into `InviteUserModal.tsx` at `settings/pages/users/`
- **UserPermissionsSection completely MOCK** — `settings/components/UserPermissions/UserPermissionsSection.tsx` (416 lines):
  - ✅ **REPLACED:** Now a simple redirect card to `/settings/users`
- **AuthContext has debug/performance tracking code in production** — `contexts/AuthContext.tsx:130-176`:
  - `renderCountRef` logs every render via `logger.debug()`
  - `logger.warn()` on every user state change
  - `logger.error()` if renders > 20 threshold
  - Adds noise to logs and minor perf overhead in prod
- **Auth hardcoded in 7+ additional locations** (found after fixing Task #4):
  - `FulfillmentQueue.tsx:228` → `'current-user-id'`
  - `AlertsProvider.tsx:623` → `'Current User'` for resolvedBy
  - `TransferDetailsModal.tsx:62,113,144` → `'current_user'` (material transfers)
  - `appointments/page.tsx:20` → TODO customer ID from auth
  - `booking/page.tsx:57` → TODO customer ID from auth
  - All can use the new `getUserContext()` helper from `@/lib/auth/userContext`

---

## Team

- **TeamMember.role semantic confusion** — `team_members` table has `role: 'admin' | 'manager' | 'supervisor' | 'teamMember'` (system access field mixed into HR table) alongside `UserRole: 'ADMINISTRADOR' | 'SUPERVISOR' | 'OPERADOR'` in auth system → two parallel role systems with undefined relationship
  → [full architecture analysis](modules/auth/team-vs-admin-users-architecture.md)
  → [UI/UX component decisions](modules/auth/ui-architecture-user-team-management.md)
- **TeamMember.role default is `'employee'`** — `TeamMemberForm.tsx:63` defaults to `role: 'employee'` but valid types are `'admin' | 'manager' | 'supervisor' | 'teamMember'` → runtime type mismatch, TypeScript cast hides bug (`as any`)
- **TeamMember has auth fields mixed with HR fields** — `last_login`, `permissions`, `role` (security) sit alongside `hire_date`, `salary`, `cuit_cuil` (HR) in same interface → violates separation of concerns, deprecated fields needed
- **No support for employees without panel access** — Current model implies all employees have auth accounts → blocks use case of cashiers, kitchen staff who only use POS/physical terminals without panel login
- **TeamMemberForm direct Chakra import** — ✅ **FIXED:** Now imports `Field` from `@/shared/ui`
- **Nomenclature mixing in team module** — Code uses `teamMember` (variable), `employee` (variable), `TeamMember` (type), "staff" (comments), "personal" (Spanish UI) inconsistently across same files

---

## Products

- **Form handles 5 variant types** (memberships, rentals, physical, produced, services) — each needs different validation, pricing, and inventory logic. Complex configs (asset_config, rental_terms, digital_delivery, recurring_config) not persisted in productFormApi.ts
- **Import anti-pattern** — Uses `import from '@chakra-ui/react'` directly (page.tsx:20-25) instead of `@/shared/ui` → violates CLAUDE.md convention
- **Analytics with mock data** — price: 0, popularity_score: 50, sales_volume: 0, total_revenue: 0 all hardcoded → Menu Engineering Matrix non-functional
- **ProductFormModal version chaos** — Multiple versions found: ProductFormModal, ProductFormModalEnhanced, ProductFormModalNew → symptom of incomplete refactoring

---

## Sales

- **8+ TODOs in core flows** — OrdersTable component missing, Edge Functions for refund/audit not implemented, QR generation stubbed
- **Edge Functions critical gap** — Refund processing, audit logging currently don't work (references to EDGE_FUNCTIONS_TODO.md)

---

## Recipe

- **Module not integrated** — manifest.tsx setup() has "TODO: Register dashboard widgets" and "TODO: Register hooks" → Recipe exists but doesn't participate in EventBus/module ecosystem
- **RecipeBuilder incomplete** — InstructionsSection, AdvancedOptionsSection, Substitutions, AI Suggestions marked as TODO

---

## Suppliers

- **Auth hardcoded** — 4 locations in supplierOrdersApi.ts (lines 158, 241, 338, 345) → no audit trail
  → [detailed analysis](modules/auth/auth-context-audit-trail-fix.md)
  - ✅ **FIXED:** Now uses `getUserContext()` helper
- **Quality tracking missing** — Defect tracking commented (TODO: quality_score column, defect_reports table) → no supplier performance metrics

---

## Production (Kitchen)

- **EventBus disconnected** — 3 critical handlers commented in page.tsx: updateItemStatus, completeOrder, priorityChange → Kitchen Display can't update order status
- **Production manifest** — Has TODOs: create production order, update order status, open production order modal

---

## Customers

- **CRUD incomplete** — CustomerForm exists but not integrated (line 35 commented), edit/delete/reports all TODO placeholders
- **Sales integration missing** — CustomerOrdersHistory needs connection with Sales module
- **Metrics hardcoded** — CLV and RFM analysis using placeholder values

---

## Shift Control

- **Auth/data mocked** — name: 'User', role: 'staff' hardcoded in event payloads (shiftService.ts:606-607, 712-713)
  → [detailed analysis](modules/auth/auth-context-audit-trail-fix.md)
  - ✅ **FIXED:** Now uses `getUserContext()` helper
- **Transactions count hardcoded** — `transactions_count: 0`, `scheduledStaffCount: 0` → no real sales data integration

---

## Materials

- *No critical issues found during this exploration*

---

## Cross-Module Patterns

### Integration Layer Incomplete
- **EventBus commented out** — Multiple modules (Production, Recipe) have EventBus integrations commented or stubbed
- **Auth context missing** — Still hardcoded in 7+ locations beyond the 6 fixed in Task #4 (see Auth section above)
- **Mock data pervasive** — Analytics, metrics, user data frequently hardcoded across 5+ modules

### Convention Violations (Chakra imports)
- `ProtectedRoute.tsx:2` → direct Chakra import
- `RegisterForm.tsx:9` → direct Chakra import
- `TeamMemberForm.tsx:16` → direct Chakra import (`Field`)
- `products/page.tsx:20-25` → direct Chakra import (documented in roadmap Task #7)
- **All violate CLAUDE.md rule:** "NEVER use `import { Box } from '@chakra-ui/react'`"
- **Pattern:** Likely more violations exist; a full `grep` sweep is recommended

### Architectural Gaps
- **UI-first development** — All pages have complete UI (Magic Patterns v6.0) but integration layer incomplete
- **Module setup() gaps** — Recipe manifest doesn't register hooks/widgets, breaks module ecosystem pattern
- **Team vs Admin Users undefined** — Two parallel role systems, no link between employees and auth users
  → [architecture decision](modules/auth/team-vs-admin-users-architecture.md)
  → [UI decision](modules/auth/ui-architecture-user-team-management.md)
  - **DECISION:** Separate Entities + Optional Link (`auth_user_id` nullable FK on `team_members`)
  - **UI:** User Management → `settings/pages/users/` | Team stays in `resources/team/`
  - **Forms:** Modal (simple) | Wizard (employee + panel access) | Page (user list)

### Performance Notes
- **AuthContext render tracking in production** — Debug `renderCountRef` + excessive `logger.warn/error` calls on every auth state change → should be removed or behind `isDev` flag before production deploy

---

## Performance & Lazy Loading

- **Dos sistemas de lazy loading coexisten (uno es código muerto)** — App.tsx importa exclusivamente de `@/lib/lazy` (`LazyModules.ts`). El archivo `src/routes/lazyComponents.tsx` existe, exporta lazy components con `React.lazy()`, pero **App.tsx no lo importa**. Todo componente lazy nuevo debe ir en `LazyModules.ts`, no en `lazyComponents.tsx`.
  → [detalle](modules/performance/lazy-loading-dual-system.md)

- **`LazyFiscalPage` y `LazyBillingPage` comparten module key `'billing'`** — Ambos usan `'billing'` como segundo argumento de `createLazyComponent`. Si el sistema usa esa key como identificador único (caché, preloading, tracking), ambos módulos colisionan. `LazyFiscalPage` debería usar `'fiscal'`.
  → Ver: `src/lib/lazy/LazyModules.ts:150,477`

- **`LazyCustomersPage` apunta a path incorrecto en `LazyModules.ts`** — `LazyModules.ts:123` apunta a `crm/customers/page` (con subcarpeta). El path real del módulo clientes debe verificarse para confirmar cuál es el correcto.

---

## Routing & Navegación

- **Módulos de `core/` carecen de su dominio en la URL** — Las rutas de módulos core (settings, dashboard, crm) no incluyen el segmento `/core/` en la URL real del navegador — o están aplanadas directamente bajo `/admin/`. El dominio organizacional del código (`core/`, `operations/`, `resources/`, `supply-chain/`) no se refleja consistentemente en las rutas públicas. Impacto: URLs confusas para usuarios finales, inconsistencia al navegar, bookmarks incorrectos.
  → Auditar rutas en App.tsx para confirmar cuáles rutas incluyen `/core/` y cuáles no

- **Nombres de dominio de rutas son términos técnicos, no comerciales** — Los segmentos de URL actuales (`/admin/supply-chain/`, `/admin/resources/`, `/admin/core/`) son terminología de desarrollador. Para un SaaS destinado a negocios, deberían ser nombres comprensibles para el usuario final (ej: `inventario`, `equipo`, `configuracion`, `operaciones`).
  → Decisión pendiente: definir mapa de rutas públicas antes de lanzamiento

---

## Auth — Seguridad (2026-02-13)

- **`user_metadata` vs `app_metadata` — distinción de seguridad crítica** — `user_metadata` es escribible por el usuario desde el cliente (cualquiera puede auto-asignarse rol ADMINISTRADOR si los roles viven ahí). `app_metadata` solo es writable desde server (Edge Functions, service_role). Los roles y `organization_id` del JWT **deben** estar en `app_metadata`. El `full_name` y datos de display sí pueden ir en `user_metadata`.
  - Estado actual: los roles están en `users_roles` (tabla DB) — no en metadata. Correcto.
  - Riesgo: si en algún lugar del código se escribe un rol en `user_metadata`, es un bug de seguridad.
  - El `full_name` en `user_metadata` es seguro (solo afecta display).
  → [Diseño óptimo](modules/auth/user-db-architecture-optimal-design.md#91-user_metadata-vs-app_metadata)

- **Custom Access Token Hook no verificado** — Si el hook no está registrado en Supabase Dashboard (Auth → Hooks), los roles no están en el JWT y el sistema hace fallback a DB en cada request. Funciona pero añade latencia. Verificar si está activo.

---

## Auth — New Discoveries (2026-02-13)

- **DB schema clarified**: dos tablas de roles existen en paralelo:
  - `user_roles` → catálogo de roles (id, name, description, permissions, priority) — NO tiene user_id
  - `users_roles` → tabla de asignación real (user_id, role enum, is_active, assigned_by)
  - `user_roles_view` → vista que une `users_roles` + datos del empleado (employee_name, employee_email, employee_position)
  - **El enum es**: `CLIENTE | OPERADOR | SUPERVISOR | ADMINISTRADOR | SUPER_ADMIN`
  - ✅ `useUsersPage` y `InviteUserModal` corregidos para usar `users_roles` y `user_roles_view`
  - ✅ Edge Function `get-admin-users` NO necesaria — `user_roles_view` ya incluye datos del empleado
- **`user_roles_view` no incluye email de auth.users** — La vista tiene `employee_email` (del team_member) pero NO el email de `auth.users`. Usuarios sin team_member vinculado aparecen sin email en el listado. Resuelto con función RPC `get_panel_users()` (ver abajo).
- **Tabla `profiles` faltante — deuda técnica de mediano impacto** — El patrón oficial de Supabase es `public.profiles` + trigger ON INSERT en `auth.users`. Este proyecto no tiene esa tabla. La función `get_panel_users()` (SECURITY DEFINER, ya parcheada con `SET search_path = ''`) es un workaround funcional pero no el patrón canónico. La ausencia de `profiles` también impacta al futuro storefront y la app Android.
  - ✅ **Security fix aplicado:** `get_panel_users()` ya tiene `SET search_path = ''`
  - ✅ **RESOLVED:** Created `public.profiles` + triggers (INSERT + UPDATE de email) + RLS + backfill of existing users.
  - ⚠️ **Deuda pendiente:** `customers` table necesita `auth_user_id UUID UNIQUE` + `claimed_at` para el patrón de claim del storefront
  → [Diseño óptimo completo](modules/auth/user-db-architecture-optimal-design.md)
- **Setup wizard uses `full_name` (snake_case) aligned with OAuth2 standard** — ✅ **FIXED (2026-02-13)**: Migrated from `fullName` to `full_name` across all 6 files in the admin user creation flow. The setup wizard now correctly uses snake_case naming consistent with `AuthContext`, `InviteUserModal`, and the OAuth2 standard for `user_metadata.full_name`.
  → Files updated:
    - `config/constants.ts`: AdminUserData + FormErrors interfaces
    - `hooks/useAdminUserForm.ts`: State, validation, setters (29+ individual changes)
    - `components/AdminUserForm.tsx`: Props and UI bindings
    - `AdminUserCreationStep.tsx`: Parent component integration
    - `setupStore.ts`: Global state interface + test data
    - `SetupSummary.tsx`: Display component
  → Verified with `npx tsc --noEmit` (exit code 0)

---


## Recommended Investigation Areas

*These did not block the 10 roadmap tasks but may need attention later:*

1. **MercadoPago/Alertas** — Reconnection automática, status down-up, Supabase health
2. **EventBus singleton pattern** — Validate best practices, check for anti-patterns
3. **Scheduling coverage** — 7+ use cases (citas, retiros, staff shifts, producción, business hours, reminders) need review
4. **ProductFormModal versions** — Investigate which version is canonical before consolidating
5. **Full Chakra import sweep** — Run `grep -r "from '@chakra-ui/react'" src/` to find all remaining violations
