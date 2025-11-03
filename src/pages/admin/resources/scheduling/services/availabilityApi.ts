/**
 * Availability API Service
 * Based on: IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md Week 3
 * Manages availability rules, professional schedules, and exceptions
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type {
  AvailabilityRule,
  AvailabilityRuleInput,
  AvailabilityRulesQuery,
  ProfessionalAvailability,
  ProfessionalAvailabilityInput,
  ProfessionalAvailabilityQuery,
  ProfessionalAvailabilityWithStaff,
  AvailabilityException,
  AvailabilityExceptionInput,
  AvailabilityExceptionsQuery,
  AvailabilityExceptionWithStaff,
  AvailabilityConfigSummary,
} from '@/types/appointment';

// ============================================================================
// Availability Rules API
// ============================================================================

class AvailabilityAPI {
  /**
   * Get availability rules with optional filters
   */
  async getAvailabilityRules(query?: AvailabilityRulesQuery): Promise<AvailabilityRule[]> {
    try {
      let dbQuery = supabase
        .from('availability_rules')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (query?.location_id) {
        dbQuery = dbQuery.eq('location_id', query.location_id);
      }

      if (query?.day_of_week !== undefined) {
        dbQuery = dbQuery.eq('day_of_week', query.day_of_week);
      }

      if (query?.is_active !== undefined) {
        dbQuery = dbQuery.eq('is_active', query.is_active);
      }

      const { data, error } = await dbQuery;

      if (error) throw error;

      logger.debug('AvailabilityAPI', 'Retrieved availability rules', { count: data?.length });
      return data || [];
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to get availability rules', { error, query });
      throw error;
    }
  }

  /**
   * Get a single availability rule by ID
   */
  async getAvailabilityRule(id: string): Promise<AvailabilityRule | null> {
    try {
      const { data, error } = await supabase
        .from('availability_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to get availability rule', { error, id });
      throw error;
    }
  }

  /**
   * Create a new availability rule
   */
  async createAvailabilityRule(input: AvailabilityRuleInput): Promise<AvailabilityRule> {
    try {
      const { data, error } = await supabase
        .from('availability_rules')
        .insert(input)
        .select()
        .single();

      if (error) throw error;

      logger.info('AvailabilityAPI', 'Created availability rule', { id: data.id, input });
      return data;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to create availability rule', { error, input });
      throw error;
    }
  }

  /**
   * Update an existing availability rule
   */
  async updateAvailabilityRule(id: string, updates: Partial<AvailabilityRuleInput>): Promise<AvailabilityRule> {
    try {
      const { data, error } = await supabase
        .from('availability_rules')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      logger.info('AvailabilityAPI', 'Updated availability rule', { id, updates });
      return data;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to update availability rule', { error, id, updates });
      throw error;
    }
  }

  /**
   * Delete an availability rule
   */
  async deleteAvailabilityRule(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('availability_rules').delete().eq('id', id);

      if (error) throw error;

      logger.info('AvailabilityAPI', 'Deleted availability rule', { id });
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to delete availability rule', { error, id });
      throw error;
    }
  }

  // ============================================================================
  // Professional Availability API
  // ============================================================================

  /**
   * Get professional availability schedules with optional filters
   */
  async getProfessionalAvailability(
    query?: ProfessionalAvailabilityQuery
  ): Promise<ProfessionalAvailabilityWithStaff[]> {
    try {
      let dbQuery = supabase
        .from('professional_availability')
        .select(
          `
          *,
          staff:employees!staff_id(
            id,
            first_name,
            last_name,
            email,
            avatar_url
          )
        `
        )
        .order('day_of_week', { ascending: true });

      if (query?.staff_id) {
        dbQuery = dbQuery.eq('staff_id', query.staff_id);
      }

      if (query?.location_id) {
        dbQuery = dbQuery.eq('location_id', query.location_id);
      }

      if (query?.day_of_week !== undefined) {
        dbQuery = dbQuery.eq('day_of_week', query.day_of_week);
      }

      if (query?.is_active !== undefined) {
        dbQuery = dbQuery.eq('is_active', query.is_active);
      }

      const { data, error } = await dbQuery;

      if (error) throw error;

      // Transform to include staff_name
      const transformed = (data || []).map((item: any) => ({
        ...item,
        staff_name: item.staff ? `${item.staff.first_name} ${item.staff.last_name}` : 'Unknown',
        staff_email: item.staff?.email,
        staff_avatar_url: item.staff?.avatar_url,
      }));

      logger.debug('AvailabilityAPI', 'Retrieved professional availability', { count: transformed.length });
      return transformed;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to get professional availability', { error, query });
      throw error;
    }
  }

  /**
   * Get a single professional availability record by ID
   */
  async getProfessionalAvailabilityById(id: string): Promise<ProfessionalAvailability | null> {
    try {
      const { data, error } = await supabase
        .from('professional_availability')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to get professional availability', { error, id });
      throw error;
    }
  }

  /**
   * Create a new professional availability schedule
   */
  async createProfessionalAvailability(input: ProfessionalAvailabilityInput): Promise<ProfessionalAvailability> {
    try {
      const { data, error } = await supabase
        .from('professional_availability')
        .insert(input)
        .select()
        .single();

      if (error) throw error;

      logger.info('AvailabilityAPI', 'Created professional availability', { id: data.id, input });
      return data;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to create professional availability', { error, input });
      throw error;
    }
  }

  /**
   * Update an existing professional availability schedule
   */
  async updateProfessionalAvailability(
    id: string,
    updates: Partial<ProfessionalAvailabilityInput>
  ): Promise<ProfessionalAvailability> {
    try {
      const { data, error } = await supabase
        .from('professional_availability')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      logger.info('AvailabilityAPI', 'Updated professional availability', { id, updates });
      return data;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to update professional availability', { error, id, updates });
      throw error;
    }
  }

  /**
   * Delete a professional availability schedule
   */
  async deleteProfessionalAvailability(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('professional_availability').delete().eq('id', id);

      if (error) throw error;

      logger.info('AvailabilityAPI', 'Deleted professional availability', { id });
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to delete professional availability', { error, id });
      throw error;
    }
  }

  // ============================================================================
  // Availability Exceptions API
  // ============================================================================

  /**
   * Get availability exceptions with optional filters
   */
  async getAvailabilityExceptions(query?: AvailabilityExceptionsQuery): Promise<AvailabilityExceptionWithStaff[]> {
    try {
      let dbQuery = supabase
        .from('availability_exceptions')
        .select(
          `
          *,
          staff:employees!staff_id(
            id,
            first_name,
            last_name
          )
        `
        )
        .order('exception_date', { ascending: true });

      if (query?.staff_id) {
        dbQuery = dbQuery.eq('staff_id', query.staff_id);
      }

      if (query?.location_id) {
        dbQuery = dbQuery.eq('location_id', query.location_id);
      }

      if (query?.start_date) {
        dbQuery = dbQuery.gte('exception_date', query.start_date);
      }

      if (query?.end_date) {
        dbQuery = dbQuery.lte('exception_date', query.end_date);
      }

      const { data, error } = await dbQuery;

      if (error) throw error;

      // Transform to include staff_name
      const transformed = (data || []).map((item: any) => ({
        ...item,
        staff_name: item.staff ? `${item.staff.first_name} ${item.staff.last_name}` : undefined,
      }));

      logger.debug('AvailabilityAPI', 'Retrieved availability exceptions', { count: transformed.length });
      return transformed;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to get availability exceptions', { error, query });
      throw error;
    }
  }

  /**
   * Get a single availability exception by ID
   */
  async getAvailabilityException(id: string): Promise<AvailabilityException | null> {
    try {
      const { data, error } = await supabase
        .from('availability_exceptions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to get availability exception', { error, id });
      throw error;
    }
  }

  /**
   * Create a new availability exception
   */
  async createAvailabilityException(input: AvailabilityExceptionInput): Promise<AvailabilityException> {
    try {
      const { data, error } = await supabase
        .from('availability_exceptions')
        .insert(input)
        .select()
        .single();

      if (error) throw error;

      logger.info('AvailabilityAPI', 'Created availability exception', { id: data.id, input });
      return data;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to create availability exception', { error, input });
      throw error;
    }
  }

  /**
   * Update an existing availability exception
   */
  async updateAvailabilityException(
    id: string,
    updates: Partial<AvailabilityExceptionInput>
  ): Promise<AvailabilityException> {
    try {
      const { data, error } = await supabase
        .from('availability_exceptions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      logger.info('AvailabilityAPI', 'Updated availability exception', { id, updates });
      return data;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to update availability exception', { error, id, updates });
      throw error;
    }
  }

  /**
   * Delete an availability exception
   */
  async deleteAvailabilityException(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('availability_exceptions').delete().eq('id', id);

      if (error) throw error;

      logger.info('AvailabilityAPI', 'Deleted availability exception', { id });
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to delete availability exception', { error, id });
      throw error;
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Get configuration summary for dashboard/overview
   */
  async getAvailabilityConfigSummary(location_id?: string): Promise<AvailabilityConfigSummary> {
    try {
      // Get availability rules
      const rules = await this.getAvailabilityRules({
        location_id,
        is_active: true,
      });

      // Get professional availability
      const professionalSchedules = await this.getProfessionalAvailability({
        location_id,
        is_active: true,
      });

      // Get exceptions (next 30 days)
      const today = new Date();
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(today.getDate() + 30);

      const exceptions = await this.getAvailabilityExceptions({
        location_id,
        start_date: today.toISOString().split('T')[0],
        end_date: thirtyDaysLater.toISOString().split('T')[0],
      });

      // Calculate statistics
      const total_business_days = rules.length;

      const unique_professionals = new Set(professionalSchedules.map((s) => s.staff_id));
      const total_professionals = unique_professionals.size;

      const total_exceptions = exceptions.length;

      // Calculate average hours per day
      const totalMinutes = rules.reduce((sum, rule) => {
        const [startHour, startMin] = rule.start_time.split(':').map(Number);
        const [endHour, endMin] = rule.end_time.split(':').map(Number);
        const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        return sum + minutes;
      }, 0);
      const average_hours_per_day = total_business_days > 0 ? totalMinutes / total_business_days / 60 : 0;

      // Find most and least available days
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayMinutes: Record<number, number> = {};

      rules.forEach((rule) => {
        const [startHour, startMin] = rule.start_time.split(':').map(Number);
        const [endHour, endMin] = rule.end_time.split(':').map(Number);
        const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        dayMinutes[rule.day_of_week] = (dayMinutes[rule.day_of_week] || 0) + minutes;
      });

      const sortedDays = Object.entries(dayMinutes).sort(([, a], [, b]) => b - a);
      const most_available_day = sortedDays.length > 0 ? dayNames[Number(sortedDays[0][0])] : 'N/A';
      const least_available_day = sortedDays.length > 0 ? dayNames[Number(sortedDays[sortedDays.length - 1][0])] : 'N/A';

      const summary: AvailabilityConfigSummary = {
        total_business_days,
        total_professionals,
        total_exceptions,
        average_hours_per_day: Number(average_hours_per_day.toFixed(1)),
        most_available_day,
        least_available_day,
      };

      logger.debug('AvailabilityAPI', 'Generated config summary', summary);
      return summary;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to get config summary', { error, location_id });
      throw error;
    }
  }

  /**
   * Bulk update availability rules for multiple days
   */
  async bulkUpdateAvailabilityRules(
    rules: Array<AvailabilityRuleInput & { id?: string }>
  ): Promise<AvailabilityRule[]> {
    try {
      const results: AvailabilityRule[] = [];

      for (const rule of rules) {
        if (rule.id) {
          // Update existing
          const updated = await this.updateAvailabilityRule(rule.id, rule);
          results.push(updated);
        } else {
          // Create new
          const created = await this.createAvailabilityRule(rule);
          results.push(created);
        }
      }

      logger.info('AvailabilityAPI', 'Bulk updated availability rules', { count: results.length });
      return results;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to bulk update availability rules', { error, rules });
      throw error;
    }
  }

  /**
   * Bulk update professional availability for a specific staff member
   */
  async bulkUpdateProfessionalAvailability(
    staff_id: string,
    schedules: Array<ProfessionalAvailabilityInput & { id?: string }>
  ): Promise<ProfessionalAvailability[]> {
    try {
      const results: ProfessionalAvailability[] = [];

      for (const schedule of schedules) {
        const scheduleWithStaff = { ...schedule, staff_id };

        if (schedule.id) {
          // Update existing
          const updated = await this.updateProfessionalAvailability(schedule.id, scheduleWithStaff);
          results.push(updated);
        } else {
          // Create new
          const created = await this.createProfessionalAvailability(scheduleWithStaff);
          results.push(created);
        }
      }

      logger.info('AvailabilityAPI', 'Bulk updated professional availability', {
        staff_id,
        count: results.length,
      });
      return results;
    } catch (error) {
      logger.error('AvailabilityAPI', 'Failed to bulk update professional availability', {
        error,
        staff_id,
        schedules,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const availabilityApi = new AvailabilityAPI();
