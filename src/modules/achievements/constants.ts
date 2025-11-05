/**
 * ACHIEVEMENTS & REQUIREMENTS CONSTANTS
 *
 * Arrays de requirements organizados por capability y tier.
 *
 * SISTEMA DE 3 CAPAS:
 * - MANDATORY: Requisitos obligatorios que bloquean operaciones comerciales
 * - SUGGESTED: Mejoras sugeridas (desarrollo futuro - Fase 8+)
 * - CUMULATIVE: Logros acumulativos de gamificación
 *
 * @version 1.0.0
 * @see docs/05-development/REQUIREMENTS_ACHIEVEMENTS_SYSTEM_DESIGN.md
 */

import type { Achievement, CapabilityNames, CapabilityIcons } from './types';

// ============================================
// CAPA 1: MANDATORY ACHIEVEMENTS
// ============================================

/**
 * TAKEAWAY REQUIREMENTS (Capability: pickup_counter)
 *
 * Requisitos obligatorios para activar TakeAway público.
 * Validación en: Toggle "Aceptar Pedidos TakeAway"
 */
export const TAKEAWAY_MANDATORY: Achievement[] = [
  {
    id: 'takeaway_business_name',
    tier: 'mandatory',
    capability: 'pickup_counter',
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
    capability: 'pickup_counter',
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
    capability: 'pickup_counter',
    name: 'Definir horarios de retiro',
    description: 'Establece cuándo pueden retirar los pedidos',
    icon: '🕐',
    category: 'setup',
    blocksAction: 'takeaway:toggle_public',
    validator: (ctx) => {
      return (
        ctx.profile?.pickupHours && Object.keys(ctx.profile.pickupHours).length > 0
      );
    },
    redirectUrl: '/admin/settings/hours',
    estimatedMinutes: 5,
  },
  {
    id: 'takeaway_min_products',
    tier: 'mandatory',
    capability: 'pickup_counter',
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
    capability: 'pickup_counter',
    name: 'Configurar método de pago',
    description: 'Define cómo recibirás los pagos',
    icon: '💳',
    category: 'setup',
    blocksAction: 'takeaway:toggle_public',
    validator: (ctx) => (ctx.paymentMethods?.length || 0) > 0,
    redirectUrl: '/admin/finance/integrations',
    estimatedMinutes: 10,
  },
];

/**
 * DINE-IN REQUIREMENTS (Capability: onsite_service)
 *
 * Requisitos obligatorios para abrir turno operativo.
 * Validación en: Botón "Abrir Turno"
 */
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
      return (
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
    redirectUrl: '/admin/resources/staff',
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

/**
 * E-COMMERCE REQUIREMENTS (Capability: online_store)
 *
 * Requisitos obligatorios para activar tienda online.
 * Validación en: Toggle "Tienda Pública"
 */
export const ECOMMERCE_MANDATORY: Achievement[] = [
  {
    id: 'ecommerce_business_name',
    tier: 'mandatory',
    capability: 'online_store',
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
    capability: 'online_store',
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
    capability: 'online_store',
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
    capability: 'online_store',
    name: 'Integrar pasarela de pago online',
    description: 'MercadoPago, MODO u otra plataforma',
    icon: '💳',
    category: 'setup',
    blocksAction: 'ecommerce:toggle_public',
    validator: (ctx) => {
      return ctx.paymentGateways?.some((g) => g.is_active && g.type === 'online');
    },
    redirectUrl: '/admin/finance/integrations',
    estimatedMinutes: 15,
  },
  {
    id: 'ecommerce_shipping_policy',
    tier: 'mandatory',
    capability: 'online_store',
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
    capability: 'online_store',
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
    capability: 'online_store',
    name: 'Información de contacto',
    description: 'Email, teléfono para consultas',
    icon: '📞',
    category: 'setup',
    blocksAction: 'ecommerce:toggle_public',
    validator: (ctx) => {
      return !!ctx.profile?.contactEmail && !!ctx.profile?.contactPhone;
    },
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 3,
  },
];

/**
 * DELIVERY REQUIREMENTS (Capability: delivery_shipping)
 *
 * Requisitos obligatorios para habilitar delivery.
 * Validación en: Habilitar opción en checkout
 */
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
      return ctx.deliveryZones?.every((z) => z.deliveryFee !== undefined);
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
    redirectUrl: '/admin/resources/staff',
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
      return (
        ctx.profile?.deliveryHours &&
        Object.keys(ctx.profile.deliveryHours).length > 0
      );
    },
    redirectUrl: '/admin/settings/hours',
    estimatedMinutes: 5,
  },
];

/**
 * Todos los requirements mandatory
 */
export const ALL_MANDATORY_REQUIREMENTS: Achievement[] = [
  ...TAKEAWAY_MANDATORY,
  ...DINEIN_MANDATORY,
  ...ECOMMERCE_MANDATORY,
  ...DELIVERY_MANDATORY,
];

// ============================================
// CAPA 2: SUGGESTED ACHIEVEMENTS (Futuro)
// ============================================

/**
 * Achievements sugeridos que mejoran el servicio pero no bloquean.
 * NOTA: Desarrollo en Fase 8+
 */
