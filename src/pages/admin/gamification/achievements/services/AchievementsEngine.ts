/**
 * AchievementsEngine - Motor de Logros y Activación de Capacidades
 * 
 * Servicio central que:
 * 1. Escucha eventos de negocio a través del EventBus
 * 2. Actualiza progreso de hitos en base de datos
 * 3. Detecta cuando una capacidad debe activarse
 * 4. Dispara evento de activación de capacidad
 */

import eventBus from '../../../../../lib/events';
import type { EventPattern } from '../../../../../lib/events';
import { supabase } from '../../../../../lib/supabase/client';

// NEW v4.0: Use RequirementsRegistry instead of old milestones.ts
import {
  REQUIREMENTS_REGISTRY,
  getAllFoundationalMilestones,
  getAllMasteryAchievements,
  getFoundationalMilestone,
  getMasteryAchievement
} from '../../../../../config/RequirementsRegistry';

// Import capability store to update milestone completion
import { useCapabilityStore } from '../../../../../store/capabilityStore';

import { logger } from '@/lib/logging';
import type { 
  MilestoneDefinition, 
  AchievementProgress, 
  CapabilityActivationEvent,
  MasteryAchievementDefinition,
  MasteryConditions,
  UserAchievement,
  UserAchievementProgress,
  MasteryAchievementUnlockedEvent
} from '../types';

export class AchievementsEngine {
  private static instance: AchievementsEngine | null = null;
  private isInitialized = false;
  private userId: string | null = null;
  private masteryAchievements: MasteryAchievementDefinition[] = [];

  private constructor() {
    // El eventBus ya está configurado como singleton
  }

  /**
   * Singleton instance
   */
  public static getInstance(): AchievementsEngine {
    if (!AchievementsEngine.instance) {
      AchievementsEngine.instance = new AchievementsEngine();
    }
    return AchievementsEngine.instance;
  }

  /**
   * Inicializa el motor de logros con el usuario actual
   */
  public async initialize(userId: string): Promise<void> {
    if (this.isInitialized && this.userId === userId) {
      return;
    }

    this.userId = userId;
    
    // Cargar definiciones de logros de maestría
    await this.loadMasteryAchievements();
    
    // Configurar listeners para eventos
    await this.setupEventListeners();
    
    this.isInitialized = true;

    logger.info('CapabilitySystem', '[AchievementsEngine] Inicializado para usuario:', userId);
    logger.info('CapabilitySystem', '[AchievementsEngine] Logros de maestría cargados:', this.masteryAchievements.length);
  }

  /**
   * Carga las definiciones de logros de maestría desde la base de datos
   * FASE 2: Filtra logros según business model (condicionales)
   */
  private async loadMasteryAchievements(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true)
        .eq('type', 'mastery');

      if (error) {
        logger.error('CapabilitySystem', '[AchievementsEngine] Error cargando logros de maestría:', error);
        return;
      }

      let achievements = data || [];

      // FASE 2: Filtrar por business model del usuario (Logros Condicionales)
      const store = useCapabilityStore.getState();
      const userActivities = store.profile?.selectedActivities || [];
      const userInfrastructure = store.profile?.selectedInfrastructure || [];

      if (userActivities.length > 0 || userInfrastructure.length > 0) {
        achievements = achievements.filter(achievement => {
          // Si tiene requiredActivities, verificar que el usuario las tenga
          if (achievement.required_activities && achievement.required_activities.length > 0) {
            const hasRequired = achievement.required_activities.some((activity: string) =>
              userActivities.includes(activity as any)
            );
            if (!hasRequired) return false;
          }

          // Si tiene requiredInfrastructure, verificar
          if (achievement.required_infrastructure && achievement.required_infrastructure.length > 0) {
            const hasRequired = achievement.required_infrastructure.some((infra: string) =>
              userInfrastructure.includes(infra as any)
            );
            if (!hasRequired) return false;
          }

          // Sin requisitos = visible para todos
          return true;
        });

        logger.info(
          'CapabilitySystem',
          '[AchievementsEngine] Logros filtrados por business model:',
          achievements.length,
          'de',
          data?.length || 0
        );
      }

