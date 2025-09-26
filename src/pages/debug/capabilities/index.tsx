/**
 * Capabilities Debug Page - Dedicated page for capability system debugging
 * Moved from floating debugger to centralized debug section
 */

import React from 'react';
import { ContentLayout, Section } from '@/shared/ui';
import { CapabilitiesDebugger } from './CapabilitiesDebugger';

export default function CapabilitiesDebugPage() {
  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="🎯 Capabilities System Debugger">
        <CapabilitiesDebugger />
      </Section>
    </ContentLayout>
  );
}