/**
 * Sales Payment Handler - UPDATED FOR OPTION B ARCHITECTURE
 * Handler para integración con Sales Module
 * Registra pagos usando sale_payments como Single Source of Truth
 *
 * ARQUITECTURA (Option B):
 * - sale_payments = SINGLE SOURCE OF TRUTH
 * - Triggers automáticos actualizan cash_sessions y operational_shifts
 * - State machine validado automáticamente
 * - Idempotencia garantizada
 */

import { logger } from '@/lib/logging/Logger';
import { moduleEventBus } from '@/shared/events/ModuleEventBus';
import type { EventHandler } from '@/shared/events/types';
import {
  getActiveCashSession,
} from '../services/cashSessionService';
import { createJournalEntry } from '../services/journalService';
import { getMoneyLocationByCode } from '../services/moneyLocationsService';
import { getAccountByCode } from '../services/chartOfAccountsService';
import { calculateTaxes, TAX_RATES } from '../services/taxCalculationService';
import { supabase } from '@/lib/supabase/client';
import type { CashSessionRow } from '../types';
import type { Database } from '@/lib/supabase/database.types';

// Types from database
type SalePaymentInsert = Database['public']['Tables']['sale_payments']['Insert'];
type PaymentStatus = Database['public']['Enums']['payment_status'];
type PaymentTransactionType = Database['public']['Enums']['payment_transaction_type'];

/**
 * Type for journal lines with account join from Supabase
 */
interface JournalLineWithAccount {
  id: string;
  journal_entry_id: string;
  account_id: string;
  account_code?: string;
  money_location_id?: string | null;
  amount: number;
  description?: string | null;
  account?: {
    code: string;
    name: string;
  };
}

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
  employeeId?: string;
  timestamp: string;
  reference?: string;
  idempotencyKey?: string; // ← NUEVO: Client puede proporcionar key
  metadata?: Record<string, unknown>;
}

/**
 * Generate idempotency key for payment
 */
function generateIdempotencyKey(
  saleId: string | undefined,
  paymentMethod: string,
  amount: number
): string {
  // Si hay saleId, usar como base; sino usar paymentId
  const base = saleId || crypto.randomUUID();
  return `${base}-${paymentMethod}-${amount}`;
}

/**
 * Handler para sales.payment.completed
 * Se ejecuta cuando se completa un pago en el módulo de ventas
 *
 * FLUJO ACTUALIZADO (Option B):
 * 1. Verificar idempotencia (evitar duplicados)
 * 2. Determinar cuenta según payment method
 * 3. Crear journal entry
 * 4. Crear registro en sale_payments (SINGLE SOURCE OF TRUTH)
 * 5. Triggers automáticos actualizan cash_sessions y operational_shifts
 * 6. Emitir evento de confirmación
 */
