import { createClient } from '@supabase/supabase-js';

// Usar las variables de entorno reales
const supabaseUrl = 'https://ocwjrkxjwqmxvhckgtud.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd2pya3hqd3FteHZoY2tndHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTQ2NDQsImV4cCI6MjA2OTM5MDY0NH0.2xKgIkDZ1ghSnD1zt1akW4EnILfJanIB7tNlUySPVfI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealRegistration() {
  console.log('🧪 Testing registration with realistic email...\n');

  try {
    // Test with a more realistic email format
    const testEmail = `test.user.${Date.now()}@gmail.com`;
    console.log(`📧 Testing with email: ${testEmail}`);

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'SecurePassword123!',
      options: {
        data: {
          full_name: 'Test User Real'
        }
      }
    });

    if (signupError) {
      console.error('❌ Registration failed:', signupError.message);
      console.error('   Error code:', signupError.status);
      
      // Check if it's a different type of error
      if (signupError.message.includes('recursion')) {
        console.log('❌ Still have recursion issue');
      } else if (signupError.message.includes('Database error')) {
        console.log('❌ Database error - might be trigger issue');
      } else if (signupError.message.includes('Invalid email')) {
        console.log('❌ Email validation issue');
      } else {
        console.log('❌ Different error type:', signupError.message);
      }
    } else {
      console.log('✅ Registration successful!');
      console.log(`   User created: ${signupData.user ? 'Yes' : 'No'}`);
      console.log(`   Session created: ${signupData.session ? 'Yes' : 'No'}`);
      
      if (signupData.user) {
        console.log(`   New user ID: ${signupData.user.id}`);
        console.log(`   Email confirmed: ${signupData.user.email_confirmed_at ? 'Yes' : 'No (email confirmation required)'}`);
        
        // Wait for trigger and check role assignment
        console.log('\n⏳ Waiting 2 seconds for role assignment trigger...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: assignedRole, error: roleCheckError } = await supabase
          .from('users_roles')
          .select('role, is_active, created_at')
          .eq('user_id', signupData.user.id);
          
        if (roleCheckError) {
          console.error('❌ Error checking assigned role:', roleCheckError.message);
        } else if (!assignedRole || assignedRole.length === 0) {
          console.error('❌ No role was automatically assigned');
          console.log('   This might indicate a trigger issue');
        } else {
          console.log('✅ Role automatically assigned:');
          assignedRole.forEach(role => {
            console.log(`     Role: ${role.role} | Active: ${role.is_active} | Created: ${role.created_at}`);
          });
        }
      }
    }

    // Test access to users_roles to confirm no recursion
    console.log('\n🔍 Final verification - checking users_roles access...');
    const { data: allRoles, error: allRolesError } = await supabase
      .from('users_roles')
      .select('user_id, role, is_active')
      .limit(5);

    if (allRolesError) {
      console.error('❌ Still having issues accessing users_roles:', allRolesError.message);
      if (allRolesError.message.includes('recursion')) {
        console.log('❌ CRITICAL: Infinite recursion still exists!');
      }
    } else {
      console.log('✅ users_roles table access working perfectly');
      console.log(`   Found ${allRoles.length} total roles in system`);
    }

  } catch (error) {
    console.error('🔥 Unexpected error:', error);
  }

  console.log('\n🏁 Registration test completed');
}

// Run the test
testRealRegistration().catch(console.error);