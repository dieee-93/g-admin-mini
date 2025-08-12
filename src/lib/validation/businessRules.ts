import { BusinessRule } from './types';
import { useInventoryStore } from '@/store/inventoryStore';
import { useSalesStore } from '@/store/salesStore';
import { useCustomersStore } from '@/store/customersStore';
import { useStaffStore } from '@/store/staffStore';

/**
 * Inventory business rules
 */
export const inventoryRules: BusinessRule[] = [
  {
    name: 'stock_not_negative',
    description: 'El stock no puede ser negativo',
    validate: (data) => {
      if (data.current_stock < 0) {
        return 'El stock actual no puede ser negativo';
      }
      return true;
    },
    severity: 'error',
    category: 'inventory'
  },

  {
    name: 'min_stock_reasonable',
    description: 'El stock mínimo debe ser razonable',
    validate: (data) => {
      if (data.min_stock > 10000) {
        return 'El stock mínimo parece muy alto. ¿Es correcto?';
      }
      return true;
    },
    severity: 'warning',
    category: 'inventory'
  },

  {
    name: 'max_stock_greater_than_min',
    description: 'El stock máximo debe ser mayor que el mínimo',
    validate: (data) => {
      if (data.max_stock && data.min_stock && data.max_stock <= data.min_stock) {
        return 'El stock máximo debe ser mayor que el stock mínimo';
      }
      return true;
    },
    severity: 'error',
    category: 'inventory'
  },

  {
    name: 'cost_reasonable',
    description: 'El costo por unidad debe ser razonable',
    validate: (data) => {
      if (data.cost_per_unit > 100000) {
        return 'El costo por unidad parece muy alto. ¿Es correcto?';
      }
      if (data.cost_per_unit < 0.01 && data.cost_per_unit > 0) {
        return 'El costo por unidad parece muy bajo. ¿Es correcto?';
      }
      return true;
    },
    severity: 'warning',
    category: 'inventory'
  },

  {
    name: 'perishable_stock_warning',
    description: 'Advertencia para productos perecederos con alto stock',
    validate: (data) => {
      const perishableCategories = ['lacteos', 'carnes', 'vegetales', 'frutas'];
      if (perishableCategories.includes(data.category?.toLowerCase()) && 
          data.current_stock > (data.min_stock * 3)) {
        return 'Alto stock de producto perecedero. Verificar fechas de vencimiento.';
      }
      return true;
    },
    severity: 'warning',
    category: 'inventory'
  }
];

/**
 * Sales business rules
 */
export const salesRules: BusinessRule[] = [
  {
    name: 'sufficient_stock',
    description: 'Debe haber suficiente stock para la venta',
    validate: async (data) => {
      const { items: inventoryItems } = useInventoryStore.getState();
      
      for (const item of data.items) {
        const inventoryItem = inventoryItems.find(inv => inv.id === item.product_id);
        if (!inventoryItem) {
          return `Producto ${item.product_name} no encontrado en inventario`;
        }
        
        if (inventoryItem.current_stock < item.quantity) {
          return `Stock insuficiente para ${item.product_name}. Disponible: ${inventoryItem.current_stock}, Solicitado: ${item.quantity}`;
        }
      }
      return true;
    },
    severity: 'error',
    category: 'sales'
  },

  {
    name: 'minimum_sale_amount',
    description: 'Monto mínimo de venta',
    validate: (data) => {
      const MINIMUM_SALE = 100; // $100 minimum
      if (data.total < MINIMUM_SALE) {
        return `El monto mínimo de venta es $${MINIMUM_SALE}`;
      }
      return true;
    },
    severity: 'warning',
    category: 'sales'
  },

  {
    name: 'large_sale_approval',
    description: 'Ventas grandes requieren aprobación',
    validate: (data) => {
      const LARGE_SALE_THRESHOLD = 50000; // $50,000
      if (data.total > LARGE_SALE_THRESHOLD && !data.manager_approval) {
        return `Ventas mayores a $${LARGE_SALE_THRESHOLD} requieren aprobación gerencial`;
      }
      return true;
    },
    severity: 'warning',
    category: 'sales'
  },

  {
    name: 'discount_limit',
    description: 'Límite de descuento por venta',
    validate: (data) => {
      const MAX_DISCOUNT_PERCENT = 30;
      if (data.discount_amount && data.subtotal) {
        const discountPercent = (data.discount_amount / data.subtotal) * 100;
        if (discountPercent > MAX_DISCOUNT_PERCENT) {
          return `El descuento no puede exceder el ${MAX_DISCOUNT_PERCENT}%`;
        }
      }
      return true;
    },
    severity: 'error',
    category: 'sales'
  }
];

/**
 * Customer business rules
 */
