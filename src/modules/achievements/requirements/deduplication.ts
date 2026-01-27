/**
 * REQUIREMENTS DEDUPLICATION UTILITY
 * 
 * Utility functions para deduplicar requirements cuando múltiples módulos
 * importan el mismo shared requirement por referencia.
 * 
 * PROBLEMA QUE RESUELVE:
 * - delivery module imports: [CUSTOMER_FIRST_ADDED, PRODUCT_MIN_CATALOG, ...]
 * - ecommerce module imports: [CUSTOMER_FIRST_ADDED, PRODUCT_MIN_CATALOG, ...]
 * - corporate_sales module imports: [CUSTOMER_FIRST_ADDED, ...]
 * 
 * SIN DEDUPLICACIÓN:
 * - CUSTOMER_FIRST_ADDED aparece 3 veces en UI
 * - Se valida 3 veces (innecesario)
 * - Confunde al usuario
 * 
 * CON DEDUPLICACIÓN (Reference-based):
 * - CUSTOMER_FIRST_ADDED aparece 1 vez (mismo objeto en memoria)
 * - Se valida 1 vez
 * - UI muestra progreso correcto
 * - O(1) deduplication usando JavaScript reference equality
 * 
 * ARCHITECTURE v2.0:
 * - Usa Set<Achievement> con reference equality (===)
 * - No depende de IDs string (más robusto)
 * - Automatic deduplication via JavaScript object references
 * - Type-safe (compiler validates shared imports)
 * 
 * @version 2.0.0 - Reference-based deduplication
 */

import type { Achievement } from '../types';

// ============================================
// TYPES
// ============================================

/**
 * Resultado de registro de requirement con metadata
 */
export interface RequirementRegistration {
  /** Capability que registra este requirement */
  capability: string;
  
  /** Array de requirements */
  requirements: Achievement[];
  
  /** Módulo que lo registró */
  moduleId: string;
  
  /** Timestamp de registro */
  timestamp?: number;
}

/**
 * Registry con deduplicación basada en referencias
 */
export interface DeduplicatedRegistry {
  /** Requirements únicos (por reference equality) */
  requirements: Achievement[];
  
  /** Metadata: qué capabilities usan cada requirement (por ID) */
  usageMap: Map<string, Set<string>>;
  
  /** Metadata: qué módulos registraron cada requirement (por ID) */
  moduleMap: Map<string, Set<string>>;
}

// ============================================
// DEDUPLICATION FUNCTIONS
// ============================================

/**
 * Deduplica requirements por REFERENCIA (object identity).
 * 
 * Si el mismo requirement object se registra múltiples veces, 
 * solo se mantiene UNA instancia en el array resultante.
 * 
 * ARQUITECTURA:
 * - Usa Set<Achievement> para deduplicar por referencia
 * - JavaScript compara referencias con === operator
 * - Mismo objeto importado = misma referencia = automatic deduplication
 * 
 * @param registrations - Array de registros de requirements
 * @returns Registry deduplicado con metadata
 * 
 * @example
 * ```typescript
 * // Module A imports shared requirement
 * import { CUSTOMER_FIRST_ADDED } from '@/shared/requirements';
 * const deliveryReqs = [CUSTOMER_FIRST_ADDED, DELIVERY_ZONE];
 * 
 * // Module B imports same shared requirement (SAME OBJECT REFERENCE)
 * import { CUSTOMER_FIRST_ADDED } from '@/shared/requirements';
 * const ecommerceReqs = [CUSTOMER_FIRST_ADDED, ONLINE_CATALOG];
 * 
 * // Registration
 * const registrations = [
 *   { capability: 'delivery_shipping', requirements: deliveryReqs, moduleId: 'delivery' },
 *   { capability: 'async_operations', requirements: ecommerceReqs, moduleId: 'ecommerce' },
 * ];
 * 
 * // Deduplication (automatic via reference equality)
 * const deduplicated = deduplicateRequirements(registrations);
 * // deduplicated.requirements has only 1 CUSTOMER_FIRST_ADDED (same object)
 * // deduplicated.usageMap['customer_first_added'] = Set(['delivery_shipping', 'async_operations'])
 * ```
 */
