// src/features/sales/data/saleApi.ts - ESQUEMA NORMALIZADO
import { supabase } from '@/lib/supabase/client';
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
import { EventBus } from '@/lib/events';

// 🔒 PERMISSIONS: Service layer validation
import { requirePermission, requireModuleAccess } from '@/lib/permissions';
import type { AuthUser } from '@/contexts/AuthContext';

// Event payload type for sale completion
interface SaleCompletedEvent {
  saleId: string;
  orderId?: string;
  customerId?: string;
  tableId?: string;
  totalAmount: number;
  subtotal: number;
  taxes: number;
  tips?: number;
  paymentMethods: Array<{
    method: string;
    amount: number;
  }>;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  timestamp: string;
}
import { taxService } from './taxCalculationService';
import { errorHandler, createNetworkError, createBusinessError } from '@/lib/error-handling';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// ===== CRUD BÁSICO DE VENTAS =====

export async function fetchSales(filters?: SalesListFilters, user?: AuthUser | null): Promise<Sale[]> {
  // 🔒 PERMISSIONS: Validate user can read sales
  if (user) {
    requireModuleAccess(user, 'sales');
  }

  try {
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
          product:products(id, name, description, price, category)
        )
      `)
      .order('created_at', { ascending: false });

    // 🆕 MULTI-LOCATION: Filter by location
    if (filters?.location_id) {
      query = query.eq('location_id', filters.location_id);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.minTotal) {
      query = query.gte('total', filters.minTotal);
    }

    if (filters?.maxTotal) {
      query = query.lte('total', filters.maxTotal);
    }

    const { data, error } = await query;
    
    if (error) {
      errorHandler.handle(createNetworkError(`Error fetching sales: ${error.message}`, { error, filters }));
      throw error;
    }
    
    return data || [];
  } catch (error) {
    errorHandler.handle(error as Error, { operation: 'fetchSales', filters });
    throw error;
  }
}

export async function fetchSaleById(id: string): Promise<Sale> {
  try {
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
          product:products(id, name, description, price, category)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      errorHandler.handle(createNetworkError(`Error fetching sale by ID: ${error.message}`, { error, saleId: id }));
      throw error;
    }
    
    return data;
  } catch (error) {
    errorHandler.handle(error as Error, { operation: 'fetchSaleById', saleId: id });
    throw error;
  }
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

// ===== TRANSACCIONES Y ÓRDENES =====

/**
 * Fetch sales transactions with period filter
 * @param period - Time period ('today', 'week', 'month', 'year', or custom date range)
 */
export async function fetchTransactions(period: string = 'today'): Promise<Sale[]> {
  try {
    let dateFrom: string;
    const now = new Date();

    // Calculate date range based on period
    switch (period) {
      case 'today':
        dateFrom = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        break;
      case 'week':
        dateFrom = new Date(now.setDate(now.getDate() - 7)).toISOString();
        break;
      case 'month':
        dateFrom = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
        break;
      case 'year':
        dateFrom = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
        break;
      default:
        dateFrom = period; // Assume custom ISO date
    }

    return await fetchSales({ dateFrom });
  } catch (error) {
    errorHandler.handle(error as Error, { operation: 'fetchTransactions', period });
    throw error;
  }
}

/**
 * Fetch orders/sales by status
 * @param status - Order status filter ('active', 'pending', 'completed', etc.)
 */
export async function fetchOrders(status?: string): Promise<Sale[]> {
  try {
    let query = supabase
      .from('sales')
      .select(`
        *,
        customer:customers(id, name, phone, email),
        sale_items(
          id,
          product_id,
          quantity,
          unit_price,
          product:products(id, name, price, category)
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      errorHandler.handle(createNetworkError(`Error fetching orders: ${error.message}`, { error, status }));
      throw error;
    }

    return data || [];
  } catch (error) {
    errorHandler.handle(error as Error, { operation: 'fetchOrders', status });
    throw error;
  }
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
      product:products(name, price, category),
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

// ===== PROCESAMIENTO DE VENTAS =====

export async function processSale(saleData: CreateSaleData): Promise<SaleProcessResult> {
  try {
    // Validar stock antes del procesamiento
    const stockValidation = await validateSaleStock(saleData.items);

    if (!stockValidation.is_valid) {
      return {
        success: false,
        sale: null,
        error: 'Stock insuficiente para algunos productos',
        validation: stockValidation
      };
    }

    // Calcular impuestos
    // ✅ PRECISION FIX: Use DecimalUtils for sales calculations
    const subtotalDec = saleData.items.reduce((sumDec, item) => {
      const itemTotalDec = DecimalUtils.multiply(
        item.quantity.toString(),
        item.unit_price.toString(),
        'financial'
      );
      return DecimalUtils.add(sumDec, itemTotalDec, 'financial');
    }, DecimalUtils.fromValue(0, 'financial'));

    const subtotal = subtotalDec.toNumber();
    const taxResult = taxService.calculateTaxes(subtotal, saleData.tax_rate || 0.21);

    // Preparar datos de venta con location_id
    const saleToCreate = {
      location_id: saleData.location_id, // 🆕 MULTI-LOCATION: Include location
      customer_id: saleData.customer_id,
      total: taxResult.total,
      subtotal: taxResult.subtotal,
      tax_amount: taxResult.taxAmount,
      tax_rate: taxResult.taxRate,
      payment_method: saleData.payment_method || 'cash',
      notes: saleData.notes || saleData.note || '',
      created_at: new Date().toISOString()
    };

    // Crear venta usando RPC para transacción atómica
    const { data: processedSale, error } = await supabase
      .rpc('process_complete_sale', {
        sale_data: JSON.stringify(saleToCreate),
        items_data: JSON.stringify(saleData.items)
      });

    if (error) {
      errorHandler.handle(createBusinessError(`Error procesando venta: ${error.message}`, { error, saleData }));
      return {
        success: false,
        sale: null,
        error: error.message,
        validation: stockValidation
      };
    }

    // Emitir evento de venta completada
    const saleEvent: SaleCompletedEvent = {
      saleId: processedSale.id,
      customerId: saleData.customer_id,
      total: taxResult.total,
      items: saleData.items,
      timestamp: new Date().toISOString()
    };

    EventBus.emit('sales.completed', saleEvent);

    return {
      success: true,
      sale: processedSale,
      error: null,
      validation: stockValidation
    };

  } catch (error) {
    errorHandler.handle(error as Error, { operation: 'processSale', saleData });
    return {
      success: false,
      sale: null,
      error: (error as Error).message,
      validation: null
    };
  }
}