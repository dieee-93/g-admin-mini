/**
 * Sistema de Evolución y Logros - Exportaciones Públicas
 * 
 * Índice de componentes, hooks y servicios del sistema de gamificación
 * que permite la activación de capacidades latentes a través de hitos fundacionales.
 */

// Componentes UI
export { default as OnboardingGuide } from './components/OnboardingGuide';

// Hooks
export { default as useAchievements } from './hooks/useAchievements';

// NOTE: AchievementsEngine removed - functionality moved to Module Registry
// Use the new requirements system in src/modules/achievements instead

// Tipos
export type {
  CapabilityStatus,
  AchievementProgress,
  MilestoneDefinition,
  CapabilityActivationEvent,
  CapabilityActivationProgress,
  UserAchievementProgress,
  CapabilityMilestone
} from './types';

// Utilidades
export { 
  MILESTONE_DEFINITIONS,
  CAPABILITY_MILESTONE_CONFIG,
  getMilestoneDefinition,
  getMilestonesForCapability,
  getCapabilityConfig
} from '../../../../config/milestones';