# G-Admin Mini: Database Functions - Referencia Completa v3.0

**Fecha de actualización:** 20 de Agosto, 2025  
**Versión:** 3.0

## Resumen de Funciones

Este documento describe todas las funciones de PostgreSQL disponibles en la plataforma G-admin-mini, organizadas por categoría funcional. Estas funciones proporcionan la lógica de negocio completa para operaciones de restaurant, POS, analytics y gestión de clientes.

### Categorías de Funciones
- **Stock Management**: Gestión de inventario y materiales
- **Recipe Operations**: Cálculo de costos y producción
- **Analytics & Performance**: Métricas y reportes
- **Customer Management**: Perfiles RFM y segmentación
- **POS Operations**: Procesamiento de órdenes y pagos
- **Financial Operations**: AFIP, facturación e impuestos
- **Async Processing**: Operaciones en background

---

## 📦 Stock Management Functions

### check_stock_availability(product_id uuid)
```sql
CREATE OR REPLACE FUNCTION check_stock_availability(product_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    product_record RECORD;
    component_record RECORD;
    available_stock numeric;
    required_stock numeric;
BEGIN
    -- Get product information
    SELECT * INTO product_record 
    FROM products 
    WHERE id = product_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check if product requires ingredients
    IF NOT product_record.requires_ingredients THEN
        RETURN true;
    END IF;
    
    -- Check each component's availability
    FOR component_record IN
        SELECT pc.*, i.stock, i.unit
        FROM product_components pc
        JOIN items i ON pc.item_id = i.id
        WHERE pc.product_id = product_id
    LOOP
        available_stock := component_record.stock;
        required_stock := component_record.quantity_required;
        
        IF available_stock < required_stock THEN
            RETURN false;
        END IF;
    END LOOP;
    
    RETURN true;
END;
$$;
```

### update_stock_levels()
```sql
CREATE OR REPLACE FUNCTION update_stock_levels()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update the updated_at timestamp
    NEW.updated_at = now();
    
    -- Ensure stock cannot be negative
    IF NEW.stock < 0 THEN
        NEW.stock = 0;
    END IF;
    
    -- Log stock changes for audit trail
    INSERT INTO stock_audit_log (
        item_id, 
        old_stock, 
        new_stock, 
        change_reason, 
        changed_at
    ) VALUES (
        NEW.id,
        COALESCE(OLD.stock, 0),
        NEW.stock,
        'direct_update',
        now()
    );
    
    RETURN NEW;
END;
$$;
```

### consume_stock_for_sale(product_id uuid, quantity integer)
```sql
CREATE OR REPLACE FUNCTION consume_stock_for_sale(product_id uuid, quantity integer)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    component_record RECORD;
    total_consumed numeric;
BEGIN
    -- Consume stock for each component
    FOR component_record IN
        SELECT pc.item_id, pc.quantity_required
        FROM product_components pc
        WHERE pc.product_id = product_id
    LOOP
        total_consumed := component_record.quantity_required * quantity;
        
        UPDATE items 
        SET stock = stock - total_consumed,
            updated_at = now()
        WHERE id = component_record.item_id;
        
        -- Check if update was successful
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Failed to update stock for item %', component_record.item_id;
        END IF;
    END LOOP;
    
    RETURN true;
END;
$$;
```

### calculate_low_stock_items()
```sql
CREATE OR REPLACE FUNCTION calculate_low_stock_items()
RETURNS TABLE(
    item_id uuid,
    item_name character varying,
    current_stock numeric,
    min_stock numeric,
    stock_ratio numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.name,
        i.stock,
        i.min_stock,
        CASE 
            WHEN i.min_stock > 0 THEN i.stock / i.min_stock
            ELSE 1.0
        END as ratio
    FROM items i
    WHERE i.min_stock > 0 
      AND i.stock <= i.min_stock
    ORDER BY ratio ASC, i.name;
END;
$$;
```

---

## 🧾 Recipe Operations Functions

### calculate_recipe_cost(recipe_id uuid)
```sql
CREATE OR REPLACE FUNCTION calculate_recipe_cost(recipe_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
    ingredient_record RECORD;
    total_cost numeric := 0;
    adjusted_cost numeric;
BEGIN
    -- Calculate cost for each ingredient
    FOR ingredient_record IN
        SELECT 
            ri.quantity,
            ri.conversion_factor,
            ri.yield_percentage,
            ri.waste_percentage,
            ri.unit_cost_override,
            i.unit_cost,
            i.name as item_name
        FROM recipe_ingredients ri
        JOIN items i ON ri.item_id = i.id
        WHERE ri.recipe_id = calculate_recipe_cost.recipe_id
    LOOP
        -- Use override cost if specified, otherwise use item cost
        adjusted_cost := COALESCE(
            ingredient_record.unit_cost_override, 
            ingredient_record.unit_cost
        );
        
        -- Apply conversion factor
        adjusted_cost := adjusted_cost * ingredient_record.conversion_factor;
        
        -- Apply yield and waste percentages
        adjusted_cost := adjusted_cost * (100 + ingredient_record.waste_percentage) / 100;
        adjusted_cost := adjusted_cost * 100 / ingredient_record.yield_percentage;
        
        -- Calculate total for this ingredient
        total_cost := total_cost + (adjusted_cost * ingredient_record.quantity);
    END LOOP;
    
    -- Update recipe with calculated cost
    UPDATE recipes 
    SET base_cost = total_cost,
        updated_at = now()
    WHERE id = calculate_recipe_cost.recipe_id;
    
    RETURN total_cost;
END;
$$;
```

### update_recipe_costs()
```sql
CREATE OR REPLACE FUNCTION update_recipe_costs()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    recipe_record RECORD;
BEGIN
    -- Update all recipe costs
    FOR recipe_record IN
        SELECT id FROM recipes WHERE auto_calculate_cost = true
    LOOP
        PERFORM calculate_recipe_cost(recipe_record.id);
    END LOOP;
END;
$$;
```

