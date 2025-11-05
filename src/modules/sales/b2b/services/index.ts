/**
 * Sales B2B Services Index
 *
 * Barrel export for all B2B sales services.
 *
 * @module sales/b2b/services
 */

// Quotes
export {
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuoteStatus,
  convertQuoteToOrder,
  sendQuote,
  getQuotesByCustomer,
  getQuotesByStatus,
} from './quotesService';

// Tiered Pricing
export {
  calculateTieredPrice,
  calculateOrderWithTiers,
  getTieredPricings,
  getTieredPricingById,
  getTieredPricingForProduct,
  validateTieredPricing,
} from './tieredPricingService';

// Approval Workflows
export {
  getRequiredApprovalLevel,
  isApprovalRequired,
  createApprovalWorkflow,
  submitApproval,
  getApprovalWorkflow,
  canUserApprove,
} from './approvalWorkflowService';

// Default export for convenience
import quotesService from './quotesService';
import tieredPricingService from './tieredPricingService';
import approvalWorkflowService from './approvalWorkflowService';

export default {
  quotes: quotesService,
  tieredPricing: tieredPricingService,
  approvalWorkflow: approvalWorkflowService,
};
