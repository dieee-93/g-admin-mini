/**
 * G-Admin Mini - Unified Logging System
 *
 * FEATURES:
 * - Module-based logging with categories
 * - Performance monitoring with thresholds
 * - Development-only (tree-shaken in production)
 * - Configurable log levels
 * - Color-coded console output
 *
 * USAGE:
 * ```typescript
 * import { logger } from '@/lib/logging/Logger';
 *
 * logger.debug('NavigationContext', 'Module filtering started');
 * logger.performance('NavigationContext', 'Module filtering', 15.3);
 * logger.error('EventBus', 'Failed to emit event', error);
 * ```
 */

// ============================================
// TYPES
// ============================================


export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'performance';

export type LogModule =
  // Core Systems
  | 'NavigationContext'
  | 'AuthContext'
  | 'EventBus'
  | 'OfflineSync'
  | 'WebSocket'
  | 'CapabilitySystem'
  // Stores
  | 'MaterialsStore'
  | 'SalesStore'
  | 'StaffStore'
  | 'CapabilityStore'
  // UI Components
  | 'Layout'
  | 'Modal'
  | 'Form'
  // Performance
  | 'Performance'
  | 'LazyLoading'
  // Network
  | 'API'
  | 'Supabase'
  // Generic
  | 'App';

interface LogConfig {
  enabled: boolean;
  level: LogLevel;
  modules: Set<LogModule> | 'all';
  performanceThreshold: number; // ms
  includeTimestamp: boolean;
  includeStackTrace: boolean;
}

// ============================================
// CONFIGURATION
// ============================================

const DEFAULT_CONFIG: LogConfig = {
  enabled: process.env.NODE_ENV === 'development',
  level: 'debug',
  modules: 'all', // Log all modules, or use Set(['NavigationContext', 'EventBus'])
  performanceThreshold: 10, // Only log if operation takes > 10ms
  includeTimestamp: true,
  includeStackTrace: false,
};

let config: LogConfig = { ...DEFAULT_CONFIG };

// ============================================
// EMOJI MAPPING
// ============================================

const EMOJI_MAP: Record<LogLevel, string> = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  performance: '⚡',
};

// Module-specific emojis for better visual identification
const MODULE_EMOJI_MAP: Partial<Record<LogModule, string>> = {
  NavigationContext: '🧭',
  AuthContext: '🔐',
  EventBus: '📡',
  OfflineSync: '📴',
  WebSocket: '🔌',
  CapabilitySystem: '🎯',
  Performance: '⚡',
  API: '🌐',
  Supabase: '🗄️',
};

// ============================================
// COLOR UTILITIES
// ============================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Text colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: colors.gray,
  info: colors.blue,
  warn: colors.yellow,
  error: colors.red,
  performance: colors.magenta,
};

// ============================================
// CORE LOGGER
// ============================================

class Logger {
  private config: LogConfig;

