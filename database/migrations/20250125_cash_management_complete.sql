-- ============================================
-- CASH MANAGEMENT SYSTEM - COMPLETE MIGRATION
-- ============================================
-- Version: 1.0.0
-- Date: 2025-01-25
-- BREAKING CHANGES: YES - Eliminates legacy payment_methods table
-- Rollback Script: Available in docs/cash/07-MIGRATION-SCRIPT.md
-- ============================================

BEGIN;

-- ============================================
-- 1. CHART OF ACCOUNTS (Plan de Cuentas)
-- ============================================

CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Jerarquía
  parent_id UUID REFERENCES public.chart_of_accounts(id),

  -- Identificación
  code VARCHAR(20) UNIQUE NOT NULL,
  name TEXT NOT NULL,

  -- Clasificación
  account_type TEXT NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE')),
  sub_type TEXT,

  -- Comportamiento
  is_group BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Control de transacciones
  normal_balance TEXT NOT NULL CHECK (normal_balance IN ('DEBIT', 'CREDIT')),
  allow_transactions BOOLEAN DEFAULT true,

  -- Metadata
  description TEXT,
  currency TEXT DEFAULT 'ARS',
  location_id UUID REFERENCES public.locations(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT chk_group_no_transactions CHECK (
    (is_group = false) OR (is_group = true AND allow_transactions = false)
  )
);

-- Índices para chart_of_accounts
CREATE INDEX IF NOT EXISTS idx_coa_parent ON public.chart_of_accounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_coa_type ON public.chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_coa_code ON public.chart_of_accounts(code);
CREATE INDEX IF NOT EXISTS idx_coa_active ON public.chart_of_accounts(is_active) WHERE is_active = true;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_chart_of_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chart_of_accounts_updated_at ON public.chart_of_accounts;
CREATE TRIGGER trigger_update_chart_of_accounts_updated_at
  BEFORE UPDATE ON public.chart_of_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_chart_of_accounts_updated_at();

-- ============================================
-- 2. MONEY LOCATIONS (Cajas, Bancos, etc.)
-- ============================================

CREATE TABLE IF NOT EXISTS public.money_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vinculación al catálogo
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),

  -- Identificación
  name TEXT NOT NULL,
  code VARCHAR(20) UNIQUE,

  -- Tipo específico
  location_type TEXT NOT NULL CHECK (location_type IN (
    'CASH_DRAWER',
    'SAFE',
    'BANK_ACCOUNT',
    'DIGITAL_WALLET',
    'PETTY_CASH'
  )),

  -- Configuración operativa
  requires_session BOOLEAN DEFAULT false,
  default_float NUMERIC(12,2),
  max_cash_limit NUMERIC(12,2),

  -- Responsabilidad
  responsible_user_id UUID REFERENCES auth.users(id),
  location_id UUID REFERENCES public.locations(id),

  -- Estado
  current_balance NUMERIC(15,4) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  description TEXT,
  external_account_number TEXT,
  api_credentials JSONB,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Índices para money_locations
CREATE INDEX IF NOT EXISTS idx_money_locations_account ON public.money_locations(account_id);
CREATE INDEX IF NOT EXISTS idx_money_locations_type ON public.money_locations(location_type);
CREATE INDEX IF NOT EXISTS idx_money_locations_location ON public.money_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_money_locations_responsible ON public.money_locations(responsible_user_id);
CREATE INDEX IF NOT EXISTS idx_money_locations_active ON public.money_locations(is_active) WHERE is_active = true;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_money_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_money_locations_updated_at ON public.money_locations;
CREATE TRIGGER trigger_update_money_locations_updated_at
  BEFORE UPDATE ON public.money_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_money_locations_updated_at();

-- ============================================
-- 3. CASH SESSIONS (Sesiones de Caja)
-- ============================================

CREATE TABLE IF NOT EXISTS public.cash_sessions (
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
  starting_cash NUMERIC(15,4) NOT NULL,
  cash_sales NUMERIC(15,4) DEFAULT 0,
  cash_refunds NUMERIC(15,4) DEFAULT 0,
  cash_in NUMERIC(15,4) DEFAULT 0,
  cash_out NUMERIC(15,4) DEFAULT 0,
  cash_drops NUMERIC(15,4) DEFAULT 0,
  expected_cash NUMERIC(15,4),
  actual_cash NUMERIC(15,4),
  variance NUMERIC(15,4),

  -- Estado
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'AUDITED', 'DISCREPANCY')),

  -- Notas
  opening_notes TEXT,
  closing_notes TEXT,
  audit_notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para cash_sessions
