import React from 'react';
import { Section, Stack, Typography } from '@/shared/ui';

export function OfflineMaterialsPage() {
  return (
    <Section variant="default">
      <Stack gap="md" align="start">
        <Typography variant="heading" size="2xl" weight="bold">
          Materials - Offline Mode
        </Typography>
        <Typography variant="body" color="text.muted">
          You are currently offline. Basic materials functionality is available.
        </Typography>
      </Stack>
    </Section>
  );
}

export default OfflineMaterialsPage;