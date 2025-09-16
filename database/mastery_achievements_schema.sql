/**
 * Schema de Base de Datos para Logros de Maestría
 * 
 * Este archivo define las tablas necesarias para gestionar los logros de maestría
 * que recompensan el uso continuo y la exploración de la plataforma.
 */

-- =====================================================
-- Tabla: achievement_definitions
-- Define todos los logros de maestría disponibles
-- =====================================================

CREATE TABLE IF NOT EXISTS achievement_definitions (
  id VARCHAR(50) PRIMARY KEY, -- ej: 'sales_bronze', 'inventory_master'
  name VARCHAR(100) NOT NULL, -- ej: 'Vendedor de Bronce'
  description TEXT NOT NULL, -- ej: 'Realiza tus primeras 10 ventas'
  icon VARCHAR(100) NOT NULL, -- ej: 'trophy', 'star', 'medal'
  domain VARCHAR(30) NOT NULL, -- ej: 'sales', 'inventory', 'staff', 'finance'
  trigger_event VARCHAR(100) NOT NULL, -- ej: 'sales:completed', 'products:created'
  conditions JSONB NOT NULL, -- Reglas para desbloquear
  type VARCHAR(20) NOT NULL DEFAULT 'mastery', -- 'mastery' vs 'foundational'
  tier VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  points INTEGER DEFAULT 0, -- Puntos otorgados por este logro
  is_active BOOLEAN DEFAULT true, -- Si el logro está activo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_domain ON achievement_definitions(domain);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_trigger_event ON achievement_definitions(trigger_event);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_type ON achievement_definitions(type);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_tier ON achievement_definitions(tier);

-- =====================================================
-- Tabla: user_achievements
-- Registra los logros desbloqueados por cada usuario
-- =====================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_data JSONB, -- Datos adicionales del progreso (ej: valores que llevaron al desbloqueo)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Restricción única: un usuario no puede desbloquear el mismo logro dos veces
  UNIQUE(user_id, achievement_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);

-- =====================================================
-- Tabla: user_achievement_progress
-- Rastrea el progreso hacia logros que requieren acumulación
-- =====================================================

CREATE TABLE IF NOT EXISTS user_achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0, -- Valor actual (ej: 7 ventas de 10 necesarias)
  target_value INTEGER NOT NULL, -- Valor objetivo (ej: 10 ventas)
  progress_percentage INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN target_value > 0 THEN LEAST(100, (current_value * 100) / target_value)
      ELSE 0 
    END
  ) STORED,
  metadata JSONB, -- Datos adicionales (fechas, detalles específicos)
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Restricción única: un usuario solo puede tener un progreso por logro
  UNIQUE(user_id, achievement_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_user_id ON user_achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_achievement_id ON user_achievement_progress(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_percentage ON user_achievement_progress(progress_percentage);

-- =====================================================
-- Políticas de Seguridad RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievement_progress ENABLE ROW LEVEL SECURITY;

-- Política para achievement_definitions: todos pueden leer
CREATE POLICY "achievement_definitions_select" ON achievement_definitions
  FOR SELECT USING (true);

-- Política para user_achievements: usuarios solo ven sus propios logros
CREATE POLICY "user_achievements_select" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_achievements_insert" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para user_achievement_progress: usuarios solo ven su propio progreso
CREATE POLICY "user_achievement_progress_select" ON user_achievement_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_achievement_progress_insert" ON user_achievement_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_achievement_progress_update" ON user_achievement_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- Funciones de Base de Datos
-- =====================================================

-- Función para obtener el progreso de logros de un usuario
CREATE OR REPLACE FUNCTION get_user_achievement_overview(target_user_id UUID)
RETURNS TABLE (
  domain VARCHAR(30),
  total_achievements INTEGER,
  unlocked_achievements INTEGER,
  total_points INTEGER,
  progress_percentage INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ad.domain,
    COUNT(ad.id)::INTEGER as total_achievements,
    COUNT(ua.achievement_id)::INTEGER as unlocked_achievements,
    COALESCE(SUM(CASE WHEN ua.achievement_id IS NOT NULL THEN ad.points ELSE 0 END), 0)::INTEGER as total_points,
    CASE 
      WHEN COUNT(ad.id) > 0 THEN (COUNT(ua.achievement_id) * 100 / COUNT(ad.id))::INTEGER
      ELSE 0 
    END as progress_percentage
  FROM achievement_definitions ad
  LEFT JOIN user_achievements ua ON ad.id = ua.achievement_id AND ua.user_id = target_user_id
  WHERE ad.is_active = true
  GROUP BY ad.domain
  ORDER BY ad.domain;
END;
$$;

-- Función para desbloquear un logro
CREATE OR REPLACE FUNCTION unlock_achievement(
  target_user_id UUID,
  target_achievement_id VARCHAR(50),
  progress_data JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_exists BOOLEAN;
  already_unlocked BOOLEAN;
BEGIN
  -- Verificar que el logro existe
  SELECT EXISTS(
    SELECT 1 FROM achievement_definitions 
    WHERE id = target_achievement_id AND is_active = true
  ) INTO achievement_exists;
  
  IF NOT achievement_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar si ya está desbloqueado
  SELECT EXISTS(
    SELECT 1 FROM user_achievements 
    WHERE user_id = target_user_id AND achievement_id = target_achievement_id
  ) INTO already_unlocked;
  
  IF already_unlocked THEN
    RETURN FALSE;
  END IF;
  
  -- Desbloquear el logro
  INSERT INTO user_achievements (user_id, achievement_id, progress_data)
  VALUES (target_user_id, target_achievement_id, progress_data);
  
  RETURN TRUE;
END;
$$;

-- Función para actualizar progreso hacia un logro
CREATE OR REPLACE FUNCTION update_achievement_progress(
  target_user_id UUID,
  target_achievement_id VARCHAR(50),
  new_value INTEGER,
  target_value INTEGER,
  metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_achievement_progress (
    user_id, 
    achievement_id, 
    current_value, 
    target_value, 
    metadata,
    last_updated
  )
  VALUES (
    target_user_id, 
    target_achievement_id, 
    new_value, 
    target_value, 
    metadata,
    NOW()
  )
  ON CONFLICT (user_id, achievement_id) 
  DO UPDATE SET
    current_value = EXCLUDED.current_value,
    target_value = EXCLUDED.target_value,
    metadata = EXCLUDED.metadata,
    last_updated = NOW();
    
  RETURN TRUE;
END;
$$;

-- =====================================================
-- Comentarios y Documentación
-- =====================================================

COMMENT ON TABLE achievement_definitions IS 'Define todos los logros de maestría disponibles en el sistema';
COMMENT ON TABLE user_achievements IS 'Registra los logros desbloqueados por cada usuario';
COMMENT ON TABLE user_achievement_progress IS 'Rastrea el progreso hacia logros que requieren acumulación';

COMMENT ON COLUMN achievement_definitions.conditions IS 'JSON con reglas de desbloqueo. Ej: {"type": "cumulative", "field": "sales_count", "threshold": 10}';
COMMENT ON COLUMN achievement_definitions.domain IS 'Dominio del logro para agrupación en UI: sales, inventory, staff, finance, etc.';
COMMENT ON COLUMN achievement_definitions.tier IS 'Nivel del logro: bronze, silver, gold, platinum';

COMMENT ON FUNCTION get_user_achievement_overview IS 'Obtiene resumen de progreso de logros por dominio para un usuario';
COMMENT ON FUNCTION unlock_achievement IS 'Desbloquea un logro para un usuario si aún no lo tiene';
COMMENT ON FUNCTION update_achievement_progress IS 'Actualiza el progreso hacia un logro acumulativo';