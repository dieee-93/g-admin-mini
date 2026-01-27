import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface CashUIState {
  selectedLocationId: string | null;
  isSessionModalOpen: boolean;
  isCloseSessionModalOpen: boolean;
  filters: {
    dateRange: { from: Date | null; to: Date | null };
    status: 'OPEN' | 'CLOSED' | 'DISCREPANCY' | null;
  };
  
  actions: {
    selectLocation: (locationId: string | null) => void;
    openSessionModal: () => void;
    closeSessionModal: () => void;
    openCloseSessionModal: () => void;
    closeCloseSessionModal: () => void;
    setFilters: (filters: Partial<CashUIState['filters']>) => void;
    clearFilters: () => void;
    clearSelection: () => void;
  };
}

const useCashUIStore = create<CashUIState>()(
  devtools(
    (set) => ({
      selectedLocationId: null,
      isSessionModalOpen: false,
      isCloseSessionModalOpen: false,
      filters: {
        dateRange: { from: null, to: null },
        status: null,
      },
      
      actions: {
        selectLocation: (locationId) => 
          set({ selectedLocationId: locationId }),
          
        openSessionModal: () => 
          set({ isSessionModalOpen: true }),
          
        closeSessionModal: () => 
          set({ isSessionModalOpen: false }),
          
        openCloseSessionModal: () => 
          set({ isCloseSessionModalOpen: true }),
          
        closeCloseSessionModal: () => 
          set({ isCloseSessionModalOpen: false }),
          
        setFilters: (filters) => 
          set((state) => ({
            filters: { ...state.filters, ...filters }
          })),
          
        clearFilters: () => 
          set({
            filters: { dateRange: { from: null, to: null }, status: null }
          }),
          
        clearSelection: () => 
          set({ selectedLocationId: null }),
      }
    }),
    { name: 'CashUIStore' }
  )
);

export const useSelectedLocationId = () => useCashUIStore(state => state.selectedLocationId);
export const useIsSessionModalOpen = () => useCashUIStore(state => state.isSessionModalOpen);
export const useIsCloseSessionModalOpen = () => useCashUIStore(state => state.isCloseSessionModalOpen);
export const useCashFilters = () => useCashUIStore(state => state.filters);
export const useCashUIActions = () => useCashUIStore(state => state.actions);
