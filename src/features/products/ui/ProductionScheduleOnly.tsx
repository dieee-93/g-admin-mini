// src/features/products/ui/ProductionScheduleOnly.tsx
// Production Schedule como sección independiente

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
  Alert
} from '@chakra-ui/react';
import {
  CalendarDaysIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ProductionCalendar } from '@/components/ui/ProductionCalendar';

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

interface ProductionCapacity {
  daily_capacity: number;
  current_utilization: number;
  available_capacity: number;
  bottleneck_resource: string;
  efficiency_rate: number;
}

export function ProductionScheduleOnly() {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [capacity, setCapacity] = useState<ProductionCapacity | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
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
        required_materials: [],
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
        required_materials: [],
        required_staff: 2,
        required_equipment: ['Cocina 2'],
        dependencies: [],
        notes: 'Regular weekly production',
        created_at: '2024-08-07T11:30:00Z'
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
    setCapacity(mockCapacity);
    setLoading(false);
  };

  const updatePlanStatus = async (planId: string, newStatus: ProductionPlan['status']) => {
    setPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, status: newStatus } : plan
    ));
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
          <CalendarDaysIcon className="w-12 h-12 text-gray-400" />
          <Text>Loading production schedule data...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2} color="gray.700">
            Production Schedule Calendar
          </Text>
          <Text fontSize="sm" color="gray.600" mb={4}>
            Visual timeline of all scheduled production activities
          </Text>
        </Box>

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
                      <Button size="sm" colorPalette="blue">
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
      </VStack>
    </Box>
  );
}