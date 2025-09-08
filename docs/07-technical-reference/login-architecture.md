# Guía de Arquitectura del Sistema de Login y Landing Page - G-Admin Mini

## 📋 Resumen Ejecutivo

Esta guía documenta la arquitectura mejorada del sistema de autenticación y experiencia de usuario para G-Admin Mini, diseñada para separar claramente las experiencias entre **clientes finales** y **personal administrativo**, siguiendo las mejores prácticas de UX/UI modernas.

## 🎯 Objetivos del Rediseño

### Problemas Identificados
- **Landing compartida**: Clientes y staff ven la misma interfaz de login
- **Experiencia confusa**: Los clientes llegan directamente a `/login` sin contexto comercial
- **Falta de separación**: No hay diferenciación clara entre tipos de usuarios
- **Navegación post-login**: Clientes son redirigidos al dashboard administrativo

### Objetivos del Nuevo Diseño
1. **Experiencia comercial atractiva** para clientes (www.lagigante.com.ar)
2. **Separación clara** entre portales de cliente y administrativo
3. **Flujo de usuario intuitivo** desde landing hasta funcionalidad
4. **Seguridad mejorada** con rutas específicas por rol
5. **Branding consistente** y experiencia profesional

## 🏗️ Arquitectura Propuesta

### 1. Estructura de Rutas Nueva

```typescript
// RUTAS PÚBLICAS (No autenticadas)
├── /                           # Landing page comercial principal
├── /admin                      # Portal de acceso administrativo
├── /login                      # Login para clientes (comercial)
├── /admin/login               # Login para staff (administrativo)
├── /register                  # Registro de clientes
├── /menu                      # Menú público (sin login)
├── /about                     # Acerca de la empresa
├── /contact                   # Contacto

// RUTAS AUTENTICADAS - CLIENTES
├── /app                       # Portal principal del cliente
│   ├── /dashboard            # Dashboard personalizado cliente
│   ├── /menu                 # Menú interactivo para pedidos
│   ├── /orders               # Mis pedidos y historial
│   ├── /favorites            # Productos favoritos
│   ├── /profile              # Configuración del perfil
│   └── /support              # Soporte al cliente

// RUTAS AUTENTICADAS - STAFF/ADMIN
├── /panel                     # Panel administrativo
│   ├── /dashboard            # Dashboard administrativo actual
│   ├── /operations           # Operaciones (staff)
│   ├── /sales                # Ventas y reportes
│   ├── /materials            # Inventario y materiales
│   ├── /products             # Gestión de productos
│   ├── /staff                # Gestión de personal
│   ├── /customers            # Gestión de clientes (admin view)
│   ├── /fiscal               # Reportes fiscales
│   └── /settings             # Configuraciones del sistema
```

### 2. Flujo de Usuario Mejorado

#### Para Clientes (Experiencia B2C)
```mermaid
graph TD
    A[www.lagigante.com.ar] --> B{¿Ya tiene cuenta?}
    B -->|No| C[Registro rápido]
    B -->|Sí| D[Login cliente]
    C --> E[/app/dashboard]
    D --> E
    E --> F[Ver menú]
    E --> G[Hacer pedido]
    E --> H[Ver mis pedidos]
    F --> I[Agregar al carrito]
    I --> J[Confirmar pedido]
    J --> K[Seguimiento en tiempo real]
```

#### Para Personal/Admin (Experiencia B2B)
```mermaid
graph TD
    A[lagigante.com.ar/admin] --> B[Login administrativo]
    B --> C{Rol del usuario}
    C -->|OPERADOR| D[/panel/operations]
    C -->|SUPERVISOR| E[/panel/dashboard]
    C -->|ADMIN| F[/panel/dashboard]
    C -->|SUPER_ADMIN| G[/panel/dashboard]
    D --> H[Gestión de órdenes]
    E --> I[Supervisión operativa]
    F --> J[Gestión completa]
    G --> K[Control total + configuración]
```

### 3. Componentes Nuevos Requeridos

#### Landing Page Comercial (`/`)
```typescript
// src/pages/LandingPage.tsx
interface LandingPageProps {
  companyInfo: CompanyInfo;
  featuredProducts: Product[];
  testimonials: Testimonial[];
}

export function LandingPage() {
  return (
    <div>
      <HeroSection />           // Banner principal atractivo
      <FeaturedMenu />          // Menú destacado
      <AboutSection />          // Acerca del restaurante
      <TestimonialsSection />   // Reseñas de clientes
      <ContactSection />        // Información de contacto
      <Footer />                // Footer comercial
    </div>
  );
}
```

