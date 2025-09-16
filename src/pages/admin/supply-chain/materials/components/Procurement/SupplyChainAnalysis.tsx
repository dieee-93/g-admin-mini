// SupplyChainAnalysis.tsx - Análisis de cadena de suministro
import React from 'react';
import { Section, Stack, Typography, CardWrapper, Badge } from '@/shared/ui';
import { TruckIcon, BuildingStorefrontIcon, ClockIcon } from '@heroicons/react/24/outline';

export function SupplyChainAnalysis() {
  // Mock data - replace with real data from services
  const suppliers = [
    { id: '1', name: 'Proveedor A', performance: 95, deliveryTime: '2-3 días', reliability: 'high' },
    { id: '2', name: 'Proveedor B', performance: 78, deliveryTime: '5-7 días', reliability: 'medium' },
    { id: '3', name: 'Proveedor C', performance: 88, deliveryTime: '1-2 días', reliability: 'high' }
  ];

  return (
    <Section variant="elevated" title="Supply Chain Analysis">
      <Stack gap="lg">
        <Typography variant="body" color="text.muted">
          Análisis completo de la cadena de suministro, rendimiento de proveedores y optimización de procesos.
        </Typography>

        <Stack gap="md">
          {suppliers.map((supplier) => (
            <CardWrapper key={supplier.id} variant="outline" padding="md">
              <CardWrapper.Body>
                <Stack direction="row" justify="space-between" align="center">
                  <Stack direction="column" gap="xs">
                    <Typography variant="subtitle">{supplier.name}</Typography>
                    <Stack direction="row" gap="sm" align="center">
                      <TruckIcon className="w-4 h-4 text-gray-500" />
                      <Typography variant="caption">{supplier.deliveryTime}</Typography>
                      <ClockIcon className="w-4 h-4 text-gray-500" />
                      <Typography variant="caption">Performance: {supplier.performance}%</Typography>
                    </Stack>
                  </Stack>
                  <Badge
                    colorPalette={
                      supplier.reliability === 'high' ? 'success' :
                      supplier.reliability === 'medium' ? 'warning' : 'error'
                    }
                  >
                    {supplier.reliability}
                  </Badge>
                </Stack>
              </CardWrapper.Body>
            </CardWrapper>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}

export default SupplyChainAnalysis;