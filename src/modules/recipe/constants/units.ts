/**
 * Standard Units - Unidades de medida estandarizadas
 *
 * Previene inconsistencias en la base de datos y permite conversiones automáticas
 */

export interface UnitOption {
  value: string;
  label: string;
  category: 'mass' | 'volume' | 'discrete' | 'other';
}

/**
 * Unidades estándar del sistema
 */
export const STANDARD_UNITS: UnitOption[] = [
  // ============================================
  // UNIDADES DE MASA
  // ============================================
  { value: 'kg', label: 'Kilogramos (kg)', category: 'mass' },
  { value: 'g', label: 'Gramos (g)', category: 'mass' },
  { value: 'mg', label: 'Miligramos (mg)', category: 'mass' },
  { value: 'lb', label: 'Libras (lb)', category: 'mass' },
  { value: 'oz', label: 'Onzas (oz)', category: 'mass' },

  // ============================================
  // UNIDADES DE VOLUMEN
  // ============================================
  { value: 'l', label: 'Litros (l)', category: 'volume' },
  { value: 'ml', label: 'Mililitros (ml)', category: 'volume' },
  { value: 'gal', label: 'Galones (gal)', category: 'volume' },
  { value: 'qt', label: 'Cuartos (qt)', category: 'volume' },
  { value: 'pt', label: 'Pintas (pt)', category: 'volume' },
  { value: 'cup', label: 'Tazas (cup)', category: 'volume' },
  { value: 'tbsp', label: 'Cucharadas (tbsp)', category: 'volume' },
  { value: 'tsp', label: 'Cucharaditas (tsp)', category: 'volume' },

  // ============================================
  // UNIDADES DISCRETAS
  // ============================================
  { value: 'unit', label: 'Unidad', category: 'discrete' },
  { value: 'piece', label: 'Pieza', category: 'discrete' },
  { value: 'portion', label: 'Porción', category: 'discrete' },
  { value: 'serving', label: 'Ración', category: 'discrete' },
  { value: 'slice', label: 'Rebanada', category: 'discrete' },
  { value: 'dozen', label: 'Docena', category: 'discrete' },
  { value: 'pack', label: 'Paquete', category: 'discrete' },
  { value: 'box', label: 'Caja', category: 'discrete' },
  { value: 'bag', label: 'Bolsa', category: 'discrete' },
  { value: 'bottle', label: 'Botella', category: 'discrete' },
  { value: 'can', label: 'Lata', category: 'discrete' },

  // ============================================
  // OTRAS UNIDADES
  // ============================================
  { value: 'batch', label: 'Lote', category: 'other' },
  { value: 'recipe', label: 'Receta', category: 'other' },
];

/**
 * Obtener opciones formateadas para SelectField de Chakra UI
 */
export function getUnitOptions() {
  return STANDARD_UNITS.map(unit => ({
    value: unit.value,
    label: unit.label,
  }));
}

/**
 * Obtener opciones agrupadas por categoría
 */
export function getGroupedUnitOptions() {
  const groups = {
    mass: { label: 'Masa/Peso', items: [] as UnitOption[] },
    volume: { label: 'Volumen', items: [] as UnitOption[] },
    discrete: { label: 'Unidades Discretas', items: [] as UnitOption[] },
    other: { label: 'Otras', items: [] as UnitOption[] },
  };

  STANDARD_UNITS.forEach(unit => {
    groups[unit.category].items.push(unit);
  });

  return Object.entries(groups).map(([key, group]) => ({
    label: group.label,
    items: group.items.map(u => ({ value: u.value, label: u.label })),
  }));
}

/**
 * Validar si una unidad es válida
 */
export function isValidUnit(unit: string): boolean {
  return STANDARD_UNITS.some(u => u.value === unit);
}

/**
 * Obtener label de una unidad
 */
export function getUnitLabel(unit: string): string {
  const found = STANDARD_UNITS.find(u => u.value === unit);
  return found ? found.label : unit;
}

/**
 * Unidad por defecto
 */
export const DEFAULT_UNIT = 'unit';
