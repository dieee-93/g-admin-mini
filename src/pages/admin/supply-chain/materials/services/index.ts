export { MaterialsNormalizer } from './materialsNormalizer';

// API Services
export * from './inventoryApi';
export * from './supplyChainDataService';

// Business Logic Services (moved from business-logic/inventory)
// Note: stockCalculation lives in @/business-logic/inventory/stockCalculation
export * from './abcAnalysisEngine';
// export * from './demandForecastingEngine'; // TODO: Re-enable when implemented
export * from './formCalculation';
// export * from './procurementRecommendationsEngine'; // TODO: Re-enable when implemented
export * from './smartAlertsAdapter';
export * from './smartAlertsEngine';
export * from './supplierAnalysisEngine';