### check_recipe_feasibility(recipe_id uuid, batch_quantity numeric)
```sql
CREATE OR REPLACE FUNCTION check_recipe_feasibility(recipe_id uuid, batch_quantity numeric)
RETURNS TABLE(
    is_feasible boolean,
    missing_ingredients jsonb,
    total_cost numeric
)
LANGUAGE plpgsql
AS $$
DECLARE
    ingredient_record RECORD;
    required_quantity numeric;
    available_stock numeric;
    missing_items jsonb := '[]'::jsonb;
    cost numeric := 0;
    feasible boolean := true;
BEGIN
    -- Check each ingredient
    FOR ingredient_record IN
        SELECT 
            ri.quantity,
            ri.conversion_factor,
            i.id as item_id,
            i.name as item_name,
            i.stock,
            i.unit_cost,
            i.unit
        FROM recipe_ingredients ri
        JOIN items i ON ri.item_id = i.id
        WHERE ri.recipe_id = check_recipe_feasibility.recipe_id
    LOOP
        required_quantity := ingredient_record.quantity * batch_quantity * ingredient_record.conversion_factor;
        available_stock := ingredient_record.stock;
        
        IF available_stock < required_quantity THEN
            feasible := false;
            missing_items := missing_items || jsonb_build_object(
                'item_id', ingredient_record.item_id,
                'item_name', ingredient_record.item_name,
                'required', required_quantity,
                'available', available_stock,
                'shortage', required_quantity - available_stock,
                'unit', ingredient_record.unit
            );
        END IF;
        
        cost := cost + (required_quantity * ingredient_record.unit_cost);
    END LOOP;
    
    RETURN QUERY SELECT feasible, missing_items, cost;
END;
$$;
```

### produce_recipe(recipe_id uuid, batch_quantity numeric)
```sql
CREATE OR REPLACE FUNCTION produce_recipe(recipe_id uuid, batch_quantity numeric)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    recipe_record RECORD;
    ingredient_record RECORD;
    required_quantity numeric;
    production_id uuid;
    total_cost numeric := 0;
BEGIN
    -- Get recipe information
    SELECT * INTO recipe_record 
    FROM recipes 
    WHERE id = recipe_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Recipe not found: %', recipe_id;
    END IF;
    
    -- Check feasibility first
    IF NOT (SELECT is_feasible FROM check_recipe_feasibility(recipe_id, batch_quantity)) THEN
        RAISE EXCEPTION 'Insufficient ingredients for recipe production';
    END IF;
    
    -- Create production record
    production_id := gen_random_uuid();
    
    -- Consume ingredients
    FOR ingredient_record IN
        SELECT 
            ri.quantity,
            ri.conversion_factor,
            i.id as item_id,
            i.unit_cost
        FROM recipe_ingredients ri
        JOIN items i ON ri.item_id = i.id
        WHERE ri.recipe_id = recipe_id
    LOOP
        required_quantity := ingredient_record.quantity * batch_quantity * ingredient_record.conversion_factor;
        total_cost := total_cost + (required_quantity * ingredient_record.unit_cost);
        
        UPDATE items 
        SET stock = stock - required_quantity,
            updated_at = now()
        WHERE id = ingredient_record.item_id;
    END LOOP;
    
    -- Add produced item to stock if it has an output item
    IF recipe_record.output_item_id IS NOT NULL THEN
        UPDATE items 
        SET stock = stock + (recipe_record.output_quantity * batch_quantity),
            updated_at = now()
        WHERE id = recipe_record.output_item_id;
    END IF;
    
    -- Log production
    INSERT INTO recipe_performance (
        recipe_id,
        times_produced,
        actual_cost
    ) VALUES (
        recipe_id,
        batch_quantity::integer,
        total_cost
    ) ON CONFLICT (recipe_id, date) 
    DO UPDATE SET
        times_produced = recipe_performance.times_produced + batch_quantity::integer,
        actual_cost = recipe_performance.actual_cost + total_cost;
    
    RETURN production_id;
END;
$$;
```

---

## 📊 Analytics & Performance Functions

### calculate_daily_analytics(target_date date)
```sql
CREATE OR REPLACE FUNCTION calculate_daily_analytics(target_date date)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    analytics_record RECORD;
BEGIN
    -- Calculate comprehensive daily metrics
    SELECT 
        COALESCE(SUM(o.total), 0) as total_revenue,
        COUNT(o.id) as total_orders,
        COALESCE(AVG(o.total), 0) as average_order_value,
        COALESCE(SUM(CASE WHEN p.party_size IS NOT NULL THEN p.party_size ELSE 1 END), 0) as total_covers,
        COALESCE(AVG(EXTRACT(EPOCH FROM (p.completed_at - p.seated_at))/3600), 0) as avg_service_hours,
        COALESCE(AVG(o.customer_rating), 0) as avg_satisfaction,
        COALESCE(SUM(pm.tip_amount), 0) as total_tips,
        COALESCE(SUM(o.discounts), 0) as total_discounts,
        COALESCE(SUM(CASE WHEN o.status = 'refunded' THEN o.total ELSE 0 END), 0) as refund_amount
    INTO analytics_record
    FROM orders o
    LEFT JOIN parties p ON o.party_id = p.id
    LEFT JOIN payment_methods pm ON o.id = pm.order_id
    WHERE DATE(o.created_at) = target_date
      AND o.status IN ('completed', 'refunded');
    
    -- Calculate table turnover rate
    WITH table_usage AS (
        SELECT 
            t.id,
            COUNT(p.id) as uses_count,
            AVG(EXTRACT(EPOCH FROM (p.completed_at - p.seated_at))/3600) as avg_duration
        FROM tables t
        LEFT JOIN parties p ON t.id = p.table_id 
                           AND DATE(p.seated_at) = target_date
                           AND p.completed_at IS NOT NULL
        GROUP BY t.id
    )
    SELECT COALESCE(AVG(uses_count), 0) INTO analytics_record.table_turnover_rate
    FROM table_usage;
    
    -- Upsert daily analytics
    INSERT INTO daily_analytics (
        date, total_revenue, total_orders, average_order_value,
        total_covers, table_turnover_rate, average_service_time,
        customer_satisfaction_avg, total_tips, total_discounts, refund_amount
    ) VALUES (
        target_date,
        analytics_record.total_revenue,
        analytics_record.total_orders,
        analytics_record.average_order_value,
        analytics_record.total_covers,
        analytics_record.table_turnover_rate,
        (analytics_record.avg_service_hours || ' hours')::interval,
        analytics_record.avg_satisfaction,
        analytics_record.total_tips,
        analytics_record.total_discounts,
        analytics_record.refund_amount
    ) ON CONFLICT (date) 
    DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        total_orders = EXCLUDED.total_orders,
        average_order_value = EXCLUDED.average_order_value,
        total_covers = EXCLUDED.total_covers,
        table_turnover_rate = EXCLUDED.table_turnover_rate,
        average_service_time = EXCLUDED.average_service_time,
        customer_satisfaction_avg = EXCLUDED.customer_satisfaction_avg,
        total_tips = EXCLUDED.total_tips,
        total_discounts = EXCLUDED.total_discounts,
        refund_amount = EXCLUDED.refund_amount;
END;
$$;
```

