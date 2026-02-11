-- PAYMENT GATEWAY HEALTH CHECK CRON JOB
-- Runs Edge Function every 5 minutes to monitor Stripe and Mercado Pago

-- Enable pg_cron extension (may already be enabled)
create extension if not exists pg_cron;

-- Schedule health check every 5 minutes
-- Cron syntax: "minute hour day month weekday"
-- */5 * * * * = every 5 minutes
select cron.schedule(
  'payment-gateway-health-check',
  '*/5 * * * *',
  $$
    select
      net.http_post(
        url := (select concat(current_setting('app.settings.api_url'), '/functions/v1/payment-health-check')),
        headers := jsonb_build_object(
          'Authorization', concat('Bearer ', current_setting('app.settings.service_role_key')),
          'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
      ) as request_id;
  $$
);

-- View scheduled jobs
-- select * from cron.job;

-- Unschedule (if needed for testing)
-- select cron.unschedule('payment-gateway-health-check');
