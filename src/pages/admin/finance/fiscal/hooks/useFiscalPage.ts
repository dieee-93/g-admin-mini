/**
 * Fiscal Page Orchestrator Hook
 * Comprehensive hook for managing fiscal page state, calculations, and AFIP integration
 * Following the established products pattern
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useFiscal } from './useFiscal';
import { useOfflineStatus } from '@/lib/offline';
import { notify } from '@/lib/notifications';
import {
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  WifiIcon,
  NoSymbolIcon,
  CloudIcon,
  CurrencyDollarIcon,
  ReceiptTaxIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

// Import migrated services
import {
  calculateTotalTax,
  calculateIVA,
  calculateIngresosBrutos,
  TaxCalculationResult,
  TaxConfiguration,
  TAX_RATES,
  DEFAULT_TAX_CONFIG,
  type CashFlowProjection,
  type ROIAnalysis,
  type ProfitabilityAnalysis,
  type BudgetVarianceAnalysis
} from '../services';

// ============================================================================
// TYPES
// ============================================================================

export interface FiscalPageMetrics {
  // Facturación y Ventas
  facturacionMesActual: number;
  facturasEmitidasMes: number;
  promedioFacturacion: number;
  crecimientoFacturacion: number;

  // Impuestos y Obligaciones
  totalIVARecaudado: number;
  totalIngresosBrutos: number;
  obligacionesPendientes: number;
  proximoVencimiento: string;

  // AFIP Integration
  afipConnectionStatus: 'connected' | 'disconnected' | 'error';
  caeGenerados: number;
  caePendientes: number;
  ultimaSincronizacion: string;

  // Cash Flow & Financial
  flujoEfectivoMensual: number;
  posicionEfectivo: number;
  ratioLiquidez: number;
  margenOperativo: number;

  // Compliance & Risk
  cumplimientoFiscal: number; // Percentage
  riesgosFiscales: number;
  alertasVencimiento: number;
}

export interface FiscalPageState {
  activeTab: 'invoicing' | 'afip' | 'compliance' | 'reporting';
  fiscalMode: 'auto' | 'online-first' | 'offline-first';
  effectiveFiscalMode: 'online' | 'offline' | 'hybrid';
  filters: {
    dateRange?: [Date, Date];
    taxType?: 'all' | 'iva' | 'ingresos_brutos' | 'ganancias';
    jurisdiction?: 'CABA' | 'BUENOS_AIRES' | 'CORDOBA' | 'OTHER';
  };
  selectedPeriod: 'month' | 'quarter' | 'year';
  showAnalytics: boolean;
  analyticsTimeframe: '1M' | '3M' | '6M' | '1Y';
}

export interface FiscalPageActions {
  // Invoice Management
  handleNewInvoice: () => void;
  handleInvoiceGeneration: (data: any) => void;
  handleBulkInvoicing: () => void;

  // AFIP Integration
  handleAFIPSync: () => void;
  handleCAERequest: (invoiceData: any) => void;
  handleAFIPStatusCheck: () => void;

  // Tax Calculations
  handleTaxCalculation: (amount: number, config?: TaxConfiguration) => TaxCalculationResult;
  handleBulkTaxUpdate: () => void;
  handleTaxConfigUpdate: (config: TaxConfiguration) => void;

  // Compliance & Reporting
  handleComplianceCheck: () => void;
  handleGenerateReport: (type: string, period: string) => void;
  handleExportData: (format: 'pdf' | 'excel' | 'csv') => void;

  // Financial Analysis
  handleCashFlowAnalysis: () => void;
  handleProfitabilityAnalysis: () => void;
  handleBudgetVarianceAnalysis: () => void;

  // State Management
  setActiveTab: (tab: FiscalPageState['activeTab']) => void;
  setFiscalMode: (mode: FiscalPageState['fiscalMode']) => void;
  setFilters: (filters: Partial<FiscalPageState['filters']>) => void;
  toggleAnalytics: () => void;
  setAnalyticsTimeframe: (timeframe: FiscalPageState['analyticsTimeframe']) => void;
}

export interface UseFiscalPageReturn {
  // Data
  pageState: FiscalPageState;
  metrics: FiscalPageMetrics;
  fiscalStats: any;
  cashFlowData: CashFlowProjection[];
  profitabilityAnalysis: ProfitabilityAnalysis | null;

  // Connection & Sync
  isOnline: boolean;
  connectionQuality: string;
  isSyncing: boolean;
  queueSize: number;

  // State
  loading: boolean;
  error: string | null;

  // Actions
  actions: FiscalPageActions;

  // Computed Data
  shouldShowOfflineView: boolean;
  taxConfiguration: TaxConfiguration;
  alertsData: any[];
}

// ============================================================================
// FISCAL PAGE ORCHESTRATOR HOOK
// ============================================================================

export const useFiscalPage = (): UseFiscalPageReturn => {
  const { setQuickActions, updateModuleBadge } = useNavigation();
  const { fiscalStats, isLoading: fiscalLoading, error: fiscalError } = useFiscal();

  // Offline status monitoring
  const { isOnline, connectionQuality, isSyncing, queueSize } = useOfflineStatus();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [pageState, setPageState] = useState<FiscalPageState>(() => {
    const storedMode = localStorage.getItem('fiscal_mode') as FiscalPageState['fiscalMode'];
    return {
      activeTab: 'invoicing',
      fiscalMode: storedMode || 'offline-first',
      effectiveFiscalMode: 'offline',
      filters: {},
      selectedPeriod: 'month',
      showAnalytics: false,
      analyticsTimeframe: '3M'
    };
  });

  const [error, setError] = useState<string | null>(null);
  const [cashFlowData, setCashFlowData] = useState<CashFlowProjection[]>([]);
  const [profitabilityAnalysis, setProfitabilityAnalysis] = useState<ProfitabilityAnalysis | null>(null);

  // ============================================================================
  // COMPUTED DATA & METRICS
  // ============================================================================

  // Calculate effective fiscal mode
  const effectiveFiscalMode: FiscalPageState['effectiveFiscalMode'] = useMemo(() => {
    switch (pageState.fiscalMode) {
      case 'online-first':
        return isOnline ? 'online' : 'offline';
      case 'offline-first':
        return isOnline && connectionQuality !== 'poor' ? 'hybrid' : 'offline';
      case 'auto':
        if (!isOnline) return 'offline';
        if (connectionQuality === 'poor' || queueSize > 3) return 'hybrid';
        return 'online';
      default:
        return 'offline';
    }
  }, [pageState.fiscalMode, isOnline, connectionQuality, queueSize]);

  // Update effective fiscal mode in state
  useEffect(() => {
    setPageState(prev => ({ ...prev, effectiveFiscalMode }));
  }, [effectiveFiscalMode]);

  // Calculate fiscal metrics using migrated business logic
  const metrics: FiscalPageMetrics = useMemo(() => {
    if (!fiscalStats) {
      return {
        facturacionMesActual: 0,
        facturasEmitidasMes: 0,
        promedioFacturacion: 0,
        crecimientoFacturacion: 0,
        totalIVARecaudado: 0,
        totalIngresosBrutos: 0,
        obligacionesPendientes: 0,
        proximoVencimiento: 'N/A',
        afipConnectionStatus: 'disconnected',
        caeGenerados: 0,
        caePendientes: 0,
        ultimaSincronizacion: 'N/A',
        flujoEfectivoMensual: 0,
        posicionEfectivo: 0,
        ratioLiquidez: 0,
        margenOperativo: 0,
        cumplimientoFiscal: 0,
        riesgosFiscales: 0,
        alertasVencimiento: 0
      };
    }

    // Use tax calculation service to compute tax metrics
    const taxConfig: TaxConfiguration = {
      ...DEFAULT_TAX_CONFIG,
      jurisdiction: 'CABA' // Default to CABA
    };

    // Mock calculations for demo - in real app would use actual data
    const mockBaseAmount = fiscalStats.facturacion_mes_actual || 100000;
    const taxResult = calculateTotalTax(mockBaseAmount, taxConfig);

    const ivaAmount = calculateIVA(mockBaseAmount, taxConfig.ivaRate);
    const ingresosBrutosAmount = taxConfig.includeIngresosBrutos
      ? calculateIngresosBrutos(mockBaseAmount, taxConfig.ingresosBrutosRate || 0)
      : { tax_amount: 0 };

    return {
      // Facturación y Ventas
      facturacionMesActual: fiscalStats.facturacion_mes_actual || 0,
      facturasEmitidasMes: fiscalStats.facturas_emitidas_mes || 0,
      promedioFacturacion: (fiscalStats.facturacion_mes_actual || 0) / Math.max(1, fiscalStats.facturas_emitidas_mes || 1),
      crecimientoFacturacion: 12.5, // Mock growth percentage

      // Impuestos y Obligaciones
      totalIVARecaudado: ivaAmount.tax_amount,
      totalIngresosBrutos: ingresosBrutosAmount.tax_amount || 0,
      obligacionesPendientes: fiscalStats.cae_pendientes || 0,
      proximoVencimiento: fiscalStats.proxima_presentacion || 'N/A',

      // AFIP Integration
      afipConnectionStatus: isOnline ? 'connected' : 'disconnected',
      caeGenerados: Math.floor((fiscalStats.facturas_emitidas_mes || 0) * 0.8), // 80% success rate
      caePendientes: fiscalStats.cae_pendientes || 0,
      ultimaSincronizacion: new Date().toLocaleTimeString('es-AR'),

      // Cash Flow & Financial
      flujoEfectivoMensual: (fiscalStats.facturacion_mes_actual || 0) - (taxResult.total_tax_amount || 0),
      posicionEfectivo: (fiscalStats.facturacion_mes_actual || 0) * 0.15, // 15% cash position
      ratioLiquidez: 1.8, // Mock liquidity ratio
      margenOperativo: 0.18, // Mock operating margin

      // Compliance & Risk
      cumplimientoFiscal: isOnline ? 95 : 85, // Higher compliance when online
      riesgosFiscales: queueSize > 5 ? 3 : queueSize > 2 ? 1 : 0,
      alertasVencimiento: Math.floor(Math.random() * 3) // Mock alerts
    };
  }, [fiscalStats, isOnline, queueSize]);

  // Tax configuration for calculations
  const taxConfiguration: TaxConfiguration = useMemo(() => ({
    ...DEFAULT_TAX_CONFIG,
    jurisdiction: pageState.filters.jurisdiction || 'CABA',
    ivaRate: TAX_RATES.IVA.GENERAL,
    ingresosBrutosRate: TAX_RATES.INGRESOS_BRUTOS.CABA,
    includeIngresosBrutos: true
  }), [pageState.filters.jurisdiction]);

  // Alerts data for notifications
  const alertsData = useMemo(() => {
    const alerts = [];

    // AFIP connection alerts
    if (!isOnline) {
      alerts.push({
        type: 'connection',
        severity: 'medium',
        message: 'Sin conexión con AFIP - Operando en modo offline',
        action: 'Las facturas se sincronizarán automáticamente al restaurar conexión'
      });
    }

    // Pending CAE alerts
    if (metrics.caePendientes > 5) {
      alerts.push({
        type: 'cae',
        severity: 'high',
        message: `${metrics.caePendientes} CAE pendientes de autorización`,
        action: 'Revisa el estado de conexión con AFIP'
      });
    }

    // Compliance alerts
    if (metrics.cumplimientoFiscal < 90) {
      alerts.push({
        type: 'compliance',
        severity: 'high',
        message: `Cumplimiento fiscal bajo: ${metrics.cumplimientoFiscal}%`,
        action: 'Revisa obligaciones pendientes y próximos vencimientos'
      });
    }

    // Queue size alerts
    if (queueSize > 10) {
      alerts.push({
        type: 'queue',
        severity: 'medium',
        message: `${queueSize} transacciones pendientes de sincronización`,
        action: 'Considera sincronizar manualmente cuando mejore la conexión'
      });
    }

    return alerts;
  }, [isOnline, metrics, queueSize]);

  // Determine if should show offline view
  const shouldShowOfflineView = useMemo(() => {
    return effectiveFiscalMode === 'offline' ||
      (effectiveFiscalMode === 'hybrid' && (pageState.activeTab === 'afip' || pageState.activeTab === 'invoicing'));
  }, [effectiveFiscalMode, pageState.activeTab]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Save fiscal mode preference
  useEffect(() => {
    localStorage.setItem('fiscal_mode', pageState.fiscalMode);
  }, [pageState.fiscalMode]);

  // Configure quick actions based on active tab
  useEffect(() => {
    const getQuickActionsForTab = (tab: string) => {
      const baseActions = [
        {
          id: 'generate-invoice',
          label: 'Nueva Factura',
          icon: DocumentTextIcon,
          action: () => actions.handleNewInvoice(),
          color: 'blue'
        }
      ];

      switch (tab) {
        case 'invoicing':
          return [
            ...baseActions,
            {
              id: 'bulk-invoicing',
              label: 'Facturación Masiva',
              icon: DocumentTextIcon,
              action: () => actions.handleBulkInvoicing(),
              color: 'purple'
            }
          ];
        case 'afip':
          return [
            ...baseActions,
            {
              id: 'afip-sync',
              label: 'Sincronizar AFIP',
              icon: CloudIcon,
              action: () => actions.handleAFIPSync(),
              color: 'green'
            },
            {
              id: 'afip-status',
              label: 'Estado AFIP',
              icon: CogIcon,
              action: () => actions.handleAFIPStatusCheck(),
              color: 'blue'
            }
          ];
        case 'compliance':
          return [
            ...baseActions,
            {
              id: 'compliance-check',
              label: 'Verificar Cumplimiento',
              icon: ExclamationTriangleIcon,
              action: () => actions.handleComplianceCheck(),
              color: 'orange'
            }
          ];
        case 'reporting':
          return [
            ...baseActions,
            {
              id: 'generate-report',
              label: 'Generar Reporte',
              icon: ChartBarIcon,
              action: () => actions.handleGenerateReport('tax', 'month'),
              color: 'green'
            },
            {
              id: 'export-data',
              label: 'Exportar Datos',
              icon: DocumentTextIcon,
              action: () => actions.handleExportData('pdf'),
              color: 'blue'
            }
          ];
        default:
          return baseActions;
      }
    };

    setQuickActions(getQuickActionsForTab(pageState.activeTab));
    return () => setQuickActions([]);
  }, [pageState.activeTab]);

  // Update module badge with critical alerts count
  useEffect(() => {
    const criticalAlertsCount = alertsData.filter(alert => alert.severity === 'high').length;

    if (criticalAlertsCount > 0) {
      updateModuleBadge('fiscal', {
        count: criticalAlertsCount,
        color: 'red',
        pulse: true
      });
    } else if (!isOnline) {
      updateModuleBadge('fiscal', {
        count: 1,
        color: 'orange',
        pulse: false
      });
    } else {
      updateModuleBadge('fiscal', null);
    }
  }, [alertsData, isOnline, updateModuleBadge]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const actions: FiscalPageActions = useMemo(() => ({
    // Invoice Management
    handleNewInvoice: () => {
      console.log('Opening new invoice modal');
      setPageState(prev => ({ ...prev, activeTab: 'invoicing' }));
      // Would open invoice creation interface
    },

    handleInvoiceGeneration: (data: any) => {
      console.log('Generating invoice:', data);
      // Use tax calculation service for accurate tax computation
      const taxResult = calculateTotalTax(data.amount, taxConfiguration);
      console.log('Tax calculation result:', taxResult);
      // Would process invoice generation with AFIP
    },

    handleBulkInvoicing: () => {
      console.log('Opening bulk invoicing interface');
      // Would open bulk invoice processing
    },

    // AFIP Integration
    handleAFIPSync: () => {
      if (!isOnline) {
        notify.warning({
          title: 'Sin conexión',
          description: 'No es posible sincronizar con AFIP sin conexión a internet'
        });
        return;
      }

      console.log('Synchronizing with AFIP');
      notify.info({
        title: 'Sincronización iniciada',
        description: 'Enviando datos pendientes a AFIP'
      });
      // Would handle AFIP synchronization
    },

    handleCAERequest: (invoiceData: any) => {
      console.log('Requesting CAE for invoice:', invoiceData);
      // Would request CAE from AFIP
    },

    handleAFIPStatusCheck: () => {
      console.log('Checking AFIP status');
      setPageState(prev => ({ ...prev, activeTab: 'afip' }));
      // Would check AFIP service status
    },

    // Tax Calculations
    handleTaxCalculation: (amount: number, config?: TaxConfiguration) => {
      const finalConfig = config || taxConfiguration;
      const result = calculateTotalTax(amount, finalConfig);
      console.log('Tax calculation:', { amount, config: finalConfig, result });
      return result;
    },

    handleBulkTaxUpdate: () => {
      console.log('Updating taxes for all pending transactions');
      // Would recalculate taxes for pending transactions
    },

    handleTaxConfigUpdate: (config: TaxConfiguration) => {
      console.log('Updating tax configuration:', config);
      setPageState(prev => ({
        ...prev,
        filters: { ...prev.filters, jurisdiction: config.jurisdiction }
      }));
      // Would update tax configuration
    },

    // Compliance & Reporting
    handleComplianceCheck: () => {
      console.log('Running compliance check');
      setPageState(prev => ({ ...prev, activeTab: 'compliance' }));
      // Would run compliance verification
    },

    handleGenerateReport: (type: string, period: string) => {
      console.log(`Generating ${type} report for ${period}`);
      setPageState(prev => ({ ...prev, activeTab: 'reporting' }));
      // Would generate fiscal reports
    },

    handleExportData: (format: 'pdf' | 'excel' | 'csv') => {
      console.log(`Exporting fiscal data in ${format} format`);
      // Would export fiscal data
    },

    // Financial Analysis
    handleCashFlowAnalysis: () => {
      console.log('Generating cash flow analysis');
      // Would use financialPlanningEngine for cash flow projections
      // const projections = generateCashFlowProjections(data);
      // setCashFlowData(projections);
    },

    handleProfitabilityAnalysis: () => {
      console.log('Generating profitability analysis');
      // Would use financialPlanningEngine for profitability analysis
    },

    handleBudgetVarianceAnalysis: () => {
      console.log('Generating budget variance analysis');
      // Would analyze budget variances
    },

    // State Management
    setActiveTab: (tab: FiscalPageState['activeTab']) => {
      setPageState(prev => ({ ...prev, activeTab: tab }));
    },

    setFiscalMode: (mode: FiscalPageState['fiscalMode']) => {
      setPageState(prev => ({ ...prev, fiscalMode: mode }));

      notify.info({
        title: 'Modo Fiscal Actualizado',
        description: `Cambiado a: ${mode.replace('-', ' ')}`
      });
    },

    setFilters: (filters: Partial<FiscalPageState['filters']>) => {
      setPageState(prev => ({ ...prev, filters: { ...prev.filters, ...filters } }));
    },

    toggleAnalytics: () => {
      setPageState(prev => ({ ...prev, showAnalytics: !prev.showAnalytics }));
    },

    setAnalyticsTimeframe: (timeframe: FiscalPageState['analyticsTimeframe']) => {
      setPageState(prev => ({ ...prev, analyticsTimeframe: timeframe }));
    }
  }), [taxConfiguration, isOnline]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    pageState,
    metrics,
    fiscalStats,
    cashFlowData,
    profitabilityAnalysis,

    // Connection & Sync
    isOnline,
    connectionQuality,
    isSyncing,
    queueSize,

    // State
    loading: fiscalLoading,
    error: error || fiscalError,

    // Actions
    actions,

    // Computed Data
    shouldShowOfflineView,
    taxConfiguration,
    alertsData
  };
};