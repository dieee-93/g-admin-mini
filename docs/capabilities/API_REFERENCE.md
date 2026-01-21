# API Reference

**Complete API documentation for the Capability-Features System**

**Version**: 4.0
**Last Updated**: 2025-01-20

---

## Table of Contents

1. [capabilityStore API](#capabilitystore-api)
2. [Convenience Hooks](#convenience-hooks)
3. [Registry Functions](#registry-functions)
4. [Type Definitions](#type-definitions)

---

## capabilityStore API

**Location**: `src/store/capabilityStore.ts`

### State Shape

```typescript
interface CapabilityStoreState {
  profile: UserProfile | null;
  features: FeatureState;
  isLoading: boolean;
}

interface UserProfile {
  businessId?: string;
  businessName: string;
  businessType: string;
  email: string;
  phone: string;
  country: string;
  currency: string;
  selectedCapabilities: BusinessCapabilityId[];
  selectedInfrastructure: InfrastructureId[];
  setupCompleted: boolean;
  isFirstTimeInDashboard: boolean;
  onboardingStep: number;
  completedMilestones?: string[];
}

interface FeatureState {
  activeFeatures: FeatureId[];
  blockedFeatures: FeatureId[];
  pendingMilestones: string[];
  completedMilestones: string[];
  validationErrors: Array<{
    field: string;
    message: string;
    redirectTo: string;
  }>;
  activeSlots: Array<{
    id: string;
    component: string;
    priority: number;
  }>;
}
```

---

### Actions

#### `initializeProfile(data: Partial<UserProfile>): void`

Initialize or update the user profile with capability/infrastructure selections.

**Parameters**:
- `data`: Partial user profile data

**Behavior**:
1. Merges data with default profile
2. Activates features via FeatureActivationEngine
3. Updates store state
4. No automatic DB persistence (use `saveToDB()`)

**Example**:
```typescript
const { initializeProfile } = useCapabilityStore();

initializeProfile({
  businessName: 'My Coffee Shop',
  selectedCapabilities: ['physical_products', 'onsite_service'],
  selectedInfrastructure: ['single_location']
});
```

---

#### `toggleCapability(capabilityId: BusinessCapabilityId): void`

Add or remove a capability from the user's selection.

**Parameters**:
- `capabilityId`: ID of capability to toggle

**Behavior**:
1. Adds if not present, removes if present
2. Recomputes active features
3. Persists to database (async, doesn't wait)
4. Emits `user_choice.capability_selected` event if added

**Example**:
```typescript
const { toggleCapability } = useCapabilityStore();

// Enable delivery
toggleCapability('delivery_shipping');

// Disable delivery (call again)
toggleCapability('delivery_shipping');
```

---

#### `setCapabilities(capabilities: BusinessCapabilityId[]): void`

Replace all capabilities with a new set.

**Parameters**:
- `capabilities`: Array of capability IDs

**Behavior**:
1. Replaces entire capability array
2. Recomputes active features
3. Persists to database (async)

**Example**:
```typescript
const { setCapabilities } = useCapabilityStore();

// Set multiple capabilities at once
setCapabilities([
  'physical_products',
  'onsite_service',
  'pickup_orders',
  'delivery_shipping'
]);
```

---

#### `setInfrastructure(infraId: InfrastructureId): void`

Set infrastructure (single-select).

**Parameters**:
- `infraId`: Infrastructure ID

**Behavior**:
1. Replaces infrastructure with single value
2. Does NOT recompute features (call after full setup)

**Example**:
```typescript
const { setInfrastructure } = useCapabilityStore();

setInfrastructure('multi_location');
```

---

#### `toggleInfrastructure(infraId: InfrastructureId): void`

Toggle infrastructure (multi-select).

**Parameters**:
- `infraId`: Infrastructure ID to toggle

**Behavior**:
1. Adds or removes infrastructure
2. Recomputes features with ALL selected infrastructure
3. Persists to database (async)
4. Emits `user_choice.infrastructure_toggled` event

**Example**:
```typescript
const { toggleInfrastructure } = useCapabilityStore();

// Enable multi-location
toggleInfrastructure('multi_location');

// Also enable mobile operations
toggleInfrastructure('mobile_business');

// Now has both: ['single_location', 'multi_location', 'mobile_business']
```

---

#### `updateProfile(updates: Partial<UserProfile>): void`

Update profile fields (non-capability changes).

**Parameters**:
- `updates`: Fields to update

**Behavior**:
1. Merges updates into profile
2. Persists to database (async)
3. Does NOT recompute features

**Example**:
```typescript
const { updateProfile } = useCapabilityStore();

updateProfile({
  businessName: 'New Name',
  phone: '+1234567890',
  email: 'new@email.com'
});
```

---

#### `completeSetup(): void`

Mark setup wizard as completed.

**Behavior**:
1. Sets `setupCompleted: true`
2. Sets `isFirstTimeInDashboard: true`
3. Sets `onboardingStep: 1`
4. Persists to database (async)
5. Emits `setup.completed` event

**Example**:
```typescript
const { completeSetup } = useCapabilityStore();

// After user finishes setup wizard
completeSetup();
```

---

#### `dismissWelcome(): void`

Dismiss first-time dashboard welcome screen.

**Behavior**:
1. Sets `isFirstTimeInDashboard: false`
2. Persists to database (async)

**Example**:
```typescript
const { dismissWelcome } = useCapabilityStore();

// User clicks "Got it" on welcome modal
dismissWelcome();
```

---

#### `resetProfile(): void`

Reset store to initial state (clears everything).

**Behavior**:
1. Sets `profile: null`
2. Resets features to defaults
3. Sets `isLoading: false`
4. Does NOT clear database

**Example**:
```typescript
const { resetProfile } = useCapabilityStore();

// Logout or complete reset
resetProfile();
```

---

### Database Actions

#### `loadFromDB(): Promise<boolean>`

Load profile from Supabase.

**Returns**: `Promise<boolean>`
- `true` if loaded successfully
- `false` if no profile found or error

**Behavior**:
1. Fetches profile from `business_profiles` table
2. Anti-overwrite protection: Won't overwrite localStorage with empty DB data
3. Calls `initializeProfile()` with loaded data
4. Sets `isLoading: false`

**Example**:
```typescript
const { loadFromDB } = useCapabilityStore();

// On app startup
const loaded = await loadFromDB();
if (!loaded) {
  // Redirect to setup wizard
  navigate('/setup');
}
```

---

#### `saveToDB(): Promise<boolean>`

Save profile to Supabase.

**Returns**: `Promise<boolean>`
- `true` if saved successfully
- `false` if error or no profile

**Behavior**:
1. Saves current profile to `business_profiles` table
2. Upserts by `businessId` if exists

**Example**:
```typescript
const { saveToDB } = useCapabilityStore();

// Manual save
const saved = await saveToDB();
if (!saved) {
  showError('Failed to save profile');
}
```

**Note**: Most actions auto-save, manual save rarely needed.

---

### Computed Getters

#### `hasFeature(featureId: FeatureId): boolean`

Check if a feature is active.

**Parameters**:
- `featureId`: Feature ID to check

**Returns**: `boolean` - true if feature is active

**Example**:
```typescript
const { hasFeature } = useCapabilityStore();

if (hasFeature('sales_pos_onsite')) {
  // Show POS interface
}
```

---

#### `hasAllFeatures(featureIds: FeatureId[]): boolean`

Check if ALL features are active (AND logic).

**Parameters**:
- `featureIds`: Array of feature IDs

**Returns**: `boolean` - true if ALL are active

**Example**:
```typescript
const { hasAllFeatures } = useCapabilityStore();

const canUseDelivery = hasAllFeatures([
  'operations_delivery_zones',
  'operations_delivery_tracking'
]);

if (canUseDelivery) {
  // Show delivery module
}
```

---

#### `isFeatureBlocked(featureId: FeatureId): boolean`

Check if a feature is blocked by requirements.

**Parameters**:
- `featureId`: Feature ID to check

**Returns**: `boolean` - true if blocked

**Example**:
```typescript
const { isFeatureBlocked } = useCapabilityStore();

if (isFeatureBlocked('sales_online_order_processing')) {
  // Show "Complete requirements" message
}
```

---

#### `getActiveSlots(): Array<{ id, component, priority }>`

Get active widget slots (legacy system, returns empty array).

**Returns**: Empty array

**Note**: Replaced by Hook System, kept for backward compatibility.

---

#### `getActiveModules(): string[]`

Get modules that should be visible in navigation.

**Returns**: `string[]` - Array of module IDs

**Example**:
```typescript
const { getActiveModules } = useCapabilityStore();

const modules = getActiveModules();
// ['dashboard', 'sales', 'materials', 'operations', ...]
```

---

## Convenience Hooks

### `useCapabilities()`

Main hook for accessing capabilities store.

**Returns**: Object with state, actions, and getters

**Example**:
```typescript
import { useCapabilities } from '@/store/capabilityStore';

function MyComponent() {
  const {
    // State
    profile,
    activeFeatures,
    blockedFeatures,
    pendingMilestones,
    completedMilestones,
    validationErrors,
    visibleModules,
    isLoading,

    // Actions
    initializeProfile,
    toggleCapability,
    setCapabilities,
    setInfrastructure,
    toggleInfrastructure,
    updateProfile,
    completeSetup,
    dismissWelcome,
    resetProfile,

    // Database
    loadFromDB,
    saveToDB,

    // Getters
    hasFeature,
    hasAllFeatures,
    isFeatureBlocked,

    // Computed
    isSetupComplete,
    isFirstTime
  } = useCapabilities();

  // Use any of the above
}
```

**Performance**: Wrapped with `React.useMemo` to prevent unnecessary re-renders.

**When to use**: When you need multiple store values/actions.

---

### `useActiveFeatures()`

Get active features (performance-optimized selector).

**Returns**: `FeatureId[]`

**Example**:
```typescript
import { useActiveFeatures } from '@/store/capabilityStore';

function FeatureCounter() {
  const activeFeatures = useActiveFeatures();

  return <div>{activeFeatures.length} active features</div>;
}
```

**Performance**: Only re-renders when `activeFeatures` changes.

---

### `usePendingMilestones()`

Get pending milestones (performance-optimized).

**Returns**: `string[]`

**Example**:
```typescript
import { usePendingMilestones } from '@/store/capabilityStore';

function AchievementsBadge() {
  const pending = usePendingMilestones();

  if (pending.length === 0) return null;

  return <Badge count={pending.length} color="yellow" />;
}
```

---

### `useBlockedFeatures()`

Get blocked features (performance-optimized).

**Returns**: `FeatureId[]`

**Example**:
```typescript
import { useBlockedFeatures } from '@/store/capabilityStore';

function BlockedFeaturesAlert() {
  const blocked = useBlockedFeatures();

  if (blocked.length === 0) return null;

  return (
    <Alert>
      {blocked.length} features are blocked. Complete requirements to unlock.
    </Alert>
  );
}
```

---

### `useValidationErrors()`

Get validation errors (performance-optimized).

**Returns**: Array of `{ field, message, redirectTo }`

**Example**:
```typescript
import { useValidationErrors } from '@/store/capabilityStore';

function ValidationAlerts() {
  const errors = useValidationErrors();

  return (
    <div>
      {errors.map(error => (
        <Alert key={error.field} onClick={() => navigate(error.redirectTo)}>
          {error.message}
        </Alert>
      ))}
    </div>
  );
}
```

---

### `useIsSetupComplete()`

Check if setup is complete (performance-optimized).

**Returns**: `boolean`

**Example**:
```typescript
import { useIsSetupComplete } from '@/store/capabilityStore';

function App() {
  const setupComplete = useIsSetupComplete();

  if (!setupComplete) {
    return <SetupWizard />;
  }

  return <Dashboard />;
}
```

---

### `useIsFirstTimeInDashboard()`

Check if it's user's first time in dashboard (performance-optimized).

**Returns**: `boolean`

**Example**:
```typescript
import { useIsFirstTimeInDashboard } from '@/store/capabilityStore';

function Dashboard() {
  const isFirstTime = useIsFirstTimeInDashboard();

  return (
    <div>
      {isFirstTime && <WelcomeModal />}
      <DashboardContent />
    </div>
  );
}
```

---

### `useFeature(featureId: FeatureId)`

Check single feature (performance-optimized).

**Parameters**:
- `featureId`: Feature ID to check

**Returns**: `boolean`

**Example**:
```typescript
import { useFeature } from '@/store/capabilityStore';

function POSPanel() {
  const hasPOS = useFeature('sales_pos_onsite');

  if (!hasPOS) return null;

  return <POSInterface />;
}
```

**Performance**: Only re-renders when that specific feature's status changes.

---

### `useModuleAccess(moduleId: string)`

Check if module is accessible (performance-optimized).

**Parameters**:
- `moduleId`: Module ID to check

**Returns**: `boolean`

**Example**:
```typescript
import { useModuleAccess } from '@/store/capabilityStore';

function Navigation() {
  const hasSales = useModuleAccess('sales');
  const hasRentals = useModuleAccess('rentals');

  return (
    <nav>
      {hasSales && <NavItem to="/admin/sales" />}
      {hasRentals && <NavItem to="/admin/rentals" />}
    </nav>
  );
}
```

---

## Registry Functions

### BusinessModelRegistry

**Location**: `src/config/BusinessModelRegistry.ts`

#### `getCapability(id: BusinessCapabilityId)`

```typescript
function getCapability(id: BusinessCapabilityId): BusinessCapability | undefined
```

Get capability definition by ID.

**Example**:
```typescript
import { getCapability } from '@/config/BusinessModelRegistry';

const cap = getCapability('physical_products');
console.log(cap.name); // "Productos Físicos"
console.log(cap.activatesFeatures.length); // 18
```

---

#### `getInfrastructure(id: InfrastructureId)`

```typescript
function getInfrastructure(id: InfrastructureId): Infrastructure | undefined
```

Get infrastructure definition by ID.

**Example**:
```typescript
import { getInfrastructure } from '@/config/BusinessModelRegistry';

const infra = getInfrastructure('multi_location');
console.log(infra.name); // "Múltiples Locales"
```

---

#### `getAllCapabilities()`

```typescript
function getAllCapabilities(): BusinessCapability[]
```

Get all capability definitions.

**Example**:
```typescript
import { getAllCapabilities } from '@/config/BusinessModelRegistry';

const all = getAllCapabilities();
all.forEach(cap => {
  console.log(`${cap.icon} ${cap.name}`);
});
```

---

#### `getAllInfrastructures()`

```typescript
function getAllInfrastructures(): Infrastructure[]
```

Get all infrastructure definitions.

---

#### `checkInfrastructureConflicts(infrastructureId, activeInfrastructure)`

```typescript
function checkInfrastructureConflicts(
  infrastructureId: InfrastructureId,
  activeInfrastructure: InfrastructureId[]
): { valid: boolean; conflicts: InfrastructureId[] }
```

Validate infrastructure selection for conflicts.

**Returns**: Object with `valid` and `conflicts` array

**Example**:
```typescript
import { checkInfrastructureConflicts } from '@/config/BusinessModelRegistry';

const result = checkInfrastructureConflicts(
  'mobile_business',
  ['single_location']
);

if (!result.valid) {
  console.log('Conflicts:', result.conflicts);
}
```

---

#### `getActivatedFeatures(capabilities, infrastructure)`

```typescript
function getActivatedFeatures(
  capabilities: BusinessCapabilityId[],
  infrastructure: InfrastructureId[]
): FeatureId[]
```

Get all features activated by user choices (deduplicated).

**Example**:
```typescript
import { getActivatedFeatures } from '@/config/BusinessModelRegistry';

const features = getActivatedFeatures(
  ['physical_products', 'onsite_service'],
  ['single_location']
);

console.log(features.length); // 30+
```

---

#### `getBlockingRequirements(capabilities, infrastructure)`

```typescript
function getBlockingRequirements(
  capabilities: BusinessCapabilityId[],
  infrastructure: InfrastructureId[]
): string[]
```

Get all blocking requirements (deduplicated).

**Example**:
```typescript
import { getBlockingRequirements } from '@/config/BusinessModelRegistry';

const requirements = getBlockingRequirements(
  ['onsite_service'],
  ['single_location']
);

console.log(requirements);
// ['business_address_required', 'operating_hours_required']
```

---

### FeatureRegistry

**Location**: `src/config/FeatureRegistry.ts`

#### `getFeature(id: FeatureId)`

```typescript
function getFeature(id: FeatureId): Feature | undefined
```

Get feature definition by ID.

---

#### `getAllFeatures()`

```typescript
function getAllFeatures(): Feature[]
```

Get all feature definitions.

---

#### `getFeaturesByDomain(domain: Feature['domain'])`

```typescript
function getFeaturesByDomain(domain: Feature['domain']): Feature[]
```

Get features by domain.

**Example**:
```typescript
import { getFeaturesByDomain } from '@/config/FeatureRegistry';

const salesFeatures = getFeaturesByDomain('SALES');
console.log(salesFeatures.length); // 26
```

---

#### `getFeaturesByCategory(category: Feature['category'])`

```typescript
function getFeaturesByCategory(category: Feature['category']): Feature[]
```

Get features by category.

---

#### `getModulesForActiveFeatures(features: FeatureId[])`

```typescript
function getModulesForActiveFeatures(features: FeatureId[]): string[]
```

**CRITICAL FUNCTION** - Determines which modules are visible.

**Example**:
```typescript
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';

const modules = getModulesForActiveFeatures([
  'sales_order_management',
  'inventory_stock_tracking'
]);

console.log(modules);
// ['dashboard', 'settings', 'sales', 'materials', 'products', ...]
```

---

#### `hasFeature(id: string)`

```typescript
function hasFeature(id: string): id is FeatureId
```

Type-safe feature ID validation (type predicate).

---

#### `getFeaturesByDomainGrouped()`

```typescript
function getFeaturesByDomainGrouped(): Record<Feature['domain'], Feature[]>
```

Get features grouped by domain.

---

#### `countFeaturesByDomain()`

```typescript
function countFeaturesByDomain(): Record<Feature['domain'], number>
```

Get feature counts per domain.

---

### Capability-Requirements Mapping

**Location**: `src/modules/achievements/requirements/capability-mapping.ts`

#### `getRequirementsForCapabilities(selectedCapabilities)`

```typescript
function getRequirementsForCapabilities(
  selectedCapabilities: BusinessCapabilityId[]
): Achievement[]
```

Get all requirements for selected capabilities (deduplicated).

---

#### `getRequirementsForCapability(capability)`

```typescript
function getRequirementsForCapability(
  capability: BusinessCapabilityId
): Achievement[]
```

Get requirements for a single capability.

---

#### `hasRequirements(capability)`

```typescript
function hasRequirements(capability: BusinessCapabilityId): boolean
```

Check if capability has configured requirements.

---

#### `getRequirementsMappingStats()`

```typescript
function getRequirementsMappingStats(): {
  totalCapabilities: number;
  totalRequirementsBeforeDedup: number;
  totalRequirementsAfterDedup: number;
  deduplicationSavings: number;
  averageRequirementsPerCapability: string;
}
```

Get statistics about requirement mapping.

---

## Type Definitions

### Core Types

**Location**: Primarily in `src/config/types.ts` or individual registry files

```typescript
// Business Capability
type BusinessCapabilityId =
  | 'physical_products'
  | 'professional_services'
  | 'asset_rental'
  | 'membership_subscriptions'
  | 'digital_products'
  | 'onsite_service'
  | 'pickup_orders'
  | 'delivery_shipping'
  | 'async_operations'
  | 'corporate_sales'
  | 'mobile_operations';

interface BusinessCapability {
  id: BusinessCapabilityId;
  name: string;
  description: string;
  icon: string;
  type: 'business_model' | 'fulfillment' | 'special_operation';
  activatesFeatures: FeatureId[];
  blockingRequirements: string[];
}

// Infrastructure
type InfrastructureId =
  | 'single_location'
  | 'multi_location'
  | 'mobile_business';

interface Infrastructure {
  id: InfrastructureId;
  name: string;
  description: string;
  icon: string;
  type: 'infrastructure';
  conflicts: InfrastructureId[];
  activatesFeatures: FeatureId[];
  blockingRequirements: string[];
}

// Feature
type FeatureId = string; // 111+ feature IDs

interface Feature {
  id: FeatureId;
  name: string;
  description: string;
  domain: FeatureDomain;
  category: 'conditional'; // Note: 'always_active' removed in v5.0
}

type FeatureDomain =
  | 'SALES'
  | 'INVENTORY'
  | 'PRODUCTION'
  | 'PRODUCTS'
  | 'OPERATIONS'
  | 'SCHEDULING'
  | 'CUSTOMER'
  | 'FINANCE'
  | 'STAFF'
  | 'MOBILE'
  | 'MULTISITE'
  | 'ANALYTICS'
  | 'RENTAL'
  | 'MEMBERSHIP'
  | 'DIGITAL'
  | 'CORE'
  | 'ENGAGEMENT'
  | 'DEV';

// Achievement (Requirement)
interface Achievement {
  id: string;
  tier: 'mandatory' | 'recommended' | 'optional';
  capability?: BusinessCapabilityId;
  name: string;
  description: string;
  icon: string;
  category: 'setup' | 'operational' | 'growth';
  validator: (context: ValidationContext) => boolean;
  redirectUrl: string;
  estimatedMinutes: number;
}

interface ValidationContext {
  profile?: UserProfile;
  products?: any[];
  materials?: any[];
  customers?: any[];
  staff?: any[];
  tables?: any[];
  deliveryZones?: any[];
  // ... other context
}
```

---

## Events

The system emits events via EventBus:

### `user_choice.capability_selected`

Emitted when capability is added.

```typescript
eventBus.emit('user_choice.capability_selected', {
  capabilityId: BusinessCapabilityId,
  timestamp: number
});
```

---

### `user_choice.infrastructure_toggled`

Emitted when infrastructure is toggled.

```typescript
eventBus.emit('user_choice.infrastructure_toggled', {
  infraId: InfrastructureId,
  isSelected: boolean,
  timestamp: number
});
```

---

### `setup.completed`

Emitted when setup wizard completes.

```typescript
eventBus.emit('setup.completed', {
  profile: UserProfile,
  activeFeatures: FeatureId[],
  pendingMilestones: string[],
  timestamp: number
});
```

---

## Persistence

### LocalStorage (Zustand Persist)

**Key**: `capability-store-v4`

**Persisted**:
- `profile`
- `features.activeFeatures`
- `features.blockedFeatures`
- `features.pendingMilestones`
- `features.completedMilestones`
- `features.validationErrors`
- `features.activeSlots`

**NOT persisted**:
- `isLoading` (transient state)

### Supabase

**Table**: `business_profiles`

**Synced fields**:
- `business_name`
- `business_type`
- `email`
- `phone`
- `country`
- `currency`
- `selected_capabilities` (JSON array)
- `selected_infrastructure` (JSON array)
- `setup_completed`
- `is_first_time_in_dashboard`
- `onboarding_step`
- `completed_milestones` (JSON array)

---

## Hydration Lifecycle

```typescript
// 1. Module loads
// 2. onFinishHydration listener registers (module scope)
// 3. Zustand hydrates from localStorage
// 4. onFinishHydration callback fires
// 5. Features recalculated if needed
// 6. hasHydrated() returns true
// 7. Components can safely read store
```

**Best practice**: Always check `hasHydrated()` or use hydration-aware hooks.

---

## Next Steps

- **For implementation**: See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **For patterns**: See [PATTERNS.md](./PATTERNS.md)
- **For troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
