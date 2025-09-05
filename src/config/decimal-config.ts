import { Decimal } from 'decimal.js';

// ============================================================================
// CONFIGURACIÓN OPTIMIZADA DECIMAL.JS v2.0
// ============================================================================
// Basada en mejores prácticas 2025 y documentación oficial

// Configuración principal optimizada para aplicaciones financieras
Decimal.set({ 
  precision: 20,                    // Estándar recomendado (era 10)
  rounding: Decimal.ROUND_HALF_EVEN, // Banker's rounding (mode 6) - mejor para finanzas
  toExpNeg: -7,                     // Control notación exponencial negativa
  toExpPos: 21                      // Control notación exponencial positiva
});

// ============================================================================
// CLONES ESPECIALIZADOS POR DOMINIO
// ============================================================================
// Cada dominio puede tener configuraciones específicas sin afectar otros

/**
 * Configuración específica para cálculos fiscales (IVA, Ingresos Brutos)
 * Prioriza precisión máxima y banker's rounding para cumplir estándares
 */
export const TaxDecimal = Decimal.clone({
  precision: 20,
  rounding: Decimal.ROUND_HALF_EVEN, // Crítico: evita sesgos estadísticos
  toExpNeg: -9,                      // Mayor precisión para decimales pequeños
  toExpPos: 21
});

/**
 * Configuración para inventario y stock
 * Balance entre precisión y performance para operaciones masivas
 */
export const InventoryDecimal = Decimal.clone({
  precision: 15,                     // Suficiente para inventarios
  rounding: Decimal.ROUND_HALF_UP,   // Tradicional para stock
  toExpNeg: -7,
  toExpPos: 21
});

/**
 * Configuración para análisis financiero y pricing
 * Máxima precisión para cálculos complejos de rentabilidad
 */
export const FinancialDecimal = Decimal.clone({
  precision: 28,                     // Precisión máxima para análisis
  rounding: Decimal.ROUND_HALF_EVEN, // Banker's rounding
  toExpNeg: -12,                     // Para porcentajes muy pequeños
  toExpPos: 21
});

/**
 * Configuración para recetas y costos de producción
 * Optimizada para cálculos de ingredientes y yields
 */
export const RecipeDecimal = Decimal.clone({
  precision: 18,                     // Balanceada para recetas
  rounding: Decimal.ROUND_HALF_EVEN, // Consistencia en escalado
  toExpNeg: -8,
  toExpPos: 21
});

// ============================================================================
// CONSTANTES ÚTILES
// ============================================================================

export const DECIMAL_CONSTANTS = {
  ZERO: new Decimal(0),
  ONE: new Decimal(1),
  HUNDRED: new Decimal(100),
  
  // Tasas comunes Argentina
  IVA_GENERAL: new TaxDecimal(0.21),
  IVA_REDUCIDO: new TaxDecimal(0.105),
  INGRESOS_BRUTOS_CABA: new TaxDecimal(0.03),
  
  // Configuraciones de rounding
  ROUNDING_MODES: {
    UP: Decimal.ROUND_UP,
    DOWN: Decimal.ROUND_DOWN,
    HALF_UP: Decimal.ROUND_HALF_UP,
    HALF_EVEN: Decimal.ROUND_HALF_EVEN,
    HALF_DOWN: Decimal.ROUND_HALF_DOWN,
  }
} as const;

// Export default para retrocompatibilidad
export default Decimal;
