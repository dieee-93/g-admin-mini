/**
 * DynamicDashboardGrid - Unified Dynamic Dashboard with Drag & Drop
 *
 * Combina:
 * - Atomic Capabilities v2.0 (dynamic widgets según features activas)
 * - Drag & Drop (@dnd-kit/sortable)
 * - Real-time metrics (Zustand stores)
 * - Persistent configuration (localStorage)
 *
 * Reemplaza:
 * - ExecutiveOverview (widgets estáticos)
 * - DashboardGrid (solo drag-n-drop)
 * - Lógica de dynamic widgets en page.tsx
 *
 * @version 1.0.0 - Dashboard Unification
 */

import React, { Suspense, useState } from 'react';
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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { getDashboardWidget } from '@/lib/composition/ComponentLoader';
import { useDynamicDashboardWidgets, type DynamicWidget } from '../hooks/useDynamicDashboardWidgets';
import { DraggableWidgetWrapper } from './DraggableWidgetWrapper';
import { COMPONENT_TOKENS, DASHBOARD_TOKENS } from '@/theme/tokens';
import { logger } from '@/lib/logging';

// ===============================
// HELPER COMPONENTS
// ===============================

function WidgetSkeleton() {
  return (
    <Box
      p={DASHBOARD_TOKENS.spacing.pageContainer}
      bg="gray.100"
      borderRadius="md"
      h="150px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Typography variant="caption" color="gray.500">
        Cargando widget...
      </Typography>
    </Box>
  );
}

// ===============================
// MAIN COMPONENT
// ===============================

export const DynamicDashboardGrid: React.FC = () => {
  const {
    visibleDynamicWidgets,
    isEditMode,
    isDirty,
    isLoading,
    hasWidgets,
    hiddenWidgetsCount,
    lockedWidgetsCount,
    toggleEditMode,
    moveWidget,
    toggleWidget,
    lockWidget,
    saveConfig,
    resetToDefault,
    lastModified
  } = useDynamicDashboardWidgets();

  const [activeWidget, setActiveWidget] = useState<DynamicWidget | null>(null);

  // ===============================
  // DND SENSORS
  // ===============================

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px antes de activar drag
      },
    }),
    useSensor(KeyboardSensor)
  );

  // ===============================
  // EVENT HANDLERS
  // ===============================

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const widget = visibleDynamicWidgets.find(w => w.id === active.id);

    if (widget) {
      setActiveWidget(widget);
      logger.debug('App', 'Drag started', { widgetId: widget.id, title: widget.title });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = visibleDynamicWidgets.findIndex(w => w.id === active.id);
      const newIndex = visibleDynamicWidgets.findIndex(w => w.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedWidgets = arrayMove(visibleDynamicWidgets, oldIndex, newIndex);

        // Update positions based on new order
        const columns = 3; // TODO: Get from layout config
        reorderedWidgets.forEach((widget, index) => {
          const row = Math.floor(index / columns);
          const col = index % columns;
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
  // EMPTY STATE
  // ===============================

  if (!hasWidgets) {
    return (
      <Box p={DASHBOARD_TOKENS.spacing.pageContainer}>
        <Alert status="info" variant="subtle">
          <Stack gap="2">
            <Typography variant="body" size="md" weight="medium">
              No hay widgets disponibles
            </Typography>
            <Typography variant="body" size="sm" color="text.secondary">
              Activa más capabilities en el Setup Wizard para ver widgets dinámicos en tu dashboard.
            </Typography>
          </Stack>
        </Alert>
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
            Widgets Dinámicos
          </Typography>

          <Stack direction="row" gap="2">
            <Badge variant="subtle" colorPalette="blue" size="sm">
              {visibleDynamicWidgets.length} visible{visibleDynamicWidgets.length !== 1 ? 's' : ''}
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
          <Alert status="info" variant="subtle">
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
          items={visibleDynamicWidgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <Box p={DASHBOARD_TOKENS.spacing.pageContainer}>
            <SimpleGrid
              columns={{
                base: 1,
                sm: 2,
                md: 3,
                lg: 3
              }}
              gap={COMPONENT_TOKENS.ExecutiveOverview.cardGridGap}
            >
              {visibleDynamicWidgets.map((widget) => {
                // Dynamic widget loading
                try {
                  const Component = getDashboardWidget(widget.component);

                  return (
                    <DraggableWidgetWrapper
                      key={widget.id}
                      widget={widget}
                      isEditMode={isEditMode}
                      onToggleVisibility={toggleWidget}
                      onToggleLock={lockWidget}
                    >
                      <Suspense fallback={<WidgetSkeleton />}>
                        <Component />
                      </Suspense>
                    </DraggableWidgetWrapper>
                  );
                } catch (error) {
                  logger.error('App', `Failed to load widget ${widget.component}`, error);
                  return (
                    <Box
                      key={widget.id}
                      p={4}
                      bg="red.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="red.200"
                    >
                      <Stack gap="2">
                        <Stack direction="row" align="center" gap="2">
                          <Icon icon={XMarkIcon} size="sm" color="red.600" />
                          <Typography variant="body" size="sm" weight="medium" color="red.700">
                            Error cargando widget
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="red.600">
                          {widget.component}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                }
              })}
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
              <Suspense fallback={<WidgetSkeleton />}>
                {(() => {
                  try {
                    const Component = getDashboardWidget(activeWidget.component);
                    return <Component />;
                  } catch {
                    return <WidgetSkeleton />;
                  }
                })()}
              </Suspense>
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

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

export default DynamicDashboardGrid;
