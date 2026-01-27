/**
 * OfflineSalesCheckoutModal Component
 * Multi-step checkout modal for OfflineSalesView
 * 
 * EXTRACTED FROM: OfflineSalesView.tsx (lines 539-717)
 * 
 * STEPS:
 * 1. Validation - Stock validation
 * 2. Details - Customer info and notes
 * 3. Confirmation - Final review and process
 */

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalClose,
  Stack,
  Button,
  Typography,
  Badge,
  Alert,
  CardWrapper,
} from '@/shared/ui';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';
import { StockValidationAlert } from '../StockValidationAlert';
import type { StockValidationResult, POSCartSummary } from '@/modules/sales/hooks/usePOSCart';

export type CheckoutStep = 'validation' | 'details' | 'confirmation';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface CartStats {
  totalItems: number;
  averagePrice: number;
}

interface OfflineSalesCheckoutModalProps {
  // Modal state
  isOpen: boolean;
  onClose: () => void;
  
  // Checkout flow
  checkoutStep: CheckoutStep;
  setCheckoutStep: (step: CheckoutStep) => void;
  
  // Connection state
  isOnline: boolean;
  
  // Validation state
  validationResult: StockValidationResult | null;
  isValidating: boolean;
  
  // Cart data
  summary: POSCartSummary;
  cartStats: CartStats;
  
  // Customer data
  customers: Customer[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  note: string;
  setNote: (note: string) => void;
  
  // Processing
  isProcessing: boolean;
  
  // Actions
  onProceedToNextStep: () => void;
  onProcessSale: () => void;
}

export function OfflineSalesCheckoutModal({
  isOpen,
  onClose,
  checkoutStep,
  setCheckoutStep,
  isOnline,
  validationResult,
  isValidating,
  summary,
  cartStats,
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
  note,
  setNote,
  isProcessing,
  onProceedToNextStep,
  onProcessSale,
}: OfflineSalesCheckoutModalProps) {
  
  const handleBack = () => {
    if (checkoutStep === 'details') setCheckoutStep('validation');
    if (checkoutStep === 'confirmation') setCheckoutStep('details');
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !isProcessing && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {checkoutStep === 'validation' && 'Validación de Stock'}
            {checkoutStep === 'details' && 'Detalles de Venta'}
            {checkoutStep === 'confirmation' && 'Confirmar Venta'}
            {!isOnline && (
              <Badge colorPalette="orange" variant="subtle">
                Modo Offline
              </Badge>
            )}
          </ModalTitle>
          {!isProcessing && <ModalClose />}
        </ModalHeader>

        <ModalBody>
          <Stack gap="lg" direction="column" align="stretch">
            {/* Validation Step */}
            {checkoutStep === 'validation' && (
              <Stack gap="lg" direction="column" align="stretch">
                {!isOnline ? (
                  <Alert status="info">
                    <Alert.Title>Modo Offline</Alert.Title>
                    <Alert.Description>
                      La validación de stock se realizará con datos locales. La venta se sincronizará automáticamente.
                    </Alert.Description>
                  </Alert>
                ) : (
                  <>
                    <Typography>
                      Verificando disponibilidad de stock para todos los productos...
                    </Typography>
                    
                    <StockValidationAlert
                      validationResult={validationResult!}
                    />

                    {validationResult?.is_valid && (
                      <Alert status="success">
                        <Alert.Title>Stock confirmado</Alert.Title>
                        <Alert.Description>
                          Todos los productos tienen stock disponible. Puedes continuar con la venta.
                        </Alert.Description>
                      </Alert>
                    )}
                  </>
                )}
              </Stack>
            )}

            {/* Details Step */}
            {checkoutStep === 'details' && (
              <Stack gap="lg" direction="column" align="stretch">
                <Stack>
                  <Typography variant="body" mb="2" fontWeight="medium">Cliente</Typography>
                  <div>
                    <input 
                      placeholder="Seleccionar cliente (opcional)"
                      value={selectedCustomerId || ''}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                    />
                  </div>
                </Stack>

                <Stack>
                  <Typography variant="body" mb="2" fontWeight="medium">Nota (Opcional)</Typography>
                  <input
                    placeholder="Nota adicional para la venta..."
                    value={note}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </Stack>
              </Stack>
            )}

            {/* Confirmation Step */}
            {checkoutStep === 'confirmation' && (
              <Stack gap="lg" direction="column" align="stretch">
                <Alert status={isOnline ? "info" : "warning"}>
                  <Alert.Title>
                    {isOnline ? 'Confirmar venta' : 'Confirmar venta offline'}
                  </Alert.Title>
                  <Alert.Description>
                    {isOnline 
                      ? '¿Estás seguro de procesar esta venta? Esta acción reducirá el stock automáticamente.'
                      : '¿Estás seguro de procesar esta venta offline? Se guardará localmente y se sincronizará cuando haya conexión.'
                    }
                  </Alert.Description>
                </Alert>

                <CardWrapper>
                  <Stack gap="sm" direction="column" align="stretch">
                    <Stack direction="row" justify="space-between">
                      <Typography fontWeight="medium">Total de productos:</Typography>
                      <Typography>{cartStats.totalItems}</Typography>
                    </Stack>
                    <Stack direction="row" justify="space-between">
                      <Typography fontWeight="medium">Monto total:</Typography>
                      <Typography fontSize="lg" fontWeight="bold">
                        ${summary.totalAmount.toFixed(2)}
                      </Typography>
                    </Stack>
                    {selectedCustomerId && (
                      <Stack direction="row" justify="space-between">
                        <Typography fontWeight="medium">Cliente:</Typography>
                        <Typography>
                          {customers.find(c => c.id === selectedCustomerId)?.name || 'N/A'}
                        </Typography>
                      </Stack>
                    )}
                    <Stack direction="row" justify="space-between">
                      <Typography fontWeight="medium">Estado:</Typography>
                      <Badge colorPalette={isOnline ? 'green' : 'orange'}>
                        {isOnline ? 'Procesamiento inmediato' : 'Procesamiento offline'}
                      </Badge>
                    </Stack>
                  </Stack>
                </CardWrapper>
              </Stack>
            )}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Stack gap="md" direction="row" justify="space-between" w="full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancelar
            </Button>

            <Stack gap="sm" direction="row">
              {checkoutStep !== 'validation' && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isProcessing}
                >
                  Atrás
                </Button>
              )}

              {checkoutStep !== 'confirmation' ? (
                <Button
                  colorPalette="blue"
                  onClick={onProceedToNextStep}
                  disabled={
                    (checkoutStep === 'validation' && isOnline && (!validationResult?.is_valid || isValidating)) ||
                    isProcessing
                  }
                  loading={isValidating}
                >
                  {checkoutStep === 'validation' ? 'Continuar' : 'Siguiente'}
                </Button>
              ) : (
                <Button
                  colorPalette="green"
                  onClick={onProcessSale}
                  loading={isProcessing}
                  disabled={false}
                >
                  <CheckSolid className="w-4 h-4" />
                  {isOnline ? 'Procesar Venta' : 'Procesar Offline'}
                </Button>
              )}
            </Stack>
          </Stack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
