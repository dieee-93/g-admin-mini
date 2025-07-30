// ==============================================
// 📁 src/types/navigation.ts - Types compartidos
// ==============================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isCurrentPage?: boolean;
}

export type BreadcrumbContext = 
  | 'dashboard'
  | 'items'
  | 'items.create'
  | 'items.edit'
  | 'items.stock'
  | 'stock'
  | 'stock.create'
  | 'recipes'
  | 'recipes.create'
  | 'recipes.edit'
  | 'products'
  | 'products.create'
  | 'sales'
  | 'sales.create'
  | 'customers'
  | 'customers.create';
