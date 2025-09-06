// src/pages/admin/products/components/ProductionPlanningOnly.tsx
// Production Planning como sección independiente - Design System v2.0

import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import {
  CardWrapper ,
  VStack,
  HStack,
  Typography,
  Button,
  Badge,
  Grid,
  InputField,
  NumberField,
  SelectField,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@/shared/ui';
import { Textarea } from '@chakra-ui/react';
import {
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  BoltIcon
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
      },
      {
        id: '2',
        product_id: 'prod_2',
        product_name: 'Pasta Bolognese',
        planned_quantity: 30,
        planned_date: '2024-08-08',
        estimated_duration: 4,
        priority: 'medium',
        status: 'in_progress',
        required_materials: [],
        required_staff: 2,
        required_equipment: ['Stove 1', 'Prep Station'],
        dependencies: [],
        notes: '',
        created_at: '2024-08-07T11:00:00Z'
      }
    ];

    setPlans(mockPlans);
    setLoading(false);
  };

  const createProductionPlan = async () => {
    if (!newPlan.product_name || !newPlan.planned_quantity || !newPlan.planned_date) {
      console.warn('Please fill in all required fields');
      return;
    }

    const plan: ProductionPlan = {
      id: Date.now().toString(),
      product_id: `prod_${Date.now()}`,
      product_name: newPlan.product_name!,
      planned_quantity: newPlan.planned_quantity!,
      planned_date: newPlan.planned_date!,
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
  };

  const updatePlanStatus = async (planId: string, newStatus: ProductionPlan['status']) => {
    setPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, status: newStatus } : plan
    ));
  };

  const getStatusBadge = (status: ProductionPlan['status']) => {
    const statusConfig = {
      scheduled: { colorPalette: 'info' as const, label: 'Programado' },
      in_progress: { colorPalette: 'brand' as const, label: 'En Progreso' },
      completed: { colorPalette: 'success' as const, label: 'Completado' },
      cancelled: { colorPalette: 'error' as const, label: 'Cancelado' }
    };
    
    const config = statusConfig[status];
    return <Badge colorPalette={config.colorPalette} size="sm">{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: ProductionPlan['priority']) => {
    const priorityConfig = {
      low: { colorPalette: 'gray' as const, label: 'Baja' },
      medium: { colorPalette: 'info' as const, label: 'Media' },
      high: { colorPalette: 'warning' as const, label: 'Alta' },
      urgent: { colorPalette: 'error' as const, label: 'Urgente' }
    };
    
    const config = priorityConfig[priority];
    return <Badge colorPalette={config.colorPalette} size="xs">{config.label}</Badge>;
  };

  const getStatusIcon = (status: ProductionPlan['status']) => {
    switch (status) {
      case 'scheduled': return <ClockIcon className="w-4 h-4 text-blue-500" />;
      case 'in_progress': return <CogIcon className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'completed': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'cancelled': return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <VStack gap="md">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <Typography variant="body">Loading production planning data...</Typography>
        </VStack>
      </div>
    );
  }

  return (
    <VStack gap="lg" align="stretch">
      <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap="lg">
        {/* Create Production Plan */}
        <CardWrapper>
          <div className="p-6">
            <Typography variant="heading" className="text-lg font-semibold mb-4">
              Create Production Plan
            </Typography>
            
            <VStack gap="md" align="stretch">
              <div>
                <Typography variant="body" className="text-sm font-medium mb-2">
                  Product Name *
                </Typography>
                <InputField
                  placeholder="Enter product name"
                  value={newPlan.product_name || ''}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, product_name: e.target.value }))}
                />
              </div>
              
              <div>
                <Typography variant="body" className="text-sm font-medium mb-2">
                  Planned Quantity *
                </Typography>
                <NumberField
                  placeholder="Enter quantity"
                  value={newPlan.planned_quantity || 0}
                  onChange={(value) => setNewPlan(prev => ({ ...prev, planned_quantity: value }))}
                  min={1}
                />
              </div>
              
              <Grid templateColumns="1fr 1fr" gap="sm">
                <div>
                  <Typography variant="body" className="text-sm font-medium mb-2">
                    Planned Date *
                  </Typography>
                  <InputField
                    placeholder="YYYY-MM-DD"
                    value={newPlan.planned_date || ''}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, planned_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Typography variant="body" className="text-sm font-medium mb-2">
                    Duration (hours)
                  </Typography>
                  <NumberField
                    value={newPlan.estimated_duration || 4}
                    onChange={(value) => setNewPlan(prev => ({ ...prev, estimated_duration: value }))}
                    min={1}
                    max={24}
                  />
                </div>
              </Grid>
              
              <Grid templateColumns="1fr 1fr" gap="sm">
                <div>
                  <Typography variant="body" className="text-sm font-medium mb-2">
                    Priority
                  </Typography>
                  <SelectField
                    value={newPlan.priority || 'medium'}
                    onValueChange={(details) => setNewPlan(prev => ({ ...prev, priority: details.value[0] as any }))}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                      { value: 'urgent', label: 'Urgent' }
                    ]}
                  />
                </div>
                
                <div>
                  <Typography variant="body" className="text-sm font-medium mb-2">
                    Required Staff
                  </Typography>
                  <NumberField
                    value={newPlan.required_staff || 2}
                    onChange={(value) => setNewPlan(prev => ({ ...prev, required_staff: value }))}
                    min={1}
                    max={10}
                  />
                </div>
              </Grid>
              
              <div>
                <Typography variant="body" className="text-sm font-medium mb-2">
                  Notes
                </Typography>
                <Textarea
                  placeholder="Additional notes or requirements..."
                  value={newPlan.notes || ''}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewPlan(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <Button
                colorPalette="brand"
                onClick={createProductionPlan}
                disabled={!newPlan.product_name || !newPlan.planned_quantity || !newPlan.planned_date}
              >
                Create Production Plan
              </Button>
            </VStack>
          </div>
        </CardWrapper>

        {/* Production Plans List */}
        <VStack gap="md" align="stretch">
          <HStack justify="space-between">
            <Typography variant="heading" className="text-lg font-semibold">
              Production Plans
            </Typography>
            <Badge colorPalette="brand">{plans.length} plans</Badge>
          </HStack>

          {plans.length === 0 ? (
            <CardWrapper>
              <div className="p-8 text-center">
                <VStack gap="md">
                  <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400" />
                  <Typography variant="heading" className="text-lg font-medium">
                    No production plans scheduled
                  </Typography>
                  <Typography variant="body" color="text.muted">
                    Create your first production plan to get started
                  </Typography>
                </VStack>
              </div>
            </CardWrapper>
          ) : (
            <VStack gap="md">
              {plans.map((plan) => (
                <CardWrapper key={plan.id}>
                  <div className="p-4">
                    <HStack justify="space-between" align="start" className="mb-4">
                      <VStack align="stretch" gap="xs" className="flex-1">
                        <HStack gap="sm">
                          {getStatusIcon(plan.status)}
                          <Typography variant="heading" className="text-lg font-semibold">
                            {plan.product_name}
                          </Typography>
                          {getPriorityBadge(plan.priority)}
                          {plan.required_materials.some(m => m.shortage > 0) && (
                            <Badge colorPalette="error" size="xs">SHORTAGES</Badge>
                          )}
                        </HStack>
                        <Typography variant="body" className="text-sm" color="text.muted">
                          Plan ID: {plan.id}
                        </Typography>
                      </VStack>
                      
                      <VStack align="end" gap="xs">
                        {getStatusBadge(plan.status)}
                        <Typography variant="body" className="text-xs" color="text.muted">
                          Created: {new Date(plan.created_at).toLocaleDateString()}
                        </Typography>
                      </VStack>
                    </HStack>
                    
                    <Grid templateColumns="repeat(3, 1fr)" gap="md" className="mb-4">
                      <VStack align="start" gap="xs">
                        <Typography variant="body" className="text-xs" color="text.muted">Quantity</Typography>
                        <Typography variant="body" className="font-semibold">
                          {plan.planned_quantity} units
                        </Typography>
                      </VStack>
                      
                      <VStack align="start" gap="xs">
                        <Typography variant="body" className="text-xs" color="text.muted">Date</Typography>
                        <Typography variant="body" className="font-semibold">
                          {new Date(plan.planned_date).toLocaleDateString()}
                        </Typography>
                      </VStack>
                      
                      <VStack align="start" gap="xs">
                        <Typography variant="body" className="text-xs" color="text.muted">Duration</Typography>
                        <Typography variant="body" className="font-semibold">
                          {plan.estimated_duration}h
                        </Typography>
                      </VStack>
                    </Grid>

                    {/* Material Requirements */}
                    {plan.required_materials.length > 0 && (
                      <div className="mb-4">
                        <Typography variant="body" className="text-sm font-medium mb-2">
                          Material Requirements
                        </Typography>
                        <VStack gap="xs" align="stretch">
                          {plan.required_materials.map((material) => (
                            <div key={material.material_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <HStack gap="sm">
                                <Typography variant="body" className="text-sm font-medium">
                                  {material.material_name}
                                </Typography>
                                <Typography variant="body" className="text-xs" color="text.muted">
                                  {material.quantity_needed} {material.unit}
                                </Typography>
                              </HStack>
                              {material.shortage > 0 ? (
                                <Badge colorPalette="error" size="xs">
                                  -{material.shortage} {material.unit}
                                </Badge>
                              ) : (
                                <Badge colorPalette="success" size="xs">Available</Badge>
                              )}
                            </div>
                          ))}
                        </VStack>
                      </div>
                    )}

                    {plan.notes && (
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r mb-4">
                        <Typography variant="body" className="text-sm">
                          <strong>Notes:</strong> {plan.notes}
                        </Typography>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <HStack justify="end" gap="sm">
                      {plan.status === 'scheduled' && (
                        <>
                          <Button 
                            size="sm" 
                            colorPalette="brand"
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
                        </>
                      )}

                      {plan.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          colorPalette="success"
                          onClick={() => updatePlanStatus(plan.id, 'completed')}
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </HStack>
                  </div>
                </CardWrapper>
              ))}
            </VStack>
          )}
        </VStack>
      </Grid>
    </VStack>
  );
}