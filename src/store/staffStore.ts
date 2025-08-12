import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface StaffMember {
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
  department: 'all' | StaffMember['department'];
  status: 'all' | StaffMember['status'];
  position: string;
  sortBy: 'name' | 'position' | 'performance' | 'hire_date';
  sortOrder: 'asc' | 'desc';
}

export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  onLeave: number;
  avgPerformance: number;
  avgAttendance: number;
  totalPayroll: number;
  departmentStats: Record<StaffMember['department'], number>;
  upcomingReviews: StaffMember[];
}

export interface StaffState {
  // Data
  staff: StaffMember[];
  schedules: ShiftSchedule[];
  timeEntries: TimeEntry[];
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: StaffFilters;
  selectedStaff: string[];
  
  // Modal states
  isStaffModalOpen: boolean;
  isScheduleModalOpen: boolean;
  isTimeTrackingModalOpen: boolean;
  modalMode: 'add' | 'edit' | 'view';
  currentStaff: StaffMember | null;
  currentSchedule: ShiftSchedule | null;
  
  // Calendar view
  calendarDate: Date;
  calendarView: 'week' | 'month';
  
  // Stats
  stats: StaffStats;

  // Actions
  setStaff: (staff: StaffMember[]) => void;
  addStaffMember: (staff: Omit<StaffMember, 'id' | 'created_at' | 'updated_at' | 'performance_score' | 'attendance_rate' | 'completed_tasks' | 'training_completed' | 'certifications'>) => void;
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;
  
  // Schedule management
  setSchedules: (schedules: ShiftSchedule[]) => void;
  addSchedule: (schedule: Omit<ShiftSchedule, 'id'>) => void;
  updateSchedule: (id: string, updates: Partial<ShiftSchedule>) => void;
  deleteSchedule: (id: string) => void;
  
  // Time tracking
  setTimeEntries: (entries: TimeEntry[]) => void;
  clockIn: (staffId: string) => void;
  clockOut: (staffId: string) => void;
  startBreak: (staffId: string) => void;
  endBreak: (staffId: string) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<StaffFilters>) => void;
  resetFilters: () => void;
  
  selectStaff: (id: string) => void;
  deselectStaff: (id: string) => void;
  selectAllStaff: () => void;
  deselectAllStaff: () => void;
  
  // Modal actions
  openStaffModal: (mode: 'add' | 'edit' | 'view', staff?: StaffMember) => void;
  closeStaffModal: () => void;
  openScheduleModal: (mode: 'add' | 'edit' | 'view', schedule?: ShiftSchedule) => void;
  closeScheduleModal: () => void;
  openTimeTrackingModal: () => void;
  closeTimeTrackingModal: () => void;
  
  // Calendar actions
  setCalendarDate: (date: Date) => void;
  setCalendarView: (view: 'week' | 'month') => void;
  
  // Stats
  refreshStats: () => void;
  
  // Performance tracking
  updatePerformance: (staffId: string, score: number) => void;
  addTraining: (staffId: string, training: string) => void;
  addCertification: (staffId: string, certification: string) => void;
  
  // Computed selectors
  getFilteredStaff: () => StaffMember[];
  getActiveStaff: () => StaffMember[];
  getScheduleForDate: (date: string) => ShiftSchedule[];
  getScheduleForStaff: (staffId: string) => ShiftSchedule[];
  getCurrentShifts: () => ShiftSchedule[];
  getActiveTimeEntries: () => TimeEntry[];
  getStaffOnBreak: () => TimeEntry[];
}

const initialFilters: StaffFilters = {
  search: '',
  department: 'all',
  status: 'all',
  position: '',
  sortBy: 'name',
  sortOrder: 'asc'
};

