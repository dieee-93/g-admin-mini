/**
 * ShiftHeader - Header del widget con estado y timer en vivo
 * @version 1.2 - Improved date/time formatting
 */

import { useState, useEffect, useMemo } from 'react';
import { HStack, Stack, Badge, Text, Icon, Box } from '@/shared/ui';
import { ClockIcon, CheckCircleIcon, XCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { OperationalShift } from '../types';

interface ShiftHeaderProps {
    shift: OperationalShift | null;
    isOperational: boolean;
    locationName?: string | null;
}

/**
 * Formats elapsed time as HH:MM:SS or DD días HH:MM
 */
function formatElapsedTime(startTime: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    // If more than 1 day, show days + hours
    if (days > 0) {
        return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Otherwise show HH:MM:SS
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function ShiftHeader({ shift, isOperational, locationName }: ShiftHeaderProps) {
    // Live timer - updates every second
    const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

    const startTime = useMemo(() => {
        return shift?.opened_at ? new Date(shift.opened_at) : null;
    }, [shift?.opened_at]);

    // Update timer every second when operational
    useEffect(() => {
        if (!isOperational || !startTime) {
            setElapsedTime('00:00:00');
            return;
        }

        // Initial update
        setElapsedTime(formatElapsedTime(startTime));

        // Update every second
        const interval = setInterval(() => {
            setElapsedTime(formatElapsedTime(startTime));
        }, 1000);

        return () => clearInterval(interval);
    }, [isOperational, startTime]);

    // Relative time since opened
    const timeAgo = useMemo(() => {
        if (!startTime) return null;
        return formatDistanceToNow(startTime, { addSuffix: true, locale: es });
    }, [startTime]);

    return (
        <HStack justify="space-between" wrap gap="4">
            {/* Left: Icon + Title + Time */}
            <HStack gap="3">
                <Box
                    p="2"
                    borderRadius="lg"
                    bg={isOperational ? 'green.50' : 'gray.100'}
                >
                    <Icon
                        fontSize="xl"
                        color={isOperational ? 'green.500' : 'gray.400'}
                    >
                        <ClockIcon />
                    </Icon>
                </Box>

                <Stack gap="0">
                    <HStack gap="2">
                        <Text fontWeight="bold" fontSize="lg">
                            Control de Turno
                        </Text>
                        {locationName && (
                            <Badge colorPalette="blue" variant="subtle" size="sm">
                                {locationName}
                            </Badge>
                        )}
                    </HStack>

                    {isOperational && startTime ? (
                        <HStack gap="2" color="gray.500" fontSize="sm">
                            <Text>
                                Abierto: {format(startTime, 'dd/MM/yyyy HH:mm', { locale: es })}
                            </Text>
                            <Text>•</Text>
                            <Text>{timeAgo}</Text>
                        </HStack>
                    ) : (
                        <Text color="gray.500" fontSize="sm">
                            Sin turno activo
                        </Text>
                    )}
                </Stack>
            </HStack>

            {/* Right: Timer + Status Badge */}
            <HStack gap="3">
                {/* Live Timer */}
                {isOperational && (
                    <Box
                        px="3"
                        py="1"
                        bg="gray.50"
                        borderRadius="md"
                        fontFamily="mono"
                        fontSize="lg"
                        fontWeight="semibold"
                        color="gray.700"
                    >
                        {elapsedTime}
                    </Box>
                )}

                {/* Status Badge */}
                <Badge
                    colorPalette={isOperational ? 'green' : 'gray'}
                    variant="solid"
                    size="lg"
                >
                    <Icon mr="1">
                        {isOperational ? <CheckCircleIcon /> : <XCircleIcon />}
                    </Icon>
                    {isOperational ? 'Operativo' : 'Cerrado'}
                </Badge>
            </HStack>
        </HStack>
    );
}
