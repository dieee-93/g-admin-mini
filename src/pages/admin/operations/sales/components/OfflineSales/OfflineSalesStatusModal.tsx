/**
 * OfflineSalesStatusModal Component
 * Modal to display and manage offline sales pending synchronization
 * 
 * EXTRACTED FROM: OfflineSalesView.tsx (lines 574-665)
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
  CardWrapper,
} from '@/shared/ui';
import { CloudIcon } from '@heroicons/react/24/outline';

interface OfflineSale {
  id: string;
  timestamp: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  customer?: {
    id: string;
    name: string;
  };
  note?: string;
  totalAmount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  syncOperationId?: string;
}

interface OfflineSalesStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  offlineSales: OfflineSale[];
  onForceSync: () => void;
  isSyncing: boolean;
}

export function OfflineSalesStatusModal({
  isOpen,
  onClose,
  offlineSales,
  onForceSync,
  isSyncing
}: OfflineSalesStatusModalProps) {
  
  const getStatusColor = (status: OfflineSale['status']) => {
    switch (status) {
      case 'synced': return 'green';
      case 'syncing': return 'blue';
      case 'failed': return 'red';
      default: return 'orange';
    }
  };

  const getStatusLabel = (status: OfflineSale['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'syncing': return 'Sincronizando';
      case 'synced': return 'Sincronizada';
      case 'failed': return 'Error';
      default: return status;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Ventas Offline Pendientes</ModalTitle>
          <ModalClose />
        </ModalHeader>

        <ModalBody>
          <Stack gap="lg" direction="column" align="stretch">
            <Typography color="text.muted">
              {offlineSales.length} venta(s) pendiente(s) de sincronización
            </Typography>

            <Stack maxH="400px" overflowY="auto">
              <Stack gap="md" direction="column" align="stretch">
                {offlineSales.map((sale) => (
                  <CardWrapper key={sale.id}>
                    <Stack direction="row" justify="space-between" mb="2">
                      <Stack direction="column" align="start">
                        <Typography fontWeight="medium">
                          ${sale.totalAmount.toFixed(2)}
                        </Typography>
                        <Typography fontSize="sm" color="text.muted">
                          {new Date(sale.timestamp).toLocaleString()}
                        </Typography>
                      </Stack>
                      <Badge colorPalette={getStatusColor(sale.status)}>
                        {getStatusLabel(sale.status)}
                      </Badge>
                    </Stack>
                    
                    <Typography fontSize="sm" color="text.muted">
                      {sale.items.length} producto(s)
                      {sale.customer && ` • ${sale.customer.name}`}
                      {sale.note && ` • ${sale.note}`}
                    </Typography>

                    {sale.retryCount > 0 && (
                      <Typography fontSize="xs" mt="1">
                        Reintentado {sale.retryCount} veces
                      </Typography>
                    )}
                  </CardWrapper>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Stack gap="sm" direction="row">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              colorPalette="blue"
              onClick={onForceSync}
              loading={isSyncing}
              disabled={offlineSales.length === 0}
            >
              <CloudIcon className="w-4 h-4" />
              Forzar Sincronización
            </Button>
          </Stack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
