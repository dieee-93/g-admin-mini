// Settings Page - Semantic Layout with New Design System
import React, { useEffect } from 'react';
import { 
  ContentLayout, PageHeader, StatsSection, CardGrid, MetricCard, Button, Icon
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
// IntegrationsSection moved to integrations/page.tsx - no longer needed here
// EnterpriseSection moved to enterprise/page.tsx - no longer needed here
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
    <ContentLayout>
      {/* 🎨 PAGE HEADER - Semantic, clean, with all functionality */}
      <PageHeader 
        title="Configuración"
        subtitle="Centro de comando · G-Admin"
        icon={CogIcon}
        actions={
          <Button size="md">
            <Icon icon={CogIcon} size="sm" />
            Guardar Cambios
          </Button>
        }
      />

      {/* 📊 METRICS SECTION - Semantic wrapper for dashboard stats */}
      <StatsSection>
        <CardGrid columns={{ base: 1, md: 4 }}>
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
        </CardGrid>
      </StatsSection>

      {/* 📋 SECCIONES PRINCIPALES - Some sections moved to independent pages */}
      <BusinessProfileSection />
      <TaxConfigurationSection />
      <UserPermissionsSection />
      {/* IntegrationsSection moved to /integrations page */}
      <SystemSection />
    </ContentLayout>
  );
}
