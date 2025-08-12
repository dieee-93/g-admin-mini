-- =========================================
-- Customer Intelligence System - Database Implementation
-- Fase 2: Importante - RFM, Segmentación y Preferencias
-- =========================================

-- CREAR SCHEMA SEPARADO PARA INTELIGENCIA DE CLIENTES
-- ===================================================

-- Crear schema dedicado para customer intelligence
CREATE SCHEMA IF NOT EXISTS customer_intelligence;

-- TABLAS DEL SISTEMA DE INTELIGENCIA DE CLIENTES
-- ==============================================

-- Customer RFM Profiles (actualizado desde schema público)
CREATE TABLE IF NOT EXISTS customer_intelligence.customer_rfm_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- RFM Core Metrics
    recency INTEGER NOT NULL, -- Days since last purchase
    frequency INTEGER NOT NULL, -- Number of purchases
    monetary DECIMAL(12,2) NOT NULL, -- Total amount spent
    
    -- RFM Scores (1-5 scale)
    recency_score INTEGER CHECK (recency_score >= 1 AND recency_score <= 5),
    frequency_score INTEGER CHECK (frequency_score >= 1 AND frequency_score <= 5),
    monetary_score INTEGER CHECK (monetary_score >= 1 AND monetary_score <= 5),
    rfm_score VARCHAR(3), -- Combined score like "543"
    
    -- Segmentation
    segment VARCHAR(50) CHECK (segment IN (
        'Champions', 'Loyal Customers', 'Potential Loyalists', 'New Customers',
        'Promising', 'Need Attention', 'About to Sleep', 'At Risk',
        'Cannot Lose Them', 'Hibernating', 'Lost'
    )),
    
    -- Enhanced Analytics
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    first_purchase_date DATE,
    last_purchase_date DATE,
    
    -- Predictions
    clv_estimate DECIMAL(12,2), -- Customer Lifetime Value estimate
    churn_risk VARCHAR(10) CHECK (churn_risk IN ('Low', 'Medium', 'High')),
    churn_probability DECIMAL(5,2) CHECK (churn_probability >= 0 AND churn_probability <= 100),
    recommended_action TEXT,
    
    -- Metadata
    analysis_period_days INTEGER DEFAULT 365,
    calculated_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    UNIQUE (customer_id, analysis_period_days)
);

-- Customer Tags
CREATE TABLE IF NOT EXISTS customer_intelligence.customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#6366f1', -- Hex color code
    description TEXT,
    tag_type VARCHAR(50) CHECK (tag_type IN (
        'behavior', 'preference', 'demographic', 'lifecycle', 'custom'
    )) DEFAULT 'custom',
    is_system_tag BOOLEAN DEFAULT false, -- System tags cannot be deleted
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Tag Assignments (many-to-many)
CREATE TABLE IF NOT EXISTS customer_intelligence.customer_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES customer_intelligence.customer_tags(id) ON DELETE CASCADE,
    assigned_by UUID, -- Reference to user/employee who assigned the tag
    assigned_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    
    -- Prevent duplicate assignments
    UNIQUE (customer_id, tag_id)
);