### calculate_menu_performance(target_date date)
```sql
CREATE OR REPLACE FUNCTION calculate_menu_performance(target_date date)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Calculate and rank menu items by performance
    WITH product_stats AS (
        SELECT 
            p.id as product_id,
            SUM(oi.quantity) as units_sold,
            SUM(oi.line_total) as revenue,
            AVG(o.customer_rating) as average_rating
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        WHERE DATE(o.created_at) = target_date
          AND o.status = 'completed'
        GROUP BY p.id
    ),
    ranked_stats AS (
        SELECT 
            *,
            ROW_NUMBER() OVER (ORDER BY revenue DESC) as rank_by_revenue,
            ROW_NUMBER() OVER (ORDER BY units_sold DESC) as rank_by_volume
        FROM product_stats
    )
    INSERT INTO menu_performance (
        product_id, date, units_sold, revenue, 
        average_rating, rank_by_revenue, rank_by_volume
    )
    SELECT 
        product_id, target_date, units_sold, revenue,
        average_rating, rank_by_revenue::smallint, rank_by_volume::smallint
    FROM ranked_stats
    ON CONFLICT (product_id, date) 
    DO UPDATE SET
        units_sold = EXCLUDED.units_sold,
        revenue = EXCLUDED.revenue,
        average_rating = EXCLUDED.average_rating,
        rank_by_revenue = EXCLUDED.rank_by_revenue,
        rank_by_volume = EXCLUDED.rank_by_volume;
END;
$$;
```

### analyze_menu_engineering(analysis_date date)
```sql
CREATE OR REPLACE FUNCTION analyze_menu_engineering(analysis_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    recipe_record RECORD;
    avg_popularity numeric;
    avg_profitability numeric;
    recommendation text;
BEGIN
    -- Calculate average metrics for benchmarking
    SELECT 
        AVG(popularity_score) as avg_pop,
        AVG(profitability_score) as avg_prof
    INTO avg_popularity, avg_profitability
    FROM recipes;
    
    -- Analyze each recipe
    FOR recipe_record IN
        SELECT 
            r.id,
            r.name,
            r.menu_category,
            r.popularity_score,
            r.profitability_score
        FROM recipes r
        WHERE r.menu_category IS NOT NULL
    LOOP
        -- Determine recommendation based on Boston Matrix
        IF recipe_record.popularity_score >= avg_popularity AND 
           recipe_record.profitability_score >= avg_profitability THEN
            recommendation := 'STAR - Maintain and promote';
        ELSIF recipe_record.popularity_score >= avg_popularity AND 
              recipe_record.profitability_score < avg_profitability THEN
            recommendation := 'PLOW HORSE - Increase price or reduce costs';
        ELSIF recipe_record.popularity_score < avg_popularity AND 
              recipe_record.profitability_score >= avg_profitability THEN
            recommendation := 'PUZZLE - Promote or reposition';
        ELSE
            recommendation := 'DOG - Consider removal or redesign';
        END IF;
        
        -- Store analysis
        INSERT INTO menu_engineering_analysis (
            recipe_id,
            analysis_date,
            popularity_index,
            profitability_index,
            menu_category,
            recommendation
        ) VALUES (
            recipe_record.id,
            analysis_date,
            recipe_record.popularity_score,
            recipe_record.profitability_score,
            recipe_record.menu_category,
            recommendation
        ) ON CONFLICT (recipe_id, analysis_date)
        DO UPDATE SET
            popularity_index = EXCLUDED.popularity_index,
            profitability_index = EXCLUDED.profitability_index,
            recommendation = EXCLUDED.recommendation;
    END LOOP;
END;
$$;
```

---

## 👥 Customer Management Functions

### calculate_customer_rfm(customer_id uuid)
```sql
CREATE OR REPLACE FUNCTION calculate_customer_rfm(customer_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    customer_metrics RECORD;
    rfm_segment text;
    churn_risk text;
    loyalty_tier text;
    is_vip boolean := false;
BEGIN
    -- Calculate RFM metrics
    SELECT 
        COALESCE(DATE_PART('day', CURRENT_DATE - MAX(s.created_at::date)), 999) as recency_days,
        COUNT(s.id) as frequency_count,
        COALESCE(AVG(s.total), 0) as avg_order_value,
        COALESCE(SUM(s.total), 0) as lifetime_value,
        MAX(s.created_at::date) as last_purchase_date,
        CASE 
            WHEN COUNT(s.id) > 0 THEN 
                DATE_PART('day', MAX(s.created_at::date) - MIN(s.created_at::date)) / NULLIF(COUNT(s.id), 1)
            ELSE 0
        END as visit_frequency
    INTO customer_metrics
    FROM customers c
    LEFT JOIN sales s ON c.id = s.customer_id AND s.status = 'completed'
    WHERE c.id = customer_id
    GROUP BY c.id;
    
    -- Determine RFM segment
    IF customer_metrics.recency_days <= 30 AND 
       customer_metrics.frequency_count >= 5 AND 
       customer_metrics.avg_order_value >= 50 THEN
        rfm_segment := 'CHAMPIONS';
        churn_risk := 'low';
        loyalty_tier := 'platinum';
        is_vip := true;
    ELSIF customer_metrics.recency_days <= 60 AND 
          customer_metrics.frequency_count >= 3 THEN
        rfm_segment := 'LOYAL_CUSTOMERS';
        churn_risk := 'low';
        loyalty_tier := 'gold';
    ELSIF customer_metrics.recency_days <= 90 AND 
          customer_metrics.frequency_count >= 2 THEN
        rfm_segment := 'POTENTIAL_LOYALISTS';
        churn_risk := 'medium';
        loyalty_tier := 'silver';
    ELSIF customer_metrics.recency_days > 180 THEN
        rfm_segment := 'AT_RISK';
        churn_risk := 'high';
        loyalty_tier := 'bronze';
    ELSE
        rfm_segment := 'NEW_CUSTOMERS';
        churn_risk := 'medium';
        loyalty_tier := 'bronze';
    END IF;
    
    -- Update or insert RFM profile
    INSERT INTO customer_rfm_profiles (
        customer_id, rfm_segment, churn_risk, recency_days,
        lifetime_value, last_purchase_date, avg_order_value,
        visit_frequency, is_vip, frequency_count, loyalty_tier
    ) VALUES (
        customer_id, rfm_segment, churn_risk, customer_metrics.recency_days,
        customer_metrics.lifetime_value, customer_metrics.last_purchase_date,
        customer_metrics.avg_order_value, customer_metrics.visit_frequency,
        is_vip, customer_metrics.frequency_count, loyalty_tier
    ) ON CONFLICT (customer_id)
    DO UPDATE SET
        rfm_segment = EXCLUDED.rfm_segment,
        churn_risk = EXCLUDED.churn_risk,
        recency_days = EXCLUDED.recency_days,
        lifetime_value = EXCLUDED.lifetime_value,
        last_purchase_date = EXCLUDED.last_purchase_date,
        avg_order_value = EXCLUDED.avg_order_value,
        visit_frequency = EXCLUDED.visit_frequency,
        is_vip = EXCLUDED.is_vip,
        frequency_count = EXCLUDED.frequency_count,
        loyalty_tier = EXCLUDED.loyalty_tier,
        updated_at = now();
END;
$$;
```

