# 🎫 MEMBERSHIPS MODULE - Production Ready

**Module**: Memberships (Subscription Tiers & Loyalty)
**Phase**: Phase 3 P4 - Module 2/5
**Estimated Time**: 4-5 hours
**Priority**: P4 (Advanced - depends on customers + billing)

---

## 📋 OBJECTIVE

Make the **Memberships module** production-ready following the 10-criteria checklist.

**Why this module in P4**: Customer loyalty and recurring revenue feature. Requires customer management and billing integration.

---

## ✅ 10 PRODUCTION-READY CRITERIA

1. ✅ **Architecture compliant**: Follows Capabilities → Features → Modules
2. ⚠️ **Scaffolding ordered**: Page exists, need services/, types/ structure
3. ⚠️ **Zero errors**: Need to verify ESLint + TypeScript
4. ⚠️ **UI complete**: Page skeleton exists, needs full CRUD
5. ❌ **Cross-module mapped**: No README exists
6. ⚠️ **Zero duplication**: Need to audit for repeated logic
7. ❌ **DB connected**: No service layer exists
8. ✅ **Features mapped**: Optional features defined
9. ⚠️ **Permissions designed**: minimumRole set (SUPERVISOR), need full integration
10. ❌ **README**: Needs creation

---

## 📂 MODULE FILES

### Core Files
- **Manifest**: `src/modules/memberships/manifest.tsx` ✅ (101 lines)
- **Page**: `src/pages/admin/operations/memberships/page.tsx` ⚠️ (skeleton exists)
- **README**: ❌ TO CREATE
- **Database Tables**: `memberships`, `membership_tiers`, `member_benefits` (need to verify)

### Current Structure
```
src/modules/memberships/
├── manifest.tsx                              # ✅ Complete (101 lines)
└── components/
    └── MembershipsWidget.tsx                 # ✅ Dashboard widget

src/pages/admin/operations/memberships/
├── page.tsx                                  # ⚠️ Skeleton with tabs
├── components/
│   ├── MembershipFormEnhanced.tsx            # ⚠️ Form exists
│   ├── MembershipAnalyticsEnhanced.tsx       # ⚠️ Analytics exists
│   └── MembershipFormModal.tsx               # ⚠️ Modal exists
└── hooks/
    ├── useMembershipForm.tsx                 # ⚠️ Form hook exists
    └── index.ts                              # ✅ Barrel export

MISSING:
├── services/                                 # ❌ Need to create
│   ├── membershipApi.ts                      # ❌ CRUD operations
│   └── index.ts                              # ❌ Barrel export
├── types/                                    # ❌ Need to create
│   ├── membership.ts                         # ❌ Type definitions
│   └── index.ts                              # ❌ Barrel export
└── README.md                                 # ❌ TO CREATE
```

---

## 🔍 MODULE DETAILS

### Current Status (From Manifest)

**Metadata**:
- ✅ ID: `memberships`
- ✅ minimumRole: `SUPERVISOR` (managers control membership programs)
- ✅ autoInstall: `true` (auto-activate when dependencies active)
- ✅ depends: `['customers', 'billing']`

**Required Features**: None (optional module)

**Optional Features**:
- `customer_loyalty_program` - Loyalty points and rewards
- `finance_payment_terms` - Payment plan integration

**Hooks**:
- **PROVIDES**:
  - `memberships.tier_benefits` - Member benefit calculations
  - `customers.profile_sections` - Membership info in customer profile
  - `dashboard.widgets` - Membership metrics widget

- **CONSUMES**:
  - `billing.payment_received` - Activate memberships on payment
  - `billing.subscription_ended` - Deactivate expired memberships

**Exports**:
- `checkAccess(memberId, benefitId)` - Verify member benefit access
- `renewMembership(memberId)` - Renew expired membership

### Database Schema (TO VERIFY/CREATE)

**Tables** (need to verify in Supabase):

