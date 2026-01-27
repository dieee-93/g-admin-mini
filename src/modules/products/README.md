# Products (`/modules/products`)

## Overview
Central Product Catalog module. Manages menus, recipes, pricing, and product availability. It serves as the single source of truth for what can be sold and how it is composed.

## 🏗️ Architecture
**Type**: Core Module
**Category**: Business

This module connects **Supply Chain** (Materials) with **Sales** (POS). It handles the conversion of raw materials into sellable items (Recipes).

### Key Integration Points
| Integration | Type | Description |
|-------------|------|-------------|
| **Materials** | Dependency | Consumes `materials` to build recipes (BOM). |
| **Sales** | Consumer | Listens for `order_completed` to track item popularity. |
| **Dashboard** | Provider | Injects "Top Selling Products" widget. |
| **Menu Engineering** | Provider | Calculates margins based on live material costs. |

---

## Features
- **Recipe Management**: Bill of Materials (BOM) linking products to ingredients.
- **Cost Calculation**: Dynamic recipe costing based on real-time material prices.
- **Menu Management**: Categorization and definition of sellable items.
- **Availability Logic**: Auto-calculates renderable quantity based on stock.

---

## 🪝 Hooks & Extension Points

### Provided Hooks
#### 1. `materials.row.actions`
- **Purpose**: Adds a "Recipe Usage" button to the Materials grid.
- **Action**: Allows users to see which products are affected if a material stock runs low.

#### 2. `dashboard.widgets`
- **Purpose**: Displays product performance metrics.
- **Component**: `<ProductsWidget />` (Lazy loaded)

#### 3. `products.availability_updated` (Event)
- **Purpose**: Notifies the POS when a product is out of stock.

### Consumed Events (`EventBus`)
#### `materials.stock_updated`
- **Trigger**: Any inventory change.
- **Action**: Recalculates maximum producible quantity for linked recipes.
- **Priority**: High (Critical for preventing overselling).

#### `sales.order_completed`
- **Trigger**: Completed transaction.
- **Action**: Updates "Sold Count" for reporting and menu engineering.

---

## 🔌 Public API (`exports`)

### Recipe Logic
```typescript
// Check if we can make 5 units of "Burger X"
const check = await registry.getExports('products').canProduceRecipe(recipeId, 5);
// { canProduce: false, missingMaterials: ['Beef Patty'] }

// Get dynamic cost based on current ingredient prices
const { cost } = await registry.getExports('products').calculateRecipeCost(recipeId);
```

### Data Access
```typescript
// Fetch full product details
const { product } = await registry.getExports('products').getProduct(id);
```

---

## 🗄️ Database Schema
**Table**: `products` (Sellable items)
**Table**: `product_components` (Junction table for Recipe/BOM)
- `product_id`: FK to Products
- `item_id`: FK to Materials (Ingredients)
- `quantity`: Amount required per unit

---

## 🚦 Future Enhancements
- **Modifiers**: Add-ons and variations (e.g., "No Cheese", "Extra Medium").
- **Combo Meals**: Logic for bundling products.
- **Nutritional Info**: Auto-calculate calories based on ingredients.

---

**Last Updated**: 2025-01-25
**Module ID**: `products`
