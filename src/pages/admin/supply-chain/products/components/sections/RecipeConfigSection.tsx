/**
 * RECIPE CONFIG SECTION
 *
 * Sección para configurar Bill of Materials (BOM) o Kit de productos.
 * Usa RecipeBuilder del Recipe Module para definir la composición del producto.
 *
 * Casos de uso:
 * - Producto con BOM (Materials → Product): Hamburguesa (pan + carne + lechuga)
 * - Kit de Productos (Products → Product): Combo (burger + fries + drink)
 *
 * @design docs/recipe/ARCHITECTURE_DEFINITIVE.md - Products Integration
 */

import { Box, Stack, Alert, Text } from '@/shared/ui';
import { RecipeBuilder } from '@/modules/recipe/components/RecipeBuilder';
import type { Recipe } from '@/modules/recipe/types';
import type { FormSectionProps } from '../../types/productForm';

export interface RecipeConfigFields {
  /** ID de la receta asociada */
  recipe_id?: string;

  /** Flag para habilitar/deshabilitar BOM */
  has_recipe: boolean;
}

interface RecipeConfigSectionProps extends Omit<FormSectionProps, 'data' | 'onChange'> {
  data: RecipeConfigFields;
  onChange: (data: RecipeConfigFields) => void;
}

export function RecipeConfigSection({
  data,
  onChange,
  errors = [],
  readOnly = false
}: RecipeConfigSectionProps) {

  // Get error for specific field
  const getFieldError = (fieldName: string) => {
    return errors.find(e =>
      e.field === `recipe_config.${fieldName}` ||
      e.field === fieldName
    );
  };

  // Handler para cuando se guarda la receta
  const handleRecipeSave = (recipe: Recipe) => {
    onChange({
      ...data,
      recipe_id: recipe.id,
      has_recipe: true
    });
  };

  // Handler para cancelar
  const handleRecipeCancel = () => {
    // No hacer nada, mantener el estado actual
  };

  return (
    <Stack gap="4">
      {/* Descripción de la sección */}
      <Box>
        <Text fontSize="sm" color="fg.muted">
          Define los materiales o productos que componen este producto.
          La receta se ejecutará automáticamente al vender el producto.
        </Text>
      </Box>

      {/* Error general de la sección */}
      {getFieldError('recipe_id') && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Description>
            {getFieldError('recipe_id')?.message}
          </Alert.Description>
        </Alert.Root>
      )}

      {/* RecipeBuilder Integration */}
      <RecipeBuilder
        mode={data.recipe_id ? 'edit' : 'create'}
        recipeId={data.recipe_id}
        entityType="product"
        complexity="standard"
        features={{
          showCostCalculation: true,
          showInstructions: false,         // Post-MVP
          showScrapConfig: true,            // 🆕 Replaces showYieldConfig
          allowSubstitutions: false,        // Post-MVP
          enableAiSuggestions: false,       // Post-MVP
          allowProductInputs: true,         // 🆕 CRITICAL: Allow products as inputs (for kits/combos)
        }}
        onSave={handleRecipeSave}
        onCancel={handleRecipeCancel}
        validateOnChange={true}
      />

      {/* Información adicional */}
      {data.recipe_id && (
        <Alert.Root status="success">
          <Alert.Indicator />
          <Alert.Description>
            ✓ Receta configurada correctamente. Los materiales se consumirán al vender este producto.
          </Alert.Description>
        </Alert.Root>
      )}
    </Stack>
  );
}
