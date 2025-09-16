/**
 * ConstellationView - Vista de Constelación por Dominio
 * 
 * Muestra los logros de un dominio específico como una constelación:
 * - Logros desbloqueados como estrellas brillantes
 * - Logros pendientes como estrellas tenues
 * - Líneas conectoras mostrando progresión
 */

import React from 'react';
import { Stack } from '@/shared/ui';
import type { MasteryAchievementDefinition } from '../types';
import { AchievementCard } from './AchievementCard';

interface ConstellationViewProps {
  domain: string;
  achievements: MasteryAchievementDefinition[];
  unlockedAchievements: Set<string>;
  userAchievements?: Array<{
    achievement_id: string;
    unlocked_at: string;
    progress?: number;
  }>;
  title: string;
  description: string;
  emoji: string;
}

// Mapeo de colores por dominio
const DOMAIN_COLORS: Record<string, string> = {
  sales: '#3182ce',        // Azul
  inventory: '#38a169',    // Verde
  staff: '#805ad5',        // Púrpura
  finance: '#d69e2e',      // Amarillo/Oro
  operations: '#e53e3e',   // Rojo
  growth: '#dd6b20'        // Naranja
};

export const ConstellationView: React.FC<ConstellationViewProps> = ({
  domain,
  achievements,
  unlockedAchievements,
  userAchievements = [],
  title,
  description,
  emoji
}) => {
  // Crear un mapa de progreso de logros del usuario
  const userAchievementMap = new Map(
    userAchievements.map(ua => [ua.achievement_id, ua])
  );

  // Calcular estadísticas
  const totalAchievements = achievements.length;
  const unlockedCount = achievements.filter(a => unlockedAchievements.has(a.id)).length;
  const completionPercentage = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;

  // Color del dominio
  const domainColor = DOMAIN_COLORS[domain] || '#718096';

  // Estilos
  const headerStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${domainColor}20, ${domainColor}10)`,
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    border: `2px solid ${domainColor}30`
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: domainColor,
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#4a5568',
    marginBottom: '16px',
    lineHeight: '1.5'
  };

  const statsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  };

  const statItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: domainColor
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#718096',
    textTransform: 'uppercase',
    fontWeight: '600'
  };

  const progressBarStyle: React.CSSProperties = {
    width: '200px',
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden'
  };

  const progressFillStyle: React.CSSProperties = {
    height: '100%',
    width: `${completionPercentage}%`,
    background: `linear-gradient(to right, ${domainColor}, ${domainColor}cc)`,
    transition: 'width 0.5s ease'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  };

  return (
    <div>
      {/* Header de la Constelación */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <span style={{ fontSize: '36px' }}>{emoji}</span>
          {title}
        </div>
        
        <div style={descriptionStyle}>
          {description}
        </div>

        {/* Estadísticas */}
        <div style={statsStyle}>
          <div style={statItemStyle}>
            <div style={statValueStyle}>{unlockedCount}</div>
            <div style={statLabelStyle}>Desbloqueados</div>
          </div>
          
          <div style={statItemStyle}>
            <div style={statValueStyle}>{totalAchievements}</div>
            <div style={statLabelStyle}>Total</div>
          </div>
          
          <div style={statItemStyle}>
            <div style={statValueStyle}>{completionPercentage}%</div>
            <div style={statLabelStyle}>Completado</div>
          </div>

          {/* Barra de progreso */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={progressBarStyle}>
              <div style={progressFillStyle} />
            </div>
            <div style={{ fontSize: '11px', color: '#718096', textAlign: 'center' }}>
              Progreso General
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Logros */}
      {achievements.length > 0 ? (
        <div style={gridStyle}>
          {achievements.map((achievement) => {
            const isUnlocked = unlockedAchievements.has(achievement.id);
            const userAchievement = userAchievementMap.get(achievement.id);
            
            return (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={isUnlocked}
                unlockedAt={userAchievement?.unlocked_at}
                showProgress={!isUnlocked && userAchievement?.progress !== undefined}
                currentProgress={userAchievement?.progress || 0}
                targetProgress={getTargetProgress(achievement)}
              />
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: '#718096'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌌</div>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
            Constelación Vacía
          </div>
          <div style={{ fontSize: '14px' }}>
            No hay logros definidos para este dominio
          </div>
        </div>
      )}
    </div>
  );
};

// Helper para obtener el progreso objetivo basado en el tipo de condición
function getTargetProgress(achievement: MasteryAchievementDefinition): number {
  const condition = achievement.conditions;
  
  if (condition.type === 'cumulative' && condition.threshold) {
    return condition.threshold;
  }
  if (condition.type === 'time_based' && condition.threshold) {
    return condition.threshold;
  }
  return 1; // Para eventos únicos o otros tipos
}

export default ConstellationView;