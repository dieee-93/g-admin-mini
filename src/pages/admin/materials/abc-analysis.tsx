// ABCAnalysisPage.tsx - Advanced ABC Analysis for Inventory Management
import React, { useState } from 'react';
import { 
  ContentLayout, PageHeader, Section, StatsSection, CardGrid, MetricCard,
  Stack, Typography, Badge, Tabs, Button
} from '@/shared/ui';
import { Progress } from '@chakra-ui/react';
import {
  ChartBarIcon,
  CircleStackIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Import the existing ABC Analysis Engine
// import { ABCAnalysisEngine } from '../../../modules/materials/intelligence/ABCAnalysisEngine';

const ABCAnalysisPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [analysisType, setAnalysisType] = useState('revenue');

  // Mock data for the overview cards
  const abcOverview = {
    A: { items: 25, revenue: 67800, percentage: 73.2 },
    B: { items: 48, revenue: 18400, percentage: 19.8 },
    C: { items: 127, revenue: 6500, percentage: 7.0 }
  };

  const categoryData = [
    {
      category: 'A',
      title: 'Clase A - Críticos',
      description: 'Alto valor, control riguroso',
      color: 'red',
      items: abcOverview.A.items,
      percentage: abcOverview.A.percentage,
      revenue: abcOverview.A.revenue,
      strategy: 'Control diario, stock de seguridad mínimo'
    },
    {
      category: 'B',
      title: 'Clase B - Importantes',
      description: 'Valor moderado, control normal',
      color: 'yellow',
      items: abcOverview.B.items,
      percentage: abcOverview.B.percentage,
      revenue: abcOverview.B.revenue,
      strategy: 'Control semanal, stock moderado'
    },
    {
      category: 'C',
      title: 'Clase C - Rutinarios',
      description: 'Bajo valor, control básico',
      color: 'green',
      items: abcOverview.C.items,
      percentage: abcOverview.C.percentage,
      revenue: abcOverview.C.revenue,
      strategy: 'Control mensual, stock alto permitido'
    }
  ];

  const metrics = [
    {
      title: 'Total Items',
      value: `${abcOverview.A.items + abcOverview.B.items + abcOverview.C.items}`,
      icon: CircleStackIcon,
      color: 'blue'
    },
    {
      title: 'Total Value',
      value: `$${(abcOverview.A.revenue + abcOverview.B.revenue + abcOverview.C.revenue).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'green'
    },
    {
      title: 'A-Items Impact',
      value: `${abcOverview.A.percentage.toFixed(1)}%`,
      icon: ArrowTrendingUpIcon,
      color: 'red'
    },
    {
      title: 'Analysis Date',
      value: 'Today',
      icon: CheckCircleIcon,
      color: 'purple'
    }
  ];

  return (
    <ContentLayout>
      <PageHeader 
        title="ABC Analysis"
        subtitle="Advanced inventory classification using Pareto principle"
        icon={ChartBarIcon}
      />

      <StatsSection>
        <CardGrid columns={{ base: 2, md: 4 }}>
          {metrics.map((metric, index) => (
            <MetricCard 
              key={index}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              colorPalette={metric.color}
            />
          ))}
        </CardGrid>
      </StatsSection>

      <Section variant="default" title="ABC Categories">
        <CardGrid columns={{ base: 1, md: 3 }}>
          {categoryData.map((category) => (
            <Section key={category.category} variant="elevated">
              <Stack gap="md">
                <Stack direction="row" justify="space-between">
                  <Stack gap="xs">
                    <Stack direction="row" align="center" gap="sm">
                      <Badge 
                        colorPalette={category.color}
                        size="lg"
                      >
                        {category.category}
                      </Badge>
                      <Typography variant="body" weight="semibold">
                        {category.title.split(' - ')[1]}
                      </Typography>
                    </Stack>
                    <Typography variant="body" size="sm" color="text.muted">
                      {category.description}
                    </Typography>
                  </Stack>
                </Stack>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Stack gap="xs">
                    <Typography variant="body" size="xs" color="text.muted">Items</Typography>
                    <Typography variant="heading" size="xl" colorPalette={category.color}>
                      {category.items}
                    </Typography>
                  </Stack>
                  <Stack gap="xs">
                    <Typography variant="body" size="xs" color="text.muted">Revenue %</Typography>
                    <Typography variant="heading" size="xl" colorPalette={category.color}>
                      {category.percentage.toFixed(1)}%
                    </Typography>
                  </Stack>
                </div>

                <Progress.Root 
                  value={category.percentage} 
                  size="sm" 
                  colorPalette={category.color}
                >
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>

                <Stack direction="row" justify="space-between">
                  <Typography variant="body" size="sm" color="text.muted">Revenue:</Typography>
                  <Typography variant="body" size="sm" weight="medium">
                    ${category.revenue.toLocaleString()}
                  </Typography>
                </Stack>

                <div 
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    backgroundColor: 'var(--colors-bg-subtle)'
                  }}
                >
                  <Typography variant="body" size="xs">
                    <strong>Estrategia:</strong> {category.strategy}
                  </Typography>
                </div>
              </Stack>
            </Section>
          ))}
        </CardGrid>
      </Section>

      <Section 
        variant="elevated" 
        title="Detailed ABC Analysis"
        actions={
          <Stack direction="row" gap="sm">
            <Button size="sm" variant="outline">
              <DocumentChartBarIcon className="w-4 h-4" />
              Export Report
            </Button>
            <Button size="sm" variant="outline">
              <ArrowTrendingUpIcon className="w-4 h-4" />
              Refresh Analysis
            </Button>
          </Stack>
        }
      >
        <Tabs.Root value={analysisType} onValueChange={(details) => setAnalysisType(details.value)}>
          <Tabs.List>
            <Tabs.Trigger value="revenue">
              <Stack direction="row" align="center" gap="sm">
                <BanknotesIcon className="w-4 h-4" />
                <Typography variant="body">By Revenue</Typography>
              </Stack>
            </Tabs.Trigger>
            <Tabs.Trigger value="quantity">
              <Stack direction="row" align="center" gap="sm">
                <CircleStackIcon className="w-4 h-4" />
                <Typography variant="body">By Quantity</Typography>
              </Stack>
            </Tabs.Trigger>
            <Tabs.Trigger value="frequency">
              <Stack direction="row" align="center" gap="sm">
                <ChartBarIcon className="w-4 h-4" />
                <Typography variant="body">By Frequency</Typography>
              </Stack>
            </Tabs.Trigger>
            <Tabs.Trigger value="engine">
              <Stack direction="row" align="center" gap="sm">
                <DocumentChartBarIcon className="w-4 h-4" />
                <Typography variant="body">Analysis Engine</Typography>
              </Stack>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="revenue">
            <Stack gap="md" style={{ padding: '1rem' }}>
              <Typography variant="body" color="text.muted" textAlign="center">
                ABC Analysis based on revenue contribution (80/20 Pareto principle)
              </Typography>
              <CardGrid columns={{ base: 1, md: 2 }}>
                <Section variant="flat">
                  <Stack gap="sm">
                    <Typography variant="body" weight="medium">Revenue Distribution</Typography>
                    <Typography variant="body" size="sm" color="text.muted">
                      Class A items generate 73% of total revenue with only 12.5% of items
                    </Typography>
                  </Stack>
                </Section>
                <Section variant="flat">
                  <Stack gap="sm">
                    <Typography variant="body" weight="medium">Optimization Opportunity</Typography>
                    <Typography variant="body" size="sm" color="text.muted">
                      Focus inventory control on 25 high-value items for maximum impact
                    </Typography>
                  </Stack>
                </Section>
              </CardGrid>
            </Stack>
          </Tabs.Content>

          <Tabs.Content value="quantity">
            <Stack gap="md" style={{ padding: '1rem' }}>
              <Typography variant="body" color="text.muted" textAlign="center">
                ABC Analysis based on consumption quantity and movement frequency
              </Typography>
              <Section variant="flat">
                <Stack gap="sm">
                  <Typography variant="body" weight="medium">Quantity-Based Insights</Typography>
                  <Typography variant="body" size="sm" color="text.muted">
                    High-volume items may require different management strategy than high-value items
                  </Typography>
                </Stack>
              </Section>
            </Stack>
          </Tabs.Content>

          <Tabs.Content value="frequency">
            <Stack gap="md" style={{ padding: '1rem' }}>
              <Typography variant="body" color="text.muted" textAlign="center">
                ABC Analysis based on order frequency and transaction patterns
              </Typography>
              <Section variant="flat">
                <Stack gap="sm">
                  <Typography variant="body" weight="medium">Frequency-Based Strategy</Typography>
                  <Typography variant="body" size="sm" color="text.muted">
                    Fast-moving items require frequent monitoring regardless of value
                  </Typography>
                </Stack>
              </Section>
            </Stack>
          </Tabs.Content>

          <Tabs.Content value="engine">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <Stack align="center" gap="md">
                <CircleStackIcon className="w-16 h-16 text-orange-500" />
                <Typography variant="heading" size="md">ABC Analysis Engine</Typography>
                <Typography variant="body" color="text.muted">
                  Advanced ABC classification engine coming soon...
                </Typography>
              </Stack>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </Section>

      <Section variant="flat" title="Strategic Recommendations" subtitle="Optimization opportunities based on ABC analysis">
        <Stack direction="row" justify="space-between" align="center">
          <Typography variant="body" color="text.muted">
            Recommended actions for each category
          </Typography>
          <Stack gap="sm">
            <Badge colorPalette="red" size="sm">
              Focus on A-Items
            </Badge>
            <Badge colorPalette="yellow" size="sm">
              Monitor B-Items
            </Badge>
            <Badge colorPalette="green" size="sm">
              Automate C-Items
            </Badge>
          </Stack>
        </Stack>
      </Section>
    </ContentLayout>
  );
};

export default ABCAnalysisPage;