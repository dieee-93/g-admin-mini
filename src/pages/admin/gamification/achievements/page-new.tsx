/**
 * Galaxia de Habilidades - Página Principal de Logros
 * 
 * Visualización completa del sistema de logros usando la metáfora de una galaxia
 * donde cada dominio es una constelación y cada logro es una estrella.
 */

import React, { useState, useEffect } from 'react';
import { Stack, Button } from '@/shared/ui';
import { useAuth } from '@/contexts/AuthContext';
import { AchievementCard } from './components/AchievementCard';
import { ConstellationView } from './components/ConstellationView';
import type { 
  MasteryAchievementDefinition, 
  UserAchievement, 
  DomainProgressSummary 
} from './types';
import { 
  ALL_MASTERY_ACHIEVEMENTS, 
  DOMAIN_METADATA,
  SALES_MASTERY_ACHIEVEMENTS,
  INVENTORY_MASTERY_ACHIEVEMENTS,
  STAFF_MASTERY_ACHIEVEMENTS,
  FINANCE_MASTERY_ACHIEVEMENTS,
  OPERATIONS_MASTERY_ACHIEVEMENTS,
  GROWTH_MASTERY_ACHIEVEMENTS 
} from '@/config/masteryAchievements';

// Mapeo de achievements por dominio
const ACHIEVEMENTS_BY_DOMAIN = {
  sales: SALES_MASTERY_ACHIEVEMENTS,
  inventory: INVENTORY_MASTERY_ACHIEVEMENTS,
  staff: STAFF_MASTERY_ACHIEVEMENTS,
  finance: FINANCE_MASTERY_ACHIEVEMENTS,
  operations: OPERATIONS_MASTERY_ACHIEVEMENTS,
  growth: GROWTH_MASTERY_ACHIEVEMENTS
};

// Mapeo de emojis por dominio
const DOMAIN_EMOJIS: Record<string, string> = {
  sales: '💰',
  inventory: '📦',
  staff: '👥',
  finance: '📊',
  operations: '🚚',
  growth: '🎯'
};

interface GalaxiaState {
  loading: boolean;
  error: string | null;
  allAchievements: MasteryAchievementDefinition[];
  userAchievements: UserAchievement[];
  unlockedAchievements: Set<string>;
  domainProgress: DomainProgressSummary[];
}

