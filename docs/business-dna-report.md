# Business DNA Report: Technical Design

This document outlines the technical design for the Business DNA Report feature.

## 1. High-Level Architecture

The feature will be implemented using a client-server architecture. The backend will be responsible for data aggregation and insight generation, while the frontend will handle the rendering of the report.

### Backend

A new API endpoint will be created:

**Endpoint:** `POST /api/reports/business-dna`

**Authentication:** Requires an authenticated user session.

**Request Body:**

```json
{
  "userId": "string"
}
```

**Backend Logic:**

1.  **Fetch User DNA:** Retrieve the `archetype` and `operationalProfile` for the given `userId` from the business profile in the database.
2.  **Cohort Analysis:** Perform a database query to select an anonymized cohort of businesses.
    *   **Primary Cohort:** Businesses with the same `archetype`.
    *   **Secondary Cohort (Optional):** Businesses with at least one overlapping `operationalProfile` item.
3.  **Generate Comparative Insights:** Calculate key metrics by comparing the user's DNA against the cohort. Examples:
    *   Percentage of businesses in the cohort that have unlocked a specific "planet" (operational profile item).
    *   Most common combination of "planets" for the user's archetype.
    *   Average number of "planets" unlocked for the archetype.
4.  **Generate Contextual Insights:** Provide actionable advice based on the user's DNA. For example, if a "Restaurante/Bar" does not have "Canal Digital Sincrónico" unlocked, suggest the benefits of offering delivery.
5.  **Construct Response:** Assemble the data into a JSON response.

**Response Body:**

```json
{
  "userDna": {
    "archetype": "Restaurante/Bar",
    "operationalProfile": [
      { "name": "Escala Local", "isUnlocked": true, "icon": "🏠" },
      { "name": "Canal Digital Sincrónico", "isUnlocked": false, "icon": "🌐" }
    ]
  },
  "comparativeInsights": [
    {
      "type": "donut_chart",
      "title": "Adopción de Canal Digital",
      "insight": "El 65% de los negocios como el tuyo ya venden online.",
      "data": [
        { "name": "Con Canal Digital", "value": 65 },
        { "name": "Sin Canal Digital", "value": 35 }
      ]
    }
  ],
  "contextualInsights": [
    {
      "title": "Oportunidad en Delivery",
      "text": "Considera activar el delivery para alcanzar a más clientes en tu área. Es un paso natural para tu tipo de negocio."
    }
  ]
}
```

## 2. Frontend Components

A new page will be created at `/admin/reports/dna`. This page will be composed of several new UI components.

### New Directory Structure

```
src/pages/admin/reports/dna/
├── components/
│   ├── DnaReportConstellation.tsx
│   ├── ComparativeInsightCard.tsx
│   └── PrintReportButton.tsx
└── page.tsx (DnaReportPage)
```

### Component Breakdown

*   **`DnaReportPage.tsx` (`page.tsx`)**:
    *   The main page component.
    *   Responsible for fetching data from the `/api/reports/business-dna` endpoint using a data fetching hook (e.g., `useSWR` or `react-query`).
    *   Manages the loading and error states.
    *   Orchestrates the layout of the report, assembling the other components.

*   **`DnaReportConstellation.tsx`**:
    *   A reusable version of the `BusinessConstellation` component, adapted for the report.
    *   It might include additional visual elements like annotations or highlighted paths based on the insights received from the API.

*   **`ComparativeInsightCard.tsx`**:
    *   A generic card component to display a single insight.
    *   It will accept a `type` prop (`donut_chart`, `bar_chart`, `text`) to render the appropriate visualization.
    *   It will use a charting library (e.g., `recharts` or `nivo`) for the graph visualizations.

*   **`PrintReportButton.tsx`**:
    *   A button that triggers the browser's print functionality (`window.print()`).
    *   It will be accompanied by a print-specific stylesheet (`@media print`) to ensure the report is formatted cleanly for paper, hiding UI elements like the navigation sidebar and the button itself.

This modular approach ensures that the report is easy to maintain and extend with new insights in the future.
