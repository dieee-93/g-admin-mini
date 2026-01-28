import { useMoneyLocationsWithAccount } from '@/modules/accounting/hooks/useMoneyLocations';
import { useCashSessionHistory } from '@/modules/accounting/hooks/useCashSessions';
import { useSelectedLocationId } from '@/modules/accounting/store/cashStore';

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