export const customerRules: BusinessRule[] = [
  {
    name: 'unique_email',
    description: 'El email debe ser único',
    validate: async (data) => {
      if (!data.email) return true;
      
      const { customers } = useCustomersStore.getState();
      const existingCustomer = customers.find(c => 
        c.email?.toLowerCase() === data.email.toLowerCase() && 
        c.id !== data.id
      );
      
      if (existingCustomer) {
        return 'Ya existe un cliente con este email';
      }
      return true;
    },
    severity: 'error',
    category: 'general'
  },

  {
    name: 'age_verification',
    description: 'Verificación de edad para ciertos productos',
    validate: (data) => {
      if (data.birth_date) {
        const age = calculateAge(new Date(data.birth_date));
        if (age < 18) {
          return 'Cliente menor de edad. Verificar restricciones de productos.';
        }
      }
      return true;
    },
    severity: 'warning',
    category: 'general'
  },

  {
    name: 'credit_limit_check',
    description: 'Verificación de límite de crédito',
    validate: (data) => {
      const CREDIT_LIMIT = 10000;
      if (data.total_spent > CREDIT_LIMIT && data.status !== 'vip') {
        return `Cliente cerca del límite de crédito ($${CREDIT_LIMIT})`;
      }
      return true;
    },
    severity: 'warning',
    category: 'finance'
  }
];

/**
 * Staff business rules
 */
export const staffRules: BusinessRule[] = [
  {
    name: 'unique_email',
    description: 'El email de empleado debe ser único',
    validate: async (data) => {
      const { staff } = useStaffStore.getState();
      const existingStaff = staff.find(s => 
        s.email.toLowerCase() === data.email.toLowerCase() && 
        s.id !== data.id
      );
      
      if (existingStaff) {
        return 'Ya existe un empleado con este email';
      }
      return true;
    },
    severity: 'error',
    category: 'staff'
  },

  {
    name: 'minimum_wage',
    description: 'Salario debe cumplir con el salario mínimo',
    validate: (data) => {
      const MINIMUM_WAGE = 150000; // $150,000 minimum wage
      if (data.salary < MINIMUM_WAGE) {
        return `El salario no puede ser menor al salario mínimo ($${MINIMUM_WAGE})`;
      }
      return true;
    },
    severity: 'error',
    category: 'staff'
  },

  {
    name: 'reasonable_salary',
    description: 'Salario debe ser razonable para el puesto',
    validate: (data) => {
      const salaryRanges = {
        'cajero': { min: 150000, max: 300000 },
        'cocinero': { min: 200000, max: 500000 },
        'mesero': { min: 150000, max: 250000 },
        'gerente': { min: 400000, max: 800000 },
        'administrador': { min: 500000, max: 1000000 }
      };

      const position = data.position?.toLowerCase();
      const range = salaryRanges[position as keyof typeof salaryRanges];
      
      if (range && (data.salary < range.min || data.salary > range.max)) {
        return `Salario fuera del rango típico para ${position}: $${range.min} - $${range.max}`;
      }
      return true;
    },
    severity: 'warning',
    category: 'staff'
  },

  {
    name: 'hire_date_validation',
    description: 'Fecha de contratación debe ser válida',
    validate: (data) => {
      const hireDate = new Date(data.hire_date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      if (hireDate > today) {
        return 'La fecha de contratación no puede ser futura';
      }
      
      if (hireDate < oneYearAgo) {
        return 'Verificar fecha de contratación (más de 1 año atrás)';
      }
      
      return true;
    },
    severity: 'warning',
    category: 'staff'
  }
];

/**
 * General business rules that apply across modules
 */
export const generalRules: BusinessRule[] = [
  {
    name: 'working_hours_operation',
    description: 'Operaciones durante horario laboral',
    validate: (data) => {
      const now = new Date();
      const hour = now.getHours();
      
      // Business hours: 6 AM to 11 PM
      if (hour < 6 || hour > 23) {
        return 'Operación fuera del horario comercial normal. ¿Es correcto?';
      }
      return true;
    },
    severity: 'warning',
    category: 'general'
  },

  {
    name: 'currency_validation',
    description: 'Valores monetarios deben ser razonables',
    validate: (data) => {
      const monetaryFields = ['total', 'price', 'cost', 'salary', 'amount'];
      
      for (const field of monetaryFields) {
        const value = data[field];
        if (typeof value === 'number') {
          if (value > 10000000) { // $10M limit
            return `Valor muy alto en ${field}: $${value.toLocaleString()}`;
          }
          if (value < 0) {
            return `Valor negativo no permitido en ${field}`;
          }
        }
      }
      return true;
    },
    severity: 'warning',
    category: 'finance'
  }
];

/**
 * Validates business rules for a specific category
 */
export function validateBusinessRules(
  data: any, 
  category: 'inventory' | 'sales' | 'general' | 'staff',
  context?: Record<string, any>
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const rules = {
    inventory: inventoryRules,
    sales: salesRules,
    general: [...customerRules, ...generalRules],
    staff: staffRules
  }[category];

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of rules) {
    try {
      const result = rule.validate(data, context);
      
      if (result !== true) {
        const message = typeof result === 'string' ? result : rule.description;
        
        if (rule.severity === 'error') {
          errors.push(message);
        } else {
          warnings.push(message);
        }
      }
    } catch (error) {
      errors.push(`Error validating rule ${rule.name}: ${error}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Helper function to calculate age
 */
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}