import { useMemo } from 'react';
import { useMaterials } from '../../materials/logic/useMaterials';
import { useSales } from '../../sales/logic/useSales';
import { useCustomers } from '../../customers/logic/useCustomers';
import type { DashboardStats, AlertItem } from '../types/dashboard.types';

export function useDashboardData() {
  const { inventoryStats, alertSummary, alerts, loading: materialsLoading } = useMaterials();
  const { salesStats, loading: salesLoading } = useSales();
  const { customersStats, loading: customersLoading } = useCustomers();

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
      monthlyRevenue: salesStats?.monthlyRevenue || 0,
      monthlyTransactions: salesStats?.monthlyTransactions || 0,
    },
    customers: {
      totalCustomers: customersStats?.totalCustomers || 0,
      newThisMonth: customersStats?.newThisMonth || 0,
    },
    products: {
      totalRecipes: 0, // TODO: Add recipes hook when available
      activeRecipes: 0,
    }
  }), [inventoryStats, alertSummary, salesStats, customersStats]);

  const criticalAlerts: AlertItem[] = useMemo(() => 
    (alerts || [])
      .filter(alert => alert.urgency === 'critical')
      .slice(0, 5)
      .map(alert => ({
        id: alert.id,
        item_name: alert.item_name,
        current_stock: alert.current_stock,
        unit: alert.unit,
        urgency: alert.urgency as 'critical'
      })),
    [alerts]
  );

  const isLoading = materialsLoading || salesLoading || customersLoading;

  const hasAlerts = dashboardStats.inventory.alerts.total > 0;
  const hasCriticalAlerts = dashboardStats.inventory.alerts.critical > 0;

  return {
    dashboardStats,
    criticalAlerts,
    isLoading,
    hasAlerts,
    hasCriticalAlerts,
    // Individual loading states for granular control
    loading: {
      materials: materialsLoading,
      sales: salesLoading,
      customers: customersLoading,
    }
  };
}