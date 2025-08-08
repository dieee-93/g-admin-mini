# G-Admin Mini: Intelligent Business Management Platform

## Project Overview

G-Admin Mini is a cutting-edge, feature-rich business management platform designed for small to medium enterprises, focusing on comprehensive operational intelligence and streamlined management across multiple business domains.

### Key Features
- 🚀 Modular architecture with feature-based design
- 📊 Advanced analytics and real-time insights
- 💡 AI-powered decision support systems
- 📱 Responsive mobile-first design
- 🔒 Secure Supabase authentication and data management

### Technology Stack
- **Frontend**: React 19, TypeScript
- **UI Framework**: Chakra UI v3.23.0
- **State Management**: React Context
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL)
- **Testing**: Vitest, React Testing Library
- **Build Tool**: Vite
- **Deployment**: Flexible (Vercel, Netlify recommended)

## Project Structure

```
src/
├── components/        # Shared UI components
│   ├── common/
│   ├── layout/
│   ├── navigation/
│   └── ui/
├── contexts/          # Global state management
├── features/          # Domain-specific modules
│   ├── customers/
│   ├── inventory/
│   ├── products/
│   ├── recipes/
│   ├── sales/
│   ├── scheduling/
│   ├── settings/
│   └── staff/
├── lib/               # Utility functions
├── pages/             # Top-level page components
└── types/             # Shared TypeScript types
```

### Architecture Pattern: Screaming Architecture

The project follows a "Screaming Architecture" pattern, where the directory structure and organization immediately communicate the system's primary capabilities and domains. Each feature module is self-contained with its own:
- `data/`: API and data fetching logic
- `ui/`: Presentation components
- `logic/`: Business logic and hooks
- `types.ts`: Domain-specific type definitions
- `index.tsx`: Module exports and configurations

## Core Modules

### 1. Dashboard
- Aggregate business insights
- Quick stats and performance indicators
- Customizable widgets

### 2. Sales
- Point of Sale (POS) system
- Sales analytics
- Order management
- Table & QR ordering
- Payment processing

### 3. Customers
- Customer relationship management
- RFM (Recency, Frequency, Monetary) analytics
- Segmentation
- Order history

### 4. Inventory
- Stock management
- Item tracking
- Low stock alerts
- Universal item management

### 5. Production
- Product cost analysis
- Production planning
- Kitchen management
- Component management

### 6. Recipes
- Recipe intelligence
- Menu engineering
- Smart cost calculator
- Recipe builder

### 7. Staff & Scheduling
- Employee management
- Shift scheduling
- Performance tracking

## Development Setup

### Prerequisites
- Node.js 20.x
- pnpm 8.x
- Supabase account

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/g-admin-mini.git

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run development server
pnpm dev
```

### Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_APP_ENV`: Development environment

## Testing Strategy

- Unit Testing: Vitest
- Component Testing: React Testing Library
- Coverage Target: 80%
- Test Types:
  - Unit tests
  - Integration tests
  - Component snapshot tests

Run tests:
```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage
```

## Performance Optimization

- Code splitting
- Lazy loading of components
- Memoization of heavy computations
- Efficient re-rendering strategies
- Bundle size monitoring

## Deployment

### Build Process
```bash
# Production build
pnpm build
```

### Recommended Platforms
- Vercel
- Netlify
- Cloudflare Pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit with conventional commits
4. Open a pull request

## License

Proprietary - All Rights Reserved

## Contact

Maintainer: [Your Name]
Email: [Your Email]
EOL' < /dev/null
