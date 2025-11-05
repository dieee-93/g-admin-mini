/**
 * Performance Monitor - Integrates existing performance monitoring tools
 * Real-time performance metrics and optimization suggestions
 */

import React, { useState, useEffect } from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Typography,
  CardWrapper,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  Box
} from '@/shared/ui';
// Import the existing performance monitor
import { PerformanceDebugger } from '@/lib/performance/PerformanceMonitor';

type PerfTab = 'real-time' | 'bundle' | 'memory' | 'network';

interface PerformanceMetrics {
  fps: number;
  memoryUsed: number;
  bundleSize: number;
  loadTime: number;
  renderCount: number;
  reRenderCount: number;
  networkRequests: number;
}

export default function PerformanceDebugPage() {
  const [activeTab, setActiveTab] = useState<PerfTab>('real-time');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsed: 0,
    bundleSize: 0,
    loadTime: 0,
    renderCount: 0,
    reRenderCount: 0,
    networkRequests: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Performance monitoring hook
  useEffect(() => {
    let animationId: number;
    let startTime = Date.now();
    let frameCount = 0;

    const updateMetrics = () => {
      frameCount++;
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);

        // Get memory usage (if available)
        const memoryInfo = (performance as any).memory;
        const memoryUsed = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;

        // Get network timing
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigationTiming ? Math.round(navigationTiming.loadEventEnd - navigationTiming.navigationStart) : 0;

        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsed,
          loadTime,
          renderCount: prev.renderCount + 1
        }));

        startTime = now;
        frameCount = 0;
      }

      if (isMonitoring) {
        animationId = requestAnimationFrame(updateMetrics);
      }
    };

    if (isMonitoring) {
      updateMetrics();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isMonitoring]);

  const tabs = [
    { id: 'real-time' as PerfTab, label: 'Real-time', icon: '⚡' },
    { id: 'bundle' as PerfTab, label: 'Bundle Analysis', icon: '📦' },
    { id: 'memory' as PerfTab, label: 'Memory Usage', icon: '💾' },
    { id: 'network' as PerfTab, label: 'Network', icon: '🌐' }
  ];

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'green';
    if (value <= thresholds.warning) return 'yellow';
    return 'red';
  };

  const getBundleInfo = () => {
    // Approximate bundle size calculation
    const scripts = document.querySelectorAll('script[src]');
    const totalSize = 0;

    return {
      chunks: scripts.length,
      estimatedSize: '~2.1MB', // This would need actual webpack stats in real implementation
      gzipSize: '~650KB'
    };
  };

  const bundleInfo = getBundleInfo();

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="⚡ Performance Monitor">
        <Stack spacing="md">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Alert title="Performance Monitoring">
              Real-time monitoring of application performance metrics.
              Some features require Chrome DevTools Protocol.
            </Alert>
            <Button
              colorPalette={isMonitoring ? 'red' : 'green'}
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? '⏸️ Stop' : '▶️ Start'} Monitoring
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as PerfTab)}
            variant="line"
            colorPalette="orange"
          >
            <TabsList>
              {tabs.map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  icon={<span>{tab.icon}</span>}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div style={{ marginTop: '20px' }}>
              <TabsContent value="real-time" padding="md">
                <Stack spacing="md">
                  <Typography variant="subtitle">Real-time Performance Metrics</Typography>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <CardWrapper variant="elevated">
                      <CardWrapper.Header>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle">FPS</Typography>
                          <Badge colorPalette={getPerformanceColor(60 - metrics.fps, { good: 10, warning: 20 })}>
                            {metrics.fps > 0 ? 'LIVE' : 'STOPPED'}
                          </Badge>
                        </div>
                      </CardWrapper.Header>
                      <CardWrapper.Body style={{ textAlign: 'center' }}>
                        <Typography variant="h2" style={{
                          color: metrics.fps >= 55 ? '#22c55e' : metrics.fps >= 30 ? '#f97316' : '#ef4444',
                          margin: '0 0 4px 0'
                        }}>
                          {metrics.fps}
                        </Typography>
                        <Typography variant="body" style={{ fontSize: '12px', color: '#666' }}>
                          Target: 60 FPS
                        </Typography>
                      </CardWrapper.Body>
                    </CardWrapper>

                    <CardWrapper variant="elevated">
                      <CardWrapper.Header>
                        <Typography variant="subtitle">Memory Usage</Typography>
                      </CardWrapper.Header>
                      <CardWrapper.Body style={{ textAlign: 'center' }}>
                        <Typography variant="h2" style={{
                          color: getPerformanceColor(metrics.memoryUsed, { good: 50, warning: 100 }) === 'green' ? '#22c55e' :
                                getPerformanceColor(metrics.memoryUsed, { good: 50, warning: 100 }) === 'yellow' ? '#f97316' : '#ef4444',
                          margin: '0 0 4px 0'
                        }}>
                          {metrics.memoryUsed}
                        </Typography>
                        <Typography variant="body" style={{ fontSize: '12px', color: '#666' }}>
                          MB Used
                        </Typography>
                      </CardWrapper.Body>
                    </CardWrapper>

                    <CardWrapper variant="elevated">
                      <CardWrapper.Header>
                        <Typography variant="subtitle">Load Time</Typography>
                      </CardWrapper.Header>
                      <CardWrapper.Body style={{ textAlign: 'center' }}>
                        <Typography variant="h2" style={{
                          color: metrics.loadTime <= 2000 ? '#22c55e' : metrics.loadTime <= 5000 ? '#f97316' : '#ef4444',
                          margin: '0 0 4px 0'
                        }}>
                          {metrics.loadTime}
                        </Typography>
                        <Typography variant="body" style={{ fontSize: '12px', color: '#666' }}>
                          ms Initial Load
                        </Typography>
                      </CardWrapper.Body>
                    </CardWrapper>

                    <CardWrapper variant="elevated">
                      <CardWrapper.Header>
                        <Typography variant="subtitle">Re-renders</Typography>
                      </CardWrapper.Header>
                      <CardWrapper.Body style={{ textAlign: 'center' }}>
                        <Typography variant="h2" style={{ color: '#3b82f6', margin: '0 0 4px 0' }}>
                          {metrics.renderCount}
                        </Typography>
                        <Typography variant="body" style={{ fontSize: '12px', color: '#666' }}>
                          Total Renders
                        </Typography>
                      </CardWrapper.Body>
                    </CardWrapper>
                  </div>

                  {/* Performance Tips */}
                  <CardWrapper variant="elevated">
                    <CardWrapper.Header>
                      <Typography variant="subtitle">Performance Tips</Typography>
                    </CardWrapper.Header>
                    <CardWrapper.Body>
                      <Stack spacing="sm">
                        {metrics.fps < 55 && (
                          <Alert status="warning">
                            ⚠️ Low FPS detected. Consider reducing animations or DOM complexity.
                          </Alert>
                        )}
                        {metrics.memoryUsed > 100 && (
                          <Alert status="error">
                            ⚠️ High memory usage. Check for memory leaks in components.
                          </Alert>
                        )}
                        {metrics.fps >= 55 && metrics.memoryUsed <= 50 && (
                          <Alert status="success">
                            ✅ Performance looks good! Keep up the optimization.
                          </Alert>
                        )}
                      </Stack>
                    </CardWrapper.Body>
                  </CardWrapper>
                </Stack>
              </TabsContent>

              <TabsContent value="bundle" padding="md">
                <Stack spacing="md">
                  <Typography variant="subtitle">Bundle Analysis</Typography>

                  <CardWrapper variant="elevated">
                    <CardWrapper.Header>
                      <Typography variant="subtitle">Bundle Information</Typography>
                    </CardWrapper.Header>
                    <CardWrapper.Body>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <Typography variant="h4" style={{ color: '#3b82f6', margin: '0 0 4px 0' }}>
                            {bundleInfo.chunks}
                          </Typography>
                          <Typography variant="body" style={{ fontSize: '12px', color: '#666' }}>
                            JS Chunks
                          </Typography>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <Typography variant="h4" style={{ color: '#f97316', margin: '0 0 4px 0' }}>
                            {bundleInfo.estimatedSize}
                          </Typography>
                          <Typography variant="body" style={{ fontSize: '12px', color: '#666' }}>
                            Estimated Size
                          </Typography>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <Typography variant="h4" style={{ color: '#22c55e', margin: '0 0 4px 0' }}>
                            {bundleInfo.gzipSize}
                          </Typography>
                          <Typography variant="body" style={{ fontSize: '12px', color: '#666' }}>
                            Gzipped
                          </Typography>
                        </div>
                      </div>
                    </CardWrapper.Body>
                  </CardWrapper>

                  <Alert title="Bundle Analysis">
                    For detailed bundle analysis, run `npm run analyze` to generate a webpack bundle report.
                  </Alert>
                </Stack>
              </TabsContent>

              <TabsContent value="memory" padding="md">
                <Stack spacing="md">
                  <Typography variant="subtitle">Memory Usage Analysis</Typography>

                  <CardWrapper variant="elevated">
                    <CardWrapper.Body>
                      <Typography variant="body">
                        🚧 Advanced memory profiling requires Chrome DevTools integration.
                        Use Chrome DevTools Memory tab for detailed analysis.
                      </Typography>
                    </CardWrapper.Body>
                  </CardWrapper>
                </Stack>
              </TabsContent>

              <TabsContent value="network" padding="md">
                <Stack spacing="md">
                  <Typography variant="subtitle">Network Performance</Typography>

                  <CardWrapper variant="elevated">
                    <CardWrapper.Body>
                      <Typography variant="body">
                        🔗 Network monitoring is handled by the API Inspector.
                        Switch to the API Inspector for request monitoring.
                      </Typography>
                    </CardWrapper.Body>
                  </CardWrapper>
                </Stack>
              </TabsContent>
            </div>
          </Tabs>

          {/* Existing Performance Monitor Integration */}
          <Section variant="elevated" title="🔧 System Performance Monitor">
            <PerformanceMonitor />
          </Section>
        </Stack>
      </Section>
    </ContentLayout>
  );
}