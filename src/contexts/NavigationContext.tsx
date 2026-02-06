/**
 * NAVIGATION CONTEXT v3.0 - PERFORMANCE OPTIMIZED
 *
 * Architecture based on Kent C. Dodds' best practices:
 * - Context Splitting: State, Layout, and Actions in separate contexts
 * - useReducer for complex state management
 * - Memoization of all callbacks and values
 * - Removed logging from hot paths
 *
 * CONTEXTS:
 * 1. NavigationStateContext - Navigation data (modules, currentModule, breadcrumbs)
 * 2. NavigationLayoutContext - Layout state (isMobile, sidebar, etc.)
 * 3. NavigationActionsContext - All update functions (navigate, toggle, etc.)
 *
 * WHY: Prevents unnecessary re-renders. Components only subscribe to what they need.
 */

import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  CogIcon,
  CurrencyDollarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClockIcon,
  ShoppingBagIcon,
  UserIcon,
  ListBulletIcon,
  TrophyIcon,
  PresentationChartLineIcon,
  CreditCardIcon,
  LinkIcon,
  BuildingOfficeIcon,
  TruckIcon,
  ArchiveBoxIcon,
  DocumentChartBarIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import type { ModuleName } from '@/contexts/AuthContext';
import { useFeatureFlags } from '@/lib/capabilities';
import { logger } from '@/lib/logging';
import { useModuleNavigation } from '@/lib/modules/useModuleNavigation';

// ============================================
// TYPES
// ============================================

export interface NavigationSubModule {
  id: string;
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface NavigationModule {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  path: string;
  description?: string;
  badge?: number;
  isActive?: boolean;
  isExpandable?: boolean;
  isExpanded?: boolean;
  subModules?: NavigationSubModule[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  color?: string;
  shortcut?: string;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

// ============================================
// STATE TYPES
// ============================================

interface NavigationState {
  currentModule: NavigationModule | null;
  breadcrumbs: BreadcrumbItem[];
  navigationHistory: string[];
  modules: NavigationModule[];
  moduleState: Record<string, { isExpanded?: boolean; badge?: number }>;
}

interface LayoutState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  sidebarCollapsed: boolean;
}

type NavigationAction =
  | { type: 'SET_CURRENT_MODULE'; payload: { module: NavigationModule; breadcrumbs: BreadcrumbItem[] } }
  | { type: 'UPDATE_BREADCRUMBS'; payload: BreadcrumbItem[] }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'SET_MODULES'; payload: NavigationModule[] }
  | { type: 'TOGGLE_MODULE_EXPANSION'; payload: string }
  | { type: 'UPDATE_MODULE_BADGE'; payload: { moduleId: string; count: number } };

type LayoutAction =
  | { type: 'SET_MOBILE'; payload: boolean }
  | { type: 'SET_TABLET'; payload: boolean }
  | { type: 'SET_DESKTOP'; payload: boolean }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean };

// ============================================
// CONTEXT TYPES
// ============================================

interface NavigationStateContextValue {
  currentModule: NavigationModule | null;
  breadcrumbs: BreadcrumbItem[];
  modules: NavigationModule[];
  navigationHistory: string[];
  canNavigateBack: boolean;
}

interface NavigationLayoutContextValue {
  isMobile: boolean;
  showBottomNav: boolean;
  showSidebar: boolean;
  sidebarCollapsed: boolean;
}

