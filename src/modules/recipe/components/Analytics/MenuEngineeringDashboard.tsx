/**
 * Menu Engineering Dashboard
 *
 * Dashboard para análisis Boston Matrix de recetas/productos.
 * Visualiza:
 * - Matriz de clasificación (Stars, Cash Cows, Puzzles, Dogs)
 * - Métricas clave
 * - Recomendaciones accionables
 *
 * @module recipe/components/Analytics
 */

import { useMemo } from 'react';
import {
  Box,
  Stack,
  Flex,
  Typography,
  Badge,
  Grid,
  Alert,
  SimpleGrid
} from '@/shared/ui';
import {
  ChartBarIcon,
  StarIcon,
  BanknotesIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  createMenuEngineeringEngineWithMockData,
  type MenuEngineeringAnalysis,
  type RecipeMenuMetrics
} from '../../services/menuEngineeringEngine';
import { MENU_ENGINEERING_CATEGORIES } from '../../types/menuEngineering';

// ============================================
// TYPES
// ============================================

interface MenuEngineeringDashboardProps {
  /** Datos reales (opcional - usa mock si no se provee) */
  analysis?: MenuEngineeringAnalysis;
  /** Mostrar datos mock */
  useMockData?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function MenuEngineeringDashboard({
  analysis: providedAnalysis,
  useMockData = true
}: MenuEngineeringDashboardProps) {

  // Generate or use provided analysis
  const analysis = useMemo(() => {
    if (providedAnalysis) return providedAnalysis;
    if (useMockData) {
      const { analysis: mockAnalysis } = createMenuEngineeringEngineWithMockData();
      return mockAnalysis;
    }
    return null;
  }, [providedAnalysis, useMockData]);

  if (!analysis) {
    return (
      <Box p="8" textAlign="center">
        <Typography variant="body" color="fg.muted">
          No hay datos disponibles para análisis
        </Typography>
      </Box>
    );
  }

  return (
    <Stack gap="6">
      {/* Header */}
      <Box>
        <Flex align="center" gap="3" mb="2">
          <ChartBarIcon style={{ width: '24px', height: '24px' }} />
          <Typography variant="heading" fontSize="2xl">
            Menu Engineering Analysis
          </Typography>
          {useMockData && (
            <Badge colorPalette="purple" size="sm">
              Datos de Ejemplo
            </Badge>
          )}
        </Flex>
        <Typography variant="body" color="fg.muted" fontSize="sm">
          Análisis Boston Matrix basado en popularidad y rentabilidad
        </Typography>
      </Box>

      {/* Info Alert */}
      {useMockData && (
        <Alert.Root status="info">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Datos de Ejemplo</Alert.Title>
            <Alert.Description>
              Estos son datos simulados para demostración. Cuando tengas datos reales de ventas,
              el análisis se generará automáticamente con información actualizada.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Métricas Generales */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4">
        <MetricCard
          label="Revenue Total"
          value={`$${analysis.totals.totalRevenue.toFixed(2)}`}
          colorScheme="blue"
        />
        <MetricCard
          label="Margen Total"
          value={`$${analysis.totals.totalContribution.toFixed(2)}`}
          colorScheme="green"
        />
        <MetricCard
          label="Unidades Vendidas"
          value={analysis.totals.totalSold.toString()}
          colorScheme="purple"
        />
        <MetricCard
          label="Recetas Analizadas"
          value={analysis.totals.recipeCount.toString()}
          colorScheme="orange"
        />
      </SimpleGrid>

      {/* Boston Matrix Grid */}
      <Box>
        <Typography variant="label" mb="3">
          Clasificación Boston Matrix
        </Typography>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
          {/* STARS */}
          <CategoryCard
            category="STAR"
            recipes={analysis.recipes.filter(r => r.category === 'STAR')}
            percentage={analysis.distribution.STAR.percentage}
            icon={<StarIcon style={{ width: '24px', height: '24px' }} />}
          />

          {/* CASH COWS */}
          <CategoryCard
            category="CASH_COW"
            recipes={analysis.recipes.filter(r => r.category === 'CASH_COW')}
            percentage={analysis.distribution.CASH_COW.percentage}
            icon={<BanknotesIcon style={{ width: '24px', height: '24px' }} />}
          />

          {/* PUZZLES */}
          <CategoryCard
            category="PUZZLE"
            recipes={analysis.recipes.filter(r => r.category === 'PUZZLE')}
            percentage={analysis.distribution.PUZZLE.percentage}
            icon={<QuestionMarkCircleIcon style={{ width: '24px', height: '24px' }} />}
          />

          {/* DOGS */}
          <CategoryCard
            category="DOG"
            recipes={analysis.recipes.filter(r => r.category === 'DOG')}
            percentage={analysis.distribution.DOG.percentage}
            icon={<ExclamationTriangleIcon style={{ width: '24px', height: '24px' }} />}
          />
        </SimpleGrid>
      </Box>

      {/* Recomendaciones */}
      <Box>
        <Typography variant="label" mb="3">
          Recomendaciones Prioritarias
        </Typography>
        <Stack gap="3">
          {analysis.recommendations
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 5)
            .map(rec => (
              <RecommendationCard key={rec.recipeId} recommendation={rec} />
            ))}
        </Stack>
      </Box>
    </Stack>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function MetricCard({
  label,
  value,
  colorScheme
}: {
  label: string;
  value: string;
  colorScheme: string;
}) {
  return (
    <Box
      p="4"
      bg={`${colorScheme}.50`}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={`${colorScheme}.200`}
    >
      <Typography variant="caption" color={`${colorScheme}.700`}>
        {label}
      </Typography>
      <Typography variant="heading" fontSize="2xl" color={`${colorScheme}.900`}>
        {value}
      </Typography>
    </Box>
  );
}

function CategoryCard({
  category,
  recipes,
  percentage,
  icon
}: {
  category: keyof typeof MENU_ENGINEERING_CATEGORIES;
  recipes: RecipeMenuMetrics[];
  percentage: number;
  icon: React.ReactNode;
}) {
  const metadata = MENU_ENGINEERING_CATEGORIES[category];

  return (
    <Box
      p="5"
      bg={`${metadata.color}.50`}
      borderRadius="lg"
      borderWidth="2px"
      borderColor={`${metadata.color}.300`}
    >
      <Flex justify="space-between" align="flex-start" mb="3">
        <Flex align="center" gap="2">
          <Box color={`${metadata.color}.700`}>{icon}</Box>
          <Box>
            <Typography variant="heading" fontSize="lg" color={`${metadata.color}.900`}>
              {metadata.icon} {metadata.name}
            </Typography>
            <Typography variant="caption" color={`${metadata.color}.700`}>
              {recipes.length} recetas ({percentage}%)
            </Typography>
          </Box>
        </Flex>
      </Flex>

      <Typography variant="body" fontSize="sm" color={`${metadata.color}.800`} mb="3">
        {metadata.description}
      </Typography>

      <Box
        p="3"
        bg="white"
        borderRadius="md"
        borderWidth="1px"
        borderColor={`${metadata.color}.200`}
      >
        <Typography variant="caption" color="fg.muted" mb="2" fontWeight="semibold">
          Recomendación:
        </Typography>
        <Typography variant="body" fontSize="sm">
          {metadata.recommendation}
        </Typography>
      </Box>

      {recipes.length > 0 && (
        <Box mt="3">
          <Typography variant="caption" color={`${metadata.color}.700`} mb="2">
            Recetas:
          </Typography>
          <Stack gap="1">
            {recipes.map(recipe => (
              <Flex
                key={recipe.recipeId}
                justify="space-between"
                p="2"
                bg="white"
                borderRadius="sm"
                fontSize="sm"
              >
                <Typography variant="body" fontSize="sm">
                  {recipe.recipeName}
                </Typography>
                <Typography variant="body" fontSize="sm" color="fg.muted">
                  {recipe.totalSold} vendidos
                </Typography>
              </Flex>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

function RecommendationCard({
  recommendation
}: {
  recommendation: MenuEngineeringAnalysis['recommendations'][0];
}) {
  const metadata = MENU_ENGINEERING_CATEGORIES[recommendation.category];

  return (
    <Box
      p="4"
      bg="bg.subtle"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border.default"
    >
      <Flex justify="space-between" align="flex-start" mb="2">
        <Box flex="1">
          <Flex align="center" gap="2" mb="1">
            <Typography variant="heading" fontSize="md">
              {recommendation.recipeName}
            </Typography>
            <Badge colorPalette={metadata.color} size="sm">
              {metadata.icon} {metadata.name}
            </Badge>
            <Badge size="sm" colorPalette="gray">
              Prioridad: {recommendation.priority}/5
            </Badge>
          </Flex>
          <Typography variant="body" fontSize="sm" color="fg.muted">
            {recommendation.action}
          </Typography>
        </Box>
      </Flex>

      {Object.keys(recommendation.expectedImpact).length > 0 && (
        <Box mt="2" p="2" bg="blue.50" borderRadius="md">
          <Typography variant="caption" color="blue.700" mb="1">
            Impacto Esperado:
          </Typography>
          <Stack gap="1">
            {Object.entries(recommendation.expectedImpact).map(([key, value]) => (
              <Typography key={key} variant="body" fontSize="sm" color="blue.900">
                • {value}
              </Typography>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
