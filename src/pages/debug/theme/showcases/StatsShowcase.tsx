/**
 * Stats Showcase - Stat components with indicators
 * 
 * Components: Stat, StatLabel, StatValueText, StatHelpText, StatUpIndicator, StatDownIndicator
 */

import { Box, Text, Flex, SimpleGrid } from '@chakra-ui/react';
import {
    Stack,
    Label,
    Separator,
    Stat,
    StatRoot,
    StatLabel,
    StatValueText,
    StatHelpText,
    StatUpIndicator,
    StatDownIndicator,
} from '@/shared/ui';

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

export function StatsShowcase() {
    return (
        <ShowcaseSection
            title="Stats"
            description="Statistics display with labels, values, and change indicators"
        >
            <Stack gap="6">
                {/* Basic Stats */}
                <Box>
                    <Label mb="3">Basic Stats</Label>
                    <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
                        <StatRoot>
                            <StatLabel>Ventas Totales</StatLabel>
                            <StatValueText>$45,231</StatValueText>
                        </StatRoot>

                        <StatRoot>
                            <StatLabel>Órdenes</StatLabel>
                            <StatValueText>1,234</StatValueText>
                        </StatRoot>

                        <StatRoot>
                            <StatLabel>Clientes</StatLabel>
                            <StatValueText>892</StatValueText>
                        </StatRoot>

                        <StatRoot>
                            <StatLabel>Productos</StatLabel>
                            <StatValueText>156</StatValueText>
                        </StatRoot>
                    </SimpleGrid>
                </Box>

                <Separator />

                {/* Stats with Indicators */}
                <Box>
                    <Label mb="3">Stats with Change Indicators</Label>
                    <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
                        <StatRoot>
                            <StatLabel>Ingresos</StatLabel>
                            <StatValueText>$12,450</StatValueText>
                            <StatHelpText>
                                <StatUpIndicator />
                                +12.5% vs mes anterior
                            </StatHelpText>
                        </StatRoot>

                        <StatRoot>
                            <StatLabel>Gastos</StatLabel>
                            <StatValueText>$8,320</StatValueText>
                            <StatHelpText>
                                <StatDownIndicator />
                                -3.2% vs mes anterior
                            </StatHelpText>
                        </StatRoot>

                        <StatRoot>
                            <StatLabel>Margen</StatLabel>
                            <StatValueText>33%</StatValueText>
                            <StatHelpText>
                                <StatUpIndicator />
                                +5.1%
                            </StatHelpText>
                        </StatRoot>

                        <StatRoot>
                            <StatLabel>Conversión</StatLabel>
                            <StatValueText>4.2%</StatValueText>
                            <StatHelpText>
                                <StatDownIndicator />
                                -0.8%
                            </StatHelpText>
                        </StatRoot>
                    </SimpleGrid>
                </Box>

                <Separator />

                {/* Stat namespace usage */}
                <Box>
                    <Label mb="3">Stat Namespace Pattern</Label>
                    <Flex gap="6" flexWrap="wrap">
                        <Stat.Root>
                            <Stat.Label>Ticket Promedio</Stat.Label>
                            <Stat.ValueText>$36.75</Stat.ValueText>
                            <Stat.HelpText>Últimos 30 días</Stat.HelpText>
                        </Stat.Root>

                        <Stat.Root>
                            <Stat.Label>Tiempo de Espera</Stat.Label>
                            <Stat.ValueText>12 min</Stat.ValueText>
                            <Stat.HelpText>Promedio hoy</Stat.HelpText>
                        </Stat.Root>
                    </Flex>
                </Box>
            </Stack>
        </ShowcaseSection>
    );
}
