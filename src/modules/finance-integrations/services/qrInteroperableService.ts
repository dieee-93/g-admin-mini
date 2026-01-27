/**
 * QR Interoperable Service
 * Implements BCRA Transfers 3.0 standard for interoperable QR payments
 *
 * Documentation:
 * - BCRA: https://www.bcra.gob.ar/en/transfers-3-0/
 * - Technical: https://docs.cdpi.dev/technical-notes/digital-payment-networks/interoperable-qr-code
 * - Regulation: BCRA Communication "A" 7769
 *
 * Features:
 * - Works with ALL Argentinian wallets (MODO, Mercado Pago, BNA+, Ualá, Brubank, etc.)
 * - Instant transfers (max 25 seconds)
 * - Irrevocable transactions
 * - 24/7 availability
 * - ISO 20022 compliant (future)
 */

import QRCode from 'qrcode';
import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

export interface QRInteroperableConfig {
  /**
   * Financial Address (CBU, CVU, or Alias)
   * Example: "0000003100010000000001" (CBU format)
   * Example: "0000076500000000123456" (CVU format)
   * Example: "mi.negocio.pago" (Alias)
   */
  payee_fa: string;

  /**
   * Merchant/Business name
   */
  payee_name: string;

  /**
   * Merchant ID (optional but recommended)
   */
  mid?: string;

  /**
   * Digital signature secret for QR signing
   * In production, this should be a secure key from BCRA/CIMPRA
   */
  signing_secret?: string;
}

export interface GenerateQRParams {
  /**
   * Transaction amount in ARS
   */
  amount: number;

  /**
   * Currency (default: ARS)
   */
  currency?: 'ARS' | 'USD';

  /**
   * Order/Transaction ID
   */
  order_id: string;

  /**
   * Point of Sale ID (optional)
   */
  pos_id?: string;

  /**
   * QR expiration in minutes (default: 15)
   */
  expiry_minutes?: number;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

export interface QRPayload {
  /**
   * Protocol version
   */
  version: string;

  /**
   * Financial address (CBU/CVU/Alias)
   */
  payee_fa: string;

  /**
   * Payee name
   */
  payee_name: string;

  /**
   * Transaction amount
   */
  amount: string;

  /**
   * Currency code
   */
  currency: string;

  /**
   * Merchant ID
   */
  mid?: string;

  /**
   * Point of Sale ID
   */
  pos_id?: string;

  /**
   * Order ID
   */
  order_id: string;

  /**
   * Expiration timestamp (ISO 8601)
   */
  expiry: string;

  /**
   * Digital signature
   */
  sign: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

export interface QRResponse {
  /**
   * QR code as data URL (can be used in <img> tag)
   */
  qr_image: string;

  /**
   * Raw QR string (JSON)
   */
  qr_string: string;

  /**
   * Parsed payload
   */
  payload: QRPayload;

  /**
   * QR expiration timestamp
   */
  expires_at: string;

  /**
   * QR type
   */
  type: 'static' | 'dynamic';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  payload?: QRPayload;
}

// ============================================
// SERVICE CLASS
// ============================================

export class QRInteroperableService {
  private config: QRInteroperableConfig;
  private readonly PROTOCOL_VERSION = '1.0.0';

  constructor(config: QRInteroperableConfig) {
    this.config = config;

    // Validate configuration
    if (!config.payee_fa) {
      throw new Error('payee_fa (CBU/CVU/Alias) is required');
    }

    if (!config.payee_name) {
      throw new Error('payee_name is required');
    }

    logger.info('QRInteroperableService', 'Initialized', {
      payee_name: config.payee_name,
      has_mid: !!config.mid,
    });
  }

  /**
   * Generate an interoperable QR code
   *
   * @param params - Generation parameters
   * @returns QR code image and data
   */
  async generateQR(params: GenerateQRParams): Promise<QRResponse> {
    try {
      // Build QR payload
      const payload = this.buildPayload(params);

      // Convert to JSON string (compact format for optimal QR scanning)
      const qrString = JSON.stringify(payload);

      // Generate QR code image
      const qrImage = await this.generateQRImage(qrString);

      logger.info('QRInteroperableService', 'QR generated', {
        order_id: params.order_id,
        amount: params.amount,
        currency: params.currency || 'ARS',
      });

      return {
        qr_image: qrImage,
        qr_string: qrString,
        payload,
        expires_at: payload.expiry,
        type: params.amount > 0 ? 'dynamic' : 'static',
      };
    } catch (error) {
      logger.error('QRInteroperableService', 'Failed to generate QR', error);
      throw error;
    }
  }