### process_customer_rfm_queue()
```sql
CREATE OR REPLACE FUNCTION process_customer_rfm_queue()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    queue_record RECORD;
BEGIN
    -- Process all queued customers
    FOR queue_record IN
        SELECT customer_id FROM customer_rfm_update_queue
        ORDER BY queued_at
        LIMIT 100
    LOOP
        PERFORM calculate_customer_rfm(queue_record.customer_id);
        
        DELETE FROM customer_rfm_update_queue 
        WHERE customer_id = queue_record.customer_id;
    END LOOP;
END;
$$;
```

---

## 🏪 POS Operations Functions

### create_order_with_validation(table_id uuid, customer_id uuid, order_type text, items jsonb)
```sql
CREATE OR REPLACE FUNCTION create_order_with_validation(
    table_id uuid,
    customer_id uuid DEFAULT NULL,
    order_type text DEFAULT 'dine_in',
    items jsonb DEFAULT '[]'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    order_id uuid;
    order_number text;
    item_record jsonb;
    product_record RECORD;
    subtotal numeric := 0;
    total numeric := 0;
    tax_rate numeric := 0.21; -- 21% IVA
BEGIN
    -- Generate order number
    order_number := 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || 
                   LPAD(nextval('order_number_seq')::text, 4, '0');
    
    -- Create order
    order_id := gen_random_uuid();
    
    INSERT INTO orders (
        id, order_number, table_id, customer_id, order_type,
        status, subtotal, taxes, total
    ) VALUES (
        order_id, order_number, table_id, customer_id, order_type,
        'pending', 0, 0, 0
    );
    
    -- Process each item
    FOR item_record IN SELECT * FROM jsonb_array_elements(items)
    LOOP
        -- Get product information
        SELECT * INTO product_record
        FROM products 
        WHERE id = (item_record->>'product_id')::uuid 
          AND is_active = true;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product not found or inactive: %', item_record->>'product_id';
        END IF;
        
        -- Check stock availability
        IF NOT check_stock_availability((item_record->>'product_id')::uuid) THEN
            RAISE EXCEPTION 'Insufficient stock for product: %', product_record.name;
        END IF;
        
        -- Add order item
        INSERT INTO order_items (
            order_id, product_id, quantity, unit_price, line_total
        ) VALUES (
            order_id,
            (item_record->>'product_id')::uuid,
            (item_record->>'quantity')::smallint,
            product_record.price,
            product_record.price * (item_record->>'quantity')::numeric
        );
        
        subtotal := subtotal + (product_record.price * (item_record->>'quantity')::numeric);
    END LOOP;
    
    -- Calculate totals
    total := subtotal * (1 + tax_rate);
    
    -- Update order totals
    UPDATE orders 
    SET subtotal = subtotal,
        taxes = total - subtotal,
        total = total,
        updated_at = now()
    WHERE id = order_id;
    
    RETURN order_id;
END;
$$;
```

### process_payment(order_id uuid, payment_data jsonb)
```sql
CREATE OR REPLACE FUNCTION process_payment(order_id uuid, payment_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    payment_id uuid;
    order_record RECORD;
    payment_amount numeric;
    payment_type text;
BEGIN
    -- Get order information
    SELECT * INTO order_record 
    FROM orders 
    WHERE id = order_id AND status = 'confirmed';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or not in confirmed status: %', order_id;
    END IF;
    
    -- Extract payment information
    payment_amount := (payment_data->>'amount')::numeric;
    payment_type := payment_data->>'type';
    
    -- Validate payment amount
    IF payment_amount < order_record.total THEN
        RAISE EXCEPTION 'Payment amount insufficient. Required: %, Provided: %', 
                       order_record.total, payment_amount;
    END IF;
    
    -- Create payment record
    payment_id := gen_random_uuid();
    
    INSERT INTO payment_methods (
        id, order_id, type, amount, status, processed_at,
        transaction_id, tip_amount
    ) VALUES (
        payment_id, order_id, payment_type, order_record.total, 'completed', now(),
        payment_data->>'transaction_id', COALESCE((payment_data->>'tip_amount')::numeric, 0)
    );
    
    -- Update order status
    UPDATE orders 
    SET status = 'completed',
        completed_at = now(),
        updated_at = now()
    WHERE id = order_id;
    
    -- Consume stock for completed order
    PERFORM consume_stock_for_order(order_id);
    
    -- Queue analytics update
    INSERT INTO async_update_queue (entity_type, entity_id, update_type)
    VALUES ('order', order_id, 'analytics');
    
    RETURN payment_id;
END;
$$;
```

### consume_stock_for_order(order_id uuid)
```sql
CREATE OR REPLACE FUNCTION consume_stock_for_order(order_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    item_record RECORD;
BEGIN
    -- Consume stock for each order item
    FOR item_record IN
        SELECT oi.product_id, oi.quantity
        FROM order_items oi
        WHERE oi.order_id = consume_stock_for_order.order_id
    LOOP
        PERFORM consume_stock_for_sale(item_record.product_id, item_record.quantity);
    END LOOP;
END;
$$;
```

---

## 💰 Financial Operations Functions

### generate_afip_invoice(sale_id uuid, invoice_type text)
```sql
CREATE OR REPLACE FUNCTION generate_afip_invoice(sale_id uuid, invoice_type text)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    invoice_id uuid;
    invoice_number text;
    sale_record RECORD;
    config_record RECORD;
    next_number integer;
BEGIN
    -- Get sale information
    SELECT * INTO sale_record
    FROM sales 
    WHERE id = sale_id AND status = 'completed';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sale not found or not completed: %', sale_id;
    END IF;
    
    -- Get AFIP configuration
    SELECT * INTO config_record
    FROM afip_configuration 
    WHERE is_active = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'AFIP configuration not found';
    END IF;
    
    -- Get next invoice number
    IF invoice_type = 'A' THEN
        next_number := config_record.last_used_number_a + 1;
        UPDATE afip_configuration 
        SET last_used_number_a = next_number 
        WHERE id = config_record.id;
    ELSIF invoice_type = 'B' THEN
        next_number := config_record.last_used_number_b + 1;
        UPDATE afip_configuration 
        SET last_used_number_b = next_number 
        WHERE id = config_record.id;
    ELSE
        next_number := config_record.last_used_number_c + 1;
        UPDATE afip_configuration 
        SET last_used_number_c = next_number 
        WHERE id = config_record.id;
    END IF;
    
    -- Generate invoice number
    invoice_number := LPAD(config_record.punto_venta::text, 5, '0') || '-' || 
                     LPAD(next_number::text, 8, '0');
    
    -- Create invoice
    invoice_id := gen_random_uuid();
    
    INSERT INTO invoices (
        id, invoice_number, customer_id, sale_id, invoice_type,
        subtotal, tax_amount, total, status, due_date
    ) VALUES (
        invoice_id, invoice_number, sale_record.customer_id, sale_id,
        invoice_type, sale_record.subtotal, sale_record.tax, sale_record.total,
        'sent', CURRENT_DATE + INTERVAL '30 days'
    );
    
    RETURN invoice_id;
END;
$$;
```

