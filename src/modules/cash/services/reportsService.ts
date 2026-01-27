/**
 * Reports Service
 * Servicios para generación de reportes contables avanzados
 * - Balance Sheet (Estado de Situación Patrimonial)
 * - Cash Flow Statement (Estado de Flujo de Efectivo)
 * - Profit & Loss Statement (Estado de Resultados)
 * - Session History Report (Historial de Sesiones)
 */

import { supabase } from '@/lib/supabase/client';
import { DecimalUtils } from '@/lib/decimal';
import { logger } from '@/lib/logging/Logger';
import type {
  BalanceSheet,
  CashFlowStatement,
  ProfitAndLoss,
  SessionHistoryReport,
  SessionHistoryFilters,
  SessionHistoryRow,
  AccountBalance,
} from '../types/reports';
import { fetchChartOfAccounts } from './chartOfAccountsService';
import { getAccountBalance, fetchJournalEntries } from './journalService';

// ==================== CACHE ====================

interface CachedReport<T> {
  data: T;
  timestamp: number;
  key: string;
}

const reportCache = new Map<string, CachedReport<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCachedReport<T>(key: string): T | null {
  const cached = reportCache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    reportCache.delete(key);
    return null;
  }

  logger.debug('CashModule', 'Using cached report', { key });
  return cached.data;
}

function setCachedReport<T>(key: string, data: T): void {
  reportCache.set(key, {
    data,
    timestamp: Date.now(),
    key,
  });
  logger.debug('CashModule', 'Cached report', { key });
}

export function clearReportsCache(): void {
  reportCache.clear();
  logger.info('CashModule', 'Reports cache cleared');
}

// ==================== BALANCE SHEET ====================

/**
 * Genera el Balance Sheet (Estado de Situación Patrimonial)
 * Ecuación contable: Assets = Liabilities + Equity
 *
 * @param asOfDate - Fecha del reporte (por defecto: hoy)
 * @returns Balance Sheet con activos, pasivos y patrimonio
 */
