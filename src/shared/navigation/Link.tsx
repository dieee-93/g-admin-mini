import React, { useMemo } from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom';
import { useNavigation } from '@/contexts/NavigationContext';

interface CustomLinkProps extends Omit<RouterLinkProps, 'to'> {
  moduleId: string;
  subPath?: string;
  query?: string;
}

/**
 * A custom Link component that integrates with the NavigationContext.
 * It uses a `moduleId` to construct the path, ensuring that navigation
 * is consistent with the centralized route configuration.
 */
export function Link({ moduleId, subPath, query, ...props }: CustomLinkProps) {
  const { modules } = useNavigation();

  const to = useMemo(() => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) {
      console.warn(`[CustomLink] Module with id "${moduleId}" not found.`);
      return '#'; // Fallback for invalid module
    }
    let path = subPath ? `${module.path}${subPath}` : module.path;
    if (query) {
      path += `?${query.replace(/^\?/, '')}`;
    }
    return path;
  }, [modules, moduleId, subPath, query]);

  return <RouterLink to={to} {...props} />;
}
