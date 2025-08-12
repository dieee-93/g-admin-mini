import { useCallback } from 'react';
import { errorHandler, AppError, ErrorType, ErrorSeverity } from './ErrorHandler';

export interface UseErrorHandlerReturn {
  handleError: (error: Error | AppError, context?: Record<string, any>) => AppError;
  handleValidationError: (message: string, details?: any) => AppError;
  handleNetworkError: (message: string, details?: any) => AppError;
  handleAuthError: (message: string, details?: any) => AppError;
  handleBusinessError: (message: string, details?: any) => AppError;
  getRecentErrors: () => AppError[];
  clearErrors: () => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const handleError = useCallback((error: Error | AppError, context?: Record<string, any>) => {
    return errorHandler.handle(error, context);
  }, []);

  const handleValidationError = useCallback((message: string, details?: any) => {
    const error = new Error(message);
    error.name = 'ValidationError';
    return errorHandler.handle(error, { type: 'validation', details });
  }, []);

  const handleNetworkError = useCallback((message: string, details?: any) => {
    const error = new Error(message);
    error.name = 'NetworkError';
    return errorHandler.handle(error, { type: 'network', details });
  }, []);

  const handleAuthError = useCallback((message: string, details?: any) => {
    const error = new Error(message);
    error.name = 'AuthError';
    return errorHandler.handle(error, { type: 'auth', details });
  }, []);

  const handleBusinessError = useCallback((message: string, details?: any) => {
    const error = new Error(message);
    error.name = 'BusinessError';
    return errorHandler.handle(error, { type: 'business', details });
  }, []);

  const getRecentErrors = useCallback(() => {
    return errorHandler.getRecentErrors();
  }, []);

  const clearErrors = useCallback(() => {
    errorHandler.clearQueue();
  }, []);

  return {
    handleError,
    handleValidationError,
    handleNetworkError,
    handleAuthError,
    handleBusinessError,
    getRecentErrors,
    clearErrors
  };
};