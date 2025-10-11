// schedulingStore.ts - Zustand Store para Scheduling Module
// Compatible con G-Admin Mini v2.1 Architecture

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ✅ TYPES
export interface Shift {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
  updated_at: string;
  notes?: string;
  hourly_rate?: number;
}

export interface TimeOffRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  start_date: string;
  end_date: string;
  type: 'vacation' | 'sick' | 'personal' | 'emergency';
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  hourly_rate: number;
  max_weekly_hours: number;
  availability: string[];
  status: 'active' | 'inactive' | 'vacation';
  phone?: string;
  email?: string;
}

export interface LaborRates {
  [position: string]: number;
}

export interface SchedulingStats {
  total_shifts_this_week: number;
  employees_scheduled: number;
  coverage_percentage: number;
  pending_time_off: number;
  labor_cost_this_week: number;
  overtime_hours: number;
  understaffed_shifts: number;
  approved_requests: number;
}

// ✅ STORE STATE
interface SchedulingState {
  // Data
  shifts: Shift[];
  timeOffRequests: TimeOffRequest[];
  employees: Employee[];
  laborRates: LaborRates;
  stats: SchedulingStats | null;

  // UI State
  loading: boolean;
  error: string | null;
  selectedWeek: Date;
  activeTab: string;
  filters: {
    position?: string;
    employee?: string;
    status?: string;
  };

  // Actions
  setShifts: (shifts: Shift[]) => void;
  addShift: (shift: Shift) => void;
  updateShift: (id: string, updates: Partial<Shift>) => void;
  removeShift: (id: string) => void;

  setTimeOffRequests: (requests: TimeOffRequest[]) => void;
  addTimeOffRequest: (request: TimeOffRequest) => void;
  updateTimeOffRequest: (id: string, updates: Partial<TimeOffRequest>) => void;

  setEmployees: (employees: Employee[]) => void;
  setLaborRates: (rates: LaborRates) => void;
  setStats: (stats: SchedulingStats) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedWeek: (week: Date) => void;
  setActiveTab: (tab: string) => void;
  setFilters: (filters: Partial<SchedulingState['filters']>) => void;

  // Computed
  getShiftsByWeek: (week: Date) => Shift[];
  getEmployeeById: (id: string) => Employee | undefined;
  calculateWeeklyStats: (week: Date) => Partial<SchedulingStats>;
}

// ✅ INITIAL STATE
const initialState = {
  shifts: [],
  timeOffRequests: [],
  employees: [],
  laborRates: {},
  stats: null,
  loading: false,
  error: null,
  selectedWeek: new Date(),
  activeTab: 'schedule',
  filters: {}
};

