// Products Services - Main Exports
// Provides clean imports for all product management services

export * from './productApi';
export * from './productCostService';
export * from './productCostAnalysisService';
export * from './productMaterialsCostEngine';
export * from './menuEngineeringCalculations';

// Export new product form services (v3.0)
export {
  calculateProductTotalCost,
  calculateMaterialsCost,
  calculateLaborCost,
  calculateProductionOverhead,
  calculateProfitMargin,
  calculateMarkup,
  suggestPrice,
  suggestPriceFromMarkup,
  isPriceBelowCost,
  getRecommendedMargin,
  calculateDepreciationCost
} from './productCostCalculation';

export {
  validateProduct,
  createValidationError
} from './productFormValidation';

// Export new product form API (v3.0)
export {
  productFormApi,
  getProductById,
  createProductFromForm,
  updateProductFromForm,
  deleteProductFromForm,
  listProducts
} from './productFormApi';

// Export service context API (for costing per delivery channel)
export * from './serviceContextApi';