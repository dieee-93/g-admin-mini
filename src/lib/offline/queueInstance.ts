import { OfflineCommandQueue } from './OfflineCommandQueue';

let queueInstance: OfflineCommandQueue | null = null;

/**
 * Get the singleton instance of OfflineCommandQueue
 * Initializes on first call
 */
export async function getOfflineQueue(): Promise<OfflineCommandQueue> {
  if (!queueInstance) {
    queueInstance = new OfflineCommandQueue();
    await queueInstance.init();
  }
  return queueInstance;
}

/**
 * Reset the queue instance (for testing)
 */
export function resetOfflineQueue(): void {
  queueInstance = null;
}
