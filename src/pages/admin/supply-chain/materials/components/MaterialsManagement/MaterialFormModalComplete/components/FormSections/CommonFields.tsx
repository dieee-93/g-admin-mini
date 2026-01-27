// ✅ PERFORMANCE: React.memo (Phase 2 Round 2)
import { memo } from 'react';
import { Box, Stack, Text } from '@/shared/ui';
import type { ItemType, ItemFormData } from '@/pages/admin/supply-chain/materials/types'; 
import { TypeSelector } from '../TypeSelector';
import { InputField } from '@/shared/ui';

interface CommonFieldsProps {
  formData: ItemFormData;
  updateFormField: (updates: Partial<ItemFormData>) => void;
  fieldErrors: Record<string, string>;
  isSubmitting?: boolean;
  editingItem?: boolean;
}

export const CommonFields = memo<CommonFieldsProps>(function CommonFields({
  formData,
  updateFormField,
  fieldErrors,
  isSubmitting = false,
  editingItem = false
}) {
  return (
    <Stack gap="6">
      <Box>
        <Box role="group">
          <Text as="label" fontWeight="medium" mb="2" display="block">
            Nombre del Material
          </Text>
          <InputField
            placeholder="Ej: Harina 000, Leche, Azúcar"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              updateFormField({ name: e.target.value })
            }
            disabled={isSubmitting}
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name && (
            <Text color="red.500" fontSize="sm" mt="2">
              {fieldErrors.name}
            </Text>
          )}
        </Box>
      </Box>

      <TypeSelector
        value={formData.type}
        onChange={(type: ItemType) => updateFormField({ type })}
        errors={fieldErrors}
        disabled={isSubmitting || editingItem}
      />
    </Stack>
  );
});

CommonFields.displayName = 'CommonFields';;
