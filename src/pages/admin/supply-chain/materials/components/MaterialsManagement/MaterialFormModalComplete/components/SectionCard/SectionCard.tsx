/**
 * SectionCard v2.0 - Industrial Design System
 *
 * REDESIGNED with industrial manufacturing aesthetics:
 * - Blue gradient top bar (4px)
 * - Heavy 3px borders
 * - Typography with uppercase styling and letter spacing
 * - Professional factory control panel feel
 *
 * Matches the design of RecipeBuilder sections (OutputConfigSection, CostSummarySection, etc.)
 */

import { Box, Stack, Typography, Flex } from '@/shared/ui';
import { type PropsWithChildren, memo } from 'react';

interface SectionCardProps extends PropsWithChildren {
    title: string;
    icon?: React.ReactNode;
    spacing?: string;
    colorPalette?: 'blue' | 'green' | 'orange' | 'purple' | 'gray';
}

// ⚡ PERFORMANCE: React.memo prevents re-renders when props don't change
export const SectionCard = memo(function SectionCard({
    title,
    icon,
    children,
    spacing = "4",
    colorPalette = "blue"
}: SectionCardProps) {
    return (
        <Box
            position="relative"
            p={{ base: "5", md: "6" }}
            bg="bg.panel"
            borderWidth="3px"
            borderColor="border.emphasized"
            borderRadius="xl"
            boxShadow="lg"
            w="full"
            colorPalette={colorPalette}
            css={{
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '4px',
                    background: `linear-gradient(90deg, var(--chakra-colors-${colorPalette}-emphasized), var(--chakra-colors-${colorPalette}-fg))`,
                    borderTopLeftRadius: 'var(--chakra-radii-xl)',
                    borderTopRightRadius: 'var(--chakra-radii-xl)'
                }
            }}
        >
            <Stack gap={spacing}>
                {/* Section Header - Industrial Style */}
                <Flex
                    align="center"
                    gap="2.5"
                    mb="1"
                >
                    {icon && (
                        <Box 
                            color="colorPalette.fg" 
                            display="flex" 
                            fontSize="lg"
                            opacity="0.8"
                        >
                            {icon}
                        </Box>
                    )}
                    <Typography
                        fontSize="xs"
                        fontWeight="800"
                        color="fg.muted"
                        letterSpacing="widest"
                        textTransform="uppercase"
                    >
                        {title}
                    </Typography>
                </Flex>

                {/* Section Content */}
                {children}
            </Stack>
        </Box>
    );
});
