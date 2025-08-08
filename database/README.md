# G-ADMIN CUSTOMER MODULE DATABASE DEPLOYMENT GUIDE

## Prerequisites
- Supabase project with existing 'customers' and 'sales' tables
- PostgreSQL admin access
- UUID extension enabled

## Deployment Order

### 1. Schema Migration
Run in Supabase SQL Editor:
```sql
-- Execute: database/migrations/001_enhanced_customers_schema.sql
```

### 2. RFM Functions
Run in Supabase SQL Editor:
```sql  
-- Execute: database/functions/002_rfm_calculation_functions.sql
```

### 3. Triggers Setup
Run in Supabase SQL Editor:
```sql
-- Execute: database/triggers/003_customer_triggers.sql
```

### 4. Sample Data (Optional)
Run in Supabase SQL Editor:
```sql
-- Execute: database/migrations/004_sample_data.sql
```

### 5. Real-time Setup
Run in Supabase SQL Editor:
```sql
-- Execute: database/migrations/005_realtime_setup.sql
```

### 6. Analytics Views
Run in Supabase SQL Editor:
```sql
-- Execute: database/migrations/006_analytics_views.sql
```

## Post-Deployment

### Initial RFM Calculation
```sql
-- Calculate RFM profiles for all existing customers
SELECT calculate_customer_rfm_profiles(365);
```

### Verify Installation
```sql
-- Check table creation
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'customer_%';

-- Check RFM profiles count
SELECT COUNT(*) FROM customer_rfm_profiles;

-- Test analytics function
SELECT get_customer_analytics_dashboard();
```

## Real-time Subscriptions in Frontend

### TypeScript Example
```typescript
import { supabase } from './supabase-client';

// Subscribe to RFM profile changes
const subscription = supabase
  .channel('customer-rfm-changes')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'customer_rfm_profiles' 
    }, 
    (payload) => {
      console.log('RFM profile changed:', payload);
      // Update UI accordingly
    }
  )
  .subscribe();
```

## Performance Monitoring

### Check Index Usage
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename LIKE 'customer_%'
ORDER BY idx_tup_read DESC;
```

## Maintenance

### Weekly Tasks
- Refresh materialized views: `SELECT refresh_customer_analytics_views();`
- Review RFM segment distribution
- Check for customers needing attention

### Monthly Tasks  
- Analyze customer acquisition trends
- Review and update RFM scoring thresholds
- Clean up old customer notes (if policy exists)
