/**
 * ACHIEVEMENTS STORE
 *
 * Zustand store para el estado del sistema de Achievements & Requirements.
 *
 * RESPONSABILIDADES:
 * - Modal de setup requerido (state management)
 * - Datos de achievements completados (persistencia)
 * - Puntos acumulados de gamificación
 * - Badges desbloqueados
 *
 * PATRÓN:
 * - Zustand + Immer + Devtools + Persist
 * - Modal state per-module (patrón del proyecto)
 * - Basado en investigación: "React modal state management 2025"
 *
 * FUENTES:
 * - DEV Community - "Modern React State Management in 2025"
 * - Developer Way - "React State Management in 2025"
 *
 * @version 1.0.0
 * @see docs/05-development/REQUIREMENTS_ACHIEVEMENTS_SYSTEM_DESIGN.md
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';
import { logger } from '@/lib/logging';
import type {
  Achievement,
  SetupModalData,
  CapabilityProgress,
} from '@/modules/achievements/types';
import type { BusinessCapabilityId } from '@/config/types';

// ============================================
// STATE INTERFACE
// ============================================

export interface AchievementsState {
  // ============================================
  // MODAL STATE
  // ============================================

  /** Si el modal de setup está abierto */
  isSetupModalOpen: boolean;

  /** Datos del modal actual */
  setupModalData: SetupModalData | null;

  // ============================================
  // ACHIEVEMENTS DATA
  // ============================================

  /** Achievements completados (IDs) */
  completedAchievements: Set<string>;

  /** Puntos totales acumulados */
  totalPoints: number;

  /** Badges desbloqueados */
  unlockedBadges: string[];

  /** Última vez que se actualizó */
  lastUpdated: Date | null;

  // ============================================
  // PROGRESS TRACKING
  // ============================================

  /** Progreso por capability (cache) */
  capabilityProgress: Map<BusinessCapabilityId, CapabilityProgress>;

  // ============================================
  // MODAL ACTIONS
  // ============================================

  /**
   * Abrir modal de setup requerido
   * @param data - Datos del modal (title, missing requirements, progress)
   */
  openSetupModal: (data: SetupModalData) => void;

  /**
   * Cerrar modal de setup
   */
  closeSetupModal: () => void;

  // ============================================
  // ACHIEVEMENTS ACTIONS
  // ============================================

  /**
   * Marcar achievement como completado
   * @param achievementId - ID del achievement
   * @param points - Puntos a otorgar (opcional)
   */
  completeAchievement: (achievementId: string, points?: number) => void;

  /**
   * Desbloquear badge
   * @param badgeId - ID del badge
   */
  unlockBadge: (badgeId: string) => void;

  /**
   * Actualizar progreso de una capability
   * @param capability - ID de la capability
   * @param progress - Datos de progreso
   */
  updateCapabilityProgress: (
    capability: BusinessCapabilityId,
    progress: CapabilityProgress
  ) => void;

  /**
   * Resetear todos los achievements (testing)
   */
  resetAchievements: () => void;

  // ============================================
  // GETTERS
  // ============================================

  /**
   * Verificar si un achievement está completado
   * @param achievementId - ID del achievement
   */
  isAchievementCompleted: (achievementId: string) => boolean;

  /**
   * Obtener progreso de una capability
   * @param capability - ID de la capability
   */
  getCapabilityProgress: (capability: BusinessCapabilityId) => CapabilityProgress | null;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  // Modal state
  isSetupModalOpen: false,
  setupModalData: null,

  // Achievements data
  completedAchievements: new Set<string>(),
  totalPoints: 0,
  unlockedBadges: [],
  lastUpdated: null,

  // Progress tracking
  capabilityProgress: new Map<BusinessCapabilityId, CapabilityProgress>(),
};

// ============================================
// CREATE STORE
// ============================================

