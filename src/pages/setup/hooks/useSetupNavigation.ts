import { useCallback } from 'react';
import { STEP_GROUPS } from '../config/setupSteps';
import { SupabaseCredentials, AdminUserData } from './useSetupState';

export interface ValidationResult {
  canProceed: boolean;
  reason?: string;
}

export function useSetupNavigation(
  currentGroup: number,
  currentSubStep: number,
  setCurrentGroup: (group: number) => void,
  setCurrentSubStep: (subStep: number) => void,
  saveProgress: () => void,
  supabaseCredentials: SupabaseCredentials | null,
  userName: string,
  adminUserData: AdminUserData | null
) {
  // Get current component name
  const getCurrentComponent = useCallback(() => {
    const currentGroupData = STEP_GROUPS[currentGroup];
    const currentSubStepData = currentGroupData?.subSteps[currentSubStep];
    return currentSubStepData?.component || 'welcome';
  }, [currentGroup, currentSubStep]);

  // Validation logic for step prerequisites
  const canProceedToStep = useCallback((groupIndex: number, subStepIndex: number): ValidationResult => {
    const group = STEP_GROUPS[groupIndex];
    const step = group?.subSteps[subStepIndex];
    
    if (!group || !step) {
      return { canProceed: false, reason: 'Step no encontrado' };
    }

    // If step/group is optional, allow access
    if (step.required === false || group.required === false) {
      return { canProceed: true };
    }

    // Specific validations for required steps
    if (group.id === 'infrastructure') {
      if (step.id === 'database' && !supabaseCredentials) {
        return { canProceed: false, reason: 'Necesitas conectar con Supabase primero' };
      }
      if (step.id === 'verification' && !supabaseCredentials) {
        return { canProceed: false, reason: 'Necesitas configurar la base de datos primero' };
      }
    }

    if (group.id === 'system-setup') {
      if (!supabaseCredentials) {
        return { canProceed: false, reason: 'Necesitas completar la configuración de infraestructura primero' };
      }
    }

    if (group.id === 'business-setup') {
      // Business setup is optional, always allow
      return { canProceed: true };
    }

    if (group.id === 'completion') {
      if (!userName) {
        return { canProceed: false, reason: 'Necesitas completar al menos el nombre de usuario' };
      }
      if (!adminUserData) {
        return { canProceed: false, reason: 'Necesitas crear el usuario administrador para finalizar' };
      }
    }

    return { canProceed: true };
  }, [supabaseCredentials, userName, adminUserData]);

  // Navigate to next sub-step or group
  const nextSubStep = useCallback(() => {
    console.log('🚀 nextSubStep called', { currentGroup, currentSubStep });
    const currentGroupData = STEP_GROUPS[currentGroup];
    
    if (currentSubStep < currentGroupData.subSteps.length - 1) {
      // Check if can proceed to next sub-step
      const validation = canProceedToStep(currentGroup, currentSubStep + 1);
      if (!validation.canProceed) {
        console.warn('Cannot proceed:', validation.reason);
        return;
      }
      console.log('📍 Moving to next sub-step:', currentSubStep + 1);
      setCurrentSubStep(currentSubStep + 1);
    } else if (currentGroup < STEP_GROUPS.length - 1) {
      // Check if can proceed to next group
      const validation = canProceedToStep(currentGroup + 1, 0);
      if (!validation.canProceed) {
        console.warn('Cannot proceed to next group:', validation.reason);
        return;
      }
      console.log('📍 Moving to next group:', currentGroup + 1);
      setCurrentGroup(currentGroup + 1);
      setCurrentSubStep(0);
    }
    
    // Save progress after navigation
    setTimeout(() => {
      console.log('💾 Saving progress after navigation');
      saveProgress();
    }, 100);
  }, [currentGroup, currentSubStep, setCurrentGroup, setCurrentSubStep, canProceedToStep, saveProgress]);

  // Navigate to previous sub-step or group
  const prevSubStep = useCallback(() => {
    console.log('⬅️ prevSubStep called', { currentGroup, currentSubStep });
    if (currentSubStep > 0) {
      console.log('📍 Moving to previous sub-step:', currentSubStep - 1);
      setCurrentSubStep(currentSubStep - 1);
    } else if (currentGroup > 0) {
      console.log('📍 Moving to previous group:', currentGroup - 1);
      setCurrentGroup(currentGroup - 1);
      const prevGroup = STEP_GROUPS[currentGroup - 1];
      setCurrentSubStep(prevGroup.subSteps.length - 1);
    }
    
    // Save progress after navigation
    setTimeout(() => {
      console.log('💾 Saving progress after backward navigation');
      saveProgress();
    }, 100);
  }, [currentGroup, currentSubStep, setCurrentGroup, setCurrentSubStep, saveProgress]);

  // Skip current optional step
  const skipCurrentStep = useCallback(() => {
    const currentGroupData = STEP_GROUPS[currentGroup];
    const currentStepId = currentGroupData?.subSteps[currentSubStep]?.id;
    
    console.log('Skipping optional step:', currentStepId);
    nextSubStep();
  }, [currentGroup, currentSubStep, nextSubStep]);

  // Calculate progress percentage
  const getProgressPercentage = useCallback(() => {
    return ((currentGroup + 1) / STEP_GROUPS.length) * 100;
  }, [currentGroup]);

  // Jump to specific group
  const jumpToGroup = useCallback((groupIndex: number) => {
    setCurrentGroup(groupIndex);
    setCurrentSubStep(0);
  }, [setCurrentGroup, setCurrentSubStep]);

  // Jump to specific sub-step
  const jumpToSubStep = useCallback((subStepIndex: number) => {
    setCurrentSubStep(subStepIndex);
  }, [setCurrentSubStep]);

  return {
    getCurrentComponent,
    canProceedToStep,
    nextSubStep,
    prevSubStep,
    skipCurrentStep,
    getProgressPercentage,
    jumpToGroup,
    jumpToSubStep,
  };
}