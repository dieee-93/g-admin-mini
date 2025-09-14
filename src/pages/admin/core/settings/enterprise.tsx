// EnterprisePage.tsx - Enterprise Management Tools
import React from 'react';
import { 
  Layout, Stack, Typography, CardWrapper, SimpleGrid, Badge, Icon
} from '@/shared/ui';
import { 
  BuildingOfficeIcon,
  GlobeAltIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const EnterprisePage: React.FC = () => {
  return (
    <Layout variant="page" p="xl">
      <Stack gap="xl">
        <Stack gap="sm">
          <Typography variant="heading" size="xl">Enterprise Management</Typography>
          <Typography variant="body" color="text.secondary">
            Multi-location and enterprise-level features
          </Typography>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="md">
          <CardWrapper variant="elevated" >
            <CardWrapper.Body>
              <Stack direction="row" gap="sm" align="center">
                <Icon icon={BuildingOfficeIcon} size="lg"/>
                <Stack gap="xs">
                  <Typography variant="body" size="sm" fontWeight="semibold">Locations</Typography>
                  <Badge colorPalette="info" size="sm">5 Active</Badge>
                </Stack>
              </Stack>
            </CardWrapper.Body>
            </CardWrapper>
          
          <CardWrapper variant="elevated">
            <CardWrapper.Body>
              <Stack direction="row" gap="sm" align="center">
                <Icon icon={UsersIcon} size="lg" />
                <Stack gap="xs">
                  <Typography variant="body" size="sm" fontWeight="semibold">Franchise</Typography>
                  <Badge colorPalette="success" size="sm">3 Partners</Badge>
                </Stack>
              </Stack>
            </CardWrapper.Body>
            </CardWrapper>

          <CardWrapper variant="elevated" >
            <CardWrapper.Body>
              <Stack direction="row" gap="sm" align="center">
                <Icon icon={GlobeAltIcon} size="lg" />
                <Stack gap="xs">
                  <Typography variant="body" size="sm" fontWeight="semibold">Regions</Typography>
                  <Badge size="sm">2 Zones</Badge>
                </Stack>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="elevated" >
            <CardWrapper.Body>
              <Stack direction="row" gap="sm" align="center">
                <Icon icon={GlobeAltIcon} size="lg" />
                <Stack gap="xs">
                  <Typography variant="body" size="sm" fontWeight="semibold">Regions</Typography>
                  <Badge size="sm">2 Zones</Badge>
                </Stack>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="elevated" >
            <CardWrapper.Body>
              <Stack direction="row" gap="sm" align="center">
                <Icon icon={ChartBarIcon} size="lg" color="warning.500" />
                <Stack gap="xs">
                  <Typography variant="body" size="sm" fontWeight="semibold">Analytics</Typography>
                  <Badge colorPalette="warning" size="sm">Consolidated</Badge>
                </Stack>
              </Stack>
            </CardWrapper.Body>
            </CardWrapper>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="xl">
          <CardWrapper variant="elevated" >
            <CardWrapper.Header>
              <Typography variant="body" fontWeight="semibold">Multi-Location Features</Typography>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <Stack gap="sm">
                <Typography variant="body" size="sm">🏢 Location Management</Typography>
                <Typography variant="body" size="sm">📊 Consolidated Reporting</Typography>
                <Typography variant="body" size="sm">👥 Cross-Location Staff</Typography>
                <Typography variant="body" size="sm">📦 Centralized Inventory</Typography>
                <Typography variant="body" size="sm">💰 Unified Pricing</Typography>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="elevated" >
            <CardWrapper.Header>
              <Typography variant="body" fontWeight="semibold">Franchise Management</Typography>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <Stack gap="sm">
                <Typography variant="body" size="sm">🤝 Partner Onboarding</Typography>
                <Typography variant="body" size="sm">📈 Performance Monitoring</Typography>
                <Typography variant="body" size="sm">💼 Brand Compliance</Typography>
                <Typography variant="body" size="sm">📋 Standards Enforcement</Typography>
                <Typography variant="body" size="sm">💡 Best Practice Sharing</Typography>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>
        </SimpleGrid>

        <CardWrapper variant="elevated" >
          <CardWrapper.Header>
            <Typography variant="heading" size="md">Enterprise Analytics</Typography>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack gap="md">
              <Typography variant="body" color="text.secondary">
                Comprehensive analytics across all locations and franchise partners
              </Typography>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap="md">
                <Stack gap="xs">
                  <Typography variant="body" fontWeight="medium">Performance Metrics</Typography>
                  <Typography variant="body" size="sm" color="text.secondary">Cross-location KPIs</Typography>
                </Stack>
                <Stack gap="xs">
                  <Typography variant="body" fontWeight="medium">Benchmarking</Typography>
                  <Typography variant="body" size="sm" color="text.secondary">Location comparisons</Typography>
                </Stack>
                <Stack gap="xs">
                  <Typography variant="body" fontWeight="medium">Forecasting</Typography>
                  <Typography variant="body" size="sm" color="text.secondary">Enterprise predictions</Typography>
                </Stack>
              </SimpleGrid>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      </Stack>
    </Layout>
  );
};

export default EnterprisePage;
export { EnterprisePage };