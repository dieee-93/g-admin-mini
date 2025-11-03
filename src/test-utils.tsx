/**
 * Test Utilities
 * Custom render function with ChakraProvider wrapper
 */

import { render as rtlRender, type RenderOptions } from '@testing-library/react';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';

// Create a simple system for tests
const system = createSystem(defaultConfig);

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here if needed
}

/**
 * Custom render function that wraps components with ChakraProvider
 * Use this instead of the default render from @testing-library/react
 */
export function render(
  ui: React.ReactElement,
  options?: CustomRenderOptions
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChakraProvider value={system}>
      {children}
    </ChakraProvider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Override the render export
export { render as default };
