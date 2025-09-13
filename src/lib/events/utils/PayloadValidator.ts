// PayloadValidator.ts - Comprehensive payload validation and XSS protection
// Prevents injection of malicious code through event payloads

import type { NamespacedEvent } from '../types';
import { SecurityLogger } from './SecureLogger';

interface ValidationConfig {
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  enableHTMLSanitization: boolean;
  maxStringLength: number;
  maxObjectDepth: number;
  maxArrayLength: number;
  allowedProtocols: string[];
  blockedPatterns: RegExp[];
}

interface ValidationResult {
  isValid: boolean;
  sanitizedPayload: any;
  violations: ValidationViolation[];
  blocked: boolean;
  originalSize: number;
  sanitizedSize: number;
}

interface ValidationViolation {
  type: 'xss' | 'sql_injection' | 'html_injection' | 'protocol_violation' | 'size_limit' | 'depth_limit';
  field: string;
  originalValue: string;
  sanitizedValue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

// Comprehensive XSS patterns (2025 updated)
const XSS_PATTERNS = [
  // Script tags
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<script[^>]*>.*?<\/script>/gi,
  /<script[^>]*\/>/gi,
  
  // Event handlers - improved to handle escaped quotes
  /on\w+\s*=\s*["'][^"'\\]*(?:\\.[^"'\\]*)*["']/gi,  // With quotes, handles escaped chars
  /on\w+\s*=\s*[^>\s"']+/gi,                          // Without quotes
  
  // HTML tags with dangerous URLs - full tag patterns (process BEFORE generic javascript:)
  /<iframe[^>]*src\s*=\s*["']javascript:[^"']*["'][^>]*>.*?<\/iframe>/gi,
  /<iframe[^>]*src\s*=\s*["']vbscript:[^"']*["'][^>]*>.*?<\/iframe>/gi,
  /<object[^>]*data\s*=\s*["']javascript:[^"']*["'][^>]*>.*?<\/object>/gi,
  /<embed[^>]*src\s*=\s*["']javascript:[^"']*["'][^>]*>/gi,
  /<form[^>]*action\s*=\s*["']javascript:[^"']*["'][^>]*>.*?<\/form>/gi,
  
  // JavaScript URLs (generic patterns, process AFTER full HTML patterns)
  /javascript\s*:\s*/gi,
  /vbscript\s*:\s*/gi,
  /data\s*:\s*text\/html/gi,
  
  // CSS expressions
  /expression\s*\(/gi,
  /-moz-binding\s*:/gi,
  
  // Meta refresh
  /<meta[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi,
  
  // Iframe and object injections
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>/gi,
  
  // SVG with script
  /<svg[^>]*>.*?<script.*?<\/script>.*?<\/svg>/gi,
  
  // Advanced XSS vectors
  /&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;/gi, // Encoded "javascript"
  /\\\u006A\u0061\u0076\u0061\u0073\u0063\u0072\u0069\u0070\u0074/gi, // Unicode "javascript"
  
  // Template injection patterns
  /\{\{\s*.*\s*\}\}/g,
  /\$\{\s*.*\s*\}/g
];

// SQL Injection patterns
const SQL_INJECTION_PATTERNS = [
  // Classic SQL injection - more specific patterns to reduce false positives
  /(union\s+select\s+)/gi,                    // UNION SELECT (with space after SELECT)
  /(select\s+.*\s+from\s+\w+)/gi,             // SELECT ... FROM table
  /(insert\s+into\s+\w+)/gi,                  // INSERT INTO table
  /(delete\s+from\s+\w+)/gi,                  // DELETE FROM table  
  /(update\s+\w+\s+set\s+)/gi,                // UPDATE table SET
  /(drop\s+table\s+\w+)/gi,                   // DROP TABLE table
  /(truncate\s+table\s+\w+)/gi,               // TRUNCATE TABLE table
  /(alter\s+table\s+\w+)/gi,                  // ALTER TABLE table
  
  // SQL functions and commands
  /(exec|execute|sp_|xp_)/gi,
  /(waitfor\s+delay|benchmark\s*\()/gi,
  
  // SQL operators - more specific patterns to avoid false positives
  /(';\s*drop|';\s*delete|';\s*insert|';\s*update|';\s*truncate)/gi,  // Quote followed by SQL commands
  /(';\s*return\s+\w+;?\s*\/\/)/gi,                                   // JavaScript injection in SQL: '; return true; //
  /(--\s*$|\/\*.*?\*\/)/gi,                                          // SQL comments
  /(\s+and\s+1\s*=\s*1|\s+or\s+1\s*=\s*1)/gi,                       // Boolean SQL injection
  /('.*?'.*?'|".*?".*?")/gi,                                         // Multiple quotes patterns (suspicious)
  
  // Time-based blind SQL injection
  /(sleep\s*\(|pg_sleep\s*\()/gi,
  
  // NoSQL injection patterns (MongoDB, etc.)
  /\$ne\s*:\s*null/gi,                 // MongoDB $ne: null injection
  /\$gt\s*:\s*\"\"/gi,                 // MongoDB $gt: "" injection
  /\$regex\s*:\s*.*/gi,                // MongoDB regex injection
  /\$where\s*:\s*.*/gi,                // MongoDB $where injection
  /\$in\s*:\s*\[.*\]/gi,               // MongoDB $in array injection
  /\$nin\s*:\s*\[.*\]/gi,              // MongoDB $nin array injection
  /\$or\s*:\s*\[.*\]/gi,               // MongoDB $or injection
  /\$and\s*:\s*\[.*\]/gi,              // MongoDB $and injection
  /\$exists\s*:\s*(true|false)/gi,     // MongoDB $exists injection
  /(db\.\w+\.(drop|remove|deleteMany|deleteOne)\s*\()/gi,  // MongoDB dangerous operations
  
  // LDAP injection patterns - specific malicious filters (OWASP 2025)
  /\)\(\|/g,                           // Common LDAP injection: )|(
  /\)\(&/g,                            // Common LDAP injection: )(&
  /\*\)\(objectclass=/gi,              // Object class injection: *)(objectclass=
  /\*\)\(cn=/gi,                       // CN injection: *)(cn=
  /\*\)\(uid=/gi,                      // UID injection: *)(uid=
  /\*\)\(mail=/gi,                     // Mail injection: *)(mail=
  /\)\(\*\)/g                          // Wildcard injection: )(*)
];

// HTML injection patterns
const HTML_INJECTION_PATTERNS = [
  /<[^>]+>/g, // Any HTML tag
  /&[a-zA-Z]+;/g, // HTML entities
  /&#[0-9]+;/g, // Numeric HTML entities
  /&#x[0-9a-fA-F]+;/g // Hex HTML entities
];

// Dangerous protocols
const DANGEROUS_PROTOCOLS = [
  'javascript:', 'vbscript:', 'data:', 'file:', 'ftp:'
];

const DEFAULT_CONFIG: ValidationConfig = {
  enableXSSProtection: true,
  enableSQLInjectionProtection: true,
  enableHTMLSanitization: true,
  maxStringLength: 10000, // 10KB per string
  maxObjectDepth: 10,
  maxArrayLength: 1000,
  allowedProtocols: ['http:', 'https:', 'mailto:', 'tel:'],
  blockedPatterns: [...XSS_PATTERNS, ...SQL_INJECTION_PATTERNS]
};

export class PayloadValidator {
  private static config: ValidationConfig = DEFAULT_CONFIG;

  /**
   * Configure payload validation settings
   */
  static configure(config: Partial<ValidationConfig>): void {
    this.config = { ...DEFAULT_CONFIG, ...config };
    SecurityLogger.anomaly('PayloadValidator configured', {
      xssProtection: this.config.enableXSSProtection,
      sqlProtection: this.config.enableSQLInjectionProtection,
      htmlSanitization: this.config.enableHTMLSanitization
    });
  }

  /**
   * Validate and sanitize event payload
   */
  static validateAndSanitize<TPayload>(
    event: NamespacedEvent<TPayload>
  ): ValidationResult {
    const startTime = performance.now();
    const originalSize = this.calculatePayloadSize(event.payload);
    
    try {
      const violations: ValidationViolation[] = [];
      let sanitizedPayload = this.deepClone(event.payload);
      let blocked = false;

      // Deep validation and sanitization
      sanitizedPayload = this.validateObjectRecursive(
        sanitizedPayload,
        violations,
        '',
        0
      );

      // Check for critical violations that should block the event
      const criticalViolations = violations.filter(v => v.severity === 'critical');
      if (criticalViolations.length > 0) {
        blocked = true;
        SecurityLogger.threat('Payload blocked due to critical violations', {
          eventId: event.id,
          pattern: event.pattern,
          violations: criticalViolations.length,
          criticalTypes: criticalViolations.map(v => v.type)
        });
      }

      // Log violations if any
      if (violations.length > 0) {
        SecurityLogger.violation('Payload sanitization violations detected', {
          eventId: event.id,
          pattern: event.pattern,
          totalViolations: violations.length,
          violationTypes: [...new Set(violations.map(v => v.type))],
          severityBreakdown: {
            low: violations.filter(v => v.severity === 'low').length,
            medium: violations.filter(v => v.severity === 'medium').length,
            high: violations.filter(v => v.severity === 'high').length,
            critical: violations.filter(v => v.severity === 'critical').length
          }
        });
      }

      const sanitizedSize = this.calculatePayloadSize(sanitizedPayload);
      const processingTime = performance.now() - startTime;

      if (processingTime > 100) { // Log if validation takes >100ms
        SecurityLogger.anomaly('Slow payload validation detected', {
          processingTimeMs: processingTime,
          originalSizeKB: (originalSize / 1024).toFixed(2),
          violations: violations.length
        });
      }

      return {
        isValid: !blocked,
        sanitizedPayload,
        violations,
        blocked,
        originalSize,
        sanitizedSize
      };

    } catch (error) {
      SecurityLogger.threat('Payload validation failed', {
        eventId: event.id,
        pattern: event.pattern,
        error: error.message
      });

      return {
        isValid: false,
        sanitizedPayload: null,
        violations: [{
          type: 'xss',
          field: 'payload',
          originalValue: '[VALIDATION_ERROR]',
          sanitizedValue: '[BLOCKED]',
          severity: 'critical',
          description: `Validation failed: ${error.message}`
        }],
        blocked: true,
        originalSize,
        sanitizedSize: 0
      };
    }
  }

  /**
   * Quick validation check without sanitization (for performance-critical paths)
   */
  static quickValidate<TPayload>(payload: TPayload): boolean {
    try {
      const payloadStr = JSON.stringify(payload);
      
      // Quick pattern check - use only high-confidence patterns to avoid false positives
      const quickPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,  // Script tags
        /javascript\s*:\s*[^"\s]/gi,                            // javascript: protocol
        /vbscript\s*:\s*[^"\s]/gi,                              // vbscript: protocol
        /(union\s+select\s+)/gi,                                // SQL UNION SELECT
        /(drop\s+table\s+\w+)/gi,                               // SQL DROP TABLE
        /\$ne\s*:\s*null/gi,                                    // NoSQL injection
        /(exec|execute)\s+xp_/gi,                               // SQL execution
      ];
      
      for (const pattern of quickPatterns) {
        if (pattern.test(payloadStr)) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get validation statistics
   */
  static getValidationStats(): {
    totalValidations: number;
    blockedPayloads: number;
    averageProcessingTimeMs: number;
    commonViolationTypes: string[];
  } {
    // This would typically be tracked in a static Map or similar
    // For now, return placeholder stats
    return {
      totalValidations: 0,
      blockedPayloads: 0,
      averageProcessingTimeMs: 0,
      commonViolationTypes: []
    };
  }

  // === PRIVATE VALIDATION METHODS ===

  /**
   * Decode HTML entities to detect encoded malicious content
   */
  private static decodeHTMLEntities(text: string): string {
    // Create a temporary textarea element to leverage browser's HTML decoding
    // For Node.js environments, we'll do manual decoding
    const htmlEntityMap: Record<string, string> = {
      '&lt;': '<',
      '&gt;': '>',
      '&amp;': '&',
      '&quot;': '"',
      '&#39;': "'",
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#x2f;': '/',
    };

    let decoded = text;

    // Decode numeric HTML entities (&#106; -> j)
    decoded = decoded.replace(/&#(\d+);/g, (match, num) => {
      try {
        return String.fromCharCode(parseInt(num, 10));
      } catch {
        return match;
      }
    });

    // Decode hex HTML entities (&#x6A; -> j)
    decoded = decoded.replace(/&#x([a-fA-F0-9]+);/g, (match, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return match;
      }
    });

    // Decode common named entities
    Object.entries(htmlEntityMap).forEach(([entity, char]) => {
      decoded = decoded.replace(new RegExp(entity, 'gi'), char);
    });

    return decoded;
  }

  /**
   * Decode Unicode escape sequences to detect encoded malicious content
   */
  private static decodeUnicodeEscapes(text: string): string {
    // Decode \uXXXX sequences
    return text.replace(/\\u([a-fA-F0-9]{4})/g, (match, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return match;
      }
    });
  }

  /**
   * Comprehensive string decoding for XSS detection
   */
  private static decodeForXSSDetection(text: string): string {
    let decoded = text;
    
    // First pass: decode HTML entities
    decoded = this.decodeHTMLEntities(decoded);
    
    // Second pass: decode Unicode escapes  
    decoded = this.decodeUnicodeEscapes(decoded);
    
    // Third pass: decode common URL encodings that might bypass initial detection
    try {
      // Only decode if it looks like URL encoding to avoid breaking normal text
      if (decoded.includes('%')) {
        decoded = decodeURIComponent(decoded);
      }
    } catch {
      // If decoding fails, keep original
    }

    return decoded;
  }

  /**
   * Find the original encoded pattern that decoded to malicious content
   */
  private static findEncodedPattern(originalText: string, decodedText: string): string | null {
    // Simple approach: if the decoded text is much shorter, likely encoded
    if (originalText.length > decodedText.length * 2) {
      // Look for common encoding patterns
      if (originalText.includes('&#') && !decodedText.includes('&#')) {
        // HTML entity encoding - replace the problematic section
        return originalText;
      }
      if (originalText.includes('\\u') && !decodedText.includes('\\u')) {
        // Unicode encoding - replace the problematic section
        return originalText;
      }
    }
    return null;
  }

  private static validateObjectRecursive(
    obj: any,
    violations: ValidationViolation[],
    path: string,
    depth: number
  ): any {
    // Check depth limit
    if (depth > this.config.maxObjectDepth) {
      violations.push({
        type: 'depth_limit',
        field: path,
        originalValue: '[DEEP_OBJECT]',
        sanitizedValue: '[TRUNCATED]',
        severity: 'medium',
        description: `Object depth exceeds limit of ${this.config.maxObjectDepth}`
      });
      return '[TRUNCATED]';
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj, path, violations);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      if (obj.length > this.config.maxArrayLength) {
        violations.push({
          type: 'size_limit',
          field: path,
          originalValue: `[ARRAY_LENGTH_${obj.length}]`,
          sanitizedValue: `[ARRAY_LENGTH_${this.config.maxArrayLength}]`,
          severity: 'medium',
          description: `Array length exceeds limit of ${this.config.maxArrayLength}`
        });
        obj = obj.slice(0, this.config.maxArrayLength);
      }

      return obj.map((item, index) => 
        this.validateObjectRecursive(item, violations, `${path}[${index}]`, depth + 1)
      );
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key, `${path}.key`, violations);
        const fieldPath = path ? `${path}.${sanitizedKey}` : sanitizedKey;
        sanitized[sanitizedKey] = this.validateObjectRecursive(value, violations, fieldPath, depth + 1);
      }
      return sanitized;
    }

    return obj;
  }

  private static sanitizeString(
    value: string,
    field: string,
    violations: ValidationViolation[]
  ): string {
    let sanitized = value;
    const original = value;

    // Length check
    if (sanitized.length > this.config.maxStringLength) {
      sanitized = sanitized.substring(0, this.config.maxStringLength);
      violations.push({
        type: 'size_limit',
        field,
        originalValue: `[LENGTH_${original.length}]`,
        sanitizedValue: `[LENGTH_${sanitized.length}]`,
        severity: 'low',
        description: `String length exceeds limit of ${this.config.maxStringLength}`
      });
    }

    // XSS Protection with decoding
    if (this.config.enableXSSProtection) {
      // Decode the string to detect encoded XSS attempts
      const decodedValue = this.decodeForXSSDetection(sanitized);
      
      // Check both the original and decoded versions
      const valuesToCheck = [sanitized, decodedValue];
      
      for (const valueToCheck of valuesToCheck) {
        for (const pattern of XSS_PATTERNS) {
          // Create a fresh regex to avoid issues with global flag state
          const testPattern = new RegExp(pattern.source, pattern.flags);
          
          // Skip generic protocol patterns if this looks like a standalone URL (not in HTML)
          const isGenericProtocolPattern = (
            testPattern.source === 'javascript\\s*:\\s*' || 
            testPattern.source === 'vbscript\\s*:\\s*' ||
            testPattern.source === 'data\\s*:\\s*text\\/html' ||
            // Also skip script patterns for data: URLs
            (valueToCheck.startsWith('data:') && testPattern.source.includes('script'))
          );
          // Check if this is in a URL-specific field context
          const isURLField = (
            field.toLowerCase().includes('url') || 
            field.toLowerCase().includes('website') || 
            field.toLowerCase().includes('link') ||
            field.toLowerCase().includes('href') ||
            field.toLowerCase().includes('src') ||
            field.toLowerCase().includes('redirect')
          );
          
          // Check if the protocol usage looks like a complex URL rather than simple XSS
          const looksLikeURL = (
            (valueToCheck.includes('void(') && valueToCheck.includes('document.location')) ||
            valueToCheck.includes('window.location') ||
            valueToCheck.includes('.location=') ||
            (valueToCheck.includes('://') && valueToCheck.length > 30) // Only very long URLs
          );
          
          const isStandaloneURL = (
            (isURLField || looksLikeURL) && (
              (valueToCheck.startsWith('javascript:') || valueToCheck.startsWith('vbscript:')) ||
              (valueToCheck.startsWith('data:') && !valueToCheck.includes('src=') && !valueToCheck.includes('href='))
            )
          );
          
          if (isGenericProtocolPattern && isStandaloneURL) {
            continue; // Skip this pattern, let Protocol Validation handle it
          }
          
          if (testPattern.test(valueToCheck)) {
            const beforeSanitization = sanitized;
            
            // Create another fresh regex for replacement to avoid global flag issues
            const replacePattern = new RegExp(pattern.source, pattern.flags);
            sanitized = sanitized.replace(replacePattern, '[XSS_REMOVED]');
            
            // If the pattern didn't match in sanitized but matched in decoded, 
            // handle encoded content specially
            if (sanitized === beforeSanitization && valueToCheck === decodedValue) {
              // Find and replace the original encoded sequence
              const originalPattern = this.findEncodedPattern(sanitized, valueToCheck);
              if (originalPattern) {
                sanitized = sanitized.replace(originalPattern, '[XSS_REMOVED]');
              }
            }
            
            violations.push({
              type: 'xss',
              field,
              originalValue: beforeSanitization,
              sanitizedValue: sanitized,
              severity: 'critical',
              description: valueToCheck === decodedValue 
                ? 'Encoded XSS pattern detected and sanitized'
                : 'XSS pattern detected and sanitized'
            });
            
            // Break to avoid duplicate violations for the same content
            break;
          }
        }
      }
    }

    // SQL Injection Protection - only if XSS didn't already handle it
    if (this.config.enableSQLInjectionProtection && !sanitized.includes('[XSS_REMOVED]')) {
      for (const pattern of SQL_INJECTION_PATTERNS) {
        if (pattern.test(sanitized)) {
          const beforeSanitization = sanitized;
          
          
          sanitized = sanitized.replace(pattern, '[SQL_REMOVED]');
          
          violations.push({
            type: 'sql_injection',
            field,
            originalValue: beforeSanitization,
            sanitizedValue: sanitized,
            severity: 'high',
            description: 'SQL injection pattern detected and sanitized'
          });
        }
      }
    }

    // HTML Sanitization - only if XSS didn't already handle it
    if (this.config.enableHTMLSanitization && !sanitized.includes('[XSS_REMOVED]')) {
      let htmlViolationDetected = false;
      
      for (const pattern of HTML_INJECTION_PATTERNS) {
        if (pattern.test(sanitized)) {
          const beforeSanitization = sanitized;
          sanitized = sanitized.replace(pattern, '');
          htmlViolationDetected = true;
        }
      }
      
      if (htmlViolationDetected) {
        violations.push({
          type: 'html_injection',
          field,
          originalValue: value, // Use original value before any processing
          sanitizedValue: sanitized,
          severity: 'medium',
          description: 'HTML tags detected and removed'
        });
      }
    }

    // Protocol Validation - only apply if XSS didn't already handle it
    // XSS-related protocols (javascript:, vbscript:, data: with HTML) should be XSS, not protocol violations
    if (!sanitized.includes('[XSS_REMOVED]')) {
      let protocolViolationDetected = false;
      const valuesToCheckForProtocols = [value.toLowerCase(), sanitized.toLowerCase()];
      
      for (const valueToCheck of valuesToCheckForProtocols) {
        for (const protocol of DANGEROUS_PROTOCOLS) {
          if (valueToCheck.includes(protocol)) {
            // Check if this is a URL field or complex URL-like content
            const isURLField = (
              field.toLowerCase().includes('url') || 
              field.toLowerCase().includes('website') || 
              field.toLowerCase().includes('link') ||
              field.toLowerCase().includes('href') ||
              field.toLowerCase().includes('src') ||
              field.toLowerCase().includes('redirect')
            );
            
            // Check if the protocol usage looks like a complex URL rather than simple XSS
            const looksLikeURL = (
              (valueToCheck.includes('void(') && valueToCheck.includes('document.location')) ||
              valueToCheck.includes('window.location') ||
              valueToCheck.includes('.location=') ||
              (valueToCheck.includes('://') && valueToCheck.length > 30) // Only very long URLs
            );
            
            // Also check if not in HTML context
            const isInHTMLContext = (
              valueToCheck.includes('<') && valueToCheck.includes('>') && (
                valueToCheck.includes('src=') || 
                valueToCheck.includes('href=') || 
                valueToCheck.includes('action=') ||
                valueToCheck.includes('data=')
              )
            );
            
            // If this is a URL field or looks like a URL, and not in HTML context, treat as protocol violation
            if ((isURLField || looksLikeURL) && !isInHTMLContext && !protocolViolationDetected) {
              const beforeSanitization = sanitized;
              
              // Apply protocol blocking for non-XSS related dangerous protocols
              if (sanitized.toLowerCase().includes(protocol)) {
                sanitized = sanitized.replace(new RegExp(protocol, 'gi'), '[PROTOCOL_BLOCKED]');
              } else {
                sanitized = '[PROTOCOL_BLOCKED]';
              }
              
              violations.push({
                type: 'protocol_violation',
                field,
                originalValue: value,
                sanitizedValue: sanitized,
                severity: 'high',
                description: `Dangerous protocol detected: ${protocol}`
              });
              
              protocolViolationDetected = true;
            }
            break; // Exit inner loop once a protocol is found
          }
        }
        if (protocolViolationDetected) break; // Exit outer loop once violation detected
      }
    }

    return sanitized;
  }

  private static calculatePayloadSize(payload: any): number {
    try {
      return JSON.stringify(payload).length;
    } catch (error) {
      return 0;
    }
  }

  private static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }

    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }
}

export default PayloadValidator;