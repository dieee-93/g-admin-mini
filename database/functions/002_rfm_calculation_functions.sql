-- Recommended Indexes
CREATE INDEX IF NOT EXISTS idx_sales_customer_created_at 
ON sales (customer_id, created_at);

CREATE OR REPLACE FUNCTION calculate_customer_rfm_profiles(
  analysis_period_days INTEGER DEFAULT 365
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  processed_count INTEGER := 0;
BEGIN
  -- Use window functions for more precise quintile-based scoring
  WITH customer_metrics AS (
    SELECT 
      c.id,
      COALESCE(
        (CURRENT_DATE - MAX(s.created_at::DATE))::INTEGER,
        999
      ) as recency_days,
      COUNT(s.id) as frequency_count,
      COALESCE(SUM(s.total), 0) as monetary_total,
      COALESCE(AVG(s.total), 0) as avg_order_value
    FROM customers c
    LEFT JOIN sales s ON c.id = s.customer_id 
      AND s.created_at >= (CURRENT_DATE - INTERVAL '1 day' * analysis_period_days)
    GROUP BY c.id
  ),
  rfm_scores AS (
    SELECT 
      id,
      recency_days,
      frequency_count,
      monetary_total,
      avg_order_value,
      -- Use NTILE for more statistically sound quintile scoring
      NTILE(5) OVER (ORDER BY recency_days) as r_score,
      NTILE(5) OVER (ORDER BY frequency_count) as f_score,
      NTILE(5) OVER (ORDER BY monetary_total) as m_score
    FROM customer_metrics
  ),
  rfm_segments AS (
    SELECT 
      *,
      CASE 
        WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'champions'
        WHEN r_score >= 3 AND f_score >= 3 AND m_score >= 3 THEN 'loyal'
        WHEN r_score >= 4 AND f_score <= 2 THEN 'new'
        WHEN r_score >= 3 AND f_score <= 3 AND m_score >= 3 THEN 'potential'
        WHEN r_score <= 2 AND f_score >= 3 AND m_score >= 4 THEN 'cannot_lose'
        WHEN r_score <= 2 AND f_score >= 2 AND m_score >= 3 THEN 'at_risk'
        ELSE 'lost'
      END as segment,
      CASE 
        WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'low'
        WHEN r_score >= 3 AND f_score >= 3 AND m_score >= 3 THEN 'low'
        WHEN r_score >= 4 AND f_score <= 2 THEN 'medium'
        ELSE 'high'
      END as churn_risk_level
    FROM rfm_scores
  )
  -- Bulk upsert for better performance with JSONB structure
  INSERT INTO customer_intelligence.customer_rfm_profiles (
    customer_id, 
    rfm_metrics,
    intelligence,
    calculated_at, 
    updated_at
  )
  SELECT 
    id,
    jsonb_build_object(
      'recency_score', r_score,
      'frequency_score', f_score, 
      'monetary_score', m_score,
      'segment', segment
    ),
    jsonb_build_object(
      'lifetime_value', monetary_total,
      'avg_order_value', avg_order_value,
      'visit_frequency', frequency_count,
      'churn_risk', churn_risk_level,
      'recency_days', recency_days,
      'frequency_count', frequency_count,
      'monetary_total', monetary_total,
      'is_vip', (segment = 'champions' OR segment = 'cannot_lose'),
      'loyalty_tier', CASE 
        WHEN segment = 'champions' THEN 'platinum'
        WHEN segment IN ('loyal', 'cannot_lose') THEN 'gold'  
        WHEN segment = 'potential' THEN 'silver'
        ELSE 'bronze'
      END
    ),
    NOW(),
    NOW()
  FROM rfm_segments
  ON CONFLICT (customer_id) DO UPDATE SET
    rfm_metrics = EXCLUDED.rfm_metrics,
    intelligence = EXCLUDED.intelligence,
    updated_at = NOW();

  GET DIAGNOSTICS processed_count = ROW_COUNT;
  RETURN processed_count;
END;
$$;