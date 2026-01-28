/**
 * Cash Sessions Types
 * Sesiones de Caja - Turnos con Arqueo
 */

export type CashSessionStatus = 'OPEN' | 'CLOSED' | 'AUDITED' | 'DISCREPANCY';

export interface CashSessionRow {
  id: string;
  money_location_id: string;
  location_id?: string | null;
  opened_by: string;
  closed_by?: string | null;
  opened_at: string;
  closed_at?: string | null;
  starting_cash: number;
  cash_sales: number;
  cash_refunds: number;
  cash_in: number;
  cash_out: number;
  cash_drops: number;
  expected_cash?: number | null;
  actual_cash?: number | null;
  variance?: number | null;
  status: CashSessionStatus;
  opening_notes?: string | null;
  closing_notes?: string | null;
  audit_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CashSessionWithDetails extends CashSessionRow {
  money_location_name: string;
  opened_by_name: string;
  closed_by_name?: string | null;
}

export interface OpenCashSessionInput {
  money_location_id: string;
  location_id?: string | null;
  starting_cash: number;
  opening_notes?: string | null;
}

export interface CloseCashSessionInput {
  actual_cash: number;
  closing_notes?: string | null;
}

export interface CashSessionSummary {
  session_id: string;
  money_location_name: string;
  opened_at: string;
  closed_at?: string | null;
  starting_cash: number;
  total_activity: number;
  expected_cash: number;
  actual_cash?: number | null;
  variance?: number | null;
  status: CashSessionStatus;
}
