# 🔄 MIGRATION SCRIPT - Legacy to Clean Architecture

**Versión**: 1.0.0
**BREAKING CHANGES**: ✅ Sí - Elimina tablas legacy
**Rollback**: ✅ Incluido

---

## 🎯 OBJETIVO

Migrar de arquitectura legacy (tabla `payment_methods` con campos de POS) a arquitectura limpia con doble entrada contable.

**ANTES:**
```
sales → payment_methods (con terminal_id, card_brand, etc.)
```

**DESPUÉS:**
```
sales → sale_payments → journal_entries (doble entrada limpia)
```

---

## ⚠️ BREAKING CHANGES

### Tablas que se ELIMINAN:
- `payment_methods` (antigua tabla con campos específicos de POS)

### Tablas que se CREAN:
- `chart_of_accounts`
- `money_locations`
- `cash_sessions`
- `journal_entries`
- `journal_lines`
- `money_movements`
- `sale_payments` (nueva, limpia)

### Tablas que se MODIFICAN:
- `invoices` - Agregar `journal_entry_id`
- `supplier_orders` - Agregar `journal_entry_id`
- `sales` - Agregar `journal_entry_id`

---

## 📋 PRE-MIGRATION CHECKLIST

```bash
# 1. Backup completo
pg_dump -h host -U user -d database > backup_pre_cash_migration_$(date +%Y%m%d).sql

# 2. Verificar datos existentes
psql -h host -U user -d database << EOF
SELECT COUNT(*) as total_payments FROM payment_methods;
SELECT COUNT(*) as total_sales FROM sales;
SELECT COUNT(*) as total_invoices FROM invoices;
EOF

# 3. Guardar conteos para validación post-migración
```

---

## 🚀 MIGRATION SCRIPT

### Paso 1: Crear Nuevas Tablas

