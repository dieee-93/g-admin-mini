-- Recipe Performance Triggers v3.0

-- Update recipes timestamp trigger
CREATE OR REPLACE FUNCTION update_recipe_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp trigger to recipes table
CREATE TRIGGER recipe_update_timestamp
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_recipe_timestamp();

SELECT 'Recipe Triggers Created\!' as status;

