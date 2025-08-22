// ================================================
// CREATE TEST CLIENTE USER - Sin verificación de email
// ================================================

import { createClient } from '@supabase/supabase-js';

// Usar las mismas credenciales que funcionaron antes
const supabaseUrl = 'https://ocwjrkxjwqmxvhckgtud.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd2pya3hqd3FteHZoY2tndHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTQ2NDQsImV4cCI6MjA2OTM5MDY0NH0.2xKgIkDZ1ghSnD1zt1akW4EnILfJanIB7tNlUySPVfI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestClienteUser() {
  console.log('🚀 Creando usuario CLIENTE de prueba...\n');

  // Credenciales de prueba - email simple y estándar
  const testEmail = 'clientetest@example.com';
  const testPassword = 'Test123!';
  const testName = 'Cliente Test';

  try {
    console.log(`📧 Registrando usuario: ${testEmail}`);
    console.log(`🔑 Contraseña: ${testPassword}`);
    console.log(`👤 Nombre: ${testName}\n`);

    // Registrar usuario (igual que el script que funcionó)
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName
        }
      }
    });

    if (signupError) {
      console.error('❌ Error en registro:', signupError.message);
      return false;
    }

    console.log('✅ Usuario registrado en auth!');
    console.log(`   User ID: ${signupData.user?.id}`);
    console.log(`   Email: ${signupData.user?.email}`);
    console.log(`   Session created: ${signupData.session ? 'Yes' : 'No'}\n`);
    
    console.log('⏳ Esperando 3 segundos para que el trigger asigne el rol...');
    
    // Esperar para que el trigger asigne el rol automáticamente
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar el rol asignado
    const { data: assignedRole, error: roleCheckError } = await supabase
      .from('users_roles')
      .select('role, is_active, created_at')
      .eq('user_id', signupData.user?.id);
      
    if (roleCheckError) {
      console.error('❌ Error verificando rol:', roleCheckError.message);
      return false;
    }
    
    if (!assignedRole || assignedRole.length === 0) {
      console.error('❌ No se asignó rol automáticamente');
      return false;
    }
    
    console.log('✅ Rol asignado exitosamente!');
    assignedRole.forEach(role => {
      console.log(`   Rol: ${role.role} | Activo: ${role.is_active} | Creado: ${role.created_at}`);
    });

    // Resumen final
    console.log('\n🎉 USUARIO DE PRUEBA CLIENTE CREADO EXITOSAMENTE');
    console.log('================================================');
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔑 Password: ${testPassword}`);
    console.log(`👤 Nombre: ${testName}`);
    console.log(`🏷️ Rol: ${assignedRole[0].role}`);
    console.log(`🆔 ID: ${signupData.user?.id}`);
    console.log('================================================');
    console.log('\n✨ ¡Listo para hacer login y probar el sistema de roles!');
    
    return true;

  } catch (error) {
    console.error('🔥 Error inesperado:', error);
    return false;
  }
}

// Ejecutar
createTestClienteUser()
  .then(success => {
    if (success) {
      console.log('\n🚀 Puedes hacer login ahora con cliente.test@gmail.com');
    } else {
      console.log('\n💥 Hubo problemas creando el usuario');
    }
    process.exit(0);
  })
  .catch(console.error);