```sql
-- database/migrations/20250125_cash_management_complete.sql

-- ============================================
-- NUEVAS TABLAS
-- ============================================

-- 1. Chart of Accounts
CREATE TABLE public.chart_of_accounts (
  -- Ver estructura completa en 01-DATABASE-SCHEMA.md
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.chart_of_accounts(id),
  code VARCHAR(20) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE')),
  sub_type TEXT,
  is_group BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  normal_balance TEXT NOT NULL CHECK (normal_balance IN ('DEBIT', 'CREDIT')),
  allow_transactions BOOLEAN DEFAULT true,
  description TEXT,
  currency TEXT DEFAULT 'ARS',
  location_id UUID REFERENCES public.locations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Money Locations
CREATE TABLE public.money_locations (
  -- Ver estructura completa en 01-DATABASE-SCHEMA.md
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  name TEXT NOT NULL,
  code VARCHAR(20) UNIQUE,
  location_type TEXT NOT NULL CHECK (location_type IN ('CASH_DRAWER', 'SAFE', 'BANK_ACCOUNT', 'DIGITAL_WALLET', 'PETTY_CASH')),
  requires_session BOOLEAN DEFAULT false,
  default_float NUMERIC(12,2),
  max_cash_limit NUMERIC(12,2),
  responsible_user_id UUID REFERENCES auth.users(id),
  location_id UUID REFERENCES public.locations(id),
  current_balance NUMERIC(15,4) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  external_account_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Cash Sessions
CREATE TABLE public.cash_sessions (
  -- Ver estructura completa en 01-DATABASE-SCHEMA.md
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  money_location_id UUID NOT NULL REFERENCES public.money_locations(id),
  location_id UUID REFERENCES public.locations(id),
  opened_by UUID NOT NULL REFERENCES auth.users(id),
  closed_by UUID REFERENCES auth.users(id),
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
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'AUDITED', 'DISCREPANCY')),
  opening_notes TEXT,
  closing_notes TEXT,
  audit_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Journal Entries
CREATE TABLE public.journal_entries (
  -- Ver estructura completa en 01-DATABASE-SCHEMA.md
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number VARCHAR(50) UNIQUE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('SALE', 'PURCHASE', 'PAYMENT', 'RECEIPT', 'TRANSFER', 'ADJUSTMENT', 'PAYROLL', 'EXPENSE', 'CASH_DROP', 'DEPOSIT', 'OPENING', 'CLOSING')),
  transaction_date DATE NOT NULL,
  posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_id UUID,
  reference_type TEXT,
  external_reference TEXT,
  description TEXT,
  notes TEXT,
  location_id UUID REFERENCES public.locations(id),
  cash_session_id UUID REFERENCES public.cash_sessions(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_posted BOOLEAN DEFAULT false,
  posted_at TIMESTAMPTZ
);

-- 5. Journal Lines
CREATE TABLE public.journal_lines (
  -- Ver estructura completa en 01-DATABASE-SCHEMA.md
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  money_location_id UUID REFERENCES public.money_locations(id),
  amount NUMERIC(15,4) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_amount_non_zero CHECK (amount != 0)
);

-- 6. Money Movements
CREATE TABLE public.money_movements (
  -- Ver estructura completa en 01-DATABASE-SCHEMA.md
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id),
  money_location_id UUID NOT NULL REFERENCES public.money_locations(id),
  cash_session_id UUID REFERENCES public.cash_sessions(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER_IN', 'TRANSFER_OUT')),
  amount NUMERIC(15,4) NOT NULL,
  running_balance NUMERIC(15,4),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 7. Sale Payments (NUEVA - LIMPIA)
CREATE TABLE public.sale_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id),
  amount NUMERIC(15,4) NOT NULL,
  payment_type TEXT NOT NULL, -- 'CASH', 'CARD', 'TRANSFER', 'QR'
  metadata JSONB, -- terminal_id, card_brand, etc. si es necesario
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices (ver 01-DATABASE-SCHEMA.md para lista completa)
CREATE INDEX idx_coa_parent ON public.chart_of_accounts(parent_id);
CREATE INDEX idx_money_locations_account ON public.money_locations(account_id);
CREATE INDEX idx_cash_sessions_money_location ON public.cash_sessions(money_location_id);
CREATE INDEX idx_journal_entries_date ON public.journal_entries(transaction_date);
CREATE INDEX idx_journal_lines_entry ON public.journal_lines(journal_entry_id);
CREATE INDEX idx_money_movements_location ON public.money_movements(money_location_id);
CREATE INDEX idx_sale_payments_sale ON public.sale_payments(sale_id);
CREATE INDEX idx_sale_payments_journal ON public.sale_payments(journal_entry_id);

-- Triggers
CREATE OR REPLACE FUNCTION check_journal_balance()
RETURNS TRIGGER AS $$
DECLARE
  entry_balance NUMERIC(15,4);
BEGIN
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

### Paso 2: Insertar Datos Iniciales

```sql
-- Plan de Cuentas para Argentina
INSERT INTO public.chart_of_accounts (code, name, account_type, sub_type, is_group, normal_balance, allow_transactions) VALUES
-- ACTIVOS
('1', 'Activos', 'ASSET', 'ROOT', true, 'DEBIT', false),
('1.1', 'Activos Corrientes', 'ASSET', 'GROUP', true, 'DEBIT', false),
('1.1.01', 'Efectivo y Equivalentes', 'ASSET', 'GROUP', true, 'DEBIT', false),
('1.1.01.001', 'Caja Registradora - Principal', 'ASSET', 'CASH_DRAWER', false, 'DEBIT', true),
('1.1.01.002', 'Caja Fuerte - Principal', 'ASSET', 'SAFE', false, 'DEBIT', true),
('1.1.01.003', 'Banco Galicia - Cta. Corriente', 'ASSET', 'BANK_ACCOUNT', false, 'DEBIT', true),
('1.1.02', 'Cuentas por Cobrar', 'ASSET', 'RECEIVABLES', false, 'DEBIT', true),

