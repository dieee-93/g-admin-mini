-- Migration: Add QR Interoperable Payment Method
-- Date: 2025-12-29
-- Description: Adds BCRA Transfers 3.0 compliant QR payment method

-- ============================================
-- ADD QR INTEROPERABLE PAYMENT METHOD
-- ============================================

-- Insert QR Interoperable payment method
INSERT INTO payment_methods_config (
  name,
  code,
  display_name,
  description,
  icon,
  requires_gateway,
  is_active,
  sort_order,
  config,
  created_at,
  updated_at
)
VALUES (
  'QR Interoperable',
  'qr_interoperable',
  'QR Interoperable (BCRA)',
  'QR universal que funciona con TODAS las apps argentinas: MODO, Mercado Pago, BNA+, Ualá, Brubank, etc. Estándar BCRA Transfers 3.0',
  'qr-code',
  false, -- No requiere gateway externo, se genera localmente
  true,  -- Activo por defecto
  6,     -- Después de qr_payment (5)
  jsonb_build_object(
    'type', 'qr_interoperable',
    'standard', 'BCRA Transfers 3.0',
    'protocol_version', '1.0.0',
    'supports_currencies', jsonb_build_array('ARS', 'USD'),
    'default_expiry_minutes', 15,
    'features', jsonb_build_array(
      'instant_transfer',
      'irrevocable',
      '24_7_availability',
      'multi_wallet_support'
    )
  ),
  NOW(),
  NOW()
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  requires_gateway = EXCLUDED.requires_gateway,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  config = EXCLUDED.config,
  updated_at = NOW();

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Verify the method was created
SELECT
  id,
  name,
  code,
  display_name,
  requires_gateway,
  is_active,
  sort_order,
  config
FROM payment_methods_config
WHERE code = 'qr_interoperable';

-- ============================================
-- NOTES
-- ============================================

/*
QR Interoperable Features:
- Works with ALL Argentinian wallets (MODO, Mercado Pago, BNA+, Ualá, Brubank, etc.)
- Complies with BCRA Communication "A" 7769
- Instant transfers (max 25 seconds)
- Irrevocable transactions
- 24/7 availability
- No external gateway needed (generated locally)
- Supports ARS and USD currencies
- Default QR expiration: 15 minutes
- ISO 20022 compliant (future)

Technical Documentation:
- BCRA: https://www.bcra.gob.ar/en/transfers-3.0/
- Technical Spec: https://docs.cdpi.dev/technical-notes/digital-payment-networks/interoperable-qr-code
- Regulation: BCRA Communication "A" 7769

Implementation:
- Service: src/modules/finance-integrations/services/qrInteroperableService.ts
- API Endpoint: api/qr/generate-interoperable.ts
- Payment Type: QR_INTEROPERABLE (to be added to payment_type enum)
*/