export const handleSalesPaymentCompleted: EventHandler<PaymentCompletedEvent> =
  async (event) => {
    const { payload } = event;

    logger.info('CashModule', '💰 Processing sales payment', {
      paymentId: payload.paymentId,
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
    });

    try {
      // ============================================
      // STEP 1: Idempotency Check
      // ============================================

      const idempotencyKey = payload.idempotencyKey || generateIdempotencyKey(
        payload.saleId,
        payload.paymentMethod,
        payload.amount
      );

      // Check if payment already exists
      const { data: existingPayment } = await supabase
        .from('sale_payments')
        .select('id, status')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existingPayment) {
        logger.info('CashModule', '✓ Payment already processed (idempotency)', {
          paymentId: existingPayment.id,
          idempotencyKey,
          status: existingPayment.status,
        });
        return; // Already processed, skip
      }

      // ============================================
      // STEP 2: Determine Account and Context
      // ============================================

      let paymentAccountCode: string;
      let moneyLocationId: string | undefined;
      let activeSession: CashSessionRow | null = null;
      let cashSessionId: string | undefined;
      let shiftId: string | undefined;

      switch (payload.paymentMethod) {
        case 'CASH': {
          // CASH → Cash Drawer account
          paymentAccountCode = '1.1.01.001'; // Cash Drawer
          const cashDrawer = await getMoneyLocationByCode('DRAWER-001');

          if (!cashDrawer) {
            logger.error('CashModule', 'Cash drawer not found', {
              code: 'DRAWER-001',
            });
            return;
          }

          moneyLocationId = cashDrawer.id;

          // Get active session for CASH payments
          activeSession = await getActiveCashSession(cashDrawer.id);

          if (activeSession) {
            cashSessionId = activeSession.id;
            logger.info('CashModule', 'Using active cash session', {
              sessionId: activeSession.id,
            });
          } else {
            logger.warn('CashModule', 'No active cash session for payment', {
              moneyLocationId: cashDrawer.id,
              paymentId: payload.paymentId,
            });
            // Continue - journal entry will still be created
          }
          break;
        }

        case 'CARD':
        case 'TRANSFER':
        case 'QR': {
          // NO-CASH → Bank Account (settlement account)
          paymentAccountCode = '1.1.03.001'; // Bank Account
          break;
        }

        default:
          logger.warn('CashModule', 'Unknown payment method', {
            paymentMethod: payload.paymentMethod,
          });
          return;
      }

      // Get active shift (for ALL payment methods)
      const { data: activeShift } = await supabase
        .from('operational_shifts')
        .select('id')
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (activeShift) {
        shiftId = activeShift.id;
      } else {
        logger.warn('CashModule', 'No active shift found', {
          paymentMethod: payload.paymentMethod,
        });
        // Continue without shift - triggers won't update shift totals
      }

      // ============================================
      // STEP 3: Get Accounts for Journal Entry
      // ============================================

      const paymentAccount = await getAccountByCode(paymentAccountCode);
      const revenueAccount = await getAccountByCode('4.1'); // Revenue
      const taxAccount = await getAccountByCode('2.1.02'); // IVA

      if (!paymentAccount || !revenueAccount || !taxAccount) {
        logger.error('CashModule', 'Required accounts not found', {
          paymentAccount: !!paymentAccount,
          revenueAccount: !!revenueAccount,
          taxAccount: !!taxAccount,
        });
        return;
      }

      // Calculate IVA 21% (reverse calculation from total)
      const taxBreakdown = calculateTaxes(payload.amount, { taxRate: TAX_RATES.IVA_GENERAL });
      const { total, subtotal, taxAmount } = taxBreakdown;

      // ============================================
      // STEP 4: Create Journal Entry
      // ============================================

      const userId = event.userId || 'system';
      const journalEntry = await createJournalEntry(
        {
          entry_type: 'SALE',
          transaction_date: payload.timestamp || new Date().toISOString(),
          reference_id: payload.saleId || payload.paymentId,
          reference_type: 'SALE',
          external_reference: payload.reference,
          description: `Venta ${payload.paymentMethod} ${payload.saleId ? `#${payload.saleId}` : ''}`,
          cash_session_id: cashSessionId,
          lines: [
            {
              // Débito: Payment account increases (Cash Drawer or Bank Account)
              account_code: paymentAccount.code,
              money_location_id: moneyLocationId,
              amount: -total,
              description: `${payload.paymentMethod} recibido`,
            },
            {
              // Crédito: Revenue
              account_code: revenueAccount.code,
              amount: subtotal,
              description: 'Ingreso por venta',
            },
            {
              // Crédito: Tax Payable (IVA)
              account_code: taxAccount.code,
              amount: taxAmount,
              description: 'IVA 21%',
            },
          ],
        },
        userId
      );

      logger.info('CashModule', 'Journal entry created', {
        journalEntryId: journalEntry.id,
        entryNumber: journalEntry.entry_number,
      });

      // ============================================
      // STEP 5: Create sale_payment Record (SINGLE SOURCE OF TRUTH)
      // ============================================

      const salePaymentData: SalePaymentInsert = {
        // Basic fields
        sale_id: payload.saleId as string, // Required by FK
        journal_entry_id: journalEntry.id,
        amount: payload.amount,
        payment_type: payload.paymentMethod,

        // NEW FIELDS (Option B Architecture)
        transaction_type: 'PAYMENT' as PaymentTransactionType,
        status: 'INITIATED' as PaymentStatus, // Trigger will change to SETTLED for CASH
        idempotency_key: idempotencyKey,

        // Operational context
        cash_session_id: cashSessionId,
        shift_id: shiftId,

        // Metadata
        metadata: {
          ...(payload.metadata || {}),
          original_reference: payload.reference,
          employee_id: payload.employeeId,
          customer_id: payload.customerId,
        },

        // Timestamps (initiated_at set by default trigger)
        currency: 'ARS',

        // Audit
        created_by: userId as string,
      };

      const { data: salePayment, error: insertError } = await supabase
        .from('sale_payments')
        .insert(salePaymentData)
        .select()
        .single();

      if (insertError) {
        logger.error('CashModule', 'Failed to create sale_payment', {
          error: insertError,
          paymentMethod: payload.paymentMethod,
        });
        throw insertError;
      }

      logger.info('CashModule', '✓ Sale payment created in sale_payments', {
        paymentId: salePayment.id,
        status: salePayment.status,
        paymentMethod: payload.paymentMethod,
        amount: payload.amount,
      });

      // ============================================
      // STEP 6: Triggers Handle Denormalization Automatically
      // ============================================

      // ✅ trigger_auto_settle_cash: CASH payments → status changed to SETTLED
      // ✅ trigger_sync_cash_session: cash_sessions.cash_sales updated automatically
      // ✅ trigger_sync_shift_totals: operational_shifts.*_total updated automatically

      logger.info('CashModule', 'Payment processed successfully', {
        paymentId: salePayment.id,
        paymentMethod: payload.paymentMethod,
        total,
        subtotal,
        taxAmount,
        cashSessionId,
        shiftId,
      });

      // ============================================
      // STEP 7: Emit Confirmation Event
      // ============================================

      await moduleEventBus.emit(
        'cash.payment.recorded',
        {
          paymentId: salePayment.id,
          saleId: payload.saleId,
          amount: payload.amount,
          paymentMethod: payload.paymentMethod,
          sessionId: cashSessionId,
          shiftId,
          status: salePayment.status,
          timestamp: new Date().toISOString(),
        }
      );

      // Backwards compatibility event for CASH
      if (payload.paymentMethod === 'CASH') {
        await moduleEventBus.emit(
          'cash.sale.recorded',
          {
            paymentId: salePayment.id,
            saleId: payload.saleId,
            amount: payload.amount,
            sessionId: cashSessionId,
            timestamp: new Date().toISOString(),
          }
        );
      }
    } catch (error) {
      logger.error('CashModule', 'Failed to process sales payment', {
        error,
        paymentId: payload.paymentId,
        paymentMethod: payload.paymentMethod,
      });

      // Emit error event
      await moduleEventBus.emit(
        'cash.sale.failed',
        {
          paymentId: payload.paymentId,
          paymentMethod: payload.paymentMethod,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }
      );

      throw error;
    }
  };

