import { useState, useCallback } from 'react';
import { 
  createValidationSchema, 
  validateData
} from '@/lib/validation';
import type { ValidationResult } from '@/lib/validation';
import { secureApiCall } from '@/lib/validation/security';
import { useApp } from '@/hooks/useZustandStores';

interface UseValidationOptions {
  showWarnings?: boolean;
  autoSanitize?: boolean;
  requireAuth?: boolean;
  logOperations?: boolean;
}

export function useValidation(
  type: 'inventory' | 'customer' | 'sale' | 'staff',
  options: UseValidationOptions = {}
) {
  const [validating, setValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const { handleError } = useApp();

  const validate = useCallback(async (data: unknown): Promise<ValidationResult> => {
    setValidating(true);
    setValidationErrors([]);
    setValidationWarnings([]);

    try {
      const schema = createValidationSchema(type);
      const result = validateData(data, schema);

      // Set errors and warnings in state
      setValidationErrors(result.errors.map(e => e.message));
      setValidationWarnings(result.warnings?.map(w => w.message) || []);

      // Handle warnings if enabled
      if (options.showWarnings && result.warnings && result.warnings.length > 0) {
        const proceedWithWarnings = window.confirm(
          `Advertencias encontradas:\n${result.warnings.map(w => w.message).join('\n')}\n\n¿Desea continuar?`
        );
        
        if (!proceedWithWarnings) {
          return { ...result, isValid: false };
        }
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error durante validación';
      setValidationErrors([errorMessage]);
      handleError(error as Error, { operation: 'validation', type, data });
      
      return {
        isValid: false,
        errors: [{ field: 'general', message: errorMessage, code: 'validation_error', severity: 'error' as const }],
        warnings: []
      };
    } finally {
      setValidating(false);
    }
  }, [type, options.showWarnings, handleError]);

  const validateAndExecute = useCallback(async <T>(
    data: any,
    operation: (sanitizedData: unknown) => Promise<T>,
    securityOptions: {
      requiredPermissions?: string[];
      rateLimit?: { maxRequests: number; windowMs: number };
    } = {}
  ): Promise<T | null> => {
    const validationResult = await validate(data);
    
    if (!validationResult.isValid) {
      return null;
    }

    const sanitizedData = options.autoSanitize 
      ? validationResult.sanitizedData || data 
      : data;

    try {
      return await secureApiCall(
        () => operation(sanitizedData),
        {
          requireAuth: options.requireAuth,
          requiredPermissions: securityOptions.requiredPermissions,
          sanitizeInput: options.autoSanitize,
          logAccess: options.logOperations,
          rateLimit: securityOptions.rateLimit
        }
      );
    } catch (error) {
      handleError(error as Error, { 
        operation: 'validateAndExecute', 
        type, 
        data: sanitizedData 
      });
      throw error;
    }
  }, [validate, options, handleError]);

  const clearValidationState = useCallback(() => {
    setValidationErrors([]);
    setValidationWarnings([]);
  }, []);

  return {
    validate,
    validateAndExecute,
    validating,
    validationErrors,
    validationWarnings,
    hasErrors: validationErrors.length > 0,
    hasWarnings: validationWarnings.length > 0,
    clearValidationState
  };
}