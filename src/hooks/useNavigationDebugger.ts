/**
 * NAVIGATION DEBUGGER HOOK
 *
 * Hook especializado para detectar y capturar bugs de navegación en tiempo real.
 * Diseñado para trabajar con Playwright tests pero también funcional en desarrollo.
 *
 * Features:
 * - Detecta intentos repetidos de navegación
 * - Captura stack traces cuando ocurre el bug
 * - Registra estado completo del sistema
 * - Compatible con Playwright para debugging automatizado
 *
 * Usage:
 * ```tsx
 * // En desarrollo - enable manually
 * const debugInfo = useNavigationDebugger({ enabled: true });
 *
 * // En Playwright - enable via window flag
 * window.__ENABLE_NAVIGATION_DEBUGGER__ = true;
 * ```
 */

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '@/lib/logging';

// Global flag that Playwright can set to enable debugging
declare global {
  interface Window {
    __ENABLE_NAVIGATION_DEBUGGER__?: boolean;
    __NAVIGATION_DEBUG_INFO__?: NavigationDebugInfo;
    __TAKE_DEBUG_SCREENSHOT__?: () => void;
  }
}

export interface NavigationAttempt {
  timestamp: number;
  moduleId: string;
  targetPath: string;
  currentPath: string;
  succeeded: boolean;
  stackTrace: string;
}

export interface NavigationBug {
  detected: boolean;
  moduleId: string;
  attemptCount: number;
  timeWindow: number;
  firstAttempt: number;
  lastAttempt: number;
  attempts: NavigationAttempt[];
}

export interface NavigationDebugInfo {
  isEnabled: boolean;
  attempts: NavigationAttempt[];
  bugs: NavigationBug[];
  currentPath: string;
  lastNavigationTime: number;
}

interface UseNavigationDebuggerOptions {
  enabled?: boolean;
  bugThreshold?: number; // Number of attempts to consider a bug
  timeWindow?: number; // Time window in ms to detect rapid attempts
  onBugDetected?: (bug: NavigationBug) => void;
}

/**
 * Hook to debug navigation issues
 */