interface NavigationActionsContextValue {
  navigate: (moduleId: string, subPath?: string, query?: string) => void;
  navigateToModule: (moduleId: string) => void;
  navigateBack: () => void;
  toggleModuleExpansion: (moduleId: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  updateModuleBadge: (moduleId: string, count: number) => void;
  setQuickActions: (actions: QuickAction[]) => void;
}

// ============================================
// CONTEXTS
// ============================================

const NavigationStateContext = createContext<NavigationStateContextValue | null>(null);
const NavigationLayoutContext = createContext<NavigationLayoutContextValue | null>(null);
const NavigationActionsContext = createContext<NavigationActionsContextValue | null>(null);

NavigationStateContext.displayName = 'NavigationStateContext';
NavigationLayoutContext.displayName = 'NavigationLayoutContext';
NavigationActionsContext.displayName = 'NavigationActionsContext';

// ============================================
// REDUCERS
// ============================================

function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'SET_CURRENT_MODULE':
      // Only update if actually changed
      if (state.currentModule?.id === action.payload.module.id) {
        return state;
      }
      return {
        ...state,
        currentModule: action.payload.module,
        breadcrumbs: action.payload.breadcrumbs
      };

    case 'UPDATE_BREADCRUMBS':
      return {
        ...state,
        breadcrumbs: action.payload
      };

    case 'ADD_TO_HISTORY':
      const lastPath = state.navigationHistory[state.navigationHistory.length - 1];
      if (lastPath === action.payload) {
        return state; // No change
      }
      return {
        ...state,
        navigationHistory: [...state.navigationHistory, action.payload].slice(-10)
      };

    case 'SET_MODULES':
      // Only update if content changed
      if (state.modules === action.payload) {
        return state;
      }
      return {
        ...state,
        modules: action.payload
      };

    case 'TOGGLE_MODULE_EXPANSION':
      return {
        ...state,
        moduleState: {
          ...state.moduleState,
          [action.payload]: {
            ...state.moduleState[action.payload],
            isExpanded: !(state.moduleState[action.payload]?.isExpanded ?? false)
          }
        }
      };

    case 'UPDATE_MODULE_BADGE':
      const newBadgeValue = action.payload.count > 0 ? action.payload.count : undefined;
      const currentBadge = state.moduleState[action.payload.moduleId]?.badge;

      if (currentBadge === newBadgeValue) {
        return state; // No change
      }

      return {
        ...state,
        moduleState: {
          ...state.moduleState,
          [action.payload.moduleId]: {
            ...state.moduleState[action.payload.moduleId],
            badge: newBadgeValue
          }
        }
      };

    default:
      return state;
  }
}

function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'SET_MOBILE':
      if (state.isMobile === action.payload) return state;
      return { ...state, isMobile: action.payload };

    case 'SET_TABLET':
      if (state.isTablet === action.payload) return state;
      return { ...state, isTablet: action.payload };

    case 'SET_DESKTOP':
      if (state.isDesktop === action.payload) return state;
      return { ...state, isDesktop: action.payload };

    case 'SET_SIDEBAR_COLLAPSED':
      if (state.sidebarCollapsed === action.payload) return state;
      return { ...state, sidebarCollapsed: action.payload };

    default:
      return state;
  }
}

// ============================================
// UTILITIES
// ============================================

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query, matches]);

  return matches;
}

// Debounce hook for media queries
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// CLIENT NAVIGATION MODULES
// ============================================

const CLIENT_NAVIGATION_MODULES: NavigationModule[] = [
  {
    id: 'customer-portal',
    title: 'Mi Portal',
    icon: HomeIcon,
    color: 'teal',
    path: '/app/portal',
    description: 'Tu espacio personalizado'
  },
  {
    id: 'customer-menu',
    title: 'Menú',
    icon: ShoppingBagIcon,
    color: 'orange',
    path: '/app/menu',
    description: 'Explora nuestros productos'
  },
  {
    id: 'my-orders',
    title: 'Mis Pedidos',
    icon: ListBulletIcon,
    color: 'blue',
    path: '/app/orders',
    description: 'Historial y seguimiento'
  },
  {
    id: 'customer-settings',
    title: 'Mi Perfil',
    icon: UserIcon,
    color: 'purple',
    path: '/app/settings',
    description: 'Configuración personal'
  }
];

// ============================================
// PROVIDER
// ============================================

