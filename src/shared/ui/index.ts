// Shared UI Components Index - Sistema de Diseño G-Admin Mini v2.0

// Providers & Context
export { Provider } from './provider';

// 🎨 Theme Hooks (REMOVED - dynamic system with recipes handles everything automatically)

// Layout Components
export { Layout } from './Layout';
export { ContentLayout } from './ContentLayout';
export { Section } from './Section';
export { FormSection } from './FormSection';
export { StatsSection } from './StatsSection';
export { PageHeader } from './PageHeader';

// Base Layout Primitives (Chakra wrappers)
export { Box } from './Box';
export { Container } from './Container';
export { Card, CardHeader, CardBody, CardFooter } from './Card';
export { 
  Stack, 
  VStack, 
  HStack, 
  Cluster, 
  Center 
} from './Stack';
export { 
  Grid, 
  SimpleGrid,
  SimpleGrid as CardGrid  // Semantic alias for common dashboard layouts
} from './Grid';

// Grid Presets - REMOVED (use Chakra Grid directly)

// Typography Components
export { 
  Typography, 
  Heading, 
  Title, 
  Body, 
  Caption, 
  Label, 
  Code 
} from './Typography';

// Form Components
export { InputField } from './InputField';
export { NumberField } from './NumberField';
export { SelectField, createListCollection } from './SelectField';
export { TextareaField, Textarea } from './TextareaField';

// Base Components
export { Button } from './Button';
export { ActionButton } from './ActionButton';
export { CardWrapper } from './CardWrapper';
export { MetricCard } from './MetricCard';

// ✅ BUSINESS COMPONENTS - Scheduling & Staff Management
export {
  WeeklyCalendar,
  TimeSlotPicker,
  EmployeeAvailabilityCard
} from './components/business';

export type {
  CalendarShift,
  DayData,
  WeeklyCalendarProps,
  TimeSlot,
  TimeSlotPickerProps,
  EmployeeAvailability,
  EmployeeAvailabilityCardProps
} from './components/business';
export { FeatureCard } from './FeatureCard';
export { Table } from './Table';

// Advanced Components
export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalClose
} from './Modal';

export {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  AlertAction
} from './Alert';

export {
  Badge,
  StatusBadge,
  StockBadge,
  PriorityBadge,
  InventoryBadge,
  RoleBadge
} from './Badge';

export {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  ModuleTabs,
  SettingsTabs,
  DataTabs
} from './Tabs';

// Collapsible components are imported directly from @chakra-ui/react when needed

// Business Components - REMOVED (move to specific modules if needed)

// Feedback Components
export { CircularProgress } from './CircularProgress';
export { 
  ConnectionBadge, 
  POSConnectionBadge, 
  InventoryConnectionBadge, 
  StaffConnectionBadge 
} from './ConnectionBadge';
export { toaster, Toaster } from './toaster';

// Display Components
export { Icon } from './Icon';
export { Avatar, AvatarGroup, UserAvatar } from './Avatar';
export { Switch, SwitchGroup, StatusSwitch, PermissionSwitch } from './Switch';
export { ProductionCalendar } from './ProductionCalendar';

// 🎯 SIMPLE WRAPPERS - REMOVED (duplicated Layout functionality)

// 📄 PAGE TEMPLATES - REMOVED (use SimpleWrappers + recipes)

// ⚡ QUICK COMPONENTS - Componentes instantáneos
export {
  QuickStatus,
  PageTitle,
  ActionBar,
  ListItem,
  EmptyState
} from './QuickComponents';