CREATE INDEX IF NOT EXISTS idx_cash_sessions_money_location ON public.cash_sessions(money_location_id);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_opened_by ON public.cash_sessions(opened_by);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_status ON public.cash_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_opened_at ON public.cash_sessions(opened_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cash_sessions_unique_open ON public.cash_sessions(money_location_id)
  WHERE status = 'OPEN';

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_cash_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cash_sessions_updated_at ON public.cash_sessions;
CREATE TRIGGER trigger_update_cash_sessions_updated_at
  BEFORE UPDATE ON public.cash_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_cash_sessions_updated_at();

-- ============================================
-- 4. JOURNAL ENTRIES (Transacciones Contables)
-- ============================================

CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  entry_number VARCHAR(50) UNIQUE,

  -- Clasificación
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'SALE', 'PURCHASE', 'PAYMENT', 'RECEIPT', 'TRANSFER',
    'ADJUSTMENT', 'PAYROLL', 'EXPENSE', 'CASH_DROP',
    'DEPOSIT', 'OPENING', 'CLOSING'
  )),

  -- Fecha
  transaction_date DATE NOT NULL,
  posting_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Referencias
  reference_id UUID,
  reference_type TEXT,
  external_reference TEXT,

  -- Metadata
  description TEXT,
  notes TEXT,
  location_id UUID REFERENCES public.locations(id),
  cash_session_id UUID REFERENCES public.cash_sessions(id),

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_posted BOOLEAN DEFAULT false,
  posted_at TIMESTAMPTZ,

  -- CONSTRAINT: Inmutabilidad después de posted
  CONSTRAINT chk_immutable CHECK (is_posted = false OR (is_posted = true AND posted_at IS NOT NULL))
);

-- Índices para journal_entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(transaction_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_type ON public.journal_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON public.journal_entries(reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_session ON public.journal_entries(cash_session_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_posted ON public.journal_entries(is_posted) WHERE is_posted = true;

-- ============================================
-- 5. JOURNAL LINES (Líneas de Transacción)
-- ============================================

CREATE TABLE IF NOT EXISTS public.journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vinculación
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  money_location_id UUID REFERENCES public.money_locations(id),

  -- Monto (positivo = Crédito, negativo = Débito)
  amount NUMERIC(15,4) NOT NULL,

  -- Metadata
  description TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- CONSTRAINT: No permitir $0 en líneas
  CONSTRAINT chk_amount_non_zero CHECK (amount != 0)
);

-- Índices para journal_lines
CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON public.journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON public.journal_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_money_location ON public.journal_lines(money_location_id);

-- ============================================
-- 6. MONEY MOVEMENTS (Log de Movimientos)
-- ============================================

CREATE TABLE IF NOT EXISTS public.money_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vinculación
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id),
  money_location_id UUID NOT NULL REFERENCES public.money_locations(id),
  cash_session_id UUID REFERENCES public.cash_sessions(id),

  -- Movimiento
  movement_type TEXT NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER_IN', 'TRANSFER_OUT')),
  amount NUMERIC(15,4) NOT NULL,
  running_balance NUMERIC(15,4),

  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices para money_movements
CREATE INDEX IF NOT EXISTS idx_money_movements_location ON public.money_movements(money_location_id);
CREATE INDEX IF NOT EXISTS idx_money_movements_session ON public.money_movements(cash_session_id);
CREATE INDEX IF NOT EXISTS idx_money_movements_created_at ON public.money_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_money_movements_type ON public.money_movements(movement_type);

-- ============================================
-- 7. SALE PAYMENTS (Nueva tabla limpia)
-- ============================================

CREATE TABLE IF NOT EXISTS public.sale_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id),
  amount NUMERIC(15,4) NOT NULL,
  payment_type TEXT NOT NULL, -- 'CASH', 'CARD', 'TRANSFER', 'QR'
  metadata JSONB, -- terminal_id, card_brand, etc. si es necesario
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para sale_payments
CREATE INDEX IF NOT EXISTS idx_sale_payments_sale ON public.sale_payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_payments_journal ON public.sale_payments(journal_entry_id);

-- ============================================
-- TRIGGERS: Validación de Balance
-- ============================================

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

DROP TRIGGER IF EXISTS trigger_validate_journal_balance ON public.journal_entries;
CREATE TRIGGER trigger_validate_journal_balance
BEFORE UPDATE OF is_posted ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION check_journal_balance();

-- ============================================
-- DATOS INICIALES: Plan de Cuentas (Argentina)
-- ============================================

