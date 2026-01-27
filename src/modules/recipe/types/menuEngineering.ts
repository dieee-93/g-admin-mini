/**
 * Menu Engineering Types
 *
 * Análisis Boston Matrix para clasificar recetas/productos según:
 * - Popularidad (Ventas)
 * - Rentabilidad (Margen de contribución)
 *
 * Clasifica en 4 cuadrantes:
 * - STARS: Alta popularidad + Alta rentabilidad (mantener y promover)
 * - CASH COWS: Baja popularidad + Alta rentabilidad (aumentar marketing)
 * - PUZZLES/PLOW HORSES: Alta popularidad + Baja rentabilidad (optimizar costos)
 * - DOGS: Baja popularidad + Baja rentabilidad (descontinuar)
 *
 * @see https://en.wikipedia.org/wiki/Menu_engineering
 */

// ============================================
// CLASSIFICATION TYPES
// ============================================

/**
 * Categorías Boston Matrix
 */
export type MenuEngineeringCategory = 'STAR' | 'CASH_COW' | 'PUZZLE' | 'DOG';

/**
 * Metadata de categoría
 */
export interface CategoryMetadata {
  name: string;
  color: string;
  icon: string;
  description: string;
  recommendation: string;
}

/**
 * Map de categorías con metadata
 */
export const MENU_ENGINEERING_CATEGORIES: Record<MenuEngineeringCategory, CategoryMetadata> = {
  STAR: {
    name: 'Estrellas',
    color: 'green',
    icon: '⭐',
    description: 'Alta popularidad y alta rentabilidad',
    recommendation: 'Mantener, promover y destacar en el menú'
  },
  CASH_COW: {
    name: 'Vacas Lecheras',
    color: 'blue',
    icon: '💰',
    description: 'Baja popularidad pero alta rentabilidad',
    recommendation: 'Aumentar visibilidad y marketing para incrementar ventas'
  },
  PUZZLE: {
    name: 'Interrogantes',
    color: 'yellow',
    icon: '❓',
    description: 'Alta popularidad pero baja rentabilidad',
    recommendation: 'Optimizar costos, ajustar precio o ingredientes'
  },
  DOG: {
    name: 'Perros',
    color: 'red',
    icon: '🐕',
    description: 'Baja popularidad y baja rentabilidad',
    recommendation: 'Considerar descontinuar o reemplazar'
  }
};

// ============================================
// ANALYSIS DATA TYPES
// ============================================

/**
 * Datos de ventas de una receta/producto
 */
export interface RecipeSalesData {
  /** ID de la receta */
  recipeId: string;
  /** Nombre de la receta */
  recipeName: string;
  /** Total de unidades vendidas en el período */
  totalSold: number;
  /** Revenue total generado */
  totalRevenue: number;
  /** Costo total de producción */
  totalCost: number;
  /** Precio de venta promedio */
  avgSalePrice: number;
  /** Costo de producción promedio */
  avgCost: number;
}

/**
 * Métricas calculadas para Menu Engineering
 */
export interface RecipeMenuMetrics {
  /** ID de la receta */
  recipeId: string;
  /** Nombre de la receta */
  recipeName: string;

  // Ventas
  /** Total vendido */
  totalSold: number;
  /** % de participación en ventas totales */
  salesShare: number;
  /** Popularidad relativa (0-1, donde 0.5 es el promedio) */
  popularityScore: number;

  // Rentabilidad
  /** Margen de contribución unitario (precio - costo) */
  contributionMargin: number;
  /** Margen de contribución total */
  totalContribution: number;
  /** % de margen */
  marginPercentage: number;
  /** Rentabilidad relativa (0-1, donde 0.5 es el promedio) */
  profitabilityScore: number;

  // Clasificación
  /** Categoría Boston Matrix */
  category: MenuEngineeringCategory;
  /** Cuadrante (para gráficos) */
  quadrant: {
    x: number; // popularityScore
    y: number; // profitabilityScore
  };
}

/**
 * Resultado completo del análisis Menu Engineering
 */
export interface MenuEngineeringAnalysis {
  /** Período analizado */
  period: {
    startDate: Date;
    endDate: Date;
  };

  /** Totales generales */
  totals: {
    totalRevenue: number;
    totalCost: number;
    totalContribution: number;
    totalSold: number;
    recipeCount: number;
  };

  /** Promedios */
  averages: {
    avgPopularity: number;
    avgProfitability: number;
    avgContributionMargin: number;
  };

  /** Métricas por receta */
  recipes: RecipeMenuMetrics[];

  /** Distribución por categoría */
  distribution: {
    [K in MenuEngineeringCategory]: {
      count: number;
      percentage: number;
      recipeIds: string[];
    };
  };

  /** Recomendaciones */
  recommendations: MenuEngineeringRecommendation[];
}

/**
 * Recomendación basada en análisis
 */
export interface MenuEngineeringRecommendation {
  /** ID de la receta */
  recipeId: string;
  /** Nombre de la receta */
  recipeName: string;
  /** Categoría actual */
  category: MenuEngineeringCategory;
  /** Tipo de recomendación */
  type: 'promote' | 'optimize' | 'discontinue' | 'maintain';
  /** Prioridad (1-5, donde 5 es máxima) */
  priority: number;
  /** Descripción de la acción recomendada */
  action: string;
  /** Impacto esperado */
  expectedImpact: {
    revenue?: string;
    margin?: string;
    volume?: string;
  };
}

// ============================================
// ENGINE OPTIONS
// ============================================

/**
 * Configuración del análisis Menu Engineering
 */
export interface MenuEngineeringConfig {
  /** Umbral de popularidad (por defecto: promedio) */
  popularityThreshold?: number;
  /** Umbral de rentabilidad (por defecto: promedio) */
  profitabilityThreshold?: number;
  /** Incluir solo recetas activas */
  activeOnly?: boolean;
  /** Período de análisis en días */
  periodDays?: number;
  /** Mínimo de ventas para incluir en análisis */
  minSalesThreshold?: number;
}

// ============================================
// MOCK DATA TYPES
// ============================================

/**
 * Datos mock para desarrollo/testing
 */
export interface MockRecipeData {
  id: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  soldUnits: number;
}