  constructor(initialConfig?: Partial<LogConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...initialConfig };
  }

  /**
   * Configure logger settings
   */
  configure(newConfig: Partial<LogConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): LogConfig {
    return { ...this.config };
  }

  /**
   * Check if logging is enabled for a specific module
   */
  private isEnabled(module: LogModule, level: LogLevel): boolean {
    if (!this.config.enabled) return false;

    // Check if module is allowed
    if (this.config.modules !== 'all' && !this.config.modules.has(module)) {
      return false;
    }

    // Check log level hierarchy
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'performance'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Format message with timestamp and styling
   */
  private formatMessage(
    level: LogLevel,
    module: LogModule,
    message: string
  ): string {
    const parts: string[] = [];

    // Timestamp
    if (this.config.includeTimestamp) {
      const timestamp = new Date().toLocaleTimeString('es-AR', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
      });
      parts.push(`${colors.gray}${timestamp}${colors.reset}`);
    }

    // Level with emoji
    const levelEmoji = EMOJI_MAP[level];
    const levelColor = LEVEL_COLORS[level];
    parts.push(`${levelColor}${levelEmoji} [${level.toUpperCase()}]${colors.reset}`);

    // Module with emoji (if available)
    const moduleEmoji = MODULE_EMOJI_MAP[module] || '📦';
    parts.push(`${colors.cyan}${moduleEmoji} [${module}]${colors.reset}`);

    // Message
    parts.push(message);

    return parts.join(' ');
  }

  /**
   * Debug level - Detailed information for debugging
   */
  debug(module: LogModule, message: string, data?: any): void {
    if (!this.isEnabled(module, 'debug')) return;

    const formatted = this.formatMessage('debug', module, message);

    if (data !== undefined) {
      console.log(formatted, data);
    } else {
      console.log(formatted);
    }
  }

  /**
   * Info level - General informational messages
   */
  info(module: LogModule, message: string, data?: any): void {
    if (!this.isEnabled(module, 'info')) return;

    const formatted = this.formatMessage('info', module, message);

    if (data !== undefined) {
      console.log(formatted, data);
    } else {
      console.log(formatted);
    }
  }

  /**
   * Warn level - Warning messages for potential issues
   */
  warn(module: LogModule, message: string, data?: any): void {
    if (!this.isEnabled(module, 'warn')) return;

    const formatted = this.formatMessage('warn', module, message);

    if (data !== undefined) {
      console.warn(formatted, data);
    } else {
      console.warn(formatted);
    }
  }

  /**
   * Error level - Error messages
   */
  error(module: LogModule, message: string, error?: Error | any): void {
    if (!this.isEnabled(module, 'error')) return;

    const formatted = this.formatMessage('error', module, message);

    if (error !== undefined) {
      console.error(formatted, error);

      // Include stack trace if configured
      if (this.config.includeStackTrace && error instanceof Error && error.stack) {
        console.error(`${colors.gray}Stack trace:${colors.reset}\n${error.stack}`);
      }
    } else {
      console.error(formatted);
    }
  }

  /**
   * Performance level - Performance monitoring with threshold
   */
  performance(
    module: LogModule,
    operation: string,
    timeMs: number,
    threshold?: number
  ): void {
    const actualThreshold = threshold ?? this.config.performanceThreshold;

    if (!this.isEnabled(module, 'performance')) return;
    if (timeMs < actualThreshold) return; // Only log if exceeds threshold

    const formatted = this.formatMessage(
      'performance',
      module,
      `${operation} took ${timeMs.toFixed(2)}ms (threshold: ${actualThreshold}ms)`
    );

    // Use warn if significantly over threshold
    if (timeMs > actualThreshold * 2) {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  /**
   * Measure performance of a function
   */
  async measure<T>(
    module: LogModule,
    operation: string,
    fn: () => T | Promise<T>,
    threshold?: number
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.performance(module, operation, duration, threshold);

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.error(module, `${operation} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  /**
   * Group related logs together
   */
  group(label: string, collapsed: boolean = false): void {
    if (!this.config.enabled) return;

    if (collapsed) {
      console.groupCollapsed(label);
    } else {
      console.group(label);
    }
  }

  /**
   * End a log group
   */
  groupEnd(): void {
    if (!this.config.enabled) return;
    console.groupEnd();
  }

  /**
   * Clear console
   */
  clear(): void {
    if (!this.config.enabled) return;
    console.clear();
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const logger = new Logger();

// ============================================
// CONVENIENCE EXPORTS
// ============================================

export default logger;

// Export for direct access if needed
export { Logger };

// ============================================
// GLOBAL LOGGER ACCESS (Development only)
// ============================================

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__GADMIN_LOGGER__ = logger;
  console.log('%c🚀 G-Admin Logger initialized', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
  console.log('%cAccess via: window.__GADMIN_LOGGER__', 'color: #2196F3; font-style: italic;');
  console.warn('%cConfigure: __GADMIN_LOGGER__.configure({ modules: new Set([\'EventBus\']), level: \'warn\' })', 'color: #FF9800; font-size: 11px;');
}
