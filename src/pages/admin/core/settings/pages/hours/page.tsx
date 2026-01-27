/**
 * HOURS CONFIGURATION PAGE - HookPoint Shell
 * 
 * Shell component that provides HookPoints for schedule editors.
 * Modules inject their schedule tabs based on active capabilities.
 * 
 * HOOKPOINTS PROVIDED:
 * - settings.hours.tabs: Tab triggers for different schedule types
 * - settings.hours.content: Tab content panels for schedule editors
 * 
 * INJECTION PATTERN:
 * - fulfillment-onsite → Operating Hours (if onsite_service active)
 * - fulfillment-pickup → Pickup Hours (if pickup_orders active)  
 * - fulfillment-delivery → Delivery Hours (if delivery_shipping active)
 * 
 * @version 2.0.0 - HookPoint Shell Architecture
 */

import { useState, useMemo, useEffect } from 'react';
import {
  ContentLayout,
  PageHeader,
  Section,
  Stack,
  Alert,
  Badge,
  HStack,
  Tabs
} from '@/shared/ui';
import { ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { HookPoint } from '@/lib/modules/HookPoint';
import { useModuleRegistry } from '@/lib/modules';
import { useAppStore } from '@/store/appStore';

// ============================================
// COMPONENT
// ============================================

export default function HoursPage() {
  const { registry, hasHook } = useModuleRegistry();
  const modulesInitialized = useAppStore(state => state.modulesInitialized);
  const [activeTab, setActiveTab] = useState<string>('');
  const [hasHooks, setHasHooks] = useState(false);

  // Wait for modules to initialize before checking hooks
  useEffect(() => {
    if (modulesInitialized) {
      const result = hasHook('settings.hours.tabs');
      console.log('[HoursPage] Modules initialized, checking for hooks:', {
        result,
        modulesInitialized,
        stats: registry.getStats(),
        allHooks: registry.getStats().hooks.map(h => h.name)
      });
      setHasHooks(result);
    } else {
      console.log('[HoursPage] Waiting for modules to initialize...');
    }
  }, [modulesInitialized, hasHook, registry]);

  // If no tabs registered, show empty state
  if (!hasHooks) {
    return (
      <ContentLayout spacing="normal">
        <PageHeader
          title="Configuración de Horarios"
          subtitle="Gestiona los horarios operacionales de tu negocio"
        />

        <Section
          title="Horarios Operacionales"
          description="Los horarios se configuran según las capacidades activas de tu negocio"
        >
          <Alert status="info">
            <HStack gap="2">
              <ClockIcon className="w-5 h-5" />
              <span>
                Activa capacidades como <Badge>Dine-in</Badge>, <Badge>TakeAway</Badge> o{' '}
                <Badge>Delivery</Badge> para configurar sus horarios correspondientes.
              </span>
            </HStack>
          </Alert>
        </Section>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Configuración de Horarios"
        subtitle="Gestiona los horarios operacionales de tu negocio"
      />

      <Section
        title="Horarios Operacionales"
        description="Define los horarios para cada tipo de servicio activo"
      >
        <Stack gap="6">
          <Tabs.Root
            value={activeTab}
            onValueChange={(e) => setActiveTab(e.value)}
            variant="enclosed"
          >
            <Tabs.List>
              {/* HookPoint: Modules inject their tab triggers here */}
              <HookPoint name="settings.hours.tabs" direction="row" gap="0" />
            </Tabs.List>

            {/* HookPoint: Modules inject their tab content here */}
            <HookPoint name="settings.hours.content" direction="column" gap="4" />
          </Tabs.Root>
        </Stack>
      </Section>
    </ContentLayout>
  );
}
