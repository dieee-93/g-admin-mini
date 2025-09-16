/**
 * Lazy Capability Loader for G-Admin v3.0
 * Implements dynamic capability loading and code splitting
 * Based on 2024 React lazy loading patterns
 */

import { lazy, ComponentType } from 'react';
import type { BusinessCapability } from '../types/BusinessCapabilities';

/**
 * Lazy capability configuration
 */
interface LazyCapabilityConfig {
  /** Capability identifier */
  capability: BusinessCapability;
  /** Component loader function */
  loader: () => Promise<{ default: ComponentType<any> }>;
  /** Fallback component while loading */
  fallback?: ComponentType<any>;
  /** Preload trigger conditions */
  preload?: {
    /** Preload on user interaction */
    onHover?: boolean;
    /** Preload after delay (ms) */
    afterDelay?: number;
    /** Preload on capability check */
    onCapabilityCheck?: boolean;
  };
  /** Chunk name for webpack */
  chunkName?: string;
}

/**
 * Loading state for capabilities
 */
interface LoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
  component: ComponentType<any> | null;
}

/**
 * Lazy capability loader class
 */
export class LazyCapabilityLoader {
  private loadingStates = new Map<BusinessCapability, LoadingState>();
  private lazyComponents = new Map<BusinessCapability, ComponentType<any>>();
  private preloadTimers = new Map<BusinessCapability, NodeJS.Timeout>();

  /**
   * Register a lazy capability
   */
  registerCapability(config: LazyCapabilityConfig): void {
    const { capability, loader, preload } = config;

    // Create lazy component
    const LazyComponent = lazy(loader);
    this.lazyComponents.set(capability, LazyComponent);

    // Initialize loading state
    this.loadingStates.set(capability, {
      isLoading: false,
      isLoaded: false,
      error: null,
      component: null
    });

    // Setup preloading
    if (preload?.afterDelay) {
      const timer = setTimeout(() => {
        this.preloadCapability(capability);
      }, preload.afterDelay);
      this.preloadTimers.set(capability, timer);
    }
  }

  /**
   * Get lazy component for capability
   */
  getComponent(capability: BusinessCapability): ComponentType<any> | null {
    return this.lazyComponents.get(capability) || null;
  }

  /**
   * Get loading state for capability
   */
  getLoadingState(capability: BusinessCapability): LoadingState | null {
    return this.loadingStates.get(capability) || null;
  }

  /**
   * Preload capability component
   */
  async preloadCapability(capability: BusinessCapability): Promise<void> {
    const state = this.loadingStates.get(capability);
    if (!state || state.isLoaded || state.isLoading) {
      return;
    }

    this.updateLoadingState(capability, { isLoading: true });

    try {
      const component = this.lazyComponents.get(capability);
      if (component) {
        // Trigger the lazy loading by importing the module
        // Note: This is a placeholder - actual module paths should be registered dynamically
        await Promise.resolve(); // Mock import for testing
        this.updateLoadingState(capability, {
          isLoading: false,
          isLoaded: true,
          component
        });
      }
    } catch (error) {
      this.updateLoadingState(capability, {
        isLoading: false,
        error: error as Error
      });
    }
  }

  /**
   * Preload multiple capabilities
   */
  async preloadCapabilities(capabilities: BusinessCapability[]): Promise<void> {
    const preloadPromises = capabilities.map(cap => this.preloadCapability(cap));
    await Promise.allSettled(preloadPromises);
  }

  /**
   * Check if capability is loaded
   */
  isCapabilityLoaded(capability: BusinessCapability): boolean {
    const state = this.loadingStates.get(capability);
    return state?.isLoaded || false;
  }

  /**
   * Check if capability is loading
   */
  isCapabilityLoading(capability: BusinessCapability): boolean {
    const state = this.loadingStates.get(capability);
    return state?.isLoading || false;
  }

  /**
   * Get all registered capabilities
   */
  getRegisteredCapabilities(): BusinessCapability[] {
    return Array.from(this.lazyComponents.keys());
  }

  /**
   * Get loading statistics
   */
  getLoadingStats(): {
    total: number;
    loaded: number;
    loading: number;
    failed: number;
    loadRate: number;
  } {
    const states = Array.from(this.loadingStates.values());
    const total = states.length;
    const loaded = states.filter(s => s.isLoaded).length;
    const loading = states.filter(s => s.isLoading).length;
    const failed = states.filter(s => s.error !== null).length;

    return {
      total,
      loaded,
      loading,
      failed,
      loadRate: total > 0 ? loaded / total : 0
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Clear preload timers
    this.preloadTimers.forEach(timer => clearTimeout(timer));
    this.preloadTimers.clear();

    // Clear states
    this.loadingStates.clear();
    this.lazyComponents.clear();
  }

  private updateLoadingState(
    capability: BusinessCapability,
    updates: Partial<LoadingState>
  ): void {
    const currentState = this.loadingStates.get(capability);
    if (currentState) {
      this.loadingStates.set(capability, {
        ...currentState,
        ...updates
      });
    }
  }
}

/**
 * Singleton lazy loader instance
 */
let lazyLoaderInstance: LazyCapabilityLoader | null = null;

/**
 * Get or create lazy loader instance
 */
export const getLazyCapabilityLoader = (): LazyCapabilityLoader => {
  if (!lazyLoaderInstance) {
    lazyLoaderInstance = new LazyCapabilityLoader();
  }
  return lazyLoaderInstance;
};

/**
 * Register common G-Admin capabilities for lazy loading
 * Note: This should be implemented with actual module paths when modules exist
 */
export const registerCommonLazyCapabilities = (): void => {
  // TODO: Implement when actual modules exist
  // For now, this is a placeholder to allow testing
  if (process.env.NODE_ENV === 'test') {
    return; // Skip registration in tests
  }

  const loader = getLazyCapabilityLoader();

  // Example of how capabilities should be registered:
  // loader.registerCapability({
  //   capability: 'pos_system',
  //   loader: () => import(/* webpackChunkName: "pos-system" */ '../../../modules/sales/POSModule'),
  //   preload: { afterDelay: 2000, onCapabilityCheck: true },
  //   chunkName: 'pos-system'
  // });

  console.log('🚀 Lazy capability registration placeholder - implement with actual modules');
};

/**
 * Reset lazy loader instance (useful for testing)
 */
export const resetLazyCapabilityLoader = (): void => {
  if (lazyLoaderInstance) {
    lazyLoaderInstance.cleanup();
  }
  lazyLoaderInstance = null;
};