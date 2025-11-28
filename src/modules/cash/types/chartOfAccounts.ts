/**
 * Chart of Accounts Types
 * Plan de Cuentas - Sistema de Gestión de Efectivo
 */

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
export type NormalBalance = 'DEBIT' | 'CREDIT';

export interface ChartOfAccountsRow {
  id: string;
  parent_id?: string | null;
  code: string;
  name: string;
  account_type: AccountType;
  sub_type?: string | null;
  is_group: boolean;
  is_active: boolean;
  normal_balance: NormalBalance;
  allow_transactions: boolean;
  description?: string | null;
  currency: string;
  location_id?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface ChartOfAccountsNode extends ChartOfAccountsRow {
  children: ChartOfAccountsNode[];
  level: number;
}

export interface CreateChartOfAccountInput {
  parent_id?: string | null;
  code: string;
  name: string;
  account_type: AccountType;
  sub_type?: string | null;
  is_group: boolean;
  normal_balance: NormalBalance;
  allow_transactions?: boolean;
  description?: string | null;
  currency?: string;
  location_id?: string | null;
}

export interface UpdateChartOfAccountInput {
  name?: string;
  description?: string | null;
  is_active?: boolean;
}
