import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { errorHandler, ErrorType, ErrorSeverity } from './ErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError = errorHandler.handle(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    this.setState({ errorId: appError.id });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  private handleReportError = () => {
    if (this.state.errorId) {
      // In a real app, this would send the error report to your support system
      alert(`Error reported with ID: ${this.state.errorId}`);
    }
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          padding={8}
        >
          <VStack spacing={6} textAlign="center" maxWidth="md">
            <Heading size="lg" colorPalette="red">
              ¡Oops! Algo salió mal
            </Heading>
            
            <Text color="gray.600" fontSize="md">
              Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado automáticamente.
            </Text>

            {this.state.errorId && (
              <Text fontSize="sm" color="gray.500" fontFamily="mono">
                ID de error: {this.state.errorId}
              </Text>
            )}

            <VStack spacing={3}>
              <Button
                colorPalette="blue"
                onClick={this.handleReload}
              >
                Intentar de nuevo
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReportError}
              >
                Reportar error
              </Button>
            </VStack>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                as="details"
                fontSize="sm"
                textAlign="left"
                maxWidth="full"
                overflow="auto"
              >
                <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                  Ver detalles del error (desarrollo)
                </summary>
                <Text
                  as="pre"
                  background="gray.50"
                  padding={3}
                  borderRadius="md"
                  fontSize="xs"
                  overflow="auto"
                >
                  {this.state.error.stack}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}