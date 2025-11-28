/**
 * RENTAL TERMS SECTION
 *
 * Términos y políticas de alquiler para productos rental.
 * Visible para: rental SOLO (si capability 'assets' activa)
 *
 * Secciones:
 * 1. Late Return Policy (4 fee structures)
 * 2. Damage Policy (photo comparison, assessment, tiers)
 * 3. Insurance Options (opcional para MVP)
 * 4. Cancellation Policy (4 tipos)
 * 5. Maintenance & Cleaning
 * 6. Additional Terms
 *
 * @design PRODUCTS_FORM_RENTAL_TERMS_SECTION.md
 */

import { useState } from 'react';
import {
  Stack,
  InputField,
  Switch,
  Alert,
  SelectField,
  createListCollection,
  HStack,
  TextareaField,
  Collapsible,
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  Button,
  Text,
  NumberField
} from '@/shared/ui';
import type {
  FormSectionProps,
  RentalTermsFields,
  LateReturnPolicy,
  DamagePolicy,
  CancellationPolicy
} from '../../types/productForm';

interface RentalTermsSectionProps extends Omit<FormSectionProps, 'data' | 'onChange'> {
  data: RentalTermsFields;
  onChange: (data: RentalTermsFields) => void;
}

// Late return fee structures
const FEE_STRUCTURES = createListCollection({
  items: [
    { label: 'Tarifa plana', value: 'flat' },
    { label: 'Por hora', value: 'hourly' },
    { label: 'Por día', value: 'daily' },
    { label: 'Progresiva', value: 'progressive' }
  ]
});

// Damage charge types
const DAMAGE_CHARGE_TYPES = createListCollection({
  items: [
    { label: 'Cargo fijo', value: 'fixed' },
    { label: 'Costo de reparación', value: 'repair_cost' },
    { label: 'Costo de reemplazo', value: 'replacement_cost' }
  ]
});

// Cancellation policy types
const CANCELLATION_POLICY_TYPES = createListCollection({
  items: [
    { label: 'Por niveles', value: 'tiered' },
    { label: 'Tarifa fija', value: 'fixed' },
    { label: 'Flexible', value: 'flexible' },
    { label: 'Estricta', value: 'strict' }
  ]
});

// Fuel policies
const FUEL_POLICIES = createListCollection({
  items: [
    { label: 'Lleno a lleno', value: 'full_to_full' },
    { label: 'Pre-pagado', value: 'prepaid' },
    { label: 'Pago por uso', value: 'pay_per_use' }
  ]
});

