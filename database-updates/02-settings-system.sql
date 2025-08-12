-- =========================================
-- Settings System - Database Implementation
-- Fase 1: Crítico - Configuración Básica
-- =========================================

-- TABLAS PRINCIPALES
-- ==================

-- Configuración del negocio
CREATE TABLE IF NOT EXISTS business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) CHECK (business_type IN ('restaurant', 'cafe', 'bakery', 'food_truck', 'catering', 'other')) DEFAULT 'restaurant',
    
    -- Dirección (stored as JSONB for flexibility)
    address JSONB NOT NULL DEFAULT '{}', 
    -- Structure: {"street": "...", "city": "...", "state": "...", "postal_code": "...", "country": "..."}
    
    -- Información de contacto
    contact JSONB NOT NULL DEFAULT '{}',
    -- Structure: {"phone": "...", "email": "...", "website": "...", "social_media": {"facebook": "...", "instagram": "...", "twitter": "..."}}
    
    -- Horarios de operación
    operating_hours JSONB NOT NULL DEFAULT '[]',
    -- Structure: [{"day_of_week": 0-6, "is_open": boolean, "open_time": "HH:MM", "close_time": "HH:MM"}]
    
    -- Configuración de impuestos
    tax_settings JSONB NOT NULL DEFAULT '{}',
    -- Structure: {"tax_rate": number, "tax_name": "...", "include_tax_in_prices": boolean, "tax_number": "..."}
    
    -- Configuración de moneda
    currency JSONB NOT NULL DEFAULT '{"code": "MXN", "symbol": "$", "decimal_places": 2, "position": "before"}',
    -- Structure: {"code": "...", "symbol": "...", "decimal_places": number, "position": "before|after"}
    
    -- Configuración de notificaciones
    notification_settings JSONB NOT NULL DEFAULT '{}',
    -- Structure: {"email_notifications": boolean, "sms_notifications": boolean, "low_stock_alerts": boolean, "order_notifications": boolean, "employee_notifications": boolean}
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Configuración del sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme VARCHAR(20) CHECK (theme IN ('light', 'dark', 'auto')) DEFAULT 'auto',
    language VARCHAR(5) DEFAULT 'es',
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    time_format VARCHAR(5) CHECK (time_format IN ('12h', '24h')) DEFAULT '24h',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Roles de usuario
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    users_count INTEGER DEFAULT 0,
    is_system_role BOOLEAN DEFAULT false, -- Prevent deletion of system roles
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Integraciones
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('payment', 'messaging', 'analytics', 'delivery', 'pos')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'error')) DEFAULT 'inactive',
    config JSONB DEFAULT '{}',
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Configuración de notificaciones por usuario/tipo
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Reference to user when implemented
    notification_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}', -- Channel-specific config (email, sms, push, etc.)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Log de cambios en configuración (audit trail)
CREATE TABLE IF NOT EXISTS settings_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID, -- Reference to user
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- ÍNDICES PARA PERFORMANCE
-- ========================

CREATE INDEX IF NOT EXISTS idx_business_settings_type ON business_settings(business_type);
CREATE INDEX IF NOT EXISTS idx_user_roles_name ON user_roles(name);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_audit_log_table_record ON settings_audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_settings_audit_log_changed_at ON settings_audit_log(changed_at);

-- FUNCIONES RPC PARA SUPABASE
-- ===========================

