// Team Management API - CRUD, Security, Time Tracking
// Consolidation of services/teamApi.ts + services/team/teamApi.ts

import { logger } from '@/lib/logging';
import { supabase } from '@/lib/supabase/client';
import { eventBus } from '@/lib/events';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface TeamMember {
  id: string;
  teamMember_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department: 'kitchen' | 'service' | 'admin' | 'cleaning' | 'management';
  hire_date: string;
  employment_status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'temp';
  role: 'teamMember' | 'supervisor' | 'manager' | 'admin';
  salary?: number;
  hourly_rate?: number;
  avatar_url?: string;
  notes?: string;
  performance_score?: number;
  attendance_rate?: number;
  completed_tasks?: number;
  weekly_hours?: number;
  shift_preference?: 'morning' | 'afternoon' | 'night' | 'flexible';
  available_days?: string[];
  permissions?: string[];
  social_security?: string;
  skills?: string[];
  certifications?: string[];
  goals_completed?: number;
  total_goals?: number;
  training_completed?: number;
  training_hours?: number;
  last_login?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface MaskedTeamMember extends Omit<TeamMember, 'social_security'> {
  salary_masked?: boolean;
  hourly_rate_masked?: boolean;
  social_security_masked?: string;
}

export interface TeamMemberFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  hourly_rate?: number;
  notes?: string;
  skills?: string[];
}

