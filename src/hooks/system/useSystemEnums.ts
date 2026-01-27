/**
 * SYSTEM ENUMS TANSTACK QUERY HOOKS
 * 
 * React Query hooks for system_enums management
 * Handles configurable enums for staff, products, assets, materials, loyalty
 * 
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  SystemEnum, 
  EnumType,
  CreateSystemEnumInput,
  UpdateSystemEnumInput
} from '@/pages/admin/core/settings/services/systemEnumsApi';
import * as systemEnumsApi from '@/pages/admin/core/settings/services/systemEnumsApi';
import { notify } from '@/shared/alerts';
import { logger } from '@/lib/logging';

// ============================================
// QUERY KEYS
// ============================================

export const systemEnumsKeys = {
  all: ['system-enums'] as const,
  enums: () => [...systemEnumsKeys.all, 'list'] as const,
  byType: (enumType: EnumType) => 
    [...systemEnumsKeys.enums(), 'type', enumType] as const,
  activeByType: (enumType: EnumType) => 
    [...systemEnumsKeys.byType(enumType), 'active'] as const,
  enum: (id: string) => [...systemEnumsKeys.enums(), id] as const,
  byKey: (enumType: EnumType, key: string) => 
    [...systemEnumsKeys.byType(enumType), 'key', key] as const,
  options: (enumType: EnumType) =>
    [...systemEnumsKeys.byType(enumType), 'options'] as const,
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all system enums
 */
