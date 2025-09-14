import { Box, Stack, Text } from '@chakra-ui/react';
import { SelectField } from '@/shared/ui';
import { type ItemFormData, type MeasurableUnit } from '../../../types';
import { CATEGORY_COLLECTION, MEASURABLE_UNITS_COLLECTION } from '../constants';
import { MeasurableStockFields } from './MeasurableFields/MeasurableStockFields';

interface MeasurableFieldsProps {
  formData: ItemFormData;
  updateFormData: (updates: Partial<ItemFormData>) => void;
  fieldErrors: Record<string, string>;
  disabled?: boolean;
  addToStockNow: boolean;
  setAddToStockNow: (value: boolean) => void;
}

export const MeasurableFields = ({ 
  formData, 
  updateFormData, 
  fieldErrors,
  disabled = false,
  addToStockNow,
  setAddToStockNow
}: MeasurableFieldsProps) => {
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
            updateFormData({ 
              category: details.value[0]
            })
          }
          disabled={disabled}
          error={fieldErrors.category}
          required
          height="44px"
          noPortal={true}
        />
      </Box>

      {/* Measurement Unit */}
      <Box w="full">
        <SelectField
          label="Unidad de Medición"
          placeholder="Selecciona la unidad de medición"
          collection={MEASURABLE_UNITS_COLLECTION}
          value={formData.unit ? [formData.unit] : []}
          onValueChange={(details) => 
            updateFormData({ unit: details.value[0] as MeasurableUnit })
          }
          disabled={disabled}
          error={fieldErrors.unit}
          required
          height="44px"
          noPortal={true}
        />
        <Text fontSize="xs" color="text.muted" mt="1">
          La unidad determina cómo se mide este producto (peso, volumen o longitud)
        </Text>
      </Box>

      {/* Stock Fields */}
      <MeasurableStockFields
        formData={formData}
        updateFormData={updateFormData}
        fieldErrors={fieldErrors}
        disabled={disabled}
        addToStockNow={addToStockNow}
        setAddToStockNow={setAddToStockNow}
      />
    </Stack>
  );
};
