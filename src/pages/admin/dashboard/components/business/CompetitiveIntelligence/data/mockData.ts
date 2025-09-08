import { CompetitorData, CompetitivePricing, MarketTrend, MarketInsight } from '../types';

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

export const generateMockCompetitors = (): CompetitorData[] => {
  const competitorNames = [
    'Restaurant Elite', 'Gourmet Corner', 'Bistro Premium', 'Cocina Moderna',
    'Sabores Únicos', 'La Mesa Dorada', 'Fusión Gourmet', 'Casa del Buen Sabor'
  ];
  const types = ['direct', 'indirect', 'substitute'] as const;
  const zones = ['Centro', 'Norte', 'Sur', 'Este', 'Oeste'];

  return Array.from({ length: 8 }, (_, index) => {
    const revenue = Math.random() * 500000 + 100000;
    const totalItems = Math.floor(Math.random() * 80) + 20;

    return {
      id: `comp-${index + 1}`,
      name: competitorNames[index],
      type: types[Math.floor(Math.random() * types.length)],
      category: ['Casual Dining', 'Fine Dining', 'Fast Casual', 'Quick Service'][Math.floor(Math.random() * 4)],
      location: {
        address: `Dirección ${index + 1}, Ciudad`,
        distance: Math.random() * 5 + 0.5,
        zone: zones[Math.floor(Math.random() * zones.length)]
      },

      businessMetrics: {
        estimatedRevenue: revenue,
        marketShare: Math.random() * 0.15 + 0.05,
        customerBase: Math.floor(Math.random() * 5000) + 1000,
        operatingHours: '10:00 - 22:00',
        deliveryRadius: Math.floor(Math.random() * 8) + 3,
        averageTicket: Math.random() * 30 + 15
      },

      menuAnalysis: {
        totalItems,
        categories: ['Principales', 'Entradas', 'Postres', 'Bebidas'].filter(() => Math.random() > 0.3),
        priceRange: {
          min: Math.random() * 10 + 5,
          max: Math.random() * 40 + 30,
          average: Math.random() * 20 + 15
        },
        uniqueItems: Math.floor(totalItems * 0.2),
        seasonalItems: Math.floor(totalItems * 0.15)
      },

      pricingIntelligence: generateMockPricingData(),

      performance: {
        customerRating: Math.random() * 1.5 + 3.5,
        reviewCount: Math.floor(Math.random() * 1000) + 100,
        responseTime: Math.floor(Math.random() * 30) + 15,
        deliveryTime: Math.floor(Math.random() * 20) + 25,
        popularityTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
        marketPosition: ['leader', 'challenger', 'follower', 'niche'][Math.floor(Math.random() * 4)] as any
      },

      digitalPresence: {
        website: Math.random() > 0.3,
        socialMedia: {
          instagram: Math.floor(Math.random() * 50000) + 1000,
          facebook: Math.floor(Math.random() * 20000) + 500,
          tiktok: Math.floor(Math.random() * 30000)
        },
        onlineOrdering: Math.random() > 0.4,
        deliveryApps: ['Uber Eats', 'Rappi', 'PedidosYa'].filter(() => Math.random() > 0.4),
        marketingBudget: Math.random() * 10000 + 2000
      },

      analysis: {
        strengths: [
          'Excelente ubicación',
          'Menú diversificado',
          'Precios competitivos',
          'Buena reputación online'
        ].filter(() => Math.random() > 0.5),
        weaknesses: [
          'Limitada presencia digital',
          'Horarios restrictivos',
          'Poca innovación en menú',
          'Servicio lento'
        ].filter(() => Math.random() > 0.6),
        opportunities: [
          'Expansión de delivery',
          'Marketing digital',
          'Nuevas categorías de menú',
          'Alianzas estratégicas'
        ].filter(() => Math.random() > 0.5),
        threats: [
          'Nuevos competidores',
          'Aumento de costos',
          'Cambios en preferencias',
          'Regulaciones'
        ].filter(() => Math.random() > 0.7)
      },

      lastUpdated: new Date().toISOString(),
      dataQuality: Math.floor(Math.random() * 30) + 70
    };
  });
};