export async function generateBalanceSheet(
  asOfDate?: string
): Promise<BalanceSheet> {
  const dateStr = asOfDate || new Date().toISOString().split('T')[0];
  const cacheKey = `balance-sheet:${dateStr}`;

  // Check cache
  const cached = getCachedReport<BalanceSheet>(cacheKey);
  if (cached) return cached;

  logger.info('CashModule', 'Generating Balance Sheet', { asOfDate: dateStr });

  // 1. Obtener todas las cuentas activas
  const allAccounts = await fetchChartOfAccounts();
  const ledgerAccounts = allAccounts.filter(
    (acc) => !acc.is_group && acc.allow_transactions
  );

  // 2. Calcular balance de cada cuenta al asOfDate
  const accountBalances: AccountBalance[] = await Promise.all(
    ledgerAccounts.map(async (account) => {
      const balance = await getAccountBalance(account.id, dateStr);
      return {
        account_id: account.id,
        account_code: account.code,
        account_name: account.name,
        account_type: account.account_type,
        sub_type: account.sub_type,
        balance,
      };
    })
  );

  // 3. Agrupar por tipo
  const assets = accountBalances.filter((acc) => acc.account_type === 'ASSET');
  const liabilities = accountBalances.filter(
    (acc) => acc.account_type === 'LIABILITY'
  );
  const equity = accountBalances.filter((acc) => acc.account_type === 'EQUITY');

  // 4. Separar corrientes y no corrientes
  const currentAssets = assets.filter((acc) =>
    acc.sub_type?.includes('CURRENT')
  );
  const nonCurrentAssets = assets.filter(
    (acc) => !acc.sub_type?.includes('CURRENT')
  );
  const currentLiabilities = liabilities.filter((acc) =>
    acc.sub_type?.includes('CURRENT')
  );
  const nonCurrentLiabilities = liabilities.filter(
    (acc) => !acc.sub_type?.includes('CURRENT')
  );

  // 5. Calcular totales usando DecimalUtils
  const totalAssets = sumBalances(assets);
  const totalLiabilities = sumBalances(liabilities);
  const totalEquity = sumBalances(equity);
  const totalLiabilitiesAndEquity = DecimalUtils.add(
    DecimalUtils.fromValue(totalLiabilities, 'financial'),
    DecimalUtils.fromValue(totalEquity, 'financial'),
    'financial'
  );

  // 6. Validar ecuación contable: Assets = Liabilities + Equity
  const variance = DecimalUtils.subtract(
    DecimalUtils.fromValue(totalAssets, 'financial'),
    totalLiabilitiesAndEquity,
    'financial'
  );
  
  // ✅ FIXED [2.5]: Keep Decimal until end, compare Decimal directly
  const varianceAbs = DecimalUtils.abs(variance);
  const toleranceDecimal = DecimalUtils.fromValue(0.01, 'financial'); // Tolerancia de 1 centavo
  const balanced = DecimalUtils.lessThan(varianceAbs, toleranceDecimal, 'financial');

  const report: BalanceSheet = {
    asOfDate: dateStr,
    assets: {
      current: currentAssets,
      nonCurrent: nonCurrentAssets,
      total: totalAssets,
    },
    liabilities: {
      current: currentLiabilities,
      nonCurrent: nonCurrentLiabilities,
      total: totalLiabilities,
    },
    equity: {
      accounts: equity,
      total: totalEquity,
    },
    totalAssets,
    totalLiabilitiesAndEquity: DecimalUtils.toNumber(totalLiabilitiesAndEquity),
    balanced,
    variance: DecimalUtils.toNumber(variance),
  };

  if (!balanced) {
    logger.warn('CashModule', 'Balance Sheet is not balanced', {
      totalAssets,
      totalLiabilitiesAndEquity: DecimalUtils.toNumber(
        totalLiabilitiesAndEquity
      ),
      variance: DecimalUtils.toNumber(variance),
    });
  } else {
    logger.info('CashModule', 'Balance Sheet generated successfully', {
      totalAssets,
      balanced,
    });
  }

  // Cache result
  setCachedReport(cacheKey, report);

  return report;
}

// ==================== CASH FLOW STATEMENT ====================

/**
 * Genera el Cash Flow Statement (Estado de Flujo de Efectivo)
 * Método directo: clasifica movimientos de efectivo por actividad
 *
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns Cash Flow Statement con flujos operativos, de inversión y financiamiento
 */
