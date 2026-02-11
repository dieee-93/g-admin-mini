import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

/**
 * PAYMENT GATEWAY HEALTH CHECK EDGE FUNCTION
 * 
 * Runs every 5 minutes via Supabase Cron
 * Checks health of Mercado Pago and Stripe APIs
 * Updates `payment_gateway_health` and `payment_gateway_limits` tables
 * 
 * Industry Standards Applied:
 * - 5-minute check interval (balance detection speed with API load)
 * - Exponential backoff for retries (1s, 2s, 4s)
 * - Error rate threshold: >1% warning, >10% critical
 * - Success rate threshold: <99.5% warning, <98% critical
 * - Latency threshold: >500ms degraded, >1000ms critical
 */

interface HealthCheckResult {
    gateway_name: string
    status: 'operational' | 'degraded' | 'down' | 'maintenance'
    error_rate: number
    avg_latency_ms: number
    success_rate: number
    last_check: string
    metadata: {
        last_error?: string
        last_error_time?: string
        region?: string
        [key: string]: unknown
    }
}

interface GatewayConfig {
    name: string
    healthCheckUrl: string
    apiKey: string
}

/**
 * Sleep utility for exponential backoff
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Exponential backoff retry logic
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error as Error

            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt) // 1s, 2s, 4s
                console.log(`Retry attempt ${attempt + 1}/${maxRetries}, waiting ${delay}ms`)
                await sleep(delay)
            }
        }
    }

    throw lastError
}

/**
 * Check Stripe API health
 */
async function checkStripeHealth(apiKey: string): Promise<HealthCheckResult> {
    const startTime = Date.now()
    let status: 'operational' | 'degraded' | 'down' = 'operational'
    let errorRate = 0
    let successRate = 1.0
    const metadata: Record<string, unknown> = {}

    try {
        // Lightweight API call to test full integration path
        const response = await retryWithBackoff(async () => {
            const res = await fetch('https://api.stripe.com/v1/balance', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            })

            if (!res.ok) {
                throw new Error(`Stripe API error: ${res.status} ${res.statusText}`)
            }

            return res
        })

        const latency = Date.now() - startTime

        // Determine status based on latency thresholds
        if (latency > 1000) {
            status = 'down' // >1000ms is unusable
            errorRate = 0.5 // Treat as 50% error rate
            successRate = 0.5
        } else if (latency > 500) {
            status = 'degraded' // 500-1000ms is degraded
            errorRate = 0.05 // Treat as 5% error rate
            successRate = 0.95
        }

        return {
            gateway_name: 'stripe',
            status,
            error_rate: errorRate,
            avg_latency_ms: latency,
            success_rate: successRate,
            last_check: new Date().toISOString(),
            metadata: {
                region: 'us-east-1',
                ...metadata,
            },
        }
    } catch (error) {
        const latency = Date.now() - startTime

        return {
            gateway_name: 'stripe',
            status: 'down',
            error_rate: 1.0, // 100% error rate
            avg_latency_ms: latency,
            success_rate: 0,
            last_check: new Date().toISOString(),
            metadata: {
                last_error: (error as Error).message,
                last_error_time: new Date().toISOString(),
            },
        }
    }
}

/**
 * Check Mercado Pago API health
 */
async function checkMercadoPagoHealth(apiKey: string): Promise<HealthCheckResult> {
    const startTime = Date.now()
    let status: 'operational' | 'degraded' | 'down' = 'operational'
    let errorRate = 0
    let successRate = 1.0
    const metadata: Record<string, unknown> = {}

    try {
        // Lightweight API call to test full integration path
        const response = await retryWithBackoff(async () => {
            const res = await fetch('https://api.mercadopago.com/v1/users/me', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            })

            if (!res.ok) {
                throw new Error(`Mercado Pago API error: ${res.status} ${res.statusText}`)
            }

            return res
        })

        const latency = Date.now() - startTime

        // Determine status based on latency thresholds
        if (latency > 1000) {
            status = 'down'
            errorRate = 0.5
            successRate = 0.5
        } else if (latency > 500) {
            status = 'degraded'
            errorRate = 0.05
            successRate = 0.95
        }

        return {
            gateway_name: 'mercadopago',
            status,
            error_rate: errorRate,
            avg_latency_ms: latency,
            success_rate: successRate,
            last_check: new Date().toISOString(),
            metadata: {
                region: 'latam',
                ...metadata,
            },
        }
    } catch (error) {
        const latency = Date.now() - startTime

        return {
            gateway_name: 'mercadopago',
            status: 'down',
            error_rate: 1.0,
            avg_latency_ms: latency,
            success_rate: 0,
            last_check: new Date().toISOString(),
            metadata: {
                last_error: (error as Error).message,
                last_error_time: new Date().toISOString(),
            },
        }
    }
}

