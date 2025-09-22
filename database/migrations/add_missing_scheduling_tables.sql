-- Migration: Add Missing Scheduling Tables (Harmonized with existing staff_schema.sql)
-- Date: 2025-09-21
-- Purpose: Add only missing tables needed by scheduling module
-- Note: employees and shift_schedules already exist from staff_schema.sql

-- ========================================
-- 1. STAFFING_REQUIREMENTS TABLE (MISSING)
-- ========================================
CREATE TABLE IF NOT EXISTS public.staffing_requirements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  position character varying NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  time_slot time without time zone NOT NULL,
  min_staff integer NOT NULL DEFAULT 1,
  max_staff integer NOT NULL DEFAULT 1,
  optimal_staff integer NOT NULL DEFAULT 1,
  priority_level text DEFAULT 'medium'::text CHECK (priority_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  cost_center character varying,
  department character varying,
  skills_required text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  effective_date date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT staffing_requirements_pkey PRIMARY KEY (id),
  CONSTRAINT staffing_requirements_staff_check CHECK (min_staff <= optimal_staff AND optimal_staff <= max_staff)
);

-- ========================================
-- 2. EMPLOYEE_AVAILABILITY TABLE (MISSING)
-- ========================================
CREATE TABLE IF NOT EXISTS public.employee_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_available boolean DEFAULT true,
  preference_level text DEFAULT 'neutral'::text CHECK (preference_level = ANY (ARRAY['preferred'::text, 'neutral'::text, 'avoid'::text, 'unavailable'::text])),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT employee_availability_pkey PRIMARY KEY (id),
  CONSTRAINT employee_availability_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);

-- ========================================
-- 3. EMPLOYEE_SKILLS TABLE (MISSING)
-- ========================================
CREATE TABLE IF NOT EXISTS public.employee_skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  skill_name character varying NOT NULL,
  proficiency_level text DEFAULT 'intermediate'::text CHECK (proficiency_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text, 'expert'::text])),
  certified boolean DEFAULT false,
  certification_date date,
  expiry_date date,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT employee_skills_pkey PRIMARY KEY (id),
  CONSTRAINT employee_skills_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id),
  CONSTRAINT employee_skills_unique UNIQUE (employee_id, skill_name)
);

-- ========================================
-- 4. ADD MISSING COLUMNS TO EXISTING TABLES
-- ========================================

-- Add hourly_rate to employees if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees'
    AND column_name = 'hourly_rate'
  ) THEN
    ALTER TABLE public.employees ADD COLUMN hourly_rate numeric DEFAULT 0;
  END IF;
END $$;

-- Add computed name column if missing (for backward compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees'
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.employees ADD COLUMN name character varying GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;
  END IF;
END $$;

-- Add status column if missing (alias for employment_status)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.employees ADD COLUMN status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text]));
    -- Sync with employment_status
    UPDATE public.employees SET status = CASE
      WHEN employment_status = 'active' THEN 'active'
      ELSE 'inactive'
    END;
  END IF;
END $$;

-- ========================================
-- 5. ADD FOREIGN KEY TO SHIFTS TABLE
-- ========================================
-- Note: shifts table exists from original schema, just ensure FK exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shifts') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'shifts_employee_id_fkey'
      AND table_name = 'shifts'
    ) THEN
      ALTER TABLE public.shifts
      ADD CONSTRAINT shifts_employee_id_fkey
      FOREIGN KEY (employee_id) REFERENCES public.employees(id);
    END IF;
  END IF;
END $$;

-- Add foreign key to time_off_requests if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_off_requests') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'time_off_requests_employee_id_fkey'
      AND table_name = 'time_off_requests'
    ) THEN
      ALTER TABLE public.time_off_requests
      ADD CONSTRAINT time_off_requests_employee_id_fkey
      FOREIGN KEY (employee_id) REFERENCES public.employees(id);
    END IF;
  END IF;
