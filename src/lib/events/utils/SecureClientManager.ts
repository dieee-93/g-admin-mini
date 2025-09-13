// SecureClientManager.ts - Secure client ID management with cryptographic integrity
// Replaces insecure localStorage with sessionStorage + signature validation

import { SecurityLogger } from './SecureLogger';

interface SecureClientData {
  id: string;
  timestamp: number;
  signature: string;
  version: string;
}

interface ClientManagerConfig {
  storageType: 'sessionStorage' | 'memory';
  enableIntegrityCheck: boolean;
  rotationIntervalMs: number;
  maxAge: number; // Max age in milliseconds
}

const DEFAULT_CONFIG: ClientManagerConfig = {
  storageType: 'sessionStorage',
  enableIntegrityCheck: true,
  rotationIntervalMs: 24 * 60 * 60 * 1000, // 24 hours
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export class SecureClientManager {
  private static readonly STORAGE_KEY = 'g-admin-secure-client-v2';
  private static readonly VERSION = '2.0.0';
  private static config: ClientManagerConfig = DEFAULT_CONFIG;
  private static memoryStorage: SecureClientData | null = null;

  /**
   * Configure the secure client manager
   */
  static configure(config: Partial<ClientManagerConfig>): void {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a cryptographically secure client ID
   */
  static async generateClientId(): Promise<string> {
    // Always use crypto.randomUUID when available, no insecure fallback
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback using crypto.getRandomValues (still secure)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const randomBytes = crypto.getRandomValues(new Uint8Array(16));
      return Array.from(randomBytes, byte => 
        byte.toString(16).padStart(2, '0')
      ).join('');
    }

    // If no crypto available, throw error (security-first approach)
    throw new Error('Cryptographically secure random generation not available');
  }

  /**
   * Get or create a secure client ID
   */
  static async getClientId(): Promise<string> {
    try {
      // Try to retrieve existing valid client ID
      const existing = await this.retrieveClientId();
      if (existing) {
        return existing;
      }

      // Generate new client ID if none exists or invalid
      const newClientId = await this.generateClientId();
      await this.storeClientId(newClientId);
      
      SecurityLogger.anomaly('New client ID generated', { 
        reason: 'No valid existing ID found',
        newId: newClientId.substring(0, 8) + '...' // Log only prefix for security
      });
      
      return newClientId;
    } catch (error) {
      SecurityLogger.threat('Failed to get secure client ID', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Store client ID securely with integrity protection
   */
  static async storeClientId(clientId: string): Promise<void> {
    try {
      const signature = await this.generateSignature(clientId);
      const secureData: SecureClientData = {
        id: clientId,
        timestamp: Date.now(),
        signature,
        version: this.VERSION
      };

      if (this.config.storageType === 'sessionStorage') {
        this.storeInSessionStorage(secureData);
      } else {
        this.memoryStorage = secureData;
      }

      SecurityLogger.anomaly('Client ID stored securely', {
        storageType: this.config.storageType,
        clientIdPrefix: clientId.substring(0, 8) + '...'
      });
    } catch (error) {
      SecurityLogger.threat('Failed to store client ID securely', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Retrieve and validate stored client ID
   */
  static async retrieveClientId(): Promise<string | null> {
    try {
      const secureData = this.config.storageType === 'sessionStorage' 
        ? this.retrieveFromSessionStorage()
        : this.memoryStorage;

      if (!secureData) {
        return null;
      }

      // Validate data structure
      if (!this.isValidSecureData(secureData)) {
        SecurityLogger.violation('Invalid client data structure detected');
        await this.clearStoredData();
        return null;
      }

      // Check age
      if (this.isExpired(secureData)) {
        SecurityLogger.anomaly('Client ID expired, clearing');
        await this.clearStoredData();
        return null;
      }

      // Validate integrity
      if (this.config.enableIntegrityCheck && !await this.validateSignature(secureData)) {
        SecurityLogger.threat('Client ID integrity check failed - possible tampering');
        await this.clearStoredData();
        return null;
      }

      // Check if rotation is needed
      if (this.needsRotation(secureData)) {
        SecurityLogger.anomaly('Client ID rotation needed - clearing for automatic rotation');
        await this.clearStoredData();
        return null; // Force generation of new ID
      }

      return secureData.id;
    } catch (error) {
      SecurityLogger.threat('Error retrieving client ID', { 
        error: error.message 
      });
      await this.clearStoredData();
      return null;
    }
  }

  /**
   * Clear stored client data (for security incidents or rotation)
   */
  static async clearStoredData(): Promise<void> {
    try {
      if (this.config.storageType === 'sessionStorage' && typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(this.STORAGE_KEY);
      } else {
        this.memoryStorage = null;
      }

      SecurityLogger.anomaly('Client data cleared');
    } catch (error) {
      SecurityLogger.threat('Failed to clear client data', { 
        error: error.message 
      });
    }
  }

  /**
   * Force rotation of client ID (for security maintenance)
   */
  static async rotateClientId(): Promise<string> {
    await this.clearStoredData();
    return this.getClientId();
  }

  /**
   * Generate cryptographic signature for integrity protection
   */
  private static async generateSignature(clientId: string): Promise<string> {
    try {
      // Create signing key from environment factors
      const signingMaterial = [
        clientId,
        window.location.origin,
        navigator.userAgent.substring(0, 50), // First 50 chars only
        this.VERSION
      ].join('|');

      // Use SubtleCrypto for secure hashing
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(signingMaterial);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
      }

      // Fallback to simpler hash (still better than no integrity check)
      let hash = 0;
      for (let i = 0; i < signingMaterial.length; i++) {
        const char = signingMaterial.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16).padStart(8, '0');
    } catch (error) {
      SecurityLogger.threat('Failed to generate signature', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Validate signature integrity
   */
  private static async validateSignature(data: SecureClientData): Promise<boolean> {
    try {
      const expectedSignature = await this.generateSignature(data.id);
      return expectedSignature === data.signature;
    } catch (error) {
      SecurityLogger.threat('Signature validation failed', { 
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Store data in sessionStorage with error handling
   */
  private static storeInSessionStorage(data: SecureClientData): void {
    if (typeof sessionStorage === 'undefined') {
      throw new Error('SessionStorage not available');
    }

    try {
      const serialized = JSON.stringify(data);
      sessionStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        SecurityLogger.violation('SessionStorage quota exceeded');
        throw new Error('Storage quota exceeded');
      }
      throw error;
    }
  }

  /**
   * Retrieve data from sessionStorage with error handling
   */
  private static retrieveFromSessionStorage(): SecureClientData | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored);
      return parsed;
    } catch (error) {
      SecurityLogger.violation('Failed to parse stored client data', { 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Validate secure data structure
   */
  private static isValidSecureData(data: any): data is SecureClientData {
    return (
      typeof data === 'object' &&
      typeof data.id === 'string' &&
      typeof data.timestamp === 'number' &&
      typeof data.signature === 'string' &&
      typeof data.version === 'string' &&
      data.id.length > 0 &&
      data.signature.length > 0
    );
  }

  /**
   * Check if client data is expired
   */
  private static isExpired(data: SecureClientData): boolean {
    const age = Date.now() - data.timestamp;
    return age > this.config.maxAge;
  }

  /**
   * Check if client ID needs rotation
   */
  private static needsRotation(data: SecureClientData): boolean {
    const age = Date.now() - data.timestamp;
    return age > this.config.rotationIntervalMs;
  }

  /**
   * Get security status for monitoring
   */
  static async getSecurityStatus(): Promise<{
    hasValidClient: boolean;
    storageType: string;
    lastRotation: Date | null;
    integrityCheckEnabled: boolean;
    needsRotation: boolean;
  }> {
    // Get raw data without triggering automatic rotation
    const secureData = this.config.storageType === 'sessionStorage' 
      ? this.retrieveFromSessionStorage()
      : this.memoryStorage;

    // Check if data is valid (without clearing it)
    const isValid = secureData && 
                   this.isValidSecureData(secureData) && 
                   !this.isExpired(secureData) &&
                   (!this.config.enableIntegrityCheck || await this.validateSignature(secureData));

    return {
      hasValidClient: isValid,
      storageType: this.config.storageType,
      lastRotation: secureData ? new Date(secureData.timestamp) : null,
      integrityCheckEnabled: this.config.enableIntegrityCheck,
      needsRotation: secureData && isValid ? this.needsRotation(secureData) : false
    };
  }

  /**
   * Migrate from legacy localStorage (cleanup old insecure storage)
   */
  static async migrateLegacyStorage(): Promise<{ migrated: boolean; legacy: string | null }> {
    try {
      // Check for legacy localStorage data
      const legacyData = typeof localStorage !== 'undefined' 
        ? localStorage.getItem('g-admin-client-id')
        : null;

      if (legacyData) {
        SecurityLogger.anomaly('Legacy localStorage client ID found during migration', {
          legacyPrefix: legacyData.substring(0, 8) + '...'
        });

        // Clear legacy storage immediately (security-first)
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('g-admin-client-id');
        }

        SecurityLogger.anomaly('Legacy localStorage cleared');
        
        return { migrated: true, legacy: legacyData };
      }

      return { migrated: false, legacy: null };
    } catch (error) {
      SecurityLogger.threat('Error during legacy storage migration', { 
        error: error.message 
      });
      return { migrated: false, legacy: null };
    }
  }
}

export default SecureClientManager;