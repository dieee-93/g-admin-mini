-- G-ADMIN CUSTOMER MODULE - SAMPLE DATA
-- Initial setup with sample tags and data

-- Insert sample customer tags
INSERT INTO customer_tags (name, color, category, description) VALUES
('VIP Customer', '#FFD700', 'behavior', 'High-value customer with premium service'),
('Frequent Visitor', '#4CAF50', 'behavior', 'Visits more than 3 times per month'),
('Diet Conscious', '#FF9800', 'preference', 'Prefers healthy, organic options'),
('Family Dining', '#2196F3', 'demographic', 'Usually dines with family/large groups'),
('Quick Service', '#9C27B0', 'preference', 'Prefers fast, efficient service'),
('Allergic - Nuts', '#F44336', 'preference', 'CRITICAL: Nut allergy - food safety'),
('Birthday Club', '#E91E63', 'custom', 'Enrolled in birthday promotions'),
('Corporate Client', '#607D8B', 'demographic', 'Business/corporate dining'),
('Late Night Diner', '#795548', 'behavior', 'Prefers evening/late night dining'),
('Price Sensitive', '#FFEB3B', 'behavior', 'Responds well to discounts and promotions')
ON CONFLICT (name) DO NOTHING;

-- Insert sample communication preferences for existing customers
INSERT INTO customer_communication_preferences (customer_id, email_marketing, sms_marketing, birthday_offers, special_events)
SELECT 
  id,
  true,
  CASE WHEN phone IS NOT NULL THEN true ELSE false END,
  true,
  true
FROM customers
ON CONFLICT (customer_id) DO NOTHING;

-- Create initial RFM calculation job
-- This should be run after the schema is deployed
SELECT calculate_customer_rfm_profiles(365) as customers_processed;
