# 🚀 CASH & SHIFT SYSTEM - IMPLEMENTATION PROMPT

**Para usar en nueva ventana de Claude**
**Fecha**: 2025-12-10
**Contexto completo**: 3 documentos en `docs/cash/` + DB actualizada ✅

---

## 📂 DOCUMENTACIÓN

**Todos los documentos están en**: `docs/cash/`

- `FINANCE_DOMAIN_AUDIT.md` - Auditoría completa
- `CASH_OPERATIONAL_FLOWS.md` - Diseño operativo
- `CASH_FINANCIAL_SYSTEM_FINAL_PLAN.md` - Plan técnico
- `INDEX.md` - Índice de toda la documentación

---

## 📋 QUICK START

Estoy implementando el sistema integrado de Cash & Shift Control para G-Admin Mini. Necesito:

1. **Modificar handlers** para procesar todos los payment methods (CASH, CARD, TRANSFER, QR)
2. **Implementar reversiones** (cancelaciones de ventas/payroll)
3. **Agregar idempotency** (prevenir duplicados)
4. **Actualizar ShiftControlWidget** para mostrar múltiples cajas + pagos digitales
5. **Integrar employee attribution** (responsabilidad individual)

---

## 📚 DOCUMENTACIÓN COMPLETA

Lee en este orden:

### 1. FINANCE_DOMAIN_AUDIT.md (CRÍTICO)
**Ubicación**: `docs/cash/FINANCE_DOMAIN_AUDIT.md`

**Qué contiene**:
- Auditoría completa de 7 módulos Finance
- Matriz EventBus: 30+ eventos (quién emite, quién consume)
- **Gap crítico**: Solo CASH genera journal entries (línea 139-153)
- **Gap crítico**: Handlers de reversión son stubs (línea 122-136)
- Flujo actual de payment methods (línea 218-307)
- Handlers status breakdown (línea 309-329)

**Key findings**:
- `salesPaymentHandler.ts:54-59` → Solo procesa CASH, ignora CARD/TRANSFER/QR
- `handleSalesOrderCancelled:199` → TODO stub
- `handlePayrollCancelled:164` → TODO stub

---

### 2. CASH_OPERATIONAL_FLOWS.md (DISEÑO)
**Ubicación**: `docs/cash/CASH_OPERATIONAL_FLOWS.md`

**Qué contiene**:
- Investigación de Toast POS, Square, Dynamics 365, Maxirest (línea 8-150)
- **Decisión A**: Individual Accountability (1 empleado = 1 caja) - línea 24-60
- **Decisión B**: Dual-Level Tracking (CASH individual, NO-CASH shift) - línea 300-370
- **Decisión C**: Semi-Acoplado (Shift ⟷ Cash) - línea 508-650
- 5 flujos detallados con diagramas (línea 700-900)
- **UI/UX mockups** del widget actualizado (línea 930-970)

**Key designs**:
- CASH → va a `cash_sessions.employee_id` (individual)
- NO-CASH → va a `shift_payments` (nivel shift)
- Manager approval required para cerrar caja
- Arqueo del turno = suma de arqueos individuales

---

### 3. CASH_FINANCIAL_SYSTEM_FINAL_PLAN.md (IMPLEMENTACIÓN)
**Ubicación**: `docs/cash/CASH_FINANCIAL_SYSTEM_FINAL_PLAN.md`

**Qué contiene**:
- Plan técnico de implementación (línea 1-1137)
- **Phase 1 (1-2 semanas)**: Payment Reversals + Non-Cash Accounting + Idempotency (línea 184-678)
- **Phase 2 (2 semanas)**: Analytics Dashboard (línea 827-957)
- Código completo de cada feature
- Testing strategies

**Archivos a modificar**:
```
src/modules/cash/handlers/salesPaymentHandler.ts       (línea 43-188, 199-223)
src/modules/cash/handlers/payrollHandler.ts            (línea 164-190)
src/modules/cash/services/cashSessionService.ts        (agregar recordCashRefund)
src/lib/idempotency/IdempotencyService.ts              (NUEVO - línea 489-620)
src/modules/shift-control/components/ShiftControlWidget.tsx  (actualizar UI)
```

