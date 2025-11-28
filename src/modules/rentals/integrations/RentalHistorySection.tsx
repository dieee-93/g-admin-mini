/**
 * RENTAL HISTORY SECTION
 * Section injected into Asset detail modal
 * Shows rental history for an asset
 */

import { Stack, Text, Badge } from '@/shared/ui';
import { ClockIcon } from '@heroicons/react/24/outline';
import type { Asset } from '@/pages/admin/supply-chain/assets/types';

interface RentalHistorySectionProps {
  asset: Asset;
}

export function RentalHistorySection({ asset }: RentalHistorySectionProps) {
  // Only show for rentable assets
  if (!asset.is_rentable) {
    return null;
  }

  // Mock rental history (in real app, fetch from API)
  const mockRentals = [
    {
      id: '1',
      customer_name: 'John Doe',
      start_date: '2025-01-01',
      end_date: '2025-01-05',
      status: 'completed',
    },
    {
      id: '2',
      customer_name: 'Jane Smith',
      start_date: '2025-01-10',
      end_date: '2025-01-15',
      status: 'completed',
    },
  ];

  return (
    <>
      <hr style={{ borderColor: 'var(--border-subtle)' }} />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <ClockIcon style={{ width: '1.25rem', height: '1.25rem', color: 'var(--purple-500)' }} />
          <Text weight="bold">Historial de Alquileres</Text>
        </div>

        <Stack gap={3}>
          {mockRentals.length === 0 ? (
            <Text variant="secondary" size="sm">
              No hay historial de alquileres disponible
            </Text>
          ) : (
            mockRentals.map((rental) => (
              <div
                key={rental.id}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--purple-50)',
                  borderRadius: '0.375rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <Text size="sm" weight="medium">
                    {rental.customer_name}
                  </Text>
                  <Badge size="sm" colorPalette="purple">
                    {rental.status}
                  </Badge>
                </div>
                <Text variant="secondary" size="xs">
                  {new Date(rental.start_date).toLocaleDateString()} -{' '}
                  {new Date(rental.end_date).toLocaleDateString()}
                </Text>
              </div>
            ))
          )}
        </Stack>

        {asset.currently_rented && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              backgroundColor: 'var(--yellow-50)',
              borderRadius: '0.375rem',
            }}
          >
            <Text size="sm" weight="medium" style={{ color: 'var(--yellow-800)' }}>
              Actualmente alquilado
            </Text>
            <Text variant="secondary" size="xs" style={{ color: 'var(--yellow-700)' }}>
              Este asset está actualmente en alquiler
            </Text>
          </div>
        )}
      </div>
    </>
  );
}
