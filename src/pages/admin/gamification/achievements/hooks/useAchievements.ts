/**
 * Hook useAchievements
 * 
 * Gestiona el estado de logros y progreso de capacidades del ADN de negocio.
 * Proporciona una interfaz React para interactuar con el AchievementsEngine.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AchievementsEngine } from '../services/AchievementsEngine';
import { getMilestoneDefinition } from '../../../../../config/milestones';
import type { AchievementProgress, MilestoneDefinition } from '../types';

import { logger } from '@/lib/logging';
// Estado del hook
interface UseAchievementsState {
  progress: AchievementProgress[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// Resultado del hook
interface UseAchievementsResult extends UseAchievementsState {
  // Acciones
  refreshProgress: () => Promise<void>;
  getPendingMilestones: (capabilityId: string) => Promise<MilestoneDefinition[]>;
  completeManualMilestone: (milestoneId: string, data?: any) => Promise<void>;
  
  // Utilidades
  getCapabilityProgress: (capabilityId: string) => AchievementProgress | null;
  isCapabilityActive: (capabilityId: string) => boolean;
  getNextMilestone: (capabilityId: string) => string | null;
  getCompletionPercentage: (capabilityId: string) => number;
  
  // Estadísticas
  totalCapabilities: number;
  activeCapabilities: number;
  totalMilestones: number;
  completedMilestones: number;
  overallProgress: number;
}

/**
 * Hook para gestionar logros y progreso de capacidades
 */
export function useAchievements(userId?: string): UseAchievementsResult {
  // Estado local
  const [state, setState] = useState<UseAchievementsState>({
    progress: [],
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  // Referencias
  const achievementsEngine = useRef<AchievementsEngine | null>(null);
  const currentUserId = useRef<string | null>(null);

  /**
   * Inicializa el motor de logros
   */
  const initializeEngine = useCallback(async (userId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      achievementsEngine.current = AchievementsEngine.getInstance();
      await achievementsEngine.current.initialize(userId);
      
      currentUserId.current = userId;
      
      // Cargar progreso inicial
      await refreshProgress();
      
    } catch (error) {
      logger.error('CapabilitySystem', '[useAchievements] Error inicializando:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, []);

  /**
   * Refresca el progreso de todas las capacidades
   */
  const refreshProgress = useCallback(async (): Promise<void> => {
    if (!achievementsEngine.current) {
      logger.warn('CapabilitySystem', '[useAchievements] Motor no inicializado');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const progress = await achievementsEngine.current.getCapabilityProgress();
      
      setState(prev => ({
        ...prev,
        progress,
        isLoading: false,
        lastUpdated: Date.now()
      }));
      
    } catch (error) {
      logger.error('CapabilitySystem', '[useAchievements] Error refrescando progreso:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error cargando progreso'
      }));
    }
  }, []);

  /**
   * Obtiene los hitos pendientes para una capacidad
   */
  const getPendingMilestones = useCallback(async (capabilityId: string): Promise<MilestoneDefinition[]> => {
    if (!achievementsEngine.current) {
      logger.warn('CapabilitySystem', '[useAchievements] Motor no inicializado');
      return [];
    }

    try {
      return await achievementsEngine.current.getPendingMilestones(capabilityId);
    } catch (error) {
      logger.error('CapabilitySystem', '[useAchievements] Error obteniendo hitos pendientes:', error);
      return [];
    }
  }, []);

  /**
   * Completa manualmente un hito (para testing o casos especiales)
   */
  const completeManualMilestone = useCallback(async (milestoneId: string, data?: any): Promise<void> => {
    if (!achievementsEngine.current || !currentUserId.current) {
      logger.warn('CapabilitySystem', '[useAchievements] Motor no inicializado o usuario no disponible');
      return;
    }

    try {
      const milestone = getMilestoneDefinition(milestoneId);
      if (!milestone) {
        throw new Error(`Hito no encontrado: ${milestoneId}`);
      }

      // Simular evento de completado manual
      const manualEvent = {
        type: milestone.event_pattern,
        action: milestone.action_type,
        timestamp: Date.now(),
        userId: currentUserId.current,
        data: data || { source: 'manual' }
      };

      // Llamar directamente al método privado a través de reflexión o
      // crear un método público para casos de testing
      logger.info('CapabilitySystem', '[useAchievements] Completando hito manualmente:', milestoneId);
      
      // Recargar progreso para reflejar cambios
      await refreshProgress();
      
    } catch (error) {
      logger.error('CapabilitySystem', '[useAchievements] Error completando hito manual:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error completando hito'
      }));
    }
  }, [refreshProgress]);

  /**
   * Obtiene el progreso de una capacidad específica
   */
  const getCapabilityProgress = useCallback((capabilityId: string): AchievementProgress | null => {
    return state.progress.find(p => p.capabilityId === capabilityId) || null;
  }, [state.progress]);

  /**
   * Verifica si una capacidad está activa
   */
  const isCapabilityActive = useCallback((capabilityId: string): boolean => {
    const progress = getCapabilityProgress(capabilityId);
    return progress?.isActive || false;
  }, [getCapabilityProgress]);

  /**
   * Obtiene el siguiente hito a completar para una capacidad
   */
  const getNextMilestone = useCallback((capabilityId: string): string | null => {
    const progress = getCapabilityProgress(capabilityId);
    return progress?.nextMilestone || null;
  }, [getCapabilityProgress]);

  /**
   * Obtiene el porcentaje de completado para una capacidad
   */
  const getCompletionPercentage = useCallback((capabilityId: string): number => {
    const progress = getCapabilityProgress(capabilityId);
    return progress?.progressPercentage || 0;
  }, [getCapabilityProgress]);

  // Estadísticas calculadas
  const totalCapabilities = state.progress.length;
  const activeCapabilities = state.progress.filter(p => p.isActive).length;
  const totalMilestones = state.progress.reduce((sum, p) => sum + p.totalMilestones, 0);
  const completedMilestones = state.progress.reduce((sum, p) => sum + p.completedMilestones, 0);
  const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Efecto para inicializar cuando cambia el userId
  useEffect(() => {
    if (userId && userId !== currentUserId.current) {
      initializeEngine(userId);
    }
  }, [userId, initializeEngine]);

  // Efecto para limpiar al desmontar
  useEffect(() => {
    return () => {
      if (achievementsEngine.current) {
        achievementsEngine.current.destroy();
        achievementsEngine.current = null;
        currentUserId.current = null;
      }
    };
  }, []);

  return {
    // Estado
    ...state,
    
    // Acciones
    refreshProgress,
    getPendingMilestones,
    completeManualMilestone,
    
    // Utilidades
    getCapabilityProgress,
    isCapabilityActive,
    getNextMilestone,
    getCompletionPercentage,
    
    // Estadísticas
    totalCapabilities,
    activeCapabilities,
    totalMilestones,
    completedMilestones,
    overallProgress,
  };
}

export default useAchievements;