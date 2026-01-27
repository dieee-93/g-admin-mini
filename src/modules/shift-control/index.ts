/**
 * Shift Control Module
 *
 * Public API exports for shift-control module
 *
 * @module shift-control
 * @version 2.1.0 - Phase 2 Complete (UI Components)
 */

// Main manifest
export { default as shiftControlManifest } from './manifest';

// Store
export { useShiftStore } from './store/shiftStore';

// Services
export * from './services/shiftService';

// Handlers
export * from './handlers';

// Hooks
export * from './hooks';

// Components
export * from './components';

// Types
export type * from './types';
