// G-Admin Intelligence System v3.0 - Complete Intelligence Suite
import { useState } from 'react';
import { Box, VStack, HStack, Button, Text, Badge, SimpleGrid, Card } from '@chakra-ui/react';
import { 
  SparklesIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  DocumentChartBarIcon, 
  BeakerIcon,
  LightBulbIcon,
  CubeIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';

// Recipe Intelligence Components
import { RecipeForm } from './ui/RecipeForm';
import { RecipeList } from './ui/RecipeList';
import { RecipeIntelligenceDashboard } from './components/RecipeIntelligenceDashboard/RecipeIntelligenceDashboard';
import { QuickRecipeBuilder } from './components/MiniBuilders/QuickRecipeBuilder';
import { useRecipes } from './logic/useRecipes';

// Phase 3: AI Intelligence Components
import { AIRecipeOptimizer } from './ai/AIRecipeOptimizer';
import { CompetitiveIntelligence } from './ai/CompetitiveIntelligence';
import { PredictiveAnalytics } from './ai/PredictiveAnalytics';

// Phase 3: Business Intelligence Components
import { ExecutiveDashboard } from './business/ExecutiveDashboard';
import { CrossModuleAnalytics } from './business/CrossModuleAnalytics';
import { CustomReporting } from './business/CustomReporting';

interface IntelligenceSystemProps {
  currentView?: string;
}

export default function IntelligenceSystem({ currentView }: IntelligenceSystemProps) {
  const [activeView, setActiveView] = useState(currentView || 'overview');
  const { recipes, loading } = useRecipes();

  const intelligenceModules = [
    {
      key: 'overview',
      label: 'Intelligence Overview',
      badge: 'New',
      description: 'Complete intelligence suite overview',
      icon: LightBulbIcon,
      color: 'purple'
    },
    {
      key: 'recipes',
      label: 'Recipe Intelligence',
      badge: 'v3.0',
      description: 'Smart cost calculation & Menu engineering',
      icon: BeakerIcon,
      color: 'green'
    },
    {
      key: 'ai-optimizer',
      label: 'AI Recipe Optimizer',
      badge: 'AI',
      description: 'Intelligent ingredient substitution & cost optimization',
      icon: SparklesIcon,
      color: 'blue'
    },
    {
      key: 'competitive',
      label: 'Competitive Intelligence',
      badge: 'Market',
      description: 'Market pricing analysis & competitive positioning',
      icon: ArrowTrendingUpIcon,
      color: 'orange'
    },
    {
      key: 'predictive',
      label: 'Predictive Analytics',
      badge: 'ML',
      description: 'Demand prediction & seasonal adjustments',
      icon: ChartBarIcon,
      color: 'cyan'
    },
    {
      key: 'executive',
      label: 'Executive Dashboard',
      badge: 'C-Level',
      description: 'Strategic insights & executive KPIs',
      icon: PresentationChartLineIcon,
      color: 'red'
    },
    {
      key: 'cross-module',
      label: 'Cross-Module Analytics',
      badge: 'Holistic',
      description: 'Business correlations & bottleneck detection',
      icon: CubeIcon,
      color: 'indigo'
    },
    {
      key: 'reporting',
      label: 'Custom Reporting',
      badge: 'Builder',
      description: 'Flexible report builder & automation',
      icon: DocumentChartBarIcon,
      color: 'teal'
    }
  ];

  return (
    <Box p={6}>
      <VStack gap={6} align='stretch'>
        {/* Header */}
        <Box textAlign='center'>
          <Text fontSize='3xl' fontWeight='bold' mb={2}>
            🧠 G-Admin Intelligence System v3.0
          </Text>
          <Text fontSize='lg' color='gray.600' mb={2}>
            Suite completa de inteligencia artificial y análisis empresarial
          </Text>
          <Text fontSize='sm' color='gray.500'>
            Optimización con IA, análisis predictivo, inteligencia competitiva y reportes personalizados
          </Text>
        </Box>

        {/* Intelligence Modules Grid */}
        {activeView === 'overview' && (
          <VStack gap={6} align='stretch'>
            <Text fontSize='xl' fontWeight='semibold' textAlign='center'>
              Módulos de Inteligencia Disponibles
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {intelligenceModules.slice(1).map((module) => {
                const IconComponent = module.icon;
                return (
                  <Card.Root 
                    key={module.key}
                    variant='outline'
                    cursor='pointer'
                    transition='all 0.2s'
                    _hover={{ 
                      transform: 'translateY(-4px)', 
                      shadow: 'lg',
                      borderColor: `${module.color}.300`
                    }}
                    onClick={() => setActiveView(module.key)}
                  >
                    <Card.Body p={6} textAlign='center'>
                      <VStack gap={4}>
                        <Box 
                          p={3} 
                          bg={`${module.color}.100`} 
                          borderRadius='full'
                          display='inline-flex'
                        >
                          <IconComponent className={`w-8 h-8 text-${module.color}-600`} />
                        </Box>
                        
                        <VStack gap={2}>
                          <HStack gap={2} justify='center'>
                            <Text fontSize='lg' fontWeight='bold'>
                              {module.label}
                            </Text>
                            <Badge colorPalette={module.color} size='sm'>
                              {module.badge}
                            </Badge>
                          </HStack>
                          
                          <Text fontSize='sm' color='gray.600' textAlign='center'>
                            {module.description}
                          </Text>
                        </VStack>
                        
                        <Button 
                          size='sm' 
                          colorPalette={module.color}
                          variant='outline'
                          w='full'
                        >
                          Acceder
                        </Button>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                );
              })}
            </SimpleGrid>
            
            {/* Quick Navigation */}
            <HStack justify='center' gap={2} wrap='wrap'>
              {intelligenceModules.slice(1).map(module => (
                <Button
                  key={module.key}
                  size='sm'
                  variant='ghost'
                  colorPalette={module.color}
                  onClick={() => setActiveView(module.key)}
                >
                  {module.label}
                </Button>
              ))}
            </HStack>
          </VStack>
        )}

        {/* Individual Module Views */}
        {activeView === 'recipes' && (
          <RecipeIntelligenceDashboard recipes={recipes} loading={loading} />
        )}

        {activeView === 'ai-optimizer' && (
          <AIRecipeOptimizer />
        )}

        {activeView === 'competitive' && (
          <CompetitiveIntelligence />
        )}

        {activeView === 'predictive' && (
          <PredictiveAnalytics />
        )}

        {activeView === 'executive' && (
          <ExecutiveDashboard />
        )}

        {activeView === 'cross-module' && (
          <CrossModuleAnalytics />
        )}

        {activeView === 'reporting' && (
          <CustomReporting />
        )}

        {/* Back to Overview */}
        {activeView !== 'overview' && (
          <HStack justify='center'>
            <Button 
              variant='outline'
              colorPalette='gray'
              onClick={() => setActiveView('overview')}
            >
              ← Volver al Resumen de Inteligencia
            </Button>
          </HStack>
        )}

        {/* Intelligence Suite Features (always visible on overview) */}
        {activeView === 'overview' && (
          <Card.Root variant='subtle' bg='gradient(to-r, blue.50, purple.50)'>
            <Card.Body p={6}>
              <VStack gap={4}>
                <Text fontSize='lg' fontWeight='bold' color='gray.800' textAlign='center'>
                  🚀 Capacidades del Sistema de Inteligencia
                </Text>
                
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={3} w='full'>
                  <Badge colorPalette='green' size='sm' p={2} textAlign='center'>✅ Optimización IA de Recetas</Badge>
                  <Badge colorPalette='green' size='sm' p={2} textAlign='center'>✅ Análisis Competitivo</Badge>
                  <Badge colorPalette='green' size='sm' p={2} textAlign='center'>✅ Análisis Predictivo</Badge>
                  <Badge colorPalette='green' size='sm' p={2} textAlign='center'>✅ Dashboard Ejecutivo</Badge>
                  <Badge colorPalette='green' size='sm' p={2} textAlign='center'>✅ Analytics Cross-Módulo</Badge>
                  <Badge colorPalette='green' size='sm' p={2} textAlign='center'>✅ Reportes Personalizados</Badge>
                  <Badge colorPalette='green' size='sm' p={2} textAlign='center'>✅ Automatización Inteligente</Badge>
                  <Badge colorPalette='green' size='sm' p={2} textAlign='center'>✅ Insights en Tiempo Real</Badge>
                </SimpleGrid>
                
                <Text fontSize='sm' color='gray.600' textAlign='center'>
                  Sistema completo de inteligencia empresarial con IA avanzada para optimización integral del negocio
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        )}
      </VStack>
    </Box>
  );
}

// Export both the main component and individual modules for routing
export {
  AIRecipeOptimizer,
  CompetitiveIntelligence,
  PredictiveAnalytics,
  ExecutiveDashboard,
  CrossModuleAnalytics,
  CustomReporting
};
