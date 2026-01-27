/**
 * ShiftControlWidget - Hero Component for Dashboard
 *
 * REFACTORED v5.0 - MAGIC PATTERNS DESIGN:
 * ✅ Modern gradient accents and elevated cards
 * ✅ Clean spacing following Magic Patterns tokens (gap={6})
 * ✅ Top gradient border for visual hierarchy
 * ✅ Responsive grid layout
 * ✅ Dynamic content injection via HookPoints
 * 
 * Based on: 4292c6f5-14a3-4978-b79f-af113030d2f1/src/App.tsx
 *
 * @version 5.0 - Magic Patterns visual redesign
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, SimpleGrid, Flex, Text, Button, Alert, Badge } from '@/shared/ui';
import { HookPoint } from '@/lib/modules';
import { useShiftControl } from '../hooks/useShiftControl';
import { useShiftValidation } from '../hooks/useShiftValidation';
import { OpenShiftModal } from './OpenShiftModal';
import { CloseShiftModal } from './CloseShiftModal';
import { ValidationBlockersUI } from './ValidationBlockersUI';
import { ShiftHeroHeader } from './ShiftHeroHeader';
import { ShiftTotalsCard } from './ShiftTotalsCard';
import { useValidationContext } from '@/hooks';
import { useAchievementsStore } from '@/modules/achievements/store/achievementsStore';
import { logger } from '@/lib/logging';

export function ShiftControlWidget() {
  const navigate = useNavigate();
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // Use shift control hook
  const {
    currentShift,
    isOperational,
    uiState,
    cashSession,
    activeStaffCount,
    openTablesCount,
    activeDeliveriesCount,
    pendingOrdersCount,
    stockAlerts,
    alerts,
    locationName,
    totalShiftAmount,
    paymentMethods,
    loading,
    error,
    setUIState,
    dismissAlert,
    refreshShift,
  } = useShiftControl();

  // Use validation hook (for closing)
  const {
    validationResult,
    validateClose,
  } = useShiftValidation();

  // ✅ Achievements validation for opening
  const validationContext = useValidationContext();
  const openSetupModal = useAchievementsStore((state) => state.openSetupModal);

  // Derived state
  const closeBlockers = validationResult?.blockers ?? [];
  const hasBlockers = closeBlockers.length > 0;

  // ========================================
  // HANDLERS
  // ========================================

  /**
   * Validate and open shift
   * If requirements are not met, shows SetupRequiredModal from achievements
   */
  const handleOpenShift = useCallback(async () => {
    setUIState('VALIDATE_OPEN');

    try {
      // Import achievements module to validate
      const achievementsModule = await import('@/modules/achievements/manifest');
      const registry = achievementsModule.achievementsManifest;

      // Get validate hook if registered
      const validateHook = registry.hooks?.provide?.find(
        (h: string) => h === 'achievements.validate_commercial_operation'
      );

      if (validateHook) {
        // Use the validation from requirements
        const { DINEIN_MANDATORY } = await import('@/modules/achievements/requirements');

        // Check each requirement
        const missingRequirements = DINEIN_MANDATORY.filter(
          (req) => !req.validator(validationContext)
        );

        if (missingRequirements.length > 0) {
          // Some requirements not met - show setup modal
          const progress = Math.round(
            ((DINEIN_MANDATORY.length - missingRequirements.length) /
              DINEIN_MANDATORY.length) *
            100
          );

          openSetupModal({
            title: 'Configuración Dine-In Requerida',
            missing: missingRequirements, // Achievement[] completo
            progress,
            capability: 'onsite_service',
          });

          setUIState('NO_SHIFT');
          return;
        }
      }

      // All requirements met - open modal
      setIsOpenModalOpen(true);
      setUIState('OPENING_MODAL');
    } catch (err) {
      console.error('Error validating open shift:', err);
      // On error, still allow opening (fallback)
      setIsOpenModalOpen(true);
      setUIState('OPENING_MODAL');
    }
  }, [setUIState, validationContext, openSetupModal]);

  const handleCloseShiftAttempt = useCallback(async () => {
    if (!currentShift) return;

    try {
      setUIState('VALIDATE_CLOSE');

      // Run validation
      const result = await validateClose(currentShift, currentShift.opened_by);

      if (result.canClose) {
        // No blockers, show close modal
        setIsCloseModalOpen(true);
        setUIState('CLOSING_MODAL');
      } else {
        // Has blockers, stay in BLOCKED state to show ValidationBlockersUI
        setUIState('BLOCKED');
      }
    } catch (err) {
      console.error('Error validating shift close:', err);
      setUIState(isOperational ? 'SHIFT_ACTIVE' : 'NO_SHIFT');
    }
  }, [currentShift, validateClose, setUIState, isOperational]);

  const handleModalClose = useCallback(() => {
    setIsOpenModalOpen(false);
    setIsCloseModalOpen(false);

    if (uiState === 'OPENING_MODAL' || uiState === 'CLOSING_MODAL') {
      setUIState(isOperational ? 'SHIFT_ACTIVE' : 'NO_SHIFT');
    }
  }, [uiState, isOperational, setUIState]);

  const handleResolveBlockers = useCallback(() => {
    // User acknowledged blockers, return to active state
    setUIState('SHIFT_ACTIVE');
  }, [setUIState]);

  const handleViewReport = useCallback(() => {
    if (!currentShift) return;
    
    // TODO: Implement full report modal or navigation
    logger.info('Sales', 'Viewing report for shift', { 
      shiftId: currentShift.id,
      opened_at: currentShift.opened_at,
      cash_total: currentShift.cash_total,
      card_total: currentShift.card_total,
      transfer_total: currentShift.transfer_total,
      qr_total: currentShift.qr_total,
    });
  }, [currentShift]);

  const handleNewSale = useCallback(() => {
    navigate('/admin/operations/sales/pos');
  }, [navigate]);

  const handleNewCustomer = useCallback(() => {
    navigate('/admin/core/crm/customers?action=new');
  }, [navigate]);

  // ========================================
  // HOOK POINT DATA (Memoized)
  // ========================================

  const indicatorsData = useMemo(() => ({
    shiftId: currentShift?.id || '',
    cashSession,
    activeStaffCount,
    scheduledStaffCount: 0, // TODO: Get from scheduling module
    openTablesCount,
    activeDeliveriesCount,
    pendingOrdersCount,
    stockAlerts,
  }), [
    currentShift,
    cashSession,
    activeStaffCount,
    openTablesCount,
    activeDeliveriesCount,
    pendingOrdersCount,
    stockAlerts,
  ]);

  const quickActionsData = useMemo(() => ({
    shift: currentShift,
    uiState,
    refreshShift,
  }), [currentShift, uiState, refreshShift]);

  const alertsData = useMemo(() => ({
    shiftId: currentShift?.id || '',
    onDismissAlert: dismissAlert,
  }), [currentShift, dismissAlert]);

  // ========================================
  // RENDER - Magic Patterns Design
  // ========================================

  return (
    <>
      {/* Main Container with gradient border accent */}
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="2xl"
        bg="bg.surface"
        shadow={isOperational ? "xl" : "lg"}
        borderWidth="1px"
        borderColor={isOperational ? "green.200" : "border.muted"}
        transition="all 0.3s ease"
        _hover={{ shadow: "2xl" }}
      >
        {/* Top gradient border */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="4px"
          bg={isOperational 
            ? "linear-gradient(90deg, var(--chakra-colors-green-500) 0%, var(--chakra-colors-green-600) 100%)"
            : "linear-gradient(90deg, var(--chakra-colors-gray-400) 0%, var(--chakra-colors-gray-500) 100%)"
          }
        />

        <Box p="6">
          <Stack gap="6">
            {/* Hero Header with Timer, Status, and Actions */}
            <ShiftHeroHeader
              shift={currentShift}
              isOperational={isOperational}
              locationName={locationName}
              loading={loading}
              onOpenShift={handleOpenShift}
              onCloseShift={handleCloseShiftAttempt}
              onViewReport={handleViewReport}
              hasBlockers={hasBlockers}
              blockersCount={closeBlockers.length}
            />

            {/* Error Display */}
            {error && (
              <Alert.Root status="error">
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Root>
            )}

            {/* Validation Blockers UI */}
            {uiState === 'BLOCKED' && validationResult && !validationResult.canClose && (
              <ValidationBlockersUI
                validationResult={validationResult}
                onResolve={handleResolveBlockers}
              />
            )}

            {/* ============================================ */}
            {/* SHIFT TOTALS - PROMINENT (When operational) */}
            {/* ============================================ */}
            {isOperational && (
              <ShiftTotalsCard
                totalAmount={totalShiftAmount}
                paymentMethods={paymentMethods}
                cashSession={cashSession}
                loading={loading}
              />
            )}

            {/* ============================================ */}
            {/* OPERATIONAL STATUS - Module-injected widgets */}
            {/* ============================================ */}
            {isOperational && (
              <Box>
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wide">
                    🎯 Estado Operacional
                  </Text>
                  <Badge size="sm" colorPalette="green">En vivo</Badge>
                </Flex>
                
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="3">
                  <HookPoint
                    name="shift-control.indicators"
                    data={indicatorsData}
                    direction="row"
                    gap="3"
                    fallback={null}
                  />
                </SimpleGrid>
              </Box>
            )}

            {/* ============================================ */}
            {/* QUICK ACTIONS - Operational actions */}
            {/* ============================================ */}
            {isOperational && (
              <Box>
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wide">
                    ⚡ Acciones Rápidas
                  </Text>
                  <Text fontSize="xs" color="text.muted">
                    Operaciones frecuentes
                  </Text>
                </Flex>
                
                <Flex gap={3} flexWrap="wrap">
                  {/* Core operational actions */}
                  <Button
                    onClick={handleNewSale}
                    size="lg"
                    colorPalette="green"
                  >
                    🚀 Nueva Venta
                  </Button>
                  
                  <Button
                    onClick={handleNewCustomer}
                    size="lg"
                    colorPalette="blue"
                    variant="outline"
                  >
                    👤 Nuevo Cliente
                  </Button>
                  
                  {/* Module-injected actions */}
                  <HookPoint
                    name="shift-control.quick-actions"
                    data={quickActionsData}
                    direction="row"
                    gap="3"
                    fallback={null}
                  />
                </Flex>
              </Box>
            )}

            {/* ============================================ */}
            {/* ALERTS (Injected by modules) */}
            {/* ============================================ */}
            {(alerts.length > 0 || closeBlockers.length > 0) && (
              <Box
                p="4"
                bg="orange.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="orange.200"
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize="xs" fontWeight="bold" color="orange.700" textTransform="uppercase" letterSpacing="wide">
                    ⚠️ Alertas y Pendientes
                  </Text>
                  <Badge colorPalette="orange" size="sm">
                    {alerts.length + closeBlockers.length}
                  </Badge>
                </Flex>
                <Stack gap="2">
                  <HookPoint
                    name="shift-control.alerts"
                    data={alertsData}
                    direction="column"
                    gap="2"
                    fallback={null}
                  />
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Modals */}
      <OpenShiftModal
        isOpen={isOpenModalOpen}
        onClose={handleModalClose}
      />
      <CloseShiftModal
        isOpen={isCloseModalOpen}
        onClose={handleModalClose}
      />
    </>
  );
}
