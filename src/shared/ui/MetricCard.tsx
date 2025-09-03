import {
  Stack,
  Typography,
  CardWrapper,
  Button,
  Badge,
  Icon
} from '.';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface BaseMetricProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  iconColor?: string;
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink';
  onClick?: () => void;
  badge?: {
    value: string;
    colorPalette: 'gray' | 'green' | 'orange' | 'red' | 'blue';
    variant?: 'solid' | 'subtle' | 'outline' | 'surface';
  };
  isLoading?: boolean;
}

interface SimpleMetricProps extends BaseMetricProps {
  variant?: 'simple';
  additionalInfo?: string;
}

interface HeroMetricProps extends BaseMetricProps {
  variant: 'hero';
  change?: {
    value: number;
    period: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
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
}

type MetricCardProps = SimpleMetricProps | HeroMetricProps;

export function MetricCard(props: MetricCardProps) {
  const {
    title,
    value,
    subtitle,
    icon: IconComponent,
    iconColor,
    colorPalette,
    onClick,
    badge,
    isLoading = false,
    variant = 'simple'
  } = props;

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  // Simple variant (original MetricCard)
  if (variant === 'simple') {
    const { additionalInfo } = props as SimpleMetricProps;
    
    return (
      <CardWrapper 
        variant="elevated"
        colorPalette={colorPalette}
        onClick={onClick}
        cursor={onClick ? "pointer" : "default"}
        _hover={onClick ? { 
          transform: "translateY(-2px)",
          shadow: "lg" 
        } : {}}
        transition="all 0.2s ease"
      >
        <Stack gap="md" align="start">
          <Stack direction="row" justify="space-between" width="full" align="start">
            <Icon 
              icon={IconComponent} 
              size="xl" 
              color={iconColor || "text.muted"}
            />
            {badge && (
              <Badge 
                colorPalette={badge.colorPalette} 
                variant={badge.variant || "subtle"}
                size="sm"
              >
                {badge.value}
              </Badge>
            )}
          </Stack>
          
          <Stack gap="xs" align="start" width="full">
            <Typography 
              variant="heading" 
              size="3xl" 
              weight="bold" 
              color="text.primary"
            >
              {formatValue(value)}
            </Typography>
            
            <Typography 
              variant="body" 
              size="md" 
              color="text.muted"
              weight="medium"
            >
              {title}
            </Typography>
            
            {subtitle && (
              <Typography 
                variant="body" 
                size="sm" 
                color="text.muted"
              >
                {subtitle}
              </Typography>
            )}

            {additionalInfo && (
              <Typography 
                variant="body" 
                size="xs" 
                color="text.muted"
                weight="medium"
              >
                {additionalInfo}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardWrapper>
    );
  }

  // Hero variant (original HeroMetricCard)
  const { change, status, actions } = props as HeroMetricProps;
  
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
    <CardWrapper variant="elevated" colorPalette={colorPalette}>
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