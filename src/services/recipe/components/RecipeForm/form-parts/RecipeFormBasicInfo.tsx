import {
  Box,
  Grid,
  Text,
  Select,
} from '@chakra-ui/react';
import { InputField } from '@/shared/ui';
import type { ChangeEvent } from 'react';
import type { InventoryItem } from '@/pages/admin/supply-chain/materials/types';

interface RecipeFormBasicInfoProps {
  form: {
    name: string;
    output_item_id: string;
    output_quantity: string;
  };
  errors: {
    name?: string;
    output_item_id?: string;
    output_quantity?: string;
  };
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleOutputSelectChange: (details: { value: string[] }) => void;
  elaboratedItemsCollection: any;
  selectedOutputItem: InventoryItem | undefined;
}

export const RecipeFormBasicInfo: React.FC<RecipeFormBasicInfoProps> = ({
  form,
  errors,
  handleChange,
  handleOutputSelectChange,
  elaboratedItemsCollection,
  selectedOutputItem,
}) => {
  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" color="gray.700" mb="3">
        Información Básica
      </Text>
      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr' }} gap="4">
        <Box>
          <Text fontSize="sm" color="gray.600" mb="1">
            Nombre de la receta
          </Text>
          <InputField
            placeholder="Ej: Pan integral casero"
            name="name"
            value={form.name}
            onChange={handleChange}
            borderColor={errors.name ? 'red.300' : undefined}
          />
          {errors.name && (
            <Text color="red.500" fontSize="sm" mt="1">
              {errors.name}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.600" mb="1">
            Producto que genera
          </Text>
          <Select.Root
            collection={elaboratedItemsCollection}
            value={form.output_item_id ? [form.output_item_id] : []}
            onValueChange={handleOutputSelectChange}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger
                borderColor={errors.output_item_id ? 'red.300' : undefined}
              >
                <Select.ValueText placeholder="Seleccionar producto" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {elaboratedItemsCollection.items.map((item: unknown) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
          {errors.output_item_id && (
            <Text color="red.500" fontSize="sm" mt="1">
              {errors.output_item_id}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.600" mb="1">
            Cantidad{selectedOutputItem ? ` (${selectedOutputItem.unit})` : ''}
          </Text>
          <InputField
            placeholder="Cantidad"
            name="output_quantity"
            type="number"
            step="0.01"
            min="0"
            value={form.output_quantity}
            onChange={handleChange}
            borderColor={errors.output_quantity ? 'red.300' : undefined}
          />
          {errors.output_quantity && (
            <Text color="red.500" fontSize="sm" mt="1">
              {errors.output_quantity}
            </Text>
          )}
        </Box>
      </Grid>
    </Box>
  );
};