-- PASIVOS
('2', 'Pasivos', 'LIABILITY', 'ROOT', true, 'CREDIT', false),
('2.1', 'Pasivos Corrientes', 'LIABILITY', 'GROUP', true, 'CREDIT', false),
('2.1.01', 'Cuentas por Pagar', 'LIABILITY', 'PAYABLES', false, 'CREDIT', true),
('2.1.02', 'IVA a Pagar', 'LIABILITY', 'TAX_PAYABLE', false, 'CREDIT', true),

-- PATRIMONIO
('3', 'Patrimonio Neto', 'EQUITY', 'ROOT', true, 'CREDIT', false),
('3.1', 'Capital', 'EQUITY', 'CAPITAL', false, 'CREDIT', true),

-- INGRESOS
('4', 'Ingresos', 'INCOME', 'ROOT', true, 'CREDIT', false),
('4.1', 'Ingresos por Ventas', 'INCOME', 'REVENUE', false, 'CREDIT', true),
('4.2', 'Otros Ingresos', 'INCOME', 'OTHER_INCOME', false, 'CREDIT', true),

-- GASTOS
('5', 'Gastos', 'EXPENSE', 'ROOT', true, 'DEBIT', false),
('5.1', 'Costo de Ventas', 'EXPENSE', 'COGS', false, 'DEBIT', true),
('5.2', 'Gastos de Personal', 'EXPENSE', 'PAYROLL', false, 'DEBIT', true),
('5.3', 'Gastos Operativos', 'EXPENSE', 'OPERATING', false, 'DEBIT', true),
('5.9', 'Diferencias de Caja', 'EXPENSE', 'CASH_VARIANCE', false, 'DEBIT', true);

-- Money Locations iniciales
INSERT INTO public.money_locations (account_id, name, code, location_type, requires_session, default_float, max_cash_limit, location_id)
SELECT
  coa.id,
  'Caja Registradora #1',
  'DRAWER-001',
  'CASH_DRAWER',
  true,
  5000.00,
  20000.00,
  (SELECT id FROM public.locations ORDER BY created_at LIMIT 1)
FROM public.chart_of_accounts coa
WHERE coa.code = '1.1.01.001';

INSERT INTO public.money_locations (account_id, name, code, location_type, requires_session, location_id)
SELECT
  coa.id,
  'Caja Fuerte - Principal',
  'SAFE-001',
  'SAFE',
  false,
  (SELECT id FROM public.locations ORDER BY created_at LIMIT 1)
FROM public.chart_of_accounts coa
WHERE coa.code = '1.1.01.002';

INSERT INTO public.money_locations (account_id, name, code, location_type, requires_session, location_id)
SELECT
  coa.id,
  'Banco Galicia - Cta. Cte.',
  'BANK-001',
  'BANK_ACCOUNT',
  false,
  (SELECT id FROM public.locations ORDER BY created_at LIMIT 1)
FROM public.chart_of_accounts coa
WHERE coa.code = '1.1.01.003';
```

### Paso 3: Migrar Datos Legacy

```sql
-- ============================================
-- MIGRACIÓN DE PAYMENT_METHODS A JOURNAL_ENTRIES
-- ============================================

-- Temporal: Renombrar tabla antigua
ALTER TABLE payment_methods RENAME TO payment_methods_legacy;

-- Obtener IDs de cuentas necesarias
DO $$
DECLARE
  v_cash_account_id UUID;
  v_revenue_account_id UUID;
  v_tax_account_id UUID;
  v_cash_location_id UUID;
