/**
 * Cash Management Module Types
 * Tipos centralizados para el módulo de gestión de efectivo
 */

// Chart of Accounts
export type {
  AccountType,
  NormalBalance,
  ChartOfAccountsRow,
  ChartOfAccountsNode,
  CreateChartOfAccountInput,
  UpdateChartOfAccountInput,
} from './chartOfAccounts';

// Money Locations
export type {
  LocationType,
  MoneyLocationRow,
  MoneyLocationWithAccount,
  CreateMoneyLocationInput,
  UpdateMoneyLocationInput,
} from './moneyLocations';

// Cash Sessions
export type {
  CashSessionStatus,
  CashSessionRow,
  CashSessionWithDetails,
  OpenCashSessionInput,
  CloseCashSessionInput,
  CashSessionSummary,
} from './cashSessions';

// Journal Entries
export type {
  JournalEntryType,
  JournalEntryRow,
  JournalLineRow,
  JournalLineWithAccount,
  JournalEntryWithLines,
  CreateJournalEntryInput,
  CreateJournalLineInput,
  MoneyMovementRow,
  SalePaymentRow,
} from './journalEntries';

// Common Types
export interface AccountBalance {
  account_id: string;
  code: string;
  name: string;
  account_type: string;
  normal_balance: string;
  balance: number;
  transaction_count: number;
}

export interface MoneyLocationBalance {
  id: string;
  name: string;
  location_type: string;
  account_id: string;
  account_code: string;
  current_balance: number;
  last_movement?: string | null;
}