-- Customer Notes
CREATE TABLE IF NOT EXISTS customer_intelligence.customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    note_type VARCHAR(50) CHECK (note_type IN (
        'general', 'preference', 'complaint', 'compliment', 'special_request', 'allergy', 'dietary'
    )) DEFAULT 'general',
    is_important BOOLEAN DEFAULT false,
    is_private BOOLEAN DEFAULT false, -- Only visible to certain roles
    created_by UUID, -- Reference to user/employee
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Preferences
CREATE TABLE IF NOT EXISTS customer_intelligence.customer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
    
    -- Dietary Information
    dietary_restrictions TEXT[],
    allergies TEXT[],
    preferred_cuisine_types TEXT[],
    spice_tolerance VARCHAR(20) CHECK (spice_tolerance IN ('none', 'mild', 'medium', 'hot', 'extra_hot')),
    
    -- Service Preferences
    preferred_seating VARCHAR(50) CHECK (preferred_seating IN (
        'window', 'booth', 'bar', 'patio', 'private', 'quiet_area', 'any'
    )),
    preferred_service_time TIME,
    communication_preferences JSONB DEFAULT '{}', -- Email, SMS, phone preferences
    
    -- Favorite Items
    favorite_products UUID[], -- Array of product IDs
    disliked_items TEXT[],
    
    -- Special Occasions
    special_occasions JSONB DEFAULT '[]', -- Array of special occasions
    -- Structure: [{"type": "birthday", "date": "MM-DD", "notes": "..."}]
    
    -- Behavioral Preferences
    typical_party_size INTEGER DEFAULT 1,
    typical_visit_frequency VARCHAR(20) CHECK (typical_visit_frequency IN (
        'daily', 'weekly', 'bi_weekly', 'monthly', 'occasionally', 'rarely'
    )),
    preferred_payment_method VARCHAR(50),
    marketing_opt_in BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Segments (predefined and custom)
CREATE TABLE IF NOT EXISTS customer_intelligence.customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    segment_type VARCHAR(20) CHECK (segment_type IN ('rfm', 'behavioral', 'demographic', 'custom')) NOT NULL,
    criteria JSONB, -- Flexible criteria for segment membership
    color VARCHAR(7) DEFAULT '#6366f1',
    is_active BOOLEAN DEFAULT true,
    is_system_segment BOOLEAN DEFAULT false,
    customer_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Behavior Events (for advanced analytics)
CREATE TABLE IF NOT EXISTS customer_intelligence.customer_behavior_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'order', 'visit', 'inquiry', 'complaint', 'review'
    event_data JSONB DEFAULT '{}', -- Flexible event-specific data
    value DECIMAL(10,2), -- Monetary value if applicable
    timestamp TIMESTAMPTZ DEFAULT now(),
    session_id UUID, -- Group related events
    source VARCHAR(50), -- 'pos', 'website', 'phone', 'walk_in'
    
    -- Indexing
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Analytics Summaries (materialized view-like table)
CREATE TABLE IF NOT EXISTS customer_intelligence.customer_analytics_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    summary_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Key Metrics
    total_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    active_customers INTEGER DEFAULT 0,
    churned_customers INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    avg_clv DECIMAL(10,2) DEFAULT 0,
    
    -- Segment Breakdown
    segment_distribution JSONB DEFAULT '{}',
    revenue_by_segment JSONB DEFAULT '{}',
    
    calculated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Prevent duplicate summaries
    UNIQUE (summary_type, period_start, period_end)
);

-- ÍNDICES PARA PERFORMANCE
-- ========================

