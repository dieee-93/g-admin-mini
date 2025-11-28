import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Select,
} from '@chakra-ui/react';
import { InputField } from '@/shared/ui';
import type { InventoryItem } from '@/pages/admin/supply-chain/materials/types';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

interface RecipeIngredientForm {
  item_id: string;
  quantity: string;
}

interface RecipeFormIngredientsProps {
  ingredients: RecipeIngredientForm[];
  errors: {
    ingredients?: string;
  };
  items: InventoryItem[];
  ingredientItemsCollection: any;
  handleIngredientSelectChange: (index: number, details: { value: string[] }) => void;
  handleIngredientQuantityChange: (index: number, value: string) => void;
  addIngredient: () => void;
  removeIngredient: (index: number) => void;
}

export const RecipeFormIngredients: React.FC<RecipeFormIngredientsProps> = ({
  ingredients,
  errors,
  items,
  ingredientItemsCollection,
  handleIngredientSelectChange,
  handleIngredientQuantityChange,
  addIngredient,
  removeIngredient,
}) => {
  return (
    <Box>
      <HStack justify="space-between" mb="3">
        <Text fontSize="sm" fontWeight="medium" color="gray.700">
          Ingredientes
        </Text>
        <Badge colorPalette="purple" variant="subtle">
          {ingredients.filter(ing => ing.item_id && ing.quantity).length} ingredientes
        </Badge>
      </HStack>

      {errors.ingredients && (
        <Text color="red.500" fontSize="sm" mb="3">
          {errors.ingredients}
        </Text>
      )}

      <VStack gap="3">
        {ingredients.map((ingredient, index) => {
          const selectedItem = items.find(item => item.id === ingredient.item_id);
          const requiredQty = parseFloat(ingredient.quantity || '0');
          const hasStockIssue = selectedItem && requiredQty > selectedItem.stock;
          const hasNoCost = selectedItem && (!selectedItem.unit_cost || selectedItem.unit_cost <= 0);
          // ✅ PRECISION FIX: Use DecimalUtils for recipe ingredient cost
          const ingredientCost = selectedItem?.unit_cost
            ? DecimalUtils.multiply(
                selectedItem.unit_cost.toString(),
                requiredQty.toString(),
                'recipe'
              ).toNumber()
            : 0;

          return (
            <VStack key={index} gap="2" width="100%" align="stretch">
              <HStack gap="3" width="100%">
                <Box flex={2}>
                  <Select.Root
                    collection={ingredientItemsCollection}
                    value={ingredient.item_id ? [ingredient.item_id] : []}
                    onValueChange={(details) => handleIngredientSelectChange(index, details)}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar ingrediente" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content>
                        {ingredientItemsCollection.items.map((item: unknown) => (
                          <Select.Item key={item.value} item={item}>
                            <Select.ItemText>{item.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </Box>

                <InputField
                  placeholder={`Cantidad${selectedItem ? ` (${selectedItem.unit})` : ''}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientQuantityChange(index, e.target.value)}
                  flex={1}
                  borderColor={hasStockIssue ? 'red.300' : undefined}
                />

                <Button
                  size="sm"
                  colorPalette="red"
                  variant="ghost"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length === 1}
                >
                  ✕
                </Button>
              </HStack>

              {selectedItem && ingredient.quantity && (
                <HStack justify="space-between" fontSize="xs" px="2">
                  <HStack gap="2">
                    {hasStockIssue && (
                      <Badge colorPalette="red" size="sm">
                        ⚠️ Stock insuficiente
                      </Badge>
                    )}
                    {hasNoCost && (
                      <Badge colorPalette="orange" size="sm">
                        💰 Sin costo
                      </Badge>
                    )}
                  </HStack>
                  {ingredientCost > 0 && (
                    <Text color="green.600" fontWeight="medium">
                      ${ingredientCost.toFixed(2)}
                    </Text>
                  )}
                </HStack>
              )}
            </VStack>
          );
        })}

        <Button
          size="sm"
          variant="outline"
          colorPalette="purple"
          onClick={addIngredient}
          alignSelf="flex-start"
        >
          + Agregar ingrediente
        </Button>
      </VStack>
    </Box>
  );
};
