/**
 * Payroll Handler
 * Handler para integración con Staff/Payroll Module
 * Registra pagos de nómina y liquidaciones
 */

import { logger } from '@/lib/logging/Logger';
import eventBus from '@/lib/events/EventBus';
import type { EventHandler } from '@/lib/events/types';
import { createJournalEntry } from '../services/journalService';
import { getAccountByCode } from '../services/chartOfAccountsService';
import { getMoneyLocationByCode } from '../services/moneyLocationsService';

/**
 * Payload del evento staff.payroll.processed
 */
interface PayrollProcessedEvent {
  payrollPeriodId: string;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  employees: Array<{
    employeeId: string;
    grossAmount: number;
    netAmount: number;
    deductions: number;
  }>;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  paymentMethod?: string; // 'BANK_TRANSFER', 'CASH', 'CHECK'
  bankAccountId?: string;
  timestamp: string;
}

/**
 * Handler para staff.payroll.processed
 * Se ejecuta cuando se procesa/liquida una nómina
 *
 * FLUJO:
 * 1. Débito: Payroll Expense (gasto de personal)
 * 2. Crédito: Bank/Cash (pago realizado)
 *
 * NOTA: Este es un enfoque simplificado. En un sistema completo se registrarían
 * también las retenciones (AFIP, obra social, jubilación, etc.) como cuentas por pagar.
 */