### calculate_tax_report(report_type text, year integer, month integer)
```sql
CREATE OR REPLACE FUNCTION calculate_tax_report(report_type text, year integer, month integer)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    report_id uuid;
    start_date date;
    end_date date;
    report_data jsonb;
BEGIN
    -- Calculate date range
    start_date := DATE(year || '-' || month || '-01');
    end_date := (start_date + INTERVAL '1 month - 1 day')::date;
    
    -- Generate report based on type
    IF report_type = 'iva' THEN
        SELECT jsonb_build_object(
            'total_sales', COALESCE(SUM(total), 0),
            'total_tax', COALESCE(SUM(tax_amount), 0),
            'invoices_count', COUNT(*),
            'by_type', jsonb_object_agg(invoice_type, 
                jsonb_build_object(
                    'count', count_by_type,
                    'total', total_by_type,
                    'tax', tax_by_type
                )
            )
        ) INTO report_data
        FROM (
            SELECT 
                invoice_type,
                COUNT(*) as count_by_type,
                SUM(total) as total_by_type,
                SUM(tax_amount) as tax_by_type,
                SUM(total) OVER () as total,
                SUM(tax_amount) OVER () as tax_amount
            FROM invoices
            WHERE created_at::date BETWEEN start_date AND end_date
              AND status != 'cancelled'
            GROUP BY invoice_type
        ) grouped;
    END IF;
    
    -- Create report record
    report_id := gen_random_uuid();
    
    INSERT INTO tax_reports (
        id, report_type, period_year, period_month, 
        status, generated_at
    ) VALUES (
        report_id, report_type, year, month,
        'generated', now()
    );
    
    RETURN report_id;
END;
$$;
```

---

## 🔄 Async Processing Functions

### queue_async_operation(entity_type text, entity_id uuid, operation_type text, priority smallint, payload jsonb)
```sql
CREATE OR REPLACE FUNCTION queue_async_operation(
    entity_type text,
    entity_id uuid,
    operation_type text,
    priority smallint DEFAULT 5,
    payload jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    operation_id uuid;
BEGIN
    operation_id := gen_random_uuid();
    
    INSERT INTO pos_async_operations (
        id, entity_type, entity_id, operation_type,
        priority, operation_payload
    ) VALUES (
        operation_id, entity_type::pos_entity_type, entity_id, 
        operation_type::pos_operation_type, priority, payload
    );
    
    RETURN operation_id;
END;
$$;
```

### process_async_operations(batch_size integer)
```sql
CREATE OR REPLACE FUNCTION process_async_operations(batch_size integer DEFAULT 10)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    operation_record RECORD;
    processed_count integer := 0;
    operation_success boolean;
    error_message text;
BEGIN
    -- Process operations by priority
    FOR operation_record IN
        SELECT * FROM pos_async_operations
        WHERE status = 'pending'
          AND (next_retry_at IS NULL OR next_retry_at <= now())
        ORDER BY priority DESC, created_at
        LIMIT batch_size
        FOR UPDATE SKIP LOCKED
    LOOP
        BEGIN
            -- Mark as started
            UPDATE pos_async_operations
            SET status = 'processing'::pos_async_status,
                started_at = now()
            WHERE id = operation_record.id;
            
            -- Process based on operation type
            operation_success := false;
            
            CASE operation_record.operation_type
                WHEN 'update_totals' THEN
                    -- Update order/sale totals
                    operation_success := process_totals_update(
                        operation_record.entity_type,
                        operation_record.entity_id,
                        operation_record.operation_payload
                    );
                    
                WHEN 'update_analytics' THEN
                    -- Update analytics data
                    operation_success := process_analytics_update(
                        operation_record.entity_type,
                        operation_record.entity_id,
                        operation_record.operation_payload
                    );
                    
                WHEN 'update_performance' THEN
                    -- Update performance metrics
                    operation_success := process_performance_update(
                        operation_record.entity_type,
                        operation_record.entity_id,
                        operation_record.operation_payload
                    );
                    
                ELSE
                    RAISE EXCEPTION 'Unknown operation type: %', operation_record.operation_type;
            END CASE;
            
            -- Mark as completed
            UPDATE pos_async_operations
            SET status = 'completed'::pos_async_status,
                completed_at = now()
            WHERE id = operation_record.id;
            
            processed_count := processed_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Handle failures
            error_message := SQLERRM;
            
            UPDATE pos_async_operations
            SET status = 'failed'::pos_async_status,
                retry_count = retry_count + 1,
                error_message = error_message,
                next_retry_at = now() + (INTERVAL '1 minute' * POWER(2, retry_count))
            WHERE id = operation_record.id;
            
            -- Move to dead letter queue if max retries exceeded
            IF operation_record.retry_count >= operation_record.max_retries THEN
                INSERT INTO pos_async_dead_letter_queue (
                    original_operation_id, entity_type, entity_id,
                    operation_type, final_error_message, total_retry_count,
                    original_payload
                ) VALUES (
                    operation_record.id, operation_record.entity_type,
                    operation_record.entity_id, operation_record.operation_type,
                    error_message, operation_record.retry_count,
                    operation_record.operation_payload
                );
                
                DELETE FROM pos_async_operations WHERE id = operation_record.id;
            END IF;
    END;
    END LOOP;
    
    RETURN processed_count;
END;
$$;
```

---

## 🛠️ Utility Functions

