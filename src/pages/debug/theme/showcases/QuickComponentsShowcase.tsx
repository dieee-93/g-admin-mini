/**
 * Quick Components Showcase - Pre-built composite components
 * 
 * Components: PageTitle, ActionBar, ListItem
 */

import { Box, Text, Flex } from '@chakra-ui/react';
import {
    Stack,
    Label,
    Separator,
    PageTitle,
    ActionBar,
    ListItem,
    Button,
    Badge,
    Icon,
    IconButton,
} from '@/shared/ui';
import {
    PlusIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

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

export function QuickComponentsShowcase() {
    return (
        <ShowcaseSection
            title="Quick Components"
            description="Pre-built composite components for common UI patterns"
        >
            <Stack gap="6">
                {/* Page Title */}
                <Box>
                    <Label mb="3">PageTitle</Label>
                    <Stack gap="4" p="3" bg="bg.panel" borderRadius="md">
                        <PageTitle
                            title="Gestión de Productos"
                            subtitle="Administra tu catálogo de productos"
                        />

                        <Separator />

                        <PageTitle
                            title="Inventario"
                            subtitle="Control de stock en tiempo real"
                            badge={<Badge colorPalette="green">Activo</Badge>}
                        />
                    </Stack>
                </Box>

                <Separator />

                {/* Action Bar */}
                <Box>
                    <Label mb="3">ActionBar</Label>
                    <Stack gap="4" p="3" bg="bg.panel" borderRadius="md">
                        <ActionBar
                            primary={
                                <Button colorPalette="blue">
                                    <Icon icon={PlusIcon} size="sm" /> Nuevo Producto
                                </Button>
                            }
                            secondary={
                                <>
                                    <Button variant="outline" size="sm">
                                        <Icon icon={FunnelIcon} size="sm" /> Filtrar
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Icon icon={ArrowDownTrayIcon} size="sm" /> Exportar
                                    </Button>
                                </>
                            }
                        />

                        <Separator />

                        <ActionBar
                            primary={
                                <Button size="sm">Guardar Cambios</Button>
                            }
                            secondary={
                                <Button variant="ghost" size="sm">Cancelar</Button>
                            }
                        />
                    </Stack>
                </Box>

                <Separator />

                {/* List Item */}
                <Box>
                    <Label mb="3">ListItem</Label>
                    <Stack gap="1" bg="bg.panel" borderRadius="md" p="2">
                        <ListItem
                            title="Hamburguesa Clásica"
                            subtitle="Categoría: Comida rápida"
                            status={<Badge colorPalette="green" size="sm">Activo</Badge>}
                            actions={
                                <>
                                    <IconButton aria-label="Edit" variant="ghost" size="sm">
                                        <Icon icon={PencilIcon} size="sm" />
                                    </IconButton>
                                    <IconButton aria-label="Delete" variant="ghost" size="sm" colorPalette="red">
                                        <Icon icon={TrashIcon} size="sm" />
                                    </IconButton>
                                </>
                            }
                        />

                        <ListItem
                            title="Pizza Margarita"
                            subtitle="Categoría: Pizzas"
                            status={<Badge colorPalette="orange" size="sm">Stock bajo</Badge>}
                            actions={
                                <IconButton aria-label="Edit" variant="ghost" size="sm">
                                    <Icon icon={PencilIcon} size="sm" />
                                </IconButton>
                            }
                        />

                        <ListItem
                            title="Ensalada César"
                            subtitle="Categoría: Ensaladas"
                            status={<Badge colorPalette="red" size="sm">Sin stock</Badge>}
                        />
                    </Stack>
                </Box>
            </Stack>
        </ShowcaseSection>
    );
}
