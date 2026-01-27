# Unified Layout System Migration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrar de 6 layouts fragmentados (AdminLayout, CustomerLayout, ResponsiveLayout, MobileLayout, DesktopLayout, Layout) a un sistema unificado basado en el diseño de Magic Patterns, preservando TODA la funcionalidad existente.

**Architecture:** 
- Adoptar ContentLayout único de Magic Patterns como base responsive
- Extraer lógica de navegación/header a componentes wrapper reutilizables
- Eliminar layouts legacy sin romper ninguna página
- Diseño limpio: sin aliases, deprecated markers, o adapters

**Tech Stack:** React 19, TypeScript 5.8, Chakra UI v3, NavigationContext

---

## 📊 Análisis de Funcionalidad Actual

### Layout Hierarchy (ANTES)
```
App.tsx
  └─ AdminLayout/CustomerLayout
       └─ ResponsiveLayout
            ├─ Header (universal)
            ├─ MobileLayout (< 768px)
            │    ├─ BottomNavigation
            │    └─ FloatingActionButton
            └─ DesktopLayout (>= 768px)
                 ├─ Sidebar
                 ├─ Breadcrumb
                 └─ ActionToolbar
```

### Funcionalidad Crítica a Preservar

| Componente | Funcionalidad | Solución en Nuevo Sistema |
|------------|---------------|---------------------------|
| **AdminLayout** | headerActions: ConnectionStatus + NavAlertBadge | → Prop `headerActions` en AppShell |
| **CustomerLayout** | headerActions: ConnectionStatus + ShoppingCart + NavAlertBadge | → Prop `headerActions` en AppShell |
| **ResponsiveLayout** | Switching mobile/desktop automático | → AppShell con useBreakpoint hook |
| **ResponsiveLayout** | Header universal | → Header component integrado en AppShell |
| **MobileLayout** | BottomNavigation fija | → MobileNav component en AppShell |
| **MobileLayout** | FloatingActionButton | → FAB component en AppShell |
| **MobileLayout** | Padding: mt=60px, pb=90px | → AppShell maneja spacing |
| **DesktopLayout** | Sidebar colapsable | → DesktopNav component en AppShell |
| **DesktopLayout** | Breadcrumb + ActionToolbar | → DesktopNav component en AppShell |
| **DesktopLayout** | ml="3rem" para sidebar | → AppShell maneja spacing |
| **ContentLayout (actual)** | Semantic \u003cmain\u003e, spacing variants | → Merge con Magic Patterns version |
| **Layout** | Generic Box wrapper con variants | → **DEPRECATED** - usar Box directamente |

---

## 🎯 Nuevo Sistema Unificado

### New Layout Hierarchy (DESPUÉS)
```
App.tsx
  └─ AppShell (nuevo - reemplaza AdminLayout/CustomerLayout/ResponsiveLayout)
       ├─ Header (universal)
       ├─ Responsive Navigation (automático)
       │    ├─ MobileNav (< 768px) - BottomNavigation + FAB
       │    └─ DesktopNav (>= 768px) - Sidebar + Breadcrumb + ActionToolbar
       └─ ContentLayout (Magic Patterns version)
            └─ Page content
```

### Componentes a Crear

1. **AppShell.tsx** - Container maestro que reemplaza AdminLayout/CustomerLayout/ResponsiveLayout
2. **MobileNav.tsx** - Navegación móvil (BottomNavigation + FAB)
3. **DesktopNav.tsx** - Navegación desktop (Sidebar + Breadcrumb + ActionToolbar)
4. **ContentLayout.tsx** - Merge entre versión actual y Magic Patterns

### Componentes a Eliminar (después de migración)

- `src/layouts/AdminLayout.tsx` ❌
- `src/layouts/CustomerLayout.tsx` ❌
- `src/shared/layout/ResponsiveLayout.tsx` ❌
- `src/shared/layout/MobileLayout.tsx` ❌
- `src/shared/layout/DesktopLayout.tsx` ❌
- `src/shared/ui/Layout.tsx` ❌ (usar Box directamente)

