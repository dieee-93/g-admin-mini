/**
 * ASSET DETAIL MODAL
 * View asset details
 */

import { Dialog, Stack, Text, Badge, Button } from '@/shared/ui';
// import { HookPoint } from '@/lib/modules/HookPoint';
import type { Asset } from '../types';

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onEdit?: (asset: Asset) => void;
}

export function AssetDetailModal({ isOpen, onClose, asset, onEdit }: AssetDetailModalProps) {
  if (!asset) return null;

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
      <Text variant="secondary" weight="medium">
        {label}:
      </Text>
      <div>{value || '-'}</div>
    </div>
  );

  const getStatusBadge = (status: Asset['status']) => {
    const colors = {
      available: 'green',
      in_use: 'blue',
      maintenance: 'yellow',
      retired: 'gray',
      rented: 'purple',
    };
    return (
      <Badge size="sm" colorPalette={colors[status] || 'gray'}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size={{ base: 'full', md: 'lg' }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>Detalles del Asset</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap={4}>
        {/* Header */}
        <div>
          <Text size="2xl" weight="bold">
            {asset.name}
          </Text>
          <Text variant="secondary" size="sm">
            {asset.asset_code}
          </Text>
        </div>

        {/* Basic Info */}
        <div>
          <Text weight="bold" style={{ marginBottom: '0.5rem' }}>
            Información Básica
          </Text>
          <Stack gap={1}>
            <DetailRow label="Categoría" value={asset.category} />
            <DetailRow label="Descripción" value={asset.description} />
            <DetailRow label="Estado" value={getStatusBadge(asset.status)} />
            <DetailRow label="Ubicación" value={asset.location} />
          </Stack>
        </div>

        <hr style={{ borderColor: 'var(--border-subtle)' }} />

        {/* Financial Info */}
        <div>
          <Text weight="bold" style={{ marginBottom: '0.5rem' }}>
            Información Financiera
          </Text>
          <Stack gap={1}>
            <DetailRow
              label="Precio de Compra"
              value={asset.purchase_price ? formatCurrency(asset.purchase_price) : '-'}
            />
            <DetailRow
              label="Valor Actual"
              value={asset.current_value ? formatCurrency(asset.current_value) : '-'}
            />
            <DetailRow
              label="Fecha de Compra"
              value={asset.purchase_date ? formatDate(asset.purchase_date) : '-'}
            />
          </Stack>
        </div>

        {/* Rental Info (if rentable) */}
        {asset.is_rentable && (
          <>
            <hr style={{ borderColor: 'var(--border-subtle)' }} />
            <div>
              <Text weight="bold" style={{ marginBottom: '0.5rem' }}>
                Información de Alquiler
              </Text>
              <Stack gap={1}>
                <DetailRow
                  label="Alquilable"
                  value={
                    <Badge size="sm" colorPalette="purple">
                      Sí
                    </Badge>
                  }
                />
                <DetailRow
                  label="Precio Diario"
                  value={
                    asset.rental_price_per_day
                      ? formatCurrency(asset.rental_price_per_day)
                      : '-'
                  }
                />
                <DetailRow
                  label="Precio por Hora"
                  value={
                    asset.rental_price_per_hour
                      ? formatCurrency(asset.rental_price_per_hour)
                      : '-'
                  }
                />
                <DetailRow
                  label="Actualmente Alquilado"
                  value={asset.currently_rented ? 'Sí' : 'No'}
                />
              </Stack>
            </div>
          </>
        )}

        {/* Notes */}
        {asset.notes && (
          <>
            <hr style={{ borderColor: 'var(--border-subtle)' }} />
            <div>
              <Text weight="bold" style={{ marginBottom: '0.5rem' }}>
                Notas
              </Text>
              <Text variant="secondary">{asset.notes}</Text>
            </div>
          </>
        )}

        {/* 🎯 HOOK POINT: Rentals can inject rental history section here */}
        {/* <HookPoint hookName="assets.detail.sections" hookParams={asset} /> */}
      </Stack>

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'flex-end',
          marginTop: '1.5rem',
        }}
      >
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        {onEdit && <Button onClick={() => onEdit(asset)}>Editar</Button>}
      </div>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
