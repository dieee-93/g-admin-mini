import { useState } from 'react';
import { Stack, Button } from '@/shared/ui';
import type { DeliveryZone } from '../../types/deliveryTypes';
import { ZonesList } from './ZonesList';
import { ZoneEditor } from './ZoneEditor';
import { logger } from '@/lib/logging';

interface ZonesTabProps {
  zones: DeliveryZone[];
  loading: boolean;
}

export default function ZonesTab({ zones, loading }: ZonesTabProps) {
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSaveZone = async (zoneData: Partial<DeliveryZone>) => {
    // TODO: Call deliveryApi.createZone() or updateZone()
    logger.info('ZonesTab', 'Saving zone:', zoneData);
    alert(
      `Zona guardada (TODO: implementar API):\n${JSON.stringify(zoneData, null, 2)}`
    );
    setIsCreating(false);
    setSelectedZone(null);
  };

  const handleNewZone = () => {
    setIsCreating(true);
    setSelectedZone(null);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setSelectedZone(null);
  };

  return (
    <Stack gap="md" p="md">
      <Button onClick={handleNewZone} width="fit-content">
        + Nueva Zona
      </Button>

      <Stack direction="row" gap="md" height="calc(100vh - 400px)">
        <ZonesList
          zones={zones}
          selectedZone={selectedZone}
          onSelectZone={setSelectedZone}
          loading={loading}
        />
        <ZoneEditor
          zone={isCreating ? null : selectedZone}
          onSave={handleSaveZone}
          onCancel={handleCancel}
        />
      </Stack>
    </Stack>
  );
}
