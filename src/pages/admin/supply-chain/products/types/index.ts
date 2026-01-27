// Products Types - Main Exports
// Provides clean imports for all product management types

export * from './product';
export * from './menu-engineering';
export * from './serviceContext';

// Export new product form types (v3.0)
export type {
  // Product Types
  ProductType,

  // Field Types
  BasicInfoFields,
  MaterialsFields,
  StaffFields,
  BookingFields,
  ProductionFields,
  PricingFields,
  AssetConfigFields,
  RentalTermsFields,
  DigitalDeliveryFields,
  RecurringConfigFields,

  // Sub-types
  ProductComponent,
  StaffAllocation,
  TimeSlot,
  OverheadConfig,
  ProductCostBreakdown,
  DepreciationConfig,
  SecurityDepositConfig,
  InspectionConfig,
  InsuranceConfig,
  MaintenanceConfig,
  AvailabilityConfig,
  GPSConfig,
  Geofence,
  UsageRestrictions,
  Accessory,
  ChecklistTemplate,
  LateReturnPolicy,
  DamagePolicy,
  InsuranceOption,
  CancellationPolicy,

  // Unified Form Data
  ProductFormData,

  // Template & UI Types
  ProductTypeTemplate,

  // Validation Types
  ValidationError,
  ValidationResult,

  // Form Section Types
  FormSection,
  FormSectionProps
} from './productForm';