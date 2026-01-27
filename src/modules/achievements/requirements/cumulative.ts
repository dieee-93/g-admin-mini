/**
 * CUMULATIVE ACHIEVEMENTS
 * 
 * Logros acumulativos para gamificación.
 * 
 * ⚠️ FUTURO: Estos achievements NO bloquean operaciones.
 * Son para recompensar y motivar progreso.
 * 
 * TODO: Ver GAMIFICATION_ROADMAP.md para plan de implementación
 * 
 * @version 1.0.0 (preparatorio)
 */

import type { Achievement } from '../types';

export const CUMULATIVE_ACHIEVEMENTS: Achievement[] = [
  // ========== EMPLEADOS ==========
  {
    id: 'cumulative_register_1_employee',
    tier: 'cumulative',
    capability: 'onsite_service',
    name: 'Registrar primer empleado',
    description: 'Has agregado tu primer miembro del equipo',
    icon: '👤',
    category: 'mastery',
    validator: (ctx) => (ctx.staff?.length || 0) >= 1,
    points: 10,
  },
  {
    id: 'cumulative_register_5_employees',
    tier: 'cumulative',
    capability: 'onsite_service',
    name: 'Equipo de 5',
    description: 'Has registrado 5 empleados',
    icon: '👥',
    category: 'mastery',
    validator: (ctx) => (ctx.staff?.length || 0) >= 5,
    points: 50,
  },

  // ========== VENTAS ==========
  {
    id: 'cumulative_first_sale',
    tier: 'cumulative',
    capability: 'onsite_service',
    name: 'Primera venta',
    description: 'Has registrado tu primera venta',
    icon: '🎉',
    category: 'operations',
    validator: (ctx) => (ctx.salesCount || 0) >= 1,
    points: 25,
  },
  {
    id: 'cumulative_100_sales',
    tier: 'cumulative',
    capability: 'onsite_service',
    name: '100 ventas',
    description: 'Has alcanzado 100 ventas',
    icon: '💯',
    category: 'operations',
    validator: (ctx) => (ctx.salesCount || 0) >= 100,
    points: 200,
  },
  {
    id: 'cumulative_1000_sales',
    tier: 'cumulative',
    capability: 'onsite_service',
    name: '1,000 ventas',
    description: '¡Negocio consolidado!',
    icon: '🚀',
    category: 'operations',
    validator: (ctx) => (ctx.salesCount || 0) >= 1000,
    points: 1000,
  },

  // ========== PRODUCTOS ==========
  {
    id: 'cumulative_catalog_10',
    tier: 'cumulative',
    capability: 'async_operations',
    name: 'Catálogo de 10',
    description: 'Has creado 10 productos',
    icon: '📦',
    category: 'mastery',
    validator: (ctx) => (ctx.products?.length || 0) >= 10,
    points: 30,
  },
  {
    id: 'cumulative_catalog_50',
    tier: 'cumulative',
    capability: 'async_operations',
    name: 'Catálogo amplio',
    description: 'Has creado 50 productos',
    icon: '📚',
    category: 'mastery',
    validator: (ctx) => (ctx.products?.length || 0) >= 50,
    points: 150,
  },
];
