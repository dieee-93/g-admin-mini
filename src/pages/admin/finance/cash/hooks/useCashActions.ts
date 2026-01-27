import { useCashUIActions } from '@/modules/cash/store/cashStore';
import { 
  useOpenCashSession, 
  useCloseCashSession 
} from '@/modules/cash/hooks/useCashSessions';
import type { OpenCashSessionInput, CloseCashSessionInput } from '@/modules/cash/types';

export function useCashActions() {
  const uiActions = useCashUIActions();
  const openMutation = useOpenCashSession();
  const closeMutation = useCloseCashSession();

  return {
    ...uiActions,
    openSession: async (input: OpenCashSessionInput) => {
      return await openMutation.mutateAsync(input);
    },
    closeSession: async (sessionId: string, input: CloseCashSessionInput) => {
      return await closeMutation.mutateAsync({ sessionId, input });
    },
  };
}
