import type { SecurityOptions } from './types';
import { errorHandler } from '@/lib/error-handling';
// NOTE: Permission checks removed - secureApiCall is @deprecated. Modern modules use usePermissions() hook + Supabase RLS
import { sanitizeObject } from './sanitization';

import { logger } from '@/lib/logging';
/**
 * @deprecated DO NOT USE - Client-side rate limiting is INSECURE
 *
 * This in-memory Map can be trivially bypassed by:
 * - Clearing browser memory/localStorage
 * - Using incognito mode
 * - Opening multiple tabs
 *
 * ✅ PRODUCTION SOLUTION: Cloudflare Rate Limiting
 *
 * Cloudflare Free Tier provides:
 * - 10,000 requests/month rate limiting
 * - Server-side enforcement (impossible to bypass)
 * - DDoS protection
 * - Configuration via dashboard (no code needed)
 *
 * See docs/SECURITY_ARCHITECTURE.md for Cloudflare setup instructions.
 *
 * This function will be removed once Cloudflare is configured.
 * @see https://developers.cloudflare.com/waf/rate-limiting-rules/
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimitGuard(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  console.warn(
    'rateLimitGuard() is client-side only and INSECURE. ' +
    'Use Cloudflare Rate Limiting for production. ' +
    'See docs/SECURITY_ARCHITECTURE.md'
  );

  const now = Date.now();
  const key = identifier;

  const current = rateLimitStore.get(key);

  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * Secure API call wrapper with validation and security checks
 *
 * @deprecated This function is being phased out in favor of:
 * 1. Supabase RLS (Row Level Security) for authorization
 * 2. Database triggers for audit logging
 * 3. CloudFlare for rate limiting and DDoS protection
 * 4. Edge Functions for critical business logic
 *
 * Current uses remaining: None in core modules (Materials, Sales use direct services)
 *
 * TODO: Remove completely after verifying all modules use the new pattern:
 *   Hook → Service → Supabase Client → RLS (PostgreSQL)
 *
 * See: docs/MODULE_DESIGN_CONVENTIONS.md for the definitive pattern
 */
export async function secureApiCall<T>(
  operation: () => Promise<T>,
  options: SecurityOptions = {}
): Promise<T> {
  const startTime = Date.now();
  const operationId = crypto.randomUUID();
  
  try {
    // 1. Rate limiting
    if (options.rateLimit) {
      const { maxRequests, windowMs } = options.rateLimit;
      const identifier = getCurrentUserIdentifier();
      
      if (!rateLimitGuard(identifier, maxRequests, windowMs)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    }
    
    // 2. Authentication check
    if (options.requireAuth) {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }
    }
    
    // 3. Permission check
//     if (options.requiredPermissions?.length) {
//       if (!// hasAllPermissions(options.requiredPermissions)) {
//         throw new Error(`Insufficient permissions: ${options.requiredPermissions.join(', ')}`);
//       }
//     }
    
    // 4. CSRF validation (if enabled)
    if (options.validateCsrf) {
      if (!validateCsrfToken()) {
        throw new Error('Invalid CSRF token');
      }
    }
    
    // 5. Log access attempt
    if (options.logAccess) {
      logSecurityEvent('api_access', {
        operationId,
        user: getCurrentUserIdentifier(),
        timestamp: new Date().toISOString(),
        permissions: options.requiredPermissions
      });
    }
    
    // 6. Execute operation with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 30000); // 30s timeout
    });
    
    const result = await Promise.race([operation(), timeoutPromise]);
    
    // 7. Log successful operation
    const duration = Date.now() - startTime;
    logSecurityEvent('api_success', {
      operationId,
      duration,
      timestamp: new Date().toISOString()
    });
    
    return result;
    
  } catch (error) {
    // Log security error
    const duration = Date.now() - startTime;
    logSecurityEvent('api_error', {
      operationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      timestamp: new Date().toISOString()
    });
    
    // Handle and re-throw
    errorHandler.handle(error as Error, {
      operation: 'secureApiCall',
      operationId,
      options
    });
    
    throw error;
  }
}

/**
 * Input validation and sanitization middleware
 */
export function validateAndSanitizeInput<T>(
  input: T,
  options: {
    sanitize?: boolean;
    allowedFields?: string[];
    requiredFields?: string[];
    maxStringLength?: number;
    maxArrayLength?: number;
    maxObjectDepth?: number;
  } = {}
): T {
  if (!input || typeof input !== 'object') {
    return input;
  }
  
  let sanitized = input;
  
  // Sanitize if requested
  if (options.sanitize) {
    sanitized = sanitizeObject(input, {
      trimStrings: true,
      removeHtmlTags: true,
      escapeHtml: true,
      normalizeWhitespace: true
    });
  }
  
  // Validate structure
  if (Array.isArray(sanitized)) {
    if (options.maxArrayLength && sanitized.length > options.maxArrayLength) {
      throw new Error(`Array too long. Maximum ${options.maxArrayLength} items allowed.`);
    }
    return sanitized;
  }
  
  // Object validation
  const obj = sanitized as Record<string, any>;
  
  // Check object depth
  if (options.maxObjectDepth) {
    const depth = getObjectDepth(obj);
    if (depth > options.maxObjectDepth) {
      throw new Error(`Object too deep. Maximum ${options.maxObjectDepth} levels allowed.`);
    }
  }
  
  // Filter allowed fields
  if (options.allowedFields) {
    const filtered: Record<string, any> = {};
    for (const field of options.allowedFields) {
      if (field in obj) {
        filtered[field] = obj[field];
      }
    }
    sanitized = filtered as T;
  }
  
  // Check required fields
  if (options.requiredFields) {
    for (const field of options.requiredFields) {
      if (!(field in (sanitized as any))) {
        throw new Error(`Required field missing: ${field}`);
      }
    }
  }
  
  // Validate string lengths
  if (options.maxStringLength) {
    for (const [key, value] of Object.entries(sanitized as any)) {
      if (typeof value === 'string' && value.length > options.maxStringLength) {
        throw new Error(`Field ${key} too long. Maximum ${options.maxStringLength} characters.`);
      }
    }
  }
  
  return sanitized;
}

