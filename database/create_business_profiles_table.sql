-- =====================================================
-- 📊 BUSINESS PROFILES - Persistencia de Capabilities
--
-- PROPÓSITO:
-- - Almacenar configuración del negocio y capabilities activas
-- - Sincronizar con capabilityStore (Zustand)
-- - Soportar múltiples organizaciones (multi-tenant ready)
--
-- ARQUITECTURA:
-- - Una fila por organización/tenant (default: single tenant)
-- - JSONB para capabilities array (flexible, queryable)
-- - RLS habilitado para seguridad
-- =====================================================

-- =====================================================
-- 1. CREAR TABLA business_profiles
-- =====================================================

CREATE TABLE IF NOT EXISTS public.business_profiles (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Organization ID (para multi-tenant, NULL = single tenant)
  organization_id UUID DEFAULT NULL,

  -- ============================================
  -- BUSINESS INFORMATION
  -- ============================================
  business_name TEXT NOT NULL,
  business_type TEXT, -- 'restaurant', 'retail', 'services', 'ecommerce', 'other'
  email TEXT,
  phone TEXT,
  country TEXT DEFAULT 'Argentina',
  currency TEXT DEFAULT 'ARS',

  -- ============================================
  -- CAPABILITIES CONFIGURATION
  -- ============================================
  -- Array de CapabilityId activas (ej: ["customer_management", "sells_products_for_onsite_consumption"])
  active_capabilities JSONB DEFAULT '[]'::jsonb NOT NULL,

  -- Business structure (single_location, multi_location, mobile_business)
  business_structure TEXT DEFAULT 'single_location',

  -- ============================================
  -- COMPUTED CONFIGURATION (cache de CapabilityEngine.resolve())
  -- ============================================
  -- Configuración generada por el sistema (módulos visibles, features, etc.)
  -- Estructura: { visibleModules: string[], moduleFeatures: Record<string, any>, ... }
  computed_configuration JSONB DEFAULT '{}'::jsonb,

  -- Auto-resolved capabilities (universales activadas automáticamente)
  auto_resolved_capabilities JSONB DEFAULT '[]'::jsonb,

  -- ============================================
  -- SETUP & ONBOARDING
  -- ============================================
  setup_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  setup_completed_at TIMESTAMPTZ,

  -- ============================================
  -- METADATA
  -- ============================================
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. ÍNDICES
-- =====================================================

-- Índice para organization_id (multi-tenant)
CREATE INDEX IF NOT EXISTS idx_business_profiles_org
ON public.business_profiles(organization_id);

-- Índice para active_capabilities (queries por capability específica)
CREATE INDEX IF NOT EXISTS idx_business_profiles_capabilities
ON public.business_profiles USING GIN (active_capabilities);

-- Índice para setup_completed (filtrar perfiles completados)
CREATE INDEX IF NOT EXISTS idx_business_profiles_setup
ON public.business_profiles(setup_completed);

-- Constraint: Solo un perfil activo por organización (single tenant = NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_profiles_unique_org
ON public.business_profiles(COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- =====================================================
-- 3. TRIGGERS
-- =====================================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.business_profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: SUPER_ADMIN puede hacer todo
DROP POLICY IF EXISTS "SUPER_ADMIN full access to business_profiles" ON public.business_profiles;
CREATE POLICY "SUPER_ADMIN full access to business_profiles"
ON public.business_profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users_roles
    WHERE users_roles.user_id = auth.uid()
      AND users_roles.role = 'SUPER_ADMIN'
      AND users_roles.is_active = TRUE
  )
);

-- Policy: ADMINISTRADOR puede leer y actualizar (no crear/eliminar)
DROP POLICY IF EXISTS "ADMINISTRADOR read/update business_profiles" ON public.business_profiles;
CREATE POLICY "ADMINISTRADOR read/update business_profiles"
ON public.business_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users_roles
    WHERE users_roles.user_id = auth.uid()
      AND users_roles.role IN ('ADMINISTRADOR', 'SUPER_ADMIN')
      AND users_roles.is_active = TRUE
  )
);

DROP POLICY IF EXISTS "ADMINISTRADOR update business_profiles" ON public.business_profiles;
CREATE POLICY "ADMINISTRADOR update business_profiles"
ON public.business_profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users_roles
    WHERE users_roles.user_id = auth.uid()
      AND users_roles.role IN ('ADMINISTRADOR', 'SUPER_ADMIN')
      AND users_roles.is_active = TRUE
  )
);

-- Policy: Otros roles solo pueden leer
DROP POLICY IF EXISTS "Authenticated users read business_profiles" ON public.business_profiles;
CREATE POLICY "Authenticated users read business_profiles"
ON public.business_profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 5. FUNCIONES HELPER
-- =====================================================

-- Función para obtener el perfil activo (single tenant)
CREATE OR REPLACE FUNCTION get_active_business_profile()
RETURNS SETOF public.business_profiles
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.business_profiles
  WHERE organization_id IS NULL
  LIMIT 1;
$$;

-- Función para verificar si una capability está activa
CREATE OR REPLACE FUNCTION has_capability(capability_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_profiles
    WHERE active_capabilities @> jsonb_build_array(capability_id)
    LIMIT 1
  );
$$;

-- Función para obtener todas las capabilities activas
CREATE OR REPLACE FUNCTION get_active_capabilities()
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(active_capabilities, '[]'::jsonb)
  FROM public.business_profiles
  WHERE organization_id IS NULL
  LIMIT 1;
$$;

-- =====================================================
-- 6. COMENTARIOS (Documentación)
-- =====================================================

COMMENT ON TABLE public.business_profiles IS
'Almacena la configuración del negocio y capabilities activas. Sincroniza con capabilityStore (Zustand).';

COMMENT ON COLUMN public.business_profiles.active_capabilities IS
'Array JSONB de CapabilityId activas (ej: ["customer_management", "sells_products_for_onsite_consumption"])';

COMMENT ON COLUMN public.business_profiles.computed_configuration IS
'Cache de CapabilityEngine.resolve() - configuración calculada del sistema';

COMMENT ON COLUMN public.business_profiles.auto_resolved_capabilities IS
'Capabilities universales activadas automáticamente por el CapabilityEngine';

-- =====================================================
-- 7. GRANTS (Permisos)
-- =====================================================

-- Asegurar que authenticated users puedan leer
GRANT SELECT ON public.business_profiles TO authenticated;

-- SUPER_ADMIN y ADMINISTRADOR pueden actualizar
GRANT UPDATE ON public.business_profiles TO authenticated;

-- Solo SUPER_ADMIN puede insertar/eliminar (via RLS)
GRANT INSERT, DELETE ON public.business_profiles TO authenticated;

-- =====================================================
-- ✅ FIN DE LA MIGRACIÓN
-- =====================================================

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla business_profiles creada exitosamente';
  RAISE NOTICE '📊 Features habilitadas:';
  RAISE NOTICE '   - Almacenamiento de capabilities';
  RAISE NOTICE '   - RLS policies configuradas';
  RAISE NOTICE '   - Funciones helper disponibles';
  RAISE NOTICE '   - Triggers para updated_at';
END $$;