export function RentalTermsSection({
  data,
  onChange,
  errors = [],
  readOnly = false
}: RentalTermsSectionProps) {
  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>(['late_return']);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Handle field changes
  const handleChange = <K extends keyof RentalTermsFields>(
    field: K,
    value: RentalTermsFields[K]
  ) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Get field error
  const getFieldError = (fieldName: string) => {
    return errors.find(e =>
      e.field === `rental_terms.${fieldName}` || e.field === fieldName
    );
  };

  // Convert minutes to hours
  const minutesToHours = (minutes?: number): string => {
    if (!minutes) return '';
    return (minutes / 60).toFixed(1);
  };

  // Convert hours to minutes
  const hoursToMinutes = (hours: string): number | undefined => {
    const num = parseFloat(hours);
    if (isNaN(num)) return undefined;
    return Math.round(num * 60);
  };

  return (
    <Stack gap="4">
      <Alert status="info" size="sm">
        <Alert.Title>Términos y Condiciones de Alquiler</Alert.Title>
        <Alert.Description>
          Define las políticas de devolución tardía, daños, cancelación y mantenimiento
          para este producto de alquiler.
        </Alert.Description>
      </Alert>

      {/* ============================================ */}
      {/* 1. LATE RETURN POLICY */}
      {/* ============================================ */}
      <CollapsibleRoot
        open={openSections.includes('late_return')}
        onOpenChange={() => toggleSection('late_return')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" width="full">
            {openSections.includes('late_return') ? '▼' : '►'} Política de Devolución Tardía
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap="4" mt={4}>
            <NumberField
              label="Período de gracia (horas)"
              required
              min={0}
              step={0.5}
              placeholder="0.5"
              value={minutesToHours(data.late_return_policy?.grace_period_minutes) || 0}
              onChange={(val) => {
                const minutes = val * 60;
                handleChange('late_return_policy', {
                  ...(data.late_return_policy || {
                    grace_period_minutes: 0,
                    fee_structure: 'flat'
                  }),
                  grace_period_minutes: minutes
                });
              }}
              disabled={readOnly}
              helperText="Tiempo de tolerancia antes de aplicar cargos por retraso"
            />

            <SelectField
              label="Estructura de tarifas"
              required
              placeholder="Selecciona estructura"
              collection={FEE_STRUCTURES}
              value={data.late_return_policy?.fee_structure ? [data.late_return_policy.fee_structure] : []}
              onValueChange={(details) => {
                const selected = details.value[0] as LateReturnPolicy['fee_structure'];
                handleChange('late_return_policy', {
                  ...(data.late_return_policy || {
                    grace_period_minutes: 30,
                    fee_structure: selected
                  }),
                  fee_structure: selected
                });
              }}
              disabled={readOnly}
            />

            {/* Flat fee */}
            {data.late_return_policy?.fee_structure === 'flat' && (
              <NumberField
                label="Tarifa plana ($)"
                required
                min={0}
                step={0.01}
                placeholder="50.00"
                value={data.late_return_policy.flat_fee || 0}
                onChange={(val) => {
                  handleChange('late_return_policy', {
                    ...data.late_return_policy!,
                    flat_fee: val
                  });
                }}
                disabled={readOnly}
                helperText="Cargo fijo por cualquier retraso"
              />
            )}

            {/* Hourly fee */}
            {data.late_return_policy?.fee_structure === 'hourly' && (
              <NumberField
                label="Tarifa por hora ($)"
                required
                min={0}
                step={0.01}
                placeholder="10.00"
                value={data.late_return_policy.hourly_fee || 0}
                onChange={(val) => {
                  handleChange('late_return_policy', {
                    ...data.late_return_policy!,
                    hourly_fee: val
                  });
                }}
                disabled={readOnly}
                helperText="Cargo por cada hora de retraso"
              />
            )}

            {/* Daily fee */}
            {data.late_return_policy?.fee_structure === 'daily' && (
              <NumberField
                label="Tarifa por día ($)"
                required
                min={0}
                step={0.01}
                placeholder="50.00"
                value={data.late_return_policy.daily_fee || 0}
                onChange={(val) => {
                  handleChange('late_return_policy', {
                    ...data.late_return_policy!,
                    daily_fee: val
                  });
                }}
                disabled={readOnly}
                helperText="Cargo por cada día completo de retraso"
              />
            )}

            {/* Progressive */}
            {data.late_return_policy?.fee_structure === 'progressive' && (
              <Alert status="info" size="sm">
                <Alert.Description>
                  Los niveles progresivos se configurarán en el módulo de Rentals después de crear el producto.
                </Alert.Description>
              </Alert>
            )}
          </Stack>
        </CollapsibleContent>
      </CollapsibleRoot>

      {/* ============================================ */}
      {/* 2. DAMAGE POLICY */}
      {/* ============================================ */}
      <CollapsibleRoot
        open={openSections.includes('damage')}
        onOpenChange={() => toggleSection('damage')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" width="full">
            {openSections.includes('damage') ? '▼' : '►'} Política de Daños
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap="4" mt={4}>
            <Stack gap="2">
              <Switch
                checked={data.damage_policy?.photo_comparison_required || false}
                onCheckedChange={(e) => {
                  handleChange('damage_policy', {
                    ...(data.damage_policy || {
                      photo_comparison_required: false,
                      damage_assessment_process: '',
                      liability_waiver_available: false
                    }),
                    photo_comparison_required: e.checked
                  });
                }}
                disabled={readOnly}
              >
                Comparación de fotos requerida
              </Switch>
              <Text color="fg.muted" fontSize="sm">
                Requiere fotos antes y después del alquiler para evaluación de daños
              </Text>
            </Stack>

            <Stack gap="2">
              <Switch
                checked={data.damage_policy?.liability_waiver_available || false}
                onCheckedChange={(e) => {
                  handleChange('damage_policy', {
                    ...(data.damage_policy || {
                      photo_comparison_required: false,
                      damage_assessment_process: '',
                      liability_waiver_available: false
                    }),
                    liability_waiver_available: e.checked
                  });
                }}
                disabled={readOnly}
              >
                Exención de responsabilidad disponible
              </Switch>
              <Text color="fg.muted" fontSize="sm">
                El cliente puede comprar una exención de responsabilidad por daños
              </Text>
            </Stack>

            <TextareaField
              label="Proceso de evaluación de daños"
              placeholder="Describe el proceso para evaluar y cobrar daños..."
              rows={4}
              value={data.damage_policy?.damage_assessment_process || ''}
              onChange={(e) => {
                handleChange('damage_policy', {
                  ...(data.damage_policy || {
                    photo_comparison_required: false,
                    damage_assessment_process: '',
                    liability_waiver_available: false
                  }),
                  damage_assessment_process: e.target.value
                });
              }}
              disabled={readOnly}
              helperText="Explica cómo se determinan y cobran los daños"
            />

            <Alert status="info" size="sm">
              <Alert.Description>
                Los niveles de daños (menor, moderado, mayor) se configurarán en el módulo de Rentals.
              </Alert.Description>
            </Alert>
          </Stack>
        </CollapsibleContent>
      </CollapsibleRoot>

      {/* ============================================ */}
      {/* 3. CANCELLATION POLICY */}
      {/* ============================================ */}
      <CollapsibleRoot
        open={openSections.includes('cancellation')}
        onOpenChange={() => toggleSection('cancellation')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" width="full">
            {openSections.includes('cancellation') ? '▼' : '►'} Política de Cancelación
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap="4" mt={4}>
            <SelectField
              label="Tipo de política"
              required
              placeholder="Selecciona tipo"
              collection={CANCELLATION_POLICY_TYPES}
              value={data.cancellation_policy?.policy_type ? [data.cancellation_policy.policy_type] : []}
              onValueChange={(details) => {
                const selected = details.value[0] as CancellationPolicy['policy_type'];
                handleChange('cancellation_policy', {
                  ...(data.cancellation_policy || {
                    policy_type: selected
                  }),
                  policy_type: selected
                });
              }}
              disabled={readOnly}
            />

            {/* Fixed fee */}
            {data.cancellation_policy?.policy_type === 'fixed' && (
              <NumberField
                label="Tarifa de cancelación ($)"
                required
                min={0}
                step={0.01}
                placeholder="25.00"
                value={data.cancellation_policy.fixed_fee || 0}
                onChange={(val) => {
                  handleChange('cancellation_policy', {
                    ...data.cancellation_policy!,
                    fixed_fee: val
                  });
                }}
                disabled={readOnly}
                helperText="Cargo fijo por cancelación en cualquier momento"
              />
            )}

            {/* Flexible */}
            {data.cancellation_policy?.policy_type === 'flexible' && (
              <NumberField
                label="Horas para reembolso completo"
                required
                min={0}
                placeholder="24"
                value={data.cancellation_policy.full_refund_hours || 0}
                onChange={(val) => {
                  handleChange('cancellation_policy', {
                    ...data.cancellation_policy!,
                    full_refund_hours: val
                  });
                }}
                disabled={readOnly}
                helperText="Horas antes del alquiler para obtener reembolso completo"
              />
            )}

            {/* Strict */}
            {data.cancellation_policy?.policy_type === 'strict' && (
              <HStack gap="4">
                <NumberField
                  label="Horas para reembolso completo"
                  required
                  flex="1"
                  min={0}
                  placeholder="48"
                  value={data.cancellation_policy.full_refund_hours || 0}
                  onChange={(val) => {
                    handleChange('cancellation_policy', {
                      ...data.cancellation_policy!,
                      full_refund_hours: val
                    });
                  }}
                  disabled={readOnly}
                />

                <NumberField
                  label="Horas sin reembolso"
                  required
                  flex="1"
                  min={0}
                  placeholder="24"
                  value={data.cancellation_policy.no_refund_hours || 0}
                  onChange={(val) => {
                    handleChange('cancellation_policy', {
                      ...data.cancellation_policy!,
                      no_refund_hours: val
                    });
                  }}
                  disabled={readOnly}
                />
              </HStack>
            )}

            {/* Tiered */}
            {data.cancellation_policy?.policy_type === 'tiered' && (
              <Alert status="info" size="sm">
                <Alert.Description>
                  Los niveles de cancelación se configurarán en el módulo de Rentals después de crear el producto.
                </Alert.Description>
              </Alert>
            )}
          </Stack>
        </CollapsibleContent>
      </CollapsibleRoot>

      {/* ============================================ */}
      {/* 4. MAINTENANCE & CLEANING */}
      {/* ============================================ */}
      <CollapsibleRoot
        open={openSections.includes('maintenance')}
        onOpenChange={() => toggleSection('maintenance')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" width="full">
            {openSections.includes('maintenance') ? '▼' : '►'} Mantenimiento y Limpieza
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap="4" mt={4}>
            <Stack gap="2">
              <Switch
                checked={data.maintenance_cleaning?.cleaning_required || false}
                onCheckedChange={(e) => {
                  handleChange('maintenance_cleaning', {
                    ...(data.maintenance_cleaning || {
                      cleaning_required: false
                    }),
                    cleaning_required: e.checked
                  });
                }}
                disabled={readOnly}
              >
                Limpieza requerida
              </Switch>
              <Text color="fg.muted" fontSize="sm">
                El activo debe ser limpiado entre alquileres
              </Text>
            </Stack>

            {data.maintenance_cleaning?.cleaning_required && (
              <NumberField
                label="Tarifa de limpieza ($)"
                min={0}
                step={0.01}
                placeholder="25.00"
                value={data.maintenance_cleaning.cleaning_fee || 0}
                onChange={(val) => {
                  handleChange('maintenance_cleaning', {
                    ...data.maintenance_cleaning!,
                    cleaning_fee: val
                  });
                }}
                disabled={readOnly}
                helperText="Cargo por limpieza (opcional si está incluido en el precio)"
              />
            )}

            <SelectField
              label="Política de combustible"
              placeholder="Selecciona política"
              collection={FUEL_POLICIES}
              value={data.maintenance_cleaning?.fuel_policy ? [data.maintenance_cleaning.fuel_policy] : []}
              onValueChange={(details) => {
                const selected = details.value[0] as 'full_to_full' | 'prepaid' | 'pay_per_use';
                handleChange('maintenance_cleaning', {
                  ...(data.maintenance_cleaning || {
                    cleaning_required: false
                  }),
                  fuel_policy: selected
                });
              }}
              disabled={readOnly}
              helperText="Para vehículos o equipos que usan combustible"
            />
          </Stack>
        </CollapsibleContent>
      </CollapsibleRoot>

      {/* ============================================ */}
      {/* 5. INSURANCE OPTIONS (Simplified) */}
      {/* ============================================ */}
      <Alert status="info" size="sm">
        <Alert.Title>Opciones de Seguro</Alert.Title>
        <Alert.Description>
          Las opciones de seguro adicionales se configurarán en el módulo de Rentals
          después de crear el producto.
        </Alert.Description>
      </Alert>

      {/* ============================================ */}
      {/* 6. ADDITIONAL TERMS */}
      {/* ============================================ */}
      <TextareaField
        label="Términos adicionales"
        placeholder="Escribe cualquier término o condición adicional específica para este alquiler..."
        rows={6}
        value={data.additional_terms || ''}
        onChange={(e) => handleChange('additional_terms', e.target.value)}
        disabled={readOnly}
        helperText="Términos personalizados que se mostrarán al cliente"
      />
    </Stack>
  );
}

/**
 * Helper: Validar late return policy
 */
export function validateLateReturnPolicy(policy?: LateReturnPolicy): string | null {
  if (!policy) return null;

  if (policy.grace_period_minutes < 0) {
    return 'El período de gracia no puede ser negativo';
  }

  switch (policy.fee_structure) {
    case 'flat':
      if (!policy.flat_fee || policy.flat_fee <= 0) {
        return 'Debes especificar una tarifa plana válida';
      }
      break;
    case 'hourly':
      if (!policy.hourly_fee || policy.hourly_fee <= 0) {
        return 'Debes especificar una tarifa por hora válida';
      }
      break;
    case 'daily':
      if (!policy.daily_fee || policy.daily_fee <= 0) {
        return 'Debes especificar una tarifa diaria válida';
      }
      break;
  }

  return null;
}

/**
 * Helper: Validar cancellation policy
 */
export function validateCancellationPolicy(policy?: CancellationPolicy): string | null {
  if (!policy) return null;

  if (policy.policy_type === 'strict') {
    if (
      policy.full_refund_hours !== undefined &&
      policy.no_refund_hours !== undefined &&
      policy.no_refund_hours >= policy.full_refund_hours
    ) {
      return 'Las horas sin reembolso deben ser menores a las horas de reembolso completo';
    }
  }

  return null;
}

