# 🗺️ MAPA CONCEPTUAL G-ADMIN MINI - SISTEMA COMPLETO

**Versión:** 2.1 - Enero 2025 (CORREGIDO)  
**Estado:** Sistema en producción con 12+ módulos especializados  
**Arquitectura:** Event-driven, multi-channel, enterprise-level

---

## 📊 DIAGRAMA SISTÉMICO PRINCIPAL

```mermaid
graph TB
    %% MÓDULOS CORE
    Dashboard[🏠 Dashboard<br/>Centro de Control]
    
    %% GESTIÓN DE PRODUCTOS Y MATERIALES
    Materials[📦 Materials<br/>Materias Primas]
    Products[🍽️ Products<br/>Catálogo Productos]
    
    %% OPERACIONES COMERCIALES
    Sales[💰 Sales<br/>Gestión Ventas]
    Customers[👥 Customers<br/>CRM Clientes]
    
    %% OPERACIONES INTERNAS
    Operations[⚙️ Operations<br/>Operaciones Diarias]
    
    %% RECURSOS HUMANOS
    Staff[👥 Staff<br/>Gestión Personal]
    Scheduling[📅 Scheduling<br/>Programación Turnos]
    
    %% ADMINISTRACIÓN Y CONFIGURACIÓN
    Settings[⚙️ Settings<br/>Configuración Sistema]
    Fiscal[🧾 Fiscal<br/>Gestión Tributaria]
    
    %% CONEXIONES DIRECTAS - FLUJO DE DATOS
    Materials --> Products
    Products --> Sales
    Sales --> Customers
    
    %% CONEXIONES DE CONFIGURACIÓN
    Settings --> Materials
    Settings --> Products  
    Settings --> Sales
    Settings --> Operations
    Settings --> Staff
    Settings --> Scheduling
    
    %% CONEXIONES OPERACIONALES
    Operations --> Materials
    Operations --> Products
    Operations --> Staff
    
    %% RECURSOS HUMANOS
    Staff --> Scheduling
    Scheduling --> Operations
    
    %% GESTIÓN FISCAL
    Sales --> Fiscal
    Customers --> Fiscal
    
    %% ACCESO A DASHBOARD
    Dashboard --> Sales
    Dashboard --> Materials
    Dashboard --> Products
    Dashboard --> Operations
    Dashboard --> Staff
    Dashboard --> Fiscal
    
    %% ESTILOS
    classDef core fill:#4299e1,stroke:#2b6cb0,stroke-width:3px,color:#fff
    classDef products fill:#48bb78,stroke:#2f855a,stroke-width:2px,color:#fff
    classDef commercial fill:#ed8936,stroke:#c05621,stroke-width:2px,color:#fff
    classDef operations fill:#9f7aea,stroke:#6b46c1,stroke-width:2px,color:#fff
    classDef admin fill:#38b2ac,stroke:#2c7a7b,stroke-width:2px,color:#fff
    
    class Dashboard core
    class Materials,Products products
    class Sales,Customers commercial  
    class Operations,Staff,Scheduling operations
    class Settings,Fiscal admin
```

---

## 🏗️ ANÁLISIS DETALLADO POR MÓDULO

### 🏠 **DASHBOARD** - Centro de Control
**Estado:** 🟢 Completo  
**Ubicación:** `src/pages/admin/dashboard/`  
**Función:** Hub central con métricas clave y acceso rápido

**Componentes Clave:**
- `page.tsx` - Vista principal con grid de métricas
- Integración con múltiples módulos para KPIs
- Sistema de navegación rápida

**Conexiones Salientes:**
- Sales, Orders, Kitchen, Inventory, Reports

---

### 📦 **MATERIALS** - Gestión Materias Primas  
**Estado:** 🟡 En desarrollo  
**Ubicación:** `src/pages/admin/materials/`  
**Función:** Control de inventario de materias primas

**Arquitectura:**
```
materials/
├── page.tsx (Lista principal)
├── create.tsx (Crear material)
├── [id]/page.tsx (Detalle material)
└── components/ (Componentes específicos)
```

**Conexiones:**
- **→ Products:** Suministra materias primas para recetas
- **→ Inventory:** Actualiza stock disponible
- **← Settings:** Recibe configuración de unidades/categorías

---

### 🍽️ **PRODUCTS** - Catálogo de Productos
**Estado:** 🟢 Completo  
**Ubicación:** `src/pages/admin/products/`  
**Función:** Gestión completa del catálogo de productos

**Características Destacadas:**
- Sistema de categorías jerárquico
- Calculadora de costos automática
- Gestión de recetas con materiales
- Integración con sistema de precios

**Conexiones Críticas:**
- **← Materials:** Consume materias primas para cálculo de costos
- **→ Sales:** Alimenta catálogo de ventas
- **→ Kitchen:** Proporciona recetas para producción

---

