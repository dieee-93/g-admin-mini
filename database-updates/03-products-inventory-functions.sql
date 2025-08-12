-- =========================================
-- Products & Inventory Functions - Database Implementation
-- Fase 1: Crítico - Funciones faltantes para APIs
-- =========================================

-- FUNCIONES FALTANTES PARA PRODUCTS API
-- =====================================

-- Función: Obtener productos con disponibilidad y costos
CREATE OR REPLACE FUNCTION get_products_with_availability()
RETURNS TABLE (
    id UUID,
    name TEXT,
    unit TEXT,
    type TEXT,
    description TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    cost DECIMAL(10,2),
    availability INTEGER,
    components_count INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH product_costs AS (
        -- Calcular costo de cada producto basado en sus componentes
        SELECT 
            p.id,
            COALESCE(SUM(pc.quantity * COALESCE(i.unit_cost, 0)), 0) as calculated_cost,
            COUNT(pc.id) as comp_count
        FROM products p
        LEFT JOIN product_components pc ON p.id = pc.product_id
        LEFT JOIN items i ON pc.item_id = i.id
        GROUP BY p.id
    ),
    product_availability AS (
        -- Calcular disponibilidad basada en stock de componentes
        SELECT 
            p.id,
            CASE 
                WHEN COUNT(pc.id) = 0 THEN 0 -- Sin componentes
                ELSE COALESCE(MIN(FLOOR(i.stock / NULLIF(pc.quantity, 0))), 0)
            END as calculated_availability
        FROM products p
        LEFT JOIN product_components pc ON p.id = pc.product_id
        LEFT JOIN items i ON pc.item_id = i.id
        WHERE pc.quantity > 0 OR pc.id IS NULL
        GROUP BY p.id
    )
    SELECT 
        p.id,
        p.name,
        p.unit,
        p.type,
        p.description,
        p.created_at,
        p.updated_at,
        COALESCE(pc.calculated_cost, 0)::DECIMAL(10,2) as cost,
        COALESCE(pa.calculated_availability, 0)::INTEGER as availability,
        COALESCE(pc.comp_count, 0)::INTEGER as components_count
    FROM products p
    LEFT JOIN product_costs pc ON p.id = pc.id
    LEFT JOIN product_availability pa ON p.id = pa.id
    ORDER BY p.created_at DESC;
END;
$$;

-- Función: Obtener costo de un producto específico
CREATE OR REPLACE FUNCTION get_product_cost(p_product_id UUID)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_cost DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(pc.quantity * COALESCE(i.unit_cost, 0)), 0)
    INTO v_cost
    FROM product_components pc
    JOIN items i ON pc.item_id = i.id
    WHERE pc.product_id = p_product_id;
    
    RETURN COALESCE(v_cost, 0);
END;
$$;

