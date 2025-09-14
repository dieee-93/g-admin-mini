// src/features/scheduling/types.ts
// Tipos para gestión de turnos y horarios

export interface Shift {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  status: ShiftStatus;
  break_time?: number; // minutes
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ShiftStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export interface Schedule {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  shifts: Shift[];
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  created_at: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  days_of_week: number[]; // 0-6 (Sunday-Saturday)
  position_id: string;
  max_employees: number;
}

export interface TimeOffRequest {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  type: 'vacation' | 'sick' | 'personal' | 'emergency';
  status: 'pending' | 'approved' | 'denied';
  reason?: string;
  requested_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface ShiftFormData {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  notes?: string;
}