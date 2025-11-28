// Shared UI Components Index - Sistema de Diseño G-Admin Mini v3.0
// SEMANTIC ARCHITECTURE (3 Layers)
//
// Layer 3: Semantic Components - Pure semantic HTML + ARIA (NEW!)
// Layer 2: Layout Components - Styling + composition
// Layer 1: Primitives - Low-level Chakra wrappers

// Providers & Context
export { Provider } from './provider';

// 🎨 Theme Hooks (REMOVED - dynamic system with recipes handles everything automatically)

// ===== LAYER 3: SEMANTIC COMPONENTS (NEW!) =====
// Pure semantics, zero styling, WCAG AAA compliant
export { Main, SemanticSection, SkipLink } from './semantic';
export type { MainProps, SemanticSectionProps, SkipLinkProps } from './semantic';

// ===== LAYER 2.5: HELPERS (NEW!) =====
// Composition helpers for common patterns (Dialog, Form)
// Simplifies ChakraUI v3 while maintaining accessibility
export { Form } from './helpers';
// Dialog helpers renamed to avoid conflict with Dialog namespace
export { Dialog as DialogHelpers } from './helpers';

// ===== LAYER 2: LAYOUT COMPONENTS =====
// Combines Layer 3 semantics with visual styling
export { Layout } from './Layout';
export { ContentLayout } from './ContentLayout';
export { Section } from './Section';
export { FormSection } from './FormSection';
export { StatsSection } from './StatsSection';
export { StatRoot, StatLabel, StatValueText, StatHelpText, StatUpIndicator, StatDownIndicator, StatValueUnit, Stat } from './Stat';
export { PageHeader } from './PageHeader';

// Base Layout Primitives (Chakra wrappers)
export { Box } from './Box';
export { Flex } from './Flex';
export { Circle } from './Circle';
export { Container } from './Container';
// Card - Basic Chakra UI re-exports (for backwards compatibility)
export { Card, CardHeader, CardBody, CardFooter } from './Card';

// CardWrapper - Our enhanced wrapper with compound pattern
// Use CardWrapper.Body, CardWrapper.Title, etc.
export { CardWrapper } from './CardWrapper';
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

// ===== PERFORMANCE COMPONENTS =====
// Virtual scrolling for large lists (50+ items)
export { VirtualList, VirtualGrid } from './VirtualList';
export type { VirtualListProps, VirtualGridProps } from './VirtualList';

// Grid Presets - REMOVED (use Chakra Grid directly)

// Typography Components
export {
  Typography,
  Title,
  Body,
  Caption,
  Label,
  Code
} from './Typography';
export { Text } from './Text';
export { Kbd } from './Kbd';

// Basic Components (Chakra Wrappers)
export { Heading } from './Heading';
export { Spinner } from './Spinner';
export { Skeleton, SkeletonText } from './Skeleton';
export { Image } from './Image';
export type { ImageProps } from './Image';

// Multi-Location Components
export { LocationSelector, LocationSelectorCompact, LocationBadge } from './LocationSelector';
export { Separator } from './Separator';

// Form Components
// ⚠️ IMPORTANT: Do NOT export Field namespace directly!
// Field.Root, Field.Label, etc. should only be used in advanced cases
// where you need full manual control. For normal use cases, use the wrappers below.
//
// If you need Field.Root for custom form controls, import it directly:
// import { Field } from '@chakra-ui/react'
//
// ✅ ALWAYS USE THESE WRAPPERS FOR FORMS:
export { Input, InputField } from './Input';
export { NumberField } from './NumberField';
export { SelectField, createListCollection } from './SelectField';
export { TextareaField, Textarea } from './TextareaField';
// Re-export NumberInput from wrapper (prevents TDZ errors in vendor-ui bundle)
export { NumberInput, NumberInputRoot, NumberInputControl, NumberInputIncrementTrigger, NumberInputDecrementTrigger } from './NumberInput';
export {
  Checkbox,
  CheckboxRoot,
  CheckboxControl,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxGroup,
  CheckboxHiddenInput,
  PermissionCheckbox,
  FeatureToggle
} from './Checkbox';
export {
  RadioGroup,
  RadioGroupRoot,
  RadioItem,
  RadioItemControl,
  RadioItemText,
  RadioLabel,
  RadioItemHiddenInput,
  Radio,
  OptionsRadioGroup,
  ThemeRadioGroup
} from './RadioGroup';
export {
  SegmentGroup,
  SegmentItem,
  SegmentGroupRoot,
  SegmentGroupItem,
  SegmentGroupItemText,
  SegmentGroupIndicator,
  SegmentGroupItemControl,
  SegmentGroupItemHiddenInput,
  SegmentGroupLabel
} from './SegmentGroup';
export {
  Slider,
  SliderRoot,
  SliderControl,
  SliderTrack,
  SliderRange,
  SliderThumb,
  SliderLabel,
  SliderValueText,
  SliderMarker,
  SliderMarkerGroup,
  SliderMarkerIndicator,
  SliderHiddenInput,
  RangeSlider,
  VolumeSlider,
  PriceSlider
} from './Slider';

