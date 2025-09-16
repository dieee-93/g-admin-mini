// ContentSecurityPolicy.ts - Advanced CSP management for EventBus security
// Prevents XSS, injection attacks, and enforces secure content policies

import { SecurityLogger } from './SecureLogger';
import SecureRandomGenerator from './SecureRandomGenerator';

/**
 * CSP directive configuration
 */
export interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'font-src'?: string[];
  'connect-src'?: string[];
  'media-src'?: string[];
  'object-src'?: string[];
  'child-src'?: string[];
  'frame-src'?: string[];
  'worker-src'?: string[];
  'manifest-src'?: string[];
  'base-uri'?: string[];
  'form-action'?: string[];
  'frame-ancestors'?: string[];
  'report-uri'?: string[];
  'report-to'?: string[];
  'upgrade-insecure-requests'?: boolean;
  'block-all-mixed-content'?: boolean;
  'require-trusted-types-for'?: string[];
  'trusted-types'?: string[];
}

/**
 * CSP configuration
 */
export interface CSPConfig {
  enabled: boolean;
  enforceMode: boolean; // true = enforce, false = report-only
  directives: CSPDirectives;
  nonce: {
    enabled: boolean;
    regenerateInterval: number; // milliseconds
  };
  reportEndpoint: string;
  violations: {
    enableReporting: boolean;
    maxViolationsPerMinute: number;
    alertThreshold: number;
  };
  trustedTypes: {
    enabled: boolean;
    policies: string[];
  };
}

/**
 * CSP violation report
 */
export interface CSPViolationReport {
  'document-uri': string;
  referrer: string;
  'violated-directive': string;
  'effective-directive': string;
  'original-policy': string;
  disposition: string;
  'blocked-uri': string;
  'line-number': number;
  'column-number': number;
  'source-file': string;
  timestamp: number;
  userAgent: string;
  clientIP: string;
}

/**
 * CSP statistics
 */
export interface CSPStats {
  violationsLastHour: number;
  violationsLastDay: number;
  topViolatedDirectives: Array<{ directive: string; count: number }>;
  topBlockedSources: Array<{ source: string; count: number }>;
  suspiciousActivity: boolean;
  currentNonce?: string;
}

/**
 * Content Security Policy manager with advanced threat detection
 */
export class ContentSecurityPolicy {
  private config: CSPConfig;
  private currentNonce: string = '';
  private nonceTimer: number | null = null;
  private violations: Map<string, CSPViolationReport[]> = new Map();
  private cleanupTimer: number | null = null;

  constructor(config: Partial<CSPConfig> = {}) {
    this.config = {
      enabled: true,
      enforceMode: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'https:', 'data:'],
        'connect-src': ["'self'"],
        'media-src': ["'self'"],
        'object-src': ["'none'"],
        'child-src': ["'self'"],
        'frame-src': ["'self'"],
        'worker-src': ["'self'"],
        'manifest-src': ["'self'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'upgrade-insecure-requests': true,
        'block-all-mixed-content': true,
        'require-trusted-types-for': ["'script'"],
        'trusted-types': ['default']
      },
      nonce: {
        enabled: true,
        regenerateInterval: 5 * 60 * 1000 // 5 minutes
      },
      reportEndpoint: '/api/security/csp-report',
      violations: {
        enableReporting: true,
        maxViolationsPerMinute: 10,
        alertThreshold: 50
      },
      trustedTypes: {
        enabled: true,
        policies: ['default', 'eventbus-policy']
      },
      ...config
    };

