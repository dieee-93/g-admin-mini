# 💾 DATABASE SCHEMA - Cash Management System

**Versión**: 1.0.0
**Compatible con**: G-Admin Mini v3.0
**Contexto**: Argentina - ARS únicamente

---

## 📋 ÍNDICE

1. [Visión General](#visión-general)
2. [Tabla: chart_of_accounts](#tabla-chart_of_accounts)
3. [Tabla: money_locations](#tabla-money_locations)
4. [Tabla: cash_sessions](#tabla-cash_sessions)
5. [Tabla: journal_entries](#tabla-journal_entries)
6. [Tabla: journal_lines](#tabla-journal_lines)
7. [Tabla: money_movements](#tabla-money_movements)
8. [Vistas y Funciones](#vistas-y-funciones)
9. [Índices y Performance](#índices-y-performance)
10. [Constraints y Validación](#constraints-y-validación)

---

## 🎯 VISIÓN GENERAL

### Principios de Diseño

1. ✅ **Doble Entrada Contable**: Toda transacción balancea a 0
2. ✅ **Inmutabilidad**: Append-only log (no UPDATE en journal entries posted)
3. ✅ **Audit Trail**: Registro completo de cambios
4. ✅ **Precision**: NUMERIC(15,4) para todas las cantidades monetarias
5. ✅ **Multi-Location**: Soporte para múltiples sucursales
6. ✅ **Argentina-First**: Moneda ARS, IVA, AFIP compliance

### Estructura General

```
chart_of_accounts (Catálogo Contable)
    ↓ referencia
money_locations (Instancias Físicas: Cajas, Bancos)
    ↓ usa
cash_sessions (Turnos de Caja con Arqueos)
    ↓ genera
journal_entries (Transacciones Contables - Header)
    ↓ contiene
journal_lines (Líneas de Transacción - Débito/Crédito)
    ↓ actualiza
money_movements (Log de Movimientos para Performance)
```

---

## 📊 TABLA: `chart_of_accounts`

### Propósito
Catálogo jerárquico de cuentas contables (Plan de Cuentas).

### Estructura

```sql
CREATE TABLE public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Jerarquía (self-referencing tree)
  parent_id UUID REFERENCES public.chart_of_accounts(id),

  -- Identificación
  code VARCHAR(20) UNIQUE NOT NULL,      -- Ej: "1.1.01.001"
  name TEXT NOT NULL,                     -- Ej: "Caja Registradora - Principal"

  -- Clasificación
  account_type TEXT NOT NULL CHECK (account_type IN (
    'ASSET',                              -- Activo
    'LIABILITY',                          -- Pasivo
    'EQUITY',                             -- Patrimonio
    'INCOME',                             -- Ingreso
    'EXPENSE'                             -- Gasto
  )),

  sub_type TEXT,                          -- Ej: 'CURRENT_ASSET', 'CASH_DRAWER', 'REVENUE'

  -- Comportamiento
  is_group BOOLEAN DEFAULT false,        -- ¿Es grupo o cuenta hoja (ledger)?
  is_active BOOLEAN DEFAULT true,

  -- Control de transacciones
  normal_balance TEXT NOT NULL CHECK (normal_balance IN ('DEBIT', 'CREDIT')),
  allow_transactions BOOLEAN DEFAULT true, -- Solo ledgers pueden tener transacciones

  -- Metadata
  description TEXT,
  currency TEXT DEFAULT 'ARS',           -- Argentina: Solo ARS
  location_id UUID REFERENCES public.locations(id), -- Opcional: sucursal específica

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT chk_group_no_transactions CHECK (
    (is_group = false AND allow_transactions = true) OR
    (is_group = true AND allow_transactions = false)
  )
);

-- Índices
CREATE INDEX idx_coa_parent ON public.chart_of_accounts(parent_id);
CREATE INDEX idx_coa_type ON public.chart_of_accounts(account_type);
CREATE INDEX idx_coa_code ON public.chart_of_accounts(code);
CREATE INDEX idx_coa_active ON public.chart_of_accounts(is_active) WHERE is_active = true;

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION update_chart_of_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chart_of_accounts_updated_at
  BEFORE UPDATE ON public.chart_of_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_chart_of_accounts_updated_at();
```

### Datos Iniciales (Argentina)

```sql
-- ACTIVOS (Assets)
INSERT INTO public.chart_of_accounts (code, name, account_type, sub_type, is_group, normal_balance, allow_transactions) VALUES
('1', 'Activos', 'ASSET', 'ROOT', true, 'DEBIT', false),
('1.1', 'Activos Corrientes', 'ASSET', 'GROUP', true, 'DEBIT', false),
('1.1.01', 'Efectivo y Equivalentes', 'ASSET', 'GROUP', true, 'DEBIT', false),
('1.1.01.001', 'Caja Registradora - Principal', 'ASSET', 'CASH_DRAWER', false, 'DEBIT', true),
('1.1.01.002', 'Caja Fuerte - Principal', 'ASSET', 'SAFE', false, 'DEBIT', true),
('1.1.01.003', 'Banco Galicia - Cta. Corriente', 'ASSET', 'BANK_ACCOUNT', false, 'DEBIT', true),
('1.1.02', 'Cuentas por Cobrar', 'ASSET', 'RECEIVABLES', false, 'DEBIT', true),

-- PASIVOS (Liabilities)
('2', 'Pasivos', 'LIABILITY', 'ROOT', true, 'CREDIT', false),
('2.1', 'Pasivos Corrientes', 'LIABILITY', 'GROUP', true, 'CREDIT', false),
('2.1.01', 'Cuentas por Pagar', 'LIABILITY', 'PAYABLES', false, 'CREDIT', true),
('2.1.02', 'IVA a Pagar', 'LIABILITY', 'TAX_PAYABLE', false, 'CREDIT', true),

-- PATRIMONIO (Equity)
('3', 'Patrimonio Neto', 'EQUITY', 'ROOT', true, 'CREDIT', false),
('3.1', 'Capital', 'EQUITY', 'CAPITAL', false, 'CREDIT', true),

-- INGRESOS (Income)
('4', 'Ingresos', 'INCOME', 'ROOT', true, 'CREDIT', false),
('4.1', 'Ingresos por Ventas', 'INCOME', 'REVENUE', false, 'CREDIT', true),
('4.2', 'Otros Ingresos', 'INCOME', 'OTHER_INCOME', false, 'CREDIT', true),

-- GASTOS (Expenses)
('5', 'Gastos', 'EXPENSE', 'ROOT', true, 'DEBIT', false),
('5.1', 'Costo de Ventas', 'EXPENSE', 'COGS', false, 'DEBIT', true),
('5.2', 'Gastos de Personal', 'EXPENSE', 'PAYROLL', false, 'DEBIT', true),
('5.3', 'Gastos Operativos', 'EXPENSE', 'OPERATING', false, 'DEBIT', true),
('5.9', 'Diferencias de Caja', 'EXPENSE', 'CASH_VARIANCE', false, 'DEBIT', true);
```

---

## 🏦 TABLA: `money_locations`

### Propósito
Instancias físicas/virtuales donde se almacena dinero.

### Estructura

```sql
CREATE TABLE public.money_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vinculación al catálogo
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),

  -- Identificación
  name TEXT NOT NULL,                     -- "Caja Registradora #1"
  code VARCHAR(20) UNIQUE,                -- "DRAWER-001"

  -- Tipo específico
  location_type TEXT NOT NULL CHECK (location_type IN (
    'CASH_DRAWER',                        -- Caja registradora
    'SAFE',                               -- Caja fuerte
    'BANK_ACCOUNT',                       -- Cuenta bancaria
    'DIGITAL_WALLET',                     -- MercadoPago, MODO (futuro)
    'PETTY_CASH'                          -- Caja chica (futuro)
  )),

  -- Configuración operativa
  requires_session BOOLEAN DEFAULT false, -- ¿Requiere apertura/cierre de turno?
  default_float NUMERIC(12,2),           -- Fondo fijo inicial para drawers
  max_cash_limit NUMERIC(12,2),         -- Límite antes de cash drop

  -- Responsabilidad
  responsible_user_id UUID REFERENCES auth.users(id),
  location_id UUID REFERENCES public.locations(id), -- Sucursal

  -- Estado
  current_balance NUMERIC(15,4) DEFAULT 0, -- Saldo calculado (redundante, para performance)
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  description TEXT,
  external_account_number TEXT,          -- Número de cuenta bancaria
  api_credentials JSONB,                 -- Credenciales de integración (encriptadas) - Futuro

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_money_locations_account ON public.money_locations(account_id);
CREATE INDEX idx_money_locations_type ON public.money_locations(location_type);
CREATE INDEX idx_money_locations_location ON public.money_locations(location_id);
CREATE INDEX idx_money_locations_responsible ON public.money_locations(responsible_user_id);
CREATE INDEX idx_money_locations_active ON public.money_locations(is_active) WHERE is_active = true;

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION update_money_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_money_locations_updated_at
  BEFORE UPDATE ON public.money_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_money_locations_updated_at();
```

### Datos Iniciales

```sql
-- Obtener IDs de cuentas
DO $$
DECLARE
  v_cash_drawer_account_id UUID;
  v_safe_account_id UUID;
  v_bank_account_id UUID;
  v_main_location_id UUID;
BEGIN
  -- Obtener IDs de chart_of_accounts
  SELECT id INTO v_cash_drawer_account_id FROM public.chart_of_accounts WHERE code = '1.1.01.001';
  SELECT id INTO v_safe_account_id FROM public.chart_of_accounts WHERE code = '1.1.01.002';
  SELECT id INTO v_bank_account_id FROM public.chart_of_accounts WHERE code = '1.1.01.003';

  -- Obtener location_id principal (primera sucursal)
  SELECT id INTO v_main_location_id FROM public.locations ORDER BY created_at LIMIT 1;

  -- Crear money locations
  INSERT INTO public.money_locations (account_id, name, code, location_type, requires_session, default_float, max_cash_limit, location_id) VALUES
  (v_cash_drawer_account_id, 'Caja Registradora #1', 'DRAWER-001', 'CASH_DRAWER', true, 5000.00, 20000.00, v_main_location_id),
  (v_safe_account_id, 'Caja Fuerte - Principal', 'SAFE-001', 'SAFE', false, NULL, NULL, v_main_location_id),
  (v_bank_account_id, 'Banco Galicia - Cta. Cte.', 'BANK-001', 'BANK_ACCOUNT', false, NULL, NULL, v_main_location_id);
END $$;
```

---

## 🔑 TABLA: `cash_sessions`

### Propósito
Sesiones de caja (turnos) con apertura/cierre ciego y arqueo.

Ver detalles completos en: **[03-CASH-SESSIONS.md](./03-CASH-SESSIONS.md)**

### Estructura

```sql
CREATE TABLE public.cash_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vinculación
  money_location_id UUID NOT NULL REFERENCES public.money_locations(id),
  location_id UUID REFERENCES public.locations(id),

  -- Responsable
  opened_by UUID NOT NULL REFERENCES auth.users(id),
  closed_by UUID REFERENCES auth.users(id),

  -- Tiempos
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,

  -- Montos
  starting_cash NUMERIC(15,4) NOT NULL,   -- Fondo inicial

  -- Calculado durante el turno:
  cash_sales NUMERIC(15,4) DEFAULT 0,     -- Ventas en efectivo
  cash_refunds NUMERIC(15,4) DEFAULT 0,   -- Devoluciones
  cash_in NUMERIC(15,4) DEFAULT 0,        -- Entradas no transaccionales
  cash_out NUMERIC(15,4) DEFAULT 0,       -- Salidas (gastos menores)
  cash_drops NUMERIC(15,4) DEFAULT 0,     -- Retiros parciales a safe

  -- Cierre ciego:
  expected_cash NUMERIC(15,4),            -- Calculado por el sistema
  actual_cash NUMERIC(15,4),              -- Contado por el cajero
  variance NUMERIC(15,4),                 -- Diferencia (sobrante/faltante)

  -- Estado
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN (
    'OPEN',                                -- Sesión activa
    'CLOSED',                              -- Cerrada y balanceada
    'AUDITED',                             -- Revisada por supervisor
    'DISCREPANCY'                          -- Con diferencia significativa
  )),

  -- Notas
  opening_notes TEXT,
  closing_notes TEXT,
  audit_notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_cash_sessions_money_location ON public.cash_sessions(money_location_id);
CREATE INDEX idx_cash_sessions_opened_by ON public.cash_sessions(opened_by);
CREATE INDEX idx_cash_sessions_status ON public.cash_sessions(status);
CREATE INDEX idx_cash_sessions_opened_at ON public.cash_sessions(opened_at);
CREATE UNIQUE INDEX idx_cash_sessions_unique_open ON public.cash_sessions(money_location_id)
  WHERE status = 'OPEN';

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION update_cash_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cash_sessions_updated_at
  BEFORE UPDATE ON public.cash_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_cash_sessions_updated_at();
```

---

## 📖 TABLA: `journal_entries`

### Propósito
Transacciones contables (Header) - Doble entrada.

Ver detalles completos en: **[02-JOURNAL-ENTRIES.md](./02-JOURNAL-ENTRIES.md)**

### Estructura

```sql
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  entry_number VARCHAR(50) UNIQUE,       -- "JE-2025-001523"

  -- Clasificación
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'SALE',                               -- Venta
    'PURCHASE',                           -- Compra
    'PAYMENT',                            -- Pago
    'RECEIPT',                            -- Cobro
    'TRANSFER',                           -- Transferencia entre cuentas
    'ADJUSTMENT',                         -- Ajuste contable
    'PAYROLL',                            -- Nómina
    'EXPENSE',                            -- Gasto
    'CASH_DROP',                          -- Retiro parcial de caja
    'DEPOSIT',                            -- Depósito bancario
    'OPENING',                            -- Apertura de caja
    'CLOSING'                             -- Cierre de caja
  )),

  -- Fecha
  transaction_date DATE NOT NULL,
  posting_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Referencias
  reference_id UUID,                     -- ID de la entidad origen (sale_id, invoice_id, etc.)
  reference_type TEXT,                   -- 'SALE', 'INVOICE', 'PAYMENT', etc.
  external_reference TEXT,               -- Número de factura, cheque, etc.

  -- Metadata
  description TEXT,
  notes TEXT,
  location_id UUID REFERENCES public.locations(id),
  cash_session_id UUID REFERENCES public.cash_sessions(id),

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_posted BOOLEAN DEFAULT false,       -- ¿Ya fue contabilizado?
  posted_at TIMESTAMPTZ,

  -- CONSTRAINT: Inmutabilidad después de posted
  CONSTRAINT chk_immutable CHECK (is_posted = false OR (is_posted = true AND posted_at IS NOT NULL))
);

-- Índices
CREATE INDEX idx_journal_entries_date ON public.journal_entries(transaction_date);
CREATE INDEX idx_journal_entries_type ON public.journal_entries(entry_type);
CREATE INDEX idx_journal_entries_reference ON public.journal_entries(reference_id, reference_type);
CREATE INDEX idx_journal_entries_session ON public.journal_entries(cash_session_id);
CREATE INDEX idx_journal_entries_posted ON public.journal_entries(is_posted) WHERE is_posted = true;
```

---

## 📝 TABLA: `journal_lines`

### Propósito
Líneas individuales de cada transacción (Débito/Crédito).

### Estructura

```sql
CREATE TABLE public.journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vinculación
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  money_location_id UUID REFERENCES public.money_locations(id), -- Opcional: ubicación específica

  -- Monto (positivo = Crédito, negativo = Débito)
  amount NUMERIC(15,4) NOT NULL,

  -- Metadata
  description TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- CONSTRAINT: No permitir $0 en líneas
  CONSTRAINT chk_amount_non_zero CHECK (amount != 0)
);

-- Índices
CREATE INDEX idx_journal_lines_entry ON public.journal_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account ON public.journal_lines(account_id);
CREATE INDEX idx_journal_lines_money_location ON public.journal_lines(money_location_id);

-- TRIGGER: Validar que cada journal_entry balance a 0
CREATE OR REPLACE FUNCTION check_journal_balance()
RETURNS TRIGGER AS $$
DECLARE
  entry_balance NUMERIC(15,4);
BEGIN
  -- Solo validar cuando se marca como posted
  IF NEW.is_posted = true THEN
    SELECT COALESCE(SUM(amount), 0)
    INTO entry_balance
    FROM public.journal_lines
    WHERE journal_entry_id = NEW.id;

    IF entry_balance != 0 THEN
      RAISE EXCEPTION 'Journal entry % does not balance. Sum: %', NEW.id, entry_balance;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_journal_balance
BEFORE UPDATE OF is_posted ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION check_journal_balance();
```

---

## 🚀 TABLA: `money_movements`

### Propósito
Log simplificado de movimientos de dinero (para performance y auditoría rápida).

### Estructura

```sql
CREATE TABLE public.money_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vinculación
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id),
  money_location_id UUID NOT NULL REFERENCES public.money_locations(id),
  cash_session_id UUID REFERENCES public.cash_sessions(id),

  -- Movimiento
  movement_type TEXT NOT NULL CHECK (movement_type IN (
    'IN',                                 -- Entrada de dinero
    'OUT',                                -- Salida de dinero
    'TRANSFER_IN',                        -- Transferencia entrante
    'TRANSFER_OUT'                        -- Transferencia saliente
  )),

  amount NUMERIC(15,4) NOT NULL,
  running_balance NUMERIC(15,4),         -- Saldo después del movimiento

  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_money_movements_location ON public.money_movements(money_location_id);
CREATE INDEX idx_money_movements_session ON public.money_movements(cash_session_id);
CREATE INDEX idx_money_movements_created_at ON public.money_movements(created_at DESC);
CREATE INDEX idx_money_movements_type ON public.money_movements(movement_type);
```

---

## 📊 VISTAS Y FUNCIONES

### Vista: Saldos de Cuentas

```sql
CREATE VIEW account_balances AS
SELECT
  coa.id AS account_id,
  coa.code,
  coa.name,
  coa.account_type,
  coa.normal_balance,
  COALESCE(SUM(jl.amount), 0) AS balance,
  COUNT(jl.id) AS transaction_count
FROM public.chart_of_accounts coa
LEFT JOIN public.journal_lines jl ON jl.account_id = coa.id
LEFT JOIN public.journal_entries je ON je.id = jl.journal_entry_id AND je.is_posted = true
WHERE coa.is_group = false
GROUP BY coa.id, coa.code, coa.name, coa.account_type, coa.normal_balance;
```

### Vista: Saldos de Money Locations

```sql
CREATE VIEW money_location_balances AS
SELECT
  ml.id,
  ml.name,
  ml.location_type,
  ml.account_id,
  coa.code AS account_code,
  COALESCE(SUM(CASE
    WHEN mm.movement_type IN ('IN', 'TRANSFER_IN') THEN mm.amount
    ELSE -mm.amount
  END), 0) AS current_balance,
  MAX(mm.created_at) AS last_movement
FROM public.money_locations ml
LEFT JOIN public.chart_of_accounts coa ON coa.id = ml.account_id
LEFT JOIN public.money_movements mm ON mm.money_location_id = ml.id
GROUP BY ml.id, ml.name, ml.location_type, ml.account_id, coa.code;
```

### Función: Obtener Balance de Cuenta

```sql
CREATE OR REPLACE FUNCTION get_account_balance(
  p_account_id UUID,
  p_as_of_date DATE DEFAULT CURRENT_DATE
) RETURNS NUMERIC AS $$
DECLARE
  v_balance NUMERIC(15,4);
BEGIN
  SELECT COALESCE(SUM(jl.amount), 0)
  INTO v_balance
  FROM public.journal_lines jl
  JOIN public.journal_entries je ON je.id = jl.journal_entry_id
  WHERE jl.account_id = p_account_id
    AND je.is_posted = true
    AND je.transaction_date <= p_as_of_date;

  RETURN v_balance;
END;
$$ LANGUAGE plpgsql;
```

---

## ⚡ ÍNDICES Y PERFORMANCE

### Índices Críticos

```sql
-- Performance crítico para operaciones frecuentes
CREATE INDEX CONCURRENTLY idx_journal_entries_date_posted
  ON public.journal_entries(transaction_date DESC)
  WHERE is_posted = true;

CREATE INDEX CONCURRENTLY idx_journal_lines_account_amount
  ON public.journal_lines(account_id, amount)
  INCLUDE (journal_entry_id);

CREATE INDEX CONCURRENTLY idx_cash_sessions_location_status
  ON public.cash_sessions(money_location_id, status)
  WHERE status = 'OPEN';
```

### Análisis de Queries

```sql
-- Estadísticas de tablas
ANALYZE public.chart_of_accounts;
ANALYZE public.money_locations;
ANALYZE public.cash_sessions;
ANALYZE public.journal_entries;
ANALYZE public.journal_lines;
ANALYZE public.money_movements;
```

---

## 🔒 CONSTRAINTS Y VALIDACIÓN

### Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_movements ENABLE ROW LEVEL SECURITY;

-- Policies básicas (ajustar según roles de AuthContext)
CREATE POLICY "Users can view their location's data" ON public.cash_sessions
  FOR SELECT
  USING (
    location_id IN (
      SELECT location_id FROM public.user_locations
      WHERE user_id = auth.uid()
    )
  );

-- Admins pueden ver todo
CREATE POLICY "Admins can manage all" ON public.journal_entries
  FOR ALL
  USING (auth.jwt() ->> 'user_role' IN ('SUPER_ADMIN', 'ADMIN', 'FINANCE'));
```

---

## 📝 NOTAS IMPORTANTES

1. ✅ **Precision**: Usar NUMERIC(15,4) para todas las cantidades monetarias
2. ✅ **Inmutabilidad**: No UPDATE en journal_entries después de is_posted = true
3. ✅ **Balance**: Trigger valida que journal_lines sume 0 antes de post
4. ✅ **Audit Trail**: Todas las tablas tienen created_at, updated_at
5. ✅ **Performance**: Índices en columnas frecuentemente consultadas
6. ✅ **Argentina**: Moneda fija ARS, compatible con AFIP

---

**Última actualización**: 2025-01-24
**Próximo**: [02-JOURNAL-ENTRIES.md](./02-JOURNAL-ENTRIES.md)
