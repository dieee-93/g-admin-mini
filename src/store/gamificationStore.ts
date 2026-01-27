/**
 * GAMIFICATION STORE (Preparatorio)
 * 
 * ⚠️ FUTURO USO - NO IMPLEMENTADO AÚN
 * 
 * Este store está preparado para funcionalidad futura de gamificación:
 * 
 * ROADMAP:
 * - Fase 1 (Q2 2025): Sistema de onboarding/tutoriales para administradores
 * - Fase 2 (Q3 2025): Motivación/achievements para empleados
 * - Fase 3 (2026+): Loyalty program para clientes finales
 * 
 * ARQUITECTURA:
 * - Zustand + Persist (localStorage temporal)
 * - Migrar a Supabase cuando se implemente
 * - Tabla: `user_achievements` (ver GAMIFICATION_ROADMAP.md)
 * 
 * NO CONFUNDIR CON:
 * - ❌ Requirements del sistema (ver requirements/)
 * - ❌ Progreso de capabilities (ver progressCalculator)
 * 
 * ESTO ES PARA:
 * - ✅ Points/badges de usuarios (futura motivación)
 * - ✅ Achievements de empleados (futura gamificación)
 * - ✅ Loyalty program (futuro para clientes)
 * 
 * @version 0.1.0 (preparatorio)
 * @see GAMIFICATION_ROADMAP.md
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { logger } from '@/lib/logging';

// ============================================
// STATE INTERFACE
// ============================================

export interface GamificationState {
  // ============================================
  // USER IDENTIFICATION
  // ============================================

  /** ID del usuario (admin/empleado/cliente) */
  userId: string | null;

  /** Tipo de usuario para diferentes sistemas de gamificación */
  userType: 'admin' | 'employee' | 'customer' | null;

  // ============================================
  // ACHIEVEMENTS DATA
  // ============================================

  /** IDs de achievements completados por este usuario */
  completedAchievements: Set<string>;

  /** Puntos totales acumulados */
  totalPoints: number;

  /** IDs de badges desbloqueados */
  unlockedBadges: string[];

  /** Última actualización */
  lastUpdated: Date | null;

  // ============================================
  // ACTIONS (Placeholder)
  // ============================================

  /**
   * Marcar achievement como completado.
   * TODO: Implementar cuando se active gamificación.
   * 
   * @param achievementId - ID del achievement
   * @param points - Puntos a otorgar (opcional)
   */
  completeAchievement: (achievementId: string, points?: number) => void;

  /**
   * Desbloquear badge.
   * TODO: Implementar cuando se active gamificación.
   * 
   * @param badgeId - ID del badge
   */
  unlockBadge: (badgeId: string) => void;

  /**
   * Resetear todos los datos de gamificación.
   * Útil para testing.
   */
  resetGamification: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  userId: null,
  userType: null,
  completedAchievements: new Set<string>(),
  totalPoints: 0,
  unlockedBadges: [],
  lastUpdated: null,
};

// ============================================
// CREATE STORE
// ============================================

/**
 * Store de gamificación (preparatorio).
 * 
 * ⚠️ Las acciones actualmente solo logean advertencias.
 * Implementar cuando se defina la estrategia de gamificación.
 */
export const useGamificationStore = create<GamificationState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Placeholder actions
        completeAchievement: (achievementId: string, points: number = 0) => {
          logger.warn('App', '⚠️ Gamification not yet implemented: completeAchievement', {
            achievementId,
            points,
          });
          
          // TODO: Implementar cuando se active
          // set((state) => ({
          //   completedAchievements: new Set([...state.completedAchievements, achievementId]),
          //   totalPoints: state.totalPoints + points,
          //   lastUpdated: new Date(),
          // }));
        },

        unlockBadge: (badgeId: string) => {
          logger.warn('App', '⚠️ Gamification not yet implemented: unlockBadge', {
            badgeId,
          });

          // TODO: Implementar cuando se active
          // set((state) => ({
          //   unlockedBadges: state.unlockedBadges.includes(badgeId)
          //     ? state.unlockedBadges
          //     : [...state.unlockedBadges, badgeId],
          //   lastUpdated: new Date(),
          // }));
        },

        resetGamification: () => {
          set({
            ...initialState,
            completedAchievements: new Set(),
          });
          logger.info('App', 'Gamification data reset');
        },
      }),

      // ============================================
      // PERSIST CONFIG
      // ============================================
      {
        name: 'gamification-storage',
        partialize: (state) => ({
          userId: state.userId,
          userType: state.userType,
          completedAchievements: Array.from(state.completedAchievements),
          totalPoints: state.totalPoints,
          unlockedBadges: state.unlockedBadges,
          lastUpdated: state.lastUpdated,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Reconstruct Set from persisted array
            state.completedAchievements = new Set(
              (state.completedAchievements as any) || []
            );
            logger.info('App', 'Gamification store rehydrated (not active)');
          }
        },
      }
    ),

    // ============================================
    // DEVTOOLS CONFIG
    // ============================================
    {
      name: 'GamificationStore',
      enabled: false, // Disabled until implemented
    }
  )
);

/**
 * Default export
 */
export default useGamificationStore;
