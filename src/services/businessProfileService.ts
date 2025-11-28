/**
 * BUSINESS PROFILE SERVICE - V4.1
 *
 * Sincronización bidireccional entre:
 * - capabilityStore (Zustand + localStorage)
 * - business_profiles table (Supabase)
 *
 * FLUJO:
 * 1. App init → loadProfileFromDB()
 * 2. User changes → saveProfileToDB()
 * 3. Real-time subscriptions → syncProfileFromDB()
 *
 * V4.1 CHANGES:
 * - ✅ Added request deduplication for loadProfileFromDB()
 *
 * V4.0 CHANGES:
 * - Migrated from activeCapabilities → selectedActivities/selectedInfrastructure
 * - Added completedMilestones tracking
 * - Added isFirstTimeInDashboard flag
 */

import { supabase } from '@/lib/supabase/client';
import type { UserProfile } from '@/store/capabilityStore';
import { logger } from '@/lib/logging';
import { deduplicator } from '@/lib/query/requestDeduplication'; // ✅ Deduplication

type CapabilityProfile = UserProfile;

// ============================================
// TYPES
// ============================================

export interface BusinessProfileRow {
  id: string;
  organization_id: string | null;
  business_name: string;
  business_type: string | null;
  email: string | null;
  phone: string | null;
  country: string;
  currency: string;

  // V4.0 - New columns
  selected_activities: string[]; // BusinessActivityId[]
  selected_infrastructure: string[]; // InfrastructureId[]
  completed_milestones: string[];
  is_first_time_dashboard: boolean;

  // Legacy columns (deprecated but kept for migration)
  active_capabilities: string[];
  business_structure: string;
  computed_configuration: any;
  auto_resolved_capabilities: string[];

  setup_completed: boolean;
  onboarding_step: number;
  setup_completed_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// LOAD FROM DB
// ============================================

/**
 * Cargar profile desde Supabase (al iniciar la app)
 * Returns null si no existe profile en la DB
 *
 * ✅ OPTIMIZED: Deduplicated to prevent multiple simultaneous loads
 * Multiple components may try to load this on app init - only 1 DB query is made.
 */
export async function loadProfileFromDB(): Promise<CapabilityProfile | null> {
  return deduplicator.dedupe('business_profile:load', async () => {
    try {
      logger.info('BusinessProfileService', '📥 Loading profile from database...');

      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .is('organization_id', null) // Single tenant
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found - esto es OK para primera vez
          logger.info('BusinessProfileService', '📭 No profile found in database (first time setup)');
          return null;
        }
        throw error;
      }

      if (!data) {
        logger.info('BusinessProfileService', '📭 No profile data returned');
        return null;
      }

      // Map DB row to CapabilityProfile (v4.0)
      const profile: CapabilityProfile = {
        businessName: data.business_name,
        businessType: data.business_type || '',
        email: data.email || '',
        phone: data.phone || '',
        country: data.country,
        currency: data.currency,

        // V4.0 fields
        selectedCapabilities: data.active_capabilities || [], // ✅ Load from active_capabilities
        selectedInfrastructure: data.selected_infrastructure || ['single_location'],

        setupCompleted: data.setup_completed,
        isFirstTimeInDashboard: data.is_first_time_dashboard ?? true,
        onboardingStep: data.onboarding_step
      };

      logger.info('BusinessProfileService', '✅ Profile loaded from database', {
        businessName: profile.businessName,
        capabilities: profile.selectedCapabilities.length,
        infrastructure: profile.selectedInfrastructure.length,
        setupCompleted: profile.setupCompleted
      });

      return profile;
    } catch (error) {
      logger.error('BusinessProfileService', '❌ Error loading profile from database', { error });
      throw error;
    }
  });
}

// ============================================
// SAVE TO DB
// ============================================

/**
 * Guardar profile en Supabase (al hacer cambios)
 * Usa UPSERT para crear o actualizar
 */
export async function saveProfileToDB(profile: CapabilityProfile): Promise<void> {
  try {
    logger.info('BusinessProfileService', '💾 Saving profile to database...', {
      businessName: profile.businessName,
      capabilities: profile.selectedCapabilities?.length || 0,
      infrastructure: profile.selectedInfrastructure?.length || 0
    });

    // Preparar datos para la DB (v4.0)
    const dbData: Partial<BusinessProfileRow> = {
      organization_id: null, // Single tenant
      business_name: profile.businessName,
      business_type: profile.businessType,
      email: profile.email,
      phone: profile.phone,
      country: profile.country,
      currency: profile.currency,

      // V4.0 fields
      active_capabilities: profile.selectedCapabilities || [], // ✅ Save selectedCapabilities!
      selected_infrastructure: profile.selectedInfrastructure || ['single_location'],
      completed_milestones: profile.completedMilestones || [],
      is_first_time_dashboard: profile.isFirstTimeInDashboard ?? true,

      // Legacy fields (kept for backward compatibility)
      business_structure: profile.selectedInfrastructure?.[0] || 'single_location',
      computed_configuration: {},
      auto_resolved_capabilities: [],

      setup_completed: profile.setupCompleted,
      onboarding_step: profile.onboardingStep,
      setup_completed_at: profile.setupCompleted ? new Date().toISOString() : null,
      updated_by: (await supabase.auth.getUser()).data.user?.id || null
    };

    // Check if profile exists
    const { data: existingProfile, error: selectError } = await supabase
      .from('business_profiles')
      .select('id')
      .is('organization_id', null)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    let error;
    if (existingProfile) {
      // UPDATE existing profile
      const result = await supabase
        .from('business_profiles')
        .update(dbData)
        .is('organization_id', null);
      error = result.error;
    } else {
      // INSERT new profile
      const result = await supabase
        .from('business_profiles')
        .insert(dbData);
      error = result.error;
    }

    if (error) {
      throw error;
    }

    logger.info('BusinessProfileService', '✅ Profile saved to database successfully');
  } catch (error) {
    logger.error('BusinessProfileService', '❌ Error saving profile to database', { error });
    throw error;
  }
}

