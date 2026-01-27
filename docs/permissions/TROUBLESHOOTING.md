# Troubleshooting Guide - Roles and Permissions

**Version**: 1.0.0
**Last Updated**: December 21, 2025
**Status**: Complete

Common issues and solutions for the G-Admin Mini permissions system.

---

## Table of Contents

- [Authentication Issues](#authentication-issues)
- [Permission Issues](#permission-issues)
- [Integration Issues](#integration-issues)
- [Performance Issues](#performance-issues)
- [Debugging Commands](#debugging-commands)

---

## Authentication Issues

### User Cannot Log In

**Symptoms**:
- Login form shows "Invalid credentials" error
- Login succeeds but redirects to login again
- Login button stuck in loading state

**Common Causes**:

1. **Invalid Email/Password**
   ```typescript
   // Check credentials are correct
   const { error } = await supabase.auth.signInWithPassword({
     email,
     password
   });
   console.log('Auth error:', error?.message);
   ```

2. **Account Disabled (is_active = false)**
   ```sql
   -- Check if user is active
   SELECT user_id, is_active FROM users_roles WHERE user_id = 'user-id';
   ```

   **Solution**:
   ```sql
   -- Reactivate user
   UPDATE users_roles SET is_active = true WHERE user_id = 'user-id';
   ```

3. **Email Not Confirmed**
   ```sql
   -- Check email confirmation status
   SELECT email, email_confirmed_at FROM auth.users WHERE id = 'user-id';
   ```

   **Solution**:
   ```sql
   -- Manually confirm email (admin operation)
   UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = 'user-id';
   ```

4. **Rate Limited**
   - Wait 60 seconds and try again
   - Check Supabase Dashboard > Auth > Logs for rate limit errors

**Debugging Steps**:
1. Open browser console during login
2. Check network tab for failed requests
3. Look for error messages in Supabase logs
4. Verify user exists in database

---

### Session Expires Unexpectedly

**Symptoms**:
- User logged out after short time
- "Session expired" error appears randomly
- Token refresh fails

**Common Causes**:

1. **Short JWT Expiry**
   - Check Supabase Dashboard > Auth > Settings > JWT Expiry
   - Default: 3600 seconds (1 hour)

   **Solution**: Increase to 86400 seconds (24 hours) if needed

2. **Token Refresh Failure**
   ```typescript
   // Monitor token refresh
   supabase.auth.onAuthStateChange((event, session) => {
     console.log('Auth event:', event);
     if (event === 'TOKEN_REFRESHED') {
       console.log('Token refreshed successfully');
     } else if (event === 'SIGNED_OUT') {
       console.log('Session expired or signed out');
     }
   });
   ```

3. **Session Hijacking Detection**
   - Supabase may invalidate sessions from different IPs
   - Check Supabase logs for security events

**Solution**:
```typescript
// Force token refresh
const refreshRole = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    console.error('Refresh error:', error);
    // Force re-login
    navigate('/login');
  }
};
```

---

### Role Not Being Assigned

**Symptoms**:
- User logs in but has no role
- User always gets CLIENTE role (fallback)
- Role shows as undefined or null

**Common Causes**:

1. **JWT Claims Not Generated**
   ```typescript
   // Check JWT token claims
   const token = session.access_token;
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('JWT Claims:', payload);
   console.log('user_role:', payload.user_role);  // Should exist
   ```

   **Solution**: Check Supabase Hook is deployed
   ```sql
   -- Verify custom_access_token_hook function exists
   SELECT routine_name FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND routine_name = 'custom_access_token_hook';
   ```

2. **Database Role Missing**
   ```sql
   -- Check users_roles table
   SELECT * FROM users_roles WHERE user_id = 'user-id';
   ```

   **Solution**:
   ```sql
   -- Insert missing role
   INSERT INTO users_roles (user_id, role, is_active)
   VALUES ('user-id', 'OPERADOR', true);
   ```

3. **Fallback to CLIENTE**
   - If JWT claims AND database query both fail, system defaults to CLIENTE

   **Debugging**:
   ```typescript
   // In AuthContext.tsx, check logs
   logger.info('Role from JWT:', claims.user_role);
   logger.info('Role from database:', roleData?.role);
   logger.info('Final role:', role);  // Should not be 'CLIENTE' for staff
   ```

---

### JWT Claims Not Working

**Symptoms**:
- user_role claim missing from JWT
- JWT contains error field
- JWT claims don't update after role change

**Common Causes**:

1. **Hook Not Triggered**
   - Supabase Hook must be configured in Dashboard
   - Check Supabase Dashboard > Database > Functions > Hooks

   **Solution**: Verify hook configuration:
   ```sql
   -- Check hook is properly configured
   SELECT * FROM pg_hooks WHERE hook_name = 'custom_access_token_hook';
   ```

2. **Hook Function Has Errors**
   ```sql
   -- Check function for syntax errors
   SELECT pg_get_functiondef('custom_access_token_hook'::regproc);
   ```

   **Common Issues**:
   - SQL syntax errors
   - Missing permissions
   - Incorrect return format

3. **Claims Not Refreshing**
   ```typescript
   // JWT claims only update on token refresh
   // Force refresh to get new claims
   const refreshRole = async () => {
     await supabase.auth.refreshSession();
     // New JWT will have updated claims
   };
   ```

**Debugging**:
```typescript
// Decode JWT manually
const decodeJWT = (token: string) => {
  try {
    const [header, payload, signature] = token.split('.');
    return {
      header: JSON.parse(atob(header)),
      payload: JSON.parse(atob(payload))
    };
  } catch (error) {
    console.error('Invalid JWT:', error);
  }
};

const { payload } = decodeJWT(session.access_token);
console.log('JWT Payload:', payload);
console.log('Custom Claims:', {
  user_role: payload.user_role,
  is_active: payload.is_active,
  role_updated_at: payload.role_updated_at,
  error: payload.error  // Check for errors
});
```

---

## Permission Issues

### Access Denied Unexpectedly

**Symptoms**:
- User should have access but gets "Access Denied"
- Module doesn't appear in navigation
- Permission checks return false

**Common Causes**:

1. **Wrong Role**
   ```typescript
   // Check current user role
   const { user } = useAuth();
   console.log('Current role:', user?.role);
   console.log('Expected role:', 'SUPERVISOR');
   ```

   **Solution**: Verify user has correct role in database

2. **Module Not in ROLE_PERMISSIONS**
   ```typescript
   // Check PermissionsRegistry.ts
   import { ROLE_PERMISSIONS } from '@/config/PermissionsRegistry';
   console.log('SUPERVISOR permissions for sales:',
     ROLE_PERMISSIONS['SUPERVISOR']['sales']
   );
   // Should include expected actions
   ```

   **Solution**: Add module permissions to PermissionsRegistry.ts

3. **Typo in Module Name**
   ```typescript
   // ❌ Wrong
   canAccessModule('sale')  // Missing 's'

   // ✅ Correct
   canAccessModule('sales')
   ```

4. **Feature Flag OFF**
   ```typescript
   // Check if feature is enabled
   const { hasFeature } = useCapabilities();
   console.log('sales_void_orders enabled:', hasFeature('sales_void_orders'));
   ```

   **Solution**: Enable feature in business model configuration

**Debugging Steps**:
1. Check user role
2. Check ROLE_PERMISSIONS matrix
3. Check feature flags
4. Check module name spelling
5. Check Module-Feature Mapping (v3.0 Dynamic)

---

### Permissions Not Updating After Role Change

**Symptoms**:
- Changed user role in database
- User still has old permissions
- New permissions don't appear

**Common Causes**:

1. **Cached JWT Token**
   - JWT contains old role claim
   - Token not refreshed after role change

   **Solution**:
   ```typescript
   // Option 1: Force token refresh
   const { refreshRole } = useAuth();
   await refreshRole();

   // Option 2: Force re-login
   const { signOut } = useAuth();
   await signOut();
   // User must log in again to get new JWT
   ```

2. **Session Not Refreshed**
   ```typescript
   // Session must be refreshed to get new JWT
   const { data } = await supabase.auth.refreshSession();
   console.log('New session:', data.session);
   ```

3. **AuthContext Not Re-rendering**
   ```typescript
   // Force AuthContext to update
   const { refreshRole } = useAuth();
   await refreshRole();

   // Or force page reload
   window.location.reload();
   ```

**Best Practice**:
```typescript
// After changing user role, force logout
export const updateUserRole = async (userId: string, newRole: UserRole) => {
  // Update role in database
  await supabase
    .from('users_roles')
    .update({ role: newRole })
    .eq('user_id', userId);

  // If user is current user, force logout
  if (userId === currentUser.id) {
    await signOut();
    showToast('Your role has been updated. Please log in again.');
  }
};
```

---

### Module Not Showing in Navigation

**Symptoms**:
- Module exists but doesn't appear in sidebar
- Other users can see it but current user cannot
- Module appears then disappears

**Common Causes**:

1. **canAccessModule Returns False**
   ```typescript
   // Check if user can access module
   const { canAccessModule } = useAuth();
   console.log('Can access sales:', canAccessModule('sales'));
   console.log('Can access debug:', canAccessModule('debug'));
   ```

2. **Feature Flag OFF**
   ```typescript
   // Check MODULE_FEATURE_MAP (v3.0 dynamic)
   import { getDynamicModuleFeatureMap } from '@/config/FeatureRegistry';
   const moduleMap = getDynamicModuleFeatureMap();
   console.log('Module config:', moduleMap['sales']);

   // Check if features are enabled
   const { hasFeature } = useCapabilities();
   console.log('Has sales features:', hasFeature('sales_order_management'));
   ```

3. **Module Features Not Defined (v3.0)**

   **Symptom**: Module has permission but doesn't show.
   
   **Cause**: Module manifest lacks feature definitions.

   **Solution (v3.0)**: Update manifest, NOT FeatureRegistry:
   ```typescript
   // src/modules/delivery/manifest.tsx
   export const deliveryManifest: ModuleManifest = {
     id: 'delivery',
     requiredFeatures: [
       'operations_delivery_zones',
       'operations_delivery_tracking'
     ],
     // Module shows when BOTH features enabled
   };
   // System auto-generates mapping!
   ```

   **Check if features active**:
   ```typescript
   const { hasFeature } = useCapabilities();
   console.log('Has delivery zones:', hasFeature('operations_delivery_zones'));
   console.log('Has tracking:', hasFeature('operations_delivery_tracking'));
   ```

**Debugging**:
```typescript
// Log navigation filtering
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';

const activeModules = getModulesForActiveFeatures(activeFeatures);
console.log('Active modules:', activeModules);
console.log('Includes sales?', activeModules.includes('sales'));
```

---

### Feature + Permission Conflicts

**Symptoms**:
- Feature is ON but user can't access
- Permission check passes but feature check fails
- Confusing access denied messages

**Common Causes**:

1. **Wrong Check Order**
   ```typescript
   // ❌ Wrong: Permission before feature
   const { canVoid } = usePermissions('sales');
   const { hasFeature } = useCapabilities();

   if (!canVoid) return null;  // Check permission first
   if (!hasFeature('sales_void_orders')) return null;  // Then feature

   // ✅ Correct: Feature before permission
   if (!hasFeature('sales_void_orders')) return null;  // Feature first
   if (!canVoid) return null;  // Then permission
   ```

2. **Missing Two-Layer Check**
   ```typescript
   // ❌ Only checking one layer
   const showButton = canVoid;  // Missing feature check!

   // ✅ Check both layers
   const showButton = hasFeature('sales_void_orders') && canVoid;
   ```

**Solution**:
```typescript
// Always check features first, then permissions
const SecureComponent = () => {
  const { hasFeature } = useCapabilities();
  const { canVoid } = usePermissions('sales');

  // Feature OFF → Don't show at all
  if (!hasFeature('sales_void_orders')) {
    return null;
  }

  // Feature ON, Permission OFF → Show upgrade message
  if (!canVoid) {
    return <UpgradeRequired />;
  }

  // Both OK → Show feature
  return <VoidButton />;
};
```

---

## Integration Issues

### Capabilities System Integration

**Common Problems**:

1. **Module Feature Map Check (v3.0 Dynamic)**
   ```typescript
   // Check if module has features defined in manifest
   import { getDynamicModuleFeatureMap } from '@/config/FeatureRegistry';

   const moduleMap = getDynamicModuleFeatureMap();
   
   if (!moduleMap['new_module']) {
     console.error('Module not in dynamic map!');
     // Check: 
     // 1. Manifest exists?
     // 2. Manifest exported in src/modules/index.ts?
     // 3. requiredFeatures/optionalFeatures defined?
   }

   if (!MODULE_FEATURE_MAP['new_module']) {
     console.error('Module not in MODULE_FEATURE_MAP!');
   }
   ```

   **Solution**: Add module to MODULE_FEATURE_MAP

2. **Feature Not Activated**
   ```typescript
   // Check which features are active
   const { activeFeatures } = useCapabilities();
   console.log('Active features:', activeFeatures);
   ```

   **Solution**: Enable required features in business model

---

### Navigation Not Respecting Permissions

**Symptoms**:
- Protected routes accessible without permission
- Navigation shows items user can't access
- Route guards not working

**Common Causes**:

1. **canAccessModule Not Checked**
   ```typescript
   // ❌ Route not protected
   <Route path="/admin/sales" element={<SalesPage />} />

   // ✅ Protected route
   <Route
     path="/admin/sales"
     element={
       <ProtectedRoute requiredModule="sales">
         <SalesPage />
       </ProtectedRoute>
     }
   />
   ```

2. **Navigation Filter Not Applied**
   ```typescript
   // Check navigation items are filtered
   const navItems = navigationItems.filter(item =>
     canAccessModule(item.requiredModule)
   );
   console.log('Filtered navigation:', navItems);
   ```

---

### Service Layer Validation Failing

**Symptoms**:
- API calls fail with "Permission denied"
- Client shows button but API rejects
- Permission checks work in UI but not in service

**Common Causes**:

1. **Missing requirePermission() Call**
   ```typescript
   // ❌ No permission check
   export const deleteMaterial = async (id: string) => {
     return supabase.from('items').delete().eq('id', id);
   };

   // ✅ With permission check
   export const deleteMaterial = async (id: string, user: AuthUser) => {
     requirePermission(user, 'materials', 'delete');
     return supabase.from('items').delete().eq('id', id);
   };
   ```

2. **User Not Passed to Service**
   ```typescript
   // ❌ User not passed
   await deleteMaterial(materialId);

   // ✅ User passed
   const { user } = useAuth();
   await deleteMaterial(materialId, user!);
   ```

---

### Location Filtering Not Working

**Symptoms**:
- User sees data from all locations
- Location filter doesn't apply
- Multi-tenant data leaked

**Common Causes**:

1. **getAccessibleLocationIds Not Used**
   ```typescript
   // ❌ No location filtering
   return supabase.from('sales').select('*');

   // ✅ With location filtering
   const locationIds = getAccessibleLocationIds(user);
   if (locationIds.length === 0) {
     return supabase.from('sales').select('*');  // Admin
   }
   return supabase.from('sales').select('*').in('location_id', locationIds);
   ```

2. **Location Not Assigned to User**
   ```sql
   -- Check user locations
   SELECT * FROM user_locations WHERE user_id = 'user-id';
   ```

   **Solution**:
   ```sql
   -- Assign location to user
   INSERT INTO user_locations (user_id, location_id)
   VALUES ('user-id', 'location-id');
   ```

---

## Performance Issues

### Permission Checks Causing Re-renders

**Symptoms**:
- Component re-renders excessively
- Slow UI performance
- AuthContext render count > 20

**Common Causes**:

1. **Non-Memoized Objects Created in Render**
   ```typescript
   // ❌ Creates new object every render
   const { canCreate } = usePermissions('sales');
   const config = { canCreate };  // New object!

   // ✅ Use flags directly
   const { canCreate } = usePermissions('sales');
   if (canCreate) { /* ... */ }
   ```

2. **Permission Checks in Loops**
   ```typescript
   // ❌ Hook called N times
   items.map(item => {
     const { canDelete } = usePermissions('materials');  // Called N times!
     return <Item canDelete={canDelete} />;
   });

   // ✅ Check once outside loop
   const { canDelete } = usePermissions('materials');
   items.map(item => <Item canDelete={canDelete} />);
   ```

3. **AuthContext Re-creating Functions**
   - Check AuthContext uses `useCallback` for all methods
   - Check session hash comparison is working

**Solution**:
```typescript
// Monitor renders
const renderCountRef = useRef(0);
renderCountRef.current++;

if (renderCountRef.current > 20) {
  console.error('EXCESSIVE RENDERS!', renderCountRef.current);
}
```

---

### AuthContext Re-rendering Excessively

**Symptoms**:
- Console shows "🔴 EXCESSIVE RENDERS DETECTED!"
- App becomes slow
- Browser freezes

**Common Causes**:

1. **Session Hash Comparison Not Working**
   ```typescript
   // Check if session hash is being computed
   const getSessionHash = (session: Session | null): string => {
     if (!session) return 'null';
     return JSON.stringify({
       access_token: session.access_token,
       refresh_token: session.refresh_token,
       expires_at: session.expires_at,
       user_id: session.user?.id
     });
   };
   ```

2. **State Updates in Render**
   ```typescript
   // ❌ State update during render
   const Component = () => {
     const { user } = useAuth();
     setUser(user);  // Triggers re-render!
   };

   // ✅ Use useEffect
   const Component = () => {
     const { user } = useAuth();
     useEffect(() => {
       setUser(user);
     }, [user]);
   };
   ```

**Solution**: Check AuthContext render count in browser console

---

### Slow Permission Validation

**Symptoms**:
- hasPermission() calls are slow
- UI lags when checking permissions
- Multiple permission checks delay rendering

**Common Causes**:

1. **Repeated Permission Lookups**
   ```typescript
   // ❌ Lookup repeated
   if (hasPermission(role, 'sales', 'create')) { /* ... */ }
   if (hasPermission(role, 'sales', 'update')) { /* ... */ }
   if (hasPermission(role, 'sales', 'delete')) { /* ... */ }

   // ✅ Get all permissions once
   const permissions = getResourcePermissions(role, 'sales');
   const canCreate = permissions.includes('create');
   const canUpdate = permissions.includes('update');
   const canDelete = permissions.includes('delete');
   ```

2. **Not Using usePermissions Hook**
   ```typescript
   // ❌ Manual checks
   const canCreate = hasPermission(user.role, 'sales', 'create');
   const canUpdate = hasPermission(user.role, 'sales', 'update');

   // ✅ Use hook (memoized)
   const { canCreate, canUpdate } = usePermissions('sales');
   ```

---

## Debugging Commands

### Check Current User Role

**Browser Console**:
```javascript
// Get Supabase session from localStorage
const supabaseKey = Object.keys(localStorage).find(k =>
  k.startsWith('supabase.auth.token')
);
const session = JSON.parse(localStorage.getItem(supabaseKey));
console.log('Session:', session);

// Decode JWT
const token = session.currentSession.access_token;
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('JWT Claims:', payload);
console.log('user_role:', payload.user_role);
```

### Decode JWT Token

**Browser Console**:
```javascript
const decodeJWT = (token) => {
  const [header, payload, signature] = token.split('.');
  return {
    header: JSON.parse(atob(header)),
    payload: JSON.parse(atob(payload)),
    signature
  };
};

// Usage
const token = 'YOUR_JWT_TOKEN';
const decoded = decodeJWT(token);
console.log('JWT Payload:', decoded.payload);
console.log('Expires at:', new Date(decoded.payload.exp * 1000));
console.log('User role:', decoded.payload.user_role);
```

### Check Permission Matrix

**Node/Browser Console**:
```javascript
import { ROLE_PERMISSIONS } from '@/config/PermissionsRegistry';

// Check specific role
console.log('ADMINISTRADOR permissions:', ROLE_PERMISSIONS['ADMINISTRADOR']);

// Check specific module
console.log('Sales permissions for SUPERVISOR:',
  ROLE_PERMISSIONS['SUPERVISOR']['sales']
);

// Check if role has permission
import { hasPermission } from '@/config/PermissionsRegistry';
console.log('Can OPERADOR delete sales?',
  hasPermission('OPERADOR', 'sales', 'delete')
);
```

### Monitor AuthContext Renders

**Browser Console** (with performance debug enabled):
```
🔵 RENDER #1
🔵 RENDER #2
⚠️ user CHANGED! { prevRole: 'CLIENTE', newRole: 'OPERADOR' }
🔵 RENDER #3
🔴 EXCESSIVE RENDERS DETECTED! { count: 21 }
```

### Check Active Features

**Browser Console**:
```javascript
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';

// Get active features from capabilities context
const activeFeatures = ['sales_order_management', 'inventory_stock_tracking'];

// Check which modules are active
const activeModules = getModulesForActiveFeatures(activeFeatures);
console.log('Active modules:', activeModules);
console.log('Includes sales?', activeModules.includes('sales'));
```

### SQL Debugging Queries

```sql
-- Check user role
SELECT ur.*, u.email
FROM users_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.user_id = 'user-id';

-- Check user locations
SELECT ul.*, l.name as location_name
FROM user_locations ul
JOIN locations l ON l.id = ul.location_id
WHERE ul.user_id = 'user-id';

-- Check audit logs for permission denials
SELECT *
FROM audit_logs
WHERE user_id = 'user-id'
AND success = false
ORDER BY timestamp DESC
LIMIT 20;

-- Check JWT claims function
SELECT pg_get_functiondef('custom_access_token_hook'::regproc);
```

---

## Related Documentation

- [ROLES.md](./ROLES.md) - Complete role reference
- [MODULES.md](./MODULES.md) - Complete module reference
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development patterns
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [SECURITY.md](./SECURITY.md) - Security best practices

---

**Version**: 1.0.0
**Last Updated**: December 21, 2025
**Maintainer**: Development Team
