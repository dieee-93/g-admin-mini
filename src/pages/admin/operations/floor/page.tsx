import React from 'react';
import { ContentLayout, Section, Stack, Button } from '@/shared/ui';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { FloorStats } from './components/FloorStats';
import { FloorPlanView } from './components/FloorPlanView';
import { ReservationsList } from './components/ReservationsList';
import { notify } from '@/lib/notifications';

export default function FloorManagementPage() {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    notify.success({ title: 'Data refreshed successfully' });
  };

  return (
    <ContentLayout spacing="normal">
      {/* Header Section */}
      <Section variant="flat" title="Floor Management" description="Real-time table status and restaurant operations">
        <Stack direction="row" justify="end" gap="sm">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <Icon icon={ArrowPathIcon} size="sm" />
            Refresh
          </Button>
          <Button colorPalette="info" size="sm">
            <Icon icon={PlusIcon} size="sm" />
            New Reservation
          </Button>
        </Stack>
      </Section>

      {/* Stats Section - NO tab, integrated section */}
      <FloorStats refreshTrigger={refreshTrigger} />

      {/* Floor Plan Section - Core functionality */}
      <Section variant="elevated" title="Floor Plan">
        <FloorPlanView refreshTrigger={refreshTrigger} />
      </Section>

      {/* Reservations Section - NO nested tab */}
      <Section variant="default" title="Upcoming Reservations">
        <ReservationsList />
      </Section>
    </ContentLayout>
  );
}
