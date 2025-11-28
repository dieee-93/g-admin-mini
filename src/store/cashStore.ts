import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';
import { logger } from '@/lib/logging';
import type {
  MoneyLocationRow,
  MoneyLocationWithAccount,
  CashSessionRow,
} from '@/modules/cash/types';

export interface CashState {
  // Data
  moneyLocations: MoneyLocationWithAccount[];
  activeSessions: CashSessionRow[];
  sessionHistory: CashSessionRow[];

  // UI State
  loading: boolean;
  error: string | null;

  // Actions - Data
  setMoneyLocations: (locations: MoneyLocationWithAccount[]) => void;
  setActiveSessions: (sessions: CashSessionRow[]) => void;
  setSessionHistory: (sessions: CashSessionRow[]) => void;
  addSession: (session: CashSessionRow) => void;
  updateSession: (id: string, updates: Partial<CashSessionRow>) => void;
  removeSession: (id: string) => void;

  // Actions - UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getActiveSessionByLocation: (locationId: string) => CashSessionRow | null;
  getLocationById: (locationId: string) => MoneyLocationWithAccount | null;
}

export const useCashStore = create<CashState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        moneyLocations: [],
        activeSessions: [],
        sessionHistory: [],
        loading: false,
        error: null,

        // Actions - Data
        setMoneyLocations: (locations) => {
          set(produce((state: CashState) => {
            state.moneyLocations = locations;
          }));
        },

        setActiveSessions: (sessions) => {
          set(produce((state: CashState) => {
            state.activeSessions = sessions;
          }));
        },

        setSessionHistory: (sessions) => {
          set(produce((state: CashState) => {
            state.sessionHistory = sessions;
          }));
        },

        addSession: (session) => {
          set(produce((state: CashState) => {
            state.activeSessions.push(session);
          }));
        },

        updateSession: (id, updates) => {
          set(produce((state: CashState) => {
            const index = state.activeSessions.findIndex(s => s.id === id);
            if (index !== -1) {
              state.activeSessions[index] = { ...state.activeSessions[index], ...updates };
            }
          }));
        },

        removeSession: (id) => {
          set(produce((state: CashState) => {
            state.activeSessions = state.activeSessions.filter(s => s.id !== id);
          }));
        },

        // Actions - UI
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),

        // Computed
        getActiveSessionByLocation: (locationId) => {
          const { activeSessions } = get();
          return activeSessions.find(s => s.money_location_id === locationId) || null;
        },

        getLocationById: (locationId) => {
          const { moneyLocations } = get();
          return moneyLocations.find(loc => loc.id === locationId) || null;
        },
      }),
      {
        name: 'g-mini-cash-storage',
        partialize: (state) => ({
          // Only persist money locations, not sessions
          moneyLocations: state.moneyLocations,
        }),
      }
    )
  )
);
