/**
 * Service Worker Testing Script
 *
 * Run this script in Chrome DevTools Console to test Service Worker functionality
 *
 * Usage:
 * 1. Open app in Chrome
 * 2. Open DevTools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Run: await testServiceWorker()
 */

window.testServiceWorker = async function() {
  console.log('🧪 Starting Service Worker Tests...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logTest(name, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}`, details);
    results.tests.push({ name, passed, details });
    if (passed) results.passed++;
    else results.failed++;
  }

  // Test 1: Service Worker Support
  console.log('\n📋 Test 1: Service Worker Support');
  const swSupported = 'serviceWorker' in navigator;
  logTest('Service Worker API available', swSupported);

  if (!swSupported) {
    console.log('❌ Service Workers not supported in this browser');
    return results;
  }

  // Test 2: Background Sync Support
  console.log('\n📋 Test 2: Background Sync API Support');
  const bgSyncSupported = 'sync' in ServiceWorkerRegistration.prototype;
  logTest('Background Sync API available', bgSyncSupported, bgSyncSupported ? '(Full PWA support)' : '(Fallback to event-driven)');

  // Test 3: Service Worker Registration
  console.log('\n📋 Test 3: Service Worker Registration');
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const isRegistered = !!registration;
    logTest('Service Worker registered', isRegistered);

    if (isRegistered) {
      console.log('   📄 Scope:', registration.scope);
      console.log('   📦 Active:', !!registration.active);
      console.log('   ⏳ Installing:', !!registration.installing);
      console.log('   ⏸️  Waiting:', !!registration.waiting);
    }
  } catch (error) {
    logTest('Service Worker registration', false, error.message);
  }

  // Test 4: IndexedDB Access
  console.log('\n📋 Test 4: IndexedDB Queue');
  try {
    const dbRequest = indexedDB.open('g_admin_offline', 1);

    await new Promise((resolve, reject) => {
      dbRequest.onsuccess = () => resolve();
      dbRequest.onerror = () => reject(dbRequest.error);
    });

    const db = dbRequest.result;
    const tx = db.transaction('sync_queue', 'readonly');
    const store = tx.objectStore('sync_queue');
    const countRequest = store.count();

    await new Promise((resolve) => {
      countRequest.onsuccess = () => resolve();
    });

    const queueSize = countRequest.result;
    logTest('IndexedDB queue accessible', true, `${queueSize} commands in queue`);

    // Get pending commands
    const pendingRequest = store.index('by-status').getAll('pending');
    await new Promise((resolve) => {
      pendingRequest.onsuccess = () => resolve();
    });

    const pendingCommands = pendingRequest.result || [];
    console.log(`   📊 Pending commands: ${pendingCommands.length}`);

    if (pendingCommands.length > 0) {
      console.log('   📝 First command:', {
        type: pendingCommands[0].entityType,
        operation: pendingCommands[0].operation,
        status: pendingCommands[0].status
      });
    }

    db.close();
  } catch (error) {
    logTest('IndexedDB queue access', false, error.message);
  }

  // Test 5: Background Sync Registration
  console.log('\n📋 Test 5: Background Sync Status');
  if (bgSyncSupported) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const tags = await registration.sync.getTags();
      const hasSyncTag = tags.includes('offline-sync-queue');
      logTest('Background sync tag registered', hasSyncTag, `Tags: ${tags.join(', ') || 'none'}`);
    } catch (error) {
      logTest('Background sync status', false, error.message);
    }
  } else {
    console.log('   ⚠️  Skipped (Background Sync not supported)');
  }

  // Test 6: Service Worker Communication
  console.log('\n📋 Test 6: Service Worker Communication');
  try {
    const registration = await navigator.serviceWorker.ready;

    if (!registration.active) {
      logTest('Service Worker communication', false, 'No active Service Worker');
    } else {
      const messageChannel = new MessageChannel();

      const response = await new Promise((resolve, reject) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };

        setTimeout(() => reject(new Error('Timeout')), 5000);

        registration.active.postMessage(
          { type: 'MANUAL_SYNC' },
          [messageChannel.port2]
        );
      });

      logTest('Service Worker responds to messages', response.success !== undefined, JSON.stringify(response));
    }
  } catch (error) {
    logTest('Service Worker communication', false, error.message);
  }

  // Test 7: Offline Detection
  console.log('\n📋 Test 7: Network Status');
  const isOnline = navigator.onLine;
  logTest('Network status detected', true, isOnline ? 'Online' : 'Offline');

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);

  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Service Worker is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check details above.');
  }

  return results;
};

// Auto-run information
console.log('🧪 Service Worker Test Script Loaded');
console.log('📝 Run: await testServiceWorker()');
console.log('💡 Or copy the function and use it in your tests');
