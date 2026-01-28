/**
 * Cash Module Initialization
 * Initializes event handlers for Cash Management Module
 */

import { logger } from '@/lib/logging/Logger';
import { registerCashHandlers } from './handlers';

let unsubscribeHandlers: (() => void) | null = null;

/**
 * Initializes the Cash Management Module
 * Registers all event handlers for cross-module communication
 *
 * Should be called once during app bootstrap
 */
export function initializeCashModule(): void {
  if (unsubscribeHandlers) {
    logger.warn('CashModule', 'Cash module already initialized, skipping');
    return;
  }

  logger.info('CashModule', '🏦 Initializing Cash Management Module');

  try {
    // Register event handlers
    unsubscribeHandlers = registerCashHandlers();

    logger.info('CashModule', '✅ Cash Management Module initialized successfully');
  } catch (error) {
    logger.error('CashModule', '❌ Failed to initialize Cash Management Module', {
      error,
    });
  }
}

/**
 * Cleanup function for Cash Module
 * Unregisters all event handlers
 *
 * Should be called during app shutdown or module deactivation
 */
export function cleanupCashModule(): void {
  if (!unsubscribeHandlers) {
    logger.warn('CashModule', 'Cash module not initialized, nothing to cleanup');
    return;
  }

  logger.info('CashModule', '🧹 Cleaning up Cash Management Module');

  try {
    // Unregister event handlers
    unsubscribeHandlers();
    unsubscribeHandlers = null;

    logger.info('CashModule', '✅ Cash Management Module cleaned up successfully');
  } catch (error) {
    logger.error('CashModule', '❌ Failed to cleanup Cash Management Module', {
      error,
    });
  }
}
