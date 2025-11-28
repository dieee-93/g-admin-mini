import React from 'react';
import { Box, Text, Flex, VStack, HStack, Badge } from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
interface DistributionChartProps {
  data?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}
const defaultData = [{
  name: 'Productos',
  value: 45,
  color: '#4299e1'
}, {
  name: 'Servicios',
  value: 30,
  color: '#48bb78'
}, {
  name: 'Membresías',
  value: 15,
  color: '#9f7aea'
}, {
  name: 'Otros',
  value: 10,
  color: '#ed8936'
}];
export const DistributionChart: React.FC<DistributionChartProps> = ({
  data = defaultData
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return <Box bg="#152a47" p={6} borderRadius="2xl" height="100%">
      <Box mb={6}>
        <Text fontSize="lg" fontWeight="bold" color="white" mb={1}>
          Distribución de Revenue
        </Text>
        <Text fontSize="sm" color="whiteAlpha.600">
          Por categoría
        </Text>
      </Box>
      <Flex gap={6} align="center" flexWrap="wrap">
        <Box flex="1" minW="250px">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{
              backgroundColor: '#0a1929',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white'
            }} formatter={(value: number) => [`${value}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <VStack flex="1" align="stretch" spacing={3} minW="200px">
          {data.map(item => <Flex key={item.name} justify="space-between" align="center" p={3} bg="#0a1929" borderRadius="lg" borderLeft="3px solid" borderColor={item.color}>
              <HStack spacing={3}>
                <Box w="12px" h="12px" borderRadius="full" bg={item.color} />
                <Text fontSize="sm" color="white" fontWeight="medium">
                  {item.name}
                </Text>
              </HStack>
              <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                {item.value}%
              </Badge>
            </Flex>)}
        </VStack>
      </Flex>
    </Box>;
};