// ============================================
// UPDATE MILESTONE COMPLETION
// ============================================

/**
 * Actualizar milestones completados (v4.0)
 */
export async function updateCompletedMilestonesInDB(milestones: string[]): Promise<void> {
  try {
    logger.info('BusinessProfileService', '🎯 Updating completed milestones...', {
      count: milestones.length
    });

    const { error } = await supabase
      .from('business_profiles')
      .update({
        completed_milestones: milestones,
        updated_by: (await supabase.auth.getUser()).data.user?.id || null
      })
      .is('organization_id', null);

    if (error) {
      throw error;
    }

    logger.info('BusinessProfileService', '✅ Milestones updated in database');
  } catch (error) {
    logger.error('BusinessProfileService', '❌ Error updating milestones', { error });
    throw error;
  }
}

// ============================================
// UPDATE FIRST TIME FLAG
// ============================================

/**
 * Actualizar flag de primera vez en dashboard (v4.0)
 */
export async function dismissWelcomeInDB(): Promise<void> {
  try {
    logger.info('BusinessProfileService', '👋 Dismissing welcome screen in DB...');

    const { error } = await supabase
      .from('business_profiles')
      .update({
        is_first_time_dashboard: false,
        updated_by: (await supabase.auth.getUser()).data.user?.id || null
      })
      .is('organization_id', null);

    if (error) {
      throw error;
    }

    logger.info('BusinessProfileService', '✅ Welcome dismissed in database');
  } catch (error) {
    logger.error('BusinessProfileService', '❌ Error dismissing welcome', { error });
    throw error;
  }
}

// ============================================
// DELETE PROFILE
// ============================================

/**
 * Eliminar profile de la DB (solo para desarrollo/testing)
 * En producción normalmente no se elimina
 */
export async function deleteProfileFromDB(): Promise<void> {
  try {
    logger.warn('BusinessProfileService', '🗑️ Deleting profile from database...');

    const { error } = await supabase
      .from('business_profiles')
      .delete()
      .is('organization_id', null);

    if (error) {
      throw error;
    }

    logger.info('BusinessProfileService', '✅ Profile deleted from database');
  } catch (error) {
    logger.error('BusinessProfileService', '❌ Error deleting profile', { error });
    throw error;
  }
}

// ============================================
// REAL-TIME SUBSCRIPTION
// ============================================

/**
 * Suscribirse a cambios en tiempo real
 * Útil para sincronización multi-dispositivo/multi-usuario
 */
export function subscribeToProfileChanges(
  callback: (profile: CapabilityProfile) => void
): () => void {
  logger.info('BusinessProfileService', '🔔 Subscribing to profile changes...');

  const subscription = supabase
    .channel('business_profiles_changes')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'business_profiles'
      },
      (payload) => {
        logger.info('BusinessProfileService', '📡 Profile changed in database', {
          event: payload.eventType
        });

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const data = payload.new as BusinessProfileRow;

          const profile: CapabilityProfile = {
            businessName: data.business_name,
            businessType: data.business_type || '',
            email: data.email || '',
            phone: data.phone || '',
            country: data.country,
            currency: data.currency,

            // V4.0 fields
            selectedActivities: data.selected_activities || [],
            selectedInfrastructure: data.selected_infrastructure || ['single_location'],

            setupCompleted: data.setup_completed,
            isFirstTimeInDashboard: data.is_first_time_dashboard ?? true,
            onboardingStep: data.onboarding_step
          };

          callback(profile);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    logger.info('BusinessProfileService', '🔕 Unsubscribing from profile changes');
    subscription.unsubscribe();
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verificar si existe un profile en la DB
 */
export async function hasProfileInDB(): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('business_profiles')
      .select('*', { count: 'exact', head: true })
      .is('organization_id', null);

    if (error) throw error;

    return (count || 0) > 0;
  } catch (error) {
    logger.error('BusinessProfileService', '❌ Error checking profile existence', { error });
    return false;
  }
}

/**
 * Obtener solo las activities seleccionadas (v4.0)
 *
 * ✅ OPTIMIZED: Deduplicated
 */
export async function getSelectedActivitiesFromDB(): Promise<string[]> {
  return deduplicator.dedupe('business_profile:activities', async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('selected_activities')
        .is('organization_id', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return [];
        throw error;
      }

      return data?.selected_activities || [];
    } catch (error) {
      logger.error('BusinessProfileService', '❌ Error getting activities from DB', { error });
      return [];
    }
  });
}
