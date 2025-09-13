// EncryptedEventStore.ts - AES-GCM Encryption for Sensitive Event Payloads
// Enterprise-grade encryption layer for EventBus data protection

import { SecurityLogger } from './SecureLogger';
import SecureRandomGenerator from './SecureRandomGenerator';

/**
 * Configuration for encrypted event storage
 */
export interface EncryptionConfig {
  enabled: boolean;
  keyRotationIntervalMs: number;      // Key rotation frequency
  sensitivePatterns: string[];        // Event patterns requiring encryption
  compressionEnabled: boolean;        // Compress before encryption
  keyDerivationIterations: number;    // PBKDF2 iterations
}

/**
 * Encryption metadata stored with each encrypted payload
 */
export interface EncryptionMetadata {
  algorithm: string;           // AES-GCM
  keyVersion: string;          // Key rotation version
  iv: string;                 // Base64 initialization vector
  authTag: string;            // Base64 authentication tag
  compressed: boolean;        // Whether payload was compressed
  timestamp: number;          // Encryption timestamp
}

/**
 * Encrypted payload structure
 */
export interface EncryptedPayload {
  encrypted: string;              // Base64 encrypted data
  metadata: EncryptionMetadata;   // Encryption metadata
  originalSize: number;           // Original payload size
  encryptedSize: number;         // Encrypted payload size
}

/**
 * Key management for encryption operations
 */
class EncryptionKeyManager {
  private static instance: EncryptionKeyManager | null = null;
  private masterKey: CryptoKey | null = null;
  private keyVersion: string = '';
  private keyRotationTimer: number | null = null;
  private config: EncryptionConfig;

  constructor(config: EncryptionConfig) {
    this.config = config;
    this.keyVersion = this.generateKeyVersion();
  }

  static getInstance(config?: EncryptionConfig): EncryptionKeyManager {
    if (!EncryptionKeyManager.instance && config) {
      EncryptionKeyManager.instance = new EncryptionKeyManager(config);
    }
    if (!EncryptionKeyManager.instance) {
      throw new Error('EncryptionKeyManager not initialized - config required for first use');
    }
    return EncryptionKeyManager.instance;
  }

  /**
   * Initialize encryption with master key derivation
   */
  async initialize(passphrase?: string): Promise<void> {
    try {
      // Derive master key from passphrase or generate new one
      if (passphrase) {
        this.masterKey = await this.deriveKeyFromPassphrase(passphrase);
      } else {
        this.masterKey = await this.generateMasterKey();
      }

      // Setup key rotation if enabled
      if (this.config.keyRotationIntervalMs > 0) {
        this.setupKeyRotation();
      }

      SecurityLogger.security('EncryptionKeyManager initialized', {
        keyVersion: this.keyVersion,
        rotationInterval: this.config.keyRotationIntervalMs
      });
    } catch (error) {
      SecurityLogger.anomaly('Failed to initialize encryption key manager', { error });
      throw new Error('Encryption initialization failed');
    }
  }

  /**
   * Get current master key for encryption/decryption
   */
  async getMasterKey(): Promise<CryptoKey> {
    if (!this.masterKey) {
      throw new Error('Encryption key not initialized');
    }
    return this.masterKey;
  }

  /**
   * Get current key version
   */
  getKeyVersion(): string {
    return this.keyVersion;
  }

  /**
   * Generate new master key using Web Crypto API
   */
  private async generateMasterKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      false, // Not extractable for security
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Derive key from passphrase using PBKDF2
   */
  private async deriveKeyFromPassphrase(passphrase: string): Promise<CryptoKey> {
    // Generate salt for PBKDF2
    const salt = SecureRandomGenerator.generateBytes(16);
    
    // Import passphrase as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive AES-GCM key
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.config.keyDerivationIterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256
      },
      false, // Not extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate unique key version identifier
   */
  private generateKeyVersion(): string {
    return `key_${Date.now()}_${SecureRandomGenerator.generateId(8)}`;
  }

  /**
   * Setup automatic key rotation
   */
  private setupKeyRotation(): void {
    this.keyRotationTimer = window.setInterval(async () => {
      try {
        await this.rotateKey();
      } catch (error) {
        SecurityLogger.anomaly('Key rotation failed', { error });
      }
    }, this.config.keyRotationIntervalMs);
  }

