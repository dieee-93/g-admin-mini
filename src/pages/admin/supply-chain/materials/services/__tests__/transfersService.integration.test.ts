/**
 * Integration Tests: InventoryTransfersService
 *
 * Tests the complete transfer workflow against Supabase database.
 * Requires valid Supabase connection and test data setup.
 *
 * NOTE: These tests are SKIPPED by default to avoid hitting production database.
 * To run: Remove .skip from describe() and ensure test database is configured.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { InventoryTransfersService, type Transfer } from '../transfersService';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

describe.skip('InventoryTransfersService Integration', () => {
  let testItemId: string;
  let testLocationA: string;
  let testLocationB: string;
  let transferId: string;

  beforeAll(async () => {
    // Setup test data
    logger.debug('TransfersService.integration.test', 'Setting up test data...');

    // Create test locations
    const { data: locationA, error: locAError } = await supabase
      .from('locations')
      .insert({ name: 'Test Location A', address: 'Test Address A' })
      .select()
      .single();

    if (locAError) throw locAError;
    testLocationA = locationA.id;
    logger.error('TransfersService.integration.test', `Created location A: ${testLocationA}`);

    const { data: locationB, error: locBError } = await supabase
      .from('locations')
      .insert({ name: 'Test Location B', address: 'Test Address B' })
      .select()
      .single();

    if (locBError) throw locBError;
    testLocationB = locationB.id;
    logger.error('TransfersService.integration.test', `Created location B: ${testLocationB}`);

    // Create test item in location A
    const { data: item, error: itemError } = await supabase
      .from('materials')
      .insert({
        name: 'Test Transfer Item',
        type: 'COUNTABLE',
        unit: 'unidad',
        stock: 100,
        unit_cost: 10,
        min_stock: 5,
        location_id: testLocationA,
        is_active: true
      })
      .select()
      .single();

    if (itemError) throw itemError;
    testItemId = item.id;
    logger.error('TransfersService.integration.test', `Created test item: ${testItemId} with stock: 100`);
  });

  afterAll(async () => {
    // Cleanup test data
    logger.debug('TransfersService.integration.test', 'Cleaning up test data...');

    if (testItemId) {
      await supabase.from('materials').delete().eq('id', testItemId);
      logger.debug('TransfersService.integration.test', `Deleted test item: ${testItemId}`);
    }

    if (testLocationA) {
      await supabase.from('locations').delete().eq('id', testLocationA);
      logger.debug('TransfersService.integration.test', `Deleted location A: ${testLocationA}`);
    }

    if (testLocationB) {
      await supabase.from('locations').delete().eq('id', testLocationB);
      logger.debug('TransfersService.integration.test', `Deleted location B: ${testLocationB}`);
    }
  });

  // ============================================
  // Complete Transfer Workflow Test
  // ============================================
  it('should complete full transfer workflow: initiate → approve → receive', async () => {
    logger.info('TransfersService.integration.test', '\n=== TEST: Complete Transfer Workflow ===');

    // STEP 1: Initiate transfer
    logger.info('TransfersService.integration.test', 'Step 1: Initiating transfer...');
    const transfer = await InventoryTransfersService.initiateTransfer({
      from_location_id: testLocationA,
      to_location_id: testLocationB,
      item_id: testItemId,
      quantity: 30,
      notes: 'Integration test transfer'
    });

    expect(transfer).toBeDefined();
    expect(transfer.status).toBe('pending');
    expect(transfer.quantity).toBe(30);
    expect(transfer.from_location_id).toBe(testLocationA);
    expect(transfer.to_location_id).toBe(testLocationB);
    expect(transfer.item_id).toBe(testItemId);

    transferId = transfer.id;
    logger.info('TransfersService.integration.test', `Transfer initiated: ${transferId} with status: ${transfer.status}`);

    // Verify source stock unchanged (transfer just pending)
    const { data: sourceItemAfterInit } = await supabase
      .from('materials')
      .select('stock')
      .eq('id', testItemId)
      .eq('location_id', testLocationA)
      .single();

    expect(sourceItemAfterInit?.stock).toBe(100); // Still 100, not deducted yet
    logger.info('TransfersService.integration.test', `Source stock after init: ${sourceItemAfterInit?.stock} (unchanged)`);

    // STEP 2: Approve transfer
    logger.debug('TransfersService.integration.test', '\nStep 2: Approving transfer...');
    const approvedTransfer = await InventoryTransfersService.approveTransfer({
      transferId,
      approved: true,
      notes: 'Approved for testing'
    });

    expect(approvedTransfer.status).toBe('in_transit');
    expect(approvedTransfer.approved_by).toBeDefined();
    expect(approvedTransfer.approved_at).toBeDefined();
    logger.debug('TransfersService.integration.test', `Transfer approved: status=${approvedTransfer.status}`);

    // Verify source stock deducted
    const { data: sourceItemAfterApprove } = await supabase
      .from('materials')
      .select('stock')
      .eq('id', testItemId)
      .eq('location_id', testLocationA)
      .single();

    expect(sourceItemAfterApprove?.stock).toBe(70); // 100 - 30 = 70
    logger.debug('TransfersService.integration.test', `Source stock after approve: ${sourceItemAfterApprove?.stock} (deducted)`);

    // STEP 3: Receive transfer
    logger.debug('TransfersService.integration.test', '\nStep 3: Receiving transfer...');
    const receivedTransfer = await InventoryTransfersService.receiveTransfer({
      transferId,
      quantity_received: 30, // All items received
      notes: 'Received in good condition'
    });

    expect(receivedTransfer.status).toBe('received');
    expect(receivedTransfer.received_by).toBeDefined();
    expect(receivedTransfer.received_at).toBeDefined();
    logger.debug('TransfersService.integration.test', `Transfer received: status=${receivedTransfer.status}`);

    // Verify destination stock added
    const { data: destItem } = await supabase
      .from('materials')
      .select('stock')
      .eq('id', testItemId)
      .eq('location_id', testLocationB)
      .single();

    expect(destItem?.stock).toBe(30); // Item created with 30 units
    logger.debug('TransfersService.integration.test', `Destination stock after receive: ${destItem?.stock}`);

    // Verify source stock still 70
    const { data: sourceItemFinal } = await supabase
      .from('materials')
      .select('stock')
      .eq('id', testItemId)
      .eq('location_id', testLocationA)
      .single();

    expect(sourceItemFinal?.stock).toBe(70);
    logger.debug('TransfersService.integration.test', `Source stock final: ${sourceItemFinal?.stock}`);

    logger.info('TransfersService.integration.test', '=== TEST COMPLETE ===\n');
  }, 30000); // 30 second timeout for database operations

  // ============================================
  // Rejection Workflow Test
  // ============================================
  it('should reject transfer and not modify stock', async () => {
    logger.debug('TransfersService.integration.test', '\n=== TEST: Reject Transfer Workflow ===');

    // Initiate transfer
    const transfer = await InventoryTransfersService.initiateTransfer({
      from_location_id: testLocationA,
      to_location_id: testLocationB,
      item_id: testItemId,
      quantity: 10,
      notes: 'Transfer to be rejected'
    });

    logger.info('TransfersService.integration.test', `Transfer initiated: ${transfer.id}`);

    // Get stock before rejection
    const { data: stockBefore } = await supabase
      .from('materials')
      .select('stock')
      .eq('id', testItemId)
      .eq('location_id', testLocationA)
      .single();

    logger.debug('TransfersService.integration.test', `Stock before rejection: ${stockBefore?.stock}`);

    // Reject transfer
    const rejectedTransfer = await InventoryTransfersService.approveTransfer({
      transferId: transfer.id,
      approved: false,
      notes: 'Rejected for testing'
    });

    expect(rejectedTransfer.status).toBe('cancelled');
    logger.debug('TransfersService.integration.test', `Transfer rejected: status=${rejectedTransfer.status}`);

    // Verify stock unchanged
    const { data: stockAfter } = await supabase
      .from('materials')
      .select('stock')
      .eq('id', testItemId)
      .eq('location_id', testLocationA)
      .single();

    expect(stockAfter?.stock).toBe(stockBefore?.stock);
    logger.debug('TransfersService.integration.test', `Stock after rejection: ${stockAfter?.stock} (unchanged)`);

    logger.info('TransfersService.integration.test', '=== TEST COMPLETE ===\n');
  }, 30000);

  // ============================================
  // Validation Tests
  // ============================================
  it('should prevent transfer with insufficient stock', async () => {
    logger.debug('TransfersService.integration.test', '\n=== TEST: Insufficient Stock Validation ===');

    await expect(
      InventoryTransfersService.initiateTransfer({
        from_location_id: testLocationA,
        to_location_id: testLocationB,
        item_id: testItemId,
        quantity: 1000, // More than available (70 remaining from previous tests)
        notes: 'Should fail'
      })
    ).rejects.toThrow(/Insufficient stock/i);

    logger.error('TransfersService.integration.test', 'Validation passed: Cannot transfer more than available');
    logger.error('TransfersService.integration.test', '=== TEST COMPLETE ===\n');
  }, 30000);

  it('should prevent transfer to same location', async () => {
    logger.debug('TransfersService.integration.test', '\n=== TEST: Same Location Validation ===');

    await expect(
      InventoryTransfersService.initiateTransfer({
        from_location_id: testLocationA,
        to_location_id: testLocationA, // Same location!
        item_id: testItemId,
        quantity: 10,
        notes: 'Should fail'
      })
    ).rejects.toThrow(/same location/i);

    logger.error('TransfersService.integration.test', 'Validation passed: Cannot transfer to same location');
    logger.error('TransfersService.integration.test', '=== TEST COMPLETE ===\n');
  }, 30000);

  it('should prevent receiving transfer that is not in_transit', async () => {
    logger.error('TransfersService.integration.test', '\n=== TEST: Invalid Status for Receive ===');

    // Create a pending transfer
    const transfer = await InventoryTransfersService.initiateTransfer({
      from_location_id: testLocationA,
      to_location_id: testLocationB,
      item_id: testItemId,
      quantity: 5,
      notes: 'Pending transfer'
    });

    // Try to receive without approving first
    await expect(
      InventoryTransfersService.receiveTransfer({
        transferId: transfer.id,
        quantity_received: 5
      })
    ).rejects.toThrow(/cannot be received/i);

    logger.error('TransfersService.integration.test', 'Validation passed: Cannot receive transfer not in_transit');
    logger.error('TransfersService.integration.test', '=== TEST COMPLETE ===\n');
  }, 30000);

  // ============================================
  // Query Tests
  // ============================================
  it('should retrieve transfers by location', async () => {
    logger.debug('TransfersService.integration.test', '\n=== TEST: Get Transfers by Location ===');

    // Get all transfers for location A (should have several from previous tests)
    const outgoingTransfers = await InventoryTransfersService.getTransfersByLocation(
      testLocationA,
      'outgoing'
    );

    expect(outgoingTransfers).toBeDefined();
    expect(Array.isArray(outgoingTransfers)).toBe(true);
    expect(outgoingTransfers.length).toBeGreaterThan(0);

    logger.debug('TransfersService.integration.test', `Found ${outgoingTransfers.length} outgoing transfers from location A`);

    // Get incoming transfers for location B
    const incomingTransfers = await InventoryTransfersService.getTransfersByLocation(
      testLocationB,
      'incoming'
    );

    expect(incomingTransfers).toBeDefined();
    expect(incomingTransfers.length).toBeGreaterThan(0);

    logger.debug('TransfersService.integration.test', `Found ${incomingTransfers.length} incoming transfers to location B`);

    // Get all transfers for location A (both incoming and outgoing)
    const allTransfers = await InventoryTransfersService.getTransfersByLocation(
      testLocationA,
      'all'
    );

    expect(allTransfers.length).toBeGreaterThanOrEqual(outgoingTransfers.length);

    logger.debug('TransfersService.integration.test', `Found ${allTransfers.length} total transfers for location A`);
    logger.info('TransfersService.integration.test', '=== TEST COMPLETE ===\n');
  }, 30000);
});

/**
 * To run these integration tests:
 *
 * 1. Remove .skip from describe()
 * 2. Ensure Supabase connection is configured (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 * 3. Ensure test database has necessary tables (items, locations, inventory_transfers)
 * 4. Run: pnpm test transfersService.integration
 *
 * IMPORTANT: These tests will create and delete real data in the database.
 * Use a test/staging database, NOT production.
 */
