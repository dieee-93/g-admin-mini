import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ContentLayout, FormSection, Button, Stack, CardGrid, MetricCard,
  Alert, Badge
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import {
  CalendarIcon, CurrencyDollarIcon, EyeIcon, TrendingUpIcon, UserIcon, UserPlusIcon
} from '@heroicons/react/24/outline';

import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

import { logger } from '@/lib/logging';
const membershipSchema = z.object({
  memberName: z.string().min(1, 'Nombre del miembro requerido'),
  memberEmail: z.string().email('Email válido requerido'),
  memberPhone: z.string().min(1, 'Teléfono requerido'),
  membershipType: z.enum(['basic', 'premium', 'vip', 'corporate', 'family']),

  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().optional(),
  membershipDuration: z.enum(['monthly', 'quarterly', 'semiannual', 'annual', 'lifetime']),

  fees: z.object({
    registrationFee: z.number().min(0).default(0),
    monthlyFee: z.number().min(0),
    lateFeeRate: z.number().min(0).max(100).default(5),
    cancellationFee: z.number().min(0).default(0)
  }),

  benefits: z.object({
    facilityAccess: z.array(z.string()).default([]),
    maxGuests: z.number().min(0).default(0),
    personalTrainerSessions: z.number().min(0).default(0),
    nutritionConsultations: z.number().min(0).default(0),
    specialEvents: z.boolean().default(false),
    lockerRoom: z.boolean().default(false),
    parking: z.boolean().default(false)
  }),

  restrictions: z.object({
    peakHourAccess: z.boolean().default(true),
    weekendAccess: z.boolean().default(true),
    holidayAccess: z.boolean().default(false),
    equipmentRestrictions: z.array(z.string()).default([]),
    areaRestrictions: z.array(z.string()).default([])
  }),

  autoRenewal: z.boolean().default(false),
  paymentMethod: z.enum(['credit_card', 'bank_transfer', 'cash', 'check']).default('credit_card'),
  billingCycle: z.enum(['monthly', 'quarterly', 'annual']).default('monthly'),

  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  }),

  healthInfo: z.object({
    hasHealthConditions: z.boolean().default(false),
    conditions: z.string().optional(),
    medications: z.string().optional(),
    doctorClearance: z.boolean().default(false)
  }),

  notes: z.string().optional()
});

type MembershipFormData = z.infer<typeof membershipSchema>;

