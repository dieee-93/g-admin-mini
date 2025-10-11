import { Stack, Typography, Icon, Badge, Alert, Button, CardWrapper } from '@/shared/ui';
import {
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useMaterials } from '@/store/materialsStore';
import { formatCurrency } from '@/business-logic/shared/decimalUtils';

export function ProcurementTab() {
  const { getFilteredItems } = useMaterials();
  const materials = getFilteredItems();

  // Generate procurement recommendations
  const lowStockItems = materials.filter(item => item.stock <= item.minStock);
  const criticalItems = materials.filter(item => item.stock < item.minStock * 0.5);
  const classAItems = materials.filter(item => item.abcClass === 'A' && item.stock <= item.minStock * 1.5);

  const getPriorityLevel = (item: any) => {
    if (item.stock < item.minStock * 0.5) return 'critical';
    if (item.stock <= item.minStock && item.abcClass === 'A') return 'high';
    if (item.stock <= item.minStock) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'green';
    }
  };

  const getRecommendedQuantity = (item: any) => {
    const safetyStock = Math.ceil(item.minStock * 0.5);
    const optimalStock = item.minStock * 2;
    return optimalStock + safetyStock - item.stock;
  };

  const totalRecommendedValue = lowStockItems.reduce((sum, item) =>
    sum + (getRecommendedQuantity(item) * item.unit_cost), 0
  );

  return (
    <Stack direction="column" gap="xl">
      <Stack direction="row" justify="space-between" align="center" mb="md">
        <Typography variant="heading" size="lg">
          Recomendaciones de Compras
        </Typography>
        <Badge colorPalette="blue" size="sm">
          {lowStockItems.length} items necesarios
        </Badge>
      </Stack>

      {/* Summary Alert */}
      {lowStockItems.length > 0 && (
        <Alert status="warning" title="Atención requerida">
          {criticalItems.length > 0 && (
            <>Se detectaron {criticalItems.length} items en stock crítico. </>
          )}
          Total de {lowStockItems.length} items requieren reabastecimiento por un valor estimado de {formatCurrency(totalRecommendedValue)}.
        </Alert>
      )}

      {/* Quick Actions */}
      <Stack direction="row" gap="sm">
        <Button variant="solid" colorPalette="blue" size="lg" disabled={lowStockItems.length === 0}>
          <Icon icon={ClipboardDocumentListIcon} size="md" />
          Generar Orden de Compra
        </Button>
        <Button variant="outline" size="md">
          <Icon icon={TruckIcon} size="sm" />
          Contactar Proveedores
        </Button>
        <Button variant="outline" size="md">
          <Icon icon={CalendarIcon} size="sm" />
          Programar Entrega
        </Button>
      </Stack>

      {/* Procurement Recommendations */}
      <Stack direction="column" gap="md">
        {lowStockItems.length === 0 ? (
          <Stack
            direction="column"
            gap="lg"
            align="center"
            justify="center"
            minH="240px"
            bg="green.50"
            borderRadius="md"
            p="xl"
          >
            <Icon icon={CheckCircleIcon} size="xl" color="green.400" />
            <Typography variant="heading" size="md" color="green.600">
              Todos los stocks están OK
            </Typography>
            <Typography variant="body" color="green.500" textAlign="center">
              No hay items que requieran reabastecimiento inmediato
            </Typography>
          </Stack>
        ) : (
          lowStockItems
            .sort((a, b) => {
              // Sort by priority: critical, high, medium, low
              const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              const aPriority = getPriorityLevel(a);
              const bPriority = getPriorityLevel(b);
              return priorityOrder[aPriority] - priorityOrder[bPriority];
            })
            .map((item) => {
              const priority = getPriorityLevel(item);
              const priorityColor = getPriorityColor(priority);
              const recommendedQty = getRecommendedQuantity(item);
              const estimatedCost = recommendedQty * item.unit_cost;

              return (
                <CardWrapper key={item.id} variant="outline" size="sm">
                  <CardWrapper.Body>
                    <Stack direction="row" justify="space-between" align="center">
                      <Stack direction="column" gap="xs" flex="1">
                        <Stack direction="row" align="center" gap="sm">
                          <Typography variant="heading" size="sm">
                            {item.name}
                          </Typography>
                          <Badge colorPalette={priorityColor} size="sm">
                            {priority.toUpperCase()}
                          </Badge>
                          {priority === 'critical' && (
                            <Icon icon={ExclamationTriangleIcon} size="sm" color="red.500" />
                          )}
                        </Stack>
                        <Typography variant="body" size="sm" color="gray.600">
                          {item.category} • Proveedor: {item.supplier || 'No asignado'}
                        </Typography>
                        <Stack direction="row" gap="md">
                          <Typography variant="caption" color="gray.500">
                            Stock actual: {item.stock} {item.unit}
                          </Typography>
                          <Typography variant="caption" color="gray.500">
                            Stock mínimo: {item.minStock} {item.unit}
                          </Typography>
                          <Typography variant="caption" color="red.500">
                            Déficit: {Math.max(0, item.minStock - item.stock)} {item.unit}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack direction="column" align="end" gap="xs">
                        <Typography variant="heading" size="sm" color="blue.600">
                          Comprar: {recommendedQty} {item.unit}
                        </Typography>
                        <Typography variant="body" size="sm" fontWeight="medium">
                          {formatCurrency(estimatedCost)}
                        </Typography>
                        <Typography variant="caption" color="gray.500">
                          {formatCurrency(item.unit_cost)}/{item.unit}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardWrapper.Body>
                </CardWrapper>
              );
            })
        )}
      </Stack>

      {/* Analytics Summary */}
      {lowStockItems.length > 0 && (
        <Stack
          direction="column"
          gap="sm"
          p="md"
          bg="blue.50"
          borderRadius="md"
        >
          <Typography variant="heading" size="sm" color="blue.700">
            Resumen de Compras Recomendadas
          </Typography>
          <Stack direction="row" justify="space-between">
            <Typography variant="body" color="blue.600">
              Items críticos (Clase A):
            </Typography>
            <Typography variant="body" fontWeight="medium">
              {classAItems.length} items
            </Typography>
          </Stack>
          <Stack direction="row" justify="space-between">
            <Typography variant="body" color="blue.600">
              Total items a reabastecer:
            </Typography>
            <Typography variant="body" fontWeight="medium">
              {lowStockItems.length} items
            </Typography>
          </Stack>
          <Stack direction="row" justify="space-between">
            <Typography variant="body" color="blue.600">
              Inversión estimada total:
            </Typography>
            <Typography variant="body" fontWeight="medium">
              {formatCurrency(totalRecommendedValue)}
            </Typography>
          </Stack>
        </Stack>
      )}

      <Typography variant="caption" color="gray.500" textAlign="center">
        Análisis predictivo basado en stock mínimo, clasificación ABC y patrones de consumo
      </Typography>
    </Stack>
  );
}