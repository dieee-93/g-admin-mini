// Operations Hub Types - G-Admin Mini

// ===== OPERATIONS OVERVIEW TYPES =====

export interface OperationCard {
  id: string;
  icon: React.ComponentType;
  title: string;
  description: string;
  color: string;
}

export interface TabConfiguration {
  id: string;
  label: string;
  component: string;
}

// ===== KITCHEN OPERATIONS TYPES =====

export interface KitchenOrder {
  id: string;
  table: string;
  items: string[];
  status: 'pending' | 'preparing' | 'ready' | 'served';
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface KitchenStatus {
  activeOrders: number;
  completedToday: number;
  averageTime: number;
  efficiency: number;
}

// ===== PLANNING TYPES =====

export interface Schedule {
  id: string;
  employeeId: string;
  employeeName: string;
  shift: 'morning' | 'afternoon' | 'night';
  startTime: Date;
  endTime: Date;
  role: string;
}

export interface ResourceAllocation {
  id: string;
  resource: string;
  allocated: number;
  available: number;
  utilization: number;
}

// ===== TABLES MANAGEMENT TYPES =====

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrder?: string;
  reservationTime?: Date;
}

export interface TableReservation {
  id: string;
  tableId: string;
  customerName: string;
  partySize: number;
  reservationTime: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
}

// ===== MONITORING TYPES =====

export interface OperationsMetrics {
  ordersPerHour: number;
  averageServiceTime: number;
  customerSatisfaction: number;
  staffEfficiency: number;
  revenuePerHour: number;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

// ===== PAGE STATE TYPES =====

export interface OperationsPageState {
  activeTab: string;
  refreshInterval: number;
  showAlerts: boolean;
  filters: {
    dateRange: string;
    status: string[];
    priority: string[];
  };
}

// ===== API RESPONSE TYPES =====

export interface OperationsApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Date;
}