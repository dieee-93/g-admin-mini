// Staff Management Module - Main Page with UNIFIED navigation pattern
import { useState, useEffect } from 'react';
import { VStack, HStack, Badge, SimpleGrid, CardWrapper, Tabs, Icon } from '@/shared/ui';
import { Box, Text } from '@chakra-ui/react';
import { 
  UsersIcon, 
  ChartBarIcon, 
  AcademicCapIcon, 
  CogIcon, 
  PlusIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { useStaffWithLoader } from '@/hooks/useStaffData';
import type { StaffViewState } from './types';

// Import tab sections
import { DirectorySection } from './components/sections/DirectorySection';
import { PerformanceSection } from './components/sections/PerformanceSection';
import { TrainingSection } from './components/sections/TrainingSection';
import { ManagementSection } from './components/sections/ManagementSection';
import { TimeTrackingSection } from './components/sections/TimeTrackingSection';

export default function StaffPage() {
  const { setQuickActions } = useNavigation();
  const { staff, loading, error, isReady, getStaffStats } = useStaffWithLoader();
  const [viewState, setViewState] = useState<StaffViewState>({
    activeTab: 'directory',
    filters: {},
    sortBy: { field: 'name', direction: 'asc' },
    viewMode: 'grid'
  });

  // Get real staff stats from store
  const staffStats = getStaffStats();

  useEffect(() => {
    // Set context-aware quick actions based on active tab
    const getQuickActionsForTab = (tab: string) => {
      const baseActions = [
        {
          id: 'new-employee',
          label: 'Nuevo Empleado',
          icon: PlusIcon,
          action: () => setViewState(prev => ({ ...prev, activeTab: 'directory' })),
          color: 'blue'
        }
      ];

      switch (tab) {
        case 'directory':
          return [
            ...baseActions,
            {
              id: 'import-employees',
              label: 'Importar CSV',
              icon: UsersIcon,
              action: () => console.log('Import employees'),
              color: 'green'
            }
          ];
        case 'performance':
          return [
            ...baseActions,
            {
              id: 'new-review',
              label: 'Nueva Evaluación',
              icon: ChartBarIcon,
              action: () => console.log('New review'),
              color: 'purple'
            }
          ];
        case 'training':
          return [
            ...baseActions,
            {
              id: 'schedule-training',
              label: 'Programar Entrenamiento',
              icon: AcademicCapIcon,
              action: () => console.log('Schedule training'),
              color: 'orange'
            }
          ];
        case 'management':
          return [
            ...baseActions,
            {
              id: 'generate-payroll',
              label: 'Generar Nómina',
              icon: CogIcon,
              action: () => console.log('Generate payroll'),
              color: 'teal'
            }
          ];
        case 'timetracking':
          return [
            ...baseActions,
            {
              id: 'clock-in-out',
              label: 'Clock In/Out',
              icon: ClockIcon,
              action: () => console.log('Clock action'),
              color: 'blue'
            },
            {
              id: 'time-reports',
              label: 'Ver Reportes',
              icon: ChartBarIcon,
              action: () => console.log('View time reports'),
              color: 'purple'
            }
          ];
        default:
          return baseActions;
      }
    };

    setQuickActions(getQuickActionsForTab(viewState.activeTab));
    return () => setQuickActions([]);
  }, [setQuickActions, viewState.activeTab]);

  const renderTabContent = () => {
    switch (viewState.activeTab) {
      case 'directory':
        return <DirectorySection viewState={viewState} onViewStateChange={setViewState} />;
      case 'performance':
        return <PerformanceSection viewState={viewState} onViewStateChange={setViewState} />;
      case 'training':
        return <TrainingSection viewState={viewState} onViewStateChange={setViewState} />;
      case 'management':
        return <ManagementSection viewState={viewState} onViewStateChange={setViewState} />;
      case 'timetracking':
        return <TimeTrackingSection viewState={viewState} onViewStateChange={setViewState} />;
      default:
        return <DirectorySection viewState={viewState} onViewStateChange={setViewState} />;
    }
  };

  return (
    <Box p="6" maxW="container.xl" mx="auto">
      <VStack gap="6" align="stretch">
        {/* UNIFIED PATTERN: Header with icon, badges, KPIs */}
        <CardWrapper variant="elevated" padding="md">
          <CardWrapper.Body>
            <HStack gap="4">
              <Box p="2" bg="blue.100" borderRadius="md">
                <Icon icon={UserGroupIcon} size="xl" color="blue.600" />
              </Box>
              <VStack align="start" gap="1">
                <HStack>
                  <Text fontSize="2xl" fontWeight="bold">
                    Gestión de Personal
                  </Text>
                  <Badge colorPalette="blue" variant="subtle">
                    Security Compliant
                  </Badge>
                  <Badge colorPalette="green" variant="subtle">
                    {staffStats.activeStaff} Activos
                  </Badge>
                </HStack>
                <Text color="gray.600">
                  Directorio, rendimiento, entrenamiento y administración HR
                </Text>
              </VStack>
            </HStack>

            {/* KPI Cards - Mobile responsive */}
            <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" mt="6">
              <CardWrapper variant="flat" padding="sm">
                <CardWrapper.Body textAlign="center">
                  <Icon icon={UsersIcon} size="lg" color="blue.500" />
                  <Text fontSize="2xl" fontWeight="bold">{staffStats.totalStaff}</Text>
                  <Text fontSize="sm" color="gray.600">Total Empleados</Text>
                </CardWrapper.Body>
              </CardWrapper>

              <CardWrapper variant="flat" padding="sm">
                <CardWrapper.Body textAlign="center">
                  <Icon icon={ClockIcon} size="lg" color="green.500" />
                  <Text fontSize="2xl" fontWeight="bold">{staff.filter(s => s.status === 'active').length}</Text>
                  <Text fontSize="sm" color="gray.600">En Turno</Text>
                </CardWrapper.Body>
              </CardWrapper>

              <CardWrapper variant="flat" padding="sm">
                <CardWrapper.Body textAlign="center">
                  <Icon icon={TrophyIcon} size="lg" color="purple.500" />
                  <Text fontSize="2xl" fontWeight="bold">{staffStats.avgPerformance}%</Text>
                  <Text fontSize="sm" color="gray.600">Rendimiento Prom.</Text>
                </CardWrapper.Body>
              </CardWrapper>

              <CardWrapper variant="flat" padding="sm">
                <CardWrapper.Body textAlign="center">
                  <Icon icon={AcademicCapIcon} size="lg" color="orange.500" />
                  <Text fontSize="2xl" fontWeight="bold">{staffStats.upcomingReviews.length}</Text>
                  <Text fontSize="sm" color="gray.600">Evaluaciones Pendientes</Text>
                </CardWrapper.Body>
              </CardWrapper>
            </SimpleGrid>
          </CardWrapper.Body>
        </CardWrapper>

        {/* UNIFIED PATTERN: 5-Tab Structure with Time Tracking */}
        <CardWrapper variant="elevated" padding="none">
          <CardWrapper.Body>
            <Tabs.Root 
              value={viewState.activeTab} 
              onValueChange={(details) => 
                setViewState(prev => ({ ...prev, activeTab: details.value as any }))
              }
            >
              <Tabs.List bg="bg.canvas" p="1" borderRadius="lg">
                <Tabs.Trigger 
                  value="directory" 
                  gap="2" 
                  flex="1" 
                  minH="44px"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  <Icon icon={UsersIcon} size="md" />
                  <Text display={{ base: "none", sm: "block" }}>Directorio</Text>
                </Tabs.Trigger>
                
                <Tabs.Trigger 
                  value="timetracking" 
                  gap="2" 
                  flex="1" 
                  minH="44px"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  <Icon icon={ClockIcon} size="md" />
                  <Text display={{ base: "none", sm: "block" }}>Tiempo</Text>
                  <Badge colorPalette="blue" variant="solid" size="xs">
                    {staff.filter(s => s.status === 'active').length}
                  </Badge>
                </Tabs.Trigger>
                
                <Tabs.Trigger 
                  value="performance" 
                  gap="2" 
                  flex="1" 
                  minH="44px"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  <Icon icon={ChartBarIcon} size="sm" />
                  <Text display={{ base: "none", sm: "block" }}>Rendimiento</Text>
                  {staffStats.upcomingReviews.length > 0 && (
                    <Badge colorPalette="red" variant="solid" size="xs">
                      {staffStats.upcomingReviews.length}
                    </Badge>
                  )}
                </Tabs.Trigger>
                
                <Tabs.Trigger 
                  value="training" 
                  gap="2" 
                  flex="1" 
                  minH="44px"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  <Icon icon={AcademicCapIcon} size="md" />
                  <Text display={{ base: "none", sm: "block" }}>Entrenamiento</Text>
                  {staff.filter(s => s.training_completed.length === 0).length > 0 && (
                    <Badge colorPalette="orange" variant="solid" size="xs">
                      {staff.filter(s => s.training_completed.length === 0).length}
                    </Badge>
                  )}
                </Tabs.Trigger>
                
                <Tabs.Trigger 
                  value="management" 
                  gap="2" 
                  flex="1" 
                  minH="44px"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  <Icon icon={ShieldCheckIcon} size="sm" />
                  <Text display={{ base: "none", sm: "block" }}>Admin</Text>
                </Tabs.Trigger>
              </Tabs.List>

              <Box p="6">
                <Tabs.Content value="directory">
                  {renderTabContent()}
                </Tabs.Content>
                
                <Tabs.Content value="timetracking">
                  {renderTabContent()}
                </Tabs.Content>
                
                <Tabs.Content value="performance">
                  {renderTabContent()}
                </Tabs.Content>
                
                <Tabs.Content value="training">
                  {renderTabContent()}
                </Tabs.Content>
                
                <Tabs.Content value="management">
                  {renderTabContent()}
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </CardWrapper.Body>
        </CardWrapper>
      </VStack>
    </Box>
  );
}