1. **memberships** (main member records)
```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  tier_id UUID NOT NULL REFERENCES membership_tiers(id),
  status TEXT NOT NULL DEFAULT 'active', -- active, expired, cancelled
  start_date DATE NOT NULL,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  payment_frequency TEXT, -- monthly, yearly
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id) -- One membership per customer
);

-- Indexes
CREATE INDEX idx_memberships_customer ON memberships(customer_id);
CREATE INDEX idx_memberships_tier ON memberships(tier_id);
CREATE INDEX idx_memberships_status ON memberships(status);

-- RLS Policies
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own membership"
  ON memberships FOR SELECT
  USING (auth.uid()::text = customer_id::text);

CREATE POLICY "Staff can manage all memberships"
  ON memberships FOR ALL
  USING (auth.jwt() ->> 'role' IN ('SUPERVISOR', 'ADMINISTRADOR', 'GERENTE'));
```

2. **membership_tiers** (Bronze, Silver, Gold)
```sql
CREATE TABLE membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE, -- Bronze, Silver, Gold, Platinum
  tier_level INTEGER NOT NULL, -- 1, 2, 3, 4 (for comparisons)
  monthly_price DECIMAL(10,2) NOT NULL,
  yearly_price DECIMAL(10,2), -- Discounted annual price
  discount_percentage INTEGER DEFAULT 0, -- General discount on purchases
  description TEXT,
  features JSONB, -- Array of feature descriptions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_membership_tiers_level ON membership_tiers(tier_level);
```

3. **member_benefits** (specific perks)
```sql
CREATE TABLE member_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID NOT NULL REFERENCES membership_tiers(id),
  benefit_type TEXT NOT NULL, -- discount, free_item, priority_service, etc.
  benefit_value JSONB NOT NULL, -- { item_id: uuid, quantity: 2 } or { percentage: 15 }
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_member_benefits_tier ON member_benefits(tier_id);
```

4. **membership_usage** (tracking member activity)
```sql
CREATE TABLE membership_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES memberships(id),
  benefit_id UUID REFERENCES member_benefits(id),
  used_at TIMESTAMPTZ DEFAULT NOW(),
  order_id UUID REFERENCES sales(id), -- If benefit used on order
  notes TEXT
);

-- Indexes
CREATE INDEX idx_membership_usage_membership ON membership_usage(membership_id);
CREATE INDEX idx_membership_usage_date ON membership_usage(used_at);
```

---

## 🎯 WORKFLOW (4-5 HOURS)

### 1️⃣ AUDIT (30 min)

**Tasks**:
- [ ] Read `src/modules/memberships/manifest.tsx` ✅ (already done)
- [ ] Read `src/pages/admin/operations/memberships/page.tsx`
- [ ] Check ESLint errors: `pnpm -s exec eslint src/modules/memberships/ src/pages/admin/operations/memberships/`
- [ ] Check TypeScript errors: `pnpm -s exec tsc --noEmit`
- [ ] Verify database schema (Supabase tables above)
- [ ] Check if tables exist, create if missing
- [ ] Test page tabs (dashboard, create, manage, analytics)
- [ ] Check form components work
- [ ] Document current state

**Questions to Answer**:
- How many ESLint/TS errors?
- Do membership tables exist in Supabase?
- Are form components functional?
- Is MembershipFormEnhanced using proper validation?
- Is MembershipAnalyticsEnhanced showing metrics?
- Are there unused components?
- Is permission system integrated?

---

### 2️⃣ FIX STRUCTURE (1 hour)

**Tasks**:
- [ ] Create `src/pages/admin/operations/memberships/services/` directory
- [ ] Create `membershipApi.ts` with CRUD operations
- [ ] Create `src/pages/admin/operations/memberships/types/` directory
- [ ] Create `membership.ts` with type definitions
- [ ] Fix ESLint errors in membership files
- [ ] Fix TypeScript errors in membership files
- [ ] Add full permission integration to page.tsx
- [ ] Organize imports consistently
- [ ] Remove unused code

