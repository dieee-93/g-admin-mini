/**
 * Journal Entries Types
 * Asientos Contables - Sistema de Doble Entrada
 */

export type JournalEntryType =
  | 'SALE'         // Venta
  | 'PURCHASE'     // Compra
  | 'PAYMENT'      // Pago
  | 'RECEIPT'      // Cobro
  | 'TRANSFER'     // Transferencia
  | 'ADJUSTMENT'   // Ajuste
  | 'PAYROLL'      // Nómina
  | 'EXPENSE'      // Gasto
  | 'CASH_DROP'    // Retiro Parcial
  | 'DEPOSIT'      // Depósito
  | 'OPENING'      // Apertura
  | 'CLOSING';     // Cierre

export interface JournalEntryRow {
  id: string;
  entry_number?: string | null;
  entry_type: JournalEntryType;
  transaction_date: string;
  posting_date: string;
  reference_id?: string | null;
  reference_type?: string | null;
  external_reference?: string | null;
  description?: string | null;
  notes?: string | null;
  location_id?: string | null;
  cash_session_id?: string | null;
  created_by?: string | null;
  created_at: string;
  is_posted: boolean;
  posted_at?: string | null;
}

export interface JournalLineRow {
  id: string;
  journal_entry_id: string;
  account_id: string;
  money_location_id?: string | null;
  amount: number; // Positivo = Crédito, Negativo = Débito
  description?: string | null;
  created_at: string;
}

export interface JournalLineWithAccount extends JournalLineRow {
  account_code: string;
  account_name: string;
  account_type: string;
}

export interface JournalEntryWithLines extends JournalEntryRow {
  lines: JournalLineWithAccount[];
}

export interface CreateJournalEntryInput {
  entry_type: JournalEntryType;
  transaction_date?: string;
  reference_id?: string | null;
  reference_type?: string | null;
  external_reference?: string | null;
  description?: string | null;
  notes?: string | null;
  location_id?: string | null;
  cash_session_id?: string | null;
  lines: CreateJournalLineInput[];
}

export interface CreateJournalLineInput {
  account_code: string; // Se resolverá a account_id
  money_location_id?: string | null;
  amount: number;
  description?: string | null;
}

export interface MoneyMovementRow {
  id: string;
  journal_entry_id: string;
  money_location_id: string;
  cash_session_id?: string | null;
  movement_type: 'IN' | 'OUT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  amount: number;
  running_balance?: number | null;
  description?: string | null;
  created_at: string;
  created_by?: string | null;
}

export interface SalePaymentRow {
  id: string;
  sale_id: string;
  journal_entry_id: string;
  amount: number;
  payment_type: string; // 'CASH', 'CARD', 'TRANSFER', 'QR'
  metadata?: Record<string, unknown> | null;
  created_at: string;
}
