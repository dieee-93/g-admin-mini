// ⚙️ PATRÓN DE CONFIGURACIÓN G-ADMIN - Migrado a v2.1
// Siguiendo PLANTILLA: "Módulo de Configuración" desde G_ADMIN_PAGE_CONSTRUCTION_GUIDE.md
import {
  ContentLayout, Section, FormSection, Alert, Stack, Button, HStack, Icon
} from '@/shared/ui';
import { CogIcon, MagnifyingGlassIcon, ClockIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';
import { HookPoint } from '@/lib/modules';
import { useSettingsPage } from './hooks';
import { useNavigate } from 'react-router-dom';

// Components de configuración
import {
  BusinessProfileSection,
  TaxConfigurationSection,
  UserPermissionsSection,
  SystemSection,
  NotificationRulesSection,
} from './components';
import { SettingsSearch } from './components/SettingsSearch';
import { AutoSaveIndicator, AutoSaveStatusBadge } from './components/AutoSaveIndicator';

export default function SettingsPage() {
  const { isLoading, error, isDirty, metrics, handlers, icons, isSearchOpen, autoSave, settingsData } = useSettingsPage();
  const navigate = useNavigate();

  if (isLoading) return <div>Cargando configuración...</div>;
  if (error) {
    ModuleEventUtils.system.moduleError("settings", error);
    return <Alert variant="subtle" title="Error de configuración">{error}</Alert>;
  }

  return (
    <ContentLayout spacing="normal">
      <Stack gap="6">
        <Section variant="flat" title="Configuración del Sistema">
          {/* 🔍 Barra de búsqueda y estado de auto-save */}
          <HStack justify="space-between" mb="6">
            <Button
              variant="outline"
              size="md"
              onClick={handlers.openSearch}
            >
              <Icon icon={MagnifyingGlassIcon} size="sm" />
              Buscar configuraciones
            </Button>
            
            {/* 💾 Indicador de auto-save */}
            <HStack gap="4" alignItems="center">
              <AutoSaveStatusBadge 
                status={autoSave.autoSaveState.status}
                hasUnsavedChanges={autoSave.hasUnsavedChanges}
              />
              <AutoSaveIndicator
                status={autoSave.autoSaveState.status}
                lastSaved={autoSave.autoSaveState.lastSaved}
                hasUnsavedChanges={autoSave.hasUnsavedChanges}
                error={autoSave.autoSaveState.error}
                onRetry={autoSave.retry}
              />
            </HStack>
          </HStack>

          {/* 🕐 Quick Access Cards */}
          <Stack gap="4" mb="6">
            <Alert
              variant="outline"
              status="info"
              title="Configuraciones Especializadas"
              description="Accede a configuraciones avanzadas específicas para cada área de tu negocio"
            />
            {/* ✅ HookPoint: Módulos inyectan sus settings cards aquí */}
            <HookPoint 
              name="settings.specialized.cards" 
              direction="row" 
              gap="4"
              flexWrap="wrap"
              fallback={
                <Alert variant="subtle" status="info">
                  No hay configuraciones especializadas disponibles. Activa capabilities para ver más opciones.
                </Alert>
              }
            />
          </Stack>

          <FormSection
            id="business-info"
            title="Perfil Empresarial"
            description="Información básica del negocio y configuración operacional"
          >
            <BusinessProfileSection />
          </FormSection>

          <FormSection
            id="tax-config"
            title="Configuración Fiscal"
            description="Impuestos, categorías y cumplimiento normativo"
          >
            <TaxConfigurationSection />
          </FormSection>

          <FormSection
            id="roles-management"
            title="Permisos y Usuarios"
            description="Gestión de roles y accesos del sistema"
          >
            <UserPermissionsSection />
          </FormSection>

          <FormSection
            id="notification-rules"
            title="Reglas de Notificación"
            description="Configura cuándo y cómo recibir notificaciones del sistema"
          >
            <NotificationRulesSection />
          </FormSection>

          <FormSection
            id="system-status"
            title="Sistema y Seguridad"
            description="Configuración técnica y políticas de seguridad"
          >
            <SystemSection />
          </FormSection>

          {/* 💾 Botones de guardado manual (opcional con auto-save) */}
          <Stack direction="row" gap="md" justify="space-between" align="center" mt="lg">
            <AutoSaveIndicator
              status={autoSave.autoSaveState.status}
              lastSaved={autoSave.autoSaveState.lastSaved}
              hasUnsavedChanges={autoSave.hasUnsavedChanges}
              error={autoSave.autoSaveState.error}
              onRetry={autoSave.retry}
            />
            
            <HStack gap="md">
              <Button variant="outline" onClick={handlers.handleReset} disabled={!isDirty}>
                Restablecer
              </Button>
              <Button 
                variant="solid" 
                onClick={autoSave.forceSave}
                loading={autoSave.isLoading}
                disabled={!autoSave.hasUnsavedChanges}
              >
                {autoSave.isLoading ? 'Guardando...' : 'Guardar Ahora'}
              </Button>
            </HStack>
          </Stack>
        </Section>
      </Stack>

      {/* 🔍 Componente de búsqueda */}
      <SettingsSearch 
        isOpen={isSearchOpen} 
        onClose={handlers.closeSearch} 
      />
    </ContentLayout>
  );
}
