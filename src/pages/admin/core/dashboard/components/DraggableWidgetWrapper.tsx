/**
 * DraggableWidgetWrapper - Wrapper for dynamic draggable widgets
 *
 * Simplified version of DraggableWidget.tsx adapted for dynamic loading.
 *
 * Features:
 * - Drag & Drop with @dnd-kit
 * - Lock/unlock functionality
 * - Visibility toggle
 * - Edit mode overlay
 * - Hover effects
 *
 * @version 2.0.0 - Dynamic Widgets Support
 */

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  Stack,
  Button,
  Icon,
  Typography
} from '@/shared/ui';
import {
  Bars3Icon,
  LockClosedIcon,
  LockOpenIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import type { DynamicWidget } from '../hooks/useDynamicDashboardWidgets';
import { COMPONENT_TOKENS } from '@/theme/tokens';

// ===============================
// INTERFACES
// ===============================

interface DraggableWidgetWrapperProps {
  widget: DynamicWidget;
  isEditMode: boolean;
  onToggleVisibility: (widgetId: string) => void;
  onToggleLock: (widgetId: string) => void;
  children: React.ReactNode;
}

// ===============================
// COMPONENT
// ===============================

export const DraggableWidgetWrapper: React.FC<DraggableWidgetWrapperProps> = ({
  widget,
  isEditMode,
  onToggleVisibility,
  onToggleLock,
  children
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({
    id: widget.id,
    disabled: widget.locked || !isEditMode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // ===============================
  // EVENT HANDLERS
  // ===============================

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisibility(widget.id);
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLock(widget.id);
  };

  // ===============================
  // COMPUTED VALUES
  // ===============================

  const canDrag = isEditMode && !widget.locked;
  const showControls = isEditMode && (isHovering || isDragging);

  // ===============================
  // RENDER
  // ===============================

  return (
    <Box
      ref={setNodeRef}
      style={style}
      position="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      opacity={widget.visible ? 1 : 0.3}
      transition="all 0.2s ease-in-out"
      transform={isOver ? 'scale(1.02)' : 'scale(1)'}
      shadow={isDragging ? 'xl' : showControls ? 'md' : 'sm'}
      borderRadius="md"
      bg="bg.surface"
      border="1px solid"
      borderColor={showControls ? 'border.accent' : 'border.default'}
      overflow="hidden"
      {...(canDrag ? { ...attributes, ...listeners } : {})}
    >
      {/* EDIT MODE OVERLAY */}
      {showControls && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          zIndex="overlay"
          bg="rgba(0, 0, 0, 0.8)"
          backdropFilter="blur(4px)"
          p={COMPONENT_TOKENS.DraggableWidget.controlsPadding}
          borderTopRadius="md"
        >
          <Stack direction="row" justify="space-between" align="center">
            {/* LEFT - Drag Handle & Widget Info */}
            <Stack direction="row" align="center" gap="2">
              {canDrag && (
                <Box
                  cursor="grab"
                  color="white"
                  p="1"
                  borderRadius="sm"
                  bg="rgba(255, 255, 255, 0.1)"
                  _active={{ cursor: 'grabbing' }}
                >
                  <Icon icon={Bars3Icon} size="sm" />
                </Box>
              )}

              <Typography
                variant="body"
                size="xs"
                weight="medium"
                color="white"
              >
                {widget.title}
              </Typography>
            </Stack>

            {/* RIGHT - Controls */}
            <Stack direction="row" gap="1">
              {/* Visibility Toggle */}
              <Button
                variant="ghost"
                size="xs"
                onClick={handleToggleVisibility}
                colorPalette={widget.visible ? "green" : "gray"}
                aria-label={widget.visible ? "Ocultar widget" : "Mostrar widget"}
              >
                <Icon
                  icon={widget.visible ? EyeIcon : EyeSlashIcon}
                  size="xs"
                />
              </Button>

              {/* Lock Toggle */}
              <Button
                variant="ghost"
                size="xs"
                onClick={handleToggleLock}
                colorPalette={widget.locked ? "red" : "blue"}
                aria-label={widget.locked ? "Desbloquear widget" : "Bloquear widget"}
              >
                <Icon
                  icon={widget.locked ? LockClosedIcon : LockOpenIcon}
                  size="xs"
                />
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}

      {/* WIDGET CONTENT */}
      <Box
        position="relative"
        zIndex="base"
        opacity={showControls ? 0.7 : 1}
        transition="opacity 0.2s ease-in-out"
        pointerEvents={isEditMode ? 'none' : 'auto'}
      >
        {children}
      </Box>

      {/* DRAG PREVIEW INDICATOR */}
      {isDragging && (
        <Box
          position="absolute"
          inset="0"
          bg="blue.500"
          opacity={0.1}
          borderRadius="md"
          border="2px dashed"
          borderColor="blue.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="overlay"
        >
          <Typography
            variant="body"
            size="sm"
            weight="medium"
            color="blue.600"
          >
            Arrastrando...
          </Typography>
        </Box>
      )}

      {/* DROP ZONE INDICATOR */}
      {isOver && !isDragging && (
        <Box
          position="absolute"
          inset="0"
          bg="green.500"
          opacity={0.1}
          borderRadius="md"
          border="2px solid"
          borderColor="green.500"
          zIndex="overlay"
        />
      )}

      {/* LOCKED INDICATOR */}
      {widget.locked && isEditMode && (
        <Box
          position="absolute"
          top="2"
          right="2"
          zIndex="overlay"
          bg="red.500"
          color="white"
          p="1"
          borderRadius="sm"
          fontSize="xs"
        >
          <Icon icon={LockClosedIcon} size="xs" />
        </Box>
      )}
    </Box>
  );
};
