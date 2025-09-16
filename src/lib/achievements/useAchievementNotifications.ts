/**
 * Hook para integrar notificaciones de logros con el sistema de alertas
 * 
 * Este hook conecta el AchievementNotificationService con el contexto de alertas de React
 */

import { useEffect } from 'react';
import { useAlerts } from '@/shared/alerts/hooks/useAlerts';
import { achievementNotificationService } from './AchievementNotificationService';

/**
 * Hook que inicializa las notificaciones de logros
 */
export function useAchievementNotifications() {
  const { actions } = useAlerts();

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