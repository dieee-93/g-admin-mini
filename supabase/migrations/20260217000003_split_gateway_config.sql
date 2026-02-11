-- Migration: Split payment gateway config into test and live
-- Date: 2026-02-17 00:00:03

-- 1. Add new columns
ALTER TABLE payment_gateways
ADD COLUMN test_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN live_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN mode TEXT CHECK (mode IN ('test', 'live')) DEFAULT 'test';

-- 2. Migrate existing config to test_config (safest default assumption)
-- We assume current configs are likely test configs or empty
UPDATE payment_gateways
SET test_config = config;

-- 3. Drop old config column (optional, but cleaner to eventually remove it)
-- For now, we'll keep it but mark it deprecated in comments or just ignore it.
-- actually, let's keep it for backward compatibility for a moment, or drop it if we are confident.
-- Given the user just said the table is empty/broken, dropping it or ignoring it is fine.
-- Let's NOT drop it yet to avoid breaking other unknown code, but we will stop using it.

-- 4. Notify about the change (optional comment)
COMMENT ON COLUMN payment_gateways.config IS 'DEPRECATED: Use test_config or live_config instead';
