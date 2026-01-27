# Finance Fiscal (`/modules/finance-fiscal`)

## Overview
Fiscal and tax management, including compliance with local tax authorities (e.g., AFIP in Argentina). Handles official invoice numbering, tax reporting, and electronic documentation.

## Access Control
- **Category**: Compliance
- **Permissions**: `fiscal` permissions.
- **Minimum Role**: `SUPERVISOR`

## Features
- **Fiscal Invoicing**: Generation of legal tax documents (Factura A, B, C).
- **Tax Reporting**: Daily/Monthly tax reports (IVA, IIBB).
- **Compliance Checks**: Validation of tax IDs (CUIT/CUIL).

## Hooks
### Provided
- `fiscal.invoice_generated`: Emitted when a legal invoice is finalized.
- `sales.payment_actions`: "Emitir Factura" actions in POS.
- `dashboard.widgets`: Fiscal health status.

### Consumed
- `sales.order_completed`: Trigger for fiscal invoicing.

## Dependencies
- `sales`
