/**
 * Inicialización del Sistema de Evolución y Logros
 * 
 * Configura y conecta todos los componentes del sistema de gamificación:
 * - AchievementsEngine para escuchar eventos de negocio
 * - BusinessCapabilitiesStore para reaccionar a activaciones
 * - EventBus para comunicación entre módulos
 */

import { AchievementsEngine } from '../../pages/admin/gamification/achievements/services/AchievementsEngine';
import eventBus from '../events/EventBus';

import { logger } from '@/lib/logging';
export interface AchievementSystemConfig {
  userId?: string;
  autoStart?: boolean;
  enableLogging?: boolean;
}

/**
 * Clase principal para gestionar la inicialización del sistema de logros
 */
export class AchievementSystemManager {
  private static instance: AchievementSystemManager | null = null;
  private achievementsEngine: AchievementsEngine | null = null;
  private isInitialized = false;
  private config: AchievementSystemConfig = {};

  private constructor() {}

  /**
   * Obtiene la instancia singleton del manager
   */
  public static getInstance(): AchievementSystemManager {
    if (!AchievementSystemManager.instance) {
      AchievementSystemManager.instance = new AchievementSystemManager();
    }
    return AchievementSystemManager.instance;
  }

  /**
   * Inicializa todo el sistema de logros
   */
  public async initialize(config: AchievementSystemConfig = {}): Promise<void> {
    if (this.isInitialized) {
      logger.warn('CapabilitySystem', '[AchievementSystem] Sistema ya inicializado');
      return;
    }

    this.config = { autoStart: true, enableLogging: true, ...config };

    try {
      logger.info('CapabilitySystem', '[AchievementSystem] 🚀 Inicializando sistema de logros...');

      // TODO: Integración con nuevo sistema de capabilities unificado
      // La integración legacy de businessCapabilitiesStore ha sido removida

      // 1. Inicializar el motor de logros si tenemos userId
      if (this.config.userId) {
        await this.startAchievementsEngine(this.config.userId);
      }

      // 3. Registrar eventos de depuración si está habilitado
      if (this.config.enableLogging) {
        this.setupEventLogging();
      }

      this.isInitialized = true;
      logger.info('CapabilitySystem', '[AchievementSystem] ✅ Sistema de logros inicializado correctamente');

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementSystem] ❌ Error inicializando sistema:', error);
      throw error;
    }
  }

  /**
   * Inicia el motor de logros para un usuario específico
   */
  public async startAchievementsEngine(userId: string): Promise<void> {
    try {
      if (this.achievementsEngine) {
        await this.achievementsEngine.destroy();
      }

      this.achievementsEngine = AchievementsEngine.getInstance();
      await this.achievementsEngine.initialize(userId);
      
      logger.info('CapabilitySystem', '[AchievementSystem] ⚡ Motor de logros iniciado para usuario:', userId);
      
    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementSystem] Error iniciando motor de logros:', error);
      throw error;
    }
  }

  /**
   * Detiene el motor de logros
   */
  public async stopAchievementsEngine(): Promise<void> {
    if (this.achievementsEngine) {
      await this.achievementsEngine.destroy();
      this.achievementsEngine = null;
      logger.info('CapabilitySystem', '[AchievementSystem] 🛑 Motor de logros detenido');
    }
  }

  /**
   * Configura logging de eventos para debugging
   */
  private setupEventLogging(): void {
    // Eventos de hitos completados
    eventBus.on('milestone:completed' as any, (event: any) => {
      logger.info('CapabilitySystem', '[AchievementSystem] 🎯 Hito completado:', {
        milestone: event.milestoneId || event.milestone_id,
        user: event.userId || event.user_id,
        capability: event.capabilityId || event.capability_id
      });
    });

    // Eventos de capacidades activadas
    eventBus.on('capability:activated' as any, (event: any) => {
      logger.info('CapabilitySystem', '[AchievementSystem] 🎉 Capacidad activada:', {
        capability: event.capabilityId,
        user: event.userId,
        milestones: event.data?.completedMilestones?.length || 0
      });
    });

    // Eventos de progreso actualizado
    eventBus.on('progress:updated' as any, (event: any) => {
      logger.info('CapabilitySystem', '[AchievementSystem] 📈 Progreso actualizado:', {
        capability: event.capabilityId || event.capability_id,
        user: event.userId || event.user_id,
        progress: event.progress?.progressPercentage || 'N/A'
      });
    });

    logger.info('CapabilitySystem', '[AchievementSystem] 📝 Logging de eventos habilitado');
  }

  /**
   * Simula la completación de un hito (para testing)
   */
  public async simulateMilestoneCompletion(milestoneId: string, userId?: string): Promise<void> {
    const targetUserId = userId || this.config.userId;
    if (!targetUserId) {
      throw new Error('UserId requerido para simular hito');
    }

    if (!this.achievementsEngine) {
      throw new Error('Motor de logros no inicializado');
    }

    try {
      // Crear evento simulado
      const mockEvent = {
        type: 'business.milestone.completed',
        action: 'milestone_completed',
        timestamp: Date.now(),
        userId: targetUserId,
        data: { 
          milestoneId,
          source: 'simulation'
        }
      };

      logger.info('CapabilitySystem', '[AchievementSystem] 🧪 Simulando completación de hito:', milestoneId);
      
      // Emitir evento
      await eventBus.emit('business.milestone.completed' as any, mockEvent);
      
    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementSystem] Error simulando hito:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado del sistema
   */
  public getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasAchievementsEngine: !!this.achievementsEngine,
      userId: this.config.userId,
      config: this.config
    };
  }

  /**
   * Limpia y destruye el sistema
   */
  public async destroy(): Promise<void> {
    try {
      await this.stopAchievementsEngine();
      this.isInitialized = false;
      this.config = {};
      
      logger.info('CapabilitySystem', '[AchievementSystem] 🗑️ Sistema de logros destruido');
      
    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementSystem] Error destruyendo sistema:', error);
    }
  }
}

/**
 * Función de conveniencia para inicializar el sistema
 */
export async function initializeAchievementSystem(config: AchievementSystemConfig = {}): Promise<AchievementSystemManager> {
  const manager = AchievementSystemManager.getInstance();
  await manager.initialize(config);
  return manager;
}

/**
 * Hook de React para usar el sistema de logros
 */
export function useAchievementSystem(userId?: string) {
  const manager = AchievementSystemManager.getInstance();
  
  const startForUser = async (targetUserId: string) => {
    await manager.startAchievementsEngine(targetUserId);
  };

  const simulateMilestone = async (milestoneId: string) => {
    await manager.simulateMilestoneCompletion(milestoneId, userId);
  };

  return {
    manager,
    startForUser,
    simulateMilestone,
    status: manager.getStatus(),
  };
}

// Exportar instancia singleton para uso directo
export const achievementSystem = AchievementSystemManager.getInstance();