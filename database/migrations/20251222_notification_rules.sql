-- =====================================================
-- NOTIFICATION RULES SYSTEM
-- =====================================================
-- Purpose: Configurable notification rules for alerts
-- Categories: inventory, staff, customers, finance, system
-- Created: 2025-12-22
-- =====================================================

-- 1. Create notification_rules table
CREATE TABLE IF NOT EXISTS public.notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Rule identification
  rule_key VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  
  -- Rule details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Configuration
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  
  -- Notification settings
  notify_email BOOLEAN DEFAULT false,
  notify_push BOOLEAN DEFAULT false,
  notify_sms BOOLEAN DEFAULT false,
  notify_in_app BOOLEAN DEFAULT true,
  
  -- Conditions (JSON)
  conditions JSONB DEFAULT '{}',
  
  -- Recipients
  recipient_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  recipient_users UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CHECK (category IN ('inventory', 'staff', 'customers', 'finance', 'system')),
  CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

-- 2. Create indexes for performance
CREATE INDEX idx_notification_rules_category ON public.notification_rules(category);
CREATE INDEX idx_notification_rules_enabled ON public.notification_rules(is_enabled);
CREATE INDEX idx_notification_rules_key ON public.notification_rules(rule_key);

-- 3. Enable RLS
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Notification rules viewable by authenticated users"
  ON public.notification_rules FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Notification rules manageable by admins"
  ON public.notification_rules FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'manager'
  );

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_notification_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_rules_updated_at
  BEFORE UPDATE ON public.notification_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_rules_updated_at();

-- 6. Insert default notification rules
INSERT INTO public.notification_rules (rule_key, category, name, description, severity, conditions) VALUES
  -- INVENTORY ALERTS
  ('inventory.stock.low', 'inventory', 'Stock Bajo', 'Alerta cuando el stock está por debajo del mínimo', 'warning', '{"threshold_type": "min_stock"}'),
  ('inventory.stock.critical', 'inventory', 'Stock Crítico', 'Alerta cuando el stock está en nivel crítico', 'critical', '{"threshold_type": "critical_stock"}'),
  ('inventory.stock.out', 'inventory', 'Sin Stock', 'Alerta cuando un producto está agotado', 'error', '{"threshold": 0}'),
  ('inventory.expiry.near', 'inventory', 'Próximo a Vencer', 'Alerta cuando productos están por vencer', 'warning', '{"days_before": 7}'),
  ('inventory.expiry.today', 'inventory', 'Vence Hoy', 'Alerta cuando productos vencen hoy', 'error', '{"days_before": 0}'),
  ('inventory.transfer.pending', 'inventory', 'Transferencia Pendiente', 'Alerta de transferencias pendientes de aprobación', 'info', '{}'),
  ('inventory.waste.high', 'inventory', 'Desperdicio Alto', 'Alerta cuando el desperdicio supera el umbral', 'warning', '{"threshold_percent": 5}'),
  
  -- STAFF ALERTS
  ('staff.shift.unassigned', 'staff', 'Turno Sin Asignar', 'Alerta cuando hay turnos sin personal asignado', 'warning', '{"hours_before": 24}'),
  ('staff.attendance.late', 'staff', 'Llegada Tarde', 'Alerta cuando un empleado llega tarde', 'info', '{"grace_minutes": 15}'),
  ('staff.attendance.absent', 'staff', 'Ausencia', 'Alerta cuando un empleado está ausente sin aviso', 'warning', '{}'),
  ('staff.overtime.exceeded', 'staff', 'Horas Extra Excedidas', 'Alerta cuando se exceden horas extra permitidas', 'warning', '{"max_hours": 10}'),
  ('staff.certification.expiring', 'staff', 'Certificación por Vencer', 'Alerta cuando certificaciones están por vencer', 'warning', '{"days_before": 30}'),
  
  -- CUSTOMER ALERTS
  ('customers.birthday.today', 'customers', 'Cumpleaños Hoy', 'Alerta de clientes que cumplen años hoy', 'info', '{}'),
  ('customers.loyalty.tier_up', 'customers', 'Cliente Sube de Nivel', 'Alerta cuando un cliente sube de nivel de lealtad', 'info', '{}'),
  ('customers.feedback.negative', 'customers', 'Feedback Negativo', 'Alerta cuando se recibe feedback negativo', 'warning', '{"rating_below": 3}'),
  ('customers.inactive.long', 'customers', 'Cliente Inactivo', 'Alerta cuando un cliente no ha comprado en mucho tiempo', 'info', '{"days_inactive": 90}'),
  
  -- FINANCIAL ALERTS
  ('finance.payment.failed', 'finance', 'Pago Fallido', 'Alerta cuando falla un pago', 'error', '{}'),
  ('finance.invoice.overdue', 'finance', 'Factura Vencida', 'Alerta cuando una factura está vencida', 'warning', '{"days_overdue": 1}'),
  ('finance.cash.discrepancy', 'finance', 'Discrepancia de Caja', 'Alerta cuando hay diferencia en el cierre de caja', 'warning', '{"threshold_amount": 100}'),
  ('finance.revenue.below_target', 'finance', 'Ingresos Bajo Meta', 'Alerta cuando los ingresos están por debajo de la meta', 'info', '{"threshold_percent": 80}'),
  ('finance.expense.high', 'finance', 'Gasto Elevado', 'Alerta cuando un gasto supera el umbral', 'warning', '{"threshold_amount": 5000}'),
  
  -- SYSTEM ALERTS
  ('system.backup.failed', 'system', 'Backup Fallido', 'Alerta cuando falla un backup programado', 'critical', '{}'),
  ('system.integration.error', 'system', 'Error de Integración', 'Alerta cuando falla una integración externa', 'error', '{}'),
  ('system.performance.slow', 'system', 'Rendimiento Lento', 'Alerta cuando el sistema está lento', 'warning', '{"response_time_ms": 3000}'),
  ('system.storage.full', 'system', 'Almacenamiento Lleno', 'Alerta cuando el almacenamiento está casi lleno', 'critical', '{"threshold_percent": 90}'),
  ('system.license.expiring', 'system', 'Licencia por Vencer', 'Alerta cuando la licencia está por vencer', 'warning', '{"days_before": 30}')
ON CONFLICT (rule_key) DO NOTHING;

-- 7. Add comments
COMMENT ON TABLE public.notification_rules IS 'Configurable notification rules for system alerts';
COMMENT ON COLUMN public.notification_rules.rule_key IS 'Unique identifier for the rule (e.g., inventory.stock.low)';
COMMENT ON COLUMN public.notification_rules.category IS 'Category: inventory, staff, customers, finance, system';
COMMENT ON COLUMN public.notification_rules.severity IS 'Severity level: info, warning, error, critical';
COMMENT ON COLUMN public.notification_rules.conditions IS 'JSON object with rule-specific conditions';
COMMENT ON COLUMN public.notification_rules.recipient_roles IS 'Array of role names that should receive notifications';
COMMENT ON COLUMN public.notification_rules.recipient_users IS 'Array of specific user UUIDs that should receive notifications';
