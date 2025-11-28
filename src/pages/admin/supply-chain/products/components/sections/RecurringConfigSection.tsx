/**
 * RECURRING CONFIG SECTION
 *
 * Configuración de facturación recurrente para membresías.
 * Visible para: membership SOLO (si capability 'memberships' activa)
 *
 * Features:
 * - Selector de billing_cycle (weekly, monthly, quarterly, yearly)
 * - Trial period config (toggle + fields)
 * - Auto-renewal toggle + notice days
 * - Cancellation policy
 * - Access type selector (unlimited, credits_based, tier_based)
 * - Alert sobre California law compliance
 *
 * Legal compliance:
 * - California law requiere 7 días de aviso para auto-renewal
 * - Cancellation policy debe ser clara y accesible
 *
 * @design PRODUCTS_FORM_RECURRING_CONFIG.md
 */

import { Stack, Input, Switch, Alert, SelectField, createListCollection, HStack, Textarea } from '@/shared/ui';
import { Field } from '@chakra-ui/react';
import type { FormSectionProps, RecurringConfigFields } from '../../types/productForm';

interface RecurringConfigSectionProps extends Omit<FormSectionProps, 'data' | 'onChange'> {
  data: RecurringConfigFields;
  onChange: (data: RecurringConfigFields) => void;
}

// Billing cycles
const BILLING_CYCLES = createListCollection({
  items: [
    { label: 'Semanal', value: 'weekly' },
    { label: 'Mensual', value: 'monthly' },
    { label: 'Trimestral', value: 'quarterly' },
    { label: 'Anual', value: 'yearly' }
  ]
});

// Cancellation policies
const CANCELLATION_POLICIES = createListCollection({
  items: [
    { label: 'En cualquier momento', value: 'anytime' },
    { label: 'Al final del ciclo', value: 'end_of_cycle' },
    { label: 'Requiere aviso previo', value: 'notice_required' }
  ]
});

// Access types
const ACCESS_TYPES = createListCollection({
  items: [
    { label: 'Ilimitado', value: 'unlimited' },
    { label: 'Basado en créditos', value: 'credits_based' },
    { label: 'Por niveles', value: 'tier_based' }
  ]
});

