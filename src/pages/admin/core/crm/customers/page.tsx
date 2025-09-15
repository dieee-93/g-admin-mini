import {
  ContentLayout, PageHeader, Section, StatsSection, CardGrid, MetricCard,
  Button, Alert, Badge
} from '@/shared/ui';
import {
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  PlusIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Import components - following the established pattern
// import { CustomersList } from './components';
// import { CustomerForm } from './components';
// import { RFMAnalysisPanel } from './components';
// import { CustomerSegmentationPanel } from './components';
// import { ChurnPredictionPanel } from './components';
// import { CustomerOrdersHistory } from './components';
// import { LoyaltyProgramPanel } from './components';

// Page orchestration hook
import { useCustomersPage } from './hooks';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

function CustomersPage() {
  // Page orchestration logic
  const {
    pageState,
    metrics,
    actions,
    loading,
    error
  } = useCustomersPage();

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
        title="Customers"
        subtitle="Advanced CRM with RFM Analytics & Intelligent Segmentation"
        actions={
          <>
            <Button
              variant="outline"
              colorPalette="blue"
              onClick={actions.handleRFMAnalysis}
              size="md"
            >
              <ChartBarIcon className="w-4 h-4" />
              RFM Analysis
            </Button>
            <Button
              variant="outline"
              colorPalette="green"
              onClick={actions.handleCustomerSegments}
              size="md"
            >
              <UserGroupIcon className="w-4 h-4" />
              Segmentation
            </Button>
            <Button
              variant="outline"
              colorPalette="red"
              onClick={actions.handleChurnPrediction}
              size="md"
            >
              <ExclamationTriangleIcon className="w-4 h-4" />
              Churn Risk
            </Button>
            <Button
              colorPalette="pink"
              onClick={actions.handleNewCustomer}
              size="md"
            >
              <PlusIcon className="w-4 h-4" />
              New Customer
            </Button>
          </>
        }
      />

      {/* Customer Metrics Overview */}
      <StatsSection>
        <CardGrid columns={{ base: 1, md: 4 }}>
          <MetricCard
            title="Total Customers"
            value={metrics.totalCustomers.toString()}
            subtitle="registered customers"
            icon={UsersIcon}
          />
          <MetricCard
            title="Active Customers"
            value={metrics.activeCustomers.toString()}
            subtitle="this month"
            icon={ArrowTrendingUpIcon}
            colorPalette="green"
          />
          <MetricCard
            title="Average CLV"
            value={DecimalUtils.formatCurrency(metrics.averageCLV)}
            subtitle="customer lifetime value"
            icon={CurrencyDollarIcon}
          />
          <MetricCard
            title="At Risk"
            value={metrics.atRiskCustomers.toString()}
            subtitle="churn risk"
            icon={ExclamationTriangleIcon}
            colorPalette={metrics.atRiskCustomers > 0 ? "red" : "green"}
          />
        </CardGrid>
      </StatsSection>

      {/* Customer Management Section */}
      <Section variant="elevated" title="Customer Management">
        {/* CustomersList component will go here */}
        <div>
          <p>Active customers: {metrics.activeCustomers}</p>
          <p>Customer management system running correctly.</p>
          {loading && (
            <Alert status="info" title="Loading data">
              Loading customer information...
            </Alert>
          )}
        </div>
      </Section>

      {/* Conditional RFM Analysis Section */}
      {pageState.showRFMAnalysis && (
        <Section variant="elevated" title="RFM Analysis">
          {/* RFMAnalysisPanel component will go here */}
          <div>
            <Badge colorPalette="blue" variant="subtle">Recency • Frequency • Monetary</Badge>
            <p>RFM analysis panel showing customer segmentation by purchase behavior.</p>
            <p>Customer retention rate: {metrics.customerRetentionRate}%</p>
          </div>
        </Section>
      )}

      {/* Conditional Customer Segmentation Section */}
      {pageState.showCustomerSegments && (
        <Section variant="elevated" title="Customer Segmentation">
          {/* CustomerSegmentationPanel component will go here */}
          <div>
            <Badge colorPalette="green" variant="subtle">AI-Powered Segments</Badge>
            <p>Intelligent customer segmentation with behavioral insights and recommendations.</p>
          </div>
        </Section>
      )}

      {/* Conditional Churn Prediction Section */}
      {pageState.showChurnPrediction && (
        <Section variant="elevated" title="Churn Risk Prediction">
          {/* ChurnPredictionPanel component will go here */}
          <div>
            <Badge colorPalette="red" variant="subtle">Predictive Analytics</Badge>
            <p>ML-based churn prediction with prevention recommendations.</p>
            <p>Current churn rate: {metrics.churnRate}%</p>
          </div>
        </Section>
      )}

      {/* Customer Orders History Section */}
      {pageState.activeSection === 'orders' && (
        <Section variant="elevated" title="Order History">
          {/* CustomerOrdersHistory component will go here */}
          <div>
            <p>Customer order history and purchase patterns.</p>
            <p>Average order value: {DecimalUtils.formatCurrency(metrics.averageOrderValue)}</p>
          </div>
        </Section>
      )}

      {/* Loyalty Program Section */}
      {pageState.activeSection === 'loyalty' && (
        <Section variant="elevated" title="Loyalty Program">
          {/* LoyaltyProgramPanel component will go here */}
          <div>
            <Badge colorPalette="purple" variant="subtle">Coming Soon</Badge>
            <p>Customer loyalty program with points and rewards management.</p>
          </div>
        </Section>
      )}

      {/* Customer Form Modal */}
      {/* <CustomerFormModal /> */}
    </ContentLayout>
  );
}

export default CustomersPage;
