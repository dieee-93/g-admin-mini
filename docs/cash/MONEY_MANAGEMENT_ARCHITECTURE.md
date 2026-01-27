# Sistema de Manejo de Dinero - Arquitectura Completa

**Versión**: 1.0.0
**Fecha**: 27 de Diciembre, 2025
**Estado**: Design Document - Requiere aprobación antes de implementación

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Decisiones de Arquitectura](#decisiones-de-arquitectura)
3. [Flujo Operacional Completo](#flujo-operacional-completo)
4. [Schema de Base de Datos](#schema-de-base-de-datos)
5. [Casos de Uso End-to-End](#casos-de-uso-end-to-end)
6. [Audit Trail y Transparencia](#audit-trail-y-transparencia)
7. [Reconciliación](#reconciliación)
8. [Roles y Permisos](#roles-y-permisos)
9. [Plan de Implementación](#plan-de-implementación)

---

## 1. Resumen Ejecutivo

### Objetivo
Diseñar un sistema robusto, transparente y auditable para el manejo de dinero que soporte:
- Múltiples turnos (shifts) operacionales
- Múltiples cajas (cash sessions) por turno
- Múltiples métodos de pago (efectivo, tarjetas, QR, transferencias)
- Contabilidad de doble entrada
- Reconciliación automática con bancos/gateways
- Compliance fiscal para Argentina

### Principios de Diseño

1. **Transparencia Total**: Cada centavo debe ser rastreable desde la venta hasta el banco
2. **Accountability Individual**: Cada cajero es responsable de su caja
3. **Immutability**: Los registros financieros no se modifican, se revierten
4. **Double-Entry**: Toda transacción tiene débito y crédito balanceados
5. **Audit Trail**: Quién hizo qué, cuándo y por qué

---

## 2. Decisiones de Arquitectura

### 2.1 Payment Methods - Configurables en DB

**Decisión**: Los métodos de pago se configuran en base de datos, no hardcoded.

**Justificación**:
- Flexibilidad para agregar nuevos métodos sin código
- Soporte para diferentes regiones/países
- Habilitar/deshabilitar métodos por configuración

**Métodos para Argentina (Initial Seed)**:
```typescript
const PAYMENT_METHODS_ARGENTINA = [
  { code: 'CASH', name: 'Efectivo', requires_gateway: false },
  { code: 'CARD_DEBIT', name: 'Tarjeta de Débito', requires_gateway: true },
  { code: 'CARD_CREDIT', name: 'Tarjeta de Crédito', requires_gateway: true },
  { code: 'QR_MERCADOPAGO', name: 'QR Mercado Pago', requires_gateway: true },
  { code: 'QR_MODO', name: 'QR MODO', requires_gateway: true },
  { code: 'BANK_TRANSFER', name: 'Transferencia Bancaria', requires_gateway: false },
];
```

### 2.2 Fiscal - IVA Nacional, Ingresos Brutos Provincial

**Decisión**: IVA es nacional (uniforme), Ingresos Brutos es provincial (configurable por location).

**Investigación**:
- IVA: 21% (general), 10.5% (reducido), 27% (lujo) - NO varía por provincia
- Ingresos Brutos: CABA 1-8%, Buenos Aires 9%, Córdoba 9% - SÍ varía

**Implementación**:
```sql
CREATE TABLE fiscal_config_by_location (
  location_id UUID REFERENCES locations(id),
  iva_rate NUMERIC(5,4) DEFAULT 0.21,
  ingresos_brutos_rate NUMERIC(5,4),
  jurisdiction TEXT -- 'CABA', 'BUENOS_AIRES', etc.
);
```

**Sources**:
- [IVA Argentina 2025](https://calculadoriva.com/blog/iva-argentina-2025-tasas-afip)
- [Ingresos Brutos por Provincia](https://www.infobae.com/economia/2025/01/26/ranking-de-ingresos-brutos-provincia-por-provincia)

### 2.3 Cash Sessions - 1 Cajero = 1 Sesión

**Decisión**: Cada cajero tiene su propia cash session (accountability individual).

**Justificación** (basada en industry standards):
- Prevención de fraude
- Responsabilidad clara
- Facilita auditorías
- Estándar en retail y restaurants

**Configuración Flexible**:
- Permitir shared sessions vía config (para casos especiales)
- Validar que solo haya 1 sesión abierta por caja (por defecto)

**Sources**:
- [Cash Drawer Management Best Practices](https://www.poshighway.com/blog/cash-drawer-management-cycle-counts-reconcilation-activation-and-closing/)
- [Microsoft Dynamics 365 - Shift Management](https://learn.microsoft.com/en-us/dynamics365/commerce/shift-drawer-management)

### 2.4 Venta CASH sin Cash Session - BLOQUEADA

**Decisión**: No se permite recibir efectivo sin cash session abierta.

**Justificación**:
- Evita "dinero fantasma" sin accountability
- Previene fraude
- Garantiza reconciliación al final del día

**Implementación**:
- UI: Botón "CASH" deshabilitado si no hay sesión
- Backend: Validación que rechaza payment con error claro
- Otros métodos (CARD/TRANSFER/QR): NO requieren cash session

### 2.5 Shifts Obligatorios (excepto e-commerce 24/7)

**Decisión**: Todas las operaciones de tienda física requieren shift activo.

**Justificación**:
- Agregación de métricas por turno
- Reporting (ventas por turno)
- Cash sessions vinculadas a shifts

### 2.6 Tax Calculation Service - Único y Centralizado

**Decisión**: Consolidar en `src/modules/finance-fiscal/services/taxCalculationService.ts`

**Problema Encontrado**: Duplicación completa en:
- `src/modules/cash/services/taxCalculationService.ts`
- `src/modules/finance-fiscal/services/taxCalculationService.ts`

**Acción**: Eliminar duplicado, usar solo finance-fiscal como source of truth.

### 2.7 Reconciliación Bancaria - Automática (Fase 2)

**Decisión**: Implementar reconciliación en 3 fases.

**Qué implica Reconciliación**:
1. **Settlement Tracking**: Rastrear cuándo gateway deposita en cuenta bancaria
2. **Matching**: Emparejar transacciones POS con depósitos
3. **Discrepancy Detection**: Encontrar diferencias (fees, chargebacks)

**Fases**:
- **Fase 1** (MVP): Reconciliación manual con dashboard
- **Fase 2**: Automated matching con webhooks
- **Fase 3**: Bank feed integration

**Sources**:
- [Payment Reconciliation - Stripe](https://stripe.com/resources/more/payment-reconciliation-101)
- [Multi-Gateway Settlement](https://optimus.tech/blog/multi-gateway-settlement-reconciliation-simplifying-complex-payment-ecosystems)

---

## 3. Flujo Operacional Completo

### 3.1 Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────────┐
│                    INICIO DE OPERACIONES                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 1: Abrir Shift (Operational Shift)                       │
│  ─────────────────────────────────────────────────────────────  │
│  • Manager/Supervisor abre turno                               │
│  • Se registra: opened_at, opened_by, location_id              │
│  • Estado: ACTIVE                                              │
│  • Se crea registro en operational_shifts                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 2: Cajeros Abren Cash Sessions                           │
│  ─────────────────────────────────────────────────────────────  │
│  • Cajero 1 → Caja A → starting_cash: $5,000                   │
│  • Cajero 2 → Caja B → starting_cash: $5,000                   │
│  • Cajero 3 → Caja C → starting_cash: $5,000                   │
│  ─────────────────────────────────────────────────────────────  │
│  Registros en cash_sessions:                                   │
│  • money_location_id (caja física)                             │
│  • employee_id (cajero responsable)                            │
│  • shift_id (turno actual)                                     │
│  • starting_cash                                               │
│  • status: OPEN                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 3: Operaciones de Venta                                  │
│  ─────────────────────────────────────────────────────────────  │
│  Venta #1: $1,210 (IVA incluido)                               │
│  • Cliente paga: CASH ($1,210)                                 │
│  ─────────────────────────────────────────────────────────────  │
│  1. Sistema valida: ¿Hay cash session abierta? ✅              │
│  2. Se crea sale en DB                                         │
│  3. EventBus.emit('sales.payment.completed', {                 │
│      saleId, amount: 1210, paymentMethod: 'CASH'              │
│    })                                                          │
│  4. Cash Handler captura evento:                               │
│     a) Actualiza cash_sessions.cash_sales += 1210              │
│     b) Crea journal_entry (doble entrada):                     │
│        • Débito: Cash Drawer (+$1,210)                         │
│        • Crédito: Sales Revenue (+$1,000)                      │
│        • Crédito: IVA Payable (+$210)                          │
│     c) Crea sale_payment vinculando sale → journal_entry       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 3b: Venta con Múltiples Métodos de Pago (Split)          │
│  ─────────────────────────────────────────────────────────────  │
│  Venta #2: $3,025 (IVA incluido)                               │
│  • Cliente paga: CASH ($1,000) + QR_MERCADOPAGO ($2,025)       │
│  ─────────────────────────────────────────────────────────────  │
│  Para CASH ($1,000):                                           │
│  • Actualiza cash_sessions.cash_sales += 1000                  │
│  • Journal entry: Débito Cash Drawer + Crédito Revenue/Tax     │
│  ─────────────────────────────────────────────────────────────  │
│  Para QR_MERCADOPAGO ($2,025):                                 │
│  • NO afecta cash_sessions                                     │
│  • Registra en shift_payments:                                 │
│    - shift_id, payment_method: 'QR_MERCADOPAGO', amount        │
│  • Journal entry: Débito Bank Account + Crédito Revenue/Tax    │
│  • Espera webhook de MercadoPago para confirmar settlement     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 4: Cierre de Cash Session (Cajero termina turno)         │
│  ─────────────────────────────────────────────────────────────  │
│  1. Cajero cuenta dinero físico: actual_cash                   │
│  2. Sistema calcula expected_cash:                             │
│     = starting_cash + cash_sales - cash_refunds                │
│       + cash_in - cash_out - cash_drops                        │
│  3. variance = actual_cash - expected_cash                     │
│  4. Si variance != 0:                                          │
│     • Estado: DISCREPANCY                                      │
│     • Requiere aprobación de SUPERVISOR                        │
│  5. Si variance == 0 o aprobado:                               │
│     • Estado: CLOSED                                           │
│     • closed_at, closed_by registrados                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 5: Cierre de Shift (Manager cierra turno)                │
│  ─────────────────────────────────────────────────────────────  │
│  1. Todas las cash sessions deben estar cerradas               │
│  2. Sistema calcula totales del shift:                         │
│     • cash_total = SUM(cash_sessions.cash_sales)               │
│     • card_total = SUM(shift_payments WHERE method=CARD)       │
│     • qr_total = SUM(shift_payments WHERE method=QR_*)         │
│  3. Estado shift: CLOSED                                       │
│  4. Genera reporte de turno para manager                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 6: Reconciliación (Automated - Nightly)                  │
│  ─────────────────────────────────────────────────────────────  │
│  Para CASH:                                                    │
│  • Ya reconciliado al cerrar cash session                      │
│  ─────────────────────────────────────────────────────────────  │
│  Para QR/CARD (via Webhooks):                                  │
│  1. Webhook de MercadoPago notifica settlement                 │
│  2. Sistema crea payment_settlement:                           │
│     • expected_amount (suma de transacciones)                  │
│     • actual_amount (monto depositado)                         │
│     • fees_amount (comisiones del gateway)                     │
│     • net_amount (lo que realmente llega)                      │
│  3. Si expected != actual:                                     │
│     • Status: DISCREPANCY                                      │
│     • Alert a ADMINISTRADOR para revisión manual               │
│  4. Si balanced:                                               │
│     • Status: SETTLED                                          │
│     • Actualiza journal entry con fees (gasto)                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Datos - Payment Transaction

```
[POS UI]
   │
   ├─ ModernPaymentProcessor
   │    │
   │    ├─ Valida método de pago
   │    ├─ Si CASH → verifica cash session abierta
   │    └─ Emite: EventBus.emit('sales.payment.completed')
   │
   ▼
[Event Handler: salesPaymentHandler]
   │
   ├─ Determina cuenta contable según payment method
   │    • CASH → '1.1.01.001' (Cash Drawer)
   │    • CARD/QR/TRANSFER → '1.1.03.001' (Bank Account)
   │
   ├─ Si CASH:
   │    └─ recordCashSale(drawer_id, amount)
   │         └─ UPDATE cash_sessions SET cash_sales += amount
   │
   ├─ Si NO-CASH:
   │    └─ INSERT INTO shift_payments (shift_id, payment_method, amount)
   │
   ├─ Calcula impuestos (reverseTaxCalculation)
   │    └─ IVA 21%: total $1,210 → subtotal $1,000, iva $210
   │
   └─ Crea Journal Entry (doble entrada):
        │
        ├─ INSERT INTO journal_entries (entry_type: 'SALE')
        └─ INSERT INTO journal_lines:
             • Line 1: account='1.1.01.001', amount=-1210 (DÉBITO Cash)
             • Line 2: account='4.1', amount=+1000 (CRÉDITO Revenue)
             • Line 3: account='2.1.02', amount=+210 (CRÉDITO IVA)
             ✅ Balance = -1210 + 1000 + 210 = 0
```

---

## 4. Schema de Base de Datos

### 4.1 Tablas Existentes (Confirmed)

```sql
-- ✅ YA EXISTE
CREATE TABLE operational_shifts (
  id UUID PRIMARY KEY,
  location_id UUID REFERENCES locations(id),
  opened_by UUID REFERENCES auth.users(id),
  closed_by UUID REFERENCES auth.users(id),
  opened_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('ACTIVE', 'CLOSED', 'AUDITED')),

  -- Totales agregados (denormalizados para performance)
  cash_total NUMERIC(12,2) DEFAULT 0,
  card_total NUMERIC(12,2) DEFAULT 0,
  transfer_total NUMERIC(12,2) DEFAULT 0,
  qr_total NUMERIC(12,2) DEFAULT 0
);

-- ✅ YA EXISTE
CREATE TABLE money_locations (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES chart_of_accounts(id),
  name TEXT NOT NULL,
  code VARCHAR(20) UNIQUE,
  location_type TEXT CHECK (location_type IN (
    'CASH_DRAWER', 'SAFE', 'BANK_ACCOUNT', 'DIGITAL_WALLET', 'PETTY_CASH'
  )),
  requires_session BOOLEAN DEFAULT false,
  default_float NUMERIC(12,2),
  max_cash_limit NUMERIC(12,2),
  current_balance NUMERIC(15,4) DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- ✅ YA EXISTE
CREATE TABLE cash_sessions (
  id UUID PRIMARY KEY,
  money_location_id UUID NOT NULL REFERENCES money_locations(id),
  shift_id UUID REFERENCES operational_shifts(id),
  employee_id UUID REFERENCES employees(id),
  location_id UUID REFERENCES locations(id),

  opened_by UUID NOT NULL REFERENCES auth.users(id),
  closed_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),

  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,

  starting_cash NUMERIC(15,4) NOT NULL,
  cash_sales NUMERIC(15,4) DEFAULT 0,
  cash_refunds NUMERIC(15,4) DEFAULT 0,
  cash_in NUMERIC(15,4) DEFAULT 0,
  cash_out NUMERIC(15,4) DEFAULT 0,
  cash_drops NUMERIC(15,4) DEFAULT 0,
  expected_cash NUMERIC(15,4),
  actual_cash NUMERIC(15,4),
  variance NUMERIC(15,4),

  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN (
    'OPEN', 'CLOSED', 'AUDITED', 'DISCREPANCY'
  )),

  opening_notes TEXT,
  closing_notes TEXT,
  audit_notes TEXT
);

-- ✅ YA EXISTE
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY,
  entry_number VARCHAR(50) UNIQUE,
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'SALE', 'PURCHASE', 'PAYMENT', 'RECEIPT', 'TRANSFER',
    'ADJUSTMENT', 'PAYROLL', 'EXPENSE', 'CASH_DROP',
    'DEPOSIT', 'OPENING', 'CLOSING'
  )),
  transaction_date DATE NOT NULL,
  posting_date DATE NOT NULL DEFAULT CURRENT_DATE,

  reference_id UUID,
  reference_type TEXT,
  external_reference TEXT,

  description TEXT,
  notes TEXT,
  location_id UUID REFERENCES locations(id),
  cash_session_id UUID REFERENCES cash_sessions(id),

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_posted BOOLEAN DEFAULT false,
  posted_at TIMESTAMPTZ
);

-- ✅ YA EXISTE
CREATE TABLE journal_lines (
  id UUID PRIMARY KEY,
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  money_location_id UUID REFERENCES money_locations(id),

  amount NUMERIC(15,4) NOT NULL,
  description TEXT,

  CONSTRAINT chk_amount_non_zero CHECK (amount != 0)
);

-- ✅ YA EXISTE
CREATE TABLE shift_payments (
  id UUID PRIMARY KEY,
  shift_id UUID NOT NULL REFERENCES operational_shifts(id),
  sale_id UUID REFERENCES sales(id),
  employee_id UUID REFERENCES employees(id),

  payment_method TEXT NOT NULL CHECK (payment_method IN (
    'CARD', 'TRANSFER', 'QR', 'OTHER'
  )),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),

  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reference TEXT,
  notes TEXT
);
```

### 4.2 Nuevas Tablas Requeridas

```sql
-- ❌ NO EXISTE - CREAR
CREATE TABLE payment_methods_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Gateway association
  gateway_id UUID REFERENCES payment_gateways(id),

  -- Identificación
  code VARCHAR(50) UNIQUE NOT NULL,  -- 'CASH', 'CARD_DEBIT', 'QR_MERCADOPAGO'
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,

  -- Configuración
  requires_gateway BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  config JSONB,  -- Configuración específica del método

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ NO EXISTE - CREAR
CREATE TABLE payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  type TEXT NOT NULL CHECK (type IN (
    'card', 'digital_wallet', 'bank_transfer', 'qr_payment', 'cash', 'crypto', 'bnpl'
  )),
  name TEXT NOT NULL,  -- 'Mercado Pago', 'MODO', 'Stripe'
  provider TEXT,

  -- Configuración
  is_active BOOLEAN DEFAULT true,
  is_online BOOLEAN DEFAULT true,
  supports_refunds BOOLEAN DEFAULT false,
  supports_recurring BOOLEAN DEFAULT false,

  -- Credenciales (encriptadas)
  config JSONB,  -- { api_key, secret, webhook_secret, etc. }

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ NO EXISTE - CREAR
CREATE TABLE payment_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Asociación
  gateway_id UUID REFERENCES payment_gateways(id),
  shift_id UUID REFERENCES operational_shifts(id),

  -- Fechas
  settlement_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Montos
  expected_amount NUMERIC(12,2) NOT NULL,
  actual_amount NUMERIC(12,2),
  fees_amount NUMERIC(12,2) DEFAULT 0,
  chargebacks_amount NUMERIC(12,2) DEFAULT 0,
  net_amount NUMERIC(12,2),

  -- Estado
  status TEXT CHECK (status IN ('PENDING', 'SETTLED', 'FAILED', 'PARTIAL')),

  -- Detalles
  transaction_count INTEGER,
  bank_statement_ref TEXT,
  external_settlement_id TEXT,

  -- Webhook data
  webhook_payload JSONB,

  -- Reconciliación
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID REFERENCES auth.users(id),
  discrepancy_reason TEXT
);

-- ❌ NO EXISTE - CREAR
CREATE TABLE fiscal_config_by_location (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID UNIQUE REFERENCES locations(id),

  -- IVA (Nacional - raramente cambia)
  iva_general_rate NUMERIC(5,4) DEFAULT 0.21,
  iva_reducido_rate NUMERIC(5,4) DEFAULT 0.105,
  iva_lujo_rate NUMERIC(5,4) DEFAULT 0.27,

  -- Ingresos Brutos (Provincial - varía)
  ingresos_brutos_rate NUMERIC(5,4) NOT NULL,
  jurisdiction TEXT NOT NULL,  -- 'CABA', 'BUENOS_AIRES', 'CORDOBA'
  applies_ingresos_brutos BOOLEAN DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Casos de Uso End-to-End

### Caso 1: Venta Simple con Efectivo

**Actores**: Cajero (OPERADOR), Cliente
**Precondiciones**: Shift abierto, Cash session abierta

**Flujo**:

1. **Cliente compra** producto de $1,210 (IVA incluido)

2. **Cajero en POS**:
   ```typescript
   // ModernPaymentProcessor
   - Selecciona payment method: CASH
   - Sistema valida: ¿Hay cash session? ✅
   - Click "Procesar Pago"
   ```

3. **Backend procesa**:
   ```typescript
   // sales/services/saleApi.ts
   const sale = await createSale({
     items: [...],
     total: 1210,
     payment_methods: [{ type: 'CASH', amount: 1210 }]
   });

   // Emite evento
   EventBus.emit('sales.payment.completed', {
     saleId: sale.id,
     amount: 1210,
     paymentMethod: 'CASH'
   });
   ```

4. **Cash Handler reacciona**:
   ```typescript
   // cash/handlers/salesPaymentHandler.ts

   // 1. Actualizar cash session
   UPDATE cash_sessions
   SET cash_sales = cash_sales + 1210
   WHERE id = active_session.id;

   // 2. Calcular impuestos
   const { subtotal, taxAmount } = reverseTaxCalculation(1210);
   // subtotal = 1000, taxAmount = 210

   // 3. Crear journal entry
   INSERT INTO journal_entries (
     entry_type: 'SALE',
     reference_id: sale.id,
     cash_session_id: active_session.id
   );

   INSERT INTO journal_lines VALUES
     ('1.1.01.001', -1210, 'Efectivo recibido'),  -- DÉBITO Cash
     ('4.1', +1000, 'Venta de productos'),        -- CRÉDITO Revenue
     ('2.1.02', +210, 'IVA 21%');                 -- CRÉDITO IVA Payable
   ```

5. **Resultado**:
   - ✅ Venta registrada
   - ✅ Cash session actualizada
   - ✅ Contabilidad balanceada
   - ✅ Audit trail completo

---

### Caso 2: Venta con Split Payment (CASH + QR)

**Flujo**:

1. Cliente compra $3,025 total
2. Paga: $1,000 CASH + $2,025 QR_MERCADOPAGO

**Backend**:

```typescript
// Para CASH ($1,000)
UPDATE cash_sessions SET cash_sales += 1000;
INSERT INTO journal_lines VALUES
  ('1.1.01.001', -1000),  -- Cash Drawer
  ('4.1', +826),           -- Revenue
  ('2.1.02', +174);        -- IVA

// Para QR_MERCADOPAGO ($2,025)
INSERT INTO shift_payments (
  shift_id, payment_method: 'QR_MERCADOPAGO', amount: 2025
);
INSERT INTO journal_lines VALUES
  ('1.1.03.001', -2025),  -- Bank Account (pending settlement)
  ('4.1', +1674),          -- Revenue
  ('2.1.02', +351);        -- IVA
```

**Webhook Listener** (para QR):
```typescript
// Cuando MercadoPago notifica settlement
app.post('/webhooks/mercadopago', async (req) => {
  const { settlement_id, amount, fees } = req.body;

  await createSettlement({
    gateway_id: 'mercadopago',
    expected_amount: 2025,
    actual_amount: amount,
    fees_amount: fees,
    net_amount: amount - fees,
    status: 'SETTLED'
  });

  // Registrar comisión como gasto
  INSERT INTO journal_lines VALUES
    ('5.3', -fees, 'Comisión Mercado Pago'),  -- DÉBITO Expense
    ('1.1.03.001', +fees);                    -- CRÉDITO Bank Account
});
```

---

### Caso 3: Cierre de Caja con Discrepancia

**Flujo**:

1. **Cajero cierra caja**:
   ```typescript
   closeCashSession({
     sessionId,
     actual_cash: 14950  // Cuenta físicamente
   });
   ```

2. **Sistema calcula**:
   ```typescript
   expected_cash = starting_cash + cash_sales - cash_refunds + cash_in - cash_out - cash_drops
   expected_cash = 5000 + 12000 - 200 + 0 - 1800 - 0 = 15000

   variance = actual_cash - expected_cash
   variance = 14950 - 15000 = -50  // ❌ Falta $50
   ```

3. **Si variance != 0**:
   ```typescript
   UPDATE cash_sessions SET
     status = 'DISCREPANCY',
     variance = -50,
     requires_approval = true;

   // Notificar a SUPERVISOR
   EventBus.emit('cash.session.discrepancy', {
     sessionId,
     variance: -50,
     employeeId
   });
   ```

4. **Supervisor revisa y aprueba**:
   ```typescript
   approveCashSession({
     sessionId,
     approved_by: supervisor.id,
     audit_notes: 'Faltante menor, empleado de confianza'
   });

   UPDATE cash_sessions SET
     status = 'CLOSED',
     approved_by = supervisor.id;

   // Registrar faltante como expense
   INSERT INTO journal_lines VALUES
     ('5.9', -50, 'Diferencia de caja - faltante'),
     ('1.1.01.001', +50);
   ```

---

## 6. Audit Trail y Transparencia

### 6.1 Principios

1. **Immutability**: Los registros financieros NO se modifican, se revierten
2. **Who-When-Why**: Cada operación tiene usuario, timestamp y razón
3. **Event Sourcing**: Cada cambio emite evento en EventBus
4. **Journal Entries**: Toda transacción monetaria tiene journal entry

### 6.2 Rastreabilidad Completa

**Pregunta**: ¿Dónde están los $1,210 de la venta #12345?

**Respuesta** (query):
```sql
-- 1. Buscar venta
SELECT * FROM sales WHERE id = '12345';
-- → payment_method: CASH, total: 1210

-- 2. Buscar journal entry
SELECT * FROM journal_entries
WHERE reference_id = '12345' AND reference_type = 'SALE';
-- → journal_entry_id: 'abc-123'

-- 3. Ver asientos contables
SELECT
  coa.code,
  coa.name,
  jl.amount,
  jl.description
FROM journal_lines jl
JOIN chart_of_accounts coa ON coa.id = jl.account_id
WHERE jl.journal_entry_id = 'abc-123';

-- Resultado:
-- 1.1.01.001 | Cash Drawer        | -1210 | Efectivo recibido
-- 4.1        | Sales Revenue      | +1000 | Venta de productos
-- 2.1.02     | IVA a Pagar        | +210  | IVA 21%

-- 4. Ver en qué cash session fue
SELECT cs.* FROM cash_sessions cs
JOIN journal_entries je ON je.cash_session_id = cs.id
WHERE je.id = 'abc-123';
-- → Cajero: Juan Pérez, Caja: Drawer-001, Turno: Mañana

-- 5. Verificar settlement (si fue digital)
SELECT * FROM payment_settlements
WHERE shift_id = (SELECT shift_id FROM cash_sessions WHERE id = cs.id)
  AND status = 'SETTLED';
```

### 6.3 Eventos Emitidos

```typescript
// Todos los eventos relacionados con dinero
const MONEY_EVENTS = {
  // Shifts
  'shift.opened',
  'shift.closed',

  // Cash Sessions
  'cash.session.opened',
  'cash.session.closed',
  'cash.session.discrepancy',
  'cash.session.approved',

  // Payments
  'sales.payment.completed',
  'cash.payment.recorded',
  'cash.sale.recorded',
  'cash.refund.recorded',

  // Settlements
  'settlement.received',
  'settlement.matched',
  'settlement.discrepancy',

  // Journal
  'journal.entry.created',
  'journal.entry.posted',
  'journal.entry.reversed'
};
```

---

## 7. Reconciliación

### 7.1 Reconciliación de Efectivo (Inmediata)

**Cuándo**: Al cerrar cash session
**Responsable**: Cajero + Supervisor (si hay discrepancia)

**Proceso**:
1. Cajero cuenta efectivo físico
2. Sistema calcula expected_cash
3. Si variance = 0 → ✅ Balanced
4. Si variance != 0 → ⚠️ Requiere aprobación

### 7.2 Reconciliación Digital (Asíncrona)

**Cuándo**: Cuando gateway notifica settlement (webhook)
**Responsable**: Sistema automático + ADMINISTRADOR (si hay discrepancia)

**Proceso**:
```typescript
// Webhook de MercadoPago
app.post('/webhooks/mercadopago', async (req) => {
  const { type, data } = req.body;

  if (type === 'settlement') {
    // 1. Buscar transacciones esperadas del día
    const expected = await getTotalByGateway('mercadopago', data.date);

    // 2. Comparar con settlement actual
    const settlement = {
      expected_amount: expected.total,
      actual_amount: data.net_amount,
      fees_amount: data.fees,
      variance: expected.total - data.net_amount - data.fees
    };

    // 3. Si balanced
    if (settlement.variance === 0) {
      await markAsSettled(settlement);
    }
    // 4. Si hay discrepancia
    else {
      await createDiscrepancyAlert(settlement);
      await notifyAdmin('settlement.discrepancy', settlement);
    }
  }
});
```

### 7.3 Dashboard de Reconciliación

**Vista para ADMINISTRADOR**:

```
┌────────────────────────────────────────────────────────────┐
│  RECONCILIACIÓN DE PAGOS - 27/12/2025                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  EFECTIVO                                                  │
│  ✅ Turno Mañana: $45,000 (3 cajas, 0 discrepancias)      │
│  ⚠️ Turno Tarde: $52,100 (Caja B: -$50 faltante)          │
│                                                            │
│  MERCADO PAGO                                              │
│  ⏳ Esperando settlement: $127,450 (32 transacciones)      │
│  ✅ Settled 26/12: $98,200 (fees: $2,945)                 │
│                                                            │
│  MODO                                                      │
│  ✅ Settled 26/12: $45,600 (fees: $912)                   │
│                                                            │
│  TARJETAS (Terminal POS)                                   │
│  ⏳ Esperando settlement: $89,300                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 8. Roles y Permisos

### 8.1 Permisos por Rol

```typescript
const CASH_MANAGEMENT_PERMISSIONS = {
  OPERADOR: {
    // Cash Sessions
    'cash.session.open': true,
    'cash.session.close': true,
    'cash.session.view_own': true,
    'cash.session.view_others': false,

    // Payments
    'payment.process': true,
    'payment.void': false,

    // Shifts
    'shift.open': false,
    'shift.close': false,
    'shift.view': true  // Solo su turno
  },

  SUPERVISOR: {
    // Cash Sessions
    'cash.session.open': true,
    'cash.session.close': true,
    'cash.session.view_own': true,
    'cash.session.view_others': true,  // ✅ Todas del turno
    'cash.session.approve_closing': true,  // ✅ Aprueba discrepancias
    'cash.session.audit': true,

    // Payments
    'payment.process': true,
    'payment.void': true,  // ✅ Puede void

    // Shifts
    'shift.open': true,  // ✅ Abre turnos
    'shift.close': true,  // ✅ Cierra turnos
    'shift.view': true,
    'shift.reports': true
  },

  ADMINISTRADOR: {
    // Full access
    'cash.*': true,
    'payment.*': true,
    'shift.*': true,
    'reconciliation.*': true,
    'reports.*': true,

    // Plus
    'cash.session.delete': true,  // Solo para correcciones
    'payment_methods.configure': true,
    'fiscal_config.update': true
  }
};
```

---

## 9. Plan de Implementación

### FASE 1: Fundación (Semana 1)

**Prioridad**: CRÍTICA

1. **Fix bugs existentes**:
   - ✅ Arreglar import roto en `salesPaymentHandler.ts`
   - ✅ Consolidar `TaxCalculationService`

2. **Crear migrations**:
   - ✅ `payment_methods_config`
   - ✅ `payment_gateways`
   - ✅ `payment_settlements`
   - ✅ `fiscal_config_by_location`

3. **Seed data inicial**:
   - ✅ Payment methods para Argentina
   - ✅ Fiscal config por default (IVA 21%)

### FASE 2: Payment Methods Configurables (Semana 2)

1. **Backend**:
   - ✅ Ya existe: `paymentsApi.ts`
   - ✅ Crear hook: `usePaymentMethods()`
   - ✅ Integrar con `ModernPaymentProcessor`

2. **UI Admin**:
   - ✅ CRUD de payment methods en `/admin/finance-integrations`
   - ✅ Activar/desactivar métodos
   - ✅ Configurar sort order

### FASE 3: Validaciones y UX (Semana 3)

1. **Validación CASH sin session**:
   - ✅ Backend validation en payment processor
   - ✅ UI: deshabilitar botón CASH si no hay sesión
   - ✅ Botón "Abrir Caja" en POS

2. **Flujo de apertura mejorado**:
   - ✅ Wizard para abrir shift → cash session
   - ✅ Validaciones de starting_cash

### FASE 4: Reconciliación Básica (Semana 4)

1. **Dashboard de settlements**:
   - ✅ Vista de settlements pendientes
   - ✅ Matching manual
   - ✅ Alertas de discrepancias

2. **Webhooks listeners**:
   - ✅ MercadoPago webhook handler
   - ✅ MODO webhook handler (futuro)

### FASE 5: Reporting y Analytics (Semana 5)

1. **Reportes**:
   - ✅ Reporte de turno (shift summary)
   - ✅ Reporte de cajero (cashier performance)
   - ✅ Reporte de métodos de pago (payment methods breakdown)

2. **Audit tools**:
   - ✅ Transaction search
   - ✅ Journal entry viewer
   - ✅ Reconciliation history

---

## 10. Preguntas Abiertas

### Para discutir con el equipo:

1. **Multi-location**:
   - ¿Cómo manejar cajas compartidas entre locations?
   - ¿Transfers entre locations automáticos?

2. **Propinas (Tips)**:
   - ¿Las propinas van a la cash session del cajero?
   - ¿O se distribuyen al final del shift?

3. **Cash drops**:
   - ¿Automáticos cuando se llega a `max_cash_limit`?
   - ¿O siempre manuales?

4. **Backup manual**:
   - ¿Qué pasa si se cae el sistema durante el día?
   - ¿Proceso de "offline mode" → sync posterior?

---

## Apéndice: Sources y Referencias

### Legislación Fiscal Argentina
- [IVA Argentina 2025](https://calculadoriva.com/blog/iva-argentina-2025-tasas-afip)
- [Ingresos Brutos por Provincia](https://www.infobae.com/economia/2025/01/26/ranking-de-ingresos-brutos-provincia-por-provincia)
- [AFIP - Información Oficial](https://www.argentina.gob.ar/ingresosbrutos)

### Industry Standards - POS Systems
- [Cash Drawer Management Best Practices](https://www.poshighway.com/blog/cash-drawer-management-cycle-counts-reconcilation-activation-and-closing/)
- [Microsoft Dynamics 365 - Shift and Cash Drawer Management](https://learn.microsoft.com/en-us/dynamics365/commerce/shift-drawer-management)

### Payment Reconciliation
- [Payment Reconciliation 101 - Stripe](https://stripe.com/resources/more/payment-reconciliation-101)
- [Multi-Gateway Settlement Reconciliation - Optimus](https://optimus.tech/blog/multi-gateway-settlement-reconciliation-simplifying-complex-payment-ecosystems)
- [Automated Reconciliation - ACI Worldwide](https://www.aciworldwide.com/payments-reconciliation)

### Payment Gateway Integration
- [MercadoPago Webhooks Documentation](https://www.mercadopago.com.ar/developers/en/docs/wallet-connect/additional-content/your-integrations/notifications/webhooks)
- [MercadoPago Developer Tools 2025](https://www.mercadopago.com.ar/developers/en/news/2025/09/29/Mercado-Pago-MCP-Server--new-tools-for-your-IDE)

---

**Próximos Pasos**:
1. ✅ Revisar y aprobar este documento
2. ✅ Crear tickets en backlog para cada fase
3. ✅ Comenzar implementación Fase 1

**Última actualización**: 27 de Diciembre, 2025
**Autor**: Sistema de Diseño - G-Admin Mini
**Requiere aprobación de**: Tech Lead, Product Owner