export const MembershipFormEnhanced: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      membershipType: 'basic',
      membershipDuration: 'monthly',
      fees: {
        registrationFee: 0,
        monthlyFee: 0,
        lateFeeRate: 5,
        cancellationFee: 0
      },
      benefits: {
        facilityAccess: [],
        maxGuests: 0,
        personalTrainerSessions: 0,
        nutritionConsultations: 0,
        specialEvents: false,
        lockerRoom: false,
        parking: false
      },
      restrictions: {
        peakHourAccess: true,
        weekendAccess: true,
        holidayAccess: false,
        equipmentRestrictions: [],
        areaRestrictions: []
      },
      autoRenewal: false,
      paymentMethod: 'credit_card',
      billingCycle: 'monthly',
      emergencyContact: {},
      healthInfo: {
        hasHealthConditions: false,
        doctorClearance: false
      }
    }
  });

  const watchedValues = watch();
  const { membershipType, membershipDuration, fees, startDate, endDate } = watchedValues;

  const membershipMetrics = React.useMemo(() => {
    const monthlyRevenue = (() => {
      switch (membershipDuration) {
        case 'monthly': return fees.monthlyFee || 0;
        case 'quarterly': return (fees.monthlyFee || 0) * 3;
        case 'semiannual': return (fees.monthlyFee || 0) * 6;
        case 'annual': return (fees.monthlyFee || 0) * 12;
        case 'lifetime': return (fees.monthlyFee || 0) * 120; // Estimate 10 years
        default: return fees.monthlyFee || 0;
      }
    })();

    const lifetimeValue = (() => {
      const registrationRevenue = fees.registrationFee || 0;
      const membershipRevenue = monthlyRevenue;

      if (endDate && startDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return registrationRevenue + (fees.monthlyFee || 0) * months;
      }

      return registrationRevenue + membershipRevenue;
    })();

    const membershipValue = (() => {
      switch (membershipType) {
        case 'basic': return 'standard';
        case 'premium': return 'high';
        case 'vip': return 'premium';
        case 'corporate': return 'enterprise';
        case 'family': return 'high';
        default: return 'standard';
      }
    })();

    const renewalDate = startDate ? (() => {
      const start = new Date(startDate);
      switch (membershipDuration) {
        case 'monthly': return new Date(start.setMonth(start.getMonth() + 1));
        case 'quarterly': return new Date(start.setMonth(start.getMonth() + 3));
        case 'semiannual': return new Date(start.setMonth(start.getMonth() + 6));
        case 'annual': return new Date(start.setFullYear(start.getFullYear() + 1));
        case 'lifetime': return null;
        default: return new Date(start.setMonth(start.getMonth() + 1));
      }
    })() : null;

    const retentionProbability = (() => {
      let baseScore = 70; // Base retention rate
      if (membershipType === 'vip' || membershipType === 'premium') baseScore += 15;
      if (membershipDuration === 'annual') baseScore += 10;
      if (watchedValues.autoRenewal) baseScore += 5;
      if ((fees.monthlyFee || 0) < 100) baseScore += 10; // Competitive pricing
      return Math.min(baseScore, 95);
    })();

    return {
      monthlyRevenue,
      lifetimeValue,
      membershipValue,
      renewalDate,
      retentionProbability
    };
  }, [membershipType, membershipDuration, fees, startDate, endDate, watchedValues.autoRenewal]);

  const handleFormSubmit = async (data: MembershipFormData) => {
    try {
      logger.info('App', 'Creating membership:', data);

      const membershipId = `mem_${Date.now()}`;
      const customerId = `cust_${Date.now()}`;

      // Emit events using ModuleEventBus
      ModuleEventUtils.customer.created(customerId, {
        name: data.memberName,
        email: data.memberEmail,
        phone: data.memberPhone,
        type: 'member',
        membershipId
      });

      ModuleEventUtils.analytics.generated('membership', {
        membershipCreated: data,
        projectedLTV: membershipMetrics.lifetimeValue,
        retentionProbability: membershipMetrics.retentionProbability
      });

      logger.info('App', `[Membership] Member created: ${membershipId}`);

      // If auto-renewal, create billing subscription
      if (data.autoRenewal && data.fees.monthlyFee > 0) {
        ModuleEventUtils.billing.subscriptionCreated(
          `sub_${membershipId}`,
          {
            amount: data.fees.monthlyFee,
            billingType: data.billingCycle,
            description: `${data.membershipType} membership for ${data.memberName}`,
            membershipId
          },
          customerId
        );
      }

    } catch (error) {
      logger.error('App', 'Error creating membership:', error);
    }
  };

  return (
    <ContentLayout spacing="normal">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack gap="lg">

          {/* Real-time Membership Metrics */}
          <FormSection
            title="Métricas de Membresía en Tiempo Real"
            description="Proyecciones de valor y retención del miembro"
          >
            <CardGrid columns={{ base: 2, md: 4 }} gap="md">
              <MetricCard
                title="Valor Mensual"
                value={`$${membershipMetrics.monthlyRevenue.toLocaleString()}`}
                change={membershipMetrics.membershipValue === 'premium' ? 25 :
                       membershipMetrics.membershipValue === 'high' ? 15 : 5}
                icon={CurrencyDollarIcon}
              />
              <MetricCard
                title="Valor de Vida (LTV)"
                value={`$${membershipMetrics.lifetimeValue.toLocaleString()}`}
                change={membershipMetrics.membershipValue === 'enterprise' ? 35 : 20}
                icon={TrendingUpIcon}
              />
              <MetricCard
                title="Retención Estimada"
                value={`${membershipMetrics.retentionProbability}%`}
                change={membershipMetrics.retentionProbability > 80 ? 10 :
                       membershipMetrics.retentionProbability > 70 ? 5 : -5}
                icon={UserIcon}
              />
              <MetricCard
                title="Próxima Renovación"
                value={membershipMetrics.renewalDate ?
                  membershipMetrics.renewalDate.toLocaleDateString() : 'Vitalicia'}
                change={0}
                icon={CalendarIcon}
              />
            </CardGrid>

            <Stack direction="row" gap="sm">
              <Badge
                colorPalette={membershipMetrics.membershipValue === 'premium' || membershipMetrics.membershipValue === 'enterprise' ? 'purple' :
                            membershipMetrics.membershipValue === 'high' ? 'blue' : 'green'}
                variant="subtle"
              >
                {membershipMetrics.membershipValue === 'premium' ? 'Premium' :
                 membershipMetrics.membershipValue === 'enterprise' ? 'Enterprise' :
                 membershipMetrics.membershipValue === 'high' ? 'Alto Valor' : 'Estándar'}
              </Badge>
              <Badge
                colorPalette={membershipMetrics.retentionProbability > 80 ? 'green' :
                            membershipMetrics.retentionProbability > 70 ? 'yellow' : 'red'}
                variant="subtle"
              >
                Retención {membershipMetrics.retentionProbability > 80 ? 'Alta' :
                          membershipMetrics.retentionProbability > 70 ? 'Media' : 'Baja'}
              </Badge>
            </Stack>
          </FormSection>

          {/* Member Information */}
          <FormSection
            title="Información del Miembro"
            description="Datos personales y de contacto"
          >
            <CardGrid columns={{ base: 1, md: 2 }} gap="md">
              <Stack gap="sm">
                <label>Nombre Completo *</label>
                <input
                  {...register('memberName')}
                  placeholder="ej. Juan Carlos Pérez"
                />
                {errors.memberName && (
                  <Alert status="error" size="sm">
                    {errors.memberName.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Email *</label>
                <input
                  type="email"
                  {...register('memberEmail')}
                  placeholder="juan.perez@email.com"
                />
                {errors.memberEmail && (
                  <Alert status="error" size="sm">
                    {errors.memberEmail.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Teléfono *</label>
                <input
                  {...register('memberPhone')}
                  placeholder="+54 9 11 1234-5678"
                />
                {errors.memberPhone && (
                  <Alert status="error" size="sm">
                    {errors.memberPhone.message}
                  </Alert>
                )}
              </Stack>

              <Stack gap="sm">
                <label>Tipo de Membresía</label>
                <select {...register('membershipType')}>
                  <option value="basic">Básica - Acceso estándar</option>
                  <option value="premium">Premium - Beneficios adicionales</option>
                  <option value="vip">VIP - Acceso exclusivo</option>
                  <option value="corporate">Corporativa - Para empresas</option>
                  <option value="family">Familiar - Para toda la familia</option>
                </select>
              </Stack>
            </CardGrid>
          </FormSection>

          {/* Membership Duration & Fees */}
          <FormSection
            title="Duración y Tarifas"
            description="Configuración de período y costos de la membresía"
          >
            <CardGrid columns={{ base: 1, md: 3 }} gap="md">
              <Stack gap="sm">
                <label>Duración de Membresía</label>
                <select {...register('membershipDuration')}>
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="semiannual">Semestral</option>
                  <option value="annual">Anual</option>
                  <option value="lifetime">Vitalicia</option>
                </select>
              </Stack>

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
            </CardGrid>

            <CardGrid columns={{ base: 1, md: 4 }} gap="md">
              <Stack gap="sm">
                <label>Cuota de Inscripción</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('fees.registrationFee', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </Stack>

              <Stack gap="sm">
                <label>Cuota Mensual *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('fees.monthlyFee', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </Stack>

              <Stack gap="sm">
                <label>Mora (% diario)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  {...register('fees.lateFeeRate', { valueAsNumber: true })}
                />
              </Stack>

              <Stack gap="sm">
                <label>Cuota de Cancelación</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('fees.cancellationFee', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </Stack>
            </CardGrid>
          </FormSection>

          {/* Benefits & Access */}
          <FormSection
            title="Beneficios y Acceso"
            description="Servicios incluidos y privilegios del miembro"
          >
            <CardGrid columns={{ base: 1, md: 2 }} gap="md">
              <Stack gap="sm">
                <label>Instalaciones Incluidas</label>
                <Stack gap="xs">
                  <label><input type="checkbox" {...register('benefits.facilityAccess')} value="gym" /> Gimnasio Principal</label>
                  <label><input type="checkbox" {...register('benefits.facilityAccess')} value="pool" /> Piscina</label>
                  <label><input type="checkbox" {...register('benefits.facilityAccess')} value="spa" /> Spa & Wellness</label>
                  <label><input type="checkbox" {...register('benefits.facilityAccess')} value="courts" /> Canchas Deportivas</label>
                  <label><input type="checkbox" {...register('benefits.facilityAccess')} value="classes" /> Clases Grupales</label>
                </Stack>
              </Stack>

              <Stack gap="sm">
                <label>Servicios Adicionales</label>
                <CardGrid columns={{ base: 1, md: 2 }} gap="sm">
                  <Stack gap="sm">
                    <label>Invitados Permitidos</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      {...register('benefits.maxGuests', { valueAsNumber: true })}
                    />
                  </Stack>
                  <Stack gap="sm">
                    <label>Sesiones Entrenador</label>
                    <input
                      type="number"
                      min="0"
                      {...register('benefits.personalTrainerSessions', { valueAsNumber: true })}
                    />
                  </Stack>
                </CardGrid>
                <Stack gap="xs">
                  <label><input type="checkbox" {...register('benefits.specialEvents')} /> Eventos Especiales</label>
                  <label><input type="checkbox" {...register('benefits.lockerRoom')} /> Casillero Incluido</label>
                  <label><input type="checkbox" {...register('benefits.parking')} /> Estacionamiento</label>
                </Stack>
              </Stack>
            </CardGrid>
          </FormSection>

          {/* Billing & Payment */}
          <FormSection
            title="Facturación y Pago"
            description="Configuración de métodos de pago y facturación"
          >
            <CardGrid columns={{ base: 1, md: 3 }} gap="md">
              <Stack gap="sm">
                <label>Método de Pago</label>
                <select {...register('paymentMethod')}>
                  <option value="credit_card">Tarjeta de Crédito</option>
                  <option value="bank_transfer">Transferencia Bancaria</option>
                  <option value="cash">Efectivo</option>
                  <option value="check">Cheque</option>
                </select>
              </Stack>

              <Stack gap="sm">
                <label>Ciclo de Facturación</label>
                <select {...register('billingCycle')}>
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="annual">Anual</option>
                </select>
              </Stack>

              <Stack gap="sm">
                <label>
                  <input type="checkbox" {...register('autoRenewal')} />
                  Renovación Automática
                </label>
                {watchedValues.autoRenewal && (
                  <Alert status="info" size="sm">
                    Se creará una suscripción automática de billing
                  </Alert>
                )}
              </Stack>
            </CardGrid>
          </FormSection>

          {/* Emergency Contact & Health Info */}
          <FormSection
            title="Contacto de Emergencia y Salud"
            description="Información médica y contacto de emergencia"
          >
            <CardGrid columns={{ base: 1, md: 2 }} gap="md">
              <Stack gap="md">
                <Stack gap="sm">
                  <label>Contacto de Emergencia</label>
                  <input
                    {...register('emergencyContact.name')}
                    placeholder="Nombre completo"
                  />
                  <input
                    {...register('emergencyContact.phone')}
                    placeholder="Teléfono"
                  />
                  <input
                    {...register('emergencyContact.relationship')}
                    placeholder="Parentesco"
                  />
                </Stack>
              </Stack>

              <Stack gap="md">
                <Stack gap="sm">
                  <label>Información de Salud</label>
                  <label>
                    <input type="checkbox" {...register('healthInfo.hasHealthConditions')} />
                    Tiene condiciones médicas
                  </label>
                  {watchedValues.healthInfo?.hasHealthConditions && (
                    <>
                      <textarea
                        {...register('healthInfo.conditions')}
                        placeholder="Describe las condiciones médicas..."
                        rows={3}
                      />
                      <textarea
                        {...register('healthInfo.medications')}
                        placeholder="Medicamentos actuales..."
                        rows={2}
                      />
                    </>
                  )}
                  <label>
                    <input type="checkbox" {...register('healthInfo.doctorClearance')} />
                    Aprobación médica para ejercicio
                  </label>
                </Stack>
              </Stack>
            </CardGrid>
          </FormSection>

          {/* Notes */}
          <FormSection
            title="Notas Adicionales"
            description="Comentarios e información adicional"
          >
            <textarea
              {...register('notes')}
              placeholder="Notas especiales, preferencias, restricciones adicionales..."
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
              <Icon as={UserPlusIcon} />
              Crear Membresía
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

export default MembershipFormEnhanced;