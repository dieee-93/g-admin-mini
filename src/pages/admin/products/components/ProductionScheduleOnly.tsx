// src/pages/admin/products/components/ProductionScheduleOnly.tsx
// Production Schedule como sección independiente - Design System v2.0

import React, { useState, useEffect } from 'react';
import {
  Card,
  VStack,
  HStack,
  Typography,
  Button,
  Badge,
  Grid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@/shared/ui';
import {
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  CogIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ProductionPlan {
  id: string;
  product_id: string;
  product_name: string;
  planned_quantity: number;
  planned_date: string;
  estimated_duration: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  required_staff: number;
  required_equipment: string[];
  start_time?: string;
  end_time?: string;
  notes: string;
  created_at: string;
}

interface ScheduleSlot {
  id: string;
  date: string;
  time_slot: string;
  capacity: number;
  utilized: number;
  available: number;
  plans: ProductionPlan[];
}

export function ProductionScheduleOnly() {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadScheduleData();
  }, [selectedDate, view]);

  const loadScheduleData = async () => {
    setLoading(true);
    
    // Mock production plans
    const mockPlans: ProductionPlan[] = [
      {
        id: '1',
        product_id: 'prod_1',
        product_name: 'Pizza Margherita',
        planned_quantity: 50,
        planned_date: '2024-08-26',
        estimated_duration: 6,
        priority: 'high',
        status: 'scheduled',
        required_staff: 3,
        required_equipment: ['Oven 1', 'Prep Station A'],
        start_time: '08:00',
        end_time: '14:00',
        notes: 'Weekend rush preparation',
        created_at: '2024-08-25T10:00:00Z'
      },
      {
        id: '2',
        product_id: 'prod_2',
        product_name: 'Pasta Bolognese',
        planned_quantity: 30,
        planned_date: '2024-08-26',
        estimated_duration: 4,
        priority: 'medium',
        status: 'in_progress',
        required_staff: 2,
        required_equipment: ['Stove 1'],
        start_time: '10:00',
        end_time: '14:00',
        notes: '',
        created_at: '2024-08-25T11:00:00Z'
      },
      {
        id: '3',
        product_id: 'prod_3',
        product_name: 'Caesar Salad',
        planned_quantity: 25,
        planned_date: '2024-08-27',
        estimated_duration: 2,
        priority: 'low',
        status: 'scheduled',
        required_staff: 1,
        required_equipment: ['Prep Station B'],
        start_time: '16:00',
        end_time: '18:00',
        notes: '',
        created_at: '2024-08-25T12:00:00Z'
      }
    ];

    // Mock schedule slots
    const mockSchedule: ScheduleSlot[] = [
      {
        id: 'slot_1',
        date: '2024-08-26',
        time_slot: '08:00-12:00',
        capacity: 100,
        utilized: 80,
        available: 20,
        plans: mockPlans.filter(p => p.planned_date === '2024-08-26' && p.start_time! < '12:00')
      },
      {
        id: 'slot_2',
        date: '2024-08-26',
        time_slot: '12:00-16:00',
        capacity: 100,
        utilized: 50,
        available: 50,
        plans: mockPlans.filter(p => p.planned_date === '2024-08-26' && p.start_time! >= '12:00')
      },
      {
        id: 'slot_3',
        date: '2024-08-27',
        time_slot: '16:00-20:00',
        capacity: 80,
        utilized: 25,
        available: 55,
        plans: mockPlans.filter(p => p.planned_date === '2024-08-27')
      }
    ];

    setPlans(mockPlans);
    setSchedule(mockSchedule);
    setLoading(false);
  };

  const getStatusIcon = (status: ProductionPlan['status']) => {
    switch (status) {
      case 'scheduled': return <ClockIcon className="w-4 h-4 text-blue-500" />;
      case 'in_progress': return <CogIcon className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'completed': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'cancelled': return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: ProductionPlan['status']) => {
    const statusConfig = {
      scheduled: { colorPalette: 'info' as const, label: 'Scheduled' },
      in_progress: { colorPalette: 'brand' as const, label: 'In Progress' },
      completed: { colorPalette: 'success' as const, label: 'Completed' },
      cancelled: { colorPalette: 'error' as const, label: 'Cancelled' }
    };
    
    const config = statusConfig[status];
    return <Badge colorPalette={config.colorPalette} size="sm">{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: ProductionPlan['priority']) => {
    const priorityConfig = {
      low: { colorPalette: 'gray' as const, label: 'Low' },
      medium: { colorPalette: 'info' as const, label: 'Medium' },
      high: { colorPalette: 'warning' as const, label: 'High' },
      urgent: { colorPalette: 'error' as const, label: 'Urgent' }
    };
    
    const config = priorityConfig[priority];
    return <Badge colorPalette={config.colorPalette} size="xs">{config.label}</Badge>;
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const rescheduleProduction = async (planId: string) => {
    // Mock reschedule functionality
    console.log('Rescheduling plan:', planId);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <VStack gap="md">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <Typography variant="body">Loading production schedule data...</Typography>
        </VStack>
      </div>
    );
  }

  return (
    <div className="p-6">
      <VStack gap="lg" align="stretch">
        {/* Header */}
        <div>
          <Typography variant="heading" className="text-2xl font-bold mb-2">
            Production Schedule
          </Typography>
          <Typography variant="body" color="text.muted" className="mb-4">
            Manage and optimize your production timeline and capacity
          </Typography>
        </div>

        {/* Schedule Overview */}
        <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap="lg">
          {/* Main Schedule */}
          <CardWrapper>
            <div className="p-6">
              <HStack justify="space-between" className="mb-6">
                <Typography variant="heading" className="text-lg font-semibold">Production Schedule Calendar</Typography>
                <HStack gap="sm">
                  <Badge colorPalette="brand">{plans.length} scheduled</Badge>
                  <Button size="sm" variant="outline" onClick={loadScheduleData}>
                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </HStack>
              </HStack>

              {/* View Controls */}
              <HStack gap="sm" className="mb-6">
                <Button
                  size="sm"
                  variant={view === 'day' ? 'solid' : 'outline'}
                  onClick={() => setView('day')}
                >
                  Day
                </Button>
                <Button
                  size="sm"
                  variant={view === 'week' ? 'solid' : 'outline'}
                  onClick={() => setView('week')}
                >
                  Week
                </Button>
                <Button
                  size="sm"
                  variant={view === 'month' ? 'solid' : 'outline'}
                  onClick={() => setView('month')}
                >
                  Month
                </Button>
              </HStack>

              {/* Schedule Slots */}
              <VStack gap="md" align="stretch">
                {schedule.length === 0 ? (
                  <div className="p-8 text-center">
                    <VStack gap="md">
                      <CalendarDaysIcon className="w-12 h-12 text-gray-400" />
                      <Typography variant="heading" className="text-lg font-medium">
                        No production scheduled
                      </Typography>
                      <Typography variant="body" color="text.muted">
                        Schedule your first production plan to see the timeline
                      </Typography>
                    </VStack>
                  </div>
                ) : (
                  schedule.map((slot) => (
                    <Card key={slot.id}>
                      <div className="p-4">
                        <HStack justify="space-between" className="mb-4">
                          <VStack align="start" gap="xs">
                            <Typography variant="heading" className="text-lg font-semibold">
                              {new Date(slot.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </Typography>
                            <Typography variant="body" className="text-sm" color="text.muted">
                              Time Slot: {slot.time_slot}
                            </Typography>
                          </VStack>
                          
                          <VStack align="end" gap="xs">
                            <Typography variant="body" className={`text-sm font-semibold ${getUtilizationColor((slot.utilized / slot.capacity) * 100)}`}>
                              {Math.round((slot.utilized / slot.capacity) * 100)}% Utilized
                            </Typography>
                            <Typography variant="body" className="text-xs" color="text.muted">
                              {slot.available} units available
                            </Typography>
                          </VStack>
                        </HStack>

                        {/* Capacity Bar */}
                        <div className="mb-4">
                          <HStack justify="space-between" className="mb-2">
                            <Typography variant="body" className="text-sm font-medium">
                              Capacity Usage
                            </Typography>
                            <Typography variant="body" className="text-sm">
                              {slot.utilized} / {slot.capacity} units
                            </Typography>
                          </HStack>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                (slot.utilized / slot.capacity) >= 0.9 ? 'bg-red-500' :
                                (slot.utilized / slot.capacity) >= 0.7 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${(slot.utilized / slot.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Scheduled Plans */}
                        {slot.plans.length > 0 && (
                          <div>
                            <Typography variant="body" className="text-sm font-medium mb-3">
                              Scheduled Productions ({slot.plans.length})
                            </Typography>
                            <VStack gap="sm" align="stretch">
                              {slot.plans.map((plan) => (
                                <div key={plan.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded">
                                  <HStack gap="sm">
                                    {getStatusIcon(plan.status)}
                                    <VStack align="start" gap="xs">
                                      <Typography variant="body" className="text-sm font-medium">
                                        {plan.product_name}
                                      </Typography>
                                      <HStack gap="xs">
                                        <Typography variant="body" className="text-xs" color="text.muted">
                                          {plan.start_time} - {plan.end_time}
                                        </Typography>
                                        <Typography variant="body" className="text-xs" color="text.muted">
                                          • {plan.planned_quantity} units
                                        </Typography>
                                        <Typography variant="body" className="text-xs" color="text.muted">
                                          • {plan.required_staff} staff
                                        </Typography>
                                      </HStack>
                                    </VStack>
                                  </HStack>
                                  
                                  <HStack gap="sm">
                                    {getPriorityBadge(plan.priority)}
                                    {getStatusBadge(plan.status)}
                                    {plan.status === 'scheduled' && (
                                      <Button 
                                        size="xs" 
                                        variant="outline"
                                        onClick={() => rescheduleProduction(plan.id)}
                                      >
                                        Reschedule
                                      </Button>
                                    )}
                                  </HStack>
                                </div>
                              ))}
                            </VStack>
                          </div>
                        )}
                      </div>
                    </CardWrapper>
                  ))
                )}
              </VStack>
            </div>
          </CardWrapper>

          {/* Schedule Summary & Alerts */}
          <VStack gap="md" align="stretch">
            {/* Schedule Stats */}
            <CardWrapper>
              <div className="p-4">
                <Typography variant="heading" className="text-lg font-semibold mb-4">
                  Schedule Overview
                </Typography>
                
                <VStack gap="md" align="stretch">
                  <VStack align="start" gap="xs">
                    <Typography variant="body" className="text-sm" color="text.muted">Total Planned</Typography>
                    <Typography variant="heading" className="text-xl font-bold text-blue-600">
                      {plans.filter(p => p.status === 'scheduled').length} plans
                    </Typography>
                  </VStack>
                  
                  <VStack align="start" gap="xs">
                    <Typography variant="body" className="text-sm" color="text.muted">In Progress</Typography>
                    <Typography variant="heading" className="text-xl font-bold text-yellow-600">
                      {plans.filter(p => p.status === 'in_progress').length} active
                    </Typography>
                  </VStack>
                  
                  <VStack align="start" gap="xs">
                    <Typography variant="body" className="text-sm" color="text.muted">Completed Today</Typography>
                    <Typography variant="heading" className="text-xl font-bold text-green-600">
                      {plans.filter(p => p.status === 'completed').length} done
                    </Typography>
                  </VStack>
                  
                  <VStack align="start" gap="xs">
                    <Typography variant="body" className="text-sm" color="text.muted">High Priority</Typography>
                    <Typography variant="heading" className="text-xl font-bold text-red-600">
                      {plans.filter(p => p.priority === 'high' || p.priority === 'urgent').length} urgent
                    </Typography>
                  </VStack>
                </VStack>
              </div>
            </CardWrapper>

            {/* Schedule Alerts */}
            <CardWrapper>
              <div className="p-4">
                <Typography variant="heading" className="text-lg font-semibold mb-4">
                  Schedule Alerts
                </Typography>
                
                <VStack gap="sm" align="stretch">
                  {schedule.some(slot => (slot.utilized / slot.capacity) >= 0.9) && (
                    <Alert>
                      <AlertIcon>
                        <ExclamationTriangleIcon className="w-4 h-4" />
                      </AlertIcon>
                      <AlertTitle>High Capacity Usage</AlertTitle>
                      <AlertDescription>
                        Some time slots are near maximum capacity
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {plans.some(p => p.priority === 'urgent' && p.status === 'scheduled') && (
                    <Alert>
                      <AlertIcon>
                        <ExclamationTriangleIcon className="w-4 h-4" />
                      </AlertIcon>
                      <AlertTitle>Urgent Productions</AlertTitle>
                      <AlertDescription>
                        {plans.filter(p => p.priority === 'urgent').length} urgent plans need attention
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {plans.filter(p => p.status === 'scheduled').length === 0 && (
                    <Alert>
                      <AlertIcon>
                        <CalendarDaysIcon className="w-4 h-4" />
                      </AlertIcon>
                      <AlertTitle>No Scheduled Productions</AlertTitle>
                      <AlertDescription>
                        Consider scheduling production plans for upcoming demand
                      </AlertDescription>
                    </Alert>
                  )}
                </VStack>
              </div>
            </CardWrapper>

            {/* Quick Actions */}
            <CardWrapper>
              <div className="p-4">
                <Typography variant="heading" className="text-lg font-semibold mb-4">
                  Quick Actions
                </Typography>
                
                <VStack gap="sm" align="stretch">
                  <Button colorPalette="brand" size="sm">
                    <CalendarDaysIcon className="w-4 h-4 mr-1" />
                    Schedule New Production
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                    Optimize Schedule
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    Export Schedule
                  </Button>
                </VStack>
              </div>
            </CardWrapper>
          </VStack>
        </Grid>
      </VStack>
    </div>
  );
}