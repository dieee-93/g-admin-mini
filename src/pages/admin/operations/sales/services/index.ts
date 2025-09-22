// API Services (existing)
export * from './saleApi';
export * from './tableApi';

// Business Logic Services (moved from business-logic/)
export * from './salesAnalytics';
export * from './taxCalculationService';

// ✅ SALES INTELLIGENCE SYSTEM - NEW
export { SalesIntelligenceEngine } from './SalesIntelligenceEngine';
export { SalesAlertsAdapter, salesAlertsAdapter } from './SalesAlertsAdapter';

// Types exports
export type {
  SalesAlert,
  SalesAlertSeverity,
  SalesAlertType,
  SalesAnalysisData,
  RevenueThresholds,
  SalesIntelligenceConfig
} from './SalesIntelligenceEngine';