import { Box, Stack, Text } from '@/shared/ui';
import { SelectField } from '@/shared/ui';
import { type ItemType } from '../../../../types';
import { ITEM_TYPE_COLLECTION } from '../constants';
import { memo } from 'react';

interface TypeSelectorProps {
  value: ItemType | '';
  onChange: (type: ItemType) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

// ⚡ PERFORMANCE: React.memo prevents re-renders when props don't change
export const TypeSelector = memo(function TypeSelector({ 
  value, 
  onChange, 
  errors,
  disabled = false
}: TypeSelectorProps) {
  return (
    <Box w="full">
      <SelectField
        label="Tipo de Item"
        placeholder="Selecciona el tipo de item"
        collection={ITEM_TYPE_COLLECTION}
        value={value ? [value] : []}
        onValueChange={(details) => onChange(details.value[0] as ItemType)}
        disabled={disabled}
        error={errors.type}
        required
        height="44px"
        noPortal={true}
        renderItem={(item) => (
          <Stack gap="1">
            <Text>{item.label}</Text>
            <Text fontSize="xs" color="text.muted">{item.description}</Text>
          </Stack>
        )}
      />
    </Box>
  );
});
