/**
 * DINE-IN REQUIREMENTS
 * 
 * Requirements obligatorios para onsite_service capability.
 * 
 * ⚠️ CRÍTICO: Estos requirements BLOQUEAN operaciones comerciales.
 * No se puede abrir turno operativo sin completar todos estos requisitos.
 * 
 * Validación: Botón "Abrir Turno"
 * Acción bloqueada: 'dinein:open_shift'
 * 
 * @version 1.0.0
 */

import type { Achievement } from '../types';

export const DINEIN_MANDATORY: Achievement[] = [
  {
    id: 'dinein_business_name',
    tier: 'mandatory',
    capability: 'onsite_service',
    name: 'Configurar nombre del negocio',
    icon: '🏪',
    category: 'setup',
    blocksAction: 'dinein:open_shift',
    validator: (ctx) => !!ctx.profile?.businessName?.trim(),
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 2,
  },
  {
    id: 'dinein_operating_hours',
    tier: 'mandatory',
    capability: 'onsite_service',
    name: 'Definir horarios de atención',
    icon: '🕐',
    category: 'setup',
    blocksAction: 'dinein:open_shift',
    validator: (ctx) => {
      return !!(
        ctx.profile?.operatingHours &&
        Object.keys(ctx.profile.operatingHours).length > 0
      );
    },
    redirectUrl: '/admin/settings/hours',
    estimatedMinutes: 5,
  },
  {
    id: 'dinein_tables_configured',
    tier: 'mandatory',
    capability: 'onsite_service',
    name: 'Configurar al menos 1 mesa',
    icon: '🪑',
    category: 'setup',
    blocksAction: 'dinein:open_shift',
    validator: (ctx) => (ctx.tables?.length || 0) >= 1,
    redirectUrl: '/admin/operations/fulfillment/onsite',
    estimatedMinutes: 8,
  },
  {
    id: 'dinein_active_staff',
    tier: 'mandatory',
    capability: 'onsite_service',
    name: 'Registrar al menos 1 empleado activo',
    icon: '👤',
    category: 'setup',
    blocksAction: 'dinein:open_shift',
    validator: (ctx) => {
      const active = ctx.staff?.filter((s) => s.is_active) || [];
      return active.length >= 1;
    },
    redirectUrl: '/admin/resources/team',
    estimatedMinutes: 10,
  },
  {
    id: 'dinein_min_products',
    tier: 'mandatory',
    capability: 'onsite_service',
    name: 'Publicar al menos 3 productos en menú',
    icon: '📋',
    category: 'setup',
    blocksAction: 'dinein:open_shift',
    validator: (ctx) => {
      const published = ctx.products?.filter((p) => p.is_published) || [];
      return published.length >= 3;
    },
    redirectUrl: '/admin/supply-chain/products',
    estimatedMinutes: 15,
  },
  {
    id: 'dinein_payment_method',
    tier: 'mandatory',
    capability: 'onsite_service',
    name: 'Configurar método de pago',
    icon: '💳',
    category: 'setup',
    blocksAction: 'dinein:open_shift',
    validator: (ctx) => (ctx.paymentMethods?.length || 0) > 0,
    redirectUrl: '/admin/finance/integrations',
    estimatedMinutes: 10,
  },
];
