/**
 * Scheduling Form Enhanced - Using ModuleFactory patterns
 * Migrates from custom form to DynamicForm with AnalyticsEngine integration
 */
import React from 'react';
import { z } from 'zod';
import { DynamicForm, type FormSectionConfig } from '@/shared/components/forms';
import { useFormManager } from '@/shared/hooks/business';
import { CRUDHandlers } from '@/shared/utils/errorHandling';
// TODO: Implement ShiftOptimization type when business logic is complete
// import type { ShiftOptimization } from '@/business-logic/shared/SchedulingCalculations';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

import { logger } from '@/lib/logging';
// Enhanced Schedule schema with optimization calculations
const ScheduleSchema = z.object({
  id: z.string().optional(),
  schedule_id: z.string().min(1, "El ID de horario es obligatorio"),
  employee_id: z.string().min(1, "El empleado es obligatorio"),
  employee_name: z.string().min(1, "El nombre del empleado es obligatorio"),
  start_time: z.string().min(1, "La hora de inicio es obligatoria"),
  end_time: z.string().min(1, "La hora de fin es obligatoria"),
  date: z.string().min(1, "La fecha es obligatoria"),
  position: z.string().min(1, "La posición es obligatoria"),
  department: z.enum(['kitchen', 'service', 'admin', 'cleaning', 'management']).default('service'),
  shift_type: z.enum(['opening', 'mid', 'closing', 'split', 'double']).default('mid'),
  status: z.enum(['scheduled', 'confirmed', 'missed', 'covered', 'cancelled']).default('scheduled'),
  break_minutes: z.number().min(0).max(120).default(30),
  notes: z.string().optional(),
  priority_level: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  required_skills: z.array(z.string()).default([]),
  coverage_requirements: z.number().min(1).max(10).default(1),
  overtime_approved: z.boolean().default(false),
  hourly_rate: z.number().min(0).default(15),
  cost_center: z.string().optional(),
  location: z.string().optional(),
  // Weather/Event considerations
  weather_factor: z.enum(['none', 'rain', 'holiday', 'event', 'promotion']).default('none'),
  expected_volume: z.enum(['low', 'normal', 'high', 'peak']).default('normal')
});

type ScheduleFormData = z.infer<typeof ScheduleSchema>;

interface SchedulingFormEnhancedProps {
  schedule?: unknown;
  onSuccess?: () => void;
  onCancel?: () => void;
  prefilledDate?: string;
  prefilledEmployee?: string;
}

