/**
 * DELIVERY REQUIREMENTS
 * 
 * Requirements obligatorios para delivery_shipping capability.
 * 
 * ⚠️ CRÍTICO: Estos requirements BLOQUEAN operaciones comerciales.
 * No se puede habilitar delivery sin completar todos estos requisitos.
 * 
 * Validación: Habilitar opción en checkout
 * Acción bloqueada: 'delivery:enable_public'
 * 
 * @version 1.0.0
 */

import type { Achievement } from '../types';

export const DELIVERY_MANDATORY: Achievement[] = [
  {
    id: 'delivery_zones',
    tier: 'mandatory',
    capability: 'delivery_shipping',
    name: 'Configurar zonas de cobertura',
    description: 'Define dónde entregarás',
    icon: '🗺️',
    category: 'setup',
    blocksAction: 'delivery:enable_public',
    validator: (ctx) => (ctx.deliveryZones?.length || 0) > 0,
    redirectUrl: '/admin/settings/delivery',
    estimatedMinutes: 15,
  },
  {
    id: 'delivery_rates',
    tier: 'mandatory',
    capability: 'delivery_shipping',
    name: 'Definir tarifas por zona',
    description: 'Cuánto costará el envío',
    icon: '💰',
    category: 'setup',
    blocksAction: 'delivery:enable_public',
    validator: (ctx) => {
      return !!(ctx.deliveryZones?.every((z) => z.deliveryFee !== undefined));
    },
    redirectUrl: '/admin/settings/delivery',
    estimatedMinutes: 10,
  },
  {
    id: 'delivery_active_courier',
    tier: 'mandatory',
    capability: 'delivery_shipping',
    name: 'Registrar al menos 1 repartidor',
    description: 'Necesitas personal para entregas',
    icon: '🏍️',
    category: 'setup',
    blocksAction: 'delivery:enable_public',
    validator: (ctx) => {
      const couriers =
        ctx.staff?.filter((s) => s.is_active && s.role === 'courier') || [];
      return couriers.length >= 1;
    },
    redirectUrl: '/admin/resources/team',
    estimatedMinutes: 10,
  },
  {
    id: 'delivery_hours',
    tier: 'mandatory',
    capability: 'delivery_shipping',
    name: 'Definir horarios de delivery',
    description: 'Cuándo entregarás pedidos',
    icon: '🕐',
    category: 'setup',
    blocksAction: 'delivery:enable_public',
    validator: (ctx) => {
      return !!(
        ctx.profile?.deliveryHours &&
        Object.keys(ctx.profile.deliveryHours).length > 0
      );
    },
    redirectUrl: '/admin/settings/hours',
    estimatedMinutes: 5,
  },
];
