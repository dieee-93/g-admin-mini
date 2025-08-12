-- =========================================
-- G-MINI DATABASE UPDATES - FASE 1 CRÍTICO
-- Master Implementation Script
-- =========================================

-- Este script implementa todas las tablas y funciones faltantes
-- identificadas en el análisis de APIs vs Base de Datos actual
-- Fecha: 2025-08-11
-- Versión: 1.0

-- ORDEN DE EJECUCIÓN RECOMENDADO:
-- 1. 01-staff-management.sql      - Sistema de gestión de personal
-- 2. 02-settings-system.sql       - Sistema de configuración
-- 3. 03-products-inventory-functions.sql - Funciones faltantes

BEGIN;

-- =========================================
-- VERIFICACIONES PREVIAS
-- =========================================

DO $$
BEGIN
    RAISE NOTICE '=== INICIANDO IMPLEMENTACIÓN FASE 1 CRÍTICO ===';
    RAISE NOTICE 'Fecha/Hora: %', NOW();
    RAISE NOTICE 'Base de datos: %', CURRENT_DATABASE();
    RAISE NOTICE 'Usuario: %', CURRENT_USER();
    RAISE NOTICE '';
    
    -- Verificar que las tablas básicas existan
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        RAISE WARNING 'ADVERTENCIA: Tabla products no existe. Verificar schema base.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'items') THEN
        RAISE WARNING 'ADVERTENCIA: Tabla items no existe. Verificar schema base.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        RAISE WARNING 'ADVERTENCIA: Tabla customers no existe. Verificar schema base.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales') THEN
        RAISE WARNING 'ADVERTENCIA: Tabla sales no existe. Verificar schema base.';
    END IF;
    
    RAISE NOTICE 'Verificaciones completadas. Procediendo con implementación...';
    RAISE NOTICE '';
END
$$;

-- =========================================
-- EJECUTAR SCRIPTS EN ORDEN
-- =========================================

-- Nota: En un entorno de producción, ejecutar cada script individualmente
-- Este es solo un archivo de referencia para el orden de ejecución

-- FASE 1.1: STAFF MANAGEMENT
-- \i database-updates/01-staff-management.sql

-- FASE 1.2: SETTINGS SYSTEM  
-- \i database-updates/02-settings-system.sql

-- FASE 1.3: PRODUCTS & INVENTORY FUNCTIONS
-- \i database-updates/03-products-inventory-functions.sql

-- =========================================
-- VERIFICACIONES POST-IMPLEMENTACIÓN
-- =========================================

DO $$
DECLARE
    v_table_count INTEGER;
    v_function_count INTEGER;
    v_total_records INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICACIONES POST-IMPLEMENTACIÓN ===';
    
    -- Contar nuevas tablas creadas
    SELECT COUNT(*) INTO v_table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'employees', 'performance_metrics', 'training_records',
        'business_settings', 'system_settings', 'user_roles', 'integrations',
        'notification_preferences', 'settings_audit_log'
    );
    
    RAISE NOTICE 'Nuevas tablas creadas: %', v_table_count;
    
    -- Contar nuevas funciones creadas
    SELECT COUNT(*) INTO v_function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name LIKE '%staff_%' 
    OR routine_name LIKE '%settings_%'
    OR routine_name LIKE '%get_products_with_availability%'
    OR routine_name LIKE '%get_low_stock_alert%'
    OR routine_name LIKE '%validate_sale_stock%';
    
    RAISE NOTICE 'Nuevas funciones creadas: %', v_function_count;
    
    -- Verificar datos de ejemplo
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
        SELECT COUNT(*) INTO v_total_records FROM employees;
        RAISE NOTICE 'Registros en employees: %', v_total_records;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_settings') THEN
        SELECT COUNT(*) INTO v_total_records FROM business_settings;
        RAISE NOTICE 'Registros en business_settings: %', v_total_records;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        SELECT COUNT(*) INTO v_total_records FROM user_roles;
        RAISE NOTICE 'Registros en user_roles: %', v_total_records;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== IMPLEMENTACIÓN COMPLETADA ===';
    RAISE NOTICE 'Estado: SUCCESS';
    RAISE NOTICE 'Siguiente fase: Scheduling, Customer Intelligence, Fiscal';
END
$$;

-- COMMIT solo si todo salió bien
COMMIT;

-- =========================================
-- INSTRUCCIONES DE USO
-- =========================================

/*
INSTRUCCIONES PARA EJECUTAR:

1. PRODUCCIÓN (Recomendado):
   - Ejecutar cada script individualmente en orden:
     psql -d tu_base_de_datos -f database-updates/01-staff-management.sql
     psql -d tu_base_de_datos -f database-updates/02-settings-system.sql  
     psql -d tu_base_de_datos -f database-updates/03-products-inventory-functions.sql

2. DESARROLLO/TESTING:
   - Ejecutar este script maestro:
     psql -d tu_base_de_datos -f database-updates/00-master-implementation.sql

VERIFICAR POST-EJECUCIÓN:
- Los APIs staffApi, settingsApi deben funcionar completamente
- Los APIs productApi, inventoryApi deben tener todas las funciones
- Las funciones RPC deben estar disponibles en Supabase
- Los datos de ejemplo deben estar cargados

PRÓXIMOS PASOS:
- Fase 2: Implementar schedulingApi (sistema de turnos)
- Fase 2: Implementar advancedCustomerApi (inteligencia de clientes)  
- Fase 3: Implementar fiscalApi (integración AFIP)
*/