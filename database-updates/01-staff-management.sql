-- =========================================
-- Staff Management System - Database Implementation
-- Fase 1: Crítico
-- =========================================

-- TABLAS PRINCIPALES
-- ==================

-- Tabla principal de empleados
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    avatar_url TEXT,
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    employment_status VARCHAR(20) CHECK (employment_status IN ('active', 'inactive', 'terminated')) DEFAULT 'active',
    employment_type VARCHAR(20) CHECK (employment_type IN ('full_time', 'part_time', 'contractor')) DEFAULT 'full_time',
    role VARCHAR(50) CHECK (role IN ('admin', 'hr', 'manager', 'supervisor', 'employee')) DEFAULT 'employee',
    permissions TEXT[] DEFAULT '{}', -- Array de permisos
    salary DECIMAL(10,2),
    hourly_rate DECIMAL(8,2),
    social_security VARCHAR(50), -- Encrypted in production
    availability JSONB, -- Horarios disponibles
    performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
    goals_completed INTEGER DEFAULT 0,
    total_goals INTEGER DEFAULT 0,
    certifications TEXT[] DEFAULT '{}',
    training_completed INTEGER DEFAULT 0,
    training_hours DECIMAL(8,2) DEFAULT 0,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Métricas de desempeño
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id),
    period VARCHAR(20) CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
    score INTEGER CHECK (score >= 0 AND score <= 100) NOT NULL,
    productivity INTEGER CHECK (productivity >= 0 AND productivity <= 100) NOT NULL,
    quality INTEGER CHECK (quality >= 0 AND quality <= 100) NOT NULL,
    attendance INTEGER CHECK (attendance >= 0 AND attendance <= 100) NOT NULL,
    goals_met INTEGER DEFAULT 0,
    total_goals INTEGER DEFAULT 0,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Registros de entrenamiento
CREATE TABLE IF NOT EXISTS training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id),
    course_name VARCHAR(255) NOT NULL,
    course_type VARCHAR(50) CHECK (course_type IN ('safety', 'skills', 'leadership', 'compliance')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('enrolled', 'in_progress', 'completed', 'failed')) DEFAULT 'enrolled',
    start_date DATE,
    completion_date DATE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    certificate_url TEXT,
    hours DECIMAL(8,2) DEFAULT 0,
    instructor VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ÍNDICES PARA PERFORMANCE
-- ========================

CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_employee ON performance_metrics(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_period ON performance_metrics(period, created_at);
CREATE INDEX IF NOT EXISTS idx_training_records_employee ON training_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_records_status ON training_records(status);

-- FUNCIONES RPC PARA SUPABASE
-- ===========================

-- Función: Obtener perfil completo de empleado
CREATE OR REPLACE FUNCTION staff_get_employee_profile(p_employee_id TEXT)
RETURNS TABLE (
    id UUID,
    employee_id VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name TEXT,
    email VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    employment_status VARCHAR(20),
    employment_type VARCHAR(20),
    role VARCHAR(50),
    permissions TEXT[],
    salary DECIMAL(10,2),
    hourly_rate DECIMAL(8,2),
    social_security_masked TEXT,
    availability JSONB,
    performance_score INTEGER,
    goals_completed INTEGER,
    total_goals INTEGER,
    certifications TEXT[],
    training_completed INTEGER,
    training_hours DECIMAL(8,2),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.employee_id,
        e.first_name,
        e.last_name,
        CONCAT(e.first_name, ' ', e.last_name) as full_name,
        e.email,
        e.phone,
        e.avatar_url,
        e.position,
        e.department,
        e.hire_date,
        e.employment_status,
        e.employment_type,
        e.role,
        e.permissions,
        e.salary,
        e.hourly_rate,
        CASE 
            WHEN e.social_security IS NOT NULL THEN 
                CONCAT('***-**-', RIGHT(e.social_security, 4))
            ELSE NULL 
        END as social_security_masked,
        e.availability,
        e.performance_score,
        e.goals_completed,
        e.total_goals,
        e.certifications,
        e.training_completed,
        e.training_hours,
        e.last_login,
        e.created_at,
        e.updated_at
    FROM employees e
    WHERE e.employee_id = p_employee_id 
       OR e.id::text = p_employee_id;
END;
$$;

-- Función: Actualizar métricas de desempeño
CREATE OR REPLACE FUNCTION staff_update_performance_metrics(
    p_employee_id TEXT,
    p_period VARCHAR(20) DEFAULT 'monthly',
    p_score INTEGER DEFAULT NULL,
    p_productivity INTEGER DEFAULT NULL,
    p_quality INTEGER DEFAULT NULL,
    p_attendance INTEGER DEFAULT NULL,
    p_goals_met INTEGER DEFAULT NULL,
    p_total_goals INTEGER DEFAULT NULL,
    p_feedback TEXT DEFAULT NULL,
    p_updated_by TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    employee_id VARCHAR(20),
    period VARCHAR(20),
    score INTEGER,
    productivity INTEGER,
    quality INTEGER,
    attendance INTEGER,
    goals_met INTEGER,
    total_goals INTEGER,
    feedback TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_metric_id UUID;
BEGIN
    -- Insert or update performance metrics
    INSERT INTO performance_metrics (
        employee_id, period, score, productivity, quality, 
        attendance, goals_met, total_goals, feedback, updated_at
    )
    VALUES (
        p_employee_id, p_period, 
        COALESCE(p_score, 75),
        COALESCE(p_productivity, 75),
        COALESCE(p_quality, 75),
        COALESCE(p_attendance, 100),
        COALESCE(p_goals_met, 0),
        COALESCE(p_total_goals, 0),
        p_feedback,
        NOW()
    )
    ON CONFLICT (employee_id, period, date_trunc('month', created_at))
    DO UPDATE SET
        score = COALESCE(EXCLUDED.score, performance_metrics.score),
        productivity = COALESCE(EXCLUDED.productivity, performance_metrics.productivity),
        quality = COALESCE(EXCLUDED.quality, performance_metrics.quality),
        attendance = COALESCE(EXCLUDED.attendance, performance_metrics.attendance),
        goals_met = COALESCE(EXCLUDED.goals_met, performance_metrics.goals_met),
        total_goals = COALESCE(EXCLUDED.total_goals, performance_metrics.total_goals),
        feedback = COALESCE(EXCLUDED.feedback, performance_metrics.feedback),
        updated_at = NOW()
    RETURNING performance_metrics.id INTO v_metric_id;

    -- Update employee performance score
    UPDATE employees 
    SET 
        performance_score = COALESCE(p_score, performance_score),
        goals_completed = COALESCE(p_goals_met, goals_completed),
        total_goals = COALESCE(p_total_goals, total_goals),
        updated_at = NOW()
    WHERE employee_id = p_employee_id;

    -- Return updated metrics
    RETURN QUERY
    SELECT 
        pm.id,
        pm.employee_id,
        pm.period,
        pm.score,
        pm.productivity,
        pm.quality,
        pm.attendance,
        pm.goals_met,
        pm.total_goals,
        pm.feedback,
        pm.created_at,
        pm.updated_at
    FROM performance_metrics pm
    WHERE pm.id = v_metric_id;
END;
$$;

-- Función: Obtener registros de entrenamiento
CREATE OR REPLACE FUNCTION staff_get_training_records(
    p_employee_ids TEXT[] DEFAULT NULL,
    p_status VARCHAR(20) DEFAULT NULL,
    p_course_type VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    employee_id VARCHAR(20),
    employee_name TEXT,
    course_name VARCHAR(255),
    course_type VARCHAR(50),
    status VARCHAR(20),
    start_date DATE,
    completion_date DATE,
    score INTEGER,
    certificate_url TEXT,
    hours DECIMAL(8,2),
    instructor VARCHAR(255),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tr.id,
        tr.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        tr.course_name,
        tr.course_type,
        tr.status,
        tr.start_date,
        tr.completion_date,
        tr.score,
        tr.certificate_url,
        tr.hours,
        tr.instructor,
        tr.created_at,
        tr.updated_at
    FROM training_records tr
    JOIN employees e ON tr.employee_id = e.employee_id
    WHERE (p_employee_ids IS NULL OR tr.employee_id = ANY(p_employee_ids))
      AND (p_status IS NULL OR tr.status = p_status)
      AND (p_course_type IS NULL OR tr.course_type = p_course_type)
    ORDER BY tr.created_at DESC;
END;
$$;

-- Función: Calcular productividad
CREATE OR REPLACE FUNCTION staff_calculate_productivity(p_employee_id TEXT)
RETURNS DECIMAL(8,2)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_base_score INTEGER;
    v_goals_ratio DECIMAL;
    v_attendance_avg DECIMAL;
    v_training_bonus DECIMAL;
    v_final_productivity DECIMAL;
BEGIN
    -- Get employee base performance score
    SELECT performance_score, 
           CASE WHEN total_goals > 0 THEN goals_completed::decimal / total_goals ELSE 0 END
    INTO v_base_score, v_goals_ratio
    FROM employees 
    WHERE employee_id = p_employee_id;
    
    -- Get average attendance from recent performance metrics
    SELECT COALESCE(AVG(attendance), 100)
    INTO v_attendance_avg
    FROM performance_metrics
    WHERE employee_id = p_employee_id
      AND created_at >= NOW() - INTERVAL '3 months';
    
    -- Calculate training bonus (completed trainings in last 6 months)
    SELECT COALESCE(COUNT(*) * 2, 0)
    INTO v_training_bonus
    FROM training_records
    WHERE employee_id = p_employee_id
      AND status = 'completed'
      AND completion_date >= NOW() - INTERVAL '6 months';
    
    -- Calculate final productivity
    v_final_productivity := COALESCE(v_base_score, 75) 
                          + (v_goals_ratio * 15) 
                          + (v_attendance_avg - 100) * 0.1
                          + v_training_bonus;
    
    -- Cap at 100
    v_final_productivity := LEAST(100, v_final_productivity);
    
    RETURN v_final_productivity;
END;
$$;

-- Función: Estadísticas generales del staff
CREATE OR REPLACE FUNCTION staff_get_dashboard_stats()
RETURNS TABLE (
    total_employees INTEGER,
    active_employees INTEGER,
    on_shift INTEGER,
    avg_performance DECIMAL(8,2),
    pending_reviews INTEGER,
    training_due INTEGER,
    new_hires_this_month INTEGER,
    turnover_rate DECIMAL(8,2)
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_start_of_month DATE;
BEGIN
    v_start_of_month := DATE_TRUNC('month', CURRENT_DATE);
    
    RETURN QUERY
    WITH staff_stats AS (
        SELECT 
            COUNT(*) as total_emp,
            COUNT(*) FILTER (WHERE employment_status = 'active') as active_emp,
            COUNT(*) FILTER (WHERE hire_date >= v_start_of_month) as new_hires,
            AVG(performance_score) as avg_perf
        FROM employees
    ),
    training_stats AS (
        SELECT 
            COUNT(*) FILTER (WHERE status = 'enrolled' OR status = 'in_progress') as training_due_count
        FROM training_records
    )
    SELECT 
        s.total_emp::INTEGER,
        s.active_emp::INTEGER,
        GREATEST(1, s.active_emp / 3)::INTEGER as on_shift, -- Mock: 1/3 of active employees
        COALESCE(s.avg_perf, 75.0)::DECIMAL(8,2),
        3::INTEGER as pending_reviews, -- Mock value
        COALESCE(t.training_due_count, 0)::INTEGER,
        s.new_hires::INTEGER,
        8.3::DECIMAL(8,2) as turnover_rate -- Mock value
    FROM staff_stats s
    CROSS JOIN training_stats t;
END;
$$;

-- TRIGGERS PARA MANTENER DATOS ACTUALIZADOS
-- =========================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at
    BEFORE UPDATE ON performance_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_records_updated_at
    BEFORE UPDATE ON training_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- DATOS DE EJEMPLO PARA DESARROLLO
-- =================================

-- Solo insertar si no hay datos existentes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM employees LIMIT 1) THEN
        INSERT INTO employees (
            employee_id, first_name, last_name, email, phone, position, department,
            hire_date, employment_status, employment_type, role, permissions,
            salary, performance_score, goals_completed, total_goals, certifications,
            training_completed, training_hours, last_login
        ) VALUES 
        (
            'EMP001', 'Ana', 'García', 'ana.garcia@restaurant.com', '+1234567890',
            'Gerente General', 'Administración', '2023-01-15', 'active', 'full_time',
            'manager', ARRAY['staff:manage', 'performance:read', 'training:write'],
            75000, 95, 8, 10, ARRAY['Food Safety', 'Leadership'],
            12, 48, '2024-01-08T14:30:00Z'
        ),
        (
            'EMP002', 'Carlos', 'Rodriguez', 'carlos.rodriguez@restaurant.com', '+1234567891',
            'Chef Principal', 'Cocina', '2023-03-01', 'active', 'full_time',
            'supervisor', ARRAY['staff:read', 'performance:read', 'training:read'],
            NULL, 88, 7, 9, ARRAY['Food Safety', 'Kitchen Management'],
            8, 32, '2024-01-08T12:15:00Z'
        );
        
        -- Update hourly rate for Chef
        UPDATE employees SET hourly_rate = 28.50 WHERE employee_id = 'EMP002';
        
        -- Insert performance metrics
        INSERT INTO performance_metrics (employee_id, period, score, productivity, quality, attendance, goals_met, total_goals, feedback)
        VALUES 
        ('EMP001', 'monthly', 95, 98, 92, 100, 8, 10, 'Excelente liderazgo y gestión del equipo.'),
        ('EMP002', 'monthly', 88, 90, 95, 96, 7, 9, 'Consistente en calidad de cocina.');
        
        -- Insert training records
        INSERT INTO training_records (employee_id, course_name, course_type, status, start_date, completion_date, score, certificate_url, hours, instructor)
        VALUES 
        ('EMP001', 'Liderazgo y Gestión de Equipos', 'leadership', 'completed', '2023-11-01', '2023-11-15', 95, '/certificates/emp001-leadership.pdf', 16, 'Dr. María González'),
        ('EMP002', 'Gestión de Cocina Profesional', 'skills', 'completed', '2023-09-15', '2023-10-15', 88, NULL, 24, 'Chef Andrea López');
        
        RAISE NOTICE 'Staff management sample data inserted successfully';
    END IF;
END
$$;

-- PERMISOS Y SEGURIDAD
-- ====================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON employees TO authenticated;
GRANT SELECT, INSERT, UPDATE ON performance_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON training_records TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION staff_get_employee_profile(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION staff_update_performance_metrics(TEXT, VARCHAR, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION staff_get_training_records(TEXT[], VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION staff_calculate_productivity(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION staff_get_dashboard_stats() TO authenticated;

-- COMENTARIOS
-- ===========

COMMENT ON TABLE employees IS 'Tabla principal de empleados con información completa y segura';
COMMENT ON TABLE performance_metrics IS 'Métricas de desempeño por empleado y período';
COMMENT ON TABLE training_records IS 'Registro de entrenamientos y certificaciones';

COMMENT ON FUNCTION staff_get_employee_profile(TEXT) IS 'Obtiene el perfil completo de un empleado con datos enmascarados';
COMMENT ON FUNCTION staff_update_performance_metrics(TEXT, VARCHAR, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, TEXT) IS 'Actualiza las métricas de desempeño de un empleado';
COMMENT ON FUNCTION staff_get_training_records(TEXT[], VARCHAR, VARCHAR) IS 'Obtiene registros de entrenamiento con filtros opcionales';
COMMENT ON FUNCTION staff_calculate_productivity(TEXT) IS 'Calcula la productividad basada en múltiples factores';
COMMENT ON FUNCTION staff_get_dashboard_stats() IS 'Obtiene estadísticas generales para el dashboard de staff';

-- =========================================
-- FIN: Staff Management System
-- =========================================