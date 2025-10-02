// src/lib/notifications.ts 
// 🎉 Sistema centralizado de notificaciones para Chakra UI v3.23.0
// ✅ API CORRECTA: type (NO status), NO isClosable, NO duration personalizado
// 🚀 RESULTADO: Sistema unificado, sin duplicación, API correcta

import { toaster } from '@/shared/ui/toaster';

import { logger } from '@/lib/logging';
/**
 * 🎯 NOTIFICATION SYSTEM v3.23.0
 * Sistema centralizado que reemplaza useErrorHandler y unifica todas las notificaciones
 * Usar notify.success(), notify.error(), notify.warning(), notify.info()
 */

interface NotificationOptions {
  title: string;
  description?: string;
  duration?: number;
}

export const notify = {
  /**
   * ✅ Notificación de éxito
   * Para operaciones completadas exitosamente
   */
  success: (options: NotificationOptions) => {
    toaster.create({
      title: options.title,
      description: options.description,
      type: "success", // ✅ CORRECTO: "type" no "status" 
      duration: options.duration || 3000,
    });
  },

  /**
   * ❌ Notificación de error  
   * Para errores, fallos de API, validaciones
   */
  error: (options: NotificationOptions) => {
    toaster.create({
      title: options.title,
      description: options.description,
      type: "error", // ✅ CORRECTO: "type" no "status"
      duration: options.duration || 5000,
    });
  },

  /**
   * ⚠️ Notificación de advertencia
   * Para situaciones que requieren atención pero no son errores
   */
  warning: (options: NotificationOptions) => {
    toaster.create({
      title: options.title,
      description: options.description,
      type: "warning", // ✅ CORRECTO: "type" no "status"
      duration: options.duration || 4000,
    });
  },

  /**
   * ℹ️ Notificación informativa
   * Para información general, tips, confirmaciones
   */
  info: (options: NotificationOptions) => {
    toaster.create({
      title: options.title,
      description: options.description,
      type: "info", // ✅ CORRECTO: "type" no "status"
      duration: options.duration || 3000,
    });
  },

  /**
   * 🔄 Helpers para casos comunes de la aplicación
   */
  
  // ✅ Items/Inventory
  itemCreated: (itemName: string) => notify.success({
    title: "Item creado",
    description: `${itemName} se ha creado exitosamente`
  }),

  itemUpdated: (itemName: string) => notify.success({
    title: "Item actualizado", 
    description: `${itemName} fue actualizado`
  }),

  itemDeleted: (itemName: string) => notify.success({
    title: "Item eliminado",
    description: `${itemName} fue eliminado del inventario`
  }),

  // ✅ Stock operations
  stockAdded: (quantity: number, unit: string) => notify.success({
    title: "Stock agregado",
    description: `Se agregaron ${quantity} ${unit}`
  }),

  stockLow: (itemName: string, currentStock: number, unit: string) => notify.warning({
    title: "Stock bajo",
    description: `${itemName} tiene solo ${currentStock} ${unit} disponibles`
  }),

  stockCritical: (itemName: string) => notify.error({
    title: "Stock crítico",
    description: `${itemName} necesita reposición inmediata`
  }),

  // ✅ Alerts
  alertAcknowledged: () => notify.info({
    title: "Alerta confirmada",
    description: "La alerta fue marcada como vista"
  }),

  alertConfigSaved: (itemName: string) => notify.success({
    title: "Configuración guardada",
    description: `Los umbrales para ${itemName} han sido actualizados`
  }),

  // ✅ General errors
  apiError: (message?: string) => notify.error({
    title: "Error de conexión",
    description: message || "No se pudo conectar con el servidor. Intenta nuevamente."
  }),

  validationError: (message: string) => notify.error({
    title: "Error de validación",
    description: message
  }),

  operationFailed: (operation: string, error?: string) => notify.error({
    title: `Error al ${operation}`,
    description: error || "Operación fallida. Intenta nuevamente."
  }),

  // ✅ Loading states context
  loading: (operation: string) => notify.info({
    title: "Procesando...",
    description: `${operation} en progreso`,
    duration: 2000
  }),

  operationCompleted: (operation: string) => notify.success({
    title: "Operación completada",
    description: `${operation} finalizado exitosamente`
  })
};

/**
 * 🛠️ Error Handler Utility
 * Reemplaza el useErrorHandler hook con función utilitaria
 */
export const handleApiError = (
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
    message = (error as { message: string }).message;
  }

  notify.error({
    title: 'Error',
    description: message
  });

  // Log del error para debugging
  logger.error('App', 'Error handled:', error);
};

/**
 * 🎯 USAGE EXAMPLES:
 * 
 * // ✅ Básico
 * notify.success({ title: "Operación exitosa" });
 * notify.error({ title: "Error", description: "Algo salió mal" });
 * 
 * // ✅ Helpers específicos
 * notify.itemCreated("Harina 000");
 * notify.stockAdded(50, "kg"); 
 * notify.apiError("Conexión perdida");
 * 
 * // ✅ Error handling
 * try {
 *   await createItem(data);
 *   notify.itemCreated(data.name);
 * } catch (error) {
 *   handleApiError(error, "No se pudo crear el item");
 * }
 */