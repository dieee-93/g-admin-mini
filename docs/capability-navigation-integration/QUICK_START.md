# Quick Start Guide - Route Protection

**5-minute guide to using the capability-based route protection system**

---

## ⚡ Quick Examples

### Protect a Route

```typescript
import { RoleGuard } from '@/components/auth/RoleGuard';

<Route
  path="/admin/my-feature"
  element={
    <RoleGuard requiredModule="my-module">
      <MyFeaturePage />
    </RoleGuard>
  }
/>
```

That's it! The route is now protected and will:
- ✅ Show page if module is active
- ❌ Show "Module Not Available" if inactive

---

## 🔧 Common Use Cases

### 1. Standard Module Route

```typescript
<Route
  path="/admin/operations/sales"
  element={
    <RoleGuard requiredModule="sales">
      <SalesPage />
    </RoleGuard>
  }
/>
```

### 2. Route with Role Requirement

```typescript
<Route
  path="/admin/sensitive-data"
  element={
    <RoleGuard
      requiredModule="data-access"
      requiredRoles={['admin', 'manager']}
    >
      <SensitiveDataPage />
    </RoleGuard>
  }
/>
```

### 3. Legacy Route (Skip Capability Check)

```typescript
<Route
  path="/admin/settings"
  element={
    <RoleGuard
      requiredModule="settings"
      requireModuleActive={false}  // Bypass activation check
    >
      <SettingsPage />
    </RoleGuard>
  }
/>
```

### 4. Custom Fallback

```typescript
<RoleGuard
  requiredModule="premium-feature"
  fallback={<UpgradePrompt />}
>
  <PremiumFeature />
</RoleGuard>
```

---

## 📋 RoleGuard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `requiredModule` | `ModuleName` | - | Module that must be active |
| `requireModuleActive` | `boolean` | `true` | Check if module is activated |
| `requiredRoles` | `UserRole[]` | - | Required user roles |
| `requiredAction` | `PermissionAction` | - | Required permission action |
| `fallback` | `ReactNode` | `<ModuleNotAvailable />` | Custom error component |

---

## 🧪 Testing Your Protected Routes

```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import { businessProfileKeys } from '@/lib/capabilities';

it('blocks inactive modules', () => {
  const queryClient = new QueryClient();

  // Mock: module is INACTIVE
  const profile = {
    selectedCapabilities: ['other_capability'],
    // ... other fields
  };
  queryClient.setQueryData(businessProfileKeys.detail(), profile);

  render(
    <QueryClientProvider client={queryClient}>
      <FeatureFlagProvider>
        <MemoryRouter initialEntries={['/admin/my-module']}>
          <Routes>
            <Route
              path="/admin/my-module"
              element={
                <RoleGuard requiredModule="my-module">
                  <MyPage />
                </RoleGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      </FeatureFlagProvider>
    </QueryClientProvider>
  );

  // Should NOT see page
  expect(screen.queryByText('MyPage')).not.toBeInTheDocument();

  // Should see error
  expect(screen.getByText(/Module Not Available/i)).toBeInTheDocument();
});
```

---

## 🚨 Common Gotchas

### 1. Module Name Mismatch

```typescript
// ❌ Wrong: ID doesn't match ModuleName
<RoleGuard requiredModule="wrong-name">

// ✅ Correct: Use actual ModuleName from AuthContext
<RoleGuard requiredModule="sales">
```

### 2. Forgetting to Import

```typescript
// ❌ Wrong: Direct import
import { Box } from '@chakra-ui/react';

// ✅ Correct: Use shared UI
import { Box } from '@/shared/ui';
```

### 3. Bypassing Protection

```typescript
// ❌ Dangerous: No protection at all
<Route path="/admin/sales" element={<SalesPage />} />

// ✅ Safe: Always use RoleGuard for module routes
<Route
  path="/admin/sales"
  element={
    <RoleGuard requiredModule="sales">
      <SalesPage />
    </RoleGuard>
  }
/>
```

---

## 🔍 Debugging Tips

### Check if Module is Active

```typescript
import { useFeatureFlags } from '@/lib/capabilities';

function MyComponent() {
  const { isModuleActive } = useFeatureFlags();

  console.log('Sales active?', isModuleActive('sales'));
  console.log('Materials active?', isModuleActive('materials'));

  // ...
}
```

### Check Active Modules List

```typescript
import { useFeatureFlags } from '@/lib/capabilities';

function DebugComponent() {
  const { activeModules } = useFeatureFlags();

  console.log('All active modules:', activeModules);
  // ['dashboard', 'settings', 'sales', 'materials', ...]

  return null;
}
```

### Check User's Capabilities

```typescript
import { useBusinessProfile } from '@/lib/capabilities';

function DebugComponent() {
  const { profile } = useBusinessProfile();

  console.log('User capabilities:', profile?.selectedCapabilities);
  // ['physical_products', 'professional_services']

  return null;
}
```

---

## 📚 Need More Help?

- **Full Documentation**: See `IMPLEMENTATION_SUMMARY.md`
- **Architecture Guide**: See `docs/capabilities/DEVELOPER_GUIDE.md`
- **Module System**: See `src/modules/README.md`
- **Tests Examples**: See `src/__tests__/navigation-integration/`

---

**Happy Coding! 🚀**
