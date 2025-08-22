// Clean Recipe Builder - Simplified version using clean components
import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  Stack,
  Flex,
  Badge,
  Card,
  Button
} from '@chakra-ui/react';
import { 
  ArrowTopRightOnSquareIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { RecipeFormClean, RecipeListClean } from '@/services/recipe/components';
import type { Recipe } from '@/services/recipe/types';

interface RecipeBuilderCleanProps {
  mode: 'product' | 'material';
  onRecipeCreated?: (recipe: Recipe) => void;
  showList?: boolean;
  context?: string;
  className?: string;
}

export const RecipeBuilderClean: React.FC<RecipeBuilderCleanProps> = ({
  mode,
  onRecipeCreated,
  showList = true,
  context,
  className
}) => {
  const { navigate } = useNavigation();
  const [view, setView] = useState<'form' | 'list'>('form');
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();

  const handleRecipeSaved = (recipe: Recipe) => {
    onRecipeCreated?.(recipe);
    if (showList) {
      setView('list');
    }
    setEditingRecipe(undefined);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setView('form');
  };

  const handleNewRecipe = () => {
    setEditingRecipe(undefined);
    setView('form');
  };

  const openFullRecipeBuilder = () => {
    navigate('dashboard', '/recipes');
  };

  const getIcon = () => {
    return mode === 'product' ? '🍔' : '🧪';
  };

  const getTitle = () => {
    return mode === 'product' 
      ? 'Recetas de Productos'
      : 'Recetas de Materiales';
  };

  if (view === 'form' || !showList) {
    return (
      <Box className={className}>
        <RecipeFormClean
          recipe={editingRecipe}
          onSave={handleRecipeSaved}
          onCancel={showList ? () => setView('list') : undefined}
        />
      </Box>
    );
  }

  return (
    <Box className={className}>
      <Card.Root variant="outline">
        <Card.Header p="4">
          <Flex justify="space-between" align="center">
            <Flex gap="3" align="center">
              <Box fontSize="2xl">
                {getIcon()}
              </Box>
              <Stack gap="1">
                <Text fontSize="md" fontWeight="semibold">
                  {getTitle()}
                </Text>
                {context && (
                  <Badge 
                    colorPalette={mode === 'product' ? 'blue' : 'green'} 
                    size="sm" 
                    variant="subtle"
                  >
                    {context}
                  </Badge>
                )}
              </Stack>
            </Flex>
            
            <Flex gap="2">
              <Button
                size="sm"
                colorPalette={mode === 'product' ? 'blue' : 'green'}
                onClick={handleNewRecipe}
                leftIcon={<BeakerIcon className="w-4 h-4" />}
              >
                Nueva Receta
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                colorPalette="gray"
                onClick={openFullRecipeBuilder}
                rightIcon={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
              >
                Avanzado
              </Button>
            </Flex>
          </Flex>
        </Card.Header>

        <Card.Body p="4">
          {showList && (
            <RecipeListClean
              onEdit={handleEditRecipe}
              onSelect={handleEditRecipe}
            />
          )}
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

export default RecipeBuilderClean;