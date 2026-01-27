# Providers Architecture Analysis

## 🎯 Objective

Analyze and optimize React Context Providers organization in the codebase. Currently, providers are scattered across 3 different locations without clear architectural pattern.

---

## 📊 Current State

### Provider Locations (3 folders)

#### 1. `src/providers/` (1 file)
```
src/providers/
└── EventBusProvider.tsx (212 lines)
```

**Purpose**: EventBus integration with React Context  
**Usage**: 2 files import from `@/providers/`
- `App.tsx` - wraps entire app
- `EventBusDebugger.tsx` - debug component

---

#### 2. `src/contexts/` (3 files)
```
src/contexts/
├── AuthContext.tsx (622 lines)
├── LocationContext.tsx (289 lines)
└── NavigationContext.tsx (963 lines)
```

**Purposes**:
- **AuthContext**: User authentication, roles, permissions (JWT, Supabase)
- **LocationContext**: Multi-location support, location selection
- **NavigationContext**: Module navigation, sidebar, breadcrumbs (3 split contexts)

**Usage**: 30+ files import from `@/contexts/`

**Pattern**: Each file exports both:
- Provider component (`AuthProvider`, `LocationProvider`, `NavigationProvider`)
- Custom hooks (`useAuth`, `useLocation`, `useNavigationState`, etc.)

---

#### 3. `src/shared/alerts/AlertsProvider.tsx` (1 file)
```
src/shared/alerts/
└── AlertsProvider.tsx (818 lines)
```

**Purpose**: Global alerts/notifications system  
**Usage**: 20+ files import from `@/shared/alerts`

**Pattern**: Split context optimization
- `AlertsStateContext` - state data (alerts, stats, config)
- `AlertsActionsContext` - functions only
- Performance: Prevents re-renders when consuming only actions

---

## 📐 Architectural Patterns Found

### Pattern 1: Context Splitting (Performance Optimization)

**Used by**:
- ✅ `NavigationContext` (State, Layout, Actions split)
- ✅ `AlertsProvider` (State, Actions split)

**Benefits**:
- Components only re-render when their consumed slice changes
- Actions-only consumers never re-render on state changes
- Kent C. Dodds best practice pattern

**Example**:
```tsx
// NavigationContext exports 3 separate contexts
useNavigationState()  // Navigation data only
useNavigationLayout() // Layout state only
useNavigationActions() // Functions only
```

---

### Pattern 2: Colocation with Feature (Screaming Architecture)

**Used by**:
- ✅ `AlertsProvider` in `src/shared/alerts/` (with types, hooks, components)

**Benefits**:
- Feature discoverability
- All related code in one place
- Clear domain boundaries

---

### Pattern 3: Central Contexts Folder

**Used by**:
- ✅ `AuthContext`, `LocationContext`, `NavigationContext` in `src/contexts/`

**Benefits**:
- Central registry of global state
- Easy to find cross-cutting concerns
- Traditional React pattern

---

## 🔍 Detailed Analysis

### 1. EventBusProvider (src/providers/)

**File**: `EventBusProvider.tsx` (212 lines)

**Architecture**:
```tsx
EventBusContext (createContext)
  ↓
EventBusProvider (wraps app in App.tsx)
  ↓
useEventBus() hook
  - emit()
  - on()
  - off()
  - emitModuleEvent()
  - useModuleEvent()
```

**Key Features**:
- Wraps EventBus singleton in React Context
- Provides simplified hooks API
- Debug mode support
- Global error handler

**Imports**:
- From `@/lib/events/EventBus` (singleton instance)
- Lightweight wrapper layer

**Usage Pattern**:
```tsx
// App.tsx
<EventBusProvider debug={isDev}>
  <App />
</EventBusProvider>

// Components
const { emit, on } = useEventBus();
```

---

### 2. AuthContext (src/contexts/)

**File**: `AuthContext.tsx` (622 lines)

**Architecture**:
```tsx
AuthContext (createContext)
  ↓
AuthProvider
  - Supabase auth listener
  - JWT claims parsing
  - Role management
  - Permission checks
  ↓
useAuth() hook
  - user, session, role
  - login(), logout()
  - hasPermission()
  - canAccessModule()
```