export function useNavigationDebugger(options: UseNavigationDebuggerOptions = {}) {
  const {
    enabled = typeof window !== 'undefined' && window.__ENABLE_NAVIGATION_DEBUGGER__,
    bugThreshold = 3,
    timeWindow = 5000,
    onBugDetected
  } = options;

  const location = useLocation();

  const [debugInfo, setDebugInfo] = useState<NavigationDebugInfo>({
    isEnabled: enabled,
    attempts: [],
    bugs: [],
    currentPath: location.pathname,
    lastNavigationTime: 0
  });

  const attemptsRef = useRef<NavigationAttempt[]>([]);
  const bugsRef = useRef<NavigationBug[]>([]);

  // Monitor console logs to capture navigation attempts
  useEffect(() => {
    if (!enabled) return;

    logger.info('NavigationDebugger', 'Navigation debugger enabled', {
      bugThreshold,
      timeWindow,
      currentPath: location.pathname
    });

    // Intercept console logs to capture NavigationContext logs
    const originalLog = console.log;
    const originalDebug = console.debug;

    const interceptLog = (level: 'log' | 'debug', ...args: unknown[]) => {
      // Call original first
      if (level === 'log') {
        originalLog(...args);
      } else {
        originalDebug(...args);
      }

      // Check if this is a navigation log
      const logText = args.join(' ');

      if (logText.includes('handleNavigateToModule called')) {
        const timestamp = Date.now();

        // Try to extract moduleId from log
        const moduleIdMatch = logText.match(/moduleId:\s*['"]([^'"]+)['"]/);
        const moduleId = moduleIdMatch?.[1] || 'unknown';

        // Capture stack trace
        const stackTrace = new Error().stack || '';

        const attempt: NavigationAttempt = {
          timestamp,
          moduleId,
          targetPath: 'unknown',
          currentPath: location.pathname,
          succeeded: false,
          stackTrace
        };

        attemptsRef.current.push(attempt);

        logger.debug('NavigationDebugger', 'Navigation attempt captured', {
          moduleId,
          attemptNumber: attemptsRef.current.length,
          currentPath: location.pathname
        });

        // Check for bug pattern
        checkForBugPattern(attempt);
      }

      // Detect successful navigation
      if (logText.includes('Navigating to module root')) {
        const moduleIdMatch = logText.match(/moduleId:\s*['"]([^'"]+)['"]/);
        const moduleId = moduleIdMatch?.[1];

        if (moduleId) {
          // Mark recent attempts to this module as succeeded
          const recentAttempts = attemptsRef.current.filter(
            a => a.moduleId === moduleId && !a.succeeded
          );

          recentAttempts.forEach(attempt => {
            attempt.succeeded = true;
          });

          logger.debug('NavigationDebugger', 'Navigation succeeded', {
            moduleId,
            markedSuccessful: recentAttempts.length
          });
        }
      }
    };

    console.log = (...args: unknown[]) => interceptLog('log', ...args);
    console.debug = (...args: unknown[]) => interceptLog('debug', ...args);

    return () => {
      console.log = originalLog;
      console.debug = originalDebug;
    };
  }, [enabled, location.pathname, bugThreshold, timeWindow]);

  // Check for bug patterns
  const checkForBugPattern = (latestAttempt: NavigationAttempt) => {
    const now = Date.now();
    const recentAttempts = attemptsRef.current.filter(
      a => a.moduleId === latestAttempt.moduleId && now - a.timestamp < timeWindow
    );

    if (recentAttempts.length >= bugThreshold) {
      const bug: NavigationBug = {
        detected: true,
        moduleId: latestAttempt.moduleId,
        attemptCount: recentAttempts.length,
        timeWindow: recentAttempts[recentAttempts.length - 1].timestamp - recentAttempts[0].timestamp,
        firstAttempt: recentAttempts[0].timestamp,
        lastAttempt: recentAttempts[recentAttempts.length - 1].timestamp,
        attempts: recentAttempts
      };

      // Check if we already reported this bug
      const alreadyReported = bugsRef.current.some(
        b => b.moduleId === bug.moduleId && b.lastAttempt === bug.lastAttempt
      );

      if (!alreadyReported) {
        bugsRef.current.push(bug);

        logger.warn('NavigationDebugger', '🐛 NAVIGATION BUG DETECTED', {
          moduleId: bug.moduleId,
          attemptCount: bug.attemptCount,
          timeWindow: bug.timeWindow,
          attempts: bug.attempts.map(a => ({
            timestamp: new Date(a.timestamp).toISOString(),
            currentPath: a.currentPath,
            succeeded: a.succeeded
          }))
        });

        // Call callback if provided
        if (onBugDetected) {
          onBugDetected(bug);
        }

        // Update state
        setDebugInfo(prev => ({
          ...prev,
          bugs: [...bugsRef.current],
          attempts: [...attemptsRef.current]
        }));

        // Expose to Playwright
        if (typeof window !== 'undefined') {
          window.__NAVIGATION_DEBUG_INFO__ = {
            isEnabled: true,
            attempts: attemptsRef.current,
            bugs: bugsRef.current,
            currentPath: location.pathname,
            lastNavigationTime: now
          };
        }
      }
    }
  };

  // Monitor location changes
  useEffect(() => {
    if (!enabled) return;

    const now = Date.now();

    logger.debug('NavigationDebugger', 'Location changed', {
      from: debugInfo.currentPath,
      to: location.pathname,
      timeSinceLastNavigation: now - debugInfo.lastNavigationTime
    });

    setDebugInfo(prev => ({
      ...prev,
      currentPath: location.pathname,
      lastNavigationTime: now
    }));
  }, [location.pathname, enabled]);

  // Expose debug info to window for Playwright access
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    window.__NAVIGATION_DEBUG_INFO__ = {
      isEnabled: true,
      attempts: attemptsRef.current,
      bugs: bugsRef.current,
      currentPath: location.pathname,
      lastNavigationTime: Date.now()
    };
  }, [enabled, location.pathname]);

  // Helper function to take a debug screenshot (callable from Playwright)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    window.__TAKE_DEBUG_SCREENSHOT__ = () => {
      logger.info('NavigationDebugger', 'Screenshot requested', {
        currentPath: location.pathname,
        bugCount: bugsRef.current.length,
        attemptCount: attemptsRef.current.length
      });

      // Return debug info for screenshot metadata
      return {
        path: location.pathname,
        bugs: bugsRef.current,
        attempts: attemptsRef.current.slice(-10) // Last 10 attempts
      };
    };

    return () => {
      delete window.__TAKE_DEBUG_SCREENSHOT__;
    };
  }, [enabled, location.pathname]);

  return {
    enabled,
    debugInfo,
    hasBugs: bugsRef.current.length > 0,
    bugCount: bugsRef.current.length,
    attemptCount: attemptsRef.current.length,
    latestBug: bugsRef.current[bugsRef.current.length - 1],
    allBugs: bugsRef.current,
    allAttempts: attemptsRef.current,

    // Helper methods
    reset: () => {
      attemptsRef.current = [];
      bugsRef.current = [];
      setDebugInfo({
        isEnabled: enabled,
        attempts: [],
        bugs: [],
        currentPath: location.pathname,
        lastNavigationTime: 0
      });
      logger.info('NavigationDebugger', 'Debug info reset');
    },

    getReport: () => ({
      totalAttempts: attemptsRef.current.length,
      totalBugs: bugsRef.current.length,
      currentPath: location.pathname,
      bugs: bugsRef.current,
      recentAttempts: attemptsRef.current.slice(-20)
    })
  };
}

/**
 * Auto-enable debugger in development or when Playwright flag is set
 */
export function useAutoNavigationDebugger() {
  const isDev = import.meta.env.DEV;
  const isPlaywright = typeof window !== 'undefined' && window.__ENABLE_NAVIGATION_DEBUGGER__;

  return useNavigationDebugger({
    enabled: isDev || isPlaywright,
    onBugDetected: (bug) => {
      // In development, show a notification or console error
      if (isDev) {
        console.error(`🐛 Navigation Bug Detected: ${bug.attemptCount} attempts to navigate to "${bug.moduleId}"`);
      }
    }
  });
}
