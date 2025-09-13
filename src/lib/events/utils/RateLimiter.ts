// RateLimiter.ts - Advanced rate limiting and DDoS protection
// Multi-tier protection: IP-based, user-based, endpoint-based limits

import { SecurityLogger } from './SecureLogger';
import SecureRandomGenerator from './SecureRandomGenerator';

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  // Global limits
  globalRequestsPerMinute: number;
  globalBurstLimit: number;
  
  // Per-IP limits
  ipRequestsPerMinute: number;
  ipBurstLimit: number;
  
  // Per-user limits (authenticated users)
  userRequestsPerMinute: number;
  userBurstLimit: number;
  
  // Event pattern specific limits
  eventPatternLimits: Record<string, {
    requestsPerMinute: number;
    burstLimit: number;
  }>;
  
  // DDoS protection
  ddosDetectionThreshold: number;
  ddosBlockDurationMs: number;
  
  // Advanced features
  enableAdaptiveLimiting: boolean;
  enableGeographicBlocking: boolean;
  suspiciousPatternDetection: boolean;
  
  // Cleanup
  cleanupIntervalMs: number;
  recordExpirationMs: number;
}

/**
 * Rate limiting record for tracking requests
 */
interface RateLimitRecord {
  count: number;
  firstRequest: number;
  lastRequest: number;
  windowStart: number;
  blocked: boolean;
  blockUntil?: number;
  suspicionScore: number;
}

/**
 * DDoS attack pattern detection
 */
interface AttackPattern {
  rapid_fire: number;      // Rapid successive requests
  pattern_repetition: number; // Same pattern repeated
  burst_spikes: number;    // Sudden traffic spikes
  geographic_anomaly: number; // Unusual geographic distribution
}

/**
 * Rate limiting result
 */
export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number;
  remainingRequests: number;
  resetTime: number;
  blocked: boolean;
  suspicionScore: number;
}

