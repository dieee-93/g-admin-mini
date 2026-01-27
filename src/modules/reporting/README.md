# Reporting (`/modules/reporting`)

## Overview
Central Analytics and Reporting Engine. It aggregates data from all other modules to generate actionable business intelligence. It provides the framework for creating custom reports and dashboards.

## 🏗️ Architecture
**Type**: Analytics Module
**Category**: Analytics

This module is a **Consumer** of data and a **Provider** of visualization tools. It allows other modules to register their own data sources while centralizing the rendering logic.

### Key Integration Points
| Integration | Type | Description |
|-------------|------|-------------|
| **Dashboard** | Provider | Injects report widgets into the main dashboard. |
| **All Modules** | Consumer | Capable of querying data layers from Sales, Finance, Operations, etc. |

---

## Features
- **Custom Report Builder**: UI for selecting dimensions and metrics.
- **Data Source Registry**: Standardized way for modules to expose exportable data.
- **Exporting**: PDF, CSV, and Excel export capabilities.
- **Visualization Library**: Reusable chart components (Bar, Line, Pie).

---

## 🪝 Hooks & Extension Points

### Provided Hooks
#### 1. `reporting.data_sources`
- **Purpose**: Registry for other modules to define their datasets.
- **Usage**: A module (e.g., Sales) registers "Sales by Day" as a queryable source.
- **Benefit**: Decouples the report builder from the underlying data fetching logic.

#### 2. `reporting.chart_types`
- **Purpose**: Extensible chart library.

#### 3. `dashboard.widgets`
- **Purpose**: Generic report widgets used on the home screen.

---

## 🔌 Public API (`exports`)

### Report Generation
```typescript
// Generate a report programmatically
const report = await registry.getExports('reporting').generateReport({
  type: 'sales_summary',
  dateRange: 'last_30_days',
  format: 'pdf'
});
```

### Scheduling
```typescript
// Schedule an automated report email
await registry.getExports('reporting').scheduleReport(reportId, {
  cron: '0 8 * * 1', // Every Monday at 8 AM
  recipients: ['manager@example.com']
});
```

---

## 🔒 Access Control
- **Minimum Role**: `SUPERVISOR`
- **Permissions**: `reporting.view`, `reporting.create`

---

## 🚦 Future Enhancements
- **AI Insights**: Natural language summary of chart trends.
- **Data Blending**: Cross-module joins (e.g., "Staff Efficiency vs Customer Satisfaction").

---

**Last Updated**: 2025-01-25
**Module ID**: `reporting`