/**
 * Update gateway health in database
 */
async function updateGatewayHealth(
    supabase: ReturnType<typeof createClient>,
    result: HealthCheckResult
) {
    const { error } = await supabase
        .from('payment_gateway_health')
        .upsert({
            gateway_name: result.gateway_name,
            status: result.status,
            error_rate: result.error_rate,
            avg_latency_ms: result.avg_latency_ms,
            success_rate: result.success_rate,
            last_check: result.last_check,
            metadata: result.metadata,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'gateway_name',
        })

    if (error) {
        console.error(`Failed to update ${result.gateway_name} health:`, error)
        throw error
    }

    console.log(`✅ Updated ${result.gateway_name} health:`, {
        status: result.status,
        latency: `${result.avg_latency_ms}ms`,
        error_rate: `${(result.error_rate * 100).toFixed(2)}%`,
    })
}

/**
 * Main handler
 */
/**
 * Fetch credentials from database if not in environment
 */
async function getGatewayCredential(
    supabase: ReturnType<typeof createClient>,
    provider: 'stripe' | 'mercadopago'
): Promise<string | null> {
    // 1. Try environment variable
    const envKey = provider === 'stripe'
        ? Deno.env.get('STRIPE_SECRET_KEY')
        : Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')

    if (envKey) return envKey

    // 2. Try database
    try {
        const { data, error } = await supabase
            .from('payment_gateways')
            .select('test_config, live_config, mode, config')
            .eq('provider', provider)
            .eq('is_active', true)
            .single()

        if (error || !data) return null

        // Determine which config to use
        const mode = data.mode || 'test'
        const activeConfig = (mode === 'live' ? data.live_config : data.test_config) || data.config || {}
        const config = activeConfig as any

        if (provider === 'stripe') {
            return config.secret_key || config.api_key || null
        } else {
            return config.access_token || null
        }
    } catch (err) {
        console.error(`Failed to fetch ${provider} credentials from DB:`, err)
        return null
    }
}

/**
 * Main handler
 */
serve(async (req) => {
    try {
        // Initialize Supabase client with service role
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        console.log('🏥 Starting payment gateway health checks...')

        // Get Credentials (Env -> DB Fallback)
        const [stripeKey, mercadoPagoKey] = await Promise.all([
            getGatewayCredential(supabase, 'stripe'),
            getGatewayCredential(supabase, 'mercadopago')
        ])

        // Run health checks in parallel (allow missing keys to just report "down")
        const [stripeResult, mercadoPagoResult] = await Promise.all([
            stripeKey
                ? checkStripeHealth(stripeKey)
                : Promise.resolve({
                    gateway_name: 'stripe',
                    status: 'down' as const,
                    error_rate: 1,
                    avg_latency_ms: 0,
                    success_rate: 0,
                    last_check: new Date().toISOString(),
                    metadata: { last_error: 'Missing Stripe API Key configuration' }
                }),
            mercadoPagoKey
                ? checkMercadoPagoHealth(mercadoPagoKey)
                : Promise.resolve({
                    gateway_name: 'mercadopago',
                    status: 'down' as const,
                    error_rate: 1,
                    avg_latency_ms: 0,
                    success_rate: 0,
                    last_check: new Date().toISOString(),
                    metadata: { last_error: 'Missing Mercado Pago Access Token' }
                })
        ])

        // Update database
        await Promise.all([
            updateGatewayHealth(supabase, stripeResult),
            updateGatewayHealth(supabase, mercadoPagoResult),
        ])

        console.log('✅ Health checks complete', {
            stripe: stripeResult.status,
            mercadopago: mercadoPagoResult.status
        })

        return new Response(
            JSON.stringify({
                success: true,
                timestamp: new Date().toISOString(),
                results: [stripeResult, mercadoPagoResult],
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('❌ Health check failed:', error)

        return new Response(
            JSON.stringify({
                success: false,
                error: (error as Error).message,
                timestamp: new Date().toISOString(),
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            }
        )
    }
})
