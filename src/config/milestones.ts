import type { BusinessCapabilities } from '@/types/businessCapabilities';

/**
 * @interface Milestone
 * Define la estructura de un logro o hito que el usuario debe completar.
 * Estos hitos se activan según las capacidades del negocio y guían al usuario
 * en la configuración inicial de la aplicación.
 */
export interface Milestone {
  /** Identificador único del hito (ej: 'configure-delivery-zones') */
  id: string;

  /** Título principal que verá el usuario */
  title: string;

  /** Descripción breve de lo que el usuario debe hacer */
  description: string;

  /** La capacidad de negocio que debe estar activa para que este hito aparezca */
  capability: keyof BusinessCapabilities;

  /** Enlace de la aplicación (ruta) a la página donde se puede completar el hito */
  link: string;

  /** Categoría para agrupar los hitos en la UI (opcional) */
  category: 'Configuración Esencial' | 'Primeros Pasos' | 'Optimización';
}

/**
 * @const MILESTONES
 * Lista maestra de todos los hitos disponibles en la aplicación.
 * El sistema de personalización filtrará esta lista basándose en las
 * capacidades activas del negocio del usuario.
 */
export const MILESTONES: Milestone[] = [
  // Hitos para: Venta en Local Físico
  {
    id: 'setup-pos',
    title: 'Configurar Punto de Venta (POS)',
    description: 'Personaliza tu terminal de ventas para agilizar las operaciones en tu local.',
    capability: 'has_physical_presence',
    link: '/admin/settings/pos',
    category: 'Configuración Esencial',
  },
  {
    id: 'create-first-product-local',
    title: 'Crear tu primer producto',
    description: 'Añade un producto o servicio para empezar a vender en tu local.',
    capability: 'has_physical_presence',
    link: '/admin/products?action=new',
    category: 'Primeros Pasos',
  },

  // Hitos para: Entregas y Envíos
  {
    id: 'configure-delivery-zones',
    title: 'Configurar Zonas de Reparto',
    description: 'Define las áreas geográficas a las que tu negocio realiza entregas.',
    capability: 'has_delivery_logistics',
    link: '/admin/settings/delivery',
    category: 'Configuración Esencial',
  },
  {
    id: 'set-shipping-rates',
    title: 'Establecer Tarifas de Envío',
    description: 'Define los costos de envío para tus diferentes zonas de reparto.',
    capability: 'has_delivery_logistics',
    link: '/admin/settings/delivery-rates',
    category: 'Primeros Pasos',
  },

  // Hitos para: Tienda Online
  {
    id: 'setup-payment-gateway',
    title: 'Conectar un Método de Pago',
    description: 'Integra un proveedor de pagos (como Mercado Pago) para aceptar pagos online.',
    capability: 'has_online_store',
    link: '/admin/settings/integrations',
    category: 'Configuración Esencial',
  },
  {
    id: 'publish-online-product',
    title: 'Publicar un Producto Online',
    description: 'Haz que uno de tus productos sea visible en tu tienda online.',
    capability: 'has_online_store',
    link: '/admin/products',
    category: 'Primeros Pasos',
  },

  // Hitos para: Reservas y Turnos
  {
    id: 'define-business-hours',
    title: 'Definir Horarios de Atención',
    description: 'Establece los horarios en los que tu negocio acepta reservas o citas.',
    capability: 'has_scheduling_system',
    link: '/admin/settings/scheduling',
    category: 'Configuración Esencial',
  },
  {
    id: 'setup-first-service',
    title: 'Configurar tu Primer Servicio',
    description: 'Crea un servicio que tus clientes puedan reservar (ej: "Corte de pelo", "Consulta inicial").',
    capability: 'has_scheduling_system',
    link: '/admin/scheduling/services?action=new',
    category: 'Primeros Pasos',
  },
];