// ✅ STORE IMPLEMENTATION
export const useSchedulingStore = create<SchedulingState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Shifts Actions
      setShifts: (shifts) => set({ shifts }),

      addShift: (shift) => set((state) => ({
        shifts: [...state.shifts, shift]
      })),

      updateShift: (id, updates) => set((state) => ({
        shifts: state.shifts.map(shift =>
          shift.id === id ? { ...shift, ...updates } : shift
        )
      })),

      removeShift: (id) => set((state) => ({
        shifts: state.shifts.filter(shift => shift.id !== id)
      })),

      // Time Off Actions
      setTimeOffRequests: (timeOffRequests) => set({ timeOffRequests }),

      addTimeOffRequest: (request) => set((state) => ({
        timeOffRequests: [...state.timeOffRequests, request]
      })),

      updateTimeOffRequest: (id, updates) => set((state) => ({
        timeOffRequests: state.timeOffRequests.map(request =>
          request.id === id ? { ...request, ...updates } : request
        )
      })),

      // Data Actions
      setEmployees: (employees) => set({ employees }),
      setLaborRates: (laborRates) => set({ laborRates }),
      setStats: (stats) => set({ stats }),

      // UI Actions
      setLoading: (loading) => set({ loading }),
      setError: (_error) => set({ error }),
      setSelectedWeek: (selectedWeek) => set({ selectedWeek }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),

      // Computed Functions
      getShiftsByWeek: (week) => {
        const state = get();
        const weekStart = new Date(week);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sunday

        return state.shifts.filter(shift => {
          const shiftDate = new Date(shift.date);
          return shiftDate >= weekStart && shiftDate <= weekEnd;
        });
      },

      getEmployeeById: (id) => {
        const state = get();
        return state.employees.find(emp => emp.id === id);
      },

      calculateWeeklyStats: (week) => {
        const state = get();
        const weekShifts = state.getShiftsByWeek(week);

        const totalShifts = weekShifts.length;
        const employeesScheduled = new Set(weekShifts.map(s => s.employee_id)).size;

        // Calculate total hours and labor cost
        let totalHours = 0;
        let totalCost = 0;
        let overtimeHours = 0;

        weekShifts.forEach(shift => {
          const start = new Date(`2000-01-01T${shift.start_time}`);
          const end = new Date(`2000-01-01T${shift.end_time}`);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

          totalHours += hours;

          if (shift.hourly_rate) {
            totalCost += hours * shift.hourly_rate;
          } else {
            const rate = state.laborRates[shift.position] || 15;
            totalCost += hours * rate;
          }

          // Simple overtime calculation (>8 hours per shift)
          if (hours > 8) {
            overtimeHours += hours - 8;
          }
        });

        // Calculate coverage (basic assumption: need 16 hours per day coverage)
        const targetHours = 7 * 16; // 7 days * 16 hours
        const coveragePercentage = Math.min(100, (totalHours / targetHours) * 100);

        // Count understaffed shifts (shifts with less than expected coverage)
        const understaffedShifts = weekShifts.filter(shift => {
          // Simple logic: if less than 2 people scheduled for same time slot
          const sameTimeShifts = weekShifts.filter(s =>
            s.date === shift.date &&
            s.start_time === shift.start_time
          );
          return sameTimeShifts.length < 2;
        }).length;

        return {
          total_shifts_this_week: totalShifts,
          employees_scheduled: employeesScheduled,
          coverage_percentage: Math.round(coveragePercentage * 100) / 100,
          labor_cost_this_week: Math.round(totalCost * 100) / 100,
          overtime_hours: Math.round(overtimeHours * 100) / 100,
          understaffed_shifts: understaffedShifts,
          pending_time_off: state.timeOffRequests.filter(r => r.status === 'pending').length,
          approved_requests: state.timeOffRequests.filter(r => r.status === 'approved').length
        };
      }
    }),
    {
      name: 'scheduling-store',
      version: 1
    }
  )
);

// ✅ SELECTORS para optimización
export const useSchedulingStats = () => useSchedulingStore(state => state.stats);
export const useSchedulingLoading = () => useSchedulingStore(state => state.loading);
export const useSchedulingError = () => useSchedulingStore(state => state.error);
export const useSchedulingShifts = () => useSchedulingStore(state => state.shifts);
export const useSchedulingEmployees = () => useSchedulingStore(state => state.employees);
export const useSchedulingFilters = () => useSchedulingStore(state => state.filters);

// ✅ ACTIONS para fácil acceso
export const useSchedulingActions = () => useSchedulingStore(state => ({
  setShifts: state.setShifts,
  addShift: state.addShift,
  updateShift: state.updateShift,
  removeShift: state.removeShift,
  setTimeOffRequests: state.setTimeOffRequests,
  addTimeOffRequest: state.addTimeOffRequest,
  updateTimeOffRequest: state.updateTimeOffRequest,
  setEmployees: state.setEmployees,
  setLaborRates: state.setLaborRates,
  setStats: state.setStats,
  setLoading: state.setLoading,
  setError: state.setError,
  setSelectedWeek: state.setSelectedWeek,
  setActiveTab: state.setActiveTab,
  setFilters: state.setFilters
}));