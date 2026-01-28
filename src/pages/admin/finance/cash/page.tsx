/**
 * Cash Management Page
 * Gestión de Efectivo y Sesiones de Caja
 *
 * SEMANTIC v3.0 - WCAG AA Compliant
 * Following materials module pattern
 *
 * FEATURES:
 * - Cash session management (open/close with blind counting)
 * - Multi-location support
 * - Real-time balance tracking
 * - EventBus integration
 * - Offline-first support
 * - DecimalUtils for precision
 */

import { useEffect, memo, useState } from 'react';
import {
  ContentLayout,
  Section,
  Button,
  Alert,
  Icon,
  Stack,
  SkipLink,
  Tabs,
} from '@/shared/ui';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// Systems integration
import EventBus from '@/lib/events';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { useNavigationLayout } from '@/contexts/NavigationContext';
import { useLocation } from '@/contexts/LocationContext';

// Components
import {
  CashMetrics,
  CashSessionManager,
  OpenSessionModal,
  CloseSessionModal,
  JournalEntriesViewer,
  ReportFilters,
  BalanceSheetReport,
  CashFlowReport,
  ProfitAndLossReport,
  SessionHistoryTable,
} from './components';

// Hooks
import { useCashPage } from './hooks';
import { logger } from '@/lib/logging';

// Reports
import {
  generateBalanceSheet,
  generateCashFlowStatement,
  generateProfitAndLoss,
  fetchSessionHistory,
} from '@/modules/accounting/services/reportsService';
import type {
  BalanceSheet,
  CashFlowStatement,
  ProfitAndLoss,
  SessionHistoryReport,
} from '@/modules/accounting/types/reports';

// Event handlers (module-level to prevent recreation)
const eventHandlers = {
  'sales.payment.completed': async (data: Record<string, unknown>) => {
    logger.info('CashModule', '💰 Payment completed, updating session...', data);
    // In production: update cash_sales in active session
  },

  'sales.order_cancelled': async (data: Record<string, unknown>) => {
    logger.info('CashModule', '♻️ Sale cancelled, reversing cash...', data);
    // In production: reverse cash_sales
  },
} as const;

// Module configuration
const CASH_MODULE_CONFIG = {
  capabilities: ['cash_management', 'session_control', 'blind_counting'],
  events: {
    emits: [
      'cash.session.opened',
      'cash.session.closed',
      'cash.drop.recorded',
      'cash.discrepancy.detected',
    ],
    subscribes: ['sales.payment.completed', 'sales.order_cancelled'],
  },
} as const;