export function useSystemEnums() {
  return useQuery({
    queryKey: systemEnumsKeys.enums(),
    queryFn: systemEnumsApi.fetchSystemEnums,
    staleTime: 10 * 60 * 1000, // 10 minutes (enums change rarely)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Fetch system enums by type
 */
export function useSystemEnumsByType(enumType: EnumType | undefined) {
  return useQuery({
    queryKey: enumType ? systemEnumsKeys.byType(enumType) : ['system-enums', 'list', 'type', 'null'],
    queryFn: () => {
      if (!enumType) throw new Error('No enum type provided');
      return systemEnumsApi.fetchSystemEnumsByType(enumType);
    },
    enabled: !!enumType,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch active system enums by type (for dropdowns)
 */
export function useActiveSystemEnumsByType(enumType: EnumType | undefined) {
  return useQuery({
    queryKey: enumType ? systemEnumsKeys.activeByType(enumType) : ['system-enums', 'list', 'type', 'null', 'active'],
    queryFn: () => {
      if (!enumType) throw new Error('No enum type provided');
      return systemEnumsApi.fetchActiveSystemEnumsByType(enumType);
    },
    enabled: !!enumType,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch single system enum by ID
 */
export function useSystemEnum(id: string | undefined) {
  return useQuery({
    queryKey: id ? systemEnumsKeys.enum(id) : ['system-enums', 'null'],
    queryFn: () => {
      if (!id) throw new Error('No enum ID provided');
      return systemEnumsApi.fetchSystemEnum(id);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch single system enum by type and key
 */
export function useSystemEnumByKey(enumType: EnumType | undefined, key: string | undefined) {
  return useQuery({
    queryKey: enumType && key 
      ? systemEnumsKeys.byKey(enumType, key) 
      : ['system-enums', 'list', 'type', enumType || 'null', 'key', key || 'null'],
    queryFn: () => {
      if (!enumType || !key) throw new Error('No enum type or key provided');
      return systemEnumsApi.fetchSystemEnumByKey(enumType, key);
    },
    enabled: !!enumType && !!key,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch enum options for dropdowns
 */
export function useEnumOptions(enumType: EnumType) {
  return useQuery({
    queryKey: systemEnumsKeys.options(enumType),
    queryFn: () => systemEnumsApi.getEnumOptions(enumType),
    staleTime: 15 * 60 * 1000, // 15 minutes for dropdown options
    gcTime: 30 * 60 * 1000,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create system enum
 */
export function useCreateSystemEnum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSystemEnumInput) => 
      systemEnumsApi.createSystemEnum(input),
    
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: systemEnumsKeys.enums() });
      queryClient.invalidateQueries({ 
        queryKey: systemEnumsKeys.byType(data.enum_type) 
      });
      queryClient.invalidateQueries({ 
        queryKey: systemEnumsKeys.options(data.enum_type) 
      });
      
      notify.success({
        title: 'Enum creado',
        description: `"${data.label}" fue creado exitosamente.`,
      });
      
      logger.info('SystemEnumsHooks', 'System enum created', { id: data.id });
    },
    
    onError: (error) => {
      notify.error({
        title: 'Error al crear',
        description: 'No se pudo crear el valor. Intenta nuevamente.',
      });
      
      logger.error('SystemEnumsHooks', 'Failed to create system enum', error);
    },
  });
}

/**
 * Update system enum
 */
export function useUpdateSystemEnum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSystemEnumInput }) =>
      systemEnumsApi.updateSystemEnum(id, data),
    
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: systemEnumsKeys.enum(id) });
      await queryClient.cancelQueries({ queryKey: systemEnumsKeys.enums() });

      // Snapshot previous value
      const previousEnum = queryClient.getQueryData(systemEnumsKeys.enum(id));
      const previousEnums = queryClient.getQueryData(systemEnumsKeys.enums());

      // Optimistically update
      queryClient.setQueryData<SystemEnum>(
        systemEnumsKeys.enum(id),
        (old) => old ? { ...old, ...data } : old
      );

      queryClient.setQueryData<SystemEnum[]>(
        systemEnumsKeys.enums(),
        (old) => old?.map(e => e.id === id ? { ...e, ...data } : e)
      );

      return { previousEnum, previousEnums };
    },
    
    onSuccess: (data) => {
      // Update cache with server response
      queryClient.setQueryData(systemEnumsKeys.enum(data.id), data);
      queryClient.invalidateQueries({ queryKey: systemEnumsKeys.enums() });
      queryClient.invalidateQueries({ 
        queryKey: systemEnumsKeys.byType(data.enum_type) 
      });
      queryClient.invalidateQueries({ 
        queryKey: systemEnumsKeys.options(data.enum_type) 
      });
      
      notify.success({
        title: 'Enum actualizado',
        description: `"${data.label}" fue actualizado exitosamente.`,
      });
      
      logger.info('SystemEnumsHooks', 'System enum updated', { id: data.id });
    },
    
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousEnum) {
        queryClient.setQueryData(systemEnumsKeys.enum(variables.id), context.previousEnum);
      }
      if (context?.previousEnums) {
        queryClient.setQueryData(systemEnumsKeys.enums(), context.previousEnums);
      }
      
      notify.error({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar el valor. Intenta nuevamente.',
      });
      
      logger.error('SystemEnumsHooks', 'Failed to update system enum', error);
    },
  });
}

/**
 * Toggle system enum active status
 */
export function useToggleSystemEnum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      systemEnumsApi.toggleSystemEnum(id, active),
    
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: systemEnumsKeys.enum(id) });
      await queryClient.cancelQueries({ queryKey: systemEnumsKeys.enums() });

      const previousEnum = queryClient.getQueryData(systemEnumsKeys.enum(id));
      const previousEnums = queryClient.getQueryData(systemEnumsKeys.enums());

      // Optimistic update
      queryClient.setQueryData<SystemEnum>(
        systemEnumsKeys.enum(id),
        (old) => old ? { ...old, is_active: active } : old
      );

      queryClient.setQueryData<SystemEnum[]>(
        systemEnumsKeys.enums(),
        (old) => old?.map(e => e.id === id ? { ...e, is_active: active } : e)
      );

      return { previousEnum, previousEnums };
    },
    
    onSuccess: (data) => {
      queryClient.setQueryData(systemEnumsKeys.enum(data.id), data);
      queryClient.invalidateQueries({ queryKey: systemEnumsKeys.enums() });
      queryClient.invalidateQueries({ 
        queryKey: systemEnumsKeys.byType(data.enum_type) 
      });
      queryClient.invalidateQueries({ 
        queryKey: systemEnumsKeys.activeByType(data.enum_type) 
      });
      queryClient.invalidateQueries({ 
        queryKey: systemEnumsKeys.options(data.enum_type) 
      });
      
      notify.success({
        title: data.is_active ? 'Enum activado' : 'Enum desactivado',
        description: `"${data.label}" fue ${data.is_active ? 'activado' : 'desactivado'}.`,
      });
      
      logger.info('SystemEnumsHooks', 'System enum toggled', { 
        id: data.id, 
        isActive: data.is_active 
      });
    },
    
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousEnum) {
        queryClient.setQueryData(systemEnumsKeys.enum(variables.id), context.previousEnum);
      }
      if (context?.previousEnums) {
        queryClient.setQueryData(systemEnumsKeys.enums(), context.previousEnums);
      }
      
      notify.error({
        title: 'Error al cambiar estado',
        description: 'No se pudo cambiar el estado. Intenta nuevamente.',
      });
      
      logger.error('SystemEnumsHooks', 'Failed to toggle system enum', error);
    },
  });
}

