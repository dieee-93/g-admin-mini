import { SecurityOptions } from './types';
import { errorHandler } from '@/lib/error-handling';
import { hasAllPermissions } from './permissions';
import { sanitizeObject } from './sanitization';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware
 */
export function rateLimitGuard(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const key = identifier;
  
  const current = rateLimitStore.get(key);
  
  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (now > current.resetTime) {
    // Reset window
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  current.count++;
  return true;
}

/**
 * Secure API call wrapper with validation and security checks
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
    if (options.requiredPermissions?.length) {
      if (!hasAllPermissions(options.requiredPermissions)) {
        throw new Error(`Insufficient permissions: ${options.requiredPermissions.join(', ')}`);
      }
    }
    
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
 * Secure password hashing (for future use)
 */
export async function hashPassword(password: string): Promise<string> {
  // In a real app, use bcrypt or similar
  // This is a basic implementation
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
 * SQL injection prevention
 */
export function preventSqlInjection(query: string, params: any[]): { query: string; params: any[] } {
  // Basic SQL injection prevention
  // In production, use parameterized queries with your ORM
  
  const suspiciousPatterns = [
    /('|(\\)|;|--|\/\*|\*\/|xp_|sp_|union|select|insert|update|delete|drop|create|alter|exec|execute)/gi
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(query)) {
      throw new Error('Potentially malicious SQL detected');
    }
  }
  
  // Validate parameters
  const sanitizedParams = params.map(param => {
    if (typeof param === 'string') {
      return param.replace(/['"\\;-]/g, ''); // Remove dangerous characters
    }
    return param;
  });
  
  return { query, params: sanitizedParams };
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
 * CSRF token validation
 */
export function validateCsrfToken(): boolean {
  // In production, implement proper CSRF token validation
  // This is a placeholder
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  return !!token;
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
  console.log('Security Event:', logEntry);
  
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