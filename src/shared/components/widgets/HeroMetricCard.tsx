import {
  Stack,
  Typography,
  CardWrapper,
  Button,
  Badge,
  Icon
} from '@/shared/ui';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface HeroMetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: React.ComponentType<any>;
  iconColor?: string;
  iconBg?: string;
  status?: {
    text: string;
    color: 'gray' | 'brand' | 'success' | 'warning' | 'error' | 'info';
  };
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
  isLoading?: boolean;
}

export function HeroMetricCard({
  title,
  value,
  change,
  icon: IconComponent,
  iconColor,
  iconBg,
  status,
  actions,
  isLoading = false
}: HeroMetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!change) return null;
    
    return change.type === 'increase' ? ArrowTrendingUpIcon : 
           change.type === 'decrease' ? ArrowTrendingDownIcon : null;
  };

  const getTrendColorPalette = () => {
    if (!change) return 'secondary';
    return change.type === 'increase' ? 'success' : 
           change.type === 'decrease' ? 'error' : 'secondary';
  };

  return (
    <CardWrapper>
      <Stack gap="md" align="stretch">
        {/* Header con ícono y título */}
        <Stack direction="row" justify="space-between" align="start">
          <Stack gap="xs" align="start">
            <Stack direction="row" gap="sm" align="center">
              <Icon 
                icon={IconComponent} 
                size="lg" 
                color={iconColor || "theme.500"} 
              />
              <Typography variant="heading" size="lg" weight="semibold" color="text.primary">
                {title}
              </Typography>
            </Stack>
          </Stack>
          
          {status && (
            <Badge 
              colorPalette={status.color} 
              variant="surface"
            >
              {status.text}
            </Badge>
          )}
        </Stack>

        {/* Valor principal */}
        <Stack gap="sm" align="start">
          <Typography 
            variant="heading" 
            size="3xl" 
            weight="bold" 
            color="text.primary"
          >
            {formatValue(value)}
          </Typography>
          
          {/* Cambio/Tendencia */}
          {change && (
            <Stack direction="row" gap="sm" align="center">
              <Stack direction="row" gap="xs" align="center">
                {getTrendIcon() && (
                  <Icon 
                    icon={getTrendIcon()!} 
                    size="sm" 
                    color={`${getTrendColorPalette()}.500`} 
                  />
                )}
                <Typography 
                  variant="body" 
                  size="sm" 
                  weight="medium" 
                  color={getTrendColorPalette()}
                >
                  {change.type === 'increase' ? '+' : change.type === 'decrease' ? '-' : ''}
                  {Math.abs(change.value)}%
                </Typography>
              </Stack>
              <Typography variant="body" size="sm" color="text.secondary">
                vs {change.period}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Acciones */}
        {actions && (
          <Stack direction="row" gap="sm" wrap>
            {actions.primary && (
              <Button
                variant="solid"
                size="sm"
                colorPalette="info"
                onClick={actions.primary.onClick}
              >
                <Stack direction="row" align="center" gap="xs">
                  <Icon icon={EyeIcon} size="xs" />
                  <Typography variant="body" size="xs">{actions.primary.label}</Typography>
                </Stack>
              </Button>
            )}
            {actions.secondary && (
              <Button
                variant="outline"
                size="sm"
                colorPalette="gray"
                onClick={actions.secondary.onClick}
              >
                <Stack direction="row" align="center" gap="xs">
                  <Icon icon={ChartBarIcon} size="xs" />
                  <Typography variant="body" size="xs">{actions.secondary.label}</Typography>
                </Stack>
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </CardWrapper>
  );
}