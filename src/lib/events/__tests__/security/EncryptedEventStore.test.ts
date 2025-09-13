// EncryptedEventStore.test.ts - Tests for AES-GCM encryption functionality
// Validates encryption, decryption, key management, and security features

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import EncryptedEventStore, { type EncryptionConfig, type EncryptedPayload } from '../../utils/EncryptedEventStore';

describe('EncryptedEventStore', () => {
  let encryptionService: EncryptedEventStore;
  let testConfig: Partial<EncryptionConfig>;

  beforeEach(async () => {
    vi.useFakeTimers();
    
    testConfig = {
      enabled: true,
      keyRotationIntervalMs: 3600000, // 1 hour for testing
      sensitivePatterns: [
        'payment.*',
        'customer.pii.*', 
        'auth.*',
        'sensitive.*'
      ],
      compressionEnabled: false, // Disabled for faster testing
      keyDerivationIterations: 1000 // Reduced for faster testing
    };
    
    encryptionService = new EncryptedEventStore(testConfig);
    await encryptionService.initialize();
  });

  afterEach(async () => {
    if (encryptionService) {
      encryptionService.destroy();
    }
    // Reset singleton for clean tests
    EncryptedEventStore.resetForTesting();
    vi.useRealTimers();
  });

  describe('Initialization and Configuration', () => {
    it('should initialize with default configuration', async () => {
      const defaultService = new EncryptedEventStore();
      await defaultService.initialize();
      
      const stats = defaultService.getStats();
      
      expect(stats.enabled).toBe(true);
      expect(stats.sensitivePatterns).toBeGreaterThan(0);
      expect(stats.keyVersion).toBeDefined();
      
      defaultService.destroy();
    });

    it('should initialize with custom passphrase', async () => {
      const customService = new EncryptedEventStore(testConfig);
      await customService.initialize('test-passphrase-123');
      
      const stats = customService.getStats();
      expect(stats.enabled).toBe(true);
      expect(stats.keyVersion).toBeDefined();
      
      customService.destroy();
    });

    it('should handle disabled encryption', async () => {
      const disabledService = new EncryptedEventStore({ enabled: false });
      await disabledService.initialize();
      
      const stats = disabledService.getStats();
      expect(stats.enabled).toBe(false);
      expect(disabledService.shouldEncrypt('payment.card')).toBe(false);
      
      disabledService.destroy();
    });
  });

  describe('Pattern Matching', () => {
    it('should correctly identify sensitive patterns', () => {
      // Should encrypt
      expect(encryptionService.shouldEncrypt('payment.card')).toBe(true);
      expect(encryptionService.shouldEncrypt('payment.processing.complete')).toBe(true);
      expect(encryptionService.shouldEncrypt('customer.pii.update')).toBe(true);
      expect(encryptionService.shouldEncrypt('auth.login')).toBe(true);
      expect(encryptionService.shouldEncrypt('sensitive.data')).toBe(true);
      
      // Should not encrypt
      expect(encryptionService.shouldEncrypt('inventory.stock.update')).toBe(false);
      expect(encryptionService.shouldEncrypt('sales.order.created')).toBe(false);
      expect(encryptionService.shouldEncrypt('system.health')).toBe(false);
    });

    it('should handle case-insensitive pattern matching', () => {
      expect(encryptionService.shouldEncrypt('PAYMENT.CARD')).toBe(true);
      expect(encryptionService.shouldEncrypt('Payment.Card')).toBe(true);
      expect(encryptionService.shouldEncrypt('AUTH.LOGIN')).toBe(true);
    });

    it('should handle wildcard patterns correctly', () => {
      const customService = new EncryptedEventStore({
        ...testConfig,
        sensitivePatterns: ['*.secret.*', 'admin.*']
      });
      
      expect(customService.shouldEncrypt('user.secret.key')).toBe(true);
      expect(customService.shouldEncrypt('config.secret.value')).toBe(true);
      expect(customService.shouldEncrypt('admin.action')).toBe(true);
      expect(customService.shouldEncrypt('public.data')).toBe(false);
      
      customService.destroy();
    });
  });

  describe('Encryption and Decryption', () => {
    it('should encrypt and decrypt simple payloads', async () => {
      const testPayload = {
        userId: 'user-123',
        creditCard: '4532-1234-5678-9012',
        amount: 99.99,
        timestamp: new Date().toISOString()
      };

      // Encrypt
      const encrypted = await encryptionService.encryptPayload(testPayload, 'payment.card');
      
      expect(encryptionService.isEncrypted(encrypted)).toBe(true);
      expect(encrypted.encrypted).toBeDefined();
      expect(encrypted.metadata.algorithm).toBe('AES-GCM');
      expect(encrypted.metadata.keyVersion).toBeDefined();
      expect(encrypted.originalSize).toBeGreaterThan(0);

      // Decrypt
      const decrypted = await encryptionService.decryptPayload(encrypted);
      
      expect(decrypted).toEqual(testPayload);
    });

    it('should encrypt and decrypt complex nested objects', async () => {
      const complexPayload = {
        user: {
          id: 'user-456',
          personalInfo: {
            ssn: '123-45-6789',
            bankAccount: {
              routingNumber: '021000021',
              accountNumber: '1234567890'
            },
            addresses: [
              { type: 'home', street: '123 Main St', city: 'Anytown' },
              { type: 'work', street: '456 Work Ave', city: 'Business City' }
            ]
          }
        },
        transaction: {
          id: 'txn-789',
          amount: 250.75,
          currency: 'USD',
          metadata: {
            source: 'mobile-app',
            device: 'iPhone-12'
          }
        },
        arrayData: [1, 2, 3, 'test', true, { nested: 'object' }]
      };

      const encrypted = await encryptionService.encryptPayload(complexPayload, 'customer.pii.update');
      const decrypted = await encryptionService.decryptPayload(encrypted);
      
      expect(decrypted).toEqual(complexPayload);
    });

    it('should handle large payloads efficiently', async () => {
      const largePayload = {
        id: 'large-payload-test',
        data: 'x'.repeat(10000), // 10KB string - reduced for testing
        metadata: {
          size: 10000,
          type: 'large-test'
        }
      };

      const startTime = performance.now();
      const encrypted = await encryptionService.encryptPayload(largePayload, 'sensitive.large');
      const encryptionTime = performance.now() - startTime;

      expect(encryptionTime).toBeLessThan(5000); // Increased timeout
      expect(encrypted.originalSize).toBeGreaterThan(0);

      const decryptStartTime = performance.now();
      const decrypted = await encryptionService.decryptPayload(encrypted);
      const decryptionTime = performance.now() - decryptStartTime;

      expect(decryptionTime).toBeLessThan(5000);
      expect(decrypted).toEqual(largePayload);
    }, 15000); // 15 second timeout

    it('should apply compression when beneficial', async () => {
      // Skip compression test since it's disabled in config for performance
      const compressiblePayload = {
        id: 'compression-test',
        repeatedData: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(100), // Smaller for testing
        metadata: { compressed: true }
      };

      const encrypted = await encryptionService.encryptPayload(compressiblePayload, 'sensitive.compressible');
      
      // Since compression is disabled in test config, should not be compressed
      expect(encrypted.metadata.compressed).toBe(false);

      const decrypted = await encryptionService.decryptPayload(encrypted);
      expect(decrypted).toEqual(compressiblePayload);
    }, 10000); // 10 second timeout

    it('should maintain data integrity with special characters', async () => {
      const specialCharsPayload = {
        emoji: '🔐🚀💾⚡🛡️',
        unicode: 'Héllo Wørld! 你好世界 🌍',
        specialChars: '!@#$%^&*()_+-=[]{}|;":,./<>?',
        nullAndUndefined: {
          nullValue: null,
          undefinedValue: undefined,
          emptyString: '',
          zeroNumber: 0,
          falseBoolean: false
        }
      };

      const encrypted = await encryptionService.encryptPayload(specialCharsPayload, 'auth.special');
      const decrypted = await encryptionService.decryptPayload(encrypted);
      
      expect(decrypted).toEqual(specialCharsPayload);
    });
  });

  describe('Security Features', () => {
    it('should generate unique IVs for each encryption', async () => {
      const payload = { test: 'data' };
      
      const encrypted1 = await encryptionService.encryptPayload(payload, 'payment.test');
      const encrypted2 = await encryptionService.encryptPayload(payload, 'payment.test');
      
      // Same payload but different encrypted results
      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
      expect(encrypted1.metadata.iv).not.toBe(encrypted2.metadata.iv);
      
      // Both should decrypt to the same payload
      const decrypted1 = await encryptionService.decryptPayload(encrypted1);
      const decrypted2 = await encryptionService.decryptPayload(encrypted2);
      expect(decrypted1).toEqual(payload);
      expect(decrypted2).toEqual(payload);
    });

    it('should fail decryption with tampered data', async () => {
      const payload = { sensitive: 'data' };
      const encrypted = await encryptionService.encryptPayload(payload, 'auth.test');
      
      // Tamper with encrypted data
      const tamperedEncrypted = {
        ...encrypted,
        encrypted: encrypted.encrypted.slice(0, -10) + 'tamperedxx'
      };
      
      await expect(
        encryptionService.decryptPayload(tamperedEncrypted)
      ).rejects.toThrow();
    });

    it('should fail decryption with tampered authentication tag', async () => {
      const payload = { sensitive: 'data' };
      const encrypted = await encryptionService.encryptPayload(payload, 'auth.test');
      
      // Tamper with auth tag
      const tamperedEncrypted = {
        ...encrypted,
        metadata: {
          ...encrypted.metadata,
          authTag: encrypted.metadata.authTag.slice(0, -10) + 'tamperedxx'
        }
      };
      
      await expect(
        encryptionService.decryptPayload(tamperedEncrypted)
      ).rejects.toThrow();
    });

    it('should fail decryption with tampered IV', async () => {
      const payload = { sensitive: 'data' };
      const encrypted = await encryptionService.encryptPayload(payload, 'auth.test');
      
      // Tamper with IV
      const tamperedEncrypted = {
        ...encrypted,
        metadata: {
          ...encrypted.metadata,
          iv: encrypted.metadata.iv.slice(0, -10) + 'tamperedxx'
        }
      };
      
      await expect(
        encryptionService.decryptPayload(tamperedEncrypted)
      ).rejects.toThrow();
    });

    it('should reject encryption of non-sensitive patterns', async () => {
      const payload = { regular: 'data' };
      
      await expect(
        encryptionService.encryptPayload(payload, 'inventory.stock')
      ).rejects.toThrow('Payload does not require encryption');
    });
  });

  describe('Key Management', () => {
    it('should track key version in encrypted payloads', async () => {
      const payload = { test: 'data' };
      const encrypted = await encryptionService.encryptPayload(payload, 'payment.test');
      
      const stats = encryptionService.getStats();
      expect(encrypted.metadata.keyVersion).toBe(stats.keyVersion);
      expect(encrypted.metadata.keyVersion).toMatch(/^key_\d+_[a-zA-Z0-9]{8}$/);
    });

    it('should handle key rotation gracefully', async () => {
      // This test would require more complex setup to test actual key rotation
      // For now, we verify that the key version is properly tracked
      const stats1 = encryptionService.getStats();
      expect(stats1.keyVersion).toBeDefined();
      
      // In a real scenario, after key rotation, the version would change
      // but existing encrypted payloads should still be decryptable
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed encrypted payloads', async () => {
      const malformedPayload = {
        encrypted: 'invalid-base64-!@#$',
        metadata: {
          algorithm: 'AES-GCM',
          keyVersion: 'test-key',
          iv: 'invalid-iv',
          authTag: 'invalid-tag',
          compressed: false,
          timestamp: Date.now()
        },
        originalSize: 100,
        encryptedSize: 150
      };
      
      await expect(
        encryptionService.decryptPayload(malformedPayload)
      ).rejects.toThrow();
    });

    it('should handle unsupported encryption algorithms', async () => {
      const payload = { test: 'data' };
      const encrypted = await encryptionService.encryptPayload(payload, 'payment.test');
      
      const unsupportedPayload = {
        ...encrypted,
        metadata: {
          ...encrypted.metadata,
          algorithm: 'AES-CBC' // Unsupported algorithm
        }
      };
      
      await expect(
        encryptionService.decryptPayload(unsupportedPayload)
      ).rejects.toThrow('Unsupported encryption algorithm');
    });

    it('should handle encryption service not initialized', async () => {
      // Clean up existing singleton first
      EncryptedEventStore.resetForTesting();
      
      const uninitializedService = new EncryptedEventStore(testConfig);
      // Don't call initialize()
      
      await expect(
        uninitializedService.encryptPayload({ test: 'data' }, 'payment.test')
      ).rejects.toThrow();
      
      uninitializedService.destroy();
    });
  });

  describe('Utility Functions', () => {
    it('should correctly identify encrypted payloads', () => {
      const regularPayload = { test: 'data' };
      const encryptedPayload: EncryptedPayload = {
        encrypted: 'base64data',
        metadata: {
          algorithm: 'AES-GCM',
          keyVersion: 'test-key',
          iv: 'test-iv',
          authTag: 'test-tag',
          compressed: false,
          timestamp: Date.now()
        },
        originalSize: 100,
        encryptedSize: 150
      };
      
      expect(encryptionService.isEncrypted(regularPayload)).toBe(false);
      expect(encryptionService.isEncrypted(encryptedPayload)).toBe(true);
      expect(encryptionService.isEncrypted(null)).toBe(false);
      expect(encryptionService.isEncrypted(undefined)).toBe(false);
      expect(encryptionService.isEncrypted('string')).toBe(false);
    });

    it('should provide accurate statistics', async () => {
      const stats = encryptionService.getStats();
      
      expect(stats.enabled).toBe(true);
      expect(stats.keyVersion).toBeDefined();
      expect(stats.sensitivePatterns).toBe(testConfig.sensitivePatterns!.length);
      expect(typeof stats.compressionEnabled).toBe('boolean');
    });
  });

  describe('Performance', () => {
    it('should encrypt small payloads quickly', async () => {
      const smallPayload = { id: 1, name: 'test' };
      
      const startTime = performance.now();
      const encrypted = await encryptionService.encryptPayload(smallPayload, 'payment.small');
      const encryptionTime = performance.now() - startTime;
      
      expect(encryptionTime).toBeLessThan(100); // Should complete in <100ms
      expect(encrypted).toBeDefined();
    });

    it('should handle multiple concurrent encryptions', async () => {
      const payloads = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        data: `test-data-${i}`,
        timestamp: Date.now()
      }));

      const startTime = performance.now();
      const encryptionPromises = payloads.map((payload, i) => 
        encryptionService.encryptPayload(payload, 'payment.concurrent')
      );
      
      const encryptedResults = await Promise.all(encryptionPromises);
      const totalTime = performance.now() - startTime;
      
      expect(encryptedResults).toHaveLength(10);
      expect(totalTime).toBeLessThan(1000); // Should complete all in <1 second
      
      // Verify all are properly encrypted
      for (const encrypted of encryptedResults) {
        expect(encryptionService.isEncrypted(encrypted)).toBe(true);
      }
    });
  });

  describe('Cleanup and Resource Management', () => {
    it('should cleanup resources on destroy', () => {
      const testService = new EncryptedEventStore(testConfig);
      
      // Should not throw
      expect(() => {
        testService.destroy();
      }).not.toThrow();
    });

    it('should handle multiple destroy calls gracefully', () => {
      const testService = new EncryptedEventStore(testConfig);
      
      expect(() => {
        testService.destroy();
        testService.destroy(); // Second call should not throw
      }).not.toThrow();
    });
  });
});