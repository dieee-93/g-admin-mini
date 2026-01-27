/**
 * TEAM STORE
 * 
 * ✅ MIGRATED TO TANSTACK QUERY PATTERN
 * 
 * This store now only handles UI state following TanStack Query best practices:
 * - Server state (team[], schedules[], timeEntries[]) → TanStack Query (@/hooks/useTeam)
 * - UI state (modals, filters, selections) → Zustand (this file)
 * 
 * MIGRATION CONTEXT:
 * - Date: December 2025
 * - Reason: Fix infinite loops + architecture compliance
 * - Reference: Cash Module pattern
 * 
 * @see src/hooks/useStaff.ts - TanStack Query hooks for server state
 * @see ZUSTAND_TANSTACK_MIGRATION_AUDIT.md - Migration plan
 * @see ZUSTAND_ARCHITECTURE_BEST_PRACTICES.md - Architecture guide
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department: 'kitchen' | 'service' | 'admin' | 'cleaning' | 'management';
  hire_date: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  avatar?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Performance metrics
  performance_score: number;
  attendance_rate: number;
  completed_tasks: number;
  training_completed: string[];
  certifications: string[];
  
  // Schedule
  weekly_hours: number;
  shift_preference: 'morning' | 'afternoon' | 'night' | 'flexible';
  available_days: string[];
}

export interface ShiftSchedule {
  id: string;
  staff_id: string;
  staff_name: string;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'missed' | 'cancelled';
  break_duration: number;
  notes?: string;
}

export interface TimeEntry {
  id: string;
  staff_id: string;
  staff_name: string;
  date: string;
  clock_in: string;
  clock_out?: string;
  break_start?: string;
  break_end?: string;
  total_hours: number;
  overtime_hours: number;
  status: 'active' | 'completed' | 'needs_review';
}

export interface StaffFilters {
  search: string;
  department: 'all' | TeamMember['department'];
  status: 'all' | TeamMember['status'];
  position: string;
  sortBy: 'name' | 'position' | 'performance' | 'hire_date';
  sortOrder: 'asc' | 'desc';
}

// ============================================
// UI STATE (Zustand only)
// ============================================

export interface TeamState {
  // ❌ REMOVED: team[], schedules[], timeEntries[] → use TanStack Query hooks
  
  // ✅ UI State only
  filters: StaffFilters;
  selectedStaff: string[];
  
  // Modal states
  isStaffModalOpen: boolean;
  isScheduleModalOpen: boolean;
  isTimeTrackingModalOpen: boolean;
  modalMode: 'add' | 'edit' | 'view';
  currentStaff: TeamMember | null;
  currentSchedule: ShiftSchedule | null;
  
  // Calendar view
  calendarDate: Date;
  calendarView: 'week' | 'month';
  
  // UI Actions
  setFilters: (filters: Partial<StaffFilters>) => void;
  resetFilters: () => void;
  
  selectStaff: (id: string) => void;
  deselectStaff: (id: string) => void;
  selectAllStaff: (allIds: string[]) => void;
  deselectAllStaff: () => void;
  
  // Modal actions
  openStaffModal: (mode: 'add' | 'edit' | 'view', staff?: TeamMember) => void;
  closeStaffModal: () => void;
  openScheduleModal: (mode: 'add' | 'edit' | 'view', schedule?: ShiftSchedule) => void;
  closeScheduleModal: () => void;
  openTimeTrackingModal: () => void;
  closeTimeTrackingModal: () => void;
  
  // Calendar actions
  setCalendarDate: (date: Date) => void;
  setCalendarView: (view: 'week' | 'month') => void;
}

const initialFilters: StaffFilters = {
  search: '',
  department: 'all',
  status: 'all',
  position: '',
  sortBy: 'name',
  sortOrder: 'asc'
};

// ============================================
// STORE
// ============================================

export const useTeamStore = create<TeamState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial UI state
        filters: initialFilters,
        selectedStaff: [],
        
        isStaffModalOpen: false,
        isScheduleModalOpen: false,
        isTimeTrackingModalOpen: false,
        modalMode: 'add',
        currentStaff: null,
        currentSchedule: null,
        
        calendarDate: new Date(),
        calendarView: 'week',

        // UI Actions
        setFilters: (newFilters) => {
          set((state) => {
            state.filters = { ...state.filters, ...newFilters };
          });
        },

        resetFilters: () => {
          set((state) => {
            state.filters = initialFilters;
          });
        },

        selectStaff: (id) => {
          set((state) => {
            if (!state.selectedStaff.includes(id)) {
              state.selectedStaff.push(id);
            }
          });
        },

        deselectStaff: (id) => {
          set((state) => {
            state.selectedStaff = state.selectedStaff.filter(selectedId => selectedId !== id);
          });
        },

        selectAllStaff: (allIds) => {
          set((state) => {
            state.selectedStaff = allIds;
          });
        },

        deselectAllStaff: () => {
          set((state) => {
            state.selectedStaff = [];
          });
        },

        // Modal actions
        openStaffModal: (mode, staff) => {
          set((state) => {
            state.isStaffModalOpen = true;
            state.modalMode = mode;
            state.currentStaff = staff || null;
          });
        },

        closeStaffModal: () => {
          set((state) => {
            state.isStaffModalOpen = false;
            state.currentStaff = null;
          });
        },

        openScheduleModal: (mode, schedule) => {
          set((state) => {
            state.isScheduleModalOpen = true;
            state.modalMode = mode;
            state.currentSchedule = schedule || null;
          });
        },

        closeScheduleModal: () => {
          set((state) => {
            state.isScheduleModalOpen = false;
            state.currentSchedule = null;
          });
        },

        openTimeTrackingModal: () => {
          set((state) => {
            state.isTimeTrackingModalOpen = true;
          });
        },

        closeTimeTrackingModal: () => {
          set((state) => {
            state.isTimeTrackingModalOpen = false;
          });
        },

        // Calendar actions
        setCalendarDate: (date) => {
          set((state) => {
            state.calendarDate = date;
          });
        },

        setCalendarView: (view) => {
          set((state) => {
            state.calendarView = view;
          });
        },
      })),
      { 
        name: 'team-storage',
        // Only persist UI preferences
        partialize: (state) => ({
          filters: state.filters,
          calendarView: state.calendarView,
        })
      }
    ),
    { name: 'TeamStore' }
  )
);
