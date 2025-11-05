/**
 * Staff Module Example
 * Generated using ModuleFactory with all validated patterns
 */
import { z } from 'zod';
import { createModule, ModuleTemplates } from '../ModuleFactory';

// Staff entity schema
const StaffSchema = z.object({
  id: z.string(),
  employee_id: z.string().min(1, "El ID de empleado es obligatorio"),
  first_name: z.string().min(1, "El nombre es obligatorio"),
  last_name: z.string().min(1, "El apellido es obligatorio"),
  name: z.string().optional(), // Computed field
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
  certifications: z.array(z.string()).default([]),
  created_at: z.string(),
  updated_at: z.string().optional(),
  // Performance metrics
  performance_rating: z.number().min(0).max(100).default(85),
  attendance_rate: z.number().min(0).max(100).default(95),
  completed_tasks: z.number().default(0),
  last_review_date: z.string().optional(),
  // Calculated fields
  effective_hourly_rate: z.number().default(0),
  monthly_labor_cost: z.number().default(0),
  yearly_labor_cost: z.number().default(0),
  performance_projection: z.number().default(0),
  compensation_competitiveness: z.enum(['competitive', 'below_market', 'above_market']).default('competitive')
});

type Staff = z.infer<typeof StaffSchema>;

// Mock staff data
const mockStaff: Staff[] = [
  {
    id: '1',
    employee_id: 'EMP001',
    first_name: 'Juan',
    last_name: 'Pérez',
    name: 'Juan Pérez',
    email: 'juan.perez@restaurant.com',
    phone: '+54 11 1234-5678',
    position: 'Head Chef',
    department: 'kitchen',
    hire_date: '2023-01-15',
    employment_type: 'full_time',
    employment_status: 'active',
    salary: 3500,
    hourly_rate: 0,
    weekly_hours: 45,
    shift_preference: 'morning',
    role: 'supervisor',
    permissions: ['kitchen_management', 'inventory_access'],
    available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    emergency_contact_name: 'María Pérez',
    emergency_contact_phone: '+54 11 9876-5432',
    skills: ['culinary_arts', 'team_leadership', 'menu_planning'],
    certifications: ['food_safety', 'haccp'],
    created_at: '2023-01-15T10:00:00Z',
    performance_rating: 92,
    attendance_rate: 98,
    completed_tasks: 147,
    last_review_date: '2024-01-15T10:00:00Z',
    effective_hourly_rate: 20.19,
    monthly_labor_cost: 3500,
    yearly_labor_cost: 42000,
    performance_projection: 94,
    compensation_competitiveness: 'competitive'
  },
  {
    id: '2',
    employee_id: 'EMP002',
    first_name: 'Ana',
    last_name: 'García',
    name: 'Ana García',
    email: 'ana.garcia@restaurant.com',
    phone: '+54 11 2345-6789',
    position: 'Server',
    department: 'service',
    hire_date: '2023-03-10',
    employment_type: 'part_time',
    employment_status: 'active',
    salary: 0,
    hourly_rate: 15.50,
    weekly_hours: 25,
    shift_preference: 'afternoon',
    role: 'employee',
    permissions: ['pos_access'],
    available_days: ['wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    emergency_contact_name: 'Carlos García',
    emergency_contact_phone: '+54 11 8765-4321',
    skills: ['customer_service', 'pos_systems'],
    certifications: ['responsible_service'],
    created_at: '2023-03-10T14:30:00Z',
    performance_rating: 87,
    attendance_rate: 94,
    completed_tasks: 89,
    last_review_date: '2024-03-10T14:30:00Z',
    effective_hourly_rate: 15.50,
    monthly_labor_cost: 1674,
    yearly_labor_cost: 20088,
    performance_projection: 85,
    compensation_competitiveness: 'competitive'
  },
  {
    id: '3',
    employee_id: 'EMP003',
    first_name: 'Carlos',
    last_name: 'Rodríguez',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@restaurant.com',
    phone: '+54 11 3456-7890',
    position: 'Manager',
    department: 'management',
    hire_date: '2022-08-01',
    employment_type: 'full_time',
    employment_status: 'active',
    salary: 4500,
    hourly_rate: 0,
    weekly_hours: 50,
    shift_preference: 'flexible',
    role: 'manager',
    permissions: ['full_access', 'staff_management', 'financial_reports'],
    available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    emergency_contact_name: 'Laura Rodríguez',
    emergency_contact_phone: '+54 11 7654-3210',
    skills: ['leadership', 'operations_management', 'financial_analysis'],
    certifications: ['management_certification', 'food_safety'],
    created_at: '2022-08-01T09:00:00Z',
    performance_rating: 95,
    attendance_rate: 99,
    completed_tasks: 234,
    last_review_date: '2024-08-01T09:00:00Z',
    effective_hourly_rate: 20.77,
    monthly_labor_cost: 4500,
    yearly_labor_cost: 54000,
    performance_projection: 96,
    compensation_competitiveness: 'competitive'
  }
];

// Create the complete Staff module using ModuleFactory
export const StaffModule = createModule<Staff>({
  name: 'staff',
  displayName: 'Gestión de Personal',
  description: 'Sistema completo de gestión de empleados con análisis de performance y costos laborales',
  version: '1.0.0',
  entitySchema: StaffSchema,
  entityName: 'Empleado',

  // Form configuration using DynamicForm patterns
  formSections: [
    {
      title: 'Información Personal',
      description: 'Datos personales del empleado',
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
      title: 'Información Laboral',
      description: 'Detalles del puesto y empleo',
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
          type: 'text',
          placeholder: 'full_time, part_time, contractor, temp'
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
          type: 'text',
          placeholder: 'employee, supervisor, manager, admin'
        }
      ]
    },
    {
      title: 'Compensación y Horarios',
      description: 'Salario, horarios y preferencias de trabajo',
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
          type: 'text',
          placeholder: 'morning, afternoon, night, flexible'
        }
      ]
    },
    {
      title: 'Habilidades y Certificaciones',
      description: 'Competencias y certificaciones del empleado',
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
    }
  ],

  // Data operations
  dataFetcher: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockStaff), 500);
    });
  },

  // Search function
  searchFn: (query: string, staff: Staff[]) => {
    return staff.filter(emp =>
      emp.first_name.toLowerCase().includes(query.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(query.toLowerCase()) ||
      emp.email.toLowerCase().includes(query.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(query.toLowerCase()) ||
      emp.position.toLowerCase().includes(query.toLowerCase()) ||
      emp.department.toLowerCase().includes(query.toLowerCase())
    );
  },

  // CRUD operations
  createFn: async (data: Partial<Staff>) => {
    const newEmployee: Staff = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      name: `${data.first_name} ${data.last_name}`,
      performance_rating: 85,
      attendance_rate: 95,
      completed_tasks: 0,
      effective_hourly_rate: data.hourly_rate || (data.salary! / (data.weekly_hours! * 4.33)),
      monthly_labor_cost: data.salary || (data.hourly_rate! * data.weekly_hours! * 4.33),
      yearly_labor_cost: (data.salary || (data.hourly_rate! * data.weekly_hours! * 4.33)) * 12,
      performance_projection: 85,
      compensation_competitiveness: 'competitive',
      employee_id: data.employee_id || `EMP${Date.now()}`,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
      phone: data.phone || '',
      position: data.position || '',
      department: data.department || 'service',
      hire_date: data.hire_date || new Date().toISOString().split('T')[0],
      employment_type: data.employment_type || 'full_time',
      employment_status: data.employment_status || 'active',
      salary: data.salary || 0,
      hourly_rate: data.hourly_rate || 0,
      weekly_hours: data.weekly_hours || 40,
      shift_preference: data.shift_preference || 'flexible',
      role: data.role || 'employee',
      permissions: data.permissions || [],
      available_days: data.available_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      emergency_contact_name: data.emergency_contact_name || '',
      emergency_contact_phone: data.emergency_contact_phone || '',
      notes: data.notes || '',
      skills: data.skills || [],
      certifications: data.certifications || []
    };

    mockStaff.push(newEmployee);
    return newEmployee;
  },

  updateFn: async (id: string, data: Partial<Staff>) => {
    const index = mockStaff.findIndex(emp => emp.id === id);
    if (index === -1) throw new Error('Employee not found');

    const updatedEmployee = {
      ...mockStaff[index],
      ...data,
      name: `${data.first_name || mockStaff[index].first_name} ${data.last_name || mockStaff[index].last_name}`,
      updated_at: new Date().toISOString()
    };

    mockStaff[index] = updatedEmployee;
    return updatedEmployee;
  },

  deleteFn: async (id: string) => {
    const index = mockStaff.findIndex(emp => emp.id === id);
    if (index === -1) throw new Error('Employee not found');
    mockStaff.splice(index, 1);
  },

  // Analytics configuration
  metricsDefinition: [
    { key: 'total_count', label: 'Total Empleados', format: 'number' },
    { key: 'active_count', label: 'Activos', format: 'number', colorPalette: 'green' },
    { key: 'average_performance', label: 'Performance Promedio', format: 'percentage', colorPalette: 'blue' },
    { key: 'total_labor_cost', label: 'Costo Laboral Total', format: 'currency', colorPalette: 'purple' },
    { key: 'retention_rate', label: 'Tasa de Retención', format: 'percentage', colorPalette: 'teal' }
  ],

  // Custom analytics
  analyticsCustomizer: async (staff: Staff[]) => {
    const activeStaff = staff.filter(emp => emp.employment_status === 'active');

    // Department breakdown
    const departmentBreakdown = staff.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Performance analysis
    const performanceStats = {
      highPerformers: activeStaff.filter(emp => emp.performance_rating >= 90).length,
      averagePerformers: activeStaff.filter(emp => emp.performance_rating >= 75 && emp.performance_rating < 90).length,
      lowPerformers: activeStaff.filter(emp => emp.performance_rating < 75).length,
      averagePerformance: activeStaff.reduce((sum, emp) => sum + emp.performance_rating, 0) / activeStaff.length
    };

    // Cost analysis
    const costAnalysis = {
      totalLaborCost: activeStaff.reduce((sum, emp) => sum + emp.monthly_labor_cost, 0),
      averageHourlyRate: activeStaff.reduce((sum, emp) => sum + (emp.hourly_rate || emp.effective_hourly_rate), 0) / activeStaff.length,
      highestPaid: Math.max(...activeStaff.map(emp => emp.monthly_labor_cost)),
      lowestPaid: Math.min(...activeStaff.map(emp => emp.monthly_labor_cost))
    };

    // Performance Matrix (9-Box Grid)
    const performanceMatrix = {
      highPerformance: activeStaff.filter(emp => emp.performance_rating >= 85 && emp.attendance_rate >= 95),
      solidContributors: activeStaff.filter(emp => emp.performance_rating >= 75 && emp.performance_rating < 85),
      developingTalent: activeStaff.filter(emp => emp.performance_rating >= 65 && emp.performance_rating < 75),
      performanceConcerns: activeStaff.filter(emp => emp.performance_rating < 65 || emp.attendance_rate < 85)
    };

    return {
      departmentBreakdown,
      performanceStats,
      costAnalysis,
      performanceMatrix,
      topPerformers: activeStaff
        .sort((a, b) => b.performance_rating - a.performance_rating)
        .slice(0, 5),
      insights: [
        `${activeStaff.length} empleados activos de ${staff.length} total`,
        `Performance promedio: ${performanceStats.averagePerformance.toFixed(1)}%`,
        `${performanceStats.highPerformers} empleados de alto rendimiento`,
        `Costo laboral total: $${costAnalysis.totalLaborCost.toLocaleString()}/mes`,
        performanceStats.lowPerformers > 0 &&
          `⚠️ ${performanceStats.lowPerformers} empleados requieren mejora de performance`,
        costAnalysis.totalLaborCost > 50000 &&
          `💰 Costo laboral alto - revisar optimización`
      ].filter(Boolean)
    };
  }
});

// Export components and hooks for use in the application
export const {
  MainPage: StaffPage,
  FormComponent: StaffForm,
  ListComponent: StaffList,
  AnalyticsComponent: StaffAnalytics,
  useEnhanced: useStaff
} = StaffModule;

// Usage examples:
/*
// In a React component:
import { StaffPage, useStaff } from './StaffModuleExample';

import { logger } from '@/lib/logging';
function App() {
  return <StaffPage />;
}

// Or use individual components:
function CustomStaffManagement() {
  const { data, loading, create, update, delete: deleteEmployee } = useStaff();

  // All the CRUD operations, search, analytics are available
  return (
    <div>
      <StaffForm
        onSuccess={() => logger.info('App', 'Employee created!')}
        onCancel={() => logger.debug('StaffModuleExample', 'Cancelled')}
      />
      <StaffList />
      <StaffAnalytics />
    </div>);
}
*/