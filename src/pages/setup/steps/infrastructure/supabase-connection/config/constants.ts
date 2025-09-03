export const SUPABASE_CONNECTION_CONFIG = {
  // Validation
  MIN_KEY_LENGTH: 100,
  REQUIRED_URL_SUBSTRING: 'supabase.co',
  
  // Demo data
  DEMO_URL: 'https://demo-project.supabase.co',
  DEMO_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8tcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MDA0ODAwLCJleHAiOjE5NjAzODA4MDB9.demo-key-for-testing-purposes-only',
  
  // Animation delays
  DEMO_AUTO_CONNECT_DELAY: 500,
  
  // UI text
  TEXTS: {
    title: '🔌 Conexión a Supabase',
    subtitle: 'Conecta tu aplicación con tu proyecto de Supabase para comenzar la configuración automática',
    
    instructions: {
      title: '💡 INSTRUCCIONES',
      subtitle: '¿Dónde encontrar estas credenciales?',
      steps: [
        'Ve a tu dashboard de Supabase: app.supabase.com',
        'Selecciona tu proyecto',
        'Ve a Settings → API',
        'Copia la URL y la clave anónima (anon key)'
      ]
    },
    
    form: {
      title: 'Credenciales de Supabase',
      urlLabel: 'URL del Proyecto Supabase',
      urlPlaceholder: 'https://tu-proyecto.supabase.co',
      urlExample: 'https://abcdefgh.supabase.co',
      keyLabel: 'Clave Anónima (Anon Key)',
      keyPlaceholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      keyHelperText: 'Esta clave es segura para usar en el frontend'
    },
    
    buttons: {
      connect: '🚀 Conectar y Configurar',
      connecting: '🔄 Conectando...',
      useDemo: '🎮 Usar Configuración de Demo',
      debugSkip: '🐛 Debug: Skip Supabase'
    },
    
    whatHappensNext: {
      title: '✨ QUÉ PASARÁ DESPUÉS',
      steps: [
        'La app se conectará a tu proyecto Supabase',
        'Se crearán automáticamente todas las tablas necesarias',
        'Se configurarán las políticas de seguridad',
        'Se crearán las funciones SQL requeridas',
        'Todo quedará listo para usar g-admin'
      ]
    },
    
    demoDescription: 'Perfecto para probar el sistema sin configurar Supabase'
  }
};

export const ANIMATION_CLASSES = {
  fadeInShake: 'fadeInShake 0.5s ease',
  fadeInUp: 'fadeInUp 0.6s ease 0.3s both',
  fadeInLeft: (index: number) => `fadeInLeft 0.4s ease ${0.1 * index}s both`
};

// CSS Keyframes (to be added to global CSS)
export const CSS_KEYFRAMES = `
  @keyframes fadeInShake {
    0% { opacity: 0; transform: translateX(-10px); }
    60% { transform: translateX(5px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;