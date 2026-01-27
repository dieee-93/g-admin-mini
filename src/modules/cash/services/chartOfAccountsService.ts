/**
 * Chart of Accounts Service
 * Servicios para gestión del Plan de Cuentas
 */

import { supabase } from '@/lib/supabase/client';
import type {
  ChartOfAccountsRow,
  ChartOfAccountsNode,
  CreateChartOfAccountInput,
  UpdateChartOfAccountInput,
} from '../types';

/**
 * Obtiene todas las cuentas activas del plan de cuentas
 */
export async function fetchChartOfAccounts(): Promise<ChartOfAccountsRow[]> {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('is_active', true)
    .order('code', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene una cuenta por su código
 */
export async function getAccountByCode(
  code: string
): Promise<ChartOfAccountsRow | null> {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Obtiene una cuenta por su ID
 */
export async function getAccountById(
  id: string
): Promise<ChartOfAccountsRow | null> {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Construye árbol jerárquico del plan de cuentas
 * 
 * Toma una lista plana de cuentas y las organiza en una estructura de árbol
 * basada en las relaciones parent_id. Cada nodo incluye sus hijos recursivamente
 * y su nivel en la jerarquía.
 * 
 * @param accounts - Lista plana de cuentas del plan de cuentas
 * @returns Array de nodos raíz (nivel 0) con sus hijos anidados
 * 
 * @example
 * ```typescript
 * const accounts = await fetchChartOfAccounts();
 * const tree = buildAccountTree(accounts);
 * // tree = [
 * //   { id: '1', code: '1', name: 'Assets', level: 0, children: [
 * //     { id: '2', code: '1.1', name: 'Current Assets', level: 1, children: [...] }
 * //   ]}
 * // ]
 * ```
 * 
 * @remarks
 * - Las cuentas sin parent_id se consideran raíz (nivel 0)
 * - El nivel se calcula automáticamente basado en la profundidad
 * - Si una cuenta referencia un parent_id que no existe, se ignora la relación
 */
export function buildAccountTree(
  accounts: ChartOfAccountsRow[]
): ChartOfAccountsNode[] {
  // Crear mapa de cuentas con children
  const accountMap = new Map<string, ChartOfAccountsNode>();

  accounts.forEach((account) => {
    accountMap.set(account.id, {
      ...account,
      children: [],
      level: 0,
    });
  });

  // Construir jerarquía
  const rootAccounts: ChartOfAccountsNode[] = [];

  accounts.forEach((account) => {
    const node = accountMap.get(account.id);
    if (!node) return;

    if (account.parent_id) {
      const parent = accountMap.get(account.parent_id);
      if (parent) {
        node.level = parent.level + 1;
        parent.children.push(node);
      }
    } else {
      rootAccounts.push(node);
    }
  });

  return rootAccounts;
}

/**
 * Obtiene cuentas por tipo
 */
export async function fetchAccountsByType(
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE'
): Promise<ChartOfAccountsRow[]> {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('account_type', accountType)
    .eq('is_active', true)
    .order('code', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene solo cuentas de hoja (no grupos)
 */
export async function fetchLedgerAccounts(): Promise<ChartOfAccountsRow[]> {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('is_group', false)
    .eq('allow_transactions', true)
    .eq('is_active', true)
    .order('code', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Crea una nueva cuenta en el plan de cuentas
 */
export async function createAccount(
  input: CreateChartOfAccountInput,
  userId: string
): Promise<ChartOfAccountsRow> {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .insert({
      ...input,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualiza una cuenta existente
 */
export async function updateAccount(
  id: string,
  input: UpdateChartOfAccountInput,
  userId: string
): Promise<ChartOfAccountsRow> {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .update({
      ...input,
      updated_by: userId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Desactiva una cuenta (soft delete)
 */
export async function deactivateAccount(
  id: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('chart_of_accounts')
    .update({
      is_active: false,
      updated_by: userId,
    })
    .eq('id', id);

  if (error) throw error;
}
