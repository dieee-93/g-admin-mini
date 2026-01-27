-- ================================================
-- STAFF POLICIES SETTINGS - Phase 2 Module 2
-- ================================================
-- Purpose: Store HR policies for staff management
-- Route: /admin/settings/staff/policies
-- Version: 1.0.0
-- Date: 2025-12-22

-- ================================================
-- TABLE CREATION
-- ================================================

CREATE TABLE IF NOT EXISTS public.staff_policies (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organization & Departments
  departments JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: [{"id": "kitchen", "name": "Cocina", "color": "#FF6B6B", "description": ""}]
  
  positions JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: [{"id": "chef", "name": "Chef", "department": "kitchen", "level": "senior"}]
  
  default_hourly_rates JSONB DEFAULT '{}'::jsonb,
  -- Example: {"chef": 250, "line_cook": 150, "bartender": 180}
  
  -- Overtime Policies
  overtime_enabled BOOLEAN DEFAULT true,
  overtime_threshold_hours DECIMAL(5,2) DEFAULT 40.00,
  overtime_multiplier DECIMAL(3,2) DEFAULT 1.50 CHECK (overtime_multiplier >= 1.00 AND overtime_multiplier <= 3.00),
  overtime_calculation_period VARCHAR(20) DEFAULT 'weekly' CHECK (overtime_calculation_period IN ('daily', 'weekly', 'biweekly', 'monthly')),
  
  -- Break Policies
  break_duration_minutes INTEGER DEFAULT 30 CHECK (break_duration_minutes >= 0 AND break_duration_minutes <= 120),
  break_frequency_hours DECIMAL(3,1) DEFAULT 4.0 CHECK (break_frequency_hours > 0 AND break_frequency_hours <= 12),
  unpaid_break_threshold INTEGER DEFAULT 6 CHECK (unpaid_break_threshold >= 0 AND unpaid_break_threshold <= 12),
  -- Hours worked before unpaid break required
  
  -- Shift Management
  shift_swap_advance_notice_hours INTEGER DEFAULT 24 CHECK (shift_swap_advance_notice_hours >= 0),
  shift_swap_approval_required BOOLEAN DEFAULT true,
  shift_swap_limit_per_month INTEGER DEFAULT 4 CHECK (shift_swap_limit_per_month >= 0),
  
  -- Attendance Policies
  attendance_grace_period_minutes INTEGER DEFAULT 5 CHECK (attendance_grace_period_minutes >= 0 AND attendance_grace_period_minutes <= 30),
  late_threshold_minutes INTEGER DEFAULT 15 CHECK (late_threshold_minutes >= 0 AND late_threshold_minutes <= 60),
  max_late_arrivals_per_month INTEGER DEFAULT 3 CHECK (max_late_arrivals_per_month >= 0),
  max_unexcused_absences_per_month INTEGER DEFAULT 2 CHECK (max_unexcused_absences_per_month >= 0),
  time_clock_rounding_minutes INTEGER DEFAULT 15 CHECK (time_clock_rounding_minutes IN (0, 5, 10, 15)),
  
  -- Performance & Training
  performance_review_frequency_days INTEGER DEFAULT 90 CHECK (performance_review_frequency_days > 0),
  training_requirements JSONB DEFAULT '[]'::jsonb,
  -- Example: ["Food Safety", "Customer Service", "POS Training"]
  certification_tracking_enabled BOOLEAN DEFAULT false,
  mandatory_certifications JSONB DEFAULT '[]'::jsonb,
  
  -- Onboarding
  onboarding_checklist_required BOOLEAN DEFAULT true,
  onboarding_duration_days INTEGER DEFAULT 30 CHECK (onboarding_duration_days > 0),
  
  -- Termination
  termination_notice_period_days INTEGER DEFAULT 15 CHECK (termination_notice_period_days >= 0),
  exit_interview_required BOOLEAN DEFAULT true,
  
  -- Metadata
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_overtime_config CHECK (
    NOT overtime_enabled OR (
      overtime_threshold_hours > 0 AND
      overtime_multiplier >= 1.0
    )
  )
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_staff_policies_system ON public.staff_policies(is_system) WHERE is_system = true;
CREATE INDEX idx_staff_policies_created_at ON public.staff_policies(created_at DESC);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE public.staff_policies ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone authenticated can view staff policies
CREATE POLICY "Staff policies viewable by authenticated users"
  ON public.staff_policies
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy 2: Only admins/managers can create staff policies
CREATE POLICY "Staff policies creatable by admins"
  ON public.staff_policies
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

-- Policy 3: Only admins/managers can update staff policies
CREATE POLICY "Staff policies updatable by admins"
  ON public.staff_policies
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

-- Policy 4: Only admins can delete non-system policies
CREATE POLICY "Staff policies deletable by admins"
  ON public.staff_policies
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin' AND
    is_system = false
  );

-- ================================================
-- DEFAULT SYSTEM RECORD
-- ================================================

