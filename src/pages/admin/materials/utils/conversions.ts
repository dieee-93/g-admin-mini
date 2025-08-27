// src/features/inventory/utils/conversions.ts
// 🧮 SISTEMA DE CONVERSIONES PRECISAS - Sin decimales, máxima precisión

import {
  UNIT_CONVERSIONS,
  UNIT_CATEGORIES,
  type MeasurableUnit,
  type WeightUnit,
  type VolumeUnit,
  type LengthUnit,
  type ConversionResult,
  type UnitHelper
} from '../types';

// ============================================================================
// 🔍 DETECCIÓN DE CATEGORÍA DE UNIDAD
// ============================================================================

export function getUnitCategory(unit: MeasurableUnit): 'weight' | 'volume' | 'length' | null {
  if (UNIT_CATEGORIES.weight.includes(unit as WeightUnit)) return 'weight';
  if (UNIT_CATEGORIES.volume.includes(unit as VolumeUnit)) return 'volume';
  if (UNIT_CATEGORIES.length.includes(unit as LengthUnit)) return 'length';
  return null;
}

export function getCompatibleUnits(unit: MeasurableUnit): MeasurableUnit[] {
  const category = getUnitCategory(unit);
  if (!category) return [unit];
  return UNIT_CATEGORIES[category] as MeasurableUnit[];
}

// ============================================================================
// 🔄 CONVERSIONES ENTRE UNIDADES
// ============================================================================

export function convertUnit(
  value: number,
  fromUnit: MeasurableUnit,
  toUnit: MeasurableUnit
): ConversionResult | null {
  const fromCategory = getUnitCategory(fromUnit);
  const toCategory = getUnitCategory(toUnit);
  
  // Solo se puede convertir entre unidades de la misma categoría
  if (!fromCategory || !toCategory || fromCategory !== toCategory) {
    return null;
  }
  
  const conversions = UNIT_CONVERSIONS[fromCategory];
  
  // Convertir a unidad base y luego a unidad destino
  const baseValue = value * conversions[fromUnit as keyof typeof conversions];
  const convertedValue = baseValue / conversions[toUnit as keyof typeof conversions];
  const conversionFactor = conversions[fromUnit as keyof typeof conversions] / 
                          conversions[toUnit as keyof typeof conversions];
  
  return {
    originalValue: value,
    originalUnit: fromUnit,
    convertedValue: Math.round(convertedValue), // Sin decimales como pidió
    convertedUnit: toUnit,
    conversionFactor
  };
}

// ============================================================================
// 📊 NORMALIZACIÓN A UNIDAD BASE
// ============================================================================

export function normalizeToBase(value: number, unit: MeasurableUnit): number {
  const category = getUnitCategory(unit);
  if (!category) return value;
  
  const conversions = UNIT_CONVERSIONS[category];
  return Math.round(value * conversions[unit as keyof typeof conversions]);
}

export function denormalizeFromBase(baseValue: number, targetUnit: MeasurableUnit): number {
  const category = getUnitCategory(targetUnit);
  if (!category) return baseValue;
  
  const conversions = UNIT_CONVERSIONS[category];
  return Math.round(baseValue / conversions[targetUnit as keyof typeof conversions]);
}

// ============================================================================
// 🎨 FORMATEO Y DISPLAY
// ============================================================================

export function formatQuantity(value: number, unit: string, precision: number = 0): string {
  if (precision > 0) {
    return `${value.toFixed(precision)} ${unit}`;
  }
  return `${Math.round(value)} ${unit}`;
}

export function formatWithConversion(
  value: number, 
  unit: MeasurableUnit, 
  preferredUnit?: MeasurableUnit
): string {
  if (!preferredUnit || unit === preferredUnit) {
    return formatQuantity(value, unit);
  }
  
  const conversion = convertUnit(value, unit, preferredUnit);
  if (!conversion) {
    return formatQuantity(value, unit);
  }
  
  return `${formatQuantity(conversion.convertedValue, preferredUnit)} (${formatQuantity(value, unit)})`;
}

// ============================================================================
// 🛠️ HELPERS PARA FORMULARIOS
// ============================================================================