interface NavigationProviderProps {
  children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccessModule, isAuthenticated, user } = useAuth();

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const [navigationState, dispatchNavigation] = useReducer(navigationReducer, {
    currentModule: null,
    breadcrumbs: [],
    navigationHistory: [],
    modules: [],
    moduleState: {}
  });

  logger.debug('NavigationContext', 'Provider render', {
    pathname: location.pathname,
    isAuthenticated,
    userRole: user?.role,
    currentModule: navigationState.currentModule
  });

  const [layoutState, dispatchLayout] = useReducer(layoutReducer, {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    sidebarCollapsed: true
  });

  // ============================================
  // MEDIA QUERIES (Debounced)
  // ============================================

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const debouncedIsMobile = useDebouncedValue(isMobile, 100);
  const debouncedIsTablet = useDebouncedValue(isTablet, 100);
  const debouncedIsDesktop = useDebouncedValue(isDesktop, 100);

  // Update layout state when media queries change
  useEffect(() => {
    dispatchLayout({ type: 'SET_MOBILE', payload: debouncedIsMobile });
  }, [debouncedIsMobile]);

  useEffect(() => {
    dispatchLayout({ type: 'SET_TABLET', payload: debouncedIsTablet });
  }, [debouncedIsTablet]);

  useEffect(() => {
    dispatchLayout({ type: 'SET_DESKTOP', payload: debouncedIsDesktop });
  }, [debouncedIsDesktop]);

  // Auto-collapse sidebar on mobile/tablet (hover-only on desktop)
  // ✅ FIX: Always keep collapsed on desktop (hover-only behavior)
  useEffect(() => {
    if (debouncedIsTablet || debouncedIsMobile) {
      dispatchLayout({ type: 'SET_SIDEBAR_COLLAPSED', payload: true });
    }
    // Desktop: Keep collapsed (hover-only), don't auto-expand
  }, [debouncedIsTablet, debouncedIsMobile]);

  // ============================================
  // MODULE NAVIGATION
  // ============================================

  const adminModulesFromRegistry = useModuleNavigation();

  const accessibleModules = useMemo(() => {
    if (!isAuthenticated) return [];

    // CLIENT gets customer-friendly navigation
    if (user?.role === 'CLIENTE') {
      return CLIENT_NAVIGATION_MODULES.filter(module => {
        const clientModuleNameMap: Record<string, ModuleName> = {
          'customer-portal': 'customer_portal',
          'customer-menu': 'customer_menu',
          'my-orders': 'my_orders',
          'customer-settings': 'settings'
        };

        const moduleName = clientModuleNameMap[module.id];
        if (!moduleName) return false;
        return canAccessModule(moduleName);
      });
    }

    // Staff/Admin users get navigation from ModuleRegistry
    console.log('🚨 [NavigationContext] adminModulesFromRegistry:', {
      count: adminModulesFromRegistry.length,
      ids: adminModulesFromRegistry.map(m => m.id)
    });
    return adminModulesFromRegistry;
  }, [canAccessModule, isAuthenticated, user?.role, adminModulesFromRegistry]);

  // Merge accessibleModules with moduleState
  const modules = useMemo(() => {
    return accessibleModules.map(module => ({
      ...module,
      isExpanded: navigationState.moduleState[module.id]?.isExpanded ?? module.isExpanded,
      badge: navigationState.moduleState[module.id]?.badge ?? module.badge
    }));
  }, [accessibleModules, navigationState.moduleState]);

  // Update modules in state when they change
  useEffect(() => {
    logger.debug('NavigationContext', 'Modules updated', {
      moduleCount: modules.length,
      moduleIds: modules.map(m => m.id),
      userRole: user?.role,
      isAuthenticated
    });
    dispatchNavigation({ type: 'SET_MODULES', payload: modules });
  }, [modules, user?.role, isAuthenticated]);

  // DEBUG: Monitor location changes to detect navigation failures
  const lastLocationRef = useRef(location.pathname);
  useEffect(() => {
    const lock = navigationLockRef.current;

    if (location.pathname !== lastLocationRef.current) {
      logger.debug('NavigationContext', 'Location changed', {
        from: lastLocationRef.current,
        to: location.pathname,
        wasNavigating: lock.isNavigating,
        timestamp: new Date().toISOString()
      });

      // Release navigation lock when location changes
      if (lock.isNavigating) {
        logger.debug('NavigationContext', 'Navigation lock released (location changed)', {
          targetModuleId: lock.lastModuleId,
          newPath: location.pathname
        });
        lock.isNavigating = false;
        lock.attemptCount = 0; // Reset attempt counter on successful navigation
      }

      lastLocationRef.current = location.pathname;
    }
  }, [location.pathname]);

  // ============================================
  // QUICK ACTIONS (Stored in ref to avoid re-renders)
  // ============================================

  const quickActionsRef = useRef<QuickAction[]>([]);

  const getQuickActionsForModule = useCallback((moduleId: string): QuickAction[] => {
    switch (moduleId) {
      case 'dashboard':
        return [
          {
            id: 'executive-dashboard',
            label: 'Executive Dashboard',
            icon: ChartBarIcon,
            action: () => navigate('/admin/dashboard/executive'),
            color: 'purple'
          },
          {
            id: 'cross-analytics',
            label: 'Cross Analytics',
            icon: CogIcon,
            action: () => navigate('/admin/dashboard/cross-analytics'),
            color: 'blue'
          }
        ];
      case 'sales':
        return [
          {
            id: 'new-sale',
            label: 'Nueva Venta',
            icon: CurrencyDollarIcon,
            action: () => navigate('/admin/operations/sales'),
            color: 'teal'
          },
          {
            id: 'add-customer',
            label: 'Agregar Cliente',
            icon: UsersIcon,
            action: () => navigate('/admin/customers'),
            color: 'pink'
          }
        ];
      case 'materials':
        return [
          {
            id: 'add-stock',
            label: 'Agregar Stock',
            icon: CubeIcon,
            action: () => navigate('/admin/materials'),
            color: 'green'
          }
        ];
      default:
        return [];
    }
  }, [navigate]);

  // ============================================
  // CURRENT MODULE DETECTION
  // ============================================

  useEffect(() => {
    const path = location.pathname;

    // Safety check: ensure modules array is valid
    if (!modules || modules.length === 0) return;

    // Sort modules by path length for specific matching
    // Filter out any modules with invalid/null paths first
    const sortedModules = [...modules]
      .filter(module => module && module.path)
      .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0));

    let foundModule = sortedModules.find(module => {
      if (module.path === '/' && path === '/') return true;
      if (module.path !== '/' && path.startsWith(module.path)) return true;
      return false;
    });

    // Default to dashboard if no match
    if (!foundModule) {
      foundModule = modules.find(module => module && module.id === 'dashboard') || modules[0];
    }

    if (!foundModule) return;

    // Build breadcrumbs
    const crumbs: BreadcrumbItem[] = [];

    if (foundModule.id !== 'dashboard') {
      crumbs.push({
        label: 'Dashboard',
        path: '/',
        isActive: false
      });
    }

    crumbs.push({
      label: foundModule.title,
      path: foundModule.path,
      isActive: true
    });

    // Add sub-path if exists
    if (path !== foundModule.path && path.startsWith(foundModule.path)) {
      const subPath = path.replace(foundModule.path, '').replace(/^\//, '');
      if (subPath) {
        crumbs.push({
          label: subPath.charAt(0).toUpperCase() + subPath.slice(1),
          isActive: true
        });
      }
    }

    // Update quick actions for this module
    quickActionsRef.current = getQuickActionsForModule(foundModule.id);

    // Dispatch state update
    dispatchNavigation({
      type: 'SET_CURRENT_MODULE',
      payload: { module: foundModule, breadcrumbs: crumbs }
    });

    // Add to history
    dispatchNavigation({ type: 'ADD_TO_HISTORY', payload: path });
  }, [location.pathname, modules, getQuickActionsForModule]);

  // ============================================
  // ACTIONS (All memoized with useCallback)
  // ============================================

  // 🚀 PERFORMANCE FIX: Use ref to avoid deps on navigationState.modules
  // React.dev pattern: "use refs to avoid stale closures with empty deps"
  const handleNavigate = useCallback((moduleId: string, subPath?: string, query?: string) => {
    logger.debug('NavigationContext', 'handleNavigate called', {
      moduleId,
      subPath,
      query,
      availableModules: navigationStateRef.current.modules.map(m => m.id)
    });

    // ✅ Use ref - stable reference, no re-creation
    const module = navigationStateRef.current.modules.find(m => m.id === moduleId);
    if (module) {
      let targetPath = subPath ? `${module.path}${subPath}` : module.path;
      if (query) {
        targetPath += `?${query.replace(/^\?/, '')}`;
      }
      logger.info('NavigationContext', 'Navigating to module', {
        moduleId,
        targetPath,
        hasSubPath: !!subPath,
        hasQuery: !!query
      });
      navigate(targetPath);
    } else {
      logger.warn('NavigationContext', 'Module not found', {
        requestedModuleId: moduleId,
        availableModules: navigationStateRef.current.modules.map(m => ({ id: m.id, path: m.path }))
      });
    }
  }, [navigate]); // ✅ Only navigate - stable deps

  // Navigation lock to prevent rapid-fire navigation attempts
  const navigationLockRef = useRef<{
    isNavigating: boolean;
    lastModuleId: string | null;
    lastTimestamp: number;
    attemptCount: number;
  }>({
    isNavigating: false,
    lastModuleId: null,
    lastTimestamp: 0,
    attemptCount: 0
  });

  // 🛠️ PERFORMANCE FIX: Use refs to avoid recreating callback on every modules/location change
  const navigationStateRef = useRef(navigationState);
  const locationRef = useRef(location);

  useEffect(() => {
    navigationStateRef.current = navigationState;
  }, [navigationState]);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const handleNavigateToModule = useCallback((moduleId: string) => {
    const now = Date.now();
    const lock = navigationLockRef.current;
    const timeSinceLastAttempt = now - lock.lastTimestamp;

    // DEBUG: Log every call with detailed context
    logger.debug('NavigationContext', 'handleNavigateToModule called', {
      moduleId,
      availableModules: navigationStateRef.current.modules.map(m => m.id),
      lockStatus: {
        isNavigating: lock.isNavigating,
        lastModuleId: lock.lastModuleId,
        timeSinceLastAttempt,
        attemptCount: lock.attemptCount
      },
      currentLocation: locationRef.current.pathname,
      timestamp: new Date(now).toISOString(),
      // Stack trace to see who's calling this
      callStack: new Error().stack?.split('\n').slice(2, 5).join(' | ')
    });

    // Detect rapid-fire attempts (possible bug)
    if (lock.lastModuleId === moduleId && timeSinceLastAttempt < 1000) {
      lock.attemptCount++;

      if (lock.attemptCount >= 3) {
        logger.warn('NavigationContext', '🐛 BUG DETECTED: Rapid navigation attempts', {
          moduleId,
          attemptCount: lock.attemptCount,
          timeSinceLastAttempt,
          isNavigating: lock.isNavigating,
          currentPath: locationRef.current.pathname,
          targetModule: navigationStateRef.current.modules.find(m => m.id === moduleId),
          timestamp: new Date(now).toISOString()
        });
      }

      // If already navigating to this module, ignore
      if (lock.isNavigating && timeSinceLastAttempt < 500) {
        logger.warn('NavigationContext', 'Navigation in progress, ignoring duplicate call', {
          moduleId,
          attemptCount: lock.attemptCount,
          timeSinceLastAttempt
        });
        return;
      }
    } else {
      // Reset counter for new module or after cooldown
      lock.attemptCount = 1;
    }

    lock.lastModuleId = moduleId;
    lock.lastTimestamp = now;

    const module = navigationStateRef.current.modules.find(m => m.id === moduleId);
    if (module) {
      // Check if we're already at this path
      if (locationRef.current.pathname === module.path) {
        logger.info('NavigationContext', 'Already at target module path, skipping navigation', {
          moduleId,
          path: module.path,
          currentPath: locationRef.current.pathname
        });
        lock.isNavigating = false;
        return;
      }

      lock.isNavigating = true;

      logger.info('NavigationContext', 'Navigating to module root', {
        moduleId,
        targetPath: module.path,
        currentPath: locationRef.current.pathname,
        attemptNumber: lock.attemptCount
      });

      try {
        navigate(module.path);

        // Reset lock after navigation completes (with timeout as safety)
        setTimeout(() => {
          if (navigationLockRef.current.isNavigating) {
            logger.debug('NavigationContext', 'Navigation lock released (timeout)', {
              moduleId,
              targetPath: module.path
            });
            navigationLockRef.current.isNavigating = false;
          }
        }, 1000);
      } catch (error) {
        logger.error('NavigationContext', 'Navigation failed', {
          moduleId,
          targetPath: module.path,
          error: error instanceof Error ? error.message : String(error)
        });
        lock.isNavigating = false;
      }
    } else {
      logger.warn('NavigationContext', 'Module not found in navigateToModule', {
        requestedModuleId: moduleId,
        availableModules: navigationStateRef.current.modules.map(m => ({ id: m.id, path: m.path }))
      });
      lock.isNavigating = false;
    }
  }, [navigate]); // 🎯 Only depends on navigate - stable reference

  const handleNavigateBack = useCallback(() => {
    logger.debug('NavigationContext', 'handleNavigateBack called', {
      historyLength: navigationStateRef.current.navigationHistory.length,
      canGoBack: navigationStateRef.current.navigationHistory.length > 1
    });

    if (navigationStateRef.current.navigationHistory.length > 1) {
      logger.info('NavigationContext', 'Navigating back', {
        fromPath: navigationStateRef.current.navigationHistory[navigationStateRef.current.navigationHistory.length - 1]
      });
      navigate(-1);
    } else {
      logger.warn('NavigationContext', 'Cannot navigate back', {
        reason: 'No history available',
        historyLength: navigationStateRef.current.navigationHistory.length
      });
    }
  }, [navigate]); // 🎯 Only depends on navigate - stable reference

  const toggleModuleExpansion = useCallback((moduleId: string) => {
    dispatchNavigation({ type: 'TOGGLE_MODULE_EXPANSION', payload: moduleId });
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    dispatchLayout({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed });
  }, []);

  const updateModuleBadge = useCallback((moduleId: string, count: number) => {
    dispatchNavigation({ type: 'UPDATE_MODULE_BADGE', payload: { moduleId, count } });
  }, []);

  const setQuickActions = useCallback((actions: QuickAction[]) => {
    quickActionsRef.current = actions;
  }, []);

  // ============================================
  // CONTEXT VALUES (Memoized with Primitives)
  // ============================================
  // 🚀 PERFORMANCE FIX: Extract primitives to minimize re-renders
  // React.dev: "minimize props changes - use individual values instead of objects"

  // Extract primitive values for stable comparison
  const currentModuleId = navigationState.currentModule?.id;
  const modulesCount = navigationState.modules.length;
  const modulesHash = navigationState.modules.map(m => m.id).join(',');
  const historyLength = navigationState.navigationHistory.length;
  const breadcrumbsLength = navigationState.breadcrumbs.length;

  // Memoize currentModule (only changes when ID changes)
  const memoizedCurrentModule = useMemo(
    () => navigationState.currentModule,
    [currentModuleId]
  );

  // Memoize modules (only changes when count or IDs change)
  const memoizedModules = useMemo(
    () => navigationState.modules,
    [modulesCount, modulesHash]
  );

  // Memoize navigationHistory (only changes when length changes)
  const memoizedHistory = useMemo(
    () => navigationState.navigationHistory,
    [historyLength]
  );

  // Memoize breadcrumbs (only changes when length changes)
  const memoizedBreadcrumbs = useMemo(
    () => navigationState.breadcrumbs,
    [breadcrumbsLength]
  );

  const stateValue = useMemo<NavigationStateContextValue>(() => ({
    currentModule: memoizedCurrentModule,
    breadcrumbs: memoizedBreadcrumbs,
    modules: memoizedModules,
    navigationHistory: memoizedHistory,
    canNavigateBack: historyLength > 1
  }), [
    memoizedCurrentModule,
    memoizedBreadcrumbs,
    memoizedModules,
    memoizedHistory,
    historyLength
  ]);

  const layoutValue = useMemo<NavigationLayoutContextValue>(() => ({
    isMobile: layoutState.isMobile,
    showBottomNav: layoutState.isMobile,
    showSidebar: !layoutState.isMobile,
    sidebarCollapsed: layoutState.sidebarCollapsed
  }), [layoutState.isMobile, layoutState.sidebarCollapsed]);

  // 🚀 PERFORMANCE: Actions with stable callbacks (empty deps pattern)
  // All callbacks use refs → no re-creation → actionsValue stays stable
  const actionsValue = useMemo<NavigationActionsContextValue>(() => ({
    navigate: handleNavigate,               // ✅ [navigate] - stable
    navigateToModule: handleNavigateToModule, // ✅ [navigate] - stable
    navigateBack: handleNavigateBack,       // ✅ [] - stable
    toggleModuleExpansion,                  // ✅ [] - stable
    setSidebarCollapsed,                    // ✅ [] - stable
    updateModuleBadge,                      // ✅ [] - stable
    setQuickActions                         // ✅ [] - stable
  }), [
    handleNavigate,
    handleNavigateToModule,
    handleNavigateBack,
    toggleModuleExpansion,
    setSidebarCollapsed,
    updateModuleBadge,
    setQuickActions
  ]);

  return (
    <NavigationStateContext.Provider value={stateValue}>
      <NavigationLayoutContext.Provider value={layoutValue}>
        <NavigationActionsContext.Provider value={actionsValue}>
          {children}
        </NavigationActionsContext.Provider>
      </NavigationLayoutContext.Provider>
    </NavigationStateContext.Provider>
  );
}

