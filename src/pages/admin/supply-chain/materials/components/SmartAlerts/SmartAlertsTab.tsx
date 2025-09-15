// ============================================================================
// SMART ALERTS TAB - Intelligent Inventory Alerts
// ============================================================================
// Dashboard avanzado de alertas inteligentes integrado con sistema unificado

import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Input,
  SimpleGrid,
  Badge,
  IconButton,
  Progress
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
  FireIcon,
  ChartBarIcon,
  CubeIcon,
  ArrowPathIcon,
  FunnelIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// Design System v2.0
import { ContentLayout, Section, CardWrapper, MetricCard, CardGrid } from '@/shared/ui';

// Smart Alerts Integration
import { useSmartInventoryAlerts } from '@/hooks/useSmartInventoryAlerts';
import { AlertDisplay } from '@/shared/alerts/components/AlertDisplay';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

interface SmartAlertsTabProps {
  // Configuración opcional
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const SmartAlertsTab: React.FC<SmartAlertsTabProps> = ({ 
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutos
}) => {
  
  // Estados locales para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [showResolved, setShowResolved] = useState(false);

  // Smart alerts hook
  const {
    materialsLoading,
    alertsLoading,
    isGeneratingAlerts,
    materials,
    activeAlerts,
    criticalAlerts,
    alertsCount,
    refreshAlerts,
    generateAndUpdateAlerts,
    analytics,
    ui
  } = useSmartInventoryAlerts({
    autoRefresh,
    refreshIntervalMs: refreshInterval,
    minValue: 100,
    enablePredictive: true,
    autoResolveOutdated: true
  });

  // Filtrar alertas según criterios
  const filteredAlerts = React.useMemo(() => {
    return activeAlerts.filter(alert => {
      // Filtro por término de búsqueda
      const matchesSearch = !searchTerm || 
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.metadata?.itemName?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por severidad
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [activeAlerts, searchTerm, severityFilter]);

  // Loading state
  if (materialsLoading || alertsLoading) {
    return (
      <ContentLayout spacing="normal">
        <VStack align="center" gap="4">
          <CubeIcon className="w-12 h-12" />
          <Text>Cargando sistema de alertas inteligentes...</Text>
          <Progress size="sm" colorPalette="blue" />
        </VStack>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      <VStack align="start" gap="6">
        
        {/* Header con métricas generales */}
        <Section title="Alertas Inteligentes de Inventario" variant="elevated">
          
          {/* Métricas overview */}
          <CardGrid columns={{ base: 2, md: 4 }} gap="4" mb="6">
            <MetricCard
              title="Items Monitoreados"
              value={analytics.totalItemsMonitored}
              icon={<CubeIcon className="w-5 h-5" />}
              trend={analytics.totalItemsMonitored > 0 ? 'positive' : 'neutral'}
              colorScheme="blue"
            />
            
            <MetricCard
              title="Alertas Activas"
              value={alertsCount}
              icon={<ExclamationTriangleIcon className="w-5 h-5" />}
              trend={alertsCount > 0 ? 'negative' : 'positive'}
              colorScheme={alertsCount > 0 ? 'red' : 'green'}
            />
            
            <MetricCard
              title="Alertas Críticas"
              value={criticalAlerts.length}
              icon={<FireIcon className="w-5 h-5" />}
              trend={criticalAlerts.length > 0 ? 'negative' : 'positive'}
              colorScheme={criticalAlerts.length > 0 ? 'red' : 'green'}
            />
            
            <MetricCard
              title="Items con Alertas"
              value={analytics.itemsWithAlerts}
              icon={<ChartBarIcon className="w-5 h-5" />}
              subtitle={`${Math.round((analytics.itemsWithAlerts / analytics.totalItemsMonitored) * 100)}% del total`}
              colorScheme="orange"
            />
          </CardGrid>

          {/* Distribución por clase ABC */}
          <CardWrapper variant="subtle" mb="4">
            <HStack justify="space-between" mb="4">
              <Text fontSize="sm" fontWeight="semibold">Distribución de Alertas por Clase ABC</Text>
              <HStack gap="2">
                <Badge colorPalette="red" variant="subtle">
                  Clase A: {analytics.alertsByClass.A}
                </Badge>
                <Badge colorPalette="yellow" variant="subtle">
                  Clase B: {analytics.alertsByClass.B}
                </Badge>
                <Badge colorPalette="green" variant="subtle">
                  Clase C: {analytics.alertsByClass.C}
                </Badge>
              </HStack>
            </HStack>
          </CardWrapper>

          {/* Controles y acciones */}
          <HStack justify="space-between" wrap="wrap" gap="4">
            
            {/* Filtros */}
            <HStack gap="4" flex="1">
              <Input
                placeholder="Buscar alertas o materiales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxW="300px"
              />
              
              <Button
                variant={severityFilter === 'all' ? 'solid' : 'outline'}
                size="sm"
                onClick={() => setSeverityFilter('all')}
              >
                Todas
              </Button>
              <Button
                variant={severityFilter === 'critical' ? 'solid' : 'outline'}
                size="sm"
                colorPalette="red"
                onClick={() => setSeverityFilter('critical')}
              >
                Críticas
              </Button>
              <Button
                variant={severityFilter === 'high' ? 'solid' : 'outline'}
                size="sm"
                colorPalette="orange"
                onClick={() => setSeverityFilter('high')}
              >
                Altas
              </Button>
            </HStack>

            {/* Acciones */}
            <HStack gap="2">
              <Button
                leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                onClick={refreshAlerts}
                loading={isGeneratingAlerts}
                size="sm"
                colorPalette="blue"
              >
                Actualizar
              </Button>
              <Button
                leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={generateAndUpdateAlerts}
                loading={isGeneratingAlerts}
                size="sm"
                variant="outline"
              >
                Regenerar
              </Button>
            </HStack>
          </HStack>
        </Section>

        {/* Lista de alertas */}
        <Section title={`Alertas Filtradas (${filteredAlerts.length})`}>
          
          {filteredAlerts.length === 0 ? (
            // Estado vacío
            <CardWrapper variant="elevated" p="8">
              <VStack align="center" gap="4">
                <CheckCircleIcon className="w-16 h-16 text-green-500" />
                <Text fontSize="lg" fontWeight="semibold">
                  {alertsCount === 0 ? '¡Todo bajo control!' : 'No hay alertas que coincidan con los filtros'}
                </Text>
                <Text color="gray.600" textAlign="center">
                  {alertsCount === 0 
                    ? 'El sistema no ha detectado problemas en el inventario'
                    : 'Prueba ajustando los filtros para ver más alertas'
                  }
                </Text>
                {alertsCount === 0 && (
                  <Text fontSize="sm" color="gray.500">
                    Monitoreando {analytics.totalItemsMonitored} materiales
                  </Text>
                )}
              </VStack>
            </CardWrapper>
          ) : (
            // Lista de alertas
            <VStack gap="4" align="stretch">
              {filteredAlerts.map((alert) => (
                <AlertDisplay
                  key={alert.id}
                  alert={alert}
                  showActions={true}
                  compact={false}
                />
              ))}
            </VStack>
          )}
        </Section>

        {/* Items más críticos */}
        {analytics.mostCriticalItems.length > 0 && (
          <Section title="Items que Requieren Atención Inmediata" variant="elevated">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              {analytics.mostCriticalItems.map((item) => (
                <CardWrapper key={item.id} variant="subtle" p="4">
                  <VStack align="start" gap="3">
                    
                    <HStack justify="space-between" w="full">
                      <HStack gap="3">
                        <Badge
                          colorPalette={
                            item.abcClass === 'A' ? 'red' : 
                            item.abcClass === 'B' ? 'yellow' : 'green'
                          }
                          variant="solid"
                        >
                          Clase {item.abcClass}
                        </Badge>
                        <Badge
                          colorPalette={
                            item.maxSeverity === 'critical' ? 'red' :
                            item.maxSeverity === 'high' ? 'orange' :
                            item.maxSeverity === 'medium' ? 'yellow' : 'blue'
                          }
                          variant="subtle"
                        >
                          {item.maxSeverity === 'critical' ? 'Crítico' :
                           item.maxSeverity === 'high' ? 'Alto' :
                           item.maxSeverity === 'medium' ? 'Medio' : 'Bajo'}
                        </Badge>
                      </HStack>
                      
                      <Text fontSize="sm" fontWeight="bold" color="red.600">
                        {item.alertCount} alerta{item.alertCount > 1 ? 's' : ''}
                      </Text>
                    </HStack>

                    <Text fontWeight="semibold">{item.name}</Text>
                    
                    <HStack gap="2" w="full">
                      <Button size="xs" variant="outline" leftIcon={<EyeIcon className="w-3 h-3" />}>
                        Ver Detalles
                      </Button>
                      <Button size="xs" colorPalette="blue">
                        Resolver
                      </Button>
                    </HStack>
                  </VStack>
                </CardWrapper>
              ))}
            </SimpleGrid>
          </Section>
        )}

        {/* Footer con estadísticas */}
        <CardWrapper variant="subtle" p="4">
          <HStack justify="space-between" wrap="wrap">
            <Text fontSize="sm" color="gray.600">
              Última actualización: {new Date().toLocaleTimeString('es-AR')}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {autoRefresh ? `Auto-refresh cada ${Math.round(refreshInterval / 60000)} min` : 'Auto-refresh deshabilitado'}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Sistema de alertas inteligente v2.0
            </Text>
          </HStack>
        </CardWrapper>

      </VStack>
    </ContentLayout>
  );
};

export default SmartAlertsTab;