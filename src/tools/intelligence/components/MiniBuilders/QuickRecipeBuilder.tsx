import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  VStack, 
  HStack, 
  Text, 
  Button,
  Input,
  Select,
  createListCollection
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

  const difficultyOptions = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
    { label: 'Expert', value: 'expert' }
  ];

  const categoryOptions = [
    { label: 'Appetizer', value: 'appetizer' },
    { label: 'Main Course', value: 'main_course' },
    { label: 'Dessert', value: 'dessert' },
    { label: 'Beverage', value: 'beverage' },
    { label: 'Side Dish', value: 'side_dish' }
  ];

  const difficultyCollection = createListCollection({ items: difficultyOptions });
  const categoryCollection = createListCollection({ items: categoryOptions });

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
    <Card.Root p={6}>
      <Card.Body>
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
                <Select.Root
                  collection={difficultyCollection}
                  value={[difficulty]}
                  onValueChange={(details) => setDifficulty(details.value[0] as DifficultyLevel)}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select difficulty" />
                  </Select.Trigger>
                  <Select.Content>
                    {difficultyCollection.items.map((option) => (
                      <Select.Item key={option.value} item={option}>
                        <Select.ItemText>{option.label}</Select.ItemText>
                        <Select.ItemIndicator>✓</Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
              
              <Box flex={1}>
                <Text fontSize='sm' fontWeight='medium' mb={1}>Category</Text>
                <Select.Root
                  collection={categoryCollection}
                  value={[category]}
                  onValueChange={(details) => setCategory(details.value[0] as RecipeCategory)}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select category" />
                  </Select.Trigger>
                  <Select.Content>
                    {categoryCollection.items.map((option) => (
                      <Select.Item key={option.value} item={option}>
                        <Select.ItemText>{option.label}</Select.ItemText>
                        <Select.ItemIndicator>✓</Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
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
      </Card.Body>
    </Card.Root>
  );
};
