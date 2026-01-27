/**
 * Idempotency Service
 * Previene ejecución duplicada de operaciones críticas mediante locks distribuidos
 *
 * USO:
 * ```typescript
 * const result = await IdempotencyService.execute({
 *   operationId: clientGeneratedUUID,  // UUID generado en cliente
 *   operationType: 'close_cash_session',
 *   operation: () => closeCashSessionInternal(sessionId, input, userId),
 *   userId,
 *   params: { sessionId, input }
 * });
 * ```
 *
 * CASOS DE USO:
 * 1. closeCashSession() - Prevenir cierre duplicado de caja
 * 2. createJournalEntry() - Prevenir journal entries duplicados
 * 3. processPayment() - Prevenir pagos duplicados
 * 4. Cualquier operación que deba ejecutarse exactamente una vez
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging/Logger';

export interface IdempotentOperation<T> {
  /** UUID generado por el cliente (debe ser único por operación) */
  operationId: string;

  /** Tipo de operación (para logging y debugging) */
  operationType: string;

  /** Función a ejecutar idempotentemente */
  operation: () => Promise<T>;

  /** ID del usuario ejecutando la operación (opcional) */
  userId?: string;

  /** Parámetros de la operación (para debugging, opcional) */
  params?: Record<string, unknown>;

  /** TTL en segundos (default: 24 horas) */
  ttlSeconds?: number;
}

/**
 * Status de una operación idempotente
 */
export type OperationStatus = 'processing' | 'completed' | 'failed';

/**
 * Servicio de Idempotency para prevenir operaciones duplicadas
 *
 * ARQUITECTURA:
 * - Usa tabla `operation_locks` con client-generated UUIDs
 * - Lock atómico vía unique constraint en `id`
 * - Retry automático en caso de race conditions
 * - Cleanup automático de locks expirados
 *
 * GARANTÍAS:
 * - At-most-once execution: Una operación con el mismo ID se ejecuta máximo 1 vez
 * - Idempotent retries: Si falla el cliente, puede reintentar con el mismo ID
 * - Result caching: Retorna resultado cacheado si ya se completó
 */
export class IdempotencyService {

