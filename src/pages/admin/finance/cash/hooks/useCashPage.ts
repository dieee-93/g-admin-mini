/**
 * useCashPage Hook
 * Main orchestration hook for Cash Management page
 * Following materials module pattern
 */

import { useState, useCallback, useMemo } from 'react';
import { SecureRandomGenerator } from '@/lib/events/utils/SecureRandomGenerator';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { useNavigationActions } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useCashData } from './useCashData';
import { useCashActions } from './useCashActions';
import { DecimalUtils } from '@/lib/decimal';
import {
  openCashSession,
  closeCashSession,
  recordCashDrop,
  fetchMoneyLocationsWithAccount,
  getAllActiveSessions,
} from '@/modules/cash/services';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import type {
  MoneyLocationWithAccount,
  CashSessionRow,
  OpenCashSessionInput,
  CloseCashSessionInput,
} from '@/modules/cash/types';

export interface CashPageState {
  activeTab: 'sessions' | 'locations' | 'accounts' | 'history';
  selectedMoneyLocation: string | null;
  showOpenModal: boolean;
  showCloseModal: boolean;
  selectedSession: CashSessionRow | null;
}

export interface CashPageMetrics {
  totalLocations: number;
  activeSessions: number;
  totalCashOnHand: number;
  totalExpected: number;
  lastUpdate: Date;
}

export interface CashPageActions {
  handleOpenSession: (locationId: string) => void;
  handleCloseSession: (session: CashSessionRow) => void;
  handleCashDrop: (sessionId: string, amount: number) => Promise<void>;
  handleTabChange: (tab: CashPageState['activeTab']) => void;
  handleRefresh: () => Promise<void>;
}

export interface UseCashPageReturn {
  pageState: CashPageState;
  metrics: CashPageMetrics;
  loading: boolean;
  error: string | null;
  moneyLocations: MoneyLocationWithAccount[];
  activeSessions: CashSessionRow[];
  actions: CashPageActions;
  openModal: {
    isOpen: boolean;
    location: MoneyLocationWithAccount | null;
    onOpen: (location: MoneyLocationWithAccount) => void;
    onClose: () => void;
    onConfirm: (input: OpenCashSessionInput) => Promise<void>;
  };
  closeModal: {
    isOpen: boolean;
    session: CashSessionRow | null;
    onOpen: (session: CashSessionRow) => void;
    onClose: () => void;
    onConfirm: (input: CloseCashSessionInput) => Promise<void>;
  };
  shouldReduceAnimations: boolean;
  isOnline: boolean;
}