export function RecurringConfigSection({
  data,
  onChange,
  errors = [],
  readOnly = false
}: RecurringConfigSectionProps) {
  // Handle field changes
  const handleChange = <K extends keyof RecurringConfigFields>(
    field: K,
    value: RecurringConfigFields[K]
  ) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Get field error
  const getFieldError = (fieldName: string) => {
    return errors.find(e =>
      e.field === `recurring_config.${fieldName}` || e.field === fieldName
    );
  };

  return (
    <Stack gap="4">
      {/* Billing Cycle */}
      <Field label="Ciclo de facturación" required>
        <SelectField
          placeholder="Selecciona ciclo"
          collection={BILLING_CYCLES}
          value={[data.billing_cycle]}
          onValueChange={(details) => {
            const selected = details.value[0] as RecurringConfigFields['billing_cycle'];
            handleChange('billing_cycle', selected);
          }}
          disabled={readOnly}
        />
        <Field.HelperText>
          Frecuencia con la que se cobrará la membresía
        </Field.HelperText>
      </Field>

      {/* Trial Period */}
      <Field>
        <Switch
          checked={data.trial_enabled || false}
          onCheckedChange={(e) => handleChange('trial_enabled', e.checked)}
          disabled={readOnly}
        >
          Ofrecer período de prueba
        </Switch>
        <Field.HelperText>
          Permitir que los clientes prueben la membresía antes de cobrar
        </Field.HelperText>
      </Field>

      {data.trial_enabled && (
        <>
          <HStack gap="4">
            <Field
              label="Duración de prueba (días)"
              required
              invalid={!!getFieldError('trial_duration_days')}
              errorText={getFieldError('trial_duration_days')?.message}
              flex="1"
            >
              <Input
                type="number"
                min="1"
                placeholder="7"
                value={data.trial_duration_days?.toString() || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : undefined;
                  handleChange('trial_duration_days', val);
                }}
                disabled={readOnly}
              />
              <Field.HelperText>
                Días de acceso gratuito o con descuento
              </Field.HelperText>
            </Field>

            <Field
              label="Precio durante prueba ($)"
              invalid={!!getFieldError('trial_price')}
              errorText={getFieldError('trial_price')?.message}
              flex="1"
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={data.trial_price?.toString() || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseFloat(e.target.value) : undefined;
                  handleChange('trial_price', val);
                }}
                disabled={readOnly}
              />
              <Field.HelperText>
                0.00 = prueba gratuita
              </Field.HelperText>
            </Field>
          </HStack>

          {data.trial_price === 0 && (
            <Alert status="success" size="sm">
              <Alert.Description>
                ✅ Prueba gratuita de {data.trial_duration_days} días
              </Alert.Description>
            </Alert>
          )}
        </>
      )}

      {/* Auto-renewal */}
      <Field>
        <Switch
          checked={data.auto_renewal}
          onCheckedChange={(e) => handleChange('auto_renewal', e.checked)}
          disabled={readOnly}
        >
          Renovación automática
        </Switch>
        <Field.HelperText>
          La membresía se renovará automáticamente al final de cada ciclo
        </Field.HelperText>
      </Field>

      {data.auto_renewal && (
        <>
          <Field
            label="Días de aviso previo"
            required
            invalid={!!getFieldError('auto_renewal_notice_days')}
            errorText={getFieldError('auto_renewal_notice_days')?.message}
          >
            <Input
              type="number"
              min="7"
              placeholder="7"
              value={data.auto_renewal_notice_days?.toString() || ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : undefined;
                handleChange('auto_renewal_notice_days', val);
              }}
              disabled={readOnly}
            />
            <Field.HelperText>
              Días antes de la renovación para notificar al cliente (mínimo 7)
            </Field.HelperText>
          </Field>

          {/* California Law Compliance */}
          <Alert status="warning" size="sm">
            <Alert.Title>Cumplimiento legal - California</Alert.Title>
            <Alert.Description>
              La ley de California requiere un mínimo de 7 días de aviso antes de la
              renovación automática. Asegúrate de enviar notificaciones oportunas.
            </Alert.Description>
          </Alert>
        </>
      )}

      {/* Cancellation Policy */}
      <Field label="Política de cancelación" required>
        <SelectField
          placeholder="Selecciona política"
          collection={CANCELLATION_POLICIES}
          value={data.cancellation_policy ? [data.cancellation_policy] : []}
          onValueChange={(details) => {
            const selected = details.value[0] as RecurringConfigFields['cancellation_policy'];
            handleChange('cancellation_policy', selected);
          }}
          disabled={readOnly}
        />
        <Field.HelperText>
          Cuándo puede el cliente cancelar su membresía
        </Field.HelperText>
      </Field>

      {data.cancellation_policy === 'notice_required' && (
        <Field
          label="Días de aviso para cancelación"
          required
          invalid={!!getFieldError('cancellation_notice_days')}
          errorText={getFieldError('cancellation_notice_days')?.message}
        >
          <Input
            type="number"
            min="1"
            placeholder="30"
            value={data.cancellation_notice_days?.toString() || ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : undefined;
              handleChange('cancellation_notice_days', val);
            }}
            disabled={readOnly}
          />
          <Field.HelperText>
            Días de anticipación requeridos para cancelar
          </Field.HelperText>
        </Field>
      )}

      {/* Access Type */}
      <Field label="Tipo de acceso" required>
        <SelectField
          placeholder="Selecciona tipo"
          collection={ACCESS_TYPES}
          value={[data.access_type]}
          onValueChange={(details) => {
            const selected = details.value[0] as RecurringConfigFields['access_type'];
            handleChange('access_type', selected);
          }}
          disabled={readOnly}
        />
        <Field.HelperText>
          Cómo se gestiona el acceso del miembro
        </Field.HelperText>
      </Field>

      {/* Credits-based config */}
      {data.access_type === 'credits_based' && (
        <Field
          label="Créditos mensuales"
          required
          invalid={!!getFieldError('monthly_credits')}
          errorText={getFieldError('monthly_credits')?.message}
        >
          <Input
            type="number"
            min="1"
            placeholder="10"
            value={data.monthly_credits?.toString() || ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : undefined;
              handleChange('monthly_credits', val);
            }}
            disabled={readOnly}
          />
          <Field.HelperText>
            Número de créditos que recibe el miembro cada mes
          </Field.HelperText>
        </Field>
      )}

      {/* Tier-based config */}
      {data.access_type === 'tier_based' && (
        <Field label="Beneficios del nivel">
          <Textarea
            placeholder="Lista de beneficios (uno por línea)&#10;ej:&#10;- Acceso a clases grupales&#10;- 2 sesiones personales&#10;- Descuento en productos"
            rows={5}
            value={data.tier_benefits?.join('\n') || ''}
            onChange={(e) => {
              const benefits = e.target.value
                .split('\n')
                .map(b => b.trim())
                .filter(b => b.length > 0);
              handleChange('tier_benefits', benefits);
            }}
            disabled={readOnly}
          />
          <Field.HelperText>
            Describe los beneficios incluidos en este nivel de membresía
          </Field.HelperText>
        </Field>
      )}

      {/* Billing day (opcional) */}
      {(data.billing_cycle === 'monthly' || data.billing_cycle === 'weekly') && (
        <Field label="Día de facturación">
          <Input
            type="number"
            min={data.billing_cycle === 'weekly' ? 1 : 1}
            max={data.billing_cycle === 'weekly' ? 7 : 31}
            placeholder={data.billing_cycle === 'weekly' ? '1-7 (1=Lunes)' : '1-31'}
            value={data.billing_day?.toString() || ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : undefined;
              handleChange('billing_day', val);
            }}
            disabled={readOnly}
          />
          <Field.HelperText>
            {data.billing_cycle === 'weekly'
              ? 'Día de la semana (1=Lunes, 7=Domingo)'
              : 'Día del mes para el cargo (1-31)'}
          </Field.HelperText>
        </Field>
      )}

      {/* Prorate first payment */}
      <Field>
        <Switch
          checked={data.prorate_first_payment || false}
          onCheckedChange={(e) => handleChange('prorate_first_payment', e.checked)}
          disabled={readOnly}
        >
          Prorratear primer pago
        </Switch>
        <Field.HelperText>
          Ajustar el primer cobro según los días restantes del ciclo
        </Field.HelperText>
      </Field>

      {/* Info final */}
      <Alert status="info" size="sm">
        <Alert.Title>Integración con módulo de Membresías</Alert.Title>
        <Alert.Description>
          Esta configuración se integrará con el módulo de Membresías para gestionar
          renovaciones automáticas, notificaciones y acceso de miembros.
        </Alert.Description>
      </Alert>
    </Stack>
  );
}

/**
 * Helper: Validar días de aviso (California law compliance)
 */
export function validateAutoRenewalNotice(noticeDays?: number): string | null {
  if (noticeDays && noticeDays < 7) {
    return 'La ley de California requiere un mínimo de 7 días de aviso';
  }
  return null;
}

/**
 * Helper: Validar billing day según cycle
 */
export function validateBillingDay(
  billingCycle: RecurringConfigFields['billing_cycle'],
  billingDay?: number
): string | null {
  if (!billingDay) return null;

  if (billingCycle === 'weekly' && (billingDay < 1 || billingDay > 7)) {
    return 'El día debe estar entre 1 (Lunes) y 7 (Domingo)';
  }

  if (billingCycle === 'monthly' && (billingDay < 1 || billingDay > 31)) {
    return 'El día debe estar entre 1 y 31';
  }

  return null;
}

