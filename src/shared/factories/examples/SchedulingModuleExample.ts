/**
 * Scheduling Module Example
 * Generated using ModuleFactory with all validated patterns
 */
import { z } from 'zod';
import { createModule, ModuleTemplates } from '../ModuleFactory';

// Schedule entity schema
const ScheduleSchema = z.object({
  id: z.string(),
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
  weather_factor: z.enum(['none', 'rain', 'holiday', 'event', 'promotion']).default('none'),
  expected_volume: z.enum(['low', 'normal', 'high', 'peak']).default('normal'),
  created_at: z.string(),
  updated_at: z.string().optional(),
  // Calculated fields
  total_hours: z.number().default(0),
  total_cost: z.number().default(0),
  adjusted_cost: z.number().default(0),
  overtime_hours: z.number().default(0),
  overtime_cost: z.number().default(0),
  efficiency_score: z.number().default(85),
  is_overtime_shift: z.boolean().default(false),
  demand_adjusted_cost: z.number().default(0),
  coverage_score: z.number().default(0),
  actual_coverage: z.number().default(1)
});

type Schedule = z.infer<typeof ScheduleSchema>;

// Mock schedule data
const mockSchedules: Schedule[] = [
  {
    id: '1',
    schedule_id: 'SCH001',
    employee_id: 'EMP001',
    employee_name: 'Juan Pérez',
    start_time: '09:00',
    end_time: '17:00',
    date: '2024-01-15',
    position: 'Head Chef',
    department: 'kitchen',
    shift_type: 'mid',
    status: 'confirmed',
    break_minutes: 30,
    notes: 'Responsible for lunch rush preparation',
    priority_level: 'high',
    required_skills: ['culinary_arts', 'team_leadership'],
    coverage_requirements: 2,
    overtime_approved: false,
    hourly_rate: 22.00,
    cost_center: 'KITCHEN_001',
    location: 'Main Kitchen',
    weather_factor: 'none',
    expected_volume: 'high',
    created_at: '2024-01-15T08:00:00Z',
    total_hours: 7.5,
    total_cost: 165.00,
    adjusted_cost: 214.50, // High volume multiplier
    overtime_hours: 0,
    overtime_cost: 0,
    efficiency_score: 95,
    is_overtime_shift: false,
    demand_adjusted_cost: 214.50,
    coverage_score: 100,
    actual_coverage: 2
  },
  {
    id: '2',
    schedule_id: 'SCH002',
    employee_id: 'EMP002',
    employee_name: 'Ana García',
    start_time: '14:00',
    end_time: '22:00',
    date: '2024-01-15',
    position: 'Server',
    department: 'service',
    shift_type: 'closing',
    status: 'scheduled',
    break_minutes: 30,
    notes: 'Evening shift coverage',
    priority_level: 'normal',
    required_skills: ['customer_service', 'pos_systems'],
    coverage_requirements: 3,
    overtime_approved: true,
    hourly_rate: 16.50,
    cost_center: 'SERVICE_001',
    location: 'Main Dining',
    weather_factor: 'none',
    expected_volume: 'normal',
    created_at: '2024-01-15T13:00:00Z',
    total_hours: 7.5,
    total_cost: 123.75,
    adjusted_cost: 123.75, // Normal volume
    overtime_hours: 0,
    overtime_cost: 0,
    efficiency_score: 87,
    is_overtime_shift: false,
    demand_adjusted_cost: 123.75,
    coverage_score: 75,
    actual_coverage: 3
  },
  {
    id: '3',
    schedule_id: 'SCH003',
    employee_id: 'EMP003',
    employee_name: 'Carlos Rodríguez',
    start_time: '06:00',
    end_time: '16:00',
    date: '2024-01-15',
    position: 'Manager',
    department: 'management',
    shift_type: 'double',
    status: 'confirmed',
    break_minutes: 60,
    notes: 'Opening manager - double shift due to coverage needs',
    priority_level: 'critical',
    required_skills: ['leadership', 'operations_management'],
    coverage_requirements: 1,
    overtime_approved: true,
    hourly_rate: 25.00,
    cost_center: 'MGMT_001',
    location: 'Main Floor',
    weather_factor: 'holiday',
    expected_volume: 'peak',
    created_at: '2024-01-15T05:30:00Z',
    total_hours: 9.0,
    total_cost: 225.00,
    adjusted_cost: 360.00, // Peak volume multiplier
    overtime_hours: 1.0,
    overtime_cost: 37.50,
    efficiency_score: 92,
    is_overtime_shift: true,
    demand_adjusted_cost: 397.50, // Including overtime premium
    coverage_score: 100,
    actual_coverage: 1
  }
];

