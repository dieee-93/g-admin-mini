/**
 * ErrorBoundaryWrapper - React Router integration for ErrorBoundary
 *
 * ARCHITECTURE:
 * This wrapper ensures the ErrorBoundary resets when navigating between routes.
 * Uses location.pathname as the key prop, which is the recommended pattern from:
 * - React Error Boundary library (bvaughn/react-error-boundary)
 * - React Router documentation
 * - Next.js App Router error handling
 *
 * WHY: When the key changes, React unmounts and remounts the ErrorBoundary,
 * automatically clearing error state. This is cleaner than manual reset calls.
 *
 * BEST PRACTICE: ErrorBoundary must be INSIDE <Router> to use useLocation()
 *
 * @see https://github.com/bvaughn/react-error-boundary/issues/148
 * @see https://reactrouter.com/how-to/error-boundary
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Wraps ErrorBoundary with automatic reset on route change
 *
 * Pattern: Uses location.pathname as key to force remount on navigation
 * Trade-off: Causes component tree unmount/remount, but only on route change
 * Alternative: Manual reset in fallback component (more complex, avoids remount)
 */
export function ErrorBoundaryWrapper({ children, fallback, onError }: Props) {
  const location = useLocation();

  // ✅ BEST PRACTICE: Use pathname as key to reset on navigation
  // This causes React to unmount and remount ErrorBoundary when route changes
  // clearing error state automatically
  return (
    <ErrorBoundary key={location.pathname} fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}
