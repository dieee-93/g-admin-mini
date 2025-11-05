/**
 * G-Admin Mini - Console Helper for Chrome DevTools Debugging
 *
 * PROBLEM SOLVED:
 * - Chrome DevTools MCP returns 123K tokens (exceeds 25K limit)
 * - list_console_messages fails with token overflow
 *
 * SOLUTION:
 * - Captures logs in memory with intelligent filtering
 * - Provides paginated, filtered access for AI debugging
 * - Reduces 123K tokens to <1K with targeted queries
 *
 * USAGE WITH CHROME DEVTOOLS MCP:
 * ```javascript
 * // Instead of: list_console_messages (123K tokens ❌)
 *
 * // Get last 10 errors (~500 tokens ✅)
 * evaluate_script({
 *   function: "() => window.__CONSOLE_HELPER__.getErrors(10)"
 * })
 *
 * // Search in Materials module (~800 tokens ✅)
 * evaluate_script({
 *   function: "() => window.__CONSOLE_HELPER__.getByModule('Materials', 15)"
 * })
 *
 * // Export for AI analysis (~600 tokens ✅)
 * evaluate_script({
 *   function: "() => window.__CONSOLE_HELPER__.exportForAI({ level: 'error' })"
 * })
 * ```
 */

import { logger, type LogModule } from './Logger';

// ============================================
// TYPES
// ============================================

export interface ConsoleFilterOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  module?: string;
  domain?: string;
  search?: string;
  limit?: number;
  since?: number; // timestamp in ms
}

interface CapturedLog {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  module: string;
  domain: string;
  message: string;
  data?: any;
  stack?: string;
}

interface LogStats {
  total: number;
  last60s: number;
  byLevel: Record<string, number>;
  byModule: Record<string, number>;
  byDomain: Record<string, number>;
  longMessages: number;
  withData: number;
  avgMessageLength: number;
}

// ============================================
// CONSOLE HELPER CLASS
// ============================================

export class ConsoleHelper {
  private static logs: CapturedLog[] = [];
  private static MAX_LOGS = 1000; // Keep last 1000 logs
  private static startTime = Date.now();
  private static interceptorInstalled = false;

  // Debounce cache to prevent duplicate logs
  private static debounceCache = new Map<string, number>();
  private static DEBOUNCE_TIME = 500; // ms

  /**
   * Initialize console interceptor (dev only)
   */
  static init() {
    if (process.env.NODE_ENV !== 'development') {
      console.log('⚠️ ConsoleHelper only runs in development mode');
      return;
    }

    if (this.interceptorInstalled) {
      console.warn('⚠️ ConsoleHelper already initialized');
      return;
    }

    // Store original console methods
    const original = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
    };

    // Wrap console methods
    const createWrapper = (level: 'debug' | 'info' | 'warn' | 'error') => {
      return function (this: Console, ...args: any[]) {
        // Capture before calling original
        ConsoleHelper.capture(level, args);

        // Call original console method
        const originalMethod = level === 'debug' ? original.log : original[level];
        return originalMethod.apply(this, args);
      };
    };

    console.log = createWrapper('debug');
    console.info = createWrapper('info');
    console.warn = createWrapper('warn');
    console.error = createWrapper('error');
    console.debug = createWrapper('debug');

    this.interceptorInstalled = true;

