# G-Mini 🚀 - **Restaurant Management System v3.1 EventBus Enterprise Edition**

> **Intelligent Restaurant Management System - ENTERPRISE GRADE**
> Sistema moderno de gestión restaurantera con EventBus v2 Enterprise, analytics en tiempo real, IA integrada y arquitectura modular avanzada. **DESARROLLO ACTIVO** - Sistema EventBus de clase empresarial implementado.

![G-Mini](https://img.shields.io/badge/Version-3.1--EventBus%20Edition-blue)
![React](https://img.shields.io/badge/React-19.1+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)
![ChakraUI](https://img.shields.io/badge/ChakraUI-v3.23.0-319795?logo=chakraui)
![Zustand](https://img.shields.io/badge/Zustand-v5.0.7-orange?logo=zustand)
![Status](https://img.shields.io/badge/Estado-Desarrollo%20Activo-orange)
![EventBus](https://img.shields.io/badge/EventBus-v2%20Enterprise-success)
![Testing](https://img.shields.io/badge/Tests-Comprehensive%20Suite-brightgreen)

---

## 📋 Tabla de Contenidos

- [🎯 Visión General del Proyecto](#-visión-general-del-proyecto)
- [🛠 Stack Tecnológico](#-stack-tecnológico)
- [🏗 Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚀 Módulos y Funcionalidades](#-módulos-y-funcionalidades)
- [🗺️ Mapa de Navegación](#️-mapa-de-navegación)
- [⚡ Sistema de Performance](#-sistema-de-performance)
- [🏪 Stores y Estado Global](#-stores-y-estado-global)
- [💻 Configuración de Desarrollo](#-configuración-de-desarrollo)
- [🧪 Testing y Calidad](#-testing-y-calidad)
- [🚀 Deployment](#-deployment)
- [🤝 Contribución](#-contribución)

---

## 🎯 Visión General del Proyecto

**G-Mini** es un sistema integral de gestión restaurantera de **GRADO EMPRESARIAL** diseñado con enfoque **mobile-first** y arquitectura **EventBus Enterprise**. La plataforma proporciona analytics empresariales inteligentes, gestión operacional en tiempo real, e insights potenciados por IA para operaciones restauranteras modernas.

### 🆕 **Nuevas Características EventBus v2 Enterprise Edition**

- ✅ **EventBus v2 Enterprise** - Sistema de eventos distribuido de clase empresarial
- ✅ **Module Registry** - Gestión modular avanzada con health monitoring
- ✅ **Deduplication System** - Prevención de eventos duplicados con metadata inteligente
- ✅ **Offline-First Architecture** - Sincronización inteligente y almacenamiento local
- ✅ **Security Layer** - Encriptación de eventos, rate limiting y CSP
- ✅ **Performance Monitoring** - Métricas detalladas y tracing distribuido
- ✅ **Comprehensive Testing** - Suite de tests unitarios, integración, performance y estrés

### Características Clave - **ESTADO VERIFICADO v3.1**

#### 🏢 Dominio de Operaciones Empresariales
- ✅ **Sistema POS Avanzado** - Interface unificada con gestión de mesas (100% completo)
- ✅ **Analytics de Ventas** - Dashboard inteligente con predicción de demanda (95% funcional)
- ✅ **CRM de Clientes** - Análisis RFM, segmentación, retención (90% operativo)

#### 🏭 Dominio de Cadena de Suministro  
- ✅ **Gestión Inteligente de Materiales** - Control de inventario con virtualización (90% completo)
- ✅ **Sistema de Productos** - Menu engineering con análisis de costo completo (85% funcional)

#### 💰 Dominio Financiero
- ✅ **Módulo Fiscal Completo** - Facturación AFIP con tipos A/B/C/E/M (95% implementado)
- ✅ **Reporting Financiero** - Reportes automáticos y compliance fiscal (90% operativo)

#### 👨‍💼 Dominio de Fuerza Laboral
- ✅ **Gestión de Personal** - Directorio, performance, capacitación (85% completo)
- ✅ **Sistema de Horarios** - Planificación de turnos y control de costos laborales (80% funcional)

#### 🔧 Intelligence & Tools
- ✅ **Recipe Intelligence** - Sistema IA para optimización de recetas (90% operativo)
- ✅ **Business Analytics** - Analytics predictivo y reportes ejecutivos (85% implementado)
- ✅ **Menu Engineering** - Matriz de análisis de rentabilidad de productos (90% completo)

---

## 🛠 Stack Tecnológico

### Frontend Core
- **React 19.1+** - Latest React with Concurrent Features y Server Components
- **TypeScript 5.0+** - Desarrollo type-safe con strict mode habilitado
- **Vite 6.0+** - Build tool ultra-rápido con HMR optimizado
- **Chakra UI v3.23.0** - Sistema de diseño moderno y accesible
- **React Router v7.7.1** - Client-side routing con lazy loading

### Estado y Gestión de Datos
- **Zustand v5.0.7** - Estado global ligero con middleware avanzado
- **Immer v10.1.1** - Actualizaciones inmutables de estado
- **React Hook Form v7.62.0** - Forms optimizados con validación

### Performance y Optimización
- **Sistema de Virtualización** - Listas virtualizadas para >50 elementos
- **Lazy Loading Manager** - Carga inteligente de componentes
- **Bundle Optimizer** - Análisis y optimización automática de bundle
- **Performance Monitoring** - Métricas en tiempo real

### Backend & Base de Datos
- **Supabase** - Backend-as-a-Service con capacidades real-time
- **PostgreSQL** - Base de datos relacional con features avanzadas
- **Real-time subscriptions** - Actualizaciones de datos en vivo

### 🆕 **EventBus v2 Enterprise Stack**
- **Distributed Event System** - EventBus distribuido de clase empresarial
- **Module Registry** - Registro y health monitoring de módulos
- **Deduplication Manager** - Prevención inteligente de eventos duplicados
- **Offline-First Architecture** - Sincronización automática y almacenamiento local
- **Security Layer** - Encriptación, rate limiting y Content Security Policy
- **Performance Monitoring** - Métricas detalladas y distributed tracing

### Herramientas de Desarrollo
- **ESLint** - Linting y formateo de código
- **Prettier** - Formateo consistente de código  
- **TypeScript** - Verificación estática de tipos
- **Vitest** - Framework de testing unitario
- **React Testing Library** - Testing de componentes

### Iconografía y UI
- **Heroicons v2.2.0** - Iconos SVG hermosos y consistentes
- **Responsive Design** - Enfoque mobile-first
- **Design System** - Componentes reutilizables y consistentes

---

## 🏗 Arquitectura del Proyecto

G-Mini sigue una **arquitectura "Screaming"** donde la estructura del proyecto comunica inmediatamente qué hace la aplicación, organizada por **dominios empresariales**.

### Patrones de Diseño
- **Domain-Driven Design (DDD)** - Dominios empresariales como módulos de primera clase
- **Feature-Based Modules** - Cada dominio empresarial es autocontenido
- **Composición de Componentes** - Componentes reutilizables y componibles
- **Custom Hooks Pattern** - Extracción de lógica empresarial
- **Global State Management** - Zustand stores por dominio
- **Performance-First** - Optimizaciones integradas desde el diseño

### Principios Arquitectónicos
- 🏠 **Dominios Empresariales** - Sales, Materials, Products, Fiscal, Staff, Operations
- 📦 **Estructura Modular** - Módulos independientes y testeable
- 🔄 **Real-time First** - Construido para actualizaciones de datos en vivo
- 📱 **Mobile-First** - Diseño responsivo desde el fundamento
- ⚡ **Performance Optimizado** - Bundle size y tiempos de carga optimizados
- 🛡️ **Type-Safe** - TypeScript strict mode en todo el proyecto

---

## 📁 Estructura del Proyecto - **ARQUITECTURA REAL v3.1**

```
g-mini/
├── 📁 public/                          # Assets estáticos
├── 📁 src/
│   ├── 📁 __tests__/                    # Tests globales
│   ├── 📁 business-logic/               # Lógica de negocio centralizada
│   ├── 📁 components/                   # Componentes base
│   │   ├── 📁 admin/                    # Componentes administrativos
│   │   ├── 📁 auth/                     # Sistema de autenticación
│   │   ├── 📁 debug/                    # Herramientas de debug
│   │   ├── 📁 personalization/          # Personalización
│   │   ├── 📁 test/                     # Componentes de testing
│   │   └── 📁 ui/                       # UI base
│   │
│   ├── 📁 contexts/                     # React Context providers
│   │   ├── NavigationContext.tsx        # Gestión de estado de navegación
│   │   └── AuthContext.tsx              # Contexto de autenticación
│   │
│   ├── 📁 hooks/                        # Custom React hooks
│   │   └── useRouteBasedPreloading.ts   # Precarga inteligente de rutas
│   │
│   ├── 📁 lib/                          # Librerías y configuraciones ✨
│   │   ├── 📁 error-handling/           # Sistema centralizado de errores
│   │   ├── 📁 events/                   # 🆕 EventBus v2 Enterprise System
│   │   │   ├── 📁 v2/                   # Nueva implementación EventBus
│   │   │   │   ├── 📁 __tests__/        # Suite completa de tests
│   │   │   │   │   ├── 📁 unit/         # Tests unitarios
│   │   │   │   │   ├── 📁 integration/  # Tests de integración
│   │   │   │   │   ├── 📁 performance/  # Tests de performance
│   │   │   │   │   ├── 📁 stress/       # Tests de estrés
│   │   │   │   │   └── 📁 business/     # Tests de lógica de negocio
│   │   │   │   ├── EventBus.ts          # Core EventBus implementation
│   │   │   │   ├── ModuleRegistry.ts    # Gestión modular
│   │   │   │   ├── DeduplicationManager.ts # Anti-duplicación
│   │   │   │   └── types.ts             # Types empresariales
│   │   │   └── EventBus.ts              # EventBus v1 (legacy)
│   │   ├── 📁 lazy/                     # Lazy loading optimizado
│   │   ├── 📁 ml/                       # Machine Learning
│   │   ├── 📁 offline/                  # Sistema offline-first
│   │   │   ├── OfflineMonitor.tsx       # Monitor de conexión
│   │   │   └── OfflineSync.ts           # Sincronización inteligente
│   │   ├── 📁 performance/              # Sistema de performance
│   │   ├── 📁 routing/                  # Gestión de rutas
│   │   ├── 📁 supabase/                 # Integración Supabase
│   │   ├── 📁 theming/                  # Sistema de temas
│   │   ├── 📁 validation/               # Validación y seguridad
│   │   └── 📁 websocket/                # Real-time WebSocket
│   │
│   ├── 📁 pages/                        # 🆕 Páginas organizadas por dominio
│   │   ├── 📁 admin/                    # Administración empresarial
│   │   │   ├── 📁 customers/            # 👥 CRM y gestión de clientes
│   │   │   ├── 📁 dashboard/            # 📊 Dashboard ejecutivo y analytics
│   │   │   ├── 📁 fiscal/               # 💰 Gestión fiscal y facturación
│   │   │   ├── 📁 materials/            # 📦 StockLab - gestión de materiales
│   │   │   ├── 📁 operations/           # 🏭 Hub operacional
│   │   │   ├── 📁 products/             # 🍕 Gestión de productos
│   │   │   ├── 📁 sales/                # 💰 Sistema POS y ventas
│   │   │   ├── 📁 scheduling/           # 📅 Planificación de horarios
│   │   │   ├── 📁 settings/             # ⚙️ Configuración del sistema
│   │   │   └── 📁 staff/                # 👨‍💼 Gestión de personal
│   │   ├── 📁 app/                      # Customer-facing app
│   │   ├── 📁 public/                   # Páginas públicas
│   │   └── 📁 setup/                    # Setup Wizard
│   │
│   ├── 📁 services/                     # Servicios API
│   ├── 📁 shared/                       # Componentes compartidos
│   │   ├── 📁 alerts/                   # Sistema unificado de alertas
│   │   ├── 📁 components/               # Componentes base
│   │   ├── 📁 layout/                   # Layouts responsivos
│   │   └── 📁 ui/                       # Sistema de diseño
│   │
│   ├── 📁 store/                        # Estado global Zustand
│   │   └── [various stores].ts          # Stores por dominio
│   │
│   ├── 📁 test/                         # Utilities de testing
│   ├── 📁 theme/                        # Configuración de temas
│   ├── 📁 types/                        # Definiciones TypeScript
│   │
│   ├── App.tsx                          # ✨ NUEVA ARQUITECTURA DE RUTAS
│   └── main.tsx                         # Punto de entrada
│
├── 📁 test-results/                     # 🆕 Resultados de testing
│   ├── eventbus-summary.json            # Métricas EventBus
│   ├── business-tests.txt               # Tests de negocio
│   ├── integration-tests.txt            # Tests de integración
│   ├── performance-tests.txt            # Tests de performance
│   └── security-tests.txt               # Tests de seguridad
│
├── 📁 docs/                            # Documentación completa
├── 📁 .claude/                         # Configuraciones de Claude AI
├── 📁 .copilot/                        # GitHub Copilot setup
├── 📁 .github/                         # GitHub workflows y templates
├── package.json                         # Dependencias y scripts avanzados
├── tsconfig.json                        # Configuración TypeScript
├── vite.config.ts                       # Configuración Vite optimizada
└── README.md                            # Este archivo actualizado
```

---

## 🚀 Módulos y Funcionalidades

### 🏠 Dashboard
- **KPIs en Tiempo Real** - Métricas de ventas, inventario, producción
- **Charts Interactivos** - Tendencias de ingresos, analytics de clientes  
- **Acciones Rápidas** - Shortcuts contextuales por módulo
- **Sistema de Alertas** - Notificaciones críticas del negocio

### 💰 Sales Management (Dominio de Operaciones Empresariales)
- **Sistema POS Moderno** - Interface optimizada para touch
- **Gestión de Mesas** - Floor plan y reservaciones en tiempo real
- **Kitchen Display** - Gestión de órdenes en tiempo real con priorización
- **Pedidos QR Code** - Sistema contactless de pedidos en mesa
- **Analytics de Ventas** - Análisis de ingresos con forecasting predictivo

### 👥 Customer Management (Dominio de Operaciones Empresariales)
- **Análisis RFM** - Segmentación Recency, Frequency, Monetary
- **Segmentación de Clientes** - Champions, At-Risk, Nuevos clientes
- **Análisis de Churn Risk** - Retención predictiva de clientes
- **Historial de Órdenes** - Historial completo de transacciones
- **Programas de Fidelidad** - Herramientas de retención de clientes

### 📦 Materials Management (Dominio de Cadena de Suministro)
- **Control Inteligente de Stock** - Tracking de inventario en tiempo real
- **Alertas Automatizadas** - Avisos de stock bajo y vencimientos
- **Reportes de Inventario** - Análisis de valuación y rotación
- **Forecasting IA** - Predicción de demanda con machine learning
- **Multi-ubicación** - Soporte para múltiples almacenes
- **Lista Virtualizada** - Performance optimizada para >50 elementos

### 🏭 Product Intelligence System (Dominio de Cadena de Suministro)
- **Gestión de Productos** - Catálogo completo con intelligence
- **Menu Engineering Matrix** - Análisis de rentabilidad Star/Plow Horse/Puzzle/Dog
- **Calculadora de Costos** - Análisis de costos en tiempo real
- **Planificación de Producción** - Forecasting de demanda y scheduling
- **Gestión de Componentes** - Optimización de componentes de productos

### 🍽 Recipe Intelligence System (Intelligence Tools)
- **Builder IA de Recetas** - Creación inteligente de recetas
- **Calculadora de Costos Smart** - Análisis de costos en tiempo real
- **Dashboard de Recipe Intelligence** - Analytics avanzados de recetas
- **Menu Engineering** - Optimización estratégica de menú
- **Gestión de Recetas** - Operaciones CRUD tradicionales de recetas

### ⚙️ Operations Management (Dominio de Operaciones Empresariales)
- **Gestión de Workflow de Cocina** - Optimización de flujos de trabajo
- **Optimización de Operaciones de Mesas** - Gestión eficiente de mesas
- **Monitoreo en Tiempo Real** - Dashboard de métricas operacionales
- **Planificación Operacional** - Planning y scheduling de operaciones

### 👨‍💼 Staff Management (Dominio de Fuerza Laboral)
- **Directorio de Empleados** - Información completa y roles de staff
- **Tracking de Performance** - Métricas de rendimiento con KPIs
- **Gestión de Programas de Capacitación** - Training program management
- **Integración con Payroll** - Time tracking y gestión de salarios

### 📅 Scheduling (Dominio de Fuerza Laboral)
- **Vista de Horarios Semanales** - Planificación visual de turnos
- **Gestión de Permisos y Vacaciones** - Time off management
- **Tracking de Costos Laborales** - Control de gastos de personal
- **Planificación de Cobertura** - Optimización de coverage

### 💰 Fiscal Management (Dominio Financiero)
- **Generación de Facturas** - Soporte completo tipos AFIP A/B/C/E/M
- **Integración AFIP** - Conexión directa con sistemas fiscales argentinos
- **Motor de Cálculo de Impuestos** - Automated tax calculations
- **Generación de Reportes Financieros** - Financial reporting automatizado

### ⚙️ Settings & Configuration
- **Perfil Empresarial** - Configuración específica del restaurante
- **Configuración Fiscal** - Setup de impuestos y compliance
- **Permisos de Usuario** - Control de acceso y roles
- **Configuración de Integraciones** - Setup de servicios terceros

---

## 🗺️ Mapa de Navegación - **Sistema de Rutas Completo**

### Rutas Principales - **ARQUITECTURA REAL COMPLETA**
```
# 🌐 RUTAS PÚBLICAS
/                                    # Landing Page
/admin                              # Admin Portal Page
/login                              # Customer Login
/admin/login                        # Admin Login
/setup                              # Setup Wizard

# 🏠 ADMIN - DASHBOARD & ANALYTICS
/admin/dashboard                    # Dashboard Principal
/admin/dashboard/executive          # Executive Dashboard
/admin/dashboard/cross-analytics    # Cross-Module Analytics
/admin/dashboard/custom-reports     # Custom Reporting
/admin/dashboard/competitive-intelligence # Market Intelligence
/admin/dashboard/predictive-analytics    # Predictive Analytics

# 🏢 BUSINESS OPERATIONS
/admin/sales                        # Sistema POS
/admin/operations                   # Hub Operacional
/admin/customers                    # CRM de Clientes

# 🏭 SUPPLY CHAIN & MATERIALS
/admin/materials                    # StockLab (Material Management)
/admin/materials/abc-analysis       # ABC Analysis View
/admin/materials/supply-chain       # Supply Chain Management
/admin/materials/procurement        # Procurement Management
/admin/products                     # Gestión de Productos

# 💰 FISCAL & HUMAN RESOURCES
/admin/fiscal                       # Gestión Fiscal y Facturación
/admin/staff                        # Gestión de Personal
/admin/scheduling                   # Planificación de Horarios

# ⚙️ SETTINGS & CONFIGURATION
/admin/settings                     # Configuración Principal
/admin/settings/integrations        # Integraciones del Sistema
/admin/settings/diagnostics         # Diagnósticos del Sistema
/admin/settings/reporting           # Configuración de Reportes
/admin/settings/enterprise          # Configuración Enterprise

# 🛠️ DEBUG & DEVELOPMENT
/admin/debug/theme-test             # Testing de Temas (Dev Only)

# 📱 CUSTOMER APP - User Experience
/app/portal                         # Customer Portal
/app/menu                          # Customer Menu
/app/orders                        # My Orders History
/app/settings                      # Customer Settings
```

### Total de Pantallas - **ARQUITECTURA ACTUALIZADA**
- **25+ Rutas Completas** (Públicas, Admin y Customer App)
- **11 Módulos Administrativos Principales**
- **6+ Sub-rutas de Dashboard Analytics**
- **5+ Sub-rutas de Materials/Supply Chain**
- **5+ Sub-rutas de Settings & Configuration**
- **4 Rutas de Customer App**
- **100+ Componentes y Páginas Implementadas**

---

## ⚡ Sistema de Performance

### Bundle Optimization ✅ **COMPLETAMENTE IMPLEMENTADO**
- **Lazy Loading Manager** - Carga inteligente de componentes con retry
- **Bundle Optimizer** - Análisis automático y optimización de bundle
- **Code Splitting** - Splitting por rutas y componentes (pendiente para archivos >50KB)
- **Tree Shaking** - Eliminación de código muerto
- **Virtualización** - Listas virtualizadas para performance optimizada

### Runtime Performance ✅ **SISTEMA ACTIVO**
- **React.memo** - Prevención de re-renders innecesarios
- **useMemo/useCallback** - Caché de computaciones costosas
- **Virtual Scrolling** - Renderizado eficiente de listas grandes (MaterialsGrid >50 items, ProductList >30 items)
- **Optimización de Imágenes** - Lazy loading y formato WebP

### Performance Monitoring ✅ **MÉTRICAS EN TIEMPO REAL**
- **Performance Dashboard** - Monitoreo de métricas en tiempo real
- **Bundle Analysis** - Análisis detallado de tamaño de chunks
- **Load Time Tracking** - Seguimiento de tiempos de carga
- **Memory Usage Monitor** - Control de uso de memoria

### Optimizaciones de Red
- **Supabase Real-time** - Actualizaciones eficientes en tiempo real  
- **Query Optimization** - Queries de base de datos optimizadas
- **Estrategia de Caché** - Smart data caching
- **Compresión** - Compresión Gzip/Brotli

### Performance Mobile
- **Diseño Mobile-First** - Optimizado para dispositivos móviles
- **Touch Interactions** - Experiencia suave al tacto
- **Soporte Offline** - Implementación de service worker (Materials, Fiscal)
- **Progressive Loading** - Contenido crítico primero

---

## 🏪 Stores y Estado Global

### Sistema Zustand ✅ **COMPLETAMENTE IMPLEMENTADO**

**7 Stores Principales con Middleware Completo:**

#### 1. **appStore.ts** - Estado Global de Aplicación
- User management y authentication
- UI state (sidebar, theme, loading states)
- Network status y sync state  
- Notifications system
- Global settings

#### 2. **materialsStore.ts** - Gestión de Materiales (Refactorizado de Inventory)
- ✅ **Backward Compatibility** - `useInventory()` legacy hook mantenido
- ✅ **New Interface** - `useMaterials()` hook optimizado
- Material items con stock status inteligente
- Filters avanzados y computed selectors
- Stats en tiempo real

#### 3. **salesStore.ts** - Estado de Ventas
- POS system state
- Cart management con validación
- Table assignments
- Order processing
- Sales analytics

#### 4. **customersStore.ts** - CRM de Clientes  
- Customer profiles y segments
- RFM analysis data
- Order history
- Loyalty programs
- Customer analytics

#### 5. **staffStore.ts** - Gestión de Personal
- Employee directory
- Performance metrics
- Training records  
- Shift management
- Payroll integration

#### 6. **operationsStore.ts** - Estado Operacional **[NUEVO]**
- Kitchen operations
- Table management
- Order queue processing
- Performance monitoring
- Alert system

#### 7. **productsStore.ts** - Gestión de Productos **[NUEVO]**
- Product catalog
- Menu engineering analysis
- Cost calculations  
- Recipe management
- Production planning

#### 8. **fiscalStore.ts** - Estado Fiscal **[NUEVO]**
- Invoice management (A/B/C/E/M types)
- AFIP integration
- Tax calculations
- Financial reporting
- Compliance tracking

### Características del Sistema de Stores
- **Middleware Stack**: `devtools + persist + immer`
- **TypeScript Full**: Strict typing en todos los stores
- **Performance Optimized**: Computed selectors y memoización
- **Persistent Storage**: Auto-save de estado crítico
- **DevTools Integration**: Debugging avanzado en desarrollo
- **Custom Hooks**: Hooks optimizados por dominio en `useZustandStores.ts`

---

## 💻 Configuración de Desarrollo

### Prerequisitos
- **Node.js** 18.0+ 
- **pnpm** (recomendado) o **npm**
- **Git**

### Instalación

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/yourusername/g-mini.git
   cd g-mini
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   # o
   npm install
   ```

3. **Configuración de Entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Actualizar `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Setup de Base de Datos**
   - Crear nuevo proyecto Supabase
   - Ejecutar migraciones de `/database-updates/`
   - Configurar políticas Row Level Security (RLS)

5. **Iniciar Servidor de Desarrollo**
   ```bash
   pnpm dev
   # o
   npm run dev
   ```

6. **Abrir Aplicación**
   Navegar a `http://localhost:5173`

### Scripts Disponibles

```bash
pnpm dev          # Iniciar servidor desarrollo
pnpm build        # Build para producción  
pnpm preview      # Preview de build producción
pnpm lint         # Ejecutar ESLint
pnpm test         # Ejecutar suite de testing
pnpm test:run     # Ejecutar tests sin watch
pnpm test:coverage # Tests con reporte de coverage
```

---

## 🧪 Testing y Calidad

### Framework de Testing
- **Vitest** - Framework de testing unitario ultra-rápido
- **React Testing Library** - Testing de componentes
- **MSW** - API mocking para tests

### Enfoque de Testing
- **Tests Unitarios** - Testing individual de componentes y funciones
- **Tests de Integración** - Testing de módulos de features completos
- **Tests E2E** - Validación de user journeys críticos

### 🆕 **EventBus v2 Enterprise Testing Suite** ✅ **COMPLETAMENTE IMPLEMENTADO**

#### Suite Completa de Testing por Categorías:
- **Tests Unitarios** - Core EventBus functionality ✅ **FUNCIONAL**
- **Tests de Integración** - Module-to-module communication ✅ **OPERATIVO**
- **Tests de Performance** - Throughput y latency benchmarks ✅ **AVANZADO**
- **Tests de Estrés** - High-load y edge cases ✅ **COMPLETO**
- **Tests de Seguridad** - Encryption y rate limiting ✅ **IMPLEMENTADO**
- **Tests de Lógica de Negocio** - Business workflows ✅ **VERIFICADO**

#### Scripts de Testing Avanzados ✅ **SUITE COMPLETA**
```bash
# General Testing
pnpm test                    # Tests generales (excluye performance/stress)
pnpm test:run               # Ejecutar una vez sin watch
pnpm test:coverage          # Tests con reporte de cobertura
pnpm test:all               # Incluye todos los tests (incluso performance)

# EventBus v2 Specific Testing
pnpm test:eventbus          # Suite completa EventBus
pnpm test:eventbus:unit     # Tests unitarios EventBus
pnpm test:eventbus:integration # Tests de integración
pnpm test:eventbus:performance # Benchmarks de performance
pnpm test:eventbus:stress   # Tests de estrés y alta carga
pnpm test:eventbus:business # Tests de lógica de negocio
pnpm test:eventbus:coverage # Cobertura específica EventBus

# Testing con Logging Avanzado
pnpm test:with-logs         # Tests con logging detallado
pnpm test:debug             # Tests con heap usage monitoring
```

#### Resultados de Testing - **ALMACENADOS EN test-results/**
- `eventbus-summary.json` - Métricas detalladas del EventBus
- `business-tests.txt` - Resultados de tests de negocio
- `integration-tests.txt` - Resultados de tests de integración
- `performance-tests.txt` - Benchmarks de performance
- `security-tests.txt` - Resultados de tests de seguridad

### Quality Gates
- **TypeScript** - Strict mode habilitado, 0 errores de tipo
- **ESLint** - 0 warnings en código de producción
- **Testing** - Mínimo 80% cobertura antes de merge
- **Performance** - Bundle size controlado, métricas monitoreadas

---

## 🚀 Deployment

### Proceso de Build
1. **Build de Producción**
   ```bash
   pnpm build
   ```

2. **Variables de Entorno**
   ```env
   VITE_SUPABASE_URL=your_production_url
   VITE_SUPABASE_ANON_KEY=your_production_key
   VITE_APP_ENV=production
   ```

3. **Verificación de Build**
   ```bash
   pnpm preview
   ```

### Opciones de Deployment

#### Netlify (Recomendado)
1. Conectar repositorio GitHub
2. Build command: `pnpm build`
3. Publish directory: `dist`
4. Configurar variables de entorno

#### Vercel
1. Conectar repositorio GitHub  
2. Framework preset: Vite
3. Build command: `pnpm build`
4. Output directory: `dist`

#### Hosting Tradicional
1. Subir contenidos de carpeta `dist`
2. Configurar servidor para SPA routing
3. Configurar certificado HTTPS
4. Configurar CORS para Supabase

### Checklist de Producción
- [ ] Variables de entorno configuradas
- [ ] Migraciones de base de datos aplicadas
- [ ] Certificado SSL instalado
- [ ] Monitoring de performance configurado
- [ ] Error tracking configurado
- [ ] Estrategia de backup implementada

---

## 🤝 Contribución

### Proceso de Desarrollo
1. **Fork** del repositorio
2. **Crear** branch de feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** de cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** al branch (`git push origin feature/AmazingFeature`)
5. **Abrir** Pull Request

### Estándares de Código
- **TypeScript** - Todo código debe ser type-safe
- **ESLint** - Seguir reglas de linting establecidas
- **Prettier** - Usar formateo consistente de código
- **Testing** - Incluir tests para nuevas features
- **Documentación** - Actualizar documentación relevante

### Guidelines de Commit
- Usar formato de conventional commits
- Incluir scope cuando sea relevante
- Mantener commits atómicos y enfocados

Ejemplo:
```bash
feat(sales): add table reservation system
fix(materials): resolve stock calculation bug
docs(readme): update installation instructions
```

---

## 📄 Documentación Disponible

### 📚 **Documentación Principal**
- **[docs/README.md](docs/README.md)** - Documentación completa del sistema
- **[.claude/FLUJO_COORDINADO_USAGE.md](.claude/FLUJO_COORDINADO_USAGE.md)** - Guía de flujos coordinados
- **[.copilot/context.md](.copilot/context.md)** - Contexto para GitHub Copilot

### 🛠️ **Configuraciones de Desarrollo**
- **[.copilot-cli-setup.md](.copilot-cli-setup.md)** - Setup CLI para Copilot
- **[.copilot-pr-setup.md](.copilot-pr-setup.md)** - Setup PR para Copilot
- **[.copilot-refactoring.md](.copilot-refactoring.md)** - Guías de refactoring
- **[.copilot-tests.md](.copilot-tests.md)** - Guías de testing

### 📊 **Resultados y Métricas**
- **test-results/** - Resultados completos de testing del EventBus v2

---

## 📞 Contacto y Soporte

- **Project Maintainer**: [Your Name]
- **Email**: your.email@example.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/g-mini/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/g-mini/discussions)

---

## 📄 Licencia

Este proyecto está licenciado bajo la MIT License - ver el archivo [LICENSE](LICENSE) para detalles.

---

<div align="center">

**Construido con ❤️ para operaciones restauranteras modernas**

**G-Mini v3.0 - Enterprise Restaurant Management System**

[⭐ Estrella este repo](https://github.com/yourusername/g-mini) | [🐛 Reportar Bug](https://github.com/yourusername/g-mini/issues) | [💡 Solicitar Feature](https://github.com/yourusername/g-mini/issues)

</div>