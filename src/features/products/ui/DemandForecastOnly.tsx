// src/features/products/ui/DemandForecastOnly.tsx
// Demand Forecast como sección independiente

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Grid,
  Progress
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface DemandForecast {
  product_id: string;
  product_name: string;
  historical_average: number;
  current_trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
  seasonal_factor: number;
  predicted_demand: number;
  confidence_level: number;
  recommended_production: number;
}

export function DemandForecastOnly() {
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecastData();
  }, []);

  const loadForecastData = async () => {
    setLoading(true);
    
    // Mock demand forecasts
    const mockForecasts: DemandForecast[] = [
      {
        product_id: 'prod_1',
        product_name: 'Pizza Margherita',
        historical_average: 45,
        current_trend: 'up',
        trend_percentage: 12,
        seasonal_factor: 1.2,
        predicted_demand: 60,
        confidence_level: 85,
        recommended_production: 65
      },
      {
        product_id: 'prod_2',
        product_name: 'Pasta Bolognese',
        historical_average: 28,
        current_trend: 'stable',
        trend_percentage: 0,
        seasonal_factor: 1.0,
        predicted_demand: 28,
        confidence_level: 78,
        recommended_production: 30
      },
      {
        product_id: 'prod_3',
        product_name: 'Caesar Salad',
        historical_average: 35,
        current_trend: 'down',
        trend_percentage: -8,
        seasonal_factor: 0.9,
        predicted_demand: 25,
        confidence_level: 72,
        recommended_production: 28
      }
    ];

    setForecasts(mockForecasts);
    setLoading(false);
  };

  const getTrendIcon = (trend: DemandForecast['current_trend']) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowTrendingUpIcon className="w-4 h-4 text-red-500 transform rotate-180" />;
      case 'stable': return <div className="w-4 h-4 border-t-2 border-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <VStack gap={4}>
          <ChartBarIcon className="w-12 h-12 text-gray-400" />
          <Text>Loading demand forecast data...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2} color="gray.700">
            Demand Forecast & Analytics
          </Text>
          <Text fontSize="sm" color="gray.600" mb={4}>
            AI-powered demand prediction for optimized production planning
          </Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={4}>
          {forecasts.map((forecast) => (
            <Card.Root key={forecast.product_id}>
              <Card.Header>
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontSize="lg">
                    {forecast.product_name}
                  </Text>
                  <HStack>
                    {getTrendIcon(forecast.current_trend)}
                    <Text fontSize="sm" color={
                      forecast.current_trend === 'up' ? 'green.600' : 
                      forecast.current_trend === 'down' ? 'red.600' : 'gray.600'
                    }>
                      {forecast.trend_percentage > 0 ? '+' : ''}{forecast.trend_percentage}%
                    </Text>
                  </HStack>
                </HStack>
              </Card.Header>

              <Card.Body>
                <VStack gap={3} align="stretch">
                  <Grid templateColumns="repeat(2, 1fr)" gap={3} fontSize="sm">
                    <VStack align="start" gap={1}>
                      <Text color="gray.600">Historical Avg</Text>
                      <Text fontWeight="bold">{forecast.historical_average}</Text>
                    </VStack>
                    <VStack align="start" gap={1}>
                      <Text color="gray.600">Predicted Demand</Text>
                      <Text fontWeight="bold" color="blue.600">{forecast.predicted_demand}</Text>
                    </VStack>
                  </Grid>

                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm" color="gray.600">Confidence Level</Text>
                      <Text fontSize="sm" fontWeight="bold">{forecast.confidence_level}%</Text>
                    </HStack>
                    <Progress.Root 
                      value={forecast.confidence_level} 
                      colorPalette={forecast.confidence_level > 80 ? 'green' : forecast.confidence_level > 60 ? 'yellow' : 'red'}
                      size="sm"
                    >
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>

                  <Box textAlign="center" p={3} bg="blue.50" borderRadius="md">
                    <Text fontSize="xs" color="gray.600">Recommended Production</Text>
                    <Text fontSize="xl" fontWeight="bold" color="blue.600">
                      {forecast.recommended_production}
                    </Text>
                    <Text fontSize="xs" color="gray.600">units</Text>
                  </Box>

                  <Button size="sm" colorPalette="blue">
                    Create Production Plan
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>
      </VStack>
    </Box>
  );
}