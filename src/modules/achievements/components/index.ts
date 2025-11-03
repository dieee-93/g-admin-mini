/**
 * ACHIEVEMENTS COMPONENTS - Index
 *
 * Central export point for all achievement-related UI components.
 *
 * @version 1.0.0
 */

// Main Widget (for dashboard injection)
export { default as AchievementsWidget } from './AchievementsWidget';

// Progress Cards
export { default as CapabilityProgressCard } from './CapabilityProgressCard';
export { RequirementRow } from './CapabilityProgressCard';

// Modals
export { default as SetupRequiredModal } from './SetupRequiredModal';

// Checklists
export { default as RequirementChecklist } from './RequirementChecklist';
export {
  RequirementItem,
  CheckboxIcon
} from './RequirementChecklist';
