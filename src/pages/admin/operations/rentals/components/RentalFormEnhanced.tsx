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
const rentalSchema = z.object({
  customerInfo: z.object({
    customerId: z.string().optional(),
    customerName: z.string().min(1, 'Nombre del cliente requerido'),
    customerEmail: z.string().email('Email válido requerido'),
    customerPhone: z.string().min(1, 'Teléfono requerido'),
    customerType: z.enum(['individual', 'corporate', 'member']).default('individual')
  }),

  rentalType: z.enum(['equipment', 'space', 'vehicle', 'tools']),
  assetId: z.string().min(1, 'Asset/Equipo requerido'),
  assetName: z.string().min(1, 'Nombre del asset requerido'),
  assetCategory: z.string().min(1, 'Categoría requerida'),

  rentalPeriod: z.object({
    startDate: z.string().min(1, 'Fecha de inicio requerida'),
    endDate: z.string().min(1, 'Fecha de fin requerida'),
    startTime: z.string().min(1, 'Hora de inicio requerida'),
    endTime: z.string().min(1, 'Hora de fin requerida'),
    duration: z.number().min(1, 'Duración debe ser mayor a 0'),
    durationUnit: z.enum(['hours', 'days', 'weeks', 'months']).default('hours')
  }),

  pricing: z.object({
    baseRate: z.number().min(0.01, 'Tarifa base debe ser mayor a 0'),
    rateType: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('hourly'),
    deposit: z.number().min(0).default(0),
    discountPercentage: z.number().min(0).max(100).default(0),
    taxPercentage: z.number().min(0).max(100).default(21),
    additionalFees: z.array(z.object({
      name: z.string(),
      amount: z.number()
    })).default([])
  }),

  rentalDetails: z.object({
    purpose: z.string().optional(),
    specialRequirements: z.string().optional(),
    deliveryRequired: z.boolean().default(false),
    deliveryAddress: z.string().optional(),
    setupRequired: z.boolean().default(false),
    insuranceRequired: z.boolean().default(false),
    securityDeposit: z.number().min(0).default(0)
  }),

  terms: z.object({
    cancellationPolicy: z.enum(['flexible', 'moderate', 'strict']).default('moderate'),
    lateFeeRate: z.number().min(0).max(100).default(10),
    damageFeePolicy: z.string().optional(),
    maintenanceIncluded: z.boolean().default(true),
    replacementPolicy: z.string().optional()
  }),

  status: z.enum(['draft', 'confirmed', 'active', 'completed', 'cancelled']).default('draft'),
  paymentMethod: z.enum(['cash', 'credit_card', 'bank_transfer', 'corporate_account']).default('credit_card'),
  notes: z.string().optional()
});

type RentalFormData = z.infer<typeof rentalSchema>;

