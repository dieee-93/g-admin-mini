-- ========================================================
-- 🚀 SUPABASE SETUP FOR G-ADMIN MINI POS SYSTEM
-- ========================================================
-- Real-time subscriptions and configuration
-- Version: 3.0

-- ========================================================
-- 1. ENABLE REALTIME FOR TABLES
-- ========================================================

-- Enable realtime for all POS-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE parties;
ALTER PUBLICATION supabase_realtime ADD TABLE service_events;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_methods;
ALTER PUBLICATION supabase_realtime ADD TABLE qr_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE sales_analytics_snapshots;

-- ========================================================
-- 2. STORAGE BUCKETS FOR POS ASSETS
-- ========================================================

-- Create bucket for QR codes and receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pos-assets', 'pos-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for table layouts and floor plans
INSERT INTO storage.buckets (id, name, public) 
VALUES ('floor-plans', 'floor-plans', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for POS assets
CREATE POLICY "Authenticated users can upload POS assets" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pos-assets');

CREATE POLICY "Public can view POS assets" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'pos-assets');

CREATE POLICY "Authenticated users can upload floor plans" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'floor-plans');

CREATE POLICY "Public can view floor plans" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'floor-plans');

-- ========================================================
-- 3. EDGE FUNCTIONS SETUP
-- ========================================================

-- Example webhook endpoint setup for payment processing
-- This would be implemented as Supabase Edge Functions

/*
-- Payment webhook handler (to be implemented as Edge Function)
CREATE OR REPLACE FUNCTION handle_payment_webhook(
    webhook_payload JSON
)
RETURNS JSON AS $$
DECLARE
    payment_id UUID;
    result JSON;
BEGIN
    -- Process webhook payload from payment provider
    -- Update payment status based on webhook data
    
    UPDATE payment_methods 
    SET 
        status = (webhook_payload->>'status')::TEXT,
        transaction_id = webhook_payload->>'transaction_id',
        processed_at = NOW()
    WHERE reference_number = webhook_payload->>'reference'
    RETURNING id INTO payment_id;
    
    -- Trigger any necessary updates (notifications, etc.)
    
    RETURN json_build_object(
        'success', true,
        'payment_id', payment_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- ========================================================
-- 4. SCHEDULED FUNCTIONS (CRON JOBS)
-- ========================================================

-- Schedule daily analytics updates
-- This requires pg_cron extension
-- SELECT cron.schedule('update-daily-analytics', '0 1 * * *', 'SELECT update_daily_analytics();');

-- Schedule table color code updates every 5 minutes
-- SELECT cron.schedule('update-table-colors', '*/5 * * * *', 'SELECT update_table_color_codes();');

-- Clean up expired QR orders daily
-- SELECT cron.schedule('cleanup-qr-orders', '0 2 * * *', 'DELETE FROM qr_orders WHERE expires_at < NOW() AND status != ''completed'';');

-- ========================================================
-- 5. NOTIFICATION SETUP
-- ========================================================

-- Function to send notifications (integrate with your notification system)
CREATE OR REPLACE FUNCTION notify_pos_event(
    event_type TEXT,
    event_data JSON
)
RETURNS VOID AS $$
BEGIN
    -- This would integrate with your notification system
    -- Examples: Push notifications, SMS, email alerts
    
    -- For now, just log the event
    INSERT INTO service_events (
        party_id, 
        type, 
        description, 
        timestamp
    ) VALUES (
        COALESCE((event_data->>'party_id')::UUID, gen_random_uuid()),
        'notification'::TEXT,
        format('POS Event: %s - %s', event_type, event_data::TEXT),
        NOW()
    );
    
    -- In production, this would call external APIs:
    -- - Send push notification to staff mobile app
    -- - Send SMS alerts for critical events
    -- - Update dashboard in real-time
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================
-- 6. TRIGGERS FOR REAL-TIME NOTIFICATIONS
-- ========================================================

