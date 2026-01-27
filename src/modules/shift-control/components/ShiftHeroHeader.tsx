/**
 * ShiftHeroHeader - Hero section for shift control
 * 
 * Displays shift metadata and control actions in a prominent header
 * 
 * @module shift-control/components
 * @version 2.0 - Enhanced UX with better visual hierarchy
 */

import { Stack, HStack, Text, Button, Badge, Skeleton, Separator } from '@/shared/ui';
import type { OperationalShift } from '../types';
import { ShiftTimer } from './ShiftTimer';
import { formatDate, formatRelativeTime } from '../utils/formatters';

interface ShiftHeroHeaderProps {
  shift: OperationalShift | null;
  isOperational: boolean;
  locationName: string | null;
  loading?: boolean;
  
  // Actions
  onOpenShift: () => void;
  onCloseShift: () => void;
  onViewReport?: () => void;
  
  // UI state
  hasBlockers?: boolean;
  blockersCount?: number;
}

export function ShiftHeroHeader({ 
  shift, 
  isOperational, 
  locationName,
  onOpenShift,
  onCloseShift,
  onViewReport,
  hasBlockers,
  blockersCount,
  loading 
}: ShiftHeroHeaderProps) {
  
  if (loading && !shift) {
    return (
      <Stack gap="3">
        <Skeleton height="40px" width="300px" />
        <Skeleton height="20px" width="400px" />
        <Skeleton height="40px" width="200px" />
      </Stack>
    );
  }
  
  return (
    <Stack gap="4">
      {/* Línea 1: Número de turno + Timer + Badge */}
      <HStack justify="space-between" align="center" flexWrap="wrap" gap="3">
        <HStack gap="3" align="center" flexWrap="wrap">
          <Text fontSize="2xl" fontWeight="bold" color="gray.800" lineHeight="1.2">
            🕐 {shift ? `Turno #${shift.id.slice(0, 8)}` : 'Sin Turno Activo'}
          </Text>
          
          {isOperational && shift?.opened_at && (
            <ShiftTimer startTime={shift.opened_at} />
          )}
        </HStack>
        
        <Badge 
          colorPalette={isOperational ? 'green' : 'gray'} 
          size="lg"
          variant="solid"
          px="4"
          py="2"
        >
          {isOperational ? '✓ Operativo' : '○ Cerrado'}
        </Badge>
      </HStack>
      
      {/* Línea 2: Metadata del turno */}
      {shift && (
        <Stack gap="2">
          <HStack gap="2" fontSize="sm" color="gray.700" fontWeight="medium" flexWrap="wrap">
            <HStack gap="1.5">
              <Text color="gray.500">👤</Text>
              <Text>{shift.opened_by_name || 'Usuario'}</Text>
            </HStack>
            <Text color="gray.400">•</Text>
            <HStack gap="1.5">
              <Text color="gray.500">📍</Text>
              <Text>{locationName || 'Ubicación'}</Text>
            </HStack>
          </HStack>
          
          {shift.opened_at && (
            <HStack gap="2" fontSize="xs" color="gray.500" flexWrap="wrap">
              <Text>Inicio: {formatDate(shift.opened_at)}</Text>
              <Text>•</Text>
              <Text fontWeight="medium" color="gray.600">
                {formatRelativeTime(shift.opened_at)}
              </Text>
            </HStack>
          )}
        </Stack>
      )}
      
      <Separator />
      
      {/* Línea 3: Acciones del turno */}
      <HStack gap="3" flexWrap="wrap">
        {!isOperational && (
          <Button
            onClick={onOpenShift}
            loading={loading}
            colorPalette="green"
            size="lg"
            fontWeight="semibold"
          >
            ▶️ Abrir Turno
          </Button>
        )}
        
        {isOperational && (
          <>
            <Button
              onClick={onCloseShift}
              loading={loading}
              colorPalette="red"
              variant="solid"
              size="lg"
              fontWeight="semibold"
              disabled={hasBlockers}
            >
              ■ Cerrar Turno
              {hasBlockers && blockersCount ? ` (${blockersCount})` : ''}
            </Button>
            
            {onViewReport && (
              <Button
                onClick={onViewReport}
                variant="outline"
                size="lg"
                colorPalette="blue"
                fontWeight="semibold"
              >
                📊 Ver Reporte
              </Button>
            )}
          </>
        )}
      </HStack>
    </Stack>
  );
}
