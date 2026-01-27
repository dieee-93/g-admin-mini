# Service Worker Geocoding API Fix

## 🐛 Problema Original

### Síntoma:
```
🔍 [Georef] Response status: 408 Request Timeout
⏳ [Georef] Retrying in 1000ms...
❌ [Georef] Error: Georef API timeout after 3 attempts
```

### Causa Raíz:
El **Service Worker interceptaba TODAS las requests**, incluyendo APIs de terceros (Georef, Nominatim, USIG).

Cuando la API fallaba, el SW devolvía un error 408 sintético:

```javascript
// public/sw.js (ANTES DEL FIX)
catch (error) {
  return new Response('Network error', {
    status: 408,  // ⬅️ PROBLEMA
  });
}
```

---

## ✅ Solución Implementada

### Industry Standard:
**Service Workers NUNCA deben interceptar APIs de terceros**

Referencias:
- [Workbox (Google)](https://developer.chrome.com/docs/workbox/)
- [Next.js PWA](https://github.com/shadowwalker/next-pwa)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

### Cambios:

#### 1. **Excluir APIs externas del SW** (`public/sw.js`)

```javascript
// 🚨 CRITICAL: Skip external APIs (INDUSTRY STANDARD)
const externalAPIs = [
  'apis.datos.gob.ar',              // Georef AR
  'servicios.usig.buenosaires.gob.ar', // USIG Buenos Aires
  'nominatim.openstreetmap.org',    // Nominatim
  'tile.openstreetmap.org',         // OpenStreetMap tiles
];

if (externalAPIs.some(domain => url.hostname.includes(domain))) {
  console.log(`[SW] Bypassing external API: ${url.hostname}`);
  return; // ✅ Let browser handle it directly
}
```

#### 2. **Auto-desregistrar SW en desarrollo** (`src/lib/offline/index.ts`)

```typescript
// Prevents stale SW from production builds interfering with dev
if (!enableServiceWorker && 'serviceWorker' in navigator) {
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
  }
}
```

---

## 🧪 Testing

### Before Fix:
```bash
curl "https://apis.datos.gob.ar/georef/api/direcciones?direccion=test&max=1"
# ✅ Time: 71ms, Status: 200

# Pero en el navegador:
# ❌ Status: 408 (Service Worker devolviendo error sintético)
```

### After Fix:
```bash
# Navegador:
✅ Status: 200
✅ Time: ~100ms
✅ No retries necesarios
```

---

## 📋 Checklist de Deployment

- [x] Actualizar `public/sw.js` con filtro de APIs externas
- [x] Incrementar versión de cache (`v3.1.2`)
- [x] Agregar auto-desregistro en desarrollo
- [x] Documentar en `SERVICE_WORKER_GEOCODING_FIX.md`
- [ ] Desregistrar SW manualmente en producción (si aplicable)

### Desregistrar SW manualmente:

**Opción 1 - DevTools:**
1. Abrir DevTools (F12)
2. Application → Service Workers
3. Click "Unregister"

**Opción 2 - Console:**
```javascript
navigator.serviceWorker.getRegistrations()
  .then(r => r.forEach(reg => reg.unregister()))
  .then(() => location.reload());
```

---

## 🏭 Best Practices Aplicadas

### ✅ DO:
- Cachear solo recursos de tu propio dominio (`same-origin`)
- Usar `NetworkFirst` para API endpoints propios
- Usar `CacheFirst` para assets estáticos (JS, CSS, fonts)
- Excluir APIs de terceros completamente
- Versionar el cache y limpiar versiones antiguas

### ❌ DON'T:
- Interceptar APIs de terceros
- Devolver errores sintéticos sin contexto
- Cachear responses no-OK
- Usar SW sin versioning
- Dejar SW registrado en desarrollo

---

## 📚 Referencias

- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web.dev: Service Worker Lifecycle](https://web.dev/service-worker-lifecycle/)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
- [CSP with Service Workers](https://content-security-policy.com/service_worker/)

---

## 🔍 Debugging Tips

### Ver requests interceptados por el SW:
```javascript
// En DevTools Console
navigator.serviceWorker.controller?.postMessage({ type: 'DEBUG_REQUESTS' });
```

### Verificar que APIs externas NO se cachean:
```javascript
caches.keys().then(names => {
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(requests => {
        requests.forEach(req => console.log(req.url));
      });
    });
  });
});
```

### Force reload sin SW:
- **Hard refresh**: `Ctrl + Shift + R` (Windows/Linux)
- **Clear cache**: `Ctrl + Shift + Delete`
- **DevTools**: Enable "Bypass for network" en Application → Service Workers

---

**Fecha**: 2025-12-15
**Autor**: Claude + Diego
**Issue**: Georef API 408 timeout errors
**Status**: ✅ Resuelto
