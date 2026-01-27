/**
 * PRODUCTION SECTION
 *
 * Configuración de producción para physical_product.
 * Visible para: physical_product SOLO (si capability 'production' activa)
 *
 * Features:
 * - Toggle principal "Este producto requiere producción"
 * - Tiempo de producción (production_time_minutes)
 * - Batch size y capacidad diaria
 * - Overhead calculator con 3 métodos
 * - Production mode selector
 * - KDS config (opcional)
 *
 * ✅ CORRECCIONES APLICADAS:
 * - #1: Usar schema unificado de overhead (OverheadConfig)
 * - #2: Usar production_time_minutes (NO prep_time)
 * - #3: NO referenciar is_async_sellable
 *
 * @design PRODUCTS_FORM_PRODUCTION_SECTION.md
 */

import { Stack, Switch, Text, HStack, SelectField, createListCollection, Alert, NumberField } from '@/shared/ui';
import { Field } from '@chakra-ui/react';
import type { FormSectionProps, ProductionFields, OverheadConfig } from '../../types/productForm';
import { DecimalUtils } from '@/lib/decimal';

interface ProductionSectionProps extends Omit<FormSectionProps, 'data' | 'onChange'> {
  data: ProductionFields;
  onChange: (data: ProductionFields) => void;
}

// Overhead methods
const OVERHEAD_METHODS = createListCollection({
  items: [
    { label: 'Sin overhead', value: 'none' },
    { label: 'Costo fijo por lote', value: 'fixed' },
    { label: 'Costo por unidad', value: 'per_unit' },
    { label: 'Costo por tiempo', value: 'time_based' }
  ]
});

// Production modes
const PRODUCTION_MODES = createListCollection({
  items: [
    { label: 'Cocina', value: 'kitchen' },
    { label: 'Ensamblado', value: 'assembly' },
    { label: 'Preparación', value: 'preparation' }
  ]
});

