import React from 'react';
import { Box, Text, Flex, SimpleGrid } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
interface MetricsBarChartProps {
  data?: Array<{
    category: string;
    actual: number;
    objetivo: number;
  }>;
}
const defaultData = [{
  category: 'Ventas',
  actual: 85,
  objetivo: 100
}, {
  category: 'Clientes',
  actual: 92,
  objetivo: 100
}, {
  category: 'Órdenes',
  actual: 78,
  objetivo: 100
}, {
  category: 'Revenue',
  actual: 88,
  objetivo: 100
}, {
  category: 'Satisfacción',
  actual: 95,
  objetivo: 100
}];
export const MetricsBarChart: React.FC<MetricsBarChartProps> = ({
  data = defaultData
}) => {
  return <Box bg="#152a47" p={6} borderRadius="2xl" height="100%">
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="white" mb={1}>
            Performance vs Objetivos
          </Text>
          <Text fontSize="sm" color="whiteAlpha.600">
            Métricas del mes actual
          </Text>
        </Box>
      </Flex>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="category" stroke="rgba(255,255,255,0.5)" style={{
          fontSize: '12px'
        }} />
          <YAxis stroke="rgba(255,255,255,0.5)" style={{
          fontSize: '12px'
        }} domain={[0, 100]} />
          <Tooltip contentStyle={{
          backgroundColor: '#0a1929',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: 'white'
        }} formatter={(value: number) => [`${value}%`, '']} />
          <Legend wrapperStyle={{
          paddingTop: '20px',
          color: 'white'
        }} />
          <Bar dataKey="actual" fill="#4299e1" radius={[8, 8, 0, 0]} />
          <Bar dataKey="objetivo" fill="rgba(255,255,255,0.2)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>;
};