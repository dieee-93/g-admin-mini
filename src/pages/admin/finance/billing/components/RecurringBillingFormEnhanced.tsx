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
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline';

import { logger } from '@/lib/logging';
const recurringBillingSchema = z.object({
  subscriptionName: z.string().min(1, 'Nombre de suscripción requerido'),
  customerId: z.string().min(1, 'Cliente requerido'),
  billingType: z.enum(['monthly', 'quarterly', 'annual', 'custom']),

  amount: z.number().min(0.01, 'Monto debe ser mayor a 0'),
  currency: z.enum(['ARS', 'USD', 'EUR']).default('ARS'),
  taxIncluded: z.boolean().default(true),

  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().optional(),
  billingCycles: z.number().optional(),

  customInterval: z.number().optional(),
  customIntervalType: z.enum(['days', 'weeks', 'months']).optional(),

  autoInvoice: z.boolean().default(true),
  autoCollect: z.boolean().default(false),
  retryFailedPayments: z.boolean().default(true),
  maxRetries: z.number().min(0).max(5).default(3),

  description: z.string().optional(),
  internalNotes: z.string().optional(),

  paymentTerms: z.enum(['immediate', 'net15', 'net30', 'net45']).default('immediate'),
  reminderDays: z.array(z.number()).default([7, 3, 1]),

  prorate: z.boolean().default(false),
  allowUsageCharges: z.boolean().default(false),
  suspendOnFailure: z.boolean().default(false)
});

type RecurringBillingFormData = z.infer<typeof recurringBillingSchema>;

