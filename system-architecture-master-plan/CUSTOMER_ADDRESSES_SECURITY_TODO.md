# 🔒 CUSTOMER ADDRESSES - SECURITY REVIEW CHECKLIST

**Priority**: 🔴 HIGH
**Created**: 2025-01-15
**Status**: ⚠️ PENDING REVIEW

---

## 📋 OVERVIEW

Customer addresses contain **highly sensitive PII** (Personally Identifiable Information) including:
- Home/work physical locations
- GPS coordinates (exact latitude/longitude)
- Delivery instructions (may contain access codes, security patterns)
- Usage patterns (tracking when/where customers are)

**Risk Level**: HIGH - Addresses can enable stalking, burglary, or identity theft if leaked.

---

## ✅ SECURITY CHECKLIST

### 1. **ROW LEVEL SECURITY (RLS)** - Priority: 🔴 CRITICAL

#### Status: ⚠️ TO BE VALIDATED

**Current State**:
```sql
-- RLS is ENABLED in migration
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- Policies exist but need validation:
CREATE POLICY "Users can view own addresses"
  ON customer_addresses FOR SELECT
  USING (customer_id IN (SELECT id FROM customers WHERE id = auth.uid()));

CREATE POLICY "Authenticated users can manage addresses"
  ON customer_addresses FOR ALL
  USING (auth.role() = 'authenticated');
```

**Issues to Address**:
- ⚠️ Policy "Authenticated users can manage addresses" is TOO PERMISSIVE
  - ANY authenticated user can modify ANY address
  - Staff can access addresses of unassigned customers
  - No role-based differentiation (customer vs staff vs admin)

**Required Actions**:
- [ ] Create separate policies for customers vs staff vs admins
- [ ] Implement customer ownership validation (customers can only see THEIR addresses)
- [ ] Implement staff assignment validation (staff can only see assigned customer addresses)
- [ ] Test RLS policies with different user roles
- [ ] Add RLS bypass protection (prevent service_role key abuse)

**Example Fix**:
```sql
-- CUSTOMERS: Can only access their own addresses
CREATE POLICY "customers_own_addresses"
  ON customer_addresses FOR ALL
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- STAFF: Can access addresses of assigned customers only
CREATE POLICY "staff_assigned_customers"
  ON customer_addresses FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'staff' AND
    customer_id IN (
      SELECT customer_id FROM staff_customer_assignments
      WHERE staff_id = auth.uid()
    )
  );

-- ADMINS: Full access but audit logged
CREATE POLICY "admin_full_access"
  ON customer_addresses FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

### 2. **DATA LEAKAGE PREVENTION** - Priority: 🔴 CRITICAL

#### Status: ⚠️ NOT IMPLEMENTED

**Vulnerabilities**:
- ⚠️ GPS coordinates logged in plain text (latitude/longitude)
- ⚠️ Delivery instructions may contain sensitive info (key codes, gate codes)
- ⚠️ Error messages may leak address data
- ⚠️ Analytics/logging may expose PII

**Required Actions**:
- [ ] Implement data masking in logging system
  - Mask coordinates: `-34.6037232` → `-34.60****`
  - Mask delivery_instructions in logs
- [ ] Sanitize error messages (no address data in client-facing errors)
- [ ] Review analytics queries (ensure no PII in dashboards)
- [ ] Implement field-level encryption for `delivery_instructions`
- [ ] Add warning comments in code where sensitive data is accessed

**Example Implementation**:
```typescript
// logger.ts - Add address masking
export function maskSensitiveData(data: any): any {
  if (data.latitude) {
    data.latitude = maskCoordinate(data.latitude);
  }
  if (data.longitude) {
    data.longitude = maskCoordinate(data.longitude);
  }
  if (data.delivery_instructions) {
    data.delivery_instructions = '[REDACTED]';
  }
  return data;
}

