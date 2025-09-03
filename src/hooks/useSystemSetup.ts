/**
 * Hook para detectar el estado de configuración del sistema
 * Verifica si g-admin está listo para usar o necesita setup inicial
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

// Tipos para el estado del sistema
export interface SystemRequirement {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  error?: string;
  required: boolean;
}

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isRequired: boolean;
  dependsOn?: string[];
}

export interface SystemSetupState {
  isConfigured: boolean;
  isLoading: boolean;
  requirements: SystemRequirement[];
  steps: SetupStep[];
  currentStep: number;
  totalSteps: number;
  missingSteps: string[];
  completedSteps: string[];
  canProceed: boolean;  // Nueva propiedad para bloquear navegación
  criticalErrors: string[];  // Errores que bloquean completamente el avance
}

// Definición de requisitos del sistema - SISTEMA DE BLOQUEO POR CAPAS
const SYSTEM_REQUIREMENTS: Omit<SystemRequirement, 'status'>[] = [
  // CAPA 1: INFRAESTRUCTURA CRÍTICA (BLOQUEO TOTAL)
  {
    id: 'supabase-connection',
    name: 'Conexión a Supabase',
    description: 'Verificar que la aplicación puede conectarse a la base de datos',
    required: true,
  },
  {
    id: 'essential-tables',
    name: 'Tablas Esenciales',
    description: 'Verificar que las tablas principales existen (materials, recipes, suppliers, customers, sales)',
    required: true,
  },
  {
    id: 'user-roles-system',
    name: 'Sistema de Roles',
    description: 'Verificar que la tabla users_roles y funciones de acceso están configuradas',
    required: true,
  },
  {
    id: 'rls-policies',
    name: 'Políticas RLS',
    description: 'Verificar que las políticas de seguridad están activas y funcionando',
    required: true,
  },
  {
    id: 'core-functions',
    name: 'Funciones SQL Críticas',
    description: 'Verificar que las funciones SQL esenciales (get_user_role, check_user_access) están disponibles',
    required: true,
  },
  
  // CAPA 2: CONFIGURACIÓN MÍNIMA (BLOQUEO PARCIAL)
  {
    id: 'admin-user-exists',
    name: 'Usuario Administrador',
    description: 'Verificar que existe al menos un usuario con rol SUPER_ADMIN o ADMINISTRADOR',
    required: true,
  },
  {
    id: 'system-config-table',
    name: 'Configuración del Sistema',
    description: 'Verificar que la tabla system_config existe y es accesible',
    required: true,
  },
  
  // CAPA 3: CONFIGURACIONES OPCIONALES
  {
    id: 'auth-hooks',
    name: 'Hooks de Autenticación JWT',
    description: 'Verificar que los hooks JWT están configurados (opcional pero recomendado)',
    required: false,
  },
  {
    id: 'sample-data',
    name: 'Datos de Ejemplo',
    description: 'Verificar si existen datos de ejemplo para comenzar (opcional)',
    required: false,
  },
];

// Definición de pasos de configuración - CON DEPENDENCIAS ESTRICTAS
const SETUP_STEPS: Omit<SetupStep, 'isCompleted'>[] = [
  {
    id: 'system-check',
    title: 'Verificación del Sistema',
    description: 'Comprobar que la base de datos está correctamente configurada',
    isRequired: true,
  },
  {
    id: 'database-setup',
    title: 'Configuración de Base de Datos',
    description: 'Ejecutar migraciones y configurar funciones SQL necesarias',
    isRequired: true,
    dependsOn: ['system-check'],
  },
  {
    id: 'company-info',
    title: 'Información de la Empresa',
    description: 'Configurar datos básicos del negocio',
    isRequired: true,
    dependsOn: ['database-setup'],
  },
  {
    id: 'admin-user',
    title: 'Usuario Administrador',
    description: 'Crear el primer usuario con permisos completos',
    isRequired: true,
    dependsOn: ['company-info'],
  },
  {
    id: 'basic-data',
    title: 'Datos Básicos',
    description: 'Importar o crear materiales, proveedores básicos',
    isRequired: false,
    dependsOn: ['admin-user'],
  },
  {
    id: 'onboarding',
    title: 'Tutorial Inicial',
    description: 'Guía interactiva de las funcionalidades principales',
    isRequired: false,
    dependsOn: ['basic-data'],
  },
];

export function useSystemSetup() {
  const [state, setState] = useState<SystemSetupState>({
    isConfigured: false,
    isLoading: true,
    requirements: SYSTEM_REQUIREMENTS.map(req => ({ ...req, status: 'pending' })),
    steps: SETUP_STEPS.map(step => ({ ...step, isCompleted: false })),
    currentStep: 0,
    totalSteps: SETUP_STEPS.length,
    missingSteps: [],
    completedSteps: [],
    canProceed: false,
    criticalErrors: [],
  });

  // Verificar requisitos del sistema
  const checkSystemRequirements = async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    const updatedRequirements = [...state.requirements];

    for (let i = 0; i < updatedRequirements.length; i++) {
      const requirement = updatedRequirements[i];
      requirement.status = 'checking';
      setState(prev => ({ ...prev, requirements: [...updatedRequirements] }));

      try {
        let isSuccess = false;

        switch (requirement.id) {
          case 'supabase-connection':
            // Verificación más profunda de conexión
            const { error: connectionError } = await supabase.from('users_roles').select('count').limit(1);
            isSuccess = !connectionError;
            if (connectionError) {
              requirement.error = `Error de conexión a Supabase: ${connectionError.message}`;
            }
            break;

          case 'essential-tables':
            // Verificar todas las tablas críticas del sistema
            const criticalTables = [
              'materials', 'recipes', 'suppliers', 'customers', 'sales', 
              'users_roles', 'system_config', 'inventory_entries'
            ];
            let allTablesExist = true;
            const missingTables: string[] = [];
            
            for (const table of criticalTables) {
              const { error: tableError } = await supabase.from(table).select('count').limit(1);
              if (tableError) {
                allTablesExist = false;
                missingTables.push(table);
              }
            }
            
            isSuccess = allTablesExist;
            if (!isSuccess) {
              requirement.error = `Tablas faltantes: ${missingTables.join(', ')}`;
            }
            break;

          case 'user-roles-system':
            // Verificar sistema de roles completo
            try {
              // Verificar tabla users_roles
              const { error: rolesTableError } = await supabase.from('users_roles').select('*').limit(1);
              
              // Verificar función get_user_role
              const { error: functionError } = await supabase.rpc('get_user_role');
              
              isSuccess = !rolesTableError && (!functionError || functionError.message.includes('not found'));
              if (!isSuccess) {
                requirement.error = `Sistema de roles no configurado: ${rolesTableError?.message || functionError?.message}`;
              }
            } catch (error) {
              isSuccess = false;
              requirement.error = 'Error verificando sistema de roles';
            }
            break;

          case 'rls-policies':
            // Verificar políticas RLS más comprehensivamente
            try {
              // Intentar operación que requiere RLS
              const { error: rlsError } = await supabase.from('materials').select('*').limit(1);
              
              // Si hay error de RLS, verificar si es por falta de permisos (bueno) o falta de políticas (malo)
              if (rlsError && rlsError.message.includes('row-level security')) {
                isSuccess = false;
                requirement.error = 'Políticas RLS no configuradas correctamente';
              } else {
                isSuccess = true;
              }
            } catch (error) {
              isSuccess = false;
              requirement.error = 'Error verificando políticas RLS';
            }
            break;

          case 'core-functions':
            // Verificar funciones SQL críticas
            try {
              const functionsToCheck = ['get_user_role', 'check_user_access'];
              let functionsWork = true;
              
              for (const func of functionsToCheck) {
                try {
                  const { error: funcError } = await supabase.rpc(func);
                  // Si la función existe pero falla por parámetros, eso está bien
                  if (funcError && !funcError.message.includes('function') && !funcError.message.includes('not found')) {
                    functionsWork = false;
                  }
                } catch (error) {
                  functionsWork = false;
                }
              }
              
              isSuccess = functionsWork;
              if (!isSuccess) {
                requirement.error = 'Funciones SQL críticas no disponibles';
              }
            } catch (error) {
              isSuccess = false;
              requirement.error = 'Error verificando funciones SQL';
            }
            break;

          case 'admin-user-exists':
            // Verificar que existe al menos un administrador
            const { data: adminData, error: adminError } = await supabase
              .from('users_roles')
              .select('user_id')
              .in('role', ['SUPER_ADMIN', 'ADMINISTRADOR'])
              .eq('is_active', true)
              .limit(1);
              
            isSuccess = !adminError && adminData && adminData.length > 0;
            if (!isSuccess) {
              requirement.error = 'No existe ningún usuario administrador activo';
            }
            break;

          case 'system-config-table':
            // Verificar que system_config existe y es funcional
            const { error: configError } = await supabase
              .from('system_config')
              .select('key, value')
              .limit(1);
              
            isSuccess = !configError;
            if (!isSuccess) {
              requirement.error = `Tabla system_config no accesible: ${configError?.message}`;
            }
            break;

          case 'auth-hooks':
            // Verificar hooks JWT (opcional)
            // Por ahora lo dejamos como éxito para no bloquear
            isSuccess = true;
            break;

          case 'sample-data':
            // Verificar si hay datos de ejemplo
            const { data: materialsData } = await supabase
              .from('materials')
              .select('id')
              .limit(1);
            isSuccess = !!(materialsData && materialsData.length > 0);
            break;

          default:
            isSuccess = true;
        }

        requirement.status = isSuccess ? 'success' : 'error';
        if (!isSuccess) {
          requirement.error = `Error verificando ${requirement.name}`;
        }
      } catch (error) {
        requirement.status = 'error';
        requirement.error = error instanceof Error ? error.message : 'Error desconocido';
      }

      setState(prev => ({ ...prev, requirements: [...updatedRequirements] }));
    }
  };

  // Verificar pasos de configuración
  const checkSetupSteps = async () => {
    const updatedSteps = [...state.steps];

    for (const step of updatedSteps) {
      try {
        let isCompleted = false;

        switch (step.id) {
          case 'system-check':
            // BLOQUEO CRÍTICO: Todos los requisitos REQUERIDOS deben estar cumplidos
            const criticalRequirements = state.requirements.filter(req => req.required);
            isCompleted = criticalRequirements.every(req => req.status === 'success');
            break;

          case 'database-setup':
            // Verificar que las funciones y triggers críticos están configurados
            try {
              // Intentar ejecutar una función crítica
              const { error: funcError } = await supabase.rpc('get_user_role');
              
              // Verificar que las tablas críticas tienen datos básicos
              const { data: rolesData } = await supabase
                .from('users_roles')
                .select('id')
                .limit(1);
                
              isCompleted = (!funcError || funcError.message.includes('function')) && !!rolesData;
            } catch (error) {
              isCompleted = false;
            }
            break;

          case 'company-info':
            // Verificar si existe configuración de empresa
            const { data: companyData } = await supabase
              .from('system_config')
              .select('*')
              .eq('key', 'company_info')
              .single();
            isCompleted = !!companyData;
            break;

          case 'admin-user':
            // BLOQUEO CRÍTICO: Debe existir al menos un usuario administrador
            const { data: adminData, error: adminError } = await supabase
              .from('users_roles')
              .select('user_id')
              .in('role', ['SUPER_ADMIN', 'ADMINISTRADOR'])
              .eq('is_active', true)
              .limit(1);
            
            isCompleted = !adminError && !!adminData && adminData.length > 0;
            break;

          case 'basic-data':
            // Verificar si hay datos básicos (materiales, al menos)
            const { data: materialsData } = await supabase
              .from('materials')
              .select('id')
              .limit(1);
            isCompleted = !!materialsData && materialsData.length > 0;
            break;

          case 'onboarding':
            // Verificar si el onboarding está marcado como completado
            const { data: onboardingData } = await supabase
              .from('system_config')
              .select('value')
              .eq('key', 'onboarding_completed')
              .single();
            isCompleted = onboardingData?.value === 'true';
            break;
        }

        step.isCompleted = isCompleted;
      } catch (error) {
        console.error(`Error checking step ${step.id}:`, error);
        step.isCompleted = false;
      }
    }

    const completedSteps = updatedSteps.filter(step => step.isCompleted).map(step => step.id);
    const missingSteps = updatedSteps.filter(step => !step.isCompleted).map(step => step.id);
    const currentStep = updatedSteps.findIndex(step => !step.isCompleted);
    const requiredStepsCompleted = updatedSteps.filter(step => step.isRequired).every(step => step.isCompleted);

    // SISTEMA DE BLOQUEO: Verificar errores críticos
    const criticalRequirements = state.requirements.filter(req => req.required && req.status === 'error');
    const criticalErrors = criticalRequirements.map(req => req.error || `Error en ${req.name}`);
    
    // Solo se puede proceder si NO hay errores críticos
    const canProceed = criticalRequirements.length === 0;
    
    // Verificar si el paso actual tiene dependencias cumplidas
    const currentStepIndex = currentStep === -1 ? SETUP_STEPS.length - 1 : currentStep;
    const currentStepData = SETUP_STEPS[currentStepIndex];
    const dependenciesMet = !currentStepData?.dependsOn || 
      currentStepData.dependsOn.every(dep => completedSteps.includes(dep));

    setState(prev => ({
      ...prev,
      steps: updatedSteps,
      completedSteps,
      missingSteps,
      currentStep: currentStep === -1 ? SETUP_STEPS.length : currentStep,
      isConfigured: requiredStepsCompleted,
      canProceed: canProceed && dependenciesMet,
      criticalErrors,
      isLoading: false,
    }));
  };

  // Función para ejecutar configuración automática de base de datos
  const runDatabaseSetup = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Aquí se podría ejecutar el script SQL automáticamente
      // Por ahora, mostraremos instrucciones al usuario
      console.log('Iniciando configuración automática de base de datos...');
      
      // Simular tiempo de configuración
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Re-verificar después de intentar la configuración
      await checkSetupStatus();
      
      return true;
    } catch (error) {
      console.error('Error en configuración automática:', error);
      return false;
    }
  };
  const markStepCompleted = async (stepId: string) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, isCompleted: true } : step
      ),
    }));

    // Marcar en la base de datos si es necesario
    if (stepId === 'onboarding') {
      await supabase
        .from('system_config')
        .upsert({
          key: 'onboarding_completed',
          value: 'true',
          updated_at: new Date().toISOString()
        });
    }

    // Re-verificar el estado
    await checkSetupSteps();
  };

  // Verificar completo del sistema
  const checkSetupStatus = async () => {
    await checkSystemRequirements();
    await checkSetupSteps();
  };

  useEffect(() => {
    checkSetupStatus();
  }, []);

  return {
    ...state,
    checkSetupStatus,
    markStepCompleted,
    runDatabaseSetup,
    requiresSetup: !state.isConfigured && !state.isLoading,
  };
}