export function ProductionSection({
  data,
  onChange,
  errors = [],
  readOnly = false
}: ProductionSectionProps) {
  // Handle field changes
  const handleChange = <K extends keyof ProductionFields>(
    field: K,
    value: ProductionFields[K]
  ) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Handle overhead config changes
  const handleOverheadChange = <K extends keyof OverheadConfig>(
    field: K,
    value: OverheadConfig[K]
  ) => {
    const newOverheadConfig: OverheadConfig = {
      ...(data.overhead_config || { method: 'none' }),
      [field]: value
    };

    // Reset specific fields when method changes
    if (field === 'method') {
      switch (value) {
        case 'none':
          delete newOverheadConfig.fixed_overhead;
          delete newOverheadConfig.per_unit_overhead;
          delete newOverheadConfig.overhead_per_minute;
          break;
        case 'fixed':
          delete newOverheadConfig.per_unit_overhead;
          delete newOverheadConfig.overhead_per_minute;
          break;
        case 'per_unit':
          delete newOverheadConfig.fixed_overhead;
          delete newOverheadConfig.overhead_per_minute;
          break;
        case 'time_based':
          delete newOverheadConfig.fixed_overhead;
          delete newOverheadConfig.per_unit_overhead;
          break;
      }
    }

    handleChange('overhead_config', newOverheadConfig);
  };

  // Get field error
  const getFieldError = (fieldName: string) => {
    return errors.find(e =>
      e.field === `production.${fieldName}` || e.field === fieldName
    );
  };

  // Convert minutes to hours for display
  // ✅ PRECISION FIX: Use DecimalUtils for time conversion
  const minutesToHours = (minutes?: number): string => {
    if (!minutes) return '';
    const hoursDec = DecimalUtils.divide(
      minutes.toString(),
      '60',
      'recipe'
    );
    return hoursDec.toFixed(2);
  };

  // Convert hours to minutes for storage
  // ✅ PRECISION FIX: Use DecimalUtils for time conversion
  const hoursToMinutes = (hours: string): number | undefined => {
    const num = parseFloat(hours);
    if (isNaN(num)) return undefined;
    const minutesDec = DecimalUtils.multiply(
      num.toString(),
      '60',
      'recipe'
    );
    return Math.round(minutesDec.toNumber());
  };

  // Calculate overhead preview
  const calculateOverheadPreview = (): string | null => {
    if (!data.overhead_config || data.overhead_config.method === 'none') {
      return null;
    }

    const method = data.overhead_config.method;

    switch (method) {
      case 'fixed':
        if (data.overhead_config.fixed_overhead) {
          return `$${data.overhead_config.fixed_overhead.toFixed(2)} por lote`;
        }
        break;
      case 'per_unit':
        if (data.overhead_config.per_unit_overhead) {
          return `$${data.overhead_config.per_unit_overhead.toFixed(2)} por unidad`;
        }
        break;
      case 'time_based':
        if (data.overhead_config.overhead_per_minute && data.production_time_minutes) {
          // ✅ PRECISION FIX: Use DecimalUtils for overhead calculation
          const totalDec = DecimalUtils.multiply(
            data.overhead_config.overhead_per_minute.toString(),
            data.production_time_minutes.toString(),
            'recipe'
          );
          const total = totalDec.toNumber();
          return `$${total.toFixed(2)} (${data.production_time_minutes} min × $${data.overhead_config.overhead_per_minute.toFixed(2)}/min)`;
        }
        break;
    }

    return null;
  };

  const overheadPreview = calculateOverheadPreview();

  return (
    <Stack gap="4">
      {/* Toggle principal */}
      <Stack gap="2">
        <Switch
          checked={data.requires_production || false}
          onChange={(checked) => handleChange('requires_production', checked)}
          disabled={readOnly}
        >
          Este producto requiere producción
        </Switch>
        <Text color="fg.muted" fontSize="sm">
          Activa esto si el producto debe ser preparado/cocinado antes de la venta
        </Text>
      </Stack>

      {data.requires_production && (
        <>
          {/* Alert informativo */}
          <Alert.Root status="info" size="sm">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Integración con módulo Production</Alert.Title>
              <Alert.Description>
                Esta configuración se conectará con el módulo de Producción/Cocina para
                gestionar órdenes, KDS y capacidad de producción.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>

          {/* Tiempo de producción */}
          <NumberField
            label="Tiempo de producción (horas)"
            min={0}
            step={0.1}
            precision={2}
            placeholder="0.5"
            value={data.production_time_minutes ? data.production_time_minutes / 60 : undefined}
            onChange={(val) => {
              handleChange('production_time_minutes', val ? Math.round(val * 60) : undefined);
            }}
            disabled={readOnly}
            required
            error={getFieldError('production_time_minutes')?.message}
          />

          {/* Batch size y capacidad */}
          <HStack gap="4">
            <NumberField
              label="Tamaño del lote"
              min={1}
              placeholder="1"
              value={data.batch_size}
              onChange={(val) => handleChange('batch_size', val || undefined)}
              disabled={readOnly}
              error={getFieldError('batch_size')?.message}
            />

            <NumberField
              label="Capacidad diaria"
              min={1}
              placeholder="100"
              value={data.daily_capacity}
              onChange={(val) => handleChange('daily_capacity', val || undefined)}
              disabled={readOnly}
              error={getFieldError('daily_capacity')?.message}
            />
          </HStack>

          {/* Overhead Config */}
          <SelectField
            label="Método de overhead"
            placeholder="Selecciona método"
            collection={OVERHEAD_METHODS as ReturnType<typeof createListCollection>}
            value={data.overhead_config?.method ? [data.overhead_config.method] : ['none']}
            onValueChange={(details) => {
              const selected = details.value[0] as OverheadConfig['method'];
              handleOverheadChange('method', selected);
            }}
            disabled={readOnly}
            helperText="Cómo calcular costos indirectos (electricidad, alquiler, etc.)"
          />

          {/* Overhead fields según método */}
          {data.overhead_config?.method === 'fixed' && (
            <NumberField
              label="Overhead fijo por lote ($)"
              min={0}
              step={0.01}
              precision={2}
              placeholder="10.00"
              value={data.overhead_config.fixed_overhead}
              onChange={(val) => handleOverheadChange('fixed_overhead', val || undefined)}
              disabled={readOnly}
              error={getFieldError('overhead_config.fixed_overhead')?.message}
            />
          )}

          {data.overhead_config?.method === 'per_unit' && (
            <NumberField
              label="Overhead por unidad ($)"
              min={0}
              step={0.01}
              precision={2}
              placeholder="2.00"
              value={data.overhead_config.per_unit_overhead}
              onChange={(val) => handleOverheadChange('per_unit_overhead', val || undefined)}
              disabled={readOnly}
              error={getFieldError('overhead_config.per_unit_overhead')?.message}
            />
          )}

          {data.overhead_config?.method === 'time_based' && (
            <NumberField
              label="Overhead por minuto ($)"
              min={0}
              step={0.01}
              precision={2}
              placeholder="0.50"
              value={data.overhead_config.overhead_per_minute}
              onChange={(val) => handleOverheadChange('overhead_per_minute', val || undefined)}
              disabled={readOnly}
              error={getFieldError('overhead_config.overhead_per_minute')?.message}
            />
          )}

          {/* Overhead preview */}
          {overheadPreview && (
            <Alert.Root status="success" size="sm">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Overhead calculado</Alert.Title>
                <Alert.Description>{overheadPreview}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* Production mode */}
          <SelectField
            label="Modo de producción"
            placeholder="Selecciona modo"
            collection={PRODUCTION_MODES as ReturnType<typeof createListCollection>}
            value={data.production_mode ? [data.production_mode] : []}
            onValueChange={(details) => {
              const selected = details.value[0] as ProductionFields['production_mode'];
              handleChange('production_mode', selected);
            }}
            disabled={readOnly}
            helperText="Tipo de producción para este producto"
          />

          {/* KDS config (opcional) */}
          {data.production_mode === 'kitchen' && (
            <Alert.Root status="info" size="sm">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Configuración KDS</Alert.Title>
                <Alert.Description>
                  Para configurar categorías KDS, estaciones y prioridad, usa el módulo
                  de Cocina después de crear el producto.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
        </>
      )}
    </Stack>
  );
}

/**
 * Helper: Validar tiempos de producción
 */
export function validateProductionTime(productionTimeMinutes?: number): string | null {
  if (productionTimeMinutes && productionTimeMinutes <= 0) {
    return 'El tiempo de producción debe ser mayor a 0';
  }
  return null;
}

/**
 * Helper: Validar batch size vs daily capacity
 */
export function validateProductionCapacity(
  batchSize?: number,
  dailyCapacity?: number
): string | null {
  if (batchSize && dailyCapacity && dailyCapacity < batchSize) {
    return 'La capacidad diaria debe ser mayor o igual al tamaño del lote';
  }
  return null;
}
