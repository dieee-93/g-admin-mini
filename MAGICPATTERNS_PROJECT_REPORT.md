# G-Admin Mini - Project Report for MagicPatterns.com

> **Complete Technical Documentation for UI Standardization & Pattern Library**  
> Generated: January 21, 2026  
> Project: G-Admin Mini ERP v3.1 - EventBus Enterprise Edition

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current Architecture & Tech Stack](#2-current-architecture--tech-stack)
3. [UI System & Components](#3-ui-system--components)
4. [Theming System](#4-theming-system)
5. [Design Patterns & Conventions](#5-design-patterns--conventions)
6. [Component Catalog](#6-component-catalog)
7. [Project Structure](#7-project-structure)
8. [Current Challenges & Goals](#8-current-challenges--goals)
9. [Design System Requirements](#9-design-system-requirements)
10. [Additional Resources](#10-additional-resources)

---

## 1. Project Overview

### What is G-Admin Mini?

**G-Admin Mini** is a modular enterprise ERP system built for restaurant and retail management with multi-location support. The system uses a plugin-based architecture inspired by WordPress, VS Code, and Odoo.

### Key Statistics

| Metric | Value |
|--------|-------|
| **Total Modules** | 31 independent modules |
| **Features** | 86 features across 3 layers |
| **UI Components** | 70+ custom components |
| **Themes** | 24 predefined themes |
| **Supported Business Models** | Retail, Manufacturing, Services, E-commerce, Multi-model |
| **Lines of Code** | ~100,000+ LOC |
| **Technologies** | React 19, TypeScript 5.8, Chakra UI v3, Supabase |

### Business Domains

```
📊 Core
├── Dashboard (Executive, Operational, Analytics)
├── CRM (Customers, Addresses, Segments)
├── Settings (System configuration)
└── Intelligence (Competitive analysis)

⚙️ Operations
├── Sales (POS, Orders, Cash Management)
├── Fulfillment (Onsite, Delivery, Pickup)
├── Kitchen/Production (Recipes, Manufacturing)
└── Delivery (Route optimization, Tracking)

🏪 Supply Chain
├── Materials (StockLab - Inventory management)
├── Products (Catalog, Variants, Pricing)
├── Suppliers (Vendor management)
└── Assets (Equipment tracking)

💰 Finance (Split modules)
├── Fiscal (Tax compliance)
├── Billing (Invoicing)
├── Corporate (Accounting)
└── Integrations (Payment gateways)

👥 Resources
├── Staff (Employee management)
└── Scheduling (Shift planning)

🎮 Gamification
├── Achievements (Milestone tracking)
└── OnboardingGuide (Progressive disclosure)
```

---

## 2. Current Architecture & Tech Stack

### Frontend Stack

```json
{
  "framework": "React 19.1.0",
  "language": "TypeScript 5.8.3",
  "buildTool": "Vite 7.1.9",
  "uiLibrary": "Chakra UI 3.30.0",
  "stateManagement": "Zustand 5.0.7 + TanStack Query 5.90.12",
  "styling": "Emotion 11.14.0 (CSS-in-JS)",
  "animations": "Framer Motion 12.23.11",
  "testing": "Vitest 3.2.4 + Playwright",
  "routing": "React Router 7.1.1"
}
```

### Backend & Infrastructure

| Service | Technology | Purpose |
|---------|------------|---------|
| **Database** | Supabase (PostgreSQL) | Data persistence |
| **Authentication** | Supabase Auth | User management |
| **Real-time** | Supabase Realtime | Live updates |
| **Security** | Row Level Security (RLS) | Data access control |
| **Offline Support** | IndexedDB + OfflineSync | Offline-first architecture |

### Key Systems

1. **EventBus v2 Enterprise** - Distributed event system for cross-module communication
2. **Capabilities/Features System v4.0** - Feature flag system with progressive disclosure
3. **Gamification Engine** - Achievement tracking with 40+ event patterns
4. **Multi-Location System** - Support for distributed inventories
5. **Decimal.js Precision** - Banking-level precision for financial calculations

---

## 3. UI System & Components

### 3-Layer UI Architecture

We follow a **Semantic Architecture** pattern with 3 distinct layers:

```
┌──────────────────────────────────────────────────────────┐
│  LAYER 3: SEMANTIC COMPONENTS                            │
│  Pure semantic HTML + ARIA (WCAG AAA compliant)          │
│  • Main, SemanticSection, SkipLink                       │
│  • Zero styling, 100% accessibility                      │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  LAYER 2: LAYOUT COMPONENTS                              │
│  Styling + composition (business logic)                  │
│  • ContentLayout, Section, FormSection, StatsSection     │
│  • PageHeader, CardWrapper, MetricCard                   │
│  • Combines Layer 3 semantics with visual design         │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  LAYER 1: PRIMITIVES                                     │
│  Low-level Chakra wrappers (building blocks)             │
│  • Box, Flex, Stack, Grid, Button, Input, Text           │
│  • Direct wrappers around Chakra UI components           │
└──────────────────────────────────────────────────────────┘
```

### Component Location

**ALL custom UI components live in**: `src/shared/ui/`

**Import pattern** (CRITICAL):
```typescript
// ✅ CORRECT - Always import from shared UI
import { 
  ContentLayout, 
  PageHeader, 
  Section, 
  Stack, 
  Button, 
  Dialog,
  InputField
} from '@/shared/ui';

// ❌ WRONG - Never import directly from Chakra
import { Box } from '@chakra-ui/react'; // Props differ, will break
```

### Why Custom Wrappers?

We wrap Chakra UI components for:

1. **Consistent API** - Standardized props across all components
2. **Accessibility** - Built-in ARIA attributes and keyboard navigation
3. **Theming Integration** - Automatic theme token application
4. **Type Safety** - Custom TypeScript interfaces for project needs
5. **Future-Proofing** - Single point to upgrade if Chakra changes

---

## 4. Theming System

### Dynamic Theme Engine

**Location**: `src/lib/theming/dynamicTheming.ts`

Our theming system is built on **Chakra UI v3's createSystem()** and uses a dynamic approach:

```typescript
┌─────────────────────────────────────────────────────────┐
│  themeStore.ts (Zustand)                                │
│  Global state: currentTheme, colorPalette               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  dynamicTheming.ts                                      │
│  createThemeSystem(themeId) → Chakra System            │
│  • 24+ predefined themes                               │
│  • Maps gray.* tokens to theme colors                  │
│  • Semantic tokens (bg.*, text.*, border.*)            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  provider.tsx                                           │
│  ChakraProvider + getCurrentThemeSystem()               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  React Components                                       │
│  Use tokens: bg.surface, text.primary, gray.800        │
└─────────────────────────────────────────────────────────┘
```

### Available Themes (24 total)

| Category | Themes |
|----------|--------|
| **Base** | `light`, `dark`, `system` (auto-detect) |
| **Professional Light** | `corporate`, `nature`, `sunset`, `ocean` |
| **Professional Dark** | `corporate-dark`, `nature-dark`, `sunset-dark`, `ocean-dark` |
| **VSCode Inspired** | `dracula`, `tokyo-night`, `synthwave-84`, `monokai-pro`, `atom-one-dark`, `nord`, `gruvbox` |
| **Material Design** | `material-oceanic`, `material-darker`, `material-palenight`, `material-deep-ocean` |
| **Modern** | `cyberpunk`, `pastel`, `high-contrast` |

### Theme Structure

Each theme defines a 10-point scale (50-900) that maps to Chakra's `gray.*` tokens:

```typescript
'dracula': {
  50: { value: "#282a36" },   // Background (darkest)
  100: { value: "#44475a" },  // Surface
  200: { value: "#3d4a77" },  // Borders (WCAG AA 4.5:1)
  300: { value: "#7d8cc4" },  // Elements
  400: { value: "#9fb1d4" },  // Active elements
  500: { value: "#bd93f9" },  // Primary (Dracula purple)
  600: { value: "#ff79c6" },  // Strong accent (pink)
  700: { value: "#50fa7b" },  // Green accent
  800: { value: "#ffb86c" },  // Highlighted surface
  900: { value: "#f8f8f2" },  // Text (lightest)
}
```

**Note**: Scale is inverted for dark themes (50 = darkest, 900 = lightest)

### Semantic Tokens

Components use **semantic tokens** for automatic theme adaptation:

```typescript
// Backgrounds
bg.DEFAULT    → gray.50   (main background)
bg.canvas     → gray.50   (alias)
bg.surface    → gray.50   (cards, modals)
bg.panel      → gray.100  (panels, dropdowns)
bg.subtle     → gray.200  (subtle surface)
bg.muted      → gray.300  (muted surface)

// Text
text.primary   → gray.900  (main text)
text.secondary → gray.800  (secondary text)
text.muted     → gray.600  (dimmed text)

// Foreground
fg.DEFAULT → gray.900  (main foreground)
fg.muted   → gray.600  (muted foreground)
fg.subtle  → gray.700  (subtle foreground)

// Borders
border.DEFAULT → gray.200  (default borders)
border.muted   → gray.300  (subtle borders)

// Color Palettes (fixed, don't change with theme)
blue.*   → Always blue
green.*  → Always green
red.*    → Always red
purple.* → Always purple
```

### Theme Switching

```typescript
// Usage in components
import { useThemeStore } from '@/store/themeStore';

function MyComponent() {
  const { currentTheme, setTheme } = useThemeStore();
  
  return (
    <Button onClick={() => setTheme('dracula')}>
      Switch to Dracula
    </Button>
  );
}
```

---

## 5. Design Patterns & Conventions

### Page Structure Pattern

**EVERY page follows this structure** (App.tsx handles global wrappers):

```tsx
import { 
  ContentLayout, 
  PageHeader, 
  Section, 
  StatsSection,
  MetricCard 
} from '@/shared/ui';

export default function MyPage() {
  return (
    <ContentLayout spacing="normal">
      {/* Header with title and optional actions */}
      <PageHeader title="My Module" />
      
      {/* Stats section (if applicable) */}
      <Section title="Statistics">
        <StatsSection>
          <MetricCard label="Total Sales" value="$10,000" />
          <MetricCard label="Orders" value={123} />
        </StatsSection>
      </Section>
      
      {/* Main content */}
      <Section title="Content">
        {/* Content goes here */}
      </Section>
    </ContentLayout>
  );
}
```

### Form Modal Pattern

**Location**: See `src/pages/admin/supply-chain/suppliers/components/SupplierFormModal.tsx`

**Pattern**: Business logic in custom hook, UI is presentational

```tsx
import { Dialog, FormSection, InputField, Button } from '@/shared/ui';

export function ItemFormModal({ isOpen, onClose, item }) {
  const { formData, handleFieldChange, fieldErrors, handleSubmit } = useFormHook({ item });

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Content>
        <Dialog.Header><Dialog.Title>{item ? 'Edit' : 'Create'} Item</Dialog.Title></Dialog.Header>
        <Dialog.Body>
          <FormSection title="Information">
            <InputField label="Name *" value={formData.name} 
              onChange={(e) => handleFieldChange('name')(e.target.value)}
              style={{ borderColor: fieldErrors.name ? 'var(--colors-error)' : undefined }} />
          </FormSection>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button colorPalette="blue" onClick={handleSubmit}>Save</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

### State Management Pattern

**Location**: `src/store/`

We use **Zustand v5** with devtools + persist middleware:

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface MyState {
  items: Item[];
  isLoading: boolean;
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  fetchItems: () => Promise<void>;
}

export const useMyStore = create<MyState>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        items: [],
        isLoading: false,
        
        // Actions
        addItem: (item) => set((state) => ({ 
          items: [...state.items, item] 
        })),
        
        removeItem: (id) => set((state) => ({
          items: state.items.filter(i => i.id !== id)
        })),
        
        fetchItems: async () => {
          set({ isLoading: true });
          try {
            const data = await fetchItemsFromAPI();
            set({ items: data, isLoading: false });
          } catch (error) {
            logger.error('MyStore', 'Failed to fetch items', error);
            set({ isLoading: false });
          }
        }
      }),
      { 
        name: 'my-store', // LocalStorage key
        partialize: (state) => ({ items: state.items }) // Only persist items
      }
    ),
    { name: 'MyStore' } // DevTools name
  )
);
```

### Business Logic with Decimal.js

**Location**: `src/business-logic/`

**CRITICAL**: We use Decimal.js for ALL financial calculations to avoid floating-point errors.

```typescript
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// ✅ Banking-level precision (20 digits) - NO native JS math operators
const total = items.reduce((acc, item) => 
  DecimalUtils.add(acc, DecimalUtils.calculateStockValue(item.stock, item.unit_cost), 'inventory'),
  DecimalUtils.fromValue(0, 'inventory')
);
```

**Precision Domains**:
- `'financial'` - 2 decimal places (money)
- `'recipe'` - 3 decimal places (ingredient quantities)
- `'inventory'` - 4 decimal places (stock tracking)
- `'tax'` - 6 decimal places (tax calculations)

---

## Design Token Values (Exact Specifications)

### Spacing Scale

**Location**: `src/theme/tokens.ts`

We use a consistent **8px-based spacing scale**:

```typescript
export const SPACING = {
  xs: '0.25rem',     // 4px  - Micro gaps, tight spacing
  sm: '0.5rem',      // 8px  - Small gaps (buttons, badges)
  md: '1rem',        // 16px - Standard spacing (default)
  lg: '1.5rem',      // 24px - Section gaps, card spacing
  xl: '2rem',        // 32px - Page layout, major sections
  '2xl': '3rem',     // 48px - Large separators
  '3xl': '4rem',     // 64px - Hero sections, page headers
};
```

**Usage**: xs (4px text gaps), sm (8px button groups), md (16px form fields), lg (24px card padding), xl (32px page container), 2xl (48px section gaps)

### Breakpoints (Responsive Design)

**Location**: `src/theme/tokens.ts`

```typescript
export const BREAKPOINTS = {
  base: 0,           // Mobile first (320px+)
  sm: 480,           // Small mobile (480px+)
  md: 768,           // Tablet (768px+)
  lg: 1024,          // Desktop (1024px+)
  xl: 1280,          // Large desktop (1280px+)
  '2xl': 1536,       // Extra large (1536px+)
};
```

**Responsive Strategy**: Mobile-first approach

```typescript
// Example usage
<Box 
  padding={{ base: '4', md: '6', lg: '8' }}  // 16px → 24px → 32px
  fontSize={{ base: 'md', lg: 'lg' }}         // Responsive text
/>
```

### Typography Scale

**Location**: `src/shared/ui/Typography.tsx`

**Font Sizes**: xs (12px) → sm (14px) → md (16px) → lg (18px) → xl (20px) → 2xl (24px) → 3xl (30px) → 4xl (36px) → 5xl (48px) → 6xl (60px)

**Font Weights**: light (300), normal (400), medium (500), semibold (600), bold (700)

**Line Heights**: Display (1.0-1.1), Headings (1.2-1.3), Body (1.5-1.6), Captions (1.4-1.5)

**Typography Variants** (Custom System):

```typescript
// Usage examples
<Typography variant="display">Hero Title</Typography>     // 48-60px, bold
<Typography variant="heading">Section</Typography>        // 30-36px, bold  
<Typography variant="title">Subsection</Typography>      // 24-30px, semibold
<Typography variant="body">Content</Typography>          // 16-18px, normal
<Typography variant="caption">Metadata</Typography>       // 14px, normal
```

### Color Tokens

**Semantic Colors** (WCAG AA Compliant):

```typescript
// All colors WCAG AA compliant (4.5:1 minimum contrast)
COLORS = {
  primary: { 500: '#3b82f6', 600: '#2563eb' },
  gray: { 50: '#f9fafb', 200: '#e5e7eb', 500: '#6b7280', 600: '#4b5563', 900: '#111827' },
  success: { 500: '#10b981', 600: '#059669' },
  warning: { 500: '#f59e0b', 600: '#d97706' },
  error: { 500: '#ef4444', 600: '#dc2626' }
};
```

**Border Radius**: none (0), sm (2px), base (4px), md (6px), lg (8px), xl (12px), 2xl (16px), 3xl (24px), full (9999px)

**Shadows**: xs, sm, md (default card), lg (elevated panels), xl (modals), 2xl (overlays)

### Service Layer Pattern

**Location**: `src/services/`

All Supabase interactions go through service modules:

```typescript
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

export async function fetchSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    logger.error('SuppliersService', 'Failed to fetch suppliers', error);
    throw error;
  }
  return data;
}

export async function upsertSupplier(supplier: Supplier) {
  const { data, error } = await supabase
    .from('suppliers')
    .upsert(supplier, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    logger.error('SuppliersService', 'Upsert failed', error);
    throw error;
  }
  return data;
}
```

---

## 6. Component Catalog

### Complete Component List

#### Layer 3: Semantic Components

| Component | Purpose | Accessibility |
|-----------|---------|---------------|
| `Main` | Semantic `<main>` wrapper | WCAG 2.4.1 (Bypass Blocks) |
| `SemanticSection` | Semantic `<section>` | Proper heading hierarchy |
| `SkipLink` | Keyboard navigation shortcut | WCAG 2.4.1 (Skip to content) |

#### Layer 2: Layout Components

| Component | Purpose | Usage |
|-----------|---------|-------|
| `ContentLayout` | Main content wrapper with spacing | Every page uses this |
| `PageHeader` | Page title + actions | Top of every page |
| `Section` | Content section with optional title | Group related content |
| `FormSection` | Form group with title | Group form fields |
| `StatsSection` | Grid layout for metrics | Dashboard statistics |
| `CardWrapper` | Enhanced card with compound pattern | Data cards, info panels |

#### Layer 2: Specialized Components

| Component | Purpose | Example Use Case |
|-----------|---------|------------------|
| `MetricCard` | Display single metric with label | Revenue, order count |
| `LocationSelector` | Multi-location picker | Location-aware features |
| `LocationBadge` | Display current location | Headers, navigation |
| `Avatar` | User/entity avatar with fallback | User profiles, lists |
| `Badge` | Status/category indicator | Order status, stock levels |
| `StatusBadge` | Predefined status badge | Active/Inactive/Pending |
| `FeatureCard` | Feature showcase card | Landing pages |
| `VirtualList` | Virtualized list (50+ items) | Large datasets |
| `VirtualGrid` | Virtualized grid (50+ items) | Product catalogs |

#### Layer 1: Primitives (Form Components)

| Component | Props | Purpose |
|-----------|-------|---------|
| `InputField` | label, error, helperText | Text input with validation |
| `SelectField` | label, options, error | Dropdown selector |
| `TextareaField` | label, rows, error | Multi-line text |
| `NumberField` | label, min, max, step | Numeric input |
| `Checkbox` | label, checked | Boolean toggle |
| `Switch` | label, checked | ON/OFF toggle |
| `RadioGroup` | options, value, onChange | Single choice from options |
| `SegmentGroup` | segments, value | Segmented control |
| `Slider` | min, max, value | Range selector |

#### Layer 1: Primitives (UI Elements)

| Component | Variants | Sizes | Color Palettes |
|-----------|----------|-------|----------------|
| `Button` | solid, subtle, surface, outline, ghost, plain | 2xs, xs, sm, md, lg, xl, 2xl | gray, red, orange, yellow, green, teal, blue, cyan, purple, pink |
| `IconButton` | Same as Button | Same as Button | Same as Button |
| `Input` | outline, filled, flushed | xs, sm, md, lg | N/A |
| `Badge` | solid, subtle, outline | xs, sm, md, lg | Same as Button |
| `Alert` | info, warning, error, success | sm, md, lg | N/A |

#### Layer 1: Layout Primitives

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Box` | Generic container | All CSS props |
| `Flex` | Flexbox container | direction, justify, align, wrap, gap |
| `Stack` | Flex with gap (vertical/horizontal) | direction, gap, align, justify |
| `VStack` | Vertical stack (alias) | gap, align |
| `HStack` | Horizontal stack (alias) | gap, align |
| `Grid` | CSS Grid container | columns, gap, templateAreas |
| `SimpleGrid` | Responsive grid | columns, minChildWidth, gap |
| `Container` | Max-width container | maxW, centerContent |
| `Circle` | Circular container | size |
| `Center` | Center content | All Flex props |

#### Layer 1: Typography

| Component | Purpose | Sizes |
|-----------|---------|-------|
| `Heading` | Headings (h1-h6) | xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl |
| `Text` | Body text | xs, sm, md, lg, xl, 2xl |
| `Typography` | Semantic text with variants | N/A |
| `Title` | Page/section title | N/A |
| `Body` | Body text (alias) | N/A |
| `Caption` | Small descriptive text | N/A |
| `Label` | Form label text | N/A |
| `Code` | Inline code | N/A |
| `Kbd` | Keyboard shortcut | N/A |

#### Layer 1: Feedback Components

| Component | Purpose | Usage |
|-----------|---------|-------|
| `Spinner` | Loading indicator | Data fetching |
| `Skeleton` | Content placeholder | Suspense boundaries |
| `SkeletonText` | Text placeholder | Loading text |
| `Progress` | Progress bar | Upload, processing |
| `CircularProgress` | Circular progress | Compact spaces |
| `Alert` | User notifications | Success/error messages |
| `Tooltip` | Contextual help | Hover information |

#### Layer 1: Overlay Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `Dialog` | Modal dialog | Nested dialogs, backdrop, close button |
| `Drawer` | Side panel | Left/right/top/bottom placement |
| `Popover` | Floating content | Positioning, trigger on hover/click |
| `Menu` | Dropdown menu | Nested menus, keyboard navigation |
| `Tooltip` | Hover tooltip | Auto-positioning, delay |

#### Layer 1: Data Display

| Component | Purpose | Features |
|-----------|---------|----------|
| `Table` | Data table | Sorting, pagination, row selection |
| `Tabs` | Tabbed interface | Horizontal/vertical, lazy loading |
| `Accordion` | Collapsible sections | Multiple/single expand |
| `Card` | Content card | Header, body, footer sections |

### Helper Systems

#### Layer 2.5: Form Helpers

```typescript
import { Form } from '@/shared/ui';

// Simplified form handling
<Form onSubmit={handleSubmit}>
  <InputField name="email" label="Email" />
  <InputField name="password" label="Password" type="password" />
  <Button type="submit">Submit</Button>
</Form>
```

#### Layer 2.5: Dialog Helpers

```typescript
import { DialogHelpers } from '@/shared/ui';

// Simplified dialog composition
const { isOpen, onOpen, onClose } = DialogHelpers.useDisclosure();

<Button onClick={onOpen}>Open Dialog</Button>
<DialogHelpers.Root open={isOpen} onOpenChange={onClose}>
  {/* Dialog content */}
</DialogHelpers.Root>
```

---

## 7. Project Structure

### Folder Organization (Screaming Architecture)

```
i:/Programacion/Proyectos/g-mini/
├── src/
│   ├── pages/admin/          # Business domains (main app modules)
│   │   ├── core/             # Dashboard, CRM, Settings, Intelligence
│   │   ├── operations/       # Sales, Fulfillment, Kitchen/Production
│   │   ├── supply-chain/     # Materials, Products, Suppliers, Assets
│   │   ├── finance/          # Split modules (Fiscal, Billing, Corporate)
│   │   ├── resources/        # Staff, Scheduling
│   │   ├── gamification/     # Achievements, OnboardingGuide
│   │   └── tools/            # Reporting utilities
│   │
│   ├── shared/               # Shared systems across app
│   │   ├── ui/               # ⭐ ALL UI COMPONENTS (70+ components)
│   │   │   ├── index.ts      # Central export file
│   │   │   ├── provider.tsx  # Theme provider
│   │   │   ├── Button.tsx    # Primitive components
│   │   │   ├── Input.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── ContentLayout.tsx  # Layout components
│   │   │   ├── Section.tsx
│   │   │   ├── FormSection.tsx
│   │   │   ├── semantic/     # Layer 3 semantic components
│   │   │   ├── helpers/      # Layer 2.5 composition helpers
│   │   │   ├── fields/       # Specialized input fields
│   │   │   └── ...           # 60+ more components
│   │   │
│   │   ├── alerts/           # Unified alerts system
│   │   ├── layout/           # App-level layouts (Admin, Customer)
│   │   └── components/       # Shared business components
│   │
│   ├── lib/                  # Core libraries
│   │   ├── events/           # EventBus v2 Enterprise
│   │   ├── capabilities/     # Feature flag system (deprecated)
│   │   ├── features/         # ✨ NEW: FeatureActivationEngine v4.0
│   │   ├── offline/          # Offline-first architecture
│   │   ├── error-handling/   # Error boundary + handler
│   │   ├── performance/      # Performance monitoring
│   │   ├── logging/          # Logger singleton
│   │   ├── decimal/          # DecimalUtils for financial precision
│   │   ├── theming/          # ⭐ Dynamic theming system
│   │   ├── modules/          # Module registry + hooks
│   │   └── supabase/         # Supabase client
│   │
│   ├── store/                # Zustand stores (one per domain)
│   │   ├── appStore.ts       # Global app state
│   │   ├── themeStore.ts     # Theme state
│   │   ├── materialsStore.ts # Materials module state
│   │   ├── salesStore.ts     # Sales module state
│   │   └── ...               # 15+ more stores
│   │
│   ├── services/             # Supabase API wrappers
│   │   ├── materialsService.ts
│   │   ├── salesService.ts
│   │   ├── suppliersService.ts
│   │   └── ...               # Service modules
│   │
│   ├── business-logic/       # Domain calculations (Decimal.js)
│   │   ├── shared/
│   │   │   └── decimalUtils.ts  # Core decimal utilities
│   │   ├── pricing/          # Pricing calculations
│   │   ├── inventory/        # Stock calculations
│   │   └── ...               # Business rules
│   │
│   ├── config/               # System configuration
│   │   ├── routeMap.ts       # Automated route mapping
│   │   ├── FeatureRegistry.ts       # Feature definitions
│   │   ├── BusinessModelRegistry.ts # Business model types
│   │   ├── RequirementsRegistry.ts  # Feature dependencies
│   │   └── PermissionsRegistry.ts   # RBAC permissions
│   │
│   ├── modules/              # Module manifests (31 modules)
│   │   ├── sales/
│   │   │   └── manifest.ts   # Module definition + hooks
│   │   ├── materials/
│   │   ├── products/
│   │   └── ...               # 31 module manifests
│   │
│   ├── theme/                # Theme configuration
│   │   ├── index.ts          # (empty - using dynamic system)
│   │   └── tokens.ts         # Static design tokens (not used)
│   │
│   ├── contexts/             # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── LocationContext.tsx
│   │   ├── NavigationContext.tsx
│   │   └── FeatureFlagContext.tsx
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useRouteBasedPreloading.ts
│   │   ├── useCapabilities.ts
│   │   └── ...               # 20+ custom hooks
│   │
│   ├── layouts/              # App-level layouts
│   │   ├── AdminLayout.tsx   # Admin portal layout
│   │   └── CustomerLayout.tsx # Customer portal layout
│   │
│   └── types/                # TypeScript type definitions
│       ├── database.types.ts # Supabase generated types
│       └── ...               # Domain types
│
├── database/                 # Supabase migrations
│   └── migrations/           # SQL migration files
│       ├── YYYYMMDDHHMMSS_create_table.sql
│       └── ...               # 50+ migrations
│
├── docs/                     # Documentation
│   ├── theme/                # Theme system docs
│   ├── architecture-v2/      # Architecture redesign docs
│   └── ...                   # 20+ documentation files
│
├── tests/
│   ├── e2e/                  # Playwright E2E tests
│   └── unit/                 # Vitest unit tests
│
├── public/                   # Static assets
├── .github/                  # GitHub workflows
├── eslint.config.js          # ESLint configuration
├── tsconfig.json             # TypeScript configuration
├── vitest.config.ts          # Test configuration
├── playwright.config.ts      # E2E test configuration
└── package.json              # Dependencies + scripts
```

### Route Mapping System

**Location**: `src/config/routeMap.ts`

We use an **automated domain ↔ route mapping** system:

```typescript
export const domainRouteMap = {
  'sales': '/admin/operations/sales',
  'materials': '/admin/supply-chain/materials',
  'products': '/admin/supply-chain/products',
  'suppliers': '/admin/supply-chain/suppliers',
  'staff': '/admin/resources/staff',
  // ... 31 total mappings
};

export const routeToFileMap = {
  '/admin/operations/sales': 'src/pages/admin/operations/sales/page.tsx',
  '/admin/supply-chain/materials': 'src/pages/admin/supply-chain/materials/page.tsx',
  // ... auto-generated from domainRouteMap
};
```

---

## 8. Current Challenges & Goals

### Existing Issues

1. **Component Inconsistencies**
   - Some pages use different spacing values (hardcoded `px="4"` vs `px="6"`)
   - Inconsistent color usage (hardcoded `#ffffff` vs semantic `bg.surface`)
   - Mixed use of px values vs spacing tokens (`padding="16px"` vs `p="4"`)
   - **Examples found**: Sales page has `py="4"`, Materials uses `py="6"`, inconsistent across 31 modules

2. **Padding/Spacing Issues** ⚠️
   - **DOCUMENTED ISSUE**: Excessive padding between header and content
   - Current stack: `60px (header) + 24px (layout py) + 16px (page py) = 100px` in some pages
   - **Layout files affected**: `DesktopLayout.tsx`, `MobileLayout.tsx`, individual page files
   - **Recommended fix**: Reduce `py={{ base: "4", md: "6" }}` to `py={{ base: "2", md: "4" }}`
   - See: `docs/theme/PADDING_ANALYSIS.md` for complete analysis

3. **Theme System Complexity**
   - 24 themes but limited documentation on when to use which
   - Some components don't respond well to theme changes (hardcoded colors)
   - Need better token guidelines for developers
   - **Known issue**: Some dark themes have insufficient contrast on borders (fixed in Dracula theme)

4. **Hardcoded Values Found** 🔍
   - Border widths: `borderWidth="1px"` instead of tokens (found in 15+ files)
   - Heights: `height="4px"`, `minH="40px"` instead of spacing tokens
   - Max widths: `maxW="800px"` in modals (should use tokens)
   - Colors: Direct hex values `#ffffff` instead of `bg.surface`
   - Font sizes: Inline `fontSize="lg"` mixed with Typography variants

5. **Form Patterns**
   - Not all forms follow the modal pattern established in SupplierFormModal
   - Validation display varies across modules (some use borderColor, others use Field.ErrorText)
   - Missing standardized error messages (some use alerts, some inline)
   - Field error styling inconsistent: `style={{ borderColor: fieldErrors.name ? 'var(--colors-error)' : undefined }}`

6. **Accessibility Gaps**
   - Some modals missing proper focus management
   - Keyboard navigation works but could be better documented
   - ARIA labels inconsistent across similar components
   - **Good example**: Semantic layer (Main, SemanticSection, SkipLink) - WCAG AAA compliant
   - **Needs improvement**: Dynamic content updates, live regions

7. **Mobile Responsiveness**
   - Most layouts are desktop-first (should be mobile-first)
   - Some tables don't adapt well to mobile (no horizontal scroll strategy)
   - Touch targets could be larger in some areas (minimum 44x44px not always met)
   - Responsive breakpoints exist but not consistently used

8. **Typography Inconsistencies**
   - Mix of Typography component variants and direct fontSize props
   - Example: `<Text fontSize="lg" fontWeight="semibold">` vs `<Typography variant="title">`
   - Font weights used inconsistently (some pages use 'bold', others 'semibold' for same hierarchy)
   - Line heights not always specified (relies on browser defaults)

9. **Component Wrapper Confusion**
   - Developers sometimes import from `@chakra-ui/react` instead of `@/shared/ui`
   - Props differ between Chakra and our wrappers (causes runtime errors)
   - **Critical rule**: ALWAYS import from `@/shared/ui`, NEVER from Chakra directly
   - ESLint rule exists but could be stricter

### Goals for Standardization

1. **Create Component Library Documentation**
   - Living style guide with examples
   - Props documentation for all 70+ components
   - Usage patterns and best practices
   - Do's and Don'ts for each component

2. **Establish Design Tokens**
   - Spacing scale (currently using 4/8/12/16/24/32/48/64px)
   - Color palette guidelines
   - Typography scale
   - Border radius values
   - Shadow/elevation system

3. **Form Patterns Library**
   - Standard validation UI
   - Error message templates
   - Loading states
   - Success/failure feedback

4. **Responsive Design System**
   - Mobile-first breakpoints
   - Tablet adaptations
   - Desktop optimizations
   - Touch-friendly sizing

5. **Accessibility Standards**
   - WCAG 2.1 AA minimum (AAA where possible)
   - Focus management patterns
   - Screen reader testing results
   - Keyboard navigation maps

---

## 9. Design System Requirements

### What We Need from MagicPatterns

1. **Component Pattern Library**
   - Visual examples of all 70+ components with live previews
   - Interactive playground for testing variants (like Storybook)
   - Copy-paste code examples with TypeScript types
   - Props API documentation with all available options
   - **Priority components**: Dialog, InputField, Button, Badge, Table, MetricCard

2. **Design Tokens Documentation**
   - **Complete token reference** with exact values (spacing, colors, typography, shadows, borders)
   - **Usage guidelines** per token category with do's and don'ts
   - **Migration guide** from hardcoded values to semantic tokens (with find/replace patterns)
   - **Responsive token system** documentation (base, md, lg breakpoints)
   - **WCAG contrast ratios** for all color combinations in our 24 themes

3. **Layout Patterns**
   - **Page templates** for common scenarios with full code:
     - List/Grid views with filters and search
     - Form-heavy pages (create/edit patterns)
     - Dashboard layouts (metrics + charts + tables)
     - Detail/Edit pages (split view, tabs)
     - Data table pages (with sorting, pagination, bulk actions)
   - **Responsive behavior** documentation for each template
   - **Spacing rules**: When to use 16px vs 24px vs 32px gaps
   - **Grid systems**: 1-col (mobile), 2-col (tablet), 4-col (desktop) patterns

4. **Theme Guidelines**
   - **When to use** each of the 24 themes (business context recommendations)
   - **How to create** custom themes (step-by-step guide)
   - **Color contrast ratios** for all themes with WCAG compliance report
   - **Theme testing checklist** (what to verify when adding new themes)
   - **Dark mode best practices** (text, borders, shadows in dark themes)

5. **Form Patterns**
   - **Standard form layouts** (single column, two column, wizard)
   - **Validation patterns** (inline vs summary, real-time vs on-submit)
   - **Multi-step forms** (wizard with progress indicator)
   - **Conditional fields** (show/hide based on other fields)
   - **Error message templates** (consistent wording and placement)
   - **Loading states** (skeleton, spinner, disabled buttons)
   - **Success feedback** (toast, inline message, redirect)

6. **Animation Guidelines**
   - **When to use** Framer Motion (page transitions, modals, toasts)
   - **Performance considerations** (GPU acceleration, transform/opacity only)
   - **Standard transitions** with exact values:
     - Duration: 150ms (fast), 250ms (normal), 400ms (slow)
     - Easing: ease-in-out, ease-out, spring configs
   - **Animation checklist** (prefers-reduced-motion support)

7. **Testing Strategy**
   - **Component testing examples** (Vitest + Testing Library)
   - **Visual regression testing** setup (Playwright screenshots)
   - **Accessibility testing checklist** (WCAG 2.1 AA requirements)
   - **Cross-browser testing** (Chrome, Firefox, Safari, Edge)
   - **Mobile testing** (iOS Safari, Android Chrome)

---

## 10. Additional Resources

### Key Files to Review

| File | Purpose | Priority |
|------|---------|----------|
| `src/shared/ui/index.ts` | Central component export | ⭐⭐⭐ |
| `src/lib/theming/dynamicTheming.ts` | Theme system core | ⭐⭐⭐ |
| `src/shared/ui/ContentLayout.tsx` | Main layout pattern | ⭐⭐⭐ |
| `src/shared/ui/Button.tsx` | Component wrapper example | ⭐⭐ |
| `src/shared/ui/Dialog.tsx` | Modal component | ⭐⭐ |
| `src/store/themeStore.ts` | Theme state management | ⭐⭐ |
| `docs/theme/README.md` | Theme documentation | ⭐⭐ |
| `.github/copilot-instructions.md` | Project conventions | ⭐⭐ |
| `AGENTS.md` | Developer guide | ⭐⭐ |

### Documentation Files

- `CURRENT_ARCHITECTURE.md` - System architecture overview
- `DEVELOPMENT_GUIDE.md` - Developer onboarding
- `docs/05-development/ZUSTAND_V5_STORE_AUDIT_REPORT.md` - State management
- `DYNAMIC_MODULE_FEATURE_MAP_MIGRATION.md` - Module system

### Example Components to Study

**Good Examples** (follow these patterns):
- `src/pages/admin/supply-chain/suppliers/components/SupplierFormModal.tsx`
- `src/pages/admin/supply-chain/materials/page.tsx`
- `src/pages/admin/core/dashboard/page.tsx`

**Showcase Pages** (visual examples):
- `src/pages/debug/theme/DesignSystemShowcase.tsx`
- `src/pages/debug/theme/showcases/` (7 showcase files)

### Tech Stack Links

- **Chakra UI v3**: https://www.chakra-ui.com/docs/get-started/overview
- **React 19**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Zustand**: https://zustand-demo.pmnd.rs/
- **TanStack Query**: https://tanstack.com/query/latest
- **Vitest**: https://vitest.dev/
- **Supabase**: https://supabase.com/docs

---

## Questions for MagicPatterns

To help you provide the best recommendations, here are some questions we're working through:

### 1. Component Architecture
- Should we keep the 3-layer architecture or simplify?
- Are we wrapping too many Chakra components or not enough?
- Should we create more compound components like `CardWrapper`?

### 2. Theming
- Are 24 themes too many for a single app?
- Should we consolidate to a few "official" themes?
- How to better document theme selection for users?

### 3. Spacing & Layout
- Current spacing scale: 4/8/12/16/24/32/48/64px - is this sufficient?
- Should we enforce spacing tokens more strictly?
- How to handle edge cases where custom spacing is needed?

### 4. Forms
- Should all forms follow the modal pattern or allow inline editing?
- How to handle complex multi-step forms?
- Best practice for field-level vs form-level validation display?

### 5. Mobile Strategy
- Desktop-first vs mobile-first - which should we prioritize?
- How to handle data-heavy tables on mobile?
- Should we create mobile-specific components?

### 6. Performance
- When to use virtual scrolling (currently 50+ items)?
- How to optimize theme switching performance?
- Best practices for lazy loading component libraries?

### 7. Accessibility
- Are we meeting WCAG 2.1 AA minimum everywhere?
- How to improve keyboard navigation documentation?
- Should we create accessibility-specific variants?

---

## Contact & Collaboration

**Project Repository**: (Private)  
**Framework**: React 19 + TypeScript 5.8 + Chakra UI v3  
**Team Size**: 1 developer (seeking UI/UX guidance)  
**Timeline**: Active development, looking for ongoing support

We're excited to work with MagicPatterns to:
1. ✅ Standardize our component library
2. ✅ Improve UI consistency across 31 modules
3. ✅ Create comprehensive design system documentation
4. ✅ Establish best practices for future development
5. ✅ Enhance accessibility and mobile experience

**Contact & Collaboration**

**Project Repository**: (Private)  
**Framework**: React 19 + TypeScript 5.8 + Chakra UI v3  
**Team Size**: 1 developer (seeking UI/UX guidance)  
**Timeline**: Active development, looking for ongoing support

We're excited to work with MagicPatterns to:
1. ✅ Standardize our component library
2. ✅ Improve UI consistency across 31 modules
3. ✅ Create comprehensive design system documentation
4. ✅ Establish best practices for future development
5. ✅ Enhance accessibility and mobile experience

---

## 📊 Visual Examples & Screenshots

### What We Have

While we cannot provide screenshots in this document, here are descriptions of key visual patterns:

**Dashboard Layout**:
- Header: 60px fixed height with logo, location selector, user menu
- Sidebar: 48px collapsed / 240px expanded, with module icons
- Content: Dynamic width with 16-24px padding, 32px gaps between sections
- Color scheme: Adapts to 24 themes, default light uses gray.50 background

**Sales POS**:
- Split layout: 60% product grid, 40% cart sidebar
- Product cards: 200px × 200px with image, name, price
- Cart: Fixed right sidebar with line items, total, checkout button
- Status badges: Green (active), Yellow (pending), Red (completed)

**Form Modals**:
- Max width: 600-800px depending on content
- Header: Title + close button, 60px height
- Body: Scrollable with FormSection groups
- Footer: Cancel (outline) + Submit (solid blue) buttons
- Field errors: Red border + error text below field

**Data Tables**:
- Alternating row colors: white / gray.50
- Header: Sticky, bold text, sortable columns
- Row height: 56px (desktop), 72px (mobile for touch)
- Actions: Inline edit/delete buttons on hover
- Pagination: Bottom center, 10/25/50/100 items per page

### What Needs Improvement

**Consistency Issues**:
- Some modals use 600px, others 800px max width
- Button spacing varies: 8px vs 12px gaps
- Card padding: Some use 16px, others 24px
- Border radius: Mix of 4px, 6px, 8px, 12px

**Mobile Gaps**:
- Tables overflow horizontally without scroll indicators
- Some buttons too small (< 44px height) for touch
- Modal max-height sometimes cuts content on small screens
- Stack direction doesn't always change on mobile

### Code Examples Needing Standardization

**Before** (Current inconsistent code):

```tsx
// ❌ PROBLEM 1: Hardcoded values
<Box 
  padding="24px"                          // Should use token
  borderRadius="8px"                      // Should use token
  borderWidth="1px"                       // Should use token
  backgroundColor="#ffffff"               // Should use semantic token
>
  <Text fontSize="18px" fontWeight="600"> // Should use Typography variant
    Title
  </Text>
</Box>

// ❌ PROBLEM 2: Inconsistent spacing
<Stack gap="12px">                        // Some pages use 12px
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</Stack>

<Stack gap="8px">                         // Others use 8px
  <Button>Action 3</Button>
  <Button>Action 4</Button>
</Stack>

// ❌ PROBLEM 3: Direct Chakra imports
import { Box } from '@chakra-ui/react';  // Props don't match our system

// ❌ PROBLEM 4: Mixed validation patterns
<InputField 
  label="Name"
  value={name}
  onChange={handleChange}
  style={{ 
    borderColor: errors.name ? 'red' : undefined  // Inconsistent error styling
  }}
/>
{errors.name && <Text color="red.500">{errors.name}</Text>}  // Manual error display
```

**After** (Standardized with MagicPatterns guidance):

```tsx
// ✅ SOLUTION 1: Use semantic tokens
<Box 
  p="6"                                   // 24px using spacing token
  borderRadius="lg"                       // 8px using radius token
  borderWidth="1"                         // 1px using border token
  bg="bg.surface"                         // Semantic token (adapts to theme)
>
  <Typography variant="title">           // Typography variant
    Title
  </Typography>
</Box>

// ✅ SOLUTION 2: Consistent spacing (8px for button groups)
<Stack gap="2">                           // 8px = spacing token 'sm'
  <Button>Action 1</Button>
  <Button>Action 2</Button>
  <Button>Action 3</Button>
  <Button>Action 4</Button>
</Stack>

// ✅ SOLUTION 3: Use wrapper system
import { Box } from '@/shared/ui';        // Our wrapper with consistent props

// ✅ SOLUTION 4: Standardized validation
<InputField 
  label="Name"
  value={name}
  onChange={handleChange}
  error={errors.name}                     // Built-in error handling
  helperText="Enter full name"            // Built-in helper text
/>
// Error automatically displayed with consistent styling
```

### Specific Questions for MagicPatterns

Based on the above, we need guidance on:

1. **Token Migration Strategy**
   - Should we create ESLint rules to block hardcoded values?
   - How to progressively migrate 31 modules (which first)?
   - Tool recommendations for finding all hardcoded values?

2. **Spacing Standardization**
   - Confirm our 8px base scale is appropriate
   - When to use 16px vs 24px for card padding?
   - How to handle edge cases where tokens don't fit?

3. **Component Variant Consolidation**
   - Should we reduce button variants (currently 6)?
   - Badge variants: keep all 3 or simplify?
   - Modal max-width: standard sizes or case-by-case?

4. **Validation Pattern**
   - Inline errors vs summary at top?
   - Real-time validation vs on-submit?
   - Error message placement (below field vs inside field)?

5. **Mobile-First Implementation**
   - Checklist for converting desktop-first to mobile-first
   - Breakpoint strategy (when to show/hide elements)
   - Table patterns for mobile (cards vs horizontal scroll)?

---

Thank you for taking the time to review our project! We look forward to your recommendations.

---

**Generated**: January 21, 2026  
**Version**: 1.0  
**Last Updated**: G-Admin Mini v3.1 EventBus Enterprise Edition
