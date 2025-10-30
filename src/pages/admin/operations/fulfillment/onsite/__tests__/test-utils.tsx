/**
 * Test utilities for Floor module
 * Provides custom render function with ChakraProvider
 *
 * Based on Chakra UI v3 official docs:
 * https://www.chakra-ui.com/docs/components/concepts/testing
 *
 * In Chakra UI v3, the value prop is MANDATORY - you must pass defaultSystem
 */
import { render, RenderOptions } from '@testing-library/react';
import React from 'react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

/**
 * Wrapper component that provides ChakraProvider with defaultSystem
 * The value prop is required in Chakra UI v3 (breaking change from v2)
 */
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
};

/**
 * Custom render function that wraps components with ChakraProvider
 * Use this instead of RTL's render in tests
 *
 * @example
 * ```tsx
 * import { render, screen } from '../test-utils';
 *
 * test('should render component', () => {
 *   render(<MyComponent />);
 *   expect(screen.getByText('Hello')).toBeInTheDocument();
 * });
 * ```
 */
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Override render with our custom version
export { customRender as render };
