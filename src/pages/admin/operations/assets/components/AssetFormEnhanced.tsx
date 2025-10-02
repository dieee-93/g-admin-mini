import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ContentLayout, FormSection, Button, Stack, CardGrid, MetricCard,
  Alert, Badge
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

import { logger } from '@/lib/logging';
const assetSchema = z.object({
  basicInfo: z.object({
    assetName: z.string().min(1, 'Nombre del asset requerido'),
    assetCode: z.string().min(1, 'Código único requerido'),
    category: z.enum(['equipment', 'vehicle', 'space', 'tools', 'technology', 'furniture']),
    subcategory: z.string().min(1, 'Subcategoría requerida'),
    brand: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional()
  }),

  financial: z.object({
    purchasePrice: z.number().min(0, 'Precio de compra debe ser mayor o igual a 0'),
    currentValue: z.number().min(0, 'Valor actual debe ser mayor o igual a 0'),
    depreciationRate: z.number().min(0).max(100, 'Tasa de depreciación debe estar entre 0-100%'),
    depreciationMethod: z.enum(['straight_line', 'declining_balance', 'units_of_production']).default('straight_line'),
    purchaseDate: z.string().min(1, 'Fecha de compra requerida'),
    warrantyExpiration: z.string().optional(),
    insuranceValue: z.number().min(0).default(0),
    salvageValue: z.number().min(0).default(0)
  }),

  rental: z.object({
    isRentable: z.boolean().default(true),
    dailyRate: z.number().min(0).default(0),
    hourlyRate: z.number().min(0).default(0),
    weeklyRate: z.number().min(0).default(0),
    monthlyRate: z.number().min(0).default(0),
    depositRequired: z.number().min(0).default(0),
    minRentalPeriod: z.number().min(0).default(1),
    maxRentalPeriod: z.number().min(0).default(365),
    advanceBookingDays: z.number().min(0).default(30)
  }),

  condition: z.object({
    currentCondition: z.enum(['excellent', 'good', 'fair', 'poor', 'damaged', 'out_of_service']).default('good'),
    lastInspectionDate: z.string().optional(),
    nextInspectionDate: z.string().optional(),
    maintenanceScore: z.number().min(0).max(100).default(85),
    utilizationScore: z.number().min(0).max(100).default(75),
    conditionNotes: z.string().optional()
  }),

  maintenance: z.object({
    maintenanceSchedule: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'as_needed']).default('monthly'),
    lastMaintenanceDate: z.string().optional(),
    nextMaintenanceDate: z.string().optional(),
    maintenanceCostBudget: z.number().min(0).default(0),
    maintenanceProvider: z.string().optional(),
    warrantyStatus: z.enum(['active', 'expired', 'not_applicable']).default('not_applicable')
  }),

  location: z.object({
    currentLocation: z.string().min(1, 'Ubicación actual requerida'),
    homeLocation: z.string().min(1, 'Ubicación base requerida'),
    isMovable: z.boolean().default(true),
    locationHistory: z.array(z.string()).default([]),
    gpsTracking: z.boolean().default(false),
    accessRestrictions: z.string().optional()
  }),

  specifications: z.object({
    technicalSpecs: z.string().optional(),
    dimensions: z.string().optional(),
    weight: z.number().min(0).optional(),
    capacity: z.string().optional(),
    powerRequirements: z.string().optional(),
    operatingInstructions: z.string().optional(),
    safetyRequirements: z.string().optional()
  }),

  status: z.enum(['available', 'rented', 'maintenance', 'damaged', 'retired']).default('available'),
  notes: z.string().optional()
});

type AssetFormData = z.infer<typeof assetSchema>;