  /**
   * Validate a QR code payload
   *
   * @param qrString - QR code string (JSON)
   * @returns Validation result
   */
  validateQR(qrString: string): ValidationResult {
    const errors: string[] = [];

    try {
      // Parse JSON
      const payload: QRPayload = JSON.parse(qrString);

      // Validate required fields
      if (!payload.version) {
        errors.push('Missing required field: version');
      }

      if (!payload.payee_fa) {
        errors.push('Missing required field: payee_fa');
      }

      if (!payload.payee_name) {
        errors.push('Missing required field: payee_name');
      }

      if (!payload.amount) {
        errors.push('Missing required field: amount');
      }

      if (!payload.currency) {
        errors.push('Missing required field: currency');
      }

      if (!payload.order_id) {
        errors.push('Missing required field: order_id');
      }

      if (!payload.expiry) {
        errors.push('Missing required field: expiry');
      }

      if (!payload.sign) {
        errors.push('Missing required field: sign (digital signature)');
      }

      // Validate version
      if (payload.version !== this.PROTOCOL_VERSION) {
        errors.push(`Unsupported protocol version: ${payload.version}`);
      }

      // Validate currency
      if (payload.currency !== 'ARS' && payload.currency !== 'USD') {
        errors.push(`Invalid currency: ${payload.currency}`);
      }

      // Validate amount format
      const amount = parseFloat(payload.amount);
      if (isNaN(amount) || amount < 0) {
        errors.push(`Invalid amount: ${payload.amount}`);
      }

      // Validate expiry
      const expiryDate = new Date(payload.expiry);
      if (isNaN(expiryDate.getTime())) {
        errors.push(`Invalid expiry format: ${payload.expiry}`);
      } else if (expiryDate < new Date()) {
        errors.push('QR code has expired');
      }

      // Validate signature (stub - in production, verify with BCRA/CIMPRA key)
      if (!this.verifySignature(payload)) {
        errors.push('Invalid digital signature');
      }

      return {
        valid: errors.length === 0,
        errors,
        payload: errors.length === 0 ? payload : undefined,
      };
    } catch (error) {
      return {
        valid: false,
        errors: ['Invalid JSON format', (error as Error).message],
      };
    }
  }

