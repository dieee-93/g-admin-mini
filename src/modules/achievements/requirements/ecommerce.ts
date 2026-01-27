/**
 * E-COMMERCE REQUIREMENTS
 * 
 * Requirements obligatorios para async_operations capability.
 * 
 * ⚠️ CRÍTICO: Estos requirements BLOQUEAN operaciones comerciales.
 * No se puede activar tienda online sin completar todos estos requisitos.
 * 
 * Validación: Toggle "Tienda Pública"
 * Acción bloqueada: 'ecommerce:toggle_public'
 * 
 * @version 1.0.0
 */

import type { Achievement } from '../types';

export const ECOMMERCE_MANDATORY: Achievement[] = [
  {
    id: 'ecommerce_business_name',
    tier: 'mandatory',
    capability: 'async_operations',
    name: 'Configurar nombre comercial',
    icon: '🏪',
    category: 'setup',
    blocksAction: 'ecommerce:toggle_public',
    validator: (ctx) => !!ctx.profile?.businessName?.trim(),
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 2,
  },
  {
    id: 'ecommerce_logo',
    tier: 'mandatory',
    capability: 'async_operations',
    name: 'Subir logo del negocio',
    description: 'Tu tienda necesita identidad visual',
    icon: '🎨',
    category: 'setup',
    blocksAction: 'ecommerce:toggle_public',
    validator: (ctx) => !!ctx.profile?.logoUrl,
    redirectUrl: '/admin/settings/branding',
    estimatedMinutes: 5,
  },
  {
    id: 'ecommerce_min_products',
    tier: 'mandatory',
    capability: 'async_operations',
    name: 'Publicar al menos 10 productos',
    description: 'Una tienda necesita variedad',
    icon: '📦',
    category: 'setup',
    blocksAction: 'ecommerce:toggle_public',
    validator: (ctx) => {
      const published = ctx.products?.filter((p) => p.is_published) || [];
      return published.length >= 10;
    },
    redirectUrl: '/admin/supply-chain/products',
    estimatedMinutes: 30,
  },
  {
    id: 'ecommerce_payment_gateway',
    tier: 'mandatory',
    capability: 'async_operations',
    name: 'Integrar pasarela de pago online',
    description: 'MercadoPago, MODO u otra plataforma',
    icon: '💳',
    category: 'setup',
    blocksAction: 'ecommerce:toggle_public',
    validator: (ctx) => {
      return !!(ctx.paymentGateways?.some((g) => g.is_active && g.type === 'online'));
    },
    redirectUrl: '/admin/finance/integrations',
    estimatedMinutes: 15,
  },
  {
    id: 'ecommerce_shipping_policy',
    tier: 'mandatory',
    capability: 'async_operations',
    name: 'Definir política de envío/retiro',
    description: 'Cómo entregarás los productos',
    icon: '🚚',
    category: 'setup',
    blocksAction: 'ecommerce:toggle_public',
    validator: (ctx) => !!ctx.profile?.shippingPolicy,
    redirectUrl: '/admin/settings/shipping',
    estimatedMinutes: 10,
  },
  {
    id: 'ecommerce_terms_conditions',
    tier: 'mandatory',
    capability: 'async_operations',
    name: 'Publicar términos y condiciones',
    description: 'Obligatorio legalmente',
    icon: '📄',
    category: 'setup',
    blocksAction: 'ecommerce:toggle_public',
    validator: (ctx) => !!ctx.profile?.termsAndConditions,
    redirectUrl: '/admin/settings/legal',
    estimatedMinutes: 20,
  },
  {
    id: 'ecommerce_contact_info',
    tier: 'mandatory',
    capability: 'async_operations',
    name: 'Información de contacto',
    description: 'Email, teléfono para consultas',
    icon: '📞',
    category: 'setup',
    blocksAction: 'ecommerce:toggle_public',
    validator: (ctx) => {
      return !!(ctx.profile?.contactEmail && ctx.profile?.contactPhone);
    },
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 3,
  },
];
