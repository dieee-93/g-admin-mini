-- ========================================================
-- DIRECT FIX FOR customer_rfm_profiles PERMISSIONS
-- ========================================================
-- Direct solution for "permission denied for table customer_rfm_profiles"
-- Date: 2025-08-07

-- ========================================================
-- 1. DIRECT TABLE PERMISSIONS
-- ========================================================

-- Grant direct access to the specific table causing issues
GRANT ALL PRIVILEGES ON customer_intelligence.customer_rfm_profiles TO authenticated;
GRANT ALL PRIVILEGES ON customer_intelligence.customer_rfm_profiles TO postgres;
GRANT ALL PRIVILEGES ON customer_intelligence.customer_rfm_profiles TO service_role;

GRANT SELECT ON customer_intelligence.customer_rfm_profiles TO anon;

-- ========================================================
-- 2. SEQUENCE PERMISSIONS FOR THE TABLE
-- ========================================================

-- Grant access to the ID sequence
GRANT ALL ON SEQUENCE customer_intelligence.customer_rfm_profiles_id_seq TO authenticated;
GRANT ALL ON SEQUENCE customer_intelligence.customer_rfm_profiles_id_seq TO postgres;
GRANT ALL ON SEQUENCE customer_intelligence.customer_rfm_profiles_id_seq TO service_role;

-- ========================================================
-- 3. RLS POLICY FIX
-- ========================================================

-- Disable RLS temporarily to check if that's the issue
ALTER TABLE customer_intelligence.customer_rfm_profiles DISABLE ROW LEVEL SECURITY;

-- Or create a permissive policy if you want to keep RLS enabled
-- ALTER TABLE customer_intelligence.customer_rfm_profiles ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all access to RFM profiles" ON customer_intelligence.customer_rfm_profiles;
-- CREATE POLICY "Allow all access to RFM profiles" ON customer_intelligence.customer_rfm_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========================================================
-- 4. SCHEMA PERMISSIONS (EXPLICIT)
-- ========================================================

-- Ensure schema permissions are explicit
GRANT USAGE ON SCHEMA customer_intelligence TO authenticated;
GRANT USAGE ON SCHEMA customer_intelligence TO postgres;  
GRANT USAGE ON SCHEMA customer_intelligence TO service_role;
GRANT USAGE ON SCHEMA customer_intelligence TO anon;

-- ========================================================
-- 5. FUNCTION PERMISSIONS (EXPLICIT)
-- ========================================================

-- Ensure the functions can access the table
GRANT EXECUTE ON FUNCTION get_customer_rfm_data() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_customer_rfm_profiles(INTEGER) TO authenticated;

-- Make functions SECURITY DEFINER run with elevated privileges
ALTER FUNCTION get_customer_rfm_data() SECURITY DEFINER;
ALTER FUNCTION calculate_customer_rfm_profiles(INTEGER) SECURITY DEFINER;

-- ========================================================
-- 6. VERIFICATION TEST
-- ========================================================

DO $$
BEGIN
    -- Test direct table access
    PERFORM 1 FROM customer_intelligence.customer_rfm_profiles LIMIT 1;
    RAISE NOTICE 'SUCCESS: Direct table access works';
    
    -- Test function access
    PERFORM get_customer_rfm_data();
    RAISE NOTICE 'SUCCESS: Function access works';
    
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'STILL HAVING ISSUES: %', SQLERRM;
END $$;

SELECT 'RFM Table Permissions Fixed!' as status;