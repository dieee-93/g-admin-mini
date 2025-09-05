-- =====================================================
-- STAFF MANAGEMENT SCHEMA FOR G-ADMIN MINI
-- =====================================================
-- Version: 1.0
-- Date: January 2025
-- Description: Complete staff management database schema

-- =====================================================
-- CORE STAFF TABLES
-- =====================================================

-- EMPLOYEES - Core employee information
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT UNIQUE NOT NULL, -- Human readable ID (EMP001, etc.)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    position TEXT NOT NULL,
    department TEXT NOT NULL CHECK (department IN ('kitchen', 'service', 'admin', 'cleaning', 'management')),
    hire_date DATE NOT NULL,
    employment_status TEXT NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'on_leave', 'terminated')),
    employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'temp')),
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'supervisor', 'manager', 'admin')),
    salary DECIMAL(12,2) DEFAULT 0.00,
    avatar_url TEXT,
    notes TEXT,
    
    -- Performance metrics
    performance_score INTEGER DEFAULT 85 CHECK (performance_score >= 0 AND performance_score <= 100),
    attendance_rate INTEGER DEFAULT 95 CHECK (attendance_rate >= 0 AND attendance_rate <= 100),
    completed_tasks INTEGER DEFAULT 0,
    
    -- Schedule preferences
    weekly_hours INTEGER DEFAULT 40,
    shift_preference TEXT DEFAULT 'flexible' CHECK (shift_preference IN ('morning', 'afternoon', 'night', 'flexible')),
    available_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    
    -- Access control
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- EMPLOYEE_TRAINING - Training and certifications
CREATE TABLE IF NOT EXISTS public.employee_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    training_name TEXT NOT NULL,
    training_type TEXT NOT NULL CHECK (training_type IN ('certification', 'course', 'workshop', 'safety', 'compliance')),
    completed_date DATE NOT NULL,
    expiry_date DATE,
    issuing_authority TEXT,
    certificate_url TEXT,
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- SHIFT_SCHEDULES - Enhanced shift scheduling
CREATE TABLE IF NOT EXISTS public.shift_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    position TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'missed', 'cancelled')),
    break_duration INTEGER DEFAULT 30, -- minutes
    notes TEXT,
    
    -- Coverage and substitution
    is_mandatory BOOLEAN DEFAULT false,
    can_be_covered BOOLEAN DEFAULT true,
    covered_by UUID REFERENCES public.employees(id),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Ensure no overlapping shifts for same employee
    CONSTRAINT no_overlapping_shifts EXCLUDE USING gist (
        employee_id WITH =,
        tsrange(
            (date::timestamp + start_time::interval), 
            (date::timestamp + end_time::interval)
        ) WITH &&
    )
);

-- TIME_ENTRIES - Time tracking and clock in/out
CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.shift_schedules(id),
    entry_type TEXT NOT NULL CHECK (entry_type IN ('clock_in', 'clock_out', 'break_start', 'break_end')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    location JSONB, -- {latitude, longitude}
    notes TEXT,
    
    -- Offline support
    is_offline BOOLEAN DEFAULT false,
    sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'syncing', 'synced', 'failed')),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- PAYROLL_PERIODS - Pay period calculations
