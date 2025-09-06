/**
 * Testing Utilities for E2E Tests
 * Provides helpers for rendering components with providers and mocking data
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Test providers wrapper
interface ProvidersProps {
  children: React.ReactNode;
}

const TestProviders: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <div data-testid="chakra-provider">
        {/* All providers are mocked in setupTests.ts */}
        {children}
      </div>
    </BrowserRouter>
  );
};

/**
 * Render component with all necessary providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TestProviders, ...options });
}

/**
 * Mock data storage
 */
const mockDataStore = new Map<string, any[]>();

/**
 * Mock Supabase data for testing
 */
export function mockSupabaseData(table: string, data: any[]): void {
  mockDataStore.set(table, data);
}

/**
 * Get mock data for table
 */
export function getMockData(table: string): any[] {
  return mockDataStore.get(table) || [];
}

/**
 * Clear all mock data
 */
export function clearMockData(): void {
  mockDataStore.clear();
}

/**
 * Create mock Supabase client
 */
export function createMockSupabaseClient() {
  const mockFrom = vi.fn((table: string) => {
    const data = getMockData(table);
    
    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockImplementation((newData) => {
        const currentData = getMockData(table);
        const inserted = Array.isArray(newData) ? newData : [newData];
        const withIds = inserted.map((item, index) => ({
          ...item,
          id: item.id || `mock_${Date.now()}_${index}`,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
        }));
        
        mockSupabaseData(table, [...currentData, ...withIds]);
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: withIds[0], 
              error: null 
            })
          })
        };
      }),
      update: vi.fn().mockImplementation((updates) => {
        return {
          eq: vi.fn().mockImplementation((column, value) => {
            const currentData = getMockData(table);
            const updatedData = currentData.map(item => 
              item[column] === value 
                ? { ...item, ...updates, updated_at: new Date().toISOString() }
                : item
            );
            mockSupabaseData(table, updatedData);
            
            return {
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: updatedData.find(item => item[column] === value), 
                  error: null 
                })
              })
            };
          })
        };
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockImplementation((column, value) => {
          const currentData = getMockData(table);
          const filteredData = currentData.filter(item => item[column] !== value);
          mockSupabaseData(table, filteredData);
          
          return Promise.resolve({ data: null, error: null });
        })
      }),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: data[0] || null, 
        error: null 
      }),
      then: vi.fn().mockImplementation((callback) => 
        callback({ data, error: null })
      )
    };
  });

  const mockRpc = vi.fn().mockImplementation((functionName, params) => {
    // Mock RPC functions based on name
    switch (functionName) {
      case 'get_employee_performance':
        return Promise.resolve({
          data: [{
            month: '2024-01',
            total_hours: 160,
            efficiency_score: 85,
            quality_score: 90,
            punctuality_score: 95
          }],
          error: null
        });
      
      case 'calculate_labor_costs':
        return Promise.resolve({
          data: [{
            employee_id: params?.employee_id || '1',
            employee_name: 'Juan Pérez',
            department: 'Cocina',
            regular_hours: 40,
            overtime_hours: 5,
            regular_cost: 1000,
            overtime_cost: 187.5,
            total_cost: 1187.5
          }],
          error: null
        });
      
      case 'get_labor_cost_summary':
        return Promise.resolve({
          data: [{
            total_cost: 5000,
            regular_cost: 4200,
            overtime_cost: 800,
            total_hours: 200,
            overtime_hours: 15,
            avg_hourly_rate: 22.5,
            variance_from_budget: -200,
            variance_percentage: -3.8
          }],
          error: null
        });
      
      default:
        return Promise.resolve({ data: [], error: null });
    }
  });

  return {
    from: mockFrom,
    rpc: mockRpc,
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ 
        data: { user: { id: '1', email: 'test@example.com' } }, 
        error: null 
      }),
      signUp: vi.fn().mockResolvedValue({ 
        data: { user: { id: '1', email: 'test@example.com' } }, 
        error: null 
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      })
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
        remove: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ 
          data: { publicUrl: 'http://example.com/file.png' } 
        })
      }))
    }
  };
}

/**
 * Wait for element with timeout
 */
export async function waitForElementWithTimeout(
  getElement: () => HTMLElement | null,
  timeout: number = 5000
): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      const element = getElement();
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element not found within ${timeout}ms`));
      } else {
        setTimeout(check, 100);
      }
    };
    
    check();
  });
}

/**
 * Create performance measurement utility
 */
export class PerformanceTracker {
  private measurements: Map<string, number> = new Map();

  start(name: string): void {
    this.measurements.set(name, performance.now());
  }

  end(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      throw new Error(`Performance measurement '${name}' was not started`);
    }
    
    const duration = performance.now() - startTime;
    this.measurements.delete(name);
    return duration;
  }

  measure<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
    this.start(name);
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = this.end(name);
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      });
    } else {
      const duration = this.end(name);
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      return result;
    }
  }

  getAllMeasurements(): { [key: string]: number } {
    return Object.fromEntries(this.measurements);
  }

  reset(): void {
    this.measurements.clear();
  }
}

/**
 * Create a performance tracker instance
 */
export const performanceTracker = new PerformanceTracker();

/**
 * Mock console methods for testing
 */
export function mockConsole() {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  const mockLog = vi.fn();
  const mockWarn = vi.fn();
  const mockError = vi.fn();

  console.log = mockLog;
  console.warn = mockWarn;
  console.error = mockError;

  return {
    mockLog,
    mockWarn,
    mockError,
    restore: () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    }
  };
}

/**
 * Create mock intersection observer for virtualized lists
 */
export function mockIntersectionObserver() {
  const mockIntersectionObserver = vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }));

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });

  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });

  return mockIntersectionObserver;
}

/**
 * Create mock resize observer for responsive components
 */
export function mockResizeObserver() {
  const mockResizeObserver = vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }));

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: mockResizeObserver,
  });

  return mockResizeObserver;
}

/**
 * Setup viewport for responsive testing
 */
export function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
}

/**
 * Create a test user event with custom configuration
 */
export function createTestUser(options: { delay?: number } = {}) {
  return {
    type: async (element: HTMLElement, text: string) => {
      const user = (await import('@testing-library/user-event')).default;
      return user.setup({ delay: options.delay || 0 }).type(element, text);
    },
    click: async (element: HTMLElement) => {
      const user = (await import('@testing-library/user-event')).default;
      return user.setup({ delay: options.delay || 0 }).click(element);
    },
    clear: async (element: HTMLElement) => {
      const user = (await import('@testing-library/user-event')).default;
      return user.setup({ delay: options.delay || 0 }).clear(element);
    },
    selectOptions: async (element: HTMLElement, value: string | string[]) => {
      const user = (await import('@testing-library/user-event')).default;
      return user.setup({ delay: options.delay || 0 }).selectOptions(element, value);
    }
  };
}

// Export commonly used testing utilities
export * from '@testing-library/react';
export { vi } from 'vitest';