#### Portal de Acceso Administrativo (`/admin`)
```typescript
// src/pages/AdminPortal.tsx
export function AdminPortal() {
  return (
    <div>
      <AdminHeader />           // Header administrativo
      <LoginSection />          // Sección de login para staff
      <SystemStatus />          // Estado del sistema (opcional)
      <SupportContact />        // Contacto técnico
    </div>
  );
}
```

#### Separación de Componentes de Login
```typescript
// src/components/auth/CustomerLogin.tsx - Para clientes
export function CustomerLogin() {
  // Diseño comercial, colores cálidos, branding
  // Redirige a /app/dashboard
}

// src/components/auth/AdminLogin.tsx - Para staff
export function AdminLogin() {
  // Diseño profesional, colores corporativos
  // Redirige a /panel/dashboard
}
```

### 4. Enrutador Inteligente por Roles

```typescript
// src/components/auth/RoleBasedRouter.tsx
export function RoleBasedRouter({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  // Redirigir según rol y ruta actual
  if (user?.role === 'CLIENTE') {
    // Clientes no pueden acceder a rutas /panel/*
    if (location.pathname.startsWith('/panel')) {
      return <Navigate to="/app/dashboard" replace />;
    }
  } else if (user?.role !== 'CLIENTE') {
    // Staff no puede acceder a rutas /app/*
    if (location.pathname.startsWith('/app')) {
      return <Navigate to="/panel/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
```

### 5. Configuración de Rutas en App.tsx

```typescript
// src/App.tsx (Estructura mejorada)
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/menu" element={<PublicMenu />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* AUTENTICACIÓN */}
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<CustomerRegister />} />
          
          {/* RUTAS PROTEGIDAS - CLIENTES */}
          <Route path="/app/*" element={
            <ProtectedRoute requiredRoles={['CLIENTE']}>
              <CustomerLayout>
                <Routes>
                  <Route path="dashboard" element={<CustomerDashboard />} />
                  <Route path="menu" element={<InteractiveMenu />} />
                  <Route path="orders" element={<MyOrders />} />
                  <Route path="favorites" element={<MyFavorites />} />
                  <Route path="profile" element={<CustomerProfile />} />
                  <Route path="support" element={<CustomerSupport />} />
                </Routes>
              </CustomerLayout>
            </ProtectedRoute>
          } />
          
          {/* RUTAS PROTEGIDAS - STAFF/ADMIN */}
          <Route path="/panel/*" element={
            <ProtectedRoute requiredRoles={['OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN']}>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="operations" element={<OperationsPage />} />
                  <Route path="sales" element={<SalesPage />} />
                  {/* ... resto de rutas administrativas */}
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* REDIRECCIONES Y 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
```

## 🎨 Diseño y Experiencia de Usuario

### Landing Page Comercial

#### Hero Section
```typescript
// Componente principal de la landing
<HeroSection>
  <Heading size="4xl">Bienvenido a La Gigante</Heading>
  <Text size="lg">Las mejores pizzas de la ciudad, ahora con pedidos online</Text>
  <ButtonGroup>
    <Button size="lg" colorScheme="orange">Ver Menú</Button>
    <Button size="lg" variant="outline">Hacer Pedido</Button>
  </ButtonGroup>
</HeroSection>
```

#### Características Visuales
- **Colores primarios**: Naranjas y rojos (appetite appeal)
- **Tipografía**: Amigable y legible (Poppins o similar)
- **Imágenes**: Fotos apetitosas de productos
- **CTA prominentes**: "Ver Menú", "Hacer Pedido"
- **Testimonios**: Reseñas reales de clientes

### Portal Cliente (`/app/*`)

#### Dashboard Personalizado
```typescript
<CustomerDashboard>
  <WelcomeCard name={user.full_name} />
  <QuickActions>
    <ActionCard icon={MenuIcon} title="Ver Menú" href="/app/menu" />
    <ActionCard icon={OrderIcon} title="Hacer Pedido" href="/app/menu" />
    <ActionCard icon={HistoryIcon} title="Mis Pedidos" href="/app/orders" />
  </QuickActions>
  <RecentOrders />
  <FavoriteProducts />
  <LoyaltyProgram />
</CustomerDashboard>
```

