/**
 * useGamificationData - TanStack Query Hooks
 * 
 * ⚠️ ESTADO ACTUAL: Mock data - Gamificación no implementada
 * 
 * Hooks para server state de gamificación (achievements, points, badges).
 * Actualmente usa gamificationStore (Zustand) como fallback hasta que
 * se implemente el backend.
 * 
 * Features:
 * - Queries: User data, stats, leaderboard
 * - Mutations: Complete achievement, unlock badge
 * - Auto invalidation on mutations
 * - Fallback a localStorage mientras no hay backend
 * 
 * TODO:
 * - [ ] Conectar con Supabase (tabla user_achievements)
 * - [ ] Implementar mutations reales
 * - [ ] Agregar optimistic updates
 * 
 * @see GAMIFICATION_ROADMAP.md
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import { useGamificationStore } from '@/store/gamificationStore';
import { useShallow } from 'zustand/react/shallow';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface GamificationData {
  userId: string | null;
  userType: 'admin' | 'employee' | 'customer' | null;
  completedAchievements: Set<string>;
  totalPoints: number;
  unlockedBadges: string[];
  level: number;
  nextLevelPoints: number;
  progressToNextLevel: number;
  lastUpdated: Date | null;
}

export interface GamificationStats {
  totalAchievements: number;
  totalBadges: number;
  categories: readonly string[];
  topUsers: Array<{
    userId: string;
    userName: string;
    points: number;
    level: number;
  }>;
}

export interface CompleteAchievementInput {
  achievementId: string;
  points?: number;
}

export interface UnlockBadgeInput {
  badgeId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEYS
// ─────────────────────────────────────────────────────────────────────────────

export const gamificationKeys = {
  all: ['gamification'] as const,
  userData: (userId?: string) => [...gamificationKeys.all, 'user-data', userId] as const,
  stats: () => [...gamificationKeys.all, 'stats'] as const,
  leaderboard: () => [...gamificationKeys.all, 'leaderboard'] as const,
  achievements: () => [...gamificationKeys.all, 'achievements'] as const,
  badges: () => [...gamificationKeys.all, 'badges'] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook para obtener datos de gamificación del usuario actual.
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useGamificationData();
 * if (data) {
 *   console.log(`Level: ${data.level}, Points: ${data.totalPoints}`);
 * }
 * ```
 */