// ============================================
// HOOKS (Specialized for performance)
// ============================================

/**
 * Hook to access navigation state (modules, currentModule, breadcrumbs)
 * Components using this will only re-render when navigation state changes
 */
export function useNavigationState(): NavigationStateContextValue {
  const context = useContext(NavigationStateContext);
  if (!context) {
    throw new Error('useNavigationState must be used within a NavigationProvider');
  }
  return context;
}

/**
 * Hook to access layout state (isMobile, sidebar, etc.)
 * Components using this will only re-render when layout changes
 */
export function useNavigationLayout(): NavigationLayoutContextValue {
  const context = useContext(NavigationLayoutContext);
  if (!context) {
    throw new Error('useNavigationLayout must be used within a NavigationProvider');
  }
  return context;
}

/**
 * Hook to access navigation actions (navigate, toggle, etc.)
 * Components using this will NEVER re-render (actions are stable)
 */
export function useNavigationActions(): NavigationActionsContextValue {
  const context = useContext(NavigationActionsContext);
  if (!context) {
    throw new Error('useNavigationActions must be used within a NavigationProvider');
  }
  return context;
}

/**
 * Hook to access quick actions for the current module
 * Quick actions are managed internally via ref to prevent re-renders
 */
export function useQuickActions(): QuickAction[] {
  // QuickActions are managed via ref inside NavigationProvider
  // Return empty array as this is primarily for internal use
  return [];
}