-- RFM Profiles
CREATE INDEX IF NOT EXISTS idx_customer_rfm_customer_id ON customer_intelligence.customer_rfm_profiles(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_rfm_segment ON customer_intelligence.customer_rfm_profiles(segment);
CREATE INDEX IF NOT EXISTS idx_customer_rfm_scores ON customer_intelligence.customer_rfm_profiles(recency_score, frequency_score, monetary_score);
CREATE INDEX IF NOT EXISTS idx_customer_rfm_calculated_at ON customer_intelligence.customer_rfm_profiles(calculated_at DESC);

-- Tags and Assignments
CREATE INDEX IF NOT EXISTS idx_customer_tags_name ON customer_intelligence.customer_tags(name);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_customer ON customer_intelligence.customer_tag_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_tag ON customer_intelligence.customer_tag_assignments(tag_id);

-- Notes
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer ON customer_intelligence.customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_at ON customer_intelligence.customer_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_notes_type ON customer_intelligence.customer_notes(note_type);

-- Preferences
CREATE INDEX IF NOT EXISTS idx_customer_preferences_customer ON customer_intelligence.customer_preferences(customer_id);

-- Behavior Events
CREATE INDEX IF NOT EXISTS idx_customer_behavior_customer ON customer_intelligence.customer_behavior_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_timestamp ON customer_intelligence.customer_behavior_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_type ON customer_intelligence.customer_behavior_events(event_type);

-- Analytics Summary
CREATE INDEX IF NOT EXISTS idx_analytics_summary_period ON customer_intelligence.customer_analytics_summary(summary_type, period_start, period_end);

-- FUNCIONES RPC PARA SUPABASE
-- ===========================

-- Función: Calcular perfiles RFM
CREATE OR REPLACE FUNCTION calculate_customer_rfm_profiles(
    analysis_period_days INTEGER DEFAULT 365
)
RETURNS INTEGER -- Number of profiles calculated
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_analysis_date DATE := CURRENT_DATE;
    v_profiles_calculated INTEGER := 0;
    customer_record RECORD;
    v_recency INTEGER;
    v_frequency INTEGER;
    v_monetary DECIMAL(12,2);
    v_recency_score INTEGER;
    v_frequency_score INTEGER;
    v_monetary_score INTEGER;
    v_segment VARCHAR(50);
    v_churn_risk VARCHAR(10);
    v_clv_estimate DECIMAL(12,2);
    v_recommendation TEXT;
BEGIN
    -- Clear existing profiles for this analysis period
    DELETE FROM customer_intelligence.customer_rfm_profiles 
    WHERE analysis_period_days = calculate_customer_rfm_profiles.analysis_period_days;
    
    -- Calculate RFM for each customer with purchases
    FOR customer_record IN (
        SELECT 
            c.id as customer_id,
            COUNT(s.id) as total_orders,
            SUM(s.total) as total_spent,
            AVG(s.total) as avg_order_value,
            MIN(s.created_at)::date as first_purchase,
            MAX(s.created_at)::date as last_purchase,
            EXTRACT(days FROM (v_analysis_date - MAX(s.created_at)::date)) as days_since_last_purchase
        FROM customers c
        JOIN sales s ON c.id = s.customer_id
        WHERE s.created_at >= (v_analysis_date - (analysis_period_days || ' days')::interval)
        GROUP BY c.id
        HAVING COUNT(s.id) > 0
    )
    LOOP
        -- Calculate RFM values
        v_recency := customer_record.days_since_last_purchase;
        v_frequency := customer_record.total_orders;
        v_monetary := customer_record.total_spent;
        
        -- Calculate RFM scores (1-5 scale, higher is better)
        -- Recency: lower days = higher score
        v_recency_score := CASE 
            WHEN v_recency <= 30 THEN 5
            WHEN v_recency <= 60 THEN 4
            WHEN v_recency <= 90 THEN 3
            WHEN v_recency <= 180 THEN 2
            ELSE 1
        END;
        
        -- Frequency: more orders = higher score
        v_frequency_score := CASE 
            WHEN v_frequency >= 20 THEN 5
            WHEN v_frequency >= 10 THEN 4
            WHEN v_frequency >= 5 THEN 3
            WHEN v_frequency >= 2 THEN 2
            ELSE 1
        END;
        
        -- Monetary: more spent = higher score
        v_monetary_score := CASE 
            WHEN v_monetary >= 2000 THEN 5
            WHEN v_monetary >= 1000 THEN 4
            WHEN v_monetary >= 500 THEN 3
            WHEN v_monetary >= 100 THEN 2
            ELSE 1
        END;
        
        -- Determine segment based on RFM scores
        v_segment := CASE
            WHEN v_recency_score >= 4 AND v_frequency_score >= 4 AND v_monetary_score >= 4 THEN 'Champions'
            WHEN v_recency_score >= 3 AND v_frequency_score >= 3 AND v_monetary_score >= 3 THEN 'Loyal Customers'
            WHEN v_recency_score >= 4 AND v_frequency_score <= 2 THEN 'New Customers'
            WHEN v_recency_score >= 3 AND v_frequency_score <= 2 AND v_monetary_score >= 3 THEN 'Promising'
            WHEN v_recency_score >= 3 AND v_frequency_score >= 3 AND v_monetary_score <= 2 THEN 'Potential Loyalists'
            WHEN v_recency_score >= 2 AND v_frequency_score >= 2 AND v_monetary_score >= 2 THEN 'Need Attention'
            WHEN v_recency_score = 2 AND v_frequency_score <= 2 THEN 'About to Sleep'
            WHEN v_recency_score <= 2 AND v_frequency_score >= 3 AND v_monetary_score >= 4 THEN 'Cannot Lose Them'
            WHEN v_recency_score = 1 AND v_frequency_score >= 3 THEN 'At Risk'
            WHEN v_recency_score = 1 AND v_frequency_score <= 2 AND v_monetary_score >= 3 THEN 'Hibernating'
            ELSE 'Lost'
        END;
        
        -- Calculate churn risk
        v_churn_risk := CASE
            WHEN v_recency_score >= 4 THEN 'Low'
            WHEN v_recency_score >= 2 THEN 'Medium'
            ELSE 'High'
        END;
        
        -- Estimate CLV (simple calculation)
        v_clv_estimate := customer_record.avg_order_value * v_frequency_score * 2.5;
        
        -- Generate recommendation
        v_recommendation := CASE v_segment
            WHEN 'Champions' THEN 'Reward loyalty, ask for referrals'
            WHEN 'Loyal Customers' THEN 'Upsell higher value products'
            WHEN 'New Customers' THEN 'Onboard properly, build relationship'
            WHEN 'Promising' THEN 'Offer membership, loyalty program'
            WHEN 'Potential Loyalists' THEN 'Recommend related products'
            WHEN 'Need Attention' THEN 'Make limited time offers'
            WHEN 'About to Sleep' THEN 'Share valuable resources'
            WHEN 'Cannot Lose Them' THEN 'Win back campaign, renewal'
            WHEN 'At Risk' THEN 'Send personalized emails, offers'
            WHEN 'Hibernating' THEN 'Offer relevant products'
            ELSE 'Revive interest with surveys'
        END;
        
        -- Insert RFM profile
        INSERT INTO customer_intelligence.customer_rfm_profiles (
            customer_id, recency, frequency, monetary,
            recency_score, frequency_score, monetary_score,
            rfm_score, segment, total_orders, total_spent, avg_order_value,
            first_purchase_date, last_purchase_date, clv_estimate,
            churn_risk, recommended_action, analysis_period_days
        ) VALUES (
            customer_record.customer_id, v_recency, v_frequency, v_monetary,
            v_recency_score, v_frequency_score, v_monetary_score,
            (v_recency_score || v_frequency_score || v_monetary_score),
            v_segment, customer_record.total_orders, customer_record.total_spent,
            customer_record.avg_order_value, customer_record.first_purchase,
            customer_record.last_purchase, v_clv_estimate, v_churn_risk,
            v_recommendation, analysis_period_days
        );
        
        v_profiles_calculated := v_profiles_calculated + 1;
    END LOOP;
    
    RETURN v_profiles_calculated;
END;
$$;

-- Función: Obtener datos RFM calculados
CREATE OR REPLACE FUNCTION get_customer_rfm_data()
RETURNS TABLE (
    customer_id UUID,
    customer_name TEXT,
    email TEXT,
    recency INTEGER,
    frequency INTEGER,
    monetary DECIMAL(12,2),
    recency_score INTEGER,
    frequency_score INTEGER,
    monetary_score INTEGER,
    rfm_score VARCHAR(3),
    segment VARCHAR(50),
    total_orders INTEGER,
    total_spent DECIMAL(12,2),
    avg_order_value DECIMAL(10,2),
    first_purchase_date DATE,
    last_purchase_date DATE,
    clv_estimate DECIMAL(12,2),
    churn_risk VARCHAR(10),
    recommended_action TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rfm.customer_id,
        c.name as customer_name,
        c.email,
        rfm.recency,
        rfm.frequency,
        rfm.monetary,
        rfm.recency_score,
        rfm.frequency_score,
        rfm.monetary_score,
        rfm.rfm_score,
        rfm.segment,
        rfm.total_orders,
        rfm.total_spent,
        rfm.avg_order_value,
        rfm.first_purchase_date,
        rfm.last_purchase_date,
        rfm.clv_estimate,
        rfm.churn_risk,
        rfm.recommended_action
    FROM customer_intelligence.customer_rfm_profiles rfm
    JOIN customers c ON rfm.customer_id = c.id
    WHERE rfm.is_active = true
    ORDER BY rfm.monetary DESC, rfm.frequency DESC;
END;
$$;

-- Función: Dashboard de analytics de clientes
CREATE OR REPLACE FUNCTION get_customer_analytics_dashboard()
RETURNS TABLE (
    total_customers INTEGER,
    new_customers_this_month INTEGER,
    returning_customers INTEGER,
    customer_retention_rate DECIMAL(5,2),
    average_clv DECIMAL(10,2),
    churn_rate DECIMAL(5,2),
    segment_distribution JSONB,
    revenue_by_segment JSONB,
    top_customers JSONB
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_total_customers INTEGER;
    v_new_this_month INTEGER;
    v_returning_customers INTEGER;
    v_retention_rate DECIMAL(5,2);
    v_avg_clv DECIMAL(10,2);
    v_churn_rate DECIMAL(5,2);
    v_segment_dist JSONB;
    v_revenue_by_segment JSONB;
    v_top_customers JSONB;
BEGIN
    -- Total customers
    SELECT COUNT(*) INTO v_total_customers FROM customers;
    
    -- New customers this month
    SELECT COUNT(*) INTO v_new_this_month 
    FROM customers 
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
    
    -- Returning customers (with more than 1 purchase)
    SELECT COUNT(DISTINCT s.customer_id) INTO v_returning_customers
    FROM sales s
    GROUP BY s.customer_id
    HAVING COUNT(s.id) > 1;
    
    -- Retention rate (simplified)
    v_retention_rate := CASE WHEN v_total_customers > 0 
                           THEN (v_returning_customers * 100.0 / v_total_customers)
                           ELSE 0 END;
    
    -- Average CLV
    SELECT AVG(clv_estimate) INTO v_avg_clv
    FROM customer_intelligence.customer_rfm_profiles 
    WHERE is_active = true;
    
    -- Churn rate (customers in high churn risk segments)
    SELECT 
        CASE WHEN COUNT(*) > 0 
             THEN (COUNT(*) FILTER (WHERE churn_risk = 'High') * 100.0 / COUNT(*))
             ELSE 0 END
    INTO v_churn_rate
    FROM customer_intelligence.customer_rfm_profiles
    WHERE is_active = true;
    
    -- Segment distribution
    SELECT json_object_agg(segment, customer_count)::jsonb INTO v_segment_dist
    FROM (
        SELECT segment, COUNT(*) as customer_count
        FROM customer_intelligence.customer_rfm_profiles
        WHERE is_active = true
        GROUP BY segment
    ) segment_counts;
    
    -- Revenue by segment
    SELECT json_object_agg(segment, total_revenue)::jsonb INTO v_revenue_by_segment
    FROM (
        SELECT segment, SUM(total_spent) as total_revenue
        FROM customer_intelligence.customer_rfm_profiles
        WHERE is_active = true
        GROUP BY segment
    ) segment_revenue;
    
    -- Top customers
    SELECT json_agg(
        json_build_object(
            'customer_id', rfm.customer_id,
            'name', c.name,
            'total_spent', rfm.total_spent,
            'segment', rfm.segment,
            'last_order_days_ago', rfm.recency
        ) ORDER BY rfm.total_spent DESC
    )::jsonb INTO v_top_customers
    FROM customer_intelligence.customer_rfm_profiles rfm
    JOIN customers c ON rfm.customer_id = c.id
    WHERE rfm.is_active = true
    LIMIT 10;
    
    RETURN QUERY SELECT 
        COALESCE(v_total_customers, 0),
        COALESCE(v_new_this_month, 0),
        COALESCE(v_returning_customers, 0),
        COALESCE(v_retention_rate, 0),
        COALESCE(v_avg_clv, 0),
        COALESCE(v_churn_rate, 0),
        COALESCE(v_segment_dist, '{}'::jsonb),
        COALESCE(v_revenue_by_segment, '{}'::jsonb),
        COALESCE(v_top_customers, '[]'::jsonb);
END;
$$;

-- Función: Obtener perfil completo de cliente con RFM
CREATE OR REPLACE FUNCTION get_customer_profile_with_rfm(customer_id UUID)
RETURNS TABLE (
    -- Basic Info
    id UUID,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    
    -- RFM Data
    rfm_segment VARCHAR(50),
    recency INTEGER,
    frequency INTEGER,
    monetary DECIMAL(12,2),
    rfm_score VARCHAR(3),
    clv_estimate DECIMAL(12,2),
    churn_risk VARCHAR(10),
    recommended_action TEXT,
    
    -- Enhanced Data
    total_orders INTEGER,
    total_spent DECIMAL(12,2),
    avg_order_value DECIMAL(10,2),
    first_purchase DATE,
    last_purchase DATE,
    
    -- Tags and Preferences
    customer_tags JSONB,
    preferences JSONB,
    recent_notes JSONB
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_customer RECORD;
    v_rfm RECORD;
    v_tags JSONB;
    v_preferences JSONB;
    v_notes JSONB;
BEGIN
    -- Get basic customer info
    SELECT * INTO v_customer FROM customers WHERE id = customer_id;
    
    -- Get RFM data
    SELECT * INTO v_rfm 
    FROM customer_intelligence.customer_rfm_profiles 
    WHERE customer_rfm_profiles.customer_id = get_customer_profile_with_rfm.customer_id 
      AND is_active = true
    ORDER BY calculated_at DESC
    LIMIT 1;
    
    -- Get customer tags
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', ct.id,
            'name', ct.name,
            'color', ct.color,
            'assigned_at', cta.assigned_at
        )
    ), '[]'::json)::jsonb INTO v_tags
    FROM customer_intelligence.customer_tag_assignments cta
    JOIN customer_intelligence.customer_tags ct ON cta.tag_id = ct.id
    WHERE cta.customer_id = get_customer_profile_with_rfm.customer_id;
    
    -- Get preferences
    SELECT row_to_json(cp)::jsonb INTO v_preferences
    FROM customer_intelligence.customer_preferences cp
    WHERE cp.customer_id = get_customer_profile_with_rfm.customer_id;
    
    -- Get recent notes
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', cn.id,
            'note', cn.note,
            'note_type', cn.note_type,
            'is_important', cn.is_important,
            'created_at', cn.created_at
        ) ORDER BY cn.created_at DESC
    ), '[]'::json)::jsonb INTO v_notes
    FROM customer_intelligence.customer_notes cn
    WHERE cn.customer_id = get_customer_profile_with_rfm.customer_id
    LIMIT 5;
    
    RETURN QUERY SELECT 
        v_customer.id,
        v_customer.name,
        v_customer.email,
        v_customer.phone,
        v_customer.address,
        
        v_rfm.segment,
        v_rfm.recency,
        v_rfm.frequency,
        v_rfm.monetary,
        v_rfm.rfm_score,
        v_rfm.clv_estimate,
        v_rfm.churn_risk,
        v_rfm.recommended_action,
        
        v_rfm.total_orders,
        v_rfm.total_spent,
        v_rfm.avg_order_value,
        v_rfm.first_purchase_date,
        v_rfm.last_purchase_date,
        
        v_tags,
        v_preferences,
        v_notes;
