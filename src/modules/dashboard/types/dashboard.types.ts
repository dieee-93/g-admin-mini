// Dashboard types and interfaces
export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  additionalInfo?: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  iconBg: string;
  onClick?: () => void;
  badge?: {
    value: string | number;
    colorPalette: string;
    variant?: string;
  };
  isLoading?: boolean;
}

export interface AlertCardProps {
  title: string;
  description: string;
  status: 'error' | 'warning' | 'info' | 'success';
  actionLabel?: string;
  onAction?: () => void;
  showAlert?: boolean;
}

export interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  colorPalette: string;
  onClick: () => void;
}

export interface BusinessIntelligenceCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  colorPalette: string;
  onClick: () => void;
  actionLabel?: string;
}

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
  unit: string;
  urgency: 'critical' | 'warning' | 'info';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  color?: string;
}