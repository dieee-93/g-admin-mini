// Shared UI Components Index - Sistema de Diseño G-Admin Mini v2.0

// Providers & Context
export { Provider } from './provider';

// 🎨 Theme Hooks (REMOVED - dynamic system with recipes handles everything automatically)

// Layout Components
export { Layout } from './Layout';
export { 
  Stack, 
  VStack, 
  HStack, 
  Cluster, 
  Center 
} from './Stack';
export { 
  Grid, 
  SimpleGrid 
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

// Base Components
export { Button } from './Button';
export { CardWrapper } from './CardWrapper';
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
export { Icon, ActionIcon, StatusIcon, NavIcon, HeaderIcon, HeroIcon } from './Icon';
export { Avatar, AvatarGroup, UserAvatar } from './Avatar';
export { Switch, SwitchGroup, StatusSwitch, PermissionSwitch } from './Switch';
export { ProductionCalendar } from './ProductionCalendar';

// 🎯 SIMPLE WRAPPERS - REMOVED (duplicated Layout functionality)

// 📄 PAGE TEMPLATES - REMOVED (use SimpleWrappers + recipes)

// ⚡ QUICK COMPONENTS - Componentes instantáneos
export {
  MetricCard,
  QuickStatus,
  PageTitle,
  ActionBar,
  ListItem,
  EmptyState
} from './QuickComponents';