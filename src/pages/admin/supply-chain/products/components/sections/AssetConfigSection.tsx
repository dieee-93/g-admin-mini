/**
 * ASSET CONFIG SECTION
 *
 * Configuración completa de activos para productos de alquiler.
 * Visible para: rental SOLO (si capability 'assets' activa)
 *
 * Secciones:
 * 1. Asset ID (requerido)
 * 2. Depreciation Config (3 métodos)
 * 3. Security Deposit Config
 * 4. Inspection Config (digital inspections)
 * 5. Insurance Config
 * 6. Maintenance Config
 * 7. Availability Config (reemplaza Booking para rental)
 * 8. GPS Config
 * 9. Usage Restrictions
 * 10. Accessories
 * 11. Checklist Templates
 *
 * @design PRODUCTS_FORM_ASSET_CONFIG.md
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
  IconButton,
  Checkbox,
  Text,
  NumberField
} from '@/shared/ui';
import type {
  FormSectionProps,
  AssetConfigFields,
  DepreciationConfig,
  SecurityDepositConfig,
  InspectionConfig,
  InsuranceConfig,
  MaintenanceConfig,
  AvailabilityConfig,
  GPSConfig,
  UsageRestrictions,
  Accessory
} from '../../types/productForm';

interface AssetConfigSectionProps extends Omit<FormSectionProps, 'data' | 'onChange'> {
  data: AssetConfigFields;
  onChange: (data: AssetConfigFields) => void;
}

// Depreciation methods
const DEPRECIATION_METHODS = createListCollection({
  items: [
    { label: 'Línea recta', value: 'straight_line' },
    { label: 'Saldo decreciente', value: 'declining_balance' },
    { label: 'Unidades de producción', value: 'units_of_production' }
  ]
});

// Security deposit methods
const SECURITY_DEPOSIT_METHODS = createListCollection({
  items: [
    { label: 'Monto fijo', value: 'fixed' },
    { label: 'Porcentaje del precio', value: 'percentage_of_price' },
    { label: 'Por niveles según duración', value: 'tiered_by_duration' }
  ]
});

// Refund policies
const REFUND_POLICIES = createListCollection({
  items: [
    { label: 'Reembolso completo', value: 'full' },
    { label: 'Reembolso parcial', value: 'partial' },
    { label: 'Condicional', value: 'conditional' }
  ]
});

// Inspection types
const INSPECTION_TYPES = [
  { id: 'pre_rental', label: 'Pre-alquiler' },
  { id: 'post_rental', label: 'Post-alquiler' },
  { id: 'periodic', label: 'Periódica' },
  { id: 'damage_assessment', label: 'Evaluación de daños' }
] as const;

// Maintenance interval types
const MAINTENANCE_INTERVAL_TYPES = createListCollection({
  items: [
    { label: 'Basado en tiempo', value: 'time_based' },
    { label: 'Basado en uso', value: 'usage_based' },
    { label: 'Híbrido', value: 'hybrid' }
  ]
});

export function AssetConfigSection({
  data,
  onChange,
  errors = [],
  readOnly = false
}: AssetConfigSectionProps) {
  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>(['basic']);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Handle field changes
  const handleChange = <K extends keyof AssetConfigFields>(
    field: K,
    value: AssetConfigFields[K]
  ) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Get field error
  const getFieldError = (fieldName: string) => {
    return errors.find(e =>
      e.field === `asset_config.${fieldName}` || e.field === fieldName
    );
  };

  // Convert minutes to days for display
  const minutesToDays = (minutes?: number): string => {
    if (!minutes) return '';
    return (minutes / (60 * 24)).toFixed(0);
  };

  // Convert days to minutes for storage
  const daysToMinutes = (days: string): number | undefined => {
    const num = parseFloat(days);
    if (isNaN(num)) return undefined;
    return Math.round(num * 60 * 24);
  };

  return (
    <Stack gap={4}>
      <Alert status="info" size="sm">
        <Alert.Title>Configuración de Activo para Alquiler</Alert.Title>
        <Alert.Description>
          Esta sección gestiona toda la información del activo: depreciación, inspecciones,
          mantenimiento, GPS y restricciones de uso.
        </Alert.Description>
      </Alert>

      {/* ============================================ */}
      {/* 1. ASSET ID (Required) */}
      {/* ============================================ */}
      <InputField
        label="ID del Activo"
        required
        error={getFieldError('asset_id')?.message}
        placeholder="ej: BIKE-001, CAR-A23"
        value={data.asset_id || ''}
        onChange={(e) => handleChange('asset_id', e.target.value)}
        disabled={readOnly}
        helperText="Identificador único del activo físico"
      />

      {/* ============================================ */}
      {/* 2. DEPRECIATION CONFIG */}
      {/* ============================================ */}
      <CollapsibleRoot
        open={openSections.includes('depreciation')}
        onOpenChange={() => toggleSection('depreciation')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" width="full">
            {openSections.includes('depreciation') ? '▼' : '►'} Configuración de Depreciación
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap={4} mt={4}>
            <SelectField
              label="Método de depreciación"
              placeholder="Selecciona método"
              collection={DEPRECIATION_METHODS}
              value={data.depreciation_config?.method ? [data.depreciation_config.method] : []}
              onValueChange={(details) => {
                const selected = details.value[0] as DepreciationConfig['method'];
                handleChange('depreciation_config', {
                  ...(data.depreciation_config || {
                    method: selected,
                    acquisition_cost: 0,
                    salvage_value: 0
                  }),
                  method: selected
                });
              }}
              disabled={readOnly}
              helperText="Método para calcular la depreciación del activo"
            />

            {data.depreciation_config && (
              <>
                <HStack gap={4}>
                  <NumberField
                    label="Costo de adquisición ($)"
                    required
                    min={0}
                    step={0.01}
                    placeholder="10000.00"
                    value={data.depreciation_config.acquisition_cost || 0}
                    onChange={(val) => {
                      handleChange('depreciation_config', {
                        ...data.depreciation_config!,
                        acquisition_cost: val
                      });
                    }}
                    disabled={readOnly}
                  />

                  <NumberField
                    label="Valor de rescate ($)"
                    required
                    min={0}
                    step={0.01}
                    placeholder="2000.00"
                    value={data.depreciation_config.salvage_value || 0}
                    onChange={(val) => {
                      handleChange('depreciation_config', {
                        ...data.depreciation_config!,
                        salvage_value: val
                      });
                    }}
                    disabled={readOnly}
                  />
                </HStack>

                {/* Campos específicos según método */}
                {data.depreciation_config.method === 'straight_line' && (
                  <NumberField
                    label="Vida útil (meses)"
                    required
                    min={1}
                    placeholder="60"
                    value={data.depreciation_config.useful_life_months || 0}
                    onChange={(val) => {
                      handleChange('depreciation_config', {
                        ...data.depreciation_config!,
                        useful_life_months: val
                      });
                    }}
                    disabled={readOnly}
                    helperText="Meses de vida útil estimada del activo"
                  />
                )}

                {data.depreciation_config.method === 'declining_balance' && (
                  <NumberField
                    label="Tasa de depreciación (%)"
                    required
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="20"
                    value={data.depreciation_config.depreciation_rate || 0}
                    onChange={(val) => {
                      handleChange('depreciation_config', {
                        ...data.depreciation_config!,
                        depreciation_rate: val
                      });
                    }}
                    disabled={readOnly}
                    helperText="Porcentaje de depreciación anual (ej: 20% doble saldo decreciente)"
                  />
                )}

                {data.depreciation_config.method === 'units_of_production' && (
                  <NumberField
                    label="Total de unidades"
                    required
                    min={1}
                    placeholder="10000"
                    value={data.depreciation_config.total_units || 0}
                    onChange={(val) => {
                      handleChange('depreciation_config', {
                        ...data.depreciation_config!,
                        total_units: val
                      });
                    }}
                    disabled={readOnly}
                    helperText="Unidades totales de producción estimadas (ej: kilómetros, horas de uso)"
                  />
                )}
              </>
            )}
          </Stack>
        </CollapsibleContent>
      </CollapsibleRoot>

      {/* ============================================ */}
      {/* 3. SECURITY DEPOSIT CONFIG */}
      {/* ============================================ */}
      <CollapsibleRoot
        open={openSections.includes('security_deposit')}
        onOpenChange={() => toggleSection('security_deposit')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" width="full">
            {openSections.includes('security_deposit') ? '▼' : '►'} Depósito de Seguridad
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap={4} mt={4}>
            <SelectField
              label="Método de cálculo"
              placeholder="Selecciona método"
              collection={SECURITY_DEPOSIT_METHODS}
              value={data.security_deposit_config?.calculation_method ? [data.security_deposit_config.calculation_method] : []}
              onValueChange={(details) => {
                const selected = details.value[0] as SecurityDepositConfig['calculation_method'];
                handleChange('security_deposit_config', {
                  ...(data.security_deposit_config || {
                    calculation_method: selected,
                    refund_policy: 'full'
                  }),
                  calculation_method: selected
                });
              }}
              disabled={readOnly}
            />

            {data.security_deposit_config?.calculation_method === 'fixed' && (
              <NumberField
                label="Monto fijo ($)"
                required
                min={0}
                step={0.01}
                placeholder="200.00"
                value={data.security_deposit_config.fixed_amount || 0}
                onChange={(val) => {
                  handleChange('security_deposit_config', {
                    ...data.security_deposit_config!,
                    fixed_amount: val
                  });
                }}
                disabled={readOnly}
              />
            )}

            {data.security_deposit_config?.calculation_method === 'percentage_of_price' && (
              <NumberField
                label="Porcentaje del precio (%)"
                required
                min={0}
                max={100}
                step={1}
                placeholder="20"
                value={data.security_deposit_config.percentage || 0}
                onChange={(val) => {
                  handleChange('security_deposit_config', {
                    ...data.security_deposit_config!,
                    percentage: val
                  });
                }}
                disabled={readOnly}
                helperText="Porcentaje del precio de alquiler"
              />
            )}

            {data.security_deposit_config?.calculation_method === 'tiered_by_duration' && (
              <Alert status="info" size="sm">
                <Alert.Description>
                  La configuración por niveles se gestionará en el módulo de Rentals después de crear el producto.
                </Alert.Description>
              </Alert>
            )}

            {data.security_deposit_config && (
              <SelectField
                label="Política de reembolso"
                required
                placeholder="Selecciona política"
                collection={REFUND_POLICIES}
                value={[data.security_deposit_config.refund_policy]}
                onValueChange={(details) => {
                  const selected = details.value[0] as SecurityDepositConfig['refund_policy'];
                  handleChange('security_deposit_config', {
                    ...data.security_deposit_config!,
                    refund_policy: selected
                  });
                }}
                disabled={readOnly}
              />
            )}
          </Stack>
        </CollapsibleContent>
      </CollapsibleRoot>

      {/* ============================================ */}
      {/* 4. INSPECTION CONFIG */}
      {/* ============================================ */}
      <CollapsibleRoot
        open={openSections.includes('inspection')}
        onOpenChange={() => toggleSection('inspection')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" width="full">
            {openSections.includes('inspection') ? '▼' : '►'} Inspecciones Digitales
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap={4} mt={4}>
            <Text fontSize="sm" color="gray.600">
              Selecciona los tipos de inspección requeridos:
            </Text>

            {INSPECTION_TYPES.map((type) => (
              <Checkbox
                key={type.id}
                checked={data.inspection_config?.types.includes(type.id as any) || false}
                onCheckedChange={(e) => {
                  const currentTypes = data.inspection_config?.types || [];
                  const newTypes = e.checked
                    ? [...currentTypes, type.id as any]
                    : currentTypes.filter(t => t !== type.id);

                  handleChange('inspection_config', {
                    ...(data.inspection_config || {
                      types: [],
                      photo_comparison_enabled: false
                    }),
                    types: newTypes
                  });
                }}
                disabled={readOnly}
              >
                {type.label}
              </Checkbox>
            ))}

            {data.inspection_config && data.inspection_config.types.length > 0 && (
              <>
                <Stack gap={2}>
                  <Switch
                    checked={data.inspection_config.photo_comparison_enabled || false}
                    onCheckedChange={(e) => {
                      handleChange('inspection_config', {
                        ...data.inspection_config!,
                        photo_comparison_enabled: e.checked
                      });
                    }}
                    disabled={readOnly}
                  >
                    Habilitar comparación de fotos
                  </Switch>
                  <Text fontSize="sm" color="gray.600">
                    Comparar fotos antes y después del alquiler automáticamente
                  </Text>
                </Stack>

                <TextareaField
                  label="Fotos requeridas (opcional)"
                  placeholder="Una por línea (ej: frontal, trasera, interior)"
                  rows={3}
                  value={data.inspection_config.required_photos?.join('\n') || ''}
                  onChange={(e) => {
                    const photos = e.target.value
                      .split('\n')
                      .map(p => p.trim())
                      .filter(p => p.length > 0);
                    handleChange('inspection_config', {
                      ...data.inspection_config!,
                      required_photos: photos.length > 0 ? photos : undefined
                    });
                  }}
                  disabled={readOnly}
                />

                <TextareaField
                  label="Checklist de inspección (opcional)"
                  placeholder="Una por línea (ej: verificar frenos, revisar llantas)"
                  rows={4}
                  value={data.inspection_config.inspection_checklist?.join('\n') || ''}
                  onChange={(e) => {
                    const items = e.target.value
                      .split('\n')
                      .map(i => i.trim())
                      .filter(i => i.length > 0);
                    handleChange('inspection_config', {
                      ...data.inspection_config!,
                      inspection_checklist: items.length > 0 ? items : undefined
                    });
                  }}
                  disabled={readOnly}
                />
              </>
            )}
          </Stack>
        </CollapsibleContent>
      </CollapsibleRoot>

      {/* ============================================ */}
      {/* 5. INSURANCE CONFIG */}
      {/* ============================================ */}
      <CollapsibleRoot
        open={openSections.includes('insurance')}
        onOpenChange={() => toggleSection('insurance')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" width="full">
            {openSections.includes('insurance') ? '▼' : '►'} Seguro
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap={4} mt={4}>
            <Stack gap={2}>
              <Switch
                checked={data.insurance_config?.required || false}
                onCheckedChange={(e) => {
                  handleChange('insurance_config', {
                    ...(data.insurance_config || {
                      required: false
                    }),
                    required: e.checked
                  });
                }}
                disabled={readOnly}
              >
                Seguro requerido
              </Switch>
              <Text fontSize="sm" color="gray.600">
                Marcar si el activo requiere seguro obligatorio
              </Text>
            </Stack>

            {data.insurance_config?.required && (
              <>
                <InputField
                  label="Proveedor"
                  placeholder="Nombre de la compañía de seguros"
                  value={data.insurance_config.provider || ''}
                  onChange={(e) => {
                    handleChange('insurance_config', {
                      ...data.insurance_config!,
                      provider: e.target.value
                    });
                  }}
                  disabled={readOnly}
                />

                <InputField
                  label="Número de póliza"
                  placeholder="ej: POL-123456"
                  value={data.insurance_config.policy_number || ''}
                  onChange={(e) => {
                    handleChange('insurance_config', {
                      ...data.insurance_config!,
                      policy_number: e.target.value
                    });
                  }}
                  disabled={readOnly}
                />

                <HStack gap={4}>
                  <NumberField
                    label="Cobertura ($)"
                    min={0}
                    step={0.01}
                    placeholder="50000.00"
                    value={data.insurance_config.coverage_amount || 0}
                    onChange={(val) => {
                      handleChange('insurance_config', {
                        ...data.insurance_config!,
                        coverage_amount: val
                      });
                    }}
                    disabled={readOnly}
                  />

                  <NumberField
                    label="Deducible ($)"
                    min={0}
                    step={0.01}
                    placeholder="500.00"
                    value={data.insurance_config.deductible || 0}
                    onChange={(val) => {
                      handleChange('insurance_config', {
                        ...data.insurance_config!,
                        deductible: val
                      });
                    }}
                    disabled={readOnly}
                  />
                </HStack>
              </>
            )}
          </Stack>
        </CollapsibleContent>
      </CollapsibleRoot>

      {/* ============================================ */}
      {/* 6. MAINTENANCE CONFIG */}
      {/* ============================================ */}
      <CollapsibleRoot
        open={openSections.includes('maintenance')}
        onOpenChange={() => toggleSection('maintenance')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" width="full">
            {openSections.includes('maintenance') ? '▼' : '►'} Mantenimiento
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap={4} mt={4}>
            <SelectField
              label="Tipo de intervalo"
              placeholder="Selecciona tipo"
              collection={MAINTENANCE_INTERVAL_TYPES}
              value={data.maintenance_config?.interval_type ? [data.maintenance_config.interval_type] : []}
              onValueChange={(details) => {
                const selected = details.value[0] as MaintenanceConfig['interval_type'];
                handleChange('maintenance_config', {
                  ...(data.maintenance_config || {
                    interval_type: selected
                  }),
                  interval_type: selected
                });
              }}
              disabled={readOnly}
              helperText="Cómo se programa el mantenimiento del activo"
            />

            {data.maintenance_config && (
              <>
                {(data.maintenance_config.interval_type === 'time_based' ||
                  data.maintenance_config.interval_type === 'hybrid') && (
                  <NumberField
                    label="Intervalo (días)"
                    min={1}
                    placeholder="90"
                    value={data.maintenance_config.interval_days || 0}
                    onChange={(val) => {
                      handleChange('maintenance_config', {
                        ...data.maintenance_config!,
                        interval_days: val
                      });
                    }}
                    disabled={readOnly}
                    helperText="Cada cuántos días se requiere mantenimiento"
                  />
                )}

                {(data.maintenance_config.interval_type === 'usage_based' ||
                  data.maintenance_config.interval_type === 'hybrid') && (
                  <NumberField
                    label="Intervalo (unidades de uso)"
                    min={1}
                    placeholder="100"
                    value={data.maintenance_config.interval_units || 0}
                    onChange={(val) => {
                      handleChange('maintenance_config', {
                        ...data.maintenance_config!,
                        interval_units: val
                      });
                    }}
                    disabled={readOnly}
                    helperText="Cada cuántos usos se requiere mantenimiento"
                  />
                )}
              </>
            )}
          </Stack>
        </CollapsibleContent>
      </CollapsibleRoot>

      {/* ============================================ */}
      {/* 7. AVAILABILITY CONFIG (reemplaza Booking) */}
      {/* ============================================ */}
      <CollapsibleRoot
        open={openSections.includes('availability')}
        onOpenChange={() => toggleSection('availability')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" width="full">
            {openSections.includes('availability') ? '▼' : '►'} Disponibilidad
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap={4} mt={4}>
            <Alert status="warning" size="sm">
              <Alert.Description>
                ⚠️ Para rentals, usa esta sección en lugar de Booking Section
              </Alert.Description>
            </Alert>

            <HStack gap={4}>
              <NumberField
                label="Duración mínima (días)"
                required
                min={1}
                placeholder="1"
                value={minutesToDays(data.availability_config?.min_rental_duration_minutes) || 0}
                onChange={(val) => {
                  const minutes = val * 1440;
                  handleChange('availability_config', {
                    ...(data.availability_config || {
                      min_rental_duration_minutes: 0
                    }),
                    min_rental_duration_minutes: minutes
                  });
                }}
                disabled={readOnly}
                helperText="Mínimo días de alquiler"
              />

              <NumberField
                label="Duración máxima (días)"
                min={1}
                placeholder="30"
                value={minutesToDays(data.availability_config?.max_rental_duration_minutes) || 0}
                onChange={(val) => {
                  const minutes = val * 1440;
                  handleChange('availability_config', {
                    ...(data.availability_config || {
                      min_rental_duration_minutes: 1440
                    }),
                    max_rental_duration_minutes: minutes
                  });
                }}
                disabled={readOnly}
                helperText="Máximo días de alquiler"
              />
            </HStack>

            <NumberField
              label="Tiempo de espera (horas)"
              min={0}
              step={0.5}
              placeholder="2"
              value={data.availability_config?.buffer_time_minutes ? data.availability_config.buffer_time_minutes / 60 : 0}
              onChange={(val) => {
                handleChange('availability_config', {
                  ...(data.availability_config || {
                    min_rental_duration_minutes: 1440
                  }),
                  buffer_time_minutes: Math.round(val * 60)
                });
              }}
              disabled={readOnly}
              helperText="Tiempo entre alquileres para limpieza/mantenimiento"
            />
          </Stack>
        </CollapsibleContent>
      </CollapsibleRoot>

      {/* ============================================ */}
      {/* 8. GPS CONFIG */}
      {/* ============================================ */}
      <CollapsibleRoot
        open={openSections.includes('gps')}
        onOpenChange={() => toggleSection('gps')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" width="full">
            {openSections.includes('gps') ? '▼' : '►'} GPS Tracking
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap={4} mt={4}>
            <Switch
              checked={data.gps_config?.tracking_enabled || false}
              onCheckedChange={(e) => {
                handleChange('gps_config', {
                  ...(data.gps_config || {
                    tracking_enabled: false,
                    geofencing_enabled: false
                  }),
                  tracking_enabled: e.checked
                });
              }}
              disabled={readOnly}
            >
              Rastreo GPS habilitado
            </Switch>

            {data.gps_config?.tracking_enabled && (
              <>
                <NumberField
                  label="Intervalo de rastreo (minutos)"
                  min={1}
                  placeholder="5"
                  value={data.gps_config.tracking_interval_minutes || 0}
                  onChange={(val) => {
                    handleChange('gps_config', {
                      ...data.gps_config!,
                      tracking_interval_minutes: val
                    });
                  }}
                  disabled={readOnly}
                  helperText="Cada cuántos minutos se actualiza la ubicación"
                />

                <Stack gap={2}>
                  <Switch
                    checked={data.gps_config.geofencing_enabled || false}
                    onCheckedChange={(e) => {
                      handleChange('gps_config', {
                        ...data.gps_config!,
                        geofencing_enabled: e.checked
                      });
                    }}
                    disabled={readOnly}
                  >
                    Geofencing habilitado
                  </Switch>
                  <Text fontSize="sm" color="gray.600">
                    Alertas cuando el activo sale de zonas permitidas
                  </Text>
                </Stack>

                {data.gps_config.geofencing_enabled && (
                  <Alert status="info" size="sm">
                    <Alert.Description>
                      Las geo-cercas se configurarán en el módulo de Assets después de crear el producto.
                    </Alert.Description>
                  </Alert>
                )}
              </>
            )}
          </Stack>
        </CollapsibleContent>
      </CollapsibleRoot>

      {/* ============================================ */}
      {/* 9. USAGE RESTRICTIONS */}
      {/* ============================================ */}
      <CollapsibleRoot
        open={openSections.includes('restrictions')}
        onOpenChange={() => toggleSection('restrictions')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" width="full">
            {openSections.includes('restrictions') ? '▼' : '►'} Restricciones de Uso
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap={4} mt={4}>
            <HStack gap={4}>
              <NumberField
                label="Distancia máxima (km)"
                min={0}
                placeholder="500"
                value={data.usage_restrictions?.max_distance_km || 0}
                onChange={(val) => {
                  handleChange('usage_restrictions', {
                    ...(data.usage_restrictions || {}),
                    max_distance_km: val
                  });
                }}
                disabled={readOnly}
              />

              <NumberField
                label="Horas máx/día"
                min={0}
                placeholder="8"
                value={data.usage_restrictions?.max_hours_per_day || 0}
                onChange={(val) => {
                  handleChange('usage_restrictions', {
                    ...(data.usage_restrictions || {}),
                    max_hours_per_day: val
                  });
                }}
                disabled={readOnly}
              />
            </HStack>

            <TextareaField
              label="Requisitos del operador"
              placeholder="Una por línea (ej: Licencia tipo B, Mínimo 25 años)"
              rows={3}
              value={data.usage_restrictions?.operator_requirements?.join('\n') || ''}
              onChange={(e) => {
                const reqs = e.target.value
                  .split('\n')
                  .map(r => r.trim())
                  .filter(r => r.length > 0);
                handleChange('usage_restrictions', {
                  ...(data.usage_restrictions || {}),
                  operator_requirements: reqs.length > 0 ? reqs : undefined
                });
              }}
              disabled={readOnly}
            />

            <TextareaField
              label="Actividades prohibidas"
              placeholder="Una por línea (ej: Carreras, Uso comercial)"
              rows={3}
              value={data.usage_restrictions?.prohibited_activities?.join('\n') || ''}
              onChange={(e) => {
                const acts = e.target.value
                  .split('\n')
                  .map(a => a.trim())
                  .filter(a => a.length > 0);
                handleChange('usage_restrictions', {
                  ...(data.usage_restrictions || {}),
                  prohibited_activities: acts.length > 0 ? acts : undefined
                });
              }}
              disabled={readOnly}
            />
          </Stack>
        </CollapsibleContent>
      </CollapsibleRoot>

      {/* ============================================ */}
      {/* 10. ACCESSORIES (Simplified) */}
      {/* ============================================ */}
      <Alert status="info" size="sm">
        <Alert.Title>Accesorios y Checklists</Alert.Title>
        <Alert.Description>
          Los accesorios opcionales y checklists de inspección se gestionarán en el
          módulo de Assets después de crear el producto.
        </Alert.Description>
      </Alert>
    </Stack>
  );
}

/**
 * Helper: Validar depreciación
 */
export function validateDepreciation(config?: DepreciationConfig): string | null {
  if (!config) return null;

  if (config.acquisition_cost <= 0) {
    return 'El costo de adquisición debe ser mayor a 0';
  }

  if (config.salvage_value >= config.acquisition_cost) {
    return 'El valor de rescate debe ser menor al costo de adquisición';
  }

  return null;
}