export function useGamificationData() {
  const { user } = useAuth();

  // Obtener datos locales del store
  const localData = useGamificationStore(useShallow(state => ({
    userId: state.userId,
    userType: state.userType,
    completedAchievements: state.completedAchievements,
    totalPoints: state.totalPoints,
    unlockedBadges: state.unlockedBadges,
    lastUpdated: state.lastUpdated,
  })));

  return useQuery({
    queryKey: gamificationKeys.userData(user?.id),
    queryFn: async (): Promise<GamificationData> => {
      // TODO: Reemplazar con llamada real a Supabase
      // const { data, error } = await supabase
      //   .from('user_achievements')
      //   .select('*')
      //   .eq('user_id', user?.id)
      //   .single();
      
      // if (error) throw error;
      
      // Por ahora, computar desde store local
      const totalPoints = localData.totalPoints;
      const level = Math.floor(totalPoints / 100) + 1;
      const nextLevelPoints = level * 100;
      const progressToNextLevel = ((totalPoints % 100) / 100) * 100;

      logger.debug('App', 'Fetching gamification user data (from local store)', {
        userId: user?.id,
        level,
        totalPoints,
      });

      return {
        userId: localData.userId || user?.id || null,
        userType: localData.userType,
        completedAchievements: localData.completedAchievements || new Set<string>(),
        totalPoints,
        unlockedBadges: localData.unlockedBadges || [],
        level,
        nextLevelPoints,
        progressToNextLevel,
        lastUpdated: localData.lastUpdated,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener estadísticas agregadas de gamificación.
 * 
 * @example
 * ```tsx
 * const { data: stats } = useGamificationStats();
 * console.log(stats?.totalAchievements); // 50
 * ```
 */
export function useGamificationStats() {
  return useQuery({
    queryKey: gamificationKeys.stats(),
    queryFn: async (): Promise<GamificationStats> => {
      // TODO: Reemplazar con llamada real
      // const { data } = await supabase.rpc('get_gamification_stats');
      
      logger.debug('App', 'Fetching gamification stats (mock data)');

      return {
        totalAchievements: 50,
        totalBadges: 20,
        categories: ['sales', 'products', 'staff', 'settings'] as const,
        topUsers: [],
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: false, // ⚠️ Disabled hasta que se implemente backend
  });
}

/**
 * Hook para obtener leaderboard de puntos.
 * 
 * @example
 * ```tsx
 * const { data: leaderboard } = useLeaderboard();
 * ```
 */
export function useLeaderboard() {
  return useQuery({
    queryKey: gamificationKeys.leaderboard(),
    queryFn: async () => {
      // TODO: Implementar cuando haya backend
      logger.debug('App', 'Fetching gamification leaderboard (not implemented)');
      return [];
    },
    enabled: false, // Disabled hasta implementación
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mutation para completar un achievement.
 * 
 * @example
 * ```tsx
 * const completeAchievement = useCompleteAchievement();
 * 
 * // En un handler
 * completeAchievement.mutate({
 *   achievementId: 'first_sale',
 *   points: 100,
 * });
 * ```
 */
export function useCompleteAchievement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { completeAchievement: storeComplete } = useGamificationStore();

  return useMutation({
    mutationFn: async (input: CompleteAchievementInput) => {
      // TODO: Implementar llamada real a backend
      // const { data, error } = await supabase
      //   .from('user_achievements')
      //   .insert({
      //     user_id: user?.id,
      //     achievement_id: input.achievementId,
      //     points: input.points,
      //     completed_at: new Date().toISOString(),
      //   })
      //   .select()
      //   .single();
      
      // if (error) throw error;
      // return data;

      logger.warn('App', 'completeAchievement not implemented (using store)', {
        achievementId: input.achievementId,
        points: input.points,
      });

      // Por ahora usar store
      storeComplete(input.achievementId, input.points);

      return {
        achievementId: input.achievementId,
        points: input.points,
        userId: user?.id,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.all });

      notify.success({
        title: '¡Logro completado!',
        description: `Has ganado ${data.points || 0} puntos`,
      });

      logger.info('App', 'Achievement completed', {
        achievementId: data.achievementId,
      });
    },
    onError: (error) => {
      notify.error({
        title: 'Error al completar logro',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });

      logger.error('App', 'Failed to complete achievement', error);
    },
  });
}

/**
 * Mutation para desbloquear un badge.
 * 
 * @example
 * ```tsx
 * const unlockBadge = useUnlockBadge();
 * 
 * unlockBadge.mutate({ badgeId: 'champion' });
 * ```
 */
export function useUnlockBadge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { unlockBadge: storeUnlock } = useGamificationStore();

  return useMutation({
    mutationFn: async (input: UnlockBadgeInput) => {
      // TODO: Implementar llamada real a backend
      logger.warn('App', 'unlockBadge not implemented (using store)', {
        badgeId: input.badgeId,
      });

      storeUnlock(input.badgeId);

      return {
        badgeId: input.badgeId,
        userId: user?.id,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.all });

      notify.success({
        title: '¡Badge desbloqueado!',
        description: `Has obtenido un nuevo badge`,
      });

      logger.info('App', 'Badge unlocked', {
        badgeId: data.badgeId,
      });
    },
    onError: (error) => {
      notify.error({
        title: 'Error al desbloquear badge',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });

      logger.error('App', 'Failed to unlock badge', error);
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook para invalidar todos los queries de gamificación.
 * Útil después de acciones que afectan múltiples datos.
 */
export function useInvalidateGamification() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: gamificationKeys.all });
    logger.debug('App', 'All gamification queries invalidated');
  };
}
