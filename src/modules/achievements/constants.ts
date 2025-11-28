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
 * TAKEAWAY REQUIREMENTS (Capability: pickup_orders)
 *
 * Requisitos obligatorios para activar TakeAway público.
 * Validación en: Toggle "Aceptar Pedidos TakeAway"
 */
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
 * ASYNC OPERATIONS REQUIREMENTS (Capability: async_operations)
 *
 * Requisitos obligatorios para activar tienda online.
 * Validación en: Toggle "Tienda Pública"
 */
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
      return ctx.paymentGateways?.some((g) => g.is_active && g.type === 'online');
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
 * PHYSICAL PRODUCTS REQUIREMENTS (Capability: physical_products)
 *
 * Requisitos obligatorios para negocios que venden productos físicos.
 * Validación en: Publicar catálogo / Activar ventas
 *
 * ✅ FASE 1: Validar solo stores existentes
 * TODO FASE 2: Descomentar validaciones de suppliers cuando exista suppliersStore
 */
export const PHYSICAL_PRODUCTS_MANDATORY: Achievement[] = [
  {
    id: 'physical_business_name',
    tier: 'mandatory',
    capability: 'physical_products',
    name: 'Configurar nombre del negocio',
    description: 'Define el nombre comercial de tu negocio',
    icon: '🏪',
    category: 'setup',
    blocksAction: 'catalog:publish',
    validator: (ctx) => !!ctx.profile?.businessName?.trim(),
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 2,
  },
  {
    id: 'physical_min_materials',
    tier: 'mandatory',
    capability: 'physical_products',
    name: 'Registrar al menos 1 material/insumo',
    description: 'Necesitas materiales para producir tus productos',
    icon: '📦',
    category: 'setup',
    blocksAction: 'catalog:publish',
    validator: (ctx) => (ctx.materials?.length || 0) >= 1,
    redirectUrl: '/admin/supply-chain/materials',
    estimatedMinutes: 5,
  },
  {
    id: 'physical_min_suppliers',
    tier: 'mandatory',
    capability: 'physical_products',
    name: 'Registrar al menos 1 proveedor activo',
    description: 'Necesitas proveedores para abastecer materiales',
    icon: '🚚',
    category: 'setup',
    blocksAction: 'catalog:publish',
    validator: (ctx) => (ctx.suppliers?.length || 0) >= 1,
    redirectUrl: '/admin/supply-chain/suppliers',
    estimatedMinutes: 5,
  },
  {
    id: 'physical_min_products',
    tier: 'mandatory',
    capability: 'physical_products',
    name: 'Crear al menos 3 productos',
    description: 'Tu catálogo debe tener productos disponibles',
    icon: '🍕',
    category: 'setup',
    blocksAction: 'catalog:publish',
    validator: (ctx) => (ctx.products?.length || 0) >= 3,
    redirectUrl: '/admin/supply-chain/products',
    estimatedMinutes: 15,
  },
  {
    id: 'physical_payment_method',
    tier: 'mandatory',
    capability: 'physical_products',
    name: 'Configurar método de pago',
    description: 'Define cómo recibirás los pagos',
    icon: '💳',
    category: 'setup',
    blocksAction: 'catalog:publish',
    validator: (ctx) => (ctx.paymentMethods?.length || 0) > 0,
    redirectUrl: '/admin/finance/integrations',
    estimatedMinutes: 10,
  },
];

/**
 * PROFESSIONAL SERVICES REQUIREMENTS (Capability: professional_services)
 *
 * Requisitos obligatorios para negocios de servicios profesionales.
 * Validación en: Aceptar reservas / Publicar servicios
 */