END;
$$;

-- Función: Crear/actualizar preferencias de cliente
CREATE OR REPLACE FUNCTION customer_intelligence_upsert_preferences(
    p_customer_id UUID,
    p_dietary_restrictions TEXT[] DEFAULT NULL,
    p_allergies TEXT[] DEFAULT NULL,
    p_preferred_seating VARCHAR(50) DEFAULT NULL,
    p_preferred_service_time TIME DEFAULT NULL,
    p_favorite_products UUID[] DEFAULT NULL,
    p_special_occasions JSONB DEFAULT NULL,
    p_communication_preferences JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_preferences_id UUID;
BEGIN
    INSERT INTO customer_intelligence.customer_preferences (
        customer_id, dietary_restrictions, allergies, preferred_seating,
        preferred_service_time, favorite_products, special_occasions,
        communication_preferences
    ) VALUES (
        p_customer_id, p_dietary_restrictions, p_allergies, p_preferred_seating,
        p_preferred_service_time, p_favorite_products, p_special_occasions,
        p_communication_preferences
    )
    ON CONFLICT (customer_id) DO UPDATE SET
        dietary_restrictions = COALESCE(EXCLUDED.dietary_restrictions, customer_preferences.dietary_restrictions),
        allergies = COALESCE(EXCLUDED.allergies, customer_preferences.allergies),
        preferred_seating = COALESCE(EXCLUDED.preferred_seating, customer_preferences.preferred_seating),
        preferred_service_time = COALESCE(EXCLUDED.preferred_service_time, customer_preferences.preferred_service_time),
        favorite_products = COALESCE(EXCLUDED.favorite_products, customer_preferences.favorite_products),
        special_occasions = COALESCE(EXCLUDED.special_occasions, customer_preferences.special_occasions),
        communication_preferences = COALESCE(EXCLUDED.communication_preferences, customer_preferences.communication_preferences),
        updated_at = NOW()
    RETURNING id INTO v_preferences_id;
    
    RETURN v_preferences_id;
END;
$$;

-- TRIGGERS PARA MANTENER DATOS ACTUALIZADOS
-- =========================================

-- Trigger function para updated_at
CREATE OR REPLACE FUNCTION update_customer_intelligence_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para todas las tablas
CREATE TRIGGER update_customer_rfm_profiles_updated_at
    BEFORE UPDATE ON customer_intelligence.customer_rfm_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_intelligence_updated_at_column();

CREATE TRIGGER update_customer_tags_updated_at
    BEFORE UPDATE ON customer_intelligence.customer_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_intelligence_updated_at_column();

CREATE TRIGGER update_customer_notes_updated_at
    BEFORE UPDATE ON customer_intelligence.customer_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_intelligence_updated_at_column();

CREATE TRIGGER update_customer_preferences_updated_at
    BEFORE UPDATE ON customer_intelligence.customer_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_intelligence_updated_at_column();

-- Trigger para actualizar usage_count en tags
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE customer_intelligence.customer_tags 
        SET usage_count = usage_count + 1 
        WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE customer_intelligence.customer_tags 
        SET usage_count = GREATEST(0, usage_count - 1) 
        WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_tag_assignments_usage_trigger
    AFTER INSERT OR DELETE ON customer_intelligence.customer_tag_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_usage_count();

-- DATOS DE EJEMPLO PARA DESARROLLO
-- =================================

DO $$
BEGIN
    -- Insert system tags if none exist
    IF NOT EXISTS (SELECT 1 FROM customer_intelligence.customer_tags LIMIT 1) THEN
        INSERT INTO customer_intelligence.customer_tags (name, color, description, tag_type, is_system_tag) VALUES
        ('VIP', '#fbbf24', 'VIP customers with high value', 'behavior', true),
        ('Frequent Visitor', '#10b981', 'Visits regularly', 'behavior', true),
        ('Birthday This Month', '#f59e0b', 'Birthday celebration', 'lifecycle', true),
        ('Dietary Restrictions', '#ef4444', 'Has specific dietary needs', 'preference', true),
        ('Corporate Account', '#6366f1', 'Business customer', 'demographic', true),
        ('Loyalty Member', '#8b5cf6', 'Member of loyalty program', 'behavior', true),
        ('New Customer', '#06b6d4', 'Recently joined', 'lifecycle', true),
        ('At Risk', '#dc2626', 'May churn soon', 'behavior', true);
        
        RAISE NOTICE 'System customer tags inserted successfully';
    END IF;

    -- Insert customer segments if none exist
    IF NOT EXISTS (SELECT 1 FROM customer_intelligence.customer_segments LIMIT 1) THEN
        INSERT INTO customer_intelligence.customer_segments (name, description, segment_type, is_system_segment, color) VALUES
        ('Champions', 'High value, high frequency, recent customers', 'rfm', true, '#10b981'),
        ('Loyal Customers', 'Regular customers with good value', 'rfm', true, '#3b82f6'),
        ('Potential Loyalists', 'Good recent customers with potential', 'rfm', true, '#8b5cf6'),
        ('New Customers', 'Recent customers to develop', 'rfm', true, '#06b6d4'),
        ('At Risk', 'High value customers who may churn', 'rfm', true, '#ef4444'),
        ('Lost', 'Haven\'t purchased recently', 'rfm', true, '#6b7280');
        
        RAISE NOTICE 'System customer segments inserted successfully';
    END IF;

    -- Calculate initial RFM profiles if customers exist
    IF EXISTS (SELECT 1 FROM customers LIMIT 1) AND EXISTS (SELECT 1 FROM sales LIMIT 1) THEN
        PERFORM calculate_customer_rfm_profiles(365);
        RAISE NOTICE 'Initial RFM profiles calculated successfully';
    END IF;

    RAISE NOTICE 'Customer intelligence system sample data inserted successfully';
END
$$;

-- PERMISOS Y SEGURIDAD
-- ====================

-- Grant schema usage
GRANT USAGE ON SCHEMA customer_intelligence TO authenticated;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA customer_intelligence TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION calculate_customer_rfm_profiles(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_rfm_data() TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_analytics_dashboard() TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_profile_with_rfm(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION customer_intelligence_upsert_preferences(UUID, TEXT[], TEXT[], VARCHAR, TIME, UUID[], JSONB, JSONB) TO authenticated;

-- COMENTARIOS
-- ===========

COMMENT ON SCHEMA customer_intelligence IS 'Schema dedicado para funcionalidades avanzadas de inteligencia de clientes';
COMMENT ON TABLE customer_intelligence.customer_rfm_profiles IS 'Perfiles RFM con segmentación y predicciones';
COMMENT ON TABLE customer_intelligence.customer_tags IS 'Tags/etiquetas para categorizar clientes';
COMMENT ON TABLE customer_intelligence.customer_tag_assignments IS 'Asignación many-to-many de tags a clientes';
COMMENT ON TABLE customer_intelligence.customer_notes IS 'Notas y observaciones sobre clientes';
COMMENT ON TABLE customer_intelligence.customer_preferences IS 'Preferencias detalladas de clientes';
COMMENT ON TABLE customer_intelligence.customer_behavior_events IS 'Eventos de comportamiento para analytics avanzados';

COMMENT ON FUNCTION calculate_customer_rfm_profiles(INTEGER) IS 'Calcula/actualiza perfiles RFM para todos los clientes';
COMMENT ON FUNCTION get_customer_rfm_data() IS 'Obtiene datos RFM calculados para todos los clientes';
COMMENT ON FUNCTION get_customer_analytics_dashboard() IS 'Obtiene métricas del dashboard de customer analytics';
COMMENT ON FUNCTION get_customer_profile_with_rfm(UUID) IS 'Obtiene perfil completo de cliente incluyendo RFM y preferencias';

-- =========================================
-- FIN: Customer Intelligence System
-- =========================================