-- =========================================
-- Scheduling System - Database Implementation
-- Fase 2: Importante - Sistema de Turnos y Horarios
-- =========================================

-- TABLAS PRINCIPALES DEL SISTEMA DE SCHEDULING
-- ============================================

-- Tabla de programaciones/horarios (schedules)
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    created_by UUID, -- Reference to employees table
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla principal de turnos (shifts)
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(20) NOT NULL, -- Reference to employees.employee_id
    schedule_id UUID, -- Reference to schedules table
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    position VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    
    -- Calculated fields
    hours_scheduled DECIMAL(8,2) GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
    ) STORED,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT shifts_valid_time CHECK (end_time > start_time),
    CONSTRAINT shifts_employee_fkey FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT shifts_schedule_fkey FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL
);

-- Tabla de solicitudes de tiempo libre
CREATE TABLE IF NOT EXISTS time_off_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id),
    type VARCHAR(50) CHECK (type IN ('vacation', 'sick', 'personal', 'emergency', 'bereavement', 'maternity', 'paternity')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')) DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT now(),
    reviewed_by VARCHAR(20), -- Reference to employees.employee_id
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    -- Calculated fields
    days_requested INTEGER GENERATED ALWAYS AS (
        (end_date - start_date) + 1
    ) STORED,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT time_off_valid_dates CHECK (end_date >= start_date),
    CONSTRAINT time_off_reviewer_fkey FOREIGN KEY (reviewed_by) REFERENCES employees(employee_id)
);

-- Tabla de plantillas de turnos
CREATE TABLE IF NOT EXISTS shift_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    position_id VARCHAR(100),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days_of_week INTEGER[] NOT NULL, -- [0,1,2,3,4,5,6] where 0=Sunday
    max_employees INTEGER DEFAULT 1,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT shift_templates_valid_time CHECK (end_time > start_time),
    CONSTRAINT shift_templates_valid_days CHECK (
        array_length(days_of_week, 1) > 0 AND
        NOT EXISTS (
            SELECT 1 FROM unnest(days_of_week) AS day 
            WHERE day < 0 OR day > 6
        )
    ),
    CONSTRAINT shift_templates_max_employees_positive CHECK (max_employees > 0)
);

-- Tabla de disponibilidad de empleados
CREATE TABLE IF NOT EXISTS employee_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL, -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_until DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT availability_valid_time CHECK (end_time > start_time),
    CONSTRAINT availability_valid_dates CHECK (
        effective_until IS NULL OR effective_until >= effective_from
    ),
    
    -- Unique constraint to prevent overlapping availability for same employee/day
    UNIQUE (employee_id, day_of_week, start_time, end_time)
);

-- Tabla de restricciones de programación
CREATE TABLE IF NOT EXISTS scheduling_constraints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    constraint_type VARCHAR(50) CHECK (constraint_type IN (
        'min_hours_per_day', 'max_hours_per_day', 'max_hours_per_week',
        'min_rest_between_shifts', 'max_consecutive_days', 'position_required'
    )) NOT NULL,
    constraint_value JSONB NOT NULL, -- Flexible constraint configuration
    applies_to VARCHAR(50) CHECK (applies_to IN ('all_employees', 'position', 'specific_employee')) DEFAULT 'all_employees',
    target_value TEXT, -- position name or employee_id when applies_to is not 'all_employees'
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1, -- Higher number = higher priority
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de log de cambios en programación
CREATE TABLE IF NOT EXISTS scheduling_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(20), -- Reference to employees.employee_id
    change_reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT scheduling_audit_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES employees(employee_id)
);

-- ÍNDICES PARA PERFORMANCE
-- ========================

