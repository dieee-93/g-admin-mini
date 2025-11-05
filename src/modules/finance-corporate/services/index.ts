/**
 * Finance Services Index
 *
 * Barrel export for all finance module services.
 *
 * @module finance/services
 */

export {
  getCorporateAccounts,
  getCorporateAccountById,
  getCorporateAccountByCustomerId,
  createCorporateAccount,
  updateCorporateAccount,
  deleteCorporateAccount,
  permanentlyDeleteCorporateAccount,
  activateCorporateAccount,
  getActiveCorporateAccounts,
} from './corporateAccountsService';

export {
  validateCreditLimit,
  validateCustomerCredit,
  updateAccountBalance,
  recordInvoice,
  recordPayment,
  recordCreditNote,
  recordBalanceAdjustment,
  getARAgingReport,
  getARAgingSummary,
  getCreditUtilizationReport,
} from './creditManagementService';

export {
  PAYMENT_TERM_OPTIONS,
  getCommonPaymentTerms,
  getAllPaymentTerms,
  getPaymentTermConfig,
  calculateDueDate,
  calculateDaysOverdue,
  isInvoiceOverdue,
  getAgingBucket,
  formatPaymentTerms,
  formatDaysOverdue,
  formatInvoiceDate,
  isValidPaymentTerm,
  suggestPaymentTerms,
} from './paymentTermsService';

// Default export for convenience
import corporateAccountsService from './corporateAccountsService';
import creditManagementService from './creditManagementService';
import paymentTermsService from './paymentTermsService';

export default {
  corporateAccounts: corporateAccountsService,
  creditManagement: creditManagementService,
  paymentTerms: paymentTermsService,
};