-- Función: Obtener configuración completa del negocio
CREATE OR REPLACE FUNCTION settings_get_business_settings()
RETURNS TABLE (
    id UUID,
    business_name VARCHAR(255),
    business_type VARCHAR(50),
    address JSONB,
    contact JSONB,
    operating_hours JSONB,
    tax_settings JSONB,
    currency JSONB,
    notification_settings JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bs.id,
        bs.business_name,
        bs.business_type,
        bs.address,
        bs.contact,
        bs.operating_hours,
        bs.tax_settings,
        bs.currency,
        bs.notification_settings,
        bs.created_at,
        bs.updated_at
    FROM business_settings bs
    ORDER BY bs.updated_at DESC
    LIMIT 1; -- Get the most recent configuration
END;
$$;

-- Función: Actualizar configuración del negocio
CREATE OR REPLACE FUNCTION settings_update_business_settings(
    p_business_name VARCHAR(255) DEFAULT NULL,
    p_business_type VARCHAR(50) DEFAULT NULL,
    p_address JSONB DEFAULT NULL,
    p_contact JSONB DEFAULT NULL,
    p_operating_hours JSONB DEFAULT NULL,
    p_tax_settings JSONB DEFAULT NULL,
    p_currency JSONB DEFAULT NULL,
    p_notification_settings JSONB DEFAULT NULL,
    p_updated_by UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    business_name VARCHAR(255),
    business_type VARCHAR(50),
    address JSONB,
    contact JSONB,
    operating_hours JSONB,
    tax_settings JSONB,
    currency JSONB,
    notification_settings JSONB,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_settings_id UUID;
    v_old_values JSONB;
    v_new_values JSONB;
BEGIN
    -- Get current settings for audit
    SELECT bs.id, row_to_json(bs)::jsonb 
    INTO v_settings_id, v_old_values
    FROM business_settings bs 
    ORDER BY updated_at DESC 
    LIMIT 1;
    
    -- If no settings exist, create new record
    IF v_settings_id IS NULL THEN
        INSERT INTO business_settings (
            business_name, business_type, address, contact, operating_hours,
            tax_settings, currency, notification_settings
        ) VALUES (
            COALESCE(p_business_name, 'Mi Negocio'),
            COALESCE(p_business_type, 'restaurant'),
            COALESCE(p_address, '{}'),
            COALESCE(p_contact, '{}'),
            COALESCE(p_operating_hours, '[]'),
            COALESCE(p_tax_settings, '{}'),
            COALESCE(p_currency, '{"code": "MXN", "symbol": "$", "decimal_places": 2, "position": "before"}'),
            COALESCE(p_notification_settings, '{}')
        ) RETURNING business_settings.id INTO v_settings_id;
    ELSE
        -- Update existing settings
        UPDATE business_settings 
        SET 
            business_name = COALESCE(p_business_name, business_name),
            business_type = COALESCE(p_business_type, business_type),
            address = COALESCE(p_address, address),
            contact = COALESCE(p_contact, contact),
            operating_hours = COALESCE(p_operating_hours, operating_hours),
            tax_settings = COALESCE(p_tax_settings, tax_settings),
            currency = COALESCE(p_currency, currency),
            notification_settings = COALESCE(p_notification_settings, notification_settings),
            updated_at = NOW()
        WHERE id = v_settings_id;
    END IF;
    
    -- Get new values for audit
    SELECT row_to_json(bs)::jsonb 
    INTO v_new_values
    FROM business_settings bs 
    WHERE id = v_settings_id;
    
    -- Insert audit log
    IF p_updated_by IS NOT NULL THEN
        INSERT INTO settings_audit_log (
            table_name, record_id, action, old_values, new_values, changed_by
        ) VALUES (
            'business_settings', v_settings_id, 
            CASE WHEN v_old_values IS NULL THEN 'INSERT' ELSE 'UPDATE' END,
            v_old_values, v_new_values, p_updated_by
        );
    END IF;
    
    -- Return updated settings
    RETURN QUERY
    SELECT 
        bs.id, bs.business_name, bs.business_type, bs.address, bs.contact,
        bs.operating_hours, bs.tax_settings, bs.currency, bs.notification_settings,
        bs.updated_at
    FROM business_settings bs
    WHERE bs.id = v_settings_id;
END;
$$;

-- Función: Obtener configuración del sistema
CREATE OR REPLACE FUNCTION settings_get_system_settings()
RETURNS TABLE (
    id UUID,
    theme VARCHAR(20),
    language VARCHAR(5),
    timezone VARCHAR(50),
    date_format VARCHAR(20),
    time_format VARCHAR(5),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ss.id, ss.theme, ss.language, ss.timezone, 
        ss.date_format, ss.time_format, ss.created_at, ss.updated_at
    FROM system_settings ss
    ORDER BY ss.updated_at DESC
    LIMIT 1;
END;
$$;

-- Función: Actualizar configuración del sistema
CREATE OR REPLACE FUNCTION settings_update_system_settings(
    p_theme VARCHAR(20) DEFAULT NULL,
    p_language VARCHAR(5) DEFAULT NULL,
    p_timezone VARCHAR(50) DEFAULT NULL,
    p_date_format VARCHAR(20) DEFAULT NULL,
    p_time_format VARCHAR(5) DEFAULT NULL,
    p_updated_by UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    theme VARCHAR(20),
    language VARCHAR(5),
    timezone VARCHAR(50),
    date_format VARCHAR(20),
    time_format VARCHAR(5),
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_settings_id UUID;
BEGIN
    -- Get or create system settings
    SELECT ss.id INTO v_settings_id
    FROM system_settings ss 
    ORDER BY updated_at DESC 
    LIMIT 1;
    
    IF v_settings_id IS NULL THEN
        INSERT INTO system_settings (theme, language, timezone, date_format, time_format)
        VALUES (
            COALESCE(p_theme, 'auto'),
            COALESCE(p_language, 'es'),
            COALESCE(p_timezone, 'America/Mexico_City'),
            COALESCE(p_date_format, 'DD/MM/YYYY'),
            COALESCE(p_time_format, '24h')
        ) RETURNING system_settings.id INTO v_settings_id;
    ELSE
        UPDATE system_settings 
        SET 
            theme = COALESCE(p_theme, theme),
            language = COALESCE(p_language, language),
            timezone = COALESCE(p_timezone, timezone),
            date_format = COALESCE(p_date_format, date_format),
            time_format = COALESCE(p_time_format, time_format),
            updated_at = NOW()
        WHERE id = v_settings_id;
    END IF;
    
    RETURN QUERY
    SELECT 
        ss.id, ss.theme, ss.language, ss.timezone, 
        ss.date_format, ss.time_format, ss.updated_at
    FROM system_settings ss
    WHERE ss.id = v_settings_id;
END;
$$;

-- Función: Obtener roles de usuario
CREATE OR REPLACE FUNCTION settings_get_user_roles()
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    description TEXT,
    permissions TEXT[],
    users_count INTEGER,
    is_system_role BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ur.id, ur.name, ur.description, ur.permissions, ur.users_count,
        ur.is_system_role, ur.created_at, ur.updated_at
    FROM user_roles ur
    ORDER BY ur.is_system_role DESC, ur.name ASC;
END;
$$;

-- Función: Crear nuevo rol de usuario
CREATE OR REPLACE FUNCTION settings_create_user_role(
    p_name VARCHAR(100),
    p_description TEXT,
    p_permissions TEXT[],
    p_created_by UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    description TEXT,
    permissions TEXT[],
    users_count INTEGER,
    is_system_role BOOLEAN,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_role_id UUID;
BEGIN
    INSERT INTO user_roles (name, description, permissions, is_system_role)
    VALUES (p_name, p_description, p_permissions, false)
    RETURNING user_roles.id INTO v_role_id;
    
    -- Insert audit log
    IF p_created_by IS NOT NULL THEN
        INSERT INTO settings_audit_log (
            table_name, record_id, action, new_values, changed_by
        ) VALUES (
            'user_roles', v_role_id, 'INSERT',
            jsonb_build_object('name', p_name, 'description', p_description, 'permissions', p_permissions),
            p_created_by
        );
    END IF;
    
    RETURN QUERY
    SELECT 
        ur.id, ur.name, ur.description, ur.permissions, ur.users_count,
        ur.is_system_role, ur.created_at
    FROM user_roles ur
    WHERE ur.id = v_role_id;
END;
$$;

-- Función: Obtener integraciones
CREATE OR REPLACE FUNCTION settings_get_integrations()
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    description TEXT,
    type VARCHAR(50),
    status VARCHAR(20),
    config JSONB,
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id, i.name, i.description, i.type, i.status, i.config,
        i.last_sync, i.created_at, i.updated_at
    FROM integrations i
    ORDER BY i.type, i.name;
END;
$$;

-- Función: Actualizar estado de integración
CREATE OR REPLACE FUNCTION settings_toggle_integration_status(
    p_integration_id UUID,
    p_status VARCHAR(20),
    p_updated_by UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    status VARCHAR(20),
    last_sync TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    UPDATE integrations 
    SET 
        status = p_status,
        last_sync = CASE WHEN p_status = 'active' THEN NOW() ELSE last_sync END,
        updated_at = NOW()
    WHERE id = p_integration_id;
    
    -- Insert audit log
    IF p_updated_by IS NOT NULL THEN
        INSERT INTO settings_audit_log (
            table_name, record_id, action, new_values, changed_by
        ) VALUES (
            'integrations', p_integration_id, 'UPDATE',
            jsonb_build_object('status', p_status),
            p_updated_by
        );
    END IF;
    
    RETURN QUERY
    SELECT 
        i.id, i.name, i.status, i.last_sync, i.updated_at
    FROM integrations i
    WHERE i.id = p_integration_id;
END;
$$;

-- TRIGGERS PARA MANTENER DATOS ACTUALIZADOS
-- =========================================

-- Función trigger para updated_at
CREATE OR REPLACE FUNCTION update_settings_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para todas las tablas
CREATE TRIGGER update_business_settings_updated_at
    BEFORE UPDATE ON business_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at_column();

-- DATOS DE EJEMPLO PARA DESARROLLO
-- =================================

DO $$
BEGIN
    -- Insert business settings if none exist
    IF NOT EXISTS (SELECT 1 FROM business_settings LIMIT 1) THEN
        INSERT INTO business_settings (
            business_name, business_type, address, contact, operating_hours,
            tax_settings, currency, notification_settings
        ) VALUES (
            'Restaurante El Sabor',
            'restaurant',
            '{"street": "Av. Principal 123", "city": "Ciudad de México", "state": "CDMX", "postal_code": "01000", "country": "México"}',
            '{"phone": "+52 55 1234-5678", "email": "contacto@elsabor.com", "website": "https://elsabor.com", "social_media": {"facebook": "https://facebook.com/elsabor", "instagram": "https://instagram.com/elsabor", "twitter": "https://twitter.com/elsabor"}}',
            '[
                {"day_of_week": 0, "is_open": false},
                {"day_of_week": 1, "is_open": true, "open_time": "09:00", "close_time": "22:00"},
                {"day_of_week": 2, "is_open": true, "open_time": "09:00", "close_time": "22:00"},
                {"day_of_week": 3, "is_open": true, "open_time": "09:00", "close_time": "22:00"},
                {"day_of_week": 4, "is_open": true, "open_time": "09:00", "close_time": "22:00"},
                {"day_of_week": 5, "is_open": true, "open_time": "09:00", "close_time": "23:00"},
                {"day_of_week": 6, "is_open": true, "open_time": "10:00", "close_time": "23:00"}
            ]',
            '{"tax_rate": 16, "tax_name": "IVA", "include_tax_in_prices": true, "tax_number": "RFC123456789"}',
            '{"code": "MXN", "symbol": "$", "decimal_places": 2, "position": "before"}',
            '{"email_notifications": true, "sms_notifications": true, "low_stock_alerts": true, "order_notifications": true, "employee_notifications": true}'
        );
    END IF;

    -- Insert system settings if none exist
    IF NOT EXISTS (SELECT 1 FROM system_settings LIMIT 1) THEN
        INSERT INTO system_settings (theme, language, timezone, date_format, time_format)
        VALUES ('auto', 'es', 'America/Mexico_City', 'DD/MM/YYYY', '24h');
    END IF;

    -- Insert user roles if none exist
    IF NOT EXISTS (SELECT 1 FROM user_roles LIMIT 1) THEN
        INSERT INTO user_roles (name, description, permissions, users_count, is_system_role) VALUES
        ('Administrador', 'Acceso completo al sistema', ARRAY['all'], 1, true),
        ('Gerente', 'Gestión operacional completa', ARRAY['operations:manage', 'sales:read', 'staff:manage', 'reports:read'], 2, true),
        ('Empleado', 'Acceso básico a operaciones', ARRAY['operations:read', 'sales:write'], 8, true),
        ('Cajero', 'Acceso solo a ventas', ARRAY['sales:write', 'sales:read'], 3, true);
    END IF;

    -- Insert integrations if none exist
    IF NOT EXISTS (SELECT 1 FROM integrations LIMIT 1) THEN
        INSERT INTO integrations (name, description, type, status, config, last_sync) VALUES
        ('Stripe', 'Procesamiento de pagos online', 'payment', 'active', 
         '{"publishable_key": "pk_test_***", "webhook_url": "/api/webhooks/stripe"}', NOW()),
        ('WhatsApp Business', 'Notificaciones y atención al cliente', 'messaging', 'active',
         '{"phone_number": "+52551234567", "business_account_id": "wa_***"}', NOW() - INTERVAL '5 minutes'),
        ('Google Analytics', 'Análisis web y comportamiento de usuarios', 'analytics', 'inactive',
         '{"tracking_id": "GA-***"}', NULL);
    END IF;

    RAISE NOTICE 'Settings system sample data inserted successfully';
END
$$;

-- PERMISOS Y SEGURIDAD
-- ====================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON business_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON system_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;
GRANT SELECT ON settings_audit_log TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION settings_get_business_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION settings_update_business_settings(VARCHAR, VARCHAR, JSONB, JSONB, JSONB, JSONB, JSONB, JSONB, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION settings_get_system_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION settings_update_system_settings(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION settings_get_user_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION settings_create_user_role(VARCHAR, TEXT, TEXT[], UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION settings_get_integrations() TO authenticated;
GRANT EXECUTE ON FUNCTION settings_toggle_integration_status(UUID, VARCHAR, UUID) TO authenticated;

-- COMENTARIOS
-- ===========

COMMENT ON TABLE business_settings IS 'Configuración principal del negocio';
COMMENT ON TABLE system_settings IS 'Configuración del sistema y preferencias de UI';
COMMENT ON TABLE user_roles IS 'Roles de usuario con permisos específicos';
COMMENT ON TABLE integrations IS 'Configuración de integraciones externas';
COMMENT ON TABLE notification_preferences IS 'Preferencias de notificaciones por usuario';
COMMENT ON TABLE settings_audit_log IS 'Registro de cambios en configuraciones';

COMMENT ON FUNCTION settings_get_business_settings() IS 'Obtiene la configuración completa del negocio';
COMMENT ON FUNCTION settings_update_business_settings(VARCHAR, VARCHAR, JSONB, JSONB, JSONB, JSONB, JSONB, JSONB, UUID) IS 'Actualiza la configuración del negocio con audit trail';
COMMENT ON FUNCTION settings_get_system_settings() IS 'Obtiene la configuración del sistema';
COMMENT ON FUNCTION settings_update_system_settings(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, UUID) IS 'Actualiza la configuración del sistema';
COMMENT ON FUNCTION settings_get_user_roles() IS 'Obtiene todos los roles de usuario disponibles';
COMMENT ON FUNCTION settings_create_user_role(VARCHAR, TEXT, TEXT[], UUID) IS 'Crea un nuevo rol de usuario';
COMMENT ON FUNCTION settings_get_integrations() IS 'Obtiene todas las integraciones configuradas';
COMMENT ON FUNCTION settings_toggle_integration_status(UUID, VARCHAR, UUID) IS 'Cambia el estado de una integración';

-- =========================================
-- FIN: Settings System
-- =========================================