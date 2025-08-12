// Supplier Scoring System - Advanced Supplier Performance Analytics
// Automated scoring, risk assessment, and supplier optimization

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  SimpleGrid,
  Table,
  Alert,
  Tabs,
  Select,
  createListCollection,
  IconButton,
  Spinner,
  Progress,
  Dialog,
  Input,
  NumberInput,
  Separator,
  Slider
} from '@chakra-ui/react';
import {
  StarIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface SupplierMetrics {
  id: string;
  name: string;
  category: string[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    contactPerson: string;
  };
  
  // Core Performance Metrics (0-1 scale)
  deliveryReliability: number;
  qualityConsistency: number;
  priceCompetitiveness: number;
  responsiveness: number;
  sustainability: number;
  
  // Calculated Scores
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendationStatus: 'preferred' | 'approved' | 'watch' | 'review' | 'discontinued';
  
  // Historical Data
  totalOrders: number;
  totalSpend: number;
  avgOrderValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
  
  // Delivery Performance
  onTimeDeliveries: number;
  lateDeliveries: number;
  avgDeliveryTime: number; // days
  deliveryVariability: number; // standard deviation
  
  // Quality Metrics
  acceptedDeliveries: number;
  rejectedDeliveries: number;
  defectRate: number; // percentage
  returnRate: number; // percentage
  qualityComplaints: number;
  
  // Financial Performance
  paymentTerms: string;
  discountsOffered: number; // percentage
  priceStability: number; // variance coefficient
  creditRating?: string;
  
  // Communication & Service
  responseTime: number; // hours
  communicationRating: number; // 1-5 scale
  technicalSupport: number; // 1-5 scale
  disputeResolution: number; // 1-5 scale
  
  // Risk Factors
  geographicalRisk: number;
  supplierCapacity: number;
  backupOptions: number;
  contractCompliance: number;
  
  // Metadata
  lastAssessment: string;
  nextReview: string;
  isActive: boolean;
  notes?: string;
}

export interface SupplierAssessment {
  id: string;
  supplierId: string;
  assessmentDate: string;
  assessedBy: string;
  
  // Individual Criteria Scores
  criteriaScores: {
    delivery: number;
    quality: number;
    pricing: number;
    service: number;
    sustainability: number;
  };
  
  // Qualitative Assessment
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  
  // Action Items
  actionItems: {
    description: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    status: 'open' | 'in_progress' | 'completed';
  }[];
  
  // Overall Assessment
  overallRating: number;
  riskAssessment: string;
  continuationRecommendation: 'continue' | 'improve' | 'probation' | 'discontinue';
}

export interface SupplierComparison {
  category: string;
  suppliers: {
    id: string;
    name: string;
    score: number;
    rank: number;
    strengths: string[];
    weaknesses: string[];
  }[];
  marketBenchmarks: {
    avgDeliveryTime: number;
    avgQualityScore: number;
    avgPriceCompetitiveness: number;
  };
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const generateMockSuppliers = (): SupplierMetrics[] => {
  const categories = ['Carnes', 'Vegetales', 'Lácteos', 'Panadería', 'Bebidas', 'Especias', 'Limpieza'];
  const names = [
    'Distribuidora Central SA', 'Mercado Fresco Ltda', 'Agrosuministros Del Sur',
    'Lácteos Premium', 'Carnes Selectas', 'Verduras Orgánicas', 'Panadería Industrial',
    'Bebidas y Más', 'Especias Gourmet', 'Productos Químicos Industriales'
  ];

  return names.map((name, index) => {
    const deliveryReliability = Math.random() * 0.4 + 0.6;
    const qualityConsistency = Math.random() * 0.3 + 0.7;
    const priceCompetitiveness = Math.random() * 0.5 + 0.5;
    const responsiveness = Math.random() * 0.4 + 0.6;
    const sustainability = Math.random() * 0.6 + 0.4;
    
    const overallScore = (deliveryReliability + qualityConsistency + priceCompetitiveness + responsiveness + sustainability) / 5;
    
    let riskLevel: SupplierMetrics['riskLevel'];
    if (overallScore > 0.85) riskLevel = 'low';
    else if (overallScore > 0.7) riskLevel = 'medium';
    else if (overallScore > 0.55) riskLevel = 'high';
    else riskLevel = 'critical';
    
    let recommendationStatus: SupplierMetrics['recommendationStatus'];
    if (overallScore > 0.9) recommendationStatus = 'preferred';
    else if (overallScore > 0.75) recommendationStatus = 'approved';
    else if (overallScore > 0.6) recommendationStatus = 'watch';
    else if (overallScore > 0.45) recommendationStatus = 'review';
    else recommendationStatus = 'discontinued';

    const totalOrders = Math.floor(Math.random() * 200) + 50;
    const onTimeDeliveries = Math.floor(totalOrders * deliveryReliability);
    const acceptedDeliveries = Math.floor(totalOrders * qualityConsistency);
    
    return {
      id: `supplier-${index + 1}`,
      name,
      category: [categories[Math.floor(Math.random() * categories.length)]],
      contactInfo: {
        email: `contacto@${name.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: `+54 11 ${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        address: `Av. ${Math.floor(Math.random() * 9000) + 1000}, CABA, Argentina`,
        contactPerson: `${['Juan', 'María', 'Carlos', 'Ana'][Math.floor(Math.random() * 4)]} ${['García', 'López', 'Martínez', 'González'][Math.floor(Math.random() * 4)]}`
      },
      
      deliveryReliability,
      qualityConsistency,
      priceCompetitiveness,
      responsiveness,
      sustainability,
      
      overallScore,
      riskLevel,
      recommendationStatus,
      
      totalOrders,
      totalSpend: Math.random() * 500000 + 100000,
      avgOrderValue: Math.random() * 15000 + 5000,
      firstOrderDate: new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000).toISOString(),
      lastOrderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      
      onTimeDeliveries,
      lateDeliveries: totalOrders - onTimeDeliveries,
      avgDeliveryTime: Math.random() * 5 + 1,
      deliveryVariability: Math.random() * 2 + 0.5,
      
      acceptedDeliveries,
      rejectedDeliveries: totalOrders - acceptedDeliveries,
      defectRate: (1 - qualityConsistency) * 10,
      returnRate: (1 - qualityConsistency) * 5,
      qualityComplaints: Math.floor((1 - qualityConsistency) * 20),
      
      paymentTerms: ['30 días', '45 días', '60 días', 'Contado'][Math.floor(Math.random() * 4)],
      discountsOffered: Math.random() * 15,
      priceStability: Math.random() * 0.2 + 0.8,
      creditRating: ['AAA', 'AA', 'A', 'BBB'][Math.floor(Math.random() * 4)],
      
      responseTime: Math.random() * 48 + 2,
      communicationRating: Math.floor(responsiveness * 5) + 1,
      technicalSupport: Math.floor(Math.random() * 5) + 1,
      disputeResolution: Math.floor(Math.random() * 5) + 1,
      
      geographicalRisk: Math.random() * 0.4 + 0.1,
      supplierCapacity: Math.random() * 0.3 + 0.7,
      backupOptions: Math.floor(Math.random() * 3) + 1,
      contractCompliance: Math.random() * 0.2 + 0.8,
      
      lastAssessment: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      nextReview: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: Math.random() > 0.1,
      notes: Math.random() > 0.7 ? 'Proveedor estratégico con buena relación comercial' : undefined
    };
  });
};

// ============================================================================
// SUPPLIER SCORING COMPONENT
// ============================================================================

const categoryOptions = createListCollection({
  items: [
    { value: 'all', label: 'Todas las Categorías' },
    { value: 'Carnes', label: 'Carnes' },
    { value: 'Vegetales', label: 'Vegetales' },
    { value: 'Lácteos', label: 'Lácteos' },
    { value: 'Panadería', label: 'Panadería' },
    { value: 'Bebidas', label: 'Bebidas' }
  ]
});

const statusOptions = createListCollection({
  items: [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'preferred', label: 'Preferidos' },
    { value: 'approved', label: 'Aprobados' },
    { value: 'watch', label: 'En Observación' },
    { value: 'review', label: 'Requiere Revisión' },
    { value: 'discontinued', label: 'Discontinuados' }
  ]
});

export function SupplierScoring() {
  // State management
  const [suppliers, setSuppliers] = useState<SupplierMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'suppliers' | 'assessments' | 'benchmarks'>('dashboard');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierMetrics | null>(null);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);

  // Load data
  useEffect(() => {
    loadSupplierData();
  }, []);

  const loadSupplierData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1400));
      
      const mockSuppliers = generateMockSuppliers();
      setSuppliers(mockSuppliers);
      
    } catch (error) {
      console.error('Error loading supplier data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Recalculate all supplier scores
  const recalculateScores = useCallback(async () => {
    try {
      setIsRecalculating(true);
      
      // Simulate AI recalculation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Update suppliers with new scores
      const updatedSuppliers = suppliers.map(supplier => {
        // Simulate small score adjustments
        const adjustmentFactor = (Math.random() - 0.5) * 0.1; // ±5% adjustment
        const newOverallScore = Math.max(0, Math.min(1, supplier.overallScore + adjustmentFactor));
        
        let newRiskLevel: SupplierMetrics['riskLevel'];
        if (newOverallScore > 0.85) newRiskLevel = 'low';
        else if (newOverallScore > 0.7) newRiskLevel = 'medium';
        else if (newOverallScore > 0.55) newRiskLevel = 'high';
        else newRiskLevel = 'critical';
        
        return {
          ...supplier,
          overallScore: newOverallScore,
          riskLevel: newRiskLevel,
          lastAssessment: new Date().toISOString()
        };
      });
      
      setSuppliers(updatedSuppliers);
      
      // Emit recalculation event
      await EventBus.emit(
        RestaurantEvents.DATA_SYNCED,
        {
          type: 'supplier_scores_recalculated',
          suppliersCount: updatedSuppliers.length,
          avgScore: updatedSuppliers.reduce((sum, s) => sum + s.overallScore, 0) / updatedSuppliers.length
        },
        'SupplierScoring'
      );
      
    } catch (error) {
      console.error('Error recalculating scores:', error);
    } finally {
      setIsRecalculating(false);
    }
  }, [suppliers]);

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      if (categoryFilter !== 'all' && !supplier.category.includes(categoryFilter)) {
        return false;
      }
      if (statusFilter !== 'all' && supplier.recommendationStatus !== statusFilter) {
        return false;
      }
      return supplier.isActive;
    });
  }, [suppliers, categoryFilter, statusFilter]);

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    if (suppliers.length === 0) return null;

    const activeSuppliers = suppliers.filter(s => s.isActive);
    const avgScore = activeSuppliers.reduce((sum, s) => sum + s.overallScore, 0) / activeSuppliers.length;
    
    const riskDistribution = {
      low: activeSuppliers.filter(s => s.riskLevel === 'low').length,
      medium: activeSuppliers.filter(s => s.riskLevel === 'medium').length,
      high: activeSuppliers.filter(s => s.riskLevel === 'high').length,
      critical: activeSuppliers.filter(s => s.riskLevel === 'critical').length
    };
    
    const statusDistribution = {
      preferred: activeSuppliers.filter(s => s.recommendationStatus === 'preferred').length,
      approved: activeSuppliers.filter(s => s.recommendationStatus === 'approved').length,
      watch: activeSuppliers.filter(s => s.recommendationStatus === 'watch').length,
      review: activeSuppliers.filter(s => s.recommendationStatus === 'review').length,
      discontinued: activeSuppliers.filter(s => s.recommendationStatus === 'discontinued').length
    };
    
    const topPerformers = activeSuppliers
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5);
    
    const needsAttention = activeSuppliers
      .filter(s => s.riskLevel === 'critical' || s.recommendationStatus === 'review')
      .slice(0, 5);
    
    const totalSpend = activeSuppliers.reduce((sum, s) => sum + s.totalSpend, 0);
    const avgDeliveryReliability = activeSuppliers.reduce((sum, s) => sum + s.deliveryReliability, 0) / activeSuppliers.length;

    return {
      totalActiveSuppliers: activeSuppliers.length,
      avgScore,
      riskDistribution,
      statusDistribution,
      topPerformers,
      needsAttention,
      totalSpend,
      avgDeliveryReliability
    };
  }, [suppliers]);

  if (isLoading) {
    return (
      <Box p="6" textAlign="center">
        <VStack gap="4">
          <Spinner size="xl" colorPalette="blue" />
          <Text>Cargando sistema de evaluación de proveedores...</Text>
          <Text fontSize="sm" color="gray.600">Analizando métricas de performance y riesgo</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Header with Controls */}
      <Card.Root>
        <Card.Body>
          <VStack gap="4" align="stretch">
            <HStack justify="space-between" align="start">
              <VStack align="start" gap="1">
                <HStack gap="2">
                  <StarIcon className="w-6 h-6 text-yellow-600" />
                  <Text fontSize="xl" fontWeight="bold">Supplier Scoring System</Text>
                  <Badge colorPalette="yellow" size="sm">Analytics</Badge>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  Sistema de evaluación y scoring automático de proveedores con análisis de riesgo
                </Text>
              </VStack>

              <HStack gap="2">
                <Button
                  variant="outline"
                  leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                  onClick={loadSupplierData}
                  size="sm"
                >
                  Actualizar
                </Button>
                
                <Button
                  colorPalette="blue"
                  leftIcon={<ChartBarIcon className="w-4 h-4" />}
                  onClick={recalculateScores}
                  loading={isRecalculating}
                  loadingText="Recalculando..."
                  size="sm"
                >
                  Recalcular Scores
                </Button>
              </HStack>
            </HStack>

            {/* Key Metrics Cards */}
            {dashboardMetrics && (
              <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
                <Card.Root variant="subtle" bg="blue.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {dashboardMetrics.totalActiveSuppliers}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Proveedores Activos</Text>
                      <Text fontSize="xs" color="blue.600">
                        ${(dashboardMetrics.totalSpend / 1000000).toFixed(1)}M spend
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="green.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {(dashboardMetrics.avgScore * 100).toFixed(0)}%
                      </Text>
                      <Text fontSize="sm" color="gray.600">Score Promedio</Text>
                      <Text fontSize="xs" color="green.600">
                        {(dashboardMetrics.avgDeliveryReliability * 100).toFixed(0)}% on-time
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="yellow.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
                        {dashboardMetrics.statusDistribution.preferred}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Preferidos</Text>
                      <Text fontSize="xs" color="yellow.600">
                        {dashboardMetrics.statusDistribution.approved} aprobados
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="red.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="red.600">
                        {dashboardMetrics.riskDistribution.critical}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Riesgo Crítico</Text>
                      <Text fontSize="xs" color="red.600">
                        {dashboardMetrics.needsAttention.length} requieren atención
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </SimpleGrid>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Risk Alert */}
      {dashboardMetrics && dashboardMetrics.riskDistribution.critical > 0 && (
        <Alert.Root status="error" variant="subtle">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <Alert.Title>
            Atención: {dashboardMetrics.riskDistribution.critical} proveedores de riesgo crítico
          </Alert.Title>
          <Alert.Description>
            Algunos proveedores requieren revisión inmediata para evitar interrupciones en la cadena de suministro.
          </Alert.Description>
        </Alert.Root>
      )}

      {/* Main Content Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
        <Tabs.List>
          <Tabs.Trigger value="dashboard">
            <HStack gap={2}>
              <ChartBarIcon className="w-4 h-4" />
              <Text>Dashboard</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="suppliers">
            <HStack gap={2}>
              <UserGroupIcon className="w-4 h-4" />
              <Text>Proveedores</Text>
              <Badge colorPalette="blue" size="sm">{suppliers.filter(s => s.isActive).length}</Badge>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="assessments">
            <HStack gap={2}>
              <PencilIcon className="w-4 h-4" />
              <Text>Evaluaciones</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="benchmarks">
            <HStack gap={2}>
              <ShieldCheckIcon className="w-4 h-4" />
              <Text>Benchmarks</Text>
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>

        <Box mt="6">
          {/* Dashboard Tab */}
          <Tabs.Content value="dashboard">
            <VStack gap="6" align="stretch">
              {dashboardMetrics && (
                <>
                  {/* Risk Distribution */}
                  <Card.Root>
                    <Card.Header>
                      <Text fontWeight="bold">Distribución de Riesgo</Text>
                    </Card.Header>
                    <Card.Body>
                      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
                        <VStack gap="2" p="4" bg="green.50" borderRadius="md">
                          <Text fontSize="2xl" fontWeight="bold" color="green.600">
                            {dashboardMetrics.riskDistribution.low}
                          </Text>
                          <Text fontSize="sm" color="gray.600">Riesgo Bajo</Text>
                          <Progress.Root value={85} colorPalette="green" size="sm">
                            <Progress.Track>
                              <Progress.Range />
                            </Progress.Track>
                          </Progress.Root>
                        </VStack>
                        
                        <VStack gap="2" p="4" bg="yellow.50" borderRadius="md">
                          <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
                            {dashboardMetrics.riskDistribution.medium}
                          </Text>
                          <Text fontSize="sm" color="gray.600">Riesgo Medio</Text>
                          <Progress.Root value={60} colorPalette="yellow" size="sm">
                            <Progress.Track>
                              <Progress.Range />
                            </Progress.Track>
                          </Progress.Root>
                        </VStack>
                        
                        <VStack gap="2" p="4" bg="orange.50" borderRadius="md">
                          <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                            {dashboardMetrics.riskDistribution.high}
                          </Text>
                          <Text fontSize="sm" color="gray.600">Riesgo Alto</Text>
                          <Progress.Root value={35} colorPalette="orange" size="sm">
                            <Progress.Track>
                              <Progress.Range />
                            </Progress.Track>
                          </Progress.Root>
                        </VStack>
                        
                        <VStack gap="2" p="4" bg="red.50" borderRadius="md">
                          <Text fontSize="2xl" fontWeight="bold" color="red.600">
                            {dashboardMetrics.riskDistribution.critical}
                          </Text>
                          <Text fontSize="sm" color="gray.600">Riesgo Crítico</Text>
                          <Progress.Root value={10} colorPalette="red" size="sm">
                            <Progress.Track>
                              <Progress.Range />
                            </Progress.Track>
                          </Progress.Root>
                        </VStack>
                      </SimpleGrid>
                    </Card.Body>
                  </Card.Root>

                  {/* Top Performers vs Needs Attention */}
                  <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
                    <Card.Root>
                      <Card.Header>
                        <HStack gap="2">
                          <StarIcon className="w-5 h-5 text-yellow-500" />
                          <Text fontWeight="bold">Top Performers</Text>
                        </HStack>
                      </Card.Header>
                      <Card.Body>
                        <VStack gap="3" align="stretch">
                          {dashboardMetrics.topPerformers.map((supplier, index) => (
                            <HStack key={supplier.id} justify="space-between" p="3" bg="green.50" borderRadius="md">
                              <HStack gap="3">
                                <Badge colorPalette="green" size="sm">#{index + 1}</Badge>
                                <VStack align="start" gap="1">
                                  <Text fontSize="sm" fontWeight="medium">{supplier.name}</Text>
                                  <Text fontSize="xs" color="gray.600">{supplier.category.join(', ')}</Text>
                                </VStack>
                              </HStack>
                              <VStack align="end" gap="1">
                                <Text fontSize="sm" fontWeight="bold" color="green.600">
                                  {(supplier.overallScore * 100).toFixed(0)}%
                                </Text>
                                <Badge colorPalette="green" size="xs">
                                  {supplier.recommendationStatus}
                                </Badge>
                              </VStack>
                            </HStack>
                          ))}
                        </VStack>
                      </Card.Body>
                    </Card.Root>

                    <Card.Root>
                      <Card.Header>
                        <HStack gap="2">
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                          <Text fontWeight="bold">Requieren Atención</Text>
                        </HStack>
                      </Card.Header>
                      <Card.Body>
                        <VStack gap="3" align="stretch">
                          {dashboardMetrics.needsAttention.length === 0 ? (
                            <VStack gap="2" p="4" textAlign="center">
                              <CheckCircleIcon className="w-6 h-6 text-green-500" />
                              <Text color="green.600" fontSize="sm">¡Todos los proveedores en buen estado!</Text>
                            </VStack>
                          ) : (
                            dashboardMetrics.needsAttention.map((supplier) => (
                              <HStack key={supplier.id} justify="space-between" p="3" bg="red.50" borderRadius="md">
                                <VStack align="start" gap="1">
                                  <Text fontSize="sm" fontWeight="medium">{supplier.name}</Text>
                                  <Text fontSize="xs" color="gray.600">{supplier.category.join(', ')}</Text>
                                </VStack>
                                <VStack align="end" gap="1">
                                  <Badge colorPalette={getRiskColor(supplier.riskLevel)} size="sm">
                                    {getRiskLabel(supplier.riskLevel)}
                                  </Badge>
                                  <Text fontSize="xs" color="gray.600">
                                    {(supplier.overallScore * 100).toFixed(0)}% score
                                  </Text>
                                </VStack>
                              </HStack>
                            ))
                          )}
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  </SimpleGrid>
                </>
              )}
            </VStack>
          </Tabs.Content>

          {/* Suppliers Tab */}
          <Tabs.Content value="suppliers">
            <VStack gap="4" align="stretch">
              {/* Filters */}
              <HStack gap="4" wrap="wrap">
                <Select.Root
                  collection={categoryOptions}
                  value={[categoryFilter]}
                  onValueChange={(e) => setCategoryFilter(e.value[0])}
                  width="200px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {categoryOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>

                <Select.Root
                  collection={statusOptions}
                  value={[statusFilter]}
                  onValueChange={(e) => setStatusFilter(e.value[0])}
                  width="200px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {statusOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>

                <Text fontSize="sm" color="gray.600" alignSelf="center">
                  {filteredSuppliers.length} de {suppliers.filter(s => s.isActive).length} proveedores
                </Text>
              </HStack>

              {/* Suppliers Table */}
              <SuppliersTable 
                suppliers={filteredSuppliers} 
                onSupplierClick={(supplier) => {
                  setSelectedSupplier(supplier);
                  setShowSupplierDialog(true);
                }}
              />
            </VStack>
          </Tabs.Content>

          {/* Assessments Tab */}
          <Tabs.Content value="assessments">
            <Card.Root>
              <Card.Body p="8" textAlign="center">
                <VStack gap="4">
                  <PencilIcon className="w-12 h-12 text-gray-400" />
                  <Text fontWeight="medium">Sistema de Evaluaciones</Text>
                  <Text color="gray.600">
                    Próximamente: Sistema completo de evaluaciones manuales y automáticas de proveedores
                  </Text>
                  <Button variant="outline" disabled>
                    Crear Nueva Evaluación
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          {/* Benchmarks Tab */}
          <Tabs.Content value="benchmarks">
            <Card.Root>
              <Card.Body p="8" textAlign="center">
                <VStack gap="4">
                  <ShieldCheckIcon className="w-12 h-12 text-gray-400" />
                  <Text fontWeight="medium">Benchmarking Industrial</Text>
                  <Text color="gray.600">
                    Próximamente: Comparación con estándares de la industria y métricas de mercado
                  </Text>
                  <Button variant="outline" disabled>
                    Ver Benchmarks
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>
        </Box>
      </Tabs.Root>

      {/* Supplier Detail Dialog */}
      <Dialog.Root open={showSupplierDialog} onOpenChange={({ open }) => setShowSupplierDialog(open)} size="xl">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {selectedSupplier?.name}
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              {selectedSupplier && <SupplierDetailView supplier={selectedSupplier} />}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </VStack>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface SuppliersTableProps {
  suppliers: SupplierMetrics[];
  onSupplierClick: (supplier: SupplierMetrics) => void;
}

function SuppliersTable({ suppliers, onSupplierClick }: SuppliersTableProps) {
  if (suppliers.length === 0) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <UserGroupIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">No hay proveedores que mostrar</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Body>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Proveedor</Table.ColumnHeader>
              <Table.ColumnHeader>Score</Table.ColumnHeader>
              <Table.ColumnHeader>Riesgo</Table.ColumnHeader>
              <Table.ColumnHeader>Estado</Table.ColumnHeader>
              <Table.ColumnHeader>Entrega</Table.ColumnHeader>
              <Table.ColumnHeader>Calidad</Table.ColumnHeader>
              <Table.ColumnHeader>Gasto Total</Table.ColumnHeader>
              <Table.ColumnHeader>Último Pedido</Table.ColumnHeader>
              <Table.ColumnHeader>Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {suppliers.slice(0, 20).map((supplier) => (
              <Table.Row key={supplier.id}>
                <Table.Cell>
                  <VStack align="start" gap="1">
                    <Text fontWeight="medium">{supplier.name}</Text>
                    <Text fontSize="xs" color="gray.600">{supplier.category.join(', ')}</Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <VStack align="center" gap="1">
                    <Text fontWeight="bold" color={getScoreColor(supplier.overallScore)}>
                      {(supplier.overallScore * 100).toFixed(0)}%
                    </Text>
                    <Progress.Root 
                      value={supplier.overallScore * 100} 
                      size="sm" 
                      width="60px"
                      colorPalette={getScoreColor(supplier.overallScore)}
                    >
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={getRiskColor(supplier.riskLevel)} size="sm">
                    {getRiskLabel(supplier.riskLevel)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={getStatusColor(supplier.recommendationStatus)} size="sm">
                    {getStatusLabel(supplier.recommendationStatus)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <VStack align="center" gap="1">
                    <Text fontSize="sm">{(supplier.deliveryReliability * 100).toFixed(0)}%</Text>
                    <Text fontSize="xs" color="gray.600">{supplier.avgDeliveryTime.toFixed(1)}d avg</Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <VStack align="center" gap="1">
                    <Text fontSize="sm">{(supplier.qualityConsistency * 100).toFixed(0)}%</Text>
                    <Text fontSize="xs" color="gray.600">{supplier.defectRate.toFixed(1)}% defects</Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" fontWeight="medium">
                    ${(supplier.totalSpend / 1000).toFixed(0)}K
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm">
                    {new Date(supplier.lastOrderDate).toLocaleDateString()}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    aria-label="Ver detalles"
                    onClick={() => onSupplierClick(supplier)}
                  >
                    <EyeIcon className="w-3 h-3" />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </Card.Root>
  );
}

interface SupplierDetailViewProps {
  supplier: SupplierMetrics;
}

function SupplierDetailView({ supplier }: SupplierDetailViewProps) {
  return (
    <VStack gap="6" align="stretch">
      {/* Overview */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
        <Card.Root variant="outline" p="3">
          <VStack gap="2" textAlign="center">
            <Text fontSize="xl" fontWeight="bold" color={getScoreColor(supplier.overallScore)}>
              {(supplier.overallScore * 100).toFixed(0)}%
            </Text>
            <Text fontSize="sm" color="gray.600">Score General</Text>
          </VStack>
        </Card.Root>
        
        <Card.Root variant="outline" p="3">
          <VStack gap="2" textAlign="center">
            <Badge colorPalette={getRiskColor(supplier.riskLevel)} size="sm">
              {getRiskLabel(supplier.riskLevel)}
            </Badge>
            <Text fontSize="sm" color="gray.600">Nivel de Riesgo</Text>
          </VStack>
        </Card.Root>
        
        <Card.Root variant="outline" p="3">
          <VStack gap="2" textAlign="center">
            <Text fontSize="xl" fontWeight="bold">
              {supplier.totalOrders}
            </Text>
            <Text fontSize="sm" color="gray.600">Pedidos Totales</Text>
          </VStack>
        </Card.Root>
        
        <Card.Root variant="outline" p="3">
          <VStack gap="2" textAlign="center">
            <Text fontSize="xl" fontWeight="bold" color="green.600">
              ${(supplier.totalSpend / 1000).toFixed(0)}K
            </Text>
            <Text fontSize="sm" color="gray.600">Gasto Total</Text>
          </VStack>
        </Card.Root>
      </SimpleGrid>

      {/* Performance Metrics */}
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Métricas de Performance</Text>
        </Card.Header>
        <Card.Body>
          <VStack gap="4" align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm">Confiabilidad de Entrega</Text>
              <HStack gap="2">
                <Progress.Root value={supplier.deliveryReliability * 100} size="sm" width="120px" colorPalette="blue">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize="sm" fontWeight="medium">{(supplier.deliveryReliability * 100).toFixed(0)}%</Text>
              </HStack>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="sm">Consistencia de Calidad</Text>
              <HStack gap="2">
                <Progress.Root value={supplier.qualityConsistency * 100} size="sm" width="120px" colorPalette="green">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize="sm" fontWeight="medium">{(supplier.qualityConsistency * 100).toFixed(0)}%</Text>
              </HStack>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="sm">Competitividad de Precio</Text>
              <HStack gap="2">
                <Progress.Root value={supplier.priceCompetitiveness * 100} size="sm" width="120px" colorPalette="purple">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize="sm" fontWeight="medium">{(supplier.priceCompetitiveness * 100).toFixed(0)}%</Text>
              </HStack>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="sm">Capacidad de Respuesta</Text>
              <HStack gap="2">
                <Progress.Root value={supplier.responsiveness * 100} size="sm" width="120px" colorPalette="orange">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize="sm" fontWeight="medium">{(supplier.responsiveness * 100).toFixed(0)}%</Text>
              </HStack>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Contact Info */}
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Información de Contacto</Text>
        </Card.Header>
        <Card.Body>
          <VStack gap="2" align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">Contacto:</Text>
              <Text fontSize="sm">{supplier.contactInfo.contactPerson}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">Email:</Text>
              <Text fontSize="sm">{supplier.contactInfo.email}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">Teléfono:</Text>
              <Text fontSize="sm">{supplier.contactInfo.phone}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">Dirección:</Text>
              <Text fontSize="sm">{supplier.contactInfo.address}</Text>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}

// Helper functions
function getScoreColor(score: number): string {
  if (score >= 0.85) return 'green';
  if (score >= 0.7) return 'yellow';
  if (score >= 0.55) return 'orange';
  return 'red';
}

function getRiskColor(risk: string): string {
  switch (risk) {
    case 'low': return 'green';
    case 'medium': return 'yellow';
    case 'high': return 'orange';
    case 'critical': return 'red';
    default: return 'gray';
  }
}

function getRiskLabel(risk: string): string {
  switch (risk) {
    case 'low': return 'Bajo';
    case 'medium': return 'Medio';
    case 'high': return 'Alto';
    case 'critical': return 'Crítico';
    default: return risk;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'preferred': return 'green';
    case 'approved': return 'blue';
    case 'watch': return 'yellow';
    case 'review': return 'orange';
    case 'discontinued': return 'red';
    default: return 'gray';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'preferred': return 'Preferido';
    case 'approved': return 'Aprobado';
    case 'watch': return 'Observación';
    case 'review': return 'Revisión';
    case 'discontinued': return 'Discontinuado';
    default: return status;
  }
}

export default SupplierScoring;