export const useStaffStore = create<StaffState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        staff: [],
        schedules: [],
        timeEntries: [],
        
        loading: false,
        error: null,
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
        
        stats: {
          totalStaff: 0,
          activeStaff: 0,
          onLeave: 0,
          avgPerformance: 0,
          avgAttendance: 0,
          totalPayroll: 0,
          departmentStats: {
            kitchen: 0,
            service: 0,
            admin: 0,
            cleaning: 0,
            management: 0
          },
          upcomingReviews: []
        },

        // Actions
        setStaff: (staff) => {
          set((state) => {
            state.staff = staff;
          });
          get().refreshStats();
        },

        addStaffMember: (staffData) => {
          set((state) => {
            const newStaff: StaffMember = {
              ...staffData,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              performance_score: 85, // Default score
              attendance_rate: 95, // Default rate
              completed_tasks: 0,
              training_completed: [],
              certifications: []
            };
            state.staff.push(newStaff);
          });
          get().refreshStats();
        },

        updateStaffMember: (id, updates) => {
          set((state) => {
            const staffIndex = state.staff.findIndex(staff => staff.id === id);
            if (staffIndex >= 0) {
              state.staff[staffIndex] = {
                ...state.staff[staffIndex],
                ...updates,
                updated_at: new Date().toISOString()
              };
            }
          });
          get().refreshStats();
        },

        deleteStaffMember: (id) => {
          set((state) => {
            state.staff = state.staff.filter(staff => staff.id !== id);
            state.selectedStaff = state.selectedStaff.filter(selectedId => selectedId !== id);
            // Also remove related schedules and time entries
            state.schedules = state.schedules.filter(schedule => schedule.staff_id !== id);
            state.timeEntries = state.timeEntries.filter(entry => entry.staff_id !== id);
          });
          get().refreshStats();
        },

        // Schedule management
        setSchedules: (schedules) => {
          set((state) => {
            state.schedules = schedules;
          });
        },

        addSchedule: (scheduleData) => {
          set((state) => {
            const newSchedule: ShiftSchedule = {
              ...scheduleData,
              id: crypto.randomUUID()
            };
            state.schedules.push(newSchedule);
          });
        },

        updateSchedule: (id, updates) => {
          set((state) => {
            const scheduleIndex = state.schedules.findIndex(schedule => schedule.id === id);
            if (scheduleIndex >= 0) {
              state.schedules[scheduleIndex] = {
                ...state.schedules[scheduleIndex],
                ...updates
              };
            }
          });
        },

        deleteSchedule: (id) => {
          set((state) => {
            state.schedules = state.schedules.filter(schedule => schedule.id !== id);
          });
        },

        // Time tracking
        setTimeEntries: (entries) => {
          set((state) => {
            state.timeEntries = entries;
          });
        },

        clockIn: (staffId) => {
          set((state) => {
            const staff = state.staff.find(s => s.id === staffId);
            if (staff) {
              const newEntry: TimeEntry = {
                id: crypto.randomUUID(),
                staff_id: staffId,
                staff_name: staff.name,
                date: new Date().toISOString().split('T')[0],
                clock_in: new Date().toISOString(),
                total_hours: 0,
                overtime_hours: 0,
                status: 'active'
              };
              state.timeEntries.push(newEntry);
            }
          });
        },

        clockOut: (staffId) => {
          set((state) => {
            const entryIndex = state.timeEntries.findIndex(
              entry => entry.staff_id === staffId && entry.status === 'active'
            );
            if (entryIndex >= 0) {
              const entry = state.timeEntries[entryIndex];
              const clockOut = new Date();
              const clockIn = new Date(entry.clock_in);
              
              let totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
              
              // Subtract break time if any
              if (entry.break_start && entry.break_end) {
                const breakTime = (new Date(entry.break_end).getTime() - new Date(entry.break_start).getTime()) / (1000 * 60 * 60);
                totalHours -= breakTime;
              }
              
              const overtimeHours = Math.max(0, totalHours - 8); // Overtime after 8 hours
              
              entry.clock_out = clockOut.toISOString();
              entry.total_hours = Math.round(totalHours * 100) / 100;
              entry.overtime_hours = Math.round(overtimeHours * 100) / 100;
              entry.status = 'completed';
            }
          });
        },

        startBreak: (staffId) => {
          set((state) => {
            const entryIndex = state.timeEntries.findIndex(
              entry => entry.staff_id === staffId && entry.status === 'active'
            );
            if (entryIndex >= 0) {
              state.timeEntries[entryIndex].break_start = new Date().toISOString();
            }
          });
        },

        endBreak: (staffId) => {
          set((state) => {
            const entryIndex = state.timeEntries.findIndex(
              entry => entry.staff_id === staffId && entry.status === 'active'
            );
            if (entryIndex >= 0) {
              state.timeEntries[entryIndex].break_end = new Date().toISOString();
            }
          });
        },

        // UI actions
        setLoading: (loading) => {
          set((state) => {
            state.loading = loading;
          });
        },

        setError: (error) => {
          set((state) => {
            state.error = error;
          });
        },

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

        selectAllStaff: () => {
          const filteredStaff = get().getFilteredStaff();
          set((state) => {
            state.selectedStaff = filteredStaff.map(staff => staff.id);
          });
        },

        deselectAllStaff: () => {
          set((state) => {
            state.selectedStaff = [];
          });
        },

        // Modal actions
        openStaffModal: (mode, staff = null) => {
          set((state) => {
            state.isStaffModalOpen = true;
            state.modalMode = mode;
            state.currentStaff = staff;
          });
        },

        closeStaffModal: () => {
          set((state) => {
            state.isStaffModalOpen = false;
            state.currentStaff = null;
          });
        },

        openScheduleModal: (mode, schedule = null) => {
          set((state) => {
            state.isScheduleModalOpen = true;
            state.modalMode = mode;
            state.currentSchedule = schedule;
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

        // Stats
        refreshStats: () => {
          const { staff } = get();
          const activeStaff = staff.filter(s => s.status === 'active');
          const onLeave = staff.filter(s => s.status === 'on_leave');
          
          const departmentStats = staff.reduce((acc, member) => {
            acc[member.department] += 1;
            return acc;
          }, { kitchen: 0, service: 0, admin: 0, cleaning: 0, management: 0 });

          const avgPerformance = staff.length > 0
            ? staff.reduce((sum, s) => sum + s.performance_score, 0) / staff.length
            : 0;

          const avgAttendance = staff.length > 0
            ? staff.reduce((sum, s) => sum + s.attendance_rate, 0) / staff.length
            : 0;

          const totalPayroll = staff.reduce((sum, s) => sum + s.salary, 0);

          // Find staff needing performance reviews (90 days since hire)
          const reviewDate = new Date();
          reviewDate.setDate(reviewDate.getDate() - 90);
          const upcomingReviews = staff.filter(s => 
            new Date(s.hire_date) <= reviewDate && s.status === 'active'
          );

          const stats: StaffStats = {
            totalStaff: staff.length,
            activeStaff: activeStaff.length,
            onLeave: onLeave.length,
            avgPerformance: Math.round(avgPerformance * 10) / 10,
            avgAttendance: Math.round(avgAttendance * 10) / 10,
            totalPayroll,
            departmentStats,
            upcomingReviews
          };

          set((state) => {
            state.stats = stats;
          });
        },

        // Performance tracking
        updatePerformance: (staffId, score) => {
          get().updateStaffMember(staffId, { performance_score: score });
        },

        addTraining: (staffId, training) => {
          set((state) => {
            const staffIndex = state.staff.findIndex(s => s.id === staffId);
            if (staffIndex >= 0) {
              const updatedTraining = [...state.staff[staffIndex].training_completed];
              if (!updatedTraining.includes(training)) {
                updatedTraining.push(training);
                state.staff[staffIndex].training_completed = updatedTraining;
                state.staff[staffIndex].updated_at = new Date().toISOString();
              }
            }
          });
        },

        addCertification: (staffId, certification) => {
          set((state) => {
            const staffIndex = state.staff.findIndex(s => s.id === staffId);
            if (staffIndex >= 0) {
              const updatedCertifications = [...state.staff[staffIndex].certifications];
              if (!updatedCertifications.includes(certification)) {
                updatedCertifications.push(certification);
                state.staff[staffIndex].certifications = updatedCertifications;
                state.staff[staffIndex].updated_at = new Date().toISOString();
              }
            }
          });
        },

        // Computed selectors
        getFilteredStaff: () => {
          const { staff, filters } = get();
          let filtered = [...staff];

          // Search filter
          if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(staff =>
              staff.name.toLowerCase().includes(search) ||
              staff.email.toLowerCase().includes(search) ||
              staff.position.toLowerCase().includes(search)
            );
          }

          // Department filter
          if (filters.department !== 'all') {
            filtered = filtered.filter(staff => staff.department === filters.department);
          }

          // Status filter
          if (filters.status !== 'all') {
            filtered = filtered.filter(staff => staff.status === filters.status);
          }

          // Position filter
          if (filters.position) {
            filtered = filtered.filter(staff => 
              staff.position.toLowerCase().includes(filters.position.toLowerCase())
            );
          }

          // Sort
          filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (filters.sortBy) {
              case 'position':
                aValue = a.position.toLowerCase();
                bValue = b.position.toLowerCase();
                break;
              case 'performance':
                aValue = a.performance_score;
                bValue = b.performance_score;
                break;
              case 'hire_date':
                aValue = new Date(a.hire_date).getTime();
                bValue = new Date(b.hire_date).getTime();
                break;
              default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
            }

            if (filters.sortOrder === 'desc') {
              return aValue < bValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
          });

          return filtered;
        },

        getActiveStaff: () => {
          return get().staff.filter(staff => staff.status === 'active');
        },

        getScheduleForDate: (date) => {
          return get().schedules.filter(schedule => schedule.date === date);
        },

        getScheduleForStaff: (staffId) => {
          return get().schedules.filter(schedule => schedule.staff_id === staffId);
        },

        getCurrentShifts: () => {
          const today = new Date().toISOString().split('T')[0];
          return get().schedules.filter(schedule => 
            schedule.date === today && 
            (schedule.status === 'scheduled' || schedule.status === 'confirmed')
          );
        },

        getActiveTimeEntries: () => {
          return get().timeEntries.filter(entry => entry.status === 'active');
        },

        getStaffOnBreak: () => {
          return get().timeEntries.filter(entry => 
            entry.status === 'active' && 
            entry.break_start && 
            !entry.break_end
          );
        }
      })),
      {
        name: 'g-mini-staff-storage',
        partialize: (state) => ({
          staff: state.staff,
          schedules: state.schedules,
          timeEntries: state.timeEntries,
          filters: state.filters,
          calendarDate: state.calendarDate.toISOString(),
          calendarView: state.calendarView
        })
      }
    ),
    {
      name: 'StaffStore'
    }
  )
);