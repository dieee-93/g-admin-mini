// Settings Page - Semantic Layout with New Design System
import React from 'react';
import { 
  ContentLayout, PageHeader, StatsSection, CardGrid, MetricCard, Button, Icon
} from '@/shared/ui';
import { useSettingsPage } from './hooks';

// Components  
import { 
  BusinessProfileSection,
  TaxConfigurationSection,
  UserPermissionsSection,
  SystemSection
} from './components';

export default function SettingsPage() {
  const { metrics, handlers, icons } = useSettingsPage();

  return (
    <ContentLayout>
      {/* 🎨 PAGE HEADER - Semantic, clean, with all functionality */}
      <PageHeader 
        title="Configuración"
        subtitle="Centro de comando · G-Admin"
        icon={icons.CogIcon}
        actions={
          <Button size="md" onClick={handlers.handleSaveSettings}>
            <Icon icon={icons.CogIcon} size="sm" />
            Guardar Cambios
          </Button>
        }
      />

      {/* 📊 METRICS SECTION - Semantic wrapper for dashboard stats */}
      <StatsSection>
        <CardGrid columns={{ base: 1, md: 4 }}>
          {metrics.map((metric, index) => (
            <MetricCard 
              key={index}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              icon={metric.icon}
            />
          ))}
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
