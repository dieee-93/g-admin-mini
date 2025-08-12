-- =========================================
-- Table Management - Missing Pieces Only
-- Fase 2: Solo las piezas faltantes específicas
-- =========================================

-- IMPORTANTE: La mayoría del sistema de mesas YA EXISTE en el schema actual
-- Este script solo agrega las piezas específicas que faltan:
-- 1. Tabla reservations
-- 2. Tabla sections  
-- 3. 2 funciones RPC faltantes

-- TABLAS FALTANTES
-- ================

-- Tabla de secciones para organizar mesas
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INTEGER DEFAULT 0, -- Total capacity of all tables in section
    table_count INTEGER DEFAULT 0, -- Number of tables in section
    is_active BOOLEAN DEFAULT true,
    manager_id UUID, -- Reference to employees.employee_id if exists
    section_type VARCHAR(50) CHECK (section_type IN (
        'dining_room', 'bar', 'patio', 'private_dining', 'terrace', 'vip', 'fast_casual'
    )) DEFAULT 'dining_room',
    
    -- Visual/Layout properties
    color_theme VARCHAR(7) DEFAULT '#6366f1', -- Hex color
    layout_position JSONB DEFAULT '{}', -- {"x": 0, "y": 0, "width": 100, "height": 100}
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de reservas (la más importante que falta)
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic reservation info
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- Customer info (can exist without customer_id)
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    
    -- Reservation details
    party_size INTEGER NOT NULL CHECK (party_size >= 1 AND party_size <= 20),
    reservation_time TIMESTAMPTZ NOT NULL,
    estimated_duration INTEGER DEFAULT 90, -- minutes
    
    -- Status and tracking
    status VARCHAR(20) CHECK (status IN (
        'confirmed', 'seated', 'no_show', 'cancelled', 'completed'
    )) DEFAULT 'confirmed',
    
    -- Special requirements
    special_requests TEXT[],
    dietary_restrictions TEXT[],
    celebration_type VARCHAR(50), -- birthday, anniversary, etc.
    is_vip BOOLEAN DEFAULT false,
    
    -- Operational
    check_in_time TIMESTAMPTZ,
    seated_time TIMESTAMPTZ,
    completed_time TIMESTAMPTZ,
    no_show_time TIMESTAMPTZ,
    
    -- Notes and follow-up
    reservation_notes TEXT,
    staff_notes TEXT,
    created_by UUID, -- staff member who created reservation
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_reservation_time CHECK (reservation_time > created_at),
    CONSTRAINT valid_party_size_for_table CHECK (
        table_id IS NULL OR 
        party_size <= (SELECT capacity FROM tables WHERE id = table_id)
    )
);

-- ÍNDICES PARA PERFORMANCE
-- ========================

-- Sections
CREATE INDEX IF NOT EXISTS idx_sections_active ON sections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sections_type ON sections(section_type);