export const useAchievementsStore = create<AchievementsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...initialState,

        // ============================================
        // MODAL ACTIONS
        // ============================================

        openSetupModal: (data: SetupModalData) => {
          set(
            produce((state: AchievementsState) => {
              state.isSetupModalOpen = true;
              state.setupModalData = data;
            }),
            false,
            'openSetupModal'
          );

          logger.debug('App', 'Setup modal opened', {
            title: data.title,
            missingCount: data.missing.length,
            progress: data.progress,
          });
        },

        closeSetupModal: () => {
          set(
            produce((state: AchievementsState) => {
              state.isSetupModalOpen = false;
              state.setupModalData = null;
            }),
            false,
            'closeSetupModal'
          );

          logger.debug('App', 'Setup modal closed');
        },

        // ============================================
        // ACHIEVEMENTS ACTIONS
        // ============================================

        completeAchievement: (achievementId: string, points: number = 0) => {
          set(
            produce((state: AchievementsState) => {
              // Add to completed set
              state.completedAchievements.add(achievementId);

              // Add points
              state.totalPoints += points;

              // Update timestamp
              state.lastUpdated = new Date();
            }),
            false,
            'completeAchievement'
          );

          logger.info('App', `Achievement completed: ${achievementId}`, {
            points,
            totalPoints: get().totalPoints,
          });
        },

        unlockBadge: (badgeId: string) => {
          set(
            produce((state: AchievementsState) => {
              if (!state.unlockedBadges.includes(badgeId)) {
                state.unlockedBadges.push(badgeId);
                state.lastUpdated = new Date();
              }
            }),
            false,
            'unlockBadge'
          );

          logger.info('App', `Badge unlocked: ${badgeId}`);
        },

        updateCapabilityProgress: (
          capability: BusinessCapabilityId,
          progress: CapabilityProgress
        ) => {
          set(
            produce((state: AchievementsState) => {
              state.capabilityProgress.set(capability, progress);
              state.lastUpdated = new Date();
            }),
            false,
            'updateCapabilityProgress'
          );

          logger.debug('App', `Capability progress updated: ${capability}`, {
            percentage: progress.percentage,
            isOperational: progress.isOperational,
          });
        },

        resetAchievements: () => {
          set(
            produce((state: AchievementsState) => {
              state.completedAchievements.clear();
              state.totalPoints = 0;
              state.unlockedBadges = [];
              state.capabilityProgress.clear();
              state.lastUpdated = new Date();
            }),
            false,
            'resetAchievements'
          );

          logger.warn('App', 'All achievements reset');
        },

        // ============================================
        // GETTERS
        // ============================================

        isAchievementCompleted: (achievementId: string): boolean => {
          return get().completedAchievements.has(achievementId);
        },

        getCapabilityProgress: (
          capability: BusinessCapabilityId
        ): CapabilityProgress | null => {
          return get().capabilityProgress.get(capability) || null;
        },
      }),

      // ============================================
      // PERSIST CONFIG
      // ============================================
      {
        name: 'achievements-storage',
        partialize: (state) => ({
          // Solo persistir estos campos
          completedAchievements: Array.from(state.completedAchievements), // Convert Set to Array for serialization
          totalPoints: state.totalPoints,
          unlockedBadges: state.unlockedBadges,
          lastUpdated: state.lastUpdated,
          capabilityProgress: Array.from(state.capabilityProgress.entries()), // Convert Map to Array for serialization
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Reconstruct Set and Map from persisted arrays
            state.completedAchievements = new Set(
              (state.completedAchievements as any) || []
            );
            state.capabilityProgress = new Map(
              (state.capabilityProgress as any) || []
            );

            logger.info('App', 'Achievements store rehydrated', {
              completedCount: state.completedAchievements.size,
              totalPoints: state.totalPoints,
              badges: state.unlockedBadges.length,
            });
          }
        },
      }
    ),

    // ============================================
    // DEVTOOLS CONFIG
    // ============================================
    {
      name: 'AchievementsStore',
      enabled: import.meta.env.DEV,
    }
  )
);

/**
 * Selector hooks para mejor performance
 */

export const useSetupModalState = () =>
  useAchievementsStore((state) => ({
    isOpen: state.isSetupModalOpen,
    data: state.setupModalData,
    onClose: state.closeSetupModal,
  }));

export const useTotalPoints = () =>
  useAchievementsStore((state) => state.totalPoints);

export const useUnlockedBadges = () =>
  useAchievementsStore((state) => state.unlockedBadges);

/**
 * Default export
 */
export default useAchievementsStore;
