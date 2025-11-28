/**
 * EventBus Debugger Component
 * 
 * Real-time debugging tool for EventBus:
 * - Live event monitoring
 * - Event filtering and search
 * - Module health status
 * - Performance metrics
 * 
 * @security SUPER_ADMIN only (enforced by parent DebugPage)
 * @environment Development mode only
 */

import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Button,
    Input,
    Badge,
    Code,
    Tabs,
    Card,
    Grid,
    Separator,
} from '@/shared/ui';
import { useEventBus } from '@/providers/EventBusProvider';
import { EventStoreIndexedDB } from '@/lib/events/EventStore';
import type { NamespacedEvent, EventBusMetrics, ModuleHealth } from '@/lib/events/types';
import { logger } from '@/lib/logging';

// Helper to format timestamp
const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
};

// Helper to get event priority color
const getPriorityColor = (priority?: string): "red" | "orange" | "blue" | "gray" => {
    switch (priority) {
        case 'critical': return 'red';
        case 'high': return 'orange';
        case 'normal': return 'blue';
        case 'low': return 'gray';
        default: return 'blue';
    }
};

export function EventBusDebugger() {
    const { getInstance } = useEventBus();
    const eventBus = getInstance();
    const [events, setEvents] = useState<NamespacedEvent[]>([]);
    const [isLive, setIsLive] = useState(false);
    const [filter, setFilter] = useState('');
    const [metrics, setMetrics] = useState<EventBusMetrics | null>(null);
    const [moduleHealth, setModuleHealth] = useState<Record<string, ModuleHealth>>({});
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

    // Load initial events
    const loadEvents = useCallback(async () => {
        try {
            if (!eventBus) return;

            const eventStore = new EventStoreIndexedDB({ dbName: 'g-admin-events' });
            await eventStore.init();

            const recentEvents = await eventStore.query({
                limit: 50,
                fromTimestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Last hour
            });

            setEvents(recentEvents.reverse()); // Most recent first
            logger.debug('EventBusDebugger', 'Loaded initial events', { count: recentEvents.length });
        } catch (error) {
            logger.error('EventBusDebugger', 'Failed to load events', error);
        }
    }, [eventBus]);

    // Load metrics
    const loadMetrics = useCallback(async () => {
        try {
            if (!eventBus) return;

            const currentMetrics = await eventBus.getMetrics();
            setMetrics(currentMetrics);
        } catch (error) {
            logger.error('EventBusDebugger', 'Failed to load metrics', error);
        }
    }, [eventBus]);

    // Load module health
    const loadModuleHealth = useCallback(async () => {
        try {
            if (!eventBus) return;

            const health = await eventBus.getModuleHealth();
            setModuleHealth(health);
        } catch (error) {
            logger.error('EventBusDebugger', 'Failed to load module health', error);
        }
    }, [eventBus]);

    // Live event monitoring
    useEffect(() => {
        if (!isLive || !eventBus) return;

        // Subscribe to all events with wildcard
        const unsubscribe = eventBus.on('*.*', (event) => {
            setEvents(prev => [event, ...prev].slice(0, 100)); // Keep last 100 events
        });

        logger.debug('EventBusDebugger', 'Live monitoring started');

        return () => {
            unsubscribe();
            logger.debug('EventBusDebugger', 'Live monitoring stopped');
        };
    }, [isLive, eventBus]);

    // Periodic metrics update
    useEffect(() => {
        if (!eventBus) return;

        const interval = setInterval(() => {
            loadMetrics();
            loadModuleHealth();
        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, [eventBus, loadMetrics, loadModuleHealth]);

    // Initial load
    useEffect(() => {
        loadEvents();
        loadMetrics();
        loadModuleHealth();
    }, [loadEvents, loadMetrics, loadModuleHealth]);

    // Filter events
    const filteredEvents = events.filter(event => {
        if (!filter) return true;
        const lowerFilter = filter.toLowerCase();
        return (
            event.pattern.toLowerCase().includes(lowerFilter) ||
            JSON.stringify(event.payload).toLowerCase().includes(lowerFilter) ||
            event.metadata?.source?.toLowerCase().includes(lowerFilter)
        );
    });

    // Export events
    const exportEvents = useCallback(() => {
        const dataStr = JSON.stringify(filteredEvents, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `eventbus-events-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);

        logger.info('EventBusDebugger', 'Events exported', { count: filteredEvents.length });
    }, [filteredEvents]);

    // Clear events
    const clearEvents = useCallback(() => {
        setEvents([]);
        logger.info('EventBusDebugger', 'Events cleared');
    }, []);

    const toggleLive = useCallback(() => {
        setIsLive(prev => !prev);
    }, []);

    return (
        <VStack gap={4} align="stretch">
            <Heading size="lg">EventBus Debugger</Heading>

            {/* Controls */}
            <HStack gap={3} flexWrap="wrap">
                <Button
                    onClick={toggleLive}
                    colorPalette={isLive ? 'red' : 'gray'}
                    size="sm"
                >
                    {isLive ? '🔴 Live' : '⏸ Paused'}
                </Button>

                <Input
                    placeholder="Filter events (e.g., materials.*, orderId, etc.)"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    size="sm"
                    width="300px"
                />

                <Button onClick={clearEvents} size="sm" variant="outline">
                    Clear
                </Button>

                <Button onClick={exportEvents} size="sm" variant="outline">
                    Export JSON
                </Button>

                <Badge colorPalette="blue">
                    {filteredEvents.length} events
                </Badge>
            </HStack>

            <Separator />

            {/* Tabs */}
            <Tabs.Root defaultValue="events">
                <Tabs.List>
                    <Tabs.Trigger value="events">📋 Events</Tabs.Trigger>
                    <Tabs.Trigger value="metrics">📊 Metrics</Tabs.Trigger>
                    <Tabs.Trigger value="modules">🧩 Modules</Tabs.Trigger>
                </Tabs.List>

                {/* Events Tab */}
                <Tabs.Content value="events">
                    <VStack gap={2} align="stretch">
                        {filteredEvents.length === 0 ? (
                            <Box p={8} textAlign="center">
                                <Text color="gray.500">No events captured yet</Text>
                                <Text fontSize="sm" color="gray.400">
                                    {isLive ? 'Waiting for new events...' : 'Click "Live" to start monitoring'}
                                </Text>
                            </Box>
                        ) : (
                            filteredEvents.map((event) => (
                                <Card.Root key={event.id} size="sm">
                                    <Card.Body>
                                        <VStack gap={2} align="stretch">
                                            {/* Event Header */}
                                            <HStack justify="space-between">
                                                <HStack gap={2}>
                                                    <Badge colorPalette={getPriorityColor(event.metadata?.priority)}>
                                                        {event.pattern}
                                                    </Badge>
                                                    {event.metadata?.source && (
                                                        <Text fontSize="xs" color="gray.500">
                                                            from {event.metadata.source}
                                                        </Text>
                                                    )}
                                                </HStack>
                                                <Text fontSize="xs" color="gray.500">
                                                    {formatTime(event.timestamp)}
                                                </Text>
                                            </HStack>

                                            {/* Event Payload (collapsible) */}
                                            {expandedEvent === event.id ? (
                                                <Box>
                                                    <Code fontSize="xs" p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
                                                        {JSON.stringify(event.payload, null, 2)}
                                                    </Code>
                                                    <Button
                                                        size="xs"
                                                        variant="ghost"
                                                        onClick={() => setExpandedEvent(null)}
                                                        mt={1}
                                                    >
                                                        Collapse
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <Button
                                                    size="xs"
                                                    variant="ghost"
                                                    onClick={() => setExpandedEvent(event.id)}
                                                >
                                                    Show payload
                                                </Button>
                                            )}
                                        </VStack>
                                    </Card.Body>
                                </Card.Root>
                            ))
                        )}
                    </VStack>
                </Tabs.Content>

                {/* Metrics Tab */}
                <Tabs.Content value="metrics">
                    <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                        <Card.Root>
                            <Card.Body>
                                <VStack gap={1} align="start">
                                    <Text fontSize="sm" color="gray.500">Total Events</Text>
                                    <Heading size="2xl">{metrics?.totalEvents ?? 0}</Heading>
                                </VStack>
                            </Card.Body>
                        </Card.Root>

                        <Card.Root>
                            <Card.Body>
                                <VStack gap={1} align="start">
                                    <Text fontSize="sm" color="gray.500">Events/Second</Text>
                                    <Heading size="2xl">{metrics?.eventsPerSecond.toFixed(2) ?? '0.00'}</Heading>
                                </VStack>
                            </Card.Body>
                        </Card.Root>

                        <Card.Root>
                            <Card.Body>
                                <VStack gap={1} align="start">
                                    <Text fontSize="sm" color="gray.500">Active Modules</Text>
                                    <Heading size="2xl">{metrics?.activeModules ?? 0}</Heading>
                                </VStack>
                            </Card.Body>
                        </Card.Root>

                        <Card.Root>
                            <Card.Body>
                                <VStack gap={1} align="start">
                                    <Text fontSize="sm" color="gray.500">Avg Latency</Text>
                                    <Heading size="2xl">{metrics?.avgLatencyMs.toFixed(0) ?? '0'}ms</Heading>
                                </VStack>
                            </Card.Body>
                        </Card.Root>

                        <Card.Root>
                            <Card.Body>
                                <VStack gap={1} align="start">
                                    <Text fontSize="sm" color="gray.500">Error Rate</Text>
                                    <Heading size="2xl">{(metrics?.errorRate ?? 0).toFixed(1)}%</Heading>
                                </VStack>
                            </Card.Body>
                        </Card.Root>

                        <Card.Root>
                            <Card.Body>
                                <VStack gap={1} align="start">
                                    <Text fontSize="sm" color="gray.500">Queue Size</Text>
                                    <Heading size="2xl">{metrics?.queueSize ?? 0}</Heading>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    </Grid>
                </Tabs.Content>

                {/* Modules Tab */}
                <Tabs.Content value="modules">
                    <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3}>
                        {Object.entries(moduleHealth).length === 0 ? (
                            <Box p={8} textAlign="center" gridColumn="1 / -1">
                                <Text color="gray.500">No modules registered</Text>
                            </Box>
                        ) : (
                            Object.entries(moduleHealth).map(([moduleId, health]) => (
                                <Card.Root key={moduleId}>
                                    <Card.Body>
                                        <VStack gap={2} align="stretch">
                                            <HStack justify="space-between">
                                                <Text fontWeight="bold">{moduleId}</Text>
                                                <Badge colorPalette={health.isActive ? 'green' : 'gray'}>
                                                    {health.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </HStack>

                                            <VStack gap={1} align="start" fontSize="xs">
                                                <Text>Events Emitted: <strong>{health.eventsEmitted || 0}</strong></Text>
                                                <Text>Events Received: <strong>{health.eventsReceived || 0}</strong></Text>
                                                {health.lastError && (
                                                    <Text color="red.500">Last Error: {health.lastError}</Text>
                                                )}
                                            </VStack>
                                        </VStack>
                                    </Card.Body>
                                </Card.Root>
                            ))
                        )}
                    </Grid>
                </Tabs.Content>
            </Tabs.Root>
        </VStack>
    );
}