BEGIN
  SELECT id INTO v_cash_account_id FROM chart_of_accounts WHERE code = '1.1.01.001';
  SELECT id INTO v_revenue_account_id FROM chart_of_accounts WHERE code = '4.1';
  SELECT id INTO v_tax_account_id FROM chart_of_accounts WHERE code = '2.1.02';
  SELECT id INTO v_cash_location_id FROM money_locations WHERE code = 'DRAWER-001';

  -- Para cada pago legacy, crear journal entry
  INSERT INTO journal_entries (
    entry_number,
    entry_type,
    transaction_date,
    reference_id,
    reference_type,
    is_posted,
    posted_at,
    created_at
  )
  SELECT
    'JE-MIGRATED-' || pm.id,
    'SALE',
    pm.created_at::date,
    pm.sale_id,
    'SALE',
    true,
    pm.created_at,
    pm.created_at
  FROM payment_methods_legacy pm
  WHERE pm.type = 'CASH'; -- Solo efectivo en esta migración

  -- Crear journal_lines para cada entry
  -- Line 1: Débito Cash (aumenta caja)
  INSERT INTO journal_lines (journal_entry_id, account_id, money_location_id, amount)
  SELECT
    je.id,
    v_cash_account_id,
    v_cash_location_id,
    -pm.amount  -- Negativo = Débito
  FROM payment_methods_legacy pm
  JOIN journal_entries je ON je.reference_id = pm.sale_id AND je.entry_type = 'SALE';

  -- Line 2: Crédito Revenue (asumir 82.6% es revenue, 17.4% es IVA)
  INSERT INTO journal_lines (journal_entry_id, account_id, amount)
  SELECT
    je.id,
    v_revenue_account_id,
    pm.amount * 0.826  -- Positivo = Crédito
  FROM payment_methods_legacy pm
  JOIN journal_entries je ON je.reference_id = pm.sale_id AND je.entry_type = 'SALE';

  -- Line 3: Crédito Tax
  INSERT INTO journal_lines (journal_entry_id, account_id, amount)
  SELECT
    je.id,
    v_tax_account_id,
    pm.amount * 0.174  -- IVA 21%
  FROM payment_methods_legacy pm
  JOIN journal_entries je ON je.reference_id = pm.sale_id AND je.entry_type = 'SALE';

  -- Crear sale_payments (nueva tabla limpia)
  INSERT INTO sale_payments (sale_id, journal_entry_id, amount, payment_type, metadata)
  SELECT
    pm.sale_id,
    je.id,
    pm.amount,
    pm.type,
    jsonb_build_object(
      'terminal_id', pm.terminal_id,
      'card_brand', pm.card_brand,
      'last_four_digits', pm.last_four_digits,
      'migrated_from_legacy', true
    )
  FROM payment_methods_legacy pm
  JOIN journal_entries je ON je.reference_id = pm.sale_id AND je.entry_type = 'SALE';

  RAISE NOTICE 'Migration completed successfully';
END $$;
```

### Paso 4: Agregar Columnas a Tablas Existentes

```sql
-- Vincular sales con journal_entries
ALTER TABLE public.sales
ADD COLUMN journal_entry_id UUID REFERENCES public.journal_entries(id);

-- Vincular invoices con journal_entries
ALTER TABLE public.invoices
ADD COLUMN journal_entry_id UUID REFERENCES public.journal_entries(id);

-- Vincular supplier_orders con journal_entries
ALTER TABLE public.supplier_orders
ADD COLUMN journal_entry_id UUID REFERENCES public.journal_entries(id);

-- Actualizar sales existentes
UPDATE sales s
SET journal_entry_id = je.id
FROM journal_entries je
WHERE je.reference_id = s.id AND je.reference_type = 'SALE';
```

### Paso 5: Validación Post-Migración

```sql
-- Verificar que todos los pagos se migraron
SELECT
  (SELECT COUNT(*) FROM payment_methods_legacy) as legacy_count,
  (SELECT COUNT(*) FROM sale_payments) as new_count,
  (SELECT COUNT(*) FROM journal_entries WHERE entry_type = 'SALE') as journal_count;

-- Verificar balance de journal entries
SELECT
  je.id,
  je.entry_number,
  SUM(jl.amount) as balance
