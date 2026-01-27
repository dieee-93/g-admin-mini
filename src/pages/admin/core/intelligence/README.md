# Intelligence Module (`/admin/core/intelligence`)

## Overview
The Intelligence module focuses on Competitive Intelligence and Market Analysis, providing tools to track market trends and competitor activity.

## Access Control
- **Roles**: `ADMINISTRADOR`, `GERENTE`
- **Permissions Required**: `intelligence.view`

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Market Analysis** | `/` | `CompetitiveIntelligence` | Dashboard for competitive insights. |

## Key Sections
- **Market Analysis**: Main dashboard displaying competitive data and market tracking metrics.

## Dependencies
- `shared/ui`: Standard UI components.
- `CompetitiveIntelligence` component (internal).