export async function generateCashFlowStatement(
  startDate: string,
  endDate: string
): Promise<CashFlowStatement> {
  const cacheKey = `cash-flow:${startDate}:${endDate}`;

  // Check cache
  const cached = getCachedReport<CashFlowStatement>(cacheKey);
  if (cached) return cached;

  logger.info('CashModule', 'Generating Cash Flow Statement', {
    startDate,
    endDate,
  });

  // 1. Obtener journal entries del período
  const entries = await fetchJournalEntries({
    startDate,
    endDate,
    isPosted: true,
  });

  // 2. Obtener todas las líneas de journal que afectan cuentas de efectivo (1.1.01.x)
  const { data: allLines, error } = await supabase
    .from('journal_lines')
    .select(
      `
      *,
      journal_entry:journal_entries!inner (
        id,
        entry_number,
        entry_type,
        transaction_date,
        description,
        is_posted
      ),
      account:chart_of_accounts!inner (
        code,
        name,
        account_type,
        sub_type
      )
    `
    )
    .in(
      'journal_entry_id',
      entries.map((e) => e.id)
    );

  // Filter only cash accounts (1.1.01.x)
  const cashLines = allLines?.filter((line: any) =>
    line.account.code.startsWith('1.1.01')
  );

  if (error) {
    logger.error('CashModule', 'Failed to fetch cash lines', { error });
    throw error;
  }

  // 3. Clasificar por tipo de actividad
  const operating: Array<{
    date: string;
    description: string;
    amount: number;
    entry_number?: string;
  }> = [];
  const investing: typeof operating = [];
  const financing: typeof operating = [];

  cashLines?.forEach((line: any) => {
    const entry = line.journal_entry;
    const amount = line.amount;

    const transaction = {
      date: entry.transaction_date,
      description: entry.description || `${entry.entry_type} - ${line.account.name}`,
      amount,
      entry_number: entry.entry_number,
    };

    // Clasificar por entry_type
    switch (entry.entry_type) {
      case 'SALE':
      case 'RECEIPT':
      case 'PAYMENT':
      case 'EXPENSE':
      case 'PAYROLL':
        operating.push(transaction);
        break;
      case 'PURCHASE':
      case 'DEPOSIT':
        investing.push(transaction);
        break;
      case 'TRANSFER':
      case 'CASH_DROP':
        financing.push(transaction);
        break;
      default:
        operating.push(transaction);
    }
  });

  // 4. Calcular totales por categoría
  const operatingInflows = sumTransactions(
    operating.filter((t) => t.amount < 0)
  ); // Débito = entrada
  const operatingOutflows = sumTransactions(
    operating.filter((t) => t.amount > 0)
  ); // Crédito = salida
  const operatingNet = DecimalUtils.subtract(
    DecimalUtils.fromValue(operatingInflows, 'financial'),
    DecimalUtils.fromValue(operatingOutflows, 'financial'),
    'financial'
  );

  const investingInflows = sumTransactions(
    investing.filter((t) => t.amount < 0)
  );
  const investingOutflows = sumTransactions(
    investing.filter((t) => t.amount > 0)
  );
  const investingNet = DecimalUtils.subtract(
    DecimalUtils.fromValue(investingInflows, 'financial'),
    DecimalUtils.fromValue(investingOutflows, 'financial'),
    'financial'
  );

  const financingInflows = sumTransactions(
    financing.filter((t) => t.amount < 0)
  );
  const financingOutflows = sumTransactions(
    financing.filter((t) => t.amount > 0)
  );
  const financingNet = DecimalUtils.subtract(
    DecimalUtils.fromValue(financingInflows, 'financial'),
    DecimalUtils.fromValue(financingOutflows, 'financial'),
    'financial'
  );

  // 5. Calcular flujo neto
  const netCashFlow = DecimalUtils.add(
    DecimalUtils.add(operatingNet, investingNet, 'financial'),
    financingNet,
    'financial'
  );

  // 6. Obtener saldos de apertura y cierre
  const { data: allCashAccounts } = await supabase
    .from('chart_of_accounts')
    .select('id, code')
    .eq('allow_transactions', true);

  // Filter cash accounts (1.1.01.x)
  const cashAccounts = allCashAccounts?.filter((acc) =>
    acc.code.startsWith('1.1.01')
  );

  const openingBalance = await Promise.all(
    (cashAccounts || []).map(async (acc) => {
      // Día antes del startDate
      const dayBefore = new Date(startDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      return getAccountBalance(acc.id, dayBefore.toISOString().split('T')[0]);
    })
  ).then((balances) =>
    balances.reduce(
      (sum, bal) =>
        DecimalUtils.add(
          sum,
          DecimalUtils.fromValue(bal, 'financial'),
          'financial'
        ),
      DecimalUtils.fromValue(0, 'financial')
    )
  );

  const closingBalance = DecimalUtils.add(
    openingBalance,
    netCashFlow,
    'financial'
  );

  const report: CashFlowStatement = {
    startDate,
    endDate,
    operating: {
      inflows: operatingInflows,
      outflows: operatingOutflows,
      net: DecimalUtils.toNumber(operatingNet),
      transactions: operating,
    },
    investing: {
      inflows: investingInflows,
      outflows: investingOutflows,
      net: DecimalUtils.toNumber(investingNet),
      transactions: investing,
    },
    financing: {
      inflows: financingInflows,
      outflows: financingOutflows,
      net: DecimalUtils.toNumber(financingNet),
      transactions: financing,
    },
    netCashFlow: DecimalUtils.toNumber(netCashFlow),
    openingBalance: DecimalUtils.toNumber(openingBalance),
    closingBalance: DecimalUtils.toNumber(closingBalance),
  };

  logger.info('CashModule', 'Cash Flow Statement generated successfully', {
    netCashFlow: DecimalUtils.toNumber(netCashFlow),
    operatingNet: DecimalUtils.toNumber(operatingNet),
  });

  // Cache result
  setCachedReport(cacheKey, report);

  return report;
}

// ==================== PROFIT & LOSS STATEMENT ====================

/**
 * Genera el P&L Statement (Estado de Resultados)
 * Ingresos - Gastos = Resultado Neto
 *
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns P&L Statement con ingresos, gastos y resultado neto
 */
export async function generateProfitAndLoss(
  startDate: string,
  endDate: string
): Promise<ProfitAndLoss> {
  const cacheKey = `profit-loss:${startDate}:${endDate}`;

  // Check cache
  const cached = getCachedReport<ProfitAndLoss>(cacheKey);
  if (cached) return cached;

  logger.info('CashModule', 'Generating Profit & Loss Statement', {
    startDate,
    endDate,
  });

  // 1. Obtener todas las cuentas
  const allAccounts = await fetchChartOfAccounts();
  const ledgerAccounts = allAccounts.filter(
    (acc) => !acc.is_group && acc.allow_transactions
  );

  // 2. Obtener journal entries del período
  const entries = await fetchJournalEntries({
    startDate,
    endDate,
    isPosted: true,
  });

  // 3. Calcular balances de cuentas de ingresos (4.x) y gastos (5.x)
  const { data: incomeExpenseLines, error } = await supabase
    .from('journal_lines')
    .select(
      `
      *,
      account:chart_of_accounts!inner (
        id,
        code,
        name,
        account_type,
        sub_type
      )
    `
    )
    .in(
      'journal_entry_id',
      entries.map((e) => e.id)
    );

  if (error) {
    logger.error('CashModule', 'Failed to fetch income/expense lines', {
      error,
    });
    throw error;
  }

  // 4. Agrupar por cuenta y calcular totales
  const accountBalances = new Map<string, AccountBalance>();

  incomeExpenseLines?.forEach((line: any) => {
    const account = line.account;
    if (!account.code.startsWith('4') && !account.code.startsWith('5')) {
      return;
    }

    const existingBalance = accountBalances.get(account.id);
    const newBalance = existingBalance
      ? DecimalUtils.add(
          DecimalUtils.fromValue(existingBalance.balance, 'financial'),
          DecimalUtils.fromValue(line.amount, 'financial'),
          'financial'
        )
      : DecimalUtils.fromValue(line.amount, 'financial');

    accountBalances.set(account.id, {
      account_id: account.id,
      account_code: account.code,
      account_name: account.name,
      account_type: account.account_type,
      sub_type: account.sub_type,
      balance: DecimalUtils.toNumber(newBalance),
    });
  });

  const balances = Array.from(accountBalances.values());

  // 5. Separar ingresos y gastos
  const revenueAccounts = balances.filter((acc) =>
    acc.account_code.startsWith('4')
  );
  const expenseAccounts = balances.filter((acc) =>
    acc.account_code.startsWith('5')
  );

  // 6. Calcular totales
  const totalRevenue = sumBalances(revenueAccounts);

  // Gastos por categoría
  const cogsAccounts = expenseAccounts.filter((acc) =>
    acc.account_code.startsWith('5.1')
  );
  const payrollAccounts = expenseAccounts.filter((acc) =>
    acc.account_code.startsWith('5.2')
  );
  const operatingAccounts = expenseAccounts.filter(
    (acc) =>
      acc.account_code.startsWith('5.3') ||
      acc.account_code.startsWith('5.4') ||
      acc.account_code.startsWith('5.5') ||
      acc.account_code.startsWith('5.6') ||
      acc.account_code.startsWith('5.7') ||
      acc.account_code.startsWith('5.8')
  );
  const otherAccounts = expenseAccounts.filter((acc) =>
    acc.account_code.startsWith('5.9')
  );

  const cogs = sumBalances(cogsAccounts);
  const payroll = sumBalances(payrollAccounts);
  const operating = sumBalances(operatingAccounts);
  const other = sumBalances(otherAccounts);
  const totalExpenses = sumBalances(expenseAccounts);

  // 7. Calcular resultados
  // Nota: Los gastos tienen saldo positivo (débito), ingresos negativo (crédito)
  const grossProfit = DecimalUtils.subtract(
    DecimalUtils.fromValue(Math.abs(totalRevenue), 'financial'),
    DecimalUtils.fromValue(Math.abs(cogs), 'financial'),
    'financial'
  );

  const operatingIncome = DecimalUtils.subtract(
    grossProfit,
    DecimalUtils.add(
      DecimalUtils.fromValue(Math.abs(payroll), 'financial'),
      DecimalUtils.fromValue(Math.abs(operating), 'financial'),
      'financial'
    ),
    'financial'
  );

  const netIncome = DecimalUtils.subtract(
    DecimalUtils.fromValue(Math.abs(totalRevenue), 'financial'),
    DecimalUtils.fromValue(Math.abs(totalExpenses), 'financial'),
    'financial'
  );

  // 8. Calcular márgenes
  const grossMargin =
    totalRevenue !== 0
      ? DecimalUtils.divide(
          DecimalUtils.multiply(grossProfit, DecimalUtils.fromValue(100, 'financial'), 'financial'),
          DecimalUtils.fromValue(Math.abs(totalRevenue), 'financial'),
          'financial'
        ).toNumber()
      : 0;

  const netMargin =
    totalRevenue !== 0
      ? DecimalUtils.divide(
          DecimalUtils.multiply(netIncome, DecimalUtils.fromValue(100, 'financial'), 'financial'),
          DecimalUtils.fromValue(Math.abs(totalRevenue), 'financial'),
          'financial'
        ).toNumber()
      : 0;

  const report: ProfitAndLoss = {
    startDate,
    endDate,
    revenue: {
      accounts: revenueAccounts,
      total: Math.abs(totalRevenue),
    },
    expenses: {
      cogs: Math.abs(cogs),
      payroll: Math.abs(payroll),
      operating: Math.abs(operating),
      other: Math.abs(other),
      total: Math.abs(totalExpenses),
      breakdown: expenseAccounts,
    },
    grossProfit: DecimalUtils.toNumber(grossProfit),
    operatingIncome: DecimalUtils.toNumber(operatingIncome),
    netIncome: DecimalUtils.toNumber(netIncome),
    grossMargin,
    netMargin,
  };

  logger.info('CashModule', 'Profit & Loss Statement generated successfully', {
    totalRevenue: Math.abs(totalRevenue),
    totalExpenses: Math.abs(totalExpenses),
    netIncome: DecimalUtils.toNumber(netIncome),
  });

  // Cache result
  setCachedReport(cacheKey, report);

  return report;
}

// ==================== SESSION HISTORY REPORT ====================

/**
 * Obtiene el historial de sesiones de caja con filtros
 *
 * @param filters - Filtros de búsqueda
 * @returns Session History Report con sesiones y resumen
 */
export async function fetchSessionHistory(
  filters?: SessionHistoryFilters
): Promise<SessionHistoryReport> {
  logger.info('CashModule', 'Fetching session history', { filters });

  let query = supabase
    .from('cash_sessions')
    .select(
      `
      *,
      money_location:money_locations!inner (
        name
      ),
      opened_by_user:auth.users!cash_sessions_opened_by_fkey (
        id,
        email
      ),
      closed_by_user:auth.users!cash_sessions_closed_by_fkey (
        id,
        email
      )
    `
    )
    .order('opened_at', { ascending: false });

  // Aplicar filtros
  if (filters?.moneyLocationId) {
    query = query.eq('money_location_id', filters.moneyLocationId);
  }

  if (filters?.startDate) {
    query = query.gte('opened_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('opened_at', filters.endDate);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.openedBy) {
    query = query.eq('opened_by', filters.openedBy);
  }

  const { data: sessions, error } = await query;

  if (error) {
    logger.error('CashModule', 'Failed to fetch session history', { error });
    throw error;
  }

  // Formatear resultados
  const formattedSessions: SessionHistoryRow[] = (sessions || []).map(
    (session: any) => ({
      id: session.id,
      money_location_id: session.money_location_id,
      money_location_name: session.money_location.name,
      opened_by: session.opened_by,
      opened_by_name: session.opened_by_user?.email || 'Unknown',
      closed_by: session.closed_by,
      closed_by_name: session.closed_by_user?.email || null,
      opened_at: session.opened_at,
      closed_at: session.closed_at,
      starting_cash: session.starting_cash,
      expected_cash: session.expected_cash,
      actual_cash: session.actual_cash,
      variance: session.variance,
      cash_sales: session.cash_sales,
      cash_refunds: session.cash_refunds,
      cash_in: session.cash_in,
      cash_out: session.cash_out,
      cash_drops: session.cash_drops,
      status: session.status,
    })
  );

  // Calcular resumen
  const totalSales = formattedSessions.reduce(
    (sum, session) =>
      DecimalUtils.add(
        sum,
        DecimalUtils.fromValue(session.cash_sales, 'financial'),
        'financial'
      ),
    DecimalUtils.fromValue(0, 'financial')
  );

  const totalVariance = formattedSessions.reduce(
    (sum, session) =>
      DecimalUtils.add(
        sum,
        DecimalUtils.fromValue(session.variance || 0, 'financial'),
        'financial'
      ),
    DecimalUtils.fromValue(0, 'financial')
  );

  const closedSessions = formattedSessions.filter(
    (s) => s.status === 'CLOSED' || s.status === 'AUDITED' || s.status === 'DISCREPANCY'
  );
  const averageVariance =
    closedSessions.length > 0
      ? DecimalUtils.divide(
          totalVariance,
          DecimalUtils.fromValue(closedSessions.length, 'financial'),
          'financial'
        ).toNumber()
      : 0;

  const sessionsWithDiscrepancy = formattedSessions.filter(
    (s) => s.status === 'DISCREPANCY'
  ).length;

  return {
    sessions: formattedSessions,
    summary: {
      totalSessions: formattedSessions.length,
      totalSales: DecimalUtils.toNumber(totalSales),
      totalVariance: DecimalUtils.toNumber(totalVariance),
      averageVariance,
      sessionsWithDiscrepancy,
    },
  };
}

// ==================== HELPER FUNCTIONS ====================

function sumBalances(balances: AccountBalance[]): number {
  const sum = balances.reduce((acc, balance) => {
    return DecimalUtils.add(
      acc,
      DecimalUtils.fromValue(balance.balance, 'financial'),
      'financial'
    );
  }, DecimalUtils.fromValue(0, 'financial'));

  return DecimalUtils.toNumber(sum);
}

function sumTransactions(
  transactions: Array<{ amount: number }>
): number {
  const sum = transactions.reduce((acc, transaction) => {
    // ✅ FIXED [2.5]: Use DecimalUtils.abs() instead of Math.abs()
    const transactionAmountAbs = DecimalUtils.abs(
      DecimalUtils.fromValue(transaction.amount, 'financial'),
      'financial'
    );
    return DecimalUtils.add(acc, transactionAmountAbs, 'financial');
  }, DecimalUtils.fromValue(0, 'financial'));

  return DecimalUtils.toNumber(sum);
}
