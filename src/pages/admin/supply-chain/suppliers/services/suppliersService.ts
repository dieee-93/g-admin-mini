// ============================================
// SUPPLIERS SERVICE - Business logic layer
// ============================================

import { suppliersApi } from './suppliersApi';
import type {
  Supplier,
  SupplierFormData,
  SupplierMetrics,
  SupplierFilters,
  SupplierSort
} from '../types/supplierTypes';
import { logger } from '@/lib/logging';
import EventBus from '@/lib/events';

/**
 * Suppliers Service
 *
 * Wrapper around suppliersApi with additional business logic
 * Handles events, analytics, and data transformation
 */
export const suppliersService = {

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Get all suppliers
   */
  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      logger.debug('Suppliers', 'Fetching all suppliers');
      const suppliers = await suppliersApi.getSuppliers();

      logger.info('Suppliers', `Loaded ${suppliers.length} suppliers`);
      return suppliers;
    } catch (error) {
      logger.error('Suppliers', 'Error fetching suppliers', error);
      throw error;
    }
  },

  /**
   * Get only active suppliers
   */
  async getActiveSuppliers(): Promise<Supplier[]> {
    try {
      logger.debug('Suppliers', 'Fetching active suppliers');
      const suppliers = await suppliersApi.getActiveSuppliers();

      logger.info('Suppliers', `Loaded ${suppliers.length} active suppliers`);
      return suppliers;
    } catch (error) {
      logger.error('Suppliers', 'Error fetching active suppliers', error);
      throw error;
    }
  },

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: string): Promise<Supplier> {
    try {
      logger.debug('Suppliers', `Fetching supplier: ${id}`);
      const supplier = await suppliersApi.getSupplier(id);

      return supplier;
    } catch (error) {
      logger.error('Suppliers', `Error fetching supplier ${id}`, error);
      throw error;
    }
  },

  /**
   * Create new supplier
   */
  async createSupplier(data: SupplierFormData): Promise<Supplier> {
    try {
      logger.info('Suppliers', 'Creating new supplier', { name: data.name });

      const supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'> = {
        name: data.name,
        contact_person: data.contact_person || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        tax_id: data.tax_id || null,
        payment_terms: data.payment_terms || '30 días',
        rating: data.rating || null,
        notes: data.notes || null,
        is_active: data.is_active !== undefined ? data.is_active : true
      };

      const newSupplier = await suppliersApi.createSupplier(supplierData);

      // Emit event
      EventBus.emit('suppliers.supplier_created', {
        supplierId: newSupplier.id,
        supplierName: newSupplier.name,
        timestamp: new Date().toISOString()
      });

      logger.info('Suppliers', `Supplier created: ${newSupplier.name}`, { id: newSupplier.id });

      return newSupplier;
    } catch (error) {
      logger.error('Suppliers', 'Error creating supplier', error);
      throw error;
    }
  },

  /**
   * Update existing supplier
   */
  async updateSupplier(id: string, data: Partial<SupplierFormData>): Promise<Supplier> {
    try {
      logger.info('Suppliers', `Updating supplier: ${id}`, data);

      const updates: Partial<Supplier> = {
        ...(data.name && { name: data.name }),
        ...(data.contact_person !== undefined && { contact_person: data.contact_person || null }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.tax_id !== undefined && { tax_id: data.tax_id || null }),
        ...(data.payment_terms !== undefined && { payment_terms: data.payment_terms || null }),
        ...(data.rating !== undefined && { rating: data.rating || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.is_active !== undefined && { is_active: data.is_active })
      };

      const updatedSupplier = await suppliersApi.updateSupplier(id, updates);

      // Emit event
      EventBus.emit('suppliers.supplier_updated', {
        supplierId: updatedSupplier.id,
        supplierName: updatedSupplier.name,
        changes: Object.keys(updates),
        timestamp: new Date().toISOString()
      });

      logger.info('Suppliers', `Supplier updated: ${updatedSupplier.name}`);

      return updatedSupplier;
    } catch (error) {
      logger.error('Suppliers', `Error updating supplier ${id}`, error);
      throw error;
    }
  },

  /**
   * Toggle supplier active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<Supplier> {
    try {
      logger.info('Suppliers', `${isActive ? 'Activating' : 'Deactivating'} supplier: ${id}`);

      const updatedSupplier = await suppliersApi.updateSupplier(id, { is_active: isActive });

      // Emit event
      EventBus.emit('suppliers.supplier_status_changed', {
        supplierId: updatedSupplier.id,
        supplierName: updatedSupplier.name,
        isActive,
        timestamp: new Date().toISOString()
      });

      logger.info('Suppliers', `Supplier ${isActive ? 'activated' : 'deactivated'}`);

      return updatedSupplier;
    } catch (error) {
      logger.error('Suppliers', `Error toggling supplier active status: ${id}`, error);
      throw error;
    }
  },

  /**
   * Delete supplier
   * Validates that supplier has no associated materials before deletion
   */
  async deleteSupplier(id: string): Promise<void> {
    try {
      logger.info('Suppliers', `Attempting to delete supplier: ${id}`);

      // Get supplier info before deletion
      const supplier = await suppliersApi.getSupplier(id);

      // Check if supplier has associated materials
      const hasMaterials = await suppliersApi.hasAssociatedMaterials(id);

      if (hasMaterials) {
        const error = new Error(
          `No se puede eliminar el proveedor "${supplier.name}" porque tiene materiales asociados. Primero desvincule los materiales o elimínelos.`
        );
        logger.warn('Suppliers', 'Cannot delete supplier with associated materials', {
          supplierId: id,
          supplierName: supplier.name
        });
        throw error;
      }

      // Proceed with deletion
      await suppliersApi.deleteSupplier(id);

      // Emit event
      EventBus.emit('suppliers.supplier_deleted', {
        supplierId: id,
        supplierName: supplier.name,
        timestamp: new Date().toISOString()
      });

      logger.info('Suppliers', `Supplier deleted successfully: ${supplier.name}`);
    } catch (error) {
      logger.error('Suppliers', `Error deleting supplier ${id}`, error);
      throw error;
    }
  },

  // ============================================
  // ANALYTICS & METRICS
  // ============================================

  /**
   * Calculate supplier metrics for dashboard
   */
  calculateMetrics(suppliers: Supplier[]): SupplierMetrics {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.is_active).length;
    const inactiveSuppliers = totalSuppliers - activeSuppliers;

    const suppliersWithRating = suppliers.filter(s => s.rating !== null && s.rating > 0);
    const averageRating = suppliersWithRating.length > 0
      ? suppliersWithRating.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliersWithRating.length
      : 0;

    const suppliersWithoutRating = suppliers.filter(s => !s.rating || s.rating === 0).length;
    const suppliersWithoutContact = suppliers.filter(s =>
      !s.email && !s.phone
    ).length;

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      averageRating,
      suppliersWithoutRating,
      suppliersWithoutContact
    };
  },

  // ============================================
  // FILTERING & SORTING
  // ============================================

  /**
   * Filter suppliers based on criteria
   */
  filterSuppliers(suppliers: Supplier[], filters: SupplierFilters): Supplier[] {
    let filtered = [...suppliers];

    // Search text filter
    if (filters.searchText && filters.searchText.trim() !== '') {
      const searchLower = filters.searchText.toLowerCase().trim();
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.contact_person?.toLowerCase().includes(searchLower) ||
        supplier.email?.toLowerCase().includes(searchLower) ||
        supplier.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Active status filter
    if (filters.isActive !== null) {
      filtered = filtered.filter(supplier => supplier.is_active === filters.isActive);
    }

    // Minimum rating filter
    if (filters.minRating !== null) {
      filtered = filtered.filter(supplier =>
        supplier.rating && supplier.rating >= filters.minRating!
      );
    }

    // Has contact filter
    if (filters.hasContact !== null) {
      if (filters.hasContact) {
        filtered = filtered.filter(supplier => supplier.email || supplier.phone);
      } else {
        filtered = filtered.filter(supplier => !supplier.email && !supplier.phone);
      }
    }

    return filtered;
  },

  /**
   * Sort suppliers
   */
  sortSuppliers(suppliers: Supplier[], sort: SupplierSort): Supplier[] {
    const sorted = [...suppliers];

    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sort.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          bValue = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  },

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Check if supplier name already exists
   */
  async checkNameExists(name: string, excludeId?: string): Promise<boolean> {
    try {
      const suppliers = await this.getAllSuppliers();
      const nameLower = name.toLowerCase().trim();

      return suppliers.some(s =>
        s.name.toLowerCase().trim() === nameLower && s.id !== excludeId
      );
    } catch (error) {
      logger.error('Suppliers', 'Error checking name existence', error);
      return false;
    }
  }
};
