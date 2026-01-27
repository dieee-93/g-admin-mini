/**
 * Alert Stack Showcase - Collapsible alert stacks
 * 
 * Components: CollapsibleAlertStack, InventoryAlertStack, SystemAlertStack
 */

import { Box, Text, Flex } from '@chakra-ui/react';
import {
    Stack,
    Label,
    Separator,
    CollapsibleAlertStack,
    InventoryAlertStack,
    SystemAlertStack,
} from '@/shared/ui';
import type { AlertItem } from '@/shared/ui';

// Showcase section wrapper (reused pattern)
function ShowcaseSection({
    title,
    description,
    children
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <Box
            p="5"
            bg="bg.subtle"
            borderRadius="xl"
            border="1px solid"
            borderColor="border.subtle"
        >
            <Flex justify="space-between" align="flex-start" mb="4">
                <Box>
                    <Text fontSize="md" fontWeight="bold" color="text.primary">
                        {title}
                    </Text>
                    {description && (
                        <Text fontSize="sm" color="text.muted" mt="1">
                            {description}
                        </Text>
                    )}
                </Box>
            </Flex>
            {children}
        </Box>
    );
}

// Sample alerts
const inventoryAlerts: AlertItem[] = [
    { id: '1', title: 'Stock bajo: Hamburguesas', description: 'Solo quedan 5 unidades', status: 'warning' },
    { id: '2', title: 'Sin stock: Papas fritas', description: 'Reabastecer urgente', status: 'error' },
    { id: '3', title: 'Stock crítico: Bebidas', description: '10 unidades restantes', status: 'warning' },
];

const systemAlerts: AlertItem[] = [
    { id: '1', title: 'Actualización disponible', description: 'Nueva versión del sistema', status: 'info' },
    { id: '2', title: 'Backup completado', description: 'Datos respaldados exitosamente', status: 'success' },
    { id: '3', title: 'Error de sincronización', description: 'Reintentar en 5 minutos', status: 'error' },
];

const mixedAlerts: AlertItem[] = [
    { id: '1', title: 'Nuevo pedido recibido', description: 'Mesa 5 - $45.00', status: 'success' },
    { id: '2', title: 'Turno próximo a terminar', description: 'En 30 minutos', status: 'warning' },
    { id: '3', title: 'Conexión restaurada', description: 'Sistema POS conectado', status: 'info' },
    { id: '4', title: 'Pago rechazado', description: 'Tarjeta inválida', status: 'error' },
];

export function AlertStackShowcase() {
    return (
        <ShowcaseSection
            title="Collapsible Alert Stacks"
            description="Stacks of alerts that can be collapsed to save space"
        >
            <Stack gap="6">
                {/* Basic Collapsible Alert Stack */}
                <Box>
                    <Label mb="3">CollapsibleAlertStack (Generic)</Label>
                    <CollapsibleAlertStack
                        alerts={mixedAlerts}
                        title="Notificaciones"
                        maxVisible={2}
                    />
                </Box>

                <Separator />

                {/* Inventory Alert Stack */}
                <Box>
                    <Label mb="3">InventoryAlertStack</Label>
                    <InventoryAlertStack
                        alerts={inventoryAlerts}
                        maxVisible={2}
                    />
                </Box>

                <Separator />

                {/* System Alert Stack */}
                <Box>
                    <Label mb="3">SystemAlertStack</Label>
                    <SystemAlertStack
                        alerts={systemAlerts}
                        maxVisible={2}
                    />
                </Box>

                <Separator />

                {/* Empty state */}
                <Box>
                    <Label mb="3">Empty Alert Stack</Label>
                    <CollapsibleAlertStack
                        alerts={[]}
                        title="Sin alertas"
                        emptyMessage="No hay alertas pendientes"
                    />
                </Box>
            </Stack>
        </ShowcaseSection>
    );
}