-- Notify when table status changes
CREATE OR REPLACE FUNCTION notify_table_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify about table status changes
    PERFORM notify_pos_event(
        'table_status_change',
        json_build_object(
            'table_id', NEW.id,
            'table_number', NEW.number,
            'old_status', OLD.status,
            'new_status', NEW.status,
            'timestamp', NOW()
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER table_status_notification
    AFTER UPDATE OF status ON tables
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_table_status_change();

-- Notify when orders need attention (overdue)
CREATE OR REPLACE FUNCTION check_overdue_orders()
RETURNS VOID AS $$
DECLARE
    overdue_order RECORD;
BEGIN
    FOR overdue_order IN
        SELECT o.id, o.order_number, t.number as table_number, o.estimated_ready_time
        FROM orders o
        LEFT JOIN tables t ON o.table_id = t.id
        WHERE o.status IN ('confirmed', 'preparing')
        AND o.estimated_ready_time < NOW()
        AND NOT EXISTS (
            SELECT 1 FROM service_events se 
            WHERE se.party_id = (
                SELECT p.id FROM parties p WHERE p.table_id = o.table_id AND p.status != 'completed' LIMIT 1
            )
            AND se.type = 'notification'
            AND se.description LIKE '%overdue%'
            AND se.timestamp > NOW() - INTERVAL '30 minutes'
        )
    LOOP
        PERFORM notify_pos_event(
            'order_overdue',
            json_build_object(
                'order_id', overdue_order.id,
                'order_number', overdue_order.order_number,
                'table_number', overdue_order.table_number,
                'overdue_minutes', EXTRACT(MINUTES FROM (NOW() - overdue_order.estimated_ready_time))
            )
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================
-- 7. PERFORMANCE OPTIMIZATION
-- ========================================================

-- Materialized view for quick analytics access
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_sales_summary AS
SELECT 
    DATE(created_at) as sale_date,
    COUNT(*) as total_orders,
    SUM(total) as total_revenue,
    AVG(total) as average_order_value,
    COUNT(DISTINCT customer_id) as unique_customers,
    COUNT(DISTINCT table_id) as tables_used
FROM sales
WHERE payment_status = 'completed'
AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- Index on materialized view
CREATE INDEX IF NOT EXISTS idx_daily_sales_summary_date ON daily_sales_summary(sale_date);

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_sales_summary()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================
-- 8. DATA CLEANUP PROCEDURES
-- ========================================================

-- Archive old sales data (keep last 2 years)
CREATE OR REPLACE FUNCTION archive_old_sales_data()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Move sales older than 2 years to archive table
    -- (Archive table would be created separately)
    
    -- For now, just count what would be archived
    SELECT COUNT(*) INTO archived_count
    FROM sales
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- In production, implement actual archiving:
    -- INSERT INTO sales_archive SELECT * FROM sales WHERE created_at < NOW() - INTERVAL '2 years';
    -- DELETE FROM sales WHERE created_at < NOW() - INTERVAL '2 years';
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up completed parties older than 30 days
CREATE OR REPLACE FUNCTION cleanup_old_parties()
RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER;
BEGIN
    DELETE FROM parties
    WHERE status = 'completed'
    AND seated_at < NOW() - INTERVAL '30 days'
    RETURNING (SELECT COUNT(*)) INTO cleanup_count;
    
    RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================
-- 9. BACKUP AND MONITORING
-- ========================================================

-- Function to check system health
CREATE OR REPLACE FUNCTION pos_system_health_check()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'timestamp', NOW(),
        'database_size', pg_size_pretty(pg_database_size(current_database())),
        'active_tables', (SELECT COUNT(*) FROM tables WHERE is_active = true),
        'occupied_tables', (SELECT COUNT(*) FROM tables WHERE status = 'occupied'),
        'pending_orders', (SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'confirmed', 'preparing')),
        'todays_sales', (SELECT COUNT(*) FROM sales WHERE created_at::date = CURRENT_DATE),
        'todays_revenue', (SELECT COALESCE(SUM(total), 0) FROM sales WHERE created_at::date = CURRENT_DATE AND payment_status = 'completed'),
        'system_alerts', (
            SELECT json_agg(
                json_build_object(
                    'type', 'overdue_order',
                    'count', COUNT(*)
                )
            )
            FROM orders 
            WHERE status IN ('confirmed', 'preparing') 
            AND estimated_ready_time < NOW()
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================
-- 10. INITIAL DATA SEEDING
-- ========================================================

-- Insert kitchen stations data
INSERT INTO public.constants (key, value, description) VALUES
('kitchen_stations', '["grill", "salad", "dessert", "bar", "prep", "expo"]', 'Available kitchen stations for order routing'),
('service_time_limits', '{"green": 15, "yellow": 30, "red": 45}', 'Service time limits in minutes for table color coding'),
('tip_percentages', '[15, 18, 20, 25]', 'Default tip percentage options'),
('payment_processing_times', '{"cash": 30, "credit_card": 45, "nfc_card": 5, "mobile_wallet": 8, "qr_code": 12}', 'Average payment processing times in seconds')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- Grant permissions
GRANT EXECUTE ON FUNCTION notify_pos_event(TEXT, JSON) TO authenticated;
GRANT EXECUTE ON FUNCTION check_overdue_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_sales_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION pos_system_health_check() TO authenticated;
GRANT EXECUTE ON FUNCTION archive_old_sales_data() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_parties() TO authenticated;

-- Enable row level security on materialized view
ALTER MATERIALIZED VIEW daily_sales_summary OWNER TO postgres;
GRANT SELECT ON daily_sales_summary TO authenticated;

-- ========================================================
-- SETUP COMPLETE
-- ========================================================

-- Display setup completion message
SELECT 
    'G-Admin Mini POS System Database Setup Complete!' as message,
    NOW() as completed_at,
    version() as postgresql_version,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%sales%' OR table_name IN ('tables', 'parties', 'orders')) as pos_tables_created;