import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, VStack, Text, Button, CardWrapper, Alert } from '@chakra-ui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error caught by ErrorBoundary in ${this.props.moduleName || 'Unknown module'}:`, {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });

    // TODO: Send error to monitoring service
    // reportError(error, { moduleName: this.props.moduleName, errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box p="6" maxW="600px" mx="auto" mt="8">
          <Card.Root>
            <Card.Body>
              <VStack gap="6" textAlign="center">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto" />
                
                <VStack gap="2">
                  <Text fontSize="xl" fontWeight="bold" color="red.500">
                    Error en {this.props.moduleName || 'Módulo'}
                  </Text>
                  <Text color="gray.600">
                    Algo salió mal al cargar este módulo. Por favor, intenta nuevamente.
                  </Text>
                </VStack>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <Alert.Root status="error" variant="subtle">
                    <Alert.Title>Error Details (Development)</Alert.Title>
                    <Alert.Description>
                      <Text fontSize="sm" fontFamily="mono">
                        {this.state.error.message}
                      </Text>
                      {this.state.errorInfo && (
                        <Text fontSize="xs" fontFamily="mono" mt="2" opacity="0.8">
                          {this.state.errorInfo.componentStack}
                        </Text>
                      )}
                    </Alert.Description>
                  </Alert.Root>
                )}

                <VStack gap="2">
                  <Button colorPalette="blue" onClick={this.handleRetry}>
                    Reintentar
                  </Button>
                  <Button variant="outline" onClick={this.handleReload}>
                    Recargar Página
                  </Button>
                </VStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Box>
      );
    }

    return this.props.children;
  }
}