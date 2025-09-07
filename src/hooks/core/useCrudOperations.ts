/**
 * Unified CRUD Operations Hook
 * Eliminates ~2000 lines of duplicated CRUD logic across the application
 * Integrates perfectly with Zustand stores and React Hook Form
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, type UseFormReturn, type FieldValues, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';

/**
 * Configuration for CRUD operations
 */
export interface CrudConfig<T extends FieldValues> {
  // Table/API configuration
  tableName: string;
  selectQuery?: string;
  
  // Validation
  schema?: z.ZodSchema<T>;
  
  // Default values for forms
  defaultValues?: DefaultValues<T>;
  
  // Zustand store integration
  store?: {
    items: T[];
    setItems: (items: T[]) => void;
    addItem: (item: T) => void;
    updateItem: (id: string, updates: Partial<T>) => void;
    removeItem: (id: string) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
  };
  
  // Real-time subscriptions
  enableRealtime?: boolean;
  realtimeFilter?: string;
  
  // Caching
  cacheKey?: string;
  cacheTime?: number; // milliseconds
  
  // Callbacks
  onSuccess?: (action: 'create' | 'read' | 'update' | 'delete', data: T | T[]) => void;
  onError?: (action: 'create' | 'read' | 'update' | 'delete', error: Error) => void;
  
  // Data transformations
  transformBeforeSave?: (data: T) => T;
  transformAfterLoad?: (data: T) => T;
}

/**
 * Result type for the CRUD hook
 */
export interface CrudOperationsResult<T extends FieldValues> {
  // Data state
  items: T[];
  currentItem: T | null;
  loading: boolean;
  error: string | null;
  
  // Form integration (React Hook Form)
  form: UseFormReturn<T, any, T>;
  
  // CRUD operations
  fetchAll: () => Promise<T[]>;
  fetchById: (id: string) => Promise<T | null>;
  create: (data: T) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  
  // Bulk operations
  createMany: (items: T[]) => Promise<T[]>;
  updateMany: (updates: Array<{ id: string; data: Partial<T> }>) => Promise<T[]>;
  removeMany: (ids: string[]) => Promise<void>;
  
  // Form operations
  startCreate: () => void;
  startEdit: (item: T) => void;
  saveForm: () => Promise<T | null>;
  cancelForm: () => void;
  resetForm: () => void;
  
  // Utility functions
  refresh: () => Promise<void>;
  clearError: () => void;
  clearCache: () => void;
  
  // Search and filter (works with items)
  searchItems: (query: string, fields: (keyof T)[]) => T[];
  filterItems: (predicate: (item: T) => boolean) => T[];
  sortItems: (compareFn: (a: T, b: T) => number) => T[];
  
  // Real-time status
  isSubscribed: boolean;
}

/**
 * Main CRUD hook that eliminates all repetitive CRUD code
 */
