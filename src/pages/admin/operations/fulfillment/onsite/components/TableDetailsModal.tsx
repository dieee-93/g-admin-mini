/**
 * TableDetailsModal - View and manage table details
 * 
 * Strongly typed with module types
 * Uses correct Dialog pattern with Backdrop and Positioner
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    Dialog,
    Button,
    Stack,
    Typography,
    Badge,
    Box,
    Separator,
    SelectField,
    SimpleGrid
} from '@/shared/ui';
import { DecimalUtils } from '@/lib/decimal';
import { ClockIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';

// Module types
import type { Table, TableStatus } from '@/modules/onsite/types';

interface TableDetailsModalProps {
    table: Table | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (tableId: string, newStatus: TableStatus | string) => Promise<void>;
}

export function TableDetailsModal({
    table,
    isOpen,
    onClose,
    onStatusChange
}: TableDetailsModalProps) {
    const [updating, setUpdating] = useState(false);

    // Dialog size
    const dialogSize = useMemo(() => ({ base: 'full', md: 'lg' } as const), []);

    // Handle open change - correct pattern
    const handleOpenChange = useCallback((details: { open: boolean }) => {
        if (!details.open) {
            onClose();
        }
    }, [onClose]);

    if (!table) return null;

    const statusOptions = [
        { value: 'available', label: 'Disponible' },
        { value: 'occupied', label: 'Ocupada' },
        { value: 'reserved', label: 'Reservada' },
        { value: 'cleaning', label: 'Limpieza' },
        { value: 'ready_for_bill', label: 'Cuenta Lista' },
        { value: 'maintenance', label: 'Mantenimiento' }
    ];

    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!newStatus || newStatus === table.status) return;

        try {
            setUpdating(true);
            await onStatusChange(table.id, newStatus);
        } finally {
            setUpdating(false);
        }
    };

    const statusString = typeof table.status === 'string' ? table.status : table.status;

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={handleOpenChange}
            size={dialogSize}
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    maxW={{ base: '100%', md: '600px' }}
                    maxH={{ base: '100vh', md: '90vh' }}
                    w="full"
                    overflowY="auto"
                    borderRadius={{ base: '0', md: 'lg' }}
                    m={{ base: '0', md: '4' }}
                >
                    <Dialog.CloseTrigger />
                    <Dialog.Header>
                        <Stack direction="row" justify="space-between" align="center">
                            <Dialog.Title>Mesa {table.number}</Dialog.Title>
                            <Badge size="lg" variant="solid" colorPalette="gray">
                                {table.location?.replace('_', ' ') || 'Sin ubicación'}
                            </Badge>
                        </Stack>
                    </Dialog.Header>

                    <Dialog.Body p={{ base: '4', md: '6' }}>
                        <Stack gap="6">
                            {/* Status Selector */}
                            <Box p="4" bg="bg.subtle" borderRadius="md">
                                <Stack gap="2">
                                    <Typography size="sm" fontWeight="medium" color="text.muted">
                                        Estado Actual
                                    </Typography>
                                    <SelectField
                                        label=""
                                        name="status"
                                        value={[statusString]}
                                        options={statusOptions}
                                        onValueChange={(val) => {
                                            if (val.value?.[0]) {
                                                handleStatusUpdate(val.value[0] as string);
                                            }
                                        }}
                                        disabled={updating}
                                        noPortal={true}
                                    />
                                </Stack>
                            </Box>

                            {/* Current Party */}
                            {table.current_party ? (
                                <Stack gap="4">
                                    <Typography size="lg" fontWeight="bold">Party Actual</Typography>
                                    <Box borderWidth="1px" borderRadius="lg" p="4" borderColor="border.subtle">
                                        <Stack gap="4">
                                            <Stack direction="row" justify="space-between">
                                                <Stack direction="row" align="center" gap="2">
                                                    <Icon icon={UsersIcon} size="md" color="text.muted" />
                                                    <Typography size="lg" fontWeight="semibold">
                                                        Party de {table.current_party.size}
                                                    </Typography>
                                                </Stack>
                                                <Typography size="xl" fontWeight="bold" color="green.600">
                                                    {DecimalUtils.formatCurrency(table.current_party.total_spent)}
                                                </Typography>
                                            </Stack>

                                            <Separator />

                                            <SimpleGrid columns={2} gap="4">
                                                <Stack gap="1">
                                                    <Typography size="xs" color="text.muted">CLIENTE</Typography>
                                                    <Typography fontWeight="medium">
                                                        {table.current_party.customer_name ||
                                                            table.current_party.primary_customer_name ||
                                                            'Walk-in Guest'}
                                                    </Typography>
                                                </Stack>

                                                <Stack gap="1">
                                                    <Typography size="xs" color="text.muted">TIEMPO SENTADO</Typography>
                                                    <Stack direction="row" align="center" gap="1">
                                                        <Icon icon={ClockIcon} size="xs" />
                                                        <Typography>
                                                            {formatDuration(
                                                                Math.floor(
                                                                    (new Date().getTime() -
                                                                        new Date(table.current_party.seated_at).getTime()) / 60000
                                                                )
                                                            )}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>

                                                <Stack gap="1">
                                                    <Typography size="xs" color="text.muted">ESTIMADO</Typography>
                                                    <Typography>
                                                        {formatDuration(table.current_party.estimated_duration)}
                                                    </Typography>
                                                </Stack>

                                                <Stack gap="1">
                                                    <Typography size="xs" color="text.muted">STATUS</Typography>
                                                    <Badge variant="subtle" colorPalette="orange">ACTIVE</Badge>
                                                </Stack>
                                            </SimpleGrid>
                                        </Stack>
                                    </Box>
                                </Stack>
                            ) : (
                                <Box p="6" borderWidth="1px" borderStyle="dashed" borderRadius="lg" textAlign="center">
                                    <Typography color="text.muted">Mesa disponible (Sin party activo)</Typography>
                                </Box>
                            )}

                            {/* Daily Stats */}
                            <Stack gap="2">
                                <Typography size="sm" fontWeight="bold" color="text.muted">
                                    ESTADÍSTICAS DEL DÍA
                                </Typography>
                                <Stack direction="row" gap="4">
                                    <Box flex="1" p="3" bg="bg.subtle" borderRadius="md">
                                        <Typography size="xs" color="text.muted">TURNS</Typography>
                                        <Typography size="xl" fontWeight="bold">{table.turn_count}</Typography>
                                    </Box>
                                    <Box flex="1" p="3" bg="bg.subtle" borderRadius="md">
                                        <Typography size="xs" color="text.muted">REVENUE</Typography>
                                        <Typography size="xl" fontWeight="bold" color="green.600">
                                            {DecimalUtils.formatCurrency(table.daily_revenue)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Dialog.Body>

                    <Dialog.Footer>
                        <Button variant="outline" onClick={onClose}>Cerrar</Button>
                        {statusString === 'occupied' && (
                            <Button colorPalette="orange">Cerrar Mesa & Facturar</Button>
                        )}
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}