export interface TeamMemberTraining {
  id: string;
  teamMember_id: string;
  training_name: string;
  training_type: 'certification' | 'course' | 'workshop' | 'safety' | 'compliance';
  completed_date: string;
  expiry_date?: string;
  issuing_authority?: string;
  certificate_url?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface ShiftScheduleDB {
  id: string;
  teamMember_id: string;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'missed' | 'cancelled';
  break_duration: number;
  notes?: string;
  is_mandatory: boolean;
  can_be_covered: boolean;
  covered_by?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface TimeEntryDB {
  id: string;
  teamMember_id: string;
  schedule_id?: string;
  entry_type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: string;
  location?: { latitude: number; longitude: number };
  notes?: string;
  is_offline: boolean;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
  created_at: string;
  created_by?: string;
}

export interface PerformanceMetrics {
  teamMember_id: string;
  period: string;
  score: number;
  productivity: number;
  quality: number;
  attendance: number;
  goals_met: number;
  total_goals: number;
  feedback?: string;
  created_at: string;
}

export interface TrainingRecord {
  id: string;
  teamMember_id: string;
  course_name: string;
  course_type: string;
  status: 'planned' | 'in_progress' | 'completed' | 'expired';
  start_date: string;
  completion_date?: string;
  score?: number;
  certificate_url?: string;
  hours: number;
  instructor?: string;
  created_at: string;
}

export interface TeamStats {
  total_teamMembers: number;
  active_teamMembers: number;
  on_shift: number;
  avg_performance: number;
  pending_reviews: number;
  training_due: number;
  new_hires_this_month: number;
  turnover_rate: number;
}

export interface TeamFilters {
  search?: string;
  department?: string;
  employment_status?: string;
  role?: string;
  employment_type?: string;
  position?: string;
  status?: string;
}

export interface TeamSortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// =====================================================
// SECURITY FUNCTIONS
// =====================================================

/**
 * Security utility - masks sensitive teamMember data based on user role
 * @param teamMember - Full teamMember object
 * @param currentUserRole - Current user's role for access control
 * @returns Masked teamMember object with appropriate data visibility
 */
export function maskTeamMemberData(teamMember: TeamMember, currentUserRole: string): MaskedTeamMember {
  const canViewSensitiveData = ['admin', 'hr'].includes(currentUserRole);

  const maskedTeamMember: MaskedTeamMember = {
    ...teamMember,
    salary_masked: !canViewSensitiveData,
    hourly_rate_masked: !canViewSensitiveData,
  };

  if (!canViewSensitiveData) {
    // Remove sensitive properties
    const { social_security, ...safeMaskedTeamMember } = maskedTeamMember;

    // Add masked version
    const finalMaskedTeamMember = {
      ...safeMaskedTeamMember,
      social_security_masked: social_security
        ? `***-**-${social_security.slice(-4)}`
        : undefined
    };

    return finalMaskedTeamMember;
  }

  return maskedTeamMember;
}

/**
 * Security function to check if user has permission for action
 * @param userRole - User's role
 * @param resource - Resource being accessed
 * @param action - Action being performed
 * @returns boolean
 */
export function hasPermission(
  userRole: string,
  resource: string,
  action: 'read' | 'write' | 'delete' | 'manage'
): boolean {
  const permissions: Record<string, Record<string, string[]>> = {
    admin: {
      team: ['read', 'write', 'delete', 'manage'],
      performance: ['read', 'write', 'delete', 'manage'],
      training: ['read', 'write', 'delete', 'manage'],
      payroll: ['read', 'write', 'delete', 'manage'],
      scheduling: ['read', 'write', 'delete', 'manage']
    },
    hr: {
      team: ['read', 'write', 'delete', 'manage'],
      performance: ['read', 'write', 'manage'],
      training: ['read', 'write', 'manage'],
      payroll: ['read', 'write'],
      scheduling: ['read']
    },
    manager: {
      team: ['read', 'write'],
      performance: ['read', 'write', 'manage'],
      training: ['read', 'write'],
      payroll: ['read'],
      scheduling: ['read', 'write', 'manage']
    },
    supervisor: {
      team: ['read'],
      performance: ['read', 'write'],
      training: ['read'],
      payroll: [],
      scheduling: ['read']
    },
    teamMember: {
      team: ['read'],
      performance: ['read'],
      training: ['read'],
      payroll: [],
      scheduling: ['read']
    }
  };

  const userPermissions = permissions[userRole];
  if (!userPermissions) return false;

  const resourcePermissions = userPermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

// =====================================================
// EMPLOYEE CRUD OPERATIONS
// =====================================================

/**
 * Get all teamMembers with security compliance and optional filtering
 */
export async function getTeamMembers(
  filters: TeamFilters = {},
  sortBy: TeamSortOptions = { field: 'name', direction: 'asc' },
  currentUserRole = 'teamMember'
): Promise<MaskedTeamMember[]> {
  try {
    logger.info('TeamAPI', '📊 Fetching teamMembers from Supabase', { filters, sortBy });

    let query = supabase
      .from('team_members')
      .select('*');

    // Apply filters
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,position.ilike.%${filters.search}%,department.ilike.%${filters.search}%`);
    }

    if (filters.employment_status && filters.employment_status !== 'all') {
      query = query.eq('employment_status', filters.employment_status);
    }

    if (filters.department && filters.department !== 'all') {
      query = query.eq('department', filters.department);
    }

    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    if (filters.employment_type) {
      query = query.eq('employment_type', filters.employment_type);
    }

    if (filters.position) {
      query = query.ilike('position', `%${filters.position}%`);
    }

    // Apply sorting
    const orderColumn = sortBy.field === 'name' ? 'first_name' : sortBy.field;
    query = query.order(orderColumn, { ascending: sortBy.direction === 'asc' });

    const { data, error } = await query;

    if (error) {
      logger.error('TeamAPI', '❌ Error fetching teamMembers from Supabase', error);
      throw error;
    }

    if (!data || data.length === 0) {
      logger.info('TeamAPI', '📭 No teamMembers found in database');
      return [];
    }

    logger.info('TeamAPI', `✅ Fetched ${data.length} teamMembers from Supabase`);

    // Apply security masking
    return data.map(teamMember => maskTeamMemberData(teamMember as TeamMember, currentUserRole));

  } catch (error) {
    logger.error('TeamAPI', '❌ Critical error in getTeamMembers', error);
    throw error;
  }
}

/**
 * Get single teamMember by ID with security compliance
 */
export async function getTeamMemberById(
  teamMemberId: string,
  currentUserRole = 'teamMember'
): Promise<MaskedTeamMember | null> {
  try {
    logger.info('TeamAPI', '📊 Fetching teamMember by ID from Supabase', { teamMemberId });

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', teamMemberId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('TeamAPI', '📭 TeamMember not found');
        return null;
      }
      logger.error('TeamAPI', '❌ Error fetching teamMember by ID', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    logger.info('TeamAPI', `✅ Fetched teamMember ${data.first_name} ${data.last_name}`);

    return maskTeamMemberData(data as TeamMember, currentUserRole);

  } catch (error) {
    logger.error('TeamAPI', '❌ Critical error in getTeamMemberById', error);
    throw error;
  }
}

/**
 * Create new teamMember with audit trail and event emission
 */
export async function createTeamMember(
  teamMemberData: TeamMemberFormData,
  createdBy?: string
): Promise<TeamMember> {
  try {
    logger.info('TeamAPI', '📝 Creating new teamMember in Supabase', { createdBy: createdBy || 'system' });

    // Get current total team count (for achievements)
    const { count: previousTotalTeam } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('employment_status', 'active');

    // Generate teamMember_id
    const count = await getTeamMembersCount();
    const teamMember_id = `EMP${String(count + 1).padStart(3, '0')}`;

    // Prepare data for Supabase insert
    const insertData = {
      teamMember_id,
      first_name: teamMemberData.first_name,
      last_name: teamMemberData.last_name,
      email: teamMemberData.email,
      phone: teamMemberData.phone || null,
      position: teamMemberData.position,
      department: teamMemberData.department || null,
      hire_date: teamMemberData.hire_date || new Date().toISOString().split('T')[0],
      employment_status: 'active',
      employment_type: 'full_time',
      role: 'teamMember',
      salary: teamMemberData.salary || 0,
      hourly_rate: teamMemberData.hourly_rate || 0,
      weekly_hours: 40,
      performance_score: 0,
      attendance_rate: 100,
      available_days: [],
      permissions: [],
      skills: teamMemberData.skills || [],
      certifications: [],
      notes: teamMemberData.notes || null
    };

    const { data, error } = await supabase
      .from('team_members')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      logger.error('TeamAPI', '❌ Error creating teamMember in Supabase', error);
      throw error;
    }

    logger.info('TeamAPI', `✅ Created teamMember ${data.first_name} ${data.last_name}`);

    const newTeamMember = data as TeamMember;

    // Calculate new total team
    const totalTeam = (previousTotalTeam || 0) + 1;

    // Emit team.member_added event for achievements
    try {
      await eventBus.emit('team.member_added', {
        teamId: newTeamMember.id,
        teamName: `${newTeamMember.first_name} ${newTeamMember.last_name}`,
        role: newTeamMember.position,
        totalTeam,
        previousTotalTeam: previousTotalTeam || 0,
        timestamp: Date.now(),
        triggeredBy: 'manual' as const,
        userId: createdBy
      });

      logger.info('TeamAPI', 'Team member added event emitted', {
        teamId: newTeamMember.id,
        totalTeam,
        previousTotalTeam
      });
    } catch (err) {
      logger.error('TeamAPI', 'Failed to emit team.member_added event', err);
      // Don't fail teamMember creation if event emission fails
    }

    return newTeamMember;

  } catch (error) {
    logger.error('TeamAPI', '❌ Critical error in createTeamMember', error);
    throw error;
  }
}

/**
 * Update teamMember with audit trail and security validation
 */
export async function updateTeamMember(
  teamMemberId: string,
  updateData: Partial<TeamMemberFormData>,
  updatedBy?: string
): Promise<TeamMember> {
  try {
    logger.info('TeamAPI', '✏️ Updating teamMember in Supabase', { teamMemberId, updatedBy: updatedBy || 'system' });

    const updates: Record<string, unknown> = {};
    if (updateData.first_name !== undefined) updates.first_name = updateData.first_name;
    if (updateData.last_name !== undefined) updates.last_name = updateData.last_name;
    if (updateData.email !== undefined) updates.email = updateData.email;
    if (updateData.phone !== undefined) updates.phone = updateData.phone;
    if (updateData.position !== undefined) updates.position = updateData.position;
    if (updateData.department !== undefined) updates.department = updateData.department;
    if (updateData.hire_date !== undefined) updates.hire_date = updateData.hire_date;
    if (updateData.salary !== undefined) updates.salary = updateData.salary;
    if (updateData.hourly_rate !== undefined) updates.hourly_rate = updateData.hourly_rate;
    if (updateData.notes !== undefined) updates.notes = updateData.notes;
    if (updateData.skills !== undefined) updates.skills = updateData.skills;

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', teamMemberId)
      .select()
      .single();

    if (error) {
      logger.error('TeamAPI', '❌ Error updating teamMember in Supabase', error);
      throw error;
    }

    if (!data) {
      throw new Error('TeamMember not found');
    }

    logger.info('TeamAPI', `✅ Updated teamMember ${data.first_name} ${data.last_name}`);

    return data as TeamMember;

  } catch (error) {
    logger.error('TeamAPI', '❌ Critical error in updateTeamMember', error);
    throw error;
  }
}

/**
 * Delete teamMember (soft delete by changing status)
 */
export async function deleteTeamMember(
  teamMemberId: string,
  deletedBy?: string
): Promise<void> {
  try {
    logger.info('TeamAPI', '🗑️ Soft deleting teamMember in Supabase', { teamMemberId, deletedBy: deletedBy || 'system' });

    const { error } = await supabase
      .from('team_members')
      .update({
        employment_status: 'terminated',
        updated_at: new Date().toISOString()
      })
      .eq('id', teamMemberId);

    if (error) {
      logger.error('TeamAPI', '❌ Error deleting teamMember in Supabase', error);
      throw error;
    }

    logger.info('TeamAPI', `✅ Soft deleted teamMember ${teamMemberId}`);

  } catch (error) {
    logger.error('TeamAPI', '❌ Critical error in deleteTeamMember', error);
    throw error;
  }
}

/**
 * Get teamMembers count for ID generation
 */
async function getTeamMembersCount(): Promise<number> {
  const { count, error } = await supabase
    .from('team_members')
    .select('id', { count: 'exact', head: true });

  if (error) {
    throw new Error(`Failed to get teamMembers count: ${error.message}`);
  }

  return count || 0;
}

// =====================================================
// SHIFT SCHEDULE OPERATIONS
// =====================================================

/**
 * Get shift schedules with optional filtering
 */
export async function getShiftSchedules(
  startDate?: string,
  endDate?: string,
  teamMemberId?: string
): Promise<ShiftScheduleDB[]> {
  try {
    logger.info('TeamAPI', '📅 Fetching schedules from Supabase', { startDate, endDate });

    let query = supabase
      .from('shift_schedules')
      .select(`
        *,
        teamMember:teamMembers!teamMember_id(first_name, last_name),
        covered_by_teamMember:teamMembers!covered_by(first_name, last_name)
      `)
      .order('date')
      .order('start_time');

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    }

    if (teamMemberId) {
      query = query.eq('teamMember_id', teamMemberId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('TeamAPI', '❌ Error fetching schedules', error);
      throw error;
    }

    logger.info('TeamAPI', `✅ Fetched ${data?.length || 0} schedules`);
    return data || [];

  } catch (error) {
    logger.error('TeamAPI', '❌ Critical error in getShiftSchedules', error);
    return [];
  }
}

/**
 * Create a new shift schedule
 */
export async function createShiftSchedule(
  scheduleData: Omit<ShiftScheduleDB, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>
): Promise<ShiftScheduleDB> {
  const { data, error } = await supabase
    .from('shift_schedules')
    .insert([scheduleData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create schedule: ${error.message}`);
  }

  return data;
}

/**
 * Update a shift schedule
 */
export async function updateShiftSchedule(
  id: string,
  updates: Partial<Omit<ShiftScheduleDB, 'id' | 'created_at' | 'created_by'>>
): Promise<ShiftScheduleDB> {
  const { data, error } = await supabase
    .from('shift_schedules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update schedule: ${error.message}`);
  }

  return data;
}

/**
 * Delete a shift schedule
 */
export async function deleteShiftSchedule(id: string): Promise<void> {
  const { error } = await supabase
    .from('shift_schedules')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete schedule: ${error.message}`);
  }
}

// =====================================================
// TIME ENTRY OPERATIONS
// =====================================================

/**
 * Get time entries with optional filtering
 */
export async function getTimeEntries(
  startDate?: string,
  endDate?: string,
  teamMemberId?: string,
  syncStatus?: string
): Promise<TimeEntryDB[]> {
  try {
    logger.info('TeamAPI', '⏰ Fetching time entries from Supabase', { startDate, endDate });

    let query = supabase
      .from('time_entries')
      .select(`
        *,
        teamMember:teamMembers(first_name, last_name)
      `)
      .order('timestamp', { ascending: false });

    if (startDate && endDate) {
      query = query.gte('timestamp', startDate).lte('timestamp', endDate);
    }

    if (teamMemberId) {
      query = query.eq('teamMember_id', teamMemberId);
    }

    if (syncStatus) {
      query = query.eq('sync_status', syncStatus);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('TeamAPI', '❌ Error fetching time entries', error);
      return [];
    }

    logger.info('TeamAPI', `✅ Fetched ${data?.length || 0} time entries`);
    return data || [];

  } catch (error) {
    logger.error('TeamAPI', '❌ Critical error in getTimeEntries', error);
    return [];
  }
}

/**
 * Create a new time entry
 */
export async function createTimeEntry(
  entryData: Omit<TimeEntryDB, 'id' | 'created_at' | 'created_by'>
): Promise<TimeEntryDB> {
  const { data, error } = await supabase
    .from('time_entries')
    .insert([entryData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create time entry: ${error.message}`);
  }

