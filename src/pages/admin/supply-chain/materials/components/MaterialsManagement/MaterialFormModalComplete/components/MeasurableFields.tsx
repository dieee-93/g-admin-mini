import { Box } from '@/shared/ui';
import { SelectField } from '@/shared/ui';
import { type ItemFormData, type MeasurableUnit } from '@/pages/admin/supply-chain/materials/types';
import { MEASURABLE_UNITS_COLLECTION } from '../constants';
import { memo } from 'react';

interface MeasurableFieldsProps {
  formData: ItemFormData;
  updateFormData: (updates: Partial<ItemFormData>) => void;
  fieldErrors: Record<string, string>;
  disabled?: boolean;
}

// ⚡ PERFORMANCE: React.memo prevents re-renders when props don't change
export const MeasurableFields = memo(function MeasurableFields({
  formData,
  updateFormData,
  fieldErrors,
  disabled = false,
}: MeasurableFieldsProps) {
  return (
    <Box w="full">
      {/* Measurement Unit - Only config field */}
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
        data-testid="material-unit"
      />
    </Box>
  );
});
