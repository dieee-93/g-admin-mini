/**
 * Integración del Sistema de Logros con el Sistema de Alertas
 * 
 * Este servicio conecta el AchievementsEngine con el sistema de alertas
 * para mostrar notificaciones celebratorias cuando se desbloquean logros.
 */

import eventBus from '@/lib/events/EventBus';
import type { CapabilityActivationEvent, MasteryAchievementUnlockedEvent } from '@/pages/admin/gamification/achievements/types';
import type { CreateAlertInput } from '@/shared/alerts/types';

import { logger } from '@/lib/logging';
// Función para crear alerta desde fuera del contexto de React
declare global {
  interface Window {
    createAchievementAlert?: (input: CreateAlertInput) => Promise<string>;
  }
}

/**
 * Clase que gestiona las notificaciones de logros
 */
export class AchievementNotificationService {
  private static instance: AchievementNotificationService | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AchievementNotificationService {
    if (!AchievementNotificationService.instance) {
      AchievementNotificationService.instance = new AchievementNotificationService();
    }
    return AchievementNotificationService.instance;
  }

  /**
   * Inicializa el servicio de notificaciones
   */
  public initialize(): void {
    if (this.isInitialized) {
      logger.warn('CapabilitySystem', '[AchievementNotifications] Servicio ya inicializado');
      return;
    }

    try {
      // Escuchar eventos de activación de capacidades
      eventBus.on('capability:activated' as any, this.handleCapabilityActivated.bind(this));
      
      // Escuchar eventos de logros de maestría desbloqueados
      eventBus.on('achievement:unlocked' as any, this.handleMasteryAchievementUnlocked.bind(this));

      this.isInitialized = true;
      logger.info('CapabilitySystem', '[AchievementNotifications] ✅ Servicio de notificaciones de logros inicializado');

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementNotifications] ❌ Error inicializando servicio:', error);
    }
  }

  /**
   * Maneja eventos de activación de capacidades (hitos fundacionales)
   */
  private async handleCapabilityActivated(event: any): Promise<void> {
    try {
      const capabilityEvent = event as CapabilityActivationEvent;
      
      logger.info('CapabilitySystem', '[AchievementNotifications] 🎯 Capacidad activada:', capabilityEvent.capabilityId);

      const alertInput: CreateAlertInput = {
        type: 'achievement',
        severity: 'info',
        context: 'gamification',
        title: `🎉 ¡Capacidad "${capabilityEvent.capabilityName}" Activada!`,
        description: `Has completado todos los hitos fundacionales. Tu negocio ahora puede usar todas las funcionalidades de ${capabilityEvent.capabilityName}.`,
        metadata: {
          achievementId: capabilityEvent.capabilityId,
          achievementType: 'capability',
          achievementIcon: '🎯',
          achievementDomain: this.getDomainFromCapability(capabilityEvent.capabilityId),
          relatedUrl: '/admin/gamification/achievements'
        },
        persistent: false,
        autoExpire: 300, // 5 minutos
        actions: [
          {
            label: 'Ver Logros',
            variant: 'primary',
            action: () => {
              window.location.href = '/admin/gamification/achievements';
            },
            autoResolve: true
          },
          {
            label: 'Continuar',
            variant: 'secondary',
            action: () => {},
            autoResolve: true
          }
        ]
      };

      await this.createAlert(alertInput);

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementNotifications] Error procesando activación de capacidad:', error);
    }
  }

  /**
   * Maneja eventos de logros de maestría desbloqueados
   */
  private async handleMasteryAchievementUnlocked(event: any): Promise<void> {
    try {
      const masteryEvent = event as MasteryAchievementUnlockedEvent;
      
      logger.info('CapabilitySystem', '[AchievementNotifications] 🏆 Logro de maestría desbloqueado:', masteryEvent.achievementId);

      const alertInput: CreateAlertInput = {
        type: 'achievement',
        severity: 'info',
        context: 'gamification',
        title: `🏆 ¡Logro Desbloqueado: "${masteryEvent.achievementName}"!`,
        description: `¡Felicitaciones! Has desbloqueado un logro de ${masteryEvent.tier} en ${masteryEvent.domain}.`,
        metadata: {
          achievementId: masteryEvent.achievementId,
          achievementType: 'mastery',
          achievementIcon: '🏆',
          achievementDomain: masteryEvent.domain,
          experiencePoints: masteryEvent.points,
          relatedUrl: '/admin/gamification/achievements'
        },
        persistent: false,
        autoExpire: 300, // 5 minutos
        actions: [
          {
            label: 'Ver Galaxia',
            variant: 'primary',
            action: () => {
              window.location.href = '/admin/gamification/achievements';
            },
            autoResolve: true
          },
          {
            label: '¡Genial!',
            variant: 'secondary',
            action: () => {},
            autoResolve: true
          }
        ]
      };

      await this.createAlert(alertInput);

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementNotifications] Error procesando logro de maestría:', error);
    }
  }

  /**
   * Determina el dominio basado en el ID de capacidad
   */
  private getDomainFromCapability(capabilityId: string): string {
    if (capabilityId.includes('sells_products') || capabilityId.includes('sales')) {
      return 'sales';
    }
    if (capabilityId.includes('manages_') || capabilityId.includes('operations')) {
      return 'operations';
    }
    if (capabilityId.includes('staff') || capabilityId.includes('employee')) {
      return 'staff';
    }
    if (capabilityId.includes('inventory') || capabilityId.includes('stock')) {
      return 'materials';
    }
    return 'general';
  }

  /**
   * Crea una alerta usando la función global o localStorage como fallback
   */
  private async createAlert(alertInput: CreateAlertInput): Promise<void> {
    try {
      // Intentar usar la función global del contexto de React
      if (window.createAchievementAlert) {
        await window.createAchievementAlert(alertInput);
        return;
      }

      // Fallback: guardar en localStorage para que sea procesada después
      const pendingAlerts = JSON.parse(localStorage.getItem('pendingAchievementAlerts') || '[]');
      pendingAlerts.push({
        ...alertInput,
        timestamp: Date.now()
      });
      localStorage.setItem('pendingAchievementAlerts', JSON.stringify(pendingAlerts));
      
      logger.info('CapabilitySystem', '[AchievementNotifications] 📌 Alerta guardada para procesamiento posterior');

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementNotifications] Error creando alerta:', error);
    }
  }

  /**
   * Procesa alertas pendientes cuando el contexto esté disponible
   */
  public async processPendingAlerts(createAlertFn: (input: CreateAlertInput) => Promise<string>): Promise<void> {
    try {
      const pendingAlerts = JSON.parse(localStorage.getItem('pendingAchievementAlerts') || '[]');
      
      if (pendingAlerts.length === 0) {
        return;
      }

      logger.info('CapabilitySystem', `[AchievementNotifications] 📋 Procesando ${pendingAlerts.length} alertas pendientes`);

      for (const alertData of pendingAlerts) {
        try {
          await createAlertFn(alertData);
        } catch (error) {
          logger.error('CapabilitySystem', '[AchievementNotifications] Error procesando alerta pendiente:', error);
        }
      }

      // Limpiar alertas procesadas
      localStorage.removeItem('pendingAchievementAlerts');

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementNotifications] Error procesando alertas pendientes:', error);
    }
  }

  /**
   * Limpia y destruye el servicio
   */
  public destroy(): void {
    this.isInitialized = false;
    logger.info('CapabilitySystem', '[AchievementNotifications] 🗑️ Servicio destruido');
  }
}

/**
 * Instancia singleton del servicio
 */
export const achievementNotificationService = AchievementNotificationService.getInstance();