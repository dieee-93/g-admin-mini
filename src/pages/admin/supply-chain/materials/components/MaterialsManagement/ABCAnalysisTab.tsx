import { Stack, Typography, Icon, Badge, CardGrid, MetricCard, CardWrapper } from '@/shared/ui';
import { ChartBarIcon, CurrencyDollarIcon, CubeIcon } from '@heroicons/react/24/outline';
import { useMaterials } from '@/store/materialsStore';
import { formatCurrency, formatPercentage } from '@/business-logic/shared/decimalUtils';

export function ABCAnalysisTab() {
  const { getFilteredItems } = useMaterials();
  const materials = getFilteredItems();

  // Calculate ABC analysis
  const totalValue = materials.reduce((sum, item) => sum + (item.stock * (item.unit_cost || 0)), 0);

  const classA = materials.filter(item => item.abcClass === 'A');
  const classB = materials.filter(item => item.abcClass === 'B');
  const classC = materials.filter(item => item.abcClass === 'C');

  const valueA = classA.reduce((sum, item) => sum + (item.stock * (item.unit_cost || 0)), 0);
  const valueB = classB.reduce((sum, item) => sum + (item.stock * (item.unit_cost || 0)), 0);
  const valueC = classC.reduce((sum, item) => sum + (item.stock * (item.unit_cost || 0)), 0);

  const getClassColor = (abcClass: string) => {
    switch (abcClass) {
      case 'A': return 'red';
      case 'B': return 'orange';
      case 'C': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Stack direction="column" gap="lg">
      <Typography variant="heading" size="lg">
        Análisis ABC ({materials.length} items)
      </Typography>

      {/* ABC Metrics */}
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

      {/* ABC Items by Class */}
      <Stack direction="column" gap="md">
        {['A', 'B', 'C'].map((abcClass) => {
          const classItems = materials.filter(item => item.abcClass === abcClass);
          const classValue = classItems.reduce((sum, item) => sum + (item.stock * (item.unit_cost || 0)), 0);
          const classColor = getClassColor(abcClass);

          return (
            <Stack key={abcClass} direction="column" gap="sm">
              <Stack direction="row" align="center" gap="sm">
                <Typography variant="heading" size="md">
                  Clase {abcClass}
                </Typography>
                <Badge colorPalette={classColor} size="sm">
                  {classItems.length} items
                </Badge>
                <Typography variant="body" color="gray.600">
                  {formatCurrency(classValue)} ({totalValue > 0 ? formatPercentage((classValue / totalValue) * 100) : '0%'})
                </Typography>
              </Stack>

              {classItems.length === 0 ? (
                <Typography variant="body" color="gray.500" p="md">
                  No hay items en la Clase {abcClass}
                </Typography>
              ) : (
                <Stack direction="column" gap="xs">
                  {classItems.map((item) => (
                    <CardWrapper key={item.id} variant="outline" size="sm">
                      <CardWrapper.Body>
                        <Stack direction="row" justify="space-between" align="center">
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
                      </CardWrapper.Body>
                    </CardWrapper>
                  ))}
                </Stack>
              )}
            </Stack>
          );
        })}
      </Stack>

      <Typography variant="caption" color="gray.500" textAlign="center">
        Clasificación ABC: A (Alto valor, alto impacto) • B (Valor medio, control moderado) • C (Bajo valor, control básico)
      </Typography>
    </Stack>
  );
}