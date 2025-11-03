# ⚙️ SETTINGS MODULE - Production Ready

**Module**: Settings (System Configuration)
**Phase**: Phase 3 P0 - Special Module
**Estimated Time**: 4-5 hours
**Priority**: P0 (Complex - multiple settings sections, validation)

---

## 📋 OBJECTIVE

Make the **Settings module** production-ready following the 10-criteria checklist.

**Why this module**: Central system configuration - business profile, tax settings, user permissions, integrations. Critical for system setup.

---

## ✅ 10 PRODUCTION-READY CRITERIA

1. ✅ **Architecture compliant**: Follows Capabilities → Features → Modules
2. ✅ **Scaffolding ordered**: components/, hooks/, types/ organized
3. ✅ **Zero errors**: 0 ESLint + 0 TypeScript errors in module
4. ✅ **UI complete**: All settings sections working
5. ✅ **Cross-module mapped**: README documents provides/consumes
6. ✅ **Zero duplication**: No repeated logic
7. ✅ **DB connected**: Settings persistence via Supabase
8. ✅ **Features mapped**: Clear activation from FeatureRegistry
9. ✅ **Permissions designed**: minimumRole: ADMINISTRADOR
10. ✅ **README**: Settings structure documented

---

## 📂 MODULE FILES

### Core Files
- **Manifest**: `src/modules/settings/manifest.tsx`
- **Page**: `src/pages/admin/core/settings/page.tsx`
- **Database Tables**: `business_profiles`, `system_settings`, `user_preferences`

### Current Structure
```
src/pages/admin/core/settings/
├── page.tsx                          # Main settings page
├── components/
│   ├── SettingsSearch.tsx            # Search settings
│   ├── AutoSaveIndicator.tsx         # Auto-save feedback
│   ├── BusinessProfile/
│   │   └── BusinessProfileSection.tsx # Business info
│   ├── TaxConfiguration/
│   │   └── TaxConfigurationSection.tsx # Tax settings (AFIP)
│   ├── UserPermissions/
│   │   └── UserPermissionsSection.tsx # User/role management
│   ├── System/
│   │   └── SystemSection.tsx         # System preferences
│   └── Enterprise/
│       └── EnterpriseSection.tsx     # Enterprise features
├── hooks/
│   ├── useSettingsPage.ts            # Main settings logic
│   ├── useSettingsSearch.ts          # Search functionality
│   └── useAutoSave.ts                # Auto-save logic
├── types/
│   ├── index.ts                      # Type exports
│   ├── profile.ts                    # Business profile types
│   ├── tax.ts                        # Tax configuration types
│   ├── permissions.ts                # Permission types
│   └── system.ts                     # System settings types
├── utils/
│   └── index.ts                      # Settings utilities
└── pages/                            # Sub-pages
    ├── diagnostics/
    │   └── page.tsx                  # System diagnostics
    ├── enterprise/
    │   └── page.tsx                  # Enterprise settings
    ├── integrations/
    │   └── page.tsx                  # Integrations config
    └── reporting/
        └── page.tsx                  # Reporting config
```

---

## 🔍 MODULE DETAILS

### Current Status (From Manifest)

**Metadata**:
- ✅ ID: `settings`
- ✅ minimumRole: `ADMINISTRADOR` (already set)
- ✅ autoInstall: `true` (always available)
- ✅ No dependencies

**Hooks**:
- **PROVIDES**:
  - `settings.updated` - When settings change
  - `settings.sections` - Settings sections
  - `settings.integrations` - Integration config panels

- **CONSUMES**:
  - `finance.integration_status` - Integration health checks

### Key Features

**Settings Sections**:

1. **Business Profile**:
   - Business name, logo, address
   - Operating hours
   - Contact information
   - Multi-location setup

2. **Tax Configuration** (Argentina):
   - AFIP credentials
   - Tax ID (CUIT)
   - IVA rates (21%, 10.5%, 0%)
   - Invoice numbering
   - Tax periods

3. **User Permissions**:
   - User management (CRUD)
   - Role assignment (5 roles)
   - Permission matrix
   - Location access (multi-location)

4. **System Preferences**:
   - Language (es-AR)
   - Currency (ARS)
   - Date/time format
   - Notifications
   - Theme settings

5. **Enterprise Features**:
   - Multi-location
   - Advanced analytics
   - Custom branding
   - API access

6. **Integrations** (Links to Finance-Integrations):
   - MercadoPago
   - MODO
   - AFIP WebService
   - Banking