export const RecurringBillingFormEnhanced: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RecurringBillingFormData>({
    resolver: zodResolver(recurringBillingSchema),
    defaultValues: {
      currency: 'ARS',
      billingType: 'monthly',
      taxIncluded: true,
      autoInvoice: true,
      autoCollect: false,
      retryFailedPayments: true,
      maxRetries: 3,
      paymentTerms: 'immediate',
      reminderDays: [7, 3, 1],
      prorate: false,
      allowUsageCharges: false,
      suspendOnFailure: false
    }
  });

  const watchedValues = watch();
  const { amount, billingType, customInterval, customIntervalType, startDate, endDate, billingCycles } = watchedValues;

  const billingMetrics = React.useMemo(() => {
    const monthlyAmount = (() => {
      switch (billingType) {
        case 'monthly': return amount || 0;
        case 'quarterly': return (amount || 0) / 3;
        case 'annual': return (amount || 0) / 12;
        case 'custom':
          if (customInterval && customIntervalType) {
            const daysInterval = customIntervalType === 'days' ? customInterval :
                               customIntervalType === 'weeks' ? customInterval * 7 :
                               customInterval * 30;
            return (amount || 0) * (30 / daysInterval);
          }
          return 0;
        default: return 0;
      }
    })();

    const annualRevenue = monthlyAmount * 12;

    const lifetimeValue = (() => {
      if (endDate && startDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return monthlyAmount * months;
      }
      if (billingCycles) {
        // Calculate total value based on billing type and cycles
        return (amount || 0) * billingCycles;
      }
      return annualRevenue * 2; // Estimate 2 years if indefinite
    })();

    const nextBillingDate = startDate ? (() => {
      const start = new Date(startDate);
      switch (billingType) {
        case 'monthly': return new Date(start.setMonth(start.getMonth() + 1));
        case 'quarterly': return new Date(start.setMonth(start.getMonth() + 3));
        case 'annual': return new Date(start.setFullYear(start.getFullYear() + 1));
        case 'custom':
          if (customInterval && customIntervalType) {
            const days = customIntervalType === 'days' ? customInterval :
                        customIntervalType === 'weeks' ? customInterval * 7 :
                        customInterval * 30;
            return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
          }
          return start;
        default: return start;
      }
    })() : null;

    const revenueHealth = monthlyAmount > 1000 ? 'high' : monthlyAmount > 500 ? 'medium' : 'low';
    const retentionRisk = billingCycles && billingCycles < 12 ? 'high' :
                         billingType === 'annual' ? 'low' : 'medium';

    return {
      monthlyAmount,
      annualRevenue,
      lifetimeValue,
      nextBillingDate,
      revenueHealth,
      retentionRisk
    };
  }, [amount, billingType, customInterval, customIntervalType, startDate, endDate, billingCycles]);

  const handleFormSubmit = async (data: RecurringBillingFormData) => {
    try {
      logger.info('App', 'Creating recurring billing:', data);

      const subscriptionId = `sub_${Date.now()}`;

      // Emit events using ModuleEventBus
      ModuleEventUtils.analytics.generated('billing', {
        subscriptionCreated: data,
        projectedRevenue: billingMetrics.annualRevenue,
        lifetimeValue: billingMetrics.lifetimeValue
      });

      // Emit custom billing events (will be added to EventBus)
      logger.info('App', `[RecurringBilling] Subscription created: ${subscriptionId}`);

    } catch (error) {
      logger.error('App', 'Error creating subscription:', error);
    }
  };

  return (
    <ContentLayout spacing="normal">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack gap="lg">

          {/* Real-time Metrics */}
          <FormSection
            title="Métricas en Tiempo Real"
            description="Proyecciones financieras de la suscripción"
          >
            <CardGrid columns={{ base: 2, md: 4 }} gap="md">
              <MetricCard
                title="Ingresos Mensuales"
                value={`$${billingMetrics.monthlyAmount.toLocaleString()}`}
                change={(billingMetrics.revenueHealth === 'high' ? 15 : billingMetrics.revenueHealth === 'medium' ? 5 : -2).toString()}
                icon="ArrowTrendingUpIcon"
              />
              <MetricCard
                title="Ingresos Anuales"
                value={`$${billingMetrics.annualRevenue.toLocaleString()}`}
                change="12"
                icon="CurrencyDollarIcon"
              />
              <MetricCard
                title="Valor de Vida (LTV)"
                value={`$${billingMetrics.lifetimeValue.toLocaleString()}`}
                change="25"
                icon="ChartBarIcon"
              />
              <MetricCard
                title="Próxima Facturación"
                value={billingMetrics.nextBillingDate ?
                  billingMetrics.nextBillingDate.toLocaleDateString() : 'N/A'}
                change="0"
                icon="CalendarIcon"
              />
            </CardGrid>

            <Stack direction="row" gap="sm">
              <Badge
                colorPalette={billingMetrics.revenueHealth === 'high' ? 'green' :
                            billingMetrics.revenueHealth === 'medium' ? 'yellow' : 'red'}
                variant="subtle"
              >
                Ingresos {billingMetrics.revenueHealth === 'high' ? 'Altos' :
                         billingMetrics.revenueHealth === 'medium' ? 'Medios' : 'Bajos'}
              </Badge>
              <Badge
                colorPalette={billingMetrics.retentionRisk === 'low' ? 'green' :
                            billingMetrics.retentionRisk === 'medium' ? 'yellow' : 'red'}
                variant="subtle"
              >
                Retención {billingMetrics.retentionRisk === 'low' ? 'Estable' :
                          billingMetrics.retentionRisk === 'medium' ? 'Moderada' : 'Riesgo'}
              </Badge>
            </Stack>
          </FormSection>

          {/* Subscription Basic Info */}
          <FormSection
            title="Información Básica de Suscripción"
            description="Datos principales del servicio recurrente"
          >
            <CardGrid columns={{ base: 1, md: 2 }} gap="md">
              <Stack gap="sm">
                <label>Nombre de Suscripción *</label>
                <input
                  {...register('subscriptionName')}
                  placeholder="ej. Plan Premium Mensual"
                />
                {errors.subscriptionName && (
                  <Alert status="error" size="sm">
                    {errors.subscriptionName.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Cliente *</label>
                <select {...register('customerId')}>
                  <option value="">Seleccionar cliente</option>
                  <option value="customer_1">Cliente Premium SA</option>
                  <option value="customer_2">Empresa Tech SRL</option>
                  <option value="customer_3">Comercial Norte</option>
                </select>
                {errors.customerId && (
                  <Alert status="error" size="sm">
                    {errors.customerId.message}
                  </Alert>
                )}
              </Stack>
            </CardGrid>
          </FormSection>

          {/* Billing Configuration */}
          <FormSection
            title="Configuración de Facturación"
            description="Frecuencia, montos y moneda de la suscripción"
          >
            <CardGrid columns={{ base: 1, md: 3 }} gap="md">
              <Stack gap="sm">
                <label>Tipo de Facturación</label>
                <select {...register('billingType')}>
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="annual">Anual</option>
                  <option value="custom">Personalizado</option>
                </select>
              </Stack>

              <Stack gap="sm">
                <label>Monto *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <Alert status="error" size="sm">
                    {errors.amount.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Moneda</label>
                <select {...register('currency')}>
                  <option value="ARS">ARS - Peso Argentino</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </Stack>
            </CardGrid>

            {watchedValues.billingType === 'custom' && (
              <CardGrid columns={{ base: 1, md: 2 }} gap="md">
                <Stack gap="sm">
                  <label>Intervalo Personalizado</label>
                  <input
                    type="number"
                    {...register('customInterval', { valueAsNumber: true })}
                    placeholder="1"
                  />
                </Stack>
                <Stack gap="sm">
                  <label>Tipo de Intervalo</label>
                  <select {...register('customIntervalType')}>
                    <option value="days">Días</option>
                    <option value="weeks">Semanas</option>
                    <option value="months">Meses</option>
                  </select>
                </Stack>
              </CardGrid>
            )}

            <Stack direction="row" gap="md">
              <label>
                <input
                  type="checkbox"
                  {...register('taxIncluded')}
                />
                Impuestos incluidos
              </label>
              <label>
                <input
                  type="checkbox"
                  {...register('prorate')}
                />
                Prorratear primer período
              </label>
            </Stack>
          </FormSection>

          {/* Scheduling & Duration */}
          <FormSection
            title="Programación y Duración"
            description="Fechas de inicio, fin y ciclos de facturación"
          >
            <CardGrid columns={{ base: 1, md: 3 }} gap="md">
              <Stack gap="sm">
                <label>Fecha de Inicio *</label>
                <input
                  type="date"
                  {...register('startDate')}
                />
                {errors.startDate && (
                  <Alert status="error" size="sm">
                    {errors.startDate.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Fecha de Fin (opcional)</label>
                <input
                  type="date"
                  {...register('endDate')}
                />
              </Stack>

              <Stack gap="sm">
                <label>Ciclos de Facturación (opcional)</label>
                <input
                  type="number"
                  {...register('billingCycles', { valueAsNumber: true })}
                  placeholder="12"
                />
              </Stack>
            </CardGrid>
          </FormSection>

          {/* Automation & Collection */}
          <FormSection
            title="Automatización y Cobro"
            description="Configuración de procesamiento automático y gestión de fallos"
          >
            <Stack gap="md">
              <CardGrid columns={{ base: 1, md: 2 }} gap="md">
                <Stack gap="sm">
                  <label>Términos de Pago</label>
                  <select {...register('paymentTerms')}>
                    <option value="immediate">Inmediato</option>
                    <option value="net15">Neto 15 días</option>
                    <option value="net30">Neto 30 días</option>
                    <option value="net45">Neto 45 días</option>
                  </select>
                </Stack>

                <Stack gap="sm">
                  <label>Reintentos Máximos</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    {...register('maxRetries', { valueAsNumber: true })}
                  />
                </Stack>
              </CardGrid>

              <Stack gap="sm">
                <label>Opciones de Automatización</label>
                <Stack gap="sm">
                  <label>
                    <input
                      type="checkbox"
                      {...register('autoInvoice')}
                    />
                    Generar facturas automáticamente
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      {...register('autoCollect')}
                    />
                    Cobrar automáticamente
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      {...register('retryFailedPayments')}
                    />
                    Reintentar pagos fallidos
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      {...register('suspendOnFailure')}
                    />
                    Suspender suscripción en fallo
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      {...register('allowUsageCharges')}
                    />
                    Permitir cargos por uso
                  </label>
                </Stack>
              </Stack>
            </Stack>
          </FormSection>

          {/* Notes & Description */}
          <FormSection
            title="Descripción y Notas"
            description="Información adicional sobre la suscripción"
          >
            <Stack gap="md">
              <Stack gap="sm">
                <label>Descripción del Servicio</label>
                <textarea
                  {...register('description')}
                  placeholder="Descripción detallada del servicio o producto recurrente..."
                  rows={3}
                />
              </Stack>

              <Stack gap="sm">
                <label>Notas Internas</label>
                <textarea
                  {...register('internalNotes')}
                  placeholder="Notas internas, condiciones especiales, etc..."
                  rows={3}
                />
              </Stack>
            </Stack>
          </FormSection>

          <Stack direction="row" gap="md">
            <Button
              type="submit"
              colorPalette="blue"
              loading={isSubmitting}
              size="lg"
            >
              <Icon as={PlusIcon} />
              Crear Suscripción Recurrente
            </Button>
            <Button variant="outline" size="lg">
              <Icon as={EyeIcon} />
              Vista Previa
            </Button>
          </Stack>

        </Stack>
      </form>
    </ContentLayout>
  );
};

export default RecurringBillingFormEnhanced;