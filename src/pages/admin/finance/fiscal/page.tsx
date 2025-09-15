import {
  ContentLayout, PageHeader, Section, StatsSection, CardGrid, MetricCard,
  Button, Alert, Badge, Icon, Stack, Typography
} from '@/shared/ui';
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
  BuildingLibraryIcon,
  ReceiptTaxIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useFiscalPage } from './hooks';

export function FiscalPage() {
  const {
    pageState,
    metrics,
    isOnline,
    connectionQuality,
    isSyncing,
    queueSize,
    loading,
    error,
    actions,
    shouldShowOfflineView,
    alertsData
  } = useFiscalPage();

  if (loading) {
    return (
      <ContentLayout spacing="normal">
        <PageHeader
          title="Gestión Fiscal"
          subtitle="Cargando datos fiscales..."
          icon={BuildingLibraryIcon}
        />
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout spacing="normal">
        <PageHeader
          title="Gestión Fiscal"
          subtitle="Error al cargar datos"
          icon={BuildingLibraryIcon}
        />
        <Alert variant="subtle" title={error} />
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Gestión Fiscal"
        subtitle={
          <Stack direction="row" gap="sm" align="center">
            <Badge
              variant="solid"
              colorPalette={
                pageState.effectiveFiscalMode === 'online' ? 'green' :
                pageState.effectiveFiscalMode === 'hybrid' ? 'orange' : 'blue'
              }
            >
              {pageState.effectiveFiscalMode.toUpperCase()}
            </Badge>
            <Badge variant="solid" colorPalette={isOnline ? 'green' : 'red'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            <Typography variant="body" size="sm" color="text.muted">
              Control de facturación, impuestos y cumplimiento normativo
            </Typography>
          </Stack>
        }
        icon={BuildingLibraryIcon}
        actions={
          <Button variant="solid" onClick={actions.handleNewInvoice} size="lg">
            <Icon icon={DocumentTextIcon} size="sm" />
            Nueva Factura
          </Button>
        }
      />

      {/* Connection & Sync Status */}
      {(isSyncing || queueSize > 0) && (
        <Section variant="elevated" title="Estado de Sincronización">
          <Stack direction="row" gap="sm" align="center">
            {isSyncing && (
              <Badge colorPalette="blue" variant="subtle">
                <Icon icon={CloudIcon} size="sm" />
                Sincronizando
              </Badge>
            )}
            {queueSize > 0 && (
              <Badge colorPalette="orange" variant="subtle">
                {queueSize} pendientes
              </Badge>
            )}
            <Typography variant="body" color="text.muted">
              Conexión: {connectionQuality}
            </Typography>
          </Stack>
        </Section>
      )}

      {/* Fiscal Metrics Dashboard */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          <MetricCard
            title="Facturación Mes"
            value={`$${metrics.facturacionMesActual.toLocaleString('es-AR')}`}
            icon={BanknotesIcon}
            colorPalette="green"
            trend={{ value: metrics.crecimientoFacturacion, isPositive: metrics.crecimientoFacturacion > 0 }}
          />
          <MetricCard
            title="Facturas Generadas"
            value={metrics.facturasEmitidasMes}
            icon={DocumentTextIcon}
            colorPalette="blue"
          />
          <MetricCard
            title="IVA Recaudado"
            value={`$${metrics.totalIVARecaudado.toFixed(2)}`}
            icon={ReceiptTaxIcon}
            colorPalette="purple"
          />
          <MetricCard
            title="Próximo Vencimiento"
            value={metrics.proximoVencimiento}
            icon={CalendarDaysIcon}
            colorPalette="orange"
          />
        </CardGrid>
      </StatsSection>

      {/* AFIP Integration Metrics */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          <MetricCard
            title="Estado AFIP"
            value={metrics.afipConnectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            icon={CogIcon}
            colorPalette={metrics.afipConnectionStatus === 'connected' ? 'green' : 'red'}
          />
          <MetricCard
            title="CAE Generados"
            value={metrics.caeGenerados}
            icon={CheckCircleIcon}
            colorPalette="green"
          />
          <MetricCard
            title="CAE Pendientes"
            value={metrics.caePendientes}
            icon={ExclamationTriangleIcon}
            colorPalette={metrics.caePendientes > 0 ? 'orange' : 'green'}
          />
          <MetricCard
            title="Cumplimiento Fiscal"
            value={`${metrics.cumplimientoFiscal}%`}
            icon={BuildingLibraryIcon}
            colorPalette={metrics.cumplimientoFiscal >= 90 ? 'green' : 'orange'}
            trend={{ value: metrics.cumplimientoFiscal, isPositive: metrics.cumplimientoFiscal >= 90 }}
          />
        </CardGrid>
      </StatsSection>

      {/* Financial Analysis Metrics */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          <MetricCard
            title="Flujo Efectivo Mensual"
            value={`$${metrics.flujoEfectivoMensual.toFixed(2)}`}
            icon={CurrencyDollarIcon}
            colorPalette="teal"
            trend={{ value: metrics.flujoEfectivoMensual, isPositive: metrics.flujoEfectivoMensual > 0 }}
          />
          <MetricCard
            title="Posición Efectivo"
            value={`$${metrics.posicionEfectivo.toFixed(2)}`}
            icon={ArrowTrendingUpIcon}
            colorPalette="cyan"
          />
          <MetricCard
            title="Ratio Liquidez"
            value={metrics.ratioLiquidez.toFixed(2)}
            icon={CheckCircleIcon}
            colorPalette={metrics.ratioLiquidez >= 1.5 ? 'green' : 'orange'}
          />
          <MetricCard
            title="Margen Operativo"
            value={`${(metrics.margenOperativo * 100).toFixed(1)}%`}
            icon={ArrowTrendingUpIcon}
            colorPalette="purple"
            trend={{ value: metrics.margenOperativo, isPositive: metrics.margenOperativo > 0.15 }}
          />
        </CardGrid>
      </StatsSection>

      {/* Alerts Section */}
      {alertsData.length > 0 && (
        <Section variant="elevated" title="Alertas y Notificaciones">
          <Stack direction="column" gap="sm">
            {alertsData.map((alert, index) => (
              <Alert
                key={index}
                variant="subtle"
                title={alert.message}
                icon={<Icon icon={ExclamationTriangleIcon} size="sm" />}
              >
                {alert.action}
              </Alert>
            ))}
          </Stack>
        </Section>
      )}

      {/* Fiscal Mode Configuration */}
      <Section variant="elevated" title="Configuración del Modo Fiscal">
        <Typography variant="body" color="text.muted" mb="md">
          Configura cómo el sistema maneja las operaciones fiscales según la conectividad
        </Typography>
        <Stack direction="row" gap="md" flexWrap="wrap">
          <Button
            variant={pageState.fiscalMode === 'offline-first' ? 'solid' : 'outline'}
            colorPalette="blue"
            onClick={() => actions.setFiscalMode('offline-first')}
            flex="1"
            minW="200px"
          >
            Offline First
          </Button>
          <Button
            variant={pageState.fiscalMode === 'auto' ? 'solid' : 'outline'}
            colorPalette="blue"
            onClick={() => actions.setFiscalMode('auto')}
            flex="1"
            minW="200px"
          >
            Automático
          </Button>
          <Button
            variant={pageState.fiscalMode === 'online-first' ? 'solid' : 'outline'}
            colorPalette="green"
            onClick={() => actions.setFiscalMode('online-first')}
            flex="1"
            minW="200px"
          >
            Online First
          </Button>
        </Stack>
      </Section>

      {/* Invoice Management Section */}
      <Section variant="elevated" title="Gestión de Facturas">
        <Stack direction="row" gap="md" flexWrap="wrap">
          <Button
            variant="outline"
            onClick={actions.handleNewInvoice}
            flex="1"
            minW="200px"
          >
            <Icon icon={DocumentTextIcon} size="sm" />
            Nueva Factura
          </Button>
          <Button
            variant="outline"
            onClick={actions.handleBulkInvoicing}
            flex="1"
            minW="200px"
          >
            <Icon icon={DocumentTextIcon} size="sm" />
            Facturación Masiva
          </Button>
        </Stack>
      </Section>

      {/* AFIP Integration Section */}
      <Section variant="elevated" title="Integración AFIP">
        <Stack direction="row" gap="md" flexWrap="wrap">
          <Button
            variant="outline"
            onClick={actions.handleAFIPSync}
            disabled={!isOnline}
            flex="1"
            minW="200px"
          >
            <Icon icon={CloudIcon} size="sm" />
            Sincronizar AFIP
          </Button>
          <Button
            variant="outline"
            onClick={actions.handleAFIPStatusCheck}
            flex="1"
            minW="200px"
          >
            <Icon icon={CogIcon} size="sm" />
            Estado AFIP
          </Button>
        </Stack>
      </Section>

      {/* Compliance & Reporting Section */}
      <Section variant="flat" title="Cumplimiento y Reportes">
        <Stack direction="row" gap="md" flexWrap="wrap">
          <Button
            variant="outline"
            onClick={actions.handleComplianceCheck}
            flex="1"
            minW="200px"
          >
            <Icon icon={ExclamationTriangleIcon} size="sm" />
            Verificar Cumplimiento
          </Button>
          <Button
            variant="outline"
            onClick={() => actions.handleGenerateReport('tax', 'month')}
            flex="1"
            minW="200px"
          >
            <Icon icon={ChartBarIcon} size="sm" />
            Reporte Fiscal
          </Button>
          <Button
            variant="outline"
            onClick={() => actions.handleExportData('pdf')}
            flex="1"
            minW="200px"
          >
            <Icon icon={DocumentTextIcon} size="sm" />
            Exportar Datos
          </Button>
        </Stack>
      </Section>

      {/* Financial Analysis Section */}
      {pageState.showAnalytics && (
        <Section variant="elevated" title="Análisis Financiero">
          <Stack direction="row" gap="md" flexWrap="wrap">
            <Button
              variant="outline"
              onClick={actions.handleCashFlowAnalysis}
              flex="1"
              minW="200px"
            >
              <Icon icon={CurrencyDollarIcon} size="sm" />
              Análisis Flujo de Efectivo
            </Button>
            <Button
              variant="outline"
              onClick={actions.handleProfitabilityAnalysis}
              flex="1"
              minW="200px"
            >
              <Icon icon={ArrowTrendingUpIcon} size="sm" />
              Análisis Rentabilidad
            </Button>
            <Button
              variant="outline"
              onClick={actions.handleBudgetVarianceAnalysis}
              flex="1"
              minW="200px"
            >
              <Icon icon={ChartBarIcon} size="sm" />
              Análisis Presupuesto
            </Button>
          </Stack>
        </Section>
      )}

      {/* Quick Actions */}
      <Section variant="flat" title="Acciones Rápidas">
        <Stack direction="row" gap="md" flexWrap="wrap">
          <Button
            variant="outline"
            onClick={actions.toggleAnalytics}
            flex="1"
            minW="200px"
          >
            <Icon icon={ChartBarIcon} size="sm" />
            {pageState.showAnalytics ? 'Ocultar' : 'Ver'} Analytics
          </Button>
          <Button
            variant="outline"
            onClick={actions.handleBulkTaxUpdate}
            flex="1"
            minW="200px"
          >
            <Icon icon={ReceiptTaxIcon} size="sm" />
            Actualizar Impuestos
          </Button>
        </Stack>
      </Section>
    </ContentLayout>
  );
}

export default FiscalPage;
