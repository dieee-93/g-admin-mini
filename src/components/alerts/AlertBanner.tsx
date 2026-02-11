import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ExclamationTriangleIcon,
    XMarkIcon,
    BellIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '@/shared/alerts/hooks/useAlerts';
import type { Alert as AlertData } from '@/shared/alerts/types';
import {
    Alert,
    Portal,
    Box,
    IconButton,
    Button,
    Text,
} from '@/shared/ui';
import { AlertComponents } from '@/shared/ui/wrappers/AlertComponents';

const { Actions } = AlertComponents;

interface AlertBannerProps {
    maxVisible?: number;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
    maxVisible = 3
}) => {
    const navigate = useNavigate();
    // Subscribe to critical and warning alerts that are active or acknowledged
    const { alerts, actions } = useAlerts({
        status: ['active'],
        severity: ['critical', 'error'], // Only show high priority in banner
        autoFilter: true
    });

    const visibleAlerts = alerts.slice(0, maxVisible);
    const hasMore = alerts.length > maxVisible;

    if (alerts.length === 0) return null;

    return (
        <Portal>
            <Box
                position="fixed"
                top="4"
                right="4"
                zIndex="banner"
                width="full"
                maxWidth="md"
                pointerEvents="none"
                display="flex"
                flexDirection="column"
                gap="2"
            >
                <AnimatePresence mode="popLayout">
                    {visibleAlerts.map((alert) => (
                        <AlertItem
                            key={alert.id}
                            alert={alert}
                            onDismiss={() => actions.dismiss(alert.id)}
                            onAcknowledge={() => actions.acknowledge(alert.id)}
                            onNavigate={(path) => navigate(path)}
                        />
                    ))}
                </AnimatePresence>

                {hasMore && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <Box
                            bg="whiteAlpha.900"
                            backdropBlur="md"
                            py="1"
                            px="3"
                            borderRadius="md"
                            boxShadow="sm"
                            borderWidth="1px"
                            borderColor="gray.200"
                            pointerEvents="auto"
                            textAlign="center"
                        >
                            <Text fontSize="xs" fontWeight="medium" color="gray.600">
                                +{alerts.length - maxVisible} more critical alerts
                            </Text>
                        </Box>
                    </motion.div>
                )}
            </Box>
        </Portal>
    );
};

const categoryIcons: Record<string, React.ElementType> = {
    capacity: ChartBarIcon,
    financial: CurrencyDollarIcon,
    cx: ClockIcon,
    efficiency: ClockIcon
};

const AlertItem: React.FC<{
    alert: AlertData;
    onDismiss: () => void;
    onAcknowledge: () => void;
    onNavigate: (path: string) => void;
}> = ({ alert, onDismiss, onAcknowledge, onNavigate }) => {
    const isCritical = alert.severity === 'critical';
    const status = isCritical ? 'error' : 'warning';
    // Use category icon if available, otherwise fallback based on severity
    const Icon = categoryIcons[alert.metadata?.category || ''] || (isCritical ? ExclamationTriangleIcon : BellIcon);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 20, transition: { duration: 0.2 } }}
            style={{ pointerEvents: 'auto' }}
        >
            <Alert.Root
                status={status}
                borderRadius="lg"
                boxShadow="lg"
                variant="surface"
                position="relative"
                overflow="hidden"
                p="4"
            >
                <Alert.Indicator>
                    <Icon style={{ height: '20px', width: '20px' }} className={isCritical ? "animate-pulse" : ""} />
                </Alert.Indicator>

                <Alert.Content>
                    <Alert.Title fontWeight="bold" fontSize="sm">
                        {alert.title}
                    </Alert.Title>
                    <Alert.Description fontSize="xs" opacity={0.9} lineClamp={2}>
                        {alert.description}
                    </Alert.Description>

                    <Actions mt="3" gap="2">
                        <Button
                            size="xs"
                            variant="subtle"
                            colorPalette={isCritical ? 'red' : 'orange'}
                            onClick={onAcknowledge}
                        >
                            Entendido
                        </Button>
                        {alert.metadata?.link && (
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => {
                                    // Marcar como visto antes de navegar
                                    onAcknowledge();
                                    onNavigate(alert.metadata!.link as string);
                                }}
                            >
                                <span style={{ textDecoration: 'underline' }}>Ver solución</span>
                            </Button>
                        )}
                    </Actions>
                </Alert.Content>

                <IconButton
                    aria-label="Dismiss"
                    variant="ghost"
                    size="xs"
                    position="absolute"
                    top="2"
                    right="2"
                    onClick={onDismiss}
                    borderRadius="full"
                >
                    <XMarkIcon style={{ height: '16px', width: '16px' }} />
                </IconButton>
            </Alert.Root>
        </motion.div>
    );
};