      this.masteryAchievements = achievements;

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error cargando logros de maestría:', error);
      this.masteryAchievements = [];
    }
  }

  /**
   * Configura listeners para todos los eventos de hitos y logros de maestría
   * NEW v4.0: Uses RequirementsRegistry
   * FASE 2: Workflows Automatizados
   */
  private async setupEventListeners(): Promise<void> {
    // Obtener todos los patterns de eventos únicos de hitos fundacionales
    const foundationalMilestones = getAllFoundationalMilestones();
    const milestonePatterns = new Set(
      foundationalMilestones.map(milestone => milestone.eventPattern)
    );

    // Obtener todos los patterns de eventos únicos de logros de maestría
    const masteryPatterns = new Set(
      this.masteryAchievements.map(achievement => achievement.trigger_event)
    );

    // Combinar todos los patterns únicos
    const allPatterns = new Set([...milestonePatterns, ...masteryPatterns]);

    // Registrar listener para cada pattern
    for (const pattern of allPatterns) {
      eventBus.on(pattern as EventPattern, async (event: any) => {
        await this.handleBusinessEvent(event);
      });
    }

    // FASE 2: Listener para workflows automatizados
    eventBus.on('milestone:completed', async (event: any) => {
      await this.handleMilestoneCompletedWorkflows(event);
    });

    logger.info('CapabilitySystem', '[AchievementsEngine] Configurados listeners para', allPatterns.size, 'tipos de eventos');
    logger.info('CapabilitySystem', '[AchievementsEngine] Hitos fundacionales:', milestonePatterns.size, 'Logros maestría:', masteryPatterns.size);
    logger.info('CapabilitySystem', '[AchievementsEngine] Workflows automatizados activados');
  }

  /**
   * Procesa un evento de negocio y actualiza hitos y logros relacionados
   */
  private async handleBusinessEvent(event: any): Promise<void> {
    if (!this.userId) {
      logger.warn('CapabilitySystem', '[AchievementsEngine] No hay usuario configurado');
      return;
    }

    try {
      // 1. Procesar hitos fundacionales
      await this.processFoundationalMilestones(event);
      
      // 2. Procesar logros de maestría
      await this.processMasteryAchievements(event);

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error procesando evento:', error);
    }
  }

  /**
   * Procesa hitos fundacionales para el evento recibido
   * NEW v4.0: Uses RequirementsRegistry
   */
  private async processFoundationalMilestones(event: any): Promise<void> {
    // Encontrar hitos que coincidan con este evento
    const allMilestones = getAllFoundationalMilestones();
    const matchingMilestones = allMilestones.filter(
      milestone => this.eventMatchesMilestone(milestone.eventPattern, event)
    );

    if (matchingMilestones.length === 0) {
      return;
    }

    logger.info('CapabilitySystem', '[AchievementsEngine] Procesando', matchingMilestones.length, 'hitos fundacionales para evento:', event.type);

    // Actualizar progreso de cada hito
    for (const milestone of matchingMilestones) {
      await this.completeMilestone(milestone.id, event);
    }
  }

  /**
   * Procesa logros de maestría para el evento recibido
   */
  private async processMasteryAchievements(event: any): Promise<void> {
    // Encontrar logros de maestría que coincidan con este evento
    const matchingAchievements = this.masteryAchievements.filter(
      achievement => achievement.trigger_event === event.type
    );

    if (matchingAchievements.length === 0) {
      return;
    }

    logger.info('CapabilitySystem', '[AchievementsEngine] Procesando', matchingAchievements.length, 'logros de maestría para evento:', event.type);

    // Evaluar cada logro de maestría
    for (const achievement of matchingAchievements) {
      await this.evaluateMasteryAchievement(achievement, event);
    }
  }

  /**
   * Verifica si un evento coincide con un patron de evento
   * NEW v4.0: Simplified - only checks event pattern
   */
  private eventMatchesMilestone(eventPattern: string, event: any): boolean {
    return event.type === eventPattern || event.eventPattern === eventPattern;
  }

  /**
   * Marca un hito como completado y actualiza el capabilityStore
   * NEW v4.0: Updates capabilityStore to trigger feature unlocking
   */
  private async completeMilestone(milestoneId: string, triggerEvent: any): Promise<void> {
    if (!this.userId) return;

    logger.info('CapabilitySystem', '[AchievementsEngine] Completando hito:', milestoneId);

    // NEW v4.0: Update capabilityStore immediately
    try {
      const store = useCapabilityStore.getState();
      store.completeMilestone(milestoneId);

      logger.info('CapabilitySystem', '[AchievementsEngine] ✅ Hito completado y store actualizado:', milestoneId);
    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error actualizando store:', error);
    }

    try {
      // Verificar si ya está completado
      const { data: existing } = await supabase
        .from('user_achievement_progress')
        .select('milestone_id')
        .eq('user_id', this.userId)
        .eq('milestone_id', milestoneId)
        .eq('completed', true)
        .single();

      if (existing) {
        return; // Ya completado
      }

      // Marcar como completado
      const { error: updateError } = await supabase
        .from('user_achievement_progress')
        .upsert({
          user_id: this.userId,
          milestone_id: milestoneId,
          completed: true,
          completed_at: new Date().toISOString(),
          trigger_event: {
            type: triggerEvent.type,
            timestamp: triggerEvent.timestamp,
            data: triggerEvent.data
          }
        });

      if (updateError) {
        throw updateError;
      }

      logger.info('CapabilitySystem', '[AchievementsEngine] Hito completado:', milestoneId);

      // Verificar si alguna capacidad debe activarse
      await this.checkCapabilityActivations(milestoneId);

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error completando hito:', error);
    }
  }

  /**
   * Verifica si las capacidades que requieren este hito pueden activarse
   */
  private async checkCapabilityActivations(completedMilestoneId: string): Promise<void> {
    if (!this.userId) return;

    try {
      // Encontrar todas las capacidades que requieren este hito
      const affectedCapabilities = Object.keys(CAPABILITY_MILESTONE_CONFIG).filter(capabilityId =>
        CAPABILITY_MILESTONE_CONFIG[capabilityId].milestones.includes(completedMilestoneId)
      );

      for (const capabilityId of affectedCapabilities) {
        const canActivate = await this.canActivateCapability(capabilityId);
        
        if (canActivate) {
          await this.activateCapability(capabilityId);
        }
      }

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error verificando activaciones:', error);
    }
  }

  /**
   * Verifica si una capacidad puede activarse (todos sus hitos completados)
   */
  private async canActivateCapability(capabilityId: string): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const requiredMilestones = getMilestonesForCapability(capabilityId);
      
      if (requiredMilestones.length === 0) {
        return true; // No hay requisitos
      }

      // Verificar cuántos hitos están completados
      const { data: completedMilestones, error } = await supabase
        .from('user_achievement_progress')
        .select('milestone_id')
        .eq('user_id', this.userId)
        .eq('completed', true)
        .in('milestone_id', requiredMilestones);

      if (error) {
        throw error;
      }

      // Verificar si todos los hitos requeridos están completados
      const completedIds = completedMilestones?.map((m: any) => m.milestone_id) || [];
      const allCompleted = requiredMilestones.every((milestoneId: string) => 
        completedIds.includes(milestoneId)
      );

      return allCompleted;

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error verificando capacidad:', error);
      return false;
    }
  }

  /**
   * Activa una capacidad disparando el evento correspondiente
   */
  private async activateCapability(capabilityId: string): Promise<void> {
    if (!this.userId) return;

    try {
      // Verificar que la capacidad no esté ya activa
      const { data: existing } = await supabase
        .from('capability_milestones')
        .select('capability_id')
        .eq('user_id', this.userId)
        .eq('capability_id', capabilityId)
        .eq('status', 'active')
        .single();

      if (existing) {
        return; // Ya está activa
      }

      // Actualizar estado de la capacidad
      const { error: updateError } = await supabase
        .from('capability_milestones')
        .upsert({
          user_id: this.userId,
          capability_id: capabilityId,
          status: 'active',
          activated_at: new Date().toISOString()
        });

      if (updateError) {
        throw updateError;
      }

      // Disparar evento de activación
      const activationEvent: CapabilityActivationEvent = {
        type: 'capability:activated',
        timestamp: Date.now(),
        userId: this.userId,
        capabilityId,
        capabilityName: CAPABILITY_MILESTONE_CONFIG[capabilityId]?.name || capabilityId,
        data: {
          activatedAt: new Date().toISOString(),
          completedMilestones: getMilestonesForCapability(capabilityId)
        }
      };

      await eventBus.emit(activationEvent.type as EventPattern, activationEvent);

      logger.info('CapabilitySystem', '[AchievementsEngine] 🎉 Capacidad activada:', capabilityId);

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error activando capacidad:', error);
    }
  }

  /**
   * Obtiene el progreso actual de todas las capacidades
   */
  public async getCapabilityProgress(): Promise<AchievementProgress[]> {
    if (!this.userId) return [];

    try {
      const progress: AchievementProgress[] = [];

      for (const [capabilityId, config] of Object.entries(CAPABILITY_MILESTONE_CONFIG)) {
        const requiredMilestones = config.milestones;
        
        // Obtener hitos completados para esta capacidad
        const { data: completedMilestones } = await supabase
          .from('user_achievement_progress')
          .select('milestone_id, completed_at')
          .eq('user_id', this.userId)
          .eq('completed', true)
          .in('milestone_id', requiredMilestones);

        const completedIds = completedMilestones?.map((m: any) => m.milestone_id) || [];
        const completedCount = completedIds.length;
        const totalRequired = requiredMilestones.length;
        const isActive = completedCount === totalRequired;

        progress.push({
          capabilityId,
          capabilityName: config.name,
          description: config.description,
          icon: config.icon,
          totalMilestones: totalRequired,
          completedMilestones: completedCount,
          isActive,
          nextMilestone: isActive ? null : (requiredMilestones.find((id: string) => !completedIds.includes(id)) || null),
          progressPercentage: totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 100
        });
      }

      return progress;

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error obteniendo progreso:', error);
      return [];
    }
  }

  /**
   * Obtiene los hitos pendientes para una capacidad específica
   */
  public async getPendingMilestones(capabilityId: string): Promise<MilestoneDefinition[]> {
    if (!this.userId) return [];

    try {
      const requiredMilestones = getMilestonesForCapability(capabilityId);
      
      // Obtener hitos completados
      const { data: completed } = await supabase
        .from('user_achievement_progress')
        .select('milestone_id')
        .eq('user_id', this.userId)
        .eq('completed', true)
        .in('milestone_id', requiredMilestones);

      const completedIds = completed?.map((m: any) => m.milestone_id) || [];
      
      // Filtrar hitos pendientes
      const pendingMilestoneIds = requiredMilestones.filter((id: string) => !completedIds.includes(id));
      
      return pendingMilestoneIds
        .map((id: string) => MILESTONE_DEFINITIONS[id])
        .filter(Boolean);

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error obteniendo hitos pendientes:', error);
      return [];
    }
  }

  // =====================================================
  // Métodos para Logros de Maestría
  // =====================================================

  /**
   * Evalúa si un logro de maestría debe desbloquearse
   */
  private async evaluateMasteryAchievement(achievement: MasteryAchievementDefinition, event: any): Promise<void> {
    if (!this.userId) return;

    try {
      // Verificar si ya está desbloqueado
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', this.userId)
        .eq('achievement_id', achievement.id)
        .single();

      if (existing) {
        return; // Ya está desbloqueado
      }

      // Evaluar condiciones del logro
      const shouldUnlock = await this.evaluateConditions(achievement, event);
      
      if (shouldUnlock) {
        await this.unlockMasteryAchievement(achievement, event);
      }

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error evaluando logro de maestría:', error);
    }
  }

  /**
   * Evalúa las condiciones de un logro de maestría
   */
  private async evaluateConditions(achievement: MasteryAchievementDefinition, event: any): Promise<boolean> {
    const { conditions } = achievement;

    switch (conditions.type) {
      case 'cumulative':
        return await this.evaluateCumulativeCondition(achievement, event);
      
      case 'single_event':
        return await this.evaluateSingleEventCondition(achievement, event);
      
      case 'streak':
        return await this.evaluateStreakCondition(achievement, event);
      
      case 'time_based':
        return await this.evaluateTimeBasedCondition(achievement, event);
      
      default:
        logger.warn('CapabilitySystem', '[AchievementsEngine] Tipo de condición no soportado:', conditions.type);
        return false;
    }
  }

  /**
   * Evalúa condición acumulativa (ej: 10 ventas totales)
   */
  private async evaluateCumulativeCondition(achievement: MasteryAchievementDefinition, event: any): Promise<boolean> {
    const { conditions } = achievement;
    const { field, threshold = 0, comparison = 'gte' } = conditions;

    if (!field || !threshold) {
      return false;
    }

    try {
      // Obtener progreso actual
      const { data: progress } = await supabase
        .from('user_achievement_progress')
        .select('current_value, target_value')
        .eq('user_id', this.userId!)
        .eq('achievement_id', achievement.id)
        .single();

      let currentValue = progress?.current_value || 0;

      // Incrementar valor basado en el evento
      if (event.data && event.data[field] !== undefined) {
        currentValue += event.data[field];
      } else {
        // Incremento por defecto de 1 para eventos simples
        currentValue += 1;
      }

      // Actualizar progreso en base de datos
      await supabase.rpc('update_achievement_progress', {
        target_user_id: this.userId,
        target_achievement_id: achievement.id,
        new_value: currentValue,
        target_value: threshold,
        metadata: { last_event: event.type, timestamp: event.timestamp }
      });

      // Evaluar si se cumple la condición
      switch (comparison) {
        case 'gte':
          return currentValue >= threshold;
        case 'lte':
          return currentValue <= threshold;
        case 'eq':
          return currentValue === threshold;
        default:
          return false;
      }

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error evaluando condición acumulativa:', error);
      return false;
    }
  }

  /**
   * Evalúa condición de evento único (ej: primera venta)
   */
  private async evaluateSingleEventCondition(achievement: MasteryAchievementDefinition, event: any): Promise<boolean> {
    // Para eventos únicos, simplemente verificamos que el evento ocurrió
    return true;
  }

  /**
   * Evalúa condición de racha (ej: 5 ventas consecutivas)
   */
  private async evaluateStreakCondition(achievement: MasteryAchievementDefinition, event: any): Promise<boolean> {
    // TODO: Implementar lógica de rachas
    logger.warn('CapabilitySystem', '[AchievementsEngine] Condiciones de racha aún no implementadas');
    return false;
  }

  /**
   * Evalúa condición basada en tiempo (ej: 10 ventas en 30 días)
   */
  private async evaluateTimeBasedCondition(achievement: MasteryAchievementDefinition, event: any): Promise<boolean> {
    // TODO: Implementar lógica basada en tiempo
    logger.warn('CapabilitySystem', '[AchievementsEngine] Condiciones basadas en tiempo aún no implementadas');
    return false;
  }

  /**
   * Desbloquea un logro de maestría
   */
  private async unlockMasteryAchievement(achievement: MasteryAchievementDefinition, triggerEvent: any): Promise<void> {
    if (!this.userId) return;

    try {
      // Desbloquear en base de datos
      const { error } = await supabase.rpc('unlock_achievement', {
        target_user_id: this.userId,
        target_achievement_id: achievement.id,
        progress_data: {
          trigger_event: triggerEvent.type,
          timestamp: triggerEvent.timestamp,
          event_data: triggerEvent.data
        }
      });

      if (error) {
        throw error;
      }

      // Emitir evento de logro desbloqueado
      const unlockEvent: MasteryAchievementUnlockedEvent = {
        type: 'achievement:unlocked',
        timestamp: Date.now(),
        userId: this.userId,
        achievementId: achievement.id,
        achievementName: achievement.name,
        achievementType: 'mastery',
        domain: achievement.domain,
        tier: achievement.tier,
        points: achievement.points,
        data: {
          unlockedAt: new Date().toISOString(),
          triggerEvent: triggerEvent.type,
          progressData: {
            trigger_event: triggerEvent.type,
            event_data: triggerEvent.data
          }
        }
      };

      await eventBus.emit('achievement:unlocked' as EventPattern, unlockEvent);

      logger.info('CapabilitySystem', '[AchievementsEngine] 🏆 Logro de maestría desbloqueado:', achievement.name);

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error desbloqueando logro de maestría:', error);
    }
  }

  /**
   * Obtiene todos los logros de maestría del usuario
   */
  public async getUserMasteryAchievements(): Promise<UserAchievement[]> {
    if (!this.userId) return [];

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', this.userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error obteniendo logros del usuario:', error);
      return [];
    }
  }

  /**
   * Obtiene resumen de progreso por dominio
   */
  public async getDomainProgressSummary(): Promise<any[]> {
    if (!this.userId) return [];

    try {
      const { data, error } = await supabase.rpc('get_user_achievement_overview', {
        target_user_id: this.userId
      });

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      logger.error('CapabilitySystem', '[AchievementsEngine] Error obteniendo resumen de progreso:', error);
      return [];
    }
  }

  /**
   * Limpia recursos al destruir la instancia
   */
  public destroy(): void {
    this.isInitialized = false;
    this.userId = null;
    // Note: EventBus subscriptions se limpian automáticamente
  }

  /**
   * FASE 2: Workflows Automatizados por Milestone
   *
   * Ejecuta acciones automáticas al completar ciertos milestones.
   * Ejemplos:
   * - create_first_product → auto-crear categoría "General"
   * - configure_tables → sugerir crear menú digital
   */
  private async handleMilestoneCompletedWorkflows(event: any): Promise<void> {
    if (!this.userId || !event.milestoneId) return;

    const milestoneId = event.milestoneId;

    logger.info(
      'CapabilitySystem',
      '[AchievementsEngine] 🔄 Evaluando workflows para milestone:',
      milestoneId
    );

    try {
      // Workflow 1: Al crear primer producto → auto-crear categoría
      if (milestoneId === 'create_first_product') {
        await this.workflowAutoCreateCategory();
      }

      // Workflow 2: Al configurar mesas → sugerir crear menú
      if (milestoneId === 'configure_tables') {
        await this.workflowSuggestCreateMenu();
      }

      // Workflow 3: Al configurar staff → sugerir horarios
      if (milestoneId === 'configure_staff') {
        await this.workflowSuggestScheduling();
      }

      // Workflow 4: Al completar setup de delivery → sugerir zonas
      if (milestoneId === 'configure_delivery') {
        await this.workflowSuggestDeliveryZones();
      }

    } catch (error) {
      logger.error(
        'CapabilitySystem',
        '[AchievementsEngine] Error ejecutando workflow:',
        error
      );
    }
  }

  /**
   * Workflow: Auto-crear categoría "General" si no existe
   */
  private async workflowAutoCreateCategory(): Promise<void> {
    // Verificar si ya tiene categorías
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', this.userId)
      .limit(1);

    if (error) {
      logger.error('CapabilitySystem', '[Workflow] Error verificando categorías:', error);
      return;
    }

    // Si ya tiene categorías, no hacer nada
    if (categories && categories.length > 0) {
      return;
    }

    // Auto-crear categoría "General"
    const { error: insertError } = await supabase
      .from('categories')
      .insert({
        user_id: this.userId,
        name: 'General',
        description: 'Categoría predeterminada',
        created_by_system: true
      });

    if (insertError) {
      logger.error('CapabilitySystem', '[Workflow] Error creando categoría:', insertError);
      return;
    }

    logger.info('CapabilitySystem', '[Workflow] ✅ Categoría "General" creada automáticamente');

    // Notificar al usuario
    eventBus.emit('system:notification', {
      type: 'info',
      message: '💡 Creamos una categoría "General" para organizar tus productos'
    });
  }

  /**
   * Workflow: Sugerir crear menú digital
   */
  private async workflowSuggestCreateMenu(): Promise<void> {
    // Verificar si ya tiene productos
    const { data: products, error } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', this.userId)
      .limit(1);

    if (error || !products || products.length === 0) {
      return; // No hay productos, no tiene sentido sugerir menú
    }

    logger.info('CapabilitySystem', '[Workflow] 💡 Sugiriendo crear menú digital');

    // Disparar notificación
    eventBus.emit('system:notification', {
      type: 'success',
      message: '🎉 ¡Mesas configuradas! ¿Querés crear tu primer menú digital?',
      action: {
        label: 'Crear menú',
        url: '/admin/products/menu'
      }
    });
  }

  /**
   * Workflow: Sugerir configurar horarios de staff
   */
  private async workflowSuggestScheduling(): Promise<void> {
    logger.info('CapabilitySystem', '[Workflow] 💡 Sugiriendo configurar horarios');

    eventBus.emit('system:notification', {
      type: 'info',
      message: '👥 Staff configurado. Recordá asignar horarios de trabajo',
      action: {
        label: 'Configurar horarios',
        url: '/admin/scheduling'
      }
    });
  }

  /**
   * Workflow: Sugerir configurar zonas de delivery
   */
  private async workflowSuggestDeliveryZones(): Promise<void> {
    logger.info('CapabilitySystem', '[Workflow] 💡 Sugiriendo configurar zonas de delivery');

    eventBus.emit('system:notification', {
      type: 'info',
      message: '🚚 Delivery configurado. Definí las zonas de entrega y costos',
      action: {
        label: 'Configurar zonas',
        url: '/admin/settings/delivery'
      }
    });
  }
}