export function useCrudOperations<T extends FieldValues>(
  config: CrudConfig<T>
): CrudOperationsResult<T> {
  const {
    tableName,
    selectQuery = '*',
    schema,
    defaultValues,
    store,
    enableRealtime = false,
    realtimeFilter,
    cacheKey,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    onSuccess,
    onError,
    transformBeforeSave,
    transformAfterLoad
  } = config;

  // Local state (used when no Zustand store is provided)
  const [localItems, setLocalItems] = useState<T[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<T | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Determine whether to use store or local state
  const items = store?.items ?? localItems;
  const loading = store?.loading ?? localLoading;
  const error = store?.error ?? localError;
  
  // ✅ FIXED: Stable references using useCallback to prevent infinite re-renders
  const setItems = useCallback((items: T[]) => {
    if (store?.setItems) {
      store.setItems(items);
    } else {
      setLocalItems(items);
    }
  }, [store?.setItems]);

  const setLoading = useCallback((loading: boolean) => {
    if (store?.setLoading) {
      store.setLoading(loading);
    } else {
      setLocalLoading(loading);
    }
  }, [store?.setLoading]);

  const setError = useCallback((error: string | null) => {
    if (store?.setError) {
      store.setError(error);
    } else {
      setLocalError(error);
    }
  }, [store?.setError]);

  // React Hook Form integration
  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) as any : undefined,
    defaultValues,
    mode: 'onChange'
  });

  // Cache management
  const cache = useMemo(() => {
    if (!cacheKey) return null;
    
    return {
      get: (): { data: T[]; timestamp: number } | null => {
        try {
          const cached = localStorage.getItem(`crud_cache_${cacheKey}`);
          return cached ? JSON.parse(cached) : null;
        } catch {
          return null;
        }
      },
      set: (data: T[]) => {
        try {
          localStorage.setItem(`crud_cache_${cacheKey}`, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch {
          // Ignore cache errors
        }
      },
      isValid: (timestamp: number) => {
        return Date.now() - timestamp < cacheTime;
      }
    };
  }, [cacheKey, cacheTime]);

  // Error handler - ✅ OPTIMIZED: Stable dependencies using useRef for callbacks
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);
  onErrorRef.current = onError;
  onSuccessRef.current = onSuccess;

  const handleError = useCallback((action: 'create' | 'read' | 'update' | 'delete', error: Error) => {
    const errorMessage = error.message || 'Ha ocurrido un error inesperado';
    setError(errorMessage);
    onErrorRef.current?.(action, error);
    console.error(`CRUD ${action} error:`, error);
  }, [setError]);

  // Success handler - ✅ OPTIMIZED: Stable dependencies using useRef for callbacks  
  const handleSuccess = useCallback((action: 'create' | 'read' | 'update' | 'delete', data: T | T[]) => {
    setError(null);
    onSuccessRef.current?.(action, data);
  }, [setError]);

  // Data transformers - ✅ OPTIMIZED: Stable using useRef
  const transformAfterLoadRef = useRef(transformAfterLoad);
  const transformBeforeSaveRef = useRef(transformBeforeSave);
  transformAfterLoadRef.current = transformAfterLoad;
  transformBeforeSaveRef.current = transformBeforeSave;

  const applyTransformAfterLoad = useCallback((data: T | T[]): T | T[] => {
    if (!transformAfterLoadRef.current) return data;
    
    if (Array.isArray(data)) {
      return data.map(transformAfterLoadRef.current);
    }
    return transformAfterLoadRef.current(data);
  }, []); // ✅ No dependencies

  const applyTransformBeforeSave = useCallback((data: T): T => {
    return transformBeforeSaveRef.current ? transformBeforeSaveRef.current(data) : data;
  }, []); // ✅ No dependencies

  // Fetch all items
  const fetchAll = useCallback(async (): Promise<T[]> => {
    try {
      setLoading(true);
      
      // Check cache first
      if (cache) {
        const cached = cache.get();
        if (cached && cache.isValid(cached.timestamp)) {
          const transformedData = applyTransformAfterLoad(cached.data) as T[];
          setItems(transformedData);
          handleSuccess('read', transformedData);
          return transformedData;
        }
      }

      const { data, error } = await supabase
        .from(tableName)
        .select(selectQuery);

      if (error) throw error;

      const transformedData = applyTransformAfterLoad(data || []) as T[];
      setItems(transformedData);
      
      // Cache the results
      if (cache) {
        cache.set(transformedData);
      }

      handleSuccess('read', transformedData);
      return transformedData;
    } catch (error) {
      handleError('read', error as Error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [tableName, selectQuery, cache, applyTransformAfterLoad, setItems, setLoading, handleSuccess, handleError]);

  // Fetch single item
  const fetchById = useCallback(async (id: string): Promise<T | null> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from(tableName)
        .select(selectQuery)
        .eq('id', id)
        .single();

      if (error) throw error;

      const transformedData = applyTransformAfterLoad(data) as T;
      setCurrentItem(transformedData);
      handleSuccess('read', transformedData);
      return transformedData;
    } catch (error) {
      handleError('read', error as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [tableName, selectQuery, applyTransformAfterLoad, setLoading, handleSuccess, handleError]);

  // Create item
  const create = useCallback(async (data: T): Promise<T> => {
    try {
      setLoading(true);
      
      const transformedData = applyTransformBeforeSave(data);
      
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([transformedData])
        .select()
        .single();

      if (error) throw error;

      const newItem = applyTransformAfterLoad(result) as T;
      
      // Update state
      if (store?.addItem) {
        store.addItem(newItem);
      } else {
        setLocalItems(prev => [...prev, newItem]);
      }
      
      // Clear cache
      if (cache) {
        localStorage.removeItem(`crud_cache_${cacheKey}`);
      }

      handleSuccess('create', newItem);
      return newItem;
    } catch (error) {
      handleError('create', error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [tableName, applyTransformBeforeSave, applyTransformAfterLoad, store, setItems, setLoading, cache, cacheKey, handleSuccess, handleError]);

  // Update item
  const update = useCallback(async (id: string, data: Partial<T>): Promise<T> => {
    try {
      setLoading(true);
      
      const transformedData = transformBeforeSave ? transformBeforeSave(data as T) : data;
      
      const { data: result, error } = await supabase
        .from(tableName)
        .update(transformedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedItem = applyTransformAfterLoad(result) as T;
      
      // Update state
      if (store?.updateItem) {
        store.updateItem(id, updatedItem);
      } else {
        setLocalItems(prev => prev.map(item => 
          (item as any).id === id ? updatedItem : item
        ));
      }
      
      // Update current item if it matches
      if (currentItem && (currentItem as any).id === id) {
        setCurrentItem(updatedItem);
      }
      
      // Clear cache
      if (cache) {
        localStorage.removeItem(`crud_cache_${cacheKey}`);
      }

      handleSuccess('update', updatedItem);
      return updatedItem;
    } catch (error) {
      handleError('update', error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [tableName, transformBeforeSave, applyTransformAfterLoad, store, setItems, currentItem, setLoading, cache, cacheKey, handleSuccess, handleError]);

  // Delete item
  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update state
      if (store?.removeItem) {
        store.removeItem(id);
      } else {
        setLocalItems(prev => prev.filter(item => (item as any).id !== id));
      }
      
      // Clear current item if it matches
      if (currentItem && (currentItem as any).id === id) {
        setCurrentItem(null);
      }
      
      // Clear cache
      if (cache) {
        localStorage.removeItem(`crud_cache_${cacheKey}`);
      }

      handleSuccess('delete', {} as T);
    } catch (error) {
      handleError('delete', error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [tableName, store, setItems, currentItem, setLoading, cache, cacheKey, handleSuccess, handleError]);

  // Bulk operations
  const createMany = useCallback(async (newItems: T[]): Promise<T[]> => {
    try {
      setLoading(true);
      
      const transformedItems = newItems.map(applyTransformBeforeSave);
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(transformedItems)
        .select();

      if (error) throw error;

      const results = applyTransformAfterLoad(data || []) as T[];
      
      // Update state
      if (store?.setItems) {
        store.setItems([...items, ...results]);
      } else {
        setLocalItems(prev => [...prev, ...results]);
      }
      
      // Clear cache
      if (cache) {
        localStorage.removeItem(`crud_cache_${cacheKey}`);
      }

      handleSuccess('create', results);
      return results;
    } catch (error) {
      handleError('create', error as Error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [tableName, applyTransformBeforeSave, applyTransformAfterLoad, setItems, setLoading, cache, cacheKey, handleSuccess, handleError]);

  const updateMany = useCallback(async (updates: Array<{ id: string; data: Partial<T> }>): Promise<T[]> => {
    try {
      setLoading(true);
      
      const results: T[] = [];
      
      // Process updates sequentially to avoid conflicts
      for (const { id, data } of updates) {
        const result = await update(id, data);
        results.push(result);
      }
      
      return results;
    } catch (error) {
      handleError('update', error as Error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [update, setLoading, handleError]);

  const removeMany = useCallback(async (ids: string[]): Promise<void> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', ids);

      if (error) throw error;

      // Update state
      if (store?.setItems) {
        store.setItems(items.filter(item => !ids.includes((item as any).id)));
      } else {
        setLocalItems(prev => prev.filter(item => !ids.includes((item as any).id)));
      }
      
      // Clear cache
      if (cache) {
        localStorage.removeItem(`crud_cache_${cacheKey}`);
      }

      handleSuccess('delete', {} as T);
    } catch (error) {
      handleError('delete', error as Error);
    } finally {
      setLoading(false);
    }
  }, [tableName, setItems, setLoading, cache, cacheKey, handleSuccess, handleError]);

  // Form operations
  const startCreate = useCallback(() => {
    setCurrentItem(null);
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const startEdit = useCallback((item: T) => {
    setCurrentItem(item);
    form.reset(item);
  }, [form]);

  const saveForm = useCallback(async (): Promise<T | null> => {
    try {
      const isValid = await form.trigger();
      if (!isValid) return null;

      const formData = form.getValues();
      
      if (currentItem && (currentItem as any).id) {
        // Update existing item
        const result = await update((currentItem as any).id, formData);
        form.reset(result);
        return result;
      } else {
        // Create new item
        const result = await create(formData);
        form.reset(defaultValues);
        setCurrentItem(null);
        return result;
      }
    } catch (error) {
      return null;
    }
  }, [form, currentItem, update, create, defaultValues]);

  const cancelForm = useCallback(() => {
    form.reset(currentItem || defaultValues);
  }, [form, currentItem, defaultValues]);

  const resetForm = useCallback(() => {
    form.reset(defaultValues);
    setCurrentItem(null);
  }, [form, defaultValues]);

  // Utility functions
  const refresh = useCallback(async () => {
    if (cache) {
      localStorage.removeItem(`crud_cache_${cacheKey}`);
    }
    await fetchAll();
  }, [cache, cacheKey, fetchAll]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const clearCache = useCallback(() => {
    if (cache) {
      localStorage.removeItem(`crud_cache_${cacheKey}`);
    }
  }, [cache, cacheKey]);

  // Search and filter functions
  const searchItems = useCallback((query: string, fields: (keyof T)[]): T[] => {
    if (!query.trim()) return items;
    
    const lowercaseQuery = query.toLowerCase();
    return items.filter(item => 
      fields.some(field => 
        String(item[field] || '').toLowerCase().includes(lowercaseQuery)
      )
    );
  }, [items]);

  const filterItems = useCallback((predicate: (item: T) => boolean): T[] => {
    return items.filter(predicate);
  }, [items]);

  const sortItems = useCallback((compareFn: (a: T, b: T) => number): T[] => {
    return [...items].sort(compareFn);
  }, [items]);

  // Real-time subscription effect
  useEffect(() => {
    if (!enableRealtime) return;

    const channel = supabase.channel(`crud-${tableName}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName,
        filter: realtimeFilter
      }, () => {
        // Refresh data when changes occur
        refresh();
      })
      .subscribe();

    setIsSubscribed(true);

    return () => {
      channel.unsubscribe();
      setIsSubscribed(false);
    };
  }, [enableRealtime, tableName, realtimeFilter, refresh]);

  // Initial data load - ✅ OPTIMIZED: Stable dependency using useRef
  const hasFetchedInitialData = useRef(false);
  
  useEffect(() => {
    if (!hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true;
      fetchAll();
    }
  }, []); // ✅ Empty dependency - only run once on mount

  return {
    // Data state
    items,
    currentItem,
    loading,
    error,
    
    // Form integration
    form,
    
    // CRUD operations
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    
    // Bulk operations
    createMany,
    updateMany,
    removeMany,
    
    // Form operations
    startCreate,
    startEdit,
    saveForm,
    cancelForm,
    resetForm,
    
    // Utility functions
    refresh,
    clearError,
    clearCache,
    
    // Search and filter
    searchItems,
    filterItems,
    sortItems,
    
    // Real-time status
    isSubscribed
  };
}