/**
 * Real-time Labor Cost Tracker for Scheduling
 * Shows live costs integrated with current schedules and time tracking
 */

import { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  CardWrapper,
  Button,
  Badge,
  SimpleGrid,
  Progress,
  Table,
  Alert,
  Tabs,
  Switch,
  Flex,
  Stack
} from '@chakra-ui/react';
import { 
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  ChartBarIcon,
  ArrowPathIcon,
  PauseIcon,
  PlayIcon,
  EyeIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useLiveCostDashboard, useOvertimeMonitoring, useBudgetMonitoring } from '@/hooks/useRealTimeLaborCosts';

interface RealTimeLaborTrackerProps {
  selectedDate?: string;
  showAlerts?: boolean;
  compactMode?: boolean;
}

export function RealTimeLaborTracker({ 
  selectedDate, 
  showAlerts = true, 
  compactMode = false 
}: RealTimeLaborTrackerProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'departments' | 'alerts'>('overview');

  // Real-time hooks
  const {
    liveData,
    dailySummary,
    isMonitoring,
    loading,
    error,
    startMonitoring,
    stopMonitoring,
    forceUpdate,
    totalActiveCost,
    totalProjectedCost,
    activeEmployeeCount,
    departmentBreakdown,
    criticalAlerts
  } = useLiveCostDashboard(selectedDate);

  const { 
    overtimeEmployees, 
    overtimeAlerts,
    overtimeEmployeeCount 
  } = useOvertimeMonitoring();

  const {
    budgetUtilization,
    isOverBudget,
    budgetAlerts
  } = useBudgetMonitoring();

  // Auto-refresh control
  useEffect(() => {
    if (autoRefresh && !isMonitoring) {
      startMonitoring();
    } else if (!autoRefresh && isMonitoring) {
      stopMonitoring();
    }
  }, [autoRefresh, isMonitoring, startMonitoring, stopMonitoring]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  // Format time
  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_overtime': return 'red';
      case 'approaching': return 'orange';
      case 'normal': return 'green';
      default: return 'gray';
    }
  };

  if (error) {
    return (
      <Alert.Root status="error">
        <ExclamationTriangleIcon className="w-5 h-5" />
        <Alert.Title>Error de Monitoreo</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert.Root>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Header Controls */}
      <CardWrapper.Root>
        <CardWrapper.Body>
          <HStack justify="space-between">
            <VStack align="start" gap="1">
              <Text fontSize="lg" fontWeight="bold">
                Costos Laborales en Tiempo Real
              </Text>
              <HStack gap="2" align="center">
                <Box 
                  w="2" 
                  h="2" 
                  bg={isMonitoring ? 'green.500' : 'red.500'} 
                  borderRadius="full"
                />
                <Text fontSize="sm" color="gray.600">
                  {isMonitoring ? 'Monitoreando' : 'Pausado'}
                </Text>
                {loading && (
                  <Text fontSize="sm" color="blue.600">Actualizando...</Text>
                )}
              </HStack>
            </VStack>

            <HStack gap="2">
              <Box>
                <Text fontSize="xs" mb="1">Auto-actualizar</Text>
                <Switch.Root
                  checked={autoRefresh}
                  onCheckedChange={(details) => setAutoRefresh(details.checked)}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
              </Box>

              <Button
                size="sm"
                variant="outline"
                onClick={forceUpdate}
                disabled={loading}
                leftIcon={<ArrowPathIcon className="w-4 h-4" />}
              >
                Actualizar
              </Button>

              <Button
                size="sm"
                colorPalette={isMonitoring ? 'red' : 'green'}
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                leftIcon={isMonitoring ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              >
                {isMonitoring ? 'Pausar' : 'Iniciar'}
              </Button>
            </HStack>
          </HStack>
        </CardWrapper.Body>
      </CardWrapper.Root>

      {/* Critical Alerts */}
      {showAlerts && (criticalAlerts.length > 0 || budgetAlerts.length > 0) && (
        <Stack gap="2">
          {criticalAlerts.map(alert => (
            <Alert.Root key={alert.id} status="error">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <Alert.Title>Alerta Crítica</Alert.Title>
              <Alert.Description>{alert.message}</Alert.Description>
            </Alert.Root>
          ))}
          
          {budgetAlerts.map(alert => (
            <Alert.Root key={alert.id} status="warning">
              <BellIcon className="w-5 h-5" />
              <Alert.Title>Alerta de Presupuesto</Alert.Title>
              <Alert.Description>{alert.message}</Alert.Description>
            </Alert.Root>
          ))}
        </Stack>
      )}

      {/* Quick Stats */}
      <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap="4">
        <CardWrapper.Root>
          <CardWrapper.Body textAlign="center" py="3">
            <VStack gap="1">
              <Text fontSize="xl" fontWeight="bold" color="blue.500">
                {formatCurrency(totalActiveCost)}
              </Text>
              <Text fontSize="xs" color="gray.600">Costo Actual</Text>
              <HStack gap="1" justify="center">
                <BoltIcon className="w-3 h-3 text-blue-500" />
                <Text fontSize="xs" color="blue.500">En vivo</Text>
              </HStack>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper.Root>

        <CardWrapper.Root>
          <CardWrapper.Body textAlign="center" py="3">
            <VStack gap="1">
              <Text fontSize="xl" fontWeight="bold" color="green.500">
                {formatCurrency(totalProjectedCost)}
              </Text>
              <Text fontSize="xs" color="gray.600">Proyectado</Text>
              <Text fontSize="xs" color="green.600">
                +{formatCurrency(totalProjectedCost - totalActiveCost)}
              </Text>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper.Root>

        <CardWrapper.Root>
          <CardWrapper.Body textAlign="center" py="3">
            <VStack gap="1">
              <Text fontSize="xl" fontWeight="bold" color="purple.500">
                {activeEmployeeCount}
              </Text>
              <Text fontSize="xs" color="gray.600">Activos</Text>
              <Text fontSize="xs" color="gray.500">
                {liveData.length} total
              </Text>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper.Root>

        <CardWrapper.Root>
          <CardWrapper.Body textAlign="center" py="3">
            <VStack gap="1">
              <Text 
                fontSize="xl" 
                fontWeight="bold" 
                color={overtimeEmployeeCount > 0 ? 'red.500' : 'green.500'}
              >
                {overtimeEmployeeCount}
              </Text>
              <Text fontSize="xs" color="gray.600">En Overtime</Text>
              {overtimeEmployeeCount > 0 && (
                <Badge size="xs" colorPalette="red" variant="subtle">
                  Alerta
                </Badge>
              )}
            </VStack>
          </CardWrapper.Body>
        </CardWrapper.Root>

        <CardWrapper.Root>
          <CardWrapper.Body textAlign="center" py="3">
            <VStack gap="1">
              <Text 
                fontSize="xl" 
                fontWeight="bold" 
                color={isOverBudget ? 'red.500' : 'green.500'}
              >
                {budgetUtilization.toFixed(1)}%
              </Text>
              <Text fontSize="xs" color="gray.600">Presupuesto</Text>
              <Progress 
                value={Math.min(budgetUtilization, 100)} 
                colorPalette={isOverBudget ? 'red' : 'green'} 
                size="xs"
                w="full"
              />
            </VStack>
          </CardWrapper.Body>
        </CardWrapper.Root>

        <CardWrapper.Root>
          <CardWrapper.Body textAlign="center" py="3">
            <VStack gap="1">
              <Text fontSize="xl" fontWeight="bold" color="teal.500">
                {dailySummary ? formatHours(dailySummary.total_hours_worked) : '0h'}
              </Text>
              <Text fontSize="xs" color="gray.600">Horas Trabajadas</Text>
              <Text fontSize="xs" color="gray.500">
                {dailySummary ? formatHours(dailySummary.total_projected_hours) : '0h'} proyectadas
              </Text>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper.Root>
      </SimpleGrid>

      {/* Main Content Tabs */}
      <CardWrapper.Root>
        <CardWrapper.Body p="0">
          <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
            <Tabs.List bg="bg.canvas" p="1" borderRadius="lg">
              <Tabs.Trigger value="overview" gap="2" flex="1">
                <ChartBarIcon className="w-4 h-4" />
                <Text display={{ base: "none", sm: "block" }}>Resumen</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="employees" gap="2" flex="1">
                <ClockIcon className="w-4 h-4" />
                <Text display={{ base: "none", sm: "block" }}>Empleados</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="departments" gap="2" flex="1">
                <CurrencyDollarIcon className="w-4 h-4" />
                <Text display={{ base: "none", sm: "block" }}>Departamentos</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="alerts" gap="2" flex="1">
                <BellIcon className="w-4 h-4" />
                <Text display={{ base: "none", sm: "block" }}>
                  Alertas
                  {(criticalAlerts.length + overtimeAlerts.length) > 0 && (
                    <Badge ml="1" size="xs" colorPalette="red" variant="solid">
                      {criticalAlerts.length + overtimeAlerts.length}
                    </Badge>
                  )}
                </Text>
              </Tabs.Trigger>
            </Tabs.List>

            <Box p="6">
              {/* Overview Tab */}
              <Tabs.Content value="overview">
                <VStack gap="4" align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">Resumen del Día</Text>
                  
                  {dailySummary && (
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                      <CardWrapper.Root size="sm">
                        <CardWrapper.Body>
                          <VStack align="stretch" gap="3">
                            <Text fontSize="md" fontWeight="semibold">Costos</Text>
                            <VStack align="stretch" gap="2">
                              <HStack justify="space-between">
                                <Text fontSize="sm">Actual</Text>
                                <Text fontSize="sm" fontWeight="bold">
                                  {formatCurrency(dailySummary.total_current_cost)}
                                </Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Proyectado</Text>
                                <Text fontSize="sm">
                                  {formatCurrency(dailySummary.total_projected_cost)}
                                </Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Variación</Text>
                                <Text 
                                  fontSize="sm" 
                                  color={dailySummary.cost_variance > 0 ? 'red.500' : 'green.500'}
                                  fontWeight="semibold"
                                >
                                  {dailySummary.cost_variance > 0 ? '+' : ''}
                                  {formatCurrency(dailySummary.cost_variance)}
                                </Text>
                              </HStack>
                            </VStack>
                          </VStack>
                        </CardWrapper.Body>
                      </CardWrapper.Root>

                      <CardWrapper.Root size="sm">
                        <CardWrapper.Body>
                          <VStack align="stretch" gap="3">
                            <Text fontSize="md" fontWeight="semibold">Horas</Text>
                            <VStack align="stretch" gap="2">
                              <HStack justify="space-between">
                                <Text fontSize="sm">Trabajadas</Text>
                                <Text fontSize="sm" fontWeight="bold">
                                  {formatHours(dailySummary.total_hours_worked)}
                                </Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Proyectadas</Text>
                                <Text fontSize="sm">
                                  {formatHours(dailySummary.total_projected_hours)}
                                </Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Overtime</Text>
                                <Text 
                                  fontSize="sm" 
                                  color={dailySummary.overtime_hours > 0 ? 'red.500' : 'gray.500'}
                                  fontWeight="semibold"
                                >
                                  {formatHours(dailySummary.overtime_hours)}
                                </Text>
                              </HStack>
                            </VStack>
                          </VStack>
                        </CardWrapper.Body>
                      </CardWrapper.Root>
                    </SimpleGrid>
                  )}
                </VStack>
              </Tabs.Content>

              {/* Employees Tab */}
              <Tabs.Content value="employees">
                <VStack gap="4" align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="semibold">Estado de Empleados</Text>
                    <Badge colorPalette="green" variant="subtle">
                      {activeEmployeeCount} activos
                    </Badge>
                  </HStack>
                  
                  <Table.Root size="sm">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                        <Table.ColumnHeader>Estado</Table.ColumnHeader>
                        <Table.ColumnHeader>Horas</Table.ColumnHeader>
                        <Table.ColumnHeader>Costo Actual</Table.ColumnHeader>
                        <Table.ColumnHeader>Proyectado</Table.ColumnHeader>
                        <Table.ColumnHeader>Turno</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {liveData
                        .filter(employee => employee.clock_in_time) // Only show active employees
                        .map(employee => (
                        <Table.Row key={employee.employee_id}>
                          <Table.Cell>
                            <VStack align="start" gap="0">
                              <Text fontSize="sm" fontWeight="medium">
                                {employee.employee_name}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {employee.department}
                              </Text>
                            </VStack>
                          </Table.Cell>
                          
                          <Table.Cell>
                            <Badge 
                              size="sm" 
                              colorPalette={getStatusColor(employee.overtime_status)}
                              variant="subtle"
                            >
                              {employee.overtime_status === 'none' ? 'Normal' :
                               employee.overtime_status === 'approaching' ? 'Pre-OT' : 'Overtime'}
                            </Badge>
                          </Table.Cell>
                          
                          <Table.Cell>
                            <VStack align="start" gap="0">
                              <Text fontSize="sm" fontWeight="medium">
                                {formatHours(employee.current_hours)}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {formatHours(employee.projected_hours)} proyectadas
                              </Text>
                            </VStack>
                          </Table.Cell>
                          
                          <Table.Cell>
                            <Text fontSize="sm" fontWeight="bold">
                              {formatCurrency(employee.current_cost)}
                            </Text>
                          </Table.Cell>
                          
                          <Table.Cell>
                            <Text fontSize="sm">
                              {formatCurrency(employee.projected_cost)}
                            </Text>
                          </Table.Cell>
                          
                          <Table.Cell>
                            <VStack align="start" gap="0">
                              {employee.current_shift ? (
                                <>
                                  <Text fontSize="xs">
                                    {employee.current_shift.start_time} - {employee.current_shift.end_time}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {employee.current_shift.position}
                                  </Text>
                                </>
                              ) : (
                                <Text fontSize="xs" color="gray.500">Sin turno</Text>
                              )}
                            </VStack>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </VStack>
              </Tabs.Content>

              {/* Departments Tab */}
              <Tabs.Content value="departments">
                <VStack gap="4" align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">Costos por Departamento</Text>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                    {Object.entries(departmentBreakdown).map(([department, data]) => (
                      <CardWrapper.Root key={department} size="sm">
                        <CardWrapper.Body>
                          <VStack align="stretch" gap="3">
                            <HStack justify="space-between">
                              <Text fontSize="md" fontWeight="semibold">{department}</Text>
                              <Badge colorPalette="blue" variant="subtle">
                                {data.employee_count} empleados
                              </Badge>
                            </HStack>
                            
                            <VStack align="stretch" gap="2">
                              <HStack justify="space-between">
                                <Text fontSize="sm">Costo Actual</Text>
                                <Text fontSize="sm" fontWeight="bold">
                                  {formatCurrency(data.current_cost)}
                                </Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Proyectado</Text>
                                <Text fontSize="sm">
                                  {formatCurrency(data.projected_cost)}
                                </Text>
                              </HStack>
                              {data.overtime_count > 0 && (
                                <HStack justify="space-between">
                                  <Text fontSize="sm">En Overtime</Text>
                                  <Badge size="xs" colorPalette="red" variant="subtle">
                                    {data.overtime_count}
                                  </Badge>
                                </HStack>
                              )}
                            </VStack>
                          </VStack>
                        </CardWrapper.Body>
                      </CardWrapper.Root>
                    ))}
                  </SimpleGrid>
                </VStack>
              </Tabs.Content>

              {/* Alerts Tab */}
              <Tabs.Content value="alerts">
                <VStack gap="4" align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">Alertas Activas</Text>
                  
                  {criticalAlerts.length === 0 && overtimeAlerts.length === 0 && budgetAlerts.length === 0 ? (
                    <CardWrapper.Root>
                      <CardWrapper.Body py="8" textAlign="center">
                        <VStack gap="3">
                          <EyeIcon className="w-8 h-8 text-green-500 mx-auto" />
                          <Text color="gray.600">No hay alertas activas</Text>
                          <Text fontSize="sm" color="gray.500">
                            Todos los sistemas funcionan normalmente
                          </Text>
                        </VStack>
                      </CardWrapper.Body>
                    </CardWrapper.Root>
                  ) : (
                    <VStack gap="2" align="stretch">
                      {[...criticalAlerts, ...overtimeAlerts, ...budgetAlerts].map(alert => (
                        <Alert.Root key={alert.id} status={alert.severity === 'critical' ? 'error' : 'warning'}>
                          <ExclamationTriangleIcon className="w-5 h-5" />
                          <Alert.Title>
                            {alert.employee_name || 'Sistema'}
                            {alert.department && ` - ${alert.department}`}
                          </Alert.Title>
                          <Alert.Description>
                            {alert.message}
                          </Alert.Description>
                        </Alert.Root>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </CardWrapper.Body>
      </CardWrapper.Root>
    </VStack>
  );
}

export default RealTimeLaborTracker;