/**
 * EventBus Monitor - Real-time event debugging and monitoring
 * 
 * Features:
 * - Live event monitoring with pause/resume
 * - Event filtering by pattern, source, payload
 * - Real-time metrics dashboard
 * - Module health monitoring
 * - Event export to JSON
 */

import React from 'react';
import { ContentLayout, Section } from '@/shared/ui';
import { EventBusDebugger } from '@/components/debug/EventBusDebugger';

export default function EventBusMonitorPage() {
    return (
        <ContentLayout spacing="normal">
            <Section variant="flat" title="📡 EventBus Monitor">
                <EventBusDebugger />
            </Section>
        </ContentLayout>
    );
}
