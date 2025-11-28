/**
 * RENTAL FIELDS GROUP
 * Additional fields injected into Asset form
 * Example of form extension pattern
 */

import { Stack, Input, Checkbox, Text } from '@/shared/ui';
import { Field } from '@chakra-ui/react';

interface RentalFieldsGroupProps {
  register?: any; // From react-hook-form
  asset?: any;
}

export function RentalFieldsGroup({ register }: RentalFieldsGroupProps) {
  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: 'var(--purple-50)',
        borderRadius: '0.375rem',
      }}
    >
      <Text weight="bold" style={{ marginBottom: '0.75rem' }}>
        Configuración de Alquiler
      </Text>

      <Stack gap={3}>
        <Checkbox {...register?.('rental_requires_deposit')}>
          Requiere depósito de seguridad
        </Checkbox>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Field label="Monto del Depósito">
            <Input
              type="number"
              step="0.01"
              {...register?.('rental_deposit_amount')}
              placeholder="0.00"
            />
          </Field>

          <Field label="Días Mínimos de Alquiler">
            <Input type="number" {...register?.('rental_min_days')} defaultValue={1} />
          </Field>
        </div>

        <Field label="Términos de Alquiler">
          <Input
            {...register?.('rental_terms')}
            placeholder="Términos o condiciones especiales..."
          />
        </Field>
      </Stack>
    </div>
  );
}
