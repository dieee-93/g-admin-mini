# 🐛 Debug Module

**Module**: Debug Tools
**Domain**: Core (Development)
**Version**: 1.0.0
**Status**: ✅ Production Ready

---

## 📋 OVERVIEW

The **Debug Module** provides comprehensive development and diagnostic tools for system debugging, performance monitoring, and state inspection. **This module is only accessible to SUPER_ADMIN users and only available in development mode.**

---

## 🎯 PURPOSE

### What This Module Does

- **EventBus Monitoring**: Track event flow across modules
- **Module Registry Inspection**: View registered modules and their state
- **Performance Metrics**: Monitor FPS, bundle size, and load times
- **Store Debugging**: Inspect Zustand store states and detect infinite loops
- **Console Helper Integration**: Access advanced logging and debugging tools
- **Theme/Token Inspection**: Debug Chakra UI theme tokens and colors

### What This Module Does NOT Do

- ❌ Modify system behavior
- ❌ Expose sensitive data (passwords, tokens)
- ❌ Work in production builds
- ❌ Provide user-facing features

---

## 🔐 SECURITY & ACCESS

### Access Control

```typescript
// Only SUPER_ADMIN can access
minimumRole: 'SUPER_ADMIN'

// Only in development mode
if (import.meta.env.PROD) {
  return null; // Hidden in production
}
```

### Critical Security Rules

1. **NEVER expose sensitive data** (passwords, API keys, tokens)
2. **NEVER modify production data** from debug tools
3. **ALWAYS verify SUPER_ADMIN role** before rendering
4. **ALWAYS check development mode** before activating

---

## 📂 FILE STRUCTURE

```
src/modules/debug/
├── manifest.tsx               # Module definition
└── README.md                  # This file

src/pages/admin/debug/
└── page.tsx                   # Main debug page

src/components/debug/
├── StoreDebugger.tsx          # Store state inspection
├── TokenTest.tsx              # Theme token viewer
├── WorkingThemeTest.tsx       # Theme testing
├── SimpleThemeTest.tsx        # Simple theme demo
├── SystemTokenDebug.tsx       # System token debug
└── PaletteSystemTest.tsx      # Color palette test

src/lib/performance/components/
└── PerformanceDashboard.tsx   # Performance monitoring
```

---

## 🛠️ AVAILABLE TOOLS

### 1. Performance Dashboard

**Location**: Performance tab
**Component**: `PerformanceDashboard`

**Features**:
- Real-time FPS monitoring
- Bundle size analysis
- Lazy loading stats
- Chunk load performance
- Runtime optimizations

**Usage**:
```typescript
import { PerformanceDashboard } from '@/lib/performance/components/PerformanceDashboard';
```

---

### 2. Store Debugger

**Location**: Stores tab
**Component**: `StoreDebugger`

**Features**:
- Detect infinite render loops
- Inspect Zustand store states
- Track store updates
- Monitor render counts

**Usage**:
```typescript
import { StoreDebugger } from '@/components/debug/StoreDebugger';
```

---

### 3. Theme/Token Inspector

**Location**: Theme/Tokens tab
**Component**: `TokenTest`

**Features**:
- View all theme tokens
- Test color palettes
- Inspect semantic tokens
- Debug theme switching

**Usage**:
```typescript
import { TokenTest } from '@/components/debug/TokenTest';
```

---

### 4. Console Helper

**Location**: Console tab
**Access**: `window.__CONSOLE_HELPER__`

**Features**:
- Filter logs by level (error, warn, info, debug)
- Get top active modules
- Export logs for AI analysis
- Search logs by module

**Commands**:
```javascript
// Get last 10 errors
__CONSOLE_HELPER__.getErrors(10)

// Get top 5 active modules
__CONSOLE_HELPER__.getTopModules(5)

// Get logs for Materials module
__CONSOLE_HELPER__.getByModule("Materials", 20)

// Export for AI (reduces token usage)
__CONSOLE_HELPER__.exportForAI({ level: "error" })

// Get statistics summary
__CONSOLE_HELPER__.getSummary()
```

---

## 🔄 MODULE REGISTRY INTEGRATION

### Manifest Configuration

```typescript
{
  id: 'debug',
  name: 'Debug Tools',
  version: '1.0.0',

  // No dependencies
  depends: [],

  // Always installed (filtered by role in navigation)
  autoInstall: true,

  // No required features (dev mode only)
  requiredFeatures: [],

  // SUPER_ADMIN only
  minimumRole: 'SUPER_ADMIN',

  // Provided hooks
  hooks: {
    provide: [
      'debug.tools',      // Debug tool panels
      'debug.metrics',    // Debug metrics
      'debug.actions',    // Debug actions
    ],
    consume: [],          // Observer only
  },

  // Public API
  exports: {
    log: (category, message, data?) => {...},
    getDiagnostics: async () => {...},
    takeSnapshot: async () => {...},
  }
}
```

---

## 🎨 FEATURE MAPPING

### FeatureRegistry

```typescript
'debug': {
  alwaysActive: true,
  description: 'Herramientas de debug - visible solo para SUPER_ADMIN (filtrado por role)'
}
```

