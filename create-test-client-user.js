// ================================================
// CREATE TEST CLIENT USER
// ================================================
// Script para crear un usuario de prueba con rol CLIENTE

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://your-project.supabase.co'; // Reemplazar con tu URL
const supabaseKey = 'your-anon-key'; // Reemplazar con tu clave

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestClientUser() {
    console.log('🚀 Creando usuario de prueba...');
    
    const testUser = {
        email: 'cliente.test@gmail.com',
        password: 'Test123!',
        full_name: 'Cliente Test'
    };
    
    try {
        console.log(`📧 Registrando usuario: ${testUser.email}`);
        
        // Paso 1: Registrar usuario en auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: testUser.email,
            password: testUser.password,
            options: {
                data: {
                    full_name: testUser.full_name
                }
            }
        });
        
        if (authError) {
            console.error('❌ Error en registro:', authError.message);
            return;
        }
        
        console.log('✅ Usuario registrado en auth:', authData.user?.id);
        
        // Esperar un poco para que se cree el registro en users_roles
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Paso 2: Verificar que se creó el rol (debería ser CLIENTE por defecto)
        const { data: roleData, error: roleError } = await supabase
            .from('users_roles')
            .select('*')
            .eq('user_id', authData.user?.id)
            .single();
            
        if (roleError) {
            console.error('❌ Error verificando rol:', roleError.message);
            return;
        }
        
        console.log('✅ Rol asignado:', roleData.role);
        
        // Paso 3: Mostrar resumen
        console.log('\n🎉 USUARIO DE PRUEBA CREADO EXITOSAMENTE');
        console.log('=============================================');
        console.log(`📧 Email: ${testUser.email}`);
        console.log(`🔑 Password: ${testUser.password}`);
        console.log(`👤 Nombre: ${testUser.full_name}`);
        console.log(`🏷️ Rol: ${roleData.role}`);
        console.log(`🆔 ID: ${authData.user?.id}`);
        console.log('=============================================');
        
        return {
            success: true,
            user: authData.user,
            role: roleData.role
        };
        
    } catch (error) {
        console.error('❌ Error inesperado:', error);
        return { success: false, error };
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    createTestClientUser().then(result => {
        if (result?.success) {
            console.log('\n✨ Listo para probar el login!');
        } else {
            console.log('\n💥 Hubo problemas creando el usuario');
        }
        process.exit(0);
    });
}

module.exports = { createTestClientUser };