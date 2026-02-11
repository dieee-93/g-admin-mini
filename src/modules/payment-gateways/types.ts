/**
 * PAYMENT GATEWAY HEALTH MONITORING TYPES
 * 
 * Type definitions for monitoring payment gateway health, status, and API limits.
 * Integrates with Universal Alert Rules for proactive notifications.
 */

import type { Database } from '@/lib/supabase/database.types';

// ==================== DATABASE TYPES ====================

export type PaymentGatewayStatus = Database['public']['Enums']['payment_gateway_status'];

export type PaymentGatewayHealthRow = Database['public']['Tables']['payment_gateway_health']['Row'];
export type PaymentGatewayHealthInsert = Database['public']['Tables']['payment_gateway_health']['Insert'];
export type PaymentGatewayHealthUpdate = Database['public']['Tables']['payment_gateway_health']['Update'];

export type PaymentGatewayLimitsRow = Database['public']['Tables']['payment_gateway_limits']['Row'];
export type PaymentGatewayLimitsInsert = Database['public']['Tables']['payment_gateway_limits']['Insert'];
export type PaymentGatewayLimitsUpdate = Database['public']['Tables']['payment_gateway_limits']['Update'];

// ==================== UI TYPES ====================

/**
 * Payment Gateway Health Status (UI-optimized)
 * Transforms DB timestamps to Date objects
 */
export interface PaymentGatewayHealth {
    id: string;
    gatewayName: 'mercadopago' | 'stripe';
    status: PaymentGatewayStatus;
    errorRate: number; // 0.0 to 1.0
    avgLatencyMs: number;
    successRate: number; // 0.0 to 1.0
    lastCheck: Date;
    metadata: {
        region?: string;
        lastError?: string;
        lastErrorTime?: string;
        [key: string]: unknown;
    };
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Payment Gateway API Limits (UI-optimized)
 */
export interface PaymentGatewayLimits {
    id: string;
    gatewayName: 'mercadopago' | 'stripe';
    dailyLimit: number;
    currentUsage: number;
    resetAt: Date;
    createdAt: Date;
    updatedAt: Date;

    // Computed fields
    usagePercentage: number; // 0-100
    remainingCalls: number;
}

/**
 * Combined Gateway Status (for dashboard display)
 */
export interface GatewayStatusSummary {
    gateway: 'mercadopago' | 'stripe';
    health: PaymentGatewayHealth;
    limits: PaymentGatewayLimits;

    // Computed status
    isHealthy: boolean;
    isNearLimit: boolean; // >80% usage
    needsAttention: boolean; // degraded or down or near limit
}

// ==================== HEALTH CHECK TYPES ====================

/**
 * Health Check Request (for Edge Function)
 */
export interface HealthCheckRequest {
    gateway: 'mercadopago' | 'stripe';
    forceCheck?: boolean; // Skip cache, force fresh check
}

/**
 * Health Check Response (from Edge Function)
 */
export interface HealthCheckResponse {
    gateway: 'mercadopago' | 'stripe';
    status: PaymentGatewayStatus;
    metrics: {
        latencyMs: number;
        successRate: number;
        errorRate: number;
        timestamp: string;
    };
    limits?: {
        dailyLimit: number;
        currentUsage: number;
        resetAt: string;
    };
    error?: string;
}

// ==================== MAPPERS ====================

/**
 * Map DB row to UI type
 */
export function mapHealthToUI(row: PaymentGatewayHealthRow): PaymentGatewayHealth {
    return {
        id: row.id,
        gatewayName: row.gateway_name as 'mercadopago' | 'stripe',
        status: row.status || 'operational',
        errorRate: row.error_rate || 0,
        avgLatencyMs: row.avg_latency_ms || 0,
        successRate: row.success_rate || 1.0,
        lastCheck: new Date(row.last_check || row.updated_at || row.created_at || new Date()),
        metadata: (row.metadata as Record<string, unknown>) || {},
        createdAt: new Date(row.created_at || new Date()),
        updatedAt: new Date(row.updated_at || new Date()),
    };
}

/**
 * Map DB row to UI type
 */
export function mapLimitsToUI(row: PaymentGatewayLimitsRow): PaymentGatewayLimits {
    const usage = row.current_usage || 0;
    const limit = row.daily_limit;

    return {
        id: row.id,
        gatewayName: row.gateway_name as 'mercadopago' | 'stripe',
        dailyLimit: limit,
        currentUsage: usage,
        resetAt: new Date(row.reset_at),
        createdAt: new Date(row.created_at || new Date()),
        updatedAt: new Date(row.updated_at || new Date()),
        usagePercentage: (usage / limit) * 100,
        remainingCalls: limit - usage,
    };
}
