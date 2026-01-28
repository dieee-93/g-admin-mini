/**
 * SortableTableCard - Optimized draggable table card
 * 
 * Performance optimizations applied:
 * - Memoized content component (TableCardContent)
 * - Hardware acceleration CSS (willChange, backfaceVisibility)
 * - Ref forwarding pattern for DragOverlay
 * 
 * @see docs/optimization/dndkit-best-practices.md
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Stack, Typography, Badge, Button, Separator } from '@/shared/ui';
import { Icon } from '@/shared/ui/Icon';
import { EyeIcon, UsersIcon } from '@heroicons/react/24/outline';
import { DecimalUtils } from '@/lib/decimal';

// Module types
import type { Table } from '@/modules/onsite/types';

// Utils
import {
    getStatusColor,
    getStatusBorderColor,
    getStatusBgColor,
    getPriorityIcon,
    formatDuration
} from '../utils';

// ============================================
// TYPES
// ============================================

interface SortableTableCardProps {
    table: Table;
    onOpenView: (table: Table) => void;
    onOpenSeat: (table: Table) => void;
    onOpenBill: (table: Table) => void;
    onMarkReady: (table: Table) => void;
    onTakeOrder?: (table: Table) => void;
}

interface TableCardContentProps {
    table: Table;
    onOpenView: (table: Table) => void;
    onOpenSeat: (table: Table) => void;
    onOpenBill: (table: Table) => void;
    onMarkReady: (table: Table) => void;
    onTakeOrder?: (table: Table) => void;
    isDragging?: boolean;
}

// ============================================
// PRESENTATIONAL COMPONENT (Memoized)
// Used for both SortableItem and DragOverlay
// ============================================

export const TableCardContent = React.memo(function TableCardContent({
    table,
    onOpenView,
    onOpenSeat,
    onOpenBill,
    onMarkReady,
    onTakeOrder,
    isDragging = false
}: TableCardContentProps) {
    const statusString = typeof table.status === 'string' ? table.status : table.status;
    const priorityString = typeof table.priority === 'string' ? table.priority : table.priority;

    return (
        <Box
            borderWidth="2px"
            borderColor={getStatusBorderColor(statusString)}
            borderRadius="xl"
            bg={getStatusBgColor(statusString)}
            shadow={isDragging ? '2xl' : statusString === 'occupied' ? 'lg' : 'md'}
            transition="box-shadow 0.2s ease-in-out"
            _hover={{
                shadow: 'xl',
                borderColor: getStatusBorderColor(statusString).replace('400', '300'),
            }}
            overflow="hidden"
            h="100%"
            opacity={isDragging ? 0.9 : 1}
        >
            <Box bg={getStatusBorderColor(statusString)} h="4px" />

            <Stack direction="column" p="5" gap="4">
                {/* Header */}
                <Stack direction="row" justify="space-between" align="center">
                    <Stack direction="row" align="center" gap="2">
                        <Typography size="2xl" fontWeight="extrabold" color="text.emphasized">
                            Mesa {table.number}
                        </Typography>
                        {getPriorityIcon(priorityString) && (
                            <Typography size="xl">{getPriorityIcon(priorityString)}</Typography>
                        )}
                    </Stack>
                    <Badge size="lg" colorPalette={getStatusColor(statusString)}>
                        {statusString.replace('_', ' ').toUpperCase()}
                    </Badge>
                </Stack>

                {/* Capacity */}
                <Stack direction="row" justify="space-between" align="center">
                    <Stack gap="0" align="start">
                        <Typography size="xs" color="text.muted" fontWeight="bold">CAPACIDAD</Typography>
                        <Stack direction="row" align="center" gap="1">
                            <Icon icon={UsersIcon} size="xs" color="text.muted" />
                            <Typography fontWeight="semibold">{table.capacity} pax</Typography>
                        </Stack>
                    </Stack>
                </Stack>

                {/* Current Party Info */}
                {statusString === 'occupied' && table.current_party && (
                    <>
                        <Separator borderColor="border.subtle" />
                        <Box bg="bg.panel" p="3" borderRadius="md" borderWidth="1px" borderColor="border.subtle">
                            <Stack gap="2">
                                <Stack direction="row" justify="space-between">
                                    <Typography size="sm" fontWeight="bold" color="text.emphasized">
                                        {table.current_party.customer_name || table.current_party.primary_customer_name || 'Walk-in'}
                                    </Typography>
                                    <Typography size="sm" fontWeight="bold" color="green.600">
                                        {DecimalUtils.formatCurrency(table.current_party.total_spent || 0)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justify="space-between" align="center">
                                    <Stack direction="row" align="center" gap="1">
                                        <Typography size="xs" color="text.muted">
                                            {table.current_party.size} pers
                                        </Typography>
                                    </Stack>
                                    <Typography size="xs" color="text.muted">
                                        Est: {formatDuration(table.current_party.estimated_duration || 0)}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </>
                )}

                {/* Stats */}
                <Separator />
                <Stack direction="row" gap="4">
                    <Stack direction="row" align="center" gap="1">
                        <Typography size="sm" color="text.muted">Turns:</Typography>
                        <Typography size="sm" fontWeight="bold">{table.turn_count}</Typography>
                    </Stack>
                    <Stack direction="row" align="center" gap="1">
                        <Typography size="sm" color="text.muted">Día:</Typography>
                        <Typography size="sm" fontWeight="bold" color="green.400">
                            {DecimalUtils.formatCurrency(table.daily_revenue)}
                        </Typography>
                    </Stack>
                </Stack>

                {/* Actions - Hidden during drag */}
                {!isDragging && (
                    <Stack direction="row" justify="end" gap="2" pt="2">
                        <Button
                            size="sm"
                            variant="outline"
                            colorPalette="gray"
                            onClick={() => onOpenView(table)}
                        >
                            <Icon icon={EyeIcon} size="sm" />
                            Ver
                        </Button>
                        {statusString === 'available' && (
                            <Button
                                size="sm"
                                colorPalette="green"
                                onClick={() => onOpenSeat(table)}
                            >
                                🪑 Sentar
                            </Button>
                        )}
                        {statusString === 'occupied' && (
                            <Stack direction="row" gap="1">
                                {onTakeOrder && (
                                    <Button
                                        size="sm"
                                        colorPalette="teal"
                                        onClick={() => onTakeOrder(table)}
                                    >
                                        🍽️ Pedido
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    colorPalette="orange"
                                    onClick={() => onOpenBill(table)}
                                >
                                    📋 Cuenta
                                </Button>
                            </Stack>
                        )}
                        {statusString === 'cleaning' && (
                            <Button
                                size="sm"
                                colorPalette="green"
                                onClick={() => onMarkReady(table)}
                            >
                                ✓ Lista
                            </Button>
                        )}
                    </Stack>
                )}
            </Stack>
        </Box>
    );
});

// ============================================
// SORTABLE WRAPPER COMPONENT
// Only this component re-renders during drag
// ============================================

export function SortableTableCard({ table, onOpenView, onOpenSeat, onOpenBill, onMarkReady, onTakeOrder }: SortableTableCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: table.id });

    // Optimized style with hardware acceleration
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : 1,
        position: 'relative',
        touchAction: 'none',
        // Hardware acceleration
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        // Cursor states
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TableCardContent
                table={table}
                onOpenView={onOpenView}
                onOpenSeat={onOpenSeat}
                onOpenBill={onOpenBill}
                onMarkReady={onMarkReady}
                onTakeOrder={onTakeOrder}
                isDragging={isDragging}
            />
        </div>
    );
}
