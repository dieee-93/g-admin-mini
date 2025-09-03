import { BusinessCapabilities, BusinessStructure } from './businessCapabilities';

export function getMainOffersCount(capabilities: BusinessCapabilities): number {
  const mainOffers = [
    capabilities.sells_products_for_onsite_consumption,
    capabilities.sells_products_for_pickup,
    capabilities.sells_products_with_delivery,
    capabilities.sells_digital_products,
    capabilities.sells_services_by_appointment,
    capabilities.sells_services_by_class,
    capabilities.sells_space_by_reservation,
    capabilities.manages_offsite_catering,
    capabilities.hosts_private_events,
    capabilities.manages_rentals,
    capabilities.manages_memberships,
    capabilities.manages_subscriptions,
  ];
  return mainOffers.filter(Boolean).length;
}

export function calculateOperationalTier(
  capabilities: BusinessCapabilities,
  businessStructure: BusinessStructure,
): string {
  if (
    businessStructure === 'multi_location' ||
    getMainOffersCount(capabilities) >= 4 ||
    (getMainOffersCount(capabilities) >= 3 && capabilities.has_online_store)
  ) {
    return 'Sistema Consolidado';
  }

  if (
    capabilities.has_online_store &&
    (capabilities.sells_digital_products || capabilities.manages_subscriptions) &&
    getMainOffersCount(capabilities) <= 2
  ) {
    return 'Negocio Digital';
  }

  if (capabilities.hosts_private_events && capabilities.sells_services_by_class) {
    return 'Centro de Experiencias';
  }

  if (getMainOffersCount(capabilities) === 3) {
    return 'Negocio Integrado';
  }

  if (
    getMainOffersCount(capabilities) === 2 ||
    (getMainOffersCount(capabilities) === 1 && capabilities.has_online_store)
  ) {
    return 'Estructura Funcional';
  }

  if (getMainOffersCount(capabilities) === 1) {
    return 'Base Operativa';
  }

  return 'Sin Configurar';
}

export function getInsightMessage(
  capabilities: BusinessCapabilities,
  businessStructure: BusinessStructure,
): string | null {
  // Memberships/Subscriptions
  if (capabilities.manages_memberships || capabilities.manages_subscriptions) {
    return 'Tu modelo de ingresos recurrentes permite una mayor previsibilidad financiera y relaciones duraderas con clientes.';
  }
  
  // Multiple locations
  if (businessStructure === 'multi_location') {
    return 'La gestión multi-sucursal requiere sistemas robustos de inventario y reportes centralizados que facilitaremos para ti.';
  }
  
  // Online + Digital
  if (capabilities.has_online_store && capabilities.sells_digital_products) {
    return 'Tu combinación online + productos digitales abre oportunidades de escalabilidad y automatización.';
  }
  
  // Events + Services
  if (capabilities.hosts_private_events && capabilities.sells_services_by_class) {
    return 'Tu enfoque en experiencias personalizadas requiere herramientas avanzadas de planificación y gestión de clientes.';
  }
  
  // B2B Focus
  if (capabilities.is_b2b_focused) {
    return 'Los negocios B2B necesitan herramientas específicas para gestionar relaciones comerciales y facturación empresarial.';
  }
  
  return null;
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'Sistema Consolidado':
      return 'purple';
    case 'Negocio Digital':
      return 'blue';
    case 'Centro de Experiencias':
      return 'green';
    case 'Negocio Integrado':
      return 'orange';
    case 'Estructura Funcional':
      return 'teal';
    case 'Base Operativa':
      return 'gray';
    default:
      return 'gray';
  }
}

export function getTierDescription(tier: string): string {
  switch (tier) {
    case 'Sistema Consolidado':
      return 'Negocio complejo con múltiples canales y modelos de ingresos';
    case 'Negocio Digital':
      return 'Enfocado en productos/servicios digitales con presencia online';
    case 'Centro de Experiencias':
      return 'Especializado en experiencias personalizadas y eventos';
    case 'Negocio Integrado':
      return 'Múltiples ofertas bien integradas';
    case 'Estructura Funcional':
      return 'Operaciones estables con dos líneas principales';
    case 'Base Operativa':
      return 'Negocio enfocado en una línea principal';
    default:
      return 'Define tu modelo de negocio para obtener recomendaciones';
  }
}