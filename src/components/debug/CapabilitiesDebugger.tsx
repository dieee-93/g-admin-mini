/**
 * Enhanced CapabilitiesDebugger - Versión mejorada con interfaz optimizada
 * FEATURES: Pestañas, búsqueda, agrupación, visualización de relaciones
 */

import React, { useState, useMemo } from 'react';
import {
  Section,
  Stack,
  Typography,
  Button,
  Badge,
  Alert,
  Switch,
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  InputField
} from '@/shared/ui';
import { useCapabilities } from '@/lib/capabilities/hooks/useCapabilities';
import { useBusinessCapabilities } from '@/store/businessCapabilitiesStore';
import type { BusinessCapability } from '@/lib/capabilities/types/BusinessCapabilities';
import { shouldShowBusinessModule, getBusinessModuleFeatures, BUSINESS_MODULE_CONFIGURATIONS } from '@/lib/capabilities/businessCapabilitySystem';
import { useNavigation } from '@/contexts/NavigationContext';
import { groupCapabilitiesByCategory } from '@/lib/capabilities/utils/capabilityUtils';

type DebugTab = 'overview' | 'capabilities' | 'modules' | 'actions';

export function CapabilitiesDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DebugTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const capabilities = useCapabilities();
  const store = useBusinessCapabilities();
  const navigation = useNavigation();

  // Get ALL capabilities dynamically from store + resolved capabilities
  const capabilitiesByCategory = useMemo(() => {
    if (!store.profile?.capabilities) return {};

    // Combine store capabilities with resolved capabilities
    const storeCapabilities = Object.keys(store.profile.capabilities) as BusinessCapability[];
    const resolvedCapabilities = capabilities.resolvedCapabilities || [];

    // Create a set to avoid duplicates
    const allCapabilities = [...new Set([...storeCapabilities, ...resolvedCapabilities])] as BusinessCapability[];

    console.log('🔍 Store capabilities:', storeCapabilities);
    console.log('🔍 Resolved capabilities:', resolvedCapabilities);
    console.log('🔍 Combined capabilities:', allCapabilities);

    // Use existing function from utils
    const groups = groupCapabilitiesByCategory(allCapabilities);

    console.log('📊 Grouped capabilities:', groups);
    return groups;
  }, [store.profile?.capabilities]);

  // Search filtering
  const filteredCapabilities = useMemo(() => {
    if (!searchTerm) return capabilitiesByCategory;

    const filtered: Record<string, BusinessCapability[]> = {};
    Object.entries(capabilitiesByCategory).forEach(([category, caps]) => {
      const matchingCaps = caps.filter(cap =>
        cap.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingCaps.length > 0) {
        filtered[category] = matchingCaps;
      }
    });
    return filtered;
  }, [capabilitiesByCategory, searchTerm]);

  const handleToggleCapability = (capability: keyof typeof store.profile.capabilities) => {
    if (!store.profile) return;
    const currentValue = store.profile.capabilities[capability];
    store.setCapability(capability, !currentValue);
  };

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999
      }}>
        <Button
          size="sm"
          colorPalette="orange"
          onClick={() => setIsOpen(true)}
          style={{
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          🐛
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as DebugTab, label: 'Overview', icon: '📊' },
    { id: 'capabilities' as DebugTab, label: 'Capabilities', icon: '🎯' },
    { id: 'modules' as DebugTab, label: 'Modules', icon: '📦' },
    { id: 'actions' as DebugTab, label: 'Actions', icon: '⚡' }
  ];

  return (
    <Box style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '900px',
      height: '80vh',
      zIndex: 9999,
      border: '2px solid #ff9500',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
    }} bg="gray.100">
      {/* Header */}
      <Box style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }} bg="gray.100">
        <div>
          <Typography variant="h4">🐛 Capability Debugger</Typography>
          <Typography variant="body" style={{ fontSize: '12px', color: '#666' }}>
            {capabilities.resolvedCapabilities.length} capabilities • {navigation.modules.length} modules visible
          </Typography>
        </div>
        <Button size="sm" onClick={() => setIsOpen(false)}>✕</Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as DebugTab)}
        variant="line"
        colorPalette="orange"
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <TabList
          style={{
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0,
          }} bg="gray.100">
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              value={tab.id}
              icon={<span>{tab.icon}</span>}
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>

        {/* Content */}
        <Box style={{ flex: 1, overflow: 'auto' }} bg="gray.100">
          <TabPanel value="overview" padding="md">
            <OverviewTab
              capabilities={capabilities}
              navigation={navigation}
              store={store}
            />
          </TabPanel>

          <TabPanel value="capabilities" padding="md">
            <CapabilitiesTab
              capabilities={capabilities}
              store={store}
              filteredCapabilities={filteredCapabilities}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onToggleCapability={handleToggleCapability}
            />
          </TabPanel>

          <TabPanel value="modules" padding="md">
            <ModulesTab
              capabilities={capabilities}
              navigation={navigation}
            />
          </TabPanel>

          <TabPanel value="actions" padding="md">
            <ActionsTab
              capabilities={capabilities}
              store={store}
              capabilitiesByCategory={capabilitiesByCategory}
            />
          </TabPanel>
        </Box>
      </Tabs>
    </Box>
  );
}

