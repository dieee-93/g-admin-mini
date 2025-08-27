import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CubeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useDashboardData } from './useDashboardData';
import type { MetricCardProps } from '../types/dashboard.types';

export function useDashboardMetrics() {
  const navigate = useNavigate();
  const { dashboardStats, isLoading } = useDashboardData();

  const metricCards: MetricCardProps[] = useMemo(() => [
    {
      title: "Items en inventario",
      value: dashboardStats.inventory.totalItems,
      additionalInfo: `Valor: $${dashboardStats.inventory.totalValue.toLocaleString()}`,
      icon: CubeIcon,
      iconColor: "var(--chakra-colors-green-600)",
      iconBg: "var(--chakra-colors-green-100)",
      onClick: () => navigate('/materials'),
      badge: dashboardStats.inventory.alerts.total > 0 ? {
        value: dashboardStats.inventory.alerts.total,
        colorPalette: "red"
      } : undefined,
      isLoading
    },
    {
      title: "Ventas del mes",
      value: `$${dashboardStats.sales.monthlyRevenue.toLocaleString()}`,
      additionalInfo: `${dashboardStats.sales.monthlyTransactions} transacciones`,
      icon: CurrencyDollarIcon,
      iconColor: "var(--chakra-colors-teal-600)",
      iconBg: "var(--chakra-colors-teal-100)",
      onClick: () => navigate('/sales'),
      isLoading
    },
    {
      title: "Clientes activos",
      value: dashboardStats.customers.totalCustomers,
      additionalInfo: `${dashboardStats.customers.newThisMonth} nuevos este mes`,
      icon: UsersIcon,
      iconColor: "var(--chakra-colors-pink-600)",
      iconBg: "var(--chakra-colors-pink-100)",
      onClick: () => navigate('/customers'),
      isLoading
    },
    {
      title: "Recetas disponibles",
      value: dashboardStats.products.totalRecipes,
      additionalInfo: `${dashboardStats.products.activeRecipes} activas`,
      icon: ChartBarIcon,
      iconColor: "var(--chakra-colors-purple-600)",
      iconBg: "var(--chakra-colors-purple-100)",
      onClick: () => navigate('/products'),
      isLoading
    }
  ], [dashboardStats, navigate, isLoading]);

  return {
    metricCards,
    isLoading
  };
}