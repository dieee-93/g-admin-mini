# Offline-First Sync System - Design Document

**Date:** 2026-01-29
**Status:** ✅ Design Approved
**Type:** Architecture Redesign

---

## Executive Summary

Redesign of the offline synchronization system to eliminate performance issues caused by polling intervals and implement industry-standard event-driven patterns. The current system causes excessive re-renders (~every 2 seconds) due to `useOfflineStatus` polling. This redesign eliminates all polling, implements proper event-driven sync, and follows production-proven patterns from Workbox, RxDB, and real-world PWA implementations.

---

## Problem Statement

### Current Issues

1. **Performance Bug:** `useOfflineStatus` hook causes re-renders every 2 seconds due to polling intervals
2. **Anti-pattern:** System continuously checks for connection instead of reacting to connection events
3. **Inefficient:** Sync interval runs every 30 seconds regardless of actual network state
4. **No deduplication:** Risk of duplicate operations if network is unstable

### Impact

- Materials page suffers constant re-renders affecting all components
- Wasted CPU/battery on mobile devices
- Poor user experience during offline/online transitions
- Potential data integrity issues

---

## Research & Investigation

### Industry Standards Researched

All decisions validated against real production code:

1. **Client-Generated UUIDs**
   - Source: [Simplifying Offline-First with Client UUIDs (Medium, Jun 2025)](https://medium.com/@maliksaif070/simplifying-offline-first-data-sync-by-generating-remote-ids-locally-cb776fe8485f)
   - Decision: Use UUIDv7 (time-ordered, better index performance)
   - No temporary IDs, client generates final IDs

2. **Event-Driven Sync**
   - Source: [RxDB Replication](https://rxdb.info/replication.html), [Workbox Background Sync](https://developer.chrome.com/docs/workbox/modules/workbox-background-sync)
   - Decision: NO polling, events only (online/offline/visibilitychange)
   - Background Sync API as progressive enhancement

3. **Queue Implementation**
   - Source: [Next.js PWA with Supabase (Medium, Jan 2026)](https://oluwadaprof.medium.com/building-an-offline-first-pwa-notes-app-with-next-js-indexeddb-and-supabase-f861aa3a06f9)
   - Source: [Workbox Queue Source Code (GitHub)](https://github.com/GoogleChrome/workbox/blob/03055e64014a46f6cc977a3a50ad814c6409d36a/packages/workbox-background-sync/src/Queue.ts)
   - Decision: Custom queue (not RxDB - overkill for single-user sessions)

4. **Exponential Backoff**
   - Source: [Queue-Based Exponential Backoff (DEV, 2025)](https://dev.to/andreparis/queue-based-exponential-backoff-a-resilient-retry-pattern-for-distributed-systems-37f3)
   - Formula: `Math.min(maxDelay, Math.pow(2, retryCount) * baseDelay) * (0.5 + Math.random())`
   - Includes jitter to prevent thundering herd

5. **Conflict Resolution**
   - Source: [Optimistic Offline Lock (Martin Fowler)](https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html)
   - Decision: "Server Wins" with notification (simple, covers 99% of cases)
   - Optimistic locking via `updated_at` timestamps

### Pattern Selection: Custom Queue (Level 2)

Three patterns evaluated:

| Pattern | Use Case | Decision |
|---------|----------|----------|
| **Workbox Background Sync** | Simple HTTP retry, no business logic | ❌ Too limited |
| **RxDB** | Multi-user collaboration, full DB replication | ❌ Overkill |
| **Custom Queue** | Business logic validation, single-user sessions | ✅ **Selected** |

**Rationale:**
- ERP has single-user sessions (no real-time collaboration like Google Docs)
- Need validation/permissions before sync (Workbox can't do this)
- Don't need full dataset replication (RxDB overhead)
- Conflicts rare (~1% of operations, same record edited by 2 users)

---

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│  UI Components (no changes)                     │
│  • MaterialsPage, SalesForm, etc.               │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  React Hooks (event-driven refactor)            │
│  • useOfflineStatus (remove intervals)          │
│  • useCreateMaterial (no changes)               │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  Service Layer (minimal wrapper)                │
│  • inventoryApi.createMaterial()                │
│    └─> executeWithOfflineSupport()             │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌──────▼──────────────────────┐
│   Online     │  │  OfflineCommandQueue (NEW)  │
│   Supabase   │  │  • Client UUIDv7            │
│   Direct     │  │  • IndexedDB persistence    │
└──────────────┘  │  • Event-driven sync        │
                  │  • Exponential backoff      │
                  └─────────────────────────────┘
```

### Core Components

#### 1. OfflineDB (IndexedDB Manager)

**File:** `src/lib/offline/OfflineDB.ts`

**Schema:**
```typescript
Store: "sync_queue" {
  keyPath: "id" (autoIncrement)

  Indexes:
  - by-status: status
  - by-entityType: entityType
  - by-timestamp: timestamp
  - by-entityId: entityId
  - by-operation-key: [entityType, entityId, operation] (unique)
}
```

**Key Methods:**
- `addCommand()`: Add to queue with deduplication
- `getPendingCommands()`: Fetch ordered by priority + timestamp
- `updateCommand()`: Update status/retry info
- `deleteCommand()`: Remove completed operations
- `cleanupOldCommands()`: Periodic maintenance

**Pattern:** Based on [Next.js PWA (Jan 2026)](https://oluwadaprof.medium.com/building-an-offline-first-pwa-notes-app-with-next-js-indexeddb-and-supabase-f861aa3a06f9)

#### 2. OfflineCommandQueue (Sync Processor)

**File:** `src/lib/offline/OfflineCommandQueue.ts`

**Responsibilities:**
- Enqueue operations with client-generated UUIDs
- Event-driven sync (no polling)
- Exponential backoff retry logic
- Conflict detection via optimistic locking
- Error classification (network, foreign_key, validation, conflict)

**Sync Triggers (Event-Driven):**
```typescript
1. window.addEventListener('online') → sync immediately
2. document.addEventListener('visibilitychange') → sync on page return
3. Service Worker sync event → Background Sync API (optional)
4. Manual trigger → forceSync() button
```

**Pattern:** [Workbox Queue](https://github.com/GoogleChrome/workbox/blob/main/packages/workbox-background-sync/src/Queue.ts) + [Exponential Backoff](https://dev.to/andreparis/queue-based-exponential-backoff-a-resilient-retry-pattern-for-distributed-systems-37f3)

#### 3. executeWithOfflineSupport() Helper

**File:** `src/lib/offline/helpers.ts`

**Logic:**
```typescript
1. If online → try direct operation
2. If network error → enqueue + return optimistic data
3. If offline → enqueue immediately
```

**Integration:** Minimal changes to existing services (~10 lines)

#### 4. useOfflineStatus Hook (Refactored)

**File:** `src/lib/offline/useOfflineStatus.ts`

**Changes:**
- ❌ Remove: `setInterval()` for status updates
- ❌ Remove: `setInterval()` for network info
- ✅ Add: Event listeners on OfflineQueue events
- ✅ Add: Event-driven state updates

**State Updates:**
- `commandEnqueued` → update queueSize
- `syncStarted` → set isSyncing = true
- `syncCompleted` → update stats, isSyncing = false

---

## Data Flow

### Create Material (Offline → Online)

```
1. User creates Material "Cemento"
   ↓
2. Generate UUIDv7: "01934f2a-..." (final ID)
   ↓
3. executeWithOfflineSupport()
   ├─ Online? Try direct Supabase insert
   │  ├─ Success → return data, emit event
   │  └─ Network error → continue to offline
   └─ Offline → enqueue command
      ↓
4. IndexedDB: Add to sync_queue
   {
     entityType: "materials",
     entityId: "01934f2a-...",
     operation: "CREATE",
     data: { id: "01934f2a-...", name: "Cemento", ... },
     status: "pending",
     priority: 1,
     timestamp: "2026-01-29T10:00:00.000Z"
   }
   ↓
5. Return optimistic data to UI (instant feedback)
   ↓
6. [Network comes back]
   ↓
7. window.addEventListener('online') fires
   ↓
8. OfflineCommandQueue.replayCommands()
   ├─ Get pending commands (ordered by priority + timestamp)
   ├─ For each command:
   │  ├─ Mark as "syncing"
   │  ├─ Execute Supabase operation
   │  ├─ Success → delete from queue, emit event
   │  └─ Failure → retry logic (exponential backoff)
   └─ Emit 'syncCompleted' event
   ↓
9. UI updates via TanStack Query cache invalidation
```

### Conflict Scenario (Rare - 1% of cases)

```
Time 10:00 - Admin A (offline): Edit Material #1 → price = $100
Time 10:01 - Admin B (online):  Edit Material #1 → price = $120
Time 10:05 - Admin A comes online

Sync Process:
1. Fetch server version → { price: $120, updated_at: "10:01" }
2. Compare timestamps:
   - Server: 10:01
   - Client: 10:00
3. Conflict detected → Server version is newer
4. Resolution: "Server Wins"
5. Notify user: "Material was updated by another user"
6. Keep server version ($120)
```

---

## Key Design Decisions

### Decision 1: Client-Generated UUIDs (Not Temporary IDs)

**Alternatives Considered:**
- A) Temporary IDs + server exchange
- B) Client generates UUIDs directly ✅ **Selected**

**Rationale:**
- Industry standard for offline-first (RxDB, PouchDB, PowerSync)
- Eliminates ID resolution complexity
- UUIDv7 provides time-ordering for better DB performance
- Supabase supports UUID primary keys natively

**Source:** [Client-Generated IDs vs Server-Generated (TechYourChance)](https://www.techyourchance.com/client-generated-ids-vs-server-generated-ids/)

### Decision 2: Event-Driven Sync (No Polling)

**Current (Anti-pattern):**
```typescript
setInterval(() => syncIfOnline(), 30000); // Every 30s
setInterval(() => updateStatus(), 2000);  // Every 2s
```

**New (Event-driven):**
```typescript
window.addEventListener('online', syncNow);
document.addEventListener('visibilitychange', syncIfVisible);
```

**Rationale:**
- Eliminates 99% of unnecessary processing
- Instant response to network changes
- Standard pattern in PWAs (Workbox, Service Workers)
- Battery-friendly for mobile

**Source:** [Background Syncs - Microsoft Edge](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/background-syncs)

### Decision 3: Custom Queue (Not RxDB)

**Alternatives Considered:**
- A) Workbox Background Sync → Too limited (HTTP only)
- B) RxDB → Overkill (multi-user collaboration features)
- C) Custom Queue ✅ **Selected**

**Rationale:**
- G-Admin has single-user sessions (not Google Docs-style collaboration)
- Need business logic validation before sync (permissions, calculations)
- Conflicts rare (<1% - different users, different data)
- TanStack Query already handles caching/queries

**Source:** [RxDB Downsides](https://rxdb.info/downsides-of-offline-first.html), [Next.js PWA Example](https://oluwadaprof.medium.com/building-an-offline-first-pwa-notes-app-with-next-js-indexeddb-and-supabase-f861aa3a06f9)

### Decision 4: "Server Wins" Conflict Resolution

**Alternatives Considered:**
- A) Last-Write-Wins → Can lose data
- B) Server Wins + Notification ✅ **Selected**
- C) User Decides (modal) → Can implement later if needed

**Rationale:**
- Conflicts extremely rare (single-user sessions per terminal)
- Simple to implement and understand
- Notification keeps user informed
- Can upgrade to user-decision modal if conflicts increase

**Source:** [Optimistic Offline Lock - Martin Fowler](https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html)

### Decision 5: IndexedDB Ordering Pattern

**Alternatives Considered:**
- A) Compound index `[priority, timestamp]`
- B) Separate indexes + sort in memory ✅ **Selected**

**Rationale:**
- Queue size typically small (<100 items)
- In-memory sort negligible performance impact
- More flexible (can change sort logic without migration)
- Standard pattern in production code

**Source:** [IndexedDB Ordering Discussion (GitHub idb)](https://github.com/jakearchibald/idb/issues/176)

---

## Implementation Strategy

### Phases

**Phase 1: Core Infrastructure** (Day 1-2)
- OfflineDB.ts (IndexedDB manager)
- OfflineCommandQueue.ts (sync processor)
- types.ts (TypeScript interfaces)
- Unit tests for queue operations

**Phase 2: Service Integration** (Day 2-3)
- executeWithOfflineSupport() helper
- Update inventoryApi.ts (materials module)
- Update posApi.ts (sales module)
- Integration tests

**Phase 3: UI Refactor** (Day 3)
- Refactor useOfflineStatus (remove polling)
- Update OfflineSync.ts (remove intervals)
- Add offline indicator component
- E2E tests

**Phase 4: Progressive Enhancement** (Day 4)
- Service Worker setup
- Background Sync API integration
- Fallback handling for unsupported browsers

### Rollout Strategy

1. **Feature Flag:** `ENABLE_OFFLINE_SYNC_V2`
2. **Canary:** Enable for internal testing (1 week)
3. **Gradual Rollout:** 10% → 50% → 100% users
4. **Monitoring:** Track sync success rate, conflict frequency
5. **Rollback Plan:** Disable flag, revert to old `useOfflineStatus`

---

## Testing Strategy

### Unit Tests
- OfflineDB operations (add, update, delete, cleanup)
- Exponential backoff calculation
- Error classification
- Deduplication logic

### Integration Tests
- Create/Update/Delete materials offline
- Sync when connection returns
- Conflict detection and resolution
- Foreign key retry logic

### E2E Tests (Playwright)
- Simulate network toggle (online → offline → online)
- Multiple tabs syncing simultaneously
- Verify no duplicate operations
- Check optimistic UI updates

### Manual Testing Checklist
- [ ] Create material offline → sync when online
- [ ] Update material offline → conflict with server version
- [ ] Delete material offline → sync successfully
- [ ] Rapid online/offline toggling (flaky network)
- [ ] Multiple users editing different materials (no conflict)
- [ ] Multiple users editing SAME material (conflict detection)
- [ ] Battery usage on mobile (compared to polling)

---

## Metrics & Monitoring

### Success Metrics
- **Re-render frequency:** Reduce from ~0.5 renders/sec to 0 (event-only)
- **Sync success rate:** >99% of queued operations sync successfully
- **Conflict rate:** <1% of total operations
- **Battery impact:** <5% increase in battery usage compared to online-only

### Monitoring
- Queue size over time (alert if >50 pending)
- Sync duration (p50, p95, p99)
- Error types distribution (network vs foreign_key vs conflict)
- Retry attempts before success

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| IndexedDB quota exceeded | High | Low | Cleanup old commands (7 days), alert user |
| Browser doesn't support IndexedDB | High | Very Low | Fallback to online-only mode |
| Sync conflicts increase | Medium | Low | Implement user-decision modal |
| Foreign key errors block queue | Medium | Medium | Priority-based ordering, skip and retry later |
| Service Worker registration fails | Low | Medium | Graceful degradation, event-driven sync still works |

---

## Future Enhancements

### V2 Features (Post-MVP)
- User-decision conflict resolution modal
- Batch operations (create 10 materials at once)
- Offline-first for more modules (customers, suppliers)
- Compression for large payloads

### V3 Features (Long-term)
- Multi-device sync (same user, 2 devices)
- Real-time notifications (WebSocket/SSE for server→client updates)
- Offline analytics/reports
- Delta sync (only changed fields, not full records)

---

## References

### Production Code Examples
1. [Next.js PWA with Supabase (Jan 2026)](https://oluwadaprof.medium.com/building-an-offline-first-pwa-notes-app-with-next-js-indexeddb-and-supabase-f861aa3a06f9)
2. [Workbox Queue Source Code](https://github.com/GoogleChrome/workbox/blob/03055e64014a46f6cc977a3a50ad814c6409d36a/packages/workbox-background-sync/src/Queue.ts)
3. [Android Offline-First Sample](https://github.com/jshvarts/OfflineSampleApp)

### Best Practices
4. [Exponential Backoff Implementation](https://advancedweb.hu/how-to-implement-an-exponential-backoff-retry-strategy-in-javascript/)
5. [Queue-Based Exponential Backoff](https://dev.to/andreparis/queue-based-exponential-backoff-a-resilient-retry-pattern-for-distributed-systems-37f3)
6. [Optimistic Offline Lock - Martin Fowler](https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html)

### Official Documentation
7. [Background Sync API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)
8. [Background Syncs - Microsoft Edge](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/background-syncs)
9. [IndexedDB Guide - MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
10. [RxDB Replication](https://rxdb.info/replication.html)

### Architecture Patterns
11. [Client-Generated IDs vs Server-Generated](https://www.techyourchance.com/client-generated-ids-vs-server-generated-ids/)
12. [Offline-First Architecture Design](https://medium.com/@jusuftopic/offline-first-architecture-designing-for-reality-not-just-the-cloud-e5fd18e50a79)
13. [RxDB Downsides of Offline-First](https://rxdb.info/downsides-of-offline-first.html)

---

## Appendix

### A. Current Code Issues

**File:** `src/lib/offline/useOfflineStatus.ts`
```typescript
// ❌ Lines 303-308: Polling anti-pattern
const statusInterval = setInterval(() => {
  updateSyncStatus();      // Every 2 seconds
  updateStorageInfo();
}, 2000);

const networkInterval = setInterval(updateNetworkInfo, 10000); // Every 10s
```

**File:** `src/lib/offline/OfflineSync.ts`
```typescript
// ❌ Lines 338-342: Sync interval polling
this.syncInterval = window.setInterval(() => {
  if (this.isOnline && this.syncQueue.length > 0) {
    this.syncPendingOperations();
  }
}, this.config.syncInterval); // 30 seconds
```

### B. Example Queue Item

```json
{
  "id": 42,
  "entityType": "materials",
  "entityId": "01934f2a-8c76-7890-abcd-123456789abc",
  "operation": "CREATE",
  "data": {
    "id": "01934f2a-8c76-7890-abcd-123456789abc",
    "name": "Cemento Portland",
    "unit_cost": 150.00,
    "stock_quantity": 0,
    "created_at": "2026-01-29T10:00:00.000Z"
  },
  "timestamp": "2026-01-29T10:00:00.000Z",
  "priority": 1,
  "status": "pending",
  "retryCount": 0
}
```

### C. Exponential Backoff Example

```
Retry 0: No delay (immediate)
Retry 1: 1000ms * 2^1 = 2000ms (+ jitter)
Retry 2: 1000ms * 2^2 = 4000ms (+ jitter)
Retry 3: 1000ms * 2^3 = 8000ms (+ jitter)
Max retries: 3
Max delay cap: 32000ms
```

---

**Document Status:** ✅ Design Approved
**Next Step:** Create Implementation Plan using `superpowers:writing-plans`
