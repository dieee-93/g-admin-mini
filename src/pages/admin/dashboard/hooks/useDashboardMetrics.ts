import { useMemo } from 'react';
import {
  CubeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useDashboardData } from './useDashboardData';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import type { MetricCardProps } from '../types';
import { useNavigation } from '@/contexts/NavigationContext';

export function useDashboardMetrics() {
  const { navigate } = useNavigation();
  const { dashboardStats, isLoading } = useDashboardData();

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

  return {
    metricCards,
    isLoading
  };
}