// ===== COMPONENTS =====

function MetricCard({ title, value, color }: {
  title: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}) {
  const colors = {
    blue: '#3b82f6',
    green: '#22c55e',
    purple: '#a855f7',
    orange: '#f97316',
    red: '#ef4444'
  };

  return (
    <div style={{
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: `${colors[color]}15`,
      border: `1px solid ${colors[color]}30`,
      textAlign: 'center'
    }}>
      <Typography variant="body" style={{ fontSize: '12px', fontWeight: '500', color: '#666', marginBottom: '4px' }}>
        {title}
      </Typography>
      <Typography variant="h3" style={{ color: colors[color], margin: 0 }}>
        {value}
      </Typography>
    </div>
  );
}

function OverviewTab({ capabilities, navigation, store }: {
  capabilities: any;
  navigation: any;
  store: any;
}) {
  return (
    <Stack spacing="md">
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <MetricCard title="Business Model" value={capabilities.businessModel || 'Not Set'} color="blue" />
        <MetricCard title="Active" value={capabilities.activeCapabilities.length} color="green" />
        <MetricCard title="Resolved" value={capabilities.resolvedCapabilities.length} color="purple" />
        <MetricCard title="Modules" value={navigation.modules.length} color="orange" />
        <MetricCard title="Auto-Resolved" value={capabilities.autoResolvedFeatures.length} color="red" />
      </div>

      {/* Status */}
      <Section variant="elevated" title="System Status">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px' }}>
          <div>
            <strong>📊 Core</strong>
            <div style={{ marginTop: '8px', paddingLeft: '12px' }}>
              <div>Business Model: {capabilities.businessModel || 'Not set'}</div>
              <div>Operational Tier: {capabilities.operationalTier}</div>
              <div>Setup Complete: {capabilities.isSetupComplete ? '✅' : '❌'}</div>
            </div>
          </div>
          <div>
            <strong>🔧 Health</strong>
            <div style={{ marginTop: '8px', paddingLeft: '12px' }}>
              <div>Store Profile: {store.profile ? '✅' : '❌'}</div>
              <div>Capabilities Loaded: {capabilities.activeCapabilities.length > 0 ? '✅' : '❌'}</div>
              <div>Modules Visible: {navigation.modules.length}/12</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Auto-Resolved Features */}
      {capabilities.autoResolvedFeatures.length > 0 && (
        <Section variant="elevated" title="🤖 Auto-Resolved Features">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {capabilities.autoResolvedFeatures.map((feature: string) => (
              <Badge key={feature} colorPalette="green" size="sm">
                {feature}
              </Badge>
            ))}
          </div>
        </Section>
      )}
    </Stack>
  );
}

function CapabilitiesTab({ capabilities, store, filteredCapabilities, searchTerm, setSearchTerm, onToggleCapability }: {
  capabilities: any;
  store: any;
  filteredCapabilities: Record<string, BusinessCapability[]>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onToggleCapability: (cap: any) => void;
}) {
  return (
    <Stack spacing="md">
      {/* Compact Search */}
      <InputField
        placeholder="Search capabilities..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="sm"
        style={{ maxWidth: '300px' }}
      />

      {/* Store Profile Check */}
      {!store.profile ? (
        <Alert title="Store Profile Not Found">
          <Button
            size="sm"
            onClick={() => store.initializeProfile({ businessName: 'Debug Business' })}
          >
            Initialize Profile
          </Button>
        </Alert>
      ) : (
        <div>
          {Object.entries(filteredCapabilities).map(([category, caps]) => (
            <Section key={category} variant="flat" title={`${category} (${caps.length})`}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '8px' }}>
                {caps.map(cap => (
                  <Box key={cap} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: capabilities.hasCapability(cap) ? '#gray.100' : '#gray.50',
                    border: '1px solid',
                    borderColor: capabilities.hasCapability(cap) ? '#0ea5e9' : '#e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}>
                    <span style={{ fontFamily: 'monospace' }}>{cap}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {capabilities.hasCapability(cap) && (
                        <Badge colorPalette="green" size="sm">ACTIVE</Badge>
                      )}
                      {!store.profile?.capabilities.hasOwnProperty(cap) && (
                        <Badge colorPalette="blue" size="sm">AUTO</Badge>
                      )}
                      <Switch
                        checked={store.profile?.capabilities[cap] || capabilities.hasCapability(cap)}
                        onCheckedChange={() => onToggleCapability(cap)}
                        size="sm"
                        disabled={!store.profile?.capabilities.hasOwnProperty(cap)}
                      />
                    </div>
                  </Box>
                ))}
              </div>
            </Section>
          ))}
        </div>
      )}
    </Stack>
  );
}

