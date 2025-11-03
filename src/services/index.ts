/**
 * Services Index
 *
 * Pure utility services that are called on-demand.
 * Background services have been migrated to React hooks.
 *
 * ARCHITECTURE CHANGE (2025-10-20):
 * - OLD: Singleton services with setInterval (anti-pattern)
 * - NEW: React hooks with useEffect cleanup (best practice)
 *
 * See:
 * - src/hooks/useAppointmentReminders.ts
 * - docs/05-development/BACKGROUND_SERVICES_STRATEGY.md
 */

// Pure utility services (called on-demand)
export { emailService } from './emailService';