export const PROFESSIONAL_SERVICES_MANDATORY: Achievement[] = [
  {
    id: 'services_business_name',
    tier: 'mandatory',
    capability: 'professional_services',
    name: 'Configurar nombre del negocio',
    icon: '🏪',
    category: 'setup',
    blocksAction: 'services:accept_bookings',
    validator: (ctx) => !!ctx.profile?.businessName?.trim(),
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 2,
  },
  {
    id: 'services_operating_hours',
    tier: 'mandatory',
    capability: 'professional_services',
    name: 'Definir horarios de atención',
    description: 'Establece cuándo brindas servicios',
    icon: '🕐',
    category: 'setup',
    blocksAction: 'services:accept_bookings',
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
    id: 'services_min_professionals',
    tier: 'mandatory',
    capability: 'professional_services',
    name: 'Registrar al menos 1 profesional',
    description: 'Necesitas profesionales para brindar servicios',
    icon: '👨‍⚕️',
    category: 'setup',
    blocksAction: 'services:accept_bookings',
    validator: (ctx) => {
      // Buscar staff con role 'professional' o cualquier staff activo
      const professionals = ctx.staff?.filter(s =>
        s.is_active && (s.role === 'professional' || s.role === 'staff')
      ) || [];
      return professionals.length >= 1;
    },
    redirectUrl: '/admin/resources/staff',
    estimatedMinutes: 10,
  },
  {
    id: 'services_min_offerings',
    tier: 'mandatory',
    capability: 'professional_services',
    name: 'Publicar al menos 2 servicios',
    description: 'Define los servicios que ofreces',
    icon: '💼',
    category: 'setup',
    blocksAction: 'services:accept_bookings',
    validator: (ctx) => {
      // Filtrar productos tipo 'service' con duración configurada
      const services = ctx.products?.filter(p =>
        (p as any).type === 'service' && (p as any).duration_minutes > 0
      ) || [];
      return services.length >= 2;
    },
    redirectUrl: '/admin/supply-chain/products',
    estimatedMinutes: 15,
  },
  {
    id: 'services_payment_method',
    tier: 'mandatory',
    capability: 'professional_services',
    name: 'Configurar método de pago',
    icon: '💳',
    category: 'setup',
    blocksAction: 'services:accept_bookings',
    validator: (ctx) => (ctx.paymentMethods?.length || 0) > 0,
    redirectUrl: '/admin/finance/integrations',
    estimatedMinutes: 10,
  },
];

/**
 * ASSET RENTAL REQUIREMENTS (Capability: asset_rental)
 *
 * Requisitos obligatorios para negocios de alquiler de activos.
 * Validación en: Aceptar reservas de alquiler
 */
export const ASSET_RENTAL_MANDATORY: Achievement[] = [
  {
    id: 'rental_business_name',
    tier: 'mandatory',
    capability: 'asset_rental',
    name: 'Configurar nombre del negocio',
    icon: '🏪',
    category: 'setup',
    blocksAction: 'rental:accept_bookings',
    validator: (ctx) => !!ctx.profile?.businessName?.trim(),
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 2,
  },
  {
    id: 'rental_min_assets',
    tier: 'mandatory',
    capability: 'asset_rental',
    name: 'Registrar al menos 1 activo disponible',
    description: 'Necesitas activos para alquilar',
    icon: '🎬',
    category: 'setup',
    blocksAction: 'rental:accept_bookings',
    validator: (ctx) => (ctx.assets?.length || 0) >= 1,
    redirectUrl: '/admin/supply-chain/assets',
    estimatedMinutes: 10,
  },
  {
    id: 'rental_pricing_configured',
    tier: 'mandatory',
    capability: 'asset_rental',
    name: 'Configurar precios de alquiler',
    description: 'Define tarifas por hora/día/semana en productos',
    icon: '💰',
    category: 'setup',
    blocksAction: 'rental:accept_bookings',
    validator: (ctx) => {
      // Verificar que hay productos tipo 'rental' con precio
      const rentalProducts = ctx.products?.filter(p =>
        (p as any).type === 'rental' && (p as any).price > 0
      ) || [];
      return rentalProducts.length >= 1;
    },
    redirectUrl: '/admin/supply-chain/products',
    estimatedMinutes: 10,
  },
  {
    id: 'rental_contact_info',
    tier: 'mandatory',
    capability: 'asset_rental',
    name: 'Información de contacto completa',
    description: 'Email y teléfono para consultas de alquiler',
    icon: '📞',
    category: 'setup',
    blocksAction: 'rental:accept_bookings',
    validator: (ctx) => {
      return !!ctx.profile?.contactEmail && !!ctx.profile?.contactPhone;
    },
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 3,
  },
];

/**
 * MEMBERSHIP/SUBSCRIPTIONS REQUIREMENTS (Capability: membership_subscriptions)
 *
 * Requisitos obligatorios para negocios de membresías.
 * Validación en: Aceptar suscripciones
 */
