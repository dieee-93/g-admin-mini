// Staff Management Section - HR functions and permissions with security compliance
import { useState } from 'react';
import {
  Box,
  Stack,
  Text,
  Select,
  Badge,
  SimpleGrid,
  Button,
  Avatar,
  Tabs,
  Switch,
  Table,
  Alert,
  createListCollection,
  Icon,
  IconButton,
  CardWrapper
} from '@/shared/ui';
import {
  ShieldCheckIcon,
  CogIcon,
  BanknotesIcon,
  KeyIcon,
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  LockClosedIcon,
  PlusIcon,
  PencilIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

import type { StaffViewState, Permission } from '../../types';

// TODO: Implement permission management CRUD operations
// TODO: Implement payroll generation functionality
// TODO: Implement compliance reporting
import { LaborCostDashboard } from '../LaborCostDashboard';

interface ManagementSectionProps {
  viewState: StaffViewState;
  onViewStateChange: (state: StaffViewState) => void;
}

// Mock HR data with security compliance
const mockPayrollData = [
  {
    employee_id: 'EMP001',
    salary: 75000,
    hourly_rate: null,
    bonus_ytd: 8500,
    last_raise: '2023-07-01',
    next_review: '2024-07-01'
  },
  {
    employee_id: 'EMP002',
    salary: null,
    hourly_rate: 28.50,
    bonus_ytd: 2200,
    last_raise: '2023-09-15',
    next_review: '2024-09-15'
  },
  {
    employee_id: 'EMP003',
    salary: null,
    hourly_rate: 18.75,
    bonus_ytd: 1500,
    last_raise: '2023-11-01',
    next_review: '2024-11-01'
  },
  {
    employee_id: 'EMP004',
    salary: null,
    hourly_rate: 16.00,
    bonus_ytd: 800,
    last_raise: null,
    next_review: '2024-08-01'
  }
];

// TODO: Use mockPermissions for permission management UI
// const mockPermissions: Permission[] = [
//   { resource: 'staff', actions: ['read', 'write', 'manage'] },
//   { resource: 'performance', actions: ['read', 'write'] },
//   { resource: 'training', actions: ['read', 'write'] },
//   { resource: 'payroll', actions: ['read'] },
//   { resource: 'scheduling', actions: ['read', 'write', 'manage'] }
// ];

const mockAuditLog = [
  {
    id: '1',
    action: 'Salary Updated',
    employee_id: 'EMP003',
    performed_by: 'HR001',
    timestamp: '2024-01-08T14:30:00Z',
    details: 'Hourly rate changed from $17.50 to $18.75',
    ip_address: '192.168.1.100'
  },
  {
    id: '2',
    action: 'Role Changed',
    employee_id: 'EMP002',
    performed_by: 'ADMIN001',
    timestamp: '2024-01-07T09:15:00Z',
    details: 'Role changed from teamMember to supervisor',
    ip_address: '192.168.1.101'
  },
  {
    id: '3',
    action: 'TeamMember Created',
    employee_id: 'EMP004',
    performed_by: 'HR001',
    timestamp: '2024-01-01T08:00:00Z',
    details: 'New teamMember record created',
    ip_address: '192.168.1.100'
  }
];

export function ManagementSection({ viewState: _viewState, onViewStateChange: _onViewStateChange }: ManagementSectionProps) {
  const [activeTab, setActiveTab] = useState<'payroll' | 'labor-costs' | 'permissions' | 'audit' | 'settings'>('payroll');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Mock current user permissions (in real app, this would come from auth context)
  const currentUserRole = 'admin'; // admin, hr, manager, supervisor, teamMember

  const hasPermission = (resource: string, _action: string) => {
    // Security check - only admin and HR can see payroll
    if (resource === 'payroll' && !['admin', 'hr'].includes(currentUserRole)) {
      return false;
    }
    return true; // Simplified for demo
  };

  const maskSensitiveData = (value: number | null, type: 'salary' | 'hourly') => {
    if (!value || !showSensitiveData) {
      return type === 'salary' ? '$***,***' : '$**.***';
    }
    return type === 'salary' ? 
      `$${value.toLocaleString()}` : 
      `$${value.toFixed(2)}/hr`;
  };

  const formatCurrency = (value: number) => {
    return showSensitiveData ? `$${value.toLocaleString()}` : '$***';
  };

  // TODO: Use getRoleBadgeColor when implementing role management UI
  // const getRoleBadgeColor = (role: string) => {
  //   switch (role) {
  //     case 'admin': return 'purple';
  //     case 'manager': return 'blue';
  //     case 'supervisor': return 'teal';
  //     case 'teamMember': return 'gray';
  //     default: return 'gray';
  //   }
  // };

  return (
    <Stack direction="column" gap="6" align="stretch">
      {/* Security Alert */}
      <Alert.Root status="warning" variant="subtle">
        <Icon icon={ExclamationTriangleIcon} size="md" />
        <Alert.Title>Área de Administración Segura</Alert.Title>
        <Alert.Description>
          Esta sección contiene datos sensibles. Todos los accesos son registrados y monitoreados.
        </Alert.Description>
      </Alert.Root>

      {/* Quick Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
        <CardWrapper>
          <CardWrapper.Body textAlign="center">
            <Stack direction="column" gap="2">
              <Icon icon={BanknotesIcon} size="lg" color="var(--chakra-colors-green-500)" style={{marginLeft: 'auto', marginRight: 'auto'}} />
              <Text fontSize="lg" fontWeight="bold">
                {showSensitiveData ? '$127,350' : '$***,***'}
              </Text>
              <Text fontSize="sm" color="gray.600">Nómina Total/Mes</Text>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Body textAlign="center">
            <Stack direction="column" gap="2">
              <Icon icon={ShieldCheckIcon} size="lg" color="var(--chakra-colors-blue-500)" style={{marginLeft: 'auto', marginRight: 'auto'}} />
              <Text fontSize="lg" fontWeight="bold">24</Text>
              <Text fontSize="sm" color="gray.600">Usuarios Activos</Text>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Body textAlign="center">
            <Stack direction="column" gap="2">
              <Icon icon={ClockIcon} size="lg" color="var(--chakra-colors-orange-500)" style={{marginLeft: 'auto', marginRight: 'auto'}} />
              <Text fontSize="lg" fontWeight="bold">3</Text>
              <Text fontSize="sm" color="gray.600">Revisiones Pendientes</Text>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Body textAlign="center">
            <Stack direction="column" gap="2">
              <Icon icon={DocumentTextIcon} size="lg" color="var(--chakra-colors-purple-500)" style={{marginLeft: 'auto', marginRight: 'auto'}} />
              <Text fontSize="lg" fontWeight="bold">156</Text>
              <Text fontSize="sm" color="gray.600">Acciones Auditadas</Text>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      </SimpleGrid>

      {/* Data Visibility Control */}
      <CardWrapper>
        <CardWrapper.Body>
          <Stack direction="row" justify="space-between" align="center">
            <Stack direction="column" align="start" gap="1">
              <Text fontWeight="semibold">Mostrar Datos Sensibles</Text>
              <Text fontSize="sm" color="gray.600">
                Habilita la visualización de salarios y datos personales
              </Text>
            </Stack>
            <Stack direction="row" gap="2">
              {showSensitiveData ? (
                <Icon icon={EyeSlashIcon} size="md" color="var(--chakra-colors-gray-500)" />
              ) : (
                <Icon icon={EyeIcon} size="md" color="var(--chakra-colors-gray-500)" />
              )}
              <Switch
                checked={showSensitiveData}
                onChange={(checked) => setShowSensitiveData(checked)}
                size="lg"
              />
            </Stack>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Management Tabs */}
      <CardWrapper>
        <CardWrapper.Body p="0">
          <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as 'payroll' | 'labor-costs' | 'permissions' | 'audit' | 'settings')}>
            <Tabs.List bg="bg.canvas" p="1" borderRadius="lg">
              <Tabs.Trigger value="payroll" gap="2" flex="1" minH="44px">
                <Icon icon={BanknotesIcon} size="md" />
                <Text display={{ base: "none", sm: "block" }}>Nómina</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="labor-costs" gap="2" flex="1" minH="44px">
                <Icon icon={ChartBarIcon} size="md" />
                <Text display={{ base: "none", sm: "block" }}>Costos</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="permissions" gap="2" flex="1" minH="44px">
                <Icon icon={KeyIcon} size="md" />
                <Text display={{ base: "none", sm: "block" }}>Permisos</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="audit" gap="2" flex="1" minH="44px">
                <Icon icon={DocumentTextIcon} size="md" />
                <Text display={{ base: "none", sm: "block" }}>Auditoría</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="settings" gap="2" flex="1" minH="44px">
                <Icon icon={CogIcon} size="md" />
                <Text display={{ base: "none", sm: "block" }}>Configuración</Text>
              </Tabs.Trigger>
            </Tabs.List>

            <Box p="6">
              {/* Payroll Tab */}
              <Tabs.Content value="payroll">
                {hasPermission('payroll', 'read') ? (
                  <Stack direction="column" gap="4" align="stretch">
                    <Stack direction="row" justify="space-between">
                      <Text fontSize="lg" fontWeight="semibold">Gestión de Nómina</Text>
                      <Button 
                        colorPalette="green"
                        size="sm"
                      >
                        <Icon icon={PlusIcon} size="sm" style={{marginRight: '8px'}} />
                        Procesar Nómina
                      </Button>
                    </Stack>

                    <Table.Root size="sm" variant="outline">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                          <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                          <Table.ColumnHeader>Salario Base</Table.ColumnHeader>
                          <Table.ColumnHeader>Bonos YTD</Table.ColumnHeader>
                          <Table.ColumnHeader>Último Aumento</Table.ColumnHeader>
                          <Table.ColumnHeader>Próxima Revisión</Table.ColumnHeader>
                          <Table.ColumnHeader>Acciones</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {mockPayrollData.map((payroll) => (
                          <Table.Row key={payroll.employee_id}>
                            <Table.Cell>
                              <Stack direction="row" gap="2">
                                <Avatar name={payroll.employee_id} size="xs" />
                                <Text fontSize="sm">{payroll.employee_id}</Text>
                              </Stack>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge size="xs" colorPalette={payroll.salary ? 'blue' : 'green'}>
                                {payroll.salary ? 'Salario' : 'Por Hora'}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm" fontWeight="medium">
                                {payroll.salary 
                                  ? maskSensitiveData(payroll.salary, 'salary')
                                  : maskSensitiveData(payroll.hourly_rate, 'hourly')
                                }
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm">{formatCurrency(payroll.bonus_ytd)}</Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm" color="gray.600">
                                {payroll.last_raise 
                                  ? new Date(payroll.last_raise).toLocaleDateString()
                                  : 'N/A'
                                }
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm" color="gray.600">
                                {new Date(payroll.next_review).toLocaleDateString()}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Stack direction="row" gap="1">
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  aria-label="Edit payroll"
                                  onClick={() => setSelectedEmployee(payroll.employee_id)}
                                >
                                  <Icon icon={PencilIcon} size="xs" />
                                </IconButton>
                              </Stack>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Stack>
                ) : (
                  <CardWrapper>
                    <CardWrapper.Body py="12" textAlign="center">
                      <Stack direction="column" gap="4">
                        <LockClosedIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <Stack direction="column" gap="2">
                          <Text fontSize="lg" fontWeight="semibold">Acceso Restringido</Text>
                          <Text color="gray.600">
                            No tienes permisos para ver información de nómina
                          </Text>
                        </Stack>
                      </Stack>
                    </CardWrapper.Body>
                  </CardWrapper>
                )}
              </Tabs.Content>

              {/* Labor Costs Tab */}
              <Tabs.Content value="labor-costs">
                {hasPermission('payroll', 'read') ? (
                  <LaborCostDashboard />
                ) : (
                  <CardWrapper>
                    <CardWrapper.Body py="12" textAlign="center">
                      <Stack direction="column" gap="4">
                        <LockClosedIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <Stack direction="column" gap="2">
                          <Text fontSize="lg" fontWeight="semibold">Acceso Restringido</Text>
                          <Text color="gray.600">
                            No tienes permisos para ver información de costos laborales
                          </Text>
                        </Stack>
                      </Stack>
                    </CardWrapper.Body>
                  </CardWrapper>
                )}
              </Tabs.Content>

              {/* Permissions Tab */}
              <Tabs.Content value="permissions">
                <Stack direction="column" gap="4" align="stretch">
                  <Stack direction="row" justify="space-between">
                    <Text fontSize="lg" fontWeight="semibold">Gestión de Permisos</Text>
                    <Button 
                      colorPalette="blue"
                      size="sm"
                    >
                      <UserPlusIcon className="w-4 h-4 mr-2" />
                      Nuevo Rol
                    </Button>
                  </Stack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                    {/* Admin Role */}
                    <CardWrapper>
                      <CardWrapper.Body>
                        <Stack direction="column" align="stretch" gap="4">
                          <Stack direction="row" justify="space-between">
                            <Stack direction="column" align="start" gap="1">
                              <Stack direction="row" gap="2">
                                <Text fontWeight="semibold">Administrador</Text>
                                <Badge colorPalette="purple" size="sm">ADMIN</Badge>
                              </Stack>
                              <Text fontSize="sm" color="gray.600">Acceso completo al sistema</Text>
                            </Stack>
                            <Text fontSize="sm" color="gray.500">1 usuario</Text>
                          </Stack>

                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb="2">Permisos</Text>
                            <Stack direction="column" align="start" gap="1">
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Personal: Gestión completa</Text>
                              </Stack>
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Nómina: Lectura/Escritura</Text>
                              </Stack>
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Horarios: Gestión completa</Text>
                              </Stack>
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Entrenamientos: Gestión completa</Text>
                              </Stack>
                            </Stack>
                          </Box>

                          <Button size="sm" variant="outline" w="full">
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Editar Permisos
                          </Button>
                        </Stack>
                      </CardWrapper.Body>
                    </CardWrapper>

                    {/* Manager Role */}
                    <CardWrapper>
                      <CardWrapper.Body>
                        <Stack direction="column" align="stretch" gap="4">
                          <Stack direction="row" justify="space-between">
                            <Stack direction="column" align="start" gap="1">
                              <Stack direction="row" gap="2">
                                <Text fontWeight="semibold">Gerente</Text>
                                <Badge colorPalette="blue" size="sm">MANAGER</Badge>
                              </Stack>
                              <Text fontSize="sm" color="gray.600">Gestión de equipo y operaciones</Text>
                            </Stack>
                            <Text fontSize="sm" color="gray.500">3 usuarios</Text>
                          </Stack>

                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb="2">Permisos</Text>
                            <Stack direction="column" align="start" gap="1">
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Personal: Lectura/Escritura</Text>
                              </Stack>
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Rendimiento: Lectura/Escritura</Text>
                              </Stack>
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Horarios: Gestión completa</Text>
                              </Stack>
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Entrenamientos: Lectura/Escritura</Text>
                              </Stack>
                            </Stack>
                          </Box>

                          <Button size="sm" variant="outline" w="full">
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Editar Permisos
                          </Button>
                        </Stack>
                      </CardWrapper.Body>
                    </CardWrapper>

                    {/* Supervisor Role */}
                    <CardWrapper>
                      <CardWrapper.Body>
                        <Stack direction="column" align="stretch" gap="4">
                          <Stack direction="row" justify="space-between">
                            <Stack direction="column" align="start" gap="1">
                              <Stack direction="row" gap="2">
                                <Text fontWeight="semibold">Supervisor</Text>
                                <Badge colorPalette="teal" size="sm">SUPERVISOR</Badge>
                              </Stack>
                              <Text fontSize="sm" color="gray.600">Supervisión de área específica</Text>
                            </Stack>
                            <Text fontSize="sm" color="gray.500">5 usuarios</Text>
                          </Stack>

                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb="2">Permisos</Text>
                            <Stack direction="column" align="start" gap="1">
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Personal: Solo lectura</Text>
                              </Stack>
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Rendimiento: Lectura/Escritura</Text>
                              </Stack>
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Horarios: Solo lectura</Text>
                              </Stack>
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Entrenamientos: Solo lectura</Text>
                              </Stack>
                            </Stack>
                          </Box>

                          <Button size="sm" variant="outline" w="full">
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Editar Permisos
                          </Button>
                        </Stack>
                      </CardWrapper.Body>
                    </CardWrapper>

                    {/* TeamMember Role */}
                    <CardWrapper>
                      <CardWrapper.Body>
                        <Stack direction="column" align="stretch" gap="4">
                          <Stack direction="row" justify="space-between">
                            <Stack direction="column" align="start" gap="1">
                              <Stack direction="row" gap="2">
                                <Text fontWeight="semibold">Empleado</Text>
                                <Badge colorPalette="gray" size="sm">EMPLOYEE</Badge>
                              </Stack>
                              <Text fontSize="sm" color="gray.600">Acceso básico del sistema</Text>
                            </Stack>
                            <Text fontSize="sm" color="gray.500">15 usuarios</Text>
                          </Stack>

                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb="2">Permisos</Text>
                            <Stack direction="column" align="start" gap="1">
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Personal: Solo su perfil</Text>
                              </Stack>
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Rendimiento: Solo lectura (propio)</Text>
                              </Stack>
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Horarios: Solo lectura (propio)</Text>
                              </Stack>
                              <Stack direction="row" gap="2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                <Text fontSize="sm">Entrenamientos: Solo lectura (propio)</Text>
                              </Stack>
                            </Stack>
                          </Box>

                          <Button size="sm" variant="outline" w="full">
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Editar Permisos
                          </Button>
                        </Stack>
                      </CardWrapper.Body>
                    </CardWrapper>
                  </SimpleGrid>
                </Stack>
              </Tabs.Content>

              {/* Audit Tab */}
              <Tabs.Content value="audit">
                <Stack direction="column" gap="4" align="stretch">
                  <Stack direction="row" justify="space-between">
                    <Text fontSize="lg" fontWeight="semibold">Registro de Auditoría</Text>
                    <Stack direction="row" gap="2">
                      <Select.Root 
                        collection={createListCollection({
                          items: [
                            { value: "today", label: "Hoy" },
                            { value: "week", label: "Esta semana" },
                            { value: "month", label: "Este mes" },
                            { value: "all", label: "Todo" }
                          ]
                        })}
                        defaultValue={["today"]} 
                        size="sm" 
                        width="150px"
                      >
                        <Select.Trigger>
                          <Select.ValueText />
                        </Select.Trigger>
                        <Select.Content />
                      </Select.Root>
                      <Button size="sm" variant="outline">
                        Exportar
                      </Button>
                    </Stack>
                  </Stack>

                  <Stack direction="column" gap="2" align="stretch">
                    {mockAuditLog.map((log) => (
                      <CardWrapper key={log.id} size="sm">
                        <CardWrapper.Body>
                          <Stack direction="row" justify="space-between" gap="4">
                            <Stack direction="row" gap="4" flex="1">
                              <Box>
                                <Badge 
                                  colorPalette={
                                    log.action.includes('Created') ? 'green' :
                                    log.action.includes('Updated') ? 'blue' :
                                    log.action.includes('Deleted') ? 'red' : 'gray'
                                  }
                                  size="sm"
                                >
                                  {log.action}
                                </Badge>
                              </Box>
                              
                              <Stack direction="column" align="start" gap="1" flex="1">
                                <Text fontSize="sm" fontWeight="medium">
                                  {log.details}
                                </Text>
                                <Stack direction="row" gap="4" fontSize="xs" color="gray.500">
                                  <Text>Empleado: {log.employee_id}</Text>
                                  <Text>Por: {log.performed_by}</Text>
                                  <Text>IP: {log.ip_address}</Text>
                                </Stack>
                              </Stack>
                            </Stack>

                            <Stack direction="column" align="end" gap="1">
                              <Text fontSize="xs" color="gray.500">
                                {new Date(log.timestamp).toLocaleDateString()}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </Text>
                            </Stack>
                          </Stack>
                        </CardWrapper.Body>
                      </CardWrapper>
                    ))}
                  </Stack>
                </Stack>
              </Tabs.Content>

              {/* Settings Tab */}
              <Tabs.Content value="settings">
                <Stack direction="column" gap="6" align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">Configuración de Seguridad</Text>

                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
                    {/* Security Settings */}
                    <CardWrapper>
                      <CardWrapper.Body>
                        <Stack direction="column" align="stretch" gap="4">
                          <Text fontWeight="semibold">Configuración de Seguridad</Text>
                          
                          <Stack direction="column" align="stretch" gap="3">
                            <Stack direction="row" justify="space-between">
                              <Stack direction="column" align="start" gap="0">
                                <Text fontSize="sm" fontWeight="medium">Autenticación de 2 Factores</Text>
                                <Text fontSize="xs" color="gray.600">Requerida para acceso HR</Text>
                              </Stack>
                              <Switch defaultChecked size="sm" />
                            </Stack>

                            <Stack direction="row" justify="space-between">
                              <Stack direction="column" align="start" gap="0">
                                <Text fontSize="sm" fontWeight="medium">Enmascarar Datos Sensibles</Text>
                                <Text fontSize="xs" color="gray.600">Por defecto ocultar salarios</Text>
                              </Stack>
                              <Switch defaultChecked size="sm" />
                            </Stack>

                            <Stack direction="row" justify="space-between">
                              <Stack direction="column" align="start" gap="0">
                                <Text fontSize="sm" fontWeight="medium">Registro de Auditoría</Text>
                                <Text fontSize="xs" color="gray.600">Auditar todas las acciones</Text>
                              </Stack>
                              <Switch defaultChecked size="sm" />
                            </Stack>

                            <Stack direction="row" justify="space-between">
                              <Stack direction="column" align="start" gap="0">
                                <Text fontSize="sm" fontWeight="medium">Timeout de Sesión</Text>
                                <Text fontSize="xs" color="gray.600">Auto-logout por inactividad</Text>
                              </Stack>
                              <Select.Root 
                                collection={createListCollection({
                                  items: [
                                    { value: "15", label: "15 min" },
                                    { value: "30", label: "30 min" },
                                    { value: "60", label: "1 hora" }
                                  ]
                                })}
                                defaultValue={["30"]} 
                                size="sm" 
                                width="100px"
                              >
                                <Select.Trigger>
                                  <Select.ValueText />
                                </Select.Trigger>
                                <Select.Content />
                              </Select.Root>
                            </Stack>
                          </Stack>
                        </Stack>
                      </CardWrapper.Body>
                    </CardWrapper>

                    {/* Data Retention */}
                    <CardWrapper>
                      <CardWrapper.Body>
                        <Stack direction="column" align="stretch" gap="4">
                          <Text fontWeight="semibold">Retención de Datos</Text>
                          
                          <Stack direction="column" align="stretch" gap="3">
                            <Stack direction="row" justify="space-between">
                              <Stack direction="column" align="start" gap="0">
                                <Text fontSize="sm" fontWeight="medium">Logs de Auditoría</Text>
                                <Text fontSize="xs" color="gray.600">Tiempo de retención</Text>
                              </Stack>
                              <Select.Root 
                                collection={createListCollection({
                                  items: [
                                    { value: "90", label: "90 días" },
                                    { value: "180", label: "180 días" },
                                    { value: "365", label: "1 año" },
                                    { value: "730", label: "2 años" }
                                  ]
                                })}
                                defaultValue={["365"]} 
                                size="sm" 
                                width="120px"
                              >
                                <Select.Trigger>
                                  <Select.ValueText />
                                </Select.Trigger>
                                <Select.Content />
                              </Select.Root>
                            </Stack>

                            <Stack direction="row" justify="space-between">
                              <Stack direction="column" align="start" gap="0">
                                <Text fontSize="sm" fontWeight="medium">Datos de Performance</Text>
                                <Text fontSize="xs" color="gray.600">Historial de evaluaciones</Text>
                              </Stack>
                              <Select.Root 
                                collection={createListCollection({
                                  items: [
                                    { value: "365", label: "1 año" },
                                    { value: "730", label: "2 años" },
                                    { value: "1825", label: "5 años" },
                                    { value: "permanent", label: "Permanente" }
                                  ]
                                })}
                                defaultValue={["1825"]} 
                                size="sm" 
                                width="120px"
                              >
                                <Select.Trigger>
                                  <Select.ValueText />
                                </Select.Trigger>
                                <Select.Content />
                              </Select.Root>
                            </Stack>

                            <Stack direction="row" justify="space-between">
                              <Stack direction="column" align="start" gap="0">
                                <Text fontSize="sm" fontWeight="medium">Registros de Nómina</Text>
                                <Text fontSize="xs" color="gray.600">Historial de pagos</Text>
                              </Stack>
                              <Select.Root 
                                collection={createListCollection({
                                  items: [
                                    { value: "1825", label: "5 años" },
                                    { value: "2555", label: "7 años" },
                                    { value: "permanent", label: "Permanente" }
                                  ]
                                })}
                                defaultValue={["2555"]} 
                                size="sm" 
                                width="120px"
                              >
                                <Select.Trigger>
                                  <Select.ValueText />
                                </Select.Trigger>
                                <Select.Content />
                              </Select.Root>
                            </Stack>

                            <Button size="sm" colorPalette="blue" w="full">
                              Aplicar Configuración
                            </Button>
                          </Stack>
                        </Stack>
                      </CardWrapper.Body>
                    </CardWrapper>
                  </SimpleGrid>

                  {/* GDPR Compliance */}
                  <CardWrapper>
                    <CardWrapper.Body>
                      <Stack direction="column" align="stretch" gap="4">
                        <Text fontWeight="semibold">Cumplimiento GDPR/Privacidad</Text>
                        
                        <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
                          <Button variant="outline" size="sm">
                            Exportar Datos de Empleado
                          </Button>
                          <Button variant="outline" size="sm" colorPalette="red">
                            Eliminar Datos Personales
                          </Button>
                          <Button variant="outline" size="sm">
                            Generar Reporte de Privacidad
                          </Button>
                        </SimpleGrid>
                      </Stack>
                    </CardWrapper.Body>
                  </CardWrapper>
                </Stack>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </CardWrapper.Body>
      </CardWrapper>
    </Stack>
  );
}