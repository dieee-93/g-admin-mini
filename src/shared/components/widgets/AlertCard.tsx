import {
  Stack,
  Typography,
  Button,
  Alert,
  Icon
} from '@/shared/ui';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface AlertCardProps {
  title: string;
  description: string;
  status: 'success' | 'warning' | 'error' | 'info';
  actionLabel?: string;
  onAction?: () => void;
  showAlert?: boolean;
}

export function AlertCard({
  title,
  description,
  status,
  actionLabel,
  onAction,
  showAlert = true
}: AlertCardProps) {
  if (!showAlert) return null;

  const getColorPalette = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'success': return 'success';
      default: return 'info';
    }
  };

  return (
    <Alert 
      status={status}
      variant="subtle"
    >
      <Stack gap="sm" align="start">
        <Typography variant="heading" size="sm" weight="semibold" color="primary">
          {title}
        </Typography>
        <Typography variant="body" size="sm" color="secondary">
          {description}
        </Typography>
        {actionLabel && onAction && (
          <Button
            size="sm"
            variant="outline"
            colorPalette={getColorPalette(status)}
            onClick={onAction}
          >
            <Stack direction="row" align="center" gap="xs">
              <Icon icon={ArrowRightIcon} size="xs" />
              <Typography variant="body" size="sm">{actionLabel}</Typography>
            </Stack>
          </Button>
        )}
      </Stack>
    </Alert>
  );
}