import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ocwjrkxjwqmxvhckgtud.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd2pya3hqd3FteHZoY2tndHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTQ2NDQsImV4cCI6MjA2OTM5MDY0NH0.2xKgIkDZ1ghSnD1zt1akW4EnILfJanIB7tNlUySPVfI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTriggerAfterFix() {
  console.log('🔧 Testing trigger after fix...\n');

  try {
    // Test registration with trigger
    const testEmail = `trigger.test.${Date.now()}@gmail.com`;
    console.log(`📧 Testing registration with: ${testEmail}`);

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TriggerTest123!',
      options: {
        data: {
          full_name: 'Trigger Test User'
        }
      }
    });

    if (signupError) {
      console.error('❌ Registration failed:', signupError.message);
      return;
    }

    console.log('✅ User registration successful');
    console.log(`   User ID: ${signupData.user.id}`);

    // Wait for trigger to execute
    console.log('\n⏳ Waiting 3 seconds for trigger execution...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if role was assigned
    const { data: roleCheck, error: roleError } = await supabase
      .from('users_roles')
      .select('*')
      .eq('user_id', signupData.user.id);

    if (roleError) {
      console.error('❌ Error checking role:', roleError.message);
    } else if (!roleCheck || roleCheck.length === 0) {
      console.log('❌ Trigger still not working - no role assigned');
      console.log('   Let\'s try manual assignment...');
      
      // Try manual assignment using the function we created
      const { data: manualAssign, error: manualError } = await supabase
        .rpc('assign_role_to_existing_user', { user_uuid: signupData.user.id });

      if (manualError) {
        console.error('❌ Manual assignment failed:', manualError.message);
      } else {
        console.log('✅ Manual assignment result:', manualAssign);
        
        // Check again
        const { data: secondCheck, error: secondError } = await supabase
          .from('users_roles')
          .select('*')
          .eq('user_id', signupData.user.id);
          
        if (secondCheck && secondCheck.length > 0) {
          console.log('✅ Manual assignment successful:', secondCheck);
        }
      }
    } else {
      console.log('🎉 TRIGGER IS WORKING! Role assigned automatically:');
      roleCheck.forEach(role => {
        console.log(`   Role: ${role.role} | Active: ${role.is_active} | Created: ${role.created_at}`);
      });
    }

    // Show all users and their roles
    console.log('\n📊 Current users and roles in system:');
    const { data: allUsersRoles, error: allError } = await supabase
      .from('users_roles')
      .select('user_id, role, is_active, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (allError) {
      console.error('❌ Error getting all roles:', allError.message);
    } else {
      console.log(`   Total roles in system: ${allUsersRoles.length}`);
      allUsersRoles.forEach((role, index) => {
        console.log(`   ${index + 1}. User: ${role.user_id.substring(0, 8)}... | Role: ${role.role} | Active: ${role.is_active}`);
      });
    }

  } catch (error) {
    console.error('🔥 Unexpected error:', error);
  }

  console.log('\n🏁 Trigger test completed');
}

testTriggerAfterFix().catch(console.error);