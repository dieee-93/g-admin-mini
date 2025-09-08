import {
  MaterialDemand,
  DemandDataPoint,
  ForecastPoint,
  PredictiveAlert,
} from '../types';

// Mock data generators
export const generateMockMaterialDemand = (): MaterialDemand[] => {
  const materials = [
    'Harina 000', 'Tomate triturado', 'Mozzarella', 'Aceite de oliva', 'Carne picada',
    'Pollo', 'Cebolla', 'Ají morrón', 'Lechuga', 'Queso rallado'
  ];

  return materials.map((name, index) => {
    const materialId = `material_${index + 1}`;
    const currentStock = Math.floor(Math.random() * 100) + 10;

    // Generate historical data (30 days)
    const historicalData: DemandDataPoint[] = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseDemand = 10 + Math.random() * 20;

      // Weekend boost for restaurant items
      let actualDemand = baseDemand;
      if (isWeekend) actualDemand *= 1.3;

      // Add some seasonality
      const seasonalEffect = Math.sin((i / 30) * Math.PI * 2) * 0.2 + 1;
      actualDemand *= seasonalEffect;

      // Add random events
      const events: string[] = [];
      if (Math.random() < 0.1) {
        events.push('Promoción especial');
        actualDemand *= 1.5;
      }

      historicalData.push({
        date: date.toISOString().split('T')[0],
        actualDemand: Math.round(actualDemand),
        stockLevel: Math.floor(Math.random() * 50) + 20,
        dayOfWeek,
        events: events.length > 0 ? events : undefined,
        temperature: 20 + Math.random() * 15,
        isHoliday: Math.random() < 0.05
      });
    }

    // Generate predictions (next 7 days)
    const predictions: ForecastPoint[] = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      const basePrediction = 15 + Math.random() * 10;
      const confidence = 70 + Math.random() * 25;
      const variance = basePrediction * 0.2;

      predictions.push({
        date: date.toISOString().split('T')[0],
        predictedDemand: Math.round(basePrediction),
        lowerBound: Math.round(basePrediction - variance),
        upperBound: Math.round(basePrediction + variance),
        confidence: Math.round(confidence),
        factors: [
          {
            name: 'Tendencia histórica',
            impact: Math.floor(Math.random() * 40) - 20,
            category: 'trend'
          },
          {
            name: 'Estacionalidad',
            impact: Math.floor(Math.random() * 30) - 15,
            category: 'seasonal'
          },
          {
            name: 'Día de la semana',
            impact: Math.floor(Math.random() * 25) - 12,
            category: 'day_of_week'
          }
        ]
      });
    }

    const trendDirection: 'increasing' | 'decreasing' | 'stable' =
      Math.random() < 0.4 ? 'increasing' : Math.random() < 0.7 ? 'stable' : 'decreasing';

    // Generate alerts
    const alerts: PredictiveAlert[] = [];
    if (Math.random() < 0.3) {
      alerts.push({
        id: `alert_${materialId}`,
        type: Math.random() < 0.5 ? 'stockout_risk' : 'demand_spike',
        severity: Math.random() < 0.2 ? 'critical' : Math.random() < 0.5 ? 'high' : 'medium',
        message: `Riesgo de desabastecimiento en ${Math.floor(Math.random() * 5) + 1} días`,
        estimatedImpact: Math.floor(Math.random() * 1000) + 500,
        recommendedAction: 'Realizar pedido urgente al proveedor',
        daysUntilEvent: Math.floor(Math.random() * 5) + 1
      });
    }

    return {
      materialId,
      materialName: name,
      currentStock,
      unit: index % 3 === 0 ? 'kg' : index % 3 === 1 ? 'L' : 'unidad',
      historicalData,
      prediction: {
        forecastPeriod: 7,
        predictions,
        accuracy: 75 + Math.random() * 20,
        confidenceLevel: 80 + Math.random() * 15,
        trendDirection,
        seasonalityDetected: Math.random() > 0.3,
        recommendedAction: {
          action: Math.random() < 0.3 ? 'increase_order' : Math.random() < 0.6 ? 'maintain_current' : 'decrease_order',
          priority: Math.random() < 0.2 ? 'urgent' : Math.random() < 0.5 ? 'high' : 'medium',
          suggestedQuantity: Math.floor(Math.random() * 50) + 10,
          reasoning: `Basado en análisis de tendencia ${trendDirection} y patrones estacionales`,
          estimatedSavings: Math.floor(Math.random() * 500) + 100,
          riskLevel: Math.random() < 0.3 ? 'high' : Math.random() < 0.7 ? 'medium' : 'low'
        }
      },
      seasonality: {
        detected: Math.random() > 0.3,
        type: Math.random() < 0.4 ? 'weekly' : Math.random() < 0.7 ? 'monthly' : 'daily',
        strength: Math.floor(Math.random() * 60) + 20,
        peakPeriods: [
          {
            name: 'Fin de semana',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            multiplier: 1.3 + Math.random() * 0.4,
            category: 'seasonal'
          }
        ],
        adjustments: [
          {
            period: 'Viernes-Domingo',
            adjustment: 25 + Math.random() * 15,
            reasoning: 'Mayor demanda en fines de semana'
          }
        ]
      },
      alerts
    };
  });
};
