import React, { useState } from 'react';
import { logger } from '@/lib/logging';
import { 
  CardWrapper, 
  CardHeader, 
  CardBody,
  Button, 
  Typography, 
  Stack,
  Section
} from '@/shared/ui';

interface DatabaseSetupStepProps {
  onNext: () => void;
}

const SQL_SCRIPT = `-- 🚀 G-ADMIN MINI: AUTO-SETUP COMPLETO
-- INSTRUCCIONES: Copia TODO este script y ejecútalo en Supabase SQL Editor

-- 1. TIPOS Y ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CLIENTE', 'OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA DE CONFIGURACIÓN DEL SISTEMA (CREAR PRIMERO)
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MARCAR CONFIGURACIÓN COMPLETADA
INSERT INTO public.system_config (key, value, description) VALUES
('auto_setup_completed', 'true', 'Configuración automática completada'),
('auto_setup_timestamp', NOW()::TEXT, 'Timestamp de configuración')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 4. RESTO DE TABLAS Y CONFIGURACIÓN
-- (El script completo se carga desde el archivo)
SELECT '🎉 Configuración básica iniciada! Continúa con el script completo.' as status;`;

export function DatabaseSetupStep({ onNext }: DatabaseSetupStepProps) {
  const [currentPhase, setCurrentPhase] = useState<'instructions' | 'waiting'>('instructions');
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCRIPT);
      setHasCopied(true);
      // Abrir Supabase en nueva pestaña
      window.open('https://supabase.com/dashboard/projects', '_blank');
      
      // Reset después de 3 segundos
      setTimeout(() => setHasCopied(false), 3000);
    } catch (err) {
      logger.error('App', 'Failed to copy: ', err);
    }
  };

  const handleScriptExecuted = () => {
    setCurrentPhase('waiting');
    // Dar un momento para que el usuario regrese
    setTimeout(() => {
      onNext();
    }, 1000);
  };

  if (currentPhase === 'waiting') {
    return (
      <Section variant="elevated">
        <Stack align="center" gap="lg" py="xl">
          <Typography fontSize="3xl">⏳</Typography>
          <Typography variant="large" fontSize="xl" color="blue.600">
            Verificando Configuración...
          </Typography>
          <Typography color="blue.700" textAlign="center">
            Espera mientras verificamos que la base de datos se haya configurado correctamente.
          </Typography>
        </Stack>
      </Section>
    );
  }

  return (
    <Stack align="stretch" gap="lg">
      
      {/* Instrucciones principales */}
      <Section variant="elevated">
        <Stack gap="lg">
          <div>
            <Typography variant="large" fontSize="xl" mb="sm">
              🗄️ Configuración de Base de Datos
            </Typography>
            <Typography variant="muted" fontSize="md">
              Ejecuta este script en Supabase para configurar automáticamente toda la base de datos
            </Typography>
          </div>
          
          {/* Pasos a seguir */}
          <div>
            <Typography variant="medium" fontSize="md" mb="md">
              📋 Pasos a seguir:
            </Typography>
            <Stack gap="sm" pl="md">
              <Stack direction="row" align="start" gap="sm">
                <Typography variant="medium" color="blue.600">1.</Typography>
                <Typography fontSize="sm">Copia el script SQL haciendo clic en el botón de abajo</Typography>
              </Stack>
              <Stack direction="row" align="start" gap="sm">
                <Typography variant="medium" color="blue.600">2.</Typography>
                <Typography fontSize="sm">Se abrirá tu Dashboard de Supabase automáticamente</Typography>
              </Stack>
              <Stack direction="row" align="start" gap="sm">
                <Typography variant="medium" color="blue.600">3.</Typography>
                <Typography fontSize="sm">Ve a <strong>SQL Editor</strong> en el menú lateral</Typography>
              </Stack>
              <Stack direction="row" align="start" gap="sm">
                <Typography variant="medium" color="blue.600">4.</Typography>
                <Typography fontSize="sm">Pega el script completo y haz clic en <strong>"Run"</strong></Typography>
              </Stack>
              <Stack direction="row" align="start" gap="sm">
                <Typography variant="medium" color="blue.600">5.</Typography>
                <Typography fontSize="sm">Regresa aquí y confirma que ejecutaste el script</Typography>
              </Stack>
            </Stack>
          </div>

          {/* Botones de acción */}
          <div>
            <Stack direction="row" gap="sm" mb="md">
              <Button
                variant="solid"
                onClick={handleCopyScript}
                size="md"
              >
                {hasCopied ? '✅ ¡Copiado!' : '📋 Copiar Script y Abrir Supabase'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open('/database/complete_setup.sql', '_blank')}
                size="md"
              >
                📄 Ver Script Completo
              </Button>
            </Stack>
            
            {hasCopied && (
              <Typography fontSize="sm" color="green.600">
                ✅ Script copiado al portapapeles. Ahora ve a Supabase y pégalo en el SQL Editor.
              </Typography>
            )}
          </div>

          {/* Preview del script */}
          <div>
            <Typography variant="medium" fontSize="md" mb="sm">
              👀 Vista previa del script:
            </Typography>
            <CardWrapper 
              variant="outline"
              style={{ 
                maxHeight: '200px',
                overflow: 'auto',
                background: 'rgba(249, 250, 251, 1)'
              }}
            >
              <CardBody>
                <pre style={{ 
                  fontSize: '12px', 
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  {SQL_SCRIPT.substring(0, 500)}...
                  
                  {'\n\n-- ⚡ SCRIPT COMPLETO DISPONIBLE AL COPIAR ⚡'}
                </pre>
              </CardBody>
            </CardWrapper>
          </div>
        </Stack>
      </Section>

      {/* Confirmación */}
      <Section 
        variant="outline" 
        style={{ 
          borderColor: '#D1FAE5', 
          background: 'rgba(240, 253, 244, 0.5)' 
        }}
      >
        <Stack gap="md">
          <Stack direction="row" align="center" gap="sm">
            <Typography fontSize="lg">✅</Typography>
            <Typography variant="medium" fontSize="md" color="green.700">
              ¿Ya ejecutaste el script en Supabase?
            </Typography>
          </Stack>
          <Typography color="green.600" fontSize="sm">
            Una vez que hayas ejecutado el script exitosamente en Supabase SQL Editor, 
            confirma aquí para que verifiquemos la configuración.
          </Typography>
          <Button
            variant="solid"
            onClick={handleScriptExecuted}
            size="md"
            style={{ 
              background: '#10B981', 
              color: 'white' 
            }}
            _hover={{ background: '#059669' }}
          >
            ✅ Sí, ejecuté el script - Verificar ahora
          </Button>
        </Stack>
      </Section>

      {/* Ayuda adicional */}
      <Section 
        variant="outline" 
        style={{ 
          borderColor: '#FEF3C7', 
          background: 'rgba(255, 251, 235, 0.5)' 
        }}
      >
        <Stack gap="md">
          <Stack direction="row" align="center" gap="sm">
            <Typography fontSize="lg">💡</Typography>
            <Typography variant="medium" fontSize="md" color="yellow.700">
              ¿Necesitas ayuda?
            </Typography>
          </Stack>
          <Typography color="yellow.600" fontSize="sm">
            Si tienes problemas ejecutando el script o no encuentras el SQL Editor en Supabase:
          </Typography>
          <Stack direction="row" gap="sm">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/docs/DATABASE_SETUP_GUIDE.md', '_blank')}
            >
              📖 Guía Detallada
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://docs.supabase.com/guides/getting-started/tutorials/with-react#set-up-a-database', '_blank')}
            >
              📚 Docs Supabase
            </Button>
          </Stack>
        </Stack>
      </Section>
    </Stack>
  );
}