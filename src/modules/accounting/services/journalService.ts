/**
 * Journal Service
 * Servicios para gestión de asientos contables (Journal Entries) - Sistema de Doble Entrada
 */

import { supabase } from '@/lib/supabase/client';
import { DecimalUtils } from '@/lib/decimal';
import { logger } from '@/lib/logging/Logger';
import { EventBus } from '@/lib/events/EventBus';
import type {
  JournalEntryRow,
  JournalLineRow,
  JournalEntryWithLines,
  CreateJournalEntryInput,
  MoneyMovementRow,
} from '../types';
import { getAccountByCode } from './chartOfAccountsService';

/**
 * Genera un número único de entry
 * Formato: JE-YYYY-NNNNNN (ejemplo: JE-2025-000123)
 */
export async function generateEntryNumber(type: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `JE-${year}-`;

  const { count, error } = await supabase
    .from('journal_entries')
    .select('id', { count: 'exact', head: true })
    .like('entry_number', `${prefix}%`);

  if (error) {
    logger.error('CashModule', 'Error generating entry number', { error });
    throw error;
  }

  const nextNumber = (count || 0) + 1;
  return `${prefix}${String(nextNumber).padStart(6, '0')}`;
}

/**
 * Valida que las líneas del journal entry sumen 0 (balance)
 */
function validateJournalBalance(lines: { amount: number }[]): void {
  const balance = lines.reduce((sum, line) => {
    return DecimalUtils.add(
      sum,
      DecimalUtils.fromValue(line.amount, 'financial'),
      'financial'
    );
  }, DecimalUtils.fromValue(0, 'financial'));

  if (!DecimalUtils.isZero(balance)) {
    const balanceStr = DecimalUtils.toString(balance);
    throw new Error(
      `Journal entry no balancea. La suma de las líneas debe ser 0. Actual: ${balanceStr}`
    );
  }
}

/**
 * Crea un journal entry (asiento contable) con doble entrada
 *
 * IMPORTANTE:
 * - Negativo = Débito (aumenta activos y gastos)
 * - Positivo = Crédito (aumenta pasivos, patrimonio e ingresos)
 * - La suma de todas las líneas DEBE ser 0
 *
 * Ejemplo (Venta en efectivo $1000):
 * ```
 * lines: [
 *   { account_code: '1.1.01.001', amount: -1000 },  // Débito: Cash aumenta
 *   { account_code: '4.1', amount: +826.45 },       // Crédito: Revenue
 *   { account_code: '2.1.02', amount: +173.55 }     // Crédito: IVA
 * ]
 * // Suma: -1000 + 826.45 + 173.55 = 0 ✅
 * ```
 */
export async function createJournalEntry(
  input: CreateJournalEntryInput,
  userId: string
): Promise<JournalEntryWithLines> {
  logger.info('CashModule', 'Creating journal entry', {
    entryType: input.entry_type,
    linesCount: input.lines.length,
    userId,
  });

  // Validar que haya al menos 2 líneas (doble entrada)
  if (input.lines.length < 2) {
    throw new Error('Un journal entry debe tener al menos 2 líneas (doble entrada)');
  }

  // Validar que las líneas balanceen a 0
  validateJournalBalance(input.lines);

  // Generar entry_number
  const entryNumber = await generateEntryNumber(input.entry_type);

  // Crear journal entry (header)
  const { data: entry, error: entryError } = await supabase
    .from('journal_entries')
    .insert({
      entry_number: entryNumber,
      entry_type: input.entry_type,
      transaction_date: input.transaction_date || new Date().toISOString(),
      posting_date: new Date().toISOString(),
      reference_id: input.reference_id,
      reference_type: input.reference_type,
      external_reference: input.external_reference,
      description: input.description,
      notes: input.notes,
      location_id: input.location_id,
      cash_session_id: input.cash_session_id,
      created_by: userId,
      is_posted: false,
    })
    .select()
    .single();

  if (entryError) {
    logger.error('CashModule', 'Failed to create journal entry header', {
      error: entryError,
    });
    throw entryError;
  }

  logger.debug('CashModule', 'Journal entry header created', {
    entryId: entry.id,
    entryNumber,
  });

  // Crear journal lines
  try {
    const linesData = await Promise.all(
      input.lines.map(async (line) => {
        // Obtener account_id por code
        const account = await getAccountByCode(line.account_code);
        if (!account) {
          throw new Error(`Cuenta no encontrada: ${line.account_code}`);
        }

        // Validar que la cuenta permita transacciones (no sea grupo)
        if (!account.allow_transactions) {
          throw new Error(
            `La cuenta ${line.account_code} (${account.name}) es un grupo y no permite transacciones directas`
          );
        }

        return {
          journal_entry_id: entry.id,
          account_id: account.id,
          money_location_id: line.money_location_id,
          amount: line.amount,
          description: line.description,
        };
      })
    );

    const { data: lines, error: linesError } = await supabase
      .from('journal_lines')
      .insert(linesData)
      .select(`
        *,
        account:chart_of_accounts (
          code,
          name,
          account_type
        )
      `);

    if (linesError) {
      // Si falla la creación de líneas, eliminar el entry
      await supabase.from('journal_entries').delete().eq('id', entry.id);
      logger.error('CashModule', 'Failed to create journal lines', {
        error: linesError,
      });
      throw linesError;
    }

    logger.debug('CashModule', 'Journal lines created', {
      entryId: entry.id,
      linesCount: lines.length,
    });

    // Marcar como posted (dispara trigger de validación en DB)
    await postJournalEntry(entry.id);

    // Crear money movements para tracking
    await createMoneyMovements(entry.id, linesData);

    logger.info('CashModule', 'Journal entry created successfully', {
      entryId: entry.id,
      entryNumber,
      entryType: input.entry_type,
    });

    // Emitir evento
    await EventBus.emit(
      'cash.journal_entry.created',
      {
        entryId: entry.id,
        entryNumber,
        entryType: input.entry_type,
        referenceId: input.reference_id,
        referenceType: input.reference_type,
        cashSessionId: input.cash_session_id,
        userId,
        timestamp: new Date().toISOString(),
      },
      'CashModule'
    );

    // Formatear lines con información de cuentas
    const formattedLines = lines.map((line: any) => ({
      ...line,
      account_code: line.account.code,
      account_name: line.account.name,
      account_type: line.account.account_type,
    }));

    return {
      ...entry,
      lines: formattedLines,
    };
  } catch (error) {
    // Si algo falla, limpiar el entry creado
    await supabase.from('journal_entries').delete().eq('id', entry.id);
    throw error;
  }
}

