// Performance Dashboard Widget - Real-time performance monitoring
import { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  CardWrapper,
  Progress,
  Avatar,
  Spinner,
  Icon
} from '@/shared/ui';
import {
  TrophyIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
// TODO: Use ArrowTrendingDownIcon for performance trend indicators
import { useStaffWithLoader, usePerformanceAnalytics } from '@/modules/team/hooks';
import type { TopPerformer, PerformanceAlert } from '../types';

import { logger } from '@/lib/logging';
interface PerformanceDashboardProps {
  compact?: boolean;
  showDetails?: boolean;
}

export function PerformanceDashboard({ compact = false, showDetails = true }: PerformanceDashboardProps) {
  const { staff, loading: staffLoading } = useStaffWithLoader();
  const { loading: analyticsLoading, loadTopPerformers, loadDepartmentPerformance } = usePerformanceAnalytics();
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  // Load performance data
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [performers] = await Promise.all([
        loadTopPerformers(3),
        loadDepartmentPerformance()
      ]);

      setTopPerformers(performers);

      // Generate performance alerts
      const performanceAlerts = [];
      
      // Check for low performers
      const lowPerformers = staff.filter(s => s.performance_score < 75);
      if (lowPerformers.length > 0) {
        performanceAlerts.push({
          type: 'warning',
          title: 'Rendimiento Bajo',
          description: `${lowPerformers.length} empleado${lowPerformers.length > 1 ? 's' : ''} necesita${lowPerformers.length === 1 ? '' : 'n'} atención`,
          count: lowPerformers.length
        });
      }

      // Check for attendance issues
      const lowAttendance = staff.filter(s => s.attendance_rate < 90);
      if (lowAttendance.length > 0) {
        performanceAlerts.push({
          type: 'info',
          title: 'Asistencia Baja',
          description: `${lowAttendance.length} empleado${lowAttendance.length > 1 ? 's' : ''} con problemas de asistencia`,
          count: lowAttendance.length
        });
      }

      // Check for excellent performers
      const excellentPerformers = staff.filter(s => s.performance_score >= 95);
      if (excellentPerformers.length > 0) {
        performanceAlerts.push({
          type: 'success',
          title: 'Rendimiento Excepcional',
          description: `${excellentPerformers.length} empleado${excellentPerformers.length > 1 ? 's' : ''} con rendimiento excepcional`,
          count: excellentPerformers.length
        });
      }

      setAlerts(performanceAlerts);

    } catch (error) {
      logger.error('StaffStore', 'Error loading performance dashboard:', error);
    }
  };

  // Calculate key metrics
  const metrics = {
    avgPerformance: staff.length > 0 
      ? Math.round(staff.reduce((sum, s) => sum + s.performance_score, 0) / staff.length) 
      : 0,
    avgAttendance: staff.length > 0 
      ? Math.round(staff.reduce((sum, s) => sum + s.attendance_rate, 0) / staff.length) 
      : 0,
    topPerformerCount: staff.filter(s => s.performance_score >= 90).length,
    needsAttentionCount: staff.filter(s => s.performance_score < 75 || s.attendance_rate < 90).length
  };

  if (staffLoading || analyticsLoading) {
    return (
      <CardWrapper variant="elevated" padding="md">
        <CardWrapper.Body>
          <VStack gap="4" align="center" py="4">
            <Spinner size="md" />
            <Text fontSize="sm" color="gray.600">Cargando performance dashboard...</Text>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  return (
    <VStack gap="4" align="stretch">
      {/* Performance Metrics */}
      <SimpleGrid columns={{ base: 2, md: compact ? 2 : 4 }} gap="4">
        <CardWrapper variant="elevated" padding="sm">
          <CardWrapper.Body textAlign="center">
            <Icon icon={TrophyIcon} size="sm" color="yellow.500" />
            <Text fontSize="xl" fontWeight="bold">{metrics.avgPerformance}%</Text>
            <Text fontSize="xs" color="gray.600">Rendimiento</Text>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper variant="elevated" padding="sm">
          <CardWrapper.Body textAlign="center">
            <Icon icon={ClockIcon} size="sm" color="blue.500" />
            <Text fontSize="xl" fontWeight="bold">{metrics.avgAttendance}%</Text>
            <Text fontSize="xs" color="gray.600">Asistencia</Text>
          </CardWrapper.Body>
        </CardWrapper>

        {!compact && (
          <>
            <CardWrapper variant="elevated" padding="sm">
              <CardWrapper.Body textAlign="center">
                <Icon icon={ArrowTrendingUpIcon} size="sm" color="green.500" />
                <Text fontSize="xl" fontWeight="bold">{metrics.topPerformerCount}</Text>
                <Text fontSize="xs" color="gray.600">Top Performers</Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="elevated" padding="sm">
              <CardWrapper.Body textAlign="center">
                <Icon icon={ExclamationTriangleIcon} size="sm" color="orange.500" />
                <Text fontSize="xl" fontWeight="bold">{metrics.needsAttentionCount}</Text>
                <Text fontSize="xs" color="gray.600">Requiere Atención</Text>
              </CardWrapper.Body>
            </CardWrapper>
          </>
        )}
      </SimpleGrid>

      {/* Performance Alerts */}
      {showDetails && alerts.length > 0 && (
        <CardWrapper variant="elevated" padding="md">
          <CardWrapper.Body>
            <Text fontSize="sm" fontWeight="semibold" mb="3">Alertas de Rendimiento</Text>
            <VStack gap="2" align="stretch">
              {alerts.map((alert, index) => (
                <HStack key={index} justify="space-between" align="center" p="2" bg="gray.50" borderRadius="md">
                  <VStack align="start" gap="0">
                    <Text fontSize="sm" fontWeight="medium">{alert.title}</Text>
                    <Text fontSize="xs" color="gray.600">{alert.description}</Text>
                  </VStack>
                  <Badge 
                    colorPalette={alert.type === 'success' ? 'green' : alert.type === 'warning' ? 'orange' : 'blue'}
                    size="sm"
                  >
                    {alert.count}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      )}

      {/* Top Performers (if detailed view) */}
      {showDetails && !compact && topPerformers.length > 0 && (
        <CardWrapper variant="elevated" padding="md">
          <CardWrapper.Body>
            <Text fontSize="sm" fontWeight="semibold" mb="3">Top Performers</Text>
            <VStack gap="3" align="stretch">
              {topPerformers.map((performer, index) => (
                <HStack key={performer.id} justify="space-between" align="center">
                  <HStack gap="3">
                    <Badge colorPalette={index === 0 ? 'yellow' : 'blue'} size="sm">
                      #{index + 1}
                    </Badge>
                    <Avatar name={performer.name} size="xs" />
                    <VStack align="start" gap="0">
                      <Text fontSize="sm" fontWeight="medium">{performer.name}</Text>
                      <Text fontSize="xs" color="gray.600">{performer.position}</Text>
                    </VStack>
                  </HStack>
                  <VStack gap="1" align="end">
                    <Text fontSize="sm" fontWeight="bold" color="green.600">
                      {performer.performance_score}%
                    </Text>
                    <Progress 
                      value={performer.performance_score} 
                      size="xs" 
                      w="60px" 
                      colorPalette="green"
                    />
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      )}
    </VStack>
  );
}