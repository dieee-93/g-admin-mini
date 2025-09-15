// Tax and financial configuration types

export interface TaxSettings {
  tax_rate: number;
  tax_name: string;
  include_tax_in_prices: boolean;
  tax_number?: string;
}

export interface CurrencySettings {
  code: string; // 'USD', 'EUR', etc.
  symbol: string;
  decimal_places: number;
  position: 'before' | 'after';
}