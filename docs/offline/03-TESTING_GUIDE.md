# Service Worker & Background Sync - Manual Testing Guide

Complete manual testing guide for Phase 4: Service Worker + Background Sync API

---

## Prerequisites

1. **Build app in production mode** (Service Workers only work in production):
   ```bash
   npm run build
   npm run preview
   ```

2. **Chrome DevTools** (Best browser support for Background Sync)

3. **Test user credentials** ready

---

## Test Suite 1: Service Worker Registration

### Test 1.1: Verify Service Worker Registers

**Steps:**
1. Open app in Chrome
2. Open DevTools → **Application** tab
3. Select **Service Workers** in sidebar

**Expected:**
- Service Worker status: **Activated and running**
- Script URL: `/service-worker.js`
- Scope: `/`
- Status: Green dot (active)

**Screenshot location:**
```
Chrome DevTools → Application → Service Workers
```

---

### Test 1.2: Verify Background Sync Support

**Steps:**
1. Open DevTools → **Console**
2. Run command:
   ```javascript
   'sync' in ServiceWorkerRegistration.prototype
   ```

**Expected:**
- Returns `true` in Chrome
- Returns `false` in Firefox/Safari (graceful fallback)

---

## Test Suite 2: Offline Sync with App Open

### Test 2.1: Create Material Offline → Online Sync

**Steps:**
1. Navigate to Materials page
2. Open DevTools → **Network** tab
3. Check **Offline** checkbox (simulate offline)
4. Click "Nuevo Material"
5. Fill form: Name = "Test Offline Material", Type = "Measurable", Cost = 150
6. Submit form
7. Verify material appears in list (optimistic UI)
8. Open DevTools → **Application** → **IndexedDB** → `g_admin_offline` → `sync_queue`
9. Verify command in queue with status = "pending"
10. Uncheck **Offline** (go online)
11. Wait 2-3 seconds

**Expected:**
- ✅ Material appears immediately (optimistic)
- ✅ Command saved to IndexedDB
- ✅ After going online, command syncs
- ✅ IndexedDB queue becomes empty
- ✅ Reload page → material still exists (server-side)

---

### Test 2.2: Update Material Offline → Online Sync

**Steps:**
1. Select existing material
2. Go offline (DevTools → Network → Offline)
3. Click "Editar"
4. Change name to "Updated Offline"
5. Submit
6. Verify IndexedDB has UPDATE command
7. Go online
8. Wait 2-3 seconds

**Expected:**
- ✅ UI updates immediately
- ✅ UPDATE command in IndexedDB
- ✅ After online, command syncs
- ✅ Reload → updated name persists

---

### Test 2.3: Delete Material Offline → Online Sync

**Steps:**
1. Go offline
2. Click delete on a material
3. Confirm deletion
4. Verify material disappears (optimistic)
5. Check IndexedDB for DELETE command
6. Go online
7. Wait 2-3 seconds

**Expected:**
- ✅ Material disappears immediately
- ✅ DELETE command in IndexedDB
- ✅ After online, command syncs
- ✅ Reload → material still gone

---

## Test Suite 3: Background Sync (App Closed)

### Test 3.1: Background Sync Registration

**Steps:**
1. Go offline
2. Create 2 materials offline
3. Open DevTools → **Application** → **Service Workers**
4. Look for **Sync** section

**Expected:**
- ✅ Sync tag registered: `offline-sync-queue`
- ✅ Status shows "Pending"

**Screenshot:**
```
DevTools → Application → Service Workers → Sync
```

---

### Test 3.2: Sync with Page Closed (Critical Test)

**Steps:**
1. Clear all data:
   - DevTools → Application → Clear storage → Clear site data
2. Reload app and login
3. Navigate to Materials
4. Go offline
5. Create material: "Background Sync Test"
6. Verify command in IndexedDB queue
7. **CLOSE THE TAB** (not just refresh!)
8. Connect to internet (uncheck offline if using DevTools)
9. Wait 1 minute
10. Open new tab → navigate to materials page

