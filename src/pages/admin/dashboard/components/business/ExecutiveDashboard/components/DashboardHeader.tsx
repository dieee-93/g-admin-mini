import {
  VStack,
  HStack,
  Text,
  Select,
  Button,
  IconButton,
  CardWrapper,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { Icon } from '@/shared/ui';
import { ArrowPathIcon, CogIcon } from '@heroicons/react/24/outline';
import { PERIOD_COLLECTION } from '../../constants';
import type { ExecutiveSummary } from '../../types';

interface DashboardHeaderProps {
  summary: ExecutiveSummary | null;
  selectedPeriod: string;
  isRefreshing: boolean;
  onPeriodChange: (period: string) => void;
  onRefresh: () => void;
  getPerformanceColor: (performance: string) => string;
}

export const DashboardHeader = ({
  summary,
  selectedPeriod,
  isRefreshing,
  onPeriodChange,
  onRefresh,
  getPerformanceColor,
}: DashboardHeaderProps) => {
  return (
    <VStack align="start" gap={3}>
      <HStack justify="space-between" w="full">
        <VStack align="start" gap={1}>
          <Text fontSize="3xl" fontWeight="bold">🏆 Executive Dashboard</Text>
          <Text color="gray.600">
            Strategic insights y KPIs ejecutivos para toma de decisiones de alto nivel
          </Text>
        </VStack>

        <HStack gap={2}>
          <Select.Root
            collection={PERIOD_COLLECTION}
            value={[selectedPeriod]}
            onValueChange={(details) => onPeriodChange(details.value[0])}
            width="150px"
            size="sm"
          >
            <Select.Trigger>
              <Select.ValueText placeholder="Período" />
            </Select.Trigger>
            <Select.Content>
              {PERIOD_COLLECTION.items.map(item => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            loading={isRefreshing}
            loadingText="Actualizando..."
          >
            <Icon icon={ArrowPathIcon} size="sm" />
          </Button>

          <IconButton size="sm" variant="outline">
            <Icon icon={CogIcon} size="sm" />
          </IconButton>
        </HStack>
      </HStack>

      {/* Performance Summary Banner */}
      {summary && (
        <CardWrapper .Root variant="outline" bg={`${getPerformanceColor(summary.overallPerformance)}.50`} w="full">
          <CardWrapper .Body p={4}>
            <HStack justify="space-between">
              <VStack align="start" gap={1}>
                <HStack gap={2}>
                  <Text fontSize="lg" fontWeight="bold" color={`${getPerformanceColor(summary.overallPerformance)}.700`}>
                    Rendimiento General: {summary.overallPerformance === 'excellent' ? 'Excelente' :
                                       summary.overallPerformance === 'good' ? 'Bueno' :
                                       summary.overallPerformance === 'fair' ? 'Regular' : 'Deficiente'}
                  </Text>
                  <Badge colorPalette={getPerformanceColor(summary.overallPerformance)}>
                    {summary.period}
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  Salud Financiera: {summary.financialHealth.score}/100 •
                  Eficiencia Operacional: {summary.operationalEfficiency.score}/100 •
                  Posición de Mercado: {summary.marketPosition.score}/100
                </Text>
              </VStack>

              <SimpleGrid columns={3} gap={4} fontSize="xs">
                <VStack>
                  <Text color="green.600" fontWeight="bold" fontSize="lg">
                    {summary.financialHealth.score}
                  </Text>
                  <Text color="gray.600">Financiero</Text>
                </VStack>
                <VStack>
                  <Text color="blue.600" fontWeight="bold" fontSize="lg">
                    {summary.operationalEfficiency.score}
                  </Text>
                  <Text color="gray.600">Operacional</Text>
                </VStack>
                <VStack>
                  <Text color="purple.600" fontWeight="bold" fontSize="lg">
                    {summary.marketPosition.score}
                  </Text>
                  <Text color="gray.600">Mercado</Text>
                </VStack>
              </SimpleGrid>
            </HStack>
          </CardWrapper .Body>
        </CardWrapper .Root>
      )}
    </VStack>
  );
};
