/**
 * EVENT TOOLTIP
 *
 * Tooltip que muestra resumen de eventos al hacer hover en Month view.
 *
 * @version 1.0.0
 * @see ../../docs/SCHEDULING_CALENDAR_DESIGN.md#month-view
 */

import React from 'react';
import { Stack, Typography, Badge } from '@/shared/ui';
import type { UnifiedScheduleEvent, EventType } from '../../types/calendar';

export interface EventTooltipProps {
  /** Eventos del día */
  events: UnifiedScheduleEvent[];

  /** Fecha del día */
  date: Date;
}

/**
 * EventTooltip Component
 *
 * Renderiza un tooltip con resumen de eventos:
 * - Total de eventos
 * - Conteo por tipo
 * - Primeros 3 eventos con detalles
 */
export function EventTooltip({ events, date }: EventTooltipProps) {
  // Agrupar por tipo
  const countByType = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<EventType, number>);

  // Primeros 3 eventos para preview
  const previewEvents = events.slice(0, 3);
  const remainingCount = events.length - 3;

  // Formatear fecha
  const dateFormatted = date.toLocaleDateString('es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Stack
      direction="column"
      gap="2"
      p="3"
      bg="white"
      borderRadius="md"
      boxShadow="lg"
      minW="240px"
      maxW="320px"
    >
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center">
        <Typography variant="body" size="sm" fontWeight="bold" color="gray.900">
          {dateFormatted}
        </Typography>
        <Badge size="sm" colorPalette="blue">
          {events.length} evento{events.length !== 1 ? 's' : ''}
        </Badge>
      </Stack>

      {/* Conteo por tipo */}
      <Stack direction="row" gap="2" flexWrap="wrap">
        {Object.entries(countByType).map(([type, count]) => (
          <Typography key={type} variant="body" size="xs" color="gray.600">
            {getTypeLabel(type as EventType)}: {count}
          </Typography>
        ))}
      </Stack>

      {/* Separador */}
      {previewEvents.length > 0 && (
        <div style={{ borderTop: '1px solid #E2E8F0', margin: '4px 0' }} />
      )}

      {/* Preview de eventos */}
      <Stack direction="column" gap="1">
        {previewEvents.map((event) => (
          <Stack key={event.id} direction="row" align="center" gap="2">
            <div
              style={{
                width: '3px',
                height: '16px',
                backgroundColor: event.colorDot,
                borderRadius: '2px'
              }}
            />
            <Typography variant="body" size="xs" color="gray.700" noOfLines={1}>
              {event.title}
            </Typography>
          </Stack>
        ))}

        {remainingCount > 0 && (
          <Typography variant="body" size="xs" color="gray.500" fontStyle="italic">
            +{remainingCount} más...
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Obtiene etiqueta en español para un tipo de evento
 */
function getTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    staff_shift: 'Personal',
    production: 'Producción',
    appointment: 'Citas',
    delivery: 'Entregas',
    time_off: 'Permisos',
    maintenance: 'Mantenimiento'
  };

  return labels[type] || type;
}
