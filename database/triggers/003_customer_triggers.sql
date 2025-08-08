-- G-ADMIN CUSTOMER MODULE TRIGGERS
-- Real-time RFM Updates and Data Consistency

-- Optimized RFM Update Function with Batch Processing
CREATE OR REPLACE FUNCTION trigger_update_customer_rfm()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  affected_customers UUID[];
BEGIN
  -- Collect affected customer IDs in a more efficient manner
  IF TG_OP = 'INSERT' THEN
    affected_customers := ARRAY[NEW.customer_id];
  ELSIF TG_OP = 'UPDATE' THEN
    affected_customers := ARRAY[NEW.customer_id, OLD.customer_id];
  ELSIF TG_OP = 'DELETE' THEN
    affected_customers := ARRAY[OLD.customer_id];
  END IF;

  -- Use a more efficient batch update approach
  WITH unique_customers AS (
    SELECT DISTINCT unnest(affected_customers) AS customer_id
    WHERE customer_id IS NOT NULL
  )
  INSERT INTO customer_rfm_update_queue (customer_id, queued_at)
  SELECT customer_id, NOW()
  FROM unique_customers
  ON CONFLICT (customer_id) DO UPDATE 
  SET queued_at = NOW();
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Background Worker for RFM Recalculation
CREATE OR REPLACE FUNCTION process_rfm_update_queue()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  processed_count INTEGER;
BEGIN
  -- Process queued customers in batches
  WITH batch_customers AS (
    DELETE FROM customer_rfm_update_queue
    WHERE queued_at <= NOW() - INTERVAL '5 minutes'
    RETURNING customer_id
  )
  SELECT COUNT(DISTINCT customer_id) INTO processed_count
  FROM batch_customers;

  -- Bulk recalculate RFM for batch
  PERFORM calculate_customer_rfm_profiles(365);

  RETURN processed_count;
END;
$$;

-- Create triggers on sales table with improved error handling
DROP TRIGGER IF EXISTS sales_rfm_update_trigger ON sales;
CREATE TRIGGER sales_rfm_update_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_customer_rfm();

-- Enhanced Timestamp Update Function with Logging
CREATE OR REPLACE FUNCTION update_customer_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Standard timestamp update
  NEW.updated_at = NOW();
  
  -- Optional: Add lightweight logging for audit purposes
  IF TG_TABLE_NAME != 'customer_rfm_profiles' THEN
    INSERT INTO customer_update_log (
      table_name, 
      record_id, 
      updated_at, 
      updated_columns
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      NOW(),
      (SELECT json_object_agg(key, value) 
       FROM (
         SELECT key, value 
         FROM jsonb_each(to_jsonb(NEW)) 
         WHERE value != (to_jsonb(OLD))->key
       ) changed_columns
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Prerequisite Tables for Enhanced Functionality
CREATE TABLE IF NOT EXISTS customer_rfm_update_queue (
  customer_id UUID PRIMARY KEY,
  queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_update_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_columns JSONB
);

-- Apply timestamp triggers to all customer-related tables
CREATE OR REPLACE PROCEDURE create_timestamp_triggers()
LANGUAGE plpgsql
AS $$
DECLARE
  customer_tables TEXT[] := ARRAY[
    'customer_intelligence.customer_tags', 
    'customer_intelligence.customer_preferences', 
    'customer_intelligence.customer_notes', 
    'customer_intelligence.customer_rfm_profiles'
  ];
  table_name TEXT;
  schema_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY customer_tables LOOP
    schema_name := split_part(table_name, '.', 1);
    table_name := split_part(table_name, '.', 2);
    
    EXECUTE format('
      DROP TRIGGER IF EXISTS %I_updated_at_trigger ON %I.%I;
      CREATE TRIGGER %I_updated_at_trigger
        BEFORE UPDATE ON %I.%I
        FOR EACH ROW
        EXECUTE FUNCTION update_customer_timestamp();
    ', table_name, schema_name, table_name, table_name, schema_name, table_name);
  END LOOP;
END;
$$;

-- Execute the procedure to create triggers
CALL create_timestamp_triggers();