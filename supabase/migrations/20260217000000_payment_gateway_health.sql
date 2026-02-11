-- Create enum for gateway status
CREATE TYPE payment_gateway_status AS ENUM ('operational', 'degraded', 'down', 'maintenance');

-- Table: payment_gateway_health
CREATE TABLE IF NOT EXISTS public.payment_gateway_health (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    gateway_name text NOT NULL UNIQUE, -- 'mercadopago', 'stripe'
    status payment_gateway_status DEFAULT 'operational'::payment_gateway_status,
    error_rate float DEFAULT 0.0, -- Percentage 0.0 to 1.0
    avg_latency_ms integer DEFAULT 0,
    success_rate float DEFAULT 1.0, -- Percentage 0.0 to 1.0
    last_check timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table: payment_gateway_limits
CREATE TABLE IF NOT EXISTS public.payment_gateway_limits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    gateway_name text NOT NULL REFERENCES public.payment_gateway_health(gateway_name) ON DELETE CASCADE,
    daily_limit integer NOT NULL DEFAULT 10000,
    current_usage integer DEFAULT 0,
    reset_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(gateway_name)
);

-- Enable RLS
ALTER TABLE public.payment_gateway_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateway_limits ENABLE ROW LEVEL SECURITY;

-- Policies (Public read, Service role write)
CREATE POLICY "Allow public read access to gateway health"
    ON public.payment_gateway_health FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to gateway limits"
    ON public.payment_gateway_limits FOR SELECT
    USING (true);

-- Seed initial data
INSERT INTO public.payment_gateway_health (gateway_name, status, metadata)
VALUES 
    ('mercadopago', 'operational', '{"region": "latam"}'::jsonb),
    ('stripe', 'operational', '{"region": "global"}'::jsonb)
ON CONFLICT (gateway_name) DO NOTHING;

INSERT INTO public.payment_gateway_limits (gateway_name, daily_limit, reset_at)
VALUES 
    ('mercadopago', 50000, (now() + interval '1 day')),
    ('stripe', 100000, (now() + interval '1 day'))
ON CONFLICT (gateway_name) DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.payment_gateway_health TO anon, authenticated;
GRANT SELECT ON public.payment_gateway_limits TO anon, authenticated;
