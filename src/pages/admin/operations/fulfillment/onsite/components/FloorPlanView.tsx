/**
 * FloorPlanView - Interactive floor plan with optimized drag & drop
 * 
 * Optimizations applied (see docs/optimization/dndkit-best-practices.md):
 * - DragOverlay for smooth dragging and scroll handling
 * - Announcements for screen reader accessibility
 * - Memoized content components
 * - Hardware acceleration
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Grid, Stack, Typography } from '@/shared/ui';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragStartEvent,
  Announcements,
  UniqueIdentifier
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

// Module imports (following project conventions)
import { useFloorManagement, useOnsiteEventListeners } from '@/modules/onsite/hooks';
import type { Table, SeatPartyData, TableStatus } from '@/modules/onsite/types';

// Local components
import { SortableTableCard, TableCardContent } from './SortableTableCard';
import { TableDetailsModal } from './TableDetailsModal';
import { SeatPartyModal } from './SeatPartyModal';
import { BillModal } from './BillModal';

// Sales integration
import { SaleFormModal } from '@/pages/admin/operations/sales/components/SaleFormModal';
import type { OnsiteSaleContext } from '@/modules/onsite/events';

// Toast for notifications
import { toaster } from '@/shared/ui/toaster';

// Payment types
import type { PaymentMethod } from '@/pages/admin/operations/sales/types';

// ============================================
// ANNOUNCEMENTS FOR SCREEN READERS
// ============================================

const announcements: Announcements = {
  onDragStart({ active }) {
    return `Arrastrando mesa ${active.id}. Usa las flechas para mover.`;
  },
  onDragOver({ active, over }) {
    if (over) {
      return `Mesa ${active.id} sobre posición de mesa ${over.id}`;
    }
    return undefined;
  },
  onDragEnd({ active, over }) {
    if (over && active.id !== over.id) {
      return `Mesa ${active.id} movida a posición de mesa ${over.id}`;
    }
    return `Mesa ${active.id} devuelta a su posición original`;
  },
  onDragCancel({ active }) {
    return `Arrastre cancelado. Mesa ${active.id} volvió a su posición original.`;
  },
};

// ============================================
// COMPONENT
// ============================================

export interface FloorPlanViewProps {
  refreshTrigger?: number;
}

export function FloorPlanView({ refreshTrigger }: FloorPlanViewProps) {
  // Use orchestration hook
  const {
    tables,
    loading,
    error,
    updateStatus,
    seatParty,
    reorderTables,
    completeParty
  } = useFloorManagement({ refreshTrigger, realtime: true });

  // Activate event listeners for sales integration
  useOnsiteEventListeners({ enabled: true });

  // Drag state for DragOverlay
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Modal State - Store only ID to keep reference fresh
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [salesModalOpen, setSalesModalOpen] = useState(false);
  const [saleInitialContext, setSaleInitialContext] = useState<OnsiteSaleContext | undefined>(undefined);

  // Derive selected table from current tables array (always fresh)
  const selectedTable = useMemo(() => {
    if (!selectedTableId) return null;
    return tables.find(t => t.id === selectedTableId) || null;
  }, [selectedTableId, tables]);

  // Get the active table for DragOverlay
  const activeTable = useMemo(() => {
    if (!activeId) return null;
    return tables.find(t => t.id === activeId) || null;
  }, [activeId, tables]);

  // DND Sensors with sortableKeyboardCoordinates for a11y
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Handlers
  const handleOpenView = useCallback((table: Table) => {
    setSelectedTableId(table.id);
    setViewModalOpen(true);
  }, []);

  const handleOpenSeat = useCallback((table: Table) => {
    setSelectedTableId(table.id);
    setSeatModalOpen(true);
  }, []);

  const handleStatusChange = useCallback(async (tableId: string, newStatus: TableStatus | string): Promise<void> => {
    await updateStatus(tableId, newStatus);
  }, [updateStatus]);

  const handleMarkReady = useCallback(async (table: Table) => {
    await updateStatus(table.id, 'available');
  }, [updateStatus]);

  // Handler for taking order from a table (opens POS with table pre-selected)
  const handleTakeOrder = useCallback((table: Table) => {
    if (!table.current_party) {
      toaster.error({ title: 'Sin comensales', description: 'Esta mesa no tiene un grupo activo.' });
      return;
    }

    // Set the initial context for SaleFormModal
    const context: OnsiteSaleContext = {
      type: 'onsite',
      tableId: table.id,
      tableNumber: table.number,
      partyId: table.current_party.id,
      partySize: table.current_party.size,
      customerName: table.current_party.customer_name
    };

    setSaleInitialContext(context);
    setSalesModalOpen(true);
  }, []);

  const handleSeatParty = useCallback(async (tableId: string, partyData: SeatPartyData): Promise<void> => {
    await seatParty(tableId, partyData);
  }, [seatParty]);

  const handleOpenBill = useCallback((table: Table) => {
    if (!table.current_party) {
      toaster.error({ title: 'Sin comensales', description: 'Esta mesa no tiene un grupo activo.' });
      return;
    }
    setSelectedTableId(table.id);
    setBillModalOpen(true);
  }, []);

  const handlePaymentComplete = useCallback(async (payments: PaymentMethod[]) => {
    if (selectedTable?.current_party) {
      try {
        await completeParty(selectedTable.current_party.id, selectedTable.id, payments);
        toaster.success({
          title: '✅ Pago procesado',
          description: `Mesa ${selectedTable.number} liberada correctamente.`
        });
      } catch (err) {
        toaster.error({ title: 'Error al cerrar mesa', description: String(err) });
      }
    }
    setBillModalOpen(false);
    setSelectedTableId(null);
  }, [selectedTable, completeParty]);

  const handlePaymentError = useCallback((error: string) => {
    toaster.error({ title: 'Error de pago', description: error });
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = tables.findIndex((t) => t.id === active.id);
      const newIndex = tables.findIndex((t) => t.id === over.id);
      const newOrder = arrayMove(tables, oldIndex, newIndex);
      reorderTables(newOrder);
    }
  }, [tables, reorderTables]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // Memoized table IDs for SortableContext
  const tableIds = useMemo(() => tables.map(t => t.id), [tables]);

  // Loading state
  if (loading && !tables.length) {
    return (
      <Stack direction="row" align="center" justify="center" h="50vh">
        <Typography>Cargando mesas...</Typography>
      </Stack>
    );
  }

  // Error state
  if (error && !tables.length) {
    return (
      <Stack direction="row" align="center" justify="center" h="50vh">
        <Typography color="red.500">Error: {error}</Typography>
      </Stack>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        accessibility={{ announcements }}
      >
        <SortableContext
          items={tableIds}
          strategy={rectSortingStrategy}
        >
          <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap="6">
            {tables.map((table) => (
              <SortableTableCard
                key={table.id}
                table={table}
                onOpenView={handleOpenView}
                onOpenSeat={handleOpenSeat}
                onOpenBill={handleOpenBill}
                onMarkReady={handleMarkReady}
                onTakeOrder={handleTakeOrder}
              />
            ))}
          </Grid>
        </SortableContext>

        {/* DragOverlay - Renders the dragged item outside normal flow */}
        <DragOverlay
          dropAnimation={{
            duration: 250,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
        >
          {activeTable && (
            <div style={{
              width: 300,
              cursor: 'grabbing',
              willChange: 'transform',
              backfaceVisibility: 'hidden'
            }}>
              <TableCardContent
                table={activeTable}
                onOpenView={handleOpenView}
                onOpenSeat={handleOpenSeat}
                onOpenBill={handleOpenBill}
                onMarkReady={handleMarkReady}
                onTakeOrder={handleTakeOrder}
                isDragging
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TableDetailsModal
        table={selectedTable}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        onStatusChange={handleStatusChange}
      />

      <SeatPartyModal
        table={selectedTable}
        isOpen={seatModalOpen}
        onClose={() => setSeatModalOpen(false)}
        onSeatParty={handleSeatParty}
      />

      {selectedTable?.current_party && (
        <BillModal
          isOpen={billModalOpen}
          onClose={() => setBillModalOpen(false)}
          table={selectedTable}
          party={selectedTable.current_party}
          onPaymentComplete={handlePaymentComplete}
          onPaymentError={handlePaymentError}
        />
      )}

      {/* POS Modal - Opens when taking order from table */}
      <SaleFormModal
        isOpen={salesModalOpen}
        onClose={() => {
          setSalesModalOpen(false);
          setSaleInitialContext(undefined);
        }}
        initialContext={saleInitialContext}
      />
    </>
  );
}
