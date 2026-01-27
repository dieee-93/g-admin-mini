/**
 * TAKEAWAY REQUIREMENTS
 * 
 * Requirements obligatorios para pickup_orders capability.
 * 
 * ⚠️ CRÍTICO: Estos requirements BLOQUEAN operaciones comerciales.
 * No se puede activar TakeAway público sin completar todos estos requisitos.
 * 
 * Validación: Toggle "Aceptar Pedidos TakeAway"
 * Acción bloqueada: 'takeaway:toggle_public'
 * 
 * @version 1.0.0
 */

import type { Achievement } from '../types';

export const TAKEAWAY_MANDATORY: Achievement[] = [
  {
    id: 'takeaway_business_name',
    tier: 'mandatory',
    capability: 'pickup_orders',
    name: 'Configurar nombre del negocio',
    description: 'Define el nombre comercial de tu negocio',
    icon: '🏪',
    category: 'setup',
    blocksAction: 'takeaway:toggle_public',
    validator: (ctx) => !!ctx.profile?.businessName?.trim(),
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 2,
  },
  {
    id: 'takeaway_address',
    tier: 'mandatory',
    capability: 'pickup_orders',
    name: 'Configurar dirección del local',
    description: 'Los clientes necesitan saber dónde retirar',
    icon: '📍',
    category: 'setup',
    blocksAction: 'takeaway:toggle_public',
    validator: (ctx) => !!ctx.profile?.address,
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 3,
  },
  {
    id: 'takeaway_pickup_hours',
    tier: 'mandatory',
    capability: 'pickup_orders',
    name: 'Definir horarios de retiro',
    description: 'Establece cuándo pueden retirar los pedidos',
    icon: '🕐',
    category: 'setup',
    blocksAction: 'takeaway:toggle_public',
    validator: (ctx) => {
      return !!(
        ctx.profile?.pickupHours && Object.keys(ctx.profile.pickupHours).length > 0
      );
    },
    redirectUrl: '/admin/settings/hours',
    estimatedMinutes: 5,
  },
  {
    id: 'takeaway_min_products',
    tier: 'mandatory',
    capability: 'pickup_orders',
    name: 'Publicar al menos 5 productos',
    description: 'Tu catálogo debe tener productos disponibles',
    icon: '📦',
    category: 'setup',
    blocksAction: 'takeaway:toggle_public',
    validator: (ctx) => {
      const published = ctx.products?.filter((p) => p.is_published) || [];
      return published.length >= 5;
    },
    redirectUrl: '/admin/supply-chain/products',
    estimatedMinutes: 15,
  },
  {
    id: 'takeaway_payment_method',
    tier: 'mandatory',
    capability: 'pickup_orders',
    name: 'Configurar método de pago',
    description: 'Define cómo recibirás los pagos',
    icon: '💳',
    category: 'setup',
    blocksAction: 'takeaway:toggle_public',
    validator: (ctx) => (ctx.paymentMethods?.length || 0) > 0,
    redirectUrl: '/admin/settings/payment-methods',
    estimatedMinutes: 10,
  },
];