---

## 📋 Implementation Tasks

### Phase 1: Create New Unified Components

#### Task 1.1: Create AppShell Component

**Files:**
- Create: `src/shared/layout/AppShell.tsx`

**Step 1: Create AppShell with Magic Patterns design**

```typescript
/**
 * AppShell - Unified Application Layout Container
 * 
 * Replaces: AdminLayout, CustomerLayout, ResponsiveLayout
 * 
 * Features:
 * - Responsive navigation (mobile/desktop automatic)
 * - Header with custom actions support
 * - Semantic HTML structure
 * - Magic Patterns design tokens
 */

import { Box, useBreakpointValue } from '@chakra-ui/react';
import { Header } from '@/shared/navigation/Header';
import { MobileNav } from './MobileNav';
import { DesktopNav } from './DesktopNav';
import type { ReactNode } from 'react';

export interface AppShellProps {
  children: ReactNode;
  
  /**
   * Custom actions to display in header (right side)
   * Example: ConnectionStatus, NavAlertBadge, ShoppingCart
   */
  headerActions?: ReactNode;
  
  /**
   * Variant determines which header actions to show
   * - admin: ConnectionStatus + NavAlertBadge
   * - customer: ConnectionStatus + ShoppingCart + NavAlertBadge
   */
  variant?: 'admin' | 'customer';
}

export function AppShell({ 
  children, 
  headerActions,
  variant = 'admin'
}: AppShellProps) {
  // Detect mobile/desktop automatically
  const isMobile = useBreakpointValue(
    { base: true, md: false },
    { fallback: 'md' }
  );

  return (
    <Box
      w="100%"
      minH="100vh"
      bg="bg.canvas"
      position="relative"
      display="flex"
      flexDirection="column"
    >
      {/* Universal Header */}
      <Header actions={headerActions} />

      {/* Responsive Navigation + Content */}
      {isMobile ? (
        <MobileNav>{children}</MobileNav>
      ) : (
        <DesktopNav>{children}</DesktopNav>
      )}
    </Box>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`  
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/layout/AppShell.tsx
git commit -m "feat(layout): create unified AppShell component"
```

---

#### Task 1.2: Create MobileNav Component

**Files:**
- Create: `src/shared/layout/MobileNav.tsx`

**Step 1: Extract mobile layout logic from MobileLayout.tsx**

```typescript
/**
 * MobileNav - Mobile Navigation Wrapper
 * 
 * Replaces: MobileLayout.tsx
 * 
 * Features:
 * - Bottom navigation (fixed)
 * - Floating action button
 * - Proper spacing for header (mt=60px) and bottom nav (pb=90px)
 * - Scroll behavior
 */

import { Box } from '@chakra-ui/react';
import { BottomNavigation } from '@/shared/navigation/BottomNavigation';
import { FloatingActionButton } from '@/shared/navigation/FloatingActionButton';
import type { ReactNode } from 'react';

export interface MobileNavProps {
  children: ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  return (
    <Box
      w="100%"
      minH="100vh"
      maxH="100vh"
      position="relative"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* Main content with scroll */}
      <Box
        as="main"
        flex="1"
        position="relative"
        mt="60px"        // Header height
        pb="90px"        // Bottom nav height
        overflow="auto"
        px="4"
        py="2"
        w="100%"
      >
        {children}
      </Box>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Bottom Navigation (fixed) */}
      <BottomNavigation />
    </Box>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`  
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/layout/MobileNav.tsx
git commit -m "feat(layout): create MobileNav component"
```

---

#### Task 1.3: Create DesktopNav Component

**Files:**
- Create: `src/shared/layout/DesktopNav.tsx`

**Step 1: Extract desktop layout logic from DesktopLayout.tsx**

