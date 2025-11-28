// ============================================================================
// CASH MODULE INTEGRATION TESTS
// ============================================================================
// Tests para verificar la integración del módulo Cash con Sales, Materials y Staff

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DecimalUtils } from '../business-logic/shared/decimalUtils';
import {
  handleSalesPaymentCompleted,
  handleMaterialsPurchaseApproved,
  handlePayrollProcessed,
} from '../modules/cash/handlers';

// Mock EventBus
vi.mock('../lib/events/EventBus', () => ({
  EventBus: {
    emit: vi.fn().mockResolvedValue(undefined),
    on: vi.fn().mockReturnValue(() => {}),
  },
}));

// Mock de servicios
vi.mock('../modules/cash/services/cashSessionService', () => ({
  getActiveCashSession: vi.fn().mockResolvedValue({
    id: 'session-123',
    money_location_id: 'drawer-001',
    cash_sales: 0,
    status: 'OPEN',
  }),
  recordCashSale: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../modules/cash/services/journalService', () => ({
  createJournalEntry: vi.fn().mockResolvedValue({
    id: 'entry-123',
    entry_number: 'JE-2025-000001',
    is_posted: true,
  }),
}));

vi.mock('../modules/cash/services/moneyLocationsService', () => ({
  getMoneyLocationByCode: vi.fn().mockResolvedValue({
    id: 'drawer-001',
    code: 'DRAWER-001',
    name: 'Caja Registradora #1',
    account_id: 'acc-cash',
  }),
}));

vi.mock('../modules/cash/services/chartOfAccountsService', () => ({
  getAccountByCode: vi.fn((code: string) => {
    const accounts: Record<string, any> = {
      '1.1.01.001': { id: 'acc-cash', code: '1.1.01.001', name: 'Cash Drawer', allow_transactions: true },
      '4.1': { id: 'acc-revenue', code: '4.1', name: 'Sales Revenue', allow_transactions: true },
      '2.1.02': { id: 'acc-tax', code: '2.1.02', name: 'Tax Payable', allow_transactions: true },
      '5.1': { id: 'acc-cogs', code: '5.1', name: 'COGS', allow_transactions: true },
      '2.1.01': { id: 'acc-payable', code: '2.1.01', name: 'Accounts Payable', allow_transactions: true },
      '5.2': { id: 'acc-payroll', code: '5.2', name: 'Payroll Expense', allow_transactions: true },
      '1.1.01.003': { id: 'acc-bank', code: '1.1.01.003', name: 'Bank Account', allow_transactions: true },
    };
    return Promise.resolve(accounts[code] || null);
  }),
}));