export const RentalFormEnhanced: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<RentalFormData>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      customerInfo: {
        customerType: 'individual'
      },
      rentalType: 'equipment',
      rentalPeriod: {
        durationUnit: 'hours'
      },
      pricing: {
        rateType: 'hourly',
        deposit: 0,
        discountPercentage: 0,
        taxPercentage: 21,
        additionalFees: []
      },
      rentalDetails: {
        deliveryRequired: false,
        setupRequired: false,
        insuranceRequired: false,
        securityDeposit: 0
      },
      terms: {
        cancellationPolicy: 'moderate',
        lateFeeRate: 10,
        maintenanceIncluded: true
      },
      status: 'draft',
      paymentMethod: 'credit_card'
    }
  });

  const watchedValues = watch();
  const { pricing, rentalPeriod } = watchedValues;

  const rentalMetrics = React.useMemo(() => {
    const subtotal = (pricing.baseRate || 0) * (rentalPeriod.duration || 0);
    const discountAmount = subtotal * ((pricing.discountPercentage || 0) / 100);
    const additionalFeesTotal = (pricing.additionalFees || []).reduce((sum, fee) => sum + fee.amount, 0);
    const taxableAmount = subtotal - discountAmount + additionalFeesTotal;
    const taxAmount = taxableAmount * ((pricing.taxPercentage || 0) / 100);
    const totalAmount = taxableAmount + taxAmount + (pricing.deposit || 0);

    const dailyRate = (() => {
      switch (pricing.rateType) {
        case 'hourly': return (pricing.baseRate || 0) * 24;
        case 'daily': return pricing.baseRate || 0;
        case 'weekly': return (pricing.baseRate || 0) / 7;
        case 'monthly': return (pricing.baseRate || 0) / 30;
        default: return pricing.baseRate || 0;
      }
    })();

    const profitMargin = subtotal > 0 ? ((subtotal - (subtotal * 0.3)) / subtotal) * 100 : 0; // Assuming 30% cost

    const utilizationImpact = (() => {
      if (rentalPeriod.duration > 168) return 'high'; // More than a week
      if (rentalPeriod.duration > 24) return 'medium'; // More than a day
      return 'low';
    })();

    const revenueCategory = totalAmount > 5000 ? 'premium' : totalAmount > 1000 ? 'standard' : 'basic';

    return {
      subtotal,
      discountAmount,
      additionalFeesTotal,
      taxAmount,
      totalAmount,
      dailyRate,
      profitMargin,
      utilizationImpact,
      revenueCategory
    };
  }, [pricing, rentalPeriod]);

  const handleFormSubmit = async (data: RentalFormData) => {
    try {
      logger.info('App', 'Creating rental:', data);

      const rentalId = `rental_${Date.now()}`;

      // Emit events using ModuleEventBus
      ModuleEventUtils.analytics.generated('rental', {
        rentalCreated: data,
        totalRevenue: rentalMetrics.totalAmount,
        duration: data.rentalPeriod.duration,
        assetUtilization: rentalMetrics.utilizationImpact
      });

      // Create customer if new
      if (!data.customerInfo.customerId) {
        const customerId = `cust_${Date.now()}`;
        ModuleEventUtils.customer.created(customerId, {
          name: data.customerInfo.customerName,
          email: data.customerInfo.customerEmail,
          phone: data.customerInfo.customerPhone,
          type: data.customerInfo.customerType
        });
      }

      logger.info('App', `[Rental] Rental created: ${rentalId}`);

    } catch (error) {
      logger.error('App', 'Error creating rental:', error);
    }
  };

  return (
    <ContentLayout spacing="normal">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack gap="lg">

          {/* Real-time Rental Metrics */}
          <FormSection
            title="Métricas de Alquiler en Tiempo Real"
            description="Proyecciones financieras y de utilización del rental"
          >
            <CardGrid columns={{ base: 2, md: 4 }} gap="md">
              <MetricCard
                title="Total Rental"
                value={`$${rentalMetrics.totalAmount.toLocaleString()}`}
                change={rentalMetrics.revenueCategory === 'premium' ? 25 :
                       rentalMetrics.revenueCategory === 'standard' ? 10 : 0}
                icon="CurrencyDollarIcon"
              />
              <MetricCard
                title="Tarifa Diaria"
                value={`$${rentalMetrics.dailyRate.toLocaleString()}`}
                change={15}
                icon="CalendarIcon"
              />
              <MetricCard
                title="Margen Estimado"
                value={`${rentalMetrics.profitMargin.toFixed(1)}%`}
                change={rentalMetrics.profitMargin > 60 ? 10 : rentalMetrics.profitMargin > 40 ? 5 : -5}
                icon="TrendingUpIcon"
              />
              <MetricCard
                title="Duración"
                value={`${rentalPeriod.duration || 0} ${rentalPeriod.durationUnit}`}
                change={0}
                icon="ClockIcon"
              />
            </CardGrid>

            <Stack direction="row" gap="sm">
              <Badge
                colorPalette={rentalMetrics.revenueCategory === 'premium' ? 'purple' :
                            rentalMetrics.revenueCategory === 'standard' ? 'blue' : 'green'}
                variant="subtle"
              >
                {rentalMetrics.revenueCategory === 'premium' ? 'Premium' :
                 rentalMetrics.revenueCategory === 'standard' ? 'Estándar' : 'Básico'}
              </Badge>
              <Badge
                colorPalette={rentalMetrics.utilizationImpact === 'high' ? 'red' :
                            rentalMetrics.utilizationImpact === 'medium' ? 'yellow' : 'green'}
                variant="subtle"
              >
                Utilización {rentalMetrics.utilizationImpact === 'high' ? 'Alta' :
                           rentalMetrics.utilizationImpact === 'medium' ? 'Media' : 'Baja'}
              </Badge>
            </Stack>
          </FormSection>

          {/* Customer Information */}
          <FormSection
            title="Información del Cliente"
            description="Datos del cliente que realiza el alquiler"
          >
            <CardGrid columns={{ base: 1, md: 2 }} gap="md">
              <Stack gap="sm">
                <label>Nombre Completo *</label>
                <input
                  {...register('customerInfo.customerName')}
                  placeholder="ej. Juan Carlos Pérez"
                />
                {errors.customerInfo?.customerName && (
                  <Alert status="error" size="sm">
                    {errors.customerInfo.customerName.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Email *</label>
                <input
                  type="email"
                  {...register('customerInfo.customerEmail')}
                  placeholder="juan.perez@email.com"
                />
                {errors.customerInfo?.customerEmail && (
                  <Alert status="error" size="sm">
                    {errors.customerInfo.customerEmail.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Teléfono *</label>
                <input
                  {...register('customerInfo.customerPhone')}
                  placeholder="+54 9 11 1234-5678"
                />
                {errors.customerInfo?.customerPhone && (
                  <Alert status="error" size="sm">
                    {errors.customerInfo.customerPhone.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Tipo de Cliente</label>
                <select {...register('customerInfo.customerType')}>
                  <option value="individual">Individual</option>
                  <option value="corporate">Corporativo</option>
                  <option value="member">Miembro</option>
                </select>
              </Stack>
            </CardGrid>
          </FormSection>

          {/* Asset Selection */}
          <FormSection
            title="Selección de Asset/Equipo"
            description="Equipo, espacio o vehículo a alquilar"
          >
            <CardGrid columns={{ base: 1, md: 3 }} gap="md">
              <Stack gap="sm">
                <label>Tipo de Rental</label>
                <select {...register('rentalType')}>
                  <option value="equipment">Equipamiento</option>
                  <option value="space">Espacios</option>
                  <option value="vehicle">Vehículos</option>
                  <option value="tools">Herramientas</option>
                </select>
              </Stack>

              <Stack gap="sm">
                <label>Asset/Equipo *</label>
                <select {...register('assetId')}>
                  <option value="">Seleccionar asset</option>
                  <option value="equip_001">Proyector HD</option>
                  <option value="equip_002">Sistema de Sonido Pro</option>
                  <option value="space_001">Salón de Eventos A</option>
                  <option value="space_002">Sala de Reuniones</option>
                  <option value="vehicle_001">Van de Transporte</option>
                  <option value="tools_001">Kit Herramientas Pro</option>
                </select>
                {errors.assetId && (
                  <Alert status="error" size="sm">
                    {errors.assetId.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Nombre del Asset *</label>
                <input
                  {...register('assetName')}
                  placeholder="ej. Proyector HD 4K"
                />
                {errors.assetName && (
                  <Alert status="error" size="sm">
                    {errors.assetName.message}
                  </Alert>
                )}
              </Stack>
            </CardGrid>
          </FormSection>

          {/* Rental Period */}
          <FormSection
            title="Período de Alquiler"
            description="Fechas, horarios y duración del rental"
          >
            <CardGrid columns={{ base: 1, md: 4 }} gap="md">
              <Stack gap="sm">
                <label>Fecha de Inicio *</label>
                <input
                  type="date"
                  {...register('rentalPeriod.startDate')}
                />
                {errors.rentalPeriod?.startDate && (
                  <Alert status="error" size="sm">
                    {errors.rentalPeriod.startDate.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Hora de Inicio *</label>
                <input
                  type="time"
                  {...register('rentalPeriod.startTime')}
                />
                {errors.rentalPeriod?.startTime && (
                  <Alert status="error" size="sm">
                    {errors.rentalPeriod.startTime.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Fecha de Fin *</label>
                <input
                  type="date"
                  {...register('rentalPeriod.endDate')}
                />
                {errors.rentalPeriod?.endDate && (
                  <Alert status="error" size="sm">
                    {errors.rentalPeriod.endDate.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Hora de Fin *</label>
                <input
                  type="time"
                  {...register('rentalPeriod.endTime')}
                />
                {errors.rentalPeriod?.endTime && (
                  <Alert status="error" size="sm">
                    {errors.rentalPeriod.endTime.message}
                  </Alert>
                )}
              </Stack>
            </CardGrid>

            <CardGrid columns={{ base: 1, md: 2 }} gap="md">
              <Stack gap="sm">
                <label>Duración *</label>
                <input
                  type="number"
                  min="1"
                  {...register('rentalPeriod.duration', { valueAsNumber: true })}
                  placeholder="1"
                />
                {errors.rentalPeriod?.duration && (
                  <Alert status="error" size="sm">
                    {errors.rentalPeriod.duration.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Unidad de Duración</label>
                <select {...register('rentalPeriod.durationUnit')}>
                  <option value="hours">Horas</option>
                  <option value="days">Días</option>
                  <option value="weeks">Semanas</option>
                  <option value="months">Meses</option>
                </select>
              </Stack>
            </CardGrid>
          </FormSection>

          {/* Pricing Structure */}
          <FormSection
            title="Estructura de Precios"
            description="Tarifas, depósitos y cargos adicionales"
          >
            <CardGrid columns={{ base: 1, md: 4 }} gap="md">
              <Stack gap="sm">
                <label>Tarifa Base *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('pricing.baseRate', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.pricing?.baseRate && (
                  <Alert status="error" size="sm">
                    {errors.pricing.baseRate.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Tipo de Tarifa</label>
                <select {...register('pricing.rateType')}>
                  <option value="hourly">Por Hora</option>
                  <option value="daily">Por Día</option>
                  <option value="weekly">Por Semana</option>
                  <option value="monthly">Por Mes</option>
                </select>
              </Stack>

              <Stack gap="sm">
                <label>Depósito</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('pricing.deposit', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </Stack>

              <Stack gap="sm">
                <label>Descuento (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  {...register('pricing.discountPercentage', { valueAsNumber: true })}
                  placeholder="0"
                />
              </Stack>
            </CardGrid>

            <Stack gap="sm">
              <label>Resumen de Costos</label>
              <CardGrid columns={{ base: 1, md: 4 }} gap="sm">
                <Stack align="center" gap="xs">
                  <Typography variant="caption" color="muted">Subtotal</Typography>
                  <Typography variant="h6">${rentalMetrics.subtotal.toLocaleString()}</Typography>
                </Stack>
                <Stack align="center" gap="xs">
                  <Typography variant="caption" color="muted">Descuento</Typography>
                  <Typography variant="h6" color="green.600">-${rentalMetrics.discountAmount.toLocaleString()}</Typography>
                </Stack>
                <Stack align="center" gap="xs">
                  <Typography variant="caption" color="muted">Impuestos</Typography>
                  <Typography variant="h6">${rentalMetrics.taxAmount.toLocaleString()}</Typography>
                </Stack>
                <Stack align="center" gap="xs">
                  <Typography variant="caption" color="muted">Total</Typography>
                  <Typography variant="h6" color="blue.600">${rentalMetrics.totalAmount.toLocaleString()}</Typography>
                </Stack>
              </CardGrid>
            </Stack>
          </FormSection>

          {/* Rental Details */}
          <FormSection
            title="Detalles del Alquiler"
            description="Requisitos especiales y servicios adicionales"
          >
            <Stack gap="md">
              <CardGrid columns={{ base: 1, md: 2 }} gap="md">
                <Stack gap="sm">
                  <label>Propósito del Alquiler</label>
                  <textarea
                    {...register('rentalDetails.purpose')}
                    placeholder="ej. Evento corporativo, producción audiovisual..."
                    rows={3}
                  />
                </Stack>

                <Stack gap="sm">
                  <label>Requisitos Especiales</label>
                  <textarea
                    {...register('rentalDetails.specialRequirements')}
                    placeholder="Instalación, configuración especial, personal técnico..."
                    rows={3}
                  />
                </Stack>
              </CardGrid>

              <Stack gap="sm">
                <label>Servicios Adicionales</label>
                <Stack gap="sm">
                  <label>
                    <input type="checkbox" {...register('rentalDetails.deliveryRequired')} />
                    Entrega/Retiro requerido
                  </label>
                  <label>
                    <input type="checkbox" {...register('rentalDetails.setupRequired')} />
                    Instalación/Configuración incluida
                  </label>
                  <label>
                    <input type="checkbox" {...register('rentalDetails.insuranceRequired')} />
                    Seguro requerido
                  </label>
                </Stack>
              </Stack>

              {watchedValues.rentalDetails?.deliveryRequired && (
                <Stack gap="sm">
                  <label>Dirección de Entrega</label>
                  <textarea
                    {...register('rentalDetails.deliveryAddress')}
                    placeholder="Dirección completa para entrega/retiro..."
                    rows={2}
                  />
                </Stack>
              )}
            </Stack>
          </FormSection>

          {/* Terms & Payment */}
          <FormSection
            title="Términos y Condiciones"
            description="Políticas de cancelación, pagos y responsabilidades"
          >
            <CardGrid columns={{ base: 1, md: 3 }} gap="md">
              <Stack gap="sm">
                <label>Política de Cancelación</label>
                <select {...register('terms.cancellationPolicy')}>
                  <option value="flexible">Flexible (24h antes)</option>
                  <option value="moderate">Moderada (48h antes)</option>
                  <option value="strict">Estricta (72h antes)</option>
                </select>
              </Stack>

              <Stack gap="sm">
                <label>Método de Pago</label>
                <select {...register('paymentMethod')}>
                  <option value="credit_card">Tarjeta de Crédito</option>
                  <option value="bank_transfer">Transferencia Bancaria</option>
                  <option value="cash">Efectivo</option>
                  <option value="corporate_account">Cuenta Corporativa</option>
                </select>
              </Stack>

              <Stack gap="sm">
                <label>Estado</label>
                <select {...register('status')}>
                  <option value="draft">Borrador</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="active">Activo</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </Stack>
            </CardGrid>

            <Stack gap="sm">
              <label>
                <input type="checkbox" {...register('terms.maintenanceIncluded')} />
                Mantenimiento incluido durante el rental
              </label>
            </Stack>
          </FormSection>

          {/* Notes */}
          <FormSection
            title="Notas Adicionales"
            description="Comentarios e información adicional"
          >
            <textarea
              {...register('notes')}
              placeholder="Notas especiales, instrucciones de manejo, contactos adicionales..."
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
              Crear Rental
            </Button>
            <Button variant="outline" size="lg">
              <Icon name="EyeIcon" />
              Vista Previa
            </Button>
            <Button variant="outline" size="lg">
              <Icon name="DocumentDuplicateIcon" />
              Duplicar
            </Button>
          </Stack>

        </Stack>
      </form>
    </ContentLayout>
  );
};

export default RentalFormEnhanced;