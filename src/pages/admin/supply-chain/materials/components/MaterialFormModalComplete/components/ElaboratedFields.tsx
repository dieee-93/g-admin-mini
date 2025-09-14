import { Box, Stack, Alert, Text } from '@chakra-ui/react';
import { SelectField } from '@/shared/ui';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { type ItemFormData } from '../../../types';
import { CATEGORY_COLLECTION } from '../constants';
import { RecipeBuilderClean } from '@/shared/components/recipe/RecipeBuilderClean';

interface ElaboratedFieldsProps {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
}

export const ElaboratedFields = ({ 
  formData, 
  setFormData
}: ElaboratedFieldsProps) => {
  return (
    <Stack gap="6" w="full">
      {/* Business Category */}
      <Box w="full">
        <SelectField
          label="Categoría del Producto"
          placeholder="¿A qué categoría pertenece?"
          collection={CATEGORY_COLLECTION}
          value={formData.category ? [formData.category] : []}
          onValueChange={(details) => 
            setFormData({ 
              ...formData, 
              category: details.value[0]
            })
          }
          required
          height="44px"
          noPortal={true}
        />
      </Box>

      {/* Info sobre elaborados */}
      <Alert.Root status="warning" variant="subtle">
        <Alert.Indicator>
          <ExclamationTriangleIcon style={{ width: '16px', height: '16px' }} />
        </Alert.Indicator>
        <Alert.Title>Items Elaborados</Alert.Title>
        <Alert.Description>
          Los items elaborados requieren una receta con ingredientes. 
          El sistema verificará automáticamente que haya stock suficiente antes de permitir la producción.
        </Alert.Description>
      </Alert.Root>

      {/* Constructor de Receta */}
      <Box w="full">
        <RecipeBuilderClean
          mode="material"
          context={`Material: ${formData.name || 'Nuevo Item'}`}
          showList={false}
          onRecipeCreated={(recipe) => {
            // Actualizar formData con la receta creada
            // recipe shape comes from external module; suppress strict any errors
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const r = recipe as any;
            setFormData({ 
              ...formData, 
              recipe_id: r.id,
              initial_stock: r.output_quantity || 1,
              unit_cost: r.total_cost || 0
            });
          }}
        />
      </Box>
    </Stack>
  );
};
