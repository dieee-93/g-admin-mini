// src/shared/alerts/components/GlobalAlertsDisplay.tsx
// 🎯 TOAST STACK UNIFICADO - Sistema de Notificaciones Moderno
// Inspirado en Vercel/Linear/Notion (2025 UX Best Practices)
//
// 🔧 TECHNICAL NOTE: Progress Tracking Architecture
// This component uses Dan Abramov's useInterval pattern to avoid infinite render loops.
// See: docs/alert/USEINTERVAL_PATTERN.md for full explanation.
//
// Key insight: setInterval with state dependencies creates cascading re-renders.
// Solution: useRef + stable dependencies = declarative intervals without render loops.

import React, { useState, useEffect, memo, useMemo } from 'react';
import {
  Box,
  VStack,
  Portal,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertDisplay } from './AlertDisplay';
import { useAlerts } from '../hooks/useAlerts';
import { useAlertsContext } from '../AlertsProvider';
import { useInterval } from '@/shared/hooks/useInterval';
import { logger } from '@/lib/logging';
export interface GlobalAlertsDisplayProps {
  maxVisible?: number;
}

// 🛠️ PERFORMANCE: Memoize component to prevent unnecessary re-renders
export const GlobalAlertsDisplay = memo(function GlobalAlertsDisplay({
  maxVisible
}: GlobalAlertsDisplayProps) {
  const context = useAlertsContext();
  const { 
    alerts, 
    count, 
    criticalCount, 
    activeCount,
    actions 
  } = useAlerts({
    status: 'active',
    autoFilter: true
  });

  // Use config from context or props
  const finalMaxVisible = maxVisible ?? context.config.toastStackMax ?? 3;
  const toastDuration = context.config.toastDuration ?? {
    info: 3000,
    success: 3000,
    warning: 5000,
    error: 8000,
    critical: Infinity
  };

  // 🎯 STATE: Progress tracking for auto-dismiss toasts
  // - progress: Visual progress bar percentage (0-100)
  // - toastStartTimes: Timestamp when each toast entered visible stack
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [toastStartTimes, setToastStartTimes] = useState<Record<string, number>>({});

  // Get visible alerts (top N) - Keep stable until they finish or are dismissed
  const visibleAlerts = useMemo(() => {
    // Strategy: Keep showing alerts that are already visible until they auto-dismiss
    // Only replace them when they're gone (not just when new ones arrive)
    const tracked = Object.keys(toastStartTimes);
    
    // Keep alerts that are already being tracked
    const stillVisible = alerts.filter(a => tracked.includes(a.id));
    
    // If we have space, add new alerts up to the limit
    if (stillVisible.length < finalMaxVisible) {
      const newAlerts = alerts.filter(a => !tracked.includes(a.id));
      const slotsAvailable = finalMaxVisible - stillVisible.length;
      return [...stillVisible, ...newAlerts.slice(0, slotsAvailable)];
    }
    
    return stillVisible;
  }, [alerts, finalMaxVisible, toastStartTimes]);

  // Debug: Log initial state
  useEffect(() => {
    logger.info('GlobalAlertsDisplay', 'Component mounted', {
      totalAlerts: alerts.length,
      visibleCount: visibleAlerts.length,
      maxVisible: finalMaxVisible,
      toastDuration
    });
  }, []); // Only on mount

  // 📍 LIFECYCLE: Track when alerts enter the visible stack
  // Important: We track when toasts APPEAR, not when alerts are CREATED
  // This ensures duration starts from visibility, not from creation time
  useEffect(() => {
    const now = Date.now();
    setToastStartTimes(prev => {
      const updated = { ...prev };
      visibleAlerts.forEach(alert => {
        // Only set start time if not already tracking
        if (!updated[alert.id]) {
          updated[alert.id] = now;
          logger.debug('GlobalAlertsDisplay', `Started tracking toast ${alert.id.substring(0, 8)}`, {
            alertId: alert.id,
            severity: alert.severity,
            startTime: now,
            createdAt: alert.createdAt.getTime()
          });
        }
      });
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleAlerts.map(a => a.id).join(',')]); // Only when alert IDs change

  // 🎯 DAN ABRAMOV PATTERN: Declarative interval with useInterval hook
  // 
  // WHY THIS PATTERN?
  // - Avoids infinite render loops (state changes don't restart interval)
  // - Callback always has access to latest state via closure
  // - Interval only restarts if delay changes (100ms is constant)
  // - Clean separation: interval lifecycle vs callback updates
  //
  // See: docs/alert/USEINTERVAL_PATTERN.md for full explanation
  //
  // WHAT IT DOES:
  // 1. Calculate progress for each visible toast (elapsed / duration * 100)
  // 2. Auto-dismiss toasts when progress reaches 100%
  // 3. Clean up tracking data for dismissed toasts
  useInterval(() => {
    setProgress(prev => {
      const updated: Record<string, number> = {};
      let hasChanges = false;

      visibleAlerts.forEach(alert => {
        const duration = toastDuration[alert.severity] ?? toastDuration.info ?? 3000;
        if (duration === Infinity) {
          return; // No progress bar for critical alerts (manual dismiss only)
        }

        // Calculate elapsed time from when toast APPEARED (not created)
        const startTime = toastStartTimes[alert.id];
        
        if (!startTime) {
          return; // Skip if not tracking yet
        }
        
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        
        if (prev[alert.id] !== newProgress) {
          hasChanges = true;
        }
        updated[alert.id] = newProgress;

        // Auto-dismiss when progress reaches 100%
        if (newProgress >= 100 && alert.status === 'active') {
          logger.info('GlobalAlertsDisplay', `Auto-dismissing toast ${alert.id.substring(0, 8)}`, {
            progress: newProgress,
            elapsed,
            duration
          });
          actions.dismiss(alert.id);
          // Clean up tracking
          setToastStartTimes(times => {
            const copy = { ...times };
            delete copy[alert.id];
            logger.debug('GlobalAlertsDisplay', `Cleaned up tracking for ${alert.id.substring(0, 8)}`);
            return copy;
          });
        }
      });

      return hasChanges ? updated : prev;
    });
  }, 100); // Fixed 100ms interval for smooth progress (60fps-friendly)

  // Don't render if no alerts
  if (alerts.length === 0) {
    return null;
  }

  return (
    <Portal>
      <Box
        position="fixed"
        top={4}
        right={4}
        zIndex={9999}
        maxW="400px"
        w="full"
        px={4}
        pointerEvents="none"
      >
        <VStack gap={2} align="stretch">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ 
                  opacity: index < finalMaxVisible ? 1 : 0.7,
                  x: 0,
                  scale: index < finalMaxVisible ? 1 : 0.95,
                  y: index * -2  // Slight stagger for stacked effect
                }}
                exit={{ 
                  opacity: 0, 
                  x: 100, 
                  scale: 0.8,
                  transition: { duration: 0.2 }
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 500, 
                  damping: 30,
                  opacity: { duration: 0.2 }
                }}
                style={{ pointerEvents: 'auto' }}
              >
                <AlertDisplay
                  alert={alert}
                  variant="card"
                  size="sm"
                  showActions={true}
                  showMetadata={false}
                  progress={progress[alert.id]}
                  onAcknowledge={actions.acknowledge}
                  onResolve={actions.resolve}
                  onDismiss={actions.dismiss}
                  onAction={async (actionId, alertId) => {
                    // Find and execute the action
                    const alertData = alerts.find(a => a.id === alertId);
                    const action = alertData?.actions?.find(a => a.id === actionId);
                    
                    if (action) {
                      try {
                        await action.action();
                        
                        // Auto-resolve if configured
                        if (action.autoResolve) {
                          await actions.resolve(alertId, `Resuelto por acción: ${action.label}`);
                        }
                      } catch (error) {
                        logger.error('App', 'Error executing alert action:', error);
                      }
                    }
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </VStack>
      </Box>
    </Portal>
  );
}); // End memo

/**
 * 🎯 WRAPPER QUE SE INCLUYE AUTOMÁTICAMENTE EN EL PROVIDER
 * Este componente se renderiza automáticamente cuando hay alertas activas
 * Ahora es un toast stack moderno (top-right fixed)
 */
export const AutoGlobalAlertsDisplay = memo(function AutoGlobalAlertsDisplay() {
  const { alerts } = useAlertsContext();
  
  // Solo renderizar si hay alertas activas (no snoozed, no archived)
  const hasActiveAlerts = alerts.some(
    alert => alert.status === 'active' && !alert.archivedAt
  );
  
  if (!hasActiveAlerts) {
    return null;
  }

  return <GlobalAlertsDisplay />;
});