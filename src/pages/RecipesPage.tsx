// src/pages/RecipesPage.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Grid
} from '@chakra-ui/react';
import {
  BookOpenIcon,
  PlusIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import RecipesModule from '@/tools/intelligence';

export function RecipesPage() {
  const { setQuickActions } = useNavigation();
  
  // Local state
  const [activeView, setActiveView] = useState('intelligence');

  // Mock stats for now - will be replaced with real data
  const recipeStats = {
    totalRecipes: 24,
    profitableRecipes: 18,
    avgFoodCost: 28,
    topPerformers: 6
  };

  useEffect(() => {
    const quickActions = [
      {
        id: 'new-recipe',
        label: 'Nueva Receta',
        icon: PlusIcon,
        action: () => setActiveView('builder'),
        color: 'orange'
      },
      {
        id: 'recipe-analytics',
        label: 'Análisis',
        icon: ChartBarIcon,
        action: () => setActiveView('intelligence'),
        color: 'blue'
      },
      {
        id: 'recipe-intelligence',
        label: 'Inteligencia',
        icon: SparklesIcon,
        action: () => setActiveView('intelligence'),
        color: 'purple'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        {/* Header con métricas */}
        <VStack align="start" gap="2">
          <HStack justify="space-between" w="full">
            <VStack align="start" gap="1">
              <Text fontSize="3xl" fontWeight="bold">Recetas Inteligentes</Text>
              <Text color="gray.600">
                Sistema de inteligencia para recetas y costos
              </Text>
            </VStack>

            {/* Estadísticas */}
            <Grid templateColumns="repeat(4, 1fr)" gap="6">
              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {recipeStats.totalRecipes}
                </Text>
                <Text fontSize="xs" color="gray.500">Total Recetas</Text>
              </VStack>
              
              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {recipeStats.profitableRecipes}
                </Text>
                <Text fontSize="xs" color="gray.500">Rentables</Text>
              </VStack>

              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {recipeStats.avgFoodCost}%
                </Text>
                <Text fontSize="xs" color="gray.500">Costo Promedio</Text>
              </VStack>

              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {recipeStats.topPerformers}
                </Text>
                <Text fontSize="xs" color="gray.500">Top Performers</Text>
              </VStack>
            </Grid>
          </HStack>
        </VStack>

        {/* View Selector */}
        <HStack gap="4">
          <Button
            variant={activeView === 'intelligence' ? 'solid' : 'outline'}
            colorPalette="purple"
            onClick={() => setActiveView('intelligence')}
          >
            <SparklesIcon className="w-4 h-4" />
            Inteligencia
            <Badge colorPalette="purple" variant="subtle">AI</Badge>
          </Button>

          <Button
            variant={activeView === 'builder' ? 'solid' : 'outline'}
            colorPalette="orange"
            onClick={() => setActiveView('builder')}
          >
            <PlusIcon className="w-4 h-4" />
            Constructor
            <Badge colorPalette="orange" variant="subtle">Rápido</Badge>
          </Button>

          <Button
            variant={activeView === 'classic' ? 'solid' : 'outline'}
            colorPalette="gray"
            onClick={() => setActiveView('classic')}
          >
            <BookOpenIcon className="w-4 h-4" />
            Vista Clásica
          </Button>
        </HStack>

        {/* Main Content */}
        <RecipesModule currentView={activeView} />
      </VStack>
    </Box>
  );
}