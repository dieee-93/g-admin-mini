**********************
PowerShell transcript start
Start time: 20250823125357
Username: Robocop\Diego
RunAs User: Robocop\Diego
Configuration Name: 
Machine: ROBOCOP (Microsoft Windows NT 10.0.26100.0)
Host Application: C:\Program Files\WindowsApps\Microsoft.PowerShell_7.5.2.0_x64__8wekyb3d8bbwe\pwsh.dll
Process ID: 23264
PSVersion: 7.5.2
PSEdition: Core
GitCommitId: 7.5.2
OS: Microsoft Windows 10.0.26100
Platform: Win32NT
PSCompatibleVersions: 1.0, 2.0, 3.0, 4.0, 5.0, 5.1, 6.0, 7.0
PSRemotingProtocolVersion: 2.3
SerializationVersion: 1.1.0.1
WSManStackVersion: 3.0
**********************
Transcript started, output file is inventario.md
├─📂 assets
│   └─  📄 react.svg                                (   1 lines)
├─📂 components
│   ├─📂 admin
│   │   ├─⭐ 📄 CreateAdminUserForm.tsx                  ( 362 lines) → Validación estricta para creación de admins
│   │   └─  📄 index.ts                                 (   2 lines) → Admin components exports
│   └─📂 auth
│       ├─  📄 AuthPage.tsx                             (  55 lines)
│       ├─  📄 AuthPage.tsx.backup                      (  61 lines)
│       ├─  📄 DashboardRoleRouter.tsx                  (  23 lines) → /** Router que redirige usuarios CLIENTE del dashboard administrativo a su portal personalizado /
│       ├─  📄 index.ts                                 (   8 lines)
│       ├─  📄 LoginForm.tsx                            ( 165 lines)
│       ├─  📄 LoginForm.tsx.backup                     ( 158 lines) → Login successful - auth service will handle navigation
│       ├─  📄 LoginPageNew.tsx                         ( 267 lines) → Get redirect path from location state or default to home
│       ├─  📄 ProtectedRoute.tsx                       (  53 lines) → /** Component that protects routes requiring authentication Shows login page if user is not authenticated Shows fallback message if user lacks required permissions /
│       ├─  📄 ProtectedRouteNew.tsx                    ( 111 lines) → /** ProtectedRoute component using new auth system Protects routes based on authentication and optional role requirements /
│       ├─  📄 PublicOnlyRoute.tsx                      (  43 lines) → /** Componente que solo permite acceso a usuarios NO autenticados. Si el usuario ya está logueado, lo redirige a su ruta correspondiente según su rol. /
│       ├─  📄 RegisterForm.tsx                         ( 187 lines)
│       ├─  📄 RegisterForm.tsx.backup                  ( 188 lines) → Validation
│       ├─  📄 ResetPasswordForm.tsx                    ( 170 lines)
│       ├─  📄 ResetPasswordForm.tsx.backup             ( 179 lines)
│       └─  📄 RoleGuard.tsx                            (  93 lines) → /** Component to guard content based on user roles and permissions /
├─📂 config
│   ├─  📄 routeMap.ts                              ( 152 lines) → /** AUTOMATED ROUTE ↔ MODULE MAPPING SYSTEM Implementa la solución híbrida: preserva Screaming Architecture + optimiza Developer Experience /
│   └─  📄 routes.ts                                ( 251 lines) → /** Sistema de Rutas Centralizado - G-Admin Mini Configuración única para rutas, navegación y permisos /
├─📂 contexts
│   ├─⭐ 📄 AuthContext.tsx                          ( 421 lines) → User role type
│   ├─  📄 AuthContext.tsx.backup                   ( 255 lines) → User role type (based on your existing system)
│   └─⭐ 📄 NavigationContext.tsx                    (1020 lines) → ✅ Types definidos según arquitectura v2.0
├─📂 hooks
│   ├─  📄 index.ts                                 (   2 lines) → Main hooks exports
│   ├─  📄 useDashboardStats.ts                     (  82 lines) → ✅ OPCIÓN 1: Usar get_dashboard_stats si existe
│   ├─  📄 useErrorHandler.ts                       (  60 lines) → src/hooks/useErrorHandler.ts
│   ├─  📄 useMaterialValidation.ts                 ( 220 lines) → Simple field validators
│   ├─  📄 useNavigationBadges.ts                   (  63 lines) → src/hooks/useNavigationBadges.tsx 🚨 SISTEMA UNIFICADO DE BADGES DE NAVEGACIÓN ✅ Conecta el nuevo sistema de alertas con badges de módulos
│   ├─  📄 useNavigationConfig.ts                   (  91 lines) → /** Hook que genera la configuración de navegación basado en el sistema de rutas centralizado /
│   ├─  📄 usePasswordValidation.ts                 ( 182 lines) → /** Hook para validación de contraseñas con diferentes niveles de exigencia según el contexto de uso /
│   ├─  📄 useRecipeStockValidation.ts              (  96 lines) → hooks/useRecipeStockValidation.ts
│   ├─  📄 useRouteBasedPreloading.ts               ( 295 lines) → useRouteBasedPreloading.ts - Intelligent route-based module preloading Preloads modules based on current location and navigation patterns
│   ├─  📄 useSaleStockValidation.ts                (  80 lines) → hooks/useSaleStockValidation.ts
│   ├─  📄 useSmartRedirect.ts                      (  50 lines) → /** Hook inteligente para redirección post-login basada en rol Usa la configuración centralizada de rutas /
│   ├─  📄 useValidation.ts                         ( 120 lines) → Set errors and warnings in state
│   └─⭐ 📄 useZustandStores.ts                      ( 437 lines) → Custom hooks for accessing Zustand stores with better TypeScript support
├─📂 lib
│   ├─📂 error-handling
│   │   ├─📂 __tests__
│   │   │   ├─  📄 ErrorBoundary.test.tsx                   ( 180 lines) → Component that throws an error for testing
│   │   │   └─  📄 ErrorHandler.test.ts                     ( 127 lines) → Mock console methods
│   │   ├─  📄 ErrorBoundary.tsx                        ( 166 lines) → Call custom error handler if provided
│   │   ├─  📄 ErrorHandler.ts                          ( 205 lines) → Add to queue for batch processing
│   │   ├─  📄 index.ts                                 (  14 lines)
│   │   └─  📄 useErrorHandler.ts                       (  61 lines)
│   ├─📂 events
│   │   ├─⭐ 📄 EventBus.ts                              ( 382 lines) → EventBus - Central Event Management System
│   │   └─⭐ 📄 RestaurantEvents.ts                      ( 462 lines) → Restaurant Events - Event-Driven Architecture for G-Admin Based on architecture-plan.md event-driven patterns
│   ├─📂 lazy
│   │   ├─  📄 index.ts                                 (   2 lines) → Lazy loading system exports
│   │   └─  📄 LazyModules.ts                           ( 265 lines) → LazyModules.ts - Lazy-loaded page definitions with intelligent preloading Provides optimized code splitting for all major G-Admin Mini pages 🎯 POST-MIGRATION: All references updated from modules/ to pages/ structure
│   ├─📂 ml
│   │   ├─📂 core
│   │   │   └─⭐ 📄 MLEngine.ts                              ( 661 lines) → MLEngine.ts - Advanced Machine Learning Engine for G-Admin Mini Provides demand forecasting, pattern recognition, and predictive analytics
│   │   ├─📂 inventory
│   │   │   └─⭐ 📄 PredictiveInventory.ts                   ( 672 lines) → PredictiveInventory.ts - Intelligent inventory management with ML-powered predictions Automates reordering, optimizes stock levels, and prevents stockouts
│   │   ├─📂 recommendations
│   │   │   └─⭐ 📄 SmartRecommendations.ts                  (1157 lines) → SmartRecommendations.ts - AI-powered recommendation system for menu optimization Provides intelligent insights for sales, menu items, pricing, and customer preferences
│   │   ├─📂 selfhealing
│   │   │   └─⭐ 📄 AnomalyDetection.ts                      (1011 lines) → AnomalyDetection.ts - Advanced anomaly detection and self-healing system Monitors system health, detects issues, and applies automated fixes
│   │   └─⭐ 📄 index.ts                                 ( 725 lines) → ML Library Index - Complete Machine Learning and AI integration for G-Admin Mini Centralized exports for all ML/AI functionality including predictions, recommendations, and self-healing
│   ├─📂 offline
│   │   ├─⭐ 📄 ConflictResolution.ts                    ( 797 lines) → ConflictResolution.ts - Advanced Conflict Resolution for G-Admin Mini Handles complex data conflicts with intelligent resolution strategies
│   │   ├─⭐ 📄 index.ts                                 ( 318 lines) → index.ts - Offline Library Exports for G-Admin Mini Central export point for all offline functionality
│   │   ├─⭐ 📄 LocalStorage.ts                          ( 615 lines) → LocalStorage.ts - IndexedDB Management for G-Admin Mini Provides robust local storage with schema versioning and data migrations
│   │   ├─⭐ 📄 OfflineMonitor.tsx                       ( 695 lines) → OfflineMonitor.tsx - Connection and Sync Status Monitoring for G-Admin Mini Provides real-time offline status, sync progress, and queue monitoring
│   │   ├─⭐ 📄 OfflineSync.ts                           ( 966 lines) → OfflineSync.ts - Intelligent Data Synchronization for G-Admin Mini Handles conflict resolution, data merging, and optimistic updates
│   │   ├─⭐ 📄 ServiceWorker.ts                         ( 561 lines) → ServiceWorker.ts - PWA Implementation for G-Admin Mini Provides offline-first capabilities with intelligent caching and sync
│   │   └─⭐ 📄 useOfflineStatus.ts                      ( 455 lines) → useOfflineStatus.ts - React Hook for Offline Status Management Provides comprehensive offline status, sync monitoring, and queue management
│   ├─📂 performance
│   │   ├─📂 __tests__
│   │   │   └─  📄 codeSplitting.test.tsx                   ( 142 lines) → codeSplitting.test.tsx - Tests for code splitting functionality
│   │   ├─📂 components
│   │   │   ├─⭐ 📄 CodeSplittingReport.tsx                  ( 327 lines) → CodeSplittingReport.tsx - Performance monitoring for code splitting
│   │   │   ├─⭐ 📄 LazyWrapper.tsx                          ( 558 lines) → LazyWrapper.tsx - Advanced Lazy Loading Components with Suspense Provides intelligent loading states and error boundaries for lazy components
│   │   │   └─⭐ 📄 PerformanceDashboard.tsx                 ( 598 lines) → PerformanceDashboard.tsx - Comprehensive performance monitoring dashboard Provides real-time insights into application performance metrics
│   │   ├─📂 virtualization
│   │   │   └─  📄 VirtualizedList.tsx                      ( 256 lines) → VirtualizedList.tsx - High-performance virtualized list component Handles large datasets with minimal memory footprint
│   │   ├─⭐ 📄 BundleOptimizer.ts                       ( 350 lines) → BundleOptimizer.ts - Advanced bundle optimization and analysis Provides build-time and runtime optimization recommendations
│   │   ├─  📄 codeSplitting.ts                         ( 128 lines) → codeSplitting.ts - Centralized code splitting configuration
│   │   ├─⭐ 📄 index.ts                                 ( 378 lines) → Performance Library Index - Advanced performance optimization suite Centralized exports for all performance-related utilities and components
│   │   ├─  📄 lazyLoading.tsx                          ( 290 lines) → /** Enhanced lazy loading wrapper with error boundaries and retries /
│   │   ├─⭐ 📄 LazyLoadingManager.ts                    ( 532 lines) → LazyLoadingManager.ts - Advanced Performance Management for G-Admin Mini Provides intelligent code splitting, lazy loading, and performance optimization
│   │   ├─⭐ 📄 memoization.ts                           ( 335 lines) → /** Enhanced useCallback with dependency comparison and performance monitoring /
│   │   ├─⭐ 📄 RuntimeOptimizations.tsx                 ( 481 lines) → RuntimeOptimizations.tsx - Advanced runtime performance optimizations Provides memoization, event delegation, and performance monitoring utilities
│   │   └─  📄 types.ts                                 (  79 lines) → Performance optimization types
│   ├─📂 routing
│   │   ├─  📄 createLazyComponents.ts                  ( 123 lines) → /** AUTOMATED LAZY LOADING SYSTEM Crea lazy components automáticamente basado en route mapping /
│   │   ├─  📄 index.ts                                 (  12 lines) → /** ROUTING LIBRARY - G-Admin Mini Automated route mapping and lazy loading system /
│   │   ├─  📄 routeLazyBridge.ts                       ( 109 lines) → /** ROUTE-LAZY BRIDGE Conecta el nuevo sistema de route mapping con el LazyLoadingManager existente /
│   │   └─  📄 validateRouteMapping.ts                  ( 122 lines) → /** ROUTE MAPPING VALIDATION Script para validar que el nuevo sistema de route mapping funcione correctamente /
│   ├─📂 supabase
│   │   └─  📄 client.ts                                (  30 lines) → Get environment variables
│   ├─📂 validation
│   │   ├─📂 __tests__
│   │   │   └─⭐ 📄 validators.test.ts                       ( 307 lines)
│   │   ├─⭐ 📄 businessRules.ts                         ( 396 lines) → /** Inventory business rules /
│   │   ├─  📄 index.ts                                 (  15 lines) → Centralized validation system
│   │   ├─⭐ 📄 permissions.tsx                          ( 314 lines) → Permission constants
│   │   ├─  📄 sanitization.ts                          ( 196 lines) → /** Sanitizes a string by removing/escaping potentially harmful content /
│   │   ├─⭐ 📄 security.ts                              ( 365 lines) → Rate limiting store (in production, use Redis or similar)
│   │   ├─  📄 types.ts                                 (  79 lines) → Validation system types
│   │   └─⭐ 📄 validators.ts                            ( 504 lines) → Email validation regex (RFC 5322 compliant)
│   ├─📂 websocket
│   │   ├─📂 components
│   │   │   └─  📄 RealtimeStatusIndicator.tsx              ( 121 lines) → RealtimeStatusIndicator.tsx - Real-time Connection Status Component Displays WebSocket connection status with visual indicators
│   │   ├─📂 hooks
│   │   │   └─⭐ 📄 useRealtimeUpdates.ts                    ( 421 lines) → useRealtimeUpdates.ts - React Hook for Real-time WebSocket Updates Provides easy integration of real-time updates into React components
│   │   ├─  📄 index.ts                                 (  57 lines) → WebSocket Library Index - Real-time Updates for G-Admin Mini Centralized exports for WebSocket functionality
│   │   ├─⭐ 📄 RealtimeIntegration.ts                   ( 496 lines) → RealtimeIntegration.ts - Real-time Integration Layer for G-Admin Mini Connects WebSocket updates to module-specific functionality
│   │   └─⭐ 📄 WebSocketManager.ts                      ( 790 lines) → WebSocketManager.ts - Real-time WebSocket Management for G-Admin Mini Provides robust WebSocket connections with automatic reconnection and offline graceful degradation
│   └─  📄 notifications.ts                         ( 196 lines) → src/lib/notifications.ts 🎉 Sistema centralizado de notificaciones para Chakra UI v3.23.0 ✅ API CORRECTA: type (NO status), NO isClosable, NO duration personalizado 🚀 RESULTADO: Sistema unificado, sin duplicación, API correcta
├─📂 modules.backup
│   ├─📂 customers
│   │   ├─📂 components
│   │   │   └─📂 RFMAnalyticsDashboard
│   │   │       └─⭐ 📄 RFMAnalyticsDashboard.tsx                ( 532 lines)
│   │   ├─📂 data
│   │   │   ├─  📄 advancedCustomerApi.test.ts              ( 280 lines) → src/features/customers/data/advancedCustomerApi.test.ts
│   │   │   ├─⭐ 📄 advancedCustomerApi.ts                   ( 336 lines) → src/features/customers/data/advancedCustomerApi.ts
│   │   │   └─  📄 customerApi.ts                           ( 138 lines) → src/features/customers/data/customerApi.ts
│   │   ├─📂 logic
│   │   │   ├─  📄 useCustomerNotes.ts                      ( 255 lines) → src/features/customers/logic/useCustomerNotes.ts
│   │   │   ├─  📄 useCustomerRFM.test.ts                   ( 225 lines) → src/features/customers/logic/useCustomerRFM.test.ts
│   │   │   ├─⭐ 📄 useCustomerRFM.ts                        ( 368 lines) → src/features/customers/logic/useCustomerRFM.ts
│   │   │   ├─  📄 useCustomers.ts                          ( 157 lines) → src/features/customers/logic/useCustomers.ts
│   │   │   └─  📄 useCustomerTags.ts                       ( 247 lines) → src/features/customers/logic/useCustomerTags.ts
│   │   ├─📂 ui
│   │   │   ├─  📄 CustomerAnalytics.test.tsx               ( 260 lines) → src/features/customers/ui/CustomerAnalytics.test.tsx
│   │   │   ├─⭐ 📄 CustomerAnalytics.tsx                    ( 467 lines) → src/features/customers/ui/CustomerAnalytics.tsx - Enhanced RFM Analytics Dashboard
│   │   │   ├─  📄 CustomerForm.tsx                         ( 257 lines) → src/features/customers/ui/CustomerForm.tsx - Chakra UI v3.23
│   │   │   ├─⭐ 📄 CustomerList.tsx                         ( 334 lines) → src/features/customers/ui/CustomerList.tsx - Chakra UI v3.23
│   │   │   ├─  📄 CustomerOrdersHistory.tsx                ( 248 lines) → src/features/customers/ui/CustomerOrdersHistory.tsx
│   │   │   └─  📄 CustomerSegments.tsx                     ( 282 lines) → src/features/customers/ui/CustomerSegments.tsx
│   │   ├─  📄 index.tsx                                (  15 lines) → src/features/customers/index.tsx
│   │   ├─  📄 README.md                                ( 202 lines)
│   │   └─⭐ 📄 types.ts                                 ( 405 lines) → ========================================== G-ADMIN CUSTOMER MODULE - COMPREHENSIVE TYPES Following Screaming Architecture Pattern RFM Analytics + Customer Intelligence + Marketing Automation ==========================================
│   ├─📂 dashboard
│   │   ├─📂 alerts
│   │   │   └─⭐ 📄 GlobalAlerts.tsx                         ( 332 lines) → src/components/alerts/GlobalAlerts.tsx 🚨 SISTEMA DE ALERTAS GLOBAL - Consistente en todas las páginas
│   │   ├─📂 common
│   │   │   ├─  📄 LoadingSpinner.tsx                       (  29 lines) → src/components/common/LoadingSpinner.tsx - Chakra UI v3
│   │   │   └─  📄 UnderDevelopment.tsx                     (  63 lines) → src/components/common/UnderDevelopment.tsx - Chakra UI v3
│   │   ├─📂 components
│   │   │   ├─📂 business
│   │   │   │   ├─📂 components
│   │   │   │   │   ├─  📄 BottlenecksView.tsx                      ( 170 lines) → BottlenecksView.tsx - Business bottlenecks analysis component
│   │   │   │   │   ├─  📄 CorrelationsView.tsx                     ( 219 lines) → CorrelationsView.tsx - Focused correlations analysis component
│   │   │   │   │   └─  📄 ExecutiveKPIGrid.tsx                     ( 189 lines) → ExecutiveKPIGrid.tsx - KPI display grid with performance indicators
│   │   │   │   ├─⭐ 📄 CompetitiveIntelligence.tsx              (1252 lines) → Competitive Intelligence - Market Analysis & Strategic Positioning Advanced market intelligence for competitive advantage and strategic positioning
│   │   │   │   ├─⭐ 📄 CrossModuleAnalytics.tsx                 (1409 lines) → Import event system
│   │   │   │   ├─⭐ 📄 CustomReporting.tsx                      (1258 lines) → Import event system
│   │   │   │   ├─⭐ 📄 ExecutiveDashboard.tsx                   (1391 lines) → Import event system
│   │   │   │   ├─  📄 LazyCrossModuleAnalytics.tsx             (  64 lines) → LazyCrossModuleAnalytics.tsx - Lazy-loaded analytics with code splitting
│   │   │   │   ├─  📄 LazyExecutiveDashboard.tsx               (  45 lines) → LazyExecutiveDashboard.tsx - Lazy-loaded executive dashboard with code splitting
│   │   │   │   ├─⭐ 📄 PredictiveAnalytics.tsx                  (1094 lines) → Import event system
│   │   │   │   └─⭐ 📄 PredictiveAnalytics.tsx.backup           (1086 lines) → Import event system
│   │   │   ├─📂 recipes
│   │   │   │   ├─  📄 RecipeIntelligenceDashboard.test.tsx     (  78 lines) → RecipeIntelligenceDashboard Component Tests
│   │   │   │   └─⭐ 📄 RecipeIntelligenceDashboard.tsx          ( 374 lines)
│   │   │   ├─⭐ 📄 CrossModuleSection.tsx                   ( 350 lines) → CrossModuleSection.tsx - Cross-module analytics integration (migrated from tools)
│   │   │   ├─  📄 DashboardAnalytics.tsx                   ( 274 lines) → DashboardAnalytics.tsx - Cross-module analytics and insights (migrated from tools)
│   │   │   ├─⭐ 📄 DashboardExecutive.tsx                   ( 475 lines) → DashboardExecutive.tsx - Executive Dashboard with strategic KPIs (migrated from tools)
│   │   │   ├─⭐ 📄 DashboardForecasting.tsx                 ( 319 lines) → DashboardForecasting.tsx - Predictive Analytics with ML (migrated from tools)
│   │   │   ├─  📄 DashboardOverview.tsx                    ( 260 lines) → DashboardOverview.tsx - Modern dashboard overview inspired by Shopify/Stripe
│   │   │   ├─⭐ 📄 DashboardReports.tsx                     ( 392 lines) → DashboardReports.tsx - Custom Reporting and Advanced Reports (migrated from tools)
│   │   │   └─  📄 index.ts                                 (   9 lines) → Dashboard Components - Business Intelligence exports from organized folders
│   │   ├─📂 hooks
│   │   │   ├─  📄 index.ts                                 (   3 lines)
│   │   │   ├─  📄 useDashboardData.ts                      (  68 lines)
│   │   │   ├─  📄 useDashboardMetrics.ts                   (  67 lines)
│   │   │   └─  📄 useModernDashboard.ts                    ( 170 lines) → Hero Metric (Revenue) - Métrica principal
│   │   ├─📂 types
│   │   │   └─  📄 dashboard.types.ts                       (  83 lines) → Dashboard types and interfaces
│   │   ├─📂 utils
│   │   │   ├─⭐ 📄 mockData.ts                              ( 448 lines) → Financial KPIs
│   │   │   └─  📄 mockData.types.ts                        ( 105 lines) → Executive Dashboard Interfaces
│   │   ├─📂 views
│   │   │   └─  📄 index.ts                                 (   2 lines) → Dashboard Views - Advanced analytics and specialized dashboards
│   │   ├─  📄 index.ts                                 (  16 lines) → Dashboard module exports
│   │   ├─  📄 ModuleCard.tsx                           (  99 lines) → src/components/dashboard/ModuleCard.tsx - Chakra UI v3
│   │   └─  📄 QuickStatsCard.tsx                       (  49 lines) → src/components/dashboard/QuickStatCard.tsx - Chakra UI v3
│   ├─📂 fiscal
│   │   ├─📂 components
│   │   │   ├─📂 sections
│   │   │   │   ├─⭐ 📄 AFIPIntegration.migrated.tsx             ( 529 lines) → AFIPIntegration.tsx - AFIP Integration Management - MIGRATED TO DESIGN SYSTEM Handles AFIP authentication, certificate management, and service integration
│   │   │   │   ├─⭐ 📄 AFIPIntegration.tsx                      ( 539 lines)
│   │   │   │   ├─⭐ 📄 FinancialReporting.tsx                   ( 604 lines)
│   │   │   │   ├─⭐ 📄 InvoiceGeneration.redesign.tsx           ( 463 lines) → InvoiceGeneration.tsx - Migrated to Design System
│   │   │   │   ├─⭐ 📄 InvoiceGeneration.tsx                    ( 463 lines) → InvoiceGeneration.tsx - Migrated to Design System
│   │   │   │   └─⭐ 📄 TaxCompliance.tsx                        ( 540 lines)
│   │   │   ├─⭐ 📄 OfflineFiscalView.backup.tsx             ( 537 lines) → OfflineFiscalView.tsx - Robust Offline Fiscal Operations for G-Admin Mini Handles invoice generation, tax calculations, and AFIP queue management offline
│   │   │   ├─⭐ 📄 OfflineFiscalView.tsx                    ( 535 lines) → OfflineFiscalView.tsx - Robust Offline Fiscal Operations - MIGRATED TO DESIGN SYSTEM Handles invoice generation, tax calculations, and AFIP queue management offline
│   │   │   ├─⭐ 📄 OfflineFiscalView.tsx.v2-backup          ( 535 lines) → OfflineFiscalView.tsx - Robust Offline Fiscal Operations for G-Admin Mini Handles invoice generation, tax calculations, and AFIP queue management offline
│   │   │   └─  📄 TaxSummary.tsx                           ( 289 lines) → TaxSummary Component - Reusable tax breakdown display Shows detailed tax calculations in a consistent format
│   │   ├─📂 data
│   │   │   └─⭐ 📄 fiscalApi.ts                             ( 606 lines) → Fiscal API - AFIP Integration and Tax Management
│   │   ├─📂 hooks
│   │   │   └─  📄 useTaxCalculation.ts                     ( 207 lines) → useTaxCalculation Hook - React hook for tax calculations Provides easy access to the centralized tax calculation service
│   │   ├─📂 logic
│   │   │   └─  📄 useFiscal.ts                             (  45 lines)
│   │   ├─📂 services
│   │   │   └─⭐ 📄 taxCalculationService.ts                 ( 342 lines) → Tax Calculation Service - Centralized Tax Logic for Argentina Extracted from Sales module for better separation of concerns
│   │   ├─📂 ui
│   │   ├─⭐ 📄 FiscalPage.redesign.tsx                  ( 370 lines) → FiscalPage.tsx - Migrated to Design System
│   │   ├─  📄 index.ts                                 (  58 lines) → Fiscal Module - Centralized Tax and Compliance Management Entry point for all fiscal-related functionality
│   │   ├─  📄 index.tsx                                (   4 lines)
│   │   └─  📄 types.ts                                 ( 250 lines) → Fiscal Module Types - Argentine Tax Compliance & AFIP Integration Based on architecture-plan.md requirements
│   ├─📂 lazy
│   ├─📂 materials
│   │   ├─📂 __tests__
│   │   │   └─  📄 MaterialsPage.test.tsx                   ( 168 lines) → Mock data for tests
│   │   ├─📂 components
│   │   │   ├─📂 __tests__
│   │   │   │   └─  📄 MaterialsGrid.test.tsx                   ( 235 lines) → 🎯 Mock data que simula materials reales
│   │   │   ├─📂 analytics
│   │   │   │   └─⭐ 📄 ABCAnalysisSection.tsx                   ( 312 lines) → ABCAnalysisSection.tsx - Advanced ABC Analysis for Materials Inventory Management
│   │   │   ├─📂 MaterialFormModalComplete
│   │   │   │   ├─📂 components
│   │   │   │   │   ├─📂 CountableFields
│   │   │   │   │   │   ├─  📄 CountableFields.tsx                      ( 207 lines)
│   │   │   │   │   │   ├─⭐ 📄 CountableStockFields.tsx                 ( 550 lines)
│   │   │   │   │   │   └─  📄 index.tsx                                (   1 lines)
│   │   │   │   │   ├─📂 ElaboratedFields
│   │   │   │   │   │   └─  📄 ElaboratedFields.tsx                     (  72 lines)
│   │   │   │   │   ├─📂 FormSections
│   │   │   │   │   │   ├─  📄 CommonFields.tsx                         (  52 lines)
│   │   │   │   │   │   └─  📄 ValidatedField.tsx                       ( 131 lines)
│   │   │   │   │   ├─📂 MeasurableFields
│   │   │   │   │   │   ├─  📄 index.tsx                                (   1 lines)
│   │   │   │   │   │   ├─  📄 MeasurableFields.tsx                     (  75 lines)
│   │   │   │   │   │   └─⭐ 📄 MeasurableStockFields.tsx                ( 487 lines) → Estado local para el precio total (independiente de unit_cost)
│   │   │   │   │   ├─📂 SupplierFields
│   │   │   │   │   │   ├─  📄 index.ts                                 (   1 lines)
│   │   │   │   │   │   └─⭐ 📄 SupplierFields.tsx                       ( 396 lines) → Para crear nuevo supplier
│   │   │   │   │   ├─  📄 CountableFields.tsx                      ( 293 lines) → Tipos de configuración de stock
│   │   │   │   │   ├─  📄 ElaboratedFields.tsx                     (  72 lines)
│   │   │   │   │   ├─  📄 index.ts                                 (   6 lines)
│   │   │   │   │   ├─  📄 MeasurableFields.tsx                     (  78 lines)
│   │   │   │   │   └─  📄 TypeSelector.tsx                         (  41 lines)
│   │   │   │   ├─  📄 constants.ts                             (  69 lines) → Common type for all select options with labels
│   │   │   │   ├─  📄 index.tsx                                (   8 lines)
│   │   │   │   ├─⭐ 📄 MaterialFormDialog.tsx                   ( 597 lines) → Components
│   │   │   │   └─  📄 types.ts                                 (  12 lines)
│   │   │   ├─  📄 AlertsTab.tsx                            ( 204 lines) → src/features/inventory/components/AlertsTab.tsx Tab de alertas de stock - CORREGIDO
│   │   │   ├─  📄 index.ts                                 (   7 lines) → Export all refactored components
│   │   │   ├─⭐ 📄 ItemForm.tsx                             ( 400 lines) → ✅ FIX: Definir colecciones fuera del componente para performance
│   │   │   ├─  📄 LazyAnalytics.tsx                        (  46 lines) → Lazy load analytics components
│   │   │   ├─  📄 LazyMaterialFormModal.tsx                (  47 lines) → Lazy load the heavy modal component
│   │   │   ├─  📄 LazyOfflineMaterialsPage.tsx             (  55 lines) → LazyOfflineMaterialsPage.tsx - Lazy-loaded materials page with code splitting
│   │   │   ├─  📄 MaterialFormModalComplete.tsx            (   2 lines) → Re-export the refactored MaterialFormDialog component
│   │   │   ├─  📄 MaterialsFilters.tsx                     ( 137 lines)
│   │   │   ├─  📄 MaterialsGrid.tsx                        ( 156 lines) → 🎯 Using centralized utilities for all calculations
│   │   │   ├─  📄 MaterialsHeader.tsx                      (  93 lines)
│   │   │   ├─⭐ 📄 MaterialsInventoryGrid.tsx               ( 384 lines) → MaterialsInventoryGrid.tsx - Virtualized inventory grid with smart filtering
│   │   │   ├─  📄 MaterialsView.tsx                        ( 155 lines) → UnifiedMaterialsView.tsx - Smart Materials View with Automatic Online/Offline Detection Intelligently switches between MaterialsPage and OfflineMaterialsPage based on connection
│   │   │   ├─  📄 OfflineMaterialsPage.tsx                 (  17 lines)
│   │   │   ├─  📄 OfflineMaterialsPageHeader.tsx           ( 165 lines) → OfflineMaterialsPageHeader.tsx - Focused header component with connection status
│   │   │   ├─  📄 OfflineMaterialsStats.tsx                (  98 lines) → OfflineMaterialsStats.tsx - Statistics grid component
│   │   │   ├─  📄 StockLabHeader.tsx                       (  98 lines)
│   │   │   └─⭐ 📄 UniversalItemForm.tsx                    ( 981 lines) → ✅ IMPORTS REALES
│   │   ├─📂 data
│   │   │   ├─  📄 inventoryApi.ts                          ( 125 lines) → src/features/inventory/data/inventoryApi.ts API functions para el módulo inventory
│   │   │   └─  📄 suppliersApi.ts                          (  98 lines) → API functions para el módulo suppliers
│   │   ├─📂 intelligence
│   │   │   ├─⭐ 📄 ABCAnalysisEngine.tsx                    ( 937 lines) → ABC Analysis Engine - Supply Chain Intelligence Advanced inventory classification and optimization system
│   │   │   ├─⭐ 📄 AlertingSystem.tsx                       (1334 lines) → Alerting System - Smart Notifications and Supply Chain Alerts Real-time monitoring with intelligent alerting capabilities
│   │   │   ├─⭐ 📄 AlertingSystemReal.tsx                   ( 410 lines) → /** Alerting System - Real Data Version Connected to actual stock alerts and materials data /
│   │   │   ├─⭐ 📄 InventoryOptimization.tsx                (1260 lines) → Inventory Optimization - Demand Forecasting Engine AI-powered inventory planning with predictive analytics
│   │   │   ├─⭐ 📄 ProcurementIntelligence.tsx              (1017 lines) → Procurement Intelligence - Smart Reordering & Supplier Management Advanced purchasing optimization and automated procurement system
│   │   │   ├─⭐ 📄 SupplierScoring.tsx                      (1152 lines) → Supplier Scoring System - Advanced Supplier Performance Analytics Automated scoring, risk assessment, and supplier optimization
│   │   │   ├─⭐ 📄 SupplyChainReporting.tsx                 (1347 lines) → Supply Chain Reporting - Comprehensive Business Intelligence Dashboard Advanced analytics and reporting for supply chain operations
│   │   │   └─⭐ 📄 SupplyChainReportingReal.tsx             ( 432 lines) → /** Supply Chain Reporting - Real Data Version Connected to actual Supabase functions instead of mock data /
│   │   ├─📂 logic
│   │   │   └─⭐ 📄 useMaterials.tsx                         ( 354 lines) → src/features/materials/logic/useMaterials.tsx Materials management hook with Supabase realtime integration
│   │   ├─📂 services
│   │   │   ├─📂 __tests__
│   │   │   │   └─  📄 materialsNormalizer.test.ts              ( 288 lines)
│   │   │   ├─  📄 index.ts                                 (   1 lines)
│   │   │   ├─  📄 materialsNormalizer.ts                   ( 274 lines) → /** Service responsible for normalizing API data into consistent MaterialItem objects. Handles type-specific transformations and provides default values for missing properties. /
│   │   │   └─⭐ 📄 supplyChainDataService.ts                ( 310 lines) → /** Supply Chain Data Service Replaces mock data with real Supabase functions for Supply Chain Intelligence /
│   │   ├─📂 types
│   │   │   └─  📄 abc-analysis.ts                          (  33 lines) → ABC Analysis Types for Materials Module
│   │   ├─📂 utils
│   │   │   ├─📂 __tests__
│   │   │   │   └─  📄 stockCalculations.test.ts                ( 259 lines)
│   │   │   ├─  📄 conversions.ts                           ( 284 lines) → src/features/inventory/utils/conversions.ts 🧮 SISTEMA DE CONVERSIONES PRECISAS - Sin decimales, máxima precisión
│   │   │   ├─  📄 formCalculations.ts                      ( 255 lines) → /** Utility functions for material form calculations Handles cost calculations, conversions, and formatting for the form UI /
│   │   │   ├─  📄 index.ts                                 (   4 lines)
│   │   │   ├─  📄 measurementTypes.ts                      ( 196 lines) → /** Measurement type detection utilities Separates measurement logic from business categorization /
│   │   │   └─  📄 stockCalculations.ts                     ( 239 lines) → /** Stock status levels /
│   │   ├─📂 views
│   │   │   └─  📄 index.ts                                 (   2 lines) → Materials Views - Advanced analytics and specialized views
│   │   ├─  📄 index.tsx                                (  11 lines) → Main Page Component
│   │   ├─  📄 MaterialsPageNew.tsx                     (   0 lines)
│   │   ├─  📄 README.md                                (  96 lines)
│   │   ├─  📄 StockLab.tsx                             (   0 lines)
│   │   └─  📄 types.ts                                 ( 278 lines) → Materials module types - Simplified and focused Clean, maintainable type system for inventory management
│   ├─📂 operations
│   │   ├─📂 components
│   │   │   ├─📂 kitchen
│   │   │   ├─📂 sections
│   │   │   │   ├─  📄 KitchenSection.tsx                       ( 283 lines) → KitchenSection.tsx - Migrated to Design System Fixed: Element type is invalid error
│   │   │   │   ├─  📄 MonitoringSection.tsx                    ( 167 lines) → Monitoring Section for real-time metrics and alerts
│   │   │   │   ├─  📄 PlanningSection.tsx                      ( 135 lines) → Planning Section for production calendar and planning
│   │   │   │   └─  📄 TablesSection.tsx                        (   7 lines) → Tables Section - Integrated Table Management Page
│   │   │   └─  📄 OperationsHeader.tsx                     (  97 lines) → OperationsHeader with KPIs and quick actions
│   │   ├─📂 views
│   │   │   └─  📄 index.ts                                 (   2 lines) → Operations Views - Specialized operation views
│   │   ├─  📄 index.ts                                 (  12 lines) → Operations module exports
│   │   └─  📄 OperationsPage.backup.tsx                ( 141 lines) → Operations Page - Unified dashboard without nested tabs
│   ├─📂 products
│   │   ├─📂 analytics
│   │   │   ├─⭐ 📄 MenuEngineeringMatrix.tsx                ( 519 lines)
│   │   │   └─⭐ 📄 StrategyRecommendations.tsx              ( 382 lines)
│   │   ├─📂 components
│   │   ├─📂 data
│   │   │   └─  📄 productApi.ts                            ( 243 lines) → src/features/products/data/productApi.ts G-Admin Products API - Leveraging Database Functions for Intelligence
│   │   ├─📂 hooks
│   │   │   ├─  📄 useCostCalculations.ts                   ( 194 lines) → /** Centralized hook for all cost calculation logic Eliminates duplication across CostAnalysisTab, CostCalculator, PricingScenarios, etc. /
│   │   │   ├─  📄 useProducts.ts                           ( 121 lines) → Get products with their recipes if they exist - CONNECTED TO REAL RECIPE SYSTEM
│   │   │   └─  📄 useRealCostAnalysis.ts                   ( 225 lines) → /** Hook that connects CostAnalysisTab with REAL data from MaterialsStore and ProductsStore Eliminates hardcoded mock data - uses actual recipe costs and materials inventory /
│   │   ├─📂 logic
│   │   │   ├─⭐ 📄 menuEngineeringCalculations.ts           ( 459 lines) → Menu Engineering Matrix Calculations Strategic Business Intelligence Engine for G-Admin Mini
│   │   │   ├─⭐ 📄 useMenuEngineering.ts                    ( 353 lines) → Data
│   │   │   ├─  📄 useProductComponents.ts                  (  69 lines) → src/features/products/logic/useProductComponents.ts Hook for managing product components
│   │   │   └─  📄 useProducts.ts                           (  92 lines) → src/features/products/logic/useProducts.ts Business Logic Layer - Products Intelligence
│   │   ├─📂 services
│   │   │   └─  📄 ProductCostAnalysisService.ts            ( 202 lines) → /** Service for connecting Products cost analysis with real Materials data Eliminates hardcoded mock data in CostAnalysisTab /
│   │   ├─📂 types
│   │   │   └─  📄 menuEngineering.ts                       ( 267 lines) → Menu Engineering Matrix Types - Strategic Business Intelligence Based on G-Admin Mini Architecture Plan v3.0
│   │   ├─📂 ui
│   │   │   ├─📂 costs
│   │   │   │   ├─  📄 CostAnalysisReports.tsx                  (  94 lines) → src/features/products/ui/costs/CostAnalysisReports.tsx Reportes y análisis de costos como componente independiente
│   │   │   │   ├─⭐ 📄 CostCalculator.tsx                       ( 324 lines) → src/features/products/ui/costs/CostCalculator.tsx Calculadora de costos como componente independiente
│   │   │   │   └─  📄 PricingScenarios.tsx                     ( 134 lines) → src/features/products/ui/costs/PricingScenarios.tsx Escenarios de precios como componente independiente
│   │   │   ├─⭐ 📄 ComponentManager.tsx                     ( 307 lines) → src/features/products/ui/ComponentManager.tsx Component Management for Products with Inventory Integration
│   │   │   ├─  📄 CostAnalysisModule.tsx                   (  18 lines) → src/features/products/ui/CostAnalysisModule.tsx Módulo de Análisis de Costos - USANDO NUEVO DESIGN SYSTEM COMPONENT
│   │   │   ├─⭐ 📄 CostAnalysisTab.tsx                      ( 479 lines) → src/features/products/ui/CostAnalysisTab.tsx Advanced Cost Analysis Calculator - DESIGN SYSTEM VERSION
│   │   │   ├─  📄 DemandForecastOnly.tsx                   ( 184 lines) → src/features/products/ui/DemandForecastOnly.tsx Demand Forecast como sección independiente
│   │   │   ├─⭐ 📄 MenuEngineeringOnly.redesign.tsx         ( 391 lines) → MenuEngineeringOnly.tsx - Redesigned with Design System Patterns Following same conventions as CostAnalysisTab.tsx
│   │   │   ├─⭐ 📄 MenuEngineeringOnly.tsx                  ( 391 lines) → MenuEngineeringOnly.tsx - Redesigned with Design System Patterns Following same conventions as CostAnalysisTab.tsx
│   │   │   ├─  📄 ProductForm.tsx                          ( 233 lines) → src/features/products/ui/ProductForm.tsx Product Creation and Editing Form with ChakraUI v3
│   │   │   ├─  📄 ProductFormModal.tsx                     ( 142 lines) → Update existing product
│   │   │   ├─⭐ 📄 ProductionActiveTab.tsx                  ( 512 lines) → src/features/products/ui/ProductionActiveTab.tsx Control de Producciones Activas - Real-time Production Management
│   │   │   ├─⭐ 📄 ProductionPlanningOnly.tsx               ( 431 lines) → src/features/products/ui/ProductionPlanningOnly.tsx Production Planning como sección independiente
│   │   │   ├─⭐ 📄 ProductionPlanningTab.tsx                ( 917 lines) → src/features/products/ui/ProductionPlanningTab.tsx Production Planning & Demand Forecasting System
│   │   │   ├─⭐ 📄 ProductionScheduleOnly.tsx               ( 332 lines) → src/features/products/ui/ProductionScheduleOnly.tsx Production Schedule como sección independiente
│   │   │   ├─⭐ 📄 ProductList.tsx                          ( 349 lines) → src/features/products/ui/ProductList.tsx Product List with Intelligence Display
│   │   │   └─  📄 ProductListOnly.tsx                      ( 129 lines) → src/features/products/ui/ProductListOnly.tsx Gestión de productos sin sub-pestañas
│   │   ├─  📄 index.tsx                                (   2 lines)
│   │   └─  📄 types.ts                                 ( 109 lines) → ========================================== G-ADMIN PRODUCTS MODULE - PRODUCT INTELLIGENCE SYSTEM v1.0 Following Screaming Architecture Pattern Product Assembly Engine + Component Tracking + Cost Intelligence ==========================================
│   ├─📂 sales
│   │   ├─📂 __tests__
│   │   │   └─  📄 saleApi.test.ts                          ( 252 lines) → Mock supabase
│   │   ├─📂 components
│   │   │   ├─📂 Analytics
│   │   │   │   ├─⭐ 📄 AdvancedSalesAnalyticsDashboard.tsx      ( 743 lines)
│   │   │   │   ├─⭐ 📄 PredictiveAnalyticsEngine.tsx            ( 598 lines)
│   │   │   │   ├─⭐ 📄 SalesIntelligenceDashboard.tsx           ( 557 lines) → src/features/sales/components/Analytics/SalesIntelligenceDashboard.tsx 🚀 SALES INTELLIGENCE - Advanced Analytics Dashboard
│   │   │   │   └─⭐ 📄 SalesPerformanceInsights.tsx             ( 650 lines)
│   │   │   ├─📂 OrderManagement
│   │   │   │   └─⭐ 📄 KitchenDisplaySystem.tsx                 ( 526 lines) → src/features/sales/components/OrderManagement/KitchenDisplaySystem.tsx 🚀 KITCHEN DISPLAY SYSTEM - Real-time Order Management for Kitchen Staff
│   │   │   ├─📂 Payment
│   │   │   │   └─⭐ 📄 ModernPaymentProcessor.tsx               ( 575 lines) → src/features/sales/components/Payment/ModernPaymentProcessor.tsx 🚀 PAYMENT REVOLUTION - Modern Payment Processing System
│   │   │   ├─📂 QROrdering
│   │   │   │   ├─⭐ 📄 QRCodeGenerator.tsx                      ( 500 lines) → src/features/sales/components/QROrdering/QRCodeGenerator.tsx 🚀 QR CODE ORDERING - Tableside Digital Menu System
│   │   │   │   └─⭐ 📄 QROrderPage.tsx                          ( 659 lines)
│   │   │   ├─📂 TableManagement
│   │   │   │   └─⭐ 📄 TableFloorPlan.tsx                       ( 505 lines) → src/features/sales/components/TableManagement/TableFloorPlan.tsx 🚀 MODERN TABLE MANAGEMENT - Visual Floor Plan Component
│   │   │   ├─⭐ 📄 CartValidationSummary.tsx                ( 328 lines) → src/features/sales/components/CartValidationSummary.tsx
│   │   │   ├─⭐ 📄 OfflineSalesView.tsx                     (1030 lines) → OfflineSalesView.tsx - Offline-First POS System for G-Admin Mini Provides seamless offline sales processing with intelligent sync
│   │   │   ├─⭐ 📄 ProductWithStock.tsx                     ( 412 lines) → src/features/sales/components/ProductWithStock.tsx
│   │   │   ├─  📄 SalesView.tsx                            ( 101 lines) → UnifiedSalesView.tsx - Smart Sales View with Automatic Online/Offline Detection Eliminates duplicate POS tabs by intelligently switching between implementations
│   │   │   ├─⭐ 📄 SaleWithStockView.tsx                    ( 488 lines) → src/features/sales/components/SalesWithStockView.tsx (Enhanced Version)
│   │   │   ├─  📄 StockSummaryWidget.tsx                   ( 283 lines) → src/features/sales/components/StockSummaryWidget.tsx
│   │   │   └─  📄 StockValidationAlert.tsx                 (  87 lines) → components/StockValidationAlert.tsx
│   │   ├─📂 data
│   │   │   ├─  📄 saleApi.ts                               ( 241 lines) → src/features/sales/data/saleApi.ts - ESQUEMA NORMALIZADO
│   │   │   └─⭐ 📄 tableApi.ts                              ( 485 lines) → src/features/sales/data/tableApi.ts 🚀 TABLE MANAGEMENT API - Modern Restaurant Operations
│   │   ├─📂 logic
│   │   │   ├─  📄 useSales.ts                              ( 221 lines) → src/features/sales/logic/useSales.ts - ESQUEMA NORMALIZADO
│   │   │   └─⭐ 📄 useSalesCart.ts                          ( 378 lines) → src/features/sales/logic/useSalesCart.ts (Enhanced Version)
│   │   ├─📂 ui
│   │   │   ├─⭐ 📄 SaleForm.tsx                             ( 440 lines) → features/sales/ui/SaleForm.tsx ✅ CORREGIDO: Heroicons + Chakra v3.23 + Select collections
│   │   │   └─⭐ 📄 SaleList.tsx                             ( 494 lines) → src/features/sales/ui/SaleList.tsx - Chakra UI v3
│   │   ├─  📄 index.tsx                                ( 218 lines) → src/features/sales/index.tsx - MODERN POS SYSTEM v3.0
│   │   ├─  📄 SalesPage.tsx.v2-backup                  ( 169 lines) → Refactored Sales Page with UNIFIED navigation pattern
│   │   └─⭐ 📄 types.ts                                 ( 817 lines) → src/features/sales/types.ts - MODERN POS ARCHITECTURE v3.0 ======================================================== CORE SALES & ORDER MANAGEMENT ========================================================
│   ├─📂 scheduling
│   │   ├─📂 components
│   │   │   └─📂 sections
│   │   │       ├─⭐ 📄 CoveragePlanner.tsx                      ( 565 lines) → r - Analyze and manage shift coverage gaps and staffing needs
│   │   │       ├─⭐ 📄 LaborCostTracker.tsx                     ( 547 lines) → LaborCostTracker - Track and analyze labor costs, overtime, and budget performance
│   │   │       ├─⭐ 📄 TimeOffManager.tsx                       ( 483 lines) → TimeOffManager - Manage time-off requests, approvals, and PTO tracking
│   │   │       └─⭐ 📄 WeeklyScheduleView.tsx                   ( 372 lines) → WeeklyScheduleView - Main calendar interface with drag & drop scheduling
│   │   ├─📂 data
│   │   │   └─⭐ 📄 schedulingApi.ts                         ( 652 lines) → schedulingApi - Supabase API integration for scheduling module
│   │   ├─📂 logic
│   │   │   └─⭐ 📄 useScheduling.ts                         ( 382 lines) → useScheduling - Main hook for scheduling module business logic
│   │   ├─📂 ui
│   │   ├─  📄 index.tsx                                (   1 lines)
│   │   └─  📄 types.ts                                 (  68 lines) → src/features/scheduling/types.ts Tipos para gestión de turnos y horarios
│   ├─📂 settings
│   │   ├─📂 components
│   │   │   ├─📂 sections
│   │   │   │   ├─  📄 BusinessProfileSection.tsx               ( 127 lines) → Business Profile Section - Company info, location, hours
│   │   │   │   ├─⭐ 📄 EnterpriseSection.tsx                    ( 314 lines) → EnterpriseSection.tsx - Enterprise Management Tools (migrated from tools)
│   │   │   │   ├─  📄 IntegrationsSection.tsx                  ( 225 lines) → Integrations Section - APIs, webhooks, external services
│   │   │   │   ├─  📄 SystemSection.tsx                        ( 142 lines) → SystemSection.tsx - System Settings with Theme Configuration
│   │   │   │   ├─  📄 TaxConfigurationSection.tsx              ( 168 lines) → Tax Configuration Section - Tax settings and fiscal configuration
│   │   │   │   └─  📄 UserPermissionsSection.tsx               ( 208 lines) → User Permissions Section - Roles and access management
│   │   │   ├─  📄 index.ts                                 (   2 lines) → Settings UI components (not pages)
│   │   │   └─  📄 SettingsHeader.tsx                       (  97 lines) → SettingsHeader with configuration status and quick actions
│   │   ├─📂 data
│   │   │   └─⭐ 📄 settingsApi.ts                           ( 553 lines) → Settings API - Business configuration database functions
│   │   ├─📂 logic
│   │   ├─📂 ui
│   │   ├─📂 views
│   │   │   └─  📄 index.ts                                 (   5 lines) → Settings Views - Former Pages moved to proper views structure
│   │   ├─  📄 index.tsx                                (  24 lines) → src/modules/settings/index.tsx Exportaciones del módulo de configuraciones del negocio
│   │   └─  📄 types.ts                                 (  82 lines) → src/features/settings/types.ts Tipos para configuraciones del negocio
│   └─📂 staff
│       ├─📂 __tests__
│       │   ├─⭐ 📄 DirectorySection.test.tsx                ( 363 lines) → Directory Section Component Tests
│       │   └─⭐ 📄 staffApi.test.ts                         ( 307 lines) → Staff Management API Tests
│       ├─📂 components
│       │   └─📂 sections
│       │       ├─⭐ 📄 DirectorySection.tsx                     ( 602 lines) → Staff Directory Section - Employee list and profiles
│       │       ├─⭐ 📄 DirectorySection.tsx.backup              ( 590 lines) → Staff Directory Section - Employee list and profiles
│       │       ├─⭐ 📄 ManagementSection.tsx                    ( 830 lines) → Staff Management Section - HR functions and permissions with security compliance
│       │       ├─⭐ 📄 PerformanceSection.tsx                   ( 527 lines) → Staff Performance Section - Metrics and scoring system
│       │       ├─⭐ 📄 TimeTrackingSection.tsx                  (1080 lines) → OfflineTimeTrackingSection.tsx - Offline-First Time Tracking for G-Admin Mini Provides seamless offline time tracking with intelligent sync
│       │       └─⭐ 📄 TrainingSection.tsx                      ( 613 lines) → Staff Training Section - Records and certifications management
│       ├─📂 data
│       │   └─⭐ 📄 staffApi.ts                              ( 503 lines) → Staff Management API - Database functions with security compliance
│       ├─📂 logic
│       ├─📂 ui
│       ├─  📄 index.tsx                                (   1 lines)
│       ├─⭐ 📄 StaffPage.tsx.v2-backup                  ( 319 lines) → Staff Management Module - Main Page with UNIFIED navigation pattern
│       └─  📄 types.ts                                 ( 243 lines) → Staff Management Module - Types Definition Security compliant types for employee data management
├─📂 pages
│   ├─📂 admin
│   │   ├─📂 customers
│   │   │   ├─📂 components
│   │   │   │   ├─  📄 CustomerAnalytics.test.tsx               ( 260 lines) → src/features/customers/ui/CustomerAnalytics.test.tsx
│   │   │   │   ├─⭐ 📄 CustomerAnalytics.tsx                    ( 467 lines) → src/features/customers/ui/CustomerAnalytics.tsx - Enhanced RFM Analytics Dashboard
│   │   │   │   ├─  📄 CustomerForm.tsx                         ( 257 lines) → src/features/customers/ui/CustomerForm.tsx - Chakra UI v3.23
│   │   │   │   ├─⭐ 📄 CustomerList.tsx                         ( 334 lines) → src/features/customers/ui/CustomerList.tsx - Chakra UI v3.23
│   │   │   │   ├─  📄 CustomerOrdersHistory.tsx                ( 248 lines) → src/features/customers/ui/CustomerOrdersHistory.tsx
│   │   │   │   └─  📄 CustomerSegments.tsx                     ( 282 lines) → src/features/customers/ui/CustomerSegments.tsx
│   │   │   ├─📂 hooks
│   │   │   │   ├─  📄 useCustomerNotes.ts                      ( 253 lines) → src/features/customers/logic/useCustomerNotes.ts
│   │   │   │   ├─  📄 useCustomerRFM.test.ts                   ( 225 lines) → src/features/customers/logic/useCustomerRFM.test.ts
│   │   │   │   ├─⭐ 📄 useCustomerRFM.ts                        ( 366 lines) → src/features/customers/logic/useCustomerRFM.ts
│   │   │   │   ├─  📄 useCustomers.ts                          ( 157 lines) → src/features/customers/logic/useCustomers.ts
│   │   │   │   └─  📄 useCustomerTags.ts                       ( 245 lines) → src/features/customers/logic/useCustomerTags.ts
│   │   │   ├─📂 services
│   │   │   │   ├─  📄 advancedCustomerApi.test.ts              ( 280 lines) → src/features/customers/data/advancedCustomerApi.test.ts
│   │   │   │   ├─⭐ 📄 advancedCustomerApi.ts                   ( 336 lines) → src/features/customers/data/advancedCustomerApi.ts
│   │   │   │   └─  📄 customerApi.ts                           ( 138 lines) → src/features/customers/data/customerApi.ts
│   │   │   ├─  📄 page.tsx                                 ( 143 lines) → Refactored Customers Page with UNIFIED navigation pattern
│   │   │   └─⭐ 📄 types.ts                                 ( 405 lines) → ========================================== G-ADMIN CUSTOMER MODULE - COMPREHENSIVE TYPES Following Screaming Architecture Pattern RFM Analytics + Customer Intelligence + Marketing Automation ==========================================
│   │   ├─📂 dashboard
│   │   │   ├─📂 components
│   │   │   │   ├─📂 business
│   │   │   │   │   ├─📂 components
│   │   │   │   │   │   ├─  📄 BottlenecksView.tsx                      ( 170 lines) → BottlenecksView.tsx - Business bottlenecks analysis component
│   │   │   │   │   │   ├─  📄 CorrelationsView.tsx                     ( 219 lines) → CorrelationsView.tsx - Focused correlations analysis component
│   │   │   │   │   │   └─  📄 ExecutiveKPIGrid.tsx                     ( 189 lines) → ExecutiveKPIGrid.tsx - KPI display grid with performance indicators
│   │   │   │   │   ├─⭐ 📄 CompetitiveIntelligence.tsx              (1252 lines) → Competitive Intelligence - Market Analysis & Strategic Positioning Advanced market intelligence for competitive advantage and strategic positioning
│   │   │   │   │   ├─⭐ 📄 CrossModuleAnalytics.tsx                 (1409 lines) → Import event system
│   │   │   │   │   ├─⭐ 📄 CustomReporting.tsx                      (1258 lines) → Import event system
│   │   │   │   │   ├─⭐ 📄 ExecutiveDashboard.tsx                   (1391 lines) → Import event system
│   │   │   │   │   ├─  📄 LazyCrossModuleAnalytics.tsx             (  64 lines) → LazyCrossModuleAnalytics.tsx - Lazy-loaded analytics with code splitting
│   │   │   │   │   ├─  📄 LazyExecutiveDashboard.tsx               (  45 lines) → LazyExecutiveDashboard.tsx - Lazy-loaded executive dashboard with code splitting
│   │   │   │   │   ├─⭐ 📄 PredictiveAnalytics.tsx                  (1094 lines) → Import event system
│   │   │   │   │   └─⭐ 📄 PredictiveAnalytics.tsx.backup           (1086 lines) → Import event system
│   │   │   │   ├─📂 recipes
│   │   │   │   │   ├─  📄 RecipeIntelligenceDashboard.test.tsx     (  78 lines) → RecipeIntelligenceDashboard Component Tests
│   │   │   │   │   └─⭐ 📄 RecipeIntelligenceDashboard.tsx          ( 374 lines)
│   │   │   │   ├─⭐ 📄 CrossModuleSection.tsx                   ( 350 lines) → CrossModuleSection.tsx - Cross-module analytics integration (migrated from tools)
│   │   │   │   ├─  📄 DashboardAnalytics.tsx                   ( 274 lines) → DashboardAnalytics.tsx - Cross-module analytics and insights (migrated from tools)
│   │   │   │   ├─⭐ 📄 DashboardExecutive.tsx                   ( 475 lines) → DashboardExecutive.tsx - Executive Dashboard with strategic KPIs (migrated from tools)
│   │   │   │   ├─⭐ 📄 DashboardForecasting.tsx                 ( 319 lines) → DashboardForecasting.tsx - Predictive Analytics with ML (migrated from tools)
│   │   │   │   ├─  📄 DashboardOverview.tsx                    ( 260 lines) → DashboardOverview.tsx - Modern dashboard overview inspired by Shopify/Stripe
│   │   │   │   ├─⭐ 📄 DashboardReports.tsx                     ( 392 lines) → DashboardReports.tsx - Custom Reporting and Advanced Reports (migrated from tools)
│   │   │   │   └─  📄 index.ts                                 (   9 lines) → Dashboard Components - Business Intelligence exports from organized folders
│   │   │   ├─📂 hooks
│   │   │   │   ├─  📄 index.ts                                 (   3 lines)
│   │   │   │   ├─  📄 useDashboardData.ts                      (  71 lines)
│   │   │   │   ├─  📄 useDashboardMetrics.ts                   (  67 lines)
│   │   │   │   └─  📄 useModernDashboard.ts                    ( 170 lines) → Hero Metric (Revenue) - Métrica principal
│   │   │   ├─📂 services
│   │   │   │   ├─⭐ 📄 mockData.ts                              ( 448 lines) → Financial KPIs
│   │   │   │   └─  📄 mockData.types.ts                        ( 105 lines) → Executive Dashboard Interfaces
│   │   │   ├─📂 types
│   │   │   │   └─  📄 index.ts                                 (  31 lines) → Dashboard Types - Route-based Architecture v4.0
│   │   │   ├─  📄 page.tsx                                 ( 185 lines) → Dashboard Moderno 2025 - Diseño basado en mejores prácticas ✅ Jerarquía visual + Sin duplicación + Responsive + Operacional
│   │   │   └─⭐ 📄 predictive.tsx                           ( 328 lines) → PredictiveAnalyticsPage.tsx - ML-powered forecasting and predictions
│   │   ├─📂 fiscal
│   │   │   ├─📂 components
│   │   │   │   ├─📂 sections
│   │   │   │   │   ├─⭐ 📄 AFIPIntegration.migrated.tsx             ( 529 lines) → AFIPIntegration.tsx - AFIP Integration Management - MIGRATED TO DESIGN SYSTEM Handles AFIP authentication, certificate management, and service integration
│   │   │   │   │   ├─⭐ 📄 AFIPIntegration.tsx                      ( 539 lines)
│   │   │   │   │   ├─⭐ 📄 FinancialReporting.tsx                   ( 604 lines)
│   │   │   │   │   ├─⭐ 📄 InvoiceGeneration.redesign.tsx           ( 463 lines) → InvoiceGeneration.tsx - Migrated to Design System
│   │   │   │   │   ├─⭐ 📄 InvoiceGeneration.tsx                    ( 463 lines) → InvoiceGeneration.tsx - Migrated to Design System
│   │   │   │   │   └─⭐ 📄 TaxCompliance.tsx                        ( 540 lines)
│   │   │   │   ├─⭐ 📄 OfflineFiscalView.backup.tsx             ( 537 lines) → OfflineFiscalView.tsx - Robust Offline Fiscal Operations for G-Admin Mini Handles invoice generation, tax calculations, and AFIP queue management offline
│   │   │   │   ├─⭐ 📄 OfflineFiscalView.tsx                    ( 535 lines) → OfflineFiscalView.tsx - Robust Offline Fiscal Operations - MIGRATED TO DESIGN SYSTEM Handles invoice generation, tax calculations, and AFIP queue management offline
│   │   │   │   ├─⭐ 📄 OfflineFiscalView.tsx.v2-backup          ( 535 lines) → OfflineFiscalView.tsx - Robust Offline Fiscal Operations for G-Admin Mini Handles invoice generation, tax calculations, and AFIP queue management offline
│   │   │   │   └─  📄 TaxSummary.tsx                           ( 289 lines) → TaxSummary Component - Reusable tax breakdown display Shows detailed tax calculations in a consistent format
│   │   │   ├─📂 hooks
│   │   │   │   ├─  📄 useFiscal.ts                             (  45 lines)
│   │   │   │   └─  📄 useTaxCalculation.ts                     ( 207 lines) → useTaxCalculation Hook - React hook for tax calculations Provides easy access to the centralized tax calculation service
│   │   │   ├─📂 services
│   │   │   │   ├─⭐ 📄 fiscalApi.ts                             ( 606 lines) → Fiscal API - AFIP Integration and Tax Management
│   │   │   │   └─⭐ 📄 taxCalculationService.ts                 ( 342 lines) → Tax Calculation Service - Centralized Tax Logic for Argentina Extracted from Sales module for better separation of concerns
│   │   │   ├─⭐ 📄 page.tsx                                 ( 380 lines) → FiscalPage.tsx - Migrated to Design System
│   │   │   └─  📄 types.ts                                 ( 250 lines) → Fiscal Module Types - Argentine Tax Compliance & AFIP Integration Based on architecture-plan.md requirements
│   │   ├─📂 materials
│   │   │   ├─📂 components
│   │   │   │   ├─📂 __tests__
│   │   │   │   │   └─  📄 MaterialsGrid.test.tsx                   ( 235 lines) → 🎯 Mock data que simula materials reales
│   │   │   │   ├─📂 analytics
│   │   │   │   │   └─⭐ 📄 ABCAnalysisSection.tsx                   ( 312 lines) → ABCAnalysisSection.tsx - Advanced ABC Analysis for Materials Inventory Management
│   │   │   │   ├─📂 MaterialFormModalComplete
│   │   │   │   │   ├─📂 components
│   │   │   │   │   │   ├─📂 CountableFields
│   │   │   │   │   │   │   ├─  📄 CountableFields.tsx                      ( 207 lines)
│   │   │   │   │   │   │   ├─⭐ 📄 CountableStockFields.tsx                 ( 550 lines)
│   │   │   │   │   │   │   └─  📄 index.tsx                                (   1 lines)
│   │   │   │   │   │   ├─📂 ElaboratedFields
│   │   │   │   │   │   │   └─  📄 ElaboratedFields.tsx                     (  72 lines)
│   │   │   │   │   │   ├─📂 FormSections
│   │   │   │   │   │   │   ├─  📄 CommonFields.tsx                         (  52 lines)
│   │   │   │   │   │   │   └─  📄 ValidatedField.tsx                       ( 131 lines)
│   │   │   │   │   │   ├─📂 MeasurableFields
│   │   │   │   │   │   │   ├─  📄 index.tsx                                (   1 lines)
│   │   │   │   │   │   │   ├─  📄 MeasurableFields.tsx                     (  75 lines)
│   │   │   │   │   │   │   └─⭐ 📄 MeasurableStockFields.tsx                ( 487 lines) → Estado local para el precio total (independiente de unit_cost)
│   │   │   │   │   │   ├─📂 SupplierFields
│   │   │   │   │   │   │   ├─  📄 index.ts                                 (   1 lines)
│   │   │   │   │   │   │   └─⭐ 📄 SupplierFields.tsx                       ( 396 lines) → Para crear nuevo supplier
│   │   │   │   │   │   ├─  📄 CountableFields.tsx                      ( 293 lines) → Tipos de configuración de stock
│   │   │   │   │   │   ├─  📄 ElaboratedFields.tsx                     (  72 lines)
│   │   │   │   │   │   ├─  📄 index.ts                                 (   6 lines)
│   │   │   │   │   │   ├─  📄 MeasurableFields.tsx                     (  78 lines)
│   │   │   │   │   │   └─  📄 TypeSelector.tsx                         (  41 lines)
│   │   │   │   │   ├─  📄 constants.ts                             (  69 lines) → Common type for all select options with labels
│   │   │   │   │   ├─  📄 index.tsx                                (   8 lines)
│   │   │   │   │   ├─⭐ 📄 MaterialFormDialog.tsx                   ( 597 lines) → Components
│   │   │   │   │   └─  📄 types.ts                                 (  12 lines)
│   │   │   │   ├─  📄 AlertsTab.tsx                            ( 204 lines) → src/features/inventory/components/AlertsTab.tsx Tab de alertas de stock - CORREGIDO
│   │   │   │   ├─  📄 index.ts                                 (   7 lines) → Export all refactored components
│   │   │   │   ├─⭐ 📄 ItemForm.tsx                             ( 400 lines) → ✅ FIX: Definir colecciones fuera del componente para performance
│   │   │   │   ├─  📄 LazyAnalytics.tsx                        (  46 lines) → Lazy load analytics components
│   │   │   │   ├─  📄 LazyMaterialFormModal.tsx                (  47 lines) → Lazy load the heavy modal component
│   │   │   │   ├─  📄 LazyOfflineMaterialsPage.tsx             (  55 lines) → LazyOfflineMaterialsPage.tsx - Lazy-loaded materials page with code splitting
│   │   │   │   ├─  📄 MaterialFormModalComplete.tsx            (   2 lines) → Re-export the refactored MaterialFormDialog component
│   │   │   │   ├─  📄 MaterialsFilters.tsx                     ( 137 lines)
│   │   │   │   ├─  📄 MaterialsGrid.tsx                        ( 156 lines) → 🎯 Using centralized utilities for all calculations
│   │   │   │   ├─  📄 MaterialsHeader.tsx                      (  93 lines)
│   │   │   │   ├─⭐ 📄 MaterialsInventoryGrid.tsx               ( 384 lines) → MaterialsInventoryGrid.tsx - Virtualized inventory grid with smart filtering
│   │   │   │   ├─  📄 MaterialsView.tsx                        ( 155 lines) → UnifiedMaterialsView.tsx - Smart Materials View with Automatic Online/Offline Detection Intelligently switches between MaterialsPage and OfflineMaterialsPage based on connection
│   │   │   │   ├─  📄 OfflineMaterialsPage.tsx                 (  17 lines)
│   │   │   │   ├─  📄 OfflineMaterialsPageHeader.tsx           ( 165 lines) → OfflineMaterialsPageHeader.tsx - Focused header component with connection status
│   │   │   │   ├─  📄 OfflineMaterialsStats.tsx                (  98 lines) → OfflineMaterialsStats.tsx - Statistics grid component
│   │   │   │   ├─  📄 StockLabHeader.tsx                       (  98 lines)
│   │   │   │   └─⭐ 📄 UniversalItemForm.tsx                    ( 981 lines) → ✅ IMPORTS REALES
│   │   │   ├─📂 hooks
│   │   │   │   └─⭐ 📄 useMaterials.tsx                         ( 354 lines) → src/features/materials/logic/useMaterials.tsx Materials management hook with Supabase realtime integration
│   │   │   ├─📂 services
│   │   │   │   ├─📂 __tests__
│   │   │   │   │   └─  📄 materialsNormalizer.test.ts              ( 288 lines)
│   │   │   │   ├─  📄 index.ts                                 (   1 lines)
│   │   │   │   ├─  📄 inventoryApi.ts                          ( 125 lines) → src/features/inventory/data/inventoryApi.ts API functions para el módulo inventory
│   │   │   │   ├─  📄 materialsNormalizer.ts                   ( 274 lines) → /** Service responsible for normalizing API data into consistent MaterialItem objects. Handles type-specific transformations and provides default values for missing properties. /
│   │   │   │   ├─  📄 suppliersApi.ts                          (  98 lines) → API functions para el módulo suppliers
│   │   │   │   └─⭐ 📄 supplyChainDataService.ts                ( 310 lines) → /** Supply Chain Data Service Replaces mock data with real Supabase functions for Supply Chain Intelligence /
│   │   │   ├─📂 utils
│   │   │   │   ├─  📄 conversions.ts                           ( 284 lines) → src/features/inventory/utils/conversions.ts 🧮 SISTEMA DE CONVERSIONES PRECISAS - Sin decimales, máxima precisión
│   │   │   │   ├─  📄 formCalculations.ts                      ( 255 lines) → /** Utility functions for material form calculations Handles cost calculations, conversions, and formatting for the form UI /
│   │   │   │   ├─  📄 index.ts                                 (   4 lines)
│   │   │   │   ├─  📄 measurementTypes.ts                      ( 196 lines) → /** Measurement type detection utilities Separates measurement logic from business categorization /
│   │   │   │   └─  📄 stockCalculations.ts                     ( 239 lines) → /** Stock status levels /
│   │   │   ├─⭐ 📄 abc-analysis.tsx                         ( 371 lines) → ABCAnalysisPage.tsx - Advanced ABC Analysis for Inventory Management
│   │   │   ├─  📄 page.tsx                                 ( 184 lines) → Module components - Temporariamente comentados para evitar errores de compilación import { MaterialsHeader } from './components/MaterialsHeader'; import { MaterialsFilters } from './components/MaterialsFilters'; import { MaterialsGrid } from './components/MaterialsGrid'; import { LazyMaterialForm...
│   │   │   ├─  📄 procurement.tsx                          ( 145 lines) → Hooks
│   │   │   ├─  📄 supply-chain.tsx                         ( 157 lines) → Hooks
│   │   │   └─  📄 types.ts                                 ( 278 lines) → Materials module types - Simplified and focused Clean, maintainable type system for inventory management
│   │   ├─📂 operations
│   │   │   ├─📂 components
│   │   │   │   ├─📂 kitchen
│   │   │   │   ├─📂 sections
│   │   │   │   │   ├─  📄 KitchenSection.tsx                       ( 283 lines) → KitchenSection.tsx - Migrated to Design System Fixed: Element type is invalid error
│   │   │   │   │   ├─  📄 MonitoringSection.tsx                    ( 167 lines) → Monitoring Section for real-time metrics and alerts
│   │   │   │   │   ├─  📄 PlanningSection.tsx                      ( 135 lines) → Planning Section for production calendar and planning
│   │   │   │   │   └─  📄 TablesSection.tsx                        (   7 lines) → Tables Section - Integrated Table Management Page
│   │   │   │   └─  📄 OperationsHeader.tsx                     (  97 lines) → OperationsHeader with KPIs and quick actions
│   │   │   ├─📂 hooks
│   │   │   ├─📂 services
│   │   │   ├─  📄 page.tsx                                 ( 161 lines) → OperationsPage.tsx - Redesigned with Design System Patterns Following same conventions as CostAnalysisTab.tsx and MenuEngineeringOnly.tsx
│   │   │   └─⭐ 📄 tables.tsx                               ( 446 lines)
│   │   ├─📂 products
│   │   │   ├─📂 components
│   │   │   │   ├─📂 costs
│   │   │   │   │   ├─  📄 CostAnalysisReports.tsx                  (  94 lines) → src/features/products/ui/costs/CostAnalysisReports.tsx Reportes y análisis de costos como componente independiente
│   │   │   │   │   ├─⭐ 📄 CostCalculator.tsx                       ( 324 lines) → src/features/products/ui/costs/CostCalculator.tsx Calculadora de costos como componente independiente
│   │   │   │   │   └─  📄 PricingScenarios.tsx                     ( 134 lines) → src/features/products/ui/costs/PricingScenarios.tsx Escenarios de precios como componente independiente
│   │   │   │   ├─⭐ 📄 ComponentManager.tsx                     ( 307 lines) → src/features/products/ui/ComponentManager.tsx Component Management for Products with Inventory Integration
│   │   │   │   ├─  📄 CostAnalysisModule.tsx                   (  18 lines) → src/features/products/ui/CostAnalysisModule.tsx Módulo de Análisis de Costos - USANDO NUEVO DESIGN SYSTEM COMPONENT
│   │   │   │   ├─⭐ 📄 CostAnalysisTab.tsx                      ( 479 lines) → src/features/products/ui/CostAnalysisTab.tsx Advanced Cost Analysis Calculator - DESIGN SYSTEM VERSION
│   │   │   │   ├─  📄 DemandForecastOnly.tsx                   ( 184 lines) → src/features/products/ui/DemandForecastOnly.tsx Demand Forecast como sección independiente
│   │   │   │   ├─⭐ 📄 MenuEngineeringOnly.redesign.tsx         ( 391 lines) → MenuEngineeringOnly.tsx - Redesigned with Design System Patterns Following same conventions as CostAnalysisTab.tsx
│   │   │   │   ├─⭐ 📄 MenuEngineeringOnly.tsx                  ( 391 lines) → MenuEngineeringOnly.tsx - Redesigned with Design System Patterns Following same conventions as CostAnalysisTab.tsx
│   │   │   │   ├─  📄 ProductForm.tsx                          ( 233 lines) → src/features/products/ui/ProductForm.tsx Product Creation and Editing Form with ChakraUI v3
│   │   │   │   ├─  📄 ProductFormModal.tsx                     ( 142 lines) → Update existing product
│   │   │   │   ├─⭐ 📄 ProductionActiveTab.tsx                  ( 512 lines) → src/features/products/ui/ProductionActiveTab.tsx Control de Producciones Activas - Real-time Production Management
│   │   │   │   ├─⭐ 📄 ProductionPlanningOnly.tsx               ( 431 lines) → src/features/products/ui/ProductionPlanningOnly.tsx Production Planning como sección independiente
│   │   │   │   ├─⭐ 📄 ProductionPlanningTab.tsx                ( 917 lines) → src/features/products/ui/ProductionPlanningTab.tsx Production Planning & Demand Forecasting System
│   │   │   │   ├─⭐ 📄 ProductionScheduleOnly.tsx               ( 332 lines) → src/features/products/ui/ProductionScheduleOnly.tsx Production Schedule como sección independiente
│   │   │   │   ├─⭐ 📄 ProductList.tsx                          ( 349 lines) → src/features/products/ui/ProductList.tsx Product List with Intelligence Display
│   │   │   │   └─  📄 ProductListOnly.tsx                      ( 129 lines) → src/features/products/ui/ProductListOnly.tsx Gestión de productos sin sub-pestañas
│   │   │   ├─📂 hooks
│   │   │   │   ├─⭐ 📄 menuEngineeringCalculations.ts           ( 459 lines) → Menu Engineering Matrix Calculations Strategic Business Intelligence Engine for G-Admin Mini
│   │   │   │   ├─  📄 useCostCalculations.ts                   ( 194 lines) → /** Centralized hook for all cost calculation logic Eliminates duplication across CostAnalysisTab, CostCalculator, PricingScenarios, etc. /
│   │   │   │   ├─⭐ 📄 useMenuEngineering.ts                    ( 353 lines) → Data
│   │   │   │   ├─  📄 useProductComponents.ts                  (  69 lines) → src/features/products/logic/useProductComponents.ts Hook for managing product components
│   │   │   │   ├─  📄 useProducts.ts                           ( 121 lines) → Get products with their recipes if they exist - CONNECTED TO REAL RECIPE SYSTEM
│   │   │   │   └─  📄 useRealCostAnalysis.ts                   ( 225 lines) → /** Hook that connects CostAnalysisTab with REAL data from MaterialsStore and ProductsStore Eliminates hardcoded mock data - uses actual recipe costs and materials inventory /
│   │   │   ├─📂 services
│   │   │   │   ├─  📄 productApi.ts                            ( 243 lines) → src/features/products/data/productApi.ts G-Admin Products API - Leveraging Database Functions for Intelligence
│   │   │   │   └─  📄 ProductCostAnalysisService.ts            ( 202 lines) → /** Service for connecting Products cost analysis with real Materials data Eliminates hardcoded mock data in CostAnalysisTab /
│   │   │   ├─  📄 page.tsx                                 ( 162 lines) → Import components
│   │   │   └─  📄 types.ts                                 ( 109 lines) → ========================================== G-ADMIN PRODUCTS MODULE - PRODUCT INTELLIGENCE SYSTEM v1.0 Following Screaming Architecture Pattern Product Assembly Engine + Component Tracking + Cost Intelligence ==========================================
│   │   ├─📂 sales
│   │   │   ├─📂 components
│   │   │   │   ├─📂 Analytics
│   │   │   │   │   ├─⭐ 📄 AdvancedSalesAnalyticsDashboard.tsx      ( 743 lines)
│   │   │   │   │   ├─⭐ 📄 PredictiveAnalyticsEngine.tsx            ( 598 lines)
│   │   │   │   │   ├─⭐ 📄 SalesIntelligenceDashboard.tsx           ( 557 lines) → src/features/sales/components/Analytics/SalesIntelligenceDashboard.tsx 🚀 SALES INTELLIGENCE - Advanced Analytics Dashboard
│   │   │   │   │   └─⭐ 📄 SalesPerformanceInsights.tsx             ( 650 lines)
│   │   │   │   ├─📂 OrderManagement
│   │   │   │   │   └─⭐ 📄 KitchenDisplaySystem.tsx                 ( 526 lines) → src/features/sales/components/OrderManagement/KitchenDisplaySystem.tsx 🚀 KITCHEN DISPLAY SYSTEM - Real-time Order Management for Kitchen Staff
│   │   │   │   ├─📂 Payment
│   │   │   │   │   └─⭐ 📄 ModernPaymentProcessor.tsx               ( 575 lines) → src/features/sales/components/Payment/ModernPaymentProcessor.tsx 🚀 PAYMENT REVOLUTION - Modern Payment Processing System
│   │   │   │   ├─📂 QROrdering
│   │   │   │   │   ├─⭐ 📄 QRCodeGenerator.tsx                      ( 500 lines) → src/features/sales/components/QROrdering/QRCodeGenerator.tsx 🚀 QR CODE ORDERING - Tableside Digital Menu System
│   │   │   │   │   └─⭐ 📄 QROrderPage.tsx                          ( 659 lines)
│   │   │   │   ├─📂 TableManagement
│   │   │   │   │   └─⭐ 📄 TableFloorPlan.tsx                       ( 505 lines) → src/features/sales/components/TableManagement/TableFloorPlan.tsx 🚀 MODERN TABLE MANAGEMENT - Visual Floor Plan Component
│   │   │   │   ├─⭐ 📄 CartValidationSummary.tsx                ( 328 lines) → src/features/sales/components/CartValidationSummary.tsx
│   │   │   │   ├─⭐ 📄 OfflineSalesView.tsx                     (1030 lines) → OfflineSalesView.tsx - Offline-First POS System for G-Admin Mini Provides seamless offline sales processing with intelligent sync
│   │   │   │   ├─⭐ 📄 ProductWithStock.tsx                     ( 412 lines) → src/features/sales/components/ProductWithStock.tsx
│   │   │   │   ├─  📄 SalesView.tsx                            ( 101 lines) → UnifiedSalesView.tsx - Smart Sales View with Automatic Online/Offline Detection Eliminates duplicate POS tabs by intelligently switching between implementations
│   │   │   │   ├─⭐ 📄 SaleWithStockView.tsx                    ( 488 lines) → src/features/sales/components/SalesWithStockView.tsx (Enhanced Version)
│   │   │   │   ├─  📄 StockSummaryWidget.tsx                   ( 283 lines) → src/features/sales/components/StockSummaryWidget.tsx
│   │   │   │   └─  📄 StockValidationAlert.tsx                 (  87 lines) → components/StockValidationAlert.tsx
│   │   │   ├─📂 hooks
│   │   │   │   ├─  📄 useSales.ts                              ( 221 lines) → src/features/sales/logic/useSales.ts - ESQUEMA NORMALIZADO
│   │   │   │   └─⭐ 📄 useSalesCart.ts                          ( 378 lines) → src/features/sales/logic/useSalesCart.ts (Enhanced Version)
│   │   │   ├─📂 services
│   │   │   │   ├─  📄 saleApi.ts                               ( 241 lines) → src/features/sales/data/saleApi.ts - ESQUEMA NORMALIZADO
│   │   │   │   └─⭐ 📄 tableApi.ts                              ( 485 lines) → src/features/sales/data/tableApi.ts 🚀 TABLE MANAGEMENT API - Modern Restaurant Operations
│   │   │   ├─  📄 page.tsx                                 ( 181 lines) → Sales Page - Redesigned with prioritized actions and better organization
│   │   │   └─⭐ 📄 types.ts                                 ( 817 lines) → src/features/sales/types.ts - MODERN POS ARCHITECTURE v3.0 ======================================================== CORE SALES & ORDER MANAGEMENT ========================================================
│   │   ├─📂 scheduling
│   │   │   ├─📂 components
│   │   │   │   └─📂 sections
│   │   │   │       ├─⭐ 📄 CoveragePlanner.tsx                      ( 565 lines) → r - Analyze and manage shift coverage gaps and staffing needs
│   │   │   │       ├─⭐ 📄 LaborCostTracker.tsx                     ( 547 lines) → LaborCostTracker - Track and analyze labor costs, overtime, and budget performance
│   │   │   │       ├─⭐ 📄 TimeOffManager.tsx                       ( 483 lines) → TimeOffManager - Manage time-off requests, approvals, and PTO tracking
│   │   │   │       └─⭐ 📄 WeeklyScheduleView.tsx                   ( 372 lines) → WeeklyScheduleView - Main calendar interface with drag & drop scheduling
│   │   │   ├─📂 hooks
│   │   │   │   └─⭐ 📄 useScheduling.ts                         ( 382 lines) → useScheduling - Main hook for scheduling module business logic
│   │   │   ├─📂 services
│   │   │   │   └─⭐ 📄 schedulingApi.ts                         ( 652 lines) → schedulingApi - Supabase API integration for scheduling module
│   │   │   ├─⭐ 📄 page.tsx                                 ( 310 lines) → Scheduling Management Module - Main Page with UNIFIED navigation pattern
│   │   │   └─  📄 types.ts                                 (  68 lines) → src/features/scheduling/types.ts Tipos para gestión de turnos y horarios
│   │   ├─📂 settings
│   │   │   ├─📂 components
│   │   │   │   ├─📂 sections
│   │   │   │   │   ├─  📄 BusinessProfileSection.tsx               ( 127 lines) → Business Profile Section - Company info, location, hours
│   │   │   │   │   ├─⭐ 📄 EnterpriseSection.tsx                    ( 314 lines) → EnterpriseSection.tsx - Enterprise Management Tools (migrated from tools)
│   │   │   │   │   ├─  📄 IntegrationsSection.tsx                  ( 225 lines) → Integrations Section - APIs, webhooks, external services
│   │   │   │   │   ├─  📄 SystemSection.tsx                        ( 142 lines) → SystemSection.tsx - System Settings with Theme Configuration
│   │   │   │   │   ├─  📄 TaxConfigurationSection.tsx              ( 168 lines) → Tax Configuration Section - Tax settings and fiscal configuration
│   │   │   │   │   └─  📄 UserPermissionsSection.tsx               ( 208 lines) → User Permissions Section - Roles and access management
│   │   │   │   ├─  📄 index.ts                                 (   2 lines) → Settings UI components (not pages)
│   │   │   │   └─  📄 SettingsHeader.tsx                       (  97 lines) → SettingsHeader with configuration status and quick actions
│   │   │   ├─📂 hooks
│   │   │   ├─📂 services
│   │   │   │   └─⭐ 📄 settingsApi.ts                           ( 553 lines) → Settings API - Business configuration database functions
│   │   │   ├─  📄 diagnostics.tsx                          (  92 lines) → DiagnosticsPage.tsx - System Diagnostics and Performance Monitoring
│   │   │   ├─  📄 enterprise.tsx                           ( 134 lines) → EnterprisePage.tsx - Enterprise Management Tools
│   │   │   ├─  📄 index.ts                                 (   6 lines) → Settings pages exports
│   │   │   ├─  📄 integrations.tsx                         ( 171 lines) → IntegrationsPage.tsx - API Integrations and External Services
│   │   │   ├─  📄 page.tsx                                 ( 145 lines) → Settings Page - Unified dashboard without nested tabs
│   │   │   ├─  📄 reporting.tsx                            ( 129 lines) → ReportingPage.tsx - Advanced Reporting Tools
│   │   │   └─  📄 types.ts                                 (  82 lines) → src/features/settings/types.ts Tipos para configuraciones del negocio
│   │   └─📂 staff
│   │       ├─📂 components
│   │       │   └─📂 sections
│   │       │       ├─⭐ 📄 DirectorySection.tsx                     ( 602 lines) → Staff Directory Section - Employee list and profiles
│   │       │       ├─⭐ 📄 DirectorySection.tsx.backup              ( 590 lines) → Staff Directory Section - Employee list and profiles
│   │       │       ├─⭐ 📄 ManagementSection.tsx                    ( 830 lines) → Staff Management Section - HR functions and permissions with security compliance
│   │       │       ├─⭐ 📄 PerformanceSection.tsx                   ( 527 lines) → Staff Performance Section - Metrics and scoring system
│   │       │       ├─⭐ 📄 TimeTrackingSection.tsx                  (1080 lines) → OfflineTimeTrackingSection.tsx - Offline-First Time Tracking for G-Admin Mini Provides seamless offline time tracking with intelligent sync
│   │       │       └─⭐ 📄 TrainingSection.tsx                      ( 613 lines) → Staff Training Section - Records and certifications management
│   │       ├─📂 hooks
│   │       ├─📂 services
│   │       │   └─⭐ 📄 staffApi.ts                              ( 503 lines) → Staff Management API - Database functions with security compliance
│   │       ├─⭐ 📄 page.tsx                                 ( 319 lines) → Staff Management Module - Main Page with UNIFIED navigation pattern
│   │       └─  📄 types.ts                                 ( 243 lines) → Staff Management Module - Types Definition Security compliant types for employee data management
│   ├─📂 app
│   │   ├─  📄 index.ts                                 (   5 lines) → Customer app pages exports
│   │   ├─⭐ 📄 menu.tsx                                 ( 347 lines) → CustomerMenu.tsx - Vista tipo "store" para que clientes vean productos Experiencia de catálogo moderna y visual
│   │   ├─⭐ 📄 orders.tsx                               ( 427 lines) → MyOrders.tsx - Historial y seguimiento de pedidos para clientes Experiencia moderna de seguimiento de órdenes
│   │   ├─  📄 portal.tsx                               ( 282 lines) → CustomerPortal.tsx - Dashboard personalizado para usuarios CLIENTE Experiencia tipo web/app customer-friendly
│   │   └─⭐ 📄 settings.tsx                             ( 548 lines) → CustomerSettings.tsx - Configuración personal limitada para usuarios CLIENTE Solo configuraciones que corresponden al cliente, NO configuraciones de administración
│   ├─📂 public
│   │   ├─⭐ 📄 admin-login.tsx                          ( 329 lines) → Fallback path for admin/staff
│   │   ├─  📄 admin-portal.tsx                         ( 300 lines) → Header administrativo
│   │   ├─  📄 index.ts                                 (   5 lines) → Public pages exports
│   │   ├─⭐ 📄 landing.tsx                              ( 427 lines) → Hero Section - Banner principal atractivo
│   │   └─⭐ 📄 login.tsx                                ( 327 lines) → Fallback path for customers
│   └─  📄 index.ts                                 (   5 lines) → Main pages exports
├─📂 services
│   └─📂 recipe
│       ├─📂 api
│       │   ├─  📄 recipeApi.test.ts                        ( 169 lines) → Enhanced Recipe API Tests - Comprehensive Test Suite
│       │   └─⭐ 📄 recipeApi.ts                             ( 383 lines) → src/features/recipes/data/recipeApi.ts
│       ├─📂 components
│       │   ├─📂 components
│       │   │   ├─⭐ 📄 RecipeAISuggestions.tsx                  ( 389 lines) → RecipeAISuggestions.tsx - AI-powered recipe optimization suggestions
│       │   │   └─  📄 RecipeBasicForm.tsx                      ( 167 lines) → RecipeBasicForm.tsx - Basic recipe information form
│       │   ├─  📄 index.ts                                 (   7 lines) → Clean Recipe Components - Unified exports
│       │   ├─  📄 LazyRecipeForm.tsx                       (  62 lines) → LazyRecipeForm.tsx - Lazy-loaded recipe form with code splitting
│       │   ├─⭐ 📄 RecipeForm.tsx                           (1268 lines) → src/features/recipes/ui/RecipeForm.tsx - ENHANCED WITH AI SUGGESTIONS
│       │   ├─⭐ 📄 RecipeFormClean.tsx                      ( 513 lines) → Clean Recipe Form - Optimized for G-Admin Mini
│       │   ├─⭐ 📄 RecipeList.tsx                           ( 404 lines) → src/features/recipes/ui/RecipeList.tsx - Chakra UI v3
│       │   └─  📄 RecipeListClean.tsx                      ( 243 lines) → Clean Recipe List - Optimized for G-Admin Mini
│       ├─📂 engines
│       │   ├─  📄 costCalculationEngine.test.ts            ( 137 lines) → src/features/recipes/data/engines/costCalculationEngine.test.ts
│       │   ├─  📄 costCalculationEngine.ts                 (  22 lines) → Smart Cost Calculation Engine
│       │   ├─  📄 menuEngineeringEngine.test.ts            ( 172 lines) → Menu Engineering Engine Tests - Comprehensive Test Suite
│       │   └─  📄 menuEngineeringEngine.ts                 (  24 lines) → Menu Engineering Engine
│       ├─📂 hooks
│       │   ├─  📄 useRecipes.test.ts                       ( 247 lines) → Enhanced useRecipes Hook Tests - Comprehensive Test Suite
│       │   └─  📄 useRecipes.ts                            ( 142 lines) → src/features/recipes/logic/useRecipes.ts
│       ├─  📄 index.ts                                 (  19 lines) → Recipe Service - Public exports
│       ├─  📄 RecipeAPI.ts                             ( 113 lines) → Recipe Service - API layer for recipe operations
│       ├─  📄 RecipeService.ts                         ( 199 lines) → Recipe Service - Business logic layer
│       └─⭐ 📄 types.ts                                 ( 430 lines) → ========================================== G-ADMIN RECIPES MODULE - RECIPE INTELLIGENCE SYSTEM v3.0 Following Screaming Architecture Pattern Smart Cost Calculation + Menu Engineering + Production Intelligence + Kitchen Automation ==========================================
├─📂 shared
│   ├─📂 alerts
│   │   ├─📂 components
│   │   │   ├─⭐ 📄 AlertBadge.tsx                           ( 304 lines) → src/shared/alerts/components/AlertBadge.tsx 🎯 COMPONENTE UNIFICADO DE BADGE DE ALERTAS Reemplaza AlertsBadge y todas sus variantes
│   │   │   ├─⭐ 📄 AlertDisplay.tsx                         ( 401 lines) → src/shared/alerts/components/AlertDisplay.tsx 🎯 COMPONENTE BASE UNIFICADO PARA MOSTRAR ALERTAS Reemplaza AlertCard y otros componentes similares
│   │   │   └─⭐ 📄 GlobalAlertsDisplay.tsx                  ( 318 lines) → src/shared/alerts/components/GlobalAlertsDisplay.tsx 🎯 DISPLAY AUTOMÁTICO DE ALERTAS GLOBALES Reemplaza GlobalAlerts con arquitectura más limpia
│   │   ├─📂 hooks
│   │   │   └─  📄 useAlerts.ts                             ( 261 lines) → src/shared/alerts/hooks/useAlerts.ts 🎯 HOOK PRINCIPAL DEL SISTEMA DE ALERTAS API simplificada para usar las alertas desde cualquier componente
│   │   ├─⭐ 📄 AlertsProvider.tsx                       ( 463 lines) → src/shared/alerts/AlertsProvider.tsx 🎯 PROVIDER CENTRAL DEL SISTEMA DE ALERTAS Maneja el estado global de todas las alertas de la aplicación
│   │   ├─  📄 index.ts                                 ( 192 lines) → src/shared/alerts/index.ts 🎯 EXPORTACIONES CENTRALIZADAS DEL SISTEMA DE ALERTAS Punto único de entrada para todo el sistema de alertas
│   │   └─  📄 types.ts                                 ( 200 lines) → src/shared/alerts/types.ts 🎯 SISTEMA UNIFICADO DE ALERTAS Tipos y interfaces centralizadas para todo el sistema de alertas
│   ├─📂 charts
│   │   ├─  📄 index.ts                                 (  11 lines) → src/components/charts/index.ts Chart components for analytics and KPIs
│   │   ├─  📄 KPIChart.tsx                             (  83 lines) → src/components/charts/KPIChart.tsx KPI metrics chart component
│   │   ├─  📄 RevenueChart.tsx                         (  44 lines) → src/components/charts/RevenueChart.tsx Revenue analytics chart component
│   │   └─  📄 SalesAnalyticsChart.tsx                  ( 123 lines) → src/components/charts/SalesAnalyticsChart.tsx Sales analytics and trends chart component
│   ├─📂 components
│   │   ├─📂 recipe
│   │   │   ├─📂 hooks
│   │   │   │   ├─  📄 useRecipeAPI.ts                          ( 189 lines) → useRecipeAPI - API operations hook
│   │   │   │   └─  📄 useRecipeBuilder.ts                      ( 192 lines) → useRecipeBuilder - Shared logic for recipe building
│   │   │   ├─  📄 index.ts                                 (   7 lines) → Recipe Components - Public exports
│   │   │   ├─  📄 RecipeBuilderClean.tsx                   ( 144 lines) → Clean Recipe Builder - Simplified version using clean components
│   │   │   └─⭐ 📄 RecipeBuilderLite.tsx                    ( 510 lines) → Unified Recipe Builder Lite - Works for both products and materials
│   │   ├─📂 SmartCostCalculator
│   │   │   ├─  📄 SmartCostCalculator.test.tsx             (  41 lines) → SmartCostCalculator Component Tests
│   │   │   └─⭐ 📄 SmartCostCalculator.tsx                  ( 454 lines)
│   │   ├─📂 widgets
│   │   │   ├─  📄 AlertCard.tsx                            (  47 lines)
│   │   │   ├─  📄 BusinessIntelligenceCard.tsx             (  58 lines)
│   │   │   ├─  📄 HeroMetricCard.tsx                       ( 183 lines)
│   │   │   ├─  📄 index.ts                                 (   6 lines)
│   │   │   ├─  📄 MetricCard.tsx                           (  81 lines)
│   │   │   ├─  📄 QuickActionCard.tsx                      (  38 lines)
│   │   │   └─  📄 SummaryPanel.tsx                         ( 184 lines)
│   │   ├─  📄 ErrorBoundary.tsx                        ( 100 lines) → TODO: Send error to monitoring service reportError(error, { moduleName: this.props.moduleName, errorInfo });
│   │   ├─  📄 index.ts                                 (   7 lines) → Shared Components exports
│   │   ├─  📄 LazyWithErrorBoundary.tsx                (  42 lines)
│   │   ├─  📄 MaterialSelector.tsx                     ( 237 lines) → MaterialSelector - Clean component for selecting materials with stock validation
│   │   └─  📄 ThemeToggle.tsx                          (  77 lines) → Professional Light
│   ├─📂 forms
│   │   ├─  📄 FormInput.tsx                            (  68 lines) → src/components/forms/FormInput.tsx Reusable form input component with validation
│   │   ├─  📄 FormNumberInput.tsx                      (  82 lines) → src/components/forms/FormNumberInput.tsx Reusable form number input component with validation
│   │   ├─  📄 FormSelect.tsx                           (  84 lines) → src/components/forms/FormSelect.tsx Reusable form select component with validation
│   │   ├─  📄 FormTextarea.tsx                         (  82 lines) → src/components/forms/FormTextarea.tsx Reusable form textarea component with validation
│   │   ├─  📄 FormValidation.tsx                       ( 152 lines) → src/components/forms/FormValidation.tsx Form validation utilities and helpers
│   │   └─  📄 index.ts                                 (  15 lines) → src/components/forms/index.ts Form components with validation
│   ├─📂 hooks
│   │   ├─  📄 index.ts                                 (   2 lines) → Shared Hooks exports
│   │   └─  📄 useDebounce.ts                           (  27 lines) → /** Custom hook for debouncing values to prevent excessive API calls or computations @param value - The value to debounce @param delay - Delay in milliseconds @returns The debounced value /
│   ├─📂 layout
│   │   ├─  📄 DesktopLayout.tsx                        (  59 lines) → src/components/layout/DesktopLayout.tsx Layout específico para desktop (768px+) 🔧 CRÍTICO CORREGIDO: Full width viewport + layout positioning fix
│   │   ├─  📄 MobileLayout.tsx                         (  49 lines) → src/components/layout/MobileLayout.tsx Layout específico para mobile (320px-767px) 🔧 CRÍTICO CORREGIDO: Bottom nav SIEMPRE fija + Z-index consistente + Scroll behavior
│   │   ├─  📄 ModuleHeader.tsx                         (  70 lines) → ============================================== 📁 src/components/layout/ModuleHeader.tsx ==============================================
│   │   └─  📄 ResponsiveLayout.tsx                     (  33 lines) → src/components/layout/ResponsiveLayout.tsx ResponsiveLayout - Container adaptativo mobile/desktop que usa NavigationContext ✅ CORREGIDO: Imports limpiados + errores solucionados
│   ├─📂 navigation
│   │   ├─  📄 ActionToolbar.tsx                        (  43 lines) → src/components/navigation/ActionToolbar.tsx Toolbar de acciones para desktop ✅ CORREGIDO: Import de Text + Quick actions contextuales
│   │   ├─  📄 AlertsBadge.tsx                          ( 225 lines) → Loading state
│   │   ├─  📄 BottomNavigation.tsx                     (  87 lines) → ==================================== src/components/navigation/BottomNavigation.tsx - ICONOS CORREGIDOS ====================================
│   │   ├─  📄 Breadcrumb.tsx                           (  51 lines) → src/components/navigation/Breadcrumb.tsx Breadcrumb contextual para desktop ✅ CORREGIDO: Clickeable navigation
│   │   ├─  📄 FloatingActionButton.tsx                 (  38 lines) → ==================================== src/components/navigation/FloatingActionButton.tsx - CORREGIDO ====================================
│   │   ├─  📄 Header.tsx                               ( 273 lines) → ==================================== src/components/navigation/Header.tsx - ICONOS CORREGIDOS ====================================
│   │   └─⭐ 📄 Sidebar.tsx                              ( 338 lines) → ==================================== src/shared/navigation/Sidebar.tsx - DISEÑO VISUAL OPTIMIZADO ====================================
│   └─📂 ui
│       ├─📂 business
│       │   ├─⭐ 📄 InventoryAlertBadge.tsx                  ( 353 lines)
│       │   ├─⭐ 📄 RecipeCostCard.tsx                       ( 351 lines)
│       │   └─⭐ 📄 SalesMetricChart.tsx                     ( 444 lines)
│       ├─📂 context
│       │   └─  📄 SmartDefaults.tsx                        ( 288 lines) → Layout defaults
│       ├─  📄 Alert.tsx                                ( 284 lines)
│       ├─  📄 AppContainer.tsx                         (  12 lines)
│       ├─  📄 Badge.tsx                                ( 261 lines)
│       ├─  📄 Button.tsx                               (  41 lines)
│       ├─  📄 Card.tsx                                 ( 211 lines)
│       ├─  📄 CircularProgress.tsx                     ( 117 lines) → src/components/ui/CircularProgress.tsx Functional Circular Progress for ChakraUI v3.23.0
│       ├─  📄 ConnectionBadge.tsx                      ( 137 lines) → ConnectionBadge.tsx - Universal Connection Status Indicator ChakraUI v3.23.0 Compatible - G-Admin Mini Provides consistent connection status across all modules
│       ├─  📄 ConnectionBadge.tsx.backup               ( 237 lines) → ConnectionBadge.tsx - Universal Connection Status Indicator Provides consistent connection status across all modules
│       ├─  📄 Grid.tsx                                 (  76 lines) → Responsive types for Chakra UI v3
│       ├─  📄 Icon.tsx                                 ( 216 lines) → src/components/ui/Icon.tsx Sistema de iconos moderno con Heroicons + tamaños estandarizados ✅ SOLUCIÓN: Wrapper que maneja sizes + colores + variants dinámicamente
│       ├─  📄 index.ts                                 ( 123 lines) → Shared UI Components Index - Sistema de Diseño G-Admin Mini v2.0
│       ├─  📄 InputField.tsx                           (  62 lines)
│       ├─  📄 Layout.tsx                               ( 130 lines)
│       ├─  📄 Modal.tsx                                ( 281 lines)
│       ├─  📄 NumberField.tsx                          (  65 lines)
│       ├─  📄 ProductionCalendar.tsx                   ( 191 lines) → src/components/ui/ProductionCalendar.tsx Functional Production Calendar Component for ChakraUI v3.23.0
│       ├─  📄 provider.tsx                             (  16 lines)
│       ├─  📄 SelectField.tsx                          ( 158 lines) → Tipo para opciones simples
│       ├─  📄 Stack.new.tsx                            (   0 lines)
│       ├─  📄 Stack.tsx                                ( 167 lines) → Responsive types for Chakra UI v3 - based on official documentation
│       ├─⭐ 📄 Tabs.tsx                                 ( 370 lines)
│       ├─  📄 toaster.tsx                              (  43 lines) → ✅ CORRECTO: Crear toaster instance con configuración
│       └─  📄 Typography.tsx                           ( 157 lines)
├─📂 store
│   ├─📂 __tests__
│   │   └─  📄 appStore.test.ts                         ( 227 lines) → Mock crypto.randomUUID
│   ├─  📄 appStore.ts                              ( 231 lines) → User session
│   ├─⭐ 📄 customersStore.ts                        ( 440 lines) → Customer analytics
│   ├─  📄 fiscalStore.ts                           (  12 lines) → Basic fiscal state
│   ├─  📄 index.ts                                 (  13 lines) → Main store exports
│   ├─⭐ 📄 materialsStore.ts                        ( 589 lines) → Import types from materials module
│   ├─⭐ 📄 materialsStore.ts.backup                 ( 369 lines) → Computed fields
│   ├─  📄 operationsStore.ts                       (  12 lines) → Basic operations state
│   ├─  📄 productsStore.ts                         (  82 lines) → Data
│   ├─⭐ 📄 salesStore.ts                            ( 604 lines) → Kitchen/Operations
│   ├─⭐ 📄 staffStore.ts                            ( 675 lines) → Performance metrics
│   ├─  📄 themeStore.new.ts                        (  98 lines) → Simple light/dark toggle for debugging
│   └─  📄 themeStore.ts                            (   0 lines)
├─📂 styles
│   ├─⭐ 📄 themes.css                               ( 819 lines) → /* Temas personalizados para G-Admin Mini */
│   └─  📄 themes.css.backup                        ( 242 lines) → /* Temas personalizados para G-Admin Mini */
├─📂 test
│   └─  📄 setup.ts                                 (  61 lines) → src/test/setup.ts
├─📂 theme
│   ├─⭐ 📄 index.new.ts                             ( 462 lines) → Chakra UI v3 Theme System - Single Source of Truth Following official semantic tokens structure with conditional values
│   ├─⭐ 📄 index.ts                                 ( 688 lines) → Theme color definitions - Fixed themes without responsivity
│   └─⭐ 📄 index.ts.backup                          ( 688 lines) → Theme color definitions - Fixed themes without responsivity
├─📂 types
│   ├─  📄 app.ts                                   (  38 lines) → src/types/app.ts
│   └─  📄 ui.ts                                    (  29 lines) → src/types/ui.ts
├─  📄 App.css                                  (  46 lines) → /* App específicos - Utilidades que no interfieren con Chakra */
├─⭐ 📄 App.tsx                                  ( 455 lines) → App.tsx - NUEVA ARQUITECTURA DE RUTAS - Clean and organized routing
├─  📄 debug-roles.ts                           (  82 lines) → Check if users_roles table exists
├─  📄 debug-suppliers.ts                       (  55 lines) → Debug script to test suppliers migration
├─  📄 index.css                                (  30 lines) → /* Estilos mínimos base - Chakra UI maneja el resto */
├─  📄 main.tsx                                 (  10 lines)
├─  📄 setupTests.ts                            ( 159 lines) → Setup global para todos los tests
└─  📄 vite-env.d.ts                            (   1 lines) → / <reference types="vite/client" />
**********************
PowerShell transcript end
End time: 20250823125409
**********************
