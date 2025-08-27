// src/features/customers/logic/useCustomers.ts
import { useEffect, useState } from 'react';
import { 
  type Customer, 
  type CreateCustomerData,
  type UpdateCustomerData,
  type CustomerWithStats
} from '../types';
import { 
  fetchCustomers,
  fetchCustomersWithStats,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomerStats
} from '../services/customerApi';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersWithStats, setCustomersWithStats] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (e) {
      console.error('Error loading customers:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const loadCustomersWithStats = async () => {
    setLoadingStats(true);
    try {
      const data = await fetchCustomersWithStats();
      setCustomersWithStats(data);
    } catch (e) {
      console.error('Error loading customers with stats:', e);
      throw e;
    } finally {
      setLoadingStats(false);
    }
  };

  const addCustomer = async (customerData: CreateCustomerData): Promise<Customer> => {
    const newCustomer = await createCustomer(customerData);
    await loadCustomers();
    await loadCustomersWithStats(); // Refrescar también las stats
    return newCustomer;
  };

  const editCustomer = async (customerData: UpdateCustomerData): Promise<Customer> => {
    const updatedCustomer = await updateCustomer(customerData);
    await loadCustomers();
    await loadCustomersWithStats();
    return updatedCustomer;
  };

  const removeCustomer = async (id: string): Promise<void> => {
    await deleteCustomer(id);
    await loadCustomers();
    await loadCustomersWithStats();
  };

  useEffect(() => {
    loadCustomers();
    loadCustomersWithStats();
  }, []);

  return { 
    customers,
    customersWithStats,
    loading,
    loadingStats,
    addCustomer,
    editCustomer,
    removeCustomer,
    reloadCustomers: loadCustomers,
    reloadCustomersWithStats: loadCustomersWithStats
  };
}

export function useCustomerSearch() {
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const search = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setQuery('');
      return;
    }

    setLoading(true);
    setQuery(searchQuery);
    
    try {
      const results = await searchCustomers(searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error('Error searching customers:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setQuery('');
  };

  return {
    searchResults,
    loading,
    query,
    search,
    clearSearch
  };
}

export function useCustomerStats(customerId?: string) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async (id: string) => {
    setLoading(true);
    try {
      const data = await getCustomerStats(id);
      setStats(data);
    } catch (e) {
      console.error('Error loading customer stats:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      loadStats(customerId);
    }
  }, [customerId]);

  return {
    stats,
    loading,
    reloadStats: customerId ? () => loadStats(customerId) : undefined
  };
}