import { useMemo } from 'react';
import {
  CurrencyDollarIcon,
  CubeIcon,
  UsersIcon,
  ShoppingCartIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useDashboardData } from './useDashboardData';
import { useNavigation } from '@/contexts/NavigationContext';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

export function useModernDashboard() {
  const { navigate } = useNavigation();
  const { dashboardStats, isLoading } = useDashboardData();

  // Hero Metric (Revenue) - Métrica principal
  const heroMetric = useMemo(() => ({
    title: "Revenue",
    value: DecimalUtils.formatCurrency(dashboardStats.sales.monthlyRevenue),
    change: {
      value: 15.2, // TODO: Calcular cambio real
      period: "mes anterior",
      type: 'increase' as const
    },
    icon: CurrencyDollarIcon,
    iconColor: "var(--chakra-colors-green-600)",
    iconBg: "var(--chakra-colors-green-100)",
    status: {
      text: "En objetivo",
      color: "success"
    },
    actions: {
      primary: {
        label: "Ver Detalles",
        onClick: () => navigate('sales')
      },
      secondary: {
        label: "Tendencia",
        onClick: () => navigate('sales', undefined, 'view=analytics')
      }
    },
    isLoading
  }), [dashboardStats.sales.monthlyRevenue, navigate, isLoading]);

  // Secondary Metrics (Inventory & Customers)
  const secondaryMetrics = useMemo(() => [
    {
      title: "Items en inventario",
      value: dashboardStats.inventory.totalItems,
      additionalInfo: `Valor: ${DecimalUtils.formatCurrency(dashboardStats.inventory.totalValue)}`,
      icon: CubeIcon,
      iconColor: "var(--chakra-colors-blue-600)",
      iconBg: "var(--chakra-colors-blue-100)",
      onClick: () => navigate('materials'),
      badge: dashboardStats.inventory.alerts.total > 0 ? {
        value: dashboardStats.inventory.alerts.total,
        colorPalette: "red"
      } : undefined,
      isLoading
    },
    {
      title: "Clientes activos",
      value: dashboardStats.customers.totalCustomers,
      additionalInfo: `+${dashboardStats.customers.newThisMonth} nuevos`,
      icon: UsersIcon,
      iconColor: "var(--chakra-colors-purple-600)",
      iconBg: "var(--chakra-colors-purple-100)",
      onClick: () => navigate('customers'),
      isLoading
    }
  ], [dashboardStats, navigate, isLoading]);

  // Summary Panel - Resumen operacional
  const summaryMetrics = useMemo(() => [
    {
      id: 'sales',
      label: 'Ventas',
      value: `${dashboardStats.sales.monthlyTransactions} transacciones`,
      icon: ShoppingCartIcon,
      status: 'success' as const,
      subtitle: 'Este mes'
    },
    {
      id: 'orders',
      label: 'Órdenes',
      value: '23 pendientes', // TODO: Obtener datos reales
      icon: ShoppingCartIcon,
      status: 'warning' as const,
      subtitle: 'En cocina'
    },
    {
      id: 'time',
      label: 'Tiempo prom',
      value: '12.5 min',
      icon: ClockIcon,
      status: 'info' as const,
      subtitle: 'Por orden'
    },
    {
      id: 'efficiency',
      label: 'Eficiencia',
      value: '87.3%',
      icon: ChartBarIcon,
      status: 'success' as const,
      subtitle: 'Operacional'
    }
  ], [dashboardStats.sales.monthlyTransactions]);

  const summaryStatus = {
    text: "Operando normalmente",
    type: 'online' as const
  };

  // Quick Actions - Solo operacionales
  const operationalActions = useMemo(() => [
    {
      id: 'add-material',
      title: '+ Material',
      description: 'Agregar inventario',
      icon: CubeIcon,
      colorPalette: 'blue',
      onClick: () => navigate('materials', undefined, 'action=add')
    },
    {
      id: 'add-sale',
      title: '+ Venta',
      description: 'Nueva transacción',
      icon: CurrencyDollarIcon,
      colorPalette: 'green',
      onClick: () => navigate('sales', undefined, 'action=add')
    },
    {
      id: 'add-customer',
      title: '+ Cliente',
      description: 'Registrar cliente',
      icon: UsersIcon,
      colorPalette: 'purple',
      onClick: () => navigate('customers', undefined, 'action=add')
    },
    {
      id: 'view-reports',
      title: 'Ver Reportes',
      description: 'Business Intelligence',
      icon: ChartBarIcon,
      colorPalette: 'gray',
      onClick: () => navigate('dashboard', '/executive')
    },
    {
      id: 'settings',
      title: 'Configuración',
      description: 'Ajustes sistema',
      icon: CheckCircleIcon,
      colorPalette: 'gray',
      onClick: () => navigate('settings')
    }
  ], [navigate]);

  return {
    heroMetric,
    secondaryMetrics,
    summaryMetrics,
    summaryStatus,
    operationalActions,
    isLoading,
    // Helper para configuración
    onConfigure: () => navigate('settings', '/dashboard')
  };
}