import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OfflineDB } from '../OfflineDB';
import type { OfflineCommand } from '../types';

describe('OfflineDB', () => {
  let db: OfflineDB;

  beforeEach(() => {
    db = new OfflineDB();
  }, 10000);

  afterEach(async () => {
    // Close the database connection first
    if (db && (db as any).db) {
      (db as any).db.close();
    }

    // Clean up IndexedDB
    const deleteRequest = indexedDB.deleteDatabase('g_admin_offline');
    await new Promise<void>((resolve) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve(); // Still resolve to continue
      deleteRequest.onblocked = () => {
        console.warn('Database deletion blocked');
        resolve();
      };
    });

    // Small delay to ensure cleanup completes
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  it('should initialize IndexedDB with correct schema', async () => {
    await db.init();

    // Verify database exists
    const databases = await indexedDB.databases();
    const ourDb = databases.find(d => d.name === 'g_admin_offline');
    expect(ourDb).toBeDefined();
    expect(ourDb?.version).toBe(1);
  });

  it('should add command to queue', async () => {
    await db.init();

    const command: Omit<OfflineCommand, 'id'> = {
      entityType: 'materials',
      entityId: '01934f2a-8c76-7890-abcd-123456789abc',
      operation: 'CREATE',
      data: { id: '01934f2a-8c76-7890-abcd-123456789abc', name: 'Test Material' },
      timestamp: new Date().toISOString(),
      priority: 1,
      status: 'pending',
      retryCount: 0
    };

    const id = await db.addCommand(command);
    expect(id).toBeGreaterThan(0);
  }, 10000);

  it('should prevent duplicate operations', async () => {
    await db.init();

    const command: Omit<OfflineCommand, 'id'> = {
      entityType: 'materials',
      entityId: '01934f2a-test',
      operation: 'CREATE',
      data: { id: '01934f2a-test', name: 'Duplicate Test' },
      timestamp: new Date().toISOString(),
      priority: 1,
      status: 'pending',
      retryCount: 0
    };

    const id1 = await db.addCommand(command);
    const id2 = await db.addCommand(command); // Same command

    expect(id1).toBeGreaterThan(0);
    expect(id2).toBe(-1); // Indicates duplicate
  });

  it('should get pending commands ordered by priority then timestamp', async () => {
    await db.init();

    // Add commands with different priorities
    await db.addCommand({
      entityType: 'sales',
      entityId: 'id1',
      operation: 'CREATE',
      data: {},
      timestamp: '2026-01-29T10:00:00.000Z',
      priority: 3,
      status: 'pending',
      retryCount: 0
    });

    await db.addCommand({
      entityType: 'materials',
      entityId: 'id2',
      operation: 'CREATE',
      data: {},
      timestamp: '2026-01-29T10:01:00.000Z',
      priority: 1,
      status: 'pending',
      retryCount: 0
    });

    const commands = await db.getPendingCommands();

    expect(commands).toHaveLength(2);
    expect(commands[0].priority).toBe(1); // Materials first (lower priority number)
    expect(commands[1].priority).toBe(3); // Sales second
  });

  it('should update command status', async () => {
    await db.init();

    const id = await db.addCommand({
      entityType: 'materials',
      entityId: 'id1',
      operation: 'CREATE',
      data: {},
      timestamp: new Date().toISOString(),
      priority: 1,
      status: 'pending',
      retryCount: 0
    });

    await db.updateCommand(id, { status: 'syncing' });

    const commands = await db.getPendingCommands();
    expect(commands).toHaveLength(0); // No longer pending
  });

  it('should delete command', async () => {
    await db.init();

    const id = await db.addCommand({
      entityType: 'materials',
      entityId: 'id1',
      operation: 'CREATE',
      data: {},
      timestamp: new Date().toISOString(),
      priority: 1,
      status: 'pending',
      retryCount: 0
    });

    await db.deleteCommand(id);

    const commands = await db.getPendingCommands();
    expect(commands).toHaveLength(0);
  });
});
