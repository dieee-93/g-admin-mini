/**
 * Module System Types for G-Admin v3.0
 * Implements Module Federation and standardized module interfaces
 * Based on 2024 module federation patterns and dependency injection
 */

import { ComponentType, LazyExoticComponent } from 'react';
import type { BusinessCapability } from '../../capabilities/types/BusinessCapabilities';

/**
 * Module loading states
 */
export type ModuleLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Module federation configuration
 */
export interface ModuleFederationConfig {
  /** Module name for federation */
  name: string;
  /** Remote entry filename */
  filename: string;
  /** Exposed components/modules */
  exposes: Record<string, string>;
  /** Shared dependencies */
  shared: Record<string, {
    singleton?: boolean;
    requiredVersion?: string;
    shareKey?: string;
    shareScope?: string;
  }>;
  /** Remote URL for loading */
  remoteEntry?: string;
}

/**
 * Module metadata
 */
export interface ModuleMetadata {
  /** Unique module identifier */
  id: string;
  /** Display name */
  name: string;
  /** Module version */
  version: string;
  /** Module description */
  description?: string;
  /** Module author/maintainer */
  author?: string;
  /** Module tags for categorization */
  tags?: string[];
  /** Module icon identifier */
  icon?: string;
  /** Whether module is experimental */
  experimental?: boolean;
}

/**
 * Module dependencies
 */
export interface ModuleDependencies {
  /** Required business capabilities */
  requiredCapabilities: BusinessCapability[];
  /** Optional business capabilities (enhanced features) */
  optionalCapabilities?: BusinessCapability[];
  /** Other modules this module depends on */
  dependsOn?: string[];
  /** Modules that conflict with this one */
  conflicts?: string[];
  /** Minimum G-Admin version required */
  minVersion?: string;
}

/**
 * Module components export
 */
export interface ModuleComponents {
  /** Main module component */
  MainComponent?: ComponentType<any> | LazyExoticComponent<ComponentType<any>>;
  /** Page components */
  pages?: Record<string, ComponentType<any> | LazyExoticComponent<ComponentType<any>>>;
  /** Reusable components */
  components?: Record<string, ComponentType<any>>;
  /** Widget components */
  widgets?: Record<string, ComponentType<any>>;
  /** Dashboard components */
  dashboard?: Record<string, ComponentType<any>>;
}

/**
 * Module hooks export
 */
export interface ModuleHooks {
  /** Custom hooks provided by this module */
  hooks?: Record<string, () => any>;
  /** State management hooks */
  store?: Record<string, () => any>;
  /** API hooks */
  api?: Record<string, () => any>;
}

/**
 * Module services (business logic)
 */
export interface ModuleServices {
  /** API services */
  api?: Record<string, any>;
  /** Business logic services */
  business?: Record<string, any>;
  /** Utility services */
  utils?: Record<string, any>;
  /** Validation services */
  validation?: Record<string, any>;
}

/**
 * Module types export
 */
export interface ModuleTypes {
  /** TypeScript type definitions */
  types?: Record<string, any>;
  /** Interface definitions */
  interfaces?: Record<string, any>;
  /** Enum definitions */
  enums?: Record<string, any>;
}

/**
 * Module events (for EventBus integration)
 */
export interface ModuleEvents {
  /** Events this module can emit */
  emits?: string[];
  /** Events this module listens to */
  listens?: string[];
  /** Event handlers */
  handlers?: Record<string, (payload: any) => void>;
}

/**
 * Module lifecycle hooks
 */
export interface ModuleLifecycle {
  /** Called when module is first loaded */
  onLoad?: () => Promise<void> | void;
  /** Called when module is initialized */
  onInit?: () => Promise<void> | void;
  /** Called when module is activated */
  onActivate?: () => Promise<void> | void;
  /** Called when module is deactivated */
  onDeactivate?: () => Promise<void> | void;
  /** Called when module is unloaded */
  onUnload?: () => Promise<void> | void;
  /** Called on app shutdown */
  onShutdown?: () => Promise<void> | void;
}

/**
 * Module configuration schema
 */
export interface ModuleConfig {
  /** Configuration schema */
  schema?: Record<string, any>;
  /** Default configuration values */
  defaults?: Record<string, any>;
  /** User-configurable settings */
  settings?: Record<string, any>;
  /** Environment-specific config */
  environment?: Record<string, any>;
}

/**
 * Complete module interface definition
 */
export interface ModuleInterface {
  /** Module metadata */
  metadata: ModuleMetadata;
  /** Module dependencies and requirements */
  dependencies: ModuleDependencies;
  /** Module federation configuration */
  federation?: ModuleFederationConfig;
  /** Exported components */
  components: ModuleComponents;
  /** Exported hooks */
  hooks?: ModuleHooks;
  /** Business logic services */
  services?: ModuleServices;
  /** Type definitions */
  types?: ModuleTypes;
  /** Event system integration */
  events?: ModuleEvents;
  /** Lifecycle management */
  lifecycle?: ModuleLifecycle;
  /** Module configuration */
  config?: ModuleConfig;
}

/**
 * Module registry entry
 */
export interface ModuleRegistryEntry {
  /** Module interface definition */
  module: ModuleInterface;
  /** Current loading state */
  state: ModuleLoadingState;
  /** Loaded module instance */
  instance?: any;
  /** Loading error if any */
  error?: Error;
  /** Load timestamp */
  loadedAt?: number;
  /** Whether module is active */
  active: boolean;
}

/**
 * Module loader configuration
 */
export interface ModuleLoaderConfig {
  /** Base URL for remote modules */
  baseUrl?: string;
  /** Maximum concurrent loads */
  maxConcurrentLoads?: number;
  /** Load timeout in milliseconds */
  loadTimeout?: number;
  /** Enable module caching */
  enableCaching?: boolean;
  /** Enable hot reloading in development */
  enableHotReload?: boolean;
  /** Module federation scope */
  federationScope?: string;
}

/**
 * Module resolution result
 */
export interface ModuleResolutionResult {
  /** Whether all dependencies are satisfied */
  satisfied: boolean;
  /** Missing required capabilities */
  missingCapabilities: BusinessCapability[];
  /** Missing required modules */
  missingModules: string[];
  /** Conflicting modules */
  conflicts: string[];
  /** Load order for dependencies */
  loadOrder: string[];
}

/**
 * Module performance metrics
 */
export interface ModulePerformanceMetrics {
  /** Module load time in milliseconds */
  loadTime: number;
  /** Module initialization time */
  initTime: number;
  /** Bundle size in bytes */
  bundleSize?: number;
  /** Memory usage in bytes */
  memoryUsage?: number;
  /** Number of components */
  componentCount: number;
  /** Last accessed timestamp */
  lastAccessed: number;
}

/**
 * Module health check result
 */
export interface ModuleHealthCheck {
  /** Module identifier */
  moduleId: string;
  /** Health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Health check timestamp */
  timestamp: number;
  /** Health issues if any */
  issues?: string[];
  /** Performance metrics */
  performance?: ModulePerformanceMetrics;
}

/**
 * Module update information
 */
export interface ModuleUpdateInfo {
  /** Current version */
  currentVersion: string;
  /** Available version */
  availableVersion: string;
  /** Update type */
  updateType: 'patch' | 'minor' | 'major';
  /** Update description */
  description?: string;
  /** Breaking changes */
  breakingChanges?: string[];
  /** Update URL */
  updateUrl?: string;
}