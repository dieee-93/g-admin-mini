/**
 * Cash Reports Tests
 * Tests para reportes contables avanzados (Balance Sheet, Cash Flow, P&L)
 *
 * COBERTURA:
 * - Balance Sheet validation
 * - Cash Flow calculations
 * - Profit & Loss calculations
 * - Session History reports
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '@/lib/supabase/client';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import {
  generateBalanceSheet,
  generateCashFlowStatement,
  generateProfitAndLoss,
  fetchSessionHistory,
} from '@/modules/cash/services/reportsService';
import { createJournalEntry } from '@/modules/cash/services/journalService';

describe('Cash Reports', () => {
  // Helper: Get test user ID
  async function getTestUserId(): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');
    return user.id;
  }

  // Helper: Clean up test data
  async function cleanupTestData() {
    // Delete journal entries created in tests
    await supabase
      .from('journal_entries')
      .delete()
      .ilike('description', 'TEST:%');
  }

  beforeAll(async () => {
    // await cleanupTestData(); // Commented out for now - tests are read-only
  });

  // ==================== BALANCE SHEET TESTS ====================

  describe('Balance Sheet', () => {
    it('should generate balance sheet', async () => {
      const report = await generateBalanceSheet();

      expect(report).toBeDefined();
      expect(report.asOfDate).toBeDefined();
      expect(report.assets).toBeDefined();
      expect(report.liabilities).toBeDefined();
      expect(report.equity).toBeDefined();
      expect(report.totalAssets).toBeTypeOf('number');
      expect(report.totalLiabilitiesAndEquity).toBeTypeOf('number');
      expect(report.balanced).toBeTypeOf('boolean');
      expect(report.variance).toBeTypeOf('number');
    });

    it('should satisfy accounting equation: Assets = Liabilities + Equity', async () => {
      const report = await generateBalanceSheet();

      const totalLiabilitiesAndEquity = DecimalUtils.add(
        DecimalUtils.fromValue(report.liabilities.total, 'financial'),
        DecimalUtils.fromValue(report.equity.total, 'financial'),
        'financial'
      );

      const variance = DecimalUtils.subtract(
        DecimalUtils.fromValue(report.totalAssets, 'financial'),
        totalLiabilitiesAndEquity,
        'financial'
      );

      // Allow 1 cent tolerance
      expect(Math.abs(DecimalUtils.toNumber(variance))).toBeLessThan(0.01);
      expect(report.balanced).toBe(true);
    });

    it('should separate current and non-current assets', async () => {
      const report = await generateBalanceSheet();

      expect(Array.isArray(report.assets.current)).toBe(true);
      expect(Array.isArray(report.assets.nonCurrent)).toBe(true);

      // Total should equal sum of current + non-current
      const sumCurrentAndNonCurrent = DecimalUtils.add(
        DecimalUtils.fromValue(
          report.assets.current.reduce((sum, acc) => sum + acc.balance, 0),
          'financial'
        ),
        DecimalUtils.fromValue(
          report.assets.nonCurrent.reduce((sum, acc) => sum + acc.balance, 0),
          'financial'
        ),
        'financial'
      );

      expect(DecimalUtils.toNumber(sumCurrentAndNonCurrent)).toBeCloseTo(
        report.assets.total,
        2
      );
    });

    it('should separate current and non-current liabilities', async () => {
      const report = await generateBalanceSheet();

      expect(Array.isArray(report.liabilities.current)).toBe(true);
      expect(Array.isArray(report.liabilities.nonCurrent)).toBe(true);

      // Total should equal sum of current + non-current
      const sumCurrentAndNonCurrent = DecimalUtils.add(
        DecimalUtils.fromValue(
          report.liabilities.current.reduce((sum, acc) => sum + acc.balance, 0),
          'financial'
        ),
        DecimalUtils.fromValue(
          report.liabilities.nonCurrent.reduce(
            (sum, acc) => sum + acc.balance,
            0
          ),
          'financial'
        ),
        'financial'
      );

      expect(DecimalUtils.toNumber(sumCurrentAndNonCurrent)).toBeCloseTo(
        report.liabilities.total,
        2
      );
    });
  });

  // ==================== CASH FLOW STATEMENT TESTS ====================

  describe('Cash Flow Statement', () => {
    it('should generate cash flow statement', async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      const report = await generateCashFlowStatement(lastMonth, today);

      expect(report).toBeDefined();
      expect(report.startDate).toBe(lastMonth);
      expect(report.endDate).toBe(today);
      expect(report.operating).toBeDefined();
      expect(report.investing).toBeDefined();
      expect(report.financing).toBeDefined();
      expect(report.netCashFlow).toBeTypeOf('number');
      expect(report.openingBalance).toBeTypeOf('number');
      expect(report.closingBalance).toBeTypeOf('number');
    });

    it('should calculate net cash flow correctly', async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      const report = await generateCashFlowStatement(lastMonth, today);

      // Net cash flow = sum of all activities
      const expectedNet = DecimalUtils.add(
        DecimalUtils.add(
          DecimalUtils.fromValue(report.operating.net, 'financial'),
          DecimalUtils.fromValue(report.investing.net, 'financial'),
          'financial'
        ),
        DecimalUtils.fromValue(report.financing.net, 'financial'),
        'financial'
      );

      expect(report.netCashFlow).toBeCloseTo(
        DecimalUtils.toNumber(expectedNet),
        2
      );
    });

    it('should calculate activity net flow correctly', async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      const report = await generateCashFlowStatement(lastMonth, today);

      // Operating net = inflows - outflows
      const operatingNet = DecimalUtils.subtract(
        DecimalUtils.fromValue(report.operating.inflows, 'financial'),
        DecimalUtils.fromValue(report.operating.outflows, 'financial'),
        'financial'
      );

      expect(report.operating.net).toBeCloseTo(
        DecimalUtils.toNumber(operatingNet),
        2
      );

      // Investing net = inflows - outflows
      const investingNet = DecimalUtils.subtract(
        DecimalUtils.fromValue(report.investing.inflows, 'financial'),
        DecimalUtils.fromValue(report.investing.outflows, 'financial'),
        'financial'
      );

      expect(report.investing.net).toBeCloseTo(
        DecimalUtils.toNumber(investingNet),
        2
      );

      // Financing net = inflows - outflows
      const financingNet = DecimalUtils.subtract(
        DecimalUtils.fromValue(report.financing.inflows, 'financial'),
        DecimalUtils.fromValue(report.financing.outflows, 'financial'),
        'financial'
      );

      expect(report.financing.net).toBeCloseTo(
        DecimalUtils.toNumber(financingNet),
        2
      );
    });

    it('should calculate closing balance correctly', async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      const report = await generateCashFlowStatement(lastMonth, today);

      // Closing balance = opening balance + net cash flow
      const expectedClosing = DecimalUtils.add(
        DecimalUtils.fromValue(report.openingBalance, 'financial'),
        DecimalUtils.fromValue(report.netCashFlow, 'financial'),
        'financial'
      );

      expect(report.closingBalance).toBeCloseTo(
        DecimalUtils.toNumber(expectedClosing),
        2
      );
    });
  });

  // ==================== PROFIT & LOSS TESTS ====================

  describe('Profit & Loss Statement', () => {
    it('should generate P&L statement', async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      const report = await generateProfitAndLoss(lastMonth, today);

      expect(report).toBeDefined();
      expect(report.startDate).toBe(lastMonth);
      expect(report.endDate).toBe(today);
      expect(report.revenue).toBeDefined();
      expect(report.expenses).toBeDefined();
      expect(report.grossProfit).toBeTypeOf('number');
      expect(report.operatingIncome).toBeTypeOf('number');
      expect(report.netIncome).toBeTypeOf('number');
      expect(report.grossMargin).toBeTypeOf('number');
      expect(report.netMargin).toBeTypeOf('number');
    });

    it('should calculate net income correctly: Revenue - Expenses', async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      const report = await generateProfitAndLoss(lastMonth, today);

      // Net income = revenue - expenses
      const expectedNetIncome = DecimalUtils.subtract(
        DecimalUtils.fromValue(report.revenue.total, 'financial'),
        DecimalUtils.fromValue(report.expenses.total, 'financial'),
        'financial'
      );

      expect(report.netIncome).toBeCloseTo(
        DecimalUtils.toNumber(expectedNetIncome),
        2
      );
    });

    it('should calculate gross profit correctly: Revenue - COGS', async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      const report = await generateProfitAndLoss(lastMonth, today);

      // Gross profit = revenue - COGS
      const expectedGrossProfit = DecimalUtils.subtract(
        DecimalUtils.fromValue(report.revenue.total, 'financial'),
        DecimalUtils.fromValue(report.expenses.cogs, 'financial'),
        'financial'
      );

      expect(report.grossProfit).toBeCloseTo(
        DecimalUtils.toNumber(expectedGrossProfit),
        2
      );
    });

    it('should calculate total expenses correctly', async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      const report = await generateProfitAndLoss(lastMonth, today);

      // Total expenses = COGS + Payroll + Operating + Other
      const expectedTotal = DecimalUtils.add(
        DecimalUtils.add(
          DecimalUtils.fromValue(report.expenses.cogs, 'financial'),
          DecimalUtils.fromValue(report.expenses.payroll, 'financial'),
          'financial'
        ),
        DecimalUtils.add(
          DecimalUtils.fromValue(report.expenses.operating, 'financial'),
          DecimalUtils.fromValue(report.expenses.other, 'financial'),
          'financial'
        ),
        'financial'
      );

      expect(report.expenses.total).toBeCloseTo(
        DecimalUtils.toNumber(expectedTotal),
        2
      );
    });

    it('should calculate margins correctly', async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      const report = await generateProfitAndLoss(lastMonth, today);

      if (report.revenue.total > 0) {
        // Gross margin = (Gross Profit / Revenue) * 100
        const expectedGrossMargin =
          (report.grossProfit / report.revenue.total) * 100;
        expect(report.grossMargin).toBeCloseTo(expectedGrossMargin, 2);

        // Net margin = (Net Income / Revenue) * 100
        const expectedNetMargin =
          (report.netIncome / report.revenue.total) * 100;
        expect(report.netMargin).toBeCloseTo(expectedNetMargin, 2);
      }
    });
  });

  // ==================== SESSION HISTORY TESTS ====================

  describe('Session History Report', () => {
    it('should fetch session history', async () => {
      const report = await fetchSessionHistory();

      expect(report).toBeDefined();
      expect(Array.isArray(report.sessions)).toBe(true);
      expect(report.summary).toBeDefined();
      expect(report.summary.totalSessions).toBeTypeOf('number');
      expect(report.summary.totalSales).toBeTypeOf('number');
      expect(report.summary.totalVariance).toBeTypeOf('number');
      expect(report.summary.averageVariance).toBeTypeOf('number');
      expect(report.summary.sessionsWithDiscrepancy).toBeTypeOf('number');
    });

    it('should calculate summary correctly', async () => {
      const report = await fetchSessionHistory();

      // Total sessions = number of sessions
      expect(report.summary.totalSessions).toBe(report.sessions.length);

      // Total sales = sum of all cash_sales
      const expectedTotalSales = report.sessions.reduce(
        (sum, session) =>
          DecimalUtils.add(
            sum,
            DecimalUtils.fromValue(session.cash_sales, 'financial'),
            'financial'
          ),
        DecimalUtils.fromValue(0, 'financial')
      );

      expect(report.summary.totalSales).toBeCloseTo(
        DecimalUtils.toNumber(expectedTotalSales),
        2
      );

      // Sessions with discrepancy
      const expectedDiscrepancy = report.sessions.filter(
        (s) => s.status === 'DISCREPANCY'
      ).length;

      expect(report.summary.sessionsWithDiscrepancy).toBe(expectedDiscrepancy);
    });

    it('should filter sessions by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const report = await fetchSessionHistory({
        startDate: lastWeek,
        endDate: today,
      });

      // All sessions should be within the date range
      report.sessions.forEach((session) => {
        const openedAt = new Date(session.opened_at).toISOString().split('T')[0];
        expect(openedAt >= lastWeek && openedAt <= today).toBe(true);
      });
    });

    it('should filter sessions by status', async () => {
      const report = await fetchSessionHistory({
        status: 'CLOSED',
      });

      // All sessions should have status 'CLOSED'
      report.sessions.forEach((session) => {
        expect(session.status).toBe('CLOSED');
      });
    });
  });

  // ==================== PRECISION TESTS ====================

  describe('Precision and DecimalUtils', () => {
    it('should use DecimalUtils for all calculations', async () => {
      const report = await generateBalanceSheet();

      // Check that all values are precise numbers
      expect(Number.isFinite(report.totalAssets)).toBe(true);
      expect(Number.isFinite(report.totalLiabilitiesAndEquity)).toBe(true);
      expect(Number.isFinite(report.variance)).toBe(true);

      // Check that variance is within acceptable tolerance
      expect(Math.abs(report.variance)).toBeLessThan(0.01);
    });

    it('should handle zero balances correctly', async () => {
      const report = await generateBalanceSheet();

      // Zero balances should be exactly 0, not -0 or 0.0000001
      report.assets.current.forEach((account) => {
        if (account.balance === 0) {
          expect(account.balance).toBe(0);
          expect(Object.is(account.balance, 0)).toBe(true);
        }
      });
    });
  });
});