```typescript
/**
 * DesktopNav - Desktop Navigation Wrapper
 * 
 * Replaces: DesktopLayout.tsx
 * 
 * Features:
 * - Collapsible sidebar
 * - Breadcrumb navigation
 * - Action toolbar (bottom)
 * - Proper spacing for header (mt=60px) and sidebar (ml=3rem)
 */

import { Box } from '@chakra-ui/react';
import { Sidebar } from '@/shared/navigation/Sidebar';
import { ActionToolbar } from '@/shared/navigation/ActionToolbar';
import type { ReactNode } from 'react';
import { memo } from 'react';

export interface DesktopNavProps {
  children: ReactNode;
}

export const DesktopNav = memo(function DesktopNav({ children }: DesktopNavProps) {
  return (
    <>
      {/* Sidebar (fixed position) */}
      <Sidebar />

      {/* Main content area */}
      <Box
        minH="100vh"
        mt="60px"                          // Header height
        ml={{ base: "0", md: "3rem" }}    // Sidebar width
      >
        {/* Content with padding */}
        <Box
          as="main"
          flex="1"
          px={{ base: "4", md: "6" }}
          py={{ base: "2", md: "4" }}
          overflow="visible"
          w="100%"
        >
          {children}
        </Box>

        {/* Action toolbar (fixed bottom) */}
        <ActionToolbar />
      </Box>
    </>
  );
});
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`  
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/layout/DesktopNav.tsx
git commit -m "feat(layout): create DesktopNav component"
```

---

#### Task 1.4: Merge ContentLayout (Magic Patterns + Current)

**Files:**
- Modify: `src/shared/ui/ContentLayout.tsx`

**Step 1: Backup current ContentLayout**

Run: `cp src/shared/ui/ContentLayout.tsx src/shared/ui/ContentLayout.tsx.backup`  
Expected: Backup created

**Step 2: Merge both versions - preserve best of both**

```typescript
/**
 * ContentLayout - Main Content Wrapper
 * 
 * UNIFIED VERSION (Magic Patterns + G-Admin Mini)
 * 
 * Features from Magic Patterns:
 * - Clean semantic structure
 * - Simple API
 * - Design tokens
 * 
 * Features from Current:
 * - Semantic <Main> component (Layer 3)
 * - ARIA labels
 * - Skip link support
 * - Rich spacing system (tight/compact/normal/loose)
 * 
 * @example
 * // Basic usage
 * <ContentLayout spacing="compact">
 *   <Section>Content</Section>
 * </ContentLayout>
 * 
 * @example
 * // With semantic label
 * <ContentLayout spacing="normal" mainLabel="Dashboard">
 *   <Section>Dashboard content</Section>
 * </ContentLayout>
 */

import { Stack } from './Stack';
import { Main } from './semantic/Main';
import type { ReactNode } from 'react';
import type { SpacingProp } from './types';

export interface ContentLayoutProps {
  /** Content to render */
  children: ReactNode;

  /**
   * Spacing preset
   * - tight: 16px gaps (dense dashboards)
   * - compact: 16px padding, 12px gaps (pages with header)
   * - normal: 32px gaps (default)
   * - spacious: 48px gaps (content-focused)
   */
  spacing?: 'tight' | 'compact' | 'normal' | 'spacious';

  /**
   * Max width of content container
   * Default: 1400px
   */
  maxW?: string;

  /** Custom padding override */
  padding?: SpacingProp;

  /** ARIA label for main content region */
  mainLabel?: string;

  /** ID for skip link target */
  skipLinkId?: string;

  /** Color palette for theming */
  colorPalette?: string;

  /** Additional className */
  className?: string;

  /** Other Chakra props */
  [key: string]: any;
}

