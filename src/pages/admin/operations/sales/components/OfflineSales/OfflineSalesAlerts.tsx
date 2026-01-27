/**
 * OfflineSalesAlerts Component
 * Alerts section for OfflineSalesView showing offline mode and cart validation
 * 
 * EXTRACTED FROM: OfflineSalesView.tsx (lines 586-601)
 */

import { Alert } from '@/shared/ui';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CartQuickAlert } from '../CartValidationSummary';
import type { StockValidationResult } from '@/modules/sales/hooks/usePOSCart';

interface OfflineSalesAlertsProps {
  isOnline: boolean;
  validationResult: StockValidationResult | null;
  isValidating: boolean;
}

export function OfflineSalesAlerts({
  isOnline,
  validationResult,
  isValidating,
}: OfflineSalesAlertsProps) {
  return (
    <>
      {/* Offline Mode Alert */}
      {!isOnline && (
        <Alert status="warning">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <Alert.Title>Modo Offline Activo</Alert.Title>
          <Alert.Description>
            Las ventas se guardarán localmente y se sincronizarán automáticamente cuando se restablezca la conexión.
          </Alert.Description>
        </Alert>
      )}

      {/* Cart Validation Alert */}
      <CartQuickAlert 
        validationResult={validationResult}
        isValidating={isValidating}
        isOffline={!isOnline}
      />
    </>
  );
}
