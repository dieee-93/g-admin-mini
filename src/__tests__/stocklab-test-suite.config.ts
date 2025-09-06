// ============================================================================
// STOCKLAB TEST SUITE CONFIGURATION
// ============================================================================
// Configuración centralizada para ejecución de tests según masterplan

export const STOCKLAB_TEST_CONFIG = {
  // Configuración de performance
  performance: {
    maxExecutionTime: {
      abcAnalysis1K: 2000,      // 2 segundos para 1K items
      abcAnalysis10K: 10000,    // 10 segundos para 10K items
      smartAlerts1K: 3000,      // 3 segundos para 1K alertas
      forecasting500: 5000,     // 5 segundos para 500 forecasts
      decimalOps10K: 1000       // 1 segundo para 10K operaciones decimal
    },
    
    minThroughput: {
      abcAnalysis: 500,         // > 500 items/segundo
      smartAlerts: 300,         // > 300 items/segundo
      forecasting: 100,         // > 100 items/segundo
      decimalOps: 10000         // > 10K ops/segundo
    },
    
    maxMemoryUsage: {
      abcAnalysis5K: 100 * 1024 * 1024,  // 100MB para 5K items
      smartAlerts1K: 50 * 1024 * 1024,   // 50MB para 1K alertas
      memoryLeakThreshold: 0.2            // 20% incremento máximo
    }
  },

  // Configuración de precisión
  precision: {
    decimalPlaces: 15,            // Mínimo 15 decimales de precisión
    percentageTolerance: 0.000001, // Tolerancia para cálculos de porcentaje
    financialTolerance: 0.01,     // Tolerancia para cálculos financieros (centavos)
    cumulativePercentageTotal: 100 // Los porcentajes acumulativos deben sumar 100
  },

  // Configuración de business logic
  businessLogic: {
    abcDistribution: {
      classAMaxPercent: 0.25,     // Máximo 25% en clase A
      classCMinPercent: 0.4,      // Mínimo 40% en clase C
      cumulativeThresholds: {
        classA: 80,               // 80% del valor acumulativo
        classB: 95                // 95% del valor acumulativo
      }
    },
    
    alerts: {
      maxAlertsPerItem: 5,        // Máximo 5 alertas por item
      priorityRange: [1, 5],      // Prioridad entre 1 y 5
      severityLevels: ['info', 'warning', 'critical', 'urgent'],
      confidenceMinimum: 0.6      // Confianza mínima para alertas predictivas
    },
    
    procurement: {
      roiRange: [5, 200],         // ROI entre 5% y 200%
      leadTimeBuffer: [1, 30],    // Buffer de lead time entre 1-30 días
      eoqMinimum: 1               // EOQ mínimo 1 unidad
    }
  },

  // Configuración de datasets de prueba
  testDatasets: {
    small: 100,           // Dataset pequeño
    medium: 1000,         // Dataset mediano  
    large: 5000,          // Dataset grande
    extraLarge: 10000,    // Dataset extra grande
    
    restaurant: {
      totalItems: 15,
      classAItems: ['beef-premium', 'salmon-fresh'],
      classCItems: ['napkins', 'toothpicks']
    },
    
    seasonal: {
      historyMonths: 8,
      consumptionVariation: 5.0  // Variación estacional 5x
    }
  },

  // Configuración de integración
  integration: {
    alertSystemCompatibility: true,
    decimalSystemCompatibility: true,
    existingHooksIntegration: true,
    backwardCompatibility: true
  },

  // Umbrales de cobertura
  coverage: {
    statements: 95,       // 95% cobertura de statements
    branches: 90,         // 90% cobertura de branches  
    functions: 95,        // 95% cobertura de functions
    lines: 95             // 95% cobertura de lines
  }
};

// Test data generators configuration
export const TEST_DATA_CONFIG = {
  materials: {
    categories: ['carnes', 'pescados', 'verduras', 'lacteos', 'bebidas', 'condimentos', 'descartables'],
    suppliers: ['sup-1', 'sup-2', 'sup-3', 'sup-4', 'sup-5'],
    types: ['COUNTABLE', 'MEASURABLE', 'ELABORATED'] as const,
    stockRange: [1, 1000],
    costRange: [1, 500],
    unitsCommon: ['kg', 'litro', 'unidad', 'metro', 'gramo']
  },

  financial: {
    currencyPrecision: 2,
    taxRates: [0, 10.5, 21, 27],  // IVA rates in Argentina
    markupRange: [20, 200],       // Markup percentage range
    discountRange: [0, 30]        // Discount percentage range
  }
};

// Test execution modes
export type TestMode = 'fast' | 'comprehensive' | 'stress' | 'ci';

export const TEST_MODES: Record<TestMode, {
  maxDatasetSize: number;
  timeoutMultiplier: number;
  includeStressTests: boolean;
  includePerformanceTests: boolean;
  memoryLeakTests: boolean;
}> = {
  fast: {
    maxDatasetSize: 100,
    timeoutMultiplier: 1,
    includeStressTests: false,
    includePerformanceTests: false,
    memoryLeakTests: false
  },
  
  comprehensive: {
    maxDatasetSize: 1000,
    timeoutMultiplier: 2,
    includeStressTests: true,
    includePerformanceTests: true,
    memoryLeakTests: false
  },
  
  stress: {
    maxDatasetSize: 10000,
    timeoutMultiplier: 5,
    includeStressTests: true,
    includePerformanceTests: true,
    memoryLeakTests: true
  },
  
  ci: {
    maxDatasetSize: 500,
    timeoutMultiplier: 1.5,
    includeStressTests: false,
    includePerformanceTests: true,
    memoryLeakTests: false
  }
};

// Test utilities
export const getCurrentTestMode = (): TestMode => {
  return (process.env.STOCKLAB_TEST_MODE as TestMode) || 'comprehensive';
};

export const shouldRunTest = (testType: 'stress' | 'performance' | 'memoryLeak'): boolean => {
  const mode = getCurrentTestMode();
  const config = TEST_MODES[mode];
  
  switch (testType) {
    case 'stress':
      return config.includeStressTests;
    case 'performance':
      return config.includePerformanceTests;
    case 'memoryLeak':
      return config.memoryLeakTests;
    default:
      return true;
  }
};

export const getMaxDatasetSize = (): number => {
  const mode = getCurrentTestMode();
  return TEST_MODES[mode].maxDatasetSize;
};

export const getTimeoutMultiplier = (): number => {
  const mode = getCurrentTestMode();
  return TEST_MODES[mode].timeoutMultiplier;
};