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
  ContentLayout, Section, SkipLink,
  Button, Alert, Badge, HStack, Stack, Box, Text, SimpleGrid, Flex
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

      {/* Decorative background elements */}
      <Box position="fixed" top="-10%" right="-5%" w="500px" h="500px" borderRadius="full" bg="purple.50" opacity="0.4" filter="blur(80px)" pointerEvents="none" zIndex="-1" />
      <Box position="fixed" bottom="-10%" left="-5%" w="400px" h="400px" borderRadius="full" bg="pink.50" opacity="0.4" filter="blur(80px)" pointerEvents="none" zIndex="-1" />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="normal" mainLabel="Customer Management">

        {/* ✅ HEADER SECTION - Title and actions */}
        <Flex justify="space-between" align="center" flexWrap="wrap" gap="4" mb="6">
          <Flex align="center" gap="3">
            <Box bg="linear-gradient(135deg, var(--chakra-colors-pink-500) 0%, var(--chakra-colors-pink-600) 100%)" p="3" borderRadius="xl" shadow="lg">
              <Text fontSize="2xl">👥</Text>
            </Box>
            <Box>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" color="pink.600">
                Customers
              </Text>
              <Text color="text.muted" fontSize="sm">Advanced CRM with RFM Analytics & Intelligent Segmentation</Text>
            </Box>
          </Flex>

          <Flex gap="2" flexWrap="wrap">
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
          </Flex>
        </Flex>

        {/* ✅ METRICS SECTION - Gradient metric cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4" mb="6">
          {/* Total Customers */}
          <Box position="relative" overflow="hidden" bg="bg.surface" p="4" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
            <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-pink-400) 0%, var(--chakra-colors-pink-600) 100%)" />
            <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">Total Customers</Text>
            <Text fontSize="2xl" fontWeight="bold" color="pink.600">{metrics.totalCustomers}</Text>
            <Text fontSize="xs" color="text.muted" mt="1">registered customers</Text>
          </Box>

          {/* Active Customers */}
          <Box position="relative" overflow="hidden" bg="bg.surface" p="4" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
            <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-green-400) 0%, var(--chakra-colors-green-600) 100%)" />
            <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">Active Customers</Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">{metrics.activeCustomers}</Text>
            <Text fontSize="xs" color="text.muted" mt="1">this month</Text>
          </Box>

          {/* Average CLV */}
          <Box position="relative" overflow="hidden" bg="bg.surface" p="4" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
            <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-blue-400) 0%, var(--chakra-colors-blue-600) 100%)" />
            <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">Average CLV</Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">{DecimalUtils.formatCurrency(metrics.averageCLV)}</Text>
            <Text fontSize="xs" color="text.muted" mt="1">customer lifetime value</Text>
          </Box>

          {/* At Risk */}
          <Box position="relative" overflow="hidden" bg="bg.surface" p="4" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
            <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-red-400) 0%, var(--chakra-colors-red-600) 100%)" />
            <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">At Risk</Text>
            <Text fontSize="2xl" fontWeight="bold" color={metrics.atRiskCustomers > 0 ? "red.600" : "green.600"}>{metrics.atRiskCustomers}</Text>
            <Text fontSize="xs" color="text.muted" mt="1">churn risk</Text>
          </Box>
        </SimpleGrid>

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