FROM journal_entries je
JOIN journal_lines jl ON jl.journal_entry_id = je.id
GROUP BY je.id, je.entry_number
HAVING SUM(jl.amount) != 0;
-- ⚠️ Este query NO debe retornar filas (todos deben balancear a 0)

-- Verificar totales
SELECT
  SUM(amount) as total_legacy
FROM payment_methods_legacy;

SELECT
  SUM(amount) as total_new
FROM sale_payments;
-- ⚠️ Ambos totales deben ser iguales
```

### Paso 6: Eliminar Tabla Legacy

```sql
-- ⚠️ SOLO EJECUTAR DESPUÉS DE VALIDAR TODO

-- Backup final antes de eliminar
CREATE TABLE payment_methods_legacy_backup AS
SELECT * FROM payment_methods_legacy;

-- Eliminar tabla legacy
DROP TABLE payment_methods_legacy CASCADE;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete. Legacy table removed.';
  RAISE NOTICE '📊 Backup table: payment_methods_legacy_backup';
  RAISE NOTICE '🗑️  Delete backup after 30 days if everything works correctly.';
END $$;
```

---

## 🔙 ROLLBACK SCRIPT

Si algo sale mal, usar este script:

```sql
-- ROLLBACK: Restaurar estado anterior

-- 1. Restaurar payment_methods desde backup
DROP TABLE IF EXISTS payment_methods CASCADE;

CREATE TABLE payment_methods AS
SELECT * FROM payment_methods_legacy_backup;

-- 2. Eliminar tablas nuevas
DROP TABLE IF EXISTS money_movements CASCADE;
DROP TABLE IF EXISTS sale_payments CASCADE;
DROP TABLE IF EXISTS journal_lines CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS cash_sessions CASCADE;
DROP TABLE IF EXISTS money_locations CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;

-- 3. Quitar columnas agregadas
ALTER TABLE sales DROP COLUMN IF EXISTS journal_entry_id;
ALTER TABLE invoices DROP COLUMN IF EXISTS journal_entry_id;
ALTER TABLE supplier_orders DROP COLUMN IF EXISTS journal_entry_id;

-- 4. Verificar
SELECT COUNT(*) FROM payment_methods;
```

---

## 📊 POST-MIGRATION TASKS

### Frontend Updates Necesarios

```typescript
// ❌ ANTES (legacy)
import { fetchPaymentMethods } from '@/services/paymentApi';

// ✅ DESPUÉS (nuevo)
import { fetchSalePayments } from '@/modules/cash/services/salePaymentsService';

// ❌ ANTES
const payments = await supabase.from('payment_methods').select('*');

// ✅ DESPUÉS
const payments = await supabase
  .from('sale_payments')
  .select('*, journal_entry:journal_entries(*)')
  .eq('sale_id', saleId);
```

### Componentes a Actualizar

```bash
# Buscar referencias a payment_methods
grep -r "payment_methods" src/

# Archivos probables a actualizar:
# - src/pages/admin/operations/sales/
# - src/modules/sales/
# - src/pages/admin/finance-billing/
```

---

## ✅ SUCCESS CRITERIA

- [ ] Todas las tablas nuevas creadas
- [ ] Datos iniciales insertados (plan de cuentas)
- [ ] Todos los pagos legacy migrados a journal_entries
- [ ] Todos los journal_entries balancean a 0
- [ ] Totales coinciden (legacy vs nuevo)
- [ ] Foreign keys funcionando
- [ ] Tabla legacy eliminada
- [ ] Backup guardado

---

## 📞 SUPPORT

Si encuentras problemas durante la migración:

1. **NO ejecutes Paso 6** (eliminar legacy) hasta validar TODO
2. Usa el ROLLBACK script si es necesario
3. Revisa logs: `SELECT * FROM pg_stat_statements;`
4. Contacta al equipo con el error específico

---

**Última actualización**: 2025-01-24
**Status**: ✅ Script Completo - Listo para Ejecutar
