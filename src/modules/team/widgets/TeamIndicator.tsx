/**
 * TeamIndicator - Widget for ShiftControl
 * Shows active team member count in shift control widget
 */

import { HStack, Text, Icon, Badge } from '@/shared/ui';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface TeamIndicatorProps {
  activeTeamCount: number;
  scheduledTeamCount?: number;
}

export function TeamIndicator({ activeTeamCount, scheduledTeamCount }: TeamIndicatorProps) {
  const hasDeficit = scheduledTeamCount && activeTeamCount < scheduledTeamCount;

  return (
    <HStack
      gap="2"
      padding="3"
      borderWidth="1px"
      borderRadius="md"
      borderColor={hasDeficit ? "orange.200" : "blue.200"}
      bg={hasDeficit ? "orange.50" : "blue.50"}
    >
      <Icon color={hasDeficit ? "orange.600" : "blue.600"}>
        <UserGroupIcon />
      </Icon>
      <Text fontSize="sm" fontWeight="medium">
        {activeTeamCount} miembros
        {scheduledTeamCount && ` / ${scheduledTeamCount}`}
      </Text>
      {hasDeficit && (
        <Badge colorPalette="orange" size="sm">Falta personal</Badge>
      )}
    </HStack>
  );
}
