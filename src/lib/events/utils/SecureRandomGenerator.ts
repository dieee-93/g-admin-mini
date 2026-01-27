// SecureRandomGenerator.ts - Cryptographically secure random generation
// Eliminates all Math.random() fallbacks for enterprise security compliance

import { SecurityLogger } from './SecureLogger';

/**
 * Secure random ID generator with cryptographically strong entropy
 * Zero fallbacks to Math.random() - fails fast if crypto is unavailable
 */
export class SecureRandomGenerator {
  private static instance: SecureRandomGenerator | null = null;
  private cryptoAvailable: boolean;
  private entropyPool: Uint8Array | null = null;

  constructor() {
    this.cryptoAvailable = this.validateCryptoSupport();

    if (!this.cryptoAvailable) {
      SecurityLogger.threat('Crypto API unavailable - refusing insecure fallback', {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        context: 'SecureRandomGenerator initialization'
      });

      throw new Error(
        'SECURITY: Cryptographically secure random generation unavailable. ' +
        'Math.random() fallbacks are disabled for security compliance.'
      );
    }

    // Initialize entropy pool for high-performance scenarios
    this.initializeEntropyPool();

    SecurityLogger.anomaly('SecureRandomGenerator initialized', {
      cryptoSupport: this.cryptoAvailable,
      entropyPoolSize: this.entropyPool?.length || 0
    });
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SecureRandomGenerator {
    if (!SecureRandomGenerator.instance) {
      SecureRandomGenerator.instance = new SecureRandomGenerator();
    }
    return SecureRandomGenerator.instance;
  }

  /**
   * Generate cryptographically secure event ID
   */
  generateEventId(): string {
    const uuid = SecureRandomGenerator.generateUUID();
    const timestamp = Date.now();
    return `evt_${timestamp}_${uuid}`;
  }

  /**
   * Generate cryptographically secure subscription ID
   */
  generateSubscriptionId(): string {
    const randomPart = this.generateSecureAlphanumeric(9);
    const timestamp = Date.now();
    return `sub_${timestamp}_${randomPart}`;
  }

  /**
   * Generate cryptographically secure trace ID
   */
  generateTraceId(): string {
    const uuid = SecureRandomGenerator.generateUUID();
    const timestamp = Date.now();
    return `trace_${timestamp}_${uuid}`;
  }

  /**
   * Generate cryptographically secure span ID
   */
  generateSpanId(): string {
    const randomPart = this.generateSecureAlphanumeric(9);
    return `span_${randomPart}`;
  }

  /**
   * Generate cryptographically secure test ID
   */
  generateTestId(): string {
    const randomPart = this.generateSecureAlphanumeric(9);
    const timestamp = Date.now();
    return `test_${timestamp}_${randomPart}`;
  }

  /**
   * Generate cryptographically secure transaction ID
   */
  generateTransactionId(): string {
    const randomPart = this.generateSecureAlphanumeric(9).toUpperCase();
    return `TXN-${randomPart}`;
  }

  /**
   * Generate cryptographically secure generic ID
   */
  generateGenericId(prefix: string = 'id'): string {
    const randomPart = this.generateSecureAlphanumeric(12);
    const timestamp = Date.now();
    return `${prefix}_${timestamp}_${randomPart}`;
  }

  /**
   * Generate cryptographically secure ID of specified length
   */
  generateId(length: number): string {
    return this.generateSecureAlphanumeric(length);
  }

  /**
   * Generate cryptographically secure random bytes
   */
  generateBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  /**
   * Generate secure random integer between min and max (inclusive)
   */
  generateSecureInteger(min: number, max: number): number {
    if (min >= max) {
      throw new Error('Min must be less than max');
    }

    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const maxValidValue = Math.floor(256 ** bytesNeeded / range) * range - 1;

    let randomValue: number;
    do {
      const randomBytes = new Uint8Array(bytesNeeded);
      crypto.getRandomValues(randomBytes);

      randomValue = 0;
      for (let i = 0; i < bytesNeeded; i++) {
        randomValue = randomValue * 256 + randomBytes[i];
      }
    } while (randomValue > maxValidValue);

    return min + (randomValue % range);
  }

  /**
   * Generate secure random float between 0 and 1 (exclusive)
   */
  generateSecureFloat(): number {
    // Generate 32-bit random value for IEEE 754 precision
    const randomBytes = new Uint8Array(4);
    crypto.getRandomValues(randomBytes);

    const randomInt = (randomBytes[0] << 24) | (randomBytes[1] << 16) |
      (randomBytes[2] << 8) | randomBytes[3];

    // Convert to float between 0 and 1
    return (randomInt >>> 0) / (2 ** 32);
  }

  /**
   * Generate secure random boolean
   */
  generateSecureBoolean(): boolean {
    const randomByte = new Uint8Array(1);
    crypto.getRandomValues(randomByte);
    return (randomByte[0] & 1) === 1;
  }

  /**
   * Test entropy quality
   */
  testEntropy(sampleSize: number = 1000): {
    quality: 'excellent' | 'good' | 'poor';
    entropy: number;
    uniformity: number;
    predictability: number;
  } {
    const samples: number[] = [];

    for (let i = 0; i < sampleSize; i++) {
      samples.push(this.generateSecureFloat());
    }

    // Calculate entropy metrics
    const entropy = this.calculateEntropy(samples);
    const uniformity = this.calculateUniformity(samples);
    const predictability = this.calculatePredictability(samples);

    let quality: 'excellent' | 'good' | 'poor';
    if (entropy > 0.85 && uniformity > 0.8 && predictability < 0.15) {
      quality = 'excellent';
    } else if (entropy > 0.6 && uniformity > 0.5 && predictability < 0.4) {
      quality = 'good';
    } else {
      quality = 'poor';
    }

    SecurityLogger.anomaly('Entropy test completed', {
      sampleSize,
      quality,
      entropy,
      uniformity,
      predictability
    });

    return { quality, entropy, uniformity, predictability };
  }

  // === PRIVATE METHODS ===

  private validateCryptoSupport(): boolean {
    try {
      // Check if crypto.getRandomValues is available
      if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
        return false;
      }

      // Check if crypto.randomUUID is available
      if (typeof crypto.randomUUID !== 'function') {
        return false;
      }

      // Test crypto functionality
      const testArray = new Uint8Array(16);
      crypto.getRandomValues(testArray);

      const testUUID = crypto.randomUUID();
      if (!testUUID || testUUID.length !== 36) {
        return false;
      }

      return true;
    } catch (error) {
      SecurityLogger.threat('Crypto validation failed', {
        error: error.message,
        context: 'validateCryptoSupport'
      });
      return false;
    }
  }

