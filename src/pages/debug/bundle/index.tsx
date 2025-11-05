/**
 * Bundle Analyzer Debug Tool - Analyze bundle size and dependencies
 * Provides insights into module sizes, dependencies, and optimization opportunities
 */

import React, { useState, useEffect } from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Typography,
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Progress,
  Alert
} from '@/shared/ui';

interface ModuleInfo {
  name: string;
  size: number;
  gzipSize: number;
  dependencies: string[];
  type: 'chunk' | 'module' | 'asset';
  optimizable: boolean;
}

interface BundleStats {
  totalSize: number;
  gzipSize: number;
  moduleCount: number;
  chunkCount: number;
  assetCount: number;
  duplicateModules: string[];
}

// Mock data - In real implementation, this would come from webpack stats or build tools
const mockModules: ModuleInfo[] = [
  {
    name: '@chakra-ui/react',
    size: 234567,
    gzipSize: 87654,
    dependencies: ['@emotion/react', '@emotion/styled', 'framer-motion'],
    type: 'module',
    optimizable: true
  },
  {
    name: 'react',
    size: 45632,
    gzipSize: 15234,
    dependencies: [],
    type: 'module',
    optimizable: false
  },
  {
    name: 'react-router-dom',
    size: 87432,
    gzipSize: 32145,
    dependencies: ['history', 'react-router'],
    type: 'module',
    optimizable: true
  },
  {
    name: 'debug-dashboard',
    size: 12345,
    gzipSize: 4567,
    dependencies: ['@/shared/ui', 'react'],
    type: 'chunk',
    optimizable: false
  },
  {
    name: 'capabilities-debug',
    size: 9876,
    gzipSize: 3456,
    dependencies: ['@/shared/ui', '@/lib/capabilities'],
    type: 'chunk',
    optimizable: false
  },
  {
    name: 'theme-debug',
    size: 8765,
    gzipSize: 3123,
    dependencies: ['@/shared/ui'],
    type: 'chunk',
    optimizable: false
  },
  {
    name: 'stores-debug',
    size: 11234,
    gzipSize: 4123,
    dependencies: ['@/shared/ui', 'zustand'],
    type: 'chunk',
    optimizable: false
  },
  {
    name: 'heroicons',
    size: 156789,
    gzipSize: 32456,
    dependencies: [],
    type: 'module',
    optimizable: true
  }
];

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getModuleTypeColor = (type: string) => {
  switch (type) {
    case 'chunk': return 'blue';
    case 'module': return 'green';
    case 'asset': return 'orange';
    default: return 'gray';
  }
};

