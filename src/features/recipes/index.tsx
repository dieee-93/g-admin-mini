// src/features/recipes/index.tsx
import { Box, VStack } from '@chakra-ui/react';
import { RecipeForm } from './ui/RecipeForm';
import { RecipeList } from './ui/RecipeList';

export default function RecipesPage() {
  return (
    <Box p={4}>
      <VStack gap={6} align="stretch">
        <RecipeForm />
        <RecipeList />
      </VStack>
    </Box>
  );
}