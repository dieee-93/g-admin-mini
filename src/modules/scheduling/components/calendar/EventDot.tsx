/**
 * EVENT DOT
 *
 * Dot de color para representar eventos en Month view.
 * Máximo 3 dots visibles + contador si hay más.
 *
 * @version 1.0.0
 * @see ../../docs/SCHEDULING_CALENDAR_DESIGN.md#month-view
 */

import React from 'react';
import type { EventType } from '../../types/calendar';
import { EVENT_COLORS } from '../../types/calendar';

export interface EventDotProps {
  /** Tipo de evento (determina el color) */
  type: EventType;

  /** Tamaño del dot */
  size?: 'xs' | 'sm' | 'md';
}

/**
 * EventDot Component
 *
 * Renderiza un dot circular de color según el tipo de evento.
 */
export function EventDot({ type, size = 'sm' }: EventDotProps) {
  const sizeMap = {
    xs: '6px',
    sm: '8px',
    md: '10px'
  };

  const dotSize = sizeMap[size];
  const color = EVENT_COLORS[type].dot;

  return (
    <div
      style={{
        width: dotSize,
        height: dotSize,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0
      }}
      aria-label={`${type} event`}
    />
  );
}

/**
 * EventDotsGroup Component
 *
 * Agrupa múltiples dots con límite de 3 visibles + contador.
 */
export interface EventDotsGroupProps {
  /** Tipos de eventos del día */
  eventTypes: EventType[];

  /** Máximo de dots a mostrar */
  maxDots?: number;
}

export function EventDotsGroup({ eventTypes, maxDots = 3 }: EventDotsGroupProps) {
  const visibleTypes = eventTypes.slice(0, maxDots);
  const remainingCount = eventTypes.length - maxDots;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
      {/* Dots visibles */}
      {visibleTypes.map((type, index) => (
        <EventDot key={`${type}-${index}`} type={type} size="sm" />
      ))}

      {/* Contador de eventos restantes */}
      {remainingCount > 0 && (
        <span
          style={{
            fontSize: '10px',
            color: '#718096',
            fontWeight: '500',
            marginLeft: '2px'
          }}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
