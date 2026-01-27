/**
 * OnsiteTableSelector - Table selector for POS modal
 *
 * This component is INJECTED via HookPoint into SaleFormModal
 * when the fulfillment-onsite module is active.
 *
 * Pattern: Capability-based UI injection
 * @see docs/architecture-v2/deliverables/CROSS_MODULE_INTEGRATION_MAP.md
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Button,
    Badge,
    Stack,
    Typography,
    Box,
    Spinner,
    Popover,
    Grid
} from '@/shared/ui';
import { Icon } from '@/shared/ui/Icon';
import { TableCellsIcon, XMarkIcon, UsersIcon } from '@heroicons/react/24/outline';

import { tablesApi } from '../services/tablesApi';
import type { Table, Party } from '../types';
import type { OnsiteSaleContext, POSContextSelectorData, OccupiedTableInfo } from '../events';
import { logger } from '@/lib/logging';

// ============================================
// COMPONENT
// ============================================

interface OnsiteTableSelectorProps extends POSContextSelectorData { }

export function OnsiteTableSelector({
    cart,
    onContextSelect,
    initialContext
}: OnsiteTableSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState<OccupiedTableInfo | null>(null);

    // ============================================
    // LOAD INITIAL CONTEXT
    // ============================================

    useEffect(() => {
        if (initialContext?.type === 'onsite') {
            const ctx = initialContext as OnsiteSaleContext;
            setSelectedTable({
                id: ctx.tableId,
                number: ctx.tableNumber,
                currentParty: {
                    id: ctx.partyId,
                    size: ctx.partySize,
                    customerName: ctx.customerName,
                    totalSpent: 0,
                    seatedAt: new Date().toISOString()
                }
            });
        }
    }, [initialContext]);

    // ============================================
    // LOAD TABLES (only occupied ones are selectable)
    // ============================================

    const loadTables = useCallback(async () => {
        setIsLoading(true);
        try {
            const allTables = await tablesApi.getTables();
            setTables(allTables);
        } catch (error) {
            logger.error('App', 'Failed to load tables for selector', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load tables when popover opens
    useEffect(() => {
        if (isOpen) {
            loadTables();
        }
    }, [isOpen, loadTables]);

    // ============================================
    // HANDLERS
    // ============================================

    const handleTableSelect = useCallback((table: Table) => {
        if (table.status !== 'occupied' || !table.current_party) {
            return; // Only allow selecting occupied tables
        }

        const party = table.current_party;
        const tableInfo: OccupiedTableInfo = {
            id: table.id,
            number: table.number,
            currentParty: {
                id: party.id,
                size: party.size,
                customerName: party.customer_name,
                totalSpent: party.total_spent,
                seatedAt: party.seated_at
            }
        };

        setSelectedTable(tableInfo);
        setIsOpen(false);

        // Notify parent via callback
        const context: OnsiteSaleContext = {
            type: 'onsite',
            tableId: table.id,
            tableNumber: table.number,
            partyId: party.id,
            partySize: party.size,
            customerName: party.customer_name
        };
        onContextSelect(context);

        logger.info('App', 'Table selected for order', { tableId: table.id, tableNumber: table.number });
    }, [onContextSelect]);

    const handleClearSelection = useCallback(() => {
        setSelectedTable(null);
        // Notify parent that context was cleared
        onContextSelect({ type: 'counter' });
    }, [onContextSelect]);

    // ============================================
    // FILTERED TABLES
    // ============================================

    const occupiedTables = useMemo(() =>
        tables.filter(t => t.status === 'occupied' && t.current_party),
        [tables]
    );

    const availableTables = useMemo(() =>
        tables.filter(t => t.status === 'available'),
        [tables]
    );

    // ============================================
    // RENDER
    // ============================================

    return (
        <Popover.Root open={isOpen} onOpenChange={(details) => setIsOpen(details.open)}>
            <Popover.Trigger asChild>
                {selectedTable ? (
                    // Selected table badge
                    <Badge
                        colorPalette="green"
                        size="lg"
                        cursor="pointer"
                        px="3"
                        py="2"
                    >
                        <Stack direction="row" gap="2" align="center">
                            <Icon icon={TableCellsIcon} size="sm" />
                            <Typography fontWeight="bold">
                                Mesa {selectedTable.number}
                            </Typography>
                            <Badge colorPalette="blue" size="sm">
                                👥 {selectedTable.currentParty.size}
                            </Badge>
                            <Box
                                as="button"
                                onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    handleClearSelection();
                                }}
                                cursor="pointer"
                                _hover={{ color: 'red.500' }}
                            >
                                <Icon icon={XMarkIcon} size="xs" />
                            </Box>
                        </Stack>
                    </Badge>
                ) : (
                    // No table selected - show button
                    <Button variant="outline" size="sm">
                        <Icon icon={TableCellsIcon} size="sm" />
                        📍 Mesa
                    </Button>
                )}
            </Popover.Trigger>

            <Popover.Positioner>
                <Popover.Content width="400px" maxH="400px" overflowY="auto">
                    <Popover.Arrow>
                        <Popover.ArrowTip />
                    </Popover.Arrow>
                    <Popover.Header>
                        <Stack direction="row" justify="space-between" align="center">
                            <Typography fontWeight="bold">Seleccionar Mesa</Typography>
                            <Popover.CloseTrigger asChild>
                                <Button variant="ghost" size="xs">
                                    <Icon icon={XMarkIcon} size="sm" />
                                </Button>
                            </Popover.CloseTrigger>
                        </Stack>
                    </Popover.Header>
                    <Popover.Body>
                        {isLoading ? (
                            <Stack align="center" justify="center" py="8">
                                <Spinner size="lg" />
                                <Typography color="text.muted">Cargando mesas...</Typography>
                            </Stack>
                        ) : (
                            <Stack gap="4">
                                {/* Occupied tables - Selectable */}
                                {occupiedTables.length > 0 && (
                                    <Box>
                                        <Typography size="sm" fontWeight="bold" color="green.600" mb="2">
                                            🟢 Mesas Ocupadas ({occupiedTables.length})
                                        </Typography>
                                        <Grid templateColumns="repeat(3, 1fr)" gap="2">
                                            {occupiedTables.map((table) => (
                                                <Box
                                                    key={table.id}
                                                    p="3"
                                                    borderWidth="2px"
                                                    borderRadius="md"
                                                    borderColor="green.400"
                                                    bg="green.50"
                                                    _dark={{ bg: 'green.900/20' }}
                                                    cursor="pointer"
                                                    _hover={{
                                                        borderColor: 'green.600',
                                                        bg: 'green.100',
                                                        _dark: { bg: 'green.900/40' }
                                                    }}
                                                    onClick={() => handleTableSelect(table)}
                                                    textAlign="center"
                                                >
                                                    <Typography fontWeight="bold">
                                                        Mesa {table.number}
                                                    </Typography>
                                                    <Stack direction="row" justify="center" gap="1" mt="1">
                                                        <Icon icon={UsersIcon} size="xs" />
                                                        <Typography size="xs">
                                                            {table.current_party?.size || 0}
                                                        </Typography>
                                                    </Stack>
                                                    {table.current_party?.customer_name && (
                                                        <Typography size="xs" color="text.muted" truncate>
                                                            {table.current_party.customer_name}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}

                                {/* Available tables - Not selectable for orders */}
                                {availableTables.length > 0 && (
                                    <Box>
                                        <Typography size="sm" fontWeight="bold" color="gray.500" mb="2">
                                            ⚪ Mesas Disponibles ({availableTables.length})
                                        </Typography>
                                        <Typography size="xs" color="text.muted" mb="2">
                                            Solo las mesas ocupadas pueden recibir pedidos
                                        </Typography>
                                        <Grid templateColumns="repeat(3, 1fr)" gap="2">
                                            {availableTables.slice(0, 6).map((table) => (
                                                <Box
                                                    key={table.id}
                                                    p="3"
                                                    borderWidth="1px"
                                                    borderRadius="md"
                                                    borderColor="gray.200"
                                                    bg="gray.50"
                                                    _dark={{ bg: 'gray.800' }}
                                                    opacity="0.6"
                                                    textAlign="center"
                                                >
                                                    <Typography color="text.muted">
                                                        Mesa {table.number}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}

                                {/* No tables */}
                                {tables.length === 0 && !isLoading && (
                                    <Stack align="center" py="6">
                                        <Typography color="text.muted">
                                            No hay mesas configuradas
                                        </Typography>
                                    </Stack>
                                )}

                                {/* No occupied tables */}
                                {occupiedTables.length === 0 && tables.length > 0 && !isLoading && (
                                    <Stack align="center" py="4">
                                        <Typography color="text.muted" textAlign="center">
                                            No hay mesas ocupadas.
                                            <br />
                                            Sienta clientes primero.
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                        )}
                    </Popover.Body>
                </Popover.Content>
            </Popover.Positioner>
        </Popover.Root>
    );
}

export default OnsiteTableSelector;