**Note**: The `debug` feature is always active but navigation filtering ensures only SUPER_ADMIN sees the route.

---

## 📍 ROUTING

### Route Configuration

```typescript
// routeMap.ts
'/admin/debug': 'LazyDebugPage'

// routeToFileMap
'/admin/debug': 'pages/admin/debug/page'
```

**Access URL**: `/admin/debug`

---

## 🧪 TESTING STRATEGY

### Manual Testing (Dev Mode Only)

1. **Access Control Test**:
   ```bash
   # Login as non-SUPER_ADMIN → should redirect to dashboard
   # Login as SUPER_ADMIN → should show debug page
   ```

2. **Performance Tools Test**:
   ```bash
   # Navigate to Performance tab
   # Verify FPS display
   # Check bundle size metrics
   ```

3. **Store Debugger Test**:
   ```bash
   # Navigate to Stores tab
   # Verify render count display
   # Check store state inspection
   ```

4. **Console Helper Test**:
   ```bash
   # Open browser DevTools
   # Run window.__CONSOLE_HELPER__.getSummary()
   # Verify output
   ```

### Production Test

```bash
# Build production
pnpm build

# Verify debug module hidden
# Navigate to /admin/debug → should redirect to dashboard
```

---

## 🔍 TROUBLESHOOTING

### Debug Page Not Accessible

**Check**:
1. User role is SUPER_ADMIN
2. Running in development mode
3. Route mapping is correct
4. Module is registered in `src/modules/index.ts`

### Console Helper Not Available

**Check**:
1. Running in development mode
2. Logger is configured correctly
3. Browser DevTools console is open

### Performance Dashboard Not Loading

**Check**:
1. All performance utilities imported correctly
2. No circular dependencies
3. Lazy loading working correctly

---

## 📊 PRODUCTION-READY CHECKLIST

- [x] ✅ Architecture compliant (Capabilities → Features → Modules)
- [x] ✅ Scaffolding ordered (components organized)
- [x] ✅ Zero errors (0 ESLint + 0 TypeScript)
- [x] ✅ UI complete (debug tools working)
- [x] ✅ Cross-module mapped (README complete)
- [x] ✅ Zero duplication (no repeated logic)
- [x] ✅ DB connected (N/A - dev tools only)
- [x] ✅ Features mapped (clear activation from FeatureRegistry)
- [x] ✅ Permissions designed (minimumRole: SUPER_ADMIN)
- [x] ✅ README (this document)

---

## 🚀 USAGE EXAMPLES

### Accessing Debug Tools

```typescript
// Navigate to debug page
<Link to="/admin/debug">Debug Tools</Link>

// Programmatic navigation
navigate('/admin/debug');
```

### Using Console Helper

```javascript
// In browser console
const summary = window.__CONSOLE_HELPER__.getSummary();
console.log('Total logs:', summary.totalMessages);
console.log('Errors:', summary.errors);

// Get recent errors
const errors = window.__CONSOLE_HELPER__.getErrors(5);
errors.forEach(err => console.error(err));

// Export for AI analysis
const aiData = window.__CONSOLE_HELPER__.exportForAI({
  level: 'error',
  limit: 50
});
```

### Using Debug API

```typescript
import { debugModule } from '@/modules/debug/manifest';

// Log debug information
debugModule.exports.log('MyModule', 'Debug message', { data: 123 });

// Get system diagnostics
const diagnostics = await debugModule.exports.getDiagnostics();
console.log('Environment:', diagnostics.environment);

// Take performance snapshot
const snapshot = await debugModule.exports.takeSnapshot();
console.log('Snapshot:', snapshot);
```

---

## 📚 RELATED MODULES

**Dependencies**: None (standalone)
**Dependents**: None (observer only)

**Related Systems**:
- Logger (`src/lib/logging/Logger.ts`)
- Performance Monitor (`src/lib/performance/`)
- Module Registry (`src/lib/modules/ModuleRegistry.ts`)
- EventBus (`src/lib/events/EventBus.ts`)

---

## 🏷️ METADATA

**Category**: Development
**Author**: G-Admin Team
**Tags**: debug, development, diagnostics, performance
**Domain**: Core
**Icon**: BugAntIcon (🐛)
**Color**: Red

---

## 📝 CHANGELOG

### v1.0.0 (2025-01-30)

- ✅ Initial production-ready release
- ✅ Consolidated debug tools
- ✅ SUPER_ADMIN access control
- ✅ Development mode only
- ✅ Console helper integration
- ✅ Performance dashboard
- ✅ Store debugger
- ✅ Theme/token inspector

---

## ⚠️ IMPORTANT NOTES

1. **Security First**: Never expose sensitive data through debug tools
2. **Dev Only**: This module MUST NOT appear in production builds
3. **SUPER_ADMIN Only**: Access control is critical
4. **Observer Pattern**: Debug module observes but doesn't modify system behavior
5. **No Production Impact**: Debug tools should never affect production performance or stability

---

**Status**: ✅ Production Ready
**Last Updated**: 2025-01-30
**Next Review**: After Phase 3 completion
