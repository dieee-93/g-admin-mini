/**
 * ACHIEVEMENTS STORE (Refactored v2.0)
 *
 * Zustand store para UI state del sistema de Achievements.
 *
 * ⚠️ ARQUITECTURA REFACTORIZADA:
 * - SOLO maneja UI state (modals)
 * - NO maneja datos de servidor (usar TanStack Query)
 * - NO maneja gamificación (ver gamificationStore.ts)
 * - NO maneja requirements registry (ver requirements/)
 * - NO maneja progress cache (se computa on-demand)
 *
 * RESPONSABILIDADES:
 * - ✅ Modal de setup requerido (open/close state)
 * - ✅ Datos del modal actual (missing requirements, progress)
 *
 * NO MANEJA:
 * - ❌ Gamificación (points/badges) → Ver gamificationStore.ts
 * - ❌ Requirements registry → Ver requirements/index.ts
 * - ❌ Progress computation → Ver services/progressCalculator.ts
 *
 * @version 2.0.0
 * @see gamificationStore.ts - Para datos de gamificación (futuro)
 * @see requirements/ - Para requirements del sistema
 * @see services/progressCalculator.ts - Para cálculo de progreso
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { logger } from '@/lib/logging';
import type { SetupModalData } from '@/modules/achievements/types';

// ============================================
// STATE INTERFACE
// ============================================

export interface AchievementsState {
  // ============================================
  // MODAL STATE (UI Only)
  // ============================================

  /** Si el modal de setup está abierto */
  isSetupModalOpen: boolean;

  /** Datos del modal actual (title, missing requirements, progress) */
  setupModalData: SetupModalData | null;

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Abrir modal de setup requerido.
   * Muestra al usuario qué requirements faltan para usar una capability.
   *
   * @param data - Datos del modal (title, missing requirements, progress)
   */
  openSetupModal: (data: SetupModalData) => void;

  /**
   * Cerrar modal de setup.
   */
  closeSetupModal: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  isSetupModalOpen: false,
  setupModalData: null,
};

// ============================================
// CREATE STORE
// ============================================

export const useAchievementsStore = create<AchievementsState>()(
  devtools(
    (set) => ({
      // Initial state
      ...initialState,

      // ============================================
      // MODAL ACTIONS
      // ============================================

      openSetupModal: (data: SetupModalData) => {
        set(
          {
            isSetupModalOpen: true,
            setupModalData: data,
          },
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
          {
            isSetupModalOpen: false,
            setupModalData: null,
          },
          false,
          'closeSetupModal'
        );

        logger.debug('App', 'Setup modal closed');
      },
    }),

    // ============================================
    // DEVTOOLS CONFIG
    // ============================================
    {
      name: 'AchievementsStore',
      enabled: import.meta.env.DEV,
    }
  )
);

// ============================================
// SELECTOR HOOKS
// ============================================

/**
 * Hook para acceder al estado del modal de setup.
 * Retorna el estado del modal y las acciones necesarias.
 */
export const useSetupModalState = () =>
  useAchievementsStore((state) => ({
    isOpen: state.isSetupModalOpen,
    data: state.setupModalData,
    onClose: state.closeSetupModal,
  }));

/**
 * Default export
 */
export default useAchievementsStore;