-- ACTIVOS
INSERT INTO public.chart_of_accounts (code, name, account_type, sub_type, is_group, normal_balance, allow_transactions) VALUES
('1', 'Activos', 'ASSET', 'ROOT', true, 'DEBIT', false),
('1.1', 'Activos Corrientes', 'ASSET', 'GROUP', true, 'DEBIT', false),
('1.1.01', 'Efectivo y Equivalentes', 'ASSET', 'GROUP', true, 'DEBIT', false),
('1.1.01.001', 'Caja Registradora - Principal', 'ASSET', 'CASH_DRAWER', false, 'DEBIT', true),
('1.1.01.002', 'Caja Fuerte - Principal', 'ASSET', 'SAFE', false, 'DEBIT', true),
('1.1.01.003', 'Banco Galicia - Cta. Corriente', 'ASSET', 'BANK_ACCOUNT', false, 'DEBIT', true),
('1.1.02', 'Cuentas por Cobrar', 'ASSET', 'RECEIVABLES', false, 'DEBIT', true)
ON CONFLICT (code) DO NOTHING;

-- PASIVOS
INSERT INTO public.chart_of_accounts (code, name, account_type, sub_type, is_group, normal_balance, allow_transactions) VALUES
('2', 'Pasivos', 'LIABILITY', 'ROOT', true, 'CREDIT', false),
('2.1', 'Pasivos Corrientes', 'LIABILITY', 'GROUP', true, 'CREDIT', false),
('2.1.01', 'Cuentas por Pagar', 'LIABILITY', 'PAYABLES', false, 'CREDIT', true),
('2.1.02', 'IVA a Pagar', 'LIABILITY', 'TAX_PAYABLE', false, 'CREDIT', true)
ON CONFLICT (code) DO NOTHING;

-- PATRIMONIO
INSERT INTO public.chart_of_accounts (code, name, account_type, sub_type, is_group, normal_balance, allow_transactions) VALUES
('3', 'Patrimonio Neto', 'EQUITY', 'ROOT', true, 'CREDIT', false),
('3.1', 'Capital', 'EQUITY', 'CAPITAL', false, 'CREDIT', true)
ON CONFLICT (code) DO NOTHING;

-- INGRESOS
INSERT INTO public.chart_of_accounts (code, name, account_type, sub_type, is_group, normal_balance, allow_transactions) VALUES
('4', 'Ingresos', 'INCOME', 'ROOT', true, 'CREDIT', false),
('4.1', 'Ingresos por Ventas', 'INCOME', 'REVENUE', false, 'CREDIT', true),
('4.2', 'Otros Ingresos', 'INCOME', 'OTHER_INCOME', false, 'CREDIT', true)
ON CONFLICT (code) DO NOTHING;

