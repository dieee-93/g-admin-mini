-- ========================================================
-- RECIPE INTELLIGENCE SYSTEM v3.0 - ANALYTICS VIEWS
-- ========================================================

-- Recipe Intelligence Summary View
CREATE OR REPLACE VIEW recipe_intelligence_summary AS
SELECT 
    r.id,
    r.name,
    r.recipe_category,
    r.kitchen_station,
    r.difficulty_level,
    r.preparation_time,
    COALESCE(r.yield_percentage, 100.0) as yield_percentage,
    r.menu_category,
    COALESCE(r.popularity_score, 0.0) as popularity_score,
    COALESCE(r.profitability_score, 0.0) as profitability_score,
    
    -- Current Cost Calculation
    calculate_recipe_cost(r.id) as total_cost,
    CASE 
        WHEN r.output_quantity > 0 THEN calculate_recipe_cost(r.id) / r.output_quantity 
        ELSE 0.0 
    END as cost_per_unit,
    
    -- Ingredient Count
    (SELECT COUNT(*) FROM recipe_ingredients ri WHERE ri.recipe_id = r.id) as ingredient_count,
    
    -- Viability
    (SELECT (get_recipe_viability(r.id)->>'is_viable')::BOOLEAN) as is_viable,
    
    r.created_at,
    r.updated_at
    
FROM recipes r
ORDER BY r.popularity_score DESC, r.profitability_score DESC;

-- Grant permissions
GRANT SELECT ON recipe_intelligence_summary TO authenticated;

SELECT 'Recipe Analytics Views Created Successfully\!' as status;
VIEWS_EOF < /dev/null
