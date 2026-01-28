import { useCallback } from 'react';
import { useSelectedLocationId, useCashUIActions } from '@/modules/accounting/store/cashStore';
import {
  useActiveCashSession,
  useOpenCashSession,
  useCloseCashSession,
} from '@/modules/accounting/hooks/useCashSessions';
import type { 
  CashSessionRow,
  OpenCashSessionInput, 
  CloseCashSessionInput 
} from '@/modules/accounting/types';

export interface UseCashSessionReturn {
  activeCashSession: CashSessionRow | null;
  activeSessions: CashSessionRow[];
  loading: boolean;
  error: string | null;
  openCashSession: (input: OpenCashSessionInput) => Promise<CashSessionRow>;
  closeCashSession: (sessionId: string, input: CloseCashSessionInput) => Promise<CashSessionRow>;
  isOpening: boolean;
  isClosing: boolean;
}

export function useCashSession(): UseCashSessionReturn {
  const selectedLocationId = useSelectedLocationId();
  const uiActions = useCashUIActions();

  const { 
    data: activeCashSession, 
    isLoading: isLoadingSession,
    error: sessionError 
  } = useActiveCashSession(selectedLocationId || undefined);

  const openMutation = useOpenCashSession();
  const closeMutation = useCloseCashSession();

  const handleOpenCashSession = useCallback(
    async (input: OpenCashSessionInput): Promise<CashSessionRow> => {
      const session = await openMutation.mutateAsync(input);
      uiActions.selectLocation(input.money_location_id);
      return session;
    },
    [openMutation, uiActions]
  );

  const handleCloseCashSession = useCallback(
    async (sessionId: string, input: CloseCashSessionInput): Promise<CashSessionRow> => {
      const session = await closeMutation.mutateAsync({ sessionId, input });
      uiActions.clearSelection();
      return session;
    },
    [closeMutation, uiActions]
  );

  return {
    activeCashSession: activeCashSession || null,
    activeSessions: activeCashSession ? [activeCashSession] : [],
    loading: isLoadingSession,
    isOpening: openMutation.isPending,
    isClosing: closeMutation.isPending,
    error: sessionError?.message || null,
    openCashSession: handleOpenCashSession,
    closeCashSession: handleCloseCashSession,
  };
}