### get_dashboard_stats()
```sql
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    stats jsonb;
BEGIN
    SELECT jsonb_build_object(
        'today_revenue', COALESCE(today_revenue, 0),
        'today_orders', COALESCE(today_orders, 0),
        'avg_order_value', COALESCE(avg_order_value, 0),
        'active_tables', COALESCE(active_tables, 0),
        'pending_orders', COALESCE(pending_orders, 0),
        'low_stock_items', COALESCE(low_stock_count, 0),
        'top_products', top_products
    ) INTO stats
    FROM (
        SELECT 
            (SELECT COALESCE(SUM(total), 0) 
             FROM orders 
             WHERE DATE(created_at) = CURRENT_DATE 
               AND status = 'completed') as today_revenue,
            (SELECT COUNT(*) 
             FROM orders 
             WHERE DATE(created_at) = CURRENT_DATE) as today_orders,
            (SELECT COALESCE(AVG(total), 0) 
             FROM orders 
             WHERE DATE(created_at) = CURRENT_DATE 
               AND status = 'completed') as avg_order_value,
            (SELECT COUNT(*) 
             FROM tables 
             WHERE status = 'occupied') as active_tables,
            (SELECT COUNT(*) 
             FROM orders 
             WHERE status IN ('pending', 'confirmed', 'preparing')) as pending_orders,
            (SELECT COUNT(*) 
             FROM items 
             WHERE min_stock > 0 AND stock <= min_stock) as low_stock_count,
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'name', p.name,
                    'sales', sales_count
                ) ORDER BY sales_count DESC
             )
             FROM (
                SELECT p.name, COUNT(*) as sales_count
                FROM products p
                JOIN order_items oi ON p.id = oi.product_id
                JOIN orders o ON oi.order_id = o.id
                WHERE DATE(o.created_at) = CURRENT_DATE
                  AND o.status = 'completed'
                GROUP BY p.id, p.name
                LIMIT 5
             ) top) as top_products
    ) summary;
    
    RETURN stats;
END;
$$;
```

### clean_old_data(days_to_keep integer)
```sql
CREATE OR REPLACE FUNCTION clean_old_data(days_to_keep integer DEFAULT 90)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    cleanup_date date;
    deleted_counts jsonb;
BEGIN
    cleanup_date := CURRENT_DATE - days_to_keep;
    
    -- Clean completed orders older than specified days
    WITH deleted_orders AS (
        DELETE FROM orders 
        WHERE status = 'completed' 
          AND created_at::date < cleanup_date
        RETURNING id
    ),
    deleted_analytics AS (
        DELETE FROM daily_analytics 
        WHERE date < cleanup_date
        RETURNING id
    ),
    deleted_logs AS (
        DELETE FROM customer_update_log 
        WHERE updated_at::date < cleanup_date
        RETURNING id
    )
    SELECT jsonb_build_object(
        'deleted_orders', (SELECT COUNT(*) FROM deleted_orders),
        'deleted_analytics', (SELECT COUNT(*) FROM deleted_analytics),
        'deleted_logs', (SELECT COUNT(*) FROM deleted_logs),
        'cleanup_date', cleanup_date
    ) INTO deleted_counts;
    
    RETURN deleted_counts;
END;
$$;
```

---

## 📝 Triggers y Secuencias

### Sequences
```sql
-- Order number sequence
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Invoice number sequences
CREATE SEQUENCE IF NOT EXISTS invoice_a_seq START 1;
CREATE SEQUENCE IF NOT EXISTS invoice_b_seq START 1;
CREATE SEQUENCE IF NOT EXISTS invoice_c_seq START 1;
```

### Triggers
```sql
-- Trigger for stock updates
CREATE TRIGGER trigger_update_stock_levels
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_levels();

-- Trigger for customer RFM updates
CREATE TRIGGER trigger_queue_customer_rfm_update
    AFTER INSERT OR UPDATE ON sales
    FOR EACH ROW
    EXECUTE FUNCTION queue_customer_for_rfm_update();

-- Trigger for order totals calculation
CREATE TRIGGER trigger_calculate_order_totals
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_totals();
```

---

## 📊 Notas de Rendimiento

### Índices Recomendados
```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_date_status 
ON orders (created_at, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_customer_date 
ON sales (customer_id, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_stock_levels 
ON items (stock, min_stock) WHERE min_stock > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_async_operations_processing 
ON pos_async_operations (status, priority, created_at);
```

### Optimizaciones
- Usar paginación para consultas grandes
- Implementar cache para consultas frecuentes de dashboard
- Procesar operaciones asíncronas en batches
- Usar índices parciales para consultas específicas

---

**Documento generado automáticamente - G-Admin Mini v3.0**  
**Total de funciones documentadas: 25+**

### Alertas y Valorización
```sql
get_low_stock_alert(p_threshold int=10) -> TABLE
```
Devuelve los items con stock bajo, clasificados por urgencia y sugiriendo cantidad a pedir.  
**Campos retornados:** item_id, item_name, item_type, unit, current_stock, threshold_used, urgency_level, suggested_order_quantity, unit_cost, estimated_cost, last_stock_entry_date, days_since_last_entry

```sql
get_stock_valuation() -> TABLE
```
Valorización total del stock con porcentaje de participación por ítem.  
**Campos retornados:** item_id, item_name, item_type, current_stock, unit_cost, total_value, percentage_of_total

### Operaciones de Stock
```sql
update_item_stock(p_item_id UUID, p_quantity_to_add INT) -> BOOL
```
Actualiza el stock de un ítem (positivo o negativo). Valida que no quede en negativo.

```sql
validate_stock_operation(p_item_id UUID, p_quantity INT) -> BOOL
```
Valida si una operación de stock es válida (no deja el stock negativo).

### Gestión de Items
```sql
soft_delete_item(p_item_id UUID) -> BOOL
```
Elimina un ítem solo si no está en uso (productos o recetas).

```sql
get_item_history(p_item_id UUID) -> TABLE
```
Devuelve historial de ingresos (stock_entries) para un ítem.  
**Campos retornados:** event_date, event_type, quantity, unit_cost, note, reference_id

---

## 🧾 RECETAS

### Cálculos de Costos
```sql
calculate_recipe_cost(p_recipe_id UUID) -> NUMERIC
```
Calcula el costo total de una receta basado en los costos unitarios de los ingredientes.

```sql
get_recipe_viability(p_recipe_id UUID) -> TABLE
```
Evalúa si hay stock suficiente para ejecutar la receta.  
**Campos retornados:** is_viable, missing_ingredients

### Listados con Información Completa
```sql
get_recipes_with_costs() -> TABLE
```
Lista todas las recetas con su costo total y costo por unidad, además de viabilidad.  
**Campos retornados:** recipe_id, recipe_name, output_item_name, output_quantity, total_cost, cost_per_unit, is_viable

### Ejecución de Recetas
```sql
execute_recipe(p_recipe_id UUID, p_batches INT=1) -> TABLE
```
Descuenta stock de ingredientes y aumenta stock del producto final (elaboración).  
**Retorna:** success, message, items_consumed, items_produced

---

## 🛒 PRODUCTOS

### Disponibilidad y Costos
```sql
get_products_with_availability() -> TABLE
```
Devuelve productos con disponibilidad estimada y costo de producción.  
**Campos retornados:** id, name, unit, type, description, cost, availability, components_count, created_at, updated_at

```sql
calculate_product_availability(p_product_id UUID) -> INT
```
Calcula cuántas unidades de un producto se pueden fabricar según el stock disponible.

```sql
get_product_cost(p_product_id UUID) -> NUMERIC
```
Costo total de producción de un producto según componentes.

