-- Migration: 003_add_recipe_functions.sql
-- Create database functions for recipe cost calculation and validation
-- Based on RECIPE_TECHNICAL_ARCHITECTURE.md

BEGIN;

-- ============================================================================
-- FUNCTION 1: Calculate Recipe Cost (recursive)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_recipe_cost(p_recipe_id UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_total_cost DECIMAL(15,2) := 0;
  v_input RECORD;
  v_unit_cost DECIMAL(15,2);
  v_adjusted_quantity DECIMAL(15,6);
  v_recipe_scrap_factor DECIMAL(5,2);
BEGIN
  -- Get recipe-level scrap factor
  SELECT scrap_factor INTO v_recipe_scrap_factor
  FROM recipes
  WHERE id = p_recipe_id;

  -- Iterate over all inputs
  FOR v_input IN
    SELECT
      ri.*,
      m.cost_per_unit as material_cost,
      p.final_cost as product_cost,
      p.unit_cost as product_unit_cost,
      a.cost_per_hour as asset_cost
    FROM recipe_inputs ri
    LEFT JOIN materials m ON ri.input_material_id = m.id
    LEFT JOIN products p ON ri.input_product_id = p.id
    LEFT JOIN assets a ON ri.input_asset_id = a.id
    WHERE ri.recipe_id = p_recipe_id
  LOOP
    -- Determine unit cost (with priority: override > actual cost)
    IF v_input.unit_cost_override IS NOT NULL THEN
      v_unit_cost := v_input.unit_cost_override;
    ELSIF v_input.input_material_id IS NOT NULL THEN
      v_unit_cost := v_input.material_cost;
    ELSIF v_input.input_product_id IS NOT NULL THEN
      -- Use final_cost if available, otherwise unit_cost
      v_unit_cost := COALESCE(v_input.product_cost, v_input.product_unit_cost);
    ELSIF v_input.input_asset_id IS NOT NULL THEN
      v_unit_cost := v_input.asset_cost;
    ELSE
      v_unit_cost := 0;
    END IF;

    -- Adjust quantity for scrap factor (input-level overrides recipe-level)
    v_adjusted_quantity := v_input.quantity;

    DECLARE
      v_scrap DECIMAL(5,2);
    BEGIN
      v_scrap := COALESCE(v_input.scrap_factor, v_recipe_scrap_factor, 0);

      IF v_scrap > 0 THEN
        -- Formula: adjusted_quantity = quantity / (1 - scrap_factor%)
        v_adjusted_quantity := v_input.quantity / (1 - v_scrap / 100);
      END IF;
    END;

    -- Add to total cost
    v_total_cost := v_total_cost + (v_unit_cost * v_adjusted_quantity);
  END LOOP;

  RETURN v_total_cost;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION 2: Check Circular Dependency (using recursive CTE)
-- ============================================================================

CREATE OR REPLACE FUNCTION check_circular_dependency(
  p_product_id UUID,
  p_input_product_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_circular BOOLEAN;
BEGIN
  -- Use recursive CTE to detect cycles
  WITH RECURSIVE product_tree AS (
    -- Base case: the product we want to add as input
    SELECT
      p_input_product_id as product_id,
      1 as level,
      ARRAY[p_input_product_id] as path

    UNION ALL

    -- Recursive case: navigate through sub-products
    SELECT
      ri.input_product_id,
      pt.level + 1,
      pt.path || ri.input_product_id
    FROM product_tree pt
    INNER JOIN recipes r ON r.output_product_id = pt.product_id
    INNER JOIN recipe_inputs ri ON ri.recipe_id = r.id
    WHERE ri.input_product_id IS NOT NULL
      AND NOT (ri.input_product_id = ANY(pt.path))  -- Prevent infinite loops
      AND pt.level < 10  -- Max depth safety
  )
  SELECT EXISTS (
    SELECT 1 FROM product_tree
    WHERE product_id = p_product_id
  ) INTO v_circular;

  RETURN v_circular;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION 3: Validate Recipe Input (trigger function)
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_recipe_input()
RETURNS TRIGGER AS $$
DECLARE
  v_output_product_id UUID;
BEGIN
  -- Only validate if it's a product input
  IF NEW.input_product_id IS NOT NULL THEN
    -- Get the output product_id from the recipe
    SELECT output_product_id INTO v_output_product_id
    FROM recipes
    WHERE id = NEW.recipe_id;

    -- Check for circular dependency
    IF v_output_product_id IS NOT NULL AND
       check_circular_dependency(v_output_product_id, NEW.input_product_id) THEN
      RAISE EXCEPTION 'Circular dependency detected: Product % cannot contain itself (directly or indirectly)', v_output_product_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION 4: Prevent Soft-Deleted Recipe Usage
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_deleted_recipe_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM recipes
    WHERE id = NEW.recipe_id
    AND deleted_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Cannot add inputs to deleted recipe %', NEW.recipe_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Validate circular dependency before insert/update
DROP TRIGGER IF EXISTS recipe_input_validation ON recipe_inputs;
CREATE TRIGGER recipe_input_validation
  BEFORE INSERT OR UPDATE ON recipe_inputs
  FOR EACH ROW
  EXECUTE FUNCTION validate_recipe_input();

-- Trigger: Prevent adding inputs to soft-deleted recipes
DROP TRIGGER IF EXISTS recipe_input_soft_delete_check ON recipe_inputs;
CREATE TRIGGER recipe_input_soft_delete_check
  BEFORE INSERT OR UPDATE ON recipe_inputs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_deleted_recipe_usage();

COMMIT;

-- Test queries (run separately to verify functions work)
/*
-- Test 1: Calculate cost of a recipe
SELECT id, name, calculate_recipe_cost(id) as total_cost
FROM recipes
WHERE is_active = true
LIMIT 5;

-- Test 2: Check circular dependency (should return true if circular)
-- Replace UUIDs with actual product IDs
-- SELECT check_circular_dependency('product-a-uuid', 'product-b-uuid');

-- Test 3: Try to create circular dependency (should fail with error)
-- INSERT INTO recipe_inputs (recipe_id, input_product_id, quantity, unit)
-- VALUES ('recipe-for-product-a', 'product-b', 1, 'unit');
*/