export const AssetFormEnhanced: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      basicInfo: {
        category: 'equipment'
      },
      financial: {
        depreciationMethod: 'straight_line',
        purchasePrice: 0,
        currentValue: 0,
        depreciationRate: 10,
        insuranceValue: 0,
        salvageValue: 0
      },
      rental: {
        isRentable: true,
        dailyRate: 0,
        hourlyRate: 0,
        weeklyRate: 0,
        monthlyRate: 0,
        depositRequired: 0,
        minRentalPeriod: 1,
        maxRentalPeriod: 365,
        advanceBookingDays: 30
      },
      condition: {
        currentCondition: 'good',
        maintenanceScore: 85,
        utilizationScore: 75
      },
      maintenance: {
        maintenanceSchedule: 'monthly',
        maintenanceCostBudget: 0,
        warrantyStatus: 'not_applicable'
      },
      location: {
        isMovable: true,
        locationHistory: [],
        gpsTracking: false
      },
      status: 'available'
    }
  });

  const watchedValues = watch();
  const { financial, rental, condition, maintenance } = watchedValues;

  const assetMetrics = React.useMemo(() => {
    const currentAge = financial.purchaseDate ?
      Math.floor((new Date().getTime() - new Date(financial.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 0;

    const depreciatedValue = (() => {
      if (financial.depreciationMethod === 'straight_line') {
        const annualDepreciation = (financial.purchasePrice - financial.salvageValue) * (financial.depreciationRate / 100);
        return Math.max(financial.purchasePrice - (annualDepreciation * currentAge), financial.salvageValue);
      }
      return financial.currentValue;
    })();

    const annualRentalRevenue = (() => {
      const dailyRevenue = rental.dailyRate || 0;
      const utilizationRate = condition.utilizationScore / 100;
      return dailyRevenue * 365 * utilizationRate;
    })();

    const roi = financial.purchasePrice > 0 ? (annualRentalRevenue / financial.purchasePrice) * 100 : 0;

    const maintenanceCostRatio = financial.purchasePrice > 0 ?
      ((maintenance.maintenanceCostBudget || 0) / financial.purchasePrice) * 100 : 0;

    const assetHealth = (() => {
      const conditionWeight = condition.maintenanceScore * 0.4;
      const utilizationWeight = condition.utilizationScore * 0.3;
      const ageWeight = currentAge > 5 ? 60 : (90 - currentAge * 5);
      const ageScore = ageWeight * 0.3;
      return Math.round(conditionWeight + utilizationWeight + ageScore);
    })();

    const riskLevel = (() => {
      if (assetHealth > 80 && roi > 15) return 'low';
      if (assetHealth > 60 && roi > 8) return 'medium';
      return 'high';
    })();

    return {
      currentAge,
      depreciatedValue,
      annualRentalRevenue,
      roi,
      maintenanceCostRatio,
      assetHealth,
      riskLevel
    };
  }, [financial, rental, condition, maintenance]);

  const handleFormSubmit = async (data: AssetFormData) => {
    try {
      logger.info('App', 'Creating asset:', data);

      const assetId = `asset_${Date.now()}`;

      // Emit events using ModuleEventBus
      ModuleEventUtils.analytics.generated('asset', {
        assetCreated: data,
        projectedROI: assetMetrics.roi,
        assetHealth: assetMetrics.assetHealth,
        annualRevenue: assetMetrics.annualRentalRevenue
      });

      logger.info('App', `[Asset] Asset created: ${assetId}`);

    } catch (error) {
      logger.error('App', 'Error creating asset:', error);
    }
  };

  return (
    <ContentLayout spacing="normal">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack gap="lg">

          {/* Real-time Asset Metrics */}
          <FormSection
            title="Métricas de Asset en Tiempo Real"
            description="Análisis financiero y de performance del asset"
          >
            <CardGrid columns={{ base: 2, md: 4 }} gap="md">
              <MetricCard
                title="ROI Anual"
                value={`${assetMetrics.roi.toFixed(1)}%`}
                change={assetMetrics.roi > 15 ? 15 : assetMetrics.roi > 8 ? 5 : -5}
                icon="TrendingUpIcon"
              />
              <MetricCard
                title="Valor Depreciado"
                value={`$${assetMetrics.depreciatedValue.toLocaleString()}`}
                change={-financial.depreciationRate}
                icon="CurrencyDollarIcon"
              />
              <MetricCard
                title="Ingresos Anuales"
                value={`$${assetMetrics.annualRentalRevenue.toLocaleString()}`}
                change={condition.utilizationScore > 80 ? 20 : condition.utilizationScore > 60 ? 10 : 0}
                icon="ChartBarIcon"
              />
              <MetricCard
                title="Salud del Asset"
                value={`${assetMetrics.assetHealth}/100`}
                change={assetMetrics.assetHealth > 80 ? 5 : assetMetrics.assetHealth > 60 ? 0 : -10}
                icon="HeartIcon"
              />
            </CardGrid>

            <Stack direction="row" gap="sm">
              <Badge
                colorPalette={assetMetrics.riskLevel === 'low' ? 'green' :
                            assetMetrics.riskLevel === 'medium' ? 'yellow' : 'red'}
                variant="subtle"
              >
                Riesgo {assetMetrics.riskLevel === 'low' ? 'Bajo' :
                        assetMetrics.riskLevel === 'medium' ? 'Medio' : 'Alto'}
              </Badge>
              <Badge
                colorPalette={assetMetrics.currentAge < 2 ? 'green' :
                            assetMetrics.currentAge < 5 ? 'yellow' : 'orange'}
                variant="subtle"
              >
                {assetMetrics.currentAge} años de antigüedad
              </Badge>
              <Badge
                colorPalette={assetMetrics.maintenanceCostRatio < 5 ? 'green' :
                            assetMetrics.maintenanceCostRatio < 10 ? 'yellow' : 'red'}
                variant="subtle"
              >
                {assetMetrics.maintenanceCostRatio.toFixed(1)}% costo mantenimiento
              </Badge>
            </Stack>
          </FormSection>

          {/* Basic Information */}
          <FormSection
            title="Información Básica"
            description="Datos principales de identificación del asset"
          >
            <CardGrid columns={{ base: 1, md: 3 }} gap="md">
              <Stack gap="sm">
                <label>Nombre del Asset *</label>
                <input
                  {...register('basicInfo.assetName')}
                  placeholder="ej. Proyector Sony 4K"
                />
                {errors.basicInfo?.assetName && (
                  <Alert status="error" size="sm">
                    {errors.basicInfo.assetName.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Código Único *</label>
                <input
                  {...register('basicInfo.assetCode')}
                  placeholder="ej. PROJ-001"
                />
                {errors.basicInfo?.assetCode && (
                  <Alert status="error" size="sm">
                    {errors.basicInfo.assetCode.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Categoría</label>
                <select {...register('basicInfo.category')}>
                  <option value="equipment">Equipamiento</option>
                  <option value="vehicle">Vehículos</option>
                  <option value="space">Espacios</option>
                  <option value="tools">Herramientas</option>
                  <option value="technology">Tecnología</option>
                  <option value="furniture">Mobiliario</option>
                </select>
              </Stack>

              <Stack gap="sm">
                <label>Subcategoría *</label>
                <input
                  {...register('basicInfo.subcategory')}
                  placeholder="ej. Audiovisuales"
                />
                {errors.basicInfo?.subcategory && (
                  <Alert status="error" size="sm">
                    {errors.basicInfo.subcategory.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Marca</label>
                <input
                  {...register('basicInfo.brand')}
                  placeholder="ej. Sony"
                />
              </Stack>

              <Stack gap="sm">
                <label>Modelo</label>
                <input
                  {...register('basicInfo.model')}
                  placeholder="ej. VPL-XW5000"
                />
              </Stack>
            </CardGrid>
          </FormSection>

          {/* Financial Information */}
          <FormSection
            title="Información Financiera"
            description="Datos de compra, depreciación y valor del asset"
          >
            <CardGrid columns={{ base: 1, md: 4 }} gap="md">
              <Stack gap="sm">
                <label>Precio de Compra *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('financial.purchasePrice', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.financial?.purchasePrice && (
                  <Alert status="error" size="sm">
                    {errors.financial.purchasePrice.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Valor Actual *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('financial.currentValue', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.financial?.currentValue && (
                  <Alert status="error" size="sm">
                    {errors.financial.currentValue.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Tasa Depreciación (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  {...register('financial.depreciationRate', { valueAsNumber: true })}
                  placeholder="10"
                />
              </Stack>

              <Stack gap="sm">
                <label>Valor de Rescate</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('financial.salvageValue', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </Stack>
            </CardGrid>

            <CardGrid columns={{ base: 1, md: 3 }} gap="md">
              <Stack gap="sm">
                <label>Fecha de Compra *</label>
                <input
                  type="date"
                  {...register('financial.purchaseDate')}
                />
                {errors.financial?.purchaseDate && (
                  <Alert status="error" size="sm">
                    {errors.financial.purchaseDate.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Método de Depreciación</label>
                <select {...register('financial.depreciationMethod')}>
                  <option value="straight_line">Línea Recta</option>
                  <option value="declining_balance">Saldo Decreciente</option>
                  <option value="units_of_production">Unidades de Producción</option>
                </select>
              </Stack>

              <Stack gap="sm">
                <label>Valor de Seguro</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('financial.insuranceValue', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </Stack>
            </CardGrid>
          </FormSection>

          {/* Rental Configuration */}
          <FormSection
            title="Configuración de Alquiler"
            description="Tarifas y condiciones para rental del asset"
          >
            <Stack gap="md">
              <label>
                <input type="checkbox" {...register('rental.isRentable')} />
                Asset disponible para alquiler
              </label>

              {watchedValues.rental?.isRentable && (
                <>
                  <CardGrid columns={{ base: 1, md: 4 }} gap="md">
                    <Stack gap="sm">
                      <label>Tarifa Horaria</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('rental.hourlyRate', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                    </Stack>

                    <Stack gap="sm">
                      <label>Tarifa Diaria</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('rental.dailyRate', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                    </Stack>

                    <Stack gap="sm">
                      <label>Tarifa Semanal</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('rental.weeklyRate', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                    </Stack>

                    <Stack gap="sm">
                      <label>Tarifa Mensual</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('rental.monthlyRate', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                    </Stack>
                  </CardGrid>

                  <CardGrid columns={{ base: 1, md: 3 }} gap="md">
                    <Stack gap="sm">
                      <label>Depósito Requerido</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('rental.depositRequired', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                    </Stack>

                    <Stack gap="sm">
                      <label>Período Mínimo (días)</label>
                      <input
                        type="number"
                        min="1"
                        {...register('rental.minRentalPeriod', { valueAsNumber: true })}
                        placeholder="1"
                      />
                    </Stack>

                    <Stack gap="sm">
                      <label>Período Máximo (días)</label>
                      <input
                        type="number"
                        min="1"
                        {...register('rental.maxRentalPeriod', { valueAsNumber: true })}
                        placeholder="365"
                      />
                    </Stack>
                  </CardGrid>
                </>
              )}
            </Stack>
          </FormSection>

          {/* Condition & Maintenance */}
          <FormSection
            title="Condición y Mantenimiento"
            description="Estado actual y programación de mantenimiento"
          >
            <CardGrid columns={{ base: 1, md: 3 }} gap="md">
              <Stack gap="sm">
                <label>Condición Actual</label>
                <select {...register('condition.currentCondition')}>
                  <option value="excellent">Excelente</option>
                  <option value="good">Buena</option>
                  <option value="fair">Regular</option>
                  <option value="poor">Pobre</option>
                  <option value="damaged">Dañado</option>
                  <option value="out_of_service">Fuera de Servicio</option>
                </select>
              </Stack>

              <Stack gap="sm">
                <label>Score de Mantenimiento (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  {...register('condition.maintenanceScore', { valueAsNumber: true })}
                  placeholder="85"
                />
              </Stack>

              <Stack gap="sm">
                <label>Score de Utilización (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  {...register('condition.utilizationScore', { valueAsNumber: true })}
                  placeholder="75"
                />
              </Stack>
            </CardGrid>

            <CardGrid columns={{ base: 1, md: 3 }} gap="md">
              <Stack gap="sm">
                <label>Última Inspección</label>
                <input
                  type="date"
                  {...register('condition.lastInspectionDate')}
                />
              </Stack>

              <Stack gap="sm">
                <label>Próxima Inspección</label>
                <input
                  type="date"
                  {...register('condition.nextInspectionDate')}
                />
              </Stack>

              <Stack gap="sm">
                <label>Frecuencia Mantenimiento</label>
                <select {...register('maintenance.maintenanceSchedule')}>
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="annual">Anual</option>
                  <option value="as_needed">Según Necesidad</option>
                </select>
              </Stack>
            </CardGrid>
          </FormSection>

          {/* Location & Status */}
          <FormSection
            title="Ubicación y Estado"
            description="Localización actual y estado operativo"
          >
            <CardGrid columns={{ base: 1, md: 3 }} gap="md">
              <Stack gap="sm">
                <label>Ubicación Actual *</label>
                <input
                  {...register('location.currentLocation')}
                  placeholder="ej. Depósito A - Sector 3"
                />
                {errors.location?.currentLocation && (
                  <Alert status="error" size="sm">
                    {errors.location.currentLocation.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Ubicación Base *</label>
                <input
                  {...register('location.homeLocation')}
                  placeholder="ej. Depósito Principal"
                />
                {errors.location?.homeLocation && (
                  <Alert status="error" size="sm">
                    {errors.location.homeLocation.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Estado</label>
                <select {...register('status')}>
                  <option value="available">Disponible</option>
                  <option value="rented">Alquilado</option>
                  <option value="maintenance">En Mantenimiento</option>
                  <option value="damaged">Dañado</option>
                  <option value="retired">Retirado</option>
                </select>
              </Stack>
            </CardGrid>

            <Stack gap="sm">
              <label>Opciones de Ubicación</label>
              <Stack gap="sm">
                <label>
                  <input type="checkbox" {...register('location.isMovable')} />
                  Asset móvil
                </label>
                <label>
                  <input type="checkbox" {...register('location.gpsTracking')} />
                  Tracking GPS habilitado
                </label>
              </Stack>
            </Stack>
          </FormSection>

          {/* Technical Specifications */}
          <FormSection
            title="Especificaciones Técnicas"
            description="Detalles técnicos y operativos del asset"
          >
            <Stack gap="md">
              <CardGrid columns={{ base: 1, md: 3 }} gap="md">
                <Stack gap="sm">
                  <label>Dimensiones</label>
                  <input
                    {...register('specifications.dimensions')}
                    placeholder="ej. 45cm x 30cm x 15cm"
                  />
                </Stack>

                <Stack gap="sm">
                  <label>Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('specifications.weight', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                </Stack>

                <Stack gap="sm">
                  <label>Capacidad</label>
                  <input
                    {...register('specifications.capacity')}
                    placeholder="ej. 10 personas, 500kg"
                  />
                </Stack>
              </CardGrid>

              <Stack gap="sm">
                <label>Especificaciones Técnicas</label>
                <textarea
                  {...register('specifications.technicalSpecs')}
                  placeholder="Detalles técnicos, características, funcionalidades..."
                  rows={3}
                />
              </Stack>

              <Stack gap="sm">
                <label>Instrucciones de Operación</label>
                <textarea
                  {...register('specifications.operatingInstructions')}
                  placeholder="Pasos para operación segura y correcta..."
                  rows={3}
                />
              </Stack>
            </Stack>
          </FormSection>

          {/* Notes */}
          <FormSection
            title="Notas Adicionales"
            description="Información adicional sobre el asset"
          >
            <textarea
              {...register('notes')}
              placeholder="Notas especiales, historial, restricciones..."
              rows={4}
            />
          </FormSection>

          <Stack direction="row" gap="md">
            <Button
              type="submit"
              colorPalette="blue"
              loading={isSubmitting}
              size="lg"
            >
              <Icon name="PlusIcon" />
              Crear Asset
            </Button>
            <Button variant="outline" size="lg">
              <Icon name="EyeIcon" />
              Vista Previa
            </Button>
            <Button variant="outline" size="lg">
              <Icon name="QrCodeIcon" />
              Generar QR
            </Button>
          </Stack>

        </Stack>
      </form>
    </ContentLayout>
  );
};

export default AssetFormEnhanced;