/**
 * Materials Handler
 * Handler para integración con Materials/Procurement Module
 * Registra cuentas por pagar y pagos a proveedores
 */

import { logger } from '@/lib/logging/Logger';
import { EventBus } from '@/lib/events/EventBus';
import type { EventHandler } from '@/lib/events/types';
import { createJournalEntry } from '../services/journalService';
import { getAccountByCode } from '../services/chartOfAccountsService';

/**
 * Payload del evento materials.purchase.approved
 */
interface PurchaseApprovedEvent {
  supplierOrderId: string;
  supplierId: string;
  total: number;
  subtotal: number;
  taxAmount: number;
  items: Array<{
    materialId: string;
    quantity: number;
    unitCost: number;
  }>;
  paymentTerms?: string; // 'IMMEDIATE', 'NET_30', 'NET_60'
  dueDate?: string;
  timestamp: string;
}

/**
 * Handler para materials.purchase.approved
 * Se ejecuta cuando se aprueba una orden de compra
 *
 * FLUJO:
 * 1. Crear journal entry para registrar cuenta por pagar
 * 2. Débito: COGS (Costo de Ventas)
 * 3. Crédito: Accounts Payable (Pasivo)
 */
export const handleMaterialsPurchaseApproved: EventHandler<
  PurchaseApprovedEvent
> = async (event) => {
  const { payload } = event;

  logger.info('CashModule', '🛒 Received materials.purchase.approved event', {
    supplierOrderId: payload.supplierOrderId,
    total: payload.total,
  });

  try {
    // Obtener cuentas necesarias
    const cogsAccount = await getAccountByCode('5.1'); // Cost of Goods Sold
    const payablesAccount = await getAccountByCode('2.1.01'); // Accounts Payable

    if (!cogsAccount || !payablesAccount) {
      logger.error('CashModule', 'Required accounts not found for purchase', {
        cogsAccount: !!cogsAccount,
        payablesAccount: !!payablesAccount,
      });
      return;
    }

    // Crear journal entry para registrar la compra
    const userId = event.userId || 'system';
    await createJournalEntry(
      {
        entry_type: 'PURCHASE',
        transaction_date: payload.timestamp,
        reference_id: payload.supplierOrderId,
        reference_type: 'SUPPLIER_ORDER',
        description: `Compra a proveedor - Orden ${payload.supplierOrderId}`,
        notes: payload.paymentTerms
          ? `Términos de pago: ${payload.paymentTerms}`
          : undefined,
        lines: [
          {
            // Débito: COGS aumenta (gasto)
            account_code: cogsAccount.code,
            amount: -payload.total,
            description: `Costo de materiales (${payload.items.length} items)`,
          },
          {
            // Crédito: Accounts Payable aumenta (pasivo/deuda)
            account_code: payablesAccount.code,
            amount: payload.total,
            description: `Deuda con proveedor - Vence: ${payload.dueDate || 'A definir'}`,
          },
        ],
      },
      userId
    );

    logger.info('CashModule', 'Journal entry created for purchase', {
      supplierOrderId: payload.supplierOrderId,
      total: payload.total,
    });

    // Emitir evento de confirmación
    await EventBus.emit(
      'cash.purchase.recorded',
      {
        supplierOrderId: payload.supplierOrderId,
        supplierId: payload.supplierId,
        amount: payload.total,
        timestamp: new Date().toISOString(),
      },
      'CashModule'
    );
  } catch (error) {
    logger.error('CashModule', 'Failed to process purchase approval', {
      error,
      supplierOrderId: payload.supplierOrderId,
    });
  }
};

/**
 * Payload del evento materials.supplier.paid
 */
interface SupplierPaidEvent {
  paymentId: string;
  supplierId: string;
  supplierOrderId?: string;
  amount: number;
  paymentMethod: string; // 'BANK_TRANSFER', 'CHECK', 'CASH'
  bankAccountId?: string;
  reference?: string;
  timestamp: string;
}

/**
 * Handler para materials.supplier.paid
 * Se ejecuta cuando se paga a un proveedor
 *
 * FLUJO:
 * 1. Débito: Accounts Payable (disminuye deuda)
 * 2. Crédito: Bank/Cash (disminuye activo)
 */
export const handleSupplierPaid: EventHandler<SupplierPaidEvent> = async (
  event
) => {
  const { payload } = event;

  logger.info('CashModule', '💵 Received materials.supplier.paid event', {
    paymentId: payload.paymentId,
    amount: payload.amount,
    paymentMethod: payload.paymentMethod,
  });

  try {
    // Obtener cuenta de Accounts Payable
    const payablesAccount = await getAccountByCode('2.1.01');

    if (!payablesAccount) {
      logger.error(
        'CashModule',
        'Accounts Payable account not found for payment'
      );
      return;
    }

    // Determinar cuenta de origen según método de pago
    let paymentAccountCode: string;
    let moneyLocationId: string | undefined;

    switch (payload.paymentMethod) {
      case 'BANK_TRANSFER':
        paymentAccountCode = '1.1.01.003'; // Banco
        break;
      case 'CHECK':
        paymentAccountCode = '1.1.01.003'; // Banco
        break;
      case 'CASH':
        paymentAccountCode = '1.1.01.002'; // Safe (efectivo grande sale de safe)
        break;
      default:
        paymentAccountCode = '1.1.01.003'; // Default: Banco
    }

    const paymentAccount = await getAccountByCode(paymentAccountCode);

    if (!paymentAccount) {
      logger.error('CashModule', 'Payment account not found', {
        accountCode: paymentAccountCode,
      });
      return;
    }

    // Crear journal entry para el pago
    const userId = event.userId || 'system';
    await createJournalEntry(
      {
        entry_type: 'PAYMENT',
        transaction_date: payload.timestamp,
        reference_id: payload.paymentId,
        reference_type: 'SUPPLIER_PAYMENT',
        external_reference: payload.reference,
        description: `Pago a proveedor - ${payload.paymentMethod}`,
        notes: payload.supplierOrderId
          ? `Orden: ${payload.supplierOrderId}`
          : undefined,
        lines: [
          {
            // Débito: Accounts Payable disminuye (deuda se paga)
            account_code: payablesAccount.code,
            amount: -payload.amount,
            description: 'Pago de cuenta por pagar',
          },
          {
            // Crédito: Bank/Cash disminuye (activo sale)
            account_code: paymentAccount.code,
            money_location_id: moneyLocationId,
            amount: payload.amount,
            description: `Pago realizado via ${payload.paymentMethod}`,
          },
        ],
      },
      userId
    );

    logger.info('CashModule', 'Journal entry created for supplier payment', {
      paymentId: payload.paymentId,
      amount: payload.amount,
    });

    // Emitir evento de confirmación
    await EventBus.emit(
      'cash.supplier_payment.recorded',
      {
        paymentId: payload.paymentId,
        supplierId: payload.supplierId,
        amount: payload.amount,
        timestamp: new Date().toISOString(),
      },
      'CashModule'
    );
  } catch (error) {
    logger.error('CashModule', 'Failed to process supplier payment', {
      error,
      paymentId: payload.paymentId,
    });
  }
};

/**
 * Registra los handlers de materials en el EventBus
 */
export function registerMaterialsHandlers(): () => void {
  logger.info('CashModule', 'Registering materials event handlers');

  const unsubscribers = [
    EventBus.on('materials.purchase.approved', handleMaterialsPurchaseApproved),
    EventBus.on('materials.supplier.paid', handleSupplierPaid),
  ];

  return () => {
    unsubscribers.forEach((unsub) => unsub());
    logger.info('CashModule', 'Materials event handlers unregistered');
  };
}