/**
 * Advanced rate limiter with DDoS protection
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private globalRecords: Map<string, RateLimitRecord> = new Map();
  private ipRecords: Map<string, RateLimitRecord> = new Map();
  private userRecords: Map<string, RateLimitRecord> = new Map();
  private eventRecords: Map<string, RateLimitRecord> = new Map();
  private blockedIPs: Set<string> = new Set();
  private attackPatterns: Map<string, AttackPattern> = new Map();
  private cleanupTimer: number | null = null;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      // Default configuration
      globalRequestsPerMinute: 10000,
      globalBurstLimit: 1000,
      
      ipRequestsPerMinute: 100,
      ipBurstLimit: 20,
      
      userRequestsPerMinute: 1000,
      userBurstLimit: 100,
      
      eventPatternLimits: {
        'payment.*': { requestsPerMinute: 50, burstLimit: 10 },
        'auth.*': { requestsPerMinute: 20, burstLimit: 5 },
        'system.critical.*': { requestsPerMinute: 10, burstLimit: 3 },
        'sensitive.*': { requestsPerMinute: 30, burstLimit: 8 }
      },
      
      ddosDetectionThreshold: 500, // Requests per minute from single source
      ddosBlockDurationMs: 15 * 60 * 1000, // 15 minutes
      
      enableAdaptiveLimiting: true,
      enableGeographicBlocking: false,
      suspiciousPatternDetection: true,
      
      cleanupIntervalMs: 5 * 60 * 1000, // 5 minutes
      recordExpirationMs: 60 * 60 * 1000, // 1 hour
      
      ...config
    };

    // Ensure all numeric values are actually numbers, not strings
    this.config.globalRequestsPerMinute = Number(this.config.globalRequestsPerMinute);
    this.config.globalBurstLimit = Number(this.config.globalBurstLimit);
    this.config.ipRequestsPerMinute = Number(this.config.ipRequestsPerMinute);
    this.config.ipBurstLimit = Number(this.config.ipBurstLimit);
    this.config.userRequestsPerMinute = Number(this.config.userRequestsPerMinute);
    this.config.userBurstLimit = Number(this.config.userBurstLimit);
    this.config.ddosDetectionThreshold = Number(this.config.ddosDetectionThreshold);
    this.config.ddosBlockDurationMs = Number(this.config.ddosBlockDurationMs);
    this.config.cleanupIntervalMs = Number(this.config.cleanupIntervalMs);
    this.config.recordExpirationMs = Number(this.config.recordExpirationMs);

    // Ensure event pattern limits are also numbers
    Object.keys(this.config.eventPatternLimits || {}).forEach(pattern => {
      const limits = this.config.eventPatternLimits![pattern];
      limits.requestsPerMinute = Number(limits.requestsPerMinute);
      limits.burstLimit = Number(limits.burstLimit);
    });

    this.startCleanupTimer();
    
    
    SecurityLogger.security('RateLimiter initialized', {
      globalLimit: this.config.globalRequestsPerMinute,
      ipLimit: this.config.ipRequestsPerMinute,
      ddosProtection: this.config.ddosDetectionThreshold,
      adaptiveLimiting: this.config.enableAdaptiveLimiting
    });
  }

  /**
   * Check if request should be allowed
   */
  async checkLimit(
    eventPattern: string,
    clientIP: string,
    userId?: string,
    userAgent?: string,
    geographic?: { country: string; region: string }
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const requestId = SecureRandomGenerator.getInstance().generateGenericId('req');

    try {
      // Check if IP is blocked and handle automatic unblocking
      if (this.blockedIPs.has(clientIP)) {
        const ipRecord = this.ipRecords.get(clientIP);
        
        
        // Check if block duration has expired
        if (ipRecord?.blockUntil && now > ipRecord.blockUntil) {
          // Automatically unblock expired IP and reset its state
          this.blockedIPs.delete(clientIP);
          ipRecord.blocked = false;
          ipRecord.blockUntil = undefined;
          ipRecord.count = 0; // Reset count
          ipRecord.suspicionScore = 0; // Reset suspicion
          ipRecord.windowStart = now; // Reset window
          
          // Clear attack patterns
          this.attackPatterns.delete(clientIP);
          
          SecurityLogger.security('IP automatically unblocked after duration expired', { 
            ip: clientIP,
            blockDuration: this.config.ddosBlockDurationMs 
          });
        } else {
          // Still blocked
          SecurityLogger.threat('Request from blocked IP attempted', {
            ip: clientIP,
            eventPattern,
            requestId
          });
          
          return {
            allowed: false,
            reason: 'IP blocked due to DDoS protection',
            retryAfter: this.config.ddosBlockDurationMs / 1000,
            remainingRequests: 0,
            resetTime: now + this.config.ddosBlockDurationMs,
            blocked: true,
            suspicionScore: 100
          };
        }
      }

      
      // Update records first to ensure accurate counting
      this.updateRecords(clientIP, userId, eventPattern, now);

      // Perform multi-tier rate limiting checks AFTER updating records
      const globalCheck = this.checkGlobalLimit(now);
      if (!globalCheck.allowed) {
        // Revert the update since request will be blocked
        this.revertRecords(clientIP, userId, eventPattern, now);
        return globalCheck;
      }

      const ipCheck = this.checkIPLimit(clientIP, now);
      if (!ipCheck.allowed) {
        // Revert the update since request will be blocked
        this.revertRecords(clientIP, userId, eventPattern, now);
        return ipCheck;
      }

      const userCheck = userId ? this.checkUserLimit(userId, now) : { allowed: true };
      if (!userCheck.allowed) {
        // Revert the update since request will be blocked
        this.revertRecords(clientIP, userId, eventPattern, now);
        return userCheck;
      }

      const eventCheck = this.checkEventPatternLimit(eventPattern, now);
      if (!eventCheck.allowed) {
        // Revert the update since request will be blocked
        this.revertRecords(clientIP, userId, eventPattern, now);
        return eventCheck;
      }

      // DDoS detection
      const ddosCheck = this.checkDDoSPattern(clientIP, eventPattern, now, userAgent, geographic);
      if (!ddosCheck.allowed) {
        this.blockedIPs.add(clientIP);
        
        // Set blockUntil timestamp for automatic unblocking
        const ipRecord = this.ipRecords.get(clientIP);
        if (ipRecord) {
          ipRecord.blocked = true;
          ipRecord.blockUntil = now + this.config.ddosBlockDurationMs;
        }
        
        // Revert the update since request will be blocked
        this.revertRecords(clientIP, userId, eventPattern, now);
        SecurityLogger.attack('DDoS attack detected and IP blocked', {
          ip: clientIP,
          eventPattern,
          suspicionScore: ddosCheck.suspicionScore,
          requestId
        });
        return ddosCheck;
      }

      // Calculate remaining requests and reset time
      const ipRecord = this.ipRecords.get(clientIP)!;
      const remainingRequests = Math.max(0, this.config.ipRequestsPerMinute - ipRecord.count);
      const resetTime = ipRecord.windowStart + (60 * 1000);


      SecurityLogger.info('Request rate limit check passed', {
        ip: clientIP,
        userId,
        eventPattern,
        remainingRequests,
        suspicionScore: ddosCheck.suspicionScore,
        requestId
      });

      return {
        allowed: true,
        remainingRequests,
        resetTime,
        blocked: false,
        suspicionScore: ddosCheck.suspicionScore || 0
      };

    } catch (error) {
      SecurityLogger.anomaly('Rate limiting check failed', {
        error: error.message,
        ip: clientIP,
        eventPattern,
        requestId
      });

      // Fail-safe: allow request but log the error
      return {
        allowed: true,
        remainingRequests: 0,
        resetTime: now + 60000,
        blocked: false,
        suspicionScore: 10
      };
    }
  }

  /**
   * Check global request limits
   */
  private checkGlobalLimit(now: number): Partial<RateLimitResult> {
    const record = this.getOrCreateRecord(this.globalRecords, 'global', now);
    
    if (record.count > this.config.globalRequestsPerMinute) {
      SecurityLogger.threat('Global rate limit exceeded', {
        count: record.count,
        limit: this.config.globalRequestsPerMinute
      });
      
      return {
        allowed: false,
        reason: 'Global rate limit exceeded',
        retryAfter: 60,
        remainingRequests: 0,
        resetTime: record.windowStart + 60000,
        blocked: false,
        suspicionScore: 25
      };
    }

    return { allowed: true };
  }

  /**
   * Check IP-based limits
   */
  private checkIPLimit(ip: string, now: number): Partial<RateLimitResult> {
    const record = this.getOrCreateRecord(this.ipRecords, ip, now);
    
    
    if (record.count > this.config.ipRequestsPerMinute) {
      SecurityLogger.threat('IP rate limit exceeded', {
        ip,
        count: record.count,
        limit: this.config.ipRequestsPerMinute
      });
      
      return {
        allowed: false,
        reason: 'IP rate limit exceeded',
        retryAfter: 60,
        remainingRequests: 0,
        resetTime: record.windowStart + 60000,
        blocked: false,
        suspicionScore: 50
      };
    }

    return { allowed: true };
  }

  /**
   * Check user-based limits
   */
  private checkUserLimit(userId: string, now: number): Partial<RateLimitResult> {
    const record = this.getOrCreateRecord(this.userRecords, userId, now);
    
    if (record.count > this.config.userRequestsPerMinute) {
      SecurityLogger.threat('User rate limit exceeded', {
        userId,
        count: record.count,
        limit: this.config.userRequestsPerMinute
      });
      
      return {
        allowed: false,
        reason: 'User rate limit exceeded',
        retryAfter: 60,
        remainingRequests: 0,
        resetTime: record.windowStart + 60000,
        blocked: false,
        suspicionScore: 30
      };
    }

    return { allowed: true };
  }

  /**
   * Check event pattern specific limits
   */
  private checkEventPatternLimit(eventPattern: string, now: number): Partial<RateLimitResult> {
    // Find matching pattern limit
    const patternMatch = this.findPatternLimitWithKey(eventPattern);
    if (!patternMatch) return { allowed: true };

    // Use pattern key (not specific event) for shared limit tracking
    const record = this.getOrCreateRecord(this.eventRecords, patternMatch.pattern, now);
    
    if (record.count > patternMatch.limit.requestsPerMinute) {
      SecurityLogger.threat('Event pattern rate limit exceeded', {
        eventPattern,
        count: record.count,
        limit: patternMatch.limit.requestsPerMinute
      });
      
      return {
        allowed: false,
        reason: `Event pattern rate limit exceeded: ${eventPattern}`,
        retryAfter: 60,
        remainingRequests: 0,
        resetTime: record.windowStart + 60000,
        blocked: false,
        suspicionScore: 40
      };
    }

    return { allowed: true };
  }

  /**
   * Advanced DDoS pattern detection
   */
  private checkDDoSPattern(
    ip: string, 
    eventPattern: string, 
    now: number, 
    userAgent?: string,
    geographic?: { country: string; region: string }
  ): Partial<RateLimitResult> {
    if (!this.config.suspiciousPatternDetection) {
      return { allowed: true, suspicionScore: 0 };
    }

    const ipRecord = this.ipRecords.get(ip);
    if (!ipRecord) return { allowed: true, suspicionScore: 0 };

    let suspicionScore = 0;
    const attackPattern = this.attackPatterns.get(ip) || {
      rapid_fire: 0,
      pattern_repetition: 0,
      burst_spikes: 0,
      geographic_anomaly: 0
    };

    // Rapid fire detection (too many requests in short time)
    const timeSinceLastRequest = now - ipRecord.lastRequest;
    if (timeSinceLastRequest < 100) { // Less than 100ms between requests
      attackPattern.rapid_fire++;
      // Progressive scoring: more rapid fire = higher score
      const rapidFireBonus = Math.min(attackPattern.rapid_fire * 2, 50);
      suspicionScore += 15 + rapidFireBonus;
    }

    // Pattern repetition detection
    if (ipRecord.count > 50) {
      attackPattern.pattern_repetition++;
      suspicionScore += 10;
    }

    // Burst spike detection
    const windowProgress = (now - ipRecord.windowStart) / 60000; // Progress through minute window
    const expectedRequests = this.config.ipRequestsPerMinute * windowProgress;
    if (ipRecord.count > expectedRequests * 3) { // 3x expected rate
      attackPattern.burst_spikes++;
      suspicionScore += 20;
    }

    // Geographic anomaly (if enabled and data available)
    if (this.config.enableGeographicBlocking && geographic) {
      // Simple geographic anomaly detection
      if (geographic.country === 'UNKNOWN' || geographic.region === 'UNKNOWN') {
        attackPattern.geographic_anomaly++;
        suspicionScore += 5;
      }
    }

    // User agent analysis
    if (userAgent) {
      if (this.isSuspiciousUserAgent(userAgent)) {
        suspicionScore += 25;
      }
    }

    this.attackPatterns.set(ip, attackPattern);
    
    // Update IP record suspicion score
    ipRecord.suspicionScore = Math.max(ipRecord.suspicionScore, suspicionScore);

    // DDoS threshold check
    if (ipRecord.count >= this.config.ddosDetectionThreshold || suspicionScore >= 75) {
      SecurityLogger.attack('DDoS pattern detected', {
        ip,
        eventPattern,
        requestCount: ipRecord.count,
        suspicionScore,
        attackPattern,
        threshold: this.config.ddosDetectionThreshold
      });

      return {
        allowed: false,
        reason: 'DDoS attack pattern detected',
        retryAfter: this.config.ddosBlockDurationMs / 1000,
        remainingRequests: 0,
        resetTime: now + this.config.ddosBlockDurationMs,
        blocked: true,
        suspicionScore
      };
    }

    return { allowed: true, suspicionScore };
  }

  /**
   * Find applicable pattern limit for event
   */
  private findPatternLimit(eventPattern: string): { requestsPerMinute: number; burstLimit: number } | null {
    for (const [pattern, limit] of Object.entries(this.config.eventPatternLimits)) {
      const regexPattern = pattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`, 'i');
      if (regex.test(eventPattern)) {
        return limit;
      }
    }
    return null;
  }

  private findPatternLimitWithKey(eventPattern: string): { pattern: string; limit: { requestsPerMinute: number; burstLimit: number } } | null {
    for (const [pattern, limit] of Object.entries(this.config.eventPatternLimits)) {
      const regexPattern = pattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`, 'i');
      if (regex.test(eventPattern)) {
        return { pattern, limit };
      }
    }
    return null;
  }

  /**
   * Get or create rate limit record
   */
  private getOrCreateRecord(
    records: Map<string, RateLimitRecord>, 
    key: string, 
    now: number
  ): RateLimitRecord {
    let record = records.get(key);
    
    if (!record) {
      record = {
        count: 0,
        firstRequest: now,
        lastRequest: now,
        windowStart: now,
        blocked: false,
        suspicionScore: 0
      };
      records.set(key, record);
    }

    // Reset window if it's been more than a minute
    if (now - record.windowStart > 60000) {
      record.count = 0;
      record.windowStart = now;
      record.suspicionScore = Math.max(0, record.suspicionScore - 10); // Decay suspicion
    }

    return record;
  }

  /**
   * Revert record updates when request is blocked
   */
  private revertRecords(ip: string, userId: string | undefined, eventPattern: string, now: number): void {
    // Revert global
    const globalRecord = this.globalRecords.get('global');
    if (globalRecord && globalRecord.count > 0) {
      globalRecord.count--;
    }

    // Revert IP
    const ipRecord = this.ipRecords.get(ip);
    if (ipRecord && ipRecord.count > 0) {
      ipRecord.count--;
    }

    // Revert user (if provided)
    if (userId) {
      const userRecord = this.userRecords.get(userId);
      if (userRecord && userRecord.count > 0) {
        userRecord.count--;
      }
    }

    // Revert event pattern - use pattern key for shared tracking
    const patternMatch = this.findPatternLimitWithKey(eventPattern);
    if (patternMatch) {
      const eventRecord = this.eventRecords.get(patternMatch.pattern);
      if (eventRecord && eventRecord.count > 0) {
        eventRecord.count--;
      }
    }
  }

  /**
   * Update records after allowing request
   */
  private updateRecords(ip: string, userId: string | undefined, eventPattern: string, now: number): void {
    // Update global
    const globalRecord = this.getOrCreateRecord(this.globalRecords, 'global', now);
    globalRecord.count++;
    globalRecord.lastRequest = now;

    // Update IP
    const ipRecord = this.getOrCreateRecord(this.ipRecords, ip, now);
    const oldCount = ipRecord.count;
    ipRecord.count++;
    ipRecord.lastRequest = now;

    // Update user (if provided)
    if (userId) {
      const userRecord = this.getOrCreateRecord(this.userRecords, userId, now);
      userRecord.count++;
      userRecord.lastRequest = now;
    }

    // Update event pattern - use pattern key for shared tracking
    const patternMatch = this.findPatternLimitWithKey(eventPattern);
    if (patternMatch) {
      const eventRecord = this.getOrCreateRecord(this.eventRecords, patternMatch.pattern, now);
      eventRecord.count++;
      eventRecord.lastRequest = now;
    }
  }

  /**
   * Check if user agent is suspicious
   */
  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /^$/,  // Empty user agent
      /test/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Start cleanup timer for expired records
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredRecords();
    }, this.config.cleanupIntervalMs) as any;
  }

  /**
   * Remove expired records to prevent memory leaks
   */
  private cleanupExpiredRecords(): void {
    const now = Date.now();
    const expiredTime = now - this.config.recordExpirationMs;

    const cleanupMap = (map: Map<string, RateLimitRecord>) => {
      for (const [key, record] of map.entries()) {
        if (record.lastRequest < expiredTime) {
          map.delete(key);
        }
      }
    };

    cleanupMap(this.globalRecords);
    cleanupMap(this.ipRecords);
    cleanupMap(this.userRecords);
    cleanupMap(this.eventRecords);

    // Clean up attack patterns
    for (const [ip, pattern] of this.attackPatterns.entries()) {
      const ipRecord = this.ipRecords.get(ip);
      if (!ipRecord || ipRecord.lastRequest < expiredTime) {
        this.attackPatterns.delete(ip);
      }
    }

    // Unblock IPs after block duration
    const ipsToUnblock: string[] = [];
    for (const ip of this.blockedIPs) {
      const ipRecord = this.ipRecords.get(ip);
      if (ipRecord?.blockUntil && now > ipRecord.blockUntil) {
        ipsToUnblock.push(ip);
      }
    }

    for (const ip of ipsToUnblock) {
      this.blockedIPs.delete(ip);
      SecurityLogger.security('IP unblocked after DDoS block duration', { ip });
    }

    SecurityLogger.info('Rate limiter cleanup completed', {
      globalRecords: this.globalRecords.size,
      ipRecords: this.ipRecords.size,
      userRecords: this.userRecords.size,
      eventRecords: this.eventRecords.size,
      blockedIPs: this.blockedIPs.size,
      attackPatterns: this.attackPatterns.size
    });
  }

  /**
   * Get current statistics
   */
  getStats(): {
    totalRecords: number;
    blockedIPs: number;
    activeAttackPatterns: number;
    topRequesters: Array<{ key: string; requests: number }>;
    suspiciousActivity: number;
  } {
    const suspiciousActivity = Array.from(this.ipRecords.values())
      .filter(record => record.suspicionScore > 30).length;

    const topRequesters = Array.from(this.ipRecords.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([key, record]) => ({ key, requests: record.count }));

    return {
      totalRecords: this.ipRecords.size + this.userRecords.size + this.eventRecords.size,
      blockedIPs: this.blockedIPs.size,
      activeAttackPatterns: this.attackPatterns.size,
      topRequesters,
      suspiciousActivity
    };
  }

  /**
   * Manually block an IP
   */
  blockIP(ip: string, reason: string, durationMs?: number): void {
    this.blockedIPs.add(ip);
    
    const ipRecord = this.ipRecords.get(ip);
    if (ipRecord) {
      ipRecord.blocked = true;
      ipRecord.blockUntil = Date.now() + (durationMs || this.config.ddosBlockDurationMs);
    }

    SecurityLogger.security('IP manually blocked', { ip, reason, durationMs });
  }

  /**
   * Manually unblock an IP
   */
  unblockIP(ip: string, reason: string): void {
    this.blockedIPs.delete(ip);
    
    const ipRecord = this.ipRecords.get(ip);
    if (ipRecord) {
      ipRecord.blocked = false;
      ipRecord.blockUntil = undefined;
    }

    SecurityLogger.security('IP manually unblocked', { ip, reason });
  }

  /**
   * Destroy rate limiter and cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.globalRecords.clear();
    this.ipRecords.clear();
    this.userRecords.clear();
    this.eventRecords.clear();
    this.blockedIPs.clear();
    this.attackPatterns.clear();

    SecurityLogger.security('RateLimiter destroyed');
  }
}

export default RateLimiter;