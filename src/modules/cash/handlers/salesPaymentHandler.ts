/**
 * Sales Payment Handler
 * Handler para integración con Sales Module
 * Registra pagos en efectivo y crea journal entries automáticos
 */

import { logger } from '@/lib/logging/Logger';
import { EventBus } from '@/lib/events/EventBus';
import type { EventHandler } from '@/lib/events/types';
import {
  getActiveCashSession,
  recordCashSale,
} from '../services/cashSessionService';
import { createJournalEntry } from '../services/journalService';
import { getMoneyLocationByCode } from '../services/moneyLocationsService';
import { getAccountByCode } from '../services/chartOfAccountsService';

/**
 * Payload del evento sales.payment.completed
 */
interface PaymentCompletedEvent {
  paymentId: string;
  orderId?: string;
  saleId?: string;
  amount: number;
  paymentMethod: string; // 'CASH', 'CARD', 'TRANSFER', 'QR'
  customerId?: string;
  timestamp: string;
  reference?: string;
}

/**
 * Handler para sales.payment.completed
 * Se ejecuta cuando se completa un pago en el módulo de ventas
 *
 * FLUJO:
 * 1. Verificar si el pago es en efectivo
 * 2. Obtener sesión de caja activa
 * 3. Registrar venta en cash_sales
 * 4. Crear journal entry (Débito: Cash, Crédito: Revenue + IVA)
 * 5. Crear entrada en sale_payments para auditoría
 */
export const handleSalesPaymentCompleted: EventHandler<PaymentCompletedEvent> =
  async (event) => {
    const { payload } = event;

    logger.info('CashModule', '💰 Received sales.payment.completed event', {
      paymentId: payload.paymentId,
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
    });

    // Solo procesar pagos en efectivo
    if (payload.paymentMethod !== 'CASH') {
      logger.debug('CashModule', 'Skipping non-cash payment', {
        paymentMethod: payload.paymentMethod,
      });
      return;
    }

    try {
      // Obtener money location principal (DRAWER-001)
      const cashDrawer = await getMoneyLocationByCode('DRAWER-001');

      if (!cashDrawer) {
        logger.error(
          'CashModule',
          'Cash drawer not found, cannot process payment',
          {
            code: 'DRAWER-001',
          }
        );
        return;
      }

      // Obtener sesión activa
      const activeSession = await getActiveCashSession(cashDrawer.id);

      if (!activeSession) {
        logger.warn('CashModule', 'No active cash session for payment', {
          moneyLocationId: cashDrawer.id,
          paymentId: payload.paymentId,
        });
        // No lanzar error, simplemente no registrar en sesión
        // El journal entry aún se creará para contabilidad
      } else {
        // Registrar venta en sesión activa
        await recordCashSale(cashDrawer.id, payload.amount);

        logger.info('CashModule', 'Cash sale recorded in active session', {
          sessionId: activeSession.id,
          amount: payload.amount,
        });
      }

      // Obtener cuenta de cash drawer para journal entry
      const cashAccount = await getAccountByCode('1.1.01.001');
      const revenueAccount = await getAccountByCode('4.1');
      const taxAccount = await getAccountByCode('2.1.02');

      if (!cashAccount || !revenueAccount || !taxAccount) {
        logger.error('CashModule', 'Required accounts not found', {
          cashAccount: !!cashAccount,
          revenueAccount: !!revenueAccount,
          taxAccount: !!taxAccount,
        });
        return;
      }

      // Calcular IVA 21% (Argentina)
      const IVA_RATE = 0.21;
      const total = payload.amount;
      const subtotal = total / (1 + IVA_RATE);
      const taxAmount = total - subtotal;

      // Crear journal entry para la venta
      const userId = event.userId || 'system';
      await createJournalEntry(
        {
          entry_type: 'SALE',
          transaction_date: payload.timestamp,
          reference_id: payload.saleId || payload.paymentId,
          reference_type: 'SALE',
          external_reference: payload.reference,
          description: `Venta en efectivo ${payload.saleId ? `#${payload.saleId}` : ''}`,
          cash_session_id: activeSession?.id,
          lines: [
            {
              // Débito: Cash aumenta (activo)
              account_code: cashAccount.code,
              money_location_id: cashDrawer.id,
              amount: -total,
              description: 'Efectivo recibido',
            },
            {
              // Crédito: Revenue (ingreso)
              account_code: revenueAccount.code,
              amount: subtotal,
              description: 'Ingreso por venta',
            },
            {
              // Crédito: Tax Payable (pasivo)
              account_code: taxAccount.code,
              amount: taxAmount,
              description: 'IVA 21%',
            },
          ],
        },
        userId
      );

      logger.info('CashModule', 'Journal entry created for cash sale', {
        paymentId: payload.paymentId,
        total,
        subtotal,
        taxAmount,
      });

      // Emitir evento de confirmación
      await EventBus.emit(
        'cash.sale.recorded',
        {
          paymentId: payload.paymentId,
          saleId: payload.saleId,
          amount: payload.amount,
          sessionId: activeSession?.id,
          timestamp: new Date().toISOString(),
        },
        'CashModule'
      );
    } catch (error) {
      logger.error('CashModule', 'Failed to process sales payment', {
        error,
        paymentId: payload.paymentId,
      });

      // Emitir evento de error
      await EventBus.emit(
        'cash.sale.failed',
        {
          paymentId: payload.paymentId,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
        'CashModule'
      );
    }
  };

/**
 * Handler para sales.order_cancelled
 * Se ejecuta cuando se cancela una orden/venta
 *
 * FLUJO:
 * 1. Verificar si el pago original fue en efectivo
 * 2. Reversar cash_sales en sesión activa
 * 3. Crear journal entry reverso (invertir débitos/créditos)
 */
export const handleSalesOrderCancelled: EventHandler = async (event) => {
  const { payload } = event;

  logger.info('CashModule', '♻️ Received sales.order_cancelled event', {
    orderId: payload.orderId,
    saleId: payload.saleId,
  });

  try {
    // TODO: Implementar lógica de reversa
    // Necesitaría:
    // 1. Buscar el journal entry original por saleId
    // 2. Crear journal entry reverso con signos invertidos
    // 3. Actualizar cash_session (restar de cash_sales, sumar a cash_refunds)

    logger.warn('CashModule', 'Order cancellation handler not fully implemented', {
      orderId: payload.orderId,
    });
  } catch (error) {
    logger.error('CashModule', 'Failed to process order cancellation', {
      error,
      orderId: payload.orderId,
    });
  }
};

/**
 * Registra los handlers de sales en el EventBus
 */
export function registerSalesHandlers(): () => void {
  logger.info('CashModule', 'Registering sales event handlers');

  const unsubscribers = [
    EventBus.on('sales.payment.completed', handleSalesPaymentCompleted),
    EventBus.on('sales.order_cancelled', handleSalesOrderCancelled),
  ];

  return () => {
    unsubscribers.forEach((unsub) => unsub());
    logger.info('CashModule', 'Sales event handlers unregistered');
  };
}