-- GASTOS
INSERT INTO public.chart_of_accounts (code, name, account_type, sub_type, is_group, normal_balance, allow_transactions) VALUES
('5', 'Gastos', 'EXPENSE', 'ROOT', true, 'DEBIT', false),
('5.1', 'Costo de Ventas', 'EXPENSE', 'COGS', false, 'DEBIT', true),
('5.2', 'Gastos de Personal', 'EXPENSE', 'PAYROLL', false, 'DEBIT', true),
('5.3', 'Gastos Operativos', 'EXPENSE', 'OPERATING', false, 'DEBIT', true),
('5.9', 'Diferencias de Caja', 'EXPENSE', 'CASH_VARIANCE', false, 'DEBIT', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- DATOS INICIALES: Money Locations
-- ============================================

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

  -- Crear money locations solo si existen las cuentas
  IF v_cash_drawer_account_id IS NOT NULL AND v_main_location_id IS NOT NULL THEN
    INSERT INTO public.money_locations (account_id, name, code, location_type, requires_session, default_float, max_cash_limit, location_id)
    VALUES (v_cash_drawer_account_id, 'Caja Registradora #1', 'DRAWER-001', 'CASH_DRAWER', true, 5000.00, 20000.00, v_main_location_id)
    ON CONFLICT (code) DO NOTHING;
  END IF;

  IF v_safe_account_id IS NOT NULL AND v_main_location_id IS NOT NULL THEN
    INSERT INTO public.money_locations (account_id, name, code, location_type, requires_session, location_id)
    VALUES (v_safe_account_id, 'Caja Fuerte - Principal', 'SAFE-001', 'SAFE', false, v_main_location_id)
    ON CONFLICT (code) DO NOTHING;
  END IF;

  IF v_bank_account_id IS NOT NULL AND v_main_location_id IS NOT NULL THEN
    INSERT INTO public.money_locations (account_id, name, code, location_type, requires_session, location_id)
    VALUES (v_bank_account_id, 'Banco Galicia - Cta. Cte.', 'BANK-001', 'BANK_ACCOUNT', false, v_main_location_id)
    ON CONFLICT (code) DO NOTHING;
  END IF;
END $$;

-- ============================================
-- MODIFICAR TABLAS EXISTENTES
-- ============================================

-- Agregar journal_entry_id a sales (si la tabla existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sales') THEN
    ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS journal_entry_id UUID REFERENCES public.journal_entries(id);
  END IF;
END $$;

-- Agregar journal_entry_id a invoices (si la tabla existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS journal_entry_id UUID REFERENCES public.journal_entries(id);
  END IF;
END $$;

-- Agregar journal_entry_id a supplier_orders (si la tabla existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'supplier_orders') THEN
    ALTER TABLE public.supplier_orders ADD COLUMN IF NOT EXISTS journal_entry_id UUID REFERENCES public.journal_entries(id);
  END IF;
END $$;

-- ============================================
-- MIGRACIÓN DE DATOS LEGACY (Opcional)
-- ============================================
-- NOTA: Esta sección está comentada porque requiere análisis de datos existentes
-- Descomentar y ajustar según sea necesario

/*
-- Renombrar tabla legacy
ALTER TABLE IF EXISTS public.payment_methods RENAME TO payment_methods_legacy;

-- Migrar datos de payment_methods_legacy a journal_entries + sale_payments
DO $$
DECLARE
  v_cash_account_id UUID;
  v_revenue_account_id UUID;
  v_tax_account_id UUID;
  v_cash_location_id UUID;
BEGIN
  -- Obtener IDs necesarios
  SELECT id INTO v_cash_account_id FROM public.chart_of_accounts WHERE code = '1.1.01.001';
  SELECT id INTO v_revenue_account_id FROM public.chart_of_accounts WHERE code = '4.1';
  SELECT id INTO v_tax_account_id FROM public.chart_of_accounts WHERE code = '2.1.02';
  SELECT id INTO v_cash_location_id FROM public.money_locations WHERE code = 'DRAWER-001';

  -- Para cada pago legacy CASH, crear journal entry
  -- (Solo efectivo en esta migración automática)

  -- Aquí iría el código de migración de datos
  -- Ver docs/cash/07-MIGRATION-SCRIPT.md para script completo

END $$;
*/

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Saldos de Cuentas
CREATE OR REPLACE VIEW account_balances AS
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

-- Vista: Saldos de Money Locations
CREATE OR REPLACE VIEW money_location_balances AS
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

-- ============================================
-- FUNCIÓN: Obtener Balance de Cuenta
-- ============================================

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

-- ============================================
-- ROW LEVEL SECURITY (Básico)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_payments ENABLE ROW LEVEL SECURITY;

-- Políticas básicas: permitir todo a usuarios autenticados
-- TODO: Refinar políticas según roles específicos

CREATE POLICY IF NOT EXISTS "Enable read access for authenticated users" ON public.chart_of_accounts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable read access for authenticated users" ON public.money_locations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON public.cash_sessions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON public.journal_entries
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON public.journal_lines
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON public.money_movements
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable all for authenticated users" ON public.sale_payments
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- COMMIT
-- ============================================

COMMIT;

-- ============================================
-- POST-MIGRATION: Verificaciones
-- ============================================

-- Verificar que todas las tablas fueron creadas
DO $$
BEGIN
  RAISE NOTICE '✅ Cash Management Migration Complete';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - chart_of_accounts: % rows', (SELECT COUNT(*) FROM public.chart_of_accounts);
  RAISE NOTICE '  - money_locations: % rows', (SELECT COUNT(*) FROM public.money_locations);
  RAISE NOTICE '  - cash_sessions: % rows', (SELECT COUNT(*) FROM public.cash_sessions);
  RAISE NOTICE '  - journal_entries: % rows', (SELECT COUNT(*) FROM public.journal_entries);
  RAISE NOTICE '  - journal_lines: % rows', (SELECT COUNT(*) FROM public.journal_lines);
  RAISE NOTICE '  - money_movements: % rows', (SELECT COUNT(*) FROM public.money_movements);
  RAISE NOTICE '  - sale_payments: % rows', (SELECT COUNT(*) FROM public.sale_payments);
  RAISE NOTICE '';
  RAISE NOTICE '📊 Next Steps:';
  RAISE NOTICE '  1. Verify data in Supabase Dashboard';
  RAISE NOTICE '  2. Run TypeScript type generation: npx supabase gen types typescript';
  RAISE NOTICE '  3. Begin Phase 1 implementation (Types, Services, UI)';
END $$;
