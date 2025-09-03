// ReportingPage.tsx - Advanced Reporting Tools
import React from 'react';
import { 
  Layout, Stack, Typography, CardWrapper, SimpleGrid, Button, Icon
} from '@/shared/ui';
import { 
  DocumentChartBarIcon,
  TableCellsIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const ReportingPage: React.FC = () => {
  return (
    <Layout variant="page" p="xl">
      <Stack gap="xl">
        <Stack gap="sm">
          <Typography variant="heading" size="xl">Advanced Reporting</Typography>
          <Typography variant="body" color="text.secondary">
            Custom reports and data visualization tools
          </Typography>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="xl">
          <CardWrapper variant="elevated">
            <CardWrapper.Header>
              <Stack direction="row" gap="sm" align="center">
                <Icon icon={DocumentChartBarIcon} size="md"/>
                <Typography variant="body" fontWeight="semibold">Sales Reports</Typography>
              </Stack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <Stack gap="md">
                <Typography variant="body" size="sm" color="text.secondary">
                  Comprehensive sales analytics and performance reports
                </Typography>
                <Button size="sm" variant="outline" >
                  Generate Report
                </Button>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="elevated" >
            <CardWrapper.Header>
              <Stack direction="row" gap="sm" align="center">
                <Icon icon={TableCellsIcon} size="md"  />
                <Typography variant="body" fontWeight="semibold">Inventory Reports</Typography>
              </Stack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <Stack gap="md">
                <Typography variant="body" size="sm" color="text.secondary">
                  Stock levels, movements, and inventory analytics
                </Typography>
                <Button size="sm" variant="outline" >
                  Generate Report
                </Button>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="elevated" >
            <CardWrapper.Header>
              <Stack direction="row" gap="sm" align="center">
                <Icon icon={ChartBarIcon} size="md"  />
                <Typography variant="body" fontWeight="semibold">Financial Reports</Typography>
              </Stack>
            </CardWrapper.Header>
            <CardWrapper.Body  >
              <Stack gap="md">
                <Typography variant="body" size="sm" color="text.secondary">
                  P&L, balance sheets, and financial analytics
                </Typography>
                <Button size="sm" variant="outline" >
                  Generate Report
                </Button>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="elevated" >
            <CardWrapper.Header>
              <Stack direction="row" gap="sm" align="center">
                <Icon icon={CalendarDaysIcon} size="md" color="warning.500" />
                <Typography variant="body" fontWeight="semibold">Custom Reports</Typography>
              </Stack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <Stack gap="md">
                <Typography variant="body" size="sm" color="text.secondary">
                  Build custom reports with flexible parameters
                </Typography>
                <Button size="sm" variant="outline" >
                  Report Builder
                </Button>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>
        </SimpleGrid>
        <CardWrapper variant="elevated">
          <CardWrapper.Header>
            <Typography variant="heading" size="md">Reporting Features</Typography>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="md">
              <Stack gap="sm">
                <Typography variant="body" fontWeight="medium">Available Features:</Typography>
                <Typography variant="body" size="sm">📊 Data Visualization</Typography>
                <Typography variant="body" size="sm">📅 Scheduled Reports</Typography>
                <Typography variant="body" size="sm">📤 Export to PDF/Excel</Typography>
                <Typography variant="body" size="sm">📧 Email Delivery</Typography>
              </Stack>
              <Stack gap="sm">
                <Typography variant="body" fontWeight="medium">Coming Soon:</Typography>
                <Typography variant="body" size="sm">🤖 AI-Generated Insights</Typography>
                <Typography variant="body" size="sm">📈 Predictive Analytics</Typography>
                <Typography variant="body" size="sm">🔄 Real-time Dashboards</Typography>
                <Typography variant="body" size="sm">🎯 Custom KPI Tracking</Typography>
              </Stack>
            </SimpleGrid>
          </CardWrapper.Body>
        </CardWrapper>
      </Stack>
    </Layout>
  );
};

export default ReportingPage;
export { ReportingPage };