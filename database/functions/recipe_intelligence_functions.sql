-- Recipe Intelligence Functions v3.0

-- ========================================================
-- CORE RECIPE FUNCTIONS (REQUIRED BY API)
-- ========================================================

-- Calculate recipe cost with yield factors
CREATE OR REPLACE FUNCTION calculate_recipe_cost(recipe_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_cost NUMERIC := 0.0;
    ingredient_record RECORD;
    ingredient_cost NUMERIC;
    yield_adjusted_quantity NUMERIC;
BEGIN
    -- Calculate cost of all ingredients with yield adjustments
    FOR ingredient_record IN 
        SELECT 
            ri.quantity,
            COALESCE(ri.yield_percentage, 100.0) as yield_percentage,
            ri.unit_cost_override,
            i.unit_cost,
            i.name as ingredient_name
        FROM recipe_ingredients ri
        JOIN items i ON ri.item_id = i.id
        WHERE ri.recipe_id = calculate_recipe_cost.recipe_id
    LOOP
        -- Use override cost if available, otherwise use item unit_cost
        ingredient_cost := COALESCE(ingredient_record.unit_cost_override, ingredient_record.unit_cost, 0.0);
        
        -- Adjust quantity for yield percentage (default 100%)
        yield_adjusted_quantity := ingredient_record.quantity / (ingredient_record.yield_percentage / 100.0);
        
        -- Add to total cost
        total_cost := total_cost + (yield_adjusted_quantity * ingredient_cost);
    END LOOP;
    
    -- Add recipe-level costs (base, labor, overhead)
    SELECT 
        total_cost + COALESCE(base_cost, 0.0) + COALESCE(labor_cost, 0.0) + COALESCE(overhead_cost, 0.0)
    INTO total_cost
    FROM recipes r
    WHERE r.id = calculate_recipe_cost.recipe_id;
    
    RETURN COALESCE(total_cost, 0.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

FUNC_EOF < /dev/null

-- Get recipes with cost calculation
CREATE OR REPLACE FUNCTION get_recipes_with_costs()
RETURNS TABLE (
    id UUID,
    name TEXT,
    output_item_id UUID,
    output_quantity INTEGER,
    total_cost NUMERIC,
    cost_per_unit NUMERIC,
    preparation_time INTEGER,
    instructions TEXT,
    ingredient_count INTEGER,
    is_viable BOOLEAN,
    missing_ingredients JSONB,
    output_item JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.output_item_id,
        r.output_quantity,
        COALESCE(calculate_recipe_cost(r.id), 0.0) as total_cost,
        CASE 
            WHEN r.output_quantity > 0 THEN COALESCE(calculate_recipe_cost(r.id), 0.0) / r.output_quantity 
            ELSE 0.0 
        END as cost_per_unit,
        r.preparation_time,
        r.instructions,
        (SELECT COUNT(*)::INTEGER FROM recipe_ingredients ri WHERE ri.recipe_id = r.id) as ingredient_count,
        (SELECT viability.is_viable FROM get_recipe_viability(r.id) viability) as is_viable,
        (SELECT viability.missing_ingredients FROM get_recipe_viability(r.id) viability) as missing_ingredients,
        json_build_object(
            'id', oi.id,
            'name', oi.name,
            'unit', oi.unit,
            'type', oi.type
        ) as output_item
    FROM recipes r
    LEFT JOIN items oi ON r.output_item_id = oi.id
    ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

EOF2 < /dev/null

-- Check recipe viability (stock availability)
CREATE OR REPLACE FUNCTION get_recipe_viability(recipe_id UUID)
RETURNS JSONB AS $$
DECLARE
    is_viable BOOLEAN := true;
    missing_items JSONB := '[]'::JSONB;
    ingredient_record RECORD;
    required_quantity NUMERIC;
BEGIN
    -- Check each ingredient availability
    FOR ingredient_record IN 
        SELECT 
            ri.quantity,
            COALESCE(ri.conversion_factor, 1.0) as conversion_factor,
            i.id as item_id,
            i.name as item_name,
            i.stock,
            i.unit
        FROM recipe_ingredients ri
        JOIN items i ON ri.item_id = i.id
        WHERE ri.recipe_id = get_recipe_viability.recipe_id
    LOOP
        required_quantity := ingredient_record.quantity * ingredient_record.conversion_factor;
        
        IF ingredient_record.stock < required_quantity THEN
            is_viable := false;
            missing_items := missing_items || jsonb_build_object(
                'item_id', ingredient_record.item_id,
                'item_name', ingredient_record.item_name,
                'unit', ingredient_record.unit,
                'required', required_quantity,
                'available', ingredient_record.stock,
                'missing', required_quantity - ingredient_record.stock
            );
        END IF;
    END LOOP;
    
    RETURN jsonb_build_object(
        'is_viable', is_viable,
        'missing_ingredients', missing_items,
        'checked_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

EOF3 < /dev/null

-- Execute recipe (consume ingredients, produce output)
CREATE OR REPLACE FUNCTION execute_recipe(recipe_id UUID, batches INTEGER DEFAULT 1)
RETURNS JSONB AS $$
DECLARE
    recipe_record RECORD;
    ingredient_record RECORD;
    items_consumed JSONB := '[]'::JSONB;
    items_produced JSONB := '[]'::JSONB;
    viability_check JSONB;
    required_quantity NUMERIC;
    total_produced NUMERIC;
BEGIN
    -- Validate batches parameter
    IF batches <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Batches must be greater than 0',
            'items_consumed', '[]'::JSONB,
            'items_produced', '[]'::JSONB
        );
    END IF;
    
    -- Get recipe information
    SELECT * INTO recipe_record FROM recipes WHERE id = execute_recipe.recipe_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Recipe not found',
            'items_consumed', '[]'::JSONB,
            'items_produced', '[]'::JSONB
        );
    END IF;
    
    -- Check viability for the requested batches
    viability_check := get_recipe_viability(execute_recipe.recipe_id);
    
    -- Execute the recipe: consume ingredients
    FOR ingredient_record IN 
        SELECT 
            ri.quantity,
            COALESCE(ri.conversion_factor, 1.0) as conversion_factor,
            i.id as item_id,
            i.name as item_name,
            i.unit
        FROM recipe_ingredients ri
        JOIN items i ON ri.item_id = i.id
        WHERE ri.recipe_id = execute_recipe.recipe_id
    LOOP
        required_quantity := ingredient_record.quantity * ingredient_record.conversion_factor * batches;
        
        -- Update stock
        UPDATE items 
        SET stock = stock - required_quantity::INTEGER,
            updated_at = NOW()
        WHERE id = ingredient_record.item_id;
        
        -- Record consumption
        items_consumed := items_consumed || jsonb_build_object(
            'item_id', ingredient_record.item_id,
            'item_name', ingredient_record.item_name,
            'unit', ingredient_record.unit,
            'quantity', required_quantity
        );
    END LOOP;
    
    -- Produce output item
    total_produced := recipe_record.output_quantity * batches;
    
    UPDATE items 
    SET stock = stock + total_produced::INTEGER,
        updated_at = NOW()
    WHERE id = recipe_record.output_item_id;
    
    -- Record production
    SELECT jsonb_build_object(
        'item_id', i.id,
        'item_name', i.name,
        'unit', i.unit,
        'quantity', total_produced
    ) INTO items_produced
    FROM items i 
    WHERE i.id = recipe_record.output_item_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', format('Successfully executed recipe %s batches', batches),
        'items_consumed', items_consumed,
        'items_produced', jsonb_build_array(items_produced),
        'total_cost', calculate_recipe_cost(execute_recipe.recipe_id) * batches,
        'executed_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_recipes_with_costs() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_recipe_cost(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recipe_viability(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_recipe(UUID, INTEGER) TO authenticated;

SELECT 'Recipe Intelligence Functions Created Successfully\!' as status;

EOF4 < /dev/null

-- ========================================================
-- ADVANCED MENU ENGINEERING FUNCTIONS
-- ========================================================

-- Get menu engineering matrix analysis
CREATE OR REPLACE FUNCTION get_menu_engineering_matrix()
RETURNS TABLE (
    recipe_id UUID,
    recipe_name TEXT,
    popularity_index NUMERIC,
    profitability_index NUMERIC,
    menu_category TEXT,
    units_sold INTEGER,
    revenue NUMERIC,
    profit NUMERIC,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH recipe_sales AS (
        -- Get sales data for recipes from performance tracking
        SELECT 
            r.id as recipe_id,
            r.name as recipe_name,
            COALESCE(rp.times_sold, 0) as units_sold,
            COALESCE(rp.revenue_generated, 0.0) as revenue,
            calculate_recipe_cost(r.id) as cost
        FROM recipes r
        LEFT JOIN recipe_performance rp ON r.id = rp.recipe_id 
            AND rp.date >= CURRENT_DATE - INTERVAL '30 days'
    ),
    metrics AS (
        SELECT 
            recipe_id,
            recipe_name,
            units_sold,
            revenue,
            cost,
            revenue - (cost * units_sold) as profit,
            -- Calculate popularity index (% of total orders)
            CASE 
                WHEN SUM(units_sold) OVER () > 0 
                THEN (units_sold::NUMERIC / SUM(units_sold) OVER ()) * 100.0
                ELSE 0.0 
            END as popularity_index,
            -- Calculate profitability index (profit margin)
            CASE 
                WHEN revenue > 0 
                THEN ((revenue - (cost * units_sold)) / revenue) * 100.0
                ELSE 0.0 
            END as profitability_index
        FROM recipe_sales
    )
    SELECT 
        m.recipe_id,
        m.recipe_name,
        m.popularity_index,
        m.profitability_index,
        CASE 
            WHEN m.popularity_index > 50 AND m.profitability_index > 50 THEN 'stars'
            WHEN m.popularity_index > 50 AND m.profitability_index <= 50 THEN 'plowhorses'
            WHEN m.popularity_index <= 50 AND m.profitability_index > 50 THEN 'puzzles'
            ELSE 'dogs'
        END as menu_category,
        m.units_sold,
        m.revenue,
        m.profit,
        CASE 
            WHEN m.popularity_index > 50 AND m.profitability_index > 50 THEN 'Promote heavily - high profit and popular'
            WHEN m.popularity_index > 50 AND m.profitability_index <= 50 THEN 'Increase price or reduce cost'
            WHEN m.popularity_index <= 50 AND m.profitability_index > 50 THEN 'Market more aggressively'
            ELSE 'Consider removing or complete redesign'
        END as recommendation
    FROM metrics m
    ORDER BY m.popularity_index DESC, m.profitability_index DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced cost calculation with detailed yield factors
CREATE OR REPLACE FUNCTION calculate_recipe_cost_with_yield(recipe_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    ingredient_costs JSONB := '[]'::JSONB;
    total_ingredient_cost NUMERIC := 0.0;
    total_recipe_cost NUMERIC := 0.0;
    ingredient_record RECORD;
BEGIN
    -- Calculate detailed cost breakdown with yield factors
    FOR ingredient_record IN 
        SELECT 
            ri.quantity,
            COALESCE(ri.yield_percentage, 100.0) as yield_percentage,
            COALESCE(ri.waste_percentage, 0.0) as waste_percentage,
            COALESCE(ri.conversion_factor, 1.0) as conversion_factor,
            COALESCE(ri.unit_cost_override, i.unit_cost, 0.0) as unit_cost,
            i.id as item_id,
            i.name as item_name,
            i.unit,
            i.type
        FROM recipe_ingredients ri
        JOIN items i ON ri.item_id = i.id
        WHERE ri.recipe_id = calculate_recipe_cost_with_yield.recipe_id
    LOOP
        DECLARE
            yield_factor NUMERIC;
            waste_factor NUMERIC;
            adjusted_quantity NUMERIC;
            ingredient_total_cost NUMERIC;
        BEGIN
            -- Calculate adjustment factors
            yield_factor := ingredient_record.yield_percentage / 100.0;
            waste_factor := 1.0 + (ingredient_record.waste_percentage / 100.0);
            
            -- Calculate adjusted quantity (accounting for yield loss and waste)
            adjusted_quantity := (ingredient_record.quantity * ingredient_record.conversion_factor) 
                                / yield_factor * waste_factor;
            
            ingredient_total_cost := adjusted_quantity * ingredient_record.unit_cost;
            total_ingredient_cost := total_ingredient_cost + ingredient_total_cost;
            
            -- Add detailed ingredient breakdown
            ingredient_costs := ingredient_costs || jsonb_build_object(
                'item_id', ingredient_record.item_id,
                'item_name', ingredient_record.item_name,
                'unit', ingredient_record.unit,
                'recipe_quantity', ingredient_record.quantity,
                'adjusted_quantity', adjusted_quantity,
                'unit_cost', ingredient_record.unit_cost,
                'total_cost', ingredient_total_cost,
                'yield_percentage', ingredient_record.yield_percentage,
                'waste_percentage', ingredient_record.waste_percentage,
                'cost_percentage', 
                    CASE 
                        WHEN total_ingredient_cost > 0 
                        THEN (ingredient_total_cost / total_ingredient_cost) * 100.0
                        ELSE 0.0 
                    END
            );
        END;
    END LOOP;
    
    -- Get recipe-level costs and calculate total
    SELECT 
        total_ingredient_cost + COALESCE(r.base_cost, 0.0) + COALESCE(r.labor_cost, 0.0) + COALESCE(r.overhead_cost, 0.0)
    INTO total_recipe_cost
    FROM recipes r
    WHERE r.id = calculate_recipe_cost_with_yield.recipe_id;
    
    -- Build comprehensive result with cost intelligence
    result := jsonb_build_object(
        'recipe_id', calculate_recipe_cost_with_yield.recipe_id,
        'total_cost', COALESCE(total_recipe_cost, 0.0),
        'cost_breakdown', jsonb_build_object(
            'ingredients_cost', total_ingredient_cost,
            'recipe_overhead', COALESCE((SELECT base_cost + labor_cost + overhead_cost FROM recipes WHERE id = calculate_recipe_cost_with_yield.recipe_id), 0.0)
        ),
        'ingredient_details', ingredient_costs,
        'cost_analysis', jsonb_build_object(
            'highest_cost_ingredient', (
                SELECT jsonb_build_object('name', item_name, 'cost', total_cost, 'percentage', cost_percentage)
                FROM jsonb_to_recordset(ingredient_costs) AS x(item_name TEXT, total_cost NUMERIC, cost_percentage NUMERIC)
                ORDER BY total_cost DESC
                LIMIT 1
            ),
            'cost_per_unit', 
                CASE 
                    WHEN (SELECT output_quantity FROM recipes WHERE id = calculate_recipe_cost_with_yield.recipe_id) > 0
                    THEN total_recipe_cost / (SELECT output_quantity FROM recipes WHERE id = calculate_recipe_cost_with_yield.recipe_id)
                    ELSE 0.0
                END
        ),
        'calculated_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION get_menu_engineering_matrix() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_recipe_cost_with_yield(UUID) TO authenticated;

SELECT 'Advanced Menu Engineering Functions Added\!' as status;

MENU_EOF < /dev/null
