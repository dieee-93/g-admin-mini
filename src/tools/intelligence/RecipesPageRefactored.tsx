// Refactored Recipes Page with UNIFIED navigation pattern
import { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Tabs, Badge, Card } from '@chakra-ui/react';
import { 
  BookOpenIcon, 
  ChartBarIcon, 
  BeakerIcon, 
  CurrencyDollarIcon, 
  PlusIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { useRecipes } from './logic/useRecipes';

// Import existing components
import { RecipeForm } from './ui/RecipeForm';
import { RecipeList } from './ui/RecipeList';
import { RecipeIntelligenceDashboard } from './components/RecipeIntelligenceDashboard/RecipeIntelligenceDashboard';
import { SmartCostCalculator } from './components/SmartCostCalculator/SmartCostCalculator';
import { QuickRecipeBuilder } from './components/MiniBuilders/QuickRecipeBuilder';

export default function RecipesPageRefactored() {
  const { setQuickActions } = useNavigation();
  const { recipes, loading } = useRecipes();
  
  const [activeSection, setActiveSection] = useState('intelligence');

  useEffect(() => {
    const quickActions = [
      {
        id: 'quick-builder',
        label: 'Quick Builder',
        icon: BeakerIcon,
        action: () => setActiveSection('builder'),
        color: 'purple'
      },
      {
        id: 'new-recipe',
        label: 'Nueva Receta',
        icon: PlusIcon,
        action: () => setActiveSection('classic'),
        color: 'green'
      },
      {
        id: 'cost-calculator',
        label: 'Calculadora',
        icon: CurrencyDollarIcon,
        action: () => setActiveSection('calculator'),
        color: 'orange'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  const renderContent = () => {
    switch (activeSection) {
      case 'intelligence':
        return <RecipeIntelligenceDashboard recipes={recipes} loading={loading} />;
      case 'builder':
        return <QuickRecipeBuilder />;
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
        return <RecipeIntelligenceDashboard recipes={recipes} loading={loading} />;
    }
  };

  return (
    <Box p="6" maxW="7xl" mx="auto">
      <VStack gap="6" align="stretch">
        {/* UNIFIED PATTERN: Header with icon, badges, KPIs */}
        <Card.Root>
          <Card.Body>
            <HStack gap="4">
              <Box p="2" bg="green.100" borderRadius="md">
                <AcademicCapIcon className="w-8 h-8 text-green-600" />
              </Box>
              <VStack align="start" gap="1">
                <HStack>
                  <Text fontSize="2xl" fontWeight="bold">
                    Recipe Intelligence
                  </Text>
                  <Badge colorPalette="green" variant="subtle">
                    v3.0
                  </Badge>
                  <Badge colorPalette="purple" variant="subtle">
                    AI
                  </Badge>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  Smart cost calculation + Menu engineering + AI-powered recipe creation
                </Text>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* UNIFIED PATTERN: Tabs (exactly 4) */}
        <Tabs.Root 
          value={activeSection} 
          onValueChange={(e) => setActiveSection(e.value)}
          variant="line"
        >
          <Tabs.List>
            <Tabs.Trigger value="intelligence">
              <ChartBarIcon className="w-4 h-4" />
              Intelligence
              <Badge colorPalette="blue" variant="subtle">v3.0</Badge>
            </Tabs.Trigger>
            <Tabs.Trigger value="builder">
              <BeakerIcon className="w-4 h-4" />
              Quick Builder
              <Badge colorPalette="purple" variant="subtle">AI</Badge>
            </Tabs.Trigger>
            <Tabs.Trigger value="classic">
              <BookOpenIcon className="w-4 h-4" />
              Gestión Clásica
            </Tabs.Trigger>
            <Tabs.Trigger value="calculator">
              <CurrencyDollarIcon className="w-4 h-4" />
              Calculadora
            </Tabs.Trigger>
          </Tabs.List>

          {/* UNIFIED PATTERN: Content area */}
          <Tabs.Content value={activeSection}>
            {renderContent()}
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}
