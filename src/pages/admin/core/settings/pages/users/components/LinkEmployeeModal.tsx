import React, { useState, useEffect } from 'react';
import {
    Modal,
    HStack,
    Stack,
    Icon,
    Button,
    SelectField,
    Alert,
    Text,
} from '@/shared/ui';
import { LinkIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { PanelUser } from '../hooks/useUsersPage';

interface LinkEmployeeModalProps {
    user: PanelUser;
    isOpen: boolean;
    onClose: () => void;
    onLink: (userId: string, employeeId: string) => Promise<void>;
}

export function LinkEmployeeModal({ user, isOpen, onClose, onLink }: LinkEmployeeModalProps) {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [employees, setEmployees] = useState<Array<{ id: string; first_name: string; last_name: string; position: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState('');

    // Fetch unlinked employees when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsFetching(true);
            (async () => {
                try {
                    const { supabase } = await import('@/lib/supabase/client');
                    const { data, error } = await supabase
                        .from('team_members')
                        .select('id, first_name, last_name, position')
                        .is('auth_user_id', null);

                    if (error) throw error;
                    setEmployees(data || []);
                } catch (err) {
                    console.error('Failed to fetch employees', err);
                    setError('No se pudieron cargar los empleados disponibles');
                } finally {
                    setIsFetching(false);
                }
            })();
        }
    }, [isOpen]);

    const handleLink = async () => {
        if (!selectedEmployeeId) return;

        setIsLoading(true);
        setError('');
        try {
            await onLink(user.id, selectedEmployeeId);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al vincular empleado');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <Modal.Content>
                <Modal.Header>
                    <HStack gap="2">
                        <Icon icon={LinkIcon} size="sm" />
                        Vincular con Empleado
                    </HStack>
                    <Modal.CloseTrigger />
                </Modal.Header>

                <Modal.Body>
                    <Stack gap="4">
                        <Text color="fg.muted" fontSize="sm">
                            Vincula al usuario <strong>{user.full_name || user.email}</strong> con un registro de empleado existente.
                            Esto le permitirá ver su información de RRHH y nómina.
                        </Text>

                        {error && (
                            <Alert status="error">
                                <Alert.Indicator />
                                <Alert.Description>{error}</Alert.Description>
                            </Alert>
                        )}

                        <SelectField
                            label="Seleccionar Empleado"
                            value={selectedEmployeeId ? [selectedEmployeeId] : []}
                            onValueChange={({ value }) => setSelectedEmployeeId(value[0])}
                            options={employees.map(emp => ({
                                label: `${emp.first_name} ${emp.last_name} - ${emp.position}`,
                                value: emp.id,
                            }))}
                            disabled={isLoading || isFetching}
                            placeholder={isFetching ? 'Cargando empleados...' : 'Busca un empleado...'}
                            helperText={
                                employees.length === 0 && !isFetching
                                    ? 'No hay empleados disponibles para vincular'
                                    : undefined
                            }
                            noPortal
                        />
                    </Stack>
                </Modal.Body>

                <Modal.Footer>
                    <HStack gap="3" justify="end">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button
                            colorPalette="blue"
                            onClick={handleLink}
                            loading={isLoading}
                            disabled={!selectedEmployeeId}
                        >
                            Vincular Empleado
                        </Button>
                    </HStack>
                </Modal.Footer>
            </Modal.Content>
        </Modal>
    );
}