// Base Components
export { Button } from './Button';
export { IconButton } from './IconButton';
export { ActionButton } from './ActionButton';
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

// Dialog namespace (preferred) + individual components
export { Dialog } from './Dialog';
export {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogCloseTrigger,
  DialogBackdrop,
  DialogPositioner,
  DialogActionTrigger
} from './Dialog';

export {
  FieldsetRoot,
  FieldsetContent,
  FieldsetLegend,
  FieldsetHelperText,
  FieldsetErrorText,
  Fieldset
} from './Fieldset';

export {
  Accordion,
  AccordionRoot,
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
  AccordionItemIndicator
} from './Accordion';

export {
  Menu,
  MenuRoot,
  MenuTrigger,
  MenuContextTrigger,
  MenuContent,
  MenuPositioner,
  MenuItem,
  MenuItemText,
  MenuItemCommand,
  MenuTriggerItem,
  MenuCheckboxItem,
  MenuRadioItem,
  MenuRadioItemGroup,
  MenuItemGroup,
  MenuItemGroupLabel,
  MenuIndicator,
  MenuItemIndicator,
  MenuSeparator,
  MenuArrow,
  MenuArrowTip
} from './Menu';

export {
  Drawer,
  DrawerRoot,
  DrawerTrigger,
  DrawerActionTrigger,
  DrawerCloseTrigger,
  DrawerBackdrop,
  DrawerPositioner,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription
} from './Drawer';

export {
  Collapsible,
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleIndicator
} from './Collapsible';

export type { CollapsibleRootProps } from './Collapsible';

export {
  Alert,
  AlertRoot,
  AlertIndicator,
  AlertContent,
  AlertTitle,
  AlertDescription
} from './Alert';

export type { AlertRootProps } from './Alert';

export {
  CollapsibleAlertStack,
  InventoryAlertStack,
  SystemAlertStack
} from './CollapsibleAlertStack';

export type {
  AlertItem,
  CollapsibleAlertStackProps
} from './CollapsibleAlertStack';

// Alert Wrappers - Para mejor trazabilidad en React Scan
export {
  AlertContainer,
  AlertStack,
  AlertActions,
  AlertHeader,
  AlertButton,
  AlertBadge,
  AlertListItem,
  AlertMetadata,
  AlertComponents
} from './wrappers/AlertComponents';

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
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsIndicator,
  TabsContentGroup
} from './Tabs';

export type { TabsRootProps } from './Tabs';

// HeaderSwitch - Dashboard Evolutivo
export { HeaderSwitch, DashboardSwitch } from './HeaderSwitch';
export type { SwitchPosition, HeaderSwitchProps } from './HeaderSwitch';

// Collapsible components are imported directly from @chakra-ui/react when needed

// Business Components - REMOVED (move to specific modules if needed)

// Feedback Components
export { Presence } from './Presence';
export { CircularProgress } from './CircularProgress';
export {
  Progress,
  ProgressRoot,
  ProgressTrack,
  ProgressRange,
  ProgressLabel,
  ProgressValueText,
  LoadingProgress,
  UploadProgress,
  TaskProgress
} from './Progress';
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
export { Portal } from './Portal';

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