/**
 * Payload del evento sales.order_cancelled
 */
interface OrderCancelledEvent {
  orderId?: string;
  saleId: string;
  amount: number;
  paymentMethod?: string;
  timestamp: string;
  reason?: string;
}

/**
 * Handler para sales.order_cancelled
 * Se ejecuta cuando se cancela una orden/venta
 *
 * FLUJO ACTUALIZADO (Option B):
 * 1. Buscar payment original en sale_payments
 * 2. Crear REFUND transaction (linked via parent_payment_id)
 * 3. Crear journal entry reverso
 * 4. Triggers actualizan automáticamente cash_sessions y shifts
 * 5. Emitir evento cash.refund.recorded
 */
export const handleSalesOrderCancelled: EventHandler<OrderCancelledEvent> = async (event) => {
  const { payload } = event;

  logger.info('CashModule', '♻️ Processing sale cancellation', {
    saleId: payload.saleId,
    amount: payload.amount,
  });

  try {
    // ============================================
    // STEP 1: Find Original Payment
    // ============================================

    const { data: originalPayment, error: fetchError } = await supabase
      .from('sale_payments')
      .select('*')
      .eq('sale_id', payload.saleId)
      .eq('transaction_type', 'PAYMENT')
      .eq('status', 'SETTLED')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      logger.error('CashModule', 'Failed to fetch original payment', {
        error: fetchError,
        saleId: payload.saleId,
      });
      throw fetchError;
    }

    if (!originalPayment) {
      logger.warn('CashModule', 'Original payment not found for sale', {
        saleId: payload.saleId,
      });
      return;
    }

    // ============================================
    // STEP 2: Create Reversal Journal Entry
    // ============================================

    // Fetch original journal entry
    const { data: originalEntry } = await supabase
      .from('journal_entries')
      .select(`
        *,
        lines:journal_lines(*)
      `)
      .eq('id', originalPayment.journal_entry_id)
      .single();

    if (!originalEntry) {
      logger.error('CashModule', 'Original journal entry not found', {
        journalEntryId: originalPayment.journal_entry_id,
      });
      return;
    }

    // Create reversal lines (invert signs)
    const linesWithCodes = await Promise.all(
      (originalEntry.lines as JournalLineWithAccount[]).map(async (line) => {
        let accountCode = line.account?.code;
        if (!accountCode) {
          const { data: account } = await supabase
            .from('chart_of_accounts')
            .select('code')
            .eq('id', line.account_id)
            .single();
          accountCode = account?.code;
        }

        return {
          account_code: accountCode,
          money_location_id: line.money_location_id,
          amount: -line.amount, // ← Invert sign
          description: `REVERSA: ${line.description || 'Venta cancelada'}`,
        };
      })
    );

    const userId = event.userId || 'system';
    const reversalJournalEntry = await createJournalEntry(
      {
        entry_type: 'SALE_REVERSAL',
        transaction_date: payload.timestamp || new Date().toISOString(),
        reference_id: payload.saleId,
        reference_type: 'SALE_REVERSAL',
        external_reference: originalEntry.entry_number,
        description: `REVERSA de venta ${payload.saleId}${payload.reason ? ` - ${payload.reason}` : ''}`,
        lines: linesWithCodes,
      },
      userId
    );

    logger.info('CashModule', 'Reversal journal entry created', {
      reversalEntryId: reversalJournalEntry.id,
      originalEntry: originalEntry.entry_number,
    });

    // ============================================
    // STEP 3: Create REFUND Transaction in sale_payments
    // ============================================

    const refundData: SalePaymentInsert = {
      sale_id: originalPayment.sale_id,
      journal_entry_id: reversalJournalEntry.id,
      amount: -payload.amount, // ← Negative for refund
      payment_type: originalPayment.payment_type,

      // NEW FIELDS
      transaction_type: 'REFUND' as PaymentTransactionType,
      status: 'SETTLED' as PaymentStatus, // Refunds are immediately settled
      parent_payment_id: originalPayment.id, // ← Link to original payment
      idempotency_key: crypto.randomUUID(),

      // Same operational context
      cash_session_id: originalPayment.cash_session_id,
      shift_id: originalPayment.shift_id,

      // Metadata
      metadata: {
        reason: payload.reason || 'Sale cancelled',
        original_payment_id: originalPayment.id,
      },

      currency: 'ARS',
      created_by: userId as string,
    };

    const { data: refundPayment, error: refundError } = await supabase
      .from('sale_payments')
      .insert(refundData)
      .select()
      .single();

    if (refundError) {
      // Check if it's a refund validation error
      logger.error('CashModule', 'Failed to create refund', {
        error: refundError,
        saleId: payload.saleId,
      });
      throw refundError;
    }

    logger.info('CashModule', '✓ Refund created in sale_payments', {
      refundId: refundPayment.id,
      originalPaymentId: originalPayment.id,
      amount: refundPayment.amount,
    });

    // ============================================
    // STEP 4: Triggers Handle Updates Automatically
    // ============================================

    // ✅ trigger_sync_cash_session: cash_sessions.cash_refunds updated
    // ✅ trigger_sync_shift_totals: operational_shifts.*_total updated (refund subtracts)
    // ✅ enforce_refund_validation: Validates refund doesn't exceed original

    // ============================================
    // STEP 5: Emit Event
    // ============================================

    await moduleEventBus.emit(
      'cash.refund.recorded',
      {
        refundId: refundPayment.id,
        saleId: payload.saleId,
        originalPaymentId: originalPayment.id,
        amount: payload.amount,
        paymentMethod: originalPayment.payment_type,
        timestamp: new Date().toISOString(),
      }
    );

    logger.info('CashModule', 'Sale cancellation completed successfully', {
      saleId: payload.saleId,
      refundId: refundPayment.id,
    });
  } catch (error) {
    logger.error('CashModule', 'Failed to process sale cancellation', {
      error,
      saleId: payload.saleId,
    });
    throw error;
  }
};

/**
 * Registra los handlers de sales en el EventBus
 */
export function registerSalesHandlers(): () => void {
  logger.info('CashModule', 'Registering sales event handlers (Option B)');

  const unsubscribers = [
    moduleEventBus.on('sales.payment.completed', handleSalesPaymentCompleted),
    moduleEventBus.on('sales.order_cancelled', handleSalesOrderCancelled),
  ];

  return () => {
    unsubscribers.forEach((unsub) => unsub());
    logger.info('CashModule', 'Sales event handlers unregistered');
  };
}
