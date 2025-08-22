// Shared UI Components Index - Sistema de Diseño G-Admin Mini v2.0

// Providers & Context
export { Provider } from './provider';
export { 
  SmartDefaultsProvider,
  useSmartDefaults,
  useContextualProps,
  withSmartDefaults,
  ContextArea,
  DashboardArea,
  FormArea,
  TableArea,
  ModalArea,
  SidebarArea,
  HeaderArea,
  useDashboardDefaults,
  useFormDefaults,
  useTableDefaults,
  useModalDefaults,
  useAutoContext
} from './context/SmartDefaults';

// Layout Components
export { Layout } from './Layout';
export { 
  Stack, 
  VStack, 
  HStack, 
  Cluster, 
  Center 
} from './Stack';

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

// Base Components
export { Button } from './Button';
export { Card } from './Card';

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

// Business Components
export { RecipeCostCard } from './business/RecipeCostCard';
export { 
  InventoryAlertBadge,
  InventoryStatusSummary,
  InventoryHeaderBadge
} from './business/InventoryAlertBadge';
export { 
  SalesMetricChart,
  QuickMetricCard
} from './business/SalesMetricChart';

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
export { ProductionCalendar } from './ProductionCalendar';