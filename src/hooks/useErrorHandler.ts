// src/hooks/useErrorHandler.ts
import { toaster } from '@/components/ui/toaster';
import { type ApiError } from '@/types/app';

export function useErrorHandler() {
  const handleError = (
    error: unknown, 
    fallbackMessage = 'Ocurrió un error inesperado'
  ) => {
    let message = fallbackMessage;
    
    // Manejo específico para diferentes tipos de errores
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = (error as ApiError).message;
    }

    toaster.create({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });

    // Log del error para debugging
    console.error('Error handled:', error);
  };

  const handleSuccess = (message: string, title = 'Éxito') => {
    toaster.create({
      title,
      description: message,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleWarning = (message: string, title = 'Advertencia') => {
    toaster.create({
      title,
      description: message,
      status: 'warning',
      duration: 4000,
      isClosable: true,
    });
  };

  return { 
    handleError, 
    handleSuccess, 
    handleWarning 
  };
}