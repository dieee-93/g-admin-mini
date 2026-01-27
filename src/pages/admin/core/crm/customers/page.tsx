/**
 * Customers Page - Advanced CRM with RFM Analytics
 *
 * SEMANTIC v3.0 - WCAG AA Compliant:
 * ✅ Skip link for keyboard navigation (WCAG 2.4.1 Level A)
 * ✅ Semantic main content wrapper with ARIA label
 * ✅ Proper section headings for screen readers
 * ✅ Aside pattern for metrics
 * ✅ Article pattern for analysis panels
 * ✅ 3-Layer Architecture (Semantic → Layout → Primitives)
 *
 * FEATURES:
 * - RFM Analysis (Recency, Frequency, Monetary)
 * - Customer Segmentation
 * - Churn Prediction
 * - Loyalty Program
 */

import {
  ContentLayout, Section, CardGrid, MetricCard, SkipLink,
  Button, Alert, Badge, HStack, Stack
} from '@/shared/ui';
import {
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Import components - following the established pattern
import { CustomerList, CustomerAnalytics } from './components';
// import { CustomerForm } from './components'; // TODO: Integrate form modal when needed
// import { CustomerSegments } from './components'; // Part of CustomerAnalytics
// import { CustomerOrdersHistory } from './components'; // TODO: Integrate with Sales module
// import { LoyaltyProgramPanel } from './components'; // TODO: Phase 4 feature

// Page orchestration hook
import { useCustomersPage } from './hooks';
import { DecimalUtils } from '@/lib/decimal';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks';

function CustomersPage() {
  // Authentication and permissions
  const { user } = useAuth();

  // ✅ PERMISSIONS: Use usePermissions hook for granular access control
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canExport,
  } = usePermissions('customers');

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
      <>
        <SkipLink />
        <ContentLayout spacing="normal" mainLabel="Customer Management Error">
          <Alert status="error" title="Error de carga">
            {error}
          </Alert>
          <Button onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </ContentLayout>
      </>
    );
  }

  return (
    <>
      {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
      <SkipLink />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="normal" mainLabel="Customer Management">

        {/* ✅ HEADER SECTION - Title and actions */}
        <Section
          variant="flat"
          title="Customers"
          subtitle="Advanced CRM with RFM Analytics & Intelligent Segmentation"
          semanticHeading="Customer Relationship Management Dashboard"
          actions={
            <HStack gap="2">
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
              {canCreate && (
                <Button
                  colorPalette="pink"
                  onClick={actions.handleNewCustomer}
                  size="md"
                >
                  <PlusIcon className="w-4 h-4" />
                  New Customer
                </Button>
              )}
            </HStack>
          }
        />

        {/* ✅ METRICS SECTION - Complementary aside pattern */}
        <Section
          as="aside"
          variant="flat"
          semanticHeading="Customer Metrics Overview"
        >
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
        </Section>

        {/* ✅ CUSTOMER MANAGEMENT SECTION - Main content area */}
        <Section
          variant="elevated"
          title="Customer Management"
          semanticHeading="Customer Directory and Management Tools"
        >
          {loading ? (
            <Stack gap="4">
              <Alert status="info" title="Loading data">
                Loading customer information...
              </Alert>
            </Stack>
          ) : (
            <CustomerList />
          )}
        </Section>

        {/* ✅ CONDITIONAL RFM ANALYSIS - Article pattern for self-contained content */}
        {pageState.showRFMAnalysis && (
          <Section
            as="article"
            variant="elevated"
            title="RFM Analysis"
            semanticHeading="Customer RFM Analysis Dashboard"
          >
            <CustomerAnalytics />
          </Section>
        )}

        {/* ✅ CONDITIONAL CUSTOMER SEGMENTATION - Article pattern */}
        {pageState.showCustomerSegments && (
          <Section
            as="article"
            variant="elevated"
            title="Customer Segmentation"
            semanticHeading="AI-Powered Customer Segmentation Analysis"
          >
            {/* CustomerSegmentationPanel component will go here */}
            <Stack gap="4">
              <Badge colorPalette="green" variant="subtle">AI-Powered Segments</Badge>
              <p>Intelligent customer segmentation with behavioral insights and recommendations.</p>
            </Stack>
          </Section>
        )}

        {/* ✅ CONDITIONAL CHURN PREDICTION - Article pattern */}
        {pageState.showChurnPrediction && (
          <Section
            as="article"
            variant="elevated"
            title="Churn Risk Prediction"
            semanticHeading="Customer Churn Risk Prediction Dashboard"
          >
            {/* ChurnPredictionPanel component will go here */}
            <Stack gap="4">
              <Badge colorPalette="red" variant="subtle">Predictive Analytics</Badge>
              <p>ML-based churn prediction with prevention recommendations.</p>
              <p>Current churn rate: {metrics.churnRate}%</p>
            </Stack>
          </Section>
        )}

        {/* ✅ CONDITIONAL ORDER HISTORY - Article pattern */}
        {pageState.activeSection === 'orders' && (
          <Section
            as="article"
            variant="elevated"
            title="Order History"
            semanticHeading="Customer Order History and Purchase Patterns"
          >
            {/* CustomerOrdersHistory component will go here */}
            <Stack gap="4">
              <p>Customer order history and purchase patterns.</p>
              <p>Average order value: {DecimalUtils.formatCurrency(metrics.averageOrderValue)}</p>
            </Stack>
          </Section>
        )}

        {/* ✅ CONDITIONAL LOYALTY PROGRAM - Article pattern */}
        {pageState.activeSection === 'loyalty' && (
          <Section
            as="article"
            variant="elevated"
            title="Loyalty Program"
            semanticHeading="Customer Loyalty Program Management"
          >
            {/* LoyaltyProgramPanel component will go here */}
            <Stack gap="4">
              <Badge colorPalette="purple" variant="subtle">Coming Soon</Badge>
              <p>Customer loyalty program with points and rewards management.</p>
            </Stack>
          </Section>
        )}

        {/* Customer Form Modal */}
        {/* <CustomerFormModal /> */}

      </ContentLayout>
    </>
  );
}

export default CustomersPage;
