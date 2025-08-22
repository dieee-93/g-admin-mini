// src/features/sales/logic/useSales.ts - ESQUEMA NORMALIZADO
import { useEffect, useState, useCallback } from 'react';
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
import { 
  fetchSales,
  deleteSale,
  validateSaleStock,
  processSale,
  getSalesSummary,
  fetchCustomers,
  fetchProductsWithAvailability,
  getCustomerPurchases
} from '../data/saleApi';

export function useSales(initialFilters?: SalesListFilters) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SalesListFilters>(initialFilters || {});

  const loadSales = useCallback(async (newFilters?: SalesListFilters) => {
    setLoading(true);
    try {
      const appliedFilters = newFilters || filters;
      const data = await fetchSales(appliedFilters);
      setSales(data);
      if (newFilters) {
        setFilters(newFilters);
      }
    } catch (e) {
      console.error('Error loading sales:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const removeSale = async (id: string): Promise<void> => {
    await deleteSale(id);
    await loadSales();
  };

  const applyFilters = async (newFilters: SalesListFilters) => {
    await loadSales(newFilters);
  };

  const clearFilters = async () => {
    await loadSales({});
  };

  useEffect(() => {
    loadSales();
  }, []); // Solo ejecutar una vez al montar

  return { 
    sales,
    loading,
    filters,
    removeSale,
    reloadSales: loadSales,
    applyFilters,
    clearFilters
  };
}

export function useSaleOperations() {
  const [loading, setLoading] = useState(false);

  const validateStock = async (items: { product_id: string; quantity: number }[]): Promise<SaleValidation> => {
    setLoading(true);
    try {
      return await validateSaleStock(items);
    } catch (e) {
      console.error('Error validating sale stock:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (saleData: CreateSaleData): Promise<SaleProcessResult> => {
    setLoading(true);
    try {
      return await processSale(saleData);
    } catch (e) {
      console.error('Error processing sale:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    validateStock,
    createSale
  };
}

// ✅ Hook limpio y funcional para esquema normalizado
export function useSalesData() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [customersData, productsData] = await Promise.allSettled([
        fetchCustomers(),
        fetchProductsWithAvailability()
      ]);
      
      // Manejar customers
      if (customersData.status === 'fulfilled') {
        setCustomers(customersData.value);
      } else {
        console.error('Error loading customers:', customersData.reason);
        setCustomers([]); // Fallback
      }

      // Manejar products - ✅ Ahora debe funcionar correctamente
      if (productsData.status === 'fulfilled') {
        setProducts(productsData.value);
      } else {
        console.error('Error loading products:', productsData.reason);
        setError('Error cargando productos.');
        
        // Fallback: consulta simple
        try {
          const { data: fallbackProducts, error: fallbackError } = await supabase
            .from('products')
            .select('id, name, unit, type, description, created_at') // ✅ Ahora existen estas columnas
            .order('created_at', { ascending: false });
          
          if (fallbackError) throw fallbackError;
          
          // Mapear a estructura esperada
          const mappedProducts = (fallbackProducts || []).map(product => ({
            ...product,
            availability: 0, // Sin disponibilidad calculada
            cost: 0 // Sin costo calculado
          }));
          
          setProducts(mappedProducts);
        } catch (fallbackErr) {
          console.error('Fallback también falló:', fallbackErr);
          setProducts([]); // Array vacío como último recurso
        }
      }
    } catch (e) {
      console.error('Error loading sales data:', e);
      setError('Error general cargando datos');
      // Asegurar que siempre tengamos arrays
      setCustomers([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias para evitar loops

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    customers,
    products,
    loading,
    error,
    reloadData: loadData
  };
}

export function useSalesAnalytics() {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSummary = async (dateFrom: string, dateTo: string) => {
    setLoading(true);
    try {
      const data = await getSalesSummary(dateFrom, dateTo);
      setSummary(data);
    } catch (e) {
      console.error('Error loading sales summary:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const getCustomerHistory = async (customerId: string): Promise<Sale[]> => {
    setLoading(true);
    try {
      return await getCustomerPurchases(customerId);
    } catch (e) {
      console.error('Error loading customer purchases:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    summary,
    loading,
    loadSummary,
    getCustomerHistory
  };
}