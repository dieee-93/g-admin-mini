# Unified Layout System Migration Plan (v3 - ULTRA SIMPLIFIED)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate 6 layout files into 1 unified `AppShell.tsx`, fully aligned with Magic Patterns design + industry standards (Strapi, React Admin pattern).

**Architecture:** Create a single `AppShell.tsx` (~100 lines) that handles:
- Header with custom actions (admin vs customer)
- Mobile navigation (BottomNav + FAB) 
- Desktop navigation (Sidebar + ActionToolbar)
- Responsive switching via `useBreakpointValue`
- All in ONE file, NO separate MobileLayout/DesktopLayout

**Tech Stack:** React 19, TypeScript 5.8, Chakra UI v3, NavigationContext

---

## 🔍 Key Insight from Magic Patterns

**Magic Patterns ContentLayout does NOT have navigation** - it's just a content wrapper.

**Why?** Magic Patterns is a landing page with NO Header/Sidebar/BottomNav.

**G-Admin Mini needs navigation**, so we follow **Strapi pattern**: single layout file with responsive navigation inside.

---

## 📊 Current vs Final Architecture

### BEFORE (6 files - ❌)
```
src/layouts/AdminLayout.tsx (24 lines)
  └─ ResponsiveLayout.tsx (56 lines)
       ├─ MobileLayout.tsx (51 lines) - BottomNav + FAB
       └─ DesktopLayout.tsx (51 lines) - Sidebar + ActionToolbar
src/layouts/CustomerLayout.tsx (26 lines)
src/shared/ui/Layout.tsx (125 lines - generic wrapper)

Total: 6 files, ~333 lines, 3 layers of wrappers
```

### AFTER (1 file - ✅)
```
src/shared/layout/AppShell.tsx (~100 lines)
  - Header with custom actions
  - Mobile: BottomNavigation + FAB
  - Desktop: Sidebar + ActionToolbar
  - Responsive: useBreakpointValue

Total: 1 file, ~100 lines, 1 layer
```

**Reduction**: 6 files → 1 file (83% fewer files), 333 lines → 100 lines (70% less code)

---

## 📋 Implementation Tasks

### Phase 1: Create Unified AppShell

#### Task 1.1: Create AppShell.tsx (Single File Solution)

**Files:**
- Create: `src/shared/layout/AppShell.tsx`

**Step 1: Create unified AppShell with all navigation logic**