export function getUnitHelper(category: 'weight' | 'volume' | 'length'): UnitHelper {
  const baseUnits = {
    weight: 'g',
    volume: 'ml', 
    length: 'mm'
  };
  
  const displayFormats = {
    weight: (value: number, unit: string) => {
      if (unit === 'kg' && value >= 1000) return `${Math.round(value/1000)} ton`;
      if (unit === 'g' && value >= 1000) return `${Math.round(value/1000)} kg`;
      return `${value} ${unit}`;
    },
    volume: (value: number, unit: string) => {
      if (unit === 'ml' && value >= 1000) return `${Math.round(value/1000)} l`;
      return `${value} ${unit}`;
    },
    length: (value: number, unit: string) => {
      if (unit === 'mm' && value >= 1000) return `${Math.round(value/1000)} m`;
      if (unit === 'mm' && value >= 10) return `${Math.round(value/10)} cm`;
      return `${value} ${unit}`;
    }
  };
  
  return {
    category,
    availableUnits: UNIT_CATEGORIES[category],
    baseUnit: baseUnits[category],
    displayFormat: displayFormats[category]
  };
}

// ============================================================================
// 📦 HELPERS PARA PACKAGING
// ============================================================================

export function calculatePackageInfo(
  totalUnits: number,
  packageSize: number
): { packages: number; remainder: number; displayText: string } {
  const packages = Math.floor(totalUnits / packageSize);
  const remainder = totalUnits % packageSize;
  
  let displayText = '';
  if (packages > 0) {
    displayText += `${packages} paquete${packages > 1 ? 's' : ''}`;
  }
  if (remainder > 0) {
    if (packages > 0) displayText += ' + ';
    displayText += `${remainder} unidad${remainder > 1 ? 'es' : ''}`;
  }
  
  return { packages, remainder, displayText };
}

export function formatPackagedQuantity(
  quantity: number,
  packageSize: number,
  packageUnit: string
): string {
  const { packages, remainder } = calculatePackageInfo(quantity, packageSize);
  
  if (packages === 0) {
    return `${remainder} unidad${remainder !== 1 ? 'es' : ''}`;
  }
  
  if (remainder === 0) {
    return `${packages} ${packageUnit}${packages !== 1 ? 's' : ''}`;
  }
  
  return `${packages} ${packageUnit}${packages !== 1 ? 's' : ''} + ${remainder} unidad${remainder !== 1 ? 'es' : ''}`;
}

// ============================================================================
// 🧪 VALIDACIONES
// ============================================================================

export function validateConversion(
  value: number,
  fromUnit: MeasurableUnit,
  toUnit: MeasurableUnit
): { isValid: boolean; error?: string } {
  if (value <= 0) {
    return { isValid: false, error: 'La cantidad debe ser mayor a 0' };
  }
  
  const fromCategory = getUnitCategory(fromUnit);
  const toCategory = getUnitCategory(toUnit);
  
  if (!fromCategory || !toCategory) {
    return { isValid: false, error: 'Unidad no reconocida' };
  }
  
  if (fromCategory !== toCategory) {
    return { 
      isValid: false, 
      error: `No se puede convertir de ${fromCategory} a ${toCategory}` 
    };
  }
  
  return { isValid: true };
}

export function validatePackaging(
  packageSize: number,
  totalQuantity: number
): { isValid: boolean; error?: string } {
  if (packageSize <= 0) {
    return { isValid: false, error: 'El tamaño del paquete debe ser mayor a 0' };
  }
  
  if (totalQuantity < 0) {
    return { isValid: false, error: 'La cantidad total no puede ser negativa' };
  }
  
  return { isValid: true };
}

// ============================================================================
// 🎯 QUICK HELPERS PARA UI
// ============================================================================

export function getSmartDisplayUnit(value: number, unit: MeasurableUnit): MeasurableUnit {
  const category = getUnitCategory(unit);
  if (!category) return unit;
  
  // Auto-seleccionar la unidad más apropiada para el display
  if (category === 'weight') {
    if (value >= 1000000) return 'ton';
    if (value >= 1000) return 'kg';
    return 'g';
  }
  
  if (category === 'volume') {
    if (value >= 1000) return 'l';
    return 'ml';
  }
  
  if (category === 'length') {
    if (value >= 1000) return 'm';
    if (value >= 10) return 'cm';
    return 'mm';
  }
  
  return unit;
}

export function suggestBestUnit(value: number, currentUnit: MeasurableUnit): {
  suggested: MeasurableUnit;
  reason: string;
} {
  const smartUnit = getSmartDisplayUnit(value, currentUnit);
  
  if (smartUnit === currentUnit) {
    return { suggested: currentUnit, reason: 'Unidad actual es óptima' };
  }
  
  const conversion = convertUnit(value, currentUnit, smartUnit);
  if (!conversion) {
    return { suggested: currentUnit, reason: 'No se puede convertir' };
  }
  
  return {
    suggested: smartUnit,
    reason: `Mejor como ${conversion.convertedValue} ${smartUnit}`
  };
}