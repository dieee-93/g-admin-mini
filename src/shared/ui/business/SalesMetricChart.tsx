import { Card } from '../Card'
import { Typography } from '../Typography'
import { Stack, HStack } from '../Stack'
import { Badge } from '../Badge'
import { Layout } from '../Layout'

interface SalesDataPoint {
  date: string
  revenue: number
  orders: number
  averageOrder: number
  profit: number
  customers: number
}

interface SalesMetric {
  label: string
  value: number
  previousValue?: number
  format: 'currency' | 'number' | 'percentage'
  trend?: 'up' | 'down' | 'stable'
  target?: number
}

interface SalesMetricChartProps {
  data: SalesDataPoint[]
  metrics: SalesMetric[]
  title?: string
  period: 'day' | 'week' | 'month' | 'year'
  variant?: 'compact' | 'detailed' | 'dashboard'
  showChart?: boolean
  showComparison?: boolean
  onPeriodChange?: (period: string) => void
  className?: string
}

interface QuickMetricCardProps {
  metric: SalesMetric
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

const formatValue = (value: number, format: SalesMetric['format'], decimals = 2) => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: decimals,
      }).format(value)
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'number':
    default:
      return new Intl.NumberFormat('es-AR').format(value)
  }
}

const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
  const diff = ((current - previous) / previous) * 100
  if (Math.abs(diff) < 1) return 'stable'
  return diff > 0 ? 'up' : 'down'
}

const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up': return '📈'
    case 'down': return '📉'
    case 'stable': return '➡️'
  }
}

const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up': return 'success'
    case 'down': return 'error'
    case 'stable': return 'gray'
  }
}

const periodLabels = {
  day: 'Hoy',
  week: 'Esta Semana',
  month: 'Este Mes',
  year: 'Este Año',
}

