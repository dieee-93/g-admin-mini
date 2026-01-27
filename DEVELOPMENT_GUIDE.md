# 🚀 Guía de Desarrollo - G-Mini

## ✅ Configuración Actual (Enero 2025)

Este proyecto usa un **servidor Express local** para desarrollo de API functions, siguiendo el patrón validado de la comunidad: **[vite-express-vercel](https://github.com/internetdrew/vite-express-vercel)**

---

## 🎯 Comandos de Desarrollo

### Desarrollo Frontend Solo (Sin APIs)
```bash
pnpm dev
```
- ✅ Vite en puerto 5173
- ✅ HMR ultra-rápido
- ⚠️ Las llamadas a `/api/*` fallarán (sin servidor API)

### Desarrollo Completo (Frontend + APIs) ⭐ **Recomendado**
```bash
pnpm dev:full
```
- ✅ Vite en puerto 5173
- ✅ Express API server en puerto 3000
- ✅ Proxy automático: `/api/*` → `localhost:3000`
- ✅ HMR ultra-rápido
- ✅ **Todas las funciones API funcionando**

### Solo Servidor API
```bash
pnpm dev:api
```
Útil para debugging específico de las APIs.

---

## 🔧 Cómo Funciona

### Arquitectura de Desarrollo

```
Browser → http://localhost:5173/api/mercadopago/test
          ↓
Vite Dev Server (5173)
          ↓ [proxy]
Express Dev Server (3000)
          ↓
/api/mercadopago/test.ts (tu función)
          ↓
Tu código en src/modules/... (imports funcionan)
```

### En Producción (Vercel)

```
Browser → Vercel CDN
          ↓
/api/mercadopago/test
          ↓
Serverless Function (generada automáticamente)
```

**Cero cambios necesarios** - Vercel detecta `/api` automáticamente.

---

## 📁 Estructura del Proyecto

```
g-mini/
├── api/                          # Vercel API Functions
│   ├── mercadopago/
│   │   ├── create-preference.ts
│   │   └── test-connection.ts
│   ├── modo/
│   │   └── generate-qr.ts
│   ├── qr/
│   │   └── generate-interoperable.ts
│   └── webhooks/
│       ├── mercadopago.ts
│       └── modo.ts
├── dev-server.js                 # 🆕 Express dev server
├── src/                          # Frontend code
│   └── modules/
│       └── finance-integrations/ # Servicios compartidos
└── vite.config.ts                # Proxy configurado
```

---

## 🧪 Probando las APIs

### En el Frontend

```typescript
// Desde cualquier componente
const response = await fetch('/api/mercadopago/test-connection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    access_token: 'TEST-xxx',
    test_mode: true
  })
});

const data = await response.json();
console.log(data);
```

### Desde el Navegador (Console)

```javascript
// Abre la consola (F12) y ejecuta:
fetch('/api/mercadopago/test-connection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    access_token: 'TU_TOKEN_DE_PRUEBA',
    test_mode: true
  })
})
  .then(r => r.json())
  .then(console.log)
```

### Con cURL

```bash
curl -X POST http://localhost:5173/api/mercadopago/test-connection \
  -H "Content-Type: application/json" \
  -d '{"access_token":"TEST-xxx","test_mode":true}'
```

---

## 🐛 Troubleshooting

### "Cannot find module '@/lib/...'"

✅ **Resuelto** - El servidor Express usa Node.js que resuelve los path aliases correctamente via `tsconfig.json`.

### "API endpoint no responde"

1. Verifica que `pnpm dev:full` esté corriendo
2. Revisa la consola del servidor API (debería mostrar el log del request)
3. Verifica que la función esté en `/api` con extensión `.ts` o `.js`

### "CORS error"

El servidor dev incluye headers CORS automáticamente. Si ves este error:
- Reinicia el servidor: `Ctrl+C` y luego `pnpm dev:full`
- Verifica que el puerto 3000 no esté en uso

### Port 3000 en uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## ⚙️ Configuración Técnica

### vite.config.ts
```typescript
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

### dev-server.js
- Escanea `/api` recursivamente
- Registra rutas automáticamente
- Maneja errores con stack traces
- Soporta imports de `src/modules/*`
- Path aliases (`@/...`) funcionan

---

## 🚀 Deploy a Vercel

Cuando hagas deploy, **no necesitas cambiar nada**:

```bash
# Deploy a producción
vercel --prod

# Deploy a preview
vercel
```

Vercel automáticamente:
- ✅ Detecta el framework Vite
- ✅ Convierte `/api` a serverless functions
- ✅ Aplica la configuración de `vercel.json`

---

## 📊 Comparación con Otras Soluciones

| Solución | Setup | Performance | APIs | Complejidad |
|----------|-------|-------------|------|-------------|
| **dev-server.js** | ✅ Simple | ⚡⚡⚡ | ✅ Todas | Baja |
| vercel dev | Ninguno | 🐌 Lento | ✅ Todas | Baja |
| vite-plugin-vercel-api | Fácil | ⚡⚡ | ❌ Limitado | Media |
| vite-plugin-vercel | Medio | ⚡⚡ | ⚠️ SSR only | Alta |

---

## 🔗 Referencias

- **[vite-express-vercel](https://github.com/internetdrew/vite-express-vercel)** - Patrón base usado
- **[Vercel Discussion #6538](https://github.com/vercel/vercel/discussions/6538)** - Problemas con `vercel dev`
- **[Vite Proxy Config](https://vite.dev/config/server-options.html#server-proxy)** - Documentación oficial
- **[Vercel Functions](https://vercel.com/docs/functions)** - Docs de Vercel

---

## ⚡ Resumen

**Para desarrollo diario:**
```bash
pnpm dev:full
```

**Abrir:**
- Frontend: http://localhost:5173
- API health: http://localhost:3000/health

**Deploy:**
```bash
vercel --prod
```

¡Todo listo! 🎉