    logger.info('App', '🎧 Console Helper initialized - logs will be captured for debugging');
  }

  /**
   * Capture log entry
   */
  private static capture(level: 'debug' | 'info' | 'warn' | 'error', args: any[]) {
    if (this.logs.length >= this.MAX_LOGS) {
      // Remove oldest 100 logs to make room
      this.logs.splice(0, 100);
    }

    const firstArg = args[0];
    let module = 'unknown';
    let domain = 'generic';
    let message = '';
    let data: any = undefined;
    let stack: string | undefined;

    // Parse formatted logger messages
    if (typeof firstArg === 'string') {
      message = firstArg;

      // Try multiple patterns to extract module information

      // Pattern 1: Full G-Admin logger format
      // "HH:MM:SS.mmm 🔍 [DEBUG] 🧭 [NavigationContext] Message"
      let loggerMatch = message.match(/\[([A-Z]+)\].*\[([^\]]+)\]\s*(.+)/);

      // Pattern 2: Module only format
      // "[NavigationContext] Message" or "🧭 [NavigationContext] Message"
      if (!loggerMatch) {
        loggerMatch = message.match(/\[([^\]]+)\]\s*(.+)/);
        if (loggerMatch) {
          module = loggerMatch[1];
          message = loggerMatch[2];
        }
      } else {
        module = loggerMatch[2];
        message = loggerMatch[3];
      }

      // Pattern 3: Detect module from common prefixes
      if (module === 'unknown' && message) {
        if (message.startsWith('[SW]')) {
          module = 'ServiceWorker';
          message = message.replace('[SW]', '').trim();
        } else if (message.startsWith('[Security]')) {
          module = 'Security';
          message = message.replace('[Security]', '').trim();
        } else if (message.includes('Module setup:')) {
          module = 'ModuleBootstrap';
        }
      }

      // Detect domain from module name (only if we found a module)
      if (module !== 'unknown') {
        if (module.includes('Store')) domain = 'Stores';
        else if (module.includes('Context')) domain = 'Core';
        else if (module.includes('API') || module.includes('Supabase')) domain = 'Network';
        else if (module.includes('EventBus')) domain = 'EventBus';
        else if (module.includes('Performance') || module.includes('LazyLoading')) domain = 'Performance';
        else if (module.includes('Service') || module.includes('Worker')) domain = 'Infrastructure';
        else if (module.includes('Security')) domain = 'Security';
        else domain = 'Business';
      }

      // Check for error stack traces
      if (args.length > 1) {
        const secondArg = args[1];
        if (secondArg instanceof Error) {
          stack = secondArg.stack;
          data = { error: secondArg.message, name: secondArg.name };
        } else if (typeof secondArg === 'object') {
          // Truncate large objects
          try {
            const str = JSON.stringify(secondArg);
            data = str.length > 500 ? str.substring(0, 500) + '...[TRUNCATED]' : secondArg;
          } catch {
            data = '[Complex Object]';
          }
        } else {
          data = secondArg;
        }
      }
    } else {
      // Non-string first argument
      try {
        message = JSON.stringify(firstArg).substring(0, 200);
      } catch {
        message = '[Complex Object]';
      }
    }

    // Debounce duplicate messages
    const key = `${module}:${message.substring(0, 50)}`;
    const lastLog = this.debounceCache.get(key);
    const now = Date.now();

    if (lastLog && (now - lastLog) < this.DEBOUNCE_TIME) {
      return; // Skip duplicate within debounce window
    }

    this.debounceCache.set(key, now);

    // Clean old debounce entries (keep last 200)
    if (this.debounceCache.size > 200) {
      const cutoff = now - this.DEBOUNCE_TIME * 2;
      for (const [k, v] of this.debounceCache.entries()) {
        if (v < cutoff) this.debounceCache.delete(k);
      }
    }

    // Store captured log
    this.logs.push({
      timestamp: now,
      level,
      module,
      domain,
      message: message.substring(0, 500), // Truncate very long messages
      data,
      stack,
    });
  }

  /**
   * Get filtered logs
   */
  static getFiltered(options: ConsoleFilterOptions = {}): CapturedLog[] {
    const {
      level,
      module,
      domain,
      search,
      limit = 50,
      since = Date.now() - 60000, // Last 60 seconds by default
    } = options;

    let filtered = this.logs.filter((log) => log.timestamp >= since);

    if (level) {
      filtered = filtered.filter((log) => log.level === level);
    }

    if (module) {
      const moduleLower = module.toLowerCase();
      filtered = filtered.filter((log) => log.module.toLowerCase().includes(moduleLower));
    }

    if (domain) {
      filtered = filtered.filter((log) => log.domain === domain);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((log) => log.message.toLowerCase().includes(searchLower));
    }

    return filtered.slice(-limit); // Return last N entries
  }

  /**
   * Get errors only (last N errors)
   */
  static getErrors(limit = 10): CapturedLog[] {
    return this.getFiltered({ level: 'error', limit });
  }

  /**
   * Get warnings only
   */
  static getWarnings(limit = 10): CapturedLog[] {
    return this.getFiltered({ level: 'warn', limit });
  }

  /**
   * Get logs for specific module
   */
  static getByModule(module: string, limit = 20): CapturedLog[] {
    return this.getFiltered({ module, limit });
  }

  /**
   * Get logs by domain
   */
  static getByDomain(domain: string, limit = 20): CapturedLog[] {
    return this.getFiltered({ domain, limit });
  }

  /**
   * Get recent logs (last N seconds)
   */
  static getRecent(seconds = 10, limit = 50): CapturedLog[] {
    return this.getFiltered({
      since: Date.now() - seconds * 1000,
      limit,
    });
  }

  /**
   * Search logs by text
   */
  static search(query: string, limit = 30): CapturedLog[] {
    return this.getFiltered({ search: query, limit });
  }

  /**
   * Export logs for AI analysis (optimized format)
   * Reduces token usage by 90%+
   */
  static exportForAI(options: ConsoleFilterOptions = {}): Array<{
    time: string;
    lvl: string;
    mod: string;
    dom: string;
    msg: string;
    data?: string;
  }> {
    const logs = this.getFiltered(options);

    return logs.map((log) => ({
      time: new Date(log.timestamp).toISOString().split('T')[1].substring(0, 12), // HH:MM:SS.mmm
      lvl: log.level[0].toUpperCase(), // D/I/W/E
      mod: log.module.substring(0, 15), // Truncate module name
      dom: log.domain.substring(0, 10), // Truncate domain
      msg: log.message.substring(0, 100), // Truncate message
      data: log.data ? JSON.stringify(log.data).substring(0, 150) : undefined,
    }));
  }

  /**
   * Get statistics about captured logs
   */
  static getStats(): LogStats {
    const now = Date.now();
    const last60s = this.logs.filter((l) => l.timestamp >= now - 60000);

    const byLevel: Record<string, number> = { debug: 0, info: 0, warn: 0, error: 0 };
    const byModule: Record<string, number> = {};
    const byDomain: Record<string, number> = {};
    let totalMessageLength = 0;
    let longMessages = 0;
    let withData = 0;

    last60s.forEach((log) => {
      byLevel[log.level]++;
      byModule[log.module] = (byModule[log.module] || 0) + 1;
      byDomain[log.domain] = (byDomain[log.domain] || 0) + 1;
      totalMessageLength += log.message.length;
      if (log.message.length > 200) longMessages++;
      if (log.data !== undefined) withData++;
    });

    return {
      total: this.logs.length,
      last60s: last60s.length,
      byLevel,
      byModule,
      byDomain,
      longMessages,
      withData,
      avgMessageLength: last60s.length > 0 ? Math.round(totalMessageLength / last60s.length) : 0,
    };
  }

  /**
   * Get top modules by log count
   */
  static getTopModules(count = 5): Array<{ module: string; count: number; domain: string }> {
    const now = Date.now();
    const last60s = this.logs.filter((l) => l.timestamp >= now - 60000);

    const counts = new Map<string, { count: number; domain: string }>();
    last60s.forEach((log) => {
      const existing = counts.get(log.module) || { count: 0, domain: log.domain };
      counts.set(log.module, { count: existing.count + 1, domain: log.domain });
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, count)
      .map(([module, { count, domain }]) => ({ module, count, domain }));
  }

  /**
   * Clear captured logs
   */
  static clear(): void {
    this.logs = [];
    this.debounceCache.clear();
    logger.info('App', '🧹 Console logs cleared');
  }

  /**
   * Export full logs (for manual analysis, use sparingly)
   */
  static exportFull(limit = 100): CapturedLog[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get interceptor status
   */
  static isActive(): boolean {
    return this.interceptorInstalled;
  }

  /**
   * Get summary report (minimal tokens)
   */
  static getSummary(): {
    active: boolean;
    total: number;
    errors: number;
    warnings: number;
    topModule: string;
    uptime: string;
  } {
    const stats = this.getStats();
    const topModules = this.getTopModules(1);
    const uptime = Math.round((Date.now() - this.startTime) / 1000);

    return {
      active: this.interceptorInstalled,
      total: stats.total,
      errors: stats.byLevel.error || 0,
      warnings: stats.byLevel.warn || 0,
      topModule: topModules[0]?.module || 'none',
      uptime: `${uptime}s`,
    };
  }
}

// ============================================
// GLOBAL WINDOW ACCESS (Development only)
// ============================================

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__CONSOLE_HELPER__ = ConsoleHelper;
  console.log(
    '%c🎧 Console Helper Available',
    'color: #2196F3; font-weight: bold; font-size: 14px; background: #E3F2FD; padding: 4px 8px; border-radius: 4px;'
  );
  console.log('%c📖 Quick Reference:', 'color: #666; font-weight: bold; margin-top: 8px;');
  console.log('%c  __CONSOLE_HELPER__.getErrors(10)', 'color: #F44336; font-family: monospace;');
  console.log('%c  __CONSOLE_HELPER__.getByModule("Materials", 15)', 'color: #4CAF50; font-family: monospace;');
  console.log('%c  __CONSOLE_HELPER__.search("error")', 'color: #FF9800; font-family: monospace;');
  console.log('%c  __CONSOLE_HELPER__.exportForAI({ level: "error" })', 'color: #9C27B0; font-family: monospace;');
  console.log('%c  __CONSOLE_HELPER__.getStats()', 'color: #00BCD4; font-family: monospace;');
}

// ============================================
// EXPORTS
// ============================================

export default ConsoleHelper;