export function deduplicateRequirements(
  registrations: RequirementRegistration[]
): DeduplicatedRegistry {
  // Use Set for O(1) reference-based deduplication
  const uniqueRequirements = new Set<Achievement>();
  const usageMap = new Map<string, Set<string>>();
  const moduleMap = new Map<string, Set<string>>();

  for (const registration of registrations) {
    for (const req of registration.requirements) {
      // ✅ Add to Set (automatic deduplication by reference)
      uniqueRequirements.add(req);

      // Tracking de usage por capability (by ID for metadata)
      if (!usageMap.has(req.id)) {
        usageMap.set(req.id, new Set());
      }
      usageMap.get(req.id)!.add(registration.capability);

      // Tracking de módulo que lo registró (by ID for metadata)
      if (!moduleMap.has(req.id)) {
        moduleMap.set(req.id, new Set());
      }
      moduleMap.get(req.id)!.add(registration.moduleId);
    }
  }

  return {
    requirements: Array.from(uniqueRequirements), // Convert Set to Array
    usageMap,
    moduleMap,
  };
}

/**
 * Filtra requirements por capabilities seleccionadas.
 * 
 * Solo retorna requirements que sean relevantes para las capabilities activas.
 * 
 * @param deduplicatedRegistry - Registry deduplicado
 * @param selectedCapabilities - Capabilities seleccionadas por el usuario
 * @returns Array de requirements relevantes
 * 
 * @example
 * ```typescript
 * const relevant = filterByCapabilities(
 *   registry,
 *   ['delivery_shipping', 'pickup_orders']
 * );
 * // Solo retorna requirements que apliquen a delivery o pickup
 * ```
 */
export function filterByCapabilities(
  deduplicatedRegistry: DeduplicatedRegistry,
  selectedCapabilities: string[]
): Achievement[] {
  return deduplicatedRegistry.requirements.filter((req) => {
    const capabilities = deduplicatedRegistry.usageMap.get(req.id);
    
    if (!capabilities) return false;

    // Verificar si este requirement aplica a alguna de las capabilities seleccionadas
    const isRelevant = Array.from(capabilities).some((cap) =>
      selectedCapabilities.includes(cap)
    );

    // Agregar si es relevante
    return isRelevant;
  });
}

/**
 * Obtiene estadísticas de deduplicación.
 * Útil para debugging y logging.
 * 
 * @param registry - Registry deduplicado
 * @returns Estadísticas
 */
export function getDeduplicationStats(registry: DeduplicatedRegistry) {
  const totalRequirements = registry.requirements.length;
  const sharedRequirements = registry.requirements.filter(
    (r) => r.capability === 'shared'
  ).length;
  
  const mostShared = Array.from(registry.usageMap.entries())
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 5)
    .map(([reqId, caps]) => {
      const req = registry.requirements.find((r) => r.id === reqId);
      return {
        requirementId: reqId,
        requirementName: req?.name,
        usedByCount: caps.size,
        usedBy: Array.from(caps),
      };
    });

  return {
    totalRequirements,
    sharedRequirements,
    capabilitySpecific: totalRequirements - sharedRequirements,
    mostShared,
  };
}

/**
 * Valida que no haya conflictos de IDs.
 * 
 * Detecta cuando dos requirements DIFERENTES tienen el mismo ID
 * (esto sería un bug - IDs deben ser únicos).
 * 
 * Note: Si dos registrations importan el MISMO requirement object,
 * NO es un conflicto (es deduplicación normal).
 * 
 * @param registrations - Array de registros
 * @returns Array de conflictos encontrados (vacío si no hay)
 */