**Service Layer** (`services/membershipApi.ts`):
```typescript
import { supabase } from '@/lib/supabase/client';
import { requirePermission, requireModuleAccess } from '@/lib/permissions';
import type { AuthUser } from '@/contexts/AuthContext';
import type { Membership, MembershipTier } from '../types/membership';

// ============================================
// MEMBERSHIP CRUD
// ============================================

export const getMemberships = async (user?: AuthUser | null) => {
  if (user) {
    requireModuleAccess(user, 'memberships');
  }

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      customer:customers(id, name, email),
      tier:membership_tiers(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getMembershipById = async (id: string, user?: AuthUser | null) => {
  if (user) {
    requireModuleAccess(user, 'memberships');
  }

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      customer:customers(*),
      tier:membership_tiers(*),
      benefits:member_benefits(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createMembership = async (membership: Partial<Membership>, user: AuthUser) => {
  requirePermission(user, 'memberships', 'create');

  const { data, error } = await supabase
    .from('memberships')
    .insert({
      customer_id: membership.customer_id,
      tier_id: membership.tier_id,
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      auto_renew: membership.auto_renew ?? true,
      payment_frequency: membership.payment_frequency ?? 'monthly'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateMembership = async (id: string, updates: Partial<Membership>, user: AuthUser) => {
  requirePermission(user, 'memberships', 'update');

  const { data, error } = await supabase
    .from('memberships')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const cancelMembership = async (id: string, user: AuthUser) => {
  requirePermission(user, 'memberships', 'delete');

  const { data, error } = await supabase
    .from('memberships')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// MEMBERSHIP TIERS
// ============================================

export const getTiers = async () => {
  const { data, error } = await supabase
    .from('membership_tiers')
    .select('*')
    .eq('is_active', true)
    .order('tier_level', { ascending: true });

  if (error) throw error;
  return data;
};

export const getTierById = async (id: string) => {
  const { data, error } = await supabase
    .from('membership_tiers')
    .select(`
      *,
      benefits:member_benefits(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// MEMBER BENEFITS
// ============================================

export const checkBenefitAccess = async (memberId: string, benefitId: string) => {
  // Get membership with tier
  const { data: membership, error: memberError } = await supabase
    .from('memberships')
    .select('tier_id, status')
    .eq('id', memberId)
    .single();

  if (memberError) throw memberError;

  // Check if membership is active
  if (membership.status !== 'active') {
    return { hasAccess: false, reason: 'Membership not active' };
  }

  // Check if benefit belongs to this tier
  const { data: benefit, error: benefitError } = await supabase
    .from('member_benefits')
    .select('*')
    .eq('id', benefitId)
    .eq('tier_id', membership.tier_id)
    .eq('is_active', true)
    .single();

  if (benefitError || !benefit) {
    return { hasAccess: false, reason: 'Benefit not available for this tier' };
  }

  return { hasAccess: true, benefit };
};

export const trackBenefitUsage = async (membershipId: string, benefitId: string, orderId?: string) => {
  const { data, error } = await supabase
    .from('membership_usage')
    .insert({
      membership_id: membershipId,
      benefit_id: benefitId,
      order_id: orderId,
      used_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// ANALYTICS
// ============================================

export const getMembershipMetrics = async () => {
  const { data, error } = await supabase
    .rpc('get_membership_metrics');

  if (error) throw error;
  return data;
};
```

**Types** (`types/membership.ts`):
```typescript
export interface Membership {
  id: string;
  customer_id: string;
  tier_id: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  payment_frequency: 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;

  // Relations
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  tier?: MembershipTier;
}

export interface MembershipTier {
  id: string;
  tier_name: string;
  tier_level: number;
  monthly_price: number;
  yearly_price?: number;
  discount_percentage: number;
  description?: string;
  features?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  benefits?: MemberBenefit[];
}

export interface MemberBenefit {
  id: string;
  tier_id: string;
  benefit_type: 'discount' | 'free_item' | 'priority_service' | 'early_access';
  benefit_value: Record<string, any>;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MembershipUsage {
  id: string;
  membership_id: string;
  benefit_id?: string;
  used_at: string;
  order_id?: string;
  notes?: string;
}

export interface MembershipMetrics {
  total_members: number;
  active_members: number;
  expired_members: number;
  members_by_tier: {
    tier_name: string;
    count: number;
  }[];
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churn_rate: number;
  retention_rate: number;
}
```

**Permission Integration** (page.tsx):
```typescript
import { usePermissions } from '@/hooks/usePermissions';

const {
  canCreate,
  canRead,
  canUpdate,
  canDelete
} = usePermissions('memberships');

// Conditional rendering
{canCreate && <Button>Create Membership</Button>}
{canUpdate && <Button onClick={handleUpgrade}>Upgrade Tier</Button>}
{canDelete && <Button onClick={handleCancel}>Cancel Membership</Button>}
```

---

### 3️⃣ DATABASE & FUNCTIONALITY (1.5 hours)

**Tasks**:
- [ ] Verify tables exist in Supabase (or create them)
- [ ] Create RLS policies for all tables
- [ ] Test CREATE membership
- [ ] Test READ memberships (list + detail)
- [ ] Test UPDATE membership (upgrade tier, change payment frequency)
- [ ] Test DELETE/CANCEL membership
- [ ] Test tier management (CRUD for tiers)
- [ ] Test benefit tracking
- [ ] Verify EventBus integration (billing events)
- [ ] Test analytics metrics

**Database Migration** (if tables don't exist):
```sql
-- Run in Supabase SQL Editor
-- Create tables as defined above in Database Schema section

-- Create SQL function for metrics
CREATE OR REPLACE FUNCTION get_membership_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_members', (SELECT COUNT(*) FROM memberships),
    'active_members', (SELECT COUNT(*) FROM memberships WHERE status = 'active'),
    'expired_members', (SELECT COUNT(*) FROM memberships WHERE status = 'expired'),
    'members_by_tier', (
      SELECT json_agg(json_build_object('tier_name', t.tier_name, 'count', COUNT(m.id)))
      FROM membership_tiers t
      LEFT JOIN memberships m ON m.tier_id = t.id AND m.status = 'active'
      GROUP BY t.tier_name
    ),
    'mrr', (
      SELECT COALESCE(SUM(t.monthly_price), 0)
      FROM memberships m
      JOIN membership_tiers t ON t.id = m.tier_id
      WHERE m.status = 'active' AND m.payment_frequency = 'monthly'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**EventBus Integration** (in manifest.tsx setup):
```typescript
// Listen to billing.payment_received
eventBus.subscribe('billing.payment_received', async (event) => {
  const { customerId, subscriptionId, amount } = event.payload;

  logger.info('Memberships', 'Payment received for membership', { customerId });

  // Activate or renew membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('*')
    .eq('customer_id', customerId)
    .single();

  if (membership) {
    // Renew existing membership
    await supabase
      .from('memberships')
      .update({ status: 'active', end_date: calculateEndDate(membership.payment_frequency) })
      .eq('id', membership.id);
  }
}, { moduleId: 'memberships' });

// Listen to billing.subscription_ended
eventBus.subscribe('billing.subscription_ended', async (event) => {
  const { customerId } = event.payload;

  logger.info('Memberships', 'Subscription ended', { customerId });

  // Mark membership as expired
  await supabase
    .from('memberships')
    .update({ status: 'expired' })
    .eq('customer_id', customerId);
}, { moduleId: 'memberships' });
```

---

### 4️⃣ CROSS-MODULE INTEGRATION (1 hour)

**Tasks**:
- [ ] Create `src/pages/admin/operations/memberships/README.md`
- [ ] Document all provided hooks
- [ ] Document all consumed hooks
- [ ] Document database schema
- [ ] Document permission requirements
- [ ] Test integration with Customers module (profile sections)
- [ ] Test integration with Billing module (payment events)
- [ ] Test dashboard widget display
- [ ] Register customer profile extension hook

**README Template**:
```markdown
# Memberships Module

Customer loyalty and subscription tier management.

## Production Status
- [x] 0 ESLint errors
- [x] 0 TypeScript errors
- [x] All CRUD operations working
- [x] Database connected
- [x] EventBus integration complete
- [x] Permissions integrated

## Database Tables
- `memberships` (main member records)
- `membership_tiers` (Bronze, Silver, Gold, Platinum)
- `member_benefits` (tier-specific perks)
- `membership_usage` (benefit usage tracking)

## Features
- Membership tier management (CRUD)
- Member enrollment and upgrades
- Benefit tracking and validation
- Analytics (MRR, ARR, churn rate)
- Auto-renewal handling
- Payment integration (via Billing module)

## Provides
- `memberships.tier_benefits` - Benefit calculations
- `customers.profile_sections` - Membership info in customer profile
- `dashboard.widgets` - Membership metrics

## Consumes
- `billing.payment_received` - Activate/renew membership
- `billing.subscription_ended` - Expire membership

## Permissions
- minimumRole: `SUPERVISOR`
- create: Enroll new members
- read: View membership list
- update: Upgrade tiers, change payment frequency
- delete: Cancel memberships

## Service Layer
\`src/pages/admin/operations/memberships/services/membershipApi.ts\`

All API calls include permission validation.

## Dependencies
- Customers module (customer records)
- Billing module (payment processing)

## Usage Example
\`\`\`typescript
import { createMembership, checkBenefitAccess } from './services/membershipApi';

// Enroll customer in Gold tier
await createMembership({
  customer_id: 'customer-123',
  tier_id: 'gold-tier-id',
  payment_frequency: 'yearly'
}, user);

// Check if member can use benefit
const { hasAccess } = await checkBenefitAccess('membership-id', 'benefit-id');
\`\`\`
```

---

### 5️⃣ VALIDATION (30 min)

**Production-Ready Checklist**:
- [ ] ✅ Architecture compliant
- [ ] ✅ Scaffolding ordered (services/, types/ created)
- [ ] ✅ Zero ESLint errors
- [ ] ✅ Zero TypeScript errors
- [ ] ✅ Cross-module mapped (README created)
- [ ] ✅ Zero duplication
- [ ] ✅ DB connected (service layer complete)
- [ ] ✅ Features mapped
- [ ] ✅ Permissions designed
- [ ] ✅ README complete

**Manual Testing Workflow**:
1. [ ] Create membership tier (Bronze)
2. [ ] Create membership tier (Gold)
3. [ ] Enroll customer in Bronze tier
4. [ ] View membership in customer profile
5. [ ] Upgrade customer to Gold tier
6. [ ] View analytics dashboard
7. [ ] Track benefit usage
8. [ ] Cancel membership
9. [ ] Test auto-renewal (mock billing payment)
10. [ ] Test with different roles (SUPERVISOR, ADMINISTRADOR)

**Final Validation**:
```bash
pnpm -s exec eslint src/modules/memberships/
pnpm -s exec eslint src/pages/admin/operations/memberships/
pnpm -s exec tsc --noEmit
```

Expected output: **0 errors**

---

## 🚨 CRITICAL PATTERNS

### ✅ DO
- Import from `@/shared/ui`
- Use `usePermissions('memberships')`
- Use `requirePermission()` in service layer
- Document all database tables in README
- Handle expired memberships gracefully
- Track benefit usage for analytics
- Emit EventBus events for tier upgrades
- Validate payment before activation

### ❌ DON'T
- Import directly from `@chakra-ui/react`
- Hardcode tier prices (use database)
- Skip permission checks
- Allow membership without customer record
- Delete memberships (soft delete with status='cancelled')
- Skip README documentation

---

## 📚 REFERENCE IMPLEMENTATIONS

**Study These**:
- `src/modules/customers/` - Customer integration pattern
- `src/pages/admin/supply-chain/materials/` - CRUD pattern
- `src/hooks/usePermissions.ts` - Permission hook

---

## 📊 SUCCESS CRITERIA

### Module Complete When:
- [ ] 0 ESLint errors
- [ ] 0 TypeScript errors
- [ ] All 10 production-ready criteria met
- [ ] README.md created
- [ ] Service layer complete
- [ ] All CRUD working
- [ ] EventBus integration verified
- [ ] Manual testing passed (10 workflows)

---

## 🔧 COMMANDS

```bash
# Audit
pnpm -s exec eslint src/modules/memberships/
pnpm -s exec eslint src/pages/admin/operations/memberships/
pnpm -s exec tsc --noEmit

# Database
# Verify tables in Supabase Dashboard
```

---

## ⏱️ TIME TRACKING

- [ ] Audit: 30 min
- [ ] Fix Structure: 1 hour
- [ ] Database & Functionality: 1.5 hours
- [ ] Cross-Module: 1 hour
- [ ] Validation: 30 min

**Total**: 4.5 hours

---

**Status**: 🔴 NOT STARTED (needs service layer + database)
**Dependencies**: Customers ✅, Billing (partial)
**Next**: Rentals (after Memberships complete)