function maskCoordinate(coord: number): string {
  const str = coord.toFixed(7);
  return str.substring(0, str.indexOf('.') + 3) + '****';
}
```

---

### 3. **ACCESS CONTROL** - Priority: 🔴 CRITICAL

#### Status: ⚠️ PARTIALLY IMPLEMENTED

**Current State**:
- ✅ Supabase RLS policies exist
- ❌ NO permission checks in API functions
- ❌ NO role validation before queries
- ❌ NO audit logging

**Required Actions**:
- [ ] Add permission middleware to `customerAddressesApi.ts`
- [ ] Validate user role before EVERY database operation
- [ ] Implement audit logging for all address access/modifications
- [ ] Create permission helper: `canAccessCustomerAddress(userId, customerId)`
- [ ] Add rate limiting per user/role

**Example Implementation**:
```typescript
// permissions.ts
export async function canAccessCustomerAddresses(
  userId: string,
  customerId: string
): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();

  // Customer accessing own addresses
  if (user.id === customerId) return true;

  // Staff accessing assigned customer
  const { data: assignment } = await supabase
    .from('staff_customer_assignments')
    .select('id')
    .eq('staff_id', userId)
    .eq('customer_id', customerId)
    .single();

  if (assignment) return true;

  // Admin access
  const role = user.app_metadata?.role;
  if (role === 'admin' || role === 'super_admin') return true;

  return false;
}

// customerAddressesApi.ts
export async function getCustomerAddresses(
  customerId: string
): Promise<CustomerAddress[]> {
  const { data: user } = await supabase.auth.getUser();

  // ✅ SECURITY: Permission check
  const hasAccess = await canAccessCustomerAddresses(user.id, customerId);
  if (!hasAccess) {
    logger.warn('Unauthorized address access attempt', {
      userId: user.id,
      customerId
    });
    throw new Error('Unauthorized');
  }

  // ✅ SECURITY: Audit log
  await auditLog.create({
    action: 'address_access',
    user_id: user.id,
    customer_id: customerId,
    timestamp: new Date()
  });

  // ... rest of function
}
```

---

### 4. **INPUT VALIDATION** - Priority: 🟠 HIGH

#### Status: ⚠️ NOT IMPLEMENTED

**Vulnerabilities**:
- ⚠️ NO validation of customerId format (potential SQL injection)
- ⚠️ NO validation of lat/lng ranges
- ⚠️ NO sanitization of address text input
- ⚠️ NO protection against malicious geocoding results

**Required Actions**:
- [ ] Add Zod validation schemas for all address inputs
- [ ] Validate UUID format for IDs
- [ ] Validate lat (-90 to 90) and lng (-180 to 180) ranges
- [ ] Sanitize text inputs (remove SQL/XSS patterns)
- [ ] Validate geocoding API responses before saving

**Example Implementation**:
```typescript
// addressValidation.ts
import { z } from 'zod';

export const CreateAddressSchema = z.object({
  customer_id: z.string().uuid(),
  label: z.string().min(1).max(100),
  address_line_1: z.string().min(1).max(500),
  address_line_2: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  delivery_instructions: z.string().max(1000).optional()
});

// Use in API
export async function createCustomerAddress(
  addressData: CreateCustomerAddressData
): Promise<CustomerAddress> {
  // ✅ SECURITY: Validate input
  const validated = CreateAddressSchema.parse(addressData);

  // ... rest of function
}
```

---

### 5. **RATE LIMITING** - Priority: 🟠 HIGH

#### Status: ❌ NOT IMPLEMENTED

**Vulnerabilities**:
- ⚠️ Address enumeration attacks possible
- ⚠️ Geocoding API abuse (unlimited calls)
- ⚠️ No throttling on address access

**Required Actions**:
- [ ] Implement rate limiting middleware
- [ ] Limit address queries: 100 per user per hour
- [ ] Limit geocoding calls: 10 per user per hour
- [ ] Implement exponential backoff for failed attempts
- [ ] Monitor for suspicious access patterns

**Example Implementation**:
```typescript
// rateLimit.ts
import { RateLimiter } from 'limiter';

const addressAccessLimiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'hour'
});

