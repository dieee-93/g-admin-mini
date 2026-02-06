/**
 * Production Equipment Hooks
 *
 * Central export for all equipment-related hooks
 */

export {
  // Query Hooks
  useEquipment,
  useAvailableEquipment,
  useEquipmentById,
  useEquipmentCostBreakdown,
  useEquipmentMetrics,

  // Mutation Hooks
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
  useRecordEquipmentUsage,

  // Query Keys
  equipmentKeys,

  // Types
  type EquipmentFilters,
} from './useProductionEquipment';
