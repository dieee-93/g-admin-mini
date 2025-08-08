// src/features/products/ui/ProductionActiveTab.tsx
// Control de Producciones Activas - Real-time Production Management

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Grid,
  Progress,
  Alert,
  Separator,
  Input,
  Select,
  createListCollection
} from '@chakra-ui/react';
import {
  CogIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { notify } from '@/lib/notifications';

interface ProductionBatch {
  id: string;
  product_id: string;
  product_name: string;
  batch_size: number;
  quantity_produced: number;
  status: 'planning' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  started_at?: string;
  estimated_completion: string;
  actual_completion?: string;
  assigned_staff: string[];
  equipment_used: string[];
  quality_checks: QualityCheck[];
  notes: string;
  cost_tracking: ProductionCost;
}

interface QualityCheck {
  id: string;
  checkpoint: string;
  status: 'pending' | 'passed' | 'failed';
  checked_by?: string;
  checked_at?: string;
  notes?: string;
}

interface ProductionCost {
  materials_cost: number;
  labor_cost: number;
  overhead_cost: number;
  total_cost: number;
  cost_per_unit: number;
}

interface ProductionStats {
  active_batches: number;
  completed_today: number;
  total_units_produced: number;
  efficiency_rate: number;
  on_time_completion: number;
}

export function ProductionActiveTab() {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [stats, setStats] = useState<ProductionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [showNewBatch, setShowNewBatch] = useState(false);

  // Mock data - En producción vendría de la base de datos
  useEffect(() => {
    loadProductionData();
  }, []);

  const loadProductionData = async () => {
    setLoading(true);
    
    // Simular datos de producción activa
    const mockBatches: ProductionBatch[] = [
      {
        id: '1',
        product_id: 'prod_1',
        product_name: 'Pizza Margherita',
        batch_size: 50,
        quantity_produced: 35,
        status: 'in_progress',
        priority: 'high',
        started_at: '2024-08-07T08:00:00Z',
        estimated_completion: '2024-08-07T14:00:00Z',
        assigned_staff: ['Chef Mario', 'Assistant Ana'],
        equipment_used: ['Horno Principal', 'Mesa Prep 1'],
        quality_checks: [
          { id: '1', checkpoint: 'Masa Quality', status: 'passed', checked_by: 'Chef Mario', checked_at: '2024-08-07T09:00:00Z' },
          { id: '2', checkpoint: 'Topping Distribution', status: 'pending' },
          { id: '3', checkpoint: 'Final Quality', status: 'pending' }
        ],
        notes: 'Lote especial para evento corporativo',
        cost_tracking: {
          materials_cost: 125.50,
          labor_cost: 85.00,
          overhead_cost: 45.25,
          total_cost: 255.75,
          cost_per_unit: 5.12
        }
      },
      {
        id: '2',
        product_id: 'prod_2',
        product_name: 'Pasta Bolognese',
        batch_size: 30,
        quantity_produced: 30,
        status: 'completed',
        priority: 'medium',
        started_at: '2024-08-07T06:00:00Z',
        estimated_completion: '2024-08-07T10:00:00Z',
        actual_completion: '2024-08-07T09:45:00Z',
        assigned_staff: ['Chef Luis'],
        equipment_used: ['Cocina 2'],
        quality_checks: [
          { id: '4', checkpoint: 'Sauce Consistency', status: 'passed', checked_by: 'Chef Luis', checked_at: '2024-08-07T08:30:00Z' },
          { id: '5', checkpoint: 'Pasta Texture', status: 'passed', checked_by: 'Chef Luis', checked_at: '2024-08-07T09:30:00Z' }
        ],
        notes: 'Completado 15 minutos antes',
        cost_tracking: {
          materials_cost: 89.25,
          labor_cost: 62.50,
          overhead_cost: 32.15,
          total_cost: 183.90,
          cost_per_unit: 6.13
        }
      }
    ];

    const mockStats: ProductionStats = {
      active_batches: 3,
      completed_today: 5,
      total_units_produced: 185,
      efficiency_rate: 94,
      on_time_completion: 87
    };

    setBatches(mockBatches);
    setStats(mockStats);
    setLoading(false);
  };

  const updateBatchStatus = async (batchId: string, newStatus: ProductionBatch['status']) => {
    try {
      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: newStatus, actual_completion: newStatus === 'completed' ? new Date().toISOString() : batch.actual_completion }
          : batch
      ));
      notify.success(`Batch status updated to ${newStatus}`);
    } catch (error) {
      notify.error('Failed to update batch status');
    }
  };

  const getStatusColor = (status: ProductionBatch['status']) => {
    switch (status) {
      case 'planning': return 'gray';
      case 'in_progress': return 'blue';
      case 'paused': return 'yellow';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: ProductionBatch['priority']) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };

  const getProgressPercentage = (batch: ProductionBatch) => {
    return Math.round((batch.quantity_produced / batch.batch_size) * 100);
  };

  const filterCollection = createListCollection({
    items: [
      { value: 'active', label: 'Active Batches' },
      { value: 'completed', label: 'Completed Today' },
      { value: 'all', label: 'All Batches' }
    ]
  });

  const filteredBatches = batches.filter(batch => {
    switch (filter) {
      case 'active': return ['planning', 'in_progress', 'paused'].includes(batch.status);
      case 'completed': return batch.status === 'completed';
      case 'all': return true;
      default: return true;
    }
  });

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <VStack gap={4}>
          <CogIcon className="w-12 h-12 text-gray-400 animate-spin" />
          <Text>Loading production data...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        {/* Header with Stats */}
        <Grid templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
          {stats && (
            <>
              <Card.Root>
                <Card.Body>
                  <HStack justify="space-between">
                    <VStack align="start" gap={1}>
                      <Text fontSize="sm" color="gray.600">Active Batches</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {stats.active_batches}
                      </Text>
                    </VStack>
                    <CogIcon className="w-8 h-8 text-blue-500" />
                  </HStack>
                </Card.Body>
              </Card.Root>

              <Card.Root>
                <Card.Body>
                  <HStack justify="space-between">
                    <VStack align="start" gap={1}>
                      <Text fontSize="sm" color="gray.600">Completed Today</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {stats.completed_today}
                      </Text>
                    </VStack>
                    <CheckCircleIcon className="w-8 h-8 text-green-500" />
                  </HStack>
                </Card.Body>
              </Card.Root>

              <Card.Root>
                <Card.Body>
                  <HStack justify="space-between">
                    <VStack align="start" gap={1}>
                      <Text fontSize="sm" color="gray.600">Efficiency Rate</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        {stats.efficiency_rate}%
                      </Text>
                    </VStack>
                    <CubeIcon className="w-8 h-8 text-purple-500" />
                  </HStack>
                </Card.Body>
              </Card.Root>

              <Card.Root>
                <Card.Body>
                  <HStack justify="space-between">
                    <VStack align="start" gap={1}>
                      <Text fontSize="sm" color="gray.600">On-Time Rate</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                        {stats.on_time_completion}%
                      </Text>
                    </VStack>
                    <ClockIcon className="w-8 h-8 text-orange-500" />
                  </HStack>
                </Card.Body>
              </Card.Root>
            </>
          )}
        </Grid>

        {/* Controls */}
        <HStack justify="space-between" wrap="wrap" gap={4}>
          <HStack gap={3}>
            <Select.Root
              collection={filterCollection}
              value={[filter]}
              onValueChange={(details) => setFilter(details.value[0])}
              size="sm"
            >
              <Select.Trigger minW="150px">
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                {filterCollection.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Button
              size="sm"
              variant="outline"
              onClick={loadProductionData}
            >
              <CogIcon className="w-4 h-4" />
              Refresh
            </Button>
          </HStack>

          <Button
            colorPalette="blue"
            onClick={() => setShowNewBatch(true)}
          >
            <PlayIcon className="w-4 h-4" />
            New Production Batch
          </Button>
        </HStack>

        {/* Production Batches */}
        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
          {filteredBatches.map((batch) => (
            <Card.Root key={batch.id} variant="outline">
              <Card.Header>
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <Text fontWeight="bold" fontSize="lg">
                      {batch.product_name}
                    </Text>
                    <HStack gap={2}>
                      <Badge colorPalette={getStatusColor(batch.status)}>
                        {batch.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge colorPalette={getPriorityColor(batch.priority)}>
                        {batch.priority.toUpperCase()}
                      </Badge>
                    </HStack>
                  </VStack>
                  <Text fontSize="sm" color="gray.600">
                    Batch #{batch.id}
                  </Text>
                </HStack>
              </Card.Header>

              <Card.Body>
                <VStack gap={4} align="stretch">
                  {/* Progress */}
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">Progress</Text>
                      <Text fontSize="sm" color="gray.600">
                        {batch.quantity_produced}/{batch.batch_size} units ({getProgressPercentage(batch)}%)
                      </Text>
                    </HStack>
                    <Progress.Root
                      value={getProgressPercentage(batch)}
                      colorPalette={batch.status === 'completed' ? 'green' : 'blue'}
                      size="sm"
                    >
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>

                  {/* Timing */}
                  <HStack justify="space-between" fontSize="sm">
                    <VStack align="start" gap={1}>
                      <Text color="gray.600">Started</Text>
                      <Text fontWeight="medium">
                        {batch.started_at ? new Date(batch.started_at).toLocaleTimeString() : 'Not started'}
                      </Text>
                    </VStack>
                    <VStack align="end" gap={1}>
                      <Text color="gray.600">Est. Completion</Text>
                      <Text fontWeight="medium">
                        {new Date(batch.estimated_completion).toLocaleTimeString()}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Staff & Equipment */}
                  <VStack align="stretch" gap={2}>
                    <HStack>
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      <Text fontSize="sm" color="gray.600">
                        Staff: {batch.assigned_staff.join(', ')}
                      </Text>
                    </HStack>
                    <HStack>
                      <CogIcon className="w-4 h-4 text-gray-500" />
                      <Text fontSize="sm" color="gray.600">
                        Equipment: {batch.equipment_used.join(', ')}
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Quality Checks */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Quality Checks</Text>
                    <VStack gap={1} align="stretch">
                      {batch.quality_checks.map((check) => (
                        <HStack key={check.id} justify="space-between" fontSize="xs">
                          <Text>{check.checkpoint}</Text>
                          <Badge 
                            size="sm"
                            colorPalette={check.status === 'passed' ? 'green' : check.status === 'failed' ? 'red' : 'gray'}
                          >
                            {check.status}
                          </Badge>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>

                  {/* Cost Tracking */}
                  <Box bg="gray.50" p={3} borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Cost Tracking</Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2} fontSize="xs">
                      <Text>Materials: ${batch.cost_tracking.materials_cost.toFixed(2)}</Text>
                      <Text>Labor: ${batch.cost_tracking.labor_cost.toFixed(2)}</Text>
                      <Text>Overhead: ${batch.cost_tracking.overhead_cost.toFixed(2)}</Text>
                      <Text fontWeight="bold">Total: ${batch.cost_tracking.total_cost.toFixed(2)}</Text>
                    </Grid>
                  </Box>

                  {/* Notes */}
                  {batch.notes && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={1}>Notes</Text>
                      <Text fontSize="xs" color="gray.600">{batch.notes}</Text>
                    </Box>
                  )}

                  {/* Actions */}
                  {batch.status === 'in_progress' && (
                    <HStack gap={2}>
                      <Button 
                        size="sm" 
                        colorPalette="yellow" 
                        variant="outline"
                        onClick={() => updateBatchStatus(batch.id, 'paused')}
                      >
                        <PauseIcon className="w-4 h-4" />
                        Pause
                      </Button>
                      <Button 
                        size="sm" 
                        colorPalette="green"
                        onClick={() => updateBatchStatus(batch.id, 'completed')}
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Complete
                      </Button>
                    </HStack>
                  )}

                  {batch.status === 'paused' && (
                    <Button 
                      size="sm" 
                      colorPalette="blue"
                      onClick={() => updateBatchStatus(batch.id, 'in_progress')}
                    >
                      <PlayIcon className="w-4 h-4" />
                      Resume
                    </Button>
                  )}
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>

        {/* No Data State */}
        {filteredBatches.length === 0 && (
          <Card.Root>
            <Card.Body>
              <VStack gap={4} py={8}>
                <CogIcon className="w-12 h-12 text-gray-400" />
                <VStack gap={2}>
                  <Text fontSize="lg" fontWeight="medium">No production batches found</Text>
                  <Text color="gray.500" textAlign="center">
                    {filter === 'active' 
                      ? 'No active production batches at the moment'
                      : `No ${filter} batches to display`
                    }
                  </Text>
                </VStack>
                <Button colorPalette="blue" onClick={() => setShowNewBatch(true)}>
                  Start New Production Batch
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        )}
      </VStack>
    </Box>
  );
}