#### Características
- **Navegación simplificada**: Solo módulos relevantes para clientes
- **Colores cálidos**: Paleta que estimula el apetito
- **Información personal**: Pedidos, favoritos, puntos de lealtad
- **Acciones rápidas**: Fácil acceso a funciones principales

### Portal Administrativo (`/panel/*`)

#### Dashboard Operativo
```typescript
<AdminDashboard>
  <MetricsGrid>
    <MetricCard title="Ventas Hoy" value={salesToday} />
    <MetricCard title="Órdenes Activas" value={activeOrders} />
    <MetricCard title="Stock Crítico" value={lowStockItems} />
  </MetricsGrid>
  <QuickActions role={user.role} />
  <RecentActivity />
  <SystemAlerts />
</AdminDashboard>
```

#### Características
- **Colores profesionales**: Azules y grises
- **Métricas en tiempo real**: KPIs operativos
- **Acciones contextuales**: Según rol del usuario
- **Alertas del sistema**: Notificaciones importantes

## 🔒 Seguridad y Autenticación

### Mejoras de Seguridad

#### 1. Separación de Contextos
```typescript
// Contextos separados para mejor seguridad
export function CustomerAuthProvider({ children }) {
  // Lógica específica para clientes
  // Validaciones adicionales para compras
  // Límites de sesión más cortos
}

export function AdminAuthProvider({ children }) {
  // Lógica específica para staff
  // Validaciones de permisos avanzadas
  // Logging de acciones administrativas
}
```

#### 2. Guards de Ruta Mejorados
```typescript
export function CustomerRouteGuard({ children }) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'CLIENTE') return <Navigate to="/panel/dashboard" />;
  if (!user.emailVerified) return <EmailVerificationPrompt />;
  
  return <>{children}</>;
}

export function AdminRouteGuard({ children, requiredRoles }) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/admin/login" />;
  if (user.role === 'CLIENTE') return <Navigate to="/app/dashboard" />;
  if (!requiredRoles.includes(user.role)) return <AccessDenied />;
  
  return <>{children}</>;
}
```

#### 3. Configuración JWT Mejorada
```sql
-- Hook personalizado para separar contextos
CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  user_role text;
  user_context text;
BEGIN
  -- Obtener rol del usuario
  SELECT role INTO user_role
  FROM auth.users_roles
  WHERE user_id = (event->>'user_id')::uuid
  AND is_active = true;
  
  -- Determinar contexto
  user_context := CASE 
    WHEN user_role = 'CLIENTE' THEN 'customer'
    ELSE 'admin'
  END;
  
  -- Agregar claims específicos
  event := jsonb_set(
    event,
    '{claims,user_role}',
    to_jsonb(user_role)
  );
  
  event := jsonb_set(
    event,
    '{claims,user_context}',
    to_jsonb(user_context)
  );
  
  RETURN event;
END;
$$;
```

## 📱 Layouts Responsivos

### Layout del Cliente
```typescript
// src/layouts/CustomerLayout.tsx
export function CustomerLayout({ children }) {
  return (
    <div className="customer-layout">
      <CustomerNavBar />
      <main className="customer-main">{children}</main>
      <CustomerBottomNav /> {/* Solo en móvil */}
      <CustomerFooter />
    </div>
  );
}
```

### Layout Administrativo
```typescript
// src/layouts/AdminLayout.tsx
export function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminHeader />
      <div className="admin-body">
        <AdminSidebar />
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
```

## 🚀 Plan de Implementación

### Fase 1: Estructura Base (Semana 1)
1. **Crear componentes de landing page comercial**
   - Hero Section con branding atractivo
   - Sección de menú destacado
   - Testimonios y galería
   - Footer comercial

2. **Separar componentes de autenticación**
   - CustomerLogin con diseño comercial
   - AdminLogin con diseño profesional
   - Registro de clientes optimizado

3. **Implementar rutas base**
   - Configurar rutas públicas (`/`, `/menu`, `/about`)
   - Separar rutas de autenticación
   - Crear redirecciones inteligentes

### Fase 2: Portales Diferenciados (Semana 2)
1. **Portal del Cliente (`/app/*`)**
   - Dashboard personalizado para clientes
   - Navegación simplificada
   - Menú interactivo para pedidos
   - Seguimiento de órdenes en tiempo real

