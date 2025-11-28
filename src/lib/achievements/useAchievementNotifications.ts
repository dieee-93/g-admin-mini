/**
 * Hook para integrar notificaciones de logros con el sistema de alertas
 * 
 * Este hook conecta el AchievementNotificationService con el contexto de alertas de React
 */

import { useEffect } from 'react';
import { useAlertsActions } from '@/shared/alerts';
import { achievementNotificationService } from './AchievementNotificationService';

/**
 * Hook que inicializa las notificaciones de logros
 */
export function useAchievementNotifications() {
  // 🛠️ PERFORMANCE: Use useAlertsActions to avoid re-renders when alerts change
  const actions = useAlertsActions();

  useEffect(() => {
    // Registrar la función global para crear alertas
    window.createAchievementAlert = actions.create;

    // Inicializar el servicio de notificaciones
    achievementNotificationService.initialize();

    // Procesar alertas pendientes
    achievementNotificationService.processPendingAlerts(actions.create);

    // Cleanup al desmontar
    return () => {
      delete window.createAchievementAlert;
      achievementNotificationService.destroy();
    };
  }, [actions.create]);

  return {
    notificationService: achievementNotificationService
  };
}

export default useAchievementNotifications;