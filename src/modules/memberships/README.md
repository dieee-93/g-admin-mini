# Memberships (`/modules/memberships`)

## Overview
Comprehensive subscription and membership management system. Handles customer access tiers, recurring billing integration, and loyalty benefits.

## 🏗️ Architecture
**Type**: Business Module
**Category**: Business

This module bridges **CRM** (Customers) and **Finance** (Billing). It decouples subscription logic from the core customer profile, allowing for plug-and-play membership features.

### Key Integration Points
| Integration | Type | Description |
|-------------|------|-------------|
| **Customers** | Host | Injects membership details into the Customer Profile. |
| **Billing** | Partner | Communicates via `EventBus` to handle payments and expirations. |
| **Dashboard** | Provider | Injects "Active Subscribers" widget. |

---

## Features
- **Tier Management**: Define Silver/Gold/Platinum tiers with specific benefits.
- **Automated Lifecycle**: Auto-activates on payment, auto-expires on subscription end.
- **Benefit Tracking**: Validate member access to specific perks (e.g., "Free Delivery").
- **Loyalty Program**: (Optional) Points accumulation for members.

---

## 🪝 Hooks & Extension Points

### Provided Hooks
#### 1. `customers.profile_sections`
- **Purpose**: Renders the "Membership Status" card inside a Customer's detail view.
- **Component**: `<CustomerMembershipSection />` (Lazy loaded)
- **Priority**: `80` (High)

#### 2. `dashboard.widgets`
- **Purpose**: General membership stats (New Signups, Churn Rate).
- **Component**: `<MembershipsWidget />`

#### 3. `memberships.tier_benefits`
- **Purpose**: Allows other modules to query or display available benefits for a tier.

### Consumed Events (`EventBus`)
#### `billing.payment_received`
- **Trigger**: Billing module confirms a successful subscription payment.
- **Action**: Calls `activationService` to renew/start the membership.

#### `billing.subscription_ended`
- **Trigger**: Subscription expires or is cancelled.
- **Action**: Demotes the user or marks membership as inactive.

---

## 🔌 Public API (`exports`)

### Benefit Validation
```typescript
// Check if a member has access to a specific benefit
const hasAccess = await registry.getExports('memberships').checkAccess(memberId, 'free_shipping');
```

### Manual Renewal
```typescript
// Manually renew a membership (admin override)
await registry.getExports('memberships').renewMembership(memberId);
```

---

## 🗄️ Services & Logic
The logic is split into:
- **`activationService`**: Handles the state transitions (Active/Inactive/Grace Period).
- **`benefitService`**: Resolves what a user can do based on their tier.

---

**Last Updated**: 2025-01-25
**Module ID**: `memberships`