export const SUGGESTED_ACHIEVEMENTS: Achievement[] = [
  // TODO: Implementar en Fase 8
  // Ejemplos del documento:
  // - Agregar fotos a productos
  // - Configurar programa de fidelidad
  // - Integrar WhatsApp Business
  // - Configurar reservas online
];

// ============================================
// CAPA 3: CUMULATIVE ACHIEVEMENTS
// ============================================

/**
 * Logros acumulativos de gamificación.
 * Otorgan puntos y badges.
 */
export const CUMULATIVE_ACHIEVEMENTS: Achievement[] = [
  // ========== EMPLEADOS ==========
  {
    id: 'cumulative_register_1_employee',
    tier: 'cumulative',
    capability: 'onsite_service',
    name: 'Registrar primer empleado',
    description: 'Has agregado tu primer miembro del equipo',
    icon: '👤',
    category: 'mastery',
    validator: (ctx) => (ctx.staff?.length || 0) >= 1,
    points: 10,
  },
  {
    id: 'cumulative_register_5_employees',
    tier: 'cumulative',
    capability: 'onsite_service',
    name: 'Equipo de 5',
    description: 'Has registrado 5 empleados',
    icon: '👥',
    category: 'mastery',
    validator: (ctx) => (ctx.staff?.length || 0) >= 5,
    points: 50,
  },

  // ========== VENTAS ==========
  {
    id: 'cumulative_first_sale',
    tier: 'cumulative',
    capability: 'onsite_service',
    name: 'Primera venta',
    description: 'Has registrado tu primera venta',
    icon: '🎉',
    category: 'operations',
    validator: (ctx) => (ctx.salesCount || 0) >= 1,
    points: 25,
  },
  {
    id: 'cumulative_100_sales',
    tier: 'cumulative',
    capability: 'onsite_service',
    name: '100 ventas',
    description: 'Has alcanzado 100 ventas',
    icon: '💯',
    category: 'operations',
    validator: (ctx) => (ctx.salesCount || 0) >= 100,
    points: 200,
  },
  {
    id: 'cumulative_1000_sales',
    tier: 'cumulative',
    capability: 'onsite_service',
    name: '1,000 ventas',
    description: '¡Negocio consolidado!',
    icon: '🚀',
    category: 'operations',
    validator: (ctx) => (ctx.salesCount || 0) >= 1000,
    points: 1000,
  },

  // ========== PRODUCTOS ==========
  {
    id: 'cumulative_catalog_10',
    tier: 'cumulative',
    capability: 'online_store',
    name: 'Catálogo de 10',
    description: 'Has creado 10 productos',
    icon: '📦',
    category: 'mastery',
    validator: (ctx) => (ctx.products?.length || 0) >= 10,
    points: 30,
  },
  {
    id: 'cumulative_catalog_50',
    tier: 'cumulative',
    capability: 'online_store',
    name: 'Catálogo amplio',
    description: 'Has creado 50 productos',
    icon: '📚',
    category: 'mastery',
    validator: (ctx) => (ctx.products?.length || 0) >= 50,
    points: 150,
  },
];

// ============================================
// CAPABILITY METADATA
// ============================================

/**
 * Nombres amigables de capabilities (para UI)
 */
export const CAPABILITY_NAMES: CapabilityNames = {
  pickup_counter: 'TakeAway',
  onsite_service: 'Dine-In',
  online_store: 'E-commerce',
  delivery_shipping: 'Delivery',
  corporate_sales: 'B2B',
  appointment_booking: 'Reservas',
  subscription_services: 'Suscripciones',
  rental_services: 'Alquileres',
  marketplace_aggregator: 'Marketplace',
  hospitality_lodging: 'Hospedaje',
};

/**
 * Iconos de capabilities
 */
export const CAPABILITY_ICONS: CapabilityIcons = {
  pickup_counter: '🏪',
  onsite_service: '🍽️',
  online_store: '🌐',
  delivery_shipping: '🚚',
  corporate_sales: '🏢',
  appointment_booking: '📅',
  subscription_services: '🔄',
  rental_services: '🎬',
  marketplace_aggregator: '🛍️',
  hospitality_lodging: '🏨',
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Obtener requirements por capability
 */
export function getRequirementsByCapability(
  capability: string,
  tier: 'mandatory' | 'suggested' | 'cumulative' | 'all' = 'all'
): Achievement[] {
  let allRequirements: Achievement[] = [];

  if (tier === 'all' || tier === 'mandatory') {
    allRequirements.push(...ALL_MANDATORY_REQUIREMENTS);
  }

  if (tier === 'all' || tier === 'suggested') {
    allRequirements.push(...SUGGESTED_ACHIEVEMENTS);
  }

  if (tier === 'all' || tier === 'cumulative') {
    allRequirements.push(...CUMULATIVE_ACHIEVEMENTS);
  }

  return allRequirements.filter((req) => req.capability === capability);
}

/**
 * Obtener requirements por acción bloqueada
 */
export function getRequirementsByBlockedAction(action: string): Achievement[] {
  return ALL_MANDATORY_REQUIREMENTS.filter((req) => req.blocksAction === action);
}
