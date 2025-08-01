// src/features/sales/data/saleApi.ts - ESQUEMA NORMALIZADO
import { supabase } from '@/lib/supabase';
import { 
  type Sale, 
  type Customer,
  type Product,
  type CreateSaleData,
  type SaleValidation,
  type SaleProcessResult,
  type SalesListFilters,
  type SalesSummary
} from '../types';

// ===== CRUD BÁSICO DE VENTAS =====

export async function fetchSales(filters?: SalesListFilters): Promise<Sale[]> {
  let query = supabase
    .from('sales')
    .select(`
      *,
      customer:customers(id, name, phone, email, address),
      sale_items(
        id,
        product_id,
        quantity,
        unit_price,
        created_at,
        product:products(id, name, unit, type, description)
      )
    `)
    .order('created_at', { ascending: false }); // ✅ Ahora funciona correctamente

  // ✅ Filtros por fecha funcionan correctamente
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  
  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }
  
  if (filters?.customerId) {
    query = query.eq('customer_id', filters.customerId);
  }
  
  if (filters?.minTotal) {
    query = query.gte('total', filters.minTotal);
  }
  
  if (filters?.maxTotal) {
    query = query.lte('total', filters.maxTotal);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

export async function fetchSaleById(id: string): Promise<Sale> {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      customer:customers(id, name, phone, email, address),
      sale_items(
        id,
        product_id,
        quantity,
        unit_price,
        created_at,
        product:products(id, name, unit, type, description)
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteSale(id: string): Promise<void> {
  // Los sale_items se eliminan automáticamente por CASCADE
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ===== FUNCIONES AVANZADAS (usando las funciones de Supabase) =====

export async function validateSaleStock(items: { product_id: string; quantity: number }[]): Promise<SaleValidation> {
  const { data, error } = await supabase
    .rpc('validate_sale_stock', { 
      items_array: JSON.stringify(items)
    });
  
  if (error) throw error;
  return data;
}

export async function processSale(saleData: CreateSaleData): Promise<SaleProcessResult> {
  const { data, error } = await supabase
    .rpc('process_sale', {
      customer_id: saleData.customer_id || null,
      items_array: JSON.stringify(saleData.items),
      total: saleData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
      note: saleData.note || null
    });
  
  if (error) throw error;
  return data;
}

export async function getSalesSummary(dateFrom: string, dateTo: string): Promise<SalesSummary> {
  const { data, error } = await supabase
    .rpc('get_sales_summary', {
      date_from: dateFrom,
      date_to: dateTo
    });
  
  if (error) throw error;
  return data;
}

// ===== DATOS AUXILIARES PARA FORMULARIOS =====

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function fetchProductsWithAvailability(): Promise<Product[]> {
  // ✅ Usar la función normalizada de Supabase
  const { data, error } = await supabase
    .rpc('get_products_with_availability');
  
  if (error) throw error;
  return data || [];
}

// ===== ESTADÍSTICAS Y REPORTES =====

export async function getTopSellingProducts(dateFrom: string, dateTo: string, limit: number = 10) {
  const { data, error } = await supabase
    .from('sale_items')
    .select(`
      product_id,
      quantity,
      unit_price,
      created_at,
      product:products(name, unit, type),
      sale:sales(created_at)
    `)
    .gte('sale.created_at', dateFrom) // ✅ Ahora funciona
    .lte('sale.created_at', dateTo)   // ✅ Ahora funciona
    .order('quantity', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getCustomerPurchases(customerId: string): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      sale_items(
        id,
        product_id,
        quantity,
        unit_price,
        created_at,
        product:products(id, name, unit, type)
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false }); // ✅ Ahora funciona

  if (error) throw error;
  return data || [];
}