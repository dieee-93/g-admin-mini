/**
 * Section Layout Showcase - Layout and section components
 * 
 * Components: Section, FeatureCard, HeaderSwitch, PageHeader
 */

import { useState } from 'react';
import { Box, Text, Flex, SimpleGrid } from '@chakra-ui/react';
import {
    Stack,
    Label,
    Separator,
    Section,
    FeatureCard,
    HeaderSwitch,
    DashboardSwitch,
    PageHeader,
    Button,
    Icon,
} from '@/shared/ui';
import {
    CubeIcon,
    ShoppingCartIcon,
    ChartBarIcon,
    UserGroupIcon,
    CalendarIcon,
    CogIcon,
    PlusIcon,
    BellIcon,
    TrophyIcon,
    ListBulletIcon,
    Squares2X2Icon,
} from '@heroicons/react/24/outline';

// Showcase section wrapper (reused pattern)
function ShowcaseSectionWrapper({
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

export function SectionLayoutShowcase() {
    const [switchPosition, setSwitchPosition] = useState('list');
    const [dashboardView, setDashboardView] = useState<'alerts' | 'setup' | 'achievements'>('alerts');

    return (
        <ShowcaseSectionWrapper
            title="Section & Layout Components"
            description="Section wrappers, feature cards, and header switches"
        >
            <Stack gap="6">
                {/* Section Component */}
                <Box>
                    <Label mb="3">Section Component</Label>
                    <Stack gap="3">
                        <Section
                            title="Productos Activos"
                            description="Lista de productos disponibles para venta"
                        >
                            <Text fontSize="sm" color="text.muted">
                                Contenido de la sección va aquí. Puede incluir tablas, listas, cards, etc.
                            </Text>
                        </Section>

                        <Section
                            title="Configuración Avanzada"
                            collapsible
                            defaultOpen={false}
                        >
                            <Text fontSize="sm" color="text.muted">
                                Esta sección es colapsable. Click en el header para expandir/contraer.
                            </Text>
                        </Section>
                    </Stack>
                </Box>

                <Separator />

                {/* Feature Cards */}
                <Box>
                    <Label mb="3">FeatureCard</Label>
                    <SimpleGrid columns={{ base: 2, md: 3 }} gap="3">
                        <FeatureCard
                            icon={CubeIcon}
                            title="Inventario"
                            description="Control de stock"
                        />
                        <FeatureCard
                            icon={ShoppingCartIcon}
                            title="Ventas"
                            description="Punto de venta"
                        />
                        <FeatureCard
                            icon={ChartBarIcon}
                            title="Reportes"
                            description="Análisis de datos"
                        />
                        <FeatureCard
                            icon={UserGroupIcon}
                            title="Personal"
                            description="Gestión de empleados"
                        />
                        <FeatureCard
                            icon={CalendarIcon}
                            title="Reservas"
                            description="Agenda y turnos"
                        />
                        <FeatureCard
                            icon={CogIcon}
                            title="Ajustes"
                            description="Configuración"
                        />
                    </SimpleGrid>
                </Box>

                <Separator />

                {/* Header Switch */}
                <Box>
                    <Label mb="3">HeaderSwitch & DashboardSwitch</Label>
                    <Stack gap="4">
                        <Box p="3" bg="bg.panel" borderRadius="md">
                            <Text fontSize="xs" color="text.muted" mb="2">HeaderSwitch (custom positions)</Text>
                            <HeaderSwitch
                                positions={[
                                    { id: 'list', icon: <Icon icon={ListBulletIcon} size="sm" />, label: 'Lista' },
                                    { id: 'grid', icon: <Icon icon={Squares2X2Icon} size="sm" />, label: 'Cuadrícula' },
                                ]}
                                defaultPosition="list"
                                currentPosition={switchPosition}
                                onPositionChange={(pos) => setSwitchPosition(pos)}
                            />
                            <Text fontSize="sm" color="text.muted" mt="2">
                                Posición actual: {switchPosition}
                            </Text>
                        </Box>

                        <Box p="3" bg="bg.panel" borderRadius="md">
                            <Text fontSize="xs" color="text.muted" mb="2">DashboardSwitch (pre-configured)</Text>
                            <DashboardSwitch
                                setupComplete={false}
                                activeView={dashboardView}
                                onViewChange={setDashboardView}
                                alertsBadge={5}
                                setupBadge={2}
                            />
                            <Text fontSize="sm" color="text.muted" mt="2">
                                Vista activa: {dashboardView}
                            </Text>
                        </Box>
                    </Stack>
                </Box>

                <Separator />

                {/* Page Header */}
                <Box>
                    <Label mb="3">PageHeader</Label>
                    <Box p="3" bg="bg.panel" borderRadius="md">
                        <PageHeader
                            title="Gestión de Inventario"
                            description="Administra el stock de productos y materiales"
                            actions={
                                <Button size="sm" colorPalette="blue">
                                    <Icon icon={PlusIcon} size="sm" /> Nuevo Item
                                </Button>
                            }
                        />
                    </Box>
                </Box>
            </Stack>
        </ShowcaseSectionWrapper>
    );
}

