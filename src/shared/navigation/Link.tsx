import React, { useMemo } from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom';
import { useNavigationState } from '@/contexts/NavigationContext';

import { logger } from '@/lib/logging';
interface CustomLinkProps extends Omit<RouterLinkProps, 'to'> {
  moduleId: string;
  subPath?: string;
  query?: string;
}

/**
 * A custom Link component that integrates with the NavigationContext.
 * It uses a `moduleId` to construct the path, ensuring that navState
 * is consistent with the centralized route configuration.
 */
export function Link({ moduleId, subPath, query, ...props }: CustomLinkProps) {
  const navState = useNavigationState(); const { modules } = navState;

  const to = useMemo(() => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) {
      logger.warn('App', `[CustomLink] Module with id "${moduleId}" not found.`);
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
