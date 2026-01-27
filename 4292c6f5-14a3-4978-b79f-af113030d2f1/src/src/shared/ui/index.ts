/**
 * Shared UI Components - Central Export
 *
 * REGLA CRÍTICA: SIEMPRE importar componentes desde aquí
 * ✅ CORRECTO: import { Box, Button, InputField, Modal, Table } from '@/shared/ui'
 * ❌ INCORRECTO: import { Box } from '@chakra-ui/react'
 */

// ============================================
// LAYER 1: PRIMITIVES (Chakra Wrappers)
// ============================================

// Layout Primitives
export {
  Box,
  Flex,
  Stack,
  VStack,
  HStack,
  Grid,
  SimpleGrid,
  Container,
  Center,
  Circle } from
'@chakra-ui/react';

// Typography
export { Heading, Text } from '@chakra-ui/react';

// Form Components (Base Chakra)
export {
  Input,
  Button,
  IconButton,
  Checkbox,
  Switch,
  Select,
  Textarea } from
'@chakra-ui/react';

// Feedback
export { Spinner, Skeleton, SkeletonText } from '@chakra-ui/react';

// Toast
export { useToast } from '@chakra-ui/react';

// ============================================
// LAYER 2: LAYOUT COMPONENTS (Custom)
// ============================================

export { ContentLayout } from './ContentLayout';
export { PageHeader } from './PageHeader';
export { Section } from './Section';
export { CardWrapper } from './CardWrapper';

// ============================================
// LAYER 2: FORM COMPONENTS (Custom)
// ============================================

export { InputField } from './InputField';
export type { InputFieldProps } from './InputField';

export { SelectField } from './SelectField';
export type { SelectFieldProps, SelectOption } from './SelectField';

export { TextareaField } from './TextareaField';
export type { TextareaFieldProps } from './TextareaField';

export { FormSection } from './FormSection';

// ============================================
// LAYER 2: DATA DISPLAY (Custom)
// ============================================

export { MetricCard } from './MetricCard';
export { Badge, StatusBadge } from './Badge';

export { Table } from './Table';
export type { TableColumn, TableProps } from './Table';

export { Tabs } from './Tabs';
export type { TabItem, TabsProps } from './Tabs';

export { Accordion } from './Accordion';
export type { AccordionItemData, AccordionProps } from './Accordion';

export { Pagination } from './Pagination';
export type { PaginationProps } from './Pagination';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

// ============================================
// LAYER 2: OVERLAY COMPONENTS (Custom)
// ============================================

export { Modal } from './Modal';

// ============================================
// LAYER 2: FEEDBACK COMPONENTS (Custom)
// ============================================

export { Alert } from './Alert';
export type { AlertProps } from './Alert';

export {
  LoadingSpinner,
  LoadingOverlay,
  SkeletonCard,
  SkeletonTable } from
'./LoadingState';

// ============================================
// LAYER 3: SEMANTIC COMPONENTS (Custom)
// ============================================

export { Main } from './semantic/Main';

// ============================================
// CUSTOM HOOKS
// ============================================

export { useFormValidation } from '../hooks/useFormValidation';
export type {
  ValidationRule,
  ValidationRules,
  UseFormValidationOptions } from
'../hooks/useFormValidation';

export { useDisclosure } from '../hooks/useDisclosure';
export type { UseDisclosureReturn } from '../hooks/useDisclosure';