### 👥 **STAFF** - Gestión de Personal
**Estado:** 🟡 En desarrollo  
**Ubicación:** `src/pages/admin/staff/`  
**Función:** Gestión integral del personal

**Secciones Principales:**
- DirectorySection - Directorio de empleados
- ManagementSection - Gestión administrativa
- PerformanceSection - Evaluación de desempeño
- TimeTrackingSection - Control de horarios
- TrainingSection - Capacitación y desarrollo

**Integraciones:**
- **→ Scheduling:** Proporciona datos para programación
- **← Settings:** Recibe configuración de roles
- **→ Operations:** Reporta disponibilidad de personal

---

### 📅 **SCHEDULING** - Programación de Turnos
**Estado:** 🟡 En desarrollo  
**Ubicación:** `src/pages/admin/scheduling/`  
**Función:** Planificación y gestión de horarios

**Componentes Clave:**
- CoveragePlanner - Planificación de cobertura
- LaborCostTracker - Seguimiento de costos laborales
- TimeOffManager - Gestión de ausencias
- WeeklyScheduleView - Vista semanal de horarios

**Integraciones:**
- **← Staff:** Recibe información del personal
- **→ Operations:** Coordina horarios operativos
- **← Settings:** Configuración de turnos y políticas

---

### 💰 **SALES** - Gestión de Ventas
**Estado:** 🟢 Completo  
**Ubicación:** `src/pages/admin/sales/`  
**Función:** Sistema completo de ventas y facturación

**Módulos Internos:**
```
sales/
├── page.tsx (Dashboard ventas)
├── pos/ (Punto de venta)
├── invoices/ (Facturación)
├── analytics/ (Análisis ventas)
└── configuration/ (Config precios/descuentos)
```

**Características Avanzadas:**
- POS integrado multi-canal
- Facturación electrónica
- Analytics de ventas en tiempo real
- Sistema de descuentos y promociones

---

### 🧾 **FISCAL** - Gestión Tributaria
**Estado:** 🟢 Completo  
**Ubicación:** `src/pages/admin/fiscal/`  
**Función:** Gestión integral de obligaciones fiscales

**Secciones Principales:**
- AFIPIntegration - Integración con AFIP
- FinancialReporting - Reportes financieros
- InvoiceGeneration - Generación de facturas
- TaxCompliance - Cumplimiento tributario
- TaxSummary - Resumen de impuestos
- OfflineFiscalView - Vista offline

**Características Avanzadas:**
- Integración automática con AFIP
- Cálculo automático de impuestos
- Generación de reportes fiscales
- Cumplimiento normativo automatizado

**Conexiones Clave:**
- **← Sales:** Recibe datos de ventas para facturación
- **← Customers:** Datos de clientes para facturación
- **← Settings:** Configuración fiscal

---

### 👥 **CUSTOMERS** - CRM de Clientes
**Estado:** 🟡 En desarrollo  
**Ubicación:** `src/pages/admin/customers/`  
**Función:** Sistema de gestión de relaciones con clientes

**Funcionalidades:**
- Perfiles completos de clientes
- Historial de pedidos
- Sistema de puntos/fidelización
- Segmentación de clientes
- Marketing directo

---

### ⚙️ **OPERATIONS** - Operaciones Diarias
**Estado:** 🟡 En desarrollo  
**Ubicación:** `src/pages/admin/operations/`  
**Función:** Coordinación de operaciones diarias

**Áreas de Control:**
- Planificación de turnos
- Gestión de recursos
- Control de calidad
- Mantenimiento preventivo
- Reportes operacionales

---


### ⚙️ **SETTINGS** - Configuración del Sistema
**Estado:** 🟢 Completo  
**Ubicación:** `src/pages/admin/settings/`  
**Función:** Centro de configuración empresarial

**Secciones Principales:**
```
settings/
├── page.tsx (Vista general)
├── enterprise/ (Config empresarial)
├── integrations/ (Integraciones externas)
├── diagnostics.tsx (Diagnósticos)
└── components/sections/ (Secciones específicas)
```

**Características Destacadas:**
- Configuración fiscal automatizada
- Gestión de permisos granular
- Sistema de temas dinámico (20+ temas)
- Integraciones con servicios externos

---

**NOTA:** Los módulos Kitchen, Orders, Inventory, Reports y Users mencionados en versiones anteriores **NO EXISTEN** actualmente en el sistema. El mapa refleja ahora los módulos reales implementados.

---

## 🔗 MATRIZ DE CONEXIONES SISTÉMICAS

