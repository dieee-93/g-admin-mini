// src/shared/hooks/useInterval.ts
// 🎯 DECLARATIVE setInterval HOOK - Dan Abramov Pattern
// Source: https://overreacted.io/making-setinterval-declarative-with-react-hooks/

import { useEffect, useRef } from 'react';

/**
 * Custom hook for declarative intervals with React Hooks
 * 
 * This hook solves the "impedance mismatch" between React's declarative
 * programming model and the imperative setInterval API.
 * 
 * Benefits over raw setInterval:
 * - ✅ Automatically syncs with latest callback (no stale closures)
 * - ✅ Dynamic delay support (change interval on the fly)
 * - ✅ Pause/resume by passing null as delay
 * - ✅ Automatic cleanup on unmount
 * - ✅ No dependency cycle issues
 * 
 * @param callback - Function to execute at each interval tick
 * @param delay - Interval delay in milliseconds, or null to pause
 * 
 * @example
 * ```tsx
 * // Basic counter
 * useInterval(() => {
 *   setCount(count + 1);
 * }, 1000);
 * 
 * // Dynamic delay
 * useInterval(() => {
 *   setCount(count + 1);
 * }, isRunning ? delay : null);
 * 
 * // Progress tracking (our use case)
 * useInterval(() => {
 *   setProgress(prev => calculateProgress(prev));
 * }, 100);
 * ```
 * 
 * @see https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  // This effect runs after every render, ensuring savedCallback.current
  // always points to the latest version of the callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  // This effect only re-runs when delay changes, NOT when callback changes
  // This prevents the interval from being cleared and re-created unnecessarily
  useEffect(() => {
    // Don't schedule if no delay is specified (allows pausing)
    if (delay === null) {
      return;
    }

    // Call the saved callback on each tick
    const tick = () => {
      savedCallback.current();
    };

    // Start the interval
    const id = setInterval(tick, delay);

    // Cleanup: clear interval on unmount or when delay changes
    return () => {
      clearInterval(id);
    };
  }, [delay]); // Only re-run if delay changes
}
