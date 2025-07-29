// src/features/customers/data/customerApi.ts
import { supabase } from '@/lib/supabase';
import { 
  type Customer, 
  type CreateCustomerData,
  type UpdateCustomerData,
  type CustomerWithStats
} from '../types';

// ===== CRUD BÁSICO =====

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function fetchCustomerById(id: string): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createCustomer(customerData: CreateCustomerData): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(customerData: UpdateCustomerData): Promise<Customer> {
  const { id, ...updates } = customerData;
  
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ===== BÚSQUEDA Y FILTROS =====

export async function searchCustomers(query: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// ===== FUNCIONES AVANZADAS =====

// Si tienes funciones en Supabase para estadísticas de clientes
export async function fetchCustomersWithStats(): Promise<CustomerWithStats[]> {
  // Primero intentamos con función de Supabase si existe
  try {
    const { data, error } = await supabase
      .rpc('get_customers_with_stats');
    
    if (error) throw error;
    return data || [];
  } catch {
    // Fallback: obtener clientes normales
    return await fetchCustomers();
  }
}

export async function getCustomerStats(customerId: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_customer_stats', { customer_id: customerId });
    
    if (error) throw error;
    return data;
  } catch {
    // Fallback: calcular manualmente
    const { data: sales } = await supabase
      .from('sales')
      .select('total, created_at')
      .eq('customer_id', customerId);

    if (!sales || sales.length === 0) {
      return {
        total_purchases: 0,
        total_spent: 0,
        average_purchase: 0,
        purchase_count: 0
      };
    }

    const totalSpent = sales.reduce((sum, sale) => sum + sale.total, 0);
    const purchaseCount = sales.length;

    return {
      total_purchases: purchaseCount,
      total_spent: totalSpent,
      average_purchase: totalSpent / purchaseCount,
      purchase_count: purchaseCount,
      last_purchase_date: sales[0]?.created_at
    };
  }
}