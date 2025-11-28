import React from 'react';
import { Box, Text, Flex, Icon } from '@chakra-ui/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
interface RevenueAreaChartProps {
  data?: Array<{
    date: string;
    revenue: number;
  }>;
}
const defaultData = [{
  date: 'Ene',
  revenue: 12400
}, {
  date: 'Feb',
  revenue: 14800
}, {
  date: 'Mar',
  revenue: 13200
}, {
  date: 'Abr',
  revenue: 16500
}, {
  date: 'May',
  revenue: 18900
}, {
  date: 'Jun',
  revenue: 21300
}, {
  date: 'Jul',
  revenue: 19800
}, {
  date: 'Ago',
  revenue: 23400
}, {
  date: 'Sep',
  revenue: 25100
}, {
  date: 'Oct',
  revenue: 27800
}, {
  date: 'Nov',
  revenue: 26500
}, {
  date: 'Dic',
  revenue: 31200
}];
export const RevenueAreaChart: React.FC<RevenueAreaChartProps> = ({
  data = defaultData
}) => {
  return <Box bg="#152a47" p={6} borderRadius="2xl" height="100%">
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="white" mb={1}>
            Revenue Acumulado
          </Text>
          <Text fontSize="sm" color="whiteAlpha.600">
            Últimos 12 meses
          </Text>
        </Box>
        <Flex align="center" gap={2}>
          <Icon as={TrendingUp} color="green.400" boxSize={5} />
          <Text fontSize="sm" fontWeight="semibold" color="green.400">
            +24.5%
          </Text>
        </Flex>
      </Flex>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#48bb78" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#48bb78" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{
          fontSize: '12px'
        }} />
          <YAxis stroke="rgba(255,255,255,0.5)" style={{
          fontSize: '12px'
        }} tickFormatter={value => `$${value / 1000}K`} />
          <Tooltip contentStyle={{
          backgroundColor: '#0a1929',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: 'white'
        }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
          <Area type="monotone" dataKey="revenue" stroke="#48bb78" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </Box>;
};