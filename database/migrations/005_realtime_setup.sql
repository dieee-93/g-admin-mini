-- G-ADMIN SUPABASE REAL-TIME SUBSCRIPTION SETUP
-- Enhanced real-time updates for customer analytics with improved security

-- Real-time Publication Configuration
DO $$
BEGIN
  -- Dynamically manage real-time publication
  IF NOT EXISTS (SELECT FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Define customer-related tables for real-time updates
DO $$
DECLARE
  customer_tables TEXT[] := ARRAY[
    'customer_intelligence.customer_rfm_profiles',
    'customer_intelligence.customer_notes',
    'customer_intelligence.customer_tags',
    'customer_intelligence.customer_tag_assignments',
    'customer_intelligence.customer_preferences'
  ];
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY customer_tables LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %s', table_name);
    EXCEPTION WHEN OTHERS THEN
      -- Log or handle potential errors (e.g., table already in publication)
      RAISE NOTICE 'Could not add % to publication', table_name;
    END;
  END LOOP;
END $$;

-- Enhanced RLS Policies with More Granular Access Control
CREATE OR REPLACE FUNCTION check_user_access(required_role TEXT DEFAULT 'authenticated')
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT 
    CASE 
      WHEN required_role = 'authenticated' THEN auth.role() = 'authenticated'
      WHEN required_role = 'admin' THEN 
        (auth.role() = 'authenticated' AND 
         (SELECT COUNT(*) FROM auth.users WHERE id = auth.uid() AND (auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin') > 0)
      ELSE false
    END;
$$;

-- Customer RFM Profiles - Restricted Read Access
CREATE POLICY "Secure RFM Profile Access" ON customer_intelligence.customer_rfm_profiles
  FOR SELECT 
  USING (
    check_user_access('authenticated') AND 
    (SELECT COUNT(*) FROM auth.users WHERE id = auth.uid() AND id = customer_intelligence.customer_rfm_profiles.customer_id) > 0
  );

-- Customer Notes - Controlled Access
CREATE POLICY "Secure Customer Notes" ON customer_intelligence.customer_notes
  FOR ALL 
  USING (
    check_user_access('authenticated') AND 
    (SELECT COUNT(*) FROM auth.users WHERE id = auth.uid() AND id = customer_intelligence.customer_notes.customer_id) > 0
  )
  WITH CHECK (
    check_user_access('authenticated') AND 
    (SELECT COUNT(*) FROM auth.users WHERE id = auth.uid() AND id = customer_intelligence.customer_notes.customer_id) > 0
  );

-- Customer Tags - Enhanced Access Control
CREATE POLICY "Public Tag Reading" ON customer_intelligence.customer_tags
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated Tag Management" ON customer_intelligence.customer_tags
  FOR INSERT WITH CHECK (check_user_access('authenticated'));

CREATE POLICY "Authenticated Tag Updates" ON customer_intelligence.customer_tags
  FOR UPDATE 
  USING (check_user_access('authenticated'));

-- Remaining Tables - Contextual Access Control
DO $$
DECLARE
  contextual_tables TEXT[] := ARRAY[
    'customer_intelligence.customer_tag_assignments',
    'customer_intelligence.customer_preferences'
  ];
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY contextual_tables LOOP
    EXECUTE format('
      CREATE POLICY "Secure %s Access" ON %s
        FOR ALL 
        USING (
          check_user_access(''authenticated'') AND 
          (SELECT COUNT(*) FROM auth.users WHERE id = auth.uid() AND id = %s.customer_id) > 0
        )
        WITH CHECK (
          check_user_access(''authenticated'') AND 
          (SELECT COUNT(*) FROM auth.users WHERE id = auth.uid() AND id = %s.customer_id) > 0
        );
    ', 
    table_name, table_name, table_name, table_name);
  END LOOP;
END $$;


