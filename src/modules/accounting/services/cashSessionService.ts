/**
 * Cash Session Service
 * Servicios para gestión de sesiones de caja (turnos y arqueos)
 */

import { supabase } from '@/lib/supabase/client';
import { DecimalUtils } from '@/lib/decimal';
import { logger } from '@/lib/logging/Logger';
import { EventBus } from '@/lib/events/EventBus';
import type {
  CashSessionRow,
  CashSessionWithDetails,
  OpenCashSessionInput,
  CloseCashSessionInput,
} from '../types';

/**
 * Obtiene la sesión activa para una ubicación
 */
export async function getActiveCashSession(
  moneyLocationId: string
): Promise<CashSessionRow | null> {
  const { data, error } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('money_location_id', moneyLocationId)
    .eq('status', 'OPEN')
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Obtiene todas las sesiones activas
 */
export async function getAllActiveSessions(): Promise<CashSessionRow[]> {
  const { data, error } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('status', 'OPEN')
    .order('opened_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Abre una nueva sesión de caja
 */
export async function openCashSession(
  input: OpenCashSessionInput,
  userId: string
): Promise<CashSessionRow> {
  logger.info('CashModule', 'Opening cash session', {
    moneyLocationId: input.money_location_id,
    startingCash: input.starting_cash,
    userId,
  });

  // Validar que no haya sesión abierta
  const existingSession = await getActiveCashSession(input.money_location_id);
  if (existingSession) {
    throw new Error('Ya existe una sesión de caja abierta para esta ubicación');
  }

  // Validar starting_cash
  if (!DecimalUtils.isPositiveFinite(input.starting_cash.toString())) {
    throw new Error('El fondo inicial debe ser un monto válido mayor a cero');
  }

  // Crear sesión
  const { data: session, error } = await supabase
    .from('cash_sessions')
    .insert({
      money_location_id: input.money_location_id,
      location_id: input.location_id,
      opened_by: userId,
      starting_cash: input.starting_cash,
      opening_notes: input.opening_notes,
      status: 'OPEN',
    })
    .select()
    .single();

  if (error) {
    logger.error('CashModule', 'Failed to open cash session', { error });
    throw error;
  }

  // Emitir evento
  await EventBus.emit(
    'cash.session.opened',
    {
      sessionId: session.id,
      moneyLocationId: input.money_location_id,
      openedBy: userId,
      startingCash: input.starting_cash,
      timestamp: new Date().toISOString(),
    },
    'CashModule'
  );

  logger.info('CashModule', 'Cash session opened successfully', {
    sessionId: session.id,
  });

  return session;
}

/**
 * Cierra una sesión de caja con arqueo ciego (con idempotency opcional)
 *
 * @param sessionId ID de la sesión a cerrar
 * @param input Datos de cierre (actual_cash, notes)
 * @param userId Usuario que cierra
 * @param operationId UUID opcional para idempotency (generado en cliente)
 * @returns Sesión cerrada
 */
export async function closeCashSession(
  sessionId: string,
  input: CloseCashSessionInput,
  userId: string,
  operationId?: string
): Promise<CashSessionRow> {

  // Si hay operationId, usar idempotency
  if (operationId) {
    const { IdempotencyService } = await import('@/lib/idempotency/IdempotencyService');

    return IdempotencyService.execute({
      operationId,
      operationType: 'close_cash_session',
      operation: () => closeCashSessionInternal(sessionId, input, userId),
      userId,
      params: { sessionId, actualCash: input.actual_cash },
    });
  }

  // Sin operationId, ejecutar normalmente (backwards compatible)
  return closeCashSessionInternal(sessionId, input, userId);
}

/**
 * Implementación interna de closeCashSession (sin idempotency)
 * Esta función contiene la lógica real de cierre
 */
async function closeCashSessionInternal(
  sessionId: string,
  input: CloseCashSessionInput,
  userId: string
): Promise<CashSessionRow> {
  logger.info('CashModule', 'Closing cash session', {
    sessionId,
    actualCash: input.actual_cash,
    userId,
  });

  // Obtener sesión actual
  const { data: session, error: fetchError } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (fetchError) {
    logger.error('CashModule', 'Failed to fetch session', { error: fetchError });
    throw fetchError;
  }

  if (session.status !== 'OPEN') {
    throw new Error('La sesión de caja no está abierta');
  }

  // Validar actual_cash
  if (!DecimalUtils.isPositiveFinite(input.actual_cash.toString())) {
    throw new Error('El efectivo contado debe ser un monto válido mayor o igual a cero');
  }

  // Calcular esperado usando DecimalUtils (dominio 'financial')
  const startingCash = DecimalUtils.fromValue(session.starting_cash, 'financial');
  const cashSales = DecimalUtils.fromValue(session.cash_sales, 'financial');
  const cashRefunds = DecimalUtils.fromValue(session.cash_refunds, 'financial');
  const cashIn = DecimalUtils.fromValue(session.cash_in, 'financial');
  const cashOut = DecimalUtils.fromValue(session.cash_out, 'financial');
  const cashDrops = DecimalUtils.fromValue(session.cash_drops, 'financial');

  // Expected = starting + sales + cash_in - refunds - cash_out - drops
  const expected = DecimalUtils.add(
    startingCash,
    DecimalUtils.subtract(
      DecimalUtils.add(
        DecimalUtils.add(cashSales, cashIn, 'financial'),
        DecimalUtils.fromValue(0, 'financial'),
        'financial'
      ),
      DecimalUtils.add(
        DecimalUtils.add(cashRefunds, cashOut, 'financial'),
        cashDrops,
        'financial'
      ),
      'financial'
    ),
    'financial'
  );

  const actualCash = DecimalUtils.fromValue(input.actual_cash, 'financial');
  const variance = DecimalUtils.subtract(actualCash, expected, 'financial');

  // ✅ FIXED [2.5]: Keep Decimal until end, use DecimalUtils.abs() instead of Math.abs()
  const varianceAbs = DecimalUtils.abs(variance);

  // Determinar status (diferencia > $50 = DISCREPANCY)
  const DISCREPANCY_THRESHOLD = 50;
  const thresholdDecimal = DecimalUtils.fromValue(DISCREPANCY_THRESHOLD, 'financial');
  const finalStatus = DecimalUtils.greaterThan(varianceAbs, thresholdDecimal) 
    ? 'DISCREPANCY' 
    : 'CLOSED';

  // Convert to number only for storage
  const expectedNumber = DecimalUtils.toNumber(expected);
  const varianceNumber = DecimalUtils.toNumber(variance);

  // Actualizar sesión
  const { data: closedSession, error: updateError } = await supabase
    .from('cash_sessions')
    .update({
      closed_by: userId,
      closed_at: new Date().toISOString(),
      expected_cash: expectedNumber,
      actual_cash: input.actual_cash,
      variance: varianceNumber,
      closing_notes: input.closing_notes,
      status: finalStatus,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (updateError) {
    logger.error('CashModule', 'Failed to close session', { error: updateError });
    throw updateError;
  }

  // Si hay varianza, crear journal entry de ajuste
  if (!DecimalUtils.isZero(variance)) {
    logger.info('CashModule', 'Creating variance adjustment journal entry', {
      sessionId: closedSession.id,
      variance: varianceNumber,
    });

    try {
      // Importar dinámicamente para evitar dependencia circular
      const { createJournalEntry } = await import('./journalService');
      const { getMoneyLocationById } = await import('./moneyLocationsService');

      // Obtener money location para obtener el account_code
      const moneyLocation = await getMoneyLocationById(
        closedSession.money_location_id
      );

      if (!moneyLocation) {
        logger.error('CashModule', 'Money location not found for variance adjustment', {
          sessionId: closedSession.id,
          moneyLocationId: closedSession.money_location_id,
        });
        // No lanzar error, el cierre ya se completó
      } else {
        // Obtener el código de cuenta de la money location
        const { getAccountById } = await import('./chartOfAccountsService');
        const account = await getAccountById(moneyLocation.account_id);

        if (!account) {
          logger.error('CashModule', 'Account not found for variance adjustment', {
            sessionId: closedSession.id,
            accountId: moneyLocation.account_id,
          });
        } else {
          // Crear journal entry de ajuste
          // Si variance < 0: faltante (cash disminuye)
          // Si variance > 0: sobrante (cash aumenta)
          
          // ✅ FIXED [2.5]: Keep Decimal until end for comparison
          const isFaltante = DecimalUtils.lessThan(variance, 0, 'financial');
          const absVariance = DecimalUtils.toNumber(varianceAbs);

          await createJournalEntry(
            {
              entry_type: 'ADJUSTMENT',
              transaction_date: closedSession.closed_at!,
              reference_id: closedSession.id,
              reference_type: 'CASH_SESSION',
              description: `Ajuste por ${isFaltante ? 'faltante' : 'sobrante'} en arqueo de caja`,
              notes: input.closing_notes,
              location_id: closedSession.location_id,
              cash_session_id: closedSession.id,
              lines: [
                {
                  // Línea 1: Diferencias de Caja (cuenta de gastos)
                  account_code: '5.9', // Cash Variance
                  amount: isFaltante ? absVariance : -absVariance,
                  description: `Diferencia en arqueo: ${isFaltante ? 'faltante' : 'sobrante'}`,
                },
                {
                  // Línea 2: Cash Location (ajuste al saldo real)
                  account_code: account.code,
                  money_location_id: closedSession.money_location_id,
                  amount: isFaltante ? -absVariance : absVariance,
                  description: 'Ajuste al saldo real contado',
                },
              ],
            },
            userId
          );

          logger.info('CashModule', 'Variance adjustment journal entry created', {
            sessionId: closedSession.id,
            variance: varianceNumber,
            entryType: 'ADJUSTMENT',
          });
        }
      }
    } catch (error) {
      logger.error('CashModule', 'Failed to create variance adjustment journal entry', {
        sessionId: closedSession.id,
        error,
      });
      // No lanzar error, el cierre ya se completó exitosamente
      // El journal entry es opcional para auditoría
    }
  }

  // Emitir evento
  await EventBus.emit(
    'cash.session.closed',
    {
      sessionId: closedSession.id,
      moneyLocationId: closedSession.money_location_id,
      closedBy: userId,
      expectedCash: expectedNumber,
      actualCash: input.actual_cash,
      variance: varianceNumber,
      status: finalStatus,
      timestamp: new Date().toISOString(),
    },
    'CashModule'
  );

  logger.info('CashModule', 'Cash session closed successfully', {
    sessionId: closedSession.id,
    variance: varianceNumber,
    status: finalStatus,
  });

  return closedSession;
}

/**
 * Registra venta en efectivo en sesión activa
 */
export async function recordCashSale(
  moneyLocationId: string,
  amount: number
): Promise<void> {
  const session = await getActiveCashSession(moneyLocationId);
  if (!session) {
    logger.warn('CashModule', 'No active session for cash sale', { moneyLocationId });
    return;
  }

  const currentSales = DecimalUtils.fromValue(session.cash_sales, 'financial');
  const saleAmount = DecimalUtils.fromValue(amount, 'financial');
  const newSales = DecimalUtils.add(currentSales, saleAmount, 'financial');

  const { error } = await supabase
    .from('cash_sessions')
    .update({
      cash_sales: DecimalUtils.toNumber(newSales),
    })
    .eq('id', session.id);

  if (error) {
    logger.error('CashModule', 'Failed to record cash sale', { error });
    throw error;
  }

  logger.info('CashModule', 'Cash sale recorded', {
    sessionId: session.id,
    amount,
  });
}

/**
 * Registra devolución/refund en efectivo en sesión activa
 */
export async function recordCashRefund(
  moneyLocationId: string,
  amount: number
): Promise<void> {
  const session = await getActiveCashSession(moneyLocationId);

  if (!session) {
    logger.warn('CashModule', 'No active session for cash refund', { moneyLocationId });
    throw new Error('No hay sesión de caja activa para registrar devolución');
  }

  const currentRefunds = DecimalUtils.fromValue(session.cash_refunds || 0, 'financial');
  const refundAmount = DecimalUtils.fromValue(amount, 'financial');
  const newRefunds = DecimalUtils.add(currentRefunds, refundAmount, 'financial');

  const { error } = await supabase
    .from('cash_sessions')
    .update({
      cash_refunds: DecimalUtils.toNumber(newRefunds),
    })
    .eq('id', session.id);

  if (error) {
    logger.error('CashModule', 'Failed to record cash refund', { error });
    throw error;
  }

  logger.info('CashModule', 'Cash refund recorded', {
    sessionId: session.id,
    amount,
  });
}

/**
 * Registra retiro parcial (cash drop) a safe
 */
export async function recordCashDrop(
  sessionId: string,
  amount: number,
  notes?: string
): Promise<void> {
  if (!DecimalUtils.isPositiveFinite(amount.toString())) {
    throw new Error('El monto del retiro debe ser válido');
  }

  const { data: session, error: fetchError } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (fetchError) throw fetchError;

  const currentDrops = DecimalUtils.fromValue(session.cash_drops, 'financial');
  const dropAmount = DecimalUtils.fromValue(amount, 'financial');
  const newDrops = DecimalUtils.add(currentDrops, dropAmount, 'financial');

  const { error } = await supabase
    .from('cash_sessions')
    .update({
      cash_drops: DecimalUtils.toNumber(newDrops),
    })
    .eq('id', sessionId);

  if (error) throw error;

  logger.info('CashModule', 'Cash drop recorded', {
    sessionId,
    amount,
    notes,
  });
}

/**
 * Obtiene historial de sesiones
 */
export async function fetchCashSessionHistory(
  filters?: {
    moneyLocationId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }
): Promise<CashSessionRow[]> {
  let query = supabase
    .from('cash_sessions')
    .select('*')
    .order('opened_at', { ascending: false });

  if (filters?.moneyLocationId) {
    query = query.eq('money_location_id', filters.moneyLocationId);
  }

  if (filters?.startDate) {
    query = query.gte('opened_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('opened_at', filters.endDate);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}
