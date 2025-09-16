/**
 * Sistema de Evolución y Logros - Tipos Base
 * Maneja la conversión de capacidades latentes a activas mediante hitos fundacionales
 */

export type CapabilityStatus = 'latent' | 'activating' | 'active' | 'optimized';

export interface CapabilityMilestone {
  id: string;
  capability_id: string;
  milestone_id: string;
  order: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAchievementProgress {
  id: string;
  user_id: string;
  capability_id: string;
  milestone_id: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MilestoneDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  action_type: string; // Tipo de evento que debe ocurrir
  event_pattern: string; // Patrón de evento del EventBus que debe escuchar
  redirect_url?: string; // URL a donde llevar al usuario para completar este hito
  icon: string;
  estimated_minutes: number;
}

export interface CapabilityActivationProgress {
  capability_id: string;
  capability_name: string;
  status: CapabilityStatus;
  total_milestones: number;
  completed_milestones: number;
  pending_milestones: MilestoneWithProgress[];
  completed_milestone_ids: string[];
}

export interface MilestoneWithProgress extends MilestoneDefinition {
  is_completed: boolean;
  completed_at?: string;
}

export interface ActivationEvent {
  capability_id: string;
  user_id: string;
  completed_milestones: string[];
  activated_at: string;
}

// Eventos del EventBus relacionados con logros
export interface AchievementEvents {
  'capability:activated': ActivationEvent;
  'milestone:completed': {
    user_id: string;
    milestone_id: string;
    capability_id: string;
    completed_at: string;
  };
  'progress:updated': {
    user_id: string;
    capability_id: string;
    progress: CapabilityActivationProgress;
  };
}

// Configuración de hitos por capacidad
export interface CapabilityMilestoneConfig {
  [capability_id: string]: {
    name: string;
    description: string;
    icon: string;
    milestones: string[]; // IDs de los hitos requeridos
  };
}

// Progreso de una capacidad para mostrar en UI
export interface AchievementProgress {
  capabilityId: string;
  capabilityName: string;
  description: string;
  icon: string;
  totalMilestones: number;
  completedMilestones: number;
  isActive: boolean;
  nextMilestone: string | null;
  progressPercentage: number;
}

// Evento de activación de capacidad
export interface CapabilityActivationEvent {
  type: 'capability:activated';
  timestamp: number;
  userId: string;
  capabilityId: string;
  capabilityName: string;
  data: {
    activatedAt: string;
    completedMilestones: string[];
  };
}

// =====================================================
// Tipos para Logros de Maestría
// =====================================================

export interface MasteryAchievementDefinition {
  id: string; // ej: 'sales_bronze'
  name: string; // ej: 'Vendedor de Bronce'
  description: string; // ej: 'Realiza tus primeras 10 ventas'
  icon: string; // ej: 'trophy', 'star', 'medal'
  domain: string; // ej: 'sales', 'inventory', 'staff'
  trigger_event: string; // ej: 'sales:completed'
  conditions: MasteryConditions; // Reglas para desbloquear
  type: 'mastery';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number; // Puntos otorgados
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MasteryConditions {
  type: 'cumulative' | 'streak' | 'single_event' | 'time_based';
  field?: string; // Campo a evaluar (ej: 'sales_count', 'revenue_amount')
  threshold?: number; // Valor umbral (ej: 10 ventas)
  timeframe?: string; // Marco de tiempo (ej: '30_days', 'month')
  comparison?: 'gte' | 'lte' | 'eq'; // Tipo de comparación
  metadata?: Record<string, any>; // Condiciones adicionales
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress_data?: Record<string, any>;
  created_at: string;
}

export interface UserAchievementProgress {
  id: string;
  user_id: string;
  achievement_id: string;
  current_value: number;
  target_value: number;
  progress_percentage: number;
  metadata?: Record<string, any>;
  last_updated: string;
  created_at: string;
}

export interface MasteryAchievementUnlockedEvent {
  type: 'achievement:unlocked';
  timestamp: number;
  userId: string;
  achievementId: string;
  achievementName: string;
  achievementType: 'mastery';
  domain: string;
  tier: string;
  points: number;
  data: {
    unlockedAt: string;
    triggerEvent: string;
    progressData?: Record<string, any>;
  };
}

export interface DomainProgressSummary {
  domain: string;
  total_achievements: number;
  unlocked_achievements: number;
  total_points: number;
  progress_percentage: number;
}