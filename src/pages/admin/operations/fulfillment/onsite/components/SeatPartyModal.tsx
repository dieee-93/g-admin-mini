/**
 * SeatPartyModal - Seat a new party at a table
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
    Box,
    InputField,
    NumberField
} from '@/shared/ui';
import { notify } from '@/lib/notifications';

// Module types
import type { Table, SeatPartyData } from '@/modules/fulfillment/onsite/types';

interface SeatPartyModalProps {
    table: Table | null;
    isOpen: boolean;
    onClose: () => void;
    onSeatParty: (tableId: string, partyData: SeatPartyData) => Promise<void>;
}

export function SeatPartyModal({
    table,
    isOpen,
    onClose,
    onSeatParty
}: SeatPartyModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SeatPartyData>({
        size: 2,
        customer_name: '',
        estimated_duration: 90
    });

    // Dialog size
    const dialogSize = useMemo(() => ({ base: 'full', md: 'md' } as const), []);

    // Handle open change - correct pattern
    const handleOpenChange = useCallback((details: { open: boolean }) => {
        if (!details.open) {
            onClose();
        }
    }, [onClose]);

    if (!table) return null;

    const handleSubmit = async () => {
        // Validate capacity
        if (formData.size > table.capacity) {
            notify.error({
                title: 'Error de Capacidad',
                description: `El tamaño del grupo (${formData.size}) excede la capacidad de la mesa (${table.capacity})`
            });
            return;
        }

        try {
            setLoading(true);
            await onSeatParty(table.id, formData);

            // Reset form and close
            setFormData({ size: 2, customer_name: '', estimated_duration: 90 });
            onClose();
        } catch (error) {
            console.error('Error seating party:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={handleOpenChange}
            size={dialogSize}
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    maxW={{ base: '100%', md: '500px' }}
                    maxH={{ base: '100vh', md: '90vh' }}
                    w="full"
                    overflowY="auto"
                    borderRadius={{ base: '0', md: 'lg' }}
                    m={{ base: '0', md: '4' }}
                >
                    <Dialog.CloseTrigger />
                    <Dialog.Header>
                        <Dialog.Title>Sentar Party en Mesa {table.number}</Dialog.Title>
                    </Dialog.Header>

                    <Dialog.Body p={{ base: '4', md: '6' }}>
                        <Stack gap="5">
                            {/* Capacity Info */}
                            <Box p="4" bg="blue.50" borderRadius="md" borderLeftWidth="4px" borderColor="blue.500"
                                _dark={{ bg: 'blue.900/30' }}>
                                <Stack gap="1">
                                    <Typography size="sm" fontWeight="bold" color="blue.700" _dark={{ color: 'blue.300' }}>
                                        Capacidad: {table.capacity} personas
                                    </Typography>
                                    <Typography size="xs" color="blue.600" _dark={{ color: 'blue.400' }}>
                                        Asegúrate de no exceder la capacidad máxima de la mesa.
                                    </Typography>
                                </Stack>
                            </Box>

                            {/* Party Size */}
                            <NumberField
                                label="Tamaño del Grupo"
                                value={formData.size}
                                min={1}
                                max={table.capacity + 2}
                                onChange={(value) => setFormData({ ...formData, size: value })}
                            />

                            {/* Customer Name */}
                            <InputField
                                label="Nombre del Cliente Principal (Opcional)"
                                placeholder="Ej: Juan Pérez"
                                value={formData.customer_name || ''}
                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                            />

                            {/* Duration */}
                            <NumberField
                                label="Duración Estimada (minutos)"
                                value={formData.estimated_duration}
                                step={15}
                                min={15}
                                onChange={(value) => setFormData({ ...formData, estimated_duration: value })}
                            />
                        </Stack>
                    </Dialog.Body>

                    <Dialog.Footer>
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button colorPalette="blue" onClick={handleSubmit} loading={loading}>
                            Confirmar & Sentar
                        </Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}
