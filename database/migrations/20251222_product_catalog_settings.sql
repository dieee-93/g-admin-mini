-- ================================================
-- PRODUCT CATALOG SETTINGS - Phase 2 Module 4
-- ================================================
-- Purpose: Store product catalog configuration and business rules
-- Route: /admin/settings/products/catalog
-- Version: 1.0.0
-- Date: 2025-12-22

-- ================================================
-- TABLE CREATION
-- ================================================

CREATE TABLE IF NOT EXISTS public.product_catalog_settings (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Categories Configuration
  product_categories JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"id": "entradas", "name": "Entradas", "sort_order": 1}]
  
  menu_categories JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"id": "desayunos", "name": "Desayunos", "available_from": "06:00", "available_to": "11:00"}]
  
  -- Pricing Configuration
  pricing_strategy VARCHAR(50) DEFAULT 'markup' CHECK (pricing_strategy IN ('markup', 'competitive', 'value_based')),
  default_markup_percentage DECIMAL(5,2) DEFAULT 200.00 CHECK (default_markup_percentage >= 0 AND default_markup_percentage <= 1000),
  
  -- Costing Configuration
  recipe_costing_method VARCHAR(50) DEFAULT 'average' CHECK (recipe_costing_method IN ('average', 'fifo', 'lifo', 'standard')),
  
  -- Availability Rules
  check_stock BOOLEAN DEFAULT true,
  allow_backorders BOOLEAN DEFAULT false,
  auto_disable_on_zero_stock BOOLEAN DEFAULT true,
  minimum_notice_minutes INTEGER DEFAULT 0 CHECK (minimum_notice_minutes >= 0),
  
  -- Modifiers & Options
  modifiers_configuration JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"id": "size", "name": "Tamaño", "type": "single_choice", "options": [...]}]
  
  portion_sizes JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"id": "individual", "name": "Individual", "servings": 1}]
  
  -- Metadata
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_product_catalog_settings_system ON public.product_catalog_settings(is_system) WHERE is_system = true;
CREATE INDEX idx_product_catalog_settings_created_at ON public.product_catalog_settings(created_at DESC);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE public.product_catalog_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product catalog settings viewable by authenticated users"
  ON public.product_catalog_settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Product catalog settings creatable by admins"
  ON public.product_catalog_settings FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Product catalog settings updatable by admins"
  ON public.product_catalog_settings FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Product catalog settings deletable by admins"
  ON public.product_catalog_settings FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin' AND is_system = false);

-- ================================================
-- DEFAULT SYSTEM RECORD
-- ================================================