export const MEMBERSHIP_MANDATORY: Achievement[] = [
  {
    id: 'membership_business_name',
    tier: 'mandatory',
    capability: 'membership_subscriptions',
    name: 'Configurar nombre del negocio',
    icon: '🏪',
    category: 'setup',
    blocksAction: 'membership:accept_subscriptions',
    validator: (ctx) => !!ctx.profile?.businessName?.trim(),
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 2,
  },
  {
    id: 'membership_min_plans',
    tier: 'mandatory',
    capability: 'membership_subscriptions',
    name: 'Crear al menos 1 plan de membresía',
    description: 'Define los planes que ofreces',
    icon: '🎫',
    category: 'setup',
    blocksAction: 'membership:accept_subscriptions',
    validator: (ctx) => {
      // Verificar productos tipo 'membership'
      const membershipProducts = ctx.products?.filter(p =>
        (p as any).type === 'membership'
      ) || [];
      return membershipProducts.length >= 1;
    },
    redirectUrl: '/admin/supply-chain/products',
    estimatedMinutes: 15,
  },
  {
    id: 'membership_payment_gateway',
    tier: 'mandatory',
    capability: 'membership_subscriptions',
    name: 'Configurar gateway de pagos recurrentes',
    description: 'Necesario para cobros automáticos mensuales',
    icon: '💳',
    category: 'setup',
    blocksAction: 'membership:accept_subscriptions',
    validator: (ctx) => {
      // Verificar que hay gateway configurado (cualquiera sirve por ahora)
      return (ctx.paymentGateways?.length || 0) > 0;
    },
    redirectUrl: '/admin/finance/integrations',
    estimatedMinutes: 15,
  },
  {
    id: 'membership_contact_info',
    tier: 'mandatory',
    capability: 'membership_subscriptions',
    name: 'Información de contacto completa',
    description: 'Email y teléfono para soporte a miembros',
    icon: '📞',
    category: 'setup',
    blocksAction: 'membership:accept_subscriptions',
    validator: (ctx) => {
      return !!ctx.profile?.contactEmail && !!ctx.profile?.contactPhone;
    },
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 3,
  },
];

/**
 * DIGITAL PRODUCTS REQUIREMENTS (Capability: digital_products)
 *
 * Requisitos obligatorios para venta de productos digitales.
 * Validación en: Publicar productos digitales
 */
export const DIGITAL_PRODUCTS_MANDATORY: Achievement[] = [
  {
    id: 'digital_business_name',
    tier: 'mandatory',
    capability: 'digital_products',
    name: 'Configurar nombre del negocio',
    icon: '🏪',
    category: 'setup',
    blocksAction: 'digital:accept_orders',
    validator: (ctx) => !!ctx.profile?.businessName?.trim(),
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 2,
  },
  {
    id: 'digital_min_products',
    tier: 'mandatory',
    capability: 'digital_products',
    name: 'Crear al menos 1 producto digital',
    description: 'Cursos, ebooks, descargas, etc.',
    icon: '💾',
    category: 'setup',
    blocksAction: 'digital:accept_orders',
    validator: (ctx) => {
      const digitalProducts = ctx.products?.filter(p =>
        (p as any).type === 'digital'
      ) || [];
      return digitalProducts.length >= 1;
    },
    redirectUrl: '/admin/supply-chain/products',
    estimatedMinutes: 20,
  },
  {
    id: 'digital_payment_gateway',
    tier: 'mandatory',
    capability: 'digital_products',
    name: 'Integrar gateway de pago online',
    description: 'Necesario para procesar ventas digitales',
    icon: '💳',
    category: 'setup',
    blocksAction: 'digital:accept_orders',
    validator: (ctx) => {
      return (ctx.paymentGateways?.length || 0) > 0;
    },
    redirectUrl: '/admin/finance/integrations',
    estimatedMinutes: 15,
  },
  {
    id: 'digital_contact_email',
    tier: 'mandatory',
    capability: 'digital_products',
    name: 'Configurar email de soporte',
    description: 'Para enviar productos y atender consultas',
    icon: '📧',
    category: 'setup',
    blocksAction: 'digital:accept_orders',
    validator: (ctx) => !!ctx.profile?.contactEmail,
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 2,
  },
];

/**
 * CORPORATE SALES (B2B) REQUIREMENTS (Capability: corporate_sales)
 *
 * Requisitos obligatorios para ventas corporativas B2B.
 * Validación en: Aceptar pedidos corporativos
 */
