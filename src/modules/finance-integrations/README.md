# Finance Integrations (`/modules/finance-integrations`)

## Overview
manages connections to external financial services such as banks, payment gateways (MercadoPago, Stripe), and external accounting logic.

## Access Control
- **Category**: Payments
- **Permissions**: `billing` permissions.
- **Minimum Role**: `ADMINISTRADOR`

## Features
- **Gateway Connectivity**: Interface for payment providers.
- **Bank Reconciliation**: (Planned) Sync with bank feeds.
- **Accounting Export**: Export data to external ERP/Accounting software.

## Hooks
### Provided
- `finance.integration_status`: Health check for connections.
- `settings.integrations`: Configuration panels.

### Consumed
- `billing.payment_received`: To sync payment status.
- `fiscal.invoice_generated`: To sync invoice data.

## Dependencies
- `finance-billing`
- `finance-fiscal`
