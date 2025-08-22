// Debug script to test suppliers migration
import { supabase } from '@/lib/supabase/client';

export async function debugSuppliers() {
  try {
    console.log('🔍 Testing suppliers migration...');
    
    // Test 1: Check if suppliers table exists
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('id, name, is_active')
      .limit(1);
    
    if (error) {
      console.error('❌ Suppliers table error:', error.message);
      if (error.message.includes('relation "suppliers" does not exist')) {
        console.log('🚨 PROBLEMA: La tabla suppliers no existe. Necesitas ejecutar la migración.');
      }
      return false;
    }
    
    console.log('✅ Suppliers table exists');
    console.log('📊 Suppliers data:', suppliers);
    
    // Test 2: Try to create a test supplier
    const { data: newSupplier, error: createError } = await supabase
      .from('suppliers')
      .insert([{
        name: 'Test Supplier',
        contact_person: 'Test Contact',
        email: 'test@example.com',
        is_active: true
      }])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating test supplier:', createError.message);
    } else {
      console.log('✅ Test supplier created:', newSupplier);
      
      // Clean up test data
      await supabase.from('suppliers').delete().eq('id', newSupplier.id);
      console.log('✅ Test supplier deleted');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Debug error:', error);
    return false;
  }
}

// Export for use in components
window.debugSuppliers = debugSuppliers;