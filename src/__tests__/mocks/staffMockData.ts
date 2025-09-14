/**
 * Mock Data for Staff Module E2E Tests
 * Comprehensive test data covering all staff-related entities
 */

import type { Employee, Schedule, TimeEntry } from '@/store/staffStore';
import type { Shift, ShiftTemplate } from '@/pages/admin/resources/scheduling/types';

// Mock Staff Data
export const mockStaffData: Employee[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@restaurant.com',
    phone: '+34 600 123 456',
    department: 'Cocina',
    position: 'Chef Ejecutivo',
    hourly_rate: 25.0,
    hire_date: '2023-01-15',
    status: 'active',
    skills: ['Cocina Mediterránea', 'Gestión de Equipo', 'Control de Costos'],
    performance_rating: 4.5,
    emergency_contact_name: 'María Pérez',
    emergency_contact_phone: '+34 600 987 654',
    address: 'Calle Mayor 123, Madrid',
    birth_date: '1985-05-20',
    contract_type: 'full_time',
    created_at: '2023-01-15T08:00:00Z',
    updated_at: '2024-01-08T10:30:00Z'
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria.garcia@restaurant.com',
    phone: '+34 600 234 567',
    department: 'Servicio',
    position: 'Jefa de Sala',
    hourly_rate: 20.0,
    hire_date: '2023-03-01',
    status: 'active',
    skills: ['Atención al Cliente', 'Gestión de Reservas', 'Vinos'],
    performance_rating: 4.2,
    emergency_contact_name: 'Carlos García',
    emergency_contact_phone: '+34 600 876 543',
    address: 'Avenida de la Paz 45, Madrid',
    birth_date: '1990-08-15',
    contract_type: 'full_time',
    created_at: '2023-03-01T09:00:00Z',
    updated_at: '2024-01-05T14:20:00Z'
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@restaurant.com',
    phone: '+34 600 345 678',
    department: 'Cocina',
    position: 'Sous Chef',
    hourly_rate: 22.0,
    hire_date: '2023-06-15',
    status: 'active',
    skills: ['Cocina Internacional', 'Preparación Fría', 'Panadería'],
    performance_rating: 4.0,
    emergency_contact_name: 'Ana Rodríguez',
    emergency_contact_phone: '+34 600 765 432',
    address: 'Plaza España 12, Madrid',
    birth_date: '1988-11-30',
    contract_type: 'full_time',
    created_at: '2023-06-15T07:30:00Z',
    updated_at: '2024-01-03T16:45:00Z'
  },
  {
    id: '4',
    name: 'Ana López',
    email: 'ana.lopez@restaurant.com',
    phone: '+34 600 456 789',
    department: 'Administración',
    position: 'Contadora',
    hourly_rate: 24.0,
    hire_date: '2022-11-01',
    status: 'active',
    skills: ['Contabilidad', 'Nóminas', 'Análisis Financiero'],
    performance_rating: 4.8,
    emergency_contact_name: 'Miguel López',
    emergency_contact_phone: '+34 600 654 321',
    address: 'Calle Serrano 78, Madrid',
    birth_date: '1992-02-28',
    contract_type: 'full_time',
    created_at: '2022-11-01T08:15:00Z',
    updated_at: '2024-01-07T11:20:00Z'
  },
  {
    id: '5',
    name: 'David Martín',
    email: 'david.martin@restaurant.com',
    phone: '+34 600 567 890',
    department: 'Servicio',
    position: 'Camarero Senior',
    hourly_rate: 18.0,
    hire_date: '2023-09-01',
    status: 'active',
    skills: ['Servicio de Mesa', 'Caja', 'Idiomas'],
    performance_rating: 3.8,
    emergency_contact_name: 'Laura Martín',
    emergency_contact_phone: '+34 600 543 210',
    address: 'Calle Alcalá 156, Madrid',
    birth_date: '1995-07-12',
    contract_type: 'part_time',
    created_at: '2023-09-01T10:00:00Z',
    updated_at: '2024-01-06T09:30:00Z'
  },
  {
    id: '6',
    name: 'Elena Ruiz',
    email: 'elena.ruiz@restaurant.com',
    phone: '+34 600 678 901',
    department: 'Limpieza',
    position: 'Encargada de Limpieza',
    hourly_rate: 15.0,
    hire_date: '2023-04-15',
    status: 'active',
    skills: ['Limpieza Profunda', 'Desinfección', 'Gestión de Suministros'],
    performance_rating: 4.3,
    emergency_contact_name: 'José Ruiz',
    emergency_contact_phone: '+34 600 432 109',
    address: 'Calle Bravo Murillo 89, Madrid',
    birth_date: '1980-12-05',
    contract_type: 'full_time',
    created_at: '2023-04-15T06:45:00Z',
    updated_at: '2024-01-04T12:15:00Z'
  }
];

