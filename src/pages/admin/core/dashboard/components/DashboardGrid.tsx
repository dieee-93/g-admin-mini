/**
 * DashboardGrid - Grid personalizable con drag & drop para widgets del dashboard
 * 
 * Características:
 * - Drag & Drop con @dnd-kit/sortable
 * - Grid responsive 
 * - Edit mode toggle
 * - Auto-save configuration
 * - Widget management
 * 
 * @version 1.0.0 - FASE 3 Dashboard Personalizable
 */

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToWindowEdges,
  restrictToFirstScrollableAncestor,
} from '@dnd-kit/modifiers';
import {
  Box,
  SimpleGrid,
  Stack,
  Button,
  Typography,
  Badge,
  Alert,
  Icon
} from '@/shared/ui';
import {
  PencilIcon,
  CheckIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { DraggableWidget } from './DraggableWidget';
import { useDashboardConfig, type DashboardWidget } from '../hooks/useDashboardConfig';
import { COMPONENT_TOKENS, DASHBOARD_TOKENS } from '@/theme/tokens';
import { logger } from '@/lib/logging';

// ===============================
// INTERFACES
// ===============================

interface DashboardGridProps {
  children: (widget: DashboardWidget) => React.ReactNode;
}

// ===============================
// COMPONENT
// ===============================

export const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => {
  const {
    layout,
    isEditMode,
    isDirty,
    isLoading,
    visibleWidgets,
    toggleEditMode,
    moveWidget,
    toggleWidget,
    lockWidget,
    saveConfig,
    resetToDefault,
    lastModified
  } = useDashboardConfig();

  const [activeWidget, setActiveWidget] = React.useState<DashboardWidget | null>(null);

  // ===============================
  // DND SENSORS
  // ===============================

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px antes de activar drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ===============================
  // EVENT HANDLERS
  // ===============================

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const widget = layout.widgets.find(w => w.id === active.id);
    
    if (widget) {
      setActiveWidget(widget);
      logger.debug('App', 'Drag started', { widgetId: widget.id, title: widget.title });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = layout.widgets.findIndex(w => w.id === active.id);
      const newIndex = layout.widgets.findIndex(w => w.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedWidgets = arrayMove(layout.widgets, oldIndex, newIndex);
        
        // Update positions based on new order
        reorderedWidgets.forEach((widget, index) => {
          const row = Math.floor(index / layout.columns);
          const col = index % layout.columns;
          moveWidget(widget.id, { x: col, y: row });
        });

        logger.info('App', 'Widgets reordered', { 
          from: oldIndex, 
          to: newIndex,
          widgetId: active.id 
        });
      }
    }

    setActiveWidget(null);
  };

  const handleSaveConfig = async () => {
    try {
      await saveConfig();
      logger.info('App', 'Dashboard configuration saved manually');
    } catch (error) {
      logger.error('App', 'Failed to save dashboard configuration', error);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear el dashboard a la configuración por defecto?')) {
      resetToDefault();
      logger.info('App', 'Dashboard reset to default configuration');
    }
  };

  // ===============================
  // COMPUTED VALUES
  // ===============================

  const sortedVisibleWidgets = visibleWidgets.sort((a, b) => {
    if (a.position.y !== b.position.y) {
      return a.position.y - b.position.y;
    }
    return a.position.x - b.position.x;
  });

  const hiddenWidgetsCount = layout.widgets.filter(w => !w.visible).length;
  const lockedWidgetsCount = layout.widgets.filter(w => w.locked).length;

  // ===============================
  // LOADING STATE
  // ===============================

  if (isLoading) {
    return (
      <Box p={DASHBOARD_TOKENS.spacing.pageContainer}>
        <Stack gap={COMPONENT_TOKENS.ExecutiveOverview.sectionGap}>
          <Typography variant="body" size="lg" align="center" color="text.secondary">
            Cargando configuración del dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ===============================
  // RENDER
  // ===============================

  return (
    <Box>
      {/* DASHBOARD CONTROLS */}
      <Stack 
        direction="row" 
        justify="space-between" 
        align="center" 
        mb={COMPONENT_TOKENS.ExecutiveOverview.sectionGap}
        p={DASHBOARD_TOKENS.spacing.pageContainer}
        bg="bg.subtle"
        borderRadius="md"
        border="1px solid"
        borderColor="border.default"
      >
        {/* LEFT - Status Info */}
        <Stack direction="row" align="center" gap="4">
          <Typography variant="body" size="sm" weight="medium">
            Dashboard Personalizable
          </Typography>
          
          <Stack direction="row" gap="2">
            <Badge variant="subtle" colorPalette="blue" size="sm">
              {visibleWidgets.length} visible
            </Badge>
            
            {hiddenWidgetsCount > 0 && (
              <Badge variant="subtle" colorPalette="gray" size="sm">
                {hiddenWidgetsCount} oculto{hiddenWidgetsCount > 1 ? 's' : ''}
              </Badge>
            )}
            
            {lockedWidgetsCount > 0 && (
              <Badge variant="subtle" colorPalette="red" size="sm">
                {lockedWidgetsCount} bloqueado{lockedWidgetsCount > 1 ? 's' : ''}
              </Badge>
            )}
            
            {isDirty && (
              <Badge variant="solid" colorPalette="orange" size="sm">
                Sin guardar
              </Badge>
            )}
          </Stack>
        </Stack>

        {/* RIGHT - Controls */}
        <Stack direction="row" gap="2">
          {/* Toggle Edit Mode */}
          <Button
            variant={isEditMode ? "solid" : "outline"}
            colorPalette={isEditMode ? "red" : "blue"}
            size="sm"
            onClick={toggleEditMode}
          >
            <Stack direction="row" align="center" gap="1">
              <Icon icon={isEditMode ? CheckIcon : PencilIcon} size="xs" />
              {isEditMode ? 'Finalizar Edición' : 'Editar Layout'}
            </Stack>
          </Button>

          {/* Save Config */}
          {isDirty && (
            <Button
              variant="outline"
              colorPalette="green"
              size="sm"
              onClick={handleSaveConfig}
            >
              <Stack direction="row" align="center" gap="1">
                <Icon icon={CheckIcon} size="xs" />
                Guardar
              </Stack>
            </Button>
          )}

          {/* Reset to Default */}
          <Button
            variant="ghost"
            colorPalette="gray"
            size="sm"
            onClick={handleResetToDefault}
          >
            <Stack direction="row" align="center" gap="1">
              <Icon icon={ArrowPathIcon} size="xs" />
              Reset
            </Stack>
          </Button>
        </Stack>
      </Stack>

      {/* EDIT MODE HELP */}
      {isEditMode && (
        <Box mb={COMPONENT_TOKENS.ExecutiveOverview.sectionGap}>
          <Alert
            status="info"
            variant="subtle"
          >
          <Stack gap="1">
            <Typography variant="body" size="sm" weight="medium">
              Modo de Edición Activo
            </Typography>
            <Typography variant="body" size="xs" color="text.secondary">
              Arrastra los widgets para reordenarlos. Usa los controles que aparecen al hacer hover para bloquear, ocultar o configurar cada widget.
            </Typography>
          </Stack>
          </Alert>
        </Box>
      )}

      {/* DASHBOARD GRID */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToFirstScrollableAncestor, restrictToWindowEdges]}
      >
        <SortableContext 
          items={sortedVisibleWidgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <Box p={DASHBOARD_TOKENS.spacing.pageContainer}>
            <SimpleGrid
              columns={{ 
                base: 1, 
                sm: 2, 
                md: Math.min(3, layout.columns),
                lg: layout.columns 
              }}
              gap={COMPONENT_TOKENS.ExecutiveOverview.cardGridGap}
            >
            {sortedVisibleWidgets.map((widget) => (
              <DraggableWidget
                key={widget.id}
                widget={widget}
                isEditMode={isEditMode}
                onToggleVisibility={toggleWidget}
                onToggleLock={lockWidget}
              >
                {children(widget)}
              </DraggableWidget>
            ))}
            </SimpleGrid>
          </Box>
        </SortableContext>
        
        {/* DRAG OVERLAY */}
        <DragOverlay>
          {activeWidget ? (
            <Box
              bg="bg.surface"
              shadow="xl"
              borderRadius="md"
              border="2px solid"
              borderColor="blue.500"
              opacity={0.9}
            >
              {children(activeWidget)}
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* HIDDEN WIDGETS SECTION */}
      {isEditMode && hiddenWidgetsCount > 0 && (
        <Box
          mt={COMPONENT_TOKENS.ExecutiveOverview.sectionGap}
          p={DASHBOARD_TOKENS.spacing.pageContainer}
          bg="bg.muted"
          borderRadius="md"
          border="1px dashed"
          borderColor="border.default"
        >
          <Stack gap="3">
            <Stack direction="row" align="center" gap="2">
              <Icon icon={EyeIcon} size="sm" color="text.secondary" />
              <Typography variant="body" size="sm" weight="medium" color="text.secondary">
                Widgets Ocultos ({hiddenWidgetsCount})
              </Typography>
            </Stack>
            
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="2">
              {layout.widgets
                .filter(w => !w.visible)
                .map((widget) => (
                  <Button
                    key={widget.id}
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWidget(widget.id)}
                    colorPalette="gray"
                  >
                    Mostrar: {widget.title}
                  </Button>
                ))}
            </SimpleGrid>
          </Stack>
        </Box>
      )}

      {/* CONFIGURATION INFO */}
      {isEditMode && (
        <Box
          mt="2"
          p="2"
          bg="bg.subtle"
          borderRadius="sm"
          fontSize="xs"
          color="text.secondary"
          textAlign="center"
        >
          Última modificación: {new Date(lastModified).toLocaleString()} 
          {isDirty && ' • Cambios sin guardar se guardan automáticamente'}
        </Box>
      )}
    </Box>
  );
};