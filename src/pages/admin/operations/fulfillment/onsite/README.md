# Floor Management Module

## Overview
Comprehensive floor management for restaurant operations including table tracking, reservations, and floor plan visualization.

## Features
- ✅ Real-time table status tracking
- ✅ Floor plan grid visualization
- ✅ Party management (size, customer, seated time, spent)
- ✅ Revenue and turnover metrics
- ✅ Wait time estimation
- ✅ Quick view component for Sales POS embedding
- 🚧 Reservations (placeholder - Coming Soon)
- 🚧 Analytics (placeholder - Coming Soon)

## Components

### `page.tsx`
Main Floor Management page with integrated sections (NO nested tabs).

### `FloorStats.tsx`
Stats bar showing:
- Available tables count
- Occupancy rate
- Today's revenue
- Average wait time
- High wait time alerts

### `FloorPlanView.tsx`
Core floor plan grid with:
- Table cards with status colors
- Party tracking (size, customer, time, spent)
- Performance stats (turns, revenue)
- Action buttons (View, Seat Party, Check Status)
- Real-time updates via Supabase subscriptions

### `FloorPlanQuickView.tsx`
Simplified view for embedding in Sales POS:
- Compact table grid
- Quick table selection
- Available/Occupied status only

### `ReservationsList.tsx`
Placeholder for future reservation management.

## Dependencies
- **Supabase**: `tables`, `parties` tables
- **Real-time subscriptions**: Live updates
- **RPC**: `pos_estimate_next_table_available`
- **DecimalUtils**: Financial precision

## Usage

### Main Page
Navigate to `/admin/operations/floor` to access floor management.

### Embedding in Sales
```tsx
import { FloorPlanQuickView } from '@/pages/admin/operations/floor/components/FloorPlanQuickView';

<FloorPlanQuickView onTableSelect={(tableId) => handleTableSelect(tableId)} />
```

## Integration
- Sales POS can quick-view floor plan via `FloorPlanQuickView` component
- Real-time updates broadcast via Supabase channels
- EventBus integration planned for cross-module events

## Technical Details
- **Core logic**: ~570 lines (migrated from Operations Hub)
- **Real-time subscriptions**: Supabase channels with auto-refresh
- **Decimal.js**: Financial precision for revenue/costs
- **Table statuses**: available, occupied, reserved, cleaning, ready_for_bill, maintenance
- **Priority levels**: normal, vip, urgent, attention_needed
- **NO nested tabs**: All sections integrated in single scrollable page

## Migration Notes
- Migrated from `src/pages/admin/operations/hub/tables.tsx` (452 lines)
- Removed nested tabs (Floor Plan, Reservations, Analytics)
- Converted to section-based layout with ContentLayout + Section
- Extracted components for better modularity
- Created QuickView for Sales POS integration
