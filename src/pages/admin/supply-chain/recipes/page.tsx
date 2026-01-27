/**
 * Recipes Page - Recipe Management & BOM Configuration - v6.0 Magic Patterns
 *
 * FEATURES:
 * - Recipe CRUD operations
 * - Cost calculation & analysis
 * - Template system
 * - Multi-entity support (materials, products, kits, services)
 * - Recipe Workshop: Scaling, Substitutions, Optimization, Analysis
 */

import { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Flex,
  Text,
  Badge,
  Tabs,
  Icon,
  SimpleGrid
} from '@/shared/ui';
import {
  BeakerIcon,
  PlusIcon,
  ListBulletIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { RecipeBuilder, ScalingTool, MenuEngineeringDashboard } from '@/modules/recipe/components';
import type { Recipe } from '@/modules/recipe/types';

type TabValue = 'list' | 'create' | 'workshop' | 'analytics';

export default function RecipesPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('list');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleCreateRecipe = () => {
    setActiveTab('create');
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    console.log('Recipe saved:', recipe);
    setActiveTab('list');
    setSelectedRecipe(null);
  };

  const handleCancelRecipe = () => {
    setActiveTab('list');
    setSelectedRecipe(null);
  };

  return (
    <Box position="relative" minH="100vh" bg="bg.canvas" overflow="hidden">
      {/* Decorative Background Blobs */}
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        width="500px"
        height="500px"
        bg="purple.50"
        borderRadius="full"
        opacity="0.4"
        filter="blur(80px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-10%"
        left="-5%"
        width="400px"
        height="400px"
        bg="pink.50"
        borderRadius="full"
        opacity="0.4"
        filter="blur(80px)"
        pointerEvents="none"
      />

      <Box position="relative" zIndex="1" p={{ base: "6", md: "8" }}>

      <Stack gap="8" w="100%">
        {/* Header */}
        <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
          <Flex align="center" gap="3">
            <Box
              p="3"
              bg="linear-gradient(135deg, var(--chakra-colors-purple-400), var(--chakra-colors-purple-600))"
              borderRadius="xl"
              shadow="lg"
            >
              🧪
            </Box>
            <Box>
              <Box as="h1" fontSize="2xl" fontWeight="bold">
                Gestión de Recetas
              </Box>
              <Text fontSize="sm" color="text.muted">
                Define composiciones, analiza costos, optimiza recetas y escala producción
              </Text>
            </Box>
          </Flex>
          <Button
            colorPalette="blue"
            onClick={handleCreateRecipe}
          >
            <Icon icon={PlusIcon} size="xs" />
            Nueva Receta
          </Button>
        </Flex>

        {/* Main Tabs */}
        <Box bg="bg.surface" p="6" borderRadius="2xl" shadow="xl">
          <Tabs.Root
            value={activeTab}
            onValueChange={(e) => setActiveTab(e.value as TabValue)}
            variant="enclosed"
          >
            <Tabs.List>
              <Tabs.Trigger value="list">
                <Icon icon={ListBulletIcon} size="sm" />
                Listado
              </Tabs.Trigger>
              <Tabs.Trigger value="create" disabled={activeTab !== 'create'}>
                <Icon icon={PlusIcon} size="sm" />
                Crear Receta
              </Tabs.Trigger>
              <Tabs.Trigger value="workshop">
                <Icon icon={WrenchScrewdriverIcon} size="sm" />
                Workshop
                <Badge ml="2" colorPalette="purple" size="sm">Nuevo</Badge>
              </Tabs.Trigger>
              <Tabs.Trigger value="analytics">
                <Icon icon={ChartBarIcon} size="sm" />
                Analytics
                <Badge ml="2" colorPalette="green" size="sm">Nuevo</Badge>
              </Tabs.Trigger>
            </Tabs.List>

            {/* Tab: Listado */}
            <Tabs.Content value="list">
              <Box pt="6">
                <Box
                  p="8"
                  textAlign="center"
                  bg="bg.muted"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="border.default"
                >
                  <Stack gap="4" align="center">
                    <Icon icon={BeakerIcon} size="2xl" opacity="0.3" />
                    <Text color="text.muted">
                      No hay recetas creadas. Haz clic en "Nueva Receta" para comenzar.
                    </Text>
                    <Button
                      variant="outline"
                      colorPalette="blue"
                      onClick={handleCreateRecipe}
                    >
                      Crear Primera Receta
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Tabs.Content>

            {/* Tab: Crear Receta */}
            <Tabs.Content value="create">
              <Box pt="6">
                <Stack gap="4">
                  <Flex align="center" gap="3">
                    <Icon icon={BeakerIcon} size="lg" />
                    <Text fontSize="xl" fontWeight="bold">
                      Nueva Receta
                    </Text>
                    <Badge colorPalette="blue">RecipeBuilder Full</Badge>
                  </Flex>

                  <RecipeBuilder
                    mode="create"
                    entityType="product"
                    complexity="advanced"
                    features={{
                      showCostCalculation: true,
                      showAnalytics: true,
                      showInstructions: true,
                      showYieldConfig: true,
                      showQualityConfig: true,
                      allowSubstitutions: true,
                      enableAiSuggestions: false
                    }}
                    onSave={handleSaveRecipe}
                    onCancel={handleCancelRecipe}
                    validateOnChange={true}
                  />
                </Stack>
              </Box>
            </Tabs.Content>

            {/* Tab: Workshop */}
            <Tabs.Content value="workshop">
              <Box pt="6">
                <ScalingTool
                  recipe={selectedRecipe || undefined}
                  onScaled={(scaledRecipe) => {
                    console.log('Recipe escalada:', scaledRecipe);
                    // TODO: Mostrar modal para guardar como nueva receta
                  }}
                />
              </Box>
            </Tabs.Content>

            {/* Tab: Analytics */}
            <Tabs.Content value="analytics">
              <Box pt="6">
                <MenuEngineeringDashboard useMockData={true} />
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Stack>
      </Box>
    </Box>
  );
}
