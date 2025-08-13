import { create } from 'zustand';

export interface FiscalState {
  // Basic fiscal state
  isLoading: boolean;
  error: string | null;
}

export const useFiscalStore = create<FiscalState>()((set, get) => ({
  isLoading: false,
  error: null,
}));