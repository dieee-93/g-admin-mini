import { useEffect, useRef, useState } from 'react';
import { Stack, Text, Box } from '@/shared/ui';
import { useNavigationState, useNavigationLayout, useNavigationActions } from '@/contexts/NavigationContext';
import { useCapabilities } from '@/lib/capabilities';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';

interface DebugOverlayProps {
  metrics: any;
  actions: any;
  pageState: any;
}

export function DebugOverlay({ metrics, actions, pageState }: DebugOverlayProps) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const [renderInfo, setRenderInfo] = useState<string[]>([]);

  // Track ONLY stable contexts (NOT the ones that update constantly)
  // ✅ Use specialized hooks to minimize re-renders
  const navState = useNavigationState();
  const navLayout = useNavigationLayout();
  const navActions = useNavigationActions();
  const capContext = useCapabilities();
  const authContext = useAuth();
  const locationContext = useLocation();
  // 🚫 REMOVED: These hooks cause infinite loops because they update constantly
  // const errorHandler = useErrorHandler();
  // const offlineStatus = useOfflineStatus(); // Updates every 2s
  // const perfMonitor = usePerformanceMonitor(); // Updates 60x per second!

  const prevMetrics = useRef(metrics);
  const prevActions = useRef(actions);
  const prevPageState = useRef(pageState);
  const prevNavState = useRef(navState);
  const prevNavLayout = useRef(navLayout);
  const prevNavActions = useRef(navActions);
  const prevCapContext = useRef(capContext);
  const prevAuthContext = useRef(authContext);
  const prevLocationContext = useRef(locationContext);
  // const prevErrorHandler = useRef(errorHandler);
  // const prevOfflineStatus = useRef(offlineStatus);
  // const prevPerfMonitor = useRef(perfMonitor);

  // THIS RUNS ON EVERY RENDER (no deps = runs before paint)
  renderCount.current += 1;
  const now = Date.now();
  const timeSinceLastRender = now - lastRenderTime.current;
  lastRenderTime.current = now;

  const changes: string[] = [];

  // Check what changed
  if (prevMetrics.current !== metrics) {
    changes.push(`metrics ref changed`);
  }
  if (prevActions.current !== actions) {
    changes.push(`actions ref changed`);
  }
  if (prevPageState.current !== pageState) {
    changes.push(`pageState ref changed`);
  }
  if (prevNavState.current !== navState) {
    changes.push(`🔥 NavigationState ref changed`);
  }
  if (prevNavLayout.current !== navLayout) {
    changes.push(`🔥 NavigationLayout ref changed`);
  }
  if (prevNavActions.current !== navActions) {
    changes.push(`🔥 NavigationActions ref changed (should NEVER happen)`);
  }
  if (prevCapContext.current !== capContext) {
    changes.push(`🔥 CapabilitiesContext ref changed`);
  }
  if (prevAuthContext.current !== authContext) {
    changes.push(`🔥 AuthContext ref changed`);
  }
  if (prevLocationContext.current !== locationContext) {
    changes.push(`🔥 LocationContext ref changed`);
  }
  // REMOVED: These checks cause the overlay itself to trigger infinite loops
  // if (prevErrorHandler.current !== errorHandler) {
  //   changes.push(`🔥 ErrorHandler ref changed`);
  // }
  // if (prevOfflineStatus.current !== offlineStatus) {
  //   changes.push(`🔥 OfflineStatus ref changed`);
  // }
  // if (prevPerfMonitor.current !== perfMonitor) {
  //   changes.push(`🔥 PerformanceMonitor ref changed`);
  // }

  // Deep check CapabilitiesContext changes
  if (prevCapContext.current !== capContext) {
    // Deep check EVERY property - show which ones changed
    if (capContext) {
      const keys = Object.keys(capContext);
      console.log('🔍 CapContext keys:', keys.length, keys.slice(0, 10));

      let changedCount = 0;
      keys.forEach(key => {
        const oldVal = (prevCapContext.current as any)?.[key];
        const newVal = (capContext as any)[key];

        if (oldVal !== newVal) {
          changedCount++;
          // Check if it's an array
          if (Array.isArray(newVal)) {
            if (Array.isArray(oldVal) && JSON.stringify(oldVal) === JSON.stringify(newVal)) {
              const msg = `  └─ ${key}: array ref ≠ [${newVal.length}] SAME`;
              changes.push(msg);
              console.log('🔍', msg);
            } else {
              const msg = `  └─ ${key}: array ≠ [${oldVal?.length || 0}→${newVal.length}]`;
              changes.push(msg);
              console.log('🔍', msg);
            }
          }
          // Check if it's an object
          else if (typeof newVal === 'object' && newVal !== null) {
            const msg = `  └─ ${key}: object ref ≠`;
            changes.push(msg);
            console.log('🔍', msg);
          }
          // Check if it's a function
          else if (typeof newVal === 'function') {
            const msg = `  └─ ${key}: fn ref ≠`;
            changes.push(msg);
            console.log('🔍', msg);
          }
          // Primitive value
          else {
            const msg = `  └─ ${key}: ${oldVal}→${newVal}`;
            changes.push(msg);
            console.log('🔍', msg);
          }
        }
      });
      console.log('🔍 Total changed props:', changedCount);
    } else {
      console.log('🔍 capContext is null/undefined!');
    }
  }

  // Update refs
  prevMetrics.current = metrics;
  prevActions.current = actions;
  prevPageState.current = pageState;
  prevNavState.current = navState;
  prevNavLayout.current = navLayout;
  prevNavActions.current = navActions;
  prevCapContext.current = capContext;
  prevAuthContext.current = authContext;
  prevLocationContext.current = locationContext;
  // prevErrorHandler.current = errorHandler;
  // prevOfflineStatus.current = offlineStatus;
  // prevPerfMonitor.current = perfMonitor;

  // Only update state every 10 renders to avoid causing more renders
  if (renderCount.current % 10 === 0) {
    const info = `#${renderCount.current} - ${timeSinceLastRender}ms - ${changes.join(', ') || 'No changes detected'}`;
    setRenderInfo(prev => [info, ...prev.slice(0, 9)]);
  }

  return (
    <Box
      position="fixed"
      top="4"
      right="4"
      bg="red.900"
      color="white"
      p="4"
      borderRadius="md"
      maxW="700px"
      maxH="500px"
      overflowY="auto"
      zIndex={9999}
      fontSize="xs"
      fontFamily="mono"
    >
      <Stack gap="2">
        <Text fontWeight="bold" fontSize="sm">
          🐛 DEBUG OVERLAY v3 (Tracking 5 stable contexts)
        </Text>
        <Text fontSize="xs" opacity={0.8}>
          Props: metrics, actions, pageState<br />
          Contexts: Navigation, Capabilities, Auth, Location<br />
          <Text as="span" color="yellow.300">⚠️ Not tracking: ErrorHandler, OfflineStatus, PerfMonitor (they update constantly)</Text>
        </Text>
        <Text fontWeight="bold" color="red.200">
          Total Renders: {renderCount.current}
        </Text>
        <Text>
          Current changes: {changes.join(', ') || 'None'}
        </Text>
        <Text fontWeight="bold" mt="2">Recent Renders (every 10th):</Text>
        {renderInfo.map((info, i) => (
          <Text key={i} opacity={1 - (i * 0.1)}>
            {info}
          </Text>
        ))}
      </Stack>
    </Box>
  );
}
