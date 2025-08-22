import { supabase } from './lib/supabase';

async function checkRolesSystem() {
  console.log('🔍 Checking roles system...');
  
  try {
    // Check if users_roles table exists
    const { data: tableData, error: tableError } = await supabase
      .from('users_roles')
      .select('count(*)')
      .limit(1);
      
    if (tableError) {
      console.log('❌ users_roles table does not exist:', tableError.message);
      
      // Try to get current user to test auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.log('❌ Auth error:', userError.message);
      } else if (user) {
        console.log('✅ Auth working, user ID:', user.id);
        console.log('📧 User email:', user.email);
        
        // Since we can't create the table directly, let's create a simple migration approach
        console.log('🔧 To create the users_roles table, please run the following SQL in your Supabase dashboard:');
        console.log('');
        console.log('-- Create user role enum');
        console.log("CREATE TYPE user_role AS ENUM ('OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN');");
        console.log('');
        console.log('-- Create users_roles table');
        console.log('CREATE TABLE auth.users_roles (');
        console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
        console.log('  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,');
        console.log('  role user_role NOT NULL DEFAULT \'OPERADOR\',');
        console.log('  assigned_by UUID REFERENCES auth.users(id),');
        console.log('  assigned_at TIMESTAMPTZ DEFAULT NOW(),');
        console.log('  is_active BOOLEAN DEFAULT TRUE,');
        console.log('  created_at TIMESTAMPTZ DEFAULT NOW(),');
        console.log('  updated_at TIMESTAMPTZ DEFAULT NOW(),');
        console.log('  UNIQUE(user_id) WHERE is_active = TRUE');
        console.log(');');
        console.log('');
        console.log('-- Enable RLS');
        console.log('ALTER TABLE auth.users_roles ENABLE ROW LEVEL SECURITY;');
        console.log('');
        console.log('-- Grant permissions');
        console.log('GRANT SELECT ON auth.users_roles TO authenticated;');
        console.log('GRANT INSERT, UPDATE ON auth.users_roles TO service_role;');
        
      } else {
        console.log('❌ No authenticated user');
      }
    } else {
      console.log('✅ users_roles table exists!');
      console.log('📊 Table data check:', tableData);
      
      // Check current user's role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData, error: roleError } = await supabase
          .from('users_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();
          
        if (roleError) {
          console.log('⚠️ No role assigned to current user:', roleError.message);
        } else {
          console.log('✅ Current user role:', roleData.role);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking roles system:', error);
  }
}

// Run the check
checkRolesSystem();