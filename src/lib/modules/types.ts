/**
 * MODULE REGISTRY TYPE DEFINITIONS
 *
 * Type system for the Module Registry pattern
 * Inspired by WordPress, VS Code, and Odoo module systems
 *
 * @version 1.0.0
 * @see docs/02-architecture/MODULE_REGISTRY_MIGRATION_PLAN.md
 */

import type { FeatureId } from '@/config/types';
import type { ReactNode } from 'react';

// ============================================
// CORE TYPES
// ============================================

/**
 * Hook handler function signature
 * Receives data and returns React nodes
 */
export type HookHandler<T = any, R = ReactNode> = (data?: T) => R;

/**
 * Hook execution context
 * Tracks which module registered the hook
 */
export interface HookContext {
  /** Module that registered this hook */
  moduleId: string;
  /** Hook name */
  hookName: string;
  /** Registration timestamp */
  timestamp: number;
  /** Optional metadata */
  metadata?: Record<string, any>;
  /** Required permission to execute this hook (NEW) */
  requiredPermission?: {
    module: string;  // ModuleName from AuthContext
    action: string;  // PermissionAction ('create', 'read', etc.)
  };
}

/**
 * Registered hook with handler and context
 */
export interface RegisteredHook<T = any, R = ReactNode> {
  /** The handler function */
  handler: HookHandler<T, R>;
  /** Execution context */
  context: HookContext;
  /** Priority (higher = executed first) */
  priority?: number;
}

// ============================================
// MODULE MANIFEST
// ============================================

/**
 * Module manifest definition
 * Declarative configuration for a module
 */
export interface ModuleManifest {
  /** Unique module identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** Semantic version */
  version: string;

  /** Module dependencies (other module IDs) */
  depends: string[];

  /**
   * Permission module for RBAC
   *
   * Specifies which ModuleName from PermissionsRegistry this module uses.
   * If not defined, the module ID is used directly (must be a valid ModuleName).
   *
   * @example
   * permissionModule: 'billing'      // finance-billing uses 'billing' permission
   * permissionModule: 'fiscal'       // cash-management uses 'fiscal' permission
   * permissionModule: 'gamification' // achievements uses 'gamification' permission
   */
  permissionModule?: string; // Using string to avoid circular dependency with AuthContext

  /**
   * Single feature that activates this module (OPTIONAL modules only)
   *
   * ARCHITECTURE (validated with industry research 2026-01-19):
   * - Inspired by Odoo's `depends` + VS Code activation events
   * - CORE modules: NO activatedBy (always loaded)
   * - OPTIONAL modules: activatedBy required
   *
   * @example
   * activatedBy: 'staff_employee_management'  // Staff module (OPTIONAL)
   * activatedBy: 'inventory_stock_tracking'   // Materials module (OPTIONAL)
   * activatedBy: undefined                    // Dashboard module (CORE)
   */
  activatedBy?: FeatureId;

  /** Minimum role required to access this module */
  minimumRole?: string;

  /** Hook points this module provides */
  hooks?: {
    /** Hooks this module offers to others */
    provide: string[];
    /** Hooks this module consumes from others (NEW: can be string or object with permission) */
    consume: Array<string | {
      name: string;
      requiredPermission?: {
        module: string;
        action: string;
      };
    }>;
  };

  /** Setup function (called on module registration) */
  setup?: (registry: ModuleRegistry) => void | Promise<void>;

  /** Teardown function (called on module unregister) */
  teardown?: () => void | Promise<void>;

  /** Public API exports (inspired by VS Code) */
  exports?: Record<string, any>;

  /** Module metadata */
  metadata?: {
    /** Module category */
    category?: 'core' | 'business' | 'integration' | 'tool';
    /** Module description */
    description?: string;
    /** Module author */
    author?: string;
    /** Module tags */
    tags?: string[];
    /** Navigation metadata (for UI integration) */
    navigation?: {
      /** Route path (e.g., '/admin/suppliers') */
      route: string;
      /** Icon component reference (Heroicon) */
      icon: any;
      /** Display color/palette */
      color?: string;
      /** Business domain for grouping */
      domain?: 'core' | 'inventory' | 'operations' | 'finance' | 'resources' | 'advanced' | 'debug';
      /** Whether module has expandable submenu */
      isExpandable?: boolean;
      /** Submenu items if expandable */
      submodules?: Array<{
        id: string;
        title: string;
        path: string;
        icon: any;
        description?: string;
      }>;
    };
  };
}

