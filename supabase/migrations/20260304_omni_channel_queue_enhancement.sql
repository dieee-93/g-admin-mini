-- Migration: Add payment_status to fulfillment_queue
-- Date: 2026-03-04
-- Purpose: Support "Unpaid Handover Risk" operational alert

ALTER TABLE public.fulfillment_queue
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- Add index for performance (filtering unpaid ready orders)
CREATE INDEX IF NOT EXISTS idx_fulfillment_queue_status_payment 
ON public.fulfillment_queue (status, payment_status);

COMMENT ON COLUMN public.fulfillment_queue.payment_status IS 'Payment status cache (pending, paid, failed, refunded) for operational alerts';
