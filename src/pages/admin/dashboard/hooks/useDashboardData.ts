import { useMemo } from 'react';
import { useMaterials } from '../../materials/hooks/useMaterials';
import { useSales } from '../../sales/hooks/useSales';
import { useCustomers } from '../../customers/hooks/useCustomers';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import type { DashboardStats, AlertItem } from '../types';

export function useDashboardData() {
  const { inventoryStats, alertSummary, alerts, loading: materialsLoading } = useMaterials();
  const { sales, loading: salesLoading } = useSales();
  const { customers, loading: customersLoading } = useCustomers();

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