export const handlePayrollProcessed: EventHandler<PayrollProcessedEvent> =
  async (event) => {
    const { payload } = event;

    logger.info('CashModule', '👨‍💼 Received staff.payroll.processed event', {
      payrollPeriodId: payload.payrollPeriodId,
      totalNet: payload.totalNet,
      employeeCount: payload.employees.length,
    });

    try {
      // Obtener cuenta de gastos de personal
      const payrollExpenseAccount = await getAccountByCode('5.2'); // Payroll Expense

      if (!payrollExpenseAccount) {
        logger.error(
          'CashModule',
          'Payroll Expense account not found (5.2)'
        );
        return;
      }

      // Determinar cuenta de pago según método
      const paymentMethod = payload.paymentMethod || 'BANK_TRANSFER';
      let paymentAccountCode: string;
      let moneyLocationId: string | undefined;

      switch (paymentMethod) {
        case 'BANK_TRANSFER':
          paymentAccountCode = '1.1.01.003'; // Banco
          // Obtener money location del banco si existe
          const bankLocation = await getMoneyLocationByCode('BANK-001');
          if (bankLocation) {
            moneyLocationId = bankLocation.id;
          }
          break;
        case 'CASH':
          paymentAccountCode = '1.1.01.001'; // Cash Drawer
          const cashLocation = await getMoneyLocationByCode('DRAWER-001');
          if (cashLocation) {
            moneyLocationId = cashLocation.id;
          }
          break;
        case 'CHECK':
          paymentAccountCode = '1.1.01.003'; // Banco (cheque sale del banco)
          break;
        default:
          paymentAccountCode = '1.1.01.003'; // Default: Banco
      }

      const paymentAccount = await getAccountByCode(paymentAccountCode);

      if (!paymentAccount) {
        logger.error('CashModule', 'Payment account not found for payroll', {
          accountCode: paymentAccountCode,
        });
        return;
      }

      // Crear journal entry para el pago de nómina
      const userId = event.userId || 'system';
      await createJournalEntry(
        {
          entry_type: 'PAYROLL',
          transaction_date: payload.paymentDate,
          reference_id: payload.payrollPeriodId,
          reference_type: 'PAYROLL_PERIOD',
          description: `Liquidación de sueldos ${payload.periodStart} - ${payload.periodEnd}`,
          notes: `${payload.employees.length} empleados. Bruto: $${payload.totalGross.toFixed(2)}, Neto: $${payload.totalNet.toFixed(2)}, Deducciones: $${payload.totalDeductions.toFixed(2)}`,
          lines: [
            {
              // Débito: Payroll Expense aumenta (gasto)
              account_code: payrollExpenseAccount.code,
              amount: -payload.totalNet,
              description: `Gasto de personal (${payload.employees.length} empleados)`,
            },
            {
              // Crédito: Bank/Cash disminuye (activo sale)
              account_code: paymentAccount.code,
              money_location_id: moneyLocationId,
              amount: payload.totalNet,
              description: `Pago de nómina via ${paymentMethod}`,
            },
          ],
        },
        userId
      );

      logger.info('CashModule', 'Journal entry created for payroll', {
        payrollPeriodId: payload.payrollPeriodId,
        totalNet: payload.totalNet,
        employeeCount: payload.employees.length,
      });

      // Emitir evento de confirmación
      await eventBus.emit(
        'cash.payroll.recorded',
        {
          payrollPeriodId: payload.payrollPeriodId,
          amount: payload.totalNet,
          employeeCount: payload.employees.length,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      logger.error('CashModule', 'Failed to process payroll', {
        error,
        payrollPeriodId: payload.payrollPeriodId,
      });
    }
  };

/**
 * Handler para staff.payroll.cancelled
 * Se ejecuta si se cancela/revierte una nómina
 */
export const handlePayrollCancelled: EventHandler = async (event) => {
  const { payload } = event;

  logger.info('CashModule', '♻️ Received staff.payroll.cancelled event', {
    payrollPeriodId: payload.payrollPeriodId,
  });

  try {
    // TODO: Implementar lógica de reversa
    // Similar a sales.order_cancelled:
    // 1. Buscar el journal entry original
    // 2. Crear journal entry reverso con signos invertidos

    logger.warn(
      'CashModule',
      'Payroll cancellation handler not fully implemented',
      {
        payrollPeriodId: payload.payrollPeriodId,
      }
    );
  } catch (error) {
    logger.error('CashModule', 'Failed to process payroll cancellation', {
      error,
      payrollPeriodId: payload.payrollPeriodId,
    });
  }
};

/**
 * Handler para staff.advance_payment
 * Se ejecuta cuando se da un adelanto de sueldo
 *
 * FLUJO:
 * 1. Débito: Advances to Employees (cuenta por cobrar)
 * 2. Crédito: Cash/Bank (activo sale)
 */
export const handleAdvancePayment: EventHandler = async (event) => {
  const { payload } = event;

  logger.info('CashModule', '💰 Received staff.advance_payment event', {
    employeeId: payload.employeeId,
    amount: payload.amount,
  });

  try {
    // Obtener cuentas necesarias
    const advancesAccount = await getAccountByCode('1.1.02'); // Cuentas por Cobrar (al empleado)

    if (!advancesAccount) {
      logger.error('CashModule', 'Advances account not found (1.1.02)');
      return;
    }

    // Determinar cuenta de pago
    const paymentMethod = payload.paymentMethod || 'CASH';
    const paymentAccountCode =
      paymentMethod === 'CASH' ? '1.1.01.001' : '1.1.01.003';
    const paymentAccount = await getAccountByCode(paymentAccountCode);

    if (!paymentAccount) {
      logger.error('CashModule', 'Payment account not found for advance');
      return;
    }

    // Crear journal entry para el adelanto
    const userId = event.userId || 'system';
    await createJournalEntry(
      {
        entry_type: 'PAYMENT',
        transaction_date: payload.timestamp,
        reference_id: payload.advanceId || payload.employeeId,
        reference_type: 'EMPLOYEE_ADVANCE',
        description: `Adelanto de sueldo - Empleado ${payload.employeeId}`,
        lines: [
          {
            // Débito: Advances (activo/cuenta por cobrar aumenta)
            account_code: advancesAccount.code,
            amount: -payload.amount,
            description: 'Adelanto otorgado al empleado',
          },
          {
            // Crédito: Cash/Bank disminuye
            account_code: paymentAccount.code,
            amount: payload.amount,
            description: `Pago de adelanto via ${paymentMethod}`,
          },
        ],
      },
      userId
    );

    logger.info('CashModule', 'Journal entry created for employee advance', {
      employeeId: payload.employeeId,
      amount: payload.amount,
    });
  } catch (error) {
    logger.error('CashModule', 'Failed to process advance payment', {
      error,
      employeeId: payload.employeeId,
    });
  }
};

/**
 * Registra los handlers de payroll en el EventBus
 */
export function registerPayrollHandlers(): () => void {
  logger.info('CashModule', 'Registering payroll event handlers');

  const unsubscribers = [
    eventBus.on('staff.payroll.processed', handlePayrollProcessed),
    eventBus.on('staff.payroll.cancelled', handlePayrollCancelled),
    eventBus.on('staff.advance_payment', handleAdvancePayment),
  ];

  return () => {
    unsubscribers.forEach((unsub) => unsub());
    logger.info('CashModule', 'Payroll event handlers unregistered');
  };
}