**Key Features**:
- Supabase integration (auth state listener)
- JWT custom claims (`user_role`, `is_active`)
- Role-based access control (RBAC)
- Permission registry integration
- Session persistence

**Dependencies**:
- `@/lib/supabase/client`
- `@/config/PermissionsRegistry`

**Usage**: 30+ components (auth guards, protected routes, permission checks)

---

### 3. LocationContext (src/contexts/)

**File**: `LocationContext.tsx` (289 lines)

**Architecture**:
```tsx
LocationContext (createContext)
  ↓
LocationProvider
  - Fetch locations from API
  - localStorage persistence
  - EventBus integration
  - Capability check (multi-location enabled?)
  ↓
useLocation() hook
  - locations[]
  - selectedLocation
  - selectLocation()
  - selectAllLocations()
  - isMultiLocationMode
```

**Key Features**:
- Multi-location support
- localStorage persistence (`selected_location_id`)
- EventBus events: `location.selected`, `location.all.selected`
- Capability-aware (checks if multi-location enabled)
- Loading/error states

**Dependencies**:
- `@/lib/locations/locationsApi`
- `@/store/capabilityStore` (Zustand)
- EventBus

**Usage**: Materials, Staff, Fulfillment pages + Sidebar

---

### 4. NavigationContext (src/contexts/)

**File**: `NavigationContext.tsx` (963 lines - LARGEST)

**Architecture**: Complex 3-context split
```tsx
NavigationStateContext - Navigation data
  - modules[]
  - currentModule
  - breadcrumbs

NavigationLayoutContext - UI state
  - isMobile
  - sidebarCollapsed
  - showBottomNav

NavigationActionsContext - Functions
  - navigate()
  - toggleSidebar()
  - setBreadcrumbs()
  ↓
NavigationProvider (useReducer pattern)
  - Module structure from config
  - Route-based current module detection
  - Breadcrumb management
  - Mobile responsive logic
```

**Key Features**:
- **Performance optimized** (3-context split prevents unnecessary re-renders)
- useReducer for complex state management
- React Router integration
- Dynamic module structure from config
- Capability filtering (shows only available modules)
- Mobile/desktop adaptive UI

**Dependencies**:
- `react-router-dom`
- `@/store/capabilityStore`
- `@/lib/modules/useModuleNavigation`
- `@/contexts/AuthContext`

**Hooks Exported**:
- `useNavigationState()` - read navigation data
- `useNavigationLayout()` - read layout state
- `useNavigationActions()` - call functions only

**Usage**: 20+ navigation components (Sidebar, Header, Breadcrumb, etc.)

---

### 5. AlertsProvider (src/shared/alerts/)

**File**: `AlertsProvider.tsx` (818 lines)

**Architecture**: Split context pattern
```tsx
AlertsStateContext - Data
  - alerts[]
  - stats
  - config

AlertsActionsContext - Functions
  - addAlert()
  - removeAlert()
  - updateAlert()
  - clearAlerts()
  ↓
AlertsProvider
  - In-memory alerts management
  - Toast auto-dismiss timers
  - EventBus integration
  - Debounced batch operations
```

**Key Features**:
- **Performance optimized** (state/actions split)
- Toast notifications with auto-dismiss
- Notification center (persistent alerts)
- EventBus integration (subscribes to `alert.*` events)
- Configurable behavior (duration, position, sound, etc.)
- Alert lifecycle: `pending` → `active` → `dismissed`/`resolved`
- Stats tracking (by severity, status)

**Hooks Exported**:
- `useAlerts()` - full context (use sparingly)
- `useAlertsState()` - read-only data
- `useAlertsActions()` - functions only (no re-renders)

**Usage**: 20+ components (hooks, modules, pages)

---

## 🤔 Architectural Decision Analysis

### Option A: Consolidate All to `src/providers/`

**Structure**:
```
src/providers/
├── EventBusProvider.tsx
├── AuthProvider.tsx
├── LocationProvider.tsx
├── NavigationProvider.tsx
└── AlertsProvider.tsx
```

**Pros**:
- ✅ Single source of truth for providers
- ✅ Easy discovery
- ✅ Consistent naming convention

**Cons**:
- ❌ Breaks Screaming Architecture (alerts is a shared feature, not just a provider)
- ❌ Loses domain context (alerts system has types, hooks, components)
- ❌ Mixed concerns (some are pure context, AlertsProvider is a feature system)