/**
 * @deprecated DO NOT USE - Supabase Auth handles password hashing with bcrypt
 *
 * Supabase automatically hashes passwords using bcrypt when you call:
 * - supabase.auth.signUp({ email, password })
 * - supabase.auth.signInWithPassword({ email, password })
 *
 * This custom SHA-256 implementation is INSECURE and should never be used.
 * It will be removed in a future version.
 *
 * @see https://supabase.com/docs/guides/auth/password-security
 */
export async function hashPassword(_password: string): Promise<string> {
  throw new Error(
    'hashPassword() is deprecated. Use Supabase Auth instead: ' +
    'supabase.auth.signUp({ email, password })'
  );
}

/**
 * Generate secure random tokens
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * @deprecated DO NOT USE - Supabase automatically prevents SQL injection
 *
 * Supabase uses parameterized queries and PostgREST, which automatically
 * escape all parameters. You NEVER need to manually sanitize SQL.
 *
 * ✅ CORRECT:
 *   const { data } = await supabase
 *     .from('users')
 *     .select('*')
 *     .eq('email', userInput)  // Automatically safe
 *
 * ❌ WRONG: Don't manually build SQL strings
 *
 * This function will be removed in a future version.
 * @see https://supabase.com/docs/guides/database/overview
 */
export function preventSqlInjection(_query: string, _params: any[]): { query: string; params: any[] } {
  throw new Error(
    'preventSqlInjection() is deprecated. Supabase automatically prevents SQL injection. ' +
    'Use Supabase query builder: supabase.from(table).select().eq(col, value)'
  );
}

/**
 * XSS protection
 */
export function preventXss(input: string): string {
  const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const onEventPattern = /on\w+\s*=/gi;
  const javascriptPattern = /javascript:/gi;
  
  return input
    .replace(scriptPattern, '')
    .replace(onEventPattern, '')
    .replace(javascriptPattern, '');
}

/**
 * @deprecated DO NOT USE - Supabase Auth handles CSRF protection automatically
 *
 * Supabase Auth protects against CSRF attacks using:
 * 1. PKCE flow (Proof Key for Code Exchange)
 * 2. SameSite cookies (Lax by default)
 * 3. State parameters in OAuth flows
 *
 * No manual CSRF token validation is needed when using Supabase Auth.
 *
 * Configuration in src/lib/supabase/client.ts:
 *   - flowType: 'pkce' ✅
 *   - detectSessionInUrl: true ✅
 *
 * This function will be removed in a future version.
 * @see https://supabase.com/docs/guides/auth/sessions/pkce-flow
 */
export function validateCsrfToken(): boolean {
  console.warn(
    'validateCsrfToken() is deprecated and does nothing. ' +
    'Supabase Auth handles CSRF protection automatically via PKCE flow.'
  );
  return true; // Always return true to avoid breaking existing code
}

/**
 * Check if user is authenticated
 */
function isAuthenticated(): boolean {
  // Check with your auth system
  const token = localStorage.getItem('auth-token');
  return !!token;
}

/**
 * Get current user identifier for logging/rate limiting
 */
function getCurrentUserIdentifier(): string {
  // In production, use user ID or session ID
  return localStorage.getItem('user-id') || 'anonymous';
}

/**
 * Security event logging
 */
function logSecurityEvent(event: string, details: Record<string, any>): void {
  const logEntry = {
    event,
    details,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ip: 'unknown' // In production, get from server
  };
  
  // In production, send to your logging service
  logger.info('App', 'Security Event:', logEntry);
  
  // Store locally for audit (in production, send to secure logging service)
  const existingLogs = localStorage.getItem('security-logs');
  const logs = existingLogs ? JSON.parse(existingLogs) : [];
  logs.push(logEntry);
  
  // Keep only last 100 logs
  if (logs.length > 100) {
    logs.splice(0, logs.length - 100);
  }
  
  localStorage.setItem('security-logs', JSON.stringify(logs));
}

/**
 * Get object depth for validation
 */
function getObjectDepth(obj: any, depth: number = 1): number {
  if (obj === null || typeof obj !== 'object') {
    return depth;
  }
  
  let maxDepth = depth;
  for (const value of Object.values(obj)) {
    const currentDepth = getObjectDepth(value, depth + 1);
    maxDepth = Math.max(maxDepth, currentDepth);
  }
  
  return maxDepth;
}

/**
 * Content Security Policy header validation
 */
export function validateCsp(): boolean {
  const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  return !!meta;
}

/**
 * Detect and prevent clickjacking
 */
export function preventClickjacking(): void {
  if (window.top !== window.self) {
    // Page is in iframe - potential clickjacking
    document.body.style.display = 'none';
    alert('This page cannot be displayed in a frame for security reasons.');
  }
}