function ModulesTab({ capabilities, navigation }: {
  capabilities: any;
  navigation: any;
}) {
  const allModules = ['dashboard', 'sales', 'operations', 'materials', 'products', 'staff', 'scheduling', 'fiscal', 'customers', 'settings', 'gamification', 'executive'];

  return (
    <Stack spacing="md">
      <Section variant="elevated" title="Module Visibility Status">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
          {allModules.map(moduleId => {
            const isVisible = navigation.modules.some((m: any) => m.id === moduleId);
            const shouldShow = shouldShowBusinessModule(moduleId, capabilities.resolvedCapabilities);
            const moduleFeatures = getBusinessModuleFeatures(moduleId, capabilities.resolvedCapabilities);

            return (
              <div key={moduleId} style={{
                padding: '12px',
                border: '1px solid',
                borderColor: isVisible ? '#22c55e' : '#ef4444',
                borderRadius: '8px',
                backgroundColor: isVisible ? '#gray.50' : '#gray.100'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Typography variant="body" style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {moduleId}
                  </Typography>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Badge colorPalette={isVisible ? 'green' : 'red'} size="sm">
                      {isVisible ? 'VISIBLE' : 'HIDDEN'}
                    </Badge>
                    <Badge colorPalette={shouldShow ? 'blue' : 'gray'} size="sm">
                      {shouldShow ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#666' }}>
                  <div>Required: {moduleFeatures.required.length}</div>
                  <div>Optional: {moduleFeatures.optional.length}</div>
                  <div>Unavailable: {moduleFeatures.unavailable.length}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </Stack>
  );
}

function ActionsTab({ capabilities, store, capabilitiesByCategory }: {
  capabilities: any;
  store: any;
  capabilitiesByCategory: Record<string, BusinessCapability[]>;
}) {
  return (
    <Stack spacing="md">
      <Section variant="elevated" title="Debug Actions">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <Button
            size="sm"
            onClick={() => {
              console.log('🐛 DEBUG INFO:', {
                storeCapabilities: store.profile?.capabilities,
                allCapabilityKeys: Object.keys(store.profile?.capabilities || {}),
                capabilitiesByCategory: capabilitiesByCategory,
                capabilities: capabilities,
                store: store.profile,
                navigation: window.location.pathname
              });
            }}
          >
            📝 Log Full State
          </Button>

          <Button
            size="sm"
            colorPalette="orange"
            onClick={() => store.resetProfile()}
          >
            🗑️ Reset Profile
          </Button>

          <Button
            size="sm"
            colorPalette="blue"
            onClick={() => {
              const stored = localStorage.getItem('business-capabilities-store');
              console.log('📦 LocalStorage:', stored ? JSON.parse(stored) : 'No data');
            }}
          >
            📦 Check Storage
          </Button>

          <Button
            size="sm"
            colorPalette="purple"
            onClick={() => {
              console.table(capabilities.resolvedCapabilities);
            }}
          >
            📊 Table View
          </Button>

          <Button
            size="sm"
            colorPalette="green"
            onClick={() => {
              if (!store.profile) {
                store.initializeProfile({ businessName: 'Debug Business' });
                console.log('✅ Profile initialized with default capabilities');
              } else {
                console.log('ℹ️ Profile already exists');
              }
            }}
          >
            🔄 Init Profile
          </Button>
        </div>
      </Section>

      <Section variant="elevated" title="Quick Setup">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          <Button
            size="sm"
            colorPalette="green"
            onClick={() => {
              store.setCapability('sells_products', true);
              store.setCapability('sells_products_for_onsite_consumption', true);
            }}
          >
            🍽️ Setup Restaurant
          </Button>

          <Button
            size="sm"
            colorPalette="blue"
            onClick={() => {
              store.setCapability('sells_products', true);
              store.setCapability('has_online_store', true);
              store.setCapability('sells_products_with_delivery', true);
            }}
          >
            🛒 Setup E-commerce
          </Button>

          <Button
            size="sm"
            colorPalette="purple"
            onClick={() => {
              store.setCapability('sells_services', true);
              store.setCapability('sells_services_by_appointment', true);
            }}
          >
            💼 Setup Services
          </Button>
        </div>
      </Section>
    </Stack>
  );
}

export default CapabilitiesDebugger;