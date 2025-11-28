# 💰 CASH MANAGEMENT SYSTEM - G-ADMIN MINI

**Version:** 1.0.0
**Status:** 📋 Diseño Completo - Pendiente Implementación
**Context:** Sistema de Gestión de Flujo de Dinero para Argentina

---

## 📋 ÍNDICE

1. [DIAGNÓSTICO](#diagnóstico)
2. [ARQUITECTURA PROPUESTA](#arquitectura-propuesta)
3. [INTEGRACIÓN CON MÓDULOS EXISTENTES](#integración-con-módulos-existentes)
4. [MODELO DE DATOS](#modelo-de-datos)
5. [FLUJOS PRINCIPALES](#flujos-principales)
6. [PLAN DE IMPLEMENTACIÓN](#plan-de-implementación)

---

## 📊 DIAGNÓSTICO

### Situación Actual

#### ✅ Lo que SÍ existe:
- **Transacciones de Ventas**: `sales`, `sale_items`
- **Registro de Pagos**: `payment_methods` ⚠️ SERÁ REEMPLAZADO (ver migración)
- **Facturación**: `invoices`, `billing_cycles`, `subscriptions`, `payments` (se vinculará a journal_entries)
- **Compras**: `suppliers`, `supplier_orders`
- **Nómina**: `payroll_periods`
- **Turnos de Empleados**: `shifts` (employee_id, start_time, end_time, hourly_rate)
- **Precisión Financiera**: `DecimalUtils` con dominio 'financial'

#### ❌ El Problema Crítico:

**NO existe el concepto de "Contenedores de Dinero"**

Cuando un cliente paga $10,000:
- ✅ Se registra en `payment_methods.amount = 10000`
- ❌ Pero ese dinero **NO entra a ningún lugar físico/virtual**
- ❌ NO está en la "Caja Registradora"
- ❌ NO se puede hacer arqueo de caja
- ❌ NO se puede transferir a "Caja Fuerte"
- ❌ NO se puede depositar en "Banco"
- ❌ NO se puede pagar a proveedores desde una cuenta específica

**Es como tener un sistema de ventas sin un sistema bancario interno.**

### Funcionalidades Requeridas (Argentina)

**PRIORIDAD ALTA (Argentina - Contexto Real):**
- ✅ Arqueos de Caja (Cierre de Turno Ciego)
- ✅ Transferencias entre Cajas (Caja → Caja Fuerte)
- ✅ Depósitos Bancarios (Caja Fuerte → Banco)
- ✅ Pagos a Proveedores (desde Banco/Efectivo)
- ✅ Liquidación de Sueldos (desde Banco)
- ✅ Control de Fondo Fijo
- ✅ Audit Trail Inmutable (AFIP compliance)
- ✅ Reportes: Balance, Cash Flow
- ✅ Multi-Location (múltiples sucursales)

**PRIORIDAD MEDIA (Futuro):**
- ⏸️ Reconciliación Bancaria Automática
- ⏸️ Integración con MercadoPago/MODO
- ⏸️ Gastos Menores (Petty Cash)

**NO PRIORITARIO (Fuera de Scope Argentina):**
- ❌ Multi-Currency (USD, EUR) - Solo ARS por ahora
- ❌ Crypto/Blockchain
- ❌ International Wire Transfers

---

## 🏗️ ARQUITECTURA PROPUESTA

### Concepto Central: **Money Containers**

El dinero SIEMPRE debe estar EN algún lugar. Nunca flota en el vacío.

### Jerarquía de 3 Niveles

```
NIVEL 1: CHART OF ACCOUNTS (Catálogo de Cuentas)
├─ Assets (Activos)
│  ├─ Cash & Cash Equivalents
│  │  ├─ Cash Drawers (Cajas Registradoras)
│  │  ├─ Safe/Vault (Caja Fuerte)
│  │  └─ Bank Accounts (Cuentas Bancarias)
│  └─ Accounts Receivable
├─ Liabilities (Pasivos)
│  └─ Accounts Payable
├─ Equity (Patrimonio)
├─ Income (Ingresos)
│  └─ Sales Revenue
└─ Expenses (Gastos)
   ├─ COGS (Costo de Ventas)
   ├─ Payroll (Sueldos)
   └─ Operating Expenses

NIVEL 2: MONEY LOCATIONS (Instancias Físicas)
├─ Caja Registradora #1 (Sucursal Centro)
├─ Caja Fuerte (Sucursal Centro)
├─ Banco Galicia - Cta. Corriente
└─ MercadoPago Business (futuro)

NIVEL 3: CASH SESSIONS (Sesiones de Caja)
├─ Session #1523 (Drawer #1, 2025-01-15, Cajero: Juan)
│  ├─ Apertura: $5,000
│  ├─ Ventas: +$18,500
│  ├─ Retiro Parcial: -$10,000
│  ├─ Esperado: $13,500
│  └─ Real: $13,485 (Diferencia: -$15)
```

### Principios de Diseño

1. **Double-Entry Bookkeeping**: Toda transacción balancea a 0
2. **Immutable Audit Trail**: Append-only, no se puede modificar
3. **Precision-First**: Usar `DecimalUtils` con dominio 'financial'
4. **Offline-First**: Compatible con EventBus y sincronización
5. **Module Integration**: Usar ModuleRegistry, EventBus, Logger existentes

---

## 🔌 INTEGRACIÓN CON MÓDULOS EXISTENTES

### Módulos Relacionados

#### 1. **Scheduling Module** (Turnos de Empleados)
- **Relación**: Los turnos de empleados (`shifts`) son DIFERENTES a las sesiones de caja (`cash_sessions`)
- **Integración**:
  - Un empleado puede tener un turno (`shift`) activo
  - Durante su turno, puede abrir/cerrar múltiples sesiones de caja
  - `cash_sessions.opened_by` referencia a `auth.users.id`
  - Eventos: `scheduling.shift.started` → verificar si necesita abrir caja

#### 2. **Staff Module** (Empleados y Costos)
- **Relación**: Gestión de empleados, roles, costos laborales
- **Integración**:
  - Empleados con rol "Cajero" pueden abrir sesiones
  - `cash_sessions` vinculado a empleado responsable
  - Liquidación de sueldos usa `journal_entries` para registro contable
  - Eventos: `staff.payroll.processed` → crear journal entry

#### 3. **Sales Module** (Ventas y Pagos)
- **Relación**: **Principal integración** - Ventas generan movimientos de dinero
- **Integración**:
  - `payment_methods` tabla actual SE MANTIENE (compatibilidad)
  - Nueva tabla `journal_lines` registra el movimiento contable
  - Cada venta en efectivo → crea `journal_entry` + actualiza `cash_session`
  - Eventos:
    - `sales.payment.completed` → crear journal entry
    - `sales.completed` → actualizar saldo de caja

**Ejemplo: Venta en Efectivo $1,000**
```typescript
// 1. Sales Module emite evento
EventBus.emit('sales.payment.completed', {
  paymentId: 'pm-123',
  saleId: 'sale-456',
  amount: 1000,
  paymentMethod: 'CASH',
  customerId: 'cust-789',
  timestamp: new Date().toISOString()
}, 'SalesModule');

// 2. Cash Module escucha y procesa
// Handler en Cash Module:
async handleSalesPaymentCompleted(event) {
  // Crear journal entry (doble entrada)
  await createJournalEntry({
    type: 'SALE',
    referenceId: event.payload.saleId,
    lines: [
      { account: 'cash-drawer-1', amount: -1000 },  // Débito: Caja aumenta
      { account: 'sales-revenue', amount: +826.45 }, // Crédito: Ingreso
      { account: 'tax-payable', amount: +173.55 }   // Crédito: IVA
    ]
  });

  // Actualizar sesión de caja
  await updateCashSession({
    cash_sales: session.cash_sales + 1000
  });
}
```

#### 4. **Fiscal Module** (Impuestos y Facturas)
- **Relación**: Cálculo de IVA, generación de facturas
- **Integración**:
  - `taxService` calcula impuestos antes de crear journal entries
  - Facturas (`invoices`) vinculadas a journal entries
  - Eventos: `fiscal.invoice.generated` → registrar cuenta por cobrar

#### 5. **Materials Module** (Inventario)
- **Relación**: Compras a proveedores consumen dinero
- **Integración**:
  - Orden de compra aprobada → pago a proveedor → journal entry
  - `supplier_orders` vinculado a `journal_entries`
  - Eventos: `materials.purchase.approved` → preparar pago

#### 6. **Finance Modules** (Billing, Corporate, Integrations)
- **Relación**: Facturación, pagos corporativos, integraciones
- **Integración**:
  - `invoices` tabla actual vinculada a `journal_entries`
  - `payments` registra tanto en tabla actual como en journal
  - `corporate_accounts` usa journal para crédito/débito
  - MercadoPago/MODO: `money_locations` tipo 'DIGITAL_WALLET'

### EventBus Integration

**Eventos que emite Cash Module:**
```typescript
'cash.session.opened'         // Nueva sesión de caja abierta
'cash.session.closed'         // Sesión cerrada con arqueo
'cash.transfer.completed'     // Transferencia entre cuentas
'cash.deposit.recorded'       // Depósito bancario registrado
'cash.discrepancy.detected'   // Diferencia en arqueo > umbral
'cash.balance.low'            // Saldo bajo en caja
```

**Eventos que escucha Cash Module:**
```typescript
'sales.payment.completed'     // Venta procesada
'materials.purchase.paid'     // Pago a proveedor
'staff.payroll.processed'     // Liquidación de sueldos
'fiscal.tax.paid'             // Pago de impuestos
```

### Precision Integration

**Uso de DecimalUtils:**
```typescript
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// Siempre usar domain 'financial' para operaciones monetarias
const subtotal = DecimalUtils.fromValue(826.45, 'financial');
const tax = DecimalUtils.fromValue(173.55, 'financial');
const total = DecimalUtils.add(subtotal, tax, 'financial');

// Formateo
const formatted = DecimalUtils.formatCurrency(total); // "$1,000.00"

// Validación
if (!DecimalUtils.isFinanciallyValid(amount)) {
  throw new Error('Invalid amount');
}
```

---

## 📦 ARCHIVOS DE DOCUMENTACIÓN

- **[README.md](./README.md)** - Este archivo (Visión General)
- **[01-DATABASE-SCHEMA.md](./01-DATABASE-SCHEMA.md)** - Modelo de datos completo
- **[02-JOURNAL-ENTRIES.md](./02-JOURNAL-ENTRIES.md)** - Sistema de doble entrada
- **[03-CASH-SESSIONS.md](./03-CASH-SESSIONS.md)** - Sesiones de caja y arqueos
- **[04-MONEY-FLOWS.md](./04-MONEY-FLOWS.md)** - Flujos principales con ejemplos
- **[05-MODULE-INTEGRATION.md](./05-MODULE-INTEGRATION.md)** - Integración detallada
- **[06-IMPLEMENTATION-PLAN.md](./06-IMPLEMENTATION-PLAN.md)** - Plan de implementación por fases

---

## 🎯 PRÓXIMOS PASOS

1. ✅ **Completado**: Análisis de arquitectura y diseño
2. 📝 **En Progreso**: Documentación técnica detallada
3. ⏳ **Pendiente**: Validación con equipo
4. ⏳ **Pendiente**: Implementación Fase 1 (Fundamentos)

---

## 📚 REFERENCIAS

- [Toast POS Cash Management](https://doc.toasttab.com/doc/platformguide/adminCashDrawerPOSOperations.html)
- [Square Cash Drawer Sessions](https://squareup.com/help/us/en/article/8344-start-and-end-a-cash-drawer-session)
- [ERPNext Chart of Accounts](https://docs.erpnext.com/docs/user/manual/en/accounts/chart-of-accounts)
- [Double Entry Bookkeeping for Programmers](https://www.balanced.software/double-entry-bookkeeping-for-programmers/)

---

**Última actualización**: 2025-01-24
**Autor**: Architecture Team
**Revisión**: Pendiente
