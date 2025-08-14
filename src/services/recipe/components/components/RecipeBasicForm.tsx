// RecipeBasicForm.tsx - Basic recipe information form
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Select,
  createListCollection,
  Grid
} from '@chakra-ui/react';
import { type InventoryItem } from '@/modules/materials/types';

interface RecipeBasicInfo {
  name: string;
  output_item_id: string;
  output_quantity: string;
  preparation_time: string;
  instructions: string;
}

interface FormErrors {
  name?: string;
  output_item_id?: string;
  output_quantity?: string;
}

interface RecipeBasicFormProps {
  form: RecipeBasicInfo;
  items: InventoryItem[];
  errors: FormErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onOutputSelectChange: (details: { value: string[] }) => void;
}

export function RecipeBasicForm({
  form,
  items,
  errors,
  onChange,
  onOutputSelectChange
}: RecipeBasicFormProps) {
  const elaboratedItemsCollection = createListCollection({
    items: items
      .filter(item => item.type === 'ELABORATED')
      .map(item => ({
        label: `${item.name} (${item.unit})`,
        value: item.id,
      })),
  });

  const selectedOutputItem = items.find(item => item.id === form.output_item_id);

  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>
        Información Básica
      </Text>
      <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={4}>
        <Box>
          <Text fontSize="sm" color="gray.600" mb={1}>Nombre de la receta</Text>
          <Input
            placeholder="Ej: Pan integral casero"
            name="name"
            value={form.name}
            onChange={onChange}
            borderColor={errors.name ? 'red.300' : undefined}
          />
          {errors.name && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.name}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.600" mb={1}>Producto que genera</Text>
          <Select.Root 
            collection={elaboratedItemsCollection}
            value={form.output_item_id ? [form.output_item_id] : []}
            onValueChange={onOutputSelectChange}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger borderColor={errors.output_item_id ? 'red.300' : undefined}>
                <Select.ValueText placeholder="Seleccionar producto" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {elaboratedItemsCollection.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
          {errors.output_item_id && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.output_item_id}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.600" mb={1}>
            Cantidad{selectedOutputItem ? ` (${selectedOutputItem.unit})` : ''}
          </Text>
          <Input
            placeholder="Cantidad"
            name="output_quantity"
            type="number"
            step="0.01"
            min="0"
            value={form.output_quantity}
            onChange={onChange}
            borderColor={errors.output_quantity ? 'red.300' : undefined}
          />
          {errors.output_quantity && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.output_quantity}
            </Text>
          )}
        </Box>
      </Grid>

      {/* Additional Information */}
      <VStack gap={4} mt={6}>
        <Text fontSize="sm" fontWeight="medium" color="gray.700" alignSelf="start">
          Información Adicional
        </Text>
        <Grid templateColumns={{ base: "1fr", md: "1fr 3fr" }} gap={4} w="full">
          <Box>
            <Text fontSize="sm" color="gray.600" mb={1}>Tiempo de preparación (min)</Text>
            <Input
              placeholder="Ej: 120"
              name="preparation_time"
              type="number"
              min="0"
              value={form.preparation_time}
              onChange={onChange}
            />
          </Box>
          
          <Box>
            <Text fontSize="sm" color="gray.600" mb={1}>Instrucciones</Text>
            <Textarea
              placeholder="Describe los pasos para preparar esta receta..."
              name="instructions"
              value={form.instructions}
              onChange={onChange}
              rows={3}
              resize="vertical"
            />
          </Box>
        </Grid>
      </VStack>
    </Box>
  );
}

export default RecipeBasicForm;