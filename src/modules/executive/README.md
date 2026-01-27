# Executive (`/modules/executive`)

## Overview
High-level Business Intelligence (BI) and Command Dashboard for C-Level executives and owners. It focuses on **KPIs**, **Trends**, and **Strategic Audits** rather than daily operations.

## 🏗️ Architecture
**Type**: Analytics Module
**Category**: Strategic

This module sits at the top of the data hierarchy, aggregating insights from *all* other business modules (Finance, Operations, Sales).

### Key Integration Points
| Integration | Type | Description |
|-------------|------|-------------|
| **Finance** | Consumer | Aggregates P&L, Cash Flow, and EBITDA. |
| **Sales** | Consumer | Tracks Top-line Revenue and Growth vs Last Year. |
| **Staff** | Consumer | Monitors Labor Cost % and Turnover metrics. |
| **Settings** | Host | Manages global business goals and targets. |

---

## Features
- **Executive Dashboard**: "Morning Coffee" view with critical health metrics.
- **P&L Visualizer**: Interactive Profit & Loss statement.
- **Drill-Down Audits**: Ability to click a metric and see the underlying transactions.
- **Goal Tracking**: Progress bars for Monthly/Quarterly targets.

---

## 🪝 Hooks & Extension Points

### Provided Hooks
#### 1. `executive.widgets`
- **Purpose**: Exclusive slots for high-level widgets (e.g., "Cash Burn Rate").

#### 2. `dashboard.widgets`
- **Purpose**: Provides a simplified "Executive Summary" widget for the main dashboard.

### Consumed Events
- `finance.period_closed`: Triggers the generation of monthly executive reports.
- `alerts.critical`: Escalates severe operational issues to the executive view.

---

## 🔌 Public API (`exports`)

### KPIs
```typescript
// Get live EBITDA
const ebitda = await registry.getExports('executive').services.getLiveEBITDA();

// Get "Run Rate" forecast
const forecast = await registry.getExports('executive').services.getRevenueForecast({
  method: 'linear_regression',
  days: 30
});
```

---

## 🔒 Access Control
- **Minimum Role**: `GERENTE` (Strictly enforced)
- **Permissions**: `executive.view_sensitive_financials`

---

**Last Updated**: 2025-01-25
**Module ID**: `executive`