export function ContentLayout({
  children,
  spacing = 'normal',
  maxW = '1400px',
  padding,
  mainLabel,
  skipLinkId,
  colorPalette,
  className,
  ...chakraProps
}: ContentLayoutProps) {
  // Spacing configuration (gap + padding)
  const spacingMap = {
    tight: { gap: '4', padding: '4' },      // 16px
    compact: { gap: '3', padding: '4' },    // 12px gap, 16px padding
    normal: { gap: '8', padding: '6' },     // 32px gap, 24px padding
    spacious: { gap: '12', padding: '8' }   // 48px gap, 32px padding
  };

  const config = spacingMap[spacing];
  const finalPadding = padding ?? config.padding;

  return (
    <Main
      label={mainLabel}
      skipLinkId={skipLinkId}
      width="full"
      minH="100vh"
      bg="bg.canvas"
      py={finalPadding}
      px={{ base: '4', md: '6', lg: '8' }}
      colorPalette={colorPalette}
      className={className}
      {...chakraProps}
    >
      <Stack gap={config.gap} align="stretch" maxW={maxW} mx="auto">
        {children}
      </Stack>
    </Main>
  );
}
```

**Step 3: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`  
Expected: No errors

**Step 4: Commit**

```bash
git add src/shared/ui/ContentLayout.tsx
git commit -m "refactor(layout): merge ContentLayout with Magic Patterns design"
```

---

### Phase 2: Create Wrapper Variants for Admin/Customer

#### Task 2.1: Create AdminShell Wrapper

**Files:**
- Create: `src/shared/layout/AdminShell.tsx`

**Step 1: Create wrapper that provides admin-specific header actions**

```typescript
/**
 * AdminShell - Admin Portal Layout Wrapper
 * 
 * Convenience wrapper around AppShell with admin-specific header actions
 * 
 * Replaces: AdminLayout
 */

import { Stack } from '@chakra-ui/react';
import { AppShell, type AppShellProps } from './AppShell';
import { NavAlertBadge } from '@/shared/alerts';
import { ConnectionStatus } from '@/lib/offline/OfflineMonitor';
import { useMemo, type ReactNode } from 'react';

export interface AdminShellProps {
  children: ReactNode;
  /** Additional header actions (will be added after default ones) */
  extraActions?: ReactNode;
}

export function AdminShell({ children, extraActions }: AdminShellProps) {
  const headerActions = useMemo(() => (
    <Stack direction="row" gap="4">
      <ConnectionStatus />
      <NavAlertBadge openNotificationCenter={true} />
      {extraActions}
    </Stack>
  ), [extraActions]);

  return (
    <AppShell variant="admin" headerActions={headerActions}>
      {children}
    </AppShell>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`  
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/layout/AdminShell.tsx
git commit -m "feat(layout): create AdminShell wrapper"
```

---

#### Task 2.2: Create CustomerShell Wrapper

**Files:**
- Create: `src/shared/layout/CustomerShell.tsx`

**Step 1: Create wrapper for customer portal**

```typescript
/**
 * CustomerShell - Customer Portal Layout Wrapper
 * 
 * Convenience wrapper around AppShell with customer-specific header actions
 * 
 * Replaces: CustomerLayout
 */

import { Stack } from '@chakra-ui/react';
import { AppShell } from './AppShell';
import { NavAlertBadge } from '@/shared/alerts';
import { ConnectionStatus } from '@/lib/offline/OfflineMonitor';
import { ShoppingCartHeaderIcon } from '@/modules/sales/ecommerce/components/ShoppingCartHeaderIcon';
import { useMemo, type ReactNode } from 'react';

export interface CustomerShellProps {
  children: ReactNode;
  /** Additional header actions */
  extraActions?: ReactNode;
}

