// Refactored Recipes Page with improved navigation
import { useState, useEffect } from 'react';
import { Box, VStack, Text, Tabs, Badge } from '@chakra-ui/react';
import { BookOpenIcon, ChartBarIcon, BeakerIcon, CurrencyDollarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { useRecipes } from './logic/useRecipes';

// Import existing components
import { RecipeForm } from './ui/RecipeForm';
import { RecipeList } from './ui/RecipeList';
import { RecipeIntelligenceDashboard } from './components/RecipeIntelligenceDashboard/RecipeIntelligenceDashboard';
import { SmartCostCalculator } from './components/SmartCostCalculator/SmartCostCalculator';
import { QuickRecipeBuilder } from './components/MiniBuilders/QuickRecipeBuilder';
import { RecipesNavigation } from './components/Navigation/RecipesNavigation';

export default function RecipesPageRefactored() {
  const { setQuickActions } = useNavigation();
  const { recipes, loading } = useRecipes();
  
  const [activeSection, setActiveSection] = useState('intelligence');
  const [activeSubSection, setActiveSubSection] = useState<string | undefined>('dashboard');

  const handleSectionChange = (section: string, subSection?: string) => {
    setActiveSection(section);
    setActiveSubSection(subSection);
  };

  useEffect(() => {
    const quickActions = [
      {
        id: 'new-recipe',
        label: 'Nueva Receta',
        icon: PlusIcon,
        action: () => handleSectionChange('classic'),
        color: 'green'
      },
      {
        id: 'ai-builder',
        label: 'Constructor AI',
        icon: BeakerIcon,
        action: () => handleSectionChange('builder'),
        color: 'purple'
      },
      {
        id: 'cost-calculator',
        label: 'Calcular Costos',
        icon: CurrencyDollarIcon,
        action: () => handleSectionChange('calculator'),
        color: 'orange'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  const renderContent = () => {
    switch (activeSection) {
      case 'intelligence':
        return <RecipeIntelligenceDashboard recipes={recipes} />;
      
      case 'builder':
        return (
          <VStack align="stretch" gap={6}>
            <QuickRecipeBuilder 
              onRecipeCreated={(recipe) => {
                console.log('New recipe created with AI:', recipe);
              }}
            />
            <Text fontSize="sm" color="gray.600" textAlign="center">
              AI-powered recipe builder with automatic cost calculation and menu engineering
            </Text>
          </VStack>
        );
      
      case 'classic':
        return (
          <VStack gap={6} align="stretch">
            <RecipeForm />
            <RecipeList />
          </VStack>
        );
      
      case 'calculator':
        return <SmartCostCalculator />;
      
      default:
        return <RecipeIntelligenceDashboard recipes={recipes} />;
    }
  };

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        <VStack align="start" gap="2">
          <Text fontSize="3xl" fontWeight="bold">Recipe Intelligence System</Text>
          <Text color="gray.600">
            Transform from basic recipe builder to Recipe Intelligence System
          </Text>
        </VStack>

        <RecipesNavigation
          currentSection={activeSection}
          currentSubSection={activeSubSection}
          onSectionChange={handleSectionChange}
        />

        <Tabs.Root 
          value={activeSection} 
          onValueChange={(e) => handleSectionChange(e.value)}
          variant="line"
        >
          <Tabs.List>
            <Tabs.Trigger value="intelligence">
              <ChartBarIcon className="w-4 h-4" />
              Intelligence
              <Badge colorPalette="green" variant="subtle">v3.0</Badge>
            </Tabs.Trigger>
            <Tabs.Trigger value="builder">
              <BeakerIcon className="w-4 h-4" />
              AI Builder
              <Badge colorPalette="purple" variant="subtle">AI</Badge>
            </Tabs.Trigger>
            <Tabs.Trigger value="classic">
              <BookOpenIcon className="w-4 h-4" />
              Gestión
            </Tabs.Trigger>
            <Tabs.Trigger value="calculator">
              <CurrencyDollarIcon className="w-4 h-4" />
              Calculadora
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value={activeSection}>
            {renderContent()}
          </Tabs.Content>
        </Tabs.Root>

        {/* Intelligence Features Showcase */}
        <Box>
          <Text fontSize="md" fontWeight="semibold" mb={3} color="gray.700">
            Recipe Intelligence Features
          </Text>
          <VStack gap={2} align="stretch">
            <Badge colorPalette="green" size="sm">✓ Real-time Cost Calculation</Badge>
            <Badge colorPalette="green" size="sm">✓ Yield & Shrinkage Analysis</Badge>
            <Badge colorPalette="green" size="sm">✓ Menu Engineering Matrix</Badge>
            <Badge colorPalette="green" size="sm">✓ Profitability Intelligence</Badge>
            <Badge colorPalette="yellow" size="sm">⏳ Nutritional Analysis</Badge>
            <Badge colorPalette="yellow" size="sm">⏳ Kitchen Automation</Badge>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