const generateMockPricingData = (): CompetitivePricing[] => {
  const categories = ['Principales', 'Entradas', 'Postres', 'Bebidas', 'Especiales'];

  return categories.map((category, index) => {
    const ourPrice = Math.random() * 25 + 10;
    const competitorPrice = ourPrice * (Math.random() * 0.4 + 0.8);
    const difference = ((ourPrice - competitorPrice) / competitorPrice) * 100;

    return {
      categoryId: `cat-${index + 1}`,
      categoryName: category,
      ourPrice,
      competitorPrice,
      priceDifference: difference,
      pricePosition: Math.abs(difference) < 5 ? 'competitive' : difference > 0 ? 'premium' : 'discount',
      marketAverage: (ourPrice + competitorPrice) / 2 + (Math.random() - 0.5) * 5,
      recommendedAction: Math.abs(difference) < 5 ? 'maintain' :
                       Math.abs(difference) < 15 ? 'monitor' :
                       difference > 0 ? 'decrease' : 'increase',
      confidence: Math.floor(Math.random() * 30) + 70
    } as CompetitivePricing;
  });
};

export const generateMockMarketTrends = (): MarketTrend[] => {
  const categories = ['Comida Saludable', 'Delivery', 'Experiencia Premium', 'Sostenibilidad', 'Tecnología'];
  const trends = ['growing', 'declining', 'stable'] as const;

  return categories.map((category, index) => {
    const trend = trends[Math.floor(Math.random() * trends.length)];
    const growthRate = trend === 'growing' ? Math.random() * 20 + 5 :
                     trend === 'declining' ? -(Math.random() * 15 + 2) :
                     (Math.random() - 0.5) * 4;

    return {
      id: `trend-${index + 1}`,
      category,
      trend,
      growthRate,
      timeframe: ['month', 'quarter', 'year'][Math.floor(Math.random() * 3)] as any,
      description: `Tendencia ${trend === 'growing' ? 'creciente' : trend === 'declining' ? 'decreciente' : 'estable'} en ${category.toLowerCase()}`,
      impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
      opportunity: `Oportunidad de ${trend === 'growing' ? 'crecimiento' : 'optimización'} en ${category.toLowerCase()}`,
      recommendedActions: [
        'Monitorear competencia',
        'Ajustar estrategia de precios',
        'Desarrollar nuevos productos',
        'Mejorar marketing digital'
      ].filter(() => Math.random() > 0.5),
      dataPoints: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        value: 100 + (Math.random() - 0.5) * 20 + (trend === 'growing' ? i * 2 : trend === 'declining' ? -i * 1.5 : 0)
      }))
    };
  });
};

export const generateMockMarketInsights = (): MarketInsight[] => {
  const insights = [
    {
      type: 'opportunity' as const,
      title: 'Oportunidad en Mercado de Comida Saludable',
      description: 'Crecimiento del 25% en demanda de opciones saludables en la zona',
      impact: { revenue: 50000, marketShare: 5, customerBase: 200 }
    },
    {
      type: 'threat' as const,
      title: 'Nueva Cadena Entrando al Mercado',
      description: 'Competidor internacional planea abrir 3 locales en la zona',
      impact: { revenue: -30000, marketShare: -8, customerBase: -150 }
    },
    {
      type: 'trend' as const,
      title: 'Tendencia hacia Delivery Premium',
      description: 'Clientes dispuestos a pagar más por experiencia de delivery de calidad',
      impact: { revenue: 25000, marketShare: 3, customerBase: 100 }
    },
    {
      type: 'competitive_move' as const,
      title: 'Competidor Principal Reduce Precios',
      description: 'Restaurant Elite ha reducido precios 15% en categoría principales',
      impact: { revenue: -20000, marketShare: -5, customerBase: -80 }
    }
  ];

  return insights.map((insight, index) => ({
    id: `insight-${index + 1}`,
    ...insight,
    urgency: ['immediate', 'short_term', 'medium_term'][Math.floor(Math.random() * 3)] as any,
    confidence: Math.floor(Math.random() * 30) + 70,
    source: ['competitor_analysis', 'market_research', 'customer_feedback'][Math.floor(Math.random() * 3)] as any,
    actionRequired: Math.random() > 0.3,
    relatedCompetitors: ['comp-1', 'comp-2'].filter(() => Math.random() > 0.5),
    timestamp: new Date().toISOString()
  }));
};
