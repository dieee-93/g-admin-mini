// ⚙️ PATRÓN DE CONFIGURACIÓN G-ADMIN - Migrado a v2.1
// Siguiendo PLANTILLA: "Módulo de Configuración" desde G_ADMIN_PAGE_CONSTRUCTION_GUIDE.md
import {
  ContentLayout, Section, FormSection, Alert, Stack, Button
} from '@/shared/ui';
import { CogIcon } from '@heroicons/react/24/outline';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';
import { useSettingsPage } from './hooks';

// Components de configuración
import { 
  BusinessProfileSection,
  TaxConfigurationSection,
  UserPermissionsSection,
  SystemSection
} from './components';

export default function SettingsPage() {
  const { isLoading, error, isDirty, metrics, handlers, icons } = useSettingsPage();

  if (isLoading) return <div>Cargando configuración...</div>;
  if (error) {
    ModuleEventUtils.system.moduleError("settings", error);
    return <Alert variant="subtle" title={error} />;
  }

  return (
    <ContentLayout spacing="normal">
      <Stack gap={12}>
        <Section variant="flat" title="Configuración del Sistema">

          <FormSection
            title="Perfil Empresarial"
            description="Información básica del negocio y configuración operacional"
          >
            <BusinessProfileSection />
          </FormSection>

          <FormSection
            title="Configuración Fiscal"
            description="Impuestos, categorías y cumplimiento normativo"
          >
            <TaxConfigurationSection />
          </FormSection>

          <FormSection
            title="Permisos y Usuarios"
            description="Gestión de roles y accesos del sistema"
          >
            <UserPermissionsSection />
          </FormSection>

          <FormSection
            title="Sistema y Seguridad"
            description="Configuración técnica y políticas de seguridad"
          >
            <SystemSection />
          </FormSection>

          <Stack direction="row" gap="md" justify="end" mt="lg">
            <Button variant="outline" onClick={handlers.handleReset} disabled={!isDirty}>
              Restablecer
            </Button>
            <Button variant="solid" onClick={handlers.handleSave} disabled={!isDirty}>
              Guardar Cambios
            </Button>
          </Stack>
        </Section>
      </Stack>
    </ContentLayout>
  );
}
