import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

/**
 * Hours configuration for a single day
 */
export interface DayHours {
  open: string;   // Format: "HH:mm" (e.g., "09:00")
  close: string;  // Format: "HH:mm" (e.g., "22:00")
  closed?: boolean; // If true, location is closed this day
}

/**
 * Weekly hours configuration
 * Keys: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
 */
export type Hours = Record<string, DayHours>;

/**
 * Table configuration
 */
export interface Table {
  id: string;
  name: string;
  capacity: number;
  status?: 'available' | 'occupied' | 'reserved';
  section?: string;
}

// ============================================
// STATE
// ============================================

export interface OperationsState {
  // Operating hours config (domain-specific)
  operatingHours?: Hours;  // Used by: Dine-in
  pickupHours?: Hours;     // Used by: Takeaway

  // Tables management (domain-specific)
  tables: Table[];

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  setOperatingHours: (hours: Hours) => void;
  setPickupHours: (hours: Hours) => void;
  setTables: (tables: Table[]) => void;
  addTable: (table: Table) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  removeTable: (id: string) => void;
}

// ============================================
// STORE
// ============================================

export const useOperationsStore = create<OperationsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        operatingHours: undefined,
        pickupHours: undefined,
        tables: [],
        isLoading: false,
        error: null,

        // Actions
        setOperatingHours: (hours) => {
          set({ operatingHours: hours }, false, 'setOperatingHours');
        },

        setPickupHours: (hours) => {
          set({ pickupHours: hours }, false, 'setPickupHours');
        },

        setTables: (tables) => {
          set({ tables }, false, 'setTables');
        },

        addTable: (table) => {
          set((state) => ({
            tables: [...state.tables, table]
          }), false, 'addTable');
        },

        updateTable: (id, updates) => {
          set((state) => ({
            tables: state.tables.map(t =>
              t.id === id ? { ...t, ...updates } : t
            )
          }), false, 'updateTable');
        },

        removeTable: (id) => {
          set((state) => ({
            tables: state.tables.filter(t => t.id !== id)
          }), false, 'removeTable');
        }
      }),
      {
        name: 'g-mini-operations-storage',
        partialize: (state) => ({
          operatingHours: state.operatingHours,
          pickupHours: state.pickupHours,
          tables: state.tables
        })
      }
    ),
    {
      name: 'OperationsStore'
    }
  )
);