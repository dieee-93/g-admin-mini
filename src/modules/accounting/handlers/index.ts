/**
 * Cash Module Event Handlers
 * Integración con otros módulos via EventBus
 */

import { logger } from '@/lib/logging/Logger';
import { registerSalesHandlers } from './salesPaymentHandler';
import { registerMaterialsHandlers } from './materialsHandler';
import { registerPayrollHandlers } from './payrollHandler';

// Export individual handlers for testing
export * from './salesPaymentHandler';
export * from './materialsHandler';
export * from './payrollHandler';

/**
 * Registra todos los event handlers del módulo Cash
 * Debe ser llamado durante el bootstrap de la aplicación
 *
 * @returns Función para desregistrar todos los handlers
 */
export function registerCashHandlers(): () => void {
  logger.info('CashModule', '📡 Registering all Cash Module event handlers');

  const unsubscribers: Array<() => void> = [];

  try {
    // Registrar handlers de Sales
    unsubscribers.push(registerSalesHandlers());
    logger.debug('CashModule', '✅ Sales handlers registered');

    // Registrar handlers de Materials
    unsubscribers.push(registerMaterialsHandlers());
    logger.debug('CashModule', '✅ Materials handlers registered');

    // Registrar handlers de Payroll
    unsubscribers.push(registerPayrollHandlers());
    logger.debug('CashModule', '✅ Payroll handlers registered');

    logger.info('CashModule', '✅ All event handlers registered successfully', {
      totalHandlers: unsubscribers.length,
    });
  } catch (error) {
    logger.error('CashModule', '❌ Failed to register event handlers', { error });
  }

  // Retornar función para cleanup
  return () => {
    logger.info('CashModule', '🧹 Unregistering all Cash Module event handlers');
    unsubscribers.forEach((unsub) => unsub());
  };
}

/**
 * Lista de eventos que escucha el módulo Cash
 */
export const CASH_EVENT_SUBSCRIPTIONS = [
  // Sales events
  'sales.payment.completed',
  'sales.order_cancelled',

  // Materials events
  'materials.purchase.approved',
  'materials.supplier.paid',

  // Staff events
  'staff.payroll.processed',
  'staff.payroll.cancelled',
  'staff.advance_payment',
] as const;

/**
 * Lista de eventos que emite el módulo Cash
 */
export const CASH_EVENT_EMISSIONS = [
  // Session events
  'cash.session.opened',
  'cash.session.closed',
  'cash.session.discrepancy',

  // Transaction events
  'cash.sale.recorded',
  'cash.sale.failed',
  'cash.purchase.recorded',
  'cash.supplier_payment.recorded',
  'cash.payroll.recorded',

  // Journal events
  'cash.journal_entry.created',

  // Money movement events
  'cash.drop.recorded',
  'cash.deposit.recorded',
] as const;
