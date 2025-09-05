import { render, renderHook, act, waitFor } from '@testing-library/react';
import { expect, test, vi, describe, beforeEach, afterEach } from 'vitest';
import React, { useEffect } from 'react';
import { AlertsProvider, useAlerts } from '.';
import { useNavigationBadges } from '@/hooks/useNavigationBadges';
import { useDebouncedCallback } from '@/shared/hooks/useDebouncedCallback';
import { type CreateAlertInput } from '.'; 

// Mock the debounced callback hook to make it synchronous for tests
vi.mock('@/shared/hooks/useDebouncedCallback', () => ({
  useDebouncedCallback: (callback: (...args: any[]) => any) => callback,
}));


const TestComponent = ({ options, onRender }: { options: any, onRender: () => void }) => {
  useAlerts(options);
  useEffect(() => {
    onRender();
  });
  return null;
};

test('useAlerts with inline options should not cause infinite re-renders', () => {
  let renderCount = 0;
  const onRender = () => {
    renderCount++;
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AlertsProvider>{children}</AlertsProvider>
  );

  const { rerender } = render(
    <TestComponent options={{ context: 'global' }} onRender={onRender} />,
    { wrapper: Wrapper }
  );

  for (let i = 0; i < 5; i++) {
    rerender(
      <TestComponent options={{ context: 'global' }} onRender={onRender} />
    );
  }

  expect(renderCount).toBeLessThan(10);
});

const createTestAlert = (overrides: Partial<CreateAlertInput> = {}): CreateAlertInput => ({
  title: 'Test Alert',
  context: 'global',
  severity: 'info',
  type: 'system',
  ...overrides,
});

describe('Alerts System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('should create, acknowledge, and resolve an alert', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AlertsProvider>{children}</AlertsProvider>
    );

    const { result } = renderHook(() => useAlerts(), { wrapper });

    let alertId: string;
    await act(async () => {
      alertId = await result.current.actions.create(createTestAlert());
    });

    await waitFor(() => {
      expect(result.current.alerts).toHaveLength(1);
    });
    expect(result.current.alerts[0].title).toBe('Test Alert');
    expect(result.current.alerts[0].status).toBe('active');

    await act(async () => {
      await result.current.actions.acknowledge(alertId);
    });

    await waitFor(() => {
      expect(result.current.alerts[0].status).toBe('acknowledged');
    });

    await act(async () => {
      await result.current.actions.resolve(alertId);
    });

    await waitFor(() => {
      expect(result.current.alerts[0].status).toBe('resolved');
    });
  });

  test('should filter alerts by status', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AlertsProvider>{children}</AlertsProvider>
    );

    const { result, rerender } = renderHook(({ status }) => useAlerts({ status, autoFilter: true }), {
      wrapper,
      initialProps: { status: ['active', 'acknowledged', 'resolved', 'dismissed'] as any },
    });

    await act(async () => {
      await result.current.actions.create(createTestAlert({ title: 'Alert 1' }));
      const alert2Id = await result.current.actions.create(createTestAlert({ title: 'Alert 2' }));
      await result.current.actions.acknowledge(alert2Id);
    });
    
    await waitFor(() => {
        rerender({ status: ['active'] });
        expect(result.current.alerts).toHaveLength(1);
        expect(result.current.alerts[0].title).toBe('Alert 1');
    });

    await waitFor(() => {
        rerender({ status: ['acknowledged'] });
        expect(result.current.alerts).toHaveLength(1);
        expect(result.current.alerts[0].title).toBe('Alert 2');
    });
  });

  test('useNavigationBadges should return correct counts', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AlertsProvider>{children}</AlertsProvider>
    );

    const useTestHook = () => {
        const alertsApi = useAlerts();
        const badges = useNavigationBadges();
        return { alertsApi, badges };
    }

    const { result, rerender } = renderHook(() => useTestHook(), { wrapper });

    expect(result.current.badges.global).toBe(0);
    
    await act(async () => {
      await result.current.alertsApi.actions.create(createTestAlert({ context: 'global' }));
      await result.current.alertsApi.actions.create(createTestAlert({ context: 'sales' }));
      await result.current.alertsApi.actions.create(createTestAlert({ context: 'sales' }));
    });
    
    rerender();

    await waitFor(() => {
      expect(result.current.badges.global).toBe(1);
      expect(result.current.badges.sales).toBe(2);
      expect(result.current.badges.materials).toBe(0);
    });
  });
});
