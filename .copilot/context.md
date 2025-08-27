# GitHub Copilot Workspace Setup para G-Mini

## Configuración optimizada para tu dominio:

### Context Files (.copilot/context.md):
```markdown
# Restaurant Management Domain Context

## Business Logic Patterns:
- **Inventory Management**: COUNTABLE/MEASURABLE/ELABORATED items
- **Recipe Engineering**: Cost calculation with yield analysis
- **Sales Flow**: POS → Kitchen → Delivery pipeline
- **Customer Analytics**: RFM analysis and segmentation

## Technical Patterns:
- **Zustand Stores**: Immer-based mutations
- **Supabase Integration**: RPC calls for business logic
- **Real-time Updates**: WebSocket event system
- **Form Handling**: React Hook Form + Chakra UI v3

## Code Generation Preferences:
- Use TypeScript strict mode
- Follow feature-module structure
- Include error boundaries
- Add comprehensive tests with Vitest
```

### Smart Prompts para tu contexto:
1. "Generate inventory validation with business rules"
2. "Create recipe cost calculation with yield factors"
3. "Build customer segmentation logic with RFM analysis"
4. "Design kitchen workflow state machine"

### Repository-level optimizations:
- Copilot aprenderá tus patrones de imports específicos
- Sugerirá consistencia en tu arquitectura modular
- Ayudará con tipos específicos de restaurant management
