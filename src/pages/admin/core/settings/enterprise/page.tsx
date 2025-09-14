// Enterprise Page - Enterprise Management Tools
import React from 'react';
import { 
  BuildingOfficeIcon,
  GlobeAltIcon,
  UsersIcon,
  ChartBarIcon,
  MapPinIcon,
  CogIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { 
  ContentLayout, PageHeader, Section, StatsSection, CardGrid, Stack, Typography, Button, Badge
} from "@/shared/ui";
import { Icon } from "@/shared/ui/Icon";

export default function EnterprisePage() {
  // Mock enterprise data
  const locations = [
    {
      id: 'main',
      name: 'Restaurant Main - Downtown',
      address: 'Av. Corrientes 1234, CABA',
      status: 'active',
      revenue: '$45,230',
      orders: 234,
      staff: 12
    },
    {
      id: 'branch1',
      name: 'Restaurant Norte - Palermo',
      address: 'Thames 567, Palermo',
      status: 'active',
      revenue: '$32,180',
      orders: 187,
      staff: 8
    },
    {
      id: 'branch2',
      name: 'Restaurant Sur - San Telmo',
      address: 'Defensa 890, San Telmo',
      status: 'active',
      revenue: '$28,950',
      orders: 156,
      staff: 7
    },
    {
      id: 'new',
      name: 'Restaurant Oeste - Caballito',
      address: 'Rivadavia 2345, Caballito',
      status: 'opening',
      revenue: '$0',
      orders: 0,
      staff: 2
    }
  ];

  const franchiseMetrics = [
    { name: 'Total Locations', value: '4', change: '+1 this month', status: 'active' },
    { name: 'Total Revenue', value: '$106,360', change: '+12% vs last month', status: 'good' },
    { name: 'Total Orders', value: '577', change: '+8% vs last month', status: 'good' },
    { name: 'Active Staff', value: '29', change: '+3 new hires', status: 'stable' }
  ];

  const enterpriseTools = [
    {
      id: 'multi_location',
      name: 'Multi-Location Dashboard',
      description: 'Unified view of all restaurant locations',
      icon: GlobeAltIcon,
      status: 'active'
    },
    {
      id: 'central_kitchen',
      name: 'Central Kitchen Management',
      description: 'Production planning and distribution',
      icon: ChartBarIcon,
      status: 'active'
    },
    {
      id: 'staff_management',
      name: 'Enterprise Staff Management',
      description: 'Manage staff across all locations',
      icon: UserGroupIcon,
      status: 'active'
    },
    {
      id: 'inventory_sync',
      name: 'Inventory Synchronization',
      description: 'Real-time inventory across locations',
      icon: CogIcon,
      status: 'development'
    },
    {
      id: 'financial_consolidation',
      name: 'Financial Consolidation',
      description: 'Unified financial reporting and analysis',
      icon: CurrencyDollarIcon,
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success' as const;
      case 'opening': return 'info' as const;
      case 'maintenance': return 'warning' as const;
      case 'closed': return 'error' as const;
      case 'up': return 'success' as const;
      case 'down': return 'error' as const;
      case 'stable': return 'gray' as const;
      case 'good': return 'success' as const;
      case 'development': return 'warning' as const;
      default: return 'gray' as const;
    }
  };

  return (
    <ContentLayout>
      <PageHeader 
        title="Enterprise Management"
        subtitle="Multi-location and enterprise-level features"
        icon={BuildingOfficeIcon}
        actions={
          <Button size="sm">
            <Icon icon={CogIcon} size="sm" />
            Configurar Enterprise
          </Button>
        }
      />

      <StatsSection>
        <Stack direction="row" align="center" gap="sm" mb="lg">
          <Icon icon={BuildingOfficeIcon} size="md" />
          <Typography variant="heading" size="md">Enterprise Overview</Typography>
        </Stack>
        
        <CardGrid columns={{ base: 2, md: 4 }}>
            {franchiseMetrics.map((metric) => (
              <Stack key={metric.name} align="center" gap="sm">
                <Typography variant="body" size="sm" color="text.secondary" textAlign="center">{metric.name}</Typography>
                <Typography variant="body" size="2xl" fontWeight="bold">{metric.value}</Typography>
                <Badge 
                  colorPalette={getStatusColor(metric.status)}
                  variant="subtle"
                  size="sm"
                >
                  {metric.change}
                </Badge>
              </Stack>
            ))}
        </CardGrid>
      </StatsSection>

      {/* Locations Management */}
      <Section variant="elevated">
        <Stack gap="md">
          <Stack direction="row" justify="space-between" align="center">
            <Typography variant="heading" size="md">Locations</Typography>
            <Button size="sm" colorPalette="brand">
              <Icon icon={BuildingOfficeIcon} size="sm" />
              Add Location
            </Button>
          </Stack>
          
          <Stack gap="md">
            {locations.map((location) => (
              <CardWrapper key={location.id} variant="subtle" size="sm" >
                <Stack gap="md">
                  <Stack direction="row" justify="space-between" align="center">
                    <Stack direction="row" align="center" gap="md">
                      <Icon icon={BuildingOfficeIcon} size="lg" />
                      <Stack gap="xs">
                        <Typography variant="body" size="md" fontWeight="semibold">{location.name}</Typography>
                        <Stack direction="row" align="center" gap="xs">
                          <Icon icon={MapPinIcon} size="xs" />
                          <Typography variant="body" size="sm" color="text.secondary">{location.address}</Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                    
                    <Stack direction="row" gap="xl">
                      <Stack align="center" gap="xs">
                        <Typography variant="body" size="sm" color="text.secondary">Revenue</Typography>
                        <Typography variant="body" size="md" fontWeight="bold">{location.revenue}</Typography>
                      </Stack>
                      <Stack align="center" gap="xs">
                        <Typography variant="body" size="sm" color="text.secondary">Orders</Typography>
                        <Typography variant="body" size="md" fontWeight="bold">{location.orders}</Typography>
                      </Stack>
                      <Stack align="center" gap="xs">
                        <Typography variant="body" size="sm" color="text.secondary">Staff</Typography>
                        <Typography variant="body" size="md" fontWeight="bold">{location.staff}</Typography>
                      </Stack>
                      <Badge colorPalette={getStatusColor(location.status)} size="sm">
                        {location.status === 'active' ? 'Active' : 'Opening'}
                      </Badge>
                    </Stack>
                  </Stack>
                </Stack>
              </CardWrapper>
            ))}
          </Stack>
        </Stack>
      </Section>

      {/* Enterprise Tools */}
      <Section variant="elevated">
        <Stack gap="md">
          <Typography variant="heading" size="md">Enterprise Tools</Typography>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="md">
            {enterpriseTools.map((tool) => (
              <CardWrapper key={tool.id} variant="subtle" size="sm" >
                <Stack gap="sm">
                  <Stack direction="row" justify="space-between" align="center">
                    <Icon icon={tool.icon} size="md" />
                    <Badge 
                      colorPalette={getStatusColor(tool.status)}
                      variant="subtle"
                    >
                      {tool.status}
                    </Badge>
                  </Stack>
                  
                  <Stack gap="sm">
                    <Typography variant="body" size="md" fontWeight="semibold">{tool.name}</Typography>
                    <Typography variant="body" size="sm" color="text.secondary">{tool.description}</Typography>
                  </Stack>
                  
                  <Button 
                    size="sm" 
                    colorPalette="brand" 
                    variant="outline"
                  >
                    {tool.status === 'active' ? 'Configure' : 
                     tool.status === 'development' ? 'Coming Soon' : 'Setup'}
                  </Button>
                </Stack>
              </CardWrapper>
            ))}
          </SimpleGrid>
        </Stack>
      </Section>

      {/* Franchise Configuration */}
      <Section variant="elevated">
        <Stack gap="md">
          <Typography variant="heading" size="md">Franchise Configuration</Typography>
          
          <Stack gap="md">
            <Typography variant="body" size="sm" color="text.secondary">
              Configure enterprise-wide settings, policies, and operational standards across all locations.
            </Typography>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="md">
              <Button variant="outline" colorPalette="info">Brand Standards</Button>
              <Button variant="outline" colorPalette="success">Operational Policies</Button>
              <Button variant="outline" colorPalette="brand">Financial Controls</Button>
              <Button variant="outline" colorPalette="warning">Staff Policies</Button>
              <Button variant="outline" colorPalette="info">Menu Standards</Button>
              <Button variant="outline" colorPalette="error">Quality Controls</Button>
            </SimpleGrid>
          </Stack>
        </Stack>
      </Section>
    </ContentLayout>
  );
}
