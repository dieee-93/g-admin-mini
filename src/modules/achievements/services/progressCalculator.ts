/**
 * PROGRESS CALCULATOR SERVICE
 * 
 * Servicio puro para calcular el progreso de requirements de una capability.
 * Reemplaza la lógica que estaba en achievementsStore.
 * 
 * ⚠️ ARQUITECTURA:
 * - Funciones puras (NO hooks de React)
 * - NO maneja estado
 * - Solo computa progreso basándose en context
 * - Usa TanStack Query para cache/reactividad (desde el caller)
 * 
 * PATRÓN:
 * - Service layer: Lógica de negocio pura
 * - Separado de UI y estado
 * - Fácil de testear (funciones puras)
 * 
 * @version 2.0.0
 */

import type { BusinessCapabilityId } from '@/config/types';
import type { ValidationContext, CapabilityProgress, Requirement } from '../types';
import { getRequirementsForCapability } from '../requirements';

/**
 * Computa el progreso de requirements para una capability.
 * 
 * ⚠️ CRÍTICO: Esta función determina si una capability está operacional.
 * Si percentage === 100, la capability puede usarse.
 * Si percentage < 100, la operación será BLOQUEADA.
 * 
 * @param capability - ID de la capability a evaluar
 * @param context - Contexto de validación con datos actuales
 * @returns Objeto con progreso calculado
 */
export function computeProgress(
  capability: BusinessCapabilityId,
  context: ValidationContext
): CapabilityProgress {
  const requirements = getRequirementsForCapability(capability);
  const mandatoryReqs = requirements.filter((r) => r.tier === 'mandatory');

  if (mandatoryReqs.length === 0) {
    return {
      capability,
      total: 0,
      completed: 0,
      percentage: 0,
      isOperational: false,
    };
  }

  const completed = mandatoryReqs.filter((req) => req.validator(context)).length;
  const total = mandatoryReqs.length;
  const percentage = Math.round((completed / total) * 100);
  const missing = mandatoryReqs.filter((req) => !req.validator(context));

  return {
    capability,
    total,
    completed,
    percentage,
    isOperational: percentage === 100,
    missing: missing.length > 0 ? missing : undefined,
  };
}

/**
 * Computa el progreso de múltiples capabilities.
 * 
 * @param capabilities - Array de capability IDs a evaluar
 * @param context - Contexto de validación con datos actuales
 * @returns Array de objetos con progreso de cada capability
 */
export function computeAllProgress(
  capabilities: BusinessCapabilityId[],
  context: ValidationContext
): CapabilityProgress[] {
  return capabilities.map((cap) => computeProgress(cap, context));
}

/**
 * Verifica si una capability específica está operacional.
 * Útil para validaciones rápidas.
 * 
 * @param capability - ID de la capability
 * @param context - Contexto de validación
 * @returns true si todos los requirements están completos
 */
export function isCapabilityOperational(
  capability: BusinessCapabilityId,
  context: ValidationContext
): boolean {
  const progress = computeProgress(capability, context);
  return progress.isOperational;
}

/**
 * Obtiene los requirements faltantes de una capability.
 * Útil para mostrar en UI qué falta configurar.
 * 
 * @param capability - ID de la capability
 * @param context - Contexto de validación
 * @returns Array de requirements que no están completos
 */
export function getMissingRequirements(
  capability: BusinessCapabilityId,
  context: ValidationContext
): Requirement[] {
  const requirements = getRequirementsForCapability(capability);
  const mandatoryReqs = requirements.filter((r) => r.tier === 'mandatory');
  
  return mandatoryReqs.filter((req) => !req.validator(context));
}