export async function checkAddressAccessRate(userId: string): Promise<boolean> {
  const key = `address_access:${userId}`;
  const remaining = await addressAccessLimiter.removeTokens(1, key);
  return remaining >= 0;
}
```

---

### 6. **DATA ENCRYPTION** - Priority: 🟡 MEDIUM

#### Status: ⚠️ PARTIAL (HTTPS only)

**Current State**:
- ✅ HTTPS enforced for all API calls
- ❌ NO encryption for sensitive fields at rest
- ❌ NO encryption for delivery_instructions

**Required Actions**:
- [ ] Evaluate need for field-level encryption
- [ ] Consider encrypting `delivery_instructions` (may contain codes/keys)
- [ ] Implement encryption for `formatted_address` if GDPR required
- [ ] Review Supabase encryption-at-rest settings
- [ ] Document encryption decisions

---

### 7. **GDPR COMPLIANCE** - Priority: 🔴 CRITICAL

#### Status: ❌ NOT ADDRESSED

**Requirements**:
- ⚠️ Addresses are personal data under GDPR Article 4
- ⚠️ GPS coordinates are considered "special category" data
- ⚠️ Right to erasure must be implemented
- ⚠️ Data retention policies needed
- ⚠️ Consent for processing location data

**Required Actions**:
- [ ] Implement "Right to Erasure" (delete all addresses on request)
- [ ] Add consent checkbox for storing addresses
- [ ] Document data retention policy (how long to keep addresses)
- [ ] Add "export my data" functionality (GDPR Article 20)
- [ ] Update privacy policy to mention address storage
- [ ] Add data processing agreement (DPA) with Supabase
- [ ] Implement auto-deletion of old/unused addresses (after X months?)

**Example**:
```sql
-- Auto-delete addresses not used in 2 years
CREATE FUNCTION cleanup_old_addresses() RETURNS void AS $$
BEGIN
  DELETE FROM customer_addresses
  WHERE last_used_at < NOW() - INTERVAL '2 years'
    AND is_default = false;
END;
$$ LANGUAGE plpgsql;
```

---

### 8. **ADDITIONAL RECOMMENDATIONS** - Priority: 🟡 MEDIUM

#### Status: 📝 TO BE IMPLEMENTED

**Security Enhancements**:
- [ ] Implement address change notifications (email customer when address modified)
- [ ] Add address verification via SMS/email (confirm new addresses)
- [ ] Implement geofencing alerts (notify if address used outside expected area)
- [ ] Add "suspicious activity" detection (multiple address changes in short time)
- [ ] Implement IP address logging for address access
- [ ] Add 2FA requirement for address modifications
- [ ] Create security dashboard showing address access patterns
- [ ] Implement honeypot addresses to detect unauthorized access

---

## 🚨 IMMEDIATE ACTIONS (DO NOW)

1. **FIX RLS POLICIES** - The current "authenticated" policy is too permissive
2. **ADD PERMISSION CHECKS** - Validate user access in every API function
3. **MASK SENSITIVE DATA IN LOGS** - Prevent coordinate/instruction leakage
4. **ADD INPUT VALIDATION** - Zod schemas for all address inputs
5. **DOCUMENT GDPR COMPLIANCE** - Legal review required

---

## 📊 RISK ASSESSMENT

| Area | Risk Level | Impact | Likelihood | Priority |
|------|-----------|--------|------------|----------|
| RLS Policies | 🔴 CRITICAL | HIGH | HIGH | P0 |
| Data Leakage | 🔴 CRITICAL | HIGH | MEDIUM | P0 |
| Access Control | 🔴 CRITICAL | HIGH | HIGH | P0 |
| Input Validation | 🟠 HIGH | MEDIUM | HIGH | P1 |
| Rate Limiting | 🟠 HIGH | MEDIUM | MEDIUM | P1 |
| GDPR Compliance | 🔴 CRITICAL | HIGH | MEDIUM | P0 |
| Encryption | 🟡 MEDIUM | MEDIUM | LOW | P2 |

---

## 📖 REFERENCES

- **OWASP**: https://owasp.org/www-project-top-ten/
- **GDPR**: https://gdpr.eu/what-is-gdpr/
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **PII Protection**: https://www.privacypolicies.com/blog/personally-identifiable-information/

---

**Action Owner**: Security Team
**Review Date**: ASAP
**Next Review**: After implementation