/**
 * Module instance (registered and active)
 */
export interface ModuleInstance {
  /** Module manifest */
  manifest: ModuleManifest;
  /** Whether module is currently active */
  active: boolean;
  /** Registration timestamp */
  registeredAt: number;
  /** Initialization errors (if any) */
  errors?: Error[];
}

// ============================================
// MODULE REGISTRY INTERFACE
// ============================================

/**
 * Module Registry interface
 * Core API for module management
 */
export interface IModuleRegistry {
  // Module lifecycle
  register(manifest: ModuleManifest): Promise<void>;
  unregister(moduleId: string): void;
  has(moduleId: string): boolean;
  getModule(moduleId: string): ModuleInstance | undefined;
  getAll(): ModuleInstance[];

  // Hook system
  addAction<T = any, R = ReactNode>(
    hookName: string,
    handler: HookHandler<T, R>,
    moduleId?: string,
    priority?: number,
    options?: {
      requiredPermission?: {
        module: string;
        action: string;
      };
      metadata?: Record<string, any>;
    }
  ): void;

  doAction<T = any, R = ReactNode>(
    hookName: string,
    data?: T
  ): R[];

  hasHook(hookName: string): boolean;
  removeHook(hookName: string, moduleId?: string): void;

  // Exports API (VS Code pattern)
  getExports<T = any>(moduleId: string): T | undefined;

  // EventBus access
  getEventBus(): any;

  // Introspection
  getDependencyGraph(moduleId: string): string[];
  getStats(): {
    totalModules: number;
    totalHooks: number;
    modules: string[];
    hooks: Array<{ name: string; handlerCount: number }>;
  };

  // Cleanup
  clear(): void;
}

// Re-export for circular dependency prevention
export type ModuleRegistry = IModuleRegistry;

// ============================================
// HOOK POINT TYPES
// ============================================

/**
 * HookPoint component props
 */
export interface HookPointProps<T = any> {
  /** Hook name to execute */
  name: string;

  /** Data to pass to hook handlers */
  data?: T;

  /** Fallback content if no hooks registered */
  fallback?: ReactNode;

  /** Layout direction for multiple results */
  direction?: 'row' | 'column';

  /** Gap between results (Chakra spacing scale) */
  gap?: number | string;

  /** Custom wrapper className */
  className?: string;

  /** Debug mode */
  debug?: boolean;
}

// ============================================
// BOOTSTRAP TYPES
// ============================================

/**
 * Module initialization result
 */
export interface ModuleInitResult {
  /** Successfully initialized modules */
  initialized: string[];

  /** Modules that failed to initialize */
  failed: Array<{
    moduleId: string;
    error: Error;
  }>;

  /** Modules that were skipped (missing features) */
  skipped: string[];

  /** Total initialization time (ms) */
  duration: number;
}

/**
 * Topological sort result
 */
export interface TopologicalSortResult {
  /** Sorted modules in dependency order */
  sorted: ModuleManifest[];

  /** Detected circular dependencies */
  cycles: string[][];
}

// ============================================
// VALIDATION TYPES
// ============================================

/**
 * Module validation error
 */
export interface ModuleValidationError {
  moduleId: string;
  type: 'missing_dependency' | 'circular_dependency' | 'invalid_manifest' | 'setup_failed';
  message: string;
  details?: any;
}

/**
 * Module validation result
 */
export interface ModuleValidationResult {
  valid: boolean;
  errors: ModuleValidationError[];
  warnings: string[];
}

// ============================================
// PERFORMANCE TYPES
// ============================================

/**
 * Module performance metrics
 */
export interface ModulePerformanceMetrics {
  moduleId: string;
  setupDuration: number;
  hooksRegistered: number;
  memoryUsage?: number;
}

/**
 * Hook execution metrics
 */
export interface HookExecutionMetrics {
  hookName: string;
  executionCount: number;
  totalDuration: number;
  averageDuration: number;
  handlerCount: number;
}
