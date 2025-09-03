import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Layout, Stack, VStack, HStack, Typography, Button, CardWrapper, Badge 
} from '@/shared/ui';
import { 
  ShieldCheckIcon,
  ComputerDesktopIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Header administrativo
function AdminHeader() {
  return (
    <Layout variant="panel" padding="lg" style={{ borderBottom: '1px solid #e2e8f0' }}>
      <HStack justify="space-between" align="center">
        <HStack gap="md" align="center">
          <div style={{
            padding: '12px',
            background: '#3182ce',
            borderRadius: '12px',
            color: 'white'
          }}>
            <ShieldCheckIcon style={{ width: '24px', height: '24px' }} />
          </div>
          <Stack gap="xs">
            <Typography variant="title" color="text.primary">
              G-Admin Sistema
            </Typography>
            <Typography variant="caption" color="text.muted">
              Portal de Acceso Administrativo
            </Typography>
          </Stack>
        </HStack>
        
        <Button
          variant="ghost"
          size="sm"
          color="gray.600"
          as={RouterLink}
          to="/"
        >
          <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
          Sitio público
        </Button>
      </HStack>
    </Layout>
  );
}

// Sección principal de login para staff
function LoginSection() {
  return (
    <Layout variant="container" padding="xl">
      <Stack direction="row" align="center" justify="center" gap="xl">
        <CardWrapper variant="elevated" padding="xl" width="50%" maxW="400px">
          <Stack gap="lg" align="center">
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)',
              borderRadius: '16px',
              color: 'white'
            }}>
              <ComputerDesktopIcon style={{ width: '48px', height: '48px' }} />
            </div>
            
            <Stack gap="sm" align="center">
              <Typography variant="heading" color="text.primary" textAlign="center">
                Acceso del Personal
              </Typography>
              <Typography variant="body" color="text.muted" textAlign="center">
                Inicie sesión con sus credenciales corporativas para acceder 
                al sistema de gestión empresarial.
              </Typography>
            </Stack>
            
            <Stack gap="md" width="full">
              <Button 
                size="lg" 
                colorPalette="blue"
                width="full"
                as={RouterLink}
                to="/admin/login"
              >
                <HStack gap="sm">
                  <ShieldCheckIcon style={{ width: '20px', height: '20px' }} />
                  <Typography variant="body" color="white">
                    Iniciar Sesión
                  </Typography>
                  <ArrowRightIcon style={{ width: '16px', height: '16px' }} />
                </HStack>
              </Button>
              
              <Typography variant="caption" color="text.muted" textAlign="center">
                Solo personal autorizado. Acceso monitoreado y registrado.
              </Typography>
            </Stack>
          </Stack>
        </CardWrapper>
        
        {/* Info panel */}
        <Stack gap="lg" width="50%" maxW="400px">
          <CardWrapper variant="outline" padding="lg">
            <Stack gap="md">
              <HStack gap="sm" align="center">
                <UserGroupIcon style={{ width: '20px', height: '20px', color: '#3182ce' }} />
                <Typography variant="title" color="text.primary">
                  Roles de Acceso
                </Typography>
              </HStack>
              
              <Stack gap="sm">
                <HStack justify="space-between" align="center">
                  <Typography variant="body" color="text.secondary">Operador</Typography>
                  <Badge colorPalette="blue" size="sm">Básico</Badge>
                </HStack>
                <HStack justify="space-between" align="center">
                  <Typography variant="body" color="text.secondary">Supervisor</Typography>
                  <Badge colorPalette="green" size="sm">Intermedio</Badge>
                </HStack>
                <HStack justify="space-between" align="center">
                  <Typography variant="body" color="text.secondary">Administrador</Typography>
                  <Badge colorPalette="orange" size="sm">Avanzado</Badge>
                </HStack>
                <HStack justify="space-between" align="center">
                  <Typography variant="body" color="text.secondary">Super Admin</Typography>
                  <Badge colorPalette="red" size="sm">Completo</Badge>
                </HStack>
              </Stack>
            </Stack>
          </CardWrapper>

          <CardWrapper variant="outline" padding="lg">
            <Stack gap="md">
              <HStack gap="sm" align="center">
                <CogIcon style={{ width: '20px', height: '20px', color: '#3182ce' }} />
                <Typography variant="title" color="text.primary">
                  Módulos Disponibles
                </Typography>
              </HStack>
              
              <Stack gap="xs">
                <Typography variant="body" color="text.secondary" size="sm">• Dashboard y Métricas</Typography>
                <Typography variant="body" color="text.secondary" size="sm">• Gestión de Ventas</Typography>
                <Typography variant="body" color="text.secondary" size="sm">• Inventario y Materiales</Typography>
                <Typography variant="body" color="text.secondary" size="sm">• Productos y Menú</Typography>
                <Typography variant="body" color="text.secondary" size="sm">• Personal y Horarios</Typography>
                <Typography variant="body" color="text.secondary" size="sm">• Reportes Fiscales</Typography>
                <Typography variant="body" color="text.secondary" size="sm">• Configuraciones</Typography>
              </Stack>
            </Stack>
          </CardWrapper>
        </Stack>
      </Stack>
    </Layout>
  );
}

