// Fiscal Module - Centralized Tax and Compliance Management
// Entry point for all fiscal-related functionality

// Core Components
export { default as FiscalPage } from './FiscalPage';

// Main Sections
export { InvoiceGeneration } from './components/sections/InvoiceGeneration';
export { AFIPIntegration } from './components/sections/AFIPIntegration';
export { TaxCompliance } from './components/sections/TaxCompliance';
export { FinancialReporting } from './components/sections/FinancialReporting';

// Reusable Components
export { TaxSummary, InlineTaxSummary } from './components/TaxSummary';

// Services
export { 
  taxService,
  TaxCalculationService,
  calculateTaxes,
  calculateCartTaxes,
  getTaxAmount,
  getSubtotal,
  TAX_RATES,
  DEFAULT_TAX_CONFIG
} from './services/taxCalculationService';

// Hooks
export { 
  default as useTaxCalculation,
  useTaxCalculation,
  useCartTaxCalculation,
  useAmountTaxCalculation
} from './hooks/useTaxCalculation';

// API
export { fiscalApi } from './data/fiscalApi';

// Types
export type {
  TaxConfiguration,
  TaxCalculationResult,
  SaleItem as FiscalSaleItem
} from './services/taxCalculationService';

export type {
  Invoice,
  InvoiceItem,
  InvoiceType,
  CondicionIVA,
  AFIPConfiguration,
  TaxReport,
  FinancialReport,
  FiscalStats
} from './types';

// Logic Hooks
export { useFiscal } from './logic/useFiscal';