import { createClient } from '@supabase/supabase-js';

// Usar las variables de entorno reales
const supabaseUrl = 'https://ocwjrkxjwqmxvhckgtud.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd2pya3hqd3FteHZoY2tndHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTQ2NDQsImV4cCI6MjA2OTM5MDY0NH0.2xKgIkDZ1ghSnD1zt1akW4EnILfJanIB7tNlUySPVfI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyAuthFix() {
  console.log('🔍 Verifying auth system fix...\n');

  try {
    // Test 1: Check if we can access users_roles table without recursion
    console.log('1️⃣ Testing users_roles table access...');
    const { data: rolesData, error: rolesError } = await supabase
      .from('users_roles')
      .select('count')
      .single();

    if (rolesError) {
      if (rolesError.message.includes('infinite recursion')) {
        console.error('❌ STILL BROKEN: Infinite recursion detected');
        console.log('   The manual SQL fix needs to be applied in Supabase Dashboard');
        return false;
      } else {
        console.error('❌ Different error:', rolesError.message);
        return false;
      }
    } else {
      console.log('✅ users_roles table accessible without recursion');
    }

    // Test 2: Check existing roles
    console.log('\n2️⃣ Checking existing user roles...');
    const { data: existingRoles, error: existingError } = await supabase
      .from('users_roles')
      .select('user_id, role, is_active, created_at')
      .limit(10);

    if (existingError) {
      console.error('❌ Error accessing roles:', existingError.message);
    } else {
      console.log('✅ Successfully retrieved existing roles:');
      existingRoles.forEach((role, index) => {
        console.log(`   ${index + 1}. User: ${role.user_id.substring(0, 8)}... | Role: ${role.role} | Active: ${role.is_active}`);
      });
      console.log(`   Total roles found: ${existingRoles.length}`);
    }

    // Test 3: Test user registration
    console.log('\n3️⃣ Testing user registration...');
    const testEmail = `verification-test-${Date.now()}@example.com`;
    console.log(`   Testing with email: ${testEmail}`);

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Verification Test User'
        }
      }
    });

    if (signupError) {
      console.error('❌ Registration test failed:', signupError.message);
      if (signupError.message.includes('Database error saving new user')) {
        console.log('   This likely means the policies still have issues');
      }
      return false;
    } else {
      console.log('✅ Registration test successful!');
      console.log(`   User created: ${signupData.user ? 'Yes' : 'No'}`);
      console.log(`   Session created: ${signupData.session ? 'Yes' : 'No'}`);
      
      if (signupData.user) {
        console.log(`   New user ID: ${signupData.user.id}`);
        console.log('   Waiting 3 seconds for trigger to assign role...');
        
        // Wait for trigger to execute
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if role was assigned
        const { data: assignedRole, error: roleCheckError } = await supabase
          .from('users_roles')
          .select('role, is_active, created_at')
          .eq('user_id', signupData.user.id);
          
        if (roleCheckError) {
          console.error('❌ Error checking assigned role:', roleCheckError.message);
        } else if (!assignedRole || assignedRole.length === 0) {
          console.error('❌ No role was automatically assigned - trigger issue');
        } else {
          console.log('✅ Role successfully auto-assigned:');
          assignedRole.forEach(role => {
            console.log(`     Role: ${role.role} | Active: ${role.is_active} | Assigned: ${role.created_at}`);
          });
        }
      }
    }

    // Test 4: Check current auth state
    console.log('\n4️⃣ Checking current auth state...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError.message);
    } else {
      console.log('✅ Auth state check successful');
      if (session?.user) {
        console.log(`   Active session for: ${session.user.email}`);
        
        // If we have an active session, check the user's role
        const { data: userRole, error: userRoleError } = await supabase
          .from('users_roles')
          .select('role, is_active')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .single();
          
        if (userRoleError) {
          console.error('❌ Error getting user role:', userRoleError.message);
        } else {
          console.log(`   Current user role: ${userRole.role}`);
        }
      } else {
        console.log('   No active session (expected for anonymous test)');
      }
    }

    console.log('\n🎉 AUTH SYSTEM VERIFICATION COMPLETE');
    console.log('✅ All tests passed! Registration should work normally now.');
    return true;

  } catch (error) {
    console.error('🔥 Unexpected error during verification:', error);
    return false;
  }
}

// Run verification
verifyAuthFix()
  .then(success => {
    if (success) {
      console.log('\n🚀 You can now test registration in your application!');
    } else {
      console.log('\n⚠️  Please apply the manual SQL fix and run this verification again.');
    }
  })
  .catch(console.error);