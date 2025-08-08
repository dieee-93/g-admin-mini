-- Eliminar tabla customers existente si existe
DROP TABLE IF EXISTS customers CASCADE;

-- Crear tabla customers con todas las columnas necesarias
CREATE TABLE customers (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    email text UNIQUE,
    phone text,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Crear tabla customer_rfm_profiles
CREATE TABLE customer_rfm_profiles (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    customer_id bigint REFERENCES customers(id),
    rfm_segment text,
    churn_risk text CHECK (churn_risk IN ('low', 'medium', 'high')),
    recency_days integer,
    lifetime_value numeric(10,2),
    last_purchase_date date,
    avg_order_value numeric(10,2),
    visit_frequency numeric(5,2),
    is_vip boolean DEFAULT false,
    frequency_count integer,
    loyalty_tier text,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- Eliminar tabla sales existente si existe
DROP TABLE IF EXISTS sales CASCADE;

-- Crear tabla sales con la estructura definida
CREATE TABLE sales (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    customer_id bigint REFERENCES customers(id),
    amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_rfm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_customer_rfm_segment ON customer_rfm_profiles(rfm_segment);
CREATE INDEX idx_customer_rfm_churn_risk ON customer_rfm_profiles(churn_risk);
CREATE INDEX idx_sales_customer ON sales(customer_id);

-- Customer Segmentation Overview (Materialized View)
CREATE MATERIALIZED VIEW customer_segment_overview AS
SELECT 
  rfm_segment,
  COUNT(*) as customer_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage,
  AVG(lifetime_value) as avg_lifetime_value,
  SUM(lifetime_value) as total_segment_value,
  AVG(avg_order_value) as avg_order_value,
  AVG(visit_frequency) as avg_visit_frequency,
  COUNT(CASE WHEN is_vip THEN 1 END) as vip_count,
  COUNT(CASE WHEN churn_risk = 'high' THEN 1 END) as high_churn_risk_count
FROM customer_rfm_profiles
GROUP BY rfm_segment
ORDER BY total_segment_value DESC;

-- Create unique index for efficient refresh
CREATE UNIQUE INDEX ON customer_segment_overview (rfm_segment);

-- Customer Churn Analysis View
CREATE OR REPLACE VIEW customer_churn_analysis AS
SELECT 
  c.id,
  c.name,
  c.email,
  c.phone,
  rfm.rfm_segment,
  rfm.churn_risk,
  rfm.recency_days,
  rfm.lifetime_value,
  rfm.last_purchase_date,
  CASE 
    WHEN rfm.recency_days > 90 THEN 'Immediate Action Required'
    WHEN rfm.recency_days > 60 THEN 'Follow Up Recommended'
    WHEN rfm.recency_days > 30 THEN 'Monitor Closely'
    ELSE 'Active Customer'
  END as action_required,
  -- Suggested retention strategy
  CASE 
    WHEN rfm.rfm_segment = 'cannot_lose' THEN 'Personal outreach + VIP treatment'
    WHEN rfm.rfm_segment = 'at_risk' THEN 'Discount offer + feedback request'
    WHEN rfm.churn_risk = 'high' THEN 'Win-back campaign'
    ELSE 'Standard engagement'
  END as suggested_strategy
FROM customers c
JOIN customer_rfm_profiles rfm ON c.id = rfm.customer_id
WHERE rfm.churn_risk IN ('medium', 'high')
ORDER BY rfm.lifetime_value DESC, rfm.recency_days DESC;

-- Customer Lifetime Value Tiers View
CREATE OR REPLACE VIEW customer_ltv_tiers AS
SELECT 
  c.id,
  c.name,
  c.email,
  rfm.lifetime_value,
  rfm.avg_order_value,
  rfm.frequency_count,
  rfm.loyalty_tier,
  CASE 
    WHEN rfm.lifetime_value >= 1000 THEN 'Platinum'
    WHEN rfm.lifetime_value >= 500 THEN 'Gold'  
    WHEN rfm.lifetime_value >= 200 THEN 'Silver'
    ELSE 'Bronze'
  END as value_tier,
  -- Upsell potential
  CASE 
    WHEN rfm.avg_order_value < 30 AND rfm.frequency_count >= 5 THEN 'High'
    WHEN rfm.avg_order_value < 50 AND rfm.frequency_count >= 3 THEN 'Medium'
    ELSE 'Low'
  END as upsell_potential
FROM customers c
JOIN customer_rfm_profiles rfm ON c.id = rfm.customer_id
ORDER BY rfm.lifetime_value DESC;

-- Monthly Customer Acquisition Trends View
CREATE OR REPLACE VIEW customer_acquisition_trends AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_customers,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as customers_with_email,
  COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as customers_with_phone,
  -- Calculate retention (customers who made 2+ purchases)
  COUNT(CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM sales s 
      WHERE s.customer_id = c.id
    ) >= 2 THEN 1 
  END) as retained_customers,
  -- Calculate average time to second purchase
  AVG(CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM sales s 
      WHERE s.customer_id = c.id
    ) >= 2 THEN (
      SELECT EXTRACT(DAYS FROM MIN(s.created_at) - c.created_at)
      FROM sales s 
      WHERE s.customer_id = c.id
    )
  END) as avg_days_to_second_purchase
FROM customers c
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_customer_analytics_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW customer_segment_overview;
  -- Add more materialized views here as needed
END;
$$;