    if (this.config.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize CSP system
   */
  private initialize(): void {
    if (this.config.nonce.enabled) {
      this.generateNonce();
      this.startNonceRotation();
    }

    this.startCleanupTimer();

    SecurityLogger.security('ContentSecurityPolicy initialized', {
      enforceMode: this.config.enforceMode,
      nonceEnabled: this.config.nonce.enabled,
      trustedTypesEnabled: this.config.trustedTypes.enabled
    });
  }

  /**
   * Generate Content Security Policy header
   */
  generateCSPHeader(): { name: string; value: string } {
    if (!this.config.enabled) {
      return { name: '', value: '' };
    }

    const policy = this.buildPolicyString();
    const headerName = this.config.enforceMode 
      ? 'Content-Security-Policy'
      : 'Content-Security-Policy-Report-Only';

    SecurityLogger.info('CSP header generated', {
      policy: policy.substring(0, 100) + '...',
      enforceMode: this.config.enforceMode,
      nonce: this.currentNonce ? `${this.currentNonce.substring(0, 8)}...` : 'none'
    });

    return {
      name: headerName,
      value: policy
    };
  }

  /**
   * Build CSP policy string from directives
   */
  private buildPolicyString(): string {
    const directives: string[] = [];

    for (const [directive, values] of Object.entries(this.config.directives)) {
      if (values === true) {
        directives.push(directive);
      } else if (values === false || !values) {
        continue;
      } else if (Array.isArray(values)) {
        let directiveValue = values.join(' ');
        
        // Add nonce to script-src and style-src if enabled
        if (this.config.nonce.enabled && this.currentNonce) {
          if (directive === 'script-src' || directive === 'style-src') {
            directiveValue += ` 'nonce-${this.currentNonce}'`;
          }
        }
        
        directives.push(`${directive} ${directiveValue}`);
      }
    }

    // Add report endpoint if configured
    if (this.config.violations.enableReporting && this.config.reportEndpoint) {
      directives.push(`report-uri ${this.config.reportEndpoint}`);
    }

    return directives.join('; ');
  }

  /**
   * Generate cryptographically secure nonce
   */
  private generateNonce(): void {
    this.currentNonce = SecureRandomGenerator.getInstance().generateId(16);
    
    SecurityLogger.info('New CSP nonce generated', {
      noncePrefix: this.currentNonce.substring(0, 8),
      timestamp: Date.now()
    });
  }

  /**
   * Start nonce rotation timer
   */
  private startNonceRotation(): void {
    this.nonceTimer = setInterval(() => {
      this.generateNonce();
    }, this.config.nonce.regenerateInterval);
  }

  /**
   * Get current nonce for inline scripts/styles
   */
  getCurrentNonce(): string | null {
    return this.config.nonce.enabled ? this.currentNonce : null;
  }

  /**
   * Process CSP violation report
   */
  async processViolationReport(
    report: Partial<CSPViolationReport>,
    clientIP: string,
    userAgent: string
  ): Promise<void> {
    if (!this.config.violations.enableReporting) {
      return;
    }

    const violationReport: CSPViolationReport = {
      'document-uri': report['document-uri'] || '',
      referrer: report.referrer || '',
      'violated-directive': report['violated-directive'] || '',
      'effective-directive': report['effective-directive'] || '',
      'original-policy': report['original-policy'] || '',
      disposition: report.disposition || 'enforce',
      'blocked-uri': report['blocked-uri'] || '',
      'line-number': report['line-number'] || 0,
      'column-number': report['column-number'] || 0,
      'source-file': report['source-file'] || '',
      timestamp: Date.now(),
      userAgent,
      clientIP
    };

    // Store violation report
    const key = `${clientIP}:${violationReport['violated-directive']}`;
    if (!this.violations.has(key)) {
      this.violations.set(key, []);
    }
    this.violations.get(key)!.push(violationReport);

    // Analyze violation for security threats
    await this.analyzeViolation(violationReport);

    SecurityLogger.security('CSP violation reported', {
      directive: violationReport['violated-directive'],
      blockedUri: violationReport['blocked-uri'],
      sourceFile: violationReport['source-file'],
      clientIP,
      userAgent: userAgent.substring(0, 50)
    });
  }

  /**
   * Analyze violation for potential security threats
   */
  private async analyzeViolation(violation: CSPViolationReport): Promise<void> {
    let threatLevel = 0;
    const threats: string[] = [];

    // Check for common XSS patterns
    const blockedUri = violation['blocked-uri'].toLowerCase();
    const sourceFile = violation['source-file'].toLowerCase();

    // Data URI injection
    if (blockedUri.startsWith('data:')) {
      threatLevel += 30;
      threats.push('data-uri-injection');
    }

    // JavaScript protocol injection
    if (blockedUri.startsWith('javascript:')) {
      threatLevel += 50;
      threats.push('javascript-protocol-injection');
    }

    // External script injection
    if (violation['violated-directive'].includes('script-src') && 
        !blockedUri.includes(violation['document-uri'])) {
      threatLevel += 40;
      threats.push('external-script-injection');
    }

    // Inline script/style violations (potential XSS)
    if (blockedUri === 'inline' || sourceFile === 'inline') {
      threatLevel += 25;
      threats.push('inline-content-violation');
    }

    // Eval-like violations
    if (blockedUri.includes('eval') || sourceFile.includes('eval')) {
      threatLevel += 45;
      threats.push('eval-usage-detected');
    }

    // Suspicious domains
    const suspiciousDomains = [
      'bit.ly', 'tinyurl.com', 'pastebin.com', 'hastebin.com',
      'githubusercontent.com', 'raw.github.com'
    ];
    
    if (suspiciousDomains.some(domain => blockedUri.includes(domain))) {
      threatLevel += 35;
      threats.push('suspicious-domain');
    }

    // Check violation frequency from same IP
    const recentViolations = this.getRecentViolations(violation.clientIP, 5 * 60 * 1000); // 5 minutes
    if (recentViolations.length > this.config.violations.maxViolationsPerMinute) {
      threatLevel += 30;
      threats.push('excessive-violations');
    }

    // Log threat assessment
    if (threatLevel > 0) {
      SecurityLogger.threat('CSP violation threat analysis', {
        threatLevel,
        threats,
        directive: violation['violated-directive'],
        blockedUri: violation['blocked-uri'],
        clientIP: violation.clientIP,
        violationCount: recentViolations.length
      });

      // Alert on high threat level
      if (threatLevel >= this.config.violations.alertThreshold) {
        SecurityLogger.attack('High-risk CSP violation detected', {
          threatLevel,
          threats,
          violation,
          recommendedAction: 'immediate-investigation'
        });
      }
    }
  }

  /**
   * Get recent violations from an IP
   */
  private getRecentViolations(clientIP: string, timeWindowMs: number): CSPViolationReport[] {
    const cutoff = Date.now() - timeWindowMs;
    const recentViolations: CSPViolationReport[] = [];

    for (const [key, reports] of this.violations.entries()) {
      if (key.startsWith(clientIP + ':')) {
        for (const report of reports) {
          if (report.timestamp > cutoff) {
            recentViolations.push(report);
          }
        }
      }
    }

    return recentViolations;
  }

  /**
   * Validate content against CSP rules
   */
  validateContent(content: string, contentType: 'script' | 'style' | 'html'): {
    valid: boolean;
    violations: string[];
    sanitizedContent?: string;
  } {
    const violations: string[] = [];
    const valid = true;

    switch (contentType) {
      case 'script':
        return this.validateScript(content);
      case 'style':
        return this.validateStyle(content);
      case 'html':
        return this.validateHTML(content);
      default:
        return { valid: false, violations: ['unknown-content-type'] };
    }
  }

  /**
   * Validate JavaScript content
   */
  private validateScript(script: string): { valid: boolean; violations: string[]; sanitizedContent?: string } {
    const violations: string[] = [];
    let valid = true;

    // Check for dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(\s*['"`][^'"`]*['"`]/gi,
      /setInterval\s*\(\s*['"`][^'"`]*['"`]/gi,
      /<script/gi,
      /javascript:/gi,
      /document\.write/gi,
      /document\.writeln/gi,
      /innerHTML\s*=/gi,
      /outerHTML\s*=/gi,
      /insertAdjacentHTML/gi,
      /execScript/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(script)) {
        violations.push(`dangerous-pattern-${pattern.source.substring(0, 20)}`);
        valid = false;
      }
    }

    // Check for inline event handlers
    const inlineEventPattern = /on\w+\s*=/gi;
    if (inlineEventPattern.test(script)) {
      violations.push('inline-event-handlers');
      valid = false;
    }

    // Basic sanitization (remove dangerous patterns)
    let sanitizedContent = script;
    if (!valid && violations.length > 0) {
      for (const pattern of dangerousPatterns) {
        sanitizedContent = sanitizedContent.replace(pattern, '/* REMOVED_BY_CSP */');
      }
    }

    return { valid, violations, sanitizedContent };
  }

  /**
   * Validate CSS content
   */
  private validateStyle(style: string): { valid: boolean; violations: string[]; sanitizedContent?: string } {
    const violations: string[] = [];
    let valid = true;

    // Check for dangerous CSS patterns
    const dangerousPatterns = [
      /javascript:/gi,
      /expression\s*\(/gi,
      /behavior\s*:/gi,
      /-moz-binding/gi,
      /xss:/gi,
      /data:.*script/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(style)) {
        violations.push(`dangerous-css-pattern-${pattern.source.substring(0, 20)}`);
        valid = false;
      }
    }

    // Check for @import from external sources
    const importPattern = /@import\s+(?:url\s*\()?['"`]?(?!https?:\/\/localhost|https?:\/\/127\.0\.0\.1|\/)/gi;
    if (importPattern.test(style)) {
      violations.push('external-css-import');
      valid = false;
    }

    // Basic sanitization
    let sanitizedContent = style;
    if (!valid) {
      for (const pattern of dangerousPatterns) {
        sanitizedContent = sanitizedContent.replace(pattern, '/* REMOVED_BY_CSP */');
      }
    }

    return { valid, violations, sanitizedContent };
  }

  /**
   * Validate HTML content
   */
  private validateHTML(html: string): { valid: boolean; violations: string[]; sanitizedContent?: string } {
    const violations: string[] = [];
    let valid = true;

    // Check for dangerous HTML patterns
    const dangerousPatterns = [
      /<script[^>]*>/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<form[^>]*action\s*=\s*['"`](?!\/|#)/gi,
      /on\w+\s*=/gi, // Inline event handlers
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(html)) {
        violations.push(`dangerous-html-pattern-${pattern.source.substring(0, 20)}`);
        valid = false;
      }
    }

    // Check for meta refresh redirects
    const metaRefreshPattern = /<meta[^>]*http-equiv\s*=\s*['"`]refresh['"`][^>]*>/gi;
    if (metaRefreshPattern.test(html)) {
      violations.push('meta-refresh-redirect');
      valid = false;
    }

    // Basic sanitization
    let sanitizedContent = html;
    if (!valid) {
      // Remove script tags entirely
      sanitizedContent = sanitizedContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      // Remove inline event handlers
      sanitizedContent = sanitizedContent.replace(/\son\w+\s*=\s*['"`][^'"`]*['"`]/gi, '');
      
      // Remove javascript: protocols
      sanitizedContent = sanitizedContent.replace(/javascript:/gi, '#');
    }

    return { valid, violations, sanitizedContent };
  }

  /**
   * Get CSP statistics and metrics
   */
  getStats(): CSPStats {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    let violationsLastHour = 0;
    let violationsLastDay = 0;
    const directiveCounts = new Map<string, number>();
    const sourceCounts = new Map<string, number>();

    for (const reports of this.violations.values()) {
      for (const report of reports) {
        if (now - report.timestamp < oneHour) {
          violationsLastHour++;
        }
        if (now - report.timestamp < oneDay) {
          violationsLastDay++;
        }

        // Count directive violations
        const directive = report['violated-directive'];
        directiveCounts.set(directive, (directiveCounts.get(directive) || 0) + 1);

        // Count blocked sources
        const source = report['blocked-uri'];
        sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
      }
    }

    const topViolatedDirectives = Array.from(directiveCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([directive, count]) => ({ directive, count }));

    const topBlockedSources = Array.from(sourceCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    const suspiciousActivity = violationsLastHour > this.config.violations.alertThreshold;

    return {
      violationsLastHour,
      violationsLastDay,
      topViolatedDirectives,
      topBlockedSources,
      suspiciousActivity,
      currentNonce: this.currentNonce || undefined
    };
  }

  /**
   * Update CSP configuration
   */
  updateConfig(newConfig: Partial<CSPConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    SecurityLogger.security('CSP configuration updated', {
      enforceMode: this.config.enforceMode,
      changedDirectives: Object.keys(newConfig.directives || {})
    });
  }

  /**
   * Add allowed source to directive
   */
  allowSource(directive: keyof CSPDirectives, source: string): void {
    if (this.config.directives[directive] && Array.isArray(this.config.directives[directive])) {
      const sources = this.config.directives[directive] as string[];
      if (!sources.includes(source)) {
        sources.push(source);
        
        SecurityLogger.security('Source added to CSP directive', {
          directive,
          source,
          totalSources: sources.length
        });
      }
    }
  }

  /**
   * Remove source from directive
   */
  removeSource(directive: keyof CSPDirectives, source: string): void {
    if (this.config.directives[directive] && Array.isArray(this.config.directives[directive])) {
      const sources = this.config.directives[directive] as string[];
      const index = sources.indexOf(source);
      if (index > -1) {
        sources.splice(index, 1);
        
        SecurityLogger.security('Source removed from CSP directive', {
          directive,
          source,
          totalSources: sources.length
        });
      }
    }
  }

  /**
   * Start cleanup timer for old violation reports
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldViolations();
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Clean up old violation reports
   */
  private cleanupOldViolations(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    let cleanedCount = 0;

    for (const [key, reports] of this.violations.entries()) {
      const filteredReports = reports.filter(report => report.timestamp > cutoff);
      
      if (filteredReports.length === 0) {
        this.violations.delete(key);
        cleanedCount++;
      } else if (filteredReports.length < reports.length) {
        this.violations.set(key, filteredReports);
        cleanedCount += reports.length - filteredReports.length;
      }
    }

    SecurityLogger.info('CSP violation cleanup completed', {
      cleanedReports: cleanedCount,
      remainingKeys: this.violations.size
    });
  }

  /**
   * Destroy CSP manager and cleanup resources
   */
  destroy(): void {
    if (this.nonceTimer) {
      clearInterval(this.nonceTimer);
      this.nonceTimer = null;
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.violations.clear();
    
    SecurityLogger.security('ContentSecurityPolicy destroyed');
  }
}

export default ContentSecurityPolicy;