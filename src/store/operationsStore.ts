import { create } from 'zustand';

export interface OperationsState {
  // Basic operations state
  isLoading: boolean;
  error: string | null;
}

export const useOperationsStore = create<OperationsState>()((set, get) => ({
  isLoading: false,
  error: null,
}));