export function useCashPage(): UseCashPageReturn {
  const { user } = useAuth();
  const { selectedLocationId } = useLocation();
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();
  const { navigateTo } = useNavigationActions();

  const [pageState, setPageState] = useState<CashPageState>({
    activeTab: 'sessions',
    selectedMoneyLocation: null,
    showOpenModal: false,
    showCloseModal: false,
    selectedSession: null,
  });

  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isRecordingDrop, setIsRecordingDrop] = useState(false);

  const {
    moneyLocations,
    activeSessions,
    loading,
    error,
  } = useCashData();

  const storeActions = useCashActions();

  const refreshLocations = useCallback(async () => {
    try {
      storeActions.setLoading(true);
      const locations = await fetchMoneyLocationsWithAccount();
      storeActions.setMoneyLocations(locations);
    } catch (error) {
      logger.error('CashModule', 'Failed to refresh locations', { error });
      storeActions.setError(error instanceof Error ? error.message : 'Error al cargar ubicaciones');
    } finally {
      storeActions.setLoading(false);
    }
  }, [storeActions]);

  const refreshSessions = useCallback(async () => {
    try {
      storeActions.setLoading(true);
      const sessions = await getAllActiveSessions();
      storeActions.setActiveSessions(sessions);
    } catch (error) {
      logger.error('CashModule', 'Failed to refresh sessions', { error });
      storeActions.setError(error instanceof Error ? error.message : 'Error al cargar sesiones');
    } finally {
      storeActions.setLoading(false);
    }
  }, [storeActions]);

  const handleOpenSessionAPI = useCallback(
    async (input: OpenCashSessionInput) => {
      if (!user?.id) {
        notify.error({ title: 'Usuario no autenticado' });
        return;
      }

      try {
        setIsOpening(true);
        const session = await openCashSession(input, user.id);
        storeActions.addSession(session);
        await refreshSessions();
        await refreshLocations();
        notify.success({
          title: 'Sesión de caja abierta',
          description: 'La sesión se abrió correctamente'
        });
        logger.info('CashModule', 'Session opened successfully');
        return session;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al abrir sesión de caja';
        notify.error({
          title: 'Error al abrir sesión',
          description: message
        });
        logger.error('CashModule', 'Failed to open session', { error });
        throw error;
      } finally {
        setIsOpening(false);
      }
    },
    [user?.id, storeActions, refreshSessions, refreshLocations]
  );

  const handleCloseSessionAPI = useCallback(
    async (sessionId: string, input: CloseCashSessionInput) => {
      if (!user?.id) {
        notify.error({ title: 'Usuario no autenticado' });
        return;
      }

      try {
        setIsClosing(true);

        // ✅ Generar operationId en cliente para idempotency
        const operationId = SecureRandomGenerator.generateUUID();
        logger.debug('CashModule', 'Closing session with operationId', {
          sessionId,
          operationId,
        });

        // Llamar con operationId para prevenir duplicados
        const session = await closeCashSession(sessionId, input, user.id, operationId);
        storeActions.removeSession(sessionId);
        await refreshSessions();

        if (session.status === 'DISCREPANCY') {
          notify.warning({
            title: 'Sesión cerrada con diferencia',
            description: `Diferencia de $${Math.abs(session.variance || 0).toFixed(2)} - Revisar arqueo`
          });
        } else {
          notify.success({
            title: 'Sesión cerrada',
            description: 'La caja se cerró correctamente'
          });
        }

        logger.info('CashModule', 'Session closed successfully', {
          variance: session.variance,
          status: session.status,
          operationId,
        });
        return session;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al cerrar sesión de caja';
        notify.error({
          title: 'Error al cerrar sesión',
          description: message
        });
        logger.error('CashModule', 'Failed to close session', { error });
        throw error;
      } finally {
        setIsClosing(false);
      }
    },
    [user?.id, storeActions, refreshSessions]
  );

  const handleCashDropAPI = useCallback(
    async (sessionId: string, amount: number, notes?: string) => {
      try {
        setIsRecordingDrop(true);
        await recordCashDrop(sessionId, amount, notes);
        await refreshSessions();
        notify.success({
          title: 'Retiro registrado',
          description: `Se registró el retiro parcial de $${amount.toFixed(2)}`
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al registrar retiro';
        notify.error({
          title: 'Error al registrar retiro',
          description: message
        });
        throw error;
      } finally {
        setIsRecordingDrop(false);
      }
    },
    [refreshSessions]
  );

  const refresh = useCallback(async () => {
    await Promise.all([refreshLocations(), refreshSessions()]);
  }, [refreshLocations, refreshSessions]);

  const metrics = useMemo<CashPageMetrics>(() => {
    const totalCashOnHand = activeSessions.reduce((sum, session) => {
      const starting = DecimalUtils.fromValue(session.starting_cash, 'financial');
      const sales = DecimalUtils.fromValue(session.cash_sales, 'financial');
      const drops = DecimalUtils.fromValue(session.cash_drops, 'financial');

      const sessionTotal = DecimalUtils.subtract(
        DecimalUtils.add(starting, sales, 'financial'),
        drops,
        'financial'
      );

      return DecimalUtils.add(
        DecimalUtils.fromValue(sum, 'financial'),
        sessionTotal,
        'financial'
      );
    }, 0);

    const totalExpected = activeSessions.reduce((sum, session) => {
      if (session.expected_cash) {
        return DecimalUtils.add(
          DecimalUtils.fromValue(sum, 'financial'),
          DecimalUtils.fromValue(session.expected_cash, 'financial'),
          'financial'
        );
      }
      return sum;
    }, 0);

    return {
      totalLocations: moneyLocations.length,
      activeSessions: activeSessions.length,
      totalCashOnHand: DecimalUtils.toNumber(
        DecimalUtils.fromValue(totalCashOnHand, 'financial')
      ),
      totalExpected: DecimalUtils.toNumber(
        DecimalUtils.fromValue(totalExpected, 'financial')
      ),
      lastUpdate: new Date(),
    };
  }, [moneyLocations, activeSessions]);

  const handleOpenModal = useCallback((location: MoneyLocationWithAccount) => {
    setPageState((prev) => ({
      ...prev,
      showOpenModal: true,
      selectedMoneyLocation: location.id,
    }));
  }, []);

  const handleCloseOpenModal = useCallback(() => {
    setPageState((prev) => ({
      ...prev,
      showOpenModal: false,
      selectedMoneyLocation: null,
    }));
  }, []);

  const handleConfirmOpen = useCallback(
    async (input: OpenCashSessionInput) => {
      await handleOpenSessionAPI(input);
      handleCloseOpenModal();
    },
    [handleOpenSessionAPI, handleCloseOpenModal]
  );

  const handleOpenCloseModal = useCallback((session: CashSessionRow) => {
    setPageState((prev) => ({
      ...prev,
      showCloseModal: true,
      selectedSession: session,
    }));
  }, []);

  const handleCloseCloseModal = useCallback(() => {
    setPageState((prev) => ({
      ...prev,
      showCloseModal: false,
      selectedSession: null,
    }));
  }, []);

  const handleConfirmClose = useCallback(
    async (input: CloseCashSessionInput) => {
      if (!pageState.selectedSession) return;
      await handleCloseSessionAPI(pageState.selectedSession.id, input);
      handleCloseCloseModal();
    },
    [handleCloseSessionAPI, pageState.selectedSession, handleCloseCloseModal]
  );

  const actions: CashPageActions = useMemo(
    () => ({
      handleOpenSession: handleOpenModal,
      handleCloseSession: handleOpenCloseModal,
      handleCashDrop: handleCashDropAPI,
      handleTabChange: (tab: CashPageState['activeTab']) => {
        setPageState((prev) => ({ ...prev, activeTab: tab }));
      },
      handleRefresh: refresh,
    }),
    [handleOpenModal, handleOpenCloseModal, handleCashDropAPI, refresh]
  );

  const selectedLocation = useMemo(() => {
    return (
      moneyLocations.find((loc) => loc.id === pageState.selectedMoneyLocation) ||
      null
    );
  }, [moneyLocations, pageState.selectedMoneyLocation]);

  return {
    pageState,
    metrics,
    loading: loading || isOpening || isClosing,
    error: error ? (error as Error).message : null,
    moneyLocations,
    activeSessions,
    actions,
    openModal: {
      isOpen: pageState.showOpenModal,
      location: selectedLocation,
      onOpen: handleOpenModal,
      onClose: handleCloseOpenModal,
      onConfirm: handleConfirmOpen,
    },
    closeModal: {
      isOpen: pageState.showCloseModal,
      session: pageState.selectedSession,
      onOpen: handleOpenCloseModal,
      onClose: handleCloseCloseModal,
      onConfirm: handleConfirmClose,
    },
    shouldReduceAnimations,
    isOnline,
  };
}
