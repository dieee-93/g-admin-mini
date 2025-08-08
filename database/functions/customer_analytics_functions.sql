-- ========================================================
-- CUSTOMER ANALYTICS FUNCTIONS - Missing Functions Implementation
-- ========================================================
-- Functions required by advancedCustomerApi.ts
-- Date: 2025-08-07

-- ========================================================
-- 1. CUSTOMER ANALYTICS DASHBOARD FUNCTION
-- ========================================================

CREATE OR REPLACE FUNCTION get_customer_analytics_dashboard()
RETURNS JSONB

LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    total_customers INTEGER;
    active_customers INTEGER;
    avg_order_value NUMERIC;
    total_revenue NUMERIC;
    rfm_distribution JSONB;
    churn_risk_stats JSONB;
BEGIN
    -- Get basic customer metrics
    SELECT COUNT(*) INTO total_customers FROM customers;
    
    -- Get active customers (those with sales in last 90 days)
    SELECT COUNT(DISTINCT customer_id) INTO active_customers 
    FROM sales 
    WHERE created_at >= CURRENT_DATE - INTERVAL '90 days';
    
    -- Calculate average order value
    SELECT COALESCE(AVG(total), 0) INTO avg_order_value 
    FROM sales 
    WHERE created_at >= CURRENT_DATE - INTERVAL '365 days';
    
    -- Calculate total revenue
    SELECT COALESCE(SUM(total), 0) INTO total_revenue 
    FROM sales 
    WHERE created_at >= CURRENT_DATE - INTERVAL '365 days';
    
    -- Get RFM segment distribution
    SELECT jsonb_object_agg(segment, count) INTO rfm_distribution
    FROM (
        SELECT 
            COALESCE(rfm_metrics->>'segment', 'unassigned') as segment,
            COUNT(*) as count
        FROM customer_intelligence.customer_rfm_profiles
        GROUP BY rfm_metrics->>'segment'
        UNION ALL
        SELECT 'unassigned', (total_customers - COALESCE((SELECT COUNT(*) FROM customer_intelligence.customer_rfm_profiles), 0))
        WHERE (total_customers - COALESCE((SELECT COUNT(*) FROM customer_intelligence.customer_rfm_profiles), 0)) > 0
    ) segment_counts;
    
    -- Get churn risk statistics
    SELECT jsonb_object_agg(churn_risk, count) INTO churn_risk_stats
    FROM (
        SELECT 
            COALESCE(intelligence->>'churn_risk', 'unknown') as churn_risk,
            COUNT(*) as count
        FROM customer_intelligence.customer_rfm_profiles
        GROUP BY intelligence->>'churn_risk'
    ) churn_counts;
    
    -- Build result object
    result := jsonb_build_object(
        'total_customers', total_customers,
        'active_customers', active_customers,
        'avg_order_value', avg_order_value,
        'total_revenue', total_revenue,
        'rfm_distribution', COALESCE(rfm_distribution, '{}'::jsonb),
        'churn_risk_stats', COALESCE(churn_risk_stats, '{}'::jsonb),
        'generated_at', NOW()
    );
    
    RETURN result;
END;
$$;

-- ========================================================
-- 2. CUSTOMER PROFILE WITH RFM FUNCTION
-- ========================================================

CREATE OR REPLACE FUNCTION get_customer_profile_with_rfm(customer_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    customer_data JSONB;
    rfm_data JSONB;
    sales_stats JSONB;
    result JSONB;
BEGIN
    -- Get customer basic data
    SELECT row_to_json(c)::jsonb INTO customer_data
    FROM customers c
    WHERE c.id = customer_id;
    
    IF customer_data IS NULL THEN
        RAISE EXCEPTION 'Customer not found with id: %', customer_id;
    END IF;
    
    -- Get RFM data
    SELECT row_to_json(rfm)::jsonb INTO rfm_data
    FROM (
        SELECT 
            rfm_metrics,
            intelligence,
            calculated_at
        FROM customer_intelligence.customer_rfm_profiles
        WHERE customer_intelligence.customer_rfm_profiles.customer_id = get_customer_profile_with_rfm.customer_id
    ) rfm;
    
    -- Get sales statistics
    SELECT jsonb_build_object(
        'total_sales', COUNT(*),
        'total_spent', COALESCE(SUM(total), 0),
        'avg_order_value', COALESCE(AVG(total), 0),
        'last_purchase', MAX(created_at),
        'first_purchase', MIN(created_at)
    ) INTO sales_stats
    FROM sales s
    WHERE s.customer_id = get_customer_profile_with_rfm.customer_id;
    
    -- Combine all data
    result := jsonb_build_object(
        'customer', customer_data,
        'rfm_profile', COALESCE(rfm_data, '{}'::jsonb),
        'sales_stats', sales_stats
    );
    
    RETURN result;
END;
$$;

-- ========================================================
-- 3. REFRESH ANALYTICS VIEWS FUNCTION (Referenced in hint)
-- ========================================================

CREATE OR REPLACE FUNCTION refresh_customer_analytics_views()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    processed_count INTEGER := 0;
BEGIN
    -- Refresh RFM profiles
    SELECT calculate_customer_rfm_profiles(365) INTO processed_count;
    
    -- Add any other analytics refresh logic here
    
    RETURN processed_count;
END;
$$;

-- ========================================================
-- 4. PERMISSIONS AND GRANTS
-- ========================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_customer_analytics_dashboard() TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_profile_with_rfm(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_customer_analytics_views() TO authenticated;

-- Ensure schema permissions are correct
GRANT USAGE ON SCHEMA customer_intelligence TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA customer_intelligence TO authenticated;

-- Grant access to existing RFM functions
GRANT EXECUTE ON FUNCTION get_customer_rfm_data() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_customer_rfm_profiles(INTEGER) TO authenticated;

SELECT 'Customer Analytics Functions Created Successfully!' as status;