// src/features/products/ui/DemandForecastOnly.tsx
// Demand Forecast como sección independiente

import React, { useState, useEffect } from 'react';
import {
  Card,
  VStack,
  HStack,
  Typography,
  Button,
  Badge,
  Grid
} from '@/shared/ui';
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
      <div className="p-6 text-center">
        <VStack gap="md">
          <ChartBarIcon className="w-12 h-12 text-gray-400" />
          <Typography variant="body">Loading demand forecast data...</Typography>
        </VStack>
      </div>
    );
  }

  return (
    <div>
      <VStack gap="lg" align="stretch">
        <div>
          <Typography variant="heading" className="text-lg font-semibold mb-2 text-gray-700">
            Demand Forecast & Analytics
          </Typography>
          <Typography variant="body" className="text-sm text-gray-600 mb-4">
            AI-powered demand prediction for optimized production planning
          </Typography>
        </div>

        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap="md">
          {forecasts.map((forecast) => (
            <Card key={forecast.product_id}>
              <div className="p-4">
                <HStack justify="space-between" className="mb-4">
                  <Typography variant="heading" className="text-lg font-bold">
                    {forecast.product_name}
                  </Typography>
                  <HStack>
                    {getTrendIcon(forecast.current_trend)}
                    <Typography variant="body" className={`text-sm ${
                      forecast.current_trend === 'up' ? 'text-green-600' : 
                      forecast.current_trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {forecast.trend_percentage > 0 ? '+' : ''}{forecast.trend_percentage}%
                    </Typography>
                  </HStack>
                </HStack>

                <VStack gap="sm" align="stretch">
                  <Grid templateColumns="repeat(2, 1fr)" gap="sm" className="text-sm">
                    <VStack align="start" gap="xs">
                      <Typography variant="body" className="text-gray-600">Historical Avg</Typography>
                      <Typography variant="body" className="font-bold">{forecast.historical_average}</Typography>
                    </VStack>
                    <VStack align="start" gap="xs">
                      <Typography variant="body" className="text-gray-600">Predicted Demand</Typography>
                      <Typography variant="body" className="font-bold text-blue-600">{forecast.predicted_demand}</Typography>
                    </VStack>
                  </Grid>

                  <div>
                    <HStack justify="space-between" className="mb-1">
                      <Typography variant="body" className="text-sm text-gray-600">Confidence Level</Typography>
                      <Typography variant="body" className="text-sm font-bold">{forecast.confidence_level}%</Typography>
                    </HStack>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          forecast.confidence_level > 80 ? 'bg-green-500' : 
                          forecast.confidence_level > 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${forecast.confidence_level}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-center p-3 bg-blue-50 rounded-md">
                    <Typography variant="body" className="text-xs text-gray-600">Recommended Production</Typography>
                    <Typography variant="heading" className="text-xl font-bold text-blue-600">
                      {forecast.recommended_production}
                    </Typography>
                    <Typography variant="body" className="text-xs text-gray-600">units</Typography>
                  </div>

                  <Button size="sm" colorPalette="brand">
                    Create Production Plan
                  </Button>
                </VStack>
              </div>
            </CardWrapper>
          ))}
        </Grid>
      </VStack>
    </div>
  );
}