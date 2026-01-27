/**
 * ShiftStats - Compact horizontal stats bar
 * @version 2.0 - Compact horizontal layout
 */

import { HStack, Box, Text, Skeleton } from '@/shared/ui';

interface ShiftStatsProps {
    activeStaffCount: number;
    scheduledStaffCount?: number;
    openTablesCount: number;
    activeDeliveriesCount: number;
    pendingOrdersCount: number;
    stockAlertsCount: number;
    totalSales?: number | null;
    loading?: boolean;
}

interface StatItemProps {
    icon: string;
    value: string | number;
    label: string;
    warning?: boolean;
}

function StatItem({ icon, value, label, warning = false }: StatItemProps) {
    return (
        <Box
            px="3"
            py="2"
            bg={warning ? 'orange.50' : 'gray.50'}
            borderRadius="md"
            borderWidth="1px"
            borderColor={warning ? 'orange.200' : 'gray.200'}
        >
            <HStack gap="2">
                <Text fontSize="lg">{icon}</Text>
                <Box>
                    <Text fontSize="lg" fontWeight="bold" color={warning ? 'orange.700' : 'gray.900'}>
                        {value}
                    </Text>
                    <Text fontSize="xs" color={warning ? 'orange.600' : 'gray.500'}>
                        {label}
                    </Text>
                </Box>
            </HStack>
        </Box>
    );
}

export function ShiftStats({
    activeStaffCount,
    openTablesCount,
    activeDeliveriesCount,
    pendingOrdersCount,
    stockAlertsCount,
    loading = false,
}: ShiftStatsProps) {
    if (loading) {
        return (
            <HStack gap="3" flexWrap="wrap">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} height="60px" width="120px" borderRadius="md" />
                ))}
            </HStack>
        );
    }

    return (
        <HStack gap="3" flexWrap="wrap">
            <StatItem icon="👥" value={activeStaffCount} label="Personal" />
            
            {openTablesCount > 0 && (
                <StatItem icon="🍽️" value={openTablesCount} label="Mesas" />
            )}
            
            {activeDeliveriesCount > 0 && (
                <StatItem icon="🚚" value={activeDeliveriesCount} label="Entregas" />
            )}
            
            {pendingOrdersCount > 0 && (
                <StatItem icon="📋" value={pendingOrdersCount} label="Pendientes" />
            )}
            
            {stockAlertsCount > 0 && (
                <StatItem
                    icon="⚠️"
                    value={stockAlertsCount}
                    label="Alertas Stock"
                    warning
                />
            )}
        </HStack>
    );
}
