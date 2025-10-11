# 🚀 Instrucciones Rápidas - Custom Access Token Hook

## PASO 1: Ejecutar en Supabase SQL Editor

### 1.1 Verificación Previa (CORREGIDO)
```sql
-- Copiar y pegar: database/pre_hook_verification.sql
```

**Resultado esperado**:
- ✅ Current User: Tu UUID y email
- ✅ users_roles table exists: `true`
- ✅ user_role enum exists: `CLIENTE, OPERADOR, SUPERVISOR, ADMINISTRADOR, SUPER_ADMIN`
- ✅ Your current role: `SUPER_ADMIN`

---

### 1.2 Crear Custom Access Token Hook
```sql
-- Copiar y pegar: database/setup_custom_access_token_hook.sql
```

**Resultado esperado**: `Success. No rows returned`

---

## PASO 2: Habilitar en Dashboard

1. **Supabase Dashboard** → **Authentication** → **Hooks**
2. Buscar **"Custom Access Token Hook"**
3. ✅ **Enable Hook** (toggle)
4. **Function Name**: `custom_access_token_hook`
5. **Schema**: `public`
6. Click **Save**

---

## PASO 3: Reiniciar Sesión

En G-Admin Mini:
1. Sign Out (cerrar sesión)
2. Sign In (iniciar sesión)

---

## PASO 4: Verificar JWT

En **Supabase SQL Editor** (mientras estás logueado):

```sql
-- Debe retornar SUPER_ADMIN
SELECT (auth.jwt() ->> 'user_role')::text as user_role_from_jwt;
```

**Resultado esperado**: `SUPER_ADMIN`

---

## PASO 5: Probar Sales Module

1. Ve a `/admin/sales`
2. Debe cargar sin errores 400
3. Verifica Network tab: requests → 200 OK

---

## 🐛 Si algo sale mal

Ejecuta diagnóstico completo:
```sql
-- Copiar y pegar: database/diagnostic_rls_issue.sql
```

Y mándame los resultados.

---

## ✅ Confirmación de Éxito

Si ves:
- ✅ JWT tiene `user_role: "SUPER_ADMIN"`
- ✅ Sales module carga sin errores
- ✅ Network requests: 200 OK

**¡Listo!** El hook está funcionando correctamente 🎉
