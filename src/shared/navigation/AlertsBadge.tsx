import {
  HStack,
  Badge,
  Text,
  Box,
  Skeleton
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useStockAlerts } from '@/modules/stock/logic/useStockAlerts';

interface AlertsBadgeProps {
  variant?: 'minimal' | 'detailed';
  showIcon?: boolean;
  onClick?: () => void;
}

export function AlertsBadge({ 
  variant = 'minimal', 
  showIcon = true, 
  onClick 
}: AlertsBadgeProps) {
  const { 
    loading, 
    getTotalAlertCount, 
    getCriticalAlertCount, 
    getAlertsByUrgency 
  } = useStockAlerts();

  const totalCount = getTotalAlertCount();
  const criticalCount = getCriticalAlertCount();
  const alertsByUrgency = getAlertsByUrgency();

  // Loading state
  if (loading) {
    return (
      <Skeleton height="24px" width={variant === 'minimal' ? '40px' : '80px'} />
    );
  }

  // No alerts
  if (totalCount === 0) {
    return null;
  }

  // Minimal variant - just the badge
  if (variant === 'minimal') {
    return (
      <Box
        position="relative"
        cursor={onClick ? 'pointer' : 'default'}
        onClick={onClick}
        _hover={onClick ? { opacity: 0.8 } : {}}
      >
        {showIcon && (
          <Box position="relative">
            <BellIcon className="w-5 h-5 text-gray-600" />
            
            {/* Critical alerts indicator */}
            {criticalCount > 0 && (
              <Badge
                position="absolute"
                top="-2"
                right="-2"
                colorPalette="red"
                variant="solid"
                fontSize="xs"
                minWidth="18px"
                height="18px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                animation="pulse 2s infinite"
              >
                {criticalCount}
              </Badge>
            )}

            {/* Non-critical alerts indicator */}
            {criticalCount === 0 && totalCount > 0 && (
              <Badge
                position="absolute"
                top="-2"
                right="-2"
                colorPalette="yellow"
                variant="solid"
                fontSize="xs"
                minWidth="18px"
                height="18px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {totalCount}
              </Badge>
            )}
          </Box>
        )}

        {!showIcon && (
          <Badge
            colorPalette={criticalCount > 0 ? 'red' : 'yellow'}
            variant="solid"
            fontSize="sm"
          >
            {totalCount}
          </Badge>
        )}
      </Box>
    );
  }

  // Detailed variant - full information
  return (
    <HStack
      gap="2"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={onClick ? { opacity: 0.8 } : {}}
      p="1"
      borderRadius="md"
      transition="all 0.2s"
    >
      {showIcon && (
        <Box position="relative">
          {criticalCount > 0 ? (
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
          ) : (
            <BellIcon className="w-5 h-5 text-yellow-500" />
          )}
        </Box>
      )}

      <HStack gap="1">
        {/* Critical alerts */}
        {criticalCount > 0 && (
          <Badge colorPalette="red" variant="solid" size="sm">
            {criticalCount}
          </Badge>
        )}

        {/* Warning alerts */}
        {alertsByUrgency.warning.length > 0 && (
          <Badge colorPalette="yellow" variant="solid" size="sm">
            {alertsByUrgency.warning.length}
          </Badge>
        )}

        {/* Info alerts */}
        {alertsByUrgency.info.length > 0 && (
          <Badge colorPalette="blue" variant="outline" size="sm">
            {alertsByUrgency.info.length}
          </Badge>
        )}

        <Text fontSize="sm" color="gray.600">
          alertas
        </Text>
      </HStack>
    </HStack>
  );
}

// Hook to provide alert status for external components
export function useAlertsStatus() {
  const { 
    loading, 
    getTotalAlertCount, 
    getCriticalAlertCount,
    getAlertsByUrgency 
  } = useStockAlerts();

  const totalCount = getTotalAlertCount();
  const criticalCount = getCriticalAlertCount();
  const alertsByUrgency = getAlertsByUrgency();

  return {
    loading,
    hasAlerts: totalCount > 0,
    hasCriticalAlerts: criticalCount > 0,
    totalCount,
    criticalCount,
    warningCount: alertsByUrgency.warning.length,
    infoCount: alertsByUrgency.info.length,
    statusColor: criticalCount > 0 ? 'red' : totalCount > 0 ? 'yellow' : 'green',
    statusText: criticalCount > 0 
      ? `${criticalCount} críticas`
      : totalCount > 0 
        ? `${totalCount} alertas`
        : 'Sin alertas'
  };
}

// Utility component for quick integration in navigation bars
export function NavAlertsBadge() {
  const { hasCriticalAlerts, totalCount } = useAlertsStatus();

  if (totalCount === 0) return null;

  return (
    <AlertsBadge 
      variant="minimal" 
      showIcon={true}
    />
  );
}

// Utility component for sidebar navigation
export function SidebarAlertsBadge({ onClick }: { onClick?: () => void }) {
  const { totalCount } = useAlertsStatus();

  if (totalCount === 0) return null;

  return (
    <AlertsBadge 
      variant="detailed" 
      showIcon={true}
      onClick={onClick}
    />
  );
}