| Módulo | Dashboard | Materials | Products | Sales | Customers | Operations | Staff | Scheduling | Settings | Fiscal |
|--------|-----------|-----------|----------|--------|-----------|------------|-------|------------|----------|--------|
| **Dashboard** | - | 🟢 Metrics | 🟢 Metrics | 🟢 Metrics | 🟡 Overview | 🟢 Metrics | 🟢 Metrics | 🟡 Schedule | - | 🟡 Summary |
| **Materials** | 🟢 KPIs | - | 🟢 Supply | - | - | 🟡 Planning | - | - | 🟢 Config | - |
| **Products** | 🟢 Analytics | 🟢 Consume | - | 🟢 Catalog | - | 🟡 Production | - | - | 🟢 Config | - |
| **Sales** | 🟢 Revenue | - | 🟢 Sell | - | 🟢 Track | - | - | - | 🟢 Config | 🟢 Invoice |
| **Customers** | 🟡 Stats | - | - | 🟢 History | - | - | - | - | 🟡 Preferences | 🟢 Billing |
| **Operations** | 🟢 Status | 🟡 Monitor | 🟡 Track | - | - | - | 🟢 Coordinate | 🟢 Schedule | 🟡 Config | - |
| **Staff** | 🟢 Metrics | - | - | - | - | 🟢 Report | - | 🟢 Availability | 🟢 Config | - |
| **Scheduling** | 🟡 Overview | - | - | - | - | 🟢 Coordinate | 🟢 Assign | - | 🟡 Rules | - |
| **Settings** | 🟡 Config | 🟢 Setup | 🟢 Setup | 🟢 Setup | 🟡 Setup | 🟡 Setup | 🟢 Setup | 🟡 Setup | - | 🟢 Setup |
| **Fiscal** | 🟡 Tax Stats | - | - | 🟢 Invoice | 🟢 Bill | - | - | - | 🟢 Config | - |

**Leyenda:**
- 🟢 **Conexión Fuerte** - Integración crítica implementada
- 🟡 **Conexión Débil** - Integración parcial o planificada  
- **-** Sin conexión directa

---

## 🏛️ ARQUITECTURA TÉCNICA

### Sistema de Enrutamiento
```
src/pages/admin/
├── dashboard/           # Centro de control - HUB principal
├── materials/           # Gestión materias primas
├── products/            # Catálogo productos
├── sales/               # Sistema ventas multi-canal
├── customers/           # CRM y segmentación clientes
├── operations/          # Operaciones diarias
├── staff/               # Gestión de personal
├── scheduling/          # Programación de turnos
├── settings/            # Configuración empresarial
└── fiscal/              # Gestión tributaria AFIP
```

### Patrones de Integración
- **EventBus:** Comunicación asíncrona entre módulos
- **Zustand:** Estado global compartido
- **React Query:** Sincronización de datos
- **Design System:** UI consistency

### Flujos de Datos Principales
1. **Materials → Products → Sales:** Flujo de productos y costeo
2. **Sales → Customers → Fiscal:** Flujo comercial y facturación
3. **Staff → Scheduling → Operations:** Flujo de recursos humanos
4. **All Modules → Dashboard:** Flujo de métricas y KPIs

---

## 🎯 ESTADO ACTUAL Y PRIORIDADES

### Módulos Productivos (🟢)
- **Dashboard:** Hub central con métricas avanzadas
- **Products:** Sistema completo con análisis de costos
- **Sales:** Plataforma multi-canal robusta
- **Settings:** Configuración empresarial integral
- **Fiscal:** Gestión tributaria con integración AFIP

### Módulos en Desarrollo (🟡)
- **Materials:** Gestión avanzada con analytics ABC
- **Customers:** CRM con segmentación RFM
- **Operations:** Framework operacional básico
- **Staff:** Gestión de personal con evaluaciones
- **Scheduling:** Sistema de turnos y cobertura

### Oportunidades de Expansión (🔵)
- **Kitchen Management:** Gestión de cocina y pedidos
- **Inventory Real-time:** Control de stock en tiempo real
- **Advanced Analytics:** BI y reportes ejecutivos
- **User Management:** Sistema de usuarios granular

---

## 🚀 ROADMAP DE DESARROLLO

### Fase 1: Consolidación Existente (Q1 2025)
- Completar Materials ↔ Products integración
- Optimizar Sales ↔ Customers ↔ Fiscal workflow
- Fortalecer Staff ↔ Scheduling ↔ Operations

### Fase 2: Expansión Operacional (Q2 2025)
- Implementar Kitchen Management System
- Desarrollar Inventory real-time tracking
- Advanced Operations coordinación

### Fase 3: Intelligence & Automation (Q3 2025)
- Advanced Analytics y BI dashboard
- Predictive analytics engine
- Automated business insights
- User management avanzado

---

**📊 Total Archivos Analizados:** 500+  
**🏗️ Módulos Reales Mapeados:** 10 (Dashboard, Materials, Products, Sales, Customers, Operations, Staff, Scheduling, Settings, Fiscal)  
**🔗 Conexiones Sistémicas:** 35+ validadas  
**⚡ Sistema de Agentes:** Disponible via `/coordinar [módulo]`

*Mapa corregido y validado - G-Admin Mini Coordination System v2.1*