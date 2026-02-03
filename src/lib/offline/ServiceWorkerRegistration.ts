/**
 * Service Worker Registration Module
 *
 * Handles Service Worker lifecycle:
 * - Registration with proper scope
 * - Update detection and handling
 * - Graceful fallback for unsupported browsers
 * - Event emission for lifecycle changes
 *
 * Browser compatibility:
 * - Chrome 40+, Edge 17+, Firefox 44+, Safari 11.1+
 * - Graceful degradation if not supported
 */

import { logger } from '@/lib/logging';

export type ServiceWorkerState =
  | 'unsupported'
  | 'registering'
  | 'installing'
  | 'waiting'
  | 'active'
  | 'redundant'
  | 'error';

export interface ServiceWorkerStatus {
  state: ServiceWorkerState;
  registration: ServiceWorkerRegistration | null;
  isBackgroundSyncSupported: boolean;
  error?: string;
}

type EventCallback = (status: ServiceWorkerStatus) => void;

/**
 * Service Worker Registration Manager
 */
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private status: ServiceWorkerStatus;
  private eventListeners: Map<string, EventCallback[]> = new Map();

  constructor() {
    this.status = {
      state: 'unsupported',
      registration: null,
      isBackgroundSyncSupported: false
    };
  }

  /**
   * Check if Service Workers are supported
   */
  public isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Check if Background Sync API is supported
   */
  public isBackgroundSyncSupported(): boolean {
    return (
      this.isSupported() &&
      'sync' in ServiceWorkerRegistration.prototype
    );
  }

  /**
   * Register Service Worker
   */
  public async register(scriptURL = '/service-worker.js', options?: RegistrationOptions): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      logger.warn('ServiceWorker', 'Service Workers not supported in this browser');
      this.updateStatus({
        state: 'unsupported',
        registration: null,
        isBackgroundSyncSupported: false
      });
      return null;
    }

    try {
      this.updateStatus({
        state: 'registering',
        registration: null,
        isBackgroundSyncSupported: this.isBackgroundSyncSupported()
      });

      logger.info('ServiceWorker', 'Registering Service Worker...', { scriptURL, options });

      // Register with default scope or provided options
      this.registration = await navigator.serviceWorker.register(scriptURL, options);

      logger.info('ServiceWorker', 'Service Worker registered', {
        scope: this.registration.scope,
        active: !!this.registration.active,
        installing: !!this.registration.installing,
        waiting: !!this.registration.waiting
      });

      // Set up event listeners
      this.setupEventListeners();

      // Determine initial state
      const state = this.determineState(this.registration);
      this.updateStatus({
        state,
        registration: this.registration,
        isBackgroundSyncSupported: this.isBackgroundSyncSupported()
      });

      // Check for updates periodically
      this.startUpdateCheck();

      return this.registration;

    } catch (error) {
      logger.error('ServiceWorker', 'Failed to register Service Worker', error);
      this.updateStatus({
        state: 'error',
        registration: null,
        isBackgroundSyncSupported: false,
        error: (error as Error).message
      });
      return null;
    }
  }

  /**
   * Unregister Service Worker
   */
  public async unregister(): Promise<boolean> {
    if (!this.registration) {
      logger.warn('ServiceWorker', 'No Service Worker registration to unregister');
      return false;
    }

    try {
      const success = await this.registration.unregister();

      if (success) {
        logger.info('ServiceWorker', 'Service Worker unregistered successfully');
        this.registration = null;
        this.updateStatus({
          state: 'unsupported',
          registration: null,
          isBackgroundSyncSupported: false
        });
      }

      return success;
    } catch (error) {
      logger.error('ServiceWorker', 'Failed to unregister Service Worker', error);
      return false;
    }
  }

  /**
   * Update Service Worker to latest version
   */
  public async update(): Promise<void> {
    if (!this.registration) {
      logger.warn('ServiceWorker', 'No Service Worker registration to update');
      return;
    }

    try {
      logger.info('ServiceWorker', 'Checking for Service Worker updates...');
      await this.registration.update();
    } catch (error) {
      logger.error('ServiceWorker', 'Failed to update Service Worker', error);
    }
  }

  /**
   * Get current status
   */
  public getStatus(): ServiceWorkerStatus {
    return { ...this.status };
  }

  /**
   * Subscribe to status changes
   */
  public on(event: 'statechange', callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Unsubscribe from status changes
   */
  public off(event: 'statechange', callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Setup event listeners for Service Worker lifecycle
   */
  private setupEventListeners(): void {
    if (!this.registration) return;

    // Listen to controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      logger.info('ServiceWorker', 'Controller changed - new Service Worker activated');
      this.updateStatus({
        state: 'active',
        registration: this.registration,
        isBackgroundSyncSupported: this.isBackgroundSyncSupported()
      });
    });

    // Listen to messages from Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      logger.debug('ServiceWorker', 'Message received from SW:', event.data);

      if (event.data.type === 'SYNC_COMPLETED') {
        // Emit custom event for app to handle
        window.dispatchEvent(new CustomEvent('sw-sync-completed', {
          detail: event.data.payload
        }));
      }
    });

    // Monitor installing worker
    if (this.registration.installing) {
      this.trackStateChange(this.registration.installing);
    }

    // Monitor waiting worker
    if (this.registration.waiting) {
      this.trackStateChange(this.registration.waiting);
    }

    // Monitor active worker
    if (this.registration.active) {
      this.trackStateChange(this.registration.active);
    }

    // Listen for updates
    this.registration.addEventListener('updatefound', () => {
      logger.info('ServiceWorker', 'Service Worker update found');

      const newWorker = this.registration!.installing;
      if (newWorker) {
        this.trackStateChange(newWorker);

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New Service Worker available
            logger.info('ServiceWorker', 'New Service Worker available - refresh to update');
            this.updateStatus({
              state: 'waiting',
              registration: this.registration,
              isBackgroundSyncSupported: this.isBackgroundSyncSupported()
            });
          }
        });
      }
    });
  }

  /**
   * Track Service Worker state changes
   */
  private trackStateChange(worker: ServiceWorker): void {
    worker.addEventListener('statechange', () => {
      logger.debug('ServiceWorker', 'State changed:', worker.state);

      const state = this.mapWorkerState(worker.state);
      this.updateStatus({
        state,
        registration: this.registration,
        isBackgroundSyncSupported: this.isBackgroundSyncSupported()
      });
    });
  }

  /**
   * Map ServiceWorker.state to our ServiceWorkerState
   */
  private mapWorkerState(state: ServiceWorkerState): ServiceWorkerState {
    return state;
  }

  /**
   * Determine current state from registration
   */
  private determineState(registration: ServiceWorkerRegistration): ServiceWorkerState {
    if (registration.active) {
      return 'active';
    }
    if (registration.waiting) {
      return 'waiting';
    }
    if (registration.installing) {
      return 'installing';
    }
    return 'registering';
  }

  /**
   * Update status and emit event
   */
  private updateStatus(status: ServiceWorkerStatus): void {
    this.status = status;

    // Emit to listeners
    const listeners = this.eventListeners.get('statechange');
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          logger.error('ServiceWorker', 'Error in statechange listener', error);
        }
      });
    }
  }

  /**
   * Start periodic update check (every hour)
   */
  private startUpdateCheck(): void {
    const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour

    setInterval(() => {
      this.update();
    }, UPDATE_INTERVAL);

    // Also check on visibility change (user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.update();
      }
    });
  }
}

// Singleton instance
let swManager: ServiceWorkerManager | null = null;

/**
 * Get Service Worker Manager singleton
 */
export function getServiceWorkerManager(): ServiceWorkerManager {
  if (!swManager) {
    swManager = new ServiceWorkerManager();
  }
  return swManager;
}

/**
 * Convenience function to register Service Worker
 */
export async function registerServiceWorker(scriptURL?: string): Promise<ServiceWorkerRegistration | null> {
  const manager = getServiceWorkerManager();
  return await manager.register(scriptURL);
}

/**
 * Check if Service Worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  const manager = getServiceWorkerManager();
  return manager.isSupported();
}

/**
 * Check if Background Sync is supported
 */
export function isBackgroundSyncSupported(): boolean {
  const manager = getServiceWorkerManager();
  return manager.isBackgroundSyncSupported();
}