---

## 🗄️ BASE DE DATOS (YA APLICADA)

**Cambios aplicados** (2025-12-10):

```sql
✅ cash_sessions extendida:
   - employee_id UUID → Responsable individual
   - shift_id UUID → Link al turno operacional
   - approved_by UUID → Manager que aprobó cierre

✅ shift_payments (nueva tabla):
   - shift_id, sale_id, employee_id
   - payment_method ('CARD', 'TRANSFER', 'QR')
   - amount, reference

✅ operation_locks (nueva tabla):
   - id TEXT (client UUID)
   - operation_type, status, request_params, result

✅ operational_shifts extendida:
   - cash_total, card_total, transfer_total, qr_total
```

**Query la estructura con**:
```typescript
import { mcp__supabase__execute_sql } from 'supabase-mcp';
// Nunca pidas listado completo de tablas (son muchas)
```

---

## 🎯 ARQUITECTURA ACTUAL

### Módulos Existentes

```
src/modules/
├── cash/                          ✅ Core services + handlers
│   ├── services/
│   │   ├── cashSessionService.ts  ← openCashSession, closeCashSession
│   │   ├── journalService.ts      ← createJournalEntry (double-entry)
│   │   └── chartOfAccountsService.ts
│   ├── handlers/
│   │   ├── salesPaymentHandler.ts    ← 🔴 MODIFICAR (línea 54-59 solo CASH)
│   │   ├── payrollHandler.ts         ← 🔴 IMPLEMENTAR reversiones
│   │   └── materialsHandler.ts
│   └── types/
│
├── cash-management/               ⚠️ Wrapper (manifest only)
│   └── manifest.tsx
│
├── shift-control/                 ✅ Coordinación operacional
│   ├── services/shiftService.ts   ← validateCloseShift (línea 153-206)
│   ├── components/
│   │   └── ShiftControlWidget.tsx ← 🔴 ACTUALIZAR UI
│   ├── handlers/
│   │   └── cashHandlers.ts        ← Escucha cash.session.opened/closed
│   └── store/shiftStore.ts
│
└── sales/
    └── components/Payment/
        └── ModernPaymentProcessor.tsx  ← Emite sales.payment.completed
```

### EventBus Flow

```
Sales Module (ModernPaymentProcessor.tsx:273)
  ↓ emits
sales.payment.completed {
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'QR',
  amount, employeeId, saleId
}
  ↓ consumed by
Cash Module (salesPaymentHandler.ts:43)
  ├─ if CASH → recordCashSale() + journal entry
  └─ if NO-CASH → 🔴 ACTUALMENTE IGNORA (return early)
```

---

## 📝 TAREAS PHASE 1 (PRIORIDAD)

### 1.1 Payment Reversals (2-3 días)

**Archivo**: `src/modules/cash/handlers/salesPaymentHandler.ts`

**Implementar** `handleSalesOrderCancelled` (línea 199-223):
- Buscar journal entry original por `reference_id`
- Crear journal entry reverso (invertir signos)
- Llamar `recordCashRefund(moneyLocationId, amount)` (nueva función)
- Emitir `cash.refund.recorded`

**Código completo**: Ver `docs/cash/CASH_FINANCIAL_SYSTEM_FINAL_PLAN.md` línea 195-273

**Testing**: Ver línea 304-333

---

### 1.2 Non-Cash Payment Accounting (1-2 días)

**Archivo**: `src/modules/cash/handlers/salesPaymentHandler.ts`

**Modificar** `handleSalesPaymentCompleted` (línea 43-188):
- Eliminar early return (línea 54-59)
- Agregar cases para CARD/TRANSFER/QR
- Insertar en `shift_payments` table
- Crear journal entry → cuenta Bank Account (1.1.03.001)

**Código completo**: Ver `docs/cash/CASH_FINANCIAL_SYSTEM_FINAL_PLAN.md` línea 391-448

---

### 1.3 Idempotency (2-3 días)

**Archivo NUEVO**: `src/lib/idempotency/IdempotencyService.ts`