**Design Pattern**: Vertical tabs (Settings modules convention)

---

## 🎯 WORKFLOW (4-5 HOURS)

### 1. Audit (30 min)
- [ ] Read `src/modules/settings/manifest.tsx`
- [ ] Read `src/pages/admin/core/settings/page.tsx`
- [ ] Check ESLint errors: `pnpm -s exec eslint src/modules/settings src/pages/admin/core/settings`
- [ ] Check TypeScript errors
- [ ] Map settings sections (6 sections)
- [ ] Verify minimumRole: 'ADMINISTRADOR'

### 2. Fix Structure (1 hour)
- [ ] Fix manifest if needed
- [ ] Fix ESLint errors in module files
- [ ] Fix TypeScript errors
- [ ] Organize folder structure
- [ ] Remove unused components
- [ ] Verify vertical tabs pattern

### 3. Database & Functionality (1.5-2 hours)
- [ ] Verify `business_profiles` table exists
- [ ] Verify `system_settings` table exists
- [ ] Test business profile CRUD
- [ ] Test tax configuration save
- [ ] Test user permissions management
- [ ] Test auto-save functionality
- [ ] Verify validation (CUIT, email, etc.)
- [ ] Test settings search

### 4. Cross-Module Integration (45 min)
- [ ] Create/update `settings/README.md`
- [ ] Document hook: `settings.updated`
- [ ] Document hook: `settings.sections`
- [ ] Test integration with Finance-Integrations
- [ ] Verify EventBus events
- [ ] Document settings structure

### 5. Validation (30 min)
- [ ] Run production-ready checklist (10 items)
- [ ] Test all 6 settings sections
- [ ] Verify 0 ESLint errors in module
- [ ] Verify 0 TypeScript errors in module
- [ ] Test auto-save
- [ ] Test settings search
- [ ] Mark module as production-ready

---

## 🔧 SETTINGS PATTERNS

### Auto-Save Pattern
```typescript
import { useAutoSave } from './hooks/useAutoSave';

const SettingsPage = () => {
  const { saveSettings, isSaving, lastSaved } = useAutoSave();

  const handleChange = (field: string, value: any) => {
    // Update local state
    setSettings(prev => ({ ...prev, [field]: value }));

    // Auto-save after 2 seconds
    saveSettings({ [field]: value });
  };

  return (
    <>
      <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
      {/* Settings form */}
    </>
  );
};
```

### Vertical Tabs Pattern (Settings Convention)
```typescript
import { Tabs } from '@/shared/ui';

const SettingsPage = () => {
  return (
    <Tabs orientation="vertical" variant="subtle">
      <TabList>
        <Tab>Business Profile</Tab>
        <Tab>Tax Configuration</Tab>
        <Tab>User Permissions</Tab>
        <Tab>System</Tab>
        <Tab>Enterprise</Tab>
        <Tab>Integrations</Tab>
      </TabList>
      <TabPanels>
        <TabPanel><BusinessProfileSection /></TabPanel>
        <TabPanel><TaxConfigurationSection /></TabPanel>
        {/* ... */}
      </TabPanels>
    </Tabs>
  );
};
```

### Validation Pattern
```typescript
import { z } from 'zod';

const businessProfileSchema = z.object({
  name: z.string().min(1, 'Business name required'),
  cuit: z.string().regex(/^\d{2}-\d{8}-\d{1}$/, 'Invalid CUIT format'),
  email: z.string().email('Invalid email'),
  // ...
});
```

---

## 📚 REFERENCE IMPLEMENTATIONS

**Settings Module Pattern**:
- Vertical tabs layout
- Auto-save functionality
- Form sections with validation
- Settings search
- Permission-based section visibility

---

## 🎯 SUCCESS CRITERIA

- [ ] 0 ESLint errors in settings module
- [ ] 0 TypeScript errors
- [ ] All 6 settings sections working
- [ ] Business profile CRUD working
- [ ] Tax configuration saving
- [ ] User permissions management working
- [ ] Auto-save functional
- [ ] Settings search working
- [ ] README with settings structure
- [ ] Permissions integrated (ADMINISTRADOR minimum)
- [ ] All 10 production-ready criteria met

---

**Estimated Time**: 4-5 hours
**Dependencies**: None (foundation)
**Security**: ADMINISTRADOR only
**Design Pattern**: Vertical tabs (Settings modules convention)
**Next Phase**: P1 (Supply Chain)
