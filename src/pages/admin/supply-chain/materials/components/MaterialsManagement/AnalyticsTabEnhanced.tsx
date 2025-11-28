import { Stack, Typography, Badge, CardGrid, MetricCard } from '@/shared/ui';
import { ChartBarIcon, CurrencyDollarIcon, CubeIcon } from '@heroicons/react/24/outline';
import { useMaterialsComputed } from '../../hooks/useMaterialsComputed';
import { formatCurrency, formatPercentage } from '@/business-logic/shared/decimalUtils';

// Import chart components
import { ChartCard, PieChart, BarChart, LineChart } from '../MaterialsCharts';
import type { PieChartDataPoint, BarChartDataPoint, LineChartDataPoint } from '../MaterialsCharts';

export function AnalyticsTabEnhanced() {
  const { getFilteredItems } = useMaterialsComputed();
  const materials = getFilteredItems();

  // Calculate ABC analysis
  const totalValue = materials.reduce((sum, item) => sum + (item.stock * (item.unit_cost || 0)), 0);

  type MaterialWithABC = typeof materials[0] & { abcClass?: 'A' | 'B' | 'C' };

  const classA = materials.filter(item => (item as MaterialWithABC).abcClass === 'A');
  const classB = materials.filter(item => (item as MaterialWithABC).abcClass === 'B');
  const classC = materials.filter(item => (item as MaterialWithABC).abcClass === 'C');

  const valueA = classA.reduce((sum, item) => sum + (item.stock * (item.unit_cost || 0)), 0);
  const valueB = classB.reduce((sum, item) => sum + (item.stock * (item.unit_cost || 0)), 0);
  const valueC = classC.reduce((sum, item) => sum + (item.stock * (item.unit_cost || 0)), 0);

  // Prepare data for Pie Chart (ABC Distribution)
  const pieChartData: PieChartDataPoint[] = [
    { name: 'Clase A', value: valueA, color: '#e53e3e' }, // red.500
    { name: 'Clase B', value: valueB, color: '#dd6b20' }, // orange.500
    { name: 'Clase C', value: valueC, color: '#38a169' }  // green.500
  ].filter(item => item.value > 0);

  // Prepare data for Bar Chart (Top 10 by value)
  const top10ByValue: BarChartDataPoint[] = materials
    .map(item => {
      const materialABC = item as MaterialWithABC;
      const abcColor = materialABC.abcClass === 'A' ? '#e53e3e' :
                       materialABC.abcClass === 'B' ? '#dd6b20' : '#38a169';
      return {
        name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
        value: item.stock * (item.unit_cost || 0),
        color: abcColor
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Prepare data for Line Chart (Stock evolution - simulated for now)
  const last7Days: LineChartDataPoint[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      name: date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
      value: totalValue * (0.92 + Math.random() * 0.16) // Simulated variation ±8%
    };
  });

  return (
    <Stack direction="column" gap="xl">
      {/* Title */}
      <Typography variant="heading" size="lg">
        Analytics & Análisis ABC ({materials.length} items)
      </Typography>

      {/* ABC Metrics Cards */}
      <CardGrid columns={{ base: 1, md: 3 }}>
        <MetricCard
          title="Clase A - Alto Valor"
          value={`${classA.length} items`}
          subtitle={formatCurrency(valueA)}
          icon={CurrencyDollarIcon}
          colorPalette="red"
          trend={{
            value: totalValue > 0 ? (valueA / totalValue) * 100 : 0,
            isPositive: true
          }}
        />
        <MetricCard
          title="Clase B - Valor Medio"
          value={`${classB.length} items`}
          subtitle={formatCurrency(valueB)}
          icon={ChartBarIcon}
          colorPalette="orange"
          trend={{
            value: totalValue > 0 ? (valueB / totalValue) * 100 : 0,
            isPositive: true
          }}
        />
        <MetricCard
          title="Clase C - Bajo Valor"
          value={`${classC.length} items`}
          subtitle={formatCurrency(valueC)}
          icon={CubeIcon}
          colorPalette="green"
          trend={{
            value: totalValue > 0 ? (valueC / totalValue) * 100 : 0,
            isPositive: true
          }}
        />
      </CardGrid>

      {/* Charts Section */}
      <CardGrid columns={{ base: 1, lg: 2 }}>
        {/* ABC Distribution Pie Chart */}
        <ChartCard
          title="Distribución ABC del Inventario"
          description="Valor total por clasificación"
        >
          <PieChart
            data={pieChartData}
            showLegend
            height={300}
          />
        </ChartCard>

        {/* Stock Evolution Line Chart */}
        <ChartCard
          title="Evolución del Valor de Inventario"
          description="Últimos 7 días"
        >
          <LineChart
            data={last7Days}
            dataKey="value"
            color="#3182ce"
            showGrid
            height={300}
          />
        </ChartCard>
      </CardGrid>

      {/* Top 10 Bar Chart */}
      <ChartCard
        title="Top 10 Materiales por Valor"
        description="Materiales con mayor valor en stock"
      >
        <BarChart
          data={top10ByValue}
          dataKey="value"
          layout="horizontal"
          showGrid
          height={400}
        />
      </ChartCard>

      {/* Detailed ABC Analysis - Collapsible Lists */}
      <Stack direction="column" gap="md">
        <Typography variant="heading" size="md">
          Análisis Detallado por Clase
        </Typography>

        {(['A', 'B', 'C'] as const).map((abcClass) => {
          const classItems = materials.filter(item => (item as MaterialWithABC).abcClass === abcClass);
          const classValue = classItems.reduce((sum, item) => sum + (item.stock * (item.unit_cost || 0)), 0);
          const classColor = abcClass === 'A' ? 'red' : abcClass === 'B' ? 'orange' : 'green';

          if (classItems.length === 0) return null;

          return (
            <Stack
              key={abcClass}
              direction="column"
              gap="sm"
              p="md"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.200"
              bg={abcClass === 'A' ? 'red.50' : abcClass === 'B' ? 'orange.50' : 'green.50'}
            >
              <Stack direction="row" align="center" gap="sm" justify="space-between">
                <Stack direction="row" align="center" gap="sm">
                  <Typography variant="heading" size="md">
                    Clase {abcClass}
                  </Typography>
                  <Badge colorPalette={classColor} size="sm">
                    {classItems.length} items
                  </Badge>
                </Stack>
                <Typography variant="body" fontWeight="600">
                  {formatCurrency(classValue)} ({totalValue > 0 ? formatPercentage((classValue / totalValue) * 100) : '0%'})
                </Typography>
              </Stack>

              {/* Show first 5 items */}
              <Stack direction="column" gap="xs">
                {classItems.slice(0, 5).map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    justify="space-between"
                    align="center"
                    p="sm"
                    bg="white"
                    borderRadius="md"
                  >
                    <Stack direction="column" gap="xs">
                      <Typography variant="body" fontWeight="medium">
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="gray.500">
                        {item.category} • {item.stock} {item.unit}
                      </Typography>
                    </Stack>
                    <Stack direction="column" align="end" gap="xs">
                      <Typography variant="body" fontWeight="medium">
                        {formatCurrency(item.stock * (item.unit_cost || 0))}
                      </Typography>
                      <Typography variant="caption" color="gray.500">
                        {formatCurrency(item.unit_cost || 0)}/{item.unit}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
                {classItems.length > 5 && (
                  <Typography variant="caption" color="gray.600" textAlign="center">
                    ... y {classItems.length - 5} items más
                  </Typography>
                )}
              </Stack>
            </Stack>
          );
        })}
      </Stack>

      {/* Footer Note */}
      <Typography variant="caption" color="gray.500" textAlign="center">
        Clasificación ABC: A (Alto valor, 70-80% del valor) • B (Valor medio, 15-25%) • C (Bajo valor, 5-10%)
      </Typography>
    </Stack>
  );
}