export default function BundleAnalyzer() {
  const [selectedModule, setSelectedModule] = useState<ModuleInfo | null>(null);
  const [sortBy, setSortBy] = useState<'size' | 'name' | 'gzip'>('size');
  const [filterType, setFilterType] = useState<'all' | 'chunk' | 'module' | 'asset'>('all');
  const [bundleStats, setBundleStats] = useState<BundleStats | null>(null);

  // Calculate bundle statistics
  useEffect(() => {
    const totalSize = mockModules.reduce((sum, mod) => sum + mod.size, 0);
    const gzipSize = mockModules.reduce((sum, mod) => sum + mod.gzipSize, 0);
    const moduleCount = mockModules.filter(m => m.type === 'module').length;
    const chunkCount = mockModules.filter(m => m.type === 'chunk').length;
    const assetCount = mockModules.filter(m => m.type === 'asset').length;

    // Find duplicate modules (simplified)
    const moduleNames = mockModules.map(m => m.name);
    const duplicateModules = moduleNames.filter((name, index) =>
      moduleNames.indexOf(name) !== index
    );

    setBundleStats({
      totalSize,
      gzipSize,
      moduleCount,
      chunkCount,
      assetCount,
      duplicateModules
    });
  }, []);

  // Filter and sort modules
  const filteredModules = mockModules
    .filter(module => filterType === 'all' || module.type === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'size':
          return b.size - a.size;
        case 'gzip':
          return b.gzipSize - a.gzipSize;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Calculate largest modules
  const largestModules = [...mockModules]
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="📊 Bundle Analyzer">
        <Typography variant="body" style={{ color: '#666', marginBottom: '24px' }}>
          Analyze bundle composition, identify optimization opportunities, and monitor dependency sizes.
        </Typography>

        <Stack spacing="lg">
          {/* Bundle Overview */}
          {bundleStats && (
            <Section variant="elevated" title="Bundle Statistics">
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing="md">
                <Card variant="elevated">
                  <CardBody style={{ textAlign: 'center' }}>
                    <Typography variant="h4" colorPalette="blue">
                      {formatBytes(bundleStats.totalSize)}
                    </Typography>
                    <Typography variant="sm" style={{ color: '#666' }}>
                      Total Size
                    </Typography>
                  </CardBody>
                </Card>

                <Card variant="elevated">
                  <CardBody style={{ textAlign: 'center' }}>
                    <Typography variant="h4" colorPalette="green">
                      {formatBytes(bundleStats.gzipSize)}
                    </Typography>
                    <Typography variant="sm" style={{ color: '#666' }}>
                      Gzipped Size
                    </Typography>
                  </CardBody>
                </Card>

                <Card variant="elevated">
                  <CardBody style={{ textAlign: 'center' }}>
                    <Typography variant="h4" colorPalette="purple">
                      {bundleStats.moduleCount}
                    </Typography>
                    <Typography variant="sm" style={{ color: '#666' }}>
                      Modules
                    </Typography>
                  </CardBody>
                </Card>

                <Card variant="elevated">
                  <CardBody style={{ textAlign: 'center' }}>
                    <Typography variant="h4" colorPalette="orange">
                      {bundleStats.chunkCount}
                    </Typography>
                    <Typography variant="sm" style={{ color: '#666' }}>
                      Chunks
                    </Typography>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Compression Ratio */}
              <Stack spacing="sm" style={{ marginTop: '16px' }}>
                <Stack direction="row" justify="space-between" align="center">
                  <Typography variant="sm" fontWeight="medium">
                    Compression Efficiency
                  </Typography>
                  <Typography variant="sm" style={{ color: '#666' }}>
                    {((1 - bundleStats.gzipSize / bundleStats.totalSize) * 100).toFixed(1)}% reduction
                  </Typography>
                </Stack>
                <Progress
                  value={(bundleStats.gzipSize / bundleStats.totalSize) * 100}
                  colorPalette="green"
                />
              </Stack>
            </Section>
          )}

          {/* Largest Modules */}
          <Section variant="elevated" title="Largest Modules">
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="md">
              {largestModules.map((module, index) => (
                <Card key={module.name} variant="elevated">
                  <CardHeader>
                    <Stack direction="row" justify="space-between" align="center">
                      <Stack direction="row" align="center" spacing="sm">
                        <Badge colorPalette="red" size="sm">
                          #{index + 1}
                        </Badge>
                        <Typography variant="subtitle" style={{ fontSize: '14px' }}>
                          {module.name}
                        </Typography>
                      </Stack>
                      <Badge colorPalette={getModuleTypeColor(module.type)} size="sm">
                        {module.type}
                      </Badge>
                    </Stack>
                  </CardHeader>
                  <CardBody>
                    <Stack spacing="sm">
                      <Stack direction="row" justify="space-between">
                        <Typography variant="sm">Size:</Typography>
                        <Typography variant="sm" fontWeight="medium">
                          {formatBytes(module.size)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justify="space-between">
                        <Typography variant="sm">Gzipped:</Typography>
                        <Typography variant="sm" fontWeight="medium">
                          {formatBytes(module.gzipSize)}
                        </Typography>
                      </Stack>
                      {module.dependencies.length > 0 && (
                        <Stack spacing="xs">
                          <Typography variant="sm" fontWeight="medium">Dependencies:</Typography>
                          <Stack direction="row" wrap="wrap" spacing="xs">
                            {module.dependencies.slice(0, 3).map(dep => (
                              <Badge key={dep} colorPalette="gray" size="xs">
                                {dep}
                              </Badge>
                            ))}
                            {module.dependencies.length > 3 && (
                              <Badge colorPalette="gray" size="xs">
                                +{module.dependencies.length - 3} more
                              </Badge>
                            )}
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Section>

          {/* Module Explorer */}
          <Section variant="elevated" title="Module Explorer">
            <Stack spacing="md">
              {/* Filters */}
              <Stack direction="row" spacing="md" align="center" wrap="wrap">
                <Stack spacing="xs">
                  <Typography variant="sm" fontWeight="medium">Sort By</Typography>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      background: 'white'
                    }}
                  >
                    <option value="size">Size</option>
                    <option value="gzip">Gzipped Size</option>
                    <option value="name">Name</option>
                  </select>
                </Stack>

                <Stack spacing="xs">
                  <Typography variant="sm" fontWeight="medium">Filter Type</Typography>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      background: 'white'
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="chunk">Chunks</option>
                    <option value="module">Modules</option>
                    <option value="asset">Assets</option>
                  </select>
                </Stack>

                <Badge colorPalette="blue" size="lg">
                  {filteredModules.length} items
                </Badge>
              </Stack>

              {/* Module List */}
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Stack spacing="xs">
                  {filteredModules.map(module => (
                    <Card
                      key={module.name}
                      variant="elevated"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        ':hover': { transform: 'translateX(4px)' }
                      }}
                      onClick={() => setSelectedModule(module)}
                    >
                      <CardBody>
                        <Stack direction="row" justify="space-between" align="center">
                          <Stack spacing="xs">
                            <Stack direction="row" align="center" spacing="sm">
                              <Typography variant="sm" fontWeight="medium">
                                {module.name}
                              </Typography>
                              <Badge colorPalette={getModuleTypeColor(module.type)} size="xs">
                                {module.type}
                              </Badge>
                              {module.optimizable && (
                                <Badge colorPalette="yellow" size="xs">
                                  optimizable
                                </Badge>
                              )}
                            </Stack>
                            <Typography variant="xs" style={{ color: '#666' }}>
                              {module.dependencies.length} dependencies
                            </Typography>
                          </Stack>
                          <Stack align="end" spacing="xs">
                            <Typography variant="sm" fontWeight="medium">
                              {formatBytes(module.size)}
                            </Typography>
                            <Typography variant="xs" style={{ color: '#666' }}>
                              {formatBytes(module.gzipSize)} gzipped
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardBody>
                    </Card>
                  ))}
                </Stack>
              </div>
            </Stack>
          </Section>

          {/* Module Details */}
          {selectedModule && (
            <Section variant="elevated" title="Module Details">
              <Card variant="elevated">
                <CardHeader>
                  <Stack direction="row" justify="space-between" align="center">
                    <Typography variant="subtitle">{selectedModule.name}</Typography>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedModule(null)}
                    >
                      Close
                    </Button>
                  </Stack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing="md">
                    <Stack spacing="sm">
                      <Typography variant="sm">
                        <strong>Type:</strong> {selectedModule.type}
                      </Typography>
                      <Typography variant="sm">
                        <strong>Size:</strong> {formatBytes(selectedModule.size)}
                      </Typography>
                      <Typography variant="sm">
                        <strong>Gzipped:</strong> {formatBytes(selectedModule.gzipSize)}
                      </Typography>
                      <Typography variant="sm">
                        <strong>Compression Ratio:</strong> {
                          ((1 - selectedModule.gzipSize / selectedModule.size) * 100).toFixed(1)
                        }%
                      </Typography>
                    </Stack>
                    <Stack spacing="sm">
                      <Typography variant="sm" fontWeight="medium">Dependencies:</Typography>
                      {selectedModule.dependencies.length === 0 ? (
                        <Typography variant="sm" style={{ color: '#666' }}>
                          No dependencies
                        </Typography>
                      ) : (
                        <Stack spacing="xs">
                          {selectedModule.dependencies.map(dep => (
                            <Badge key={dep} colorPalette="gray" size="sm">
                              {dep}
                            </Badge>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </SimpleGrid>

                  {selectedModule.optimizable && (
                    <Alert status="warning" title="Optimization Opportunity" style={{ marginTop: '16px' }}>
                      This module can be optimized through tree-shaking, code splitting, or using a lighter alternative.
                    </Alert>
                  )}
                </CardBody>
              </Card>
            </Section>
          )}

          {/* Usage Guide */}
          <Section variant="elevated" title="📖 Usage Guide">
            <Stack spacing="sm">
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • <strong>Bundle Statistics:</strong> Overview of total size, compression, and module counts
              </Typography>
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • <strong>Largest Modules:</strong> Identify the biggest contributors to bundle size
              </Typography>
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • <strong>Module Explorer:</strong> Browse all modules with sorting and filtering options
              </Typography>
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • <strong>Optimization:</strong> Look for modules marked as "optimizable" for size reduction opportunities
              </Typography>
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • <strong>Dependencies:</strong> Understand module relationships and potential duplicates
              </Typography>
            </Stack>
          </Section>
        </Stack>
      </Section>
    </ContentLayout>
  );
}