-- Índices principales para shifts
CREATE INDEX IF NOT EXISTS idx_shifts_employee_date ON shifts(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_shifts_date_time ON shifts(date, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_shifts_schedule_id ON shifts(schedule_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_position ON shifts(position);

-- Índices para time_off_requests
CREATE INDEX IF NOT EXISTS idx_time_off_employee ON time_off_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_off_dates ON time_off_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_time_off_status ON time_off_requests(status);
CREATE INDEX IF NOT EXISTS idx_time_off_requested_at ON time_off_requests(requested_at DESC);

-- Índices para schedules
CREATE INDEX IF NOT EXISTS idx_schedules_dates ON schedules(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_created_by ON schedules(created_by);

-- Índices para employee_availability
CREATE INDEX IF NOT EXISTS idx_employee_availability_employee ON employee_availability(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_availability_day ON employee_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_employee_availability_effective ON employee_availability(effective_from, effective_until);

-- Índices para audit
CREATE INDEX IF NOT EXISTS idx_scheduling_audit_table_record ON scheduling_audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_audit_changed_at ON scheduling_audit_log(changed_at DESC);

-- FUNCIONES RPC PARA SUPABASE
-- ===========================

-- Función: Verificar conflictos de turnos
CREATE OR REPLACE FUNCTION scheduling_check_shift_conflicts(
    p_employee_id VARCHAR(20),
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_exclude_shift_id UUID DEFAULT NULL
)
RETURNS TABLE (
    conflict_type TEXT,
    conflict_shift_id UUID,
    conflict_start_time TIME,
    conflict_end_time TIME,
    message TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    -- Check for overlapping shifts
    RETURN QUERY
    SELECT 
        'shift_overlap'::TEXT as conflict_type,
        s.id as conflict_shift_id,
        s.start_time as conflict_start_time,
        s.end_time as conflict_end_time,
        format('Overlaps with existing shift from %s to %s', s.start_time, s.end_time) as message
    FROM shifts s
    WHERE s.employee_id = p_employee_id
      AND s.date = p_date
      AND s.status NOT IN ('cancelled', 'no_show')
      AND (p_exclude_shift_id IS NULL OR s.id != p_exclude_shift_id)
      AND (
        (p_start_time >= s.start_time AND p_start_time < s.end_time) OR
        (p_end_time > s.start_time AND p_end_time <= s.end_time) OR
        (p_start_time <= s.start_time AND p_end_time >= s.end_time)
      );
    
    -- Check for time-off conflicts
    RETURN QUERY
    SELECT 
        'time_off_conflict'::TEXT as conflict_type,
        tor.id as conflict_shift_id,
        TIME '00:00:00' as conflict_start_time,
        TIME '23:59:59' as conflict_end_time,
        format('Employee has approved %s time off from %s to %s', tor.type, tor.start_date, tor.end_date) as message
    FROM time_off_requests tor
    WHERE tor.employee_id = p_employee_id
      AND tor.status = 'approved'
      AND p_date BETWEEN tor.start_date AND tor.end_date;
      
    -- Check availability constraints (if availability is set)
    RETURN QUERY
    SELECT 
        'availability_conflict'::TEXT as conflict_type,
        NULL::UUID as conflict_shift_id,
        ea.start_time as conflict_start_time,
        ea.end_time as conflict_end_time,
        format('Employee is only available from %s to %s on %s', 
               ea.start_time, ea.end_time, 
               CASE EXTRACT(DOW FROM p_date)
                   WHEN 0 THEN 'Sunday'
                   WHEN 1 THEN 'Monday'
                   WHEN 2 THEN 'Tuesday'
                   WHEN 3 THEN 'Wednesday'
                   WHEN 4 THEN 'Thursday'
                   WHEN 5 THEN 'Friday'
                   WHEN 6 THEN 'Saturday'
               END) as message
    FROM employee_availability ea
    WHERE ea.employee_id = p_employee_id
      AND ea.day_of_week = EXTRACT(DOW FROM p_date)
      AND ea.is_available = true
      AND (ea.effective_from IS NULL OR ea.effective_from <= p_date)
      AND (ea.effective_until IS NULL OR ea.effective_until >= p_date)
      AND NOT (p_start_time >= ea.start_time AND p_end_time <= ea.end_time);
END;
$$;

-- Función: Calcular costos laborales
CREATE OR REPLACE FUNCTION scheduling_calculate_labor_costs(
    p_start_date DATE,
    p_end_date DATE,
    p_employee_id VARCHAR(20) DEFAULT NULL,
    p_position VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE (
    total_cost DECIMAL(12,2),
    total_hours DECIMAL(8,2),
    avg_hourly_rate DECIMAL(8,2),
    shift_count INTEGER,
    cost_by_position JSONB,
    cost_by_employee JSONB,
    cost_by_day JSONB
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_total_cost DECIMAL(12,2) := 0;
    v_total_hours DECIMAL(8,2) := 0;
    v_shift_count INTEGER := 0;
    v_cost_by_position JSONB;
    v_cost_by_employee JSONB;
    v_cost_by_day JSONB;
BEGIN
    -- Calculate basic totals
    SELECT 
        COALESCE(SUM(s.hours_scheduled * COALESCE(e.hourly_rate, 0)), 0),
        COALESCE(SUM(s.hours_scheduled), 0),
        COUNT(*)
    INTO v_total_cost, v_total_hours, v_shift_count
    FROM shifts s
    JOIN employees e ON s.employee_id = e.employee_id
    WHERE s.date BETWEEN p_start_date AND p_end_date
      AND s.status IN ('completed', 'confirmed')
      AND (p_employee_id IS NULL OR s.employee_id = p_employee_id)
      AND (p_position IS NULL OR s.position = p_position);
    
    -- Cost breakdown by position
    SELECT COALESCE(json_agg(
        json_build_object(
            'position', position,
            'cost', cost,
            'hours', hours,
            'avg_rate', CASE WHEN hours > 0 THEN cost / hours ELSE 0 END
        )
    ), '[]'::jsonb) INTO v_cost_by_position
    FROM (
        SELECT 
            COALESCE(s.position, 'Unassigned') as position,
            SUM(s.hours_scheduled * COALESCE(e.hourly_rate, 0)) as cost,
            SUM(s.hours_scheduled) as hours
        FROM shifts s
        JOIN employees e ON s.employee_id = e.employee_id
        WHERE s.date BETWEEN p_start_date AND p_end_date
          AND s.status IN ('completed', 'confirmed')
          AND (p_employee_id IS NULL OR s.employee_id = p_employee_id)
        GROUP BY s.position
        ORDER BY cost DESC
    ) position_costs;
    
    -- Cost breakdown by employee
    SELECT COALESCE(json_agg(
        json_build_object(
            'employee_id', employee_id,
            'employee_name', employee_name,
            'cost', cost,
            'hours', hours,
            'shifts', shifts
        )
    ), '[]'::jsonb) INTO v_cost_by_employee
    FROM (
        SELECT 
            s.employee_id,
            CONCAT(e.first_name, ' ', e.last_name) as employee_name,
            SUM(s.hours_scheduled * COALESCE(e.hourly_rate, 0)) as cost,
            SUM(s.hours_scheduled) as hours,
            COUNT(*) as shifts
        FROM shifts s
        JOIN employees e ON s.employee_id = e.employee_id
        WHERE s.date BETWEEN p_start_date AND p_end_date
          AND s.status IN ('completed', 'confirmed')
          AND (p_employee_id IS NULL OR s.employee_id = p_employee_id)
          AND (p_position IS NULL OR s.position = p_position)
        GROUP BY s.employee_id, e.first_name, e.last_name
        ORDER BY cost DESC
    ) employee_costs;
    
    -- Cost breakdown by day
    SELECT COALESCE(json_agg(
        json_build_object(
            'date', date,
            'cost', cost,
            'hours', hours,
            'shifts', shifts
        ) ORDER BY date
    ), '[]'::jsonb) INTO v_cost_by_day
    FROM (
        SELECT 
            s.date,
            SUM(s.hours_scheduled * COALESCE(e.hourly_rate, 0)) as cost,
            SUM(s.hours_scheduled) as hours,
            COUNT(*) as shifts
        FROM shifts s
        JOIN employees e ON s.employee_id = e.employee_id
        WHERE s.date BETWEEN p_start_date AND p_end_date
          AND s.status IN ('completed', 'confirmed')
          AND (p_employee_id IS NULL OR s.employee_id = p_employee_id)
          AND (p_position IS NULL OR s.position = p_position)
        GROUP BY s.date
    ) daily_costs;
    
    RETURN QUERY
    SELECT 
        v_total_cost,
        v_total_hours,
        CASE WHEN v_total_hours > 0 THEN v_total_cost / v_total_hours ELSE 0 END,
        v_shift_count,
        v_cost_by_position,
        v_cost_by_employee,
        v_cost_by_day;
END;
$$;

-- Función: Analizar cobertura de turnos
CREATE OR REPLACE FUNCTION scheduling_analyze_coverage(
    p_start_date DATE,
    p_end_date DATE,
    p_position VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE (
    date DATE,
    total_shifts INTEGER,
    total_hours DECIMAL(8,2),
    coverage_by_position JSONB,
    understaffed_periods JSONB,
    overstaffed_periods JSONB
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH daily_coverage AS (
        SELECT 
            s.date,
            COUNT(*) as shift_count,
            SUM(s.hours_scheduled) as total_hours,
            json_agg(
                json_build_object(
                    'position', COALESCE(s.position, 'Unassigned'),
                    'employee_id', s.employee_id,
                    'start_time', s.start_time,
                    'end_time', s.end_time,
                    'hours', s.hours_scheduled
                ) ORDER BY s.start_time
            ) as coverage_details
        FROM shifts s
        WHERE s.date BETWEEN p_start_date AND p_end_date
          AND s.status NOT IN ('cancelled', 'no_show')
          AND (p_position IS NULL OR s.position = p_position)
        GROUP BY s.date
    )
    SELECT 
        dc.date,
        dc.shift_count::INTEGER,
        dc.total_hours,
        dc.coverage_details::JSONB as coverage_by_position,
        '[]'::JSONB as understaffed_periods, -- Placeholder for business logic
        '[]'::JSONB as overstaffed_periods    -- Placeholder for business logic
    FROM daily_coverage dc
    
    UNION ALL
    
    -- Include dates with no shifts
    SELECT 
        d.date,
        0::INTEGER,
        0::DECIMAL(8,2),
        '[]'::JSONB,
        '[{"message": "No shifts scheduled"}]'::JSONB,
        '[]'::JSONB
    FROM generate_series(p_start_date, p_end_date, '1 day'::interval) d(date)
    WHERE NOT EXISTS (
        SELECT 1 FROM shifts s 
        WHERE s.date = d.date::date 
          AND s.status NOT IN ('cancelled', 'no_show')
          AND (p_position IS NULL OR s.position = p_position)
    )
    
    ORDER BY date;
END;
$$;

-- Función: Obtener estadísticas de empleados para scheduling
CREATE OR REPLACE FUNCTION scheduling_get_employee_stats(
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    employee_id VARCHAR(20),
    employee_name TEXT,
    position VARCHAR(100),
    total_shifts INTEGER,
    total_hours DECIMAL(8,2),
    avg_hours_per_shift DECIMAL(8,2),
    attendance_rate DECIMAL(8,2),
    no_show_count INTEGER,
    time_off_days INTEGER,
    availability_score DECIMAL(8,2)
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH employee_shift_stats AS (
        SELECT 
            e.employee_id,
            CONCAT(e.first_name, ' ', e.last_name) as employee_name,
            e.position,
            COUNT(s.id) FILTER (WHERE s.status NOT IN ('cancelled', 'no_show')) as completed_shifts,
            COUNT(s.id) FILTER (WHERE s.status = 'no_show') as no_shows,
            COUNT(s.id) as total_scheduled,
            SUM(s.hours_scheduled) FILTER (WHERE s.status NOT IN ('cancelled', 'no_show')) as completed_hours
        FROM employees e
        LEFT JOIN shifts s ON e.employee_id = s.employee_id 
                           AND s.date BETWEEN p_start_date AND p_end_date
        WHERE e.employment_status = 'active'
        GROUP BY e.employee_id, e.first_name, e.last_name, e.position
    ),
    time_off_stats AS (
        SELECT 
            e.employee_id,
            COALESCE(SUM(tor.days_requested), 0) as time_off_days
        FROM employees e
        LEFT JOIN time_off_requests tor ON e.employee_id = tor.employee_id
                                        AND tor.status = 'approved'
                                        AND tor.start_date <= p_end_date
                                        AND tor.end_date >= p_start_date
        GROUP BY e.employee_id
    )
    SELECT 
        ess.employee_id,
        ess.employee_name,
        ess.position,
        ess.completed_shifts::INTEGER,
        COALESCE(ess.completed_hours, 0)::DECIMAL(8,2),
        CASE WHEN ess.completed_shifts > 0 
             THEN (ess.completed_hours / ess.completed_shifts)::DECIMAL(8,2)
             ELSE 0 END,
        CASE WHEN ess.total_scheduled > 0 
             THEN ((ess.total_scheduled - ess.no_shows) * 100.0 / ess.total_scheduled)::DECIMAL(8,2)
             ELSE 100 END as attendance_rate,
        ess.no_shows::INTEGER,
        tos.time_off_days::INTEGER,
        -- Simple availability score (can be more sophisticated)
        CASE WHEN ess.total_scheduled > 0 
             THEN (75 + (((ess.total_scheduled - ess.no_shows) * 25.0 / ess.total_scheduled)))::DECIMAL(8,2)
             ELSE 100 END as availability_score
    FROM employee_shift_stats ess
    LEFT JOIN time_off_stats tos ON ess.employee_id = tos.employee_id
    ORDER BY ess.employee_name;
END;
$$;

-- Función: Aplicar plantilla de turnos
CREATE OR REPLACE FUNCTION scheduling_apply_template(
    p_template_id UUID,
    p_week_start DATE,
    p_employee_ids VARCHAR(20)[],
    p_created_by VARCHAR(20) DEFAULT NULL
)
RETURNS TABLE (
    shifts_created INTEGER,
    conflicts_found INTEGER,
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_template RECORD;
    v_day_offset INTEGER;
    v_shift_date DATE;
    v_employee_id VARCHAR(20);
    v_conflicts INTEGER := 0;
    v_created INTEGER := 0;
    v_employee_count INTEGER := 0;
BEGIN
    -- Get template
    SELECT * INTO v_template
    FROM shift_templates 
    WHERE id = p_template_id AND is_active = true;
    
    IF v_template.id IS NULL THEN
        RETURN QUERY SELECT 0, 0, false, 'Template not found or inactive';
        RETURN;
    END IF;
    
    -- Loop through days of week in template
    FOREACH v_day_offset IN ARRAY v_template.days_of_week
    LOOP
        v_shift_date := p_week_start + (v_day_offset || ' days')::interval;
        
        -- Loop through employees (up to max_employees)
        v_employee_count := 0;
        FOREACH v_employee_id IN ARRAY p_employee_ids
        LOOP
            EXIT WHEN v_employee_count >= v_template.max_employees;
            
            -- Check for conflicts
            IF EXISTS (
                SELECT 1 FROM scheduling_check_shift_conflicts(
                    v_employee_id, v_shift_date, v_template.start_time, v_template.end_time
                )
            ) THEN
                v_conflicts := v_conflicts + 1;
            ELSE
                -- Create shift
                INSERT INTO shifts (
                    employee_id, date, start_time, end_time, position, 
                    notes, status
                ) VALUES (
                    v_employee_id, v_shift_date, v_template.start_time, 
                    v_template.end_time, v_template.position_id,
                    'Created from template: ' || v_template.name,
                    'scheduled'
                );
                
                v_created := v_created + 1;
            END IF;
            
            v_employee_count := v_employee_count + 1;
        END LOOP;
    END LOOP;
    
    -- Log the template application
    IF p_created_by IS NOT NULL THEN
        INSERT INTO scheduling_audit_log (
            table_name, record_id, action, new_values, changed_by, change_reason
        ) VALUES (
            'shifts', p_template_id, 'INSERT',
            jsonb_build_object(
                'template_applied', v_template.name,
                'shifts_created', v_created,
                'conflicts_found', v_conflicts
            ),
            p_created_by,
            'Applied shift template'
        );
    END IF;
    
    RETURN QUERY SELECT 
        v_created,
        v_conflicts,
        v_created > 0,
        format('Created %s shifts with %s conflicts', v_created, v_conflicts);
END;
$$;

-- TRIGGERS PARA MANTENER DATOS ACTUALIZADOS
-- =========================================

-- Trigger function para updated_at
CREATE OR REPLACE FUNCTION update_scheduling_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para todas las tablas de scheduling
CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduling_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
    BEFORE UPDATE ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduling_updated_at_column();

CREATE TRIGGER update_time_off_requests_updated_at
    BEFORE UPDATE ON time_off_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduling_updated_at_column();

CREATE TRIGGER update_shift_templates_updated_at
    BEFORE UPDATE ON shift_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduling_updated_at_column();

CREATE TRIGGER update_employee_availability_updated_at
    BEFORE UPDATE ON employee_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduling_updated_at_column();

-- Trigger para audit log automático
CREATE OR REPLACE FUNCTION scheduling_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO scheduling_audit_log (
            table_name, record_id, action, new_values
        ) VALUES (
            TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW)::jsonb
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO scheduling_audit_log (
            table_name, record_id, action, old_values, new_values
        ) VALUES (
            TG_TABLE_NAME, NEW.id, 'UPDATE', 
            row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO scheduling_audit_log (
            table_name, record_id, action, old_values
        ) VALUES (
            TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD)::jsonb
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
CREATE TRIGGER shifts_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION scheduling_audit_trigger();

CREATE TRIGGER time_off_requests_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON time_off_requests
    FOR EACH ROW
    EXECUTE FUNCTION scheduling_audit_trigger();

-- DATOS DE EJEMPLO PARA DESARROLLO
-- =================================

DO $$
BEGIN
    -- Insert shift templates if none exist
    IF NOT EXISTS (SELECT 1 FROM shift_templates LIMIT 1) THEN
        INSERT INTO shift_templates (name, position_id, start_time, end_time, days_of_week, max_employees, description) VALUES
        ('Morning Shift - Kitchen', 'Chef', '06:00:00', '14:00:00', ARRAY[1,2,3,4,5], 2, 'Standard morning kitchen shift'),
        ('Evening Shift - Kitchen', 'Chef', '14:00:00', '22:00:00', ARRAY[1,2,3,4,5,6], 3, 'Standard evening kitchen shift'),
        ('Weekend Morning - Service', 'Server', '08:00:00', '16:00:00', ARRAY[0,6], 4, 'Weekend morning service shift'),
        ('Closing Shift', 'All Positions', '18:00:00', '02:00:00', ARRAY[5,6], 2, 'Closing and cleanup shift');
        
        RAISE NOTICE 'Shift templates inserted successfully';
    END IF;

    -- Insert sample scheduling constraints
    IF NOT EXISTS (SELECT 1 FROM scheduling_constraints LIMIT 1) THEN
        INSERT INTO scheduling_constraints (name, constraint_type, constraint_value, applies_to, is_active, priority) VALUES
        ('Maximum 8 hours per day', 'max_hours_per_day', '{"max_hours": 8}', 'all_employees', true, 1),
        ('Maximum 40 hours per week', 'max_hours_per_week', '{"max_hours": 40}', 'all_employees', true, 1),
        ('Minimum 8 hours between shifts', 'min_rest_between_shifts', '{"min_hours": 8}', 'all_employees', true, 2),
        ('Kitchen requires min 2 staff', 'position_required', '{"min_staff": 2, "position": "Chef"}', 'position', true, 3);
        
        RAISE NOTICE 'Scheduling constraints inserted successfully';
    END IF;

    -- Insert sample employee availability (only if employees exist)
    IF EXISTS (SELECT 1 FROM employees WHERE employee_id = 'EMP001') THEN
        INSERT INTO employee_availability (employee_id, day_of_week, start_time, end_time, is_available, notes) VALUES
        ('EMP001', 1, '08:00:00', '18:00:00', true, 'Available Monday mornings and afternoons'),
        ('EMP001', 2, '08:00:00', '18:00:00', true, 'Available Tuesday mornings and afternoons'),
        ('EMP001', 3, '08:00:00', '18:00:00', true, 'Available Wednesday mornings and afternoons'),
        ('EMP001', 4, '08:00:00', '18:00:00', true, 'Available Thursday mornings and afternoons'),
        ('EMP001', 5, '08:00:00', '16:00:00', true, 'Available Friday but shorter hours'),
        ('EMP002', 1, '06:00:00', '22:00:00', true, 'Full availability Monday'),
        ('EMP002', 2, '06:00:00', '22:00:00', true, 'Full availability Tuesday'),
        ('EMP002', 3, '06:00:00', '22:00:00', true, 'Full availability Wednesday'),
        ('EMP002', 4, '06:00:00', '22:00:00', true, 'Full availability Thursday'),
        ('EMP002', 5, '06:00:00', '22:00:00', true, 'Full availability Friday'),
        ('EMP002', 6, '10:00:00', '20:00:00', true, 'Weekend availability Saturday')
        ON CONFLICT (employee_id, day_of_week, start_time, end_time) DO NOTHING;
        
        RAISE NOTICE 'Sample employee availability inserted successfully';
    END IF;

    RAISE NOTICE 'Scheduling system sample data inserted successfully';
END
$$;

-- PERMISOS Y SEGURIDAD
-- ====================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON shifts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON time_off_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON shift_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON employee_availability TO authenticated;
GRANT SELECT ON scheduling_constraints TO authenticated;
GRANT SELECT ON scheduling_audit_log TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION scheduling_check_shift_conflicts(VARCHAR, DATE, TIME, TIME, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION scheduling_calculate_labor_costs(DATE, DATE, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION scheduling_analyze_coverage(DATE, DATE, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION scheduling_get_employee_stats(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION scheduling_apply_template(UUID, DATE, VARCHAR[], VARCHAR) TO authenticated;

-- COMENTARIOS
-- ===========

COMMENT ON TABLE schedules IS 'Programaciones/horarios que contienen múltiples turnos';
COMMENT ON TABLE shifts IS 'Turnos individuales asignados a empleados';
COMMENT ON TABLE time_off_requests IS 'Solicitudes de tiempo libre de los empleados';
COMMENT ON TABLE shift_templates IS 'Plantillas para generar turnos automáticamente';
COMMENT ON TABLE employee_availability IS 'Disponibilidad de empleados por día de la semana';
COMMENT ON TABLE scheduling_constraints IS 'Restricciones y reglas para la programación de turnos';
COMMENT ON TABLE scheduling_audit_log IS 'Log de cambios en el sistema de scheduling';

COMMENT ON FUNCTION scheduling_check_shift_conflicts(VARCHAR, DATE, TIME, TIME, UUID) IS 'Verifica conflictos de turnos antes de crear/modificar';
COMMENT ON FUNCTION scheduling_calculate_labor_costs(DATE, DATE, VARCHAR, VARCHAR) IS 'Calcula costos laborales para un período específico';
COMMENT ON FUNCTION scheduling_analyze_coverage(DATE, DATE, VARCHAR) IS 'Analiza la cobertura de turnos por día y posición';
COMMENT ON FUNCTION scheduling_get_employee_stats(DATE, DATE) IS 'Obtiene estadísticas de empleados para scheduling';
COMMENT ON FUNCTION scheduling_apply_template(UUID, DATE, VARCHAR[], VARCHAR) IS 'Aplica una plantilla para crear turnos automáticamente';

-- =========================================
-- FIN: Scheduling System
-- =========================================