// ============================================
// SUPPLIER TYPES - Core type definitions
// ============================================

import { z } from 'zod';

// ============================================
// DATABASE TYPES
// ============================================

/**
 * Supplier entity from Supabase
 */
export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  payment_terms: string | null;
  rating: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * Supplier form data (for create/update)
 */
export interface SupplierFormData {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  payment_terms?: string;
  rating?: number;
  notes?: string;
  is_active?: boolean;
}

/**
 * New supplier data (for inline creation)
 */
export interface NewSupplierData {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  notes?: string;
}

// ============================================
// ZOD SCHEMAS
// ============================================

/**
 * Supplier validation schema
 */
export const SupplierSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200, 'Máximo 200 caracteres'),
  contact_person: z.string().max(150, 'Máximo 150 caracteres').optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
  address: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  tax_id: z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
  payment_terms: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  rating: z.number().min(1).max(5).optional().nullable(),
  notes: z.string().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
  is_active: z.boolean().optional()
});

/**
 * New supplier inline creation schema (simplified)
 */
export const NewSupplierSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  contact_person: z.string().max(150).optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  tax_id: z.string().max(50).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal(''))
});

// ============================================
// ANALYTICS & METRICS TYPES
// ============================================

/**
 * Supplier metrics for dashboard
 */
export interface SupplierMetrics {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  averageRating: number;
  suppliersWithoutRating: number;
  suppliersWithoutContact: number;
  // Future: total purchase value, etc.
}

/**
 * Supplier performance data (from supplierAnalysisEngine)
 */
export interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  overallRating: number;
  ratingCategory: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  totalAnnualValue: number;
  itemCount: number;
  metrics: {
    qualityScore: number;
    onTimeDeliveryRate: number;
    priceCompetitiveness: number;
    responsiveness: number;
  };
}

// ============================================
// UI STATE TYPES
// ============================================

/**
 * Supplier tab options
 */
export type SupplierTab = 'list' | 'analytics' | 'performance';

/**
 * Supplier table filters
 */
export interface SupplierFilters {
  searchText: string;
  isActive: boolean | null; // null = show all
  minRating: number | null;
  hasContact: boolean | null;
}

/**
 * Supplier sort options
 */
export type SupplierSortField = 'name' | 'rating' | 'created_at' | 'updated_at';
export type SupplierSortDirection = 'asc' | 'desc';

export interface SupplierSort {
  field: SupplierSortField;
  direction: SupplierSortDirection;
}

// ============================================
// SERVICE TYPES
// ============================================

/**
 * Supplier analysis result (from SupplierAnalysisEngine)
 */
export interface SupplierAnalysisResultForService {
  supplierAnalyses: Array<{
    id: string;
    name: string;
    overallRating: number;
    ratingCategory: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }>;
  portfolioMetrics?: {
    averageRating: number;
    totalAnnualSpend: number;
  };
}

/**
 * Procurement recommendation type
 */
export interface ProcurementRecommendation {
  id: string;
  materialId: string;
  supplierId: string;
  recommendationType: string;
  priority: number;
  estimatedSavings?: number;
}

// ============================================
// EXPORT VALIDATIONS
// ============================================

export type ValidatedSupplierForm = z.infer<typeof SupplierSchema>;
export type ValidatedNewSupplier = z.infer<typeof NewSupplierSchema>;
