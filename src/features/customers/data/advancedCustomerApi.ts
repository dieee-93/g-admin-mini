// src/features/customers/data/advancedCustomerApi.ts
import { supabase } from '@/lib/supabase';
import type { 
  CustomerRFMProfile, 
  CustomerAnalytics, 
  CustomerProfile,
  CustomerTag,
  CustomerNote,
  CustomerPreferences,
  SpecialOccasion
} from '../types';

// ===== RFM ANALYTICS API =====

export async function calculateCustomerRFM(): Promise<CustomerRFMProfile[]> {
  const { data, error } = await supabase.rpc('calculate_customer_rfm_profiles');
  
  if (error) {
    console.error('Error calculating RFM:', error);
    throw new Error('Failed to calculate customer RFM profiles');
  }
  
  return data || [];
}

export async function getCustomerAnalyticsDashboard(): Promise<CustomerAnalytics> {
  const { data, error } = await supabase.rpc('get_customer_analytics_dashboard');
  
  if (error) {
    console.error('Error getting analytics dashboard:', error);
    throw new Error('Failed to get customer analytics dashboard');
  }
  
  return data;
}

export async function getCustomerProfileWithRFM(customerId: string): Promise<CustomerProfile> {
  const { data, error } = await supabase.rpc('get_customer_profile_with_rfm', { 
    customer_id: customerId 
  });
  
  if (error) {
    console.error('Error getting customer profile with RFM:', error);
    throw new Error('Failed to get customer profile with RFM data');
  }
  
  return data;
}

// ===== CUSTOMER TAGS API =====

export async function getCustomerTags(): Promise<CustomerTag[]> {
  const { data, error } = await supabase
    .from('customer_tags')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching customer tags:', error);
    throw new Error('Failed to fetch customer tags');
  }
  
  return data || [];
}

// ===== CUSTOMER NOTES API =====

export async function getCustomerNotes(customerId: string): Promise<CustomerNote[]> {
  const { data, error } = await supabase
    .from('customer_notes')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching customer notes:', error);
    throw new Error('Failed to fetch customer notes');
  }
  
  return data || [];
}

export async function createCustomerNote(noteData: Omit<CustomerNote, 'id' | 'created_at'>): Promise<CustomerNote> {
  const { data, error } = await supabase
    .from('customer_notes')
    .insert([noteData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating customer note:', error);
    throw new Error('Failed to create customer note');
  }
  
  return data;
}

export async function updateCustomerNote(id: string, noteData: Partial<CustomerNote>): Promise<CustomerNote> {
  const { data, error } = await supabase
    .from('customer_notes')
    .update(noteData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating customer note:', error);
    throw new Error('Failed to update customer note');
  }
  
  return data;
}

export async function deleteCustomerNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('customer_notes')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting customer note:', error);
    throw new Error('Failed to delete customer note');
  }
}

// ===== CUSTOMER PREFERENCES API =====

export async function getCustomerPreferences(customerId: string): Promise<CustomerPreferences | null> {
  const { data, error } = await supabase
    .from('customer_preferences')
    .select('*')
    .eq('customer_id', customerId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching customer preferences:', error);
    throw new Error('Failed to fetch customer preferences');
  }
  
  return data;
}