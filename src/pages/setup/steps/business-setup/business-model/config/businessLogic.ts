import { BusinessCapabilities, BusinessStructure } from './businessCapabilities';

export function determineBusinessArchetypes(capabilities: BusinessCapabilities): string[] {
  const archetypes = new Set<string>();

  // Arquetipos basados en PRODUCTOS
  if (capabilities.sells_products_for_onsite_consumption) archetypes.add('Restaurante');
  else if (capabilities.sells_products_for_pickup || capabilities.sells_products_with_delivery) {
    archetypes.add('Tienda Minorista');
  }

  // Arquetipos basados en SERVICIOS
  if (capabilities.sells_services_by_appointment) archetypes.add('Servicios por Cita');
  if (capabilities.sells_services_by_class) archetypes.add('Centro de Formación');
  if (capabilities.sells_space_by_reservation) archetypes.add('Gestor de Espacios');

  // Arquetipos basados en EVENTOS
  if (capabilities.hosts_private_events || capabilities.manages_offsite_catering) {
    archetypes.add('Organizador de Eventos');
  }

  // Arquetipos basados en RECURRENCIA (estos pueden ser también modelos de ingreso)
  if (capabilities.manages_subscriptions || capabilities.sells_digital_products) {
    archetypes.add('Negocio Digital');
  }
  if (capabilities.manages_memberships) archetypes.add('Club de Membresías');
  if (capabilities.manages_rentals) archetypes.add('Centro de Alquileres');

  if (archetypes.size === 0) return ['Negocio'];

  return Array.from(archetypes);
}

export function getOperationalProfile(
  capabilities: BusinessCapabilities,
  businessStructure: BusinessStructure[]
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
  if (businessStructure.includes('multi_location')) {
    profile.push('Multi-Sucursal');
  } else if (businessStructure.includes('single_location')) {
    profile.push('Escala Local');
  }

  if (businessStructure.includes('mobile')) {
    profile.push('Móvil / Nómada');
  }

  // Dimensión del Cliente
  if (capabilities.is_b2b_focused) {
    profile.push('Enfoque B2B');
  }

  return profile;
}

export function getInsightMessage(
  capabilities: BusinessCapabilities,
  businessStructure: BusinessStructure[],
): string | null {
  if (capabilities.manages_memberships || capabilities.manages_subscriptions) {
    return 'Tu modelo de ingresos recurrentes permite una mayor previsibilidad financiera y relaciones duraderas con clientes.';
  }
  
  if (businessStructure.includes('multi_location')) {
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