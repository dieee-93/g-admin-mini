/**
 * Standardized Error Handling Utilities
 * Extracted from customers, materials, products patterns
 */
import { notify } from '@/lib/notifications';

export interface ErrorConfig {
  module: string;
  operation: string;
  showToast?: boolean;
  logToConsole?: boolean;
  fallbackMessage?: string;
}

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

/**
 * Standardized error handler for async operations
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  config: ErrorConfig
): Promise<T | null> {
  const { module, operation: op, showToast = true, logToConsole = true, fallbackMessage } = config;

  try {
    return await operation();
  } catch (error) {
    const errorMessage = fallbackMessage || `Error en ${op} de ${module}`;

    if (logToConsole) {
      console.error(`[${module}] ${op} failed:`, error);
    }

    if (showToast) {
      notify.error({
        title: 'ERROR',
        description: errorMessage
      });
    }

    return null;
  }
}

/**
 * Standardized confirmation dialog
 */
export function confirmAction(config: ConfirmationConfig): boolean {
  const { title, message, confirmText = 'Confirmar', cancelText = 'Cancelar' } = config;

  return window.confirm(`${title}\n\n${message}\n\n[${confirmText}] / [${cancelText}]`);
}

/**
 * CRUD operation patterns
 */
export const CRUDHandlers = {
  async create<T>(
    createFn: () => Promise<T>,
    entityName: string,
    onSuccess?: () => void
  ): Promise<T | null> {
    const result = await handleAsyncOperation(createFn, {
      module: entityName,
      operation: 'crear'
    });

    if (result && onSuccess) {
      notify.success({
        title: 'CREATED',
        description: `${entityName} creado correctamente`
      });
      onSuccess();
    }

    return result;
  },

  async update<T>(
    updateFn: () => Promise<T>,
    entityName: string,
    onSuccess?: () => void
  ): Promise<T | null> {
    const result = await handleAsyncOperation(updateFn, {
      module: entityName,
      operation: 'actualizar'
    });

    if (result && onSuccess) {
      notify.success({
        title: 'UPDATED',
        description: `${entityName} actualizado correctamente`
      });
      onSuccess();
    }

    return result;
  },

  async delete<T>(
    deleteFn: () => Promise<T>,
    entityName: string,
    confirmationMessage?: string,
    onSuccess?: () => void
  ): Promise<T | null> {
    const confirmed = confirmAction({
      title: `Eliminar ${entityName}`,
      message: confirmationMessage || `¿Estás seguro de eliminar este ${entityName}?`
    });

    if (!confirmed) return null;

    const result = await handleAsyncOperation(deleteFn, {
      module: entityName,
      operation: 'eliminar'
    });

    if (result && onSuccess) {
      notify.success({
        title: 'DELETED',
        description: `${entityName} eliminado correctamente`
      });
      onSuccess();
    }

    return result;
  }
};

/**
 * Network error handling
 */
export function handleNetworkError(error: unknown, module: string): void {
  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      notify.error({
        title: 'ERROR DE CONEXIÓN',
        description: `Sin conexión al servidor. Verifica tu conexión e intenta nuevamente.`
      });
    } else {
      notify.error({
        title: 'ERROR',
        description: `Error en ${module}: ${error.message}`
      });
    }
  } else {
    notify.error({
      title: 'ERROR',
      description: `Error desconocido en ${module}`
    });
  }
}

/**
 * Validation error handling
 */
export function handleValidationErrors(errors: Record<string, any>): string[] {
  const messages: string[] = [];

  Object.entries(errors).forEach(([field, error]) => {
    if (error?.message) {
      messages.push(`${field}: ${error.message}`);
    }
  });

  return messages;
}