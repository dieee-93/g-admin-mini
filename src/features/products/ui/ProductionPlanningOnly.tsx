// src/features/products/ui/ProductionPlanningOnly.tsx
// Production Planning como sección independiente

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
  Input,
  NumberInput,
  Select,
  createListCollection,
  Alert,
  Textarea
} from '@chakra-ui/react';
import {
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { notify } from '@/lib/notifications';

interface ProductionPlan {
  id: string;
  product_id: string;
  product_name: string;
  planned_quantity: number;
  planned_date: string;
  estimated_duration: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  required_materials: MaterialRequirement[];
  required_staff: number;
  required_equipment: string[];
  dependencies: string[];
  notes: string;
  created_at: string;
}

interface MaterialRequirement {
  material_id: string;
  material_name: string;
  quantity_needed: number;
  quantity_available: number;
  shortage: number;
  unit: string;
}

export function ProductionPlanningOnly() {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const priorityOptions = ["low", "medium", "high", "urgent"];
  const priorityCollection = createListCollection({ 
    items: priorityOptions.map(p => ({ 
      value: p, 
      label: p.charAt(0).toUpperCase() + p.slice(1) 
    })) 
  });
  
  const [loading, setLoading] = useState(true);
  const [newPlan, setNewPlan] = useState<Partial<ProductionPlan>>({
    priority: 'medium',
    required_staff: 2
  });

  useEffect(() => {
    loadPlanningData();
  }, []);

  const loadPlanningData = async () => {
    setLoading(true);
    
    // Mock production plans
    const mockPlans: ProductionPlan[] = [
      {
        id: '1',
        product_id: 'prod_1',
        product_name: 'Pizza Margherita',
        planned_quantity: 50,
        planned_date: '2024-08-08',
        estimated_duration: 6,
        priority: 'high',
        status: 'scheduled',
        required_materials: [
          { 
            material_id: '1', 
            material_name: 'Flour', 
            quantity_needed: 10, 
            quantity_available: 25, 
            shortage: 0, 
            unit: 'kg' 
          },
          { 
            material_id: '2', 
            material_name: 'Tomato Sauce', 
            quantity_needed: 5, 
            quantity_available: 3, 
            shortage: 2, 
            unit: 'L' 
          }
        ],
        required_staff: 3,
        required_equipment: ['Horno Principal', 'Mesa Prep 1', 'Mesa Prep 2'],
        dependencies: [],
        notes: 'High demand expected due to weekend rush',
        created_at: '2024-08-07T10:00:00Z'
      }
    ];

    setPlans(mockPlans);
    setLoading(false);
  };

  const createProductionPlan = async () => {
    if (!newPlan.product_name || !newPlan.planned_quantity || !newPlan.planned_date) {
      notify.error('Please fill in all required fields');
      return;
    }

    const plan: ProductionPlan = {
      id: Date.now().toString(),
      product_id: `prod_${Date.now()}`,
      product_name: newPlan.product_name,
      planned_quantity: newPlan.planned_quantity,
      planned_date: newPlan.planned_date,
      estimated_duration: newPlan.estimated_duration || 4,
      priority: newPlan.priority || 'medium',
      status: 'scheduled',
      required_materials: [],
      required_staff: newPlan.required_staff || 2,
      required_equipment: [],
      dependencies: [],
      notes: newPlan.notes || '',
      created_at: new Date().toISOString()
    };

    setPlans(prev => [plan, ...prev]);
    setNewPlan({ priority: 'medium', required_staff: 2 });
    notify.success('Production plan created successfully');
  };

  const updatePlanStatus = async (planId: string, newStatus: ProductionPlan['status']) => {
    setPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, status: newStatus } : plan
    ));
    notify.success(`Plan status updated to ${newStatus}`);
  };

  const getStatusColor = (status: ProductionPlan['status']) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'in_progress': return 'yellow';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: ProductionPlan['priority']) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };

  const hasShortages = (plan: ProductionPlan) => {
    return plan.required_materials.some(material => material.shortage > 0);
  };

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <VStack gap={4}>
          <ClockIcon className="w-12 h-12 text-gray-400" />
          <Text>Loading production planning data...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={6}>
          {/* Create New Plan */}
          <Card.Root>
            <Card.Header>
              <Text fontSize="lg" fontWeight="semibold">Create Production Plan</Text>
            </Card.Header>
            <Card.Body>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Product Name *</Text>
                  <Input
                    value={newPlan.product_name || ''}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, product_name: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Planned Quantity *</Text>
                  <NumberInput.Root
                    value={newPlan.planned_quantity?.toString()}
                    onValueChange={(details) => setNewPlan(prev => ({ ...prev, planned_quantity: parseInt(details.value) }))}
                    min={1}
                  >
                    <NumberInput.Input />
                  </NumberInput.Root>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Planned Date *</Text>
                  <Input
                    type="date"
                    value={newPlan.planned_date || ''}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, planned_date: e.target.value }))}
                  />
                </Box>

                <Grid templateColumns="1fr 1fr" gap={3}>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Estimated Hours</Text>
                    <NumberInput.Root
                      value={newPlan.estimated_duration?.toString()}
                      onValueChange={(details) => setNewPlan(prev => ({ ...prev, estimated_duration: parseFloat(details.value) }))}
                      min={0}
                      formatOptions={{ maximumFractionDigits: 1 }}
                    >
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Required Staff</Text>
                    <NumberInput.Root
                      value={newPlan.required_staff?.toString()}
                      onValueChange={(details) => setNewPlan(prev => ({ ...prev, required_staff: parseInt(details.value) }))}
                      min={1}
                    >
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </Box>
                </Grid>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Priority</Text>
                  <Select.Root
                    collection={priorityCollection}
                    value={[newPlan.priority || "medium"]}
                    onValueChange={(details) => setNewPlan(prev => ({ ...prev, priority: details.value[0] as any }))}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select priority" />
                    </Select.Trigger>
                    <Select.Content>
                      {priorityCollection.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          <Select.ItemText>{item.label}</Select.ItemText>
                          <Select.ItemIndicator>✓</Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Notes</Text>
                  <Textarea
                    value={newPlan.notes || ''}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any special notes or requirements"
                    rows={3}
                  />
                </Box>

                <Button
                  colorPalette="blue"
                  onClick={createProductionPlan}
                >
                  <ClipboardDocumentListIcon className="w-4 h-4" />
                  Create Plan
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Current Plans */}
          <VStack gap={4} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold">Scheduled Production Plans</Text>
              <Badge colorPalette="blue">{plans.length} plans</Badge>
            </HStack>

            {plans.map((plan) => (
              <Card.Root key={plan.id} variant="outline">
                <Card.Header>
                  <HStack justify="space-between">
                    <VStack align="start" gap={1}>
                      <Text fontWeight="bold" fontSize="lg">
                        {plan.product_name}
                      </Text>
                      <HStack gap={2}>
                        <Badge colorPalette={getStatusColor(plan.status)}>
                          {plan.status.toUpperCase()}
                        </Badge>
                        <Badge colorPalette={getPriorityColor(plan.priority)}>
                          {plan.priority.toUpperCase()}
                        </Badge>
                        {hasShortages(plan) && (
                          <Badge colorPalette="red">SHORTAGES</Badge>
                        )}
                      </HStack>
                    </VStack>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(plan.planned_date).toLocaleDateString()}
                    </Text>
                  </HStack>
                </Card.Header>

                <Card.Body>
                  <VStack gap={4} align="stretch">
                    {/* Plan Details */}
                    <Grid templateColumns="repeat(3, 1fr)" gap={4} fontSize="sm">
                      <VStack align="start" gap={1}>
                        <Text color="gray.600">Quantity</Text>
                        <Text fontWeight="bold">{plan.planned_quantity} units</Text>
                      </VStack>
                      <VStack align="start" gap={1}>
                        <Text color="gray.600">Duration</Text>
                        <Text fontWeight="bold">{plan.estimated_duration}h</Text>
                      </VStack>
                      <VStack align="start" gap={1}>
                        <Text color="gray.600">Staff Needed</Text>
                        <Text fontWeight="bold">{plan.required_staff} people</Text>
                      </VStack>
                    </Grid>

                    {/* Material Requirements */}
                    {plan.required_materials.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={2}>Material Requirements</Text>
                        <VStack gap={1} align="stretch" fontSize="xs">
                          {plan.required_materials.map((material, index) => (
                            <HStack key={index} justify="space-between" p={2} bg={material.shortage > 0 ? 'red.50' : 'gray.50'} borderRadius="sm">
                              <HStack>
                                <Text fontWeight="medium">{material.material_name}</Text>
                                {material.shortage > 0 && (
                                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                                )}
                              </HStack>
                              <HStack gap={2}>
                                <Text>Need: {material.quantity_needed}{material.unit}</Text>
                                <Text color={material.shortage > 0 ? 'red.600' : 'green.600'}>
                                  Available: {material.quantity_available}{material.unit}
                                </Text>
                                {material.shortage > 0 && (
                                  <Badge colorPalette="red" size="sm">
                                    Short: {material.shortage}{material.unit}
                                  </Badge>
                                )}
                              </HStack>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}

                    {/* Actions */}
                    {plan.status === 'scheduled' && (
                      <HStack gap={2}>
                        <Button 
                          size="sm" 
                          colorPalette="blue"
                          onClick={() => updatePlanStatus(plan.id, 'in_progress')}
                        >
                          Start Production
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updatePlanStatus(plan.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </HStack>
                    )}

                    {plan.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        colorPalette="green"
                        onClick={() => updatePlanStatus(plan.id, 'completed')}
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Mark Complete
                      </Button>
                    )}
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}

            {plans.length === 0 && (
              <Card.Root>
                <Card.Body>
                  <VStack gap={4} py={8}>
                    <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400" />
                    <Text fontSize="lg" fontWeight="medium">No production plans scheduled</Text>
                    <Text color="gray.500">Create your first production plan to get started</Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            )}
          </VStack>
        </Grid>
      </VStack>
    </Box>
  );
}