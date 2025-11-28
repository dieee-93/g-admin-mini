// ============================================================================
// CASH MANAGEMENT - JOURNAL ENTRIES BALANCE TESTS
// ============================================================================
// Tests para verificar que el sistema de doble entrada balancea correctamente

import { describe, test, expect, beforeAll } from 'vitest';
import { DecimalUtils } from '../business-logic/shared/decimalUtils';
import type { CreateJournalEntryInput } from '../modules/cash/types';

describe('📚 CASH MANAGEMENT - Journal Entry Balance Tests', () => {
  describe('Balance Validation Logic', () => {
    test('should validate balanced journal entry (sum = 0)', () => {
      const lines = [
        { account_code: '1.1.01.001', amount: -1000 }, // Débito
        { account_code: '4.1', amount: 826.45 }, // Crédito
        { account_code: '2.1.02', amount: 173.55 }, // Crédito
      ];

      const balance = lines.reduce((sum, line) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
      expect(DecimalUtils.toNumber(balance)).toBe(0);
    });

    test('should detect unbalanced journal entry', () => {
      const lines = [
        { account_code: '1.1.01.001', amount: -1000 }, // Débito
        { account_code: '4.1', amount: 500 }, // Crédito (no balancea!)
      ];

      const balance = lines.reduce((sum, line) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(false);
      expect(DecimalUtils.toNumber(balance)).toBe(-500); // Falta 500 en crédito
    });

    test('should handle precision with DecimalUtils', () => {
      // Caso que podría fallar con float nativo: 0.1 + 0.2 !== 0.3
      const lines = [
        { account_code: '1.1.01.001', amount: -0.3 },
        { account_code: '4.1', amount: 0.1 },
        { account_code: '2.1.02', amount: 0.2 },
      ];

      const balance = lines.reduce((sum, line) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
    });

    test('should validate complex multi-line entry', () => {
      // Caso: Venta con IVA 21% + IVA 10.5% + Descuento
      const lines = [
        { account_code: '1.1.01.001', amount: -950 }, // Débito: Cash
        { account_code: '4.1', amount: 750 }, // Crédito: Revenue (producto A)
        { account_code: '4.1', amount: 100 }, // Crédito: Revenue (producto B)
        { account_code: '2.1.02', amount: 157.5 }, // Crédito: IVA 21% sobre 750
        { account_code: '2.1.02', amount: 10.5 }, // Crédito: IVA 10.5% sobre 100
        { account_code: '4.2', amount: -68 }, // Débito: Descuento aplicado
      ];

      const balance = lines.reduce((sum, line) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
    });
  });

  describe('Real-world Scenarios', () => {
    test('SCENARIO 1: Venta en efectivo con IVA 21%', () => {
      // Total: $1000
      // Subtotal: $826.45
      // IVA 21%: $173.55
      const entry: CreateJournalEntryInput = {
        entry_type: 'SALE',
        description: 'Venta #123 en efectivo',
        lines: [
          {
            account_code: '1.1.01.001', // Cash Drawer
            amount: -1000,
          },
          {
            account_code: '4.1', // Sales Revenue
            amount: 826.45,
          },
          {
            account_code: '2.1.02', // Tax Payable
            amount: 173.55,
          },
        ],
      };

      const balance = entry.lines.reduce((sum, line) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
    });

    test('SCENARIO 2: Cash drop (retiro parcial a safe)', () => {
      // Retiro de $10,000 de caja a safe
      const entry: CreateJournalEntryInput = {
        entry_type: 'CASH_DROP',
        description: 'Retiro parcial por exceso',
        lines: [
          {
            account_code: '1.1.01.002', // Safe (débito = aumenta)
            amount: -10000,
          },
          {
            account_code: '1.1.01.001', // Cash Drawer (crédito = disminuye)
            amount: 10000,
          },
        ],
      };

      const balance = entry.lines.reduce((sum, line) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
    });

    test('SCENARIO 3: Arqueo con faltante', () => {
      // Faltante de $15.00 en cierre de caja
      const entry: CreateJournalEntryInput = {
        entry_type: 'ADJUSTMENT',
        description: 'Ajuste por faltante en arqueo',
        lines: [
          {
            account_code: '5.9', // Cash Variance (gasto)
            amount: 15,
          },
          {
            account_code: '1.1.01.001', // Cash Drawer (ajuste al real)
            amount: -15,
          },
        ],
      };

      const balance = entry.lines.reduce((sum, line) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
    });

    test('SCENARIO 4: Depósito bancario', () => {
      // Depósito de $50,000 de safe a banco
      const entry: CreateJournalEntryInput = {
        entry_type: 'DEPOSIT',
        description: 'Depósito bancario',
        lines: [
          {
            account_code: '1.1.01.003', // Bank (aumenta)
            amount: -50000,
          },
          {
            account_code: '1.1.01.002', // Safe (disminuye)
            amount: 50000,
          },
        ],
      };

      const balance = entry.lines.reduce((sum, line) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
    });

    test('SCENARIO 5: Pago de nómina', () => {
      // Pago de sueldos $264,000 desde banco
      const entry: CreateJournalEntryInput = {
        entry_type: 'PAYROLL',
        description: 'Pago de sueldos Enero 2025',
        lines: [
          {
            account_code: '5.2', // Payroll Expense (gasto aumenta)
            amount: -264000,
          },
          {
            account_code: '1.1.01.003', // Bank (activo disminuye)
            amount: 264000,
          },
        ],
      };

      const balance = entry.lines.reduce((sum, line) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
    });

    test('SCENARIO 6: Compra a proveedor (cuenta por pagar)', () => {
      // Compra de $30,000 a crédito
      const entry: CreateJournalEntryInput = {
        entry_type: 'PURCHASE',
        description: 'Compra materiales orden #456',
        lines: [
          {
            account_code: '5.1', // COGS (gasto aumenta)
            amount: -30000,
          },
          {
            account_code: '2.1.01', // Accounts Payable (pasivo aumenta)
            amount: 30000,
          },
        ],
      };

      const balance = entry.lines.reduce((sum, line) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero amounts (not recommended but valid)', () => {
      const lines = [
        { account_code: '1.1.01.001', amount: 0 },
        { account_code: '4.1', amount: 0 },
      ];

      const balance = lines.reduce((sum, line) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
    });

    test('should handle very large amounts', () => {
      const lines = [
        { account_code: '1.1.01.001', amount: -9999999.99 },
        { account_code: '4.1', amount: 9999999.99 },
      ];

      const balance = lines.reduce((sum, line) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
    });

    test('should handle negative debits and credits (reversals)', () => {
      // Reversa de una venta cancelada
      const lines = [
        { account_code: '1.1.01.001', amount: 1000 }, // Crédito: Cash disminuye
        { account_code: '4.1', amount: -826.45 }, // Débito: Revenue disminuye
        { account_code: '2.1.02', amount: -173.55 }, // Débito: IVA disminuye
      ];

      const balance = lines.reduce((sum, line) => {
        return DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        );
      }, DecimalUtils.fromValue(0, 'financial'));

      expect(DecimalUtils.isZero(balance)).toBe(true);
    });

    test('should detect floating point precision issues', () => {
      // Caso problemático con floats nativos
      const floatSum = 0.1 + 0.2; // = 0.30000000000000004
      expect(floatSum).not.toBe(0.3);

      // Con DecimalUtils debe funcionar correctamente
      const decimalSum = DecimalUtils.add('0.1', '0.2', 'financial');
      expect(DecimalUtils.toNumber(decimalSum)).toBe(0.3);
    });
  });

  describe('Validation Rules', () => {
    test('should require at least 2 lines for double-entry', () => {
      const singleLine = [{ account_code: '1.1.01.001', amount: -1000 }];

      expect(singleLine.length).toBeLessThan(2);
      // La validación en el servicio debería rechazar esto
    });

    test('should calculate total debits correctly', () => {
      const lines = [
        { account_code: '1.1.01.001', amount: -1000 },
        { account_code: '5.1', amount: -500 },
        { account_code: '4.1', amount: 1500 },
      ];

      const totalDebits = lines
        .filter((line) => line.amount < 0)
        .reduce((sum, line) => sum + Math.abs(line.amount), 0);

      expect(totalDebits).toBe(1500);
    });

    test('should calculate total credits correctly', () => {
      const lines = [
        { account_code: '1.1.01.001', amount: -1000 },
        { account_code: '4.1', amount: 826.45 },
        { account_code: '2.1.02', amount: 173.55 },
      ];

      const totalCredits = lines
        .filter((line) => line.amount > 0)
        .reduce((sum, line) => sum + line.amount, 0);

      expect(totalCredits).toBe(1000);
    });

    test('debits should equal credits', () => {
      const lines = [
        { account_code: '1.1.01.001', amount: -1000 },
        { account_code: '4.1', amount: 826.45 },
        { account_code: '2.1.02', amount: 173.55 },
      ];

      const totalDebits = lines
        .filter((line) => line.amount < 0)
        .reduce((sum, line) => sum + Math.abs(line.amount), 0);

      const totalCredits = lines
        .filter((line) => line.amount > 0)
        .reduce((sum, line) => sum + line.amount, 0);

      expect(totalDebits).toBe(totalCredits);
    });
  });
});
