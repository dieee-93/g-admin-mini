-- ==========================================
-- ADVANCED CUSTOMER INTELLIGENCE SCHEMA
-- Optimized for Performance, Flexibility, and Security
-- ==========================================

-- Ensure extensions are in a dedicated schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA extensions;

-- Create a dedicated schema for customer intelligence
CREATE SCHEMA IF NOT EXISTS customer_intelligence;

-- Trigger function for automatic timestamp updates
CREATE OR REPLACE FUNCTION customer_intelligence.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== CUSTOMER TAGS SYSTEM =====
CREATE TABLE customer_intelligence.customer_tags (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE NULLS NOT DISTINCT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  category TEXT NOT NULL CHECK (
    category IN ('behavior', 'preference', 'demographic', 'custom')
  ),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_customer_tags_modtime
BEFORE UPDATE ON customer_intelligence.customer_tags
FOR EACH ROW EXECUTE FUNCTION customer_intelligence.update_modified_column();

-- Junction table for customer-tag relationships
CREATE TABLE customer_intelligence.customer_tag_assignments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES customer_intelligence.customer_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by TEXT,
  metadata JSONB DEFAULT '{}',
  UNIQUE(customer_id, tag_id)
);

-- ===== CUSTOMER NOTES & INTERACTIONS =====
CREATE TABLE customer_intelligence.customer_notes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN ('general', 'service', 'complaint', 'compliment', 'dietary')
  ),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_important BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'
);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_customer_notes_modtime
BEFORE UPDATE ON customer_intelligence.customer_notes
FOR EACH ROW EXECUTE FUNCTION customer_intelligence.update_modified_column();

-- ===== CUSTOMER PREFERENCES & PROFILE DATA =====
CREATE TABLE customer_intelligence.customer_preferences (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE UNIQUE,
  
  -- Use JSONB for flexible dietary and preference storage
  dietary_profile JSONB DEFAULT '{
    "restrictions": [],
    "allergies": [],
    "favorite_cuisines": [],
    "disliked_items": []
  }',
  
  -- Dining and Service Preferences
  preferences JSONB DEFAULT '{
    "seating": null,
    "party_size": 2,
    "preferred_server": null,
    "service_pace": null,
    "special_requests": []
  }',
  
  -- Marketing Preferences
  communication JSONB DEFAULT '{
    "preferred_contact_time": null,
    "contact_frequency": null
  }',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_customer_preferences_modtime
BEFORE UPDATE ON customer_intelligence.customer_preferences
FOR EACH ROW EXECUTE FUNCTION customer_intelligence.update_modified_column();

-- ===== RFM ANALYTICS CORE TABLE =====
CREATE TABLE customer_intelligence.customer_rfm_profiles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE UNIQUE,
  
  -- RFM Core Metrics (1-5 scale)
  rfm_metrics JSONB NOT NULL DEFAULT '{
    "recency_score": null,
    "frequency_score": null,
    "monetary_score": null,
    "segment": null
  }',
  
  -- Detailed Customer Intelligence
  intelligence JSONB NOT NULL DEFAULT '{
    "lifetime_value": 0,
    "avg_order_value": 0,
    "visit_frequency": 0,
    "churn_risk": null,
    "preferred_time_slots": [],
    "seasonal_patterns": [],
    "price_sensitivity": null
  }',
  
  -- Status & Flags
  status JSONB NOT NULL DEFAULT '{
    "is_vip": false,
    "loyalty_tier": "bronze",
    "blacklisted": false
  }',
  
  -- Raw Calculation Data
  raw_data JSONB NOT NULL DEFAULT '{
    "recency_days": 0,
    "frequency_count": 0,
    "monetary_total": 0
  }',
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_customer_rfm_modtime
BEFORE UPDATE ON customer_intelligence.customer_rfm_profiles
FOR EACH ROW EXECUTE FUNCTION customer_intelligence.update_modified_column();

--- Disable transaction for index creation
BEGIN;
-- Disable transaction for these specific commands
SET LOCAL synchronous_commit = off;

-- Indexes without CONCURRENTLY (will block writes during index creation)
CREATE INDEX IF NOT EXISTS idx_customer_tags_category_name 
ON customer_intelligence.customer_tags(category, name);

CREATE INDEX IF NOT EXISTS idx_customer_tags_created_at
ON customer_intelligence.customer_tags USING BRIN(created_at);

-- Tag assignments indexes
CREATE INDEX IF NOT EXISTS idx_tag_assignments_customer
ON customer_intelligence.customer_tag_assignments(customer_id);

CREATE INDEX IF NOT EXISTS idx_tag_assignments_tag
ON customer_intelligence.customer_tag_assignments(tag_id);

-- Customer notes indexes
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_type
ON customer_intelligence.customer_notes(customer_id, type);

CREATE INDEX IF NOT EXISTS idx_customer_notes_important
ON customer_intelligence.customer_notes(is_important)
WHERE is_important = TRUE;

-- RFM Analytics indexes
-- Corrected index for JSONB column
CREATE INDEX IF NOT EXISTS idx_rfm_customer_segment
ON customer_intelligence.customer_rfm_profiles
USING GIN ((rfm_metrics->'segment'));

CREATE INDEX IF NOT EXISTS idx_rfm_lifetime_value
ON customer_intelligence.customer_rfm_profiles
USING BRIN (CAST(intelligence->>'lifetime_value' AS numeric));

COMMIT;

-- Enable Row Level Security
ALTER TABLE customer_intelligence.customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_intelligence.customer_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_intelligence.customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_intelligence.customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_intelligence.customer_rfm_profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (customize as needed)
CREATE POLICY "Users can manage their own data"
ON customer_intelligence.customer_preferences
FOR ALL USING (customer_id = auth.uid());

-- Optional: Create a view for easy access to customer intelligence
CREATE OR REPLACE VIEW customer_intelligence.customer_overview WITH (security_invoker=true) AS
SELECT 
  c.id AS customer_id,
  c.name,
  c.email,
  p.preferences,
  rfm.rfm_metrics,
  rfm.intelligence,
  array_agg(DISTINCT t.name) AS tags
FROM 
  public.customers c
  LEFT JOIN customer_intelligence.customer_preferences p ON c.id = p.customer_id
  LEFT JOIN customer_intelligence.customer_rfm_profiles rfm ON c.id = rfm.customer_id
  LEFT JOIN customer_intelligence.customer_tag_assignments ta ON c.id = ta.customer_id
  LEFT JOIN customer_intelligence.customer_tags t ON ta.tag_id = t.id
GROUP BY 
  c.id, c.name, c.email, p.preferences, rfm.rfm_metrics, rfm.intelligence;
