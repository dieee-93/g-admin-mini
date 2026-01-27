// ============================================
// SUPPLIER COMPARISON CHART
// ============================================
// Visual comparison of multiple suppliers using Recharts

import { VStack, Text, Card, HStack, Badge, Box, Tabs } from '@/shared/ui';
import type { SupplierAnalysis } from '@/modules/materials/services';
import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

interface SupplierComparisonChartProps {
  data: SupplierAnalysis[];
}

/**
 * Supplier Comparison Chart Component
 * Shows visual comparison between suppliers using Recharts
 * Provides both Radar Chart and Bar Chart visualizations
 */
export function SupplierComparisonChart({ data }: SupplierComparisonChartProps) {
  // Sort suppliers by overall rating
  const sortedSuppliers = useMemo(() => {
    return [...data].sort((a, b) => b.overallRating - a.overallRating);
  }, [data]);

  // Prepare data for Radar Chart (compare top 3 suppliers)
  const radarData = useMemo(() => {
    const top3 = sortedSuppliers.slice(0, 3);

    return [
      {
        metric: 'Calidad',
        ...Object.fromEntries(top3.map((s, idx) => [`supplier${idx}`, s.metrics.qualityScore]))
      },
      {
        metric: 'Entregas',
        ...Object.fromEntries(top3.map((s, idx) => [`supplier${idx}`, s.metrics.onTimeDeliveryRate]))
      },
      {
        metric: 'Estabilidad',
        ...Object.fromEntries(top3.map((s, idx) => [`supplier${idx}`, s.metrics.costStability]))
      },
      {
        metric: 'Servicio',
        ...Object.fromEntries(top3.map((s, idx) => [`supplier${idx}`, s.metrics.responsiveness]))
      }
    ];
  }, [sortedSuppliers]);

  // Prepare data for Bar Chart (all suppliers by rating)
  const barData = useMemo(() => {
    return sortedSuppliers.map(supplier => ({
      name: supplier.name.length > 20 ? supplier.name.substring(0, 20) + '...' : supplier.name,
      fullName: supplier.name,
      rating: supplier.overallRating,
      itemCount: supplier.itemCount,
      totalValue: supplier.totalAnnualValue
    }));
  }, [sortedSuppliers]);

  const top3Suppliers = sortedSuppliers.slice(0, 3);
  const supplierColors = ['#3b82f6', '#10b981', '#f59e0b']; // blue, green, orange

  return (
    <VStack align="stretch" gap="6">
      <Text fontSize="xl" fontWeight="bold">
        Comparación Visual de Proveedores
      </Text>

      <Tabs.Root defaultValue="radar" variant="enclosed">
        <Tabs.List>
          <Tabs.Trigger value="radar">Vista Radar (Top 3)</Tabs.Trigger>
          <Tabs.Trigger value="bar">Vista Barras (Todos)</Tabs.Trigger>
        </Tabs.List>

        {/* Radar Chart - Top 3 Suppliers */}
        <Tabs.Content value="radar">
          <Card.Root>
            <Card.Body>
              <VStack align="stretch" gap="4">
                <Text fontSize="md" fontWeight="semibold">
                  Comparación de Métricas - Top 3 Proveedores
                </Text>

                <Box height="400px" width="full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      {top3Suppliers.map((supplier, idx) => (
                        <Radar
                          key={supplier.id}
                          name={supplier.name}
                          dataKey={`supplier${idx}`}
                          stroke={supplierColors[idx]}
                          fill={supplierColors[idx]}
                          fillOpacity={0.3}
                        />
                      ))}
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>

                {/* Top 3 Summary */}
                <HStack justify="space-around" flexWrap="wrap" gap="4">
                  {top3Suppliers.map((supplier, idx) => (
                    <VStack key={supplier.id} gap="1">
                      <HStack gap="2">
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            backgroundColor: supplierColors[idx],
                            borderRadius: 4
                          }}
                        />
                        <Text fontSize="sm" fontWeight="semibold">
                          {supplier.name}
                        </Text>
                      </HStack>
                      <HStack gap="1">
                        <Badge colorPalette={getRatingColor(supplier.overallRating)} size="sm">
                          {supplier.overallRating.toFixed(0)}
                        </Badge>
                        <Text fontSize="xs" color="fg.muted">
                          {supplier.itemCount} items
                        </Text>
                      </HStack>
                    </VStack>
                  ))}
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>

        {/* Bar Chart - All Suppliers */}
        <Tabs.Content value="bar">
          <Card.Root>
            <Card.Body>
              <VStack align="stretch" gap="4">
                <Text fontSize="md" fontWeight="semibold">
                  Rating General por Proveedor
                </Text>

                <Box height="400px" width="full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis domain={[0, 100]} label={{ value: 'Rating', angle: -90, position: 'insideLeft' }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <Card.Root size="sm">
                                <Card.Body p="3">
                                  <VStack align="start" gap="1">
                                    <Text fontSize="sm" fontWeight="bold">
                                      {data.fullName}
                                    </Text>
                                    <Text fontSize="sm">
                                      Rating: {data.rating.toFixed(0)}
                                    </Text>
                                    <Text fontSize="xs" color="fg.muted">
                                      {data.itemCount} items
                                    </Text>
                                    <Text fontSize="xs" color="fg.muted">
                                      {new Intl.NumberFormat('es-AR', {
                                        style: 'currency',
                                        currency: 'ARS',
                                        minimumFractionDigits: 0
                                      }).format(data.totalValue)}
                                    </Text>
                                  </VStack>
                                </Card.Body>
                              </Card.Root>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="rating">
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBarColor(entry.rating)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                {/* Legend */}
                <HStack justify="center" gap="4" flexWrap="wrap">
                  <HStack>
                    <div style={{ width: 16, height: 16, backgroundColor: '#10b981', borderRadius: 4 }} />
                    <Text fontSize="sm">Excelente (85+)</Text>
                  </HStack>
                  <HStack>
                    <div style={{ width: 16, height: 16, backgroundColor: '#3b82f6', borderRadius: 4 }} />
                    <Text fontSize="sm">Bueno (70-84)</Text>
                  </HStack>
                  <HStack>
                    <div style={{ width: 16, height: 16, backgroundColor: '#eab308', borderRadius: 4 }} />
                    <Text fontSize="sm">Regular (55-69)</Text>
                  </HStack>
                  <HStack>
                    <div style={{ width: 16, height: 16, backgroundColor: '#f97316', borderRadius: 4 }} />
                    <Text fontSize="sm">Malo (40-54)</Text>
                  </HStack>
                  <HStack>
                    <div style={{ width: 16, height: 16, backgroundColor: '#ef4444', borderRadius: 4 }} />
                    <Text fontSize="sm">Crítico (&lt;40)</Text>
                  </HStack>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>
      </Tabs.Root>
    </VStack>
  );
}

/**
 * Get color palette based on rating (for Chakra Badge)
 */
function getRatingColor(rating: number): string {
  if (rating >= 85) return 'green';
  if (rating >= 70) return 'blue';
  if (rating >= 55) return 'yellow';
  if (rating >= 40) return 'orange';
  return 'red';
}

/**
 * Get hex color for bar chart based on rating
 */
function getBarColor(rating: number): string {
  if (rating >= 85) return '#10b981'; // green
  if (rating >= 70) return '#3b82f6'; // blue
  if (rating >= 55) return '#eab308'; // yellow
  if (rating >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}
