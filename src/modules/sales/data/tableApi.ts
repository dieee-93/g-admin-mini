// src/features/sales/data/tableApi.ts
// 🚀 TABLE MANAGEMENT API - Modern Restaurant Operations
import { supabase } from '@/lib/supabase';
import { 
  Table, 
  Party, 
  TableStatus, 
  ServiceStage,
  ServiceEvent,
  ServiceEventType,
  PartyStatus,
  CapacityManager,
  WaitTimeEstimator,
  ServerPerformance
} from '../types';

// ========================================================
// 🚀 TABLE MANAGEMENT - CORE OPERATIONS
// ========================================================

export async function fetchTables(): Promise<Table[]> {
  const { data, error } = await supabase
    .from('tables')
    .select(`
      *,
      current_party:parties(
        *,
        service_timeline:service_events(*)
      )
    `)
    .eq('is_active', true)
    .order('number', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function fetchTableById(id: string): Promise<Table> {
  const { data, error } = await supabase
    .from('tables')
    .select(`
      *,
      current_party:parties(
        *,
        service_timeline:service_events(*),
        customers:party_customers(
          customer:customers(*)
        )
      ),
      section:sections(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateTableStatus(
  tableId: string, 
  status: TableStatus,
  serviceStage?: ServiceStage
): Promise<void> {
  const updateData: Record<string, unknown> = { 
    status,
    updated_at: new Date().toISOString()
  };
  
  if (serviceStage) {
    updateData.service_stage = serviceStage;
  }

  const { error } = await supabase
    .from('tables')
    .update(updateData)
    .eq('id', tableId);

  if (error) throw error;
}

// ========================================================
// 🚀 PARTY MANAGEMENT - SEATING & SERVICE
// ========================================================

export async function seatParty(
  tableId: string,
  partySize: number,
  customerIds: string[] = [],
  customerName?: string,
  specialRequests: string[] = []
): Promise<Party> {
  // Start transaction-like operation
  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select('*')
    .eq('id', tableId)
    .single();

  if (tableError) throw tableError;
  
  if (table.status !== TableStatus.AVAILABLE) {
    throw new Error('Table is not available for seating');
  }

  if (partySize > table.capacity) {
    throw new Error(`Party size (${partySize}) exceeds table capacity (${table.capacity})`);
  }

  // Create party
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .insert({
      table_id: tableId,
      size: partySize,
      customer_ids: customerIds,
      customer_name: customerName,
      seated_at: new Date().toISOString(),
      estimated_duration: calculateEstimatedDuration(partySize, table.average_turn_time),
      special_requests: specialRequests,
      status: PartyStatus.SEATED,
      is_vip: customerIds.length > 0 ? await checkIfVIPCustomers(customerIds) : false,
      has_allergies: false, // Will be updated when orders are taken
      dietary_restrictions: []
    })
    .select()
    .single();

  if (partyError) throw partyError;

  // Update table status
  await updateTableStatus(tableId, TableStatus.OCCUPIED, ServiceStage.SEATED);

  // Log service event
  await logServiceEvent(
    party.id,
    ServiceEventType.SEATED,
    `Party of ${partySize} seated`,
    partySize
  );

  return party;
}

export async function updatePartyStatus(
  partyId: string,
  status: PartyStatus,
  serviceStage?: ServiceStage
): Promise<void> {
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('parties')
    .update(updateData)
    .eq('id', partyId);

  if (error) throw error;

  // Update table service stage if provided
  if (serviceStage) {
    const { data: party } = await supabase
      .from('parties')
      .select('table_id')
      .eq('id', partyId)
      .single();
    
    if (party) {
      await updateTableStatus(party.table_id, TableStatus.OCCUPIED, serviceStage);
    }
  }
}

export async function clearTable(
  tableId: string,
  partyId: string,
  totalSpent: number = 0
): Promise<void> {
  // Complete the party
  const { error: partyError } = await supabase
    .from('parties')
    .update({
      status: PartyStatus.COMPLETED,
      total_spent: totalSpent,
      actual_duration: await calculateActualDuration(partyId),
      updated_at: new Date().toISOString()
    })
    .eq('id', partyId);

  if (partyError) throw partyError;

  // Update table to needs cleaning
  await updateTableStatus(tableId, TableStatus.NEEDS_CLEANING);

  // Log service event
  await logServiceEvent(
    partyId,
    ServiceEventType.TABLE_CLEARED,
    'Table cleared and ready for cleaning',
    0
  );
}

// ========================================================
// 🚀 SERVICE EVENTS & TIMELINE TRACKING
// ========================================================

export async function logServiceEvent(
  partyId: string,
  type: ServiceEventType,
  description: string,
  durationMinutes?: number,
  staffMember?: string,
  notes?: string
): Promise<ServiceEvent> {
  const { data, error } = await supabase
    .from('service_events')
    .insert({
      party_id: partyId,
      type,
      description,
      duration_minutes: durationMinutes,
      staff_member: staffMember,
      notes,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getServiceTimeline(partyId: string): Promise<ServiceEvent[]> {
  const { data, error } = await supabase
    .from('service_events')
    .select('*')
    .eq('party_id', partyId)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ========================================================
// 🚀 CAPACITY & WAIT TIME MANAGEMENT
// ========================================================

export async function getCapacityManager(): Promise<CapacityManager> {
  const { data: tables, error } = await supabase
    .from('tables')
    .select('id, status')
    .eq('is_active', true);

  if (error) throw error;

  const totalTables = tables.length;
  const availableTables = tables.filter(t => t.status === TableStatus.AVAILABLE).length;
  const occupiedTables = tables.filter(t => t.status === TableStatus.OCCUPIED).length;
  const reservedTables = tables.filter(t => t.status === TableStatus.RESERVED).length;

  // Calculate next available time based on current parties
  const { data: nextAvailable } = await supabase
    .rpc('estimate_next_table_available');

  return {
    total_tables: totalTables,
    available_tables: availableTables,
    occupied_tables: occupiedTables,
    reserved_tables: reservedTables,
    utilization_percentage: Math.round((occupiedTables / totalTables) * 100),
    estimated_next_available: nextAvailable || new Date().toISOString()
  };
}

export async function getWaitTimeEstimator(partySize: number): Promise<WaitTimeEstimator> {
  // Get historical data for wait time calculation
  const { data, error } = await supabase
    .rpc('calculate_wait_time_estimate', {
      party_size: partySize
    });

  if (error) throw error;

  return data || {
    average_wait_time: 15,
    current_wait_time: 10,
    queue_length: 0,
    peak_hour_adjustment: 1.0
  };
}

// ========================================================
// 🚀 ANALYTICS & PERFORMANCE
// ========================================================

export async function getTablePerformance(
  dateFrom: string,
  dateTo: string
): Promise<Table[]> {
  const { data, error } = await supabase
    .rpc('get_table_performance_analytics', {
      date_from: dateFrom,
      date_to: dateTo
    });

  if (error) throw error;
  return data || [];
}

export async function getServerPerformance(
  dateFrom: string,
  dateTo: string
): Promise<ServerPerformance[]> {
  const { data, error } = await supabase
    .rpc('get_server_performance_analytics', {
      date_from: dateFrom,
      date_to: dateTo
    });

  if (error) throw error;
  return data || [];
}

export async function getTableTurnoverStats(
  tableId?: string,
  dateFrom?: string,
  dateTo?: string
) {
  const { data, error } = await supabase
    .rpc('get_table_turnover_stats', {
      table_id: tableId,
      date_from: dateFrom || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      date_to: dateTo || new Date().toISOString()
    });

  if (error) throw error;
  return data;
}

// ========================================================
// 🚀 RESERVATIONS MANAGEMENT
// ========================================================

export async function createReservation(
  tableId: string,
  customerName: string,
  partySize: number,
  reservationTime: string,
  customerPhone?: string,
  specialRequests?: string[]
) {
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      table_id: tableId,
      customer_name: customerName,
      party_size: partySize,
      reservation_time: reservationTime,
      customer_phone: customerPhone,
      special_requests: specialRequests || [],
      status: 'confirmed'
    })
    .select()
    .single();

  if (error) throw error;

  // Update table status if reservation is for current time
  const reservationDate = new Date(reservationTime);
  const now = new Date();
  const timeDiff = Math.abs(reservationDate.getTime() - now.getTime()) / (1000 * 60);

  if (timeDiff <= 30) { // If reservation is within 30 minutes
    await updateTableStatus(tableId, TableStatus.RESERVED);
  }

  return data;
}

export async function getTodayReservations() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      table:tables(number, capacity),
      customer:customers(name, phone)
    `)
    .gte('reservation_time', today.toISOString().split('T')[0])
    .lt('reservation_time', tomorrow.toISOString().split('T')[0])
    .order('reservation_time', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ========================================================
// 🚀 HELPER FUNCTIONS
// ========================================================

async function calculateEstimatedDuration(partySize: number, averageTurnTime: number): Promise<number> {
  // Adjust based on party size (larger parties typically stay longer)
  const sizeMultiplier = Math.min(1 + (partySize - 2) * 0.1, 1.5);
  return Math.round(averageTurnTime * sizeMultiplier);
}

async function calculateActualDuration(partyId: string): Promise<number> {
  const { data: party } = await supabase
    .from('parties')
    .select('seated_at')
    .eq('id', partyId)
    .single();

  if (!party) return 0;

  const seatedTime = new Date(party.seated_at);
  const now = new Date();
  return Math.round((now.getTime() - seatedTime.getTime()) / (1000 * 60));
}

async function checkIfVIPCustomers(customerIds: string[]): Promise<boolean> {
  if (customerIds.length === 0) return false;

  const { data, error } = await supabase
    .from('customers')
    .select('is_vip')
    .in('id', customerIds);

  if (error) return false;
  return data.some(customer => customer.is_vip);
}

// ========================================================
// 🚀 REAL-TIME SUBSCRIPTIONS
// ========================================================

export function subscribeToTableUpdates(
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel('table-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tables'
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'parties'
      },
      callback
    )
    .subscribe();
}

export function subscribeToServiceEvents(
  partyId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel(`service-events-${partyId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'service_events',
        filter: `party_id=eq.${partyId}`
      },
      callback
    )
    .subscribe();
}