export function QuickMetricCard({ 
  metric, 
  size = 'md',
  onClick,
  className 
}: QuickMetricCardProps) {
  const trend = metric.previousValue 
    ? calculateTrend(metric.value, metric.previousValue)
    : metric.trend || 'stable'
  
  const trendPercentage = metric.previousValue
    ? Math.abs(((metric.value - metric.previousValue) / metric.previousValue) * 100)
    : 0

  const targetPercentage = metric.target
    ? (metric.value / metric.target) * 100
    : null

  if (size === 'sm') {
    return (
      <Layout 
        variant="panel" 
        padding="sm"
        onClick={onClick}
        className={className}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <HStack justify="space-between" align="center">
          <Stack gap="xs">
            <Typography variant="caption" color="secondary">
              {metric.label}
            </Typography>
            <Typography variant="title" size="sm">
              {formatValue(metric.value, metric.format)}
            </Typography>
          </Stack>
          <Badge
            colorPalette={getTrendColor(trend)}
            size="xs"
            startIcon={<span>{getTrendIcon(trend)}</span>}
          >
            {trendPercentage > 0 ? `${trendPercentage.toFixed(1)}%` : '—'}
          </Badge>
        </HStack>
      </Layout>
    )
  }

  return (
    <Card 
      variant="elevated" 
      padding="md"
      interactive={!!onClick}
      onClick={onClick}
      className={className}
    >
      <Stack gap="sm">
        <HStack justify="space-between" align="start">
          <Typography variant="overline" color="secondary">
            {metric.label}
          </Typography>
          <Badge
            colorPalette={getTrendColor(trend)}
            size="sm"
            startIcon={<span>{getTrendIcon(trend)}</span>}
          >
            {metric.previousValue ? (
              `${trendPercentage.toFixed(1)}%`
            ) : (
              trend === 'up' ? '+' : trend === 'down' ? '-' : '='
            )}
          </Badge>
        </HStack>

        <Typography variant="display" size="lg">
          {formatValue(metric.value, metric.format)}
        </Typography>

        {metric.previousValue && (
          <Typography variant="caption" color="secondary">
            vs {formatValue(metric.previousValue, metric.format)} anterior
          </Typography>
        )}

        {metric.target && (
          <Layout>
            <HStack justify="space-between">
              <Typography variant="caption" color="secondary">
                Meta: {formatValue(metric.target, metric.format)}
              </Typography>
              <Typography 
                variant="caption" 
                color={targetPercentage! >= 100 ? 'success' : targetPercentage! >= 80 ? 'warning' : 'error'}
                weight="medium"
              >
                {targetPercentage!.toFixed(1)}%
              </Typography>
            </HStack>
            
            {/* Barra de progreso simple */}
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e2e8f0',
              borderRadius: '2px',
              marginTop: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(targetPercentage!, 100)}%`,
                backgroundColor: targetPercentage! >= 100 ? '#22c55e' : targetPercentage! >= 80 ? '#eab308' : '#ef4444',
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </Layout>
        )}
      </Stack>
    </Card>
  )
}

export function SalesMetricChart({
  data,
  metrics,
  title = 'Métricas de Ventas',
  period,
  variant = 'detailed',
  showChart = false,
  showComparison = true,
  onPeriodChange,
  className,
}: SalesMetricChartProps) {
  const latestData = data[data.length - 1]
  const previousData = data[data.length - 2]

  if (variant === 'compact') {
    return (
      <Card variant="outline" padding="sm" className={className}>
        <Stack gap="sm">
          <HStack justify="space-between" align="center">
            <Typography variant="title" size="sm">{title}</Typography>
            <Badge variant="outline" size="xs">
              {periodLabels[period]}
            </Badge>
          </HStack>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
            gap: '8px' 
          }}>
            {metrics.slice(0, 3).map((metric, index) => (
              <QuickMetricCard 
                key={index} 
                metric={metric} 
                size="sm" 
              />
            ))}
          </div>
        </Stack>
      </Card>
    )
  }

  if (variant === 'dashboard') {
    return (
      <div className={className}>
        <HStack justify="space-between" align="center" style={{ marginBottom: '16px' }}>
          <Typography variant="heading">{title}</Typography>
          <HStack gap="sm">
            {['day', 'week', 'month', 'year'].map((p) => (
              <Badge
                key={p}
                variant={period === p ? 'solid' : 'outline'}
                colorPalette="brand"
                size="sm"
                clickable
                onClick={() => onPeriodChange?.(p)}
              >
                {periodLabels[p as keyof typeof periodLabels]}
              </Badge>
            ))}
          </HStack>
        </HStack>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px' 
        }}>
          {metrics.map((metric, index) => (
            <QuickMetricCard 
              key={index} 
              metric={metric} 
              size="md" 
            />
          ))}
        </div>
      </div>
    )
  }

  // Variant: detailed (default)
  return (
    <Card variant="elevated" padding="none" className={className}>
      <Card.Header justify="space-between">
        <Typography variant="heading">{title}</Typography>
        <HStack gap="sm">
          {onPeriodChange && (
            <HStack gap="xs">
              {['day', 'week', 'month', 'year'].map((p) => (
                <Badge
                  key={p}
                  variant={period === p ? 'solid' : 'outline'}
                  colorPalette="brand"
                  size="sm"
                  clickable
                  onClick={() => onPeriodChange(p)}
                >
                  {periodLabels[p as keyof typeof periodLabels]}
                </Badge>
              ))}
            </HStack>
          )}
        </HStack>
      </Card.Header>

      <Card.Body>
        {/* Métricas principales */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: showChart ? '24px' : '0'
        }}>
          {metrics.map((metric, index) => (
            <QuickMetricCard 
              key={index} 
              metric={metric} 
              size="md" 
            />
          ))}
        </div>

        {/* Gráfico placeholder */}
        {showChart && (
          <Layout variant="panel" padding="lg">
            <Typography variant="label" style={{ marginBottom: '16px' }}>
              Tendencia de Ventas - {periodLabels[period]}
            </Typography>
            
            {/* Gráfico simple simulado */}
            <div style={{
              height: '200px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'medium'
            }}>
              📊 Gráfico de ventas ({data.length} puntos de datos)
            </div>
            
            {/* Resumen de datos */}
            {latestData && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '12px',
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '6px'
              }}>
                <div>
                  <Typography variant="caption" color="secondary">Ingresos</Typography>
                  <Typography variant="body" weight="medium">
                    {formatValue(latestData.revenue, 'currency')}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="secondary">Órdenes</Typography>
                  <Typography variant="body" weight="medium">
                    {formatValue(latestData.orders, 'number')}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="secondary">Promedio</Typography>
                  <Typography variant="body" weight="medium">
                    {formatValue(latestData.averageOrder, 'currency')}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="secondary">Ganancia</Typography>
                  <Typography variant="body" weight="medium">
                    {formatValue(latestData.profit, 'currency')}
                  </Typography>
                </div>
              </div>
            )}
          </Layout>
        )}

        {/* Comparación período anterior */}
        {showComparison && previousData && latestData && (
          <Layout variant="panel" padding="md" style={{ marginTop: '16px' }}>
            <Typography variant="label" style={{ marginBottom: '12px' }}>
              Comparación con período anterior
            </Typography>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '12px' 
            }}>
              {[
                { label: 'Ingresos', current: latestData.revenue, previous: previousData.revenue, format: 'currency' },
                { label: 'Órdenes', current: latestData.orders, previous: previousData.orders, format: 'number' },
                { label: 'Promedio', current: latestData.averageOrder, previous: previousData.averageOrder, format: 'currency' },
                { label: 'Clientes', current: latestData.customers, previous: previousData.customers, format: 'number' },
              ].map((item, index) => {
                const diff = ((item.current - item.previous) / item.previous) * 100
                const trend = Math.abs(diff) < 1 ? 'stable' : diff > 0 ? 'up' : 'down'
                
                return (
                  <HStack key={index} justify="space-between" align="center">
                    <Stack gap="xs">
                      <Typography variant="caption" color="secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="body" weight="medium">
                        {formatValue(item.current, item.format as SalesMetric['format'])}
                      </Typography>
                    </Stack>
                    <Badge
                      colorPalette={getTrendColor(trend)}
                      size="xs"
                      startIcon={<span>{getTrendIcon(trend)}</span>}
                    >
                      {Math.abs(diff).toFixed(1)}%
                    </Badge>
                  </HStack>
                )
              })}
            </div>
          </Layout>
        )}
      </Card.Body>
    </Card>
  )
}