/**
 * Business Badges Showcase - Specialized badge variants
 * 
 * Components: StatusBadge, StockBadge, PriorityBadge, RoleBadge, InventoryBadge, ConnectionBadge
 */

import { Box, Text, Flex } from '@chakra-ui/react';
import {
    Stack,
    Label,
    Separator,
    Badge,
    StatusBadge,
    StockBadge,
    PriorityBadge,
    RoleBadge,
    InventoryBadge,
    ConnectionBadge,
    POSConnectionBadge,
    InventoryConnectionBadge,
    StaffConnectionBadge,
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

export function BusinessBadgesShowcase() {
    return (
        <ShowcaseSection
            title="Business Badges"
            description="Specialized badges for inventory, priority, roles, and connection status"
        >
            <Stack gap="6">
                {/* Status Badges */}
                <Box>
                    <Label mb="2">StatusBadge (Entity status)</Label>
                    <Flex gap="2" flexWrap="wrap">
                        <StatusBadge status="active" />
                        <StatusBadge status="inactive" />
                        <StatusBadge status="pending" />
                        <StatusBadge status="approved" />
                        <StatusBadge status="rejected" />
                        <StatusBadge status="draft" />
                    </Flex>
                </Box>

                <Separator />

                {/* Status Badges with custom text */}
                <Box>
                    <Label mb="2">StatusBadge (custom text)</Label>
                    <Flex gap="2" flexWrap="wrap">
                        <StatusBadge status="active" text="Disponible" />
                        <StatusBadge status="inactive" text="Deshabilitado" />
                        <StatusBadge status="pending" text="En revisión" />
                    </Flex>
                </Box>

                <Separator />

                {/* Stock Badges */}
                <Box>
                    <Label mb="2">StockBadge (Inventory levels)</Label>
                    <Flex gap="2" flexWrap="wrap">
                        <StockBadge level="good" />
                        <StockBadge level="low" />
                        <StockBadge level="critical" />
                        <StockBadge level="out" />
                        <StockBadge level="excess" />
                    </Flex>
                </Box>

                <Separator />

                {/* Stock Badges with values */}
                <Box>
                    <Label mb="2">StockBadge (with values)</Label>
                    <Flex gap="2" flexWrap="wrap">
                        <StockBadge level="good" value={150} showValue />
                        <StockBadge level="low" value={25} showValue />
                        <StockBadge level="critical" value={5} showValue />
                        <StockBadge level="out" value={0} showValue />
                    </Flex>
                </Box>

                <Separator />

                {/* Priority Badges */}
                <Box>
                    <Label mb="2">PriorityBadge</Label>
                    <Flex gap="2" flexWrap="wrap">
                        <PriorityBadge priority="low" />
                        <PriorityBadge priority="medium" />
                        <PriorityBadge priority="high" />
                        <PriorityBadge priority="urgent" />
                    </Flex>
                </Box>

                <Separator />

                {/* Priority Badges without icons */}
                <Box>
                    <Label mb="2">PriorityBadge (without icons)</Label>
                    <Flex gap="2" flexWrap="wrap">
                        <PriorityBadge priority="low" showIcon={false} />
                        <PriorityBadge priority="high" showIcon={false} />
                    </Flex>
                </Box>

                <Separator />

                {/* Role Badges */}
                <Box>
                    <Label mb="2">RoleBadge</Label>
                    <Flex gap="2" flexWrap="wrap">
                        <RoleBadge role="admin" />
                        <RoleBadge role="manager" />
                        <RoleBadge role="employee" />
                        <RoleBadge role="viewer" />
                        <RoleBadge role="guest" />
                    </Flex>
                </Box>

                <Separator />

                {/* Inventory Badges */}
                <Box>
                    <Label mb="2">InventoryBadge (calculated from current/minimum)</Label>
                    <Flex gap="2" flexWrap="wrap">
                        <InventoryBadge current={100} minimum={50} />
                        <InventoryBadge current={30} minimum={50} />
                        <InventoryBadge current={10} minimum={50} />
                        <InventoryBadge current={0} minimum={50} />
                    </Flex>
                </Box>

                <Separator />

                {/* Connection Badges */}
                <Box>
                    <Label mb="2">ConnectionBadge (uses real connection status)</Label>
                    <Text fontSize="xs" color="text.muted" mb="2">
                        These badges reflect the actual connection status from useOfflineStatus hook
                    </Text>
                    <Stack gap="3">
                        <Flex gap="3" flexWrap="wrap">
                            <ConnectionBadge />
                            <ConnectionBadge showText={false} />
                            <ConnectionBadge size="md" />
                        </Flex>

                        <Flex gap="3" flexWrap="wrap">
                            <POSConnectionBadge />
                            <InventoryConnectionBadge />
                            <StaffConnectionBadge />
                        </Flex>
                    </Stack>
                </Box>

                <Separator />

                {/* Base Badge variants for comparison */}
                <Box>
                    <Label mb="2">Base Badge (for comparison)</Label>
                    <Flex gap="2" flexWrap="wrap">
                        <Badge colorPalette="green" dot pulse>Live</Badge>
                        <Badge colorPalette="purple" rounded>Premium</Badge>
                        <Badge colorPalette="blue" variant="outline">Featured</Badge>
                        <Badge colorPalette="orange" variant="solid">New</Badge>
                    </Flex>
                </Box>
            </Stack>
        </ShowcaseSection>
    );
}
