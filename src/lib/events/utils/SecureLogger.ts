// SecureLogger.ts - Enterprise-grade secure logging system
// Prevents sensitive data exposure while maintaining debugging capabilities

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = 'EventBus' | 'Module' | 'Deduplication' | 'Storage' | 'Security';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: LogContext;
  message: string;
  data?: any;
  sanitized?: boolean;
}

interface SecureLoggerConfig {
  enableInProduction: boolean;
  maxPayloadSize: number;
  sensitiveFields: string[];
  truncateThreshold: number;
  enableFileLogging: boolean;
  logLevel: LogLevel;
}

const DEFAULT_CONFIG: SecureLoggerConfig = {
  enableInProduction: false,
  maxPayloadSize: 1024, // 1KB max for logged payloads
  sensitiveFields: [
    'password', 'token', 'jwt', 'auth', 'authorization', 'secret',
    'creditCard', 'cardNumber', 'cvv', 'ssn', 'tin', 'ein',
    'email', 'phone', 'phoneNumber', 'address', 'personalInfo',
    'apiKey', 'privateKey', 'sessionId', 'refreshToken',
    'bankAccount', 'iban', 'swift', 'paymentInfo'
  ],
  truncateThreshold: 500,
  enableFileLogging: false,
  logLevel: 'info'
};

export class SecureLogger {
  private static config: SecureLoggerConfig = DEFAULT_CONFIG;
  private static logHistory: LogEntry[] = [];
  private static readonly MAX_HISTORY = 1000;

  /**
   * Configure the secure logger
   */
  static configure(config: Partial<SecureLoggerConfig>): void {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Debug level logging - only in development
   */
  static debug(context: LogContext, message: string, data?: any): void {
    this.log('debug', context, message, data);
  }

  /**
   * Info level logging
   */
  static info(context: LogContext, message: string, data?: any): void {
    this.log('info', context, message, data);
  }

  /**
   * Warning level logging
   */
  static warn(context: LogContext, message: string, data?: any): void {
    this.log('warn', context, message, data);
  }

  /**
   * Error level logging - always enabled
   */
  static error(context: LogContext, message: string, data?: any): void {
    this.log('error', context, message, data);
  }

  /**
   * Security-specific logging for threats and anomalies
   */
  static security(message: string, data?: any): void {
    this.log('error', 'Security', `[SECURITY] ${message}`, data);
  }

  /**
   * Core logging method with security sanitization
   */
  private static log(level: LogLevel, context: LogContext, message: string, data?: any): void {
    // Check if logging is enabled
    if (!this.shouldLog(level)) return;

    // Sanitize data before logging
    const sanitizedData = data !== undefined ? this.sanitizeObject(data) : undefined;
    
    // Create log entry
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data: sanitizedData,
      sanitized: data !== undefined
    };

    // Add to history (for debugging and monitoring)
    this.addToHistory(logEntry);

    // Output to console with proper formatting
    this.outputToConsole(logEntry);
  }

  /**
   * Determine if logging should occur based on environment and level
   */
  private static shouldLog(level: LogLevel): boolean {
    // Always log errors and security events
    if (level === 'error') return true;

    // Check environment
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && !this.config.enableInProduction) return false;

