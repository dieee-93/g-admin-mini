import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { useThemeStore } from '@/store/themeStore';
import { getCurrentThemeSystem } from '@/lib/theming/dynamicTheming';
import { vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('@heroicons/react/24/outline', () => {
  const React = require('react');
  return {
    HomeIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'home-icon', className }),
    PlusIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'plus-icon', className }),
    MagnifyingGlassIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'search-icon', className }),
    AdjustmentsHorizontalIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'filter-icon', className }),
    PencilIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'pencil-icon', className }),
    TrashIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'trash-icon', className }),
    EyeIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'eye-icon', className }),
    ChartBarIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'chart-bar-icon', className }),
    CogIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'cog-icon', className }),
    UsersIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'users-icon', className }),
    BuildingStorefrontIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'storefront-icon', className }),
    CubeIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'cube-icon', className }),
    DocumentTextIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'document-icon', className }),
    CalendarIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'calendar-icon', className }),
    CurrencyDollarIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'dollar-icon', className }),
    Cog6ToothIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'cog6tooth-icon', className }),
    BellIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'bell-icon', className }),
    ArrowPathIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'refresh-icon', className }),
    DocumentArrowDownIcon: ({ className }: { className?: string }) => 
      React.createElement('div', { 'data-testid': 'download-icon', className }),
    CheckCircleIcon: ({ className }: { className?: string }) =>
      React.createElement('div', { 'data-testid': 'check-circle-icon', className }),
    ExclamationTriangleIcon: ({ className }: { className?: string }) =>
      React.createElement('div', { 'data-testid': 'exclamation-triangle-icon', className }),
    XCircleIcon: ({ className }: { className?: string }) =>
      React.createElement('div', { 'data-testid': 'x-circle-icon', className }),
    InformationCircleIcon: ({ className }: { className?: string }) =>
      React.createElement('div', { 'data-testid': 'information-circle-icon', className }),
    CalculatorIcon: ({ className }: { className?: string }) =>
      React.createElement('div', { 'data-testid': 'calculator-icon', className }),
    ClockIcon: ({ className }: { className?: string }) =>
      React.createElement('div', { 'data-testid': 'clock-icon', className }),
    FireIcon: ({ className }: { className?: string }) =>
      React.createElement('div', { 'data-testid': 'fire-icon', className }),
  }
})

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    const { currentTheme } = useThemeStore()
    
    // Create dynamic system based on current theme
    const dynamicSystem = getCurrentThemeSystem(currentTheme)
    
  
  
    return (
    <ChakraProvider value={dynamicSystem}>
      {children}
    </ChakraProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
