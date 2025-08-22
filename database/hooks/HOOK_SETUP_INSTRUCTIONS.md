# Custom Access Token Hook - Instrucciones de Configuración

## 1. Ejecutar el SQL del Hook

### Opción A: Supabase Dashboard
1. Ve a tu proyecto en https://app.supabase.com
2. Navega a **SQL Editor**
3. Ejecuta el contenido de `custom_access_token_hook.sql`
4. Ejecuta el contenido de `setup_hook_configuration.sql`

### Opción B: Supabase CLI
```bash
supabase db push
# o
npx supabase db push
```

## 2. Configurar el Hook en Supabase

### Método 1: Dashboard (Recomendado)
1. Ve a **Authentication > Settings**
2. Busca la sección **Custom Access Token Hook**
3. Configura:
   - **Hook URL**: `pg-functions://custom_access_token_hook`
   - **Enable**: ✅ Activado

### Método 2: Supabase CLI
```bash
# Crear configuración local
echo 'auth.hook.custom_access_token.enabled = true' >> supabase/config.toml
echo 'auth.hook.custom_access_token.uri = "pg-functions://custom_access_token_hook"' >> supabase/config.toml

# Aplicar configuración
npx supabase db push
```

### Método 3: API Management
```bash
curl -X PATCH 'https://api.supabase.com/v1/projects/YOUR_PROJECT_ID/config/auth' \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "HOOK_CUSTOM_ACCESS_TOKEN_ENABLED": true,
    "HOOK_CUSTOM_ACCESS_TOKEN_URI": "pg-functions://custom_access_token_hook"
  }'
```

## 3. Verificar Configuración

### Verificar función existe:
```sql
SELECT EXISTS (
  SELECT 1 FROM pg_proc p 
  JOIN pg_namespace n ON p.pronamespace = n.oid 
  WHERE n.nspname = 'public' AND p.proname = 'custom_access_token_hook'
);
```

### Probar el hook:
```sql
SELECT public.test_custom_access_token_hook('USER_ID_AQUI');
```

### Verificar en el frontend:
```typescript
// El JWT debería contener los claims personalizados
console.log(session?.access_token); // Decodificar para ver claims
```

## 4. Troubleshooting

### Hook no se ejecuta:
1. Verificar que la configuración está activa
2. Verificar permisos de la función
3. Revisar logs de Supabase

### Errores de permisos:
```sql
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
```

### Datos inconsistentes:
```sql
-- Verificar datos en users_roles
SELECT user_id, role, is_active FROM public.users_roles WHERE is_active = true;
```

## 5. Seguridad

- El hook solo lee datos, no modifica
- Maneja errores gracefully con roles por defecto  
- Los claims están firmados en el JWT
- RLS policies siguen aplicando normalmente
