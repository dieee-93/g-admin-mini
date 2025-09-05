import { BusinessCapabilities, BusinessStructure } from './businessCapabilities';

export function determineBusinessArchetype(capabilities: BusinessCapabilities): string {
  if (capabilities.sells_products_for_onsite_consumption) return 'Restaurante';
  if (capabilities.sells_digital_products || capabilities.manages_subscriptions) return 'Negocio Digital';
  if (capabilities.sells_services_by_appointment || capabilities.sells_services_by_class) return 'Proveedor de Servicios';
  if (capabilities.hosts_private_events && capabilities.sells_services_by_class) return 'Centro de Experiencias';
  if (capabilities.sells_products_for_pickup || capabilities.sells_products_with_delivery) return 'Tienda Minorista';
  // ... otras reglas y un arquetipo por defecto
  return 'Negocio';
}

export function getOperationalProfile(
  capabilities: BusinessCapabilities,
  businessStructure: BusinessStructure
): string[] {
  const profile = [];

  // Dimensión de Escala
  if (businessStructure === 'multi_location') profile.push('Multi-Sucursal');
  else if (businessStructure === 'mobile') profile.push('Móvil');
  else profile.push('Local Único');

  // Dimensión de Canal
  if (capabilities.sells_products_with_delivery || capabilities.sells_products_for_pickup) {
    profile.push('Canal Digital Sincrónico');
  }
  if (capabilities.has_online_store) {
    profile.push('E-commerce Asincrónico');
  }

  // Dimensión de Cliente
  if (capabilities.is_b2b_focused) {
    profile.push('Enfoque B2B');
  }

  return profile;
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