---

## 💵 VENTAS

### Procesamiento de Ventas
```sql
process_sale(p_customer_id UUID, p_items_array JSONB, p_total NUMERIC, p_sale_note TEXT=NULL) -> TABLE
```
Procesa una venta: registra, descuenta stock de ingredientes y devuelve estado.  
**JSON Structure:** `[{"product_id": "uuid", "quantity": 2, "unit_price": 150.00}]`  
**Retorna:** success, sale_id, message

```sql
validate_sale_stock(p_items_array JSONB) -> TABLE
```
Verifica si hay stock suficiente para todos los productos en una venta.  
**Retorna:** is_valid, error_message, insufficient_items

### Reportes de Ventas
```sql
get_sales_summary(p_date_from TIMESTAMP=NULL, p_date_to TIMESTAMP=NULL) -> TABLE
```
Resumen de ventas: totales, promedio, y cliente principal.  
**Campos retornados:** total_sales, total_revenue, avg_sale_amount, top_customer_id, top_customer_name, top_customer_sales

```sql
get_monthly_stats(p_year INT, p_month INT) -> TABLE
```
Estadísticas del mes: ventas, ingresos, ítems nuevos, producto más vendido.  
**Campos retornados:** month_year, total_sales, total_revenue, stock_entries_count, stock_entries_value, new_items_count, top_selling_product

---

## 🏪 POS (POINT OF SALE) SYSTEM

### Gestión de Mesas y Estimaciones
```sql
pos_estimate_next_table_available() -> JSON
```
Estima cuándo estará disponible la próxima mesa basado en ocupación actual y tiempos promedio.  
**Retorna:** next_available_time, tables_available, estimated_wait_minutes, current_occupancy_rate, confidence_level

```sql
pos_calculate_wait_time_estimate(party_size INT, time_slot TIMESTAMPTZ=NOW()) -> JSON
```
Calcula tiempo de espera estimado para un grupo específico.  
**Retorna:** average_wait_time, current_wait_time, queue_length, peak_hour_adjustment, confidence_level

```sql
pos_get_table_performance_analytics(date_from DATE=CURRENT_DATE-7, date_to DATE=CURRENT_DATE) -> TABLE
```
Analytics de rendimiento por mesa en período específico.  
**Campos retornados:** table_id, table_number, total_parties, total_revenue, average_turn_time, utilization_rate, customer_satisfaction, peak_hours[], revenue_per_hour, efficiency_score

### Procesamiento de Ventas POS
```sql
pos_process_sale_with_order(customer_id UUID=NULL, table_id UUID=NULL, items_array JSONB='[]', total NUMERIC=0, order_type TEXT='dine_in', note TEXT=NULL, special_instructions TEXT[]='{}'::TEXT[], estimated_prep_time INT=30) -> JSON
```
Procesa venta completa con orden para cocina y seguimiento.  
**Retorna:** success, sale_id, order_id, order_number, estimated_ready_time, total_items, estimated_prep_minutes

```sql
pos_process_multiple_payments(sale_id UUID, payments_array JSONB) -> JSON
```
Procesa múltiples métodos de pago para una venta.  
**JSON Structure:** `[{"type": "cash", "amount": 1000, "tip_amount": 100}]`  
**Retorna:** success, total_paid, total_tips, payment_status, change_due, processing_summary

### Órdenes QR y Gestión Digital
```sql
pos_create_qr_order(table_id UUID, expiration_hours INT=8, customer_info JSONB='{}') -> JSON
```
Crea orden QR para mesa con sessión digital.  
**Retorna:** success, qr_order_id, qr_code, session_token, qr_url, menu_url, status_url

```sql
pos_get_kitchen_orders(station_filter TEXT=NULL, priority_filter TEXT=NULL, limit_orders INT=50) -> TABLE
```
Obtiene órdenes para cocina con filtros por estación y prioridad.  
**Campos retornados:** order_id, order_number, table_number, order_time, estimated_ready_time, priority, items_completed, items_total, completion_percentage, urgency_level

### Analytics y Reportes POS
```sql
pos_get_comprehensive_sales_analytics(date_from DATE=CURRENT_DATE-7, date_to DATE=CURRENT_DATE) -> JSON
```
Analytics completos de ventas con métricas de rendimiento, clientes y operaciones.  
**Retorna:** revenue metrics, performance metrics, customer metrics, operational metrics, trend metrics

```sql
pos_update_daily_analytics() -> JSON
```
Actualiza analytics diarios y procesa operaciones pendientes.  
**Retorna:** success, operations_completed, async_operations_processed, performance_metrics, system_health

### Gestión de Sistema POS
```sql
pos_update_table_color_codes() -> JSON
```
Actualiza códigos de color de mesas basado en tiempos de servicio y estados.  
**Retorna:** success, updated_tables, color_rules, summary por colores

```sql
pos_process_async_operations(batch_size INT=25, max_processing_time_seconds INT=30) -> JSON
```
Procesa operaciones asíncronas en lotes para mejor rendimiento.  
**Retorna:** success, operations_processed, operations_failed, operations_retried, processing_time_ms

---

## 👥 CUSTOMER INTELLIGENCE & RFM ANALYTICS

### Perfiles RFM Avanzados
```sql
calculate_customer_rfm_profiles(analysis_period_days INT=365) -> INT
```
Calcula perfiles RFM para todos los clientes usando análisis estadístico NTILE.  
**Algoritmo:** Utiliza window functions para scoring preciso basado en quintiles  
**Retorna:** número de perfiles procesados

```sql
refresh_customer_analytics_views() -> VOID
```
Refresca vistas materializadas de analytics de clientes.

### Triggers y Automatización
```sql
trigger_update_customer_rfm() -> TRIGGER
```
Sistema de cola optimizado para updates RFM con manejo batch de customer IDs afectados.

```sql
process_rfm_update_queue() -> INT
```
Procesador background para la cola RFM con procesamiento en batches cada 5 minutos.  
**Retorna:** cantidad de customers procesados

```sql
update_customer_timestamp() -> TRIGGER
```
Actualización automática de timestamps con logging opcional de campos modificados.

```sql
create_timestamp_triggers() -> PROCEDURE
```
Crea triggers de timestamp para todas las tablas customer_intelligence.

---

## 🔧 ORDER MANAGEMENT & LIFECYCLE

### Gestión de Órdenes
```sql
generate_safe_order_number() -> TRIGGER
```
Genera números de orden únicos y seguros con formato 'ORD-YYYYMMDD-NNNNNN'.

```sql
calculate_line_total() -> TRIGGER
```
Calcula totales de línea automáticamente (quantity * unit_price).

```sql
queue_order_total_update() -> TRIGGER
```
Encola cálculos costosos para procesamiento asíncrono.

