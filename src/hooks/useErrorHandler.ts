// src/hooks/useErrorHandler.ts
import { toaster } from '@/shared/ui/toaster';
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
      type: 'error',
      duration: 5000,
    });

    // Log del error para debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error handled: ${errorMessage}`);
  };

  const handleSuccess = (message: string, title = 'Éxito') => {
    toaster.create({
      title,
      description: message,
      type: 'success',
      duration: 3000,
    });
  };

  const handleWarning = (message: string, title = 'Advertencia') => {
    toaster.create({
      title,
      description: message,
      type: 'warning',
      duration: 4000,
    });
  };

  return { 
    handleError, 
    handleSuccess, 
    handleWarning 
  };
}