// Mock Schedule Data
export const mockScheduleData: Schedule[] = [
  {
    id: '1',
    employee_id: '1',
    start_time: '2024-01-08T08:00:00Z',
    end_time: '2024-01-08T16:00:00Z',
    break_minutes: 60,
    status: 'scheduled',
    notes: 'Turno de mañana - Chef principal',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  },
  {
    id: '2',
    employee_id: '2',
    start_time: '2024-01-08T12:00:00Z',
    end_time: '2024-01-08T22:00:00Z',
    break_minutes: 60,
    status: 'scheduled',
    notes: 'Turno de almuerzo y cena',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  },
  {
    id: '3',
    employee_id: '3',
    start_time: '2024-01-08T14:00:00Z',
    end_time: '2024-01-08T23:00:00Z',
    break_minutes: 60,
    status: 'scheduled',
    notes: 'Turno de tarde',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  },
  {
    id: '4',
    employee_id: '4',
    start_time: '2024-01-08T09:00:00Z',
    end_time: '2024-01-08T17:00:00Z',
    break_minutes: 60,
    status: 'scheduled',
    notes: 'Horario administrativo',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  }
];

// Mock Time Entry Data
export const mockTimeEntryData: TimeEntry[] = [
  {
    id: '1',
    employee_id: '1',
    clock_in: '2024-01-08T07:55:00Z',
    clock_out: '2024-01-08T16:10:00Z',
    break_minutes: 60,
    total_hours: 7.25,
    notes: 'Llegó 5 minutos antes',
    created_at: '2024-01-08T07:55:00Z',
    updated_at: '2024-01-08T16:10:00Z'
  },
  {
    id: '2',
    employee_id: '2',
    clock_in: '2024-01-08T12:00:00Z',
    clock_out: null, // Still working
    break_minutes: 0,
    total_hours: 0,
    notes: 'Turno en curso',
    created_at: '2024-01-08T12:00:00Z',
    updated_at: '2024-01-08T12:00:00Z'
  },
  {
    id: '3',
    employee_id: '3',
    clock_in: '2024-01-08T14:05:00Z',
    clock_out: null, // Still working
    break_minutes: 0,
    total_hours: 0,
    notes: 'Llegó 5 minutos tarde',
    created_at: '2024-01-08T14:05:00Z',
    updated_at: '2024-01-08T14:05:00Z'
  }
];

// Mock Shift Data for Scheduling
export const mockShiftsData: Shift[] = [
  {
    id: '1',
    employee_id: '1',
    date: '2024-01-08',
    start_time: '08:00',
    end_time: '16:00',
    position: 'Chef Ejecutivo',
    status: 'scheduled',
    notes: 'Turno de mañana',
    employee_name: 'Juan Pérez',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  },
  {
    id: '2',
    employee_id: '2',
    date: '2024-01-08',
    start_time: '12:00',
    end_time: '22:00',
    position: 'Jefa de Sala',
    status: 'scheduled',
    notes: 'Turno completo',
    employee_name: 'María García',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  },
  {
    id: '3',
    employee_id: '3',
    date: '2024-01-08',
    start_time: '14:00',
    end_time: '23:00',
    position: 'Sous Chef',
    status: 'scheduled',
    notes: 'Turno de tarde',
    employee_name: 'Carlos Rodríguez',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  }
];

// Mock Performance Data
export const mockPerformanceData = [
  {
    employee_id: '1',
    employee_name: 'Juan Pérez',
    department: 'Cocina',
    data: [
      {
        month: '2024-01',
        total_hours: 160,
        efficiency_score: 92,
        quality_score: 95,
        punctuality_score: 98,
        customer_satisfaction: 4.8,
        goals_completed: 8,
        goals_total: 10
      },
      {
        month: '2023-12',
        total_hours: 165,
        efficiency_score: 90,
        quality_score: 93,
        punctuality_score: 95,
        customer_satisfaction: 4.7,
        goals_completed: 7,
        goals_total: 9
      }
    ]
  },
  {
    employee_id: '2',
    employee_name: 'María García',
    department: 'Servicio',
    data: [
      {
        month: '2024-01',
        total_hours: 155,
        efficiency_score: 88,
        quality_score: 91,
        punctuality_score: 96,
        customer_satisfaction: 4.6,
        goals_completed: 6,
        goals_total: 8
      }
    ]
  }
];

// Mock Labor Cost Data
export const mockLaborCostData = [
  {
    employee_id: '1',
    employee_name: 'Juan Pérez',
    department: 'Cocina',
    regular_hours: 40,
    overtime_hours: 5,
    regular_cost: 1000,
    overtime_cost: 187.5,
    total_cost: 1187.5,
    hourly_rate: 25.0
  },
  {
    employee_id: '2',
    employee_name: 'María García',
    department: 'Servicio',
    regular_hours: 38,
    overtime_hours: 2,
    regular_cost: 760,
    overtime_cost: 60,
    total_cost: 820,
    hourly_rate: 20.0
  },
  {
    employee_id: '3',
    employee_name: 'Carlos Rodríguez',
    department: 'Cocina',
    regular_hours: 40,
    overtime_hours: 3,
    regular_cost: 880,
    overtime_cost: 99,
    total_cost: 979,
    hourly_rate: 22.0
  }
];

