/**
 * EVENT BLOCK COMPONENT
 *
 * Variante medium para Week view del calendario.
 * Muestra información condensada del evento (nombre, hora, estado).
 *
 * @version 1.0.0
 * @see ../../docs/SCHEDULING_CALENDAR_DESIGN.md#week-view
 */

import React from 'react';
import { Stack } from '@/shared/ui';
import type { UnifiedScheduleEvent } from '../../types/calendar';
import { format } from 'date-fns';
import { logger } from '@/lib/logging';

export interface EventBlockProps {
  event: UnifiedScheduleEvent;
  onClick?: (event: UnifiedScheduleEvent) => void;
  onDragStart?: (event: UnifiedScheduleEvent) => void;
  onDragEnd?: (event: UnifiedScheduleEvent, newStart: Date, newEnd: Date) => void;
  isDragging?: boolean;
  style?: React.CSSProperties;
}

/**
 * EventBlock - Medium variant para Week view
 *
 * Muestra:
 * - Barra de color lateral (type indicator)
 * - Nombre del evento
 * - Hora de inicio/fin
 * - Badge de estado
 *
 * Interacciones:
 * - Click → abre editor modal
 * - Drag & drop → reschedule
 * - Hover → tooltip con detalles
 */
export function EventBlock({
  event,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging = false,
  style
}: EventBlockProps) {
  const handleClick = () => {
    onClick?.(event);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(event));
    onDragStart?.(event);
  };

  const startTime = format(event.start, 'HH:mm');
  const endTime = format(event.end, 'HH:mm');

  // Status badge color
  const statusColors: Record<string, string> = {
    confirmed: '#10B981', // green
    pending: '#F59E0B', // orange
    completed: '#6B7280', // gray
    cancelled: '#EF4444' // red
  };

  const statusColor = statusColors[event.status] || '#6B7280';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      style={{
        position: 'relative',
        backgroundColor: event.colorBg,
        border: `1px solid ${event.colorBorder}`,
        borderLeftWidth: '4px',
        borderRadius: '4px',
        padding: '6px 8px',
        cursor: 'pointer',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease',
        minHeight: '60px',
        overflow: 'hidden',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Stack direction="column" gap="1">
        {/* Event Title */}
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: event.colorText,
            lineHeight: '1.3',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {event.title}
        </div>

        {/* Time Range */}
        <div
          style={{
            fontSize: '11px',
            color: event.colorText,
            opacity: 0.8,
            lineHeight: '1.2'
          }}
        >
          {startTime} - {endTime}
        </div>

        {/* Status Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            fontWeight: 500,
            color: statusColor,
            marginTop: '2px'
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: statusColor
            }}
          />
          {event.status}
        </div>
      </Stack>
    </div>
  );
}

/**
 * EventBlock Stacked - Para eventos overlapping
 *
 * Apila múltiples eventos verticalmente con offset visual.
 */
export interface EventBlockStackedProps {
  events: UnifiedScheduleEvent[];
  onClick?: (event: UnifiedScheduleEvent) => void;
  maxVisible?: number;
}

export function EventBlockStacked({
  events,
  onClick,
  maxVisible = 3
}: EventBlockStackedProps) {
  const visibleEvents = events.slice(0, maxVisible);
  const remainingCount = events.length - maxVisible;

  return (
    <Stack direction="column" gap="1">
      {visibleEvents.map((event) => (
        <EventBlock key={event.id} event={event} onClick={onClick} />
      ))}

      {remainingCount > 0 && (
        <div
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            color: '#6B7280',
            textAlign: 'center',
            backgroundColor: '#F3F4F6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => {
            // TODO: Show all events in modal or expanded view
            logger.debug('EventBlock', `Show ${remainingCount} more events`);
          }}
        >
          +{remainingCount} más
        </div>
      )}
    </Stack>
  );
}
