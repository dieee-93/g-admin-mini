-- Enable Realtime for alerts table to support live updates in UI
alter publication supabase_realtime add table alerts;

-- Enable Realtime for universal_alert_rules to support live updates in Rule Editor
alter publication supabase_realtime add table universal_alert_rules;