export function CustomerShell({ children, extraActions }: CustomerShellProps) {
  const headerActions = useMemo(() => (
    <Stack direction="row" gap="4">
      <ConnectionStatus />
      <ShoppingCartHeaderIcon />
      <NavAlertBadge openNotificationCenter={true} />
      {extraActions}
    </Stack>
  ), [extraActions]);

  return (
    <AppShell variant="customer" headerActions={headerActions}>
      {children}
    </AppShell>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`  
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/layout/CustomerShell.tsx
git commit -m "feat(layout): create CustomerShell wrapper"
```

---

### Phase 3: Update Exports

#### Task 3.1: Update shared/layout/index.ts

**Files:**
- Create: `src/shared/layout/index.ts`

**Step 1: Create central export file for layouts**

```typescript
/**
 * Layout System Exports
 * 
 * Unified layout system based on Magic Patterns design
 */

// Core components
export { AppShell } from './AppShell';
export type { AppShellProps } from './AppShell';

export { MobileNav } from './MobileNav';
export type { MobileNavProps } from './MobileNav';

export { DesktopNav } from './DesktopNav';
export type { DesktopNavProps } from './DesktopNav';

// Convenience wrappers
export { AdminShell } from './AdminShell';
export type { AdminShellProps } from './AdminShell';

export { CustomerShell } from './CustomerShell';
export type { CustomerShellProps } from './CustomerShell';
```

**Step 2: Commit**

```bash
git add src/shared/layout/index.ts
git commit -m "feat(layout): add central exports file"
```

---

### Phase 4: Migration Testing

#### Task 4.1: Create Test Page with New Layout

**Files:**
- Create: `src/pages/debug/layout-test/page.tsx`

**Step 1: Create test page to verify new layout works**

```typescript
/**
 * Layout Migration Test Page
 * 
 * Tests the new unified layout system before full migration
 */

import { ContentLayout } from '@/shared/ui';
import { PageHeader } from '@/shared/ui';
import { Section } from '@/shared/ui';
import { Button, Stack, Text } from '@/shared/ui';

export default function LayoutTestPage() {
  return (
    <ContentLayout spacing="compact" mainLabel="Layout Test">
      <PageHeader 
        title="Layout Migration Test"
        subtitle="Testing new unified layout system"
      />

      <Section title="Test Section 1">
        <Stack gap="4">
          <Text>This page tests the new layout system.</Text>
          <Text>
            Current layout: AdminShell → AppShell → ContentLayout
          </Text>
        </Stack>
      </Section>

      <Section title="Test Section 2">
        <Stack gap="4">
          <Text>Spacing: compact (16px padding, 12px gaps)</Text>
          <Button colorPalette="blue">Test Button</Button>
        </Stack>
      </Section>

      <Section title="Responsive Test">
        <Text>
          Resize browser to test mobile/desktop navigation switch
        </Text>
      </Section>
    </ContentLayout>
  );
}
```

**Step 2: Add route to App.tsx**

```typescript
// In src/App.tsx, add test route
import LayoutTestPage from '@/pages/debug/layout-test/page';

// In routes:
<Route 
  path="/debug/layout-test" 
  element={
    <AdminShell>
      <LayoutTestPage />
    </AdminShell>
  } 
/>
```

**Step 3: Manual testing**

Run: `pnpm dev`  
Navigate to: `http://localhost:5173/debug/layout-test`  

Expected:
- ✅ Page renders without errors
- ✅ Header appears with ConnectionStatus + NavAlertBadge
- ✅ Mobile: Bottom navigation visible (< 768px)
- ✅ Desktop: Sidebar visible (>= 768px)
- ✅ Content has proper spacing
- ✅ No layout shift when resizing

**Step 4: Commit**

```bash
git add src/pages/debug/layout-test/page.tsx src/App.tsx
git commit -m "test(layout): add layout migration test page"
```

---

### Phase 5: Progressive Migration

#### Task 5.1: Migrate One Test Page (Sales)

**Files:**
- Modify: `src/App.tsx` (one route only)

**Step 1: Find sales route in App.tsx**

Current code (example):
```typescript
<Route 
  path="/admin/operations/sales" 
  element={
    <AdminLayout>
      <SalesPage />
    </AdminLayout>
  } 
/>
```

New code:
```typescript
<Route 
  path="/admin/operations/sales" 
  element={
    <AdminShell>
      <SalesPage />
    </AdminShell>
  } 
/>
```

**Step 2: Update import**

Remove:
```typescript
import { AdminLayout } from '@/layouts/AdminLayout';
```

Add:
```typescript
import { AdminShell } from '@/shared/layout';
```

**Step 3: Manual testing**

Run: `pnpm dev`  
Navigate to: `/admin/operations/sales`

Expected:
- ✅ Page renders correctly
- ✅ No visual regression
- ✅ Navigation works
- ✅ Header actions present
- ✅ Responsive behavior works

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "refactor(layout): migrate sales page to new layout system"
```

---

#### Task 5.2: Create Migration Script

**Files:**
- Create: `scripts/migrate-layouts.ts`

**Step 1: Create script to migrate all routes**

```typescript
/**
 * Layout Migration Script
 * 
 * Automatically replaces AdminLayout/CustomerLayout with AdminShell/CustomerShell
 * in App.tsx
 */

import * as fs from 'fs';
import * as path from 'path';

const APP_FILE = path.join(__dirname, '../src/App.tsx');

function migrateLayouts() {
  console.log('🔄 Migrating layouts in App.tsx...');

  let content = fs.readFileSync(APP_FILE, 'utf-8');
  let changes = 0;

  // Replace imports
  if (content.includes("from '@/layouts/AdminLayout'")) {
    content = content.replace(
      "import { AdminLayout } from '@/layouts/AdminLayout';",
      "import { AdminShell } from '@/shared/layout';"
    );
    changes++;
  }

  if (content.includes("from '@/layouts/CustomerLayout'")) {
    content = content.replace(
      "import { CustomerLayout } from '@/layouts/CustomerLayout';",
      "import { CustomerShell } from '@/shared/layout';"
    );
    changes++;
  }

  // Replace component usage
  const adminLayoutRegex = /<AdminLayout>/g;
  const adminLayoutCloseRegex = /<\/AdminLayout>/g;
  const customerLayoutRegex = /<CustomerLayout>/g;
  const customerLayoutCloseRegex = /<\/CustomerLayout>/g;

  content = content.replace(adminLayoutRegex, '<AdminShell>');
  content = content.replace(adminLayoutCloseRegex, '</AdminShell>');
  content = content.replace(customerLayoutRegex, '<CustomerShell>');
  content = content.replace(customerLayoutCloseRegex, '</CustomerShell>');

  changes += (content.match(/<AdminShell>/g) || []).length;
  changes += (content.match(/<CustomerShell>/g) || []).length;

  // Write back
  fs.writeFileSync(APP_FILE, content, 'utf-8');

  console.log(`✅ Migration complete! ${changes} changes made.`);
  console.log('📝 Next: Review changes in App.tsx and test all routes');
}

migrateLayouts();
```

**Step 2: Add script to package.json**

```json
{
  "scripts": {
    "migrate-layouts": "ts-node scripts/migrate-layouts.ts"
  }
}
```

**Step 3: Run migration script**

Run: `pnpm migrate-layouts`  
Expected: All AdminLayout → AdminShell, CustomerLayout → CustomerShell

**Step 4: Review changes**

Run: `git diff src/App.tsx`  
Expected: Clean replacements, no accidental changes

**Step 5: Test multiple routes**

Manual testing:
- `/admin/operations/sales` ✅
- `/admin/supply-chain/materials` ✅
- `/admin/core/dashboard` ✅
- `/customer/*` routes ✅

**Step 6: Commit**

```bash
git add scripts/migrate-layouts.ts package.json src/App.tsx
git commit -m "refactor(layout): migrate all routes to new layout system"
```

---

### Phase 6: Cleanup Legacy Files

#### Task 6.1: Mark Legacy Files as Deprecated

**Files:**
- Modify: `src/layouts/AdminLayout.tsx`
- Modify: `src/layouts/CustomerLayout.tsx`
- Modify: `src/shared/layout/ResponsiveLayout.tsx`
- Modify: `src/shared/layout/MobileLayout.tsx`
- Modify: `src/shared/layout/DesktopLayout.tsx`
- Modify: `src/shared/ui/Layout.tsx`

**Step 1: Add deprecation warnings (temporary)**

At top of each file:
```typescript
/**
 * @deprecated This file is deprecated and will be removed.
 * Use AdminShell from '@/shared/layout' instead.
 * 
 * Migration: AdminLayout → AdminShell
 * See: docs/plans/2026-01-22-unified-layout-migration.md
 */

console.warn(
  '[DEPRECATED] AdminLayout is deprecated. Use AdminShell instead.'
);
```

**Step 2: Commit deprecation warnings**

```bash
git add src/layouts/*.tsx src/shared/layout/*.tsx src/shared/ui/Layout.tsx
git commit -m "chore(layout): mark legacy layout files as deprecated"
```

---

#### Task 6.2: Verify No Remaining Usage

**Files:**
- None (verification only)

**Step 1: Search for legacy imports**

Run: `rg "from '@/layouts/AdminLayout'" src/`  
Expected: No matches (except deprecated file itself)

Run: `rg "from '@/layouts/CustomerLayout'" src/`  
Expected: No matches

Run: `rg "from '@/shared/layout/ResponsiveLayout'" src/`  
Expected: No matches (except MobileNav/DesktopNav)

Run: `rg "from '@/shared/ui/Layout'" src/`  
Expected: No matches or minimal usage

**Step 2: TypeScript check**

Run: `pnpm tsc --noEmit`  
Expected: No errors

**Step 3: Run full test suite**

Run: `pnpm test`  
Expected: All tests pass

**Step 4: Document verification**

```bash
echo "✅ Verification complete" > docs/layout-migration-verification.txt
git add docs/layout-migration-verification.txt
git commit -m "docs(layout): verify legacy layout removal safety"
```

---

#### Task 6.3: Delete Legacy Layout Files

**Files:**
- Delete: `src/layouts/AdminLayout.tsx`
- Delete: `src/layouts/CustomerLayout.tsx`
- Delete: `src/shared/layout/ResponsiveLayout.tsx`
- Delete: `src/shared/layout/MobileLayout.tsx`
- Delete: `src/shared/layout/DesktopLayout.tsx`
- Delete: `src/shared/ui/Layout.tsx`

**Step 1: Delete files**

```bash
rm src/layouts/AdminLayout.tsx
rm src/layouts/CustomerLayout.tsx
rm src/shared/layout/ResponsiveLayout.tsx
rm src/shared/layout/MobileLayout.tsx
rm src/shared/layout/DesktopLayout.tsx
rm src/shared/ui/Layout.tsx
```

**Step 2: Delete empty directories if needed**

```bash
# Only if layouts/ directory is now empty
rmdir src/layouts 2>/dev/null || true
```

**Step 3: Verify TypeScript still compiles**

Run: `pnpm tsc --noEmit`  
Expected: No errors

**Step 4: Run tests**

Run: `pnpm test`  
Expected: All pass

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore(layout): remove legacy layout files - migration complete"
```

---

### Phase 7: Documentation & Rollout

#### Task 7.1: Update Layout Documentation

**Files:**
- Create: `docs/design-system/layout-guide.md`

**Step 1: Create comprehensive layout guide**

```markdown
# Layout System Guide

## Overview

G-Admin Mini uses a unified layout system based on Magic Patterns design principles.

## Architecture

### AppShell - Core Container

`AppShell` is the master layout component that handles:
- Responsive navigation (mobile/desktop automatic)
- Header with custom actions
- Semantic HTML structure

### Convenience Wrappers

**AdminShell** - For admin portal pages
**CustomerShell** - For customer portal pages

Both are thin wrappers around `AppShell` with pre-configured header actions.

### ContentLayout - Page Content Wrapper

Every page uses `ContentLayout` to wrap its content:

\`\`\`typescript
<AdminShell>
  <ContentLayout spacing="compact">
    <PageHeader title="My Page" />
    <Section>Content</Section>
  </ContentLayout>
</AdminShell>
\`\`\`

## Migration from Legacy

| Old | New |
|-----|-----|
| `AdminLayout` | `AdminShell` |
| `CustomerLayout` | `CustomerShell` |
| `ResponsiveLayout` | `AppShell` |
| `MobileLayout` | `MobileNav` (internal) |
| `DesktopLayout` | `DesktopNav` (internal) |
| `Layout` | Use `Box` directly |

## Spacing System

ContentLayout supports 4 spacing presets:

- **tight**: 16px (dense dashboards)
- **compact**: 16px padding, 12px gaps (pages with header)
- **normal**: 32px gaps (default)
- **spacious**: 48px gaps (content-focused pages)

## Examples

### Admin Page
\`\`\`typescript
import { AdminShell } from '@/shared/layout';
import { ContentLayout, PageHeader, Section } from '@/shared/ui';

export default function MyPage() {
  return (
    <AdminShell>
      <ContentLayout spacing="compact">
        <PageHeader title="My Page" />
        <Section>Content</Section>
      </ContentLayout>
    </AdminShell>
  );
}
\`\`\`

### Customer Page
\`\`\`typescript
import { CustomerShell } from '@/shared/layout';

export default function StorePage() {
  return (
    <CustomerShell>
      <ContentLayout spacing="normal">
        <Section>Store content</Section>
      </ContentLayout>
    </CustomerShell>
  );
}
\`\`\`
```

**Step 2: Commit documentation**

```bash
git add docs/design-system/layout-guide.md
git commit -m "docs(layout): add unified layout system guide"
```

---

#### Task 7.2: Update AGENTS.md

**Files:**
- Modify: `AGENTS.md`

**Step 1: Add layout system reference**

In the "Quick Reference" section, add:

```markdown
## Layout System

ALL pages must use the unified layout:

\`\`\`tsx
// ✅ CORRECT - Admin pages
import { AdminShell } from '@/shared/layout';
import { ContentLayout } from '@/shared/ui';

<AdminShell>
  <ContentLayout spacing="compact">
    <PageContent />
  </ContentLayout>
</AdminShell>

// ✅ CORRECT - Customer pages
import { CustomerShell } from '@/shared/layout';

<CustomerShell>
  <ContentLayout spacing="normal">
    <PageContent />
  </ContentLayout>
</CustomerShell>

// ❌ WRONG - Do NOT use legacy layouts
import { AdminLayout } from '@/layouts/AdminLayout'; // DELETED
\`\`\`
```

**Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md with new layout system"
```

---

## ✅ Completion Checklist

### Phase 1: New Components
- [ ] AppShell.tsx created
- [ ] MobileNav.tsx created
- [ ] DesktopNav.tsx created
- [ ] ContentLayout.tsx merged

### Phase 2: Wrappers
- [ ] AdminShell.tsx created
- [ ] CustomerShell.tsx created

### Phase 3: Exports
- [ ] shared/layout/index.ts created

### Phase 4: Testing
- [ ] Test page created
- [ ] Manual testing passed
- [ ] No visual regressions

### Phase 5: Migration
- [ ] One route migrated successfully
- [ ] Migration script created
- [ ] All routes migrated
- [ ] All routes tested

### Phase 6: Cleanup
- [ ] Legacy files marked deprecated
- [ ] No remaining usage verified
- [ ] TypeScript compiles
- [ ] Tests pass
- [ ] Legacy files deleted

### Phase 7: Documentation
- [ ] Layout guide created
- [ ] AGENTS.md updated
- [ ] Migration plan documented

---

## 🎯 Success Criteria

✅ All 100+ routes in App.tsx migrated to new layout  
✅ Zero visual regressions  
✅ All functionality preserved (header actions, navigation, spacing)  
✅ TypeScript compiles with no errors  
✅ All tests pass  
✅ Legacy files deleted  
✅ Clean, maintainable codebase with Magic Patterns design

---

## 📊 Estimated Timeline

| Phase | Tasks | Time |
|-------|-------|------|
| 1. New Components | 4 tasks | 2 hours |
| 2. Wrappers | 2 tasks | 30 min |
| 3. Exports | 1 task | 15 min |
| 4. Testing | 1 task | 30 min |
| 5. Migration | 2 tasks | 1 hour |
| 6. Cleanup | 3 tasks | 1 hour |
| 7. Documentation | 2 tasks | 30 min |
| **TOTAL** | **15 tasks** | **~6 hours** |

---

**Last Updated**: 2026-01-22  
**Author**: G-Admin Mini Team  
**Status**: Ready for execution