/**
 * Marca un journal entry como posted (contabilizado)
 * Dispara el trigger de validación de balance en la base de datos
 */
export async function postJournalEntry(entryId: string): Promise<JournalEntryRow> {
  logger.info('CashModule', 'Posting journal entry', { entryId });

  // Marcar como posted
  const { data: entry, error: postError } = await supabase
    .from('journal_entries')
    .update({
      is_posted: true,
      posted_at: new Date().toISOString(),
    })
    .eq('id', entryId)
    .select()
    .single();

  if (postError) {
    logger.error('CashModule', 'Failed to post journal entry', {
      entryId,
      error: postError,
    });
    throw new Error(
      `Error al contabilizar journal entry: ${postError.message}. Posible causa: el balance no suma 0.`
    );
  }

  logger.info('CashModule', 'Journal entry posted successfully', {
    entryId: entry.id,
    entryNumber: entry.entry_number,
  });

  return entry;
}

/**
 * Crea registros en money_movements para tracking simplificado
 * Solo aplica para líneas que tienen money_location_id
 */
async function createMoneyMovements(
  entryId: string,
  linesData: Array<{
    journal_entry_id: string;
    account_id: string;
    money_location_id?: string | null;
    amount: number;
    description?: string | null;
  }>
): Promise<void> {
  // Filtrar solo líneas que tienen money_location_id
  const movementsData = linesData
    .filter((line) => line.money_location_id)
    .map((line) => {
      // Determinar tipo de movimiento
      // Negativo = Débito (entrada de dinero si es activo)
      // Positivo = Crédito (salida de dinero si es activo)
      const movementType = line.amount < 0 ? 'IN' : 'OUT';

      return {
        journal_entry_id: entryId,
        money_location_id: line.money_location_id!,
        movement_type: movementType,
        amount: Math.abs(line.amount),
        description: line.description,
      };
    });

  if (movementsData.length === 0) {
    logger.debug('CashModule', 'No money movements to create', { entryId });
    return;
  }

  const { error } = await supabase.from('money_movements').insert(movementsData);

  if (error) {
    logger.error('CashModule', 'Failed to create money movements', {
      entryId,
      error,
    });
    // No lanzamos error, los movements son opcionales para auditoría
  } else {
    logger.debug('CashModule', 'Money movements created', {
      entryId,
      count: movementsData.length,
    });
  }
}

/**
 * Obtiene un journal entry con sus líneas
 */
export async function getJournalEntry(
  entryId: string
): Promise<JournalEntryWithLines | null> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select(
      `
      *,
      lines:journal_lines (
        *,
        account:chart_of_accounts (
          code,
          name,
          account_type
        )
      )
    `
    )
    .eq('id', entryId)
    .single();

  if (error) {
    logger.error('CashModule', 'Failed to fetch journal entry', {
      entryId,
      error,
    });
    throw error;
  }

  if (!data) return null;

  // Formatear lines
  const formattedLines = data.lines.map((line: any) => ({
    ...line,
    account_code: line.account.code,
    account_name: line.account.name,
    account_type: line.account.account_type,
  }));

  return {
    ...data,
    lines: formattedLines,
  };
}

/**
 * Obtiene journal entries con filtros
 */
export async function fetchJournalEntries(filters?: {
  entryType?: string;
  cashSessionId?: string;
  startDate?: string;
  endDate?: string;
  isPosted?: boolean;
  limit?: number;
}): Promise<JournalEntryRow[]> {
  let query = supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.entryType) {
    query = query.eq('entry_type', filters.entryType);
  }

  if (filters?.cashSessionId) {
    query = query.eq('cash_session_id', filters.cashSessionId);
  }

  if (filters?.startDate) {
    query = query.gte('transaction_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('transaction_date', filters.endDate);
  }

  if (filters?.isPosted !== undefined) {
    query = query.eq('is_posted', filters.isPosted);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('CashModule', 'Failed to fetch journal entries', { error });
    throw error;
  }

  return data || [];
}

/**
 * Obtiene el balance de una cuenta
 */
export async function getAccountBalance(
  accountId: string,
  asOfDate?: string
): Promise<number> {
  let query = supabase
    .from('journal_lines')
    .select('amount, journal_entries!inner(is_posted, transaction_date)')
    .eq('account_id', accountId)
    .eq('journal_entries.is_posted', true);

  if (asOfDate) {
    query = query.lte('journal_entries.transaction_date', asOfDate);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('CashModule', 'Failed to get account balance', {
      accountId,
      error,
    });
    throw error;
  }

  if (!data || data.length === 0) {
    return 0;
  }

  // Sumar todas las líneas usando DecimalUtils
  const balance = data.reduce((sum, line) => {
    return DecimalUtils.add(
      sum,
      DecimalUtils.fromValue(line.amount, 'financial'),
      'financial'
    );
  }, DecimalUtils.fromValue(0, 'financial'));

  return DecimalUtils.toNumber(balance);
}