export function validateNoConflicts(
  registrations: RequirementRegistration[]
): Array<{ id: string; conflict: string }> {
  const conflicts: Array<{ id: string; conflict: string }> = [];
  const seenRequirements = new Map<string, Achievement>();

  for (const registration of registrations) {
    for (const req of registration.requirements) {
      const existing = seenRequirements.get(req.id);
      
      if (existing) {
        // ✅ Check if it's the SAME object (reference equality)
        if (existing === req) {
          // Same object - this is normal (shared requirement imported multiple times)
          continue;
        }
        
        // ❌ Different objects with same ID - this is a CONFLICT
        conflicts.push({
          id: req.id,
          conflict: `ID conflict: "${req.id}" used by different requirement objects. ` +
                   `Existing: "${existing.name}", New: "${req.name}". ` +
                   `IDs must be unique across all requirements.`,
        });
      } else {
        seenRequirements.set(req.id, req);
      }
    }
  }

  return conflicts;
}

// ============================================
// HELPER: BUILD DYNAMIC REGISTRY
// ============================================

/**
 * Construye un registry dinámico agrupado por capability.
 * 
 * @param registrations - Array de registros
 * @param selectedCapabilities - Capabilities seleccionadas
 * @returns Record<CapabilityId, Requirement[]>
 * 
 * @example
 * ```typescript
 * const dynamicRegistry = buildCapabilityRegistry(registrations, ['delivery_shipping']);
 * // {
 * //   delivery_shipping: [CUSTOMER_FIRST_ADDED, DELIVERY_ZONE_CONFIGURED, ...]
 * // }
 * ```
 */
export function buildCapabilityRegistry(
  registrations: RequirementRegistration[],
  selectedCapabilities: string[]
): Record<string, Achievement[]> {
  const registry: Record<string, Achievement[]> = {};

  // Primero deduplicar
  const deduplicated = deduplicateRequirements(registrations);

  // Para cada capability seleccionada
  for (const capability of selectedCapabilities) {
    registry[capability] = [];

    // Agregar requirements de esa capability
    for (const req of deduplicated.requirements) {
      const caps = deduplicated.usageMap.get(req.id);
      
      if (caps?.has(capability)) {
        registry[capability].push(req);
      }
    }
  }

  return registry;
}

// ============================================
// HELPER: DEBUGGING & LOGGING
// ============================================

/**
 * Genera un reporte detallado de deduplicación para debugging.
 * 
 * @param registrations - Array de registros
 * @returns Reporte de deduplicación
 */
export function generateDeduplicationReport(
  registrations: RequirementRegistration[]
): {
  totalRegistrations: number;
  totalRequirementsBeforeDedup: number;
  totalRequirementsAfterDedup: number;
  deduplicationSavings: number;
  duplicatesByReference: Array<{
    requirementId: string;
    requirementName: string;
    occurrences: number;
    sameObjectReference: boolean;
  }>;
  conflicts: Array<{ id: string; conflict: string }>;
} {
  const totalRegistrations = registrations.length;
  const totalRequirementsBeforeDedup = registrations.reduce(
    (sum, r) => sum + r.requirements.length,
    0
  );

  const deduplicated = deduplicateRequirements(registrations);
  const totalRequirementsAfterDedup = deduplicated.requirements.length;
  const deduplicationSavings = totalRequirementsBeforeDedup - totalRequirementsAfterDedup;

  // Check which requirements appear multiple times
  const duplicatesByReference: Array<{
    requirementId: string;
    requirementName: string;
    occurrences: number;
    sameObjectReference: boolean;
  }> = [];

  for (const [reqId, modules] of deduplicated.moduleMap) {
    if (modules.size > 1) {
      const req = deduplicated.requirements.find((r) => r.id === reqId);
      
      // Check if all occurrences are the same object
      const allOccurrences = registrations
        .flatMap((r) => r.requirements)
        .filter((r) => r.id === reqId);
      
      const firstOccurrence = allOccurrences[0];
      const sameObjectReference = allOccurrences.every((r) => r === firstOccurrence);

      duplicatesByReference.push({
        requirementId: reqId,
        requirementName: req?.name || 'Unknown',
        occurrences: modules.size,
        sameObjectReference,
      });
    }
  }

  const conflicts = validateNoConflicts(registrations);

  return {
    totalRegistrations,
    totalRequirementsBeforeDedup,
    totalRequirementsAfterDedup,
    deduplicationSavings,
    duplicatesByReference,
    conflicts,
  };
}
