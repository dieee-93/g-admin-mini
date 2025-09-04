import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { Provider } from '@/shared/ui/provider';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>
    {children}
  </Provider>
);

describe('ErrorBoundary', () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when there is an error', () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText(/Ha ocurrido un error inesperado/)).toBeInTheDocument();
  });

  it('should display error ID', () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText(/ID de error:/)).toBeInTheDocument();
  });

  it('should render custom fallback UI when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <TestWrapper>
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('¡Oops! Algo salió mal')).not.toBeInTheDocument();
  });

  it('should handle retry functionality', async () => {
    let renderAttempts = 0;

    // This component will throw an error on its first two render attempts,
    // which accounts for React's Strict Mode double-rendering in tests.
    // On the third attempt (triggered by the retry button), it will succeed.
    const ComponentThatThrowsInStrictMode = () => {
      renderAttempts += 1;
      if (renderAttempts <= 2) {
        throw new Error('Failing during initial render');
      }
      return <div>Success!</div>;
    };

    // Reset counter for this specific test
    renderAttempts = 0;

    render(
      <TestWrapper>
        <ErrorBoundary>
          <ComponentThatThrowsInStrictMode />
        </ErrorBoundary>
      </TestWrapper>
    );

    // After the initial render (which includes a strict mode re-render),
    // the error boundary should be displayed.
    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /intentar de nuevo/i });
    fireEvent.click(retryButton);

    // After clicking retry, the component should render successfully on the 3rd attempt.
    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    // The error UI should now be gone.
    expect(screen.queryByText('¡Oops! Algo salió mal')).not.toBeInTheDocument();
  });

  it('should handle error reporting', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    const reportButton = screen.getByRole('button', { name: /reportar error/i });
    fireEvent.click(reportButton);

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Error reported with ID:'));

    alertSpy.mockRestore();
  });

  it('should call custom onError handler', () => {
    const onErrorMock = vi.fn();

    render(
      <TestWrapper>
        <ErrorBoundary onError={onErrorMock}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText('Ver detalles del error (desarrollo)')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.queryByText('Ver detalles del error (desarrollo)')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});