  /**
   * Ejecuta operación idempotentemente
   *
   * FLUJO:
   * 1. Check si operación ya existe (por operationId)
   * 2. Si existe y está completed → retorna resultado cacheado
   * 3. Si existe y está failed → lanza error
   * 4. Si existe y está processing → espera y reintenta
   * 5. Si no existe → crea lock y ejecuta
   * 6. Si falla al crear lock (race condition) → reintenta
   *
   * @throws Error si la operación falla o si ya falló anteriormente
   * @returns Resultado de la operación (puede ser cacheado)
   */
  static async execute<T>(config: IdempotentOperation<T>): Promise<T> {
    const {
      operationId,
      operationType,
      operation,
      userId,
      params,
      ttlSeconds = 86400 // 24 hours default
    } = config;

    logger.debug('IdempotencyService', 'Executing idempotent operation', {
      operationId,
      operationType,
    });

    // 1. Check if operation already exists
    const { data: existing, error: fetchError } = await supabase
      .from('operation_locks')
      .select('*')
      .eq('id', operationId)
      .maybeSingle();

    if (fetchError) {
      logger.error('IdempotencyService', 'Failed to check existing operation', {
        error: fetchError,
        operationId,
      });
      throw fetchError;
    }

    if (existing) {
      // 2. Si ya existe, manejar según status
      if (existing.status === 'completed') {
        // Already completed, return cached result
        logger.info('IdempotencyService', 'Returning cached result', {
          operationId,
          operationType,
        });
        return existing.result as T;
      }

      if (existing.status === 'failed') {
        // Previously failed, throw error
        logger.warn('IdempotencyService', 'Operation previously failed', {
          operationId,
          operationType,
          errorMessage: existing.error_message,
        });
        throw new Error(`Operation previously failed: ${existing.error_message}`);
      }

      if (existing.status === 'processing') {
        // Another process is handling this, wait and retry
        logger.info('IdempotencyService', 'Operation in progress, waiting...', {
          operationId,
          operationType,
        });
        await this.sleep(200); // Wait 200ms
        return this.execute(config); // Recursive retry
      }
    }

    // 3. Create lock (atomic operation via unique constraint)
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    const { error: lockError } = await supabase
      .from('operation_locks')
      .insert({
        id: operationId,
        operation_type: operationType,
        status: 'processing',
        request_params: params || {},
        user_id: userId,
        expires_at: expiresAt,
      });

    if (lockError) {
      // Race condition: another process created lock first
      if (lockError.code === '23505') { // unique_violation
        logger.debug('IdempotencyService', 'Race condition detected, retrying', {
          operationId,
          operationType,
        });
        await this.sleep(100); // Wait 100ms
        return this.execute(config); // Recursive retry
      }

      // Other error
      logger.error('IdempotencyService', 'Failed to create lock', {
        error: lockError,
        operationId,
      });
      throw lockError;
    }

    logger.info('IdempotencyService', 'Lock acquired, executing operation', {
      operationId,
      operationType,
    });

    // 4. Execute operation
    try {
      const result = await operation();

      // 5. Mark as completed
      const { error: updateError } = await supabase
        .from('operation_locks')
        .update({
          status: 'completed',
          result: result as any,
          completed_at: new Date().toISOString(),
        })
        .eq('id', operationId);

      if (updateError) {
        logger.error('IdempotencyService', 'Failed to mark operation as completed', {
          error: updateError,
          operationId,
        });
        // Operation succeeded but failed to update status
        // Return result anyway (best effort)
      }

      logger.info('IdempotencyService', 'Operation completed successfully', {
        operationId,
        operationType,
      });

      return result;

    } catch (error) {
      // 6. Mark as failed
      const errorMessage = error instanceof Error ? error.message : String(error);

      const { error: updateError } = await supabase
        .from('operation_locks')
        .update({
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', operationId);

      if (updateError) {
        logger.error('IdempotencyService', 'Failed to mark operation as failed', {
          error: updateError,
          operationId,
        });
      }

      logger.error('IdempotencyService', 'Operation failed', {
        operationId,
        operationType,
        error: errorMessage,
      });

      throw error;
    }
  }

  /**
   * Sleep helper (promisified setTimeout)
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Limpia locks expirados (ejecutar diariamente)
   *
   * IMPORTANTE: Esto debe ejecutarse en un cron job o scheduled task
   * Por ejemplo, en Supabase Edge Functions o similar
   *
   * @returns Cantidad de locks eliminados
   */
  static async cleanupExpired(): Promise<number> {
    logger.info('IdempotencyService', 'Starting cleanup of expired locks');

    const { data, error } = await supabase
      .from('operation_locks')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select();

    if (error) {
      logger.error('IdempotencyService', 'Failed to cleanup expired locks', {
        error,
      });
      throw error;
    }

    const count = data?.length || 0;
    logger.info('IdempotencyService', 'Cleaned up expired locks', { count });

    return count;
  }

  /**
   * Obtiene status de una operación
   *
   * @param operationId UUID de la operación
   * @returns Status y resultado (si existe)
   */
  static async getOperationStatus(
    operationId: string
  ): Promise<{
    status: OperationStatus;
    result?: any;
    error_message?: string;
    created_at: string;
    completed_at?: string;
  } | null> {
    const { data, error } = await supabase
      .from('operation_locks')
      .select('status, result, error_message, created_at, completed_at')
      .eq('id', operationId)
      .maybeSingle();

    if (error) {
      logger.error('IdempotencyService', 'Failed to get operation status', {
        error,
        operationId,
      });
      throw error;
    }

    return data;
  }

  /**
   * Fuerza completar una operación que quedó stuck en 'processing'
   * USAR CON CUIDADO: Solo si estás seguro que la operación no se está ejecutando
   *
   * @param operationId UUID de la operación
   * @param result Resultado a guardar
   */
  static async forceComplete<T>(
    operationId: string,
    result: T
  ): Promise<void> {
    logger.warn('IdempotencyService', 'Force completing operation', {
      operationId,
    });

    const { error } = await supabase
      .from('operation_locks')
      .update({
        status: 'completed',
        result: result as any,
        completed_at: new Date().toISOString(),
      })
      .eq('id', operationId);

    if (error) {
      logger.error('IdempotencyService', 'Failed to force complete operation', {
        error,
        operationId,
      });
      throw error;
    }

    logger.info('IdempotencyService', 'Operation force completed', {
      operationId,
    });
  }

  /**
   * Elimina una operación (para testing o recovery)
   * USAR CON CUIDADO: Permite re-ejecutar la operación
   *
   * @param operationId UUID de la operación
   */
  static async deleteOperation(operationId: string): Promise<void> {
    logger.warn('IdempotencyService', 'Deleting operation', {
      operationId,
    });

    const { error } = await supabase
      .from('operation_locks')
      .delete()
      .eq('id', operationId);

    if (error) {
      logger.error('IdempotencyService', 'Failed to delete operation', {
        error,
        operationId,
      });
      throw error;
    }

    logger.info('IdempotencyService', 'Operation deleted', {
      operationId,
    });
  }
}
