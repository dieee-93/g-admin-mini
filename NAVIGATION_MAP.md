# 🗺️ G-Mini Navigation Map
*Mapa completo de navegación y estructura de pantallas*

## 📋 Tabla de Contenidos
- [Estructura Principal](#estructura-principal)
- [Módulos Principales](#módulos-principales)
- [Tools & Intelligence](#tools--intelligence)
- [Customer-Facing](#customer-facing)
- [Problemas Identificados](#problemas-identificados)

---

## 🏗️ Estructura Principal

### **Ruta Base: `/`**
**Pantalla:** Dashboard Principal  
**Componente:** `Dashboard.tsx`  
**Funcionalidad:** Vista general del sistema con KPIs y accesos rápidos

---

## 🏢 Módulos Principales

### **1. Sales Module (`/sales`)**
**Pantalla Principal:** Sistema POS Unificado  
**Componente:** `SalesPage.tsx`

#### **🔖 Pestañas:**
- **POS** (`pos`) - Sistema punto de venta principal
  - Interfaz de ventas con productos
  - Carrito inteligente con validación de stock
  - Procesador de pagos moderno
  - Smart stock validation
  
- **Mesas** (`tables`) - Gestión de mesas del restaurante
  - Floor plan interactivo
  - Estado de ocupación en tiempo real  
  - Asignación de órdenes a mesas
  - Turn time tracking
  
- **Cocina** (`kitchen`) - Sistema de display para cocina
  - Orders queue con priorización
  - Status tracking por plato
  - Tiempo de preparación
  - Kitchen station management
  
- **QR Orders** (`qr-orders`) - Sistema de pedidos QR
  - Generador de códigos QR por mesa
  - Menú digital para clientes
  - Self-ordering system
  
- **Analytics** (`analytics`) - Inteligencia de ventas
  - Sales performance insights
  - Revenue analytics
  - Predictive analytics engine
  - Advanced sales dashboard

#### **🌐 Sub-rutas Especiales:**
- `/sales/qr-order` - Página customer-facing para pedidos QR

---

### **2. Materials Module (`/materials`)**  
**Pantalla Principal:** Gestión de Inventario  
**Componente:** `MaterialsPage.tsx`

#### **✨ Características:**
- **Vista Principal** - Lista virtualizada de materiales (>50 items)
- **Form Modal** - Agregar/Editar materiales con validación
- **Filtros Avanzados** - Por categoría, stock status, proveedor
- **Analytics Tab** - ABC Analysis, alertas de stock crítico
- **Offline Support** - Funciona sin conexión con sincronización

#### **🔧 Componentes:**
- `MaterialsHeader` - Encabezado con acciones rápidas
- `MaterialsGrid` - Grid virtualizado de materiales 
- `MaterialsFilters` - Filtros y búsqueda
- `MaterialFormModal` - Modal de formulario
- `OfflineMaterialsPage` - Vista offline (52KB - requiere code splitting)

---

### **3. Products Module (`/products`)**
**Pantalla Principal:** Gestión de Productos  
**Componente:** `ProductsPage.tsx`

#### **🔖 Pestañas:**
- **Productos** (`products`) - Lista de productos con intelligence
- **Menu Engineering** (`menu-engineering`) - Análisis matricial de productos
- **Cost Analysis** (`cost-analysis`) - Análisis profundo de costos
- **Production Planning** (`production-planning`) - Planificación de producción
- **Demand Forecast** (`demand-forecast`) - Predicción de demanda

#### **🎯 Features:**
- Product list con virtualización (>30 products)
- Menu engineering matrix (Star/Plow Horse/Puzzle/Dog)
- Cost breakdown (material + labor + overhead)
- Recipe management con steps
- Component management para productos

---

### **4. Operations Module (`/operations`)**
**Pantalla Principal:** Hub Operacional  
**Componente:** `OperationsPage.tsx`

#### **🔖 Pestañas:**
- **Planificación** (`planning`) - Planificación operacional
- **Cocina** (`kitchen`) - Operaciones de cocina  
- **Mesas** (`tables`) - Gestión de mesas
- **Monitoreo** (`monitoring`) - Monitoreo en tiempo real

#### **⚙️ Funcionalidades:**
- Kitchen workflow management
- Table operation optimization
- Real-time operational monitoring
- Performance metrics dashboard

---

### **5. Customers Module (`/customers`)**
**Pantalla Principal:** CRM de Clientes  
**Componente:** `CustomersPage.tsx`

#### **🔖 Features:**
- Customer list con búsqueda avanzada
- Customer analytics con RFM analysis
- Order history por cliente
- Customer segmentation
- Loyalty program management

#### **📊 Analytics:**
- RFM Analysis Dashboard
- Customer lifetime value
- Purchase behavior patterns
- Segmentation intelligence

---

### **6. Staff Module (`/staff`)**
**Pantalla Principal:** Gestión de Personal  
**Componente:** `StaffPage.tsx`

#### **🔖 Pestañas:**
- **Directory** (`directory`) - Directorio de empleados
- **Performance** (`performance`) - Métricas de rendimiento
- **Training** (`training`) - Gestión de capacitación
- **Management** (`management`) - Administración de personal
- **Time Tracking** (`time-tracking`) - Control de horarios

#### **👥 Funcionalidades:**
- Employee directory con perfiles completos
- Performance tracking con KPIs
- Training program management
- Shift scheduling integration
- Time & attendance tracking

---

### **7. Scheduling Module (`/scheduling`)**
**Pantalla Principal:** Planificación de Horarios  
**Componente:** `SchedulingPage.tsx`

#### **🔖 Secciones:**
- **Weekly Schedule View** - Vista semanal de horarios
- **Time Off Manager** - Gestión de permisos y vacaciones
- **Labor Cost Tracker** - Seguimiento de costos laborales
- **Coverage Planner** - Planificación de cobertura

---

### **8. Fiscal Module (`/fiscal`)**
**Pantalla Principal:** Gestión Fiscal y Facturación  
**Componente:** `FiscalPage.tsx`

#### **🔖 Pestañas:**
- **Invoicing** (`invoicing`) - Generación de facturas
- **AFIP** (`afip`) - Integración con AFIP
- **Tax Compliance** (`tax-compliance`) - Cumplimiento fiscal
- **Reports** (`reports`) - Reportes financieros

#### **💰 Características:**
- Invoice generation (tipos A/B/C/E/M)
- AFIP integration con CAE
- Tax calculation engine
- Financial reports generation
- Offline fiscal mode

---

### **9. Settings Module (`/settings`)**
**Pantalla Principal:** Configuración del Sistema  
**Componente:** `SettingsPage.tsx`

#### **🔖 Pestañas:**
- **Business** (`business`) - Perfil empresarial
- **Tax** (`tax`) - Configuración fiscal
- **Permissions** (`permissions`) - Permisos de usuario
- **Integrations** (`integrations`) - Integraciones externas

---

## 🔧 Tools & Intelligence (`/tools/*`)

### **Estructura de Tools:**
**Pantalla Principal:** `ToolsPage.tsx`  
**Hub:** Panel principal con acceso a todas las herramientas

### **🧠 Intelligence Tools (`/tools/intelligence/*`)**

#### **Recipes** (`/tools/intelligence/recipes`)
- **Componente:** `RecipesPage.tsx`
- **Form:** `RecipeForm.tsx` (50KB - requiere code splitting)
- **Funcionalidad:** Gestión inteligente de recetas con IA

#### **Menu Engineering** (`/tools/intelligence/menu-engineering`)  
- **Componente:** `MenuEngineeringPage.tsx`
- **Funcionalidad:** Análisis matricial de menú

#### **Business Analytics** (`/tools/intelligence/analytics`)
- **Componente:** `BusinessAnalyticsPage.tsx`
- **Funcionalidad:** Analytics empresariales avanzados

#### **Predictive Analytics** (`/tools/intelligence/predictive`)
- **Componente:** `PredictiveAnalyticsPage.tsx`  
- **Funcionalidad:** Predicción con machine learning

#### **ABC Analysis** (`/tools/intelligence/abc-analysis`)
- **Componente:** `ABCAnalysisPage.tsx`
- **Funcionalidad:** Análisis ABC de inventario

#### **Executive Dashboard** (`/tools/intelligence/business`)
- **Componente:** `ExecutiveDashboard.tsx` (54KB - requiere code splitting)
- **Estado:** En desarrollo
- **Funcionalidad:** Dashboard ejecutivo integral

#### **Custom Reports** (`/tools/intelligence/reports`)
- **Componente:** `CustomReporting.tsx`  
- **Estado:** En desarrollo
- **Funcionalidad:** Reportes personalizados

### **⚙️ Operational Tools (`/tools/operational/*`)**

#### **Diagnostics** (`/tools/operational/diagnostics`)
- **Componente:** `DiagnosticsPage.tsx`
- **Funcionalidad:** Diagnósticos del sistema

#### **Reporting** (`/tools/operational/reporting`) 
- **Componente:** `ReportingPage.tsx`
- **Funcionalidad:** Reportes operacionales

### **🏢 Admin Tools (`/tools/admin/*`)**

#### **Enterprise** (`/tools/admin/enterprise`)
- **Componente:** `EnterprisePage.tsx` 
- **Funcionalidad:** Gestión empresarial

#### **Integrations** (`/tools/admin/integrations`)
- **Componente:** `IntegrationsPage.tsx`
- **Funcionalidad:** Integraciones API

---

## 🛒 Customer-Facing

### **QR Order Page (`/sales/qr-order`)**
- **Componente:** `QROrderPage.tsx`
- **Funcionalidad:** Interfaz de pedidos para clientes
- **Acceso:** Vía códigos QR en mesas

---

## ⚠️ Problemas Identificados

### **1. Archivos Grandes (>50KB)**
- ❌ `OfflineMaterialsPage.tsx` (52KB) - Requiere code splitting
- ❌ `CrossModuleAnalytics.tsx` (56KB) - Requiere code splitting  
- ❌ `ExecutiveDashboard.tsx` (54KB) - Requiere code splitting
- ❌ `RecipeForm.tsx` (50KB) - Requiere code splitting

### **2. Componentes en Desarrollo**
- ⚠️ `ExecutiveDashboard` - Placeholder temporal
- ⚠️ `CrossModuleAnalytics` - Placeholder temporal
- ⚠️ `CustomReporting` - Placeholder temporal

### **3. Navegación y UX**
- ✅ **Patrón Unificado:** Todos los módulos principales siguien el UNIFIED navigation pattern
- ✅ **Tabs Consistentes:** Uso consistente de Tabs de Chakra UI v3.23.0
- ✅ **Icons Heroicons:** Iconografía consistente con Heroicons v2
- ✅ **Responsive:** Layout responsivo en todos los módulos

### **4. Performance**
- ✅ **Virtualización:** Implementada en MaterialsGrid y ProductList
- ✅ **Lazy Loading:** Sistema de performance activo
- ✅ **Error Boundaries:** Manejo de errores centralizado
- ✅ **Estado Global:** Zustand stores implementadas

### **5. Funcionalidades Faltantes**
- 🔄 Code splitting para archivos grandes
- 🔄 Finalización de componentes en desarrollo
- 🔄 Testing coverage
- 🔄 Mobile optimization

---

## 📊 Estadísticas del Proyecto

**Total de Rutas Principales:** 9  
**Total de Sub-rutas:** 45+  
**Componentes Principales:** 50+  
**Stores Zustand:** 7 (app, materials, sales, customers, staff, operations, products, fiscal)  
**Performance System:** ✅ Activo  
**Offline Support:** ✅ Parcial (Materials, Fiscal)  
**TypeScript:** ✅ Strict mode  

---

*Actualizado: Enero 2025*  
*Versión: v3.0*