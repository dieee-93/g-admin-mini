/**
 * Capabilities Debugger v5.0 - Optimized 2-Column Layout
 *
 * NUEVO DISEÑO:
 * - Columna Izquierda: Control Panel (capabilities, infrastructure, stats)
 * - Columna Derecha: Live Impact Panel (features, modules, sync) con tabs
 * - Diff highlighting para tracking de cambios en tiempo real
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Stack,
  Badge,
  Alert,
  Box,
  Typography,
  Switch,
  Button,
  SimpleGrid,
  ContentLayout,
  Tabs,
  Grid
} from '@/shared/ui';

import {
  BUSINESS_MODEL_REGISTRY,
  type BusinessCapabilityId,
  type InfrastructureId
} from '@/config/BusinessModelRegistry';

import FEATURE_REGISTRY, {
  type FeatureId
} from '@/config/FeatureRegistry';

import {
  getAllFoundationalMilestones,
  getAllMasteryAchievements
} from '@/config/RequirementsRegistry';

import { useCapabilities } from '@/store/capabilityStore';
import type { UserProfile } from '@/store/capabilityStore';
import { logger } from '@/lib/logging';

// DB Sync imports
import {
  loadProfileFromDB,
  saveProfileToDB,
  subscribeToProfileChanges,
  hasProfileInDB
} from '@/services/businessProfileService';

export function CapabilitiesDebugger() {
  const {
    profile,
    activeFeatures,
    blockedFeatures,
    pendingMilestones,
    completedMilestones,
    validationErrors,
    toggleActivity,
    setInfrastructure,
    visibleModules
  } = useCapabilities();

  // DB Sync state
  const [dbProfile, setDbProfile] = useState<UserProfile | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hasDbProfile, setHasDbProfile] = useState(false);

  // Diff tracking state
  const previousFeatures = useRef<FeatureId[]>([]);
  const [recentChanges, setRecentChanges] = useState<{
    added: FeatureId[];
    removed: FeatureId[];
    shared: FeatureId[];
  }>({ added: [], removed: [], shared: [] });

  // Active tab
  const [activeTab, setActiveTab] = useState<'features' | 'modules' | 'sync' | 'requirements'>('features');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const totalCapabilities = Object.keys(BUSINESS_MODEL_REGISTRY?.capabilities ?? {}).length;
  const totalInfrastructure = Object.keys(BUSINESS_MODEL_REGISTRY?.infrastructure ?? {}).length;
  const totalFeatures = Object.values(FEATURE_REGISTRY ?? {}).length;
  const selectedActivities = profile?.selectedActivities ?? [];
  const selectedInfrastructure = profile?.selectedInfrastructure ?? [];

  // Track feature changes for diff highlighting
  useEffect(() => {
    const added = activeFeatures.filter(f => !previousFeatures.current.includes(f));
    const removed = previousFeatures.current.filter(f => !activeFeatures.includes(f));

    // Features compartidas: estaban activas antes Y siguen activas ahora (solo cuando hay cambios)
    const shared = (added.length > 0 || removed.length > 0)
      ? previousFeatures.current.filter(f => activeFeatures.includes(f))
      : [];

    if (added.length > 0 || removed.length > 0) {
      setRecentChanges({ added, removed, shared });

      // Clear highlighting after 3 seconds
      setTimeout(() => {
        setRecentChanges({ added: [], removed: [], shared: [] });
      }, 3000);
    }

    previousFeatures.current = activeFeatures;
  }, [activeFeatures]);

  // ============================================
  // DB SYNC FUNCTIONS
  // ============================================

  const loadDbProfile = async () => {
    try {
      setSyncStatus('syncing');
      const [profileData, exists] = await Promise.all([
        loadProfileFromDB(),
        hasProfileInDB()
      ]);
      setDbProfile(profileData);
      setHasDbProfile(exists);
      setLastSyncTime(new Date());
      setSyncStatus('idle');
      setSyncError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(errorMessage);
      setSyncStatus('error');
    }
  };

  const syncToDb = async () => {
    if (!profile) return;
    try {
      setSyncStatus('syncing');
      await saveProfileToDB(profile);
      setDbProfile(profile);
      setLastSyncTime(new Date());
      setSyncStatus('idle');
      setSyncError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(errorMessage);
      setSyncStatus('error');
    }
  };

  // Load DB profile on mount
  useEffect(() => {
    loadDbProfile();
  }, []);

  // Subscribe to real-time changes
  useEffect(() => {
    const unsubscribe = subscribeToProfileChanges((updatedProfile) => {
      setDbProfile(updatedProfile);
      setLastSyncTime(new Date());
    });
    return unsubscribe;
  }, []);

  // Filter features by search query
  const filteredActiveFeatures = activeFeatures.filter(id =>
    id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ContentLayout spacing="compact">
      {/* Compact Header */}
      <Box mb={4}>
        <Stack direction="row" justify="space-between" align="center">
          <div>
            <Typography variant="heading" fontSize="xl">
              🔧 Capabilities Debugger
            </Typography>
            <Typography variant="caption" color="gray.600">
              Interactive 2-Column Layout
            </Typography>
          </div>
          <Badge colorPalette="purple" size="md">v5.0</Badge>
        </Stack>
      </Box>

      {/* 2-Column Layout */}
      <Grid templateColumns={{ base: '1fr', lg: '35% 65%' }} gap="md">

        {/* ============================================ */}
        {/* LEFT COLUMN - Control Panel */}
        {/* ============================================ */}
        <Stack gap={4}>

          {/* Compact Stats */}
          <Box p={4} bg="gray.50" borderRadius="lg">
            <Typography variant="body" fontWeight="bold" mb={3}>
              📊 Quick Stats
            </Typography>
            <SimpleGrid columns={2} gap={3}>
              <StatItem
                label="Capabilities"
                value={`${selectedActivities.length}/${totalCapabilities}`}
                color="blue"
              />
              <StatItem
                label="Features"
                value={`${activeFeatures.length}/${totalFeatures}`}
                color="green"
              />
              <StatItem
                label="Modules"
                value={visibleModules?.length ?? 0}
                color="purple"
              />
              <StatItem
                label="Blocked"
                value={blockedFeatures.length}
                color="red"
              />
            </SimpleGrid>
          </Box>

          {/* Capabilities Controls - Always Expanded */}
          <Box p={4} bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
            <Typography variant="body" fontWeight="bold" mb={3}>
              🎯 Business Capabilities ({selectedActivities.length}/{totalCapabilities})
            </Typography>
            <Stack gap={2}>
              {Object.entries(BUSINESS_MODEL_REGISTRY?.capabilities ?? {}).map(([id, capability]) => (
                <Box
                  key={id}
                  p={2}
                  bg={selectedActivities.includes(id as BusinessCapabilityId) ? 'blue.50' : 'gray.50'}
                  borderRadius="md"
                  borderLeft="3px solid"
                  borderColor={selectedActivities.includes(id as BusinessCapabilityId) ? 'blue.500' : 'gray.300'}
                  transition="all 0.2s"
                >
                  <Stack direction="row" justify="space-between" align="center">
                    <Stack gap={0}>
                      <Stack direction="row" align="center" gap={1}>
                        <span style={{ fontSize: '16px' }}>{capability.icon}</span>
                        <Typography variant="body" fontSize="sm" fontWeight="medium">
                          {capability.name}
                        </Typography>
                        <Badge colorPalette="green" size="xs">
                          +{capability.activatesFeatures.length}
                        </Badge>
                      </Stack>
                      <Typography variant="caption" color="gray.600" fontSize="xs">
                        {capability.description}
                      </Typography>
                    </Stack>
                    <Switch
                      checked={selectedActivities.includes(id as BusinessCapabilityId)}
                      onChange={() => toggleActivity(id as BusinessCapabilityId)}
                      size="sm"
                      colorPalette="blue"
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Infrastructure Controls */}
          <Box p={4} bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
            <Typography variant="body" fontWeight="bold" mb={3}>
              🏗️ Infrastructure ({selectedInfrastructure.length}/{totalInfrastructure})
            </Typography>
            <Stack gap={2}>
              {Object.entries(BUSINESS_MODEL_REGISTRY?.infrastructure ?? {}).map(([id, infra]) => (
                <Box
                  key={id}
                  p={2}
                  bg={selectedInfrastructure.includes(id as InfrastructureId) ? 'purple.50' : 'gray.50'}
                  borderRadius="md"
                  borderLeft="3px solid"
                  borderColor={selectedInfrastructure.includes(id as InfrastructureId) ? 'purple.500' : 'gray.300'}
                  transition="all 0.2s"
                >
                  <Stack direction="row" justify="space-between" align="center">
                    <Stack gap={0}>
                      <Stack direction="row" align="center" gap={1}>
                        <span style={{ fontSize: '16px' }}>{infra.icon}</span>
                        <Typography variant="body" fontSize="sm" fontWeight="medium">
                          {infra.name}
                        </Typography>
                        {infra.activatesFeatures.length > 0 && (
                          <Badge colorPalette="green" size="xs">
                            +{infra.activatesFeatures.length}
                          </Badge>
                        )}
                      </Stack>
                      <Typography variant="caption" color="gray.600" fontSize="xs">
                        {infra.description}
                      </Typography>
                    </Stack>
                    <Switch
                      checked={selectedInfrastructure.includes(id as InfrastructureId)}
                      onChange={() => setInfrastructure(id as InfrastructureId)}
                      size="sm"
                      colorPalette="purple"
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>

        </Stack>

        {/* ============================================ */}
        {/* RIGHT COLUMN - Live Impact Panel */}
        {/* ============================================ */}
        <Box p={4} bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
          <Typography variant="heading" fontSize="lg" mb={4}>
            ⚡ Live Impact Panel
          </Typography>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="features">
                Features ({activeFeatures.length})
              </Tabs.Tab>
              <Tabs.Tab value="modules">
                Modules ({visibleModules?.length ?? 0})
              </Tabs.Tab>
              <Tabs.Tab value="sync">
                DB Sync
              </Tabs.Tab>
              {(pendingMilestones.length > 0 || validationErrors.length > 0) && (
                <Tabs.Tab value="requirements">
                  Requirements ({pendingMilestones.length + validationErrors.length})
                </Tabs.Tab>
              )}
            </Tabs.List>

            <Tabs.Panels>
            {/* Tab Panel: Features */}
            <Tabs.Panel value="features">
              <Stack gap={3} mt={4}>

                {/* Search */}
                <input
                  type="text"
                  placeholder="🔍 Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />

                {/* Active Features */}
                <Box>
                  <Typography variant="body" fontWeight="bold" mb={2} fontSize="sm">
                    ✅ Active Features ({filteredActiveFeatures.length})
                  </Typography>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {filteredActiveFeatures.map(id => {
                      const isNew = recentChanges.added.includes(id);
                      const isShared = recentChanges.shared.includes(id);

                      return (
                        <Badge
                          key={id}
                          colorPalette={isNew ? 'teal' : isShared ? 'blue' : 'green'}
                          size="sm"
                          style={{
                            animation: (isNew || isShared) ? 'pulse 0.5s ease-in-out' : undefined,
                            fontWeight: (isNew || isShared) ? 'bold' : 'normal'
                          }}
                        >
                          {isNew && '✨ '}
                          {isShared && '🔗 '}
                          {id}
                        </Badge>
                      );
                    })}
                  </div>
                </Box>

                {/* Blocked Features */}
                {blockedFeatures.length > 0 && (
                  <Box>
                    <Typography variant="body" fontWeight="bold" mb={2} fontSize="sm">
                      🔒 Blocked Features ({blockedFeatures.length})
                    </Typography>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {blockedFeatures.map(id => (
                        <Badge key={id} colorPalette="red" size="sm">
                          {id}
                        </Badge>
                      ))}
                    </div>
                  </Box>
                )}

                {/* Recently Removed */}
                {recentChanges.removed.length > 0 && (
                  <Box>
                    <Typography variant="body" fontWeight="bold" mb={2} fontSize="sm" color="red.600">
                      ❌ Recently Removed
                    </Typography>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {recentChanges.removed.map(id => (
                        <Badge
                          key={id}
                          colorPalette="red"
                          size="sm"
                          style={{ opacity: 0.6, textDecoration: 'line-through' }}
                        >
                          {id}
                        </Badge>
                      ))}
                    </div>
                  </Box>
                )}
              </Stack>
            </Tabs.Panel>

            {/* Tab Panel: Modules */}
            <Tabs.Panel value="modules">
              <Stack gap={3} mt={4}>
                <Box>
                  <Typography variant="body" fontWeight="bold" mb={2} fontSize="sm">
                    📦 Visible in Navigation ({visibleModules?.length ?? 0})
                  </Typography>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(visibleModules ?? []).map(moduleId => (
                      <Badge key={moduleId} colorPalette="indigo" size="md">
                        {moduleId}
                      </Badge>
                    ))}
                  </div>
                </Box>
              </Stack>
            </Tabs.Panel>

            {/* Tab Panel: DB Sync */}
            <Tabs.Panel value="sync">
              <Stack gap={4} mt={4}>
                <Stack direction="row" justify="space-between" align="center">
                  <Typography variant="body" fontWeight="bold">
                    🔄 Sync Status
                  </Typography>
                  <Badge
                    colorPalette={
                      syncStatus === 'error' ? 'red' :
                      syncStatus === 'syncing' ? 'orange' :
                      'green'
                    }
                    size="md"
                  >
                    {syncStatus === 'error' ? '❌ Error' :
                     syncStatus === 'syncing' ? '🔄 Syncing...' :
                     '✅ Synced'}
                  </Badge>
                </Stack>

                <SimpleGrid columns={2} gap={3}>
                  <StatItem
                    label="Last Sync"
                    value={lastSyncTime?.toLocaleTimeString() || 'Never'}
                    color="blue"
                  />
                  <StatItem
                    label="DB Profile"
                    value={hasDbProfile ? 'Exists' : 'Not Found'}
                    color={hasDbProfile ? 'green' : 'red'}
                  />
                </SimpleGrid>

                {syncError && (
                  <Alert status="error" title="Sync Error">
                    <Typography variant="body" fontSize="sm">{syncError}</Typography>
                  </Alert>
                )}

                <Stack direction="row" gap={2}>
                  <Button
                    onClick={syncToDb}
                    disabled={syncStatus === 'syncing'}
                    size="sm"
                    colorPalette="blue"
                  >
                    ⬆️ Push to DB
                  </Button>
                  <Button
                    onClick={loadDbProfile}
                    disabled={syncStatus === 'syncing'}
                    size="sm"
                    variant="outline"
                  >
                    🔄 Refresh
                  </Button>
                </Stack>

                {/* Comparison */}
                {profile && dbProfile && (
                  <Box p={3} bg="gray.50" borderRadius="md">
                    <Typography variant="body" fontWeight="bold" mb={2} fontSize="sm">
                      📊 Local vs DB
                    </Typography>
                    <Stack gap={1} fontSize="xs">
                      <ComparisonRow
                        label="Activities"
                        local={profile.selectedActivities?.length || 0}
                        db={dbProfile.selectedActivities?.length || 0}
                      />
                      <ComparisonRow
                        label="Infrastructure"
                        local={profile.selectedInfrastructure?.length || 0}
                        db={dbProfile.selectedInfrastructure?.length || 0}
                      />
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Tabs.Panel>

            {/* Tab Panel: Requirements */}
            <Tabs.Panel value="requirements">
              <Stack gap={3} mt={4}>
                {validationErrors.length > 0 && (
                  <Box>
                    <Typography variant="body" fontWeight="bold" mb={2} fontSize="sm" color="red.600">
                      ⚠️ Validation Errors ({validationErrors.length})
                    </Typography>
                    <Stack gap={2}>
                      {validationErrors.map((error, idx) => (
                        <Box key={idx} p={2} bg="red.50" borderRadius="md" borderLeft="3px solid" borderColor="red.500">
                          <Typography variant="body" fontSize="sm" fontWeight="medium">
                            {error.message}
                          </Typography>
                          <Typography variant="caption" color="gray.600" fontSize="xs">
                            {error.field} → {error.redirectTo}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                {pendingMilestones.length > 0 && (
                  <Box>
                    <Typography variant="body" fontWeight="bold" mb={2} fontSize="sm">
                      ⏳ Pending Milestones ({pendingMilestones.length})
                    </Typography>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {pendingMilestones.map(id => (
                        <Badge key={id} colorPalette="orange" size="sm">
                          {id}
                        </Badge>
                      ))}
                    </div>
                  </Box>
                )}
              </Stack>
            </Tabs.Panel>

            </Tabs.Panels>
          </Tabs>
        </Box>

      </Grid>

      {/* Add pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </ContentLayout>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

interface StatItemProps {
  label: string;
  value: string | number;
  color: string;
}

function StatItem({ label, value, color }: StatItemProps) {
  return (
    <Box p={2} bg={`${color}.50`} borderRadius="md">
      <Typography variant="caption" color="gray.600" fontSize="xs">
        {label}
      </Typography>
      <Typography variant="heading" fontSize="lg" color={`${color}.700`}>
        {value}
      </Typography>
    </Box>
  );
}

interface ComparisonRowProps {
  label: string;
  local: number;
  db: number;
}

function ComparisonRow({ label, local, db }: ComparisonRowProps) {
  const isDifferent = local !== db;

  return (
    <Stack direction="row" justify="space-between" align="center">
      <Typography variant="body" fontSize="xs" fontWeight="medium">{label}</Typography>
      <Stack direction="row" gap={2} align="center">
        <Badge colorPalette="blue" size="xs">L:{local}</Badge>
        <Badge colorPalette={isDifferent ? 'orange' : 'green'} size="xs">
          DB:{db}
        </Badge>
        {isDifferent && <span style={{ fontSize: '12px' }}>⚠️</span>}
      </Stack>
    </Stack>
  );
}
