/**
 * Generic Data Fetcher Hook
 * Consolidates patterns from useCustomers, useMaterials, useProducts
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { notify } from '@/lib/notifications';

interface DataFetcherConfig<T> {
  fetchFn: () => Promise<T[]>;
  module: string;
  dependencies?: unknown[];
  autoLoad?: boolean;
}

interface SearchConfig<T> {
  searchFn: (query: string) => Promise<T[]>;
  minQueryLength?: number;
}

export function useDataFetcher<T>({
  fetchFn,
  module,
  dependencies = [],
  autoLoad = true
}: DataFetcherConfig<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid dependencies changing on every render
  const fetchFnRef = useRef(fetchFn);
  const moduleRef = useRef(module);

  // Update refs when props change
  useEffect(() => {
    fetchFnRef.current = fetchFn;
    moduleRef.current = module;
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFnRef.current();
      setData(result);
    } catch (err) {
      const errorMessage = `Error cargando ${moduleRef.current}`;
      setError(errorMessage);
      notify.error({ title: 'ERROR', description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load on mount only
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh,
    reload: loadData
  };
}

// Search functionality as separate hook
export function useDataSearch<T>({
  searchFn,
  minQueryLength = 2
}: SearchConfig<T>) {
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [query, setQuery] = useState('');

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setSearchResults([]);
      setQuery('');
      return;
    }

    setSearchLoading(true);
    setQuery(searchQuery);

    try {
      const results = await searchFn(searchQuery);
      setSearchResults(results);
    } catch (err) {
      notify.error({ title: 'ERROR', description: 'Error en la búsqueda' });
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchFn, minQueryLength]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setQuery('');
    setSearchLoading(false);
  }, []);

  return {
    searchResults,
    loading: searchLoading,
    query,
    search,
    clearSearch
  };
}