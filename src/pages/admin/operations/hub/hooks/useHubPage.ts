import { useEffect } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { logger } from '@/lib/logging';
import {
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export interface UseHubPageReturn {
  // UI State
  overviewCards: Array<{
    id: string;
    icon: React.ComponentType;
    title: string;
    description: string;
    color: string;
  }>;

  // Tab Configuration
  tabs: Array<{
    id: string;
    label: string;
    component: string;
  }>;
}

export const useHubPage = (): UseHubPageReturn => {
  const { setQuickActions } = useNavigation();

  // Setup quick actions for the operations hub
  useEffect(() => {
    setQuickActions([
      {
        id: 'new-recipe',
        label: 'Nueva Receta',
        icon: CogIcon,
        action: () => logger.info('App', 'New recipe'),
        color: 'orange'
      }
    ]);

    // Cleanup function
    return () => setQuickActions([]);
  }, [setQuickActions]);

  // Overview cards configuration
  const overviewCards = [
    {
      id: 'planning',
      icon: CalendarIcon,
      title: 'Planificación',
      description: 'Gestión de horarios y recursos',
      color: 'blue.600'
    },
    {
      id: 'kitchen',
      icon: CogIcon,
      title: 'Cocina',
      description: 'Estado y órdenes activas',
      color: 'green.600'
    },
    {
      id: 'tables',
      icon: ChartBarIcon,
      title: 'Mesas',
      description: 'Ocupación y reservas',
      color: 'purple.600'
    },
    {
      id: 'monitoring',
      icon: ClockIcon,
      title: 'Monitoreo',
      description: 'Métricas en tiempo real',
      color: 'orange.600'
    }
  ];

  // Tab configuration
  const tabs = [
    {
      id: 'planning',
      label: 'Planificación',
      component: 'PlanningSection'
    },
    {
      id: 'kitchen',
      label: 'Cocina',
      component: 'KitchenSection'
    },
    {
      id: 'tables',
      label: 'Mesas',
      component: 'TablesSection'
    },
    {
      id: 'monitoring',
      label: 'Monitoreo',
      component: 'MonitoringSection'
    }
  ];

  return {
    overviewCards,
    tabs
  };
};