/**
 * Money Locations Service
 * Servicios para gestión de Ubicaciones de Dinero
 */

import { supabase } from '@/lib/supabase/client';
import type {
  MoneyLocationRow,
  MoneyLocationWithAccount,
  CreateMoneyLocationInput,
  UpdateMoneyLocationInput,
} from '../types';

/**
 * Obtiene todas las ubicaciones de dinero activas
 */
export async function fetchMoneyLocations(): Promise<MoneyLocationRow[]> {
  const { data, error } = await supabase
    .from('money_locations')
    .select('*')
    .eq('is_active', true)
    .order('code', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene ubicaciones con información de cuenta asociada
 */
export async function fetchMoneyLocationsWithAccount(): Promise<
  MoneyLocationWithAccount[]
> {
  const { data, error } = await supabase
    .from('money_locations')
    .select(
      `
      *,
      chart_of_accounts!inner (
        code,
        name
      )
    `
    )
    .eq('is_active', true)
    .order('code', { ascending: true });

  if (error) throw error;

  return (
    data?.map((item) => ({
      ...item,
      account_code: item.chart_of_accounts.code,
      account_name: item.chart_of_accounts.name,
    })) || []
  );
}

/**
 * Obtiene ubicación por código
 */
export async function getMoneyLocationByCode(
  code: string
): Promise<MoneyLocationRow | null> {
  const { data, error } = await supabase
    .from('money_locations')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Obtiene ubicación por ID
 */
export async function getMoneyLocationById(
  id: string
): Promise<MoneyLocationRow | null> {
  const { data, error } = await supabase
    .from('money_locations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Obtiene ubicaciones que requieren sesión (cajas registradoras)
 */
export async function fetchCashDrawers(): Promise<MoneyLocationRow[]> {
  const { data, error } = await supabase
    .from('money_locations')
    .select('*')
    .eq('location_type', 'CASH_DRAWER')
    .eq('requires_session', true)
    .eq('is_active', true)
    .order('code', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene ubicaciones por tipo
 */
export async function fetchMoneyLocationsByType(
  locationType: string
): Promise<MoneyLocationRow[]> {
  const { data, error } = await supabase
    .from('money_locations')
    .select('*')
    .eq('location_type', locationType)
    .eq('is_active', true)
    .order('code', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Crea nueva ubicación de dinero
 */
export async function createMoneyLocation(
  input: CreateMoneyLocationInput,
  userId: string
): Promise<MoneyLocationRow> {
  const { data, error } = await supabase
    .from('money_locations')
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
 * Actualiza ubicación de dinero
 */
export async function updateMoneyLocation(
  id: string,
  input: UpdateMoneyLocationInput,
  userId: string
): Promise<MoneyLocationRow> {
  const { data, error } = await supabase
    .from('money_locations')
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
 * Desactiva ubicación (soft delete)
 */
export async function deactivateMoneyLocation(
  id: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('money_locations')
    .update({
      is_active: false,
      updated_by: userId,
    })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Actualiza balance de ubicación
 */
export async function updateMoneyLocationBalance(
  id: string,
  newBalance: number
): Promise<void> {
  const { error } = await supabase
    .from('money_locations')
    .update({
      current_balance: newBalance,
    })
    .eq('id', id);

  if (error) throw error;
}
