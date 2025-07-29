// src/features/sales/logic/useSales.ts
import { useEffect, useState } from 'react';
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

  const loadSales = async (newFilters?: SalesListFilters) => {
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
  };

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
  }, []);

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

export function useSalesData() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customersData, productsData] = await Promise.all([
        fetchCustomers(),
        fetchProductsWithAvailability()
      ]);
      
      setCustomers(customersData);
      setProducts(productsData);
    } catch (e) {
      console.error('Error loading sales data:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    customers,
    products,
    loading,
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