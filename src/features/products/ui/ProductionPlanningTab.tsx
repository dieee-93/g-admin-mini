// src/features/products/ui/ProductionPlanningTab.tsx
// Production Planning & Demand Forecasting System

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
  Tabs,
  Alert,
  Progress,
  Textarea
} from '@chakra-ui/react';
import {
  ClockIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { notify } from '@/lib/notifications';
import { ProductionCalendar } from '@/components/ui/ProductionCalendar';

interface ProductionPlan {
  id: string;
  product_id: string;
  product_name: string;
  planned_quantity: number;
  planned_date: string;
  estimated_duration: number; // hours
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  required_materials: MaterialRequirement[];
  required_staff: number;
  required_equipment: string[];
  dependencies: string[]; // Other plan IDs that must complete first
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

interface DemandForecast {
  product_id: string;
  product_name: string;
  historical_average: number;
  current_trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
  seasonal_factor: number;
  predicted_demand: number;
  confidence_level: number;
  recommended_production: number;
}

interface ProductionCapacity {
  daily_capacity: number;
  current_utilization: number;
  available_capacity: number;
  bottleneck_resource: string;
  efficiency_rate: number;
}

export function ProductionPlanningTab() {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  // ✅ Create collections for Select components
  const priorityOptions = ["low", "medium", "high", "urgent"];
  const priorityCollection = createListCollection({ items: priorityOptions.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })) });
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [capacity, setCapacity] = useState<ProductionCapacity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('planning');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
          },
          { 
            material_id: '3', 
            material_name: 'Mozzarella', 
            quantity_needed: 8, 
            quantity_available: 12, 
            shortage: 0, 
            unit: 'kg' 
          }
        ],
        required_staff: 3,
        required_equipment: ['Horno Principal', 'Mesa Prep 1', 'Mesa Prep 2'],
        dependencies: [],
        notes: 'High demand expected due to weekend rush',
        created_at: '2024-08-07T10:00:00Z'
      },
      {
        id: '2',
        product_id: 'prod_2',
        product_name: 'Pasta Bolognese',
        planned_quantity: 30,
        planned_date: '2024-08-09',
        estimated_duration: 4,
        priority: 'medium',
        status: 'scheduled',
        required_materials: [
          { 
            material_id: '4', 
            material_name: 'Pasta', 
            quantity_needed: 6, 
            quantity_available: 8, 
            shortage: 0, 
            unit: 'kg' 
          },
          { 
            material_id: '5', 
            material_name: 'Ground Beef', 
            quantity_needed: 4, 
            quantity_available: 2, 
            shortage: 2, 
            unit: 'kg' 
          }
        ],
        required_staff: 2,
        required_equipment: ['Cocina 2'],
        dependencies: [],
        notes: 'Regular weekly production',
        created_at: '2024-08-07T11:30:00Z'
      }
    ];

    // Mock demand forecasts
    const mockForecasts: DemandForecast[] = [
      {
        product_id: 'prod_1',
        product_name: 'Pizza Margherita',
        historical_average: 45,
        current_trend: 'up',
        trend_percentage: 12,
        seasonal_factor: 1.2,
        predicted_demand: 60,
        confidence_level: 85,
        recommended_production: 65
      },
      {
        product_id: 'prod_2',
        product_name: 'Pasta Bolognese',
        historical_average: 28,
        current_trend: 'stable',
        trend_percentage: 0,
        seasonal_factor: 1.0,
        predicted_demand: 28,
        confidence_level: 78,
        recommended_production: 30
      },
      {
        product_id: 'prod_3',
        product_name: 'Caesar Salad',
        historical_average: 35,
        current_trend: 'down',
        trend_percentage: -8,
        seasonal_factor: 0.9,
        predicted_demand: 25,
        confidence_level: 72,
        recommended_production: 28
      }
    ];

    // Mock capacity data
    const mockCapacity: ProductionCapacity = {
      daily_capacity: 150,
      current_utilization: 68,
      available_capacity: 48,
      bottleneck_resource: 'Horno Principal',
      efficiency_rate: 92
    };

    setPlans(mockPlans);
    setForecasts(mockForecasts);
    setCapacity(mockCapacity);
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

  const getTrendIcon = (trend: DemandForecast['current_trend']) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowTrendingUpIcon className="w-4 h-4 text-red-500 transform rotate-180" />;
      case 'stable': return <div className="w-4 h-4 border-t-2 border-gray-500" />;
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
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header with Capacity Stats */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          {capacity && (
            <>
              <Card.Root>
                <Card.Body>
                  <HStack justify="space-between">
                    <VStack align="start" gap={1}>
                      <Text fontSize="sm" color="gray.600">Daily Capacity</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {capacity.daily_capacity}
                      </Text>
                      <Text fontSize="xs" color="gray.500">units/day</Text>
                    </VStack>
                    <CogIcon className="w-8 h-8 text-blue-500" />
                  </HStack>
                </Card.Body>
              </Card.Root>

              <Card.Root>
                <Card.Body>
                  <HStack justify="space-between">
                    <VStack align="start" gap={1}>
                      <Text fontSize="sm" color="gray.600">Current Utilization</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                        {capacity.current_utilization}%
                      </Text>
                      <Progress.Root value={capacity.current_utilization} size="sm">
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </VStack>
                    <ChartBarIcon className="w-8 h-8 text-orange-500" />
                  </HStack>
                </Card.Body>
              </Card.Root>

              <Card.Root>
                <Card.Body>
                  <HStack justify="space-between">
                    <VStack align="start" gap={1}>
                      <Text fontSize="sm" color="gray.600">Available Capacity</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {capacity.available_capacity}
                      </Text>
                      <Text fontSize="xs" color="gray.500">units available</Text>
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
                        {capacity.efficiency_rate}%
                      </Text>
                      <Text fontSize="xs" color="gray.500">overall efficiency</Text>
                    </VStack>
                    <BoltIcon className="w-8 h-8 text-purple-500" />
                  </HStack>
                </Card.Body>
              </Card.Root>
            </>
          )}
        </Grid>

        {/* Bottleneck Alert */}
        {capacity && capacity.bottleneck_resource && (
          <Alert.Root status="warning">
            <Alert.Indicator />
            <Box>
              <Alert.Title>Production Bottleneck Detected</Alert.Title>
              <Alert.Description>
                {capacity.bottleneck_resource} is currently the limiting factor in your production capacity. 
                Consider scheduling additional resources or optimizing this station.
              </Alert.Description>
            </Box>
          </Alert.Root>
        )}

        {/* Main Tabs */}
        <Tabs.Root defaultValue="planning" variant="line">
          <Tabs.List>
            <Tabs.Trigger value="planning">
              <ClipboardDocumentListIcon className="w-4 h-4" />
              Production Planning
            </Tabs.Trigger>
            <Tabs.Trigger value="forecast">
              <ChartBarIcon className="w-4 h-4" />
              Demand Forecast
            </Tabs.Trigger>
            <Tabs.Trigger value="schedule">
              <CalendarDaysIcon className="w-4 h-4" />
              Production Schedule
            </Tabs.Trigger>
          </Tabs.List>

          {/* Planning Tab */}
          <Tabs.Content value="planning">
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

                        {/* Equipment */}
                        {plan.required_equipment.length > 0 && (
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" mb={1}>Equipment Needed</Text>
                            <Text fontSize="sm" color="gray.600">
                              {plan.required_equipment.join(', ')}
                            </Text>
                          </Box>
                        )}

                        {/* Notes */}
                        {plan.notes && (
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" mb={1}>Notes</Text>
                            <Text fontSize="sm" color="gray.600">{plan.notes}</Text>
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
          </Tabs.Content>

          {/* Demand Forecast Tab */}
          <Tabs.Content value="forecast">
            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={4}>
              {forecasts.map((forecast) => (
                <Card.Root key={forecast.product_id}>
                  <Card.Header>
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="lg">
                        {forecast.product_name}
                      </Text>
                      <HStack>
                        {getTrendIcon(forecast.current_trend)}
                        <Text fontSize="sm" color={
                          forecast.current_trend === 'up' ? 'green.600' : 
                          forecast.current_trend === 'down' ? 'red.600' : 'gray.600'
                        }>
                          {forecast.trend_percentage > 0 ? '+' : ''}{forecast.trend_percentage}%
                        </Text>
                      </HStack>
                    </HStack>
                  </Card.Header>

                  <Card.Body>
                    <VStack gap={3} align="stretch">
                      <Grid templateColumns="repeat(2, 1fr)" gap={3} fontSize="sm">
                        <VStack align="start" gap={1}>
                          <Text color="gray.600">Historical Avg</Text>
                          <Text fontWeight="bold">{forecast.historical_average}</Text>
                        </VStack>
                        <VStack align="start" gap={1}>
                          <Text color="gray.600">Predicted Demand</Text>
                          <Text fontWeight="bold" color="blue.600">{forecast.predicted_demand}</Text>
                        </VStack>
                      </Grid>

                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm" color="gray.600">Confidence Level</Text>
                          <Text fontSize="sm" fontWeight="bold">{forecast.confidence_level}%</Text>
                        </HStack>
                        <Progress.Root 
                          value={forecast.confidence_level} 
                          colorPalette={forecast.confidence_level > 80 ? 'green' : forecast.confidence_level > 60 ? 'yellow' : 'red'}
                          size="sm"
                        >
                          <Progress.Track>
                            <Progress.Range />
                          </Progress.Track>
                        </Progress.Root>
                      </Box>

                      <Box textAlign="center" p={3} bg="blue.50" borderRadius="md">
                        <Text fontSize="xs" color="gray.600">Recommended Production</Text>
                        <Text fontSize="xl" fontWeight="bold" color="blue.600">
                          {forecast.recommended_production}
                        </Text>
                        <Text fontSize="xs" color="gray.600">units</Text>
                      </Box>

                      <Button size="sm" colorPalette="blue">
                        Create Production Plan
                      </Button>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </Grid>
          </Tabs.Content>

          {/* Schedule Tab - ✅ Functional Calendar */}
          <Tabs.Content value="schedule">
            <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={6}>
              {/* Calendar View */}
              <Card.Root>
                <Card.Header>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="semibold">Production Schedule Calendar</Text>
                    <Badge colorPalette="blue">{plans.length} scheduled</Badge>
                  </HStack>
                </Card.Header>
                <Card.Body>
                  <VStack gap={4} align="stretch">
                    {/* Production Schedule Calendar */}
                    <ProductionCalendar
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                      plans={plans}
                    />
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Selected Date Details */}
              <Card.Root>
                <Card.Header>
                  <Text fontSize="lg" fontWeight="semibold">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </Card.Header>
                <Card.Body>
                  {(() => {
                    const dayPlans = plans.filter(plan => 
                      new Date(plan.planned_date).toDateString() === selectedDate.toDateString()
                    );

                    if (dayPlans.length === 0) {
                      return (
                        <VStack gap={4} py={6} textAlign="center">
                          <CalendarDaysIcon className="w-12 h-12 text-gray-400" />
                          <VStack gap={1}>
                            <Text fontSize="sm" fontWeight="medium">No production scheduled</Text>
                            <Text fontSize="xs" color="gray.500">This day is free for new production plans</Text>
                          </VStack>
                          <Button 
                            size="sm" 
                            colorPalette="blue"
                            onClick={() => {
                              setNewPlan(prev => ({ 
                                ...prev, 
                                planned_date: selectedDate.toISOString().split('T')[0] 
                              }));
                              // Could trigger a modal or navigate to planning tab
                            }}
                          >
                            Schedule Production
                          </Button>
                        </VStack>
                      );
                    }

                    const totalQuantity = dayPlans.reduce((sum, plan) => sum + plan.planned_quantity, 0);
                    const totalHours = dayPlans.reduce((sum, plan) => sum + plan.estimated_duration, 0);
                    const totalStaff = dayPlans.reduce((sum, plan) => sum + plan.required_staff, 0);

                    return (
                      <VStack gap={4} align="stretch">
                        {/* Day Summary */}
                        <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                          <VStack align="center" p={2} bg="blue.50" borderRadius="md">
                            <Text fontSize="xs" color="gray.600">Total Units</Text>
                            <Text fontSize="lg" fontWeight="bold" color="blue.600">{totalQuantity}</Text>
                          </VStack>
                          <VStack align="center" p={2} bg="orange.50" borderRadius="md">
                            <Text fontSize="xs" color="gray.600">Total Hours</Text>
                            <Text fontSize="lg" fontWeight="bold" color="orange.600">{totalHours}h</Text>
                          </VStack>
                          <VStack align="center" p={2} bg="purple.50" borderRadius="md">
                            <Text fontSize="xs" color="gray.600">Staff Needed</Text>
                            <Text fontSize="lg" fontWeight="bold" color="purple.600">{totalStaff}</Text>
                          </VStack>
                        </Grid>

                        {/* Capacity Warning */}
                        {capacity && totalQuantity > capacity.available_capacity && (
                          <Alert.Root status="warning" size="sm">
                            <Alert.Indicator />
                            <Alert.Description fontSize="xs">
                              Planned production ({totalQuantity}) exceeds available capacity ({capacity.available_capacity})
                            </Alert.Description>
                          </Alert.Root>
                        )}

                        {/* Production Plans for Selected Day */}
                        <VStack gap={2} align="stretch">
                          <Text fontSize="sm" fontWeight="semibold">Scheduled Productions ({dayPlans.length})</Text>
                          {dayPlans.map((plan) => (
                            <Card.Root key={plan.id} variant="outline" size="sm">
                              <Card.Body p={3}>
                                <VStack gap={2} align="stretch">
                                  <HStack justify="space-between">
                                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                      {plan.product_name}
                                    </Text>
                                    <Badge 
                                      colorPalette={getStatusColor(plan.status)} 
                                      size="xs"
                                    >
                                      {plan.status}
                                    </Badge>
                                  </HStack>
                                  
                                  <Grid templateColumns="repeat(3, 1fr)" gap={2} fontSize="xs">
                                    <VStack align="start" gap={0}>
                                      <Text color="gray.600">Quantity</Text>
                                      <Text fontWeight="medium">{plan.planned_quantity}</Text>
                                    </VStack>
                                    <VStack align="start" gap={0}>
                                      <Text color="gray.600">Duration</Text>
                                      <Text fontWeight="medium">{plan.estimated_duration}h</Text>
                                    </VStack>
                                    <VStack align="start" gap={0}>
                                      <Text color="gray.600">Priority</Text>
                                      <Badge colorPalette={getPriorityColor(plan.priority)} size="xs">
                                        {plan.priority}
                                      </Badge>
                                    </VStack>
                                  </Grid>

                                  {hasShortages(plan) && (
                                    <HStack gap={1}>
                                      <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />
                                      <Text fontSize="xs" color="red.600">Material shortages detected</Text>
                                    </HStack>
                                  )}

                                  {plan.status === 'scheduled' && (
                                    <HStack gap={1}>
                                      <Button 
                                        size="xs" 
                                        colorPalette="blue"
                                        onClick={() => updatePlanStatus(plan.id, 'in_progress')}
                                      >
                                        Start
                                      </Button>
                                      <Button 
                                        size="xs" 
                                        variant="outline"
                                        onClick={() => updatePlanStatus(plan.id, 'cancelled')}
                                      >
                                        Cancel
                                      </Button>
                                    </HStack>
                                  )}
                                </VStack>
                              </Card.Body>
                            </Card.Root>
                          ))}
                        </VStack>
                      </VStack>
                    );
                  })()}
                </Card.Body>
              </Card.Root>
            </Grid>
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}