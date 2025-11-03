/**
 * Capabilities Debug Page - Dedicated page for capability system debugging
 * Moved from floating debugger to centralized debug section
 *
 * NOTE: CapabilitiesDebugger component is deprecated. Showing placeholder.
 */

import React from 'react';
import { ContentLayout, Section, Box, Text } from '@/shared/ui';

export default function CapabilitiesDebugPage() {
  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="🎯 Capabilities System Debugger">
        <Box p="6" textAlign="center">
          <Text fontSize="xl" fontWeight="bold" mb="4">
            Capabilities Debugger (Deprecated)
          </Text>
          <Text color="fg.muted">
            This debugger has been deprecated. Use the Module Registry system instead.
          </Text>
        </Box>
      </Section>
    </ContentLayout>
  );
}