2. **Portal Administrativo (`/panel/*`)**
   - Migrar funcionalidad actual
   - Mantener toda la lógica operativa
   - Mejorar dashboard con métricas en tiempo real

3. **Layouts responsivos**
   - CustomerLayout con navegación móvil optimizada
   - AdminLayout manteniendo sidebar actual

### Fase 3: Seguridad y Optimización (Semana 3)
1. **Mejoras de seguridad**
   - Implementar guards de ruta específicos
   - Separar contextos de autenticación
   - Configurar JWT con claims específicos

2. **Optimización de rendimiento**
   - Lazy loading por contexto
   - Code splitting entre portales
   - Optimización de imágenes y assets

3. **Testing y QA**
   - Tests de flujos de usuario
   - Validación de seguridad
   - Tests de rendimiento

### Fase 4: Features Avanzadas (Semana 4)
1. **Funcionalidades del cliente**
   - Sistema de favoritos
   - Programa de lealtad básico
   - Notificaciones push para pedidos

2. **Funcionalidades administrativas**
   - Dashboard de métricas en tiempo real
   - Sistema de alertas avanzado
   - Reportes automáticos

3. **Integraciones**
   - Pagos online para clientes
   - Notificaciones SMS/WhatsApp
   - Analytics de comportamiento

## 🛡️ Consideraciones de Seguridad

### Separación de Dominios
- **Subdominios opcionales**: `admin.lagigante.com.ar` vs `www.lagigante.com.ar`
- **Headers de seguridad**: CSP específicos por contexto
- **Cookies separadas**: Diferentes dominios/paths

### Validaciones Específicas
```typescript
// Validaciones para clientes
const customerValidations = {
  maxOrderValue: 5000,
  dailyOrderLimit: 3,
  sessionTimeout: 30, // minutos
};

// Validaciones para staff
const staffValidations = {
  mfaRequired: true,
  sessionTimeout: 480, // minutos
  ipWhitelist: process.env.ADMIN_IPS?.split(','),
};
```

### Monitoreo y Logging
```typescript
// Logging diferenciado
export function logCustomerAction(action: string, data: any) {
  logger.info('Customer action', {
    context: 'customer',
    action,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function logAdminAction(action: string, data: any, user: User) {
  logger.warn('Admin action', {
    context: 'admin',
    action,
    user: user.id,
    role: user.role,
    data,
    timestamp: new Date().toISOString(),
  });
}
```

## 🎯 Métricas de Éxito

### Para Clientes
- **Tasa de conversión**: Landing → Registro → Primer pedido
- **Tiempo promedio**: Desde login hasta completar pedido
- **Abandono de carrito**: Reducir tasa actual
- **Satisfacción**: NPS y reviews in-app

### Para Staff
- **Eficiencia operativa**: Tiempo promedio por tarea
- **Errores de proceso**: Reducir errores humanos
- **Adopción**: Uso de nuevas funcionalidades
- **Tiempo de entrenamiento**: Para nuevos empleados

## 📚 Recursos y Referencias

### Documentación Técnica
- [Chakra UI v3 Components](https://chakra-ui.com/)
- [React Router v6 Guide](https://reactrouter.com/)
- [Supabase Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

### Inspiración de Diseño
- **B2C Restaurants**: DoorDash, Uber Eats, Rappi
- **B2B Admin Panels**: Stripe Dashboard, Shopify Admin
- **Hybrid Systems**: Square POS, Toast

### Herramientas de Desarrollo
- **Testing**: Cypress para E2E, React Testing Library
- **Performance**: Lighthouse, Web Vitals
- **Security**: OWASP guidelines, security headers

---

## 🎉 Conclusión

Este rediseño del sistema de login y experiencia de usuario transformará G-Admin Mini en una plataforma verdaderamente profesional que ofrece:

1. **Experiencia comercial atractiva** para clientes finales
2. **Portal administrativo eficiente** para el staff
3. **Separación clara de responsabilidades** y seguridad
4. **Escalabilidad** para futuras funcionalidades
5. **Mantenibilidad** mejorada del código

La implementación seguirá las mejores prácticas modernas de desarrollo web, asegurando una experiencia de usuario excepcional tanto para clientes como para el personal administrativo.

---

*Documento creado para G-Admin Mini - Sistema de Gestión Restaurantera*
*Versión 1.0 - Agosto 2025*
