// API functions para el módulo suppliers
import { supabase } from '@/lib/supabase/client';
import type { Supplier, SupplierFormData } from '../types';

export const suppliersApi = {
  // Get active suppliers
  async getActiveSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get all suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get supplier by ID
  async getSupplier(id: string): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new supplier
  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplier])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update supplier
  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create supplier from form data (helper)
  async createSupplierFromForm(supplierData: SupplierFormData['new_supplier']): Promise<Supplier> {
    if (!supplierData?.name) {
      throw new Error('Supplier name is required');
    }

    const supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'> = {
      name: supplierData.name,
      contact_person: supplierData.contact_person,
      email: supplierData.email,
      phone: supplierData.phone,
      address: supplierData.address,
      tax_id: supplierData.tax_id,
      notes: supplierData.notes,
      payment_terms: '30 días',
      is_active: true
    };

    return await this.createSupplier(supplier);
  },

  // Delete supplier
  async deleteSupplier(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Check if supplier has associated materials
  async hasAssociatedMaterials(supplierId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('supplier_id', supplierId);

    if (error) throw error;
    return (count ?? 0) > 0;
  },

  // Get supplier performance metrics
  async getSupplierPerformance(supplierId: string, days: number = 90) {
    const { data, error } = await supabase
      .rpc('get_supplier_performance', {
        p_supplier_id: supplierId,
        p_days: days
      });

    if (error) throw error;
    return data;
  }
};