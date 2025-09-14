import { useMemo } from 'react';
import { Table, VStack, Text, Badge } from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import { CompetitorData } from '../types';

interface PricingAnalysisPanelProps {
  competitors: CompetitorData[];
}

export function PricingAnalysisPanel({ competitors }: PricingAnalysisPanelProps) {
  // Aggregate pricing data across all competitors
  const aggregatedPricing = useMemo(() => {
    if (competitors.length === 0) return [];

    const categories = ['Principales', 'Entradas', 'Postres', 'Bebidas', 'Especiales'];

    return categories.map(category => {
      const competitorPrices = competitors.map(c =>
        c.pricingIntelligence.find(p => p.categoryName === category)
      ).filter(Boolean);

      const avgCompetitorPrice = competitorPrices.reduce((sum, p) => sum + (p?.competitorPrice || 0), 0) / competitorPrices.length;
      const ourPrice = competitorPrices[0]?.ourPrice || Math.random() * 25 + 10;
      const priceDifference = ((ourPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100;

      return {
        categoryName: category,
        ourPrice,
        avgCompetitorPrice,
        priceDifference,
        pricePosition: Math.abs(priceDifference) < 5 ? 'competitive' : priceDifference > 0 ? 'premium' : 'discount',
        recommendedAction: Math.abs(priceDifference) < 5 ? 'maintain' :
                          Math.abs(priceDifference) < 15 ? 'monitor' :
                          priceDifference > 0 ? 'decrease' : 'increase'
      };
    });
  }, [competitors]);

  return (
    <VStack gap="6" align="stretch">
      <CardWrapper>
        <CardWrapper.Header>
          <Text fontWeight="bold">Análisis Comparativo de Precios</Text>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Categoría</Table.ColumnHeader>
                <Table.ColumnHeader>Nuestro Precio</Table.ColumnHeader>
                <Table.ColumnHeader>Precio Competencia</Table.ColumnHeader>
                <Table.ColumnHeader>Diferencia</Table.ColumnHeader>
                <Table.ColumnHeader>Posición</Table.ColumnHeader>
                <Table.ColumnHeader>Recomendación</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {aggregatedPricing.map((pricing) => (
                <Table.Row key={pricing.categoryName}>
                  <Table.Cell>
                    <Text fontWeight="medium">{pricing.categoryName}</Text>
                  </Table.Cell>

                  <Table.Cell>
                    <Text fontWeight="medium">${pricing.ourPrice.toFixed(2)}</Text>
                  </Table.Cell>

                  <Table.Cell>
                    <Text>${pricing.avgCompetitorPrice.toFixed(2)}</Text>
                  </Table.Cell>

                  <Table.Cell>
                    <Text color={pricing.priceDifference > 0 ? "red.600" : pricing.priceDifference < 0 ? "green.600" : "gray.600"}>
                      {pricing.priceDifference > 0 ? '+' : ''}{pricing.priceDifference.toFixed(1)}%
                    </Text>
                  </Table.Cell>

                  <Table.Cell>
                    <Badge
                      colorPalette={
                        pricing.pricePosition === 'premium' ? 'purple' :
                        pricing.pricePosition === 'competitive' ? 'green' : 'blue'
                      }
                      size="sm"
                    >
                      {pricing.pricePosition === 'premium' ? 'Premium' :
                       pricing.pricePosition === 'competitive' ? 'Competitivo' : 'Descuento'}
                    </Badge>
                  </Table.Cell>

                  <Table.Cell>
                    <Badge
                      colorPalette={
                        pricing.recommendedAction === 'maintain' ? 'green' :
                        pricing.recommendedAction === 'monitor' ? 'yellow' : 'orange'
                      }
                      size="sm"
                    >
                      {pricing.recommendedAction === 'maintain' ? 'Mantener' :
                       pricing.recommendedAction === 'monitor' ? 'Monitorear' :
                       pricing.recommendedAction === 'increase' ? 'Aumentar' : 'Reducir'}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </CardWrapper.Body>
      </CardWrapper>
    </VStack>
  );
}
