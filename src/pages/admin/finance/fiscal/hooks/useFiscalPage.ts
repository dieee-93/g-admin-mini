/**
 * Fiscal Page Orchestrator Hook
 * Comprehensive hook for managing fiscal page state, calculations, and AFIP integration
 * Following the established products pattern
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigationActions } from '@/contexts/NavigationContext';
import { useLocation } from '@/contexts/LocationContext';
import { useFiscal } from './useFiscal';
import { useOfflineStatus } from '@/lib/offline';
import { notify } from '@/lib/notifications';
import { logger } from '@/lib/logging';
import { fiscalApiMultiLocation } from '../services/fiscalApi.multi-location';
import {
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CloudIcon
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
  type ProfitabilityAnalysis
} from '../services';
import type { AFIPConfiguration, Location, FiscalAlert, FiscalStats } from '../types/fiscalTypes';

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
  // Multi-location support
  fiscalViewMode: 'per-location' | 'consolidated';
  selectedLocation?: Location | null;
  isMultiLocationMode: boolean;
  afipConfig?: AFIPConfiguration;
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
  handleInvoiceGeneration: (data: InvoiceGenerationData) => void;
  handleBulkInvoicing: () => void;

  // AFIP Integration
  handleAFIPSync: () => void;
  handleCAERequest: (invoiceData: CAERequestData) => void;
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
  setFiscalViewMode: (mode: FiscalPageState['fiscalViewMode']) => void;
  setFilters: (filters: Partial<FiscalPageState['filters']>) => void;
  toggleAnalytics: () => void;
  setAnalyticsTimeframe: (timeframe: FiscalPageState['analyticsTimeframe']) => void;
}

export interface UseFiscalPageReturn {
  // Data
  pageState: FiscalPageState;
  metrics: FiscalPageMetrics;
  fiscalStats: FiscalStats | null;
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
  alertsData: FiscalAlert[];
}

// ============================================================================
// FISCAL PAGE ORCHESTRATOR HOOK
// ============================================================================

export const useFiscalPage = (): UseFiscalPageReturn => {
  const { setQuickActions, updateModuleBadge } = useNavigationActions();
  const { fiscalStats, isLoading: fiscalLoading, error: fiscalError } = useFiscal();

  // 🆕 Location Context
  const { selectedLocation, isMultiLocationMode } = useLocation();

  // Offline status monitoring
  const { isOnline, connectionQuality, isSyncing, queueSize } = useOfflineStatus();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [pageState, setPageState] = useState<FiscalPageState>(() => {
    const storedMode = localStorage.getItem('fiscal_mode') as FiscalPageState['fiscalMode'];
    const storedViewMode = localStorage.getItem('fiscal_view_mode') as FiscalPageState['fiscalViewMode'];
    return {
      activeTab: 'invoicing',
      fiscalMode: storedMode || 'offline-first',
      effectiveFiscalMode: 'offline',
      fiscalViewMode: storedViewMode || 'per-location',
      selectedLocation: null,
      isMultiLocationMode: false,
      afipConfig: undefined,
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
  // 🆕 MULTI-LOCATION STATE
  // ============================================================================

  // AFIP config for selected location
  const [afipConfig, setAfipConfig] = useState<AFIPConfiguration | null>(null);
  const [afipConfigLoading, setAfipConfigLoading] = useState(false);

  // Location-aware fiscal stats
  const [locationFiscalStats, setLocationFiscalStats] = useState<FiscalStats | null>(null);
  const [locationStatsLoading, setLocationStatsLoading] = useState(false);

  // Use location-aware stats if available, fallback to useFiscal hook
  const effectiveFiscalStats = isMultiLocationMode ? locationFiscalStats : fiscalStats;
  const effectiveLoading = isMultiLocationMode ? locationStatsLoading : fiscalLoading;

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
    if (!effectiveFiscalStats) {
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
    const mockBaseAmount = effectiveFiscalStats.facturacion_mes_actual || 100000;
    const taxResult = calculateTotalTax(mockBaseAmount, taxConfig);

    const ivaAmount = calculateIVA(mockBaseAmount, taxConfig.ivaRate);
    const ingresosBrutosAmount = taxConfig.includeIngresosBrutos
      ? calculateIngresosBrutos(mockBaseAmount, taxConfig.ingresosBrutosRate || 0)
      : { tax_amount: 0 };

    return {
      // Facturación y Ventas
      facturacionMesActual: effectiveFiscalStats.facturacion_mes_actual || 0,
      facturasEmitidasMes: effectiveFiscalStats.facturas_emitidas_mes || 0,
      promedioFacturacion: (effectiveFiscalStats.facturacion_mes_actual || 0) / Math.max(1, effectiveFiscalStats.facturas_emitidas_mes || 1),
      crecimientoFacturacion: 12.5, // Mock growth percentage

      // Impuestos y Obligaciones
      totalIVARecaudado: ivaAmount.tax_amount,
      totalIngresosBrutos: ingresosBrutosAmount.tax_amount || 0,
      obligacionesPendientes: effectiveFiscalStats.cae_pendientes || 0,
      proximoVencimiento: effectiveFiscalStats.proxima_presentacion || 'N/A',

      // AFIP Integration
      afipConnectionStatus: isOnline ? 'connected' : 'disconnected',
      caeGenerados: Math.floor((effectiveFiscalStats.facturas_emitidas_mes || 0) * 0.8), // 80% success rate
      caePendientes: effectiveFiscalStats.cae_pendientes || 0,
      ultimaSincronizacion: new Date().toLocaleTimeString('es-AR'),

      // Cash Flow & Financial
      flujoEfectivoMensual: (effectiveFiscalStats.facturacion_mes_actual || 0) - (taxResult.total_tax_amount || 0),
      posicionEfectivo: (effectiveFiscalStats.facturacion_mes_actual || 0) * 0.15, // 15% cash position
      ratioLiquidez: 1.8, // Mock liquidity ratio
      margenOperativo: 0.18, // Mock operating margin

      // Compliance & Risk
      cumplimientoFiscal: isOnline ? 95 : 85, // Higher compliance when online
      riesgosFiscales: queueSize > 5 ? 3 : queueSize > 2 ? 1 : 0,
      alertasVencimiento: Math.floor(Math.random() * 3) // Mock alerts
    };
  }, [effectiveFiscalStats, isOnline, queueSize]);

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

  // 🆕 Fetch AFIP config for selected location
  useEffect(() => {
    if (!selectedLocation?.id || !isMultiLocationMode || pageState.fiscalViewMode !== 'per-location') {
      setAfipConfig(null);
      return;
    }

    const loadAFIPConfig = async () => {
      setAfipConfigLoading(true);
      try {
        const config = await fiscalApiMultiLocation.getAFIPConfiguration(selectedLocation.id);
        setAfipConfig(config);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        logger.error('FiscalPage', 'Error loading AFIP config:', errorMessage);
        setAfipConfig(null);
      } finally {
        setAfipConfigLoading(false);
      }
    };

    loadAFIPConfig();
  }, [selectedLocation?.id, isMultiLocationMode, pageState.fiscalViewMode]);

  // 🆕 Fetch location-aware fiscal stats
  useEffect(() => {
    if (!isMultiLocationMode) {
      setLocationFiscalStats(null);
      return;
    }

    const loadFiscalStats = async () => {
      setLocationStatsLoading(true);
      try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

        if (pageState.fiscalViewMode === 'consolidated') {
          const stats = await fiscalApiMultiLocation.getFiscalStats(null, startDate, endDate);
          setLocationFiscalStats(stats);
        } else if (selectedLocation) {
          const stats = await fiscalApiMultiLocation.getFiscalStats(
            selectedLocation.id,
            startDate,
            endDate
          );
          setLocationFiscalStats(stats);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        logger.error('FiscalPage', 'Error loading fiscal stats:', errorMessage);
        setLocationFiscalStats(null);
      } finally {
        setLocationStatsLoading(false);
      }
    };

    loadFiscalStats();
  }, [selectedLocation?.id, isMultiLocationMode, pageState.fiscalViewMode]);

  // 🆕 Update pageState with location context
  useEffect(() => {
    setPageState(prev => ({
      ...prev,
      selectedLocation,
      isMultiLocationMode,
      afipConfig
    }));
  }, [selectedLocation, isMultiLocationMode, afipConfig]);

  // Save fiscal mode preference
  useEffect(() => {
    localStorage.setItem('fiscal_mode', pageState.fiscalMode);
  }, [pageState.fiscalMode]);

  // Save fiscal view mode preference
  useEffect(() => {
    localStorage.setItem('fiscal_view_mode', pageState.fiscalViewMode);
  }, [pageState.fiscalViewMode]);

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
      // 🆕 Validate location selection in multi-location mode
      if (isMultiLocationMode && !selectedLocation) {
        notify.warning({
          title: 'Seleccione un local',
          description: 'Debe seleccionar un local específico para emitir facturas'
        });
        return;
      }

      logger.info('API', 'Opening new invoice modal', {
        locationId: selectedLocation?.id,
        locationName: selectedLocation?.name,
        puntoVenta: afipConfig?.punto_venta
      });
      setPageState(prev => ({ ...prev, activeTab: 'invoicing' }));
      // Would open invoice creation interface with location context
    },

    handleInvoiceGeneration: (data: InvoiceGenerationData) => {
      logger.info('API', 'Generating invoice:', data);
      // Calculate total from items
      const totalAmount = data.items.reduce((sum, item) => {
        return sum + (item.precio_unitario * item.cantidad);
      }, 0);
      // Use tax calculation service for accurate tax computation
      const taxResult = calculateTotalTax(totalAmount, taxConfiguration);
      logger.info('API', 'Tax calculation result:', taxResult);
      // TODO: Implement AFIP invoice generation with CAE request
    },

    handleBulkInvoicing: () => {
      logger.info('API', 'Opening bulk invoicing interface');
      // Would open bulk invoice processing
    },

    // AFIP Integration
    handleAFIPSync: async () => {
      if (!isOnline) {
        notify.warning({
          title: 'Sin conexión',
          description: 'No es posible sincronizar con AFIP sin conexión a internet'
        });
        return;
      }

      try {
        notify.info({
          title: 'Sincronización iniciada',
          description: 'Enviando CAEs pendientes a AFIP...'
        });

        // 🆕 Multi-location sync support
        if (pageState.fiscalViewMode === 'consolidated') {
          logger.info('API', 'Synchronizing all locations with AFIP');
          const results = await fiscalApiMultiLocation.syncAllLocationsPendingCAE();
          const total = Object.values(results).reduce((sum, count) => sum + count, 0);

          notify.success({
            title: 'Sincronización exitosa',
            description: `${total} CAEs actualizados en todas las ubicaciones`
          });
        } else if (selectedLocation) {
          logger.info('API', 'Synchronizing location with AFIP', { locationId: selectedLocation.id });
          const count = await fiscalApiMultiLocation.syncLocationPendingCAE(selectedLocation.id);

          notify.success({
            title: 'Sincronización exitosa',
            description: `${count} CAEs actualizados para ${selectedLocation.name}`
          });
        } else {
          notify.warning({
            title: 'Seleccione un local',
            description: 'Debe seleccionar un local para sincronizar'
          });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'No se pudo sincronizar con AFIP';
        logger.error('API', 'AFIP sync error:', errorMessage);
        notify.error({
          title: 'Error en sincronización',
          description: errorMessage
        });
      }
    },

    handleCAERequest: (invoiceData: CAERequestData) => {
      logger.info('API', 'Requesting CAE for invoice:', invoiceData);
      // Would request CAE from AFIP
    },

    handleAFIPStatusCheck: () => {
      logger.debug('API', 'Checking AFIP status');
      setPageState(prev => ({ ...prev, activeTab: 'afip' }));
      // Would check AFIP service status
    },

    // Tax Calculations
    handleTaxCalculation: (amount: number, config?: TaxConfiguration) => {
      const finalConfig = config || taxConfiguration;
      const result = calculateTotalTax(amount, finalConfig);
      logger.info('API', 'Tax calculation:', { amount, config: finalConfig, result });
      return result;
    },

    handleBulkTaxUpdate: () => {
      logger.info('API', 'Updating taxes for all pending transactions');
      // Would recalculate taxes for pending transactions
    },

    handleTaxConfigUpdate: (config: TaxConfiguration) => {
      logger.info('API', 'Updating tax configuration:', config);
      setPageState(prev => ({
        ...prev,
        filters: { ...prev.filters, jurisdiction: config.jurisdiction }
      }));
      // Would update tax configuration
    },

    // Compliance & Reporting
    handleComplianceCheck: () => {
      logger.info('API', 'Running compliance check');
      setPageState(prev => ({ ...prev, activeTab: 'compliance' }));
      // Would run compliance verification
    },

    handleGenerateReport: async (type: string, period: string) => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        // 🆕 Multi-location report generation
        if (pageState.fiscalViewMode === 'consolidated') {
          logger.info('API', `Generating consolidated ${type} report for ${period}`);
          await fiscalApiMultiLocation.generateConsolidatedTaxReport(
            type as 'iva_ventas' | 'iva_compras' | 'ingresos_brutos' | 'ganancias',
            year,
            month
          );

          notify.success({
            title: 'Reporte consolidado generado',
            description: 'El reporte fiscal consolidado está listo'
          });
        } else if (selectedLocation) {
          logger.info('API', `Generating ${type} report for location ${selectedLocation.name}`);
          await fiscalApiMultiLocation.generateLocationTaxReport(
            selectedLocation.id,
            type as 'iva_ventas' | 'iva_compras' | 'ingresos_brutos' | 'ganancias',
            year,
            month
          );

          notify.success({
            title: 'Reporte generado',
            description: `Reporte fiscal para ${selectedLocation.name} está listo`
          });
        } else {
          notify.warning({
            title: 'Seleccione un local',
            description: 'Debe seleccionar un local para generar reportes'
          });
          return;
        }

        setPageState(prev => ({ ...prev, activeTab: 'reporting' }));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'No se pudo generar el reporte';
        logger.error('API', 'Report generation error:', errorMessage);
        notify.error({
          title: 'Error al generar reporte',
          description: errorMessage
        });
      }
    },

    handleExportData: (format: 'pdf' | 'excel' | 'csv') => {
      logger.info('API', `Exporting fiscal data in ${format} format`);
      // Would export fiscal data
    },

    // Financial Analysis
    handleCashFlowAnalysis: async () => {
      try {
        logger.info('API', 'Generating cash flow analysis');
        const { generateCashFlowProjections } = await import('../services/financialPlanningEngine');

        // Generate 6-month cash flow projections
        const projections = generateCashFlowProjections({
          currentRevenue: metrics.facturacionMesActual,
          growthRate: metrics.crecimientoFacturacion / 100,
          monthsAhead: 6
        });

        setCashFlowData(projections);
        setPageState(prev => ({ ...prev, showAnalytics: true }));

        notify.success({
          title: 'Análisis completado',
          description: 'Proyección de flujo de efectivo generada'
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        logger.error('API', 'Cash flow analysis error:', errorMessage);
        setError(errorMessage);
      }
    },

    handleProfitabilityAnalysis: async () => {
      try {
        logger.info('API', 'Generating profitability analysis');
        const { analyzeProfitability } = await import('../services/financialPlanningEngine');

        const analysis = analyzeProfitability({
          revenue: metrics.facturacionMesActual,
          costs: metrics.totalIVARecaudado + metrics.totalIngresosBrutos,
          period: pageState.analyticsTimeframe
        });

        setProfitabilityAnalysis(analysis);

        notify.success({
          title: 'Análisis completado',
          description: `Margen operativo: ${(analysis.operatingMargin * 100).toFixed(1)}%`
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        logger.error('API', 'Profitability analysis error:', errorMessage);
        setError(errorMessage);
      }
    },

    handleBudgetVarianceAnalysis: async () => {
      try {
        logger.info('API', 'Generating budget variance analysis');
        const { analyzeBudgetVariance } = await import('../services/financialPlanningEngine');

        const variance = analyzeBudgetVariance({
          actual: metrics.facturacionMesActual,
          budgeted: metrics.facturacionMesActual * 1.1, // Mock: 10% growth expected
          period: pageState.selectedPeriod
        });

        notify.info({
          title: 'Variación presupuestaria',
          description: `Variación: ${variance.variancePercentage > 0 ? '+' : ''}${variance.variancePercentage.toFixed(1)}%`
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        logger.error('API', 'Budget variance error:', errorMessage);
        setError(errorMessage);
      }
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

    // 🆕 Set fiscal view mode (per-location vs consolidated)
    setFiscalViewMode: (mode: FiscalPageState['fiscalViewMode']) => {
      setPageState(prev => ({ ...prev, fiscalViewMode: mode }));

      notify.info({
        title: 'Vista actualizada',
        description: mode === 'consolidated' ? 'Vista consolidada activada' : 'Vista por local activada'
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
  }), [taxConfiguration, isOnline, isMultiLocationMode, selectedLocation, afipConfig, pageState.fiscalViewMode]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    pageState,
    metrics,
    fiscalStats: effectiveFiscalStats, // 🆕 Use location-aware stats
    cashFlowData,
    profitabilityAnalysis,

    // Connection & Sync
    isOnline,
    connectionQuality,
    isSyncing,
    queueSize,

    // State
    loading: effectiveLoading || afipConfigLoading, // 🆕 Include AFIP config loading
    error: error || fiscalError,

    // Actions
    actions,

    // Computed Data
    shouldShowOfflineView,
    taxConfiguration,
    alertsData
  };
};