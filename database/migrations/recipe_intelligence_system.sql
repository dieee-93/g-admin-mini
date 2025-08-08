-- ========================================================
-- 🧾 RECIPE INTELLIGENCE SYSTEM v3.0 - DATABASE MIGRATION
-- ========================================================

-- Enhanced recipe tables with Recipe Intelligence columns
DO $$ 
BEGIN 
    -- Add Recipe Intelligence columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'description') THEN
        ALTER TABLE recipes ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'difficulty_level') THEN
        ALTER TABLE recipes ADD COLUMN difficulty_level TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'recipe_category') THEN
        ALTER TABLE recipes ADD COLUMN recipe_category TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'kitchen_station') THEN
        ALTER TABLE recipes ADD COLUMN kitchen_station TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'base_cost') THEN
        ALTER TABLE recipes ADD COLUMN base_cost NUMERIC DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'yield_percentage') THEN
        ALTER TABLE recipes ADD COLUMN yield_percentage NUMERIC DEFAULT 100.0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'updated_at') THEN
        ALTER TABLE recipes ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
    
    -- Add missing columns required by analytics views
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'preparation_time') THEN
        ALTER TABLE recipes ADD COLUMN preparation_time INTEGER; -- in minutes
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'menu_category') THEN
        ALTER TABLE recipes ADD COLUMN menu_category TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'popularity_score') THEN
        ALTER TABLE recipes ADD COLUMN popularity_score NUMERIC DEFAULT 0.0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'profitability_score') THEN
        ALTER TABLE recipes ADD COLUMN profitability_score NUMERIC DEFAULT 0.0;
    END IF;
    
    -- Add labor and overhead cost columns for complete cost calculation
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'labor_cost') THEN
        ALTER TABLE recipes ADD COLUMN labor_cost NUMERIC DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'overhead_cost') THEN
        ALTER TABLE recipes ADD COLUMN overhead_cost NUMERIC DEFAULT 0.00;
    END IF;
    
END $$;

-- Recipe Performance Tracking
CREATE TABLE IF NOT EXISTS recipe_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    times_produced INTEGER NOT NULL DEFAULT 0,
    actual_cost NUMERIC NOT NULL DEFAULT 0.00,
    times_sold INTEGER DEFAULT 0,
    revenue_generated NUMERIC DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Menu Engineering Analysis
CREATE TABLE IF NOT EXISTS menu_engineering_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    popularity_index NUMERIC NOT NULL DEFAULT 0.0,
    profitability_index NUMERIC NOT NULL DEFAULT 0.0,
    menu_category TEXT,
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recipe_performance_recipe ON recipe_performance(recipe_id);
CREATE INDEX IF NOT EXISTS idx_menu_engineering_recipe ON menu_engineering_analysis(recipe_id);

-- Permissions
GRANT ALL ON recipe_performance TO authenticated;
GRANT ALL ON menu_engineering_analysis TO authenticated;

SELECT 'Recipe Intelligence Migration Complete\!' as message;
SELECT 'Recipe Intelligence Migration Complete\!' as message;
