import { useMoneyLocationsWithAccount } from '@/modules/cash/hooks/useMoneyLocations';
import { useCashSessionHistory } from '@/modules/cash/hooks/useCashSessions';
import { useSelectedLocationId } from '@/modules/cash/store/cashStore';

export function useCashData() {
  const selectedLocationId = useSelectedLocationId();

  const { 
    data: moneyLocations = [], 
    isLoading: locationsLoading 
  } = useMoneyLocationsWithAccount();
  
  const { 
    data: sessionHistory = [], 
    isLoading: historyLoading 
  } = useCashSessionHistory(selectedLocationId || undefined);

  return {
    moneyLocations,
    sessionHistory,
    loading: locationsLoading || historyLoading,
    error: null,
  };
}
