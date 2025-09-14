/**
 * Measurement type detection utilities
 * Separates measurement logic from business categorization
 */

export type MeasurementType = 'weight' | 'volume' | 'length' | 'unknown';

/**
 * Unit patterns for different measurement types
 */
const MEASUREMENT_PATTERNS = {
  weight: [
    // Metric weight units
    /^(kg|kilogram|kilogramme|kilogramo)s?$/i,
    /^(g|gram|gramo)s?$/i,
    /^(mg|milligram|miligramo)s?$/i,
    /^(ton|tonelada|tonne)s?$/i,
    // Imperial weight units
    /^(lb|pound|libra)s?$/i,
    /^(oz|ounce|onza)s?$/i,
    // Common abbreviations
    /^(kilo|gr)s?$/i
  ],
  
  volume: [
    // Metric volume units
    /^(l|liter|litre|litro)s?$/i,
    /^(ml|milliliter|millilitre|mililitro)s?$/i,
    /^(cl|centiliter|centilitre|centilitro)s?$/i,
    /^(dl|deciliter|decilitre|decilitro)s?$/i,
    // Imperial volume units
    /^(gal|gallon|galon)s?$/i,
    /^(qt|quart|cuarto)s?$/i,
    /^(pt|pint|pinta)s?$/i,
    /^(fl\.?\s?oz|fluid\s?ounce|onza\s?liquida)s?$/i,
    // Cubic measurements
    /^(m3|m³|metro\s?cubico|cubic\s?meter)s?$/i,
    /^(cm3|cm³|centimetro\s?cubico|cubic\s?centimeter)s?$/i,
    /^(mm3|mm³|milimetro\s?cubico|cubic\s?millimeter)s?$/i
  ],
  
  length: [
    // Metric length units
    /^(m|meter|metre|metro)s?$/i,
    /^(cm|centimeter|centimetre|centimetro)s?$/i,
    /^(mm|millimeter|millimetre|milimetro)s?$/i,
    /^(km|kilometer|kilometre|kilometro)s?$/i,
    // Imperial length units
    /^(ft|foot|feet|pie)s?$/i,
    /^(in|inch|pulgada)s?$/i,
    /^(yd|yard|yarda)s?$/i,
    /^(mi|mile|milla)s?$/i
  ]
} as const;

/**
 * Detects measurement type based on unit string
 */
export function getMeasurementType(unit: string): MeasurementType {
  if (!unit || typeof unit !== 'string') {
    return 'unknown';
  }

  const normalizedUnit = unit.trim();
  
  // Check each measurement type
  for (const [type, patterns] of Object.entries(MEASUREMENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedUnit)) {
        return type as MeasurementType;
      }
    }
  }
  
  return 'unknown';
}

/**
 * Checks if a unit represents a weight measurement
 */
export function isWeightUnit(unit: string): boolean {
  return getMeasurementType(unit) === 'weight';
}

/**
 * Checks if a unit represents a volume measurement
 */
export function isVolumeUnit(unit: string): boolean {
  return getMeasurementType(unit) === 'volume';
}

/**
 * Checks if a unit represents a length measurement
 */
export function isLengthUnit(unit: string): boolean {
  return getMeasurementType(unit) === 'length';
}

/**
 * Gets suggested default precision for a measurement type
 */
export function getDefaultPrecision(measurementType: MeasurementType): number {
  switch (measurementType) {
    case 'weight':
      return 3; // e.g., 1.250 kg
    case 'volume':
      return 2; // e.g., 1.50 L
    case 'length':
      return 2; // e.g., 1.50 m
    default:
      return 2;
  }
}

/**
 * Gets suggested default precision based on unit string
 */
export function getPrecisionForUnit(unit: string): number {
  const measurementType = getMeasurementType(unit);
  return getDefaultPrecision(measurementType);
}

/**
 * Gets common units for a measurement type (for UI dropdowns)
 */
export function getCommonUnitsForType(measurementType: MeasurementType): string[] {
  switch (measurementType) {
    case 'weight':
      return ['kg', 'g', 'mg', 'ton', 'lb', 'oz'];
    case 'volume':
      return ['l', 'ml', 'cl', 'dl', 'gal', 'qt', 'pt'];
    case 'length':
      return ['m', 'cm', 'mm', 'km', 'ft', 'in', 'yd'];
    default:
      return ['unidad', 'pieza', 'paquete'];
  }
}

/**
 * Validates if a unit is appropriate for a measurement type
 */
export function isValidUnitForType(unit: string, expectedType: MeasurementType): boolean {
  const detectedType = getMeasurementType(unit);
  return detectedType === expectedType || detectedType === 'unknown';
}

/**
 * Suggests measurement type based on item name (fallback when unit is unclear)
 */
export function suggestMeasurementTypeFromName(itemName: string): MeasurementType {
  if (!itemName || typeof itemName !== 'string') {
    return 'unknown';
  }

  const name = itemName.toLowerCase();
  
  // Weight-based items
  if (name.includes('harina') || name.includes('azucar') || name.includes('sal') || 
      name.includes('carne') || name.includes('pollo') || name.includes('pescado') ||
      name.includes('queso') || name.includes('mantequilla')) {
    return 'weight';
  }
  
  // Volume-based items
  if (name.includes('aceite') || name.includes('leche') || name.includes('agua') ||
      name.includes('vinagre') || name.includes('jugo') || name.includes('liquido') ||
      name.includes('salsa') || name.includes('crema')) {
    return 'volume';
  }
  
  // Length is less common in food items, but could apply to things like:
  if (name.includes('cable') || name.includes('tubo') || name.includes('cinta') ||
      name.includes('alambre')) {
    return 'length';
  }
  
  return 'unknown';
}

/**
 * Auto-detects appropriate category for measurable items based on unit and name
 */
export function autoDetectMeasurementCategory(unit: string, itemName?: string): MeasurementType {
  // First try to detect from unit
  const typeFromUnit = getMeasurementType(unit);
  if (typeFromUnit !== 'unknown') {
    return typeFromUnit;
  }
  
  // Fallback to name-based detection
  if (itemName) {
    return suggestMeasurementTypeFromName(itemName);
  }
  
  return 'unknown';
}