  private initializeEntropyPool(): void {
    try {
      // Create 1KB entropy pool for high-performance scenarios
      this.entropyPool = new Uint8Array(1024);
      crypto.getRandomValues(this.entropyPool);
    } catch (error) {
      SecurityLogger.threat('Entropy pool initialization failed', {
        error: error.message
      });
      this.entropyPool = null;
    }
  }

  static generateUUID(): string {
    try {
      return crypto.randomUUID();
    } catch (error) {
      SecurityLogger.threat('UUID generation failed', {
        error: error.message
      });
      throw new Error('SECURITY: Failed to generate cryptographically secure UUID');
    }
  }

  private generateSecureAlphanumeric(length: number): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = this.generateSecureInteger(0, chars.length - 1);
      result += chars[randomIndex];
    }

    return result;
  }

  private calculateEntropy(samples: number[]): number {
    // Shannon entropy calculation
    const bins = 100;
    const histogram = new Array(bins).fill(0);

    for (const sample of samples) {
      const bin = Math.floor(sample * bins);
      histogram[Math.min(bin, bins - 1)]++;
    }

    let entropy = 0;
    for (const count of histogram) {
      if (count > 0) {
        const probability = count / samples.length;
        entropy -= probability * Math.log2(probability);
      }
    }

    return entropy / Math.log2(bins); // Normalize to 0-1
  }

  private calculateUniformity(samples: number[]): number {
    // Chi-square test for uniformity
    const bins = 10;
    const expected = samples.length / bins;
    const histogram = new Array(bins).fill(0);

    for (const sample of samples) {
      const bin = Math.floor(sample * bins);
      histogram[Math.min(bin, bins - 1)]++;
    }

    let chiSquare = 0;
    for (const observed of histogram) {
      chiSquare += Math.pow(observed - expected, 2) / expected;
    }

    // Convert to 0-1 scale (lower chi-square = higher uniformity)
    return Math.max(0, 1 - chiSquare / (bins * 10));
  }

  private calculatePredictability(samples: number[]): number {
    // Simple autocorrelation test
    let correlation = 0;
    const lag = 1;

    for (let i = lag; i < samples.length; i++) {
      correlation += Math.abs(samples[i] - samples[i - lag]);
    }

    // Normalize - lower correlation = lower predictability
    return Math.min(1, correlation / (samples.length - lag));
  }

  /**
   * Destroy instance and clear entropy pool
   */
  destroy(): void {
    if (this.entropyPool) {
      this.entropyPool.fill(0); // Clear entropy pool
      this.entropyPool = null;
    }

    SecureRandomGenerator.instance = null;
    SecurityLogger.anomaly('SecureRandomGenerator destroyed');
  }

  // === STATIC CONVENIENCE METHODS ===

  /**
   * Static method for generating random bytes
   */
  static generateBytes(length: number): Uint8Array {
    return SecureRandomGenerator.getInstance().generateBytes(length);
  }

  /**
   * Static method for generating random ID
   */
  static generateId(length: number): string {
    return SecureRandomGenerator.getInstance().generateId(length);
  }
}

export default SecureRandomGenerator;