/**
 * ACHIEVEMENTS & REQUIREMENTS SYSTEM - TYPE DEFINITIONS
 *
 * Sistema de 3 capas:
 * - MANDATORY: Requisitos obligatorios que bloquean operaciones
 * - SUGGESTED: Mejoras sugeridas (desarrollo futuro)
 * - CUMULATIVE: Logros acumulativos de gamificación
 *
 * @version 1.0.0
 * @see docs/05-development/REQUIREMENTS_ACHIEVEMENTS_SYSTEM_DESIGN.md
 */

import type { BusinessCapabilityId } from '@/config/types';

// ============================================
// CORE TYPES
// ============================================

/**
 * Tier de achievement (3 capas del sistema)
 */
export type AchievementTier = 'mandatory' | 'suggested' | 'cumulative';

/**
 * Categoría de achievement
 */
export type AchievementCategory = 'setup' | 'operations' | 'growth' | 'mastery';

// ============================================
// VALIDATION CONTEXT
// ============================================

/**
 * Contexto unificado para validadores.
 * Combina datos de múltiples stores.
 *
 * Este contexto se inyecta en validators para desacoplarlos de stores específicos.
 */
export interface ValidationContext {
  // Business Profile
  profile: {
    businessName?: string;
    address?: string;
    logoUrl?: string;
    taxId?: string;
    contactEmail?: string;
    contactPhone?: string;
    operatingHours?: Record<string, any>;
    pickupHours?: Record<string, any>;
    deliveryHours?: Record<string, any>;
    shippingPolicy?: string;
    termsAndConditions?: string;
  } | null;

  // Products
  products: Array<{
    id: string;
    name: string;
    is_published: boolean;
    type?: string; // "ELABORATED" | "SERVICE" | "DIGITAL" | etc.
    cost?: number;
    images?: string[];
  }>;

  // Staff
  staff: Array<{
    id: string;
    name: string;
    is_active: boolean;
    role?: string;
  }>;

  // Operations
  tables?: Array<{
    id: string;
    name: string;
    capacity: number;
  }>;

  // Payments
  paymentMethods?: Array<{
    id: string;
    name: string;
    is_active: boolean;
  }>;

  paymentGateways?: Array<{
    id: string;
    type: string;
    is_active: boolean;
  }>;

  // Delivery
  deliveryZones?: Array<{
    id: string;
    name: string;
    deliveryFee?: number;
  }>;

  // Metrics
  salesCount?: number;
  loyaltyProgram?: {
    active: boolean;
  };

  // ============================================
  // NEW FIELDS FOR ADDITIONAL CAPABILITIES
  // ============================================

  // Customers (for ecommerce, delivery, corporate_sales)
  // TODO: Implementar customersStore
  customers?: Array<{
    id: string;
    name: string;
    email?: string;
    is_active?: boolean;
  }>;

  // Materials/Inventory (for physical_products)
  // ✅ IMPLEMENTED: materialsStore exists
  materials?: Array<{
    id: string;
    name: string;
    type: 'MEASURABLE' | 'COUNTABLE' | 'ELABORATED';
  }>;

  // Assets (for asset_rental)
  // ✅ IMPLEMENTED: assetsStore exists
  assets?: Array<{
    id: string;
    name: string;
    is_available?: boolean;
  }>;

  // Suppliers (for physical_products)
  // ✅ IMPLEMENTED: suppliersStore exists
  suppliers?: Array<{
    id: string;
    name: string;
    is_active: boolean;
  }>;

  // TODO FASE 2: Implementar estos stores y descomentar en useValidationContext
  // appointments?: Array<{
  //   id: string;
  //   professional_id?: string;
  //   duration_minutes?: number;
  // }>;

  // membershipPlans?: Array<{
  //   id: string;
  //   name: string;
  //   recurring_billing?: boolean;
  // }>;
}

// ============================================
// ACHIEVEMENT DEFINITION
// ============================================

/**
 * Achievement individual
 *
 * Representa un logro o requisito en el sistema.
 */
export interface Achievement {
  /** ID único del achievement */
  id: string;

  /** Tier del achievement */
  tier: AchievementTier;

  /** Capability asociada (o 'shared' para requirements cross-capability) */
  capability: BusinessCapabilityId | 'shared';

  /** Nombre visible al usuario */
  name: string;

  /** Descripción detallada (opcional) */
  description?: string;

  /** Icono emoji */
  icon: string;

  /** Categoría para organización */
  category: AchievementCategory;

  /** 
   * Metadata adicional (opcional)
   * Útil para shared requirements, debugging, etc.
   */
  metadata?: {
    /** Capabilities que comparten este requirement (para shared requirements) */
    sharedBy?: string[];
    /** Si es un requirement base para TODAS las capabilities */
    isBase?: boolean;
    /** Umbral numérico (ej: min_products = 5) */
    threshold?: number;
    /** Estimación de tiempo en minutos */
    estimatedMinutes?: number;
    /** Otros datos custom */
    [key: string]: any;
  };

