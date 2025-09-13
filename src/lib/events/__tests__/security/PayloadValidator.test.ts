// PayloadValidator.test.ts - Tests against known XSS vectors and malicious payloads
// Comprehensive security testing for payload validation and sanitization

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PayloadValidator from '../../utils/PayloadValidator';
import type { NamespacedEvent } from '../../types';

// Mock event creator
const createMockEvent = (payload: any): NamespacedEvent => ({
  id: 'test-event-id',
  pattern: 'test.payload.validation',
  payload,
  timestamp: new Date().toISOString(),
  source: 'test',
  version: '1.0.0',
  correlationId: 'test-correlation',
  userId: 'test-user',
  deduplicationMetadata: {
    contentHash: 'test-hash',
    clientId: 'test-client',
    sequence: 1,
    semantic: {}
  },
  tracingMetadata: {
    traceId: 'test-trace',
    spanId: 'test-span',
    baggage: {}
  }
});

describe('PayloadValidator Security Tests', () => {
  beforeEach(() => {
    PayloadValidator.configure({
      enableXSSProtection: true,
      enableSQLInjectionProtection: true,
      enableHTMLSanitization: true,
      maxStringLength: 1000,
      maxObjectDepth: 5,
      maxArrayLength: 100
    });

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('XSS Protection Tests', () => {
    const xssVectors = [
      // Classic script injection
      '<script>alert("XSS")</script>',
      '<script type="text/javascript">alert("XSS")</script>',
      '<script>document.location="http://evil.com"</script>',
      
      // Event handler injection
      '<img src="x" onerror="alert(\\"XSS\\")">',
      '<div onclick="alert(\\"XSS\\")">Click me</div>',
      '<input onfocus="alert(\\"XSS\\")" autofocus>',
      '<body onload="alert(\\"XSS\\")">',
      
      // JavaScript URL schemes
      'javascript:alert("XSS")',
      'javascript:void(0)',
      'vbscript:msgbox("XSS")',
      
      // Data URIs with scripts
      'data:text/html,<script>alert("XSS")</script>',
      'data:text/html;base64,PHNjcmlwdD5hbGVydCgiWFNTIik8L3NjcmlwdD4=',
      
      // CSS expression injection
      'expression(alert("XSS"))',
      'style="expression(alert(\\"XSS\\"))"',
      
      // Meta refresh attacks
      '<meta http-equiv="refresh" content="0;url=javascript:alert(\\"XSS\\")">',
      
      // Advanced vectors
      '&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;', // Encoded javascript
      '\\u006A\\u0061\\u0076\\u0061\\u0073\\u0063\\u0072\\u0069\\u0070\\u0074\\u003A\\u0061\\u006C\\u0065\\u0072\\u0074\\u0028\\u0022\\u0058\\u0053\\u0053\\u0022\\u0029', // Unicode encoded
      
      // SVG with script
      '<svg onload="alert(\\"XSS\\")">',
      '<svg><script>alert("XSS")</script></svg>',
      
      // Template injection
      '{{constructor.constructor("alert(\\"XSS\\")")()}}',
      '${alert("XSS")}',
      
      // Iframe injection
      '<iframe src="javascript:alert(\\"XSS\\")"></iframe>',
      '<iframe src="data:text/html,<script>alert(\\"XSS\\")</script>"></iframe>',
      
      // Object and embed
      '<object data="javascript:alert(\\"XSS\\")"></object>',
      '<embed src="javascript:alert(\\"XSS\\")">',
      
      // Link injection
      '<link rel="stylesheet" href="javascript:alert(\\"XSS\\")">',
      
      // Form injection
      '<form action="javascript:alert(\\"XSS\\")"><input type="submit"></form>'
    ];

    xssVectors.forEach((xssVector, index) => {
      it(`should block XSS vector ${index + 1}: ${xssVector.substring(0, 50)}...`, () => {
        const payload = {
          userInput: xssVector,
          description: `Testing XSS vector ${index + 1}`
        };

        const event = createMockEvent(payload);
        const result = PayloadValidator.validateAndSanitize(event);

        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.violations.some(v => v.type === 'xss')).toBe(true);
        
        // Ensure sanitized payload doesn't contain the malicious content
        expect(result.sanitizedPayload.userInput).not.toBe(xssVector);
        expect(result.sanitizedPayload.userInput).toMatch(/\[XSS_REMOVED\]/);
      });
    });

    it('should allow safe HTML-like content', () => {
      const safePayload = {
        productName: 'Widget <Model A>',
        description: 'Price: $29.99 (tax included)',
        note: 'Contact us at info@company.com for details'
      };

      const event = createMockEvent(safePayload);
      const result = PayloadValidator.validateAndSanitize(event);


      expect(result.isValid).toBe(true);
      expect(result.violations.filter(v => v.type === 'xss')).toHaveLength(0);
    });
  });

  describe('SQL Injection Protection Tests', () => {
    const sqlInjectionVectors = [
      // Classic UNION attacks
      "1' UNION SELECT * FROM users--",
      "' OR 1=1--",
      "admin'--",
      "' OR 'a'='a",
      
      // Boolean-based blind SQL injection
      "1' AND 1=1--",
      "1' AND 1=2--",
      
      // Time-based blind SQL injection
      "1'; WAITFOR DELAY '00:00:05'--",
      "1' AND (SELECT COUNT(*) FROM sysobjects)>0--",
      
      // UNION with information extraction
      "1' UNION SELECT username, password FROM users--",
      "1' UNION SELECT NULL, @@version--",
      
      // Stored procedure execution
      "'; EXEC xp_cmdshell('dir')--",
      "'; EXEC sp_configure--",
      
      // Database functions
      "1'; DROP TABLE users--",
      "'; TRUNCATE TABLE logs--",
      "'; DELETE FROM users WHERE 1=1--",
      
      // Advanced techniques
      "1' AND ASCII(SUBSTRING((SELECT TOP 1 name FROM sysobjects),1,1))>64--",
      "1'; BENCHMARK(5000000,MD5(1))--",
      "1' AND (SELECT pg_sleep(5))--",
      
      // NoSQL injection (for MongoDB-like systems)
      "'; db.users.drop(); //",
      "$ne: null",
      "'; return true; //",
      
      // LDAP injection
      ")(|(objectClass=*))",
      "*)(uid=*))(|(uid=*"
    ];

    sqlInjectionVectors.forEach((sqlVector, index) => {
      it(`should block SQL injection vector ${index + 1}: ${sqlVector}`, () => {
        const payload = {
          searchQuery: sqlVector,
          userId: `user-${index}`,
          filter: `status = '${sqlVector}'`
        };

        const event = createMockEvent(payload);
        const result = PayloadValidator.validateAndSanitize(event);

        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.violations.some(v => v.type === 'sql_injection')).toBe(true);
        
        // Ensure sanitized payload removes SQL patterns
        const sanitizedQuery = result.sanitizedPayload.searchQuery;
        expect(sanitizedQuery).not.toBe(sqlVector);
        expect(sanitizedQuery).toMatch(/\[SQL_REMOVED\]/);
      });
    });

    it('should allow safe query-like content', () => {
      const safePayload = {
        searchQuery: 'Find products with name containing "widget"',
        description: 'Union of features makes this product special',
        note: 'Select the best option for your needs'
      };

      const event = createMockEvent(safePayload);
      const result = PayloadValidator.validateAndSanitize(event);

      expect(result.isValid).toBe(true);
      expect(result.violations.filter(v => v.type === 'sql_injection')).toHaveLength(0);
    });
  });

  describe('HTML Sanitization Tests', () => {
    it('should remove HTML tags from user content', () => {
      const payload = {
        comment: '<p>This is a <b>bold</b> comment with <a href="http://example.com">links</a></p>',
        description: '<div class="content"><span>Nested tags</span></div>',
        userBio: '<h1>My Bio</h1><img src="profile.jpg" alt="Profile">'
      };

      const event = createMockEvent(payload);
      const result = PayloadValidator.validateAndSanitize(event);

      expect(result.violations.some(v => v.type === 'html_injection')).toBe(true);
      expect(result.sanitizedPayload.comment).not.toContain('<p>');
      expect(result.sanitizedPayload.comment).not.toContain('<b>');
      expect(result.sanitizedPayload.description).not.toContain('<div>');
    });

    it('should handle HTML entities', () => {
      const payload = {
        content: 'Price: &lt;$100&gt; &amp; discounts available &#8364;50',
        message: 'Use &#x27;quotes&#x27; properly &quot;always&quot;'
      };

      const event = createMockEvent(payload);
      const result = PayloadValidator.validateAndSanitize(event);

      expect(result.violations.some(v => v.type === 'html_injection')).toBe(true);
      expect(result.sanitizedPayload.content).not.toContain('&lt;');
      expect(result.sanitizedPayload.content).not.toContain('&#8364;');
    });
  });

  describe('Protocol Validation Tests', () => {
    const dangerousUrls = [
      'javascript:alert("XSS")',
      'vbscript:msgbox("Attack")',
      'data:text/html,<script>alert("XSS")</script>',
      'file:///etc/passwd',
      'ftp://malicious-site.com/payload.exe'
    ];

    dangerousUrls.forEach((url, index) => {
      it(`should block dangerous protocol ${index + 1}: ${url}`, () => {
        const payload = {
          website: url,
          redirectUrl: url,
          imageSource: url
        };

        const event = createMockEvent(payload);
        const result = PayloadValidator.validateAndSanitize(event);

        expect(result.violations.some(v => v.type === 'protocol_violation')).toBe(true);
        expect(result.sanitizedPayload.website).toContain('[PROTOCOL_BLOCKED]');
      });
    });

    it('should allow safe protocols', () => {
      const payload = {
        website: 'https://example.com',
        email: 'mailto:contact@example.com',
        phone: 'tel:+1234567890'
      };

      const event = createMockEvent(payload);
      const result = PayloadValidator.validateAndSanitize(event);

      expect(result.violations.filter(v => v.type === 'protocol_violation')).toHaveLength(0);
      expect(result.sanitizedPayload.website).toBe('https://example.com');
    });
  });

  describe('Size and Structure Limits', () => {
    it('should truncate oversized strings', () => {
      const longString = 'A'.repeat(2000); // 2KB, exceeds 1KB limit
      const payload = {
        description: longString,
        normalField: 'normal content'
      };

      const event = createMockEvent(payload);
      const result = PayloadValidator.validateAndSanitize(event);

      expect(result.violations.some(v => v.type === 'size_limit')).toBe(true);
      expect(result.sanitizedPayload.description.length).toBeLessThanOrEqual(1000);
      expect(result.sanitizedPayload.normalField).toBe('normal content');
    });

    it('should handle deeply nested objects', () => {
      // Create deeply nested object (depth > 5)
      let deepObject: any = { level: 0 };
      for (let i = 1; i <= 10; i++) {
        deepObject = { level: i, child: deepObject };
      }

      const payload = {
        data: deepObject,
        normalField: 'test'
      };

      const event = createMockEvent(payload);
      const result = PayloadValidator.validateAndSanitize(event);

      expect(result.violations.some(v => v.type === 'depth_limit')).toBe(true);
    });

    it('should truncate oversized arrays', () => {
      const largeArray = Array.from({ length: 200 }, (_, i) => ({ id: i })); // 200 items, exceeds 100 limit
      const payload = {
        items: largeArray,
        normalField: 'test'
      };

      const event = createMockEvent(payload);
      const result = PayloadValidator.validateAndSanitize(event);

      expect(result.violations.some(v => v.type === 'size_limit')).toBe(true);
      expect(result.sanitizedPayload.items.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Complex Payload Tests', () => {
    it('should handle realistic G-Admin business payloads', () => {
      const businessPayload = {
        order: {
          id: 'ORD-001',
          customer: {
            name: 'John O\'Connor', // Apostrophe should be safe
            email: 'john@company.com',
            notes: 'Customer prefers <dietary preferences> noted' // HTML-like but safe
          },
          items: [
            {
              name: 'Premium Burger & Fries',
              description: 'Made with 100% beef',
              customizations: ['No onion', 'Extra cheese']
            }
          ],
          metadata: {
            source: 'web',
            userAgent: 'Mozilla/5.0 (compatible browser)'
          }
        }
      };

      const event = createMockEvent(businessPayload);
      const result = PayloadValidator.validateAndSanitize(event);

      expect(result.isValid).toBe(true);
      // Some HTML sanitization might occur, but should not be blocked
      expect(result.sanitizedPayload.order.customer.name).toBe('John O\'Connor');
      expect(result.sanitizedPayload.order.customer.email).toBe('john@company.com');
    });

    it('should handle malicious business payload', () => {
      const maliciousPayload = {
        order: {
          id: 'ORD-001',
          customer: {
            name: '<script>alert("steal data")</script>John Doe',
            email: 'john@company.com\'; DROP TABLE customers;--',
            notes: 'javascript:void(document.location="http://evil.com")'
          },
          items: [
            {
              name: 'Burger',
              description: '<iframe src="javascript:alert(\\"XSS\\")"></iframe>',
              customizations: ['<img onerror="alert(\\"XSS\\")" src="x">']
            }
          ]
        }
      };

      const event = createMockEvent(maliciousPayload);
      const result = PayloadValidator.validateAndSanitize(event);

      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations.some(v => v.type === 'xss')).toBe(true);
      expect(result.violations.some(v => v.type === 'sql_injection')).toBe(true);
      
      // All malicious content should be sanitized
      expect(result.sanitizedPayload.order.customer.name).toContain('[XSS_REMOVED]');
      expect(result.sanitizedPayload.order.customer.email).toContain('[SQL_REMOVED]');
      expect(result.sanitizedPayload.order.customer.notes).toContain('[PROTOCOL_BLOCKED]');
    });
  });

  describe('Performance Tests', () => {
    it('should validate large payloads efficiently', () => {
      const largePayload = {
        data: Array.from({ length: 50 }, (_, i) => ({
          id: i,
          description: `Item ${i} with some content`,
          metadata: {
            tags: [`tag${i}`, `category${i % 5}`],
            attributes: {
              color: 'blue',
              size: 'medium',
              price: 19.99 + i
            }
          }
        }))
      };

      const event = createMockEvent(largePayload);
      
      const startTime = performance.now();
      const result = PayloadValidator.validateAndSanitize(event);
      const duration = performance.now() - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(100); // Should complete in <100ms
    });

    it('should have quick validation for hot paths', () => {
      const payload = {
        simple: 'test',
        number: 42,
        boolean: true
      };

      const startTime = performance.now();
      const isValid = PayloadValidator.quickValidate(payload);
      const duration = performance.now() - startTime;

      expect(isValid).toBe(true);
      expect(duration).toBeLessThan(10); // Should complete in <10ms
    });

    it('should detect malicious content in quick validation', () => {
      const maliciousPayload = {
        comment: '<script>alert("XSS")</script>',
        query: "' OR 1=1--"
      };

      const isValid = PayloadValidator.quickValidate(maliciousPayload);
      expect(isValid).toBe(false);
    });
  });

  describe('Configuration Tests', () => {
    it('should disable specific protection when configured', () => {
      PayloadValidator.configure({
        enableXSSProtection: false,
        enableSQLInjectionProtection: true,
        enableHTMLSanitization: true
      });

      const payload = {
        content: '<script>alert("XSS")</script>',
        query: "' OR 1=1--"
      };

      const event = createMockEvent(payload);
      const result = PayloadValidator.validateAndSanitize(event);

      expect(result.violations.filter(v => v.type === 'xss')).toHaveLength(0);
      expect(result.violations.some(v => v.type === 'sql_injection')).toBe(true);
    });

    it('should respect custom size limits', () => {
      PayloadValidator.configure({
        maxStringLength: 20,
        maxArrayLength: 3
      });

      const payload = {
        description: 'This is a very long description that exceeds the limit',
        items: ['item1', 'item2', 'item3', 'item4', 'item5']
      };

      const event = createMockEvent(payload);
      const result = PayloadValidator.validateAndSanitize(event);

      expect(result.violations.some(v => v.type === 'size_limit')).toBe(true);
      expect(result.sanitizedPayload.description.length).toBeLessThanOrEqual(20);
      expect(result.sanitizedPayload.items.length).toBeLessThanOrEqual(3);
    });
  });
});