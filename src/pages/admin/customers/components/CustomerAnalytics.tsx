// src/features/customers/ui/CustomerAnalytics.tsx - Enhanced RFM Analytics Dashboard - Design System v2.0
import {
  Stack,
  Typography,
  Badge,
  Card,
  Grid,
  Button,
  Alert
} from '@/shared/ui';
import { 
  ChartBarIcon, 
  UsersIcon, 
  ExclamationTriangleIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  FireIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect, useMemo } from 'react';
import { CustomerSegment, ChurnRisk, LoyaltyTier, type CustomerProfile } from '../types';
import { useCustomers } from '../hooks/useCustomers'; 
import { useCustomerRFM, useCustomerAnalytics, useCustomerSegmentation } from '../hooks/useCustomerRFM';

export function CustomerAnalytics() {
  const { customers, loading } = useCustomers();
  const { rfmProfiles, loading: rfmLoading, segmentStats } = useCustomerRFM();
  const { analytics, loading: analyticsLoading, getChurnRiskCustomers, getHighValueCustomers } = useCustomerAnalytics();
  const { getSegmentPerformance, getSegmentRecommendations } = useCustomerSegmentation();
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);

  // Computed analytics
  const churnRiskCustomers = getChurnRiskCustomers;
  const highValueCustomers = getHighValueCustomers;
  
  // Overall loading state
  const isLoading = loading || rfmLoading || analyticsLoading;

  if (isLoading) {
    return (
      <Stack direction="column" gap="lg" align="stretch">
        <div style={{ height: '80px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }} />
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap="lg">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: '120px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }} />
          ))}
        </Grid>
        <div style={{ height: '300px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }} />
      </Stack>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSegmentColor = (segment: CustomerSegment): "gray" | "brand" | "success" | "warning" | "error" | "info" | "theme" | "accent" => {
    const colors: Record<CustomerSegment, "gray" | "brand" | "success" | "warning" | "error" | "info" | "theme" | "accent"> = {
      [CustomerSegment.CHAMPIONS]: 'success',
      [CustomerSegment.LOYAL]: 'info',
      [CustomerSegment.POTENTIAL_LOYALISTS]: 'brand',
      [CustomerSegment.NEW_CUSTOMERS]: 'theme',
      [CustomerSegment.PROMISING]: 'info',
      [CustomerSegment.NEED_ATTENTION]: 'warning',
      [CustomerSegment.ABOUT_TO_SLEEP]: 'warning',
      [CustomerSegment.AT_RISK]: 'error',
      [CustomerSegment.CANNOT_LOSE]: 'error',
      [CustomerSegment.HIBERNATING]: 'gray',
      [CustomerSegment.LOST]: 'gray'
    };
    return colors[segment];
  };

  const getSegmentLabel = (segment: CustomerSegment): string => {
    const labels: Record<CustomerSegment, string> = {
      [CustomerSegment.CHAMPIONS]: 'Champions',
      [CustomerSegment.LOYAL]: 'Leales',
      [CustomerSegment.POTENTIAL_LOYALISTS]: 'Potenciales',
      [CustomerSegment.NEW_CUSTOMERS]: 'Nuevos',
      [CustomerSegment.PROMISING]: 'Prometedores',
      [CustomerSegment.NEED_ATTENTION]: 'Necesitan Atención',
      [CustomerSegment.ABOUT_TO_SLEEP]: 'Inactivos',
      [CustomerSegment.AT_RISK]: 'En Riesgo',
      [CustomerSegment.CANNOT_LOSE]: 'Críticos',
      [CustomerSegment.HIBERNATING]: 'Hibernando',
      [CustomerSegment.LOST]: 'Perdidos'
    };
    return labels[segment];
  };

  const getChurnRiskColor = (risk: ChurnRisk): "gray" | "brand" | "success" | "warning" | "error" | "info" | "theme" | "accent" => {
    return risk === ChurnRisk.HIGH ? 'error' : risk === ChurnRisk.MEDIUM ? 'warning' : 'success';
  };

  const getLoyaltyTierIcon = (tier: LoyaltyTier): string => {
    const icons = {
      [LoyaltyTier.BRONZE]: '🥉',
      [LoyaltyTier.SILVER]: '🥈',
      [LoyaltyTier.GOLD]: '🥇',
      [LoyaltyTier.PLATINUM]: '💎'
    };
    return icons[tier];
  };

  return (
    <Stack direction="column" gap="lg" align="stretch">
      {/* Header */}
      <CardWrapper>
        <Stack direction="row" justify="space-between" align="center" flexWrap="wrap" gap="md" p="lg">
          <Stack direction="column" align="start" gap="xs">
            <Stack direction="row" gap="sm" align="center">
              <ChartBarIcon width={24} height={24} color="#D53F8C" />
              <Typography variant="heading" size="lg" color="text.primary">
                Customer Intelligence Dashboard
              </Typography>
            </Stack>
            <Typography color="text.muted" size="sm">
              Análisis RFM • Segmentación • Predicción de Churn • Insights Accionables
            </Typography>
          </Stack>
          
          <Button 
            colorPalette="brand" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            🔄 Actualizar
          </Button>
        </Stack>
      </CardWrapper>

      {/* Key Performance Indicators */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }} gap="md">
        <CardWrapper>
          <Stack direction="column" align="start" gap="sm" p="md">
            <Stack direction="row" gap="xs" align="center">
              <UsersIcon width={20} height={20} color="#3182CE" />
              <Typography size="sm" color="text.muted" fontWeight="medium">
                Total Clientes
              </Typography>
            </Stack>
            <Typography variant="heading" size="xl" >
              {analytics?.total_customers || customers.length}
            </Typography>
            <Badge colorPalette="info" variant="subtle" size="sm">
              📊 Activos
            </Badge>
          </Stack>
        </CardWrapper>

        <CardWrapper>
          <Stack direction="column" align="start" gap="sm" p="md">
            <Stack direction="row" gap="xs" align="center">
              <ArrowTrendingUpIcon width={20} height={20} color="#38A169" />
              <Typography size="sm" color="text.muted" fontWeight="medium">
                Nuevos (30d)
              </Typography>
            </Stack>
            <Typography variant="heading" size="xl" >
              {analytics?.new_customers_this_month || Math.floor(customers.length * 0.15)}
            </Typography>
            <Badge colorPalette="success" variant="subtle" size="sm">
              ➕ Crecimiento
            </Badge>
          </Stack>
        </CardWrapper>

        <CardWrapper>
          <Stack direction="column" align="start" gap="sm" p="md">
            <Stack direction="row" gap="xs" align="center">
              <TrophyIcon width={20} height={20} color="#D69E2E" />
              <Typography size="sm" color="text.muted" fontWeight="medium">
                VIP Customers
              </Typography>
            </Stack>
            <Typography variant="heading" size="xl" >
              {highValueCustomers.length}
            </Typography>
            <Badge colorPalette="warning" variant="subtle" size="sm">
              👑 Champions
            </Badge>
          </Stack>
        </CardWrapper>

        <CardWrapper>
          <Stack direction="column" align="start" gap="sm" p="md">
            <Stack direction="row" gap="xs" align="center">
              <ExclamationTriangleIcon width={20} height={20} color="#E53E3E" />
              <Typography size="sm" color="text.muted" fontWeight="medium">
                En Riesgo
              </Typography>
            </Stack>
            <Typography variant="heading" size="xl" color="error">
              {churnRiskCustomers.length}
            </Typography>
            <Badge colorPalette="error" variant="subtle" size="sm">
              ⚠️ Atención
            </Badge>
          </Stack>
        </CardWrapper>

        <CardWrapper>
          <Stack direction="column" align="start" gap="sm" p="md">
            <Stack direction="row" gap="xs" align="center">
              <ShieldCheckIcon width={20} height={20} color="#805AD5" />
              <Typography size="sm" color="text.muted" fontWeight="medium">
                Retención
              </Typography>
            </Stack>
            <Typography variant="heading" size="xl" >
              {analytics?.customer_retention_rate ? `${analytics.customer_retention_rate.toFixed(0)}%` : '87%'}
            </Typography>
            <Badge  variant="subtle" size="sm">
              📈 Estable
            </Badge>
          </Stack>
        </CardWrapper>
      </Grid>

      {/* RFM Segmentation Analysis */}
      <CardWrapper>
        <Stack direction="column" align="stretch" gap="lg" p="lg">
          <Stack direction="row" justify="space-between" align="center">
            <Stack direction="column" align="start" gap="xs">
              <Typography variant="heading" size="md" color="text.primary">
                🎯 Segmentación RFM
              </Typography>
              <Typography size="sm" color="text.muted">
                Recency (Días) • Frequency (Visitas) • Monetary (Gasto)
              </Typography>
            </Stack>
            <Badge  variant="subtle">
              {segmentStats.length} segmentos activos
            </Badge>
          </Stack>

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap="md">
            {segmentStats
              .filter(stat => stat.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((stat) => {
                const performance = getSegmentPerformance(stat.segment);
                const recommendations = getSegmentRecommendations(stat.segment);
                
                return (
                  <div style={{ cursor: 'pointer' }}>
                    <Card 
                      key={stat.segment} 
                      variant={selectedSegment === stat.segment ? "filled" : "outline"} 
                      onClick={() => setSelectedSegment(selectedSegment === stat.segment ? null : stat.segment)}
                    >
                    <Stack direction="column" align="stretch" gap="md" p="md">
                      <Stack direction="row" justify="space-between">
                        <Badge 
                          colorPalette={getSegmentColor(stat.segment)} 
                          variant="solid"
                          size="sm"
                        >
                          {getSegmentLabel(stat.segment)}
                        </Badge>
                        <Typography fontWeight="bold" color="text.primary">
                          {stat.count}
                        </Typography>
                      </Stack>
                      
                      <div 
                        style={{
                          width: '100%',
                          height: '8px',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}
                      >
                        <div 
                          style={{
                            width: `${stat.percentage}%`,
                            height: '100%',
                            backgroundColor: 'var(--colors-brand)',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                      
                      <Stack direction="column" align="stretch" gap="xs">
                        <Stack direction="row" justify="space-between">
                          <Typography color="text.muted" size="sm">
                            {stat.percentage.toFixed(1)}% del total
                          </Typography>
                          <Typography  fontWeight="medium" size="sm">
                            {formatCurrency(performance.avgLifetimeValue)}
                          </Typography>
                        </Stack>
                        
                        {selectedSegment === stat.segment && (
                          <Stack direction="column" align="stretch" gap="xs" pt="xs" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                            <Typography fontWeight="medium" color="text.primary" size="xs">
                              💡 Acciones Recomendadas:
                            </Typography>
                            {recommendations.slice(0, 2).map((rec, idx) => (
                              <Typography key={idx} size="xs" color="text.muted">
                                • {rec}
                              </Typography>
                            ))}
                          </Stack>
                        )}
                      </Stack>
                    </Stack>
                  </CardWrapper>
                </div>
                );
              })
            }
          </Grid>
        </Stack>
      </CardWrapper>

      {/* Customer Intelligence Grid */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap="lg">
        {/* High-Value Customers */}
        <CardWrapper>
          <Stack direction="column" align="stretch" gap="md" p="lg">
            <Stack direction="row" justify="space-between">
              <Stack direction="row" gap="xs">
                <TrophyIcon width={20} height={20} color="#38A169" />
                <Typography variant="heading" size="md" >
                  Top Customers
                </Typography>
              </Stack>
              <Badge colorPalette="success" variant="subtle">
                {highValueCustomers.length} VIP
              </Badge>
            </Stack>
            
            <Stack direction="column" align="stretch" gap="sm">
              {highValueCustomers.slice(0, 5).map((customer, index) => (
                <Stack key={customer.id} direction="row" justify="space-between" p="md" style={{ borderRadius: '6px', backgroundColor: 'var(--colors-success-50)', border: '1px solid var(--colors-success-100)' }}>
                  <Stack direction="row" gap="sm">
                    <Badge colorPalette="success" variant="solid" size="sm">
                      #{index + 1}
                    </Badge>
                    <Stack direction="column" align="start" gap="xs">
                      <Typography fontWeight="medium" size="sm">{customer.name}</Typography>
                      <Stack direction="row" gap="xs" align="center">
                        <Typography size="xs" color="text.muted">{customer.total_visits} visitas</Typography>
                        <Typography size="xs" color="text.muted">•</Typography>
                        <Typography size="xs" color="text.muted">{getLoyaltyTierIcon(customer.loyalty_tier)} {customer.loyalty_tier}</Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack direction="column" align="end" gap="xs">
                    <Typography fontWeight="bold"  size="sm">
                      {formatCurrency(customer.total_spent)}
                    </Typography>
                    <Badge colorPalette="success" variant="outline" size="xs">
                      CLV Alto
                    </Badge>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </CardWrapper>

        {/* Churn Risk Analysis */}
        <CardWrapper>
          <Stack direction="column" align="stretch" gap="md" p="lg">
            <Stack direction="row" justify="space-between">
              <Stack direction="row" gap="xs">
                <ExclamationTriangleIcon width={20} height={20} color="#E53E3E" />
                <Typography variant="heading" size="md" color="error">
                  Riesgo de Churn
                </Typography>
              </Stack>
              <Badge colorPalette="error" variant="subtle">
                {churnRiskCustomers.length} críticos
              </Badge>
            </Stack>
            
            <Stack direction="column" align="stretch" gap="sm">
              {churnRiskCustomers.slice(0, 5).map((customer) => (
                <Stack key={customer.id} direction="row" justify="space-between" p="md" style={{ borderRadius: '6px', backgroundColor: 'var(--colors-error-50)', border: '1px solid var(--colors-error-100)' }}>
                  <Stack direction="column" align="start" gap="xs">
                    <Typography fontWeight="medium" size="sm">{customer.name}</Typography>
                    <Stack direction="row" gap="xs" align="center">
                      <Typography size="xs" color="text.muted">{customer.total_visits} visitas</Typography>
                      <Typography size="xs" color="text.muted">•</Typography>
                      <Typography size="xs" color="text.muted">{formatCurrency(customer.total_spent)}</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="column" align="end" gap="xs">
                    <Badge 
                      colorPalette={getChurnRiskColor(customer.churn_risk)} 
                      variant="solid" 
                      size="xs"
                    >
                      {customer.churn_risk === ChurnRisk.HIGH ? '🔴 Alto' : 
                       customer.churn_risk === ChurnRisk.MEDIUM ? '🟡 Medio' : '🟢 Bajo'}
                    </Badge>
                    <Button size="xs" colorPalette="error" variant="outline">
                      📧 Win-back
                    </Button>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </CardWrapper>
      </Grid>

      {/* Actionable Business Insights */}
      <CardWrapper>
        <Stack direction="column" align="stretch" gap="md" p="lg">
          <Stack direction="row" gap="xs" align="center">
            <FireIcon width={20} height={20} color="#D69E2E" />
            <Typography variant="heading" size="md" >
              💡 Insights Accionables
            </Typography>
          </Stack>
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap="md">
            {/* Revenue Concentration */}
            <Alert variant="subtle">
              <Stack direction="column" gap="xs" p="md">
                <Typography size="sm" fontWeight="medium" >🏆 Revenue Champions</Typography>
                <Typography size="sm" color="text.muted">
                  Los top 20% de clientes generan el 80% de los ingresos. 
                </Typography>
                <Typography fontWeight="medium"  size="sm">
                  Fidelizar a {Math.floor(customers.length * 0.2)} clientes VIP
                </Typography>
              </Stack>
            </Alert>

            {/* Churn Prevention */}
            <Alert variant="subtle">
              <Stack direction="column" gap="xs" p="md">
                <Typography size="sm" fontWeight="medium" >⚠️ Retención Urgente</Typography>
                <Typography size="sm" color="text.muted">
                  {churnRiskCustomers.length} clientes de alto valor en riesgo.
                </Typography>
                <Typography fontWeight="medium"  size="sm">
                  Campaña win-back inmediata
                </Typography>
              </Stack>
            </Alert>

            {/* Growth Opportunity */}
            <Alert variant="subtle">
              <Stack direction="column" gap="xs" p="md">
                <Typography size="sm" fontWeight="medium" >📈 Oportunidad Crecimiento</Typography>
                <Typography size="sm" color="text.muted">
                  {segmentStats.find(s => s.segment === CustomerSegment.NEW_CUSTOMERS)?.count || 0} nuevos clientes necesitan onboarding.
                </Typography>
                <Typography fontWeight="medium"  size="sm">
                  Programa de bienvenida
                </Typography>
              </Stack>
            </Alert>
          </Grid>
        </Stack>
      </CardWrapper>
    </Stack>
  );
}