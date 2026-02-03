# Cómo Testear el Service Worker (SIN BUILD)

## Método 1: Script en Console (Recomendado - 2 minutos) ⚡

### Paso 1: Copia el script de testing
Abre: `scripts/test-service-worker.js`

### Paso 2: Abre Chrome DevTools
1. Abre tu app en Chrome (puede ser en desarrollo: `npm run dev`)
2. Presiona F12 (DevTools)
3. Ve a la pestaña **Console**

### Paso 3: Pega y ejecuta
1. Copia TODO el contenido de `scripts/test-service-worker.js`
2. Pégalo en la Console
3. Ejecuta: `await testServiceWorker()`

### Resultado Esperado:
```
🧪 Starting Service Worker Tests...

📋 Test 1: Service Worker Support
✅ Service Worker API available

📋 Test 2: Background Sync API Support
✅ Background Sync API available (Full PWA support)

📋 Test 3: Service Worker Registration
❌ Service Worker registered (En dev, es normal que NO esté)

...

📊 TEST SUMMARY
==================================================
✅ Passed: 5
❌ Failed: 2
📈 Success Rate: 71.4%
```

**Nota:** En desarrollo (`npm run dev`), es NORMAL que el Service Worker NO esté registrado. El script detecta esto y muestra qué funciona y qué no.

---

## Método 2: Inspección Manual (5 minutos)

### Verificar si Service Worker está disponible:

```javascript
// En Console
'serviceWorker' in navigator
// Debe retornar: true
```

### Verificar Background Sync:

```javascript
'sync' in ServiceWorkerRegistration.prototype
// Chrome: true
// Firefox/Safari: false (es normal)
```

### Ver IndexedDB Queue:

1. DevTools → **Application** tab
2. Sidebar izquierdo → **Storage** → **IndexedDB**
3. Expande `g_admin_offline`
4. Click en `sync_queue`
5. Verás los comandos pendientes (si hay)

---

## Método 3: Test Unit Automatizado (Ya existe)

Ejecuta los tests que ya creamos:

```bash
npm test ServiceWorkerRegistration.test.ts
```

**Qué testea:**
- Soporte de Service Worker API
- Soporte de Background Sync API
- Registro exitoso/fallido
- Eventos de lifecycle
- Comunicación con SW

---

## Método 4: Simulación de Offline (10 minutos)

### Simular operación offline:

1. **Abre la app** (`npm run dev`)
2. **Ve a Materials** (o cualquier módulo con offline support)
3. **Abre DevTools** → **Network** tab
4. **Check "Offline"** (simula offline)
5. **Crea un material**:
   - Nombre: "Test Offline"
   - Tipo: Measurable
   - Costo: 100
6. **Verifica en Console**:
   ```javascript
   // Ver comandos en queue
   const db = await new Promise(resolve => {
     const req = indexedDB.open('g_admin_offline', 1);
     req.onsuccess = () => resolve(req.result);
   });

   const tx = db.transaction('sync_queue', 'readonly');
   const store = tx.objectStore('sync_queue');
   const req = store.getAll();
   req.onsuccess = () => console.log('Queue:', req.result);
   ```

7. **Uncheck "Offline"** (vuelve online)
8. **Espera 2 segundos**
9. **Verifica que el queue se vació** (repite el comando anterior)

### Resultado Esperado:
- Offline: Material aparece en UI (optimistic)
- Offline: Comando en IndexedDB queue
- Online: Queue se vacía automáticamente
- Online: Material persiste en servidor

---

## Método 5: Verificar Supabase Credentials (Solo si testeas sync real)

El Service Worker necesita credenciales de Supabase. Verifica en:

`public/service-worker.js` líneas 147-148:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co'; // ← CAMBIAR
const SUPABASE_ANON_KEY = 'your-anon-key'; // ← CAMBIAR
```

**Si no están configuradas:**
El SW funcionará pero el sync real fallará. Para testing básico, no es necesario.

---

## Qué Esperar en Desarrollo vs Producción

### En Desarrollo (`npm run dev`):

| Feature | Estado | Razón |
|---------|--------|-------|
| Service Worker | ❌ NO registrado | Solo funciona en producción |
| Background Sync | ❌ NO disponible | Depende del SW |
| IndexedDB Queue | ✅ Funciona | Independiente del SW |
| Event-driven sync | ✅ Funciona | Fallback automático |
| executeWithOfflineSupport | ✅ Funciona | Helper funciona siempre |

**Conclusión:** En desarrollo, el **sistema offline funciona** pero **sin Service Worker**. Usa event-driven sync (online/offline events).

### En Producción (build):

| Feature | Estado |
|---------|--------|
| Service Worker | ✅ Registrado |
| Background Sync | ✅ Chrome/Edge |
| IndexedDB Queue | ✅ Funciona |
| Event-driven sync | ✅ Funciona |
| Sync con app cerrada | ✅ Funciona (solo producción) |

---

## Quick Test Checklist

Copia esto en Console y verifica:

```javascript
// ✅ Test 1: APIs disponibles
console.log('SW Support:', 'serviceWorker' in navigator);
console.log('BG Sync Support:', 'sync' in ServiceWorkerRegistration.prototype);

// ✅ Test 2: IndexedDB accesible
indexedDB.open('g_admin_offline', 1).onsuccess = (e) => {
  console.log('✅ IndexedDB OK');
};

// ✅ Test 3: Queue instance
import('@/lib/offline').then(m => {
  m.getOfflineQueue().then(q => console.log('✅ Queue OK', q));
});

// ✅ Test 4: Network detection
console.log('Online:', navigator.onLine);
```

---

## FAQ

### ¿Por qué no se registra el Service Worker en desarrollo?

**Respuesta:** Por diseño. Los Service Workers solo funcionan en:
- HTTPS (producción)
- localhost (pero solo con build de producción)

En desarrollo (`npm run dev`), Vite no registra Service Workers para evitar conflictos y facilitar hot reload.

### ¿Cómo testeo el sync en background entonces?

**Respuesta:** Tienes 2 opciones:

1. **Testing de integración** (sin SW):
   - Testea `OfflineCommandQueue` directamente
   - Testea `executeWithOfflineSupport()`
   - Testea IndexedDB queue
   - Ya tienes los tests: `npm test offline`

2. **Testing real de SW**:
   - Necesitas build de producción
   - O usa el script de Console para verificar APIs

### ¿El offline sync funciona sin Service Worker?

**Respuesta:** ¡SÍ! El sistema tiene **graceful fallback**:
- Sin SW: Usa event-driven sync (online/offline events)
- Con SW: Usa Background Sync API (sync con app cerrada)

En desarrollo todo funciona, solo que NO puede sincronizar con app cerrada.

---

## Comandos Útiles

```javascript
// Ver todos los Service Workers registrados
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log('Registrations:', regs));

// Unregister all (para limpiar)
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()));

// Ver queue stats
import('@/lib/offline').then(async m => {
  const queue = await m.getOfflineQueue();
  const stats = await queue.getStats();
  console.log('Queue Stats:', stats);
});

// Forzar sync manual
import('@/lib/offline').then(async m => {
  const queue = await m.getOfflineQueue();
  await queue.replayCommands();
  console.log('Sync triggered');
});
```

---

## Resultado del Testing

Si ejecutas el script de Console en desarrollo, deberías ver algo como:

```
🧪 Starting Service Worker Tests...

✅ Service Worker API available
✅ Background Sync API available (si estás en Chrome)
❌ Service Worker registered (normal en dev)
✅ IndexedDB queue accessible (0 commands in queue)
⚠️  Background sync tag registered (skipped - no SW)
❌ Service Worker communication (normal en dev)
✅ Network status detected (Online)

📊 TEST SUMMARY
==================================================
✅ Passed: 4
❌ Failed: 3
📈 Success Rate: 57.1%

⚠️  Some tests failed. Check details above.
```

**Esto es NORMAL en desarrollo.** Lo importante es que:
- ✅ APIs están disponibles
- ✅ IndexedDB funciona
- ✅ Network detection funciona

---

**¿Listo?** Ejecuta el script de testing ahora mismo en tu Console y dame los resultados! 🚀
