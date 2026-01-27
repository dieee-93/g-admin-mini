# Finance Corporate Module (`/admin/finance-corporate`)

## Overview
The Corporate Finance module manages B2B accounts, corporate credit, and large-scale client financial relationships.

## Access Control
- **Roles**: `ADMINISTRADOR`, `GERENTE`
- **Permissions**: `finance.corporate.manage`

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Corporate Accounts** | `/` | `page.tsx` | Management of corporate client accounts/credit. |

## Key Sections
- **Account Management**: Corporate profiles and credit limits.
- **Credit Tracking**: Monitoring of credit usage and payment terms.

## Dependencies
- `finance-billing`: for invoice generation.
- `crm`: for corporate client data.
