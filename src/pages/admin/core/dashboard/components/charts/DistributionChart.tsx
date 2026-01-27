/**
 * DistributionChart - Gráfico de distribución de revenue
 *
 * DISEÑO COPIADO DE: newdashboard/src/components/dashboard/charts/DistributionChart.tsx
 * ADAPTADO A: G-Admin Mini design system
 *
 * PieChart con Recharts mostrando distribución de revenue por categoría.
 *
 * @example
 * <DistributionChart data={distributionData} />
 */

import React from 'react';
import { Box, Stack, Typography, Badge } from '@/shared/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// TYPES
export interface DistributionChartProps {
  data?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

// DEFAULT DATA
const defaultData = [
  {
    name: 'Productos',
    value: 45,
    color: '#4299e1'
  },
  {
    name: 'Servicios',
    value: 30,
    color: '#48bb78'
  },
  {
    name: 'Membresías',
    value: 15,
    color: '#9f7aea'
  },
  {
    name: 'Otros',
    value: 10,
    color: '#ed8936'
  }
];

// COMPONENT
export const DistributionChart: React.FC<DistributionChartProps> = ({
  data = defaultData
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box bg="gray.100" p={6} borderRadius="2xl" height="100%">
      <Box mb={6}>
        <Typography variant="heading" size="lg" weight="bold" mb={1}>
          Distribución de Revenue
        </Typography>
        <Typography variant="body" size="sm" color="fg.muted">
          Por categoría
        </Typography>
      </Box>

      <Stack direction="row" gap={6} align="center" flexWrap="wrap">
        <Box flex="1" minW="250px">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a1929',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value: number) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <Stack direction="column" flex="1" align="stretch" gap="3" minW="200px">
          {data.map(item => (
            <Stack
              key={item.name}
              direction="row"
              justify="space-between"
              align="center"
              p={3}
              bg="gray.50"
              borderRadius="lg"
              borderLeft="3px solid"
              borderColor={item.color}
            >
              <Stack direction="row" gap={3}>
                <Box w="12px" h="12px" borderRadius="full" bg={item.color} />
                <Typography variant="body" size="sm" weight="medium">
                  {item.name}
                </Typography>
              </Stack>
              <Badge colorPalette="blue" fontSize="sm" px={3} py={1}>
                {item.value}%
              </Badge>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};