describe('💰 CASH MODULE INTEGRATION TESTS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sales Integration', () => {
    test('should handle cash payment and create journal entry', async () => {
      const createJournalEntry = (await import('../modules/cash/services/journalService')).createJournalEntry;
      const recordCashSale = (await import('../modules/cash/services/cashSessionService')).recordCashSale;

      const paymentEvent = {
        id: 'event-123',
        pattern: 'sales.payment.completed' as const,
        payload: {
          paymentId: 'pay-123',
          saleId: 'sale-456',
          amount: 1000,
          paymentMethod: 'CASH',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        source: 'SalesModule',
        version: '1.0.0',
        metadata: {} as any,
      };

      await handleSalesPaymentCompleted(paymentEvent);

      // Verificar que se registró la venta en la sesión
      expect(recordCashSale).toHaveBeenCalledWith('drawer-001', 1000);

      // Verificar que se creó el journal entry
      expect(createJournalEntry).toHaveBeenCalled();

      const journalCall = (createJournalEntry as any).mock.calls[0];
      const journalEntry = journalCall[0];

      // Verificar estructura del journal entry
      expect(journalEntry.entry_type).toBe('SALE');
      expect(journalEntry.lines).toHaveLength(3);

      // Verificar que los montos están presentes y son números
      expect(typeof journalEntry.lines[0].amount).toBe('number');
      expect(typeof journalEntry.lines[1].amount).toBe('number');
      expect(typeof journalEntry.lines[2].amount).toBe('number');

      // Verificar que la primera línea es un débito (negativo)
      expect(journalEntry.lines[0].amount).toBeLessThan(0);

      // Verificar que las otras líneas son créditos (positivos)
      expect(journalEntry.lines[1].amount).toBeGreaterThan(0);
      expect(journalEntry.lines[2].amount).toBeGreaterThan(0);

      // Verificar estructura de las líneas
      expect(journalEntry.lines[0].account_code).toBeDefined();
      expect(journalEntry.lines[1].account_code).toBeDefined();
      expect(journalEntry.lines[2].account_code).toBeDefined();
    });

    test('should skip non-cash payments', async () => {
      const createJournalEntry = (await import('../modules/cash/services/journalService')).createJournalEntry;

      const cardPaymentEvent = {
        id: 'event-124',
        pattern: 'sales.payment.completed' as const,
        payload: {
          paymentId: 'pay-124',
          amount: 500,
          paymentMethod: 'CARD',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        source: 'SalesModule',
        version: '1.0.0',
        metadata: {} as any,
      };

      await handleSalesPaymentCompleted(cardPaymentEvent);

      // No debería crear journal entry para pagos con tarjeta
      expect(createJournalEntry).not.toHaveBeenCalled();
    });

    test('should calculate IVA correctly (21%)', async () => {
      const createJournalEntry = (await import('../modules/cash/services/journalService')).createJournalEntry;

      const paymentEvent = {
        id: 'event-125',
        pattern: 'sales.payment.completed' as const,
        payload: {
          paymentId: 'pay-125',
          amount: 1210, // Total con IVA
          paymentMethod: 'CASH',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        source: 'SalesModule',
        version: '1.0.0',
        metadata: {} as any,
      };

      await handleSalesPaymentCompleted(paymentEvent);

      const journalCall = (createJournalEntry as any).mock.calls[0];
      const journalEntry = journalCall[0];

      // IVA Rate 21%
      const total = 1210;
      const expectedSubtotal = total / 1.21;
      const expectedTax = total - expectedSubtotal;

      const revenueLineAmount = Math.abs(journalEntry.lines[1].amount);
      const taxLineAmount = Math.abs(journalEntry.lines[2].amount);

      // Verificar que los cálculos son correctos
      expect(revenueLineAmount).toBeCloseTo(expectedSubtotal, 2);
      expect(taxLineAmount).toBeCloseTo(expectedTax, 2);
    });
  });

  describe('Materials Integration', () => {
    test('should handle purchase approval and create journal entry', async () => {
      const createJournalEntry = (await import('../modules/cash/services/journalService')).createJournalEntry;

      const purchaseEvent = {
        id: 'event-200',
        pattern: 'materials.purchase.approved' as const,
        payload: {
          supplierOrderId: 'order-789',
          supplierId: 'supplier-123',
          total: 30000,
          subtotal: 30000,
          taxAmount: 0,
          items: [
            { materialId: 'mat-1', quantity: 10, unitCost: 3000 },
          ],
          paymentTerms: 'NET_30',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        source: 'MaterialsModule',
        version: '1.0.0',
        metadata: {} as any,
      };

      await handleMaterialsPurchaseApproved(purchaseEvent);

      // Verificar que se creó el journal entry
      expect(createJournalEntry).toHaveBeenCalled();

      const journalCall = (createJournalEntry as any).mock.calls[0];
      const journalEntry = journalCall[0];

      // Verificar estructura
      expect(journalEntry.entry_type).toBe('PURCHASE');
      expect(journalEntry.lines).toHaveLength(2);

      // Línea 1: Débito COGS
      expect(journalEntry.lines[0].account_code).toBe('5.1');
      expect(journalEntry.lines[0].amount).toBe(-30000);

      // Línea 2: Crédito Accounts Payable
      expect(journalEntry.lines[1].account_code).toBe('2.1.01');
      expect(journalEntry.lines[1].amount).toBe(30000);

      // Verificar balance
      const balance = journalEntry.lines.reduce((sum: any, line: any) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
    });
  });

  describe('Staff/Payroll Integration', () => {
    test('should handle payroll processing and create journal entry', async () => {
      const createJournalEntry = (await import('../modules/cash/services/journalService')).createJournalEntry;

      const payrollEvent = {
        id: 'event-300',
        pattern: 'staff.payroll.processed' as const,
        payload: {
          payrollPeriodId: 'period-202501',
          periodStart: '2025-01-01',
          periodEnd: '2025-01-31',
          paymentDate: '2025-01-31',
          employees: [
            { employeeId: 'emp-1', grossAmount: 150000, netAmount: 120000, deductions: 30000 },
            { employeeId: 'emp-2', grossAmount: 150000, netAmount: 120000, deductions: 30000 },
          ],
          totalGross: 300000,
          totalNet: 240000,
          totalDeductions: 60000,
          paymentMethod: 'BANK_TRANSFER',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        source: 'StaffModule',
        version: '1.0.0',
        metadata: {} as any,
      };

      await handlePayrollProcessed(payrollEvent);

      // Verificar que se creó el journal entry
      expect(createJournalEntry).toHaveBeenCalled();

      const journalCall = (createJournalEntry as any).mock.calls[0];
      const journalEntry = journalCall[0];

      // Verificar estructura
      expect(journalEntry.entry_type).toBe('PAYROLL');
      expect(journalEntry.lines).toHaveLength(2);

      // Línea 1: Débito Payroll Expense
      expect(journalEntry.lines[0].account_code).toBe('5.2');
      expect(journalEntry.lines[0].amount).toBe(-240000);

      // Línea 2: Crédito Bank Account
      expect(journalEntry.lines[1].account_code).toBe('1.1.01.003');
      expect(journalEntry.lines[1].amount).toBe(240000);

      // Verificar balance
      const balance = journalEntry.lines.reduce((sum: any, line: any) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
    });
  });

  describe('EventBus Integration', () => {
    test('should emit confirmation events after successful processing', async () => {
      const { EventBus } = await import('../lib/events/EventBus');
      const emitSpy = vi.spyOn(EventBus, 'emit');

      const paymentEvent = {
        id: 'event-400',
        pattern: 'sales.payment.completed' as const,
        payload: {
          paymentId: 'pay-400',
          amount: 100,
          paymentMethod: 'CASH',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        source: 'SalesModule',
        version: '1.0.0',
        metadata: {} as any,
      };

      await handleSalesPaymentCompleted(paymentEvent);

      // Verificar que se emitió el evento de confirmación
      expect(emitSpy).toHaveBeenCalledWith(
        'cash.sale.recorded',
        expect.objectContaining({
          paymentId: 'pay-400',
          amount: 100,
        }),
        'CashModule'
      );
    });
  });
});