END $$;

-- ========================================
-- 6. INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_staffing_requirements_active ON public.staffing_requirements(is_active, effective_date);
CREATE INDEX IF NOT EXISTS idx_staffing_requirements_position_day ON public.staffing_requirements(position, day_of_week);

CREATE INDEX IF NOT EXISTS idx_employee_availability_employee_day ON public.employee_availability(employee_id, day_of_week);

CREATE INDEX IF NOT EXISTS idx_employee_skills_employee ON public.employee_skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_skill ON public.employee_skills(skill_name);

-- ========================================
-- 7. SAMPLE DATA FOR DEVELOPMENT
-- ========================================

-- Insert sample staffing requirements
INSERT INTO public.staffing_requirements (position, day_of_week, time_slot, min_staff, optimal_staff, max_staff, priority_level) VALUES
('Chef', 1, '08:00:00', 1, 2, 2, 'high'),          -- Monday morning
('Chef', 1, '12:00:00', 2, 3, 3, 'critical'),      -- Monday lunch
('Chef', 1, '18:00:00', 2, 3, 3, 'critical'),      -- Monday dinner
('Waiter', 1, '08:00:00', 2, 3, 4, 'high'),        -- Monday morning
('Waiter', 1, '12:00:00', 3, 4, 5, 'critical'),    -- Monday lunch
('Waiter', 1, '18:00:00', 3, 4, 5, 'critical'),    -- Monday dinner
('Cook', 1, '08:00:00', 1, 2, 2, 'high'),          -- Monday morning
('Cook', 1, '12:00:00', 2, 3, 3, 'critical'),      -- Monday lunch
('Cook', 1, '18:00:00', 2, 3, 3, 'critical'),      -- Monday dinner
('Manager', 1, '08:00:00', 1, 1, 2, 'medium'),     -- Monday morning
('Manager', 1, '12:00:00', 1, 2, 2, 'high'),       -- Monday lunch
('Manager', 1, '18:00:00', 1, 2, 2, 'high')        -- Monday dinner
ON CONFLICT DO NOTHING;

-- Insert sample availability for existing employees
INSERT INTO public.employee_availability (employee_id, day_of_week, start_time, end_time, preference_level)
SELECT
  e.id,
  1, -- Monday
  '08:00:00',
  '16:00:00',
  'preferred'
FROM public.employees e
WHERE e.employment_status = 'active'
ON CONFLICT DO NOTHING;

-- Insert sample skills for existing employees
INSERT INTO public.employee_skills (employee_id, skill_name, proficiency_level)
SELECT
  e.id,
  CASE e.position
    WHEN 'Chef' THEN 'Cooking'
    WHEN 'Cook' THEN 'Food Preparation'
    WHEN 'Waiter' THEN 'Customer Service'
    WHEN 'Manager' THEN 'Team Management'
    ELSE 'General Skills'
  END,
  'intermediate'
FROM public.employees e
WHERE e.employment_status = 'active'
ON CONFLICT (employee_id, skill_name) DO NOTHING;

-- ========================================
-- 8. RLS POLICIES FOR NEW TABLES
-- ========================================

-- Enable RLS on new tables
ALTER TABLE public.staffing_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;

-- Create basic policies (adjust as needed for your auth system)
CREATE POLICY "Enable read access for all users" ON public.staffing_requirements FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON public.staffing_requirements FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.employee_availability FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON public.employee_availability FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.employee_skills FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON public.employee_skills FOR ALL USING (true);

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Missing Scheduling Tables Added';
  RAISE NOTICE 'New tables: staffing_requirements, employee_availability, employee_skills';
  RAISE NOTICE 'Enhanced existing employees table with missing columns';
  RAISE NOTICE 'Sample data inserted for development';
  RAISE NOTICE 'Foreign keys and indexes created';
  RAISE NOTICE 'Harmonized with existing staff_schema.sql';
END $$;