  /**
   * Rotate encryption key
   */
  private async rotateKey(): Promise<void> {
    const oldKeyVersion = this.keyVersion;
    
    // Generate new key and version
    this.masterKey = await this.generateMasterKey();
    this.keyVersion = this.generateKeyVersion();

    SecurityLogger.security('Encryption key rotated', {
      oldKeyVersion,
      newKeyVersion: this.keyVersion
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.keyRotationTimer) {
      clearInterval(this.keyRotationTimer);
      this.keyRotationTimer = null;
    }
    
    this.masterKey = null;
    EncryptionKeyManager.instance = null;
  }
}

/**
 * AES-GCM encryption service for sensitive event payloads
 */
export class EncryptedEventStore {
  private keyManager: EncryptionKeyManager;
  private config: EncryptionConfig;
  private compressionSupported: boolean;

  constructor(config: Partial<EncryptionConfig> = {}) {
    this.config = {
      enabled: true,
      keyRotationIntervalMs: 24 * 60 * 60 * 1000, // 24 hours
      sensitivePatterns: [
        'payment.*',
        'customer.pii.*',
        'auth.*',
        'sensitive.*',
        '*.password.*',
        '*.token.*',
        '*.secret.*'
      ],
      compressionEnabled: true,
      keyDerivationIterations: 100000,
      ...config
    };

    this.keyManager = EncryptionKeyManager.getInstance(this.config);
    this.compressionSupported = this.checkCompressionSupport();
  }

  /**
   * Initialize the encryption service
   */
  async initialize(passphrase?: string): Promise<void> {
    if (!this.config.enabled) {
      SecurityLogger.info('Encryption disabled - skipping initialization');
      return;
    }

    await this.keyManager.initialize(passphrase);
    
    SecurityLogger.security('EncryptedEventStore initialized', {
      enabled: this.config.enabled,
      sensitivePatterns: this.config.sensitivePatterns.length,
      compression: this.compressionSupported && this.config.compressionEnabled
    });
  }