export function SchedulingFormEnhanced({
  schedule,
  onSuccess,
  onCancel,
  prefilledDate,
  prefilledEmployee
}: SchedulingFormEnhancedProps) {
  const isEditMode = !!schedule;

  // Form sections configuration using DynamicForm pattern
  const formSections: FormSectionConfig[] = [
    {
      title: "Información Básica del Turno",
      description: "Datos principales del horario de trabajo",
      fields: [
        {
          name: 'schedule_id',
          label: 'ID del Turno',
          type: 'text',
          placeholder: 'SCH001',
          required: true,
          description: 'Identificador único del turno'
        },
        {
          name: 'employee_id',
          label: 'ID del Empleado',
          type: 'text', // Would be select in real implementation
          placeholder: 'EMP001',
          required: true
        },
        {
          name: 'employee_name',
          label: 'Nombre del Empleado',
          type: 'text',
          placeholder: 'Juan Pérez',
          required: true
        },
        {
          name: 'date',
          label: 'Fecha',
          type: 'date',
          required: true
        },
        {
          name: 'position',
          label: 'Posición',
          type: 'text',
          placeholder: 'Mesero, Cocinero, Cajero...',
          required: true
        },
        {
          name: 'department',
          label: 'Departamento',
          type: 'text', // Would be select
          placeholder: 'kitchen, service, admin, cleaning, management'
        }
      ]
    },
    {
      title: "Horarios y Tiempo",
      description: "Configuración de horarios y breaks",
      fields: [
        {
          name: 'start_time',
          label: 'Hora de Inicio',
          type: 'time',
          required: true,
          placeholder: '09:00'
        },
        {
          name: 'end_time',
          label: 'Hora de Fin',
          type: 'time',
          required: true,
          placeholder: '17:00'
        },
        {
          name: 'shift_type',
          label: 'Tipo de Turno',
          type: 'text', // Would be select: opening, mid, closing, split, double
          placeholder: 'opening, mid, closing, split, double'
        },
        {
          name: 'break_minutes',
          label: 'Minutos de Descanso',
          type: 'number',
          placeholder: '30',
          description: 'Tiempo de break en minutos (máx 120)'
        },
        {
          name: 'overtime_approved',
          label: 'Tiempo Extra Aprobado',
          type: 'checkbox',
          description: 'Marcar si se aprueba trabajo extra'
        }
      ]
    },
    {
      title: "Configuración Laboral",
      description: "Detalles operacionales del turno",
      fields: [
        {
          name: 'hourly_rate',
          label: 'Tarifa por Hora ($)',
          type: 'number',
          placeholder: '15.00',
          description: 'Tarifa específica para este turno'
        },
        {
          name: 'coverage_requirements',
          label: 'Personal Requerido',
          type: 'number',
          placeholder: '2',
          description: 'Cantidad mínima de personas necesarias'
        },
        {
          name: 'priority_level',
          label: 'Nivel de Prioridad',
          type: 'text', // Would be select: low, normal, high, critical
          placeholder: 'low, normal, high, critical'
        },
        {
          name: 'required_skills',
          label: 'Habilidades Requeridas (separadas por coma)',
          type: 'text',
          placeholder: 'servicio al cliente, POS, cocina...',
          description: 'Habilidades necesarias para el turno',
          gridColumn: '1 / -1'
        }
      ]
    },
    {
      title: "Factores Externos",
      description: "Consideraciones de volumen y eventos",
      fields: [
        {
          name: 'weather_factor',
          label: 'Factor Climático/Evento',
          type: 'text', // Would be select: none, rain, holiday, event, promotion
          placeholder: 'none, rain, holiday, event, promotion'
        },
        {
          name: 'expected_volume',
          label: 'Volumen Esperado',
          type: 'text', // Would be select: low, normal, high, peak
          placeholder: 'low, normal, high, peak'
        },
        {
          name: 'location',
          label: 'Ubicación/Área',
          type: 'text',
          placeholder: 'Salón principal, Terraza, Bar...'
        },
        {
          name: 'cost_center',
          label: 'Centro de Costo',
          type: 'text',
          placeholder: 'CC001'
        }
      ]
    },
    {
      title: "Observaciones",
      description: "Notas adicionales y comentarios",
      fields: [
        {
          name: 'notes',
          label: 'Notas del Turno',
          type: 'textarea',
          placeholder: 'Observaciones adicionales sobre el turno...',
          gridColumn: '1 / -1'
        }
      ]
    }
  ];

  // Enhanced form manager with scheduling calculations
  const { watch, submit } = useFormManager({
    schema: ScheduleSchema,
    defaultValues: {
      schedule_id: schedule?.schedule_id || `SCH${Date.now()}`,
      employee_id: prefilledEmployee || schedule?.employee_id || '',
      employee_name: schedule?.employee_name || '',
      start_time: schedule?.start_time || '09:00',
      end_time: schedule?.end_time || '17:00',
      date: prefilledDate || schedule?.date || new Date().toISOString().split('T')[0],
      position: schedule?.position || '',
      department: schedule?.department || 'service',
      shift_type: schedule?.shift_type || 'mid',
      status: schedule?.status || 'scheduled',
      break_minutes: schedule?.break_minutes || 30,
      notes: schedule?.notes || '',
      priority_level: schedule?.priority_level || 'normal',
      required_skills: schedule?.required_skills || [],
      coverage_requirements: schedule?.coverage_requirements || 1,
      overtime_approved: schedule?.overtime_approved || false,
      hourly_rate: schedule?.hourly_rate || 15,
      cost_center: schedule?.cost_center || '',
      location: schedule?.location || '',
      weather_factor: schedule?.weather_factor || 'none',
      expected_volume: schedule?.expected_volume || 'normal'
    },
    onSubmit: async (data: ScheduleFormData) => {
      // Enhanced data with scheduling calculations
      const enhancedData = await enhanceScheduleData(data);

      if (isEditMode) {
        await CRUDHandlers.update(
          () => updateSchedule(schedule.id, enhancedData),
          'Turno',
          () => {
            // Emit schedule updated event
            ModuleEventUtils.schedule.updated(schedule.id, enhancedData);
            ModuleEventUtils.analytics.generated('scheduling', {
              action: 'schedule_updated',
              scheduleId: schedule.id,
              changes: enhancedData
            });
            onSuccess?.();
          }
        );
      } else {
        await CRUDHandlers.create(
          () => createSchedule(enhancedData),
          'Turno',
          () => {
            // Emit schedule created event
            ModuleEventUtils.schedule.created(enhancedData.id, enhancedData.employee_id, enhancedData);
            ModuleEventUtils.analytics.generated('scheduling', {
              action: 'schedule_created',
              scheduleData: enhancedData
            });
            onSuccess?.();
          }
        );
      }
    },
    successMessage: {
      title: isEditMode ? 'SCHEDULE_UPDATED' : 'SCHEDULE_CREATED',
      description: `Turno ${isEditMode ? 'actualizado' : 'creado'} correctamente`
    },
    resetOnSuccess: !isEditMode
  });

  // Watch form values for real-time scheduling calculations
  const watchedValues = watch();
  const startTime = watchedValues.start_time || '09:00';
  const endTime = watchedValues.end_time || '17:00';
  const hourlyRate = watchedValues.hourly_rate || 15;
  const breakMinutes = watchedValues.break_minutes || 30;

  // Helper function to calculate minutes between times
  const calculateMinutesBetween = React.useCallback((start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;

    // Handle next day scenarios
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    return endMinutes - startMinutes;
  }, []);

  // Real-time scheduling metrics
  const schedulingMetrics = React.useMemo(() => {
    const totalMinutes = calculateMinutesBetween(startTime, endTime);
    const workingMinutes = totalMinutes - breakMinutes;
    const workingHours = workingMinutes / 60;
    const totalCost = workingHours * hourlyRate;

    // Volume multipliers
    const volumeMultipliers = {
      low: 0.8,
      normal: 1.0,
      high: 1.3,
      peak: 1.6
    };

    const expectedVolume = watchedValues.expected_volume || 'normal';
    const adjustedCost = totalCost * volumeMultipliers[expectedVolume as keyof typeof volumeMultipliers];

    // Overtime calculation
    const isOvertime = workingHours > 8;
    const overtimeHours = isOvertime ? workingHours - 8 : 0;
    const overtimeCost = overtimeHours * hourlyRate * 1.5; // 1.5x rate for overtime

    // Efficiency score based on various factors
    const efficiencyFactors = {
      shift_type_score: watchedValues.shift_type === 'split' ? 0.8 : 1.0,
      weather_score: watchedValues.weather_factor === 'rain' ? 0.9 : 1.0,
      priority_boost: watchedValues.priority_level === 'critical' ? 1.2 : 1.0
    };

    const efficiencyScore = Math.min(100,
      85 * efficiencyFactors.shift_type_score *
      efficiencyFactors.weather_score *
      efficiencyFactors.priority_boost
    );

    return {
      totalMinutes,
      workingHours: Number(workingHours.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      adjustedCost: Number(adjustedCost.toFixed(2)),
      isOvertime,
      overtimeHours: Number(overtimeHours.toFixed(2)),
      overtimeCost: Number(overtimeCost.toFixed(2)),
      efficiencyScore: Number(efficiencyScore.toFixed(1)),
      volumeImpact: ((volumeMultipliers[expectedVolume as keyof typeof volumeMultipliers] - 1) * 100).toFixed(0)
    };
  }, [startTime, endTime, hourlyRate, breakMinutes, watchedValues, calculateMinutesBetween]);

  // Enhance schedule data with calculations
  const enhanceScheduleData = async (data: ScheduleFormData) => {
    return {
      ...data,
      // Scheduling calculations
      total_hours: schedulingMetrics.workingHours,
      total_cost: schedulingMetrics.totalCost,
      adjusted_cost: schedulingMetrics.adjustedCost,
      overtime_hours: schedulingMetrics.overtimeHours,
      overtime_cost: schedulingMetrics.overtimeCost,
      efficiency_score: schedulingMetrics.efficiencyScore,
      is_overtime_shift: schedulingMetrics.isOvertime,

      // Business intelligence
      demand_adjusted_cost: schedulingMetrics.adjustedCost,
      coverage_score: Math.min(100, data.coverage_requirements * 25), // Simple coverage scoring

      // Enhanced metadata
      created_at: schedule?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),

      // Array processing
      required_skills: typeof data.required_skills === 'string'
        ? data.required_skills.split(',').map(skill => skill.trim()).filter(Boolean)
        : data.required_skills || []
    };
  };

  // Mock CRUD operations (would be replaced with real API calls)
  const createSchedule = async (data: unknown) => {
    logger.info('API', 'Creating schedule:', data);
    return { id: Date.now().toString(), ...data };
  };

  const updateSchedule = async (id: string, data: unknown) => {
    logger.info('API', 'Updating schedule:', id, data);
    return { id, ...data };
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <DynamicForm<ScheduleFormData>
        title={isEditMode ? '✏️ Editar Turno' : '📅 Nuevo Turno'}
        description="Gestión completa de turnos con optimización de costos automática"
        schema={ScheduleSchema}
        sections={formSections}
        defaultValues={watchedValues}
        onSubmit={submit as (data: unknown) => Promise<void>}
        onCancel={onCancel}
        submitText={isEditMode ? '✅ Actualizar Turno' : '✅ Crear Turno'}
        successMessage={{
          title: isEditMode ? 'SCHEDULE_UPDATED' : 'SCHEDULE_CREATED',
          description: `Turno ${isEditMode ? 'actualizado' : 'creado'} correctamente`
        }}
        resetOnSuccess={!isEditMode}
      />

      {/* Real-time Scheduling Analysis Panel */}
      {(schedulingMetrics.workingHours > 0) && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: 'var(--colors-green-50)',
          borderRadius: '8px',
          border: '1px solid var(--colors-green-200)'
        }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--colors-green-800)' }}>
            📊 Análisis de Turno en Tiempo Real
          </h3>

          {/* Current Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'blue' }}>
                {schedulingMetrics.workingHours}h
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Horas Trabajo</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'green' }}>
                ${schedulingMetrics.totalCost}
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Costo Base</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'purple' }}>
                ${schedulingMetrics.adjustedCost}
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Costo Ajustado</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: schedulingMetrics.efficiencyScore >= 90 ? 'green' : 'orange' }}>
                {schedulingMetrics.efficiencyScore}%
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Eficiencia</div>
            </div>
          </div>

          {/* Overtime Alert */}
          {schedulingMetrics.isOvertime && (
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--colors-orange-100)',
              borderRadius: '6px',
              border: '1px solid var(--colors-orange-300)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>⏰</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--colors-orange-800)' }}>
                    Alerta de Tiempo Extra
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--colors-orange-700)' }}>
                    {schedulingMetrics.overtimeHours}h extra = ${schedulingMetrics.overtimeCost} adicional
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Volume Impact */}
          {schedulingMetrics.volumeImpact !== '0' && (
            <div style={{
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid var(--colors-blue-200)'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--colors-blue-800)' }}>
                💹 Impacto por Volumen: {schedulingMetrics.volumeImpact > '0' ? '+' : ''}{schedulingMetrics.volumeImpact}%
              </div>
              <div style={{ fontSize: '13px', color: 'gray' }}>
                Ajuste de costo por volumen esperado: ${schedulingMetrics.totalCost} → ${schedulingMetrics.adjustedCost}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}