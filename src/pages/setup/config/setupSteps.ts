export interface SetupSubStep {
  id: string;
  title: string;
  component: string;
  required: boolean;
  description?: string;
}

export interface SetupStepGroup {
  id: string;
  title: string;
  required: boolean;
  subSteps: SetupSubStep[];
}

export const STEP_GROUPS: SetupStepGroup[] = [
  {
    id: 'welcome',
    title: 'Bienvenida',
    required: true,
    subSteps: [
      { 
        id: 'welcome', 
        title: 'Introducción', 
        component: 'welcome', 
        required: true 
      }
    ]
  },
  {
    id: 'infrastructure',
    title: 'Infraestructura',
    required: true,
    subSteps: [
      { 
        id: 'supabase', 
        title: 'Conexión Supabase', 
        component: 'supabase', 
        required: true 
      },
      { 
        id: 'database', 
        title: 'Configurar DB', 
        component: 'database', 
        required: true 
      },
      { 
        id: 'verification', 
        title: 'Verificar Sistema', 
        component: 'verification', 
        required: false, 
        description: 'Opcional: Verificaciones adicionales del sistema' 
      }
    ]
  },
  {
    id: 'system-setup',
    title: 'Sistema',
    required: true,
    subSteps: [
      { 
        id: 'admin-user', 
        title: 'Usuario Admin', 
        component: 'admin-user', 
        required: true 
      },
      { 
        id: 'basic-config', 
        title: 'Configuración Básica', 
        component: 'basic-config', 
        required: false, 
        description: 'Opcional: Configuraciones de sistema avanzadas' 
      }
    ]
  },
  {
    id: 'business-setup',
    title: 'Negocio',
    required: true,
    subSteps: [
      { 
        id: 'business-model', 
        title: 'Modelo de Negocio', 
        component: 'business-model', 
        required: true 
      }
    ]
  },
  {
    id: 'completion',
    title: 'Finalización',
    required: true,
    subSteps: [
      { 
        id: 'summary', 
        title: 'Resumen', 
        component: 'summary', 
        required: true 
      },
      { 
        id: 'finish', 
        title: 'Completado', 
        component: 'finish', 
        required: true 
      }
    ]
  }
];

export interface SetupStep {
  id: string;
  title: string;
  completed: boolean;
  current: boolean;
  disabled: boolean;
}

export function createSetupSteps(currentGroup: number): SetupStep[] {
  return STEP_GROUPS.map((group, idx) => ({
    id: group.id,
    title: group.title,
    completed: currentGroup > idx,
    current: currentGroup === idx,
    disabled: currentGroup < idx,
  }));
}