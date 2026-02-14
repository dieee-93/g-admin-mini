import { SimpleGrid, Text, CardWrapper } from '@/shared/ui';

interface ReportingSummaryProps {
  summary: {
    totalTemplates: number;
    activeTemplates: number;
    scheduledReports: number;
    totalGenerated: number;
    activeAutomations: number;
    totalInsights: number;
  };
}

export function ReportingSummary({ summary }: ReportingSummaryProps) {
  return (
    <SimpleGrid columns={{ base: 2, md: 6 }} gap="4" w="full">
      <CardWrapper variant="subtle" bg="blue.50">
        <CardWrapper.Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="blue.600">
            {summary.totalTemplates}
          </Text>
          <Text fontSize="sm" color="gray.600">Plantillas</Text>
        </CardWrapper.Body>
      </CardWrapper>

      <CardWrapper variant="subtle" >
        <CardWrapper.Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="green.600">
            {summary.activeTemplates}
          </Text>
          <Text fontSize="sm" color="gray.600">Activas</Text>
        </CardWrapper.Body>
      </CardWrapper>

      <CardWrapper variant="subtle" bg="purple.50">
        <CardWrapper.Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="purple.600">
            {summary.scheduledReports}
          </Text>
          <Text fontSize="sm" color="gray.600">Programados</Text>
        </CardWrapper.Body>
      </CardWrapper>

      <CardWrapper variant="subtle" bg="orange.50">
        <CardWrapper.Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="orange.600">
            {summary.totalGenerated}
          </Text>
          <Text fontSize="sm" color="gray.600">Generados</Text>
        </CardWrapper.Body>
      </CardWrapper>

      <CardWrapper variant="subtle" bg="pink.50">
        <CardWrapper.Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="pink.600">
            {summary.activeAutomations}
          </Text>
          <Text fontSize="sm" color="gray.600">Automatizaciones</Text>
        </CardWrapper.Body>
      </CardWrapper>

      <CardWrapper variant="subtle" bg="yellow.50">
        <CardWrapper.Body p="4" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
            {summary.totalInsights}
          </Text>
          <Text fontSize="sm" color="gray.600">Insights</Text>
        </CardWrapper.Body>
      </CardWrapper>
    </SimpleGrid>
  );
}