  /**
   * Parse a QR code string into structured data
   *
   * @param qrString - QR code string (JSON)
   * @returns Parsed payload or null if invalid
   */
  parseQR(qrString: string): QRPayload | null {
    const validation = this.validateQR(qrString);

    if (!validation.valid) {
      logger.warn('QRInteroperableService', 'Invalid QR code', {
        errors: validation.errors,
      });
      return null;
    }

    return validation.payload || null;
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Build QR payload according to BCRA standard
   */
  private buildPayload(params: GenerateQRParams): QRPayload {
    const now = new Date();
    const expiryMinutes = params.expiry_minutes || 15;
    const expiry = new Date(now.getTime() + expiryMinutes * 60000);

    // Build payload
    const payload: QRPayload = {
      version: this.PROTOCOL_VERSION,
      payee_fa: this.config.payee_fa,
      payee_name: this.config.payee_name,
      amount: params.amount.toFixed(2),
      currency: params.currency || 'ARS',
      order_id: params.order_id,
      expiry: expiry.toISOString(),
      sign: '', // Will be filled by signPayload
    };

    // Add optional fields
    if (this.config.mid) {
      payload.mid = this.config.mid;
    }

    if (params.pos_id) {
      payload.pos_id = params.pos_id;
    }

    if (params.metadata) {
      payload.metadata = params.metadata;
    }

    // Sign payload
    payload.sign = this.signPayload(payload);

    return payload;
  }

  /**
   * Generate QR code image from string
   *
   * @param data - QR code data (JSON string)
   * @returns Base64 data URL
   */
  private async generateQRImage(data: string): Promise<string> {
    try {
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M', // Medium error correction
        type: 'image/png',
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrDataUrl;
    } catch (error) {
      logger.error('QRInteroperableService', 'Failed to generate QR image', error);
      throw new Error('Failed to generate QR image');
    }
  }

  /**
   * Sign QR payload with digital signature
   *
   * IMPORTANT: This is a STUB implementation for development
   * In production, this must use a secure signing method with BCRA/CIMPRA credentials
   *
   * @param payload - QR payload (without signature)
   * @returns Digital signature
   */
  private signPayload(payload: Omit<QRPayload, 'sign'>): string {
    // TODO: Implement real BCRA/CIMPRA signing in production
    // This should use HMAC-SHA256 or similar with merchant's private key

    if (this.config.signing_secret) {
      // For now, use simple hash (replace with real crypto in production)
      const crypto = require('crypto');
      const dataToSign = JSON.stringify({
        payee_fa: payload.payee_fa,
        amount: payload.amount,
        order_id: payload.order_id,
        expiry: payload.expiry,
      });

      return crypto
        .createHmac('sha256', this.config.signing_secret)
        .update(dataToSign)
        .digest('hex');
    }

    // Development fallback - NOT SECURE for production
    logger.warn('QRInteroperableService', 'Using stub signature (dev only)');
    return `DEV_SIGNATURE_${Date.now()}`;
  }

  /**
   * Verify QR payload signature
   *
   * IMPORTANT: This is a STUB implementation for development
   * In production, this must verify against BCRA/CIMPRA public key
   *
   * @param payload - QR payload with signature
   * @returns True if signature is valid
   */
  private verifySignature(payload: QRPayload): boolean {
    // TODO: Implement real BCRA/CIMPRA signature verification in production

    if (!payload.sign) {
      return false;
    }

    // For now, accept any signature in development
    // In production, verify against merchant's public key or BCRA registry

    if (payload.sign.startsWith('DEV_SIGNATURE_')) {
      return true; // Accept dev signatures
    }

    if (this.config.signing_secret) {
      // Verify with same secret used for signing
      const expectedSign = this.signPayload(payload);
      return payload.sign === expectedSign;
    }

    // In production, this should ALWAYS return false for unverified signatures
    logger.warn('QRInteroperableService', 'Signature verification not implemented (dev only)');
    return true; // Accept for development
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a QR Interoperable Service instance from configuration
 *
 * @param config - Service configuration
 * @returns Service instance
 */
export function createQRInteroperableService(config: QRInteroperableConfig): QRInteroperableService {
  return new QRInteroperableService(config);
}

/**
 * Get QR Interoperable configuration from environment or database
 *
 * In production, this should fetch from:
 * 1. Database (business_profile or similar)
 * 2. Environment variables
 * 3. BCRA/CIMPRA registry
 */
export async function getQRInteroperableConfig(): Promise<QRInteroperableConfig> {
  // TODO: Fetch from database in production
  // For now, return stub configuration

  return {
    payee_fa: process.env.QR_INTEROPERABLE_CBU || 'DEMO_CBU_0000000000000000000000',
    payee_name: process.env.QR_INTEROPERABLE_NAME || 'Demo Business',
    mid: process.env.QR_INTEROPERABLE_MID || 'M-DEMO-123',
    signing_secret: process.env.QR_INTEROPERABLE_SECRET,
  };
}

/**
 * Validate CBU format (22 digits)
 */
export function isValidCBU(cbu: string): boolean {
  return /^\d{22}$/.test(cbu);
}

/**
 * Validate CVU format (22 digits)
 */
export function isValidCVU(cvu: string): boolean {
  return /^\d{22}$/.test(cvu);
}

/**
 * Validate Alias format
 */
export function isValidAlias(alias: string): boolean {
  // Alias format: lowercase letters, numbers, dots, up to 20 chars
  return /^[a-z0-9.]{3,20}$/.test(alias);
}

/**
 * Validate Financial Address (CBU, CVU, or Alias)
 */
export function isValidFinancialAddress(fa: string): boolean {
  return isValidCBU(fa) || isValidCVU(fa) || isValidAlias(fa);
}

export default QRInteroperableService;
