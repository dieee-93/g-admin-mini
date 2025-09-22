/**
 * Real-time Labor Cost Tracker for Scheduling
 * Shows live costs integrated with current schedules and time tracking
 */

import { useState, useEffect } from 'react';
import {
  Stack, Button, Badge, Grid, Typography,
  CardWrapper, MetricCard, CardGrid, Icon, SimpleGrid
} from '@/shared/ui';
import { Tabs, Progress, Table, Alert, Switch } from '@chakra-ui/react';
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
import { QuickCalculations } from '@/business-logic/shared/FinancialCalculations';

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

  // MIGRATED: Use centralized currency formatting
  // const formatCurrency = (amount: number) => QuickCalculations.QuickCalculations.formatCurrency(amount);

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
        <Alert.Indicator />
        <Alert.Title>Error de Monitoreo</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert.Root>
    );
  }

  return (
    <Stack direction="column" gap="lg">
      {/* Header Controls */}
      <CardWrapper variant="elevated" title="Costos Laborales en Tiempo Real">
        <Stack direction="row" justify="space-between">
          <Stack direction="column" gap="xs">
            <Typography variant="heading">
              Costos Laborales en Tiempo Real
            </Typography>
            <Stack direction="row" gap="sm" align="center">
              <Badge
                colorPalette={isMonitoring ? 'green' : 'red'}
                variant="solid"
                size="sm"
              >
                {isMonitoring ? 'Monitoreando' : 'Pausado'}
              </Badge>
                {loading && (
                  <Typography fontSize="sm" color="blue.600">Actualizando...</Typography>
                )}
              </Stack>
            </Stack>

            <Stack gap="2">
              <Stack>
                <Typography fontSize="xs" mb="1">Auto-actualizar</Typography>
                <Switch.Root
                  checked={autoRefresh}
                  onCheckedChange={(details) => setAutoRefresh(details.checked)}
                >
                  <Switch.HiddenInput />
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
              </Stack>

              <Button
                size="sm"
                variant="outline"
                onClick={forceUpdate}
                disabled={loading}
              >
                <Icon icon={ArrowPathIcon} size="sm" style={{marginRight: '8px'}} />
                Actualizar
              </Button>

              <Button
                size="sm"
                colorPalette={isMonitoring ? 'red' : 'green'}
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
              >
                {isMonitoring ? <Icon icon={PauseIcon} size="sm" style={{marginRight: '8px'}} /> : <Icon icon={PlayIcon} size="sm" style={{marginRight: '8px'}} />}
                {isMonitoring ? 'Pausar' : 'Iniciar'}
              </Button>
            </Stack>
          </Stack>
      </CardWrapper>

      {/* Critical Alerts */}
      {showAlerts && (criticalAlerts.length > 0 || budgetAlerts.length > 0) && (
        <Stack gap="2">
          {criticalAlerts.map(alert => (
            <Alert.Root key={alert.id} status="error">
              <Alert.Indicator />
              <Alert.Title>Alerta Crítica</Alert.Title>
              <Alert.Description>{alert.message}</Alert.Description>
            </Alert.Root>
          ))}
          
          {budgetAlerts.map(alert => (
            <Alert.Root key={alert.id} status="warning">
              <Alert.Indicator />
              <Alert.Title>Alerta de Presupuesto</Alert.Title>
              <Alert.Description>{alert.message}</Alert.Description>
            </Alert.Root>
          ))}
        </Stack>
      )}

      {/* Quick Stats */}
      <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap="4">
        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="3">
            <Stack gap="1">
              <Typography fontSize="xl" fontWeight="bold" color="blue.500">
                {QuickCalculations.formatCurrency(totalActiveCost)}
              </Typography>
              <Typography fontSize="xs" color="gray.600">Costo Actual</Typography>
              <Stack gap="1" justify="center">
                <Icon icon={BoltIcon} size="xs" color="var(--chakra-colors-blue-500)" />
                <Typography fontSize="xs" color="blue.500">En vivo</Typography>
              </Stack>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="3">
            <Stack gap="1">
              <Typography fontSize="xl" fontWeight="bold" color="green.500">
                {QuickCalculations.formatCurrency(totalProjectedCost)}
              </Typography>
              <Typography fontSize="xs" color="gray.600">Proyectado</Typography>
              <Typography fontSize="xs" color="green.600">
                +{QuickCalculations.formatCurrency(totalProjectedCost - totalActiveCost)}
              </Typography>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="3">
            <Stack gap="1">
              <Typography fontSize="xl" fontWeight="bold" color="purple.500">
                {activeEmployeeCount}
              </Typography>
              <Typography fontSize="xs" color="gray.600">Activos</Typography>
              <Typography fontSize="xs" color="gray.500">
                {liveData.length} total
              </Typography>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="3">
            <Stack gap="1">
              <Typography 
                fontSize="xl" 
                fontWeight="bold" 
                color={overtimeEmployeeCount > 0 ? 'red.500' : 'green.500'}
              >
                {overtimeEmployeeCount}
              </Typography>
              <Typography fontSize="xs" color="gray.600">En Overtime</Typography>
              {overtimeEmployeeCount > 0 && (
                <Badge size="xs" colorPalette="red" variant="subtle">
                  Alerta
                </Badge>
              )}
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="3">
            <Stack gap="1">
              <Typography 
                fontSize="xl" 
                fontWeight="bold" 
                color={isOverBudget ? 'red.500' : 'green.500'}
              >
                {budgetUtilization.toFixed(1)}%
              </Typography>
              <Typography fontSize="xs" color="gray.600">Presupuesto</Typography>
              <Progress.Root
                value={Math.min(budgetUtilization, 100)}
                colorPalette={isOverBudget ? 'red' : 'green'}
                size="xs"
                w="full"
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="3">
            <Stack gap="1">
              <Typography fontSize="xl" fontWeight="bold" color="teal.500">
                {dailySummary ? formatHours(dailySummary.total_hours_worked) : '0h'}
              </Typography>
              <Typography fontSize="xs" color="gray.600">Horas Trabajadas</Typography>
              <Typography fontSize="xs" color="gray.500">
                {dailySummary ? formatHours(dailySummary.total_projected_hours) : '0h'} proyectadas
              </Typography>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      </SimpleGrid>

      {/* Main Content Tabs */}
      <CardWrapper>
        <CardWrapper p="0">
          <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
            <Tabs.List bg="bg.canvas" p="1" borderRadius="lg">
              <Tabs.Trigger value="overview" gap="2" flex="1">
                <Icon icon={ChartBarIcon} size="sm" />
                <Typography display={{ base: "none", sm: "block" }}>Resumen</Typography>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="employees" gap="2" flex="1">
                <Icon icon={ClockIcon} size="sm" />
                <Typography display={{ base: "none", sm: "block" }}>Empleados</Typography>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="departments" gap="2" flex="1">
                <Icon icon={CurrencyDollarIcon} size="sm" />
                <Typography display={{ base: "none", sm: "block" }}>Departamentos</Typography>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="alerts" gap="2" flex="1">
                <Icon icon={BellIcon} size="sm" />
                <Typography display={{ base: "none", sm: "block" }}>
                  Alertas
                  {(criticalAlerts.length + overtimeAlerts.length) > 0 && (
                    <Badge ml="1" size="xs" colorPalette="red" variant="solid">
                      {criticalAlerts.length + overtimeAlerts.length}
                    </Badge>
                  )}
                </Typography>
              </Tabs.Trigger>
            </Tabs.List>

            <Stack p="6">
              {/* Overview Tab */}
              <Tabs.Content value="overview">
                <Stack gap="4" align="stretch">
                  <Typography fontSize="lg" fontWeight="semibold">Resumen del Día</Typography>
                  
                  {dailySummary && (
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                      <CardWrapper size="sm">
                        <CardWrapper>
                          <Stack align="stretch" gap="3">
                            <Typography fontSize="md" fontWeight="semibold">Costos</Typography>
                            <Stack align="stretch" gap="2">
                              <Stack justify="space-between">
                                <Typography fontSize="sm">Actual</Typography>
                                <Typography fontSize="sm" fontWeight="bold">
                                  {QuickCalculations.formatCurrency(dailySummary.total_current_cost)}
                                </Typography>
                              </Stack>
                              <Stack justify="space-between">
                                <Typography fontSize="sm">Proyectado</Typography>
                                <Typography fontSize="sm">
                                  {QuickCalculations.formatCurrency(dailySummary.total_projected_cost)}
                                </Typography>
                              </Stack>
                              <Stack justify="space-between">
                                <Typography fontSize="sm">Variación</Typography>
                                <Typography 
                                  fontSize="sm" 
                                  color={dailySummary.cost_variance > 0 ? 'red.500' : 'green.500'}
                                  fontWeight="semibold"
                                >
                                  {dailySummary.cost_variance > 0 ? '+' : ''}
                                  {QuickCalculations.formatCurrency(dailySummary.cost_variance)}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                        </CardWrapper>
                      </CardWrapper>

                      <CardWrapper size="sm">
                        <CardWrapper>
                          <Stack align="stretch" gap="3">
                            <Typography fontSize="md" fontWeight="semibold">Horas</Typography>
                            <Stack align="stretch" gap="2">
                              <Stack justify="space-between">
                                <Typography fontSize="sm">Trabajadas</Typography>
                                <Typography fontSize="sm" fontWeight="bold">
                                  {formatHours(dailySummary.total_hours_worked)}
                                </Typography>
                              </Stack>
                              <Stack justify="space-between">
                                <Typography fontSize="sm">Proyectadas</Typography>
                                <Typography fontSize="sm">
                                  {formatHours(dailySummary.total_projected_hours)}
                                </Typography>
                              </Stack>
                              <Stack justify="space-between">
                                <Typography fontSize="sm">Overtime</Typography>
                                <Typography 
                                  fontSize="sm" 
                                  color={dailySummary.overtime_hours > 0 ? 'red.500' : 'gray.500'}
                                  fontWeight="semibold"
                                >
                                  {formatHours(dailySummary.overtime_hours)}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                        </CardWrapper>
                      </CardWrapper>
                    </SimpleGrid>
                  )}
                </Stack>
              </Tabs.Content>

              {/* Employees Tab */}
              <Tabs.Content value="employees">
                <Stack gap="4" align="stretch">
                  <Stack justify="space-between">
                    <Typography fontSize="lg" fontWeight="semibold">Estado de Empleados</Typography>
                    <Badge colorPalette="green" variant="subtle">
                      {activeEmployeeCount} activos
                    </Badge>
                  </Stack>
                  
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
                            <Stack align="start" gap="0">
                              <Typography fontSize="sm" fontWeight="medium">
                                {employee.employee_name}
                              </Typography>
                              <Typography fontSize="xs" color="gray.500">
                                {employee.department}
                              </Typography>
                            </Stack>
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
                            <Stack align="start" gap="0">
                              <Typography fontSize="sm" fontWeight="medium">
                                {formatHours(employee.current_hours)}
                              </Typography>
                              <Typography fontSize="xs" color="gray.500">
                                {formatHours(employee.projected_hours)} proyectadas
                              </Typography>
                            </Stack>
                          </Table.Cell>
                          
                          <Table.Cell>
                            <Typography fontSize="sm" fontWeight="bold">
                              {QuickCalculations.formatCurrency(employee.current_cost)}
                            </Typography>
                          </Table.Cell>
                          
                          <Table.Cell>
                            <Typography fontSize="sm">
                              {QuickCalculations.formatCurrency(employee.projected_cost)}
                            </Typography>
                          </Table.Cell>
                          
                          <Table.Cell>
                            <Stack align="start" gap="0">
                              {employee.current_shift ? (
                                <>
                                  <Typography fontSize="xs">
                                    {employee.current_shift.start_time} - {employee.current_shift.end_time}
                                  </Typography>
                                  <Typography fontSize="xs" color="gray.500">
                                    {employee.current_shift.position}
                                  </Typography>
                                </>
                              ) : (
                                <Typography fontSize="xs" color="gray.500">Sin turno</Typography>
                              )}
                            </Stack>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Stack>
              </Tabs.Content>

              {/* Departments Tab */}
              <Tabs.Content value="departments">
                <Stack gap="4" align="stretch">
                  <Typography fontSize="lg" fontWeight="semibold">Costos por Departamento</Typography>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                    {Object.entries(departmentBreakdown).map(([department, data]) => (
                      <CardWrapper key={department} size="sm">
                        <CardWrapper>
                          <Stack align="stretch" gap="3">
                            <Stack justify="space-between">
                              <Typography fontSize="md" fontWeight="semibold">{department}</Typography>
                              <Badge colorPalette="blue" variant="subtle">
                                {data.employee_count} empleados
                              </Badge>
                            </Stack>
                            
                            <Stack align="stretch" gap="2">
                              <Stack justify="space-between">
                                <Typography fontSize="sm">Costo Actual</Typography>
                                <Typography fontSize="sm" fontWeight="bold">
                                  {QuickCalculations.formatCurrency(data.current_cost)}
                                </Typography>
                              </Stack>
                              <Stack justify="space-between">
                                <Typography fontSize="sm">Proyectado</Typography>
                                <Typography fontSize="sm">
                                  {QuickCalculations.formatCurrency(data.projected_cost)}
                                </Typography>
                              </Stack>
                              {data.overtime_count > 0 && (
                                <Stack justify="space-between">
                                  <Typography fontSize="sm">En Overtime</Typography>
                                  <Badge size="xs" colorPalette="red" variant="subtle">
                                    {data.overtime_count}
                                  </Badge>
                                </Stack>
                              )}
                            </Stack>
                          </Stack>
                        </CardWrapper>
                      </CardWrapper>
                    ))}
                  </SimpleGrid>
                </Stack>
              </Tabs.Content>

              {/* Alerts Tab */}
              <Tabs.Content value="alerts">
                <Stack gap="4" align="stretch">
                  <Typography fontSize="lg" fontWeight="semibold">Alertas Activas</Typography>
                  
                  {criticalAlerts.length === 0 && overtimeAlerts.length === 0 && budgetAlerts.length === 0 ? (
                    <CardWrapper>
                      <CardWrapper py="8" textAlign="center">
                        <Stack gap="3">
                          <Icon icon={EyeIcon} size="lg" color="green.500" />
                          <Typography color="gray.600">No hay alertas activas</Typography>
                          <Typography fontSize="sm" color="gray.500">
                            Todos los sistemas funcionan normalmente
                          </Typography>
                        </Stack>
                      </CardWrapper>
                    </CardWrapper>
                  ) : (
                    <Stack gap="2" align="stretch">
                      {[...criticalAlerts, ...overtimeAlerts, ...budgetAlerts].map(alert => (
                        <Alert.Root key={alert.id} status={alert.severity === 'critical' ? 'error' : 'warning'}>
                          <Alert.Indicator />
                          <Alert.Title>
                            {alert.employee_name || 'Sistema'}
                            {alert.department && ` - ${alert.department}`}
                          </Alert.Title>
                          <Alert.Description>
                            {alert.message}
                          </Alert.Description>
                        </Alert.Root>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Tabs.Content>
            </Stack>
          </Tabs.Root>
        </CardWrapper>
      </CardWrapper>
    </Stack>
  );
}

export default RealTimeLaborTracker;