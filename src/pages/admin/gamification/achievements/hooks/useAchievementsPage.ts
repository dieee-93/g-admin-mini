/**
 * useAchievementsPage - Hook Orquestador
 * 
 * Centraliza toda la lógica de estado, efectos y operaciones 
 * de la página de Galaxia de Habilidades
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AchievementsEngine } from '../services/AchievementsEngine';
import type { 
  MasteryAchievementDefinition, 
  UserAchievement, 
  DomainProgressSummary 
} from '../types';

export interface GalaxiaHabilidadesState {
  allAchievements: MasteryAchievementDefinition[];
  userAchievements: UserAchievement[];
  domainProgress: DomainProgressSummary[];
  foundationalProgress: any[];
  businessCapabilities: any[];
  isLoading: boolean;
  error: string | null;
  selectedDomain: string | null;
  achievementMode: 'foundational' | 'mastery';
  selectedConstellation: string | null;
  viewMode: 'grid' | 'galaxy';
}

export interface AchievementsPageStats {
  totalAchievements: number;
  completedAchievements: number;
  completionPercentage: number;
  averageScore: number;
  activeDomains: number;
  total: {
    allAchievements: number;
    unlockedAchievements: number;
    completionPercentage: number;
    activeDomains: number;
  };
  modeSpecific?: {
    totalMilestones?: number;
    completedMilestones?: number;
    activeCapabilities?: number;
    latentCapabilities?: number;
  };
}

export function useAchievementsPage() {
  const { user } = useAuth();
  
  const [state, setState] = useState<GalaxiaHabilidadesState>({
    allAchievements: [],
    userAchievements: [],
    domainProgress: [],
    foundationalProgress: [],
    businessCapabilities: [],
    isLoading: true,
    error: null,
    selectedDomain: null,
    achievementMode: 'foundational',
    selectedConstellation: null,
    viewMode: 'galaxy'
  });

  // Cargar datos de logros
  const loadAchievementData = async () => {
    const userEmail = (user as any)?.email || (user as any)?.id || 'demo-user';
    if (!userEmail) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Usuario no autenticado' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const engine = AchievementsEngine.getInstance();
      await engine.initialize(userEmail);
      
      // Cargar datos en paralelo
      const [
        userAchievements,
        domainProgress,
        foundationalProgress
      ] = await Promise.all([
        engine.getUserMasteryAchievements(),
        engine.getDomainProgressSummary(),
        engine.getCapabilityProgress()
      ]);

      console.log('📊 Datos cargados:', {
        userAchievements: userAchievements.length,
        domains: domainProgress.length,
        foundational: foundationalProgress.length
      });

      // Crear datos mock si no hay progreso fundacional
      const mockFoundationalProgress = foundationalProgress.length === 0 ? [
        {
          capabilityId: 'customer-management',
          capabilityName: 'Gestión de Clientes',
          status: 'active',
          completedMilestones: 3,
          totalMilestones: 5,
          progress: 60,
          milestones: [
            { id: '1', name: 'Primer cliente registrado', completed: true },
            { id: '2', name: 'Sistema CRM activado', completed: true },
            { id: '3', name: 'Segmentación RFM implementada', completed: true },
            { id: '4', name: 'Automatización de follow-up', completed: false },
            { id: '5', name: 'Analytics avanzado', completed: false }
          ]
        },
        {
          capabilityId: 'inventory-control',
          capabilityName: 'Control de Inventario',
          status: 'activating',
          completedMilestones: 2,
          totalMilestones: 4,
          progress: 50,
          milestones: [
            { id: '1', name: 'Catálogo base creado', completed: true },
            { id: '2', name: 'Sistema de alertas', completed: true },
            { id: '3', name: 'Integración con ventas', completed: false },
            { id: '4', name: 'Predicción de demanda', completed: false }
          ]
        },
        {
          capabilityId: 'financial-tracking',
          capabilityName: 'Seguimiento Financiero',
          status: 'latent',
          completedMilestones: 0,
          totalMilestones: 3,
          progress: 0,
          milestones: [
            { id: '1', name: 'Configuración inicial', completed: false },
            { id: '2', name: 'Integración bancaria', completed: false },
            { id: '3', name: 'Reportes automáticos', completed: false }
          ]
        }
      ] : foundationalProgress;

      setState(prev => ({
        ...prev,
        allAchievements: [], // Se cargará dinámicamente según necesidad
        userAchievements,
        domainProgress,
        foundationalProgress: mockFoundationalProgress,
        businessCapabilities: [], // Se cargará dinámicamente según necesidad
        isLoading: false
      }));

    } catch (error) {
      console.error('Error cargando datos de logros:', error);
      setState(prev => ({
        ...prev,
        error: 'Error al cargar los logros. Por favor intenta de nuevo.',
        isLoading: false
      }));
    }
  };

  // Calcular estadísticas dinámicas
  const calculateStats = (): AchievementsPageStats => {
    if (state.achievementMode === 'foundational') {
      const totalMilestones = state.foundationalProgress.reduce(
        (sum, cap) => sum + (cap.totalMilestones || 0), 0
      );
      const completedMilestones = state.foundationalProgress.reduce(
        (sum, cap) => sum + (cap.completedMilestones || 0), 0
      );
      const activeCapabilities = state.foundationalProgress.filter(
        cap => cap.status === 'active'
      ).length;
      const latentCapabilities = state.foundationalProgress.filter(
        cap => cap.status === 'latent'
      ).length;

      return {
        totalAchievements: totalMilestones,
        completedAchievements: completedMilestones,
        completionPercentage: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
        averageScore: completedMilestones > 0 ? Math.round(completedMilestones / totalMilestones * 100) : 0,
        activeDomains: activeCapabilities,
        total: {
          allAchievements: totalMilestones,
          unlockedAchievements: completedMilestones,
          completionPercentage: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
          activeDomains: activeCapabilities
        },
        modeSpecific: {
          totalMilestones,
          completedMilestones,
          activeCapabilities,
          latentCapabilities
        }
      };
    } else {
      const totalAchievements = state.allAchievements.length;
      const unlockedAchievements = state.userAchievements.length;
      const activeDomains = state.domainProgress.filter(d => d.unlocked_achievements > 0).length;

      return {
        totalAchievements: totalAchievements,
        completedAchievements: unlockedAchievements,
        completionPercentage: totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0,
        averageScore: 85, // Promedio fijo por ahora
        activeDomains: activeDomains,
        total: {
          allAchievements: totalAchievements,
          unlockedAchievements: unlockedAchievements,
          completionPercentage: totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0,
          activeDomains: activeDomains
        }
      };
    }
  };

  // Efectos
  useEffect(() => {
    loadAchievementData();
  }, [(user as any)?.email, (user as any)?.id]);

  // Métodos para cambio de estado
  const setAchievementMode = (mode: 'foundational' | 'mastery') => {
    setState(prev => ({ ...prev, achievementMode: mode }));
  };

  const setViewMode = (mode: 'grid' | 'galaxy') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  };

  const setSelectedDomain = (domain: string | null) => {
    setState(prev => ({ ...prev, selectedDomain: domain }));
  };

  const setSelectedConstellation = (constellation: string | null) => {
    setState(prev => ({ ...prev, selectedConstellation: constellation }));
  };

  return {
    // Estado
    state,
    setState,
    
    // Datos computados
    stats: calculateStats(),
    
    // Handlers de interacción
    handleDomainSelect: setSelectedDomain,
    handleConstellationSelect: setSelectedConstellation,
    handleModeSwitch: setAchievementMode,
    handleViewModeSwitch: setViewMode,
    refreshAchievements: loadAchievementData,
    
    // Configuración visual
    bgGradient: 'linear(to-br, gray.900, purple.900, blue.900, black)',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    glowColor: 'rgba(139, 92, 246, 0.3)',
    
    // Acciones (backward compatibility)
    loadAchievementData,
    setAchievementMode,
    setViewMode,
    setSelectedDomain,
    setSelectedConstellation,
    
    // Estado de carga
    isLoading: state.isLoading,
    error: state.error
  };
}