import {
  ContentLayout, PageHeader, Section, StatsSection, CardGrid, MetricCard,
  Button, Alert
} from '@/shared/ui';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  PlusIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

// Import components
import {
  MaterialsList,
  Overview,
  AlertsTab,
  SmartAlertsTab,
  MaterialsView,
  PredictiveAnalytics
} from './components';

// Page orchestration hook
import { useMaterialsPage } from './hooks';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

function MaterialsPage() {
  // Page orchestration logic
  const {
    pageState,
    metrics,
    actions,
    loading,
    error
  } = useMaterialsPage();

  if (error) {
    return (
      <ContentLayout spacing="normal">
        <Alert status="error" title="Error de carga">
          {error}
        </Alert>
        <Button onClick={() => window.location.reload()}>
          Recargar página
        </Button>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Materials"
        subtitle="Inventory control & raw materials management"
        actions={
          <>
            <Button
              variant="outline"
              colorPalette="blue"
              onClick={actions.handleABCAnalysis}
              size="md"
            >
              <ChartBarIcon className="w-4 h-4" />
              ABC Analysis
            </Button>
            <Button
              variant="outline"
              colorPalette="green"
              onClick={actions.handleProcurement}
              size="md"
            >
              <ClipboardDocumentListIcon className="w-4 h-4" />
              Procurement
            </Button>
            <Button
              variant="outline"
              colorPalette="yellow"
              onClick={actions.handlePredictiveAnalytics}
              size="md"
            >
              <LightBulbIcon className="w-4 h-4" />
              Predictive
            </Button>
            <Button
              colorPalette="purple"
              onClick={actions.handleNewMaterial}
              size="md"
            >
              <PlusIcon className="w-4 h-4" />
              New Material
            </Button>
          </>
        }
      />

      {/* Metrics Overview Section */}
      <StatsSection>
        <CardGrid columns={{ base: 1, md: 4 }}>
          <MetricCard
            title="Total Items"
            value={metrics.totalItems.toString()}
            subtitle="in inventory"
            icon={CubeIcon}
          />
          <MetricCard
            title="Low Stock"
            value={metrics.lowStockItems.toString()}
            subtitle="need attention"
            icon={ExclamationTriangleIcon}
            colorPalette={metrics.criticalStockItems > 0 ? "red" : "yellow"}
          />
          <MetricCard
            title="Total Value"
            value={DecimalUtils.formatCurrency(metrics.totalValue)}
            subtitle="inventory value"
            icon={CurrencyDollarIcon}
          />
          <MetricCard
            title="Suppliers"
            value={metrics.supplierCount.toString()}
            subtitle="active suppliers"
            icon={BuildingStorefrontIcon}
          />
        </CardGrid>
      </StatsSection>

      {/* Overview Section */}
      <Overview
        onAddItem={actions.handleNewMaterial}
        onShowAnalytics={actions.handleABCAnalysis}
      />

      {/* Materials List Section */}
      <MaterialsList />

      {/* Conditional ABC Analysis Section */}
      {pageState.showABCAnalysis && (
        <Section variant="elevated" title="ABC Analysis">
          {/* ABCAnalysisPanel component will go here */}
          <div>
            <p>ABC Analysis panel - showing classification of materials by value and usage.</p>
          </div>
        </Section>
      )}

      {/* Conditional Procurement Section */}
      {pageState.showProcurement && (
        <Section variant="elevated" title="Procurement Recommendations">
          {/* ProcurementPanel component will go here */}
          <div>
            <p>Procurement recommendations based on stock levels and demand forecasting.</p>
          </div>
        </Section>
      )}

      {/* Conditional Supply Chain Section */}
      {pageState.showSupplyChain && (
        <Section variant="elevated" title="Supply Chain Analysis">
          {/* SupplyChainPanel component will go here */}
          <div>
            <p>Supply chain analysis and supplier performance metrics.</p>
          </div>
        </Section>
      )}

      {/* Conditional Predictive Analytics Section */}
      {pageState.showPredictiveAnalytics && (
        <Section variant="elevated" title="Predictive Analytics">
          <PredictiveAnalytics />
        </Section>
      )}

      {/* Material Form Modal */}
      {/* <MaterialFormModal /> */}
    </ContentLayout>
  );
}

export default MaterialsPage;