```typescript
/**
 * AppShell - Unified Application Layout
 * 
 * Single-file solution for all application layouts.
 * Replaces: AdminLayout, CustomerLayout, ResponsiveLayout, MobileLayout, DesktopLayout
 * 
 * Features:
 * - Header with custom actions (role-based)
 * - Mobile navigation (< 768px): BottomNavigation + FAB
 * - Desktop navigation (>= 768px): Sidebar + ActionToolbar
 * - Responsive switching via useBreakpointValue
 * - Performance optimized (memoization)
 * 
 * Industry Alignment: Strapi AuthenticatedLayout pattern
 */

import { Box } from '@chakra-ui/react';
import { useBreakpointValue } from '@chakra-ui/react';
import { Header } from '@/shared/navigation/Header';
import { Sidebar } from '@/shared/navigation/Sidebar';
import { BottomNavigation } from '@/shared/navigation/BottomNavigation';
import { FloatingActionButton } from '@/shared/navigation/FloatingActionButton';
import { ActionToolbar } from '@/shared/navigation/ActionToolbar';
import { memo, type ReactNode } from 'react';

export interface AppShellProps {
  /** Page content */
  children: ReactNode;
  
  /**
   * Custom header actions (right side of header)
   * Examples:
   * - Admin: <ConnectionStatus /> + <NavAlertBadge />
   * - Customer: <ConnectionStatus /> + <ShoppingCart /> + <NavAlertBadge />
   */
  headerActions?: ReactNode;
}

/**
 * AppShell - Main application container
 * 
 * @example Admin Portal
 * <AppShell headerActions={<AdminHeaderActions />}>
 *   <SalesPage />
 * </AppShell>
 * 
 * @example Customer Portal
 * <AppShell headerActions={<CustomerHeaderActions />}>
 *   <StorePage />
 * </AppShell>
 */
export const AppShell = memo(function AppShell({ 
  children, 
  headerActions 
}: AppShellProps) {
  // Detect mobile/desktop automatically
  const isMobile = useBreakpointValue(
    { base: true, md: false },
    { fallback: 'md' }
  );

  return (
    <Box w="100%" minH="100vh" bg="bg.canvas" position="relative">
      {/* ✅ Universal Header */}
      <Header actions={headerActions} />

      {/* ✅ Responsive Navigation */}
      {isMobile ? (
        <>
          {/* Mobile: Bottom nav + FAB */}
          <FloatingActionButton />
          <BottomNavigation />
        </>
      ) : (
        <>
          {/* Desktop: Sidebar + Toolbar */}
          <Sidebar />
          <ActionToolbar />
        </>
      )}

      {/* ✅ Main Content - Responsive spacing */}
      <Box
        as="main"
        mt="60px"                                    // Header height
        ml={isMobile ? "0" : { base: "0", md: "3rem" }}  // Sidebar width (desktop only)
        pb={isMobile ? "90px" : "0"}                // Bottom nav height (mobile only)
        px={isMobile ? "4" : { base: "4", md: "6" }}
        py={isMobile ? "2" : { base: "2", md: "4" }}
        overflow={isMobile ? "auto" : "visible"}
        minH="calc(100vh - 60px)"
        w="100%"
      >
        {children}
      </Box>
    </Box>
  );
});
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`  
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/layout/AppShell.tsx
git commit -m "feat(layout): create unified AppShell component - single file solution"
```

---

### Phase 2: Create Convenience Components for Header Actions

#### Task 2.1: Create AdminHeaderActions Component

**Files:**
- Create: `src/shared/layout/AdminHeaderActions.tsx`

**Step 1: Extract admin header actions to reusable component**

```typescript
/**
 * AdminHeaderActions - Header actions for Admin Portal
 * 
 * Provides: ConnectionStatus + NavAlertBadge
 */

import { Stack } from '@chakra-ui/react';
import { NavAlertBadge } from '@/shared/alerts';
import { ConnectionStatus } from '@/lib/offline/OfflineMonitor';
import { memo } from 'react';

export const AdminHeaderActions = memo(function AdminHeaderActions() {
  return (
    <Stack direction="row" gap="4">
      <ConnectionStatus />
      <NavAlertBadge openNotificationCenter={true} />
    </Stack>
  );
});
```

**Step 2: Commit**

```bash
git add src/shared/layout/AdminHeaderActions.tsx
git commit -m "feat(layout): create AdminHeaderActions component"
```

---

#### Task 2.2: Create CustomerHeaderActions Component

**Files:**
- Create: `src/shared/layout/CustomerHeaderActions.tsx`

**Step 1: Extract customer header actions**

```typescript
/**
 * CustomerHeaderActions - Header actions for Customer Portal
 * 
 * Provides: ConnectionStatus + ShoppingCart + NavAlertBadge
 */

import { Stack } from '@chakra-ui/react';
import { NavAlertBadge } from '@/shared/alerts';
import { ConnectionStatus } from '@/lib/offline/OfflineMonitor';
import { ShoppingCartHeaderIcon } from '@/modules/sales/ecommerce/components/ShoppingCartHeaderIcon';
import { memo } from 'react';

