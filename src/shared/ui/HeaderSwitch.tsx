/**
 * HeaderSwitch - Dashboard View Toggle Component
 *
 * REDISEÑADO v2.0: Usa SegmentGroup en lugar de tabs para mejor UX
 *
 * Switch intercambiable de 2+ posiciones para el dashboard.
 * Permite cambiar entre diferentes vistas/contextos (Alertas, Setup, Logros, etc.)
 *
 * Basado en:
 * - iOS Segmented Controls (diseño distintivo de toggle)
 * - Material Design Segmented Buttons
 * - Chakra UI v3 SegmentGroup
 *
 * Cambios v2.0:
 * - ✅ Diseño de toggle real (no tabs)
 * - ✅ Mejor feedback visual de selección
 * - ✅ Bordes y fondo para claridad
 * - ✅ Badges integrados correctamente
 *
 * Features:
 * - 2+ posiciones configurables
 * - Iconos + texto (responsive: solo iconos en mobile)
 * - Badge de notificaciones opcional
 * - Persistencia en sessionStorage
 * - Transiciones suaves
 * - Accesibilidad WCAG 2.1
 *
 * @example
 * <HeaderSwitch
 *   positions={[
 *     { id: 'alerts', icon: '🔔', label: 'Alertas' },
 *     { id: 'setup', icon: '🏆', label: 'Setup', badge: 3 }
 *   ]}
 *   defaultPosition="alerts"
 *   onPositionChange={(pos) => console.log(pos)}
 * />
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Badge,
  SegmentGroup,
  SegmentGroupItem,
  SegmentGroupItemText,
  SegmentGroupItemHiddenInput,
  SegmentGroupIndicator
} from '@/shared/ui';

// ===============================
// INTERFACES
// ===============================

export interface SwitchPosition {
  /** ID único de la posición */
  id: string;
  /** Icono (emoji o component) */
  icon: React.ReactNode;
  /** Etiqueta textual */
  label: string;
  /** Badge de notificaciones (opcional) */
  badge?: number;
  /** Deshabilitar esta posición */
  disabled?: boolean;
}

export interface HeaderSwitchProps {
  /** Lista de posiciones disponibles */
  positions: SwitchPosition[];
  /** Posición inicial por defecto */
  defaultPosition: string;
  /** Posición actual controlada (opcional) */
  currentPosition?: string;
  /** Callback al cambiar posición */
  onPositionChange: (position: string) => void;
  /** Guardar en sessionStorage */
  persistInSession?: boolean;
  /** Key para sessionStorage */
  sessionKey?: string;
  /** Variante visual */
  variant?: 'line' | 'enclosed' | 'subtle';
  /** Tamaño */
  size?: 'sm' | 'md' | 'lg';
  /** Color palette */
  colorPalette?: 'blue' | 'gray' | 'brand';
}

// ===============================
// SIZE MAPS
// ===============================

const SIZE_CONFIG = {
  sm: {
    padding: '6px 12px',
    fontSize: '0.875rem',
    gap: '6px',
    iconSize: '14px'
  },
  md: {
    padding: '8px 16px',
    fontSize: '1rem',
    gap: '8px',
    iconSize: '16px'
  },
  lg: {
    padding: '10px 20px',
    fontSize: '1.125rem',
    gap: '10px',
    iconSize: '18px'
  }
} as const;

// ===============================
// COMPONENT
// ===============================

export const HeaderSwitch: React.FC<HeaderSwitchProps> = ({
  positions,
  defaultPosition,
  currentPosition: controlledPosition,
  onPositionChange,
  persistInSession = false,
  sessionKey = 'headerSwitchPosition',
  variant = 'line',
  size = 'md',
  colorPalette = 'blue'
}) => {
  // Estado interno (puede ser controlado externamente)
  const [internalPosition, setInternalPosition] = useState<string>(() => {
    // Intentar recuperar de sessionStorage si está habilitado
    if (persistInSession && typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved && positions.some(p => p.id === saved)) {
        return saved;
      }
    }
    return defaultPosition;
  });

  // Usar posición controlada si se provee, sino usar interna
  const activePosition = controlledPosition ?? internalPosition;

  // Guardar en sessionStorage al cambiar
  useEffect(() => {
    if (persistInSession && typeof window !== 'undefined') {
      sessionStorage.setItem(sessionKey, activePosition);
    }
  }, [activePosition, persistInSession, sessionKey]);

  // Handler de cambio de posición
  const handlePositionChange = (details: { value: string }) => {
    const positionId = details.value;
    const position = positions.find(p => p.id === positionId);
    if (!position || position.disabled) return;

    setInternalPosition(positionId);
    onPositionChange(positionId);
  };

  // Configuración de tamaño
  const sizeConfig = SIZE_CONFIG[size];

  // ===============================
  // RENDER
  // ===============================

  return (
    <SegmentGroup
      value={activePosition}
      onValueChange={handlePositionChange}
      colorPalette={colorPalette}
      size={size}
    >
      {positions.map((position) => {
        const isDisabled = position.disabled ?? false;

        return (
          <SegmentGroupItem
            key={position.id}
            value={position.id}
            disabled={isDisabled}
          >
            <Stack
              direction="row"
              align="center"
              gap={sizeConfig.gap}
              justify="center"
            >
              {/* Icono */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize={sizeConfig.iconSize}
              >
                {position.icon}
              </Box>

              {/* Label - Ocultar en mobile si es necesario */}
              <Box display={{ base: 'none', md: 'block' }}>
                <SegmentGroupItemText>{position.label}</SegmentGroupItemText>
              </Box>

              {/* Badge de notificaciones */}
              {position.badge !== undefined && position.badge > 0 && (
                <Badge
                  colorPalette="red"
                  variant="solid"
                  size="sm"
                  fontSize="xs"
                  borderRadius="full"
                  minW="20px"
                  h="20px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {position.badge > 99 ? '99+' : position.badge}
                </Badge>
              )}
            </Stack>
            <SegmentGroupItemHiddenInput />
          </SegmentGroupItem>
        );
      })}
      <SegmentGroupIndicator />
    </SegmentGroup>
  );
};

// ===============================
// VARIANTS PRECONFIGURADOS
// ===============================

/**
 * Dashboard Switch - Para alternar entre Alertas y Setup/Logros
 */
export const DashboardSwitch: React.FC<{
  setupComplete: boolean;
  activeView: 'alerts' | 'setup' | 'achievements';
  onViewChange: (view: 'alerts' | 'setup' | 'achievements') => void;
  setupBadge?: number;
  alertsBadge?: number;
}> = ({ setupComplete, activeView, onViewChange, setupBadge, alertsBadge }) => {
  const positions: SwitchPosition[] = [
    {
      id: 'alerts',
      icon: '🔔',
      label: 'Alertas',
      badge: alertsBadge
    },
    {
      id: setupComplete ? 'achievements' : 'setup',
      icon: '🏆',
      label: setupComplete ? 'Logros' : 'Setup',
      badge: setupBadge
    }
  ];

  return (
    <HeaderSwitch
      positions={positions}
      defaultPosition="alerts"
      currentPosition={activeView}
      onPositionChange={(pos) => onViewChange(pos as typeof activeView)}
      variant="line"
      size="md"
      colorPalette="blue"
      persistInSession={false} // Siempre volver a alerts al recargar
    />
  );
};

// Export variants
HeaderSwitch.Dashboard = DashboardSwitch;
