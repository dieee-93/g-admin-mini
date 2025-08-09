// Staff Management Module - Main Page with UNIFIED navigation pattern
import { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Tabs, Badge, Card, SimpleGrid } from '@chakra-ui/react';
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
import type { StaffViewState, StaffStats } from './types';

// Import tab sections
import { DirectorySection } from './components/sections/DirectorySection';
import { PerformanceSection } from './components/sections/PerformanceSection';
import { TrainingSection } from './components/sections/TrainingSection';
import { ManagementSection } from './components/sections/ManagementSection';

export default function StaffPageRefactored() {
  const { setQuickActions } = useNavigation();
  const [viewState, setViewState] = useState<StaffViewState>({
    activeTab: 'directory',
    filters: {},
    sortBy: { field: 'name', direction: 'asc' },
    viewMode: 'grid'
  });

  // Mock staff stats - will be replaced with API call
  const [staffStats] = useState<StaffStats>({
    total_employees: 24,
    active_employees: 22,
    on_shift: 8,
    avg_performance: 87.5,
    pending_reviews: 3,
    training_due: 5,
    new_hires_this_month: 2,
    turnover_rate: 8.3
  });

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
      default:
        return <DirectorySection viewState={viewState} onViewStateChange={setViewState} />;
    }
  };

  return (
    <Box p="6" maxW="7xl" mx="auto">
      <VStack gap="6" align="stretch">
        {/* UNIFIED PATTERN: Header with icon, badges, KPIs */}
        <Card.Root>
          <Card.Body>
            <HStack gap="4">
              <Box p="2" bg="blue.100" borderRadius="md">
                <UserGroupIcon className="w-8 h-8 text-blue-600" />
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
                    {staffStats.active_employees} Activos
                  </Badge>
                </HStack>
                <Text color="gray.600">
                  Directorio, rendimiento, entrenamiento y administración HR
                </Text>
              </VStack>
            </HStack>

            {/* KPI Cards - Mobile responsive */}
            <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" mt="6">
              <Card.Root size="sm">
                <Card.Body textAlign="center">
                  <UsersIcon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <Text fontSize="2xl" fontWeight="bold">{staffStats.total_employees}</Text>
                  <Text fontSize="sm" color="gray.600">Total Empleados</Text>
                </Card.Body>
              </Card.Root>

              <Card.Root size="sm">
                <Card.Body textAlign="center">
                  <ClockIcon className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <Text fontSize="2xl" fontWeight="bold">{staffStats.on_shift}</Text>
                  <Text fontSize="sm" color="gray.600">En Turno</Text>
                </Card.Body>
              </Card.Root>

              <Card.Root size="sm">
                <Card.Body textAlign="center">
                  <TrophyIcon className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <Text fontSize="2xl" fontWeight="bold">{staffStats.avg_performance}%</Text>
                  <Text fontSize="sm" color="gray.600">Rendimiento Prom.</Text>
                </Card.Body>
              </Card.Root>

              <Card.Root size="sm">
                <Card.Body textAlign="center">
                  <AcademicCapIcon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <Text fontSize="2xl" fontWeight="bold">{staffStats.training_due}</Text>
                  <Text fontSize="sm" color="gray.600">Entrenamientos Pendientes</Text>
                </Card.Body>
              </Card.Root>
            </SimpleGrid>
          </Card.Body>
        </Card.Root>

        {/* UNIFIED PATTERN: 4-Tab Structure */}
        <Card.Root>
          <Card.Body p="0">
            <Tabs.Root 
              value={viewState.activeTab} 
              onValueChange={(details) => 
                setViewState(prev => ({ ...prev, activeTab: details.value as any }))
              }
            >
              <Tabs.List bg="gray.50" p="1" borderRadius="lg">
                <Tabs.Trigger 
                  value="directory" 
                  gap="2" 
                  flex="1" 
                  minH="44px"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  <UsersIcon className="w-5 h-5" />
                  <Text display={{ base: "none", sm: "block" }}>Directorio</Text>
                </Tabs.Trigger>
                
                <Tabs.Trigger 
                  value="performance" 
                  gap="2" 
                  flex="1" 
                  minH="44px"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  <ChartBarIcon className="w-5 h-5" />
                  <Text display={{ base: "none", sm: "block" }}>Rendimiento</Text>
                  {staffStats.pending_reviews > 0 && (
                    <Badge colorPalette="red" variant="solid" size="xs">
                      {staffStats.pending_reviews}
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
                  <AcademicCapIcon className="w-5 h-5" />
                  <Text display={{ base: "none", sm: "block" }}>Entrenamiento</Text>
                  {staffStats.training_due > 0 && (
                    <Badge colorPalette="orange" variant="solid" size="xs">
                      {staffStats.training_due}
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
                  <ShieldCheckIcon className="w-5 h-5" />
                  <Text display={{ base: "none", sm: "block" }}>Administración</Text>
                </Tabs.Trigger>
              </Tabs.List>

              <Box p="6">
                <Tabs.Content value="directory">
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
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
}