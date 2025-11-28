/**
 * Shared Widgets - Componentes reutilizables de dashboard
 *
 * FUENTE: newdashboard/src/components/widgets/
 * ADAPTADOS: Design system G-Admin Mini
 *
 * Widgets genéricos para dashboards y vistas analíticas.
 * Diseñados para ser inyectados vía hook registry.
 *
 * CONVENCIÓN DE USO:
 * 1. Importar widget: import { StatCard } from '@/shared/widgets'
 * 2. Usar directamente: <StatCard {...props} />
 * 3. O inyectar vía hooks en manifest.tsx:
 *
 * @example
 * // En modules/mymodule/manifest.tsx
 * export const myModuleManifest = {
 *   id: 'mymodule',
 *   hooks: {
 *     'dashboard.widgets': () => [
 *       {
 *         id: 'my-stat-widget',
 *         component: () => (
 *           <StatCard
 *             title="Total Items"
 *             value="1,234"
 *             trend={{ value: '+12%', isPositive: true }}
 *           />
 *         ),
 *         priority: 10
 *       }
 *     ]
 *   }
 * }
 */

// Widgets básicos
export { StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';

export { InsightCard } from './InsightCard';
export type { InsightCardProps } from './InsightCard';

export { AlertCard } from './AlertCard';
export type { AlertCardProps } from './AlertCard';
