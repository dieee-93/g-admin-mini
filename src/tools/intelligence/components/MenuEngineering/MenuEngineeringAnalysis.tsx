import React from 'react';
import { Box, Card, Text, Badge, HStack } from '@chakra-ui/react';
import type { MenuCategory } from '../../types';

interface MenuEngineeringAnalysisProps {
  recipeId: string;
  category?: MenuCategory;
}

export const MenuEngineeringAnalysis: React.FC<MenuEngineeringAnalysisProps> = ({ 
  recipeId, 
  category = 'stars' 
}) => {
  const getCategoryColor = (cat: MenuCategory) => {
    switch (cat) {
      case 'stars': return 'green';
      case 'plowhorses': return 'blue';
      case 'puzzles': return 'yellow';
      case 'dogs': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryDescription = (cat: MenuCategory) => {
    switch (cat) {
      case 'stars': return 'High profit + High popularity';
      case 'plowhorses': return 'Low profit + High popularity';
      case 'puzzles': return 'High profit + Low popularity';
      case 'dogs': return 'Low profit + Low popularity';
      default: return 'Unknown category';
    }
  };

  return (
    <Card p={4}>
      <Text fontWeight='bold' mb={3}>Menu Engineering Analysis</Text>
      <HStack justify='space-between' align='center'>
        <Box>
          <Badge colorPalette={getCategoryColor(category)} size='lg'>
            {category.toUpperCase()}
          </Badge>
          <Text fontSize='sm' color='gray.600' mt={1}>
            {getCategoryDescription(category)}
          </Text>
        </Box>
        <Text fontSize='sm' color='gray.500'>
          Recipe: {recipeId}
        </Text>
      </HStack>
    </Card>
  );
};