export const CORPORATE_SALES_MANDATORY: Achievement[] = [
  {
    id: 'b2b_business_name',
    tier: 'mandatory',
    capability: 'corporate_sales',
    name: 'Configurar nombre del negocio',
    icon: '🏪',
    category: 'setup',
    blocksAction: 'b2b:accept_corporate_orders',
    validator: (ctx) => !!ctx.profile?.businessName?.trim(),
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 2,
  },
  {
    id: 'b2b_tax_id',
    tier: 'mandatory',
    capability: 'corporate_sales',
    name: 'Configurar CUIT/datos fiscales',
    description: 'Necesario para facturación B2B',
    icon: '🏛️',
    category: 'setup',
    blocksAction: 'b2b:accept_corporate_orders',
    validator: (ctx) => !!ctx.profile?.taxId,
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 5,
  },
  {
    id: 'b2b_min_products',
    tier: 'mandatory',
    capability: 'corporate_sales',
    name: 'Al menos 5 productos en catálogo B2B',
    description: 'Catálogo mínimo para clientes corporativos',
    icon: '📦',
    category: 'setup',
    blocksAction: 'b2b:accept_corporate_orders',
    validator: (ctx) => {
      // Verificar productos disponibles para B2B
      const b2bProducts = ctx.products?.filter(p =>
        (p as any).available_online !== false // Si no está excluido de online, puede ser B2B
      ) || [];
      return b2bProducts.length >= 5;
    },
    redirectUrl: '/admin/supply-chain/products',
    estimatedMinutes: 20,
  },
  {
    id: 'b2b_contact_info',
    tier: 'mandatory',
    capability: 'corporate_sales',
    name: 'Información de contacto comercial',
    description: 'Email y teléfono para clientes corporativos',
    icon: '📞',
    category: 'setup',
    blocksAction: 'b2b:accept_corporate_orders',
    validator: (ctx) => {
      return !!ctx.profile?.contactEmail && !!ctx.profile?.contactPhone;
    },
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 3,
  },
];

/**
 * MOBILE OPERATIONS REQUIREMENTS (Capability: mobile_operations)
 *
 * Requisitos obligatorios para operaciones móviles (food truck, servicios móviles).
 * Validación en: Iniciar operación móvil
 */
export const MOBILE_OPERATIONS_MANDATORY: Achievement[] = [
  {
    id: 'mobile_business_name',
    tier: 'mandatory',
    capability: 'mobile_operations',
    name: 'Configurar nombre del negocio',
    icon: '🏪',
    category: 'setup',
    blocksAction: 'mobile:start_operations',
    validator: (ctx) => !!ctx.profile?.businessName?.trim(),
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 2,
  },
  {
    id: 'mobile_min_products',
    tier: 'mandatory',
    capability: 'mobile_operations',
    name: 'Al menos 3 productos disponibles',
    description: 'Catálogo para operación móvil',
    icon: '📦',
    category: 'setup',
    blocksAction: 'mobile:start_operations',
    validator: (ctx) => (ctx.products?.length || 0) >= 3,
    redirectUrl: '/admin/supply-chain/products',
    estimatedMinutes: 15,
  },
  {
    id: 'mobile_contact_phone',
    tier: 'mandatory',
    capability: 'mobile_operations',
    name: 'Teléfono de contacto configurado',
    description: 'Para que clientes puedan ubicarte',
    icon: '📱',
    category: 'setup',
    blocksAction: 'mobile:start_operations',
    validator: (ctx) => !!ctx.profile?.contactPhone,
    redirectUrl: '/admin/settings/business',
    estimatedMinutes: 2,
  },
  {
    id: 'mobile_operating_hours',
    tier: 'mandatory',
    capability: 'mobile_operations',
    name: 'Definir horarios de operación',
    description: 'Cuándo estarás disponible',
    icon: '🕐',
    category: 'setup',
    blocksAction: 'mobile:start_operations',
    validator: (ctx) => {
      return (
        ctx.profile?.operatingHours &&
        Object.keys(ctx.profile.operatingHours).length > 0
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
  ...PHYSICAL_PRODUCTS_MANDATORY,
  ...PROFESSIONAL_SERVICES_MANDATORY,
  ...ASSET_RENTAL_MANDATORY,
  ...MEMBERSHIP_MANDATORY,
  ...DIGITAL_PRODUCTS_MANDATORY,
  ...CORPORATE_SALES_MANDATORY,
  ...MOBILE_OPERATIONS_MANDATORY,
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
    capability: 'async_operations',
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
    capability: 'async_operations',
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
  pickup_orders: 'TakeAway',
  onsite_service: 'Dine-In',
  async_operations: 'Operaciones Async',
  delivery_shipping: 'Delivery',
  corporate_sales: 'B2B',
  physical_products: 'Productos Físicos',
  professional_services: 'Servicios Profesionales',
  asset_rental: 'Alquileres',
  membership_subscriptions: 'Membresías',
  digital_products: 'Productos Digitales',
  mobile_operations: 'Móvil',
};

/**
 * Iconos de capabilities
 */
export const CAPABILITY_ICONS: CapabilityIcons = {
  pickup_orders: '🏪',
  onsite_service: '🍽️',
  async_operations: '🌙',
  delivery_shipping: '🚚',
  corporate_sales: '🏢',
  physical_products: '📦',
  professional_services: '💼',
  asset_rental: '🎬',
  membership_subscriptions: '🔄',
  digital_products: '💾',
  mobile_operations: '🚐',
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
