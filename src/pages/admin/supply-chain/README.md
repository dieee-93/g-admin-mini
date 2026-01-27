# Supply Chain Module (`/admin/supply-chain`)

## Overview
Supply Chain handles the flow of goods and services, from supplier management to inventory tracking (Materials) and catalog definitions (Products).

## Access Control
- **Roles**: `ADMINISTRADOR`, `GERENTE`, `OPERADOR` (Inventory only)

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Materials** | `/materials` | `materials/page.tsx` | Raw materials inventory. |
| **Products** | `/products` | `products/page.tsx` | Catalog (finished goods) management. |
| **Suppliers** | `/suppliers` | `suppliers/page.tsx` | Vendor database and purchasing. |

## Key Sections
- **Inventory Control**: Real-time stock levels.
- **Catalog Management**: Pricing and product definitions for Sales.

## Dependencies
- `finance`: For purchasing/costs.
