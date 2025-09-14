// Dashboard Types - Route-based Architecture v4.0
export interface DashboardStats {
  inventory: {
    totalItems: number;
    totalValue: number;
    alerts: {
      total: number;
      critical: number;
      warning: number;
    };
  };
  sales: {
    monthlyRevenue: number;
    monthlyTransactions: number;
  };
  customers: {
    totalCustomers: number;
    newThisMonth: number;
  };
  products: {
    totalRecipes: number;
    activeRecipes: number;
  };
}

export interface AlertItem {
  id: string;
  item_name: string;
  current_stock: number;
  urgency: 'critical' | 'warning' | 'info';
}