**Crear clase** `IdempotencyService`:
- `execute<T>(config: IdempotentOperation<T>)` → Wrapper con locks
- Check `operation_locks` table
- If exists + completed → return cached result
- If not exists → create lock, execute, update lock

**Código completo**: Ver `docs/cash/CASH_FINANCIAL_SYSTEM_FINAL_PLAN.md` línea 489-620

**Usar en**: `closeCashSession()` (línea 625-655)

---

### 1.4 ShiftControlWidget Update (1 día)

**Archivo**: `src/modules/shift-control/components/ShiftControlWidget.tsx`

**Cambios UI**:
- Mostrar **N cajas abiertas** (no solo 1)
- Mostrar **pagos digitales del turno** (card_total, transfer_total, qr_total)
- Mostrar **total consolidado** (cash + digital)
- Link a cada caja individual

**Mockup**: Ver `docs/cash/CASH_OPERATIONAL_FLOWS.md` línea 930-970

**Datos**:
```typescript
// Query múltiples cash sessions
const { data: sessions } = await supabase
  .from('cash_sessions')
  .select('*, employee:employees(name)')
  .eq('shift_id', currentShift.id)
  .eq('status', 'OPEN');

// Query pagos digitales
const { data: digitalPayments } = await supabase
  .from('shift_payments')
  .select('payment_method, amount')
  .eq('shift_id', currentShift.id);
```

---

## 🧪 TESTING CHECKLIST

### Unit Tests

- [ ] `handleSalesPaymentCompleted` procesa CASH ✅
- [ ] `handleSalesPaymentCompleted` procesa CARD (nuevo)
- [ ] `handleSalesOrderCancelled` reversa correctamente
- [ ] `recordCashRefund` actualiza session
- [ ] `IdempotencyService.execute` retorna cached result
- [ ] `IdempotencyService.execute` previene race conditions

### Integration Tests

- [ ] Venta CASH → journal entry + cash_sessions actualizado
- [ ] Venta CARD → journal entry + shift_payments insertado
- [ ] Cancelación → reversal journal entry + cash_refunds actualizado
- [ ] Retry de closeCashSession → no duplica (idempotency)
- [ ] Cerrar shift con cajas abiertas → blocker
- [ ] Cerrar shift después de cerrar todas las cajas → success

---

## 🚨 CONSIDERACIONES IMPORTANTES

### Arquitectura

1. **NO crear componentes de prueba** sin autorización
2. **NO correr servidores** (puerto :5173 ya está ocupado)
3. **Prefer editing existing files** to creating new ones
4. **ALWAYS use Context7** para code generation/setup/docs

### Base de Datos

1. **NO pedir listado completo de tablas** (son muchas, trunca mensaje)
2. **Query tablas específicas** con `information_schema.columns WHERE table_name = 'X'`
3. **Usar `apply_migration`** para cambios DDL, `execute_sql` para queries

### EventBus

1. **Verificar eventos existentes** antes de crear nuevos
2. **Emitir con module ID**: `EventBus.emit(event, payload, 'ModuleID')`
3. **Handlers deben ser idempotentes** (pueden ser llamados múltiples veces)

---

## 📞 NEXT STEPS

1. **Lee los 3 documentos** en `docs/cash/` en orden:
   - `FINANCE_DOMAIN_AUDIT.md` (Audit)
   - `CASH_OPERATIONAL_FLOWS.md` (Flows)
   - `CASH_FINANCIAL_SYSTEM_FINAL_PLAN.md` (Plan)
2. **Empieza con Phase 1.1** (Payment Reversals) - es blocker
3. **Continúa con 1.2** (Non-Cash Accounting) - crítico
4. **Luego 1.3** (Idempotency) - previene bugs
5. **Finaliza con 1.4** (Widget UI) - UX

---

## 🤝 COLABORACIÓN

- **Pregunta si algo no está claro** en los documentos
- **Muestra código antes de aplicar** si tenés dudas
- **Tests primero** para features críticas (TDD)
- **Comitea frecuentemente** con mensajes descriptivos

---

**Versión del Prompt**: 1.0
**Última actualización**: 2025-12-10
**Estimación total**: 6-8 días para Phase 1 completa
**Status DB**: ✅ Schema actualizado y listo
