// Settings Page - Dashboard-style with Dynamic Theming
import React, { useEffect } from 'react';
import { 
  Stack, Typography, MetricCard, CardGrid, Button, Icon
} from '@/shared/ui';
import { 
  CogIcon,
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

// Components  
import { BusinessProfileSection } from './components/sections/BusinessProfileSection';
import { TaxConfigurationSection } from './components/sections/TaxConfigurationSection';
import { UserPermissionsSection } from './components/sections/UserPermissionsSection';
import { IntegrationsSection } from './components/sections/IntegrationsSection';
import { SystemSection } from './components/sections/SystemSection';

export default function SettingsPage() {
  const { setQuickActions } = useNavigation();

  useEffect(() => {
    setQuickActions([
      {
        id: 'save-settings',
        label: 'Guardar Configuración',
        icon: CogIcon,
        action: () => console.log('Save settings'),
        color: 'blue'
      }
    ]);
  }, [setQuickActions]);

  return (
    <Stack gap="xl" align="stretch" maxW="7xl" mx="auto" p={{ base: "md", md: "xl" }}>
        
        {/* 🎨 HEADER ELEGANTE - Dashboard Style + Dynamic Theming */}
        <Stack direction="row" justify="space-between" align="end" pb="md">
          <Stack gap="xs">
            <Stack direction="row" align="center" gap="sm">
              <Icon icon={CogIcon} size="lg"  />
              <Typography variant="heading" size="2xl" weight="bold" >
                Configuración
              </Typography>
            </Stack>
            <Typography variant="body" color="secondary" size="md" pl="3xl">
              Centro de comando · G-Admin
            </Typography>
          </Stack>
          <Button  size="md">
            <Icon icon={CogIcon} size="sm" />
            Guardar Cambios
          </Button>
        </Stack>

        {/* 📊 MÉTRICAS COMPACTAS - Horizontal Layout like Dashboard */}
        <Stack 
          direction={{ base: "column", md: "row" }} 
          gap="md" 
          align="stretch"
          width="100%"
        >
          <MetricCard 
            title="Perfil Empresarial"
            value="Completo"
            subtitle="Información actualizada"
            
            icon={BuildingOfficeIcon}
          />
          <MetricCard 
            title="Configuración Fiscal"
            value="IVA 21%"
            subtitle="Configurado correctamente"
            
            icon={CurrencyDollarIcon}
          />
          <MetricCard 
            title="Permisos"
            value="3 Roles"
            subtitle="Activos en el sistema"
            
            icon={UserGroupIcon}
          />
          <MetricCard 
            title="Integraciones"
            value="2 Activas"
            subtitle="APIs funcionando"
            
            icon={LinkIcon}
          />
        </Stack>

        {/* 📋 SECCIONES PRINCIPALES */}
        <BusinessProfileSection />
        <TaxConfigurationSection />
        <UserPermissionsSection />
        <IntegrationsSection />
        <SystemSection />
        
    </Stack>
  );
}
