# Customers (CRM) (`/modules/customers`)

## Overview
Customer Relationship Management functionality. Tracks customer data, preferences, loyalty scores (RFM), and service history.

## Access Control
- **Category**: Business
- **Permissions**: `sales` module permissions (tied to CRM features).
- **Minimum Role**: `OPERADOR`

## Features
- **Customer Profiles**: Detailed tracking of customer data.
- **RFM Analysis**: Automated Recency, Frequency, Monetary scoring.
- **Loyalty Program**: (Optional) Points and rewards tracking.
- **Service History**: Log of all interactions and sales.

## Hooks
### Provided
- `customers.profile_sections`: Extensions for customer profile view.
- `customers.quick_actions`: Actions available in customer lists.
- `dashboard.widgets`: CRM specific widgets.

### Consumed
- `sales.order_completed`: Updates purchase history and RFM scores.

## Dependencies
- `sales` (Permission Module)
- `shared/ui`
