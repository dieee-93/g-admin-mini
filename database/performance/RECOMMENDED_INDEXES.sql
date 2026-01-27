-- ============================================
-- PERFORMANCE OPTIMIZATION: RECOMMENDED DATABASE INDEXES
-- ============================================
--
-- Purpose: Performance fixes identified by Chrome DevTools MCP analysis
-- Date: December 25, 2025
-- Context: Slow queries detected (504ms-1032ms response times)
--
-- IMPACT ANALYSIS:
-- - time_off_requests: 1032ms → target <300ms (70% improvement)
-- - operational_shifts: 526ms → target <200ms (62% improvement)
-- - cash_sessions: 504ms → target <200ms (60% improvement)
-- - membership_metrics: 512ms → target <250ms (51% improvement)
--
-- ============================================

-- ============================================
-- 1. TIME_OFF_REQUESTS (CRITICAL - 1032ms)
-- ============================================

-- Index 1: Filter by status + sort by created_at
-- Query pattern: SELECT * FROM time_off_requests WHERE status = ? ORDER BY created_at DESC
-- Current: Full table scan + sort (1032ms)
-- Expected: Index scan (< 300ms)
CREATE INDEX IF NOT EXISTS idx_time_off_requests_status_created 
ON time_off_requests(status, created_at DESC);

-- Index 2: Filter by employee_id + sort
-- Query pattern: SELECT * FROM time_off_requests WHERE employee_id = ? ORDER BY created_at DESC
-- Expected: Index scan (< 200ms)
CREATE INDEX IF NOT EXISTS idx_time_off_requests_employee_created 
ON time_off_requests(employee_id, created_at DESC);

-- Index 3: Date range queries for calendar view
-- Query pattern: WHERE start_date >= ? AND end_date <= ?
CREATE INDEX IF NOT EXISTS idx_time_off_requests_date_range 
ON time_off_requests(start_date, end_date);

-- ============================================
-- 2. OPERATIONAL_SHIFTS (HIGH PRIORITY - 526ms)
-- ============================================

-- Index 1: Composite filter (business_id + status + location_id)
-- Query pattern: WHERE business_id = ? AND status = ? AND location_id = ?
-- Current: Multiple index scans or full scan (526ms)
-- Expected: Single index scan (< 200ms)
CREATE INDEX IF NOT EXISTS idx_operational_shifts_business_status_location 
ON operational_shifts(business_id, status, location_id);

-- Index 2: Filter by location + date range
-- Query pattern: WHERE location_id = ? AND shift_date BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_operational_shifts_location_date 
ON operational_shifts(location_id, shift_date);

-- ============================================
-- 3. CASH_SESSIONS (HIGH PRIORITY - 504ms)
-- ============================================

-- Index 1: Filter by status + sort by opened_at
-- Query pattern: WHERE status = 'OPEN' ORDER BY opened_at DESC
-- Current: Full scan + sort (504ms)
-- Expected: Index scan (< 200ms)
CREATE INDEX IF NOT EXISTS idx_cash_sessions_status_opened 
ON cash_sessions(status, opened_at DESC);

-- Index 2: Filter by location + status
-- Query pattern: WHERE location_id = ? AND status = ?
CREATE INDEX IF NOT EXISTS idx_cash_sessions_location_status 
ON cash_sessions(location_id, status);

-- ============================================
-- 4. MEMBERSHIP_METRICS (RPC OPTIMIZATION)
-- ============================================

-- Note: This is an RPC function (get_membership_metrics)
-- Optimization requires reviewing the function internals
-- Common patterns to index:

-- If function queries memberships table:
CREATE INDEX IF NOT EXISTS idx_memberships_status_created 
ON memberships(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memberships_customer_status 
ON memberships(customer_id, status);

-- If function queries membership_transactions:
CREATE INDEX IF NOT EXISTS idx_membership_transactions_membership_created 
ON membership_transactions(membership_id, created_at DESC);

-- ============================================
-- ADDITIONAL PERFORMANCE RECOMMENDATIONS
-- ============================================

-- GENERAL PATTERNS (from codebase analysis):

-- 1. Products table (frequently queried)
CREATE INDEX IF NOT EXISTS idx_products_category_active 
ON products(category, is_active);

CREATE INDEX IF NOT EXISTS idx_products_updated 
ON products(updated_at DESC);

-- 2. Sales/Orders table
CREATE INDEX IF NOT EXISTS idx_orders_status_created 
ON orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_customer_date 
ON orders(customer_id, created_at DESC);

-- 3. Staff/Employees table
CREATE INDEX IF NOT EXISTS idx_employees_location_active 
ON employees(location_id, is_active);

-- 4. Suppliers table
CREATE INDEX IF NOT EXISTS idx_suppliers_active 
ON suppliers(is_active);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these queries to verify index effectiveness:

-- 1. Check index usage
-- EXPLAIN ANALYZE SELECT * FROM time_off_requests WHERE status = 'pending' ORDER BY created_at DESC LIMIT 50;

-- 2. Monitor query performance (before/after)
-- SELECT query, mean_exec_time, calls FROM pg_stat_statements WHERE query LIKE '%time_off_requests%' ORDER BY mean_exec_time DESC LIMIT 10;

-- 3. Check index sizes (ensure no over-indexing)
-- SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
-- FROM pg_indexes
-- JOIN pg_stat_user_indexes USING (schemaname, tablename, indexname)
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- MAINTENANCE NOTES
-- ============================================

-- 1. Apply indexes during low-traffic hours (or use CONCURRENTLY)
-- 2. Monitor query performance for 48 hours post-deployment
-- 3. Use EXPLAIN ANALYZE to verify index usage
-- 4. Consider VACUUM ANALYZE after index creation
-- 5. Review pg_stat_user_indexes for unused indexes after 1 week

-- Example concurrent creation (recommended for production):
-- CREATE INDEX CONCURRENTLY idx_time_off_requests_status_created 
-- ON time_off_requests(status, created_at DESC);

-- ============================================
-- ROLLBACK PLAN
-- ============================================

-- If indexes cause issues, remove with:
-- DROP INDEX IF EXISTS idx_time_off_requests_status_created;
-- DROP INDEX IF EXISTS idx_time_off_requests_employee_created;
-- DROP INDEX IF EXISTS idx_time_off_requests_date_range;
-- DROP INDEX IF EXISTS idx_operational_shifts_business_status_location;
-- DROP INDEX IF EXISTS idx_operational_shifts_location_date;
-- DROP INDEX IF EXISTS idx_cash_sessions_status_opened;
-- DROP INDEX IF EXISTS idx_cash_sessions_location_status;
-- DROP INDEX IF EXISTS idx_memberships_status_created;
-- DROP INDEX IF EXISTS idx_memberships_customer_status;
-- DROP INDEX IF EXISTS idx_membership_transactions_membership_created;