function CashManagementPageComponent() {
  const { selectedLocationId } = useLocation();
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();

  // Main hook
  const {
    pageState,
    metrics,
    loading,
    error,
    moneyLocations,
    activeSessions,
    actions,
    openModal,
    closeModal,
  } = useCashPage();

  // Reports state
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowStatement | null>(null);
  const [profitLoss, setProfitLoss] = useState<ProfitAndLoss | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Generate report handler
  const handleGenerateReport = async (filters: {
    reportType: 'balance-sheet' | 'cash-flow' | 'profit-loss' | 'session-history';
    period?: string;
    startDate?: string;
    endDate?: string;
    asOfDate?: string;
  }) => {
    setReportLoading(true);
    try {
      logger.info('CashModule', 'Generating report', filters);

      switch (filters.reportType) {
        case 'balance-sheet': {
          const data = await generateBalanceSheet(filters.asOfDate);
          setBalanceSheet(data);
          break;
        }
        case 'cash-flow': {
          if (filters.startDate && filters.endDate) {
            const data = await generateCashFlowStatement(
              filters.startDate,
              filters.endDate
            );
            setCashFlow(data);
          }
          break;
        }
        case 'profit-loss': {
          if (filters.startDate && filters.endDate) {
            const data = await generateProfitAndLoss(
              filters.startDate,
              filters.endDate
            );
            setProfitLoss(data);
          }
          break;
        }
        case 'session-history': {
          const data = await fetchSessionHistory({
            startDate: filters.startDate,
            endDate: filters.endDate,
          });
          setSessionHistory(data);
          break;
        }
      }
    } catch (err) {
      logger.error('CashModule', 'Failed to generate report', { error: err });
    } finally {
      setReportLoading(false);
    }
  };


  // Register event handlers
  useEffect(() => {
    const unsubscribe: (() => void)[] = [];

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      unsubscribe.push(EventBus.on(event, handler));
    });

    logger.info('CashModule', 'Event handlers registered', {
      events: Object.keys(eventHandlers),
    });

    return () => {
      unsubscribe.forEach((fn) => fn());
      logger.info('CashModule', 'Event handlers unregistered');
    };
  }, []);

  return (
    <>
      <SkipLink targetId="main-content">
        Saltar al contenido principal
      </SkipLink>

      <ContentLayout spacing="normal" mainLabel="Cash Management">
        {/* METRICS ASIDE */}
        {/* METRICS SECTION */}
        <Section
          as="aside"
          variant="flat"
          semanticHeading="Cash Management Metrics"
        >
          <CashMetrics
            metrics={metrics}
            onMetricClick={(type) =>
              logger.debug('CashModule', 'Metric clicked', { type })
            }
            loading={loading}
          />
        </Section>

        {/* MAIN CONTENT */}
        
          <Section
            title="Gestión de Efectivo"
            actions={
              <Stack direction="row" gap={2}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={actions.handleRefresh}
                  disabled={loading}
                >
                  <Icon>
                    <ArrowPathIcon />
                  </Icon>
                  Actualizar
                </Button>
              </Stack>
            }
          >
            {/* Offline warning */}
            {!isOnline && (
              <Alert status="warning" title="Modo Sin Conexión" mb={4}>
                Estás trabajando sin conexión. Los cambios se sincronizarán
                automáticamente.
              </Alert>
            )}

            {/* Error alert */}
            {error && (
              <Alert status="error" title="Error" mb={4}>
                {error}
              </Alert>
            )}

            {/* Tabs */}
            <Tabs.Root
              value={pageState.activeTab}
              onValueChange={(details) =>
                actions.handleTabChange(
                  details.value as typeof pageState.activeTab
                )
              }
              variant="enclosed"
            >
              <Tabs.List>
                <Tabs.Trigger value="sessions">
                  Sesiones de Caja ({activeSessions.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="locations">
                  Ubicaciones ({moneyLocations.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="accounts">Plan de Cuentas</Tabs.Trigger>
                <Tabs.Trigger value="journal">Asientos Contables</Tabs.Trigger>
                <Tabs.Trigger value="reports">Reportes</Tabs.Trigger>
                <Tabs.Trigger value="history">Historial</Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="sessions">
                <Stack gap={4} py={4}>
                  <CashSessionManager
                    moneyLocations={moneyLocations}
                    activeSessions={activeSessions}
                    onOpenSession={openModal.onOpen}
                    onCloseSession={closeModal.onOpen}
                    loading={loading}
                  />
                </Stack>
              </Tabs.Content>

              <Tabs.Content value="locations">
                <Stack gap={4} py={4}>
                  {/* Money locations list */}
                  <Alert status="info">
                    Vista de ubicaciones (por implementar)
                  </Alert>
                </Stack>
              </Tabs.Content>

              <Tabs.Content value="accounts">
                <Stack gap={4} py={4}>
                  {/* Chart of accounts tree */}
                  <Alert status="info">
                    Plan de cuentas (por implementar)
                  </Alert>
                </Stack>
              </Tabs.Content>

              <Tabs.Content value="journal">
                <Stack gap={4} py={4}>
                  {/* Journal entries viewer */}
                  <JournalEntriesViewer limit={100} />
                </Stack>
              </Tabs.Content>

              <Tabs.Content value="reports">
                <Stack gap={4} py={4}>
                  {/* Report Filters */}
                  <ReportFilters
                    onGenerateReport={handleGenerateReport}
                    isLoading={reportLoading}
                  />

                  {/* Reports Display */}
                  {balanceSheet && (
                    <BalanceSheetReport data={balanceSheet} />
                  )}
                  {cashFlow && <CashFlowReport data={cashFlow} />}
                  {profitLoss && <ProfitAndLossReport data={profitLoss} />}
                  {sessionHistory && (
                    <SessionHistoryTable data={sessionHistory} />
                  )}
                </Stack>
              </Tabs.Content>

              <Tabs.Content value="history">
                <Stack gap={4} py={4}>
                  {/* Session history */}
                  <Alert status="info">
                    Historial de sesiones (por implementar)
                  </Alert>
                </Stack>
              </Tabs.Content>
            </Tabs.Root>
          </Section>
        
      </ContentLayout>

      {/* MODALS */}
      <OpenSessionModal
        isOpen={openModal.isOpen}
        location={openModal.location}
        onClose={openModal.onClose}
        onConfirm={openModal.onConfirm}
        isLoading={loading}
      />

      <CloseSessionModal
        isOpen={closeModal.isOpen}
        session={closeModal.session}
        onClose={closeModal.onClose}
        onConfirm={closeModal.onConfirm}
        isLoading={loading}
      />
    </>
  );
}

// Memoize component
export const CashManagementPage = memo(CashManagementPageComponent);
CashManagementPage.displayName = 'CashManagementPage';

// Default export for React Router
export default CashManagementPage;