**Impact**: 32+ imports to update (`@/contexts/` → `@/providers/`)

---

### Option B: Consolidate to `src/contexts/`

**Structure**:
```
src/contexts/
├── AuthContext.tsx
├── LocationContext.tsx
├── NavigationContext.tsx
├── EventBusContext.tsx (rename from EventBusProvider)
└── AlertsContext.tsx (move from shared/alerts)
```

**Pros**:
- ✅ Already the main location (3/5 providers)
- ✅ Standard React convention (`contexts/` folder)
- ✅ Minimal changes (only 2 moves)

**Cons**:
- ❌ Breaks AlertsProvider colocation with its feature domain
- ❌ EventBus is not "just context" - it's an integration layer
- ❌ Less obvious which are "infrastructure" vs "feature"

**Impact**: 3 imports to update (`@/providers/` → `@/contexts/`)

---

### Option C: Keep Current + Rename for Clarity (RECOMMENDED)

**Structure**:
```
src/contexts/
├── AuthContext.tsx
├── LocationContext.tsx
└── NavigationContext.tsx

src/lib/events/
└── EventBusProvider.tsx (move closer to EventBus itself)

src/shared/alerts/
├── AlertsProvider.tsx
├── types.ts
├── hooks/
└── components/
```

**Rationale**:

1. **`src/contexts/` for Global State Contexts**
   - ✅ Auth, Location, Navigation are pure global state
   - ✅ No tight coupling to specific features
   - ✅ Standard React pattern

2. **`src/lib/events/` for EventBus Integration**
   - ✅ Colocated with EventBus implementation
   - ✅ EventBusProvider is really a "React wrapper" for `@/lib/events/EventBus`
   - ✅ Clear that it's infrastructure, not app state

3. **`src/shared/alerts/` for Feature-Complete System**
   - ✅ AlertsProvider is part of entire alerts domain
   - ✅ Keeps types, hooks, components together
   - ✅ Screaming Architecture: folder name tells you what it does

**Pros**:
- ✅ Architectural clarity (state vs infrastructure vs features)
- ✅ Minimal breaking changes (only EventBusProvider moves)
- ✅ Respects Screaming Architecture
- ✅ Colocation benefits preserved

**Cons**:
- ⚠️ Providers in 2 locations (but semantically different)

**Impact**: 2 imports to update (`@/providers/EventBusProvider` → `@/lib/events/EventBusProvider`)

---

### Option D: Delete `src/providers/` Entirely + Integrate EventBus Directly

**Pattern**: Remove EventBusProvider wrapper, use EventBus singleton directly

**Rationale**:
- EventBus is already a singleton (`@/lib/events/EventBus`)
- Provider adds React Context wrapper for DI (Dependency Injection)
- Most modules can import EventBus directly: `import EventBus from '@/lib/events'`

**Current Provider Value**:
```tsx
// EventBusProvider wraps singleton in Context
<EventBusProvider>  
  {children}
</EventBusProvider>

// Components use hook
const { emit, on } = useEventBus();
```

**Alternative - Direct Import**:
```tsx
// No provider needed
import EventBus from '@/lib/events';

// In components
EventBus.emit('event', data);
EventBus.on('pattern', handler);
```

**Pros**:
- ✅ Simplifies architecture (removes abstraction layer)
- ✅ EventBus already designed as singleton
- ✅ No provider nesting needed
- ✅ Deletes entire `src/providers/` folder

**Cons**:
- ⚠️ Loses React Context DI pattern (harder to mock in tests)
- ⚠️ Debug mode becomes global flag vs per-Provider prop
- ⚠️ Less "React-like" (Context is idiomatic)

**Impact**: 
- 2 files to update (remove useEventBus, use EventBus directly)
- Tests need adjustment (mock EventBus module vs Context)

---

## 📊 Provider Comparison Matrix

| Provider | Lines | Pattern | Dependencies | Split Context? | Usage |
|----------|-------|---------|--------------|----------------|-------|
| EventBusProvider | 212 | Wrapper | EventBus singleton | ❌ | 2 files |
| AuthContext | 622 | State + Auth | Supabase, Permissions | ❌ | 30+ files |
| LocationContext | 289 | State + API | Locations API, EventBus | ❌ | 10+ files |
| NavigationContext | 963 | State + Router | React Router, Capabilities | ✅ (3-way) | 20+ files |
| AlertsProvider | 818 | Feature System | EventBus, Batch Processing | ✅ (2-way) | 20+ files |

