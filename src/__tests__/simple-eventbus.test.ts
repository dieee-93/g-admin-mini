/**
 * Simple EventBus Test - Quick validation of our integration
 * Tests basic emit/on functionality to verify our setup works
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventBus } from '@/lib/events/EventBus';
import { TestSetup, testConfigs } from '@/lib/events/__tests__/helpers/test-utilities';

describe('Simple EventBus Integration Test', () => {
  let eventBus: EventBus;

  beforeEach(async () => {
    eventBus = await TestSetup.createEventBus(testConfigs.unit);
  });

  afterEach(async () => {
    await TestSetup.cleanup();
  });

  it('should successfully emit and receive events', async () => {
    const mockHandler = vi.fn();

    // Setup listener
    eventBus.on('test.simple', mockHandler);

    // Emit event
    await eventBus.emit('test.simple', { message: 'hello world' });

    // Wait for async processing
    await new Promise(resolve => setTimeout(resolve, 50));

    // Verify handler was called
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({
      payload: { message: 'hello world' }
    }));
  });

  it('should handle materials stock update event', async () => {
    const mockHandler = vi.fn();

    // Setup listener for our Materials → Sales integration
    eventBus.on('materials.stock_updated', mockHandler);

    // Emit the event our modules use
    const stockData = {
      materialId: 'tomato-123',
      newStock: 5,
      critical: true,
      materialName: 'Tomatoes'
    };

    await eventBus.emit('materials.stock_updated', stockData);

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 50));

    // Verify it worked
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({
      payload: stockData
    }));
  });

  it('should handle sales order placed event', async () => {
    const mockHandler = vi.fn();

    // Setup listener for Sales → Kitchen integration
    eventBus.on('sales.order_placed', mockHandler);

    // Emit the event our modules use
    const orderData = {
      orderId: 'order-123',
      items: [{ productId: 'pizza', quantity: 1 }],
      customerId: 'customer-456',
      totalAmount: 12.99
    };

    await eventBus.emit('sales.order_placed', orderData);

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 50));

    // Verify it worked
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({
      payload: orderData
    }));
  });

  it('should handle multiple listeners for same event', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();

    // Setup multiple listeners
    eventBus.on('multi.test', handler1);
    eventBus.on('multi.test', handler2);
    eventBus.on('multi.test', handler3);

    // Emit event
    await eventBus.emit('multi.test', { multi: true });

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 50));

    // Verify all handlers were called
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(handler3).toHaveBeenCalledTimes(1);
  });

  it('should handle unsubscribe correctly', async () => {
    const mockHandler = vi.fn();

    // Setup listener and get unsubscribe function
    const unsubscribe = eventBus.on('unsubscribe.test', mockHandler);

    // Emit first event
    await eventBus.emit('unsubscribe.test', { test: 1 });
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockHandler).toHaveBeenCalledTimes(1);

    // Unsubscribe
    unsubscribe();

    // Emit second event
    await eventBus.emit('unsubscribe.test', { test: 2 });
    await new Promise(resolve => setTimeout(resolve, 50));

    // Should still be 1 (not called again)
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});