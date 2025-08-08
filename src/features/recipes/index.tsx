// G-Admin Recipes Module v3.0 - Recipe Intelligence System
import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Button, Text, Badge } from '@chakra-ui/react';
import { RecipeForm } from './ui/RecipeForm';
import { RecipeList } from './ui/RecipeList';
import { RecipeIntelligenceDashboard } from './components/RecipeIntelligenceDashboard/RecipeIntelligenceDashboard';
import { SmartCostCalculator } from './components/SmartCostCalculator/SmartCostCalculator';
import { QuickRecipeBuilder } from './components/MiniBuilders/QuickRecipeBuilder';
import { useRecipes } from './logic/useRecipes';
import type { Recipe } from './types';

interface RecipesModuleProps {
  currentView?: string;
}

export default function RecipesModule({ currentView }: RecipesModuleProps) {
  const [activeView, setActiveView] = useState(currentView || 'intelligence');
  const { recipes, loading } = useRecipes();

  const views = [
    {
      key: 'intelligence',
      label: 'Recipe Intelligence',
      badge: 'v3.0',
      description: 'Smart cost calculation + Menu engineering'
    },
    {
      key: 'builder',
      label: 'Quick Builder',
      badge: 'AI',
      description: 'AI-powered recipe creation'
    },
    {
      key: 'classic',
      label: 'Classic View',
      badge: null,
      description: 'Traditional recipe management'
    }
  ];

  return (
    <Box p={4}>
      <VStack gap={6} align='stretch'>
        {/* Header with Navigation */}
        <Box>
          <VStack align='stretch' gap={4}>
            <Box textAlign='center'>
              <Text fontSize='2xl' fontWeight='bold' mb={2}>
                G-Admin Recipe Intelligence System
              </Text>
              <Text fontSize='sm' color='gray.600'>
                Transform from basic recipe builder to Recipe Intelligence System
              </Text>
            </Box>

            <HStack justify='center' gap={3} wrap='wrap'>
              {views.map(view => (
                <Button
                  key={view.key}
                  variant={activeView === view.key ? 'solid' : 'outline'}
                  colorPalette={activeView === view.key ? 'blue' : 'gray'}
                  onClick={() => setActiveView(view.key)}
                  size='sm'
                >
                  <HStack gap={2}>
                    <Text>{view.label}</Text>
                    {view.badge && (
                      <Badge 
                        colorPalette={view.badge === 'v3.0' ? 'green' : 'purple'}
                        size='xs'
                      >
                        {view.badge}
                      </Badge>
                    )}
                  </HStack>
                </Button>
              ))}
            </HStack>

            <Text fontSize='xs' color='gray.500' textAlign='center'>
              {views.find(v => v.key === activeView)?.description}
            </Text>
          </VStack>
        </Box>

        {/* Content based on active view */}
        {activeView === 'intelligence' && (
          <RecipeIntelligenceDashboard recipes={recipes} />
        )}

        {activeView === 'builder' && (
          <VStack align='stretch' gap={6}>
            <QuickRecipeBuilder 
              onRecipeCreated={(recipe) => {
                console.log('New recipe created with AI:', recipe);
                // Would integrate with useRecipes hook to add recipe
              }}
            />
            
            <Text fontSize='sm' color='gray.600' textAlign='center'>
              AI-powered recipe builder with automatic cost calculation and menu engineering
            </Text>
          </VStack>
        )}

        {activeView === 'classic' && (
          <>
            <RecipeForm />
            <RecipeList />
          </>
        )}

        {/* Intelligence Features Showcase (always visible) */}
        <Box>
          <Text fontSize='md' fontWeight='semibold' mb={3} color='gray.700'>
            Recipe Intelligence Features
          </Text>
          <HStack gap={4} wrap='wrap' justify='center'>
            <Badge colorPalette='green' size='sm'>✓ Real-time Cost Calculation</Badge>
            <Badge colorPalette='green' size='sm'>✓ Yield & Shrinkage Analysis</Badge>
            <Badge colorPalette='green' size='sm'>✓ Menu Engineering Matrix</Badge>
            <Badge colorPalette='green' size='sm'>✓ Profitability Intelligence</Badge>
            <Badge colorPalette='yellow' size='sm'>⏳ Nutritional Analysis</Badge>
            <Badge colorPalette='yellow' size='sm'>⏳ Kitchen Automation</Badge>
            <Badge colorPalette='yellow' size='sm'>⏳ AI Recipe Scaling</Badge>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}
