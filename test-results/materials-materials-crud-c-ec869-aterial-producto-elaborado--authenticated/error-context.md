# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:react-swc] x Expression expected ,-[I:/Programacion/Proyectos/g-mini/src/lib/lazy/LazyModules.ts:479:1] 476 | // Lazy-loaded Finance Billing Page (pages/admin/finance/billing/page.tsx) 477 | export const LazyBillingPage = createLazyComponent( 478 | () => import('../../pages/admin/finance/billing/page'), 479 | , : ^ 480 | { 481 | chunkName: 'billing-module', 482 | preload: false, `---- Caused by: Syntax Error"
  - generic [ref=e5]: I:/Programacion/Proyectos/g-mini/src/lib/lazy/LazyModules.ts
  - generic [ref=e7]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e8]: server.hmr.overlay
    - text: to
    - code [ref=e9]: "false"
    - text: in
    - code [ref=e10]: vite.config.ts
    - text: .
```