-- Reservations
CREATE INDEX IF NOT EXISTS idx_reservations_time ON reservations(reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_table ON reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(DATE(reservation_time));
CREATE INDEX IF NOT EXISTS idx_reservations_today ON reservations(reservation_time) 
    WHERE DATE(reservation_time) = CURRENT_DATE;

-- FUNCIONES RPC FALTANTES
-- =======================

-- Función: Estadísticas de rendimiento del personal de servicio
CREATE OR REPLACE FUNCTION get_server_performance_analytics(
    date_from DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
    date_to DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    staff_member_id UUID,
    staff_member_name TEXT,
    total_parties_served INTEGER,
    total_tables_served INTEGER,
    avg_service_time_minutes DECIMAL(8,2),
    total_revenue_served DECIMAL(12,2),
    avg_customer_satisfaction DECIMAL(5,2),
    service_events_count INTEGER,
    efficiency_score DECIMAL(5,2),
    top_service_types JSONB,
    peak_performance_hours JSONB
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH staff_service_events AS (
        SELECT 
            se.staff_member_id,
            se.staff_member_name,
            se.party_id,
            se.type,
            se.timestamp,
            se.duration_minutes,
            se.customer_satisfaction,
            p.table_id,
            p.total_spent
        FROM service_events se
        JOIN parties p ON se.party_id = p.id
        WHERE se.timestamp::date BETWEEN date_from AND date_to
          AND se.staff_member_id IS NOT NULL
    ),
    staff_aggregates AS (
        SELECT 
            sse.staff_member_id,
            sse.staff_member_name,
            COUNT(DISTINCT sse.party_id) as parties_served,
            COUNT(DISTINCT sse.table_id) as tables_served,
            AVG(sse.duration_minutes) as avg_service_time,
            SUM(sse.total_spent) as total_revenue,
            AVG(sse.customer_satisfaction) as avg_satisfaction,
            COUNT(*) as service_events_count,
            -- Calculate efficiency score (events per hour worked)
            CASE WHEN SUM(sse.duration_minutes) > 0 
                 THEN (COUNT(*) * 60.0 / SUM(sse.duration_minutes))
                 ELSE 0 END as efficiency_score
        FROM staff_service_events sse
        GROUP BY sse.staff_member_id, sse.staff_member_name
    ),
    staff_service_types AS (
        SELECT 
            sse.staff_member_id,
            json_agg(
                json_build_object(
                    'service_type', sse.type,
                    'count', type_count,
                    'avg_duration', avg_duration
                ) ORDER BY type_count DESC
            ) as top_service_types
        FROM staff_service_events sse
        JOIN (
            SELECT 
                staff_member_id,
                type,
                COUNT(*) as type_count,
                AVG(duration_minutes) as avg_duration
            FROM staff_service_events
            GROUP BY staff_member_id, type
        ) type_stats ON sse.staff_member_id = type_stats.staff_member_id 
                     AND sse.type = type_stats.type
        GROUP BY sse.staff_member_id
    ),
    staff_peak_hours AS (
        SELECT 
            sse.staff_member_id,
            json_agg(
                json_build_object(
                    'hour', hour_of_day,
                    'events_count', events_in_hour,
                    'avg_satisfaction', avg_satisfaction_in_hour
                ) ORDER BY events_in_hour DESC
            ) as peak_performance_hours
        FROM staff_service_events sse
        JOIN (
            SELECT 
                staff_member_id,
                EXTRACT(HOUR FROM timestamp) as hour_of_day,
                COUNT(*) as events_in_hour,
                AVG(customer_satisfaction) as avg_satisfaction_in_hour
            FROM staff_service_events
            GROUP BY staff_member_id, EXTRACT(HOUR FROM timestamp)
        ) hour_stats ON sse.staff_member_id = hour_stats.staff_member_id
        GROUP BY sse.staff_member_id
    )
    SELECT 
        sa.staff_member_id,
        sa.staff_member_name,
        sa.parties_served::INTEGER,
        sa.tables_served::INTEGER,
        sa.avg_service_time::DECIMAL(8,2),
        COALESCE(sa.total_revenue, 0)::DECIMAL(12,2),
        COALESCE(sa.avg_satisfaction, 0)::DECIMAL(5,2),
        sa.service_events_count::INTEGER,
        sa.efficiency_score::DECIMAL(5,2),
        COALESCE(sst.top_service_types, '[]'::json)::JSONB,
        COALESCE(sph.peak_performance_hours, '[]'::json)::JSONB
    FROM staff_aggregates sa
    LEFT JOIN staff_service_types sst ON sa.staff_member_id = sst.staff_member_id
    LEFT JOIN staff_peak_hours sph ON sa.staff_member_id = sph.staff_member_id
    ORDER BY sa.total_revenue DESC, sa.avg_satisfaction DESC;
END;
$$;

-- Función: Estadísticas de rotación de mesas específicas
CREATE OR REPLACE FUNCTION get_table_turnover_stats(
    table_id UUID DEFAULT NULL,
    date_from DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
    date_to DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    table_id_result UUID,
    table_number VARCHAR,
    section_name TEXT,
    total_parties INTEGER,
    total_revenue DECIMAL(12,2),
    avg_turn_time_minutes DECIMAL(8,2),
    fastest_turn_minutes INTEGER,
    slowest_turn_minutes INTEGER,
    utilization_rate_percent DECIMAL(5,2),
    revenue_per_hour DECIMAL(10,2),
    peak_times JSONB,
    avg_party_size DECIMAL(3,1),
    customer_satisfaction DECIMAL(5,2),
    efficiency_rating VARCHAR(20)
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH table_parties AS (
        SELECT 
            t.id as table_id,
            t.number as table_number,
            s.name as section_name,
            p.id as party_id,
            p.size as party_size,
            p.seated_at,
            p.actual_duration,
            p.total_spent,
            p.satisfaction_score,
            EXTRACT(HOUR FROM p.seated_at) as seated_hour,
            EXTRACT(DOW FROM p.seated_at) as day_of_week
        FROM tables t
        LEFT JOIN sections s ON t.section_id = s.id
        LEFT JOIN parties p ON t.id = p.table_id
        WHERE p.seated_at::date BETWEEN date_from AND date_to
          AND p.status = 'completed'
          AND (get_table_turnover_stats.table_id IS NULL OR t.id = get_table_turnover_stats.table_id)
    ),
    table_aggregates AS (
        SELECT 
            tp.table_id,
            tp.table_number,
            tp.section_name,
            COUNT(tp.party_id) as party_count,
            SUM(tp.total_spent) as total_revenue,
            AVG(tp.actual_duration) as avg_turn_time,
            MIN(tp.actual_duration) as fastest_turn,
            MAX(tp.actual_duration) as slowest_turn,
            AVG(tp.party_size) as avg_party_size,
            AVG(tp.satisfaction_score) as avg_satisfaction
        FROM table_parties tp
        WHERE tp.party_id IS NOT NULL
        GROUP BY tp.table_id, tp.table_number, tp.section_name
    ),
    peak_time_analysis AS (
        SELECT 
            tp.table_id,
            json_agg(
                json_build_object(
                    'hour', tp.seated_hour,
                    'day_of_week', tp.day_of_week,
                    'parties_count', hour_parties,
                    'avg_revenue', avg_revenue_hour
                ) ORDER BY hour_parties DESC
            ) as peak_times_data
        FROM table_parties tp
        JOIN (
            SELECT 
                table_id,
                seated_hour,
                day_of_week,
                COUNT(*) as hour_parties,
                AVG(total_spent) as avg_revenue_hour
            FROM table_parties
            WHERE party_id IS NOT NULL
            GROUP BY table_id, seated_hour, day_of_week
        ) hourly_stats ON tp.table_id = hourly_stats.table_id 
                       AND tp.seated_hour = hourly_stats.seated_hour
                       AND tp.day_of_week = hourly_stats.day_of_week
        GROUP BY tp.table_id
    )
    SELECT 
        ta.table_id,
        ta.table_number,
        COALESCE(ta.section_name, 'No Section') as section_name,
        COALESCE(ta.party_count, 0)::INTEGER,
        COALESCE(ta.total_revenue, 0)::DECIMAL(12,2),
        COALESCE(ta.avg_turn_time, 0)::DECIMAL(8,2),
        COALESCE(ta.fastest_turn, 0)::INTEGER,
        COALESCE(ta.slowest_turn, 0)::INTEGER,
        -- Calculate utilization rate (simplified)
        CASE WHEN ta.party_count > 0 
             THEN LEAST(100, (ta.party_count * ta.avg_turn_time / (24 * 60)) * 100)
             ELSE 0 END::DECIMAL(5,2),
        -- Revenue per hour (total revenue / operating hours estimate)
        CASE WHEN ta.party_count > 0 
             THEN (ta.total_revenue / GREATEST(1, ta.party_count * ta.avg_turn_time / 60))
             ELSE 0 END::DECIMAL(10,2),
        COALESCE(pta.peak_times_data, '[]'::json)::JSONB,
        COALESCE(ta.avg_party_size, 0)::DECIMAL(3,1),
        COALESCE(ta.avg_satisfaction, 0)::DECIMAL(5,2),
        -- Efficiency rating based on multiple factors
        CASE 
            WHEN ta.party_count IS NULL OR ta.party_count = 0 THEN 'Not Active'
            WHEN ta.avg_turn_time <= 60 AND ta.avg_satisfaction >= 8 THEN 'Excellent'
            WHEN ta.avg_turn_time <= 90 AND ta.avg_satisfaction >= 7 THEN 'Good'
            WHEN ta.avg_turn_time <= 120 AND ta.avg_satisfaction >= 6 THEN 'Average'
            WHEN ta.avg_turn_time > 120 OR ta.avg_satisfaction < 6 THEN 'Needs Improvement'
            ELSE 'Unknown'
        END as efficiency_rating
    FROM (
        -- Get all tables, even those without parties in the date range
        SELECT DISTINCT 
            t.id as table_id,
            t.number as table_number,
            s.name as section_name
        FROM tables t
        LEFT JOIN sections s ON t.section_id = s.id
        WHERE t.is_active = true
          AND (get_table_turnover_stats.table_id IS NULL OR t.id = get_table_turnover_stats.table_id)
    ) all_tables
    LEFT JOIN table_aggregates ta ON all_tables.table_id = ta.table_id
    LEFT JOIN peak_time_analysis pta ON all_tables.table_id = pta.table_id
    ORDER BY ta.total_revenue DESC NULLS LAST, ta.party_count DESC NULLS LAST;
END;
$$;

-- TRIGGERS PARA MANTENER DATOS ACTUALIZADOS
-- =========================================

-- Trigger function para updated_at
CREATE OR REPLACE FUNCTION update_table_management_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para las nuevas tablas
CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON sections
    FOR EACH ROW
    EXECUTE FUNCTION update_table_management_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_table_management_updated_at_column();

-- Trigger para actualizar contadores en sections cuando se agregan/quitan mesas
CREATE OR REPLACE FUNCTION update_section_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update counters for new section
        IF NEW.section_id IS NOT NULL THEN
            UPDATE sections 
            SET 
                table_count = (
                    SELECT COUNT(*) FROM tables 
                    WHERE section_id = NEW.section_id AND is_active = true
                ),
                capacity = (
                    SELECT COALESCE(SUM(capacity), 0) FROM tables 
                    WHERE section_id = NEW.section_id AND is_active = true
                )
            WHERE id = NEW.section_id;
        END IF;
        
        -- Update counters for old section (if changed)
        IF TG_OP = 'UPDATE' AND OLD.section_id IS NOT NULL AND OLD.section_id != NEW.section_id THEN
            UPDATE sections 
            SET 
                table_count = (
                    SELECT COUNT(*) FROM tables 
                    WHERE section_id = OLD.section_id AND is_active = true
                ),
                capacity = (
                    SELECT COALESCE(SUM(capacity), 0) FROM tables 
                    WHERE section_id = OLD.section_id AND is_active = true
                )
            WHERE id = OLD.section_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update counters for deleted table's section
        IF OLD.section_id IS NOT NULL THEN
            UPDATE sections 
            SET 
                table_count = (
                    SELECT COUNT(*) FROM tables 
                    WHERE section_id = OLD.section_id AND is_active = true
                ),
                capacity = (
                    SELECT COALESCE(SUM(capacity), 0) FROM tables 
                    WHERE section_id = OLD.section_id AND is_active = true
                )
            WHERE id = OLD.section_id;
        END IF;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables (assuming tables table exists)
CREATE TRIGGER tables_section_counter_trigger
    AFTER INSERT OR UPDATE OF section_id OR DELETE ON tables
    FOR EACH ROW
    EXECUTE FUNCTION update_section_counters();

-- DATOS DE EJEMPLO PARA DESARROLLO
-- =================================

DO $$
BEGIN
    -- Insert sample sections if none exist
    IF NOT EXISTS (SELECT 1 FROM sections LIMIT 1) THEN
        INSERT INTO sections (name, description, section_type, color_theme, layout_position) VALUES
        ('Comedor Principal', 'Área principal del restaurante', 'dining_room', '#3b82f6', '{"x": 0, "y": 0, "width": 60, "height": 80}'),
        ('Bar', 'Área de bar y bebidas', 'bar', '#f59e0b', '{"x": 60, "y": 0, "width": 40, "height": 30}'),
        ('Terraza', 'Área exterior con vista', 'patio', '#10b981', '{"x": 0, "y": 80, "width": 100, "height": 20}'),
        ('Área VIP', 'Reservado para clientes VIP', 'vip', '#8b5cf6', '{"x": 60, "y": 30, "width": 40, "height": 50}');
        
        RAISE NOTICE 'Sample sections inserted successfully';
    END IF;

    -- Insert sample reservations if customers exist
    IF EXISTS (SELECT 1 FROM customers LIMIT 1) AND NOT EXISTS (SELECT 1 FROM reservations LIMIT 1) THEN
        -- Get first customer and table for sample reservation
        INSERT INTO reservations (
            customer_name, customer_phone, party_size, reservation_time, 
            special_requests, status, reservation_notes
        ) VALUES 
        ('María García', '+52 55 1234-5678', 4, NOW() + INTERVAL '2 hours', 
         ARRAY['Mesa cerca de ventana', 'Cumpleaños'], 'confirmed', 'Celebración de cumpleaños'),
        ('Carlos Mendoza', '+52 55 8765-4321', 2, NOW() + INTERVAL '1 day', 
         ARRAY['Mesa tranquila'], 'confirmed', 'Cena romántica'),
        ('Ana López', '+52 55 9999-1111', 6, NOW() + INTERVAL '3 hours', 
         ARRAY['Mesa grande', 'Acceso para silla de ruedas'], 'confirmed', 'Reunión familiar');
         
        RAISE NOTICE 'Sample reservations inserted successfully';
    END IF;

    RAISE NOTICE 'Table management missing pieces setup completed successfully';
END
$$;

-- PERMISOS Y SEGURIDAD
-- ====================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON sections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON reservations TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_server_performance_analytics(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_turnover_stats(UUID, DATE, DATE) TO authenticated;

-- COMENTARIOS
-- ===========

COMMENT ON TABLE sections IS 'Secciones para organizar mesas del restaurante';
COMMENT ON TABLE reservations IS 'Sistema de reservas de mesas';

COMMENT ON FUNCTION get_server_performance_analytics(DATE, DATE) IS 'Análisis de rendimiento del personal de servicio';
COMMENT ON FUNCTION get_table_turnover_stats(UUID, DATE, DATE) IS 'Estadísticas detalladas de rotación de mesas';

-- =========================================
-- FIN: Table Management Missing Pieces
-- =========================================