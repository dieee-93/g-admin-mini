// DashboardOverview.tsx - Modern dashboard overview migrated to Design System
import React from 'react';
import {
  Stack,
  Typography,
  Card,
  Grid,
  Badge,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  CircularProgress,
  
  useDashboardDefaults
} from '@/shared/ui';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { useMaterials } from '@/pages/admin/materials/hooks/useMaterials';
import { useSales } from '@/pages/admin/sales/hooks/useSales';
import { useCustomers } from '@/pages/admin/customers/hooks/useCustomers';

export function DashboardOverview() {
  const { navigate } = useNavigation();
  const { inventoryStats, alertSummary, alerts } = useMaterials();
  // Nota: Los hooks de sales y customers necesitan ser actualizados para incluir stats
  // const { salesStats } = useSales();
  // const { customersStats } = useCustomers();

  // Hero metrics for modern dashboard
  const heroMetrics = [
    {
      id: 'revenue-today',
      title: 'Revenue Today',
      value: '$2,847',
      change: '+12.3%',
      trend: 'up' as const,
      icon: CurrencyDollarIcon,
      colorPalette: 'success' as const
    },
    {
      id: 'orders-today',
      title: 'Orders Today',
      value: '47',
      change: '+5.2%',
      trend: 'up' as const,
      icon: ShoppingCartIcon,
      colorPalette: 'info' as const
    },
    {
      id: 'low-stock',
      title: 'Low Stock Items',
      value: inventoryStats.lowStockItems.toString(),
      change: 'Needs attention',
      trend: alertSummary.critical > 0 ? 'down' : 'neutral',
      icon: CubeIcon,
      colorPalette: alertSummary.critical > 0 ? 'error' : 'gray'
    },
    {
      id: 'active-customers',
      title: 'Active Customers',
      value: '234',
      change: '+8.1%',
      trend: 'up' as const,
      icon: UsersIcon,
      colorPalette: 'brand' as const
    }
  ];

  const quickActions = [
    {
      id: 'new-sale',
      title: 'New Sale',
      description: 'Process a new order',
      action: () => navigate('sales', '/'),
      colorPalette: 'success' as const
    },
    {
      id: 'add-inventory',
      title: 'Add Inventory',
      description: 'Update stock levels',
      action: () => navigate('materials', '/'),
      colorPalette: 'info' as const
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'See detailed insights',
      action: () => {},
      colorPalette: 'brand' as const
    }
  ];

  return (
    
      <Stack gap="xl" align="stretch">
        {/* Critical Alerts */}
        {alertSummary.total > 0 && (
          <Alert>
            <AlertIcon>
              <Icon icon={ExclamationTriangleIcon} size="sm" />
            </AlertIcon>
            <AlertTitle>Stock Alerts</AlertTitle>
            <AlertDescription>
              {alertSummary.critical} critical, {alertSummary.warning} warning items need attention
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Metrics */}
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "repeat(4, 1fr)" }} gap="md">
          {heroMetrics.map((metric) => {
            const TrendIcon = metric.trend === 'up' ? ArrowTrendingUpIcon : 
                             metric.trend === 'down' ? ArrowTrendingDownIcon : null;
            
            return (
              <Card key={metric.id}>
                <Stack gap="md" align="start">
                  <Stack direction="row" justify="space-between" width="full">
                    <Icon icon={metric.icon} size="lg"  />
                    {TrendIcon && (
                      <Icon 
                        icon={TrendIcon} 
                        size="sm" 
                        color={metric.trend === 'up' ? 'success.500' : 'error.500'} 
                      />
                    )}
                  </Stack>
                  
                  <Stack gap="xs" align="start">
                    <Typography variant="body" size="sm" color="secondary">{metric.title}</Typography>
                    <Typography variant="heading" size="2xl" weight="bold" color="primary">{metric.value}</Typography>
                    <Badge 
                      colorPalette={metric.trend === 'up' ? 'success' : 
                                  metric.trend === 'down' ? 'error' : 'gray'}
                    >
                      {metric.change}
                    </Badge>
                  </Stack>
                </Stack>
              </CardWrapper>
            );
          })}
        </Grid>

        {/* Two Column Layout */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="md">
          {/* Recent Activity */}
          <CardWrapper>
            <Stack gap="md">
              <Typography variant="heading" size="lg" weight="semibold" color="primary">Recent Activity</Typography>
              <Stack gap="md">
                <Stack direction="row" justify="space-between" width="full">
                  <Stack gap="xs" align="start">
                    <Typography variant="body" size="sm" weight="medium">Last sale processed</Typography>
                    <Typography variant="body" size="xs" color="secondary">2 minutes ago</Typography>
                  </Stack>
                  <Badge colorPalette="success">+$45.50</Badge>
                </Stack>
                
                <Stack direction="row" justify="space-between" width="full">
                  <Stack gap="xs" align="start">
                    <Typography variant="body" size="sm" weight="medium">Inventory updated</Typography>
                    <Typography variant="body" size="xs" color="secondary">15 minutes ago</Typography>
                  </Stack>
                  <Badge colorPalette="info">+12 items</Badge>
                </Stack>
                
                <Stack direction="row" justify="space-between" width="full">
                  <Stack gap="xs" align="start">
                    <Typography variant="body" size="sm" weight="medium">New customer registered</Typography>
                    <Typography variant="body" size="xs" color="secondary">1 hour ago</Typography>
                  </Stack>
                  <Badge colorPalette="brand">Customer</Badge>
                </Stack>
              </Stack>
            </Stack>
          </CardWrapper>

          {/* Quick Actions */}
          <CardWrapper>
            <Stack gap="md">
              <Typography variant="heading" size="lg" weight="semibold" color="primary">Quick Actions</Typography>
              <Stack gap="sm">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    colorPalette={action.colorPalette}
                    onClick={action.action}
                    size="lg"
                  >
                    <Stack direction="row" justify="space-between" width="full" align="center">
                      <Stack gap="xs" align="start">
                        <Typography variant="body" size="sm" weight="medium">{action.title}</Typography>
                        <Typography variant="body" size="xs" color="secondary">{action.description}</Typography>
                      </Stack>
                      <Icon icon={ArrowRightIcon} size="sm" />
                    </Stack>
                  </Button>
                ))}
              </Stack>
            </Stack>
          </CardWrapper>
        </Grid>

        {/* Performance Summary */}
        <CardWrapper>
          <Stack gap="md">
            <Stack direction="row" justify="space-between" align="center">
              <Typography variant="heading" size="lg" weight="semibold" color="primary">Today's Performance</Typography>
              <Badge colorPalette="success">On Track</Badge>
            </Stack>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="md">
              <Stack gap="sm" align="start">
                <Typography variant="body" size="sm" color="secondary">Sales Target</Typography>
                <Typography variant="heading" size="xl" weight="bold" color="primary">85%</Typography>
                <CircularProgress value={85}  />
                <Typography variant="body" size="xs" color="secondary">$2,847 of $3,350 daily goal</Typography>
              </Stack>
              
              <Stack gap="sm" align="start">
                <Typography variant="body" size="sm" color="secondary">Order Volume</Typography>
                <Typography variant="heading" size="xl" weight="bold" color="primary">94%</Typography>
                <CircularProgress value={94}  />
                <Typography variant="body" size="xs" color="secondary">47 of 50 orders goal</Typography>
              </Stack>
              
              <Stack gap="sm" align="start">
                <Typography variant="body" size="sm" color="secondary">Customer Satisfaction</Typography>
                <Typography variant="heading" size="xl" weight="bold" color="primary">98%</Typography>
                <CircularProgress value={98} color="brand.500" />
                <Typography variant="body" size="xs" color="secondary">Based on recent feedback</Typography>
              </Stack>
            </Grid>
          </Stack>
        </CardWrapper>
      </Stack>
    
  );
}