-- Migraciones para el Sistema de Evolución y Logros
-- Fecha: 2025-09-16
-- Descripción: Tablas para manejar hitos fundacionales y progreso de capacidades

-- =====================================================
-- Tabla: capability_milestones
-- Propósito: Mapea capacidades a sus hitos fundacionales requeridos
-- =====================================================
CREATE TABLE IF NOT EXISTS capability_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capability_id VARCHAR(100) NOT NULL,
    milestone_id VARCHAR(100) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(capability_id, milestone_id),
    CHECK (length(capability_id) > 0),
    CHECK (length(milestone_id) > 0),
    CHECK ("order" >= 0)
);

-- =====================================================
-- Tabla: user_achievement_progress
-- Propósito: Rastrea el progreso individual de cada usuario en los hitos
-- =====================================================
CREATE TABLE IF NOT EXISTS user_achievement_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    capability_id VARCHAR(100) NOT NULL,
    milestone_id VARCHAR(100) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, capability_id, milestone_id),
    CHECK (length(capability_id) > 0),
    CHECK (length(milestone_id) > 0),
    CHECK ((completed = false) OR (completed = true AND completed_at IS NOT NULL))
);

-- =====================================================
-- Tabla: milestone_definitions
-- Propósito: Catálogo maestro de todos los hitos disponibles
-- =====================================================
CREATE TABLE IF NOT EXISTS milestone_definitions (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    event_pattern VARCHAR(200) NOT NULL,
    redirect_url VARCHAR(500) NULL,
    icon VARCHAR(50) NOT NULL DEFAULT '🎯',
    estimated_minutes INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CHECK (length(name) > 0),
    CHECK (length(description) > 0),
    CHECK (estimated_minutes > 0)
);

-- =====================================================
-- Índices para optimización de consultas
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_capability_milestones_capability_id 
    ON capability_milestones(capability_id);

CREATE INDEX IF NOT EXISTS idx_capability_milestones_milestone_id 
    ON capability_milestones(milestone_id);

CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_user_id 
    ON user_achievement_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_capability_id 
    ON user_achievement_progress(capability_id);

CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_completed 
    ON user_achievement_progress(completed) WHERE completed = true;

CREATE INDEX IF NOT EXISTS idx_milestone_definitions_category 
    ON milestone_definitions(category);

CREATE INDEX IF NOT EXISTS idx_milestone_definitions_action_type 
    ON milestone_definitions(action_type);

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE capability_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_definitions ENABLE ROW LEVEL SECURITY;

-- Políticas para capability_milestones (lectura pública, administración restringida)
DROP POLICY IF EXISTS "capability_milestones_read_policy" ON capability_milestones;
CREATE POLICY "capability_milestones_read_policy" ON capability_milestones
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "capability_milestones_admin_policy" ON capability_milestones;
CREATE POLICY "capability_milestones_admin_policy" ON capability_milestones
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles 
            WHERE role = 'superadmin' OR role = 'admin'
        )
    );

-- Políticas para user_achievement_progress (usuarios solo ven su progreso)
DROP POLICY IF EXISTS "user_achievement_progress_user_policy" ON user_achievement_progress;
CREATE POLICY "user_achievement_progress_user_policy" ON user_achievement_progress
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_achievement_progress_admin_policy" ON user_achievement_progress;
CREATE POLICY "user_achievement_progress_admin_policy" ON user_achievement_progress
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles 
            WHERE role = 'superadmin' OR role = 'admin'
        )
    );

-- Políticas para milestone_definitions (lectura pública, administración restringida)
DROP POLICY IF EXISTS "milestone_definitions_read_policy" ON milestone_definitions;
CREATE POLICY "milestone_definitions_read_policy" ON milestone_definitions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "milestone_definitions_admin_policy" ON milestone_definitions;
CREATE POLICY "milestone_definitions_admin_policy" ON milestone_definitions
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles 
            WHERE role = 'superadmin' OR role = 'admin'
        )
    );

-- =====================================================
-- Triggers para updated_at automático
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_capability_milestones_updated_at ON capability_milestones;
CREATE TRIGGER update_capability_milestones_updated_at 
    BEFORE UPDATE ON capability_milestones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_achievement_progress_updated_at ON user_achievement_progress;
CREATE TRIGGER update_user_achievement_progress_updated_at 
    BEFORE UPDATE ON user_achievement_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_milestone_definitions_updated_at ON milestone_definitions;
CREATE TRIGGER update_milestone_definitions_updated_at 
    BEFORE UPDATE ON milestone_definitions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Función para obtener progreso de capacidades del usuario
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_capability_progress(p_user_id UUID)
RETURNS TABLE (
    capability_id VARCHAR(100),
    total_milestones BIGINT,
    completed_milestones BIGINT,
    progress_percentage NUMERIC(5,2),
    is_fully_completed BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.capability_id,
        COUNT(cm.milestone_id) as total_milestones,
        COUNT(CASE WHEN uap.completed = true THEN 1 END) as completed_milestones,
        ROUND(
            (COUNT(CASE WHEN uap.completed = true THEN 1 END)::NUMERIC / COUNT(cm.milestone_id)::NUMERIC) * 100, 
            2
        ) as progress_percentage,
        COUNT(cm.milestone_id) = COUNT(CASE WHEN uap.completed = true THEN 1 END) as is_fully_completed
    FROM capability_milestones cm
    LEFT JOIN user_achievement_progress uap ON (
        cm.capability_id = uap.capability_id 
        AND cm.milestone_id = uap.milestone_id 
        AND uap.user_id = p_user_id
    )
    WHERE cm.is_required = true
    GROUP BY cm.capability_id
    ORDER BY cm.capability_id;
END;
$$;