// Mock Departments Data
export const mockDepartmentsData = [
  {
    id: 'cocina',
    name: 'Cocina',
    employee_count: 8,
    avg_hourly_rate: 23.5,
    budget_monthly: 15000,
    manager_id: '1'
  },
  {
    id: 'servicio',
    name: 'Servicio',
    employee_count: 12,
    avg_hourly_rate: 19.0,
    budget_monthly: 18000,
    manager_id: '2'
  },
  {
    id: 'administracion',
    name: 'Administración',
    employee_count: 3,
    avg_hourly_rate: 25.0,
    budget_monthly: 8000,
    manager_id: '4'
  },
  {
    id: 'limpieza',
    name: 'Limpieza',
    employee_count: 4,
    avg_hourly_rate: 15.5,
    budget_monthly: 5000,
    manager_id: '6'
  }
];

// Mock Shift Templates
export const mockShiftTemplates: ShiftTemplate[] = [
  {
    id: '1',
    name: 'Turno Mañana Cocina',
    start_time: '08:00',
    end_time: '16:00',
    position_id: 'chef',
    days_of_week: [1, 2, 3, 4, 5], // Monday to Friday
    max_employees: 3,
    min_employees: 2,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Turno Tarde Servicio',
    start_time: '14:00',
    end_time: '23:00',
    position_id: 'waiter',
    days_of_week: [1, 2, 3, 4, 5, 6, 0], // All days
    max_employees: 4,
    min_employees: 2,
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Mock Alert Data
export const mockAlertsData = [
  {
    id: 'alert_1',
    type: 'overtime_approaching' as const,
    severity: 'warning' as const,
    employee_id: '1',
    employee_name: 'Juan Pérez',
    department: 'Cocina',
    message: 'Juan Pérez está aproximándose al límite de overtime (7.5h trabajadas)',
    current_value: 7.5,
    threshold_value: 8.0,
    timestamp: '2024-01-08T15:30:00Z'
  },
  {
    id: 'alert_2',
    type: 'budget_exceeded' as const,
    severity: 'critical' as const,
    message: 'Los costos laborales semanales han excedido el presupuesto en un 12%',
    current_value: 5600,
    threshold_value: 5000,
    timestamp: '2024-01-08T14:00:00Z'
  }
];

// Helper functions for creating test scenarios

/**
 * Create overtime scenario data
 */
export function createOvertimeScenario() {
  return {
    ...mockStaffData[0],
    current_hours: 8.5,
    overtime_status: 'in_overtime' as const,
    current_cost: 231.25,
    projected_cost: 250.0
  };
}

/**
 * Create budget alert scenario data
 */
export function createBudgetAlertScenario() {
  return {
    weekly_budget: 5000,
    current_cost: 5600,
    variance: 600,
    variance_percentage: 12
  };
}

/**
 * Create understaffed scenario data
 */
export function createUnderstaffedScenario() {
  return {
    date: '2024-01-08',
    department: 'Servicio',
    required_staff: 4,
    scheduled_staff: 2,
    shortage: 2
  };
}

/**
 * Create large dataset for performance testing
 */
export function createLargeStaffDataset(size: number = 500): Employee[] {
  return Array.from({ length: size }, (_, i) => ({
    id: `emp_${i}`,
    name: `Employee ${i}`,
    email: `emp${i}@restaurant.com`,
    phone: `+34 600 ${String(i).padStart(6, '0')}`,
    department: ['Cocina', 'Servicio', 'Administración', 'Limpieza'][i % 4],
    position: ['Chef', 'Camarero', 'Administrador', 'Limpieza'][i % 4],
    hourly_rate: 15 + (i % 20),
    hire_date: `2023-${String((i % 12) + 1).padStart(2, '0')}-01`,
    status: i % 10 === 0 ? 'inactive' : 'active',
    skills: [`Skill ${i % 10}`, `Skill ${(i + 1) % 10}`],
    performance_rating: 3.0 + (i % 3),
    emergency_contact_name: `Contact ${i}`,
    emergency_contact_phone: `+34 700 ${String(i).padStart(6, '0')}`,
    address: `Street ${i}, City`,
    birth_date: `198${i % 10}-01-01`,
    contract_type: i % 3 === 0 ? 'part_time' : 'full_time',
    created_at: `2023-01-0${(i % 9) + 1}T00:00:00Z`,
    updated_at: `2024-01-0${(i % 9) + 1}T00:00:00Z`
  }));
}

// Export all mock data
export const mockData = {
  staff: mockStaffData,
  schedules: mockScheduleData,
  timeEntries: mockTimeEntryData,
  shifts: mockShiftsData,
  performance: mockPerformanceData,
  laborCosts: mockLaborCostData,
  departments: mockDepartmentsData,
  shiftTemplates: mockShiftTemplates,
  alerts: mockAlertsData
};

export default mockData;