  return data;
}

/**
 * Clock in an teamMember
 */
export async function clockIn(
  teamMemberId: string,
  location?: { latitude: number; longitude: number },
  notes?: string
): Promise<TimeEntryDB> {
  return createTimeEntry({
    teamMember_id: teamMemberId,
    entry_type: 'clock_in',
    timestamp: new Date().toISOString(),
    location,
    notes,
    is_offline: false,
    sync_status: 'synced'
  });
}

/**
 * Clock out an teamMember
 */
export async function clockOut(
  teamMemberId: string,
  location?: { latitude: number; longitude: number },
  notes?: string
): Promise<TimeEntryDB> {
  return createTimeEntry({
    teamMember_id: teamMemberId,
    entry_type: 'clock_out',
    timestamp: new Date().toISOString(),
    location,
    notes,
    is_offline: false,
    sync_status: 'synced'
  });
}

/**
 * Start break for an teamMember
 */
export async function startBreak(
  teamMemberId: string,
  notes?: string
): Promise<TimeEntryDB> {
  return createTimeEntry({
    teamMember_id: teamMemberId,
    entry_type: 'break_start',
    timestamp: new Date().toISOString(),
    notes,
    is_offline: false,
    sync_status: 'synced'
  });
}

/**
 * End break for an teamMember
 */