  /**
   * Determine if event payload should be encrypted
   */
  shouldEncrypt(eventPattern: string): boolean {
    if (!this.config.enabled) {
      return false;
    }

    return this.config.sensitivePatterns.some(pattern => {
      // Convert pattern to regex (simple glob matching)
      const regexPattern = pattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`, 'i');
      return regex.test(eventPattern);
    });
  }

  /**
   * Encrypt sensitive event payload using AES-GCM
   */
  async encryptPayload(payload: any, eventPattern: string): Promise<EncryptedPayload> {
    if (!this.shouldEncrypt(eventPattern)) {
      throw new Error('Payload does not require encryption');
    }

    try {
      const startTime = performance.now();
      
      // Serialize payload
      let serializedPayload = JSON.stringify(payload);
      const originalSize = new TextEncoder().encode(serializedPayload).length;

      // Optional compression
      let compressed = false;
      if (this.config.compressionEnabled && this.compressionSupported) {
        const compressedData = await this.compressData(serializedPayload);
        if (compressedData.length < originalSize * 0.9) { // Only use if >10% savings
          serializedPayload = compressedData;
          compressed = true;
        }
      }

      // Generate IV (Initialization Vector) - must be unique for each encryption
      const iv = SecureRandomGenerator.generateBytes(12); // 96-bit IV for GCM

      // Get master key
      const masterKey = await this.keyManager.getMasterKey();

      // Encrypt using AES-GCM
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128 // 128-bit authentication tag
        },
        masterKey,
        new TextEncoder().encode(serializedPayload)
      );

      // Extract authentication tag (last 16 bytes)
      const encrypted = encryptedBuffer.slice(0, -16);
      const authTag = encryptedBuffer.slice(-16);

      // Create result
      const encryptedPayload: EncryptedPayload = {
        encrypted: this.arrayBufferToBase64(encrypted),
        metadata: {
          algorithm: 'AES-GCM',
          keyVersion: this.keyManager.getKeyVersion(),
          iv: this.arrayBufferToBase64(iv),
          authTag: this.arrayBufferToBase64(authTag),
          compressed,
          timestamp: Date.now()
        },
        originalSize,
        encryptedSize: encryptedBuffer.byteLength
      };

      const encryptionTime = performance.now() - startTime;

      SecurityLogger.security('Payload encrypted', {
        eventPattern,
        originalSize,
        encryptedSize: encryptedBuffer.byteLength,
        compressionRatio: compressed ? (originalSize / serializedPayload.length).toFixed(2) : null,
        encryptionTimeMs: encryptionTime.toFixed(2)
      });

      return encryptedPayload;
    } catch (error) {
      SecurityLogger.anomaly('Encryption failed', { eventPattern, error });
      throw new Error(`Failed to encrypt payload: ${error}`);
    }
  }

  /**
   * Decrypt encrypted event payload
   */
  async decryptPayload(encryptedPayload: EncryptedPayload): Promise<any> {
    try {
      const startTime = performance.now();
      
      // Validate encryption metadata
      if (encryptedPayload.metadata.algorithm !== 'AES-GCM') {
        throw new Error(`Unsupported encryption algorithm: ${encryptedPayload.metadata.algorithm}`);
      }

      // Get master key
      const masterKey = await this.keyManager.getMasterKey();

      // Reconstruct encrypted buffer with auth tag
      const encrypted = this.base64ToArrayBuffer(encryptedPayload.encrypted);
      const authTag = this.base64ToArrayBuffer(encryptedPayload.metadata.authTag);
      const iv = this.base64ToArrayBuffer(encryptedPayload.metadata.iv);

      // Combine encrypted data and auth tag
      const encryptedWithTag = new Uint8Array(encrypted.byteLength + authTag.byteLength);
      encryptedWithTag.set(new Uint8Array(encrypted));
      encryptedWithTag.set(new Uint8Array(authTag), encrypted.byteLength);

      // Decrypt using AES-GCM
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128
        },
        masterKey,
        encryptedWithTag
      );

      // Convert to string
      let decryptedString = new TextDecoder().decode(decryptedBuffer);

      // Decompress if needed
      if (encryptedPayload.metadata.compressed) {
        decryptedString = await this.decompressData(decryptedString);
      }

      // Parse JSON
      const payload = JSON.parse(decryptedString);

      const decryptionTime = performance.now() - startTime;

      SecurityLogger.security('Payload decrypted', {
        keyVersion: encryptedPayload.metadata.keyVersion,
        originalSize: encryptedPayload.originalSize,
        compressed: encryptedPayload.metadata.compressed,
        decryptionTimeMs: decryptionTime.toFixed(2)
      });

      return payload;
    } catch (error) {
      SecurityLogger.anomaly('Decryption failed', { 
        keyVersion: encryptedPayload.metadata?.keyVersion,
        error 
      });
      throw new Error(`Failed to decrypt payload: ${error}`);
    }
  }

  /**
   * Check if payload is encrypted
   */
  isEncrypted(payload: any): payload is EncryptedPayload {
    return payload !== null && 
           payload !== undefined &&
           typeof payload === 'object' &&
           typeof payload.encrypted === 'string' &&
           payload.metadata &&
           typeof payload.metadata.algorithm === 'string';
  }

  /**
   * Get encryption statistics
   */
  getStats(): {
    enabled: boolean;
    keyVersion: string;
    sensitivePatterns: number;
    compressionEnabled: boolean;
  } {
    return {
      enabled: this.config.enabled,
      keyVersion: this.keyManager.getKeyVersion(),
      sensitivePatterns: this.config.sensitivePatterns.length,
      compressionEnabled: this.config.compressionEnabled && this.compressionSupported
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if compression is supported
   */
  private checkCompressionSupport(): boolean {
    return typeof CompressionStream !== 'undefined' && 
           typeof DecompressionStream !== 'undefined';
  }

  /**
   * Compress data using gzip
   */
  private async compressData(data: string): Promise<string> {
    if (!this.compressionSupported) {
      return data;
    }

    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    // Write data
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(data));
    await writer.close();

    // Read compressed result
    const chunks: Uint8Array[] = [];
    let done = false;
    
    while (!done) {
      const { value, done: isDone } = await reader.read();
      done = isDone;
      if (value) {
        chunks.push(value);
      }
    }

    // Combine chunks and convert to base64
    const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      compressed.set(chunk, offset);
      offset += chunk.length;
    }

    return this.arrayBufferToBase64(compressed.buffer);
  }

  /**
   * Decompress data using gzip
   */
  private async decompressData(compressedData: string): Promise<string> {
    if (!this.compressionSupported) {
      return compressedData;
    }

    const compressedBuffer = this.base64ToArrayBuffer(compressedData);
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    // Write compressed data
    await writer.write(new Uint8Array(compressedBuffer));
    await writer.close();

    // Read decompressed result
    const chunks: Uint8Array[] = [];
    let done = false;
    
    while (!done) {
      const { value, done: isDone } = await reader.read();
      done = isDone;
      if (value) {
        chunks.push(value);
      }
    }

    // Combine chunks and convert to string
    const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      decompressed.set(chunk, offset);
      offset += chunk.length;
    }

    return new TextDecoder().decode(decompressed);
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Destroy encryption service and cleanup resources
   */
  destroy(): void {
    this.keyManager.destroy();
    SecurityLogger.security('EncryptedEventStore destroyed');
  }

  /**
   * Reset singleton instances for testing
   */
  static resetForTesting(): void {
    EncryptionKeyManager.instance = null;
  }
}

export default EncryptedEventStore;