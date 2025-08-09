// Staff Management Module - Main exports
// Security compliant staff management system

export * from './types';
export { default as StaffPageRefactored } from './StaffPageRefactored';

// Section components
export { DirectorySection } from './components/sections/DirectorySection';
export { PerformanceSection } from './components/sections/PerformanceSection';
export { TrainingSection } from './components/sections/TrainingSection';
export { ManagementSection } from './components/sections/ManagementSection';

// Re-export main page as default for routing
export { default as StaffPage } from './StaffPageRefactored';
export { default } from './StaffPageRefactored';