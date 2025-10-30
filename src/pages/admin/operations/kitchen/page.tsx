import React from 'react';
import { ContentLayout, Section, Stack, Button, Alert } from '@/shared/ui';
import { CogIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';

export default function KitchenPage() {
  const [configOpen, setConfigOpen] = React.useState(false);

  return (
    <ContentLayout spacing="normal">
      {/* Header Section */}
      <Section
        variant="flat"
        title="Kitchen Display System"
        description="Real-time kitchen order management and display"
      >
        <Stack direction="row" justify="end">
          <Button
            variant="outline"
            onClick={() => setConfigOpen(true)}
            size="sm"
          >
            <Icon icon={CogIcon} size="sm" />
            Configuration
          </Button>
        </Stack>
      </Section>

      {/* Info Alert - KDS migrated but needs reconnection */}
      <Section variant="elevated">
        <Alert status="info" title="Kitchen Display System Migrated">
          The KDS component has been migrated from Sales to this dedicated Kitchen module.
          EventBus integration and real-time order display will be activated once routing is complete.
        </Alert>
      </Section>

      {/* TODO: Activate KDS component after routing is complete */}
      {/* <Section variant="elevated" title="Active Orders">
        <KitchenDisplay />
      </Section> */}

      {/* TODO: Create KitchenConfigDrawer component */}
      {/* <KitchenConfigDrawer
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
      /> */}
    </ContentLayout>
  );
}