    // Check log level hierarchy
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    
    return requestedLevelIndex >= currentLevelIndex;
  }

  /**
   * Sanitize sensitive data from payloads
   */
  public static sanitizeObject(data: any, visited = new WeakSet()): any {
    if (data === null || data === undefined) return data;

    // Handle primitive types
    if (typeof data !== 'object') {
      return this.sanitizeString(String(data));
    }

    // Handle circular references
    if (visited.has(data)) {
      return '[CIRCULAR_REFERENCE]';
    }
    visited.add(data);

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeObject(item, visited));
    }

    // Handle objects
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // For string values, check secret patterns first before field sensitivity
      if (typeof value === 'string') {
        const secretResult = this.sanitizeString(value);
        if (secretResult.includes('SECRET_PATTERN_DETECTED') || secretResult.includes('XSS_PATTERN_DETECTED')) {
          sanitized[key] = secretResult;
          continue;
        }
      }

      // Check if field is sensitive
      if (this.isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      // Recursively sanitize nested objects
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value, visited);
      } else {
        sanitized[key] = this.sanitizeString(String(value));
      }
    }

    return this.truncateIfNeeded(sanitized);
  }

  /**
   * Check if a field name indicates sensitive data
   */
  private static isSensitiveField(fieldName: string): boolean {
    const normalizedFieldName = fieldName.toLowerCase().replace(/_|-/g, '');

    return this.config.sensitiveFields.some(sensitiveField => {
      const normalizedSensitiveField = sensitiveField.toLowerCase().replace(/_|-/g, '');
      
      // For short sensitive fields (e.g., 'ssn', 'tin', 'cvv'), require an exact match
      // to avoid redacting fields like 'assistanTINg' or 'proceSSNumber'.
      if (normalizedSensitiveField.length <= 4) {
        return normalizedFieldName === normalizedSensitiveField;
      }
      
      // For longer fields, an `includes` check is safer and handles camelCase well.
      return normalizedFieldName.includes(normalizedSensitiveField);
    });
  }

  /**
   * Sanitize string values for XSS patterns and sensitive content
   */
  private static sanitizeString(value: string): string {
    if (value.length > this.config.truncateThreshold) {
      return value.substring(0, this.config.truncateThreshold) + '...[TRUNCATED]';
    }

    // Check for potential XSS patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /<iframe/i,
      /eval\(/i,
      /Function\(/i
    ];

    if (xssPatterns.some(pattern => pattern.test(value))) {
      return '[XSS_PATTERN_DETECTED]';
    }

    // Check for potential secrets (basic patterns)
    const secretPatterns = [
      /sk_(test_|live_)?[a-zA-Z0-9_]{20,}/, // Stripe secret keys (test/live)
      /pk_(test_|live_)?[a-zA-Z0-9_]{20,}/, // Stripe public keys (test/live)
      /^[A-Za-z0-9+/]{40,}={0,2}$/, // Base64 encoded secrets
      /^[a-f0-9]{32,}$/i, // Hex encoded secrets
      /bearer\s+[a-zA-Z0-9._-]+/i, // Bearer tokens
    ];

    if (secretPatterns.some(pattern => pattern.test(value))) {
      return '[SECRET_PATTERN_DETECTED]';
    }

    return value;
  }

  /**
   * Truncate data if it exceeds size limits
   */
  private static truncateIfNeeded(data: any): any {
    try {
      const serialized = JSON.stringify(data);
      const dataSize = serialized.length;
      
      if (dataSize > this.config.maxPayloadSize) {
        return {
          __truncated: true,
          __originalSize: dataSize,
          __preview: serialized.substring(0, 200) + '...'
        };
      }

      return data;
    } catch (error) {
      // Handle JSON serialization errors (e.g., circular references already handled above)
      return {
        __truncated: true,
        __originalSize: 0,
        __preview: '[SERIALIZATION_ERROR]',
        __error: error.message
      };
    }
  }

  /**
   * Add log entry to internal history for debugging
   */
  private static addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    
    // Maintain history size limit
    if (this.logHistory.length > this.MAX_HISTORY) {
      this.logHistory.shift();
    }
  }

  /**
   * Output formatted log to console
   */
  private static outputToConsole(entry: LogEntry): void {
    const emoji = this.getLevelEmoji(entry.level);
    const prefix = `${emoji} [${entry.context}]`;
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    const consoleMethod = entry.level === 'debug' ? 'log' : entry.level;
    const method = console[consoleMethod as keyof Console] as Function;
    
    if (entry.data) {
      method(`${prefix} ${entry.message} (${timestamp})`, entry.data);
    } else {
      method(`${prefix} ${entry.message} (${timestamp})`);
    }
  }

  /**
   * Get emoji for log level
   */
  private static getLevelEmoji(level: LogLevel): string {
    const emojis = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };
    return emojis[level];
  }

  /**
   * Get recent log history for debugging
   */
  static getHistory(count = 100): LogEntry[] {
    return this.logHistory.slice(-count);
  }

  /**
   * Clear log history
   */
  static clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Export logs for analysis (sanitized)
   */
  static exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * Security event detection and alerting
   */
  static detectAnomalies(): {
    errorRate: number;
    suspiciousPatterns: number;
    recentSecurityEvents: LogEntry[];
  } {
    const recentLogs = this.getHistory(100);
    const errors = recentLogs.filter(log => log.level === 'error').length;
    const securityEvents = recentLogs.filter(log => log.context === 'Security');
    
    // Count suspicious patterns
    const suspiciousPatterns = recentLogs.filter(log => 
      log.data && JSON.stringify(log.data).includes('[XSS_PATTERN_DETECTED]')
    ).length;

    return {
      errorRate: errors / recentLogs.length,
      suspiciousPatterns,
      recentSecurityEvents: securityEvents
    };
  }
}

// Export pre-configured instances for common contexts
export const EventBusLogger = {
  debug: (msg: string, data?: any) => SecureLogger.debug('EventBus', msg, data),
  info: (msg: string, data?: any) => SecureLogger.info('EventBus', msg, data),
  warn: (msg: string, data?: any) => SecureLogger.warn('EventBus', msg, data),
  error: (msg: string, data?: any) => SecureLogger.error('EventBus', msg, data),
};

export const ModuleLogger = {
  debug: (msg: string, data?: any) => SecureLogger.debug('Module', msg, data),
  info: (msg: string, data?: any) => SecureLogger.info('Module', msg, data),
  warn: (msg: string, data?: any) => SecureLogger.warn('Module', msg, data),
  error: (msg: string, data?: any) => SecureLogger.error('Module', msg, data),
};

export const SecurityLogger = {
  security: (msg: string, data?: any) => SecureLogger.security(msg, data),
  threat: (msg: string, data?: any) => SecureLogger.security(`THREAT: ${msg}`, data),
  anomaly: (msg: string, data?: any) => SecureLogger.security(`ANOMALY: ${msg}`, data),
  attack: (msg: string, data?: any) => SecureLogger.security(`ATTACK: ${msg}`, data),
  violation: (msg: string, data?: any) => SecureLogger.security(`VIOLATION: ${msg}`, data),
  info: (msg: string, data?: any) => SecureLogger.info('Security', msg, data),
};

export default SecureLogger;