// Create the complete Scheduling module using ModuleFactory
export const SchedulingModule = createModule<Schedule>({
  name: 'scheduling',
  displayName: 'Gestión de Turnos',
  description: 'Sistema completo de gestión de horarios con optimización de costos y análisis de cobertura',
  version: '1.0.0',
  entitySchema: ScheduleSchema,
  entityName: 'Turno',

  // Form configuration using DynamicForm patterns
  formSections: [
    {
      title: 'Información Básica del Turno',
      description: 'Datos principales del horario de trabajo',
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
          type: 'text',
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
        }
      ]
    },
    {
      title: 'Horarios y Tiempo',
      description: 'Configuración de horarios y breaks',
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
          type: 'text',
          placeholder: 'opening, mid, closing, split, double'
        },
        {
          name: 'break_minutes',
          label: 'Minutos de Descanso',
          type: 'number',
          placeholder: '30',
          description: 'Tiempo de break en minutos (máx 120)'
        }
      ]
    },
    {
      title: 'Configuración Laboral',
      description: 'Detalles operacionales del turno',
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
          type: 'text',
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
    }
  ],

  // Data operations
  dataFetcher: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSchedules), 500);
    });
  },

  // Search function
  searchFn: (query: string, schedules: Schedule[]) => {
    return schedules.filter(schedule =>
      schedule.employee_name.toLowerCase().includes(query.toLowerCase()) ||
      schedule.schedule_id.toLowerCase().includes(query.toLowerCase()) ||
      schedule.position.toLowerCase().includes(query.toLowerCase()) ||
      schedule.department.toLowerCase().includes(query.toLowerCase()) ||
      schedule.location?.toLowerCase().includes(query.toLowerCase())
    );
  },

  // CRUD operations
  createFn: async (data: Partial<Schedule>) => {
    // Calculate hours and costs
    const totalMinutes = calculateMinutesBetween(data.start_time || '09:00', data.end_time || '17:00');
    const workingMinutes = totalMinutes - (data.break_minutes || 30);
    const workingHours = workingMinutes / 60;
    const hourlyRate = data.hourly_rate || 15;
    const totalCost = workingHours * hourlyRate;

    // Volume multipliers
    const volumeMultipliers = { low: 0.8, normal: 1.0, high: 1.3, peak: 1.6 };
    const adjustedCost = totalCost * volumeMultipliers[data.expected_volume as keyof typeof volumeMultipliers || 'normal'];

    // Overtime calculation
    const overtimeHours = Math.max(0, workingHours - 8);
    const overtimeCost = overtimeHours * hourlyRate * 1.5;

    const newSchedule: Schedule = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      schedule_id: data.schedule_id || `SCH${Date.now()}`,
      employee_id: data.employee_id || '',
      employee_name: data.employee_name || '',
      start_time: data.start_time || '09:00',
      end_time: data.end_time || '17:00',
      date: data.date || new Date().toISOString().split('T')[0],
      position: data.position || '',
      department: data.department || 'service',
      shift_type: data.shift_type || 'mid',
      status: data.status || 'scheduled',
      break_minutes: data.break_minutes || 30,
      notes: data.notes || '',
      priority_level: data.priority_level || 'normal',
      required_skills: data.required_skills || [],
      coverage_requirements: data.coverage_requirements || 1,
      overtime_approved: data.overtime_approved || false,
      hourly_rate: hourlyRate,
      cost_center: data.cost_center || '',
      location: data.location || '',
      weather_factor: data.weather_factor || 'none',
      expected_volume: data.expected_volume || 'normal',
      // Calculated fields
      total_hours: Number(workingHours.toFixed(2)),
      total_cost: Number(totalCost.toFixed(2)),
      adjusted_cost: Number(adjustedCost.toFixed(2)),
      overtime_hours: Number(overtimeHours.toFixed(2)),
      overtime_cost: Number(overtimeCost.toFixed(2)),
      efficiency_score: 85,
      is_overtime_shift: overtimeHours > 0,
      demand_adjusted_cost: Number((adjustedCost + overtimeCost).toFixed(2)),
      coverage_score: Math.min(100, (data.coverage_requirements || 1) * 25),
      actual_coverage: data.coverage_requirements || 1
    };

    mockSchedules.push(newSchedule);
    return newSchedule;
  },

  updateFn: async (id: string, data: Partial<Schedule>) => {
    const index = mockSchedules.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Schedule not found');

    const updatedSchedule = {
      ...mockSchedules[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    mockSchedules[index] = updatedSchedule;
    return updatedSchedule;
  },

  deleteFn: async (id: string) => {
    const index = mockSchedules.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Schedule not found');
    mockSchedules.splice(index, 1);
  },

  // Analytics configuration
  metricsDefinition: [
    { key: 'total_count', label: 'Total Turnos', format: 'number' },
    { key: 'confirmed_count', label: 'Confirmados', format: 'number', colorPalette: 'green' },
    { key: 'coverage_rate', label: 'Tasa de Cobertura', format: 'percentage', colorPalette: 'blue' },
    { key: 'total_labor_cost', label: 'Costo Laboral Total', format: 'currency', colorPalette: 'purple' },
    { key: 'efficiency_average', label: 'Eficiencia Promedio', format: 'percentage', colorPalette: 'teal' },
    { key: 'overtime_percentage', label: 'Turnos con Overtime', format: 'percentage', colorPalette: 'orange' }
  ],

  // Custom analytics
  analyticsCustomizer: async (schedules: Schedule[]) => {
    const activeSchedules = schedules.filter(s => s.status !== 'cancelled');

    // Coverage analysis
    const coverageStats = {
      fullyStaffed: activeSchedules.filter(s => s.actual_coverage >= s.coverage_requirements).length,
      understaffed: activeSchedules.filter(s => s.actual_coverage < s.coverage_requirements).length,
      overstaffed: activeSchedules.filter(s => s.actual_coverage > s.coverage_requirements).length,
      averageCoverage: activeSchedules.reduce((sum, s) => sum + (s.actual_coverage / s.coverage_requirements * 100), 0) / activeSchedules.length
    };

    // Shift efficiency quadrants
    const shiftQuadrants = {
      optimalShifts: activeSchedules.filter(s =>
        s.actual_coverage >= s.coverage_requirements &&
        s.overtime_hours <= 1 &&
        s.status === 'confirmed'
      ),
      overstaffedShifts: activeSchedules.filter(s =>
        s.actual_coverage > s.coverage_requirements + 1 &&
        s.overtime_hours <= 2
      ),
      understaffedShifts: activeSchedules.filter(s =>
        s.actual_coverage < s.coverage_requirements &&
        s.overtime_hours <= 2
      ),
      problemShifts: activeSchedules.filter(s =>
        (s.actual_coverage < s.coverage_requirements || s.overtime_hours > 2) &&
        s.status !== 'confirmed'
      )
    };

    // Department breakdown
    const departmentBreakdown = activeSchedules.reduce((acc, schedule) => {
      acc[schedule.department] = (acc[schedule.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Cost analysis
    const costAnalysis = {
      totalCost: activeSchedules.reduce((sum, s) => sum + s.total_cost, 0),
      adjustedCost: activeSchedules.reduce((sum, s) => sum + s.adjusted_cost, 0),
      overtimeCost: activeSchedules.reduce((sum, s) => sum + s.overtime_cost, 0),
      averageEfficiency: activeSchedules.reduce((sum, s) => sum + s.efficiency_score, 0) / activeSchedules.length
    };

    // Time slot analysis
    const timeSlotAnalysis = [
      '06:00-08:00', '08:00-10:00', '10:00-12:00', '12:00-14:00',
      '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'
    ].map(timeSlot => {
      const slotsInRange = activeSchedules.filter(s => {
        const [slotStart] = timeSlot.split('-');
        return s.start_time <= slotStart && s.end_time >= slotStart;
      });

      return {
        timeSlot,
        scheduledShifts: slotsInRange.length,
        totalCoverage: slotsInRange.reduce((sum, s) => sum + s.actual_coverage, 0),
        averageEfficiency: slotsInRange.length > 0 ?
          slotsInRange.reduce((sum, s) => sum + s.efficiency_score, 0) / slotsInRange.length : 0
      };
    });

    return {
      coverageStats,
      shiftQuadrants,
      departmentBreakdown,
      costAnalysis,
      timeSlotAnalysis,
      topPerformers: activeSchedules
        .sort((a, b) => b.efficiency_score - a.efficiency_score)
        .slice(0, 5),
      insights: [
        `${activeSchedules.length} turnos programados`,
        `${coverageStats.averageCoverage.toFixed(1)}% cobertura promedio`,
        `${shiftQuadrants.optimalShifts.length} turnos optimizados`,
        `Costo total: $${costAnalysis.totalCost.toLocaleString()}`,
        coverageStats.understaffed > 0 &&
          `⚠️ ${coverageStats.understaffed} turnos con falta de personal`,
        costAnalysis.overtimeCost > costAnalysis.totalCost * 0.15 &&
          `💰 Costos de overtime altos (${((costAnalysis.overtimeCost / costAnalysis.totalCost) * 100).toFixed(1)}%)`
      ].filter(Boolean)
    };
  }
});

// Helper function
function calculateMinutesBetween(start: string, end: string): number {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  return endMinutes - startMinutes;
}

// Export components and hooks for use in the application
export const {
  MainPage: SchedulingPage,
  FormComponent: SchedulingForm,
  ListComponent: SchedulingList,
  AnalyticsComponent: SchedulingAnalytics,
  useEnhanced: useScheduling
} = SchedulingModule;

// Usage examples:
/*
// In a React component:
import { SchedulingPage, useScheduling } from './SchedulingModuleExample';

import { logger } from '@/lib/logging';
function App() {
  return <SchedulingPage />;
}

// Or use individual components:
function CustomSchedulingManagement() {
  const { data, loading, create, update, delete: deleteSchedule } = useScheduling();

  // All the CRUD operations, search, analytics are available
  return (
    <div>
      <SchedulingForm
        onSuccess={() => logger.info('App', 'Schedule created!')}
        onCancel={() => logger.debug('SchedulingModuleExample', 'Cancelled')}
      />
      <SchedulingList />
      <SchedulingAnalytics />
    </div>);
}
*/