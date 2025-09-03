/**
 * Lazy Loading - Sistema de Configuración Inicial
 * Componentes optimizados para setup y onboarding
 */

import { lazy } from 'react';

// Setup Wizard Principal
export const LazySetupWizard = lazy(() => 
  import('@/pages/setup/SetupWizard').then(module => ({
    default: module.default
  }))
);

// Setup Steps - Pasos individuales de configuración
export const LazyCompanyConfigurationStep = lazy(() => 
  import('@/pages/setup/steps/CompanyConfigurationStep').then(module => ({
    default: module.default
  }))
);

export const LazyAdminUserCreationStep = lazy(() => 
  import('@/pages/setup/steps/AdminUserCreationStep').then(module => ({
    default: module.default
  }))
);

export const LazyBasicDataImportStep = lazy(() => 
  import('@/pages/setup/steps/BasicDataImportStep').then(module => ({
    default: module.default
  }))
);

export const LazyOnboardingTutorialStep = lazy(() => 
  import('@/pages/setup/steps/OnboardingTutorialStep').then(module => ({
    default: module.default
  }))
);

// Mapa de componentes setup para routing dinámico
export const setupComponentMap = {
  SetupWizard: LazySetupWizard,
  CompanyConfigurationStep: LazyCompanyConfigurationStep,
  AdminUserCreationStep: LazyAdminUserCreationStep,
  BasicDataImportStep: LazyBasicDataImportStep,
  OnboardingTutorialStep: LazyOnboardingTutorialStep,
} as const;

export type SetupComponentName = keyof typeof setupComponentMap;