/**
 * Delete system enum (prevents deletion of system enums)
 */
export function useDeleteSystemEnum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return systemEnumsApi.deleteSystemEnum(id);
    },
    
    onMutate: async (id) => {
      // Check if enum is system before attempting delete
      const allEnums = queryClient.getQueryData<SystemEnum[]>(systemEnumsKeys.enums());
      const enumToDelete = allEnums?.find(e => e.id === id);
      
      if (enumToDelete?.is_system) {
        throw new Error('No se pueden eliminar valores del sistema. Desactívalos en su lugar.');
      }
      
      await queryClient.cancelQueries({ queryKey: systemEnumsKeys.enums() });

      const previousEnums = queryClient.getQueryData(systemEnumsKeys.enums());

      // Optimistic delete (only if not system)
      queryClient.setQueryData<SystemEnum[]>(
        systemEnumsKeys.enums(),
        (old) => old?.filter(e => e.id !== id)
      );

      return { previousEnums };
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemEnumsKeys.enums() });
      
      notify.success({
        title: 'Enum eliminado',
        description: 'El valor fue eliminado exitosamente.',
      });
      
      logger.info('SystemEnumsHooks', 'System enum deleted');
    },
    
    onError: (error: any, id, context) => {
      if (context?.previousEnums) {
        queryClient.setQueryData(systemEnumsKeys.enums(), context.previousEnums);
      }
      
      notify.error({
        title: 'Error al eliminar',
        description: error.message || 'No se pudo eliminar el valor. Intenta nuevamente.',
      });
      
      logger.error('SystemEnumsHooks', 'Failed to delete system enum', error);
    },
  });
}

/**
 * Reorder system enums
 */
export function useReorderSystemEnums() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enumType, orderedIds }: { enumType: EnumType; orderedIds: string[] }) =>
      systemEnumsApi.reorderSystemEnums(enumType, orderedIds),
    
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: systemEnumsKeys.byType(variables.enumType) 
      });
      
      notify.success({
        title: 'Orden actualizado',
        description: 'El orden fue actualizado exitosamente.',
      });
      
      logger.info('SystemEnumsHooks', 'System enums reordered', { 
        type: variables.enumType 
      });
    },
    
    onError: (error) => {
      notify.error({
        title: 'Error al reordenar',
        description: 'No se pudo actualizar el orden. Intenta nuevamente.',
      });
      
      logger.error('SystemEnumsHooks', 'Failed to reorder system enums', error);
    },
  });
}
