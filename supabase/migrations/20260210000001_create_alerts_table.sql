-- Migration to upgrade existing alerts table
-- 1. Attempt to convert context to JSONB. If it fails, we might need to clear it or handle errors, 
-- but assuming usage has been minimal or compatible JSON strings.
DO $$
BEGIN
    -- Check if context is NOT jsonb
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'context' AND data_type != 'jsonb') THEN
        ALTER TABLE alerts ALTER COLUMN context TYPE JSONB USING context::jsonb;
    END IF;
END $$;

-- 2. Add fingerprint column if not exists
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS fingerprint TEXT;

-- 3. Add or Update Indexes
DROP INDEX IF EXISTS idx_alerts_context;
CREATE INDEX IF NOT EXISTS idx_alerts_context ON alerts USING GIN (context jsonb_path_ops);

DROP INDEX IF EXISTS idx_alerts_metadata;
CREATE INDEX IF NOT EXISTS idx_alerts_metadata ON alerts USING GIN (metadata jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_alerts_fingerprint ON alerts (fingerprint);