INSERT INTO public.product_catalog_settings (
  id, is_system,
  product_categories, menu_categories,
  pricing_strategy, default_markup_percentage,
  recipe_costing_method,
  check_stock, allow_backorders, auto_disable_on_zero_stock, minimum_notice_minutes,
  modifiers_configuration, portion_sizes
) VALUES (
  '00000000-0000-0000-0000-000000000003', true,
  '[
    {"id": "entradas", "name": "Entradas", "description": "Aperitivos y entradas", "sort_order": 1, "is_active": true},
    {"id": "platos_fuertes", "name": "Platos Fuertes", "description": "Platos principales", "sort_order": 2, "is_active": true},
    {"id": "postres", "name": "Postres", "description": "Dulces y postres", "sort_order": 3, "is_active": true},
    {"id": "bebidas", "name": "Bebidas", "description": "Bebidas frías y calientes", "sort_order": 4, "is_active": true},
    {"id": "bebidas_alcoholicas", "name": "Bebidas Alcohólicas", "description": "Vinos, cervezas y licores", "sort_order": 5, "is_active": true}
  ]'::jsonb,
  '[
    {"id": "desayunos", "name": "Desayunos", "available_from": "06:00", "available_to": "11:00", "available_days": [0,1,2,3,4,5,6], "sort_order": 1},
    {"id": "brunch", "name": "Brunch", "available_from": "10:00", "available_to": "14:00", "available_days": [0,6], "sort_order": 2},
    {"id": "comidas", "name": "Comidas", "available_from": "11:00", "available_to": "17:00", "available_days": [0,1,2,3,4,5,6], "sort_order": 3},
    {"id": "cenas", "name": "Cenas", "available_from": "17:00", "available_to": "23:00", "available_days": [0,1,2,3,4,5,6], "sort_order": 4}
  ]'::jsonb,
  'markup', 200.00,
  'average',
  true, false, true, 0,
  '[
    {
      "id": "size",
      "name": "Tamaño",
      "type": "single_choice",
      "required": true,
      "options": [
        {"id": "small", "name": "Pequeño", "price_adjustment": -10, "is_default": false},
        {"id": "medium", "name": "Mediano", "price_adjustment": 0, "is_default": true},
        {"id": "large", "name": "Grande", "price_adjustment": 15, "is_default": false}
      ]
    },
    {
      "id": "extras",
      "name": "Extras",
      "type": "multiple_choice",
      "required": false,
      "options": [
        {"id": "extra_cheese", "name": "Queso Extra", "price_adjustment": 20},
        {"id": "extra_bacon", "name": "Bacon Extra", "price_adjustment": 25},
        {"id": "avocado", "name": "Aguacate", "price_adjustment": 30}
      ]
    }
  ]'::jsonb,
  '[
    {"id": "individual", "name": "Individual", "servings": 1, "price_multiplier": 1.0},
    {"id": "para_dos", "name": "Para 2", "servings": 2, "price_multiplier": 1.8},
    {"id": "familiar", "name": "Familiar", "servings": 4, "price_multiplier": 3.2}
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ================================================
-- TRIGGERS
-- ================================================

CREATE OR REPLACE FUNCTION update_product_catalog_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_catalog_settings_updated_at_trigger
  BEFORE UPDATE ON public.product_catalog_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_product_catalog_settings_updated_at();

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE public.product_catalog_settings IS 
  'Product catalog configuration including categories, pricing strategies, and modifiers';

COMMENT ON COLUMN public.product_catalog_settings.product_categories IS 
  'Array of product category objects for organizing menu items';

COMMENT ON COLUMN public.product_catalog_settings.menu_categories IS 
  'Array of time-based menu categories (breakfast, lunch, dinner) with availability schedules';

COMMENT ON COLUMN public.product_catalog_settings.pricing_strategy IS 
  'Pricing strategy: markup (cost + %), competitive (market-based), value_based (perceived value)';

COMMENT ON COLUMN public.product_catalog_settings.default_markup_percentage IS 
  'Default markup percentage applied to product costs (200% = selling price is 3x cost)';

COMMENT ON COLUMN public.product_catalog_settings.recipe_costing_method IS 
  'Inventory valuation method: average (weighted avg), fifo (first in first out), lifo (last in first out), standard (fixed cost)';

COMMENT ON COLUMN public.product_catalog_settings.check_stock IS 
  'Whether to check inventory stock before allowing product sales';

COMMENT ON COLUMN public.product_catalog_settings.allow_backorders IS 
  'Allow sales even when stock is zero (pre-order mode)';

COMMENT ON COLUMN public.product_catalog_settings.auto_disable_on_zero_stock IS 
  'Automatically mark products as unavailable when stock reaches zero';

COMMENT ON COLUMN public.product_catalog_settings.minimum_notice_minutes IS 
  'Minimum advance notice required for ordering (0 = immediate, 60 = 1 hour notice)';

COMMENT ON COLUMN public.product_catalog_settings.modifiers_configuration IS 
  'Array of modifier groups (size, extras, customizations) with options and price adjustments';

COMMENT ON COLUMN public.product_catalog_settings.portion_sizes IS 
  'Array of portion size options (individual, for 2, family) with serving counts and price multipliers';
