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
import { useMaterials } from '../../materials/hooks/useMaterials';
import { useSales } from '../../sales/hooks/useSales';
import { useCustomers } from '../../customers/hooks/useCustomers';
import { useNavigation } from '@/contexts/NavigationContext';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import type { DashboardStats, AlertItem, MetricCardProps } from '../types';

/**
 * Hook consolidado para todos los datos del dashboard
 * Fusiona la funcionalidad de useDashboardData, useDashboardMetrics y useModernDashboard
 */
export function useDashboard() {
  const { navigate } = useNavigation();
  const { inventoryStats, alertSummary, alerts, loading: materialsLoading } = useMaterials();
  const { sales, loading: salesLoading } = useSales();
  const { customers, loading: customersLoading } = useCustomers();

  // === DATOS BASE ===
  const dashboardStats: DashboardStats = useMemo(() => ({
    inventory: {
      totalItems: inventoryStats?.totalItems || 0,
      totalValue: inventoryStats?.totalValue || 0,
      alerts: {
        total: alertSummary?.total || 0,
        critical: alertSummary?.critical || 0,
        warning: alertSummary?.warning || 0,
      }
    },
    sales: {
      monthlyRevenue: sales?.length 
        ? sales.reduce((total, sale) => {
            const saleTotal = sale.total || 0;
            return DecimalUtils.add(total.toString(), saleTotal.toString(), 'financial').toNumber();
          }, 0)
        : 0,
      monthlyTransactions: sales?.length || 0,
    },
    customers: {
      totalCustomers: customers?.length || 0,
      newThisMonth: customers?.filter(customer => {
        const created = new Date(customer.created_at || '');
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length || 0,
    },
    products: {
      totalRecipes: 0, // TODO: Add recipes hook when available
      activeRecipes: 0,
    }
  }), [inventoryStats, alertSummary, sales, customers]);

  const criticalAlerts: AlertItem[] = useMemo(() => 
    (alerts || [])
      .filter(alert => alert.urgency === 'critical')
      .slice(0, 5)
      .map(alert => ({
        id: alert.id,
        item_name: alert.item_name,
        current_stock: alert.current_stock,
        urgency: alert.urgency as 'critical'
      })),
    [alerts]
  );

  const isLoading = materialsLoading || salesLoading || customersLoading;

  // === HERO METRIC ===
  const heroMetric = useMemo(() => ({
    title: "Revenue",
    value: DecimalUtils.formatCurrency(dashboardStats.sales.monthlyRevenue),
    subtitle: `${dashboardStats.sales.monthlyTransactions} transacciones este mes`,
    icon: CurrencyDollarIcon,
    colorPalette: 'green' as const,
    change: {
      value: 15.2, // TODO: Calcular cambio real
      period: "mes anterior",
      type: 'increase' as const
    },
    isLoading
  }), [dashboardStats.sales.monthlyRevenue, dashboardStats.sales.monthlyTransactions, isLoading]);

  // === SECONDARY METRICS ===
  const secondaryMetrics = useMemo(() => [
    {
      title: "Items en inventario",
      value: dashboardStats.inventory.totalItems,
      subtitle: `Valor: ${DecimalUtils.formatCurrency(dashboardStats.inventory.totalValue)}`,
      icon: CubeIcon,
      colorPalette: 'blue' as const,
      badge: dashboardStats.inventory.alerts.total > 0 ? {
        value: dashboardStats.inventory.alerts.total,
        colorPalette: "red" as const
      } : undefined,
      isLoading
    },
    {
      title: "Clientes activos",
      value: dashboardStats.customers.totalCustomers,
      subtitle: `+${dashboardStats.customers.newThisMonth} nuevos`,
      icon: UsersIcon,
      colorPalette: 'purple' as const,
      isLoading
    }
  ], [dashboardStats, isLoading]);

  // === METRIC CARDS (para compatibilidad con componentes existentes) ===
  const metricCards: MetricCardProps[] = useMemo(() => [
    {
      title: "Items en inventario",
      value: dashboardStats.inventory.totalItems,
      additionalInfo: `Valor: ${DecimalUtils.formatCurrency(dashboardStats.inventory.totalValue)}`,
      icon: CubeIcon,
      iconColor: "var(--chakra-colors-green-600)",
      iconBg: "var(--chakra-colors-green-100)",
      onClick: () => navigate('materials'),
      badge: dashboardStats.inventory.alerts.total > 0 ? {
        value: dashboardStats.inventory.alerts.total,
        colorPalette: "red"
      } : undefined,
      isLoading
    },
    {
      title: "Ventas del mes",
      value: DecimalUtils.formatCurrency(dashboardStats.sales.monthlyRevenue),
      additionalInfo: `${dashboardStats.sales.monthlyTransactions} transacciones`,
      icon: CurrencyDollarIcon,
      iconColor: "var(--chakra-colors-teal-600)",
      iconBg: "var(--chakra-colors-teal-100)",
      onClick: () => navigate('sales'),
      isLoading
    },
    {
      title: "Clientes activos",
      value: dashboardStats.customers.totalCustomers,
      additionalInfo: `${dashboardStats.customers.newThisMonth} nuevos este mes`,
      icon: UsersIcon,
      iconColor: "var(--chakra-colors-pink-600)",
      iconBg: "var(--chakra-colors-pink-100)",
      onClick: () => navigate('customers'),
      isLoading
    },
    {
      title: "Recetas disponibles",
      value: dashboardStats.products.totalRecipes,
      additionalInfo: `${dashboardStats.products.activeRecipes} activas`,
      icon: ChartBarIcon,
      iconColor: "var(--chakra-colors-purple-600)",
      iconBg: "var(--chakra-colors-purple-100)",
      onClick: () => navigate('products'),
      isLoading
    }
  ], [dashboardStats, navigate, isLoading]);

  // === SUMMARY METRICS ===
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

  // === OPERATIONAL ACTIONS ===
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

  // === STATUS FLAGS ===
  const hasAlerts = dashboardStats.inventory.alerts.total > 0;
  const hasCriticalAlerts = dashboardStats.inventory.alerts.critical > 0;

  return {
    // Datos base
    dashboardStats,
    criticalAlerts,
    isLoading,
    hasAlerts,
    hasCriticalAlerts,

    // Loading states específicos
    loading: {
      materials: materialsLoading,
      sales: salesLoading,
      customers: customersLoading,
    },

    // Hero metric (Modern Dashboard)
    heroMetric,

    // Secondary metrics (Modern Dashboard)
    secondaryMetrics,

    // Metric cards (Legacy compatibility)
    metricCards,

    // Summary panel
    summaryMetrics,
    summaryStatus,

    // Actions
    operationalActions,

    // Helper para configuración
    onConfigure: () => navigate('settings', '/dashboard')
  };
}