INSERT INTO public.staff_policies (
  id,
  is_system,
  departments,
  positions,
  default_hourly_rates,
  overtime_enabled,
  overtime_threshold_hours,
  overtime_multiplier,
  overtime_calculation_period,
  break_duration_minutes,
  break_frequency_hours,
  unpaid_break_threshold,
  shift_swap_advance_notice_hours,
  shift_swap_approval_required,
  shift_swap_limit_per_month,
  attendance_grace_period_minutes,
  late_threshold_minutes,
  max_late_arrivals_per_month,
  max_unexcused_absences_per_month,
  time_clock_rounding_minutes,
  performance_review_frequency_days,
  training_requirements,
  certification_tracking_enabled,
  mandatory_certifications,
  onboarding_checklist_required,
  onboarding_duration_days,
  termination_notice_period_days,
  exit_interview_required
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  true,
  '[
    {"id": "kitchen", "name": "Cocina", "color": "#FF6B6B", "description": "Área de producción de alimentos"},
    {"id": "bar", "name": "Bar", "color": "#4ECDC4", "description": "Área de bebidas y cócteles"},
    {"id": "service", "name": "Servicio", "color": "#95E1D3", "description": "Atención al cliente"},
    {"id": "management", "name": "Gerencia", "color": "#FFE66D", "description": "Administración"}
  ]'::jsonb,
  '[
    {"id": "chef", "name": "Chef", "department": "kitchen", "level": "senior"},
    {"id": "line_cook", "name": "Cocinero", "department": "kitchen", "level": "mid"},
    {"id": "prep_cook", "name": "Ayudante de Cocina", "department": "kitchen", "level": "junior"},
    {"id": "bartender", "name": "Bartender", "department": "bar", "level": "mid"},
    {"id": "bar_back", "name": "Ayudante de Bar", "department": "bar", "level": "junior"},
    {"id": "waiter", "name": "Mesero", "department": "service", "level": "junior"},
    {"id": "host", "name": "Host/Hostess", "department": "service", "level": "junior"},
    {"id": "manager", "name": "Gerente", "department": "management", "level": "senior"}
  ]'::jsonb,
  '{
    "chef": 250,
    "line_cook": 150,
    "prep_cook": 120,
    "bartender": 180,
    "bar_back": 130,
    "waiter": 120,
    "host": 110,
    "manager": 300
  }'::jsonb,
  true,
  40.00,
  1.50,
  'weekly',
  30,
  4.0,
  6,
  24,
  true,
  4,
  5,
  15,
  3,
  2,
  15,
  90,
  '["Seguridad Alimentaria", "Servicio al Cliente", "Uso del Sistema POS", "Protocolos de Limpieza"]'::jsonb,
  true,
  '["Certificación de Manipulación de Alimentos", "RCP y Primeros Auxilios"]'::jsonb,
  true,
  30,
  15,
  true
) ON CONFLICT (id) DO NOTHING;

-- ================================================
-- TRIGGERS
-- ================================================

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_staff_policies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER staff_policies_updated_at_trigger
  BEFORE UPDATE ON public.staff_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_policies_updated_at();

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE public.staff_policies IS 
  'HR policies and staff management configuration. For notification settings (who gets alerts), use notification_rules table.';

COMMENT ON COLUMN public.staff_policies.departments IS 
  'Array of department configurations with id, name, color, and description';

COMMENT ON COLUMN public.staff_policies.positions IS 
  'Array of position/role definitions with department assignment and seniority level';

COMMENT ON COLUMN public.staff_policies.default_hourly_rates IS 
  'Default hourly wage rates per position (can be overridden per employee)';

COMMENT ON COLUMN public.staff_policies.overtime_threshold_hours IS 
  'Hours worked before overtime applies (typically 40 for weekly)';

COMMENT ON COLUMN public.staff_policies.overtime_multiplier IS 
  'Pay multiplier for overtime hours (1.5 = time and a half, 2.0 = double time)';

COMMENT ON COLUMN public.staff_policies.break_frequency_hours IS 
  'Hours worked before employee is entitled to a break';

COMMENT ON COLUMN public.staff_policies.unpaid_break_threshold IS 
  'Hours worked before unpaid meal break is required (labor law compliance)';

COMMENT ON COLUMN public.staff_policies.shift_swap_advance_notice_hours IS 
  'Minimum notice required before employees can swap shifts';

COMMENT ON COLUMN public.staff_policies.attendance_grace_period_minutes IS 
  'Minutes after scheduled start time before considered late (clock-in tolerance)';

COMMENT ON COLUMN public.staff_policies.late_threshold_minutes IS 
  'Minutes late that triggers disciplinary action';

COMMENT ON COLUMN public.staff_policies.time_clock_rounding_minutes IS 
  'Round clock-in/out times to nearest X minutes (0=disabled, 15=quarter hour)';

COMMENT ON COLUMN public.staff_policies.performance_review_frequency_days IS 
  'Days between performance reviews (90=quarterly, 180=bi-annually)';

COMMENT ON COLUMN public.staff_policies.training_requirements IS 
  'Array of mandatory training modules all staff must complete';

COMMENT ON COLUMN public.staff_policies.mandatory_certifications IS 
  'Array of required certifications (e.g., food handling, alcohol service)';

COMMENT ON COLUMN public.staff_policies.onboarding_duration_days IS 
  'Standard onboarding period length for new hires';

COMMENT ON COLUMN public.staff_policies.termination_notice_period_days IS 
  'Required notice period when terminating employment';