export default function GalaxiaHabilidadesPage(): React.JSX.Element {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'galaxy' | 'list'>('galaxy');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  
  const [state, setState] = useState<GalaxiaState>({
    loading: true,
    error: null,
    allAchievements: ALL_MASTERY_ACHIEVEMENTS,
    userAchievements: [],
    unlockedAchievements: new Set(),
    domainProgress: []
  });

  // Simular carga de datos del usuario (en una implementación real, esto vendría de Supabase)
  useEffect(() => {
    loadAchievementData();
  }, []);

  const loadAchievementData = async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // TODO: Implementar llamadas reales a Supabase
      // Por ahora, simulamos algunos logros desbloqueados
      const mockUserAchievements: UserAchievement[] = [
        {
          id: '1',
          user_id: 'demo-user',
          achievement_id: 'sales_first_sale',
          unlocked_at: new Date().toISOString(),
          progress_data: {},
          created_at: new Date().toISOString()
        }
      ];

      const unlockedIds = new Set(mockUserAchievements.map(ua => ua.achievement_id));
      
      // Calcular progreso por dominio
      const domainProgress = Object.entries(ACHIEVEMENTS_BY_DOMAIN).map(([domain, achievements]) => {
        const total = achievements.length;
        const unlocked = achievements.filter(a => unlockedIds.has(a.id)).length;
        const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
        
        return {
          domain,
          total_achievements: total,
          unlocked_achievements: unlocked,
          total_points: totalPoints,
          progress_percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0
        };
      });

      setState(prev => ({
        ...prev,
        loading: false,
        userAchievements: mockUserAchievements,
        unlockedAchievements: unlockedIds,
        domainProgress
      }));

    } catch (error) {
      console.error('Error cargando datos de logros:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error cargando los datos de logros'
      }));
    }
  };

  // Filtrar achievements según el dominio seleccionado
  const getFilteredAchievements = (): MasteryAchievementDefinition[] => {
    if (selectedDomain === 'all') {
      return state.allAchievements;
    }
    return ACHIEVEMENTS_BY_DOMAIN[selectedDomain as keyof typeof ACHIEVEMENTS_BY_DOMAIN] || [];
  };

  // Estilos
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
    color: 'white',
    padding: '24px'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '32px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #4299e1, #9f7aea)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '16px'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '18px',
    color: '#a0aec0',
    marginBottom: '32px'
  };

  const controlsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '32px',
    flexWrap: 'wrap'
  };

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    border: isActive ? '2px solid #4299e1' : '2px solid #4a5568',
    borderRadius: '8px',
    backgroundColor: isActive ? '#4299e1' : 'transparent',
    color: isActive ? 'white' : '#a0aec0',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  });

  const contentStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  if (state.loading) {
    return (
      <div style={pageStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌌</div>
            <div style={{ fontSize: '18px', color: '#a0aec0' }}>Cargando la galaxia...</div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={pageStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: '18px', color: '#f56565', marginBottom: '16px' }}>
              {state.error}
            </div>
            <button 
              style={buttonStyle(false)}
              onClick={loadAchievementData}
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={titleStyle}>🌌 Galaxia de Habilidades</div>
          <div style={subtitleStyle}>
            Explora las constelaciones de logros y desbloquea tu potencial
          </div>
        </div>

        {/* Controles */}
        <div style={controlsStyle}>
          {/* Selector de vista */}
          <button
            style={buttonStyle(viewMode === 'galaxy')}
            onClick={() => setViewMode('galaxy')}
          >
            🌟 Vista Galaxia
          </button>
          <button
            style={buttonStyle(viewMode === 'list')}
            onClick={() => setViewMode('list')}
          >
            📋 Vista Lista
          </button>

          {/* Filtro de dominio */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '2px solid #4a5568',
              backgroundColor: '#2d3748',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="all">🌌 Todos los dominios</option>
            {Object.entries(DOMAIN_METADATA).map(([domain, metadata]) => (
              <option key={domain} value={domain}>
                {DOMAIN_EMOJIS[domain]} {metadata.name}
              </option>
            ))}
          </select>

          <button
            style={buttonStyle(false)}
            onClick={loadAchievementData}
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Contenido Principal */}
        {viewMode === 'galaxy' ? (
          // Vista Galaxia - Constelaciones por dominio
          <div>
            {selectedDomain === 'all' ? (
              // Mostrar todas las constelaciones
              <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                {Object.entries(ACHIEVEMENTS_BY_DOMAIN).map(([domain, achievements]) => {
                  const metadata = DOMAIN_METADATA[domain as keyof typeof DOMAIN_METADATA];
                  if (!metadata) return null;

                  return (
                    <ConstellationView
                      key={domain}
                      domain={domain}
                      achievements={achievements}
                      unlockedAchievements={state.unlockedAchievements}
                      userAchievements={state.userAchievements}
                      title={metadata.name}
                      description={metadata.description}
                      emoji={DOMAIN_EMOJIS[domain]}
                    />
                  );
                })}
              </div>
            ) : (
              // Mostrar constelación específica
              <ConstellationView
                domain={selectedDomain}
                achievements={getFilteredAchievements()}
                unlockedAchievements={state.unlockedAchievements}
                userAchievements={state.userAchievements}
                title={DOMAIN_METADATA[selectedDomain as keyof typeof DOMAIN_METADATA]?.name || 'Dominio'}
                description={DOMAIN_METADATA[selectedDomain as keyof typeof DOMAIN_METADATA]?.description || ''}
                emoji={DOMAIN_EMOJIS[selectedDomain] || '⭐'}
              />
            )}
          </div>
        ) : (
          // Vista Lista - Grid de tarjetas
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {getFilteredAchievements().map((achievement) => {
              const isUnlocked = state.unlockedAchievements.has(achievement.id);
              const userAchievement = state.userAchievements.find(ua => ua.achievement_id === achievement.id);
              
              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={isUnlocked}
                  unlockedAt={userAchievement?.unlocked_at}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}