---

## 🎯 Recommendations

### Recommended: Option C + Refinement

**Actions**:

1. **Move EventBusProvider to `src/lib/events/`**
   ```
   src/lib/events/
   ├── EventBus.ts (singleton)
   ├── EventBusProvider.tsx (React wrapper)
   └── types.ts
   ```
   - Update imports: `@/providers/EventBusProvider` → `@/lib/events/EventBusProvider`
   - Impact: 2 files (App.tsx, EventBusDebugger.tsx)

2. **Keep `src/contexts/` for Global State**
   - ✅ No changes needed
   - Already optimal location for Auth, Location, Navigation

3. **Keep `src/shared/alerts/` for Alerts System**
   - ✅ No changes needed
   - AlertsProvider colocated with feature domain

4. **Delete `src/providers/` folder**
   - After moving EventBusProvider, folder is empty
   - Eliminates ambiguity

---

### Alternative: Option D (More Radical)

If we want maximum simplicity:

1. **Remove EventBusProvider entirely**
   - Use EventBus singleton directly
   - Delete `src/providers/EventBusProvider.tsx`
   - Update 2 files to import EventBus directly

2. **Keep other contexts as-is**
   - Auth, Location, Navigation have React-specific state
   - AlertsProvider manages complex UI state
   - These genuinely benefit from Context pattern

---

## 🚀 Migration Plan (Option C)

### Phase 1: Move EventBusProvider (15 min)

```powershell
# Move file
Move-Item "src/providers/EventBusProvider.tsx" "src/lib/events/"

# Update imports (2 files)
# App.tsx: @/providers/EventBusProvider → @/lib/events/EventBusProvider
# EventBusDebugger.tsx: @/providers/EventBusProvider → @/lib/events/EventBusProvider
```

**Files to update**:
1. `src/App.tsx` - line 46
2. `src/components/debug/EventBusDebugger.tsx` - line 30

---

### Phase 2: Delete Empty Folder (1 min)

```powershell
Remove-Item "src/providers" -Recurse
```

---

### Phase 3: Verify TypeScript (2 min)

```powershell
pnpm -s exec tsc --noEmit
```

---

## 📝 Summary

### Current State Issues
- ❌ Providers scattered across 3 locations
- ❌ Inconsistent architectural pattern
- ❌ `src/providers/` folder with only 1 file
- ❌ Unclear distinction between "global state" vs "infrastructure"

### Proposed Solution Benefits
- ✅ Clear semantic separation:
  - **Contexts** = Global App State (Auth, Location, Navigation)
  - **Lib** = Infrastructure Integrations (EventBus React wrapper)
  - **Shared** = Feature Systems (Alerts with Provider, types, hooks, components)
- ✅ Screaming Architecture preserved
- ✅ Minimal breaking changes (2 imports)
- ✅ Eliminates ambiguous folder
- ✅ Easier maintenance and discovery

---

## 🔍 Decision Matrix

| Criterion | Option A (All to providers/) | Option B (All to contexts/) | **Option C (Current + Move EventBus)** | Option D (Delete Provider) |
|-----------|------------------------------|-----------------------------|-----------------------------------------|---------------------------|
| Architectural Clarity | ⚠️ Mixed | ⚠️ Mixed | ✅ Semantic | ✅✅ Minimal |
| Screaming Architecture | ❌ Breaks | ❌ Breaks | ✅ Preserved | ✅ Preserved |
| Breaking Changes | 32+ imports | 3 imports | **2 imports** | 2 imports |
| Colocation Benefits | ❌ Lost | ❌ Lost | ✅ Kept | ✅ Kept |
| Complexity | Medium | Low | **Low** | Very Low |
| React Conventions | ✅ Provider pattern | ✅ Context pattern | ✅ Both | ⚠️ Singleton only |

**Winner**: Option C - Best balance of clarity, minimal changes, and architectural integrity

---

*Analysis Date: 2025-12-30*  
*Providers Analyzed: 5 (EventBus, Auth, Location, Navigation, Alerts)*  
*Total Provider Code: 2,904 lines*
