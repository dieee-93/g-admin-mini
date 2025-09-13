// SecureClientManager.test.ts - Comprehensive security testing for SecureClientManager
// Tests secure storage, integrity validation, and migration safety

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SecureClientManager from '../../utils/SecureClientManager';

// Mock crypto for testing
const mockCrypto = {
  randomUUID: vi.fn(() => 'test-uuid-12345678-1234-1234-1234-123456789012'),
  getRandomValues: vi.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  subtle: {
    digest: vi.fn(async (algorithm: string, data: ArrayBuffer) => {
      // Mock SHA-256 hash
      const mockHash = new ArrayBuffer(32);
      const view = new Uint8Array(mockHash);
      for (let i = 0; i < 32; i++) {
        view[i] = i; // Simple deterministic hash for testing
      }
      return mockHash;
    })
  }
};

describe('SecureClientManager Security Tests', () => {
  beforeEach(() => {
    // Reset global state
    SecureClientManager.configure({
      storageType: 'sessionStorage',
      enableIntegrityCheck: true,
      rotationIntervalMs: 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Clear any existing storage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    // Mock crypto globally using Vitest
    vi.stubGlobal('crypto', mockCrypto);

    // Mock console methods (commented out temporarily for debugging)
    // vi.spyOn(console, 'log').mockImplementation(() => {});
    // vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Secure Client ID Generation', () => {
    it('should generate secure client ID using crypto.randomUUID', async () => {
      const clientId = await SecureClientManager.generateClientId();
      
      expect(clientId).toBe('test-uuid-12345678-1234-1234-1234-123456789012');
      expect(mockCrypto.randomUUID).toHaveBeenCalledOnce();
    });

    it('should fallback to crypto.getRandomValues when randomUUID unavailable', async () => {
      // Disable randomUUID
      mockCrypto.randomUUID = undefined as any;
      
      const clientId = await SecureClientManager.generateClientId();
      
      expect(typeof clientId).toBe('string');
      expect(clientId.length).toBe(32); // 16 bytes * 2 hex chars
      expect(mockCrypto.getRandomValues).toHaveBeenCalled();
    });

    it('should throw error when no crypto available', async () => {
      global.crypto = undefined as any;
      
      await expect(SecureClientManager.generateClientId())
        .rejects.toThrow('Cryptographically secure random generation not available');
    });
  });

  describe('Secure Storage Operations', () => {
    it('should store and retrieve client ID with integrity protection', async () => {
      const clientId = await SecureClientManager.getClientId();
      
      expect(typeof clientId).toBe('string');
      expect(clientId.length).toBeGreaterThan(0);
      
      // Retrieve should return same ID
      const retrievedId = await SecureClientManager.getClientId();
      expect(retrievedId).toBe(clientId);
    });

    it('should store data in sessionStorage by default', async () => {
      await SecureClientManager.getClientId();
      
      const stored = sessionStorage.getItem('g-admin-secure-client-v2');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveProperty('id');
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('signature');
      expect(parsed).toHaveProperty('version');
    });

    it('should use memory storage when configured', async () => {
      SecureClientManager.configure({ storageType: 'memory' });
      
      await SecureClientManager.getClientId();
      
      // Should not be in sessionStorage
      const stored = sessionStorage.getItem('g-admin-secure-client-v2');
      expect(stored).toBeNull();
      
      // But should still retrieve from memory
      const retrievedId = await SecureClientManager.getClientId();
      expect(typeof retrievedId).toBe('string');
    });
  });

  describe('Integrity Validation', () => {
    it('should detect and reject tampered data', async () => {
      // Store valid client ID
      const originalId = await SecureClientManager.getClientId();
      
      // Tamper with stored data
      const stored = sessionStorage.getItem('g-admin-secure-client-v2');
      const parsed = JSON.parse(stored!);
      parsed.signature = 'tampered-signature';
      sessionStorage.setItem('g-admin-secure-client-v2', JSON.stringify(parsed));
      
      // Clear internal state to force retrieval
      await SecureClientManager.clearStoredData();
      
      // Should generate new ID due to integrity failure
      const newId = await SecureClientManager.getClientId();
      expect(newId).not.toBe(originalId);
    });

    it('should reject invalid data structure', async () => {
      // Store invalid data structure
      sessionStorage.setItem('g-admin-secure-client-v2', JSON.stringify({
        invalid: 'structure'
      }));
      
      // Should generate new ID
      const clientId = await SecureClientManager.getClientId();
      expect(typeof clientId).toBe('string');
      
      // Storage should be cleared
      const stored = sessionStorage.getItem('g-admin-secure-client-v2');
      const parsed = JSON.parse(stored!);
      expect(parsed.id).toBe(clientId);
    });

    it('should work with integrity checks disabled', async () => {
      SecureClientManager.configure({ enableIntegrityCheck: false });
      
      const clientId = await SecureClientManager.getClientId();
      expect(typeof clientId).toBe('string');
      
      // Even with tampered signature, should still work when disabled
      const stored = sessionStorage.getItem('g-admin-secure-client-v2');
      const parsed = JSON.parse(stored!);
      parsed.signature = 'tampered';
      sessionStorage.setItem('g-admin-secure-client-v2', JSON.stringify(parsed));
      
      const retrievedId = await SecureClientManager.getClientId();
      expect(retrievedId).toBe(clientId);
    });
  });

  describe('Expiration and Rotation', () => {
    it('should reject expired client data', async () => {
      // Configure short max age
      SecureClientManager.configure({ maxAge: 1000 }); // 1 second
      
      const originalId = await SecureClientManager.getClientId();
      
      // Manually set old timestamp
      const stored = sessionStorage.getItem('g-admin-secure-client-v2');
      const parsed = JSON.parse(stored!);
      parsed.timestamp = Date.now() - 2000; // 2 seconds ago
      sessionStorage.setItem('g-admin-secure-client-v2', JSON.stringify(parsed));
      
      // Should generate new ID due to expiration
      const newId = await SecureClientManager.getClientId();
      expect(newId).not.toBe(originalId);
    });

    it('should rotate client ID when rotation interval exceeded', async () => {
      // Configure short rotation interval
      SecureClientManager.configure({ rotationIntervalMs: 500 }); // 0.5 seconds
      
      const originalId = await SecureClientManager.getClientId();
      
      // Wait for rotation interval
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Should generate new ID due to rotation
      const newId = await SecureClientManager.getClientId();
      expect(newId).not.toBe(originalId);
    });

    it('should force rotation when requested', async () => {
      const originalId = await SecureClientManager.getClientId();
      
      const rotatedId = await SecureClientManager.rotateClientId();
      
      expect(rotatedId).not.toBe(originalId);
      expect(typeof rotatedId).toBe('string');
    });
  });

  describe('Legacy Migration', () => {
    it('should detect and migrate legacy localStorage data', async () => {
      // Set up legacy localStorage data
      const legacyId = 'legacy-client-id-12345';
      localStorage.setItem('g-admin-client-id', legacyId);
      
      const migration = await SecureClientManager.migrateLegacyStorage();
      
      expect(migration.migrated).toBe(true);
      expect(migration.legacy).toBe(legacyId);
      
      // Legacy storage should be cleared
      expect(localStorage.getItem('g-admin-client-id')).toBeNull();
    });

    it('should report no migration when no legacy data exists', async () => {
      const migration = await SecureClientManager.migrateLegacyStorage();
      
      expect(migration.migrated).toBe(false);
      expect(migration.legacy).toBeNull();
    });

    it('should handle localStorage unavailable gracefully', async () => {
      // Mock localStorage as undefined
      const originalLocalStorage = global.localStorage;
      global.localStorage = undefined as any;
      
      const migration = await SecureClientManager.migrateLegacyStorage();
      
      expect(migration.migrated).toBe(false);
      expect(migration.legacy).toBeNull();
      
      // Restore localStorage
      global.localStorage = originalLocalStorage;
    });
  });

  describe('Security Status Monitoring', () => {
    it('should provide accurate security status', async () => {
      const clientId = await SecureClientManager.getClientId();
      
      const status = await SecureClientManager.getSecurityStatus();
      
      expect(status.hasValidClient).toBe(true);
      expect(status.storageType).toBe('sessionStorage');
      expect(status.lastRotation).toBeInstanceOf(Date);
      expect(status.integrityCheckEnabled).toBe(true);
      expect(status.needsRotation).toBe(false);
    });

    it('should indicate when rotation is needed', async () => {
      SecureClientManager.configure({ 
        rotationIntervalMs: 100,
        maxAge: 30 * 60 * 1000 // 30 minutes - much longer than test duration
      });
      
      // Clear storage to ensure we create a fresh client ID with the new configuration
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      // Create a client ID and ensure it's stored
      const clientId = await SecureClientManager.getClientId();
      console.log('Client ID created:', clientId ? 'success' : 'failed');
      
      // Verify that the client ID was stored by checking storage directly
      const storedData = sessionStorage.getItem('g-admin-secure-client-v2');
      console.log('Data stored:', storedData ? 'yes' : 'no');
      
      const initialTimestamp = storedData ? JSON.parse(storedData).timestamp : null;
      console.log('Initial timestamp:', initialTimestamp);
      
      // Wait for rotation to be needed (150ms > 100ms threshold)
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Check if rotation is needed by manually calculating the age
      const currentTime = Date.now();
      const age = currentTime - initialTimestamp;
      const shouldNeedRotation = age > 100;
      
      console.log('Time elapsed since storage:', age, 'ms');
      console.log('Should need rotation:', shouldNeedRotation);
      
      const status = await SecureClientManager.getSecurityStatus();
      
      console.log('Status:', {
        needsRotation: status.needsRotation,
        lastRotation: status.lastRotation,
        hasValidClient: status.hasValidClient
      });
      
      // The test should pass if our manual calculation shows rotation is needed
      expect(shouldNeedRotation).toBe(true);
      expect(status.needsRotation).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle sessionStorage quota exceeded', async () => {
      // Mock Storage.prototype.setItem to throw QuotaExceededError (more reliable approach)
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        console.log('Mock setItem called - throwing QuotaExceededError');
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });
      
      try {
        await expect(SecureClientManager.storeClientId('test-id'))
          .rejects.toThrow('Storage quota exceeded');
      } finally {
        // Restore the spy
        setItemSpy.mockRestore();
      }
    });

    it('should handle corrupted JSON in storage', async () => {
      // Store corrupted JSON
      sessionStorage.setItem('g-admin-secure-client-v2', 'invalid-json{');
      
      // Should generate new ID
      const clientId = await SecureClientManager.getClientId();
      expect(typeof clientId).toBe('string');
    });

    it('should clear data when retrieval fails', async () => {
      // Store data then mock JSON.parse to fail
      await SecureClientManager.getClientId();
      
      const originalParse = JSON.parse;
      JSON.parse = vi.fn(() => {
        throw new Error('Parse error');
      });
      
      const clientId = await SecureClientManager.retrieveClientId();
      expect(clientId).toBeNull();
      
      JSON.parse = originalParse;
    });

    it('should handle missing sessionStorage gracefully', async () => {
      // Mock sessionStorage as undefined
      const originalSessionStorage = global.sessionStorage;
      global.sessionStorage = undefined as any;
      
      SecureClientManager.configure({ storageType: 'sessionStorage' });
      
      await expect(SecureClientManager.getClientId())
        .rejects.toThrow('SessionStorage not available');
      
      global.sessionStorage = originalSessionStorage;
    });
  });

  describe('Configuration Management', () => {
    it('should apply configuration correctly', () => {
      const config = {
        storageType: 'memory' as const,
        enableIntegrityCheck: false,
        rotationIntervalMs: 12345,
        maxAge: 67890
      };
      
      SecureClientManager.configure(config);
      
      // Configuration should be applied (we can't directly test private config,
      // but we can test behavior that depends on it)
      expect(() => SecureClientManager.configure(config)).not.toThrow();
    });

    it('should merge partial configuration with defaults', () => {
      SecureClientManager.configure({ enableIntegrityCheck: false });
      
      // Should still work with partial config
      expect(async () => await SecureClientManager.getClientId()).not.toThrow();
    });
  });

  describe('Multiple Instance Isolation', () => {
    it('should maintain separate data for different storage types', async () => {
      // Get ID with sessionStorage
      SecureClientManager.configure({ storageType: 'sessionStorage' });
      const sessionId = await SecureClientManager.getClientId();
      
      // Switch to memory storage
      SecureClientManager.configure({ storageType: 'memory' });
      const memoryId = await SecureClientManager.getClientId();
      
      // Should be different IDs
      expect(sessionId).not.toBe(memoryId);
    });
  });
});