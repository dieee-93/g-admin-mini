// src/features/recipes/ui/RecipeList.tsx
import { 
  Table, 
  Box, 
  Heading, 
  Badge, 
  Button,
  HStack,
  VStack,
  Text,
  Alert,
  Input,
  Spinner,
  Collapsible
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRecipes, useRecipeOperations } from '../logic/useRecipes';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { type RecipeViability, type RecipeExecution } from '../types';

export function RecipeList() {
  const { recipesWithCosts, loadingCosts, reloadRecipesWithCosts } = useRecipes();
  const { loading: operationLoading, checkViability, execute } = useRecipeOperations();
  const { handleError, handleSuccess, handleWarning } = useErrorHandler();
  
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [viabilityData, setViabilityData] = useState<RecipeViability | null>(null);
  const [executionData, setExecutionData] = useState<RecipeExecution | null>(null);
  const [batches, setBatches] = useState<string>('1');
  const [showViability, setShowViability] = useState(false);
  const [showExecuteForm, setShowExecuteForm] = useState(false);
  const [showExecutionResult, setShowExecutionResult] = useState(false);

  if (loadingCosts) return <LoadingSpinner message="Cargando recetas..." />;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const handleCheckViability = async (recipeId: string) => {
    try {
      setSelectedRecipe(recipeId);
      const result = await checkViability(recipeId);
      setViabilityData(result);
      setShowViability(true);
      setShowExecuteForm(false);
      setShowExecutionResult(false);
    } catch (error) {
      handleError(error, 'Error verificando viabilidad');
    }
  };

  const handleExecuteRecipe = (recipeId: string) => {
    setSelectedRecipe(recipeId);
    setBatches('1');
    setShowExecuteForm(true);
    setShowViability(false);
    setShowExecutionResult(false);
  };

  const confirmExecution = async () => {
    if (!selectedRecipe) return;

    const batchCount = parseInt(batches);
    if (isNaN(batchCount) || batchCount <= 0) {
      handleWarning('Ingrese un número válido de lotes');
      return;
    }

    try {
      const result = await execute(selectedRecipe, batchCount);
      setExecutionData(result);
      
      if (result.success) {
        handleSuccess(result.message);
        await reloadRecipesWithCosts(); // Refrescar la lista
        setShowExecuteForm(false);
        setShowExecutionResult(true);
      } else {
        handleError(result.message);
        closeAll();
      }
    } catch (error) {
      handleError(error, 'Error ejecutando receta');
      closeAll();
    }
  };

  const closeAll = () => {
    setShowViability(false);
    setShowExecuteForm(false);
    setShowExecutionResult(false);
    setSelectedRecipe(null);
    setViabilityData(null);
    setExecutionData(null);
    setBatches('1');
  };

  const getViabilityColor = (isViable: boolean) => {
    return isViable ? 'green' : 'red';
  };

  const selectedRecipeData = recipesWithCosts.find(r => r.id === selectedRecipe);

  return (
    <Box>
      <HStack justify="space-between" align="center" mb={4}>
        <Heading size="md" color="purple.600">
          📝 Recetas con Costeo
        </Heading>
        <Badge colorScheme="purple" variant="subtle">
          {recipesWithCosts.length} recetas
        </Badge>
      </HStack>

      {recipesWithCosts.length === 0 ? (
        <Box p={8} textAlign="center" color="gray.500">
          <Text>No hay recetas registradas</Text>
          <Text fontSize="sm" mt={2}>
            Crea tu primera receta usando el formulario de arriba
          </Text>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          <Table.Root size="sm" variant="simple" showColumnBorder>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Receta</Table.ColumnHeader>
                <Table.ColumnHeader>Producto</Table.ColumnHeader>
                <Table.ColumnHeader>Cantidad</Table.ColumnHeader>
                <Table.ColumnHeader>Costo Total</Table.ColumnHeader>
                <Table.ColumnHeader>Costo/Unidad</Table.ColumnHeader>
                <Table.ColumnHeader>Tiempo</Table.ColumnHeader>
                <Table.ColumnHeader>Ingredientes</Table.ColumnHeader>
                <Table.ColumnHeader>Estado</Table.ColumnHeader>
                <Table.ColumnHeader>Acciones</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {recipesWithCosts.map((recipe) => (
                <Table.Row key={recipe.id}>
                  <Table.Cell>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">{recipe.name}</Text>
                    </VStack>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="medium">
                        {recipe.output_item?.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {recipe.output_item?.unit}
                      </Text>
                    </VStack>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Text fontWeight="medium">{recipe.output_quantity}</Text>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Text color="green.600" fontWeight="bold">
                      {formatCurrency(recipe.total_cost)}
                    </Text>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Text color="blue.600" fontWeight="medium">
                      {formatCurrency(recipe.cost_per_unit)}
                    </Text>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Text fontSize="sm">
                      {formatTime(recipe.preparation_time)}
                    </Text>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Badge size="sm" colorScheme="gray">
                      {recipe.ingredient_count} items
                    </Badge>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Badge 
                      size="sm" 
                      colorScheme={getViabilityColor(recipe.is_viable)}
                    >
                      {recipe.is_viable ? 'Viable' : 'Sin stock'}
                    </Badge>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <HStack spacing={1}>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleCheckViability(recipe.id)}
                        disabled={operationLoading}
                      >
                        {operationLoading && selectedRecipe === recipe.id ? (
                          <Spinner size="xs" />
                        ) : (
                          '🔍'
                        )}
                      </Button>
                      
                      <Button
                        size="xs"
                        colorScheme="green"
                        variant="ghost"
                        onClick={() => handleExecuteRecipe(recipe.id)}
                        disabled={!recipe.is_viable || operationLoading}
                      >
                        ▶️
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {/* Panel de Viabilidad */}
          {showViability && viabilityData && selectedRecipeData && (
            <Box borderWidth="1px" borderRadius="md" p={4} bg="blue.50">
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold" color="blue.700">
                    🔍 Viabilidad: {selectedRecipeData.name}
                  </Text>
                  <Button size="sm" variant="ghost" onClick={closeAll}>
                    ✕
                  </Button>
                </HStack>
                
                <Alert.Root 
                  status={viabilityData.is_viable ? 'success' : 'warning'}
                >
                  <Alert.Indicator />
                  <Alert.Description>
                    {viabilityData.is_viable 
                      ? 'La receta se puede ejecutar con el stock actual'
                      : 'No hay suficiente stock para algunos ingredientes'
                    }
                  </Alert.Description>
                </Alert.Root>

                {!viabilityData.is_viable && viabilityData.missing_ingredients.length > 0 && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Ingredientes faltantes:
                    </Text>
                    <VStack spacing={2} align="stretch">
                      {viabilityData.missing_ingredients.map((item, index) => (
                        <Box key={index} p={3} bg="red.50" borderRadius="md">
                          <Text fontWeight="medium" color="red.700">
                            {item.item_name}
                          </Text>
                          <Text fontSize="sm" color="red.600">
                            Necesario: {item.required} | Disponible: {item.available} | 
                            Falta: {item.missing}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Box>
          )}

          {/* Panel de Ejecución */}
          {showExecuteForm && selectedRecipeData && (
            <Box borderWidth="1px" borderRadius="md" p={4} bg="green.50">
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold" color="green.700">
                    ▶️ Ejecutar: {selectedRecipeData.name}
                  </Text>
                  <Button size="sm" variant="ghost" onClick={closeAll}>
                    ✕
                  </Button>
                </HStack>
                
                <Box>
                  <Text mb={2}>Número de lotes a producir:</Text>
                  <Input
                    type="number"
                    min="1"
                    value={batches}
                    onChange={(e) => setBatches(e.target.value)}
                    placeholder="1"
                    maxWidth="150px"
                  />
                </Box>

                <Box p={3} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" color="blue.700">
                    Esto producirá: {selectedRecipeData.output_quantity * parseInt(batches || '1')} {selectedRecipeData.output_item?.unit} de {selectedRecipeData.output_item?.name}
                  </Text>
                </Box>

                <HStack spacing={3}>
                  <Button 
                    colorScheme="green"
                    onClick={confirmExecution}
                    disabled={operationLoading}
                  >
                    {operationLoading ? <Spinner size="sm" /> : 'Confirmar Ejecución'}
                  </Button>
                  <Button variant="outline" onClick={closeAll}>
                    Cancelar
                  </Button>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Panel de Resultado */}
          {showExecutionResult && executionData && (
            <Box borderWidth="1px" borderRadius="md" p={4} bg="green.50">
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold" color="green.700">
                    ✅ Resultado de Ejecución
                  </Text>
                  <Button size="sm" variant="ghost" onClick={closeAll}>
                    ✕
                  </Button>
                </HStack>
                
                <Alert.Root status="success">
                  <Alert.Indicator />
                  <Alert.Description>
                    {executionData.message}
                  </Alert.Description>
                </Alert.Root>

                {executionData.items_consumed.length > 0 && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Ingredientes consumidos:</Text>
                    <VStack spacing={1} align="stretch">
                      {executionData.items_consumed.map((item, index) => (
                        <Text key={index} fontSize="sm" color="red.600">
                          - {item.quantity} de {item.item_name}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}

                {executionData.items_produced.length > 0 && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Productos generados:</Text>
                    <VStack spacing={1} align="stretch">
                      {executionData.items_produced.map((item, index) => (
                        <Text key={index} fontSize="sm" color="green.600">
                          + {item.quantity} de {item.item_name}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
}