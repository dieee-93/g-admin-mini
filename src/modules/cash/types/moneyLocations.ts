/**
 * Money Locations Types
 * Ubicaciones de Dinero - Cajas, Bancos, etc.
 */

export type LocationType =
  | 'CASH_DRAWER'    // Caja Registradora
  | 'SAFE'           // Caja Fuerte
  | 'BANK_ACCOUNT'   // Cuenta Bancaria
  | 'DIGITAL_WALLET' // Billetera Digital (MercadoPago, MODO)
  | 'PETTY_CASH';    // Caja Chica

export interface MoneyLocationRow {
  id: string;
  account_id: string;
  name: string;
  code?: string | null;
  location_type: LocationType;
  requires_session: boolean;
  default_float?: number | null;
  max_cash_limit?: number | null;
  responsible_user_id?: string | null;
  location_id?: string | null;
  current_balance: number;
  is_active: boolean;
  description?: string | null;
  external_account_number?: string | null;
  api_credentials?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface MoneyLocationWithAccount extends MoneyLocationRow {
  account_code: string;
  account_name: string;
}

export interface CreateMoneyLocationInput {
  account_id: string;
  name: string;
  code?: string | null;
  location_type: LocationType;
  requires_session?: boolean;
  default_float?: number | null;
  max_cash_limit?: number | null;
  responsible_user_id?: string | null;
  location_id?: string | null;
  description?: string | null;
  external_account_number?: string | null;
}

export interface UpdateMoneyLocationInput {
  name?: string;
  description?: string | null;
  is_active?: boolean;
  responsible_user_id?: string | null;
  default_float?: number | null;
  max_cash_limit?: number | null;
}
