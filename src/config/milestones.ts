import type { BusinessCapabilities } from '@/pages/setup/steps/business-setup/business-model/config/businessCapabilities';

/**
 * @fileoverview Master list of all application milestones.
 *
 * @description
 * This file defines the master list of "Milestones" that guide the user through the
 * initial setup and advanced features of the application. The system is data-driven;
 * to add a new milestone, simply add a new object to the `MILESTONES` array.
 *
 * @category_criteria
 * To ensure consistency, milestones are categorized based on the following criteria:
 *
 * 1. `Configuración Esencial`: Foundational, one-time setup tasks. These are things
 *    a user MUST do to enable a whole area of functionality.
 *    - Litmus Test: "Can I even start using this part of the app without doing this first?"
 *      If the answer is no, it's `Configuración Esencial`.
 *
 * 2. `Primeros Pasos`: The first operational actions a user takes after the essential
 *    setup is complete. This is about creating the first piece of content or data
 *    within a module (e.g., first product, first client).
 *    - Litmus Test: "Is this the action of creating the first 'thing' in a module?"
 *      If yes, it's `Primeros Pasos`.
 *
 * 3. `Optimización`: Actions that are not strictly necessary to operate, but that
 *    improve or enhance the user's business. These are about using more advanced
 *    features or refining the setup.
 *    - Litmus Test: "Can I run my business without this, but would doing it make my
 *      business better/more efficient?" If yes, it's `Optimización`.
 */

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
  
  /** ID del módulo de navegación al que pertenece el hito */
  moduleId: string;

  /** Sub-ruta opcional dentro del módulo */
  subPath?: string;

  /** Query string opcional */
  query?: string;

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
    capability: 'sells_products_for_onsite_consumption',
    link: '/admin/settings/pos',
    moduleId: 'settings',
    subPath: '/pos',
    category: 'Configuración Esencial',
  },
  {
    id: 'create-first-product-local',
    title: 'Crear tu primer producto',
    description: 'Añade un producto o servicio para empezar a vender en tu local.',
    capability: 'sells_products_for_onsite_consumption',
    link: '/admin/products?action=new',
    moduleId: 'products',
    query: 'action=new',
    category: 'Primeros Pasos',
  },

  // Hitos para: Entregas y Envíos
  {
    id: 'configure-delivery-zones',
    title: 'Configurar Zonas de Reparto',
    description: 'Define las áreas geográficas a las que tu negocio realiza entregas.',
    capability: 'sells_products_with_delivery',
    link: '/admin/settings/delivery',
    moduleId: 'settings',
    subPath: '/delivery',
    category: 'Configuración Esencial',
  },
  {
    id: 'set-shipping-rates',
    title: 'Establecer Tarifas de Envío',
    description: 'Define los costos de envío para tus diferentes zonas de reparto.',
    capability: 'sells_products_with_delivery',
    link: '/admin/settings/delivery-rates',
    moduleId: 'settings',
    subPath: '/delivery-rates',
    category: 'Primeros Pasos',
  },

  // Hitos para: Tienda Online
  {
    id: 'setup-payment-gateway',
    title: 'Conectar un Método de Pago',
    description: 'Integra un proveedor de pagos (como Mercado Pago) para aceptar pagos online.',
    capability: 'has_online_store',
    link: '/admin/settings/integrations',
    moduleId: 'settings',
    subPath: '/integrations',
    category: 'Configuración Esencial',
  },
  {
    id: 'publish-online-product',
    title: 'Publicar un Producto Online',
    description: 'Haz que uno de tus productos sea visible en tu tienda online.',
    capability: 'has_online_store',
    link: '/admin/products',
    moduleId: 'products',
    category: 'Primeros Pasos',
  },

  // Hitos para: Reservas y Turnos
  {
    id: 'define-business-hours',
    title: 'Definir Horarios de Atención',
    description: 'Establece los horarios en los que tu negocio acepta reservas o citas.',
    capability: 'sells_services_by_appointment',
    link: '/admin/settings/scheduling',
    moduleId: 'settings',
    subPath: '/scheduling',
    category: 'Configuración Esencial',
  },
  {
    id: 'setup-first-service',
    title: 'Configurar tu Primer Servicio',
    description: 'Crea un servicio que tus clientes puedan reservar (ej: "Corte de pelo", "Consulta inicial").',
    capability: 'sells_services_by_appointment',
    link: '/admin/scheduling/services?action=new',
    moduleId: 'scheduling',
    subPath: '/services',
    query: 'action=new',
    category: 'Primeros Pasos',
  },

  // Hitos para: Retiro en Tienda (Pickup)
  {
    id: 'enable-pickup',
    title: 'Habilitar Retiro en Tienda',
    description: 'Configura los ajustes para que los clientes puedan comprar online y retirar sus productos en tu local.',
    capability: 'sells_products_for_pickup',
    link: '/admin/settings/shipping', // Placeholder link
    moduleId: 'settings',
    subPath: '/shipping',
    category: 'Configuración Esencial',
  },

  // Hitos para: Productos Digitales
  {
    id: 'create-digital-product',
    title: 'Crear tu Primer Producto Digital',
    description: 'Añade tu primer producto no físico, como un e-book, un curso o software.',
    capability: 'sells_digital_products',
    link: '/admin/products?action=new&type=digital',
    moduleId: 'products',
    query: 'action=new&type=digital',
    category: 'Primeros Pasos',
  },

  // Hitos para: Alquileres
  {
    id: 'add-rental-item',
    title: 'Añadir un Artículo para Alquilar',
    description: 'Define tu primer artículo disponible para alquiler, estableciendo sus tarifas y condiciones.',
    capability: 'manages_rentals',
    link: '/admin/products', // Placeholder link
    moduleId: 'products',
    category: 'Primeros Pasos',
  },

  // Hitos para: Membresías
  {
    id: 'create-membership-plan',
    title: 'Crear tu Primera Membresía',
    description: 'Define un plan de membresía con su precio, beneficios y ciclo de renovación.',
    capability: 'manages_memberships',
    link: '/admin/customers/memberships', // Placeholder link
    moduleId: 'customers',
    subPath: '/memberships',
    category: 'Configuración Esencial',
  },

  // Hitos para: B2B
  {
    id: 'create-b2b-customer',
    title: 'Crear un Perfil de Cliente Corporativo',
    description: 'Añade tu primera empresa cliente para gestionar ventas y facturación B2B.',
    capability: 'is_b2b_focused',
    link: '/admin/customers?action=new&type=b2b',
    moduleId: 'customers',
    query: 'action=new&type=b2b',
    category: 'Primeros Pasos',
  },
];

/**
 * @const operationalProfileMilestones
 * Maps an operational profile "planet" to the primary milestone that unlocks it.
 * This is used by the Business Constellation to determine if a planet is "unlocked".
 * Note: Not all planets need a milestone. 'Escala Local' is a default state.
 */
export const operationalProfileMilestones: { [key: string]: string } = {
  'E-commerce Asincrónico': 'setup-payment-gateway',
  'Canal Digital Sincrónico': 'configure-delivery-zones',
  'Enfoque B2B': 'create-b2b-customer',
  'Multi-Sucursal': 'setup-pos', // Placeholder: This would ideally be a dedicated "add second location" milestone
  'Móvil / Nómada': 'enable-pickup', // Placeholder: This would ideally be a dedicated "setup mobile business" milestone
};