**Expected:**
- ✅ Material "Background Sync Test" exists in server
- ✅ IndexedDB queue is empty
- ✅ Service Worker synced in background without app open!

**Note:** This is the KEY feature of Phase 4. If this works, background sync is functioning correctly.

---

### Test 3.3: Sync on Browser Restart

**Steps:**
1. Go offline
2. Create material offline
3. **Close entire browser** (Ctrl+Shift+Q or Cmd+Q)
4. Wait 10 seconds
5. Open browser
6. Navigate to app
7. Check materials page

**Expected:**
- ✅ Material exists (synced by SW on reconnect)
- ✅ Queue is empty

---

## Test Suite 4: Error Handling

### Test 4.1: Network Error Retry

**Steps:**
1. Go offline
2. Create material
3. Open DevTools → **Application** → **IndexedDB** → `sync_queue`
4. Note the command
5. Go online BUT disconnect from network at OS level (WiFi off)
6. Wait 1 minute
7. Check IndexedDB

**Expected:**
- ✅ Command status changes to "failed"
- ✅ `retryCount` increments
- ✅ `nextRetryAt` timestamp set (exponential backoff)
- ✅ After WiFi reconnects, retry succeeds

---

### Test 4.2: Max Retries Exceeded

**Steps:**
1. Simulate persistent network failure
2. Let command retry 3 times (max retries)
3. Check IndexedDB

**Expected:**
- ✅ Status = "failed"
- ✅ `retryCount` = 3
- ✅ `lastError` contains error details
- ✅ Command stays in queue (not deleted)

---

### Test 4.3: Foreign Key Error

**Steps:**
1. Manually insert invalid command in IndexedDB:
   ```javascript
   // DevTools Console
   const request = indexedDB.open('g_admin_offline', 1);
   request.onsuccess = () => {
     const db = request.result;
     const tx = db.transaction('sync_queue', 'readwrite');
     const store = tx.objectStore('sync_queue');

     store.add({
       entityType: 'sale_items',
       entityId: 'test-id',
       operation: 'CREATE',
       data: {
         id: 'test-id',
         sale_id: 'non-existent-sale', // Invalid FK
         product_id: 'fake-product',
         quantity: 1,
         unit_price: 100
       },
       status: 'pending',
       retryCount: 0,
       timestamp: new Date().toISOString(),
       priority: 999
     });
   };
   ```
2. Go online
3. Wait for sync
4. Check IndexedDB

**Expected:**
- ✅ Status = "failed"
- ✅ `lastError.type` = "foreign_key"
- ✅ Error message contains constraint violation

---

## Test Suite 5: Multiple Operations

### Test 5.1: Batch Sync

**Steps:**
1. Go offline
2. Create 5 materials rapidly
3. Update 2 existing materials
4. Delete 1 material
5. Verify 8 commands in IndexedDB
6. Go online
7. Monitor DevTools → **Console**

**Expected:**
- ✅ All 8 commands sync sequentially
- ✅ Console logs: "Sync completed: 8 success, 0 failed"
- ✅ Queue becomes empty
- ✅ All operations reflected in UI

---

### Test 5.2: Priority Ordering

**Steps:**
1. Go offline
2. Create sale (priority 3)
3. Create material (priority 1)
4. Create customer (priority 0)
5. Check IndexedDB → `sync_queue`
6. Go online

**Expected:**
- ✅ Commands stored with correct priorities
- ✅ Sync order: customer → material → sale
- ✅ All succeed

---

## Test Suite 6: Cache Invalidation

### Test 6.1: TanStack Query Cache Refresh

**Steps:**
1. Open Materials page
2. Note number of materials
3. Open SECOND tab with same page
4. In Tab 1: Go offline → Create material → Close tab
5. In Tab 2: Keep open
6. Wait for background sync
7. Observe Tab 2

