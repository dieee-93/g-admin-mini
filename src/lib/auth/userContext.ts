/**
 * User Context Helper for Audit Trail & Event Sourcing
 *
 * Industry standard approach for capturing user context in non-React services.
 * Based on Supabase best practices and Event Sourcing audit trail requirements (2026).
 *
 * @see docs/roadmap/modules/auth/auth-context-audit-trail-fix.md
 *
 * References:
 * - https://supabase.com/docs/guides/auth/managing-user-data
 * - https://supabase.com/docs/reference/javascript/auth-getclaims
 * - https://signal.opshub.me/audit-trail-best-practices/
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

const MODULE_ID = 'UserContext';

/**
 * User context for audit trail and event sourcing
 *
 * This interface captures the essential user information needed for:
 * - Event metadata (who performed the action)
 * - Audit trails (compliance and debugging)
 * - Row Level Security (RLS) policies
 */
export interface UserContext {
  /** User UUID from auth.users */
  id: string;

  /** User email (immutable, useful for investigation) */
  email: string;

  /** User display name with fallback chain */
  name: string;

  /** User role at the moment of action (can change over time) */
  role: string;
}

/**
 * Get current authenticated user context
 *
 * This function works in any context (React components, services, Edge Functions)
 * and follows industry best practices:
 *
 * 1. Uses supabase.auth.getUser() for user data (works in service layer)
 * 2. Uses getClaims() for role (faster, uses JWKS cache vs DB query)
 * 3. Handles naming convention inconsistencies (full_name vs fullName)
 * 4. Provides robust fallbacks for missing data
 *
 * Performance note: getClaims() is ~10x faster than querying user_profiles table
 * because it uses local JWKS cache instead of network request.
 *
 * @throws {Error} If user is not authenticated
 * @returns {Promise<UserContext>} User context with id, email, name, role
 *
 * @example
 * ```typescript
 * // In a service (non-React)
 * export async function createOrder(data: OrderData) {
 *   const userContext = await getUserContext();
 *
 *   const metadata = {
 *     user_id: userContext.id,
 *     user_email: userContext.email,
 *     user_name: userContext.name,
 *     user_role: userContext.role,
 *     // ... other metadata
 *   };
 *
 *   await eventBus.emit('order.created', metadata);
 * }
 * ```
 */
export async function getUserContext(): Promise<UserContext> {
  try {
    // 1. Get authenticated user
    // Uses supabase.auth.getUser() which works in any context (React, services, Edge Functions)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      logger.error(MODULE_ID, 'Error getting user from auth', { error: userError });
      throw new Error('Error al obtener usuario autenticado');
    }

    if (!user) {
      logger.warn(MODULE_ID, 'No authenticated user found');
      throw new Error('Usuario no autenticado');
    }

    // 2. Get role from JWT custom claims
    // getClaims() is preferred over DB query because:
    // - Uses JWKS cache (no network request)
    // - ~10x faster than querying user_profiles
    // - Claims are updated on token refresh
    const { data: { claims }, error: claimsError } = await supabase.auth.getClaims();

    if (claimsError) {
      logger.warn(MODULE_ID, 'Error getting JWT claims, will use fallback role', { error: claimsError });
    }

    // Extract role from claims with fallback
    // Default to 'OPERADOR' if claims not available (safe default with limited permissions)
    const userRole = (claims?.user_role as string) || 'OPERADOR';

    // 3. Get display name with robust fallback chain
    //
    // IMPORTANT: Handles naming convention inconsistency in codebase:
    // - AuthContext.signUp() uses 'full_name' (snake_case, OAuth standard) ✅
    // - Legacy forms used 'fullName' (camelCase, non-standard) ❌
    // - OAuth providers (Google, GitHub) use 'full_name' (snake_case) ✅
    //
    // Solution: Try both for compatibility with existing users
    //
    // TODO: Migrate all legacy registrations to use 'full_name'
    // See: docs/roadmap/DISCOVERIES.md - "User metadata inconsistency"
    const userName =
      user.user_metadata?.full_name    // ✅ Standard (OAuth, RegisterForm)
      || user.user_metadata?.fullName  // ⚠️  Legacy (CreateAdminUserForm)
      || user.email                    // Fallback to email
      || 'Usuario';                    // Ultimate fallback

    logger.debug(MODULE_ID, 'User context retrieved', {
      userId: user.id,
      userEmail: user.email,
      userName,
      userRole,
      hasFullName: !!user.user_metadata?.full_name,
      hasFullNameCamel: !!user.user_metadata?.fullName,
    });

    return {
      id: user.id,
      email: user.email || '',
      name: userName,
      role: userRole,
    };
  } catch (error) {
    logger.error(MODULE_ID, 'Error in getUserContext', { error });
    throw error;
  }
}

/**
 * Get user context with error handling that returns null instead of throwing
 *
 * Useful for optional user context (e.g., analytics events where user might not be required)
 *
 * @returns {Promise<UserContext | null>} User context or null if not authenticated
 *
 * @example
 * ```typescript
 * // In an analytics event where user is optional
 * const userContext = await getUserContextSafe();
 *
 * await analytics.track('page_view', {
 *   user_id: userContext?.id || 'anonymous',
 *   // ...
 * });
 * ```
 */
export async function getUserContextSafe(): Promise<UserContext | null> {
  try {
    return await getUserContext();
  } catch (error) {
    logger.debug(MODULE_ID, 'getUserContextSafe: No user context available', { error });
    return null;
  }
}
