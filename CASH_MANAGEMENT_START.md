# 💰 CASH MANAGEMENT SYSTEM - IMPLEMENTATION START

## Contexto
Proyecto: **G-Admin Mini** - ERP multi-industria para Argentina
Arquitectura: ModuleRegistry + EventBus + DecimalUtils + Offline-First

## Documentación Completa
Ubicación: `I:\Programacion\Proyectos\g-mini\docs\cash\`

**Archivos clave:**
- `README.md` - Visión general y diagnóstico
- `QUICKSTART.md` - Demo en 2-3 días
- `01-DATABASE-SCHEMA.md` - Modelo de datos completo
- `04-MONEY-FLOWS.md` - 7 flujos con ejemplos de código
- `05-MODULE-INTEGRATION.md` - Integraciones con Sales, Staff, Fiscal, etc.
- `06-IMPLEMENTATION-PLAN.md` - Plan completo 5 fases (8-10 semanas)
- `07-MIGRATION-SCRIPT.md` - **NUEVO:** Script completo de migración (BREAKING CHANGES)

## Situación Actual
✅ **Existe:** `sales`, `payment_methods`, `shifts`, `invoices`, DecimalUtils, EventBus
❌ **Problema:** No hay "contenedores de dinero" - el dinero no está EN ningún lugar físico/virtual
❌ **Falta:** Chart of Accounts, Money Locations, Cash Sessions, Journal Entries (doble entrada)

## ⚠️ BREAKING CHANGES - ARQUITECTURA LIMPIA

**IMPORTANTE:** Este proyecto NO mantiene backward compatibility.

### Tablas que se ELIMINAN:
- ❌ `payment_methods` (legacy con campos POS específicos)

### Tablas que se CREAN:
- ✅ `chart_of_accounts` (Plan de Cuentas)
- ✅ `money_locations` (Cajas, Bancos, Safes)
- ✅ `cash_sessions` (Turnos de Caja con Arqueos)
- ✅ `journal_entries` (Transacciones Contables - Header)
- ✅ `journal_lines` (Débito/Crédito - Lines)
- ✅ `money_movements` (Log de Movimientos)
- ✅ `sale_payments` (Nueva tabla limpia - reemplaza payment_methods)

### Tablas que se MODIFICAN:
- 🔧 `sales` - Agregar `journal_entry_id`
- 🔧 `invoices` - Agregar `journal_entry_id`
- 🔧 `supplier_orders` - Agregar `journal_entry_id`

### Script de Migración:
Ver `docs/cash/07-MIGRATION-SCRIPT.md` para:
- Migración automática de datos legacy
- Conversión de payment_methods → journal_entries
- Validación de balance (doble entrada)
- Rollback plan completo

## Próxima Acción

**Opción A - Quick Start (RECOMENDADO):**
Implementar demo en 2-3 días para validar concepto antes de invertir 8-10 semanas.
- ✅ Schema mínimo (sin migración legacy)
- ✅ UI básica para probar
- ✅ Validar concepto de doble entrada

**Opción B - Implementación Completa + Migración:**
Comenzar implementación completa desde Fase 1 (2-3 semanas).
- ✅ Todas las tablas
- ✅ Migración de payment_methods
- ✅ Actualización de frontend
- ⚠️ BREAKING CHANGES aplicados

## Tu Tarea

1. **Lee** `docs/cash/QUICKSTART.md` para entender el demo
2. **Pregúntame** qué opción prefiero:
   - **A:** Quick Start (demo sin migración, validar concepto)
   - **B:** Implementación completa + migración (breaking changes)
3. **Si elijo A** → Implementa demo (schema mínimo + servicios + UI básica)
4. **Si elijo B** →
   - Ejecuta `docs/cash/07-MIGRATION-SCRIPT.md`
   - Comienza Fase 1 del `06-IMPLEMENTATION-PLAN.md`
   - Actualiza frontend para usar nuevas tablas

## Notas Importantes

- **Argentina-First:** Solo ARS, IVA 21%, AFIP compliance
- **DecimalUtils:** Siempre usar dominio 'financial' para operaciones monetarias
- **EventBus:** Comunicación async entre módulos (Sales → Cash, Staff → Cash)
- **Shifts ≠ Cash Sessions:** `shifts` = turnos empleados, `cash_sessions` = turnos de caja
- **BREAKING CHANGES:** ✅ Arquitectura limpia, eliminar legacy
- **Migration Script:** Ver `07-MIGRATION-SCRIPT.md` para detalles completos
- **Rollback Ready:** Script de rollback incluido en migración

## Arquitectura Limpia - Sin Compromisos

Este sistema está diseñado para ser **limpio y correcto** desde el inicio:

1. ✅ **Doble Entrada Estricta:** Toda transacción balancea a 0
2. ✅ **Audit Trail Inmutable:** Append-only journal entries
3. ✅ **Money Containers:** El dinero SIEMPRE está EN algún lugar
4. ✅ **Type Safety:** TypeScript estricto con DecimalUtils
5. ✅ **No Legacy Cruft:** Eliminar payment_methods, empezar limpio

**Filosofía:** Es mejor migrar una vez bien, que mantener dos sistemas en paralelo.

## Pregunta Inicial

¿Prefieres:
- **A) Quick Start** (demo 2-3 días, sin breaking changes, validar concepto)
- **B) Implementación Completa** (8-10 semanas, breaking changes, sistema limpio y definitivo)
