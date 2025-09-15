export { MaterialsNormalizer } from './materialsNormalizer';

// API Services
export * from './inventoryApi';
export * from './suppliersApi';
export * from './supplyChainDataService';

// Business Logic Services (moved from business-logic/inventory)
export * from './stockCalculation';
export * from './abcAnalysisEngine';
export * from './demandForecastingEngine';
export * from './formCalculation';
export * from './procurementRecommendationsEngine';
export * from './smartAlertsAdapter';
export * from './smartAlertsEngine';
export * from './supplierAnalysisEngine';