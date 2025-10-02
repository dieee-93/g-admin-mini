/**
 * Store Inspector - Debug tool for Zustand stores and localStorage
 * Provides real-time inspection of all application state
 */

import React, { useState, useEffect } from 'react';
import {
  ContentLayout,
  Section,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Stack,
  Typography,
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  InputField,
  CardWrapper,
  Box
} from '@/shared/ui';
// TODO: Refactorizar para usar el sistema de capabilities unificado
// import { useBusinessCapabilities } from '@/store/businessCapabilitiesStore';
import { useCapabilities } from '@/store/capabilityStore';

type StoreTab = 'business-capabilities' | 'localStorage' | 'sessionStorage' | 'live-state';

interface StateEntry {
  key: string;
  value: any;
  type: string;
  size: string;
  lastModified?: string;
}

export default function StoreInspectorPage() {
  const [activeTab, setActiveTab] = useState<StoreTab>('business-capabilities');
  const [searchTerm, setSearchTerm] = useState('');
  const [localStorageEntries, setLocalStorageEntries] = useState<StateEntry[]>([]);
  const [sessionStorageEntries, setSessionStorageEntries] = useState<StateEntry[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);

  // Get Zustand stores
  const businessCapStore = useBusinessCapabilities();

  // Load storage data
  const loadStorageData = () => {
    // LocalStorage
    const localEntries: StateEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const rawValue = localStorage.getItem(key);
          const parsedValue = rawValue ? JSON.parse(rawValue) : rawValue;
          localEntries.push({
            key,
            value: parsedValue,
            type: typeof parsedValue,
            size: new Blob([rawValue || '']).size + ' bytes',
            lastModified: 'Unknown'
          });
        } catch {
          const rawValue = localStorage.getItem(key);
          localEntries.push({
            key,
            value: rawValue,
            type: 'string',
            size: new Blob([rawValue || '']).size + ' bytes',
            lastModified: 'Unknown'
          });
        }
      }
    }

    // SessionStorage
    const sessionEntries: StateEntry[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          const rawValue = sessionStorage.getItem(key);
          const parsedValue = rawValue ? JSON.parse(rawValue) : rawValue;
          sessionEntries.push({
            key,
            value: parsedValue,
            type: typeof parsedValue,
            size: new Blob([rawValue || '']).size + ' bytes',
            lastModified: 'Unknown'
          });
        } catch {
          const rawValue = sessionStorage.getItem(key);
          sessionEntries.push({
            key,
            value: rawValue,
            type: 'string',
            size: new Blob([rawValue || '']).size + ' bytes',
            lastModified: 'Unknown'
          });
        }
      }
    }

    setLocalStorageEntries(localEntries);
    setSessionStorageEntries(sessionEntries);
    setRefreshCount(prev => prev + 1);
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  const tabs = [
    { id: 'business-capabilities' as StoreTab, label: 'Business Capabilities', icon: '🎯' },
    { id: 'localStorage' as StoreTab, label: 'LocalStorage', icon: '💾' },
    { id: 'sessionStorage' as StoreTab, label: 'SessionStorage', icon: '🗂️' },
    { id: 'live-state' as StoreTab, label: 'Live State', icon: '⚡' }
  ];

  const formatValue = (value: any, maxDepth = 3): string => {
    if (maxDepth <= 0) return '[Max depth reached]';

    try {
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      if (typeof value === 'string') return `"${value}"`;
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        if (value.length > 5) return `[Array(${value.length})]`;
        return '[' + value.map(v => formatValue(v, maxDepth - 1)).join(', ') + ']';
      }
      if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) return '{}';
        if (keys.length > 5) return `{Object with ${keys.length} keys}`;
        return '{' + keys.slice(0, 3).map(k => `${k}: ${formatValue(value[k], maxDepth - 1)}`).join(', ') +
               (keys.length > 3 ? '...' : '') + '}';
      }
      return String(value);
    } catch {
      return '[Error formatting value]';
    }
  };

  const filteredLocalStorage = localStorageEntries.filter(entry =>
    entry.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSessionStorage = sessionStorageEntries.filter(entry =>
    entry.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="📦 Store Inspector">
        <Stack spacing="md">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <InputField
              placeholder="Search stores and keys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
              style={{ maxWidth: '300px' }}
            />
            <Stack direction="row" spacing="sm">
              <Button size="sm" onClick={loadStorageData}>
                🔄 Refresh ({refreshCount})
              </Button>
              <Button
                size="sm"
                colorPalette="red"
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  loadStorageData();
                }}
              >
                🗑️ Clear All Storage
              </Button>
            </Stack>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as StoreTab)}
            variant="line"
            colorPalette="green"
          >
            <TabList>
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

            <div style={{ marginTop: '20px' }}>
              <TabPanel value="business-capabilities" padding="md">
                <Stack spacing="md">
                  <Typography variant="h6">Business Capabilities Store</Typography>

                  <CardWrapper variant="elevated">
                    <CardWrapper.Header>
                      <Typography variant="h6">Store State</Typography>
                    </CardWrapper.Header>
                    <CardWrapper.Body>
                      <Stack spacing="sm">
                        <div>
                          <strong>Profile exists:</strong> {businessCapStore.profile ? '✅' : '❌'}
                        </div>
                        {businessCapStore.profile && (
                          <>
                            <div>
                              <strong>Business Name:</strong> {businessCapStore.profile.businessName || 'Not set'}
                            </div>
                            <div>
                              <strong>Setup Completed:</strong> {businessCapStore.profile.setupCompleted ? '✅' : '❌'}
                            </div>
                            <div>
                              <strong>Capabilities:</strong> {Object.keys(businessCapStore.profile.capabilities).length} total
                            </div>
                            <div>
                              <strong>Active Capabilities:</strong> {Object.values(businessCapStore.profile.capabilities).filter(Boolean).length}
                            </div>
                          </>
                        )}
                      </Stack>
                    </CardWrapper.Body>
                  </CardWrapper>

                  <CardWrapper variant="elevated">
                    <CardWrapper.Header>
                      <Typography variant="h6">Raw Store Data</Typography>
                    </CardWrapper.Header>
                    <CardWrapper.Body>
                      <Box
                        as="pre"
                        bg="gray.100"
                        p="3"
                        borderRadius="md"
                        fontSize="xs"
                        fontFamily="mono"
                        overflow="auto"
                        maxHeight="400px"
                        whiteSpace="pre"
                        wordBreak="break-word"
                      >
                        {JSON.stringify(businessCapStore, null, 2)}
                      </Box>
                    </CardWrapper.Body>
                  </CardWrapper>
                </Stack>
              </TabPanel>

              <TabPanel value="localStorage" padding="md">
                <Stack spacing="md">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">LocalStorage ({filteredLocalStorage.length} entries)</Typography>
                    <Badge colorPalette="blue">
                      {Math.round(JSON.stringify(localStorage).length / 1024)} KB total
                    </Badge>
                  </div>

                  {filteredLocalStorage.map(entry => (
                    <CardWrapper key={entry.key} variant="elevated">
                      <CardWrapper.Header>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {entry.key}
                          </Typography>
                          <Stack direction="row" spacing="xs">
                            <Badge colorPalette="gray" size="sm">{entry.type}</Badge>
                            <Badge colorPalette="blue" size="sm">{entry.size}</Badge>
                            <Button
                              size="xs"
                              colorPalette="red"
                              onClick={() => {
                                localStorage.removeItem(entry.key);
                                loadStorageData();
                              }}
                            >
                              🗑️
                            </Button>
                          </Stack>
                        </div>
                      </CardWrapper.Header>
                      <CardWrapper.Body>
                        <Box
                          as="pre"
                          bg="gray.50"
                          p="2"
                          borderRadius="sm"
                          fontSize="2xs"
                          fontFamily="mono"
                          overflow="auto"
                          maxHeight="200px"
                          whiteSpace="pre-wrap"
                          wordBreak="break-word"
                        >
                          {formatValue(entry.value)}
                        </Box>
                      </CardWrapper.Body>
                    </CardWrapper>
                  ))}
                </Stack>
              </TabPanel>

              <TabPanel value="sessionStorage" padding="md">
                <Stack spacing="md">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">SessionStorage ({filteredSessionStorage.length} entries)</Typography>
                    <Badge colorPalette="purple">
                      {Math.round(JSON.stringify(sessionStorage).length / 1024)} KB total
                    </Badge>
                  </div>

                  {filteredSessionStorage.map(entry => (
                    <CardWrapper key={entry.key} variant="elevated">
                      <CardWrapper.Header>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {entry.key}
                          </Typography>
                          <Stack direction="row" spacing="xs">
                            <Badge colorPalette="gray" size="sm">{entry.type}</Badge>
                            <Badge colorPalette="purple" size="sm">{entry.size}</Badge>
                            <Button
                              size="xs"
                              colorPalette="red"
                              onClick={() => {
                                sessionStorage.removeItem(entry.key);
                                loadStorageData();
                              }}
                            >
                              🗑️
                            </Button>
                          </Stack>
                        </div>
                      </CardWrapper.Header>
                      <CardWrapper.Body>
                        <Box
                          as="pre"
                          bg="gray.50"
                          p="2"
                          borderRadius="sm"
                          fontSize="2xs"
                          fontFamily="mono"
                          overflow="auto"
                          maxHeight="200px"
                          whiteSpace="pre-wrap"
                          wordBreak="break-word"
                        >
                          {formatValue(entry.value)}
                        </Box>
                      </CardWrapper.Body>
                    </CardWrapper>
                  ))}
                </Stack>
              </TabPanel>

              <TabPanel value="live-state" padding="md">
                <Stack spacing="md">
                  <Typography variant="h6">Live State Monitor</Typography>
                  <Typography variant="body" style={{ color: '#666' }}>
                    Real-time state updates will be displayed here.
                    This will show all Zustand store changes as they happen.
                  </Typography>

                  <CardWrapper variant="elevated">
                    <CardWrapper.Body>
                      <Typography variant="body">
                        🚧 Feature coming soon: Live state monitoring with WebSocket-style updates
                      </Typography>
                    </CardWrapper.Body>
                  </CardWrapper>
                </Stack>
              </TabPanel>
            </div>
          </Tabs>
        </Stack>
      </Section>
    </ContentLayout>
  );
}