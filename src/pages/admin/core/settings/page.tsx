/**
 * Settings Page - System Configuration & Business Setup
 *
 * SEMANTIC v3.0 - WCAG AA Compliant:
 * ✅ Skip link for keyboard navigation (WCAG 2.4.1 Level A)
 * ✅ Semantic main content wrapper with ARIA label
 * ✅ Proper section headings for screen readers
 * ✅ ARIA live region for auto-save status
 * ✅ 3-Layer Architecture (Semantic → Layout → Primitives)
 *
 * FEATURES:
 * - Auto-save with visual feedback
 * - Searchable settings
 * - Form sections with semantic structure
 */

import {
  ContentLayout, Section, FormSection, Alert, Stack, Button, HStack, Icon, Spinner, Typography, SkipLink
} from '@/shared/ui';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';
import { useSettingsPage } from './hooks';

// Components de configuración
import {
  BusinessProfileSection,
  TaxConfigurationSection,
  UserPermissionsSection,
  SystemSection
} from './components';
import { SettingsSearch } from './components/SettingsSearch';
import { AutoSaveIndicator, AutoSaveStatusBadge } from './components/AutoSaveIndicator';

export default function SettingsPage() {
  const { isLoading, error, isDirty, handlers, isSearchOpen, autoSave } = useSettingsPage();

  if (isLoading) {
    return (
      <>
        <SkipLink />
        <ContentLayout spacing="normal" mainLabel="System Configuration">
          <Section variant="flat" title="Configuración del Sistema" semanticHeading="System Settings Loading">
            <Stack gap="6" py="16" align="center">
              <Spinner size="xl" colorPalette="blue" />
              <Stack gap="2" align="center">
                <Typography fontSize="lg" fontWeight="medium">Cargando configuración...</Typography>
                <Typography fontSize="sm" color="gray.400">
                  Esto puede tomar unos segundos
                </Typography>
              </Stack>
            </Stack>
          </Section>
        </ContentLayout>
      </>
    );
  }

  if (error) {
    ModuleEventUtils.system.moduleError("settings", error);
    return (
      <>
        <SkipLink />
        <ContentLayout spacing="normal" mainLabel="System Configuration Error">
          <Alert status="error" title="Error de configuración">
            {error}
          </Alert>
          <Button onClick={handlers.handleRetry} mt="4" colorPalette="blue">Reintentar</Button>
        </ContentLayout>
      </>
    );
  }

  return (
    <>
      {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
      <SkipLink />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="normal" mainLabel="System Configuration">
        <Stack gap="6">
          {/* ✅ SETTINGS SECTION - Main configuration area with ARIA live for auto-save */}
          <Section
            variant="flat"
            title="Configuración del Sistema"
            semanticHeading="System Configuration Dashboard"
            live="polite"
            relevant="additions removals"
          >
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
    </>
  );
}
