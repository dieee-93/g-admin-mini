// Clean Recipe List - Optimized for G-Admin Mini
import {
  Box,
  Text,
  Stack,
  Flex,
  Badge,
  Button,
  IconButton,
  SimpleGrid,
  Skeleton
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  BeakerIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useRecipes } from '../hooks/useRecipes';
import type { Recipe } from '../types';
import { CardWrapper, Icon, InputField } from '@/shared/ui';

interface RecipeListProps {
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipeId: string) => void;
  onSelect?: (recipe: Recipe) => void;
}

export const RecipeListClean: React.FC<RecipeListProps> = ({
  onEdit,
  onDelete,
  onSelect
}) => {
  const { recipes, isLoading, deleteRecipe } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;
    
    const query = searchQuery.toLowerCase();
    return recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(query) ||
      recipe.instructions?.toLowerCase().includes(query)
    );
  }, [recipes, searchQuery]);

  const handleDelete = async (recipeId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta receta?')) {
      try {
        await deleteRecipe(recipeId);
        onDelete?.(recipeId);
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return 'No especificado';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  const formatCost = (cost?: number) => {
    if (!cost) return 'No calculado';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(cost);
  };

  const getStatusColor = (recipe: Recipe) => {
    if (!recipe.recipe_ingredients?.length) return 'red';
    if (!recipe.instructions?.trim()) return 'yellow';
    return 'green';
  };

  const getStatusText = (recipe: Recipe) => {
    if (!recipe.recipe_ingredients?.length) return 'Sin ingredientes';
    if (!recipe.instructions?.trim()) return 'Sin instrucciones';
    return 'Completa';
  };

  if (isLoading) {
    return (
      <Box>
        <Stack gap="4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} height="120px" borderRadius="md" />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack gap="6">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="semibold">
            Recetas ({filteredRecipes.length})
          </Text>
        </Flex>

        {/* Search */}
        <Box position="relative">
          <InputField
            placeholder="Buscar recetas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            pl="10"
          />
          <Icon 
            icon={MagnifyingGlassIcon}
            size="sm"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--chakra-colors-gray-400)'
            }}
          />
        </Box>

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <CardWrapper>
            <CardWrapper.Body textAlign="center" py="12">
              <Icon icon={BeakerIcon} size="xl" color="gray.400" style={{ margin: '0 auto 16px auto' }} />
              <Text fontSize="lg" fontWeight="medium" mb="2">
                {searchQuery ? 'No se encontraron recetas' : 'No hay recetas'}
              </Text>
              <Text color="gray.600">
                {searchQuery 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Crea tu primera receta para comenzar'
                }
              </Text>
            </CardWrapper.Body>
          </CardWrapper>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
            {filteredRecipes.map((recipe) => (
              <CardWrapper 
                key={recipe.id} 
                variant="outline"
                cursor="pointer"
                _hover={{ borderColor: 'blue.300', shadow: 'md' }}
                onClick={() => onSelect?.(recipe)}
              >
                <CardWrapper.Body p="4">
                  <Stack gap="3">
                    {/* Header */}
                    <Flex justify="space-between" align="start">
                      <Box flex="1">
                        <Text fontSize="md" fontWeight="semibold" noOfLines={2}>
                          {recipe.name}
                        </Text>
                        <Badge 
                          colorPalette={getStatusColor(recipe)} 
                          variant="subtle" 
                          size="sm"
                          mt="1"
                        >
                          {getStatusText(recipe)}
                        </Badge>
                      </Box>

                      <Flex gap="1">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(recipe);
                          }}
                        >
                          <Icon icon={PencilIcon} size="sm" />
                        </IconButton>
                        <IconButton
                          variant="ghost"
                          colorPalette="red"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(recipe.id);
                          }}
                        >
                          <Icon icon={TrashIcon} size="sm" />
                        </IconButton>
                      </Flex>
                    </Flex>

                    {/* Stats */}
                    <Stack gap="2">
                      <Flex align="center" gap="2" fontSize="sm" color="gray.600">
                        <Icon icon={ClockIcon} size="sm" />
                        <Text>{formatTime(recipe.preparation_time)}</Text>
                      </Flex>

                      <Flex align="center" gap="2" fontSize="sm" color="gray.600">
                        <Icon icon={BeakerIcon} size="sm" />
                        <Text>
                          {recipe.recipe_ingredients?.length || 0} ingredientes
                        </Text>
                      </Flex>

                      <Flex align="center" gap="2" fontSize="sm" color="gray.600">
                        <Icon icon={CurrencyDollarIcon} size="sm" />
                        <Text>{formatCost(recipe.total_cost)}</Text>
                      </Flex>
                    </Stack>

                    {/* Instructions Preview */}
                    {recipe.instructions && (
                      <Text 
                        fontSize="sm" 
                        color="gray.600" 
                        noOfLines={2}
                        bg="bg.canvas"
                        p="2"
                        borderRadius="md"
                      >
                        {recipe.instructions}
                      </Text>
                    )}
                  </Stack>
                </CardWrapper.Body>
              </CardWrapper>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Box>
  );
};