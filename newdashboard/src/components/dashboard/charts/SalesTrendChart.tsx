import React from 'react';
import { Box, Text, Flex, Badge } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
interface SalesTrendChartProps {
  data?: Array<{
    date: string;
    ventas: number;
    ordenes: number;
  }>;
}
const defaultData = [{
  date: 'Lun',
  ventas: 45,
  ordenes: 32
}, {
  date: 'Mar',
  ventas: 52,
  ordenes: 38
}, {
  date: 'Mié',
  ventas: 48,
  ordenes: 35
}, {
  date: 'Jue',
  ventas: 61,
  ordenes: 42
}, {
  date: 'Vie',
  ventas: 55,
  ordenes: 40
}, {
  date: 'Sáb',
  ventas: 67,
  ordenes: 48
}, {
  date: 'Dom',
  ventas: 43,
  ordenes: 30
}];
export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  data = defaultData
}) => {
  return <Box bg="#152a47" p={6} borderRadius="2xl" height="100%">
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="white" mb={1}>
            Tendencia de Ventas
          </Text>
          <Text fontSize="sm" color="whiteAlpha.600">
            Últimos 7 días
          </Text>
        </Box>
        <Flex gap={3}>
          <Badge colorScheme="green" px={3} py={1} borderRadius="full">
            Ventas
          </Badge>
          <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
            Órdenes
          </Badge>
        </Flex>
      </Flex>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{
          fontSize: '12px'
        }} />
          <YAxis stroke="rgba(255,255,255,0.5)" style={{
          fontSize: '12px'
        }} />
          <Tooltip contentStyle={{
          backgroundColor: '#0a1929',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: 'white'
        }} />
          <Legend wrapperStyle={{
          paddingTop: '20px',
          color: 'white'
        }} />
          <Line type="monotone" dataKey="ventas" stroke="#48bb78" strokeWidth={3} dot={{
          fill: '#48bb78',
          r: 5
        }} activeDot={{
          r: 7
        }} />
          <Line type="monotone" dataKey="ordenes" stroke="#4299e1" strokeWidth={3} dot={{
          fill: '#4299e1',
          r: 5
        }} activeDot={{
          r: 7
        }} />
        </LineChart>
      </ResponsiveContainer>
    </Box>;
};