### Ciclo de Vida de Parties
```sql
manage_party_lifecycle() -> TRIGGER
```
Gestiona el ciclo completo de parties: validaciones, cálculo de duración, actualización de métricas.

```sql
manage_qr_order_lifecycle() -> TRIGGER
```
Gestiona el ciclo de vida de órdenes QR con expiración automática y cálculo de totales.

---

## 📊 DASHBOARD / ESTADÍSTICAS

### Métricas Generales
```sql
get_dashboard_stats() -> TABLE
```
Estadísticas rápidas: ítems totales, valor de stock, entradas del mes, ítems bajos.  
**Campos retornados:** total_items, total_stock_value, stock_entries_this_month, low_stock_items

---

## 🔐 SECURITY & ACCESS CONTROL

### Gestión de Permisos
```sql
get_user_role() -> TEXT
```
Obtiene el rol del usuario actual desde JWT token.  
**Retorna:** role string ('admin', 'staff', etc.)

```sql
check_user_access(required_role TEXT='authenticated') -> BOOL
```
Verifica permisos de acceso para Row Level Security (RLS).  
**Roles soportados:** 'authenticated', 'admin'

---

## 🛠️ TRIGGERS & AUTOMATION

### Triggers de Sistema
```sql
update_updated_at_column() -> TRIGGER
```
Actualiza updated_at automáticamente en tablas con este campo.

```sql
trigger_update_stock_on_entry() -> TRIGGER
```
Ajusta el stock cuando se insertan, actualizan o eliminan stock_entries.

---

## 🛠️ UTILIDADES & DEBUG

### Funciones de Prueba
```sql
test_function() -> TEXT
```
Función de prueba simple para verificar que el sistema funciona.

### Funciones de Utilidad
```sql
get_day(ts TIMESTAMPTZ) -> DATE
```
Extrae la fecha (sin hora) de un timestamp con zona horaria.

---

## 📋 TIPOS DE DATOS Y ENUMS POS

### Enums del Sistema POS
- **pos_entity_type:** 'sale', 'order', 'table', 'customer'
- **pos_operation_type:** 'calculate_totals', 'update_metrics', 'update_analytics', 'send_notification'
- **order_status:** 'pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'
- **payment_status:** 'pending', 'partially_paid', 'completed', 'refunded', 'failed'
- **table_status:** 'available', 'occupied', 'reserved', 'cleaning', 'maintenance'
- **priority_level:** 'low', 'normal', 'high', 'urgent', 'vip'

### Estructuras JSONB Principales

#### Payment Methods Array
```json
[
  {
    "type": "cash|credit_card|debit_card|nfc_card|mobile_wallet|qr_code|digital_wallet|gift_card|store_credit",
    "amount": 1500.00,
    "tip_amount": 150.00,
    "provider": "visa|mastercard|amex|mercadopago",
    "transaction_id": "TXN-123456",
    "authorization_code": "AUTH-789",
    "is_contactless": true,
    "receipt_method": "printed|email|sms|none",
    "last_four_digits": "1234",
    "card_brand": "visa"
  }
]
```

#### Items Array (Sales/Orders)
```json
[
  {
    "product_id": "uuid",
    "quantity": 2,
    "unit_price": 850.00,
    "special_instructions": "Sin cebolla",
    "modifications": ["extra_cheese", "no_onions"],
    "temperature_preference": "hot|cold|room_temp",
    "spice_level": 1-5
  }
]
```

#### Customer Info (QR Orders)
```json
{
  "name": "Juan Pérez",
  "phone": "+54 11 1234-5678",
  "email": "juan@email.com",
  "party_size": 4,
  "special_requests": "Mesa cerca de ventana",
  "allergies": ["nuts", "gluten"]
}
```

---

## 🔄 ASYNC OPERATIONS SYSTEM

### Queue Management
El sistema POS implementa un robusto sistema de operaciones asíncronas para manejar tareas costosas:

- **Priority Levels:** 1-10 (10 = más urgente)
- **Retry Logic:** Exponential backoff con máximo de reintentos
- **Dead Letter Queue:** Para operaciones que fallan permanentemente
- **Batch Processing:** Procesa múltiples operaciones en lotes

### Tipos de Operaciones Asíncronas
- **calculate_totals:** Recálculo de totales de órdenes/ventas
- **update_metrics:** Actualización de métricas de mesas y rendimiento
- **update_analytics:** Procesamiento de analytics complejos
- **send_notification:** Envío de notificaciones a staff/clientes

---

## 📈 PERFORMANCE OPTIMIZATIONS

### Índices Implementados
- **GIN indexes** en campos JSONB para queries rápidas
- **BRIN indexes** en timestamps para eficiencia temporal  
- **Composite indexes** en relaciones customer/table/order
- **Partial indexes** en estados activos/pendientes
- **CONCURRENTLY** creados para zero-downtime

### Optimizaciones de Consulta
- **Window Functions** para cálculos RFM precisos
- **CTEs** para queries complejas legibles
- **UPSERT patterns** para evitar race conditions
- **Batch operations** para reducir overhead de DB

---

## 🚀 MIGRATION & DEPLOYMENT

### Secuencia de Deployment
1. **Core Functions:** Items, Stock, Recipes, Products, Sales
2. **Customer Intelligence:** RFM, Analytics, Triggers
3. **POS System:** Tables, Orders, Payments, QR
4. **Async Operations:** Queue, Processing, Dead Letter
5. **Security & RLS:** Permissions, Access Control

### Rollback Strategy
- Cada función tiene validación de entrada robusta
- Manejo de excepciones completo con logging
- Compatibilidad hacia atrás mantenida
- Scripts de rollback automático disponibles

---

## 🔍 TROUBLESHOOTING GUIDE

### Problemas Comunes

#### RFM Analysis Slow
```sql
-- Verificar queue status
SELECT COUNT(*) FROM customer_rfm_update_queue;

-- Procesar manualmente
SELECT process_rfm_update_queue();
```

#### Async Operations Stuck
```sql
-- Check pending operations
SELECT COUNT(*), status FROM pos_async_operations GROUP BY status;

-- Manual processing
SELECT pos_process_async_operations(50, 60);
```

#### Table Colors Not Updating
```sql
-- Manual color update
SELECT pos_update_table_color_codes();
```

---

**📝 Nota:** Este documento es la referencia oficial de funciones de la base de datos G-Admin Mini v3.0. Incluye el sistema POS completo, customer intelligence avanzado, y gestión de operaciones asíncronas.

**🔄 Actualización v3.0:** Incorpora 45+ funciones nuevas del sistema POS, customer intelligence, y optimizaciones de performance para operaciones de alto volumen.

**🎯 Próxima versión:** Machine Learning predictions, API integrations, y advanced reporting capabilities.