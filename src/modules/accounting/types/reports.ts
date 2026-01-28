/**
 * Reports Types
 * Tipos para reportes contables avanzados (Balance Sheet, Cash Flow, P&L)
 */

export interface AccountBalance {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  sub_type?: string | null;
  balance: number;
}

// ==================== BALANCE SHEET (Estado de Situación Patrimonial) ====================

export interface BalanceSheetAssets {
  current: AccountBalance[];
  nonCurrent: AccountBalance[];
  total: number;
}

export interface BalanceSheetLiabilities {
  current: AccountBalance[];
  nonCurrent: AccountBalance[];
  total: number;
}

export interface BalanceSheetEquity {
  accounts: AccountBalance[];
  total: number;
}

export interface BalanceSheet {
  asOfDate: string;
  assets: BalanceSheetAssets;
  liabilities: BalanceSheetLiabilities;
  equity: BalanceSheetEquity;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
  balanced: boolean; // true si Assets = Liabilities + Equity
  variance: number; // Diferencia (debe ser 0)
}

// ==================== CASH FLOW STATEMENT (Estado de Flujo de Efectivo) ====================

export interface CashFlowActivity {
  inflows: number;
  outflows: number;
  net: number;
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
    entry_number?: string;
  }>;
}

export interface CashFlowStatement {
  startDate: string;
  endDate: string;
  operating: CashFlowActivity;
  investing: CashFlowActivity;
  financing: CashFlowActivity;
  netCashFlow: number;
  openingBalance: number;
  closingBalance: number;
}

// ==================== P&L STATEMENT (Estado de Resultados) ====================

export interface ProfitAndLossRevenue {
  accounts: AccountBalance[];
  total: number;
}

export interface ProfitAndLossExpenses {
  cogs: number; // Costo de Ventas (5.1.x)
  payroll: number; // Gastos de Personal (5.2.x)
  operating: number; // Gastos Operativos (5.3-5.8)
  other: number; // Otros Gastos (5.9.x)
  total: number;
  breakdown: AccountBalance[]; // Detalle por cuenta
}

export interface ProfitAndLoss {
  startDate: string;
  endDate: string;
  revenue: ProfitAndLossRevenue;
  expenses: ProfitAndLossExpenses;
  grossProfit: number; // Revenue - COGS
  operatingIncome: number; // Gross Profit - Operating Expenses
  netIncome: number; // Revenue - Total Expenses
  grossMargin: number; // (Gross Profit / Revenue) * 100
  netMargin: number; // (Net Income / Revenue) * 100
}

// ==================== SESSION HISTORY REPORT ====================

export interface SessionHistoryFilters {
  moneyLocationId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'OPEN' | 'CLOSED' | 'AUDITED' | 'DISCREPANCY';
  openedBy?: string;
}

export interface SessionHistoryRow {
  id: string;
  money_location_id: string;
  money_location_name: string;
  opened_by: string;
  opened_by_name: string;
  closed_by?: string | null;
  closed_by_name?: string | null;
  opened_at: string;
  closed_at?: string | null;
  starting_cash: number;
  expected_cash?: number | null;
  actual_cash?: number | null;
  variance?: number | null;
  cash_sales: number;
  cash_refunds: number;
  cash_in: number;
  cash_out: number;
  cash_drops: number;
  status: 'OPEN' | 'CLOSED' | 'AUDITED' | 'DISCREPANCY';
}

export interface SessionHistoryReport {
  sessions: SessionHistoryRow[];
  summary: {
    totalSessions: number;
    totalSales: number;
    totalVariance: number;
    averageVariance: number;
    sessionsWithDiscrepancy: number;
  };
}

// ==================== REPORT FILTERS (Common) ====================

export interface ReportDateFilters {
  startDate?: string;
  endDate?: string;
  asOfDate?: string;
}

export type ReportPeriod = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'custom';

export interface ReportGenerationOptions {
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
  asOfDate?: string;
  includeInactive?: boolean;
  groupBy?: 'account' | 'type' | 'subtype';
}
