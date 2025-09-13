// SecureLogger.test.ts - Comprehensive security testing for SecureLogger
// Tests sanitization, security pattern detection, and logging safety

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SecureLogger, EventBusLogger, SecurityLogger } from '../../utils/SecureLogger';

describe('SecureLogger Security Tests', () => {
  beforeEach(() => {
    // Reset logger state
    SecureLogger.clearHistory();
    SecureLogger.configure({
      enableInProduction: true, // Enable for testing
      logLevel: 'debug'
    });

    // Mock console methods to capture output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Sensitive Data Sanitization', () => {
    it('should redact password fields', () => {
      const sensitiveData = {
        username: 'john_doe',
        password: 'super_secret_123',
        email: 'john@example.com'
      };

      SecureLogger.info('EventBus', 'User login attempt', sensitiveData);
      
      const history = SecureLogger.getHistory(1);
      expect(history[0].data.password).toBe('[REDACTED]');
      expect(history[0].data.username).toBe('john_doe');
      expect(history[0].data.email).toBe('[REDACTED]'); // Email is sensitive
    });

    it('should redact multiple sensitive field patterns', () => {
      const paymentData = {
        orderId: 'ORD-123',
        creditCardNumber: '4111111111111111',
        cvv: '123',
        token: 'sk_test_abcd1234',
        apiKey: 'api_key_secret_xyz',
        personalInfo: { ssn: '123-45-6789' }
      };

      SecureLogger.info('EventBus', 'Payment processing', paymentData);
      
      const history = SecureLogger.getHistory(1);
      const loggedData = history[0].data;
      
      expect(loggedData.orderId).toBe('ORD-123'); // Not sensitive
      expect(loggedData.creditCardNumber).toBe('[REDACTED]');
      expect(loggedData.cvv).toBe('[REDACTED]');
      expect(loggedData.token).toBe('[REDACTED]');
      expect(loggedData.apiKey).toBe('[REDACTED]');
      expect(loggedData.personalInfo).toBe('[REDACTED]');
    });

    it('should handle nested sensitive data', () => {
      const nestedData = {
        user: {
          profile: {
            password: 'secret',
            publicInfo: 'safe_data'
          },
          session: {
            jwt: 'eyJhbGciOiJIUzI1NiJ9...',
            preferences: { theme: 'dark' }
          }
        }
      };

      SecureLogger.debug('EventBus', 'Complex data structure', nestedData);
      
      const history = SecureLogger.getHistory(1);
      const loggedData = history[0].data;
      
      expect(loggedData.user.profile.password).toBe('[REDACTED]');
      expect(loggedData.user.profile.publicInfo).toBe('safe_data');
      expect(loggedData.user.session.jwt).toBe('[REDACTED]');
      expect(loggedData.user.session.preferences.theme).toBe('dark');
    });
  });

  describe('XSS Pattern Detection', () => {
    it('should detect and sanitize script tags', () => {
      const xssPayload = {
        userInput: '<script>alert("xss")</script>',
        safeInput: 'normal text'
      };

      SecureLogger.warn('EventBus', 'User input validation', xssPayload);
      
      const history = SecureLogger.getHistory(1);
      expect(history[0].data.userInput).toBe('[XSS_PATTERN_DETECTED]');
      expect(history[0].data.safeInput).toBe('normal text');
    });

    it('should detect javascript: URLs', () => {
      const maliciousData = {
        url: 'javascript:alert(document.cookie)',
        legitimateUrl: 'https://example.com'
      };

      SecureLogger.info('EventBus', 'URL processing', maliciousData);
      
      const history = SecureLogger.getHistory(1);
      expect(history[0].data.url).toBe('[XSS_PATTERN_DETECTED]');
      expect(history[0].data.legitimateUrl).toBe('https://example.com');
    });

    it('should detect event handlers in strings', () => {
      const eventHandlerPayload = {
        content: 'normal content',
        malicious: '<div onclick="steal_data()">Click me</div>'
      };

      SecureLogger.error('EventBus', 'Suspicious content detected', eventHandlerPayload);
      
      const history = SecureLogger.getHistory(1);
      expect(history[0].data.malicious).toBe('[XSS_PATTERN_DETECTED]');
      expect(history[0].data.content).toBe('normal content');
    });
  });

  describe('Secret Pattern Detection', () => {
    it('should detect Stripe API keys', () => {
      const secretData = {
        publicKey: 'pk_test_fake_public_key_for_testing',
        secretKey: 'sk_test_fake_secret_key_for_testing',
        regularData: 'normal_value'
      };

      SecureLogger.info('EventBus', 'API configuration', secretData);
      
      const history = SecureLogger.getHistory(1);
      expect(history[0].data.publicKey).toBe('[SECRET_PATTERN_DETECTED]');
      expect(history[0].data.secretKey).toBe('[SECRET_PATTERN_DETECTED]');
      expect(history[0].data.regularData).toBe('normal_value');
    });

    it('should detect bearer tokens', () => {
      const authData = {
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        publicEndpoint: '/api/public'
      };

      SecureLogger.debug('EventBus', 'Auth header processing', authData);
      
      const history = SecureLogger.getHistory(1);
      expect(history[0].data.authorization).toBe('[SECRET_PATTERN_DETECTED]');
      expect(history[0].data.publicEndpoint).toBe('/api/public');
    });

    it('should detect hex-encoded secrets', () => {
      const hexData = {
        hexSecret: 'a1b2c3d4e5f6789012345678901234567890abcd',
        shortHex: 'abc123', // Too short to be considered secret
        normalText: 'regular_text'
      };

      SecureLogger.warn('EventBus', 'Hex data processing', hexData);
      
      const history = SecureLogger.getHistory(1);
      expect(history[0].data.hexSecret).toBe('[SECRET_PATTERN_DETECTED]');
      expect(history[0].data.shortHex).toBe('abc123');
      expect(history[0].data.normalText).toBe('regular_text');
    });
  });

  describe('Size Limits and Truncation', () => {
    it('should truncate large strings', () => {
      const longString = 'a'.repeat(1000); // Exceeds default truncate threshold
      const data = { longField: longString, shortField: 'short' };

      SecureLogger.info('EventBus', 'Large data test', data);
      
      const history = SecureLogger.getHistory(1);
      expect(history[0].data.longField).toContain('...[TRUNCATED]');
      expect(history[0].data.shortField).toBe('short');
    });

    it('should truncate entire payload if too large', () => {
      // Ensure maxPayloadSize is set for this test
      SecureLogger.configure({ maxPayloadSize: 1024 });
      
      const largeData = {
        field1: 'This is a very long field that will exceed the size limit. '.repeat(50),
        field2: 'Another long field with different text content for testing. '.repeat(50),
        field3: 'Yet another field with safe content that should be truncated. '.repeat(50)
      };

      SecureLogger.info('EventBus', 'Massive payload test', largeData);
      
      const history = SecureLogger.getHistory(1);
      
      expect(history[0].data.__truncated).toBe(true);
      expect(history[0].data.__originalSize).toBeGreaterThan(1024);
      expect(history[0].data.__preview).toBeDefined();
    });
  });

  describe('Log Level Control', () => {
    it('should respect log level hierarchy', () => {
      SecureLogger.configure({ logLevel: 'warn' });
      
      SecureLogger.debug('EventBus', 'Debug message');
      SecureLogger.info('EventBus', 'Info message');
      SecureLogger.warn('EventBus', 'Warning message');
      SecureLogger.error('EventBus', 'Error message');
      
      const history = SecureLogger.getHistory();
      expect(history.length).toBe(2); // Only warn and error should be logged
      expect(history[0].level).toBe('warn');
      expect(history[1].level).toBe('error');
    });

    it('should always log errors regardless of level', () => {
      SecureLogger.configure({ logLevel: 'error' });
      
      SecureLogger.debug('EventBus', 'Debug message');
      SecureLogger.error('EventBus', 'Critical error');
      
      const history = SecureLogger.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].level).toBe('error');
    });
  });

  describe('Production Safety', () => {
    it('should disable logging in production by default', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      SecureLogger.configure({ enableInProduction: false });
      SecureLogger.info('EventBus', 'Production message');
      
      const history = SecureLogger.getHistory();
      expect(history.length).toBe(0);
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should still log errors in production even when disabled', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      SecureLogger.configure({ enableInProduction: false });
      SecureLogger.error('EventBus', 'Critical production error');
      
      const history = SecureLogger.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].level).toBe('error');
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Security Event Detection', () => {
    it('should detect high error rates', () => {
      // Generate multiple errors
      for (let i = 0; i < 10; i++) {
        SecureLogger.error('EventBus', `Error ${i}`);
      }
      
      // Add some normal logs
      for (let i = 0; i < 5; i++) {
        SecureLogger.info('EventBus', `Info ${i}`);
      }
      
      const anomalies = SecureLogger.detectAnomalies();
      expect(anomalies.errorRate).toBeGreaterThan(0.5); // More than 50% errors
    });

    it('should count XSS pattern detections', () => {
      SecureLogger.info('EventBus', 'XSS attempt 1', { input: '<script>alert(1)</script>' });
      SecureLogger.info('EventBus', 'XSS attempt 2', { input: 'javascript:alert(2)' });
      SecureLogger.info('EventBus', 'Normal log', { input: 'safe content' });
      
      const anomalies = SecureLogger.detectAnomalies();
      expect(anomalies.suspiciousPatterns).toBe(2);
    });

    it('should track security events separately', () => {
      SecurityLogger.threat('Suspicious login pattern detected');
      SecurityLogger.attack('SQL injection attempt blocked');
      SecureLogger.info('EventBus', 'Normal operation');
      
      const anomalies = SecureLogger.detectAnomalies();
      expect(anomalies.recentSecurityEvents.length).toBe(2);
    });
  });

  describe('Convenience Loggers', () => {
    it('should provide EventBusLogger shortcuts', () => {
      EventBusLogger.info('Event emitted successfully');
      EventBusLogger.error('Event processing failed');
      
      const history = SecureLogger.getHistory(2);
      expect(history[0].context).toBe('EventBus');
      expect(history[1].context).toBe('EventBus');
    });

    it('should provide SecurityLogger with threat classification', () => {
      SecurityLogger.threat('Potential brute force attack');
      SecurityLogger.anomaly('Unusual event pattern detected');
      SecurityLogger.violation('Rate limit exceeded');
      
      const history = SecureLogger.getHistory(3);
      expect(history.every(log => log.context === 'Security')).toBe(true);
      expect(history[0].message).toContain('THREAT:');
      expect(history[1].message).toContain('ANOMALY:');
      expect(history[2].message).toContain('VIOLATION:');
    });
  });

  describe('Log Export and History', () => {
    it('should maintain log history within limits', () => {
      // Generate more logs than the limit
      for (let i = 0; i < 1200; i++) {
        SecureLogger.info('EventBus', `Message ${i}`);
      }
      
      const history = SecureLogger.getHistory();
      expect(history.length).toBeLessThanOrEqual(1000); // Should respect MAX_HISTORY
    });

    it('should export logs in JSON format', () => {
      SecureLogger.info('EventBus', 'Test message', { test: 'data' });
      
      const exported = SecureLogger.exportLogs();
      const parsed = JSON.parse(exported);
      
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].message).toBe('Test message');
    });

    it('should clear history when requested', () => {
      SecureLogger.info('EventBus', 'Message 1');
      SecureLogger.info('EventBus', 'Message 2');
      
      expect(SecureLogger.getHistory().length).toBe(2);
      
      SecureLogger.clearHistory();
      expect(SecureLogger.getHistory().length).toBe(0);
    });
  });

  describe('Edge Cases and Robustness', () => {
    it('should handle null and undefined data gracefully', () => {
      SecureLogger.info('EventBus', 'Null test', null);
      SecureLogger.info('EventBus', 'Undefined test', undefined);
      
      const history = SecureLogger.getHistory(2);
      
      // The logs are added to end of array, so most recent should be last
      // First call (null) should be at index 0, second call (undefined) at index 1
      expect(history[0].data).toBeNull();
      expect(history[1].data).toBeUndefined();
    });

    it('should handle circular references in objects', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      // Should not throw an error
      expect(() => {
        SecureLogger.info('EventBus', 'Circular reference test', circularObj);
      }).not.toThrow();
    });

    it('should handle arrays with sensitive data', () => {
      const arrayData = {
        items: [
          { id: 1, password: 'secret1' },
          { id: 2, token: 'abc123' },
          { id: 3, publicData: 'safe' }
        ]
      };
      
      SecureLogger.info('EventBus', 'Array sanitization test', arrayData);
      
      const history = SecureLogger.getHistory(1);
      const items = history[0].data.items;
      
      expect(items[0].password).toBe('[REDACTED]');
      expect(items[1].token).toBe('[REDACTED]');
      expect(items[2].publicData).toBe('safe');
    });
  });
});