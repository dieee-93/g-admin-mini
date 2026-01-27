import { useState, useEffect, memo } from 'react';
import {
  Stack,
  Alert
} from '@/shared/ui';
import { Text } from '@/shared/ui';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { type ItemFormData } from '@/pages/admin/supply-chain/materials/types';

interface CountableFieldsProps {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

// ⚡ PERFORMANCE: React.memo prevents re-renders when props don't change
export const CountableFields = memo(function CountableFields({
  formData,
  setFormData,
  disabled = false,
}: CountableFieldsProps) {
  useEffect(() => {
    if (formData.type === 'COUNTABLE' && !formData.unit) {
      setFormData({ ...formData, unit: 'unidad' });
    }
  }, [formData.type, formData.unit]);

  return (
    <Stack gap="4" w="full">
      {/* Info sobre contables */}
      <Alert.Root status="info" variant="subtle">
        <Alert.Indicator>
          <InformationCircleIcon style={{ width: '16px', height: '16px' }} />
        </Alert.Indicator>
        <Alert.Description>
          <Text fontSize="sm">
            Items contables se miden en <strong>unidades individuales</strong>.
            La configuración de stock y packaging se realiza en la sección "Stock Inicial" si decides agregar stock ahora.
          </Text>
        </Alert.Description>
      </Alert.Root>
    </Stack>
  );
});
