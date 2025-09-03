import { useMemo } from 'react';
import { SupabaseCredentials, AdminUserData } from './useSetupState';

export interface HealthCheck {
  status: boolean;
  label: string;
}

export interface SystemHealth {
  checks: Record<string, HealthCheck>;
  percentage: number;
  isHealthy: boolean;
}

export function useSetupHealth(
  userName: string,
  supabaseCredentials: SupabaseCredentials | null,
  adminUserData: AdminUserData | null
): SystemHealth {
  const health = useMemo((): SystemHealth => {
    const checks: Record<string, HealthCheck> = {
      userName: { 
        status: !!userName, 
        label: 'Nombre de usuario' 
      },
      supabaseConnection: { 
        status: !!supabaseCredentials, 
        label: 'Conexión Supabase' 
      },
      adminUser: { 
        status: !!adminUserData, 
        label: 'Usuario administrador' 
      },
      progressSaved: { 
        status: !!localStorage.getItem('setup-progress'), 
        label: 'Progreso guardado' 
      }
    };

    const passedChecks = Object.values(checks).filter(check => check.status).length;
    const totalChecks = Object.values(checks).length;
    
    return {
      checks,
      percentage: Math.round((passedChecks / totalChecks) * 100),
      isHealthy: passedChecks === totalChecks
    };
  }, [userName, supabaseCredentials, adminUserData]);

  return health;
}