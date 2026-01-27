# Finance Billing (`/modules/finance-billing`)

## Overview
Billing and subscription management. Handles recurring billing, subscriptions, invoice generation, and payment plan administration.

## Access Control
- **Category**: Invoicing
- **Permissions**: `billing` permissions.
- **Minimum Role**: `SUPERVISOR`

## Features
- **Invoice Generation**: Create invoices from sales or subscriptions.
- **Subscriptions**: Recurring billing engine (Phase 3).
- **Payment Processing**: Record payments against invoices.

## Hooks
### Provided
- `billing.invoice_generated`: Event when invoice is created.
- `billing.payment_received`: Event when payment is recorded.
- `dashboard.widgets`: Billing stats.
- `customers.profile_sections`: Billing history in customer profile.

### Consumed
- `sales.order_completed`: Trigger for invoice generation.
- `customers.account_created`: Setup billing profile.

## Dependencies
- `customers`
