/**
 * Staff Form Enhanced - Using ModuleFactory patterns
 * Migrates from custom form to DynamicForm with AnalyticsEngine integration
 */
import React from 'react';
import { z } from 'zod';
import { DynamicForm, type FormSectionConfig } from '@/shared/components/forms';
import { useFormManager } from '@/shared/hooks/business';
import { CRUDHandlers } from '@/shared/utils/errorHandling';
import {
  PerformanceCalculations,
  HRAnalytics,
  type PerformanceMetrics,
  type EmployeeAnalysis
} from '@/business-logic/shared/HRCalculations';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

// Enhanced Staff schema with performance calculations
const StaffSchema = z.object({
  id: z.string().optional(),
  employee_id: z.string().min(1, "El ID de empleado es obligatorio"),
  first_name: z.string().min(1, "El nombre es obligatorio"),
  last_name: z.string().min(1, "El apellido es obligatorio"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  position: z.string().min(1, "La posición es obligatoria"),
  department: z.enum(['kitchen', 'service', 'admin', 'cleaning', 'management']).default('service'),
  hire_date: z.string().min(1, "La fecha de contratación es obligatoria"),
  employment_type: z.enum(['full_time', 'part_time', 'contractor', 'temp']).default('full_time'),
  employment_status: z.enum(['active', 'inactive', 'suspended', 'terminated']).default('active'),
  salary: z.number().min(0, "El salario no puede ser negativo").default(0),
  hourly_rate: z.number().min(0, "La tarifa por hora no puede ser negativa").default(0),
  weekly_hours: z.number().min(1).max(60, "Las horas semanales deben estar entre 1 y 60").default(40),
  shift_preference: z.enum(['morning', 'afternoon', 'night', 'flexible']).default('flexible'),
  role: z.enum(['employee', 'supervisor', 'manager', 'admin']).default('employee'),
  permissions: z.array(z.string()).default([]),
  available_days: z.array(z.string()).default(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  notes: z.string().optional(),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([])
});

type StaffFormData = z.infer<typeof StaffSchema>;

interface StaffFormEnhancedProps {
  employee?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StaffFormEnhanced({ employee, onSuccess, onCancel }: StaffFormEnhancedProps) {
  const isEditMode = !!employee;

  // Form sections configuration using DynamicForm pattern
  const formSections: FormSectionConfig[] = [
    {
      title: "Información Personal",
      description: "Datos personales del empleado",
      fields: [
        {
          name: 'employee_id',
          label: 'ID de Empleado',
          type: 'text',
          placeholder: 'EMP001',
          required: true,
          description: 'Identificador único del empleado'
        },
        {
          name: 'first_name',
          label: 'Nombre',
          type: 'text',
          placeholder: 'Juan',
          required: true
        },
        {
          name: 'last_name',
          label: 'Apellido',
          type: 'text',
          placeholder: 'Pérez',
          required: true
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'juan.perez@restaurant.com',
          required: true,
          gridColumn: '1 / -1'
        },
        {
          name: 'phone',
          label: 'Teléfono',
          type: 'tel',
          placeholder: '+54 11 1234-5678',
          required: true
        }
      ]
    },
    {
      title: "Información Laboral",
      description: "Detalles del puesto y empleo",
      fields: [
        {
          name: 'position',
          label: 'Posición/Cargo',
          type: 'text',
          placeholder: 'Mesero, Cocinero, Gerente...',
          required: true
        },
        {
          name: 'department',
          label: 'Departamento',
          type: 'text', // Would be select in real implementation
          placeholder: 'kitchen, service, admin, cleaning, management'
        },
        {
          name: 'employment_type',
          label: 'Tipo de Empleo',
          type: 'text', // Would be select: full_time, part_time, contractor, temp
          placeholder: 'full_time, part_time, contractor, temp'
        },
        {
          name: 'employment_status',
          label: 'Estado Laboral',
          type: 'text', // Would be select: active, inactive, suspended, terminated
          placeholder: 'active, inactive, suspended, terminated'
        },
        {
          name: 'hire_date',
          label: 'Fecha de Contratación',
          type: 'date',
          required: true
        },
        {
          name: 'role',
          label: 'Nivel de Autoridad',
          type: 'text', // Would be select: employee, supervisor, manager, admin
          placeholder: 'employee, supervisor, manager, admin'
        }
      ]
    },
    {
      title: "Compensación y Horarios",
      description: "Salario, horarios y preferencias de trabajo",
      fields: [
        {
          name: 'salary',
          label: 'Salario Mensual ($)',
          type: 'number',
          placeholder: '2500.00',
          description: 'Salario base mensual'
        },
        {
          name: 'hourly_rate',
          label: 'Tarifa por Hora ($)',
          type: 'number',
          placeholder: '15.50',
          description: 'Para empleados por horas'
        },
        {
          name: 'weekly_hours',
          label: 'Horas Semanales',
          type: 'number',
          placeholder: '40',
          description: 'Horas de trabajo esperadas por semana'
        },
        {
          name: 'shift_preference',
          label: 'Preferencia de Turno',
          type: 'text', // Would be select: morning, afternoon, night, flexible
          placeholder: 'morning, afternoon, night, flexible'
        },
        {
          name: 'available_days',
          label: 'Días Disponibles (separados por coma)',
          type: 'text',
          placeholder: 'monday, tuesday, wednesday, thursday, friday',
          description: 'Días de la semana que puede trabajar',
          gridColumn: '1 / -1'
        }
      ]
    },
    {
      title: "Habilidades y Certificaciones",
      description: "Competencias y certificaciones del empleado",
      fields: [
        {
          name: 'skills',
          label: 'Habilidades (separadas por coma)',
          type: 'text',
          placeholder: 'servicio al cliente, cocina, POS, idiomas...',
          description: 'Habilidades relevantes para el puesto',
          gridColumn: '1 / -1'
        },
        {
          name: 'certifications',
          label: 'Certificaciones (separadas por coma)',
          type: 'text',
          placeholder: 'manipulación de alimentos, primeros auxilios...',
          description: 'Certificaciones oficiales',
          gridColumn: '1 / -1'
        }
      ]
    },
    {
      title: "Contacto de Emergencia",
      description: "Información de contacto de emergencia",
      fields: [
        {
          name: 'emergency_contact_name',
          label: 'Nombre del Contacto',
          type: 'text',
          placeholder: 'María Pérez'
        },
        {
          name: 'emergency_contact_phone',
          label: 'Teléfono de Emergencia',
          type: 'tel',
          placeholder: '+54 11 9876-5432'
        },
        {
          name: 'notes',
          label: 'Notas Adicionales',
          type: 'textarea',
          placeholder: 'Información adicional relevante sobre el empleado...',
          gridColumn: '1 / -1'
        }
      ]
    }
  ];

  // Enhanced form manager with performance calculations
  const { register, errors, watch, submit, isSubmitting } = useFormManager({
    schema: StaffSchema,
    defaultValues: {
      employee_id: employee?.employee_id || '',
      first_name: employee?.first_name || '',
      last_name: employee?.last_name || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      position: employee?.position || '',
      department: employee?.department || 'service',
      hire_date: employee?.hire_date || new Date().toISOString().split('T')[0],
      employment_type: employee?.employment_type || 'full_time',
      employment_status: employee?.employment_status || 'active',
      salary: employee?.salary || 0,
      hourly_rate: employee?.hourly_rate || 0,
      weekly_hours: employee?.weekly_hours || 40,
      shift_preference: employee?.shift_preference || 'flexible',
      role: employee?.role || 'employee',
      permissions: employee?.permissions || [],
      available_days: employee?.available_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      emergency_contact_name: employee?.emergency_contact_name || '',
      emergency_contact_phone: employee?.emergency_contact_phone || '',
      notes: employee?.notes || '',
      skills: employee?.skills || [],
      certifications: employee?.certifications || []
    },
    onSubmit: async (data: StaffFormData) => {
      // Enhanced data with HR calculations
      const enhancedData = await enhanceEmployeeData(data);

      if (isEditMode) {
        await CRUDHandlers.update(
          () => updateEmployee(employee.id, enhancedData),
          'Empleado',
          () => {
            // Emit staff updated event
            ModuleEventUtils.staff.updated(employee.id, enhancedData);
            ModuleEventUtils.analytics.generated('staff', {
              action: 'staff_updated',
              employeeId: employee.id,
              changes: enhancedData
            });
            onSuccess?.();
          }
        );
      } else {
        await CRUDHandlers.create(
          () => createEmployee(enhancedData),
          'Empleado',
          () => {
            // Emit staff created event
            ModuleEventUtils.staff.created(enhancedData.id, enhancedData);
            ModuleEventUtils.analytics.generated('staff', {
              action: 'staff_created',
              employeeData: enhancedData
            });
            onSuccess?.();
          }
        );
      }
    },
    successMessage: {
      title: isEditMode ? 'STAFF_UPDATED' : 'STAFF_CREATED',
      description: `Empleado ${isEditMode ? 'actualizado' : 'creado'} correctamente`
    },
    resetOnSuccess: !isEditMode
  });

  // Watch form values for real-time HR calculations
  const watchedValues = watch();
  const salary = watchedValues.salary || 0;
  const hourlyRate = watchedValues.hourly_rate || 0;
  const weeklyHours = watchedValues.weekly_hours || 40;

  // Real-time HR metrics
  const hrMetrics = React.useMemo(() => {
    if (!salary && !hourlyRate) {
      return {
        monthlyCost: 0,
        yearlyCost: 0,
        effectiveHourlyRate: 0,
        laborBudgetImpact: 0,
        isCompetitiveSalary: false,
        performanceProjection: 0
      };
    }

    const effectiveHourlyRate = hourlyRate || (salary / (weeklyHours * 4.33));
    const monthlyCost = salary || (hourlyRate * weeklyHours * 4.33);
    const yearlyCost = monthlyCost * 12;

    // Labor cost analysis
    const laborBudgetImpact = (monthlyCost / 50000) * 100; // Assuming $50k monthly labor budget
    const isCompetitiveSalary = effectiveHourlyRate >= 12 && effectiveHourlyRate <= 25; // Local market range

    // Performance projection based on compensation
    const compensationScore = Math.min(effectiveHourlyRate / 20, 1); // Normalized to max $20/hr
    const performanceProjection = 60 + (compensationScore * 40); // 60-100% range

    return {
      monthlyCost,
      yearlyCost,
      effectiveHourlyRate,
      laborBudgetImpact,
      isCompetitiveSalary,
      performanceProjection
    };
  }, [salary, hourlyRate, weeklyHours]);

  // Enhance employee data with HR calculations
  const enhanceEmployeeData = async (data: StaffFormData) => {
    return {
      ...data,
      // HR Calculations
      effective_hourly_rate: hrMetrics.effectiveHourlyRate,
      monthly_labor_cost: hrMetrics.monthlyCost,
      yearly_labor_cost: hrMetrics.yearlyCost,
      performance_projection: hrMetrics.performanceProjection,
      compensation_competitiveness: hrMetrics.isCompetitiveSalary ? 'competitive' : 'needs_review',

      // Performance defaults for new employees
      performance_rating: employee?.performance_rating || 85,
      attendance_rate: employee?.attendance_rate || 95,
      completed_tasks: employee?.completed_tasks || 0,

      // Enhanced metadata
      created_at: employee?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),

      // Array processing
      skills: typeof data.skills === 'string'
        ? data.skills.split(',').map(skill => skill.trim()).filter(Boolean)
        : data.skills || [],

      certifications: typeof data.certifications === 'string'
        ? data.certifications.split(',').map(cert => cert.trim()).filter(Boolean)
        : data.certifications || [],

      available_days: typeof data.available_days === 'string'
        ? data.available_days.split(',').map(day => day.trim()).filter(Boolean)
        : data.available_days || [],

      permissions: typeof data.permissions === 'string'
        ? data.permissions.split(',').map(perm => perm.trim()).filter(Boolean)
        : data.permissions || []
    };
  };

  // Mock CRUD operations (would be replaced with real API calls)
  const createEmployee = async (data: any) => {
    console.log('Creating employee:', data);
    return { id: Date.now().toString(), ...data };
  };

  const updateEmployee = async (id: string, data: any) => {
    console.log('Updating employee:', id, data);
    return { id, ...data };
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <DynamicForm<StaffFormData>
        title={isEditMode ? '✏️ Editar Empleado' : '👤 Nuevo Empleado'}
        description="Gestión completa de empleados con análisis de performance automático"
        schema={StaffSchema}
        sections={formSections}
        defaultValues={watchedValues}
        onSubmit={submit as any}
        onCancel={onCancel}
        submitText={isEditMode ? '✅ Actualizar Empleado' : '✅ Crear Empleado'}
        successMessage={{
          title: isEditMode ? 'STAFF_UPDATED' : 'STAFF_CREATED',
          description: `Empleado ${isEditMode ? 'actualizado' : 'creado'} correctamente`
        }}
        resetOnSuccess={!isEditMode}
      />

      {/* Real-time HR Analysis Panel */}
      {(salary > 0 || hourlyRate > 0) && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: 'var(--colors-purple-50)',
          borderRadius: '8px',
          border: '1px solid var(--colors-purple-200)'
        }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--colors-purple-800)' }}>
            📊 Análisis de Recursos Humanos
          </h3>

          {/* Current Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'green' }}>
                ${hrMetrics.monthlyCost.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Costo Mensual</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'blue' }}>
                ${hrMetrics.effectiveHourlyRate.toFixed(2)}/h
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Tarifa Efectiva</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'purple' }}>
                {hrMetrics.laborBudgetImpact.toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Impacto Presup.</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: hrMetrics.isCompetitiveSalary ? 'green' : 'orange' }}>
                {hrMetrics.isCompetitiveSalary ? '✓' : '⚠️'}
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Competitivo</div>
            </div>
          </div>

          {/* Performance Projection */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '8px', color: 'var(--colors-purple-700)', fontSize: '14px' }}>
              💡 Proyección de Performance
            </h4>
            <div style={{
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid var(--colors-gray-200)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '100px',
                  height: '8px',
                  backgroundColor: 'var(--colors-gray-200)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${hrMetrics.performanceProjection}%`,
                    height: '100%',
                    backgroundColor: hrMetrics.performanceProjection >= 80 ? 'green' :
                                   hrMetrics.performanceProjection >= 70 ? 'orange' : 'red',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {hrMetrics.performanceProjection.toFixed(0)}%
                </span>
                <span style={{ fontSize: '12px', color: 'gray' }}>
                  performance esperada
                </span>
              </div>
            </div>
          </div>

          {/* Annual Summary */}
          <div>
            <h4 style={{ marginBottom: '8px', color: 'var(--colors-purple-700)', fontSize: '14px' }}>
              📈 Resumen Anual
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '4px', fontSize: '13px' }}>
                <strong>Costo Anual Total:</strong> ${hrMetrics.yearlyCost.toLocaleString()}
              </div>
              <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '4px', fontSize: '13px' }}>
                <strong>Horas Anuales:</strong> {(weeklyHours * 52).toLocaleString()}h
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}