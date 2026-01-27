import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBrands, createBrand, updateBrand, deleteBrand } from '../services/brandsApi';
import type { BrandFormData } from '../types/brandTypes';
import { logger } from '@/lib/logging';

const BRANDS_QUERY_KEY = ['brands'];

/**
 * Hook to fetch all active brands
 */
export function useBrands() {
  return useQuery({
    queryKey: BRANDS_QUERY_KEY,
    queryFn: fetchBrands,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new brand
 */
export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
    },
    onError: (error) => {
      // Error ya se maneja en el componente con toast
      logger.error('Materials', 'Failed to create brand', error);
    },
  });
}

/**
 * Hook to update an existing brand
 */
export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrandFormData }) => updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
      logger.info('Materials', 'Brand updated, cache invalidated');
    },
    onError: (error) => {
      logger.error('Materials', 'Failed to update brand', error);
    },
  });
}

/**
 * Hook to delete a brand (soft delete)
 */
export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
      logger.info('Materials', 'Brand deleted, cache invalidated');
    },
    onError: (error) => {
      logger.error('Materials', 'Failed to delete brand', error);
    },
  });
}