CREATE TABLE IF NOT EXISTS public.payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    regular_hours DECIMAL(8,2) DEFAULT 0.00,
    overtime_hours DECIMAL(8,2) DEFAULT 0.00,
    total_hours DECIMAL(8,2) DEFAULT 0.00,
    regular_pay DECIMAL(12,2) DEFAULT 0.00,
    overtime_pay DECIMAL(12,2) DEFAULT 0.00,
    total_pay DECIMAL(12,2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'approved', 'paid')),
    
    -- Deductions and bonuses
    deductions JSONB DEFAULT '[]'::jsonb, -- Array of {name, amount, type}
    bonuses JSONB DEFAULT '[]'::jsonb,    -- Array of {name, amount, type}
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Employee search and filtering
CREATE INDEX IF NOT EXISTS idx_employees_name ON public.employees(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_position ON public.employees(position);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON public.employees(hire_date);

-- Training tracking
CREATE INDEX IF NOT EXISTS idx_employee_training_employee ON public.employee_training(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_training_type ON public.employee_training(training_type);
CREATE INDEX IF NOT EXISTS idx_employee_training_expiry ON public.employee_training(expiry_date) WHERE expiry_date IS NOT NULL;

-- Schedule management
CREATE INDEX IF NOT EXISTS idx_shift_schedules_employee_date ON public.shift_schedules(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_date ON public.shift_schedules(date);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_status ON public.shift_schedules(status);

-- Time tracking
CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON public.time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_timestamp ON public.time_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_time_entries_sync_status ON public.time_entries(sync_status) WHERE sync_status != 'synced';

-- Payroll calculations
CREATE INDEX IF NOT EXISTS idx_payroll_periods_employee ON public.payroll_periods(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_dates ON public.payroll_periods(period_start, period_end);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update employee updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_employee_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employees_updated_at_trigger
    BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.update_employee_updated_at();

-- Update shift_schedules updated_at timestamp
CREATE TRIGGER shift_schedules_updated_at_trigger
    BEFORE UPDATE ON public.shift_schedules
    FOR EACH ROW EXECUTE FUNCTION public.update_employee_updated_at();

-- Update payroll_periods updated_at timestamp
CREATE TRIGGER payroll_periods_updated_at_trigger
    BEFORE UPDATE ON public.payroll_periods
    FOR EACH ROW EXECUTE FUNCTION public.update_employee_updated_at();

-- =====================================================
-- RLS POLICIES FOR STAFF TABLES
-- =====================================================

-- EMPLOYEES
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- SUPERVISOR+ can see all employees, OPERADOR can see active employees
CREATE POLICY "employees_select_policy" ON public.employees
    FOR SELECT USING (
        public.check_user_access('SUPERVISOR') OR
        (public.check_user_access('OPERADOR') AND employment_status = 'active')
    );

-- SUPERVISOR+ can create employees
CREATE POLICY "employees_insert_policy" ON public.employees
    FOR INSERT WITH CHECK (public.check_user_access('SUPERVISOR'));

-- SUPERVISOR+ can update employees
CREATE POLICY "employees_update_policy" ON public.employees
    FOR UPDATE USING (public.check_user_access('SUPERVISOR'))
    WITH CHECK (public.check_user_access('SUPERVISOR'));

-- ADMINISTRADOR+ can delete employees
CREATE POLICY "employees_delete_policy" ON public.employees
    FOR DELETE USING (public.check_user_access('ADMINISTRADOR'));

-- EMPLOYEE_TRAINING
ALTER TABLE public.employee_training ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee_training_select_policy" ON public.employee_training
    FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "employee_training_insert_policy" ON public.employee_training
    FOR INSERT WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "employee_training_update_policy" ON public.employee_training
    FOR UPDATE USING (public.check_user_access('SUPERVISOR'))
    WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "employee_training_delete_policy" ON public.employee_training
    FOR DELETE USING (public.check_user_access('SUPERVISOR'));

-- SHIFT_SCHEDULES
ALTER TABLE public.shift_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shift_schedules_select_policy" ON public.shift_schedules
    FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "shift_schedules_insert_policy" ON public.shift_schedules
    FOR INSERT WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "shift_schedules_update_policy" ON public.shift_schedules
    FOR UPDATE USING (public.check_user_access('SUPERVISOR'))
    WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "shift_schedules_delete_policy" ON public.shift_schedules
    FOR DELETE USING (public.check_user_access('SUPERVISOR'));

-- TIME_ENTRIES
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_entries_select_policy" ON public.time_entries
    FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "time_entries_insert_policy" ON public.time_entries
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

-- Only SUPERVISOR+ can update time entries (for corrections)
CREATE POLICY "time_entries_update_policy" ON public.time_entries
    FOR UPDATE USING (public.check_user_access('SUPERVISOR'))
    WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "time_entries_delete_policy" ON public.time_entries
    FOR DELETE USING (public.check_user_access('SUPERVISOR'));

-- PAYROLL_PERIODS
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;

-- SUPERVISOR+ can view payroll
CREATE POLICY "payroll_periods_select_policy" ON public.payroll_periods
    FOR SELECT USING (public.check_user_access('SUPERVISOR'));

CREATE POLICY "payroll_periods_insert_policy" ON public.payroll_periods
    FOR INSERT WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "payroll_periods_update_policy" ON public.payroll_periods
    FOR UPDATE USING (public.check_user_access('SUPERVISOR'))
    WITH CHECK (public.check_user_access('SUPERVISOR'));

-- Only ADMINISTRADOR+ can delete payroll records
CREATE POLICY "payroll_periods_delete_policy" ON public.payroll_periods
    FOR DELETE USING (public.check_user_access('ADMINISTRADOR'));

-- =====================================================
-- UTILITY FUNCTIONS FOR STAFF MANAGEMENT
-- =====================================================

-- Calculate hours worked for an employee in a date range
CREATE OR REPLACE FUNCTION public.calculate_employee_hours(
    employee_uuid UUID,
    start_date DATE,
    end_date DATE,
    OUT regular_hours DECIMAL,
    OUT overtime_hours DECIMAL,
    OUT total_hours DECIMAL
) AS $$
DECLARE
    entry RECORD;
    daily_hours DECIMAL := 0;
    shift_start TIMESTAMP;
    shift_end TIMESTAMP;
    break_time INTERVAL := INTERVAL '0 minutes';
BEGIN
    regular_hours := 0;
    overtime_hours := 0;
    total_hours := 0;
    
    -- Process each day in the range
    FOR entry IN 
        SELECT date_trunc('day', timestamp) as work_date
        FROM public.time_entries 
        WHERE employee_id = employee_uuid 
            AND date_trunc('day', timestamp) BETWEEN start_date AND end_date
        GROUP BY date_trunc('day', timestamp)
        ORDER BY work_date
    LOOP
        daily_hours := 0;
        break_time := INTERVAL '0 minutes';
        
        -- Find clock in/out for this day
        SELECT 
            MIN(CASE WHEN entry_type = 'clock_in' THEN timestamp END),
            MAX(CASE WHEN entry_type = 'clock_out' THEN timestamp END)
        INTO shift_start, shift_end
        FROM public.time_entries
        WHERE employee_id = employee_uuid 
            AND date_trunc('day', timestamp) = entry.work_date
            AND entry_type IN ('clock_in', 'clock_out');
        
        -- Calculate break time
        SELECT COALESCE(SUM(
            CASE 
                WHEN break_end.timestamp IS NOT NULL 
                THEN break_end.timestamp - break_start.timestamp
                ELSE INTERVAL '0'
            END
        ), INTERVAL '0')
        INTO break_time
        FROM (
            SELECT 
                timestamp,
                LEAD(timestamp) OVER (ORDER BY timestamp) as break_end_time
            FROM public.time_entries
            WHERE employee_id = employee_uuid 
                AND date_trunc('day', timestamp) = entry.work_date
                AND entry_type = 'break_start'
        ) break_start
        LEFT JOIN (
            SELECT timestamp
            FROM public.time_entries
            WHERE employee_id = employee_uuid 
                AND date_trunc('day', timestamp) = entry.work_date
                AND entry_type = 'break_end'
        ) break_end ON break_end.timestamp = break_start.break_end_time;
        
        -- Calculate daily hours
        IF shift_start IS NOT NULL AND shift_end IS NOT NULL THEN
            daily_hours := EXTRACT(EPOCH FROM (shift_end - shift_start - break_time)) / 3600.0;
            
            -- Add to totals
            IF daily_hours <= 8 THEN
                regular_hours := regular_hours + daily_hours;
            ELSE
                regular_hours := regular_hours + 8;
                overtime_hours := overtime_hours + (daily_hours - 8);
            END IF;
        END IF;
    END LOOP;
    
    total_hours := regular_hours + overtime_hours;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample employees (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.employees LIMIT 1) THEN
        INSERT INTO public.employees (
            employee_id, first_name, last_name, email, position, department, hire_date, employment_type
        ) VALUES 
        ('EMP001', 'Ana', 'García', 'ana.garcia@restaurant.com', 'Chef', 'kitchen', '2023-01-15', 'full_time'),
        ('EMP002', 'Carlos', 'López', 'carlos.lopez@restaurant.com', 'Waiter', 'service', '2023-03-20', 'part_time'),
        ('EMP003', 'María', 'Rodríguez', 'maria.rodriguez@restaurant.com', 'Manager', 'management', '2022-08-10', 'full_time'),
        ('EMP004', 'Juan', 'Pérez', 'juan.perez@restaurant.com', 'Cook', 'kitchen', '2023-05-01', 'full_time'),
        ('EMP005', 'Laura', 'Martínez', 'laura.martinez@restaurant.com', 'Hostess', 'service', '2023-09-15', 'part_time');
    END IF;
END $$;

SELECT 'Staff management schema created successfully!' as result;