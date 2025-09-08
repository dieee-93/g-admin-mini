# 🗄️ GUÍA DE CONFIGURACIÓN DE BASE DE DATOS - G-ADMIN MINI

## 🚨 **SISTEMA DE BLOQUEO IMPLEMENTADO**

A partir de ahora, **g-admin NO permitirá avanzar** hasta que la base de datos esté correctamente configurada. Esto garantiza:

- ✅ **Evitar errores en producción**
- ✅ **Datos consistentes y seguros**
- ✅ **Funcionalidad completa desde el inicio**
- ✅ **Experiencia de usuario sin frustraciones**

---

## 📋 **VERIFICACIONES CRÍTICAS**

### **CAPA 1: INFRAESTRUCTURA CRÍTICA (BLOQUEO TOTAL)**

| Requisito | Descripción | Consecuencia si falla |
|-----------|-------------|----------------------|
| **Conexión Supabase** | Verificar conectividad a la base | 🚫 **BLOQUEO TOTAL** |
| **Tablas Esenciales** | materials, recipes, suppliers, customers, sales, users_roles, system_config | 🚫 **BLOQUEO TOTAL** |
| **Sistema de Roles** | Tabla users_roles y funciones de acceso | 🚫 **BLOQUEO TOTAL** |
| **Políticas RLS** | Row Level Security funcionando | 🚫 **BLOQUEO TOTAL** |
| **Funciones SQL** | get_user_role, check_user_access disponibles | 🚫 **BLOQUEO TOTAL** |

### **CAPA 2: CONFIGURACIÓN MÍNIMA (BLOQUEO PARCIAL)**

| Requisito | Descripción | Consecuencia si falla |
|-----------|-------------|----------------------|
| **Usuario Admin** | Al menos un SUPER_ADMIN o ADMINISTRADOR | ⚠️ **BLOQUEO PARCIAL** |
| **Tabla Config** | system_config accesible | ⚠️ **BLOQUEO PARCIAL** |

### **CAPA 3: CONFIGURACIONES OPCIONALES**

| Requisito | Descripción | Consecuencia si falla |
|-----------|-------------|----------------------|
| **Hooks JWT** | Autenticación JWT configurada | ⚡ **ADVERTENCIA** |
| **Datos Ejemplo** | Materiales básicos para comenzar | ⚡ **ADVERTENCIA** |

---

## 🛠️ **PASOS PARA RESOLVER ERRORES CRÍTICOS**

### **1. Conexión a Supabase**

```bash
# Verificar variables de entorno
cat .env.local

# Debe contener:
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica
```

### **2. Crear Tablas Esenciales**

```sql
-- Ejecutar en el SQL Editor de Supabase:

-- 1. Tabla de roles de usuario
CREATE TYPE user_role AS ENUM ('CLIENTE', 'OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN');

CREATE TABLE IF NOT EXISTS public.users_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'CLIENTE',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tablas esenciales de negocio
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  base_unit TEXT NOT NULL,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  precision_digits INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  yield_quantity INTEGER DEFAULT 1,
  yield_unit TEXT DEFAULT 'porción',
  preparation_time INTEGER DEFAULT 0,
  cooking_time INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id),
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  entry_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **3. Crear Funciones SQL Críticas**

```sql
-- Función para obtener el rol del usuario
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_value TEXT;
BEGIN
  -- Obtener el rol del usuario actual
  SELECT role::TEXT INTO user_role_value
  FROM public.users_roles 
  WHERE user_id = auth.uid() 
    AND is_active = true
  LIMIT 1;
  
  -- Retornar CLIENTE por defecto si no se encuentra rol
  RETURN COALESCE(user_role_value, 'CLIENTE');
END;
$$;

-- Función para verificar acceso
CREATE OR REPLACE FUNCTION public.check_user_access(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_role TEXT;
  role_hierarchy INTEGER;
  required_hierarchy INTEGER;
BEGIN
  current_role := public.get_user_role();
  
  -- Jerarquía de roles
  role_hierarchy := CASE current_role
    WHEN 'CLIENTE' THEN 1
    WHEN 'OPERADOR' THEN 2
    WHEN 'SUPERVISOR' THEN 3
    WHEN 'ADMINISTRADOR' THEN 4
    WHEN 'SUPER_ADMIN' THEN 5
    ELSE 0
  END;
  
  required_hierarchy := CASE required_role
    WHEN 'CLIENTE' THEN 1
    WHEN 'OPERADOR' THEN 2
    WHEN 'SUPERVISOR' THEN 3
    WHEN 'ADMINISTRADOR' THEN 4
    WHEN 'SUPER_ADMIN' THEN 5
    ELSE 0
  END;
  
  RETURN role_hierarchy >= required_hierarchy;
END;
$$;
```

### **4. Configurar Row Level Security**

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE public.users_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_entries ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir acceso a usuarios autenticados por ahora)
CREATE POLICY "Allow authenticated users" ON public.users_roles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON public.system_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON public.materials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON public.suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON public.customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON public.recipes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON public.sales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON public.inventory_entries FOR ALL USING (auth.role() = 'authenticated');
```

### **5. Crear Usuario Administrador**

```sql
-- Después de que un usuario se registre, asignar rol de administrador
INSERT INTO public.users_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'tu-email@example.com' LIMIT 1),
  'SUPER_ADMIN'
);
```

### **6. Configuración Inicial**

```sql
-- Insertar configuración inicial
INSERT INTO public.system_config (key, value, description) VALUES
('company_info', '{"name": "Mi Empresa", "setup_completed": false}', 'Información básica de la empresa'),
('onboarding_completed', 'false', 'Estado del tutorial inicial');
```

---

## 🎯 **VERIFICACIÓN EXITOSA**

Una vez completados estos pasos, el setup wizard debe mostrar:

- ✅ **Conexión a Supabase**: SUCCESS
- ✅ **Tablas Esenciales**: SUCCESS  
- ✅ **Sistema de Roles**: SUCCESS
- ✅ **Políticas RLS**: SUCCESS
- ✅ **Funciones SQL Críticas**: SUCCESS
- ✅ **Usuario Administrador**: SUCCESS
- ✅ **Configuración del Sistema**: SUCCESS

🎉 **¡Listo para continuar con la configuración!**

---

## 🚨 **ERRORES COMUNES Y SOLUCIONES**

### Error: "Error de conexión a Supabase"
**Causa**: Variables de entorno incorrectas
**Solución**: Verificar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

### Error: "Tablas faltantes: materials, recipes..."
**Causa**: Schema no ejecutado
**Solución**: Ejecutar el SQL de creación de tablas

### Error: "Funciones SQL críticas no disponibles"
**Causa**: Funciones get_user_role no creadas
**Solución**: Ejecutar el SQL de creación de funciones

### Error: "No existe ningún usuario administrador activo"
**Causa**: Ningún usuario tiene rol de admin
**Solución**: Asignar rol SUPER_ADMIN a un usuario existente

---

## 📞 **SOPORTE**

Si continúas teniendo problemas:

1. **Verifica el log del navegador** (F12 → Console)
2. **Revisa los logs de Supabase** (Dashboard → Logs)
3. **Consulta la documentación** de Supabase
4. **Contacta al equipo de desarrollo**

**El sistema de bloqueo está diseñado para PROTEGER tu instalación** - no lo omitas ni lo desactives.