// Estado del sistema (opcional)
function SystemStatus() {
  const systemMetrics = [
    { label: 'Estado del Servidor', value: 'Operativo', status: 'success' },
    { label: 'Base de Datos', value: 'Conectada', status: 'success' },
    { label: 'Sincronización', value: 'Activa', status: 'success' },
    { label: 'Última Actualización', value: '2 min ago', status: 'info' }
  ];

  return (
    <Layout variant="container" padding="lg">
      <CardWrapper variant="subtle" padding="lg">
        <Stack gap="md">
          <HStack justify="space-between" align="center">
            <HStack gap="sm" align="center">
              <ChartBarIcon style={{ width: '20px', height: '20px', color: '#3182ce' }} />
              <Typography variant="title" color="text.primary">
                Estado del Sistema
              </Typography>
            </HStack>
            <Badge colorPalette="green" variant="solid">
              <CheckCircleIcon style={{ width: '12px', height: '12px' }} />
              Operativo
            </Badge>
          </HStack>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            {systemMetrics.map((metric, index) => (
              <HStack key={index} justify="space-between" align="center">
                <Typography variant="body" color="text.secondary" size="sm">
                  {metric.label}
                </Typography>
                <Badge 
                  colorPalette={metric.status === 'success' ? 'green' : 'blue'} 
                  size="sm"
                  variant="subtle"
                >
                  {metric.value}
                </Badge>
              </HStack>
            ))}
          </div>
        </Stack>
      </CardWrapper>
    </Layout>
  );
}

// Contacto técnico
function SupportContact() {
  return (
    <Layout variant="container" padding="lg">
      <CardWrapper variant="outline" padding="lg">
        <Stack gap="md" align="center">
          <HStack gap="sm" align="center">
            <ExclamationTriangleIcon style={{ width: '20px', height: '20px', color: '#d69e2e' }} />
            <Typography variant="title" color="text.primary">
              Soporte Técnico
            </Typography>
          </HStack>
          
          <Typography variant="body" color="text.muted" textAlign="center">
            ¿Problemas de acceso o funcionamiento del sistema?
          </Typography>
          
          <Stack gap="sm" align="center">
            <HStack gap="md" justify="center">
              <Button variant="outline" size="sm" color="blue.600">
                📧 admin@empresa.com
              </Button>
              <Button variant="outline" size="sm" color="blue.600">
                📞 (011) 4567-8901
              </Button>
            </HStack>
            
            <Typography variant="caption" color="text.muted">
              Soporte disponible: Lunes a Viernes 9:00 - 18:00
            </Typography>
          </Stack>
        </Stack>
      </CardWrapper>
    </Layout>
  );
}

// Footer administrativo
function AdminFooter() {
  return (
    <Layout variant="panel" padding="md" style={{ 
      background: '#f7fafc', 
      borderTop: '1px solid #e2e8f0',
      marginTop: 'auto'
    }}>
      <Stack gap="sm" align="center">
        <HStack gap="md" justify="center">
          <Typography variant="caption" color="text.muted">
            © 2025 G-Admin Sistema
          </Typography>
          <Typography variant="caption" color="text.muted">
            •
          </Typography>
          <Typography variant="caption" color="text.muted">
            Versión 2.0.1
          </Typography>
          <Typography variant="caption" color="text.muted">
            •
          </Typography>
          <Typography variant="caption" color="text.muted">
            Seguridad SSL/TLS
          </Typography>
        </HStack>
        
        <Typography variant="caption" color="text.muted" textAlign="center">
          Sistema de gestión empresarial para restaurantes y servicios gastronómicos
        </Typography>
      </Stack>
    </Layout>
  );
}

// Página principal del portal administrativo
export default function AdminPortalPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AdminHeader />
      <LoginSection />
      <SystemStatus />
      <SupportContact />
      <AdminFooter />
    </div>
  );
}