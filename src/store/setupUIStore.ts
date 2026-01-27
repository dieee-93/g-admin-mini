/**
 * SETUP UI STORE - Zustand Store
 *
 * Layer 3 of capabilityStore migration:
 * - UI state ONLY (setup flow, onboarding, welcome screen)
 * - NO business logic
 * - NO server state
 *
 * Migration from: capabilityStore.ts (UI state only)
 * Pattern: Client UI state → Zustand (project convention)
 *
 * Created: 2025-01-14
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

interface SetupUIStore {
  // UI State - Setup Flow
  setupCompleted: boolean;
  isFirstTimeInDashboard: boolean;
  onboardingStep: number;

  // UI State - Modals/Dialogs
  isSetupModalOpen: boolean;
  isWelcomeModalOpen: boolean;

  // Actions
  completeSetup: () => void;
  dismissWelcome: () => void;
  setOnboardingStep: (step: number) => void;
  openSetupModal: () => void;
  closeSetupModal: () => void;
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;
  resetSetup: () => void;
}

// ============================================
// DEFAULT STATE
// ============================================

const DEFAULT_STATE = {
  setupCompleted: false,
  isFirstTimeInDashboard: false,
  onboardingStep: 0,
  isSetupModalOpen: false,
  isWelcomeModalOpen: false,
};

// ============================================
// STORE
// ============================================

/**
 * Setup UI Store
 * 
 * Responsibility: UI state for setup/onboarding flow ONLY
 * - Setup completion status
 * - Welcome screen visibility
 * - Onboarding step tracking
 * - Modal open/closed state
 * 
 * NOT responsible for:
 * - Profile data (Layer 1: useBusinessProfile)
 * - Feature flags (Layer 2: FeatureFlagContext)
 * - Business logic
 */
export const useSetupUIStore = create<SetupUIStore>()(
  devtools(
    (set) => ({
      // ============================================
      // STATE
      // ============================================

      ...DEFAULT_STATE,

      // ============================================
      // ACTIONS
      // ============================================

      completeSetup: () => {
        set({
          setupCompleted: true,
          isFirstTimeInDashboard: true,
          onboardingStep: 1,
          isSetupModalOpen: false,
        });
      },

      dismissWelcome: () => {
        set({
          isFirstTimeInDashboard: false,
          isWelcomeModalOpen: false,
        });
      },

      setOnboardingStep: (step: number) => {
        set({ onboardingStep: step });
      },

      openSetupModal: () => {
        set({ isSetupModalOpen: true });
      },

      closeSetupModal: () => {
        set({ isSetupModalOpen: false });
      },

      openWelcomeModal: () => {
        set({ isWelcomeModalOpen: true });
      },

      closeWelcomeModal: () => {
        set({ isWelcomeModalOpen: false });
      },

      resetSetup: () => {
        set(DEFAULT_STATE);
      },
    }),
    { name: 'SetupUIStore' }
  )
);

// ============================================
// ATOMIC SELECTORS (Performance Optimized)
// ============================================

/**
 * Atomic selectors - only re-render when specific value changes
 */

export const useIsSetupCompleted = () =>
  useSetupUIStore(state => state.setupCompleted);

export const useIsFirstTimeInDashboard = () =>
  useSetupUIStore(state => state.isFirstTimeInDashboard);

export const useOnboardingStep = () =>
  useSetupUIStore(state => state.onboardingStep);

export const useIsSetupModalOpen = () =>
  useSetupUIStore(state => state.isSetupModalOpen);

export const useIsWelcomeModalOpen = () =>
  useSetupUIStore(state => state.isWelcomeModalOpen);

// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * @example
 * // Component using setup state
 * import { useSetupUIStore, useIsSetupCompleted } from '@/store/setupUIStore';
 * 
 * function SetupWizard() {
 *   const completeSetup = useSetupUIStore(state => state.completeSetup);
 *   const isCompleted = useIsSetupCompleted(); // Atomic selector
 * 
 *   return (
 *     <button onClick={completeSetup}>
 *       Complete Setup
 *     </button>
 *   );
 * }
 * 
 * @example
 * // Modal management
 * import { useSetupUIStore } from '@/store/setupUIStore';
 * 
 * function WelcomeModal() {
 *   const isOpen = useSetupUIStore(state => state.isWelcomeModalOpen);
 *   const dismissWelcome = useSetupUIStore(state => state.dismissWelcome);
 * 
 *   return (
 *     <Modal isOpen={isOpen} onClose={dismissWelcome}>
 *       Welcome to G-Admin Mini!
 *     </Modal>
 *   );
 * }
 */
