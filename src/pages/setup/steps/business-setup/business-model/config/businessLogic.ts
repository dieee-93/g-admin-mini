import { BusinessCapabilities, BusinessStructure } from './businessCapabilities';

export function determineBusinessArchetype(capabilities: BusinessCapabilities): string {
  if (capabilities.sells_products_for_onsite_consumption) return 'Restaurante/Bar';
  if (capabilities.sells_digital_products || capabilities.manages_subscriptions) return 'Negocio Digital';
  if (capabilities.hosts_private_events && capabilities.sells_services_by_class) return 'Centro de Experiencias';
  if (capabilities.sells_services_by_appointment || capabilities.sells_services_by_class) return 'Proveedor de Servicios';
  if (capabilities.sells_products_for_pickup || capabilities.sells_products_with_delivery) return 'Tienda Minorista';
  return 'Negocio';
}

export function getOperationalProfile(
  capabilities: BusinessCapabilities,
  businessStructure: BusinessStructure
): string[] {
  const profile = [];

  // Dimensión del Canal
  if (capabilities.has_online_store) {
    profile.push('E-commerce Asincrónico');
  }
  if (capabilities.sells_products_with_delivery || capabilities.sells_products_for_pickup) {
    profile.push('Canal Digital Sincrónico');
  }

  // Dimensión de la Escala
  if (businessStructure === 'multi_location') {
    profile.push('Multi-Sucursal');
  } else if (businessStructure === 'mobile') {
    profile.push('Móvil / Nómada');
  } else {
    profile.push('Escala Local');
  }

  // Dimensión del Cliente
  if (capabilities.is_b2b_focused) {
    profile.push('Enfoque B2B');
  }

  return profile;
}

export function getInsightMessage(
  capabilities: BusinessCapabilities,
  businessStructure: BusinessStructure,
): string | null {
  if (capabilities.manages_memberships || capabilities.manages_subscriptions) {
    return 'Tu modelo de ingresos recurrentes permite una mayor previsibilidad financiera y relaciones duraderas con clientes.';
  }
  
  if (businessStructure === 'multi_location') {
    return 'La gestión multi-sucursal requiere sistemas robustos de inventario y reportes centralizados que facilitaremos para ti.';
  }
  
  if (capabilities.has_online_store && capabilities.sells_digital_products) {
    return 'Tu combinación online + productos digitales abre oportunidades de escalabilidad y automatización.';
  }
  
  if (capabilities.hosts_private_events && capabilities.sells_services_by_class) {
    return 'Tu enfoque en experiencias personalizadas requiere herramientas avanzadas de planificación y gestión de clientes.';
  }
  
  if (capabilities.is_b2b_focused) {
    return 'Los negocios B2B necesitan herramientas específicas para gestionar relaciones comerciales y facturación empresarial.';
  }
  
  return null;
}