/**
 * EVENT CARD COMPONENT
 *
 * Variante expanded para Day view del calendario.
 * Muestra información detallada del evento con acciones inline.
 *
 * @version 1.0.0
 * @see ../../docs/SCHEDULING_CALENDAR_DESIGN.md#day-view
 */

import React, { useState } from 'react';
import { Stack, Button } from '@/shared/ui';
import { Icon } from '@/shared/ui';
import type { UnifiedScheduleEvent, EventType } from '../../types/calendar';
import { format } from 'date-fns';
import {
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  BeakerIcon,
  CalendarIcon,
  TruckIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

export interface EventCardProps {
  event: UnifiedScheduleEvent;
  onEdit?: (event: UnifiedScheduleEvent) => void;
  onDelete?: (event: UnifiedScheduleEvent) => void;
  onComplete?: (event: UnifiedScheduleEvent) => void;
  showActions?: boolean;
  expanded?: boolean;
}

const EVENT_ICONS: Record<EventType, typeof UserIcon> = {
  staff_shift: UserIcon,
  production: BeakerIcon,
  appointment: CalendarIcon,
  delivery: TruckIcon,
  time_off: CalendarDaysIcon,
  maintenance: WrenchScrewdriverIcon
};

/**
 * EventCard - Expanded variant para Day view
 *
 * Muestra:
 * - Información completa del evento
 * - Metadata específica por tipo
 * - Acciones inline (Edit, Delete, Complete)
 * - Estado visual con iconos y colores
 */
export function EventCard({
  event,
  onEdit,
  onDelete,
  onComplete,
  showActions = true,
  expanded = false
}: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const startTime = format(event.start, 'HH:mm');
  const endTime = format(event.end, 'HH:mm');
  const duration = Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60)); // minutes

  const EventIcon = EVENT_ICONS[event.type];

  // Status colors
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    confirmed: { bg: '#D1FAE5', text: '#065F46', label: 'Confirmado' },
    pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pendiente' },
    completed: { bg: '#E5E7EB', text: '#1F2937', label: 'Completado' },
    cancelled: { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelado' }
  };

  const status = statusConfig[event.status] || statusConfig.pending;

  // Render metadata based on event type
  const renderMetadata = () => {
    switch (event.type) {
      case 'staff_shift':
        if (event.metadata.type === 'staff_shift') {
          return (
            <>
              <MetadataRow label="Posición" value={event.metadata.position} />
              <MetadataRow label="Tarifa" value={`$${event.metadata.hourlyRate}/h`} />
              {event.metadata.breakDuration > 0 && (
                <MetadataRow label="Descanso" value={`${event.metadata.breakDuration} min`} />
              )}
            </>
          );
        }
        break;

      case 'production':
        if (event.metadata.type === 'production') {
          return (
            <>
              <MetadataRow label="Cantidad" value={`${event.metadata.quantity} unidades`} />
              <MetadataRow label="Estación" value={event.metadata.station || 'N/A'} />
            </>
          );
        }
        break;

      case 'appointment':
        if (event.metadata.type === 'appointment') {
          return (
            <>
              <MetadataRow label="Cliente" value={event.metadata.customerName} />
              {event.metadata.serviceType && (
                <MetadataRow label="Servicio" value={event.metadata.serviceType} />
              )}
            </>
          );
        }
        break;

      case 'time_off':
        if (event.metadata.type === 'time_off') {
          return (
            <>
              <MetadataRow label="Tipo" value={event.metadata.timeOffType} />
              <MetadataRow label="Aprobado" value={event.metadata.approved ? 'Sí' : 'Pendiente'} />
            </>
          );
        }
        break;

      case 'delivery':
        if (event.metadata.type === 'delivery') {
          return (
            <>
              <MetadataRow label="Destino" value={event.metadata.destination} />
              <MetadataRow label="Vehículo" value={event.metadata.vehicleId || 'N/A'} />
            </>
          );
        }
        break;

      case 'maintenance':
        if (event.metadata.type === 'maintenance') {
          return (
            <>
              <MetadataRow label="Equipo" value={event.metadata.equipmentId} />
              <MetadataRow label="Tipo" value={event.metadata.maintenanceType} />
            </>
          );
        }
        break;
    }
    return null;
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: event.colorBg,
        border: `2px solid ${event.colorBorder}`,
        borderRadius: '8px',
        padding: '12px',
        transition: 'all 0.2s ease',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
      }}
    >
      <Stack direction="column" gap="3">
        {/* HEADER */}
        <Stack direction="row" justify="space-between" align="start">
          <Stack direction="row" gap="2" align="center">
            <Icon as={EventIcon} size="lg" color={event.colorBorder} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: event.colorText }}>
                {event.title}
              </div>
              <div style={{ fontSize: '12px', color: event.colorText, opacity: 0.7, marginTop: '2px' }}>
                {startTime} - {endTime} ({duration} min)
              </div>
            </div>
          </Stack>

          {/* Status Badge */}
          <div
            style={{
              backgroundColor: status.bg,
              color: status.text,
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {status.label}
          </div>
        </Stack>

        {/* METADATA */}
        {expanded && (
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.5)',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          >
            <Stack direction="column" gap="2">
              {renderMetadata()}
              {event.location && <MetadataRow label="Ubicación" value={event.location} />}
              {event.description && <MetadataRow label="Descripción" value={event.description} />}
            </Stack>
          </div>
        )}

        {/* ACTIONS */}
        {showActions && (isHovered || expanded) && (
          <Stack direction="row" gap="2" justify="end">
            {event.status !== 'completed' && onComplete && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => onComplete(event)}
                colorPalette="green"
              >
                <Icon as={CheckCircleIcon} size="sm" />
                Completar
              </Button>
            )}

            {onEdit && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => onEdit(event)}
                colorPalette="blue"
              >
                <Icon as={PencilIcon} size="sm" />
                Editar
              </Button>
            )}

            {onDelete && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => onDelete(event)}
                colorPalette="red"
              >
                <Icon as={TrashIcon} size="sm" />
                Eliminar
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </div>
  );
}

/**
 * MetadataRow - Helper para mostrar key-value pairs
 */
interface MetadataRowProps {
  label: string;
  value: string | number;
}

function MetadataRow({ label, value }: MetadataRowProps) {
  return (
    <Stack direction="row" justify="space-between">
      <span style={{ fontWeight: 500, color: '#6B7280' }}>{label}:</span>
      <span style={{ color: '#111827' }}>{value}</span>
    </Stack>
  );
}

/**
 * EventCardCompact - Variant for timeline with less space
 */
export interface EventCardCompactProps {
  event: UnifiedScheduleEvent;
  onClick?: (event: UnifiedScheduleEvent) => void;
}

export function EventCardCompact({ event, onClick }: EventCardCompactProps) {
  const startTime = format(event.start, 'HH:mm');
  const EventIcon = EVENT_ICONS[event.type];

  return (
    <div
      onClick={() => onClick?.(event)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: event.colorBg,
        borderLeft: `4px solid ${event.colorBorder}`,
        padding: '8px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <Icon as={EventIcon} size="sm" color={event.colorBorder} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: event.colorText }}>
          {event.title}
        </div>
        <div style={{ fontSize: '11px', color: event.colorText, opacity: 0.7 }}>
          {startTime}
        </div>
      </div>
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: event.colorDot
        }}
      />
    </div>
  );
}
