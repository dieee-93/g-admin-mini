import {
  SimpleGrid,
  CardWrapper,
  Text,
} from '@chakra-ui/react';

interface DashboardMetrics {
  criticalKPIs: number;
  improvingKPIs: number;
  decliningKPIs: number;
  targetsMet: number;
  targetAchievementRate: number;
}

interface QuickStatsProps {
  kpis: any[];
  dashboardMetrics: DashboardMetrics | null;
}

export const QuickStats = ({ kpis, dashboardMetrics }: QuickStatsProps) => {
  if (!dashboardMetrics) return null;

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full">
      <CardWrapper .Root variant="subtle" bg="blue.50">
        <CardWrapper .Body p={4} textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="blue.600">
            {kpis.length}
          </Text>
          <Text fontSize="sm" color="gray.600">KPIs Monitoreados</Text>
        </CardWrapper .Body>
      </CardWrapper .Root>

      <CardWrapper .Root variant="subtle" >
        <CardWrapper .Body p={4} textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="green.600">
            {dashboardMetrics.improvingKPIs}
          </Text>
          <Text fontSize="sm" color="gray.600">Mejorando</Text>
        </CardWrapper .Body>
      </CardWrapper .Root>

      <CardWrapper .Root variant="subtle" bg="red.50">
        <CardWrapper .Body p={4} textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="red.600">
            {dashboardMetrics.criticalKPIs}
          </Text>
          <Text fontSize="sm" color="gray.600">Críticos</Text>
        </CardWrapper .Body>
      </CardWrapper .Root>

      <CardWrapper .Root variant="subtle" bg="purple.50">
        <CardWrapper .Body p={4} textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="purple.600">
            {Math.round(dashboardMetrics.targetAchievementRate)}%
          </Text>
          <Text fontSize="sm" color="gray.600">Objetivos Alcanzados</Text>
        </CardWrapper .Body>
      </CardWrapper .Root>
    </SimpleGrid>
  );
};
