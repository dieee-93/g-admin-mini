import { useState, useMemo } from 'react';
import { Stack, Button, Text, NativeSelect } from '@/shared/ui';
import { useLocation } from '@/contexts/LocationContext';
import { deliveryService } from '@/modules/delivery/services/deliveryService';
import type { DeliveryZone, CreateDeliveryZoneData, UpdateDeliveryZoneData } from '@/modules/delivery/types';
import { ZonesList } from './ZonesList';
import { ZoneFormModal } from '@/modules/delivery/components/ZoneFormModal';
import { useAlerts } from '@/shared/alerts';

interface ZonesTabProps {
  zones: DeliveryZone[];
  loading: boolean;
  onRefresh: () => void;
}

export default function ZonesTab({ zones, loading, onRefresh }: ZonesTabProps) {
  const { isMultiLocationMode, locations, selectedLocation } = useLocation();
  const { actions } = useAlerts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [filterLocationId, setFilterLocationId] = useState<string | null>(
    selectedLocation?.id || null
  );

  // Filter zones by selected location
  const filteredZones = useMemo(() => {
    if (!isMultiLocationMode || !filterLocationId) {
      return zones;
    }
    return zones.filter(zone => 
      zone.location_id === filterLocationId || zone.location_id === null
    );
  }, [zones, filterLocationId, isMultiLocationMode]);

  const handleSaveZone = async (zoneData: CreateDeliveryZoneData | UpdateDeliveryZoneData) => {
    try {
      // Check if updating or creating
      const isUpdate = 'id' in zoneData && zoneData.id;

      if (isUpdate) {
        // Update existing zone
        await deliveryService.updateZone(zoneData as UpdateDeliveryZoneData);
        await actions.create({
          type: 'operational',
          severity: 'success',
          context: 'fulfillment',
          intelligence_level: 'simple',
          title: 'Zona actualizada',
          description: `Zona "${zoneData.name}" actualizada exitosamente`,
          autoExpire: 3
        });
      } else {
        // Create new zone
        await deliveryService.createZone(zoneData as CreateDeliveryZoneData);
        await actions.create({
          type: 'operational',
          severity: 'success',
          context: 'fulfillment',
          intelligence_level: 'simple',
          title: 'Zona creada',
          description: `Zona "${zoneData.name}" creada exitosamente`,
          autoExpire: 3
        });
      }

      // Refresh list
      onRefresh();
    } catch (error) {
      await actions.create({
        type: 'operational',
        severity: 'error',
        context: 'fulfillment',
        intelligence_level: 'simple',
        title: 'Error al guardar zona',
        description: error instanceof Error ? error.message : 'Error desconocido',
        autoExpire: 5
      });
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleNewZone = () => {
    setEditingZone(null);
    setIsModalOpen(true);
  };

  const handleEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingZone(null);
  };

  return (
    <>
      <Stack gap="md" p="md">
        <Stack direction="row" align="center" justify="space-between">
          <Button onClick={handleNewZone}>+ Nueva Zona</Button>

          {/* Location Filter - only show if multi-location enabled */}
          {isMultiLocationMode && (
            <Stack direction="row" align="center" gap="sm" maxWidth="300px">
              <Text fontSize="sm" fontWeight="medium" whiteSpace="nowrap">
                Filtrar por:
              </Text>
              <NativeSelect.Root size="sm">
                <NativeSelect.Field
                  value={filterLocationId || 'all'}
                  onChange={(e) => setFilterLocationId(e.target.value === 'all' ? null : e.target.value)}
                >
                  <option value="all">🌍 Todas las sucursales</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      📍 {loc.name}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Stack>
          )}
        </Stack>

        <ZonesList
          zones={filteredZones}
          onEdit={handleEditZone}
          loading={loading}
        />
      </Stack>

      <ZoneFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        zone={editingZone}
        onSave={handleSaveZone}
      />
    </>
  );
}