**Expected:**
- ✅ Tab 2 automatically refreshes (cache invalidated)
- ✅ New material appears without manual refresh
- ✅ Console log: "All queries invalidated after sync"

---

## Test Suite 7: Performance

### Test 7.1: No Excessive Re-renders

**Steps:**
1. Open Materials page
2. Open DevTools → **Performance** tab
3. Start recording
4. Wait 10 seconds (do nothing)
5. Stop recording
6. Analyze flame chart

**Expected:**
- ✅ Almost no activity during idle time
- ✅ No render cycles every 2 seconds (old polling behavior)
- ✅ Only renders on actual events

---

### Test 7.2: Battery Impact (Mobile)

**Steps:**
1. Open app on mobile device
2. Go offline → Create 10 operations
3. Close app
4. Monitor battery usage over 1 hour

**Expected:**
- ✅ Background sync uses < 1% battery
- ✅ No continuous polling detected
- ✅ Sync happens opportunistically (WiFi, charging)

---

## Test Suite 8: Browser Compatibility

### Test 8.1: Chrome (Full Support)

**Expected:**
- ✅ Service Worker registers
- ✅ Background Sync API available
- ✅ All tests pass

---

### Test 8.2: Firefox (Partial Support)

**Expected:**
- ✅ Service Worker registers
- ⚠️ Background Sync API NOT available
- ✅ Graceful fallback to event-driven sync
- ✅ Console message: "Background Sync API not supported - using fallback"
- ✅ Sync still works when app is open

---

### Test 8.3: Safari (Limited Support)

**Expected:**
- ⚠️ Service Worker support varies by version
- ❌ Background Sync API not available
- ✅ App still works (event-driven fallback)
- ✅ No errors in console

---

## Debugging Tools

### Chrome DevTools Commands

```javascript
// Check Service Worker status
navigator.serviceWorker.controller

// Check Background Sync support
'sync' in ServiceWorkerRegistration.prototype

// Get registered sync tags
navigator.serviceWorker.ready.then(reg => reg.sync.getTags())

// Force manual sync (for testing)
navigator.serviceWorker.controller.postMessage({ type: 'MANUAL_SYNC' })

// View IndexedDB queue
// DevTools → Application → IndexedDB → g_admin_offline → sync_queue

// Clear Service Worker
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()))
```

---

## Common Issues & Solutions

### Issue: Service Worker not registering

**Solution:**
1. Ensure running in production mode (`npm run build && npm run preview`)
2. Check browser console for errors
3. Verify `/service-worker.js` exists in `public/` folder
4. Try hard refresh (Ctrl+Shift+R)

---

### Issue: Background Sync not working

**Solution:**
1. Verify browser support (Chrome only)
2. Check DevTools → Application → Service Workers → Sync section
3. Ensure Service Worker is active
4. Check console for permission errors

---

### Issue: Commands not syncing

**Solution:**
1. Check IndexedDB → `sync_queue` table
2. Verify command status
3. Check `lastError` field for details
4. Verify Supabase credentials in Service Worker
5. Check network tab for failed requests

---

## Success Criteria

Phase 4 is successful if:

- ✅ Service Worker registers in production
- ✅ Background Sync registers when operations queued
- ✅ Sync works with app CLOSED (key feature)
- ✅ Graceful fallback in unsupported browsers
- ✅ No errors in console
- ✅ TanStack Query cache invalidates after sync
- ✅ No performance regressions (no polling)

---

## Next Steps After Testing

1. **If all tests pass:**
   - Deploy to staging
   - Monitor for 1 week
   - Deploy to production

2. **If tests fail:**
   - Check Service Worker logs
   - Verify IndexedDB schema
   - Test in different browsers
   - Review error messages

3. **Production monitoring:**
   - Track sync success rate
   - Monitor Service Worker crashes
   - Watch for IndexedDB quota errors
   - Measure user engagement (offline users)

---

**Last Updated:** 2026-02-03
**Phase:** 4 - Progressive Enhancement
**Status:** Testing