export const CustomerHeaderActions = memo(function CustomerHeaderActions() {
  return (
    <Stack direction="row" gap="4">
      <ConnectionStatus />
      <ShoppingCartHeaderIcon />
      <NavAlertBadge openNotificationCenter={true} />
    </Stack>
  );
});
```

**Step 2: Commit**

```bash
git add src/shared/layout/CustomerHeaderActions.tsx
git commit -m "feat(layout): create CustomerHeaderActions component"
```

---

### Phase 3: Update Exports

#### Task 3.1: Create Central Export Index

**Files:**
- Create: `src/shared/layout/index.ts`

**Step 1: Export all layout components**

```typescript
/**
 * Layout System Exports
 * 
 * Unified layout system - single AppShell for all portals
 */

// Main shell
export { AppShell } from './AppShell';
export type { AppShellProps } from './AppShell';

// Header actions (convenience)
export { AdminHeaderActions } from './AdminHeaderActions';
export { CustomerHeaderActions } from './CustomerHeaderActions';
```

**Step 2: Commit**

```bash
git add src/shared/layout/index.ts
git commit -m "feat(layout): add central exports for layout system"
```

---

### Phase 4: Simplify ContentLayout

#### Task 4.1: Align ContentLayout with Magic Patterns

**Files:**
- Modify: `src/shared/ui/ContentLayout.tsx`

**Step 1: Backup current file**

```bash
cp src/shared/ui/ContentLayout.tsx src/shared/ui/ContentLayout.tsx.backup
```

**Step 2: Simplify to Magic Patterns style**

```typescript
/**
 * ContentLayout - Page Content Wrapper
 * 
 * Aligned with Magic Patterns design - simple content wrapper
 * 
 * Features:
 * - Semantic <main> element (if not already in AppShell)
 * - Spacing presets (tight/compact/normal/spacious)
 * - Responsive padding
 * - Max width container
 * 
 * @example
 * <ContentLayout spacing="compact">
 *   <PageHeader title="My Page" />
 *   <Section>Content</Section>
 * </ContentLayout>
 */