  // ============================================
  // VALIDATION
  // ============================================

  /**
   * Función validadora
   * Recibe ValidationContext y retorna true si se cumple
   */
  validator: (context: ValidationContext) => boolean;

  /**
   * Acción que este achievement bloquea (solo para mandatory)
   * Formato: 'capability:action'
   * Ejemplos:
   * - 'takeaway:toggle_public' - Activar pedidos TakeAway públicos
   * - 'dinein:open_shift' - Abrir turno operativo
   * - 'ecommerce:toggle_public' - Activar tienda online
   * - 'delivery:enable_public' - Habilitar delivery
   */
  blocksAction?: string;

  // ============================================
  // UI & UX
  // ============================================

  /** URL para redirigir al usuario a completar */
  redirectUrl?: string;

  /** Tiempo estimado en minutos */
  estimatedMinutes?: number;

  // ============================================
  // GAMIFICATION
  // ============================================

  /** Puntos otorgados (solo cumulative/suggested) */
  points?: number;

  /** Badge otorgado (opcional) */
  badge?: string;
}

/**
 * Requirement (alias de Achievement para claridad semántica)
 */
export type Requirement = Achievement;

// ============================================
// VALIDATION RESULTS
// ============================================

/**
 * Resultado de validación de una operación comercial
 */
export interface ValidationResult {
  /** Si la operación está permitida */
  allowed: boolean;

  /** Razón del bloqueo (si allowed=false) */
  reason?: string;

  /** Requirements faltantes */
  missingRequirements?: Achievement[];

  /** Porcentaje de progreso (0-100) */
  progressPercentage?: number;
}

/**
 * Progreso de una capability
 */
export interface CapabilityProgress {
  /** Capability evaluada */
  capability: BusinessCapabilityId;

  /** Total de requirements mandatory */
  total: number;

  /** Requirements completados */
  completed: number;

  /** Porcentaje de completitud (0-100) */
  percentage: number;

  /** Si la capability está operacional (100% completo) */
  isOperational: boolean;

  /** Requirements faltantes (opcional) */
  missing?: Achievement[];
}

// ============================================
// MODAL STATE
// ============================================

/**
 * Datos para modal de setup requerido
 */
export interface SetupModalData {
  /** Título del modal */
  title: string;

  /** Requirements faltantes */
  missing: Achievement[];

  /** Progreso actual (0-100) */
  progress: number;

  /** Capability asociada (opcional) */
  capability?: BusinessCapabilityId;
}

// ============================================
// HOOK HANDLERS
// ============================================

/**
 * Función validadora de requirements
 */
export type ValidatorFunction = (context: ValidationContext) => boolean;

/**
 * Handler de registro de requirements
 */
export interface RegisterRequirementHandler {
  capability: BusinessCapabilityId;
  requirements: Requirement[];
}

/**
 * Handler de validación de operación comercial
 */
export interface ValidateOperationHandler {
  capability: BusinessCapabilityId;
  action: string;
  context: ValidationContext;
}

/**
 * Handler de obtención de progreso
 */
export interface GetProgressHandler {
  capability: BusinessCapabilityId;
  context: ValidationContext;
}

// ============================================
// EXPORTS API
// ============================================

/**
 * API pública del módulo achievements
 */
export interface AchievementsAPI {
  /**
   * Validar una operación comercial
   */
  validateOperation(
    capability: BusinessCapabilityId,
    action: string,
    context: ValidationContext
  ): Promise<ValidationResult>;

  /**
   * Obtener progreso de una capability
   */
  getProgress(
    capability: BusinessCapabilityId,
    context: ValidationContext
  ): CapabilityProgress;

  /**
   * Obtener todos los requirements de una capability
   */
  getRequirements(capability: BusinessCapabilityId): Achievement[];

  /**
   * Verificar si una capability está operacional
   */
  isOperational(
    capability: BusinessCapabilityId,
    context: ValidationContext
  ): boolean;
}

// ============================================
// WIDGET TYPES
// ============================================

/**
 * Tipo de vista del widget
 */
export type WidgetViewMode = 'prominent' | 'compact';

/**
 * Props para el widget de achievements
 */
export interface AchievementsWidgetProps {
  /** Forzar modo de vista (opcional) */
  forceMode?: WidgetViewMode;
}

/**
 * Props para la tarjeta de progreso de capability
 */
export interface CapabilityProgressCardProps {
  progress: CapabilityProgress;
  onViewDetails?: () => void;
}

/**
 * Props para el checklist de requirements
 */
export interface RequirementChecklistProps {
  requirements: Achievement[];
  context: ValidationContext;
  onNavigate?: (url: string) => void;
}

// ============================================
// CONSTANTS TYPES
// ============================================

/**
 * Mapa de names de capabilities (para UI)
 */
export interface CapabilityNames {
  [key: string]: string;
}

/**
 * Mapa de iconos de capabilities
 */
export interface CapabilityIcons {
  [key: string]: string;
}