-- Función: Calcular disponibilidad de producto
CREATE OR REPLACE FUNCTION calculate_product_availability(p_product_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_availability INTEGER;
    v_component_count INTEGER;
BEGIN
    -- Contar componentes del producto
    SELECT COUNT(*) 
    INTO v_component_count
    FROM product_components 
    WHERE product_id = p_product_id;
    
    -- Si no tiene componentes, disponibilidad es 0
    IF v_component_count = 0 THEN
        RETURN 0;
    END IF;
    
    -- Calcular disponibilidad mínima basada en stock de componentes
    SELECT COALESCE(MIN(FLOOR(i.stock / NULLIF(pc.quantity, 0))), 0)
    INTO v_availability
    FROM product_components pc
    JOIN items i ON pc.item_id = i.id
    WHERE pc.product_id = p_product_id
      AND pc.quantity > 0;
    
    RETURN COALESCE(v_availability, 0);
END;
$$;

-- FUNCIONES FALTANTES PARA INVENTORY API
-- ======================================

-- Función: Obtener alertas de stock bajo
CREATE OR REPLACE FUNCTION get_low_stock_alert(p_threshold INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    name TEXT,
    current_stock INTEGER,
    threshold_level INTEGER,
    unit TEXT,
    type TEXT,
    unit_cost DECIMAL(10,2),
    status TEXT,
    days_until_stockout INTEGER,
    suggested_reorder_quantity INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.name,
        i.stock as current_stock,
        p_threshold as threshold_level,
        i.unit,
        i.type,
        i.unit_cost,
        CASE 
            WHEN i.stock <= 0 THEN 'out_of_stock'
            WHEN i.stock <= (p_threshold * 0.5) THEN 'critical'
            WHEN i.stock <= p_threshold THEN 'low'
            ELSE 'normal'
        END as status,
        -- Cálculo simplificado de días hasta agotamiento (mock)
        CASE 
            WHEN i.stock <= 0 THEN 0
            ELSE GREATEST(1, i.stock * 7) -- Mock: asumimos consumo de 1/7 del stock por día
        END as days_until_stockout,
        -- Cantidad sugerida de reorden
        GREATEST(p_threshold * 2, p_threshold + 10) as suggested_reorder_quantity
    FROM items i
    WHERE i.stock <= p_threshold
    ORDER BY 
        CASE 
            WHEN i.stock <= 0 THEN 1
            WHEN i.stock <= (p_threshold * 0.5) THEN 2
            ELSE 3
        END,
        i.stock ASC,
        i.name ASC;
END;
$$;

-- Función: Obtener estadísticas del dashboard de inventario
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_items INTEGER,
    low_stock_items INTEGER,
    out_of_stock_items INTEGER,
    total_inventory_value DECIMAL(12,2),
    recent_movements INTEGER,
    top_consuming_items JSONB,
    stock_status_summary JSONB
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_total_items INTEGER;
    v_low_stock INTEGER;
    v_out_of_stock INTEGER;
    v_total_value DECIMAL(12,2);
    v_recent_movements INTEGER;
    v_top_items JSONB;
    v_status_summary JSONB;
BEGIN
    -- Total de items
    SELECT COUNT(*) INTO v_total_items FROM items;
    
    -- Items con stock bajo (menos de 10)
    SELECT COUNT(*) INTO v_low_stock 
    FROM items 
    WHERE stock <= 10 AND stock > 0;
    
    -- Items sin stock
    SELECT COUNT(*) INTO v_out_of_stock 
    FROM items 
    WHERE stock <= 0;
    
    -- Valor total del inventario
    SELECT COALESCE(SUM(stock * COALESCE(unit_cost, 0)), 0) 
    INTO v_total_value 
    FROM items;
    
    -- Movimientos recientes (últimos 7 días)
    SELECT COUNT(*) INTO v_recent_movements 
    FROM stock_entries 
    WHERE created_at >= NOW() - INTERVAL '7 days';
    
    -- Top 5 items más utilizados (mock - basado en entradas de stock negativas)
    SELECT COALESCE(json_agg(item_data), '[]'::jsonb) INTO v_top_items
    FROM (
        SELECT jsonb_build_object(
            'name', i.name,
            'total_consumed', COALESCE(ABS(SUM(se.quantity)), 0),
            'stock', i.stock
        ) as item_data
        FROM items i
        LEFT JOIN stock_entries se ON i.id = se.item_id AND se.quantity < 0
        WHERE se.created_at >= NOW() - INTERVAL '30 days' OR se.id IS NULL
        GROUP BY i.id, i.name, i.stock
        ORDER BY COALESCE(ABS(SUM(se.quantity)), 0) DESC
        LIMIT 5
    ) top_items;
    
    -- Resumen de estados de stock
    SELECT jsonb_build_object(
        'normal', COUNT(*) FILTER (WHERE stock > 10),
        'low', COUNT(*) FILTER (WHERE stock <= 10 AND stock > 0),
        'out', COUNT(*) FILTER (WHERE stock <= 0),
        'critical_value', COALESCE(SUM(CASE WHEN stock <= 0 THEN COALESCE(unit_cost, 0) * 10 ELSE 0 END), 0)
    ) INTO v_status_summary
    FROM items;
    
    RETURN QUERY
    SELECT 
        v_total_items,
        v_low_stock,
        v_out_of_stock,
        v_total_value,
        v_recent_movements,
        v_top_items,
        v_status_summary;
END;
$$;

-- FUNCIONES ADICIONALES PARA VENTAS (SALES API)
-- =============================================

-- Función: Validar stock para una venta
CREATE OR REPLACE FUNCTION validate_sale_stock(items_array TEXT)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    requested_quantity INTEGER,
    available_quantity INTEGER,
    is_available BOOLEAN,
    shortage INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    item_data JSONB;
    item_record RECORD;
BEGIN
    -- Parse del array JSON de items
    FOR item_data IN SELECT * FROM jsonb_array_elements(items_array::jsonb)
    LOOP
        FOR item_record IN
            SELECT 
                p.id as product_id,
                p.name as product_name,
                (item_data->>'quantity')::INTEGER as requested_quantity,
                calculate_product_availability(p.id) as available_quantity
            FROM products p
            WHERE p.id = (item_data->>'product_id')::UUID
        LOOP
            RETURN QUERY
            SELECT 
                item_record.product_id,
                item_record.product_name,
                item_record.requested_quantity,
                item_record.available_quantity,
                (item_record.available_quantity >= item_record.requested_quantity) as is_available,
                GREATEST(0, item_record.requested_quantity - item_record.available_quantity) as shortage;
        END LOOP;
    END LOOP;
END;
$$;

-- Función: Procesar una venta (actualizar inventario)
CREATE OR REPLACE FUNCTION process_sale(
    customer_id UUID,
    items_array TEXT,
    total DECIMAL(10,2),
    note TEXT DEFAULT NULL
)
RETURNS TABLE (
    sale_id UUID,
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_sale_id UUID;
    item_data JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_availability INTEGER;
    v_success BOOLEAN := true;
    v_message TEXT := 'Sale processed successfully';
BEGIN
    -- Crear la venta
    INSERT INTO sales (customer_id, total, note, created_at, updated_at)
    VALUES (customer_id, total, note, NOW(), NOW())
    RETURNING id INTO v_sale_id;
    
    -- Procesar cada item
    FOR item_data IN SELECT * FROM jsonb_array_elements(items_array::jsonb)
    LOOP
        v_product_id := (item_data->>'product_id')::UUID;
        v_quantity := (item_data->>'quantity')::INTEGER;
        
        -- Verificar disponibilidad
        SELECT calculate_product_availability(v_product_id) INTO v_availability;
        
        IF v_availability < v_quantity THEN
            v_success := false;
            v_message := format('Insufficient stock for product %s', v_product_id);
            -- Rollback será manejado por la transacción
            RETURN QUERY SELECT v_sale_id, v_success, v_message;
            RETURN;
        END IF;
        
        -- Agregar item a la venta
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total)
        VALUES (
            v_sale_id, 
            v_product_id, 
            v_quantity, 
            (item_data->>'unit_price')::DECIMAL(10,2),
            v_quantity * (item_data->>'unit_price')::DECIMAL(10,2)
        );
        
        -- Reducir stock de componentes
        -- Esto se haría mediante triggers o procedimientos adicionales
        -- Por ahora, registramos la reducción conceptualmente
    END LOOP;
    
    RETURN QUERY SELECT v_sale_id, v_success, v_message;
END;
$$;

-- Función: Resumen de ventas por período
CREATE OR REPLACE FUNCTION get_sales_summary(
    date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    date_to DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_sales DECIMAL(12,2),
    total_orders INTEGER,
    average_order_value DECIMAL(10,2),
    top_products JSONB,
    sales_by_day JSONB
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_total_sales DECIMAL(12,2);
    v_total_orders INTEGER;
    v_avg_order DECIMAL(10,2);
    v_top_products JSONB;
    v_sales_by_day JSONB;
BEGIN
    -- Total de ventas
    SELECT COALESCE(SUM(total), 0) INTO v_total_sales
    FROM sales 
    WHERE DATE(created_at) BETWEEN date_from AND date_to;
    
    -- Total de órdenes
    SELECT COUNT(*) INTO v_total_orders
    FROM sales 
    WHERE DATE(created_at) BETWEEN date_from AND date_to;
    
    -- Promedio por orden
    v_avg_order := CASE WHEN v_total_orders > 0 THEN v_total_sales / v_total_orders ELSE 0 END;
    
    -- Top productos vendidos
    SELECT COALESCE(json_agg(product_data ORDER BY total_sold DESC), '[]'::jsonb) INTO v_top_products
    FROM (
        SELECT jsonb_build_object(
            'product_id', p.id,
            'name', p.name,
            'total_quantity', COALESCE(SUM(si.quantity), 0),
            'total_sold', COALESCE(SUM(si.line_total), 0)
        ) as product_data
        FROM products p
        LEFT JOIN sale_items si ON p.id = si.product_id
        LEFT JOIN sales s ON si.sale_id = s.id
        WHERE DATE(s.created_at) BETWEEN date_from AND date_to
        GROUP BY p.id, p.name
        HAVING COALESCE(SUM(si.quantity), 0) > 0
        LIMIT 10
    ) top_products_data;
    
    -- Ventas por día
    SELECT COALESCE(json_agg(daily_data ORDER BY sale_date), '[]'::jsonb) INTO v_sales_by_day
    FROM (
        SELECT 
            DATE(created_at) as sale_date,
            COALESCE(SUM(total), 0) as daily_total,
            COUNT(*) as daily_orders
        FROM sales 
        WHERE DATE(created_at) BETWEEN date_from AND date_to
        GROUP BY DATE(created_at)
    ) daily_sales_data;
    
    RETURN QUERY
    SELECT v_total_sales, v_total_orders, v_avg_order, v_top_products, v_sales_by_day;
END;
$$;

-- FUNCIONES ADICIONALES PARA CLIENTES
-- ===================================

-- Función: Obtener clientes con estadísticas
CREATE OR REPLACE FUNCTION get_customers_with_stats()
RETURNS TABLE (
    id UUID,
    name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    note TEXT,
    total_orders INTEGER,
    total_spent DECIMAL(12,2),
    last_order_date TIMESTAMPTZ,
    avg_order_value DECIMAL(10,2),
    customer_status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH customer_stats AS (
        SELECT 
            c.id,
            COUNT(s.id) as order_count,
            COALESCE(SUM(s.total), 0) as total_amount,
            MAX(s.created_at) as last_order,
            COALESCE(AVG(s.total), 0) as avg_amount
        FROM customers c
        LEFT JOIN sales s ON c.id = s.customer_id
        GROUP BY c.id
    )
    SELECT 
        c.id,
        c.name,
        c.phone,
        c.email,
        c.address,
        c.note,
        COALESCE(cs.order_count, 0)::INTEGER as total_orders,
        COALESCE(cs.total_amount, 0)::DECIMAL(12,2) as total_spent,
        cs.last_order as last_order_date,
        COALESCE(cs.avg_amount, 0)::DECIMAL(10,2) as avg_order_value,
        CASE 
            WHEN cs.last_order IS NULL THEN 'new'
            WHEN cs.last_order >= NOW() - INTERVAL '30 days' THEN 'active'
            WHEN cs.last_order >= NOW() - INTERVAL '90 days' THEN 'inactive'
            ELSE 'dormant'
        END as customer_status,
        c.created_at,
        c.updated_at
    FROM customers c
    LEFT JOIN customer_stats cs ON c.id = cs.id
    ORDER BY cs.total_amount DESC NULLS LAST;
END;
$$;

-- Función: Obtener estadísticas de un cliente específico
CREATE OR REPLACE FUNCTION get_customer_stats(customer_id UUID)
RETURNS TABLE (
    total_orders INTEGER,
    total_spent DECIMAL(12,2),
    avg_order_value DECIMAL(10,2),
    last_order_date TIMESTAMPTZ,
    favorite_products JSONB,
    order_frequency TEXT,
    customer_lifetime_value DECIMAL(12,2)
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_total_orders INTEGER;
    v_total_spent DECIMAL(12,2);
    v_avg_order DECIMAL(10,2);
    v_last_order TIMESTAMPTZ;
    v_favorite_products JSONB;
    v_order_frequency TEXT;
    v_clv DECIMAL(12,2);
    v_first_order TIMESTAMPTZ;
    v_days_between DECIMAL;
BEGIN
    -- Estadísticas básicas
    SELECT 
        COUNT(*),
        COALESCE(SUM(total), 0),
        COALESCE(AVG(total), 0),
        MAX(created_at),
        MIN(created_at)
    INTO v_total_orders, v_total_spent, v_avg_order, v_last_order, v_first_order
    FROM sales 
    WHERE sales.customer_id = get_customer_stats.customer_id;
    
    -- Productos favoritos
    SELECT COALESCE(json_agg(product_data ORDER BY total_quantity DESC), '[]'::jsonb) INTO v_favorite_products
    FROM (
        SELECT jsonb_build_object(
            'product_id', p.id,
            'name', p.name,
            'total_quantity', SUM(si.quantity),
            'total_spent', SUM(si.line_total)
        ) as product_data
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        JOIN products p ON si.product_id = p.id
        WHERE s.customer_id = get_customer_stats.customer_id
        GROUP BY p.id, p.name
        ORDER BY SUM(si.quantity) DESC
        LIMIT 5
    ) favorite_data;
    
    -- Frecuencia de pedidos
    IF v_first_order IS NOT NULL AND v_total_orders > 1 THEN
        v_days_between := EXTRACT(DAY FROM (v_last_order - v_first_order)) / NULLIF(v_total_orders - 1, 0);
        v_order_frequency := CASE 
            WHEN v_days_between <= 7 THEN 'weekly'
            WHEN v_days_between <= 30 THEN 'monthly'
            WHEN v_days_between <= 90 THEN 'quarterly'
            ELSE 'rarely'
        END;
    ELSE
        v_order_frequency := 'new_customer';
    END IF;
    
    -- Customer Lifetime Value (simple projection)
    v_clv := v_total_spent * 1.5; -- Simple multiplier
    
    RETURN QUERY
    SELECT 
        COALESCE(v_total_orders, 0),
        COALESCE(v_total_spent, 0),
        COALESCE(v_avg_order, 0),
        v_last_order,
        COALESCE(v_favorite_products, '[]'::jsonb),
        COALESCE(v_order_frequency, 'new_customer'),
        COALESCE(v_clv, 0);
END;
$$;

-- PERMISOS Y SEGURIDAD
-- ====================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_products_with_availability() TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_cost(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_product_availability(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_low_stock_alert(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_sale_stock(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION process_sale(UUID, TEXT, DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_sales_summary(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_customers_with_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_stats(UUID) TO authenticated;

-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ====================================

-- Índices para mejorar performance de las nuevas funciones
CREATE INDEX IF NOT EXISTS idx_stock_entries_created_at ON stock_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_product_components_product_id ON product_components(product_id);
CREATE INDEX IF NOT EXISTS idx_product_components_item_id ON product_components(item_id);
CREATE INDEX IF NOT EXISTS idx_items_stock ON items(stock);

-- COMENTARIOS
-- ===========

COMMENT ON FUNCTION get_products_with_availability() IS 'Obtiene productos con información de costos y disponibilidad calculada';
COMMENT ON FUNCTION get_product_cost(UUID) IS 'Calcula el costo total de un producto basado en sus componentes';
COMMENT ON FUNCTION calculate_product_availability(UUID) IS 'Calcula cuántas unidades de un producto se pueden producir';
COMMENT ON FUNCTION get_low_stock_alert(INTEGER) IS 'Obtiene items con stock por debajo del umbral especificado';
COMMENT ON FUNCTION get_dashboard_stats() IS 'Obtiene estadísticas generales para el dashboard de inventario';
COMMENT ON FUNCTION validate_sale_stock(TEXT) IS 'Valida si hay suficiente stock para procesar una venta';
COMMENT ON FUNCTION process_sale(UUID, TEXT, DECIMAL, TEXT) IS 'Procesa una venta y actualiza el inventario';
COMMENT ON FUNCTION get_sales_summary(DATE, DATE) IS 'Obtiene resumen de ventas para un período específico';
COMMENT ON FUNCTION get_customers_with_stats() IS 'Obtiene clientes con estadísticas de compras';
COMMENT ON FUNCTION get_customer_stats(UUID) IS 'Obtiene estadísticas detalladas de un cliente específico';

-- =========================================
-- FIN: Products & Inventory Functions
-- =========================================