import { Box, Stack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface ContentLayoutProps {
  /** Content to render */
  children: ReactNode;

  /**
   * Spacing preset
   * - tight: 16px gaps (dense dashboards)
   * - compact: 12px gaps, 16px padding (pages with header) ← Most common
   * - normal: 32px gaps, 24px padding (default)
   * - spacious: 48px gaps, 32px padding (content-focused)
   */
  spacing?: 'tight' | 'compact' | 'normal' | 'spacious';

  /**
   * Max width of content container
   * Default: 1400px
   */
  maxW?: string;
}

const SPACING_MAP = {
  tight: { gap: '4', padding: '4' },      // 16px
  compact: { gap: '3', padding: '4' },    // 12px gap, 16px padding
  normal: { gap: '8', padding: '6' },     // 32px gap, 24px padding
  spacious: { gap: '12', padding: '8' }   // 48px gap, 32px padding
} as const;

export function ContentLayout({
  children,
  spacing = 'normal',
  maxW = '1400px'
}: ContentLayoutProps) {
  const config = SPACING_MAP[spacing];

  return (
    <Stack gap={config.gap} maxW={maxW} mx="auto" py={config.padding}>
      {children}
    </Stack>
  );
}
```

**Step 3: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`  
Expected: No errors (might have errors in pages using old ContentLayout props - we'll fix in testing)

**Step 4: Commit**

```bash
git add src/shared/ui/ContentLayout.tsx
git commit -m "refactor(layout): simplify ContentLayout to Magic Patterns style"
```

---

### Phase 5: Migrate App.tsx

#### Task 5.1: Update All Routes to Use New Layout

**Files:**
- Modify: `src/App.tsx`

**Step 1: Update imports**

Replace:
```typescript
// OLD
import { AdminLayout } from '@/layouts/AdminLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';

// NEW
import { AppShell, AdminHeaderActions, CustomerHeaderActions } from '@/shared/layout';
```

**Step 2: Create migration script for routes**

Create: `scripts/migrate-app-routes.ts`

```typescript
/**
 * App.tsx Route Migration Script
 * 
 * Automatically replaces AdminLayout/CustomerLayout with AppShell
 */

import * as fs from 'fs';
import * as path from 'path';

const APP_FILE = path.join(__dirname, '../src/App.tsx');

function migrateRoutes() {
  console.log('🔄 Migrating routes in App.tsx...');

  let content = fs.readFileSync(APP_FILE, 'utf-8');
  let changes = 0;

  // Replace imports
  content = content.replace(
    /import\s*{\s*AdminLayout\s*}\s*from\s*['"]@\/layouts\/AdminLayout['"]/g,
    "import { AppShell, AdminHeaderActions } from '@/shared/layout'"
  );

  content = content.replace(
    /import\s*{\s*CustomerLayout\s*}\s*from\s*['"]@\/layouts\/CustomerLayout['"]/g,
    "import { CustomerHeaderActions } from '@/shared/layout'"
  );

  // Replace AdminLayout usage
  const adminLayoutRegex = /<AdminLayout>/g;
  const adminLayoutCloseRegex = /<\/AdminLayout>/g;

  content = content.replace(
    adminLayoutRegex,
    '<AppShell headerActions={<AdminHeaderActions />}>'
  );
  content = content.replace(adminLayoutCloseRegex, '</AppShell>');
  changes += (content.match(/<AppShell/g) || []).length;

  // Replace CustomerLayout usage
  const customerLayoutRegex = /<CustomerLayout>/g;
  const customerLayoutCloseRegex = /<\/CustomerLayout>/g;

  content = content.replace(
    customerLayoutRegex,
    '<AppShell headerActions={<CustomerHeaderActions />}>'
  );
  content = content.replace(customerLayoutCloseRegex, '</AppShell>');

  // Write back
  fs.writeFileSync(APP_FILE, content, 'utf-8');

  console.log(`✅ Migration complete! ${changes} routes updated.`);
  console.log('📝 Next: Review changes in App.tsx with git diff');
}

migrateRoutes();
```

**Step 3: Run migration script**

```bash
pnpm tsx scripts/migrate-app-routes.ts
```

Expected: Output showing number of routes migrated

**Step 4: Review changes**

```bash
git diff src/App.tsx
```

Expected: Clean replacements from AdminLayout/CustomerLayout to AppShell

**Step 5: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`  
Expected: No errors

**Step 6: Commit**

```bash
git add src/App.tsx scripts/migrate-app-routes.ts
git commit -m "refactor(layout): migrate all routes to AppShell"
```

---

### Phase 6: Testing

#### Task 6.1: Create Test Page

**Files:**
- Create: `src/pages/debug/layout-test/page.tsx`

**Step 1: Create comprehensive test page**

```typescript
/**
 * Layout System Test Page
 * 
 * Tests the new unified AppShell before full deployment
 */

import { ContentLayout } from '@/shared/ui';
import { PageHeader } from '@/shared/ui';
import { Section } from '@/shared/ui';
import { Button, Stack, Text, Heading, Box } from '@/shared/ui';

export default function LayoutTestPage() {
  return (
    <ContentLayout spacing="compact">
      <PageHeader 
        title="🧪 Layout System Test"
        subtitle="Testing unified AppShell - single file solution"
      />

      <Section title="Architecture">
        <Stack gap="3">
          <Text fontSize="sm" color="gray.600">
            <strong>Current Layout:</strong> AppShell (100 lines - unified)
          </Text>
          <Text fontSize="sm" color="gray.600">
            <strong>Previous:</strong> 6 separate files (333 lines total)
          </Text>
          <Text fontSize="sm" color="gray.600">
            <strong>Reduction:</strong> 83% fewer files, 70% less code
          </Text>
        </Stack>
      </Section>

      <Section title="Responsive Test">
        <Stack gap="4">
          <Text>Resize browser window to test responsive behavior:</Text>
          <Box bg="blue.50" p="4" borderRadius="md">
            <Text fontSize="sm">
              <strong>Mobile (&lt; 768px):</strong> Bottom navigation + FAB should be visible
            </Text>
          </Box>
          <Box bg="purple.50" p="4" borderRadius="md">
            <Text fontSize="sm">
              <strong>Desktop (≥ 768px):</strong> Sidebar + ActionToolbar should be visible
            </Text>
          </Box>
        </Stack>
      </Section>

      <Section title="Manual Checklist">
        <Stack gap="2" fontSize="sm">
          <Text>✅ Header visible with custom actions</Text>
          <Text>✅ Mobile: Bottom nav appears below</Text>
          <Text>✅ Mobile: FAB appears bottom-right</Text>
          <Text>✅ Desktop: Sidebar appears on left</Text>
          <Text>✅ Desktop: Content has left margin (ml=3rem)</Text>
          <Text>✅ No layout shift when resizing</Text>
          <Text>✅ No console errors</Text>
          <Text>✅ Spacing is consistent</Text>
        </Stack>
      </Section>

      <Section title="Spacing Test">
        <Stack gap="4">
          <Text>Current spacing: <strong>compact</strong> (12px gaps, 16px padding)</Text>
          <Button colorPalette="blue">Primary Action</Button>
          <Button colorPalette="green" variant="outline">Secondary Action</Button>
        </Stack>
      </Section>
    </ContentLayout>
  );
}
```

**Step 2: Add route in App.tsx**

In `src/App.tsx`, add test route:

```typescript
import LayoutTestPage from '@/pages/debug/layout-test/page';

// Inside routes:
<Route 
  path="/debug/layout-test" 
  element={
    <AppShell headerActions={<AdminHeaderActions />}>
      <LayoutTestPage />
    </AppShell>
  } 
/>
```

**Step 3: Manual testing**

Run: `pnpm dev`  
Navigate to: `http://localhost:5173/debug/layout-test`

**Test Checklist:**
- [ ] Page renders without errors
- [ ] Header appears with ConnectionStatus + NavAlertBadge
- [ ] Mobile (&lt; 768px): Bottom navigation visible
- [ ] Mobile (&lt; 768px): FAB visible bottom-right
- [ ] Desktop (≥ 768px): Sidebar visible on left
- [ ] Desktop (≥ 768px): Content has proper left margin
- [ ] Resize browser: Navigation switches smoothly (no layout shift)
- [ ] No console errors
- [ ] Spacing is consistent

**Step 4: Test production pages**

Navigate to these pages and verify they work:
- `/admin/core/dashboard`
- `/admin/operations/sales`
- `/admin/supply-chain/materials`

Expected: All pages render correctly, no regressions

**Step 5: Commit**

```bash
git add src/pages/debug/layout-test/page.tsx
git commit -m "test(layout): add comprehensive layout test page"
```

---

### Phase 7: Delete Legacy Files

#### Task 7.1: Delete All Legacy Layout Files

**Files:**
- Delete: `src/layouts/AdminLayout.tsx`
- Delete: `src/layouts/CustomerLayout.tsx`
- Delete: `src/shared/layout/ResponsiveLayout.tsx`
- Delete: `src/shared/layout/MobileLayout.tsx`
- Delete: `src/shared/layout/DesktopLayout.tsx`
- Delete: `src/shared/ui/Layout.tsx`

**Step 1: Verify no remaining imports**

```bash
rg "from '@/layouts/AdminLayout'" src/
rg "from '@/layouts/CustomerLayout'" src/
rg "from '@/shared/layout/ResponsiveLayout'" src/
rg "from '@/shared/layout/MobileLayout'" src/
rg "from '@/shared/layout/DesktopLayout'" src/
rg "from '@/shared/ui/Layout'" src/ --type ts --type tsx
```

Expected: No matches (all imports should be to new AppShell)

**Step 2: Delete legacy files**

```bash
rm src/layouts/AdminLayout.tsx
rm src/layouts/CustomerLayout.tsx
rm src/shared/layout/ResponsiveLayout.tsx
rm src/shared/layout/MobileLayout.tsx
rm src/shared/layout/DesktopLayout.tsx
rm src/shared/ui/Layout.tsx
rmdir src/layouts
```

**Step 3: Update shared/ui/index.ts (remove Layout export)**

Remove this line if it exists:
```typescript
export { Layout } from './Layout';  // DELETE
```

**Step 4: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`  
Expected: No errors

**Step 5: Run tests**

Run: `pnpm test`  
Expected: All tests pass

**Step 6: Commit**

```bash
git add -A
git commit -m "chore(layout): delete legacy layout files - migration complete 🎉"
```

---

### Phase 8: Documentation

#### Task 8.1: Create Layout Guide

**Files:**
- Create: `docs/design-system/layout-guide.md`

**Step 1: Create comprehensive guide**

```markdown
# Layout System Guide

## Overview

G-Admin Mini uses a **unified layout system** with a single `AppShell` component.

**Industry Alignment**: Strapi AuthenticatedLayout pattern, React Admin Layout pattern

---

## Architecture

### Single File Solution

```
src/shared/layout/
├── AppShell.tsx              # ~100 lines - ALL navigation logic
├── AdminHeaderActions.tsx    # Header actions for admin
├── CustomerHeaderActions.tsx # Header actions for customer
└── index.ts                  # Exports
```

**AppShell** handles everything:
- Header with custom actions
- Mobile navigation (BottomNavigation + FAB)
- Desktop navigation (Sidebar + ActionToolbar)
- Responsive switching (< 768px = mobile, >= 768px = desktop)

---

## Usage

### Admin Portal Route

\`\`\`typescript
import { AppShell, AdminHeaderActions } from '@/shared/layout';
import SalesPage from '@/pages/admin/operations/sales/page';

<Route 
  path="/admin/sales" 
  element={
    <AppShell headerActions={<AdminHeaderActions />}>
      <SalesPage />
    </AppShell>
  } 
/>
\`\`\`

### Customer Portal Route

\`\`\`typescript
import { AppShell, CustomerHeaderActions } from '@/shared/layout';
import StorePage from '@/pages/customer/store/page';

<Route 
  path="/customer/store" 
  element={
    <AppShell headerActions={<CustomerHeaderActions />}>
      <StorePage />
    </AppShell>
  } 
/>
\`\`\`

### Page Content

Every page uses `ContentLayout` for consistent spacing:

\`\`\`typescript
import { ContentLayout, PageHeader, Section } from '@/shared/ui';

export default function MyPage() {
  return (
    <ContentLayout spacing="compact">
      <PageHeader title="My Page" />
      <Section>
        {/* page content */}
      </Section>
    </ContentLayout>
  );
}
\`\`\`

---

## Responsive Behavior

AppShell automatically switches navigation based on viewport:

| Breakpoint | Navigation |
|------------|------------|
| **< 768px (Mobile)** | Bottom navigation + FAB |
| **≥ 768px (Desktop)** | Sidebar + ActionToolbar |

**Implementation**: `useBreakpointValue({ base: true, md: false })`

---

## Spacing System

ContentLayout provides 4 spacing presets:

- **tight**: 16px gaps (dense dashboards)
- **compact**: 12px gaps, 16px padding ← **Most common**
- **normal**: 32px gaps, 24px padding (default)
- **spacious**: 48px gaps, 32px padding (content-focused)

---

## Custom Header Actions

Create custom header actions for different user types:

\`\`\`typescript
// Custom header for special admin
function SuperAdminHeaderActions() {
  return (
    <Stack direction="row" gap="4">
      <ConnectionStatus />
      <AdminPanel />  {/* Custom component */}
      <NavAlertBadge />
    </Stack>
  );
}

<AppShell headerActions={<SuperAdminHeaderActions />}>
  <SuperAdminPage />
</AppShell>
\`\`\`

---

## Migration from Legacy

| Old Component | New Component | Notes |
|---------------|---------------|-------|
| `AdminLayout` | `AppShell + AdminHeaderActions` | Deleted |
| `CustomerLayout` | `AppShell + CustomerHeaderActions` | Deleted |
| `ResponsiveLayout` | `AppShell` | Unified |
| `MobileLayout` | `AppShell` (mobile mode) | Internal logic |
| `DesktopLayout` | `AppShell` (desktop mode) | Internal logic |
| `Layout` (generic) | Use `Box` directly | Deleted |

---

## Performance

- **Memoization**: AppShell and header actions are memoized
- **Context isolation**: Navigation components handle their own state
- **Conditional rendering**: Only renders mobile OR desktop navigation (not both)

Expected re-renders: < 5 per navigation change

---

## Best Practices

✅ **DO:**
- Use `AppShell` for all portal routes
- Wrap page content in `ContentLayout`
- Use `spacing="compact"` for most pages
- Create custom header actions for special cases

❌ **DON'T:**
- Import deleted components (AdminLayout, ResponsiveLayout, etc.)
- Create new layout wrappers
- Hardcode spacing values
- Render navigation manually

---

## Troubleshooting

**Issue**: Bottom navigation not showing on mobile  
**Fix**: Check viewport width (must be < 768px)

**Issue**: Sidebar overlapping content  
**Fix**: AppShell applies `ml="3rem"` automatically on desktop

**Issue**: TypeScript error "Cannot find AdminLayout"  
**Fix**: Update import to `import { AppShell, AdminHeaderActions } from '@/shared/layout'`

---

## File Structure Reference

```
src/
├── shared/
│   ├── layout/
│   │   ├── AppShell.tsx              # Main layout (100 lines)
│   │   ├── AdminHeaderActions.tsx    # Admin header
│   │   ├── CustomerHeaderActions.tsx # Customer header
│   │   └── index.ts
│   ├── navigation/                   # Used by AppShell
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BottomNavigation.tsx
│   │   ├── FloatingActionButton.tsx
│   │   └── ActionToolbar.tsx
│   └── ui/
│       └── ContentLayout.tsx         # Page wrapper
└── App.tsx                           # All routes use AppShell
```

---

## References

- Industry Pattern: Strapi `AuthenticatedLayout`
- Design Tokens: `src/theme/designTokens.ts`
- Migration Plan: `docs/plans/2026-01-22-unified-layout-migration-v3-FINAL.md`
```

**Step 2: Commit**

```bash
git add docs/design-system/layout-guide.md
git commit -m "docs(layout): add comprehensive layout system guide"
```

---

#### Task 8.2: Update AGENTS.md

**Files:**
- Modify: `AGENTS.md`

**Step 1: Add layout system reference**

Find the "Component Structure" section and add:

```markdown
### Layout System (NEW - Unified AppShell)

ALL pages use the unified `AppShell` component:

\`\`\`tsx
// ✅ CORRECT - Admin routes
import { AppShell, AdminHeaderActions } from '@/shared/layout';
import { ContentLayout, PageHeader, Section } from '@/shared/ui';

// In App.tsx
<Route path="/admin/my-page" element={
  <AppShell headerActions={<AdminHeaderActions />}>
    <MyPage />
  </AppShell>
} />

// In MyPage.tsx
export default function MyPage() {
  return (
    <ContentLayout spacing="compact">
      <PageHeader title="My Page" />
      <Section>Content</Section>
    </ContentLayout>
  );
}

// ✅ CORRECT - Customer routes
<Route path="/customer/store" element={
  <AppShell headerActions={<CustomerHeaderActions />}>
    <StorePage />
  </AppShell>
} />

// ❌ WRONG - These are DELETED
import { AdminLayout } from '@/layouts/AdminLayout';       // DELETED
import { CustomerLayout } from '@/layouts/CustomerLayout'; // DELETED
import { ResponsiveLayout } from '@/shared/layout';        // DELETED
import { Layout } from '@/shared/ui/Layout';               // DELETED
\`\`\`

**Key Rules:**
- 1️⃣ ALWAYS use `AppShell` from `@/shared/layout` in App.tsx routes
- 2️⃣ ALWAYS wrap page content in `ContentLayout` (spacing="compact" most common)
- 3️⃣ NEVER import deleted legacy layouts
- 4️⃣ Use `Box` directly instead of generic `Layout` component
```

**Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md with unified layout system"
```

---

## ✅ Completion Checklist

### Phase 1: Create AppShell
- [ ] AppShell.tsx created (~100 lines - unified solution)

### Phase 2: Header Actions
- [ ] AdminHeaderActions.tsx created
- [ ] CustomerHeaderActions.tsx created

### Phase 3: Exports
- [ ] shared/layout/index.ts created

### Phase 4: ContentLayout
- [ ] ContentLayout simplified to Magic Patterns style

### Phase 5: Migration
- [ ] Migration script created
- [ ] App.tsx routes updated
- [ ] All imports updated

### Phase 6: Testing
- [ ] Test page created (/debug/layout-test)
- [ ] Manual testing passed
- [ ] Production pages tested
- [ ] No visual regressions

### Phase 7: Cleanup
- [ ] Legacy files verified unused
- [ ] 6 legacy files deleted
- [ ] TypeScript compiles
- [ ] Tests pass

### Phase 8: Documentation
- [ ] Layout guide created
- [ ] AGENTS.md updated

---

## 🎯 Success Criteria

✅ Single AppShell.tsx file (~100 lines) handles ALL navigation  
✅ 6 legacy layout files deleted  
✅ All ~100 routes migrated to AppShell  
✅ Zero visual regressions  
✅ All functionality preserved (header, sidebar, bottom nav)  
✅ TypeScript compiles with no errors  
✅ All tests pass  
✅ 70% less code, 83% fewer files  

---

## 📊 Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Files** | 6 layouts | 1 AppShell | **83% reduction** |
| **Lines of Code** | ~333 lines | ~100 lines | **70% reduction** |
| **Layers** | 3 layers deep | 1 layer | **66% simpler** |
| **Duplication** | High (mobile/desktop separate) | None | **100% DRY** |
| **Maintenance** | 6 files to update | 1 file to update | **83% faster** |

---

## 📊 Estimated Timeline

| Phase | Tasks | Time |
|-------|-------|------|
| 1. Create AppShell | 1 task | 30 min |
| 2. Header Actions | 2 tasks | 15 min |
| 3. Exports | 1 task | 5 min |
| 4. ContentLayout | 1 task | 15 min |
| 5. Migration | 1 task | 20 min |
| 6. Testing | 1 task | 20 min |
| 7. Cleanup | 1 task | 10 min |
| 8. Documentation | 2 tasks | 20 min |
| **TOTAL** | **10 tasks** | **~2 hours** |

**Version History:**
- v1: 15 tasks, 6 hours (too complex - created 6 new files)
- v2: 9 tasks, 2.5 hours (better - renamed files)
- **v3: 10 tasks, 2 hours (FINAL - single file AppShell)** ✅

---

## 🎓 Key Learnings

1. **Magic Patterns has NO navigation** - just ContentLayout (content wrapper)
2. **Industry uses single layout file** - Strapi, React Admin pattern
3. **Mobile/Desktop can be unified** - conditional rendering in one file
4. **Fewer files = better maintainability** - 1 file vs 6 files
5. **YAGNI principle** - don't separate components until necessary

---

**Last Updated**: 2026-01-22  
**Version**: 3.0 (ULTRA SIMPLIFIED - FINAL)  
**Author**: G-Admin Mini Team  
**Status**: Ready for execution 🚀

**Industry Alignment**: ✅ Strapi AuthenticatedLayout pattern  
**Magic Patterns Alignment**: ✅ Single file, responsive design  
**Code Quality**: ✅ DRY, YAGNI, Single Responsibility