export async function endBreak(
  teamMemberId: string,
  notes?: string
): Promise<TimeEntryDB> {
  return createTimeEntry({
    teamMember_id: teamMemberId,
    entry_type: 'break_end',
    timestamp: new Date().toISOString(),
    notes,
    is_offline: false,
    sync_status: 'synced'
  });
}

// =====================================================
// TRAINING OPERATIONS
// =====================================================

/**
 * Get teamMember training records
 */
export async function getTeamMemberTraining(teamMemberId: string): Promise<TeamMemberTraining[]> {
  const { data, error } = await supabase
    .from('teamMember_training')
    .select('*')
    .eq('teamMember_id', teamMemberId)
    .order('completed_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch training records: ${error.message}`);
  }

  return data || [];
}

/**
 * Add training record for an teamMember
 */
export async function addTeamMemberTraining(
  trainingData: Omit<TeamMemberTraining, 'id' | 'created_at' | 'created_by'>
): Promise<TeamMemberTraining> {
  const { data, error } = await supabase
    .from('teamMember_training')
    .insert([trainingData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add training record: ${error.message}`);
  }

  return data;
}

/**
 * Get training records with filtering
 */
export async function getTrainingRecords(
  teamMemberIds?: string[],
  status?: TrainingRecord['status']
): Promise<TrainingRecord[]> {
  // TODO: Implement with real data from teamMember_training table
  await new Promise(resolve => setTimeout(resolve, 100));

  // Mock training records
  const mockRecords: TrainingRecord[] = [];

  return mockRecords;
}
