# Security Best Practices - Roles and Permissions

**Version**: 1.0.0
**Last Updated**: December 21, 2025
**Status**: Complete

Security guidelines and best practices for the G-Admin Mini permissions system.

---

## Table of Contents

- [Authentication Security](#authentication-security)
- [Authorization Security](#authorization-security)
- [Common Vulnerabilities](#common-vulnerabilities)
- [Security Checklists](#security-checklists)
- [Compliance Considerations](#compliance-considerations)

---

## Authentication Security

### JWT Token Handling

#### Token Structure and Claims

Supabase JWT tokens contain custom claims for role-based access:

```typescript
// JWT Payload Structure
{
  // Standard claims
  "sub": "user-id",
  "email": "user@example.com",
  "aud": "authenticated",
  "exp": 1640000000,  // Expiration timestamp
  "iat": 1639990000,  // Issued at timestamp

  // Custom claims (added by Supabase Hook)
  "user_role": "ADMINISTRADOR",
  "is_active": true,
  "role_updated_at": 1639990000,

  // Metadata
  "app_metadata": {
    "provider": "email",
    "role_source": "jwt"
  }
}
```

#### Secure Storage

**DO**:
```typescript
// ✅ Let Supabase handle token storage
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
// Supabase stores token in localStorage with HttpOnly consideration
```

**DON'T**:
```typescript
// ❌ Never store tokens in global variables
window.authToken = session.access_token;

// ❌ Never store tokens in regular localStorage manually
localStorage.setItem('token', session.access_token);

// ❌ Never expose tokens in URLs
window.location.href = `/admin?token=${session.access_token}`;

// ❌ Never log tokens
console.log('Token:', session.access_token);
```

#### Token Expiration and Refresh

```typescript
// ✅ Automatic token refresh (handled by Supabase)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed automatically');
  }
});

// ✅ Manual refresh when needed
const refreshRole = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (data.session) {
    // New JWT with updated claims
    await handleAuthState(data.session);
  }
};

// ❌ Don't use expired tokens
const isExpired = (token: string) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 < Date.now();
};
```

#### Token Invalidation on Logout

```typescript
// ✅ Proper logout flow
const signOut = async () => {
  try {
    // Clear local state first
    setUser(null);
    setSession(null);

    // Clear Supabase session
    await supabase.auth.signOut();

    // Force clear any persisted data
    localStorage.removeItem('g-admin-auth-token');

    // Navigate to login
    navigate('/login');
  } catch (error) {
    // Even if error, clear local state
    setUser(null);
    setSession(null);
  }
};
```

### Session Management

#### Session Lifecycle

1. **Login**: JWT issued with custom claims
2. **Active**: Token automatically refreshed before expiry
3. **Logout**: Token invalidated, local state cleared
4. **Expiry**: Token expires, user redirected to login

#### Concurrent Sessions

```typescript
// ⚠️ Security consideration: Multiple devices
// Supabase allows concurrent sessions by default
// To enforce single session, implement custom logic:

const enforceS singleSession = async (userId: string) => {
  // Option 1: Track session IDs in database
  await supabase
    .from('user_sessions')
    .delete()
    .eq('user_id', userId)
    .neq('session_id', currentSessionId);

  // Option 2: Use Supabase RLS policies
  // Limit active_sessions to 1 per user
};
```

#### Session Timeout

```typescript
// Configure session timeout (in Supabase Dashboard)
// Auth > Settings > JWT Expiry: 3600 (1 hour recommended)

// Implement activity-based timeout
let lastActivity = Date.now();

const checkInactivity = () => {
  const TIMEOUT = 30 * 60 * 1000; // 30 minutes
  if (Date.now() - lastActivity > TIMEOUT) {
    signOut();
  }
};

// Track activity
window.addEventListener('mousemove', () => {
  lastActivity = Date.now();
});
```

### Password Security

#### Password Policies

From AUTH_CONFIG_SECURITY_RECOMMENDATIONS.md:

```typescript
// ✅ Supabase Password Settings (Configure in Dashboard)
{
  "password_min_length": 12,  // Minimum 12 characters
  "password_required_characters": "lower,upper,number,special",

  // Leaked password protection
  "hibp_enabled": true,  // Check against HaveIBeenPwned

  // Rate limiting
  "rate_limit_email_sent": 10,
  "rate_limit_token_sent": 10,
  "rate_limit_verify_sent": 10,

  // OTP security
  "mailer_otp_exp": 900,  // 15 minutes (recommended < 15)
  "sms_otp_exp": 900,

  // Security levels
  "security_email_change_confirm_enabled": true,
  "security_manual_linking_enabled": false,
  "security_refresh_token_reuse_interval": 10
}
```

#### Password Validation

```typescript
// ✅ Client-side validation (before submission)
const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain special character');
  }

  return errors;
};
```

### XSS/CSRF Protection

#### Content Security Policy

```typescript
// ✅ Configure CSP headers (in vercel.json or server config)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

#### XSS Prevention

```typescript
// ✅ Always sanitize user input
import DOMPurify from 'dompurify';

const displayUserContent = (content: string) => {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

// ❌ Never trust user input
const dangerousDisplay = (content: string) => {
  return <div dangerouslySetInnerHTML={{ __html: content }} />; // XSS vulnerability!
};

// ✅ Use React's automatic escaping
const safeDisplay = (content: string) => {
  return <div>{content}</div>; // Automatically escaped
};
```

---

## Authorization Security

### Permission Validation Flow

#### Defense in Depth (Two-Layer Security)

```typescript
// ✅ CORRECT: Check features first, then permissions
const SecureFeature = () => {
  // Layer 1: Feature flag check (fast fail)
  const { hasFeature } = useCapabilities();
  if (!hasFeature('sales_void_orders')) {
    return null;
  }

  // Layer 2: Permission check (RBAC)
  const { canVoid } = usePermissions('sales');
  if (!canVoid) {
    return <UpgradeRequired />;
  }

  return <VoidOrderButton />;
};

// ❌ WRONG: Single-layer security
const InsecureFeature = () => {
  // Only checking permissions - feature could be disabled!
  const { canVoid } = usePermissions('sales');
  if (canVoid) {
    return <VoidOrderButton />;
  }
};
```

#### Client-Side vs Server-Side Checks

**Client-Side** (UX only - NOT security):
```typescript
// ⚠️ Client-side checks are for UX, not security
const { canDelete } = usePermissions('materials');

// Show/hide UI elements
if (!canDelete) {
  return null; // Don't show delete button
}
```

**Server-Side** (REQUIRED for security):
```typescript
// ✅ MUST validate on server/service layer
export const deleteMaterial = async (id: string, user: AuthUser) => {
  // ALWAYS validate permissions on server
  requirePermission(user, 'materials', 'delete');

  // Proceed only if authorized
  return supabase.from('items').delete().eq('id', id);
};

// ❌ NEVER trust client
export const deleteMaterial = async (id: string, canDelete: boolean) => {
  // Trusting client-provided flag - VULNERABLE!
  if (canDelete) {
    return supabase.from('items').delete().eq('id', id);
  }
};
```

### Location-Based Access

#### Multi-Location Filtering

```typescript
// ✅ Filter queries by user's accessible locations
export const getSales = async (user: UserWithLocation) => {
  requireModuleAccess(user, 'sales');

  const locationIds = getAccessibleLocationIds(user);

  // Admin has access to all locations (empty array = no filter)
  if (locationIds.length === 0) {
    return supabase.from('sales').select('*');
  }

  // Other roles filtered by assigned locations
  return supabase
    .from('sales')
    .select('*')
    .in('location_id', locationIds);
};

// ❌ SQL injection vulnerability
export const getSalesUnsafe = async (locationId: string) => {
  // NEVER use raw SQL with user input!
  return supabase.rpc('get_sales', { location_id: locationId });
};
```

#### RLS Policies (Row Level Security)

```sql
-- ✅ Implement RLS policies in Supabase
CREATE POLICY "Users can only view own location sales"
ON sales
FOR SELECT
USING (
  location_id IN (
    SELECT location_id
    FROM user_locations
    WHERE user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM users_roles
    WHERE user_id = auth.uid()
    AND role IN ('ADMINISTRADOR', 'SUPER_ADMIN')
  )
);
```

### Audit Logging

#### What to Log

```typescript
// ✅ Log all permission-sensitive operations
const auditLog = async (event: AuditEvent) => {
  await supabase.from('audit_logs').insert({
    user_id: event.userId,
    action: event.action,          // e.g., 'delete_material'
    resource: event.resource,       // e.g., 'materials'
    resource_id: event.resourceId,  // e.g., material ID
    permission_checked: event.permission,  // e.g., 'delete'
    success: event.success,
    error_message: event.error,
    ip_address: event.ipAddress,
    user_agent: event.userAgent,
    timestamp: new Date().toISOString()
  });
};

// Log permission denials
try {
  requirePermission(user, 'materials', 'delete');
  await deleteMaterial(id);
  await auditLog({ success: true, ... });
} catch (error) {
  if (isPermissionDeniedError(error)) {
    await auditLog({ success: false, error: error.message, ... });
  }
  throw error;
}
```

#### Log Retention

```typescript
// Configure retention policy
// Keep audit logs for:
// - Permission denials: 1 year (security analysis)
// - Successful operations: 90 days (compliance)
// - Failed operations: 6 months (investigation)

// Automated cleanup (run daily)
const cleanupAuditLogs = async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 365);

  await supabase
    .from('audit_logs')
    .delete()
    .lt('timestamp', cutoffDate.toISOString())
    .eq('success', true);  // Only delete successful ones
};
```

---

## Common Vulnerabilities

### Privilege Escalation

#### How It Happens

```typescript
// ❌ Vulnerable to privilege escalation
export const updateUserRole = async (userId: string, newRole: UserRole) => {
  // No validation - anyone can become SUPER_ADMIN!
  await supabase
    .from('users_roles')
    .update({ role: newRole })
    .eq('user_id', userId);
};
```

#### Prevention

```typescript
// ✅ Validate permissions and prevent self-escalation
export const updateUserRole = async (
  targetUserId: string,
  newRole: UserRole,
  currentUser: AuthUser
) => {
  // 1. Check permission to update roles
  requirePermission(currentUser, 'staff', 'update');

  // 2. Prevent self-escalation
  if (targetUserId === currentUser.id) {
    throw new Error('Cannot modify own role');
  }

  // 3. Prevent escalation beyond current role
  if (!isRoleHigherOrEqual(currentUser.role!, newRole)) {
    throw new Error('Cannot assign higher role than own');
  }

  // 4. Log the change
  await auditLog({
    action: 'update_user_role',
    userId: currentUser.id,
    targetUserId,
    oldRole: currentRole,
    newRole
  });

  // 5. Update role
  await supabase
    .from('users_roles')
    .update({ role: newRole, updated_by: currentUser.id })
    .eq('user_id', targetUserId);
};
```

### Permission Bypass

#### Attack Vectors

```typescript
// ❌ Permission bypass via client manipulation
const deleteWithClientCheck = async (id: string, hasPermission: boolean) => {
  // Trusting client - VULNERABLE!
  if (hasPermission) {
    await supabase.from('materials').delete().eq('id', id);
  }
};

// ❌ Permission bypass via API manipulation
app.post('/api/delete-material', async (req, res) => {
  // No server-side validation - VULNERABLE!
  const { id } = req.body;
  await supabase.from('materials').delete().eq('id', id);
});
```

#### Prevention (Backend Validation)

```typescript
// ✅ Always validate on server
export const deleteMaterial = async (id: string, user: AuthUser) => {
  // MUST validate user permissions
  requirePermission(user, 'materials', 'delete');

  // MUST validate user owns resource or has access
  const { data: material } = await supabase
    .from('materials')
    .select('created_by, location_id')
    .eq('id', id)
    .single();

  // Check location access
  if (material?.location_id) {
    requireLocationAccess(user, material.location_id);
  }

  // Proceed with deletion
  return supabase.from('materials').delete().eq('id', id);
};
```

### Token Leakage

#### Common Sources

```typescript
// ❌ Token leaked in error messages
try {
  await supabase.auth.getSession();
} catch (error) {
  console.error('Session error:', error);  // May contain token!
}

// ❌ Token leaked in URLs
const shareUrl = `${window.location.origin}/share?token=${session.access_token}`;

// ❌ Token leaked in logs
logger.debug('User session:', session);  // Contains token!
```

#### Prevention

```typescript
// ✅ Sanitize error messages
const sanitizeError = (error: any) => {
  const sanitized = { ...error };
  delete sanitized.access_token;
  delete sanitized.refresh_token;
  delete sanitized.session;
  return sanitized;
};

// ✅ Never include tokens in URLs
const shareUrl = `${window.location.origin}/share?ref=${shareId}`;

// ✅ Filter sensitive data from logs
const logSafeSession = (session: Session) => {
  logger.debug('User authenticated:', {
    userId: session.user.id,
    email: session.user.email,
    expiresAt: session.expires_at,
    // NO TOKEN LOGGED
  });
};
```

---

## Security Checklists

### Pre-Deployment Checklist

- [ ] **All endpoints validate permissions on server**
  ```typescript
  // Check all API routes have requirePermission()
  grep -r "export const" src/services/ | grep -v "requirePermission"
  ```

- [ ] **JWT signing key rotated**
  ```bash
  # Generate new JWT secret in Supabase Dashboard
  # Auth > Settings > JWT Secret (rotate quarterly)
  ```

- [ ] **Debug access restricted to SUPER_ADMIN**
  ```typescript
  // Verify PermissionsRegistry.ts
  ROLE_PERMISSIONS['ADMINISTRADOR']['debug'] === []  // ✅
  ROLE_PERMISSIONS['SUPER_ADMIN']['debug'] !== []   // ✅
  ```

- [ ] **Location filtering implemented for multi-tenant**
  ```typescript
  // Check all queries filter by location
  grep -r ".select(" src/services/ | grep -v "location_id"
  ```

- [ ] **Error messages don't leak information**
  ```typescript
  // Avoid: "User 123 does not have delete permission"
  // Use: "Permission denied"
  ```

- [ ] **Audit logging enabled for sensitive operations**

- [ ] **Password policies enforced (min 12 chars, complexity)**

- [ ] **OTP expiry < 15 minutes**

- [ ] **HTTPS enforced (redirect HTTP to HTTPS)**
  ```typescript
  // vercel.json
  { "redirects": [{ "source": "/:path*", "has": [{ "type": "header", "key": "x-forwarded-proto", "value": "http" }], "destination": "https://yourdomain.com/:path*", "permanent": true }] }
  ```

- [ ] **CORS configured correctly**
  ```typescript
  // Only allow trusted origins
  const allowedOrigins = ['https://yourdomain.com'];
  ```

### Code Review Checklist

- [ ] **requirePermission() on all mutations**
  ```typescript
  // Every create/update/delete must have:
  requirePermission(user, module, action);
  ```

- [ ] **Feature + Permission checks (defense in depth)**

- [ ] **No hardcoded credentials or API keys**
  ```bash
  # Scan codebase
  grep -r "password\s*=\s*" src/
  grep -r "api_key\s*=\s*" src/
  ```

- [ ] **Error handling doesn't expose internals**

- [ ] **Location filtering on multi-tenant queries**

### Penetration Testing Guide

#### Test Scenarios

1. **Privilege Escalation**:
   - Try changing own role to SUPER_ADMIN
   - Try accessing debug tools as ADMINISTRADOR
   - Try approving own time-off request

2. **Permission Bypass**:
   - Modify client-side permission checks
   - Call API directly without UI
   - Manipulate request payload

3. **Token Hijacking**:
   - Steal token from localStorage
   - Use stolen token from different IP
   - Replay old/expired tokens

4. **SQL Injection**:
   - Try SQL in search fields
   - Manipulate location_id parameter
   - Test RLS policies

#### Tools to Use

- **Burp Suite**: Intercept and modify requests
- **OWASP ZAP**: Automated security testing
- **jwt.io**: Decode and inspect JWT tokens
- **Postman**: Test API endpoints directly

---

## Compliance Considerations

### GDPR Compliance

#### Right to Access

```typescript
// User requests all their data
export const exportUserData = async (userId: string, requestingUser: AuthUser) => {
  // Verify user can only export own data (or is admin)
  if (userId !== requestingUser.id && !requestingUser.role?.includes('ADMIN')) {
    throw new Error('Cannot export other users data');
  }

  // Collect all user data
  const userData = {
    profile: await getUserProfile(userId),
    sales: await getUserSales(userId),
    orders: await getUserOrders(userId),
    auditLogs: await getUserAuditLogs(userId)
  };

  return userData;
};
```

#### Right to Delete

```typescript
// User requests account deletion
export const deleteUserAccount = async (userId: string, requestingUser: AuthUser) => {
  // Verify permission
  if (userId !== requestingUser.id && !requestingUser.role?.includes('ADMIN')) {
    throw new Error('Cannot delete other users');
  }

  // Anonymize instead of hard delete (for audit trail)
  await supabase
    .from('users')
    .update({
      email: `deleted-${userId}@example.com`,
      full_name: '[DELETED]',
      is_active: false,
      deleted_at: new Date().toISOString()
    })
    .eq('id', userId);

  // Log the deletion request
  await auditLog({ action: 'delete_account', userId });
};
```

#### Consent Tracking

```typescript
// Track user consent
interface UserConsent {
  user_id: string;
  consent_type: 'terms' | 'privacy' | 'marketing';
  granted: boolean;
  timestamp: string;
  ip_address: string;
}

export const recordConsent = async (consent: UserConsent) => {
  await supabase.from('user_consents').insert(consent);
};
```

### Audit Requirements

#### Permission Changes

```typescript
// Log all permission/role changes
const logRoleChange = async (change: RoleChange) => {
  await supabase.from('role_audit').insert({
    target_user_id: change.userId,
    old_role: change.oldRole,
    new_role: change.newRole,
    changed_by: change.changedBy,
    reason: change.reason,
    timestamp: new Date().toISOString()
  });
};
```

#### Access Logs

```typescript
// Log all access attempts
const logAccess = async (access: AccessLog) => {
  await supabase.from('access_logs').insert({
    user_id: access.userId,
    module: access.module,
    action: access.action,
    success: access.success,
    ip_address: access.ipAddress,
    timestamp: new Date().toISOString()
  });
};
```

#### Retention Policies

- **Audit Logs**: 7 years (legal requirement)
- **Access Logs**: 1 year (security analysis)
- **User Data**: Until deletion request + 30 days (legal hold)

---

## Related Documentation

- [ROLES.md](./ROLES.md) - Role permissions reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development patterns
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

---

**Version**: 1.0.0
**Last Updated**: December 21, 2025
**Maintainer**: Development Team
