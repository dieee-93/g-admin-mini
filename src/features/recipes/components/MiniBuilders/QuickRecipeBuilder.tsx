import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  VStack, 
  HStack, 
  Text, 
  Button,
  Input,
  Select 
} from '@chakra-ui/react';
import { SmartCostCalculator } from '../SmartCostCalculator/SmartCostCalculator';
import { MenuEngineeringAnalysis } from '../MenuEngineering/MenuEngineeringAnalysis';
import type { DifficultyLevel, RecipeCategory } from '../../types';

interface QuickRecipeBuilderProps {
  onRecipeCreated?: (recipe: any) => void;
}

export const QuickRecipeBuilder: React.FC<QuickRecipeBuilderProps> = ({ 
  onRecipeCreated 
}) => {
  const [recipeName, setRecipeName] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [category, setCategory] = useState<RecipeCategory>('main_course');
  const [prepTime, setPrepTime] = useState(30);

  const handleCreateRecipe = () => {
    const newRecipe = {
      name: recipeName,
      difficulty_level: difficulty,
      recipe_category: category,
      preparation_time: prepTime,
      ingredients: []
    };
    
    onRecipeCreated?.(newRecipe);
  };

  return (
    <Card p={6}>
      <VStack align='stretch' gap={4}>
        <Text fontSize='xl' fontWeight='bold'>
          Quick Recipe Builder
        </Text>
        
        <VStack align='stretch' gap={3}>
          <Box>
            <Text fontSize='sm' fontWeight='medium' mb={1}>Recipe Name</Text>
            <Input 
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder='Enter recipe name...'
            />
          </Box>
          
          <HStack gap={4}>
            <Box flex={1}>
              <Text fontSize='sm' fontWeight='medium' mb={1}>Difficulty</Text>
              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              >
                <option value='beginner'>Beginner</option>
                <option value='intermediate'>Intermediate</option>
                <option value='advanced'>Advanced</option>
                <option value='expert'>Expert</option>
              </Select>
            </Box>
            
            <Box flex={1}>
              <Text fontSize='sm' fontWeight='medium' mb={1}>Category</Text>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as RecipeCategory)}
              >
                <option value='appetizer'>Appetizer</option>
                <option value='main_course'>Main Course</option>
                <option value='dessert'>Dessert</option>
                <option value='beverage'>Beverage</option>
                <option value='side_dish'>Side Dish</option>
              </Select>
            </Box>
          </HStack>
          
          <Box>
            <Text fontSize='sm' fontWeight='medium' mb={1}>
              Prep Time (minutes): {prepTime}
            </Text>
            <Input 
              type='range'
              min={5}
              max={180}
              value={prepTime}
              onChange={(e) => setPrepTime(Number(e.target.value))}
            />
          </Box>
        </VStack>
        
        <Button 
          colorPalette='blue' 
          onClick={handleCreateRecipe}
          disabled={!recipeName.trim()}
        >
          Create Recipe with AI Intelligence
        </Button>
        
        <Text fontSize='xs' color='gray.500'>
          Includes automatic cost calculation, menu engineering analysis, and nutritional profiling
        </Text>
      </VStack>
    </Card>
  );
};
