# Intelligence (`/modules/intelligence`)

## Overview
Competitive Intelligence and Market Analysis module. Provides strategic insights by analyzing internal data against external market trends and competitor benchmarks.

## 🏗️ Architecture
**Type**: Analytics Module
**Category**: Analytics

### Key Integration Points
| Integration | Type | Description |
|-------------|------|-------------|
| **Reporting** | Dependency | Relies on the Reporting module for data visualization. |
| **Sales** | Consumer | Analyzes `sales.metrics` for market share calculation. |
| **Materials** | Consumer | Tracks `pricing_trends` for cost benchmarking. |
| **Dashboard** | Provider | Injects "Market Insights" widget. |

---

## Features
- **Competitor Tracking**: Monitor competitor pricing and offerings (via data entry or scraping).
- **Market Trends**: Visualization of industry trends vs internal performance.
- **SWOT Analysis**: Tools for internal strength/weakness assessment.
- **Price Benchmarking**: Compare internal costs/prices with market averages.

---

## 🪝 Hooks & Extension Points

### Provided Hooks
#### 1. `dashboard.widgets`
- **Purpose**: Displays high-level market insights on the executive dashboard.
- **Data**: Market share %, Competitor Price Index.

### Consumed Hooks
- `sales.metrics`: For internal performance benchmarking.
- `materials.pricing_trends`: For raw material cost analysis.

---

## 🔌 Public API (`exports`)

### Methods
```typescript
// Get current market trend analysis
const trends = await registry.getExports('intelligence').getMarketTrends();

// Get specific competitor analysis
const analysis = await registry.getExports('intelligence').getCompetitorAnalysis();
```

---

## 🔒 Access Control
- **Minimum Role**: `ADMINISTRADOR`
- **Required Permission**: `reporting.view` (inherits from Reporting module)

---

**Last Updated**: 2025-01-25
**Module ID**: `intelligence`
