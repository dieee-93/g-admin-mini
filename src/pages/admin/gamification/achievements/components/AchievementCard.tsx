/**
 * AchievementCard - Tarjeta Individual de Logro
 * 
 * Muestra un logro individual con diferentes estados visuales:
 * - Desbloqueado: A todo color con información completa
 * - Pendiente: Atenuado con pistas de cómo desbloquearlo
 */

import React from 'react';
import { Stack, Button } from '@/shared/ui';
import type { MasteryAchievementDefinition } from '../types';

interface AchievementCardProps {
  achievement: MasteryAchievementDefinition;
  isUnlocked: boolean;
  unlockedAt?: string;
  showProgress?: boolean;
  currentProgress?: number;
  targetProgress?: number;
}

// Mapeo de colores por tier
const TIER_COLORS = {
  bronze: {
    color: 'orange',
    emoji: '🥉'
  },
  silver: {
    color: 'gray', 
    emoji: '🥈'
  },
  gold: {
    color: 'yellow',
    emoji: '🥇'
  },
  platinum: {
    color: 'purple',
    emoji: '💎'
  }
};

// Mapeo de iconos simples
const ICON_EMOJIS: Record<string, string> = {
  trophy: '🏆',
  star: '⭐',
  award: '🏅',
  target: '🎯',
  zap: '⚡',
  package: '📦',
  users: '👥',
  'bar-chart': '📊',
  truck: '🚚',
  heart: '❤️',
  party: '🎉',
  money: '💰',
  crown: '👑',
  grid: '📋',
  folder: '📁',
  'trending-up': '📈',
  'user-plus': '👤',
  calendar: '📅',
  shield: '🛡️',
  'check-circle': '✅',
  'calendar-check': '📅',
  globe: '🌍',
  default: '🏅'
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked,
  unlockedAt,
  showProgress = false,
  currentProgress = 0,
  targetProgress = 1
}) => {
  // Configuración del tier
  const tierConfig = TIER_COLORS[achievement.tier as keyof typeof TIER_COLORS] || TIER_COLORS.bronze;
  
  // Icono del logro
  const achievementEmoji = ICON_EMOJIS[achievement.icon] || ICON_EMOJIS.default;
  
  // Progreso como porcentaje
  const progressPercentage = targetProgress > 0 ? Math.min(100, (currentProgress / targetProgress) * 100) : 0;
  
  // Formatear fecha de desbloqueo
  const formatUnlockedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const cardStyle: React.CSSProperties = {
    border: `2px solid ${isUnlocked ? '#3182ce' : '#e2e8f0'}`,
    borderRadius: '12px',
    padding: '16px',
    backgroundColor: 'white',
    opacity: isUnlocked ? 1 : 0.7,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    minHeight: '180px',
    position: 'relative'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  };

  const iconContainerStyle: React.CSSProperties = {
    fontSize: '24px',
    marginRight: '12px'
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '16px',
    color: isUnlocked ? '#1a202c' : '#718096',
    marginBottom: '4px'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: isUnlocked ? '#2d3748' : '#a0aec0',
    lineHeight: '1.4',
    marginBottom: '12px'
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: isUnlocked ? '#3182ce' : '#e2e8f0',
    color: isUnlocked ? 'white' : '#718096',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto'
  };

  const statusStyle: React.CSSProperties = {
    fontSize: '12px',
    color: isUnlocked ? '#38a169' : '#718096',
    fontWeight: '500'
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = isUnlocked ? 'translateY(-4px)' : 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isUnlocked ? '0 20px 25px rgba(0,0,0,0.1)' : '0 10px 15px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      {/* Línea de brillo superior para logros desbloqueados */}
      {isUnlocked && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(to right, #3182ce, #805ad5)',
          borderRadius: '12px 12px 0 0'
        }} />
      )}
      
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
          <div style={iconContainerStyle}>
            {achievementEmoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={titleStyle}>
              {achievement.name} {isUnlocked && tierConfig.emoji}
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={badgeStyle}>
            {achievement.tier.toUpperCase()}
          </div>
          {isUnlocked && (
            <div style={{ fontSize: '12px', color: '#fbd38d', marginTop: '4px' }}>
              ⭐ {achievement.points}
            </div>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div style={descriptionStyle}>
        {achievement.description}
      </div>

      {/* Progreso (si aplica) */}
      {showProgress && !isUnlocked && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '12px', 
            color: '#718096',
            marginBottom: '4px'
          }}>
            <span>Progreso</span>
            <span>{currentProgress} / {targetProgress}</span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#e2e8f0',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercentage}%`,
              background: 'linear-gradient(to right, #3182ce, #805ad5)',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={footerStyle}>
        <div style={{
          backgroundColor: '#ebf8ff',
          color: '#3182ce',
          padding: '2px 6px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          {achievement.domain}
        </div>
        
        <div style={statusStyle}>
          {isUnlocked ? (
            <span title={unlockedAt ? `Desbloqueado el ${formatUnlockedDate(unlockedAt)}` : ''}>
              🔓 Desbloqueado
            </span>
          ) : (
            <span>🔒 Pendiente</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;